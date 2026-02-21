import SEOHead from '../components/common/SEOHead';
import Hero from '../components/sections/Hero';
import WhyIsamSection from '../components/sections/WhyIsamSection';
import AboutSection from '../components/sections/AboutSection';
import ServicesSection from '../components/sections/ServicesSection';
import ContactSection from '../components/sections/ContactSection';

export default function Home() {
  return (
    <>
      <SEOHead pageKey="home" />
      <Hero />
      <WhyIsamSection />
      <AboutSection />
      <ServicesSection />
      <ContactSection />
    </>
  );
}
