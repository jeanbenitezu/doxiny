/**
 * Remote Config Service - Feature flags and dynamic parameter management
 * 
 * Handles:
 * - Feature flags for A/B testing and gradual rollouts
 * - Dynamic game parameter updates (difficulty, hints, etc.)
 * - Real-time configuration changes without app restart
 * - Fallback values for offline or unavailable scenarios
 */

import { getValue, fetchAndActivate, getAll } from 'firebase/remote-config'
import firebaseManager from './FirebaseManager.js'

class RemoteConfigService {
  constructor() {
    this.isEnabled = false
    this.remoteConfig = null
    this.lastFetchTime = 0
    this.fetchIntervalMs = 5 * 60 * 1000 // 5 minutes
    this.defaultValues = this._getDefaultValues()
    this.cachedValues = new Map()
  }

  /**
   * Initialize Remote Config service with default parameters
   */
  async initialize() {
    await firebaseManager.initialize()
    
    if (firebaseManager.available && firebaseManager.getRemoteConfig()) {
      this.remoteConfig = firebaseManager.getRemoteConfig()
      
      // Set default values
      this.remoteConfig.defaultConfig = this.defaultValues
      
      // Configure fetch settings
      this.remoteConfig.settings = {
        minimumFetchIntervalMillis: 60000, // 1 minute in production
        fetchTimeoutMillis: 10000 // 10 second timeout
      }
      
      this.isEnabled = true
      
      // Initial fetch
      await this.fetchConfig()
      
      console.log('[RemoteConfig] Service initialized with defaults')
    } else {
      console.log('[RemoteConfig] Service unavailable - using default values')
    }
  }

  /**
   * Fetch latest configuration from Firebase
   */
  async fetchConfig() {
    if (!this.isEnabled) {
      return false
    }

    return firebaseManager.whenAvailableAsync(async () => {
      try {
        const success = await fetchAndActivate(this.remoteConfig)
        this.lastFetchTime = Date.now()
        
        // Clear cached values to force re-evaluation
        this.cachedValues.clear()
        
        console.log('[RemoteConfig] Configuration fetched and activated:', success)
        return success
      } catch (error) {
        console.warn('[RemoteConfig] Fetch failed:', error.message)
        return false
      }
    })
  }

  /**
   * Get a configuration value with type conversion and caching
   */
  getValue(key, type = 'string') {
    // Return cached value if available
    if (this.cachedValues.has(key)) {
      return this.cachedValues.get(key)
    }

    let value
    
    if (this.isEnabled) {
      value = firebaseManager.whenAvailable(() => {
        const remoteValue = getValue(this.remoteConfig, key)
        return this._convertValue(remoteValue.asString(), type)
      })
    }
    
    // Fallback to default if remote value unavailable
    if (value === null || value === undefined) {
      value = this._convertValue(this.defaultValues[key], type)
    }
    
    // Cache the value
    this.cachedValues.set(key, value)
    
    return value
  }

  /**
   * Game Configuration Methods
   */

  // Feature Flags
  getTourEnabled() {
    return this.getValue('tour_enabled', 'boolean')
  }

  getFreePlayEnabled() {
    return this.getValue('freeplay_enabled', 'boolean')
  }

  getHintsEnabled() {
    return this.getValue('hints_enabled', 'boolean')
  }

  getMasteryBadgeEnabled() {
    return this.getValue('mastery_badge_enabled', 'boolean')
  }

  // Difficulty Parameters
  getEfficiencyRequirement(level) {
    const requirements = this.getValue('efficiency_requirements', 'object')
    return requirements[level] || requirements.default || 80
  }

  getHintThresholds() {
    return this.getValue('hint_thresholds', 'object')
  }

  getMaxHintsPerExercise() {
    return this.getValue('max_hints_per_exercise', 'number')
  }

  // Algorithm Configuration
  getBfsUpperBoundMultiplier() {
    return this.getValue('bfs_upper_bound_multiplier', 'number')
  }

  getGenerationTimeoutMs() {
    return this.getValue('generation_timeout_ms', 'number')
  }

  getLazySearchEnabled() {
    return this.getValue('lazy_search_enabled', 'boolean')
  }

  // UI Configuration
  getAnimationDuration() {
    return this.getValue('animation_duration_ms', 'number')
  }

  getShowOperationPreviews() {
    return this.getValue('show_operation_previews', 'boolean')
  }

  getCompactMode() {
    return this.getValue('compact_mode_enabled', 'boolean')
  }

  // Analytics Configuration
  getAnalyticsEnabled() {
    return this.getValue('analytics_enabled', 'boolean')
  }

  getDetailedEventsEnabled() {
    return this.getValue('detailed_events_enabled', 'boolean')
  }

  // Experimental Features
  getExperimentalFeaturesEnabled() {
    return this.getValue('experimental_features_enabled', 'boolean')
  }

  getBetaFeaturesForUser(userId = null) {
    if (!userId) return []
    
    const betaFeatures = this.getValue('beta_features', 'object')
    const userHash = this._hashUserId(userId)
    const enabledFeatures = []
    
    Object.entries(betaFeatures).forEach(([feature, rolloutPercentage]) => {
      if (userHash % 100 < rolloutPercentage) {
        enabledFeatures.push(feature)
      }
    })
    
    return enabledFeatures
  }

  /**
   * Auto-refresh configuration if stale
   */
  async refreshIfStale() {
    const now = Date.now()
    if (now - this.lastFetchTime > this.fetchIntervalMs) {
      await this.fetchConfig()
    }
  }

  /**
   * Get all configuration values for debugging
   */
  getAllValues() {
    if (!this.isEnabled) {
      return this.defaultValues
    }

    return firebaseManager.whenAvailable(() => {
      const allValues = getAll(this.remoteConfig)
      const result = {}
      
      Object.entries(allValues).forEach(([key, value]) => {
        result[key] = value.asString()
      })
      
      return result
    }) || this.defaultValues
  }

  /**
   * Default configuration values
   */
  _getDefaultValues() {
    return {
      // Feature Flags
      tour_enabled: 'true',
      freeplay_enabled: 'true',
      hints_enabled: 'true',
      mastery_badge_enabled: 'true',
      
      // Difficulty Parameters
      efficiency_requirements: JSON.stringify({
        1: 70, 2: 70, 3: 70,
        4: 80, 5: 80, 6: 80,
        7: 85, 8: 85, 9: 85,
        10: 90, 11: 90, 12: 90,
        default: 80
      }),
      
      hint_thresholds: JSON.stringify({
        strategic: 3,  // Show after 3 moves
        tactical: 6,   // Show after 6 moves
        direct: 10     // Show after 10 moves
      }),
      
      max_hints_per_exercise: '3',
      
      // Algorithm Configuration
      bfs_upper_bound_multiplier: '25',
      generation_timeout_ms: '5000',
      lazy_search_enabled: 'true',
      
      // UI Configuration
      animation_duration_ms: '300',
      show_operation_previews: 'true',
      compact_mode_enabled: 'false',
      
      // Analytics
      analytics_enabled: 'true',
      detailed_events_enabled: 'true',
      
      // Experimental
      experimental_features_enabled: 'false',
      beta_features: JSON.stringify({
        advanced_hints: 10,        // 10% rollout
        custom_themes: 25,         // 25% rollout
        social_sharing: 50         // 50% rollout
      })
    }
  }

  /**
   * Convert string values to appropriate types
   */
  _convertValue(value, type) {
    if (value === null || value === undefined) {
      return null
    }

    switch (type) {
      case 'boolean':
        return value === 'true' || value === true
      
      case 'number':
        const num = parseFloat(value)
        return isNaN(num) ? null : num
      
      case 'object':
        try {
          return JSON.parse(value)
        } catch {
          return null
        }
      
      case 'array':
        try {
          const parsed = JSON.parse(value)
          return Array.isArray(parsed) ? parsed : null
        } catch {
          return null
        }
      
      default: // string
        return String(value)
    }
  }

  /**
   * Simple hash function for user ID-based feature rollouts
   */
  _hashUserId(userId) {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Development/debugging helpers
   */
  
  logCurrentConfig() {
    console.log('[RemoteConfig] Current configuration:', this.getAllValues())
  }

  clearCache() {
    this.cachedValues.clear()
    console.log('[RemoteConfig] Cache cleared')
  }

  getServiceStatus() {
    return {
      is_enabled: this.isEnabled,
      last_fetch_time: new Date(this.lastFetchTime).toISOString(),
      cached_values_count: this.cachedValues.size,
      next_auto_refresh: new Date(this.lastFetchTime + this.fetchIntervalMs).toISOString()
    }
  }
}

// Create singleton instance
const remoteConfigService = new RemoteConfigService()

export default remoteConfigService