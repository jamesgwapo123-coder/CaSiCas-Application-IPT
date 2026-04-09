import { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/profile/`, {
                headers: { 'Authorization': `Token ${token}` },
            });
            if (!res.ok) throw new Error('Token invalid');
            const data = await res.json();
            const merged = {
                id: data.id,
                username: data.username,
                email: data.email,
                role: data.role,
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone: data.phone || '',
                bio: data.bio || '',
                avatar_url: data.avatar_url || '',
                latitude: data.latitude,
                longitude: data.longitude,
                total_sales: data.total_sales || 0,
                total_purchases: data.total_purchases || 0,
                rating: data.rating || 0,
                rating_count: data.rating_count || 0,
                created_at: data.created_at,
            };
            setUser(merged);
            localStorage.setItem('profile', JSON.stringify(merged));
            return merged;
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('profile');
            setUser(null);
            return null;
        }
    };

    useEffect(() => {
        fetchProfile().finally(() => setLoading(false));
    }, []);

    const login = async ({ username, password }) => {
        const res = await fetch(`${API_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || err.non_field_errors?.[0] || 'Invalid username or password.');
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        const merged = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            first_name: data.user.first_name || '',
            last_name: data.user.last_name || '',
            phone: data.user.phone || '',
            bio: data.user.bio || '',
            avatar_url: data.user.avatar_url || '',
            latitude: data.user.latitude,
            longitude: data.user.longitude,
            total_sales: data.user.total_sales || 0,
            total_purchases: data.user.total_purchases || 0,
            rating: data.user.rating || 0,
            rating_count: data.user.rating_count || 0,
            created_at: data.user.created_at,
        };
        setUser(merged);
        localStorage.setItem('profile', JSON.stringify(merged));
        return { user: merged };
    };

    const register = async ({ username, email, password, role, first_name, last_name }) => {
        const res = await fetch(`${API_URL}/api/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email: email || '',
                password,
                password_confirm: password,
                role: role || 'buyer',
                first_name: first_name || '',
                last_name: last_name || '',
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const msg = err.detail || err.username?.[0] || err.email?.[0] || err.password?.[0] || 'Registration failed.';
            throw new Error(msg);
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        const merged = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            first_name: data.user.first_name || '',
            last_name: data.user.last_name || '',
            phone: data.user.phone || '',
            bio: data.user.bio || '',
            avatar_url: data.user.avatar_url || '',
            latitude: data.user.latitude,
            longitude: data.user.longitude,
            total_sales: data.user.total_sales || 0,
            total_purchases: data.user.total_purchases || 0,
            rating: data.user.rating || 0,
            rating_count: data.user.rating_count || 0,
            created_at: data.user.created_at,
        };
        setUser(merged);
        localStorage.setItem('profile', JSON.stringify(merged));
        return { user: merged };
    };

    const logout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await fetch(`${API_URL}/api/auth/logout/`, {
                    method: 'POST',
                    headers: { 'Authorization': `Token ${token}` },
                });
            } catch {
                // Ignore logout errors
            }
        }
        localStorage.removeItem('token');
        localStorage.removeItem('profile');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
