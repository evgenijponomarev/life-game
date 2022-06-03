import { IRenderer, IRendererConstructor } from '../html-renderer';

export enum GameState {
  inited = 'inited',
  started = 'started',
  stopped = 'stopped',
}

export type StateChangeHandler = (state: GameState) => void;

type Generation = Array<Array<boolean>>;

export class Game {
  width: number;
  height: number;
  intervalTime: number;
  renderer: IRenderer;
  state: GameState;
  currentGeneration: Generation;
  interval: NodeJS.Timer;
  history: Array<string> = [];
  onStateChange: StateChangeHandler

  constructor(
    targetElement: HTMLElement,
    width: number,
    height: number,
    intervalTime: number,
    Renderer: IRendererConstructor,
    onStateChange?: StateChangeHandler,
    rendererOptions?: unknown,
  ) {
    this.width = width;
    this.height = height;
    this.intervalTime = intervalTime;
    this.renderer = new Renderer(targetElement, width, height, rendererOptions);
    this.renderer.renderField();
    this.renderer.setClickHandler(this.onClickCell);
    this.resetCurrentGeneration();
    this.onStateChange = onStateChange;
    this.setState(GameState.inited);
  }

  setState(newState: GameState) {
    this.state = newState;
    console.log(`Game ${newState}`);
    this.onStateChange(newState);
  }

  resetCurrentGeneration() {
    this.currentGeneration = [...new Array(this.height)].map(() => [...new Array(this.width)].map(() => false));
  }
  
  onClickCell = (rowIndex: number, columnIndex: number) => {
    if (this.state === GameState.started) return;

    this.toggleCell(rowIndex, columnIndex);
  }

  toggleCell = (rowIndex: number, columnIndex: number) => {
    const newValue = !this.currentGeneration[rowIndex][columnIndex];
    this.currentGeneration[rowIndex][columnIndex] = newValue;

    if (newValue) {
      this.renderer.reviveCell(rowIndex, columnIndex);
    } else {
      this.renderer.killCell(rowIndex, columnIndex);
    }
  }

  getCellNeigbors = (rowIndex: number, columnIndex: number) => {
    const lastRowIndex = this.height - 1;
    const lastColumnIndex = this.width - 1;

    const prevRowIndex = rowIndex > 0 ? rowIndex - 1 : lastRowIndex;
    const nextRowIndex = rowIndex < lastRowIndex ? rowIndex + 1 : 0;

    const prevColumnIndex = columnIndex > 0 ? columnIndex - 1 : lastColumnIndex;
    const nextColumnIndex = columnIndex < lastColumnIndex ? columnIndex + 1 : 0;

    const rowIndexes = [prevRowIndex, rowIndex, nextRowIndex];
    const columnIndexes = [prevColumnIndex, columnIndex, nextColumnIndex];

    const neighbors: Array<boolean> = [];

    rowIndexes.forEach(ri => {
      columnIndexes.forEach(ci => {
        if (ri === rowIndex && ci === columnIndex) return;

        neighbors.push(this.currentGeneration[ri][ci]);
      });
    });

    return neighbors;
  }

  getLifeNeighborsCount = (rowIndex: number, columnIndex: number) => {
    const neighbors = this.getCellNeigbors(rowIndex, columnIndex);
    return neighbors.filter(n => n).length;
  }

  cellShouldLive = (rowIndex: number, columnIndex: number) => {
    const isLife = this.currentGeneration[rowIndex][columnIndex];
    const lifeNeighborsCount = this.getLifeNeighborsCount(rowIndex, columnIndex);

    return !isLife && lifeNeighborsCount === 3 ||
      isLife && lifeNeighborsCount > 1 && lifeNeighborsCount < 4;
  }

  getGenerationDiff = (newGeneration: Generation): Array<[number, number]> => newGeneration.reduce((rowsAcc, row, rowIndex) => [
    ...rowsAcc,
    ...row.reduce((cellsAcc, isAlive, columnIndex) => [
      ...cellsAcc,
      ...(isAlive !== this.currentGeneration[rowIndex][columnIndex] ? [[rowIndex, columnIndex]] : []),
    ], []),
  ], []);

  getNextGeneration = () => {
    const newGeneration = [...this.currentGeneration.map(row => [...row])];

    for (let rowIndex = 0; rowIndex < this.height; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < this.width; columnIndex += 1) {
        newGeneration[rowIndex][columnIndex] = this.cellShouldLive(rowIndex, columnIndex);
      }
    }

    return newGeneration;
  }

  getGenerationCode = (generation: Generation) => {
    return generation.map(row => row.map(v => Number(v)).join('')).join('');
  }

  findGenerationIndex = (generationCode: string) => {
    return this.history.indexOf(generationCode);
  }

  applyGeneration = (generation: Generation, checkState = false) => {
    const changedCells = this.getGenerationDiff(generation);

    if (checkState && changedCells.length === 0) {
      alert('Stable state of generation');
      this.stop();
      return;
    }

    changedCells.forEach(cell => this.toggleCell(...cell));
  }

  makeNextGeneration = () => {
    const newGeneration = this.getNextGeneration();
    const newGenerationCode = this.getGenerationCode(newGeneration);
    const generationIndex = this.findGenerationIndex(newGenerationCode);

    if (generationIndex > -1) {
      this.stop();
      alert(`Repeatable period: ${this.history.length - generationIndex} generations`);
      return;
    }

    this.history.push(newGenerationCode);

    this.applyGeneration(newGeneration, true);
  }

  makeGenerationByCode = (generationCode: string) => {
    return generationCode.split('').reduce((acc, value, index) => {
      const newAcc = acc.slice(0);
      if (index % this.width === 0) {
        newAcc.push([]);
      }
      newAcc[newAcc.length - 1].push(Boolean(Number(value)));
      return newAcc;
    }, []);
  }

  pushToHistory = () => {
    const generationCode = this.getGenerationCode(this.currentGeneration);

    if (this.findGenerationIndex(generationCode) === -1) {
      this.history.push(generationCode);
    }
  }

  start = () => {
    this.setState(GameState.started);
    this.pushToHistory();
    this.interval = setInterval(this.makeNextGeneration, this.intervalTime);
  }

  stop = () => {
    this.setState(GameState.stopped);
    clearInterval(this.interval);
  }

  goBack = () => {
    if (this.history.length < 2) return;

    const prevGenerationCode = this.history.slice(-2)[0];
    this.history = this.history.slice(0, -1);
    const prevGeneration = this.makeGenerationByCode(prevGenerationCode);
    this.applyGeneration(prevGeneration);
  }

  goNext = () => {
    this.pushToHistory();
    this.makeNextGeneration();
  }

  reset = () => {
    if (this.state === GameState.started) return;
    this.resetCurrentGeneration();
    this.history = [];
    this.renderer.reset();
    this.setState(GameState.inited);
  }
}
