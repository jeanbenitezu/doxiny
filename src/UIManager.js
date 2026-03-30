/**
 * UI Manager
 * Unified class for all visual responsibilities and DOM management
 */

import { operations } from "./operations.js";
import { getDifficultyLevels } from "./exerciseGenerator.js";
import { calculateProgressToTarget } from "./gameHelpers.js";
import { t, translate, getCurrentLanguage, languages } from "./i18n.js";

export class UIManager {
  constructor(gameManager, gameState) {
    this.gameManager = gameManager;
    this.gameState = gameState;

    // UI State
    this.showPreviews = true;

    // DOM references
    this.app = document.querySelector("#app");
  }

  // === LEVEL SELECTOR UI ===

  getAvailableLevels() {
    const baseLevels = getDifficultyLevels().slice(0, 6); // Show 6 regular levels

    // Only show custom level if in Free Play mode and player has mastery to create custom exercises
    if (
      this.gameManager.gameModeManager.isFreePlay() &&
      this.gameManager.gameModeManager.isMaster()
    ) {
      const customLevel = { level: "custom", nameKey: "custom" };
      return [...baseLevels, customLevel];
    }

    return baseLevels;
  }

  isLevelLocked(level) {
    return !this.gameManager.gameModeManager.isLevelUnlocked(level);
  }

  renderLevelSelectorUI() {
    const availableLevels = this.getAvailableLevels();

    const levelButtons = availableLevels
      .map((lvl) => {
        const isCustom = lvl.level === "custom";
        const isLocked = !isCustom && this.isLevelLocked(lvl.level);

        // For custom exercises, highlight the detected level
        const isCustomActive =
          this.gameManager.isCustomExercise &&
          !isCustom &&
          lvl.level === this.gameManager.customExerciseLevel;
        const isRegularActive =
          !this.gameManager.isCustomExercise &&
          !isCustom &&
          lvl.level === this.gameManager.currentDifficulty;
        const isActive = isCustomActive || isRegularActive;

        let buttonClass;
        if (isCustom) {
          // Custom button - purple when not active, orange when a custom exercise is loaded
          buttonClass = this.gameManager.isCustomExercise
            ? "bg-orange-600 text-white"
            : "bg-purple-600 text-white hover:bg-purple-500";
        } else if (isLocked) {
          // Locked levels
          buttonClass = "bg-gray-800/50 text-gray-500 cursor-not-allowed";
        } else {
          // Regular level buttons
          buttonClass = isActive
            ? "bg-orange-600 border-t-4 border-solid border-white-600"
            : "bg-[#2a2f3a] opacity-60";
        }

        const title = isLocked
          ? translate("gameModeMessages.levelLocked", {
              efficiency:
                this.gameManager.gameModeManager.getEfficiencyRequirement(
                  lvl.level,
                ) * 100,
            })
          : "";

        return `<button class="${buttonClass} p-1 flex flex-col items-center justify-center transition-all active:scale-95 level-btn h-full" 
               data-level="${lvl.level}"
               ${isLocked ? "disabled" : ""}
               ${title ? `title="${title}"` : ""}>
            <span class="font-bold" style="font-size: clamp(0.7rem, 2vh, 1rem); font-size: clamp(0.7rem, 2svh, 1rem);">
              ${isCustom ? "<i class='lni lni-pencil'></i>" : isLocked ? "<i class='lni lni-lock'></i>" : lvl.level}
            </span>
            <span class="uppercase font-bold leading-tight${isLocked ? " hidden" : ""}" style="font-size: clamp(0.5rem, 1.2vh, 0.7rem); font-size: clamp(0.5rem, 1.2svh, 0.7rem);">
              ${isCustom ? translate("custom") || "Custom" : isLocked ? translate("blocked") : translate(`difficultyLevels.${lvl.nameKey}`)}
            </span>
          </button>`;
      })
      .join("");

    return `
      <!-- Level Selector -->
      <nav class="w-full" style="height: 6vh; height: 6svh; min-height: 2.5rem; max-height: 4rem;" data-purpose="level-selector">
        <div class="grid h-full" style="grid-template-columns: repeat(${availableLevels.length}, 1fr);">
          ${levelButtons}
        </div>
      </nav>
    `;
  }

  updateLevelSelectorUI() {
    const levelSelector = document.querySelector(
      '[data-purpose="level-selector"]',
    );
    if (levelSelector) {
      // Get the new HTML from renderLevelSelectorUI and extract just the inner content
      const newLevelSelectorHTML = this.renderLevelSelectorUI();

      // Create a temporary element to parse the HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = newLevelSelectorHTML;

      // Extract the nav element and replace the existing one
      const newNav = tempDiv.querySelector(
        'nav[data-purpose="level-selector"]',
      );
      if (newNav) {
        levelSelector.replaceWith(newNav);
        console.log("🎮 Level selector UI updated");
      }
    }
  }

  // === PROGRESS & DISPLAY ===

  calculateProgress(currentNumber, targetNumber) {
    const exerciseInfo = this.gameManager.getCurrentExerciseInfo();
    const optimalMoves = exerciseInfo.exercise.optimalMoves || 10;

    return calculateProgressToTarget(
      currentNumber,
      targetNumber,
      this.gameState.moves,
      optimalMoves,
    );
  }

  getProgressIndicator(currentNumber, targetNumber) {
    const progress =
      currentNumber === 1
        ? 0
        : this.calculateProgress(currentNumber, targetNumber);

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

  getProgressHTML(currentNumber, targetNumber) {
    const { progress, color1, color2 } = this.getProgressIndicator(
      currentNumber,
      targetNumber,
    );

    return `
      <div class="relative bg-gray-800/50 h-4 overflow-hidden">
        <div id="progress-bar-fill" class="h-full transition-all duration-700 ease-out" 
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

  // === OPERATION PREVIEWS ===

  getOperationPreviews(currentNumber) {
    const previews = {};

    // REVERSE preview
    const reversed = operations.reverse(currentNumber);
    previews.reverse = `${currentNumber} → ${reversed}`;

    // SUMDIGITS preview
    const sumDigits = operations.sumDigits(currentNumber);
    const digits = currentNumber.toString().split("").join(" + ");
    previews.sumDigits = `${digits} → ${sumDigits}`;

    // APPEND 1 preview
    const appended = operations.append1(currentNumber);
    previews.append1 = `${currentNumber} → ${appended}`;

    // DOUBLE preview
    const doubled = operations.double(currentNumber);
    previews.double = `${currentNumber} × 2 → ${doubled}`;

    return previews;
  }

  getOperationIcon(operation, color = "currentColor") {
    const svgIcons = {
      reverse: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" style="color: ${color};">
        <path fill="currentColor" d="M52 2H12C6.479 2 2 6.477 2 12v40c0 5.523 4.479 10 10 10h40c5.523 0 10-4.477 10-10V12c0-5.523-4.477-10-10-10m5 43.666A8.33 8.33 0 0 1 48.668 54H15.334A8.334 8.334 0 0 1 7 45.666V12.334A8.334 8.334 0 0 1 15.334 4h33.334A8.33 8.33 0 0 1 57 12.334z"/>
        <!-- Top arrow -->
        <path fill="currentColor" d="M14.001 31.548c0-2.865 1.105-5.555 3.114-7.58a10.52 10.52 0 0 1 7.518-3.141h11.771v-3.828l11.598 6.752l-11.598 6.752v-3.828H24.633c-2.665 0-4.831 2.186-4.831 4.873q0 .196.014.393L14.564 35a10.8 10.8 0 0 1-.563-3.452" />
        <!-- Bottom arrow -->
        <path fill="currentColor" d="M46.885 40.024a10.54 10.54 0 0 1-7.526 3.143H27.61v3.832l-11.609-6.758l11.609-6.758v3.832h11.748c2.668 0 4.838-2.191 4.838-4.879q0-.189-.015-.371l5.265-3.066c.365 1.094.555 2.25.555 3.438c0 2.867-1.107 5.56-3.116 7.587" />
      </svg>`,
      sumDigits: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 64 64" style="color: ${color};">
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

    const emojiIcons = {
      reverse: `<i class="lni color-[${color}] lni-shuffle"></i>`,
      sumDigits: `<i class="lni color-[${color}] lni-more-alt"></i>`,
      append1: `<i class="lni color-[${color}] lni-layers"></i>`,
      double: `<i class="lni color-[${color}] lni-plus" style="transform: rotate(45deg);"></i>`,
      start: `<i class="lni color-[${color}] lni-arrow-right"></i>`,
    };

    // read a query parameter to determine whether to use SVG icons or emoji icons
    const icons =
      new URLSearchParams(window.location.search).get("icons") === "svg"
        ? svgIcons
        : emojiIcons;

    return icons[operation] || icons.start;
  }

  // === HISTORY RENDERING ===

  renderInlineHistory() {
    if (this.gameState.history.length === 0) {
      return `<div class="text-white/50 text-xs">${translate("noMovesYet")}</div>`;
    }

    return this.gameState.history
      .map((entry, index) => {
        const op = entry.action.toLowerCase().replace(" ", "");
        const color = index === 0 ? "#2563EB" : "#10b981"; // emerald-500

        return `<div class="flex items-center gap-1 bg-[${color}10] px-2 py-1" title="${entry.action}: ${this.gameState.history[index].value} → ${entry.value}">
          ${this.getOperationIcon(op, color)}
          <span class="text-[${color}] text-xs font-bold">${entry.value}</span>
        </div>`;
      })
      .join("");
  }

  // === MODALS ===

  showMasterAchievementModal() {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in";
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.hideMasterAchievementModal();
    });

    modal.innerHTML = `
      <div class="bg-gradient-to-br from-yellow-400 via-gold-500 to-yellow-600 p-6 max-w-sm mx-4 text-center shadow-2xl shadow-gold-500/50 animate-bounce-in">
        <div class="text-6xl mb-4 animate-spin-once"><i class="lni lni-crown"></i></div>
        <h2 class="text-2xl font-bold text-white mb-2">${translate("masterAchievement.title")}</h2>
        <p class="text-white/90 mb-4">${translate("masterAchievement.message")}</p>
        <button id="master-achievement-continue-btn" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 font-semibold transition-all w-full">
          ${translate("common.continue")}
        </button>
      </div>
    `;

    document.body.appendChild(modal);
  }

  hideMasterAchievementModal() {
    const modal = document.querySelector(".fixed.inset-0.bg-black\\/80");
    if (modal) modal.remove();
  }

  // === VISUAL EFFECTS ===

  createConfettiExplosion() {
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

  cleanupSuccessAnimations() {
    document.getElementById("success-modal").classList.add("hidden");
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

  // === MAIN UI CREATION ===

  createGameUI() {
    const exerciseInfo = this.gameManager.getCurrentExerciseInfo();
    const exercise = exerciseInfo.exercise;

    return `
      <!-- BEGIN: MainHeader -->
      <header class="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between py-1" data-purpose="app-header">
        <div class="flex items-center justify-center sm:justify-start gap-1">
          <i class="lni lni-calculator"></i>
          <h1 class="font-bold tracking-wide uppercase" style="font-size: clamp(0.8rem, 2vh, 1.2rem); font-size: clamp(0.8rem, 2svh, 1.2rem)">Doxiny</h1>
        </div>
        
        <!-- Game Mode & Language Controls -->
        <div class="flex gap-2 justify-center sm:justify-end items-center">
          ${this.gameManager.gameModeManager.isMaster() ? `<span class="master-indicator text-yellow-400 font-bold relative" title="${translate("masterStatus.title")}"><i class="lni lni-crown"></i>${this.gameManager.gameModeManager.getCompletionDisplay() ? `<span class="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center" style="font-size: 0.6rem; min-width: 1rem; min-height: 1rem;">${this.gameManager.gameModeManager.getCompletionDisplay()}</span>` : ""}</span>` : ""}
          <!-- Game Mode Dropdown -->
          <div class="relative">
            <button id="game-mode-dropdown-btn" class="mode-indicator ${this.gameManager.gameModeManager.getGameMode()} btn-mode-${this.gameManager.gameModeManager.getGameMode()} hover:brightness-110 px-2 py-1 font-semibold transition-all active:scale-95 flex items-center gap-1" 
                    style="font-size: clamp(0.6rem, 1.5vh, 0.8rem); font-size: clamp(0.6rem, 1.5svh, 0.8rem); height: clamp(1.5rem, 3vh, 2rem); height: clamp(1.5rem, 3svh, 2rem);">
              <span id="current-mode-label">${this.gameManager.gameModeManager.getGameMode() === "normal" ? "<i class='lni lni-target'></i>" : "<i class='lni lni-unlock'></i>"}</span>
              <span id="current-mode-text">${translate(`gameModesShort.${this.gameManager.gameModeManager.getGameMode()}`)}</span>
              <span>▼</span>
            </button>
            <div id="game-mode-dropdown" class="hidden absolute top-full right-0 mt-1 bg-gray-800 shadow-lg shadow-black/50 z-50 min-w-[200px]">
              <button class="game-mode-option w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2" data-mode="normal">
                <i class="lni lni-target"></i>
                <div>
                  <div class="font-semibold">${translate("gameModes.normal")}</div>
                  <div class="text-xs text-gray-400">${translate("gameModeDescriptions.normal")}</div>
                </div>
              </button>
              ${
                this.gameManager.gameModeManager.isMaster()
                  ? `<button class="game-mode-option w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-2" data-mode="freeplay">
                    <span><i class="lni lni-unlock"></i></span>
                    <div>
                      <div class="font-semibold">${translate("gameModes.freeplay")}</div>
                      <div class="text-xs text-gray-400">${translate("gameModeDescriptions.freeplay")}</div>
                    </div>
                  </button>`
                  : `<button class="game-mode-option w-full px-3 py-2 text-left cursor-not-allowed opacity-50 flex items-center gap-2" data-mode="freeplay" disabled>
                    <span><i class="lni lni-lock"></i></span>
                    <div>
                      <div class="font-semibold text-gray-400">${translate("gameModes.freeplay")}</div>
                      <div class="text-xs text-gray-500">${translate("gameModeDescriptions.freeplayLocked")}</div>
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
            <button class="language-btn ${getCurrentLanguage() === lang.code ? "bg-blue-600" : "bg-gray-600/50"} 
                           px-2 py-1 font-semibold transition-all active:scale-95 flex items-center gap-1"
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
      
      ${this.renderLevelSelectorUI()}
      
      <!-- Goal Display with Share button on left, Moves and New Exercise on the right -->  
      <div class="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 p-2 flex flex-col sm:flex-row sm:justify-between gap-1" style="height: 7rem;">
        <div class="flex flex-row sm:flex-col justify-center items-center gap-1 sm:mr-2">
          <button class="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white font-bold px-2 py-1 transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-black-800 drop-shadow-lg" style="font-size: clamp(0.6rem, 1.4vh, 0.8rem); font-size: clamp(0.6rem, 1.4svh, 0.8rem); height: clamp(1.8rem, 4vh, 2.5rem); height: clamp(1.8rem, 4svh, 2.5rem);" id="share-puzzle-btn">
            <i class="lni lni-share-alt"></i> <span>${translate("sharing.shareCurrentPuzzle")}</span>
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
            <div id="moves-count" class="text-white font-bold" style="font-size: clamp(0.9rem, 2.2vh, 1.3rem); font-size: clamp(0.9rem, 2.2svh, 1.3rem);">${this.gameState.moves}/${exercise.optimalMoves === Infinity ? "∞" : exercise.optimalMoves}</div>
          </div>
          <button class="bg-purple-800/80 hover:bg-purple-700/80 text-white font-bold px-2 py-1 transition-all active:scale-95 whitespace-nowrap" style="font-size: clamp(0.6rem, 1.4vh, 0.8rem); font-size: clamp(0.6rem, 1.4svh, 0.8rem); height: clamp(1.8rem, 4vh, 2.5rem); height: clamp(1.8rem, 4svh, 2.5rem);" id="new-exercise-btn">
            <i class="lni lni-reload"></i> <span>${translate("gameStates.newGame")}</span>
          </button>
        </div>
      </div>
      
      <!-- Progress Indicator -->
      <div class="w-full" id="progress-container">
        <div class="relative bg-gray-800/50 h-4 overflow-hidden">
          <div id="progress-bar-fill" class="h-full transition-all duration-700 ease-out" 
               style="width: 0%; background: linear-gradient(to right, rgb(107, 114, 128), rgb(100, 116, 139));"></div>
          <div id="progress-percentage" class="absolute inset-0 flex items-center justify-center text-white font-bold text-xs drop-shadow-lg">
            0%
          </div>
        </div>
      </div>
      
      <!-- BEGIN: GameBoard -->
      <main class="w-full flex-1 flex flex-col" style="height: 70vh; height: 70svh; gap: 1vh; gap: 1svh;">
        <!-- Central Number Display -->
        <section class="flex justify-center items-center" style="height: 18vh; height: 18svh; min-height: 4rem;" id="number-display" data-purpose="number-display">
          <span class="font-black text-white tracking-tighter current-number" id="current-number" style="font-size: clamp(2.5rem, 8vh, 5rem); font-size: clamp(2.5rem, 8svh, 5rem);">${this.gameState.current}</span>
        </section>
        
        <!-- Inline History -->
        <section class="flex-shrink-0" style="min-height: 3rem;" data-purpose="inline-history">
          <div class="bg-[#1a1a1a] p-2 transition-all duration-300 h-full" id="history-container">
            <div class="flex items-center justify-between mb-1">
              <h4 class="text-white/70 uppercase tracking-wide font-semibold" style="font-size: clamp(0.6rem, 1.4vh, 0.8rem); font-size: clamp(0.6rem, 1.4svh, 0.8rem);">${translate("history")}</h4>
            </div>
            <div class="flex overflow-x-scroll gap-1 items-start transition-all duration-300 pb-1 h-4/5" id="inline-history-content">
              ${this.renderInlineHistory()}
            </div>
          </div>
        </section>
        
        <!-- Operation Buttons Grid -->
        <section class="grid grid-cols-2 gap-2 flex-2" data-purpose="game-controls">
          ${["reverse", "sumDigits", "append1", "double"]
            .map((op) => {
              const previews = this.getOperationPreviews(
                this.gameState.current,
              );
              const isBlocked =
                this.gameState.moves >= this.gameState.moveLimit;
              const buttonClass = isBlocked
                ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-inner"
                : "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 text-white transition-all duration-200 active:scale-95 shadow-lg hover:shadow-red-500/30 hover:shadow-xl relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none";
              const previewText = isBlocked
                ? translate("blocked")
                : previews[op];
              const iconColor = isBlocked ? "#9ca3af" : "#ffffff";
              const translatedLabel = translate(`operations.${op}`);
              return `<button class="${buttonClass} font-black shadow-lg uppercase tracking-wide operation-btn flex flex-col items-center justify-center gap-1 h-full transition-transform active:scale-95" data-operation="${op}" aria-label="${translatedLabel} operation" ${isBlocked ? "disabled" : ""} style="height: 13vh; height: 13svh; max-height: 7rem; font-size: clamp(0.6rem, 1.8vh, 0.9rem); font-size: clamp(0.6rem, 1.8svh, 0.9rem);">
              <div class="flex items-center gap-1">
                ${this.getOperationIcon(op, iconColor)}
                <span>${translatedLabel}</span>
              </div>
              <span class="font-normal lowercase tracking-normal opacity-75 preview-text truncate w-full ${this.showPreviews ? "" : "display-none"}" data-operation="${op}" style="font-size: clamp(0.5rem, 1.4vh, 0.7rem); font-size: clamp(0.5rem, 1.4svh, 0.7rem);">${previewText}</span>
            </button>`;
            })
            .join("")}
        </section>
        
        <!-- Utility Row -->
        <section class="grid grid-cols-4 gap-2 flex-1 flex-shrink-0" style="max-height: 8vh; max-height: 8svh;" data-purpose="utility-controls">
          <button class="bg-[#374151] flex items-center justify-center gap-1 font-bold transition-all active:scale-95 reset-btn h-full ${this.gameState.moves >= this.gameState.moveLimit ? "ring-2 ring-yellow-400 ring-opacity-75 animate-pulse bg-yellow-500/20" : ""}" id="reset-btn" style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
            <i class="lni lni-spinner-arrow"></i> <span>${translate("gameStates.reset")}</span>
          </button>
          <button class="bg-[#374151] flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 info-btn h-full" id="info-btn" style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
            <i class="lni lni-help"></i> <span>${translate("help")}</span>
          </button>
          <button class="bg-[#6b46c1] flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full ${this.showPreviews ? "bg-purple-600" : "bg-gray-600"}" id="preview-toggle-btn" style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
            <i class="lni ${this.showPreviews ? "lni-star-fill" : "lni-star-empty"} p-2"></i> <span>${translate("preview")}</span>
          </button>
          <button class="${this.gameState.hints.used >= this.gameState.hints.maxHints ? "bg-gray-600 text-gray-400 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500"} flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full" id="hint-btn" ${this.gameState.hints.used >= this.gameState.hints.maxHints ? "disabled" : ""} style="font-size: clamp(0.6rem, 1.6vh, 0.85rem); font-size: clamp(0.6rem, 1.6svh, 0.85rem);">
            <i class="lni lni-invention"></i> <span>${translate("hint")} (${this.gameState.hints.used}/${this.gameState.hints.maxHints})</span>
          </button>
        </section>
      </main>
      <!-- END: GameBoard -->
      
      <!-- Info Modal -->
      <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm info-modal hidden p-4" id="info-modal">
        <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] p-4 sm:p-6 max-w-sm w-full text-center shadow-2xl max-h-[90vh] max-h-[90svh] overflow-y-auto">
          <h3 class="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4"><i class="lni lni-question-circle"></i> ${translate("howToPlay")}</h3>
          <div class="text-white/95 text-sm text-left leading-relaxed mb-4 sm:mb-6" id="info-content">
            <div class="mb-3 sm:mb-4">
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
            <div class="text-center text-yellow-300 font-semibold text-xl"><i class="lni lni-invention"></i> <span id="difficulty-tip" class="text-sm text-emerald-400"></span></div>
          </div>
          <button class="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 font-bold uppercase tracking-wide transition-all transform hover:-translate-y-1 text-sm" id="close-info-btn">${translate("close")}</button>
        </div>
      </div>
      
      <!-- Success Modal -->
      <div class="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm success-modal hidden z-40" id="success-modal">
        <div class="bg-gradient-to-br from-[#2d3748] to-[#1a1a1a] p-4 text-center shadow-2xl shadow-emerald-500/30">
          <div class="flex items-center justify-center gap-2 sm:gap-3 mb-2">
            <div class="text-3xl sm:text-4xl celebration-emoji" id="celebration-emoji"><i class="lni lni-star-fill"></i></div>
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
          
          ${
            this.gameManager.gameModeManager.isNormal()
              ? `
          <div id="difficulty-change-message" class="text-center text-yellow-300 text-sm mb-2 hidden">
            📈 <span id="difficulty-change-text"></span>
          </div>
          `
              : ""
          }
          <!-- Action buttons row -->
          <div class="flex flex-col gap-3 justify-center">
            <!-- Main action buttons -->
            <div class="flex gap-2 justify-between">
              <button class="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold px-4 py-2 uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/30 retry-exercise-btn" id="retry-exercise-btn"><i class="lni lni-spinner-arrow"></i> ${translate("retry")}</button>
              ${
                this.gameManager.gameModeManager.isNormal()
                  ? !this.gameManager.getNextLevelInfo().isAvailable
                    ? `<button class="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold px-4 py-2 uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-teal-500/30" id="try-freeplay-btn">${translate("gameModeMessages.tryFreePlay")} <i class="lni lni-unlock"></i></button>`
                    : `<button class="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-4 py-2 uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/30 text-nowrap" id="next-exercise-btn">${translate("nextLevel")} <i class="lni lni-target"></i></button>`
                  : `<button class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-4 py-2 uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/30" id="try-normal-btn">${translate("gameModeMessages.tryNormalMode")} <i class="lni lni-baloon"></i></button>`
              }
            </div>
            <!-- Share buttons row -->
            <div class="flex gap-2 justify-around">
              <button class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-3 py-2 text-xs uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/30" id="share-challenge-btn"><i class="lni lni-friendly"></i> ${translate("sharing.shareChallenge")}</button>
              <button class="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-3 py-2 text-xs uppercase tracking-wide transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-orange-500/30" id="share-victory-btn">${translate("sharing.shareVictory")} <i class="lni lni-cool"></i></button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Hint Display Area (Non-modal) -->
      <div class="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4 hint-display hidden" id="hint-display">
        <div class="bg-gradient-to-br from-[#4a5568] to-[#2d3748] p-4 shadow-xl backdrop-blur-sm">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg" id="hint-icon-display"></span>
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

  // === UPDATE METHODS ===

  updateDisplay() {
    // Update current number with animation and dynamic scaling
    const currentEl = document.getElementById("current-number");
    if (currentEl) {
      const newValue = this.gameState.current.toString();
      const previousValue = currentEl.textContent;
      const hasChanged = newValue !== previousValue;

      currentEl.textContent = this.gameState.current;

      // Apply dynamic scaling based on digit count
      const digitCount = this.gameState.current.toString().length;
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
      const optimalMoves = this.gameManager.currentExercise.optimalMoves;
      movesEl.textContent =
        this.gameState.moves +
        "/" +
        (optimalMoves === Infinity ? "∞" : optimalMoves);

      // Remove existing color classes
      movesEl.className = movesEl.className.replace(
        /text-(green|orange|red)-\d+/g,
        "",
      );

      if (this.gameState.moves < optimalMoves) {
        movesEl.classList.add("text-green-400");
      } else if (this.gameState.moves === optimalMoves) {
        movesEl.classList.add("text-orange-400");
      } else {
        movesEl.classList.add("text-red-400");
      }
    }

    // Update progress indicator
    const progressContainer = document.getElementById("progress-container");
    if (progressContainer) {
      const exerciseInfo = this.gameManager.getCurrentExerciseInfo();
      const progressBarFill = document.getElementById("progress-bar-fill");
      const progressPercentage = document.getElementById("progress-percentage");

      if (progressBarFill && progressPercentage) {
        // Update existing elements for smooth transitions
        const { progress, color1, color2 } = this.getProgressIndicator(
          this.gameState.current,
          exerciseInfo.exercise.goal,
        );

        progressBarFill.style.width = `${progress}%`;
        progressBarFill.style.background = `linear-gradient(to right, rgb(${color1}), rgb(${color2}))`;
        progressPercentage.textContent = `${progress}%`;
      } else {
        // Fallback: recreate if elements don't exist
        progressContainer.innerHTML = this.getProgressHTML(
          this.gameState.current,
          exerciseInfo.exercise.goal,
        );
      }
    }

    // Update operation preview text and button states
    const previews = this.getOperationPreviews(this.gameState.current);
    const isBlocked = this.gameState.moves >= this.gameState.moveLimit;

    document.querySelectorAll(".operation-btn").forEach((btn) => {
      const operation = btn.dataset.operation;
      const previewEl = btn.querySelector(".preview-text");

      // Update preview text and visibility
      if (previewEl) {
        previewEl.textContent = isBlocked
          ? translate("blocked")
          : previews[operation];
        if (this.showPreviews) {
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
        );
      } else {
        resetBtn.classList.remove(
          "ring-4",
          "ring-yellow-400",
          "ring-opacity-75",
          "animate-pulse",
          "bg-yellow-500/20",
        );
      }
    }

    // Update hint button text and state
    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) {
      const hintText = hintBtn.querySelector("span:last-child");
      if (hintText) {
        hintText.textContent = `${translate("hint")} (${this.gameState.hints.used}/${this.gameState.hints.maxHints})`;
      }

      // Update button styling based on hints remaining
      if (this.gameState.hints.used >= this.gameState.hints.maxHints) {
        hintBtn.className =
          "bg-gray-600 text-gray-400 cursor-not-allowed flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full";
        hintBtn.disabled = true;
      } else {
        hintBtn.className =
          "bg-amber-600 hover:bg-amber-500 flex items-center justify-center gap-1 font-bold transition-transform active:scale-95 h-full";
        hintBtn.disabled = false;
      }
    }

    // Update inline history
    const inlineHistoryContent = document.getElementById(
      "inline-history-content",
    );
    if (inlineHistoryContent) {
      inlineHistoryContent.innerHTML = this.renderInlineHistory();
      inlineHistoryContent.classList.remove("flex-wrap"); // Reset flex-wrap on update
    }

    // Check for win condition
    if (this.gameState.isComplete) {
      this.showSuccessModal();
    }
  }

  /**
   * Show success modal with enhanced celebration and exercise completion tracking
   */
  showSuccessModal() {
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
      const completionResult = this.gameManager.onExerciseComplete(
        this.gameState.moves,
        () => this.updateLevelSelectorUI(),
      );
      const exercise = this.gameManager.currentExercise;
      const actualEfficiency = completionResult.efficiency;
      const efficiency = Math.round(actualEfficiency * 100);
      const requiredEfficiency =
        this.gameManager.gameModeManager.getEfficiencyRequirement(
          this.gameManager.currentDifficulty,
        );

      // Update modal content
      finalMoves.textContent = this.gameState.moves;
      finalOptimal.textContent = exercise.optimalMoves;
      finalEfficiency.textContent = `${efficiency}%`;

      // Set grade-based content
      const gradeData = completionResult.grade;
      title.textContent = gradeData.grade;
      message.textContent = gradeData.description;
      emoji.innerHTML = gradeData.emoji;

      // Handle level unlock notification
      if (completionResult.levelUnlocked) {
        setTimeout(() => {
          this.showLevelUnlockNotification(completionResult.levelUnlocked);
        }, 1000); // Show after success modal appears
      }

      // Handle master achievement celebration
      if (completionResult.masterAchieved) {
        setTimeout(() => {
          this.showMasterAchievementModal();
        }, 2000); // Show after level unlock notification
      }

      const efficiencyNotMetMessage = t("gameModeMessages.efficiencyNotMet", {
        required: Math.round(requiredEfficiency * 100),
      });

      // Check for level progression
      if (difficultyChangeMessage && difficultyChangeText) {
        const levelChange = completionResult.levelChange;
        if (levelChange.isAvailable) {
          let levelText = t("levelProgression.advancedToLevel", {
            level: levelChange.nextDifficulty,
          });
          if (actualEfficiency < requiredEfficiency) {
            levelText = efficiencyNotMetMessage;
          }

          difficultyChangeText.textContent = levelText;
          difficultyChangeMessage.classList.remove("hidden");
        } else if (this.gameManager.currentDifficulty === 6) {
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
      if (nextExerciseBtn && this.gameManager.gameModeManager.isNormal()) {
        if (actualEfficiency < requiredEfficiency) {
          // Disable button and change appearance
          nextExerciseBtn.disabled = true;
          nextExerciseBtn.classList.remove(
            "bg-gradient-to-r",
            "from-purple-600",
            "to-purple-700",
            "hover:from-purple-700",
            "hover:to-purple-800",
            "transform",
            "hover:-translate-y-1",
            "shadow-lg",
            "hover:shadow-purple-500/30",
          );
          nextExerciseBtn.classList.add(
            "bg-gray-500",
            "cursor-not-allowed",
            "opacity-50",
          );
          nextExerciseBtn.title = efficiencyNotMetMessage;
        } else {
          // Ensure button is enabled (in case it was previously disabled)
          nextExerciseBtn.disabled = false;
          nextExerciseBtn.classList.remove(
            "bg-gray-500",
            "cursor-not-allowed",
            "opacity-50",
          );
          nextExerciseBtn.classList.add(
            "bg-gradient-to-r",
            "from-purple-600",
            "to-purple-700",
            "hover:from-purple-700",
            "hover:to-purple-800",
            "transform",
            "hover:-translate-y-1",
            "shadow-lg",
            "hover:shadow-purple-500/30",
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
      this.createConfettiExplosion();

      // Reduce number display height when success modal is shown
      const numberDisplay = document.getElementById("number-display");
      if (numberDisplay) {
        numberDisplay.classList.add("number-display-compact");
        numberDisplay.classList.remove("number-display-normal");
      }
    }
  }

  showLevelUnlockNotification(level) {
    const message = t("gameModeMessages.levelUnlocked", { level });

    // Create special celebration notification
    const notification = document.createElement("div");
    notification.className =
      "notification fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-4 shadow-2xl z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center";
    notification.style.minWidth = "280px";

    notification.innerHTML = `
      <div class="font-bold text-lg mb-1">${message}</div>
      <div class="text-sm opacity-90">${translate(`difficultyLevels.${getDifficultyLevels()[level - 1]?.nameKey}`)}</div>
    `;

    document.body.appendChild(notification);

    // Add celebration animation
    notification.style.animation = "celebrateBounce 0.6s ease-out";

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "scale(0.8) translate(-50%, -50%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  // === UI STATE SETTERS ===

  togglePreviews() {
    this.showPreviews = !this.showPreviews;
    this.updateDisplay();
  }

  // === RENDER MAIN UI ===

  start() {
    if (this.app) {
      this.app.innerHTML = this.createGameUI();
    }
  }

  render() {
    this.start();

    // Reapply dynamic scaling and other display updates after re-render
    this.updateDisplay();
  }
}
