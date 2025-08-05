import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, ShoppingCart, Smartphone, Globe, ArrowRight } from "lucide-react";

export const TutorialSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Code className="w-4 h-4 mr-2" />
            Implementation Guide
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            How to Add USDZ AR Models to Your E-commerce Store
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Step-by-step guide to implement AR product visualization on Shopify, WooCommerce, and other platforms
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {/* Shopify */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <ShoppingCart className="w-5 h-5" />
                Shopify Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>Upload your USDZ file to Shopify Admin → Settings → Files</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>Copy the file URL from your uploaded USDZ</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>Add to product template or use model-viewer component</div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Simple HTML Method:</h4>
                <code className="text-xs text-green-700 block">
                  {`<a href="your-file.usdz" class="ar-button">View in AR</a>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* WooCommerce */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Globe className="w-5 h-5" />
                WooCommerce Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>Upload USDZ to WordPress Media Library</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>Add model-viewer script to your theme</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>Insert model-viewer tag in product pages</div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Model Viewer:</h4>
                <code className="text-xs text-blue-700 block">
                  {`<model-viewer src="file.usdz" ar camera-controls></model-viewer>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Universal Method */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Smartphone className="w-5 h-5" />
                Universal Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>Works on any website or platform</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>Include model-viewer JavaScript library</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>Compatible with all custom platforms</div>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">CDN Include:</h4>
                <code className="text-xs text-purple-700 block">
                  {`<script type="module" src="https://unpkg.com/@google/model-viewer"></script>`}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Implementation */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-center">Complete Implementation Example</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Full HTML Implementation with AR Support:</h3>
                <div className="bg-black rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm whitespace-pre-wrap">
{`<!-- Include model-viewer library -->
<script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>

<!-- USDZ AR Model -->
<model-viewer 
  src="path/to/your/product-model.usdz"
  alt="Product 3D Model"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls
  poster="path/to/poster-image.jpg"
  shadow-intensity="1"
  style="width: 100%; height: 400px;">
  
  <button 
    slot="ar-button" 
    style="background: #007AFF; color: white; padding: 12px 24px; border: none; border-radius: 8px;">
    View in AR 📱
  </button>
</model-viewer>`}
                  </code>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div>
                  <h4 className="font-semibold mb-3">✅ Best Practices:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Keep USDZ files under 5MB for fast loading</li>
                    <li>• Add poster images for initial display</li>
                    <li>• Test on both iOS Safari and Android Chrome</li>
                    <li>• Include fallback images for unsupported browsers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">📱 Device Support:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• iOS 12+ (Safari, native AR)</li>
                    <li>• Android 8+ (Chrome, WebXR)</li>
                    <li>• Desktop browsers (3D viewer only)</li>
                    <li>• 95%+ of mobile devices supported</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SEO Footer */}
        <div className="text-center mt-12 text-xs text-muted-foreground/60 max-w-4xl mx-auto">
          <p>
            Perfect for: Shopify AR products, WooCommerce 3D visualization, Magento AR models, BigCommerce 3D, 
            custom e-commerce AR integration, iOS Safari AR, Android Chrome WebXR, mobile AR shopping, 
            product visualization, 3D product displays, augmented reality e-commerce
          </p>
        </div>
      </div>
    </section>
  );
};