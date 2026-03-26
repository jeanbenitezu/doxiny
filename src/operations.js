/**
 * Core mathematical operations for Number Puzzle game
 * Each operation transforms the current number in a specific way
 */

/**
 * Utility functions for mathematical operations
 */
export const mathUtils = {
  /**
   * Check if a number is a power of 2
   */
  isPowerOfTwo: (n) => {
    return n > 0 && (n & (n - 1)) === 0;
  },

  /**
   * Reverse the digits of a number
   */
  reverseNumber: (n) => {
    return parseInt(n.toString().split("").reverse().join(""), 10) || 0;
  },

  /**
   * Sum all digits of a number  
   */
  sumDigits: (n) => {
    return n
      .toString()
      .split("")
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  },
};

export const operations = {
  /**
   * REVERSE: Reverse all digits
   * Examples: 12 → 21, 100 → 1, 1234 → 4321
   */
  reverse: (n) => {
    return mathUtils.reverseNumber(n);
  },

  /**
   * SUM: Add all digits together
   * Examples: 128 → 1+2+8 = 11, 99 → 9+9 = 18
   */
  sum: (n) => {
    return mathUtils.sumDigits(n);
  },

  /**
   * APPEND 1: Append digit 1 to the right
   * Examples: 4 → 41, 12 → 121
   */
  append1: (n) => {
    return parseInt(n.toString() + "1");
  },

  /**
   * DOUBLE: Multiply by 2
   * Examples: 4 → 8, 16 → 32, 64 → 128
   */
  double: (n) => {
    return n * 2;
  },
};

/**
 * Get human-readable operation names for UI
 */
export const operationLabels = {
  reverse: "REVERSE",
  sum: "SUM DIGITS",
  append1: "APPEND 1",
  double: "DOUBLE",
};

/**
 * Validate operation exists
 */
export function isValidOperation(operation) {
  return operation in operations;
}
