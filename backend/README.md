# ShoFit Backend API

FastAPI server for body measurements and virtual try-on functionality.

## Setup

### Requirements

- Python 3.9+
- pip

### Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Running the Server

Start the development server:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start on `http://localhost:8000`

### Server Options

- `--reload` - Auto-reload on code changes (development only)
- `--host 0.0.0.0` - Listen on all network interfaces
- `--port 8000` - Port number

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py              # FastAPI app and core endpoints
├── models.py            # Pydantic data models
├── routes/
│   └── products.py      # Product API endpoints
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## API Endpoints

### Products

#### Get All Products

```
GET /api/products
```

Query parameters:

- `category` - Filter by category (e.g., "Shirts", "Dresses")
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `search` - Search by name or brand

#### Get Single Product

```
GET /api/products/{product_id}
```

#### Get Products by Category

```
GET /api/products/category/{category}
```

## Example Requests

### Get all products

```bash
curl http://localhost:8000/api/products
```

### Get product by ID

```bash
curl http://localhost:8000/api/products/1
```

### Filter by category

```bash
curl "http://localhost:8000/api/products?category=Shirts"
```

### Search products

```bash
curl "http://localhost:8000/api/products?search=Cotton"
```

## Database

Currently uses in-memory product database. To migrate to a real database, update `routes/products.py`.

## Troubleshooting

### ModuleNotFoundError: No module named 'fastapi'

Install dependencies: `pip install -r requirements.txt`

### Port 8000 already in use

Change the port:

```bash
python -m uvicorn main:app --reload --port 8001
```

### MediaPipe import errors (Windows)

MediaPipe has known issues on Windows. The app will still run without it - pose detection features will be unavailable until fixed.

## Environment Variables

Create a `.env` file in the backend directory if needed:

```env
# Example environment variables
DEBUG=True
```

See `.env.example` for more options.
