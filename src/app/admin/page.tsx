"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { ref, get, child, remove, set } from "firebase/database";
import { Trash2, Shield, ShieldOff, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type UserProfile = {
    uid: string;
    username: string;
    email: string;
    createdAt: number;
    isAdmin?: boolean;
};

export default function AdminPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Basic client-side protection so public can't just type /admin
        const unlocked = sessionStorage.getItem('adminPortalUnlocked');
        if (unlocked === 'true') {
            setIsAuthorized(true);
            fetchUsers();
        } else {
            router.push('/');
        }
    }, [router]);

    const fetchUsers = async () => {
        try {
            const snapshot = await get(child(ref(db), "users"));
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const loadedUsers: UserProfile[] = [];
                Object.keys(usersData).forEach((uid) => {
                    const profile = usersData[uid].profile;
                    if (profile) {
                        loadedUsers.push({ uid, ...profile });
                    }
                });
                setUsers(loadedUsers);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const toggleAdmin = async (targetUid: string, currentStatus: boolean, username: string) => {
        if (username.toLowerCase() === 'rx') {
            alert("Cannot change rx's privileges.");
            return;
        }
        try {
            await set(ref(db, `users/${targetUid}/profile/isAdmin`), !currentStatus);
            fetchUsers();
        } catch (e) {
            console.error("Error updating admin status", e);
        }
    };

    const deleteUser = async (targetUid: string) => {
        if (!confirm("Are you sure you want to completely eradicate this user's data from the database? They will lose all progress and profile data.")) return;

        try {
            await remove(ref(db, `users/${targetUid}`));
            fetchUsers();
        } catch (e) {
            console.error("Error deleting user", e);
        }
    };

    const handleExit = () => {
        // Optional: lock the portal when they leave
        sessionStorage.removeItem('adminPortalUnlocked');
        router.push("/");
    };

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center font-retro text-white">
                <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
                <p>Verifying clearance...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 font-retro text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b-2 border-stone-800 pb-4">
                    <h1 className="text-4xl font-pixel text-red-500">ADMIN CONTROL PANEL</h1>
                    <Button onClick={handleExit} className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-pixel border-2 border-stone-700 inline-flex items-center">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Lock & Return
                    </Button>
                </div>

                <div className="bg-stone-900 border-2 border-stone-800 rounded-lg overflow-hidden flex flex-col items-center justify-center min-h-[50vh]">
                    {/* Using grid layout to make it robust across viewport sizes */}
                    <div className="w-full h-full overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-stone-950 font-pixel text-sm text-stone-400 border-b-2 border-stone-800">
                                <tr>
                                    <th className="p-4 w-1/4">Wizard Name</th>
                                    <th className="p-4 w-1/4">Account ID</th>
                                    <th className="p-4 w-1/4">Role Status</th>
                                    <th className="p-4 w-1/4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.uid} className="border-b border-stone-800 hover:bg-stone-800/50 transition-colors">
                                        <td className="p-4 font-bold text-lg">
                                            <div className="flex flex-col items-start justify-center">
                                                <span>{u.username}</span>
                                                {u.username.toLowerCase() === 'rx' && <span className="mt-1 text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded font-pixel border border-red-700">CREATOR</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-stone-500">{u.uid}</td>
                                        <td className="p-4">
                                            {u.isAdmin || u.username.toLowerCase() === 'rx' ? (
                                                <span className="text-green-400 font-pixel text-xs inline-flex items-center gap-1 border border-green-800 bg-green-900/30 px-2 py-1 rounded">
                                                    <Shield className="w-3 h-3" /> ADMIN
                                                </span>
                                            ) : (
                                                <span className="text-stone-500 font-pixel text-xs inline-flex items-center gap-1 border border-stone-800 bg-stone-900 px-2 py-1 rounded">
                                                    PLAYER
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={u.isAdmin ? "outline" : "default"}
                                                    className={`font-pixel text-xs border-2 ${u.isAdmin ? 'border-red-800 text-red-400 hover:bg-red-900/30' : 'bg-green-700 hover:bg-green-600 border-green-500 text-white'}`}
                                                    onClick={() => toggleAdmin(u.uid, !!u.isAdmin, u.username)}
                                                    disabled={u.username.toLowerCase() === 'rx'}
                                                >
                                                    {u.isAdmin ? <ShieldOff className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
                                                    {u.isAdmin ? "REVOKE" : "MAKE ADMIN"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="font-pixel text-xs border-2 border-red-500 bg-red-800 hover:bg-red-700"
                                                    onClick={() => deleteUser(u.uid)}
                                                    disabled={u.username.toLowerCase() === 'rx'}
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    WIPE
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-stone-500 font-pixel text-lg">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-50" />
                                            Loading archives...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
