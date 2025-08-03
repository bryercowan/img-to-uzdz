import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Shield, Clock, Star, CreditCard } from "lucide-react";

export const PaymentSection = () => {
  const handlePayment = () => {
    // This would integrate with Stripe for one-time payment
    console.log('Processing payment...');
    // For template purposes, simulate payment success
    setTimeout(() => {
      window.location.href = '#success';
    }, 2000);
  };

  const features = [
    "Unlimited data processing",
    "Advanced AI algorithms", 
    "Custom integrations",
    "Priority email support",
    "Lifetime updates",
    "Commercial license",
    "API access",
    "Export capabilities"
  ];

  return (
    <section id="payment" className="py-24 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <CreditCard className="w-4 h-4 mr-2" />
            One-Time Payment
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Unlock Full Power
            <span className="block text-primary">Forever</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No subscriptions, no recurring fees. Pay once, own forever.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Pricing card */}
            <Card className="relative border-2 border-primary shadow-glow-primary bg-gradient-to-br from-background to-primary/5">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-6 py-2 text-sm font-semibold">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </Badge>
              </div>

              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl font-bold">
                  Complete Solution
                </CardTitle>
                <CardDescription className="text-lg">
                  Everything you need to transform your business
                </CardDescription>
                
                <div className="py-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-primary">$99</span>
                    <span className="text-muted-foreground line-through text-xl">$299</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    One-time payment • Lifetime access
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features list */}
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handlePayment}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Get Instant Access - $99
                </Button>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Secure Payment
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Instant Access
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Value proposition */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Why choose our solution?</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Instant Results</h4>
                      <p className="text-sm text-muted-foreground">
                        Start seeing improvements immediately after purchase. No learning curve required.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">30-Day Guarantee</h4>
                      <p className="text-sm text-muted-foreground">
                        Not satisfied? Get a full refund within 30 days, no questions asked.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Lifetime Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive all future updates and improvements at no additional cost.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              <Card className="bg-muted/50 border-muted">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <blockquote className="text-sm italic mb-3">
                    "This solution transformed our business operations overnight. The ROI was immediate and the results exceeded our expectations."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-full" />
                    <div>
                      <div className="font-medium text-sm">Sarah Johnson</div>
                      <div className="text-xs text-muted-foreground">CEO, TechCorp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Urgency */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Limited Time Offer</h4>
                <p className="text-sm text-muted-foreground">
                  Save $200 off the regular price. This introductory pricing won't last forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};