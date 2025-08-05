FROM nvidia/cuda:11.8-devel-ubuntu22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    git \
    wget \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Install nerfstudio (latest)
RUN pip3 install nerfstudio

# Copy worker code
COPY . .

# Make worker executable
RUN chmod +x worker_v2.py

# Create temp directory for jobs
RUN mkdir -p /tmp/jobs

# Set environment variables
ENV PYTHONPATH=/app
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import redis; r=redis.from_url('${REDIS_URL}', decode_responses=True); r.ping()" || exit 1

# Run worker
CMD ["python3", "worker_v2.py", "--queue", "standard"]
