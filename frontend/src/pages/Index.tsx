import { HeroSection } from "@/components/HeroSection";
import { PreviewSection } from "@/components/PreviewSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { FAQSection } from "@/components/FAQSection";
import { useState, useEffect } from "react";

const Index = () => {
  const [isPaid, setIsPaid] = useState(false);
  const [theme, setTheme] = useState('default');

  // Check URL hash for payment success
  useEffect(() => {
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

  return (
    <div className="min-h-screen font-inter">
      <HeroSection />
      <PreviewSection />
      <BenefitsSection />
      <FAQSection />
      
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