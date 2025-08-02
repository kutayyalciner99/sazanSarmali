'use client';

import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowLeft, Circle } from 'lucide-react';
import Link from 'next/link';

export default function RouletteGame() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Circle className="w-6 h-6 mr-2 text-red-400" />
            European Roulette
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Roulette - Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-4">Under Development</h2>
            <p className="text-gray-400 mb-6">
              The European Roulette game is currently being developed. It will feature:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-md mx-auto">
              <div className="text-gray-300">
                ✅ European wheel (37 numbers)<br/>
                ✅ Multiple bet types<br/>
                ✅ Spinning wheel animation
              </div>
              <div className="text-gray-300">
                ✅ Number, color, odd/even bets<br/>
                ✅ Real-time balance updates<br/>
                ✅ Professional table layout
              </div>
            </div>
            <Link href="/" className="inline-block mt-8">
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
                Explore Other Games
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
