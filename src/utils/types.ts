export interface User {
    id: string;
    username: string;
    virtual_balance: number;
    is_admin: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    username: string;
}

export interface GameResult {
    id: string;
    userId: string;
    gameType: 'coinflip' | 'slots' | 'blackjack';
    bet: number;
    result: boolean;
    profit: number;
    createdAt: string;
}

export interface CoinFlipResult extends GameResult {
    gameType: 'coinflip';
    choice: 'heads' | 'tails';
    outcome: 'heads' | 'tails';
}

export interface UserStats {
    totalGames?: number;
    totalWins?: number;
    totalLosses?: number;
    totalProfit?: number;
    winRate?: number;
    biggestWin?: number;
    biggestLoss?: number;
    virtual_balance: number;
}

export interface Game {
    id: number;
    name: string;
    description: string;
}

export interface PlayHistory {
    id: number;
    user_id: number;
    game_id: number;
    bet: number;
    result: boolean;
    created_at: string;
    game_name: string;
}