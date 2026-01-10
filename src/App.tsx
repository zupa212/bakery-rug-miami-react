import React, { useEffect } from 'react';
import Navbar from './components/Header';
import Hero from './components/Hero';
import TrustIndicators from './components/TrustIndicators';
import Services from './components/Services';
import Process from './components/Process';
import BeforeAfter from './components/BeforeAfter';
import ServiceArea from './components/ServiceArea';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import MobilePhoneBar from './components/MobilePhoneBar';
import { initGA } from './utils/analytics';

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-gold-500 selection:text-white">
      <Navbar />

      <main>
        <Hero />
        <TrustIndicators />
        <Services />
        <Process />
        <BeforeAfter />
        <ServiceArea />
        <ContactForm />
      </main>

      <Footer />
      <MobilePhoneBar />
    </div>
  );
}

export default App;
