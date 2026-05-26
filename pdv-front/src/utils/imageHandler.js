export const getImageUrl = (path) => {
    if (!path) return '';
    // If it's already a full HTTP URL or Data URI, return it as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If the path already includes /storage, just append to baseUrl
    if (cleanPath.startsWith('/storage/')) {
        return `${baseUrl}${cleanPath}`;
    }
    
    return `${baseUrl}/storage${cleanPath}`;
};
