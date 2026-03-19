# PWA Service Worker Auto-Update Guide

## 🚀 Force Service Worker Updates on Deployment

Your Number Puzzle PWA now includes automatic service worker updates that force clients to update when you deploy new versions.

## 📋 How It Works

### 1. **Dynamic Cache Versioning**
- Service worker uses build timestamp in cache names
- Each deployment gets a unique cache identifier
- Old caches are automatically cleaned up

### 2. **Update Detection**
- App checks for updates every 30 seconds
- Detects when new service worker is available
- Shows user-friendly update notification

### 3. **User Experience**
- Blue banner appears: "🚀 New version available!"
- User clicks "Update Now" button
- App immediately updates to latest version

## 🛠️ Deployment Process

### For Development/Testing:
```bash
npm run dev
```

### For Production Deployment:

#### Option 1: Automated (Recommended)
```bash
npm run deploy:build
```
This will:
1. Update service worker with build timestamp
2. Build the production version
3. Create deployable dist/ folder

#### Option 2: Manual Steps
```bash
# 1. Update service worker version
npm run deploy:prepare

# 2. Build for production  
npm run build

# 3. Deploy the dist/ folder to your hosting platform
```

#### Option 3: Preview Before Deploy
```bash
npm run deploy:preview
```
This builds and serves locally for final testing.

## ⚙️ Configuration Options

### Custom Build Timestamp
Edit `scripts/update-sw-version.js` to use:
- Git commit hash: `git rev-parse --short HEAD`
- Version from package.json
- Environment-specific identifiers

### Update Frequency
In `main.js`, change the update check interval:
```javascript
// Check every 60 seconds instead of 30
setInterval(() => {
  registration.update();
}, 60000);
```

### Notification Styling
Customize the update banner in `showUpdateNotification()`:
- Colors, positioning, animations
- Custom messages per environment
- Auto-dismiss timeout

## 📱 Testing Updates

### Local Testing:
1. Run `npm run dev`
2. Open app in browser
3. Run `npm run deploy:prepare` 
4. Refresh browser - should see update notification

### Production Testing:
1. Deploy version A
2. Make changes, run `npm run deploy:build`
3. Deploy version B
4. Users with version A will see update prompt

## 🔧 Advanced Features

### Environment-Specific Caching:
```javascript
// In sw.js, add environment detection
const ENV = self.location.hostname.includes('localhost') ? 'dev' : 'prod';
const CACHE_NAME = `number-puzzle-${ENV}-v${CACHE_VERSION}-${BUILD_TIMESTAMP}`;
```

### Version Display:
Show current version to users:
```javascript
// Add to main.js
console.log('App Version:', BUILD_TIMESTAMP);
```

### Rollback Support:
Maintain previous version cache for emergency rollbacks:
```javascript
// Keep last 2 versions instead of deleting all old caches
const keepVersions = 2;
```

## ✅ Verification

After deployment, verify updates work:

1. **Console Logs**: Check browser dev tools
   - "🔧 Service Worker: Installing..."
   - "🚀 Service Worker: Activating..."
   - "✅ Service Worker: Activation complete"

2. **Cache Management**: Application tab > Storage
   - Old caches deleted automatically
   - New cache with latest timestamp

3. **Update Flow**: Simulate by:
   - Deploying version 1
   - Making small change
   - Running deploy:build
   - Previous users get update notification

## 🚨 Troubleshooting

### Updates Not Appearing:
- Clear browser cache manually
- Check service worker registration errors
- Verify cache names are changing

### Update Banner Not Showing:
- Check console for updatefound events
- Ensure registration.update() is being called
- Test with hard refresh (Ctrl+F5)

### Old Versions Persisting:
- Verify cache cleanup in activate event
- Check for registration scope issues
- Use browser dev tools to manually clear

## 🎯 Production Checklist

Before each deployment:

- [ ] Run `npm run deploy:build`
- [ ] Test update notification locally
- [ ] Verify all features work in built version
- [ ] Deploy dist/ folder to hosting platform
- [ ] Monitor console logs for errors
- [ ] Test update flow with previous version users

Your PWA will now automatically notify users of updates and seamlessly upgrade to new versions! 🎉