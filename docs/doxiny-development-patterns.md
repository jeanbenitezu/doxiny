# Doxiny - Development Patterns & Best Practices

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
// game.js - State transitions
function applyMove(gameState, operation, operationName) {
  const newCurrentNumber = operation(gameState.currentNumber);
  return {
    ...gameState,
    currentNumber: newCurrentNumber,
    moves: [...gameState.moves, { operation: operationName, from: gameState.currentNumber, to: newCurrentNumber }],
    isComplete: newCurrentNumber === gameState.targetNumber
  };
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

## PWA Best Practices

### Service Worker Strategy
- **Cache-first** for static assets (JS, CSS, images)
- **Network-first** for mutable content (translations, config)
- **Offline fallback** for HTML pages

### Manifest Configuration
```json
{
  "name": "Doxiny - Do X in Y moves",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2563EB",
  "background_color": "#1a1f26"
}
```

## Testing Patterns

### Manual Testing Checklist
- [ ] All 4 operations work correctly with edge cases
- [ ] BFS validation handles numbers 1-10,000
- [ ] Responsive design on mobile/desktop
- [ ] PWA install and offline functionality
- [ ] Multi-language switching
- [ ] Animation performance with reduced motion

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
- Verify PWA functionality in network conditions
- Check accessibility with screen readers

Last Updated: March 21, 2026