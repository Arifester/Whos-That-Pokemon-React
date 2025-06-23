// src/utils/soundManager.js
import { Howl } from 'howler';

// Import file suara dari folder assets
import wtpSfx from '../assets/wtp.mp3';
import correctSfx from '../assets/correct-answer.mp3';
import wrongSfx from '../assets/wrong-answer.mp3';
import gameOverSfx from '../assets/game-over.mp3';

// Buat instance Howl untuk setiap suara
const wtpSound = new Howl({
  src: [wtpSfx],
  volume: 0.6, // Mungkin sedikit lebih keras dari sfx lain
});

const correctSound = new Howl({
  src: [correctSfx],
  volume: 0.5, // Atur volume dari 0.0 hingga 1.0
});

const wrongSound = new Howl({
  src: [wrongSfx],
  volume: 0.5,
});

const gameOverSound = new Howl({
  src: [gameOverSfx],
  volume: 0.4,
});

// Buat dan ekspor fungsi untuk memutar suara
export const playWtpSound = () => {
  wtpSound.play();
};

export const playCorrectSound = () => {
  correctSound.play();
};

export const playWrongSound = () => {
  wrongSound.play();
};

export const playGameOverSound = () => {
  gameOverSound.play();
};
