import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, FileOutput, ArrowRight, CheckCircle, Sparkles, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface CompactGeneratorProps {
  title?: string;
  subtitle?: string;
  context?: string; // e.g., "shopify", "woocommerce", "comparison"
}

export const CompactGenerator = ({
  title = "Generate Your USDZ Files Now",
  subtitle = "Upload 3-6 product images and get AR-ready models in minutes",
  context = "general"
}: CompactGeneratorProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [previewStatus, setPreviewStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const { toast } = useToast();

  // Poll for preview status updates when previewToken changes
  useEffect(() => {
    if (previewToken && previewStatus === 'processing') {
      apiService.pollPreviewStatus(
        previewToken,
        (status) => {
          console.log('Preview status update:', status);
          if (status.status === 'completed' && status.preview_url) {
            setPreviewStatus('completed');
            setModelUrl(status.preview_url);
            setPreviewData(status.preview_data);

            toast({
              title: "3D Model Generated!",
              description: "Your preview model is ready. You can now view it in 3D.",
            });
          } else if (status.status === 'failed') {
            setPreviewStatus('failed');
            toast({
              title: "Preview Generation Failed",
              description: status.errors?.[0] || "Failed to generate 3D preview",
              variant: "destructive",
            });
          }
        },
        (result) => {
          console.log('Preview polling complete:', result);
        }
      );
    }
  }, [previewToken, previewStatus, toast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

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

    setUploadedFiles(validFiles);
    setShowPreview(false);
    setValidationWarnings([]);
    setPreviewStatus('processing');
    setModelUrl(null);
    setPreviewData(null);
  };

  const handleStartProcessing = async () => {
    if (uploadedFiles.length < 6 || uploadedFiles.length > 30) {
      toast({
        title: "Invalid number of images",
        description: "Please select 6-30 images for processing.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setError(null);
    setShowPreview(false);
    setPreviewStatus('processing');
    setModelUrl(null);
    setPreviewData(null);

    try {
      const result = await apiService.uploadFilesStudio(uploadedFiles);

      setPreviewToken(result.previewToken);
      setCheckoutUrl(result.checkoutUrl);
      setShowPreview(true);

      toast({
        title: "Images Validated Successfully!",
        description: "Generating 3D model preview... This may take a few minutes.",
      });

      // Scroll to preview section
      setTimeout(() => {
        const previewElement = document.querySelector('#model-preview');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';

      // Check if it's a validation error
      if (errorMessage.includes('Validation failed')) {
        const warnings = errorMessage.replace('Validation failed: ', '').split(', ');
        setValidationWarnings(warnings);
        setError('Some images may not be suitable for 3D reconstruction. Check warnings below.');
      } else {
        setError(errorMessage);
      }

      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedToPayment = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="outline" className="bg-primary/10">
            <Upload className="w-3 h-3 mr-1" />
            Quick Start
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
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
            id="compact-file-upload"
          />
          <label htmlFor="compact-file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-medium mb-1">Drop images or click to upload</p>
            <p className="text-xs text-muted-foreground">3-6 images • JPG, PNG, WEBP, HEIC • 10MB max each</p>
          </label>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploaded: {uploadedFiles.length}/6</span>
              <div className="flex gap-1">
                {uploadedFiles.map((_, index) => (
                  <div key={index} className="w-2 h-2 bg-primary rounded-full" />
                ))}
              </div>
            </div>

            {uploadedFiles.length >= 3 && uploadedFiles.length <= 6 && (
              <Button
                onClick={handleStartProcessing}
                className="w-full"
                disabled={isUploading}
                size="lg"
              >
                {isUploading ? (
                  <>
                    <FileOutput className="w-4 h-4 mr-2 animate-spin" />
                    Generating USDZ...
                  </>
                ) : (
                  <>
                    Generate & Preview First
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Image Quality Warnings:</p>
            <ul className="text-xs text-yellow-700 space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Processing Success */}
        {showPreview && previewToken && (
          <div id="model-preview" className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Images Validated Successfully!</span>
            </div>

            {/* Preview Display */}
            <div className="my-4 bg-white rounded-lg border overflow-hidden">
              {previewStatus === 'processing' && (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileOutput className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Generating 3D Model...</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Processing {uploadedFiles.length} images • This may take 2-5 minutes
                    </p>
                  </div>
                </div>
              )}

              {previewStatus === 'completed' && modelUrl && (
                <div className="relative">
                  <model-viewer
                    src={modelUrl}
                    alt="3D Model Preview"
                    camera-controls
                    auto-rotate
                    style={{
                      width: '100%',
                      height: '300px',
                      backgroundColor: '#f8f9fa'
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Eye className="w-3 h-3 mr-1" />
                      3D Preview
                    </Badge>
                  </div>
                </div>
              )}

              {previewStatus === 'failed' && (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileOutput className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Preview Generation Failed</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Unable to generate 3D preview. Please try with different images.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            {previewData && (
              <div className="mb-4 p-3 bg-white rounded border">
                {previewData.product_name && (
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Detected: {previewData.product_name}
                  </p>
                )}
                {previewData.tags && previewData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {previewData.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="text-center mb-4">
              {previewStatus === 'processing' ? (
                <p className="text-sm text-blue-700 mb-1">
                  <strong>🔄 Processing:</strong> Creating high-quality 3D model
                </p>
              ) : previewStatus === 'completed' ? (
                <p className="text-sm text-green-700 mb-1">
                  <strong>✅ Preview Ready:</strong> High-quality 3D model generated
                </p>
              ) : (
                <p className="text-sm text-red-700 mb-1">
                  <strong>❌ Generation Failed:</strong> Please try with different images
                </p>
              )}
              <p className="text-xs text-gray-600">
                Includes GLB and USDZ formats • Optimized for AR/VR • Compatible with all devices
              </p>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handleProceedToPayment}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
              size="lg"
              disabled={!checkoutUrl || previewStatus === 'failed'}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {previewStatus === 'processing' ? '⏳ Generating Preview...' :
                previewStatus === 'completed' ? '🎉 Buy 3D Model for $3' :
                  '❌ Generation Failed'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-green-600 text-center mt-2">
              ✨ {previewStatus === 'completed' ? 'Preview ready' : 'Images validated'} • Payment processed securely via Stripe • Instant download after processing
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Quick Benefits */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground pt-2 border-t">
          <div>
            <div className="font-medium">⚡ 5 min</div>
            <div>Generation</div>
          </div>
          <div>
            <div className="font-medium">🤖 AI Tags</div>
            <div>Auto-detected</div>
          </div>
          <div>
            <div className="font-medium">📱 AR Ready</div>
            <div>iOS & Android</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
