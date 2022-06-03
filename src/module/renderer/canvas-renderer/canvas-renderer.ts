import { IRenderer, CellHandler } from '../type';

const className = 'field';

export class CanvasRenderer implements IRenderer {
  targetElement: HTMLElement;
  width: number;
  height: number;
  fieldWidth: number;
  fieldHeight: number;
  cellWidth = 10;
  cellHeight = 10;
  fieldElement: HTMLCanvasElement;
  canvasСontext: CanvasRenderingContext2D;

  constructor(
    targetElement: HTMLElement,
    width: number,
    height: number,
  ) {
    this.targetElement = targetElement;
    this.width = width;
    this.height = height;
  }

  renderField = () => {
    this.fieldWidth = this.cellWidth * this.width;
    this.fieldHeight = this.cellHeight * this.height;
    this.fieldElement = document.createElement('canvas');
    this.fieldElement.setAttribute('width', String(this.fieldWidth));
    this.fieldElement.setAttribute('height', String(this.fieldHeight));
    this.fieldElement.className = className;
    this.canvasСontext = this.fieldElement.getContext('2d');

    this.drowEmptyField();

    this.targetElement.appendChild(this.fieldElement);
  }

  getCellIndexByPixelOffset = (x: number, y: number) => {
    return [
      Math.floor(x / this.cellWidth),
      Math.floor(y / this.cellHeight),
    ];
  }

  getPixelOffsetByCellIndex = (x: number, y: number) => {
    return [
      x * this.cellWidth,
      y * this.cellHeight,
    ];
  }

  setToggleHandler = (onCellToggle: CellHandler) => {
    this.fieldElement.addEventListener('click', event => {
      const { offsetX, offsetY } = event;
      const [rowIndex, columnIndex] = this.getCellIndexByPixelOffset(offsetX, offsetY);

      onCellToggle(rowIndex, columnIndex);
    });
  }

  reviveCell = (rowIndex: number, columnIndex: number) => {
    const [offsetX, offsetY] = this.getPixelOffsetByCellIndex(rowIndex, columnIndex);
    this.canvasСontext.fillRect(offsetX + 1, offsetY + 1, this.cellWidth - 2, this.cellWidth - 2);
  }

  killCell = (rowIndex: number, columnIndex: number) => {
    const [offsetX, offsetY] = this.getPixelOffsetByCellIndex(rowIndex, columnIndex);
    this.canvasСontext.clearRect(offsetX + 1, offsetY + 1, this.cellWidth - 2, this.cellWidth - 2);
  }

  drowEmptyField = () => {
    this.canvasСontext.beginPath();

    for (let rowIndex = 0; rowIndex <= this.height; rowIndex += 1) {
      this.canvasСontext.moveTo(0, this.cellHeight * rowIndex);
      this.canvasСontext.lineTo(this.fieldWidth, this.cellHeight * rowIndex);
    }

    for (let columnIndex = 0; columnIndex <= this.height; columnIndex += 1) {
      this.canvasСontext.moveTo(this.cellWidth * columnIndex, 0);
      this.canvasСontext.lineTo(this.cellWidth * columnIndex, this.fieldHeight);
    }

    this.canvasСontext.stroke();
    this.canvasСontext.closePath();
  }

  reset = () => {
    this.canvasСontext.clearRect(0, 0, this.fieldWidth, this.fieldHeight);
    this.drowEmptyField();
  }
}
