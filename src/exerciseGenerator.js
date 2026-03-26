/**
 * Simple Exercise Generator for Number Puzzle
 * Creates solvable exercises with appropriate difficulty scaling
 */

import { operations, mathUtils } from "./operations.js";
import { doxinyConfig } from "./config.js";
import { generateHints, calculateProgressToTarget } from "./gameHelpers.js";

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
  
  const solutions = []
  // Quick pattern-based checks first
  const quickResult = checkQuickPatterns(goal);
  solutions.push(quickResult);

  // Enhanced BFS with bidirectional search and strategic analysis
  const forwardResult = enhancedBFS(1, goal, actualMaxMoves);
  solutions.push(forwardResult);

  // Try strategic approaches for all numbers, not just odd ones
  const strategicResult = tryStrategicApproaches(goal, actualMaxMoves + 5);
  solutions.push(strategicResult);

  return solutions.flat(Infinity).filter(s => s.solvable);
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

    return { solvable: false, minMoves: Infinity, solutionPath: [], algorithm: "none" };
  } else {
    // Non-lazy mode: get all solutions and return the best one
    const solutions = getAllSolutions(goal, actualMaxMoves);

    if (solutions.length > 0) {
      // Return the solution with the fewest moves
      return solutions.reduce((best, current) =>
        current.minMoves < best.minMoves ? current : best,
      );
    }

    return { solvable: false, minMoves: Infinity, solutionPath: [], algorithm: "none" };
  }
}

/**
 * Quick pattern-based solvability checks
 */
function checkQuickPatterns(goal) {
  // Powers of 2 are always reachable by doubling
  if (mathUtils.isPowerOfTwo(goal)) {
    const steps = Math.log2(goal);
    return [{
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
    }];
  }

  return [{ solvable: false, minMoves: Infinity, solutionPath: [], algorithm: "none" }];
}

/**
 * Enhanced BFS with optimal solution finding, better pruning and early termination
 */
function enhancedBFS(start, goal, maxMoves = null) {
  const config = doxinyConfig.get();
  const actualMaxMoves = maxMoves ?? config.defaultMaxMoves;
  const upperBoundLimit = config.bfsUpperBoundLimit;
  const lazy = config.lazySearch;
  
  const queue = [{ current: start, steps: 0, path: [] }];
  const visited = new Map([[start, 0]]); // Track minimum steps to reach each number

  const solutions = [];
  while (queue.length > 0) {
    const { current, steps, path } = queue.shift();

    if (current === goal) {
      const solution = { solvable: true, minMoves: steps, solutionPath: path, algorithm: "enhancedBFS" };
      solutions.push(solution);
      if (lazy) return [solution]; // Return first solution found in lazy mode
    }

    if (steps >= actualMaxMoves) continue;

    for (const [opName, opFunc] of Object.entries(operations)) {
      const next = opFunc(current);

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

  if (solutions.length > 0) return solutions;

  return [{ solvable: false, minMoves: Infinity, solutionPath: [], algorithm: "none" }];
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
      actualMaxMoves - target.stepsToGoal
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
        actualMaxMoves - variant.stepsToGoal
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
      actualMaxMoves - variant.stepsToGoal
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

  return [{ solvable: false, minMoves: Infinity, solutionPath: [], algorithm: "none" }];
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
 * Create auto-solve function for debugging purposes
 * Returns a function that solves the current exercise step by step with delays using actual UI clicks
 */
export function createAutoSolveFunction() {
  return async function (solutionPath, goal, delayMs = 1000, clickCallback = null) {
    if (!solutionPath || solutionPath.length === 0) {
      console.warn(
        "❌ No solution path provided. Please provide a valid solution path.",
      );
      return false;
    }

    if (!clickCallback) {
      console.warn(
        "❌ No click callback provided. Cannot perform UI interactions.",
      );
      return false;
    }

    console.log(
      `🤖 Auto-solving exercise: 1 → ${goal}`,
    );
    console.log(
      `📋 Solution has ${solutionPath.length} steps with ${delayMs}ms delay between steps`,
    );

    let stepCount = 0;

    for (const step of solutionPath) {
      stepCount++;

      // Log the step being executed
      console.log(
        `🔄 Step ${stepCount}/${solutionPath.length}: ${step.operation.toUpperCase()} (${step.from} → ${step.to})`,
      );

      // Perform the actual UI click
      try {
        const result = clickCallback(step.operation);
        if (result === false) {
          console.error(`❌ Click callback returned false for operation: ${step.operation}`);
          return false;
        }
      } catch (error) {
        console.error(`❌ Error executing step ${stepCount}:`, error);
        return false;
      }

      // Wait for the specified delay before next step (unless it's the last step)
      if (stepCount < solutionPath.length) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.log(
      `🎉 Auto-solve completed after ${stepCount} steps`,
    );
    return true;
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

// Re-export functions for backward compatibility
export { generateHints, calculateProgressToTarget };
