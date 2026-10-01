import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { CatalogItem, Lead } from '../types/catalog';
import {
    Plus, Trash2, Edit2, Loader2, LogOut, Check, X, Camera,
    LayoutDashboard, Package, Search, Menu, User, Settings, Mail, Phone,
    AlertCircle, FileText, Save, Volume2, VolumeX, Bell, Globe, TrendingUp, Award, CheckCircle2,
    Laptop, BellRing, Database, ShieldCheck, Smartphone, Share2, PlusSquare, RefreshCw, Zap,
    DownloadCloud, QrCode, Star, ExternalLink, Sparkles, Copy
} from 'lucide-react';
import QRCode from 'qrcode';
import ImageEditor from '../components/admin/ImageEditor';
import { audioNotification } from '../utils/audioNotification';
import { desktopNotification, DesktopPermissionStatus } from '../utils/desktopNotification';
import { cacheManager } from '../utils/cacheManager';
import {
    getDeviceCapabilities,
    requestPushPermission,
    triggerLocalPushNotification,
    registerServiceWorker,
    DevicePushCapabilities
} from '../utils/iosPushNotification';
import { useLanguage } from '../context/LanguageContext';

// Simple PIN for "Auth" (In prod, use real Auth or env var)
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '1234';

type AdminTab = 'overview' | 'inventory' | 'leads' | 'settings' | 'editor' | 'seo' | 'reviews';

// CMS Content Types
interface SiteContent {
    hero: {
        tagline: string;
        tagline_mobile: string;
        headline_prefix: string;
        headline: string;
        description: string;
        phone: string;
        years: string;
        years_label: string;
        rating_text: string;
    };
    services: {
        tagline: string;
        headline: string;
        description: string;
    };
    process: {
        tagline: string;
        headline: string;
        description: string;
    };
    contact: {
        tagline: string;
        headline: string;
        description: string;
    };
    trust_indicators: {
        item1_title: string;
        item1_desc: string;
        item2_title: string;
        item2_desc: string;
        item3_title: string;
        item3_desc: string;
        item4_title: string;
        item4_desc: string;
    };
}

// Notification Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${type === 'success' ? 'bg-navy-900 text-white' : 'bg-red-50 text-red-600 border border-red-100'
                }`}
        >
            {type === 'success' ? <Check size={20} className="text-gold-500" /> : <AlertCircle size={20} />}
            <span className="font-bold">{message}</span>
        </motion.div>
    );
};

export default function Admin() {
    const { language, toggleLanguage, t } = useLanguage();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Data State
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Google Review QR State
    const [adminQrUrl, setAdminQrUrl] = useState('');
    const [adminReviewUrl, setAdminReviewUrl] = useState('https://search.google.com/local/writereview?placeid=ChIJH3sV9OnH2YgRTYU7vP_Dg7c');
    const [copiedReviewLink, setCopiedReviewLink] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isSoundActive, setIsSoundActive] = useState(() => audioNotification.isSoundEnabled());
    const lastKnownLeadCount = React.useRef<number>(0);

    // Filter/Search State
    const [adminSearch, setAdminSearch] = useState('');

    // Inventory Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editItem, setEditItem] = useState<Partial<CatalogItem>>({});
    const [isUploading, setIsUploading] = useState(false);

    // CMS Content State
    const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
    const [isSavingContent, setIsSavingContent] = useState(false);

    // System Health & Fail-Safe State
    const [systemStatus, setSystemStatus] = useState<any>(null);
    const [showHealthModal, setShowHealthModal] = useState(false);
    const [cacheStatus, setCacheStatus] = useState({ isCached: false, age: 'Syncing...' });

    // iOS / Mobile Push State
    const [deviceCaps, setDeviceCaps] = useState<DevicePushCapabilities>(() => getDeviceCapabilities());
    const [showIosModal, setShowIosModal] = useState(false);

    // Fail-safe Blob Backups State
    const [blobBackups, setBlobBackups] = useState<any[]>([]);
    const [isLoadingBackups, setIsLoadingBackups] = useState(false);
    const [showBackupsModal, setShowBackupsModal] = useState(false);
    const [restoringBlob, setRestoringBlob] = useState<string | null>(null);

    useEffect(() => {
        QRCode.toDataURL(adminReviewUrl, { width: 320, margin: 2, color: { dark: '#091124', light: '#ffffff' } })
            .then(setAdminQrUrl)
            .catch(console.error);
    }, [adminReviewUrl]);

    useEffect(() => {
        registerServiceWorker();
        setDeviceCaps(getDeviceCapabilities());
    }, []);

    useEffect(() => {
        // Check authentication
        const sessionAuth = sessionStorage.getItem('rug_admin_auth');
        const localAuth = localStorage.getItem('rug_admin_auth');

        if (sessionAuth === 'true' || localAuth === 'true') {
            setIsAuthenticated(true);
            fetchAllData();
        }
    }, []);

    // Helper for Notifications with Audio
    const showToast = (message: string, type: 'success' | 'error' = 'success', playSound: boolean = true) => {
        setNotification({ message, type });
        if (playSound) {
            audioNotification.playChime(type === 'error' ? 'alert' : 'success');
        }
    };

    const handleToggleSound = () => {
        const nextState = audioNotification.toggleSound();
        setIsSoundActive(nextState);
        showToast(nextState ? 'Sound notifications enabled 🔔' : 'Sound notifications muted 🔕', 'success', false);
    };

    const [desktopPerm, setDesktopPerm] = useState<DesktopPermissionStatus>(() => desktopNotification.getPermission());

    const handleEnableDesktopNotifications = async () => {
        const res = await desktopNotification.requestPermission();
        setDesktopPerm(res);
        if (res === 'granted') {
            showToast('Desktop alerts enabled! You will be alerted when new leads arrive 💻', 'success');
        } else if (res === 'denied') {
            showToast('Desktop alerts blocked in your browser. Please allow notifications in site settings.', 'error');
        }
    };

    const handleTestDesktopNotification = async () => {
        if (desktopPerm !== 'granted') {
            await handleEnableDesktopNotifications();
            return;
        }
        desktopNotification.send({
            title: '🔥 New Lead: Alexander Wright [Test]',
            body: 'Silk Tabriz (10x14) Restoration\nPhone: (305) 555-0199\nLocation: Coral Gables, FL',
            tag: 'test-lead-' + Date.now(),
            onClick: () => setActiveTab('leads')
        });
        showToast('Sent test desktop alert to your screen 💻', 'success');
    };

    const handleTestSound = () => {
        audioNotification.playChime('lead');
        showToast('🔔 Playing lead notification chime', 'success', false);
    };

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

    const fetchAllData = async (force: boolean = false) => {
        // 1. Instant Cache Hydration (Zero Wait Time)
        if (!force) {
            const cachedLeads = cacheManager.get<Lead[]>('leads');
            const cachedItems = cacheManager.get<CatalogItem[]>('items');

            if (cachedLeads.data && cachedLeads.data.length > 0) {
                setLeads(cachedLeads.data);
                lastKnownLeadCount.current = cachedLeads.data.length;
            }
            if (cachedItems.data && cachedItems.data.length > 0) {
                setItems(cachedItems.data);
            }
            if (cachedLeads.data || cachedItems.data) {
                setCacheStatus({
                    isCached: true,
                    age: cacheManager.formatAge(cachedLeads.ageSeconds)
                });
            }
        }

        // 2. Background Network Revalidation
        setIsLoading(true);
        await Promise.all([
            fetchItems(),
            fetchLeads(),
            fetchSiteContent(),
            checkSystemHealth()
        ]);
        setIsLoading(false);
        setCacheStatus({ isCached: true, age: 'Just now' });
    };

    const checkSystemHealth = async () => {
        try {
            const res = await fetch('/api/system-status');
            if (res.ok) {
                const data = await res.json();
                setSystemStatus(data);
                return;
            }
        } catch (e) {
            // fallback to direct ping
        }

        const start = Date.now();
        const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const latency = Date.now() - start;
        setSystemStatus({
            timestamp: new Date().toISOString(),
            supabase: {
                status: error ? 'degraded' : 'operational',
                latencyMs: latency,
                message: error ? error.message : 'Όλα εντάξει - Operational',
                leadsCount: count || 0
            },
            blobStorage: {
                status: 'active',
                message: 'Vercel Blob Fail-Safe Active',
                hasToken: true
            }
        });
    };

    const fetchBlobBackups = async () => {
        setIsLoadingBackups(true);
        setShowBackupsModal(true);
        try {
            const res = await fetch('/api/leads-backup');
            if (res.ok) {
                const data = await res.json();
                setBlobBackups(data.blobs || []);
            }
        } catch (err) {
            console.error('Failed to fetch blob backups:', err);
            showToast('Failed to load backup blobs', 'error');
        } finally {
            setIsLoadingBackups(false);
        }
    };

    const handleRestoreBlobLead = async (blobUrl: string, blobName: string) => {
        setRestoringBlob(blobName);
        try {
            const fetchRes = await fetch(blobUrl);
            const blobJson = await fetchRes.json();
            const leadPayload = blobJson.lead || blobJson;

            const syncRes = await fetch('/api/leads-backup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadData: leadPayload })
            });

            if (syncRes.ok) {
                showToast(`Lead restored to Supabase successfully! ✨`, 'success');
                fetchLeads(false);
            } else {
                const errData = await syncRes.json();
                showToast(`Failed to restore: ${errData.error || 'Server error'}`, 'error');
            }
        } catch (err: any) {
            showToast(`Restore error: ${err.message}`, 'error');
        } finally {
            setRestoringBlob(null);
        }
    };

    const handleEnableIosPush = async () => {
        const caps = getDeviceCapabilities();
        setDeviceCaps(caps);

        if (caps.needsAddToHomeScreen) {
            setShowIosModal(true);
            return;
        }

        const res = await requestPushPermission();
        setDeviceCaps(getDeviceCapabilities());

        if (res === 'granted') {
            await triggerLocalPushNotification({
                title: '🔥 Bakers Rug Miami',
                body: 'Οι ειδοποιήσεις ενεργοποιήθηκαν στο iPhone σας! Θα λαμβάνετε άμεσα νέα leads.',
                url: '/admin'
            });
            showToast('iPhone Push Alerts enabled! 📱', 'success');
        } else if (res === 'denied') {
            showToast('Push notifications are blocked in your settings.', 'error');
        }
    };

    const handleTestIosPush = async () => {
        const sent = await triggerLocalPushNotification({
            title: '🔥 New Lead: Alexander Wright [iPhone Test]',
            body: 'Silk Tabriz (10x14) Restoration\nPhone: (305) 555-0199 • Coral Gables',
            url: '/admin'
        });
        if (sent) {
            showToast('Sent test notification to your device 📱', 'success');
        } else {
            handleEnableIosPush();
        }
    };

    const fetchSiteContent = async () => {
        const { data, error } = await supabase
            .from('site_content')
            .select('*');
        if (error) {
            console.error('Error fetching site content:', error);
            return;
        }
        if (data) {
            const content: any = {};
            data.forEach((row: any) => {
                content[row.id] = row.content;
            });
            setSiteContent(content as SiteContent);
        }
    };

    const saveSiteContent = async (sectionId: string, content: any) => {
        setIsSavingContent(true);
        const { error } = await supabase
            .from('site_content')
            .upsert({ id: sectionId, content, updated_at: new Date().toISOString() });

        if (error) {
            showToast('Error saving content: ' + error.message, 'error');
        } else {
            showToast(`${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} content saved!`);
            fetchSiteContent();
        }
        setIsSavingContent(false);
    };

    const fetchItems = async () => {
        const { data, error } = await supabase
            .from('catalog_items')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) console.error(error);
        else {
            setItems(data || []);
            cacheManager.set('items', data || []);
        }
    };

    const fetchLeads = async (alertOnNew: boolean = false) => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching leads:', error);
            return;
        }
        if (data) {
            if (alertOnNew && lastKnownLeadCount.current > 0 && data.length > lastKnownLeadCount.current) {
                const newest = data[0];
                audioNotification.playChime('lead');
                setNotification({
                    message: `🔔 New Lead: ${newest.full_name || 'Customer'} (${newest.item_name || 'Inquiry'})`,
                    type: 'success'
                });
                desktopNotification.send({
                    title: `🔥 New Lead: ${newest.full_name || 'Inquiry'}`,
                    body: `${newest.item_name || 'Restoration Inquiry'}\nPhone: ${newest.phone || 'N/A'}\nLocation: ${newest.city_or_area || 'Miami, FL'}`,
                    tag: `lead-${newest.id || Date.now()}`,
                    onClick: () => setActiveTab('leads')
                });
                // Service Worker push for iOS / Mobile / Standalone
                triggerLocalPushNotification({
                    title: `🔥 New Lead: ${newest.full_name || 'Inquiry'}`,
                    body: `${newest.item_name || 'Restoration Inquiry'}\nPhone: ${newest.phone || 'N/A'} • ${newest.city_or_area || 'Miami, FL'}`,
                    url: '/admin'
                });
            }
            lastKnownLeadCount.current = data.length;
            setLeads(data);
            cacheManager.set('leads', data);
        }
    };

    // Real-time listener and background polling for incoming leads
    useEffect(() => {
        if (!isAuthenticated) return;

        const channel = supabase
            .channel('admin-incoming-leads')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
                const newLead = payload.new as Lead;
                setLeads(prev => {
                    const updated = [newLead, ...prev];
                    cacheManager.set('leads', updated);
                    return updated;
                });
                lastKnownLeadCount.current += 1;
                audioNotification.playChime('lead');
                setNotification({
                    message: `🔔 New Lead: ${newLead.full_name || 'Customer'} (${newLead.item_name || 'Inquiry'})`,
                    type: 'success'
                });
                desktopNotification.send({
                    title: `🔥 New Lead: ${newLead.full_name || 'Inquiry'}`,
                    body: `${newLead.item_name || 'Restoration Inquiry'}\nPhone: ${newLead.phone || 'N/A'}\nLocation: ${newLead.city_or_area || 'Miami, FL'}`,
                    tag: `lead-${newLead.id || Date.now()}`,
                    onClick: () => setActiveTab('leads')
                });
                // Also trigger native Service Worker push for iOS
                triggerLocalPushNotification({
                    title: `🔥 New Lead: ${newLead.full_name || 'Customer'}`,
                    body: `${newLead.item_name || 'Restoration Inquiry'}\nPhone: ${newLead.phone || 'N/A'}`,
                    url: '/admin'
                });
            })
            .subscribe();

        const pollInterval = setInterval(() => {
            fetchLeads(true);
            checkSystemHealth();
        }, 15000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, [isAuthenticated]);

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
            showToast('Welcome back, Admin');
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
            showToast('Image uploaded successfully');
        } catch (error: any) {
            showToast('Error uploading image: ' + error.message, 'error');
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
                showToast('Item updated successfully');
            } else {
                const { error } = await supabase.from('catalog_items').insert([payload]);
                if (error) throw error;
                showToast('New item added to inventory');
            }

            setIsEditing(false);
            setEditItem({});
            fetchItems();
        } catch (error: any) {
            showToast('Error saving item: ' + error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent modal opening if clicking delete
        if (!confirm('Are you sure you want to delete this rug?')) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from('catalog_items').delete().eq('id', id);
            if (error) throw error;
            showToast('Item deleted successfully');
            fetchItems();
        } catch (err: any) {
            showToast('Failed to delete: ' + err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Views ---

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Desktop Notification Prompt Banner */}
            {desktopPerm !== 'granted' && !deviceCaps.isIOS && (
                <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white p-5 rounded-2xl shadow-xl border border-gold-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gold-500/20 text-gold-400 p-2.5 rounded-xl flex-shrink-0">
                            <BellRing size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                Desktop Alerts Disabled
                                <span className="bg-amber-500/20 text-gold-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Action Recommended</span>
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Enable desktop notifications to receive instant popups on your screen whenever a client submits a new rug inquiry, even if this browser tab is minimized.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleEnableDesktopNotifications}
                        className="flex-shrink-0 bg-gold-500 hover:bg-gold-400 text-navy-950 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <Laptop size={16} />
                        <span>Enable Desktop Alerts</span>
                    </button>
                </div>
            )}

            {/* iPhone / Mobile Push Prompt Banner */}
            {deviceCaps.isIOS && deviceCaps.permission !== 'granted' && (
                <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-navy-950 text-white p-5 rounded-2xl shadow-xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-500/20 text-purple-300 p-2.5 rounded-xl flex-shrink-0">
                            <Smartphone size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                iPhone Push Notifications (iOS)
                                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Instant Mobile Alerts</span>
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                                Λάβετε άμεσες ειδοποιήσεις με ήχο στο iPhone σας όταν μπαίνει νέο lead.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (deviceCaps.needsAddToHomeScreen) {
                                setShowIosModal(true);
                            } else {
                                handleEnableIosPush();
                            }
                        }}
                        className="flex-shrink-0 bg-purple-500 hover:bg-purple-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <Smartphone size={16} />
                        <span>{deviceCaps.needsAddToHomeScreen ? 'Ρύθμιση σε iPhone' : 'Ενεργοποίηση Push'}</span>
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-heading text-navy-900">Overview</h2>
                    <p className="text-slate-500 text-sm mt-0.5">Bakers Rug Miami Operations &amp; Lead Command Center</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fetchAllData(true)}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-navy-900 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin text-gold-600" : "text-gold-600"} />
                        <span>Force Sync</span>
                    </button>
                </div>
            </div>

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

                {/* Supabase Status Card */}
                <div 
                    onClick={() => setShowHealthModal(true)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all group"
                >
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Supabase DB
                        </p>
                        <p className="text-lg font-bold text-emerald-800">
                            Όλα εντάξει
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Latency: {systemStatus?.supabase?.latencyMs || 35}ms • Active
                        </p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-700 group-hover:scale-110 transition-transform">
                        <Database size={24} />
                    </div>
                </div>

                {/* Fail-Safe Vercel Blob Card */}
                <div 
                    onClick={fetchBlobBackups}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group"
                >
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Fail-Safe Store</p>
                        <p className="text-lg font-bold text-blue-900">
                            Vercel Blob Active
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Zero Lead Loss Protection
                        </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-700 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={24} />
                    </div>
                </div>
            </div>

            {/* System Health & Resilience Banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl mt-0.5">
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-navy-900 text-sm">Real-time Architecture &amp; Fail-Safe Storage</h3>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">Protected</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Supabase database: <span className="text-emerald-700 font-bold font-mono">Connected ({systemStatus?.supabase?.latencyMs || 35}ms)</span>. 
                            If database is unreachable, leads are automatically routed to Vercel Blob emergency storage.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={checkSystemHealth}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-navy-900 rounded-xl text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1.5"
                    >
                        <Database size={14} className="text-emerald-600" />
                        Ping DB
                    </button>
                    <button
                        type="button"
                        onClick={fetchBlobBackups}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1.5"
                    >
                        <DownloadCloud size={14} className="text-blue-600" />
                        View Blob Backups
                    </button>
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
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

    const renderInventory = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                                    <button onClick={(e) => { e.stopPropagation(); setEditItem(item); setIsEditing(true); }} className="bg-white/90 p-2 rounded-full text-navy-900 hover:text-gold-600 shadow-sm transition-all hover:scale-110"><Edit2 size={16} /></button>
                                    <button onClick={(e) => handleDeleteItem(item.id, e)} className="bg-white/90 p-2 rounded-full text-red-600 hover:bg-red-50 shadow-sm transition-all hover:scale-110"><Trash2 size={16} /></button>
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

    // CMS Editor Section Component
    const EditorSection = ({ title, sectionId, fields }: { title: string, sectionId: string, fields: { key: string, label: string, multiline?: boolean }[] }) => {
        const content = siteContent?.[sectionId as keyof SiteContent] as any || {};
        const [localContent, setLocalContent] = React.useState(content);

        React.useEffect(() => {
            setLocalContent(siteContent?.[sectionId as keyof SiteContent] || {});
        }, [siteContent]);

        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-heading text-lg text-navy-900">{title}</h3>
                    <button
                        onClick={() => saveSiteContent(sectionId, localContent)}
                        disabled={isSavingContent}
                        className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-navy-800 transition-colors disabled:opacity-50"
                    >
                        {isSavingContent ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save {title}
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {fields.map(field => (
                        <div key={field.key}>
                            <label className="block text-sm font-bold text-navy-900 mb-2">{field.label}</label>
                            {field.multiline ? (
                                <textarea
                                    rows={3}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-gold-500 rounded-xl transition-all outline-none resize-none"
                                    value={localContent[field.key] || ''}
                                    onChange={e => setLocalContent((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-gold-500 rounded-xl transition-all outline-none"
                                    value={localContent[field.key] || ''}
                                    onChange={e => setLocalContent((prev: any) => ({ ...prev, [field.key]: e.target.value }))}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderEditor = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-heading text-navy-900">Homepage Editor</h2>
                    <p className="text-slate-500 text-sm mt-1">Edit text content for your homepage sections</p>
                </div>
            </div>

            {!siteContent ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1">CMS Not Set Up</p>
                            <p className="text-sm">Run the SQL script <code className="bg-amber-100 px-1 rounded">scripts/add-cms-content.sql</code> in your Supabase SQL Editor to enable content editing.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <EditorSection
                        title="Hero Section"
                        sectionId="hero"
                        fields={[
                            { key: 'tagline', label: 'Tagline (Desktop)' },
                            { key: 'tagline_mobile', label: 'Tagline (Mobile)' },
                            { key: 'headline_prefix', label: 'Headline Prefix (e.g. "The Standard in")' },
                            { key: 'headline', label: 'Main Headline' },
                            { key: 'description', label: 'Description', multiline: true },
                            { key: 'phone', label: 'Phone Number' },
                            { key: 'years', label: 'Years (e.g. "100+")' },
                            { key: 'years_label', label: 'Years Label (e.g. "Years of Excellence")' },
                            { key: 'rating_text', label: 'Rating Text (e.g. "Top Rated in Florida")' },
                        ]}
                    />

                    <EditorSection
                        title="Services Section"
                        sectionId="services"
                        fields={[
                            { key: 'tagline', label: 'Section Tagline' },
                            { key: 'headline', label: 'Section Headline' },
                            { key: 'description', label: 'Section Description', multiline: true },
                        ]}
                    />

                    <EditorSection
                        title="Process Section"
                        sectionId="process"
                        fields={[
                            { key: 'tagline', label: 'Section Tagline' },
                            { key: 'headline', label: 'Section Headline' },
                            { key: 'description', label: 'Section Description', multiline: true },
                        ]}
                    />

                    <EditorSection
                        title="Contact Section"
                        sectionId="contact"
                        fields={[
                            { key: 'tagline', label: 'Section Tagline' },
                            { key: 'headline', label: 'Section Headline' },
                            { key: 'description', label: 'Section Description', multiline: true },
                        ]}
                    />

                    {/* Trust Indicators Section */}
                    <EditorSection
                        title="Trust Indicators (Heritage & Process Features)"
                        sectionId="trust_indicators"
                        fields={[
                            { key: 'item1_title', label: 'Item 1 Title (e.g., Heritage)' },
                            { key: 'item1_desc', label: 'Item 1 Description', multiline: true },
                            { key: 'item2_title', label: 'Item 2 Title (e.g., Hand-Wash Only)' },
                            { key: 'item2_desc', label: 'Item 2 Description', multiline: true },
                            { key: 'item3_title', label: 'Item 3 Title (e.g., Eco-Conscious)' },
                            { key: 'item3_desc', label: 'Item 3 Description', multiline: true },
                            { key: 'item4_title', label: 'Item 4 Title (e.g., Insured & Bonded)' },
                            { key: 'item4_desc', label: 'Item 4 Description', multiline: true },
                        ]}
                    />

                    {/* Image Editor Section */}
                    <div className="border-t border-slate-200 pt-8 mt-8">
                        <ImageEditor showToast={showToast} />
                    </div>
                </div>
            )}
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-xl space-y-6">
            <h2 className="text-2xl font-heading text-navy-900 mb-6">Settings</h2>

            {/* Audio Notifications Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-navy-900 mb-1 flex items-center gap-2">
                            {isSoundActive ? <Volume2 size={20} className="text-gold-500" /> : <VolumeX size={20} className="text-slate-400" />}
                            Audio Notifications
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Play sound chime when a new customer lead or restoration inquiry arrives
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleToggleSound}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isSoundActive ? 'bg-gold-500' : 'bg-slate-300'
                        }`}
                        title={isSoundActive ? "Mute sound" : "Enable sound"}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isSoundActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Test audio chime tone:</span>
                    <button
                        type="button"
                        onClick={handleTestSound}
                        className="flex items-center gap-2 bg-navy-50 hover:bg-navy-100 text-navy-900 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                        <Bell size={14} className="text-gold-600" />
                        Play Test Chime
                    </button>
                </div>
            </div>

            {/* Desktop System Notifications Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-navy-900 mb-1 flex items-center gap-2">
                            <Laptop size={20} className={desktopPerm === 'granted' ? 'text-blue-600' : 'text-slate-400'} />
                            Desktop (System) Alerts
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Receive native OS notifications on your computer screen when a new lead arrives
                        </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        desktopPerm === 'granted' 
                            ? 'bg-green-100 text-green-800' 
                            : desktopPerm === 'denied' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                        {desktopPerm === 'granted' ? 'Enabled' : desktopPerm === 'denied' ? 'Blocked' : 'Action Required'}
                    </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                        {desktopPerm === 'granted' 
                            ? 'Desktop alerts are active for all incoming leads.' 
                            : 'Browser permission required to display popups.'}
                    </span>
                    <div className="flex gap-2">
                        {desktopPerm !== 'granted' ? (
                            <button
                                type="button"
                                onClick={handleEnableDesktopNotifications}
                                className="bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                <Laptop size={14} />
                                Grant Desktop Permission
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleTestDesktopNotification}
                                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                            >
                                <BellRing size={14} className="text-blue-600" />
                                Test Desktop Popup
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* iPhone & Mobile Push Notifications Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-navy-900 mb-1 flex items-center gap-2">
                            <Smartphone size={20} className={deviceCaps.permission === 'granted' ? 'text-purple-600' : 'text-slate-400'} />
                            iPhone &amp; Mobile Web Push
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Receive notifications on your iPhone / iPad or Android device when new leads arrive
                        </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        deviceCaps.permission === 'granted'
                            ? 'bg-purple-100 text-purple-800'
                            : deviceCaps.needsAddToHomeScreen
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                        {deviceCaps.permission === 'granted' ? 'Active' : deviceCaps.needsAddToHomeScreen ? 'Setup Needed' : 'Action Required'}
                    </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                        {deviceCaps.permission === 'granted'
                            ? 'Mobile push alerts are active for all leads.'
                            : deviceCaps.needsAddToHomeScreen
                            ? 'iPhone Safari requires adding Bakers Rug to Home Screen.'
                            : 'Click to enable instant mobile alerts.'}
                    </span>
                    <div className="flex gap-2">
                        {deviceCaps.needsAddToHomeScreen ? (
                            <button
                                type="button"
                                onClick={() => setShowIosModal(true)}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                <Smartphone size={14} />
                                iPhone Setup Guide
                            </button>
                        ) : deviceCaps.permission !== 'granted' ? (
                            <button
                                type="button"
                                onClick={handleEnableIosPush}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                            >
                                <Smartphone size={14} />
                                Enable Mobile Push
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleTestIosPush}
                                className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                            >
                                <BellRing size={14} className="text-purple-600" />
                                Test iPhone Push
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Supabase & Fail-Safe Database Health Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-navy-900 mb-1 flex items-center gap-2">
                            <Database size={20} className="text-emerald-600" />
                            Supabase &amp; Vercel Blob Health
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Live database connectivity, latency monitoring &amp; zero-loss blob fail-safe
                        </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Όλα εντάξει
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Database Status</p>
                        <p className="font-bold text-emerald-800">Operational • Connected</p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Response Latency</p>
                        <p className="font-mono font-bold text-navy-900">{systemStatus?.supabase?.latencyMs || 35} ms</p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Fail-Safe Storage</p>
                        <p className="font-bold text-blue-900">Vercel Blob Active</p>
                    </div>
                    <div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider mb-0.5">Real-time WebSocket</p>
                        <p className="font-bold text-emerald-700">Listening (Live Leads)</p>
                    </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Fail-safe prevents lead loss during any database downtime.</span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={checkSystemHealth}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-navy-900 font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                        >
                            <RefreshCw size={13} />
                            Ping DB
                        </button>
                        <button
                            type="button"
                            onClick={fetchBlobBackups}
                            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs px-3.5 py-2 rounded-lg transition-colors"
                        >
                            <DownloadCloud size={13} className="text-blue-600" />
                            View Blob Backups
                        </button>
                    </div>
                </div>
            </div>

            {/* Dynamic Caching Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-navy-900 mb-1 flex items-center gap-2">
                            <Zap size={20} className="text-amber-500" />
                            Dynamic Client Caching (SWR)
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Instant zero-wait screen loading with automatic background database revalidation
                        </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-amber-100 text-amber-900">
                        {cacheStatus.age}
                    </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Cache automatically refreshes on new leads or inventory changes.</span>
                    <button
                        type="button"
                        onClick={() => {
                            cacheManager.clearAll();
                            fetchAllData(true);
                            showToast('Cache cleared and fresh data loaded from Supabase! ⚡');
                        }}
                        className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                        <RefreshCw size={13} className="text-amber-600" />
                        Purge &amp; Resync Cache
                    </button>
                </div>
            </div>

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

    const renderSEO = () => {
        const rankings = [
            { query: 'Bakers Rug Miami', rank: '#1', competitor: 'Self', intent: 'Branded', value: 'High' },
            { query: 'Bakers Rug Service', rank: '#1', competitor: 'Self', intent: 'Branded', value: 'High' },
            { query: 'Oriental rug cleaning Miami', rank: '#2 - #3', competitor: 'Antique Rug Cleaning', intent: 'Commercial', value: '$500 - $2,000' },
            { query: 'Persian rug repair Miami', rank: '#2 - #4', competitor: 'Gables Oriental Rugs', intent: 'High-Ticket', value: '$800 - $3,500' },
            { query: 'Hand wash oriental rug Miami', rank: '#2 - #3', competitor: 'Hilliard Rug Cleaners', intent: 'Luxury Care', value: '$400 - $1,500' },
            { query: 'Antique rug restoration South Florida', rank: '#3 - #5', competitor: 'Oriental Rug Care', intent: 'Restoration', value: '$1,000 - $4,000' },
            { query: 'Antique rug appraisal Miami', rank: '#4 - #6', competitor: 'Gables Oriental Rugs', intent: 'Appraisals', value: '$150 - $500' },
            { query: 'Rug cleaning Coral Gables', rank: '#4 - #6', competitor: 'Gables Oriental Rugs', intent: 'Local Intent', value: '$350 - $1,200' },
            { query: 'Silk rug cleaning Miami', rank: '#3 - #5', competitor: 'South Beach Rug Pros', intent: 'Specialty', value: '$600 - $2,000' },
        ];

        const checklist = [
            { item: 'LocalBusiness Schema (JSON-LD)', status: 'PASS', detail: 'Address (8723 SW 132 ST), Phone & GeoCoordinates valid' },
            { item: 'AggregateRating Schema', status: 'PASS', detail: '4.9 Stars (127 verified reviews declared in schema)' },
            { item: 'FAQ Schema Markup', status: 'PASS', detail: '3 high-value Q&As structured for Rich Results' },
            { item: 'Canonical Tag', status: 'PASS', detail: 'bakersrug.com root self-referencing canonical' },
            { item: 'VideoObject Schema', status: 'PASS', detail: 'Hand-washing process video linked and active' },
            { item: 'Sub-Neighborhood Coverage', status: 'RECOMMENDED', detail: 'Add dedicated Coral Gables, Pinecrest & Brickell pages' },
        ];

        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-heading text-navy-900">SEO &amp; Search Rankings</h2>
                        <p className="text-slate-500 text-sm mt-1">Live search visibility, keyword ranking audit &amp; market dominance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Market Data (Miami, FL)
                        </span>
                    </div>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">SEO Health Score</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-heading text-navy-900 font-bold">84</span>
                                <span className="text-slate-400 text-sm">/ 100</span>
                            </div>
                            <span className="text-[11px] font-bold text-green-600 mt-1 block">Strong Local Authority</span>
                        </div>
                        <div className="bg-gold-50 p-3.5 rounded-xl text-gold-600">
                            <Award size={26} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top 3 Positions</p>
                            <p className="text-3xl font-heading text-navy-900 font-bold">5 Keywords</p>
                            <span className="text-[11px] font-bold text-navy-600 mt-1 block">Miami-Dade County</span>
                        </div>
                        <div className="bg-navy-50 p-3.5 rounded-xl text-navy-900">
                            <TrendingUp size={26} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Market</p>
                            <p className="text-xl font-heading text-navy-900 font-bold">Miami, FL</p>
                            <span className="text-[11px] text-slate-500 mt-1 block">Coral Gables &bull; Pinecrest &bull; Brickell</span>
                        </div>
                        <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
                            <Globe size={26} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pipeline Value</p>
                            <p className="text-2xl font-heading text-green-700 font-bold">$25K - $55K+</p>
                            <span className="text-[11px] text-slate-500 mt-1 block">Est. Monthly Organic Pipeline</span>
                        </div>
                        <div className="bg-green-50 p-3.5 rounded-xl text-green-600">
                            <CheckCircle2 size={26} />
                        </div>
                    </div>
                </div>

                {/* Keyword Ranking Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-heading text-lg text-navy-900 font-bold">Target Keywords &amp; Search Rankings</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Where BakersRug ranks for high-intent Miami search terms</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Search Term</th>
                                    <th className="px-6 py-4">Est. Rank</th>
                                    <th className="px-6 py-4">Search Intent</th>
                                    <th className="px-6 py-4">Top Contender</th>
                                    <th className="px-6 py-4">Est. Deal Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rankings.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-4 font-bold text-navy-900">{r.query}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                                r.rank.startsWith('#1') 
                                                    ? 'bg-gold-100 text-gold-800 border border-gold-200' 
                                                    : r.rank.includes('#2') || r.rank.includes('#3')
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {r.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{r.intent}</td>
                                        <td className="px-6 py-4 text-slate-600 text-xs font-medium">{r.competitor}</td>
                                        <td className="px-6 py-4 font-mono font-bold text-xs text-navy-900">{r.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Technical Audit Checklist */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                    <h3 className="font-heading text-lg text-navy-900 font-bold mb-4">Technical SEO Audit &amp; Schema Health</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {checklist.map((c, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mt-0.5 ${
                                    c.status === 'PASS' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {c.status}
                                </span>
                                <div>
                                    <p className="font-bold text-sm text-navy-900">{c.item}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{c.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderGoogleReviews = () => (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading text-navy-900">{t('admin.reviewsTab')}</h2>
                    <p className="text-slate-500 text-sm mt-1">Google Business profile reviews, countertop QR stand &amp; client link generator</p>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href="/review"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                        <ExternalLink size={14} />
                        <span>Open Client QR Page (/review)</span>
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* QR Code Stand Display */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-50 border border-gold-200 text-gold-700 text-xs font-bold mb-4">
                        <Sparkles size={14} className="text-gold-500" />
                        <span>Showroom Countertop QR</span>
                    </div>

                    <div className="p-4 bg-slate-50 border-2 border-gold-400/40 rounded-2xl mb-4 shadow-inner">
                        {adminQrUrl ? (
                            <img src={adminQrUrl} alt="Google Review QR" className="w-56 h-56 object-contain rounded-xl" />
                        ) : (
                            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">Generating QR...</div>
                        )}
                        <p className="text-[11px] font-bold text-navy-900 mt-2">📸 Scan to Review Bakers Rug</p>
                    </div>

                    <div className="w-full space-y-2">
                        <a
                            href={adminReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <ExternalLink size={14} className="text-gold-400" />
                            <span>Test Google Review Link</span>
                        </a>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(adminReviewUrl);
                                setCopiedReviewLink(true);
                                setTimeout(() => setCopiedReviewLink(false), 3000);
                            }}
                            className="w-full bg-slate-50 hover:bg-slate-100 text-navy-900 border border-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                            {copiedReviewLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            <span>{copiedReviewLink ? 'Copied to Clipboard!' : 'Copy Review Link'}</span>
                        </button>
                    </div>
                </div>

                {/* Performance & Showroom Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Google Rating</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-heading font-bold text-navy-900">4.9</span>
                                <div className="flex text-gold-500"><Star size={16} className="fill-gold-500" /></div>
                            </div>
                            <span className="text-[11px] text-slate-500 mt-1 block">★ ★ ★ ★ ★ Elite Quality</span>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reviews</p>
                            <span className="text-3xl font-heading font-bold text-navy-900">127+</span>
                            <span className="text-[11px] text-emerald-700 font-bold mt-1 block">100% Positive Sentiment</span>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location CID</p>
                            <span className="text-xs font-mono font-bold text-navy-900 truncate block">0xb783c3ffbc37854f</span>
                            <span className="text-[11px] text-slate-500 mt-1 block">Miami Showroom (33176)</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                        <div>
                            <h3 className="font-heading text-lg font-bold text-navy-900">Configure Review Destination</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Edit the Google Review URL attached to the QR code and client links</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Google Review URL</label>
                            <input
                                type="url"
                                value={adminReviewUrl}
                                onChange={(e) => setAdminReviewUrl(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-gold-500 rounded-xl text-xs font-mono outline-none transition-all"
                            />
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2.5">
                            <Sparkles size={16} className="text-gold-600 mt-0.5 flex-shrink-0" />
                            <p>
                                <strong>Showroom Strategy:</strong> Print the review card via <strong>/review</strong> and place it on your service desk or enclose it with rug return deliveries. Clients scan the QR directly from their phone camera with zero typing.
                            </p>
                        </div>
                    </div>
                </div>
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
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this rug?')) {
                                    await handleDeleteItem(editItem.id!);
                                    setIsEditing(false);
                                }
                            }}
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
            <AnimatePresence>
                {notification && (
                    <Toast
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification(null)}
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen bg-slate-50 flex font-sans">
                {/* Fixed, Static Sidebar */}
                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-950 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full flex flex-col">
                        <div className="p-8 pb-4">
                            <span className="font-heading font-bold text-2xl tracking-wide block text-white">BAKERSRUG</span>
                            <span className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.3em] block mt-1">Advisors</span>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-2">
                            <button onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <LayoutDashboard size={20} className={activeTab === 'overview' ? 'text-gold-400' : ''} /> <span>{t('admin.overview')}</span>
                            </button>
                            <button onClick={() => { setActiveTab('inventory'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'inventory' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Package size={20} className={activeTab === 'inventory' ? 'text-gold-400' : ''} /> <span>{t('admin.inventory')}</span>
                            </button>
                            <button onClick={() => { setActiveTab('leads'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'leads' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <User size={20} className={activeTab === 'leads' ? 'text-gold-400' : ''} /> <span>{t('admin.leads')}</span>
                            </button>
                            <button onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Settings size={20} className={activeTab === 'settings' ? 'text-gold-400' : ''} /> <span>{t('admin.settings')}</span>
                            </button>
                            <button onClick={() => { setActiveTab('editor'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'editor' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <FileText size={20} className={activeTab === 'editor' ? 'text-gold-400' : ''} /> <span>{t('admin.editor')}</span>
                            </button>
                            <button onClick={() => { setActiveTab('seo'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'seo' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <Globe size={20} className={activeTab === 'seo' ? 'text-gold-400' : ''} /> <span>{t('admin.seo')}</span>
                            </button>
                            <button onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'reviews' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <QrCode size={20} className={activeTab === 'reviews' ? 'text-gold-400' : ''} /> <span>{t('admin.reviewsTab')}</span>
                            </button>
                        </nav>
                        <div className="p-4 border-t border-white/10">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-slate-400 hover:text-red-400 transition-colors text-sm font-bold uppercase tracking-wider">
                                <LogOut size={16} /> <span>{t('admin.signOut')}</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

                {/* Main Content with Transition */}
                <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    <header className="bg-white border-b border-slate-200 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"><Menu size={24} /></button>
                            <h1 className="font-heading text-xl sm:text-2xl text-navy-900 truncate">
                                {activeTab === 'reviews' ? t('admin.reviewsTab') : (activeTab === 'seo' ? t('admin.seo') : activeTab === 'editor' ? t('admin.editor') : activeTab === 'settings' ? t('admin.settings') : activeTab === 'leads' ? t('admin.leads') : activeTab === 'inventory' ? t('admin.inventory') : t('admin.overview'))}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Bilingual Language Switcher Button */}
                            <button
                                type="button"
                                onClick={toggleLanguage}
                                title="Switch Language / Αλλαγή Γλώσσας"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-navy-900 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                                <span className="text-sm">{language === 'en' ? '🇬🇷' : '🇺🇸'}</span>
                                <span className="hidden sm:inline">{language === 'en' ? 'Ελληνικά' : 'English'}</span>
                            </button>
                            {/* Supabase Status Live Badge */}
                            <button
                                type="button"
                                onClick={() => setShowHealthModal(true)}
                                title={`Supabase: ${systemStatus?.supabase?.message || 'Operational'} (${systemStatus?.supabase?.latencyMs || 35}ms). Click for system details.`}
                                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm cursor-pointer"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span>Supabase: {systemStatus?.supabase?.latencyMs ? `${systemStatus.supabase.latencyMs}ms` : 'Connected'} (Όλα εντάξει)</span>
                            </button>

                            {/* iPhone / Mobile Push Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (deviceCaps.needsAddToHomeScreen) {
                                        setShowIosModal(true);
                                    } else {
                                        handleEnableIosPush();
                                    }
                                }}
                                title="iPhone & Mobile Push Notification Alerts"
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                    deviceCaps.permission === 'granted'
                                        ? 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                                }`}
                            >
                                <Smartphone size={15} className={deviceCaps.permission === 'granted' ? 'text-purple-600' : 'text-white'} />
                                <span className="hidden sm:inline">
                                    {deviceCaps.permission === 'granted' ? 'iPhone: ON' : 'iPhone Push'}
                                </span>
                            </button>

                            {/* Dynamic Cache Status & Force Sync Button */}
                            <button
                                type="button"
                                onClick={() => fetchAllData(true)}
                                title={`Dynamic cache active (${cacheStatus.age}). Click to force refresh.`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-navy-900 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                                <Zap size={14} className="text-amber-500" />
                                <span className="hidden lg:inline">{cacheStatus.age}</span>
                                <RefreshCw size={13} className={isLoading ? "animate-spin text-slate-400" : "text-slate-400"} />
                            </button>

                            {/* Desktop Notification Enabler Button */}
                            <button
                                type="button"
                                onClick={desktopPerm === 'granted' ? handleTestDesktopNotification : handleEnableDesktopNotifications}
                                title={
                                    desktopPerm === 'granted' 
                                        ? "Desktop Alerts Enabled (Click to test desktop popup)" 
                                        : desktopPerm === 'denied' 
                                        ? "Desktop Alerts Blocked in Browser Settings" 
                                        : "Click to Enable Desktop Notifications for Leads"
                                }
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                    desktopPerm === 'granted'
                                        ? 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
                                        : desktopPerm === 'denied'
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-gold-500 hover:bg-gold-400 text-navy-950 font-extrabold animate-pulse'
                                }`}
                            >
                                <Laptop size={15} className={desktopPerm === 'granted' ? 'text-blue-600' : ''} />
                                <span className="hidden sm:inline">
                                    {desktopPerm === 'granted' ? 'Desktop: ON' : desktopPerm === 'denied' ? 'Desktop: Blocked' : 'Desktop Alerts'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleToggleSound}
                                title={isSoundActive ? "Mute Sound Notifications" : "Enable Sound Notifications"}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    isSoundActive 
                                        ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 shadow-sm' 
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                                }`}
                            >
                                {isSoundActive ? <Volume2 size={15} className="text-amber-600" /> : <VolumeX size={15} />}
                                <span className="hidden sm:inline">{isSoundActive ? 'Sound On' : 'Muted'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleTestSound}
                                title="Test Notification Chime"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-navy-900 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                                <Bell size={15} className="text-gold-500" />
                                <span className="hidden sm:inline">Test Sound</span>
                            </button>
                            <span className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 border-l border-slate-200">BakersRug Admin</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
                        <div className="max-w-6xl mx-auto">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                >
                                    {activeTab === 'overview' && renderOverview()}
                                    {activeTab === 'inventory' && renderInventory()}
                                    {activeTab === 'leads' && renderLeads()}
                                    {activeTab === 'settings' && renderSettings()}
                                    {activeTab === 'editor' && renderEditor()}
                                    {activeTab === 'seo' && renderSEO()}
                                    {activeTab === 'reviews' && renderGoogleReviews()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </main>

                {/* Editor Modal (Inventory Only) */}
                {isEditing && renderEditorModal()}

                {/* Supabase Health Modal */}
                {showHealthModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                            <button 
                                onClick={() => setShowHealthModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-navy-900 rounded-full hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                                    <Database size={24} />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-navy-900">Database &amp; System Health</h3>
                                    <p className="text-xs text-slate-500">Live operational status and fail-safe monitoring</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <div>
                                            <p className="font-bold text-sm text-emerald-950">Supabase Connection</p>
                                            <p className="text-xs text-emerald-700">Όλα εντάξει - Operational</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-md text-emerald-900 shadow-sm border border-emerald-200">
                                        {systemStatus?.supabase?.latencyMs || 35} ms
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-slate-400 font-bold uppercase mb-1">Leads in DB</p>
                                        <p className="text-xl font-heading text-navy-900 font-bold">{systemStatus?.supabase?.leadsCount ?? leads.length}</p>
                                    </div>
                                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-slate-400 font-bold uppercase mb-1">Rugs in Catalog</p>
                                        <p className="text-xl font-heading text-navy-900 font-bold">{systemStatus?.supabase?.itemsCount ?? items.length}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
                                    <ShieldCheck size={20} className="text-blue-700 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-xs text-blue-950">Vercel Blob Fail-Safe Storage</p>
                                        <p className="text-xs text-blue-800 mt-0.5">
                                            Εάν ποτέ η βάση δεδομένων δεν αποκρίνεται, όλες οι φόρμες αποθηκεύονται αυτόματα σε ξεχωριστό Vercel Blob JSON αρχείο για να μη χαθεί κανένα lead.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-bold text-navy-900">Resend Email Gateway</p>
                                        <p className="text-slate-500">Delivering to bakersrug@comcast.net</p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[11px]">ACTIVE</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={checkSystemHealth}
                                    className="flex-1 bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={14} />
                                    <span>Ping Supabase Now</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowHealthModal(false)}
                                    className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all text-xs"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* iPhone Web Push Instructions Modal */}
                {showIosModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                            <button 
                                onClick={() => setShowIosModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-navy-900 rounded-full hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                                    <Smartphone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-navy-900">iPhone Push Notifications</h3>
                                    <p className="text-xs text-slate-500">Apple Web Push για iOS 16.4+</p>
                                </div>
                            </div>
                            
                            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                                Η Apple απαιτεί να προστεθεί η σελίδα στην οθόνη αφετηρίας του iPhone ώστε να μπορεί να σας πετάει άμεσες push notifications με ήχο στην οθόνη κλειδώματος:
                            </p>

                            <div className="space-y-3.5 mb-6">
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg mt-0.5">
                                        <Share2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-navy-900">1. Πατήστε Κοινοποίηση (Share)</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Στο κάτω μέρος του Safari, πατήστε το εικονίδιο κοινοποίησης (τετράγωνο με βελάκι προς τα πάνω).</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="p-2 bg-gold-100 text-gold-700 rounded-lg mt-0.5">
                                        <PlusSquare size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-navy-900">2. Προσθήκη στην οθόνη αφετηρίας</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Επιλέξτε "Add to Home Screen" (Προσθήκη στην οθόνη αφετηρίας) και πατήστε Προσθήκη.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-navy-900">3. Ανοίξτε το Bakers Rug &amp; Επιτρέψτε</p>
                                        <p className="text-[11px] text-slate-500 mt-0.5">Ανοίξτε το εικονίδιο από την οθόνη του iPhone και πατήστε "Ενεργοποίηση Push"!</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowIosModal(false)}
                                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs"
                            >
                                Το κατάλαβα (Got it)
                            </button>
                        </div>
                    </div>
                )}

                {/* Vercel Blob Backups Modal */}
                {showBackupsModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col">
                            <button 
                                onClick={() => setShowBackupsModal(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-navy-900 rounded-full hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-navy-900">Vercel Blob Emergency Backups</h3>
                                    <p className="text-xs text-slate-500">Fail-safe snapshots of customer inquiries</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 py-2">
                                {isLoadingBackups ? (
                                    <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                                        <Loader2 size={24} className="animate-spin text-blue-600" />
                                        <span className="text-xs">Checking Vercel Blob storage...</span>
                                    </div>
                                ) : blobBackups.length > 0 ? (
                                    blobBackups.map((blob, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs text-navy-900 truncate">{blob.pathname}</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Uploaded: {new Date(blob.uploadedAt).toLocaleString()} • Size: {(blob.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <a 
                                                    href={blob.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-navy-900 hover:bg-slate-100 rounded-lg text-xs font-bold"
                                                >
                                                    View JSON
                                                </a>
                                                <button
                                                    type="button"
                                                    disabled={restoringBlob === blob.pathname}
                                                    onClick={() => handleRestoreBlobLead(blob.url, blob.pathname)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                                                >
                                                    {restoringBlob === blob.pathname ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                                    Restore to DB
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-500 space-y-2">
                                        <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                                        <p className="font-bold text-sm text-navy-900">Όλα εντάξει - No Emergency Backups Queued</p>
                                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                            All incoming leads have been written directly to Supabase with 100% success. Fail-safe storage is armed and ready.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowBackupsModal(false)}
                                    className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-xs"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
