import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialiseAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (err) {
                    console.error("Invalid token");
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        initialiseAuth();
    }, []);

    const login = async (token) => {
        localStorage.setItem('token', token);
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (err) {
            console.error("Failed to fetch profile after login", err);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}