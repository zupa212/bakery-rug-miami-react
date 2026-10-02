import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Star, Printer, Copy, Check, ExternalLink, Download, Sparkles, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Default Google Review Link for Bakers Rug Miami
const DEFAULT_GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJH3sV9OnH2YgRTYU7vP_Dg7c';

export default function ReviewQR() {
    const { t } = useLanguage();
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [reviewUrl] = useState(DEFAULT_GOOGLE_REVIEW_URL);

    useEffect(() => {
        QRCode.toDataURL(reviewUrl, {
            width: 380,
            margin: 2,
            color: {
                dark: '#091124', // Deep Navy
                light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
        }).then(url => {
            setQrDataUrl(url);
        }).catch(err => {
            console.error('Failed to generate QR code:', err);
        });
    }, [reviewUrl]);

    const handleCopy = () => {
        navigator.clipboard.writeText(reviewUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (!qrDataUrl) return;
        const link = document.createElement('a');
        link.download = 'bakers-rug-miami-google-review-qr.png';
        link.href = qrDataUrl;
        link.click();
    };

    return (
        <>
            <Helmet>
                <title>Leave a Google Review | Bakers Rug Miami</title>
                <meta name="description" content="Leave a 5-star Google review for Bakers Rug Service Miami. Over 80 years of master rug cleaning and restoration." />
            </Helmet>

            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 selection:bg-gold-500 selection:text-white print:bg-white print:p-0">
                {/* Header Controls (Hidden during print) */}
                <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 print:hidden">
                    <a href="/" className="flex items-center gap-3 group">
                        <img src="/photos/logofront.png" alt="Bakers Rug" className="h-14 w-auto object-contain" />
                        <div>
                            <span className="font-heading font-bold text-xl text-navy-950 block tracking-wide group-hover:text-gold-600 transition-colors">
                                BAKERS RUG
                            </span>
                            <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.25em] block">
                                Miami Showroom
                            </span>
                        </div>
                    </a>

                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-all shadow-md active:scale-95"
                        >
                            <Printer size={15} />
                            <span>{t('review.printButton')}</span>
                        </button>
                    </div>
                </div>

                {/* Main Card Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-none print:max-w-full"
                >
                    {/* Top Gold Accent Bar */}
                    <div className="h-3 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>

                    <div className="p-8 sm:p-12 text-center space-y-6">
                        {/* Showroom Crest / Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-50 border border-gold-200/60 text-gold-700 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={14} className="text-gold-500" />
                            <span>{t('review.badge')}</span>
                        </div>

                        {/* Heading */}
                        <div className="space-y-2">
                            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy-950 leading-tight">
                                {t('review.heroTitle')}
                            </h1>
                            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                {t('review.heroSubtitle')}
                            </p>
                        </div>

                        {/* 5 Gold Stars Rating */}
                        <div className="flex items-center justify-center gap-1.5 py-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={28}
                                    className="text-gold-500 fill-gold-500 drop-shadow-sm transition-transform hover:scale-110"
                                />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-navy-900 tracking-wide">
                            {t('review.ratingText')}
                        </p>

                        {/* QR Code Container with Frame */}
                        <div className="relative inline-block my-2">
                            <div className="p-5 bg-gradient-to-b from-slate-50 to-white rounded-3xl border-2 border-gold-400/40 shadow-inner flex flex-col items-center">
                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt="Scan to Review Bakers Rug on Google"
                                        className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-2xl shadow-sm"
                                    />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-2xl animate-pulse text-slate-400 text-sm">
                                        Generating QR Code...
                                    </div>
                                )}
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-navy-900">
                                    <span>📸 {t('review.scanPrompt')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons (Hidden when printing stand card) */}
                        <div className="space-y-3 pt-2 print:hidden">
                            <a
                                href={reviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-navy-950 hover:bg-navy-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-navy-950/20 active:scale-98 text-sm group"
                            >
                                <ExternalLink size={18} className="text-gold-400 group-hover:rotate-45 transition-transform" />
                                <span>{t('review.openButton')}</span>
                            </a>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-navy-900 transition-colors shadow-sm"
                                >
                                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                                    <span>{copied ? t('review.copied') : t('review.copyButton')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-navy-900 transition-colors shadow-sm"
                                >
                                    <Download size={16} className="text-gold-600" />
                                    <span>{t('review.downloadButton')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Showroom Footer Info */}
                        <div className="pt-6 border-t border-slate-100 space-y-2 text-center">
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                {t('review.thankYou')}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-400 pt-2 font-medium">
                                <span className="flex items-center gap-1">
                                    <MapPin size={13} className="text-gold-600" />
                                    8723 SW 132 ST, Miami, FL 33176
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="flex items-center gap-1">
                                    <Phone size={13} className="text-gold-600" />
                                    (305) 801-9000
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Counter Stand Notice */}
                <div className="max-w-xl mx-auto mt-6 text-center text-xs text-slate-400 print:hidden">
                    <p>💡 Tip: Use the <strong>"Print Showroom Stand"</strong> button to print this page as a counter card for your reception desk or service vans.</p>
                </div>
            </div>
        </>
    );
}
