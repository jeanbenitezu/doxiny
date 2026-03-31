/**
 * Analytics Service - Game event tracking and custom metrics
 * 
 * Handles:
 * - Game completion events with move efficiency tracking
 * - Level progression and mastery achievements
 * - Game mode switches and user preferences
 * - Tour completion tracking
 * - Performance metrics and user behavior analytics
 */

import { logEvent, setUserProperties, setUserId } from 'firebase/analytics'
import firebaseManager from './FirebaseManager.js'

class AnalyticsService {
  constructor() {
    this.isEnabled = false
    this.sessionStartTime = null
    this.currentGameMode = null
    this.currentDifficulty = null
  }

  /**
   * Initialize analytics service
   * Called after FirebaseManager initialization
   */
  async initialize() {
    await firebaseManager.initialize()
    
    if (firebaseManager.available && firebaseManager.getAnalytics()) {
      this.isEnabled = true
      this.sessionStartTime = Date.now()
      
      // Set unique user ID
      await this._setUniqueUserId()
      
      // Set initial user properties
      await this._setInitialUserProperties()
      
      // Track session start
      this._trackEvent('session_start', {
        timestamp: this.sessionStartTime,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: document.documentElement.lang || 'en'
      })
      
      console.log('[Analytics] Service initialized and session started')
    } else {
      console.log('[Analytics] Service unavailable - events will be ignored')
    }
  }

  /**
   * Track exercise completion with comprehensive metrics
   */
  async trackExerciseCompleted(data) {
    const eventData = {
      target_number: data.targetNumber || 0,
      moves_used: data.movesUsed || 0,
      optimal_moves: data.optimalMoves || 0,
      efficiency_percentage: data.efficiencyPercentage || 0,
      completion_time_seconds: data.completionTimeSeconds || 0,
      difficulty_level: data.difficultyLevel || 1,
      game_mode: data.gameMode || 'normal',
      hints_used: data.hintsUsed || 0,
      operations_used: data.operationsUsed || [],
      is_perfect_solution: data.movesUsed === data.optimalMoves
    }

    await this._trackEvent('exercise_completed', eventData)
    
    // Track efficiency milestone events
    if (eventData.efficiency_percentage > 100) {
      await this._trackEvent('above_optimal_efficiency', {
        difficulty_level: eventData.difficulty_level,
        target_number: eventData.target_number
      })
    }
    else if (eventData.efficiency_percentage === 100) {
      await this._trackEvent('perfect_efficiency_achieved', {
        difficulty_level: eventData.difficulty_level,
        target_number: eventData.target_number
      })
    } else if (eventData.efficiency_percentage >= 90) {
      await this._trackEvent('high_efficiency_achieved', {
        efficiency_percentage: eventData.efficiency_percentage,
        difficulty_level: eventData.difficulty_level
      })
    }
  }

  /**
   * Track level unlocking and progression milestones
   */
  async trackLevelUnlocked(levelNumber, totalUnlockedLevels) {
    await this._trackEvent('level_unlocked', {
      level_number: levelNumber,
      total_unlocked_levels: totalUnlockedLevels,
      game_mode: this.currentGameMode || 'normal'
    })

    // Track progression milestones
    const milestones = [3, 6, 10, 15, 20]
    if (milestones.includes(totalUnlockedLevels)) {
      await this._trackEvent('progression_milestone', {
        milestone_level: totalUnlockedLevels,
        achievement_type: `${totalUnlockedLevels}_levels_unlocked`
      })
    }
  }

  /**
   * Track mastery achievement with progression statistics
   */
  async trackMasteryAchieved(data) {
    await this._trackEvent('mastery_achieved', {
      completion_count: data.completionCount || 0,
      average_efficiency: data.averageEfficiency || 0,
      total_exercises_completed: data.totalExercisesCompleted || 0,
      time_to_mastery_minutes: data.timeToMasteryMinutes || 0
    })

    // Set user property for master status
    await this._setUserProperty('is_master_player', true)
  }

  /**
   * Track game mode switches
   */
  async trackGameModeSwitch(fromMode, toMode) {
    this.currentGameMode = toMode
    
    await this._trackEvent('game_mode_switched', {
      from_mode: fromMode,
      to_mode: toMode,
      switch_timestamp: Date.now()
    })

    // Update user property
    await this._setUserProperty('preferred_game_mode', toMode)
  }

  /**
   * Track tour completion events
   */
  async trackTourCompleted(completionMethod = 'finished') {
    await this._trackEvent('tour_completed', {
      completion_method: completionMethod, // 'finished' | 'skipped'
      completion_timestamp: Date.now(),
      session_age_seconds: Math.floor((Date.now() - this.sessionStartTime) / 1000)
    })
  }

  /**
   * Track tour start event
   */
  async trackTourStarted() {
    await this._trackEvent('tour_started', {
      start_timestamp: Date.now(),
      session_age_seconds: Math.floor((Date.now() - this.sessionStartTime) / 1000)
    })
  }

  /**
   * Track hint system usage
   */
  async trackHintUsed(hintType, currentNumber, targetNumber, movesUsed) {
    await this._trackEvent('hint_used', {
      hint_type: hintType, // 'strategic' | 'tactical' | 'direct'
      current_number: currentNumber,
      target_number: targetNumber,
      moves_used_when_hint_requested: movesUsed,
      difficulty_level: this.currentDifficulty || 1
    })
  }

  /**
   * Track operation usage patterns
   */
  async trackOperationUsed(operation, fromNumber, toNumber) {
    await this._trackEvent('operation_used', {
      operation_type: operation, // 'REVERSE' | 'SUM' | 'APPEND1' | 'DOUBLE'
      from_number: fromNumber,
      to_number: toNumber,
      number_size_category: this._getNumberSizeCategory(fromNumber),
      game_mode: this.currentGameMode || 'normal'
    })
  }

  /**
   * Track custom exercise generation (Free Play mode)
   */
  async trackCustomExercise(targetNumber, generationTimeMs) {
    await this._trackEvent('custom_exercise_generated', {
      target_number: targetNumber,
      generation_time_ms: generationTimeMs,
      number_size_category: this._getNumberSizeCategory(targetNumber)
    })
  }
  /**
   * Track sharing functionality usage and success rates
   */
  async trackSharingAttempt(shareType, content, context = {}) {
    await this._trackEvent('sharing_attempted', {
      share_type: shareType, // 'victory' | 'challenge' | 'puzzle'
      content_type: content.type || 'unknown', // 'incredible_victory' | 'perfect_victory' | 'excellent_victory' | 'challenge_victory' | 'unsolved_puzzle' | 'expert_challenge'
      target_number: content.targetNumber || 0,
      moves_used: content.movesUsed || 0,
      efficiency_percentage: content.efficiencyPercentage || 0,
      game_mode: context.gameMode || 'unknown',
      difficulty_level: context.difficultyLevel || 1,
      user_triggered: context.userTriggered !== false // Default true
    });
  }

  async trackSharingSuccess(shareType, method, content, context = {}) {
    await this._trackEvent('sharing_succeeded', {
      share_type: shareType, // 'victory' | 'challenge' | 'puzzle'
      sharing_method: method, // 'native' | 'clipboard' | 'fallback'
      content_type: content.type || 'unknown',
      target_number: content.targetNumber || 0,
      moves_used: content.movesUsed || 0,
      efficiency_percentage: content.efficiencyPercentage || 0,
      game_mode: context.gameMode || 'unknown',
      difficulty_level: context.difficultyLevel || 1,
      message_length: content.messageLength || 0
    });
  }

  async trackSharingFailure(shareType, error, content, context = {}) {
    await this._trackEvent('sharing_failed', {
      share_type: shareType,
      error_type: error.name || 'unknown_error',
      error_message: error.message ? error.message.substring(0, 100) : 'unknown',
      target_number: content.targetNumber || 0,
      game_mode: context.gameMode || 'unknown',
      difficulty_level: context.difficultyLevel || 1,
      user_agent: navigator.userAgent ? navigator.userAgent.substring(0, 100) : 'unknown'
    });
  }

  async trackSharedPuzzleLoaded(source, goalNumber, hasMovesData = false) {
    await this._trackEvent('shared_puzzle_loaded', {
      source: source, // 'url_parameter' | 'direct_link' | 'social_media'
      goal_number: goalNumber,
      has_moves_data: hasMovesData,
      referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
      load_timestamp: Date.now()
    });
  }

  async trackSharingMethodPreference(nativeAvailable, methodUsed = null) {
    await this._trackEvent('sharing_method_preference', {
      web_share_api_available: nativeAvailable,
      method_used: methodUsed, // 'native' | 'clipboard' | null (for capability check)
      device_type: this._detectDeviceType(),
      browser_type: this._detectBrowserType()
    });
  }
  /**
   * Track user engagement metrics
   */
  async trackEngagementMetrics(sessionDurationMinutes, exercisesCompleted) {
    await this._trackEvent('engagement_metrics', {
      session_duration_minutes: sessionDurationMinutes,
      exercises_completed_in_session: exercisesCompleted,
      average_time_per_exercise: sessionDurationMinutes / Math.max(exercisesCompleted, 1),
      engagement_level: this._calculateEngagementLevel(sessionDurationMinutes, exercisesCompleted)
    })
  }

  /**
   * Track language preference changes
   */
  async trackLanguageChanged(fromLang, toLang) {
    await this._trackEvent('language_changed', {
      from_language: fromLang,
      to_language: toLang
    })

    await this._setUserProperty('preferred_language', toLang)
  }

  /**
   * Update current context for subsequent events
   */
  setCurrentContext(gameMode, difficulty) {
    this.currentGameMode = gameMode
    this.currentDifficulty = difficulty
  }

  /**
   * Set user properties for segmentation and personalization
   */
  /**
   * Generate and set a unique user ID for this device/user
   */
  async _setUniqueUserId() {
    // Get or create a unique user ID for this device
    let userId = localStorage.getItem('doxiny-user-id')
    
    if (!userId) {
      // Generate a unique ID: timestamp + random string
      const timestamp = Date.now().toString(36)
      const randomString = Math.random().toString(36).substring(2, 8)
      userId = `user_${timestamp}_${randomString}`
      
      // Store it in localStorage for persistence
      localStorage.setItem('doxiny-user-id', userId)
      console.log('[Analytics] Generated new user ID:', userId)
    }
    
    // Set the user ID in Firebase Analytics
    return firebaseManager.whenAvailableAsync(async () => {
      const analytics = firebaseManager.getAnalytics()
      if (analytics) {
        await setUserId(analytics, userId)
        console.log('[Analytics] User ID set:', userId)
      }
    })
  }

  async _setInitialUserProperties() {
    // Get current game state from localStorage
    const gameMode = localStorage.getItem('doxiny-gamemode') || 'normal'
    const language = localStorage.getItem('doxiny-language') || 'en'
    const isMaster = localStorage.getItem('doxiny-master-status') === 'true'
    const unlockedLevels = JSON.parse(localStorage.getItem('doxiny-unlocked-levels') || '[]')

    await this._setUserProperties({
      preferred_game_mode: gameMode,
      preferred_language: language,
      is_master_player: isMaster,
      unlocked_levels_count: unlockedLevels.length,
      first_session_date: new Date().toISOString().split('T')[0]
    })
  }

  /**
   * Helper method to track events with error handling
   */
  async _trackEvent(eventName, parameters = {}) {
    if (!this.isEnabled) {
      return
    }

    return firebaseManager.whenAvailableAsync(async () => {
      try {
        const analytics = firebaseManager.getAnalytics()
        if (!analytics) {
          console.warn(`[Analytics] ❌ Event '${eventName}' failed - Analytics instance not available`)
          return false
        }

        const eventData = {
          ...parameters,
          timestamp: Date.now(),
          session_id: this.sessionStartTime
        }
        
        // Validate event name follows Firebase rules
        if (!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(eventName)) {
          console.error(`[Analytics] ❌ Invalid event name: '${eventName}' - Must start with letter and contain only letters, numbers, underscores (max 40 chars)`)
          return false
        }

        // Validate parameters
        const validatedParams = this._validateEventParameters(eventData)

        await logEvent(analytics, eventName, validatedParams)
        console.log(`[Analytics] ✅ Event tracked: ${eventName}`, validatedParams)
        return true
        
      } catch (error) {
        console.error(`[Analytics] ❌ Event tracking error for '${eventName}':`, {
          error: error.message,
          code: error.code || 'unknown',
          stack: error.stack?.split('\n').slice(0, 3),
          parameters
        })
        return false
      }
    })
  }

  /**
   * Set a single user property
   */
  async _setUserProperty(propertyName, value) {
    if (!this.isEnabled) {
      return
    }

    return firebaseManager.whenAvailableAsync(async () => {
      const analytics = firebaseManager.getAnalytics()
      if (analytics) {
        await setUserProperties(analytics, { [propertyName]: value })
      }
    })
  }

  /**
   * Set multiple user properties
   */
  async _setUserProperties(properties) {
    if (!this.isEnabled) {
      console.warn('[Analytics] User properties not set - service not enabled', properties)
      return
    }

    return firebaseManager.whenAvailableAsync(async () => {
      try {
        const analytics = firebaseManager.getAnalytics()
        if (!analytics) {
          console.warn('[Analytics] ❌ User properties failed - Analytics instance not available')
          return false
        }

        // Validate property names
        const validatedProps = this._validateUserProperties(properties)

        await setUserProperties(analytics, validatedProps)
        console.log('[Analytics] ✅ User properties set:', validatedProps)
        return true
        
      } catch (error) {
        console.error('[Analytics] ❌ User properties error:', {
          error: error.message,
          code: error.code || 'unknown',
          properties
        })
        return false
      }
    })
  }

  /**
   * Validate event parameters according to Firebase rules
   */
  _validateEventParameters(params) {
    const validated = {}
    
    Object.keys(params).forEach(key => {
      // Parameter names must be 40 chars or less and contain only letters, numbers, underscores
      const validKey = key.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40)
      if (validKey !== key) {
        console.warn(`[Analytics] Parameter key '${key}' converted to '${validKey}'`)
      }
      
      let value = params[key]
      
      // Firebase limits: strings to 100 chars, numbers ok, arrays converted to strings
      if (typeof value === 'string' && value.length > 100) {
        value = value.substring(0, 97) + '...'
        console.warn(`[Analytics] Parameter '${validKey}' truncated to 100 chars`)
      } else if (Array.isArray(value)) {
        value = value.join(',').substring(0, 100)
      }
      
      validated[validKey] = value
    })
    
    return validated
  }

  /**
   * Validate user properties according to Firebase rules
   */
  _validateUserProperties(properties) {
    const validated = {}
    
    Object.keys(properties).forEach(key => {
      // Property names must be 24 chars or less
      const validKey = key.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 24)
      if (validKey !== key) {
        console.warn(`[Analytics] Property key '${key}' converted to '${validKey}'`)
      }
      
      let value = properties[key]
      
      // Property values limited to 36 chars for strings
      if (typeof value === 'string' && value.length > 36) {
        value = value.substring(0, 33) + '...'
        console.warn(`[Analytics] Property '${validKey}' truncated to 36 chars`)
      }
      
      validated[validKey] = value
    })
    
    return validated
  }

  /**
   * Categorize numbers by size for analysis
   */
  _getNumberSizeCategory(number) {
    const num = Math.abs(number)
    if (num < 10) return 'single_digit'
    if (num < 100) return 'double_digit'
    if (num < 1000) return 'triple_digit'
    if (num < 10000) return 'four_digit'
    return 'large_number'
  }

  /**
   * Calculate engagement level based on session metrics
   */
  _calculateEngagementLevel(sessionMinutes, exercisesCompleted) {
    const engagementScore = sessionMinutes * 0.5 + exercisesCompleted * 2
    if (engagementScore >= 20) return 'high'
    if (engagementScore >= 10) return 'medium'
    return 'low'
  }
  /**
   * Device and browser detection for sharing analytics
   */
  _detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad|phone|tablet/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  _detectBrowserType() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'other';
  }}

// Create singleton instance
const analyticsService = new AnalyticsService()

export default analyticsService