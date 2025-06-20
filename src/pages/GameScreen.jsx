// src/pages/GameScreen.jsx
import { useState, useEffect, useCallback, useMemo, useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

const TOTAL_ROUNDS = 5; // Kita akan main sebanyak 5 ronde

function GameScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFetchDone = useRef(false);

  // --- STATE MANAGEMENT ---
  const [settings] = useState(location.state || {});
  const [pokemonList, setPokemonList] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State baru untuk gameplay
  const [options, setOptions] = useState([]); // Opsi jawaban
  const [gameState, setGameState] = useState('loading'); // loading | guessing | revealed
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  useDocumentTitle(
    gameState === 'guessing' 
      ? `Round ${round}/${TOTAL_ROUNDS} | Who's That Pokémon?` 
      : "Playing! | Who's That Pokémon?"
  );

  // --- GAME LOGIC ---

  // Fungsi untuk mengambil detail Pokémon (tidak berubah)
  const fetchPokemonDetails = async (pokemonUrl) => {
    const response = await fetch(pokemonUrl);
    if (!response.ok) throw new Error(`Gagal fetch: ${response.status}`);
    const data = await response.json();
    return {
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default,
      id: data.id,
      types: data.types.map(t => t.type.name),
      height: data.height / 10, // konversi ke meter
      weight: data.weight / 10, // konversi ke kg
    };
  };

  // Fungsi untuk membuat opsi jawaban
  const generateOptions = useCallback((correctAnswer, allPokemon, numOpts) => {
    if (numOpts === 'free-input') return [];
    
    const answerSet = new Set([correctAnswer.name]);
    while (answerSet.size < numOpts) {
      const randomIndex = Math.floor(Math.random() * allPokemon.length);
      const randomPokemonName = allPokemon[randomIndex].name;
      answerSet.add(randomPokemonName);
    }
    // Ubah Set menjadi Array dan acak posisinya
    return Array.from(answerSet).sort(() => Math.random() - 0.5);
  }, []);

  // Fungsi untuk memulai ronde baru
  const startNewRound = useCallback(async (list) => {
    if (round >= TOTAL_ROUNDS) {
      // Navigasi ke EndScreen (akan kita buat nanti)
      console.log("Game Selesai! Skor Akhir:", score);
      navigate('/end', { state: { score, totalRounds: TOTAL_ROUNDS } });
      return;
    }

    setGameState('loading');
    try {
      const randomIndex = Math.floor(Math.random() * list.length);
      const randomPokemonInfo = list[randomIndex];
      const pokemonDetails = await fetchPokemonDetails(randomPokemonInfo.url.replace('-species', ''));

      if (!pokemonDetails.image) {
        console.warn("Pokemon tidak punya gambar, memilih lagi...", pokemonDetails);
        startNewRound(list);
        return;
      }
      
      setCurrentPokemon(pokemonDetails);
      setOptions(generateOptions(pokemonDetails, list, settings.numOptions));
      setRound(prev => prev + 1);
      setTimeLeft(settings.timeLimit);
      setGameState('guessing');
    } catch (err) {
      setError("Gagal memuat Pokémon berikutnya.");
    }
  }, [round, score, generateOptions, settings, navigate, pokemonList]);

  // Efek untuk mengambil daftar Pokémon (hanya sekali)
  useEffect(() => {
    if (initialFetchDone.current) 
      return; // Hanya ambil sekali
    initialFetchDone.current = true;
    if (!settings.selectedGens || settings.selectedGens.length === 0) {
      navigate('/setup');
      return;
    }
    const fetchAllPokemonByGen = async () => {
      try {
        const promises = settings.selectedGens.map(genId =>
          fetch(`https://pokeapi.co/api/v2/generation/${genId}/`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        const allPokemon = results.flatMap(genData => genData.pokemon_species);
        setPokemonList(allPokemon);
        startNewRound(allPokemon);
      } catch (err) {
        setError("Gagal mengambil daftar Pokémon.");
      }
    };
    fetchAllPokemonByGen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efek untuk Timer
  useEffect(() => {
    if (gameState !== 'guessing' || timeLeft === null) return;

    if (timeLeft === 0) {
      setGameState('revealed'); // Waktu habis, ungkap jawabannya
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup function!
  }, [timeLeft, gameState]);

  // Fungsi untuk menangani jawaban user
  const handleAnswerClick = (selectedName) => {
    if (gameState !== 'guessing') return; // Abaikan klik jika bukan sedang menebak
    
    setGameState('revealed');
    if (selectedName.toLowerCase() === currentPokemon.name.toLowerCase()) {
      setScore(prev => prev + 1);
      // Nanti bisa tambahkan efek suara "benar"
    } else {
      // Nanti bisa tambahkan efek suara "salah"
    }
  };
  
  // Efek untuk lanjut ke ronde berikutnya setelah jawaban terungkap
  useEffect(() => {
    if (gameState === 'revealed') {
      const nextRoundTimer = setTimeout(() => {
        startNewRound(pokemonList);
      }, 3000); // Tunggu 3 detik sebelum ronde baru
      return () => clearTimeout(nextRoundTimer);
    }
  }, [gameState, pokemonList, startNewRound]);

  // --- RENDER UI ---

  const isLoadingOrError = gameState === 'loading' || error;
  if (isLoadingOrError) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><p className="text-2xl">{error || 'Loading Pokémon...'}</p></div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md text-center">
        {/* Header: Ronde, Skor, Timer */}
        <div className="flex justify-between items-center mb-4 text-lg">
          <p>Round: <span className="font-bold">{round}/{TOTAL_ROUNDS}</span></p>
          <p>Score: <span className="font-bold">{score}</span></p>
          <p className="text-red-400 font-bold">Time: {timeLeft}s</p>
        </div>

        {/* Gambar Pokemon */}
        {currentPokemon && (
          <div className="relative w-64 h-64 mx-auto bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <img
              src={currentPokemon.image}
              alt="Pokémon"
              className="w-full h-full object-contain transition-all duration-500"
              style={{ filter: gameState === 'guessing' ? 'brightness(0)' : 'brightness(1)' }}
            />
             {gameState === 'revealed' && (
                <div className="absolute bottom-2 bg-black bg-opacity-70 px-4 py-1 rounded-md">
                    <p className="font-bold text-xl capitalize">{currentPokemon.name}</p>
                </div>
            )}
          </div>
        )}

        {/* Opsi Jawaban */}
        <div className="grid grid-cols-2 gap-4">
          {options.map((optionName) => (
            <button
              key={optionName}
              onClick={() => handleAnswerClick(optionName)}
              disabled={gameState !== 'guessing'}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded capitalize transition disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {optionName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
