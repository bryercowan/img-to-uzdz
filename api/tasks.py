# api/tasks.py
import shutil, uuid, os
from pathlib import Path
from typing import List, Dict
from fastapi import UploadFile
from vision_service import vision_service
from usdz_generator import usdz_generator
from PIL import Image
import pillow_heif

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

# Where to stash uploads before the worker processes them
UPLOAD_ROOT = Path("/tmp/one_shot_uploads")
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def safe_name(up: UploadFile, idx: int) -> str:
    """Return a filesystem-safe filename even if UploadFile.filename is None."""
    if up.filename:
        return Path(up.filename).name          # strip any path components
    # Fallback: 0001.bin, 0002.bin, …
    return f"{idx:04d}.bin"


def save_files(files: List[UploadFile], job_id: str) -> str:
    """
    Save uploaded files into /tmp under a unique folder
    and return the absolute path as a string.
    """
    target = UPLOAD_ROOT / job_id
    target.mkdir(parents=True, exist_ok=True)

    for i, up in enumerate(files, start=1):
        dest = target / safe_name(up, i)
        with dest.open("wb") as out:
            shutil.copyfileobj(up.file, out)

    return str(target)


def validate_images(files: List[UploadFile]) -> bool:
    """
    Validate that uploaded files are valid images and within size limits
    """
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
    max_size = 10 * 1024 * 1024  # 10MB
    
    if len(files) < 3 or len(files) > 6:
        return False
    
    for file in files:
        if file.content_type not in allowed_types:
            return False
        
        # Reset file pointer to check size
        file.file.seek(0, 2)  # Seek to end
        size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if size > max_size:
            return False
    
    return True


def process_images_for_usdz(job_dir: str) -> Dict[str, any]:
    """
    Process images using Google Vision API and generate USDZ file
    """
    try:
        # Get all image files from the job directory
        image_files = []
        image_contents = []
        
        for file_path in Path(job_dir).iterdir():
            if file_path.suffix.lower() == '.heic':
                # Convert HEIC to JPG
                try:
                    from PIL import Image
                    with Image.open(file_path) as img:
                        jpg_path = file_path.with_suffix('.jpg')
                        img.convert('RGB').save(jpg_path, 'JPEG')
                        image_files.append(str(jpg_path))
                        with open(jpg_path, 'rb') as f:
                            image_contents.append(f.read())
                except Exception as e:
                    return {"error": f"Failed to convert HEIC to JPG: {str(e)}"}
            elif file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
                # Process regular image files
                image_files.append(str(file_path))
                with open(file_path, 'rb') as f:
                    image_contents.append(f.read())
        
        if not image_files:
            return {"error": "No valid image files found"}
        
        # Analyze images with Google Vision API
        vision_data = vision_service.analyze_multiple_images(image_contents)
        
        # Generate USDZ file
        usdz_filename = f"product_model_{uuid.uuid4().hex[:8]}.usdz"
        usdz_path = os.path.join(job_dir, usdz_filename)
        
        success = usdz_generator.generate_usdz(image_files, vision_data, usdz_path)
        
        if not success:
            return {"error": "Failed to generate USDZ file"}
        
        # Create AR metadata
        ar_metadata = usdz_generator.create_ar_metadata(vision_data)
        
        return {
            "success": True,
            "usdz_file": usdz_filename,
            "usdz_path": usdz_path,
            "vision_data": vision_data,
            "ar_metadata": ar_metadata,
            "file_size": os.path.getsize(usdz_path) if os.path.exists(usdz_path) else 0
        }
        
    except Exception as e:
        return {"error": f"Processing failed: {str(e)}"}
