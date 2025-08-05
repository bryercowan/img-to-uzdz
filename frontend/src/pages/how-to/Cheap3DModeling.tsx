import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Clock, Zap, Users, CheckCircle, X } from "lucide-react";
import { CompactGenerator } from "@/components/CompactGenerator";

export const Cheap3DModeling = () => {
  useEffect(() => {
    document.title = "Cheap 3D Modeling Alternative - $3 vs $500+ Agencies | AI-Powered USDZ Generator";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Skip expensive 3D modeling agencies. Generate professional USDZ models from photos for just $3. AI-powered, instant results, perfect for e-commerce AR.');
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
              Try $3 Alternative
            </Button>
          </div>
        </div>
      </header>

      <article className="py-12">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Article Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <DollarSign className="w-4 h-4 mr-2" />
              Cost Comparison
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Cheap 3D Modeling Alternative: $3 vs $500+ Agencies
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stop paying thousands for 3D product models. Our AI-powered USDZ generator creates professional 
              AR-ready models from photos in minutes, not weeks—for 167x less cost.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
              <Badge variant="secondary" className="bg-green-100 text-green-800">$3 per model</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">5-minute delivery</Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">AI-powered</Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">AR-ready</Badge>
            </div>
          </div>

          {/* Compact Generator - Immediate Action */}
          <div className="mb-12">
            <CompactGenerator 
              title="Try the $3 Alternative - Generate USDZ Files Now"
              subtitle="Skip expensive agencies. Upload images and get professional models in 5 minutes"
              context="cost-savings"
            />
          </div>

          {/* Cost Comparison Hero */}
          <section className="mb-12">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="text-red-600 font-bold text-sm mb-2">TRADITIONAL 3D AGENCIES</div>
                    <div className="text-4xl font-bold text-red-600 mb-4">$500-2000</div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>🕐 2-4 weeks delivery</div>
                      <div>💼 Project management required</div>
                      <div>🔄 Revision costs extra</div>
                      <div>📋 Minimum order quantities</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-green-600 font-bold text-sm mb-2">IMG TO USDZ AI</div>
                    <div className="text-4xl font-bold text-green-600 mb-4">$3</div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>⚡ 5-minute delivery</div>
                      <div>🎯 No project management</div>
                      <div>👁️ Free preview before paying</div>
                      <div>🚀 Start with just one model</div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <Button size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑ Use Generator Above - Try $3 Alternative
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Why Agencies Are So Expensive */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Why Are 3D Modeling Agencies So Expensive?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Traditional Agency Costs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Human 3D Artists</div>
                      <div className="text-sm text-muted-foreground">$50-150/hour specialist rates</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Manual Labor</div>
                      <div className="text-sm text-muted-foreground">10-40 hours per model</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Business Overhead</div>
                      <div className="text-sm text-muted-foreground">Offices, software licenses, management</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Project Management</div>
                      <div className="text-sm text-muted-foreground">Coordination, revisions, client communication</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-600">Our AI Advantage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">AI Automation</div>
                      <div className="text-sm text-muted-foreground">No human labor costs</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Instant Processing</div>
                      <div className="text-sm text-muted-foreground">Minutes instead of weeks</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Minimal Overhead</div>
                      <div className="text-sm text-muted-foreground">Cloud-based, automated infrastructure</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Self-Service</div>
                      <div className="text-sm text-muted-foreground">No project management needed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Detailed Comparison */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Detailed Cost & Time Comparison</h2>
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Factor</th>
                        <th className="text-center py-3 px-4 text-red-600">3D Agencies</th>
                        <th className="text-center py-3 px-4 text-green-600">IMG to USDZ</th>
                        <th className="text-center py-3 px-4 text-blue-600">Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Cost per model</td>
                        <td className="text-center py-3 px-4 text-red-600">$500-2000</td>
                        <td className="text-center py-3 px-4 text-green-600">$3</td>
                        <td className="text-center py-3 px-4 text-blue-600">99.4%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Delivery time</td>
                        <td className="text-center py-3 px-4 text-red-600">2-4 weeks</td>
                        <td className="text-center py-3 px-4 text-green-600">5 minutes</td>
                        <td className="text-center py-3 px-4 text-blue-600">99.98%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Minimum order</td>
                        <td className="text-center py-3 px-4 text-red-600">5-10 models</td>
                        <td className="text-center py-3 px-4 text-green-600">1 model</td>
                        <td className="text-center py-3 px-4 text-blue-600">No minimum</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Revision cost</td>
                        <td className="text-center py-3 px-4 text-red-600">$100-500</td>
                        <td className="text-center py-3 px-4 text-green-600">Generate new $3</td>
                        <td className="text-center py-3 px-4 text-blue-600">97-99%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Project management</td>
                        <td className="text-center py-3 px-4 text-red-600">Required</td>
                        <td className="text-center py-3 px-4 text-green-600">Self-service</td>
                        <td className="text-center py-3 px-4 text-blue-600">100%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">AR compatibility</td>
                        <td className="text-center py-3 px-4 text-red-600">Extra cost</td>
                        <td className="text-center py-3 px-4 text-green-600">Included</td>
                        <td className="text-center py-3 px-4 text-blue-600">Free</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Real World Examples */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Real-World Cost Examples</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Small Business (10 products)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Agency Cost:</div>
                      <div className="text-xl font-bold text-red-600">$5,000-20,000</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">IMG to USDZ:</div>
                      <div className="text-xl font-bold text-green-600">$30</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="text-sm font-bold text-green-800">Save $4,970-19,970</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="text-orange-800">Medium Store (50 products)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Agency Cost:</div>
                      <div className="text-xl font-bold text-red-600">$25,000-100,000</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">IMG to USDZ:</div>
                      <div className="text-xl font-bold text-green-600">$150</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="text-sm font-bold text-green-800">Save $24,850-99,850</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">Enterprise (200 products)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Agency Cost:</div>
                      <div className="text-xl font-bold text-red-600">$100,000-400,000</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">IMG to USDZ:</div>
                      <div className="text-xl font-bold text-green-600">$600</div>
                    </div>
                    <div className="bg-green-100 p-2 rounded text-center">
                      <div className="text-sm font-bold text-green-800">Save $99,400-399,400</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quality Comparison */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">But What About Quality?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agency Models vs AI Models</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Both create professional AR-ready models</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Both work on iOS Safari & Android Chrome</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Both integrate with e-commerce platforms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm">AI models include automatic product tagging</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">AI Advantages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-blue-700 text-sm">
                  <div>• Consistent quality across all models</div>
                  <div>• No human error or style variations</div>
                  <div>• Optimized for mobile AR performance</div>
                  <div>• Google Vision AI provides accurate product tags</div>
                  <div>• Instant iterations - try different approaches</div>
                  <div>• Preview before paying ensures satisfaction</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Success Stories */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Businesses That Made the Switch</h2>
            <div className="space-y-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">📱</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800 mb-2">TechGadgets Pro - Electronics Store</h3>
                      <p className="text-green-700 text-sm mb-3">
                        "We were quoted $50,000 for 3D models of our 100 products. With IMG to USDZ, we spent $300 
                        and had all models ready in a day. Our AR conversion rate increased 31%."
                      </p>
                      <div className="text-xs text-green-600">
                        <strong>Saved: $49,700</strong> • <strong>Time saved: 4 weeks</strong>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🏠</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-800 mb-2">ModernHome Decor - Furniture</h3>
                      <p className="text-blue-700 text-sm mb-3">
                        "3D agencies wanted $2,000 per furniture piece. We generate USDZ models for $3 each and 
                        customers love seeing furniture in their space with AR."
                      </p>
                      <div className="text-xs text-blue-600">
                        <strong>Cost per model: $3 vs $2,000</strong> • <strong>ROI: 66,567%</strong>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl">👗</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-800 mb-2">Fashion Forward - Accessories</h3>
                      <p className="text-purple-700 text-sm mb-3">
                        "Started with 5 models from an agency ($5,000). Switched to AI generation and now have 
                        200+ products with AR for less than $600 total."
                      </p>
                      <div className="text-xs text-purple-600">
                        <strong>Scale achieved: 40x more models</strong> • <strong>Same budget</strong>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ROI Calculator */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Calculate Your Savings</h2>
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Number of Products</div>
                    <div className="text-3xl font-bold mb-4">?</div>
                    <div className="space-y-2 text-sm">
                      <div>Agency: ? × $500 = <span className="text-red-600 font-bold">$?</span></div>
                      <div>IMG to USDZ: ? × $3 = <span className="text-green-600 font-bold">$?</span></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Time to Market</div>
                    <div className="text-3xl font-bold mb-4">⚡</div>
                    <div className="space-y-2 text-sm">
                      <div>Agency: <span className="text-red-600">2-4 weeks</span></div>
                      <div>IMG to USDZ: <span className="text-green-600">Same day</span></div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Your Savings</div>
                    <div className="text-3xl font-bold text-green-600 mb-4">99%+</div>
                    <div className="space-y-2 text-sm">
                      <div>Cost savings: <span className="text-green-600">99.4%</span></div>
                      <div>Time savings: <span className="text-green-600">99.98%</span></div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <Button size="lg" onClick={handleTryGenerator}>
                    Start Saving Today - Try Free
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Final CTA */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Skip the $500+ Agency Fees?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of businesses that discovered the smart alternative to expensive 3D modeling agencies. 
                Generate professional USDZ models in minutes, not weeks—for 167x less cost.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleTryGenerator}>
                  Generate Your First Model Free
                </Button>
                <Button variant="outline" size="lg" onClick={handleBackToHome}>
                  Learn More About the Technology
                </Button>
              </div>
              <div className="mt-6 text-sm text-muted-foreground">
                No contracts • No minimums • Preview before paying • $3 only when you download
              </div>
            </CardContent>
          </Card>

          {/* SEO Footer */}
          <div className="text-center mt-12 text-xs text-muted-foreground/60">
            <p>
              Alternatives to: expensive 3D modeling agencies, high-cost product modeling, traditional 3D services, 
              costly AR model creation, expensive product visualization, high-priced 3D rendering, 
              traditional modeling studios, costly e-commerce 3D solutions
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Cheap3DModeling;