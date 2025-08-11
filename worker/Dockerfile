FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies and COLMAP dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 python3-pip python3-dev \
        git wget unzip bzip2 \
        ffmpeg libsm6 libxext6 \
        libglib2.0-0 libgl1-mesa-glx \
        build-essential cmake ninja-build \
        libboost-program-options-dev \
        libboost-graph-dev \
        libboost-system-dev \
        libeigen3-dev \
        libfreeimage-dev \
        libmetis-dev \
        libgoogle-glog-dev \
        libgtest-dev \
        libgmock-dev \
        libsqlite3-dev \
        libglew-dev \
        qtbase5-dev \
        libqt5opengl5-dev \
        libcgal-dev \
        libceres-dev \
        nvidia-cuda-toolkit \
        nvidia-cuda-toolkit-gcc && \
    rm -rf /var/lib/apt/lists/*

# Build COLMAP from source with CUDA support
RUN git clone https://github.com/colmap/colmap.git /tmp/colmap && \
    cd /tmp/colmap && \
    mkdir build && \
    cd build && \
    cmake .. -GNinja -DCMAKE_CUDA_ARCHITECTURES=native && \
    ninja && \
    ninja install && \
    cd / && \
    rm -rf /tmp/colmap

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# Copy application code
COPY handler.py .

CMD ["python3", "-u", "handler.py"]

