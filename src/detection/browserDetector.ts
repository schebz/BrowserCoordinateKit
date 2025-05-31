/**
 * @file browserDetector.ts
 * @version 1.1.0
 * @lastModified 2025-05-19
 * @changelog Initial implementation of browser detector interface
 *
 * Browser detector component for automatic detection of browser characteristics
 *
 * Key features:
 * - Detects browser type and version
 * - Detects device type and characteristics
 * - Identifies browser-specific quirks
 * - Provides configuration adjustments based on detected browser
 */

import { DisplayConfiguration, Point } from '../core/types';
import {
  BrowserType,
  BrowserInfo,
  DeviceType,
  DeviceInfo,
  BrowserQuirks,
  FeatureDetection,
  DetectionContext
} from './browserTypes';

/**
 * Options for browser detection
 */
export interface BrowserDetectionOptions {
  /** Use cache for detection results (default: true) */
  useCache?: boolean;
  /** Detection context for testing or custom environments */
  detectionContext?: DetectionContext;
  /** Force a specific browser type (for testing) */
  forceBrowserType?: BrowserType;
  /** Force a specific device type (for testing) */
  forceDeviceType?: DeviceType;
}

/**
 * Extended display configuration with browser-specific properties
 */
export interface BrowserDisplayConfiguration extends DisplayConfiguration {
  /** Browser information */
  browserInfo?: BrowserInfo;
  /** Device information */
  deviceInfo?: DeviceInfo;
  /** Browser-specific quirks that affect coordinates */
  quirks?: BrowserQuirks;
  /** Calibration correction factor (if calibrated) */
  calibrationFactor?: number;
}

/**
 * Interface for browser detector component
 */
export interface BrowserDetector {
  /**
   * Detect the current browser information
   * 
   * @param options Detection options
   * @returns Browser information
   */
  detectBrowser(options?: BrowserDetectionOptions): BrowserInfo;
  
  /**
   * Detect the current device information
   * 
   * @param options Detection options
   * @returns Device information
   */
  detectDevice(options?: BrowserDetectionOptions): DeviceInfo;
  
  /**
   * Detect browser-specific quirks that affect coordinate calculations
   * 
   * @param browserInfo Browser information (will be detected if not provided)
   * @param deviceInfo Device information (will be detected if not provided)
   * @returns Browser quirks information
   */
  detectBrowserQuirks(
    browserInfo?: BrowserInfo,
    deviceInfo?: DeviceInfo
  ): BrowserQuirks;
  
  /**
   * Detect browser feature support
   * 
   * @param browserInfo Browser information (will be detected if not provided)
   * @returns Feature detection results
   */
  detectFeatures(browserInfo?: BrowserInfo): FeatureDetection;
  
  /**
   * Detect the current display configuration based on browser environment
   * 
   * @param options Detection options
   * @returns Display configuration with browser-specific properties
   */
  detectDisplayConfiguration(
    options?: BrowserDetectionOptions
  ): BrowserDisplayConfiguration;
  
  /**
   * Apply browser-specific adjustments to a point
   * 
   * @param point Point to adjust
   * @param quirks Browser quirks (will be detected if not provided)
   * @returns Adjusted point
   */
  adjustPointForBrowser(point: Point, quirks?: BrowserQuirks): Point;
  
  /**
   * Get a correction factor for DPI scaling based on the browser
   * 
   * @param browserInfo Browser information (will be detected if not provided)
   * @param deviceInfo Device information (will be detected if not provided)
   * @returns Correction factor (1.0 if no correction needed)
   */
  getDpiScalingCorrectionFactor(
    browserInfo?: BrowserInfo,
    deviceInfo?: DeviceInfo
  ): number;
  
  /**
   * Check if a specific browser quirk is present
   * 
   * @param quirkName Name of the quirk to check
   * @param quirks Browser quirks (will be detected if not provided)
   * @returns Whether the quirk is present
   */
  hasQuirk(quirkName: keyof BrowserQuirks, quirks?: BrowserQuirks): boolean;
  
  /**
   * Create a display configuration adjusted for the current browser
   * 
   * @param baseConfig Base display configuration
   * @param options Detection options
   * @returns Adjusted display configuration
   */
  createAdjustedDisplayConfiguration(
    baseConfig: DisplayConfiguration,
    options?: BrowserDetectionOptions
  ): BrowserDisplayConfiguration;
  
  /**
   * Clear the detection cache
   */
  clearCache(): void;
}