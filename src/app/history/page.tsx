'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/AuthStore';
import { withAuth } from '@/middleware/withAuth';
import { useHistory } from '@/utils/apiFonctions';

function HistoryPage() {
    const { token } = useAuthStore();
    const hasFetchedRef = useRef(false);

    // Utilisation du nouveau hook
    const { data: plays, error, isLoading, getHistory } = useHistory();

    useEffect(() => {
        if (token && !hasFetchedRef.current) {
            console.log('🔄 Récupération de l\'historique...');
            getHistory(token);
            hasFetchedRef.current = true;
        }
    }, [token, getHistory]);

    // Reset the ref when token changes (user logout/login)
    useEffect(() => {
        if (!token) {
            hasFetchedRef.current = false;
        }
    }, [token]);

    return (
        <div className="min-h-screen flex flex-col items-center p-8 bg-[#020c1b]">
            <h1 className="text-4xl font-bold text-[#64ffda] mt-20 mb-8">Historique des parties</h1>
            {error && (
                <div className="text-red-500">Une erreur est survenue lors du chargement de l'historique: {error.message}</div>
            )}
            {isLoading ? (
                <div className="text-[#64ffda]">Chargement...</div>
            ) : (
                <div className="w-full max-w-4xl flex flex-col gap-4">
                    {plays && plays.length > 0 ? plays.map((play) => (
                        <div key={play.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="text-[#64ffda]">{play.game_name}</span>
                                <div className="text-[#8892b0] ml-4 flex items-center">
                                    Mise: {play.bet}
                                    <img src="/money.svg" alt="coin" className="inline-block w-4 h-4 ml-2 bg-[#8892b0] rounded-full" />
                                </div>
                            </div>
                            <div>
                                {play.result ? (
                                    <span className="text-green-400">Gagné</span>
                                ) : (
                                    <span className="text-red-400">Perdu</span>
                                )}
                                <span className="text-[#8892b0] ml-4">
                                    {new Date(play.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-[#8892b0] text-center">
                            Aucune partie jouée pour le moment.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default withAuth(HistoryPage);