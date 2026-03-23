# Doxiny - Architecture & Code Structure
*Last Updated: March 22, 2026*

## Tech Stack
- **Frontend**: Vanilla JS (ES6+), Vite build system
- **Styling**: Tailwind CSS v3 (CDN), custom CSS variables
- **Sharing**: HTML5 Web Share API with progressive fallbacks
- **Deployment**: Surge.sh for previews, GitHub Pages for production

## File Structure & Responsibilities

### Core Game Files
- **`src/main.js`** - Game manager, UI orchestration, main game loop
- **`src/game.js`** - Game state management, move history, state transitions
- **`src/operations.js`** - Pure functions for 4 number operations (REVERSE, SUM, APPEND, DOUBLE)
- **`src/exerciseGenerator.js`** - BFS-based exercise generation and solvability validation
- **`src/sharing.js`** - Progressive enhancement sharing system with Web Share API
- **`src/i18n.js`** - Bilingual support system (EN/ES) with sharing messages
- **`src/style.css`** - Custom styles, animations, responsive design

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

Last Updated: March 21, 2026