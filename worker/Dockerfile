FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 python3-pip python3-dev \
        git wget unzip bzip2 \
        ffmpeg libsm6 libxext6 \
        libglib2.0-0 libgl1-mesa-glx \
        build-essential cmake \
        libffi-dev libssl-dev \
        colmap && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN python3 -m pip install --upgrade pip && \
    pip3 install -r requirements.txt

COPY handler.py .

CMD ["python3", "-u", "handler.py"]
