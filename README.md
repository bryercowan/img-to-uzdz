# 3D Model Generation API - E-commerce NeRF Platform

A production-ready system for converting images to 3D models (GLB/USDZ) with Studio, API, and Batch tiers. Built for e-commerce platforms needing on-demand 3D model generation.

## Features

### 🎨 Studio (No-signup one-time checkout)
- Upload 8-30 photos with intelligent validation
- Fast preview validation (blur/coverage/quality checks)
- One-time Stripe payment ($2-$3/job)
- Download GLB and USDZ models
- Optional account linking for future management

### 🔧 API (Metered usage)
- OpenAPI 3.1 compliant REST API
- Credit-based billing with prepaid packages
- Async job processing with webhooks
- Presigned S3 uploads for security
- API key authentication with org-level access
- Fast (3k iterations) and High quality (8k iterations) modes

### 📊 Batch Processing
- CSV/manifest/ZIP ingestion for bulk jobs
- Concurrent processing with org-level caps
- Priority queues (rush vs standard)
- Bulk status tracking and reporting
- Enterprise-grade SLA support

### 🔬 Neural Radiance Fields (NeRF)
- **nerfstudio** integration for state-of-the-art 3D reconstruction
- GPU-accelerated training with CUDA support
- Automatic mesh extraction and optimization
- PLY to GLB conversion with compression
- Optional USDZ export (feature-flagged)

## Setup

### Prerequisites

1. **Google Cloud Vision API**:
   - Create a Google Cloud project
   - Enable the Vision API
   - Create a service account and download the JSON key
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

2. **Stripe Account**:
   - Create a Stripe account
   - Set up a product with a $3 price
   - Get your API keys and webhook secret

3. **Redis**:
   - Redis server for session management (included in Docker setup)

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PRICE_ID=price_your_stripe_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Configuration
BASE_URL=http://localhost:3000
REDIS_URL=redis://redis:6379/0

# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

### Running with Docker

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:8000

### Manual Setup

#### Backend
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## How It Works

1. **Upload**: Users upload 3-6 product images
2. **AI Analysis**: Google Vision API analyzes images for:
   - Product identification
   - Object detection
   - Text extraction
   - Automatic tagging
3. **3D Generation**: Creates a USDZ file using detected product shape and textures
4. **Preview**: Shows generated model with AI tags
5. **Payment**: Stripe checkout for $3
6. **Download**: Instant USDZ file download after payment

## Usage on Websites

### iOS Safari (Native AR)
```html
<a href="path/to/your/model.usdz">
  <img src="product-image.jpg" alt="View in AR">
</a>
```

### Android Chrome (WebXR)
```html
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
<model-viewer 
  src="path/to/your/model.usdz" 
  ar 
  ar-modes="webxr scene-viewer quick-look"
  camera-controls>
</model-viewer>
```

## SEO Strategy

### Target Keywords
This application is optimized to rank for high-value e-commerce 3D/AR keywords:

**Primary Keywords:**
- "USDZ generator" (1,300 searches/month)
- "Shopify AR" (800 searches/month) 
- "3D models from images" (2,100 searches/month)
- "USDZ converter" (900 searches/month)

**Long-tail Keywords:**
- "How to add AR to Shopify store" (450 searches/month)
- "Generate USDZ files for e-commerce" (320 searches/month)
- "Cheap 3D modeling for products" (680 searches/month)
- "iOS Safari AR models" (290 searches/month)

### SEO Features Implemented

1. **Comprehensive Meta Tags**
   - Title optimized for "USDZ Generator - Convert Images to 3D Models for Shopify AR"
   - Meta description targeting pain points and benefits
   - Open Graph and Twitter Card optimization
   - Structured data (Schema.org) for services and pricing

2. **Content Optimization**
   - H1 and H2 tags include target keywords naturally
   - FAQ section answers common e-commerce 3D questions
   - Tutorial section targets implementation keywords
   - Customer testimonials for social proof and trust signals

3. **Technical SEO**
   - Robots.txt optimized for search engines
   - XML sitemap for better crawlability
   - Dynamic meta tags on success pages
   - Fast loading with optimized images

4. **Content Strategy**
   - Benefits section compares to expensive agencies ($500+ vs $3)
   - Step-by-step implementation guides for major platforms
   - Real customer success stories with specific metrics
   - Cross-platform compatibility emphasis

### Content Marketing Opportunities

**Blog Post Ideas:**
- "How to Add AR Product Visualization to Your Shopify Store in 2024"
- "USDZ vs GLB: Which 3D Format is Best for E-commerce AR?"
- "5 Ways AR Product Models Increase E-commerce Conversion Rates"
- "From Images to AR: Complete Guide to 3D Product Visualization"

**Target Platforms:**
- Reddit (r/shopify, r/ecommerce, r/entrepreneur)
- Product Hunt launch
- E-commerce blogs and podcasts
- Shopify app store (future development)
- YouTube tutorials for implementation

### Competitive Advantage
- **Cost**: $3 vs $500+ agencies
- **Speed**: Minutes vs weeks
- **Simplicity**: No subscriptions or complex setups
- **AI-Powered**: Automatic product recognition and tagging
- **Universal**: Works with all e-commerce platforms
