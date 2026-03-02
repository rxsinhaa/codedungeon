import { db } from './firebase';
import { ref, push, onValue, set, remove, runTransaction, get, child } from 'firebase/database';

export interface QueueEntry {
    uid: string;
    username: string;
    joinedAt: number;
    roomId?: string; // If set, the player has been matched
}

export const MATCH_TIMEOUT = 60000; // 60 seconds
export const MAX_PARTY_SIZE = 4;

/**
 * Joins the public matchmaking queue.
 */
export const joinPublicQueue = async (user: { uid: string; displayName: string | null }) => {
    const queueRef = ref(db, `matchmaking/queue/${user.uid}`);
    const entry: QueueEntry = {
        uid: user.uid,
        username: user.displayName || 'Anonymous',
        joinedAt: Date.now(),
    };

    // We use set instead of push to ensure one entry per UID, preventing duplicates easier
    await set(queueRef, entry);
    return entry;
};

/**
 * Removes the user from the queue (cancel search).
 */
export const leavePublicQueue = async (uid: string) => {
    const queueRef = ref(db, `matchmaking/queue/${uid}`);
    await remove(queueRef);
};

/**
 * Listens to the specific user's queue entry to see if a roomId has been assigned.
 */
export const subscribeToMatchStatus = (uid: string, onMatch: (roomId: string) => void) => {
    const entryRef = ref(db, `matchmaking/queue/${uid}`);
    return onValue(entryRef, (snapshot) => {
        const data = snapshot.val() as QueueEntry | null;
        if (data && data.roomId) {
            onMatch(data.roomId);
        }
    });
};

/**
 * Listens to the entire queue to update UI counts and attempt matchmaking.
 * This should be run by clients in the queue.
 */
export const subscribeToQueue = (onUpdate: (count: number, entries: QueueEntry[]) => void) => {
    const queueRef = ref(db, 'matchmaking/queue');
    return onValue(queueRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            onUpdate(0, []);
            return;
        }
        const entries = Object.values(data) as QueueEntry[];
        // Sort by joinedAr (First In, First Out)
        entries.sort((a, b) => a.joinedAt - b.joinedAt);
        onUpdate(entries.length, entries);
    });
};

/**
 * Attempts to form a match transactionally.
 * Should be called when client detects potential match conditions.
 */
export const tryMatchmaking = async (force: boolean = false) => {
    const queueRef = ref(db, 'matchmaking/queue');
    const newRoomId = `room-public-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let matchedCount = 0;

    const result = await runTransaction(queueRef, (currentQueue) => {
        if (!currentQueue) return; // Nothing to do

        const entries = Object.values(currentQueue) as QueueEntry[];
        entries.sort((a, b) => a.joinedAt - b.joinedAt);

        // Filter valid waiting players
        const validEntries = entries.filter(e => !e.roomId);

        if (validEntries.length === 0) return;

        let matchedGroup: QueueEntry[] = [];

        // Condition 1: Full Party
        if (validEntries.length >= MAX_PARTY_SIZE) {
            matchedGroup = validEntries.slice(0, MAX_PARTY_SIZE);
        }
        // Condition 2: Timeout / Force (Partial Match)
        else if (force) {
            matchedGroup = validEntries; // Take everyone
        }

        if (matchedGroup.length > 0) {
            // Assign room ID to these players
            matchedGroup.forEach(p => {
                if (currentQueue[p.uid]) {
                    currentQueue[p.uid].roomId = newRoomId;
                }
            });
            matchedCount = matchedGroup.length;
            return currentQueue;
        }

        return; // Abort if no match
    });

    // Removing bot seeding to ensure only real players are shown in the lobby
    // if (result.committed && matchedCount > 0 && matchedCount < MAX_PARTY_SIZE) {
    //  ...
    // }
};
