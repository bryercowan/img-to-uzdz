import csv
import json
import zipfile
import tempfile
import requests
from typing import List, Dict, Any
from pathlib import Path
from sqlalchemy.orm import Session
from database import Batch, Job, JobImage
from models import JobParams, ImageRef
from storage import S3StorageManager
from queue import job_queue
import uuid

class BatchProcessor:
    """Handles batch job creation from various sources"""
    
    def __init__(self):
        self.storage = S3StorageManager()
    
    def process_batch(self, batch_id: str, source_type: str, source_url: str, 
                     params: JobParams, org_id: str, db: Session) -> Dict[str, Any]:
        """Process a batch from the given source"""
        
        try:
            if source_type == "csv":
                return self._process_csv_batch(batch_id, source_url, params, org_id, db)
            elif source_type == "manifest":
                return self._process_manifest_batch(batch_id, source_url, params, org_id, db)
            elif source_type == "zip":
                return self._process_zip_batch(batch_id, source_url, params, org_id, db)
            else:
                return {"success": False, "error": f"Unsupported source type: {source_type}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _process_csv_batch(self, batch_id: str, csv_url: str, params: JobParams, 
                          org_id: str, db: Session) -> Dict[str, Any]:
        """Process batch from CSV file"""
        
        # Download CSV
        response = requests.get(csv_url, timeout=30)
        response.raise_for_status()
        
        # Parse CSV
        csv_content = response.text
        csv_reader = csv.DictReader(csv_content.splitlines())
        
        jobs_created = []
        errors = []
        
        for row_num, row in enumerate(csv_reader, 1):
            try:
                # Expected CSV format: name, image1_url, image2_url, image3_url, ...
                job_name = row.get("name", f"batch_job_{row_num}")
                
                # Collect image URLs
                images = []
                for col_name, col_value in row.items():
                    if col_name.startswith("image") and col_value.strip():
                        images.append(ImageRef(
                            url=col_value.strip(),
                            filename=f"{job_name}_image_{len(images)+1}.jpg"
                        ))
                
                if len(images) < 3:
                    errors.append(f"Row {row_num}: Insufficient images ({len(images)} < 3)")
                    continue
                
                # Create job
                job_id = self._create_batch_job(
                    images, params, org_id, batch_id, job_name, db
                )
                
                if job_id:
                    jobs_created.append(job_id)
                else:
                    errors.append(f"Row {row_num}: Failed to create job")
                    
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        return {
            "success": True,
            "jobs_created": len(jobs_created),
            "job_ids": jobs_created,
            "errors": errors
        }
    
    def _process_manifest_batch(self, batch_id: str, manifest_url: str, 
                               params: JobParams, org_id: str, db: Session) -> Dict[str, Any]:
        """Process batch from JSON manifest file"""
        
        # Download manifest
        response = requests.get(manifest_url, timeout=30)
        response.raise_for_status()
        
        manifest = response.json()
        
        jobs_created = []
        errors = []
        
        # Expected manifest format:
        # {
        #   "jobs": [
        #     {
        #       "name": "product1",
        #       "images": ["url1", "url2", "url3", ...]
        #     },
        #     ...
        #   ]
        # }
        
        for job_idx, job_data in enumerate(manifest.get("jobs", [])):
            try:
                job_name = job_data.get("name", f"manifest_job_{job_idx}")
                image_urls = job_data.get("images", [])
                
                if len(image_urls) < 3:
                    errors.append(f"Job {job_name}: Insufficient images ({len(image_urls)} < 3)")
                    continue
                
                # Convert to ImageRef objects
                images = []
                for i, url in enumerate(image_urls):
                    images.append(ImageRef(
                        url=url,
                        filename=f"{job_name}_image_{i+1}.jpg"
                    ))
                
                # Create job
                job_id = self._create_batch_job(
                    images, params, org_id, batch_id, job_name, db
                )
                
                if job_id:
                    jobs_created.append(job_id)
                else:
                    errors.append(f"Job {job_name}: Failed to create job")
                    
            except Exception as e:
                errors.append(f"Job {job_idx}: {str(e)}")
        
        return {
            "success": True,
            "jobs_created": len(jobs_created),
            "job_ids": jobs_created,
            "errors": errors
        }
    
    def _process_zip_batch(self, batch_id: str, zip_url: str, params: JobParams,
                          org_id: str, db: Session) -> Dict[str, Any]:
        """Process batch from ZIP file containing image folders"""
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Download ZIP
            response = requests.get(zip_url, timeout=120)
            response.raise_for_status()
            
            zip_path = Path(temp_dir) / "batch.zip"
            with open(zip_path, 'wb') as f:
                f.write(response.content)
            
            # Extract ZIP
            extract_dir = Path(temp_dir) / "extracted"
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            jobs_created = []
            errors = []
            
            # Process each subdirectory as a separate job
            for job_dir in extract_dir.iterdir():
                if not job_dir.is_dir():
                    continue
                
                try:
                    job_name = job_dir.name
                    
                    # Find image files
                    image_files = []
                    for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
                        image_files.extend(job_dir.glob(ext))
                        image_files.extend(job_dir.glob(ext.upper()))
                    
                    if len(image_files) < 3:
                        errors.append(f"Job {job_name}: Insufficient images ({len(image_files)} < 3)")
                        continue
                    
                    # Upload images to S3 and create ImageRef objects
                    images = []
                    for i, img_file in enumerate(image_files[:30]):  # Limit to 30 images
                        # Upload to S3
                        s3_key = f"org/{org_id}/batch/{batch_id}/{job_name}/image_{i+1}{img_file.suffix}"
                        
                        with open(img_file, 'rb') as f:
                            img_content = f.read()
                        
                        content_type = f"image/{img_file.suffix[1:]}"  # Remove the dot
                        if self.storage.upload_file(img_content, s3_key, content_type):
                            images.append(ImageRef(
                                url=s3_key,  # Store S3 key as URL
                                filename=img_file.name
                            ))
                    
                    if len(images) < 3:
                        errors.append(f"Job {job_name}: Failed to upload sufficient images")
                        continue
                    
                    # Create job
                    job_id = self._create_batch_job(
                        images, params, org_id, batch_id, job_name, db
                    )
                    
                    if job_id:
                        jobs_created.append(job_id)
                    else:
                        errors.append(f"Job {job_name}: Failed to create job")
                        
                except Exception as e:
                    errors.append(f"Job {job_dir.name}: {str(e)}")
            
            return {
                "success": True,
                "jobs_created": len(jobs_created),
                "job_ids": jobs_created,
                "errors": errors
            }
    
    def _create_batch_job(self, images: List[ImageRef], params: JobParams,
                         org_id: str, batch_id: str, job_name: str, 
                         db: Session) -> str:
        """Create a single job within a batch"""
        
        try:
            # Create job
            job = Job(
                org_id=org_id,
                status="queued",
                quality=params.quality,
                target_formats=params.target_formats,
                is_studio=False
            )
            db.add(job)
            db.flush()
            
            # Add images
            for img in images:
                job_image = JobImage(
                    job_id=job.id,
                    storage_key=img.url,
                    filename=img.filename
                )
                db.add(job_image)
            
            db.commit()
            
            # Queue for processing
            job_queue.enqueue_job(str(job.id), "standard")
            
            return str(job.id)
            
        except Exception as e:
            print(f"Failed to create batch job {job_name}: {e}")
            db.rollback()
            return None

# Global batch processor instance
batch_processor = BatchProcessor()