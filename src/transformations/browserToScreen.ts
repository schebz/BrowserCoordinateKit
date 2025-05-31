/**
 * @file browserToScreen.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of browser-to-screen transformation
 *
 * Transforms browser coordinates to screen coordinates
 *
 * Key features:
 * - Converts browser-relative coordinates to absolute screen coordinates
 * - Accounts for browser window position on screen
 * - Provides inverse transformation back to browser coordinates
 */

import { Point, Transformation } from '../core/types';
import { ScreenToBrowserTransformation } from './screenToBrowser';

/**
 * Browser-to-Screen Transformation
 * 
 * Converts browser coordinates to screen coordinates
 * Mathematical form: T_{B→S}(p_b) = p_b + b = (x_b + b_x, y_b + b_y)
 * 
 * This is an affine transformation characterized by a translation of b
 */
export class BrowserToScreenTransformation implements Transformation<Point, Point> {
  /**
   * @param browserPosition The position of browser's top-left corner in screen coordinates
   */
  constructor(private browserPosition: Point) {}
  
  /**
   * Transform browser coordinates to screen coordinates
   * 
   * T_{B→S}(p_b) = p_b + b = (x_b + b_x, y_b + b_y)
   * 
   * @param point The point in browser coordinates
   * @returns The transformed point in screen coordinates
   */
  transform(point: Point): Point {
    return {
      x: point.x + this.browserPosition.x,
      y: point.y + this.browserPosition.y
    };
  }
  
  /**
   * Get the inverse transformation (Screen-to-Browser)
   * 
   * T_{S→B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<Point, Point> {
    return new ScreenToBrowserTransformation(this.browserPosition);
  }
}