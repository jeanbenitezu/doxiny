/**
 * Game Helper Functions for Doxiny Number Puzzle
 * Provides strategic hints, tactical guidance, and progress tracking
 */

import { t } from "./i18n.js";
import { operations, mathUtils } from "./operations.js";
import { doxinyConfig } from "./config.js";

/**
 * Find shortest path from any start number to target using enhanced BFS with strategic approaches
 */
function findShortestPath(start, target) {
  const config = doxinyConfig.get();
  const maxMoves = config.defaultMaxMoves;
  const paths = [];
  if (start === target) return [];

  // Quick pattern-based checks for direct paths
  const quickPath = findQuickPath(start, target);
  if (quickPath.length > 0) paths.push(quickPath);

  // Enhanced BFS with strategic approaches
  const directPath = enhancedPathBFS(start, target, maxMoves);
  if (directPath.length > 0) paths.push(directPath);

  // If direct path fails, try strategic reverse approaches
  const strategicPath = findStrategicPath(start, target, maxMoves);
  if (strategicPath.length > 0) paths.push(strategicPath);

  // return shortest path found, or empty if none
  if (paths.length > 0) {
    return paths.reduce((shortest, path) =>
      path.length < shortest.length ? path : shortest,
    );
  }

  return [];
}

/**
 * Quick pattern-based path finding
 */
function findQuickPath(start, target) {
  // Direct single operation check
  const directPaths = findDirectPath(start, target);
  if (directPaths.length > 0) return directPaths;

  // Powers of 2 pattern from start
  if (
    mathUtils.isPowerOfTwo(target) &&
    mathUtils.isPowerOfTwo(start) &&
    target >= start
  ) {
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
function enhancedPathBFS(start, target, maxMoves = null) {
  const config = doxinyConfig.get();
  const actualMaxMoves = maxMoves ?? config.defaultMaxMoves;
  const upperBoundLimit = config.bfsUpperBoundLimit;

  const queue = [{ current: start, moves: 0, path: [] }];
  const visited = new Map([[start, 0]]); // Track minimum moves to reach each number

  while (queue.length > 0) {
    const { current, moves, path } = queue.shift();

    if (moves >= actualMaxMoves) continue;

    for (const [opName, opFunc] of Object.entries(operations)) {
      const next = opFunc(current);

      if (next === target) {
        return [...path, { operation: opName, from: current, to: next }];
      }

      if (next > 0 && next <= upperBoundLimit) {
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
  const reversed = mathUtils.reverseNumber(goal);
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
    if (mathUtils.sumDigits(candidate) === goal) {
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
