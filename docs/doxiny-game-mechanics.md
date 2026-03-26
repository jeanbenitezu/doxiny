# Doxiny - Game Mechanics & Algorithms
*Last Updated: March 24, 2026 - Cleaned up dead code references and corrected mastery system documentation*

## Core Game Concept
**Goal**: Transform number 1 to a target number using exactly 4 operations in minimum moves possible.

## The Four Operations

### 1. REVERSE (🔄)
- **Logic**: Flip all digits in the number
- **Examples**: 123 → 321, 1000 → 1 (leading zeros removed)
- **Use Case**: Digit manipulation, accessing different number patterns

### 2. SUM DIGITS (➕)
- **Logic**: Add all individual digits together  
- **Examples**: 128 → 1+2+8 = 11, 999 → 9+9+9 = 27
- **Use Case**: Reducing large numbers, creating specific small values

### 3. APPEND 1 (1️⃣)
- **Logic**: Add digit '1' to the end of the number
- **Examples**: 4 → 41, 12 → 121, 100 → 1001
- **Use Case**: Precise number building, reaching specific targets

### 4. DOUBLE (✖️)
- **Logic**: Multiply the number by 2
- **Examples**: 64 → 128, 25 → 50, 1 → 2
- **Use Case**: Exponential growth, powers of 2

## Exercise Generation System

### Primary Generation Algorithm
1. **Random Sampling**: Try 25 random numbers within difficulty range
2. **BFS Validation**: For each candidate, run breadth-first search from 1
3. **Acceptance Criteria**: 
   - `minMoves >= targetMoves[0]` (not too easy)
   - `minMoves <= targetMoves[1] + 5` (flexible upper bound)
4. **Return**: First valid exercise found

### Fallback System
If primary generation fails, use pre-validated exercise pools:
```javascript
const fallbackGoals = {
  1: [10, 12, 21],                    // Beginner: 3-6 moves
  2: [25, 34, 43, 55],                // Easy: 4-8 moves  
  3: [64, 89, 98, 77],                // Medium: 5-10 moves
  4: [128, 132, 231, 189],            // Hard: 6-12 moves
  5: [256, 289, 982, 334, 443],       // Expert: 7-15 moves
  6: [729, 867, 678, 987, 765, ...]   // Insane: 8-18 moves
};
```

### Enhanced BFS Solvability Validation
```javascript
function validateExercise(goal, maxMoves = null) {
  // Auto-calculate maxMoves based on goal size for better coverage
  if (!maxMoves) {
    maxMoves = Math.min(25, Math.max(15, Math.floor(Math.log10(goal)) * 8));
  }

  // Multi-stage validation approach:
  // 1. Quick pattern-based checks (powers of 2, single digits)
  // 2. Enhanced BFS with improved pruning
  // 3. Strategic approaches for complex numbers
  
  // Constraints:
  // - Numbers: 1 to 100,000 (expanded from 10,000)
  // - Dynamic move limits based on goal complexity
  // - Strategic reverse-search for odd/complex numbers
  // - Returns: { solvable, minMoves, solutionPath }
}
```

## Strategic Algorithm Approaches

### Pattern Recognition
- **Powers of 2**: Direct doubling path (1→2→4→8→16...)
- **Single digits**: Pre-calculated optimal paths (2-9)
- **Quick bailouts**: Immediate solutions for known patterns

### Reverse Target Analysis  
- **Double reverse**: Find numbers that double to goal
- **Reverse numbers**: Check if reversed digits are reachable
- **Sum-digits reverse**: Find numbers that sum to goal (expanded search)
- **Append1 reverse**: For goals ending in 1, check base number

### Digit Manipulation Strategy
```javascript
// For large odd numbers like 3333:
// 1. Find sum of digits (3+3+3+3 = 12)
// 2. Look for even numbers that also sum to 12
// 3. Try to reach those even numbers, then transform
const targetSum = sumDigits(goal);
for (let base = 1000; base <= 9999; base++) {
  if (base % 2 === 0 && sumDigits(base) === targetSum) {
    // Try path: 1 → base → sum → goal
  }
}
```

## Difficulty Progression

| Level | Name | Target Moves | Goal Range | Example Goals |
|-------|------|-------------|-----------|---------------|
| 1 | Beginner | 3-6 | 5-20 | 10, 12, 21 |
| 2 | Easy | 4-8 | 10-50 | 25, 34, 43 |
| 3 | Medium | 5-10 | 20-100 | 64, 89, 98 |
| 4 | Hard | 6-12 | 50-200 | 128, 132, 231 |
| 5 | Expert | 7-15 | 100-500 | 256, 289, 982 |
| 6 | Insane | 8-18 | 300-999 | 729, 867, 678 |

## Progress Calculation Algorithm

### Dynamic Progress Tracking
```javascript
// Multi-factor progress calculation
const progress = calculateProgressToTarget(currentNumber, goal, movesSoFar);

// Factors:
// 1. Moves made vs shortest path from current position
// 2. Distance remaining to goal (BFS calculation)
// 3. Bonus: +10% for staying on optimal path
// 4. Ceiling: 99% until exact completion (100% only when goal reached)
```

### Performance Grading
- **Perfect**: Moves <= optimal moves (A+ grade)
- **Excellent**: Moves <= optimal + 2 (A grade)  
- **Good**: Moves <= optimal + 4 (B+ grade)
- **Okay**: Moves <= optimal + 6 (B grade)
- **Needs Practice**: Moves > optimal + 6 (C grade)

## Mastery System

**Implementation**: Simplified mastery system with **completion counter** and **level reset** functionality.

The mastery system is implemented in the `GameModeManager` class with the following key methods:
- `checkAndAwardMasterStatus()` - Handles mastery achievement and completion counter
- `isMaster()` - Checks if player has achieved master status
- `unlockLevel()` - Manages level progression
- `getEfficiencyRequirement()` - Returns efficiency thresholds per level (80% for all levels)

**Persistent Storage:**
- `\"doxiny-master-status\"`: `\"true\"` | `null`
- `\"doxiny-completion-count\"`: `\"1\"` | `\"2\"` | ... | `\"15\"`

### Cross-Mode Invitation System
**Added March 24, 2026**: Bidirectional mode switching via success modal buttons

- **Normal Game**: Progressive unlocking with efficiency requirements
- **Free Play**: Unrestricted level access (masters only for custom exercises)

### Success Modal Button Logic
```javascript
// Dynamic button system based on mode and master status:
// Normal Mode + Regular User → "Next Level" button
// Normal Mode + Master User → "Try Free Play" button  
// Free Play Mode (any user) → "Try Normal Mode" button

${gameManager.gameModeManager.isNormal() ? 
  (gameManager.gameModeManager.isMaster() ? 
    `<button id="try-freeplay-btn">${translate("gameModeMessages.tryFreePlay")}</button>` :
    `<button id="next-exercise-btn">${translate("nextLevel")}</button>`
  ) : 
  `<button id="try-normal-btn">${translate("gameModeMessages.tryNormalMode")}</button>`
}
```

### Mode Transition Handlers
```javascript
// Automatic mode switching with visual feedback
function handleTryFreePlay() {
  // Master users invited to explore Free Play
  handleGameModeChange('freeplay');
}

function handleTryNormalMode() {
  // Free Play users invited to try structured progression
  handleGameModeChange('normal');
}
```

### Master Achievement Criteria
```javascript
// Achievement Requirements:
// 1. Complete all 6 levels (unlock level 6 by completing level 5)
// 2. Meet efficiency requirements:
//    - Levels 1-3: 80% efficiency (moves <= optimal * 1.25)
//    - Levels 4-6: 90% efficiency (moves <= optimal * 1.11)

function checkMasteryAchievement() {
  const allLevelsCompleted = unlockedLevels.includes(6); // [1,2,3,4,5,6]
  const masterStatus = localStorage.getItem("doxiny-master-status") === "true";
  return allLevelsCompleted && !masterStatus; // New achievement
}
```

### Master Benefits & Features
- **Visual Recognition**: Crown indicator (👑) with gold celebration modal
- **Exclusive Access**: Custom exercise creation restricted to masters in Free Play
- **Achievement Celebration**: Simple gold modal celebration without detailed statistics

### Master UI Adaptations
```javascript
// Enhanced success modal with mode-specific invitations
// Replaces simple "Next Exercise" button with smart mode suggestions

// Master Achievement Flow:
// 1. Complete all levels in Normal mode → Master status achieved
// 2. Success modal shows "Try Free Play" instead of "Next Level"
// 3. Free Play mode shows "Try Normal Mode" for return journey
// 4. Creates engagement loop between structured and creative play

// Custom exercise gating remains unchanged
canCreateCustomExercases() {
  return currentMode === 'freeplay' && isMaster();
}
```

## Constraints & Validation Rules
- **Number bounds**: 1 ≤ number ≤ 100,000 (expanded for complex numbers)
- **Operation validity**: All operations must produce valid numbers
- **Move tracking**: Complete history with operation names and number transitions
- **No infinite loops**: BFS prevents cycles, visited set tracks explored states
- **Memory limits**: Max 1,000 explored states per validation

## Hint System

**Added March 22, 2026**: Intelligent hint system provides 3 levels of guidance per exercise.

### Hint Types & UI Behavior

#### 1. Strategic Hints (Level 1) - Non-Modal Display
- **Purpose**: General direction and approach guidance
- **Examples**: "Target is larger, consider growth operations", "Try digit manipulation"
- **UI**: Non-modal display at top of screen, auto-hides after 8 seconds
- **Icon**: 💡 (lightbulb)
- **Cancellation**: Display hides immediately when user takes any action

#### 2. Tactical Hints (Level 2) - Non-Modal Display  
- **Purpose**: Specific number transformations and intermediate targets
- **Examples**: "Doubling 64 gives 128", "Reversing 123 gives 321"
- **UI**: Non-modal display at top of screen, auto-hides after 8 seconds
- **Icon**: 🎯 (target)
- **Cancellation**: Display hides immediately when user takes any action

#### 3. Direct Hints (Level 3) - Button Blinking
- **Purpose**: Exact next move with optimal operation
- **Examples**: "Use DOUBLE to transform 64 → 128"  
- **UI**: Target operation button blinks for 3 seconds with golden glow
- **Icon**: ⚡ (lightning)
- **Cancellation**: Blinking stops immediately when user takes any action

### Hint Generation Algorithm
```javascript
function generateHints(currentNumber, targetNumber, movesMade, hintsUsed = 0) {
  const optimalPath = findShortestPath(currentNumber, targetNumber);
  
  // Level 1: Strategic analysis
  if (hintsUsed < 1) {
    return analyzeOverallStrategy(currentNumber, targetNumber, optimalPath);
  }
  
  // Level 2: Tactical guidance  
  if (hintsUsed < 2) {
    return suggestNextTransformation(currentNumber, targetNumber, optimalPath);
  }
  
  // Level 3: Direct optimal move with operation reference
  if (hintsUsed < 3) {
    return {
      level: 3,
      type: 'direct',
      message: t('hints.direct.nextMove', { operation, current, result }),
      recommendedOperation: optimalPath[0].operation, // For button blinking
      confidence: 'maximum'
    };
  }
}
```

### Hint Limitation System
- **Max hints per exercise**: 3 hints total
- **Progressive revelation**: Must use hints in order (can't skip to direct hint)
- **UI feedback**: Hint button greys out when exhausted
- **Smart progression**: When user makes move, hint progression continues (strategic→tactical→direct) but hints are regenerated for new current number
- **Fresh context**: Each hint is always relevant to current game state

---
Last Updated: March 26, 2026 (Optimized BFS upper bound: 100K→200K for 95% performance gain while maintaining Goal 73 fix)

Last Updated: March 24, 2026 (Added completion counter system and level reset functionality)