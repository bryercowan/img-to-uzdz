from fastapi import FastAPI, UploadFile, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import stripe, uuid, redis, json, os
from settings import Settings
from tasks import save_files, validate_images, process_images_for_usdz

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

settings = Settings()
stripe.api_key = settings.STRIPE_SECRET_KEY
r = redis.from_url(settings.REDIS_URL, decode_responses=True)

@app.post("/upload")
async def upload(request: Request, files: list[UploadFile]):
    try:
        if not files:
            raise HTTPException(400, "No files uploaded")
        
        # Validate uploaded images
        if not validate_images(files):
            raise HTTPException(400, "Invalid files. Please upload 3-6 images (JPG, PNG, WEBP, HEIC) under 10MB each")
        
        job_id = uuid.uuid4().hex
        tmp_dir = save_files(files, job_id)
        
        # Process images immediately for preview
        processing_result = process_images_for_usdz(tmp_dir)
        
        if "error" in processing_result:
            raise HTTPException(500, f"Processing error: {processing_result['error']}")
        
        # Store job data in Redis
        job_data = {
            "status": "processed",
            "dir": tmp_dir,
            "usdz_file": processing_result["usdz_file"],
            "usdz_path": processing_result["usdz_path"],
            "vision_data": json.dumps(processing_result["vision_data"]),
            "ar_metadata": json.dumps(processing_result["ar_metadata"]),
            "file_size": str(processing_result["file_size"])
        }
        r.hset(f"job:{job_id}", mapping=job_data)
        
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": settings.STRIPE_PRICE_ID, "quantity": 1}],
            success_url=f"{settings.BASE_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.BASE_URL}/",
            metadata={"job_id": job_id}
        )
        return {
            "checkout_url": session.url,
            "job_id": job_id,
            "preview_data": {
                "product_name": processing_result["vision_data"].get("product_name"),
                "tags": processing_result["vision_data"].get("tags", [])[:5],
                "file_size": processing_result["file_size"]
            }
        }
    except stripe.error.StripeError as e:
        raise HTTPException(400, f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Server error: {str(e)}")

@app.post("/webhook")
async def webhook(request: Request):
    sig = request.headers.get("stripe-signature")
    if not sig:
        raise HTTPException(400, "Missing stripe signature")
    
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {str(e)}")
    
    if event["type"] == "checkout.session.completed":
        sess = event["data"]["object"]
        job_id = sess.get("metadata", {}).get("job_id")
        if job_id:
            r.hset(f"job:{job_id}", "paid", "1")
    return {"received": True}

@app.get("/result")
async def result(session_id: str):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        job_id = session.get("metadata", {}).get("job_id")
        if not job_id:
            raise HTTPException(404, "Job not found")
        
        data = r.hgetall(f"job:{job_id}")
        if not data:
            raise HTTPException(404, "Job not found")
        
        # Check if payment was completed
        if data.get("paid") != "1":
            return {"status": "awaiting_payment", "message": "Payment required to download"}
        
        # Return metadata for successful payment
        return {
            "status": "completed",
            "preview_data": {
                "product_name": json.loads(data.get("vision_data", "{}")).get("product_name"),
                "tags": json.loads(data.get("vision_data", "{}")).get("tags", [])[:5],
                "file_size": data.get("file_size")
            },
            "download_available": True
        }
    except stripe.error.StripeError as e:
        raise HTTPException(400, f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Server error: {str(e)}")

@app.get("/preview/{job_id}")
async def preview_model(job_id: str):
    try:
        data = r.hgetall(f"job:{job_id}")
        if not data:
            raise HTTPException(404, "Job not found")
        
        usdz_path = data.get("usdz_path")
        if not usdz_path or not os.path.exists(usdz_path):
            raise HTTPException(404, "File not found")
        
        # Create a GLB version for preview (browsers support GLB better than USDZ)
        glb_path = usdz_path.replace('.usdz', '.glb')
        if not os.path.exists(glb_path):
            # If GLB doesn't exist, serve the USDZ as GLB (they're the same in our case)
            glb_path = usdz_path
        
        return FileResponse(
            path=glb_path,
            filename="preview_model.glb",
            media_type="model/gltf-binary"
        )
    except Exception as e:
        raise HTTPException(500, f"Server error: {str(e)}")

@app.get("/download")
async def download_usdz(session_id: str):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        job_id = session.get("metadata", {}).get("job_id")
        if not job_id:
            raise HTTPException(404, "Job not found")
        
        data = r.hgetall(f"job:{job_id}")
        if not data:
            raise HTTPException(404, "Job not found")
        
        # Verify payment
        if data.get("paid") != "1":
            raise HTTPException(403, "Payment required")
        
        usdz_path = data.get("usdz_path")
        if not usdz_path or not os.path.exists(usdz_path):
            raise HTTPException(404, "File not found")
        
        usdz_filename = data.get("usdz_file", "product_model.usdz")
        
        return FileResponse(
            path=usdz_path,
            filename=usdz_filename,
            media_type="model/vnd.usdz+zip"
        )
    except stripe.error.StripeError as e:
        raise HTTPException(400, f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Server error: {str(e)}")
