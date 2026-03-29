/**
 * Game Engine for Number Puzzle
 * Manages game state, moves, and history
 */

import { operationLabels, operations, isValidOperation } from "./operations.js";

/**
 * GameState class for managing game state, moves, and history
 */
export class GameState {
  constructor(goalNumber = 10, level = 1) {
    this.current = 1;
    this.goal = goalNumber;
    this.level = level;
    this.moves = 0;
    this.moveLimit = 12;
    this.history = [{ action: "START", value: 1 }];
    this.isComplete = false;
    this.startTime = Date.now();
    this.hints = {
      used: 0,
      maxHints: 3,
      hintsData: [],
    };
  }

  /**
   * Apply a move and return new game state
   */
  applyMove(operation) {
    if (!isValidOperation(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (this.isComplete) {
      return this; // Can't move after completion
    }

    const newValue = operations[operation](this.current);
    const newState = new GameState(this.goal, this.level);
    
    // Copy current state to new state
    newState.current = newValue;
    newState.moves = this.moves + 1;
    newState.moveLimit = this.moveLimit;
    newState.startTime = this.startTime;
    newState.history = [
      ...this.history,
      {
        action: (operationLabels[operation] ?? operation).toUpperCase(),
        value: newValue,
      },
    ];
    
    // Only clear cached hints but keep progression counter
    newState.hints = {
      ...this.hints,
      hintsData: [], // Clear old hints since optimal path changed
    };

    // Check if goal is reached
    newState.isComplete = newValue === this.goal;
    if (newState.isComplete) {
      newState.completionTime = Date.now();
      newState.duration = newState.completionTime - this.startTime;
    }

    return newState;
  }

  /**
   * Reset to initial state and return new game state
   */
  reset(goalNumber = this.goal, level = this.level) {
    return new GameState(goalNumber, level);
  }

  /**
   * Create a copy of the current state
   */
  clone() {
    const newState = new GameState(this.goal, this.level);
    newState.current = this.current;
    newState.moves = this.moves;
    newState.moveLimit = this.moveLimit;
    newState.startTime = this.startTime;
    newState.history = [...this.history];
    newState.isComplete = this.isComplete;
    newState.hints = {
      used: this.hints.used,
      maxHints: this.hints.maxHints,
      hintsData: [...this.hints.hintsData],
    };
    
    if (this.completionTime) {
      newState.completionTime = this.completionTime;
      newState.duration = this.duration;
    }
    
    return newState;
  }
}

// Backwards compatibility exports
export function createGameState(goalNumber = 10, level = 1) {
  return new GameState(goalNumber, level);
}

export function applyMove(state, operation) {
  return state.applyMove(operation);
}
