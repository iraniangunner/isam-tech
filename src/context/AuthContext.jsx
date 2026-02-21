import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true);
    const hasFetched            = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            // ✅ Try profile
            const response = await api.get('/auth/profile');
            setUser(response.data.user);
        } catch (error) {
            // ✅ Profile failed — try refresh then profile once
            try {
                await api.post('/auth/refresh');
                const response = await api.get('/auth/profile');
                setUser(response.data.user);
            } catch (e) {
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);