import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Globe, Code, Smartphone, Upload } from "lucide-react";
import { CompactGenerator } from "@/components/CompactGenerator";

export const WooCommerce3D = () => {
  useEffect(() => {
    document.title = "3D Models for WooCommerce - Add AR Product Visualization | WordPress Guide 2024";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Complete guide to add 3D models and AR to WooCommerce stores. Step-by-step USDZ integration for WordPress e-commerce with mobile AR support.');
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
              <Globe className="w-4 h-4 mr-2" />
              WooCommerce Guide
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              3D Models for WooCommerce: Complete AR Integration Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Step-by-step guide to add 3D product models and AR visualization to your WooCommerce store. 
              Increase engagement and reduce returns with immersive product experiences.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span>🛒 WooCommerce Compatible</span>
              <span>📱 Mobile AR Ready</span>
              <span>⚡ No Plugins Required</span>
              <span>💰 $3 per Model</span>
            </div>
          </div>

          {/* Compact Generator */}
          <div className="mb-12">
            <CompactGenerator 
              title="Generate USDZ Files for WooCommerce"
              subtitle="Upload product images and get WordPress-ready 3D models in minutes"
              context="woocommerce"
            />
          </div>

          {/* Why 3D Models for WooCommerce */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Why Add 3D Models to Your WooCommerce Store?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">27%</div>
                  <div className="text-sm text-green-700">Higher conversion rates with AR product views</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">64%</div>
                  <div className="text-sm text-blue-700">Reduction in product returns</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">3.2x</div>
                  <div className="text-sm text-purple-700">Longer time spent on product pages</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Step 1: Generate USDZ Files */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">1</div>
              Generate USDZ 3D Models
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Before adding 3D models to WooCommerce, you need professional USDZ files. Our AI-powered generator 
                creates them from product photos in minutes.
              </p>
              
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    USDZ Generation Process
                  </h3>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div className="font-medium">Upload Images</div>
                      <div className="text-muted-foreground">3-6 product photos</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Code className="w-6 h-6 text-primary" />
                      </div>
                      <div className="font-medium">AI Processing</div>
                      <div className="text-muted-foreground">Auto-tagging & analysis</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-primary" />
                      </div>
                      <div className="font-medium">Preview Model</div>
                      <div className="text-muted-foreground">See before paying</div>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <div className="font-medium">Download USDZ</div>
                      <div className="text-muted-foreground">AR-ready file</div>
                    </div>
                  </div>
                  <Button onClick={handleTryGenerator} className="mt-4">
                    Generate USDZ Files for WooCommerce
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Step 2: Add to WordPress Media Library */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">2</div>
              Upload to WordPress Media Library
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                  <div>
                    <div className="font-medium">Access WordPress Admin</div>
                    <div className="text-muted-foreground">Log into your WordPress dashboard</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                  <div>
                    <div className="font-medium">Go to Media → Add New</div>
                    <div className="text-muted-foreground">Navigate to the media library section</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                  <div>
                    <div className="font-medium">Upload USDZ Files</div>
                    <div className="text-muted-foreground">Drag and drop or select your USDZ models</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">4</div>
                  <div>
                    <div className="font-medium">Copy File URLs</div>
                    <div className="text-muted-foreground">Copy the URL of each uploaded USDZ file</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-yellow-800 mb-2">📝 Note on File Types</h4>
              <p className="text-yellow-700 text-sm">
                WordPress may not recognize .usdz files by default. You can rename them to .zip for upload, 
                or add this code to your theme's functions.php to allow USDZ uploads:
              </p>
              <div className="bg-black rounded p-2 mt-2">
                <code className="text-green-400 text-xs">
                  {`add_filter('upload_mimes', function($mimes) { $mimes['usdz'] = 'model/vnd.usdz+zip'; return $mimes; });`}
                </code>
              </div>
            </div>
          </section>

          {/* Step 3: Add Model Viewer */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">3</div>
              Add Model Viewer to Your Theme
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Add the model-viewer library to your theme to enable 3D visualization and AR functionality.
              </p>
              
              <Card>
                <CardHeader>
                  <CardTitle>Method 1: Add to Theme Header (Recommended)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add this script tag to your theme's header.php file, just before the closing &lt;/head&gt; tag:
                  </p>
                  <div className="bg-black rounded-lg p-4">
                    <code className="text-green-400 text-sm">
{`<!-- Add to header.php before </head> -->
<script type="module" 
  src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js">
</script>`}
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Method 2: Using WordPress Functions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add this to your theme's functions.php file:
                  </p>
                  <div className="bg-black rounded-lg p-4">
                    <code className="text-green-400 text-sm whitespace-pre-wrap">
{`function enqueue_model_viewer() {
    wp_enqueue_script(
        'model-viewer', 
        'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js',
        array(),
        '1.0',
        false
    );
    wp_script_add_data('model-viewer', 'type', 'module');
}
add_action('wp_enqueue_scripts', 'enqueue_model_viewer');`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Step 4: Add to Product Pages */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">4</div>
              Add 3D Models to Product Pages
            </h2>
            <div className="space-y-6">
              <p className="text-muted-foreground text-lg">
                Now add the 3D model viewer to your individual product pages. You have several options:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Option 1: Product Description</CardTitle>
                    <p className="text-sm text-muted-foreground">Add directly to product content</p>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black rounded-lg p-4 mb-4">
                      <code className="text-green-400 text-sm whitespace-pre-wrap">
{`<!-- Add this HTML to product description -->
<div style="margin: 20px 0;">
  <model-viewer 
    src="YOUR_USDZ_FILE_URL"
    alt="Product 3D Model"
    ar
    ar-modes="webxr scene-viewer quick-look"
    camera-controls
    poster="product-image.jpg"
    style="width: 100%; height: 400px; 
           border-radius: 8px;">
    
    <button slot="ar-button" 
      style="background: #0073aa; 
             color: white; 
             padding: 12px 24px; 
             border: none; 
             border-radius: 4px;">
      📱 View in AR
    </button>
  </model-viewer>
</div>`}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Option 2: Custom Shortcode</CardTitle>
                    <p className="text-sm text-muted-foreground">Create reusable shortcode</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Add to functions.php:</p>
                        <div className="bg-black rounded-lg p-4">
                          <code className="text-green-400 text-xs whitespace-pre-wrap">
{`function usdz_model_shortcode($atts) {
    $atts = shortcode_atts(array(
        'src' => '',
        'poster' => '',
        'height' => '400px'
    ), $atts);
    
    return '<model-viewer 
        src="' . $atts['src'] . '"
        poster="' . $atts['poster'] . '"
        ar camera-controls
        style="width: 100%; height: ' . $atts['height'] . ';">
    </model-viewer>';
}
add_shortcode('usdz_model', 'usdz_model_shortcode');`}
                          </code>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Use in products:</p>
                        <div className="bg-gray-100 rounded p-2">
                          <code className="text-sm">
                            [usdz_model src="model.usdz" poster="thumb.jpg"]
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Step 5: Test Implementation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold">5</div>
              Test Your 3D Models
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800">📱 Mobile Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-blue-700">
                  <div>
                    <div className="font-medium">iOS Safari:</div>
                    <div className="text-sm">Native AR support, tap AR button</div>
                  </div>
                  <div>
                    <div className="font-medium">Android Chrome:</div>
                    <div className="text-sm">WebXR AR, tap AR button</div>
                  </div>
                  <div>
                    <div className="font-medium">Performance:</div>
                    <div className="text-sm">Test loading speed on mobile data</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">💻 Desktop Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-green-700">
                  <div>
                    <div className="font-medium">3D Viewer:</div>
                    <div className="text-sm">Rotate, zoom, pan functionality</div>
                  </div>
                  <div>
                    <div className="font-medium">Loading:</div>
                    <div className="text-sm">Check poster image displays first</div>
                  </div>
                  <div>
                    <div className="font-medium">Responsive:</div>
                    <div className="text-sm">Test on different screen sizes</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Advanced Customization */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Advanced WooCommerce Customization</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automatic USDZ Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add this code to automatically display 3D models when a USDZ file is uploaded to a product:
                  </p>
                  <div className="bg-black rounded-lg p-4">
                    <code className="text-green-400 text-xs whitespace-pre-wrap">
{`// Add to functions.php
function auto_display_usdz_models() {
    global $product;
    
    $attachments = $product->get_gallery_image_ids();
    foreach ($attachments as $attachment_id) {
        $file_url = wp_get_attachment_url($attachment_id);
        if (pathinfo($file_url, PATHINFO_EXTENSION) === 'usdz') {
            echo '<div class="product-3d-model" style="margin: 20px 0;">
                    <model-viewer 
                      src="' . $file_url . '"
                      ar camera-controls
                      style="width: 100%; height: 400px;">
                    </model-viewer>
                  </div>';
            break;
        }
    }
}
add_action('woocommerce_single_product_summary', 'auto_display_usdz_models', 25);`}
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Product Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add a dedicated USDZ field to product admin:
                  </p>
                  <div className="bg-black rounded-lg p-4">
                    <code className="text-green-400 text-xs whitespace-pre-wrap">
{`// Add USDZ field to product admin
add_action('woocommerce_product_options_general_product_data', 'add_usdz_field');
function add_usdz_field() {
    woocommerce_wp_text_input(array(
        'id' => '_usdz_model_url',
        'label' => 'USDZ Model URL',
        'placeholder' => 'https://yoursite.com/model.usdz',
        'desc_tip' => true,
        'description' => 'URL to the USDZ 3D model file'
    ));
}

// Save the field
add_action('woocommerce_process_product_meta', 'save_usdz_field');
function save_usdz_field($post_id) {
    $usdz_url = $_POST['_usdz_model_url'];
    if (!empty($usdz_url)) {
        update_post_meta($post_id, '_usdz_model_url', esc_url($usdz_url));
    }
}`}
                    </code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Performance Tips */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Performance Optimization</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>File Optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>• Keep USDZ files under 5MB for fast loading</div>
                  <div>• Use optimized textures (1024x1024 max)</div>
                  <div>• Compress models without losing quality</div>
                  <div>• Test loading on mobile networks</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Caching & CDN</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>• Use a CDN for faster global delivery</div>
                  <div>• Enable browser caching for USDZ files</div>
                  <div>• Preload critical 3D models</div>
                  <div>• Lazy load models below the fold</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Add 3D Models to Your WooCommerce Store?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Generate professional USDZ files from your product images in minutes. No expensive 3D modeling agencies, 
                no complex setup. Just upload, generate, and integrate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={handleTryGenerator}>
                  Generate USDZ Files for WooCommerce
                </Button>
                <Button variant="outline" size="lg" onClick={handleBackToHome}>
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO Footer */}
          <div className="text-center mt-12 text-xs text-muted-foreground/60">
            <p>
              Complete guide covering: WooCommerce 3D models, WordPress AR integration, USDZ file upload, 
              model-viewer implementation, WooCommerce AR products, WordPress 3D visualization, 
              e-commerce AR solutions, mobile AR shopping, product 3D models, WooCommerce customization
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default WooCommerce3D;