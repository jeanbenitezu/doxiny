/**
 * Doxiny Algorithm Configuration Manager
 *
 * Centralized configuration for BFS algorithms with runtime modification support.
 * Eliminates parameter drilling while maintaining testability and flexibility.
 */

class DoxinyConfig {
  constructor() {
    // Default configuration values
    this.config = {
      // BFS Algorithm Settings
      bfsUpperBoundLimit: 200000, // Optimal balance: performance vs correctness
      defaultMaxMoves: 30, // Maximum moves for pathfinding
      maxIterations: 15000, // BFS iteration safety limit

      // Search Strategy Settings
      lazySearch: true, // true = return first solution (fast), false = find all solutions (thorough)

      // Performance Tuning
      strategicSearchBonus: 5, // Extra moves for strategic approaches
      reverseTargetLimit: 10, // Max reverse targets to explore

      // Debug/Testing Modes
      debugMode: false, // Enable detailed logging
      benchmarkMode: false, // Track performance metrics
      validateOptimality: true, // Ensure optimal solutions when possible

      // Hint System Configuration
      enableStrategicHints: true, // Level 1: General strategic guidance
      enableTacticalHints: false, // Level 2: Specific operational hints
      enableDirectHints: true, // Level 3: Exact next move guidance

      // Tour System Configuration
      enableTour: true, // Enable first-time user guided tour
      forceShowTour: false, // Force tour to appear (ignores localStorage flag)
      tourAutoStart: true, // Auto-start tour for first-time users
    };
  }

  /**
   * Get current configuration (immutable copy)
   */
  get() {
    return { ...this.config };
  }

  /**
   * Get specific config value
   */
  getValue(key) {
    return this.config[key];
  }

  /**
   * Update configuration values (partial update)
   */
  update(newConfig) {
    this.config = { ...this.config, ...newConfig };

    if (this.config.debugMode) {
      console.log("🔧 Doxiny Config Updated:", newConfig);
    }

    return this.get();
  }

  /**
   * Reset to defaults
   */
  reset() {
    const defaults = new DoxinyConfig().config;
    this.config = { ...defaults };
    return this.get();
  }

  /**
   * Create temporary configuration scope
   * Useful for testing or temporary performance tuning
   */
  withTempConfig(tempConfig, callback) {
    const originalConfig = { ...this.config };

    try {
      this.update(tempConfig);
      return callback();
    } finally {
      this.config = originalConfig;
    }
  }

  /**
   * Performance preset configurations
   */
  static presets = {
    // Balanced performance (default)
    balanced: {
      bfsUpperBoundLimit: 200000,
      defaultMaxMoves: 30,
      lazySearch: true, // Return first valid solution for speed
    },

    // Speed-first (may sacrifice optimality)
    performance: {
      bfsUpperBoundLimit: 100000,
      defaultMaxMoves: 25,
      maxIterations: 10000,
      lazySearch: true, // Definitely return first solution for max speed
    },

    // Accuracy-first (slower but more optimal)
    accuracy: {
      bfsUpperBoundLimit: 500000,
      defaultMaxMoves: 35,
      maxIterations: 20000,
      lazySearch: false, // Find all solutions and return best
    },

    // Testing mode (very limited for fast tests)
    testing: {
      bfsUpperBoundLimit: 50000,
      defaultMaxMoves: 20,
      maxIterations: 5000,
      lazySearch: true, // Fast for unit tests
    },

    // Research mode (maximum exploration)
    research: {
      bfsUpperBoundLimit: 1000000,
      defaultMaxMoves: 50,
      maxIterations: 50000,
      lazySearch: false, // Thorough analysis, find all solutions
      debugMode: true,
      enableTour: false, // Research mode doesn't need tour
    },
    
    // Beginner-friendly (all hint types enabled) 
    beginner: {
      enableStrategicHints: true,
      enableTacticalHints: true,
      enableDirectHints: true,
      lazySearch: true,
      enableTour: true,
      tourAutoStart: true,
    },
    
    // Expert mode (minimal hints)
    expert: {
      enableStrategicHints: true,
      enableTacticalHints: false, 
      enableDirectHints: false,
      bfsUpperBoundLimit: 500000,
      lazySearch: false,
      enableTour: false, // Experts don't need the tour
    },

    // Development/Testing mode
    development: {
      debugMode: true,
      enableTour: true,
      forceShowTour: true, // Always show tour for testing
      tourAutoStart: false, // Manual control in dev mode
      bfsUpperBoundLimit: 100000,
      lazySearch: true,
    },
  };

  /**
   * Apply a preset configuration
   */
  applyPreset(presetName) {
    const preset = DoxinyConfig.presets[presetName];

    if (!preset) {
      throw new Error(
        `Unknown preset: ${presetName}. Available: ${Object.keys(DoxinyConfig.presets).join(", ")}`,
      );
    }

    return this.update(preset);
  }
}

// Singleton instance for global access
const doxinyConfig = new DoxinyConfig();

// Convenient API exports
export { doxinyConfig };
export const getConfig = () => doxinyConfig.get();
export const updateConfig = (config) => doxinyConfig.update(config);
export const resetConfig = () => doxinyConfig.reset();
export const applyPreset = (preset) => doxinyConfig.applyPreset(preset);

export default doxinyConfig;
