
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Info, Share2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CatalogItem } from '../types/catalog';
import InterestForm from '../components/InterestForm';

export default function CatalogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [item, setItem] = useState<CatalogItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (slug) fetchItem();
    }, [slug]);

    const fetchItem = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('catalog_items')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error('Error fetching item:', error);
        } else if (data) {
            setItem(data);
            setActiveImage(data.images[0] || '');
        }
        setIsLoading(false);
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex justify-center">
                <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen pt-32 text-center container-custom">
                <h1 className="text-3xl font-heading text-navy-900 mb-4">Item Not Found</h1>
                <Link to="/catalog" className="text-gold-600 underline">Return to Catalog</Link>
            </div>
        );
    }

    const pageTitle = `${item.name} - ${item.category || 'Luxury Rug'} | BakersRug`;
    const pageDescription = item.short_description || `Discover the ${item.name}, a unique ${item.category || 'Persian'} rug from our exclusive collection.`;
    const ogImage = item.images?.[0] || '';

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="product" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={ogImage} />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={window.location.href} />
                <meta property="twitter:title" content={pageTitle} />
                <meta property="twitter:description" content={pageDescription} />
                <meta property="twitter:image" content={ogImage} />
            </Helmet>

            <div className="pt-28 pb-20 min-h-screen bg-white">
                <div className="container-custom px-6 md:px-12">

                    <div className="flex items-center justify-between mb-8">
                        <Link to="/catalog" className="inline-flex items-center gap-2 text-slate-500 hover:text-gold-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Collection
                        </Link>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-navy-900 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                            {copied ? 'Copied Link' : 'Share Item'}
                        </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
                        {/* Left: Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-[4/3] bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                                {activeImage ? (
                                    <img
                                        src={activeImage}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                )}
                            </div>
                            {item.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                    {item.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(img)}
                                            className={`relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-gold-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Info & Form */}
                        <div>
                            <div className="mb-8 border-b border-slate-100 pb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-navy-50 text-navy-900 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {item.category || 'Rug'}
                                    </span>
                                    {item.serial_number && (
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-mono">
                                            #{item.serial_number}
                                        </span>
                                    )}
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-xs text-slate-500 font-serif italic">#{tag}</span>
                                    ))}
                                </div>

                                <h1 className="font-heading text-4xl md:text-5xl text-navy-900 mb-6 leading-tight">
                                    {item.name}
                                </h1>

                                <div className="prose prose-slate max-w-none text-slate-600 mb-8 font-serif leading-relaxed">
                                    <p className="text-lg">{item.full_description || item.short_description}</p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-md flex gap-3 text-blue-800 text-sm">
                                    <Info className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <strong>Price on Request:</strong> Because each piece is unique, we do not list prices publicly.
                                        Please inquire below for valuation and availability.
                                    </div>
                                </div>
                            </div>

                            {/* Inquiry Form */}
                            <div id="inquire">
                                <InterestForm
                                    className="bg-slate-50 border-slate-100"
                                    context={{
                                        source: 'catalog',
                                        itemId: item.id,
                                        itemName: item.name,
                                        itemSlug: item.slug
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
