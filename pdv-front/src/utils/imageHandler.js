import { getRawBaseURL } from '../api/axios';

export const getImageUrl = (path) => {
    if (!path) return '';
    
    const baseUrl = getRawBaseURL();

    // If it's a localhost URL from development but we are not on localhost,
    // we should try to use the current baseUrl instead to avoid Mixed Content
    if (typeof path === 'string' && path.startsWith('http://localhost:8000')) {
        return path.replace('http://localhost:8000', baseUrl);
    }

    // If it's already a full HTTP URL or Data URI, return it as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If the path already includes /storage, just append to baseUrl
    if (cleanPath.startsWith('/storage/')) {
        return `${baseUrl}${cleanPath}`;
    }
    
    return `${baseUrl}/storage${cleanPath}`;
};
