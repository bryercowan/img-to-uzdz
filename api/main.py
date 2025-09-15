from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel, Field 
from PIL import Image
from datetime import datetime
import boto3, uuid, os, mimetypes, pillow_heif, io, requests, logging, aiohttp, asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Register HEIF/HEIC support
pillow_heif.register_heif_opener()

app = FastAPI(title="3D Model Generation API (Minimal)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

r2 = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
    aws_access_key_id=os.environ["S3_ACCESS_KEY"],
    aws_secret_access_key=os.environ["S3_SECRET_KEY"],
    region_name=os.environ.get("S3_REGION", "auto"),  # R2 ignores region
)
BUCKET = os.environ["S3_BUCKET"]

class PreReq(BaseModel):
    filenames: list[str] = Field(..., min_length=1)
    content_types: list[str] = Field(..., min_length=1)
    account: str = "anon"

# Store preview tokens and their status (in-memory for demo)
preview_store = {}

# RunPod configuration
RUNPOD_API_KEY = os.environ.get("RUNPOD_API_KEY")
RUNPOD_ENDPOINT_ID = os.environ.get("RUNPOD_ENDPOINT_ID")

def trigger_runpod_job(job_id: str, preview_token: str, account: str = "anon"):
    """Trigger RunPod LB endpoint for 3D model generation"""
    if not RUNPOD_API_KEY or not RUNPOD_ENDPOINT_ID:
        logger.warning("RunPod not configured, using simulation")
        return None
    
    # Add test mode for development
    if os.environ.get("RUNPOD_TEST_MODE") == "true":
        logger.info("Running in test mode - simulating successful job")
        return {"success": True, "job_id": job_id}
    
    try:
        # Construct the LB endpoint URL
        endpoint_url = f"https://{RUNPOD_ENDPOINT_ID}.api.runpod.ai/generate"
        
        headers = {
            "Authorization": f"Bearer {RUNPOD_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # Payload matching the FastAPI GenerateBody model
        payload = {
            "job_id": job_id,
            "preview_token": preview_token,
            "account": account
        }
        
        logger.info(f"Submitting job to RunPod LB endpoint: {endpoint_url}")
        logger.info(f"Payload: {payload}")
        
        # Send request to LB endpoint
        response = requests.post(
            endpoint_url,
            headers=headers,
            json=payload,
            timeout=300  # 5 minute timeout
        )
        
        logger.info(f"RunPod response status: {response.status_code}")
        logger.info(f"RunPod response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result_data = response.json()
            logger.info(f"RunPod job completed successfully: {result_data}")
            return {
                "success": True,
                "job_id": job_id,
                "result": result_data
            }
        else:
            error_msg = response.json() if response.headers.get('content-type') == 'application/json' else response.text
            logger.error(f"RunPod job failed with status {response.status_code}: {error_msg}")
            return {
                "success": False,
                "job_id": job_id,
                "error": error_msg
            }
        
    except requests.exceptions.Timeout:
        logger.error("RunPod request timed out after 5 minutes")
        return {"success": False, "job_id": job_id, "error": "Request timed out"}
    except Exception as e:
        logger.error(f"Failed to trigger RunPod job: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {"success": False, "job_id": job_id, "error": str(e)}

def check_runpod_status(preview_token: str):
    """Check if RunPod job result is ready (stored in preview_store)"""
    # Since LB endpoints are synchronous, we store the result immediately
    # This function checks if we have the result stored
    if preview_token in preview_store:
        preview = preview_store[preview_token]
        if "result" in preview:
            return {"status": "COMPLETED", "result": preview["result"]}
        elif preview.get("error"):
            return {"status": "FAILED", "error": preview.get("error")}
    return {"status": "PROCESSING"}

async def process_runpod_job(job_id: str, preview_token: str, account: str):
    """Process RunPod job asynchronously"""
    logger.info(f"Starting async RunPod job processing for job_id={job_id}, preview_token={preview_token}")
    try:
        # Run the synchronous RunPod call in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, trigger_runpod_job, job_id, preview_token, account)
        
        logger.info(f"RunPod job result for {preview_token}: {result}")
        
        # Update the preview store with the result
        if preview_token in preview_store:
            if result and result.get("success"):
                preview_store[preview_token]["runpod_success"] = True
                if "result" in result:
                    preview_store[preview_token]["result"] = result["result"]
                preview_store[preview_token]["completed_at"] = datetime.utcnow()
                logger.info(f"RunPod job {preview_token} completed successfully")
            else:
                error_msg = result.get("error", "Unknown error") if result else "Failed to connect to RunPod"
                preview_store[preview_token]["error"] = error_msg
                preview_store[preview_token]["completed_at"] = datetime.utcnow()
                logger.error(f"RunPod job {preview_token} failed: {error_msg}")
    except Exception as e:
        logger.error(f"Error processing RunPod job {preview_token}: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        if preview_token in preview_store:
            preview_store[preview_token]["error"] = str(e)
            preview_store[preview_token]["completed_at"] = datetime.utcnow()

@app.post("/uploads/presign")
async def presign(req: PreReq):
    if len(req.filenames) != len(req.content_types):
        raise HTTPException(400, "filenames & content_types mismatch")

    job_id  = f"job_{uuid.uuid4().hex[:8]}"
    keys = []

    for name, ctype in zip(req.filenames, req.content_types):
        key = f"raw/{req.account}/{job_id}/{name}"
        put = r2.generate_presigned_url(
            "put_object",
            Params={"Bucket": BUCKET,
                    "Key": key,
                    "ContentType": ctype or mimetypes.guess_type(name)[0]
                                                    or "application/octet-stream"},
            ExpiresIn=900,
        )
        keys.append({"key": key, "put": put})

    return {"jobId": job_id, "presigned": keys}

class CompleteReq(BaseModel):
    account: str
    job_id: str
    keys: list[str] = Field(..., min_length=1)

@app.post("/uploads/complete")
def complete(req: CompleteReq):
    prefix = f"raw/{req.account}/{req.job_id}/"
    if not all(k.startswith(prefix) for k in req.keys):
        raise HTTPException(400, "invalid keys")

    if len(req.keys) < 6:
        raise HTTPException(400, "Need at least 6 images")

    for key in req.keys:
        try:
            obj = r2.get_object(Bucket=BUCKET, Key=key)   
            blob = obj["Body"].read(512_000)              
            Image.open(io.BytesIO(blob)).verify()
        except Exception as e:
            logger.error(f"Failed to validate image {key}: {e}")
            raise HTTPException(400, f"Invalid image file: {key}")

    return {"ok": True, "job_id": req.job_id}

@app.post("/jobs/preview")
async def preview_job(request: Dict[str, Any]):
    """Create a preview job and return token"""
    preview_token = str(uuid.uuid4())
    job_id = request.get("job_id")  # Should be passed from frontend
    account = request.get("account", "anon")
    
    if not job_id:
        raise HTTPException(400, "job_id is required")
    
    # Store the preview with initial status
    preview_store[preview_token] = {
        "status": "processing",
        "created_at": datetime.utcnow(),
        "images": request.get("images", []),
        "job_id": job_id,
        "runpod_success": False
    }
    
    # Trigger RunPod job asynchronously to avoid blocking
    asyncio.create_task(process_runpod_job(job_id, preview_token, account))

    return {
        "ok": True,
        "warnings": [],
        "preview_token": preview_token,
        "estimate_credits": "0.0",
        "estimate_minutes": 5  # More realistic for NeRF processing
    }

@app.get("/preview/{preview_token}/status")
async def get_preview_status(preview_token: str):
    """Return preview status - check RunPod job status"""
    
    if preview_token not in preview_store:
        raise HTTPException(status_code=404, detail="Preview not found")
    
    preview = preview_store[preview_token]
    
    # If RunPod is not configured, return error
    if not RUNPOD_API_KEY or not RUNPOD_ENDPOINT_ID:
        raise HTTPException(status_code=503, detail="RunPod worker not configured")
    
    # Check if we have a result or error
    if "result" in preview:
        result = preview["result"]
        if result.get("preview_url"):
            return {
                "preview_token": preview_token,
                "status": "completed",
                "created_at": preview["created_at"].isoformat(),
                "completed_at": preview.get("completed_at", datetime.utcnow()).isoformat(),
                "preview_url": result["preview_url"],
                "preview_data": result.get("preview_data", {})
            }
    
    if preview.get("error"):
        return {
            "preview_token": preview_token,
            "status": "failed",
            "created_at": preview["created_at"].isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "errors": [preview.get("error", "Processing failed")]
        }
    
    # Still processing
    return {
        "preview_token": preview_token,
        "status": "processing",
        "created_at": preview["created_at"].isoformat(),
        "completed_at": None
    }

@app.post("/studio/checkout-session")
async def create_studio_checkout_session(request: Dict[str, Any]):
    """Create dummy Stripe checkout session"""
    return {
        "session_url": "https://checkout.stripe.com/pay/cs_test_dummy_session_for_3d_model",
        "session_id": "cs_test_" + str(uuid.uuid4())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
