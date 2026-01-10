import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Camera, Check } from 'lucide-react';
import { logEvent } from '../utils/analytics';

export default function ContactForm() {
    const [formState, setFormState] = useState({
        name: '',
        phone: '',
        email: '',
        serviceType: 'cleaning', // cleaning, repair, appraisal
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        logEvent('Lead', 'Form Submit', 'Restoration Inquiry');
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const services = [
        { id: 'cleaning', label: 'Cleaning' },
        { id: 'repair', label: 'Repair' },
        { id: 'appraisal', label: 'Appraisal' }
    ];

    return (
        <section id="contact" className="py-24 bg-navy-950 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" />

            <div className="container-custom px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 lg:gap-24">

                    {/* Left Side: Editorial Content */}
                    <div className="w-full md:w-5/12 text-white">
                        <span className="text-gold-500 font-sans text-xs tracking-[0.3em] uppercase block mb-6">Inquiries</span>
                        <h2 className="font-heading text-5xl md:text-6xl mb-8 leading-tight">
                            Begin the <br />
                            <span className="text-gold-400 italic font-serif">Restoration</span>
                        </h2>
                        <div className="w-24 h-[1px] bg-white/20 mb-10" />

                        <div className="space-y-8 font-serif text-lg text-white/70 leading-relaxed font-light">
                            <p>
                                To ensure the highest level of care, we accept a limited number of new commissions each week.
                            </p>
                            <p>
                                Please provide details about your rug's condition. For restoration inquiries, photographs are highly recommended.
                            </p>
                        </div>

                        <div className="mt-16">
                            <h4 className="font-heading text-xl text-white mb-4">Atelier Location</h4>
                            <address className="not-italic font-serif text-white/60">
                                1234 Design District Blvd<br />
                                Miami, FL 33137<br />
                                <a href="tel:3052323368" className="text-gold-400 hover:text-white transition-colors mt-2 block">(305) 232-3368</a>
                            </address>
                        </div>
                    </div>

                    {/* Right Side: 2025 Smart Form */}
                    <div className="w-full md:w-7/12">
                        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-sm shadow-2xl relative">
                            {isSuccess ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-20"
                                >
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="font-heading text-3xl text-navy-900 mb-4">Inquiry Received</h3>
                                    <p className="font-serif text-lg text-navy-600">
                                        Our master weaver will review your request and contact you shortly.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Service Selection Chips */}
                                    <div>
                                        <label className="block text-xs font-bold tracking-widest text-navy-900 uppercase mb-4">Service Required</label>
                                        <div className="flex flex-wrap gap-3">
                                            {services.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setFormState({ ...formState, serviceType: s.id })}
                                                    className={`px-6 py-3 border text-sm font-sans tracking-wide transition-all duration-300 rounded-sm ${formState.serviceType === s.id
                                                        ? 'bg-navy-900 text-white border-navy-900 shadow-lg transform -translate-y-1'
                                                        : 'bg-transparent text-navy-600 border-cream-300 hover:border-navy-900 hover:bg-cream-50'
                                                        }`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                required
                                                className="w-full border-b border-cream-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer"
                                                id="name"
                                                placeholder="Name"
                                                value={formState.name}
                                                onChange={e => setFormState({ ...formState, name: e.target.value })}
                                            />
                                            <label htmlFor="name" className="absolute left-0 -top-3.5 text-xs text-navy-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-navy-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                                Full Name
                                            </label>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="tel"
                                                required
                                                className="w-full border-b border-cream-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer"
                                                id="phone"
                                                placeholder="Phone"
                                                value={formState.phone}
                                                onChange={e => setFormState({ ...formState, phone: e.target.value })}
                                            />
                                            <label htmlFor="phone" className="absolute left-0 -top-3.5 text-xs text-navy-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-navy-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                                Phone Number
                                            </label>
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="email"
                                            required
                                            className="w-full border-b border-cream-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer"
                                            id="email"
                                            placeholder="Email"
                                            value={formState.email}
                                            onChange={e => setFormState({ ...formState, email: e.target.value })}
                                        />
                                        <label htmlFor="email" className="absolute left-0 -top-3.5 text-xs text-navy-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-navy-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                            Email Address
                                        </label>
                                    </div>

                                    {/* Smart Attachment UI */}
                                    <div
                                        className="border border-dashed border-cream-300 rounded-sm p-6 text-center hover:bg-cream-50 transition-colors cursor-pointer group hover:border-gold-400"
                                        onClick={() => logEvent('Interaction', 'Click Upload', 'Rug Photo')}
                                    >
                                        <input type="file" className="hidden" id="photo-upload" accept="image/*" />
                                        <label htmlFor="photo-upload" className="cursor-pointer block">
                                            <div className="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:shadow-md transition-all group-hover:scale-110">
                                                <Camera className="w-5 h-5 text-navy-600 group-hover:text-gold-600" />
                                            </div>
                                            <span className="text-sm font-sans text-navy-600 block uppercase tracking-wide group-hover:text-navy-900">Upload Photo of Rug</span>
                                            <span className="text-xs text-navy-400 block mt-1 group-hover:text-gold-600 transition-colors">(Essential for Appraisals)</span>
                                        </label>
                                    </div>

                                    <div className="relative group">
                                        <textarea
                                            rows={3}
                                            className="w-full border-b border-cream-300 py-3 text-navy-900 bg-transparent focus:outline-none focus:border-gold-500 transition-colors placeholder-transparent peer resize-none"
                                            id="message"
                                            placeholder="Details"
                                            value={formState.message}
                                            onChange={e => setFormState({ ...formState, message: e.target.value })}
                                        />
                                        <label htmlFor="message" className="absolute left-0 -top-3.5 text-xs text-navy-400 font-sans uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-navy-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-gold-600 peer-focus:text-xs">
                                            Rug condition, size, or questions...
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary flex items-center justify-center group"
                                    >
                                        {isSubmitting ? (
                                            <span className="animate-pulse">Processing Request...</span>
                                        ) : (
                                            <>
                                                Request Consideration <Send size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
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
