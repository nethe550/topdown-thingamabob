import Game from './Game.js';

const game = await Game.Init();  // NOSONAR javascript:S4123
game.start();