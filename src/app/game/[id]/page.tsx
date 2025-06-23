"use client"

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/AuthStore';
import { useUserBalanceStore } from '@/store/UserStore';
import CoinFlip from '@/components/CoinFlip';
import { usePostResult } from '@/utils/apiFonctions';
import { withAuth } from '@/middleware/withAuth';

function GamePage() {
    const { id } = useParams();
    const { token } = useAuthStore();
    const { setVirtualBalance } = useUserBalanceStore();
    const [error, setError] = useState<string | null>(null);
    const [pendingResult, setPendingResult] = useState<{
        type: 'win' | 'lose',
        resolve: (value: boolean) => void,
        id: number
    } | null>(null);
    const callIdRef = useRef(0);

    const { data, error: postError, isLoading, postResult, reset } = usePostResult();

    useEffect(() => {
        if (data && !postError && pendingResult) {
            if (data.virtual_balance !== undefined) {
                setVirtualBalance(data.virtual_balance);
            }
            pendingResult.resolve(true);
            setPendingResult(null);
        } else if (postError && pendingResult) {
            setError(postError.message);
            pendingResult.resolve(false);
            setPendingResult(null);
        }
    }, [data, postError, pendingResult, setVirtualBalance]);

    const handleWin = async (amount: number): Promise<boolean> => {
        const callId = ++callIdRef.current;

        return new Promise((resolve) => {
            setError(null);
            setPendingResult({ type: 'win', resolve, id: callId });
            postResult(true, token as string, amount, id as string);
        });
    };

    const handleLose = async (amount: number): Promise<boolean> => {
        const callId = ++callIdRef.current;

        return new Promise((resolve) => {
            setError(null);
            setPendingResult({ type: 'lose', resolve, id: callId });
            postResult(false, token as string, amount, id as string);
        });
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