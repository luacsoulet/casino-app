const API_URL = process.env.NEXT_PUBLIC_API_URL;

import { useState, useCallback } from 'react';
import { Game, PlayHistory, User, LoginResponse, RegisterResponse, PostResultResponse, UpdateBalanceResponse, DeleteUserResponse, PromoteUserResponse } from './types';


export const handleApiError = (type: string, response: Response) => {
    if (!response.ok) {
        const errorMessages: Record<number, string> = {
            400: "Bad request",
            401: "Invalid credentials",
            403: "Forbidden access",
            404: `${type.charAt(0).toUpperCase() + type.slice(1)} not found`,
            500: "Internal server error"
        }
        const message = errorMessages[response.status] || `Error while fetching ${type}`
        throw new Error(message)
    }
}


export function usePostResult() {
    const [data, setData] = useState<PostResultResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!bet": "Bet is required",
        "!result": "Result is required",
        "!gameId": "Game ID is required",
        "!token": "Token is required",
    }

    const validateInputs = (bet: number, result: boolean, gameId: string, token: string) => {
        if (!bet || bet <= 0) throw new Error(errorMessages["!bet"]);
        if (result === undefined || result === null) throw new Error(errorMessages["!result"]);
        if (!gameId) throw new Error(errorMessages["!gameId"]);
        if (!token) throw new Error(errorMessages["!token"]);
    }

    const reset = () => {
        setData(null);
        setError(null);
    };

    const postResult = async (result: boolean, token: string, bet: number, gameId: string) => {
        reset();
        setIsLoading(true);

        try {
            validateInputs(bet, result, gameId, token);
            const response = await fetch(`${API_URL}/api/plays/${gameId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bet: Number(bet),
                    result: result
                }),
            });

            handleApiError('postResult', response);

            const responseData = await response.json();
            setData(responseData);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, postResult, reset };
};

export function useHistory() {
    const [data, setData] = useState<PlayHistory[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!token": "Token is required",
    }

    const validateInputs = (token: string) => {
        if (!token) throw new Error(errorMessages["!token"]);
    }

    const getHistory = useCallback(async (token: string) => {
        validateInputs(token);
        setError(null); // Reset error before new call
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/plays/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleApiError('getHistory', response);
            const responseData = await response.json();
            setData(responseData);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { data, error, isLoading, getHistory };
}

export function useGames() {
    const [data, setData] = useState<Game[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!etag": "Etag is required",
    }

    const validateInputs = (etag?: string | null) => {
        // Etag est optionnel, pas de validation nécessaire
    }

    const getGames = async (etag?: string | null) => {
        validateInputs(etag);
        setIsLoading(true);
        try {
            const headers: HeadersInit = {};
            if (etag) {
                headers['If-None-Match'] = etag;
            }
            const response = await fetch(`${API_URL}/api/games`, { headers });
            handleApiError('getGames', response);
            if (response.status === 304) {
                return { notModified: true };
            }
            const newEtag = response.headers.get('etag');
            const data = await response.json();
            setData(data);
            return {
                data,
                etag: newEtag,
                notModified: false
            };
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, getGames };
};

export function useLogin() {
    const [data, setData] = useState<LoginResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!username": "Username is required",
        "!password": "Password is required",
    }

    const validateInputs = (username: string, password: string) => {
        if (!username) throw new Error(errorMessages["!username"]);
        if (!password) throw new Error(errorMessages["!password"]);
    }

    const login = async (username: string, password: string) => {
        validateInputs(username, password);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
            });
            handleApiError('login', response);
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, login };
}


export function useRegister() {
    const [data, setData] = useState<RegisterResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!username": "Username is required",
        "!password": "Password is required",
    }

    const validateInputs = (username: string, password: string) => {
        if (!username) throw new Error(errorMessages["!username"]);
        if (!password) throw new Error(errorMessages["!password"]);
        if (password.length < 8) throw new Error(errorMessages["!passwordLength"]);
    }

    const register = async (username: string, password: string) => {
        validateInputs(username, password);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
            });
            handleApiError('register', response);
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, register };
}


export function useUser() {
    const [data, setData] = useState<User | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!id": "ID is required",
        "!token": "Token is required",
    }

    const validateInputs = (id: string, token: string) => {
        if (!id) throw new Error(errorMessages["!id"]);
        if (!token) throw new Error(errorMessages["!token"]);
    }

    const getUser = async (id: string, token: string) => {
        validateInputs(id, token);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleApiError('getUser', response);
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, getUser };
}

export function useUsers() {
    const [data, setData] = useState<User[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!token": "Token is required",
    }

    const validateInputs = (token: string) => {
        if (!token) throw new Error(errorMessages["!token"]);
    }

    const getUsers = useCallback(async (token: string) => {
        validateInputs(token);
        setError(null);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleApiError('getUsers', response);
            const responseData = await response.json();
            setData(responseData);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { data, error, isLoading, getUsers };
}

export function useUpdateUserBalance() {
    const [data, setData] = useState<UpdateBalanceResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!id": "ID is required",
        "!token": "Token is required",
        "!amount": "Amount is required",
    }

    const validateInputs = (id: string, token: string, amount: number) => {
        if (!id) throw new Error(errorMessages["!id"]);
        if (!token) throw new Error(errorMessages["!token"]);
        if (amount === undefined || amount === null) throw new Error(errorMessages["!amount"]);
    }

    const updateUserBalance = async (id: string, token: string, amount: number) => {
        validateInputs(id, token, amount);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/${id}/balance`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ amount }),
            });
            handleApiError('updateUserBalance', response);
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, updateUserBalance };
}

export function useDeleteUser() {
    const [data, setData] = useState<DeleteUserResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!id": "ID is required",
        "!token": "Token is required",
    }

    const validateInputs = (id: string, token: string) => {
        if (!id) throw new Error(errorMessages["!id"]);
        if (!token) throw new Error(errorMessages["!token"]);
    }

    const deleteUser = async (id: string, token: string) => {
        validateInputs(id, token);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleApiError('deleteUser', response);
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, deleteUser };
}

export function usePromoteUser() {
    const [data, setData] = useState<PromoteUserResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const errorMessages: Record<string, string> = {
        "!id": "ID is required",
        "!token": "Token is required",
    }

    const validateInputs = (id: string, token: string) => {
        if (!id) throw new Error(errorMessages["!id"]);
        if (!token) throw new Error(errorMessages["!token"]);
    }

    const promoteUser = async (id: string, token: string) => {
        validateInputs(id, token);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/users/${id}/promote`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            handleApiError('promoteUser', response);
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error as Error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, error, isLoading, promoteUser };
}