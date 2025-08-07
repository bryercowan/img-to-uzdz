FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04   AS base

ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        python3 python3-pip git wget unzip ffmpeg && \
    rm -rf /var/lib/apt/lists/*

RUN pip3 install --upgrade pip
RUN pip3 install \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

RUN pip3 install nerfstudio==0.5.* \
                 runpod boto3 redis

RUN wget -qO- https://github.com/colmap/colmap/releases/download/3.9/colmap-linux-x86_64-noqt.zip \
    | bsdtar -xf- -C /usr/local && \
    ln -s /usr/local/colmap/bin/colmap /usr/local/bin/colmap

WORKDIR /app
COPY handler.py /app/handler.py

CMD ["python3", "-u", "/app/handler.py"]

