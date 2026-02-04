"""
Database module for ShoFit backend
Uses simple JSON file storage for development (can be replaced with SQL/MongoDB later)
"""

import json
import os
from typing import Optional, List, Dict
from datetime import datetime
import hashlib


class Database:
    def __init__(self, data_dir="data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.users_file = os.path.join(data_dir, "users.json")
        self.products_file = os.path.join(data_dir, "products.json")
        self._init_files()
    
    def _init_files(self):
        """Initialize database files if they don't exist"""
        if not os.path.exists(self.users_file):
            self._save_json(self.users_file, {})
        if not os.path.exists(self.products_file):
            # Initialize with sample products
            self._save_json(self.products_file, self._get_sample_products())
    
    def _load_json(self, filepath: str) -> dict:
        """Load JSON file"""
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_json(self, filepath: str, data: dict):
        """Save JSON file"""
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
    
    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    # User operations
    def create_user(self, email: str, name: str, password: str) -> Optional[Dict]:
        """Create a new user"""
        users = self._load_json(self.users_file)
        
        if email in users:
            return None  # User already exists
        
        user_data = {
            "id": str(len(users) + 1),
            "email": email,
            "name": name,
            "password": self._hash_password(password),
            "created_at": datetime.now().isoformat()
        }
        
        users[email] = user_data
        self._save_json(self.users_file, users)
        
        # Return user without password
        user_response = user_data.copy()
        del user_response["password"]
        return user_response
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        users = self._load_json(self.users_file)
        user = users.get(email)
        if user:
            user_response = user.copy()
            del user_response["password"]
            return user_response
        return None
    
    def verify_user(self, email: str, password: str) -> Optional[Dict]:
        """Verify user credentials"""
        users = self._load_json(self.users_file)
        user = users.get(email)
        
        if user and user["password"] == self._hash_password(password):
            user_response = user.copy()
            del user_response["password"]
            return user_response
        return None
    
    # Product operations
    def get_all_products(self) -> List[Dict]:
        """Get all products"""
        products = self._load_json(self.products_file)
        return list(products.values())
    
    def get_product_by_id(self, product_id: str) -> Optional[Dict]:
        """Get product by ID"""
        products = self._load_json(self.products_file)
        return products.get(product_id)
    
    def add_product(self, product_data: Dict) -> Dict:
        """Add a new product"""
        products = self._load_json(self.products_file)
        product_id = product_data.get("id", str(len(products) + 1))
        product_data["id"] = product_id
        products[product_id] = product_data
        self._save_json(self.products_file, products)
        return product_data
    
    def update_product(self, product_id: str, product_data: Dict) -> Optional[Dict]:
        """Update an existing product"""
        products = self._load_json(self.products_file)
        if product_id not in products:
            return None
        product_data["id"] = product_id
        products[product_id] = product_data
        self._save_json(self.products_file, products)
        return product_data
    
    def delete_product(self, product_id: str) -> bool:
        """Delete a product"""
        products = self._load_json(self.products_file)
        if product_id in products:
            del products[product_id]
            self._save_json(self.products_file, products)
            return True
        return False
    
    @staticmethod
    def _get_sample_products() -> Dict:
        """Get sample products for initialization"""
        return {
            "1": {
                "id": "1",
                "name": "Cotton Linen Shirt",
                "price": 89.99,
                "description": "Premium cotton-linen blend shirt with a relaxed fit. Perfect for casual occasions and warm weather.",
                "category": "Shirts",
                "brand": "SHOFIT Essentials",
                "rating": 4.5,
                "reviews": 128,
                "in_stock": True,
                "images": [
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop",
                    "https://images.unsplash.com/photo-1596755094629-2019c1b84149?w=800&h=1000&fit=crop",
                ],
                "available_colors": ["White", "Black", "Navy", "Gray"],
                "available_sizes": ["XS", "S", "M", "L", "XL", "XXL"],
            },
            "2": {
                "id": "2",
                "name": "Classic Denim Jacket",
                "price": 129.99,
                "description": "Timeless denim jacket made from premium quality fabric.",
                "category": "Jackets",
                "brand": "SHOFIT Essentials",
                "rating": 4.7,
                "reviews": 95,
                "in_stock": True,
                "images": [
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
                ],
                "available_colors": ["Blue", "Black", "Light Blue"],
                "available_sizes": ["XS", "S", "M", "L", "XL", "XXL"],
            },
            "3": {
                "id": "3",
                "name": "Summer Floral Dress",
                "price": 79.99,
                "description": "Vibrant floral dress perfect for summer adventures.",
                "category": "Dresses",
                "brand": "SHOFIT Essentials",
                "rating": 4.3,
                "reviews": 156,
                "in_stock": True,
                "images": [
                    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
                ],
                "available_colors": ["Floral", "White", "Pink"],
                "available_sizes": ["XS", "S", "M", "L", "XL"],
            },
        }


# Global database instance
db = Database()
