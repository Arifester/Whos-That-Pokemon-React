// src/pages/GameScreen.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

function GameScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialFetchDone = useRef(false);

  // --- STATE MANAGEMENT ---
  const [settings] = useState(location.state || {});
  const {
    selectedGens,
    timeLimit = 10,
    numOptions = 4,
    numRounds = 5,
    difficulty = 'normal',
    isSuddenDeath = false,
  } = settings;

  const [pokemonList, setPokemonList] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [gameState, setGameState] = useState('loading');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(null);

  useDocumentTitle(
    round > 0
      ? `Round ${round}/${numRounds} | Who's That Pokémon?`
      : "Loading Game..."
  );

  // --- FUNGSI BANTUAN ---
  const fetchPokemonDetails = useCallback(async (pokemonUrl) => {
    const response = await fetch(pokemonUrl);
    if (!response.ok) throw new Error(`Gagal fetch: ${response.status}`);
    const data = await response.json();
    return { name: data.name, image: data.sprites.other['official-artwork'].front_default };
  }, []);

  const generateOptions = useCallback((correctAnswer, allPokemon, numOpts) => {
    if (numOpts === 'free-input') return [];
    const answerSet = new Set([correctAnswer.name]);
    while (answerSet.size < numOpts) {
      const randomIndex = Math.floor(Math.random() * allPokemon.length);
      const randomPokemonName = allPokemon[randomIndex]?.name;
      if (randomPokemonName) answerSet.add(randomPokemonName);
    }
    return Array.from(answerSet).sort(() => Math.random() - 0.5);
  }, []);

  // --- EFEK & ALUR PERMAINAN ---

  // 1. useEffect: Mengambil data Pokémon (HANYA SEKALI)
  useEffect(() => {
    if (initialFetchDone.current) return;
    if (!selectedGens) { navigate('/setup'); return; }
    initialFetchDone.current = true;

    const fetchAllPokemonByGen = async () => {
      setGameState('loading');
      try {
        const promises = selectedGens.map(genId =>
          fetch(`https://pokeapi.co/api/v2/generation/${genId}/`).then(res => res.json())
        );
        const results = await Promise.all(promises);
        let allPokemon = results.flatMap(genData => genData.pokemon_species);

        if (difficulty === 'expert') {
          const detailPromises = allPokemon.map(p => fetch(p.url).then(res => res.json()));
          const speciesDetails = await Promise.all(detailPromises);
          const normalPokemonSpecies = speciesDetails.filter(s => !s.is_legendary && !s.is_mythical);
          allPokemon = normalPokemonSpecies.map(s => {
            const variety = s.varieties.find(v => v.is_default);
            return { name: s.name, url: variety.pokemon.url };
          });
        }
        setPokemonList(allPokemon);
        setRound(1);
      } catch (err) { setError("Gagal mengambil daftar Pokémon."); }
    };
    fetchAllPokemonByGen();
  }, [selectedGens, navigate, difficulty]);

  // 2. useEffect: Memulai ronde baru setiap kali 'round' berubah
  useEffect(() => {
    if (round === 0 || pokemonList.length === 0) return;

    let isActive = true;
    const startNewRound = async () => {
      setGameState('loading');
      try {
        const randomIndex = Math.floor(Math.random() * pokemonList.length);
        const randomPokemonInfo = pokemonList[randomIndex];
        const fetchUrl = randomPokemonInfo.url.includes('/pokemon/') ? randomPokemonInfo.url : randomPokemonInfo.url.replace('-species', '');
        const pokemonDetails = await fetchPokemonDetails(fetchUrl);

        if (!pokemonDetails.image) { startNewRound(); return; }
        if (isActive) {
          setCurrentPokemon(pokemonDetails);
          setOptions(generateOptions(pokemonDetails, pokemonList, numOptions));
          setTimeLeft(timeLimit);
          setGameState('guessing');
        }
      } catch (err) { if (isActive) setError("Gagal memuat Pokémon berikutnya."); }
    };
    startNewRound();
    return () => { isActive = false; };
  }, [round, pokemonList, generateOptions, fetchPokemonDetails, numOptions, timeLimit]);
  
  // 3. useEffect: Menangani timer
  useEffect(() => {
    if (gameState !== 'guessing' || timeLeft === null) return;
    if (timeLeft === 0) { setGameState('revealed'); return; }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, gameState]);
  
  // 4. useEffect: Menangani transisi ke ronde berikutnya ATAU akhir game
  useEffect(() => {
    if (gameState === 'revealed') {
      const timer = setTimeout(() => {
        if (isSuddenDeath && score < round) {
          // Navigasi karena sudden death sudah ditangani di handleAnswer,
          // jadi kita tidak melakukan apa-apa di sini untuk kasus itu.
          return;
        }
        // Cek apakah ini ronde terakhir
        if (round >= numRounds) {
          navigate('/end', { state: { score, totalRounds: numRounds, settings: { difficulty, timeLimit, numOptions, isSuddenDeath } } });
        } else {
          // Jika bukan, baru lanjut ke ronde berikutnya
          setRound(prev => prev + 1);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState, round, numRounds, score, difficulty, timeLimit, numOptions, navigate, isSuddenDeath]);

  // --- FUNGSI EVENT HANDLER ---
  const handleAnswer = (isCorrect) => {
    setGameState("revealed");
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else if (isSuddenDeath) {
      setTimeout(() => {
        navigate('/end', { state: { score, totalRounds: numRounds, isSuddenDeath: true, settings: { difficulty, timeLimit, numOptions } } });
      }, 2000);
    }
  };

  const handleAnswerClick = (selectedName) => {
    if (gameState !== 'guessing') return;
    handleAnswer(selectedName.toLowerCase() === currentPokemon.name.toLowerCase());
  };

  const handleFreeInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || gameState !== 'guessing') return;
    handleAnswer(inputValue.trim().toLowerCase().replace(/ /g, '-') === currentPokemon.name.toLowerCase());
    setInputValue("");
  };

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
