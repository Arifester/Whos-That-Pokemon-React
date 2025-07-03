// src/pages/HomeScreen.jsx
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';

// Varian untuk kontainer utama, akan mengatur animasi anak-anaknya
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Beri jeda 0.2 detik antar animasi anak
    },
  },
  exit: {
    opacity: 0,
    x: '100vw',
    transition: { ease: 'easeInOut' }
  }
};

// Varian untuk setiap elemen anak (judul, paragraf, tombol)
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

function HomeScreen() {
  const navigate = useNavigate();
  useDocumentTitle("Home | Who's That Pokémon?");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans"
    >
      <div className="text-center p-8 bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
        <motion.h1 variants={itemVariants} className="text-5xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Press Start 2P', cursive" }}>
          Who's That Pokémon?
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-gray-300 mb-8">
          Tebak Pokémon dari siluetnya! Pilih generasi, atur waktu, dan mainkan!
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => navigate('/setup')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl"
          >
            Start Game
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => navigate('/pokedex')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg text-lg"
          >
            Lihat Pokédex
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HomeScreen;
