import { getRawBaseURL } from '../api/axios';

export const getImageUrl = (path) => {
    if (!path) return '';
    // If it's already a full HTTP URL or Data URI, return it as is
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    
    const baseUrl = getRawBaseURL();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // If the path already includes /storage, just append to baseUrl
    if (cleanPath.startsWith('/storage/')) {
        return `${baseUrl}${cleanPath}`;
    }
    
    return `${baseUrl}/storage${cleanPath}`;
};
