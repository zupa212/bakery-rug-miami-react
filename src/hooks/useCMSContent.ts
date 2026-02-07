import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCMSContent<T>(sectionId: string, defaultContent: T) {
    const [content, setContent] = useState<T>(defaultContent);

    useEffect(() => {
        // Fetch initial content
        const fetchContent = async () => {
            const { data, error } = await supabase
                .from('site_content')
                .select('content')
                .eq('id', sectionId)
                .single();

            if (!error && data?.content) {
                // Merge with default to ensure no missing keys
                setContent({ ...defaultContent, ...data.content });
            }
        };
        fetchContent();

        // Subscribe to real-time changes
        const channel = supabase
            .channel(`site_content_${sectionId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'site_content',
                    filter: `id=eq.${sectionId}`
                },
                (payload: any) => {
                    console.log(`Real-time update for ${sectionId}:`, payload);
                    if (payload.new?.content) {
                        setContent({ ...defaultContent, ...payload.new.content });
                    }
                }
            )
            .subscribe();

        // Cleanup subscription on unmount
        return () => {
            supabase.removeChannel(channel);
        };
    }, [sectionId]); // Only re-run if sectionId changes (which it shouldn't for a component)

    return content;
}
