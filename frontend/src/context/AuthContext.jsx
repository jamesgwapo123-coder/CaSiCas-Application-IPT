import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
        return data;
    };

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const login = async ({ username, password }) => {
        // Supabase uses email — convention: username@casicas.local
        const email = username.includes('@') ? username : `${username}@casicas.local`;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const prof = await fetchProfile(data.user.id);
        return { user: { ...data.user, ...prof } };
    };

    const register = async ({ username, email, password, role }) => {
        const userEmail = email || `${username}@casicas.local`;
        const { data, error } = await supabase.auth.signUp({
            email: userEmail,
            password,
            options: { data: { username, role: role || 'buyer' } },
        });
        if (error) throw error;

        // Update profile with role
        if (data.user) {
            await supabase.from('profiles').update({
                username,
                role: role || 'buyer',
            }).eq('id', data.user.id);
            await fetchProfile(data.user.id);
        }
        return { user: data.user };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    // Merge user + profile for compatibility
    const mergedUser = user && profile ? {
        id: user.id,
        username: profile.username,
        email: user.email,
        role: profile.role,
        phone: profile.phone,
        bio: profile.bio,
        latitude: profile.latitude,
        longitude: profile.longitude,
    } : null;

    return (
        <AuthContext.Provider value={{ user: mergedUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
