/**
 * @file calibrationTypes.ts
 * @version 1.2.0
 * @lastModified 2025-05-19
 * @changelog Added mathematical documentation and type descriptions
 *
 * Type definitions for browser calibration
 *
 * Key features:
 * - Calibration point interfaces
 * - Calibration data structures
 * - Calibration result types
 * - Mathematical transformation types
 * 
 * Mathematical foundations:
 * - Defines data structures for various transformation types:
 *   - Offset: T(p) = p + (dx, dy)
 *   - Scale: T(p) = (sx*x + dx, sy*y + dy)
 *   - Affine: T(p) = A*p + b where A is a 2×2 matrix
 *   - Perspective: T(p) = (ax + by + c, dx + ey + f)/(gx + hy + i)
 */

import { Point, DisplayConfiguration } from '../core/types';
import { BrowserInfo, DeviceInfo } from '../detection/browserTypes';

/**
 * Represents a calibration point pair used for calibration
 */
export interface CalibrationPointPair {
  /** Expected point location (what it should be) */
  expected: Point;
  /** Actual point location (what was measured) */
  actual: Point;
}

/**
 * Types of calibration corrections that can be applied
 */
export enum CalibrationType {
  /** Offset calibration (adding constants to coordinates) */
  Offset = 'offset',
  /** Scale calibration (multiplying coordinates by factors) */
  Scale = 'scale',
  /** Affine calibration (linear transformation with translation) */
  Affine = 'affine',
  /** Perspective calibration (projective transformation) */
  Perspective = 'perspective',
  /** Composite calibration (multiple calibration types combined) */
  Composite = 'composite'
}

/**
 * Configuration for runnung the calibration process
 */
export interface CalibrationConfig {
  /** Number of calibration points to use (default: 5) */
  pointCount?: number;
  /** Type of calibration to apply (default: Affine) */
  calibrationType?: CalibrationType;
  /** Minimum number of points needed (default: depends on a calibration type) */
  minPointCount?: number;
  /** Maximum error allowed for calibration to be considered successful (default: 2.0) */
  maxAllowedError?: number;
  /** Whether to use advanced calibration techniques (default: false) */
  useAdvancedCalibration?: boolean;
  /** Timeout for calibration operations in milliseconds (default: 10000) */
  calibrationTimeout?: number;
}

/**
 * Represents the correction factors calculated from calibration
 */
export interface CalibrationFactors {
  /** Type of calibration */
  type: CalibrationType;
  /** X offset correction factor */
  offsetX?: number;
  /** Y offset correction factor */
  offsetY?: number;
  /** X scale correction factor */
  scaleX?: number;
  /** Y scale correction factor */
  scaleY?: number;
  /** Affine transform matrix (3x3) */
  affineMatrix?: number[][];
  /** Perspective transform matrix (3x3) */
  perspectiveMatrix?: number[][];
  /** Composite calibration factors */
  compositeFactors?: CalibrationFactors[];
}

/**
 * Represents the result of a calibration operation
 */
export interface CalibrationResult {
  /** Whether the calibration was successful */
  success: boolean;
  /** Error message if calibration failed */
  errorMessage?: string;
  /** Calibration factors calculated */
  factors?: CalibrationFactors;
  /** Average error after calibration */
  averageError?: number;
  /** Maximum error after calibration */
  maxError?: number;
  /** Timestamp when calibration was performed */
  timestamp: number;
  /** Browser information for which calibration was performed */
  browserInfo?: BrowserInfo;
  /** Device information for which calibration was performed */
  deviceInfo?: DeviceInfo;
  /** Display configuration used during calibration */
  displayConfig?: DisplayConfiguration;
  /** Number of points used for calibration */
  pointCount: number;
}

/**
 * Data structure for storing calibration data between sessions
 */
export interface CalibrationStorage {
  /** List of calibration results */
  calibrations: CalibrationResult[];
  /** Timestamp of last calibration */
  lastCalibrationTime: number;
  /** Version of calibration data format */
  version: string;
}

/**
 * Represents an operation performed during calibration
 */
export interface CalibrationOperation {
  /** Type of operation */
  type: 'click' | 'move' | 'wait' | 'measure';
  /** Point for the operation */
  point?: Point;
  /** Duration of the operation in milliseconds */
  duration?: number;
  /** Additional operation-specific data */
  data?: any;
}