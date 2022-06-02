import { HTMLRenderer } from './renderer';
import { Game } from './Game';

const ROOT_CONTAINER_ID = 'field-root';
const BUTTON_PLAY_ID = 'button-play';
const BUTTON_PAUSE_ID = 'button-pause';
const BUTTON_RESET_ID = 'button-reset';
const FIELD_WIDTH = 10;
const FIELD_HEIGHT = 10;

const rootContainer = document.getElementById(ROOT_CONTAINER_ID);
const buttonPlay = document.getElementById(BUTTON_PLAY_ID);
const buttonPause = document.getElementById(BUTTON_PAUSE_ID);
const buttonReset = document.getElementById(BUTTON_RESET_ID);

const game = new Game(
  rootContainer,
  FIELD_WIDTH,
  FIELD_HEIGHT,
  HTMLRenderer,
);

buttonPlay.addEventListener('click', game.start);
buttonPause.addEventListener('click', game.pause);
buttonReset.addEventListener('click', game.reset);
