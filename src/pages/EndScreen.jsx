// src/pages/EndScreen.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useEffect } from 'react';

function EndScreen() {
  useDocumentTitle("Game Over | Who's That Pokémon?");
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil skor dari state navigasi
  const { score, totalRounds } = location.state || { score: 0, totalRounds: 0 };

  // Jika tidak ada state, kembalikan ke halaman utama
  useEffect(() => {
    if (location.state === null) {
      navigate('/');
    }
  }, [location.state, navigate]);

  // Hitung persentase
  const percentage = totalRounds > 0 ? Math.round((score / totalRounds) * 100) : 0;

  // Pilih pesan berdasarkan persentase
  const getEndMessage = () => {
    if (percentage === 100) return "Sempurna! Kamu seorang Pokémon Master!";
    if (percentage >= 80) return "Luar Biasa! Pengetahuan Pokémon-mu hebat!";
    if (percentage >= 50) return "Bagus! Kamu sudah cukup kenal banyak Pokémon!";
    return "Terus berlatih untuk menjadi yang terbaik!";
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">
          Game Over
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          {getEndMessage()}
        </p>

        <div className="bg-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold">Skor Akhir Kamu</h2>
          <p className="text-6xl font-bold my-2 text-green-400">
            {score} / {totalRounds}
          </p>
          <p className="text-2xl font-semibold">
            ({percentage}%)
          </p>
        </div>

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
