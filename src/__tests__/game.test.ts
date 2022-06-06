import { describe, it, expect } from '@jest/globals';
import { Game, GameState } from '../module/game';
import { RendererMock } from '../mocks/renderer.mock';

const getGenerationStub = (code: 'empty' | 'cross' | 'with11' | 'square') => {
  const generationStub = {
    empty: [
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ],
    cross: [
      [false, false, false, false, false],
      [false, false, true,  false, false],
      [false, true,  true,  true,  false],
      [false, false, true,  false, false],
      [false, false, false, false, false],
    ],
    with11: [
      [false, false, false, false, false],
      [false, true,  false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
      [false, false, false, false, false],
    ],
    square: [
      [false, false, false, false, false],
      [false, true,  true,  true,  false],
      [false, true,  false, true,  false],
      [false, true,  true,  true,  false],
      [false, false, false, false, false],
    ],
  };

  return generationStub[code].slice(0);
};

describe('Game', () => {
  describe('Constructor', () => {
    it('should set inited state', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 100, 100, 100, RendererMock);
      expect(game.state).toBe(GameState.inited);
    });

    it('should set empty generation', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      expect(game.currentGeneration).toEqual(getGenerationStub('empty'));
    });
  });

  describe('start', () => {
    it('should trigger state change hadler', () => {
      const stateChangeCb = jest.fn();
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock, stateChangeCb);
      game.start();
      expect(stateChangeCb).toHaveBeenCalledWith(GameState.started);
    });
  });

  describe('getGenerationCode', () => {
    it('should correctly encode generation for history', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      const code = game.getGenerationCode(getGenerationStub('cross'));
      expect(code).toBe('0000000100011100010000000');
    });
  });

  describe('setCurrentGeneration', () => {
    it("should save current generation if it's not match the last one", () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      game.currentGeneration = getGenerationStub('empty');
      game.currentGeneration = getGenerationStub('cross');
      expect(game.history.length).toBe(3);
      expect(game.history[game.history.length - 1]).toBe('0000000100011100010000000');
    });

    it("should not save current generation if it's match the last one", () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('empty');
      game.currentGeneration = getGenerationStub('cross');
      game.currentGeneration = getGenerationStub('cross');
      expect(game.history.length).toBe(2);
      expect(game.history[game.history.length - 1]).toBe('0000000100011100010000000');
    });
  });

  describe('resetCurrentGeneration', () => {
    it('should set empty generation', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('empty');
      game.currentGeneration = getGenerationStub('cross');
      game.currentGeneration = getGenerationStub('cross');
      game.resetCurrentGeneration();
      expect(game.currentGeneration).toEqual(getGenerationStub('empty'));
    });
  });

  describe('toggleCell', () => {
    it('should toggle cell', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.renderer.reviveCell = jest.fn();
      game.toggleCell(1, 1);
      expect(game.currentGeneration).toEqual(getGenerationStub('with11'));
      expect(game.renderer.reviveCell).toBeCalledWith(1, 1);
    });
  });

  describe('getCellNeigbors', () => {
    it('should correctly return cell neighbors', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      const neighbors = game.getCellNeigbors(2, 2);
      expect(neighbors).toEqual([false, true, false, true, true, false, true, false]);
    });
  });

  describe('cellShouldLive', () => {
    it('should correctly detect if cell should live', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      const shouldCellLive = game.cellShouldLive(2, 2);
      expect(shouldCellLive).toBe(false);
    });
  });

  describe('getGenerationDiff', () => {
    it('should correctly return generations difference', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      const diff = game.getGenerationDiff(getGenerationStub('square'));
      expect(diff).toEqual([[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]]);
    });
  });

  describe('getDiffForNextGeneration', () => {
    it('should correctly return diff for next generation', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      const nextGeneration = game.getDiffForNextGeneration();
      expect(nextGeneration).toEqual([[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]]);
    });
  });

  describe('makeNextGeneration', () => {
    it('should create, apply and save to history next generation', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      game.makeNextGeneration();
      expect(game.currentGeneration).toEqual(getGenerationStub('square'));
      expect(game.history.length).toBe(2);
    });
  });

  describe('makeGenerationByCode', () => {
    it('shuld correctly decode generation from history', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      const generation = game.getGenerationByCode('0000000100011100010000000');
      expect(generation).toEqual(getGenerationStub('cross'));
    });
  });

  describe('goNext', () => {
    it('should correctly apply next generation', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      game.goNext();
      expect(game.currentGeneration).toEqual(getGenerationStub('square'));
    });
  });

  describe('goBack', () => {
    it('should correctly apply previous generation', () => {
      const targetElement = document.createElement('div');
      const game = new Game(targetElement, 5, 5, 100, RendererMock);
      game.currentGeneration = getGenerationStub('cross');
      game.goNext();
      expect(game.currentGeneration).toEqual(getGenerationStub('square'));
      game.goBack();
      expect(game.currentGeneration).toEqual(getGenerationStub('cross'));
    });
  });
});
