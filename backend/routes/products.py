"""
Product routes for ShoFit backend
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from models import Product, ProductResponse, ProductsListResponse, ProductsFilterRequest
from database import db

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("/", response_model=ProductsListResponse)
async def get_all_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    search: Optional[str] = Query(None, description="Search by name or brand"),
):
    """
    Get all products with optional filtering.
    """
    products = db.get_all_products()
    
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
    """Get a single product by ID."""
    product = db.get_product_by_id(product_id)
    
    if not product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id '{product_id}' not found"
        )
    
    return ProductResponse(success=True, data=product)


@router.get("/category/{category}", response_model=ProductsListResponse)
async def get_products_by_category(category: str):
    """Get all products in a specific category."""
    products = db.get_all_products()
    products = [
        p for p in products
        if p["category"].lower() == category.lower()
    ]
    
    if not products:
        raise HTTPException(
            status_code=404,
            detail=f"No products found in category '{category}'"
        )
    
    return ProductsListResponse(success=True, count=len(products), data=products)


@router.post("/", response_model=ProductResponse)
async def create_product(product: Product):
    """Create a new product (Admin only in production)."""
    product_dict = product.model_dump()
    created_product = db.add_product(product_dict)
    return ProductResponse(success=True, data=created_product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: str, product: Product):
    """Update an existing product (Admin only in production)."""
    product_dict = product.model_dump()
    updated_product = db.update_product(product_id, product_dict)
    
    if not updated_product:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id '{product_id}' not found"
        )
    
    return ProductResponse(success=True, data=updated_product)


@router.delete("/{product_id}")
async def delete_product(product_id: str):
    """Delete a product (Admin only in production)."""
    success = db.delete_product(product_id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"Product with id '{product_id}' not found"
        )
    
    return {"success": True, "message": "Product deleted successfully"}
