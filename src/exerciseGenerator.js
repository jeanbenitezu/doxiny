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
 * Validate that an exercise is actually solvable with enhanced strategies
 */
export function validateExercise(goal, maxMoves = 20) {
  // Quick pattern-based checks first
  const quickResult = checkQuickPatterns(goal);
  if (quickResult) return quickResult;

  // Enhanced BFS with bidirectional search and strategic analysis
  const forwardResult = enhancedBFS(1, goal, maxMoves);
  if (forwardResult.solvable) return forwardResult;

  // For odd numbers, try strategic approaches
  if (goal % 2 === 1) {
    const strategicResult = tryStrategicApproaches(goal, maxMoves);
    if (strategicResult.solvable) return strategicResult;
  }

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
      solutionPath: Array(steps).fill().map((_, i) => ({
        operation: 'double', from: Math.pow(2, i), to: Math.pow(2, i + 1)
      }))
    };
  }

  // Single digits (2-9) have known short paths
  if (goal >= 2 && goal <= 9) {
    return { solvable: true, minMoves: estimateMinMovesForDigit(goal), solutionPath: [] };
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

      if (next > 0 && next <= 10000) {
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
 * Strategic approaches for hard-to-reach numbers (especially odd numbers)
 */
function tryStrategicApproaches(goal, maxMoves) {
  // Strategy 1: Try appending digits to make even, then work backwards
  const evenVariants = generateStrategicVariants(goal);
  
  for (const variant of evenVariants) {
    const pathToVariant = enhancedBFS(1, variant.number, maxMoves - 2);
    if (pathToVariant.solvable) {
      const pathFromVariant = findPathFromVariantToGoal(variant.number, goal, variant.operations);
      if (pathFromVariant.length > 0) {
        return {
          solvable: true,
          minMoves: pathToVariant.minMoves + pathFromVariant.length,
          solutionPath: [...pathToVariant.solutionPath, ...pathFromVariant]
        };
      }
    }
  }

  // Strategy 2: Look for numbers that can reach goal in 1-2 operations
  const reverseTargets = findReverseTargets(goal);
  for (const target of reverseTargets) {
    const pathToTarget = enhancedBFS(1, target.number, maxMoves - target.stepsToGoal);
    if (pathToTarget.solvable) {
      return {
        solvable: true,
        minMoves: pathToTarget.minMoves + target.stepsToGoal,
        solutionPath: [...pathToTarget.solutionPath, ...target.path]
      };
    }
  }

  return { solvable: false, minMoves: Infinity, solutionPath: [] };
}

/**
 * Generate strategic number variants that might be easier to reach
 */
function generateStrategicVariants(goal) {
  const variants = [];
  
  // For odd numbers like 333, try 3330 (append 0 conceptually via append1 then operations)
  if (goal % 2 === 1) {
    // Try number with 0 appended (conceptually)
    const with0 = goal * 10;
    if (with0 <= 10000) {
      variants.push({
        number: with0,
        operations: [{ operation: 'sumDigits', from: with0, to: sumDigits(with0) }]
      });
    }
    
    // Try number with 1 appended
    const with1 = goal * 10 + 1;
    if (with1 <= 10000 && with1 % 2 === 0) {
      variants.push({
        number: with1,
        operations: [{ operation: 'sumDigits', from: with1, to: sumDigits(with1) }]
      });
    }
  }
  
  return variants;
}

/**
 * Find numbers that can reach the goal in 1-2 operations
 */
function findReverseTargets(goal) {
  const targets = [];
  
  // Numbers that when doubled give goal
  if (goal % 2 === 0) {
    targets.push({
      number: goal / 2,
      stepsToGoal: 1,
      path: [{ operation: 'double', from: goal / 2, to: goal }]
    });
  }
  
  // Numbers that when reversed give goal
  const reversed = reverseNumber(goal);
  if (reversed !== goal && reversed > 0) {
    targets.push({
      number: reversed,
      stepsToGoal: 1,
      path: [{ operation: 'reverse', from: reversed, to: goal }]
    });
  }
  
  // Numbers that when sum-digits applied give goal
  for (let candidate = goal * 9; candidate >= goal * 2 && candidate <= 10000; candidate--) {
    if (sumDigits(candidate) === goal) {
      targets.push({
        number: candidate,
        stepsToGoal: 1,
        path: [{ operation: 'sumDigits', from: candidate, to: goal }]
      });
      break; // Found one, that's enough
    }
  }
  
  return targets;
}

// Helper functions
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}

function estimateMinMovesForDigit(digit) {
  const shortcuts = { 2: 1, 4: 2, 8: 3, 3: 2, 6: 3, 9: 3, 5: 3, 7: 4 };
  return shortcuts[digit] || 4;
}

function reverseNumber(n) {
  return parseInt(n.toString().split('').reverse().join(''), 10) || 0;
}

function sumDigits(n) {
  return n.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
}

function findPathFromVariantToGoal(variant, goal, operations) {
  // This would implement the specific operations to get from variant to goal
  // For now, return the operations provided
  return operations.filter(op => op.to === goal);
}

/**
 * Find shortest path from any start number to target using BFS
 */
export function findShortestPath(start, target, maxMoves = 15) {
  if (start === target) return [];
  
  const queue = [{ current: start, moves: 0, path: [] }];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const { current, moves, path } = queue.shift();
    
    if (moves >= maxMoves || visited.size > 5000) continue;
    
    for (const [opName, opFunc] of Object.entries(operations)) {
      const next = opFunc(current);
      
      if (next === target) {
        return [...path, { operation: opName, from: current, to: next }];
      }
      
      if (next > 0 && next <= 10000 && !visited.has(next)) {
        visited.add(next);
        queue.push({
          current: next,
          moves: moves + 1,
          path: [...path, { operation: opName, from: current, to: next }],
        });
      }
    }
  }
  
  return []; // No path found
}

/**
 * Calculate dynamic progress based on current position and remaining path
 */
export function calculateProgressToTarget(currentNumber, targetNumber, movesMade, optimalMoves) {
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
    return Math.min(100, progress + 10); // 10% bonus for efficiency
  }
  
  return Math.max(0, Math.min(95, progress)); // Cap at 95% until completion
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
