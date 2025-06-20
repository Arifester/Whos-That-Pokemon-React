// src/pages/GameScreen.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useEffect } from 'react';

function GameScreen() {
  useDocumentTitle("Playing! | Who's That Pokémon?");
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil data yang dikirim dari halaman setup.
  // 'location.state' akan null jika halaman ini diakses langsung,
  // jadi kita beri fallback '{}' untuk mencegah error.
  const settings = location.state || {};
  const { selectedGens, timeLimit, numOptions } = settings;

  // Jika tidak ada settings (diakses langsung), tendang balik ke halaman setup
  useEffect(() => {
    if (!settings.selectedGens || settings.selectedGens.length === 0) {
        console.log("Pengaturan tidak ditemukan, kembali ke setup.");
        navigate('/setup');
    }
  }, [settings, navigate]);


  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-8">Game On!</h1>

      <div className="bg-gray-800 p-6 rounded-lg text-lg">
        <h2 className="text-2xl mb-4">Pengaturan yang Diterima:</h2>
        <p><strong>Generasi:</strong> {JSON.stringify(selectedGens)}</p>
        <p><strong>Batas Waktu:</strong> {timeLimit} detik</p>
        <p><strong>Jumlah Opsi:</strong> {numOptions}</p>
      </div>

      <button
        onClick={() => navigate('/setup')}
        className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        &larr; Stop and Back to Setup
      </button>
    </div>
  );
}

export default GameScreen;
