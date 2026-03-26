/**
 * Simple Exercise Generator for Number Puzzle
 * Creates solvable exercises with appropriate difficulty scaling
 */

import { operations } from "./operations.js";
import { t } from "./i18n.js";

/**
 * Default maximum moves limit for BFS pathfinding algorithms
 * This prevents infinite loops and excessive computation time
 * while allowing reasonable solution depths for most puzzles
 */
const DEFAULT_MAX_MOVES = 30;

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
 * Validate that an exercise is actually solvable with enhanced strategies
 */
export function validateExercise(goal, maxMoves = DEFAULT_MAX_MOVES) {
  // Quick pattern-based checks first
  const quickResult = checkQuickPatterns(goal);
  if (quickResult) return quickResult;

  // Enhanced BFS with bidirectional search and strategic analysis
  const forwardResult = enhancedBFS(1, goal, maxMoves);
  if (forwardResult.solvable) return forwardResult;

  // Try strategic approaches for all numbers, not just odd ones
  const strategicResult = tryStrategicApproaches(goal, maxMoves + 5);
  if (strategicResult.solvable) return strategicResult;

  return { solvable: false, minMoves: Infinity, solutionPath: [] };
}

/**
 * Quick pattern-based solvability checks
 */
function checkQuickPatterns(goal) {
  // Powers of 2 are always reachable by doubling
  if (isPowerOfTwo(goal)) {
    const steps = Math.log2(goal);
    return {
      solvable: true,
      minMoves: steps,
      solutionPath: Array(steps)
        .fill()
        .map((_, i) => ({
          operation: "double",
          from: Math.pow(2, i),
          to: Math.pow(2, i + 1),
        })),
    };
  }

  return null;
}

/**
 * Enhanced BFS with better pruning and early termination
 */
function enhancedBFS(start, goal, maxMoves) {
  const queue = [{ current: start, steps: 0, path: [] }];
  const visited = new Map([[start, 0]]); // Track minimum steps to reach each number

  while (queue.length > 0) {
    const { current, steps, path } = queue.shift();

    if (current === goal) {
      return { solvable: true, minMoves: steps, solutionPath: path };
    }

    if (steps >= maxMoves) continue;

    for (const [opName, opFunc] of Object.entries(operations)) {
      const next = opFunc(current);

      if (next > 0 && next <= 100000) {
        const existingSteps = visited.get(next);
        if (!existingSteps || steps + 1 < existingSteps) {
          visited.set(next, steps + 1);
          queue.push({
            current: next,
            steps: steps + 1,
            path: [...path, { operation: opName, from: current, to: next }],
          });
        }
      }
    }
  }

  return { solvable: false, minMoves: Infinity, solutionPath: [] };
}

/**
 * Strategic approaches for hard-to-reach numbers
 */
function tryStrategicApproaches(goal, maxMoves) {
  // Strategy 1: Try numbers that can be transformed into the goal
  const reverseTargets = findReverseTargets(goal);
  for (const target of reverseTargets) {
    const pathToTarget = enhancedBFS(
      1,
      target.number,
      maxMoves - target.stepsToGoal,
    );
    if (pathToTarget.solvable) {
      return {
        solvable: true,
        minMoves: pathToTarget.minMoves + target.stepsToGoal,
        solutionPath: [...pathToTarget.solutionPath, ...target.path],
      };
    }
  }

  // Strategy 2: For larger odd numbers, try digit manipulation approaches
  if (goal % 2 === 1 && goal > 100) {
    const digitVariants = generateDigitManipulationVariants(goal);
    for (const variant of digitVariants) {
      const pathToVariant = enhancedBFS(
        1,
        variant.number,
        maxMoves - variant.stepsToGoal,
      );
      if (pathToVariant.solvable) {
        return {
          solvable: true,
          minMoves: pathToVariant.minMoves + variant.stepsToGoal,
          solutionPath: [...pathToVariant.solutionPath, ...variant.path],
        };
      }
    }
  }

  // Strategy 3: Try composite number factorization approaches
  const factorVariants = generateFactorVariants(goal);
  for (const variant of factorVariants) {
    const pathToVariant = enhancedBFS(
      1,
      variant.number,
      maxMoves - variant.stepsToGoal,
    );
    if (pathToVariant.solvable) {
      return {
        solvable: true,
        minMoves: pathToVariant.minMoves + variant.stepsToGoal,
        solutionPath: [...pathToVariant.solutionPath, ...variant.path],
      };
    }
  }

  return { solvable: false, minMoves: Infinity, solutionPath: [] };
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
  const targetSum = sumDigits(goal);

  // Look for even numbers that sum to our target sum
  for (let base = 1000; base <= 9999 && base <= 100000; base++) {
    if (base % 2 === 0 && sumDigits(base) === targetSum) {
      // Check if we can get from this sum back to our goal
      const pathFromSum = findDirectPath(targetSum, goal);
      if (pathFromSum.length > 0) {
        variants.push({
          number: base,
          stepsToGoal: 1 + pathFromSum.length,
          path: [
            { operation: "sum", from: base, to: targetSum },
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
  const reversed = reverseNumber(goal);
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
 * Find direct operational path between two numbers
 */
function findDirectPath(from, to) {
  const paths = [];

  // Direct operations
  if (operations.double(from) === to) {
    paths.push({ operation: "double", from: from, to: to });
  }
  if (operations.reverse(from) === to) {
    paths.push({ operation: "reverse", from: from, to: to });
  }
  if (operations.append1(from) === to) {
    paths.push({ operation: "append1", from: from, to: to });
  }
  if (operations.sum && operations.sum(from) === to) {
    paths.push({ operation: "sum", from: from, to: to });
  }

  return paths;
}

/**
 * Find numbers that can reach the goal in 1-2 operations (enhanced)
 */
function findReverseTargets(goal) {
  const targets = [];

  // Numbers that when doubled give goal
  if (goal % 2 === 0) {
    targets.push({
      number: goal / 2,
      stepsToGoal: 1,
      path: [{ operation: "double", from: goal / 2, to: goal }],
    });
  }

  // Numbers that when reversed give goal
  const reversed = reverseNumber(goal);
  if (reversed !== goal && reversed > 0 && reversed <= 100000) {
    targets.push({
      number: reversed,
      stepsToGoal: 1,
      path: [{ operation: "reverse", from: reversed, to: goal }],
    });
  }

  // Numbers that when sum-digits applied give goal (expanded search)
  const maxSearchRange = Math.min(100000, goal * 20);
  for (let candidate = goal * 2; candidate <= maxSearchRange; candidate++) {
    if (sumDigits(candidate) === goal) {
      targets.push({
        number: candidate,
        stepsToGoal: 1,
        path: [{ operation: "sum", from: candidate, to: goal }],
      });

      // Only need a few good candidates to keep performance reasonable
      if (targets.length >= 8) break;
    }
  }

  // Numbers that when append1 applied give goal
  const goalStr = goal.toString();
  if (goalStr.endsWith("1") && goalStr.length > 1) {
    const baseNumber = parseInt(goalStr.slice(0, -1));
    if (baseNumber > 0) {
      targets.push({
        number: baseNumber,
        stepsToGoal: 1,
        path: [{ operation: "append1", from: baseNumber, to: goal }],
      });
    }
  }

  return targets;
}

// Helper functions
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

function reverseNumber(n) {
  return parseInt(n.toString().split("").reverse().join(""), 10) || 0;
}

function sumDigits(n) {
  return n
    .toString()
    .split("")
    .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}

/**
 * Find shortest path from any start number to target using enhanced BFS with strategic approaches
 */
function findShortestPath(start, target, maxMoves = DEFAULT_MAX_MOVES) {
  if (start === target) return [];

  // Quick pattern-based checks for direct paths
  const quickPath = findQuickPath(start, target);
  if (quickPath.length > 0) return quickPath;

  // Enhanced BFS with strategic approaches
  const directPath = enhancedPathBFS(start, target, maxMoves);
  if (directPath.length > 0) return directPath;

  // If direct path fails, try strategic reverse approaches
  const strategicPath = findStrategicPath(start, target, maxMoves);
  if (strategicPath.length > 0) return strategicPath;

  return []; // No path found
}

/**
 * Quick pattern-based path finding
 */
function findQuickPath(start, target) {
  // Direct single operation check
  const directPaths = findDirectPath(start, target);
  if (directPaths.length > 0) return directPaths;

  // Powers of 2 pattern from start
  if (isPowerOfTwo(target) && isPowerOfTwo(start) && target >= start) {
    const startExp = Math.log2(start);
    const targetExp = Math.log2(target);
    const doublingSteps = targetExp - startExp;

    if (doublingSteps > 0 && doublingSteps <= 8) {
      const path = [];
      let current = start;
      for (let i = 0; i < doublingSteps; i++) {
        const next = current * 2;
        path.push({ operation: "double", from: current, to: next });
        current = next;
      }
      return path;
    }
  }

  return [];
}

/**
 * Enhanced BFS with better pruning and tracking
 */
function enhancedPathBFS(start, target, maxMoves) {
  const queue = [{ current: start, moves: 0, path: [] }];
  const visited = new Map([[start, 0]]); // Track minimum moves to reach each number

  while (queue.length > 0) {
    const { current, moves, path } = queue.shift();

    if (moves >= maxMoves) continue;

    for (const [opName, opFunc] of Object.entries(operations)) {
      const next = opFunc(current);

      if (next === target) {
        return [...path, { operation: opName, from: current, to: next }];
      }

      if (next > 0 && next <= 100000) {
        const existingMoves = visited.get(next);
        if (!existingMoves || moves + 1 < existingMoves) {
          visited.set(next, moves + 1);
          queue.push({
            current: next,
            moves: moves + 1,
            path: [...path, { operation: opName, from: current, to: next }],
          });
        }
      }
    }
  }

  return [];
}

/**
 * Strategic path finding using reverse targeting
 */
function findStrategicPath(start, target, maxMoves) {
  // Strategy 1: Find intermediate numbers that can reach target in 1 operation
  const reverseTargets = findReverseTargets(target);

  for (const reverseTarget of reverseTargets.slice(0, 5)) {
    // Limit to top 5 for performance
    if (reverseTarget.number === start) {
      // Direct path found
      return reverseTarget.path;
    }

    // Try to find path from start to this intermediate number
    const pathToIntermediate = enhancedPathBFS(
      start,
      reverseTarget.number,
      maxMoves - reverseTarget.stepsToGoal,
    );
    if (pathToIntermediate.length > 0) {
      return [...pathToIntermediate, ...reverseTarget.path];
    }
  }

  // Strategy 2: For single digit targets, try known efficient patterns
  if (target >= 2 && target <= 9 && start <= 50) {
    return findSingleDigitPath(start, target);
  }

  return [];
}

/**
 * Find paths to single digit numbers using efficient patterns
 */
function findSingleDigitPath(start, target) {
  // Common efficient paths for single digits
  const patterns = {
    3: [
      {
        condition: (s) => s === 1,
        path: [
          { operation: "append1", from: 1, to: 11 },
          { operation: "sum", from: 11, to: 2 },
          { operation: "append1", from: 2, to: 21 },
          { operation: "sum", from: 21, to: 3 },
        ],
      },
      {
        condition: (s) => s === 2,
        path: [
          { operation: "append1", from: 2, to: 21 },
          { operation: "sum", from: 21, to: 3 },
        ],
      },
    ],
    5: [
      {
        condition: (s) => s === 1,
        path: [
          { operation: "double", from: 1, to: 2 },
          { operation: "append1", from: 2, to: 21 },
          { operation: "sum", from: 21, to: 3 },
          { operation: "append1", from: 3, to: 31 },
          { operation: "sum", from: 31, to: 4 },
          { operation: "append1", from: 4, to: 41 },
          { operation: "sum", from: 41, to: 5 },
        ],
      },
    ],
    6: [
      {
        condition: (s) => s === 3,
        path: [{ operation: "double", from: 3, to: 6 }],
      },
      {
        condition: (s) => s === 2,
        path: [
          { operation: "append1", from: 2, to: 21 },
          { operation: "sum", from: 21, to: 3 },
          { operation: "double", from: 3, to: 6 },
        ],
      },
    ],
    9: [
      {
        condition: (s) => s === 3,
        path: [
          { operation: "append1", from: 3, to: 33 },
          { operation: "sum", from: 33, to: 6 },
          { operation: "append1", from: 6, to: 63 },
          { operation: "sum", from: 63, to: 9 },
        ],
      },
    ],
  };

  const targetPatterns = patterns[target];
  if (targetPatterns) {
    for (const pattern of targetPatterns) {
      if (pattern.condition(start)) {
        return pattern.path;
      }
    }
  }

  return [];
}

/**
 * Calculate dynamic progress based on current position and remaining path
 */
export function calculateProgressToTarget(
  currentNumber,
  targetNumber,
  movesMade,
  optimalMoves,
) {
  if (currentNumber === targetNumber) return 100;

  // Calculate shortest path from current number to target
  const pathFromCurrent = findShortestPath(currentNumber, targetNumber);

  if (pathFromCurrent.length === 0) {
    // If no path found, give minimal progress based on starting position
    return currentNumber === 1 ? 0 : 5;
  }

  // Calculate progress based on:
  // - How many moves have been made from start (movesMade)
  // - How many moves remain from current position (pathFromCurrent.length)
  const totalEstimatedMoves = movesMade + pathFromCurrent.length;

  // Progress is based on moves completed vs estimated total
  const progress = Math.round((movesMade / totalEstimatedMoves) * 100);

  // Bonus for being on or better than optimal path
  if (totalEstimatedMoves <= optimalMoves) {
    return Math.min(99, progress + 10); // 10% bonus for efficiency
  }

  return Math.max(0, Math.min(99, progress)); // Cap at 99% until completion
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
 * Generate intelligent hints based on current game state and optimal path
 */
export function generateHints(
  currentNumber,
  targetNumber,
  movesMade,
  hintsUsed = 0,
) {
  const optimalPath = findShortestPath(currentNumber, targetNumber);

  if (optimalPath.length === 0) {
    return generateFallbackHints(currentNumber, targetNumber, hintsUsed);
  }

  const hints = [];

  // Always generate all 3 hint levels for current number
  // Hint 1: Strategic guidance (general direction)
  hints.push(generateStrategicHint(currentNumber, targetNumber, optimalPath));

  // Hint 2: Tactical guidance (specific numbers or operations)
  hints.push(generateTacticalHint(currentNumber, targetNumber, optimalPath));

  // Hint 3: Direct guidance (exact next move)
  hints.push(generateDirectHint(currentNumber, targetNumber, optimalPath));

  return hints;
}

/**
 * Generate strategic level hint (general guidance)
 */
function generateStrategicHint(current, target, path) {
  const nextMove = path[0];
  const remainingMoves = path.length;

  // Analyze the overall strategy
  if (target > current && nextMove.operation === "double") {
    return {
      level: 1,
      type: "strategic",
      message: t("hints.strategic.targetLarger", { target, current }),
      confidence: "high",
    };
  }

  if (nextMove.operation === "reverse") {
    return {
      level: 1,
      type: "strategic",
      message: t("hints.strategic.tryReverse", { current }),
      confidence: "high",
    };
  }

  if (nextMove.operation === "sum") {
    return {
      level: 1,
      type: "strategic",
      message: t("hints.strategic.breakDownDigits", { current }),
      confidence: "high",
    };
  }

  if (nextMove.operation === "append1") {
    return {
      level: 1,
      type: "strategic",
      message: t("hints.strategic.expandNumber"),
      confidence: "high",
    };
  }

  return {
    level: 1,
    type: "strategic",
    message: t("hints.strategic.movesRemaining", {
      moves: remainingMoves,
      target,
    }),
    confidence: "medium",
  };
}

/**
 * Generate tactical level hint (specific guidance)
 */
function generateTacticalHint(current, target, path) {
  const nextMove = path[0];
  const nextResult = nextMove.to;

  if (nextMove.operation === "double") {
    return {
      level: 2,
      type: "tactical",
      message: t("hints.tactical.doubleResult", {
        current,
        result: nextResult,
        target,
      }),
      confidence: "high",
    };
  }

  if (nextMove.operation === "reverse") {
    return {
      level: 2,
      type: "tactical",
      message: t("hints.tactical.reverseResult", {
        current,
        result: nextResult,
        target,
      }),
      confidence: "high",
    };
  }

  if (nextMove.operation === "sum") {
    const digits = current.toString().split("").join(" + ");
    return {
      level: 2,
      type: "tactical",
      message: t("hints.tactical.sumResult", {
        current,
        digits,
        result: nextResult,
      }),
      confidence: "high",
    };
  }

  if (nextMove.operation === "append1") {
    return {
      level: 2,
      type: "tactical",
      message: t("hints.tactical.appendResult", {
        current,
        result: nextResult,
        target,
      }),
      confidence: "high",
    };
  }

  return {
    level: 2,
    type: "tactical",
    message: t("hints.tactical.optimalTransform", {
      current,
      result: nextResult,
    }),
    confidence: "medium",
  };
}

/**
 * Generate direct level hint (exact next move)
 */
function generateDirectHint(current, target, path) {
  const nextMove = path[0];
  const operationKey = nextMove.operation;

  const operationName = t(`hints.operations.${operationKey}`);

  return {
    level: 3,
    type: "direct",
    message: t("hints.direct.nextMove", {
      operation: operationName,
      current,
      result: nextMove.to,
    }),
    recommendedOperation: operationKey, // Add the operation key for button blinking
    confidence: "maximum",
  };
}

/**
 * Generate fallback hints when optimal path is not available
 */
function generateFallbackHints(current, target, hintsUsed) {
  const hints = [];

  // Always generate all 3 levels for current number

  // Level 1: Strategic hint
  if (target > current * 2) {
    hints.push({
      level: 1,
      type: "strategic",
      message: t("hints.strategic.targetMuchLarger", { target, current }),
      confidence: "medium",
    });
  } else if (target < current) {
    hints.push({
      level: 1,
      type: "strategic",
      message: t("hints.strategic.targetSmaller", { target, current }),
      confidence: "medium",
    });
  } else {
    hints.push({
      level: 1,
      type: "strategic",
      message: t("hints.strategic.targetClose", { target, current }),
      confidence: "medium",
    });
  }

  // Level 2: Tactical hint
  const currentStr = current.toString();

  if (currentStr.length > 1) {
    hints.push({
      level: 2,
      type: "tactical",
      message: t("hints.tactical.multiDigitOps", { count: currentStr.length }),
      confidence: "medium",
    });
  } else {
    hints.push({
      level: 2,
      type: "tactical",
      message: t("hints.tactical.singleDigitOps", { current }),
      confidence: "medium",
    });
  }

  // Level 3: Direct hint
  hints.push({
    level: 3,
    type: "direct",
    message: t("hints.direct.challenging", { target }),
    confidence: "low",
  });

  return hints;
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
