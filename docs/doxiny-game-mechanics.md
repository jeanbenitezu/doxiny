# Doxiny - Game Mechanics & Algorithms

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

### BFS Solvability Validation
```javascript
function validateExercise(goal, maxMoves = 20) {
  const queue = [{ current: 1, steps: 0, path: [] }];
  const visited = new Set([1]);
  
  // Constraints:
  // - Numbers: 1 to 10,000 (prevents DOUBLE from exploding)
  // - Visited limit: 1,000 unique numbers max
  // - Move limit: 20 moves default
  // - Returns: { solvable, minMoves, solutionPath }
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
// 4. Ceiling: 95% until exact completion (100% only when goal reached)
```

### Performance Grading
- **Perfect**: Moves <= optimal moves (A+ grade)
- **Excellent**: Moves <= optimal + 2 (A grade)  
- **Good**: Moves <= optimal + 4 (B+ grade)
- **Okay**: Moves <= optimal + 6 (B grade)
- **Needs Practice**: Moves > optimal + 6 (C grade)

## Player Statistics Tracking
```javascript
const playerStats = {
  exercisesCompleted: 0,
  totalMoves: 0,
  perfectSolutions: 0,
  recentPerformance: [], // Last 5 exercises for trending
  currentDifficulty: 1,
  difficultyProgression: {} // Unlock history
};
```

## Constraints & Validation Rules
- **Number bounds**: 1 ≤ number ≤ 10,000
- **Operation validity**: All operations must produce valid numbers
- **Move tracking**: Complete history with operation names and number transitions
- **No infinite loops**: BFS prevents cycles, visited set tracks explored states
- **Memory limits**: Max 1,000 explored states per validation

Last Updated: March 21, 2026