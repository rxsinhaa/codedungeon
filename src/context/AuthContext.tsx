"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, logout, auth } from "@/lib/firebase";
import { useProgress, PlayerProgress, defaultProgress } from "@/hooks/useProgress";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    progress: PlayerProgress | null;
    updateProgress: (newProgress: Partial<PlayerProgress>) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    progress: null,
    updateProgress: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [progress, setProgress] = useState<PlayerProgress | null>(null);

    const { loadProgress, saveProgress } = useProgress();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            setUser(currentUser);

            if (currentUser) {
                // Load progress for logged in user
                const userProgress = await loadProgress(currentUser.uid);
                setProgress(userProgress || defaultProgress);

                // Check Admin Status
                if (currentUser.displayName?.toLowerCase() === 'rx') {
                    setIsAdmin(true);
                } else {
                    const { get, db, ref, child } = await import('@/lib/firebase');
                    const profileCache = await get(child(ref(db), `users/${currentUser.uid}/profile/isAdmin`));
                    setIsAdmin(profileCache.val() === true);
                }
            } else {
                setProgress(null);
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [loadProgress]);

    const updateProgressState = async (newProgress: Partial<PlayerProgress>) => {
        if (!user) return;

        // Optimistic update
        setProgress((prev) => prev ? { ...prev, ...newProgress } : null);

        // Save to DB
        await saveProgress(user.uid, newProgress);
    };

    const handleLogout = async () => {
        await logout();
        setUser(null);
        setProgress(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAdmin,
                progress,
                updateProgress: updateProgressState,
                signOut: handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
