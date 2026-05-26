import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                await fetchUser();
            } else {
                setLoading(false);
            }
        };
        initAuth();
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch (error) {
            console.error('Sesión inválida:', error);
            handleLogoutState();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { access_token, user: userData } = response.data;

            localStorage.setItem('token', access_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            setToken(access_token);
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            console.error('Error login:', error.response?.data);
            return {
                success: false,
                message: error.response?.data?.message || 'Error de servidor.'
            };
        }
    };

    const handleLogoutState = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            handleLogoutState();
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);