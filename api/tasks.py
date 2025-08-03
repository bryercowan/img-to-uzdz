# api/tasks.py
import shutil, uuid
from pathlib import Path
from typing import List
from fastapi import UploadFile

# Where to stash uploads before the worker processes them
UPLOAD_ROOT = Path("/tmp/one_shot_uploads")
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


def safe_name(up: UploadFile, idx: int) -> str:
    """Return a filesystem-safe filename even if UploadFile.filename is None."""
    if up.filename:
        return Path(up.filename).name          # strip any path components
    # Fallback: 0001.bin, 0002.bin, …
    return f"{idx:04d}.bin"


def save_files(files: List[UploadFile], job_id: str) -> str:
    """
    Save uploaded files into /tmp under a unique folder
    and return the absolute path as a string.
    """
    target = UPLOAD_ROOT / job_id
    target.mkdir(parents=True, exist_ok=True)

    for i, up in enumerate(files, start=1):
        dest = target / safe_name(up, i)
        with dest.open("wb") as out:
            shutil.copyfileobj(up.file, out)

    return str(target)
