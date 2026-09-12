import React, { useMemo, useState } from "react";
import {
  Alert,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import {
  Plus,
  Search,
  Heart,
  Bookmark,
  Trash2,
  BookOpen,
  Smile,
  Sparkles,
  Zap,
  Target,
  Sun,
  X,
} from "lucide-react-native";
import { router } from "expo-router";
import { format, isValid, parseISO } from "date-fns";
import {
  ApContainer,
  ApDateField,
  ApEmptyState,
  ApHeader,
  ApScrollView,
  ApText,
  ApCard,
  BottomSheet,
  ListRow,
} from "@/src/components";
import { useTheme } from "@/src/modules/settings/context";
import { useJournalState } from "./context";
import {
  IJournalEntry,
  IJournalTemplate,
  JOURNAL_MOODS,
  JOURNAL_TEMPLATES,
  JournalMood,
} from "./model";
import { toDateKey } from "@/src/utils/date";

const today = () => toDateKey(new Date());

const safeDate = (value: string) => {
  const parsed = parseISO(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parsed) ? value : today();
};

const formatJournalDate = (value: string, pattern: string) => {
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, pattern) : value;
};

const splitTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const EntryFormSheet = ({
  visible,
  entry,
  template,
  onClose,
}: {
  visible: boolean;
  entry?: IJournalEntry | null;
  template?: IJournalTemplate | null;
  onClose: () => void;
}) => {
  const colors = useTheme();
  const { createEntry, updateEntry } = useJournalState();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [mood, setMood] = useState<JournalMood>("reflective");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  React.useEffect(() => {
    if (!visible) return;
    setTitle(entry?.title || template?.title || "");
    setDate(entry?.date || today());
    setMood(entry?.mood || template?.mood || "reflective");
    setContent(entry?.content || template?.prompt || "");
    setTags((entry?.tags || template?.tags || []).join(", "));
    setIsFavorite(!!entry?.isFavorite);
    setIsPinned(!!entry?.isPinned);
  }, [visible, entry, template]);

  const save = async () => {
    const input = {
      title,
      date: safeDate(date),
      mood,
      content,
      tags: splitTags(tags),
      isFavorite,
      isPinned,
      templateId: template?.id,
    };
    if (entry) {
      await updateEntry(entry.id, input);
    } else {
      await createEntry(input);
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="flex-row items-center justify-between mb-4">
        <ApText size="lg" font="semibold" color={colors.textPrimary}>
          {entry ? "Edit Entry" : "New Entry"}
        </ApText>
        <TouchableOpacity
          onPress={save}
          className="px-4 py-1.5 rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <ApText size="xs" font="semibold" color={colors.background}>
            Save
          </ApText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="pb-10">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Entry title"
          placeholderTextColor={colors.textMuted}
          className="rounded-xl border px-3.5 py-3 text-base"
          style={{
            color: colors.textPrimary,
            borderColor: colors.surfaceBorder,
            backgroundColor: colors.surface,
          }}
        />

        <View className="mt-3">
          <ApDateField label="Date" value={date} onChange={setDate} />
        </View>

        <ApText
          size="xs"
          font="medium"
          color={colors.textMuted}
          className="mt-4 mb-2 uppercase"
          style={{ letterSpacing: 0.8 }}
        >
          Mood
        </ApText>
        <View className="flex-row flex-wrap gap-2">
          {JOURNAL_MOODS.map((item) => {
            const selected = item.value === mood;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setMood(item.value)}
                className="flex-row items-center rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface2,
                }}
              >
                <ApText
                  size="xs"
                  font={selected ? "semibold" : "normal"}
                  color={selected ? colors.background : colors.textSecondary}
                >
                  {item.label}
                </ApText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write what is on your mind..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          className="mt-4 min-h-[160px] rounded-xl border px-3.5 py-3 text-sm"
          style={{
            color: colors.textPrimary,
            borderColor: colors.surfaceBorder,
            backgroundColor: colors.surface,
            lineHeight: 20,
          }}
        />

        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="Tags (comma separated)"
          placeholderTextColor={colors.textMuted}
          className="mt-3 rounded-xl border px-3.5 py-3 text-sm"
          style={{
            color: colors.textPrimary,
            borderColor: colors.surfaceBorder,
            backgroundColor: colors.surface,
          }}
        />

        <View className="mt-4 flex-row gap-3">
          <TouchableOpacity
            onPress={() => setIsFavorite((value) => !value)}
            className="flex-1 flex-row items-center justify-center rounded-xl py-3"
            style={{
              backgroundColor: isFavorite ? colors.accentLight : colors.surface2,
            }}
          >
            <Heart
              size={16}
              color={isFavorite ? colors.primary : colors.textMuted}
            />
            <ApText
              size="xs"
              font="medium"
              color={isFavorite ? colors.primary : colors.textSecondary}
              className="ml-1.5"
            >
              Favorite
            </ApText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsPinned((value) => !value)}
            className="flex-1 flex-row items-center justify-center rounded-xl py-3"
            style={{
              backgroundColor: isPinned ? colors.accentLight : colors.surface2,
            }}
          >
            <Bookmark
              size={16}
              color={isPinned ? colors.primary : colors.textMuted}
            />
            <ApText
              size="xs"
              font="medium"
              color={isPinned ? colors.primary : colors.textSecondary}
              className="ml-1.5"
            >
              Pin
            </ApText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const JournalScreen = () => {
  const colors = useTheme();
  const { entries, deleteEntry, toggleFavorite, togglePinned } =
    useJournalState();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editingEntry, setEditingEntry] = useState<IJournalEntry | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<IJournalTemplate | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const availableDates = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.date))).slice(0, 14),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesSearch =
        !term ||
        entry.title.toLowerCase().includes(term) ||
        entry.content.toLowerCase().includes(term) ||
        entry.tags.some((tag) => tag.includes(term));
      const matchesDate = !dateFilter || entry.date === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [entries, search, dateFilter]);

  const openTemplate = (template: IJournalTemplate) => {
    setEditingEntry(null);
    setSelectedTemplate(template);
    setFormVisible(true);
  };

  const openEntry = (entry: IJournalEntry) => {
    setSelectedTemplate(null);
    setEditingEntry(entry);
    setFormVisible(true);
  };

  const confirmDelete = (entry: IJournalEntry) => {
    Alert.alert("Delete entry?", "This journal entry will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteEntry(entry.id),
      },
    ]);
  };

  return (
    <ApContainer>
      <ApHeader
        title="Journal"
        hasBackButton
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)");
          }
        }}
        right={
          <TouchableOpacity
            onPress={() => openTemplate(JOURNAL_TEMPLATES[0])}
            className="w-10 h-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.accentLight }}
          >
            <Plus size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="pt-2 pb-6">
          {/* Search bar */}
          <View
            className="rounded-xl border px-3.5 py-2.5 flex-row items-center mb-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <Search size={16} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search entries, moods, or tags"
              placeholderTextColor={colors.textMuted}
              className="ml-2 flex-1 p-0 text-sm"
              style={{ color: colors.textPrimary }}
            />
          </View>

          {/* Date Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <TouchableOpacity
              onPress={() => setDateFilter("")}
              className="mr-2 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: !dateFilter ? colors.primary : colors.surface2,
              }}
            >
              <ApText
                size="xs"
                font={!dateFilter ? "semibold" : "normal"}
                color={!dateFilter ? colors.background : colors.textMuted}
              >
                All dates
              </ApText>
            </TouchableOpacity>
            {availableDates.map((date) => (
              <TouchableOpacity
                key={date}
                onPress={() => setDateFilter(date)}
                className="mr-2 rounded-full px-3 py-1.5"
                style={{
                  backgroundColor:
                    dateFilter === date ? colors.primary : colors.surface2,
                }}
              >
                <ApText
                  size="xs"
                  font={dateFilter === date ? "semibold" : "normal"}
                  color={
                    dateFilter === date
                      ? colors.background
                      : colors.textMuted
                  }
                >
                  {formatJournalDate(date, "MMM d")}
                </ApText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Templates Section */}
          <View className="mb-2">
            <ApText
              size="xs"
              font="medium"
              color={colors.textMuted}
              className="uppercase"
              style={{ letterSpacing: 0.8 }}
            >
              Templates
            </ApText>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {JOURNAL_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => openTemplate(template)}
                className="mr-3 w-40 rounded-xl border p-3"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <ApText
                  size="sm"
                  font="semibold"
                  color={colors.textPrimary}
                  numberOfLines={1}
                >
                  {template.title}
                </ApText>
                <ApText
                  size="xs"
                  color={colors.textMuted}
                  className="mt-1"
                  numberOfLines={2}
                >
                  {template.description}
                </ApText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Entries Section */}
          <View className="mb-3 flex-row items-center justify-between">
            <ApText
              size="xs"
              font="medium"
              color={colors.textMuted}
              className="uppercase"
              style={{ letterSpacing: 0.8 }}
            >
              Entries
            </ApText>
            <ApText size="xs" color={colors.textMuted}>
              {filteredEntries.length} total
            </ApText>
          </View>

          {filteredEntries.length === 0 ? (
            <ApEmptyState
              title="No journal entries"
              subtitle="Choose a template or create a blank entry to begin."
              actionLabel="New Entry"
              onAction={() => openTemplate(JOURNAL_TEMPLATES[0])}
            />
          ) : (
            filteredEntries.map((entry) => {
              const mood = JOURNAL_MOODS.find(
                (item) => item.value === entry.mood,
              );
              return (
                <ApCard key={entry.id} className="p-4 mb-3">
                  <TouchableOpacity
                    onPress={() => openEntry(entry)}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1 mr-2">
                        <ApText
                          size="base"
                          font="semibold"
                          color={colors.textPrimary}
                          numberOfLines={1}
                        >
                          {entry.title}
                        </ApText>
                        <ApText size="xs" color={colors.textMuted} className="mt-0.5">
                          {formatJournalDate(entry.date, "EEEE, MMM d")} · {mood?.label || entry.mood}
                        </ApText>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                          onPress={() => toggleFavorite(entry.id)}
                          hitSlop={8}
                        >
                          <Heart
                            size={16}
                            color={entry.isFavorite ? colors.primary : colors.textMuted}
                            fill={entry.isFavorite ? colors.primary : "transparent"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => togglePinned(entry.id)}
                          hitSlop={8}
                        >
                          <Bookmark
                            size={16}
                            color={entry.isPinned ? colors.primary : colors.textMuted}
                            fill={entry.isPinned ? colors.primary : "transparent"}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <ApText
                      size="sm"
                      color={colors.textSecondary}
                      numberOfLines={3}
                      className="mb-3"
                    >
                      {entry.content || "No content yet."}
                    </ApText>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row flex-wrap flex-1 gap-1">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <View
                            key={tag}
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: colors.surface2 }}
                          >
                            <ApText size="xs" color={colors.textMuted}>
                              #{tag}
                            </ApText>
                          </View>
                        ))}
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmDelete(entry)}
                        hitSlop={8}
                      >
                        <Trash2 size={15} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </ApCard>
              );
            })
          )}
        </View>
      </ApScrollView>

      <EntryFormSheet
        visible={formVisible}
        entry={editingEntry}
        template={selectedTemplate}
        onClose={() => setFormVisible(false)}
      />
    </ApContainer>
  );
};

export default JournalScreen;
