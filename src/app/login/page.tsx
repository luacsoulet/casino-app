'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/AuthStore';
import { Login } from '@/components/Login';

export default function LoginPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/');
        }
    }, [isAuthenticated, router]);

    return <Login />;
} 