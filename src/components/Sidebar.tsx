'use client';

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { getTranslation } from '../lib/il8n';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Sparkles,
  Trophy,
  Gift,
  Circle,
  Spade,
  Users,
  ShoppingCart,
  Star,
  Crown,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {
  const { state } = useApp();

  const t = (key: keyof typeof import('../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  const menuItems = [
    {
      id: 'new-games',
      label: t('newGames'),
      icon: Sparkles,
      color: 'text-green-400',
      bgColor: 'hover:bg-green-900/20'
    },
    {
      id: 'popular-slots',
      label: t('popularSlots'),
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'hover:bg-yellow-900/20',
      badge: 'HOT'
    },
    {
      id: 'drops-wins',
      label: t('dropsWins'),
      icon: Crown,
      color: 'text-purple-400',
      bgColor: 'hover:bg-purple-900/20'
    },
    {
      id: 'roulette',
      label: t('roulette'),
      icon: Circle,
      color: 'text-red-400',
      bgColor: 'hover:bg-red-900/20'
    },
    {
      id: 'blackjack',
      label: t('blackjack'),
      icon: Spade,
      color: 'text-gray-300',
      bgColor: 'hover:bg-gray-700'
    },
    {
      id: 'live-lobby',
      label: t('liveLobby'),
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'hover:bg-blue-900/20',
      badge: 'LIVE'
    },
    {
      id: 'buy-bonus',
      label: t('buyBonus'),
      icon: ShoppingCart,
      color: 'text-orange-400',
      bgColor: 'hover:bg-orange-900/20'
    }
  ];

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 h-full flex flex-col">
      {/* Casino Logo/Title */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-yellow-400">CasinoSim</h2>
            <p className="text-xs text-gray-400">Simulation Gaming</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start text-left h-12 px-3 ${
                isActive
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                  : `text-gray-300 ${item.bgColor}`
              }`}
              onClick={() => onCategoryChange(item.id)}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-yellow-400' : item.color}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <Badge
                  variant="outline"
                  className={`ml-2 text-xs ${
                    item.badge === 'HOT'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-green-600 text-white border-green-500'
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Section - Promotions */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-3 text-center">
          <Gift className="w-6 h-6 mx-auto mb-2 text-white" />
          <p className="text-sm font-bold text-white">{t('welcomeBonus')}</p>
          <p className="text-xs text-yellow-100">Up to ₺10,000</p>
        </div>
      </div>
    </div>
  );
}
