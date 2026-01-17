"use client";

import { useState, useCallback } from "react";
import { db, ref, get, set, child, update } from "@/lib/firebase";

export interface PlayerProgress {
    dungeonsEntered: Record<string, boolean>;
    dungeonsCleared: Record<string, boolean>;
    questionsSolved: number;
    questionsAttempted: number;
    currentDungeon: string | null;
    totalPlayTime: number;
    highestStreak: number;
    lastLoginAt: number;
}

export const defaultProgress: PlayerProgress = {
    dungeonsEntered: {},
    dungeonsCleared: {},
    questionsSolved: 0,
    questionsAttempted: 0,
    currentDungeon: null,
    totalPlayTime: 0,
    highestStreak: 0,
    lastLoginAt: Date.now(),
};

export function useProgress() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProgress = useCallback(async (userId: string): Promise<PlayerProgress | null> => {
        setLoading(true);
        setError(null);
        try {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users/${userId}/progress`));
            if (snapshot.exists()) {
                return snapshot.val() as PlayerProgress;
            } else {
                return null;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const saveProgress = useCallback(async (userId: string, progress: Partial<PlayerProgress>) => {
        try {
            await update(ref(db, `users/${userId}/progress`), progress);
        } catch (err: any) {
            console.error("Failed to save progress:", err);
            setError(err.message);
        }
    }, []);

    return { loadProgress, saveProgress, loading, error };
}
