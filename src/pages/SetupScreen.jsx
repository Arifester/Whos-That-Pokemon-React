// src/pages/SetupScreen.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

function SetupScreen() {
  // Panggil custom hook untuk judul dan navigasi
  useDocumentTitle("Setup Game | Who's That Pokémon?");
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  // State untuk menyimpan semua pilihan user
  const [selectedGens, setSelectedGens] = useState([]); // Menyimpan generasi yg dipilih (misal: [1, 3, 5])
  const [timeLimit, setTimeLimit] = useState(10); // Default waktu 10 detik
  const [numOptions, setNumOptions] = useState(4); // Default 4 opsi jawaban

  // --- LOGIC HANDLERS ---
  // Logika untuk menangani klik pada tombol generasi (toggle on/off)
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

  // Fungsi untuk memulai game dan mengirimkan state ke GameScreen
  const handleStartGame = () => {
    // Navigasi ke halaman '/game' sambil membawa "bekal" data di dalam `state`
    navigate('/game', {
      state: {
        selectedGens,
        timeLimit,
        numOptions,
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
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-4">
            {[...Array(9).keys()].map((i) => {
              const genNumber = i + 1;
              const isSelected = selectedGens.includes(genNumber);
              return (
                <button
                  key={genNumber}
                  onClick={() => handleGenClick(genNumber)}
                  className={`py-3 rounded-lg font-bold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                      : 'bg-red-600 hover:bg-red-700'
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
        
        <div className="grid md:grid-cols-2 gap-8">
            {/* --- Pilihan Waktu --- */}
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

            {/* --- Pilihan Opsi Jawaban --- */}
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
        </div>

        {/* --- Tombol Mulai & Kembali --- */}
        <div className="mt-10 flex justify-center items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            &larr; Back to Home
          </button>
          <button
            onClick={handleStartGame}
            disabled={selectedGens.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-lg text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          >
            Mulai Game!
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetupScreen;
