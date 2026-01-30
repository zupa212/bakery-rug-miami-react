import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CatalogItem } from '../types/catalog';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';

export default function LatestArrivals() {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLatest();
    }, []);

    const fetchLatest = async () => {
        try {
            const { data, error } = await supabase
                .from('catalog_items')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(4);

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching latest arrivals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gold-500" /></div>;
    }

    if (items.length === 0) return null;

    return (
        <section className="py-20 bg-slate-50 border-b border-slate-200">
            <div className="container-custom px-6 md:px-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-gold-500 font-bold tracking-[0.2em] text-xs uppercase mb-2 block">Fresh from Inventory</span>
                        <h2 className="text-3xl md:text-4xl font-heading text-navy-900">Latest Arrivals</h2>
                    </div>
                    <Link to="/catalog" className="hidden md:flex items-center gap-2 text-navy-900 font-bold hover:text-gold-600 transition-colors">
                        View Full Collection <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((item) => (
                        <Link key={item.id} to={`/catalog/${item.slug}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-[4/5] overflow-hidden relative bg-slate-100">
                                <img
                                    src={item.images[0]}
                                    alt={item.name}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-3 left-3 bg-gold-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                                    New
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="bg-white text-navy-900 px-6 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform">View</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <p className="text-xs text-gold-600 font-bold uppercase tracking-wider mb-1">{item.category}</p>
                                <h3 className="font-heading text-lg text-navy-900 truncate mb-1">{item.name}</h3>
                                {item.serial_number && <p className="text-xs text-slate-400 font-mono">#{item.serial_number}</p>}
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link to="/catalog" className="inline-flex items-center gap-4 bg-navy-900 text-white px-10 py-5 rounded-sm font-sans text-sm font-bold tracking-[0.2em] uppercase hover:bg-navy-800 hover:scale-105 transition-all duration-300 shadow-xl group">
                        View Full Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
