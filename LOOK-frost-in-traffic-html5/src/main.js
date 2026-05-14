import '../style.css';
import { Game } from './Game.js';

window.onload = () => {
    const game = new Game();
    game.start();
};
