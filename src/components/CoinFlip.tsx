import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserBalanceStore } from '@/store/UserStore';

interface CoinFlipProps {
    onWin?: (amount: number) => Promise<boolean>;
    onLose?: (amount: number) => Promise<boolean>;
    error?: string | null;
    onErrorClear?: () => void;
}

const CoinFlip = ({ onWin, onLose }: CoinFlipProps) => {
    const [bet, setBet] = useState<number>(10);
    const [nextChoice, setNextChoice] = useState<'heads' | 'tails' | null>(null);
    const [choice, setChoice] = useState<'heads' | 'tails' | null>(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState<'heads' | 'tails' | null>(null);
    const [rotation, setRotation] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const { virtualBalance } = useUserBalanceStore();

    const getFinalRotation = (result: 'heads' | 'tails') => {
        const base = result === 'heads' ? 0 : 180;
        return 1800 + base;
    };

    const handleFlip = async () => {
        if (!nextChoice || bet <= 0 || isFlipping) return;

        setIsFlipping(true);
        setShowResult(false);
        setResult(null);
        setChoice(null);

        const finalResult = Math.random() < 0.5 ? 'heads' : 'tails';
        setResult(finalResult);
        setChoice(nextChoice);
        const finalRotation = getFinalRotation(finalResult);
        setRotation(0);
        let current = 0;
        const step = 20;

        const interval = setInterval(() => {
            current += step;
            if (current >= finalRotation) {
                setRotation(finalRotation);
                clearInterval(interval);
                setTimeout(async () => {
                    if (finalResult === nextChoice) {
                        await onWin?.(bet * 2);
                    } else {
                        await onLose?.(bet);
                    }
                    setShowResult(true);
                    setIsFlipping(false);
                    setNextChoice(null);
                }, 300);
            } else {
                setRotation(current);
            }
        }, 16);
    };

    const isHeads = Math.round((rotation % 360) / 180) % 2 === 0;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative">
            <div
                className={`pointer-events-none fixed top-0 left-0 w-full h-40 z-10 transition-all duration-700
                    ${showResult && result && result === choice ? 'bg-gradient-to-b from-green-400/40 to-transparent' : ''}
                    ${showResult && result && result !== choice ? 'bg-gradient-to-b from-red-400/40 to-transparent' : ''}
                `}
            />
            <div
                className={`pointer-events-none fixed bottom-0 left-0 w-full h-40 z-10 transition-all duration-700
                    ${showResult && result && result === choice ? 'bg-gradient-to-t from-green-400/40 to-transparent' : ''}
                    ${showResult && result && result !== choice ? 'bg-gradient-to-t from-red-400/40 to-transparent' : ''}
                `}
            />
            <AnimatePresence>
                {showResult && result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute top-60 left-1/2 transform -translate-x-1/2 z-0 text-center"
                    >
                        <div
                            className={`text-[25vw] font-bold ${result === choice ? 'text-green-400' : 'text-red-400'}`}
                        >
                            {result === choice ? 'GAGNÉ' : 'PERDU'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className="flex flex-col items-center gap-8 p-12 rounded-xl border border-[#64ffda]/20 bg-[#0a192f]/60 backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="relative w-40 h-40 perspective-1000">
                    <motion.div
                        className="relative w-full h-full preserve-3d"
                        animate={{ rotateY: rotation }}
                        transition={{ rotateY: { duration: 0.016, ease: "linear" } }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <motion.div
                            className="absolute w-full h-full backface-hidden"
                            style={{
                                transform: 'rotateY(0deg)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden'
                            }}
                            animate={{ opacity: isHeads ? 1 : 0 }}
                            transition={{ duration: 0.1 }}
                        >
                            <Image
                                src="/coin-face.png"
                                alt="Pile"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </motion.div>
                        <motion.div
                            className="absolute w-full h-full backface-hidden"
                            style={{
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden'
                            }}
                            animate={{ opacity: !isHeads ? 1 : 0 }}
                            transition={{ duration: 0.1 }}
                        >
                            <Image
                                src="/coin-pile.png"
                                alt="Face"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </motion.div>
                    </motion.div>
                </div>

                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNextChoice('heads')}
                        className={`px-6 py-2 rounded-lg transition-all duration-300 ${nextChoice === 'heads'
                            ? 'bg-[#64ffda] text-[#0a192f] scale-105'
                            : 'bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20'
                            }`}
                        disabled={isFlipping}
                    >
                        Pile
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNextChoice('tails')}
                        className={`px-6 py-2 rounded-lg transition-all duration-300 ${nextChoice === 'tails'
                            ? 'bg-[#64ffda] text-[#0a192f] scale-105'
                            : 'bg-[#64ffda]/10 text-[#64ffda] hover:bg-[#64ffda]/20'
                            }`}
                        disabled={isFlipping}
                    >
                        Face
                    </motion.button>
                </div>

                <div className="flex items-center gap-4">
                    <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        value={bet}
                        onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-24 px-4 py-2 bg-[#0a192f] border border-[#64ffda]/20 rounded-lg text-[#64ffda] focus:outline-none focus:border-[#64ffda] transition-all duration-300"
                        min="1"
                        disabled={isFlipping}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFlip}
                        disabled={!nextChoice || isFlipping}
                        className={`px-6 py-2 rounded-lg transition-all duration-300 ${!nextChoice || isFlipping
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-[#64ffda] text-[#0a192f] hover:bg-[#64ffda]/90'
                            }`}
                    >
                        {isFlipping ? 'Lancement...' : 'Lancer'}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default CoinFlip; 