/**
 * Simple Exercise Generator for Number Puzzle
 * Creates solvable exercises with appropriate difficulty scaling
 */

import { mathUtils } from "./operations.js";
import { doxinyConfig } from "./config.js";
import {
  findDirectPath,
  findReverseTargets,
  enhancedBFS as unifiedBFS,
} from "./pathfinding.js";

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
    const validation = validateExercise(goal); // Increased max moves for validation

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
        algorithm: validation.algorithm,
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
    algorithm: validation.algorithm,
  };
}

export function getAllSolutions(goal, maxMoves = null) {
  const config = doxinyConfig.get();
  const actualMaxMoves = maxMoves ?? config.defaultMaxMoves;

  const solutions = [];
  // Quick pattern-based checks first
  const quickResult = checkQuickPatterns(goal);
  solutions.push(quickResult);

  // Enhanced BFS with bidirectional search and strategic analysis
  const forwardResult = enhancedBFS(1, goal, actualMaxMoves);
  solutions.push(forwardResult);

  // Try strategic approaches for all numbers, not just odd ones
  const strategicResult = tryStrategicApproaches(goal, actualMaxMoves + 5);
  solutions.push(strategicResult);

  return solutions.flat(Infinity).filter((s) => s.solvable);
}

/**
 * Validate that an exercise is actually solvable with enhanced strategies
 * @param {number} goal - The target number to reach
 * @param {number} maxMoves - Optional maximum moves allowed for pathfinding (uses config default if not provided)
 * @returns {Object} Solution object with solvable, minMoves, solutionPath, and algorithm properties
 */
export function validateExercise(goal, maxMoves = null) {
  const config = doxinyConfig.get();
  const actualMaxMoves = maxMoves ?? config.defaultMaxMoves;
  const lazy = config.lazySearch;

  if (lazy) {
    // Lazy mode: return first valid solution found, prioritizing the same order as strategic method execution

    // Try quick pattern-based checks first
    const quickResults = checkQuickPatterns(goal);
    for (const result of quickResults) {
      if (result.solvable) {
        return result;
      }
    }

    // Try enhanced BFS with bidirectional search and strategic analysis
    const forwardResults = enhancedBFS(1, goal, actualMaxMoves);
    for (const result of forwardResults) {
      if (result.solvable) {
        return result;
      }
    }

    // Try strategic approaches for all numbers, not just odd ones
    const strategicResults = tryStrategicApproaches(goal, actualMaxMoves + 5);
    for (const result of strategicResults) {
      if (result.solvable) {
        return result;
      }
    }

    return {
      solvable: false,
      minMoves: Infinity,
      solutionPath: [],
      algorithm: "none",
    };
  } else {
    // Non-lazy mode: get all solutions and return the best one
    const solutions = getAllSolutions(goal, actualMaxMoves);

    if (solutions.length > 0) {
      // Return the solution with the fewest moves
      return solutions.reduce((best, current) =>
        current.minMoves < best.minMoves ? current : best,
      );
    }

    return {
      solvable: false,
      minMoves: Infinity,
      solutionPath: [],
      algorithm: "none",
    };
  }
}

/**
 * Quick pattern-based solvability checks
 */
function checkQuickPatterns(goal) {
  // Powers of 2 are always reachable by doubling
  if (mathUtils.isPowerOfTwo(goal)) {
    const steps = Math.log2(goal);
    return [
      {
        solvable: true,
        minMoves: steps,
        algorithm: "powersOfTwo",
        solutionPath: Array(steps)
          .fill()
          .map((_, i) => ({
            operation: "double",
            from: Math.pow(2, i),
            to: Math.pow(2, i + 1),
          })),
      },
    ];
  }

  return [
    {
      solvable: false,
      minMoves: Infinity,
      solutionPath: [],
      algorithm: "none",
    },
  ];
}

/**
 * Enhanced BFS with optimal solution finding, better pruning and early termination
 * Uses unified BFS engine with result return format
 */
function enhancedBFS(start, goal, maxMoves = null) {
  return unifiedBFS(start, goal, {
    maxMoves,
    returnFormat: "result",
    algorithm: "enhancedBFS",
  });
}

/**
 * Strategic approaches for hard-to-reach numbers
 */
function tryStrategicApproaches(goal, maxMoves = null) {
  const config = doxinyConfig.get();
  const actualMaxMoves = maxMoves ?? config.defaultMaxMoves;
  const lazy = config.lazySearch;

  const solutions = [];
  // Strategy 1: Try numbers that can be transformed into the goal
  const reverseTargets = findReverseTargets(goal);
  for (const target of reverseTargets) {
    const pathToTarget = enhancedBFS(
      1,
      target.number,
      actualMaxMoves - target.stepsToGoal,
    );
    if (pathToTarget.solvable) {
      const solution = {
        solvable: true,
        minMoves: pathToTarget.minMoves + target.stepsToGoal,
        solutionPath: [...pathToTarget.solutionPath, ...target.path],
        algorithm: "strategicReverseTarget",
      };
      solutions.push(solution);
      if (lazy) return [solution]; // Return first solution found in lazy mode
    }
  }

  // Strategy 2: For larger odd numbers, try digit manipulation approaches
  if (goal % 2 === 1 && goal > 100) {
    const digitVariants = generateDigitManipulationVariants(goal);
    for (const variant of digitVariants) {
      const pathToVariant = enhancedBFS(
        1,
        variant.number,
        actualMaxMoves - variant.stepsToGoal,
      );
      if (pathToVariant.solvable) {
        const solution = {
          solvable: true,
          minMoves: pathToVariant.minMoves + variant.stepsToGoal,
          solutionPath: [...pathToVariant.solutionPath, ...variant.path],
          algorithm: "digitManipulation",
        };
        solutions.push(solution);
        if (lazy) return [solution]; // Return first solution found in lazy mode
      }
    }
  }

  // Strategy 3: Try composite number factorization approaches
  const factorVariants = generateFactorVariants(goal);
  for (const variant of factorVariants) {
    const pathToVariant = enhancedBFS(
      1,
      variant.number,
      actualMaxMoves - variant.stepsToGoal,
    );
    if (pathToVariant.solvable) {
      const solution = {
        solvable: true,
        minMoves: pathToVariant.minMoves + variant.stepsToGoal,
        solutionPath: [...pathToVariant.solutionPath, ...variant.path],
        algorithm: "factorization",
      };
      solutions.push(solution);
      if (lazy) return [solution]; // Return first solution found in lazy mode
    }
  }

  if (solutions.length > 0) return solutions;

  return [
    {
      solvable: false,
      minMoves: Infinity,
      solutionPath: [],
      algorithm: "none",
    },
  ];
}

/**
 * Generate strategic variants through digit manipulation
 */
function generateDigitManipulationVariants(goal) {
  const variants = [];

  // Try numbers whose sum of digits equals the goal
  // For 3333, we look for numbers that sum to 3333 (impossible with 4 operations)
  // But we can look for numbers that when processed give us stepping stones

  // Strategy: Find numbers that when sum-digits is applied give us a number
  // that can then be manipulated to reach goal
  const targetSum = mathUtils.sumDigits(goal);

  // Look for even numbers that sum to our target sum
  for (let base = 1000; base <= 9999 && base <= 100000; base++) {
    if (base % 2 === 0 && mathUtils.sumDigits(base) === targetSum) {
      // Check if we can get from this sum back to our goal
      const pathFromSum = findDirectPath(targetSum, goal);
      if (pathFromSum.length > 0) {
        variants.push({
          number: base,
          stepsToGoal: 1 + pathFromSum.length,
          path: [
            { operation: "sumDigits", from: base, to: targetSum },
            ...pathFromSum,
          ],
        });
        break; // Found one good variant
      }
    }
  }

  return variants;
}

/**
 * Generate variants using factorization approaches
 */
function generateFactorVariants(goal) {
  const variants = [];

  // Check if goal can be reached by doubling from a smaller number
  if (goal % 2 === 0) {
    const half = goal / 2;
    variants.push({
      number: half,
      stepsToGoal: 1,
      path: [{ operation: "double", from: half, to: goal }],
    });
  }

  // Check if goal can be reached by operations on its reverse
  const reversed = mathUtils.reverseNumber(goal);
  if (reversed !== goal && reversed > 0 && reversed <= 100000) {
    variants.push({
      number: reversed,
      stepsToGoal: 1,
      path: [{ operation: "reverse", from: reversed, to: goal }],
    });
  }

  return variants;
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
 * Determine difficulty level for a custom exercise based on goal and optimal moves
 * Returns level number (1-6) with fallback to level 6 (insane)
 */
export function detectCustomExerciseLevel(goal, optimalMoves) {
  if (optimalMoves < 5) return 1;

  // Check each difficulty level to see if the exercise fits
  for (const [level, config] of Object.entries(difficultyLevels)) {
    const levelNum = parseInt(level);
    const [minGoal, maxGoal] = config.goalRange;
    const [minMoves, maxMoves] = config.targetMoves;

    // Check if goal and moves fall within this level's range
    // Allow some flexibility (+3 moves) for edge cases
    if (
      goal >= minGoal &&
      goal <= maxGoal &&
      optimalMoves >= minMoves &&
      optimalMoves <= maxMoves + 3
    ) {
      return levelNum;
    }
  }

  // Fallback: check by goal range only (if moves don't fit perfectly)
  for (const [level, config] of Object.entries(difficultyLevels)) {
    const levelNum = parseInt(level);
    const [minGoal, maxGoal] = config.goalRange;

    if (goal >= minGoal && goal <= maxGoal) {
      return levelNum;
    }
  }

  // Fallback: check by moves only
  for (const [level, config] of Object.entries(difficultyLevels)) {
    const levelNum = parseInt(level);
    const [minMoves, maxMoves] = config.targetMoves;

    if (optimalMoves >= minMoves && optimalMoves <= maxMoves + 3) {
      return levelNum;
    }
  }

  // Final fallback to insane level (6)
  return 6;
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
