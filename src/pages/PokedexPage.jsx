// src/pages/PokedexPage.jsx
import { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Link } from 'react-router-dom';

// URL untuk gambar Pokémon, lebih cepat daripada fetch satu per satu
const getPokemonImageUrl = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

function PokedexPage() {
  useDocumentTitle("Pokédex | Who's That Pokémon?");

  // --- STATE MANAGEMENT ---
  const [allPokemon, setAllPokemon] = useState([]); // Daftar master semua Pokémon
  const [unlockedPokemon, setUnlockedPokemon] = useState(new Set()); // Daftar Pokémon yg sudah terbuka (menggunakan Set agar lebih cepat)
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil daftar master semua Pokémon dari National Pokédex
        const response = await fetch('https://pokeapi.co/api/v2/pokedex/1/');
        const data = await response.json();
        // Urutkan berdasarkan nomor pokedex
        data.pokemon_entries.sort((a, b) => a.entry_number - b.entry_number);
        setAllPokemon(data.pokemon_entries);

        // 2. Baca data Pokémon yang sudah terbuka dari localStorage
        const unlockedData = JSON.parse(localStorage.getItem('unlockedPokemon') || '[]');
        setUnlockedPokemon(new Set(unlockedData));

      } catch (error) {
        console.error("Gagal mengambil data Pokédex:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Dependensi kosong agar hanya berjalan sekali

  // --- RENDER UI ---
  if (isLoading) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><p className="text-2xl">Loading Pokédex...</p></div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Pokédex
          </h1>
          <p className="text-gray-400 mt-2">Pokémon yang berhasil kamu tebak akan terbuka di sini!</p>
          <p className="font-bold text-lg mt-1">Terbuka: <span className="text-green-400">{unlockedPokemon.size}</span> / <span className="text-red-400">{allPokemon.length}</span></p>
          <Link to="/" className="text-blue-400 hover:underline mt-4 inline-block">&larr; Kembali ke Home</Link>
        </div>

        {/* Filter akan ditambahkan di sini nanti */}

        {/* Grid untuk menampilkan semua Pokémon */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {allPokemon.map(pokemon => {
            const isUnlocked = unlockedPokemon.has(pokemon.pokemon_species.name);
            const pokemonId = pokemon.entry_number;

            return (
              <div key={pokemonId} className="bg-gray-800 p-2 rounded-lg flex flex-col items-center text-center">
                <p className="font-mono text-sm text-gray-400">#{String(pokemonId).padStart(4, '0')}</p>
                <div className="w-24 h-24 flex items-center justify-center">
                  <img 
                    src={getPokemonImageUrl(pokemonId)} 
                    alt={isUnlocked ? pokemon.pokemon_species.name : "Unknown Pokémon"} 
                    className="w-full h-full object-contain"
                    style={{ filter: isUnlocked ? 'none' : 'brightness(0)' }}
                  />
                </div>
                <p className="text-xs sm:text-sm font-bold capitalize mt-1 h-8 flex items-center">
                  {isUnlocked ? pokemon.pokemon_species.name.replace('-', ' ') : '???'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PokedexPage;
