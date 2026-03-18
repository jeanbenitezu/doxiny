/**
 * Integration Guide: How to connect the Exercise Generator to your existing game
 * 
 * This file shows how to integrate the intelligent exercise generator
 * into your current Number Puzzle game structure.
 */

import { generateExercise, generateExerciseBatch, suggestNextDifficulty } from './exerciseGenerator.js';
import { createGameState, applyMove } from './game.js';

/**
 * Enhanced game state that includes dynamic exercise generation
 */
export class EnhancedGameManager {
  constructor() {
    this.currentDifficulty = 1;
    this.playerStats = {
      completedExercises: 0,
      totalMoves: 0,
      perfectSolutions: 0,
      averageEfficiency: 1.0,
      successRate: 1.0
    };
    this.exerciseHistory = [];
    this.currentExercise = null;
    this.gameState = null;
  }

  /**
   * Start a new exercise with the current difficulty
   */
  startNewExercise(customDifficulty = null) {
    const difficulty = customDifficulty || this.currentDifficulty;
    
    // Generate a new exercise
    this.currentExercise = generateExercise(difficulty);
    
    // Create corresponding game state
    this.gameState = createGameState(this.currentExercise.goal, difficulty);
    
    console.log(`🎯 New Exercise: Reach ${this.currentExercise.goal} in ${this.currentExercise.optimalMoves} moves!`);
    
    return {
      exercise: this.currentExercise,
      gameState: this.gameState
    };
  }

  /**
   * Apply a move and check for completion
   */
  makeMove(operation) {
    if (!this.gameState || !this.currentExercise) {
      throw new Error('No active exercise. Call startNewExercise() first.');
    }

    this.gameState = applyMove(this.gameState, operation);
    
    if (this.gameState.isComplete) {
      this.onExerciseComplete();
    }

    return this.gameState;
  }

  /**
   * Handle exercise completion and update stats
   */
  onExerciseComplete() {
    const moves = this.gameState.moves;
    const optimal = this.currentExercise.optimalMoves;
    const efficiency = optimal / moves;
    const isPerfect = moves <= optimal;

    // Update player stats
    this.playerStats.completedExercises++;
    this.playerStats.totalMoves += moves;
    if (isPerfect) this.playerStats.perfectSolutions++;
    
    // Calculate rolling averages
    this.playerStats.averageEfficiency = (
      this.playerStats.averageEfficiency * (this.playerStats.completedExercises - 1) + efficiency
    ) / this.playerStats.completedExercises;
    
    this.playerStats.successRate = this.playerStats.completedExercises > 0 ? 
      (this.playerStats.completedExercises - this.getFailedAttempts()) / this.playerStats.completedExercises : 1.0;

    // Store in history
    this.exerciseHistory.push({
      exercise: this.currentExercise,
      moves: moves,
      optimal: optimal,
      efficiency: efficiency,
      isPerfect: isPerfect,
      completedAt: new Date()
    });

    // Suggest difficulty adjustment
    this.suggestDifficultyAdjustment();

    return {
      moves,
      optimal,
      efficiency,
      isPerfect,
      grade: this.getPerformanceGrade(efficiency)
    };
  }

  /**
   * Get performance grade based on efficiency
   */
  getPerformanceGrade(efficiency) {
    if (efficiency >= 1.0) return { grade: 'S', description: 'Perfect!', emoji: '🏆' };
    if (efficiency >= 0.85) return { grade: 'A', description: 'Excellent!', emoji: '⭐' };
    if (efficiency >= 0.7) return { grade: 'B', description: 'Great!', emoji: '👍' };
    if (efficiency >= 0.55) return { grade: 'C', description: 'Good!', emoji: '😊' };
    if (efficiency >= 0.4) return { grade: 'D', description: 'Keep trying!', emoji: '💪' };
    return { grade: 'F', description: 'Try again!', emoji: '🎯' };
  }

  /**
   * Suggest difficulty adjustment based on performance
   */
  suggestDifficultyAdjustment() {
    if (this.playerStats.completedExercises < 3) return; // Need more data
    
    const recentExercises = this.exerciseHistory.slice(-5); // Last 5 exercises
    const avgMoves = recentExercises.reduce((sum, ex) => sum + ex.moves, 0) / recentExercises.length;
    const avgOptimal = recentExercises.reduce((sum, ex) => sum + ex.optimal, 0) / recentExercises.length;
    const successRate = recentExercises.filter(ex => ex.isPerfect).length / recentExercises.length;

    const suggested = suggestNextDifficulty(this.currentDifficulty, avgMoves, avgOptimal, successRate);
    
    if (suggested !== this.currentDifficulty) {
      const direction = suggested > this.currentDifficulty ? 'increase' : 'decrease';
      console.log(`💡 Suggestion: ${direction} difficulty to level ${suggested}`);
      
      return {
        suggestion: suggested,
        direction: direction,
        reason: this.getDifficultyChangeReason(suggested, successRate, avgMoves / avgOptimal)
      };
    }
    
    return null;
  }

  /**
   * Get human-readable reason for difficulty change
   */
  getDifficultyChangeReason(newLevel, successRate, efficiency) {
    if (newLevel > this.currentDifficulty) {
      if (successRate > 0.8) return "You're mastering this level - time for a bigger challenge!";
      if (efficiency > 1.2) return "You're solving efficiently - ready for the next level!";
      return "Great progress - let's try harder exercises!";
    } else {
      if (successRate < 0.4) return "Let's practice more at an easier level.";
      if (efficiency < 0.6) return "Try an easier level to build confidence.";
      return "Let's take a step back and solidify your skills.";
    }
  }

  /**
   * Generate a practice set for the current difficulty
   */
  generatePracticeSet(count = 5) {
    const batch = generateExerciseBatch(this.currentDifficulty, count);
    
    return {
      difficulty: this.currentDifficulty,
      exercises: batch,
      estimatedTime: batch.length * 2, // ~2 minutes per exercise
      totalOptimalMoves: batch.reduce((sum, ex) => sum + ex.optimalMoves, 0)
    };
  }

  /**
   * Get player's current skill assessment
   */
  getSkillAssessment() {
    if (this.playerStats.completedExercises === 0) {
      return {
        level: 'Beginner',
        description: 'Just getting started!',
        recommendation: 'Try the tutorial levels to learn the basics.'
      };
    }

    const efficiency = this.playerStats.averageEfficiency;
    const completedCount = this.playerStats.completedExercises;
    
    let level, description, recommendation;
    
    if (efficiency >= 0.9 && completedCount >= 20) {
      level = 'Master';
      description = 'Exceptional problem-solving skills!';
      recommendation = 'Try the most challenging exercises and speed runs.';
    } else if (efficiency >= 0.75 && completedCount >= 10) {
      level = 'Expert';
      description = 'Strong strategic thinking.';
      recommendation = 'Push yourself with harder difficulty levels.';
    } else if (efficiency >= 0.6 && completedCount >= 5) {
      level = 'Advanced';
      description = 'Good understanding of the game.';
      recommendation = 'Focus on optimizing your move count.';
    } else if (completedCount >= 3) {
      level = 'Intermediate';
      description = 'Learning the patterns.';
      recommendation = 'Practice more to improve efficiency.';
    } else {
      level = 'Beginner';
      description = 'Building foundational skills.';
      recommendation = 'Complete more exercises to improve.';
    }

    return { level, description, recommendation, efficiency, completedCount };
  }

  /**
   * Get estimated failed attempts (exercises started but not completed)
   */
  getFailedAttempts() {
    // This would be tracked separately in a real implementation
    // For now, estimate based on efficiency
    return Math.max(0, Math.floor(this.playerStats.completedExercises * (1 - this.playerStats.successRate)));
  }

  /**
   * Change difficulty manually
   */
  setDifficulty(newDifficulty) {
    if (newDifficulty < 1 || newDifficulty > 6) {
      throw new Error('Difficulty must be between 1 and 6');
    }
    
    this.currentDifficulty = newDifficulty;
    console.log(`🎚️ Difficulty set to level ${newDifficulty}`);
  }

  /**
   * Get current game status for UI updates
   */
  getGameStatus() {
    return {
      currentExercise: this.currentExercise,
      gameState: this.gameState,
      playerStats: this.playerStats,
      currentDifficulty: this.currentDifficulty,
      skillAssessment: this.getSkillAssessment()
    };
  }
}

/**
 * Example usage of the Enhanced Game Manager
 */
export function exampleUsage() {
  console.log('🎮 ENHANCED GAME MANAGER EXAMPLE');
  console.log('=================================\n');

  // Create a new game manager
  const game = new EnhancedGameManager();
  
  // Start with beginner difficulty
  game.setDifficulty(1);
  
  // Start first exercise
  let { exercise, gameState } = game.startNewExercise();
  console.log(`Started exercise: 1 → ${exercise.goal} (${exercise.optimalMoves} moves optimal)`);
  
  // Simulate some moves (this would be player input in real game)
  console.log('\n🎯 Simulating gameplay...');
  const exampleMoves = ['double', 'double', 'add1Right', 'sum'];
  
  for (const move of exampleMoves) {
    try {
      const newState = game.makeMove(move);
      console.log(`Applied ${move.toUpperCase()}: ${newState.current} (${newState.moves} moves)`);
      
      if (newState.isComplete) {
        const result = game.onExerciseComplete();
        console.log(`✅ Completed in ${result.moves} moves! Grade: ${result.grade.grade} ${result.grade.emoji}`);
        break;
      }
    } catch (error) {
      console.log(`❌ Invalid move: ${move}`);
      break;
    }
  }
  
  // Show skill assessment
  const assessment = game.getSkillAssessment();
  console.log(`\n📊 Skill Level: ${assessment.level} - ${assessment.description}`);
  console.log(`💡 Recommendation: ${assessment.recommendation}`);
  
  // Generate practice set
  const practiceSet = game.generatePracticeSet(3);
  console.log(`\n📚 Generated ${practiceSet.exercises.length} practice exercises:`);
  practiceSet.exercises.forEach((ex, i) => {
    console.log(`   ${i + 1}. Goal: ${ex.goal} (${ex.optimalMoves} moves) - ${ex.metadata.isInteresting ? '⭐' : '📝'}`);
  });
}

/**
 * How to integrate with your existing main.js
 */
export function integrationTips() {
  console.log('\n🔧 INTEGRATION TIPS FOR YOUR EXISTING GAME');
  console.log('===========================================\n');
  
  console.log('1. Replace static levels array with dynamic generation:');
  console.log('   // Old: const levels = [{ goal: 10 }, { goal: 25 }, { goal: 128 }];');
  console.log('   // New: const gameManager = new EnhancedGameManager();');
  
  console.log('\n2. Update level progression:');
  console.log('   // Instead of fixed progression, use difficulty adjustment');
  console.log('   // gameManager.suggestDifficultyAdjustment()');
  
  console.log('\n3. Enhanced UI feedback:');
  console.log('   // Show optimal moves, efficiency percentage, skill level');
  console.log('   // Display interesting number properties (palindrome, power of 2, etc.)');
  
  console.log('\n4. Practice mode:');
  console.log('   // Generate batches for practice sessions');
  console.log('   // const practiceSet = gameManager.generatePracticeSet(5);');
  
  console.log('\n5. Player progression tracking:');
  console.log('   // Automatic difficulty adjustment based on performance');
  console.log('   // Long-term skill assessment and recommendations');
  
  console.log('\n✅ The generator is designed to drop-in replace your current level system!');
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage();
  integrationTips();
}