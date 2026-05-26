import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { startTourByRole } from '../utils/tours';
import router from '../router';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
    const { user } = useAuth();
    const [tourActivo, setTourActivo] = useState(false);

    useEffect(() => {
        // Automatically start the tour if the user is logged in
        // and hasn't seen it yet on this browser.
        if (user && user.role) {
            const seenKey = `hasSeenTour_${user.id}`;
            const hasSeen = localStorage.getItem(seenKey);

            if (!hasSeen) {
                // Short delay to ensure DOM layout is complete before starting tour on first load
                setTimeout(() => {
                    startTour(user.role);
                    localStorage.setItem(seenKey, 'true');
                }, 800);
            }
        }
    }, [user]);

    const startTour = (roleId) => {
        setTourActivo(true);
        
        // Navigate to dashboard first because the tour steps require
        // elements that are only present on the main dashboard page.
        router.navigate('/dashboard');

        // Give the router time to render the new view before finding elements
        setTimeout(() => {
            const tour = startTourByRole(roleId);
            
            if (!tour) {
                setTourActivo(false);
            }
        }, 500);
    };

    return (
        <TourContext.Provider value={{ startTour, tourActivo }}>
            {children}
        </TourContext.Provider>
    );
};
