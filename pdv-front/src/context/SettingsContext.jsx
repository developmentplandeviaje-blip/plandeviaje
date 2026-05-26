import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getSettings } from '../api/settings';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const data = await getSettings();
            const mapped = {};
            for (const key in data) {
                mapped[key] = data[key].value;
            }
            setSettings(mapped);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refetchSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
