/**
 * @file index.ts
 * @version 1.1.1
 * @lastModified 2025-05-31
 * @changelog Updated after codebase cleanup and validation
 *
 * Main entry point for the BrowserCoordinateKit library
 *
 * Key features:
 * - Exports all public interfaces and classes
 * - Provides convenient access to the entire API
 * - Includes performance optimization components
 * - Includes browser detection and calibration utilities
 * - Supports multiple calibration methods (offset, scale, affine, perspective)
 * - Provides calibration persistence and calibration workflow management
 * - Integrates with Playwright for browser automation testing
 * - Includes helper utilities for coordinate transformation in Playwright
 */

// Core types
export { Point, Dimensions, DisplayConfiguration, Transformation, PositionCalculationStrategy } from './core/types';

// Main calculator
export { BrowserPositionCalculator } from './core/browserPositionCalculator';

// Strategies
export { TransformationStrategy } from './strategies/transformationStrategy';
export { DirectFormulaStrategy } from './strategies/directFormulaStrategy';
export { CachedTransformationStrategy } from './strategies/cachedTransformationStrategy';
export { AdaptiveStrategySelector } from './strategies/adaptiveStrategySelector';

// Basic transformations
export { ScreenToNormalizedTransformation } from './transformations/screenToNormalized';
export { NormalizedToScreenTransformation } from './transformations/normalizedToScreen';
export { ScreenToBrowserTransformation } from './transformations/screenToBrowser';
export { BrowserToScreenTransformation } from './transformations/browserToScreen';
export { BrowserToLogicalTransformation } from './transformations/browserToLogical';
export { LogicalToBrowserTransformation } from './transformations/logicalToBrowser';

// Composite transformations
export { CompositeTransformation } from './transformations/composite';
export { IFrameTransformation, createNestedIFrameTransformation } from './transformations/iframe';

// Factory functions
export {
  createScreenToScreenTransformation,
  createScreenToLogicalTransformation,
  createCompleteTransformation
} from './transformations/factory';

// Utilities
export { CoordinateUtils } from './utils/coordinateUtils';
export { PerformanceBenchmark } from './utils/performanceBenchmark';

// Browser Detection
export {
  BrowserType,
  DeviceType,
  OperatingSystem,
  BrowserInfo,
  BrowserVersion,
  DeviceInfo,
  OSInfo,
  BrowserQuirks,
  FeatureDetection,
  DetectionContext
} from './detection/browserTypes';

export {
  BrowserDetector,
  BrowserDetectionOptions,
  BrowserDisplayConfiguration
} from './detection/browserDetector';

export { DefaultBrowserDetector } from './detection/defaultBrowserDetector';

// Calibration
export {
  CalibrationPointPair,
  CalibrationType,
  CalibrationConfig,
  CalibrationFactors,
  CalibrationResult,
  CalibrationOperation
} from './calibration/calibrationTypes';

export {
  CalibrationUtility,
  CalibrationOptions,
  CalibrationPointGenerator,
  DefaultCalibrationPointGenerator,
  CalibrationStorageProvider,
  LocalStorageCalibrationStorage
} from './calibration/calibrationUtility';

// Integration
export { MouseWontIntegration } from './integration/mouseWontIntegration';

// Playwright Integration
export {
  PlaywrightIntegration,
  PlaywrightPage,
  PlaywrightElement,
  PlaywrightOptions,
  PlaywrightCoordinateOptions,
  PlaywrightElementOptions,
  PlaywrightElementData
} from './integration/playwright/playwrightIntegration';

export {
  initializePage,
  getTestEnvironmentInfo,
  logTestEnvironmentInfo,
  createTestGrid,
  verifyCalibrationAccuracy,
  getElementCenter,
  injectUtilities,
  PageInitOptions,
  TestEnvironmentInfo
} from './integration/playwright/playwrightHelpers';