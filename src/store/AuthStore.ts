import { create } from 'zustand';
import { User } from '@/utils/types';
import { persist } from 'zustand/middleware';
import { useUserBalanceStore } from './UserStore';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            login: (token: string, user: User) => {
                const normalizedUser = {
                    ...user,
                    is_admin: Boolean(user.is_admin)
                };
                set({
                    user: normalizedUser,
                    token,
                    isAuthenticated: true,
                    isLoading: false
                });
                useUserBalanceStore.getState().setVirtualBalance(user.virtual_balance);
            },
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false
                });
                useUserBalanceStore.getState().setVirtualBalance(0);
            },
            setLoading: (loading: boolean) =>
                set({
                    isLoading: loading
                })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setLoading(false);
                    if (state.user) {
                        state.user.is_admin = Boolean(state.user.is_admin);
                        useUserBalanceStore.getState().setVirtualBalance(state.user.virtual_balance);
                    }
                }
            }
        }
    )
); 