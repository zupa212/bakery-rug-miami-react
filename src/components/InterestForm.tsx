
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface InterestFormProps {
    context?: {
        source?: 'catalog' | 'contact';
        itemId?: string;
        itemName?: string;
        itemSlug?: string;
    };
    className?: string;
}

export default function InterestForm({ context, className = '' }: InterestFormProps) {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const data = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            cityOrArea: formData.get('cityOrArea'),
            message: formData.get('message'),
            // Hidden Context
            sourcePage: location.pathname,
            itemName: context?.itemName,
            itemSlug: context?.itemSlug,
        };

        try {
            const response = await fetch('/api/submit-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            // Handle non-JSON responses (common in local dev without 'vercel dev')
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.warn("API route not available locally (requires 'vercel dev'). Mocking success.");
                    // Simulate a delay
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setStatus('success');
                    e.currentTarget.reset();
                    return;
                }
                await response.text(); // Consume body to avoid potential leaks, though not strictly necessary here before throw
                // console.error("Non-JSON response:", text); // Debugging
                throw new Error("Server configuration error. Please contact support.");
            }

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit form');
            }

            setStatus('success');
            // Reset form
            e.currentTarget.reset();
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setErrorMessage(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-white p-8 rounded-lg shadow-lg border border-slate-100 ${className}`}>
            <div className="mb-6">
                <h3 className="font-heading text-2xl text-navy-900 mb-2">
                    {context?.itemName ? `Inquire about "${context.itemName}"` : "I'm Interested"}
                </h3>
                <p className="text-slate-600">
                    Fill out the form below and we'll get back to you immediately.
                </p>
            </div>

            {status === 'success' ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                >
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-heading text-green-800 mb-2">Message Sent!</h4>
                    <p className="text-green-700">Thank you for your interest. We will contact you shortly.</p>
                    <button
                        onClick={() => setStatus('idle')}
                        className="mt-4 text-sm font-bold text-green-600 hover:text-green-800 underline"
                    >
                        Send another message
                    </button>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-bold text-navy-900 mb-1">Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            id="fullName"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-navy-900 mb-1">Email Address *</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-navy-900 mb-1">Phone (Optional)</label>
                            <input
                                type="tel"
                                name="phone"
                                id="phone"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all"
                                placeholder="(305) 555-0123"
                            />
                        </div>
                        <div>
                            <label htmlFor="cityOrArea" className="block text-sm font-bold text-navy-900 mb-1">City / Area</label>
                            <input
                                type="text"
                                name="cityOrArea"
                                id="cityOrArea"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all"
                                placeholder="Coral Gables"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-bold text-navy-900 mb-1">Message (Optional)</label>
                        <textarea
                            name="message"
                            id="message"
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white transition-all"
                            placeholder="I'm interested in this rug..."
                        />
                    </div>

                    {status === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3 text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Submit Inquiry"
                        )}
                    </button>
                    <div className="flex items-start gap-3 pt-2">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                className="peer h-4 w-4 cursor-pointer appearance-none rounded-sm border border-slate-300 bg-white checked:bg-navy-900 checked:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900/50"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100">
                                <CheckCircle size={10} className="text-white" />
                            </div>
                        </div>
                        <label htmlFor="terms" className="text-xs text-slate-500 cursor-pointer select-none leading-tight hover:text-navy-700 transition-colors">
                            I agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>, and consent to be contacted regarding this inquiry in accordance with Miami-Dade consumer protection laws.
                        </label>
                    </div>

                    <p className="text-xs text-center text-slate-400 mt-4">
                        Your information is secure. We never share your data.
                    </p>
                </form>
            )}
        </div>
    );
}
