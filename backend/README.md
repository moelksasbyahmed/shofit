# ShoFit Backend API

A modular FastAPI backend for the ShoFit application with body measurements, virtual try-on, user authentication, and product management.

## Features

- **User Authentication**: Signup, login, and user management
- **Product Management**: CRUD operations for clothing products
- **Body Measurements**: AI-powered body measurement extraction using MediaPipe
- **Virtual Try-On**: Integration with AI models for virtual clothing try-on

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server

**Important**: You must run the server from the `backend` directory.

#### Option 1: Using Virtual Environment (Windows - Recommended)

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Option 2: Using Virtual Environment (Linux/Mac)

```bash
cd backend
.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Option 3: Using system Python

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:

- Local: http://localhost:8000
- Network: http://YOUR_IP:8000
- Docs: http://localhost:8000/docs

## API Endpoints

### Authentication

#### Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Products

#### Get All Products

```http
GET /api/products
GET /api/products?category=Shirts
GET /api/products?min_price=50&max_price=100
GET /api/products?search=cotton
```

#### Get Single Product

```http
GET /api/products/{product_id}
```

#### Create Product

```http
POST /api/products
Content-Type: application/json

{
  "id": "7",
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description",
  "category": "Shirts",
  "brand": "SHOFIT Essentials",
  "rating": 4.5,
  "reviews": 10,
  "in_stock": true,
  "images": [
    "https://example.com/image1.jpg"
  ],
  "available_colors": ["White", "Black"],
  "available_sizes": ["S", "M", "L", "XL"]
}
```

#### Update Product

```http
PUT /api/products/{product_id}
Content-Type: application/json

{
  "id": "7",
  "name": "Updated Product Name",
  "price": 89.99,
  ...
}
```

#### Delete Product

```http
DELETE /api/products/{product_id}
```

## Adding Products

### Method 1: Using the API (Recommended)

Visit http://localhost:8000/docs and use the interactive Swagger UI, or make a POST request:

```python
import requests

product = {
    "id": "10",
    "name": "New Shirt",
    "price": 79.99,
    "description": "A great shirt",
    "category": "Shirts",
    "brand": "SHOFIT Essentials",
    "rating": 4.5,
    "reviews": 0,
    "in_stock": True,
    "images": [
        "https://images.unsplash.com/photo-example?w=800&h=1000&fit=crop"
    ],
    "available_colors": ["White", "Black", "Navy"],
    "available_sizes": ["XS", "S", "M", "L", "XL", "XXL"]
}

response = requests.post(
    "http://localhost:8000/api/products",
    json=product
)
print(response.json())
```

### Method 2: Direct Database Edit

Edit `backend/data/products.json` directly (created automatically on first run).

## Database Structure

The backend uses JSON file storage for development:

- `data/users.json`: User accounts (passwords are hashed)
- `data/products.json`: Product catalog

In production, replace with PostgreSQL, MongoDB, or any database.

## Frontend Configuration

Update `constants/api.ts` in your React Native app with your computer's IP:

```typescript
export const API_BASE_URL = "http://192.168.1.X:8000";
```

Find your IP:

- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

## Troubleshooting

**Network request failed:**

- Ensure backend is running
- Update API_BASE_URL with correct IP
- Check firewall settings
- Both devices on same network

**Database errors:**

- Delete `data/` folder to reset
- Check file permissions
