import DashboardPreview from "@/components/DashboardPreview";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import TryItYourself from "@/components/TryItYourself";
import { Spacing } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScrollView, StyleSheet, View } from "react-native";

export default function Home() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Navbar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Hero />
        <Features />
        <HowItWorks />
        <TryItYourself />
        <DashboardPreview />
        <View style={styles.content}>
          {/* Additional content sections will go here */}
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1400,
  },
});
