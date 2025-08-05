import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Download, ArrowLeft, FileOutput, Tag } from "lucide-react";
import { apiService, JobStatus } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export const Success = () => {
  const [searchParams] = useSearchParams();
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    const fetchJobStatus = async () => {
      try {
        const status = await apiService.getJobResult(sessionId);
        setJobStatus(status);
        
        // Update page title with product info for SEO
        if (status.preview_data?.product_name) {
          document.title = `${status.preview_data.product_name} - USDZ AR Model Ready | IMG to USDZ`;
        } else {
          document.title = 'USDZ AR Model Ready for Download | IMG to USDZ - Shopify AR Generator';
        }
      } catch (error) {
        console.error('Error fetching job status:', error);
        toast({
          title: "Error",
          description: "Failed to load your order details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobStatus();
  }, [sessionId, toast]);

  const handleDownload = async () => {
    if (!sessionId) return;

    setIsDownloading(true);
    try {
      await apiService.downloadUSDZ(sessionId);
      toast({
        title: "Download Started",
        description: "Your USDZ file is being downloaded.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Download failed";
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FileOutput className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (!sessionId || !jobStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              We couldn't find your order. Please check your payment confirmation email.
            </p>
            <Button onClick={handleBackToHome}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold font-heading mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your USDZ file has been generated and is ready for download.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileOutput className="w-5 h-5 text-primary" />
              Your 3D Model Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Info */}
            {jobStatus.preview_data && (
              <div className="space-y-4">
                {jobStatus.preview_data.product_name && (
                  <div>
                    <h3 className="font-medium mb-2">Detected Product</h3>
                    <p className="text-lg">{jobStatus.preview_data.product_name}</p>
                  </div>
                )}
                
                {jobStatus.preview_data.tags && jobStatus.preview_data.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      AI-Generated Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {jobStatus.preview_data.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">File Format</h4>
                    <p>USDZ (Universal Scene Description)</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">File Size</h4>
                    <p>{Math.round(parseInt(jobStatus.preview_data.file_size || '0') / 1024)} KB</p>
                  </div>
                </div>
              </div>
            )}

            {/* Download Section */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h3 className="font-medium mb-2 text-primary">Ready to Download</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your USDZ file is compatible with iOS Safari, Android Chrome, and WebXR for AR display.
              </p>
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="w-full"
                size="lg"
              >
                {isDownloading ? (
                  <>
                    <FileOutput className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download USDZ File
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Use Your USDZ File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">For iOS (Safari)</h4>
                <p className="text-sm text-muted-foreground">
                  Upload to your website and link directly to the .usdz file. iOS users can tap to view in AR.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Android (Chrome)</h4>
                <p className="text-sm text-muted-foreground">
                  Use the `&lt;model-viewer&gt;` web component to display the 3D model with AR support.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">HTML Example</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<model-viewer 
  src="path/to/your/model.usdz" 
  ar 
  ar-modes="webxr scene-viewer quick-look"
  camera-controls>
</model-viewer>`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="text-center">
          <Button variant="outline" onClick={handleBackToHome}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Create Another USDZ File
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success;