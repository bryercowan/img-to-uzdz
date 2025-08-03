import { Badge } from "@/components/ui/badge";
import { Check, X, DollarSign, Clock, UserCheck } from "lucide-react";

export const BenefitsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Simple. Fast. Fair.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlike other services, we don't lock you into subscriptions for simple tasks.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Our way */}
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Our Way</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Try completely free</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Pay $2 only when you download</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>No account required</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Use immediately</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Files auto-deleted for privacy</span>
              </li>
            </ul>
          </div>

          {/* Other services */}
          <div className="bg-muted/50 p-6 rounded-xl border">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-muted-foreground">Other Services</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">$15+/month subscriptions</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Pay even if you don't use it</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Account signup required</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Complex onboarding</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Hard to cancel</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">$2</div>
            <div className="text-sm text-muted-foreground">Per file</div>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{"<30s"}</div>
            <div className="text-sm text-muted-foreground">Processing time</div>
          </div>
          <div className="text-center">
            <UserCheck className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Sign-ups needed</div>
          </div>
        </div>
      </div>
    </section>
  );
};
