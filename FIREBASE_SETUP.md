# Firebase Integration Setup Guide

## Quick Start

1. **Copy environment configuration:**
   ```bash
   cp .env.example .env.local
   ```

2. **Create Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project or select existing one
   - Enable Analytics, Performance Monitoring, and Remote Config

3. **Get Firebase configuration:**
   - In project settings → General → Your apps
   - Copy the config object values to `.env.local`

4. **Build and test:**
   ```bash
   npm run build
   npm run preview
   ```
   The app will be available at http://localhost:4173/ (or 4174+ if port is in use)

## Environment Variables

Update `.env.local` with your Firebase project values:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com  
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebase.storage
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Firebase Services Enabled

### ✅ Firebase Analytics
- **Purpose**: Track game completion, performance, user engagement
- **Events Tracked**:
  - `exercise_completed` - Game completions with efficiency metrics
  - `level_unlocked` - Progression tracking  
  - `mastery_achieved` - Master status achievements
  - `hint_used` - Hint system usage patterns
  - `operation_used` - Button click patterns
  - `tour_completed` - Tutorial completion tracking
  - `language_changed` - Localization preferences
  - `game_mode_switched` - Normal/Free Play mode usage

### ✅ Performance Monitoring  
- **Purpose**: Monitor app performance, crashes, loading times
- **Metrics Tracked**:
  - Page load performance (FCP, LCP)
  - JavaScript errors and crashes
  - Exercise generation performance
  - UI operation execution times
  - Mobile performance metrics

### ✅ Remote Config
- **Purpose**: A/B testing, feature flags, dynamic parameters
- **Configuration Options**:
  - Feature toggles (tour, hints, game modes)
  - Difficulty parameters (efficiency requirements)
  - Algorithm settings (BFS limits, timeouts) 
  - UI behavior (animations, preview mode)
  - Beta feature rollouts

## Development Mode

Firebase services initialize automatically but gracefully degrade if unavailable:

```javascript
// Dev tools available in browser console:
window.doxinyDev.firebase.analytics   // Analytics service  
window.doxinyDev.firebase.performance // Performance service
window.doxinyDev.firebase.remoteConfig // Remote Config service
```

## Architecture 

- **Service Layer**: `src/services/firebase/` - Isolated Firebase integration
- **Graceful Degradation**: Game works offline without Firebase
- **Bundle Size**: ~90KB additional (Analytics: 15KB, Performance: 25KB, Remote Config: 50KB)
- **Lazy Loading**: Firebase loads after critical game UI renders
- **Error Handling**: All Firebase operations have fallbacks

## Verify Installation

1. **Check Console**: Look for Firebase initialization logs
2. **Test Analytics**: Complete an exercise, check Firebase Console → Analytics → Events tab  
3. **Test Performance**: Monitor Firebase Console → Performance tab for traces
4. **Test Remote Config**: Check Firebase Console → Remote Config for parameter updates

## Bundle Analysis

```bash
npm run build
# Check dist/ folder size - should be ~150KB total
```

## Privacy & Data Collection

- **Anonymous Data Only**: No personal information collected
- **Game Metrics**: Completion times, efficiency, difficulty progression
- **User Preferences**: Language, game mode, settings (stored locally)
- **Performance Data**: Load times, errors, device/browser info
- **No User Accounts**: Fully anonymous analytics without authentication

## Troubleshooting

**Firebase not loading?**
- Check `.env.local` file exists and has correct values
- Verify Firebase project settings match environment variables
- Check browser console for initialization errors

**Analytics events not appearing?**
- Events may take 5-15 minutes to appear in Firebase console
- Check browser developer tools → Network tab for Firebase requests
- Verify `window.doxinyDev.firebase.analytics` shows service as enabled

**Bundle size too large?**
- Consider removing services not needed (edit `FirebaseManager.js`)
- Performance Monitoring has largest impact (~25KB)
- Remote Config can be disabled for simple deployments

**MIME type errors on preview?**
- Ensure `vite.config.js` has `base: '/'` for local testing
- For GitHub Pages deployment, change to `base: '/your-repo-name/'`
- Run `npm run build` after changing base configuration

---

**Next Steps**: Once Firebase is configured, consider implementing Phase 2 social features (anonymous leaderboards, achievement sharing).