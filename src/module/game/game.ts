import { IRenderer, IRendererConstructor } from '../html-renderer';

export enum GameState {
  inited = 'inited',
  started = 'started',
  paused = 'paused',
}

export type StateChangeHandler = (state: GameState) => void;

export class Game {
  width: number;
  height: number;
  renderer: IRenderer;
  state: GameState;
  fieldModel: Array<Array<boolean>>;
  onStateChange: StateChangeHandler

  constructor(
    targetElement: HTMLElement,
    width: number,
    height: number,
    Renderer: IRendererConstructor,
    onStateChange?: StateChangeHandler,
    rendererOptions?: unknown,
  ) {
    this.width = width;
    this.height = height;
    this.renderer = new Renderer(targetElement, width, height, rendererOptions);
    this.renderer.renderField();
    this.renderer.setClickHandler(this.toggleCell);
    this.resetFieldModel();
    this.onStateChange = onStateChange;
    this.setState(GameState.inited);
  }

  setState(newState: GameState) {
    this.state = newState;
    this.onStateChange(newState);
  }

  resetFieldModel() {
    this.fieldModel = [...new Array(this.height)].map(() => [...new Array(this.width)].map(() => false));
  }

  toggleCell = (rowIndex: number, columnIndex: number) => {
    if (this.state === GameState.started) return;

    const newValue = !this.fieldModel[rowIndex][columnIndex];
    this.fieldModel[rowIndex][columnIndex] = newValue;

    if (newValue) {
      this.renderer.reviveCell(rowIndex, columnIndex);
    } else {
      this.renderer.killCell(rowIndex, columnIndex);
    }
  }

  start = () => {
    this.setState(GameState.started);
  }

  pause = () => {
    this.setState(GameState.paused);
  }

  reset = () => {
    if (this.state === GameState.started) return;
    this.resetFieldModel();
    this.renderer.reset();
    this.setState(GameState.inited);
  }
}
