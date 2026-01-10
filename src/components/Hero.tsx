import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { logEvent } from '../utils/analytics';

const params = {
    videos: [
        '/video/0110-1.mp4'
    ],
    duration: 5000 // 5 seconds
};

export default function Hero() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentVideoIndex((prev) => (prev + 1) % params.videos.length);
        }, params.duration);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-navy-950">
            {/* Background Video Carousel */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode='wait'>
                    <motion.video
                        key={currentVideoIndex}
                        src={params.videos[currentVideoIndex]}
                        autoPlay
                        muted
                        loop
                        playsInline
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                    />
                </AnimatePresence>

                {/* Luxury Dark Overlay */}
                <div className="absolute inset-0 bg-navy-950/60 mix-blend-multiply z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/40 z-10" />
            </div>

            {/* Content */}
            <div className="relative z-20 w-full container-custom px-6 md:px-12 pt-24 pb-16">
                <div className="max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        {/* Elegant Tagline - Keyword Rich */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="w-16 h-[1px] bg-gold-400/60" />
                            <span className="text-gold-300 font-sans text-sm tracking-[0.3em] uppercase hidden md:inline">
                                Miami's Premier Rug Atelier
                            </span>
                            <span className="text-gold-300 font-sans text-sm tracking-[0.3em] uppercase md:hidden">
                                #1 Rug Cleaning Miami
                            </span>
                        </div>

                        {/* Main Headline - H1 for SEO Dominance */}
                        <h1 className="text-5xl md:text-7xl lg:text-8xl text-white font-heading font-medium leading-[1.1] mb-6">
                            <span className="block italic font-serif text-cream-100 mb-2">The Standard in</span>
                            Oriental Rug Cleaning
                        </h1>

                        {/* Description - Geo-Targeted */}
                        <p className="font-serif text-xl md:text-2xl text-cream-100/90 leading-relaxed max-w-2xl mb-10 font-light">
                            We provide <strong>museum-quality cleaning, repair, and restoration</strong> for Persian, Turkish, and Wool rugs in <span className="text-white font-medium">Miami, Coral Gables, and Pinecrest</span>.
                            Family-owned since 1940.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            <a
                                href="tel:305-232-3368"
                                className="btn-gold"
                                aria-label="Call BakersRug Service"
                                onClick={() => logEvent('Conversion', 'Click Call', 'Hero Section')}
                            >
                                (305) 232-3368
                            </a>
                            <a
                                href="#contact"
                                className="btn-outline"
                                aria-label="Request Pickup"
                                onClick={() => logEvent('Navigation', 'Click Schedule', 'Hero Section')}
                            >
                                Schedule Free Pickup
                            </a>
                        </div>

                        {/* Footer / Trust */}
                        <div className="mt-16 flex items-center gap-12 border-t border-white/10 pt-8">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl font-heading text-white">80+</span>
                                <span className="text-sm font-sans tracking-widest text-white/60 uppercase leading-relaxed">Years of<br />Excellence</span>
                            </div>
                            <div className="w-px h-12 bg-white/10" />
                            <div className="flex flex-col">
                                <div className="flex gap-1 text-gold-400 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <span className="text-sm font-sans tracking-wide text-white/60 uppercase">
                                    Top Rated in Florida
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
