import { CellHandler, IRenderer } from './type';

type ClassNames = {
  field?: string;
  row?: string;
  cell?: string;
  cellAlive?: string;
};

export class HTMLRenderer implements IRenderer {
  targetElement: HTMLElement;
  width: number;
  height: number;
  classNames: ClassNames;
  fieldElement: HTMLElement;
  fieldModel: Array<Array<HTMLElement>>;

  defaultClassNames: ClassNames = {
    field: 'field',
    row: 'row',
    cell: 'cell',
    cellAlive: 'cell_alive',
  };

  constructor(
    targetElement: HTMLElement,
    width: number,
    height: number,
    options: { classNames: ClassNames },
  ) {
    this.targetElement = targetElement;
    this.width = width;
    this.height = height;
    this.classNames = { ...this.defaultClassNames, ...options.classNames };
    this.createFieldModel();
  }

  createFieldModel() {
    this.fieldModel = [...new Array(this.height)].map(() => new Array(this.width));
  }

  reviveCell(rowIndex: number, columnIndex: number) {
    this.fieldModel[rowIndex][columnIndex].classList.add(this.classNames.cellAlive);
  }

  killCell(rowIndex: number, columnIndex: number) {
    this.fieldModel[rowIndex][columnIndex].classList.remove(this.classNames.cellAlive);
  }

  renderField() {
    this.fieldElement = document.createElement('div');
    this.fieldElement.className = this.classNames.field;

    for (let rowIndex = 0; rowIndex < this.height; rowIndex += 1) {
      const row = document.createElement('div');
      row.className = this.classNames.row;

      for (let columnIndex = 0; columnIndex < this.width; columnIndex += 1) {
        const cell = document.createElement('div');
        cell.className = this.classNames.cell;
        cell.dataset.row = String(rowIndex);
        cell.dataset.column = String(columnIndex);
        this.fieldModel[rowIndex][columnIndex] = cell;
        row.appendChild(cell);
      }

      this.fieldElement.appendChild(row);
    }

    this.targetElement.appendChild(this.fieldElement);
  }

  setClickHandler = (onClickCallback: CellHandler) => {
    this.fieldElement.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      if (!(target).classList.contains(this.classNames.cell)) return;

      onClickCallback(Number(target.dataset.row), Number(target.dataset.column));
    });
  }

  getAllAliveCells() {
    const liveCellsCollection = this.fieldElement.querySelectorAll(`.${this.classNames.cellAlive}`);
    return Array.prototype.slice.call(liveCellsCollection, 0);
  }

  reset() {
    this.getAllAliveCells().forEach((cell: HTMLElement) => {
      const { row, column } = cell.dataset;
      this.killCell(Number(row), Number(column));
    });
  }
};
