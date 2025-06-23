"use client"

import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/AuthStore";
import { useUsers } from "@/utils/apiFonctions";
import { useRouter } from "next/navigation";
import UserCard from "@/components/UserCard";

export default function AdminPage() {
    const { user, token, isLoading: authLoading } = useAuthStore();
    const router = useRouter();
    const { data: users, error, isLoading, getUsers } = useUsers();
    const hasFetchedRef = useRef(false);



    const fetchUsers = useCallback(async () => {
        if (authLoading || !token) {
            return;
        }
        if (!user?.is_admin) {
            router.push('/');
            return;
        }
        try {
            console.log('🔄 Récupération des utilisateurs...');
            getUsers(token);
            hasFetchedRef.current = true;
        } catch (error) {
            console.error(error);
        }
    }, [authLoading, token, user?.is_admin, router, getUsers]);

    useEffect(() => {
        if (!hasFetchedRef.current) {
            fetchUsers();
        }
    }, [fetchUsers]);

    useEffect(() => {
        if (!token) {
            hasFetchedRef.current = false;
        }
    }, [token]);

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#020c1b] flex items-center justify-center">
                <div className="text-[#64ffda] text-xl">Chargement...</div>
            </div>
        );
    }

    if (!user?.is_admin) {
        return (
            <div className="min-h-screen bg-[#020c1b] flex items-center justify-center">
                <div className="text-[#64ffda]">
                    Vous n'êtes pas autorisé à accéder à cette page
                    <br />
                    <small className="text-[#8892b0]">
                        Debug: User: {user?.username}, Admin: {String(user?.is_admin)} ({typeof user?.is_admin})
                    </small>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020c1b] py-40">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-[#64ffda] mb-8">Administration</h1>

                {error && (
                    <div className="text-red-500 mb-4">Une erreur est survenue lors de la récupération des utilisateurs: {error.message}</div>
                )}

                {isLoading ? (
                    <div className="text-[#64ffda] text-xl">Chargement des utilisateurs...</div>
                ) : (
                    <div className="bg-white/5 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-[#64ffda] mb-6">Liste des utilisateurs</h2>
                        <div className="space-y-4">
                            {users.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onUserUpdate={() => {
                                        hasFetchedRef.current = false;
                                        fetchUsers();
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}