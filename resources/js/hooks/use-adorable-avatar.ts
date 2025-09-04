import { useEffect, useState } from 'react';

export function useAdorableAvatar(name: string, size: number = 450) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!name) return;

        fetch(`/api/avatar?name=${encodeURIComponent(name)}&size=${size}`)
            .then(res => res.json())
            .then(data => setAvatarUrl(data.dataUrl))
            .catch(() => setAvatarUrl(null));
    }, [name, size]);

    return avatarUrl;
}
