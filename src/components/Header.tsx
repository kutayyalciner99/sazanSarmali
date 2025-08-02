'use client';

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { getTranslation } from '../lib/il8n';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { Globe, User, LogOut, Gift } from 'lucide-react';
import AuthDialog from './AuthDialog';

export default function Header() {
  const { state, dispatch, logout, claimWelcomeBonus, claimDailyBonus } = useApp();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const t = (key: keyof typeof import('../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  const handleLanguageChange = (lang: 'tr' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  const handleClaimWelcomeBonus = async () => {
    const success = await claimWelcomeBonus();
    if (success) {
      // Could show a toast notification here
    }
  };

  const handleClaimDailyBonus = async () => {
    const success = await claimDailyBonus();
    if (success) {
      // Could show a toast notification here
    }
  };

  const canClaimDailyBonus = () => {
    if (!state.user?.lastBonusClaim) return true;

    const now = new Date();
    const lastClaim = new Date(state.user.lastBonusClaim);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastClaimDate = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());

    return lastClaimDate.getTime() !== today.getTime();
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-yellow-400">🎰 CasinoSim</h1>
        </div>

        {/* Jackpots */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">{t('jackpots')}:</span>
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-black text-white border-red-500">
              ♠ {t('currency')}{state.jackpots.spades?.toLocaleString() || '0'}
            </Badge>
            <Badge variant="outline" className="bg-black text-red-500 border-red-500">
              ♥ {t('currency')}{state.jackpots.hearts?.toLocaleString() || '0'}
            </Badge>
            <Badge variant="outline" className="bg-black text-red-500 border-red-500">
              ♦ {t('currency')}{state.jackpots.diamonds?.toLocaleString() || '0'}
            </Badge>
            <Badge variant="outline" className="bg-black text-white border-gray-600">
              ♣ {t('currency')}{state.jackpots.clubs?.toLocaleString() || '0'}
            </Badge>
          </div>
        </div>

        {/* Right side - Language switcher and user info */}
        <div className="flex items-center space-x-4">
          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                <Globe className="w-4 h-4 mr-2" />
                {state.language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem
                onClick={() => handleLanguageChange('tr')}
                className="hover:bg-gray-700 cursor-pointer"
              >
                🇹🇷 Türkçe
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange('en')}
                className="hover:bg-gray-700 cursor-pointer"
              >
                🇺🇸 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {state.isAuthenticated && state.user ? (
            <div className="flex items-center space-x-4">
              {/* Welcome bonus button */}
              {!state.user.hasWelcomeBonus && (
                <Button
                  onClick={handleClaimWelcomeBonus}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {t('welcomeBonus')}
                </Button>
              )}

              {/* Daily bonus button */}
              {canClaimDailyBonus() && (
                <Button
                  onClick={handleClaimDailyBonus}
                  variant="outline"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 border-green-500 text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {t('dailyBonus')}
                </Button>
              )}

              {/* Balance */}
              <div className="text-right">
                <div className="text-sm text-gray-400">{t('balance')}</div>
                <div className="text-lg font-bold text-yellow-400">
                  {t('currency')}{state.user.balance.toLocaleString()}
                </div>
              </div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-700">
                        {state.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 w-56" align="end">
                  <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="hover:bg-gray-700 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Feeling Lucky Button */}
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
                ✨ {t('feelingLucky')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAuthClick('login')}
                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                {t('login')}
              </Button>
              <Button
                size="sm"
                onClick={() => handleAuthClick('register')}
                className="bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                {t('register')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </header>
  );
}
