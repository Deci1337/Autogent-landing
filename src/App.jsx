import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Pain from './components/Pain';
import Capabilities from './components/Capabilities';
import Integrations from './components/Integrations';
import CaseArchetypes from './components/CaseArchetypes';
import CasesShowcase from './components/CasesShowcase';
import ValueProps from './components/ValueProps';
import HowItWorks from './components/HowItWorks';
import Objections from './components/Objections';
import FaqSection from './components/FaqSection';
import AuditCTA from './components/AuditCTA';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    document.documentElement.style.background = '#FFF5EE';
  }, []);

  return (
    <div className="field-grain">
      <Header />
      <main>
        <Hero />
        {/* seashell backdrop covers GlowField blobs below hero */}
        <div style={{ background: '#FFF5EE' }}>
        <ValueProps />
        <Pain />
        <Capabilities />
        <Integrations />
        <CaseArchetypes />
        <CasesShowcase />
        <HowItWorks />
        <Objections />
        <FaqSection />
        <AuditCTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}
