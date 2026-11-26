import { Capacitor } from '@capacitor/core';

const API_BASE_OVERRIDE_KEY = 'ostad_dana_api_base_url_v1';
const DEFAULT_REMOTE_API_BASE = 'https://ais-pre-7ra5mlfkkz7nj6rqcvb6hq-339236369888.europe-west2.run.app';

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function getPlatformType(): 'android' | 'ios' | 'web' {
  try {
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
      return platform;
    }
    return 'web';
  } catch {
    return 'web';
  }
}

function normalizeBaseUrl(raw?: string | null): string {
  if (!raw) return '';
  return raw.trim().replace(/\/+$/, '');
}

/**
 * Resolves the active API base URL:
 * - On Web (browser): uses relative paths ('') by default unless VITE_API_BASE_URL is explicitly set.
 * - On Android / iOS native Capacitor builds: uses localStorage override -> VITE_API_BASE_URL -> production Cloud Run URL.
 */
export function getApiBaseUrl(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const override = normalizeBaseUrl(window.localStorage.getItem(API_BASE_OVERRIDE_KEY));
      if (override) return override;
    }
  } catch {
    // Ignore storage errors
  }

  const envBase = normalizeBaseUrl((import.meta as any)?.env?.VITE_API_BASE_URL);
  if (envBase) return envBase;

  if (isNativeApp()) {
    return DEFAULT_REMOTE_API_BASE;
  }

  return '';
}

export function setApiBaseUrlOverride(url: string): void {
  try {
    const clean = normalizeBaseUrl(url);
    if (!clean) {
      window.localStorage.removeItem(API_BASE_OVERRIDE_KEY);
    } else {
      window.localStorage.setItem(API_BASE_OVERRIDE_KEY, clean);
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Converts a relative '/api/...' path into a Web-compatible relative URL
 * or a full HTTPS URL when running inside the Android Capacitor shell.
 */
export function apiUrl(path: string): string {
  if (!path) return getApiBaseUrl();
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
