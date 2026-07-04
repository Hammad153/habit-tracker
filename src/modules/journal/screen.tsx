import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isValid, parseISO } from "date-fns";
import {
  ApContainer,
  ApEmptyState,
  ApHeader,
  ApScrollView,
  ApText,
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

const today = () => new Date().toISOString().split("T")[0];

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

const EntryForm = ({
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ApContainer>
        <ApHeader
          title={entry ? "Edit Entry" : "New Entry"}
          hasBackButton
          onBack={onClose}
          right={
            <TouchableOpacity onPress={save} hitSlop={10}>
              <ApText size="sm" font="bold" color={colors.primary}>
                Save
              </ApText>
            </TouchableOpacity>
          }
        />
        <ApScrollView showsVerticalScrollIndicator={false}>
          <View className="px-5 pt-5 pb-28">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Entry title"
              placeholderTextColor={colors.textMuted}
              className="rounded-2xl border px-4 py-4 text-lg"
              style={{
                color: colors.textPrimary,
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.surface,
              }}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              className="mt-3 rounded-2xl border px-4 py-4"
              style={{
                color: colors.textPrimary,
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.surface,
              }}
            />

            <ApText size="xs" font="bold" color={colors.textMuted} className="mt-6 mb-3 uppercase">
              Mood
            </ApText>
            <View className="flex-row flex-wrap">
              {JOURNAL_MOODS.map((item) => {
                const selected = item.value === mood;
                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => setMood(item.value)}
                    className="mr-2 mb-2 flex-row items-center rounded-full border px-3 py-2"
                    style={{
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderColor: selected ? colors.primary : colors.surfaceBorder,
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={15}
                      color={selected ? colors.background : colors.primary}
                    />
                    <ApText
                      size="xs"
                      font="semibold"
                      color={selected ? colors.background : colors.textSecondary}
                      className="ml-1.5"
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
              className="mt-4 min-h-[260px] rounded-2xl border px-4 py-4 text-base"
              style={{
                color: colors.textPrimary,
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.surface,
                lineHeight: 24,
              }}
            />
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="tags, separated, by commas"
              placeholderTextColor={colors.textMuted}
              className="mt-3 rounded-2xl border px-4 py-4"
              style={{
                color: colors.textPrimary,
                borderColor: colors.surfaceBorder,
                backgroundColor: colors.surface,
              }}
            />
            <View className="mt-4 flex-row">
              <TouchableOpacity
                onPress={() => setIsFavorite((value) => !value)}
                className="mr-3 flex-row items-center rounded-full border px-4 py-3"
                style={{
                  borderColor: colors.surfaceBorder,
                  backgroundColor: isFavorite ? colors.warning + "18" : colors.surface,
                }}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={18}
                  color={isFavorite ? colors.warning : colors.textMuted}
                />
                <ApText size="sm" color={colors.textSecondary} className="ml-2">
                  Favorite
                </ApText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsPinned((value) => !value)}
                className="flex-row items-center rounded-full border px-4 py-3"
                style={{
                  borderColor: colors.surfaceBorder,
                  backgroundColor: isPinned ? colors.primary + "18" : colors.surface,
                }}
              >
                <Ionicons
                  name={isPinned ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={isPinned ? colors.primary : colors.textMuted}
                />
                <ApText size="sm" color={colors.textSecondary} className="ml-2">
                  Pin
                </ApText>
              </TouchableOpacity>
            </View>
          </View>
        </ApScrollView>
      </ApContainer>
    </Modal>
  );
};

const JournalScreen = () => {
  const colors = useTheme();
  const { entries, deleteEntry, toggleFavorite, togglePinned } =
    useJournalState();
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editingEntry, setEditingEntry] = useState<IJournalEntry | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<IJournalTemplate | null>(null);
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
      { text: "Delete", style: "destructive", onPress: () => deleteEntry(entry.id) },
    ]);
  };

  return (
    <ApContainer>
      <ApHeader
        title="Journal"
        right={
          <TouchableOpacity onPress={() => openTemplate(JOURNAL_TEMPLATES[0])}>
            <Ionicons name="add-circle" size={30} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      <ApScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-5 pb-28">
          <View
            className="rounded-2xl border px-4 py-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.surfaceBorder,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search entries, moods, or tags"
                placeholderTextColor={colors.textMuted}
                className="ml-2 flex-1 p-0"
                style={{ color: colors.textPrimary }}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
            <TouchableOpacity
              onPress={() => setDateFilter("")}
              className="mr-2 rounded-full border px-4 py-2"
              style={{
                backgroundColor: !dateFilter ? colors.primary : colors.surface,
                borderColor: !dateFilter ? colors.primary : colors.surfaceBorder,
              }}
            >
              <ApText
                size="xs"
                font="semibold"
                color={!dateFilter ? colors.background : colors.textSecondary}
              >
                All dates
              </ApText>
            </TouchableOpacity>
            {availableDates.map((date) => (
              <TouchableOpacity
                key={date}
                onPress={() => setDateFilter(date)}
                className="mr-2 rounded-full border px-4 py-2"
                style={{
                  backgroundColor: dateFilter === date ? colors.primary : colors.surface,
                  borderColor: dateFilter === date ? colors.primary : colors.surfaceBorder,
                }}
              >
                <ApText
                  size="xs"
                  font="semibold"
                  color={dateFilter === date ? colors.background : colors.textSecondary}
                >
                  {formatJournalDate(date, "MMM d")}
                </ApText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ApText size="xs" font="bold" color={colors.textMuted} className="mt-7 mb-3 uppercase">
            Templates
          </ApText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {JOURNAL_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                onPress={() => openTemplate(template)}
                className="mr-3 w-48 rounded-2xl border p-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.surfaceBorder,
                }}
              >
                <ApText size="base" font="bold" color={colors.textPrimary}>
                  {template.title}
                </ApText>
                <ApText size="xs" color={colors.textMuted} className="mt-2">
                  {template.description}
                </ApText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="mt-7">
            <View className="mb-3 flex-row items-center justify-between">
              <ApText size="xs" font="bold" color={colors.textMuted} className="uppercase">
                Entries
              </ApText>
              <ApText size="xs" color={colors.textMuted}>
                {filteredEntries.length} total
              </ApText>
            </View>

            {filteredEntries.length === 0 ? (
              <ApEmptyState
                icon="journal-outline"
                title="No journal entries"
                subtitle="Choose a template or create a blank entry to begin."
                actionLabel="New Entry"
                onAction={() => openTemplate(JOURNAL_TEMPLATES[0])}
              />
            ) : (
              filteredEntries.map((entry) => {
                const mood = JOURNAL_MOODS.find((item) => item.value === entry.mood);
                return (
                  <TouchableOpacity
                    key={entry.id}
                    onPress={() => openEntry(entry)}
                    activeOpacity={0.85}
                    className="mb-3 rounded-2xl border p-4"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: entry.isPinned ? colors.primary + "66" : colors.surfaceBorder,
                    }}
                  >
                    <View className="flex-row items-start">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: colors.primary + "16" }}
                      >
                        <Ionicons
                          name={(mood?.icon || "journal-outline") as any}
                          size={22}
                          color={colors.primary}
                        />
                      </View>
                      <View className="ml-3 flex-1">
                        <View className="flex-row items-center">
                          <ApText
                            size="base"
                            font="bold"
                            color={colors.textPrimary}
                            className="flex-1"
                            numberOfLines={1}
                          >
                            {entry.title}
                          </ApText>
                          <TouchableOpacity onPress={() => toggleFavorite(entry.id)} hitSlop={8}>
                            <Ionicons
                              name={entry.isFavorite ? "heart" : "heart-outline"}
                              size={19}
                              color={entry.isFavorite ? colors.warning : colors.textMuted}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => togglePinned(entry.id)} hitSlop={8} className="ml-3">
                            <Ionicons
                              name={entry.isPinned ? "bookmark" : "bookmark-outline"}
                              size={18}
                              color={entry.isPinned ? colors.primary : colors.textMuted}
                            />
                          </TouchableOpacity>
                        </View>
                        <ApText size="xs" color={colors.textMuted} className="mt-1">
                          {formatJournalDate(entry.date, "EEEE, MMM d")} / {mood?.label || entry.mood}
                        </ApText>
                        <ApText
                          size="sm"
                          color={colors.textSecondary}
                          className="mt-3"
                          numberOfLines={3}
                        >
                          {entry.content || "No content yet."}
                        </ApText>
                        <View className="mt-3 flex-row items-center justify-between">
                          <View className="flex-row flex-wrap flex-1">
                            {entry.tags.slice(0, 3).map((tag) => (
                              <View
                                key={tag}
                                className="mr-2 mt-1 rounded-full px-2 py-1"
                                style={{ backgroundColor: colors.background }}
                              >
                                <ApText size="xs" color={colors.textMuted}>
                                  #{tag}
                                </ApText>
                              </View>
                            ))}
                          </View>
                          <TouchableOpacity onPress={() => confirmDelete(entry)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ApScrollView>
      <EntryForm
        visible={formVisible}
        entry={editingEntry}
        template={selectedTemplate}
        onClose={() => setFormVisible(false)}
      />
    </ApContainer>
  );
};

export default JournalScreen;
