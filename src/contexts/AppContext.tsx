'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, Language } from '../lib/types';
import { verifyToken } from '../lib/auth';

interface AppState extends AuthState {
  jackpots: { [key: string]: number };
  recentWinners: Array<{
    id: string;
    username: string;
    game: string;
    amount: number;
    timestamp: Date;
  }>;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'UPDATE_JACKPOTS'; payload: { [key: string]: number } }
  | { type: 'UPDATE_WINNERS'; payload: Array<{
      id: string;
      username: string;
      game: string;
      amount: number;
      timestamp: Date;
    }> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  language: 'tr',
  jackpots: {
    spades: 25000,
    hearts: 18750,
    diamonds: 32100,
    clubs: 14500
  },
  recentWinners: [],
  isLoading: true
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (amount: number) => void;
  claimWelcomeBonus: () => Promise<boolean>;
  claimDailyBonus: () => Promise<boolean>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'UPDATE_BALANCE':
      return {
        ...state,
        user: state.user ? { ...state.user, balance: action.payload } : null
      };
    case 'UPDATE_JACKPOTS':
      return { ...state, jackpots: action.payload };
    case 'UPDATE_WINNERS':
      return { ...state, recentWinners: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const user = await response.json();
            dispatch({ type: 'SET_USER', payload: user });
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'SET_LOADING', payload: false });
          }
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Fetch jackpots and winners periodically
  useEffect(() => {
    const fetchJackpotsAndWinners = async () => {
      try {
        const [jackpotsRes, winnersRes] = await Promise.all([
          fetch('/api/jackpots'),
          fetch('/api/winners')
        ]);

        if (jackpotsRes.ok) {
          const jackpots = await jackpotsRes.json();
          dispatch({ type: 'UPDATE_JACKPOTS', payload: jackpots });
        }

        if (winnersRes.ok) {
          const winners = await winnersRes.json();
          dispatch({ type: 'UPDATE_WINNERS', payload: winners });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchJackpotsAndWinners();
    const interval = setInterval(fetchJackpotsAndWinners, 5000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem('token', token);
        dispatch({ type: 'SET_USER', payload: user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      if (response.ok) {
        const { user, token } = await response.json();
        localStorage.setItem('token', token);
        dispatch({ type: 'SET_USER', payload: user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateBalance = (amount: number) => {
    dispatch({ type: 'UPDATE_BALANCE', payload: amount });
  };

  const claimWelcomeBonus = async (): Promise<boolean> => {
    if (!state.user || state.user.hasWelcomeBonus) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bonus/welcome', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const { newBalance } = await response.json();
        dispatch({
          type: 'SET_USER',
          payload: { ...state.user, balance: newBalance, hasWelcomeBonus: true }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Welcome bonus error:', error);
      return false;
    }
  };

  const claimDailyBonus = async (): Promise<boolean> => {
    if (!state.user) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bonus/daily', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const { newBalance, lastBonusClaim } = await response.json();
        dispatch({
          type: 'SET_USER',
          payload: { ...state.user, balance: newBalance, lastBonusClaim: new Date(lastBonusClaim) }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Daily bonus error:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      login,
      register,
      logout,
      updateBalance,
      claimWelcomeBonus,
      claimDailyBonus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
