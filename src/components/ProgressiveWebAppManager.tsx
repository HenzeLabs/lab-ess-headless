'use client';

import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Download,
  Bell,
  Smartphone,
  Shield,
  Zap,
  Cloud,
} from 'lucide-react';

interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  hasNotificationPermission: boolean;
  lastSync: Date | null;
  cacheStatus: 'fresh' | 'stale' | 'updating';
  offlineQueue: number;
}

interface CachedProduct {
  id: string;
  title: string;
  price: string;
  image: string;
  lastCached: Date;
}

interface NotificationSettings {
  stockAlerts: boolean;
  priceUpdates: boolean;
  orderStatus: boolean;
  labNews: boolean;
}

declare global {
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function ProgressiveWebAppManager() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isOnline: true,
    isInstallable: false,
    isInstalled: false,
    hasNotificationPermission: false,
    lastSync: null,
    cacheStatus: 'fresh',
    offlineQueue: 0,
  });

  const [cachedProducts, setCachedProducts] = useState<CachedProduct[]>([]);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    stockAlerts: false,
    priceUpdates: false,
    orderStatus: true,
    labNews: false,
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'status' | 'offline' | 'notifications'
  >('status');

  useEffect(() => {
    // Check online status
    const handleOnline = () =>
      setPwaState((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () =>
      setPwaState((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if app is installable
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setPwaState((prev) => ({ ...prev, isInstallable: true }));
      setShowInstallPrompt(true);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener,
    );

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches;
      const isWebkit =
        'standalone' in window.navigator &&
        Boolean((window.navigator as { standalone?: boolean }).standalone);
      setPwaState((prev) => ({
        ...prev,
        isInstalled: isStandalone || isWebkit,
      }));
    };

    checkIfInstalled();

    // Check notification permission
    if ('Notification' in window) {
      setPwaState((prev) => ({
        ...prev,
        hasNotificationPermission: Notification.permission === 'granted',
      }));
    }

    // Initialize cached data
    initializeCachedData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener,
      );
    };
  }, []);

  const initializeCachedData = () => {
    // Simulate cached products
    const mockCachedProducts: CachedProduct[] = [
      {
        id: '1',
        title: 'Research Microscope Pro',
        price: '$15,999',
        image: '/placeholder-product.jpg',
        lastCached: new Date(),
      },
      {
        id: '2',
        title: 'High-Speed Centrifuge',
        price: '$8,499',
        image: '/placeholder-product.jpg',
        lastCached: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: '3',
        title: 'Precision Incubator',
        price: '$12,750',
        image: '/placeholder-product.jpg',
        lastCached: new Date(Date.now() - 7200000), // 2 hours ago
      },
    ];
    setCachedProducts(mockCachedProducts);
  };

  const handleInstallApp = async () => {
    if (!window.deferredPrompt) return;

    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setPwaState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      setShowInstallPrompt(false);

      // Track installation
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (
          window as {
            gtag: (event: string, action: string, params: object) => void;
          }
        ).gtag;
        gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'app_installation',
        });
      }
    }

    window.deferredPrompt = undefined;
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    const permission = await Notification.requestPermission();
    setPwaState((prev) => ({
      ...prev,
      hasNotificationPermission: permission === 'granted',
    }));

    if (permission === 'granted') {
      // Show welcome notification
      new Notification('Lab Essentials', {
        body: "You'll now receive important updates about your lab equipment!",
        icon: '/icon-192.svg',
        badge: '/icon-512.svg',
      });
    }
  };

  const syncOfflineData = async () => {
    setPwaState((prev) => ({ ...prev, cacheStatus: 'updating' }));

    // Simulate sync process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPwaState((prev) => ({
      ...prev,
      cacheStatus: 'fresh',
      lastSync: new Date(),
      offlineQueue: 0,
    }));

    // Show sync notification if permission granted
    if (pwaState.hasNotificationPermission) {
      new Notification('Data Synced', {
        body: 'Your offline data has been synchronized successfully.',
        icon: '/icon-192.svg',
      });
    }
  };

  const updateNotificationSettings = (
    setting: keyof NotificationSettings,
    value: boolean,
  ) => {
    setNotifications((prev) => ({ ...prev, [setting]: value }));
    localStorage.setItem(
      'notification-settings',
      JSON.stringify({ ...notifications, [setting]: value }),
    );
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 border-t border-border/50 pt-6">
      {/* PWA Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-[hsl(var(--brand))]" />
          <h3 className="font-semibold text-foreground">
            Mobile Lab Assistant
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {pwaState.isOnline ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm text-muted-foreground">
            {pwaState.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Installation Banner */}
      {showInstallPrompt && !pwaState.isInstalled && (
        <div className="bg-[hsl(var(--brand))]/10 border border-[hsl(var(--brand))]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-[hsl(var(--brand))] mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">
                Install Lab Essentials App
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Get instant access to your lab equipment catalog, even offline!
                Perfect for field work and lab inspections.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallApp}
                  className="bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Install App
                </button>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="text-sm text-muted-foreground hover:text-foreground px-4 py-2"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-background p-1 border border-border/30">
        {(['status', 'offline', 'notifications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-[hsl(var(--brand))] text-white'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Status Tab */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {/* PWA Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">
                  App Status
                </span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {pwaState.isInstalled ? 'Installed' : 'Browser'}
              </div>
              <div className="text-xs text-muted-foreground">
                {pwaState.isInstalled ? 'Running as app' : 'Running in browser'}
              </div>
            </div>

            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Last Sync</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {formatLastSync(pwaState.lastSync)}
              </div>
              <div className="text-xs text-muted-foreground">
                Cache status: {pwaState.cacheStatus}
              </div>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={syncOfflineData}
            disabled={!pwaState.isOnline || pwaState.cacheStatus === 'updating'}
            className="w-full bg-[hsl(var(--brand))] hover:bg-[hsl(var(--brand))]/90 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {pwaState.cacheStatus === 'updating' ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Sync Data
              </>
            )}
          </button>

          {/* Features List */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Mobile App Features</h4>
            <div className="space-y-2">
              {[
                { feature: 'Offline Product Catalog', status: 'active' },
                {
                  feature: 'Push Notifications',
                  status: pwaState.hasNotificationPermission
                    ? 'active'
                    : 'inactive',
                },
                { feature: 'Background Sync', status: 'active' },
                { feature: 'Quick Add to Cart', status: 'active' },
                { feature: 'Lab Equipment Scanner', status: 'beta' },
              ].map((item) => (
                <div
                  key={item.feature}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded"
                >
                  <span className="text-sm text-foreground">
                    {item.feature}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'beta'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Offline Tab */}
      {activeTab === 'offline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Offline Products</h4>
            <span className="text-sm text-muted-foreground">
              {cachedProducts.length} items cached
            </span>
          </div>

          <div className="space-y-3">
            {cachedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">
                    {product.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.price}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatLastSync(product.lastCached)}
                </div>
              </div>
            ))}
          </div>

          {!pwaState.isOnline && pwaState.offlineQueue > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {pwaState.offlineQueue} actions queued for sync
                </span>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Your actions will be synchronized when you&apos;re back online.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {!pwaState.hasNotificationPermission && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Enable Push Notifications
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Get instant alerts about stock updates, price changes, and
                    order status.
                  </p>
                  <button
                    onClick={requestNotificationPermission}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Enable Notifications
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">
              Notification Settings
            </h4>
            {Object.entries(notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div>
                  <div className="font-medium text-foreground text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div
                    className="text-xs text-muted-foreground"
                    id={`${key}-description`}
                  >
                    {key === 'stockAlerts' &&
                      'Get notified when items are back in stock'}
                    {key === 'priceUpdates' &&
                      'Receive alerts about price changes'}
                    {key === 'orderStatus' && 'Updates about your order status'}
                    {key === 'labNews' &&
                      'Latest lab equipment news and updates'}
                  </div>
                </div>
                <label
                  className="relative inline-flex items-center cursor-pointer"
                  aria-label={`Toggle ${key} notifications`}
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      updateNotificationSettings(
                        key as keyof NotificationSettings,
                        e.target.checked,
                      )
                    }
                    className="sr-only peer"
                    disabled={!pwaState.hasNotificationPermission}
                    aria-describedby={`${key}-description`}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PWA Benefits */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
              Mobile Lab Assistant Benefits
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• Access product catalogs without internet connection</li>
              <li>• Receive real-time stock and price alerts</li>
              <li>• Faster loading with intelligent caching</li>
              <li>• Works seamlessly on all devices and screen sizes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
