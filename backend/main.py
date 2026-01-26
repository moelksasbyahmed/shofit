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
import mediapipe as mp
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MediaPipe Pose setup
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events."""
    logger.info("Starting ShoFit Backend...")
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
    shoulder_width_cm: float
    chest_width_cm: float
    waist_width_cm: float
    hip_width_cm: float
    upper_body_height_cm: float
    waist_to_hip_ratio: float
    height_cm: float
    shoulder_width_px: Optional[float] = None
    chest_width_px: Optional[float] = None
    waist_width_px: Optional[float] = None
    hip_width_px: Optional[float] = None
    upper_body_height_px: Optional[float] = None
    body_height_px: Optional[float] = None


class VirtualTryOnRequest(BaseModel):
    """Request model for virtual try-on."""
    person_image_base64: str = Field(..., description="Base64 encoded person image")
    clothing_url: str = Field(..., description="URL of the clothing item")
    clothing_image_base64: Optional[str] = Field(None, description="Base64 encoded clothing image (optional)")


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
    Extract body measurements in pixels using MediaPipe Pose.
    
    Returns measurements for:
    - Shoulder width (distance between shoulders)
    - Waist width (estimated from hip landmarks)
    - Hip width (distance between hips)
    - Body height (top of head to ankles)
    """
    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,
        enable_segmentation=False,
        min_detection_confidence=0.5
    ) as pose:
        # Convert BGR to RGB for MediaPipe
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        
        if not results.pose_landmarks:
            raise HTTPException(
                status_code=400, 
                detail="Could not detect body pose. Please ensure the image shows a full-body view."
            )
        
        landmarks = results.pose_landmarks.landmark
        image_shape = image.shape
        
        # MediaPipe Pose Landmarks:
        # 0 = NOSE, 11 = LEFT_SHOULDER, 12 = RIGHT_SHOULDER
        # 13 = LEFT_ELBOW, 14 = RIGHT_ELBOW
        # 23 = LEFT_HIP, 24 = RIGHT_HIP
        # 27 = LEFT_ANKLE, 28 = RIGHT_ANKLE
        
        # Get shoulder points
        left_shoulder = get_landmark_coordinates(landmarks, 11, image_shape)
        right_shoulder = get_landmark_coordinates(landmarks, 12, image_shape)
        
        # Get elbow points (for chest width approximation)
        left_elbow = get_landmark_coordinates(landmarks, 13, image_shape)
        right_elbow = get_landmark_coordinates(landmarks, 14, image_shape)
        
        # Get hip points
        left_hip = get_landmark_coordinates(landmarks, 23, image_shape)
        right_hip = get_landmark_coordinates(landmarks, 24, image_shape)
        
        # Get ankle points for height calculation
        left_ankle = get_landmark_coordinates(landmarks, 27, image_shape)
        right_ankle = get_landmark_coordinates(landmarks, 28, image_shape)
        
        # Get nose/head point (approximation for top of body)
        nose = get_landmark_coordinates(landmarks, 0, image_shape)
        
        # Calculate measurements in pixels
        shoulder_width_px = calculate_distance(left_shoulder, right_shoulder)
        hip_width_px = calculate_distance(left_hip, right_hip)
        
        # Chest width: estimate from shoulder and elbow positions
        # Chest is typically ~90-95% of shoulder width
        chest_width_px = shoulder_width_px * 0.92
        
        # Waist width: estimated from hip and shoulder proportions
        # Waist is typically narrower than hips
        waist_width_px = hip_width_px * 0.85
        
        # Upper body height: from shoulder to hip (torso length)
        avg_shoulder_y = (left_shoulder[1] + right_shoulder[1]) / 2
        avg_hip_y = (left_hip[1] + right_hip[1]) / 2
        upper_body_height_px = abs(avg_hip_y - avg_shoulder_y)
        
        # Body height: from nose to average of ankles
        avg_ankle_y = (left_ankle[1] + right_ankle[1]) / 2
        body_height_px = avg_ankle_y - nose[1]
        
        # Add some padding for head above nose
        body_height_px *= 1.1  # Approximate 10% for head above nose
        
        return {
            "shoulder_width_px": shoulder_width_px,
            "chest_width_px": chest_width_px,
            "waist_width_px": waist_width_px,
            "hip_width_px": hip_width_px,
            "upper_body_height_px": upper_body_height_px,
            "body_height_px": abs(body_height_px),
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
    upper_body_height_cm = measurements_px["upper_body_height_px"] * cm_per_pixel
    
    # Calculate waist-to-hip ratio
    waist_to_hip_ratio = waist_width_cm / hip_width_cm if hip_width_cm > 0 else 0
    
    return {
        "shoulder_width_cm": round(shoulder_width_cm, 2),
        "chest_width_cm": round(chest_width_cm, 2),
        "waist_width_cm": round(waist_width_cm, 2),
        "hip_width_cm": round(hip_width_cm, 2),
        "upper_body_height_cm": round(upper_body_height_cm, 2),
        "waist_to_hip_ratio": round(waist_to_hip_ratio, 3),
        "height_cm": user_height_cm,
    }


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


async def call_ootdiffusion_api(person_image_b64: str, clothing_image_b64: str) -> str:
    """
    Call OOTDiffusion API on Hugging Face for virtual try-on.
    
    Note: This uses the Hugging Face Inference API. You may need to adjust
    the endpoint based on the specific model deployment.
    """
    hf_token = os.getenv("HUGGINGFACE_API_TOKEN")
    if not hf_token:
        raise HTTPException(
            status_code=500,
            detail="Hugging Face API token not configured. Set HUGGINGFACE_API_TOKEN env variable."
        )
    
    # OOTDiffusion API endpoint (adjust based on actual deployment)
    api_url = "https://api-inference.huggingface.co/models/levihsu/OOTDiffusion"
    
    headers = {
        "Authorization": f"Bearer {hf_token}",
        "Content-Type": "application/json",
    }
    
    # Prepare the request payload
    payload = {
        "inputs": {
            "person_image": person_image_b64,
            "clothing_image": clothing_image_b64,
            "category": "upper_body",  # Options: upper_body, lower_body, dress
        },
        "parameters": {
            "num_inference_steps": 20,
            "guidance_scale": 2.5,
        }
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                api_url,
                headers=headers,
                json=payload,
                timeout=120.0  # Virtual try-on can take time
            )
            
            if response.status_code == 503:
                # Model is loading
                return None
            
            response.raise_for_status()
            
            # Response should be the generated image
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                return result[0].get("generated_image", "")
            return ""
            
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
    
    # Combine results
    response = MeasurementResponse(
        **measurements_cm,
        **{k: round(v, 2) for k, v in measurements_px.items()}
    )
    
    logger.info(f"Measurements extracted: {response}")
    return response


@app.post("/virtual-tryon", response_model=VirtualTryOnResponse)
async def virtual_tryon(request: VirtualTryOnRequest):
    """
    Perform virtual try-on using OOTDiffusion and generate walking video with HunyuanVideo.
    
    Takes a person image and clothing URL/image, returns the try-on result
    and optionally a video of the person walking in the clothing.
    """
    logger.info("Processing virtual try-on request...")
    
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
    
    # Call OOTDiffusion for virtual try-on
    try_on_result = await call_ootdiffusion_api(person_b64, clothing_b64)
    
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
