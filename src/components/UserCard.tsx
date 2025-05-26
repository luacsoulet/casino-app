"use client"
import { deleteUser, updateUserBalance, promoteUser } from "@/utils/apiFonctions";
import { User } from "@/utils/types";
import { useState } from "react";
import { useAuthStore } from "@/store/AuthStore";
import { useUserBalanceStore } from "@/store/UserStore";
import router from "next/router";
import { motion } from 'framer-motion';

interface UserCardProps {
    user: User;
    onUserUpdate?: () => void;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const Modal = ({ isOpen, onClose, onConfirm, title, message }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0a192f] p-6 rounded-lg max-w-md w-full mx-4 border border-[#64ffda]/20"
            >
                <h3 className="text-xl font-bold text-[#64ffda] mb-4">{title}</h3>
                <p className="text-[#8892b0] mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[#64ffda] hover:bg-[#64ffda]/10 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-[#64ffda] text-[#0a192f] rounded-lg hover:bg-[#64ffda]/90 transition-colors"
                    >
                        Confirmer
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default function UserCard({ user, onUserUpdate }: UserCardProps) {
    const { token, user: connectedUser } = useAuthStore();
    const { setVirtualBalance } = useUserBalanceStore();
    const [modalState, setModalState] = useState({
        isVisible: false,
        balance: user.virtual_balance
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalState, setDeleteModalState] = useState(false);
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPromoteModal, setShowPromoteModal] = useState(false);

    const handleModifyBalance = async () => {
        if (!modalState.isVisible) {
            setModalState(prev => ({ ...prev, isVisible: true }));
            return;
        }

        const response = await updateUserBalance(user.id, modalState.balance, token as string);
        if (response.error) {
            console.error(response.error);
        } else {
            if (connectedUser && connectedUser.id === user.id) {
                setVirtualBalance(modalState.balance);
            }
        }
        setModalState(prev => ({ ...prev, isVisible: false }));
    }

    const handleDeleteUser = async () => {
        setDeleteModalState(true);
        if (connectedUser && connectedUser.id === user.id) {
            alert('Vous ne pouvez pas supprimer votre propre compte');
            return;
        }
        const response = await deleteUser(user.id, token as string);
        if (response.error) {
            console.error(response.error);
        } else {
            setIsDeleting(true);
        }
    }

    const handleUpdateBalance = async () => {
        if (!amount) {
            setError('Veuillez entrer un montant');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await updateUserBalance(user.id, Number(amount), token as string);
            if (response.error) {
                setError(response.error);
            } else {
                setAmount('');
                if (onUserUpdate) onUserUpdate();
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromote = async () => {
        if (connectedUser && connectedUser.id === user.id) {
            setError('Vous ne pouvez pas vous promouvoir vous-même');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            if (!token) {
                setError('Token d\'authentification manquant');
                return;
            }

            const response = await promoteUser(user.id, token);
            if (response.error) {
                setError(response.error);
            } else {
                setShowPromoteModal(false);
                if (onUserUpdate) {
                    onUserUpdate();
                }
            }
        } catch (err) {
            setError('Une erreur est survenue lors de la promotion');
            console.error('Erreur promotion:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-white/5 rounded-lg p-6 ${isDeleting ? 'hidden' : ''}`}>
            <h2 className="text-2xl font-bold text-[#64ffda] mb-6">{user.username}</h2>
            {error && (
                <div className="text-red-400 text-sm mb-4">
                    {error}
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <p className="text-[#8892b0]">Balance: {modalState.balance}</p>
                    <button
                        className={`text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-[#64ffda]/90 hover:scale-105 transition-all duration-300 ${modalState.isVisible ? 'bg-[#64ffda]/60' : 'bg-[#64ffda]'}`}
                        onClick={handleModifyBalance}
                    >
                        modify balance
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    {user.is_admin && (
                        <p className="text-black p-2 bg-[#64ffda] rounded-md">Admin</p>
                    )}
                    {!user.is_admin && (
                        <button
                            onClick={() => setShowPromoteModal(true)}
                            className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-yellow-600 hover:scale-105 transition-all duration-300"
                        >
                            Promouvoir Admin
                        </button>
                    )}
                    <button className="bg-red-500 text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-red-600 hover:scale-105 transition-all duration-300" onClick={() => setDeleteModalState(true)}>
                        delete
                    </button>
                </div>
            </div>
            {modalState.isVisible && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="flex flex-col gap-5 bg-white/10 backdrop-blur-sm p-4 rounded-lg relative">
                        <h2 className="text-2xl font-bold text-[#64ffda]">Modify Balance</h2>
                        <button
                            className="bg-red-500 text-black px-4 py-2 rounded-full hover:text-white active:scale-95 hover:bg-red-600 hover:scale-105 transition-all duration-300 absolute top-[-15px] right-[-15px] cursor-pointer"
                            onClick={() => setModalState(prev => ({ ...prev, isVisible: false }))}
                        >
                            X
                        </button>
                        <input
                            type="number"
                            value={modalState.balance}
                            onChange={(e) => setModalState(prev => ({ ...prev, balance: Number(e.target.value) }))}
                            className="w-full p-2 rounded-md border-2 border-[#64ffda] text-white"
                        />
                        <button className="bg-[#64ffda] text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-[#64ffda]/90 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleModifyBalance}>
                            save
                        </button>
                    </div>
                </div>
            )}
            {deleteModalState && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="flex flex-col gap-5 bg-white/20 backdrop-blur-lg p-4 rounded-lg relative">
                        <h2 className="text-2xl font-bold text-[#64ffda]">Êtes-vous sûr de vouloir supprimer cet utilisateur ?</h2>
                        <div className="flex w-full justify-center gap-4">
                            <button className="bg-red-500 text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-red-600 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={handleDeleteUser}>
                                Oui
                            </button>
                            <button className="bg-green-500 text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-green-600 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setDeleteModalState(false)}>
                                Non
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Modal
                isOpen={showPromoteModal}
                onClose={() => setShowPromoteModal(false)}
                onConfirm={handlePromote}
                title="Promouvoir en administrateur"
                message={`Êtes-vous sûr de vouloir promouvoir ${user.username} en administrateur ? Cette action est irréversible.`}
            />
        </div>
    );
}