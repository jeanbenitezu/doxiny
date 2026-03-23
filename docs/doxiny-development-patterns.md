# Doxiny - Development Patterns & Best Practices
*Last Updated: March 23, 2026*

## Code Organization Principles

### Pure Function Operations
All game operations are implemented as pure functions:
```javascript
// operations.js - No side effects, predictable outputs
const reverse = (num) => parseInt(num.toString().split('').reverse().join('')) || 0;
const sumDigits = (num) => num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
const appendOne = (num) => parseInt(num.toString() + '1');
const double = (num) => num * 2;
```

### Immutable State Management
Game state updates create new objects rather than mutating existing ones:
```javascript
// game.js - State transitions with smart hint handling
function applyMove(gameState, operation, operationName) {
  const newCurrentNumber = operation(gameState.currentNumber);
  return {
    ...gameState,
    currentNumber: newCurrentNumber,
    moves: [...gameState.moves, { operation: operationName, from: gameState.currentNumber, to: newCurrentNumber }],
    isComplete: newCurrentNumber === gameState.targetNumber,
    // Keep hint progression but clear cached hints for current number
    hints: {
      ...gameState.hints,
      hintsData: [] // Clear old hints since optimal path changed, but keep 'used' counter
    }
  };
}
```

### Modular Sharing System Architecture
Progressive enhancement sharing with dedicated module separation:
```javascript
// src/sharing.js - Dedicated sharing module with all functionality
export async function shareContent(message, title) {
  // Web Share API with progressive fallbacks
}
export function generateShareMessage(goal, moves, efficiency) {
  // Gamified messages based on performance
}
export function handleSharedPuzzleURL(gameManager, resetGame, renderCallback) {
  // URL parameter routing with state management
}

// src/main.js - Import and coordinate sharing actions
import { handleShareVictory, handleShareChallenge } from "./sharing.js";

// Event handlers pass required state as parameters
handleShareVictory(gameState, gameManager);
```

### Progressive Enhancement Sharing System
Mobile-first sharing with Web Share API fallbacks:
```javascript
// main.js - Progressive sharing functionality
async function shareContent(message, title = "Doxiny Number Puzzle") {
  try {
    // Try Web Share API first (mobile-friendly)
    if (navigator.share && navigator.canShare) {
      await navigator.share({ title, text: message, url: "" });
      return { success: true, method: 'native' };
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(message);
      return { success: true, method: 'clipboard' };
    }
  } catch (error) {
    // Final fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success: true, method: 'fallback' };
  }
}
```

### Component-Based UI Updates
Each UI section has dedicated update functions:
```javascript
// main.js - Modular UI updates
function updateCurrentNumber(number) { /* Updates #current-number display */ }
function updateProgressBar(progress) { /* Updates progress visualization */ }
function updateOperationButtons(gameState) { /* Updates button states and previews */ }
function updateGameHistory(moves) { /* Updates move history display */ }
```

## UI/UX Patterns

### Sharing Button Placement Strategy
- **Success Modal**: Share victory with performance stats
- **Main Game**: Share puzzle invitation from unsolved state
- **Multi-tier Layout**: Primary actions + secondary sharing actions

```javascript
// Success modal sharing buttons layout
<div class="flex flex-col gap-3 justify-center">
  <!-- Main action buttons -->
  <div class="flex gap-4 justify-center">
    <button id="next-exercise-btn">Next Level 🎯</button>
    <button id="retry-exercise-btn">Retry</button>
  </div>
  <!-- Share buttons row -->
  <div class="flex gap-2 justify-center">
    <button id="share-victory-btn">Share Victory 🏆</button>
    <button id="share-challenge-btn">Challenge Friends 💪</button>
  </div>
</div>
```

### Gamified Messaging System
Performance-based sharing messages with competitive elements:
```javascript
// Gamified sharing messages based on performance
function generateShareMessage(goal, moves, efficiency, isPerfect, solved = true) {
  if (isPerfect) {
    return t("sharing.perfectVictoryMessage", { goal, moves });
  } else if (efficiency >= 80) {
    return t("sharing.victoryMessage", { goal, moves, efficiency });
  } else {
    return t("sharing.challengeMessage", { goal, moves });
  }
}
```

### URL Parameter Routing for Shared Content
```javascript  
// URL structure: ?puzzle=128&challenge_moves=5&solved=1
function generateShareURL(goal, moves = null, solved = false) {
  const baseURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams();
  
  params.set('puzzle', goal.toString());
  if (moves && solved) params.set('challenge_moves', moves.toString());
  if (solved) params.set('solved', '1');
  
  return `${baseURL}?${params.toString()}`;
}
```

### Internationalization (i18n)
All UI text must use the translation system for Spanish/English support:
```javascript
// ✅ Correct - Using translate function
<span>{translate("targetNumber")}</span>
<button>{translate("gameStates.reset")}</button>

// ❌ Incorrect - Hardcoded strings
<span>Target Number</span>
<button>Reset</button>

// Adding new translations
// In i18n.js:
newUIText: {
  en: "English Text",
  es: "Texto en Español",
}
```

### Mobile-First Responsive Design
```css
/* Base styles for mobile screens */
.operation-button {
  @apply w-full h-16 text-lg font-semibold rounded-lg transition-all duration-200;
}

/* Desktop enhancements */
@media (min-width: 640px) {
  .operation-button {
    @apply hover:scale-105 hover:shadow-lg;
  }
}
```

### Animation & Accessibility
```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, .celebration-emoji {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Real-time Feedback Systems
- **Operation Previews**: Show result before clicking (e.g., "123 → 321")
- **Progress Color Coding**: Green/orange/red based on efficiency
- **Immediate Validation**: Disable invalid operations, show why

### Event Delegation Pattern (March 2026)
**REQUIRED PATTERN**: Use event delegation for all dynamic modals and UI components instead of inline onclick handlers.

```javascript
// ✅ Preferred: Event delegation pattern
document.addEventListener('click', (e) => {
  if (e.target.closest('#show-journey-btn')) {
    showJourneyModal();
  } else if (e.target.closest('#reset-stats-btn')) {
    resetPlayerStats();
    updateUI();
  }
});

// ❌ Avoid: Inline onclick handlers
button.onclick = () => showJourneyModal(); // Creates global function requirements
modal.innerHTML = `<button onclick="resetStats()">Reset</button>`; // Requires global exposure
```

**Benefits:**
- No global function pollution 
- Consistent across all components
- Handles dynamically created elements
- Better encapsulation and maintainability

### localStorage Persistence Patterns (March 2026)
**Player Statistics Persistence**: All game progress must persist across browser sessions.

```javascript
// Complete persistence pattern with error handling
loadPlayerStats() {
  try {
    const saved = localStorage.getItem('doxiny-player-stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to handle missing properties
      return { ...this.getDefaultStats(), ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load player stats:', error);
  }
  return this.getDefaultStats(); // Safe fallback
}

savePlayerStats() {
  try {
    localStorage.setItem('doxiny-player-stats', JSON.stringify(this.playerStats));
  } catch (error) {
    console.warn('Failed to save player stats:', error);
  }
}

// Auto-save after every exercise completion
onExerciseComplete() {
  this.updatePlayerStats(/* ... */);
  this.savePlayerStats(); // Ensure persistence
  // ... rest of completion logic
}
```

### Modal Event Handling Improvements (March 2026)
**Click-outside-to-close Pattern**: Use addEventListener instead of direct onclick assignment.

```javascript
// ✅ Preferred: Event listener approach 
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  
  // Clean event handling with proper cleanup
  const handleClickOutside = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.removeEventListener('click', handleClickOutside);
    }
  };
  
  document.addEventListener('click', handleClickOutside);
}

// ❌ Avoid: Direct onclick assignment
modal.onclick = (e) => { /* ... */ }; // Less clean, harder to debug
```

## Error Handling Patterns

### Graceful Fallbacks
```javascript
// exerciseGenerator.js - Multi-layer fallback system
function generateExercise(difficulty) {
  try {
    // 1. Try primary generation (25 attempts)
    const exercise = generateSimpleExercise(difficulty);
    if (exercise) return exercise;
    
    // 2. Fall back to pre-validated goals
    return generateFallbackExercise(difficulty);
  } catch (error) {
    // 3. Emergency fallback to basic exercise
    console.error('Exercise generation failed:', error);
    return { goal: 10, optimalMoves: 4, solutionPath: [] };
  }
}
```

### Input Validation
```javascript
// Consistent validation across all numeric inputs
function validateNumber(input, min = 1, max = 10000) {
  const num = parseInt(input);
  return !isNaN(num) && num >= min && num <= max;
}
```

## Performance Optimization

### Debounced Operations
```javascript
// Prevent excessive calculations during user input
const debouncedValidation = debounce((value) => {
  if (validateNumber(value)) {
    const result = validateExercise(parseInt(value));
    updateValidationUI(result);
  }
}, 300);
```

### Memory Management
```javascript
// BFS with controlled memory usage
function validateExercise(goal, maxMoves = 20) {
  const visited = new Set([1]);
  // Limit: max 1,000 explored states to prevent memory explosion
  if (visited.size > 1000) break;
}
```

## Internationalization Patterns

### Icon-First Design
Reduce translation needs with universal symbols:
```javascript
const operationLabels = {
  reverse: { icon: '🔄', key: 'operations.reverse' },
  sumDigits: { icon: '➕', key: 'operations.sumDigits' },
  appendOne: { icon: '1️⃣', key: 'operations.appendOne' },
  double: { icon: '✖️', key: 'operations.double' }
};
```

### Contextual Translations
```javascript
// i18n.js - Context-aware translation system
const translations = {
  en: {
    'game.success.perfect': 'Perfect! {moves} moves (optimal)',
    'game.success.good': 'Well done! {moves} moves ({optimal} optimal)'
  }
};

// Usage with parameter substitution
t('game.success.perfect', { moves: 6, optimal: 6 });
```

## Testing Patterns

### Manual Testing Checklist
- [ ] All 4 operations work correctly with edge cases
- [ ] Enhanced BFS validation handles numbers 1-100,000 with strategic approaches
- [ ] Responsive design on mobile/desktop
- [ ] Multi-language switching
- [ ] Animation performance with reduced motion- [ ] **Hint system**: 3 hint types display correctly
- [ ] **Button blinking**: Direct hints trigger correct operation button
- [ ] **Hint effects cancellation**: Any user action clears both blinking and hint display
- [ ] **Non-modal hints**: Strategic/tactical hints auto-hide after 8 seconds
- [ ] **Hint limitations**: Max 3 hints per exercise, button greys out when exhausted
- [ ] **Smart hint progression**: Hint progression maintained across moves (strategic→tactical→direct) with fresh hints for new number

## Hint System UI Patterns

**Added March 22, 2026**: Non-modal hint system with blinking button interactions.

### Button Blinking Animation for Direct Hints
```css
.hint-blink {
  animation: hintBlink 0.8s ease-in-out 4;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.8) !important;
  border-color: rgba(251, 191, 36, 0.8) !important;
}

@keyframes hintBlink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}
```

### Hint Display (Non-Modal) Pattern
```javascript
function showHintDisplay(hint, hintsUsed, maxHints) {
  const display = document.getElementById("hint-display");
  
  // Populate hint content
  updateHintContent(hint, hintsUsed, maxHints);
  
  // Show display at top of screen
  display.classList.remove("hidden");
  
  // Auto-hide after 8 seconds for non-direct hints
  setTimeout(() => {
    display.classList.add("hidden");
  }, 8000);
}
```

### Clear All Hint Effects
```javascript
// Clean data-driven approach using recommendedOperation field
function blinkOperationButton(hint) {
  const targetOperation = hint.recommendedOperation;
  
  if (targetOperation) {
    const button = document.querySelector(`[data-operation="${targetOperation}"]`);
    if (button) {
      button.classList.add('hint-blink');
      setTimeout(() => button.classList.remove('hint-blink'), 3000);
    }
  }
}

// Clear all hint effects when user takes any action
function clearHintEffects() {
  // Remove blinking effect from operation buttons
  const blinkingButtons = document.querySelectorAll('.hint-blink');
  blinkingButtons.forEach(button => button.classList.remove('hint-blink'));
  
  // Hide hint display if visible
  const hintDisplay = document.getElementById('hint-display');
  if (hintDisplay && !hintDisplay.classList.contains('hidden')) {
    hintDisplay.classList.add('hidden');
  }
}
```
### Common Edge Cases
```javascript
// Test cases to always verify
const testCases = [
  { input: 1000, reverse: 1 },      // Leading zeros removed
  { input: 999, sumDigits: 27 },   // Large digit sum
  { input: 32, appendOne: 321 },   // Append to multi-digit
  { input: 5000, double: 10000 }   // Boundary maximum
];
```

## Mastery Achievement System

### Master Status Tracking Pattern
```javascript
// GameModeManager - Persistent achievement system
class GameModeManager {
  isMaster() {
    return localStorage.getItem("doxiny-master-status") === "true";
  }
  
  setMasterStatus(isMaster) {
    localStorage.setItem("doxiny-master-status", isMaster.toString());
  }
  
  checkAndAwardMasterStatus() {
    if (!this.isMaster() && this.isAllLevelsCompleted()) {
      this.setMasterStatus(true);
      return true; // Newly achieved master status
    }
    return false;
  }
}
```

### Progressive UI Adaptation Pattern
```javascript
// Conditional UI rendering based on master status
const masterButton = gameManager.gameModeManager.isMaster() && 
                    gameManager.currentDifficulty === 6 ?
  `<button id="show-journey-btn">Show Journey</button>` :
  `<button id="next-exercise-btn">Next Level</button>`;
```

### Master Achievement Celebration System
```javascript
// Multi-modal celebration flow
function showMasterAchievementModal() {
  // 1. Master achievement modal with crown animation
  // 2. Journey statistics display
  // 3. Free Play mode transition
}

// Exercise completion with mastery detection
const result = gameManager.onExerciseComplete(moves);
if (result.masterAchieved) {
  setTimeout(() => showMasterAchievementModal(), 2000);
}
```

### Exclusive Content Gating Pattern
```javascript
// Restrict custom exercises to masters only
canCreateCustomExercases() {
  return this.currentMode === this.modes.FREEPLAY && this.isMaster();
}

// UI enforcement with informative messaging
if (!gameManager.gameModeManager.canCreateCustomExercases()) {
  showNotification(translate('masterRequiredMessage'), 'info');
  return;
}
```

### Journey Statistics Modal Pattern
```javascript
// Comprehensive progress display
function showJourneyModal() {
  const stats = {
    levelsCompleted: unlockedLevels.length,
    exercisesCompleted: stats.exercisesCompleted,
    totalMoves: stats.totalMoves,
    perfectSolutions: stats.perfectSolutions,
    masterStatus: true
  };
  // Modal with transition to Free Play mode
}
```

### Master Visual Identity
```css
/* Gold accent system for master status */
.text-gold-400, .bg-gold-500 { /* Custom gold colors */ }
.master-indicator { 
  animation: masterGlow 3s ease-in-out infinite alternate; 
}

/* Master button styling */
.bg-gradient-to-r.from-gold-500.to-gold-600 {
  background: linear-gradient(to right, #d97706, #b45309);
}
```

## Development Workflow

### Feature Development Process
1. **Plan**: Update context files before coding
2. **Code**: Follow pure function/immutable patterns
3. **Test**: Manual testing with edge cases
4. **Update**: Refresh documentation files
5. **Deploy**: Preview → Production pipeline

### Debugging Guidelines
- Use `console.log` for state transitions in development
- Test BFS validation with complex numbers
- Check accessibility with screen readers

Last Updated: March 23, 2026 (Added mastery achievement system patterns and UI adaptations)