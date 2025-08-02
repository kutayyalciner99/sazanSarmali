'use client';

import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getTranslation } from '../../lib/il8n';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import { ArrowLeft, Spade, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: string;
  value: number;
}

interface GameState {
  playerCards: PlayingCard[];
  dealerCards: PlayingCard[];
  dealerHiddenCard?: PlayingCard;
  playerScore: number;
  dealerScore?: number;
  betAmount: number;
  gameId: string;
  isGameActive: boolean;
  result?: 'win' | 'lose' | 'push';
  winAmount?: number;
  multiplier?: number;
}

export default function BlackjackGame() {
  const { state, updateBalance } = useApp();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const t = (key: keyof typeof import('../../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  const getSuitSymbol = (suit: PlayingCard['suit']): string => {
    const symbols = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    };
    return symbols[suit];
  };

  const getSuitColor = (suit: PlayingCard['suit']): string => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-white';
  };

  const makeApiCall = async (action: string, additionalData = {}) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/games/blackjack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        action,
        betAmount,
        gameState,
        ...additionalData
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Game action failed');
    }

    return response.json();
  };

  const startNewGame = async () => {
    if (state.user && state.user.balance < betAmount) {
      alert('Insufficient balance!');
      return;
    }

    setIsLoading(true);
    setShowResult(false);

    try {
      const result = await makeApiCall('start');

      setGameState({
        playerCards: result.playerCards,
        dealerCards: result.dealerCards,
        dealerHiddenCard: result.dealerHiddenCard,
        playerScore: result.playerScore,
        betAmount: result.betAmount,
        gameId: result.gameId,
        isGameActive: true
      });

      // Update balance after bet is deducted
      updateBalance(state.user!.balance - betAmount);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to start game');
    } finally {
      setIsLoading(false);
    }
  };

  const hit = async () => {
    if (!gameState || !gameState.isGameActive) return;

    setIsLoading(true);

    try {
      const result = await makeApiCall('hit');

      setGameState(prev => ({
        ...prev!,
        playerCards: result.playerCards,
        playerScore: result.playerScore,
        isGameActive: !result.isBust
      }));

      if (result.isBust) {
        setShowResult(true);
        setTimeout(() => setShowResult(false), 3000);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Hit action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const stand = async () => {
    if (!gameState || !gameState.isGameActive) return;

    setIsLoading(true);

    try {
      const result = await makeApiCall('stand');

      setGameState(prev => ({
        ...prev!,
        dealerCards: result.dealerCards,
        dealerScore: result.dealerScore,
        result: result.result,
        winAmount: result.winAmount,
        multiplier: result.multiplier,
        isGameActive: false
      }));

      updateBalance(result.newBalance);
      setShowResult(true);
      setTimeout(() => setShowResult(false), 4000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Stand action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const doubleDown = async () => {
    if (!gameState || gameState.playerCards.length !== 2 || !gameState.isGameActive) return;
    if (state.user && state.user.balance < gameState.betAmount) {
      alert('Insufficient balance to double!');
      return;
    }

    setIsLoading(true);

    try {
      const result = await makeApiCall('double');

      setGameState(prev => ({
        ...prev!,
        playerCards: result.playerCards,
        playerScore: result.playerScore,
        dealerCards: result.dealerCards,
        dealerScore: result.dealerScore,
        result: result.result,
        winAmount: result.winAmount,
        multiplier: result.multiplier,
        betAmount: prev!.betAmount * 2,
        isGameActive: false
      }));

      updateBalance(result.newBalance);
      setShowResult(true);
      setTimeout(() => setShowResult(false), 4000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Double action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getResultMessage = () => {
    if (!gameState?.result) return '';

    switch (gameState.result) {
      case 'win':
        if (gameState.playerScore === 21 && gameState.playerCards.length === 2) {
          return 'BLACKJACK! 🎉';
        }
        return t('win');
      case 'lose':
        return gameState.playerScore > 21 ? 'BUST!' : t('lose');
      case 'push':
        return 'PUSH (Tie)';
      default:
        return '';
    }
  };

  const renderCard = (card: PlayingCard, index: number, isHidden = false) => (
    <motion.div
      key={`${card.suit}-${card.rank}-${index}`}
      initial={{ opacity: 0, y: -50, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`
        w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center relative
        ${isHidden
          ? 'bg-blue-600 border-blue-500'
          : 'bg-white border-gray-300 text-black'
        }
      `}
    >
      {isHidden ? (
        <div className="text-white font-bold">🂠</div>
      ) : (
        <>
          <div className="text-sm font-bold">{card.rank}</div>
          <div className={`text-xl ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>
          <div className="text-xs font-bold absolute bottom-1 right-1 rotate-180">
            {card.rank}
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Spade className="w-6 h-6 mr-2" />
            {t('blackjack')}
          </h1>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-400">Balance</div>
          <div className="text-lg font-bold text-yellow-400">
            {t('currency')}{state.user?.balance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              {/* Dealer Area */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Dealer</h3>
                  {gameState && (
                    <Badge variant="outline" className="bg-gray-700 text-white">
                      {gameState.dealerScore !== undefined
                        ? `Score: ${gameState.dealerScore}`
                        : 'Hidden'
                      }
                    </Badge>
                  )}
                </div>

                <div className="flex space-x-2 min-h-[100px] items-center">
                  {gameState?.dealerCards.map((card, index) =>
                    renderCard(card, index)
                  )}
                  {gameState?.dealerHiddenCard && gameState.isGameActive &&
                    renderCard(gameState.dealerHiddenCard, gameState.dealerCards.length, true)
                  }
                </div>
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {showResult && gameState?.result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-center mb-6"
                  >
                    <div className={`text-4xl font-bold mb-2 ${
                      gameState.result === 'win' ? 'text-green-400' :
                      gameState.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {getResultMessage()}
                    </div>
                    {gameState.winAmount !== undefined && (
                      <div className="text-2xl text-white">
                        {gameState.winAmount > 0
                          ? `+${t('currency')}${gameState.winAmount.toLocaleString()}`
                          : `${t('currency')}0`
                        }
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Player Area */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Your Hand</h3>
                  {gameState && (
                    <Badge variant="outline" className={`${
                      gameState.playerScore > 21 ? 'bg-red-600 text-white' :
                      gameState.playerScore === 21 ? 'bg-green-600 text-white' :
                      'bg-gray-700 text-white'
                    }`}>
                      Score: {gameState.playerScore}
                    </Badge>
                  )}
                </div>

                <div className="flex space-x-2 min-h-[100px] items-center">
                  {gameState?.playerCards.map((card, index) =>
                    renderCard(card, index)
                  )}
                </div>
              </div>

              {/* Game Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!gameState || !gameState.isGameActive ? (
                  <Button
                    onClick={startNewGame}
                    disabled={isLoading}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        New Game ({t('currency')}{betAmount})
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={hit}
                      disabled={isLoading}
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Hit
                    </Button>

                    <Button
                      onClick={stand}
                      disabled={isLoading}
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Stand
                    </Button>

                    {gameState.playerCards.length === 2 && (
                      <Button
                        onClick={doubleDown}
                        disabled={isLoading || (state.user?.balance || 0) < gameState.betAmount}
                        size="lg"
                        variant="outline"
                        className="bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white font-bold"
                      >
                        Double
                      </Button>
                    )}
                  </>
                )}

                {gameState && !gameState.isGameActive && (
                  <Button
                    onClick={() => setGameState(null)}
                    variant="outline"
                    size="lg"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Bet Control */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Bet Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {t('currency')}{betAmount}
                </div>
              </div>

              <Slider
                value={[betAmount]}
                onValueChange={(value) => setBetAmount(value[0])}
                max={Math.min(1000, state.user?.balance || 1000)}
                min={1}
                step={1}
                className="w-full"
                disabled={gameState?.isGameActive}
              />

              <div className="grid grid-cols-2 gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={gameState?.isGameActive || (state.user?.balance || 0) < amount}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    {t('currency')}{amount}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
              <div>• Get as close to 21 without going over</div>
              <div>• Dealer hits on soft 17</div>
              <div>• Blackjack pays 3:2</div>
              <div>• Regular win pays 1:1</div>
              <div>• Double down on first 2 cards</div>
              <div>• Aces count as 1 or 11</div>
            </CardContent>
          </Card>

          {/* Game Stats */}
          {gameState && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Current Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bet:</span>
                  <span className="text-white">{t('currency')}{gameState.betAmount}</span>
                </div>
                {gameState.winAmount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win:</span>
                    <span className="text-green-400">
                      {t('currency')}{gameState.winAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
