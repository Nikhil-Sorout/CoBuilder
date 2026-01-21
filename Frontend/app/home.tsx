import { BorderRadius, PlatformUtils, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Home() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Welcome Home
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              You&apos;ve successfully signed in!
            </Text>
          </View>

          {/* Content */}
          <View style={styles.body}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Getting Started
              </Text>
              <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                This is your home screen. You can start building your application from here.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: PlatformUtils.safeAreaTop + Spacing.lg,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
  },
  header: {
    marginBottom: Spacing['3xl'],
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
  },
  body: {
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  cardText: {
    ...Typography.body,
  },
});
