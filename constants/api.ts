/**
 * API Configuration for ShoFit
 *
 * Update these URLs based on your deployment:
 * - For local development, use your machine's local IP address
 * - For production, use your deployed API URLs
 */

// Get the local machine's IP for development
// You can find this with: ipconfig (Windows) or ifconfig (Mac/Linux)
const LOCAL_IP = "192.168.1.5"; // Replace with your actual local IP

export const API_CONFIG = {
  // FastAPI Backend (Python - body measurements & virtual try-on)
  FASTAPI_URL: __DEV__
    ? `http://${LOCAL_IP}:8001`
    : "https://your-production-api.com",

  // Node.js Scraper (size chart extraction & Gemini recommendations)
  NODE_SCRAPER_URL: __DEV__
    ? `http://${LOCAL_IP}:3001`
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
