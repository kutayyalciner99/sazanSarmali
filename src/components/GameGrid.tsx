'use client';

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { getTranslation } from '../lib/il8n';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Play,
  Star,
  Crown,
  Zap,
  Diamond,
  Circle,
  Spade,
  Users,
  ShoppingCart
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GameGridProps {
  category: string;
}

export default function GameGrid({ category }: GameGridProps) {
  const { state } = useApp();
  const router = useRouter();

  const t = (key: keyof typeof import('../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  const slotGames = [
    {
      id: 'sweet-bonanza',
      name: t('sweetBonanza'),
      image: '🍭',
      provider: 'Pragmatic Play',
      rtp: '96.51%',
      volatility: 'High',
      maxWin: '21,175x',
      features: ['Tumble', 'Free Spins', 'Ante Bet']
    },
    {
      id: 'gates-of-olympus',
      name: t('gatesOfOlympus'),
      image: '⚡',
      provider: 'Pragmatic Play',
      rtp: '96.50%',
      volatility: 'High',
      maxWin: '5,000x',
      features: ['Multipliers', 'Free Spins', 'Ante Bet']
    },
    {
      id: 'mammoth-gold',
      name: t('mammothGold'),
      image: '🐘',
      provider: 'Pragmatic Play',
      rtp: '96.77%',
      volatility: 'Medium',
      maxWin: '10,000x',
      features: ['Mega Symbols', 'Free Spins', 'Wild']
    }
  ];

  const tableGames = [
    {
      id: 'blackjack',
      name: t('blackjack'),
      image: '♠️',
      provider: 'CasinoSim',
      players: '1 vs Dealer',
      minBet: '₺10',
      maxBet: '₺50,000'
    },
    {
      id: 'roulette',
      name: t('roulette'),
      image: '🎯',
      provider: 'CasinoSim',
      players: 'European Style',
      minBet: '₺5',
      maxBet: '₺100,000'
    }
  ];

  const handleGameClick = (gameId: string) => {
    if (!state.isAuthenticated) {
      // Could show a login prompt here
      return;
    }
    router.push(`/games/${gameId}`);
  };

  const renderSlotCard = (game: {
    id: string;
    name: string;
    image: string;
    provider: string;
    rtp: string;
    volatility: string;
    maxWin: string;
    features: string[];
  }) => (
    <Card key={game.id} className="bg-gray-800 border-gray-700 hover:border-yellow-600/50 transition-all duration-200 group cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          {/* Game Image/Icon */}
          <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-6xl rounded-t-lg">
            {game.image}
          </div>

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-t-lg">
            <Button
              onClick={() => handleGameClick(game.id)}
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
            >
              <Play className="w-5 h-5 mr-2" />
              Play Now
            </Button>
          </div>

          {/* RTP Badge */}
          <Badge className="absolute top-2 right-2 bg-green-600 text-white">
            RTP {game.rtp}
          </Badge>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-white mb-2">{game.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{game.provider}</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Max Win:</span>
              <span className="text-yellow-400 font-bold">{game.maxWin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volatility:</span>
              <span className="text-white">{game.volatility}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {game.features.map((feature: string) => (
              <Badge key={feature} variant="outline" className="text-xs bg-gray-700 text-gray-300">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTableCard = (game: {
    id: string;
    name: string;
    image: string;
    provider: string;
    players: string;
    minBet: string;
    maxBet: string;
  }) => (
    <Card key={game.id} className="bg-gray-800 border-gray-700 hover:border-yellow-600/50 transition-all duration-200 group cursor-pointer">
      <CardContent className="p-0">
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-6xl rounded-t-lg">
            {game.image}
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-t-lg">
            <Button
              onClick={() => handleGameClick(game.id)}
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
            >
              <Play className="w-5 h-5 mr-2" />
              Play Now
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-white mb-2">{game.name}</h3>
          <p className="text-gray-400 text-sm mb-3">{game.provider}</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{game.players}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Min Bet:</span>
              <span className="text-green-400">{game.minBet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Bet:</span>
              <span className="text-red-400">{game.maxBet}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderComingSoon = (title: string, description: string) => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </div>
  );

  const getContent = () => {
    switch (category) {
      case 'popular-slots':
      case 'new-games':
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-400" />
              {category === 'popular-slots' ? t('popularSlots') : t('newGames')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {slotGames.map(renderSlotCard)}
            </div>
          </div>
        );

      case 'blackjack':
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Spade className="w-6 h-6 mr-2 text-gray-300" />
              {t('blackjack')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tableGames.filter(game => game.id === 'blackjack').map(renderTableCard)}
            </div>
          </div>
        );

      case 'roulette':
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Circle className="w-6 h-6 mr-2 text-red-400" />
              {t('roulette')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tableGames.filter(game => game.id === 'roulette').map(renderTableCard)}
            </div>
          </div>
        );

      case 'drops-wins':
        return renderComingSoon('Drops & Wins', 'Exciting tournaments coming soon!');

      case 'live-lobby':
        return renderComingSoon('Live Casino', 'Live dealers and chat coming soon!');

      case 'buy-bonus':
        return renderComingSoon('Bonus Buy', 'Purchase bonus features coming soon!');

      default:
        return renderComingSoon('Coming Soon', 'This category is under development.');
    }
  };

  return (
    <div className="space-y-6">
      {!state.isAuthenticated && (
        <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4 text-center">
          <p className="text-yellow-400">
            Please log in to play games and track your progress!
          </p>
        </div>
      )}

      {getContent()}
    </div>
  );
}
