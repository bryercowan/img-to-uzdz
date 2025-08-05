import { Badge } from "@/components/ui/badge";
import { Check, X, DollarSign, Clock, UserCheck, ShoppingCart, Smartphone, Globe } from "lucide-react";

export const BenefitsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Perfect for E-commerce
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Why Shopify Stores Choose Our USDZ Generator
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlike expensive 3D modeling agencies or complex subscription tools, get professional AR-ready models instantly at a fraction of the cost.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Our way */}
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">IMG to USDZ</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Generate unlimited previews for free</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Pay $3 only when you download</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Works with Shopify, WooCommerce, Magento</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>AI-powered product recognition</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>iOS Safari & Android Chrome compatible</span>
              </li>
            </ul>
          </div>

          {/* Other services */}
          <div className="bg-muted/50 p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-muted-foreground">3D Modeling Agencies</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">$500+ per model</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">2-4 weeks delivery time</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Requires project management</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Complex revision process</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">High minimum orders</span>
              </li>
            </ul>
          </div>
        </div>

        {/* E-commerce focused stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">$3</div>
            <div className="text-sm text-muted-foreground">vs $500+ agencies</div>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{"<5min"}</div>
            <div className="text-sm text-muted-foreground">vs weeks waiting</div>
          </div>
          <div className="text-center">
            <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">All</div>
            <div className="text-sm text-muted-foreground">E-commerce platforms</div>
          </div>
          <div className="text-center">
            <Smartphone className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">AR</div>
            <div className="text-sm text-muted-foreground">iOS & Android ready</div>
          </div>
        </div>

        {/* E-commerce integration showcase */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6">Integrate with Your E-commerce Platform</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-green-600">Shopify</h4>
                <p className="text-sm text-muted-foreground">Direct USDZ upload to product pages</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-blue-600">WooCommerce</h4>
                <p className="text-sm text-muted-foreground">WordPress AR product displays</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-orange-600">Any Platform</h4>
                <p className="text-sm text-muted-foreground">Simple HTML integration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
