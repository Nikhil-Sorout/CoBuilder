import { Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { BlockParagraph as BlockParagraphType } from "@/types/lesson";
import { StyleSheet, Text, View } from "react-native";

export default function BlockParagraph({ block }: { block: BlockParagraphType }) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>
        {block.data.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  text: {
    ...Typography.body,
    lineHeight: Typography.body.fontSize! * 1.5,
  },
});
