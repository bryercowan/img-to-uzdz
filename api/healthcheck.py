#!/usr/bin/env python3
"""
Simple healthcheck for the API
"""
import sys
import requests

try:
    response = requests.get("http://localhost:8000/docs", timeout=5)
    if response.status_code == 200:
        sys.exit(0)  # Healthy
    else:
        sys.exit(1)  # Unhealthy
except:
    sys.exit(1)  # Unhealthy