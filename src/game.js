/**
 * Game Engine for Number Puzzle
 * Manages game state, moves, and history
 */

import { operations, isValidOperation } from './operations.js';

/**
 * Create initial game state
 */
export function createGameState(goalNumber = 10, level = 1) {
  return {
    current: 1,
    goal: goalNumber,
    level: level,
    moves: 0,
    history: [{ action: 'START', value: 1 }],
    isComplete: false,
    startTime: Date.now()
  };
}

/**
 * Apply a move and return new game state
 */
export function applyMove(state, operation) {
  if (!isValidOperation(operation)) {
    throw new Error(`Invalid operation: ${operation}`);
  }

  if (state.isComplete) {
    return state; // Can't move after completion
  }

  const newValue = operations[operation](state.current);
  const newState = {
    ...state,
    current: newValue,
    moves: state.moves + 1,
    history: [
      ...state.history,
      { action: operation.toUpperCase(), value: newValue }
    ]
  };

  // Check if goal is reached
  newState.isComplete = newValue === state.goal;
  if (newState.isComplete) {
    newState.completionTime = Date.now();
    newState.duration = newState.completionTime - state.startTime;
  }

  return newState;
}

/**
 * Reset game to initial state
 */
export function resetGame(goalNumber = 10, level = 1) {
  return createGameState(goalNumber, level);
}

/**
 * Get formatted game stats
 */
export function getGameStats(state) {
  return {
    moves: state.moves,
    current: state.current,
    goal: state.goal,
    level: state.level,
    progress: `${state.current}/${state.goal}`,
    isComplete: state.isComplete,
    duration: state.duration ? Math.round(state.duration / 1000) : 0
  };
}