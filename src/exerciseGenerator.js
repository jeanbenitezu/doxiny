/**
 * Simple Exercise Generator for Number Puzzle
 * Creates solvable exercises with appropriate difficulty scaling
 */

import { operations } from './operations.js';

/**
 * Simple difficulty configuration
 */
const difficultyLevels = {
  1: { 
    name: 'Beginner',
    description: 'Learn the basics',
    targetMoves: [3, 6],
    goalRange: [5, 20]
  },
  2: { 
    name: 'Easy',
    description: 'Building confidence',
    targetMoves: [4, 8],
    goalRange: [10, 50]
  },
  3: { 
    name: 'Medium',
    description: 'Strategic thinking',
    targetMoves: [5, 10],
    goalRange: [20, 100]
  },
  4: { 
    name: 'Hard',
    description: 'Advanced tactics',
    targetMoves: [6, 12],
    goalRange: [50, 200]
  },
  5: { 
    name: 'Expert',
    description: 'Master level',
    targetMoves: [7, 15],
    goalRange: [100, 500]
  },
  6: { 
    name: 'Insane',
    description: 'Ultimate challenge',
    targetMoves: [10, 20],
    goalRange: [200, 1000]
  }
};

/**
 * Generate a simple exercise by trying random goals within range
 */
function generateSimpleExercise(difficulty) {
  const config = difficultyLevels[difficulty];
  const [minGoal, maxGoal] = config.goalRange;
  
  // Try a few goals and pick the first solvable one
  for (let attempt = 0; attempt < 10; attempt++) {
    const goal = Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal;
    const validation = validateExercise(goal, 20);
    
    if (validation.solvable && 
        validation.minMoves >= config.targetMoves[0] && 
        validation.minMoves <= config.targetMoves[1] + 3) {
      return {
        goal,
        optimalMoves: validation.minMoves,
        solutionPath: validation.solutionPath
      };
    }
  }
  
  // Fallback to known good goals
  const fallbackGoals = {
    1: 10, 2: 25, 3: 64, 4: 128, 5: 256, 6: 512
  };
  const fallbackGoal = fallbackGoals[difficulty] || 64;
  const validation = validateExercise(fallbackGoal);
  
  return {
    goal: fallbackGoal,
    optimalMoves: validation.minMoves,
    solutionPath: validation.solutionPath
  };
}

/**
 * Validate that an exercise is actually solvable
 */
function validateExercise(goal, maxMoves = 20) {
  // Simple BFS to verify solvability
  const queue = [{ current: 1, steps: 0, path: [] }];
  const visited = new Set([1]);
  
  while (queue.length > 0) {
    const { current, steps, path } = queue.shift();
    
    if (current === goal) {
      return { solvable: true, minMoves: steps, solutionPath: path };
    }
    
    if (steps >= maxMoves || visited.size > 1000) continue;
    
    for (const [opName, opFunc] of Object.entries(operations)) {
      const next = opFunc(current);
      
      if (next > 0 && next <= 10000 && !visited.has(next)) {
        visited.add(next);
        queue.push({
          current: next,
          steps: steps + 1,
          path: [...path, { operation: opName, from: current, to: next }]
        });
      }
    }
  }
  
  return { solvable: false, minMoves: Infinity, solutionPath: [] };
}

/**
 * Main function: Generate a complete exercise
 */
export function generateExercise(difficulty = 3) {
  if (!difficultyLevels[difficulty]) {
    throw new Error(`Invalid difficulty level: ${difficulty}. Must be 1-6.`);
  }
  
  const config = difficultyLevels[difficulty];
  const result = generateSimpleExercise(difficulty);
  
  return {
    goal: result.goal,
    level: difficulty,
    levelName: config.name,
    description: config.description,
    optimalMoves: result.optimalMoves,
    difficulty: config.name.toLowerCase(),
    solutionPath: result.solutionPath
  };
}

/**
 * Get available difficulty levels
 */
export function getDifficultyLevels() {
  return Object.entries(difficultyLevels).map(([level, config]) => ({
    level: parseInt(level),
    ...config
  }));
}