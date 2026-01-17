"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, logout, auth } from "@/lib/firebase";
import { useProgress, PlayerProgress, defaultProgress } from "@/hooks/useProgress";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    progress: PlayerProgress | null;
    updateProgress: (newProgress: Partial<PlayerProgress>) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    progress: null,
    updateProgress: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<PlayerProgress | null>(null);

    const { loadProgress, saveProgress } = useProgress();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
            setUser(currentUser);

            if (currentUser) {
                // Load progress for logged in user
                const userProgress = await loadProgress(currentUser.uid);
                setProgress(userProgress || defaultProgress);
            } else {
                setProgress(null);
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
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                progress,
                updateProgress: updateProgressState,
                signOut: handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
