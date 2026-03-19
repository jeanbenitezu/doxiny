/**
 * Core mathematical operations for Number Puzzle game
 * Each operation transforms the current number in a specific way
 */

export const operations = {
  /**
   * REVERSE: Reverse all digits
   * Examples: 12 → 21, 100 → 1, 1234 → 4321
   */
  reverse: (n) => {
    return parseInt(n.toString().split("").reverse().join("")) || 0;
  },

  /**
   * SUM: Add all digits together
   * Examples: 128 → 1+2+8 = 11, 99 → 9+9 = 18
   */
  sum: (n) => {
    return n
      .toString()
      .split("")
      .reduce((acc, digit) => acc + Number(digit), 0);
  },

  /**
   * ADD1RIGHT: Append digit 1 to the right
   * Examples: 4 → 41, 12 → 121
   */
  add1Right: (n) => {
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
  add1Right: "APPEND 1",
  double: "DOUBLE",
};

/**
 * Validate operation exists
 */
export function isValidOperation(operation) {
  return operation in operations;
}
