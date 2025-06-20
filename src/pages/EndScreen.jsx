// src/pages/EndScreen.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useEffect, useState } from 'react';

function EndScreen() {
  useDocumentTitle("Game Over | Who's That Pokémon?");
  const location = useLocation();
  const navigate = useNavigate();

  // --- Ambil data dari state navigasi ---
  // Beri nilai default untuk semua properti untuk mencegah error jika halaman diakses langsung
  const { score, totalRounds, isSuddenDeath, settings } = location.state || { 
    score: 0, 
    totalRounds: 0, 
    isSuddenDeath: false, 
    settings: { difficulty: 'normal', timeLimit: 10, numOptions: 4 }
  };
  
  // --- State untuk High Score ---
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);


  // --- Logika High Score & Redirect ---
  useEffect(() => {
    // Jika state tidak ada (diakses langsung), kembali ke home
    if (location.state === null) {
      navigate('/');
      return; // Hentikan eksekusi lebih lanjut
    }

    // Ambil highscore dari localStorage saat komponen dimuat
    const savedHighScore = localStorage.getItem('pokemon-quiz-highscore') || 0;
    const currentHighScore = Number(savedHighScore);
    setHighScore(currentHighScore);

    // Cek jika skor saat ini adalah rekor baru
    if (score > currentHighScore) {
      localStorage.setItem('pokemon-quiz-highscore', score);
      setHighScore(score);
      setIsNewHighScore(true);
    }
  }, [location.state, navigate, score]);


  // --- Variabel untuk Tampilan ---
  const percentage = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0;

  const getEndMessage = () => {
    if (isSuddenDeath && score < totalRounds) return "Satu kesalahan mengakhiri perjalananmu. Coba lagi!";
    if (percentage === 100) return "Sempurna! Kamu seorang Pokémon Master!";
    if (percentage >= 80) return "Luar Biasa! Pengetahuan Pokémon-mu hebat!";
    if (percentage >= 50) return "Bagus! Kamu sudah cukup kenal banyak Pokémon!";
    return "Terus berlatih untuk menjadi yang terbaik!";
  };

  // --- RENDER UI ---
  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">
          {isSuddenDeath && score < totalRounds ? 'Sayang Sekali!' : 'Game Over'}
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          {getEndMessage()}
        </p>

        {/* Kotak Skor Utama */}
        <div className="bg-gray-700 p-6 rounded-lg mb-8 relative">
          {isNewHighScore && 
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
              NEW HIGH SCORE!
            </span>
          }
          <h2 className="text-2xl font-semibold">Skor Akhir Kamu</h2>
          <p className="text-6xl font-bold my-2 text-green-400">
            {score} / {totalRounds}
          </p>
          <p className="text-2xl font-semibold">
            ({percentage}%)
          </p>
        </div>

        {/* Ringkasan Pengaturan */}
        <div className="bg-gray-800 border-y-2 border-gray-700 my-6 py-4 text-left text-sm">
            <h3 className="text-lg font-semibold text-center mb-2">Ringkasan Game</h3>
            <div className="grid grid-cols-2 gap-x-4">
                <p><strong>Kesulitan:</strong></p> <p className="capitalize font-mono text-right">{settings.difficulty}</p>
                <p><strong>Waktu/Soal:</strong></p> <p className="font-mono text-right">{settings.timeLimit} detik</p>
                <p><strong>Opsi Jawaban:</strong></p> <p className="font-mono text-right">{settings.numOptions === 'free-input' ? 'Ketik Bebas' : `${settings.numOptions} Opsi`}</p>
            </div>
             <p className="text-center text-xs mt-4">Skor Tertinggi: {highScore}</p>
        </div>

        {/* Tombol Navigasi */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/setup')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default EndScreen;
