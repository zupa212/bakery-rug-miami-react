import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { CatalogItem, Lead } from '../types/catalog';
import {
    Plus, Trash2, Edit2, Loader2, LogOut, Check, X, Camera,
    LayoutDashboard, Package, Search, Menu, User, Settings, Mail, Phone
} from 'lucide-react';

// Simple PIN for "Auth" (In prod, use real Auth or env var)
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';

type AdminTab = 'overview' | 'inventory' | 'leads' | 'settings';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Data State
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Filter/Search State
    const [adminSearch, setAdminSearch] = useState('');

    // Inventory Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<Partial<CatalogItem>>({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // Check authentication
        const sessionAuth = sessionStorage.getItem('rug_admin_auth');
        const localAuth = localStorage.getItem('rug_admin_auth');

        if (sessionAuth === 'true' || localAuth === 'true') {
            setIsAuthenticated(true);
            fetchAllData();
        }
    }, []);

    // Auto-Tagging Logic
    useEffect(() => {
        if (!isEditing || !editItem.name) return;

        // Expanded Keyword List for better auto-tagging (Aiming for 3-4 tags)
        const keywords = [
            // Origins/Styles
            'Persian', 'Turkish', 'Oriental', 'Modern', 'Silk', 'Wool',
            'Runner', 'Kilim', 'Antique', 'Vintage', 'Tabriz', 'Heriz',
            'Oushak', 'Tribal', 'Floral', 'Geometric', 'Hereke', 'Isfahan',
            'Kashan', 'Kazak', 'Bokhara', 'Gabbeh', 'Caucasian', 'Anatolian',
            // Colors
            'Red', 'Blue', 'Beige', 'Cream', 'Green', 'Gold', 'Black',
            'Navy', 'Rust', 'Ivory', 'Brown', 'Grey', 'Orange', 'Pink',
            // Sizes/Shapes
            'Large', 'Small', 'Area', 'Round', 'Square', 'Oversize', 'Palace',
            // Attributes
            'Handmade', 'Knotted', 'Woven', 'Traditional', 'Contemporary'
        ];

        const currentTags = new Set(editItem.tags || []);
        let hasChanges = false;

        keywords.forEach(keyword => {
            // Check if name contains keyword (case-insensitive)
            if (editItem.name?.toLowerCase().includes(keyword.toLowerCase())) {
                // Add correctly cased keyword if not present
                if (!currentTags.has(keyword)) {
                    currentTags.add(keyword);
                    hasChanges = true;
                }
            }
        });

        // Also check category if selected
        if (editItem.category && !currentTags.has(editItem.category)) {
            currentTags.add(editItem.category);
            hasChanges = true;
        }

        if (hasChanges) {
            setEditItem(prev => ({ ...prev, tags: Array.from(currentTags) }));
        }
    }, [editItem.name, editItem.category]);

    const fetchAllData = async () => {
        setIsLoading(true);
        await Promise.all([fetchItems(), fetchLeads()]);
        setIsLoading(false);
    };

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('catalog_items')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error(error);
        else setItems(data || []);
    };

    const fetchLeads = async () => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error('Error fetching leads:', error);
        else setLeads(data || []);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsAuthenticated(true);
            if (rememberMe) {
                localStorage.setItem('rug_admin_auth', 'true');
            } else {
                sessionStorage.setItem('rug_admin_auth', 'true');
            }
            fetchAllData();
        } else {
            alert('Incorrect PIN');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('rug_admin_auth');
        localStorage.removeItem('rug_admin_auth');
    };

    // --- Inventory Handlers ---

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        setIsUploading(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('rugs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

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

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const slug = editItem.slug || editItem.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
            const serial_number = editItem.serial_number || `BR-${Math.floor(1000 + Math.random() * 9000)}`;
            const payload = { ...editItem, slug, serial_number };

            if (editItem.id) {
                const { error } = await supabase.from('catalog_items').update(payload).eq('id', editItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('catalog_items').insert([payload]);
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

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this rug?')) return;
        setIsLoading(true);
        await supabase.from('catalog_items').delete().eq('id', id);
        fetchItems();
        setIsLoading(false);
    };

    // --- Render Views ---

    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-heading text-navy-900 mb-6">Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Rugs</p>
                        <p className="text-3xl font-heading text-navy-900">{items.length}</p>
                    </div>
                    <div className="bg-navy-50 p-3 rounded-xl text-navy-900"><Package size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Leads</p>
                        <p className="text-3xl font-heading text-navy-900">{leads.length}</p>
                    </div>
                    <div className="bg-gold-50 p-3 rounded-xl text-gold-600"><User size={24} /></div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Inventory Value</p>
                        <p className="text-3xl font-heading text-navy-900 opacity-50">-</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl text-green-600"><Check size={24} /></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading text-lg text-navy-900">Recent Leads</h3>
                    <button onClick={() => setActiveTab('leads')} className="text-sm font-bold text-gold-600 hover:underline">View All</button>
                </div>
                {leads.length > 0 ? (
                    <div className="space-y-4">
                        {leads.slice(0, 3).map(lead => (
                            <div key={lead.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-navy-900">{lead.full_name}</p>
                                    <p className="text-sm text-slate-500">{lead.item_name ? `Inquiry: ${lead.item_name}` : 'General Inquiry'}</p>
                                </div>
                                <span className="text-xs font-mono text-slate-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 text-center py-8">No leads yet.</p>
                )}
            </div>
        </div>
    );

    const renderInventory = () => (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-heading text-navy-900">Inventory Manager</h2>
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search inventory..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => { setEditItem({}); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-5 py-3 rounded-lg font-bold shadow-lg shadow-navy-900/20 active:scale-95 transition-all"
                >
                    <Plus size={18} />
                    <span>Add Rug</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items
                    .filter(i => {
                        const searchLower = adminSearch.toLowerCase();
                        return (
                            i.name.toLowerCase().includes(searchLower) ||
                            i.serial_number?.toLowerCase().includes(searchLower) ||
                            i.category?.toLowerCase().includes(searchLower) ||
                            i.tags?.some(tag => tag.toLowerCase().includes(searchLower))
                        );
                    })
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
                                    <button onClick={() => handleDeleteItem(item.id)} className="bg-white/90 p-2 rounded-full text-red-600 hover:bg-red-50 shadow-sm"><Trash2 size={16} /></button>
                                </div>
                                {item.category && <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">{item.category}</span>}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="font-bold text-navy-900 line-clamp-1 mb-1">{item.name}</h3>
                                <div className="mt-auto flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                    <span className="font-mono text-xs text-slate-500 font-bold">{item.serial_number || 'N/A'}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.tags?.[0] || 'No Tags'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );

    const handleExportLeads = () => {
        if (leads.length === 0) return;

        // Create CSV Header
        const headers = ['Date', 'Time', 'Name', 'Email', 'Phone', 'Service Type / Item', 'Message', 'Score'];

        // Map Rows
        const rows = leads.map(lead => {
            const date = new Date(lead.created_at);
            return [
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                `"${lead.full_name}"`,
                lead.email,
                lead.phone || '',
                `"${lead.item_name || ''}"`,
                `"${(lead.message || '').replace(/"/g, '""')}"`, // Escape quotes
                lead.score || 0
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        // Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderLeads = () => (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-heading text-navy-900">Inbox</h2>
                <button
                    onClick={handleExportLeads}
                    className="flex items-center gap-2 bg-white border border-slate-200 text-navy-900 hover:bg-slate-50 px-4 py-2 rounded-lg font-bold shadow-sm transition-all"
                >
                    <LayoutDashboard size={18} className="text-gold-600" />
                    <span>Export CSV</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {leads.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No messages yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {leads.map(lead => (
                            <div key={lead.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gold-100 text-gold-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                            {lead.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-navy-900">{lead.full_name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                                                {lead.phone && <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-mono block mb-1">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="text-[10px] text-slate-300 font-mono">
                                            {new Date(lead.created_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-13 pl-13">
                                    {lead.item_name && (
                                        <div className="inline-block bg-navy-50 text-navy-800 text-xs font-bold px-2 py-1 rounded mb-2">
                                            Ref: {lead.item_name}
                                        </div>
                                    )}
                                    <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{lead.message || "No message content."}</p>
                                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
                                        <span>Source: {lead.source_page}</span>
                                        {lead.score && <span className={`font-bold ${lead.score > 50 ? 'text-green-600' : 'text-slate-400'}`}>Score: {lead.score}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="animate-in fade-in duration-500 max-w-xl">
            <h2 className="text-2xl font-heading text-navy-900 mb-6">Settings</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                <div>
                    <h3 className="font-bold text-lg text-navy-900 mb-1">Admin Profile</h3>
                    <p className="text-slate-500 text-sm">Managing as Primary Advisor</p>
                </div>
                <hr className="border-slate-100" />
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-colors"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    const renderEditorModal = () => (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl h-[95vh] sm:h-[85vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="font-heading text-xl text-navy-900">{editItem.id ? 'Edit Rug' : 'New Rug'}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Product Details</p>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-navy-900 transition-colors"><X size={24} /></button>
                </div>

                <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-8">
                    <div>
                        <label className="block text-sm font-bold text-navy-900 mb-3">Photos</label>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {editItem.images?.map((img, i) => (
                                <div key={i} className="aspect-square relative rounded-lg overflow-hidden bg-slate-100 group border border-slate-200">
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => setEditItem(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"><X size={12} /></button>
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
                            <input required className="w-full p-4 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all font-heading text-lg outline-none" placeholder="e.g. Royal Tabriz" value={editItem.name || ''} onChange={e => setEditItem(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-1">Serial Number</label>
                                <input className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none font-mono text-sm" placeholder="Auto-gen" value={editItem.serial_number || ''} onChange={e => setEditItem(prev => ({ ...prev, serial_number: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-navy-900 mb-1">Category</label>
                                <div className="relative">
                                    <select className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none appearance-none" value={editItem.category || ''} onChange={e => setEditItem(prev => ({ ...prev, category: e.target.value }))}>
                                        <option value="">Select Category...</option>
                                        <option value="Persian">Persian</option>
                                        <option value="Turkish">Turkish</option>
                                        <option value="Oriental">Oriental</option>
                                        <option value="Modern">Modern</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-navy-900 mb-1">Tags</label>
                            <input className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none" placeholder="e.g. Vintage, Wool, Blue" value={editItem.tags?.join(', ') || ''} onChange={e => setEditItem(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} />
                            <div className="flex flex-wrap gap-2 mt-2 min-h-[24px]">
                                {editItem.tags?.map((tag, i) => (<span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-navy-900 text-white px-2 py-1 rounded-md">#{tag}</span>))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-navy-900 mb-1">Description</label>
                            <textarea rows={3} className="w-full p-3 bg-slate-50 border-transparent focus:bg-white focus:border-gold-500 border rounded-xl transition-all outline-none resize-none" placeholder="Brief description..." value={editItem.short_description || ''} onChange={e => setEditItem(prev => ({ ...prev, short_description: e.target.value }))} />
                        </div>
                    </div>
                </form>

                <div className="p-5 border-t border-slate-100 bg-white flex gap-3">
                    {editItem.id && (
                        <button
                            type="button"
                            onClick={() => { handleDeleteItem(editItem.id!); setIsEditing(false); }}
                            className="p-3.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            title="Delete Rug"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3.5 font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleSaveItem} disabled={isLoading} className="flex-[2] py-3.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl shadow-lg shadow-navy-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">{isLoading ? <Loader2 className="animate-spin" /> : <Check size={18} />} Save Item</button>
                </div>
            </div>
        </div>
    );

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
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="••••"
                            className="w-full px-4 py-4 text-center text-3xl tracking-widest border border-slate-200 rounded-xl focus:border-gold-500 focus:ring-4 focus:ring-gold-500/10 outline-none transition-all font-heading"
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 text-gold-600 rounded focus:ring-gold-500 border-gray-300" />
                            <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">Keep me logged in</label>
                        </div>
                        <button type="submit" className="w-full bg-navy-900 text-white rounded-xl py-4 text-lg font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-navy-900/20">Unlock</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Admin | BakersRug</title></Helmet>
            <div className="min-h-screen bg-slate-50 flex">
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full flex flex-col">
                        <div className="p-8 pb-4">
                            <span className="font-heading font-bold text-2xl tracking-wide block text-white">BAKERSRUG</span>
                            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.3em] block mt-1">Advisors</span>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-gold-400' : ''} /> <span>Overview</span>
                            </button>
                            <button onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'inventory' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Package size={20} className={activeTab === 'inventory' ? 'text-gold-400' : ''} /> <span>Inventory</span>
                            </button>
                            <button onClick={() => { setActiveTab('leads'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'leads' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <User size={20} className={activeTab === 'leads' ? 'text-gold-400' : ''} /> <span>Leads</span>
                            </button>
                            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Settings size={20} className={activeTab === 'settings' ? 'text-gold-400' : ''} /> <span>Settings</span>
                            </button>
                        </nav>
                        <div className="p-4 border-t border-white/10">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-red-400 transition-colors text-sm font-bold uppercase tracking-wider">
                                <LogOut size={16} /> <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <header className="bg-white border-b border-slate-200 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"><Menu size={24} /></button>
                            <h1 className="font-heading text-xl sm:text-2xl text-navy-900 truncate capitalize">{activeTab}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-wider">BakersRug Admin</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
                        <div className="max-w-6xl mx-auto">
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'inventory' && renderInventory()}
                            {activeTab === 'leads' && renderLeads()}
                            {activeTab === 'settings' && renderSettings()}
                        </div>
                    </div>
                </main>

                {/* Editor Modal (Inventory Only) */}
                {isEditing && renderEditorModal()}
            </div>
        </>
    );
}
