import { describe, it, expect } from '@jest/globals';
import { Game, GameState } from '../module/game';
import { RendererMock } from '../mocks/renderer.mock';

describe('Game', () => {
  it('State to be "inited"', () => {
    const targetElement = document.createElement('div');
    const game = new Game(targetElement, 100, 100, 100, RendererMock);
    expect(game.state).toBe(GameState.inited);
    expect(1 + 2).toBe(3);
  });
});
