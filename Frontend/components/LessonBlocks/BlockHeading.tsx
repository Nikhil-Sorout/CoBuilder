import { FontSizes, Spacing } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { BlockHeading as BlockHeadingType } from "@/types/lesson";
import { StyleSheet, Text, View } from "react-native";

const LEVEL_TO_FONT = {
  1: FontSizes["3xl"],
  2: FontSizes["2xl"],
  3: FontSizes.xl,
  4: FontSizes.lg,
  5: FontSizes.md,
  6: FontSizes.base,
} as const;

export default function BlockHeading({ block }: { block: BlockHeadingType }) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const level = Math.min(6, Math.max(1, block.data.level));
  const fontSize = LEVEL_TO_FONT[level as keyof typeof LEVEL_TO_FONT] ?? FontSizes.lg;

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.heading,
          { color: colors.textPrimary, fontSize },
        ]}
      >
        {block.data.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heading: {
    fontWeight: "700",
  },
});
