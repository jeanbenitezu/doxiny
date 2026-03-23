# Doxiny - Architecture & Code Structure
*Last Updated: March 23, 2026*

## Tech Stack
- **Frontend**: Vanilla JS (ES6+), Vite build system
- **Styling**: Tailwind CSS v3 (CDN), custom CSS variables, gold accent system
- **Sharing**: HTML5 Web Share API with progressive fallbacks
- **Persistence**: localStorage for game mode, progression, and master status
- **Deployment**: Surge.sh for previews, GitHub Pages for production

## File Structure & Responsibilities

### Core Game Files
- **`src/main.js`** - Game manager, GameModeManager class, UI orchestration, mastery system, main game loop
- **`src/game.js`** - Game state management, move history, state transitions
- **`src/operations.js`** - Pure functions for 4 number operations (REVERSE, SUM, APPEND, DOUBLE)
- **`src/exerciseGenerator.js`** - BFS-based exercise generation and solvability validation
- **`src/sharing.js`** - Progressive enhancement sharing system with Web Share API
- **`src/i18n.js`** - Bilingual support system (EN/ES) with sharing messages and master status translations
- **`src/style.css`** - Custom styles, animations, responsive design, gold accent system for masters

### Configuration Files
- **`vite.config.js`** - Build configuration
- **`package.json`** - Dependencies, scripts

## Architecture Patterns

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
function validateExercise(goal, maxMoves = DEFAULT_MAX_MOVES) {
  // Dynamic move calculation: Math.min(25, Math.max(15, Math.floor(Math.log10(goal)) * 8))
  // 1. Quick patterns (powers of 2, single digits)
  // 2. Enhanced BFS with better pruning (Map-based visited tracking)
  // 3. Strategic approaches (reverse search, digit manipulation)
  // 4. Expanded search space (1 to 100,000)
  // Returns: { solvable, minMoves, solutionPath }
}
```

### Mastery Achievement System Architecture
```javascript
// GameModeManager class - Dual mode system with mastery tracking
class GameModeManager {
  modes: { NORMAL: 'normal', FREEPLAY: 'freeplay' }
  currentMode: localStorage persistence
  unlockedLevels: array of completed levels
  
  // Master status tracking
  isMaster(): boolean // localStorage-backed
  setMasterStatus(boolean): void
  checkAndAwardMasterStatus(): boolean // Achievement detection
  
  // Progression requirements
  getEfficiencyRequirement(level): 0.80 (levels 1-3) | 0.90 (levels 4-6)
  canCreateCustomExercases(): requires FREEPLAY + master status
}

// UI Integration
- Master crown indicator (👑) with glow animation
- Conditional button rendering (Next Level → Show Journey)
- Achievement celebration modals with gold styling
- Journey statistics display with progress tracking
```

### localStorage Persistence Schema
```javascript
// Game mode and progression state
"doxiny-gamemode": "normal" | "freeplay"
"doxiny-unlocked-levels": [1, 2, 3, 4, 5, 6] // Array of completed levels
"doxiny-master-status": "true" | null // Master achievement status
"doxiny-language": "en" | "es"

// Player statistics (persistent across sessions)
"doxiny-player-stats": {
  exercisesCompleted: number,    // Total puzzles solved
  totalMoves: number,           // Cumulative moves across all exercises
  perfectSolutions: number,     // Count of optimal solutions achieved  
  recentPerformance: [          // Last 5 exercise performance data
    {moves, optimal, efficiency, isPerfect}, ...
  ]
}
```

### Component-based UI Updates
- Each UI section has dedicated update functions
- State changes trigger specific UI updates
- Animation states managed via CSS classes

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

Last Updated: March 23, 2026