import { IRenderer, IRendererConstructor } from './renderer';

enum GameState {
  inited = 'inited',
  started = 'started',
  paused = 'paused',
}

export class Game {
  width: number;
  height: number;
  renderer: IRenderer;
  state: GameState;
  fieldModel: Array<Array<boolean>>;


  constructor(
    targetElement: HTMLElement,
    width: number,
    height: number,
    Renderer: IRendererConstructor,
    rendererOptions: unknown = {},
  ) {
    this.width = width;
    this.height = height;
    this.renderer = new Renderer(targetElement, width, height, rendererOptions);
    this.renderer.renderField();
    this.renderer.setClickHandler(this.toggleCell);
    this.resetFieldModel();
    this.state = GameState.inited;
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
    this.state = GameState.started;
  }

  pause = () => {
    this.state = GameState.paused;
  }

  reset = () => {
    if (this.state === GameState.started) return;
    this.resetFieldModel();
    this.renderer.reset();
    this.state = GameState.inited;
  }
}
