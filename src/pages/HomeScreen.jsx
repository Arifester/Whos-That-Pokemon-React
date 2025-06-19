// src/pages/HomeScreen.jsx
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import useDocumentTitle from '../hooks/useDocumentTitle';

function HomeScreen() {
  const navigate = useNavigate(); // 2. Panggil hook-nya
  useDocumentTitle("Home | Who's That Pokémon?");

  // 3. Buat fungsi untuk handle klik
  const handleStartClick = () => {
    navigate('/setup'); // 4. Arahkan ke path '/setup'
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Who's That Pokémon?
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Tebak Pokémon dari siluetnya! Pilih generasi, atur waktu, dan mainkan!
        </p>
        {/* 5. Tambahkan onClick ke tombol */}
        <button
          onClick={handleStartClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300 ease-in-out transform hover:scale-105"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}

export default HomeScreen;
