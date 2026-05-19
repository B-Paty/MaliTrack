import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';
import { useTheme } from '@/components/layout/ThemeProvider';

export interface DeviceInfo {
  platform: string;
  isNative: boolean;
  isWeb: boolean;
  isMobile: boolean;
}

export function useCapacitor(theme?: string) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'web',
    isNative: false,
    isWeb: true,
    isMobile: false
  });

  useEffect(() => {
    const initializeCapacitor = async () => {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform();
      
      // Get device information
      let isMobile = false;
      if (isNative) {
        try {
          const info = await Device.getInfo();
          isMobile = info.platform === 'ios' || info.platform === 'android';
        } catch (error) {
          console.warn('Could not get device info:', error);
        }
      } else {
        // Check if it's mobile web
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      }

      setDeviceInfo({
        platform,
        isNative,
        isWeb: !isNative,
        isMobile
      });

      // Configure status bar for native apps
      if (isNative) {
        try {
          // Configure status bar based on theme
          const isDarkTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          
          // Enable overlay mode for proper safe area handling
          await StatusBar.setOverlaysWebView({ overlay: true });
          
          if (isDarkTheme) {
            // Dark theme: light content (white text/icons)
            await StatusBar.setStyle({ style: Style.Light });
          } else {
            // Light theme: dark content (black text/icons)
            await StatusBar.setStyle({ style: Style.Dark });
          }
          
          // Add safe area padding to the root element
          const root = document.documentElement;
          const info = await Device.getInfo();
          if (info.platform === 'ios') {
            // iOS needs safe area insets
            root.style.setProperty('--safe-area-top', 'env(safe-area-inset-top)');
            root.style.setProperty('--safe-area-bottom', 'env(safe-area-inset-bottom)');
          } else if (info.platform === 'android') {
            // Android needs status bar height padding
            root.style.setProperty('--safe-area-top', '24px'); // Standard Android status bar height
            root.style.setProperty('--safe-area-bottom', '0px');
          }
        } catch (error) {
          console.warn('Could not configure status bar:', error);
        }

        // Hide splash screen after app is ready
        try {
          await SplashScreen.hide();
        } catch (error) {
          console.warn('Could not hide splash screen:', error);
        }
      }
    };

    initializeCapacitor();
  }, []);

  // Update status bar when theme changes
  useEffect(() => {
    const updateStatusBar = async () => {
      if (deviceInfo.isNative) {
        try {
          const isDarkTheme = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
          
          if (isDarkTheme) {
            await StatusBar.setStyle({ style: Style.Light });
          } else {
            await StatusBar.setStyle({ style: Style.Dark });
          }
        } catch (error) {
          console.warn('Could not update status bar:', error);
        }
      }
    };

    updateStatusBar();
  }, [theme, deviceInfo.isNative]);

  return deviceInfo;
}