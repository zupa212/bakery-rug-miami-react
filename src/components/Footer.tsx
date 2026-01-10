import { Star } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-cream-200 pt-24 pb-12">
            <div className="container-custom px-6 md:px-12 flex flex-col items-center text-center">

                {/* Brand */}
                <div className="mb-8">
                    <span className="font-heading font-bold text-3xl text-navy-900 tracking-wide block">BAKERSRUG</span>
                    <span className="font-sans text-[10px] tracking-[0.4em] text-gold-600 uppercase block mt-2">
                        Service • Est. 1940
                    </span>
                </div>

                <div className="w-px h-16 bg-cream-300 mb-8" />

                {/* Links */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-16 font-sans text-xs font-bold tracking-widest uppercase text-navy-800">
                    <a href="#services" className="hover:text-gold-600 transition-colors">Services</a>
                    <a href="#process" className="hover:text-gold-600 transition-colors">Process</a>
                    <a href="#about" className="hover:text-gold-600 transition-colors">About</a>
                    <a href="#contact" className="hover:text-gold-600 transition-colors">Contact</a>
                </div>

                {/* Legal / Copyright */}
                <div className="text-navy-400 font-sans text-[10px] tracking-widest uppercase">
                    <p className="mb-2">© {currentYear} BakersRug Service. All Rights Reserved.</p>
                    <p>Miami, FL 33176 • (305) 232-3368</p>
                </div>
            </div>
        </footer>
    );
}
