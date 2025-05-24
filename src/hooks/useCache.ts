import { useState, useEffect } from 'react';

interface CacheData<T> {
    data: T;
    etag: string;
    timestamp: number;
}

export const useCache = <T>(key: string, maxAge: number = 604800000) => {
    const [data, setData] = useState<T | null>(null);
    const [etag, setEtag] = useState<string | null>(null);

    useEffect(() => {
        const cached = localStorage.getItem(key);
        if (cached) {
            const parsedCache: CacheData<T> = JSON.parse(cached);
            const now = Date.now();
            if (now - parsedCache.timestamp < maxAge) {
                setData(parsedCache.data);
                setEtag(parsedCache.etag);
            } else {
                localStorage.removeItem(key);
            }
        }
    }, [key, maxAge]);

    const updateCache = (newData: T, newEtag: string) => {
        setData(newData);
        setEtag(newEtag);

        const cacheData: CacheData<T> = {
            data: newData,
            etag: newEtag,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
    };
    return {
        data,
        etag,
        updateCache
    };
}; 