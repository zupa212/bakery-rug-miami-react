
export interface CatalogItem {
    id: string; // uuid
    name: string;
    slug: string;
    serial_number: string | null;
    short_description: string | null;
    full_description: string | null;
    category: string | null;
    images: string[];
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface Lead {
    id: string; // uuid
    full_name: string;
    email: string;
    phone: string | null;
    city_or_area: string | null;
    message: string | null;
    item_name: string | null;
    item_slug: string | null;
    source_page: string | null;
    status: 'new' | 'contacted' | 'closed';
    created_at: string;
}
