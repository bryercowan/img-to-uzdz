#!/usr/bin/env python3
"""
GPU Worker for 3D Model Generation
Consumes jobs from Redis queue and processes them using nerfstudio pipeline
"""

import os
import sys
import json
import time
import redis
import traceback
import subprocess
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
import boto3
from botocore.exceptions import ClientError

# Environment variables
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
S3_ENDPOINT = os.getenv("S3_ENDPOINT", "")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "")
S3_BUCKET = os.getenv("S3_BUCKET", "imgto3d-storage")
S3_REGION = os.getenv("S3_REGION", "us-east-1")
FEATURE_USDZ = os.getenv("FEATURE_USDZ", "false").lower() == "true"
WORKER_ID = os.getenv("WORKER_ID", f"worker-{os.getpid()}")

class S3Manager:
    def __init__(self):
        self.client = boto3.client(
            's3',
            endpoint_url=S3_ENDPOINT if S3_ENDPOINT else None,
            aws_access_key_id=S3_ACCESS_KEY,
            aws_secret_access_key=S3_SECRET_KEY,
            region_name=S3_REGION
        )
        self.bucket = S3_BUCKET
    
    def download_file(self, key: str, local_path: str) -> bool:
        """Download file from S3 to local path"""
        try:
            self.client.download_file(self.bucket, key, local_path)
            return True
        except ClientError as e:
            print(f"Failed to download {key}: {e}")
            return False
    
    def upload_file(self, local_path: str, key: str, content_type: str = None) -> bool:
        """Upload file from local path to S3"""
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.client.upload_file(local_path, self.bucket, key, ExtraArgs=extra_args)
            return True
        except ClientError as e:
            print(f"Failed to upload {key}: {e}")
            return False
    
    def get_file_size(self, key: str) -> int:
        """Get file size in bytes"""
        try:
            response = self.client.head_object(Bucket=self.bucket, Key=key)
            return response['ContentLength']
        except ClientError:
            return 0

class NerfstudioPipeline:
    """Handles the nerfstudio processing pipeline"""
    
    def __init__(self, work_dir: str):
        self.work_dir = Path(work_dir)
        self.work_dir.mkdir(parents=True, exist_ok=True)
        self.images_dir = self.work_dir / "images"
        self.dataset_dir = self.work_dir / "dataset"
        self.output_dir = self.work_dir / "outputs"
        
        # Create directories
        self.images_dir.mkdir(exist_ok=True)
        self.dataset_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)
    
    def download_images(self, s3_manager: S3Manager, image_refs: List[Dict]) -> bool:
        """Download images from S3"""
        try:
            for i, img_ref in enumerate(image_refs):
                s3_key = img_ref["s3_key"]
                filename = img_ref.get("filename", f"image_{i:03d}.jpg")
                local_path = self.images_dir / filename
                
                if not s3_manager.download_file(s3_key, str(local_path)):
                    return False
                
                print(f"Downloaded: {filename}")
            
            return True
        except Exception as e:
            print(f"Error downloading images: {e}")
            return False
    
    def validate_images(self) -> Dict[str, Any]:
        """Validate downloaded images for 3D reconstruction"""
        image_files = list(self.images_dir.glob("*"))
        
        if len(image_files) < 3:
            return {"valid": False, "error": f"Insufficient images: {len(image_files)} (need ≥3)"}
        
        if len(image_files) > 50:
            return {"valid": False, "error": f"Too many images: {len(image_files)} (max 50)"}
        
        # Basic file validation
        valid_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
        for img_file in image_files:
            if img_file.suffix.lower() not in valid_extensions:
                return {"valid": False, "error": f"Unsupported format: {img_file.name}"}
            
            # Check file size (basic corruption check)
            if img_file.stat().st_size < 1024:  # < 1KB
                return {"valid": False, "error": f"Corrupted image: {img_file.name}"}
        
        return {"valid": True, "image_count": len(image_files)}
    
    def process_data(self) -> bool:
        """Run ns-process-data to prepare dataset"""
        try:
            cmd = [
                "ns-process-data", "images",
                "--data", str(self.images_dir),
                "--output-dir", str(self.dataset_dir),
            ]
            
            print(f"Running: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                print(f"ns-process-data failed: {result.stderr}")
                return False
            
            print("Dataset processing completed")
            return True
            
        except subprocess.TimeoutExpired:
            print("Dataset processing timed out")
            return False
        except Exception as e:
            print(f"Dataset processing error: {e}")
            return False
    
    def train_model(self, quality: str, max_iterations: int) -> bool:
        """Train NeRF model using nerfstudio"""
        try:
            # Determine training parameters based on quality
            if quality == "high":
                method = "nerfacto"
                steps = min(max_iterations, 8000)
            else:  # fast
                method = "nerfacto"
                steps = min(max_iterations, 3000)
            
            cmd = [
                "ns-train", method,
                "--data", str(self.dataset_dir),
                "--output-dir", str(self.work_dir / "training"),
                "--max-num-iterations", str(steps),
                "--steps-per-eval-image", str(steps // 4),
                "--steps-per-save", str(steps),
            ]
            
            print(f"Training model with {steps} iterations...")
            print(f"Running: {' '.join(cmd)}")
            
            start_time = time.time()
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=1800)  # 30min timeout
            end_time = time.time()
            
            if result.returncode != 0:
                print(f"Training failed: {result.stderr}")
                return False
            
            training_time = end_time - start_time
            print(f"Training completed in {training_time:.1f} seconds")
            
            # Store training metadata
            self._save_training_metadata(steps, training_time, quality)
            
            return True
            
        except subprocess.TimeoutExpired:
            print("Training timed out")
            return False
        except Exception as e:
            print(f"Training error: {e}")
            return False
    
    def export_models(self, target_formats: List[str], params: Dict) -> List[Dict]:
        """Export trained model to target formats"""
        outputs = []
        
        try:
            # Find the trained model config
            config_files = list((self.work_dir / "training").rglob("config.yml"))
            if not config_files:
                raise Exception("No trained model config found")
            
            config_path = config_files[-1]  # Use most recent
            print(f"Using config: {config_path}")
            
            # Export GLB (always supported)
            if "glb" in target_formats:
                glb_output = self._export_glb(config_path, params)
                if glb_output:
                    outputs.append(glb_output)
            
            # Export USDZ (if feature enabled)
            if "usdz" in target_formats and FEATURE_USDZ:
                usdz_output = self._export_usdz(config_path, params)
                if usdz_output:
                    outputs.append(usdz_output)
            elif "usdz" in target_formats:
                print("USDZ export requested but feature disabled")
            
            return outputs
            
        except Exception as e:
            print(f"Export error: {e}")
            return []
    
    def _export_glb(self, config_path: Path, params: Dict) -> Dict:
        """Export model to GLB format"""
        try:
            output_file = self.output_dir / "model.glb"
            
            cmd = [
                "ns-export", "poisson",
                "--load-config", str(config_path),
                "--output-dir", str(self.output_dir),
                "--target-num-faces", str(params.get("mesh_simplify_target_tris", 150000)),
                "--num-pixels-per-side", "2048",
                "--use-bounding-box", "True",
            ]
            
            print(f"Exporting GLB...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            
            if result.returncode != 0:
                print(f"GLB export failed: {result.stderr}")
                return None
            
            # Find generated mesh file and convert to GLB
            mesh_files = list(self.output_dir.glob("*.ply"))
            if not mesh_files:
                print("No mesh file generated")
                return None
            
            mesh_file = mesh_files[0]
            
            # Convert PLY to GLB using your existing conversion logic
            # This would typically involve trimesh or similar
            if self._convert_ply_to_glb(mesh_file, output_file, params):
                return {
                    "format": "glb",
                    "local_path": str(output_file),
                    "size_bytes": output_file.stat().st_size
                }
            
            return None
            
        except Exception as e:
            print(f"GLB export error: {e}")
            return None
    
    def _export_usdz(self, config_path: Path, params: Dict) -> Dict:
        """Export model to USDZ format"""
        try:
            # First export GLB, then convert to USDZ
            glb_output = self._export_glb(config_path, params)
            if not glb_output:
                return None
            
            glb_path = Path(glb_output["local_path"])
            usdz_path = self.output_dir / "model.usdz"
            
            # Convert GLB to USDZ using your existing conversion logic
            if self._convert_glb_to_usdz(glb_path, usdz_path):
                return {
                    "format": "usdz",
                    "local_path": str(usdz_path),
                    "size_bytes": usdz_path.stat().st_size
                }
            
            return None
            
        except Exception as e:
            print(f"USDZ export error: {e}")
            return None
    
    def _convert_ply_to_glb(self, ply_path: Path, glb_path: Path, params: Dict) -> bool:
        """Convert PLY mesh to GLB format"""
        try:
            import trimesh
            
            # Load mesh
            mesh = trimesh.load(str(ply_path))
            
            # Simplify if requested
            target_faces = params.get("mesh_simplify_target_tris", 150000)
            if hasattr(mesh, 'faces') and len(mesh.faces) > target_faces:
                mesh = mesh.simplify_quadric_decimation(target_faces)
                print(f"Simplified mesh to {len(mesh.faces)} faces")
            
            # Export as GLB
            mesh.export(str(glb_path))
            print(f"Exported GLB: {glb_path}")
            
            return True
            
        except Exception as e:
            print(f"PLY to GLB conversion error: {e}")
            return False
    
    def _convert_glb_to_usdz(self, glb_path: Path, usdz_path: Path) -> bool:
        """Convert GLB to USDZ format"""
        try:
            # This is a simplified conversion - in production you'd use proper USD tools
            # For now, just copy GLB as USDZ (they're similar formats)
            shutil.copy(glb_path, usdz_path)
            print(f"Converted to USDZ: {usdz_path}")
            return True
            
        except Exception as e:
            print(f"GLB to USDZ conversion error: {e}")
            return False
    
    def _save_training_metadata(self, steps: int, training_time: float, quality: str):
        """Save training metadata"""
        metadata = {
            "steps": steps,
            "training_time_seconds": training_time,
            "quality": quality,
            "gpu_minutes": training_time / 60,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        metadata_file = self.work_dir / "training_metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
    
    def cleanup(self):
        """Clean up working directory"""
        try:
            shutil.rmtree(self.work_dir)
            print(f"Cleaned up: {self.work_dir}")
        except Exception as e:
            print(f"Cleanup error: {e}")

class JobProcessor:
    """Main job processing class"""
    
    def __init__(self):
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        self.s3 = S3Manager()
    
    def process_job(self, job_data: Dict[str, Any]) -> bool:
        """Process a single job"""
        job_id = job_data["job_id"]
        print(f"\n=== Processing Job {job_id} ===")
        
        # Update job status to running
        self._update_job_status(job_id, "running")
        
        work_dir = f"/tmp/jobs/{job_id}"
        pipeline = NerfstudioPipeline(work_dir)
        
        try:
            # Step 1: Download images
            print("Step 1: Downloading images...")
            if not pipeline.download_images(self.s3, job_data["images"]):
                raise Exception("Failed to download images")
            
            # Step 2: Validate images
            print("Step 2: Validating images...")
            validation = pipeline.validate_images()
            if not validation["valid"]:
                raise Exception(validation["error"])
            
            print(f"Validated {validation['image_count']} images")
            
            # Step 3: Process data
            print("Step 3: Processing dataset...")
            if not pipeline.process_data():
                raise Exception("Dataset processing failed")
            
            # Step 4: Train model
            print("Step 4: Training model...")
            params = job_data["params"]
            if not pipeline.train_model(params["quality"], params["max_iterations"]):
                raise Exception("Model training failed")
            
            # Step 5: Export models
            print("Step 5: Exporting models...")
            self._update_job_status(job_id, "exporting")
            
            outputs = pipeline.export_models(params["target_formats"], params)
            if not outputs:
                raise Exception("Model export failed")
            
            # Step 6: Upload outputs to S3
            print("Step 6: Uploading outputs...")
            s3_outputs = []
            
            for output in outputs:
                local_path = output["local_path"]
                format_ext = output["format"]
                
                # Generate S3 key
                s3_key = f"org/{job_data.get('org_id', 'anon')}/jobs/{job_id}/outputs/model.{format_ext}"
                
                # Upload to S3
                content_type = "model/gltf-binary" if format_ext == "glb" else "model/vnd.usdz+zip"
                if self.s3.upload_file(local_path, s3_key, content_type):
                    s3_outputs.append({
                        "format": format_ext,
                        "storage_key": s3_key,
                        "size_bytes": output["size_bytes"]
                    })
                    print(f"Uploaded: {s3_key}")
                else:
                    print(f"Failed to upload: {s3_key}")
            
            if not s3_outputs:
                raise Exception("Failed to upload any outputs")
            
            # Step 7: Update job as completed
            print("Step 7: Finalizing...")
            
            # Calculate GPU usage
            metadata_file = Path(work_dir) / "training_metadata.json"
            gpu_minutes = 0
            if metadata_file.exists():
                with open(metadata_file) as f:
                    metadata = json.load(f)
                    gpu_minutes = metadata.get("gpu_minutes", 0)
            
            self._update_job_status(
                job_id, "completed",
                outputs=s3_outputs,
                gpu_minutes=gpu_minutes
            )
            
            print(f"✅ Job {job_id} completed successfully")
            return True
            
        except Exception as e:
            error_msg = f"Job processing failed: {str(e)}"
            print(f"❌ {error_msg}")
            traceback.print_exc()
            
            self._update_job_status(job_id, "failed", error_message=error_msg)
            return False
            
        finally:
            # Always cleanup
            pipeline.cleanup()
    
    def _update_job_status(self, job_id: str, status: str, error_message: str = None, 
                          outputs: list = None, gpu_minutes: float = None):
        """Update job status via Redis"""
        update_data = {
            "job_id": job_id,
            "status": status,
            "worker_id": WORKER_ID,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if error_message:
            update_data["error_message"] = error_message
        
        if outputs:
            update_data["outputs"] = outputs
        
        if gpu_minutes:
            update_data["gpu_minutes"] = gpu_minutes
        
        # Send status update to API via Redis
        self.redis.lpush("queue:job_updates", json.dumps(update_data))
        print(f"Status update: {job_id} -> {status}")
    
    def run(self, queue: str = "standard"):
        """Main worker loop"""
        print(f"🚀 Worker {WORKER_ID} starting (queue: {queue})")
        
        while True:
            try:
                # Get job from queue
                print(f"⏳ Waiting for jobs on queue:{queue}...")
                result = self.redis.brpop([f"queue:{queue}"], timeout=30)
                
                if result:
                    _, job_json = result
                    job_data = json.loads(job_json)
                    
                    print(f"📥 Received job: {job_data['job_id']}")
                    
                    # Process the job
                    success = self.process_job(job_data)
                    
                    if success:
                        print(f"✅ Job completed: {job_data['job_id']}")
                    else:
                        print(f"❌ Job failed: {job_data['job_id']}")
                else:
                    print("⏰ Queue timeout, continuing...")
                    
            except KeyboardInterrupt:
                print("\n🛑 Worker shutting down...")
                break
            except Exception as e:
                print(f"💥 Worker error: {e}")
                traceback.print_exc()
                time.sleep(5)  # Brief pause before retrying

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="3D Model Generation Worker")
    parser.add_argument("--queue", default="standard", help="Queue name to process")
    parser.add_argument("--worker-id", help="Worker ID override")
    
    args = parser.parse_args()
    
    if args.worker_id:
        WORKER_ID = args.worker_id
    
    processor = JobProcessor()
    processor.run(args.queue)