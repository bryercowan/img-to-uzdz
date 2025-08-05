import cv2
import numpy as np
from PIL import Image
import requests
from typing import List, Dict, Any
from decimal import Decimal
from models import ImageRef
from settings import Settings

settings = Settings()

def calculate_laplacian_variance(image_array: np.ndarray) -> float:
    """Calculate Laplacian variance to detect blur"""
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def analyze_background_coverage(image_array: np.ndarray) -> float:
    """Estimate background vs subject coverage ratio"""
    # Simple edge detection approach
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Calculate edge density as proxy for subject coverage
    edge_pixels = np.sum(edges > 0)
    total_pixels = edges.shape[0] * edges.shape[1]
    
    return edge_pixels / total_pixels

def validate_single_image(image_url: str) -> Dict[str, Any]:
    """Validate a single image for 3D reconstruction suitability"""
    try:
        # Download image
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # Load image
        image = Image.open(response.content)
        image_array = np.array(image.convert('RGB'))
        
        height, width = image_array.shape[:2]
        file_size = len(response.content)
        
        # Validation checks
        errors = []
        warnings = []
        
        # Size checks
        if width < 512 or height < 512:
            errors.append(f"Image too small: {width}x{height}. Minimum 512x512 required.")
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            errors.append(f"Image too large: {file_size/1024/1024:.1f}MB. Maximum 10MB allowed.")
        
        # Blur detection
        blur_score = calculate_laplacian_variance(image_array)
        if blur_score < 100:  # Threshold for blur detection
            warnings.append(f"Image appears blurry (score: {blur_score:.1f})")
        
        # Background coverage
        coverage = analyze_background_coverage(image_array)
        if coverage < 0.1:  # Very low edge density
            warnings.append("Image may lack sufficient detail for 3D reconstruction")
        
        return {
            "valid": len(errors) == 0,
            "width": width,
            "height": height,
            "file_size": file_size,
            "blur_metric": blur_score,
            "coverage_score": coverage,
            "errors": errors,
            "warnings": warnings
        }
        
    except requests.RequestException as e:
        return {
            "valid": False,
            "errors": [f"Failed to download image: {str(e)}"],
            "warnings": []
        }
    except Exception as e:
        return {
            "valid": False,
            "errors": [f"Failed to process image: {str(e)}"],
            "warnings": []
        }

def validate_images_for_preview(images: List[ImageRef]) -> Dict[str, Any]:
    """Validate multiple images for 3D reconstruction"""
    
    if len(images) < 3:
        return {
            "ok": False,
            "errors": ["Minimum 3 images required for 3D reconstruction"]
        }
    
    if len(images) > 30:
        return {
            "ok": False,
            "errors": ["Maximum 30 images allowed"]
        }
    
    all_errors = []
    all_warnings = []
    valid_images = 0
    
    for i, image in enumerate(images):
        result = validate_single_image(image.url)
        
        if result["valid"]:
            valid_images += 1
        
        # Add image index to errors/warnings
        for error in result.get("errors", []):
            all_errors.append(f"Image {i+1}: {error}")
        
        for warning in result.get("warnings", []):
            all_warnings.append(f"Image {i+1}: {warning}")
    
    # Overall validation
    if valid_images < 3:
        all_errors.append(f"Only {valid_images} valid images found. Need at least 3.")
    
    # Coverage diversity check (simplified)
    if valid_images < len(images) * 0.8:  # 80% should be valid
        all_warnings.append("Some images may be unsuitable for 3D reconstruction")
    
    return {
        "ok": len(all_errors) == 0,
        "errors": all_errors,
        "warnings": all_warnings,
        "valid_image_count": valid_images,
        "total_image_count": len(images)
    }

def estimate_job_cost(quality: str, target_formats: List[str]) -> Dict[str, Any]:
    """Estimate cost and processing time for a job"""
    
    # Base credits by quality
    base_credits = {
        "fast": Decimal(str(settings.CREDITS_FAST_JOB)),
        "high": Decimal(str(settings.CREDITS_HIGH_JOB))
    }
    
    credits = base_credits.get(quality, base_credits["fast"])
    
    # Format multipliers
    format_multiplier = 1.0
    if "usdz" in target_formats and settings.FEATURE_USDZ:
        format_multiplier = 1.2  # 20% extra for USDZ conversion
    
    credits = credits * Decimal(str(format_multiplier))
    
    # Estimate processing time (in minutes)
    base_minutes = {
        "fast": 5,
        "high": 15
    }
    
    minutes = base_minutes.get(quality, base_minutes["fast"])
    if "usdz" in target_formats:
        minutes += 2  # Extra time for USDZ conversion
    
    return {
        "credits": credits,
        "minutes": minutes,
        "quality": quality,
        "formats": target_formats
    }