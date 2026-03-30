/**
 * Doxiny - Do X in Y moves
 * Mathematical puzzle game with elegant solutions
 */

import { createGameState, applyMove } from "./gameState.js";
import { operations } from "./operations.js";
import { GameManager } from "./GameManager.js";
import { UIManager } from "./UIManager.js";
import {
  generateExercise,
  getAllSolutions,
  getDifficultyLevels,
  validateExercise,
  detectCustomExerciseLevel,
} from "./exerciseGenerator.js";
import { generateHints } from "./gameHelpers.js";
import {
  translate,
  t,
  setLanguage,
} from "./i18n.js";
import {
  handleShareVictory,
  handleShareChallenge,
  handleSharedPuzzleURL,
} from "./sharing.js";
import { TourManager } from "./TourManager.js";
import { doxinyConfig } from "./config.js";
import analyticsService from "./services/firebase/AnalyticsService.js";
import performanceService from "./services/firebase/PerformanceService.js";
import remoteConfigService from "./services/firebase/RemoteConfigService.js";
import "./style.css";

// Initialize game manager
const gameManager = new GameManager();

// Initialize UI manager
const uiManager = new UIManager(gameManager, createGameState(
  gameManager.currentExercise.goal,
  gameManager.currentDifficulty,
));

// Initialize tour manager
const tourManager = new TourManager(uiManager, gameManager, () => handleNewExercise());

/**
 * Update move limit based on current exercise optimal moves
 */
function updateMoveLimit() {
  uiManager.gameState.moveLimit = Math.max(gameManager.currentExercise.optimalMoves, 12);
  console.log(
    `🎯 Move limit updated to: ${uiManager.gameState.moveLimit} (optimal: ${gameManager.currentExercise.optimalMoves})`,
  );
}

function scrollToTop() {
  // Scroll to top smoothly
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

/**
 * Create auto-solve function for debugging purposes
 * Returns a function that solves the current exercise step by step with delays
 */
function createAutoSolveFunction() {
  return async function (delayMs = 1000, solutionPath = null) {
    // Use provided solution path or get from current exercise
    const path = solutionPath || gameManager.currentExercise?.solutionPath;

    if (!path || path.length === 0) {
      console.warn(
        "❌ No solution path available. Generate a new exercise first.",
      );
      return false;
    }

    console.log(
      `🤖 Auto-solving exercise: 1 → ${gameManager.currentExercise.goal}`,
    );
    console.log(
      `📋 Solution has ${path.length} steps with ${delayMs}ms delay between steps`,
    );

    let stepCount = 0;

    for (const step of path) {
      stepCount++;

      // Check if game is already complete
      if (uiManager.gameState.isComplete) {
        console.log("🎉 Exercise completed!");
        break;
      }

      // Log the step being executed
      console.log(
        `🔄 Step ${stepCount}/${path.length}: ${step.operation.toUpperCase()} (${step.from} → ${step.to})`,
      );

      // Simulate button click
      try {
        handleOperationClick(step.operation);
      } catch (error) {
        console.error(`❌ Error executing step ${stepCount}:`, error);
        return false;
      }

      // Wait for the specified delay before next step (unless it's the last step)
      if (stepCount < path.length && !uiManager.gameState.isComplete) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.log(
      `${uiManager.gameState.isComplete ? "🎉" : "⚠️"} Auto-solve completed. Final result: ${uiManager.gameState.current}`,
    );
    return uiManager.gameState.isComplete;
  };
}

/**
 * Handle operation button clicks
 */
function handleOperationClick(operation) {
  // Clear any hint effects when user takes action
  clearHintEffects();

  if (!uiManager.gameState.isComplete && uiManager.gameState.moves < uiManager.gameState.moveLimit) {
    try {
      // Calculate what the result would be
      const resultValue = operations[operation](uiManager.gameState.current);

      // Only apply the move if the result is different from current value
      if (resultValue !== uiManager.gameState.current) {
        // Track operation usage with GameManager
        gameManager.trackOperationUsed(operation, uiManager.gameState.current, resultValue);
        
        uiManager.gameState = applyMove(uiManager.gameState, operation);
      }
      // Always update display to show user that operation was attempted
      uiManager.updateDisplay();
    } catch (error) {
      console.error("Error applying operation:", error);
    }
  }
}

/**
 * Reset the game to the current exercise
 */
function reloadGame() {
  clearHintEffects();
  uiManager.cleanupSuccessAnimations();
  uiManager.gameState = createGameState(
    gameManager.currentExercise.goal,
    gameManager.currentDifficulty,
  );
  updateMoveLimit();

  // Re-render UI to reset all button states
  uiManager.render();
  scrollToTop();
}

/**
 * Handle reset button click
 */
function handleReset() {
  reloadGame();
}

/**
 * Generate new exercise
 */
function handleNewExercise() {
  gameManager.generateNewExercise();
  reloadGame();
}

/**
 * Toggle preview visibility
 */
function togglePreviews() {
  clearHintEffects();
  uiManager.togglePreviews();

  // Re-render UI to update all button states and toggle button appearance
  uiManager.render();
}

/**
 * Handle hint request from user
 */
function handleHintRequest() {
  // Check if hints are available
  if (uiManager.gameState.hints.used >= uiManager.gameState.hints.maxHints) {
    console.log("💡 No more hints available for this exercise");
    return;
  }

  // Generate hint based on current state
  const hints = generateHints(
    uiManager.gameState.current,
    uiManager.gameState.goal,
    uiManager.gameState.moves,
    uiManager.gameState.hints.used,
  );

  if (hints.length === 0) {
    console.log("💡 No hints available for current state");
    return;
  }

  // Get the next hint (based on how many have been used)
  const nextHint = hints[uiManager.gameState.hints.used] ?? hints[hints.length - 1]; // Fallback to last hint if out of range

  // Update game state
  uiManager.gameState.hints.used += 1;
  uiManager.gameState.hints.hintsData.push(nextHint);
  
  // Track hint usage with GameManager
  gameManager.trackHintUsed(nextHint.type, uiManager.gameState.current, uiManager.gameState.moves);

  // Show hint (modal or button blink depending on type)
  showHint(nextHint, uiManager.gameState.hints.used, uiManager.gameState.hints.maxHints);

  // Update UI to reflect hint usage
  uiManager.updateDisplay();

  console.log(
    `💡 Hint ${uiManager.gameState.hints.used}/${uiManager.gameState.hints.maxHints} provided:`,
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
    strategic: "<i class='lni lni-bulb'></i>",
    tactical: "<i class='lni lni-target'></i>",
    direct: "<i class='lni lni-zap'></i>",
  };

  hintIcon.innerHTML = icons[hint.type] || "<i class='lni lni-bulb'></i>";
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
    reloadGame();
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
  const currentLang = translate('language');
  
  if (setLanguage(langCode)) {
    // Track language change
    analyticsService.trackLanguageChanged?.(currentLang, langCode);
    
    uiManager.cleanupSuccessAnimations();
    // Re-render the entire UI with new language
    uiManager.render();
  }
}

/**
 * Show custom exercise modal
 */
function showCustomExerciseModal() {
  // Create modal HTML
  const modalHTML = `
    <div id="custom-exercise-modal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] shadow-2xl max-w-sm w-full text-center max-h-[90vh] max-h-[90svh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="p-4 sm:p-6">
          <h3 class="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2">
            <i class="lni lni-pencil-alt"></i> ${translate("customExercise") || "Custom Exercise"}
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
              class="w-full bg-white/10 px-4 py-3 text-white text-xl font-bold text-center transition-all outline-none"
              placeholder="e.g., 128"
              min="2"
              max="10000"
              inputmode="numeric"
              pattern="[0-9]*"
            />
          </div>
          
          <!-- Validation Info -->
          <div id="validation-info" class="mb-4 hidden">
            <div id="validation-content" class="p-3 text-sm">
              <!-- Validation info will go here -->
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-3 justify-center">
            <button id="load-custom-btn" class="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide transition-all transform hover:-translate-y-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
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
          <i class="lni lni-check-box"></i> <strong>${t("customExerciseModal.validation.solvable")}</strong><br>
          ${t("customExerciseModal.validation.optimalSolution", { moves: validation.minMoves })}<br>
          <span class="text-xs text-white/70">${t("customExerciseModal.validation.reachableFrom")}</span><br>
          <span class="text-xs text-blue-300 font-semibold">${t("customExerciseModal.validation.detectedLevel", { level: levelName })}</span>
        </div>
      `;
      validationContent.className = "p-3 text-sm bg-emerald-900/20";
    } else {
      validationContent.innerHTML = `
        <div class="text-yellow-300">
          <i class="lni lni-question-circle"></i> <strong>${t("customExerciseModal.validation.unknownSolvability")}</strong><br>
          ${t("customExerciseModal.validation.notReachable")}<br>
          <span class="text-xs text-white/70">${t("customExerciseModal.validation.canStillTry")}</span><br>
          <span class="text-xs text-blue-300 font-semibold">${t("customExerciseModal.validation.detectedLevel", { level: levelName })}</span>
        </div>
      `;
      validationContent.className = "p-3 text-sm bg-yellow-900/20";
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
  uiManager.gameState = createGameState(targetValue, gameManager.currentDifficulty);

  // Update move limit
  updateMoveLimit();

  // Re-render UI
  uiManager.render();
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
    // Handle tour clicks first (blocks other interactions when active)
    if (tourManager.handleTourClick(e)) {
      return;
    }

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
      handleNextExercise();
    } else if (e.target.closest("#try-freeplay-btn")) {
      handleTryFreePlay();
    } else if (e.target.closest("#try-normal-btn")) {
      handleTryNormalMode();
    } else if (e.target.closest("#retry-exercise-btn")) {
      handleRetryExercise();
    } else if (e.target.closest("#share-victory-btn")) {
      handleShareVictory(uiManager.gameState, gameManager);
    } else if (e.target.closest("#share-challenge-btn") || e.target.closest("#share-puzzle-btn")) {
      handleShareChallenge(uiManager.gameState, gameManager);
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
      uiManager.hideMasterAchievementModal();
      // Refresh UI to show newly available Free Play mode
      uiManager.render();
    }

    // Close game mode dropdown if clicking outside
    if (
      !e.target.closest("#game-mode-dropdown-btn") &&
      !e.target.closest("#game-mode-dropdown")
    ) {
      const dropdown = document.getElementById("game-mode-dropdown");
      if (dropdown && !dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
      }
    }
  });

  globalEventListenerSetup = true;
}

/**
 * Initialize Firebase services
 */
async function initializeFirebaseServices() {
  try {
    console.log('[Firebase] Initializing services...');
    
    // Initialize all Firebase services in parallel
    const initPromises = [
      analyticsService.initialize(),
      performanceService.initialize(), 
      remoteConfigService.initialize()
    ];
    
    await Promise.allSettled(initPromises);
    
    console.log('[Firebase] Services initialization completed');
    return true;
  } catch (error) {
    console.warn('[Firebase] Services initialization failed:', error.message);
    return false;
  }
}

/**
 * Initialize the game
 */
async function init() {
  // Initialize Firebase services first (non-blocking)
  const firebaseStarted = initializeFirebaseServices();
  
  // Set up global event listeners (only once)
  setupGlobalEventListeners();

  // Apply initial game mode background
  const currentMode = gameManager.gameModeManager.getGameMode();
  applyGameModeBackground(currentMode);
  console.log(`🎨 Applied ${currentMode} mode background`);

  // Check for first-time tour based on config
  const tourConfig = doxinyConfig.get();
  const shouldShowTour = tourConfig.enableTour && 
    (tourConfig.forceShowTour || (!tourManager.hasCompletedTour() && tourConfig.tourAutoStart));
  
  console.log('🎪 Tour config:', { 
    enableTour: tourConfig.enableTour, 
    forceShowTour: tourConfig.forceShowTour, 
    tourAutoStart: tourConfig.tourAutoStart,
    hasCompleted: tourManager.hasCompletedTour(),
    willShow: shouldShowTour 
  });
  
  if (shouldShowTour) {
    console.log("🎪 Starting guided tour");
    // Track tour start
    await firebaseStarted.then(() => {
      analyticsService.trackTourStarted?.();
    }).catch(() => {});
    
    tourManager.startTour((lvl) => loadCustomExercise(lvl));
    return; // Skip normal initialization when tour is active
  }

  // Render initial UI
  uiManager.start();

  // Update move limit for initial exercise
  updateMoveLimit();

  // Handle shared puzzle URLs
  const shareResult = handleSharedPuzzleURL();

  if (shareResult.processed) {
    loadCustomExercise(shareResult.goal);
    console.log("🔗 Loaded shared puzzle from URL");
    
    // Track shared puzzle load with new method 
    await firebaseStarted.then(() => {
      analyticsService.trackSharedPuzzleLoaded?.("url_parameter", shareResult.goal, shareResult.hasMoveData);
    }).catch(() => {});
  } else {
    // No shared puzzle, continue with normal initialization
    console.log("🎮 Normal game initialization");
  }

  // Wait for Firebase before exposing dev tools (so we can test Firebase in dev)
  await firebaseStarted;

  // Expose functions for dev tools testing
  if (typeof window !== "undefined") {
    window.doxinyDev = {
      validateExercise: validateExercise,
      getAllSolutions: getAllSolutions,
      calculateProgress: (...args) => uiManager.calculateProgress(...args),
      generateHints: generateHints,
      gameManager: gameManager,
      gameState: () => uiManager.gameState,
      operations: operations,
      generateExercise: generateExercise,
      autoSolve: (delayMs = 1000) => createAutoSolveFunction()(delayMs),
      tourManager: tourManager,
      startTour: () => tourManager.startTour(),
      skipTour: () => tourManager.skipTour(),
      resetTour: () => {
        localStorage.removeItem(tourManager.TOUR_FLAG);
        console.log("🎪 Tour flag reset - reload page to see tour again");
      },
      config: doxinyConfig,
      applyPreset: (preset) => {
        doxinyConfig.applyPreset(preset);
        console.log(`🔧 Applied preset: ${preset}`);
      },
      // Firebase dev tools
      firebase: {
        analytics: analyticsService,
        performance: performanceService,
        remoteConfig: remoteConfigService
      }
    };

    console.log("🔧 Dev tools available: window.doxinyDev");
    console.log("📋 Available presets:", Object.keys(doxinyConfig.constructor.presets));
    console.log("🔥 Firebase dev tools: window.doxinyDev.firebase");
  }

  const exercise = gameManager.currentExercise;
  console.log(
    `🧮 Number Puzzle loaded! Difficulty: ${gameManager.currentDifficulty}, Goal: 1 → ${exercise.goal}`,
  );
  console.log(`🎯 This exercise: ${exercise.optimalMoves} moves optimal`);

    // Ensure we start at the top of the page
    scrollToTop();
}

/**
 * Toggle game mode dropdown visibility
 */
function toggleGameModeDropdown() {
  const dropdown = document.getElementById("game-mode-dropdown");
  dropdown.classList.toggle("hidden");
}

/**
 * Apply mode-specific background class to body
 */
function applyGameModeBackground(mode) {
  const body = document.body;

  // Remove existing mode classes
  body.classList.remove("game-mode-normal", "game-mode-freeplay");

  // Add new mode class
  body.classList.add(`game-mode-${mode}`);
}

/**
 * Update mode indicator styling
 */
function updateModeIndicator(mode) {
  const modeBtn = document.getElementById("game-mode-dropdown-btn");
  const modeLabel = document.getElementById("current-mode-label");
  const modeText = document.getElementById("current-mode-text");

  if (modeBtn) {
    // Remove existing mode classes
    modeBtn.classList.remove(
      "btn-mode-normal",
      "btn-mode-freeplay",
      "mode-indicator",
      "normal",
      "freeplay",
    );

    // Add new mode classes
    modeBtn.classList.add("mode-indicator", mode, `btn-mode-${mode}`);
  }

  if (modeLabel) {
    modeLabel.innerHTML =
      mode === "normal"
        ? "<i class='lni lni-target'></i>"
        : "<i class='lni lni-unlock'></i>";
  }

  if (modeText) {
    modeText.textContent = translate(`gameModesShort.${mode}`);
  }
}

/**
 * Handle game mode change with enhanced animations
 */
function handleGameModeChange(mode) {
  document.getElementById("game-mode-dropdown").classList.add("hidden");

  const currentMode = gameManager.gameModeManager.getGameMode();
  if (mode === currentMode) return;

  // Track game mode switch
  gameManager.trackGameModeSwitch(currentMode, mode);

  // Change the mode
  gameManager.gameModeManager.setGameMode(mode);

  // Apply new background
  applyGameModeBackground(mode);

  // Update mode indicator
  updateModeIndicator(mode);

  const newDifficulty =
    mode === "normal"
      ? gameManager.gameModeManager.getHighestUnlockedLevel()
      : gameManager.currentDifficulty;
  console.log(
    `🎮 Game mode changed to ${mode}. Setting difficulty to ${newDifficulty}.`,
  );

  // Slight delay to let background transition start
  setTimeout(() => {
    handleDifficultySelect(newDifficulty);
  }, 100);
}

// Start the game
init();
