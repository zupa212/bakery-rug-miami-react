import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { CatalogItem } from '../types/catalog';
import {
    Plus, Trash2, Edit2, Loader2, LogOut, Check, X, Camera,
    LayoutDashboard, Package, Search, Menu, User, Settings
} from 'lucide-react';

// Simple PIN for "Auth" (In prod, use real Auth or env var)
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Admin Search State
    const [adminSearch, setAdminSearch] = useState('');

    // Toggle Mobile Sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<Partial<CatalogItem>>({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // Check both storages
        const sessionAuth = sessionStorage.getItem('rug_admin_auth');
        const localAuth = localStorage.getItem('rug_admin_auth');

        if (sessionAuth === 'true' || localAuth === 'true') {
            setIsAuthenticated(true);
            fetchItems();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            if (rememberMe) {
                localStorage.setItem('rug_admin_auth', 'true');
            } else {
                sessionStorage.setItem('rug_admin_auth', 'true');
            }
            fetchItems();
        } else {
            alert('Incorrect PIN');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('rug_admin_auth');
        localStorage.removeItem('rug_admin_auth');
    };

    const fetchItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('catalog_items')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error(error);
        else setItems(data || []);
        setIsLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        setIsUploading(true);
        try {
            // Upload to 'rugs' bucket
            const { error: uploadError } = await supabase.storage
                .from('rugs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data } = supabase.storage.from('rugs').getPublicUrl(filePath);

            setEditItem(prev => ({
                ...prev,
                images: [...(prev.images || []), data.publicUrl]
            }));
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Basic slug/serial generation
            const slug = editItem.slug || editItem.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
            const serial_number = editItem.serial_number || `BR-${Math.floor(1000 + Math.random() * 9000)}`;

            const payload = { ...editItem, slug, serial_number };

            if (editItem.id) {
                // Update
                const { error } = await supabase
                    .from('catalog_items')
                    .update(payload)
                    .eq('id', editItem.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('catalog_items')
                    .insert([payload]);
                if (error) throw error;
            }

            setIsEditing(false);
            setEditItem({});
            fetchItems();
        } catch (error: any) {
            alert('Error saving item: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rug?')) return;
        setIsLoading(true);
        await supabase.from('catalog_items').delete().eq('id', id);
        fetchItems();
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-10 w-full max-w-sm shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-400 to-gold-600"></div>
                    <div className="text-center mb-10">
                        <span className="font-heading font-bold text-3xl text-navy-900 tracking-wide block">BAKERSRUG</span>
                        <span className="text-xs font-bold text-gold-600 uppercase tracking-[0.3em] block mt-1">Admin Portal</span>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Access PIN</label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="••••"
                                className="w-full px-4 py-4 text-center text-3xl tracking-widest border border-slate-200 rounded-xl focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all font-heading"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-gold-600 rounded focus:ring-gold-500 border-gray-300"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">Keep me logged in</label>
                        </div>

                        <button type="submit" className="w-full bg-navy-900 text-white rounded-xl py-4 text-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-navy-900/20">
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Admin | BakersRug</title></Helmet>

            {/* Main Layout */}
            <div className="min-h-screen bg-slate-50 flex">

                {/* 1. Sidebar (Desktop) */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full flex flex-col">
                        {/* Logo Area */}
                        <div className="p-8 pb-4">
                            <span className="font-heading font-bold text-2xl tracking-wide block text-white">BAKERSRUG</span>
                            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.3em] block mt-1">Advisors</span>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-lg font-medium shadow-sm transition-all border border-white/5">
                                <LayoutDashboard size={20} className="text-gold-400" />
                                <span>Overview</span>
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all">
                                <Package size={20} />
                                <span>Inventory</span>
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all">
                                <User size={20} />
                                <span>Leads</span>
                            </a>
                            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-all">
                                <Settings size={20} />
                                <span>Settings</span>
                            </a>
                        </nav>

                        {/* User / Logout */}
                        <div className="p-4 border-t border-white/10">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-red-400 transition-colors text-sm font-bold uppercase tracking-wider">
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                {/* 2. Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                    {/* Header */}
                    <header className="bg-white border-b border-slate-200 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md">
                                <Menu size={24} />
                            </button>
                            <h1 className="font-heading text-xl sm:text-2xl text-navy-900 truncate">Inventory Manager</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Add Button (Desktop) */}
                            {!isEditing && (
                                <button
                                    onClick={() => { setEditItem({}); setIsEditing(true); }}
                                    className="hidden sm:flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-navy-900/20 active:scale-95 transition-all text-sm"
                                >
                                    <Plus size={18} />
                                    <span>Add Rug</span>
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Content Scrollable Area */}
                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
                        <div className="max-w-6xl mx-auto">

                            {/* Mobile Add Button (Floater) */}
                            {!isEditing && (
                                <button
                                    onClick={() => { setEditItem({}); setIsEditing(true); }}
                                    className="sm:hidden fixed bottom-6 right-6 bg-navy-900 text-white p-4 rounded-full shadow-2xl shadow-navy-900/40 z-30 flex items-center justify-center active:scale-90 transition-transform"
                                >
                                    <Plus size={24} />
                                </button>
                            )}

                            {/* Search Bar */}
                            <div className="mb-8 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search inventory by name, serial number, or tag..."
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                                    value={adminSearch}
                                    onChange={(e) => setAdminSearch(e.target.value)}
                                />
                            </div>

                            {/* Stats Cards (Optional for "For Work" look) */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Rugs</span>
                                    <span className="text-2xl font-heading text-navy-900">{items.length}</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hidden sm:block">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Value</span>
                                    <span className="text-2xl font-heading text-navy-900">-</span>
                                </div>
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hidden sm:block">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Views</span>
                                    <span className="text-2xl font-heading text-navy-900">-</span>
                                </div>
                            </div>

                            {/* List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {items
                                    .filter(i =>
                                        i.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                                        i.serial_number?.toLowerCase().includes(adminSearch.toLowerCase())
                                    )
                                    .map(item => (
                                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                                            <div className="aspect-[4/3] bg-slate-100 relative">
                                                {item.images?.[0] ? (
                                                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-300"><Camera size={32} /></div>
                                                )}
                                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditItem(item); setIsEditing(true); }} className="bg-white/90 p-2 rounded-full text-navy-900 hover:text-gold-600 shadow-sm"><Edit2 size={16} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="bg-white/90 p-2 rounded-full text-red-600 hover:bg-red-50 shadow-sm"><Trash2 size={16} /></button>
                                                </div>
                                                {item.category && <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">{item.category}</span>}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-navy-900 line-clamp-1">{item.name}</h3>
                                                </div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="font-mono text-xs text-gold-600 bg-gold-50 px-1.5 py-0.5 rounded">{item.serial_number || 'N/A'}</span>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between text-xs text-slate-500 font-medium">
                                                    <span>Added {new Date(item.id ? 0 : Date.now()).toLocaleDateString()}</span> {/* Placeholder date logic */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Empty State */}
                            {items.length === 0 && !isLoading && (
                                <div className="text-center py-20">
                                    <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Package size={32} />
                                    </div>
                                    <h3 className="text-navy-900 font-bold text-lg">No inventory yet</h3>
                                    <p className="text-slate-500 mb-6">Start adding your collection.</p>
                                    <button onClick={() => { setEditItem({}); setIsEditing(true); }} className="text-gold-600 font-bold hover:underline">Add First Rug</button>
                                </div>
                            )}

                        </div>
                    </div>
                </main>

                {/* Editor Modal (Keep existing logic, updated style) */}
                {isEditing && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-2xl h-[95vh] sm:h-[85vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                                <div>
                                    <h2 className="font-heading text-xl text-navy-900">{editItem.id ? 'Edit Rug' : 'New Rug'}</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Product Details</p>
                                </div>
                                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-navy-900 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-navy-900 mb-3">Photos</label>
                                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                        {editItem.images?.map((img, i) => (
                                            <div key={i} className="aspect-square relative rounded-lg overflow-hidden bg-slate-100 group border border-slate-200">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditItem(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))}
                                                    className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-gold-500 hover:bg-gold-50/50 transition-all group">
                                            {isUploading ? <Loader2 size={24} className="animate-spin text-gold-500" /> : <Camera size={24} className="text-slate-400 group-hover:text-gold-500" />}
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-navy-900 mb-1">Name</label>
                                        <input
                                            required
                                            className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all font-heading text-lg outline-none"
                                            placeholder="e.g. Royal Tabriz"
                                            value={editItem.name || ''}
                                            onChange={e => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1">Serial Number</label>
                                            <input
                                                className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none font-mono text-sm"
                                                placeholder="Auto-gen"
                                                value={editItem.serial_number || ''}
                                                onChange={e => setEditItem(prev => ({ ...prev, serial_number: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-navy-900 mb-1">Category</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none appearance-none"
                                                    value={editItem.category || ''}
                                                    onChange={e => setEditItem(prev => ({ ...prev, category: e.target.value }))}
                                                >
                                                    <option value="">Select Category...</option>
                                                    <option value="Persian">Persian</option>
                                                    <option value="Turkish">Turkish</option>
                                                    <option value="Oriental">Oriental</option>
                                                    <option value="Modern">Modern</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-navy-900 mb-1">Tags</label>
                                        <input
                                            className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none"
                                            placeholder="e.g. Vintage, Wool, Blue"
                                            value={editItem.tags?.join(', ') || ''}
                                            onChange={e => setEditItem(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                                        />
                                        <div className="flex flex-wrap gap-2 mt-2 min-h-[24px]">
                                            {editItem.tags?.map((tag, i) => (
                                                <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-navy-900 text-white px-2 py-1 rounded-md">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-navy-900 mb-1">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none resize-none"
                                            placeholder="Brief description..."
                                            value={editItem.short_description || ''}
                                            onChange={e => setEditItem(prev => ({ ...prev, short_description: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </form>

                            <div className="p-5 border-t border-slate-100 bg-white flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-3.5 font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex-[2] py-3.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl shadow-lg shadow-navy-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                                    Save Item
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
