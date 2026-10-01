/**
 * Desktop (System-level) HTML5 Browser Notification Service for BakersRug Admin.
 * Works even when the browser tab is minimized or in the background.
 */

import { audioNotification } from './audioNotification';

export type DesktopPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface DesktopNotificationOptions {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    playSound?: boolean;
    onClick?: () => void;
}

class DesktopNotificationService {
    public isSupported(): boolean {
        return typeof window !== 'undefined' && 'Notification' in window;
    }

    public getPermission(): DesktopPermissionStatus {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission as DesktopPermissionStatus;
    }

    public async requestPermission(): Promise<DesktopPermissionStatus> {
        if (!this.isSupported()) return 'unsupported';

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.send({
                    title: '🔔 BakersRug Admin Notifications Active',
                    body: 'You will receive instant desktop alerts here whenever a new client inquiry arrives.',
                    playSound: true
                });
            }
            return permission as DesktopPermissionStatus;
        } catch (error) {
            console.error('Error requesting desktop notification permission:', error);
            return this.getPermission();
        }
    }

    public send(options: DesktopNotificationOptions): Notification | null {
        if (!this.isSupported()) return null;

        if (options.playSound !== false) {
            audioNotification.playChime('lead');
        }

        if (Notification.permission !== 'granted') {
            return null;
        }

        try {
            const notif = new Notification(options.title, {
                body: options.body,
                icon: options.icon || '/photos/logofront.png',
                badge: '/photos/logofront.png',
                tag: options.tag || 'bakersrug-lead',
                silent: false, // Allows OS system sound if enabled
            });

            notif.onclick = () => {
                window.focus();
                if (options.onClick) {
                    options.onClick();
                }
                notif.close();
            };

            return notif;
        } catch (e) {
            console.warn('Native desktop notification dispatch failed:', e);
            return null;
        }
    }
}

export const desktopNotification = new DesktopNotificationService();
