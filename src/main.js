/**
 * Number Puzzle PWA - Main Entry Point
 * Mobile-first mathematical puzzle game with dynamic exercise generation
 */

import { createGameState, applyMove, resetGame } from "./game.js";
import { operations, operationLabels } from "./operations.js";
import { generateExercise, getDifficultyLevels } from "./exerciseGenerator.js";
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
        grade: "Perfect",
        emoji: "🏆",
        description: "Optimal solution!",
      };
    if (efficiency >= 0.85)
      return {
        grade: "Excellent",
        emoji: "⭐",
        description: "Amazing efficiency!",
      };
    if (efficiency >= 0.7)
      return { grade: "Great", emoji: "👍", description: "Well done!" };
    if (efficiency >= 0.55)
      return { grade: "Good", emoji: "😊", description: "Nice job!" };
    return {
      grade: "Keep trying",
      emoji: "💪",
      description: "You can do better!",
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
let showPreviews = false;

// Dynamic move limit based on exercise difficulty
let moveLimit = 12;

/**
 * Update move limit based on current exercise optimal moves
 */
function updateMoveLimit() {
  moveLimit = Math.max(gameManager.currentExercise.optimalMoves, 12);
  console.log(`🎯 Move limit updated to: ${moveLimit} (optimal: ${gameManager.currentExercise.optimalMoves})`);
}

// Get available difficulty levels for UI
const availableLevels = getDifficultyLevels().slice(0, 6); // Show 6 levels

/**
 * Generate preview text for what each operation will do to current number
 */
function getOperationPreviews(currentNumber) {
  const previews = {};

  // FLIP/REVERSE preview
  const reversed = operations.reverse(currentNumber);
  previews.reverse = `${currentNumber} → ${reversed}`;

  // SUM preview
  const sum = operations.sum(currentNumber);
  const digits = currentNumber.toString().split("").join(" + ");
  previews.sum = `${digits} → ${sum}`;

  // ADD 1 preview
  const appended = operations.add1Right(currentNumber);
  previews.add1Right = `${currentNumber} → ${appended}`;

  // DOUBLE preview
  const doubled = operations.double(currentNumber);
  previews.double = `${currentNumber} × 2 → ${doubled}`;

  return previews;
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
  const difficultyInfo = exerciseInfo.difficulty;

  return `
    <!-- BEGIN: MainHeader -->
    <header class="w-full max-w-md flex flex-col items-center pt-4" data-purpose="app-header">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-3xl">🧩</span>
        <h1 class="text-2xl font-bold tracking-widest uppercase">Number Puzzle</h1>
      </div>
      
      <!-- Level Selector -->
      <nav class="w-full mb-6" data-purpose="level-selector">
        <div class="grid grid-cols-6 gap-1 sm:gap-2">
          ${availableLevels
            .map(
              (lvl) =>
                `<button class="${lvl.level === gameManager.currentDifficulty ? "bg-orange-600 border-2 border-orange-400" : "bg-[#2a2f3a] border border-white/10 opacity-60"} rounded-lg sm:rounded-xl p-1 sm:p-3 flex flex-col items-center transition-all active:scale-95 level-btn" 
                     data-level="${lvl.level}">
              <span class="text-sm sm:text-xl font-bold">${lvl.level}</span>
              <span class="text-[8px] sm:text-[10px] uppercase font-bold leading-tight">${lvl.name}</span>
            </button>`,
            )
            .join("")}
        </div>
      </nav>
      
      <!-- Goal Display with Moves and New Exercise on the right -->  
      <div class="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-4 mb-4 border-2 border-emerald-500 flex justify-between items-center">
        <div class="text-center flex-1">
          <div class="text-white text-sm font-semibold uppercase tracking-wide mb-1">Goal</div>
          <div class="text-white text-4xl font-black tracking-tight">Reach ${exercise.goal}</div>
          <div class="text-emerald-200 text-xs mt-1">Transform 1 into ${exercise.goal}</div>
        </div>
        <div class="flex flex-col gap-2 ml-4">
          <div class="text-center">
            <div class="text-emerald-200 text-xs uppercase tracking-wide font-semibold">Moves</div>
            <div id="moves-count" class="text-white text-2xl font-bold">${gameState.moves}/${exercise.optimalMoves === Infinity ? "∞" : exercise.optimalMoves}</div>
          </div>
          <button class="bg-purple-800/80 hover:bg-purple-700/80 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95" id="new-exercise-btn">
            🎲 New
          </button>
        </div>
      </div>
    </header>
    <!-- END: MainHeader -->
    
    <!-- BEGIN: GameBoard -->
    <main class="w-full max-w-md flex-1 flex flex-col gap-4">
      <!-- Central Number Display -->
      <section class="glass-panel rounded-3xl p-6 flex justify-center items-center mb-2" data-purpose="number-display">
        <span class="text-8xl font-black text-white tracking-tighter current-number" id="current-number">${gameState.current}</span>
      </section>
      
      <!-- Operation Buttons Grid -->
      <section class="grid grid-cols-2 gap-3" data-purpose="game-controls">
        ${Object.entries(operationLabels)
          .map(([op, label]) => {
            const previews = getOperationPreviews(gameState.current);
            const isBlocked = gameState.moves >= moveLimit;
            const buttonClass = isBlocked
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#ef4444] hover:bg-[#dc2626] text-white transition-transform active:scale-95";
            const previewText = isBlocked ? "Blocked" : previews[op];
            return `<button class="${buttonClass} font-black py-4 px-2 rounded-2xl shadow-lg uppercase tracking-widest operation-btn flex flex-col items-center gap-1" data-operation="${op}" aria-label="${label} operation" ${isBlocked ? "disabled" : ""}>
            <span class="text-lg">${label}</span>
            <span class="text-xs font-normal lowercase tracking-normal opacity-75 preview-text ${showPreviews ? "" : "hidden"}" data-operation="${op}">${previewText}</span>
          </button>`;
          })
          .join("")}
      </section>
      
      <!-- Utility Row -->
      <section class="grid grid-cols-4 gap-2" data-purpose="utility-controls">
        <button class="bg-[#374151] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 reset-btn ${gameState.moves >= moveLimit ? "ring-4 ring-yellow-400 ring-opacity-75 animate-pulse bg-yellow-500/20 border-yellow-400" : ""}" id="reset-btn">
          <span>🔄</span> Reset
        </button>
        <button class="bg-[#374151] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 info-btn" id="info-btn">
          <span>ℹ️</span> Help
        </button>
        <button class="bg-[#4a5568] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95" id="history-btn">
          <span>📋</span> History
        </button>
        <button class="bg-[#6b46c1] border border-white/10 rounded-2xl py-4 flex items-center justify-center gap-1 text-xs font-bold transition-transform active:scale-95 ${showPreviews ? "bg-purple-600" : "bg-gray-600"}" id="preview-toggle-btn">
          <span>${showPreviews ? "👁️" : "🙈"}</span> Preview
        </button>
      </section>
    </main>
    <!-- END: GameBoard -->
    
    <!-- History Overlay Modal -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm history-modal hidden" id="history-modal">
      <div class="bg-gradient-to-br from-[#1f2937] to-[#111827] border-2 border-gray-600 rounded-3xl p-6 max-w-sm w-11/12 max-h-[70vh] overflow-hidden">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-white font-bold uppercase tracking-widest text-lg">📋 Move History</h3>
          <button class="text-gray-400 hover:text-white text-2xl font-bold" id="close-history-btn">×</button>
        </div>
        <div class="bg-[#111827] rounded-xl p-4 font-mono text-sm max-h-[50vh] overflow-y-auto" id="history-content">
          ${renderHistory()}
        </div>
      </div>
    </div>
    
    <!-- Info Modal -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm info-modal hidden" id="info-modal">
      <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] border-3 border-[#4a5568] rounded-3xl p-8 max-w-md w-11/12 text-center shadow-2xl">
        <h3 class="text-2xl font-bold text-white mb-4">ℹ️ Game Help</h3>
        <div class="text-white/95 text-sm text-left leading-relaxed mb-6" id="info-content">
          <div class="mb-4">
            <div class="text-center mb-3">
              <span class="text-lg font-bold text-blue-300">Operations:</span>
            </div>
            <div class="space-y-2">
              <div>• <span class="font-bold text-yellow-300">REVERSE:</span> Reverse digits (12 → 21)</div>
              <div>• <span class="font-bold text-yellow-300">SUM DIGITS:</span> Add digits (123 → 6)</div>
              <div>• <span class="font-bold text-yellow-300">APPEND 1:</span> Append 1 (4 → 41)</div>
              <div>• <span class="font-bold text-yellow-300">DOUBLE:</span> Double the number (8 → 16)</div>
            </div>
          </div>
          <div class="mb-4">
            <div class="text-center mb-2">
              <span class="text-lg font-bold text-blue-300">Keyboard Shortcuts:</span>
            </div>
            <div class="text-center text-sm">
              <span class="bg-gray-700 px-2 py-1 rounded mx-1">1-4</span> Operations • <span class="bg-gray-700 px-2 py-1 rounded mx-1">R</span> Reset • <span class="bg-gray-700 px-2 py-1 rounded mx-1">N</span> New
            </div>
          </div>
          <div class="text-center text-emerald-300 font-semibold" id="difficulty-tip"></div>
        </div>
        <button class="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all transform hover:-translate-y-1" id="close-info-btn">Got it!</button>
      </div>
    </div>
    
    <!-- Success Modal -->
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm success-modal hidden" id="success-modal">
      <div class="bg-gradient-to-br from-[#2d3748] to-[#1a1a1a] border-3 border-emerald-500 rounded-3xl p-8 max-w-sm w-11/12 text-center shadow-2xl shadow-emerald-500/30">
        <div class="text-6xl mb-4 celebration-emoji" id="celebration-emoji">🎉</div>
        <h2 class="text-3xl font-bold text-emerald-400 mb-4 drop-shadow-lg" id="success-title">Level Complete!</h2>
        <p class="text-white/90 text-xl mb-6" id="success-message">Great job!</p>
        <div class="flex gap-8 justify-center mb-4">
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-sm uppercase tracking-wide font-semibold">Moves</span>
            <span class="text-emerald-400 text-2xl font-bold drop-shadow-lg" id="final-moves">0</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-sm uppercase tracking-wide font-semibold">Target</span>
            <span class="text-emerald-400 text-2xl font-bold drop-shadow-lg" id="final-optimal">0</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-white/70 text-sm uppercase tracking-wide font-semibold">Efficiency</span>
            <span class="text-yellow-400 text-2xl font-bold drop-shadow-lg" id="final-efficiency">100%</span>
          </div>
        </div>
        
        <!-- Move History Section -->
        <div class="bg-[#111827] rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
          <h4 class="text-white/70 text-sm uppercase tracking-wide font-semibold mb-2 text-center">Your Solution</h4>
          <div class="font-mono text-xs" id="success-history">
            <!-- History will be populated here -->
          </div>
        </div>
        
        <div id="difficulty-change-message" class="text-center text-yellow-300 text-sm mb-4 hidden">
          📈 <span id="difficulty-change-text"></span>
        </div>
        <div class="flex gap-4 justify-center flex-wrap">
          <button class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30 next-exercise-btn" id="next-exercise-btn">Next Exercise 🎯</button>
          <button class="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-6 py-3 rounded-xl uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/30 retry-exercise-btn" id="retry-exercise-btn">Retry Exercise</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render game history
 */
function renderHistory() {
  if (gameState.history.length === 0) {
    return `<div class="flex justify-between items-center opacity-70">
      <div>
        <span class="text-gray-600">1.</span>
        <span class="text-orange-500 font-bold ml-2">START</span>
      </div>
      <span class="text-emerald-500">[1]</span>
    </div>`;
  }

  return gameState.history
    .map(
      (entry, index) =>
        `<div class="flex justify-between items-center opacity-70 ${index < gameState.history.length - 1 ? "border-b border-white/10 pb-2 mb-2" : ""}">
      <div>
        <span class="text-gray-600">${index + 1}.</span>
        <span class="text-orange-500 font-bold ml-2">${entry.action}</span>
      </div>
      <span class="text-emerald-500">[${entry.value}]</span>
    </div>`,
    )
    .join("");
}

/**
 * Update the history modal content
 */
function updateHistoryModal() {
  const historyContent = document.getElementById("history-content");
  if (historyContent) {
    historyContent.innerHTML = renderHistory();
    historyContent.scrollTop = historyContent.scrollHeight; // Auto-scroll to bottom
  }
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
      btn.classList.remove("bg-[#ef4444]", "hover:bg-[#dc2626]", "transition-transform", "active:scale-95", "text-white");
      // Add blocked button classes
      btn.classList.add("bg-gray-600", "text-gray-400", "cursor-not-allowed");
      btn.disabled = true;
    } else {
      // Remove blocked button classes
      btn.classList.remove("bg-gray-600", "text-gray-400", "cursor-not-allowed");
      // Add active button classes
      btn.classList.add("bg-[#ef4444]", "hover:bg-[#dc2626]", "transition-transform", "active:scale-95", "text-white");
      btn.disabled = false;
    }
  });

  // Update reset button glow
  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    if (isBlocked) {
      resetBtn.classList.add("ring-4", "ring-yellow-400", "ring-opacity-75", "animate-pulse", "bg-yellow-500/20", "border-yellow-400");
    } else {
      resetBtn.classList.remove("ring-4", "ring-yellow-400", "ring-opacity-75", "animate-pulse", "bg-yellow-500/20", "border-yellow-400");
    }
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
  const successHistory = document.getElementById("success-history");

  if (modal && finalMoves) {
    // Process exercise completion with game manager
    const completionResult = gameManager.onExerciseComplete(gameState.moves);
    const exercise = gameManager.currentExercise;
    const efficiency = Math.round(completionResult.efficiency * 100);

    // Update modal content
    finalMoves.textContent = gameState.moves;
    finalOptimal.textContent = exercise.optimalMoves;
    finalEfficiency.textContent = `${efficiency}%`;

    // Update history in success modal
    if (successHistory) {
      successHistory.innerHTML = renderHistory();
    }

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
  const exercise = gameManager.currentExercise;
  const difficultyInfo = gameManager.getCurrentExerciseInfo().difficulty;

  const difficultyTips = {
    1: "💡 Beginner: Use ×2 to grow quickly, experiment with all operations!",
    2: "💡 Easy: Try combining operations creatively.",
    3: "💡 Medium: Look for patterns and plan your moves.",
    4: "💡 Hard: Think strategically about operation sequences.",
    5: "💡 Expert: Master-level puzzles require creative thinking!",
    6: "💡 Insane: The ultimate challenge!",
  };

  // Update difficulty tip
  const difficultyTip = document.getElementById("difficulty-tip");
  if (difficultyTip) {
    difficultyTip.textContent = difficultyTips[gameManager.currentDifficulty];
  }

  // Show modal
  document.getElementById("info-modal").classList.remove("hidden");
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
    } else if (e.target.closest("#history-btn")) {
      document.getElementById("history-modal").classList.remove("hidden");
      updateHistoryModal();
    } else if (e.target.closest("#close-history-btn")) {
      document.getElementById("history-modal").classList.add("hidden");
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
        handleOperationClick("add1Right");
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
