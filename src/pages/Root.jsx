// src/pages/Root.jsx
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

function Root() {
  const location = useLocation();
  return (
    // 'mode="wait"' memastikan halaman lama selesai animasi keluar sebelum halaman baru masuk
    <AnimatePresence mode="wait">
      {/* 'key' di sini sangat penting agar AnimatePresence tahu halamannya telah berganti */}
      <div key={location.pathname}>
        <Outlet />
      </div>
    </AnimatePresence>
  );
}

export default Root;
