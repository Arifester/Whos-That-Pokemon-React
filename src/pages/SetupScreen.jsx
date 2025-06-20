// src/pages/SetupScreen.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

function SetupScreen() {
  useDocumentTitle("Setup Game | Who's That Pokémon?");
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [selectedGens, setSelectedGens] = useState([]);
  const [timeLimit, setTimeLimit] = useState(10);
  const [numOptions, setNumOptions] = useState(4);
  const [numRounds, setNumRounds] = useState(5);
  // --- TAMBAHAN: State untuk fitur baru ---
  const [difficulty, setDifficulty] = useState('normal'); // 'normal' atau 'expert'
  const [isSuddenDeath, setIsSuddenDeath] = useState(false); // boolean true/false

  // --- LOGIC HANDLERS ---
  const handleGenClick = (genNumber) => {
    setSelectedGens((prevGens) => {
      if (prevGens.includes(genNumber)) {
        return prevGens.filter((g) => g !== genNumber);
      } else {
        return [...prevGens, genNumber].sort((a, b) => a - b);
      }
    });
  };

  const selectAllGens = () => {
    setSelectedGens([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  };

  const deselectAllGens = () => {
    setSelectedGens([]);
  };

  const handleStartGame = () => {
    navigate('/game', {
      state: {
        selectedGens,
        timeLimit,
        numOptions,
        numRounds,
        // --- TAMBAHAN: Kirim state baru ke GameScreen ---
        difficulty,
        isSuddenDeath,
      },
    });
  };

  // --- RENDER UI ---
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8 text-center">
          Game Setup
        </h1>

        {/* --- Pilihan Generasi --- */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-center">Pilih Generasi</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4 mb-4">
            {[...Array(9).keys()].map((i) => {
              const genNumber = i + 1;
              const isSelected = selectedGens.includes(genNumber);
              return (
                <button
                  key={genNumber}
                  onClick={() => handleGenClick(genNumber)}
                  className={`py-3 rounded-lg font-bold transition-colors ${
                    isSelected ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Gen {genNumber}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={selectAllGens} className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded">Select All</button>
            <button onClick={deselectAllGens} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">Deselect All</button>
          </div>
        </div>
        
        {/* REVISI: Layout diubah menjadi 2x2 agar lebih seimbang */}
        <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-center">Waktu Tebakan</h2>
                <div className="flex justify-center gap-4">
                    {[5, 7, 10].map(time => (
                        <button key={time} onClick={() => setTimeLimit(time)} className={`py-2 px-6 rounded-lg font-bold transition-colors ${timeLimit === time ? 'bg-blue-600 shadow-lg' : 'bg-gray-600 hover:bg-gray-700'}`}>
                            {time}s
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-center">Jumlah Opsi</h2>
                <div className="flex justify-center gap-4">
                    {[2, 4, 5, 'Free'].map(opt => {
                      const value = opt === 'Free' ? 'free-input' : opt;
                      return (
                        <button key={opt} onClick={() => setNumOptions(value)} className={`py-2 px-6 rounded-lg font-bold transition-colors ${numOptions === value ? 'bg-blue-600 shadow-lg' : 'bg-gray-600 hover:bg-gray-700'}`}>
                            {opt}
                        </button>
                      )
                    })}
                </div>
            </div>

            <div className="p-6 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-center">Jumlah Ronde</h2>
                <div className="flex justify-center items-center gap-2">
                  {[5, 10, 15].map(rounds => (
                      <button key={rounds} onClick={() => setNumRounds(rounds)} className={`py-2 px-4 rounded-lg font-bold transition-colors text-sm ${numRounds === rounds ? 'bg-blue-600 shadow-lg' : 'bg-gray-600 hover:bg-gray-700'}`}>
                          {rounds}
                      </button>
                  ))}
                  <input 
                    type="number" 
                    value={numRounds}
                    onChange={(e) => setNumRounds(e.target.value ? Number(e.target.value) : '')}
                    className="bg-gray-700 text-white font-bold w-20 text-center py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Custom"
                  />
                </div>
            </div>

            {/* --- TAMBAHAN: Blok UI untuk Fitur Baru --- */}
            <div className="p-6 bg-gray-800 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-center">Pengaturan Tambahan</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Tingkat Kesulitan</h3>
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setDifficulty('normal')} className={`py-2 px-4 rounded-lg font-bold w-full sm:w-auto transition-colors ${difficulty === 'normal' ? 'bg-blue-600 shadow-lg' : 'bg-gray-600 hover:bg-gray-700'}`}>Normal</button>
                      <button onClick={() => setDifficulty('expert')} className={`py-2 px-4 rounded-lg font-bold w-full sm:w-auto transition-colors ${difficulty === 'expert' ? 'bg-blue-600 shadow-lg' : 'bg-gray-600 hover:bg-gray-700'}`}>Expert</button>
                    </div>
                  </div>
                  <div className="border-l border-gray-700 mx-4 hidden sm:block"></div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-center">Mode Game</h3>
                    <div className="flex justify-center">
                      <button onClick={() => setIsSuddenDeath(prev => !prev)} className={`py-2 px-4 rounded-lg font-bold w-full sm:w-auto transition-colors ${isSuddenDeath ? 'bg-red-700 hover:bg-red-800' : 'bg-green-600 hover:bg-green-700'}`}>
                        {isSuddenDeath ? 'Sudden Death: ON' : 'Sudden Death: OFF'}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
        </div>

        {/* --- Tombol Mulai & Kembali --- */}
        <div className="mt-10 flex justify-center items-center gap-4">
          <button onClick={() => navigate('/')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
            &larr; Back to Home
          </button>
          <button onClick={handleStartGame} disabled={selectedGens.length === 0} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600">
            Mulai Game!
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupScreen;
