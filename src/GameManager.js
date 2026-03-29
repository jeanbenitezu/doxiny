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

export class GameManager {
  constructor() {
    this.gameModeManager = new GameModeManager();

    // In Normal mode, start at highest unlocked level
    if (this.gameModeManager.isNormal()) {
      this.currentDifficulty = this.gameModeManager.getHighestUnlockedLevel();
    } else {
      this.currentDifficulty = 1; // Default for Free Play mode
    }

    this.currentExercise = null;
    this.isCustomExercise = false;
    this.customExerciseLevel = null;
    this.generateNewExercise();
  }

  generateNewExercise() {
    this.currentExercise = generateExercise(this.currentDifficulty);
    this.isCustomExercise = false;
    this.customExerciseLevel = null;
    console.log(
      `🎯 New Exercise: 1 → ${this.currentExercise.goal} (${this.currentExercise.optimalMoves} moves optimal)`,
    );
    return this.currentExercise;
  }

  onExerciseComplete(moves, updateLevelSelectorUI) {
    const optimal = this.currentExercise.optimalMoves;
    const efficiency = optimal / moves;
    const isPerfect = moves <= optimal;

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
            if (updateLevelSelectorUI) {
              updateLevelSelectorUI();
            }
          }
        }
        // Award mastery only when successfully completing level 6
        else if (this.currentDifficulty === 6) {
          masterAchieved = this.gameModeManager.checkAndAwardMasterStatus();
        }
      }
    }

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
    if (efficiency >= 1.0)
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

      this.currentDifficulty = newDifficulty;
      this.generateNewExercise();
      return true;
    }
    return false;
  }

  setCustomExercise(goal, optimalMoves, solutionPath = []) {
    // Detect appropriate level for this custom exercise
    this.customExerciseLevel = detectCustomExerciseLevel(goal, optimalMoves);

    this.currentExercise = {
      goal: goal,
      optimalMoves: optimalMoves,
      solutionPath: solutionPath,
      isCustom: true,
    };

    this.isCustomExercise = true;

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
}
