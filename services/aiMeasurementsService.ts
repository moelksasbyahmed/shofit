/**
 * AI Body Measurements Service
 * Integrates with MediaPipe Pose API on Hugging Face Space
 * https://mohamedlkooo-mediapip-pos.hf.space/docs#/
 */

import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";

import { API_CONFIG } from "@/constants/api";

const API_URL = API_CONFIG.AI_MEASUREMENTS_URL;

export interface AIMeasurementsResponse {
  shoulders: number;
  bust: number;
  waist: number;
  hips: number;
  message: string;
}

class AIMeasurementsService {
  /**
   * Pick an image from device gallery
   */
  async pickImage(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as unknown as ImagePicker.MediaTypeOptions,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      throw error;
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(): Promise<string | null> {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"] as unknown as ImagePicker.MediaTypeOptions,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error("Error taking photo:", error);
      throw error;
    }
  }

  /**
   * Convert image URI to base64
   */
  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      throw error;
    }
  }

  /**
   * Get measurements from image using MediaPipe API
   * Sends full-body image for pose analysis
   */
  async getMeasurementsFromImage(
    imageUri: string,
    height_cm: number,
  ): Promise<AIMeasurementsResponse> {
    try {
      const toNumber = (value: unknown): number | undefined => {
        if (typeof value === "number") return value;
        if (typeof value === "string") {
          const parsed = Number(value);
          if (Number.isFinite(parsed)) return parsed;
          const match = value.match(/-?\d+(?:\.\d+)?/);
          if (match) {
            const parsedMatch = Number(match[0]);
            return Number.isFinite(parsedMatch) ? parsedMatch : undefined;
          }
        }
        return undefined;
      };

      const base64Image = await this.imageToBase64(imageUri);

      const response = await fetch(`${API_URL}/analyze/base64`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          reference_height_cm: height_cm,
          return_file: false,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`,
        );
      }

      const data = await response.json();

      let measurements =
        data.estimated_measurements_cm ??
        data.measurements ??
        data.body_measurements ??
        data.results ??
        data.result ??
        data.output ??
        data.data ??
        data;

      if (typeof measurements === "string") {
        try {
          measurements = JSON.parse(measurements);
        } catch {
          // ignore parse errors and let validation handle it
        }
      }

      const shoulders = toNumber(
        measurements.shoulders ??
          measurements.shoulder_width ??
          measurements.shoulder_width_cm ??
          measurements.shoulder ??
          measurements.shoulder_cm,
      );
      const bust = toNumber(
        measurements.bust ??
          measurements.chest ??
          measurements.chest_width ??
          measurements.chest_width_cm ??
          measurements.chest_circumference ??
          measurements.chest_circumference_cm ??
          measurements.bust_cm,
      );
      const waist = toNumber(
        measurements.waist ??
          measurements.waist_width ??
          measurements.waist_width_cm ??
          measurements.waist_circumference ??
          measurements.waist_circumference_cm ??
          measurements.waist_cm,
      );
      const hips = toNumber(
        measurements.hips ??
          measurements.hip ??
          measurements.hip_width ??
          measurements.hip_width_cm ??
          measurements.hip_circumference ??
          measurements.hip_circumference_cm ??
          measurements.hips_cm,
      );

      if (
        typeof shoulders !== "number" ||
        typeof bust !== "number" ||
        typeof waist !== "number" ||
        typeof hips !== "number"
      ) {
        console.error("AI measurements raw response:", data);
        console.error("AI measurements extracted values:", {
          shoulders,
          bust,
          waist,
          hips,
        });
        throw new Error("Invalid response format from API");
      }

      return {
        shoulders: Math.round(shoulders * 10) / 10,
        bust: Math.round(bust * 10) / 10,
        waist: Math.round(waist * 10) / 10,
        hips: Math.round(hips * 10) / 10,
        message:
          data.message ||
          measurements.message ||
          "Measurements calculated successfully",
      };
    } catch (error) {
      console.error("Error getting measurements from image:", error);
      throw error;
    }
  }

  /**
   * Get full body photo with instructions
   */
  async captureFullBodyPhoto(
    mode: "camera" | "gallery" = "camera",
  ): Promise<string | null> {
    return mode === "camera" ? this.takePhoto() : this.pickImage();
  }
}

export const aiMeasurementsService = new AIMeasurementsService();
