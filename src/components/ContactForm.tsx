import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Loader2, Sparkles, MapPin, Phone } from 'lucide-react';
import { logEvent } from '../utils/analytics';
import { useCMSContent } from '../hooks/useCMSContent';
import { useLanguage } from '../context/LanguageContext';

export default function ContactForm() {
    const { t } = useLanguage();

    const defaultContent = {
        tagline: t('contact.tagline'),
        headline: t('contact.headline'),
        description: t('contact.description')
    };

    const content = useCMSContent('contact', defaultContent);

    const [formState, setFormState] = useState({
        name: '',
        phone: '',
        email: '',
        cityOrArea: 'Miami, FL',
        serviceType: 'cleaning', // cleaning, repair, appraisal
        message: ''
    });
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const services = [
        { id: 'cleaning', label: t('contact.cleaning') },
        { id: 'repair', label: t('contact.repair') },
        { id: 'appraisal', label: t('contact.appraisal') }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!agreed) {
            setError(t('contact.termsError'));
            return;
        }

        logEvent('Lead', 'Form Submit', 'Restoration Inquiry');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formState.name,
                    email: formState.email,
                    phone: formState.phone,
                    cityOrArea: formState.cityOrArea,
                    message: formState.message,
                    itemName: `Service Request: ${formState.serviceType.charAt(0).toUpperCase() + formState.serviceType.slice(1)}`,
                    sourcePage: '/',
                    serviceType: formState.serviceType
                }),
            });

            // Handle non-JSON responses (local dev)
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                if (window.location.hostname === 'localhost') {
                    console.warn("API route mocked for local dev");
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setIsSubmitting(false);
                    setIsSuccess(true);
                    return;
                }
            }

            if (!response.ok) throw new Error('Submission failed');

            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            setError(t('contact.genericError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-navy-950 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" />

            <div className="container-custom px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 lg:gap-24">

                    {/* Left Side: Editorial Content */}
                    <div className="w-full md:w-5/12 text-white">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-sans text-xs tracking-[0.2em] uppercase mb-6">
                            <Sparkles size={13} className="text-gold-400" />
                            <span>{content.tagline || t('contact.tagline')}</span>
                        </div>
                        <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl mb-8 leading-tight">
                            {content.headline || t('contact.headline')}
                        </h2>
                        <div className="w-24 h-[1px] bg-white/20 mb-10" />

                        <div className="space-y-8 font-serif text-lg text-white/70 leading-relaxed font-light whitespace-pre-wrap">
                            <p>
                                {content.description || t('contact.description')}
                            </p>
                        </div>

                        <div className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <h4 className="font-heading text-lg text-white mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-gold-400" />
                                <span>{t('contact.shopLocation')}</span>
                            </h4>
                            <address className="not-italic font-sans text-sm text-white/70 space-y-1">
                                <p>8723 SW 132 ST</p>
                                <p>Miami, FL 33176</p>
                                <a href="tel:305-801-9000" className="text-gold-400 hover:text-white transition-colors flex items-center gap-1.5 pt-2 font-bold">
                                    <Phone size={14} />
                                    <span>(305) 801-9000</span>
                                </a>
                            </address>
                        </div>
                    </div>

                    {/* Right Side: Smart Form */}
                    <div className="w-full md:w-7/12">
                        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl relative border border-slate-100">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-16 sm:py-20"
                                >
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                                        <Check className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <h3 className="font-heading text-3xl text-navy-950 mb-3">{t('contact.successTitle')}</h3>
                                    <p className="font-serif text-base sm:text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                                        {t('contact.successDesc')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsSuccess(false)}
                                        className="mt-8 text-xs font-bold uppercase tracking-wider text-gold-600 hover:text-navy-900 underline transition-colors"
                                    >
                                        {t('contact.sendAnother')}
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Service Selection Chips */}
                                    <div>
                                        <label className="block text-xs font-bold tracking-widest text-navy-900 uppercase mb-4">
                                            {t('contact.serviceRequired')}
                                        </label>
                                        <div className="flex flex-wrap gap-2.5 sm:gap-3">
                                            {services.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setFormState({ ...formState, serviceType: s.id })}
                                                    className={`px-4 sm:px-6 py-2.5 sm:py-3 border text-xs sm:text-sm font-sans tracking-wide transition-all duration-300 rounded-xl font-medium ${formState.serviceType === s.id
                                                        ? 'bg-navy-900 text-white border-navy-900 shadow-md transform -translate-y-0.5'
                                                        : 'bg-transparent text-navy-600 border-slate-200 hover:border-navy-900 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                required
                                                className="w-full border-b border-slate-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer text-sm"
                                                id="name"
                                                placeholder={t('contact.fullName')}
                                                value={formState.name}
                                                onChange={e => setFormState({ ...formState, name: e.target.value })}
                                            />
                                            <label htmlFor="name" className="absolute left-0 -top-3.5 text-xs text-slate-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                                {t('contact.fullName')}
                                            </label>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="tel"
                                                required
                                                className="w-full border-b border-slate-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer text-sm"
                                                id="phone"
                                                placeholder={t('contact.phone')}
                                                value={formState.phone}
                                                onChange={e => setFormState({ ...formState, phone: e.target.value })}
                                            />
                                            <label htmlFor="phone" className="absolute left-0 -top-3.5 text-xs text-slate-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                                {t('contact.phone')}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div className="relative group">
                                            <input
                                                type="email"
                                                required
                                                className="w-full border-b border-slate-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer text-sm"
                                                id="email"
                                                placeholder={t('contact.email')}
                                                value={formState.email}
                                                onChange={e => setFormState({ ...formState, email: e.target.value })}
                                            />
                                            <label htmlFor="email" className="absolute left-0 -top-3.5 text-xs text-slate-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                                {t('contact.email')}
                                            </label>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                className="w-full border-b border-slate-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer text-sm"
                                                id="cityOrArea"
                                                placeholder="Miami Neighborhood"
                                                value={formState.cityOrArea}
                                                onChange={e => setFormState({ ...formState, cityOrArea: e.target.value })}
                                            />
                                            <label htmlFor="cityOrArea" className="absolute left-0 -top-3.5 text-xs text-slate-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                                Neighborhood / City (e.g. Coral Gables, Brickell)
                                            </label>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            rows={3}
                                            className="w-full border-b border-slate-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer resize-none text-sm"
                                            id="message"
                                            placeholder={t('contact.details')}
                                            value={formState.message}
                                            onChange={e => setFormState({ ...formState, message: e.target.value })}
                                        />
                                        <label htmlFor="message" className="absolute left-0 -top-3.5 text-xs text-slate-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                            {t('contact.details')}
                                        </label>
                                    </div>

                                    <div className="flex items-start gap-3 pt-2">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                checked={agreed}
                                                onChange={(e) => setAgreed(e.target.checked)}
                                                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-navy-900 checked:border-navy-900 focus:outline-none"
                                            />
                                            <div className="pointer-events-none absolute inset-0 rounded border border-slate-300 peer-checked:bg-navy-900 peer-checked:border-navy-900 flex items-center justify-center">
                                                {agreed && <Check size={12} className="text-white" />}
                                            </div>
                                        </div>
                                        <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer select-none leading-relaxed hover:text-navy-700 transition-colors">
                                            {t('contact.terms')}
                                        </label>
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-navy-950 hover:bg-navy-900 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-navy-950/20 active:scale-98 flex items-center justify-center group disabled:opacity-75 disabled:cursor-not-allowed text-xs uppercase tracking-widest"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                <span>{t('contact.submitting')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('contact.submit')}</span>
                                                <Send size={15} className="ml-2 group-hover:translate-x-1 transition-transform text-gold-400" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
