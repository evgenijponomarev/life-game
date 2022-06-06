import { IRenderer, IRendererConstructor } from '../renderer';
import { gliderGun } from './presets';

export enum GameState {
  inited = 'inited',
  started = 'started',
  stopped = 'stopped',
}

export enum Preset {
  gliderGun = 'gliderGun',
}

export type StateChangeHandler = (state: GameState) => void;

type Generation = Array<Array<boolean>>;

type CellList = Array<[number, number]>;

export class Game {
  state: GameState = GameState.inited;
  history: Array<string> = [];
  width: number;
  height: number;
  intervalTime: number;
  renderer: IRenderer;
  currentGeneration: Generation;
  interval: NodeJS.Timer;
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
    this.renderer.setToggleHandler(this.onCellToggle);
    this.resetCurrentGeneration();
    this.onStateChange = onStateChange;
  }
  
  setState = (newState: GameState) => {
    if (this.onStateChange && newState !== this.state) {
      this.onStateChange(newState);
    }
    this.state = newState;

    console.log(`Game ${newState}`);
  }

  getGenerationCode = (generation: Generation) => {
    return generation.map(row => row.map(v => Number(v)).join('')).join('');
  }

  resetCurrentGeneration = () => {
    this.currentGeneration = [...new Array(this.height)].map(() => [...new Array(this.width)].map(() => false));
  }
  
  onCellToggle = (rowIndex: number, columnIndex: number) => {
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

    const neighbors: Array<[number, number]> = [];

    rowIndexes.forEach(ri => {
      columnIndexes.forEach(ci => {
        if (ri === rowIndex && ci === columnIndex) return;

        neighbors.push([ri, ci]);
      });
    });

    return neighbors;
  }

  getGenerationDiff = (newGeneration: Generation): Array<[number, number]> => newGeneration.reduce((rowsAcc, row, rowIndex) => [
    ...rowsAcc,
    ...row.reduce((cellsAcc, isAlive, columnIndex) => [
      ...cellsAcc,
      ...(isAlive !== this.currentGeneration[rowIndex][columnIndex] ? [[rowIndex, columnIndex]] : []),
    ], []),
  ], []);

  getCurrentLiveCells = () => this.currentGeneration.reduce((rowAcc, row, rowIndex) => [
    ...rowAcc,
    ...row.reduce((columnAcc, isLive, columnIndex) => [
      ...columnAcc,
      ...(isLive ? [[rowIndex, columnIndex]] : []),
    ],[]),
  ], []);

  getDiffForNextGeneration = () => {
    const diff: Array<[number, number]> = [];
    const affectedDeadCells: Set<string>  = new Set();

    const liveCells = this.getCurrentLiveCells();

    liveCells.forEach(([rowIndex, columnIndex]) => {
      const cellIsLive = this.currentGeneration[rowIndex][columnIndex];
      const neighbors = this.getCellNeigbors(rowIndex, columnIndex);
      let liveNeighborsCount = 0;

      neighbors.forEach(([ri, ci]) => {
        if (this.currentGeneration[ri][ci]) {
          liveNeighborsCount += 1;
        } else {
          affectedDeadCells.add(`${ri},${ci}`);
        }
      });

      if (
        cellIsLive && liveNeighborsCount !== 2 && liveNeighborsCount !== 3 ||
        !cellIsLive && liveNeighborsCount === 3
      ) {
        diff.push([rowIndex, columnIndex]);
      }
    });

    [...affectedDeadCells].forEach(c => {
      const [rowIndex, columnIndex] = c.split(',').map(Number);
      const neighbors = this.getCellNeigbors(rowIndex, columnIndex);
      const liveNeighbors = neighbors.filter(([ri, ci]) => this.currentGeneration[ri][ci]);
      if (liveNeighbors.length === 3) diff.push([rowIndex, columnIndex]);
    });

    return diff;
  }

  findGenerationIndex = (generationCode: string) => this.history.indexOf(generationCode);

  applyGeneration = (generation: Generation) => {
    const changedCells = this.getGenerationDiff(generation);
    this.applyGenerationDiff(changedCells);
  }

  applyGenerationDiff = (changedCells: CellList) => {
    changedCells.forEach(cell => this.toggleCell(...cell));

    if (this.state !== GameState.started) return;

    if (changedCells.length === 0) {
      this.stop();
      alert(`Population became stable on the ${this.history.length}'th generation`);
      return;
    }

    const generationCode = this.getGenerationCode(this.currentGeneration);
    const duplicatedGenerationIndex = this.findGenerationIndex(generationCode);

    if (duplicatedGenerationIndex > -1) {
      this.stop();
      alert(`On the ${duplicatedGenerationIndex + 1}'th generation started repeatable period with length ${this.history.length - duplicatedGenerationIndex}`);
    }
  }

  makeNextGeneration = () => {
    const diff = this.getDiffForNextGeneration();
    this.applyGenerationDiff(diff as Array<[number, number]>);
    this.saveCurrentGenerationToHistory();
  }

  getGenerationByCode = (generationCode: string) => {
    return generationCode.split('').reduce((acc, value, index) => {
      const newAcc = acc.slice(0);
      if (index % this.width === 0) {
        newAcc.push([]);
      }
      newAcc[newAcc.length - 1].push(Boolean(Number(value)));
      return newAcc;
    }, []);
  }

  saveCurrentGenerationToHistory = () => {
    const currentGenerationCode = this.getGenerationCode(this.currentGeneration);
    const lastGenerationCode = this.history[this.history.length - 1];

    if (currentGenerationCode === lastGenerationCode) return;

    this.history.push(currentGenerationCode);
  }

  start = () => {
    this.saveCurrentGenerationToHistory();
    this.setState(GameState.started);
    this.interval = setInterval(() => {
      if (this.state !== GameState.started) return;

      this.makeNextGeneration();
    }, this.intervalTime);
  }

  stop = () => {
    this.setState(GameState.stopped);
    clearInterval(this.interval);
  }

  goBack = () => {
    if (this.history.length < 2) return;

    const prevGenerationCode = this.history.slice(-2)[0];
    this.history = this.history.slice(0, -1);
    const prevGeneration = this.getGenerationByCode(prevGenerationCode);
    this.applyGeneration(prevGeneration);
  }

  goNext = () => {
    this.saveCurrentGenerationToHistory();
    this.makeNextGeneration();
  }

  reset = () => {
    if (this.state === GameState.started) return;
    this.resetCurrentGeneration();
    this.history = [];
    this.renderer.reset();
    this.setState(GameState.inited);
  }

  applyPreset = (preset: Preset) => {
    this.reset();

    switch(preset) {
      case Preset.gliderGun:
        this.applyGeneration(gliderGun.map(r => r.map(c => Boolean(c))));
        break;

      default:
    }
  }
}
