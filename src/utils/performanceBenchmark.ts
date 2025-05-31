/**
 * @file performanceBenchmark.ts
 * @version 1.1.1
 * @lastModified 2025-05-31
 * @changelog Removed unused CoordinateUtils import
 *
 * Performance benchmarking utilities for measuring and comparing 
 * transformation strategy performance
 *
 * Key features:
 * - Measure execution time of transformation strategies
 * - Compare multiple strategies
 * - Generate test points for benchmarking
 */

import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../core/types';

/**
 * Result of a benchmark run
 */
export interface BenchmarkResult {
  /** Average execution time in microseconds */
  averageExecutionTime: number;
  /** Median execution time in microseconds */
  medianExecutionTime: number;
  /** Minimum execution time in microseconds */
  minExecutionTime: number;
  /** Maximum execution time in microseconds */
  maxExecutionTime: number;
  /** Standard deviation of execution times */
  standardDeviation: number;
  /** Number of iterations used in the benchmark */
  iterationCount: number;
  /** Number of points used in the benchmark */
  pointCount: number;
}

/**
 * Performance benchmarking utility for measuring strategy performance
 */
export class PerformanceBenchmark {
  /**
   * Measure the performance of a strategy
   * 
   * @param strategy Strategy to benchmark
   * @param sourcePoints Array of source points
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @param iterations Number of iterations (default: 1000)
   * @returns Benchmark result
   */
  measureStrategy(
    strategy: PositionCalculationStrategy,
    sourcePoints: Point[],
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration,
    iterations = 1000
  ): BenchmarkResult {
    const executionTimes: number[] = [];
    
    // Warm-up runs
    for (let i = 0; i < 10; i++) {
      for (const point of sourcePoints) {
        strategy.calculateTargetPosition(point, sourceConfig, targetConfig);
      }
    }
    
    // Measurement runs
    for (let i = 0; i < iterations; i++) {
      const startTime = this.getHighResolutionTime();
      
      for (const point of sourcePoints) {
        strategy.calculateTargetPosition(point, sourceConfig, targetConfig);
      }
      
      const endTime = this.getHighResolutionTime();
      const executionTime = (endTime - startTime) * 1000000; // Convert to microseconds
      executionTimes.push(executionTime);
    }
    
    // Sort times for median and percentile calculations
    executionTimes.sort((a, b) => a - b);
    
    // Calculate statistics
    const average = this.calculateAverage(executionTimes);
    const median = this.calculateMedian(executionTimes);
    const min = executionTimes[0];
    const max = executionTimes[executionTimes.length - 1];
    const stdDev = this.calculateStandardDeviation(executionTimes, average);
    
    return {
      averageExecutionTime: average,
      medianExecutionTime: median,
      minExecutionTime: min,
      maxExecutionTime: max,
      standardDeviation: stdDev,
      iterationCount: iterations,
      pointCount: sourcePoints.length
    };
  }
  
  /**
   * Compare multiple strategies
   * 
   * @param strategies Map of strategy names to strategy instances
   * @param sourcePoints Array of source points
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @param iterations Number of iterations (default: 1000)
   * @returns Map of strategy names to benchmark results
   */
  compareStrategies(
    strategies: Map<string, PositionCalculationStrategy>,
    sourcePoints: Point[],
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration,
    iterations = 1000
  ): Map<string, BenchmarkResult> {
    const results = new Map<string, BenchmarkResult>();
    
    for (const [name, strategy] of strategies.entries()) {
      results.set(name, this.measureStrategy(
        strategy,
        sourcePoints,
        sourceConfig,
        targetConfig,
        iterations
      ));
    }
    
    return results;
  }
  
  /**
   * Generate random test points within a display configuration
   * 
   * @param count Number of points to generate
   * @param config Display configuration
   * @param edgeRatio Ratio of points that should be near edges (0-1)
   * @returns Array of generated points
   */
  generateTestPoints(
    count: number,
    config: DisplayConfiguration,
    edgeRatio = 0.2
  ): Point[] {
    const points: Point[] = [];
    
    // Calculate browser window edges in screen coordinates
    const left = config.browserPosition.x;
    const top = config.browserPosition.y;
    const right = left + config.viewportDimensions.width * config.dpiScaling;
    const bottom = top + config.viewportDimensions.height * config.dpiScaling;
    
    // Calculate how many points should be near edges
    const edgeCount = Math.round(count * edgeRatio);
    const centerCount = count - edgeCount;
    
    // Generate points distributed throughout the browser window
    for (let i = 0; i < centerCount; i++) {
      points.push({
        x: left + Math.random() * (right - left),
        y: top + Math.random() * (bottom - top)
      });
    }
    
    // Generate points near edges
    for (let i = 0; i < edgeCount; i++) {
      const edgeSelector = Math.floor(Math.random() * 4);
      
      switch (edgeSelector) {
        case 0: // Left edge
          points.push({
            x: left + Math.random() * 10,
            y: top + Math.random() * (bottom - top)
          });
          break;
        case 1: // Top edge
          points.push({
            x: left + Math.random() * (right - left),
            y: top + Math.random() * 10
          });
          break;
        case 2: // Right edge
          points.push({
            x: right - Math.random() * 10,
            y: top + Math.random() * (bottom - top)
          });
          break;
        case 3: // Bottom edge
          points.push({
            x: left + Math.random() * (right - left),
            y: bottom - Math.random() * 10
          });
          break;
      }
    }
    
    return points;
  }
  
  /**
   * Generate a set of test points for common scenarios
   * 
   * @param config Display configuration
   * @returns Map of scenario names to arrays of test points
   */
  generateScenarioTestPoints(config: DisplayConfiguration): Map<string, Point[]> {
    const scenarios = new Map<string, Point[]>();
    
    // Standard points distributed throughout the window
    scenarios.set('standard', this.generateTestPoints(100, config, 0.2));
    
    // Points near edges
    scenarios.set('edges', this.generateTestPoints(100, config, 1.0));
    
    // Points in grid pattern
    scenarios.set('grid', this.generateGridPoints(10, 10, config));
    
    // Points in diagonal pattern
    scenarios.set('diagonal', this.generateDiagonalPoints(100, config));
    
    // Extreme coordinates
    scenarios.set('extreme', this.generateExtremePoints(config));
    
    return scenarios;
  }
  
  /**
   * Generate grid points within a display configuration
   * 
   * @param rows Number of rows
   * @param cols Number of columns
   * @param config Display configuration
   * @returns Array of grid points
   */
  private generateGridPoints(
    rows: number,
    cols: number,
    config: DisplayConfiguration
  ): Point[] {
    const points: Point[] = [];
    
    // Calculate browser window edges in screen coordinates
    const left = config.browserPosition.x;
    const top = config.browserPosition.y;
    const right = left + config.viewportDimensions.width * config.dpiScaling;
    const bottom = top + config.viewportDimensions.height * config.dpiScaling;
    
    // Calculate cell size
    const cellWidth = (right - left) / (cols - 1);
    const cellHeight = (bottom - top) / (rows - 1);
    
    // Generate grid points
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        points.push({
          x: left + col * cellWidth,
          y: top + row * cellHeight
        });
      }
    }
    
    return points;
  }
  
  /**
   * Generate diagonal points within a display configuration
   * 
   * @param count Number of points to generate
   * @param config Display configuration
   * @returns Array of diagonal points
   */
  private generateDiagonalPoints(
    count: number,
    config: DisplayConfiguration
  ): Point[] {
    const points: Point[] = [];
    
    // Calculate browser window edges in screen coordinates
    const left = config.browserPosition.x;
    const top = config.browserPosition.y;
    const right = left + config.viewportDimensions.width * config.dpiScaling;
    const bottom = top + config.viewportDimensions.height * config.dpiScaling;
    
    // Generate points along the diagonal
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      points.push({
        x: left + t * (right - left),
        y: top + t * (bottom - top)
      });
    }
    
    return points;
  }
  
  /**
   * Generate points at extreme positions
   * 
   * @param config Display configuration
   * @returns Array of extreme points
   */
  private generateExtremePoints(config: DisplayConfiguration): Point[] {
    const points: Point[] = [];
    
    // Calculate browser window edges in screen coordinates
    const left = config.browserPosition.x;
    const top = config.browserPosition.y;
    const right = left + config.viewportDimensions.width * config.dpiScaling;
    const bottom = top + config.viewportDimensions.height * config.dpiScaling;
    
    // Add corner points
    points.push({ x: left, y: top });               // Top-left
    points.push({ x: right, y: top });              // Top-right
    points.push({ x: left, y: bottom });            // Bottom-left
    points.push({ x: right, y: bottom });           // Bottom-right
    
    // Add center point
    points.push({ x: (left + right) / 2, y: (top + bottom) / 2 });
    
    // Add edge midpoints
    points.push({ x: (left + right) / 2, y: top });       // Top middle
    points.push({ x: (left + right) / 2, y: bottom });    // Bottom middle
    points.push({ x: left, y: (top + bottom) / 2 });      // Left middle
    points.push({ x: right, y: (top + bottom) / 2 });     // Right middle
    
    return points;
  }
  
  /**
   * Get high-resolution time in seconds
   * 
   * @returns Current time in seconds with high precision
   */
  private getHighResolutionTime(): number {
    // Use performance.now() in browser or process.hrtime() in Node.js
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now() / 1000; // Convert to seconds
    }
    
    // Fallback to Date.now() which has lower precision
    return Date.now() / 1000;
  }
  
  /**
   * Calculate average of an array of numbers
   * 
   * @param values Array of numbers
   * @returns Average value
   */
  private calculateAverage(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }
  
  /**
   * Calculate median of an array of numbers
   * Assumes the array is already sorted
   * 
   * @param values Sorted array of numbers
   * @returns Median value
   */
  private calculateMedian(values: number[]): number {
    const mid = Math.floor(values.length / 2);
    
    if (values.length % 2 === 0) {
      return (values[mid - 1] + values[mid]) / 2;
    }
    
    return values[mid];
  }
  
  /**
   * Calculate standard deviation of an array of numbers
   * 
   * @param values Array of numbers
   * @param mean Mean value (if already calculated)
   * @returns Standard deviation
   */
  private calculateStandardDeviation(values: number[], mean?: number): number {
    const avg = mean !== undefined ? mean : this.calculateAverage(values);
    
    const squaredDiffs = values.map(value => {
      const diff = value - avg;
      return diff * diff;
    });
    
    const variance = this.calculateAverage(squaredDiffs);
    return Math.sqrt(variance);
  }
}