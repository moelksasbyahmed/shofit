# 👗 ShoFit - AI-Powered Fashion eCommerce Platform

ShoFit is a comprehensive mobile eCommerce application featuring an AI-powered virtual fitting room. It combines advanced body measurement analysis, web scraping for size charts, virtual try-on capabilities, and a full-featured shopping experience based on the Open Fashion UI Kit.

## 🌟 Features

### 🛍️ **eCommerce Platform**

- **Modern Shop Interface** - Beautiful product browsing with grid/list views
- **Product Details** - Rich product pages with image galleries, size selection, color variants
- **Smart Search** - Advanced search with recent & trending suggestions
- **Collections & Categories** - Curated collections and category browsing
- **Shopping Cart** - Full cart management with quantity controls
- **Checkout Flow** - Multi-step checkout with shipping & payment
- **Blog & Content** - Fashion blog with grid/list views
- **Menu & Navigation** - Comprehensive side menu with user profile

### 🤖 **AI Virtual Fitting Room**

- **📸 Full-Body Photo Capture** - Take or select a full-body photo using your device's camera
- **📏 AI Body Measurements** - Uses MediaPipe Pose to measure shoulder width, waist, and hip proportions
- **🔍 Size Chart Extraction** - Automatically scrapes size charts from clothing store URLs
- **🤖 AI Size Recommendation** - Gemini 2.5 Flash analyzes your measurements against size charts
- **👔 Virtual Try-On** - OOTDiffusion integration for seeing how clothes look on you
- **🎬 Walking Video** - HunyuanVideo generates a 5-second walking animation

## 📱 Screens Implemented

### Shopping Screens

- ✅ **Shop Home** - Hero banner, categories, AI fitting CTA, featured products
- ✅ **Product Detail** - Image gallery, size/color selection, AI try-on button
- ✅ **Shopping Cart** - Cart items with quantity controls, promo codes, order summary
- ✅ **Checkout** - Multi-step with shipping address, delivery method, payment
- ✅ **Payment Success** - Order confirmation with animated success state
- ✅ **Search** - Recent searches, trending, category quick links, search results
- ✅ **Collections** - Featured collections with product counts
- ✅ **Menu** - User profile, shop sections, account settings, info pages

### Content Screens

- ✅ **Blog** - Grid/list view toggle, category filters, featured posts
- ✅ **Our Story** - Company mission, values, team information
- ✅ **Contact Us** - Contact form, phone/email/address, social media links

### AI Features

- ✅ **Welcome Screen** - Animated brand introduction
- ✅ **Onboarding** - 5-step feature walkthrough
- ✅ **Photo Capture Flow** - Face, front, and side view capture
- ✅ **AI Processing** - Body measurements & size recommendation
- ✅ **Results Display** - Measurements, recommended size, try-on preview

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Expo Mobile   │────▶│  FastAPI Backend │────▶│ MediaPipe Pose  │
│      App        │     │   (Python)       │     │ Body Measurement│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │  HuggingFace    │
        │               │  - OOTDiffusion │
        │               │  - HunyuanVideo │
        │               └─────────────────┘
        │
        ▼
┌─────────────────┐     ┌─────────────────┐
│  Node.js Scraper│────▶│   Gemini 2.5    │
│   (Cheerio)     │     │ Size Recommend  │
└─────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
shofit/
├── app/                         # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx           # AI Fitting Room (main feature)
│   │   ├── shop.tsx            # eCommerce shop home
│   │   └── explore.tsx         # Explore/discover tab
│   ├── product/
│   │   └── [id].tsx            # Dynamic product detail pages
│   ├── cart.tsx                # Shopping cart
│   ├── checkout.tsx            # Multi-step checkout
│   ├── payment-success.tsx     # Order confirmation
│   ├── search.tsx              # Search screen
│   ├── menu.tsx                # Navigation menu
│   ├── collections.tsx         # Product collections
│   ├── blog.tsx                # Blog listing
│   ├── our-story.tsx           # About page
│   ├── contact.tsx             # Contact form
│   ├── _layout.tsx             # Root layout
│   └── modal.tsx               # Modal screen
├── backend/                     # FastAPI Python backend
│   ├── main.py                 # API endpoints & MediaPipe logic
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables template
├── scraper/                     # Node.js scraper service
│   ├── index.js                # Express server with Cheerio & Gemini
│   ├── package.json            # Node dependencies
│   └── .env.example            # Environment variables template
├── components/                  # React Native components
│   ├── welcome-screen.tsx      # Animated welcome
│   ├── onboarding-screen.tsx   # Feature onboarding
│   ├── photo-capture-flow.tsx  # Camera capture UI
│   ├── themed-text.tsx         # Themed text component
│   └── themed-view.tsx         # Themed view component
├── constants/                   # Theme & configuration
│   ├── design.ts               # Design system tokens
│   ├── theme.ts                # Theme configuration
│   └── api.ts                  # API endpoints
├── hooks/                       # Custom React hooks
├── figma_design/               # Figma design files
└── types/                      # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Expo CLI (`npm install -g expo-cli`)
- An Android/iOS device or emulator

### 1. Setup Mobile App

```bash
# Install dependencies
npm install

# Install expo-image-picker
npx expo install expo-image-picker

# Start the Expo development server
npx expo start
```

### 2. Setup FastAPI Backend (Phase 2)

```bash
# Navigate to backend directory
cd backend

# Install dependencies (pip must be installed)
pip install -r requirements.txt

# Start the development server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The FastAPI server will run on `http://localhost:8000`

**Interactive API Documentation:**

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**API Endpoints:**

- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/{product_id}` - Get single product
- `GET /api/products/category/{category}` - Get products by category
- `POST /measure` - Extract body measurements from image
- `POST /virtual-tryon` - Perform virtual try-on
- `POST /analyze-pose` - Debug endpoint with pose visualization

For detailed backend documentation, see [backend/README.md](backend/README.md)

### 3. Setup Node.js Scraper (Phase 3)

```bash
# Navigate to scraper directory
cd scraper

# Install dependencies
npm install

# Copy environment file and add your Gemini API key
cp .env.example .env

# Start the server
npm start
```

The scraper server will run on `http://localhost:3001`

**API Endpoints:**

- `POST /scrape-size-chart` - Extract size chart from URL
- `POST /recommend-size` - Get AI size recommendation
- `POST /analyze` - Combined scrape + recommend

### 4. Configure API Keys

**Backend (.env):**

```env
HUGGINGFACE_API_TOKEN=your_token_here
```

**Scraper (.env):**

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Update API URLs

In `app/(tabs)/index.tsx`, update the API configuration:

```typescript
const API_CONFIG = {
  FASTAPI_URL: "http://YOUR_LOCAL_IP:8000",
  NODE_SCRAPER_URL: "http://YOUR_LOCAL_IP:3001",
};
```

> **Note:** Use your machine's local IP address (not localhost) for mobile devices to connect.

## 📱 How to Use

1. **Take a Photo** - Capture a full-body photo or select from gallery
2. **Enter Height** - Input your height in centimeters for accurate measurements
3. **Add Clothing URL** - Paste a URL from an online clothing store
4. **Process** - Tap the Process button to:
   - Analyze your body measurements
   - Scrape the size chart from the URL
   - Get an AI-powered size recommendation
   - (Optional) Generate a virtual try-on image

## 🔧 Technical Details

### Phase 1: Expo Mobile App

- Built with Expo SDK 54 and expo-router
- Uses `expo-image-picker` for camera/gallery access
- Sends base64-encoded images to backend

### Phase 2: Body Measurement (MediaPipe)

- Uses MediaPipe Pose with `model_complexity=2` for accuracy
- Detects 33 body landmarks
- Calculates:
  - Shoulder width (landmarks 11-12)
  - Hip width (landmarks 23-24)
  - Waist width (estimated from hip width)
  - Body height (nose to ankles)
- Converts pixels to cm using user's known height

### Phase 3: Web Scraping & AI

- Cheerio-based HTML parsing
- Multiple strategies for finding size charts:
  1. Tables with size-related headers
  2. Elements with size/chart class names
  3. Pattern matching for size formats
  4. AI extraction as fallback
- Gemini 2.5 Flash for intelligent size recommendations

### Phase 4: Virtual Try-On

- OOTDiffusion API for outfit transfer
- HunyuanVideo for walking animation
- Requires Hugging Face API access

## 🔑 API Keys Required

| Service       | Purpose                | Get Key                                                |
| ------------- | ---------------------- | ------------------------------------------------------ |
| Google Gemini | Size recommendations   | [Google AI Studio](https://makersuite.google.com/)     |
| Hugging Face  | Virtual try-on & video | [Hugging Face](https://huggingface.co/settings/tokens) |

## 🛠️ Development

### Running All Services

**Terminal 1 - Mobile App:**

```bash
npx expo start
```

**Terminal 2 - FastAPI Backend:**

```bash
cd backend && python main.py
```

**Terminal 3 - Node Scraper:**

```bash
cd scraper && npm start
```

### Testing the Backend

```bash
# Test measurements endpoint
curl -X POST http://localhost:8000/measure \
  -H "Content-Type: application/json" \
  -d '{"image_base64": "...", "height_cm": 175}'

# Test size chart scraping
curl -X POST http://localhost:3001/scrape-size-chart \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/product"}'
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
