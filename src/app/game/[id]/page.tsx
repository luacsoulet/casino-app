"use client"

import { useParams } from "next/navigation";
import { useState } from 'react';
import { useAuthStore } from '@/store/AuthStore';
import { useUserBalanceStore } from '@/store/UserStore';
import CoinFlip from '@/components/CoinFlip';
import { postResult } from '@/utils/apiFonctions';
import { withAuth } from '@/middleware/withAuth';

function GamePage() {
    const { id } = useParams();
    const { token } = useAuthStore();
    const { setVirtualBalance } = useUserBalanceStore();
    const [error, setError] = useState<string | null>(null);

    const handleWin = async (amount: number) => {
        try {
            const response = await postResult(true, token as string, amount, id as string);
            if (response.error) {
                setError(response.error);
                return false;
            }
            if (response.virtual_balance !== undefined) {
                setVirtualBalance(response.virtual_balance);
            }
            return true;
        } catch (err) {
            setError('Une erreur est survenue lors de l\'enregistrement du résultat');
            return false;
        }
    };

    const handleLose = async (amount: number) => {
        try {
            const response = await postResult(false, token as string, amount, id as string);
            if (response.error) {
                setError(response.error);
                return false;
            }
            if (response.virtual_balance !== undefined) {
                setVirtualBalance(response.virtual_balance);
            }
            return true;
        } catch (err) {
            setError('Une erreur est survenue lors de l\'enregistrement du résultat');
            return false;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020c1b]">
            <CoinFlip
                onWin={handleWin}
                onLose={handleLose}
                error={error}
                onErrorClear={() => setError(null)}
            />
        </div>
    );
}

export default withAuth(GamePage);