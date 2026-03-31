/**
 * Firebase Manager - Central Firebase initialization and service coordination
 * 
 * Handles:
 * - Firebase app initialization with error handling
 * - Service availability detection
 * - Graceful degradation when Firebase is unavailable
 * - Environment-based configuration loading
 */

import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics'
import { getPerformance } from 'firebase/performance'
import { getRemoteConfig } from 'firebase/remote-config'

class FirebaseManager {
  constructor() {
    this.app = null
    this.analytics = null
    this.performance = null
    this.remoteConfig = null
    this.isInitialized = false
    this.isAvailable = false
    this.initializationPromise = null
  }

  /**
   * Initialize Firebase with configuration from environment variables
   * Returns promise that resolves when initialization is complete
   */
  async initialize() {
    // Return existing initialization promise if already started
    if (this.initializationPromise) {
      return this.initializationPromise
    }

    this.initializationPromise = this._performInitialization()
    return this.initializationPromise
  }

  async _performInitialization() {
    try {
      console.log('[Firebase] Starting initialization...')
      
      // Check if Firebase config is available
      const config = this._getFirebaseConfig()
      if (!config.apiKey || !config.projectId || !config.appId) {
        console.warn('[Firebase] Configuration incomplete. Firebase features disabled.', {
          reason: 'Missing required environment variables',
          fix: 'Set VITE_FIREBASE_* environment variables or create env file'
        })
        this.isAvailable = false
        return false
      }

      // Initialize Firebase app
      this.app = initializeApp(config)
      console.log('[Firebase] App initialized successfully with project:', config.projectId)

      // Initialize services with availability checks
      await this._initializeServices()
      
      this.isInitialized = true
      this.isAvailable = true
      console.log('[Firebase] All services initialized and ready')
      return true

    } catch (error) {
      console.error('[Firebase] Initialization failed:', {
        error: error.message,
        stack: error.stack?.split('\n')[1],
        config: 'Check environment variables'
      })
      this.isAvailable = false
      return false
    }
  }

  async _initializeServices() {
    const services = []

    // Initialize Analytics if supported
    services.push(this._initializeAnalytics())
    
    // Initialize Performance Monitoring if supported
    services.push(this._initializePerformance())
    
    // Initialize Remote Config
    services.push(this._initializeRemoteConfig())

    // Wait for all service initializations
    await Promise.allSettled(services)
  }

  async _initializeAnalytics() {
    try {
      if (await isAnalyticsSupported()) {
        this.analytics = getAnalytics(this.app)
        console.log('[Firebase] Analytics initialized')
      } else {
        console.warn('[Firebase] Analytics not supported in this environment')
      }
    } catch (error) {
      console.warn('[Firebase] Analytics initialization failed:', error.message)
    }
  }

  async _initializePerformance() {
    try {
      this.performance = getPerformance(this.app)
      console.log('[Firebase] Performance Monitoring initialized')
    } catch (error) {
      console.warn('[Firebase] Performance Monitoring initialization failed:', error.message)
    }
  }

  async _initializeRemoteConfig() {
    try {
      this.remoteConfig = getRemoteConfig(this.app)
      console.log('[Firebase] Remote Config initialized')
    } catch (error) {
      console.warn('[Firebase] Remote Config initialization failed:', error.message)
    }
  }

  _getFirebaseConfig() {
    // Configuration is injected by Vite at build time
    const config = typeof __FIREBASE_CONFIG__ !== 'undefined' ? __FIREBASE_CONFIG__ : {}
    
    // Log configuration status for debugging
    const hasValidConfig = config.apiKey && config.projectId && config.appId
    console.log('[Firebase] Configuration status:', {
      hasConfig: hasValidConfig,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 6)}...` : 'MISSING',
      projectId: config.projectId || 'MISSING',
      appId: config.appId ? `${config.appId.substring(0, 10)}...` : 'MISSING'
    })
    
    if (!hasValidConfig) {
      console.warn('[Firebase] CRITICAL: Firebase configuration incomplete!', {
        'Required Environment Variables': [
          'VITE_FIREBASE_API_KEY',
          'VITE_FIREBASE_PROJECT_ID', 
          'VITE_FIREBASE_APP_ID',
          'VITE_FIREBASE_AUTH_DOMAIN',
          'VITE_FIREBASE_STORAGE_BUCKET',
          'VITE_FIREBASE_MESSAGING_SENDER_ID',
          'VITE_FIREBASE_MEASUREMENT_ID'
        ],
        'Current Values': config
      })
    }
    
    return config
  }

  /**
   * Check if Firebase is available and initialized
   */
  get available() {
    return this.isAvailable && this.isInitialized
  }

  /**
   * Get Analytics instance (null if not available)
   */
  getAnalytics() {
    return this.analytics
  }

  /**
   * Get Performance instance (null if not available)
   */
  getPerformance() {
    return this.performance
  }

  /**
   * Get Remote Config instance (null if not available)
   */
  getRemoteConfig() {
    return this.remoteConfig
  }

  /**
   * Execute callback only if Firebase is available
   * Provides graceful degradation for Firebase features
   */
  whenAvailable(callback) {
    if (this.available) {
      try {
        return callback()
      } catch (error) {
        console.warn('[Firebase] Operation failed:', error.message)
        return null
      }
    }
    return null
  }

  /**
   * Execute async callback only if Firebase is available
   */
  async whenAvailableAsync(callback) {
    if (this.available) {
      try {
        return await callback()
      } catch (error) {
        console.error('[Firebase] Async operation failed:', {
          error: error.message,
          operation: callback.name || 'anonymous',
          stack: error.stack?.split('\n')[1]
        })
        return null
      }
    } else {
      console.warn('[Firebase] Operation skipped - Firebase not available:', {
        initialized: this.isInitialized,
        available: this.isAvailable,
        reason: !this.isInitialized ? 'Not initialized' : 'Initialization failed'
      })
    }
    return null
  }
}

// Create singleton instance
const firebaseManager = new FirebaseManager()

export default firebaseManager