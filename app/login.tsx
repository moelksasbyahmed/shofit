import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (!success) {
      Alert.alert("Login Failed", "Invalid email or password");
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(email, name, password);
      setIsLoading(false);

      if (!success) {
        Alert.alert(
          "Signup Failed",
          "Email already exists or an error occurred",
        );
      }
    } catch {
      setIsLoading(false);
      Alert.alert("Signup Failed", "An error occurred during signup");
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Header */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={COLORS.gradients.primary as [string, string, string]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="shirt" size={48} color="#fff" />
              </LinearGradient>
            </View>
            <ThemedText style={styles.appName}>SHOFIT</ThemedText>
            <ThemedText style={styles.tagline}>
              AI Virtual Fitting Room
            </ThemedText>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.formContainer}
          >
            <ThemedText style={styles.formTitle}>
              {isSignup ? "Create Account" : "Welcome Back"}
            </ThemedText>
            <ThemedText style={styles.formSubtitle}>
              {isSignup
                ? "Sign up to get started with AI fitting"
                : "Sign in to continue shopping"}
            </ThemedText>

            {/* Name Input (Signup only) */}
            {isSignup && (
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={styles.inputGroup}
              >
                <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.gray[500]}
                  />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.gray[400]}
                    autoCapitalize="words"
                  />
                </View>
              </Animated.View>
            )}

            {/* Email Input */}
            <Animated.View
              entering={FadeInDown.delay(isSignup ? 400 : 300)}
              style={styles.inputGroup}
            >
              <ThemedText style={styles.inputLabel}>Email</ThemedText>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.gray[500]}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              entering={FadeInDown.delay(isSignup ? 500 : 400)}
              style={styles.inputGroup}
            >
              <ThemedText style={styles.inputLabel}>Password</ThemedText>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={COLORS.gray[500]}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.gray[400]}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={COLORS.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Confirm Password (Signup only) */}
            {isSignup && (
              <Animated.View
                entering={FadeInDown.delay(600)}
                style={styles.inputGroup}
              >
                <ThemedText style={styles.inputLabel}>
                  Confirm Password
                </ThemedText>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.gray[500]}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={COLORS.gray[400]}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </Animated.View>
            )}

            {/* Forgot Password (Login only) */}
            {!isSignup && (
              <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText style={styles.forgotPasswordText}>
                  Forgot Password?
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <Animated.View entering={FadeInDown.delay(isSignup ? 700 : 500)}>
              <TouchableOpacity
                onPress={isSignup ? handleSignup : handleLogin}
                disabled={isLoading}
                style={styles.submitButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={COLORS.gradients.primary as [string, string, string]}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <ThemedText style={styles.submitText}>
                      {isSignup ? "Creating Account..." : "Signing In..."}
                    </ThemedText>
                  ) : (
                    <>
                      <ThemedText style={styles.submitText}>
                        {isSignup ? "Sign Up" : "Sign In"}
                      </ThemedText>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Toggle Mode */}
            <Animated.View
              entering={FadeInDown.delay(isSignup ? 800 : 600)}
              style={styles.toggleContainer}
            >
              <ThemedText style={styles.toggleText}>
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </ThemedText>
              <TouchableOpacity onPress={toggleMode}>
                <ThemedText style={styles.toggleLink}>
                  {isSignup ? "Sign In" : "Sign Up"}
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Features */}
          <Animated.View
            entering={FadeInDown.delay(isSignup ? 900 : 700)}
            style={styles.featuresContainer}
          >
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="camera" size={24} color={COLORS.primary} />
              </View>
              <ThemedText style={styles.featureText}>
                AI Virtual Fitting
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="body" size={24} color={COLORS.primary} />
              </View>
              <ThemedText style={styles.featureText}>
                Body Measurements
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name="cart" size={24} color={COLORS.primary} />
              </View>
              <ThemedText style={styles.featureText}>Easy Shopping</ThemedText>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xl + 20,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.md,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  formTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md,
    height: 56,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: "#000",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: BORDER_RADIUS.full,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    paddingHorizontal: SPACING.lg,
  },
  submitText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: "#fff",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.xs,
  },
  toggleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
  },
  toggleLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "700",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: SPACING.xl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  featureItem: {
    alignItems: "center",
    gap: SPACING.sm,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[600],
    textAlign: "center",
  },
});
