
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import TrustIndicators from '../components/TrustIndicators';
import Services from '../components/Services';
import Process from '../components/Process';
import BeforeAfter from '../components/BeforeAfter';
import ServiceArea from '../components/ServiceArea';
import ContactForm from '../components/ContactForm';
import { initGA } from '../utils/analytics';

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

            <main>
                <Hero />
                <TrustIndicators />
                <Services />
                <Process />
                <BeforeAfter />
                <ServiceArea />
                <ContactForm />
            </main>
        </>
    );
}
