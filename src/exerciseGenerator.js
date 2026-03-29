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
 * Algorithm-aware difficulty configuration with i18n keys
 * Based on difficulty score ranges instead of simple number/move ranges
 */
const difficultyLevels = {
  1: {
    nameKey: "beginner",
    descriptionKey: "beginner",
    difficultyScoreRange: [0, 4.0],
    targetGoalRange: [5, 50], // Wider range, algorithm will determine actual difficulty
  },
  2: {
    nameKey: "easy",
    descriptionKey: "easy",
    difficultyScoreRange: [4.1, 7.5],
    targetGoalRange: [10, 100],
  },
  3: {
    nameKey: "medium",
    descriptionKey: "medium",
    difficultyScoreRange: [7.6, 12.0],
    targetGoalRange: [20, 200],
  },
  4: {
    nameKey: "hard",
    descriptionKey: "hard",
    difficultyScoreRange: [12.1, 18.0],
    targetGoalRange: [50, 300],
  },
  5: {
    nameKey: "expert",
    descriptionKey: "expert",
    difficultyScoreRange: [18.1, 28.0],
    targetGoalRange: [100, 500],
  },
  6: {
    nameKey: "insane",
    descriptionKey: "insane",
    difficultyScoreRange: [28.1, Infinity],
    targetGoalRange: [200, 999],
  },
};

/**
 * Generate algorithm-aware exercise by trying goals and validating against difficulty score
 */
function generateSimpleExercise(difficulty) {
  const config = difficultyLevels[difficulty];
  const [minGoal, maxGoal] = config.targetGoalRange;
  const [minScore, maxScore] = config.difficultyScoreRange;

  // Try random goals and validate them against algorithm-aware difficulty scoring
  for (let attempt = 0; attempt < 30; attempt++) {
    const goal = Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal;
    const validation = validateExercise(goal);

    if (validation.solvable) {
      const difficultyScore = calculateAlgorithmicDifficulty(
        validation.minMoves, 
        validation.algorithm
      );
      
      // Check if the difficulty score fits the target level
      if (difficultyScore >= minScore && difficultyScore <= maxScore) {
        return {
          goal,
          optimalMoves: validation.minMoves,
          solutionPath: validation.solutionPath,
          algorithm: validation.algorithm,
          difficultyScore,
        };
      }
    }
  }

  // Fallback: use curated goals known to work well for each difficulty level
  const fallbackGoals = {
    1: [8, 16, 12, 10],              // Simple powers of 2 and easy targets
    2: [32, 25, 34, 22, 44],         // Mix of patterns
    3: [64, 56, 78, 89, 98],         // Moderate complexity
    4: [128, 132, 156, 189, 231],    // Requires more strategy
    5: [256, 334, 443, 512, 678],    // Advanced algorithmic thinking
    6: [867, 987, 765, 834, 729, 999], // Maximum complexity
  };

  const goalOptions = fallbackGoals[difficulty] || [128];
  const randomIndex = Math.floor(Math.random() * goalOptions.length);
  const fallbackGoal = goalOptions[randomIndex];
  const validation = validateExercise(fallbackGoal);
  
  const difficultyScore = validation.solvable 
    ? calculateAlgorithmicDifficulty(validation.minMoves, validation.algorithm)
    : minScore; // Use minimum score if unsolvable

  return {
    goal: fallbackGoal,
    optimalMoves: validation.minMoves,
    solutionPath: validation.solutionPath,
    algorithm: validation.algorithm,
    difficultyScore,
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
 * Main function: Generate a complete exercise using algorithm-aware difficulty system
 */
export function generateExercise(difficulty = 3) {
  if (!difficultyLevels[difficulty]) {
    throw new Error(`Invalid difficulty level: ${difficulty}. Must be 1-6.`);
  }

  const config = difficultyLevels[difficulty];
  const result = generateSimpleExercise(difficulty);

  // Verify that the generated exercise meets algorithm-aware difficulty requirements
  const detectedLevel = detectCustomExerciseLevel(
    result.goal,
    result.optimalMoves,
    result.algorithm
  );
  
  return {
    goal: result.goal,
    level: difficulty,
    levelNameKey: config.nameKey,
    levelDescriptionKey: config.descriptionKey,
    optimalMoves: result.optimalMoves,
    solutionPath: result.solutionPath,
    // Algorithm-aware metadata
    algorithm: result.algorithm,
    algorithmicLevel: detectedLevel,
    difficultyScore: result.difficultyScore || calculateAlgorithmicDifficulty(result.optimalMoves, result.algorithm),
  };
}

/**
 * Algorithm complexity scoring system
 * Higher scores indicate more sophisticated algorithms requiring advanced thinking
 */
const algorithmComplexityScores = {
  powersOfTwo: 1.0, // Simple pattern recognition - doubling sequence
  enhancedBFS: 1.2, // Standard exploratory search - moderate complexity
  factorization: 1.4, // Number theory concepts - reverse and factors
  strategicReverseTarget: 1.6, // Strategic thinking - working backwards from goal
  digitManipulation: 2.0, // Advanced digit operations - sum manipulation
  none: 1.1, // Unknown/failed algorithm - base complexity
};

/**
 * Calculate algorithmic difficulty score based on moves and strategy complexity
 */
function calculateAlgorithmicDifficulty(optimalMoves, algorithm = "enhancedBFS") {
  const baseComplexity = optimalMoves;
  const algorithmMultiplier = algorithmComplexityScores[algorithm] || 1.2;
  return baseComplexity * algorithmMultiplier;
}

/**
 * Enhanced difficulty detection considering both moves and algorithmic complexity
 * Returns level number (1-6) based on hybrid scoring system
 */
export function detectCustomExerciseLevel(goal, optimalMoves, algorithm = "enhancedBFS") {
  // Calculate hybrid difficulty score
  const difficultyScore = calculateAlgorithmicDifficulty(optimalMoves, algorithm);

  // Map difficulty score to levels with algorithm-aware thresholds
  if (difficultyScore <= 4.0) return 1; // Beginner: Simple patterns or very few moves
  if (difficultyScore <= 7.5) return 2; // Easy: Straightforward BFS solutions
  if (difficultyScore <= 12.0) return 3; // Medium: Moderate complexity or more moves
  if (difficultyScore <= 18.0) return 4; // Hard: Complex algorithms or many moves
  if (difficultyScore <= 28.0) return 5; // Expert: Advanced strategies required
  return 6; // Insane: Highest complexity algorithms or very long sequences
}

/**
 * Get available difficulty levels with algorithm-aware metadata
 */
export function getDifficultyLevels() {
  return Object.entries(difficultyLevels).map(([level, config]) => ({
    level: parseInt(level),
    nameKey: config.nameKey,
    descriptionKey: config.descriptionKey,
    difficultyScoreRange: config.difficultyScoreRange,
    targetGoalRange: config.targetGoalRange,
  }));
}
