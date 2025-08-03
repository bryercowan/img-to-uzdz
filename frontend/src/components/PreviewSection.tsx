import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, FileOutput, ArrowRight, CheckCircle, Download, CreditCard, AlertCircle } from "lucide-react";
import { useState } from "react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export const PreviewSection = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Added missing state variables for processing lifecycle and payment status
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Stubbed handler for starting the Stripe payment flow
  const handlePayment = async () => {
    // TODO: integrate Stripe payment flow
    try {
      setIsPaid(true);
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! You can now download your file.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment failed";
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Stubbed handler for downloading the generated file
  const handleDownload = async () => {
    // TODO: implement file download logic (e.g., fetch download URL from API)
    try {
      toast({
        title: "Download Started",
        description: "Your UZDZ file is being downloaded.",
      });
      // Example placeholder: window.open(downloadUrl, "_blank");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Download failed";
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
    setError(null);
  };

  const handleStartProcessing = async () => {
    if (uploadedFiles.length < 1) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await apiService.uploadFiles(uploadedFiles);
      
      // Redirect to Stripe checkout
      window.location.href = response.checkout_url;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section id="preview" className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Upload className="w-4 h-4 mr-2" />
            Try Your Files
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Upload & Convert to UZDZ
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload 3-6 images of your product. We'll create a 3D UZDZ file for AR display. Preview for free, pay $3 to download.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 shadow-glow-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Upload Your Product Images
              </CardTitle>
              <CardDescription>
                Upload 3-6 high-quality images of your product from different angles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Click to upload images</p>
                  <p className="text-muted-foreground">PNG, JPG up to 10MB each (3-6 images required)</p>
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Uploaded Files ({uploadedFiles.length}/6):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Image className="w-4 h-4 text-primary" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  {uploadedFiles.length >= 1 && (
                    <Button 
                      onClick={handleStartProcessing} 
                      className="w-full" 
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <FileOutput className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Upload & Pay $9
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Processing */}
              {isProcessing && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <FileOutput className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Creating Your UZDZ File...</h3>
                  <p className="text-muted-foreground">Processing your images into a 3D model</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-4">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              )}

              {/* Preview Result */}
              {isComplete && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">UZDZ File Generated Successfully!</span>
                  </div>
                  
                  {/* Mock 3D preview */}
                  <div className="bg-gradient-to-br from-muted/50 to-primary/5 rounded-lg p-8 text-center">
                    <div className="w-32 h-32 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <FileOutput className="w-16 h-16 text-primary" />
                    </div>
                    <h4 className="font-medium mb-2">3D Model Preview</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your UZDZ file is ready! This 3D model can be displayed in AR on any website.
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>File size: ~2.3MB</div>
                      <div>Compatible with: iOS Safari, Android Chrome, WebXR</div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    {!isPaid ? (
                      <>
                        <h4 className="font-medium mb-2">Ready to Download?</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Pay $3 to download your UZDZ file and start using it on your website immediately.
                        </p>
                        <Button onClick={handlePayment} variant="premium" className="w-full">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay $3 & Unlock Download
                        </Button>
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium mb-2 text-primary">Payment Successful!</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Your UZDZ file is ready for download. Thank you for your purchase!
                        </p>
                        <Button onClick={handleDownload} className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download UZDZ File
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};