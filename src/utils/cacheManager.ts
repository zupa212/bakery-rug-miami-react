// Dynamic Caching Manager (Stale-While-Revalidate & Instant Hydration)

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // in milliseconds
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

class CacheManager {
    private memoryCache = new Map<string, CacheEntry<any>>();

    /**
     * Get cached data synchronously for instant zero-latency UI rendering
     */
    get<T>(key: string): { data: T | null; isStale: boolean; ageSeconds: number } {
        let entry = this.memoryCache.get(key);

        if (!entry && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(`rug_cache_${key}`);
                if (stored) {
                    entry = JSON.parse(stored);
                    if (entry) {
                        this.memoryCache.set(key, entry);
                    }
                }
            } catch (e) {
                console.warn('[Cache] Error reading from localStorage:', e);
            }
        }

        if (!entry) {
            return { data: null, isStale: true, ageSeconds: 0 };
        }

        const now = Date.now();
        const age = now - entry.timestamp;
        const isStale = age > entry.ttl;

        return {
            data: entry.data as T,
            isStale,
            ageSeconds: Math.floor(age / 1000)
        };
    }

    /**
     * Store data in cache and persist to localStorage
     */
    set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl
        };

        this.memoryCache.set(key, entry);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(`rug_cache_${key}`, JSON.stringify(entry));
            } catch (e) {
                console.warn('[Cache] Error saving to localStorage:', e);
            }
        }
    }

    /**
     * Invalidate a single key
     */
    invalidate(key: string): void {
        this.memoryCache.delete(key);
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(`rug_cache_${key}`);
            } catch (e) {
                // ignore
            }
        }
    }

    /**
     * Clear all cached application data
     */
    clearAll(): void {
        this.memoryCache.clear();
        if (typeof window !== 'undefined') {
            try {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('rug_cache_')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
            } catch (e) {
                // ignore
            }
        }
    }

    /**
     * Formats the age of the cache nicely for the user
     */
    formatAge(ageSeconds: number): string {
        if (ageSeconds < 5) return 'Just now';
        if (ageSeconds < 60) return `${ageSeconds}s ago`;
        const mins = Math.floor(ageSeconds / 60);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        return `${hours}h ago`;
    }
}

export const cacheManager = new CacheManager();
