import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const FAQSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            USDZ Generator FAQ - Shopify AR & E-commerce
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about generating USDZ 3D models for your e-commerce store
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                How do I add USDZ AR models to my Shopify store?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                After downloading your USDZ file, upload it to your Shopify files section, then add a simple link or model-viewer tag to your product page. The file works instantly with iOS Safari for AR viewing and Android Chrome with WebXR.
                <br /><br />
                <a href="/how-to-add-ar-to-shopify" className="text-primary hover:underline font-medium">
                  → Read our complete Shopify AR integration guide
                </a>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                What's the difference between USDZ and other 3D formats?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                USDZ is Apple's native AR format, optimized for iOS devices and Safari. Unlike GLB or OBJ files, USDZ works seamlessly with iOS AR without requiring additional apps or plugins. It also works on Android through WebXR.
                <br /><br />
                <a href="/usdz-vs-glb-3d-formats" className="text-primary hover:underline font-medium">
                  → See detailed USDZ vs GLB comparison
                </a>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Can I use these models for WooCommerce and other platforms?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely! Our USDZ files work with any e-commerce platform - Shopify, WooCommerce, Magento, BigCommerce, and custom websites. Just upload the file and link to it with HTML or use the model-viewer web component.
                <br /><br />
                <a href="/3d-models-for-woocommerce" className="text-primary hover:underline font-medium">
                  → Complete WooCommerce 3D integration guide
                </a>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                How accurate are the AI-generated product tags?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our Google Vision AI typically achieves 85-95% accuracy in product recognition. It automatically identifies objects, text, and generates relevant e-commerce tags that you can use for SEO and product categorization.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                What image requirements work best for USDZ generation?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Upload 3-6 high-quality images (JPG, PNG, WEBP) showing your product from different angles. Best results come from clear, well-lit photos with plain backgrounds. Each image can be up to 10MB.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Do customers need special apps to view AR models?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No apps required! On iOS (iPhone/iPad), customers can view AR directly in Safari. On Android, it works through Chrome with WebXR. The experience is native and seamless for your customers.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                How does this compare to hiring 3D modeling agencies?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Traditional 3D agencies charge $500+ per model and take weeks to deliver. Our AI-powered solution costs just $3 and generates professional AR-ready models in minutes, perfect for e-commerce at scale.
                <br /><br />
                <a href="/cheap-3d-modeling-alternative" className="text-primary hover:underline font-medium">
                  → See detailed cost comparison: $3 vs $500+ agencies
                </a>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Can I preview the 3D model before paying?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! You can see the generated USDZ model, AI-detected product tags, and file details completely free. Only pay the $3 when you're satisfied and ready to download for your store.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};