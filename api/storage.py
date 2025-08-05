import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
from typing import List, Dict
from settings import Settings
import uuid

settings = Settings()

class S3StorageManager:
    def __init__(self):
        self.client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT if settings.S3_ENDPOINT else None,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION
        )
        self.bucket = settings.S3_BUCKET

    def generate_presigned_upload_url(self, key: str, content_type: str, expires_in: int = 3600) -> str:
        """Generate presigned URL for uploading files to S3"""
        try:
            response = self.client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': key,
                    'ContentType': content_type
                },
                ExpiresIn=expires_in
            )
            return response
        except ClientError as e:
            raise Exception(f"Failed to generate presigned upload URL: {e}")

    def generate_presigned_download_url(self, key: str, expires_in: int = 604800) -> str:
        """Generate presigned URL for downloading files from S3 (default 7 days)"""
        try:
            response = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': key
                },
                ExpiresIn=expires_in
            )
            return response
        except ClientError as e:
            raise Exception(f"Failed to generate presigned download URL: {e}")

    def upload_file(self, file_content: bytes, key: str, content_type: str = 'application/octet-stream') -> bool:
        """Upload file content directly to S3"""
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_content,
                ContentType=content_type
            )
            return True
        except ClientError as e:
            raise Exception(f"Failed to upload file: {e}")

    def delete_file(self, key: str) -> bool:
        """Delete file from S3"""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete file: {e}")

    def delete_files(self, keys: List[str]) -> bool:
        """Delete multiple files from S3"""
        try:
            delete_keys = [{'Key': key} for key in keys]
            self.client.delete_objects(
                Bucket=self.bucket,
                Delete={
                    'Objects': delete_keys,
                    'Quiet': True
                }
            )
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete files: {e}")

    def get_file_size(self, key: str) -> int:
        """Get file size in bytes"""
        try:
            response = self.client.head_object(Bucket=self.bucket, Key=key)
            return response['ContentLength']
        except ClientError as e:
            raise Exception(f"Failed to get file size: {e}")

    def file_exists(self, key: str) -> bool:
        """Check if file exists in S3"""
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError:
            return False

def generate_storage_key(org_id: str = None, job_id: str = None, filename: str = None, prefix: str = "raw") -> str:
    """Generate standardized S3 storage key"""
    org_part = org_id if org_id else "anon"
    job_part = job_id if job_id else str(uuid.uuid4())
    
    if filename:
        return f"org/{org_part}/jobs/{job_part}/{prefix}/{filename}"
    else:
        return f"org/{org_part}/jobs/{job_part}/{prefix}/"

def generate_presigned_upload_urls(filenames: List[str], content_types: List[str], org_id: str = None) -> List[Dict[str, str]]:
    """Generate multiple presigned upload URLs for a job"""
    storage = S3StorageManager()
    job_id = str(uuid.uuid4())
    urls = []
    
    for filename, content_type in zip(filenames, content_types):
        key = generate_storage_key(org_id, job_id, filename, "raw")
        put_url = storage.generate_presigned_upload_url(key, content_type)
        urls.append({
            "put_url": put_url,
            "key": key,
            "content_type": content_type
        })
    
    return urls