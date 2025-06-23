"use client"
import { useDeleteUser, useUpdateUserBalance, usePromoteUser } from "@/utils/apiFonctions";
import { User } from "@/utils/types";
import { useState, useEffect } from "react";
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

    // Utilisation des nouveaux hooks
    const { data: deleteData, error: deleteError, isLoading: deleteLoading, deleteUser } = useDeleteUser();
    const { data: balanceData, error: balanceError, isLoading: balanceLoading, updateUserBalance } = useUpdateUserBalance();
    const { data: promoteData, error: promoteError, isLoading: promoteLoading, promoteUser } = usePromoteUser();

    const [modalState, setModalState] = useState({
        isVisible: false,
        balance: user.virtual_balance
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalState, setDeleteModalState] = useState(false);
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showPromoteModal, setShowPromoteModal] = useState(false);

    const isLoading = deleteLoading || balanceLoading || promoteLoading;
    const currentError = deleteError || balanceError || promoteError;

    // Effet pour gérer la suppression réussie
    useEffect(() => {
        if (deleteData && !deleteError) {
            setIsDeleting(true);
            if (onUserUpdate) onUserUpdate();
        }
    }, [deleteData, deleteError, onUserUpdate]);

    // Effet pour gérer la mise à jour du solde réussie
    useEffect(() => {
        if (balanceData && !balanceError) {
            if (connectedUser && connectedUser.id === user.id) {
                setVirtualBalance(balanceData.virtual_balance);
            }
            if (onUserUpdate) onUserUpdate();
            setModalState(prev => ({ ...prev, isVisible: false }));
        }
    }, [balanceData, balanceError, connectedUser, user.id, setVirtualBalance, onUserUpdate]);

    // Effet pour gérer la promotion réussie
    useEffect(() => {
        if (promoteData && !promoteError) {
            setShowPromoteModal(false);
            if (onUserUpdate) onUserUpdate();
        }
    }, [promoteData, promoteError, onUserUpdate]);

    const handleModifyBalance = async () => {
        if (!modalState.isVisible) {
            setModalState(prev => ({ ...prev, isVisible: true }));
            return;
        }

        setError('');
        updateUserBalance(user.id, token as string, modalState.balance);
    }

    const handleDeleteUser = async () => {
        if (connectedUser && connectedUser.id === user.id) {
            setError('Vous ne pouvez pas supprimer votre propre compte');
            return;
        }

        setError('');
        deleteUser(user.id, token as string);
        setDeleteModalState(false);
    }

    const handleUpdateBalance = async () => {
        if (!amount) {
            setError('Veuillez entrer un montant');
            return;
        }

        setError('');

        try {
            await updateUserBalance(user.id, token as string, Number(amount));
            if (balanceData && !balanceError) {
                setAmount('');
                if (onUserUpdate) onUserUpdate();
            }
        } catch (err) {
            setError('Une erreur est survenue');
        }
    };

    const handlePromote = async () => {
        if (connectedUser && connectedUser.id === user.id) {
            setError('Vous ne pouvez pas vous promouvoir vous-même');
            return;
        }

        setError('');

        if (!token) {
            setError('Token d\'authentification manquant');
            return;
        }

        promoteUser(user.id, token);
    };

    // Afficher l'erreur du hook ou l'erreur locale
    const displayError = currentError?.message || error;

    return (
        <div className={`bg-white/5 rounded-lg p-6 ${isDeleting ? 'hidden' : ''}`}>
            <h2 className="text-2xl font-bold text-[#64ffda] mb-6">{user.username}</h2>
            {displayError && (
                <div className="text-red-400 text-sm mb-4">
                    {displayError}
                </div>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <p className="text-[#8892b0]">Balance: {modalState.balance}</p>
                    <button
                        className={`text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-[#64ffda]/90 hover:scale-105 transition-all duration-300 ${modalState.isVisible ? 'bg-[#64ffda]/60' : 'bg-[#64ffda]'}`}
                        onClick={handleModifyBalance}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Chargement...' : 'modify balance'}
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
                            disabled={isLoading}
                        >
                            Promouvoir Admin
                        </button>
                    )}
                    <button
                        className="bg-red-500 text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-red-600 hover:scale-105 transition-all duration-300"
                        onClick={() => setDeleteModalState(true)}
                        disabled={isLoading}
                    >
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
                            className="w-full px-4 py-2 bg-[#0a192f] border border-[#64ffda]/20 rounded-lg text-[#64ffda] focus:outline-none focus:border-[#64ffda] transition-all duration-300"
                        />
                        <button
                            className="bg-[#64ffda] text-black px-4 py-2 rounded-md hover:text-white active:scale-95 hover:bg-[#64ffda]/90 hover:scale-105 transition-all duration-300"
                            onClick={handleModifyBalance}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Chargement...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            <Modal
                isOpen={deleteModalState}
                onClose={() => setDeleteModalState(false)}
                onConfirm={handleDeleteUser}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.username} ?`}
            />

            <Modal
                isOpen={showPromoteModal}
                onClose={() => setShowPromoteModal(false)}
                onConfirm={handlePromote}
                title="Confirmer la promotion"
                message={`Êtes-vous sûr de vouloir promouvoir ${user.username} en tant qu'administrateur ?`}
            />
        </div>
    );
}