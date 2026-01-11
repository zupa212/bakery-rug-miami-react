
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

export default function MiamiRugCleaning() {
    useEffect(() => {
        initGA();
    }, []);

    return (
        <>
            <Helmet>
                <title>Miami Rug Cleaning | Expert Persian & Oriental Rug Washing 33176</title>
                <meta name="description" content="Looking for the best Miami Rug Cleaning? BakersRug (Est. 1940) offers specialized hand-washing for wool and silk rugs in Miami, Coral Gables, and Pinecrest." />
                <link rel="canonical" href="https://bakersrug.com/miami-rug-cleaning" />
                <meta name="keywords" content="Miami Rug Cleaning, Rug Cleaning Miami, Oriental Rug Cleaning Miami, Wool Rug Cleaning Miami, Silk Rug Cleaning Miami" />
            </Helmet>

            <main>
                {/* We reuse components but the SEO metadata is specific to this page */}
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
