/**
 * Intelligent Exercise Generator for Number Puzzle
 * Creates solvable exercises with appropriate difficulty scaling
 */

import { operations } from './operations.js';

/**
 * Reverse operations for backward path generation
 */
const reverseOperations = {
  // Reverse of double: divide by 2 (if even)
  double: (n) => n % 2 === 0 ? n / 2 : null,
  
  // Reverse of add1Right: remove last digit if it's 1
  add1Right: (n) => {
    const str = n.toString();
    return str.endsWith('1') && str.length > 1 ? parseInt(str.slice(0, -1)) : null;
  },
  
  // Reverse of sum: try to find numbers whose digits sum to n
  sum: (n) => {
    // Generate some possible reverse sums
    const candidates = [];
    
    // Simple cases: single repeated digit
    if (n <= 9) {
      for (let digits = 1; digits <= 4; digits++) {
        if (n * digits <= 9999) {
          candidates.push(parseInt(n.toString().repeat(digits)));
        }
      }
    }
    
    // Two-digit combinations  
    for (let a = 1; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        if (a + b === n) {
          candidates.push(parseInt(a.toString() + b.toString()));
          if (b !== 0) candidates.push(parseInt(b.toString() + a.toString()));
        }
      }
    }
    
    // Three-digit cases for larger sums
    if (n > 9) {
      for (let a = 1; a <= Math.min(9, n); a++) {
        for (let b = 0; b <= Math.min(9, n - a); b++) {
          let c = n - a - b;
          if (c >= 0 && c <= 9) {
            candidates.push(parseInt(a.toString() + b.toString() + c.toString()));
          }
        }
      }
    }
    
    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  },
  
  // Reverse of mirror: mirror again (self-inverse)
  mirror: (n) => operations.mirror(n)
};

/**
 * Difficulty configuration for exercise generation
 */
const difficultyLevels = {
  1: { // Beginner
    name: 'Beginner',
    description: 'Learn the basics',
    targetMoves: [3, 6],
    goalRange: [5, 20],
    complexity: 'simple',
    operationWeights: { double: 40, add1Right: 30, sum: 20, mirror: 10 }
  },
  2: { // Easy
    name: 'Easy',
    description: 'Building confidence',
    targetMoves: [4, 8],
    goalRange: [10, 50],
    complexity: 'easy',
    operationWeights: { double: 35, add1Right: 25, sum: 25, mirror: 15 }
  },
  3: { // Medium
    name: 'Medium',
    description: 'Strategic thinking',
    targetMoves: [5, 10],
    goalRange: [20, 100],
    complexity: 'medium',
    operationWeights: { double: 30, add1Right: 20, sum: 30, mirror: 20 }
  },
  4: { // Hard
    name: 'Hard',
    description: 'Advanced tactics',
    targetMoves: [6, 12],
    goalRange: [50, 200],
    complexity: 'hard',
    operationWeights: { double: 25, add1Right: 20, sum: 35, mirror: 20 }
  },
  5: { // Expert
    name: 'Expert',
    description: 'Master level',
    targetMoves: [7, 15],
    goalRange: [100, 500],
    complexity: 'expert', 
    operationWeights: { double: 20, add1Right: 25, sum: 30, mirror: 25 }
  },
  6: { // Insane
    name: 'Insane',
    description: 'Ultimate challenge',
    targetMoves: [10, 20],
    goalRange: [200, 1000],
    complexity: 'insane',
    operationWeights: { double: 15, add1Right: 25, sum: 35, mirror: 25 }
  }
};

/**
 * Generate a random weighted operation
 */
function getWeightedOperation(weights) {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [operation, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return operation;
    }
  }
  
  return 'double'; // fallback
}

/**
 * Generate a solvable exercise by working backwards
 */
function generateBackwardPath(difficulty, targetLength) {
  const config = difficultyLevels[difficulty];
  let current = 1;
  const forwardPath = [];
  
  // Generate forward path of target length
  for (let step = 0; step < targetLength; step++) {
    const operation = getWeightedOperation(config.operationWeights);
    const newValue = operations[operation](current);
    
    // Prevent numbers from getting too large or invalid
    if (newValue > 10000 || newValue <= 0 || !Number.isInteger(newValue)) {
      // Try a different operation
      const fallbackOps = ['double', 'add1Right', 'sum', 'mirror'];
      for (const fallbackOp of fallbackOps) {
        const fallbackValue = operations[fallbackOp](current);
        if (fallbackValue > 0 && fallbackValue <= 10000 && Number.isInteger(fallbackValue)) {
          forwardPath.push({ operation: fallbackOp, from: current, to: fallbackValue });
          current = fallbackValue;
          break;
        }
      }
    } else {
      forwardPath.push({ operation, from: current, to: newValue });
      current = newValue;
    }
  }
  
  return { goal: current, optimalMoves: targetLength, path: forwardPath };
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
 * Generate an interesting number that fits the difficulty
 */
function generateInterestingGoal(difficulty) {
  const config = difficultyLevels[difficulty];
  const [minGoal, maxGoal] = config.goalRange;
  
  // Create pools of interesting numbers
  const powerOf2s = [2, 4, 8, 16, 32, 64, 128, 256, 512].filter(n => n >= minGoal && n <= maxGoal);
  const palindromes = [];
  const niceNumbers = []; // Numbers with interesting digit patterns
  
  // Generate palindromes in range
  for (let n = minGoal; n <= maxGoal; n++) {
    const str = n.toString();
    if (str === str.split('').reverse().join('')) {
      palindromes.push(n);
    }
    
    // Numbers with repeating digits
    if (/(\d)\1+/.test(str)) {
      niceNumbers.push(n);
    }
    
    // Numbers that are multiples of their digit sum
    const digitSum = str.split('').reduce((sum, d) => sum + parseInt(d), 0);
    if (n % digitSum === 0 && digitSum > 1) {
      niceNumbers.push(n);
    }
  }
  
  // Weighted selection based on difficulty
  const pools = {
    powerOf2s: powerOf2s.length > 0 ? powerOf2s : [Math.floor(Math.random() * (maxGoal - minGoal)) + minGoal],
    palindromes: palindromes.length > 0 ? palindromes : [Math.floor(Math.random() * (maxGoal - minGoal)) + minGoal],
    niceNumbers: niceNumbers.length > 0 ? niceNumbers : [Math.floor(Math.random() * (maxGoal - minGoal)) + minGoal],
    random: [Math.floor(Math.random() * (maxGoal - minGoal)) + minGoal]
  };
  
  const poolWeights = {
    1: { powerOf2s: 50, palindromes: 20, niceNumbers: 20, random: 10 },
    2: { powerOf2s: 40, palindromes: 25, niceNumbers: 25, random: 10 },
    3: { powerOf2s: 30, palindromes: 30, niceNumbers: 30, random: 10 },
    4: { powerOf2s: 25, palindromes: 35, niceNumbers: 30, random: 10 },
    5: { powerOf2s: 20, palindromes: 30, niceNumbers: 35, random: 15 },
    6: { powerOf2s: 15, palindromes: 30, niceNumbers: 35, random: 20 }
  };
  
  const weights = poolWeights[difficulty] || poolWeights[3];
  const selectedPool = getWeightedPool(pools, weights);
  
  return selectedPool[Math.floor(Math.random() * selectedPool.length)];
}

function getWeightedPool(pools, weights) {
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const [poolName, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return pools[poolName];
    }
  }
  
  return pools.random;
}

/**
 * Main function: Generate a complete exercise
 */
export function generateExercise(difficulty = 3, options = {}) {
  if (!difficultyLevels[difficulty]) {
    throw new Error(`Invalid difficulty level: ${difficulty}. Must be 1-6.`);
  }
  
  const config = difficultyLevels[difficulty];
  const maxAttempts = options.maxAttempts || 50;
  let bestExercise = null;
  let bestScore = -1;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Try different approaches
    let goal, optimalMoves;
    
    if (Math.random() < 0.7) {
      // Method 1: Generate backward path (more reliable)
      const targetLength = Math.floor(Math.random() * (config.targetMoves[1] - config.targetMoves[0] + 1)) + config.targetMoves[0];
      const backwardResult = generateBackwardPath(difficulty, targetLength);
      goal = backwardResult.goal;
      optimalMoves = backwardResult.optimalMoves;
    } else {
      // Method 2: Pick interesting goal and validate
      goal = generateInterestingGoal(difficulty);
      optimalMoves = Math.floor(Math.random() * (config.targetMoves[1] - config.targetMoves[0] + 1)) + config.targetMoves[0];
    }
    
    // Validate the exercise
    const validation = validateExercise(goal, Math.max(optimalMoves + 5, 15));
    
    if (validation.solvable) {
      // Score the exercise (prefer goals in target range with reasonable difficulty)
      const inRange = goal >= config.goalRange[0] && goal <= config.goalRange[1];
      const movesOk = validation.minMoves >= config.targetMoves[0] && validation.minMoves <= config.targetMoves[1] + 2;
      
      let score = 0;
      if (inRange) score += 40;
      if (movesOk) score += 40;
      if (validation.minMoves <= optimalMoves + 2) score += 20; // Realistic optimal estimate
      
      if (score > bestScore) {
        bestScore = score;
        bestExercise = {
          goal,
          level: difficulty,
          levelName: config.name,
          description: config.description,
          optimalMoves: validation.minMoves,
          estimatedMoves: optimalMoves,
          difficulty: config.complexity,
          solutionPath: validation.solutionPath,
          metadata: {
            isInteresting: isInterestingNumber(goal),
            isPowerOf2: (goal & (goal - 1)) === 0,
            isPalindrome: goal.toString() === goal.toString().split('').reverse().join(''),
            digitSum: goal.toString().split('').reduce((sum, d) => sum + parseInt(d), 0)
          }
        };
      }
      
      // If we found a perfect match, use it
      if (score >= 80) break;
    }
  }
  
  if (!bestExercise) {
    // Fallback to a simple exercise
    const fallbackGoals = {
      1: 10, 2: 25, 3: 64, 4: 128, 5: 256, 6: 512
    };
    const fallbackGoal = fallbackGoals[difficulty] || 64;
    const validation = validateExercise(fallbackGoal);
    
    bestExercise = {
      goal: fallbackGoal,
      level: difficulty,
      levelName: config.name,
      description: config.description,
      optimalMoves: validation.minMoves,
      estimatedMoves: validation.minMoves,
      difficulty: config.complexity,
      solutionPath: validation.solutionPath,
      metadata: {
        isInteresting: true,
        isPowerOf2: (fallbackGoal & (fallbackGoal - 1)) === 0,
        isPalindrome: false,
        digitSum: fallbackGoal.toString().split('').reduce((sum, d) => sum + parseInt(d), 0)
      }
    };
  }
  
  return bestExercise;
}

/**
 * Check if a number has interesting mathematical properties
 */
function isInterestingNumber(n) {
  const str = n.toString();
  
  // Power of 2
  if ((n & (n - 1)) === 0) return true;
  
  // Palindrome
  if (str === str.split('').reverse().join('')) return true;
  
  // Perfect square
  const sqrt = Math.sqrt(n);
  if (sqrt === Math.floor(sqrt)) return true;
  
  // Triangular number
  const triangular = Math.floor((-1 + Math.sqrt(1 + 8 * n)) / 2);
  if (triangular * (triangular + 1) / 2 === n) return true;
  
  // Fibonacci-like
  const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];
  if (fib.includes(n)) return true;
  
  // Repeating digits
  if (/(\d)\1+/.test(str)) return true;
  
  // Multiple of digit sum
  const digitSum = str.split('').reduce((sum, d) => sum + parseInt(d), 0);
  if (n % digitSum === 0 && digitSum > 1) return true;
  
  return false;
}

/**
 * Generate a batch of exercises for a difficulty level
 */
export function generateExerciseBatch(difficulty, count = 10) {
  const exercises = [];
  const usedGoals = new Set();
  
  for (let i = 0; i < count * 3 && exercises.length < count; i++) {
    const exercise = generateExercise(difficulty);
    
    if (!usedGoals.has(exercise.goal)) {
      usedGoals.add(exercise.goal);
      exercises.push({
        ...exercise,
        id: `${difficulty}-${exercises.length + 1}`,
        index: exercises.length + 1
      });
    }
  }
  
  return exercises;
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

/**
 * Progressive difficulty - suggest next level based on performance
 */
export function suggestNextDifficulty(currentLevel, averageMoves, averageOptimal, successRate) {
  // If doing well, suggest higher difficulty
  if (successRate > 0.8 && averageMoves <= averageOptimal * 1.2) {
    return Math.min(currentLevel + 1, 6);
  }
  
  // If struggling, suggest staying or going lower
  if (successRate < 0.5 || averageMoves > averageOptimal * 1.8) {
    return Math.max(currentLevel - 1, 1);
  }
  
  // Otherwise, stay at current level
  return currentLevel;
}