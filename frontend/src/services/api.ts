const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Auth types
export interface User {
  id: string;
  email: string;
  org_id?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  org_id?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

// Upload and Job types  
export interface PresignedUrl {
  put_url: string;
  key: string;
  content_type: string;
}

export interface PresignResponse {
  urls: PresignedUrl[];
}

export interface JobPreviewResponse {
  ok: boolean;
  warnings: string[];
  preview_token: string;
  estimate_credits: number;
  estimate_minutes: number;
}

export interface JobOutput {
  format: string;
  url: string;
  size_bytes: number;
}

export interface JobResponse {
  id: string;
  status: 'queued' | 'running' | 'exporting' | 'completed' | 'failed' | 'canceled';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimate_credits?: number;
  cost_credits?: number;
  outputs: JobOutput[];
  errors: string[];
}

export interface JobCreateResponse {
  id: string;
  status: string;
  cost_estimate_credits: number;
}

// Billing types
export interface CreditBalance {
  org_id: string;
  balance: number;
  usage_this_month: number;
}

export interface EstimateResponse {
  total_credits: number;
  per_job_credits: number;
  estimated_minutes_per_job: number;
}

export interface CheckoutSessionResponse {
  session_url: string;
  session_id: string;
}

// Batch types
export interface BatchResponse {
  batch_id: string;
  status: string;
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  jobs: JobResponse[];
}

// Admin types
export interface SystemStats {
  total_users: number;
  total_orgs: number;
  total_jobs: number;
  jobs_today: number;
  jobs_this_month: number;
  revenue_this_month: number;
  active_workers: number;
  queue_size: number;
}

export interface RecentActivity {
  id: string;
  type: 'user_created' | 'job_created' | 'payment_processed' | 'job_completed' | 'job_failed';
  message: string;
  timestamp: string;
  user_id?: string;
  org_id?: string;
}

export { SystemStats, RecentActivity };

class ApiService {
  private token: string | null = localStorage.getItem('auth_token');
  private apiKey: string | null = localStorage.getItem('api_key');

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async fetchWithError(url: string, options?: RequestInit) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: { message: 'Unknown error' } 
      }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    
    return response;
  }

  // Auth methods
  async signup(email: string, password: string, orgName?: string): Promise<AuthResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ email, password, org_name: orgName }),
    });

    const auth = await response.json();
    this.token = auth.access_token;
    localStorage.setItem('auth_token', auth.access_token);
    return auth;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const auth = await response.json();
    this.token = auth.access_token;
    localStorage.setItem('auth_token', auth.access_token);
    return auth;
  }

  logout() {
    this.token = null;
    this.apiKey = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('api_key');
  }

  isAuthenticated(): boolean {
    return !!(this.token || this.apiKey);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      const response = await this.fetchWithError(`${API_BASE_URL}/auth/me`);
      return response.json();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async createApiKey(name: string, orgId?: string): Promise<ApiKey> {
    const response = await this.fetchWithError(`${API_BASE_URL}/auth/keys`, {
      method: 'POST',
      body: JSON.stringify({ name, org_id: orgId }),
    });

    return response.json();
  }

  setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('api_key', key);
  }

  // Studio flow (no auth required)
  async getPresignedUrls(filenames: string[], contentTypes: string[]): Promise<PresignResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/uploads/presign`, {
      method: 'POST',
      body: JSON.stringify({ filenames, content_types: contentTypes }),
    });

    return response.json();
  }

  async uploadToPresignedUrl(presignedUrl: string, file: File): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
  }

  async previewJob(imageUrls: { url: string; filename: string }[]): Promise<JobPreviewResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/jobs/preview`, {
      method: 'POST',
      body: JSON.stringify({ images: imageUrls }),
    });

    return response.json();
  }

  async createStudioCheckout(previewToken: string, successUrl?: string, cancelUrl?: string): Promise<CheckoutSessionResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/billing/stripe/checkout-session`, {
      method: 'POST',
      body: JSON.stringify({ 
        preview_token: previewToken,
        success_url: successUrl,
        cancel_url: cancelUrl 
      }),
    });

    return response.json();
  }

  // Studio result (legacy endpoint support)
  async getStudioResult(sessionId: string): Promise<any> {
    const response = await this.fetchWithError(
      `${API_BASE_URL}/result?session_id=${sessionId}`
    );

    return response.json();
  }

  async downloadStudioFile(sessionId: string, filename: string = 'model.usdz'): Promise<void> {
    const response = await this.fetchWithError(
      `${API_BASE_URL}/download?session_id=${sessionId}`
    );

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // API tier job management
  async createJob(images: { url: string; filename: string }[], params?: {
    quality?: 'fast' | 'high';
    target_formats?: string[];
    webhook_url?: string;
  }): Promise<JobCreateResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      body: JSON.stringify({
        images,
        params: {
          quality: 'fast',
          target_formats: ['glb'],
          ...params,
        },
      }),
    });

    return response.json();
  }

  async getJob(jobId: string): Promise<JobResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/jobs/${jobId}`);
    return response.json();
  }

  async cancelJob(jobId: string): Promise<void> {
    await this.fetchWithError(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  // Billing
  async getCreditBalance(): Promise<CreditBalance> {
    const response = await this.fetchWithError(`${API_BASE_URL}/billing/credits`);
    return response.json();
  }

  async estimateJobCost(params?: {
    job_count?: number;
    quality?: 'fast' | 'high';
    target_formats?: string[];
  }): Promise<EstimateResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/billing/estimate`, {
      method: 'POST',
      body: JSON.stringify({
        job_count: 1,
        params: {
          quality: 'fast',
          target_formats: ['glb'],
          ...params,
        },
      }),
    });

    return response.json();
  }

  // Batch processing
  async createBatch(source: 'csv' | 'manifest' | 'zip', url: string, orgId: string, params?: {
    quality?: 'fast' | 'high';
    target_formats?: string[];
    webhook_url?: string;
  }): Promise<BatchResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/batches`, {
      method: 'POST',
      body: JSON.stringify({
        source,
        url,
        org_id: orgId,
        params,
      }),
    });

    return response.json();
  }

  async getBatch(batchId: string): Promise<BatchResponse> {
    const response = await this.fetchWithError(`${API_BASE_URL}/batches/${batchId}`);
    return response.json();
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.fetchWithError(`${API_BASE_URL}/healthz`);
    return response.json();
  }

  // Polling utilities
  async pollJobStatus(jobId: string, onUpdate: (job: JobResponse) => void, onComplete?: (job: JobResponse) => void): Promise<void> {
    const poll = async () => {
      try {
        const job = await this.getJob(jobId);
        onUpdate(job);
        
        if (job.status === 'completed' || job.status === 'failed' || job.status === 'canceled') {
          onComplete?.(job);
          return;
        }
        
        setTimeout(poll, 3000); // Poll every 3 seconds
      } catch (error) {
        console.error('Job polling error:', error);
        setTimeout(poll, 5000); // Retry after 5 seconds on error
      }
    };

    poll();
  }

  // Utility method for Studio upload flow
  async uploadFilesStudio(files: File[]): Promise<{ previewToken: string; checkoutUrl: string }> {
    // 1. Get presigned URLs
    const filenames = files.map(f => f.name);
    const contentTypes = files.map(f => f.type);
    const presignResponse = await this.getPresignedUrls(filenames, contentTypes);
    
    // 2. Upload files to S3
    for (let i = 0; i < files.length; i++) {
      await this.uploadToPresignedUrl(presignResponse.urls[i].put_url, files[i]);
    }
    
    // 3. Create preview
    const imageRefs = presignResponse.urls.map((url, i) => ({
      url: url.key, // Use S3 key as URL
      filename: filenames[i],
    }));
    
    const preview = await this.previewJob(imageRefs);
    
    if (!preview.ok) {
      throw new Error(`Validation failed: ${preview.warnings.join(', ')}`);
    }
    
    // 4. Create checkout session
    const checkout = await this.createStudioCheckout(preview.preview_token);
    
    return {
      previewToken: preview.preview_token,
      checkoutUrl: checkout.session_url,
    };
  }

  // Utility method for authenticated users to create jobs with files
  async createJobWithFiles(files: File[], params?: {
    quality?: 'fast' | 'high';
    target_formats?: string[];
    webhook_url?: string;
  }): Promise<JobResponse> {
    // 1. Get presigned URLs
    const filenames = files.map(f => f.name);
    const contentTypes = files.map(f => f.type);
    const presignResponse = await this.getPresignedUrls(filenames, contentTypes);
    
    // 2. Upload files to S3
    for (let i = 0; i < files.length; i++) {
      await this.uploadToPresignedUrl(presignResponse.urls[i].put_url, files[i]);
    }
    
    // 3. Create job
    const imageRefs = presignResponse.urls.map((url, i) => ({
      url: url.key, // Use S3 key as URL
      filename: filenames[i],
    }));
    
    const jobCreate = await this.createJob(imageRefs, params);
    
    // 4. Return full job details
    return {
      id: jobCreate.id,
      status: 'queued' as const,
      created_at: new Date().toISOString(),
      cost_credits: jobCreate.cost_estimate_credits,
      outputs: [],
      errors: []
    };
  }

  // Admin methods
  async getAdminStats(): Promise<SystemStats> {
    const response = await this.fetchWithError(`${API_BASE_URL}/admin/stats`);
    return response.json();
  }

  async getAdminActivity(): Promise<RecentActivity[]> {
    const response = await this.fetchWithError(`${API_BASE_URL}/admin/activity`);
    return response.json();
  }

  async sendSystemMessage(message: string): Promise<void> {
    await this.fetchWithError(`${API_BASE_URL}/admin/system-message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async setMaintenanceMode(enabled: boolean): Promise<void> {
    await this.fetchWithError(`${API_BASE_URL}/admin/maintenance`, {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  async getMaintenanceMode(): Promise<{ enabled: boolean }> {
    const response = await this.fetchWithError(`${API_BASE_URL}/admin/maintenance`);
    return response.json();
  }
}

export const apiService = new ApiService();