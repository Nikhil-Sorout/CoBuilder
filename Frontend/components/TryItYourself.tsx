import { BorderRadius, FontSizes, Shadows, Sizes, Spacing, Typography } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Animated, ActivityIndicator } from "react-native";
import { useState, useEffect, useRef } from "react";

interface TryItYourselfProps{
  setSectionPosition: (section: string, pos: number) => void;
}

const PLACEHOLDER_EXAMPLES = [
  "DSA for FAANG interviews",
  "Machine learning for finance",
  "Learn UI/UX design from scratch",
  "Backend development for startups",
];

// Generic module data that works for any topic
const GENERIC_MODULES = [
  {
    title: "Introduction to Core Concepts",
    description: "Build a strong foundation by understanding the fundamental principles and key concepts that form the basis of this subject.",
  },
  {
    title: "Intermediate Techniques and Practices",
    description: "Dive deeper into practical applications and learn industry-standard techniques that will enhance your skills and knowledge.",
  },
  {
    title: "Advanced Topics and Real-World Applications",
    description: "Explore complex scenarios, solve challenging problems, and apply your knowledge to real-world situations and projects.",
  },
];

export default function TryItYourself({setSectionPosition}: TryItYourselfProps) {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  
  const [prompt, setPrompt] = useState("");
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState(""); // Locked prompt for preview
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  // Animation for placeholder text - only stops when preview is shown and input has text
  useEffect(() => {
    // Stop animation only if preview is shown AND there's text in the input (user is typing)
    if (showPreview && prompt.trim() !== "") return;

    const slideDistance = Platform.select({
      web: -8,
      default: -6,
    });

    const interval = setInterval(() => {
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: slideDistance,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change text
        setCurrentPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);

        // Reset position
        translateAnim.setValue(-slideDistance);

        // Fade in + slide back
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [showPreview, prompt, fadeAnim, translateAnim]);

  const handleGeneratePreview = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setShowPreview(false);
    heightAnim.setValue(0);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    Animated.timing(heightAnim,{
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start()

    // Lock the prompt for preview
    setPreviewPrompt(prompt.trim());
    setIsLoading(false);
    setShowPreview(true);
  };

  return (
    <View
      onLayout={(event) => setSectionPosition("TryItYourself", event.nativeEvent.layout.y)}
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Section Header */}
        <View style={styles.header}>
          <Text
            style={[
              styles.heading,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Try it yourself
          </Text>
          <Text
            style={[
              styles.subheading,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Enter a topic and see how your course is structured
          </Text>
        </View>

        {/* Prompt Input Box */}
        <View style={styles.promptContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.promptInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              value={prompt}
              onChangeText={setPrompt}
              multiline={false}
              autoCapitalize="sentences"
            />
            {!prompt && (
              <Animated.Text
                style={[
                  styles.placeholder,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: translateAnim }],
                    color: colors.placeholder,
                  },
                ]}
              >
                {PLACEHOLDER_EXAMPLES[currentPlaceholderIndex]}
              </Animated.Text>
            )}
          </View>
          
          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleGeneratePreview}
            disabled={!prompt.trim() || isLoading}
            style={[
              styles.generateButton,
              {
                backgroundColor: prompt.trim() && !isLoading ? colors.primary : colors.disabled,
                opacity: prompt.trim() && !isLoading ? 1 : 0.6,
              },
            ]}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text
                style={[
                  styles.generateButtonText,
                  {
                    color: prompt.trim() ? colors.textInverse : colors.disabledText,
                  },
                ]}
              >
                Generate Course Preview
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Preview Output */}
        {showPreview && previewPrompt && (
          <Animated.View
            style={[
              styles.previewContainer,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                height: heightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 542],
                }),
              },
            ]}
          >
            {/* Lock Overlay */}
            <View
              style={[
                styles.lockOverlay,
                {
                  backgroundColor: colorScheme === "dark"
                    ? "rgba(31, 41, 55, 0.9)"
                    : "rgba(255, 255, 255, 0.9)",
                },
              ]}
            >
              <View style={styles.lockContent}>
                <Text style={[styles.lockIcon, { color: colors.textSecondary }]}>🔒</Text>
                <Text
                  style={[
                    styles.lockText,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Sign up to generate the full course
                </Text>
              </View>
            </View>

            {/* Course Preview Content */}
            <View style={styles.previewContent}>
              <Text
                style={[
                  styles.courseTitle,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                {previewPrompt}
              </Text>

              {/* Modules */}
              {GENERIC_MODULES.map((module, index) => (
                <View
                  key={index}
                  style={[
                    styles.moduleCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.moduleTitle,
                      {
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    Module {index + 1}: {module.title}
                  </Text>
                  <Text
                    style={[
                      styles.moduleDescription,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {module.description}
                  </Text>
                  
                  {/* Progress Bar */}
                  <View
                    style={[
                      styles.progressBarContainer,
                      {
                        backgroundColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: "0%",
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}

              {/* Fade at bottom */}
              <View
                style={[
                  styles.fadeOverlay,
                  {
                    backgroundColor: colorScheme === "dark"
                      ? "rgba(55, 65, 81, 0.95)"
                      : "rgba(249, 250, 251, 0.95)",
                  },
                ]}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
    ...Platform.select({
      web: {
        paddingVertical: Spacing["4xl"],
      },
      default: {
        paddingVertical: Spacing["3xl"],
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
  header: {
    alignItems: "center",
    ...Platform.select({
      web: {
        marginBottom: Spacing["3xl"],
      },
      default: {
        marginBottom: Spacing["2xl"],
      },
    }),
  },
  heading: {
    fontFamily: Typography.h2.fontFamily,
    fontWeight: Typography.h2.fontWeight,
    letterSpacing: Typography.h2.letterSpacing,
    marginBottom: Spacing.md,
    textAlign: "center",
    ...Platform.select({
      web: {
        fontSize: Typography.h1.fontSize,
        lineHeight: Typography.h1.lineHeight,
      },
      default: {
        fontSize: Typography.h2.fontSize,
        lineHeight: Typography.h2.lineHeight,
      },
    }),
  },
  subheading: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    letterSpacing: Typography.body.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.6,
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
      default: {
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.6,
      },
    }),
  },
  promptContainer: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.lg,
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.57,
        alignSelf: "center",
      },
      default: {
        width: "100%",
      },
    }),
  },
  inputWrapper: {
    width: "100%",
    position: "relative",
  },
  promptInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    fontFamily: Typography.body.fontFamily,
    ...Platform.select({
      web: {
        fontSize: FontSizes.lg,
        minHeight: 64,
        paddingVertical: Spacing.lg,
        ...Shadows?.md,
      },
      default: {
        fontSize: Typography.body.fontSize,
        minHeight: Sizes.inputHeight.lg,
        paddingVertical: Spacing.md,
        ...Shadows?.sm,
      },
    }),
  },
  placeholder: {
    position: "absolute",
    left: Spacing.lg,
    top: Spacing.lg,
    fontFamily: Typography.body.fontFamily,
    letterSpacing: Typography.body.letterSpacing,
    pointerEvents: "none",
    ...Platform.select({
      web: {
        fontSize: FontSizes.lg,
        lineHeight: FontSizes.lg * 1.5,
        // paddingVertical: Spacing.lg,
      },
      default: {
        fontSize: Typography.body.fontSize,
        lineHeight: Typography.body.fontSize * 1.5,
        // paddingVertical: Spacing.md,
      },
    }),
  },
  generateButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Platform.select({
      web: {
        minHeight: Sizes.buttonHeight.xs,
        minWidth: Sizes.buttonWidth.sm + Spacing.sm,
        ...Shadows?.md,
      },
      default: {
        minHeight: Sizes.buttonHeight.xs,
        width: "100%",
      },
    }),
  },
  generateButtonText: {
    fontFamily: Typography.button.fontFamily,
    fontWeight: "600",
    letterSpacing: Typography.button.letterSpacing,
    textAlign: "center",
    ...Platform.select({
      web: {
        fontSize: FontSizes.md,
      },
      default: {
        fontSize: Typography.button.fontSize,
      },
    }),
  },
  previewContainer: {
    width: "100%",
    marginTop: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    ...Platform.select({
      web: {
        maxWidth: (Sizes.maxContentWidth || 1400) * 0.64,
        alignSelf: "center",
        ...Shadows?.lg,
      },
      default: {
        ...Shadows?.md,
      },
    }),
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lockContent: {
    alignItems: "center",
    gap: Spacing.md,
  },
  lockIcon: {
    ...Platform.select({
      web: {
        fontSize: Sizes.iconSize.lg,
      },
      default: {
        fontSize: Sizes.iconSize.lg,
      },
    }),
  },
  lockText: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: "500",
    letterSpacing: Typography.body.letterSpacing,
    ...Platform.select({
      web: {
        fontSize: FontSizes.base,
      },
      default: {
        fontSize: Typography.body.fontSize,
      },
    }),
  },
  previewContent: {
    ...Platform.select({
      web: {
        padding: Spacing["2xl"],
      },
      default: {
        padding: Spacing.xl,
      },
    }),
  },
  courseTitle: {
    fontFamily: Typography.h3.fontFamily,
    fontWeight: Typography.h3.fontWeight,
    lineHeight: Typography.h3.lineHeight,
    letterSpacing: Typography.h3.letterSpacing,
    marginBottom: Spacing.xl,
    ...Platform.select({
      web: {
        fontSize: FontSizes["2xl"],
      },
      default: {
        fontSize: Typography.h3.fontSize,
      },
    }),
  },
  moduleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Platform.select({
      web: {
        ...Shadows?.sm,
      },
      default: {},
    }),
  },
  moduleTitle: {
    fontFamily: Typography.h4.fontFamily,
    fontWeight: Typography.h4.fontWeight,
    fontSize: Typography.h4.fontSize,
    lineHeight: Typography.h4.lineHeight,
    letterSpacing: Typography.h4.letterSpacing,
    marginBottom: Spacing.sm,
  },
  moduleDescription: {
    fontFamily: Typography.body.fontFamily,
    fontWeight: Typography.body.fontWeight,
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.fontSize * 1.5,
    letterSpacing: Typography.body.letterSpacing,
    marginBottom: Spacing.md,
  },
  progressBarContainer: {
    width: "100%",
    height: Spacing.xs,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  fadeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Spacing["3xl"] + Spacing.md,
  },
});
