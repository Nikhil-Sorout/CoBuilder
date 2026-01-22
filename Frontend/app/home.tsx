import AudienceTypes from "@/components/AudienceTypes";
import DashboardPreview from "@/components/DashboardPreview";
import Features from "@/components/Features";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import RegenerationFeature from "@/components/RegenerationFeature";
import SocialProof from "@/components/SocialProof";
import TryItYourself from "@/components/TryItYourself";
import { Spacing } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRef, useCallback } from "react";

export default function Home() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({})

  // Memoize section position setter
  const setSectionPosition = useCallback((section: string, pos: number): void => {
    sectionPositions.current[section] = pos;
  },[sectionPositions]);

  // Memoize scroll to section
  const scrollToSection = useCallback((section: string): void =>{
    if(scrollRef.current && sectionPositions.current[section] !== undefined){
      scrollRef.current.scrollTo({
        y: sectionPositions.current[section],
        animated: true,
      });
    }
  }, [sectionPositions])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Navbar scrollToSection={scrollToSection}/>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Hero setSectionPosition={setSectionPosition} scrollToSection={scrollToSection}/>
        <Features setSectionPosition={setSectionPosition}/>
        <HowItWorks setSectionPosition={setSectionPosition}/>
        <TryItYourself setSectionPosition={setSectionPosition}/>
        <DashboardPreview setSectionPosition={setSectionPosition}/>
        <RegenerationFeature setSectionPosition={setSectionPosition}/>
        <AudienceTypes setSectionPosition={setSectionPosition}/>
        <SocialProof setSectionPosition={setSectionPosition}/>
        <FinalCTA setSectionPosition={setSectionPosition}/>
        <Footer setSectionPosition={setSectionPosition} scrollToSection={scrollToSection}/>
        {/* <View style={styles.content}> */}
        {/* Additional content sections will go here */}
        {/* </View> */}
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
