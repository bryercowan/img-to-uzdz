import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, Smartphone, Globe, Zap, FileType } from "lucide-react";
import { CompactGenerator } from "@/components/CompactGenerator";

export const USDZvsGLB = () => {
  useEffect(() => {
    document.title = "USDZ vs GLB: Which 3D Format is Best for E-commerce AR? | Complete Comparison 2024";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete comparison of USDZ vs GLB 3D formats for e-commerce AR. Learn which format works best for iOS, Android, Shopify, and web AR experiences.');
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
              Generate USDZ Files
            </Button>
          </div>
        </div>
      </header>

      <article className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Article Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <FileType className="w-4 h-4 mr-2" />
              Format Comparison
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              USDZ vs GLB: Which 3D Format is Best for E-commerce AR?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive comparison of USDZ and GLB 3D formats for e-commerce augmented reality. 
              Understand the differences, compatibility, and which format to choose for your online store.
            </p>
          </div>

          {/* Compact Generator */}
          <div className="mb-12">
            <CompactGenerator 
              title="Generate Professional USDZ Files (Recommended)"
              subtitle="Get the best format for e-commerce AR - works on iOS Safari & Android Chrome"
              context="comparison"
            />
          </div>

          {/* Quick Comparison Table */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Quick Comparison: USDZ vs GLB</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Feature</th>
                      <th className="text-center py-3 px-4 text-primary">USDZ</th>
                      <th className="text-center py-3 px-4 text-blue-600">GLB</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">iOS Safari AR</td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Android Chrome AR</td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                      <td className="text-center py-3 px-4"><Check className="w-4 h-4 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">File Size</td>
                      <td className="text-center py-3 px-4">Larger</td>
                      <td className="text-center py-3 px-4">Smaller</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">E-commerce Integration</td>
                      <td className="text-center py-3 px-4">Excellent</td>
                      <td className="text-center py-3 px-4">Good</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Setup Complexity</td>
                      <td className="text-center py-3 px-4">Simple</td>
                      <td className="text-center py-3 px-4">Moderate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* USDZ Deep Dive */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">U</div>
              USDZ Format: Apple's AR Standard
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    USDZ Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Native iOS AR Support</div>
                      <div className="text-sm text-muted-foreground">Works directly in Safari without additional libraries</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Simple Implementation</div>
                      <div className="text-sm text-muted-foreground">Just link directly to the USDZ file</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Universal Compatibility</div>
                      <div className="text-sm text-muted-foreground">Works on iOS and Android with proper setup</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-muted-foreground flex items-center gap-2">
                    <X className="w-5 h-5" />
                    USDZ Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <div>• Larger file sizes compared to GLB</div>
                  <div>• Primarily designed for Apple ecosystem</div>
                  <div>• Limited animation support</div>
                  <div>• Fewer editing tools available</div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Best for E-commerce:</h3>
              <p className="text-blue-700 mb-4">
                USDZ is perfect for e-commerce stores because it provides the smoothest AR experience on iOS devices, 
                which represent 60% of mobile commerce traffic. The simple implementation makes it ideal for Shopify, 
                WooCommerce, and other platforms.
              </p>
              <Button onClick={handleTryGenerator} className="bg-blue-600 hover:bg-blue-700">
                Generate USDZ Files Now
              </Button>
            </div>
          </section>

          {/* GLB Deep Dive */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">G</div>
              GLB Format: The Web Standard
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-600 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    GLB Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>• Smaller file sizes</div>
                  <div>• Better animation support</div>
                  <div>• Wide tool ecosystem</div>
                  <div>• Open standard format</div>
                  <div>• More compression options</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-muted-foreground flex items-center gap-2">
                    <X className="w-5 h-5" />
                    GLB Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <div>• No native iOS Safari AR support</div>
                  <div>• Requires model-viewer library</div>
                  <div>• More complex implementation</div>
                  <div>• Additional JavaScript dependencies</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Platform Compatibility */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Platform Compatibility Guide</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    iOS Safari
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-green-600 mb-2">USDZ: ✅ Perfect</div>
                      <div className="text-sm text-muted-foreground">
                        Direct link support, native AR experience, no additional setup required
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-red-500 mb-2">GLB: ❌ No Native AR</div>
                      <div className="text-sm text-muted-foreground">
                        Requires model-viewer, no native AR support
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Android Chrome
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-green-600 mb-2">USDZ: ✅ Good</div>
                      <div className="text-sm text-muted-foreground">
                        Works with model-viewer and WebXR
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600 mb-2">GLB: ✅ Excellent</div>
                      <div className="text-sm text-muted-foreground">
                        Native format for WebXR and model-viewer
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-600" />
                    Desktop Browsers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-green-600 mb-2">USDZ: ✅ 3D Viewer</div>
                      <div className="text-sm text-muted-foreground">
                        3D model viewing (no AR)
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600 mb-2">GLB: ✅ 3D Viewer</div>
                      <div className="text-sm text-muted-foreground">
                        Full 3D model support
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Recommendation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Our Recommendation for E-commerce</h2>
            
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">Choose USDZ</div>
                  <p className="text-lg text-muted-foreground">
                    For most e-commerce businesses, USDZ is the clear winner
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-3">Why USDZ Wins:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• 60% of mobile commerce happens on iOS</li>
                      <li>• Native Safari AR = better user experience</li>
                      <li>• Simple implementation = faster deployment</li>
                      <li>• No JavaScript dependencies = faster loading</li>
                      <li>• Works on Android with proper setup</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Perfect For:</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Shopify stores</li>
                      <li>• WooCommerce sites</li>
                      <li>• Product visualization</li>
                      <li>• Fashion and furniture</li>
                      <li>• Consumer electronics</li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <Button size="lg" onClick={handleTryGenerator}>
                    Generate USDZ Files for Your Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Implementation Examples */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Implementation Examples</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>USDZ Implementation (Recommended)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 mb-4">
                    <code className="text-green-400 text-sm">
{`<!-- Simple HTML link - works immediately on iOS -->
<a href="product-model.usdz" 
   style="background: #007AFF; color: white; padding: 12px 24px; 
          border-radius: 8px; text-decoration: none;">
  📱 View in AR
</a>

<!-- Advanced with model-viewer for Android support -->
<script type="module" src="https://unpkg.com/@google/model-viewer"></script>
<model-viewer 
  src="product-model.usdz"
  ar
  ar-modes="webxr scene-viewer quick-look"
  camera-controls>
</model-viewer>`}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Works perfectly on iOS Safari natively, and on Android Chrome with model-viewer
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GLB Alternative</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black rounded-lg p-4 mb-4">
                    <code className="text-green-400 text-sm">
{`<!-- Requires model-viewer for all AR functionality -->
<script type="module" src="https://unpkg.com/@google/model-viewer"></script>
<model-viewer 
  src="product-model.glb"
  ar
  ar-modes="webxr scene-viewer"
  camera-controls>
</model-viewer>`}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Good for Android, but no native iOS Safari AR support
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Generate Professional USDZ Files?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Skip the complexity of choosing formats. Our AI-powered generator creates optimized USDZ files 
                that work perfectly across all devices and platforms. Just $3 per model.
              </p>
              <Button size="lg" onClick={handleTryGenerator}>
                Generate USDZ Files Now
              </Button>
            </CardContent>
          </Card>

          {/* SEO Footer */}
          <div className="text-center mt-12 text-xs text-muted-foreground/60">
            <p>
              Complete guide covering: USDZ vs GLB comparison, 3D file formats for e-commerce, iOS Safari AR support, 
              Android Chrome WebXR, model-viewer implementation, Shopify 3D models, WooCommerce AR products, 
              e-commerce AR formats, mobile AR compatibility, 3D model optimization
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default USDZvsGLB;