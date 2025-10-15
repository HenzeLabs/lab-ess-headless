/**
 * Global type declarations for analytics libraries
 */

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, unknown>,
    ) => void;
    clarity?: (
      command: 'event' | 'set' | 'start' | 'stop',
      param1: string,
      param2?: string | Record<string, unknown>,
    ) => void;
  }
}

export {};
