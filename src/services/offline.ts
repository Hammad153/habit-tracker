import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApStorageKeys, ApStorageService } from "./storage";

type OfflineRequestConfig = InternalAxiosRequestConfig & {
  __skipOfflineQueue?: boolean;
};

type CachedResponse = {
  data: unknown;
  cachedAt: string;
};

export type OfflineMutation = {
  id: string;
  method: string;
  url: string;
  data?: unknown;
  params?: unknown;
  createdAt: string;
};

export type OfflineQueuedPayload = {
  __offlineQueued: true;
  offlineQueueId: string;
};

const MUTATION_METHODS = new Set(["post", "put", "patch", "delete"]);
const TRANSIENT_ERROR_CODES = new Set([
  "ERR_NETWORK",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "ECONNREFUSED",
]);

const readRecord = async <T,>(key: ApStorageKeys): Promise<Record<string, T>> => {
  const value = await ApStorageService.getItemAsync(key);
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, T>)
    : {};
};

const readQueue = async (): Promise<OfflineMutation[]> => {
  const value = await ApStorageService.getItemAsync(ApStorageKeys.OfflineMutationQueue);
  return Array.isArray(value) ? (value as OfflineMutation[]) : [];
};

const writeQueue = (queue: OfflineMutation[]) =>
  ApStorageService.setItemAsync(ApStorageKeys.OfflineMutationQueue, queue);

const stableStringify = (value: unknown): string => {
  if (!value || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
    .join(",")}}`;
};

const requestMethod = (config: AxiosRequestConfig) =>
  (config.method ?? "get").toLowerCase();

const isAuthRequest = (url?: string) => {
  if (!url) return false;
  try {
    return new URL(url).pathname.startsWith("/auth/");
  } catch {
    return url.startsWith("/auth/") || url.includes("/auth/");
  }
};

export const requestCacheKey = (config: AxiosRequestConfig) => {
  const baseURL = config.baseURL ?? "";
  const url = config.url ?? "";
  const params = stableStringify(config.params);
  return `${requestMethod(config).toUpperCase()} ${baseURL}${url}?${params}`;
};

export const isOfflineQueuedPayload = (
  data: unknown,
): data is OfflineQueuedPayload =>
  !!data && typeof data === "object" && (data as OfflineQueuedPayload).__offlineQueued === true;

export const isLikelyOfflineError = (error: AxiosError) => {
  if (error.response) return false;
  const message = `${error.message ?? ""}`.toLowerCase();
  return (
    TRANSIENT_ERROR_CODES.has(error.code ?? "") ||
    message.includes("network error") ||
    message.includes("network request failed") ||
    message.includes("timeout")
  );
};

export const cacheGetResponse = async (response: AxiosResponse) => {
  if (requestMethod(response.config) !== "get") return;

  try {
    const cache = await readRecord<CachedResponse>(ApStorageKeys.OfflineRequestCache);
    cache[requestCacheKey(response.config)] = {
      data: response.data,
      cachedAt: new Date().toISOString(),
    };
    await ApStorageService.setItemAsync(ApStorageKeys.OfflineRequestCache, cache);
  } catch {
    // Offline cache is best-effort; network responses should never fail because
    // local storage rejected a large payload.
  }
};

export const getCachedResponse = async (config: InternalAxiosRequestConfig) => {
  if (requestMethod(config) !== "get") return null;

  const cache = await readRecord<CachedResponse>(ApStorageKeys.OfflineRequestCache);
  const cached = cache[requestCacheKey(config)];
  if (!cached) return null;

  return {
    data: cached.data,
    status: 200,
    statusText: "OK (offline cache)",
    headers: {},
    config,
  } as AxiosResponse;
};

export const enqueueOfflineMutation = async (config: OfflineRequestConfig) => {
  const method = requestMethod(config);
  if (
    !MUTATION_METHODS.has(method) ||
    !config.url ||
    config.__skipOfflineQueue ||
    isAuthRequest(config.url)
  ) {
    return null;
  }

  const mutation: OfflineMutation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    method,
    url: config.url,
    data: config.data,
    params: config.params,
    createdAt: new Date().toISOString(),
  };

  try {
    const queue = await readQueue();
    await writeQueue([...queue, mutation]);
    return mutation;
  } catch {
    return null;
  }
};

export const makeQueuedResponse = (
  config: InternalAxiosRequestConfig,
  mutation: OfflineMutation,
) =>
  ({
    data: {
      __offlineQueued: true,
      offlineQueueId: mutation.id,
    } satisfies OfflineQueuedPayload,
    status: 202,
    statusText: "Accepted (queued offline)",
    headers: {},
    config,
  }) as AxiosResponse<OfflineQueuedPayload>;

let flushPromise: Promise<void> | null = null;

export const flushOfflineMutations = (client: AxiosInstance) => {
  if (flushPromise) return flushPromise;

  flushPromise = (async () => {
    const queue = await readQueue();
    if (!queue.length) return;

    const remaining = [...queue];
    for (const mutation of queue) {
      try {
        await client.request({
          method: mutation.method,
          url: mutation.url,
          data: mutation.data,
          params: mutation.params,
          __skipOfflineQueue: true,
        } as OfflineRequestConfig);
        remaining.shift();
        await writeQueue(remaining);
      } catch (error: any) {
        if (isLikelyOfflineError(error)) break;
        remaining.shift();
        await writeQueue(remaining);
      }
    }
  })().finally(() => {
    flushPromise = null;
  });

  return flushPromise;
};
