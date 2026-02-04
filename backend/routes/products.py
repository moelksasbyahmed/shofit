"""
Product routes for ShoFit backend
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models import Product, ProductResponse, ProductsListResponse, ProductsFilterRequest

router = APIRouter(prefix="/api/products", tags=["products"])

# Product database - in production, this would be in a real database
PRODUCTS_DB = {
    "1": {
        "id": "1",
        "name": "Cotton Linen Shirt",
        "price": 89.99,
        "description": "Premium cotton-linen blend shirt with a relaxed fit. Perfect for casual occasions and warm weather. Features include button-down collar, chest pocket, and breathable fabric.",
        "category": "Shirts",
        "brand": "SHOFIT Essentials",
        "rating": 4.5,
        "reviews": 128,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1596755094629-2019c1b84149?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1596755093369-786ffb9c3ff7?w=800&h=1000&fit=crop",
        ],
        "available_colors": ["White", "Black", "Navy", "Gray"],
        "available_sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    },
    "2": {
        "id": "2",
        "name": "Classic Denim Jacket",
        "price": 129.99,
        "description": "Timeless denim jacket made from premium quality fabric. Features classic design with button closure, chest pockets, and adjustable cuffs. Perfect layering piece for any season.",
        "category": "Jackets",
        "brand": "SHOFIT Essentials",
        "rating": 4.7,
        "reviews": 95,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1559983645-e1b9fc2eef0f?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1552374196-1ab2ff8a3e14?w=800&h=1000&fit=crop",
        ],
        "available_colors": ["Blue", "Black", "Light Blue"],
        "available_sizes": ["XS", "S", "M", "L", "XL", "XXL"],
    },
    "3": {
        "id": "3",
        "name": "Summer Floral Dress",
        "price": 79.99,
        "description": "Vibrant floral dress perfect for summer adventures. Made from lightweight, breathable fabric with a flattering A-line silhouette. Features a comfortable fit and easy-care material.",
        "category": "Dresses",
        "brand": "SHOFIT Essentials",
        "rating": 4.3,
        "reviews": 156,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1612336307429-8a88e8d08dbb?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1557804506-669714d2e9d8?w=800&h=1000&fit=crop",
        ],
        "available_colors": ["Floral", "White", "Pink"],
        "available_sizes": ["XS", "S", "M", "L", "XL"],
    },
    "4": {
        "id": "4",
        "name": "Slim Fit Chinos",
        "price": 69.99,
        "description": "Smart casual chinos with a modern slim fit. Made from breathable cotton blend fabric with stretch for comfort. Perfect for both office and weekend wear.",
        "category": "Pants",
        "brand": "SHOFIT Essentials",
        "rating": 4.4,
        "reviews": 82,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1473080169841-fb7fb126e75f?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=800&h=1000&fit=crop",
        ],
        "available_colors": ["Khaki", "Navy", "Black", "Gray"],
        "available_sizes": ["28", "30", "32", "34", "36", "38"],
    },
    "5": {
        "id": "5",
        "name": "Wool Blend Coat",
        "price": 199.99,
        "description": "Elegant wool blend coat for the colder months. Features a tailored silhouette, functional pockets, and premium wool blend fabric. A timeless piece for any wardrobe.",
        "category": "Coats",
        "brand": "SHOFIT Essentials",
        "rating": 4.8,
        "reviews": 67,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1544082521-9ffba9628042?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1539533057671-d7fbf1f42799?w=800&h=1000&fit=crop",
        ],
        "available_colors": ["Black", "Gray", "Camel", "Burgundy"],
        "available_sizes": ["XS", "S", "M", "L", "XL"],
    },
    "6": {
        "id": "6",
        "name": "Casual Sneakers",
        "price": 89.99,
        "description": "Comfortable casual sneakers for everyday wear. Features cushioned sole for all-day comfort, durable rubber outsole, and modern design. Available in multiple colors.",
        "category": "Shoes",
        "brand": "SHOFIT Essentials",
        "rating": 4.6,
        "reviews": 234,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1525966222134-fcaa40579c4f?w=800&h=1000&fit=crop",
            "https://images.unsplash.com/photo-1540212647868-7aea8d24f715?w=800&h=1000&fit=crop",
        ],
        "available_colors": ["White", "Black", "Gray", "Navy"],
        "available_sizes": ["5", "6", "7", "8", "9", "10", "11", "12"],
    },
}


@router.get("/", response_model=ProductsListResponse)
async def get_all_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    search: Optional[str] = Query(None, description="Search by name or brand"),
):
    """
    Get all products with optional filtering.
    
    Query parameters:
    - category: Filter by product category (e.g., "Shirts", "Dresses")
    - min_price: Filter products with price >= min_price
    - max_price: Filter products with price <= max_price
    - search: Search products by name or brand (case-insensitive)
    """
    products = list(PRODUCTS_DB.values())
    
    # Apply filters
    if category:
        products = [p for p in products if p["category"].lower() == category.lower()]
    
    if min_price is not None:
        products = [p for p in products if p["price"] >= min_price]
    
    if max_price is not None:
        products = [p for p in products if p["price"] <= max_price]
    
    if search:
        search_lower = search.lower()
        products = [
            p for p in products
            if search_lower in p["name"].lower() or search_lower in p["brand"].lower()
        ]
    
    return ProductsListResponse(success=True, count=len(products), data=products)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """
    Get a single product by ID.
    
    Args:
        product_id: The unique product identifier
    
    Returns:
        Product details or 404 error if not found
    """
    if product_id not in PRODUCTS_DB:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id '{product_id}' not found"
        )
    
    return ProductResponse(success=True, data=PRODUCTS_DB[product_id])


@router.get("/category/{category}", response_model=ProductsListResponse)
async def get_products_by_category(category: str):
    """
    Get all products in a specific category.
    
    Args:
        category: Product category name (e.g., "Shirts", "Dresses")
    
    Returns:
        List of products in the category
    """
    products = [
        p for p in PRODUCTS_DB.values()
        if p["category"].lower() == category.lower()
    ]
    
    if not products:
        raise HTTPException(
            status_code=404,
            detail=f"No products found in category '{category}'"
        )
    
    return ProductsListResponse(success=True, count=len(products), data=products)
