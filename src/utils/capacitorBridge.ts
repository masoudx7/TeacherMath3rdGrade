import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export interface NativeBackHandlerOptions {
  handleBackPress: () => boolean;
}

/**
 * Initializes native Android plugins (StatusBar, SplashScreen, Hardware Back Button)
 * while safely acting as a no-op on standard Web browsers.
 */
export function initCapacitorBridge(options?: NativeBackHandlerOptions): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  // Configure Android status bar to match the warm cream header
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#FFFDF8' }).catch(() => {});

  // Hide native launch splash once React UI mounts
  SplashScreen.hide().catch(() => {});

  let listenerHandle: { remove: () => Promise<void> } | null = null;
  let disposed = false;

  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (options?.handleBackPress && options.handleBackPress()) {
      return;
    }
    if (canGoBack) {
      window.history.back();
      return;
    }
    CapApp.minimizeApp().catch(() => {
      CapApp.exitApp().catch(() => {});
    });
  })
    .then((handle) => {
      if (disposed) {
        handle.remove().catch(() => {});
      } else {
        listenerHandle = handle;
      }
    })
    .catch(() => {});

  return () => {
    disposed = true;
    if (listenerHandle) {
      listenerHandle.remove().catch(() => {});
    }
  };
}
