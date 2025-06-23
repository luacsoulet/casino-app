import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/AuthStore';
import { useUserBalanceStore } from '@/store/UserStore';
import { useLogin, useRegister } from '../utils/apiFonctions';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const Login = () => {
    const { login: authLogin } = useAuthStore();
    const { setVirtualBalance } = useUserBalanceStore();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { data: loginData, error: loginError, isLoading: loginLoading, login } = useLogin();
    const { data: registerData, error: registerError, isLoading: registerLoading, register } = useRegister();

    const isLoading = loginLoading || registerLoading;
    const currentError = loginError || registerError;

    useEffect(() => {
        if (loginData && loginData.user && loginData.token && !loginError) {


            const convertToAdmin = (value: any): boolean => {
                if (value === true || value === 1 || value === "1" || value === "true") return true;
                return false;
            };

            const userData = {
                id: String(loginData.user.id),
                username: loginData.user.username,
                virtual_balance: loginData.user.virtual_balance,
                is_admin: convertToAdmin(loginData.user.isAdmin),
                created_at: new Date().toISOString(),
                token: loginData.token
            };

            authLogin(userData);
            setVirtualBalance(userData.virtual_balance);
            router.push('/game/1');
        }
    }, [loginData, loginError, authLogin, setVirtualBalance, router]);

    useEffect(() => {
        if (registerData && registerData.message && !registerError) {
            login(username, password);
        }
    }, [registerData, registerError, login, username, password]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, password);
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError('Une erreur est survenue. Veuillez réessayer.');
        }
    };

    const displayError = currentError?.message || error;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020c1b]">
            <motion.div
                className="w-full max-w-md p-8 rounded-xl border border-[#64ffda]/20 bg-[#0a192f]/60 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold text-[#64ffda] mb-6">
                    {isLogin ? 'Connexion' : 'Inscription'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-[#8892b0] mb-2">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 bg-[#0a192f] border border-[#64ffda]/20 rounded-lg text-[#64ffda] focus:outline-none focus:border-[#64ffda] transition-all duration-300"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-[#8892b0] mb-2">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-[#0a192f] border border-[#64ffda]/20 rounded-lg text-[#64ffda] focus:outline-none focus:border-[#64ffda] transition-all duration-300"
                            required
                        />
                    </div>

                    {displayError && (
                        <div className="text-red-400 text-sm">
                            {displayError}
                        </div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full px-4 py-2 bg-[#64ffda] text-[#0a192f] rounded-lg font-medium hover:bg-[#64ffda]/90 transition-all duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
                    </motion.button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[#64ffda] hover:text-[#64ffda]/80 transition-colors"
                        >
                            {isLogin ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};