/**
 * Virtual Try-On Service
 * Integrates with OOTDiffusion API on Hugging Face Space
 * https://mohamedlkooo-ootddiffusionshofit.hf.space/docs
 */

import { API_CONFIG } from "@/constants/api";
import * as FileSystem from "expo-file-system/legacy";

const API_URL = API_CONFIG.VIRTUAL_TRYON_URL;

export type GarmentCategory = "Upper body" | "Lower body" | "Dress";

export interface VirtualTryOnRequest {
  modelImage: string; // base64 or URI
  garmentImage: string; // base64 or URI
  category?: GarmentCategory;
  nSamples?: number; // 1-4
  nSteps?: number; // 20-40
  imageScale?: number; // 1.0-5.0
  seed?: number; // -1 for random
}

export interface VirtualTryOnResponse {
  success: boolean;
  image: string; // data:image/png;base64,...
  message?: string;
}

class VirtualTryOnService {
  /**
   * Convert image URI to base64
   * Handles local file paths, data URIs, and remote HTTP/HTTPS URLs
   */
  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      // Check if already base64 data URI
      if (imageUri.startsWith("data:")) {
        return imageUri.split(",")[1];
      }

      // Check if it's an HTTP/HTTPS URL
      if (imageUri.startsWith("http://") || imageUri.startsWith("https://")) {
        console.log(
          `Downloading remote image: ${imageUri.substring(0, 50)}...`,
        );

        // For React Native, we need to download to a local file first, then read as base64
        const fileUri = FileSystem.cacheDirectory + `temp_${Date.now()}.jpg`;
        const downloadResult = await FileSystem.downloadAsync(
          imageUri,
          fileUri,
        );

        if (downloadResult.status !== 200) {
          throw new Error(`Failed to download image: ${downloadResult.status}`);
        }

        const base64 = await FileSystem.readAsStringAsync(downloadResult.uri, {
          encoding: "base64",
        });

        // Clean up temp file
        try {
          await FileSystem.deleteAsync(downloadResult.uri, {
            idempotent: true,
          });
        } catch (e) {
          // Ignore cleanup errors
        }

        return base64;
      }

      // Assume it's a local file path
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
   * Perform virtual try-on
   * Takes a person photo and garment photo, returns the person wearing the garment
   */
  async tryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    try {
      console.log("\n=== VIRTUAL TRY-ON API CALL ===");
      console.log(
        `Calling Python Backend: ${API_CONFIG.FASTAPI_URL}/virtual-tryon`,
      );

      const modelImageBase64 = await this.imageToBase64(request.modelImage);
      const garmentImageBase64 = await this.imageToBase64(request.garmentImage);

      console.log("Base64 conversion complete:");
      console.log(
        `  Model image: ${modelImageBase64 ? modelImageBase64.substring(0, 50) + `... (${modelImageBase64.length} chars)` : "EMPTY"}`,
      );
      console.log(
        `  Garment image: ${garmentImageBase64 ? garmentImageBase64.substring(0, 50) + `... (${garmentImageBase64.length} chars)` : "EMPTY"}`,
      );

      console.log("Request params:", {
        category: request.category ?? "Upper body",
      });

      const response = await fetch(`${API_CONFIG.FASTAPI_URL}/virtual-tryon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          person_image_base64: modelImageBase64,
          clothing_image_base64: garmentImageBase64,
          category: request.category ?? "Upper body",
        }),
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(
          `API Error: ${response.status} - ${errorText || response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("✅ API response received");
      console.log("Response data:", {
        has_image: !!data.result_image_base64,
        message: data.message,
      });

      if (!data.result_image_base64) {
        throw new Error(
          data.message || "Failed to generate virtual try-on image",
        );
      }

      console.log("=== END VIRTUAL TRY-ON ===\n");

      return {
        success: true,
        image: data.result_image_base64,
        message: data.message || "Virtual try-on completed successfully",
      };
    } catch (error) {
      console.error("Error performing virtual try-on:", error);
      throw error;
    }
  }

  /**
   * Perform virtual try-on with simple parameters
   * Convenience method with defaults
   */
  async tryOnSimple(
    personImageUri: string,
    garmentImageUri: string,
    category: GarmentCategory = "Upper body",
  ): Promise<string> {
    const result = await this.tryOn({
      modelImage: personImageUri,
      garmentImage: garmentImageUri,
      category,
    });

    return result.image;
  }
}

export const virtualTryOnService = new VirtualTryOnService();
