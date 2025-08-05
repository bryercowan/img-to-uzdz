import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  // Example Models Section
  const exampleModels = [
    {
      name: "Modern Home Decor",
      type: "USDZ 3D Model",
      url: "#example-url-1"
    },
    {
      name: "Tech Gadgets Pro",
      type: "USDZ AR Model",
      url: "#example-url-2"
    },
    {
      name: "Fashion Forward",
      type: "USDZ Jewelry Model",
      url: "#example-url-3"
    }
  ];

  // Industry Statistics Section
  const industryStats = {
    conversionIncrease: 64,
    costSavings: 70,
    userEngagementGrowth: 150
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Star className="w-4 h-4 mr-2 fill-current" />
            USDZ Examples & Industry Impact
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            See How USDZ Models Transform E-commerce
          </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore examples of our USDZ models and learn how they can transform your business. Discover the impact of 3D and AR technology in e-commerce.
        </p>
        </div>


        {/* Example Models Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 text-center">
          {exampleModels.map((model, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="font-bold text-lg">{model.name}</div>
                <div className="text-sm text-muted-foreground">{model.type}</div>
                <a href={model.url} className="text-primary hover:underline">View Example</a>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Industry Statistics Section */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{industryStats.conversionIncrease}%</div>
              <div className="text-sm text-muted-foreground">Increase in Conversion Rate with AR</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{industryStats.costSavings}%</div>
              <div className="text-sm text-muted-foreground">Reduction in Modeling Costs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{industryStats.userEngagementGrowth}%</div>
              <div className="text-sm text-muted-foreground">Growth in User Engagement with 3D Models</div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Trusted by e-commerce businesses worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <div className="text-lg font-semibold">Shopify</div>
            <div className="text-lg font-semibold">WooCommerce</div>
            <div className="text-lg font-semibold">Magento</div>
            <div className="text-lg font-semibold">BigCommerce</div>
            <div className="text-lg font-semibold">Custom Platforms</div>
          </div>
        </div>

        {/* SEO Footer */}
        <div className="text-center mt-12 text-xs text-muted-foreground/60 max-w-4xl mx-auto">
          <p>
            Success stories from: Shopify AR implementation, WooCommerce 3D products, Magento AR models, 
            BigCommerce 3D visualization, custom e-commerce AR solutions, iOS Safari AR shopping, 
            Android Chrome AR experiences, mobile AR commerce, USDZ product displays
          </p>
        </div>
      </div>
    </section>
  );
};