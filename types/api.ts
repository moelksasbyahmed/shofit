/**
 * Type definitions for ShoFit API
 */

// ============================================================================
// Measurement Types (Phase 2)
// ============================================================================

export interface MeasurementRequest {
  image_base64: string;
  height_cm: number;
}

export interface MeasurementResponse {
  shoulder_width_cm: number;
  waist_width_cm: number;
  hip_width_cm: number;
  waist_to_hip_ratio: number;
  height_cm: number;
  shoulder_width_px?: number;
  waist_width_px?: number;
  hip_width_px?: number;
  body_height_px?: number;
}

// ============================================================================
// Size Chart Types (Phase 3)
// ============================================================================

export interface SizeChartRow {
  Size?: string;
  Chest?: string;
  Waist?: string;
  Hip?: string;
  Shoulder?: string;
  [key: string]: string | undefined;
}

export interface SizeChart {
  headers: string[];
  rows: SizeChartRow[];
}

export interface ScrapeResponse {
  success: boolean;
  sizeChart: SizeChart;
  rawText: string;
  url: string;
  error?: string;
}

export interface SizeRecommendation {
  recommended_size: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  alternative_size?: string;
  fit_notes?: string;
}

// ============================================================================
// Virtual Try-On Types (Phase 4)
// ============================================================================

export interface VirtualTryOnRequest {
  person_image_base64: string;
  clothing_url: string;
  clothing_image_base64?: string;
}

export interface VirtualTryOnResponse {
  result_image_base64: string;
  video_url?: string;
  message: string;
}

// ============================================================================
// Combined Processing Result
// ============================================================================

export interface ProcessingResult {
  measurements: MeasurementResponse;
  sizeChart: SizeChart;
  recommendation: SizeRecommendation;
  tryOnImage?: string;
  videoUrl?: string;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface APIError {
  detail: string;
  status_code?: number;
}

export function isAPIError(obj: unknown): obj is APIError {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'detail' in obj &&
    typeof (obj as APIError).detail === 'string'
  );
}
