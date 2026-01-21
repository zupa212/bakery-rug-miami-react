
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CatalogItem } from '../types/catalog';

export default function Catalog() {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [categories, setCategories] = useState<string[]>(['All']);

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('catalog_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching catalog:', error);
        } else {
            setItems(data || []);
            // Extract unique categories
            const uniqueCats = Array.from(new Set((data || []).map(i => i.category).filter(Boolean) as string[]));
            setCategories(['All', ...uniqueCats]);
        }
        setIsLoading(false);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <Helmet>
                <title>Rug Catalog | BakersRug Service Miami</title>
                <meta name="description" content="Browse our exclusive collection of fine Oriental and Persian rugs available in Miami." />
            </Helmet>

            <div className="pt-24 pb-16 min-h-screen bg-slate-50">
                <div className="container-custom px-6 md:px-12">

                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-gold-500 font-sans text-sm tracking-[0.3em] uppercase block mb-3">
                            The Collection
                        </span>
                        <h1 className="font-heading text-4xl md:text-5xl text-navy-900 mb-6">
                            Verified Authentic Rugs
                        </h1>
                        <p className="text-lg text-slate-600 font-serif italic">
                            Hand-selected pieces available for viewing in our Miami showroom.
                        </p>
                    </div>

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search rugs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-400"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat
                                        ? 'bg-navy-900 text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredItems.map(item => (
                                <Link
                                    key={item.id}
                                    to={`/catalog/${item.slug}`}
                                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
                                >
                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                        {item.images[0] ? (
                                            <img
                                                src={item.images[0]}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
                                        )}
                                        {item.category && (
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy-900">
                                                {item.category}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-heading text-xl text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-grow">
                                            {item.short_description}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                View Details
                                            </span>
                                            <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                                →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!isLoading && filteredItems.length === 0 && (
                        <div className="text-center py-20 text-slate-500">
                            No rugs found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
