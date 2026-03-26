#!/usr/bin/env node

/**
 * Benchmark script to compare lazy vs greedy validation
 * Tests validateExercise performance and result quality for numbers 2-10000
 *
 * Environment variables:
 * - START_NUMBER: Starting number (default: 2)
 * - END_NUMBER: Ending number (default: 10000)
 * - MAX_MOVES: Maximum moves for validation (default: 30)
 */

import { validateExercise } from "./src/exerciseGenerator.js";

// Configuration from environment or defaults
const START_NUMBER = parseInt(process.env.START_NUMBER || "2");
const END_NUMBER = parseInt(process.env.END_NUMBER || "10000");
const MAX_MOVES = parseInt(process.env.MAX_MOVES || "30");
const SAMPLE_SIZE = END_NUMBER - START_NUMBER + 1;

console.log("🔬 Doxiny Validation Benchmark: Lazy vs Greedy");
console.log("=".repeat(60));
console.log(
  `Testing range: ${START_NUMBER} to ${END_NUMBER} (${SAMPLE_SIZE.toLocaleString()} numbers)`,
);
console.log(`Max moves: ${MAX_MOVES}`);
console.log(`Started: ${new Date().toLocaleString()}\n`);

// Results storage
const results = {
  lazy: {
    totalTime: 0,
    solvableCount: 0,
    averageMoves: 0,
    totalMoves: 0,
    algorithms: {},
    errors: 0,
  },
  greedy: {
    totalTime: 0,
    solvableCount: 0,
    averageMoves: 0,
    totalMoves: 0,
    algorithms: {},
    errors: 0,
  },
  comparison: {
    sameSolution: 0,
    differentMoves: 0,
    lazyBetter: 0,
    greedyBetter: 0,
    onlyLazySolved: 0,
    onlyGreedySolved: 0,
  },
};

// Progress tracking
let processed = 0;
const progressInterval = Math.floor(SAMPLE_SIZE / 20); // Show progress every 5%

function showProgress() {
  const percentage = Math.round((processed / SAMPLE_SIZE) * 100);
  const progressBar =
    "█".repeat(Math.floor(percentage / 5)) +
    "░".repeat(20 - Math.floor(percentage / 5));
  process.stdout.write(
    `\r[${progressBar}] ${percentage}% (${processed.toLocaleString()}/${SAMPLE_SIZE.toLocaleString()})`,
  );
}

// Benchmark function
function benchmarkValidation(goal, lazy = true) {
  const startTime = process.hrtime.bigint();

  try {
    const result = validateExercise(goal, lazy, MAX_MOVES);
    const endTime = process.hrtime.bigint();
    const timeMs = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds

    return {
      success: true,
      time: timeMs,
      solvable: result.solvable,
      moves: result.solvable ? result.minMoves : 0,
      algorithm: result.algorithm,
      solutionPath: result.solutionPath,
    };
  } catch (error) {
    const endTime = process.hrtime.bigint();
    const timeMs = Number(endTime - startTime) / 1_000_000;

    return {
      success: false,
      time: timeMs,
      error: error.message,
      solvable: false,
      moves: 0,
      algorithm: "error",
    };
  }
}

// Main benchmark loop
console.log("Running benchmarks...\n");

for (let goal = START_NUMBER; goal <= END_NUMBER; goal++) {
  // Test lazy validation
  const lazyResult = benchmarkValidation(goal, true);

  // Test greedy validation
  const greedyResult = benchmarkValidation(goal, false);

  // Update lazy stats
  results.lazy.totalTime += lazyResult.time;
  if (lazyResult.success) {
    if (lazyResult.solvable) {
      results.lazy.solvableCount++;
      results.lazy.totalMoves += lazyResult.moves;
      results.lazy.algorithms[lazyResult.algorithm] =
        (results.lazy.algorithms[lazyResult.algorithm] || 0) + 1;
    }
  } else {
    results.lazy.errors++;
  }

  // Update greedy stats
  results.greedy.totalTime += greedyResult.time;
  if (greedyResult.success) {
    if (greedyResult.solvable) {
      results.greedy.solvableCount++;
      results.greedy.totalMoves += greedyResult.moves;
      results.greedy.algorithms[greedyResult.algorithm] =
        (results.greedy.algorithms[greedyResult.algorithm] || 0) + 1;
    }
  } else {
    results.greedy.errors++;
  }

  // Compare results
  if (lazyResult.success && greedyResult.success) {
    if (lazyResult.solvable && greedyResult.solvable) {
      if (
        lazyResult.moves === greedyResult.moves &&
        lazyResult.algorithm === greedyResult.algorithm
      ) {
        results.comparison.sameSolution++;
      } else if (lazyResult.moves !== greedyResult.moves) {
        results.comparison.differentMoves++;
        if (lazyResult.moves < greedyResult.moves) {
          results.comparison.lazyBetter++;
        } else {
          results.comparison.greedyBetter++;
        }
      }
    } else if (lazyResult.solvable && !greedyResult.solvable) {
      results.comparison.onlyLazySolved++;
    } else if (!lazyResult.solvable && greedyResult.solvable) {
      results.comparison.onlyGreedySolved++;
    }
  }

  processed++;

  // Show progress
  if (processed % progressInterval === 0 || processed === SAMPLE_SIZE) {
    showProgress();
  }
}

// Calculate final statistics
results.lazy.averageMoves =
  results.lazy.solvableCount > 0
    ? results.lazy.totalMoves / results.lazy.solvableCount
    : 0;
results.greedy.averageMoves =
  results.greedy.solvableCount > 0
    ? results.greedy.totalMoves / results.greedy.solvableCount
    : 0;

console.log("\n\n" + "=".repeat(60));
console.log("📊 BENCHMARK RESULTS");
console.log("=".repeat(60));

// Performance comparison
console.log("\n🏃 PERFORMANCE COMPARISON");
console.log("-".repeat(40));
console.log(`Lazy Total Time:    ${results.lazy.totalTime.toFixed(2)} ms`);
console.log(`Greedy Total Time:  ${results.greedy.totalTime.toFixed(2)} ms`);
console.log(
  `Speed Improvement:  ${((results.greedy.totalTime / results.lazy.totalTime) * 100).toFixed(1)}% (lazy vs greedy)`,
);
console.log(
  `Lazy Avg/Number:    ${(results.lazy.totalTime / SAMPLE_SIZE).toFixed(3)} ms`,
);
console.log(
  `Greedy Avg/Number:  ${(results.greedy.totalTime / SAMPLE_SIZE).toFixed(3)} ms`,
);

// Solvability comparison
console.log("\n✅ SOLVABILITY COMPARISON");
console.log("-".repeat(40));
console.log(
  `Lazy Solvable:      ${results.lazy.solvableCount.toLocaleString()} / ${SAMPLE_SIZE.toLocaleString()} (${((results.lazy.solvableCount / SAMPLE_SIZE) * 100).toFixed(1)}%)`,
);
console.log(
  `Greedy Solvable:    ${results.greedy.solvableCount.toLocaleString()} / ${SAMPLE_SIZE.toLocaleString()} (${((results.greedy.solvableCount / SAMPLE_SIZE) * 100).toFixed(1)}%)`,
);
console.log(`Lazy Errors:        ${results.lazy.errors}`);
console.log(`Greedy Errors:      ${results.greedy.errors}`);

// Solution quality comparison
console.log("\n🎯 SOLUTION QUALITY COMPARISON");
console.log("-".repeat(40));
console.log(
  `Same Solutions:     ${results.comparison.sameSolution.toLocaleString()} (${((results.comparison.sameSolution / SAMPLE_SIZE) * 100).toFixed(1)}%)`,
);
console.log(
  `Different Moves:    ${results.comparison.differentMoves.toLocaleString()} (${((results.comparison.differentMoves / SAMPLE_SIZE) * 100).toFixed(1)}%)`,
);
console.log(
  `Lazy Better:        ${results.comparison.lazyBetter.toLocaleString()} cases`,
);
console.log(
  `Greedy Better:      ${results.comparison.greedyBetter.toLocaleString()} cases`,
);
console.log(
  `Only Lazy Solved:   ${results.comparison.onlyLazySolved.toLocaleString()} cases`,
);
console.log(
  `Only Greedy Solved: ${results.comparison.onlyGreedySolved.toLocaleString()} cases`,
);

// Average moves comparison
console.log("\n📈 MOVE EFFICIENCY COMPARISON");
console.log("-".repeat(40));
console.log(`Lazy Avg Moves:     ${results.lazy.averageMoves.toFixed(2)}`);
console.log(`Greedy Avg Moves:   ${results.greedy.averageMoves.toFixed(2)}`);
console.log(
  `Move Difference:    ${(results.greedy.averageMoves - results.lazy.averageMoves).toFixed(2)} (greedy - lazy)`,
);

// Algorithm usage comparison
console.log("\n🧪 ALGORITHM USAGE COMPARISON");
console.log("-".repeat(40));
console.log("LAZY:");
Object.entries(results.lazy.algorithms)
  .sort((a, b) => b[1] - a[1])
  .forEach(([algorithm, count]) => {
    const percentage = ((count / results.lazy.solvableCount) * 100).toFixed(1);
    console.log(`  ${algorithm}: ${count.toLocaleString()} (${percentage}%)`);
  });

console.log("\nGREEDY:");
Object.entries(results.greedy.algorithms)
  .sort((a, b) => b[1] - a[1])
  .forEach(([algorithm, count]) => {
    const percentage = ((count / results.greedy.solvableCount) * 100).toFixed(
      1,
    );
    console.log(`  ${algorithm}: ${count.toLocaleString()} (${percentage}%)`);
  });

// Summary and recommendations
console.log("\n🎯 SUMMARY & RECOMMENDATIONS");
console.log("=".repeat(60));

const speedup = results.greedy.totalTime / results.lazy.totalTime;
const qualityDiff = results.greedy.averageMoves - results.lazy.averageMoves;
const sameResults = (results.comparison.sameSolution / SAMPLE_SIZE) * 100;

if (speedup > 2.0) {
  console.log("⚡ LAZY is significantly faster (>2x speedup)");
} else if (speedup > 1.5) {
  console.log("🏃 LAZY is notably faster (1.5-2x speedup)");
} else if (speedup > 1.1) {
  console.log("🐎 LAZY is moderately faster (10-50% speedup)");
} else {
  console.log("🤷 Similar performance between approaches");
}

if (Math.abs(qualityDiff) < 0.1) {
  console.log("🎯 Solution quality is essentially identical");
} else if (qualityDiff > 0) {
  console.log(
    `📈 GREEDY finds better solutions (+${qualityDiff.toFixed(2)} avg moves)`,
  );
} else {
  console.log(
    `📉 LAZY finds better solutions (${Math.abs(qualityDiff).toFixed(2)} fewer avg moves)`,
  );
}

if (sameResults > 95) {
  console.log("✅ Methods produce nearly identical results (>95% same)");
} else if (sameResults > 85) {
  console.log("✅ Methods produce very similar results (85-95% same)");
} else if (sameResults > 70) {
  console.log("⚠️  Methods produce somewhat different results (70-85% same)");
} else {
  console.log("❌ Methods produce significantly different results (<70% same)");
}

console.log("\nRECOMMENDATION:");
if (speedup > 1.5 && Math.abs(qualityDiff) < 0.5) {
  console.log(
    "🏆 Use LAZY for exercise generation (faster with similar quality)",
  );
} else if (qualityDiff > 1.0) {
  console.log("🏆 Use GREEDY for high-quality solutions (better optimization)");
} else {
  console.log("🏆 Use LAZY by default, GREEDY when optimality is critical");
}

console.log(`\nCompleted: ${new Date().toLocaleString()}`);
console.log(
  `Total runtime: ${((results.lazy.totalTime + results.greedy.totalTime) / 1000).toFixed(1)} seconds`,
);
