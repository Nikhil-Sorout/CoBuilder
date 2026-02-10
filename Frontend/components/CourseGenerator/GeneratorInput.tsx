import {
  BorderRadius,
  FontSizes,
  Spacing,
  Typography,
} from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { GeneratorOptions, LearningGoal, SkillLevel, TimeCommitment } from "./types";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";

const PLACEHOLDER_EXAMPLES = [
  "Backend development for startups",
  "DSA for coding interviews",
  "React Native from beginner to advanced",
];

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TIME_OPTIONS: { value: TimeCommitment; label: string }[] = [
  { value: "short", label: "Quick (1–2 weeks)" },
  { value: "medium", label: "Medium (3–6 weeks)" },
  { value: "deep", label: "Deep dive (8+ weeks)" },
];

const GOAL_OPTIONS: { value: LearningGoal; label: string }[] = [
  { value: "interview", label: "Interview prep" },
  { value: "practical", label: "Practical use" },
  { value: "academic", label: "Academic" },
];

interface GeneratorInputProps {
  topic: string;
  onTopicChange: (value: string) => void;
  options: GeneratorOptions;
  onOptionsChange: (options: GeneratorOptions) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  placeholderIndex?: number;
  errorMessage?: string | null;
}

export default function GeneratorInput({
  topic,
  onTopicChange,
  options,
  onOptionsChange,
  onGenerate,
  isGenerating,
  placeholderIndex = 0,
  errorMessage,
}: GeneratorInputProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const [refinementExpanded, setRefinementExpanded] = useState(false);

  const placeholder =
    PLACEHOLDER_EXAMPLES[placeholderIndex % PLACEHOLDER_EXAMPLES.length];

  const canGenerate = topic.trim().length > 0 && !isGenerating;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        What do you want to learn?
      </Text>
      <TextInput
        value={topic}
        onChangeText={onTopicChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={[
          styles.topicInput,
          {
            backgroundColor: colors.input,
            borderColor: topic ? colors.inputFocus : colors.inputBorder,
            color: colors.textPrimary,
          },
        ]}
        editable={!isGenerating}
        multiline
        numberOfLines={Platform.OS === "web" ? 2 : 3}
      />

      {/* Optional refinement — collapsed by default */}
      <TouchableOpacity
        style={[styles.expandRow, { borderBottomColor: colors.border }]}
        onPress={() => setRefinementExpanded((e) => !e)}
        activeOpacity={0.7}
      >
        <Text style={[styles.expandLabel, { color: colors.textSecondary }]}>
          Optional: skill level, time, goal
        </Text>
        <Text style={[styles.expandChevron, { color: colors.textTertiary }]}>
          {refinementExpanded ? "▼" : "▶"}
        </Text>
      </TouchableOpacity>

      {refinementExpanded && (
        <View style={[styles.refinement, { backgroundColor: colors.surface }]}>
          <Text style={[styles.refinementSectionLabel, { color: colors.textSecondary }]}>
            Skill level
          </Text>
          <View style={styles.chipRow}>
            {SKILL_LEVELS.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                onPress={() =>
                  onOptionsChange({ ...options, skillLevel: value })
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      options.skillLevel === value
                        ? colors.primary
                        : colors.surfaceElevated,
                    borderColor:
                      options.skillLevel === value
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        options.skillLevel === value
                          ? colors.textInverse
                          : colors.textPrimary,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.refinementSectionLabel, { color: colors.textSecondary }]}>
            Time commitment
          </Text>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                onPress={() =>
                  onOptionsChange({ ...options, timeCommitment: value })
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      options.timeCommitment === value
                        ? colors.primary
                        : colors.surfaceElevated,
                    borderColor:
                      options.timeCommitment === value
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        options.timeCommitment === value
                          ? colors.textInverse
                          : colors.textPrimary,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.refinementSectionLabel, { color: colors.textSecondary }]}>
            Learning goal
          </Text>
          <View style={styles.chipRow}>
            {GOAL_OPTIONS.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                onPress={() =>
                  onOptionsChange({ ...options, learningGoal: value })
                }
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      options.learningGoal === value
                        ? colors.primary
                        : colors.surfaceElevated,
                    borderColor:
                      options.learningGoal === value
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        options.learningGoal === value
                          ? colors.textInverse
                          : colors.textPrimary,
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {errorMessage ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
      ) : null}
      <TouchableOpacity
        onPress={onGenerate}
        disabled={!canGenerate}
        style={[
          styles.generateButton,
          {
            backgroundColor: canGenerate ? colors.primary : colors.disabled,
            opacity: canGenerate ? 1 : 0.8,
          },
        ]}
        activeOpacity={0.8}
      >
        {isGenerating ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.generateButtonText}>Generating…</Text>
          </View>
        ) : (
          <Text style={styles.generateButtonText}>Generate Course</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: Spacing.md,
  },
  label: {
    ...Typography.label,
    fontSize: FontSizes.md,
  },
  topicInput: {
    ...Typography.body,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 80,
    fontSize: FontSizes.lg,
  },
  expandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  expandLabel: {
    ...Typography.caption,
    fontSize: FontSizes.sm,
  },
  expandChevron: {
    fontSize: FontSizes.sm,
  },
  refinement: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  refinementSectionLabel: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    ...Typography.caption,
  },
  generateButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
    minHeight: 56,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  generateButtonText: {
    ...Typography.button,
    fontSize: FontSizes.lg,
    color: "#fff",
  },
  errorText: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
});
