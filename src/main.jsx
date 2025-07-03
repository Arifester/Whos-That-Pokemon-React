// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './pages/Root.jsx';
import HomeScreen from './pages/HomeScreen.jsx';
import SetupScreen from './pages/SetupScreen.jsx';
import GameScreen from './pages/GameScreen.jsx';
import EndScreen from './pages/EndScreen.jsx';
import PokedexPage from './pages/PokedexPage.jsx'; // Jangan lupa import PokedexPage
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />, // Root menjadi pembungkus utama
    children: [ // Semua halaman kita sekarang adalah 'children' dari Root
      { index: true, element: <HomeScreen /> },
      { path: 'setup', element: <SetupScreen /> },
      { path: 'game', element: <GameScreen /> },
      { path: 'end', element: <EndScreen /> },
      { path: 'pokedex', element: <PokedexPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
