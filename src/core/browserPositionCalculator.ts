/**
 * @file browserPositionCalculator.ts
 * @version 1.0.3
 * @lastModified 2025-05-18
 * @changelog Updated with performance optimisation features
 *
 * Main calculator class for browser position calculations
 *
 * Key features:
 * - Provides a unified interface for position calculations
 * - Supports multiple calculation strategies
 * - Adaptive strategy selection for optimal performance
 * - Handles browser edge detection and visibility checking
 */

import { Point, DisplayConfiguration, PositionCalculationStrategy } from './types';
import { TransformationStrategy } from '../strategies/transformationStrategy';
import { AdaptiveStrategySelector } from '../strategies/adaptiveStrategySelector';

/**
 * Options for BrowserPositionCalculator
 */
export interface BrowserPositionCalculatorOptions {
  /** Whether to use adaptive strategy selection (default: false) */
  useAdaptiveStrategy?: boolean;
  /** Options for the adaptive strategy selector */
  adaptiveOptions?: {
    /** Enable automatic periodic re-benchmarking (default: false) */
    enableAutoBenchmarking?: boolean;
    /** Number of operations between benchmarks (default: 10000) */
    benchmarkInterval?: number;
    /** Enable caching for the selected strategy (default: true) */
    enableCaching?: boolean;
  };
}

/**
 * BrowserPositionCalculator
 * 
 * Main calculator class that uses strategies to calculate positions
 * Supports adaptive strategy selection for optimal performance
 */
export class BrowserPositionCalculator {
  /** Calculation strategy */
  private strategy: PositionCalculationStrategy;
  
  /**
   * Create a BrowserPositionCalculator instance
   * 
   * @param strategyOrOptions Strategy to use or options object
   */
  constructor(strategyOrOptions?: PositionCalculationStrategy | BrowserPositionCalculatorOptions) {
    if (!strategyOrOptions) {
      // Default: use regular transformation strategy
      this.strategy = new TransformationStrategy();
    } else if (this.isStrategy(strategyOrOptions)) {
      // Use provided strategy
      this.strategy = strategyOrOptions;
    } else {
      // Use options
      const options = strategyOrOptions;
      
      if (options.useAdaptiveStrategy) {
        // Create adaptive strategy selector
        this.strategy = new AdaptiveStrategySelector({
          enableAutoBenchmarking: options.adaptiveOptions?.enableAutoBenchmarking,
          benchmarkInterval: options.adaptiveOptions?.benchmarkInterval,
          enableCaching: options.adaptiveOptions?.enableCaching
        });
      } else {
        // Use a regular transformation strategy
        this.strategy = new TransformationStrategy();
      }
    }
  }
  
  /**
   * Set the calculation strategy
   * 
   * @param strategy The strategy to use for calculations
   */
  setStrategy(strategy: PositionCalculationStrategy): void {
    this.strategy = strategy;
  }
  
  /**
   * Get the calculation strategy
   * 
   * @returns The current calculation strategy
   */
  getStrategy(): PositionCalculationStrategy {
    return this.strategy;
  }
  
  /**
   * Get the most efficient strategy for a given configuration pair
   * 
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns The most efficient strategy for the configuration pair
   */
  getMostEfficientStrategy(
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): PositionCalculationStrategy {
    // If using adaptive selector, trigger benchmarking
    if (this.strategy instanceof AdaptiveStrategySelector) {
      this.strategy.benchmarkStrategies(sourceConfig, targetConfig);
    }
    
    // Return the current strategy
    return this.strategy;
  }
  
  /**
   * Type guard to check if an object is a PositionCalculationStrategy
   * 
   * @param obj Object to check
   * @returns Whether the object is a PositionCalculationStrategy
   * @private
   */
  private isStrategy(obj: any): obj is PositionCalculationStrategy {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'calculateTargetPosition' in obj &&
      'calculateSourcePosition' in obj &&
      typeof obj.calculateTargetPosition === 'function' &&
      typeof obj.calculateSourcePosition === 'function'
    );
  }
  
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
  ): Point {
    return this.strategy.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
  }
  
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
  ): Point {
    return this.strategy.calculateSourcePosition(
      targetPoint,
      sourceConfig,
      targetConfig
    );
  }
  
  /**
   * Calculate browser window edges in target screen coordinates
   * 
   * Mathematical form:
   * Top edge: y = b_{y1}·α_y
   * Left edge: x = b_{x1}·α_x
   * Right edge: x = (b_{x1} + σ₁·v_{w1})·α_x
   * Bottom edge: y = (b_{y1} + σ₁·v_{h1})·α_y
   * 
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @returns Browser window edges in target screen coordinates
   */
  calculateBrowserEdges(
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration
  ): {top: number, left: number, right: number, bottom: number} {
    // Calculate scaling factors
    const alphaX = targetConfig.screenDimensions.width / sourceConfig.screenDimensions.width;
    const alphaY = targetConfig.screenDimensions.height / sourceConfig.screenDimensions.height;
    
    // Calculate edges
    const left = sourceConfig.browserPosition.x * alphaX;
    const top = sourceConfig.browserPosition.y * alphaY;
    const right = (
      sourceConfig.browserPosition.x + 
      sourceConfig.dpiScaling * sourceConfig.viewportDimensions.width
    ) * alphaX;
    const bottom = (
      sourceConfig.browserPosition.y + 
      sourceConfig.dpiScaling * sourceConfig.viewportDimensions.height
    ) * alphaY;
    
    return { top, left, right, bottom };
  }
  
  /**
   * Check if a point is visible within the browser window
   * 
   * @param point Point in screen coordinates
   * @param config Display configuration
   * @returns Whether the point is visible within the browser window
   */
  isPointVisible(point: Point, config: DisplayConfiguration): boolean {
    const { top, left, right, bottom } = this.calculateBrowserEdges(config, config);
    
    return (
      point.x >= left &&
      point.x < right &&
      point.y >= top &&
      point.y < bottom
    );
  }
}