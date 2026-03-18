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
 * Get hints for current level
 */
export function getHints(level, currentNumber) {
  const hints = {
    0: [ // Beginner (1 → 10)
      "Try using ×2 to grow your number quickly!",
      "Use SUM when your number gets too big",
      "ADD 1 can help create interesting patterns", 
      "MIRROR can sometimes give you useful reversals"
    ],
    1: [ // Intermediate (1 → 25) 
      "Think about getting to 24 first, then ADD 1",
      "×2 repeatedly: 1→2→4→8→16... then what?",
      "Try MIRROR on two-digit numbers",
      "SUM can help reduce large numbers strategically"
    ],
    2: [ // Expert (1 → 128)
      "128 = 2^7... think powers of 2",
      "64 × 2 = 128. How can you reach 64?", 
      "Try: 1→11→2→4→8→16→32→64→128",
      "Advanced: Use digit manipulation creatively"
    ]
  };
  
  const levelHints = hints[level] || hints[0];
  
  // Smart hint selection based on current number
  if (currentNumber === 1) {
    return levelHints[0]; 
  } else if (currentNumber > 50) {
    return "Consider using SUM to reduce the number";
  } else if (currentNumber % 2 === 0 && currentNumber < 64) {
    return "Perfect for ×2! Keep doubling when possible";
  } else {
    return levelHints[Math.floor(Math.random() * levelHints.length)];
  }
}

/**
 * Get optimal move count for each level
 */
export function getOptimalMoves(level) {
  const optimal = [7, 9, 12]; // Rough optimal moves for each level
  return optimal[level] || 10;
}

/**
 * Get level completion message
 */
export function getLevelCompletionData(level, moves) {
  const optimal = getOptimalMoves(level);
  const efficiency = moves <= optimal ? "Perfect!" : moves <= optimal + 2 ? "Great!" : moves <= optimal + 4 ? "Good!" : "Try again!";
  
  const messages = {
    0: {
      title: "🎯 Beginner Conquered!",
      message: `You mastered the basics! ${efficiency}`,
      emoji: "🌟"
    },
    1: {
      title: "🚀 Intermediate Complete!", 
      message: `Excellent strategic thinking! ${efficiency}`,
      emoji: "⭐"
    },
    2: {
      title: "👑 Expert Master!",
      message: `You're a Number Puzzle champion! ${efficiency}`,
      emoji: "🏆"
    }
  };
  
  return messages[level] || messages[0];
}