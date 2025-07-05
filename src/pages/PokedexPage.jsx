// src/pages/PokedexPage.jsx
import { useState, useEffect, useMemo } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const getPokemonImageUrl = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

function PokedexPage() {
  useDocumentTitle("Pokédex | Who's That Pokémon?");

  // --- STATE MANAGEMENT ---
  const [allPokemon, setAllPokemon] = useState([]);
  const [unlockedPokemon] = useState(() => new Set(JSON.parse(localStorage.getItem('unlockedPokemon') || '[]')));
  const [genMap, setGenMap] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [activeGen, setActiveGen] = useState('all');
  const [showRevealedOnly, setShowRevealedOnly] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pokedexResponse = await fetch('https://pokeapi.co/api/v2/pokedex/1/');
        const pokedexData = await pokedexResponse.json();
        pokedexData.pokemon_entries.sort((a, b) => a.entry_number - b.entry_number);
        setAllPokemon(pokedexData.pokemon_entries);

        const genPromises = [...Array(9).keys()].map(i => fetch(`https://pokeapi.co/api/v2/generation/${i + 1}/`).then(res => res.json()));
        const genResults = await Promise.all(genPromises);
        
        const pokemonToGenMap = new Map();
        genResults.forEach((genData, index) => {
          genData.pokemon_species.forEach(species => {
            pokemonToGenMap.set(species.name, index + 1);
          });
        });
        setGenMap(pokemonToGenMap);

      } catch (error) {
        console.error("Gagal mengambil data Pokédex:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- MEMOIZED LOGIC UNTUK FILTER & STATISTIK ---
  const { filteredPokemon, stats } = useMemo(() => {
    let filtered = allPokemon;

    if (activeGen !== 'all') {
      filtered = filtered.filter(p => genMap.get(p.pokemon_species.name) === activeGen);
    }
    
    if (showRevealedOnly) {
      filtered = filtered.filter(p => unlockedPokemon.has(p.pokemon_species.name));
    }

    const totalInView = filtered.length;
    const unlockedInView = filtered.filter(p => unlockedPokemon.has(p.pokemon_species.name)).length;
    const percentage = totalInView > 0 ? Math.round((unlockedInView / totalInView) * 100) : 0;

    return { 
      filteredPokemon: filtered,
      stats: { total: totalInView, unlocked: unlockedInView, percentage }
    };
  }, [allPokemon, unlockedPokemon, activeGen, showRevealedOnly, genMap]);

  // --- RENDER UI ---
  if (isLoading) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><p className="text-2xl">Loading Pokédex...</p></div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-yellow-400" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Pokédex
          </h1>
          <p className="text-gray-400 mt-2">Pokémon yang berhasil kamu tebak akan terbuka di sini!</p>
          <Link to="/" className="text-blue-400 hover:underline mt-2 inline-block">&larr; Kembali ke Home</Link>
        </div>

        {/* --- UI UNTUK FILTER BAR & STATISTIK (VERSI REVISI) --- */}
        <div className="sticky top-4 z-10 bg-gray-800 bg-opacity-90 backdrop-blur-sm p-4 rounded-xl mb-6 border border-gray-700 flex flex-col gap-4">
          {/* Baris untuk filter generasi dan toggle */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['all', 1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
              <button 
                key={gen}
                onClick={() => setActiveGen(gen)}
                className={`px-3 py-1.5 text-sm font-bold rounded-full transition-colors ${activeGen === gen ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {gen === 'all' ? 'All' : `Gen ${gen}`}
              </button>
            ))}
            <div className="w-full sm:w-auto h-px sm:h-6 sm:w-px bg-gray-600 my-2 sm:mx-4"></div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm">Revealed Only</span>
              <button onClick={() => setShowRevealedOnly(prev => !prev)} className={`w-14 h-7 rounded-full p-1 flex items-center transition-colors ${showRevealedOnly ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'}`}>
                <motion.div layout transition={{ type: 'spring', stiffness: 700, damping: 30 }} className="w-5 h-5 bg-white rounded-full" />
              </button>
            </div>
          </div>
          
          {/* Baris untuk statistik */}
          <div className="border-t border-gray-700 pt-3">
            <h3 className="text-md font-bold text-center text-gray-300">
              Progress {activeGen === 'all' ? 'Keseluruhan' : `Generasi ${activeGen}`}
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <p className="font-mono text-lg whitespace-nowrap">
                <span className="text-green-400">{stats.unlocked}</span>/{stats.total}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-5 relative">
                <div className="bg-yellow-400 h-5 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
                <span className="absolute inset-0 flex justify-center items-center text-xs font-bold text-gray-900">
                  {stats.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Grid Pokémon --- */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {filteredPokemon.map(pokemon => {
            const isUnlocked = unlockedPokemon.has(pokemon.pokemon_species.name);
            const pokemonId = pokemon.entry_number;

            return (
              <div key={pokemonId} className="bg-gray-800 p-2 rounded-lg flex flex-col items-center text-center transition-transform hover:scale-105 hover:bg-gray-700">
                <p className="font-mono text-sm text-gray-400">#{String(pokemonId).padStart(3, '0')}</p>
                <div className="w-24 h-24 flex items-center justify-center">
                  <img src={getPokemonImageUrl(pokemonId)} alt={isUnlocked ? pokemon.pokemon_species.name : "Unknown Pokémon"} className="w-full h-full object-contain transition-all duration-300" style={{ filter: isUnlocked ? 'none' : 'brightness(0)' }}/>
                </div>
                <p className="text-xs sm:text-sm font-bold capitalize mt-1 h-8 flex items-center justify-center">
                  {isUnlocked ? pokemon.pokemon_species.name.replace('-', ' ') : '???'}
                </p>
              </div>
            );
          })}
        </div>
        {filteredPokemon.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">Tidak ada Pokémon untuk ditampilkan.</p>
            <p className="text-gray-600">Coba ubah filter atau mainkan game untuk membuka Pokémon baru!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PokedexPage;
