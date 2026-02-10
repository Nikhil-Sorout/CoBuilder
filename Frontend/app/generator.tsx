import CoursePreview from "@/components/CourseGenerator/CoursePreview";
import GeneratorInput from "@/components/CourseGenerator/GeneratorInput";
import { apiCourseToGenerated } from "@/components/CourseGenerator/apiMapper";
import type { GeneratedCourse, GeneratorOptions, Module } from "@/components/CourseGenerator/types";
import { Breakpoints, PlatformUtils, Spacing } from "@/constants/layout";
import { getAppColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { generateCourse as apiGenerateCourse } from "@/utils/api";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  ScrollView,
} from "react-native";

const PLACEHOLDER_ROTATE_INDEXES = [0, 1, 2];

/** Default options sent to backend (Beginner, quick, Interview prep) */
const DEFAULT_OPTIONS: GeneratorOptions = {
  skillLevel: "beginner",
  timeCommitment: "short",
  learningGoal: "interview",
};

/** Map frontend options to backend request body (snake_case, backend values) */
function toBackendOptions(opts: GeneratorOptions): {
  skill_level: string;
  time_commitment: string;
  learning_goal: string;
} {
  const skillLevelMap: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  };
  const timeMap: Record<string, string> = {
    short: "quick",
    medium: "medium",
    deep: "deep dive",
  };
  const goalMap: Record<string, string> = {
    interview: "Interview prep",
    practical: "Practical use",
    academic: "Academic",
  };
  return {
    skill_level: skillLevelMap[opts.skillLevel ?? "beginner"] ?? "Beginner",
    time_commitment: timeMap[opts.timeCommitment ?? "short"] ?? "quick",
    learning_goal: goalMap[opts.learningGoal ?? "interview"] ?? "Interview prep",
  };
}

export default function GeneratorScreen() {
  const colorScheme = useColorScheme();
  const colors = getAppColors(colorScheme);
  const { width } = useWindowDimensions();

  const isDesktop = PlatformUtils.isWeb && width >= Breakpoints.md;
  const isMobile = !isDesktop;

  const [topic, setTopic] = useState("");
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_OPTIONS);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const empty = !course && !isGenerating && modules.length === 0;

  const handleExampleSelect = useCallback((example: string) => {
    setTopic(example);
    setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_ROTATE_INDEXES.length);
    setApiError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    const trimmed = topic.trim();
    if (!trimmed || isGenerating) return;

    setApiError(null);
    setIsGenerating(true);
    setCourse(null);
    setModules([]);

    try {
      const backendOptions = toBackendOptions(options);
      const { course: apiCourse } = await apiGenerateCourse(trimmed, backendOptions);
      const mapped = apiCourseToGenerated(apiCourse);
      setCourse(mapped);
      setModules(mapped.modules);
    } catch (e: any) {
      const message = e?.message ?? "Failed to generate course";
      setApiError(message);
      if (Platform.OS === "web") {
        alert(message);
      } else {
        Alert.alert("Generation failed", message);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [topic, options, isGenerating]);

  const handleRegenerate = useCallback(() => {
    if (!topic.trim()) return;
    setApiError(null);
    setIsGenerating(true);
    setCourse(null);
    setModules([]);
    const backendOptions = toBackendOptions(options);
    apiGenerateCourse(topic.trim(), backendOptions)
      .then(({ course: apiCourse }) => {
        const mapped = apiCourseToGenerated(apiCourse);
        setCourse(mapped);
        setModules(mapped.modules);
      })
      .catch((e: any) => {
        const message = e?.message ?? "Failed to regenerate course";
        setApiError(message);
        if (Platform.OS === "web") alert(message);
        else Alert.alert("Regeneration failed", message);
      })
      .finally(() => setIsGenerating(false));
  }, [topic, options]);

  const handleEditPrompt = useCallback(() => {
    // Prompt stays in the input; on mobile we could scroll to top. No-op on desktop.
    if (isMobile) {
      // Optional: scroll to input if we have a ref
    }
  }, [isMobile]);

  const handleSave = useCallback(() => {
    // TODO: wire to API when ready
    if (Platform.OS === "web") {
      alert("Save course — coming soon. Your course is ready to export.");
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Simple top bar: back / home */}
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        {/* <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.backLabel, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity> */}
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
          Course Generator
        </Text>
      </View>

      <View style={isDesktop ? styles.twoPanel : styles.stacked}>
        {/* Left panel (desktop) or top (mobile) — Input */}
        <View
          style={[
            styles.inputPanel,
            isDesktop && styles.inputPanelDesktop,
            { backgroundColor: colors.background },
          ]}
        >
          {isMobile ? (
            <ScrollView
              contentContainerStyle={styles.mobileScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <GeneratorInput
                topic={topic}
                onTopicChange={setTopic}
                options={options}
                onOptionsChange={setOptions}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                placeholderIndex={placeholderIndex}
                errorMessage={apiError}
              />
            </ScrollView>
          ) : (
            <View style={styles.desktopInputWrap}>
              <GeneratorInput
                topic={topic}
                onTopicChange={setTopic}
                options={options}
                onOptionsChange={setOptions}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                placeholderIndex={placeholderIndex}
                errorMessage={apiError}
              />
            </View>
          )}
        </View>

        {/* Right panel (desktop) or below (mobile) — Preview */}
        <View style={styles.previewPanel}>
          <CoursePreview
            empty={empty}
            isGenerating={isGenerating}
            modules={modules}
            course={course}
            onExampleSelect={handleExampleSelect}
            onSave={handleSave}
            onRegenerate={handleRegenerate}
            onEditPrompt={handleEditPrompt}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.md,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  twoPanel: {
    flex: 1,
    flexDirection: "row",
    minHeight: 0,
  },
  stacked: {
    flex: 1,
    minHeight: 0,
  },
  inputPanel: {
    padding: Spacing.lg,
  },
  inputPanelDesktop: {
    flex: 1,
    maxWidth: 480,
    minWidth: 0,
  },
  desktopInputWrap: {
    flex: 1,
  },
  mobileScrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  previewPanel: {
    flex: 1,
    minWidth: 0,
    padding: Spacing.lg,
  },
});
