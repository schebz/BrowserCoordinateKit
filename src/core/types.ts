/**
 * @file types.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of core types
 *
 * Core types and interfaces for the BrowserCoordinateKit library
 *
 * Key features:
 * - Type definitions for coordinates (Point, Dimensions)
 * - Display configuration interface
 * - Core transformation interface
 */

/**
 * Represents a 2D point with x and y coordinates
 * 
 * Mathematically represented as p = (x, y)
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Represents dimensions with width and height
 * 
 * Mathematically represented as d = (width, height)
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Configuration parameters for a display environment
 * 
 * Mathematically represented as:
 * - Screen dimensions: s = (s_w, s_h)
 * - Browser position: b = (b_x, b_y)
 * - Viewport dimensions: v = (v_w, v_h)
 * - DPI scaling factor: σ (sigma)
 */
export interface DisplayConfiguration {
  /** Screen dimensions in physical pixels */
  screenDimensions: Dimensions;
  
  /** Browser window position in screen coordinates (physical pixels) */
  browserPosition: Point;
  
  /** Viewport dimensions in logical pixels */
  viewportDimensions: Dimensions;
  
  /** DPI scaling factor (ratio of physical to logical pixels) */
  dpiScaling: number;
}

/**
 * Core transformation interface that all specific transformations will implement
 * 
 * Mathematically, a transformation T: A → B maps points from space A to space B
 */
export interface Transformation<TInput, TOutput> {
  /**
   * Transform a point from the input coordinate space to the output coordinate space
   * 
   * @param point The point in the input coordinate space
   * @returns The transformed point in the output coordinate space
   */
  transform(point: TInput): TOutput;
  
  /**
   * Get the inverse transformation that maps from the output space back to the input space
   * 
   * @returns The inverse transformation
   */
  getInverse(): Transformation<TOutput, TInput>;
}

/**
 * Interface for position calculation strategies
 * 
 * This allows for different algorithms to be used for position calculation
 * while maintaining a consistent interface
 */
export interface PositionCalculationStrategy {
  /**
   * Calculate target position in target logical coordinates
   * 
   * @param sourcePoint Source point in original screen coordinates
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Target point in target logical coordinates
   */
  calculateTargetPosition(
    sourcePoint: Point,
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): Point;
  
  /**
   * Calculate source position in original screen coordinates
   * 
   * @param targetPoint Target point in target logical coordinates
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Source point in original screen coordinates
   */
  calculateSourcePosition(
    targetPoint: Point,
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): Point;
}