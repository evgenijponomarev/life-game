export type CellHandler = (rowIndex: number, cellIndex: number) => void;

export interface IRenderer {
  targetElement: HTMLElement;
  width: number;
  height: number;
  reviveCell: CellHandler
  killCell: CellHandler
  renderField: () => void;
  setToggleHandler(cb: CellHandler): void;
  reset: () => void;
}

export interface IRendererConstructor {
  new(targetElement: HTMLElement, width: number, height: number, options?: unknown): IRenderer;
}
