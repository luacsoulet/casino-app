"use client"

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/AuthStore";
import { getUsers } from "@/utils/apiFonctions";
import { User } from "@/utils/types";
import { useRouter } from "next/navigation";
import UserCard from "@/components/UserCard";

export default function AdminPage() {
    const { user, token, isLoading: authLoading } = useAuthStore();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchUsers = async () => {
        if (authLoading || !token) return;
        if (!user?.is_admin) {
            router.push('/');
            return;
        }
        try {
            setIsLoading(true);
            const users = await getUsers(token);
            setUsers(users);
            setIsError(false);
        } catch (error) {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token, user?.is_admin, authLoading, router]);

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
                <div className="text-[#64ffda]">Vous n'êtes pas autorisé à accéder à cette page</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020c1b] py-40">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-[#64ffda] mb-8">Administration</h1>

                {isError && (
                    <div className="text-red-500 mb-4">Une erreur est survenue lors de la récupération des utilisateurs</div>
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
                                    onUserUpdate={fetchUsers}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}