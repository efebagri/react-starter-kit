import { useCallback } from 'react';

export function useMobileNavigation() {
    return useCallback(() => {
        // Remove pointer-events style from the body...
        document.body.style.removeProperty('pointer-events');
    }, []);
}
