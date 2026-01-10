import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'Process', href: '#process' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
];

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-soft py-4'
                    : 'bg-gradient-to-b from-black/60 to-transparent py-8'
                }`}
        >
            <nav className="container-custom flex items-center justify-between px-6 md:px-12">
                {/* Logo */}
                <a href="#" className="flex flex-col group">
                    <span className={`font-heading font-bold text-2xl md:text-3xl tracking-wide transition-colors duration-500 ${isScrolled ? 'text-navy-900' : 'text-white'
                        }`}>
                        BAKERSRUG
                    </span>
                    <span className={`text-[10px] font-sans tracking-[0.3em] uppercase transition-colors duration-500 ${isScrolled ? 'text-gold-600' : 'text-white/80'
                        }`}>
                        Est. 1940 • Miami
                    </span>
                </a>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-12">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`font-sans text-sm font-bold tracking-widest uppercase transition-all duration-300 relative group/link ${isScrolled ? 'text-navy-900 hover:text-gold-600' : 'text-white/90 hover:text-white'
                                }`}
                        >
                            {link.name}
                            <span className={`absolute -bottom-2 left-1/2 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover/link:w-full group-hover/link:left-0`} />
                        </a>
                    ))}

                    <a
                        href="tel:305-232-3368"
                        className={`font-serif text-lg italic transition-colors ${isScrolled ? 'text-navy-800' : 'text-white'
                            }`}
                    >
                        (305) 232-3368
                    </a>

                    <a href="#contact" className={`px-8 py-3 rounded-sm font-sans text-xs font-bold tracking-widest uppercase border transition-all duration-300 ${isScrolled
                            ? 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
                            : 'border-white text-white hover:bg-white hover:text-navy-900'
                        }`}>
                        Get Quote
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`lg:hidden p-2 transition-colors ${isScrolled ? 'text-navy-900' : 'text-white'
                        }`}
                >
                    {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: '100vh' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-navy-900 absolute top-0 left-0 right-0 h-screen z-40 flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-8 text-center p-8">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-8 right-8 text-white/50 hover:text-white"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-heading text-3xl text-white hover:text-gold-400 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="w-12 h-px bg-white/10 my-4" />
                            <a href="tel:305-232-3368" className="font-serif text-2xl text-gold-400 italic">
                                (305) 232-3368
                            </a>
                            <a href="#contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="btn-gold mt-4">
                                Get a Quote
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
