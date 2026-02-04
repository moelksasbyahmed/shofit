"""
Helper script to add products to ShoFit backend
"""

import requests
import json

# Update this with your backend URL
API_URL = "http://localhost:8000/api/products"


def add_product(product_data):
    """Add a product to the backend"""
    try:
        response = requests.post(API_URL, json=product_data)
        if response.status_code == 200:
            print(f"✓ Product '{product_data['name']}' added successfully!")
            return response.json()
        else:
            print(f"✗ Failed to add product: {response.text}")
            return None
    except Exception as e:
        print(f"✗ Error: {e}")
        return None


# Example products to add
EXAMPLE_PRODUCTS = [
    {
        "id": "7",
        "name": "Leather Jacket",
        "price": 249.99,
        "description": "Premium leather jacket with modern design",
        "category": "Jackets",
        "brand": "SHOFIT Premium",
        "rating": 4.8,
        "reviews": 45,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop"
        ],
        "available_colors": ["Black", "Brown"],
        "available_sizes": ["S", "M", "L", "XL"]
    },
    {
        "id": "8",
        "name": "Running Shoes",
        "price": 119.99,
        "description": "Lightweight running shoes for maximum performance",
        "category": "Shoes",
        "brand": "SHOFIT Sport",
        "rating": 4.6,
        "reviews": 189,
        "in_stock": True,
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop"
        ],
        "available_colors": ["Black", "White", "Red"],
        "available_sizes": ["6", "7", "8", "9", "10", "11"]
    }
]


if __name__ == "__main__":
    print("ShoFit Product Manager")
    print("=" * 50)
    
    # Check if server is running
    try:
        requests.get("http://localhost:8000/docs")
    except:
        print("✗ Backend server not running!")
        print("Start it with: python -m backend.main")
        exit(1)
    
    print("\nOptions:")
    print("1. Add example products")
    print("2. Add custom product")
    
    choice = input("\nEnter choice (1 or 2): ")
    
    if choice == "1":
        print("\nAdding example products...")
        for product in EXAMPLE_PRODUCTS:
            add_product(product)
    
    elif choice == "2":
        print("\nEnter product details:")
        product = {
            "id": input("ID: "),
            "name": input("Name: "),
            "price": float(input("Price: ")),
            "description": input("Description: "),
            "category": input("Category: "),
            "brand": input("Brand: "),
            "rating": float(input("Rating (0-5): ")),
            "reviews": int(input("Number of reviews: ")),
            "in_stock": input("In stock? (y/n): ").lower() == 'y',
            "images": [input("Image URL: ")],
            "available_colors": input("Colors (comma-separated): ").split(","),
            "available_sizes": input("Sizes (comma-separated): ").split(",")
        }
        add_product(product)
    
    print("\nDone!")
