import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface CMSImage {
    imageUrl: string;
    altText: string;
}

export function useCMSImage(imageId: string, defaultUrl: string, defaultAlt: string = '') {
    const [image, setImage] = useState<CMSImage>({
        imageUrl: defaultUrl,
        altText: defaultAlt
    });

    useEffect(() => {
        // Fetch initial image
        const fetchImage = async () => {
            const { data, error } = await supabase
                .from('site_images')
                .select('image_url, alt_text')
                .eq('id', imageId)
                .single();

            if (!error && data) {
                setImage({
                    imageUrl: data.image_url || defaultUrl,
                    altText: data.alt_text || defaultAlt
                });
            }
        };
        fetchImage();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`site_images_${imageId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'site_images',
                    filter: `id=eq.${imageId}`
                },
                (payload: any) => {
                    console.log(`Real-time image update for ${imageId}:`, payload);
                    if (payload.new) {
                        setImage({
                            imageUrl: payload.new.image_url || defaultUrl,
                            altText: payload.new.alt_text || defaultAlt
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [imageId]);

    return image;
}
