"use client"
import { deleteUser, updateUserBalance } from "@/utils/apiFonctions";
import { User } from "@/utils/types";
import { useState } from "react";
import { useAuthStore } from "@/store/AuthStore";
import { useUserBalanceStore } from "@/store/UserStore";
import router from "next/router";

export default function UserCard({ user }: { user: User }) {
    const { token, user: connectedUser } = useAuthStore();
    const { setVirtualBalance } = useUserBalanceStore();
    const [modalState, setModalState] = useState({
        isVisible: false,
        balance: user.virtual_balance
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModalState, setDeleteModalState] = useState(false);

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

    return (
        <div className={`bg-white/5 rounded-lg p-6 ${isDeleting ? 'hidden' : ''}`}>
            <h2 className="text-2xl font-bold text-[#64ffda] mb-6">{user.username}</h2>
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
        </div>
    );
}