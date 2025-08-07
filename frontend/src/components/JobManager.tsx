import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { apiService, JobResponse, EstimateResponse } from '../services/api';
import { Upload, Download, Eye, X, RefreshCw } from 'lucide-react';

export function JobManager() {
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create job form
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [jobQuality, setJobQuality] = useState<'fast' | 'high'>('fast');
  const [targetFormats, setTargetFormats] = useState<string[]>(['glb']);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);

  // Polling jobs
  const [pollingJobs, setPollingJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    // Get cost estimate when parameters change
    if (selectedFiles.length > 0) {
      getEstimate();
    }
  }, [jobQuality, targetFormats, selectedFiles.length]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Backend needs a GET /jobs endpoint to list user's jobs
      // For now, we'll just show placeholder
      setJobs([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const getEstimate = async () => {
    try {
      const est = await apiService.estimateJobCost({
        job_count: 1,
        quality: jobQuality,
        target_formats: targetFormats,
      });
      setEstimate(est);
    } catch (err) {
      console.error('Failed to get estimate:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only JPG, PNG, WEBP under 10MB are allowed.');
    }

    if (validFiles.length < 3) {
      setError('Please select at least 3 images');
      return;
    }

    if (validFiles.length > 30) {
      setError('Maximum 30 images allowed');
      return;
    }

    setSelectedFiles(validFiles);
    setError(null);
  };

  const handleCreateJob = async () => {
    if (selectedFiles.length < 3) {
      setError('Please select at least 3 images');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // 1. Get presigned URLs
      const filenames = selectedFiles.map(f => f.name);
      const contentTypes = selectedFiles.map(f => f.type);
      const presignResponse = await apiService.getPresignedUrlsAuth(filenames, contentTypes);
      
      // 2. Upload files to S3
      for (let i = 0; i < selectedFiles.length; i++) {
        await apiService.uploadToPresignedUrl(presignResponse.urls[i].put_url, selectedFiles[i]);
      }
      
      // 3. Create job
      const imageRefs = presignResponse.urls.map((url, i) => ({
        url: url.key, // Use S3 key as URL
        filename: filenames[i],
      }));
      
      const jobResponse = await apiService.createJob(imageRefs, {
        quality: jobQuality,
        target_formats: targetFormats,
        webhook_url: webhookUrl || undefined,
      });

      // Add to jobs list and start polling
      const newJob: JobResponse = {
        id: jobResponse.id,
        status: jobResponse.status as any,
        created_at: new Date().toISOString(),
        estimate_credits: jobResponse.cost_estimate_credits,
        outputs: [],
        errors: [],
      };
      
      setJobs(prev => [newJob, ...prev]);
      startPollingJob(jobResponse.id);
      
      // Reset form
      setSelectedFiles([]);
      setWebhookUrl('');
      setShowCreateDialog(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setIsCreating(false);
    }
  };

  const startPollingJob = (jobId: string) => {
    setPollingJobs(prev => new Set([...prev, jobId]));
    
    apiService.pollJobStatus(
      jobId,
      (job) => {
        // Update job in list
        setJobs(prev => prev.map(j => j.id === jobId ? job : j));
      },
      (finalJob) => {
        // Job completed, stop polling
        setPollingJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        setJobs(prev => prev.map(j => j.id === jobId ? finalJob : j));
      }
    );
  };

  const handleDownload = async (output: { url: string; format: string }) => {
    try {
      const response = await fetch(output.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `model.${output.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'running': case 'exporting': return 'secondary';
      case 'canceled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'queued': return 10;
      case 'running': return 50;
      case 'exporting': return 80;
      case 'completed': return 100;
      case 'failed': case 'canceled': return 0;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Jobs</h3>
          <p className="text-sm text-gray-600">
            Create and monitor your 3D model generation jobs
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-files">Upload Images (3-30 files)</Label>
                <Input
                  id="job-files"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {selectedFiles.length} files selected
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Quality</Label>
                <Select value={jobQuality} onValueChange={(value: 'fast' | 'high') => setJobQuality(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast (~5 min, 1 credit)</SelectItem>
                    <SelectItem value="high">High Quality (~15 min, 2.5 credits)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Output Formats</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={targetFormats.includes('glb')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetFormats(prev => [...prev, 'glb']);
                        } else {
                          setTargetFormats(prev => prev.filter(f => f !== 'glb'));
                        }
                      }}
                    />
                    <span className="text-sm">GLB</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={targetFormats.includes('usdz')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetFormats(prev => [...prev, 'usdz']);
                        } else {
                          setTargetFormats(prev => prev.filter(f => f !== 'usdz'));
                        }
                      }}
                    />
                    <span className="text-sm">USDZ</span>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-app.com/webhook"
                />
              </div>
              
              {estimate && (
                <Alert>
                  <AlertDescription>
                    <strong>Estimated cost:</strong> {estimate.per_job_credits} credits
                    <br />
                    <strong>Estimated time:</strong> ~{estimate.estimated_minutes_per_job} minutes
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateJob} 
                  disabled={isCreating || selectedFiles.length < 3}
                >
                  {isCreating ? 'Creating...' : 'Create Job'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Jobs List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No jobs created yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create your first job to start generating 3D models
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium font-mono text-sm">{job.id}</h4>
                      <Badge variant={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      {pollingJobs.has(job.id) && (
                        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Created {new Date(job.created_at).toLocaleString()}
                    </p>
                    {job.cost_credits && (
                      <p className="text-sm text-gray-600">
                        Cost: {job.cost_credits} credits
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {job.outputs.map((output, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(output)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {output.format.toUpperCase()}
                      </Button>
                    ))}
                    
                    {job.status === 'queued' || job.status === 'running' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => apiService.cancelJob(job.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
                
                {(job.status === 'queued' || job.status === 'running' || job.status === 'exporting') && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getStatusProgress(job.status)}%</span>
                    </div>
                    <Progress value={getStatusProgress(job.status)} />
                  </div>
                )}
                
                {job.errors.length > 0 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                      {job.errors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}