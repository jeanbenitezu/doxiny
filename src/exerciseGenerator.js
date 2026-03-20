/**
 * Simple Exercise Generator for Number Puzzle
 * Creates solvable exercises with appropriate difficulty scaling
 */

import { operations } from "./operations.js";

/**
 * Simple difficulty configuration with i18n keys
 */
const difficultyLevels = {
  1: {
    nameKey: "beginner",
    descriptionKey: "beginner", 
    targetMoves: [3, 6],
    goalRange: [5, 20],
  },
  2: {
    nameKey: "easy",
    descriptionKey: "easy",
    targetMoves: [4, 8],
    goalRange: [10, 50],
  },
  3: {
    nameKey: "medium", 
    descriptionKey: "medium",
    targetMoves: [5, 10],
    goalRange: [20, 100],
  },
  4: {
    nameKey: "hard",
    descriptionKey: "hard", 
    targetMoves: [6, 12],
    goalRange: [50, 200],
  },
  5: {
    nameKey: "expert",
    descriptionKey: "expert",
    targetMoves: [7, 15],
    goalRange: [100, 500],
  },
  6: {
    nameKey: "insane",
    descriptionKey: "insane",
    targetMoves: [8, 18],
    goalRange: [300, 999],
  },
};

/**
 * Generate a simple exercise by trying random goals within range
 */
function generateSimpleExercise(difficulty) {
  const config = difficultyLevels[difficulty];
  const [minGoal, maxGoal] = config.goalRange;

  // Try more goals with slightly more flexible criteria
  for (let attempt = 0; attempt < 25; attempt++) {
    const goal = Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal;
    const validation = validateExercise(goal, 25); // Increased max moves for validation

    if (
      validation.solvable &&
      validation.minMoves >= config.targetMoves[0] &&
      validation.minMoves <= config.targetMoves[1] + 5
    ) {
      // More flexible move range
      return {
        goal,
        optimalMoves: validation.minMoves,
        solutionPath: validation.solutionPath,
      };
    }
  }

  // Fallback to diverse known good goals for each difficulty
  const fallbackGoals = {
    1: [10, 12, 21],
    2: [25, 34, 43, 55],
    3: [64, 89, 98, 77],
    4: [128, 132, 231, 189],
    5: [256, 289, 982, 334, 443],
    6: [729, 867, 678, 987, 765, 345, 534, 672, 267, 387, 783, 832, 238],
  };

  const goalOptions = fallbackGoals[difficulty] || [171];
  // Pick a random goal from the fallback options instead of always the same one
  const randomIndex = Math.floor(Math.random() * goalOptions.length);
  const fallbackGoal = goalOptions[randomIndex];
  const validation = validateExercise(fallbackGoal);

  return {
    goal: fallbackGoal,
    optimalMoves: validation.minMoves,
    solutionPath: validation.solutionPath,
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
          path: [...path, { operation: opName, from: current, to: next }],
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
    levelNameKey: config.nameKey,
    levelDescriptionKey: config.descriptionKey,
    optimalMoves: result.optimalMoves,
    solutionPath: result.solutionPath,
  };
}

/**
 * Get available difficulty levels with i18n keys
 */
export function getDifficultyLevels() {
  return Object.entries(difficultyLevels).map(([level, config]) => ({
    level: parseInt(level),
    nameKey: config.nameKey,
    descriptionKey: config.descriptionKey,
    targetMoves: config.targetMoves,
    goalRange: config.goalRange,
  }));
}
