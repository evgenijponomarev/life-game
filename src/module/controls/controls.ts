import { StateChangeHandler, GameState } from '../game';

const BUTTON_PLAY_ID = 'button-play';
const BUTTON_PAUSE_ID = 'button-pause';
const BUTTON_RESET_ID = 'button-reset';

const buttonPlay = document.getElementById(BUTTON_PLAY_ID);
const buttonPause = document.getElementById(BUTTON_PAUSE_ID);
const buttonReset = document.getElementById(BUTTON_RESET_ID);

export const onStateChange: StateChangeHandler = (state) => {
  switch(state) {
    case GameState.inited:
      buttonPlay.classList.remove('button_disabled');
      buttonPause.classList.add('button_disabled');
      buttonReset.classList.remove('button_disabled');
      break;

    case GameState.started:
      buttonPlay.classList.add('button_disabled');
      buttonPause.classList.remove('button_disabled');
      buttonReset.classList.add('button_disabled');
      break;

    case GameState.paused:
      buttonPlay.classList.remove('button_disabled');
      buttonPause.classList.add('button_disabled');
      buttonReset.classList.remove('button_disabled');
      break;
  }
}

export const initButtonHandlers = (
  start: () => void,
  pause: () => void,
  reset: () => void,
) => {
  buttonPlay.addEventListener('click', start);
  buttonPause.addEventListener('click', pause);
  buttonReset.addEventListener('click', reset);
};
