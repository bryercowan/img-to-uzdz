import React, { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { apiService, JobResponse } from '../services/api';
import { Upload, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ImageGroup {
  id: string;
  name: string;
  files: File[];
  job?: JobResponse;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export function BatchUploader() {
  const [imageGroups, setImageGroups] = useState<ImageGroup[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<'fast' | 'high'>('fast');
  const [error, setError] = useState<string | null>(null);
  const [completedJobs, setCompletedJobs] = useState(0);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only JPG, PNG, WEBP, HEIC under 10MB are allowed.');
    } else {
      setError(null);
    }

    // Group files into sets of 3-6 images per job
    const groups: ImageGroup[] = [];
    let currentGroup: File[] = [];
    
    validFiles.forEach((file, index) => {
      currentGroup.push(file);
      
      // Create a group when we have 6 files or when we've reached the end
      if (currentGroup.length === 6 || index === validFiles.length - 1) {
        if (currentGroup.length >= 3) {
          groups.push({
            id: `group-${Date.now()}-${groups.length}`,
            name: `Job ${groups.length + 1}`,
            files: [...currentGroup],
            status: 'pending'
          });
        }
        currentGroup = [];
      }
    });

    setImageGroups(prev => [...prev, ...groups]);
  };

  const removeGroup = (groupId: string) => {
    setImageGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const processAllGroups = async () => {
    if (imageGroups.length === 0) return;

    setIsProcessing(true);
    setCompletedJobs(0);
    setError(null);

    for (const group of imageGroups) {
      // Mark this specific group as processing
      setImageGroups(prev => prev.map(g => 
        g.id === group.id ? { ...g, status: 'processing' as const } : g
      ));

      try {
        // Submit job for this group
        const result = await apiService.createJobWithFiles(
          group.files,
          {
            quality,
            target_formats: ['glb', 'usdz']
          }
        );

        // Update the group with job info
        setImageGroups(prev => prev.map(g => 
          g.id === group.id 
            ? { ...g, job: result, status: 'completed' }
            : g
        ));

        setCompletedJobs(prev => prev + 1);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
        
        // Update the group with error
        setImageGroups(prev => prev.map(g => 
          g.id === group.id 
            ? { ...g, status: 'failed', error: errorMessage }
            : g
        ));
      }

      // Small delay between jobs to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsProcessing(false);
  };

  const getStatusIcon = (status: ImageGroup['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'processing': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ImageGroup['status']) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'processing': return 'secondary';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
    }
  };

  const totalGroups = imageGroups.length;
  const processedGroups = imageGroups.filter(g => g.status === 'completed' || g.status === 'failed').length;
  const progressPercentage = totalGroups > 0 ? (processedGroups / totalGroups) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Multiple Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*,.heic"
              onChange={handleFileUpload}
              className="hidden"
              id="batch-file-upload"
              disabled={isProcessing}
            />
            <label htmlFor="batch-file-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-medium mb-1">Drop multiple images or click to upload</p>
              <p className="text-xs text-muted-foreground">
                Will create separate jobs for every 3-6 images • JPG, PNG, WEBP, HEIC • 10MB max each
              </p>
            </label>
          </div>

          {/* Quality Selection */}
          <div className="flex items-center space-x-4">
            <Label>Quality:</Label>
            <Select value={quality} onValueChange={(value: 'fast' | 'high') => setQuality(value)} disabled={isProcessing}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast (~5 min, 1 credit)</SelectItem>
                <SelectItem value="high">High Quality (~15 min, 2.5 credits)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Image Groups */}
      {imageGroups.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Jobs to Create ({imageGroups.length})</CardTitle>
              <div className="flex items-center space-x-2">
                {isProcessing && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin rounded-full" />
                    Processing {processedGroups}/{totalGroups} jobs
                  </div>
                )}
                <Button 
                  onClick={processAllGroups} 
                  disabled={isProcessing || imageGroups.length === 0}
                  variant={isProcessing ? "secondary" : "default"}
                >
                  {isProcessing ? 'Creating Jobs...' : `Create ${imageGroups.length} Jobs`}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>
            )}

            {/* Group List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {imageGroups.map((group) => (
                <div key={group.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(group.status)}
                      <span className="font-medium">{group.name}</span>
                      <Badge variant={getStatusColor(group.status)}>
                        {group.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({group.files.length} images)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {group.job && (
                        <span className="text-xs font-mono text-muted-foreground">
                          {group.job.id}
                        </span>
                      )}
                      {group.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeGroup(group.id)}
                          disabled={isProcessing}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* File names preview */}
                  <div className="text-xs text-muted-foreground">
                    {group.files.slice(0, 3).map(file => file.name).join(', ')}
                    {group.files.length > 3 && ` +${group.files.length - 3} more`}
                  </div>

                  {/* Error message */}
                  {group.error && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      {group.error}
                    </div>
                  )}

                  {/* Job details */}
                  {group.job && (
                    <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                      Job created successfully • Cost: {group.job.cost_credits} credits
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {completedJobs > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="font-medium">
                Successfully created {completedJobs} job{completedJobs !== 1 ? 's' : ''}!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Check the Jobs tab to monitor processing progress and download results.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}