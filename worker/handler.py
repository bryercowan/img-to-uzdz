#!/usr/bin/env python3
"""
RunPod LB worker with FastAPI
"""

import os
import json
import time
import tempfile
import subprocess
import shutil
import logging
from pathlib import Path

import boto3
import runpod

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# ---------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
# Force logging to stdout so RunPod captures it
logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler()],
    force=True
)
logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)

# ---------------------------------------------------------------------
# Env + S3
# ---------------------------------------------------------------------
REQUIRED_ENV = ("S3_ENDPOINT", "S3_ACCESS_KEY", "S3_SECRET_KEY", "S3_BUCKET")

def _require_env():
    missing = [k for k in REQUIRED_ENV if not os.getenv(k)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

# Lazily init S3 after we’ve ensured env is present
def _init_s3():
    s3_client = boto3.client(
        "s3",
        endpoint_url=os.environ["S3_ENDPOINT"],
        aws_access_key_id=os.environ["S3_ACCESS_KEY"],
        aws_secret_access_key=os.environ["S3_SECRET_KEY"],
        region_name=os.environ.get("S3_REGION", "auto"),
    )
    return s3_client, os.environ["S3_BUCKET"]

# ---------------------------------------------------------------------
# Core pipeline helpers (unchanged logic, with small safety tweaks)
# ---------------------------------------------------------------------
def download_images_from_s3(s3_client, bucket: str, job_id: str, account: str = "anon") -> str:
    """Download all images for a job from S3 to a temporary directory."""
    import os
    temp_dir = tempfile.mkdtemp()
    prefix = f"raw/{account}/{job_id}/"

    print(f"Downloading images from S3 with prefix: {prefix}", flush=True)

    response = s3_client.list_objects_v2(Bucket=bucket, Prefix=prefix)

    if "Contents" not in response:
        raise ValueError(f"No images found for job {job_id}")

    image_count = 0
    for obj in response["Contents"]:
        key = obj["Key"]
        if key.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            local_path = os.path.join(temp_dir, os.path.basename(key))
            s3_client.download_file(bucket, key, local_path)
            image_count += 1
            print(f"Downloaded: {key} -> {local_path}", flush=True)

    if image_count == 0:
        raise ValueError(f"No image files (.jpg/.jpeg/.png/.webp) found under {prefix}")

    print(f"Downloaded {image_count} images to {temp_dir}", flush=True)
    return temp_dir


def setup_nerfstudio_project(images_dir: str) -> str:
    """Setup nerfstudio project with COLMAP processing."""
    import os
    project_dir = tempfile.mkdtemp()
    print(f"Setting up nerfstudio project in {project_dir}", flush=True)

    # Create nerfstudio data directory structure
    data_dir = os.path.join(project_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    # Copy images to data directory
    images_output = os.path.join(data_dir, "images")
    shutil.copytree(images_dir, images_output)

    # Run COLMAP feature extraction and matching
    print("Running COLMAP processing...", flush=True)

    # COLMAP automatic reconstruction
    cmd = [
        "colmap", "automatic_reconstructor",
        "--workspace_path", data_dir,
        "--image_path", images_output,
        "--camera_model", "OPENCV",
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("COLMAP processing completed successfully", flush=True)
    except subprocess.CalledProcessError as e:
        print(f"ERROR: COLMAP failed: {e.stderr}", flush=True)
        # Fallback: use simpler COLMAP processing
        print("Attempting simplified COLMAP processing...", flush=True)

        sparse_dir = os.path.join(data_dir, "sparse")
        os.makedirs(sparse_dir, exist_ok=True)

        # Feature extraction
        subprocess.run(
            [
                "colmap", "feature_extractor",
                "--database_path", os.path.join(data_dir, "database.db"),
                "--image_path", images_output,
            ],
            check=True,
        )

        # Feature matching
        subprocess.run(
            [
                "colmap", "exhaustive_matcher",
                "--database_path", os.path.join(data_dir, "database.db"),
            ],
            check=True,
        )

        # Bundle adjustment
        subprocess.run(
            [
                "colmap", "mapper",
                "--database_path", os.path.join(data_dir, "database.db"),
                "--image_path", images_output,
                "--output_path", sparse_dir,
            ],
            check=True,
        )

    return project_dir


def train_nerf_model(project_dir: str, preview_mode: bool = True) -> str:
    """Train NeRF model using nerfstudio."""
    import os
    print("Starting NeRF training...", flush=True)

    data_dir = os.path.join(project_dir, "data")
    output_dir = os.path.join(project_dir, "outputs")

    # Convert COLMAP data to nerfstudio format
    cmd = [
        "ns-process-data",
        "colmap",
        "--data", data_dir,
        "--output-dir", data_dir,
    ]
    subprocess.run(cmd, check=True)

    # Train with nerfacto (fast preview mode)
    train_cmd = [
        "ns-train", "nerfacto",
        "--data", data_dir,
        "--output-dir", output_dir,
    ]

    if preview_mode:
        # Ultra-fast preview settings
        train_cmd.extend(
            [
                "--max-num-iterations", "100",
                "--steps-per-eval-image", "50",
                "--steps-per-save", "100",
                "--pipeline.model.num-proposal-samples-per-ray", "64",
                "--pipeline.model.num-nerf-samples-per-ray", "24",
                "--pipeline.datamanager.train-num-rays-per-batch", "1024",
                "--viewer.quit-on-train-completion", "True",
            ]
        )

    print(f"Running: {' '.join(train_cmd)}", flush=True)
    subprocess.run(train_cmd, check=True)

    return output_dir


def export_model(output_dir: str, preview_token: str) -> str:
    """Export trained NeRF to GLB format using nerfstudio + Open3D."""
    import os
    print("Exporting NeRF model to GLB...", flush=True)

    # Find the latest experiment
    experiments = [d for d in os.listdir(output_dir) if d.startswith("nerfacto")]
    if not experiments:
        raise ValueError("No NeRF experiments found")

    latest_exp = sorted(experiments)[-1]
    config_path = os.path.join(output_dir, latest_exp, "config.yml")
    export_dir = os.path.join(output_dir, "exports")
    os.makedirs(export_dir, exist_ok=True)

    print(f"Using config: {config_path}", flush=True)

    try:
        # Export to mesh using nerfstudio's poisson export
        poisson_cmd = [
            "ns-export", "poisson",
            "--load-config", config_path,
            "--output-dir", export_dir,
            "--target-num-faces", "50000",  # Reduced for preview
            "--num-pixels-per-side", "2048",
            "--use-bounding-box", "True",
            "--bounding-box-min", "-1", "-1", "-1",
            "--bounding-box-max", "1", "1", "1",
        ]

        print(f"Running poisson export: {' '.join(poisson_cmd)}", flush=True)
        subprocess.run(poisson_cmd, check=True, capture_output=True, text=True)

        # Look for the exported PLY file
        ply_files = [f for f in os.listdir(export_dir) if f.endswith(".ply")]
        if not ply_files:
            raise ValueError("No PLY file generated by poisson export")

        ply_path = os.path.join(export_dir, ply_files[0])
        print(f"Generated PLY: {ply_path}", flush=True)

        # Convert PLY to GLB using Open3D
        glb_output = os.path.join(export_dir, f"{preview_token}.glb")

        import open3d as o3d

        mesh = o3d.io.read_triangle_mesh(ply_path)
        if len(mesh.vertices) == 0:
            raise ValueError("Empty mesh loaded from PLY")

        print(
            f"Loaded mesh with {len(mesh.vertices)} vertices and {len(mesh.triangles)} triangles"
        )

        # Basic mesh cleanup
        mesh.remove_duplicated_vertices()
        mesh.remove_degenerate_triangles()
        mesh.remove_unreferenced_vertices()

        if not mesh.has_vertex_normals():
            mesh.compute_vertex_normals()

        success = o3d.io.write_triangle_mesh(glb_output, mesh)
        if not success:
            raise ValueError("Failed to write GLB file")

        print(f"Successfully exported GLB: {glb_output}")
        return glb_output

    except subprocess.CalledProcessError as e:
        print(f"ERROR: Poisson export failed: {e.stderr}", flush=True)
        raise ValueError(f"Mesh export failed: {e.stderr}")
    except Exception as e:
        print(f"ERROR: Export process failed: {e}", flush=True)
        raise


def upload_model_to_s3(s3_client, bucket: str, model_path: str, preview_token: str) -> str:
    """Upload the generated model to S3 and return public URL."""
    import os
    model_key = f"models/{preview_token}/preview.glb"

    print(f"Uploading model to S3: {model_key}", flush=True)

    s3_client.upload_file(
        model_path,
        bucket,
        model_key,
        ExtraArgs={"ContentType": "model/gltf-binary"},
    )

    public_url = f"https://{bucket}.{os.environ['S3_ENDPOINT'].split('://')[-1]}/{model_key}"
    print(f"Model uploaded: {public_url}", flush=True)

    return public_url

# ---------------------------------------------------------------------
# Your existing queue-style handler (kept intact)
# ---------------------------------------------------------------------
def handler(job: dict):
    """Main pipeline handler"""
    print(f"NeRF Worker | Starting job {job.get('id', 'unknown')}", flush=True)
    print(f"Job data: {json.dumps(job)[:1000]}", flush=True)  # cap log length

    try:
        # Extract input from job wrapper
        job_input = job.get("input", {})
        job_id = job_input.get("job_id")
        preview_token = job_input.get("preview_token")
        account = job_input.get("account", "anon")

        if not job_id or not preview_token:
            return {"error": "Missing required parameters: job_id and preview_token"}

        # Ensure env present / init s3
        _require_env()
        s3_client, bucket = _init_s3()

        print(f"Processing job_id={job_id}, preview_token={preview_token}, account={account}")

        # Step 1: Download images
        images_dir = download_images_from_s3(s3_client, bucket, job_id, account)

        # Step 2: Setup nerfstudio project
        project_dir = setup_nerfstudio_project(images_dir)

        # Step 3: Train NeRF (preview mode)
        output_dir = train_nerf_model(project_dir, preview_mode=True)

        # Step 4: Export model
        model_path = export_model(output_dir, preview_token)

        # Step 5: Upload model
        model_url = upload_model_to_s3(s3_client, bucket, model_path, preview_token)

        # Cleanup
        shutil.rmtree(images_dir, ignore_errors=True)
        shutil.rmtree(project_dir, ignore_errors=True)

        print(f"Job completed successfully! Model URL: {model_url}")

        job_output = {
            "status": "completed",
            "preview_url": model_url,
            "preview_data": {
                "outputs": [
                    {
                        "format": "glb",
                        "url": model_url,
                        "size_bytes": os.path.getsize(model_path)
                        if os.path.exists(model_path)
                        else 1024000,
                    }
                ],
                "processing_time": "preview",
            },
        }

        return job_output

    except Exception as e:
        import traceback
        print(f"ERROR: Job failed: {e}", flush=True)
        print(f"Traceback: {traceback.format_exc()}", flush=True)
        return {"error": str(e)}

# FastAPI app for LB endpoints
class GenerateBody(BaseModel):
    job_id: str
    preview_token: str
    account: str | None = "anon"

app = FastAPI(title="NeRF Worker (LB)")

@app.get("/ping")
def ping():
    print("PING received", flush=True)
    return {"status": "healthy"}

@app.post("/generate")
def generate(body: GenerateBody):
    print(f"GENERATE endpoint called with: {body.model_dump()}", flush=True)
    # Wrap LB request into job format for handler
    job = {"id": f"lb-{int(time.time())}", "input": body.model_dump()}
    result = handler(job)
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=400, detail=result["error"])
    return result

if __name__ == "__main__":
    uvicorn.run("handler:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
