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
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our PDF editing service
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Why no subscription? How do you make money?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We believe in fair pricing. You only pay when you actually use the service and download a file. 
                This means you're never paying for features you don't use, and we're incentivized to provide 
                value every single time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Is my data secure? What happens to my files?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, absolutely. Your files are processed securely and automatically deleted from our servers 
                within 24 hours. We don't store, share, or use your files for any other purpose. All 
                processing happens over encrypted connections.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                What file formats do you support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We currently support PDF files up to 25MB in size. The edited file will be returned in the 
                same PDF format, maintaining the original quality and structure while applying your changes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Can I get a refund if I'm not satisfied?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Since you can try the service completely free and preview the results before paying, 
                refunds are generally not needed. However, if there's a technical issue with your file 
                processing, contact us and we'll resolve it or provide a refund.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                How long does processing take?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Most PDF edits are processed in under 30 seconds. Complex files or extensive edits might 
                take up to 2 minutes. You'll see a real-time progress indicator during processing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="text-left">
                Do you offer bulk processing or API access?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Currently, we focus on individual file processing to keep things simple and affordable. 
                If you have bulk processing needs, reach out to us and we can discuss custom solutions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};