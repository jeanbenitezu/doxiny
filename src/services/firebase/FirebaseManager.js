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
      // Check if Firebase config is available
      const config = this._getFirebaseConfig()
      if (!config.apiKey) {
        console.warn('[Firebase] Configuration not found. Firebase features disabled.')
        this.isAvailable = false
        return false
      }

      // Initialize Firebase app
      this.app = initializeApp(config)
      console.log('[Firebase] App initialized successfully')

      // Initialize services with availability checks
      await this._initializeServices()
      
      this.isInitialized = true
      this.isAvailable = true
      console.log('[Firebase] All services initialized')
      return true

    } catch (error) {
      console.warn('[Firebase] Initialization failed:', error.message)
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
    return typeof __FIREBASE_CONFIG__ !== 'undefined' ? __FIREBASE_CONFIG__ : {}
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
        console.warn('[Firebase] Async operation failed:', error.message)
        return null
      }
    }
    return null
  }
}

// Create singleton instance
const firebaseManager = new FirebaseManager()

export default firebaseManager