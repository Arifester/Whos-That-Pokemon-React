// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import HomeScreen from './pages/HomeScreen.jsx';
import SetupScreen from './pages/SetupScreen.jsx';
import GameScreen from './pages/GameScreen.jsx';
import EndScreen from './pages/EndScreen.jsx';
import './index.css';

// Daftarkan semua halaman di sini
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeScreen />,
    // Di sini bisa ditambahkan halaman error jika path tidak ditemukan
  },
  {
    path: '/setup',
    element: <SetupScreen />,
  },
  {
    path: '/game',
    element: <GameScreen />,
  },
  { path: '/end',
    element: <EndScreen />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
);
