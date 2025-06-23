'use client';

import { useEffect, useState } from 'react';
import GameCard from "@/components/GameCard";
import { HeroSection } from "@/components/HeroSection";
import { useGames } from '@/utils/apiFonctions';
import { Game } from '@/utils/types';
import { useCache } from '@/hooks/useCache';

export default function Home() {
  const { data: cachedGames, etag, updateCache } = useCache<Game[]>('games');
  const [games, setGames] = useState<Game[]>(cachedGames || []);

  const { data: gamesData, error: gamesError, isLoading, getGames } = useGames();

  useEffect(() => {
    const fetchGames = async () => {
      if (cachedGames && cachedGames.length > 0) {
        setGames(cachedGames);
        return;
      }

      try {
        const response = await getGames(etag);

        if (response && !response.notModified && response.data) {
          updateCache(response.data, response.etag || '');
          setGames(response.data);
        } else if (response && response.notModified && cachedGames) {
          setGames(cachedGames);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
      }
    };

    fetchGames();
  }, [cachedGames, etag, updateCache, getGames]);


  useEffect(() => {
    if (gamesData && gamesData.length > 0) {
      setGames(gamesData);
    }
  }, [gamesData]);

  if (isLoading && games.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#64ffda] text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section id="games" className="py-20 px-4 bg-[#020c1b]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[#64ffda] text-center mb-12">
            Nos Jeux
          </h2>
          {gamesError && (
            <div className="text-red-500 text-center mb-4">
              Une erreur est survenue lors de la récupération des jeux: {gamesError.message}
            </div>
          )}
          <div className="flex items-center justify-center gap-8 flex-wrap max-w-7xl mx-auto">
            {games.map((game) => (
              <GameCard key={game.id} {...game} imageUrl="/coinflip.gif" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
