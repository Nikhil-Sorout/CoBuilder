import { useEffect, useRef, useState } from "react";
import { View, TextInput, Animated, StyleSheet } from "react-native";

const placeholders = [
  "Search restaurants",
  "Search coffee shops",
  "Search bakeries",
];

export default function AnimatedPlaceholderInput() {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: -6,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change text
        setIndex((prev) => (prev + 1) % placeholders.length);

        // Reset position
        translateAnim.setValue(6);

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
  }, []);

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} />

      <Animated.Text
        pointerEvents="none"
        style={[
          styles.placeholder,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        {placeholders[index]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  placeholder: {
    position: "absolute",
    left: 12,
    top: 14,
    color: "#999",
  },
});
