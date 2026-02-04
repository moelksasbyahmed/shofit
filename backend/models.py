"""
Product and related data models for ShoFit backend
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ProductImage(BaseModel):
    """Product image model"""
    url: str = Field(..., description="Image URL")
    alt: Optional[str] = Field(None, description="Alt text for image")


class Product(BaseModel):
    """Product model for clothing items"""
    id: str = Field(..., description="Unique product identifier")
    name: str = Field(..., description="Product name")
    price: float = Field(..., gt=0, description="Product price")
    description: str = Field(..., description="Product description")
    category: str = Field(..., description="Product category (e.g., Shirts, Dresses)")
    brand: str = Field(..., description="Brand name")
    rating: float = Field(..., ge=0, le=5, description="Product rating out of 5")
    reviews: int = Field(default=0, ge=0, description="Number of reviews")
    in_stock: bool = Field(default=True, description="Whether product is in stock")
    images: List[str] = Field(..., description="List of product image URLs")
    available_colors: List[str] = Field(
        default=["White", "Black", "Navy", "Gray"],
        description="Available colors for the product"
    )
    available_sizes: List[str] = Field(
        default=["XS", "S", "M", "L", "XL", "XXL"],
        description="Available sizes for the product"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "1",
                "name": "Cotton Linen Shirt",
                "price": 89.99,
                "description": "Premium cotton-linen blend shirt with relaxed fit.",
                "category": "Shirts",
                "brand": "SHOFIT Essentials",
                "rating": 4.5,
                "reviews": 128,
                "in_stock": True,
                "images": [
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
                    "https://images.unsplash.com/photo-1596755094629-2019c1b84149"
                ],
                "available_colors": ["White", "Black", "Navy"],
                "available_sizes": ["S", "M", "L", "XL"]
            }
        }


class ProductResponse(BaseModel):
    """Response model for single product"""
    success: bool
    data: Product


class ProductsListResponse(BaseModel):
    """Response model for products list"""
    success: bool
    count: int
    data: List[Product]


class ProductsFilterRequest(BaseModel):
    """Filter request model"""
    category: Optional[str] = Field(None, description="Filter by category")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price filter")
    max_price: Optional[float] = Field(None, ge=0, description="Maximum price filter")
    search: Optional[str] = Field(None, description="Search by product name or brand")
