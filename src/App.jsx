import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import VideoSection from './components/VideoSection';
import Pain from './components/Pain';
import CasesShowcase from './components/CasesShowcase';
import Capabilities from './components/Capabilities';
import HowItWorks from './components/HowItWorks';
import Integrations from './components/Integrations';
import AgentChat from './components/AgentChat';
import FaqSection from './components/FaqSection';
import AuditCTA from './components/AuditCTA';
import Footer from './components/Footer';

export default function App() {
  useEffect(() => {
    document.documentElement.style.background = '#FFF5EE';
    document.body.style.background = '#FFF5EE';
  }, []);

  return (
    <div className="field-grain">
      <Header />
      <main>
        <Hero />
        <div style={{ background: '#FFF5EE', marginTop: '-2px' }}>
          <VideoSection />
          <Pain />
          <CasesShowcase />
          <Capabilities />
          <HowItWorks />
          <Integrations />
          <AgentChat />
          <FaqSection />
          <AuditCTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}
