'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getTranslation } from '../../lib/il8n';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Slider } from '../../components/ui/slider';
import {
  Play,
  Pause,
  Settings,
  ArrowLeft,
  Zap,
  Crown,
  Volume2,
  VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SlotGameProps {
  gameId: string;
}

interface SpinResult {
  result: {
    reels: string[][];
    winLines: number[];
    multiplier: number;
    isBonus: boolean;
    freeSpins?: number;
  };
  winAmount: number;
  newBalance: number;
  netResult: number;
  rtp: number;
}

export default function SlotGame({ gameId }: SlotGameProps) {
  const { state, updateBalance } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [autoSpin, setAutoSpin] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);

  const t = (key: keyof typeof import('../../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  const gameNames = {
    'sweet-bonanza': t('sweetBonanza'),
    'gates-of-olympus': t('gatesOfOlympus'),
    'mammoth-gold': t('mammothGold')
  };

  const gameSymbols = {
    'sweet-bonanza': ['🍭', '🍇', '🍊', '🍋', '🍎', '🍓', '💰', '⭐', '💎'],
    'gates-of-olympus': ['⚡', '👑', '💎', '🏛️', '⚔️', '🛡️', '🏺', '💰', '⭐'],
    'mammoth-gold': ['🐘', '💰', '🏔️', '💎', '🌟', '🎯', '🏆', '⭐', '💵']
  };

  // Initialize reels
  useEffect(() => {
    const symbols = gameSymbols[gameId as keyof typeof gameSymbols] || gameSymbols['sweet-bonanza'];
    const initialReels: string[][] = [];

    for (let i = 0; i < 6; i++) {
      const reel: string[] = [];
      for (let j = 0; j < 5; j++) {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      initialReels.push(reel);
    }

    setReels(initialReels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Auto spin logic
  useEffect(() => {
    if (autoSpin && autoSpinCount > 0 && !isSpinning) {
      const timer = setTimeout(() => {
        handleSpin();
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpin, autoSpinCount, isSpinning]);

  const handleSpin = useCallback(async (buyBonus: boolean = false) => {
    if (isSpinning) return;

    const spinCost = buyBonus ? betAmount * 101 : betAmount; // Bonus costs 100x + bet
    if (state.user && state.user.balance < spinCost) {
      alert('Insufficient balance!');
      return;
    }

    setIsSpinning(true);
    setShowWin(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/games/slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId,
          betAmount,
          buyBonus
        })
      });

      if (response.ok) {
        const result: SpinResult = await response.json();

        // Animate reels spinning
        await animateReels(result.result.reels);

        setLastResult(result);
        updateBalance(result.newBalance);

        // Handle free spins
        if (result.result.isBonus && result.result.freeSpins) {
          setFreeSpinsRemaining(result.result.freeSpins);
        }

        // Show win animation if there's a win
        if (result.winAmount > 0) {
          setShowWin(true);
          setTimeout(() => setShowWin(false), 3000);
        }

        // Update auto spin count
        if (autoSpin && autoSpinCount > 0) {
          setAutoSpinCount(prev => prev - 1);
          if (autoSpinCount <= 1) {
            setAutoSpin(false);
          }
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Spin failed');
      }
    } catch (error) {
      console.error('Spin error:', error);
      alert('Network error occurred');
    } finally {
      setIsSpinning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betAmount, state.user, gameId, autoSpin, autoSpinCount, updateBalance, isSpinning]);

  const animateReels = async (newReels: string[][]) => {
    // Simple animation: show spinning symbols then reveal result
    const symbols = gameSymbols[gameId as keyof typeof gameSymbols] || gameSymbols['sweet-bonanza'];

    for (let i = 0; i < 20; i++) {
      const tempReels: string[][] = [];
      for (let r = 0; r < 6; r++) {
        const reel: string[] = [];
        for (let s = 0; s < 5; s++) {
          reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        tempReels.push(reel);
      }
      setReels(tempReels);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setReels(newReels);
  };

  const handleAutoSpin = (count: number) => {
    setAutoSpinCount(count);
    setAutoSpin(true);
  };

  const stopAutoSpin = () => {
    setAutoSpin(false);
    setAutoSpinCount(0);
  };

  const getWinMessage = () => {
    if (!lastResult || lastResult.winAmount === 0) return '';

    const multiplier = lastResult.winAmount / betAmount;
    if (multiplier >= 100) return t('megaWin');
    if (multiplier >= 50) return t('bigWin');
    return t('win');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {gameNames[gameId as keyof typeof gameNames]}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-gray-700 border-gray-600"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <div className="text-right">
            <div className="text-sm text-gray-400">Balance</div>
            <div className="text-lg font-bold text-yellow-400">
              {t('currency')}{state.user?.balance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              {/* Free Spins Indicator */}
              {freeSpinsRemaining > 0 && (
                <div className="text-center mb-4">
                  <Badge className="bg-yellow-600 text-black text-lg px-4 py-2">
                    Free Spins: {freeSpinsRemaining}
                  </Badge>
                </div>
              )}

              {/* Reels */}
              <div className="grid grid-cols-6 gap-2 mb-6 bg-gray-900 p-4 rounded-lg">
                {reels.map((reel, reelIndex) => (
                  <div key={reelIndex} className="space-y-2">
                    {reel.map((symbol, symbolIndex) => (
                      <motion.div
                        key={`${reelIndex}-${symbolIndex}`}
                        className={`
                          w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl
                          border-2 ${lastResult?.result.winLines.length && lastResult.winAmount > 0
                            ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                            : 'border-gray-600'
                          }
                        `}
                        animate={isSpinning ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                        transition={{ duration: 0.1, repeat: isSpinning ? Infinity : 0 }}
                      >
                        {symbol}
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Win Display */}
              <AnimatePresence>
                {showWin && lastResult && lastResult.winAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-center mb-6"
                  >
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      {getWinMessage()}
                    </div>
                    <div className="text-2xl text-white">
                      {t('currency')}{lastResult.winAmount.toLocaleString()}
                    </div>
                    {lastResult.result.multiplier > 1 && (
                      <div className="text-lg text-gray-400">
                        {lastResult.result.multiplier.toFixed(2)}x
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spin Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={() => handleSpin()}
                  disabled={isSpinning || (autoSpin && autoSpinCount > 0)}
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-8"
                >
                  {isSpinning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      Spinning...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {t('spin')} ({t('currency')}{betAmount})
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => handleSpin(true)}
                  disabled={isSpinning || (autoSpin && autoSpinCount > 0)}
                  variant="outline"
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 border-purple-500 text-white"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Buy Bonus ({t('currency')}{(betAmount * 100).toLocaleString()})
                </Button>

                {autoSpin && autoSpinCount > 0 ? (
                  <Button
                    onClick={stopAutoSpin}
                    variant="outline"
                    size="lg"
                    className="bg-red-600 hover:bg-red-700 border-red-500 text-white"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Stop ({autoSpinCount})
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAutoSpin(10)}
                    disabled={isSpinning}
                    variant="outline"
                    size="lg"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Auto 10x
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
                disabled={isSpinning}
              />

              <div className="grid grid-cols-3 gap-2">
                {[10, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={isSpinning || (state.user?.balance || 0) < amount}
                    variant="outline"
                    size="sm"
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    {t('currency')}{amount}
                  </Button>
                ))}
              </div>

              <Button
                onClick={() => setBetAmount(Math.min(state.user?.balance || 0, 1000))}
                disabled={isSpinning}
                variant="outline"
                className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                Max Bet
              </Button>
            </CardContent>
          </Card>

          {/* Auto Spin */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Auto Spin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[10, 25, 50, 100].map((count) => (
                <Button
                  key={count}
                  onClick={() => handleAutoSpin(count)}
                  disabled={isSpinning || autoSpin}
                  variant="outline"
                  className="w-full bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  {count}x Spins
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Game Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">RTP:</span>
                <span className="text-white">{lastResult?.rtp || '96.5'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Win:</span>
                <span className="text-yellow-400">
                  {lastResult ? `${t('currency')}${lastResult.winAmount.toLocaleString()}` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Session:</span>
                <span className={lastResult && lastResult.netResult >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {lastResult ? `${t('currency')}${lastResult.netResult.toLocaleString()}` : '₺0'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
