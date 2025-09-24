'use client';

import { useState, useEffect } from 'react';
import { X, Shield, Eye, BarChart3, Settings } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
  functional: false,
};

interface CookieConsentProps {
  onConsentChange?: (preferences: CookiePreferences) => void;
}

export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    setHasLoaded(true);

    // Check if user has already made a choice
    const savedPreferences = localStorage.getItem('cookie-preferences');
    const consentTimestamp = localStorage.getItem('cookie-consent-timestamp');

    if (savedPreferences && consentTimestamp) {
      // Check if consent is older than 1 year (GDPR requirement)
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      const timestamp = parseInt(consentTimestamp, 10);

      if (timestamp > oneYearAgo) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        onConsentChange?.(parsed);
        return;
      }
    }

    // Show banner if no valid consent found
    setIsVisible(true);
  }, [onConsentChange]);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-timestamp', Date.now().toString());
    setPreferences(prefs);
    setIsVisible(false);
    onConsentChange?.(prefs);

    // Trigger analytics initialization if consent given
    if (prefs.analytics) {
      window.dispatchEvent(new CustomEvent('analytics-consent-granted'));
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    savePreferences(defaultPreferences);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Don't render on server side or if already consented
  // Temporarily disable cookie consent for development/testing if env var is set
  if (process.env.NEXT_PUBLIC_DISABLE_COOKIE_CONSENT === 'true') {
    return null;
  }

  if (!hasLoaded || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner - No blocking backdrop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        data-test-id="cookie-consent-banner"
      >
        <div className="max-w-7xl mx-auto p-6">
          {!showDetails ? (
            /* Simple Banner */
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    We value your privacy
                  </h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We use cookies to enhance your browsing experience, serve
                  personalized content, and analyze our traffic. By clicking
                  &ldquo;Accept All&rdquo;, you consent to our use of cookies.
                  You can manage your preferences or learn more about our data
                  practices in our{' '}
                  <a
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                <button
                  onClick={() => setShowDetails(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Preferences
                </button>

                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Reject All
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  data-test-id="accept-all-cookies"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            /* Detailed Preferences */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cookie Preferences
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Close preferences"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">
                        Necessary Cookies
                      </h4>
                      <span className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Essential for the website to function properly. These
                      cookies enable core functionality such as security,
                      network management, and accessibility.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      updatePreference('analytics', e.target.checked)
                    }
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">
                        Analytics Cookies
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Help us understand how visitors interact with our website
                      by collecting and reporting information anonymously.
                      Includes Google Analytics and Microsoft Clarity.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      updatePreference('marketing', e.target.checked)
                    }
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">
                        Marketing Cookies
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Used to track visitors across websites to display relevant
                      advertisements and measure advertising campaign
                      effectiveness.
                    </p>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) =>
                      updatePreference('functional', e.target.checked)
                    }
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">
                        Functional Cookies
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Enable enhanced functionality like chat widgets, social
                      media features, and personalized content based on your
                      preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleRejectAll}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Reject All
                </button>

                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Preferences
                </button>

                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Accept All
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center pt-2">
                Your preferences will be remembered for one year. You can change
                them at any time by visiting our{' '}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Hook to get current cookie preferences
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('cookie-preferences');
    const consentTimestamp = localStorage.getItem('cookie-consent-timestamp');

    if (savedPreferences && consentTimestamp) {
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      const timestamp = parseInt(consentTimestamp, 10);

      if (timestamp > oneYearAgo) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }

    setIsLoading(false);
  }, []);

  return { preferences, isLoading };
}

// Utility to check if analytics consent is granted
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  const savedPreferences = localStorage.getItem('cookie-preferences');
  if (!savedPreferences) return false;

  try {
    const preferences = JSON.parse(savedPreferences);
    return preferences.analytics === true;
  } catch {
    return false;
  }
}

// Utility to check if marketing consent is granted
export function hasMarketingConsent(): boolean {
  if (typeof window === 'undefined') return false;

  const savedPreferences = localStorage.getItem('cookie-preferences');
  if (!savedPreferences) return false;

  try {
    const preferences = JSON.parse(savedPreferences);
    return preferences.marketing === true;
  } catch {
    return false;
  }
}
