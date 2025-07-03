// src/pages/HomeScreen.jsx
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion'; // 1. Import motion

// 2. Definisikan varian animasi untuk halaman
const pageVariants = {
  initial: { opacity: 0, x: "-100vw" },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: "100vw" },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5,
};

function HomeScreen() {
  const navigate = useNavigate();
  useDocumentTitle("Home | Who's That Pokémon?");

  const handleStartClick = () => {
    navigate('/setup');
  };

  return (
    // 3. Ubah div utama menjadi motion.div dan tambahkan properti animasi
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans"
    >
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Who's That Pokémon?
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Tebak Pokémon dari siluetnya! Pilih generasi, atur waktu, dan mainkan!
        </p>
        
        {/* 4. Bungkus tombol dalam div agar rapi */}
        <div className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={handleStartClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
          >
            Start Game
          </motion.button>

          {/* 5. Tambahkan tombol baru untuk Pokédex */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => navigate('/pokedex')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg text-lg"
          >
            Lihat Pokédex
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default HomeScreen;
