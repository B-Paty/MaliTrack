# QSA Accounting - Mobile Development Guide

## Overview

Your QSA Accounting System is now configured as a **Progressive Web App (PWA)** with **Capacitor** for native iOS and Android development.

## 🚀 Quick Start

### Web Development (PWA)
```bash
npm run dev          # Development server
npm run build        # Build PWA
npm run preview      # Preview PWA build
```

### Mobile Development
```bash
npm run mobile:build    # Build and sync to mobile platforms
npm run mobile:android  # Open Android project in Android Studio
npm run mobile:ios      # Open iOS project in Xcode
```

### Mobile Testing
```bash
npm run mobile:run:android  # Build and run on Android device/emulator
npm run mobile:run:ios      # Build and run on iOS device/simulator
```

## 📱 Platform Features

### Progressive Web App (PWA)
- ✅ **Installable** - Users can install from browser
- ✅ **Offline Support** - Works without internet connection
- ✅ **App-like Experience** - Full screen, no browser UI
- ✅ **Auto Updates** - Automatically updates when new version available

### Native Mobile Features
- ✅ **File System Access** - Save/export files to device storage
- ✅ **Native Sharing** - Share reports via device share menu
- ✅ **Status Bar Control** - Customize status bar appearance
- ✅ **Splash Screen** - Professional app launch experience
- ✅ **Device Information** - Access device details for optimization

## 🛠️ Development Workflow

### 1. Web Development
1. Develop features in browser using `npm run dev`
2. Test responsive design on mobile viewports
3. Build and test PWA functionality

### 2. Mobile Testing
1. Build the app: `npm run mobile:build`
2. Test on Android: `npm run mobile:android`
3. Test on iOS: `npm run mobile:ios`

### 3. Adding Native Features
```typescript
// Example: Using native file export
import { MobileExportService } from '@/utils/mobileExport';

// Export CSV data
await MobileExportService.exportCSV('inventory.csv', csvData);

// Export PDF report
await MobileExportService.exportPDF('report.pdf', htmlContent);
```

## 📋 Prerequisites

### For Android Development
- **Android Studio** - Download from [developer.android.com](https://developer.android.com/studio)
- **Java Development Kit (JDK)** - Version 11 or higher
- **Android SDK** - Installed via Android Studio

### For iOS Development (macOS only)
- **Xcode** - Download from Mac App Store
- **iOS Simulator** - Included with Xcode
- **Apple Developer Account** - For device testing and App Store

## 🔧 Configuration

### Capacitor Configuration (`capacitor.config.ts`)
```typescript
const config: CapacitorConfig = {
  appId: 'com.qsa.accounting',
  appName: 'QSA Accounting',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff'
    }
  }
};
```

### PWA Configuration (`vite.config.ts`)
- **Service Worker** - Automatic updates and offline support
- **Web Manifest** - App metadata and icons
- **Caching Strategy** - Optimized for accounting data

## 📦 Available Plugins

### Currently Installed
- `@capacitor/status-bar` - Status bar customization
- `@capacitor/splash-screen` - App launch screen
- `@capacitor/filesystem` - File system access
- `@capacitor/share` - Native sharing
- `@capacitor/device` - Device information

### Recommended Additional Plugins
```bash
# Camera for receipt scanning
npm install @capacitor/camera

# Push notifications for alerts
npm install @capacitor/push-notifications

# Biometric authentication
npm install @capacitor/biometric-auth

# Local notifications
npm install @capacitor/local-notifications
```

## 🎨 Mobile UI Optimizations

### Already Implemented
- ✅ **Responsive Design** - Optimized for all screen sizes
- ✅ **Touch-Friendly** - Proper touch targets (44px minimum)
- ✅ **Mobile Navigation** - Bottom navigation on mobile
- ✅ **Dialog Centering** - Proper modal positioning
- ✅ **Mobile Forms** - Optimized input fields

### Mobile-Specific Features
- **Safe Area Handling** - Respects device notches and home indicators
- **Keyboard Handling** - Proper viewport adjustment
- **Gesture Support** - Swipe and touch gestures
- **Performance Optimization** - Lazy loading and code splitting

## 🚀 Deployment

### PWA Deployment
1. Build: `npm run build`
2. Deploy `dist/` folder to web server
3. Ensure HTTPS for PWA features

### App Store Deployment

#### Android (Google Play Store)
1. Build: `npm run mobile:android`
2. Generate signed APK in Android Studio
3. Upload to Google Play Console

#### iOS (Apple App Store)
1. Build: `npm run mobile:ios`
2. Archive and validate in Xcode
3. Upload to App Store Connect

## 🔍 Testing

### PWA Testing
- **Lighthouse** - PWA audit in Chrome DevTools
- **Application Tab** - Service worker and manifest testing
- **Network Tab** - Offline functionality testing

### Mobile Testing
- **Device Testing** - Test on real devices
- **Emulator/Simulator** - Test different screen sizes
- **Performance** - Monitor memory and CPU usage

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Android Development](https://developer.android.com/)
- [iOS Development](https://developer.apple.com/)

## 🆘 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Capacitor cache
npx cap clean
```

#### Android Issues
```bash
# Sync Android project
npx cap sync android

# Clean Android build
cd android && ./gradlew clean && cd ..
```

#### iOS Issues
```bash
# Sync iOS project
npx cap sync ios

# Clean iOS build (in Xcode: Product > Clean Build Folder)
```

## 🎯 Next Steps

1. **Test PWA** - Install and test web app functionality
2. **Setup Development Environment** - Install Android Studio/Xcode
3. **Test Mobile Apps** - Build and test on devices
4. **Add Native Features** - Implement camera, notifications, etc.
5. **Optimize Performance** - Bundle splitting and caching
6. **Prepare for Deployment** - App store assets and metadata

Your accounting system is now ready for mobile deployment! 🎉