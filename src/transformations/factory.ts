/**
 * @file factory.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of transformation factory
 *
 * Factory functions to create composite transformations
 *
 * Key features:
 * - Creates common transformation combinations
 * - Simplifies the creation of complex transformation chains
 * - Implements the mathematical framework from the documentation
 */

import { Point, DisplayConfiguration, Transformation } from '../core/types';
import { ScreenToNormalizedTransformation } from './screenToNormalized';
import { NormalizedToScreenTransformation } from './normalizedToScreen';
import { ScreenToBrowserTransformation } from './screenToBrowser';
import { BrowserToLogicalTransformation } from './browserToLogical';
import { CompositeTransformation } from './composite';

/**
 * Creates a screen-to-screen transformation between two display configurations
 * 
 * Mathematical form:
 * T_{S₁→S₂}(p_s) = (x_s·α_x, y_s·α_y)
 * 
 * Where:
 * - α_x = s_{w2}/s_{w1}
 * - α_y = s_{h2}/s_{h1}
 * 
 * @param sourceConfig Source display configuration
 * @param targetConfig Target display configuration
 * @returns Transformation from source screen to target screen coordinates
 */
export function createScreenToScreenTransformation(
  sourceConfig: DisplayConfiguration,
  targetConfig: DisplayConfiguration
): Transformation<Point, Point> {
  const s1ToN = new ScreenToNormalizedTransformation(sourceConfig.screenDimensions);
  const nToS2 = new NormalizedToScreenTransformation(targetConfig.screenDimensions);
  
  return new CompositeTransformation(s1ToN, nToS2);
}

/**
 * Creates a screen-to-logical transformation for a display configuration
 * 
 * Mathematical form:
 * T_{S→L}(p_s) = (p_s - b)/σ = ((x_s - b_x)/σ, (y_s - b_y)/σ)
 * 
 * @param config Display configuration
 * @returns Transformation from screen to logical coordinates
 */
export function createScreenToLogicalTransformation(
  config: DisplayConfiguration
): Transformation<Point, Point> {
  const sToB = new ScreenToBrowserTransformation(config.browserPosition);
  const bToL = new BrowserToLogicalTransformation(config.dpiScaling);
  
  return new CompositeTransformation(sToB, bToL);
}

/**
 * Creates a complete transformation from screen coordinates in configuration 1
 * to logical coordinates in configuration 2
 * 
 * Mathematical form:
 * T_{S₁→L₂}(p_{s1}) = ((x_{s1}·α_x - b_{x2})/σ₂, (y_{s1}·α_y - b_{y2})/σ₂)
 * 
 * Where:
 * - α_x = s_{w2}/s_{w1}
 * - α_y = s_{h2}/s_{h1}
 * 
 * @param sourceConfig Source display configuration
 * @param targetConfig Target display configuration
 * @returns Transformation from source screen to target logical coordinates
 */
export function createCompleteTransformation(
  sourceConfig: DisplayConfiguration,
  targetConfig: DisplayConfiguration
): Transformation<Point, Point> {
  // Create screen-to-screen transformation
  const s1ToS2 = createScreenToScreenTransformation(sourceConfig, targetConfig);
  
  // Create screen-to-logical transformation for target config
  const s2ToL2 = createScreenToLogicalTransformation(targetConfig);
  
  // Combine them to create the complete transformation
  return new CompositeTransformation(s1ToS2, s2ToL2);
}