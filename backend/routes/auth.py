"""
Authentication routes for ShoFit backend
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from database import db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    """Signup request model"""
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, description="User full name")
    password: str = Field(..., min_length=6, description="User password (min 6 characters)")


class LoginRequest(BaseModel):
    """Login request model"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")


class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: str
    name: str
    created_at: str


class AuthResponse(BaseModel):
    """Authentication response model"""
    success: bool
    message: str
    user: UserResponse


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    """
    Register a new user.
    
    Args:
        request: Signup request with email, name, and password
    
    Returns:
        User details if successful
    
    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = db.get_user_by_email(request.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    user = db.create_user(request.email, request.name, request.password)
    if not user:
        raise HTTPException(
            status_code=500,
            detail="Failed to create user"
        )
    
    return AuthResponse(
        success=True,
        message="User created successfully",
        user=UserResponse(**user)
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and login.
    
    Args:
        request: Login request with email and password
    
    Returns:
        User details if credentials are valid
    
    Raises:
        HTTPException: If credentials are invalid
    """
    user = db.verify_user(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    return AuthResponse(
        success=True,
        message="Login successful",
        user=UserResponse(**user)
    )


@router.get("/user/{email}", response_model=UserResponse)
async def get_user(email: str):
    """
    Get user details by email.
    
    Args:
        email: User email address
    
    Returns:
        User details
    
    Raises:
        HTTPException: If user not found
    """
    user = db.get_user_by_email(email)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return UserResponse(**user)
