/* eslint-disable @typescript-eslint/no-empty-function */

import { IRenderer } from '../module/html-renderer/type';

export class RendererMock implements IRenderer {
  targetElement: HTMLElement;
  width: number;
  height: number;

  constructor(
    targetElement: HTMLElement,
    width: number,
    height: number,
  ) {
    this.targetElement = targetElement;
    this.width = width;
    this.height = height;
  }
  reviveCell = () => {}
  killCell = () => {}
  renderField = () => {}
  setToggleHandler = () => {}
  reset = () => {}
}
