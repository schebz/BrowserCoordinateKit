/**
 * @file screenToBrowser.ts
 * @version 1.0.0
 * @lastModified 2025-05-19
 * @changelog Initial implementation of screen-to-browser transformation
 *
 * Transforms screen coordinates to browser coordinates
 *
 * Key features:
 * - Converts absolute screen coordinates to browser-relative coordinates
 * - Accounts for browser window position on screen
 * - Provides inverse transformation back to screen coordinates
 * 
 * Mathematical Foundation: This implements Theorem 2 from Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex
 * which defines the screen-to-browser transformation as an affine transformation.
 */

import { Point, Transformation } from '../core/types';
import { BrowserToScreenTransformation } from './browserToScreen';

/**
 * Screen-to-Browser Transformation
 * 
 * Converts screen coordinates to browser coordinates
 * Mathematical form: T_{S→B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)
 * 
 * This is an affine transformation characterized by a translation of -b
 */
export class ScreenToBrowserTransformation implements Transformation<Point, Point> {
  /**
   * @param browserPosition The position of browser's top-left corner in screen coordinates
   */
  constructor(private browserPosition: Point) {}
  
  /**
   * Transform screen coordinates to browser coordinates
   * 
   * @mathematical: type=browser_position, theorem=2, equation=3, latex=T_{S_i \to B_i}(\bm{p}_{s_i}) = \bm{p}_{s_i} - \bm{b}_i = (x_{s_i} - b_{xi}, y_{s_i} - b_{yi}) = \bm{p}_{b_i}, description=Screen-to-Browser Coordinate Transformation, parameters={"p_(s_i)": "Point in screen coordinates", "b_i": "Browser window position", "p_(b_i)": "Point in browser coordinates"}, performance={"averageTime": 0.011, "worstCaseTime": 0.024, "memoryUsage": 48, "optimized": true}
   * 
   * @param point The point in screen coordinates
   * @returns The transformed point in browser coordinates
   */
  transform(point: Point): Point {
    return {
      x: point.x - this.browserPosition.x,
      y: point.y - this.browserPosition.y
    };
  }
  
  /**
   * Get the inverse transformation (Browser-to-Screen)
   * 
   * @mathematical: type=inverse, theorem=5, equation=6, latex=T_{S_i \to B_i}^{-1}(\bm{p}_{b_i}) = \bm{p}_{b_i} + \bm{b}_i, description=Browser-to-Screen Coordinate Transformation (Inverse of Screen-to-Browser), parameters={"p_(b_i)": "Point in browser coordinates", "b_i": "Browser window position", "p_(s_i)": "Point in screen coordinates"}, implements=Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex:347
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<Point, Point> {
    return new BrowserToScreenTransformation(this.browserPosition);
  }
}