import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { apiService, ApiKey } from '../services/api';
import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiKey | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Note: We don't have a list endpoint yet, so this is placeholder
      // TODO: Add GET /auth/keys endpoint to backend
      setApiKeys([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setIsCreating(true);
      setError(null);
      
      const newKey = await apiService.createApiKey(newKeyName.trim());
      setNewlyCreatedKey(newKey);
      setApiKeys(prev => [...prev, newKey]);
      setNewKeyName('');
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">API Keys</h3>
          <p className="text-sm text-gray-600">
            Generate API keys for programmatic access to your account
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production App, Development"
                  required
                />
                <p className="text-xs text-gray-500">
                  Choose a descriptive name to help you identify this key
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Key'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Show newly created key with full visibility */}
      {newlyCreatedKey && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">New API Key Created</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Copy this API key now. You won't be able to see it again.
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  value={newlyCreatedKey.key} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(newlyCreatedKey.key)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              className="mt-4" 
              onClick={() => setNewlyCreatedKey(null)}
              variant="outline"
            >
              I've copied the key
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading API keys...</p>
        </div>
      ) : apiKeys.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">No API keys created yet</p>
            <p className="text-sm text-gray-500">
              Create your first API key to start using the programmatic API
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{key.name}</h4>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                        {visibleKeys.has(key.id) ? key.key : maskApiKey(key.key)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleKeyVisibility(key.id)}
                      >
                        {visibleKeys.has(key.id) ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(key.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {new Date(key.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Using Your API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Authentication Header</Label>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              <code>Authorization: Bearer YOUR_API_KEY</code>
            </pre>
          </div>
          
          <div>
            <Label>Example cURL Request</Label>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
              <code>{`curl -X POST "${API_BASE_URL}/jobs" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"images": [{"url": "...", "filename": "..."}]}'`}</code>
            </pre>
          </div>
          
          <p className="text-xs text-gray-500">
            Replace YOUR_API_KEY with your actual API key. 
            See the <a href="/docs" className="text-blue-600 hover:underline">API documentation</a> for more examples.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}