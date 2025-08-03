from fastapi import FastAPI, UploadFile, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import stripe, uuid, redis, json, os
from settings import Settings
from tasks import save_files
from fastapi.templating import Jinja2Templates

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
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload")
async def upload(request: Request, files: list[UploadFile]):
    try:
        if not files:
            raise HTTPException(400, "No files uploaded")
        
        job_id = uuid.uuid4().hex
        tmp_dir = save_files(files, job_id)
        r.hset(f"job:{job_id}", mapping={"status": "queued", "dir": tmp_dir})
        
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": settings.STRIPE_PRICE_ID, "quantity": 1}],
            success_url=f"{settings.BASE_URL}/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.BASE_URL}/",
            metadata={"job_id": job_id}
        )
        return {"checkout_url": session.url}
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
        
        if data.get("cdn_url"):
            return RedirectResponse(data["cdn_url"])
        return {"status": data.get("status", "processing")}
    except stripe.error.StripeError as e:
        raise HTTPException(400, f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Server error: {str(e)}")
