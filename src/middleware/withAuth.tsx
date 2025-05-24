import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';

export const withAuth = (WrappedComponent: React.ComponentType) => {
    return function WithAuthComponent(props: any) {
        const { isAuthenticated, isLoading, token } = useAuthStore();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !isAuthenticated && !token) {
                router.replace('/login');
            }
        }, [isLoading, isAuthenticated, router, token]);

        if (isLoading && !token) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#020c1b]">
                    <div className="text-[#64ffda] text-xl">Chargement...</div>
                </div>
            );
        }

        if (!isAuthenticated && !token) {
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}; 