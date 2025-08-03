import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

export const HeroSection = () => {
  const handleGetStarted = () => {
    // Scroll to preview section
    document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePayment = () => {
    // This would integrate with Stripe
    console.log('Redirect to payment');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-surface-gradient overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary))_0%,transparent_50%)] opacity-10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary-glow/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 leading-tight">
          Micro SaaS Name
          <span className="block text-primary text-3xl md:text-4xl mt-2">
            For Target Market
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Small descriptions on how it works, like uploading a file, editing and $3 payment away from fixing the problem.
        </p>

        {/* CTA Button */}
        <Button variant="hero" size="xl" onClick={handleGetStarted}>
          Try It Free →
        </Button>

        {/* Simple benefits */}
        <div className="grid md:grid-cols-3 gap-6 text-center mt-12">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">speed hook</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">No Subscription/Hook 2</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ArrowRight className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">One Time Payment/No Signup/Hook 3</span>
          </div>
        </div>
      </div>
    </section>
  );
};
