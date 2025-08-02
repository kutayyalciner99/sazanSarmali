'use client';

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { getTranslation } from '../lib/il8n';
import { Badge } from '../components/ui/badge';
import { Trophy } from 'lucide-react';

export default function WinnersTicker() {
  const { state } = useApp();

  const t = (key: keyof typeof import('../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  if (!state.recentWinners.length) {
    return null;
  }

  return (
    <div className="bg-gray-900 border-t border-gray-700 py-3 overflow-hidden">
      <div className="flex items-center space-x-4 px-4">
        <div className="flex items-center space-x-2 text-yellow-400 flex-shrink-0">
          <Trophy className="w-5 h-5" />
          <span className="font-bold text-sm">{t('recentWinners')}:</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex animate-scroll space-x-8">
            {[...state.recentWinners, ...state.recentWinners].map((winner, index) => (
              <div
                key={`${winner.id}-${index}`}
                className="flex items-center space-x-3 flex-shrink-0 text-sm"
              >
                <span className="text-green-400 font-bold">{winner.username}</span>
                <span className="text-gray-400">won</span>
                <Badge variant="outline" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                  {t('currency')}{winner.amount.toLocaleString()}
                </Badge>
                <span className="text-gray-400">on</span>
                <span className="text-blue-400">{winner.game}</span>
                <span className="text-gray-600">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
