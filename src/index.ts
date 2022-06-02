require('./style.css');

import { HTMLRenderer } from './module/html-renderer';
import { onStateChange, initButtonHandlers } from './module/controls';
import { Game } from './module/game';

const ROOT_CONTAINER_ID = 'field-root';
const FIELD_WIDTH = 10;
const FIELD_HEIGHT = 10;

const rootContainer = document.getElementById(ROOT_CONTAINER_ID);

const game = new Game(
  rootContainer,
  FIELD_WIDTH,
  FIELD_HEIGHT,
  HTMLRenderer,
  onStateChange,
);

initButtonHandlers(game.start, game.pause, game.reset);
