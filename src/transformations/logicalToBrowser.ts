/**
 * @file logicalToBrowser.ts
 * @version 1.0.1
 * @lastModified 2025-05-18
 * @changelog Added validation for zero DPI scaling
 *
 * Transforms logical coordinates to browser coordinates
 *
 * Key features:
 * - Converts logical pixels to physical browser pixels
 * - Accounts for DPI scaling factor
 * - Provides inverse transformation back to logical coordinates
 * - Validates DPI scaling factor to prevent division by zero in inverse
 */

import { Point, Transformation } from '../core/types';
import { BrowserToLogicalTransformation } from './browserToLogical';

/**
 * Logical-to-Browser Transformation
 * 
 * Converts logical coordinates to browser coordinates
 * Mathematical form: T_{L→B}(p_l) = p_l·σ = (x_l·σ, y_l·σ)
 * 
 * This is a linear transformation, specifically a uniform scaling by factor σ
 */
export class LogicalToBrowserTransformation implements Transformation<Point, Point> {
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
   * Transform logical coordinates to browser coordinates
   * 
   * T_{L→B}(p_l) = p_l·σ = (x_l·σ, y_l·σ)
   * 
   * @param point The point in logical coordinates
   * @returns The transformed point in browser coordinates (physical pixels)
   */
  transform(point: Point): Point {
    return {
      x: point.x * this.dpiScaling,
      y: point.y * this.dpiScaling
    };
  }
  
  /**
   * Get the inverse transformation (Browser-to-Logical)
   * 
   * T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<Point, Point> {
    return new BrowserToLogicalTransformation(this.dpiScaling);
  }
}