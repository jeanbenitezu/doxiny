# Doxiny - Development Patterns & Best Practices
*Last Updated: March 24, 2026 - Cleaned up dead code references and corrected function names*

## Code Organization Principles

### Pure Function Operations
All game operations are implemented as pure functions:
```javascript
// operations.js - No side effects, predictable outputs
const reverse = (num) => parseInt(num.toString().split('').reverse().join('')) || 0;
const sum = (num) => num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
const append1 = (num) => parseInt(num.toString() + '1');
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
UI updates happen through the main render cycle in `createGameUI()` and selective updates via `updateLevelSelectorUI()`. The game uses a reactive approach where state changes trigger re-renders of specific components rather than individual update functions.

### Modular UI Component System (Added March 24, 2026)
Level selector extracted into dedicated rendering methods:
```javascript
// Level selector component rendering - separates logic from UI generation
function renderLevelSelectorUI() {
  const availableLevels = getAvailableLevels();
  
  const levelButtons = availableLevels.map((lvl) => {
    const isCustom = lvl.level === "custom";
    const isLocked = !isCustom && isLevelLocked(lvl.level);
    const isActive = /* complex active state logic */;
    
    // Apply appropriate styling based on state
    let buttonClass = isCustom ? "bg-purple-600..." : 
                     isLocked ? "bg-gray-800..." : 
                     isActive ? "bg-orange-600..." : "bg-[#2a2f3a]...";
    
    return `<button class="${buttonClass}" data-level="${lvl.level}">...</button>`;
  }).join("");
  
  return `<nav class="level-selector">${levelButtons}</nav>`;
}

// Selective UI updates - no full page re-render needed
function updateLevelSelectorUI() {
  const levelSelector = document.querySelector('[data-purpose="level-selector"]');
  if (levelSelector) {
    const newHTML = renderLevelSelectorUI();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newHTML;
    const newNav = tempDiv.querySelector('nav[data-purpose="level-selector"]');
    if (newNav) {
      levelSelector.replaceWith(newNav);
      console.log('🎮 Level selector UI updated');
    }
  }
}

// Usage: Immediate visual feedback when levels unlock
if (this.gameModeManager.unlockLevel(nextLevel)) {
  levelUnlocked = nextLevel;
  updateLevelSelectorUI(); // Instant update, no full render
}
```

### Game Mode State Synchronization (Fixed March 24, 2026)
Critical fix for exercise completion detection after mode switching:
```javascript
function handleGameModeChange(mode) {
  // ... existing mode change logic ...
  
  if (mode === 'normal') {
    const highestUnlockedLevel = gameManager.gameModeManager.getHighestUnlockedLevel();
    gameManager.setDifficulty(highestUnlockedLevel);
    
    // CRITICAL: Recreate gameState to match the new exercise after mode switch
    // Without this, win condition fails because old target goal is cached
    gameState = createGameState(
      gameManager.currentExercise.goal,
      gameManager.currentDifficulty,
    );
  }
  
  app.innerHTML = createGameUI();
  updateDisplay();
}
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
**Completion Counter System**: Added prestige system with completion tracking and level reset functionality as of March 24, 2026.

```javascript
// Enhanced master achievement with counter and reset
function checkAndAwardMasterStatus() {
  if (!isMaster() && isAllLevelsCompleted()) {
    setMasterStatus(true);
    
    // Increment completion counter for prestige
    incrementCompletionCount();
    
    // Reset levels for replayability
    unlockedLevels = [1];
    saveUnlockedLevels();
    
    return true; // Mastery achieved + progression reset
  }
  return false;
}

// Crown display with completion badge (inline pattern)
function renderMasterIndicator() {
  if (!gameManager.gameModeManager.isMaster()) return '';
  
  const completionDisplay = gameManager.gameModeManager.getCompletionDisplay();
  return `
    <span class="master-indicator text-yellow-400 font-bold relative">
      👑
      ${completionDisplay ? `<span class="completion-badge">${completionDisplay}</span>` : ''}
    </span>
  `;
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

### UI Component Modularization Pattern
**Added March 24, 2026**: Extracted complex UI rendering into dedicated methods.

```javascript
// Level Selector Component System
function renderLevelSelectorUI() {
  const availableLevels = getAvailableLevels();
  const levelButtons = availableLevels.map(lvl => {
    // Complete level button rendering logic with state management
    const isCustom = lvl.level === "custom";
    const isLocked = !isCustom && isLevelLocked(lvl.level);
    const isActive = /* complex active state logic */;
    
    return `<button class="${buttonClass}" data-level="${lvl.level}">...</button>`;
  }).join("");
  
  return /* Complete level selector HTML */;
}

function updateLevelSelectorUI() {
  const levelSelector = document.querySelector('[data-purpose="level-selector"]');
  if (levelSelector) {
    // Parse new HTML and replace existing component
    const newLevelSelectorHTML = renderLevelSelectorUI();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newLevelSelectorHTML;
    const newNav = tempDiv.querySelector('nav[data-purpose="level-selector"]');
    if (newNav) {
      levelSelector.replaceWith(newNav);
    }
  }
}

// Usage: Immediate level selector updates without full page re-render
if (this.gameModeManager.unlockLevel(nextLevel)) {
  levelUnlocked = nextLevel;
  updateLevelSelectorUI(); // Instant visual feedback
}
```

### Game Mode Switching State Management
**Fixed March 24, 2026**: Proper gameState synchronization during mode switches.

```javascript
function handleGameModeChange(mode) {
  // ... mode switching logic ...
  
  if (mode === 'normal') {
    const highestUnlockedLevel = gameManager.gameModeManager.getHighestUnlockedLevel();
    gameManager.setDifficulty(highestUnlockedLevel);
    
    // CRITICAL: Recreate gameState to match new exercise
    gameState = createGameState(
      gameManager.currentExercise.goal,
      gameManager.currentDifficulty,
    );
  }
  
  app.innerHTML = createGameUI();
  updateDisplay();
}
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
  sum: { icon: '➕', key: 'operations.sum' },
  append1: { icon: '1️⃣', key: 'operations.append1' },
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
  { input: 999, sum: 27 },   // Large digit sum
  { input: 32, append1: 321 },   // Append to multi-digit
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

### Crown Badge UI Pattern
```javascript
// Master crown with completion counter badge (inline template pattern)
const crownWithBadge = `
  <span class="master-indicator text-yellow-400 font-bold relative">
    👑
    ${gameManager.gameModeManager.getCompletionDisplay() ? `
      <span class="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center" style="font-size: 0.6rem; min-width: 1rem; min-height: 1rem;">
        ${gameManager.gameModeManager.getCompletionDisplay()}
      </span>
    ` : ''}
  </span>
`;

// Persistent counter management methods (in GameModeManager)
getCompletionCount(): number // From localStorage - returns raw number
incrementCompletionCount(): void // Increment and save to localStorage  
getCompletionDisplay(): string // Returns formatted display "1"-"9" or "∞"
```

### Enhanced Master Achievement with Prestige System
```javascript
// Replayable mastery system with completion tracking
function showMasterAchievementModal() {
  // 1. Master achievement modal with crown animation
  // 2. Increment completion counter
  // 3. Reset levels to [1] for fresh progression
  // 4. Simple congratulations message
  // 5. Continue button to resume play
  
  // Crown badge updates automatically to show completion count
}

// Exercise completion with enhanced mastery detection
const result = gameManager.onExerciseComplete(moves);
if (result.masterAchieved) {
  // Auto-reset levels and increment counter
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