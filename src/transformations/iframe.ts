/**
 * @file iframe.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of iframe transformation
 *
 * Handles coordinate transformations for iframes
 *
 * Key features:
 * - Converts logical coordinates to iframe-relative coordinates
 * - Supports nested iframes through composition
 * - Handles inverse transformations for iframe coordinates
 */

import { Point, Transformation } from '../core/types';
import { CompositeTransformation } from './composite';

/**
 * IFrame Transformation
 * 
 * Handles coordinate transformations for iframes
 * Mathematical form: T_{L→F}(p_l) = p_l - o_i = (x_l - o_{ix}, y_l - o_{iy})
 * 
 * Where o_i is the offset of the iframe relative to its parent
 */
export class IFrameTransformation implements Transformation<Point, Point> {
  /**
   * @param iframeOffset The offset of the iframe from its parent's origin
   */
  constructor(private iframeOffset: Point) {}
  
  /**
   * Transform logical coordinates to iframe coordinates
   * 
   * Mathematical form:
   * T_{L→F}(p_l) = p_l - o_i = (x_l - o_{ix}, y_l - o_{iy})
   * 
   * @param point The point in logical coordinates
   * @returns The transformed point in iframe coordinates
   */
  transform(point: Point): Point {
    return {
      x: point.x - this.iframeOffset.x,
      y: point.y - this.iframeOffset.y
    };
  }
  
  /**
   * Get the inverse transformation (IFrame-to-Logical)
   * 
   * Mathematical form:
   * T_{F→L}(p_f) = p_f + o_i = (x_f + o_{ix}, y_f + o_{iy})
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<Point, Point> {
    return {
      transform: (point: Point) => ({
        x: point.x + this.iframeOffset.x,
        y: point.y + this.iframeOffset.y
      }),
      getInverse: () => this
    };
  }
}

/**
 * Creates a nested iframe transformation for multiple levels of iframes
 * 
 * Mathematical form:
 * T_{L→F_{i,j}}(p_l) = p_l - o_i - o_{i,j}
 * 
 * @param offsets Array of iframe offsets, from outermost to innermost
 * @returns Composite transformation for nested iframes
 */
export function createNestedIFrameTransformation(offsets: Point[]): Transformation<Point, Point> {
  // Start with identity transformation
  let transformation: Transformation<Point, Point> = {
    transform: (point: Point) => ({ ...point }),
    getInverse: () => ({
      transform: (point: Point) => ({ ...point }),
      getInverse: () => transformation
    })
  };
  
  // Compose transformations for each iframe level
  for (const offset of offsets) {
    const iframeTransformation = new IFrameTransformation(offset);
    transformation = new CompositeTransformation<Point, Point, Point>(
      transformation,
      iframeTransformation
    );
  }
  
  return transformation;
}