import { BorderRadius, FontSizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { BlockCode as BlockCodeType } from "@/types/lesson";
import { StyleSheet, Text, View } from "react-native";

export default function BlockCode({ block }: { block: BlockCodeType }) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {block.data.language ? (
        <Text style={[styles.langLabel, { color: colors.textTertiary }]}>
          {block.data.language}
        </Text>
      ) : null}
      <Text
        style={[styles.code, { color: colors.textPrimary }]}
        selectable
      >
        {block.data.code}
      </Text>
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
  langLabel: {
    ...Typography.captionSmall,
    marginBottom: Spacing.xs,
  },
  code: {
    fontFamily: Typography.body.fontFamily,
    fontSize: FontSizes.sm,
    lineHeight: FontSizes.sm * 1.4,
  },
});
