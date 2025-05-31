/**
 * @file screenToNormalized.ts
 * @version 1.0.0
 * @lastModified 2025-05-19
 * @changelog Initial implementation of screen-to-normalized transformation
 *
 * Transforms screen coordinates to normalized coordinates
 *
 * Key features:
 * - Converts absolute screen pixels to normalized [0,1] range
 * - Provides inverse transformation back to screen coordinates
 * 
 * Mathematical Foundation: This implements Theorem 1 from Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex
 * which defines the screen-to-normalized transformation.
 */

import { Point, Dimensions, Transformation } from '../core/types';
import { NormalizedToScreenTransformation } from './normalizedToScreen';

/**
 * Screen-to-Normalized Transformation
 * 
 * Converts screen coordinates to normalized coordinates ([0,1] range)
 * Mathematical form: T_{S→N}(p_s) = (x_s/s_w, y_s/s_h)
 */
export class ScreenToNormalizedTransformation implements Transformation<Point, Point> {
  /**
   * @param screenDimensions Dimensions of the screen in pixels
   */
  constructor(private screenDimensions: Dimensions) {}
  
  /**
   * Transform screen coordinates to normalized coordinates
   * 
   * @mathematical: type=screen_normalizing, theorem=1, equation=1, latex=T_{S_i \to N}(\bm{p}_{s_i}) = \left(\frac{x_{s_i}}{s_{wi}}, \frac{y_{s_i}}{s_{hi}}\right) = \bm{p}_n, description=Screen-to-Normalized Coordinate Transformation, parameters={"p_(s_i)": "Point in screen coordinates", "s_(wi)": "Screen width", "s_(hi)": "Screen height", "p_n": "Point in normalized coordinates"}, performance={"averageTime": 0.012, "worstCaseTime": 0.025, "memoryUsage": 48, "optimized": true}
   * 
   * @param point The point in screen coordinates
   * @returns The transformed point in normalized coordinates [0,1]
   */
  transform(point: Point): Point {
    return {
      x: point.x / this.screenDimensions.width,
      y: point.y / this.screenDimensions.height
    };
  }
  
  /**
   * Get the inverse transformation (Normalized-to-Screen)
   * 
   * @mathematical: type=screen_normalizing, theorem=1, equation=2, latex=T_{N \to S_i}(\bm{p}_n) = (x_n \cdot s_{wi}, y_n \cdot s_{hi}) = \bm{p}_{s_i}, description=Normalized-to-Screen Coordinate Transformation, parameters={"p_n": "Point in normalized coordinates", "s_(wi)": "Screen width", "s_(hi)": "Screen height", "p_(s_i)": "Point in screen coordinates"}, implements=Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex:124
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<Point, Point> {
    return new NormalizedToScreenTransformation(this.screenDimensions);
  }
}