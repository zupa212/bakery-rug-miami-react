import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Loader2, Upload, Save, X, RefreshCw } from 'lucide-react';

interface SiteImage {
    id: string;
    image_url: string;
    alt_text: string;
    updated_at: string;
}

interface ImageCardProps {
    image: SiteImage;
    label: string;
    onUpload: (id: string, file: File) => Promise<void>;
    onSave: (id: string, altText: string) => Promise<void>;
    onReset: (id: string) => Promise<void>;
    isUploading: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, label, onUpload, onSave, onReset, isUploading }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [altText, setAltText] = useState(image.alt_text || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    useEffect(() => {
        setAltText(image.alt_text || '');
    }, [image.alt_text]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setPendingFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (pendingFile) {
                await onUpload(image.id, pendingFile);
                setPendingFile(null);
                setPreviewUrl(null);
            }
            await onSave(image.id, altText);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset this image to default?')) {
            setIsResetting(true);
            try {
                await onReset(image.id);
            } finally {
                setIsResetting(false);
            }
        }
    };

    const handleCancelPreview = () => {
        setPendingFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const displayUrl = previewUrl || image.image_url;
    const hasChanges = pendingFile !== null || altText !== (image.alt_text || '');

    return (
        <div
            className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isDragging ? 'border-gold-500 bg-gold-50 shadow-lg' : hasChanges ? 'border-gold-400 shadow-md' : 'border-slate-200 hover:border-slate-300'
                }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            {/* Image Preview */}
            <div className="aspect-video bg-slate-100 relative overflow-hidden group">
                {displayUrl ? (
                    <img
                        src={displayUrl}
                        alt={altText || label}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                        <Camera size={48} />
                        <span className="text-xs font-medium">No image</span>
                    </div>
                )}

                {/* Reset Button (Top Right) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleReset}
                        disabled={isResetting || isUploading || isSaving}
                        className="p-2 bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-lg shadow-sm border border-slate-200 transition-colors"
                        title="Reset to default"
                    >
                        {isResetting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    </button>
                </div>

                {/* Pending badge */}
                {pendingFile && (
                    <div className="absolute top-2 left-2 flex items-center gap-2">
                        <span className="bg-gold-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                            New image — save to apply
                        </span>
                        <button
                            onClick={handleCancelPreview}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

                {/* Upload Overlay */}
                {(isUploading || isSaving || isResetting) && (
                    <div className="absolute inset-0 bg-navy-900/80 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}

                {/* Drag overlay */}
                {isDragging && (
                    <div className="absolute inset-0 bg-gold-500/20 flex items-center justify-center border-2 border-dashed border-gold-500 m-2 rounded-lg">
                        <span className="text-gold-700 font-bold text-sm">Drop image here</span>
                    </div>
                )}
            </div>

            {/* Card Footer */}
            <div className="p-4 space-y-3">
                <h4 className="font-bold text-navy-900">{label}</h4>

                {/* Alt Text Input */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Alt Text (SEO)</label>
                    <input
                        type="text"
                        value={altText}
                        onChange={e => setAltText(e.target.value)}
                        placeholder="Describe this image..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-gold-500 outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                        <Upload size={16} />
                        <span className="text-sm font-medium">Choose Image</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading || isSaving || isResetting}
                        />
                    </label>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isUploading || isSaving || isResetting}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${hasChanges
                            ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ImageEditorProps {
    showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function ImageEditor({ showToast }: ImageEditorProps) {
    const [images, setImages] = useState<SiteImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    const imageConfigs = [
        { id: 'logo', label: 'Site Logo', defaultUrl: '/photos/logofront.png', group: 'branding' },
        { id: 'hero_bg', label: 'Hero Background', defaultUrl: '/photos/DSC06477.webp', group: 'hero' },
        // Before/After
        { id: 'before_after_before', label: 'Before Image', defaultUrl: '/photos/Gemini_Generated_Image_hy0kcbhy0kcbhy0k.webp', group: 'before_after' },
        { id: 'before_after_after', label: 'After Image', defaultUrl: '/photos/DSC06460.webp', group: 'before_after' },
        // Services
        { id: 'service_1', label: 'Service: Rug Washing', defaultUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800', group: 'services' },
        { id: 'service_2', label: 'Service: Pad Sales', defaultUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', group: 'services' },
        { id: 'service_3', label: 'Service: Rug Repair', defaultUrl: 'https://images.unsplash.com/photo-1584286595398-a59511e0649f?auto=format&fit=crop&q=80&w=800', group: 'services' },
        // Carousel images
        { id: 'carousel_1', label: 'Carousel 1', defaultUrl: '/photos/DSC06446.webp', group: 'carousel' },
        { id: 'carousel_2', label: 'Carousel 2', defaultUrl: '/photos/DSC06459.webp', group: 'carousel' },
        { id: 'carousel_3', label: 'Carousel 3', defaultUrl: '/photos/DSC06460.webp', group: 'carousel' },
        { id: 'carousel_4', label: 'Carousel 4', defaultUrl: '/photos/DSC06469-Edit.webp', group: 'carousel' },
        { id: 'carousel_5', label: 'Carousel 5', defaultUrl: '/photos/DSC06472-Edit.webp', group: 'carousel' },
        { id: 'carousel_6', label: 'Carousel 6', defaultUrl: '/photos/DSC06474.webp', group: 'carousel' },
        { id: 'carousel_7', label: 'Carousel 7', defaultUrl: '/photos/DSC06477.webp', group: 'carousel' },
        { id: 'carousel_8', label: 'Carousel 8', defaultUrl: '/photos/DSC06479.webp', group: 'carousel' },
        { id: 'carousel_9', label: 'Carousel 9', defaultUrl: '/photos/DSC06487.webp', group: 'carousel' },
        { id: 'carousel_10', label: 'Carousel 10', defaultUrl: '/photos/DSC06505.webp', group: 'carousel' },
        { id: 'carousel_11', label: 'Carousel 11', defaultUrl: '/photos/DSC06508.webp', group: 'carousel' },
        { id: 'carousel_12', label: 'Carousel 12', defaultUrl: '/photos/DSC06515.webp', group: 'carousel' },
        { id: 'carousel_13', label: 'Carousel 13', defaultUrl: '/photos/DSC06520.webp', group: 'carousel' },
        { id: 'carousel_14', label: 'Carousel 14', defaultUrl: '/photos/DSC06522.webp', group: 'carousel' },
    ];

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('site_images')
            .select('*');

        if (error) {
            console.error('Error fetching images:', error);
            const defaultImages: SiteImage[] = imageConfigs.map(config => ({
                id: config.id,
                image_url: config.defaultUrl,
                alt_text: config.label,
                updated_at: new Date().toISOString()
            }));
            setImages(defaultImages);
        } else {
            const allImages: SiteImage[] = imageConfigs.map(config => {
                const existing = data?.find(img => img.id === config.id);
                return existing || {
                    id: config.id,
                    image_url: config.defaultUrl,
                    alt_text: config.label,
                    updated_at: new Date().toISOString()
                };
            });
            setImages(allImages);
        }
        setIsLoading(false);
    };

    const handleImageUpload = async (imageId: string, file: File) => {
        setUploadingId(imageId);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cms_${imageId}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('rugs')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('rugs')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;

            const { error: dbError } = await supabase
                .from('site_images')
                .upsert({
                    id: imageId,
                    image_url: publicUrl,
                    alt_text: imageConfigs.find(c => c.id === imageId)?.label || '',
                    updated_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            showToast('Image uploaded successfully!');
            fetchImages();
        } catch (error: any) {
            console.error('Upload error:', error);
            showToast('Error uploading image: ' + error.message, 'error');
        } finally {
            setUploadingId(null);
        }
    };

    const handleSaveAltText = async (imageId: string, altText: string) => {
        try {
            const { error } = await supabase
                .from('site_images')
                .upsert({
                    id: imageId,
                    image_url: images.find(i => i.id === imageId)?.image_url || '',
                    alt_text: altText,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            showToast('Saved successfully!');
            fetchImages();
        } catch (error: any) {
            showToast('Error saving: ' + error.message, 'error');
        }
    };

    const handleReset = async (imageId: string) => {
        try {
            // Setting image_url to empty string will trigger fallback to default in useCMSImage
            const { error } = await supabase
                .from('site_images')
                .upsert({
                    id: imageId,
                    image_url: '', // This will act as "reset to default"
                    alt_text: '',
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            showToast('Image reset to default!');
            fetchImages();
        } catch (error: any) {
            showToast('Error resetting: ' + error.message, 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            </div>
        );
    }

    const renderGroup = (groupId: string, title: string, columns: string = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3') => (
        <div>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h4>
            <div className={`grid ${columns} gap-6`}>
                {images.filter(img => imageConfigs.find(c => c.id === img.id)?.group === groupId).map(image => (
                    <ImageCard
                        key={image.id}
                        image={image}
                        label={imageConfigs.find(c => c.id === image.id)?.label || image.id}
                        onUpload={handleImageUpload}
                        onSave={handleSaveAltText}
                        onReset={handleReset}
                        isUploading={uploadingId === image.id}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Site Images</h3>
                <p className="text-slate-500">
                    Upload or replace images across the website. Choose an image, edit the alt text for SEO, then click <strong>Save</strong>.
                    <br />
                    Use the <RefreshCw className="inline w-4 h-4 mx-1" /> button to reset an image to its original default.
                </p>
            </div>

            {renderGroup('branding', 'Branding')}
            {renderGroup('hero', 'Hero Section')}
            {renderGroup('before_after', 'Before & After Slider')}
            {renderGroup('services', 'Service Cards')}
            {renderGroup('carousel', 'Image Carousel / Marquee', 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4')}
        </div>
    );
}
