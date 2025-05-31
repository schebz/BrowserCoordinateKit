/**
 * @file directFormulaStrategy.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of direct formula strategy
 *
 * Strategy that uses direct formulas for position calculation
 *
 * Key features:
 * - Uses direct mathematical formulas without creating transformation objects
 * - Can be more efficient than the transformation-based approach
 * - Implements the same mathematical equations as the transformation approach
 */

import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../core/types';

/**
 * Direct formula position calculation strategy
 * 
 * Uses direct mathematical formulas for position calculation
 * This can be more efficient than composing transformations
 */
export class DirectFormulaStrategy implements PositionCalculationStrategy {
  /**
   * Calculate target position using direct formulas
   * 
   * Mathematical form:
   * p_{l2} = ((x_{s1}·α_x - b_{x2})/σ₂, (y_{s1}·α_y - b_{y2})/σ₂)
   * where α_x = s_{w2}/s_{w1} and α_y = s_{h2}/s_{h1}
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
  ): Point {
    // Calculate scaling factors
    const alphaX = targetConfig.screenDimensions.width / sourceConfig.screenDimensions.width;
    const alphaY = targetConfig.screenDimensions.height / sourceConfig.screenDimensions.height;
    
    // Apply direct formula
    return {
      x: (sourcePoint.x * alphaX - targetConfig.browserPosition.x) / targetConfig.dpiScaling,
      y: (sourcePoint.y * alphaY - targetConfig.browserPosition.y) / targetConfig.dpiScaling
    };
  }
  
  /**
   * Calculate source position using direct formulas
   * 
   * Mathematical form:
   * p_{s1} = ((σ₂·x_{l2} + b_{x2})/α_x, (σ₂·y_{l2} + b_{y2})/α_y)
   * where α_x = s_{w2}/s_{w1} and α_y = s_{h2}/s_{h1}
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
  ): Point {
    // Calculate scaling factors
    const alphaX = targetConfig.screenDimensions.width / sourceConfig.screenDimensions.width;
    const alphaY = targetConfig.screenDimensions.height / sourceConfig.screenDimensions.height;
    
    // Apply direct formula
    return {
      x: (targetConfig.dpiScaling * targetPoint.x + targetConfig.browserPosition.x) / alphaX,
      y: (targetConfig.dpiScaling * targetPoint.y + targetConfig.browserPosition.y) / alphaY
    };
  }
}