/**
 * Core mathematical operations for Number Puzzle game
 * Each operation transforms the current number in a specific way
 */

export const operations = {
  /**
   * MIRROR: Reverse all digits
   * Examples: 12 → 21, 100 → 1, 1234 → 4321
   */
  mirror: (n) => {
    return parseInt(n.toString().split('').reverse().join('')) || 0;
  },

  /**
   * SUM: Add all digits together  
   * Examples: 128 → 1+2+8 = 11, 99 → 9+9 = 18
   */
  sum: (n) => {
    return n
      .toString()
      .split('')
      .reduce((acc, digit) => acc + Number(digit), 0);
  },

  /**
   * ADD1RIGHT: Append digit 1 to the right
   * Examples: 4 → 41, 12 → 121
   */
  add1Right: (n) => {
    return parseInt(n.toString() + '1');
  },

  /**
   * DOUBLE: Multiply by 2
   * Examples: 4 → 8, 16 → 32, 64 → 128
   */
  double: (n) => {
    return n * 2;
  }
};

/**
 * Get human-readable operation names for UI
 */
export const operationLabels = {
  mirror: 'MIRROR',
  sum: 'SUM', 
  add1Right: 'ADD 1',
  double: '×2'
};

/**
 * Validate operation exists
 */
export function isValidOperation(operation) {
  return operation in operations;
}