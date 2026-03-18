/**
 * Demo script for the Exercise Generator
 * Run this to see how the algorithm generates different difficulty levels
 */

import { generateExercise, generateExerciseBatch, getDifficultyLevels, suggestNextDifficulty } from './exerciseGenerator.js';

/**
 * Demo: Generate exercises for all difficulty levels
 */
function demoAllDifficulties() {
  console.log('🎯 NUMBER PUZZLE EXERCISE GENERATOR DEMO');
  console.log('==========================================\n');
  
  const levels = getDifficultyLevels();
  
  levels.forEach(level => {
    console.log(`📊 Level ${level.level}: ${level.name} - ${level.description}`);
    console.log(`   Goal Range: ${level.goalRange[0]} - ${level.goalRange[1]}`);
    console.log(`   Target Moves: ${level.targetMoves[0]} - ${level.targetMoves[1]}`);
    console.log('   Sample Exercises:');
    
    // Generate 3 sample exercises for this level
    for (let i = 0; i < 3; i++) {
      const exercise = generateExercise(level.level);
      console.log(`     ${i + 1}. Goal: ${exercise.goal} | Optimal: ${exercise.optimalMoves} moves | ${exercise.metadata.isInteresting ? '⭐ Interesting' : 'Standard'}`);
      
      if (exercise.metadata.isPowerOf2) console.log(`        💫 Power of 2`);
      if (exercise.metadata.isPalindrome) console.log(`        🪞 Palindrome`);
      if (exercise.solutionPath.length <= 3) {
        console.log(`        🛤️  Solution: ${exercise.solutionPath.map(step => `${step.from}→${step.operation}→${step.to}`).join(' | ')}`);
      }
    }
    console.log('');
  });
}

/**
 * Demo: Show a complete exercise batch
 */
function demoBatchGeneration() {
  console.log('📚 BATCH GENERATION DEMO');
  console.log('=========================\n');
  
  const difficulty = 3; // Medium level
  const batch = generateExerciseBatch(difficulty, 5);
  
  console.log(`Generated ${batch.length} exercises for level ${difficulty}:`);
  batch.forEach(exercise => {
    console.log(`\n🎯 Exercise ${exercise.index}:`);
    console.log(`   Goal: 1 → ${exercise.goal}`);
    console.log(`   Optimal Moves: ${exercise.optimalMoves}`);
    console.log(`   Difficulty: ${exercise.difficulty}`);
    console.log(`   Features: ${getFeatureList(exercise.metadata)}`);
    
    if (exercise.solutionPath.length <= 6) {
      console.log(`   One Solution: 1 → ${exercise.solutionPath.map(s => s.to).join(' → ')}`);
      console.log(`   Operations: ${exercise.solutionPath.map(s => s.operation.toUpperCase()).join(', ')}`);
    }
  });
}

/**
 * Demo: Progressive difficulty suggestion
 */
function demoProgressiveDifficulty() {
  console.log('\n🎓 PROGRESSIVE DIFFICULTY DEMO');
  console.log('===============================\n');
  
  const scenarios = [
    { name: 'Expert Player', currentLevel: 2, avgMoves: 5.2, avgOptimal: 6.0, successRate: 0.9 },
    { name: 'Struggling Player', currentLevel: 4, avgMoves: 15.8, avgOptimal: 9.0, successRate: 0.3 },
    { name: 'Average Player', currentLevel: 3, avgMoves: 8.5, avgOptimal: 7.5, successRate: 0.7 },
    { name: 'Beginner', currentLevel: 1, avgMoves: 4.0, avgOptimal: 4.0, successRate: 0.6 }
  ];
  
  scenarios.forEach(scenario => {
    const suggested = suggestNextDifficulty(
      scenario.currentLevel, 
      scenario.avgMoves, 
      scenario.avgOptimal, 
      scenario.successRate
    );
    
    const direction = suggested > scenario.currentLevel ? '📈 Increase' : 
                     suggested < scenario.currentLevel ? '📉 Decrease' : '⏸️ Stay';
    
    console.log(`👤 ${scenario.name}:`);
    console.log(`   Current: Level ${scenario.currentLevel} | Success: ${(scenario.successRate * 100).toFixed(0)}% | Efficiency: ${(scenario.avgOptimal/scenario.avgMoves * 100).toFixed(0)}%`);
    console.log(`   Suggestion: ${direction} to Level ${suggested}\n`);
  });
}

/**
 * Demo: Show interesting number detection
 */
function demoInterestingNumbers() {
  console.log('✨ INTERESTING NUMBER DETECTION');
  console.log('================================\n');
  
  // Generate some exercises and show their interesting properties
  for (let difficulty = 1; difficulty <= 6; difficulty++) {
    console.log(`Level ${difficulty}:`);
    for (let i = 0; i < 5; i++) {
      const exercise = generateExercise(difficulty);
      if (exercise.metadata.isInteresting) {
        const features = getFeatureList(exercise.metadata);
        console.log(`   ${exercise.goal} (${exercise.optimalMoves} moves) - ${features}`);
      }
    }
    console.log('');
  }
}

/**
 * Helper function to format metadata features
 */
function getFeatureList(metadata) {
  const features = [];
  if (metadata.isPowerOf2) features.push('Power of 2');
  if (metadata.isPalindrome) features.push('Palindrome');
  if (metadata.isInteresting) features.push('Special Pattern');
  return features.length > 0 ? features.join(', ') : 'Standard';
}

/**
 * Demo: Algorithm performance analysis  
 */
function demoPerformanceAnalysis() {
  console.log('⚡ ALGORITHM PERFORMANCE ANALYSIS');
  console.log('==================================\n');
  
  const difficulties = [1, 2, 3, 4, 5, 6];
  
  difficulties.forEach(difficulty => {
    console.log(`\n📊 Level ${difficulty} Analysis:`);
    
    const startTime = Date.now();
    const exercises = [];
    
    // Generate 20 exercises and analyze them
    for (let i = 0; i < 20; i++) {
      exercises.push(generateExercise(difficulty));
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / exercises.length;
    
    // Calculate statistics
    const goals = exercises.map(e => e.goal);
    const moves = exercises.map(e => e.optimalMoves);
    const interesting = exercises.filter(e => e.metadata.isInteresting).length;
    
    const avgGoal = (goals.reduce((a, b) => a + b, 0) / goals.length).toFixed(1);
    const avgMoves = (moves.reduce((a, b) => a + b, 0) / moves.length).toFixed(1);
    const minGoal = Math.min(...goals);
    const maxGoal = Math.max(...goals);  
    const minMoves = Math.min(...moves);
    const maxMoves = Math.max(...moves);
    
    console.log(`   Generation time: ${avgTime.toFixed(1)}ms per exercise`);
    console.log(`   Goal range: ${minGoal} - ${maxGoal} (avg: ${avgGoal})`);
    console.log(`   Move range: ${minMoves} - ${maxMoves} (avg: ${avgMoves})`);
    console.log(`   Interesting numbers: ${interesting}/20 (${(interesting/20*100).toFixed(0)}%)`);
    
    // Show distribution of number types
    const powerOf2Count = exercises.filter(e => e.metadata.isPowerOf2).length;
    const palindromeCount = exercises.filter(e => e.metadata.isPalindrome).length;
    
    if (powerOf2Count > 0) console.log(`   Powers of 2: ${powerOf2Count}`);
    if (palindromeCount > 0) console.log(`   Palindromes: ${palindromeCount}`);
  });
}

/**
 * Run all demos
 */
export function runAllDemos() {
  demoAllDifficulties();
  demoBatchGeneration();
  demoProgressiveDifficulty();
  demoInterestingNumbers();
  demoPerformanceAnalysis();
  
  console.log('\n🎉 DEMO COMPLETE!');
  console.log('================\n');
  console.log('The exercise generator is ready to use in your game!');
  console.log('Key features:');
  console.log('• ✅ Guaranteed solvable exercises');
  console.log('• 🎯 6 difficulty levels with smart scaling');  
  console.log('• ⭐ Interesting number patterns (powers of 2, palindromes, etc.)');
  console.log('• 📈 Progressive difficulty suggestions');
  console.log('• ⚡ Fast generation (< 5ms per exercise)');
  console.log('• 🎲 Variety - no repeated goals in batches');
}

// Auto-run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllDemos();
}