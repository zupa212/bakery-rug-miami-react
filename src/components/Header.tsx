import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCMSImage } from '../hooks/useCMSImage';
import { useLanguage } from '../context/LanguageContext';

const navLinks = [
    { nameKey: 'nav.home', defaultName: 'Home', href: '/' },
    { nameKey: 'nav.services', defaultName: 'Services', href: '#services' },
    { nameKey: 'nav.shop', defaultName: 'Shop', href: '/catalog' },
    { nameKey: 'nav.process', defaultName: 'Process', href: '#process' },
    { nameKey: 'nav.about', defaultName: 'About', href: '#about' },
    { nameKey: 'nav.reviews', defaultName: 'Reviews & QR', href: '/review' },
    { nameKey: 'nav.contact', defaultName: 'Contact', href: '#contact' },
];

export default function Header() {
    const { language, toggleLanguage, t } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Get logo from CMS
    const { imageUrl: logoUrl } = useCMSImage('logo', '/photos/logofront.png', 'Bakers Rug Service Logo');

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // If it's an absolute path (like /catalog or /review), let the default behavior work
        if (href.startsWith('/') && !href.startsWith('/#')) {
            return; // Let the browser handle normal navigation
        }

        e.preventDefault();
        setIsMobileMenuOpen(false);

        const sectionId = href.replace('#', '').replace('/', '');

        // If we're on the homepage, scroll directly
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Navigate to homepage first, then scroll
            navigate('/');
            // Wait for navigation and DOM update, then scroll
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    const getHref = (path: string) => {
        if (path.startsWith('/')) return path;
        return location.pathname === '/' ? path : `/${path}`;
    };

    useEffect(() => {
        // Use IntersectionObserver for performant scroll detection
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsScrolled(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: "50px 0px 0px 0px" } // Trigger when top 50px are scrolled
        );

        const sentinel = document.createElement("div");
        sentinel.className = "absolute top-0 left-0 w-full h-1 pointer-events-none opacity-0";
        document.body.prepend(sentinel);
        observer.observe(sentinel);

        return () => {
            observer.disconnect();
            sentinel.remove();
        };
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
                <a href={getHref('/')} className="flex items-center group">
                    <img
                        src={logoUrl}
                        alt="Bakers Rug Service"
                        className={`h-28 md:h-32 w-auto object-contain transition-all duration-500 ${isScrolled ? '' : 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]'}`}
                    />
                </a>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8 xl:gap-10">
                    {navLinks.map((link) => (
                        <a
                            key={link.nameKey}
                            href={getHref(link.href)}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className={`font-sans text-xs xl:text-sm font-bold tracking-widest uppercase transition-all duration-300 relative group/link ${isScrolled ? 'text-navy-900 hover:text-gold-600' : 'text-white/90 hover:text-white'
                                }`}
                        >
                            {t(link.nameKey) || link.defaultName}
                            <span className="absolute -bottom-2 left-1/2 w-0 h-0.5 bg-gold-400 transition-all duration-300 group-hover/link:w-full group-hover/link:left-0" />
                        </a>
                    ))}

                    <a
                        href="tel:305-801-9000"
                        className={`font-serif text-base xl:text-lg italic transition-colors ${isScrolled ? 'text-navy-800' : 'text-white'
                            }`}
                    >
                        (305) 801-9000
                    </a>

                    {/* Bilingual Language Switcher Button */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        title="Switch Language / Αλλαγή Γλώσσας"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${
                            isScrolled
                                ? 'bg-slate-100 text-navy-900 border-slate-300 hover:bg-slate-200'
                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm'
                        }`}
                    >
                        <span>{language === 'en' ? '🇬🇷 ΕΛ' : '🇺🇸 EN'}</span>
                    </button>

                    <a href={getHref('#contact')} onClick={(e) => handleNavClick(e, '#contact')} className={`px-6 py-2.5 rounded-sm font-sans text-xs font-bold tracking-widest uppercase border transition-all duration-300 ${isScrolled
                        ? 'border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
                        : 'border-white text-white hover:bg-white hover:text-navy-900'
                        }`}>
                        {t('nav.freeEstimate')}
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
                        className="lg:hidden bg-navy-900 absolute top-0 left-0 right-0 h-screen z-40 flex items-center justify-center overflow-y-auto"
                    >
                        <div className="flex flex-col items-center gap-6 text-center p-8 max-w-sm w-full">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="absolute top-8 right-8 text-white/50 hover:text-white"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            {/* Mobile Language Toggle */}
                            <button
                                type="button"
                                onClick={toggleLanguage}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-gold-400 border border-white/10 mb-2"
                            >
                                <span>{language === 'en' ? '🇬🇷 Ελληνικά' : '🇺🇸 English'}</span>
                            </button>

                            {navLinks.map((link) => (
                                <a
                                    key={link.nameKey}
                                    href={getHref(link.href)}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    className="font-heading text-2xl text-white hover:text-gold-400 transition-colors"
                                >
                                    {t(link.nameKey) || link.defaultName}
                                </a>
                            ))}
                            <div className="w-12 h-px bg-white/10 my-2" />
                            <a href="tel:305-801-9000" className="font-serif text-2xl text-gold-400 italic">
                                (305) 801-9000
                            </a>
                            <a href={getHref('#contact')}
                                onClick={(e) => handleNavClick(e, '#contact')}
                                className="btn-gold mt-2 w-full text-center">
                                {t('nav.freeEstimate')}
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
