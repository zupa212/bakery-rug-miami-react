
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import TrustIndicators from '../components/TrustIndicators';
import Services from '../components/Services';
import LatestArrivals from '../components/LatestArrivals';
import Process from '../components/Process';
import BeforeAfter from '../components/BeforeAfter';
import ServiceArea from '../components/ServiceArea';
import ContactForm from '../components/ContactForm';
import { initGA } from '../utils/analytics';

import { Phone, Sparkles } from 'lucide-react';

export default function Home() {
    useEffect(() => {
        initGA();
    }, []);

    return (
        <>
            <Helmet>
                <title>BakersRug Service | #1 Oriental Rug Cleaning Miami, FL</title>
                <meta name="description" content="Rated #1 Rug Cleaning in Miami (33176). We specialize in hand-washing Persian, Oriental & Antique rugs. 80+ Years experience. Free Pickup & Delivery." />
                <link rel="canonical" href="https://bakersrug.com/" />
            </Helmet>

            <main className="pb-16 md:pb-0">
                <Hero />
                <TrustIndicators />
                <Services />
                
                {/* Secondary Discovery Sections - Displayed on Desktop to prevent mobile scrolling fatigue */}
                <div className="hidden md:block">
                    <LatestArrivals />
                    <Process />
                </div>

                <BeforeAfter />
                <ServiceArea />
                <ContactForm />
            </main>

            {/* Sticky Mobile Conversion Bar - Instant 1-Tap Call & Quote */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur-md border-t border-gold-500/30 p-2.5 px-4 flex items-center gap-2.5 shadow-2xl safe-area-pb">
                <a
                    href="tel:305-801-9000"
                    className="flex-1 py-3 px-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-sans font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                    aria-label="Call BakersRug Service"
                >
                    <Phone size={15} className="fill-current" />
                    <span>(305) 801-9000</span>
                </a>
                <a
                    href="#contact"
                    className="flex-1 py-3 px-2 bg-navy-900 hover:bg-navy-800 text-gold-300 border border-gold-500/40 font-sans font-bold text-xs uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                    aria-label="Get Free Estimate"
                >
                    <Sparkles size={15} className="text-gold-400" />
                    <span>Free Estimate</span>
                </a>
            </div>
        </>
    );
}
