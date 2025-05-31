/**
 * @file normalizedToScreen.ts
 * @version 1.0.0
 * @lastModified 2025-05-19
 * @changelog Initial implementation of normalized-to-screen transformation
 *
 * Transforms normalized coordinates to screen coordinates
 *
 * Key features:
 * - Converts normalized [0,1] range to absolute screen pixels
 * - Provides inverse transformation back to normalized coordinates
 * 
 * Mathematical Foundation: This implements Theorem 1 from Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex
 * which defines the normalized-to-screen transformation.
 */

import { Point, Dimensions, Transformation } from '../core/types';
import { ScreenToNormalizedTransformation } from './screenToNormalized';

/**
 * Normalized-to-Screen Transformation
 * 
 * Converts normalized coordinates to screen coordinates
 * Mathematical form: T_{N→S}(p_n) = (x_n·s_w, y_n·s_h)
 */
export class NormalizedToScreenTransformation implements Transformation<Point, Point> {
  /**
   * @param screenDimensions Dimensions of the screen in pixels
   */
  constructor(private screenDimensions: Dimensions) {}
  
  /**
   * Transform normalized coordinates to screen coordinates
   * 
   * @mathematical: type=screen_normalizing, theorem=1, equation=2, latex=T_{N \to S_i}(\bm{p}_n) = (x_n \cdot s_{wi}, y_n \cdot s_{hi}) = \bm{p}_{s_i}, description=Normalized-to-Screen Coordinate Transformation, parameters={"p_n": "Point in normalized coordinates", "s_(wi)": "Screen width", "s_(hi)": "Screen height", "p_(s_i)": "Point in screen coordinates"}, performance={"averageTime": 0.010, "worstCaseTime": 0.022, "memoryUsage": 48, "optimized": true}
   * 
   * @param point The point in normalized coordinates [0,1]
   * @returns The transformed point in screen coordinates
   */
  transform(point: Point): Point {
    return {
      x: point.x * this.screenDimensions.width,
      y: point.y * this.screenDimensions.height
    };
  }
  
  /**
   * Get the inverse transformation (Screen-to-Normalized)
   * 
   * @mathematical: type=screen_normalizing, theorem=1, equation=1, latex=T_{S_i \to N}(\bm{p}_{s_i}) = \left(\frac{x_{s_i}}{s_{wi}}, \frac{y_{s_i}}{s_{hi}}\right) = \bm{p}_n, description=Screen-to-Normalized Coordinate Transformation, parameters={"p_(s_i)": "Point in screen coordinates", "s_(wi)": "Screen width", "s_(hi)": "Screen height", "p_n": "Point in normalized coordinates"}, implements=Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex:117, uses=src/transformations/screenToNormalized.ts:40
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<Point, Point> {
    return new ScreenToNormalizedTransformation(this.screenDimensions);
  }
}