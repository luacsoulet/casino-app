import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './AuthStore';

interface UserBalanceState {
    virtualBalance: number;
    setVirtualBalance: (balance: number) => void;
}

export const useUserBalanceStore = create<UserBalanceState>()(
    persist(
        (set) => ({
            virtualBalance: 0,
            setVirtualBalance: (balance) => set({ virtualBalance: balance }),
        }),
        {
            name: 'user-balance-storage',
            onRehydrateStorage: () => (state) => {
                const authState = useAuthStore.getState();
                if (state && authState.user) {
                    state.setVirtualBalance(authState.user.virtual_balance);
                }
            }
        }
    )
);