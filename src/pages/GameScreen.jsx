// src/pages/GameScreen.jsx
import { useState, useEffect, useCallback, useMemo, useRef} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

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
  const [options, setOptions] = useState([]);
  const [gameState, setGameState] = useState('loading');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  const { 
    numRounds = 5, 
    numOptions = 4,
    timeLimit = 10,
    selectedGens,
    difficulty = 'normal',
    isSuddenDeath = false
  } = settings;

  useDocumentTitle(
    gameState === 'guessing' 
      ? `Round ${round}/${numRounds} | Who's That Pokémon?` 
      : "Playing! | Who's That Pokémon?"
  );

  // --- GAME LOGIC ---
  const fetchPokemonDetails = async (pokemonUrl) => {
    const response = await fetch(pokemonUrl);
    if (!response.ok) throw new Error(`Gagal fetch: ${response.status}`);
    const data = await response.json();
    return {
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default,
      id: data.id,
      types: data.types.map(t => t.type.name),
      height: data.height / 10,
      weight: data.weight / 10,
    };
  };

  const generateOptions = useCallback((correctAnswer, allPokemon, numOpts) => {
    if (numOpts === 'free-input') return [];
    const answerSet = new Set([correctAnswer.name]);
    while (answerSet.size < numOpts) {
      const randomIndex = Math.floor(Math.random() * allPokemon.length);
      const randomPokemonName = allPokemon[randomIndex].name;
      answerSet.add(randomPokemonName);
    }
    return Array.from(answerSet).sort(() => Math.random() - 0.5);
  }, []);

  const startNewRound = useCallback(async (list) => {
if (round >= numRounds) {
  navigate('/end', { 
    state: { 
      score, 
      totalRounds: numRounds, 
      // Tambahkan settings ke dalam bekal
      settings: { difficulty, timeLimit, numOptions } 
    } 
  });
  return;
}
    setGameState('loading');
    try {
      const randomIndex = Math.floor(Math.random() * list.length);
      const randomPokemonInfo = list[randomIndex];
      const pokemonDetails = await fetchPokemonDetails(randomPokemonInfo.url.replace('-species', ''));

      if (!pokemonDetails.image) {
        startNewRound(list);
        return;
      }
      
      setCurrentPokemon(pokemonDetails);
      setOptions(generateOptions(pokemonDetails, list, numOptions));
      setRound(prev => prev + 1);
      setTimeLeft(timeLimit);
      setGameState('guessing');
    } catch (err) {
      setError("Gagal memuat Pokémon berikutnya.");
    }
  }, [round, score, generateOptions, settings, navigate, pokemonList, numRounds, numOptions, timeLimit]);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    if (!selectedGens || selectedGens.length === 0) {
      navigate('/setup');
      return;
    }
    const fetchAllPokemonByGen = async () => {
      try {
        const promises = selectedGens.map(genId =>
          fetch(`https://pokeapi.co/api/v2/generation/${genId}/`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        let allPokemon = results.flatMap(genData => genData.pokemon_species);

        // PERUBAHAN 2: Logika Mode Expert disisipkan di sini
        if (difficulty === 'expert') {
          console.log("Mode Expert: Memfilter Pokémon legendaris...");
          const detailPromises = allPokemon.map(p => fetch(p.url).then(res => res.json()));
          const speciesDetails = await Promise.all(detailPromises);
          
          const normalPokemonSpecies = speciesDetails.filter(s => !s.is_legendary && !s.is_mythical);
          
          allPokemon = normalPokemonSpecies.map(s => {
            const variety = s.varieties.find(v => v.is_default);
            return { name: s.name, url: variety.pokemon.url };
          });
        }

        setPokemonList(allPokemon);
        startNewRound(allPokemon);
      } catch (err) {
        setError("Gagal mengambil daftar Pokémon.");
      }
    };
    fetchAllPokemonByGen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]); // Tambahkan difficulty sebagai dependency

  useEffect(() => {
    if (gameState !== 'guessing' || timeLeft === null) return;
    if (timeLeft === 0) {
      setGameState('revealed');
      return;
    }
    const timerId = setInterval(() => { setTimeLeft(prev => prev - 1) }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, gameState]);

  // PERUBAHAN 3: Ganti seluruh fungsi ini untuk logika Sudden Death
  const handleAnswerClick = (selectedName) => {
    if (gameState !== 'guessing') return;

    const isCorrect = selectedName.toLowerCase() === currentPokemon.name.toLowerCase();
    setGameState('revealed'); // Ungkap jawaban untuk semua kasus

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      // Jika salah DAN mode Sudden Death aktif
      if (isSuddenDeath) {
        setTimeout(() => {
          navigate('/end', { state: { score, totalRounds: numRounds, isSuddenDeath: true } });
        }, 2000); // Beri jeda 2 detik
        return; 
      }
    }
  };
  
  useEffect(() => {
    // Jangan lanjut ke ronde berikutnya jika game sudah berakhir karena Sudden Death
    if (gameState === 'revealed' && !(isSuddenDeath && score < round)) {
      const nextRoundTimer = setTimeout(() => {
        startNewRound(pokemonList);
      }, 3000);
      return () => clearTimeout(nextRoundTimer);
    }
  }, [gameState, pokemonList, startNewRound, isSuddenDeath, score, round]);

  // --- RENDER UI ---
  const isLoadingOrError = gameState === 'loading' || error;
  if (isLoadingOrError) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center"><p className="text-2xl">{error || 'Loading Pokémon...'}</p></div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <div className="flex justify-between items-center mb-4 text-lg">
          <p>Round: <span className="font-bold">{round > numRounds ? numRounds : round}/{numRounds}</span></p>
          <p>Score: <span className="font-bold">{score}</span></p>
          <p className="text-red-400 font-bold">Time: {timeLeft}s</p>
        </div>

        {/* ... sisa JSX sama persis seperti kodemu ... */}
        {currentPokemon && (
          <div className="relative w-64 h-64 mx-auto bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <img src={currentPokemon.image} alt="Pokémon" className="w-full h-full object-contain transition-all duration-500" style={{ filter: gameState === 'guessing' ? 'brightness(0)' : 'brightness(1)' }} />
            {gameState === 'revealed' && (
              <div className="absolute bottom-2 bg-black bg-opacity-70 px-4 py-1 rounded-md">
                <p className="font-bold text-xl capitalize">{currentPokemon.name.replace('-', ' ')}</p>
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 h-28">
          {gameState === 'guessing' && options.map((optionName) => (
            <button key={optionName} onClick={() => handleAnswerClick(optionName)} disabled={gameState !== 'guessing'} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded capitalize transition disabled:opacity-50 disabled:hover:bg-blue-600">
              {optionName.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
