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
        const response = await fetch(imageUri);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch image: ${response.status} ${response.statusText}`,
          );
        }
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
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
      const modelImageBase64 = await this.imageToBase64(request.modelImage);
      const garmentImageBase64 = await this.imageToBase64(request.garmentImage);

      const response = await fetch(`${API_URL}/tryon/base64`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_image: modelImageBase64,
          garment_image: garmentImageBase64,
          category: request.category ?? "Upper body",
          n_samples: request.nSamples ?? 1,
          n_steps: request.nSteps ?? 20,
          image_scale: request.imageScale ?? 2.0,
          seed: request.seed ?? -1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API Error: ${response.status} - ${errorText || response.statusText}`,
        );
      }

      const data = await response.json();

      if (!data.success || !data.image) {
        throw new Error(
          data.message || "Failed to generate virtual try-on image",
        );
      }

      return {
        success: data.success,
        image: data.image,
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
