import runpod
import boto3
import os
import tempfile
import subprocess
import shutil
import json
import logging
from pathlib import Path
import zipfile
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# S3/R2 Configuration
s3_client = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
    aws_access_key_id=os.environ["S3_ACCESS_KEY"],
    aws_secret_access_key=os.environ["S3_SECRET_KEY"],
    region_name=os.environ.get("S3_REGION", "auto"),
)
BUCKET = os.environ["S3_BUCKET"]

def download_images_from_s3(job_id: str, account: str = "anon") -> str:
    """Download all images for a job from S3 to a temporary directory"""
    temp_dir = tempfile.mkdtemp()
    prefix = f"raw/{account}/{job_id}/"
    
    logger.info(f"Downloading images from S3 with prefix: {prefix}")
    
    response = s3_client.list_objects_v2(Bucket=BUCKET, Prefix=prefix)
    
    if 'Contents' not in response:
        raise ValueError(f"No images found for job {job_id}")
    
    image_count = 0
    for obj in response['Contents']:
        if obj['Key'].endswith(('.jpg', '.jpeg', '.png', '.webp')):
            local_path = os.path.join(temp_dir, os.path.basename(obj['Key']))
            s3_client.download_file(BUCKET, obj['Key'], local_path)
            image_count += 1
            logger.info(f"Downloaded: {obj['Key']} -> {local_path}")
    
    logger.info(f"Downloaded {image_count} images to {temp_dir}")
    return temp_dir

def setup_nerfstudio_project(images_dir: str) -> str:
    """Setup nerfstudio project with COLMAP processing"""
    project_dir = tempfile.mkdtemp()
    logger.info(f"Setting up nerfstudio project in {project_dir}")
    
    # Create nerfstudio data directory structure
    data_dir = os.path.join(project_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    # Copy images to data directory
    images_output = os.path.join(data_dir, "images")
    shutil.copytree(images_dir, images_output)
    
    # Run COLMAP feature extraction and matching
    logger.info("Running COLMAP processing...")
    
    # COLMAP automatic reconstruction
    cmd = [
        "colmap", "automatic_reconstructor",
        "--workspace_path", data_dir,
        "--image_path", images_output,
        "--camera_model", "OPENCV"
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        logger.info("COLMAP processing completed successfully")
    except subprocess.CalledProcessError as e:
        logger.error(f"COLMAP failed: {e.stderr}")
        # Fallback: use simpler COLMAP processing
        logger.info("Attempting simplified COLMAP processing...")
        
        sparse_dir = os.path.join(data_dir, "sparse")
        os.makedirs(sparse_dir, exist_ok=True)
        
        # Feature extraction
        subprocess.run([
            "colmap", "feature_extractor",
            "--database_path", os.path.join(data_dir, "database.db"),
            "--image_path", images_output
        ], check=True)
        
        # Feature matching
        subprocess.run([
            "colmap", "exhaustive_matcher",
            "--database_path", os.path.join(data_dir, "database.db")
        ], check=True)
        
        # Bundle adjustment
        subprocess.run([
            "colmap", "mapper",
            "--database_path", os.path.join(data_dir, "database.db"),
            "--image_path", images_output,
            "--output_path", sparse_dir
        ], check=True)
    
    return project_dir

def train_nerf_model(project_dir: str, preview_mode: bool = True) -> str:
    """Train NeRF model using nerfstudio"""
    logger.info("Starting NeRF training...")
    
    data_dir = os.path.join(project_dir, "data")
    output_dir = os.path.join(project_dir, "outputs")
    
    # Convert COLMAP data to nerfstudio format
    cmd = [
        "ns-process-data",
        "colmap",
        "--data", data_dir,
        "--output-dir", data_dir
    ]
    
    subprocess.run(cmd, check=True)
    
    # Train with nerfacto (fast preview mode)
    train_cmd = [
        "ns-train", "nerfacto",
        "--data", data_dir,
        "--output-dir", output_dir
    ]
    
    if preview_mode:
        # Fast preview settings
        train_cmd.extend([
            "--max-num-iterations", "1000",  # Reduced iterations for preview
            "--steps-per-eval-image", "200",
            "--steps-per-save", "500"
        ])
    
    logger.info(f"Running: {' '.join(train_cmd)}")
    subprocess.run(train_cmd, check=True)
    
    return output_dir

def export_model(output_dir: str, preview_token: str) -> str:
    """Export trained NeRF to GLB format using nerfstudio"""
    logger.info("Exporting NeRF model to GLB...")
    
    # Find the latest experiment
    experiments = [d for d in os.listdir(output_dir) if d.startswith('nerfacto')]
    if not experiments:
        raise ValueError("No NeRF experiments found")
    
    latest_exp = sorted(experiments)[-1]
    config_path = os.path.join(output_dir, latest_exp, "config.yml")
    export_dir = os.path.join(output_dir, "exports")
    os.makedirs(export_dir, exist_ok=True)
    
    logger.info(f"Using config: {config_path}")
    
    # Export to mesh using nerfstudio's poisson export
    try:
        poisson_cmd = [
            "ns-export", "poisson",
            "--load-config", config_path,
            "--output-dir", export_dir,
            "--target-num-faces", "50000",  # Reduced for preview
            "--num-pixels-per-side", "2048",
            "--use-bounding-box", "True",
            "--bounding-box-min", "-1", "-1", "-1",
            "--bounding-box-max", "1", "1", "1"
        ]
        
        logger.info(f"Running poisson export: {' '.join(poisson_cmd)}")
        subprocess.run(poisson_cmd, check=True, capture_output=True, text=True)
        
        # Look for the exported PLY file
        ply_files = [f for f in os.listdir(export_dir) if f.endswith('.ply')]
        if not ply_files:
            raise ValueError("No PLY file generated by poisson export")
        
        ply_path = os.path.join(export_dir, ply_files[0])
        logger.info(f"Generated PLY: {ply_path}")
        
        # Convert PLY to GLB using Open3D
        glb_output = os.path.join(export_dir, f"{preview_token}.glb")
        
        import open3d as o3d
        
        # Load the PLY mesh
        mesh = o3d.io.read_triangle_mesh(ply_path)
        
        if len(mesh.vertices) == 0:
            raise ValueError("Empty mesh loaded from PLY")
        
        logger.info(f"Loaded mesh with {len(mesh.vertices)} vertices and {len(mesh.triangles)} triangles")
        
        # Basic mesh cleanup
        mesh.remove_duplicated_vertices()
        mesh.remove_degenerate_triangles()
        mesh.remove_unreferenced_vertices()
        
        # Ensure mesh has vertex normals
        if not mesh.has_vertex_normals():
            mesh.compute_vertex_normals()
        
        # Export to GLB
        success = o3d.io.write_triangle_mesh(glb_output, mesh)
        
        if not success:
            raise ValueError("Failed to write GLB file")
        
        logger.info(f"Successfully exported GLB: {glb_output}")
        return glb_output
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Poisson export failed: {e.stderr}")
        raise ValueError(f"Mesh export failed: {e.stderr}")
    except Exception as e:
        logger.error(f"Export process failed: {e}")
        raise

def upload_model_to_s3(model_path: str, preview_token: str) -> str:
    """Upload the generated model to S3 and return public URL"""
    model_key = f"models/{preview_token}/preview.glb"
    
    logger.info(f"Uploading model to S3: {model_key}")
    
    s3_client.upload_file(
        model_path, 
        BUCKET, 
        model_key,
        ExtraArgs={'ContentType': 'model/gltf-binary'}
    )
    
    # Return public URL
    public_url = f"https://{BUCKET}.{os.environ['S3_ENDPOINT'].split('://')[-1]}/{model_key}"
    logger.info(f"Model uploaded: {public_url}")
    
    return public_url

def handler(job):
    """Main RunPod handler function"""
    logger.info(f"Processing job: {job}")
    
    try:
        # Extract job parameters
        job_input = job['input']
        job_id = job_input.get('job_id')
        preview_token = job_input.get('preview_token')
        account = job_input.get('account', 'anon')
        
        if not job_id or not preview_token:
            return {"error": "Missing required parameters: job_id and preview_token"}
        
        logger.info(f"Processing job_id: {job_id}, preview_token: {preview_token}")
        
        # Step 1: Download images from S3
        images_dir = download_images_from_s3(job_id, account)
        
        # Step 2: Setup nerfstudio project
        project_dir = setup_nerfstudio_project(images_dir)
        
        # Step 3: Train NeRF model (preview mode)
        output_dir = train_nerf_model(project_dir, preview_mode=True)
        
        # Step 4: Export model
        model_path = export_model(output_dir, preview_token)
        
        # Step 5: Upload model to S3
        model_url = upload_model_to_s3(model_path, preview_token)
        
        # Clean up temporary directories
        shutil.rmtree(images_dir, ignore_errors=True)
        shutil.rmtree(project_dir, ignore_errors=True)
        
        logger.info(f"Job completed successfully. Model URL: {model_url}")
        
        return {
            "status": "completed",
            "preview_url": model_url,
            "preview_data": {
                "outputs": [
                    {
                        "format": "glb",
                        "url": model_url,
                        "size_bytes": os.path.getsize(model_path) if os.path.exists(model_path) else 1024000
                    }
                ],
                "processing_time": "preview"
            }
        }
        
    except Exception as e:
        logger.error(f"Job failed with error: {str(e)}")
        return {
            "status": "failed",
            "error": str(e)
        }

if __name__ == "__main__":
    logger.info("Starting RunPod worker...")
    runpod.serverless.start({"handler": handler})
