"use client"
import { useAuthStore } from '@/store/AuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUserBalanceStore } from '@/store/UserStore';

export const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const { virtualBalance } = useUserBalanceStore();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isAdmin = user?.is_admin === true;

    return (
        <nav className="fixed top-2 left-1/2 -translate-x-1/2 rounded-lg z-50 w-[calc(100%-2rem)] bg-white/5 backdrop-blur-md border-b border-gray-500/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-[#64ffda] text-xl font-bold">
                            Casino Game
                        </Link>

                        {isAuthenticated && (
                            <div className="hidden md:flex ml-10 space-x-8">
                                <Link href="/game/1" className="text-[#8892b0] hover:text-[#64ffda] transition-colors">
                                    Coin Flip
                                </Link>
                                <Link href="/history" className="text-[#8892b0] hover:text-[#64ffda] transition-colors">
                                    Historique
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin" className="text-[#8892b0] hover:text-[#64ffda] transition-colors">
                                        Admin
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <div className="text-[#8892b0] flex items-center">
                                    <span className="mr-2">{user?.username}</span>
                                    <div className="text-[#64ffda] flex items-center">
                                        {virtualBalance}
                                        <img src="/money.svg" alt="coin" className="w-4 h-4 ml-2 bg-[#64ffda] rounded-full" />
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-lg bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20 transition-all"
                                >
                                    Déconnexion
                                </motion.button>
                            </div>
                        ) : (
                            <Link href="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 rounded-lg bg-[#64ffda] text-[#0a192f] hover:bg-[#64ffda]/90 transition-all"
                                >
                                    Connexion
                                </motion.button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
            {isAuthenticated && (
                <div className="md:hidden border-t border-[#64ffda]/20">
                    <div className="px-2 py-3 space-y-1">
                        <Link href="/game/1" className="block px-3 py-2 rounded-md text-[#8892b0] hover:text-[#64ffda] hover:bg-[#112240] transition-all">
                            Coin Flip
                        </Link>
                        <Link href="/history" className="block px-3 py-2 rounded-md text-[#8892b0] hover:text-[#64ffda] hover:bg-[#112240] transition-all">
                            Historique
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className="block px-3 py-2 rounded-md text-[#8892b0] hover:text-[#64ffda] hover:bg-[#112240] transition-all">
                                Admin
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}; 