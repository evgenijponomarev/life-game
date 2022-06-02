export type CellHandler = (rowIndex: number, cellIndex: number) => void;

export interface IRenderer {
  targetElement: HTMLElement;
  width: number;
  height: number;
  reviveCell: CellHandler
  killCell: CellHandler
  renderField: () => void;
  setClickHandler(cb: CellHandler): void;
  reset: () => void;
}

export interface IRendererConstructor {
  new(targetElement: HTMLElement, width: number, height: number, options?: {}): IRenderer;
}
