import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ApStorageKeys, ApStorageService } from "@/src/services/storage";
import { useAuthState } from "@/src/modules/auth/context";
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

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeTags = (tags: string[]) =>
  Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
        .filter(Boolean),
    ),
  );

export const useJournalState = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error("useJournalState must be used within the JournalProvider");
  }
  return context;
};

export const JournalProvider: React.FC<IProps> = ({ children }) => {
  const { user } = useAuthState();
  const [allEntries, setAllEntries] = useState<IJournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const persist = async (nextEntries: IJournalEntry[]) => {
    setAllEntries(nextEntries);
    await ApStorageService.setItemAsync(ApStorageKeys.JournalEntries, nextEntries);
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const stored = await ApStorageService.getItemAsync(ApStorageKeys.JournalEntries);
      setAllEntries(Array.isArray(stored) ? stored : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user?.id]);

  const entries = useMemo(
    () =>
      allEntries
        .filter((entry) => entry.userId === user?.id)
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt);
        }),
    [allEntries, user?.id],
  );

  const createEntry = async (input: JournalInput) => {
    if (!user?.id) return;
    const now = new Date().toISOString();
    const entry: IJournalEntry = {
      id: createId(),
      userId: user.id,
      title: input.title.trim() || "Untitled Entry",
      date: input.date,
      mood: input.mood,
      content: input.content,
      tags: normalizeTags(input.tags),
      isFavorite: !!input.isFavorite,
      isPinned: !!input.isPinned,
      templateId: input.templateId,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };
    await persist([entry, ...allEntries]);
    return entry;
  };

  const updateEntry = async (id: string, input: Partial<JournalInput>) => {
    const now = new Date().toISOString();
    await persist(
      allEntries.map((entry) =>
        entry.id === id && entry.userId === user?.id
          ? {
              ...entry,
              ...input,
              title: input.title !== undefined ? input.title.trim() || "Untitled Entry" : entry.title,
              tags: input.tags ? normalizeTags(input.tags) : entry.tags,
              updatedAt: now,
            }
          : entry,
      ),
    );
  };

  const deleteEntry = async (id: string) => {
    await persist(allEntries.filter((entry) => entry.id !== id || entry.userId !== user?.id));
  };

  const toggleFavorite = async (id: string) => {
    await persist(
      allEntries.map((entry) =>
        entry.id === id && entry.userId === user?.id
          ? { ...entry, isFavorite: !entry.isFavorite, updatedAt: new Date().toISOString() }
          : entry,
      ),
    );
  };

  const togglePinned = async (id: string) => {
    await persist(
      allEntries.map((entry) =>
        entry.id === id && entry.userId === user?.id
          ? { ...entry, isPinned: !entry.isPinned, updatedAt: new Date().toISOString() }
          : entry,
      ),
    );
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
