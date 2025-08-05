import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { apiService, SystemStats, RecentActivity } from '../services/api';
import { 
  Users, 
  Activity, 
  DollarSign, 
  Server, 
  AlertTriangle,
  TrendingUp,
  Database,
  Settings
} from 'lucide-react';


export function AdminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemMessage, setSystemMessage] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    loadAdminData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAdminData = async () => {
    try {
      setError(null);
      
      // Load admin stats, activity, and maintenance status from API
      const [statsResponse, activityResponse, maintenanceResponse] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getAdminActivity(),
        apiService.getMaintenanceMode()
      ]);

      setStats(statsResponse);
      setRecentActivity(activityResponse);
      setMaintenanceMode(maintenanceResponse.enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemMessage = async () => {
    try {
      await apiService.sendSystemMessage(systemMessage);
      setSystemMessage('');
      alert('System message sent successfully!');
    } catch (err) {
      alert('Failed to send system message');
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      await apiService.setMaintenanceMode(!maintenanceMode);
      setMaintenanceMode(!maintenanceMode);
    } catch (err) {
      alert('Failed to toggle maintenance mode');
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_created': return <Users className="w-4 h-4 text-blue-500" />;
      case 'job_created': return <Activity className="w-4 h-4 text-green-500" />;
      case 'job_completed': return <Activity className="w-4 h-4 text-green-600" />;
      case 'job_failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'payment_processed': return <DollarSign className="w-4 h-4 text-emerald-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBadgeVariant = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_created': return 'default';
      case 'job_created': return 'secondary';
      case 'job_completed': return 'default';
      case 'job_failed': return 'destructive';
      case 'payment_processed': return 'default';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_orgs} organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs_today}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.jobs_this_month.toLocaleString()} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.revenue_this_month.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.active_workers}/4
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.queue_size} in queue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="system">System Control</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>
                Live feed of system events and user activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={getActivityBadgeVariant(activity.type)} className="text-xs">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Messages</CardTitle>
                <CardDescription>
                  Send notifications to all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter system message for all users..."
                  value={systemMessage}
                  onChange={(e) => setSystemMessage(e.target.value)}
                  rows={4}
                />
                <Button onClick={handleSystemMessage} disabled={!systemMessage.trim()}>
                  Send System Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>
                  Control system availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Prevents new job submissions
                    </p>
                  </div>
                  <Button
                    variant={maintenanceMode ? "destructive" : "outline"}
                    onClick={handleMaintenanceToggle}
                  >
                    {maintenanceMode ? "Disable" : "Enable"}
                  </Button>
                </div>
                {maintenanceMode && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      System is in maintenance mode. New jobs are being rejected.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Success Rate</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">94.2%</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  +2.1% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Processing Time</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">4.2min</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                  12s faster than last month
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>System health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats?.total_jobs.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total Jobs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">99.9%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">2.1GB</div>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24ms</div>
                    <p className="text-sm text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}