/**
 * Game Manager
 * Handles exercise generation, difficulty management, and completion logic
 */

import { GameModeManager } from "./GameModeManager.js";
import {
  generateExercise,
  getDifficultyLevels,
  detectCustomExerciseLevel,
} from "./exerciseGenerator.js";
import { translate } from "./i18n.js";
import analyticsService from "./services/firebase/AnalyticsService.js";
import performanceService from "./services/firebase/PerformanceService.js";

export class GameManager {
  constructor() {
    this.gameModeManager = new GameModeManager();
    this.exerciseStartTime = null;
    this.hintsUsed = 0;
    this.operationsUsed = [];

    // In Normal mode, start at highest unlocked level
    if (this.gameModeManager.isNormal()) {
      this.currentDifficulty = this.gameModeManager.getHighestUnlockedLevel();
    } else {
      this.currentDifficulty = 1; // Default for Free Play mode
    }

    this.currentExercise = null;
    this.isCustomExercise = false;
    this.customExerciseLevel = null;
    
    // Set Analytics context
    analyticsService.setCurrentContext(
      this.gameModeManager.currentMode,
      this.currentDifficulty
    );
    
    this.generateNewExercise();
  }

  generateNewExercise() {
    this.currentExercise = generateExercise(this.currentDifficulty);
    this.isCustomExercise = false;
    this.customExerciseLevel = null;
    this.exerciseStartTime = Date.now();
    this.hintsUsed = 0;
    this.operationsUsed = [];
    
    console.log(
      `🎯 New Exercise: 1 → ${this.currentExercise.goal} (${this.currentExercise.optimalMoves} moves optimal)`,
    );
    return this.currentExercise;
  }

  onExerciseComplete(moves, updateLevelSelectorUI) {
    const optimal = this.currentExercise.optimalMoves;
    const efficiency = optimal / moves;
    const isPerfect = moves <= optimal;
    const completionTime = this.exerciseStartTime ? 
      Math.floor((Date.now() - this.exerciseStartTime) / 1000) : 0;

    // Handle Normal Game mode progression
    let levelUnlocked = null;
    let masterAchieved = false;
    if (this.gameModeManager.isNormal()) {
      const requiredEfficiency = this.gameModeManager.getEfficiencyRequirement(
        this.currentDifficulty,
      );
      if (efficiency >= requiredEfficiency) {
        // Check for unlocking next level (if not at max level)
        if (this.currentDifficulty < 6) {
          const nextLevel = this.currentDifficulty + 1;
          if (this.gameModeManager.unlockLevel(nextLevel)) {
            levelUnlocked = nextLevel;
            
            // Track level unlock
            analyticsService.trackLevelUnlocked(
              nextLevel,
              this.gameModeManager.unlockedLevels.length
            );
            
            if (updateLevelSelectorUI) {
              updateLevelSelectorUI();
            }
          }
        }
        // Award mastery only when successfully completing level 6
        else if (this.currentDifficulty === 6) {
          masterAchieved = this.gameModeManager.checkAndAwardMasterStatus();
          
          if (masterAchieved) {
            // Track mastery achievement
            const completionCount = parseInt(localStorage.getItem('doxiny-completion-count') || '0');
            analyticsService.trackMasteryAchieved({
              completionCount,
              averageEfficiency: Math.round(efficiency * 100),
              totalExercisesCompleted: completionCount,
              timeToMasteryMinutes: Math.floor((Date.now() - (this.gameModeManager.firstPlayTime || Date.now())) / (1000 * 60))
            });
          }
        }
      }
    }

    // Track exercise completion Analytics event
    analyticsService.trackExerciseCompleted({
      targetNumber: this.currentExercise.goal,
      movesUsed: moves,
      optimalMoves: optimal,
      efficiencyPercentage: Math.round(efficiency * 100),
      completionTimeSeconds: completionTime,
      difficultyLevel: this.isCustomExercise ? this.customExerciseLevel : this.currentDifficulty,
      gameMode: this.gameModeManager.currentMode,
      hintsUsed: this.hintsUsed,
      operationsUsed: [...this.operationsUsed], // Copy array
      isCustomExercise: this.isCustomExercise
    });

    // Calculate level change (only for display, actual unlocking handled above)
    const levelChange = this.getNextLevelInfo();

    return {
      efficiency,
      isPerfect,
      grade: this.getPerformanceGrade(efficiency),
      levelChange,
      levelUnlocked,
      masterAchieved,
    };
  }

  getNextLevelInfo() {
    const maxLevel = 6;
    if (this.currentDifficulty < maxLevel) {
      const oldDifficulty = this.currentDifficulty;
      const nextDifficulty = this.currentDifficulty + 1;

      console.log(`🎯 New level available: ${nextDifficulty}`);

      return {
        isAvailable: true,
        oldDifficulty,
        nextDifficulty: nextDifficulty,
        direction: "increased",
      };
    }

    return { isAvailable: false };
  }

  moveToNextLevel() {
    const levelChange = this.getNextLevelInfo();
    if (levelChange.isAvailable) {
      this.currentDifficulty = levelChange.nextDifficulty;
      console.log(`🎯 Advanced to level ${this.currentDifficulty}!`);
    } else {
      console.log(`🎯 Already at max level! Keep mastering the challenges!`);
    }
  }

  getPerformanceGrade(efficiency) {
    if (efficiency > 1.0)
      return {
        grade: translate("performanceGrades.incredible"),
        emoji: "<i class='lni lni-cup'></i>",
        description: translate("performanceDescriptions.incredibleSolution"),
      };
    if (efficiency === 1.0)
      return {
        grade: translate("performanceGrades.perfect"),
        emoji: "<i class='lni lni-crown'></i>",
        description: translate("performanceDescriptions.optimalSolution"),
      };
    if (efficiency >= 0.85)
      return {
        grade: translate("performanceGrades.excellent"),
        emoji: "<i class='lni lni-star-fill'></i>",
        description: translate("performanceDescriptions.amazingEfficiency"),
      };
    if (efficiency >= 0.7)
      return {
        grade: translate("performanceGrades.great"),
        emoji: "<i class='lni lni-thumbs-up'></i>",
        description: translate("performanceDescriptions.wellDone"),
      };
    if (efficiency >= 0.55)
      return {
        grade: translate("performanceGrades.good"),
        emoji: "<i class='lni lni-smile'></i>",
        description: translate("performanceDescriptions.niceJob"),
      };
    return {
      grade: translate("performanceGrades.keepTrying"),
      emoji: "<i class='lni lni-sad'></i>",
      description: translate("performanceDescriptions.youCanDoBetter"),
    };
  }

  setDifficulty(newDifficulty) {
    if (newDifficulty >= 1 && newDifficulty <= 6) {
      // Check if level is unlocked in Normal mode
      if (!this.gameModeManager.isLevelUnlocked(newDifficulty)) {
        console.log(`Level ${newDifficulty} is locked in Normal Game mode`);
        return false;
      }

      const oldDifficulty = this.currentDifficulty;
      this.currentDifficulty = newDifficulty;
      
      // Update Analytics context
      analyticsService.setCurrentContext(
        this.gameModeManager.currentMode,
        this.currentDifficulty
      );
      
      this.generateNewExercise();
      return true;
    }
    return false;
  }

  setCustomExercise(goal, optimalMoves, solutionPath = []) {
    const startTime = performance.now();
    
    // Detect appropriate level for this custom exercise
    this.customExerciseLevel = detectCustomExerciseLevel(goal, optimalMoves);

    this.currentExercise = {
      goal: goal,
      optimalMoves: optimalMoves,
      solutionPath: solutionPath,
      isCustom: true,
    };

    this.isCustomExercise = true;
    this.exerciseStartTime = Date.now();
    this.hintsUsed = 0;
    this.operationsUsed = [];
    
    // Track custom exercise generation
    const generationTime = performance.now() - startTime;
    analyticsService.trackCustomExercise(goal, generationTime);

    console.log(
      `🎯 Custom Exercise: 1 → ${goal} (detected level: ${this.customExerciseLevel}, ${optimalMoves} moves optimal)`,
    );
    return this.currentExercise;
  }

  getCurrentExerciseInfo() {
    const difficultyInfo = getDifficultyLevels().find(
      (d) => d.level === this.currentDifficulty,
    );
    return {
      exercise: this.currentExercise,
      difficulty: difficultyInfo,
    };
  }

  /**
   * Analytics Integration Methods
   */
  
  // Track hint usage
  trackHintUsed(hintType, currentNumber, movesUsed) {
    this.hintsUsed++;
    analyticsService.trackHintUsed(
      hintType,
      currentNumber,
      this.currentExercise.goal,
      movesUsed
    );
  }
  
  // Track operation usage
  trackOperationUsed(operation, fromNumber, toNumber) {
    this.operationsUsed.push(operation);
    analyticsService.trackOperationUsed(operation, fromNumber, toNumber);
  }
  
  // Track game mode switch
  trackGameModeSwitch(fromMode, toMode) {
    analyticsService.trackGameModeSwitch(fromMode, toMode);
    // Update Analytics context
    analyticsService.setCurrentContext(toMode, this.currentDifficulty);
  }
}
