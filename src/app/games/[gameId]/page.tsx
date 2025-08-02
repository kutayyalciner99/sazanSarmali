'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import SlotGame from '../../../components/games/SlotGame';
import BlackjackGame from '../../../components/games/BlackjackGame';
import RouletteGame from '../../../components/games/RouletteGame';
import { useApp } from '../../../contexts/AppContext';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-gray-400 mb-6">Please log in to play games</p>
          <Link href="/">
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderGame = () => {
    switch (gameId) {
      case 'sweet-bonanza':
      case 'gates-of-olympus':
      case 'mammoth-gold':
        return <SlotGame gameId={gameId} />;
      case 'blackjack':
        return <BlackjackGame />;
      case 'roulette':
        return <RouletteGame />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Game Not Found</h2>
            <p className="text-gray-400 mb-6">The game "{gameId}" is not available.</p>
            <Link href="/">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {renderGame()}
    </div>
  );
}
