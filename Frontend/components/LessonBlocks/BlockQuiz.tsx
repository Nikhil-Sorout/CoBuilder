import { BorderRadius, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { BlockQuiz as BlockQuizType } from "@/types/lesson";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BlockQuiz({ block }: { block: BlockQuizType }) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { question, options, answerIndex, explanation } = block.data;
  const isCorrect = selectedIndex === answerIndex;
  const hasSelected = selectedIndex !== null;

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.question, { color: colors.textPrimary }]}>{question}</Text>
      <View style={styles.options}>
        {options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.option,
              {
                backgroundColor: colors.input,
                borderColor: selectedIndex === idx ? colors.primary : colors.border,
                borderWidth: selectedIndex === idx ? 2 : 1,
              },
            ]}
            onPress={() => {
              setSelectedIndex(idx);
              if (explanation) setShowExplanation(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
              {opt}
            </Text>
            {hasSelected && selectedIndex === idx && (
              <Text
                style={[
                  styles.result,
                  { color: isCorrect ? colors.success : colors.error },
                ]}
              >
                {isCorrect ? " ✓ Correct" : " ✗ Incorrect"}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {explanation && hasSelected && (
        <TouchableOpacity
          onPress={() => setShowExplanation((e) => !e)}
          style={styles.explanationToggle}
          activeOpacity={0.7}
        >
          <Text style={[styles.explanationToggleText, { color: colors.primary }]}>
            {showExplanation ? "Hide explanation" : "Show explanation"}
          </Text>
        </TouchableOpacity>
      )}
      {explanation && showExplanation && (
        <View style={[styles.explanationBox, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
            {explanation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  question: {
    ...Typography.h5,
    marginBottom: Spacing.sm,
  },
  options: {
    gap: Spacing.sm,
  },
  option: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  optionText: {
    ...Typography.body,
  },
  result: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  explanationToggle: {
    marginTop: Spacing.sm,
  },
  explanationToggleText: {
    ...Typography.button,
    fontSize: 14,
  },
  explanationBox: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  explanationText: {
    ...Typography.bodySmall,
  },
});
