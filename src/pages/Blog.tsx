import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Clock, ArrowRight, Search, BookOpen, Phone, Star } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import { useLanguage } from '../context/LanguageContext';

export default function Blog() {
    const { language, t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Carpet Cleaning', 'Rug Restoration', 'Stain Removal', 'Care Guides'];

    const filteredPosts = blogPosts.filter((post) => {
        const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
        const titleText = post.title[language] || post.title.en;
        const excerptText = post.excerpt[language] || post.excerpt.en;
        const matchesSearch = titleText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              excerptText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              post.targetKeyword.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredPost = blogPosts[0]; // #1 Carpet Cleaning Miami

    return (
        <>
            <Helmet>
                <title>{language === 'el' ? 'Οδηγοί & Άρθρα Φροντίδας Χαλιών Μαϊάμι | Bakers Rug' : 'Miami Carpet & Rug Care Journal | Bakers Rug Service'}</title>
                <meta
                    name="description"
                    content="Expert Miami carpet cleaning guides, Oriental rug preservation advice, and stain removal tips from master weavers at Bakers Rug Miami (Est. 1940)."
                />
                <link rel="canonical" href="https://bakersrug.com/blog" />
            </Helmet>

            <div className="min-h-screen bg-slate-50 pt-28 pb-20 selection:bg-gold-500 selection:text-white">
                {/* Hero Header */}
                <div className="bg-navy-950 text-white py-16 px-6 md:px-12 relative overflow-hidden mb-12">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" />
                    <div className="container-custom mx-auto relative z-10 text-center max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-sans text-xs tracking-[0.2em] uppercase mb-4">
                            <Sparkles size={14} className="text-gold-400" />
                            <span>{t('blog.badge')}</span>
                        </div>
                        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                            {t('blog.title')}
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base font-serif leading-relaxed max-w-2xl mx-auto">
                            {t('blog.subtitle')}
                        </p>

                        {/* Search Bar */}
                        <div className="mt-8 max-w-md mx-auto relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={language === 'el' ? 'Αναζήτηση άρθρων (π.χ. καθαρισμός, λεκέδες)...' : 'Search guides (e.g. carpet cleaning, stains)...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-full pl-12 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:bg-white/20 focus:border-gold-400 transition-all backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="container-custom mx-auto px-6 md:px-12">
                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-sm ${
                                    selectedCategory === cat
                                        ? 'bg-navy-950 text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-navy-900'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Featured Post Highlight (if no active search) */}
                    {!searchQuery && selectedCategory === 'All' && (
                        <div className="mb-14">
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all hover:shadow-2xl">
                                <div className="lg:col-span-7 relative h-72 lg:h-auto min-h-[300px]">
                                    <img
                                        src={featuredPost.coverImage}
                                        alt={featuredPost.title[language] || featuredPost.title.en}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-gold-500 text-navy-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                                        ⭐ Featured Master Guide
                                    </div>
                                </div>
                                <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                            <span className="text-gold-600">{featuredPost.category}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock size={13} /> {featuredPost.readTime}</span>
                                        </div>
                                        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-navy-950 hover:text-gold-600 transition-colors leading-snug">
                                            <Link to={`/blog/${featuredPost.slug}`}>
                                                {featuredPost.title[language] || featuredPost.title.en}
                                            </Link>
                                        </h2>
                                        <p className="text-slate-600 text-sm font-serif leading-relaxed line-clamp-3">
                                            {featuredPost.excerpt[language] || featuredPost.excerpt.en}
                                        </p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                                        <span className="text-xs text-slate-400 font-medium">{featuredPost.author}</span>
                                        <Link
                                            to={`/blog/${featuredPost.slug}`}
                                            className="inline-flex items-center gap-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow group"
                                        >
                                            <span>{t('blog.readMore')}</span>
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-gold-400" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post) => (
                            <motion.article
                                key={post.slug}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 group"
                            >
                                <div className="relative h-52 overflow-hidden bg-slate-100">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title[language] || post.title.en}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <span className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-sm text-gold-400 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {post.publishedDate}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                                        </div>
                                        <h3 className="font-heading text-lg font-bold text-navy-950 group-hover:text-gold-600 transition-colors leading-snug line-clamp-2">
                                            <Link to={`/blog/${post.slug}`}>
                                                {post.title[language] || post.title.en}
                                            </Link>
                                        </h3>
                                        <p className="text-slate-500 text-xs sm:text-sm font-serif leading-relaxed line-clamp-3">
                                            {post.excerpt[language] || post.excerpt.en}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                                            {post.author}
                                        </span>
                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="text-xs font-bold text-gold-600 hover:text-navy-900 inline-flex items-center gap-1 transition-colors"
                                        >
                                            <span>{t('blog.readMore')}</span>
                                            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                            <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="font-heading text-xl text-navy-900">No articles found</h3>
                            <p className="text-sm text-slate-500 mt-1">Try searching for a different keyword like "carpet" or "restoration".</p>
                        </div>
                    )}

                    {/* Bottom CTA Banner */}
                    <div className="mt-20 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden border border-gold-500/20">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1 text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Star size={14} className="fill-gold-400 text-gold-400" />
                                <span>South Florida Area Rug Care Since 1940</span>
                            </div>
                            <h2 className="font-heading text-2xl sm:text-3xl font-bold mb-3">
                                {t('blog.expertHelp')}
                            </h2>
                            <p className="text-slate-300 text-sm font-serif leading-relaxed mb-6">
                                {t('blog.expertHelpDesc')}
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <a
                                    href="/#contact"
                                    className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                                >
                                    {t('blog.bookNow')}
                                </a>
                                <a
                                    href="tel:305-801-9000"
                                    className="border border-white/20 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                                >
                                    <Phone size={14} className="text-gold-400" />
                                    <span>(305) 801-9000</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
