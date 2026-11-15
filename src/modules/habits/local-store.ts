import { Platform } from 'react-native';
import type { HabitEvent } from './local-state';

const DATABASE_NAME = 'embermate-habit-events';
const SCHEMA_VERSION = 1;
let lastSequence = 0;
let writeTail: Promise<unknown> = Promise.resolve();

const namespace = (userId: string) => {
  if (!userId) throw new Error('A signed-in account is required for local habit data');
  return encodeURIComponent(userId);
};

const nextKey = () => {
  lastSequence = Math.max(Date.now(), lastSequence + 1);
  return `${String(lastSequence).padStart(16, '0')}-${Math.random().toString(36).slice(2)}`;
};

const openWebDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, SCHEMA_VERSION);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains('events')) request.result.createObjectStore('events');
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Cannot open local habit database'));
});

const readWeb = async (userId: string): Promise<HabitEvent[]> => {
  const db = await openWebDatabase();
  try {
    const prefix = `${namespace(userId)}/`;
    return await new Promise<HabitEvent[]>((resolve, reject) => {
      const transaction = db.transaction('events', 'readonly');
      const request = transaction.objectStore('events').getAll(IDBKeyRange.bound(prefix, `${prefix}\uffff`));
      request.onsuccess = () => {
        try {
          resolve((request.result as Array<{ version: number; event: HabitEvent }>).map((row) => {
            if (row.version !== SCHEMA_VERSION) throw new Error('Unsupported local habit schema');
            return row.event;
          }));
        } catch (error) { reject(error); }
      };
      request.onerror = () => reject(request.error ?? new Error('Cannot read local habit database'));
    });
  } finally { db.close(); }
};

const appendWeb = async (userId: string, key: string, event: HabitEvent): Promise<void> => {
  const db = await openWebDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('events', 'readwrite');
      transaction.objectStore('events').add({ version: SCHEMA_VERSION, event }, `${namespace(userId)}/${key}`);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Cannot save local habit event'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Local habit write was aborted'));
    });
  } finally { db.close(); }
};

const nativeDirectory = async (userId: string) => {
  const { Directory, Paths } = await import('expo-file-system');
  const root = new Directory(Paths.document, 'habit-events-v1');
  root.create({ idempotent: true });
  const account = new Directory(root, namespace(userId));
  account.create({ idempotent: true });
  return account;
};

const readNative = async (userId: string): Promise<HabitEvent[]> => {
  const { File } = await import('expo-file-system');
  const directory = await nativeDirectory(userId);
  const files = directory.list().filter((entry): entry is InstanceType<typeof File> =>
    entry instanceof File && entry.name.endsWith('.json'),
  ).sort((a, b) => a.name.localeCompare(b.name));
  const events: HabitEvent[] = [];
  for (const file of files) {
    const row = JSON.parse(await file.text()) as { version: number; event: HabitEvent };
    if (row.version !== SCHEMA_VERSION) throw new Error('Unsupported local habit schema');
    events.push(row.event);
  }
  return events;
};

const appendNative = async (userId: string, key: string, event: HabitEvent): Promise<void> => {
  const { File } = await import('expo-file-system');
  const directory = await nativeDirectory(userId);
  const temporary = new File(directory, `${key}.tmp`);
  temporary.create();
  temporary.write(JSON.stringify({ version: SCHEMA_VERSION, event }));
  temporary.move(new File(directory, `${key}.json`));
};

export const readHabitEvents = (userId: string): Promise<HabitEvent[]> =>
  Platform.OS === 'web' ? readWeb(userId) : readNative(userId);

/** The event and its pending command are one durable record. */
export const appendHabitEvent = (userId: string, event: HabitEvent): Promise<void> => {
  const run = writeTail.then(() => {
    const key = nextKey();
    return Platform.OS === 'web' ? appendWeb(userId, key, event) : appendNative(userId, key, event);
  });
  writeTail = run.catch(() => undefined);
  return run;
};
