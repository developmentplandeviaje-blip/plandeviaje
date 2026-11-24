import { useEffect } from 'react';

const BASE_URL = 'https://plandeviaje.com.ve';

/**
 * Upserts a single <meta>/<link> element (never duplicates) and returns a
 * function that restores the previous state.
 */
const upsert = (tag, attr, key, valueAttr, value) => {
    let el = document.head.querySelector(`${tag}[${attr}="${key}"]`);
    const created = !el;
    const previous = el ? el.getAttribute(valueAttr) : null;
    if (!el) {
        el = document.createElement(tag);
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute(valueAttr, value);
    return () => {
        if (created) el.remove();
        else if (previous !== null) el.setAttribute(valueAttr, previous);
    };
};

/**
 * Sets title, meta description, canonical and Open Graph tags for a page.
 * Texts are applied exactly as provided (no suffix appended).
 *
 * @param {object} seo
 * @param {string} seo.title        <title>
 * @param {string} seo.description  meta description
 * @param {string} seo.path         canonical path, e.g. "/about" ("/" for home)
 * @param {string} seo.ogTitle
 * @param {string} seo.ogDescription
 */
const useSeo = ({ title, description, path, ogTitle, ogDescription }) => {
    useEffect(() => {
        const url = `${BASE_URL}${path}`;
        const previousTitle = document.title;
        document.title = title;

        const restores = [
            upsert('meta', 'name', 'description', 'content', description),
            upsert('link', 'rel', 'canonical', 'href', url),
            upsert('meta', 'property', 'og:type', 'content', 'website'),
            upsert('meta', 'property', 'og:site_name', 'content', 'Plan de Viaje'),
            upsert('meta', 'property', 'og:title', 'content', ogTitle),
            upsert('meta', 'property', 'og:description', 'content', ogDescription),
            upsert('meta', 'property', 'og:url', 'content', url),
            upsert('meta', 'property', 'og:locale', 'content', 'es_VE'),
        ];

        return () => {
            document.title = previousTitle;
            restores.forEach((restore) => restore());
        };
    }, [title, description, path, ogTitle, ogDescription]);
};

export default useSeo;
