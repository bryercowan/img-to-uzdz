"""
Minimal RQ‑style loop without the RQ dependency
(dedicated for ultra‑light VPS).  It simply blocks on
Redis list `jobs`, waits until the Stripe webhook marks
`paid = 1`, then calls `process()` from pipeline.py and
stores the CDN URL.
"""
import os, json, time, redis
from pipeline import process

# connect using REDIS_URL from .env (docker‑compose passes it)
r = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)

while True:
    item = r.blpop("jobs", timeout=5)  # blocks until a job arrives
    if not item:
        continue  # timeout -> loop again (allows Ctrl‑C)

    meta = json.loads(item[1])
    job_key = f"job:{meta['id']}"

    # Wait until Stripe payment is confirmed
    if r.hget(job_key, "paid") != "1":
        r.rpush("jobs", item[1])  # re‑queue at the tail
        time.sleep(1)
        continue

    try:
        cdn_url = process(meta)  # your domain logic
        r.hset(job_key, mapping={"status": "done", "cdn_url": cdn_url})
    except Exception as exc:
        r.hset(job_key, "status", "error")
        # optional: log exception or push to Sentry
