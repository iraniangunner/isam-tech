import SEOHead from '../components/common/SEOHead';
import ContactSection from '../components/sections/ContactSection';

export default function Contact() {
  return (
    <>
      <SEOHead pageKey="contact" />
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <ContactSection />
      </div>
    </>
  );
}
