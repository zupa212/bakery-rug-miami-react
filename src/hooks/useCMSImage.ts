import { useState, useEffect, useCallback } from 'react';
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

    const fetchImage = useCallback(async () => {
        const { data, error } = await supabase
            .from('site_images')
            .select('image_url, alt_text, updated_at')
            .eq('id', imageId)
            .single();

        if (!error && data) {
            let url = data.image_url || defaultUrl;

            // Cache-busting: append updated_at timestamp to external URLs
            if (data.image_url && data.updated_at && !url.startsWith('/')) {
                const separator = url.includes('?') ? '&' : '?';
                url = `${url}${separator}v=${new Date(data.updated_at).getTime()}`;
            }

            setImage({
                imageUrl: url,
                altText: data.alt_text || defaultAlt
            });
        }
    }, [imageId, defaultUrl, defaultAlt]);

    useEffect(() => {
        // Fetch on mount
        fetchImage();

        // Refetch when tab becomes visible (user switches back from admin)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchImage();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Poll every 15 seconds as a fallback for when Realtime isn't enabled
        const pollInterval = setInterval(fetchImage, 15000);

        // Also try real-time subscription (works if Realtime is enabled in Supabase)
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
                    if (payload.new) {
                        let url = payload.new.image_url || defaultUrl;
                        if (payload.new.image_url && payload.new.updated_at && !url.startsWith('/')) {
                            const separator = url.includes('?') ? '&' : '?';
                            url = `${url}${separator}v=${new Date(payload.new.updated_at).getTime()}`;
                        }
                        setImage({
                            imageUrl: url,
                            altText: payload.new.alt_text || defaultAlt
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, [imageId, fetchImage]);

    return image;
}
