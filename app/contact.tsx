import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/constants/design";

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    // Submit logic
    alert("Message sent! We'll get back to you soon.");
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Contact Us</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(100)}>
            <ThemedText style={styles.title}>Get in Touch</ThemedText>
            <ThemedText style={styles.subtitle}>
              Have a question or feedback? We&apos;d love to hear from you!
            </ThemedText>
          </Animated.View>

          {/* Contact Methods */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.contactMethods}
          >
            <TouchableOpacity style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>Email</ThemedText>
                <ThemedText style={styles.contactValue}>
                  support@shofit.com
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.gray[400]}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={24} color={COLORS.success} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>Phone</ThemedText>
                <ThemedText style={styles.contactValue}>
                  +1 (555) 123-4567
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.gray[400]}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Ionicons name="location" size={24} color={COLORS.error} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>Address</ThemedText>
                <ThemedText style={styles.contactValue}>
                  123 Fashion Ave, New York, NY 10001
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.gray[400]}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Contact Form */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <ThemedText style={styles.formTitle}>Send us a Message</ThemedText>

            <View style={styles.form}>
              <View style={styles.formField}>
                <ThemedText style={styles.formLabel}>Name</ThemedText>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                />
              </View>

              <View style={styles.formField}>
                <ThemedText style={styles.formLabel}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formField}>
                <ThemedText style={styles.formLabel}>Subject</ThemedText>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="What's this about?"
                />
              </View>

              <View style={styles.formField}>
                <ThemedText style={styles.formLabel}>Message</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Tell us how we can help..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
              >
                <LinearGradient
                  colors={COLORS.gradients.primary as [string, string, string]}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                  <ThemedText style={styles.submitText}>
                    Send Message
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Social Media */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <ThemedText style={styles.socialTitle}>Follow Us</ThemedText>
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-instagram" size={28} color="#E4405F" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={28} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-pinterest" size={28} color="#E60023" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl + 10,
    paddingBottom: SPACING.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
  },
  content: {
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray[600],
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  contactMethods: {
    marginBottom: SPACING.xl,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[600],
    marginBottom: 2,
  },
  contactValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
  },
  formTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  form: {
    gap: SPACING.md,
  },
  formField: {
    gap: SPACING.xs,
  },
  formLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.gray[700],
  },
  input: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    fontSize: FONT_SIZES.md,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.sm,
  },
  submitButton: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    overflow: "hidden",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  submitText: {
    color: "#fff",
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
  },
  socialTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "700",
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.lg,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
});
