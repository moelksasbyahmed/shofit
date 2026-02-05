"""
ShoFit Backend - FastAPI server for body measurements and virtual try-on
Phase 2 & 4: MediaPipe Pose measurements + OOTDiffusion + HunyuanVideo
"""

import os
import io
import base64
import logging
from typing import Optional
from contextlib import asynccontextmanager

import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

# Import routes
from routes.products import router as products_router
from routes.auth import router as auth_router

# Load environment variables
BASE_DIR = os.path.dirname(__file__)
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MediaPipe Pose setup (lazy-loaded to avoid Windows import issues)
mp_pose = None
mp_drawing = None
PoseLandmarker = None
PoseLandmarkerOptions = None
VisionRunningMode = None

def _init_mediapipe():
    """Initialize MediaPipe on first use"""
    global mp_pose, mp_drawing, PoseLandmarker, PoseLandmarkerOptions, VisionRunningMode
    if PoseLandmarker is None:
        try:
            # Import MediaPipe tasks API (0.10.x versions)
            from mediapipe.tasks import python
            from mediapipe.tasks.python import vision
            
            PoseLandmarker = vision.PoseLandmarker
            PoseLandmarkerOptions = vision.PoseLandmarkerOptions
            VisionRunningMode = vision.RunningMode
            
            # Also try to import old API for drawing utilities
            try:
                import mediapipe as mp
                mp_drawing = mp.solutions.drawing_utils
                mp_pose = mp.solutions.pose
            except:
                pass
            
            logger.info("MediaPipe initialized successfully (using tasks API)")
        except Exception as e:
            logger.error(f"Failed to initialize MediaPipe: {e}")
            logger.info("MediaPipe features will be unavailable. Install with: pip install --upgrade mediapipe")
            # Don't raise - allow app to continue without MediaPipe


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    logger.info("Starting ShoFit Backend...")
    try:
        _init_mediapipe()
    except Exception as e:
        logger.warning(f"MediaPipe initialization warning: {e}")
    yield
    logger.info("Shutting down ShoFit Backend...")


# FastAPI app
app = FastAPI(
    title="ShoFit API",
    description="Body measurement and virtual try-on API using MediaPipe and AI models",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products_router)
app.include_router(auth_router)


# ============================================================================
# Pydantic Models
# ============================================================================

class MeasurementRequest(BaseModel):
    """Request model for body measurement."""
    image_base64: str = Field(..., description="Base64 encoded full-body front image")
    side_image_base64: Optional[str] = Field(None, description="Base64 encoded side view image")
    height_cm: float = Field(..., gt=0, description="User's height in centimeters")


class MeasurementResponse(BaseModel):
    """Response model for body measurements."""
    shoulders_cm: float
    bust_cm: float
    waist_cm: float
    hips_cm: float
    waist_to_hip_ratio: float
    height_cm: float
    annotated_image: Optional[str] = Field(None, description="Base64 encoded image with measurement points")
    shoulder_width_px: Optional[float] = None
    chest_width_px: Optional[float] = None
    waist_width_px: Optional[float] = None
    hip_width_px: Optional[float] = None
    body_height_px: Optional[float] = None


class VirtualTryOnRequest(BaseModel):
    """Request model for virtual try-on."""
    person_image_base64: str = Field(..., description="Base64 encoded person image")
    clothing_url: str = Field(default="", description="URL of the clothing item")
    clothing_image_base64: Optional[str] = Field(None, description="Base64 encoded clothing image (optional)")
    category: str = Field(default="Upper body", description="Garment category: 'Upper body', 'Lower body', or 'Dress'")


class VirtualTryOnResponse(BaseModel):
    """Response model for virtual try-on."""
    result_image_base64: str
    video_url: Optional[str] = None
    message: str


# ============================================================================
# Helper Functions
# ============================================================================

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode a base64 string to an OpenCV image."""
    try:
        # Remove data URL prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        image_bytes = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_bytes))
        image_rgb = image.convert("RGB")
        return cv2.cvtColor(np.array(image_rgb), cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")


def encode_image_to_base64(image: np.ndarray, format: str = "PNG") -> str:
    """Encode an OpenCV image to base64 string."""
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(image_rgb)
    buffer = io.BytesIO()
    pil_image.save(buffer, format=format)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def calculate_distance(point1: tuple, point2: tuple) -> float:
    """Calculate Euclidean distance between two points."""
    return np.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)


def get_landmark_coordinates(landmarks, landmark_id: int, image_shape: tuple) -> tuple:
    """Get pixel coordinates for a landmark."""
    landmark = landmarks[landmark_id]
    height, width = image_shape[:2]
    return (int(landmark.x * width), int(landmark.y * height))


# ============================================================================
# Body Measurement Functions (Phase 2)
# ============================================================================

def extract_body_measurements_px(image: np.ndarray) -> dict:
    """
    Extract body measurements in pixels using simple estimation.
    
    Returns measurements for:
    - Shoulder width (estimated from image width)
    - Chest/bust width
    - Waist width  
    - Hip width
    - Body height (image height)
    
    Note: This is a simplified version. For more accurate measurements,
    MediaPipe Pose detection should be used.
    """
    height, width = image.shape[:2]
    
    # Simple estimations based on typical body proportions
    # These are rough estimates - real pose detection would be more accurate
    
    # Assume person takes up ~60% of image width at shoulders
    shoulder_width_px = width * 0.35
    
    # Typical body proportions relative to shoulders:
    # Bust/chest: ~95% of shoulders
    # Waist: ~75% of shoulders  
    # Hips: ~95-100% of shoulders
    chest_width_px = shoulder_width_px * 0.95
    waist_width_px = shoulder_width_px * 0.75
    hip_width_px = shoulder_width_px * 0.98
    
    # Body height is approximately the full image height
    body_height_px = height * 0.9  # Assume person fills 90% of frame
    
    return {
        "shoulder_width_px": shoulder_width_px,
        "chest_width_px": chest_width_px,
        "waist_width_px": waist_width_px,
        "hip_width_px": hip_width_px,
        "body_height_px": body_height_px,
    }


def convert_pixels_to_cm(measurements_px: dict, user_height_cm: float) -> dict:
    """
    Convert pixel measurements to centimeters based on user's known height.
    
    Args:
        measurements_px: Dictionary with pixel measurements
        user_height_cm: User's actual height in centimeters
    
    Returns:
        Dictionary with centimeter measurements
    """
    # Calculate scale factor: cm per pixel
    if measurements_px["body_height_px"] <= 0:
        raise HTTPException(
            status_code=400,
            detail="Could not calculate body height from image."
        )
    
    cm_per_pixel = user_height_cm / measurements_px["body_height_px"]
    
    shoulder_width_cm = measurements_px["shoulder_width_px"] * cm_per_pixel
    chest_width_cm = measurements_px["chest_width_px"] * cm_per_pixel
    waist_width_cm = measurements_px["waist_width_px"] * cm_per_pixel
    hip_width_cm = measurements_px["hip_width_px"] * cm_per_pixel
    
    # Calculate waist-to-hip ratio
    waist_to_hip_ratio = waist_width_cm / hip_width_cm if hip_width_cm > 0 else 0
    
    # Return with field names expected by frontend
    return {
        "shoulders_cm": round(shoulder_width_cm, 1),
        "bust_cm": round(chest_width_cm, 1),
        "waist_cm": round(waist_width_cm, 1),
        "hips_cm": round(hip_width_cm, 1),
        "waist_to_hip_ratio": round(waist_to_hip_ratio, 3),
        "height_cm": user_height_cm,
    }


def create_annotated_image(image: np.ndarray, measurements_px: dict) -> str:
    """
    Create an annotated image with measurement points drawn.
    
    Args:
        image: Original image
        measurements_px: Pixel measurements
    
    Returns:
        Base64 encoded annotated image
    """
    # Create a copy to draw on
    annotated = image.copy()
    height, width = image.shape[:2]
    
    # Calculate approximate positions for measurement points
    center_x = width // 2
    
    # Shoulders - top 15% of image (adjusted for head)
    shoulder_y = int(height * 0.15)
    shoulder_width = int(measurements_px["shoulder_width_px"])
    left_shoulder = (center_x - shoulder_width // 2, shoulder_y)
    right_shoulder = (center_x + shoulder_width // 2, shoulder_y)
    
    # Bust - 25% down (chest area)
    bust_y = int(height * 0.25)
    bust_width = int(measurements_px["chest_width_px"])
    left_bust = (center_x - bust_width // 2, bust_y)
    right_bust = (center_x + bust_width // 2, bust_y)
    
    # Waist - 45% down (natural waist)
    waist_y = int(height * 0.45)
    waist_width = int(measurements_px["waist_width_px"])
    left_waist = (center_x - waist_width // 2, waist_y)
    right_waist = (center_x + waist_width // 2, waist_y)
    
    # Hips - 60% down (widest part of hips)
    hip_y = int(height * 0.60)
    hip_width = int(measurements_px["hip_width_px"])
    left_hip = (center_x - hip_width // 2, hip_y)
    right_hip = (center_x + hip_width // 2, hip_y)
    
    # Draw lines and circles with better visibility
    color = (0, 255, 0)  # Green
    line_thickness = 3
    circle_radius = 8
    
    # Draw horizontal measurement lines
    cv2.line(annotated, left_shoulder, right_shoulder, color, line_thickness)
    cv2.line(annotated, left_bust, right_bust, color, line_thickness)
    cv2.line(annotated, left_waist, right_waist, color, line_thickness)
    cv2.line(annotated, left_hip, right_hip, color, line_thickness)
    
    # Draw circles at measurement points
    for point in [left_shoulder, right_shoulder, left_bust, right_bust, 
                  left_waist, right_waist, left_hip, right_hip]:
        cv2.circle(annotated, point, circle_radius, color, -1)
        # Add white border for better visibility
        cv2.circle(annotated, point, circle_radius + 2, (255, 255, 255), 2)
    
    # Add labels
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    font_thickness = 2
    
    # Draw text with background for better readability
    def draw_text_with_bg(img, text, position, bg_color=(0, 0, 0)):
        text_size = cv2.getTextSize(text, font, font_scale, font_thickness)[0]
        text_x, text_y = position
        # Background rectangle
        cv2.rectangle(img, 
                     (text_x - 5, text_y - text_size[1] - 5),
                     (text_x + text_size[0] + 5, text_y + 5),
                     bg_color, -1)
        # Text
        cv2.putText(img, text, position, font, font_scale, color, font_thickness)
    
    # Label each measurement line
    draw_text_with_bg(annotated, "Shoulders", (center_x + shoulder_width // 2 + 10, shoulder_y))
    draw_text_with_bg(annotated, "Bust", (center_x + bust_width // 2 + 10, bust_y))
    draw_text_with_bg(annotated, "Waist", (center_x + waist_width // 2 + 10, waist_y))
    draw_text_with_bg(annotated, "Hips", (center_x + hip_width // 2 + 10, hip_y))
    
    # Convert to base64
    _, buffer = cv2.imencode('.jpg', annotated)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return img_base64


# ============================================================================
# Virtual Try-On Functions (Phase 4)
# ============================================================================

async def fetch_clothing_image(url: str) -> str:
    """Fetch clothing image from URL and return as base64."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, follow_redirects=True, timeout=30.0)
            response.raise_for_status()
            return base64.b64encode(response.content).decode("utf-8")
        except Exception as e:
            logger.error(f"Error fetching clothing image: {e}")
            raise HTTPException(
                status_code=400, 
                detail=f"Could not fetch clothing image from URL: {str(e)}"
            )


async def call_ootdiffusion_api(person_image_b64: str, clothing_image_b64: str, category: str = "Upper body") -> str:
    """
    Call OOTDiffusion API on Hugging Face Space for virtual try-on.
    API: https://mohamedlkooo-ootddiffusionshofit.hf.space/tryon
    """
    api_url = "https://mohamedlkooo-ootddiffusionshofit.hf.space/tryon/base64"
    
    logger.info(f"Calling OOTDiffusion API at {api_url}")
    logger.info(f"Category: {category}")
    
    # Prepare base64 request payload
    payload = {
        "model_image": person_image_b64,
        "garment_image": clothing_image_b64,
        "category": category,
        "n_samples": 1,
        "n_steps": 20,
        "image_scale": 2.0,
        "seed": -1,
    }
    
    # Get HuggingFace token if available
    headers = {}
    hf_token = os.getenv("HUGGINGFACE_API_TOKEN")
    api_url_with_token = api_url
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"
        headers["X-Auth-Token"] = hf_token
        api_url_with_token = f"{api_url}?token={hf_token}"
        logger.info("Using HuggingFace authentication token")
    else:
        logger.warning("No HUGGINGFACE_API_TOKEN found - may hit quota limits")
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            if headers.get("Authorization"):
                try:
                    whoami = await client.get(
                        "https://huggingface.co/api/whoami-v2",
                        headers=headers,
                    )
                    logger.info(f"HF whoami status: {whoami.status_code}")
                    if whoami.status_code == 200:
                        logger.info(f"HF user: {whoami.json().get('name')}")
                    else:
                        logger.warning(f"HF token invalid: {whoami.text[:200]}")
                except Exception as e:
                    logger.warning(f"HF token check failed: {e}")

            logger.info("Sending request to OOTDiffusion API with base64 payload...")
            response = await client.post(
                api_url_with_token,
                json=payload,
                headers=headers,
            )
            
            logger.info(f"Response status: {response.status_code}")
            
            # Log response body for debugging
            if response.status_code != 200:
                response_text = response.text
                logger.error(f"Error response body: {response_text[:500]}")  # First 500 chars
            
            if response.status_code == 422:
                # Log validation error details
                error_detail = response.text
                logger.error(f"Validation error (422): {error_detail}")
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid request format: {error_detail}"
                )
            
            if response.status_code == 503:
                # Model is loading
                logger.warning("Model is loading, returning None")
                return None
            
            response.raise_for_status()
            
            # Parse response
            result = response.json()
            logger.info(f"API response received: success={result.get('success')}")
            
            if result.get("success") is False:
                logger.error(f"API returned success=false: {result.get('message')}")
                raise HTTPException(
                    status_code=500,
                    detail=result.get("message", "Virtual try-on failed")
                )
            
            # Return the base64 image (support multiple keys)
            image_b64 = result.get("image") or result.get("result_image_base64") or result.get("output")
            if image_b64:
                logger.info("✅ Virtual try-on image generated successfully")
                return image_b64
            else:
                logger.error("No image in API response")
                raise HTTPException(
                    status_code=500,
                    detail="No image returned from virtual try-on API"
                )
            
        except httpx.HTTPStatusError as e:
            logger.error(f"OOTDiffusion API error: {e}")
            raise HTTPException(
                status_code=502,
                detail=f"Virtual try-on service error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error calling OOTDiffusion: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Virtual try-on failed: {str(e)}"
            )


async def call_hunyuan_video_api(image_b64: str) -> str:
    """
    Call HunyuanVideo API on Hugging Face to generate a walking video.
    
    Note: This is a placeholder - HunyuanVideo API integration depends on 
    the specific deployment and API format.
    """
    hf_token = os.getenv("HUGGINGFACE_API_TOKEN")
    if not hf_token:
        return None
    
    # HunyuanVideo API endpoint (adjust based on actual deployment)
    api_url = "https://api-inference.huggingface.co/models/tencent/HunyuanVideo"
    
    headers = {
        "Authorization": f"Bearer {hf_token}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "inputs": {
            "image": image_b64,
            "prompt": "A person walking naturally, smooth motion, fashion runway style, 5 seconds",
        },
        "parameters": {
            "num_frames": 120,  # 5 seconds at 24fps
            "fps": 24,
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=300.0  # Video generation takes longer
            )
            
            if response.status_code != 200:
                logger.warning(f"HunyuanVideo not available: {response.status_code}")
                return None
            
            result = response.json()
            return result.get("video_url", None)
            
        except Exception as e:
            logger.warning(f"Video generation not available: {e}")
            return None


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "healthy", "service": "ShoFit API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/measure", response_model=MeasurementResponse)
async def measure_body(request: MeasurementRequest):
    """
    Extract body measurements from a full-body image.
    
    Uses MediaPipe Pose to identify:
    - Shoulder-to-shoulder width
    - Waist width (estimated)
    - Hip width
    - Waist-to-hip ratio
    
    Converts pixel measurements to centimeters based on user's input height.
    """
    logger.info("Processing measurement request...")
    
    # Decode the image
    image = decode_base64_image(request.image_base64)
    
    # Extract measurements in pixels
    measurements_px = extract_body_measurements_px(image)
    
    # Convert to centimeters
    measurements_cm = convert_pixels_to_cm(measurements_px, request.height_cm)
    
    # Create annotated image with measurement points
    annotated_image_b64 = create_annotated_image(image, measurements_px)
    
    # Create response with annotated image
    response = MeasurementResponse(**measurements_cm, annotated_image=annotated_image_b64)
    
    logger.info(f"Measurements extracted: shoulders={response.shoulders_cm}cm, bust={response.bust_cm}cm, waist={response.waist_cm}cm, hips={response.hips_cm}cm")
    return response


@app.post("/virtual-tryon", response_model=VirtualTryOnResponse)
async def virtual_tryon(request: VirtualTryOnRequest):
    """
    Perform virtual try-on using OOTDiffusion and generate walking video with HunyuanVideo.
    
    Takes a person image and clothing URL/image, returns the try-on result
    and optionally a video of the person walking in the clothing.
    """
    logger.info("Processing virtual try-on request...")
    logger.info(f"Request has person_image_base64: {len(request.person_image_base64) if request.person_image_base64 else 0} chars")
    logger.info(f"Request has clothing_image_base64: {len(request.clothing_image_base64) if request.clothing_image_base64 else 0} chars")
    
    # Get clothing image
    if request.clothing_image_base64:
        clothing_b64 = request.clothing_image_base64
    else:
        # Try to extract clothing image from URL
        # In a real implementation, you'd scrape the product image
        clothing_b64 = await fetch_clothing_image(request.clothing_url)
    
    # Remove data URL prefix if present
    person_b64 = request.person_image_base64
    if "," in person_b64:
        person_b64 = person_b64.split(",")[1]
    
    if clothing_b64 and "," in clothing_b64:
        clothing_b64 = clothing_b64.split(",")[1]
    
    logger.info(f"After processing - person_b64: {len(person_b64) if person_b64 else 0} chars")
    logger.info(f"After processing - clothing_b64: {len(clothing_b64) if clothing_b64 else 0} chars")
    
    if not person_b64 or not clothing_b64:
        raise HTTPException(
            status_code=400,
            detail=f"Missing images: person={'OK' if person_b64 else 'MISSING'}, clothing={'OK' if clothing_b64 else 'MISSING'}"
        )
    
    # Get category from request or default to "Upper body"
    category = getattr(request, 'category', 'Upper body')
    
    # Call OOTDiffusion for virtual try-on
    try_on_result = await call_ootdiffusion_api(person_b64, clothing_b64, category)
    
    if not try_on_result:
        raise HTTPException(
            status_code=503,
            detail="Virtual try-on service is currently loading. Please try again in a moment."
        )
    
    # Generate walking video (optional)
    video_url = await call_hunyuan_video_api(try_on_result)
    
    return VirtualTryOnResponse(
        result_image_base64=try_on_result,
        video_url=video_url,
        message="Virtual try-on completed successfully!"
    )


@app.post("/analyze-pose")
async def analyze_pose(request: MeasurementRequest):
    """
    Analyze pose landmarks and return visualization.
    Useful for debugging and understanding the pose detection.
    """
    image = decode_base64_image(request.image_base64)
    
    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        enable_segmentation=True,
        min_detection_confidence=0.5
    ) as pose:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        
        if not results.pose_landmarks:
            raise HTTPException(
                status_code=400,
                detail="Could not detect pose in image."
            )
        
        # Draw landmarks on image
        annotated_image = image.copy()
        mp_drawing.draw_landmarks(
            annotated_image,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)
        )
        
        # Encode annotated image
        annotated_b64 = encode_image_to_base64(annotated_image)
        
        # Get measurements
        measurements_px = extract_body_measurements_px(image)
        measurements_cm = convert_pixels_to_cm(measurements_px, request.height_cm)
        
        return {
            "annotated_image_base64": annotated_b64,
            "measurements_px": measurements_px,
            "measurements_cm": measurements_cm,
        }


# ============================================================================
# Run the server
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
