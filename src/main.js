/**
 * Doxiny - Do X in Y moves
 * Mathematical puzzle game with elegant solutions
 */

import { createGameState, applyMove, resetGame } from "./game.js";
import { operations } from "./operations.js";
import {
  generateExercise,
  generateHints,
  getDifficultyLevels,
  calculateProgressToTarget,
  validateExercise,
  detectCustomExerciseLevel,
} from "./exerciseGenerator.js";
import {
  translate,
  t,
  getCurrentLanguage,
  setLanguage,
  languages,
} from "./i18n.js";
import {
  handleShareVictory,
  handleShareChallenge,
  handleSharedPuzzleURL,
} from "./sharing.js";
import "./style.css";

// Game Mode Management
class GameModeManager {
  constructor() {
    this.modes = {
      NORMAL: "normal",
      FREEPLAY: "freeplay",
    };
    this.currentMode = this.loadGameMode();
    this.unlockedLevels = this.loadUnlockedLevels();
  }

  loadGameMode() {
    const saved = localStorage.getItem("doxiny-gamemode");
    return saved === "freeplay" ? this.modes.FREEPLAY : this.modes.NORMAL; // Default to Normal
  }

  saveGameMode() {
    localStorage.setItem("doxiny-gamemode", this.currentMode);
  }

  isFreePlay() {
    return this.currentMode === this.modes.FREEPLAY;
  }

  isNormal() {
    return this.currentMode === this.modes.NORMAL;
  }

  loadUnlockedLevels() {
    const saved = localStorage.getItem("doxiny-unlocked-levels");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse unlocked levels:", e);
      }
    }
    return [1]; // Level 1 is always unlocked
  }

  saveUnlockedLevels() {
    localStorage.setItem(
      "doxiny-unlocked-levels",
      JSON.stringify(this.unlockedLevels),
    );
  }

  getGameMode() {
    return this.currentMode;
  }

  setGameMode(mode) {
    if (mode === this.modes.NORMAL || mode === this.modes.FREEPLAY) {
      this.currentMode = mode;
      this.saveGameMode();
      return true;
    }
    return false;
  }

  isLevelUnlocked(level) {
    // In Free Play mode, all levels are unlocked
    if (this.isFreePlay()) {
      return true;
    }
    // In Normal mode, check unlocked levels
    return this.unlockedLevels.includes(level);
  }

  unlockLevel(level) {
    if (!this.unlockedLevels.includes(level)) {
      this.unlockedLevels.push(level);
      this.unlockedLevels.sort((a, b) => a - b);
      this.saveUnlockedLevels();
      return true; // Level was newly unlocked
    }
    return false; // Level was already unlocked
  }

  getUnlockedLevels() {
    return [...this.unlockedLevels];
  }

  getHighestUnlockedLevel() {
    return Math.max(...this.unlockedLevels);
  }

  getEfficiencyRequirement(level) {
    // 80% for all levels
    return 0.8;
  }

  resetProgression() {
    this.unlockedLevels = [1];
    this.saveUnlockedLevels();
    // Also reset master status
    localStorage.removeItem("doxiny-master-status");
    localStorage.removeItem("doxiny-completion-count");
  }

  // === MASTERY SYSTEM ===

  isMaster() {
    const masterStatus = localStorage.getItem("doxiny-master-status");
    return masterStatus === "true";
  }

  setMasterStatus(isMaster) {
    localStorage.setItem("doxiny-master-status", isMaster.toString());
  }

  getCompletionCount() {
    const count = localStorage.getItem("doxiny-completion-count");
    return count ? parseInt(count, 10) : 0;
  }

  incrementCompletionCount() {
    const currentCount = this.getCompletionCount();
    localStorage.setItem(
      "doxiny-completion-count",
      (currentCount + 1).toString(),
    );
  }

  getCompletionDisplay() {
    const count = this.getCompletionCount();
    if (count <= 1) return "";
    if (count <= 9) return count.toString();
    return "∞";
  }

  isAllLevelsCompleted() {
    // Check if player has unlocked all 6 levels (meaning they completed level 5 successfully)
    const maxLevel = 6;
    return (
      this.unlockedLevels.length >= maxLevel &&
      this.unlockedLevels.includes(maxLevel)
    );
  }

  checkAndAwardMasterStatus() {
    if (this.isAllLevelsCompleted()) {
      const alreadyMaster = this.isMaster();

      this.setMasterStatus(true);
      // Increment completion counter
      this.incrementCompletionCount();

      // Reset levels back to level 1 for next playthrough
      this.unlockedLevels = [1];
      this.saveUnlockedLevels();

      return !alreadyMaster; // Return true if master status was newly awarded
    }
    return false; // Already was master or hasn't completed all levels
  }
}

// Dynamic game manager with exercise generation
class GameManager {
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

  onExerciseComplete(moves) {
    const optimal = this.currentExercise.optimalMoves;
    const efficiency = optimal / moves;
    const isPerfect = moves <= optimal;

    // Handle Normal Game mode progression
    let levelUnlocked = null;
    let masterAchieved = false;
    if (this.gameModeManager.isNormal()) {
      const requiredEfficiency = this.gameModeManager.getEfficiencyRequirement(this.currentDifficulty);
      if (efficiency >= requiredEfficiency) {
        // Check for unlocking next level (if not at max level)
        if (this.currentDifficulty < 6) {
          const nextLevel = this.currentDifficulty + 1;
          if (this.gameModeManager.unlockLevel(nextLevel)) {
            levelUnlocked = nextLevel;
            updateLevelSelectorUI();
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
        emoji: "🏆",
        description: translate("performanceDescriptions.optimalSolution"),
      };
    if (efficiency >= 0.85)
      return {
        grade: translate("performanceGrades.excellent"),
        emoji: "⭐",
        description: translate("performanceDescriptions.amazingEfficiency"),
      };
    if (efficiency >= 0.7)
      return {
        grade: translate("performanceGrades.great"),
        emoji: "👍",
        description: translate("performanceDescriptions.wellDone"),
      };
    if (efficiency >= 0.55)
      return {
        grade: translate("performanceGrades.good"),
        emoji: "😊",
        description: translate("performanceDescriptions.niceJob"),
      };
    return {
      grade: translate("performanceGrades.keepTrying"),
      emoji: "💪",
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

// Initialize game manager
const gameManager = new GameManager();
let gameState = createGameState(
  gameManager.currentExercise.goal,
  gameManager.currentDifficulty,
);

// UI state for preview visibility
let showPreviews = true;

// Dynamic move limit based on exercise difficulty
let moveLimit = 12;

/**
 * Update move limit based on current exercise optimal moves
 */
function updateMoveLimit() {
  moveLimit = Math.max(gameManager.currentExercise.optimalMoves, 12);
  console.log(
    `🎯 Move limit updated to: ${moveLimit} (optimal: ${gameManager.currentExercise.optimalMoves})`,
  );
}

// Get available difficulty levels for UI
function getAvailableLevels() {
  const baseLevels = getDifficultyLevels().slice(0, 6); // Show 6 regular levels
  
  // Only show custom level if in Free Play mode and player has mastery to create custom exercises
  if (gameManager.gameModeManager.isFreePlay() && gameManager.gameModeManager.isMaster()) {
    const customLevel = { level: "custom", nameKey: "custom" };
    return [...baseLevels, customLevel];
  }
  
  return baseLevels;
}

function isLevelLocked(level) {
  return !gameManager.gameModeManager.isLevelUnlocked(level);
}

/**
 * Render level selector navigation HTML
 */
function renderLevelSelectorUI() {
  const availableLevels = getAvailableLevels();
  
  const levelButtons = availableLevels
    .map((lvl) => {
      const isCustom = lvl.level === "custom";
      const isLocked = !isCustom && isLevelLocked(lvl.level);
      
      // For custom exercises, highlight the detected level
      const isCustomActive =
        gameManager.isCustomExercise &&
        !isCustom &&
        lvl.level === gameManager.customExerciseLevel;
      const isRegularActive =
        !gameManager.isCustomExercise &&
        !isCustom &&
        lvl.level === gameManager.currentDifficulty;
      const isActive = isCustomActive || isRegularActive;

      let buttonClass;
      if (isCustom) {
        // Custom button - purple when not active, orange when a custom exercise is loaded
        buttonClass = gameManager.isCustomExercise
          ? "bg-orange-600 border border-orange-400 text-white"
          : "bg-purple-600 border border-purple-400 text-white hover:bg-purple-500";
      } else if (isLocked) {
        // Locked levels
        buttonClass = "bg-gray-800/50 border border-gray-600/20 text-gray-500 cursor-not-allowed";
      } else {
        // Regular level buttons
        buttonClass = isActive
          ? "bg-orange-600 border border-orange-400"
          : "bg-[#2a2f3a] border border-white/10 opacity-60";
      }

      const title = isLocked ? translate('gameModeMessages.levelLocked', { efficiency: gameManager.gameModeManager.getEfficiencyRequirement(lvl.level) * 100 }) : '';

      return `<button class="${buttonClass} rounded-lg p-1 flex flex-col items-center justify-center transition-all active:scale-95 level-btn h-full" 
             data-level="${lvl.level}"
             ${isLocked ? 'disabled' : ''}
             ${title ? `title="${title}"` : ''}>
          <span class="font-bold" style="font-size: clamp(0.7rem, 2vh, 1rem); font-size: clamp(0.7rem, 2svh, 1rem);">
            ${isCustom ? "🎯" : isLocked ? "🔒" : lvl.level}
          </span>
          <span class="uppercase font-bold leading-tight${isLocked ? " hidden" : ""}" style="font-size: clamp(0.5rem, 1.2vh, 0.7rem); font-size: clamp(0.5rem, 1.2svh, 0.7rem);">
            ${isCustom ? translate("custom") || "Custom" : isLocked ? translate("blocked") : translate(`difficultyLevels.${lvl.nameKey}`)}
          </span>
        </button>`;
    })
    .join("");

  return `
    <!-- Level Selector -->
    <nav class="w-full mb-3" style="height: 6vh; height: 6svh; min-height: 2.5rem; max-height: 4rem;" data-purpose="level-selector">
      <div class="grid gap-1 h-full" style="grid-template-columns: repeat(${availableLevels.length}, 1fr);">
        ${levelButtons}
      </div>
    </nav>
  `;
}

/**
 * Update just the level selector UI without full page re-render
 */
function updateLevelSelectorUI() {
  const levelSelector = document.querySelector('[data-purpose="level-selector"]');
  if (levelSelector) {
    // Get the new HTML from renderLevelSelectorUI and extract just the inner content
    const newLevelSelectorHTML = renderLevelSelectorUI();
    
    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newLevelSelectorHTML;
    
    // Extract the nav element and replace the existing one
    const newNav = tempDiv.querySelector('nav[data-purpose="level-selector"]');
    if (newNav) {
      levelSelector.replaceWith(newNav);
      console.log('🎮 Level selector UI updated');
    }
  }
}

// === MASTERY SYSTEM UI FUNCTIONS ===

/**
 * Show master achievement celebration modal
 */
function showMasterAchievementModal() {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in";
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideMasterAchievementModal();
  });
  
  modal.innerHTML = `
    <div class="bg-gradient-to-br from-yellow-400 via-gold-500 to-yellow-600 p-6 rounded-2xl max-w-sm mx-4 text-center shadow-2xl shadow-gold-500/50 animate-bounce-in">
      <div class="text-6xl mb-4 animate-spin-once">👑</div>
      <h2 class="text-2xl font-bold text-white mb-2">${translate('masterAchievement.title')}</h2>
      <p class="text-white/90 mb-4">${translate('masterAchievement.message')}</p>
      <button id="master-achievement-continue-btn" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all w-full">
        ${translate('common.continue')}
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function hideMasterAchievementModal() {
  const modal = document.querySelector('.fixed.inset-0.bg-black\\/80');
  if (modal) modal.remove();
}



// === END MASTERY SYSTEM UI FUNCTIONS ===

/**
 * Calculate progress toward goal as percentage (0-100) using dynamic path calculation
 */
function calculateProgress(currentNumber, targetNumber) {
  const exerciseInfo = gameManager.getCurrentExerciseInfo();
  const optimalMoves = exerciseInfo.exercise.optimalMoves || 10;

  return calculateProgressToTarget(
    currentNumber,
    targetNumber,
    gameState.moves,
    optimalMoves,
  );
}

/**
 * Get progress indicator with smooth color transitions
 */
function getProgressIndicator(currentNumber, targetNumber) {
  const progress =
    currentNumber === 1 ? 0 : calculateProgress(currentNumber, targetNumber);

  // Define RGB values for smooth transitions
  let color1, color2;

  if (progress == 100) {
    color1 = "16, 185, 129"; // emerald-500
    color2 = "34, 197, 94"; // green-500
  } else if (progress >= 80) {
    color1 = "249, 115, 22"; // orange-500
    color2 = "234, 179, 8"; // yellow-500
  } else if (progress >= 60) {
    color1 = "59, 130, 246"; // blue-500
    color2 = "6, 182, 212"; // cyan-500
  } else if (progress >= 40) {
    color1 = "168, 85, 247"; // purple-500
    color2 = "59, 130, 246"; // blue-500
  } else if (progress >= 20) {
    color1 = "236, 72, 153"; // pink-500
    color2 = "168, 85, 247"; // purple-500
  } else {
    color1 = "107, 114, 128"; // gray-500
    color2 = "100, 116, 139"; // slate-500
  }

  return { progress, color1, color2 };
}

/**
 * Generate compact progress bar with smooth animations
 */
function getProgressHTML(currentNumber, targetNumber) {
  const { progress, color1, color2 } = getProgressIndicator(
    currentNumber,
    targetNumber,
  );

  return `
    <div class="relative bg-gray-800/50 rounded-full h-4 border border-white/10 overflow-hidden">
      <div id="progress-bar-fill" class="h-full rounded-full transition-all duration-700 ease-out" 
           style="
             width: ${progress}%;
             background: linear-gradient(to right, rgb(${color1}), rgb(${color2}));
           "></div>
      <div id="progress-percentage" class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs drop-shadow-lg">
        ${progress}%
      </div>
    </div>
  `;
}

/**
 * Generate preview text for what each operation will do to current number
 */
function getOperationPreviews(currentNumber) {
  const previews = {};

  // REVERSE preview
  const reversed = operations.reverse(currentNumber);
  previews.reverse = `${currentNumber} → ${reversed}`;

  // SUM preview
  const sum = operations.sum(currentNumber);
  const digits = currentNumber.toString().split("").join(" + ");
  previews.sum = `${digits} → ${sum}`;

  // APPEND 1 preview
  const appended = operations.append1(currentNumber);
  previews.append1 = `${currentNumber} → ${appended}`;

  // DOUBLE preview
  const doubled = operations.double(currentNumber);
  previews.double = `${currentNumber} × 2 → ${doubled}`;

  return previews;
}

/**
 * Get colored SVG icons for operations
 */
function getOperationIcon(operation, color = "currentColor") {
  const icons = {
    reverse: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" style="color: ${color};">
      <path fill="currentColor" d="M52 2H12C6.479 2 2 6.477 2 12v40c0 5.523 4.479 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10m5 43.666A8.33 8.33 0 0 1 48.668 54H15.334A8.334 8.334 0 0 1 7 45.666V12.334A8.334 8.334 0 0 1 15.334 4h33.334A8.33 8.33 0 0 1 57 12.334z"/>
      <!-- Top arrow -->
      <path fill="currentColor" d="M14.001 31.548c0-2.865 1.105-5.555 3.114-7.58a10.52 10.52 0 0 1 7.518-3.141h11.771v-3.828l11.598 6.752l-11.598 6.752v-3.828H24.633c-2.665 0-4.831 2.186-4.831 4.873q0 .196.014.393L14.564 35a10.8 10.8 0 0 1-.563-3.452" />
      <!-- Bottom arrow -->
      <path fill="currentColor" d="M46.885 40.024a10.54 10.54 0 0 1-7.526 3.143H27.61v3.832l-11.609-6.758l11.609-6.758v3.832h11.748c2.668 0 4.838-2.191 4.838-4.879q0-.189-.015-.371l5.265-3.066c.365 1.094.555 2.25.555 3.438c0 2.867-1.107 5.56-3.116 7.587" />
    </svg>`,
    sum: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" style="color: ${color};">
      <path fill="currentColor" d="M52 2H12C6.479 2 2 6.477 2 12v40c0 5.523 4.479 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10m5 43.666A8.33 8.33 0 0 1 48.668 54H15.334A8.334 8.334 0 0 1 7 45.666V12.334A8.334 8.334 0 0 1 15.334 4h33.334A8.33 8.33 0 0 1 57 12.334z"/>
      <text fill="currentColor" x="32" y="46" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold">Σ</text>
    </svg>`,
    append1: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" style="color: ${color};">
      <path fill="currentColor" d="M52 2H12C6.479 2 2 6.477 2 12v40c0 5.523 4.479 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10m5 43.666A8.33 8.33 0 0 1 48.668 54H15.334A8.334 8.334 0 0 1 7 45.666V12.334A8.334 8.334 0 0 1 15.334 4h33.334A8.33 8.33 0 0 1 57 12.334z"/>
      <text fill="currentColor" x="32" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="bold">+1</text>
    </svg>`,
    double: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" style="color: ${color};">
      <path fill="currentColor" d="M52 2H12C6.479 2 2 6.477 2 12v40c0 5.523 4.479 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10m5 43.666A8.33 8.33 0 0 1 48.668 54H15.334A8.334 8.334 0 0 1 7 45.666V12.334A8.334 8.334 0 0 1 15.334 4h33.334A8.33 8.33 0 0 1 57 12.334z"/>
      <text fill="currentColor" x="34" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="bold">x2</text>
    </svg>`,
    start: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" style="color: ${color};">
      <path fill="currentColor" d="M52 2H12C6.479 2 2 6.477 2 12v40c0 5.523 4.479 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10m-20 40l16-8l-16-8v16z"/>
    </svg>`,
  };

  return icons[operation] || icons.start;
}

// DOM elements
const app = document.querySelector("#app");

/**
 * Smoothly scroll to top of page
 */
function scrollToTop() {
  // Scroll to top smoothly
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

/**
 * Create the main game UI
 */
function createGameUI() {
  const exerciseInfo = gameManager.getCurrentExerciseInfo();
  const exercise = exerciseInfo.exercise;

  return `
    <!-- BEGIN: MainHeader -->
    <header class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between py-1" data-purpose="app-header">
      <div class="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
        <span class="text-base sm:text-xl" style="font-size: clamp(1rem, 2.5vh, 1.5rem); font-size: clamp(1rem, 2.5svh, 1.5rem)">🔢</span>
        <h1 class="font-bold tracking-wide uppercase" style="font-size: clamp(0.8rem, 2vh, 1.2rem); font-size: clamp(0.8rem, 2svh, 1.2rem)">Doxiny</h1>
      </div>
      
      <!-- Game Mode & Language Controls -->
      <div class="flex gap-2 justify-center sm:justify-end items-center">
        ${gameManager.gameModeManager.isMaster() ? `<span class="master-indicator text-yellow-400 font-bold relative" title="${translate('masterStatus.title')}">👑${gameManager.gameModeManager.getCompletionDisplay() ? `<span class="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center" style="font-size: 0.6rem; min-width: 1rem; min-height: 1rem;">${gameManager.gameModeManager.getCompletionDisplay()}</span>` : ''}</span>` : ''}
        <!-- Game Mode Dropdown -->
        <div class="relative">
          <button id="game-mode-dropdown-btn" class="mode-indicator ${gameManager.gameModeManager.getGameMode()} btn-mode-${gameManager.gameModeManager.getGameMode()} hover:brightness-110 border border-white/20 rounded px-2 py-1 font-semibold transition-all active:scale-95 flex items-center gap-1" 
                  style="font-size: clamp(0.6rem, 1.5vh, 0.8rem); font-size: clamp(0.6rem, 1.5svh, 0.8rem); height: clamp(1.5rem, 3vh, 2rem); height: clamp(1.5rem, 3svh, 2rem);">
            <span id="current-mode-label">${gameManager.gameModeManager.getGameMode() === 'normal' ? '🎯' : '🔓'}</span>
            <span id="current-mode-text">${translate(`gameModes.${gameManager.gameModeManager.getGameMode()}`)}</span>
            <span>▼</span>
          </button>
          <div id="game-mode-dropdown" class="hidden absolute top-full left-0 mt-1 bg-gray-800 border border-white/20 rounded shadow-lg shadow-black/50 z-50 min-w-full">
            <button class="game-mode-option w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2" data-mode="normal">
              <span>🎯</span>
              <div>
                <div class="font-semibold">${translate('gameModes.normal')}</div>
                <div class="text-xs text-gray-400">${translate('gameModeDescriptions.normal')}</div>
              </div>
            </button>
            ${gameManager.gameModeManager.isMaster() 
              ? `<button class="game-mode-option w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2" data-mode="freeplay">
                  <span>🔓</span>
                  <div>
                    <div class="font-semibold">${translate('gameModes.freeplay')}</div>
                    <div class="text-xs text-gray-400">${translate('gameModeDescriptions.freeplay')}</div>
                  </div>
                </button>`
              : `<button class="game-mode-option w-full px-3 py-2 text-left cursor-not-allowed opacity-50 flex items-center gap-2" data-mode="freeplay" disabled>
                  <span>🔒</span>
                  <div>
                    <div class="font-semibold text-gray-400">${translate('gameModes.freeplay')}</div>
                    <div class="text-xs text-gray-500">${translate('gameModeDescriptions.freeplayLocked')}</div>
                  </div>
                </button>`
            }
          </div>
        </div>
        
        <!-- Language Switcher - Compact -->
        <div class="flex gap-1">
        ${Object.values(languages)
          .map(
            (lang) => `
          <button class="language-btn ${getCurrentLanguage() === lang.code ? "bg-blue-600 border border-blue-400" : "bg-gray-600/50 border border-white/20"} 
                         rounded px-2 py-1 font-semibold transition-all active:scale-95 flex items-center gap-1"
                  style="font-size: clamp(0.6rem, 1.5vh, 0.8rem); font-size: clamp(0.6rem, 1.5svh, 0.8rem); height: clamp(1.5rem, 3vh, 2rem); height: clamp(1.5rem, 3svh, 2rem);"
                  data-lang="${lang.code}">
            <span>${lang.flag}</span>
            <span>${lang.code.toUpperCase()}</span>
          </button>
        `,
          )
          .join("")}
        </div>
      </div>
    </header>
    <!-- END: MainHeader -->
    
    ${renderLevelSelectorUI()}
    
    <!-- Goal Display with Share button on left, Moves and New Exercise on the right -->  
    <div class="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-2 border-2 border-emerald-500 flex flex-col sm:flex-row sm:justify-between gap-1" style="height: 7rem;">
      <div class="flex flex-row sm:flex-col justify-center items-center gap-1 sm:mr-2">
        <button class="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white font-bold px-2 py-1 rounded-lg transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-black-800 drop-shadow-lg" style="font-size: clamp(0.6rem, 1.4vh, 0.8rem); font-size: clamp(0.6rem, 1.4svh, 0.8rem); height: clamp(1.8rem, 4vh, 2.5rem); height: clamp(1.8rem, 4svh, 2.5rem);" id="share-puzzle-btn">
          🫶 <span>${translate("sharing.shareCurrentPuzzle")}</span>
        </button>
      </div>
      <div class="text-center flex-1">
        <div class="text-white font-semibold uppercase tracking-wide mb-1" style="font-size: clamp(0.6rem, 1.5vh, 0.8rem); font-size: clamp(0.6rem, 1.5svh, 0.8rem);">${translate("targetNumber")}</div>
        <div class="text-white font-black tracking-tight" style="font-size: clamp(1.2rem, 3vh, 1.8rem); font-size: clamp(1.2rem, 3svh, 1.8rem);">${translate("reach")} ${exercise.goal}</div>
        <div class="text-emerald-200 mt-1 hidden sm:block" style="font-size: clamp(0.6rem, 1.2vh, 0.7rem); font-size: clamp(0.6rem, 1.2svh, 0.7rem);">${translate("transformInto")} ${exercise.goal}</div>
      </div>
      <div class="flex flex-row sm:flex-col justify-between sm:justify-center gap-2 sm:gap-1 sm:ml-3">
        <div class="text-center">
          <div class="text-emerald-200 uppercase tracking-wide font-semibold" style="font-size: clamp(0.6rem, 1.3vh, 0.8rem); font-size: clamp(0.6rem, 1.3svh, 0.8rem);">${translate("moves")}</div>
          <div id="moves-count" class="text-white font-bold" style="font-size: clamp(0.9rem, 2.2vh, 1.3rem); font-size: clamp(0.9rem, 2.2svh, 1.3rem);">${gameState.moves}/${exercise.optimalMoves === Infinity ? "∞" : exercise.optimalMoves}</div>
        </div>
        <button class="bg-purple-800/80 hover:bg-purple-700/80 text-white font-bold px-2 py-1 rounded-lg transition-all active:scale-95 whitespace-nowrap" style="font-size: clamp(0.6rem, 1.4vh, 0.8rem); font-size: clamp(0.6rem, 1.4svh, 0.8rem); height: clamp(1.8rem, 4vh, 2.5rem); height: clamp(1.8rem, 4svh, 2.5rem);" id="new-exercise-btn">
          🎲 <span>${translate("gameStates.newGame")}</span>
        </button>
      </div>
    </div>
    
    <!-- Progress Indicator -->
    <div class="w-full p-1" id="progress-container">
      <div class="relative bg-gray-800/50 rounded-full h-4 border border-white/10 overflow-hidden">
        <div id="progress-bar-fill" class="h-full rounded-full transition-all duration-700 ease-out" 
             style="width: 0%; background: linear-gradient(to right, rgb(107, 114, 128), rgb(100, 116, 139));"></div>
        <div id="progress-percentage" class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs drop-shadow-lg">
          0%
        </div>
      </div>
    </div>
    
    <!-- BEGIN: GameBoard -->
    <main class="w-full flex-1 flex flex-col" style="height: 70vh; height: 70svh; gap: 1vh; gap: 1svh;">
      <!-- Central Number Display -->
      <section class="rounded-xl flex justify-center items-center" style="height: 18vh; height: 18svh; min-height: 4rem;" id="number-display" data-purpose="number-display">
        <span class="font-black text-white tracking-tighter current-number" id="current-number" style="font-size: clamp(2.5rem, 8vh, 5rem); font-size: clamp(2.5rem, 8svh, 5rem);">${gameState.current}</span>
      </section>
      
      <!-- Inline History -->
      <section class="flex-shrink-0" style="min-height: 3rem;" data-purpose="inline-history">
        <div class="bg-[#1a1a1a] rounded-lg p-2 border border-white/10 transition-all duration-300 h-full" id="history-container">
          <div class="flex items-center justify-between mb-1">
            <h4 class="text-white/70 uppercase tracking-wide font-semibold" style="font-size: clamp(0.6rem, 1.4vh, 0.8rem); font-size: clamp(0.6rem, 1.4svh, 0.8rem);">${translate("history")}</h4>
          </div>
          <div class="flex overflow-x-scroll gap-1 items-start transition-all duration-300 pb-1 h-4/5" id="inline-history-content">
            ${renderInlineHistory()}
          </div>
        </div>
      </section>
      
      <!-- Operation Buttons Grid -->
      <section class="grid grid-cols-2 gap-2 flex-2" data-purpose="game-controls">
        ${["reverse", "sumDigits", "append1", "double"]
          .map((op) => {
            const previews = getOperationPreviews(gameState.current);
            const isBlocked = gameState.moves >= moveLimit;
            const buttonClass = isBlocked
              ? "bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-500/50 shadow-inner"
              : "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 text-white transition-all duration-200 active:scale-95 border border-red-400/50 hover:border-red-300/70 shadow-lg hover:shadow-red-500/30 hover:shadow-xl relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:rounded-xl before:pointer-events-none";
            const previewText = isBlocked
              ? translate("blocked")
              : previews[op === "sumDigits" ? "sum" : op];
            const iconColor = isBlocked ? "#9ca3af" : "#ffffff";
            const operationKey = op === "sumDigits" ? "sum" : op;
            const translatedLabel = translate(`operations.${op}`);
            return `<button class="${buttonClass} font-black rounded-xl shadow-lg uppercase tracking-wide operation-btn flex flex-col items-center justify-center gap-1 h-full" data-operation="${operationKey}" aria-label="${translatedLabel} operation" ${isBlocked ? "disabled" : ""} style="height: 13vh; height: 13svh; max-height: 7rem; font-size: clamp(0.6rem, 1.8vh, 0.9rem); font-size: clamp(0.6rem, 1.8svh, 0.9rem);">
            <div class="flex items-center gap-1">
              ${getOperationIcon(operationKey, iconColor)}
              <span>${translatedLabel}</span>
            </div>
            <span class="font-normal lowercase tracking-normal opacity-75 preview-text truncate w-full ${showPreviews ? "" : "display-none"}" data-operation="${operationKey}" style="font-size: clamp(0.5rem, 1.4vh, 0.7rem); font-size: clamp(0.5rem, 1.4svh, 0.7rem);">${previewText}</span>
          </button>`;
          })
          .join("")}
      </section>
      
      <!-- Utility Row -->
      <section class="grid grid-cols-4 gap-2 flex-1 flex-shrink-0" style="max-height: 8vh; max-height: 8svh;" data-purpose="utility-controls">
        <button class="bg-[#374151] border border-white/10 rounded-xl flex items-center justify-center gap-1 font-bold transition-all active:scale-95 reset-btn h-full ${gameState.moves >= moveLimit ? "ring-2 ring-yellow-400 ring-opacity-75 animate-pulse bg-yellow-500/20 border-yellow-400" : ""}" id="reset-btn" style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
          ${translate("gameStates.reset")}
        </button>
        <button class="bg-[#374151] border border-white/10 rounded-xl flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 info-btn h-full" id="info-btn" style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
          <span>ℹ️</span> <span>${translate("help")}</span>
        </button>
        <button class="bg-[#6b46c1] border border-white/10 rounded-xl flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full ${showPreviews ? "bg-purple-600" : "bg-gray-600"}" id="preview-toggle-btn" style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
          <span class="p-1">${showPreviews ? "👁️" : "🙈"}</span> <span>${translate("preview")}</span>
        </button>
        <button class="${gameState.hints.used >= gameState.hints.maxHints ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500"} border border-white/10 rounded-xl flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full" id="hint-btn" ${gameState.hints.used >= gameState.hints.maxHints ? "disabled" : ""} style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
          <span>💡</span> <span>${translate("hint")} (${gameState.hints.used}/${gameState.hints.maxHints})</span>
        </button>
      </section>
    </main>
    <!-- END: GameBoard -->
    
    <!-- Info Modal -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm info-modal hidden p-4" id="info-modal">
      <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] border-3 border-[#4a5568] rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center shadow-2xl max-h-[90vh] max-h-[90svh] overflow-y-auto">
        <h3 class="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">ℹ️ ${translate("howToPlay")}</h3>
        <div class="text-white/95 text-sm text-left leading-relaxed mb-4 sm:mb-6" id="info-content">
          <div class="mb-3 sm:mb-4">
            <div class="text-center mb-2 sm:mb-3">
              <span class="text-base sm:text-lg font-bold text-blue-300">${translate("operations.sumDigits").split(" ")[1]}:</span>
            </div>
            <div class="space-y-1 sm:space-y-2">
              <div>• <span class="font-bold text-yellow-300">${translate("operations.reverse")}:</span> ${translate("operationDescriptions.reverse")}</div>
              <div>• <span class="font-bold text-yellow-300">${translate("operations.sumDigits")}:</span> ${translate("operationDescriptions.sumDigits")}</div>
              <div>• <span class="font-bold text-yellow-300">${translate("operations.append1")}:</span> ${translate("operationDescriptions.append1")}</div>
              <div>• <span class="font-bold text-yellow-300">${translate("operations.double")}:</span> ${translate("operationDescriptions.double")}</div>
            </div>
          </div>
          <div class="mb-3 sm:mb-4 text-center">
            <p class="text-white/80 text-sm">${translate("instructions")}</p>
          </div>
          <div class="mb-3 sm:mb-4">
            <div class="text-center mb-2">
              <span class="text-base sm:text-lg font-bold text-blue-300">${translate("keyboardShortcuts").split(":")[0]}:</span>
            </div>
            <div class="text-center text-xs sm:text-sm">
              <span class="bg-gray-700 px-1 sm:px-2 py-1 rounded mx-1">1-4</span> ${translate("operations.sumDigits").split(" ")[1]} • <span class="bg-gray-700 px-1 sm:px-2 py-1 rounded mx-1">R</span> ${translate("gameStates.reset").replace("↻ ", "")} • <span class="bg-gray-700 px-1 sm:px-2 py-1 rounded mx-1">N</span> ${translate("gameStates.newGame")}
            </div>
          </div>
          <div class="text-center text-emerald-300 font-semibold text-sm" id="difficulty-tip"></div>
        </div>
        <button class="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold uppercase tracking-wide transition-all transform hover:-translate-y-1 text-sm" id="close-info-btn">${translate("close")}</button>
      </div>
    </div>
    
    <!-- Success Modal -->
    <div class="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm success-modal hidden z-40 p-2" id="success-modal">
      <div class="bg-gradient-to-br from-[#2d3748] to-[#1a1a1a] border-t-4 border-emerald-500 rounded-t-2xl p-3 sm:p-4 max-w-sm mx-auto text-center shadow-2xl shadow-emerald-500/30">
        <div class="flex items-center justify-center gap-2 sm:gap-3 mb-2">
          <div class="text-3xl sm:text-4xl celebration-emoji" id="celebration-emoji">🎉</div>
          <h2 class="text-xl sm:text-2xl font-bold text-emerald-400 drop-shadow-lg" id="success-title">${translate("levelComplete")}</h2>
        </div>
        <p class="text-white/90 text-base sm:text-lg mb-2" id="success-message">${translate("congratulations")}</p>
        <div class="flex gap-4 sm:gap-6 justify-center mb-2">
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-xs uppercase tracking-wide font-semibold">${translate("moves")}</span>
            <span class="text-emerald-400 text-lg sm:text-xl font-bold drop-shadow-lg" id="final-moves">0</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-xs uppercase tracking-wide font-semibold">${translate("targetNumber")}</span>
            <span class="text-emerald-400 text-lg sm:text-xl font-bold drop-shadow-lg" id="final-optimal">0</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-xs uppercase tracking-wide font-semibold">${translate("efficiency")}</span>
            <span class="text-yellow-400 text-lg sm:text-xl font-bold drop-shadow-lg" id="final-efficiency">100%</span>
          </div>
        </div>
        
        ${gameManager.gameModeManager.isNormal() ? `
        <div id="difficulty-change-message" class="text-center text-yellow-300 text-sm mb-2 hidden">
          📈 <span id="difficulty-change-text"></span>
        </div>
        ` : ''}
        <!-- Action buttons row -->
        <div class="flex flex-col gap-3 justify-center">
          <!-- Main action buttons -->
          <div class="flex gap-2 justify-between">
            <button class="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-4 py-2 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/30 retry-exercise-btn" id="retry-exercise-btn">${translate("retry")}</button>
            ${gameManager.gameModeManager.isNormal() ? 
              (!gameManager.getNextLevelInfo().isAvailable ? 
                `<button class="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold px-4 py-2 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-teal-500/30" id="try-freeplay-btn">${translate("gameModeMessages.tryFreePlay")}</button>` :
                `<button class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-4 py-2 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30 text-nowrap" id="next-exercise-btn">${translate("nextLevel")}</button>`
              ) : 
              `<button class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-4 py-2 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/30" id="try-normal-btn">${translate("gameModeMessages.tryNormalMode")}</button>`
            }
          </div>
          <!-- Share buttons row -->
          <div class="flex gap-2 justify-around">
            <button class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-3 py-2 rounded-lg text-xs uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/30" id="share-challenge-btn">${translate("sharing.shareChallenge")}</button>
            <button class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-3 py-2 rounded-lg text-xs uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-orange-500/30" id="share-victory-btn">${translate("sharing.shareVictory")}</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Hint Display Area (Non-modal) -->
    <div class="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4 hint-display hidden" id="hint-display">
      <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] border-2 border-amber-400/50 rounded-xl p-4 shadow-xl backdrop-blur-sm">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg" id="hint-icon-display">💡</span>
          <span class="font-bold text-amber-300 text-sm" id="hint-level-display">Hint #1</span>
          <button class="ml-auto text-white/60 hover:text-white text-lg" id="close-hint-display">×</button>
        </div>
        <p class="text-white/90 text-sm leading-relaxed" id="hint-message-display">...</p>
        <div class="text-center text-amber-300/70 text-xs mt-2" id="hint-remaining-display">
          ...
        </div>
      </div>
    </div>
  `;
}

/**
 * Render inline history with colored SVG icons
 */
function renderInlineHistory() {
  if (gameState.history.length === 0) {
    return `<div class="text-white/50 text-xs">${translate("noMovesYet")}</div>`;
  }

  return gameState.history
    .map((entry, index) => {
      const operationKey = entry.action.toLowerCase().replace(" ", "");
      const operationMap = {
        reverse: "reverse",
        sum: "sum",
        sumdigits: "sum",
        append1: "append1",
        double: "double",
      };
      const op =
        operationMap[operationKey] || operationMap[entry.action.toLowerCase()];
      const color = index === 0 ? "#2563EB" : "#10b981"; // emerald-500

      return `<div class="flex items-center gap-1 bg-[${color}10] border border-[${color}20] rounded-lg px-2 py-1" title="${entry.action}: ${gameState.history[index].value} → ${entry.value}">
        ${getOperationIcon(op, color)}
        <span class="text-[${color}] text-xs font-bold">${entry.value}</span>
      </div>`;
    })
    .join("");
}

/**
 * Update the game display
 */
function updateDisplay() {
  // Update current number with animation and dynamic scaling
  const currentEl = document.getElementById("current-number");
  if (currentEl) {
    const newValue = gameState.current.toString();
    const previousValue = currentEl.textContent;
    const hasChanged = newValue !== previousValue;

    currentEl.textContent = gameState.current;

    // Apply dynamic scaling based on digit count
    const digitCount = gameState.current.toString().length;
    let scale = 1; // Default scale

    if (digitCount >= 7 && digitCount < 9) {
      scale = 0.7;
    } else if (digitCount >= 9) {
      scale = 0.5;
    }

    currentEl.style.transform = `scale(${scale})`;

    // Only animate if the number actually changed
    if (hasChanged) {
      currentEl.classList.add("updated");
      setTimeout(() => currentEl.classList.remove("updated"), 300);
    }
  }

  // Update moves counter with dynamic color
  const movesEl = document.getElementById("moves-count");
  if (movesEl) {
    // Apply color based on performance vs optimal
    const optimalMoves = gameManager.currentExercise.optimalMoves;
    movesEl.textContent =
      gameState.moves + "/" + (optimalMoves === Infinity ? "∞" : optimalMoves);

    // Remove existing color classes
    movesEl.className = movesEl.className.replace(
      /text-(green|orange|red)-\d+/g,
      "",
    );

    if (gameState.moves < optimalMoves) {
      movesEl.classList.add("text-green-400");
    } else if (gameState.moves === optimalMoves) {
      movesEl.classList.add("text-orange-400");
    } else {
      movesEl.classList.add("text-red-400");
    }
  }

  // Update progress indicator
  const progressContainer = document.getElementById("progress-container");
  if (progressContainer) {
    const exerciseInfo = gameManager.getCurrentExerciseInfo();
    const progressBarFill = document.getElementById("progress-bar-fill");
    const progressPercentage = document.getElementById("progress-percentage");

    if (progressBarFill && progressPercentage) {
      // Update existing elements for smooth transitions
      const { progress, color1, color2 } = getProgressIndicator(
        gameState.current,
        exerciseInfo.exercise.goal,
      );

      progressBarFill.style.width = `${progress}%`;
      progressBarFill.style.background = `linear-gradient(to right, rgb(${color1}), rgb(${color2}))`;
      progressPercentage.textContent = `${progress}%`;
    } else {
      // Fallback: recreate if elements don't exist
      progressContainer.innerHTML = getProgressHTML(
        gameState.current,
        exerciseInfo.exercise.goal,
      );
    }
  }

  // Update operation preview text and button states
  const previews = getOperationPreviews(gameState.current);
  const isBlocked = gameState.moves >= moveLimit;

  document.querySelectorAll(".operation-btn").forEach((btn) => {
    const operation = btn.dataset.operation;
    const previewEl = btn.querySelector(".preview-text");

    // Update preview text and visibility
    if (previewEl) {
      previewEl.textContent = isBlocked
        ? translate("blocked")
        : previews[operation];
      if (showPreviews) {
        previewEl.classList.remove("invisible");
      } else {
        previewEl.classList.add("invisible");
      }

      if (previewEl.scrollWidth > previewEl.clientWidth) {
        // If text is too long, truncate and add ellipsis
        previewEl.textContent = "..." + previewEl.textContent.slice(20);
      }
    }

    // Update button styling
    if (isBlocked) {
      // Remove active button classes
      btn.classList.remove(
        "bg-[#ef4444]",
        "hover:bg-[#dc2626]",
        "transition-transform",
        "active:scale-95",
        "text-white",
      );
      // Add blocked button classes
      btn.classList.add("bg-gray-600", "text-gray-400", "cursor-not-allowed");
      btn.disabled = true;
    } else {
      // Remove blocked button classes
      btn.classList.remove(
        "bg-gray-600",
        "text-gray-400",
        "cursor-not-allowed",
      );
      // Add active button classes
      btn.classList.add(
        "bg-[#ef4444]",
        "hover:bg-[#dc2626]",
        "transition-transform",
        "active:scale-95",
        "text-white",
      );
      btn.disabled = false;
    }
  });

  // Update reset button glow
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    if (isBlocked) {
      resetBtn.classList.add(
        "ring-4",
        "ring-yellow-400",
        "ring-opacity-75",
        "animate-pulse",
        "bg-yellow-500/20",
        "border-yellow-400",
      );
    } else {
      resetBtn.classList.remove(
        "ring-4",
        "ring-yellow-400",
        "ring-opacity-75",
        "animate-pulse",
        "bg-yellow-500/20",
        "border-yellow-400",
      );
    }
  }

  // Update hint button text and state
  const hintBtn = document.getElementById("hint-btn");
  if (hintBtn) {
    const hintText = hintBtn.querySelector("span:last-child");
    if (hintText) {
      hintText.textContent = `${translate("hint")} (${gameState.hints.used}/${gameState.hints.maxHints})`;
    }

    // Update button styling based on hints remaining
    if (gameState.hints.used >= gameState.hints.maxHints) {
      hintBtn.className =
        "bg-gray-600 text-gray-400 cursor-not-allowed border border-white/10 rounded-xl flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full";
      hintBtn.disabled = true;
    } else {
      hintBtn.className =
        "bg-amber-600 hover:bg-amber-500 border border-white/10 rounded-xl flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full";
      hintBtn.disabled = false;
    }
  }

  // Update inline history
  const inlineHistoryContent = document.getElementById(
    "inline-history-content",
  );
  if (inlineHistoryContent) {
    inlineHistoryContent.innerHTML = renderInlineHistory();
    inlineHistoryContent.classList.remove("flex-wrap"); // Reset flex-wrap on update
  }

  // Check for win condition
  if (gameState.isComplete) {
    showSuccessModal();
  }
}

/**
 * Show success modal with enhanced celebration and exercise completion tracking
 */
function showSuccessModal() {
  const modal = document.getElementById("success-modal");
  const finalMoves = document.getElementById("final-moves");
  const finalOptimal = document.getElementById("final-optimal");
  const finalEfficiency = document.getElementById("final-efficiency");
  const title = document.getElementById("success-title");
  const message = document.getElementById("success-message");
  const emoji = document.getElementById("celebration-emoji");
  const difficultyChangeMessage = document.getElementById(
    "difficulty-change-message",
  );
  const difficultyChangeText = document.getElementById(
    "difficulty-change-text",
  );

  if (modal && finalMoves) {
    // Process exercise completion with game manager
    const completionResult = gameManager.onExerciseComplete(gameState.moves);
    const exercise = gameManager.currentExercise;
    const actualEfficiency = completionResult.efficiency;
    const efficiency = Math.round(actualEfficiency * 100);
    const requiredEfficiency = gameManager.gameModeManager.getEfficiencyRequirement(gameManager.currentDifficulty);

    // Update modal content
    finalMoves.textContent = gameState.moves;
    finalOptimal.textContent = exercise.optimalMoves;
    finalEfficiency.textContent = `${efficiency}%`;

    // Set grade-based content
    const gradeData = completionResult.grade;
    title.textContent = `${gradeData.grade} ${gradeData.emoji}`;
    message.textContent = gradeData.description;
    emoji.textContent = gradeData.emoji;

    // Handle level unlock notification
    if (completionResult.levelUnlocked) {
      setTimeout(() => {
        showLevelUnlockNotification(completionResult.levelUnlocked);
      }, 1000); // Show after success modal appears
    }

    // Handle master achievement celebration
    if (completionResult.masterAchieved) {
      setTimeout(() => {
        showMasterAchievementModal();
      }, 2000); // Show after level unlock notification
    }

    const efficiencyNotMetMessage = t("gameModeMessages.efficiencyNotMet", {
      required: Math.round(requiredEfficiency * 100)
    });

    // Check for level progression
    if (difficultyChangeMessage && difficultyChangeText) {
      const levelChange = completionResult.levelChange;
      if (levelChange.isAvailable) {
        let levelText = t("levelProgression.advancedToLevel", { level: levelChange.nextDifficulty });
        if (actualEfficiency < requiredEfficiency) {
          levelText = efficiencyNotMetMessage;
        }

        difficultyChangeText.textContent = levelText;
        difficultyChangeMessage.classList.remove("hidden");
      } else if (gameManager.currentDifficulty === 6) {
        difficultyChangeText.textContent = translate(
          "levelProgression.masteredAllLevels",
        );
        difficultyChangeMessage.classList.remove("hidden");
      } else {
        difficultyChangeMessage.classList.add("hidden");
      }
    }

    modal.classList.remove("hidden");

    // Handle Next Exercise button state in Normal mode
    const nextExerciseBtn = document.getElementById("next-exercise-btn");
    if (nextExerciseBtn && gameManager.gameModeManager.isNormal()) {
      if (actualEfficiency < requiredEfficiency) {
        // Disable button and change appearance
        nextExerciseBtn.disabled = true;
        nextExerciseBtn.classList.remove(
          "bg-gradient-to-r", "from-purple-600", "to-purple-700",
          "hover:from-purple-700", "hover:to-purple-800",
          "transform", "hover:-translate-y-1", "shadow-lg", "hover:shadow-purple-500/30"
        );
        nextExerciseBtn.classList.add(
          "bg-gray-500", "cursor-not-allowed", "opacity-50"
        );
        nextExerciseBtn.title = efficiencyNotMetMessage;
      } else {
        // Ensure button is enabled (in case it was previously disabled)
        nextExerciseBtn.disabled = false;
        nextExerciseBtn.classList.remove("bg-gray-500", "cursor-not-allowed", "opacity-50");
        nextExerciseBtn.classList.add(
          "bg-gradient-to-r", "from-purple-600", "to-purple-700",
          "hover:from-purple-700", "hover:to-purple-800",
          "transform", "hover:-translate-y-1", "shadow-lg", "hover:shadow-purple-500/30"
        );
        nextExerciseBtn.title = "";
      }
    }

    // Auto-expand and glow history when success modal appears
    const historyContainer = document.getElementById("history-container");
    if (historyContainer) {
      // Add glow effect
      historyContainer.classList.add(
        "ring-4",
        "ring-emerald-400",
        "ring-opacity-75",
        "shadow-lg",
        "shadow-emerald-400/30",
      );

      // Remove glow after 3 seconds
      setTimeout(() => {
        historyContainer.classList.remove(
          "ring-4",
          "ring-emerald-400",
          "ring-opacity-75",
          "shadow-lg",
          "shadow-emerald-400/30",
        );
      }, 3000);
    }

    const inlineHistoryContent = document.getElementById(
      "inline-history-content",
    );
    if (inlineHistoryContent) {
      inlineHistoryContent.classList.add("flex-wrap");
    }

    // Enhanced celebration effects based on performance
    if (completionResult.isPerfect && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]); // Perfect solution vibration
    } else if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]); // Standard completion vibration
    }

    // Add rainbow animation to current number
    const currentNumberEl = document.getElementById("current-number");
    if (currentNumberEl) {
      currentNumberEl.classList.add("rainbow-celebrate");
    }

    // Animate celebration emoji
    setTimeout(() => {
      emoji.style.animation = completionResult.isPerfect
        ? "bounce 1s ease-in-out infinite"
        : "pulse 2s ease-in-out infinite";
    }, 100);

    // Create confetti explosion
    createConfettiExplosion();
    
    // Reduce number display height when success modal is shown
    const numberDisplay = document.getElementById("number-display");
    if (numberDisplay) {
      numberDisplay.classList.add("number-display-compact");
      numberDisplay.classList.remove("number-display-normal");
    }
  }
}

/**
 * Create spectacular confetti explosion
 */
function createConfettiExplosion() {
  const colors = [
    "#ff0000",
    "#ff7700",
    "#ffff00",
    "#00ff00",
    "#0099ff",
    "#6633ff",
    "#ff00ff",
    "#ff1493",
    "#00ced1",
  ];
  const shapes = ["square", "circle", "triangle", "star", "heart"];
  const confettiCount = 100;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    confetti.className = `confetti confetti-${shape}`;

    // Random position across screen width
    confetti.style.left = Math.random() * 100 + "%";

    // Random delay for staggered effect
    confetti.style.animationDelay = Math.random() * 0.5 + "s";

    // Random duration for varied fall speed
    confetti.style.animationDuration = Math.random() * 2 + 2 + "s";

    // Random color for non-shaped confetti
    if (shape === "square" || shape === "circle") {
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
    }

    // Random size variation
    const size = Math.random() * 6 + 8;
    confetti.style.width = size + "px";
    confetti.style.height = size + "px";

    document.body.appendChild(confetti);

    // Remove confetti after animation completes
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 4000);
  }
}

/**
 * Clean up success celebration animations
 */
function cleanupSuccessAnimations() {
  // Remove rainbow animation from current number
  const currentNumberEl = document.getElementById("current-number");
  if (
    currentNumberEl &&
    currentNumberEl.classList.contains("rainbow-celebrate")
  ) {
    currentNumberEl.classList.remove("rainbow-celebrate");
  }

  // Clean up any remaining confetti
  const remainingConfetti = document.querySelectorAll(".confetti");
  remainingConfetti.forEach((confetti) => {
    if (confetti.parentNode) {
      confetti.parentNode.removeChild(confetti);
    }
  });

  // Reset celebration emoji animation
  const emoji = document.getElementById("celebration-emoji");
  if (emoji) {
    emoji.style.animation = "";
  }
  
  // Restore number display height when success modal is hidden
  const numberDisplay = document.getElementById("number-display");
  if (numberDisplay) {
    numberDisplay.classList.add("number-display-normal");
    numberDisplay.classList.remove("number-display-compact");
  }
}

/**
 * Create auto-solve function for debugging purposes
 * Returns a function that solves the current exercise step by step with delays
 */
function createAutoSolveFunction() {
  return async function(delayMs = 1000, solutionPath = null) {
    // Use provided solution path or get from current exercise
    const path = solutionPath || gameManager.currentExercise?.solutionPath;
    
    if (!path || path.length === 0) {
      console.warn("❌ No solution path available. Generate a new exercise first.");
      return false;
    }

    console.log(`🤖 Auto-solving exercise: 1 → ${gameManager.currentExercise.goal}`);
    console.log(`📋 Solution has ${path.length} steps with ${delayMs}ms delay between steps`);
    
    let stepCount = 0;
    
    for (const step of path) {
      stepCount++;
      
      // Check if game is already complete
      if (gameState.isComplete) {
        console.log("🎉 Exercise completed!");
        break;
      }
      
      // Log the step being executed
      console.log(`🔄 Step ${stepCount}/${path.length}: ${step.operation.toUpperCase()} (${step.from} → ${step.to})`);
      
      // Simulate button click
      try {
        handleOperationClick(step.operation);
      } catch (error) {
        console.error(`❌ Error executing step ${stepCount}:`, error);
        return false;
      }
      
      // Wait for the specified delay before next step (unless it's the last step)
      if (stepCount < path.length && !gameState.isComplete) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.log(`${gameState.isComplete ? '🎉' : '⚠️'} Auto-solve completed. Final result: ${gameState.current}`);
    return gameState.isComplete;
  };
}

/**
 * Handle operation button clicks
 */
function handleOperationClick(operation) {
  // Clear any hint effects when user takes action
  clearHintEffects();

  if (!gameState.isComplete && gameState.moves < moveLimit) {
    try {
      // Calculate what the result would be
      const resultValue = operations[operation](gameState.current);

      // Only apply the move if the result is different from current value
      if (resultValue !== gameState.current) {
        gameState = applyMove(gameState, operation);
      }
      // Always update display to show user that operation was attempted
      updateDisplay();
    } catch (error) {
      console.error("Error applying operation:", error);
    }
  }
}

/**
 * Load game with specified goal and difficulty
 */
function loadGame(goal, difficulty) {
  clearHintEffects();
  cleanupSuccessAnimations();
  gameState = resetGame(goal, difficulty);
  updateDisplay();
  scrollToTop();
}

/**
 * Handle reset button click
 */
function handleReset() {
  loadGame(gameManager.currentExercise.goal, gameManager.currentDifficulty);
}

/**
 * Generate new exercise
 */
function handleNewExercise() {
  clearHintEffects();
  cleanupSuccessAnimations();
  gameManager.generateNewExercise();
  updateMoveLimit();
  gameState = createGameState(
    gameManager.currentExercise.goal,
    gameManager.currentDifficulty,
  );
  // Re-render UI to reset all button states
  app.innerHTML = createGameUI();
  scrollToTop();
}

/**
 * Toggle preview visibility
 */
function togglePreviews() {
  clearHintEffects();
  showPreviews = !showPreviews;

  // Re-render UI to update all button states and toggle button appearance
  app.innerHTML = createGameUI();

  // Reapply dynamic scaling and other display updates after re-render
  updateDisplay();
}

/**
 * Handle hint request from user
 */
function handleHintRequest() {
  // Check if hints are available
  if (gameState.hints.used >= gameState.hints.maxHints) {
    console.log("💡 No more hints available for this exercise");
    return;
  }

  // Generate hint based on current state
  const hints = generateHints(
    gameState.current,
    gameState.goal,
    gameState.moves,
    gameState.hints.used,
  );

  if (hints.length === 0) {
    console.log("💡 No hints available for current state");
    return;
  }

  // Get the next hint (based on how many have been used)
  const nextHint = hints[gameState.hints.used] ?? hints[hints.length - 1]; // Fallback to last hint if out of range

  // Update game state
  gameState.hints.used += 1;
  gameState.hints.hintsData.push(nextHint);

  // Show hint (modal or button blink depending on type)
  showHint(nextHint, gameState.hints.used, gameState.hints.maxHints);

  // Update UI to reflect hint usage
  updateDisplay();

  console.log(
    `💡 Hint ${gameState.hints.used}/${gameState.hints.maxHints} provided:`,
    nextHint.message,
  );
}

// Global variables for managing hint timeouts
let hintDisplayTimeout = null;
let hintBlinkTimeout = null;

/**
 * Show hint modal with hint information
 */
function showHint(hint, hintsUsed, maxHints) {
  if (hint.type === "direct") {
    // For direct hints, blink the relevant operation button
    blinkOperationButton(hint);
  } else {
    // For strategic/tactical hints, show non-modal display
    showHintDisplay(hint, hintsUsed, maxHints);
  }
}

function showHintDisplay(hint, hintsUsed, maxHints) {
  const display = document.getElementById("hint-display");
  const hintIcon = document.getElementById("hint-icon-display");
  const hintLevel = document.getElementById("hint-level-display");
  const hintMessage = document.getElementById("hint-message-display");
  const hintRemaining = document.getElementById("hint-remaining-display");

  // Set hint icon based on type
  const icons = {
    strategic: "💡",
    tactical: "🎯",
    direct: "⚡",
  };

  hintIcon.textContent = icons[hint.type] || "💡";
  const hintTypeCopy = translate(`hints.ui.types.${hint.type}`) || hint.type;
  hintLevel.textContent = `${translate("hint")} #${hintsUsed} (${hintTypeCopy})`;
  hintMessage.textContent = hint.message;

  const remaining = maxHints - hintsUsed;
  if (remaining > 0) {
    const plural = remaining === 1 ? "" : "s";
    hintRemaining.textContent = t("hints.ui.hintsRemaining", {
      count: remaining,
      plural,
    });
  } else {
    hintRemaining.textContent = t("hints.ui.finalHint");
  }

  display.classList.remove("hidden");

  // Clear any existing timeout and set new one
  if (hintDisplayTimeout) {
    clearTimeout(hintDisplayTimeout);
  }

  // Auto-hide after 8 seconds for non-direct hints
  hintDisplayTimeout = setTimeout(() => {
    display.classList.add("hidden");
    hintDisplayTimeout = null;
  }, 8000);
}

function blinkOperationButton(hint) {
  // Use the recommendedOperation field if available
  const targetOperation = hint.recommendedOperation;

  if (targetOperation) {
    const targetButton = document.querySelector(
      `[data-operation="${targetOperation}"]`,
    );
    if (targetButton) {
      targetButton.classList.add("hint-blink");

      // Clear any existing timeout and set new one
      if (hintBlinkTimeout) {
        clearTimeout(hintBlinkTimeout);
      }

      // Remove blink class after 3 seconds
      hintBlinkTimeout = setTimeout(() => {
        targetButton.classList.remove("hint-blink");
        hintBlinkTimeout = null;
      }, 3000);
    }
  }
}

/**
 * Clear all active hint effects (blinking and display)
 */
function clearHintEffects() {
  // Cancel any active timeouts
  if (hintDisplayTimeout) {
    clearTimeout(hintDisplayTimeout);
    hintDisplayTimeout = null;
  }

  if (hintBlinkTimeout) {
    clearTimeout(hintBlinkTimeout);
    hintBlinkTimeout = null;
  }

  // Remove blinking effect from operation buttons
  const blinkingButtons = document.querySelectorAll(".hint-blink");
  blinkingButtons.forEach((button) => {
    button.classList.remove("hint-blink");
  });

  // Hide hint display if visible
  const hintDisplay = document.getElementById("hint-display");
  if (hintDisplay && !hintDisplay.classList.contains("hidden")) {
    hintDisplay.classList.add("hidden");
  }
}

/**
 * Handle next exercise from success modal
 */
function handleNextExercise() {
  gameManager.moveToNextLevel();
  handleNewExercise();
}

/**
 * Handle retry exercise from success modal
 */
function handleRetryExercise() {
  handleReset();
}

/**
 * Handle "Try Free Play" button from success modal
 */
function handleTryFreePlay() {
  // Switch to Free Play mode
  handleGameModeChange(gameManager.gameModeManager.modes.FREEPLAY);
}

/**
 * Handle "Try Normal Mode" button from success modal
 */
function handleTryNormalMode() {
  // Switch to Normal mode
  handleGameModeChange(gameManager.gameModeManager.modes.NORMAL);
}

/**
 * Handle difficulty level selection
 */
function handleDifficultySelect(difficulty) {
  if (gameManager.setDifficulty(difficulty)) {
    clearHintEffects();
    cleanupSuccessAnimations();
    updateMoveLimit();
    gameState = createGameState(
      gameManager.currentExercise.goal,
      gameManager.currentDifficulty,
    );
    // Re-render UI (event listeners are already set up globally)
    app.innerHTML = createGameUI();
    scrollToTop();
  }
}

/**
 * Show info modal with game help
 */
function showInfoModal() {
  // Update difficulty tip
  const difficultyTip = document.getElementById("difficulty-tip");
  if (difficultyTip) {
    difficultyTip.textContent = translate(
      `difficultyTips.${gameManager.currentDifficulty}`,
    );
  }

  // Show modal
  document.getElementById("info-modal").classList.remove("hidden");
}

/**
 * Handle language change
 */
function handleLanguageChange(langCode) {
  if (setLanguage(langCode)) {
    cleanupSuccessAnimations();
    // Re-render the entire UI with new language
    app.innerHTML = createGameUI();
    // Set up event listeners again after re-render
    updateDisplay();
  }
}

/**
 * Show custom exercise modal
 */
function showCustomExerciseModal() {
  // Create modal HTML
  const modalHTML = `
    <div id="custom-exercise-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] border-3 border-[#4a5568] rounded-2xl shadow-2xl max-w-sm w-full text-center max-h-[90vh] max-h-[90svh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="p-4 sm:p-6">
          <h3 class="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2">
            🎯 ${translate("customExercise") || "Custom Exercise"}
          </h3>
          <button id="close-custom-modal" class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl">
            ✕
          </button>
          
          <!-- Description -->
          <div class="text-white/95 text-sm text-center leading-relaxed mb-4 sm:mb-6">
            <p class="text-white/80">${translate("customExerciseDescription") || "Enter any target number between 2-10,000. We'll show if it's solvable, but you can load any number to try!"}</p>
          </div>
          
          <!-- Input -->
          <div class="mb-4">
            <label for="custom-target" class="block text-white/95 font-semibold mb-2">
              ${translate("targetNumber") || "Target Number"}
            </label>
            <input 
              type="number" 
              id="custom-target" 
              class="w-full bg-white/10 border-2 border-white/20 focus:border-blue-300 rounded-xl px-4 py-3 text-white text-xl font-bold text-center transition-all outline-none"
              placeholder="e.g., 128"
              min="2"
              max="10000"
              inputmode="numeric"
              pattern="[0-9]*"
            />
          </div>
          
          <!-- Validation Info -->
          <div id="validation-info" class="mb-4 hidden">
            <div id="validation-content" class="p-3 rounded-lg text-sm">
              <!-- Validation info will go here -->
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3 justify-center">
            <button id="load-custom-btn" class="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold uppercase tracking-wide transition-all transform hover:-translate-y-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              ${translate("loadExercise") || "Load Exercise"}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Set up modal functionality
  setupCustomExerciseModal();
}

/**
 * Setup custom exercise modal functionality
 */
function setupCustomExerciseModal() {
  const modal = document.getElementById("custom-exercise-modal");
  const input = document.getElementById("custom-target");
  const loadBtn = document.getElementById("load-custom-btn");
  const validationInfo = document.getElementById("validation-info");
  const validationContent = document.getElementById("validation-content");

  // Close modal handlers
  const closeModal = () => {
    modal.remove();
    scrollToTop();
  };

  document
    .getElementById("close-custom-modal")
    .addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Validate on input change with debouncing
  let validationTimeout;
  input.addEventListener("input", () => {
    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
      validateInput();
    }, 500);
  });

  function validateInput() {
    const targetValue = parseInt(input.value);

    if (!targetValue || targetValue < 2 || targetValue > 10000) {
      validationInfo.classList.add("hidden");
      return;
    }

    const validation = validateExercise(targetValue);

    // Detect difficulty level for display
    const detectedLevel = detectCustomExerciseLevel(
      targetValue,
      validation.solvable ? validation.minMoves : 15,
    );
    const levelConfig = getDifficultyLevels().find(
      (d) => d.level === detectedLevel,
    );
    const levelName = levelConfig
      ? translate(`difficultyLevels.${levelConfig.nameKey}`)
      : translate("difficultyLevels.insane");

    if (validation.solvable) {
      validationContent.innerHTML = `
        <div class="text-emerald-300">
          ✅ <strong>${t("customExerciseModal.validation.solvable")}</strong><br>
          ${t("customExerciseModal.validation.optimalSolution", { moves: validation.minMoves })}<br>
          <span class="text-xs text-white/70">${t("customExerciseModal.validation.reachableFrom")}</span><br>
          <span class="text-xs text-blue-300 font-semibold">${t("customExerciseModal.validation.detectedLevel", { level: levelName })}</span>
        </div>
      `;
      validationContent.className =
        "p-3 rounded-lg text-sm bg-emerald-900/20 border border-emerald-500/30";
    } else {
      validationContent.innerHTML = `
        <div class="text-yellow-300">
          ❓ <strong>${t("customExerciseModal.validation.unknownSolvability")}</strong><br>
          ${t("customExerciseModal.validation.notReachable")}<br>
          <span class="text-xs text-white/70">${t("customExerciseModal.validation.canStillTry")}</span><br>
          <span class="text-xs text-blue-300 font-semibold">${t("customExerciseModal.validation.detectedLevel", { level: levelName })}</span>
        </div>
      `;
      validationContent.className =
        "p-3 rounded-lg text-sm bg-yellow-900/20 border border-yellow-500/30";
    }

    validationInfo.classList.remove("hidden");
  }

  // Load button
  loadBtn.addEventListener("click", () => {
    const targetValue = parseInt(input.value);

    if (!targetValue || targetValue < 2 || targetValue > 10000) {
      alert(translate("invalidNumberAlert"));
      return;
    }

    loadCustomExercise(targetValue);
    closeModal();
  });

  // Focus input
  input.focus();
}

function loadCustomExercise(targetValue) {
  // Allow loading any number, even if not solvable
  const validation = validateExercise(targetValue);

  // Create custom exercise using GameManager
  gameManager.setCustomExercise(
    targetValue,
    validation.solvable ? validation.minMoves : Infinity,
    validation.solutionPath || [],
  );

  // Reset game state with new target
  gameState = createGameState(targetValue, gameManager.currentDifficulty);

  // Update move limit
  updateMoveLimit();

  // Re-render UI
  app.innerHTML = createGameUI();
  updateDisplay();
}

// Global event handler - only set up once
let globalEventListenerSetup = false;

/**
 * Setup global event listeners (only once)
 */
function setupGlobalEventListeners() {
  if (globalEventListenerSetup) return;

  // Single global click handler using event delegation
  document.addEventListener("click", (e) => {
    if (e.target.closest(".operation-btn")) {
      const operationBtn = e.target.closest(".operation-btn");
      const operation = operationBtn.dataset.operation;
      handleOperationClick(operation);
    } else if (e.target.closest("#reset-btn")) {
      handleReset();
    } else if (e.target.closest("#new-exercise-btn")) {
      handleNewExercise();
    } else if (e.target.closest("#close-info-btn")) {
      document.getElementById("info-modal").classList.add("hidden");
      scrollToTop();
    } else if (e.target.closest("#info-btn")) {
      showInfoModal();
    } else if (e.target.closest("#next-exercise-btn")) {
      const nextBtn = document.getElementById("next-exercise-btn");
      if (nextBtn && nextBtn.disabled) {
        return; // Prevent action if button is disabled
      }
      cleanupSuccessAnimations();
      document.getElementById("success-modal").classList.add("hidden");
      scrollToTop();
      handleNextExercise();
    } else if (e.target.closest("#try-freeplay-btn")) {
      cleanupSuccessAnimations();
      document.getElementById("success-modal").classList.add("hidden");
      scrollToTop();
      handleTryFreePlay();
    } else if (e.target.closest("#try-normal-btn")) {
      cleanupSuccessAnimations();
      document.getElementById("success-modal").classList.add("hidden");
      scrollToTop();
      handleTryNormalMode();
    } else if (e.target.closest("#retry-exercise-btn")) {
      cleanupSuccessAnimations();
      document.getElementById("success-modal").classList.add("hidden");
      scrollToTop();
      handleRetryExercise();
    } else if (e.target.closest("#share-victory-btn")) {
      handleShareVictory(gameState, gameManager);
    } else if (e.target.closest("#share-challenge-btn")) {
      handleShareChallenge(gameState);
    } else if (e.target.closest("#share-puzzle-btn")) {
      handleShareChallenge(gameState);
    } else if (e.target.closest("#game-mode-dropdown-btn")) {
      toggleGameModeDropdown();
    } else if (e.target.closest(".game-mode-option")) {
      const modeBtn = e.target.closest(".game-mode-option");
      
      // Check if button is disabled
      if (modeBtn.disabled) {
        return; // Prevent action if button is disabled
      }
      
      const mode = modeBtn.dataset.mode;
      handleGameModeChange(mode);
    } else if (e.target.closest(".level-btn")) {
      const levelBtn = e.target.closest(".level-btn");
      const level = levelBtn.dataset.level;
      if (level === "custom") {
        showCustomExerciseModal();
      } else {
        handleDifficultySelect(parseInt(level));
      }
    } else if (e.target.closest(".language-btn")) {
      const langBtn = e.target.closest(".language-btn");
      const langCode = langBtn.dataset.lang;
      handleLanguageChange(langCode);
    } else if (e.target.closest("#preview-toggle-btn")) {
      togglePreviews();
    } else if (e.target.closest("#hint-btn")) {
      handleHintRequest();
    } else if (e.target.closest("#close-hint-display")) {
      document.getElementById("hint-display").classList.add("hidden");
      scrollToTop();
    } else if (e.target.closest("#master-achievement-continue-btn")) {
      hideMasterAchievementModal();
      // Refresh UI to show newly available Free Play mode
      app.innerHTML = createGameUI();
      updateDisplay();
    }

    // Close game mode dropdown if clicking outside
    if (!e.target.closest('#game-mode-dropdown-btn') && !e.target.closest('#game-mode-dropdown')) {
      const dropdown = document.getElementById('game-mode-dropdown');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
      }
    }
  });

  globalEventListenerSetup = true;
}

/**
 * Initialize the game
 */
function init() {
  // Handle service worker cleanup for existing users
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.action === "cleanup-complete") {
        console.log("🧹 Cleanup message received:", event.data.message);

        // Unregister the service worker
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.unregister().then((success) => {
              if (success) {
                console.log("✅ Service Worker unregistered successfully");
              }
            });
          }
        });
      }
    });

    // Also try to unregister any existing service worker immediately
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        console.log(
          "🧹 Found existing service worker, attempting to unregister...",
        );
        registration.unregister().then((success) => {
          if (success) {
            console.log("✅ Existing service worker unregistered successfully");
          }
        });
      }
    });
  }

  // Set up global event listeners (only once)
  setupGlobalEventListeners();

  // Apply initial game mode background
  const currentMode = gameManager.gameModeManager.getGameMode();
  applyGameModeBackground(currentMode);
  console.log(`🎨 Applied ${currentMode} mode background`);

  // Update move limit for initial exercise
  updateMoveLimit();

  // Render initial UI
  app.innerHTML = createGameUI();

  // Ensure we start at the top of the page
  scrollToTop();

  // Handle shared puzzle URLs
  const shareResult = handleSharedPuzzleURL();

  if (shareResult.processed) {
    loadCustomExercise(shareResult.goal);
    console.log("🔗 Loaded shared puzzle from URL");
  } else {
    // No shared puzzle, continue with normal initialization
    console.log("🎮 Normal game initialization");
  }

  // Expose functions for dev tools testing
  if (typeof window !== "undefined") {
    window.doxinyDev = {
      validateExercise: validateExercise,
      calculateProgress: calculateProgress,
      generateHints: generateHints,
      gameManager: gameManager,
      gameState: () => gameState,
      operations: operations,
      generateExercise: generateExercise,
      autoSolve: (delayMs = 1000) => createAutoSolveFunction()(delayMs),
    };
    
    console.log("🔧 Dev tools available: window.doxinyDev");
  }

  const exercise = gameManager.currentExercise;
  console.log(
    `🧮 Number Puzzle loaded! Difficulty: ${gameManager.currentDifficulty}, Goal: 1 → ${exercise.goal}`,
  );
  console.log(`🎯 This exercise: ${exercise.optimalMoves} moves optimal`);
}

/**
 * Toggle game mode dropdown visibility
 */
function toggleGameModeDropdown() {
  const dropdown = document.getElementById('game-mode-dropdown');
  dropdown.classList.toggle('hidden');
}

/**
 * Apply mode-specific background class to body
 */
function applyGameModeBackground(mode) {
  const body = document.body;
  
  // Remove existing mode classes
  body.classList.remove('game-mode-normal', 'game-mode-freeplay');
  
  // Add new mode class
  body.classList.add(`game-mode-${mode}`);
}

/**
 * Update mode indicator styling
 */
function updateModeIndicator(mode) {
  const modeBtn = document.getElementById('game-mode-dropdown-btn');
  const modeLabel = document.getElementById('current-mode-label');
  const modeText = document.getElementById('current-mode-text');
  
  if (modeBtn) {
    // Remove existing mode classes
    modeBtn.classList.remove('btn-mode-normal', 'btn-mode-freeplay', 'mode-indicator', 'normal', 'freeplay');
    
    // Add new mode classes
    modeBtn.classList.add('mode-indicator', mode, `btn-mode-${mode}`);
  }
  
  if (modeLabel) {
    modeLabel.textContent = mode === 'normal' ? '🎯' : '🔓';
  }
  
  if (modeText) {
    modeText.textContent = translate(`gameModes.${mode}`);
  }
}

/**
 * Handle game mode change with enhanced animations
 */
function handleGameModeChange(mode) {
  document.getElementById('game-mode-dropdown').classList.add('hidden');

  const currentMode = gameManager.gameModeManager.getGameMode();
  if (mode === currentMode) return;
  
  // Change the mode
  gameManager.gameModeManager.setGameMode(mode);
  
  // Apply new background
  applyGameModeBackground(mode);
  
  // Update mode indicator
  updateModeIndicator(mode);

  const newDifficulty = mode === 'normal' ? gameManager.gameModeManager.getHighestUnlockedLevel() : gameManager.currentDifficulty;
  console.log(`🎮 Game mode changed to ${mode}. Setting difficulty to ${newDifficulty}.`);
  
  // Slight delay to let background transition start
  setTimeout(() => {
    handleDifficultySelect(newDifficulty);
  }, 100);
}


/**
 * Show level unlock notification with celebration
 */
function showLevelUnlockNotification(level) {
  const message = t('gameModeMessages.levelUnlocked', { level });
  
  // Create special celebration notification 
  const notification = document.createElement('div');
  notification.className = 'notification fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 rounded-xl shadow-2xl z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center';
  notification.style.minWidth = '280px';
  
  notification.innerHTML = `
    <div class="text-2xl mb-2">🎉</div>
    <div class="font-bold text-lg mb-1">${message}</div>
    <div class="text-sm opacity-90">${translate(`difficultyLevels.${getDifficultyLevels()[level-1]?.nameKey}`)}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Add celebration animation
  notification.style.animation = 'celebrateBounce 0.6s ease-out';
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'scale(0.8) translate(-50%, -50%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Start the game
init();
