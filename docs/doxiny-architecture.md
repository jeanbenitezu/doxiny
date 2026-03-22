# Doxiny - Architecture & Code Structure

## Tech Stack
- **Frontend**: Vanilla JS (ES6+), Vite build system
- **Styling**: Tailwind CSS v3 (CDN), custom CSS variables
- **PWA**: Manifest + Service Worker for offline capability
- **Deployment**: Surge.sh for previews, GitHub Pages for production

## File Structure & Responsibilities

### Core Game Files
- **`src/main.js`** - Game manager, UI orchestration, main game loop
- **`src/game.js`** - Game state management, move history, state transitions
- **`src/operations.js`** - Pure functions for 4 number operations (REVERSE, SUM, APPEND, DOUBLE)
- **`src/exerciseGenerator.js`** - BFS-based exercise generation and solvability validation
- **`src/i18n.js`** - Multi-language support system (5 languages)
- **`src/style.css`** - Custom styles, animations, responsive design

### Configuration Files
- **`vite.config.js`** - Build configuration, PWA settings
- **`package.json`** - Dependencies, scripts, PWA metadata
- **`public/manifest.json`** - PWA manifest with branding
- **`public/sw.js`** - Service worker for offline functionality

## Architecture Patterns

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

### BFS Exercise Validation
```javascript
// Breadth-first search ensures all exercises are solvable
function validateExercise(goal, maxMoves = 20) {
  // BFS implementation with visited set and move tracking
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
- **Build**: `npm run build` - Production build with PWA features
- **Preview**: `npm run deploy:preview` - Deploy to surge.sh
- **Production**: Manual GitHub Pages deployment

## Dependencies
- **No runtime dependencies** - Pure vanilla JS
- **Build tools**: Vite for bundling, development server
- **Styling**: Tailwind CSS via CDN (no build step needed)

Last Updated: March 21, 2026