// Utilities for iOS (iPhone/iPad) & PWA Web Push Notifications

export interface DevicePushCapabilities {
    isIOS: boolean;
    isStandalone: boolean;
    hasServiceWorker: boolean;
    hasNotification: boolean;
    permission: NotificationPermission;
    canPushDirectly: boolean; // true if desktop/android OR iOS standalone with permission
    needsAddToHomeScreen: boolean; // true if iOS Safari not yet in standalone mode
}

/**
 * Checks if current browser environment is running on iOS (iPhone, iPod, iPad)
 */
export const isIOSDevice = (): boolean => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    const isStandardIOS = /iPad|iPhone|iPod/.test(ua);
    const isMacWithTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1; // iPadOS 13+
    return isStandardIOS || isMacWithTouch;
};

/**
 * Checks if the web app is running in Standalone (PWA) mode
 */
export const isStandaloneMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    const nav: any = window.navigator;
    const isIOSStandalone = nav.standalone === true;
    const isPWAStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.matchMedia('(display-mode: fullscreen)').matches;
    return isIOSStandalone || isPWAStandalone;
};

/**
 * Get comprehensive push capabilities for the current device
 */
export const getDeviceCapabilities = (): DevicePushCapabilities => {
    const isIOS = isIOSDevice();
    const isStandalone = isStandaloneMode();
    const hasServiceWorker = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    const hasNotification = typeof window !== 'undefined' && 'Notification' in window;
    const permission: NotificationPermission = hasNotification ? Notification.permission : 'denied';

    const canPushDirectly = hasNotification && (!isIOS || isStandalone);
    const needsAddToHomeScreen = isIOS && !isStandalone;

    return {
        isIOS,
        isStandalone,
        hasServiceWorker,
        hasNotification,
        permission,
        canPushDirectly,
        needsAddToHomeScreen
    };
};

/**
 * Register the Service Worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        console.log('[SW] Service Worker registered successfully:', registration.scope);
        return registration;
    } catch (err) {
        console.error('[SW] Service Worker registration failed:', err);
        return null;
    }
};

/**
 * Requests push permission from the browser / operating system
 */
export const requestPushPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'denied';
    }

    // Always ensure service worker is active before requesting
    await registerServiceWorker();

    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (err) {
        console.error('Failed to request notification permission:', err);
        return 'denied';
    }
};

/**
 * Triggers a test push notification through the Service Worker (works on iOS Standalone & Desktop)
 */
export const triggerLocalPushNotification = async (payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
}): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    // Check permission first
    if ('Notification' in window && Notification.permission !== 'granted') {
        const req = await requestPushPermission();
        if (req !== 'granted') return false;
    }

    // 1. Try via Service Worker Registration (Standard for iOS PWA and Android)
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            if (registration && registration.showNotification) {
                await registration.showNotification(payload.title, {
                    body: payload.body,
                    icon: '/photos/logofront.png',
                    badge: '/photos/logofront.png',
                    vibrate: [200, 100, 200, 100, 200],
                    tag: payload.tag || `bakers-test-${Date.now()}`,
                    renotify: true,
                    data: {
                        url: payload.url || '/admin',
                        timestamp: Date.now()
                    }
                } as any);
                return true;
            }
        } catch (swErr) {
            console.warn('[Push] ServiceWorker showNotification failed, trying fallback:', swErr);
        }
    }

    // 2. Fallback to standard window.Notification (Desktop)
    if ('Notification' in window && Notification.permission === 'granted') {
        try {
            const notif = new Notification(payload.title, {
                body: payload.body,
                icon: '/photos/logofront.png',
                tag: payload.tag || `bakers-test-${Date.now()}`
            });
            notif.onclick = () => {
                window.focus();
                if (payload.url) {
                    window.location.href = payload.url;
                }
            };
            return true;
        } catch (err) {
            console.error('[Push] Standard notification failed:', err);
        }
    }

    return false;
};
