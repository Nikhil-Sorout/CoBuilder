import {
  BorderRadius,
  FontSizes,
  Spacing,
  Typography,
} from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { GeneratedCourse, Lesson as LessonType, Module as ModuleType } from "./types";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from "react-native";
import { useState } from "react";

const EMPTY_EXAMPLES = [
  "Backend development for startups",
  "DSA for coding interviews",
  "React Native from beginner to advanced",
];

const FIRST_TIME_HINT =
  "You can regenerate any module later with custom instructions.";

interface CoursePreviewProps {
  /** Before any generation */
  empty: boolean;
  /** While generating — show progressive modules */
  isGenerating: boolean;
  /** Modules revealed so far (during or after generation) */
  modules: ModuleType[];
  /** Full course once generation finished */
  course: GeneratedCourse | null;
  /** Example prompt click */
  onExampleSelect?: (example: string) => void;
  /** Save course (future: API) */
  onSave?: () => void;
  /** Regenerate entire course */
  onRegenerate?: () => void;
  /** Edit prompt (callback to focus / clear for new generation) */
  onEditPrompt?: () => void;
  /** Navigate to lesson view when user taps "View" (only when generation_status === 'ready') */
  onViewLesson?: (lessonId: string) => void;
}

function LessonRow({
  lesson,
  colors,
  onViewLesson,
}: {
  lesson: LessonType;
  colors: ReturnType<typeof getAppColors>;
  onViewLesson?: (lessonId: string) => void;
}) {
  const status = lesson.generation_status;
  const isReady = status === "ready";
  const isPreparing = status === "pending" || status === "generating";
  const isFailed = status === "failed";

  const handlePress = () => {
    if (isReady && onViewLesson) {
      onViewLesson(lesson.id);
    } else if (isPreparing) {
      Alert.alert("Lesson not ready", "This lesson is still being prepared. Try again in a moment.");
    } else if (isFailed) {
      Alert.alert("Unavailable", "This lesson couldn't be generated.");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.lessonRow, { borderBottomColor: colors.borderLight }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[styles.lessonTitle, { color: colors.textPrimary }]}
        numberOfLines={1}
      >
        · {lesson.title}
      </Text>
      <View style={styles.lessonStatus}>
        {isPreparing && (
          <>
            <ActivityIndicator size="small" color={colors.primary} style={styles.lessonSpinner} />
            <Text style={[styles.lessonStatusText, { color: colors.textTertiary }]}>
              Preparing…
            </Text>
          </>
        )}
        {isReady && (
          <Text style={[styles.lessonViewText, { color: colors.primary }]}>View</Text>
        )}
        {isFailed && (
          <Text style={[styles.lessonStatusText, { color: colors.error }]}>Unavailable</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ExpandableModule({
  module: mod,
  index,
  colors,
  onViewLesson,
}: {
  module: ModuleType;
  index: number;
  colors: ReturnType<typeof getAppColors>;
  onViewLesson?: (lessonId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const lessonCount = mod.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length,
    0
  );

  return (
    <View style={[styles.moduleCard, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={[styles.moduleHeader, { borderColor: colors.border }]}
        onPress={() => setExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <View style={styles.moduleTitleRow}>
          <Text style={[styles.moduleNumber, { color: colors.primary }]}>
            Module {index + 1}
          </Text>
          <Text style={[styles.moduleTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {mod.title}
          </Text>
          <Text style={[styles.moduleChevron, { color: colors.textTertiary }]}>
            {expanded ? "▼" : "▶"}
          </Text>
        </View>
        <Text style={[styles.moduleMeta, { color: colors.textTertiary }]}>
          {mod.chapters.length} chapters · {lessonCount} lessons
        </Text>
      </TouchableOpacity>
      {expanded && (
        <View style={[styles.chaptersContainer, { borderTopColor: colors.border }]}>
          {mod.chapters.map((ch, chIdx) => (
            <View key={ch.id} style={styles.chapterBlock}>
              <Text style={[styles.chapterTitle, { color: colors.textSecondary }]}>
                {chIdx + 1}. {ch.title}
              </Text>
              {ch.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  colors={colors}
                  onViewLesson={onViewLesson}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CoursePreview({
  empty,
  isGenerating,
  modules,
  course,
  onExampleSelect,
  onSave,
  onRegenerate,
  onEditPrompt,
  onViewLesson,
}: CoursePreviewProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  const handleRegenerate = () => {
    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Regenerate the entire course? Your current structure will be replaced."
      );
      if (ok) onRegenerate?.();
    } else {
      Alert.alert(
        "Regenerate course?",
        "Your current structure will be replaced.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Regenerate", onPress: () => onRegenerate?.() },
        ]
      );
    }
  };

  if (empty && !isGenerating) {
    return (
      <View style={[styles.emptyRoot, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          Your course preview
        </Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          Describe your learning goal and we&apos;ll structure it for you.
        </Text>
        <View style={styles.exampleList}>
          {EMPTY_EXAMPLES.map((ex) => (
            <TouchableOpacity
              key={ex}
              onPress={() => onExampleSelect?.(ex)}
              style={[styles.exampleChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.exampleChipText, { color: colors.textPrimary }]}>
                {ex}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.hint, { color: colors.textTertiary }]}>
          {FIRST_TIME_HINT}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.previewRoot, { backgroundColor: colors.surface }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isGenerating && modules.length === 0 && (
          <View style={styles.creatingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.creatingText, { color: colors.textSecondary }]}>
              Creating course structure…
            </Text>
          </View>
        )}

        {modules.length > 0 && (
          <>
            {course && (
              <View style={[styles.courseHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.courseTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                  {course.title}
                </Text>
                <View style={styles.courseMeta}>
                  <Text style={[styles.courseMetaText, { color: colors.textTertiary }]}>
                    {course.modules.length} modules
                    {course.estimatedDuration && ` · ${course.estimatedDuration}`}
                  </Text>
                </View>
              </View>
            )}

            {modules.map((mod, idx) => (
              <ExpandableModule
                key={mod.id}
                module={mod}
                index={idx}
                colors={colors}
                onViewLesson={onViewLesson}
              />
            ))}

            {isGenerating && (
              <View style={styles.creatingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.creatingText, { color: colors.textSecondary }]}>
                  Adding modules…
                </Text>
              </View>
            )}

            {course && !isGenerating && (
              <>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={onSave}
                    style={[styles.primaryAction, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryActionText}>Save Course</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleRegenerate}
                    style={[styles.secondaryAction, { borderColor: colors.border }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.secondaryActionText, { color: colors.textPrimary }]}>
                      Regenerate Entire Course
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onEditPrompt}
                    style={styles.textAction}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.textActionText, { color: colors.primary }]}>
                      Edit Prompt
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.hint, { color: colors.textTertiary }]}>
                  {FIRST_TIME_HINT}
                </Text>
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyRoot: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    minHeight: 280,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  exampleList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  exampleChip: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  exampleChipText: {
    ...Typography.body,
  },
  hint: {
    ...Typography.captionSmall,
  },
  previewRoot: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    minHeight: 320,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  creatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  creatingText: {
    ...Typography.body,
  },
  courseHeader: {
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  courseTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  courseMeta: {
    flexDirection: "row",
  },
  courseMetaText: {
    ...Typography.caption,
  },
  moduleCard: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  moduleHeader: {
    padding: Spacing.md,
    borderBottomWidth: 0,
  },
  moduleTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  moduleNumber: {
    ...Typography.caption,
    minWidth: 56,
  },
  moduleTitle: {
    ...Typography.h5,
    flex: 1,
  },
  moduleChevron: {
    fontSize: FontSizes.sm,
  },
  moduleMeta: {
    ...Typography.captionSmall,
    marginTop: Spacing.xs,
    marginLeft: 56 + Spacing.sm,
  },
  chaptersContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  chapterBlock: {
    gap: 0,
  },
  chapterTitle: {
    ...Typography.label,
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xs,
  },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
    borderBottomWidth: 1,
  },
  lessonTitle: {
    ...Typography.bodySmall,
    fontSize: FontSizes.sm,
    flex: 1,
  },
  lessonStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  lessonSpinner: {
    marginRight: 0,
  },
  lessonStatusText: {
    ...Typography.captionSmall,
  },
  lessonViewText: {
    ...Typography.button,
    fontSize: FontSizes.sm,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryAction: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  primaryActionText: {
    ...Typography.button,
    color: "#fff",
  },
  secondaryAction: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryActionText: {
    ...Typography.button,
  },
  textAction: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  textActionText: {
    ...Typography.button,
  },
});
