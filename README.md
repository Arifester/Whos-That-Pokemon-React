# 🎮 Who's That Pokémon?
An interactive web-based guessing game, inspired by the classic segments in the Pokémon anime. Test your knowledge by guessing the silhouette of the Pokémon that appears on screen before time runs out!
This project is an evolution of the Vanilla JS version, now built entirely with React and Tailwind CSS to create a modern and dynamic user experience.

## ✨ Main Features
* **Full Game Customization**: Tailor the game to your liking!
* **Generation Select (1-9)**: Choose to play with Pokémon from specific generations or challenge yourself by enabling them all.
* **Adjustable Timer**: Set the timer for each round (5, 7, or 10 seconds).
* **Custom Round Count**: Define the game length by choosing a preset (5, 10, 15, 20) or typing in a custom number of rounds.
* **Answer Modes**: Select from multiple-choice (2, 4, or 5 options) or test your knowledge with **Free Input Mode** by typing the answer yourself.

* **Difficulty & Extra Modes**:
* **Difficulty Level**: Choose between **Normal** mode (all Pokémon included) or **Expert** mode (which excludes Legendary & Mythical Pokémon) for a different kind of challenge.
* **Sudden Death Mode**: Activate this mode where a single wrong answer will end the game immediately.

* **Interactive Pokédex**:
* Every correctly guessed Pokémon is "unlocked" and saved to your personal Pokédex.
* Browse a complete list of over 1000 Pokémon, sorted by their National Pokédex number.
* Use filters to display Pokémon by generation or only those you have successfully revealed.
* Track your collection progress with dynamic stats and percentages.

* **Modern User Experience**:
* Built as a Single Page Application (SPA), allowing for instant navigation between pages with no reloads.
* Smooth page transitions and element animations powered by Framer Motion.
* Immersive sound effects for a more engaging gameplay experience.

## 🚀 How to Play
1. **Set Up Your Game**: On the "Game Setup" screen, choose your preferred Generation, Time, Answer Options, Number of Rounds, Difficulty, and Game Mode.
2. **Start Guessing**: Click "Start Game!". A Pokémon silhouette will appear, accompanied by the iconic "Who's That Pokémon?" sound.
3. **Answer the Question**: After the sound finishes, the answer options (or input field) and the timer will appear. Select or type your answer before the time runs out.
4. **Check Your Progress**: After playing, return to the Home Screen and click "View Pokédex" to see all the Pokémon you have successfully collected!

## 🛠️ Tech Stack
* **[React](https://react.dev/)**: The main library for building an interactive, component-based user interface.
* **[Vite](https://vitejs.dev/)**: For a blazing-fast development server and build process.
* **[Tailwind CSS](https://tailwindcss.com/)**: For modern, utility-first, and responsive styling.
* **[PokéAPI](https://pokeapi.co/)**: As the data source for all Pokémon information and images.
* **[React Router](https://reactrouter.com/)**: To handle client-side routing for a seamless Single Page Application (SPA) experience.
* **[Framer Motion](https://www.framer.com/motion/)**: For all smooth page transitions and element animations.
* **[Howler.js](https://howlerjs.com/)**: For reliable audio management and sound effects.
* **[Heroicons](https://heroicons.com/)**: For clean and modern SVG icons used throughout the UI.
