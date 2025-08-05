#!/bin/bash

# 3D Model Generation API Deployment Script
set -e

echo "🚀 Starting deployment of 3D Model Generation API..."

# Check dependencies
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }

# Check environment file
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example and configure it."
    exit 1
fi

# Check for required GPU support (optional warning)
if ! docker info | grep -q "nvidia"; then
    echo "⚠️  NVIDIA Docker runtime not detected. GPU workers will not function."
    echo "   Install nvidia-docker2 for GPU acceleration."
fi

echo "📦 Building Docker images..."
docker-compose build

echo "🔧 Starting services..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️  Setting up database..."
docker-compose run --rm api python -c "
from database import create_engine_from_url, create_tables
from settings import Settings
settings = Settings()
engine = create_engine_from_url(settings.DATABASE_URL)
create_tables(engine)
print('✅ Database tables created')
"

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 15

# Start background processors
echo "🔄 Starting status processors..."
docker-compose exec -d api python status_processor.py
docker-compose exec -d api python status_processor.py webhooks

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:8000/healthz > /dev/null 2>&1; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
    echo "🔍 Checking logs..."
    docker-compose logs api
    exit 1
fi

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "📍 Service URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   API:       http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo "   Metrics:   http://localhost:8000/metrics"
echo "   Health:    http://localhost:8000/healthz"
echo ""
echo "📊 Monitoring:"
echo "   docker-compose logs -f api     # API logs"
echo "   docker-compose logs -f worker  # Worker logs"  
echo "   docker-compose ps              # Service status"
echo ""
echo "🛠️  Management commands:"
echo "   docker-compose down            # Stop all services"
echo "   docker-compose restart api     # Restart API"
echo "   docker-compose exec api bash   # API shell"
echo ""

# Show system status
echo "📈 Current system status:"
docker-compose ps

echo ""
echo "🔑 Next steps:"
echo "1. Configure your Stripe webhooks to point to: http://your-domain/webhooks/stripe"
echo "2. Set up S3 bucket and configure access keys"
echo "3. Upload some test images to verify the pipeline"
echo "4. Monitor metrics at /metrics endpoint"
echo "5. Check logs for any errors: docker-compose logs -f"