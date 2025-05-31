/**
 * @file browserTypes.ts
 * @version 1.1.0
 * @lastModified 2025-05-19
 * @changelog Initial implementation of browser detection types
 *
 * Type definitions for browser detection
 *
 * Key features:
 * - Browser type enumeration
 * - Device type enumeration
 * - Operating system enumeration
 * - Browser quirk interfaces
 */

/**
 * Enumeration of supported browser types
 */
export enum BrowserType {
  Chrome = 'chrome',
  Firefox = 'firefox',
  Safari = 'safari',
  Edge = 'edge',
  IE = 'ie',
  Opera = 'opera',
  Samsung = 'samsung',
  UCBrowser = 'uc',
  Chromium = 'chromium',
  Unknown = 'unknown'
}

/**
 * Browser version information
 */
export interface BrowserVersion {
  /** Major version number */
  major: number;
  /** Minor version number */
  minor: number;
  /** Patch version number (if available) */
  patch?: number;
  /** Full version string */
  full: string;
}

/**
 * Browser information structure
 */
export interface BrowserInfo {
  /** Type of browser */
  type: BrowserType;
  /** Browser version */
  version: BrowserVersion;
  /** User agent string */
  userAgent: string;
  /** Browser engine (e.g., Blink, Gecko, WebKit) */
  engine?: string;
  /** Is this a headless browser? */
  isHeadless: boolean;
}

/**
 * Enumeration of device types
 */
export enum DeviceType {
  Desktop = 'desktop',
  Mobile = 'mobile',
  Tablet = 'tablet',
  TV = 'tv',
  Console = 'console',
  Unknown = 'unknown'
}

/**
 * Enumeration of operating systems
 */
export enum OperatingSystem {
  Windows = 'windows',
  MacOS = 'macos',
  Linux = 'linux',
  Android = 'android',
  iOS = 'ios',
  ChromeOS = 'chromeos',
  WindowsPhone = 'windowsphone',
  Unknown = 'unknown'
}

/**
 * Operating system information
 */
export interface OSInfo {
  /** Type of operating system */
  type: OperatingSystem;
  /** Version string (if available) */
  version?: string;
  /** Is this a mobile OS? */
  isMobile: boolean;
  /** Is this a touch-enabled OS? */
  isTouchEnabled: boolean;
}

/**
 * Device information structure
 */
export interface DeviceInfo {
  /** Type of device */
  type: DeviceType;
  /** Operating system information */
  os: OSInfo;
  /** Is this a touch-enabled device? */
  hasTouch: boolean;
  /** Does this device have pointer events? */
  hasPointer: boolean;
  /** Device pixel ratio (or 1 if not available) */
  pixelRatio: number;
  /** Device orientation (landscape or portrait) */
  orientation: 'landscape' | 'portrait';
}

/**
 * Browser-specific quirks that affect coordinate calculations
 */
export interface BrowserQuirks {
  /** Does this browser have DPI scaling issues? */
  hasDpiScalingIssues: boolean;
  /** Does this browser have scroll position rounding issues? */
  hasScrollRoundingIssues: boolean;
  /** Does this browser have iframe coordinate issues? */
  hasIframeCoordinateIssues: boolean;
  /** Does this browser have window.innerWidth/innerHeight reporting issues? */
  hasWindowSizeIssues: boolean;
  /** Does this browser have getBoundingClientRect reporting issues? */
  hasBoundingRectIssues: boolean;
  /** Does this browser have touch coordinate translation issues? */
  hasTouchCoordinateIssues: boolean;
  /** Does this browser have transform-origin issues with transformations? */
  hasTransformOriginIssues: boolean;
  /** Mouse position adjustment offset (x, y) if needed */
  mousePositionOffset?: { x: number; y: number };
  /** Does this browser handle fractional coordinates properly? */
  supportsFractionalCoordinates: boolean;
  /** Correction factor for DPI scaling if needed */
  dpiScalingCorrectionFactor?: number;
}

/**
 * Feature detection results
 */
export interface FeatureDetection {
  /** Does the browser support passive event listeners? */
  supportsPassiveEvents: boolean;
  /** Does the browser support pointer events? */
  supportsPointerEvents: boolean;
  /** Does the browser support touch events? */
  supportsTouchEvents: boolean;
  /** Does the browser support IntersectionObserver? */
  supportsIntersectionObserver: boolean;
  /** Does the browser support ResizeObserver? */
  supportsResizeObserver: boolean;
  /** Does the browser support modern DOM APIs? */
  supportsModernDOM: boolean;
  /** Does the browser support high-resolution timestamps? */
  supportsHighResTimestamps: boolean;
}

/**
 * Detection context for browser environment
 */
export interface DetectionContext {
  /** Custom user agent (for testing) */
  userAgent?: string;
  /** Custom window object (for testing) */
  window?: any;
  /** Custom navigator object (for testing) */
  navigator?: any;
  /** Custom screen object (for testing) */
  screen?: any;
  /** Is this a browser environment? */
  isBrowser: boolean;
  /** Is this a Node.js environment? */
  isNode: boolean;
  /** Is this Playwright? */
  isPlaywright: boolean;
  /** Is this Puppeteer? */
  isPuppeteer: boolean;
  /** Is this a testing environment? */
  isTestEnvironment: boolean;
}