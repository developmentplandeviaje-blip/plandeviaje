import { useEffect } from 'react';

const SITE_NAME = 'Plan de Viaje';

/**
 * Sets the document title for the current page.
 * @param {string} pageTitle — e.g. "Contacto", "Dashboard"
 */
const useDocumentTitle = (pageTitle) => {
    useEffect(() => {
        document.title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME;
        return () => { document.title = SITE_NAME; };
    }, [pageTitle]);
};

export default useDocumentTitle;
