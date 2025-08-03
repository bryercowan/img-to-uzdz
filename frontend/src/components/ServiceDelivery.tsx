import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Settings, BarChart, FileText, Share2, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ServiceDeliveryProps {
  isPaid?: boolean;
}

export const ServiceDelivery = ({ isPaid = false }: ServiceDeliveryProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setResults({
        efficiency: 94,
        savings: 8750,
        insights: 12,
        optimizations: 8
      });
      setIsProcessing(false);
    }, 3000);
  };

  const handleDownload = () => {
    // Simulate download
    console.log('Downloading full report...');
  };

  if (!isPaid) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Settings className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Service Area</h2>
            <p className="text-muted-foreground mb-8">
              This section will be unlocked after payment. Experience the full power of our solution with unlimited access to all features.
            </p>
            <Button variant="outline" disabled>
              Payment Required
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="service" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Settings className="w-4 h-4 mr-2" />
            Full Access Unlocked
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Your Personal
            <span className="block text-primary">AI Assistant</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Access all premium features and generate unlimited results with our advanced AI algorithms.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main processor */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-primary" />
                  Advanced Analytics Engine
                </CardTitle>
                <CardDescription>
                  Generate comprehensive insights and optimizations for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!results && !isProcessing && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BarChart className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Ready to analyze your data</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload your data or connect your systems to get started with advanced analytics
                    </p>
                    <Button variant="hero" onClick={handleGenerate}>
                      Generate Full Analysis
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Processing your data...</h3>
                    <p className="text-muted-foreground mb-6">
                      Our AI is analyzing your data and generating personalized insights
                    </p>
                    <div className="w-full bg-muted rounded-full h-2 mb-4">
                      <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}} />
                    </div>
                  </div>
                )}

                {results && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-primary/5 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">{results.efficiency}%</div>
                        <div className="text-sm text-muted-foreground">Efficiency</div>
                      </div>
                      <div className="bg-primary/5 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">${results.savings.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Savings</div>
                      </div>
                      <div className="bg-primary/5 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">{results.insights}</div>
                        <div className="text-sm text-muted-foreground">Insights</div>
                      </div>
                      <div className="bg-primary/5 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary">{results.optimizations}</div>
                        <div className="text-sm text-muted-foreground">Optimizations</div>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-primary mb-3">Key Recommendations</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          Optimize workflow automation to increase efficiency by 25%
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          Implement suggested cost reduction strategies for $8,750 annual savings
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          Leverage AI-driven insights to improve decision making
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="default" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Results
                      </Button>
                      <Button variant="ghost" onClick={handleGenerate}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Processing Power</span>
                    <span>Unlimited</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>API Calls</span>
                    <span>∞</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Storage</span>
                    <span>Unlimited</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-primary mb-2">Premium Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need help? Our priority support team is here to assist you.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};