/**
 * Game Mode Management
 * Handles game modes (Normal/Freeplay), level progression, and mastery system
 */

export class GameModeManager {
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
