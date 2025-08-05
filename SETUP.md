# Quick Setup Guide

## Prerequisites
- Docker with NVIDIA GPU support (for workers)
- Copy `.env.example` to `.env` and configure

## Start Services

```bash
# Start database and Redis
docker-compose up -d postgres redis

# Wait for database
sleep 10

# Initialize database
docker-compose run --rm api python -c "
from database import create_engine_from_url, create_tables
from settings import Settings
settings = Settings()
engine = create_engine_from_url(settings.DATABASE_URL)
create_tables(engine)
"

# Start all services
docker-compose up -d

# Start background processors
docker-compose exec -d api python status_processor.py
docker-compose exec -d api python status_processor.py webhooks
```

## Service URLs
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/healthz
- Metrics: http://localhost:8000/metrics

## Useful Commands
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f api
docker-compose logs -f worker

# Stop services
docker-compose down

# Restart API
docker-compose restart api
```