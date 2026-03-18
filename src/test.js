/**
 * Simple test to verify exercise generator creates solvable exercises
 */

import { generateExercise } from './exerciseGenerator.js';
import { operations } from './operations.js';

console.log('🧪 TESTING EXERCISE SOLVABILITY');
console.log('================================\n');

// Test a few exercises at different difficulty levels
for (let difficulty = 1; difficulty <= 3; difficulty++) {
  console.log(`📊 Testing Level ${difficulty}:`);
  
  const exercise = generateExercise(difficulty);
  console.log(`  Goal: 1 → ${exercise.goal} (${exercise.optimalMoves} moves)`);
  
  // Follow the solution path to verify it works
  let current = 1;
  let moves = 0;
  let success = true;
  
  try {
    for (const step of exercise.solutionPath) {
      const result = operations[step.operation](current);
      if (result !== step.to) {
        console.log(`  ❌ Path verification failed at step ${moves + 1}: expected ${step.to}, got ${result}`);
        success = false;
        break;
      }
      current = result;
      moves++;
    }
    
    if (success && current === exercise.goal) {
      console.log(`  ✅ Solution verified! Path works correctly in ${moves} moves`);
    } else {
      console.log(`  ❌ Solution verification failed: reached ${current}, expected ${exercise.goal}`);
    }
    
    console.log(`  🛤️  Path: 1 → ${exercise.solutionPath.map(s => s.to).join(' → ')}`);
    console.log(`  🔧 Operations: ${exercise.solutionPath.map(s => s.operation.toUpperCase()).join(', ')}`);
    
    // Show special features
    const features = [];
    if (exercise.metadata.isPowerOf2) features.push('💫 Power of 2');
    if (exercise.metadata.isPalindrome) features.push('🪞 Palindrome'); 
    if (features.length > 0) {
      console.log(`  ✨ Special: ${features.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Error testing exercise: ${error.message}`);
  }
  
  console.log('');
}

console.log('✅ Exercise generator test complete!');