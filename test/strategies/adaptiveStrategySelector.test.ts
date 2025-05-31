/**
 * Tests for AdaptiveStrategySelector
 */

import { AdaptiveStrategySelector, AdaptiveStrategyOptions } from '../../src/strategies/adaptiveStrategySelector';
import { TransformationStrategy } from '../../src/strategies/transformationStrategy';
import { DirectFormulaStrategy } from '../../src/strategies/directFormulaStrategy';
import { CachedTransformationStrategy } from '../../src/strategies/cachedTransformationStrategy';
import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../../src/core/types';

// Mock strategy with configurable performance characteristics
class MockStrategy implements PositionCalculationStrategy {
  private executionTimeMs: number;
  private name: string;
  
  constructor(name: string, executionTimeMs: number) {
    this.name = name;
    this.executionTimeMs = executionTimeMs;
  }
  
  getName(): string {
    return this.name;
  }
  
  calculateTargetPosition(
    sourcePoint: Point, 
    sourceConfig: DisplayConfiguration, 
    targetConfig: DisplayConfiguration
  ): Point {
    // Simulate execution time
    if (this.executionTimeMs > 0) {
      const start = Date.now();
      while (Date.now() - start < this.executionTimeMs) {
        // Busy wait
      }
    }
    
    // Return a simple transformation
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
    // Simulate execution time
    if (this.executionTimeMs > 0) {
      const start = Date.now();
      while (Date.now() - start < this.executionTimeMs) {
        // Busy wait
      }
    }
    
    // Return a simple transformation
    return {
      x: targetPoint.x * 2,
      y: targetPoint.y * 2
    };
  }
}

describe('AdaptiveStrategySelector', () => {
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
  const sourcePoint: Point = { x: 2065, y: 539 };
  const targetPoint: Point = { x: 982.5, y: 244.5 };
  
  describe('basic functionality', () => {
    it('should use default strategies if none are provided', () => {
      const selector = new AdaptiveStrategySelector();
      
      // Calculate a position to trigger strategy selection
      const result = selector.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Should produce a valid result
      expect(result).toBeDefined();
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
    });
    
    it('should use provided strategies', () => {
      // Create mock strategies
      const fast = new MockStrategy('fast', 0);
      const slow = new MockStrategy('slow', 10);
      
      const strategies = new Map<string, PositionCalculationStrategy>([
        ['fast', fast],
        ['slow', slow]
      ]);
      
      const options: AdaptiveStrategyOptions = {
        availableStrategies: strategies,
        benchmarkPointCount: 1,
        benchmarkIterations: 3,
        enableCaching: false
      };
      
      const selector = new AdaptiveStrategySelector(options);
      
      // Trigger benchmarking
      const bestStrategy = selector.benchmarkStrategies(sourceConfig, targetConfig);
      
      // Fast strategy should be selected
      expect(bestStrategy).toBe('fast');
    });
    
    it('should calculate target position correctly', () => {
      const selector = new AdaptiveStrategySelector({
        benchmarkPointCount: 1,
        benchmarkIterations: 3
      });
      
      // Calculate using the selector
      const result = selector.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Calculate using a reference strategy for comparison
      const reference = new TransformationStrategy();
      const expected = reference.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Results should match
      expect(result.x).toBeCloseTo(expected.x, 10);
      expect(result.y).toBeCloseTo(expected.y, 10);
    });
    
    it('should calculate source position correctly', () => {
      const selector = new AdaptiveStrategySelector({
        benchmarkPointCount: 1,
        benchmarkIterations: 3
      });
      
      // Calculate using the selector
      const result = selector.calculateSourcePosition(
        targetPoint,
        sourceConfig,
        targetConfig
      );
      
      // Calculate using a reference strategy for comparison
      const reference = new TransformationStrategy();
      const expected = reference.calculateSourcePosition(
        targetPoint,
        sourceConfig,
        targetConfig
      );
      
      // Results should match
      expect(result.x).toBeCloseTo(expected.x, 10);
      expect(result.y).toBeCloseTo(expected.y, 10);
    });
  });
  
  describe('strategy selection', () => {
    it('should select the fastest strategy', () => {
      // Create strategies with predictable performance
      const fast = new MockStrategy('fast', 0);
      const medium = new MockStrategy('medium', 5);
      const slow = new MockStrategy('slow', 10);
      
      const strategies = new Map<string, PositionCalculationStrategy>([
        ['fast', fast],
        ['medium', medium],
        ['slow', slow]
      ]);
      
      const options: AdaptiveStrategyOptions = {
        availableStrategies: strategies,
        benchmarkPointCount: 1,
        benchmarkIterations: 3,
        enableCaching: false
      };
      
      const selector = new AdaptiveStrategySelector(options);
      
      // Trigger benchmarking
      const bestStrategy = selector.benchmarkStrategies(sourceConfig, targetConfig);
      
      // Fastest strategy should be selected
      expect(bestStrategy).toBe('fast');
    });
    
    it('should handle different configuration pairs separately', () => {
      // Create strategies with predictable performance
      const fastForConfig1 = new MockStrategy('fastForConfig1', 0);
      const fastForConfig2 = new MockStrategy('fastForConfig2', 20);
      
      // For config pair 1, 'fastForConfig1' is faster
      // For config pair 2, 'fastForConfig2' is faster
      // The mock execution times are swapped to switch which one is faster
      const getMockStrategies = (
        config1: DisplayConfiguration,
        config2: DisplayConfiguration
      ): Map<string, PositionCalculationStrategy> => {
        const configId = `${config1.dpiScaling}|${config2.dpiScaling}`;
        
        if (configId === `${sourceConfig.dpiScaling}|${targetConfig.dpiScaling}`) {
          return new Map([
            ['fastForConfig1', new MockStrategy('fastForConfig1', 0)],
            ['fastForConfig2', new MockStrategy('fastForConfig2', 20)]
          ]);
        } else {
          return new Map([
            ['fastForConfig1', new MockStrategy('fastForConfig1', 20)],
            ['fastForConfig2', new MockStrategy('fastForConfig2', 0)]
          ]);
        }
      };
      
      // Create selector with first config pair strategies
      const selector = new AdaptiveStrategySelector({
        availableStrategies: getMockStrategies(sourceConfig, targetConfig),
        benchmarkPointCount: 1,
        benchmarkIterations: 3,
        enableCaching: false
      });
      
      // Trigger benchmarking for first config pair
      const bestStrategy1 = selector.benchmarkStrategies(sourceConfig, targetConfig);
      expect(bestStrategy1).toBe('fastForConfig1');
      
      // Create different config pair
      const otherSourceConfig = { ...sourceConfig, dpiScaling: 3 };
      const otherTargetConfig = { ...targetConfig, dpiScaling: 3 };
      
      // Replace strategies to simulate different performance characteristics
      const strategies2 = getMockStrategies(otherSourceConfig, otherTargetConfig);
      for (const [name, strategy] of strategies2.entries()) {
        (selector as any).strategies.set(name, strategy);
      }
      
      // Trigger benchmarking for second config pair
      const bestStrategy2 = selector.benchmarkStrategies(otherSourceConfig, otherTargetConfig);
      expect(bestStrategy2).toBe('fastForConfig2');
      
      // Check current strategy for each config pair
      expect(selector.getCurrentStrategyName(sourceConfig, targetConfig)).toBe('fastForConfig1');
      expect(selector.getCurrentStrategyName(otherSourceConfig, otherTargetConfig)).toBe('fastForConfig2');
    });
    
    it('should prefer cached strategies if enabled', () => {
      jest.clearAllMocks();
      
      // Create a direct implementation to avoid Jest issues with mock counting
      class SimpleStrategy implements PositionCalculationStrategy {
        public callCount = 0;
        
        calculateTargetPosition(p: Point, s: DisplayConfiguration, t: DisplayConfiguration): Point {
          this.callCount++;
          return { x: p.x / 2, y: p.y / 2 };
        }
        
        calculateSourcePosition(p: Point, s: DisplayConfiguration, t: DisplayConfiguration): Point {
          return { x: p.x * 2, y: p.y * 2 };
        }
      }
      
      // Create strategy and track calls directly
      const simpleStrategy = new SimpleStrategy();
      
      const strategies = new Map<string, PositionCalculationStrategy>([
        ['simple', simpleStrategy]
      ]);
      
      // Create selector with caching enabled (no auto-benchmarking)
      const selector = new AdaptiveStrategySelector({
        availableStrategies: strategies,
        benchmarkPointCount: 1,
        benchmarkIterations: 1, // Minimize benchmark calls
        enableCaching: true,
        enableAutoBenchmarking: false
      });
      
      // Instead of benchmarking, manually configure the scenario
      // This avoids the benchmarking step which makes many calls to the strategy
      const configPairId = `${sourceConfig.screenDimensions.width}x${sourceConfig.screenDimensions.height}_${sourceConfig.browserPosition.x},${sourceConfig.browserPosition.y}_${sourceConfig.viewportDimensions.width}x${sourceConfig.viewportDimensions.height}_${sourceConfig.dpiScaling}|${targetConfig.screenDimensions.width}x${targetConfig.screenDimensions.height}_${targetConfig.browserPosition.x},${targetConfig.browserPosition.y}_${targetConfig.viewportDimensions.width}x${targetConfig.viewportDimensions.height}_${targetConfig.dpiScaling}`;
      
      // Access the internal scenario map and add our preferred strategy
      const scenarioMap = (selector as any).scenarioBestStrategy;
      scenarioMap.set(configPairId, {
        configPairId,
        operationCount: 0,
        bestStrategyName: 'cached_simple',
        switchCount: 0,
        lastBenchmarked: Date.now()
      });
      
      // Reset call count before the actual test
      simpleStrategy.callCount = 0;
      
      // Using the selector multiple times with the same inputs should hit the cache
      const point = { x: 100, y: 200 };
      selector.calculateTargetPosition(point, sourceConfig, targetConfig);
      selector.calculateTargetPosition(point, sourceConfig, targetConfig);
      selector.calculateTargetPosition(point, sourceConfig, targetConfig);
      
      // Underlying strategy should only be called once if caching is working
      expect(simpleStrategy.callCount).toBe(1);
    });
    
    it('should limit the number of strategy switches', () => {
      // Create selector with low max switches
      const selector = new AdaptiveStrategySelector({
        maxStrategySwitches: 2,
        benchmarkPointCount: 1,
        benchmarkIterations: 3
      });
      
      // Artificially trigger several strategy switches for same config pair
      const configPairId = `${sourceConfig.screenDimensions.width}x${sourceConfig.screenDimensions.height}_${sourceConfig.browserPosition.x},${sourceConfig.browserPosition.y}_${sourceConfig.viewportDimensions.width}x${sourceConfig.viewportDimensions.height}_${sourceConfig.dpiScaling}|${targetConfig.screenDimensions.width}x${targetConfig.screenDimensions.height}_${targetConfig.browserPosition.x},${targetConfig.browserPosition.y}_${targetConfig.viewportDimensions.width}x${targetConfig.viewportDimensions.height}_${targetConfig.dpiScaling}`;
      
      // Access the internal scenario map and modify it
      // This is not ideal but allows us to test the maxStrategySwitches behavior
      const scenarioMap = (selector as any).scenarioBestStrategy;
      
      // Create initial scenario
      scenarioMap.set(configPairId, {
        configPairId,
        operationCount: 0,
        bestStrategyName: 'transformation',
        switchCount: 2, // Already at the limit
        lastBenchmarked: Date.now() - 1000 // Benchmarked a while ago
      });
      
      // Try to trigger benchmarking
      const didReBenchmark = (selector as any).shouldBenchmark(scenarioMap.get(configPairId));
      
      // Should not benchmark due to switch limit
      expect(didReBenchmark).toBe(false);
    });
  });
  
  describe('auto-benchmarking', () => {
    it('should re-benchmark on interval if auto-benchmarking is enabled', () => {
      const selector = new AdaptiveStrategySelector({
        enableAutoBenchmarking: true,
        benchmarkInterval: 5, // Benchmark every 5 operations
        benchmarkPointCount: 1,
        benchmarkIterations: 3
      });
      
      // Spy on the benchmarkStrategies method
      const spy = jest.spyOn(selector, 'benchmarkStrategies');
      
      // Initial operation should trigger benchmark
      selector.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Operations 2-4 shouldn't trigger benchmark
      selector.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      selector.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      selector.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Operation 5 should trigger benchmark (5 % 5 = 0)
      selector.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spy).toHaveBeenCalledTimes(2);
    });
    
    it('should not re-benchmark if auto-benchmarking is disabled', () => {
      const selector = new AdaptiveStrategySelector({
        enableAutoBenchmarking: false,
        benchmarkPointCount: 1,
        benchmarkIterations: 3
      });
      
      // Spy on the benchmarkStrategies method
      const spy = jest.spyOn(selector, 'benchmarkStrategies');
      
      // Initial operation should trigger benchmark
      selector.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Subsequent operations shouldn't trigger benchmark
      for (let i = 0; i < 10; i++) {
        selector.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      }
      
      // Should still be at 1 benchmark
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('mathematical properties', () => {
    it('should preserve round-trip precision', () => {
      const selector = new AdaptiveStrategySelector({
        benchmarkPointCount: 1,
        benchmarkIterations: 3
      });
      
      // Points to test
      const testPoints = [
        { x: 100, y: 200 },
        { x: 1500, y: 800 },
        { x: 2500, y: 1400 },
        { x: 0, y: 0 }
      ];
      
      for (const point of testPoints) {
        // Forward transformation
        const targetPoint = selector.calculateTargetPosition(
          point,
          sourceConfig,
          targetConfig
        );
        
        // Inverse transformation
        const roundTrip = selector.calculateSourcePosition(
          targetPoint,
          sourceConfig,
          targetConfig
        );
        
        // Should get back the original point
        expect(roundTrip.x).toBeCloseTo(point.x, 10);
        expect(roundTrip.y).toBeCloseTo(point.y, 10);
      }
    });
  });
  
  describe('statistics', () => {
    it('should track strategy usage statistics', () => {
      // Create strategies
      const fast = new MockStrategy('fast', 0);
      const slow = new MockStrategy('slow', 10);
      
      const strategies = new Map<string, PositionCalculationStrategy>([
        ['fast', fast],
        ['slow', slow]
      ]);
      
      const selector = new AdaptiveStrategySelector({
        availableStrategies: strategies,
        benchmarkPointCount: 1,
        benchmarkIterations: 3,
        enableCaching: false
      });
      
      // Initial statistics should be empty
      const initialStats = selector.getStatistics();
      expect(initialStats.scenarioCount).toBe(0);
      
      // Trigger benchmarking for different config pairs
      selector.benchmarkStrategies(sourceConfig, targetConfig);
      
      const config2 = { ...sourceConfig, dpiScaling: 1.25 };
      const config3 = { ...sourceConfig, dpiScaling: 1.5 };
      
      selector.benchmarkStrategies(config2, targetConfig);
      selector.benchmarkStrategies(config3, targetConfig);
      
      // Statistics should now show 3 scenarios
      const stats = selector.getStatistics();
      expect(stats.scenarioCount).toBe(3);
      
      // All should have selected 'fast'
      expect(stats.strategyDistribution.get('fast')).toBe(3);
      
      // Reset statistics
      selector.reset();
      
      // Statistics should be empty again
      const finalStats = selector.getStatistics();
      expect(finalStats.scenarioCount).toBe(0);
    });
  });
});