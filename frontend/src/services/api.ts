const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface UploadResponse {
  checkout_url: string;
}

export interface JobStatus {
  status: string;
  cdn_url?: string;
}

class ApiService {
  private async fetchWithError(url: string, options?: RequestInit) {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response;
  }

  async uploadFiles(files: File[]): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await this.fetchWithError(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  }

  async getJobResult(sessionId: string): Promise<JobStatus> {
    const response = await this.fetchWithError(
      `${API_BASE_URL}/result?session_id=${sessionId}`
    );

    return response.json();
  }

  async pollJobStatus(sessionId: string, onUpdate: (status: JobStatus) => void) {
    const poll = async () => {
      try {
        const status = await this.getJobResult(sessionId);
        onUpdate(status);
        
        if (status.status === 'completed' && status.cdn_url) {
          return; // Job complete
        }
        
        if (status.status !== 'failed') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Polling error:', error);
        setTimeout(poll, 5000); // Retry after 5 seconds on error
      }
    };

    poll();
  }
}

export const apiService = new ApiService();
