/**
 * Game Helper Functions for Doxiny Number Puzzle
 * Provides strategic hints, tactical guidance, and progress tracking
 */

import { t } from "./i18n.js";
import { doxinyConfig } from "./config.js";
import {
  findShortestPath,
} from "./pathfinding.js";

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

  const config = doxinyConfig.get();
  const hints = [];

  // Generate hints based on configuration
  if (config.enableStrategicHints) {
    hints.push(generateStrategicHint(currentNumber, targetNumber, optimalPath));
  }

  if (config.enableTacticalHints) {
    hints.push(generateTacticalHint(currentNumber, targetNumber, optimalPath));
  }

  if (config.enableDirectHints) {
    hints.push(generateDirectHint(currentNumber, targetNumber, optimalPath));
  }

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

  if (nextMove.operation === "sumDigits") {
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

  if (nextMove.operation === "sumDigits") {
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
  const config = doxinyConfig.get();
  const hints = [];

  // Generate fallback hints based on configuration

  // Level 1: Strategic hint
  if (config.enableStrategicHints) {
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
  }

  // Level 2: Tactical hint
  if (config.enableTacticalHints) {
    const currentStr = current.toString();

    if (currentStr.length > 1) {
      hints.push({
        level: 2,
        type: "tactical",
        message: t("hints.tactical.multiDigitOps", {
          count: currentStr.length,
        }),
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
  }

  // Level 3: Direct hint
  if (config.enableDirectHints) {
    hints.push({
      level: 3,
      type: "direct",
      message: t("hints.direct.challenging", { target }),
      confidence: "low",
    });
  }

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
