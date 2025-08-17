from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel, Field 
from PIL import Image
from datetime import datetime
import boto3, uuid, os, mimetypes, pillow_heif, io, requests, logging, runpod, aiohttp, asyncio
from runpod import AsyncioEndpoint, AsyncioJob

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
    """Trigger RunPod serverless job for 3D model generation"""
    if not RUNPOD_API_KEY or not RUNPOD_ENDPOINT_ID:
        print("RunPod not configured, using simulation")
        return None
    
    # Add test mode for development
    if os.environ.get("RUNPOD_TEST_MODE") == "true":
        print("Running in test mode - simulating successful job")
        return {"success": True, "job_id": job_id}
    
    try:
        # Initialize RunPod with API key
        runpod.api_key = RUNPOD_API_KEY
        
        input_payload = {
            "job_id": job_id,
            "preview_token": preview_token,
            "account": account
        }
        
        print(f"Submitting job to RunPod: {input_payload}")
        
        # Use synchronous endpoint for serverless
        endpoint = runpod.Endpoint(RUNPOD_ENDPOINT_ID)
        run_request = endpoint.run(input_payload)
        
        print(f"RunPod run_request created: {type(run_request)}")
        print(f"Run request object: {run_request}")
        
        # For serverless, we just need to know the job was submitted successfully
        # We'll check status later using our own job_id
        result = {"success": True, "job_id": job_id, "run_request_str": str(run_request)}
        print(f"RunPod job triggered successfully: {result}")
        return result
        
    except Exception as e:
        print(f"Failed to trigger RunPod job: {e}")
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return None

def check_runpod_status(runpod_job_id: str):
    """Check the status of a RunPod job"""
    if not RUNPOD_API_KEY:
        return None
    
    try:
        # Initialize RunPod with API key
        runpod.api_key = RUNPOD_API_KEY
        
        # Use synchronous endpoint for serverless
        endpoint = runpod.Endpoint(RUNPOD_ENDPOINT_ID)
        
        # Create a job object from the job ID (this might need adjustment based on SDK)
        # For now, let's try to get status using the endpoint
        # Note: We might need to store the run_request object instead of just the ID
        
        # Try to check status - this might need to be adjusted based on actual SDK
        # For now, return a placeholder
        return {"status": "IN_PROGRESS"}
        
    except Exception as e:
        print(f"Failed to check RunPod status: {e}")
        return None


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
    
    # Trigger RunPod job
    runpod_result = trigger_runpod_job(job_id, preview_token, account)
    
    # Store the preview with initial status
    preview_store[preview_token] = {
        "status": "processing",
        "created_at": datetime.utcnow(),
        "images": request.get("images", []),
        "job_id": job_id,
        "runpod_success": runpod_result.get("success") if runpod_result else False
    }

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
    runpod_success = preview.get("runpod_success", False)
    job_id = preview.get("job_id")
    
    # If RunPod is not configured, return error
    if not RUNPOD_API_KEY or not RUNPOD_ENDPOINT_ID:
        raise HTTPException(status_code=503, detail="RunPod worker not configured")
    
    # If RunPod job submission failed, return error
    if not runpod_success:
        return {
            "preview_token": preview_token,
            "status": "failed",
            "created_at": preview["created_at"].isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "errors": ["Failed to start processing job"]
        }
    
    # For now, return processing status (we'll implement proper status checking next)
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
