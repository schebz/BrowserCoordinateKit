/**
 * @file transformationStrategy.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of transformation-based strategy
 *
 * Strategy that uses transformations for position calculation
 *
 * Key features:
 * - Uses the transformation framework for position calculation
 * - Handles both forward and inverse calculations
 * - Preserves the mathematical foundations
 */

import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../core/types';
import { createCompleteTransformation } from '../transformations/factory';

/**
 * Transformation-based position calculation strategy
 * 
 * Uses the transformation framework to calculate positions
 */
export class TransformationStrategy implements PositionCalculationStrategy {
  /**
   * Calculate target position using transformations
   * 
   * Mathematical form:
   * T_{S₁→L₂}(p_{s1}) = ((x_{s1}·α_x - b_{x2})/σ₂, (y_{s1}·α_y - b_{y2})/σ₂)
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
    const transformation = createCompleteTransformation(sourceConfig, targetConfig);
    return transformation.transform(sourcePoint);
  }
  
  /**
   * Calculate source position using inverse transformations
   * 
   * Mathematical form:
   * T_{L₂→S₁}(p_{l2}) = ((σ₂·x_{l2} + b_{x2})/α_x, (σ₂·y_{l2} + b_{y2})/α_y)
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
    const transformation = createCompleteTransformation(sourceConfig, targetConfig);
    const inverseTransformation = transformation.getInverse();
    return inverseTransformation.transform(targetPoint);
  }
}