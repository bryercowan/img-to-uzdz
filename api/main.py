from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from pydantic import BaseModel, Field 
from PIL import Image
from datetime import datetime
import boto3, uuid, os, mimetypes, pillow_heif, io

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
BUCKET = os.environ["R2_BUCKET"]

class PreReq(BaseModel):
    filenames: list[str] = Field(..., min_length=1)
    content_types: list[str] = Field(..., min_length=1)
    account: str = "anon"

# Store preview tokens and their status (in-memory for demo)
preview_store = {}


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
        obj = r2.get_object(Bucket=BUCKET, Key=key)   
        blob = obj["Body"].read(512_000)              
        Image.open(io.BytesIO(blob)).verify()

    return {"ok": True}

@app.post("/jobs/preview")
async def preview_job(request: Dict[str, Any]):
    """Create a preview job and return token"""
    preview_token = str(uuid.uuid4())
    
    # Store the preview with initial status
    preview_store[preview_token] = {
        "status": "processing",
        "created_at": datetime.utcnow(),
        "images": request.get("images", [])
    }

    return {
        "ok": True,
        "warnings": [],
        "preview_token": preview_token,
        "estimate_credits": "0.0",
        "estimate_minutes": 3
    }

@app.get("/preview/{preview_token}/status")
async def get_preview_status(preview_token: str):
    """Return preview status - simulate processing then completion"""
    
    if preview_token not in preview_store:
        raise HTTPException(status_code=404, detail="Preview not found")
    
    preview = preview_store[preview_token]
    
    # Simulate: after 10 seconds, mark as completed
    elapsed = (datetime.utcnow() - preview["created_at"]).total_seconds()
    
    if elapsed > 10:  # 10 seconds for demo
        # Mark as completed with dummy model URL
        preview["status"] = "completed" 
        model_url = f"https://img3d-storage.f83a62cd873c7d3f751c493e9ae9db58.r2.cloudflarestorage.com/models/{preview_token}/preview.glb"
        
        return {
            "preview_token": preview_token,
            "status": "completed",
            "created_at": preview["created_at"].isoformat(),
            "completed_at": datetime.utcnow().isoformat(),
            "preview_url": model_url,
            "preview_data": {
                "outputs": [
                    {
                        "format": "glb",
                        "url": model_url,
                        "size_bytes": 1024000
                    }
                ],
                "processing_time": f"{int(elapsed)}s"
            }
        }
    else:
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
