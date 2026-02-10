import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Loader2, Upload } from 'lucide-react';

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
    isUploading: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, label, onUpload, isUploading }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            onUpload(image.id, file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(image.id, file);
        }
    };

    return (
        <div
            className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isDragging ? 'border-gold-500 bg-gold-50' : 'border-slate-200 hover:border-slate-300'
                }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            {/* Image Preview */}
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {image.image_url ? (
                    <img
                        src={image.image_url}
                        alt={image.alt_text || label}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Camera size={48} />
                    </div>
                )}

                {/* Upload Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 bg-navy-900/80 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Card Footer */}
            <div className="p-4">
                <h4 className="font-bold text-navy-900 mb-1">{label}</h4>
                <p className="text-xs text-slate-500 mb-3 truncate">{image.image_url || 'No image'}</p>

                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                    <Upload size={16} />
                    <span className="text-sm font-medium">Upload New</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>
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
        { id: 'logo', label: 'Site Logo' },
        { id: 'hero_bg', label: 'Hero Background' },
        { id: 'service_1', label: 'Service: Rug Washing' },
        { id: 'service_2', label: 'Service: Pad Sales' },
        { id: 'service_3', label: 'Service: Rug Repair' },
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
            showToast('Error loading images', 'error');
        } else {
            // Ensure all expected images exist
            const allImages: SiteImage[] = imageConfigs.map(config => {
                const existing = data?.find(img => img.id === config.id);
                return existing || {
                    id: config.id,
                    image_url: '',
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
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `cms_${imageId}_${Date.now()}.${fileExt}`;

            // Upload to Supabase storage
            const { error: uploadError } = await supabase.storage
                .from('rugs')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('rugs')
                .getPublicUrl(fileName);

            const publicUrl = urlData.publicUrl;

            // Update database
            const { error: dbError } = await supabase
                .from('site_images')
                .upsert({
                    id: imageId,
                    image_url: publicUrl,
                    alt_text: imageConfigs.find(c => c.id === imageId)?.label || '',
                    updated_at: new Date().toISOString()
                });

            if (dbError) throw dbError;

            showToast('Image updated successfully!');
            fetchImages();

        } catch (error: any) {
            console.error('Upload error:', error);
            showToast('Error uploading image: ' + error.message, 'error');
        } finally {
            setUploadingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Site Images</h3>
                <p className="text-slate-500">
                    Upload or replace images used across the website. Changes are reflected instantly.
                </p>
            </div>

            {/* Logo Section */}
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Branding</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.filter(img => img.id === 'logo').map(image => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            label={imageConfigs.find(c => c.id === image.id)?.label || image.id}
                            onUpload={handleImageUpload}
                            isUploading={uploadingId === image.id}
                        />
                    ))}
                </div>
            </div>

            {/* Hero Section */}
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Hero Section</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.filter(img => img.id === 'hero_bg').map(image => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            label={imageConfigs.find(c => c.id === image.id)?.label || image.id}
                            onUpload={handleImageUpload}
                            isUploading={uploadingId === image.id}
                        />
                    ))}
                </div>
            </div>

            {/* Services Section */}
            <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Services</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.filter(img => img.id.startsWith('service_')).map(image => (
                        <ImageCard
                            key={image.id}
                            image={image}
                            label={imageConfigs.find(c => c.id === image.id)?.label || image.id}
                            onUpload={handleImageUpload}
                            isUploading={uploadingId === image.id}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
