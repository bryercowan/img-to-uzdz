import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { apiService, JobResponse, CreditBalance, ApiKey } from '../services/api';
import { ApiKeyManager } from './ApiKeyManager';
import { JobManager } from './JobManager';
import { BatchUploader } from './BatchUploader';
import { AdminDashboard } from './AdminDashboard';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadDashboardData();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const userInfo = await apiService.getCurrentUser();
      if (userInfo && userInfo.email === 'admin@img-to-uzdz.com') {
        setIsAdmin(true);
      }
    } catch (err) {
      console.log('Could not check admin status:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load credits (will only work if user has org)
      try {
        const creditsData = await apiService.getCreditBalance();
        setCredits(creditsData);
      } catch (err) {
        // Credits might not be available if no org
        console.log('Credits not available:', err);
      }
      
      // TODO: Load recent jobs - would need a jobs list endpoint
      // const jobs = await apiService.getRecentJobs();
      // setRecentJobs(jobs);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Manage your 3D model generation</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Credits Overview */}
      {credits && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {credits.balance.toFixed(1)} credits
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {credits.usage_this_month.toFixed(1)} credits
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="outline" className="w-full">
                Buy Credits
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                View Usage
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>
                Create and monitor your 3D model generation jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for programmatic access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>
                Upload multiple images to create multiple jobs simultaneously
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BatchUploader />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>System Administration</CardTitle>
                <CardDescription>
                  Monitor system performance, user activity, and manage platform settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Recent Jobs Preview */}
      {recentJobs.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                  <div>
                    <p className="font-medium">{job.id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      job.status === 'completed' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      job.status === 'running' ? 'secondary' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                    {job.cost_credits && (
                      <span className="text-sm text-gray-500">
                        {job.cost_credits} credits
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}