import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, ShoppingCart, Smartphone, Upload, Code, Eye, Download } from "lucide-react";
import { CompactGenerator } from "@/components/CompactGenerator";

export const HowToAddARToShopify = () => {
  useEffect(() => {
    document.title = "How to Add AR to Shopify Store - Complete Guide 2024 | USDZ Generator";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Step-by-step guide to add AR product visualization to your Shopify store using USDZ files. Increase conversions with 3D models - no apps required, works with iOS Safari.');
    }
  }, []);

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  const handleTryGenerator = () => {
    window.location.href = '/#preview';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToHome}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Generator
              </Button>
              <h1 className="text-xl font-bold">IMG to USDZ</h1>
            </div>
            <Button onClick={handleTryGenerator} className="hidden md:flex">
              Try Generator Free
            </Button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Article Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shopify Guide
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              How to Add AR to Your Shopify Store in 2024
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Complete step-by-step guide to add augmented reality product visualization to your Shopify store using USDZ files. 
              Increase conversions by 23% with 3D product models that work on iPhone and Android.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span>📱 Works with iOS Safari</span>
              <span>🤖 Compatible with Android Chrome</span>
              <span>⚡ No apps required</span>
              <span>💰 Increase conversions 23%</span>
            </div>
          </div>

          {/* Compact Generator - Above the fold */}
          <div className="mb-12">
            <CompactGenerator 
              title="Generate USDZ Files for Your Shopify Store"
              subtitle="Upload your product images and get AR-ready USDZ files in 5 minutes"
              context="shopify"
            />
          </div>

          {/* Table of Contents */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <a href="#step1" className="block hover:text-primary">1. Generate Your USDZ Files</a>
                  <a href="#step2" className="block hover:text-primary">2. Upload to Shopify Files</a>
                  <a href="#step3" className="block hover:text-primary">3. Add to Product Pages</a>
                  <a href="#step4" className="block hover:text-primary">4. Test AR Functionality</a>
                </div>
                <div className="space-y-2">
                  <a href="#benefits" className="block hover:text-primary">Benefits of Shopify AR</a>
                  <a href="#troubleshooting" className="block hover:text-primary">Troubleshooting</a>
                  <a href="#examples" className="block hover:text-primary">Real Examples</a>
                  <a href="#faq" className="block hover:text-primary">Shopify AR FAQ</a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1 */}
          <section id="step1" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">1</div>
              Generate Your USDZ Files
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg">
                First, you need USDZ files for your products. Traditional 3D modeling agencies charge $500+ and take weeks. 
                Our AI-powered generator creates professional USDZ files in minutes for just $3.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  USDZ Generation Process
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Upload 3-6 Images</div>
                      <div className="text-muted-foreground">High-quality product photos from different angles</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">AI Processing</div>
                      <div className="text-muted-foreground">Google Vision automatically tags and analyzes</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Download USDZ</div>
                      <div className="text-muted-foreground">Get AR-ready file in minutes</div>
                    </div>
                  </div>
                </div>
                <p className="text-blue-700 text-sm mt-4">
                  ☝️ Use the generator above to create your USDZ files, then follow the steps below to add them to Shopify.
                </p>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section id="step2" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">2</div>
              Upload to Shopify Files
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Once you have your USDZ files, upload them to your Shopify admin so they're accessible to your product pages.
              </p>
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                    <div>
                      <div className="font-medium">Access Shopify Admin</div>
                      <div className="text-muted-foreground">Go to your Shopify admin dashboard</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                    <div>
                      <div className="font-medium">Navigate to Settings → Files</div>
                      <div className="text-muted-foreground">Find the Files section in your settings menu</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                    <div>
                      <div className="font-medium">Upload USDZ Files</div>
                      <div className="text-muted-foreground">Click "Upload files" and select your USDZ models</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</div>
                    <div>
                      <div className="font-medium">Copy File URLs</div>
                      <div className="text-muted-foreground">Copy the URL of each uploaded USDZ file for the next step</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tip</h4>
                <p className="text-blue-700 text-sm">
                  Name your USDZ files descriptively like "product-name-ar-model.usdz" to keep them organized and SEO-friendly.
                </p>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section id="step3" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">3</div>
              Add to Product Pages
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Now add the AR functionality to your product pages. You have two options: simple HTML links or advanced model-viewer.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Simple Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Method 1: Simple HTML Link</CardTitle>
                    <p className="text-sm text-muted-foreground">Best for beginners, works immediately on iOS</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black rounded-lg p-4">
                      <code className="text-green-400 text-sm">
{`<!-- Add to product description or page -->
<a href="YOUR_USDZ_FILE_URL" 
   class="ar-button"
   style="background: #007AFF; 
          color: white; 
          padding: 12px 24px; 
          border-radius: 8px; 
          text-decoration: none;">
  📱 View in AR
</a>`}
                      </code>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Replace YOUR_USDZ_FILE_URL with the file URL from step 2
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Method 2: Model Viewer</CardTitle>
                    <p className="text-sm text-muted-foreground">Advanced 3D viewer with AR support</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black rounded-lg p-4">
                      <code className="text-green-400 text-sm whitespace-pre-wrap">
{`<!-- Add to theme.liquid head -->
<script type="module" 
  src="https://unpkg.com/@google/model-viewer">
</script>

<!-- Add to product page -->
<model-viewer 
  src="YOUR_USDZ_FILE_URL"
  alt="Product AR Model"
  ar
  camera-controls
  style="width: 100%; height: 400px;">
</model-viewer>`}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section id="step4" className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">4</div>
              Test AR Functionality
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Testing Your AR Implementation
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">📱 iOS Testing (iPhone/iPad)</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Open Safari (not Chrome or other browsers)</li>
                      <li>• Visit your product page</li>
                      <li>• Tap the AR button or model</li>
                      <li>• Grant camera permissions</li>
                      <li>• Point camera at flat surface</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">🤖 Android Testing (Chrome)</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Open Chrome browser</li>
                      <li>• Ensure WebXR is enabled</li>
                      <li>• Tap AR button in model viewer</li>
                      <li>• Allow camera access</li>
                      <li>• Follow on-screen AR instructions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Benefits Section */}
          <section id="benefits" className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Benefits of Adding AR to Your Shopify Store</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-green-800">📈 Increase Conversions</h3>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• 23% higher conversion rates on average</li>
                    <li>• 64% reduction in return rates</li>
                    <li>• Customers spend 2.7x longer on product pages</li>
                    <li>• 40% increase in add-to-cart rates</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 text-blue-800">🎯 Better Customer Experience</h3>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Visualize products in their space</li>
                    <li>• Build confidence before purchase</li>
                    <li>• Modern, cutting-edge shopping experience</li>
                    <li>• Works on 95% of mobile devices</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quick CTA - Reference to embedded generator */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-primary/20 mb-12">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-3">🚀 Start Adding AR to Your Shopify Store Now</h3>
              <p className="text-muted-foreground mb-4">
                Scroll back to the generator above, upload your product images, and have USDZ files ready in 5 minutes.
              </p>
              <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                ↑ Back to Generator
              </Button>
            </CardContent>
          </Card>

          {/* SEO Footer */}
          <div className="text-center text-xs text-muted-foreground/60 max-w-4xl mx-auto">
            <p className="leading-relaxed">
              This guide covers: Shopify AR implementation, USDZ file integration, iOS Safari AR, Android Chrome WebXR, 
              e-commerce AR solutions, 3D product visualization, mobile AR shopping, Shopify 3D models, 
              augmented reality e-commerce, product AR displays, Shopify AR apps alternatives
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default HowToAddARToShopify;