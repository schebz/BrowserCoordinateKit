/**
 * @file coordinateUtils.ts
 * @version 1.0.1
 * @lastModified 2025-05-18
 * @changelog Added validation for zero values to prevent division by zero
 *
 * Utility functions for working with coordinates
 *
 * Key features:
 * - Helper functions for common coordinate operations
 * - Calculation of browser window position from mouse positions
 * - DPI scaling factor calculation with validation
 * - Display configuration creation
 * - Scaling factor calculation
 */

import { Point, DisplayConfiguration } from '../core/types';

/**
 * Utility functions for working with coordinates
 */
export class CoordinateUtils {
  /**
   * Calculate browser window position from mouse positions
   * 
   * Mathematical form:
   * b = m_s - σ·m_l
   * 
   * Where:
   * - b is the browser window position
   * - m_s is the mouse position in screen coordinates
   * - m_l is the mouse position in logical coordinates
   * - σ is the DPI scaling factor
   * 
   * @param mouseScreenPos Mouse position in screen coordinates
   * @param mouseLogicalPos Mouse position in logical coordinates
   * @param dpiScaling DPI scaling factor
   * @returns Browser window position in screen coordinates
   */
  static calculateBrowserPosition(
    mouseScreenPos: Point,
    mouseLogicalPos: Point,
    dpiScaling: number
  ): Point {
    return {
      x: mouseScreenPos.x - dpiScaling * mouseLogicalPos.x,
      y: mouseScreenPos.y - dpiScaling * mouseLogicalPos.y
    };
  }
  
  /**
   * Calculate DPI scaling factor from known positions
   * 
   * @param browserPos Position in browser coordinates (physical pixels)
   * @param logicalPos Corresponding position in logical coordinates
   * @returns DPI scaling factor
   * @throws Error if logicalPos contains zero values
   */
  static calculateDpiScaling(browserPos: Point, logicalPos: Point): number {
    // Validate to prevent division by zero
    if (logicalPos.x === 0 || logicalPos.y === 0) {
      throw new Error('Logical position coordinates cannot be zero when calculating DPI scaling');
    }
    
    // Use average of x and y ratios for robustness
    const xRatio = browserPos.x / logicalPos.x;
    const yRatio = browserPos.y / logicalPos.y;
    return (xRatio + yRatio) / 2;
  }
  
  /**
   * Create a display configuration
   * 
   * @param screenWidth Screen width in pixels
   * @param screenHeight Screen height in pixels
   * @param browserX Browser window x position in screen coordinates
   * @param browserY Browser window y position in screen coordinates
   * @param viewportWidth Viewport width in logical pixels
   * @param viewportHeight Viewport height in logical pixels
   * @param dpiScaling DPI scaling factor
   * @returns Display configuration
   */
  static createDisplayConfig(
    screenWidth: number,
    screenHeight: number,
    browserX: number,
    browserY: number,
    viewportWidth: number,
    viewportHeight: number,
    dpiScaling: number
  ): DisplayConfiguration {
    return {
      screenDimensions: { width: screenWidth, height: screenHeight },
      browserPosition: { x: browserX, y: browserY },
      viewportDimensions: { width: viewportWidth, height: viewportHeight },
      dpiScaling
    };
  }

  /**
   * Calculate scaling factors between two screen sizes
   * 
   * @param sourceWidth Source screen width
   * @param sourceHeight Source screen height
   * @param targetWidth Target screen width
   * @param targetHeight Target screen height
   * @returns Scaling factors {x, y}
   * @throws Error if source dimensions are zero
   */
  static calculateScalingFactors(
    sourceWidth: number,
    sourceHeight: number,
    targetWidth: number,
    targetHeight: number
  ): Point {
    // Validate to prevent division by zero
    if (sourceWidth === 0 || sourceHeight === 0) {
      throw new Error('Source dimensions cannot be zero when calculating scaling factors');
    }
    
    return {
      x: targetWidth / sourceWidth,
      y: targetHeight / sourceHeight
    };
  }
}