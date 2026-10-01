import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, Share2, ArrowLeft, Phone, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import { useLanguage } from '../context/LanguageContext';

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const { language, t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    const title = post.title[language] || post.title.en;
    const excerpt = post.excerpt[language] || post.excerpt.en;
    const content = post.content[language] || post.content.en;
    const currentUrl = `https://bakersrug.com/blog/${post.slug}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    // Render markdown-like sections cleanly
    const renderContent = (rawText: string) => {
        const sections = rawText.trim().split('\n\n');
        return sections.map((sec, idx) => {
            if (sec.startsWith('# ')) {
                return (
                    <h1 key={idx} className="font-heading text-3xl sm:text-4xl text-navy-950 font-bold mt-8 mb-4 leading-tight">
                        {sec.replace('# ', '')}
                    </h1>
                );
            }
            if (sec.startsWith('## ')) {
                return (
                    <h2 key={idx} className="font-heading text-2xl sm:text-3xl text-navy-900 font-bold mt-8 mb-3 leading-snug">
                        {sec.replace('## ', '')}
                    </h2>
                );
            }
            if (sec.startsWith('### ')) {
                return (
                    <h3 key={idx} className="font-heading text-xl text-navy-900 font-bold mt-6 mb-2">
                        {sec.replace('### ', '')}
                    </h3>
                );
            }
            if (sec.startsWith('- ') || sec.startsWith('1. ')) {
                const lines = sec.split('\n');
                return (
                    <ul key={idx} className="space-y-2.5 my-4 pl-4 sm:pl-6 text-slate-700 font-serif text-base sm:text-lg leading-relaxed">
                        {lines.map((line, lIdx) => (
                            <li key={lIdx} className="list-disc pl-2">
                                <span dangerouslySetInnerHTML={{ __html: line.replace(/^[-*0-9.]+\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </li>
                        ))}
                    </ul>
                );
            }
            return (
                <p
                    key={idx}
                    className="font-serif text-base sm:text-lg text-slate-700 leading-relaxed my-4"
                    dangerouslySetInnerHTML={{ __html: sec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
            );
        });
    };

    // Schema.org Article & FAQPage JSON-LD
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post.metaTitle,
        'description': post.metaDescription,
        'image': `https://bakersrug.com${post.coverImage}`,
        'author': {
            '@type': 'Organization',
            'name': 'Bakers Rug Service',
            'url': 'https://bakersrug.com'
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Bakers Rug Service',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://bakersrug.com/photos/logofront.png'
            }
        },
        'datePublished': post.publishedDate,
        'dateModified': '2026-10-01',
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': currentUrl
        }
    };

    const faqSchema = post.faqs && post.faqs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': post.faqs.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    } : null;

    return (
        <>
            <Helmet>
                <title>{post.metaTitle}</title>
                <meta name="description" content={post.metaDescription} />
                <link rel="canonical" href={currentUrl} />
                <meta property="og:title" content={post.metaTitle} />
                <meta property="og:description" content={post.metaDescription} />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:image" content={`https://bakersrug.com${post.coverImage}`} />
                <meta name="keywords" content={`${post.targetKeyword}, Carpet Cleaning Miami, Area Rug Cleaning Miami, Bakers Rug`} />
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
                {faqSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(faqSchema)}
                    </script>
                )}
            </Helmet>

            <article className="min-h-screen bg-slate-50 pt-28 pb-24 selection:bg-gold-500 selection:text-white">
                {/* Back to Blog Bar */}
                <div className="container-custom mx-auto px-6 md:px-12 mb-6">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-navy-900 transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>{t('blog.backToBlog')}</span>
                    </Link>
                </div>

                {/* Article Header Card */}
                <div className="container-custom mx-auto px-6 md:px-12 max-w-4xl">
                    <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-sm border border-slate-100 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <span className="bg-gold-50 text-gold-700 border border-gold-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {post.category}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1"><Calendar size={13} /> {post.publishedDate}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock size={13} /> {post.readTime}</span>
                            </div>
                        </div>

                        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-navy-950 leading-tight">
                            {title}
                        </h1>

                        <p className="font-serif text-lg sm:text-xl text-slate-600 leading-relaxed italic border-l-4 border-gold-400 pl-4 py-1">
                            {excerpt}
                        </p>

                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-navy-900 text-gold-400 font-heading font-bold flex items-center justify-center text-sm shadow-sm">
                                    BR
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-navy-900">{post.author}</p>
                                    <p className="text-[11px] text-slate-400">Master Rug Restoration Atelier • Miami, FL</p>
                                </div>
                            </div>

                            {/* Share Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    title="Copy link to clipboard"
                                    className="p-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-navy-900 transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                                    <span>{copied ? 'Link Copied!' : t('blog.shareArticle')}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Featured Cover Image */}
                    <div className="my-8 rounded-3xl overflow-hidden shadow-xl border border-slate-100 max-h-[460px]">
                        <img
                            src={post.coverImage}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Article Body Content */}
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 prose max-w-none">
                        {renderContent(content)}
                    </div>

                    {/* FAQ Accordion Section */}
                    {post.faqs && post.faqs.length > 0 && (
                        <div className="mt-10 bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-slate-100 space-y-4">
                            <div className="inline-flex items-center gap-1.5 text-gold-600 text-xs font-bold uppercase tracking-wider">
                                <Sparkles size={14} />
                                <span>Frequently Asked Questions</span>
                            </div>
                            <h2 className="font-heading text-2xl font-bold text-navy-950 mb-6">
                                Expert Answers for Miami Rug Owners
                            </h2>
                            <div className="space-y-3">
                                {post.faqs.map((faq, idx) => (
                                    <div
                                        key={idx}
                                        className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                            className="w-full p-4 text-left font-bold text-navy-900 flex items-center justify-between gap-4 hover:bg-slate-50 text-sm sm:text-base"
                                        >
                                            <span>{faq.question}</span>
                                            {openFaq === idx ? <ChevronUp size={18} className="text-gold-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
                                        </button>
                                        {openFaq === idx && (
                                            <div className="p-4 pt-0 text-slate-600 font-serif text-sm sm:text-base leading-relaxed bg-slate-50/50 border-t border-slate-100">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Expert Consultation Banner */}
                    <div className="mt-10 bg-gradient-to-r from-navy-950 to-navy-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-gold-500/20 text-center space-y-4">
                        <span className="text-gold-400 text-xs font-bold uppercase tracking-[0.2em] block">
                            Direct Workshop Service
                        </span>
                        <h3 className="font-heading text-2xl sm:text-3xl font-bold">
                            Protect Your Area Rug or Carpet Today
                        </h3>
                        <p className="text-slate-300 font-serif text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                            Serving Coral Gables, Brickell, Pinecrest, Coconut Grove, Key Biscayne, and Miami Beach with free white-glove pickup and museum-grade care.
                        </p>
                        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                            <a
                                href="/#contact"
                                className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                            >
                                Get Free Quote
                            </a>
                            <a
                                href="tel:305-801-9000"
                                className="border border-white/20 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                            >
                                <Phone size={14} className="text-gold-400" />
                                <span>Call (305) 801-9000</span>
                            </a>
                        </div>
                    </div>
                </div>
            </article>
        </>
    );
}
