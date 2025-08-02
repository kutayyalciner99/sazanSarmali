'use client';

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { getTranslation } from '../lib/il8n';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import WinnersTicker from '../components/WinnersTicker';
import GameGrid from '../components/GameGrid';

export default function HomePage() {
  const { state } = useApp();
  const [activeCategory, setActiveCategory] = useState('popular-slots');

  const t = (key: keyof typeof import('../lib/il8n').translations.tr) =>
    getTranslation(key, state.language);

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <GameGrid category={activeCategory} />
          </div>
        </main>
      </div>
      <WinnersTicker />
    </div>
  );
}
