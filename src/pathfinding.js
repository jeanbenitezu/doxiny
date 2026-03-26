/**
 * Shared Pathfinding Utilities for Doxiny Number Puzzle
 * Contains common pathfinding functions used by both exercise generation and hint generation
 */

import { operations, mathUtils } from "./operations.js";
import { doxinyConfig } from "./config.js";

/**
 * PathfindingResult wrapper class for consistent return format
 * Allows uniform consumption of pathfinding results across modules
 */
export class PathfindingResult {
  constructor(operationPath, algorithm = "unknown", metadata = {}) {
    this.operationPath = operationPath || [];
    this.algorithm = algorithm;
    this.metadata = metadata;
  }

  get solvable() {
    return this.operationPath.length > 0;
  }

  get minMoves() {
    return this.operationPath.length;
  }

  get solutionPath() {
    return this.operationPath;
  }

  // Convert to exerciseGenerator format
  toExerciseResult() {
    return {
      solvable: this.solvable,
      minMoves: this.minMoves,
      solutionPath: this.solutionPath,
      algorithm: this.algorithm,
    };
  }

  // Create from exerciseGenerator result
  static fromExerciseResult(result) {
    return new PathfindingResult(
      result.solutionPath || [],
      result.algorithm || "unknown",
      { originalResult: result },
    );
  }
}

/**
 * Find direct operational path between two numbers
 * Shared utility used by both hint generation and exercise validation
 */
export function findDirectPath(from, to) {
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
 * Shared utility used by both hint generation and exercise validation
 */
export function findReverseTargets(goal) {
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
 * Unified Enhanced BFS Engine
 * Configurable BFS that can work for both hint generation and exercise validation
 * @param {number} start - Starting number
 * @param {number} goal - Target number
 * @param {Object} options - Configuration options
 * @returns {Array|PathfindingResult} - Results based on returnFormat option
 */
export function enhancedBFS(start, goal, options = {}) {
  const config = doxinyConfig.get();

  // Configuration with defaults
  const {
    maxMoves = config.defaultMaxMoves,
    upperBoundLimit = config.bfsUpperBoundLimit,
    lazy = config.lazySearch,
    returnFormat = "path", // "path" for gameHelpers, "result" for exerciseGenerator
    algorithm = "enhancedBFS",
  } = options;

  const queue = [{ current: start, steps: 0, path: [] }];
  const visited = new Map([[start, 0]]); // Track minimum steps to reach each number
  const solutions = [];

  while (queue.length > 0) {
    const { current, steps, path } = queue.shift();

    // Check if we reached the goal
    if (current === goal) {
      const solution = {
        solvable: true,
        minMoves: steps,
        solutionPath: path,
        algorithm,
      };

      solutions.push(solution);

      // Return immediately in lazy mode or when returnFormat is "path"
      if (lazy || returnFormat === "path") {
        return returnFormat === "path" ? path : [solution];
      }
    }

    if (steps >= maxMoves) continue;

    for (const [opName, opFunc] of Object.entries(operations)) {
      const next = opFunc(current);

      // For "path" return format, check target in operation loop for early termination
      if (returnFormat === "path" && next === goal) {
        const finalPath = [
          ...path,
          { operation: opName, from: current, to: next },
        ];
        return finalPath;
      }

      if (next > 0 && next <= upperBoundLimit) {
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

  // Return results based on format
  if (returnFormat === "path") {
    return []; // No path found
  }

  // Return result format
  if (solutions.length > 0) {
    return solutions;
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
