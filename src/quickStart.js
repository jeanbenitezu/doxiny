/**
 * QUICK START GUIDE: Exercise Generator
 * =====================================
 * 
 * Simple guide to integrate the intelligent exercise generator into your Number Puzzle game
 */

import { generateExercise, generateExerciseBatch, getDifficultyLevels } from './exerciseGenerator.js';

/**
 * BASIC USAGE EXAMPLES
 */

// 1. Generate a single exercise for medium difficulty
const exercise = generateExercise(3);
console.log(`New challenge: Reach ${exercise.goal} in ${exercise.optimalMoves} moves!`);

// 2. Generate a batch of exercises for practice mode
const practiceExercises = generateExerciseBatch(2, 5); // 5 exercises at difficulty level 2
practiceExercises.forEach((ex, i) => {
    console.log(`${i+1}. Goal: ${ex.goal} (${ex.optimalMoves} moves)`);
});

// 3. Get all available difficulty levels
const levels = getDifficultyLevels();
levels.forEach(level => {
    console.log(`Level ${level.level}: ${level.name} - ${level.description}`);
});

/**
 * INTEGRATION WITH YOUR EXISTING GAME
 */

// Replace your current levels array with dynamic generation:
/*
// OLD CODE:
const levels = [
  { goal: 10, name: "Beginner", description: "Master the basics" },
  { goal: 25, name: "Intermediate", description: "Strategic thinking" }, 
  { goal: 128, name: "Expert", description: "Ultimate challenge" }
];

// NEW CODE:
const currentDifficulty = 1; // Start with beginner
const currentExercise = generateExercise(currentDifficulty);

// Update your game state creation:
let gameState = createGameState(currentExercise.goal, currentDifficulty);
*/

/**
 * RECOMMENDED FLOW FOR YOUR GAME
 */

export class SimpleGameIntegration {
    constructor() {
        this.difficulty = 1; // Start with beginner
        this.exercisesCompleted = 0;
        this.currentExercise = null;
    }

    // Generate new exercise
    newLevel() {
        this.currentExercise = generateExercise(this.difficulty);
        console.log(`🎯 New Exercise: 1 → ${this.currentExercise.goal} | Optimal: ${this.currentExercise.optimalMoves} moves`);
        
        // Return data for your UI
        return {
            goal: this.currentExercise.goal,
            level: this.difficulty,
            levelName: this.currentExercise.levelName,
            optimalMoves: this.currentExercise.optimalMoves
        };
    }

    // Handle level completion
    onLevelComplete(playerMoves) {
        this.exercisesCompleted++;
        const efficiency = this.currentExercise.optimalMoves / playerMoves;
        
        // Determine if we should increase difficulty
        if (this.exercisesCompleted % 3 === 0) { // Every 3 exercises
            if (efficiency > 0.8 && this.difficulty < 6) {
                this.difficulty++;
                console.log(`📈 Difficulty increased to level ${this.difficulty}!`);
            }
        }

        return {
            grade: this.getGrade(efficiency),
            shouldLevelUp: this.difficulty > (this.exercisesCompleted / 3)
        };
    }

    // Simple grade calculation
    getGrade(efficiency) {
        if (efficiency >= 1.0) return { grade: 'Perfect', emoji: '🏆', description: 'Optimal solution!' };
        if (efficiency >= 0.8) return { grade: 'Excellent', emoji: '⭐', description: 'Very efficient!' };
        if (efficiency >= 0.6) return { grade: 'Good', emoji: '👍', description: 'Well done!' };
        return { grade: 'Keep Trying', emoji: '💪', description: 'You can do better!' };
    }

    // Get current difficulty info
    getCurrentDifficultyInfo() {
        const levels = getDifficultyLevels();
        return levels.find(l => l.level === this.difficulty);
    }
}

/**
 * HOW TO UPDATE YOUR EXISTING UI CODE
 */

/*
// In your createGameUI() function, you can now show:

<!-- Enhanced Level Display -->
<div class="level-info">
    <h2>Level ${exercise.level}: ${exercise.levelName}</h2>
    <p>${exercise.description}</p>
    <div class="goal-display">
        Goal: 1 → ${exercise.goal}
    </div>
    <div class="target-moves">
        Target: ≤ ${exercise.optimalMoves} moves
    </div>
</div>

// In your success modal, show efficiency:
<div class="performance">
    Moves: ${playerMoves} / ${optimalMoves}
    Efficiency: ${Math.round(optimalMoves/playerMoves * 100)}%
    Grade: ${grade.grade} ${grade.emoji}
</div>
*/

/**
 * QUICK INTEGRATION STEPS
 */

export function quickIntegrationSteps() {
    console.log('🚀 QUICK INTEGRATION GUIDE');
    console.log('==========================\n');
    
    console.log('1. Add the generator to your main.js:');
    console.log('   import { generateExercise } from "./exerciseGenerator.js";\n');
    
    console.log('2. Replace static levels with dynamic generation:');
    console.log('   // const levels = [static array];');
    console.log('   const gameManager = new SimpleGameIntegration();\n');
    
    console.log('3. Update level creation:');
    console.log('   const levelData = gameManager.newLevel();');
    console.log('   gameState = createGameState(levelData.goal, levelData.level);\n');
    
    console.log('4. Enhanced completion handling:');
    console.log('   const result = gameManager.onLevelComplete(gameState.moves);');
    console.log('   // Show result.grade and handle difficulty progression\n');
    
    console.log('5. Optional: Add batch mode for practice:');
    console.log('   const practiceSet = generateExerciseBatch(difficulty, 5);\n');
    
    console.log('✅ That\'s it! Your game now has infinite, intelligent exercises!');
}

/**
 * ADVANCED FEATURES YOU CAN ADD LATER
 */

export function advancedFeatures() {
    console.log('\n🎨 ADVANCED FEATURES TO ADD LATER');
    console.log('==================================\n');
    
    console.log('• 📊 Player Statistics Dashboard');
    console.log('  - Track efficiency over time');
    console.log('  - Show improvement graphs');
    console.log('  - Leaderboard for optimal solutions\n');
    
    console.log('• 🎯 Smart Hints System');
    console.log('  - Context-aware hints based on current number');
    console.log('  - Show optimal path after completion');
    console.log('  - Tutorial for specific operation patterns\n');
    
    console.log('• 🏆 Achievement System');
    console.log('  - "Speed Master" - Solve exercises quickly');
    console.log('  - "Efficiency Expert" - 5 perfect solutions in a row');
    console.log('  - "Level Champion" - Complete all difficulty levels\n');
    
    console.log('• 🎲 Special Game Modes');
    console.log('  - Time Attack: Solve as many as possible in 5 minutes');
    console.log('  - Daily Challenge: One special exercise per day');
    console.log('  - Puzzle of the Day: Community-shared challenging exercises\n');
    
    console.log('• 📈 Adaptive Difficulty');
    console.log('  - Real-time difficulty adjustment');
    console.log('  - Separate difficulty for different number types');
    console.log('  - Learning curve analysis');
}

// Auto-run guide if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    quickIntegrationSteps();
    advancedFeatures();
}