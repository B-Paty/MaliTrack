import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';

export interface DeviceInfo {
  platform: string;
  isNative: boolean;
  isWeb: boolean;
  isMobile: boolean;
}

export function useCapacitor() {
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
          await StatusBar.setStyle({ style: Style.Default });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
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

  return deviceInfo;
}