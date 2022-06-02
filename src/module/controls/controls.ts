import { StateChangeHandler, GameState } from '../game';

const BUTTON_PLAY_ID = 'button-play';
const BUTTON_STOP_ID = 'button-stop';
const BUTTON_RESET_ID = 'button-reset';

const buttonPlay = document.getElementById(BUTTON_PLAY_ID);
const buttonStop = document.getElementById(BUTTON_STOP_ID);
const buttonReset = document.getElementById(BUTTON_RESET_ID);

export const onStateChange: StateChangeHandler = (state) => {
  switch(state) {
    case GameState.inited:
      buttonPlay.classList.remove('button_disabled');
      buttonStop.classList.add('button_disabled');
      buttonReset.classList.remove('button_disabled');
      break;

    case GameState.started:
      buttonPlay.classList.add('button_disabled');
      buttonStop.classList.remove('button_disabled');
      buttonReset.classList.add('button_disabled');
      break;

    case GameState.stopped:
      buttonPlay.classList.remove('button_disabled');
      buttonStop.classList.add('button_disabled');
      buttonReset.classList.remove('button_disabled');
      break;
  }
}

export const initButtonHandlers = (
  start: () => void,
  stop: () => void,
  reset: () => void,
) => {
  buttonPlay.addEventListener('click', start);
  buttonStop.addEventListener('click', stop);
  buttonReset.addEventListener('click', reset);
};
