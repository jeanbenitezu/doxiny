# Doxiny - Architecture & Code Structure

*Last Updated: March 28, 2026 - UI MANAGEMENT REFACTORING: Created UIManager class for unified visual responsibilities*

## Tech Stack
- **Frontend**: Vanilla JS (ES6+), Vite build system
- **Styling**: Tailwind CSS v3 (CDN), custom CSS variables, gold accent system
- **Sharing**: HTML5 Web Share API with progressive fallbacks
- **Persistence**: localStorage for game mode, progression, and master status
- **Deployment**: Surge.sh for previews, GitHub Pages for production

## File Structure & Responsibilities

### Core Game Files
- **`src/main.js`** - Game logic coordination, event handling, initialization (refactored: UI moved to UIManager)
- **`src/UIManager.js`** - **NEW**: Unified UI management class for all visual responsibilities and DOM operations
- **`src/GameModeManager.js`** - Game mode management, level progression, mastery system, progression tracking  
- **`src/GameManager.js`** - Exercise generation coordination, completion logic, performance grading system
- **`src/game.js`** - Game state management, move history, state transitions
- **`src/operations.js`** - Pure functions for 4 number operations (REVERSE, SUMDIGITS, APPEND, DOUBLE)
- **`src/exerciseGenerator.js`** - BFS-based exercise generation and solvability validation
- **`src/gameHelpers.js`** - Configurable hint system and progress calculation utilities
- **`src/pathfinding.js`** - Unified pathfinding engine and shared utilities
- **`src/config.js`** - Global configuration management with preset system
- **`src/sharing.js`** - Progressive enhancement sharing system with Web Share API
- **`src/i18n.js`** - Bilingual support system (EN/ES) with sharing messages and master status translations
- **`src/style.css`** - Custom styles, animated game mode backgrounds, mode transitions, responsive design, gold accent system for masters

### Configuration Files
- **`vite.config.js`** - Build configuration
- **`package.json`** - Dependencies, scripts

## Architecture Patterns

### Class Refactoring (March 28, 2026)
**Extracted large classes from main.js for better maintainability and separation of concerns.**

```javascript
// Before: Classes defined in main.js
// After: Separate modules with clean imports

// GameModeManager.js - Handles game modes and progression
export class GameModeManager {
  constructor() { /* ... */ }
  isLevelUnlocked(level) { /* ... */ }
  checkAndAwardMasterStatus() { /* ... */ }
}

// GameManager.js - Handles exercise logic and completion
export class GameManager {
  constructor() { 
    this.gameModeManager = new GameModeManager(); 
  }
  onExerciseComplete(moves, updateLevelSelectorUI) { /* ... */ }
  getPerformanceGrade(efficiency) { /* ... */ }
}
```

**Refactoring Benefits:**
- **Better Organization**: Classes now have dedicated files with clear responsibilities
- **Improved Maintainability**: Easier to find and modify specific functionality
- **Cleaner Imports**: Clear dependency management between modules
- **Reduced Main.js Size**: Moved ~330 lines of class code to separate files
- **Enhanced Testability**: Classes can be tested in isolation

**Migration Details:**
- `GameModeManager` class (155 lines) → `src/GameModeManager.js`
- `GameManager` class (174 lines) → `src/GameManager.js`  
- Updated imports in main.js to use new modules
- Fixed dependency injection for `updateLevelSelectorUI` function

### UI Management Unification (March 28, 2026)
**Created unified UIManager class to consolidate all visual responsibilities and eliminate scattered UI logic.**

```javascript
// UIManager.js - Unified UI management class
export class UIManager {
  constructor(gameManager, gameState) {
    this.gameManager = gameManager;
    this.gameState = gameState;
    this.showPreviews = true;
    this.app = document.querySelector("#app");
  }

  // Consolidated UI methods
  render() { /* createGameUI functionality */ }
  updateDisplay() { /* all display updates */ }
  updateLevelSelectorUI() { /* level selector updates */ }
  renderInlineHistory() { /* history rendering */ }
  showMasterAchievementModal() { /* modal management */ }
  createConfettiExplosion() { /* visual effects */ }
  scrollToTop() { /* utility methods */ }
}

// Updated main.js usage
const uiManager = new UIManager(gameManager, gameState);
uiManager.render();           // instead of createGameUI()
uiManager.updateDisplay();    // instead of updateDisplay()
uiManager.togglePreviews();   // instead of showPreviews manipulation
```

**UI Unification Benefits:**
- **Single Responsibility**: All visual logic consolidated in one class
- **Reduced Bundle Size**: Eliminated ~19KB of redundant UI code (82KB → 63KB)
- **Better State Management**: UI state (showPreviews, etc.) encapsulated in class
- **Cleaner main.js**: Focused on game logic coordinatio and event handling only
- **Consistent UI Interface**: Standardized method names and calling patterns
- **Easier Testing**: UI logic can be tested in isolation

### Unified Pathfinding System
```javascript
// src/pathfinding.js - Centralized pathfinding engine
export function enhancedBFS(start, goal, options = {}) {
  // Configurable BFS supporting both return formats:
  // - "path": Returns array of operations (for hints)
  // - "result": Returns solution objects with metadata (for validation)
  const { returnFormat = "path", lazy = true, maxMoves = 25 } = options;
  
  // Unified algorithm with format-specific optimizations
}

// Shared utilities (previously duplicated)
export function findDirectPath(from, to) { /* 15 lines */ }
export function findReverseTargets(goal) { /* 50 lines */ }

// PathfindingResult wrapper for format consistency
export class PathfindingResult { /* Unified result API */ }
```

**Benefits**:
- **65+ lines of duplicate code eliminated** (`findDirectPath` + `findReverseTargets` deduplicated)
- **Consistent solution finding** between hint generation and exercise validation
- **Configurable return formats** support both raw paths and metadata-rich results
- **Single source of truth** for pathfinding logic ensures correctness
- **Performance optimizations** shared across all pathfinding operations

### Helper System Features
- **3-Level Hint Guidance**: Strategic (general direction), Tactical (specific guidance), Direct (exact move)
- **Configurable Hint Types**: Individual control via doxinyConfig (enableStrategicHints, enableTacticalHints, enableDirectHints)
- **Dynamic Progress Tracking**: Real-time progress calculation for UI feedback
- **Pathfinding Integration**: Uses BFS to find optimal paths for accurate hints and progress
- **Preset Configurations**: Beginner (all hints), Expert (strategic only), and custom configurations
- **Fallback System**: Graceful degradation when pathfinding fails
- **Localization Support**: All hint messages use i18n translation system

**File Restructuring**:
- **Function Migration**: `calculateProgressToTarget` moved to gameHelpers.js from exerciseGenerator.js
- **Clean Dependencies**: gameHelpers.js imports its own dependencies (i18n, operations, config)
- **Backward Compatibility**: exerciseGenerator.js imports and re-exports both functions
- **Better Naming**: File name reflects broader scope of game assistance functions

### Global Configuration System
```javascript
// DoxinyConfig class - Centralized configuration management
class DoxinyConfig {
  config = {
    // Hint system configuration - individual enable/disable control
    enableStrategicHints: true,    // General direction and analysis
    enableTacticalHints: true,     // Specific operation suggestions  
    enableDirectHints: true,       // Exact button recommendations
    
    // BFS Algorithm configuration
    maxSearchDepth: 25,
    timeoutMs: 5000,
    searchStrategy: 'comprehensive'
  }
  
  // Preset system for common scenarios
  setPreset(name) {
    const presets = {
      beginner: { enableStrategicHints: true, enableTacticalHints: true, enableDirectHints: true },
      expert: { enableStrategicHints: true, enableTacticalHints: false, enableDirectHints: false }
    };
    Object.assign(this.config, presets[name] || {});
  }
}
```

### Animated Game Mode Background System
```css
/* Dynamic backgrounds for visual mode distinction */
.game-mode-normal {
  background: radial-gradient + linear-gradient with 8s animation;
  /* Focused, goal-oriented visual theme */
}

.game-mode-freeplay {
  background: multi-layer radial-gradients + linear-gradient with 10s animation;
  /* Creative, open-ended visual theme */
}
```

### Mode Transition JavaScript Architecture
```javascript
// Coordinated mode switching with visual feedback
function handleGameModeChange(mode) {
  showModeTransitionEffect();        // Visual transition overlay
  gameManager.gameModeManager.setGameMode(mode);
  applyGameModeBackground(mode);     // CSS class management
  updateModeIndicator(mode);         // UI state synchronization
  handleDifficultySelect(newDifficulty); // Game state update
}

// CSS class management for backgrounds
function applyGameModeBackground(mode) {
  document.body.classList.remove('game-mode-normal', 'game-mode-freeplay');
  document.body.classList.add(`game-mode-${mode}`);
}
```

### Enhanced Mode Indicator System
```javascript
// Mode-specific button styling and animations
.btn-mode-normal {
  background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
}

.btn-mode-freeplay {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
}
```

### Progressive Enhancement Sharing System
```javascript
// Mobile-first sharing with fallbacks in main.js
async function shareContent(message, title) {
  // 1. Try Web Share API (native mobile sharing)
  // 2. Fallback to Clipboard API
  // 3. Final fallback to document.execCommand (legacy browsers)
}
```

### URL Parameter Routing
```javascript
// URL structure for shared puzzles
// ?puzzle=128&difficulty=3&challenge_moves=5&solved=1
function handleSharedPuzzleURL() {
  // Parse URL parameters
  // Show notification UI
  // Load shared puzzle state
  // Clear URL to avoid re-triggering
}
```

### Game State Management
```javascript
// Immutable state updates in game.js
const gameState = {
  currentNumber: 1,
  targetNumber: 128,
  moves: [],
  isComplete: false
};
```

### Pure Function Operations
```javascript
// All operations are pure functions in operations.js
const reverse = (num) => parseInt(num.toString().split('').reverse().join('')) || 0;
```

### Enhanced BFS Exercise Validation
```javascript
// Multi-stage validation with strategic approaches
function validateExercise(goal, maxMoves) {
  // Dynamic move calculation: Math.min(25, Math.max(15, Math.floor(Math.log10(goal)) * 8))
  // 1. Quick patterns (powers of 2, single digits)
  // 2. Enhanced BFS with better pruning (Map-based visited tracking)
  // 3. Strategic approaches (reverse search, digit manipulation)
  // 4. Expanded search space (1 to 100,000)
  // Returns: { solvable, minMoves, solutionPath }
}
```

### Simplified Mastery Achievement System Architecture
```javascript
// GameModeManager class - Dual mode system with basic mastery tracking
class GameModeManager {
  modes: { NORMAL: 'normal', FREEPLAY: 'freeplay' }
  currentMode: localStorage persistence
  unlockedLevels: array of completed levels
  
  // Master status tracking (simplified)
  isMaster(): boolean // localStorage-backed
  setMasterStatus(boolean): void
  checkAndAwardMasterStatus(): boolean // Achievement detection
  
  // Progression requirements
  getEfficiencyRequirement(level): 0.80
  canCreateCustomExercases(): requires FREEPLAY + master status
}

// UI Integration
- Master crown indicator (👑) with completion counter badge
- Simple Next Exercise button for all scenarios
- Achievement celebration modal with gold styling
- Replayable progression with automatic level reset
```

### localStorage Persistence Schema
```javascript
// Game mode and progression state
"doxiny-gamemode": "normal" | "freeplay"
"doxiny-unlocked-levels": [1, 2, 3, 4, 5, 6] // Array of completed levels
"doxiny-master-status": "true" | null // Master achievement status
"doxiny-completion-count": "1" | "2" | ... | "15" // Master completions counter
"doxiny-language": "en" | "es"

// Levels auto-reset to [1] upon each mastery achievement
```

### Component-based UI Updates
- Each UI section has dedicated update functions
- State changes trigger specific UI updates  
- Animation states managed via CSS classes
- **Modular Component System:
  - `renderLevelSelectorUI()` - Generates level selector HTML with current state
  - `updateLevelSelectorUI()` - Updates just the level selector without full page re-render
  - **Benefits**: Improved performance, immediate visual feedback, better code organization
- **State Synchronization**:
  - Fixed game state desync when switching from Freeplay to Normal mode
  - Ensures proper exercise completion detection across mode changes

## Code Quality Standards
- ES6+ features preferred (modules, arrow functions, destructuring)
- Pure functions for game logic
- Immutable state patterns
- Mobile-first responsive design
- Performance-optimized animations with `prefers-reduced-motion` support

## Build & Deployment
- **Development**: `npm run dev` - Vite dev server
- **Build**: `npm run build` - Production build
- **Production**: Manual GitHub Pages deployment

## Dependencies
- **No runtime dependencies** - Pure vanilla JS
- **Build tools**: Vite for bundling, development server
- **Styling**: Tailwind CSS via CDN (no build step needed)
