/**
 * API Configuration for ShoFit
 *
 * Update these URLs based on your deployment:
 * - For local development, use your machine's local IP address
 * - For production, use your deployed API URLs
 */

// Environment-driven config (Expo: use EXPO_PUBLIC_* variables)
const DEV_HOST = process.env.EXPO_PUBLIC_API_HOST ?? "localhost";
const FASTAPI_PORT = process.env.EXPO_PUBLIC_FASTAPI_PORT ?? "8000";
const NODE_SCRAPER_PORT = process.env.EXPO_PUBLIC_NODE_SCRAPER_PORT ?? "3001";

const FASTAPI_URL =
  process.env.EXPO_PUBLIC_FASTAPI_URL ?? `http://${DEV_HOST}:${FASTAPI_PORT}`;

const NODE_SCRAPER_URL =
  process.env.EXPO_PUBLIC_NODE_SCRAPER_URL ??
  `http://${DEV_HOST}:${NODE_SCRAPER_PORT}`;

export const API_CONFIG = {
  // FastAPI Backend (Python - body measurements & virtual try-on)
  FASTAPI_URL: __DEV__ ? FASTAPI_URL : "https://your-production-api.com",

  // Node.js Scraper (size chart extraction & Gemini recommendations)
  NODE_SCRAPER_URL: __DEV__
    ? NODE_SCRAPER_URL
    : "https://your-production-scraper.com",

  // MediaPipe AI Body Measurements (HuggingFace Space)
  AI_MEASUREMENTS_URL: "https://mohamedlkooo-mediapip-pos.hf.space",

  // OOTDiffusion Virtual Try-On (HuggingFace Space)
  VIRTUAL_TRYON_URL: "https://mohamedlkooo-ootddiffusionshofit.hf.space",

  // Request timeout in milliseconds
  TIMEOUT: 60000,
};

// Base URL for API (alias for FASTAPI_URL)
export const API_BASE_URL = API_CONFIG.FASTAPI_URL;

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  // FastAPI endpoints
  MEASURE: "/measure",
  VIRTUAL_TRYON: "/virtual-tryon",
  ANALYZE_POSE: "/analyze-pose",

  // Node.js Scraper endpoints
  SCRAPE_SIZE_CHART: "/scrape-size-chart",
  RECOMMEND_SIZE: "/recommend-size",
  ANALYZE: "/analyze",
};

/**
 * Build full URL for an endpoint
 */
export function buildUrl(
  baseUrl: "fastapi" | "scraper",
  endpoint: string,
): string {
  const base =
    baseUrl === "fastapi"
      ? API_CONFIG.FASTAPI_URL
      : API_CONFIG.NODE_SCRAPER_URL;
  return `${base}${endpoint}`;
}

/**
 * Default fetch options with timeout
 */
export function getDefaultFetchOptions(): RequestInit {
  return {
    headers: {
      "Content-Type": "application/json",
    },
  };
}

export default API_CONFIG;
