import { Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCMSImage } from '../hooks/useCMSImage';

export default function Footer() {
    const location = useLocation();
    const currentYear = new Date().getFullYear();
    const { imageUrl: logoUrl } = useCMSImage('logo', '/photos/logofront.png', 'Bakers Rug Service Logo');

    return (
        <footer className="bg-white border-t border-cream-200 pt-24 pb-12">
            <div className="container-custom px-6 md:px-12 flex flex-col items-center text-center">

                {/* Brand */}
                <div className="mb-8">
                    <img src={logoUrl} alt="Bakers Rug Service" className="h-28 w-auto object-contain mx-auto" />
                    <span className="font-sans text-[10px] tracking-[0.4em] text-gold-600 uppercase block mt-2">
                        Service • Est. 1940
                    </span>
                </div>

                <div className="w-px h-16 bg-cream-300 mb-8" />

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 font-sans text-xs font-bold tracking-widest uppercase text-navy-800">
                    <a href={location.pathname === '/' ? "#services" : "/#services"} className="hover:text-gold-600 transition-colors">Services</a>
                    <a href={location.pathname === '/' ? "#process" : "/#process"} className="hover:text-gold-600 transition-colors">Process</a>
                    <a href={location.pathname === '/' ? "#about" : "/#about"} className="hover:text-gold-600 transition-colors">About</a>
                    <a href={location.pathname === '/' ? "#contact" : "/#contact"} className="hover:text-gold-600 transition-colors">Contact</a>
                    <Link to="/admin" className="hover:text-gold-600 transition-colors opacity-50 hover:opacity-100">Advisor</Link>
                </div>

                {/* Legal / Copyright */}
                {/* Legal / Copyright */}
                <div className="text-navy-400 font-sans text-[10px] tracking-widest uppercase flex flex-col items-center gap-2">
                    <p>© {currentYear} BakersRug Service. All Rights Reserved.</p>
                    <p className="flex items-center gap-3">
                        <span>Miami, FL 33176</span>
                        <span>•</span>
                        <a href="tel:305-801-9000" className="hover:text-gold-600 transition-colors">(305) 801-9000</a>
                        <span>•</span>
                        <a href="mailto:bakersrug@comcast.net" className="hover:text-gold-600 transition-colors lowercase">bakersrug@comcast.net</a>
                    </p>
                </div>

                {/* SEO Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": "BakersRug",
                        "image": "https://bakersrug.com/og-image.jpg",
                        "telephone": "305-801-9000",
                        "email": "bakersrug@comcast.net",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Miami, FL 33176",
                            "addressLocality": "Miami",
                            "addressRegion": "FL",
                            "postalCode": "33176",
                            "addressCountry": "US"
                        },
                        "url": "https://bakersrug.com",
                        "priceRange": "$$"
                    })}
                </script>
            </div>
        </footer>
    );
}
