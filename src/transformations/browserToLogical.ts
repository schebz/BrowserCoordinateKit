/**
 * @file browserToLogical.ts
 * @version 1.0.1
 * @lastModified 2025-05-18
 * @changelog Added validation for zero DPI scaling
 *
 * Transforms browser coordinates to logical coordinates
 *
 * Key features:
 * - Converts physical browser pixels to logical pixels
 * - Accounts for DPI scaling factor
 * - Provides inverse transformation back to browser coordinates
 * - Validates DPI scaling factor to prevent division by zero
 */

import { Point, Transformation } from '../core/types';
import { LogicalToBrowserTransformation } from './logicalToBrowser';

/**
 * Browser-to-Logical Transformation
 * 
 * Converts browser coordinates to logical coordinates
 * Mathematical form: T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)
 * 
 * This is a linear transformation, specifically a uniform scaling by factor 1/σ
 */
export class BrowserToLogicalTransformation implements Transformation<Point, Point> {
  /**
   * @param dpiScaling The DPI scaling factor (ratio of physical to logical pixels)
   * @throws Error if dpiScaling is zero
   */
  constructor(private dpiScaling: number) {
    if (dpiScaling === 0) {
      throw new Error('DPI scaling factor cannot be zero');
    }
  }
  
  /**
   * Transform browser coordinates to logical coordinates
   * 
   * T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)
   * 
   * @param point The point in browser coordinates (physical pixels)
   * @returns The transformed point in logical coordinates
   */
  transform(point: Point): Point {
    return {
      x: point.x / this.dpiScaling,
      y: point.y / this.dpiScaling
    };
  }
  
  /**
   * Get the inverse transformation (Logical-to-Browser)
   * 
   * T_{L→B}(p_l) = p_l·σ = (x_l·σ, y_l·σ)
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<Point, Point> {
    return new LogicalToBrowserTransformation(this.dpiScaling);
  }
}