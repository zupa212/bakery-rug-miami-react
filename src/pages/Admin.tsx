
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { CatalogItem } from '../types/catalog';
import { Plus, Trash2, Edit2, Loader2, LogOut, Check, X, Camera } from 'lucide-react';

// Simple PIN for "Auth" (In prod, use real Auth or env var)
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<Partial<CatalogItem>>({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem('rug_admin_auth');
        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            fetchItems();
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            localStorage.setItem('rug_admin_auth', 'true');
            fetchItems();
        } else {
            alert('Incorrect PIN');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
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
                <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-2xl">
                    <h1 className="font-heading text-2xl text-navy-900 mb-6 text-center">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-slate-200 rounded-md focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                            autoFocus
                        />
                        <button type="submit" className="w-full btn-gold py-3 text-lg font-bold">
                            Unlock
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Admin | BakersRug</title></Helmet>
            <div className="min-h-screen bg-slate-100 pb-20 pt-20">
                <div className="bg-white border-b border-slate-200 shadow-sm fixed top-0 left-0 right-0 z-30">
                    <div className="container-custom px-4 h-16 flex items-center justify-between">
                        <h1 className="font-heading text-xl text-navy-900">Rug Manager</h1>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div className="container-custom px-4 pt-4">
                    {/* Add Item Button */}
                    {!isEditing && (
                        <button
                            onClick={() => { setEditItem({}); setIsEditing(true); }}
                            className="w-full bg-navy-900 text-white rounded-lg p-4 flex items-center justify-center gap-3 shadow-lg mb-6 active:scale-95 transition-transform"
                        >
                            <Plus size={24} />
                            <span className="font-bold text-lg">Add New Rug</span>
                        </button>
                    )}

                    {/* Editor Modal/Overlay */}
                    {isEditing && (
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <div className="bg-white w-full max-w-lg h-[90vh] sm:h-auto sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom">
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                    <h2 className="font-heading text-lg">
                                        {editItem.id ? 'Edit Rug' : 'New Rug'}
                                    </h2>
                                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 rounded-full">
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Photos</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {editItem.images?.map((img, i) => (
                                                <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-slate-100">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditItem(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-md cursor-pointer hover:border-gold-500 hover:bg-gold-50 transition-colors">
                                                {isUploading ? <Loader2 size={24} className="animate-spin text-gold-500" /> : <Camera size={24} className="text-slate-400" />}
                                                <span className="text-xs text-slate-500 mt-1">Add Photo</span>
                                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                        <input
                                            required
                                            className="w-full p-3 border border-slate-200 rounded-md font-heading text-lg"
                                            placeholder="e.g. Royal Tabriz"
                                            value={editItem.name || ''}
                                            onChange={e => setEditItem(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Serial Number (e.g. BR-1001)</label>
                                            <input
                                                className="w-full p-3 border border-slate-200 rounded-md bg-slate-50"
                                                placeholder="Auto-generated if empty"
                                                value={editItem.serial_number || ''}
                                                onChange={e => setEditItem(prev => ({ ...prev, serial_number: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                            <select
                                                className="w-full p-3 border border-slate-200 rounded-md bg-white"
                                                value={editItem.category || ''}
                                                onChange={e => setEditItem(prev => ({ ...prev, category: e.target.value }))}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Persian">Persian</option>
                                                <option value="Turkish">Turkish</option>
                                                <option value="Oriental">Oriental</option>
                                                <option value="Modern">Modern</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
                                        <input
                                            className="w-full p-3 border border-slate-200 rounded-md"
                                            placeholder="e.g. Vintage, Wool, Blue, Geometric"
                                            value={editItem.tags?.join(', ') || ''}
                                            onChange={e => setEditItem(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                                        />
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {editItem.tags?.map((tag, i) => (
                                                <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Short Description</label>
                                        <textarea
                                            className="w-full p-3 border border-slate-200 rounded-md"
                                            placeholder="Brief line for the listing card..."
                                            value={editItem.short_description || ''}
                                            onChange={e => setEditItem(prev => ({ ...prev, short_description: e.target.value }))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Full Description</label>
                                        <textarea
                                            rows={4}
                                            className="w-full p-3 border border-slate-200 rounded-md"
                                            placeholder="Detailed history, condition, etc..."
                                            value={editItem.full_description || ''}
                                            onChange={e => setEditItem(prev => ({ ...prev, full_description: e.target.value }))}
                                        />
                                    </div>
                                </form>

                                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-md"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="flex-[2] py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold rounded-md flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : <Check />}
                                        Save Rug
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Item List */}
                    <div className="space-y-4">
                        {items.length === 0 && !isLoading && (
                            <div className="text-center text-slate-500 py-10">No rugs in catalog.</div>
                        )}

                        {items.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex gap-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                    {item.images?.[0] && (
                                        <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-navy-900 truncate">{item.name}</h3>
                                    <p className="text-xs text-slate-500 mb-1 font-mono text-gold-600">{item.serial_number}</p>
                                    <p className="text-xs text-slate-500 mb-2">{item.category}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => { setEditItem(item); setIsEditing(true); }}
                                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
