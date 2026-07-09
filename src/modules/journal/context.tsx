import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ApStorageKeys, ApStorageService } from "@/src/services/storage";
import { ToastService } from "@/src/services";
import { useAuthState } from "@/src/modules/auth/context";
import { JournalService } from "./api";
import { IJournalEntry, JournalMood } from "./model";

interface IProps {
  children: ReactNode;
}

type JournalInput = {
  title: string;
  date: string;
  mood: JournalMood;
  content: string;
  tags: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  templateId?: string;
};

type TJournalContext = {
  entries: IJournalEntry[];
  loading: boolean;
  fetchEntries: () => Promise<void>;
  createEntry: (input: JournalInput) => Promise<IJournalEntry | void>;
  updateEntry: (id: string, input: Partial<JournalInput>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  togglePinned: (id: string) => Promise<void>;
};

const JournalContext = createContext<TJournalContext | undefined>(undefined);

/** Mirrors the server ordering so optimistic updates don't reshuffle the list. */
const sortEntries = (entries: IJournalEntry[]) =>
  [...entries].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt);
  });

export const useJournalState = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error("useJournalState must be used within the JournalProvider");
  }
  return context;
};

export const JournalProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const [entries, setEntries] = useState<IJournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const migratedFor = useRef<string | undefined>(undefined);

  /**
   * Journal entries used to live in on-device storage. Push whatever is still
   * cached for this user up to the server once, then drop it locally. Entries
   * belonging to other accounts on this device are left untouched.
   */
  const migrateLocalEntries = useCallback(async (userId: string) => {
    let stored: unknown;
    try {
      stored = await ApStorageService.getItemAsync(ApStorageKeys.JournalEntries);
    } catch {
      return;
    }
    if (!Array.isArray(stored) || !stored.length) return;

    const mine = (stored as IJournalEntry[]).filter((e) => e.userId === userId);
    const others = (stored as IJournalEntry[]).filter((e) => e.userId !== userId);
    if (!mine.length) return;

    try {
      for (const entry of mine) {
        await JournalService.createEntry({
          title: entry.title,
          date: entry.date,
          mood: entry.mood,
          content: entry.content,
          tags: entry.tags ?? [],
          isFavorite: entry.isFavorite,
          isPinned: entry.isPinned,
          templateId: entry.templateId,
        });
      }
    } catch {
      // Leave the cache intact so the upload can be retried next launch.
      return;
    }

    if (others.length) {
      await ApStorageService.setItemAsync(ApStorageKeys.JournalEntries, others);
    } else {
      await ApStorageService.removeItemAsync(ApStorageKeys.JournalEntries);
    }
    ToastService.Success(`${mine.length} journal ${mine.length === 1 ? "entry" : "entries"} synced`);
  }, []);

  const fetchEntries = useCallback(async () => {
    if (!user?.id) {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      if (migratedFor.current !== user.id) {
        migratedFor.current = user.id;
        await migrateLocalEntries(user.id);
      }
      setEntries(await JournalService.entries());
    } catch (err) {
      ToastService.ApiError(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, migrateLocalEntries]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  /** Applies a server response to local state without refetching the list. */
  const upsert = (entry: IJournalEntry) =>
    setEntries((current) =>
      sortEntries(
        current.some((item) => item.id === entry.id)
          ? current.map((item) => (item.id === entry.id ? entry : item))
          : [entry, ...current],
      ),
    );

  const createEntry = async (input: JournalInput) => {
    if (!user?.id) return;
    try {
      const entry = await JournalService.createEntry(input);
      upsert(entry);
      return entry;
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  const updateEntry = async (id: string, input: Partial<JournalInput>) => {
    try {
      upsert(await JournalService.updateEntry(id, input));
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await JournalService.deleteEntry(id);
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      upsert(await JournalService.toggleFavorite(id));
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  const togglePinned = async (id: string) => {
    try {
      upsert(await JournalService.togglePinned(id));
    } catch (err) {
      ToastService.ApiError(err);
    }
  };

  return (
    <JournalContext.Provider
      value={{
        entries,
        loading,
        fetchEntries,
        createEntry,
        updateEntry,
        deleteEntry,
        toggleFavorite,
        togglePinned,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};
