/**
 * Performance Service - Monitor app performance, crashes, and user experience
 * 
 * Handles:
 * - Page load performance metrics
 * - JavaScript error tracking and crash reporting  
 * - Custom traces for critical game operations
 * - Mobile performance monitoring
 * - Algorithm execution time tracking
 */

import { trace } from 'firebase/performance'
import firebaseManager from './FirebaseManager.js'

class PerformanceService {
  constructor() {
    this.isEnabled = false
    this.performance = null
    this.activeTraces = new Map()
    this.errorCount = 0
    this.sessionStartTime = Date.now()
  }

  /**
   * Initialize performance monitoring service
   * Called after FirebaseManager initialization
   */
  async initialize() {
    await firebaseManager.initialize()
    
    if (firebaseManager.available && firebaseManager.getPerformance()) {
      this.performance = firebaseManager.getPerformance()
      this.isEnabled = true
      
      // Set up global error handling
      this._setupErrorHandling()
      
      // Set up performance observers for web vitals
      this._setupPerformanceObservers()
      
      // Track initial page load metrics
      this._trackPageLoadMetrics()
      
      console.log('[Performance] Service initialized with monitoring enabled')
    } else {
      console.log('[Performance] Service unavailable - monitoring disabled')
    }
  }

  /**
   * Start a custom trace for performance measurement
   */
  startTrace(traceName) {
    if (!this.isEnabled) {
      return null
    }

    return firebaseManager.whenAvailable(() => {
      if (this.activeTraces.has(traceName)) {
        console.warn(`[Performance] Trace '${traceName}' already active`)
        return this.activeTraces.get(traceName)
      }

      const traceInstance = trace(this.performance, traceName)
      traceInstance.start()
      this.activeTraces.set(traceName, traceInstance)
      
      console.log(`[Performance] Started trace: ${traceName}`)
      return traceInstance
    })
  }

  /**
   * Stop a custom trace and record metrics
   */
  stopTrace(traceName, metrics = {}) {
    if (!this.isEnabled) {
      return
    }

    firebaseManager.whenAvailable(() => {
      const traceInstance = this.activeTraces.get(traceName)
      if (!traceInstance) {
        console.warn(`[Performance] Trace '${traceName}' not found`)
        return
      }

      // Add custom metrics before stopping
      Object.entries(metrics).forEach(([key, value]) => {
        if (typeof value === 'number') {
          traceInstance.putMetric(key, value)
        }
      })

      traceInstance.stop()
      this.activeTraces.delete(traceName)
      
      console.log(`[Performance] Stopped trace: ${traceName}`, metrics)
    })
  }

  /**
   * Measure and trace exercise generation performance
   */
  async traceExerciseGeneration(targetNumber, generationFn) {
    const traceName = 'exercise_generation'
    const startTime = performance.now()
    
    this.startTrace(traceName)
    
    try {
      const result = await generationFn()
      const executionTime = performance.now() - startTime
      
      this.stopTrace(traceName, {
        target_number: targetNumber,
        execution_time_ms: Math.round(executionTime),
        success: 1,
        number_size_category: this._getNumberSizeCategory(targetNumber)
      })
      
      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      
      this.stopTrace(traceName, {
        target_number: targetNumber,
        execution_time_ms: Math.round(executionTime),
        success: 0,
        error_type: error.name || 'unknown'
      })
      
      this.recordError(error, 'exercise_generation')
      throw error
    }
  }

  /**
   * Trace pathfinding algorithm performance
   */
  async tracePathfinding(startNumber, targetNumber, pathfindingFn) {
    const traceName = 'pathfinding_algorithm'
    const startTime = performance.now()
    
    this.startTrace(traceName)
    
    try {
      const result = await pathfindingFn()
      const executionTime = performance.now() - startTime
      
      this.stopTrace(traceName, {
        start_number: startNumber,
        target_number: targetNumber,
        execution_time_ms: Math.round(executionTime),
        path_length: result?.length || 0,
        success: result ? 1 : 0
      })
      
      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      
      this.stopTrace(traceName, {
        start_number: startNumber,
        target_number: targetNumber,
        execution_time_ms: Math.round(executionTime),
        success: 0,
        error_type: error.name || 'unknown'
      })
      
      this.recordError(error, 'pathfinding_algorithm')
      throw error
    }
  }

  /**
   * Trace game UI rendering and updates
   */
  traceUIOperation(operationName, operationFn) {
    const traceName = `ui_${operationName}`
    const startTime = performance.now()
    
    this.startTrace(traceName)
    
    try {
      const result = operationFn()
      const executionTime = performance.now() - startTime
      
      this.stopTrace(traceName, {
        execution_time_ms: Math.round(executionTime),
        success: 1
      })
      
      return result
    } catch (error) {
      const executionTime = performance.now() - startTime
      
      this.stopTrace(traceName, {
        execution_time_ms: Math.round(executionTime),
        success: 0,
        error_type: error.name || 'unknown'
      })
      
      this.recordError(error, `ui_${operationName}`)
      throw error
    }
  }

  /**
   * Record JavaScript errors and exceptions
   */
  recordError(error, context = 'unknown') {
    if (!this.isEnabled) {
      return
    }

    this.errorCount++
    
    const errorData = {
      error_message: error.message || 'Unknown error',
      error_type: error.name || 'Error',
      error_stack: error.stack || '',
      context: context,
      timestamp: Date.now(),
      session_age_seconds: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      user_agent: navigator.userAgent,
      url: window.location.href,
      error_count_in_session: this.errorCount
    }

    // Create custom trace for error tracking
    const errorTrace = this.startTrace('javascript_error')
    if (errorTrace) {
      Object.entries(errorData).forEach(([key, value]) => {
        if (typeof value === 'number') {
          errorTrace.putMetric(key, value)
        } else {
          errorTrace.putAttribute(key, String(value).substring(0, 100)) // Firebase attribute limit
        }
      })
      
      setTimeout(() => {
        this.stopTrace('javascript_error', { error_recorded: 1 })
      }, 10)
    }

    console.error('[Performance] Error recorded:', errorData)
  }

  /**
   * Track page load and initialization performance
   */
  _trackPageLoadMetrics() {
    if (!this.isEnabled) {
      return
    }

    // Wait for page load to complete
    if (document.readyState === 'complete') {
      this._recordPageLoadMetrics()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this._recordPageLoadMetrics(), 100)
      })
    }
  }

  _recordPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (!navigation) {
      return
    }

    const pageLoadTrace = this.startTrace('page_load')
    if (pageLoadTrace) {
      const metrics = {
        dns_time_ms: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
        connect_time_ms: Math.round(navigation.connectEnd - navigation.connectStart),
        request_time_ms: Math.round(navigation.responseEnd - navigation.requestStart),
        dom_content_loaded_ms: Math.round(navigation.domContentLoadedEventEnd - navigation.navigationStart),
        load_complete_ms: Math.round(navigation.loadEventEnd - navigation.navigationStart)
      }

      setTimeout(() => {
        this.stopTrace('page_load', metrics)
      }, 10)
    }
  }

  /**
   * Set up global error handling
   */
  _setupErrorHandling() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordError(event.error || new Error(event.message), 'global_error')
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError(
        new Error(event.reason?.message || event.reason || 'Unhandled promise rejection'),
        'unhandled_promise'
      )
    })
  }

  /**
   * Set up performance observers for web vitals
   */
  _setupPerformanceObservers() {
    // Observe layout shifts (CLS)
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          
          if (clsValue > 0) {
            const clsTrace = this.startTrace('cumulative_layout_shift')
            if (clsTrace) {
              setTimeout(() => {
                this.stopTrace('cumulative_layout_shift', {
                  cls_score: Math.round(clsValue * 1000) / 1000
                })
              }, 10)
            }
          }
        })
        
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('[Performance] CLS observer setup failed:', error.message)
      }
    }
  }

  /**
   * Get current performance metrics summary
   */
  getPerformanceSummary() {
    return {
      session_duration_seconds: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      active_traces_count: this.activeTraces.size,
      error_count: this.errorCount,
      memory_usage_mb: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null,
      is_enabled: this.isEnabled
    }
  }

  /**
   * Categorize numbers by size for performance tracking
   */
  _getNumberSizeCategory(number) {
    const num = Math.abs(number)
    if (num < 100) return 'small'
    if (num < 10000) return 'medium' 
    if (num < 1000000) return 'large'
    return 'very_large'
  }
}

// Create singleton instance
const performanceService = new PerformanceService()

export default performanceService