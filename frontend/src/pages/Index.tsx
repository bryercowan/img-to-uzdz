import { HeroSection } from "@/components/HeroSection";
import { CompactGenerator } from "@/components/CompactGenerator";
import { BenefitsSection } from "@/components/BenefitsSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { TutorialSection } from "@/components/TutorialSection";
import { FAQSection } from "@/components/FAQSection";
import { AuthModal } from "@/components/AuthModal";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { apiService } from "../services/api";
import { useState, useEffect } from "react";

const Index = () => {
  const [isPaid, setIsPaid] = useState(false);
  const [theme, setTheme] = useState('default');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Check authentication status and URL hash
  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated());
    
    if (window.location.hash === '#success') {
      setIsPaid(true);
    }
    
    // Theme switching via environment variable simulation
    const urlParams = new URLSearchParams(window.location.search);
    const themeParam = urlParams.get('theme');
    if (themeParam && ['green', 'orange'].includes(themeParam)) {
      setTheme(themeParam);
      document.documentElement.className = `theme-${themeParam}`;
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowDashboard(false);
  };

  // Show dashboard if authenticated and requested
  if (showDashboard && isAuthenticated) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen font-inter">
      {/* Navigation Bar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="font-bold text-xl">3D Model API</div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDashboard(true)}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAuthModal(true)}
                  >
                    API Access
                  </Button>
                  <Button>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      
      {/* Studio Section */}
      <section id="preview" className="py-24 bg-background relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Studio: Try it Free
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload 3-6 images of your product. Preview for free, pay $3 to download your 3D model. No signup required.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <CompactGenerator 
              title="Generate Your 3D Models Now"
              subtitle="Upload 3-6 product images and get AR-ready models in minutes"
            />
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Try for free or subscribe for batch processing and API access
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Studio Tier */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h3 className="text-2xl font-bold mb-2">Studio</h3>
              <p className="text-gray-600 mb-4">Perfect for testing and one-off projects</p>
              <div className="text-4xl font-bold mb-6">$3<span className="text-lg text-gray-500">/job</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>No signup required</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>GLB + USDZ output</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Fast processing (~5 min)</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>One-time payment</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Single job processing</li>
              </ul>
              <Button className="w-full" size="lg" onClick={() => document.getElementById('preview')?.scrollIntoView()}>
                Try Studio Now
              </Button>
            </div>

            {/* Subscription Tier */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">Popular</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Subscription</h3>
              <p className="text-gray-600 mb-4">For developers and power users</p>
              <div className="text-4xl font-bold mb-6">1-2.5<span className="text-lg text-gray-500"> credits/job</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Credit-based billing</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Batch upload (multiple jobs)</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>API key access</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Webhook notifications</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Job management dashboard</li>
                <li className="flex items-center"><span className="text-green-500 mr-3">✓</span>Credit packages available</li>
              </ul>
              <Button className="w-full" size="lg" onClick={() => setShowAuthModal(true)}>
                Get Subscription Access
              </Button>
            </div>
          </div>
          
          {/* Credit Packages */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-6">Credit Packages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-bold">Starter</h4>
                <div className="text-2xl font-bold my-2">$10</div>
                <p className="text-sm text-gray-600">10 credits • $1/credit</p>
              </div>
              <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                <h4 className="font-bold">Professional</h4>
                <div className="text-2xl font-bold my-2">$45</div>
                <p className="text-sm text-gray-600">50 credits • $0.90/credit</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">10% off</span>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-bold">Enterprise</h4>
                <div className="text-2xl font-bold my-2">$160</div>
                <p className="text-sm text-gray-600">200 credits • $0.80/credit</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">20% off</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BenefitsSection />
      <TestimonialsSection />
      <TutorialSection />
      <FAQSection />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={handleAuthenticated}
      />
      
      {/* Theme switcher for demo */}
      <div className="fixed bottom-4 right-4 flex gap-2 z-50">
        <button 
          onClick={() => {setTheme('default'); document.documentElement.className = '';}}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 border-2 border-white shadow-lg"
          title="Default theme"
        />
        <button 
          onClick={() => {setTheme('green'); document.documentElement.className = 'theme-green';}}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 border-2 border-white shadow-lg"
          title="Green theme"
        />
        <button 
          onClick={() => {setTheme('orange'); document.documentElement.className = 'theme-orange';}}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 border-2 border-white shadow-lg"
          title="Orange theme"
        />
      </div>
    </div>
  );
};

export default Index;