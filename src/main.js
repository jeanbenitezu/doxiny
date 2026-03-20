/**
 * Doxiny - Do X in Y moves
 * Mathematical puzzle game with elegant solutions
 */

import { createGameState, applyMove, resetGame } from "./game.js";
import { operations, operationLabels } from "./operations.js";
import { generateExercise, getDifficultyLevels } from "./exerciseGenerator.js";
import {
  translate,
  t,
  getCurrentLanguage,
  setLanguage,
  languages,
} from "./i18n.js";
import "./style.css";

// Dynamic game manager with exercise generation
class GameManager {
  constructor() {
    this.currentDifficulty = 1;
    this.currentExercise = null;
    this.playerStats = {
      exercisesCompleted: 0,
      totalMoves: 0,
      perfectSolutions: 0,
      recentPerformance: [], // Last 5 exercises
    };
    this.generateNewExercise();
  }

  generateNewExercise() {
    this.currentExercise = generateExercise(this.currentDifficulty);
    console.log(
      `🎯 New Exercise: 1 → ${this.currentExercise.goal} (${this.currentExercise.optimalMoves} moves optimal)`,
    );
    return this.currentExercise;
  }

  onExerciseComplete(moves) {
    const optimal = this.currentExercise.optimalMoves;
    const efficiency = optimal / moves;
    const isPerfect = moves <= optimal;

    // Update stats
    this.playerStats.exercisesCompleted++;
    this.playerStats.totalMoves += moves;
    if (isPerfect) this.playerStats.perfectSolutions++;

    // Track recent performance
    this.playerStats.recentPerformance.push({
      moves,
      optimal,
      efficiency,
      isPerfect,
    });

    // Keep only last 5 exercises
    if (this.playerStats.recentPerformance.length > 5) {
      this.playerStats.recentPerformance.shift();
    }

    // Calculate level change
    const levelChange = this.getNextLevelInfo();

    return {
      efficiency,
      isPerfect,
      grade: this.getPerformanceGrade(efficiency),
      levelChange,
    };
  }

  getNextLevelInfo() {
    const maxLevel = 6;
    if (this.currentDifficulty < maxLevel) {
      const oldDifficulty = this.currentDifficulty;
      const nextDifficulty = this.currentDifficulty + 1;

      console.log(`🎯 New level available: ${nextDifficulty}`);

      return {
        changed: true,
        oldDifficulty,
        nextDifficulty: nextDifficulty,
        direction: "increased",
      };
    }

    return { changed: false };
  }

  moveToNextLevel() {
    const levelChange = this.getNextLevelInfo();
    if (levelChange.changed) {
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
      this.currentDifficulty = newDifficulty;
      this.generateNewExercise();
      return true;
    }
    return false;
  }

  getCurrentExerciseInfo() {
    const difficultyInfo = getDifficultyLevels().find(
      (d) => d.level === this.currentDifficulty,
    );
    return {
      exercise: this.currentExercise,
      difficulty: difficultyInfo,
      stats: this.playerStats,
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
const availableLevels = getDifficultyLevels().slice(0, 6); // Show 6 levels

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
 * Register service worker for PWA functionality with update handling
 */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((registration) => {
          console.log("🔧 SW registered: ", registration);

          // Check for updates every 30 seconds
          setInterval(() => {
            registration.update();
          }, 30000);

          // Handle service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available
                showUpdateNotification();
              }
            });
          });
        })
        .catch((registrationError) => {
          console.log("❌ SW registration failed: ", registrationError);
        });
    });
  }
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
  const updateBanner = document.createElement("div");
  updateBanner.id = "update-banner";
  updateBanner.className =
    "fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 text-center z-50 shadow-lg";
  updateBanner.innerHTML = `
    <div class="flex items-center justify-between max-w-md mx-auto">
      <span>🚀 New version available!</span>
      <button id="update-btn" class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-bold hover:bg-blue-50 transition-colors">
        Update Now
      </button>
    </div>
  `;

  document.body.prepend(updateBanner);

  // Handle update button click
  document.getElementById("update-btn").addEventListener("click", () => {
    // Tell service worker to skip waiting and take control
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ action: "skipWaiting" });
      }
    });

    // Reload the page to get the new version
    window.location.reload();
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
    <header class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 pb-2" data-purpose="app-header">
      <div class="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-1 sm:mb-0">
        <span class="text-xl sm:text-2xl">🔢</span>
        <h1 class="text-sm sm:text-lg font-bold tracking-wide uppercase">Doxiny</h1>
        <div class="text-xs text-white/60 hidden xs:block">${translate("tagline")}</div>
      </div>
      
      <!-- Language Switcher - Compact -->
      <div class="flex gap-1 justify-center sm:justify-end">
        ${Object.values(languages)
          .map(
            (lang) => `
          <button class="language-btn ${getCurrentLanguage() === lang.code ? "bg-blue-600 border border-blue-400" : "bg-gray-600/50 border border-white/20"} 
                         rounded px-2 py-1 text-xs font-semibold transition-all active:scale-95 flex items-center gap-1"
                  data-lang="${lang.code}">
            <span class="text-xs">${lang.flag}</span>
            <span class="text-xs">${lang.code.toUpperCase()}</span>
          </button>
        `,
          )
          .join("")}
      </div>
    </header>
    <!-- END: MainHeader -->
    
    <!-- Level Selector -->
    <nav class="w-full mb-3" data-purpose="level-selector">
      <div class="grid grid-cols-6 gap-1">
        ${availableLevels
          .map(
            (lvl) =>
              `<button class="${lvl.level === gameManager.currentDifficulty ? "bg-orange-600 border border-orange-400" : "bg-[#2a2f3a] border border-white/10 opacity-60"} rounded-lg p-1 sm:p-2 flex flex-col items-center transition-all active:scale-95 level-btn min-h-[2.5rem] sm:min-h-[3rem]" 
                   data-level="${lvl.level}">
            <span class="text-xs sm:text-lg font-bold">${lvl.level}</span>
            <span class="text-[7px] sm:text-[9px] uppercase font-bold leading-tight">${translate(`difficultyLevels.${lvl.nameKey}`)}</span>
          </button>`,
          )
          .join("")}
      </div>
    </nav>
    
    <!-- Goal Display with Moves and New Exercise on the right -->  
    <div class="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-3 mb-3 border-2 border-emerald-500 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <div class="text-center flex-1">
        <div class="text-white text-xs sm:text-sm font-semibold uppercase tracking-wide mb-1">${translate("targetNumber")}</div>
        <div class="text-white text-2xl sm:text-3xl font-black tracking-tight">${translate("reach")} ${exercise.goal}</div>
        <div class="text-emerald-200 text-xs mt-1 hidden sm:block">${translate("transformInto")} ${exercise.goal}</div>
      </div>
      <div class="flex flex-row sm:flex-col justify-between sm:justify-center gap-2 sm:gap-1 sm:ml-3">
        <div class="text-center">
          <div class="text-emerald-200 text-xs uppercase tracking-wide font-semibold">${translate("moves")}</div>
          <div id="moves-count" class="text-white text-lg sm:text-xl font-bold">${gameState.moves}/${exercise.optimalMoves === Infinity ? "∞" : exercise.optimalMoves}</div>
        </div>
        <button class="bg-purple-800/80 hover:bg-purple-700/80 text-white text-xs font-bold px-2 sm:px-3 py-2 rounded-lg transition-all active:scale-95 whitespace-nowrap" id="new-exercise-btn">
          🎲 <span class="hidden xs:inline">${translate("gameStates.newGame").replace("🎯 ", "")}</span><span class="xs:hidden">New</span>
        </button>
      </div>
    </div>
    
    <!-- BEGIN: GameBoard -->
    <main class="w-full flex-1 flex flex-col gap-2">
      <!-- Central Number Display -->
      <section class="glass-panel rounded-2xl p-4 sm:p-6 flex justify-center items-center mb-2" data-purpose="number-display">
        <span class="text-5xl sm:text-6xl lg:text-8xl font-black text-white tracking-tighter current-number" id="current-number">${gameState.current}</span>
      </section>
      
      <!-- Inline History -->
      <section class="mb-3" data-purpose="inline-history">
        <div class="bg-[#1a1a1a] rounded-xl p-2 sm:p-3 border border-white/10 transition-all duration-300" id="history-container">
          <div class="flex items-center justify-between mb-1 sm:mb-2">
            <h4 class="text-white/70 text-xs uppercase tracking-wide font-semibold">${translate("history")}</h4>
          </div>
          <div class="flex overflow-x-scroll gap-1 sm:gap-2 items-start transition-all duration-300 pb-2 sm:pb-3" id="inline-history-content">
            ${renderInlineHistory()}
          </div>
        </div>
      </section>
      
      <!-- Operation Buttons Grid -->
      <section class="grid grid-cols-2 gap-3" data-purpose="game-controls">
        ${["reverse", "sumDigits", "append1", "double"]
          .map((op) => {
            const previews = getOperationPreviews(gameState.current);
            const isBlocked = gameState.moves >= moveLimit;
            const buttonClass = isBlocked
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#ef4444] hover:bg-[#dc2626] text-white transition-transform active:scale-95";
            const previewText = isBlocked
              ? "Blocked"
              : previews[op === "sumDigits" ? "sum" : op];
            const iconColor = isBlocked ? "#9ca3af" : "#ffffff";
            const operationKey = op === "sumDigits" ? "sum" : op;
            const translatedLabel = translate(`operations.${op}`);
            return `<button class="${buttonClass} font-black py-2 sm:py-3 px-2 rounded-xl shadow-lg uppercase tracking-wide operation-btn flex flex-col items-center gap-1 min-h-[4rem] sm:min-h-[5rem]" data-operation="${operationKey}" aria-label="${translatedLabel} operation" ${isBlocked ? "disabled" : ""}>
            <div class="flex items-center gap-1 sm:gap-2">
              ${getOperationIcon(operationKey, iconColor)}
              <span class="text-xs sm:text-sm">${translatedLabel}</span>
            </div>
            <span class="text-xs font-normal lowercase tracking-normal opacity-75 preview-text ${showPreviews ? "" : "display-none"}" data-operation="${operationKey}">${previewText}</span>
          </button>`;
          })
          .join("")}
      </section>
      
      <!-- Utility Row -->
      <section class="grid grid-cols-3 gap-2" data-purpose="utility-controls">
        <button class="bg-[#374151] border border-white/10 rounded-xl py-3 flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 reset-btn ${gameState.moves >= moveLimit ? "ring-2 ring-yellow-400 ring-opacity-75 animate-pulse bg-yellow-500/20 border-yellow-400" : ""}" id="reset-btn">
          ${translate("gameStates.reset")}
        </button>
        <button class="bg-[#374151] border border-white/10 rounded-xl py-3 flex items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 info-btn" id="info-btn">
          <span>ℹ️</span> <span class="hidden sm:inline">${translate("help")}</span>
        </button>
        <button class="bg-[#6b46c1] border border-white/10 rounded-xl py-3 flex items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 ${showPreviews ? "bg-purple-600" : "bg-gray-600"}" id="preview-toggle-btn">
          <span>${showPreviews ? "👁️" : "🙈"}</span> <span class="hidden sm:inline">Preview</span>
        </button>
      </section>
    </main>
    <!-- END: GameBoard -->
    
    <!-- Info Modal -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm info-modal hidden p-4" id="info-modal">
      <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] border-3 border-[#4a5568] rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center shadow-2xl max-h-[90vh] overflow-y-auto">
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
              <span class="bg-gray-700 px-1 sm:px-2 py-1 rounded mx-1">1-4</span> ${translate("operations.sumDigits").split(" ")[1]} • <span class="bg-gray-700 px-1 sm:px-2 py-1 rounded mx-1">R</span> ${translate("gameStates.reset").replace("↻ ", "")} • <span class="bg-gray-700 px-1 sm:px-2 py-1 rounded mx-1">N</span> ${translate("gameStates.newGame").replace("🎯 ", "").split(" ")[0]}
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
        <p class="text-white/90 text-base sm:text-lg mb-2" id="success-message">Great job!</p>
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
            <span class="text-white/70 text-xs uppercase tracking-wide font-semibold">Efficiency</span>
            <span class="text-yellow-400 text-lg sm:text-xl font-bold drop-shadow-lg" id="final-efficiency">100%</span>
          </div>
        </div>
        
        <div id="difficulty-change-message" class="text-center text-yellow-300 text-sm mb-2 hidden">
          📈 <span id="difficulty-change-text"></span>
        </div>
        <div class="flex gap-4 justify-center">
          <button class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-4 py-2 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30 next-exercise-btn" id="next-exercise-btn">${translate("nextLevel")} 🎯</button>
          <button class="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-4 py-2 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/30 retry-exercise-btn" id="retry-exercise-btn">${translate("retry")}</button>
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
      const color = index === 0 ? "#0099CC" : "#10b981"; // emerald-500

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

  // Update operation preview text and button states
  const previews = getOperationPreviews(gameState.current);
  const isBlocked = gameState.moves >= moveLimit;

  document.querySelectorAll(".operation-btn").forEach((btn) => {
    const operation = btn.dataset.operation;
    const previewEl = btn.querySelector(".preview-text");

    // Update preview text and visibility
    if (previewEl) {
      previewEl.textContent = isBlocked ? "Blocked" : previews[operation];
      if (showPreviews) {
        previewEl.classList.remove("invisible");
      } else {
        previewEl.classList.add("invisible");
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
    const efficiency = Math.round(completionResult.efficiency * 100);

    // Update modal content
    finalMoves.textContent = gameState.moves;
    finalOptimal.textContent = exercise.optimalMoves;
    finalEfficiency.textContent = `${efficiency}%`;

    // Set grade-based content
    const gradeData = completionResult.grade;
    title.textContent = `${gradeData.grade} ${gradeData.emoji}`;
    message.textContent = gradeData.description;
    emoji.textContent = gradeData.emoji;

    // Check for level progression
    const levelChange = completionResult.levelChange;
    if (levelChange.changed) {
      difficultyChangeText.textContent = `Advanced to Level ${levelChange.nextDifficulty}!`;
      difficultyChangeMessage.classList.remove("hidden");
    } else if (gameManager.currentDifficulty === 6) {
      difficultyChangeText.textContent = `🏆 You've mastered all levels!`;
      difficultyChangeMessage.classList.remove("hidden");
    } else {
      difficultyChangeMessage.classList.add("hidden");
    }

    modal.classList.remove("hidden");

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

    // Animate celebration emoji
    setTimeout(() => {
      emoji.style.animation = completionResult.isPerfect
        ? "bounce 1s ease-in-out infinite"
        : "pulse 2s ease-in-out infinite";
    }, 100);
  }
}

/**
 * Handle operation button clicks
 */
function handleOperationClick(operation) {
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
 * Handle reset button click
 */
function handleReset() {
  gameState = resetGame(
    gameManager.currentExercise.goal,
    gameManager.currentDifficulty,
  );
  updateDisplay();
}

/**
 * Generate new exercise
 */
function handleNewExercise() {
  gameManager.generateNewExercise();
  updateMoveLimit();
  gameState = createGameState(
    gameManager.currentExercise.goal,
    gameManager.currentDifficulty,
  );
  // Re-render UI to reset all button states
  app.innerHTML = createGameUI();
}

/**
 * Toggle preview visibility
 */
function togglePreviews() {
  showPreviews = !showPreviews;
  
  // Re-render UI to update all button states and toggle button appearance
  app.innerHTML = createGameUI();

  // Reapply dynamic scaling and other display updates after re-render
  updateDisplay();
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
 * Handle difficulty level selection
 */
function handleDifficultySelect(difficulty) {
  if (gameManager.setDifficulty(difficulty)) {
    updateMoveLimit();
    gameState = createGameState(
      gameManager.currentExercise.goal,
      gameManager.currentDifficulty,
    );
    // Re-render UI (event listeners are already set up globally)
    app.innerHTML = createGameUI();
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
    // Re-render the entire UI with new language
    const app = document.getElementById("app");
    app.innerHTML = createGameUI();
    // Set up event listeners again after re-render
    updateDisplay();
  }
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
    } else if (e.target.closest("#info-btn")) {
      showInfoModal();
    } else if (e.target.closest("#next-exercise-btn")) {
      document.getElementById("success-modal").classList.add("hidden");
      handleNextExercise();
    } else if (e.target.closest("#retry-exercise-btn")) {
      document.getElementById("success-modal").classList.add("hidden");
      handleRetryExercise();
    } else if (e.target.closest(".level-btn")) {
      const levelBtn = e.target.closest(".level-btn");
      const difficulty = parseInt(levelBtn.dataset.level);
      handleDifficultySelect(difficulty);
    } else if (e.target.closest(".language-btn")) {
      const langBtn = e.target.closest(".language-btn");
      const langCode = langBtn.dataset.lang;
      handleLanguageChange(langCode);
    } else if (e.target.closest("#preview-toggle-btn")) {
      togglePreviews();
    }
  });

  // Global keyboard support
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "1":
        handleOperationClick("reverse");
        break;
      case "2":
        handleOperationClick("sum");
        break;
      case "3":
        handleOperationClick("append1");
        break;
      case "4":
        handleOperationClick("double");
        break;
      case "r":
      case "R":
        handleReset();
        break;
      case "n":
      case "N":
        handleNewExercise();
        break;
    }
  });

  globalEventListenerSetup = true;
}

/**
 * Initialize the game
 */
function init() {
  // Register service worker first
  registerServiceWorker();

  // Set up global event listeners (only once)
  setupGlobalEventListeners();

  // Update move limit for initial exercise
  updateMoveLimit();

  // Render initial UI
  app.innerHTML = createGameUI();

  const exercise = gameManager.currentExercise;
  console.log(
    `🧮 Number Puzzle loaded! Difficulty: ${gameManager.currentDifficulty}, Goal: 1 → ${exercise.goal}`,
  );
  console.log(`🎯 This exercise: ${exercise.optimalMoves} moves optimal`);
  console.log("💡 Keys: 1-4 for operations, R for reset, N for new exercise");
}

// Start the game
init();
