const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const postResult = async (result: boolean, token: string, bet: number, gameId: string) => {
    try {
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

        const data = await response.json();

        if (!response.ok) {
            return { error: data.message || 'Une erreur est survenue' };
        }
        return data;
    } catch (error) {
        return { error: 'Une erreur est survenue lors de l\'enregistrement du résultat' };
    }
};

export const getHistory = async (token: string) => {
    const response = await fetch(`${API_URL}/api/plays/history`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getGames = async (etag?: string | null) => {
    try {
        const headers: HeadersInit = {};
        if (etag) {
            headers['If-None-Match'] = etag;
        }
        const response = await fetch(`${API_URL}/api/games`, { headers });
        if (response.status === 304) {
            return { notModified: true };
        }
        const newEtag = response.headers.get('etag');
        const data = await response.json();
        return {
            data,
            etag: newEtag,
            notModified: false
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        throw new Error('Une erreur est survenue lors de la récupération des jeux');
    }
};

export const login = async (username: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (!response.ok) {
            return {
                error: data.message || 'Une erreur est survenue lors de la connexion'
            };
        }
        if (!data.user || !data.token) {
            console.error('Missing user or token in response:', data);
            return {
                error: 'Données de connexion invalides'
            };
        }

        data.user.is_admin = data.user.isAdmin || data.user.is_admin || false;
        delete data.user.isAdmin;

        return data;
    } catch (error) {
        return {
            error: 'Une erreur est survenue lors de la connexion'
        };
    }
};

export const register = async (username: string, password: string) => {
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            return {
                error: data.message || 'Une erreur est survenue lors de l\'inscription'
            };
        }
        return data;
    } catch (error) {
        return {
            error: 'Une erreur est survenue lors de l\'inscription'
        };
    }
};

export const getUser = async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/api/users/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    return response.json();
};

export const getUsers = async (token: string) => {
    try {
        const response = await fetch(`${API_URL}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.json();
    } catch (error) {
        return {
            error: 'Une erreur est survenue lors de la récupération des utilisateurs'
        };
    }
};

export const updateUserBalance = async (id: string, amount: number, token: string) => {
    try {
        const response = await fetch(`${API_URL}/api/users/${id}/balance`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ amount }),
        });
        if (!response.ok) {
            const data = await response.json();
            return { error: data.message || 'Une erreur est survenue lors de la modification du solde' };
        }
        return response.json();
    } catch (error) {
        return { error: 'Une erreur est survenue lors de la modification du solde' };
    }
};

export const deleteUser = async (id: string, token: string) => {
    try {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.json();
    } catch (error) {
        return { error: 'Une erreur est survenue lors de la suppression de l\'utilisateur' };
    }
};

export const promoteUser = async (id: string, token: string) => {
    try {
        const response = await fetch(`${API_URL}/api/admin/users/${id}/promote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('Erreur promotion:', data);
            return {
                error: data.message || 'Une erreur est survenue lors de la promotion de l\'utilisateur'
            };
        }
        return data;
    } catch (error) {
        console.error('Erreur promotion:', error);
        return {
            error: 'Une erreur est survenue lors de la promotion de l\'utilisateur'
        };
    }
};