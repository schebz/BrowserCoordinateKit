/**
 * Tests for PerformanceBenchmark utility
 */

import { PerformanceBenchmark, BenchmarkResult } from '../../src/utils/performanceBenchmark';
import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../../src/core/types';
import { TransformationStrategy } from '../../src/strategies/transformationStrategy';
import { DirectFormulaStrategy } from '../../src/strategies/directFormulaStrategy';

// Mock strategy for predictable performance testing
class MockStrategy implements PositionCalculationStrategy {
  private delay: number;
  
  constructor(delay: number = 0) {
    this.delay = delay;
  }
  
  calculateTargetPosition(
    sourcePoint: Point, 
    sourceConfig: DisplayConfiguration, 
    targetConfig: DisplayConfiguration
  ): Point {
    // Simulate work with a delay
    if (this.delay > 0) {
      const start = Date.now();
      while (Date.now() - start < this.delay) {
        // Busy wait to ensure consistent timing
      }
    }
    
    // Return a simple transformation based on input
    return {
      x: sourcePoint.x / 2,
      y: sourcePoint.y / 2
    };
  }
  
  calculateSourcePosition(
    targetPoint: Point, 
    sourceConfig: DisplayConfiguration, 
    targetConfig: DisplayConfiguration
  ): Point {
    // Simulate work with a delay
    if (this.delay > 0) {
      const start = Date.now();
      while (Date.now() - start < this.delay) {
        // Busy wait to ensure consistent timing
      }
    }
    
    // Return a simple transformation based on input
    return {
      x: targetPoint.x * 2,
      y: targetPoint.y * 2
    };
  }
}

describe('PerformanceBenchmark', () => {
  // Test configurations
  const sourceConfig: DisplayConfiguration = {
    screenDimensions: { width: 2560, height: 1440 },
    browserPosition: { x: 100, y: 50 },
    viewportDimensions: { width: 2000, height: 1000 },
    dpiScaling: 2
  };
  
  const targetConfig: DisplayConfiguration = {
    screenDimensions: { width: 1920, height: 1080 },
    browserPosition: { x: 75, y: 37.5 },
    viewportDimensions: { width: 1800, height: 900 },
    dpiScaling: 1.5
  };
  
  // Test points
  const testPoints: Point[] = [
    { x: 500, y: 300 },
    { x: 1000, y: 600 },
    { x: 1500, y: 900 },
    { x: 2000, y: 1200 }
  ];
  
  describe('measureStrategy', () => {
    it('should measure execution time of a strategy', () => {
      const benchmark = new PerformanceBenchmark();
      const fastStrategy = new MockStrategy(0);
      
      const result = benchmark.measureStrategy(
        fastStrategy,
        testPoints,
        sourceConfig,
        targetConfig,
        10 // Low iteration count for tests
      );
      
      // Verify result structure
      expect(result).toHaveProperty('averageExecutionTime');
      expect(result).toHaveProperty('medianExecutionTime');
      expect(result).toHaveProperty('minExecutionTime');
      expect(result).toHaveProperty('maxExecutionTime');
      expect(result).toHaveProperty('standardDeviation');
      expect(result).toHaveProperty('iterationCount', 10);
      expect(result).toHaveProperty('pointCount', 4);
      
      // Execution time should be positive
      expect(result.averageExecutionTime).toBeGreaterThan(0);
    });
    
    it('should measure relative difference between fast and slow strategies', () => {
      const benchmark = new PerformanceBenchmark();
      const fastStrategy = new MockStrategy(0);
      const slowStrategy = new MockStrategy(5); // 5ms delay
      
      const fastResult = benchmark.measureStrategy(
        fastStrategy,
        testPoints,
        sourceConfig,
        targetConfig,
        10
      );
      
      const slowResult = benchmark.measureStrategy(
        slowStrategy,
        testPoints,
        sourceConfig,
        targetConfig,
        10
      );
      
      // Slow strategy should take significantly longer
      expect(slowResult.averageExecutionTime).toBeGreaterThan(fastResult.averageExecutionTime);
      
      // The difference should be at least the simulated delay
      // (accounting for number of points and additional overhead)
      const minExpectedDifference = 5 * 1000 * testPoints.length; // 5ms * 1000 (to μs) * 4 points
      expect(slowResult.averageExecutionTime - fastResult.averageExecutionTime)
        .toBeGreaterThanOrEqual(minExpectedDifference * 0.8); // Allow 20% margin for test variability
    });
  });
  
  describe('compareStrategies', () => {
    it('should compare multiple strategies', () => {
      const benchmark = new PerformanceBenchmark();
      
      const strategies = new Map<string, PositionCalculationStrategy>([
        ['fast', new MockStrategy(0)],
        ['medium', new MockStrategy(1)],
        ['slow', new MockStrategy(2)]
      ]);
      
      const results = benchmark.compareStrategies(
        strategies,
        testPoints,
        sourceConfig,
        targetConfig,
        10
      );
      
      // Verify results for all strategies
      expect(results.size).toBe(3);
      expect(results.has('fast')).toBe(true);
      expect(results.has('medium')).toBe(true);
      expect(results.has('slow')).toBe(true);
      
      // Verify relative performance
      const fastResult = results.get('fast')!;
      const mediumResult = results.get('medium')!;
      const slowResult = results.get('slow')!;
      
      expect(mediumResult.averageExecutionTime).toBeGreaterThan(fastResult.averageExecutionTime);
      expect(slowResult.averageExecutionTime).toBeGreaterThan(mediumResult.averageExecutionTime);
    });
    
    it('should compare the actual strategy implementations', () => {
      const benchmark = new PerformanceBenchmark();
      
      const strategies = new Map<string, PositionCalculationStrategy>([
        ['transformation', new TransformationStrategy()],
        ['directFormula', new DirectFormulaStrategy()]
      ]);
      
      // Generate a larger number of test points for more reliable comparison
      const points = benchmark.generateTestPoints(20, sourceConfig);
      
      const results = benchmark.compareStrategies(
        strategies,
        points,
        sourceConfig,
        targetConfig,
        10
      );
      
      // Verify results for all strategies
      expect(results.size).toBe(2);
      expect(results.has('transformation')).toBe(true);
      expect(results.has('directFormula')).toBe(true);
      
      // We don't test which is faster since it might vary across environments
      // Just verify that we get performance numbers
      const transformationResult = results.get('transformation')!;
      const directFormulaResult = results.get('directFormula')!;
      
      expect(transformationResult.averageExecutionTime).toBeGreaterThan(0);
      expect(directFormulaResult.averageExecutionTime).toBeGreaterThan(0);
    });
  });
  
  describe('generateTestPoints', () => {
    it('should generate the requested number of test points', () => {
      const benchmark = new PerformanceBenchmark();
      
      const points = benchmark.generateTestPoints(100, sourceConfig);
      
      expect(points.length).toBe(100);
    });
    
    it('should generate points within the browser window', () => {
      const benchmark = new PerformanceBenchmark();
      
      const points = benchmark.generateTestPoints(100, sourceConfig);
      
      // Calculate browser window edges in screen coordinates
      const left = sourceConfig.browserPosition.x;
      const top = sourceConfig.browserPosition.y;
      const right = left + sourceConfig.viewportDimensions.width * sourceConfig.dpiScaling;
      const bottom = top + sourceConfig.viewportDimensions.height * sourceConfig.dpiScaling;
      
      // All points should be within browser window
      for (const point of points) {
        expect(point.x).toBeGreaterThanOrEqual(left);
        expect(point.x).toBeLessThanOrEqual(right);
        expect(point.y).toBeGreaterThanOrEqual(top);
        expect(point.y).toBeLessThanOrEqual(bottom);
      }
    });
    
    it('should generate edge points according to edgeRatio', () => {
      const benchmark = new PerformanceBenchmark();
      
      // Generate points with high edge ratio
      const points = benchmark.generateTestPoints(100, sourceConfig, 1.0);
      
      // Calculate browser window edges in screen coordinates
      const left = sourceConfig.browserPosition.x;
      const top = sourceConfig.browserPosition.y;
      const right = left + sourceConfig.viewportDimensions.width * sourceConfig.dpiScaling;
      const bottom = top + sourceConfig.viewportDimensions.height * sourceConfig.dpiScaling;
      
      // Count points near edges
      const edgeThreshold = 10;
      let edgePointCount = 0;
      
      for (const point of points) {
        if (
          point.x <= left + edgeThreshold ||
          point.x >= right - edgeThreshold ||
          point.y <= top + edgeThreshold ||
          point.y >= bottom - edgeThreshold
        ) {
          edgePointCount++;
        }
      }
      
      // With edgeRatio = 1.0, all points should be near edges
      expect(edgePointCount).toBe(100);
    });
  });
  
  describe('generateScenarioTestPoints', () => {
    it('should generate test points for different scenarios', () => {
      const benchmark = new PerformanceBenchmark();
      
      const scenarios = benchmark.generateScenarioTestPoints(sourceConfig);
      
      // Verify all scenarios are present
      expect(scenarios.size).toBeGreaterThanOrEqual(5);
      expect(scenarios.has('standard')).toBe(true);
      expect(scenarios.has('edges')).toBe(true);
      expect(scenarios.has('grid')).toBe(true);
      expect(scenarios.has('diagonal')).toBe(true);
      expect(scenarios.has('extreme')).toBe(true);
      
      // Verify each scenario has points
      for (const [name, points] of scenarios.entries()) {
        expect(points.length).toBeGreaterThan(0);
      }
      
      // Check specific scenarios
      const grid = scenarios.get('grid')!;
      expect(grid.length).toBe(10 * 10); // Default is 10x10 grid
      
      const extreme = scenarios.get('extreme')!;
      expect(extreme.length).toBe(9); // 4 corners + center + 4 edge midpoints
      
      const diagonal = scenarios.get('diagonal')!;
      expect(diagonal.length).toBe(100); // Default is 100 points
    });
  });
});