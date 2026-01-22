import { Breakpoints, FontSizes, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

interface FooterProps{
  setSectionPosition: (section: string, pos: number) => void;
  scrollToSection: (section: string) => void;
}

interface FooterLinkProps {
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof getAppColors>;
}

function FooterLink({ label, onPress, colors }: FooterLinkProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.linkText, { color: colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface FooterColumnProps {
  title: string;
  links: Array<{ label: string; onPress: () => void }>;
  colors: ReturnType<typeof getAppColors>;
}

function FooterColumn({ title, links, colors }: FooterColumnProps) {
  return (
    <View style={styles.column}>
      <Text style={[styles.columnTitle, { color: colors.textPrimary }]}>{title}</Text>
      <View style={styles.linksContainer}>
        {links.map((link, index) => (
          <FooterLink key={index} label={link.label} onPress={link.onPress} colors={colors} />
        ))}
      </View>
    </View>
  );
}

export default function Footer({setSectionPosition, scrollToSection}: FooterProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { width } = useWindowDimensions();
  const isDesktop = width >= Breakpoints.lg;

  // Navigation handlers (placeholders for now)
  const handleHowItWorks = () => {
    // TODO: Scroll to "How it Works" section or navigate
    scrollToSection("HowItWorks");
    console.log("How it Works clicked");
  };

  const handlePricing = () => {
    // TODO: Navigate to pricing page or scroll to pricing section
    console.log("Pricing clicked");
  };

  const handleGenerateCourse = () => {
    // TODO: Navigate to course generation  
    scrollToSection("FinalCTA");
    console.log("Generate Course clicked");
  };

  const handleDashboard = () => {
    // TODO: Navigate to dashboard (if logged in)
    scrollToSection("DashboardPreview");
    console.log("Dashboard clicked");
  };

  const handlePrivacyPolicy = () => {
    // TODO: Navigate to privacy policy page
    console.log("Privacy Policy clicked");
  };

  const handleTermsOfService = () => {
    // TODO: Navigate to terms of service page
    console.log("Terms of Service clicked");
  };

  const handleContact = () => {
    // TODO: Navigate to contact/support page
    console.log("Contact clicked");
  };

  const productLinks = [
    { label: "How it Works", onPress: handleHowItWorks },
    // { label: "Pricing", onPress: handlePricing },
    { label: "Generate Course", onPress: handleGenerateCourse },
    { label: "Dashboard", onPress: handleDashboard },
  ];

  const legalLinks = [
    { label: "Privacy Policy", onPress: handlePrivacyPolicy },
    { label: "Terms of Service", onPress: handleTermsOfService },
    { label: "Contact", onPress: handleContact },
  ];

  return (
    <View
      onLayout={(event) => setSectionPosition("footer", event.nativeEvent.layout.y)}
      style={[
        styles.footer,
        {
          // backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.content,
            isDesktop ? styles.contentDesktop : styles.contentMobile,
          ]}
        >
          {/* Column 1: Brand */}
          <View style={styles.column}>
            <Text style={[styles.brandName, { color: colors.textPrimary }]}>
              CoBuilder
            </Text>
            <Text style={[styles.brandDescription, { color: colors.textSecondary }]}>
              Build personalized courses in seconds with AI-powered course generation.
            </Text>
          </View>

          {/* Column 2: Product */}
          <FooterColumn title="Product" links={productLinks} colors={colors} />

          {/* Column 3: Company / Legal */}
          <FooterColumn title="Company" links={legalLinks} colors={colors} />
        </View>

        {/* Footer Bottom (Copyright) */}
        <View
          style={[
            styles.footerBottom,
            {
              borderTopColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.copyright, { color: colors.textTertiary }]}>
            © {new Date().getFullYear()} CoBuilder. All rights reserved.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    borderTopWidth: 1,
    ...Platform.select({
      web: {
        paddingVertical: Spacing["3xl"],
      },
      default: {
        paddingVertical: Spacing["2xl"],
      },
    }),
  },
  container: {
    width: "100%",
    paddingHorizontal: Spacing.lg,
    ...Platform.select({
      web: {
        maxWidth: Sizes.maxContentWidth || 1400,
        alignSelf: "center",
      },
      default: {
        width: "100%",
      },
    }),
  },
  content: {
    flex: 1,
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  contentDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.xl,
  },
  contentMobile: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  column: {
    marginTop: Spacing.sm,
    ...Platform.select({
      web: {  
        minWidth: 0,
        flexBasis: "30%"
      },
      default: {
        width: "100%",
      },
    }),
  },
  brandName: {
    fontFamily: Typography.h3.fontFamily,
    fontWeight: Typography.h3.fontWeight,
    fontSize: Typography.h3.fontSize,
    lineHeight: Typography.h3.lineHeight,
    letterSpacing: Typography.h3.letterSpacing,
    marginBottom: Spacing.sm,
  },
  brandDescription: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.5,
    letterSpacing: Typography.body.letterSpacing,
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.25,
      },
      default: {
        width: "100%",
      },
    }),
  },
  columnTitle: {
    fontFamily: Typography.h5.fontFamily,
    fontWeight: Typography.h5.fontWeight,
    fontSize: Typography.h5.fontSize,
    lineHeight: Typography.h5.lineHeight,
    letterSpacing: Typography.h5.letterSpacing,
    marginBottom: Spacing.md,
  },
  linksContainer: {
    gap: Spacing.sm,
  },
  linkText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.5,
    letterSpacing: Typography.body.letterSpacing,
  },
  footerBottom: {
    width: "100%",
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    alignItems: "center",
  },
  copyright: {
    fontFamily: Typography.caption.fontFamily,
    fontWeight: Typography.caption.fontWeight,
    fontSize: Typography.caption.fontSize,
    lineHeight: Typography.caption.fontSize * 1.4,
    letterSpacing: Typography.caption.letterSpacing,
    textAlign: "center",
  },
});
