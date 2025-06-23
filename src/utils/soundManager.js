// src/utils/soundManager.js
import { Howl } from 'howler';

import correctSfx from '../assets/correct-answer.mp3';
import wrongSfx from '../assets/wrong-answer.mp3';
import wtpSfx from '../assets/wtp.mp3';
import gameOverSfx from '../assets/game-over.mp3';

// 2. Buat instance 'Howl' untuk setiap suara dan ekspor.
export const correctSound = new Howl({
  src: [correctSfx],
  volume: 0.5,
});

export const wrongSound = new Howl({
  src: [wrongSfx],
  volume: 0.5,
});

export const wtpSound = new Howl({
  src: [wtpSfx],
  volume: 0.6,
});

export const gameOverSound = new Howl({
  src: [gameOverSfx],
  volume: 0.5,
  loop: false,
});
