// src/pages/GameScreen.jsx
import {useState, useEffect, useCallback, useRef} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import {wtpSound, correctSound, wrongSound} from '../utils/soundManager';

const typeColors = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  grass: 'bg-green-500',
  electric: 'bg-yellow-400',
  ice: 'bg-cyan-300 text-gray-800',
  fighting: 'bg-orange-700',
  poison: 'bg-purple-600',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-700',
  ghost: 'bg-indigo-800',
  dragon: 'bg-purple-800',
  dark: 'bg-gray-800 border-2 border-white',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300 text-gray-800',
};

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
    return {
    name: data.name,
    image: data.sprites.other['official-artwork'].front_default,
    id: data.id,
    types: data.types.map(t => t.type.name),
    height: data.height / 10, // konversi ke meter
    weight: data.weight / 10, // konversi ke kg
  };
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
        // vvv PERUBAHANNYA DI SINI vvv
        setCurrentPokemon(pokemonDetails);
        setOptions(generateOptions(pokemonDetails, pokemonList, numOptions));
        
        // Hapus pemanggilan playWtpSound() dan setTimeout() dari sini.
        // Cukup ubah gameState menjadi 'presenting'.
        setGameState('presenting');
      }
    } catch (err) { 
        if (isActive) setError("Gagal memuat Pokémon berikutnya.");
    }
  };
  startNewRound();
  return () => { isActive = false; };
}, [round, pokemonList, generateOptions, fetchPokemonDetails, numOptions, timeLimit]); 
  
    // useEffect baru untuk menangani state 'presenting'
  useEffect(() => {
    if (gameState === 'presenting') {
      wtpSound.play(); // 1. Putar suara "Who's That Pokémon?"

      // 2. Siapkan timer untuk memulai tebakan setelah suara selesai
      const startGuessingTimer = setTimeout(() => {
        setTimeLeft(timeLimit);   // 3. Set waktu tebakan
        setGameState('guessing'); // 4. Ubah state untuk mulai menebak
      }, 4000); // Jeda 4 detik (bisa disesuaikan dengan panjang suaramu)

      // Wajib ada cleanup function untuk mencegah bug
      return () => clearTimeout(startGuessingTimer);
    }
  }, [gameState, timeLimit]);

  // 3. useEffect: Menangani timer
  useEffect(() => {
    if (gameState !== 'guessing' || timeLeft === null) return;
    
    if (timeLeft === 0) {
      setGameState('revealed'); // Selalu ungkap jawaban saat waktu habis

      // Jika waktu habis DAN mode Sudden Death aktif, akhiri game
      if (isSuddenDeath) {
        setTimeout(() => {
          navigate('/end', {
            state: {
              score,
              totalRounds: numRounds,
              isSuddenDeath: true,
              settings: { difficulty, timeLimit, numOptions },
            },
          });
        }, 2000); // Beri jeda 2 detik untuk melihat jawaban yg benar
      }
      return; // Hentikan eksekusi timer
    }

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
  // Pengaman ekstra, jangan lakukan apa-apa jika bukan sedang menebak
  if (gameState !== 'guessing') return;

  setGameState("revealed"); // Selalu ungkap jawaban, tidak peduli benar atau salah

  if (isCorrect) {
    correctSound.play();
    setScore((prev) => prev + 1);
  } else {
    // Jika jawaban salah
    wrongSound.play();
    // Cek apakah mode Sudden Death aktif
    if (isSuddenDeath) {
      setTimeout(() => {
        navigate('/end', {
          state: {
            score,
            totalRounds: numRounds,
            isSuddenDeath: true,
            settings: { difficulty, timeLimit, numOptions },
          },
        });
      }, 2000); // Beri jeda agar pemain bisa lihat jawaban
    }
  }
};

  // 2. Handler untuk jawaban dari KLIK TOMBOL
  const handleAnswerClick = (selectedName) => {
    const isCorrect = selectedName.toLowerCase() === currentPokemon.name.toLowerCase();
    handleAnswer(isCorrect); // Kirim hasilnya (true/false) ke fungsi pusat
  };

  // 3. Handler untuk jawaban dari INPUT TEKS
  const handleFreeInputSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const isCorrect = inputValue.trim().toLowerCase().replace(/ /g, '-') === currentPokemon.name.toLowerCase();
    handleAnswer(isCorrect); // Kirim hasilnya (true/false) ke fungsi pusat
    
    setInputValue(""); // Kosongkan input field
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
        {/* Timer hanya muncul saat menebak */}
        {gameState === 'guessing' && timeLeft !== null && (
          <p className="text-red-400 font-bold">Time: {timeLeft}s</p>
        )}
      </div>

      {/* Loading antar ronde atau gambar Pokemon */}
      {(gameState === 'loading' && round > 0) ? (
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <p>Loading next Pokémon...</p>
        </div>
      ) : currentPokemon && (
        <div className="relative w-64 h-64 mx-auto bg-gray-700 rounded-lg flex items-center justify-center mb-4">
          <img
            src={currentPokemon.image}
            alt="Pokémon"
            className="w-full h-full object-contain transition-all duration-500"
            // PERUBAHAN 1: Tambahkan kondisi 'presenting' agar tetap siluet
            style={{
              filter: gameState === 'presenting' || gameState === 'guessing'
                ? 'brightness(0)'
                : 'brightness(1)'
            }}
          />
          {gameState === 'revealed' && (
            <div className="absolute bottom-2 bg-black bg-opacity-70 px-4 py-1 rounded-md">
              <p className="font-bold text-xl capitalize">{currentPokemon.name.replace('-', ' ')}</p>
            </div>
          )}
        </div>
      )}

      <div className="min-h-[7rem] flex flex-col justify-center"> {/* Pembungkus agar layout stabil */}
        {gameState === 'revealed' && currentPokemon && (
          <div className="w-full bg-gray-700 p-3 rounded-lg animate-fade-in">
            <div className="flex justify-around items-center text-center">
              {/* Bagian Tipe Pokémon */}
              <div>
                <h3 className="text-sm font-bold text-gray-400">TYPE</h3>
                <div className="flex gap-1 mt-1">
                  {currentPokemon.types?.map(type => (
                    <span 
                      key={type} 
                      className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${typeColors[type] || 'bg-gray-500'}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              {/* Bagian Tinggi */}
              <div>
                <h3 className="text-sm font-bold text-gray-400">HEIGHT</h3>
                <p className="text-lg font-semibold">{currentPokemon.height} m</p>
              </div>
              {/* Bagian Berat */}
              <div>
                <h3 className="text-sm font-bold text-gray-400">WEIGHT</h3>
                <p className="text-lg font-semibold">{currentPokemon.weight} kg</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Opsi Jawaban */}
      <div className="grid grid-cols-2 gap-4 min-h-28 items-start [&>*:last-child:nth-child(odd)]:col-span-2">
        {numOptions === 'free-input' ? (
          <form onSubmit={handleFreeInputSubmit} className="col-span-2 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik nama Pokémon..."
              // Teks input hanya aktif saat menebak
              disabled={gameState !== 'guessing'}
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              autoFocus
            />
            <button
              type="submit"
              disabled={gameState !== 'guessing' || !inputValue.trim()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </form>
        ) : (
          // Tampilan untuk Mode Pilihan Ganda
          options.map((optionName) => (
            <button
              key={optionName}
              onClick={() => handleAnswerClick(optionName)}
              // Tombol hanya aktif saat menebak
              disabled={gameState !== "guessing"}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded capitalize transition disabled:opacity-50"
            >
              {/* PERUBAHAN 2: Teks hanya muncul saat menebak */}
              {gameState === 'guessing' ? optionName.replace("-", " ") : <>&nbsp;</>}
            </button>
          ))
        )}
      </div>
    </div>
  </div>
);
}

export default GameScreen;
