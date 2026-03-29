/**
 * Tour Manager
 * Manages the first-time guided tour experience
 */

import { translate } from "./i18n.js";
import { doxinyConfig } from "./config.js";

export class TourManager {
  constructor(uiManager, gameManager, onNewExercise = null) {
    this.uiManager = uiManager;
    this.gameManager = gameManager;
    this.onNewExercise = onNewExercise; // Callback for generating new exercise

    // Tour state
    this.isActive = false;
    this.currentStep = 0;
    this.steps = this.initializeTourSteps();

    // DOM references
    this.overlay = null;
    this.tooltip = null;

    // Constants
    this.TOUR_FLAG = "doxiny_tour_completed";

    // Tour exercise: 1 -> 2 -> 21 -> 12 -> 3 (DOUBLE, APPEND1, REVERSE, SUM)
    this.tourSequence = [
      { operation: "double", from: 1, to: 2, expectedNext: "append1" },
      { operation: "append1", from: 2, to: 21, expectedNext: "reverse" },
      { operation: "reverse", from: 21, to: 12, expectedNext: "sumDigits" },
      { operation: "sumDigits", from: 12, to: 3, expectedNext: null },
    ];

    this.currentSequenceIndex = 0;
  }

  initializeTourSteps() {
    return [
      {
        id: "welcome",
        type: "modal",
        titleKey: "tour.welcome.title",
        messageKey: "tour.welcome.message",
        position: "center",
        showNext: true,
        showSkip: true,
      },
      {
        id: "objective",
        type: "modal",
        titleKey: "tour.objective.title",
        messageKey: "tour.objective.message",
        position: "center",
        showNext: true,
        showSkip: true,
      },
      {
        id: "currentNumber",
        type: "highlight",
        titleKey: "tour.currentNumber.title",
        messageKey: "tour.currentNumber.message",
        target: "#current-number",
        position: "bottom",
        showNext: true,
        showSkip: true,
      },
      {
        id: "firstOperation",
        type: "operation",
        titleKey: "tour.firstOperation.title",
        messageKey: "tour.firstOperation.message",
        target: '[data-operation="double"]',
        expectedOperation: "double",
        position: "top",
        showSkip: true,
      },
      {
        id: "secondOperation",
        type: "operation",
        titleKey: "tour.secondOperation.title",
        messageKey: "tour.secondOperation.message",
        target: '[data-operation="append1"]',
        expectedOperation: "append1",
        position: "top",
        showSkip: true,
      },
      {
        id: "thirdOperation",
        type: "operation",
        titleKey: "tour.thirdOperation.title",
        messageKey: "tour.thirdOperation.message",
        target: '[data-operation="reverse"]',
        expectedOperation: "reverse",
        position: "bottom",
        showSkip: true,
      },
      {
        id: "helpButtons",
        type: "highlight",
        titleKey: "tour.helpButtons.title",
        messageKey: "tour.helpButtons.message",
        target: '[data-purpose="utility-controls"]',
        position: "top",
        showNext: true,
        showSkip: true,
      },
      {
        id: "hintDemo",
        type: "hint",
        titleKey: "tour.hintDemo.title",
        messageKey: "tour.hintDemo.message",
        target: "#hint-btn",
        position: "top",
        showSkip: true,
      },
      {
        id: "hintResult",
        type: "operation",
        titleKey: "tour.hintResult.title",
        messageKey: "tour.hintResult.message",
        target: '[data-operation="sumDigits"]',
        expectedOperation: "sumDigits",
        position: "bottom",
        showSkip: true,
      },
      {
        id: "completion",
        type: "modal",
        titleKey: "tour.completion.title",
        messageKey: "tour.completion.message",
        position: "center",
        showPlay: true,
        showSkip: false,
      },
    ];
  }

  // Check if user has completed tour before (respects config)
  hasCompletedTour() {
    const config = doxinyConfig.get();
    
    // If tour is disabled globally, consider it \"completed\"
    if (!config.enableTour) {
      return true;
    }
    
    // If force show is enabled, always show tour
    if (config.forceShowTour) {
      return false;
    }
    
    // if query param tour is present in URL, treat as not completed for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("tour")) return false;

    return localStorage.getItem(this.TOUR_FLAG) === "true";
  }

  // Mark tour as completed
  markTourCompleted() {
    localStorage.setItem(this.TOUR_FLAG, "true");
  }

  // Start the tour
  startTour(loadCustomExercise = null) {
    if (this.isActive) return;

    console.log("🎪 Starting Doxiny guided tour");
    this.isActive = true;
    this.currentStep = 0;
    this.currentSequenceIndex = 0;

    // Set up tour-specific game state
    // this.setupTourGameState();
    if (loadCustomExercise) {
      loadCustomExercise(3);
    }

    // Block normal game interactions
    this.blockGameInteractions();

    // Start first step
    console.log("🎪 Showing tour step:", this.steps[this.currentStep].id);
    this.showStep(this.steps[this.currentStep]);
  }

  // Set up the tour game state with fixed values
  setupTourGameState() {
    // Override game state with tour values
    this.uiManager.gameState.current = 1;
    this.uiManager.gameState.goal = 3;
    this.uiManager.gameState.moves = 0;
    this.uiManager.gameState.moveLimit = 4;
    this.uiManager.gameState.history = [];
    this.uiManager.gameState.isComplete = false;

    // Update UI to reflect tour state
    this.uiManager.updateDisplay();
  }

  // Block all game interactions except tour-allowed ones
  blockGameInteractions() {
    // Add tour-blocking class to app
    document.body.classList.add("tour-active");

    // Store original event listeners state if needed
    this.originalEventState = true;
  }

  // Unblock game interactions
  unblockGameInteractions() {
    document.body.classList.remove("tour-active");
    this.originalEventState = false;
  }

  // Show a tour step
  showStep(step) {
    this.hideCurrentStep();

    switch (step.type) {
      case "modal":
        this.showModal(step);
        break;
      case "highlight":
        this.showHighlight(step);
        break;
      case "operation":
        this.showOperationGuide(step);
        break;
      case "hint":
        this.showHintGuide(step);
        break;
    }
  }

  // Hide current step elements
  hideCurrentStep() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    // restart style for all buttons
    document.querySelectorAll("button").forEach((btn) => {
      btn.style.pointerEvents = "";
      btn.style.opacity = "";
      btn.classList.remove("tour-highlight-pulse");
    });

    // restart style for hint button
    const hintBtn = document.querySelector("#hint-btn");
    if (hintBtn) {
      hintBtn.style.pointerEvents = "";
      hintBtn.style.opacity = "";
      hintBtn.classList.remove("tour-highlight-pulse");
    }
  }

  // Show modal step
  showModal(step) {
    this.overlay = this.createOverlay();

    const modal = document.createElement("div");
    modal.className =
      "tour-modal bg-white dark:bg-slate-800 p-4 mx-auto absolute bottom-60 left-0 w-full text-black dark:text-white rounded-lg shadow-lg max-w-md";

    modal.innerHTML = `
      <div class="text-center">
        <h2 class="text-xl font-bold mb-3">${translate(step.titleKey)}</h2>
        <p class="text-base mb-4">${translate(step.messageKey)}</p>
        <div class="flex gap-2 justify-center">
          ${step.showSkip ? `<button class="tour-btn tour-skip px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm">${translate("tour.skip")}</button>` : ""}
          ${step.showNext ? `<button class="tour-btn tour-next px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm">${translate("tour.next")}</button>` : ""}
          ${step.showPlay ? `<button class="tour-btn tour-play px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-lg font-bold">${translate("tour.play")}</button>` : ""}
        </div>
      </div>
    `;

    this.overlay.appendChild(modal);
    document.body.appendChild(this.overlay);
  }

  // Show highlight step
  showHighlight(step) {
    const target = document.querySelector(step.target);
    if (!target) return;

    this.overlay = this.createOverlay();
    this.highlightElement(target);

    this.tooltip = this.createTooltip(step, target);
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.tooltip);
  }

  // Show operation guide step
  showOperationGuide(step) {
    const target = document.querySelector(step.target);
    if (!target) return;

    this.overlay = this.createOverlay();
    this.highlightElement(target);

    // Enable only the expected operation button
    this.enableOnlyOperation(step.expectedOperation);

    this.tooltip = this.createTooltip(step, target);
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.tooltip);
  }

  // Show hint guide step
  showHintGuide(step) {
    const target = document.querySelector(step.target);
    if (!target) return;

    this.overlay = this.createOverlay();
    this.highlightElement(target);

    // Enable only the hint button
    this.enableOnlyHint();

    this.tooltip = this.createTooltip(step, target);
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.tooltip);
  }

  // Create overlay
  createOverlay() {
    const overlay = document.createElement("div");
    overlay.className =
      "tour-overlay fixed inset-0 bg-black bg-opacity-50 z-50";
    return overlay;
  }

  // Highlight an element
  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement("div");
    highlight.className = "tour-highlight";
    highlight.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      z-index: 51;
      pointer-events: none;
    `;
    this.overlay.appendChild(highlight);
  }

  // Create tooltip
  createTooltip(step, target) {
    const rect = target.getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.className =
      "tour-tooltip bg-white dark:bg-slate-800 p-3 shadow-lg max-w-xs text-black dark:text-white z-52 fixed";

    tooltip.innerHTML = `
      <h3 class="font-bold mb-2 text-sm">${translate(step.titleKey)}</h3>
      <p class="mb-3 text-sm">${translate(step.messageKey)}</p>
      <div class="flex gap-2">
        ${step.showSkip ? `<button class="tour-btn tour-skip px-2 py-1 bg-gray-500 text-white hover:bg-gray-600 transition-colors text-xs">${translate("tour.skip")}</button>` : ""}
        ${step.showNext ? `<button class="tour-btn tour-next px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs">${translate("tour.next")}</button>` : ""}
      </div>
    `;

    // Position tooltip
    this.positionTooltip(tooltip, rect, step.position);

    return tooltip;
  }

  // Position tooltip relative to target
  positionTooltip(tooltip, targetRect, position) {
    const spacing = 10;

    switch (position) {
      case "top":
        tooltip.style.left = `${(targetRect.left + targetRect.width / 2) / 2}px`;
        tooltip.style.top = `${targetRect.top - spacing}px`;
        tooltip.style.transform = "translateY(-100%)";
        break;
      case "bottom":
        tooltip.style.left = `${(targetRect.left + targetRect.width / 2) / 2}px`;
        tooltip.style.top = `${targetRect.bottom + spacing}px`;
        tooltip.style.transform = "translateY(0)";
        break;
      default: // center
        tooltip.style.left = "50%";
        tooltip.style.top = "50%";
        tooltip.style.transform = "translate(-50%, -50%)";
    }
  }

  // Enable only specific operation button
  enableOnlyOperation(operation) {
    // Disable all operation buttons
    document.querySelectorAll("[data-operation]").forEach((btn) => {
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.3";
    });

    // Enable only the expected one
    const targetBtn = document.querySelector(`[data-operation="${operation}"]`);
    if (targetBtn) {
      targetBtn.style.pointerEvents = "auto";
      targetBtn.style.opacity = "1";
      targetBtn.classList.add("tour-highlight-pulse");
    }

    // set pointer none to tour overlay
    if (this.overlay) {
      this.overlay.style.pointerEvents = "none";
    }
  }

  // Enable only hint button
  enableOnlyHint() {
    // Disable all buttons except hint
    document.querySelectorAll("button:not(#hint-btn)").forEach((btn) => {
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.3";
    });

    // Enable hint button
    const hintBtn = document.querySelector("#hint-btn");
    if (hintBtn) {
      hintBtn.style.pointerEvents = "auto";
      hintBtn.style.opacity = "1";
      hintBtn.classList.add("tour-highlight-pulse");
    }

    // set pointer none to tour overlay
    if (this.overlay) {
      this.overlay.style.pointerEvents = "none";
    }
  }

  // Handle tour button clicks
  handleTourClick(event) {
    if (!this.isActive) return false;

    const target = event.target;

    // Handle tour control buttons
    if (target.classList.contains("tour-next")) {
      this.nextStep();
      return true;
    }

    if (target.classList.contains("tour-skip")) {
      this.skipTour();
      return true;
    }

    if (target.classList.contains("tour-play")) {
      this.completeTour();
      return true;
    }

    // Handle expected operation clicks
    if (target.hasAttribute("data-operation")) {
      const operation = target.getAttribute("data-operation");
      return this.handleOperationClick(operation);
    }

    // Handle hint button click
    if (target.id === "hint-btn") {
      return this.handleHintClick();
    }

    // Block all other clicks during tour
    return this.isActive;
  }

  // Handle operation clicks during tour
  handleOperationClick(operation) {
    const currentStep = this.steps[this.currentStep];

    if (
      currentStep.type === "operation" &&
      currentStep.expectedOperation === operation
    ) {
      // Correct operation clicked
      const sequenceStep = this.tourSequence[this.currentSequenceIndex];

      if (sequenceStep && sequenceStep.operation === operation) {
        // Apply the operation to game state
        this.uiManager.gameState.current = sequenceStep.to;
        this.uiManager.gameState.moves++;
        this.uiManager.gameState.history.push({
          action: operation,
          value: sequenceStep.to,
        });

        this.currentSequenceIndex++;
        this.uiManager.updateDisplay();

        // Check if game is complete
        if (
          this.uiManager.gameState.current === this.uiManager.gameState.goal
        ) {
          // Skip to completion step
          this.currentStep = this.steps.length - 1;
          this.showStep(this.steps[this.currentStep]);
        } else {
          // Move to next tour step
          this.nextStep();
        }

        return true;
      }
    }

    return false;
  }

  // Handle hint clicks during tour
  handleHintClick() {
    const currentStep = this.steps[this.currentStep];

    if (currentStep.id === "hintDemo") {
      // Show a direct hint for the final operation
      this.showDirectHint();
      this.nextStep();
      return true;
    }

    return false;
  }

  // Show direct hint (highlight the sum digits button)
  showDirectHint() {
    const sumBtn = document.querySelector('[data-operation="sumDigits"]');
    if (sumBtn) {
      sumBtn.classList.add("hint-blink");
      setTimeout(() => {
        sumBtn.classList.remove("hint-blink");
      }, 3000);
    }
  }

  // Move to next step
  nextStep() {
    this.currentStep++;

    if (this.currentStep >= this.steps.length) {
      this.completeTour();
      return;
    }

    this.showStep(this.steps[this.currentStep]);
  }

  // Skip tour
  skipTour() {
    this.markTourCompleted();
    this.endTour();
  }

  // Complete tour successfully
  completeTour() {
    this.markTourCompleted();
    this.endTour();
  }

  // End tour and return to normal game
  endTour() {
    console.log("🎪 Ending tour, generating new exercise");
    this.isActive = false;
    this.hideCurrentStep();
    this.unblockGameInteractions();

    // Clean up any tour-specific styling
    document.querySelectorAll(".tour-highlight-pulse").forEach((el) => {
      el.classList.remove("tour-highlight-pulse");
      el.style.pointerEvents = "";
      el.style.opacity = "";
    });

    // Generate new normal exercise with proper game state reset
    if (this.onNewExercise) {
      this.onNewExercise(); // Use callback for proper game reset
    } else {
      // Fallback to basic exercise generation
      this.gameManager.generateNewExercise();
      this.uiManager.updateDisplay();
    }
  }
}
