/**
 * Tests for CachedTransformationStrategy
 */

import { CachedTransformationStrategy, CacheOptions } from '../../src/strategies/cachedTransformationStrategy';
import { TransformationStrategy } from '../../src/strategies/transformationStrategy';
import { DirectFormulaStrategy } from '../../src/strategies/directFormulaStrategy';
import { Point, DisplayConfiguration, PositionCalculationStrategy } from '../../src/core/types';

// Spy strategy to track calls
class SpyStrategy implements PositionCalculationStrategy {
  targetPositionCalls: number = 0;
  sourcePositionCalls: number = 0;
  
  calculateTargetPosition(
    sourcePoint: Point, 
    sourceConfig: DisplayConfiguration, 
    targetConfig: DisplayConfiguration
  ): Point {
    this.targetPositionCalls++;
    
    // Simple transformation for testing
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
    this.sourcePositionCalls++;
    
    // Simple inverse transformation for testing
    return {
      x: targetPoint.x * 2,
      y: targetPoint.y * 2
    };
  }
  
  reset(): void {
    this.targetPositionCalls = 0;
    this.sourcePositionCalls = 0;
  }
}

describe('CachedTransformationStrategy', () => {
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
    it('should use TransformationStrategy by default', () => {
      const strategy = new CachedTransformationStrategy();
      const transformationStrategy = strategy.getUnderlyingStrategy();
      
      expect(transformationStrategy).toBeInstanceOf(TransformationStrategy);
    });
    
    it('should use the provided strategy', () => {
      const directStrategy = new DirectFormulaStrategy();
      const strategy = new CachedTransformationStrategy(directStrategy);
      
      expect(strategy.getUnderlyingStrategy()).toBe(directStrategy);
    });
    
    it('should calculate target position correctly', () => {
      const baseStrategy = new TransformationStrategy();
      const cachedStrategy = new CachedTransformationStrategy(baseStrategy);
      
      // Get expected result from base strategy
      const expectedResult = baseStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Get result from cached strategy
      const result = cachedStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Should produce identical results
      expect(result.x).toBeCloseTo(expectedResult.x, 10);
      expect(result.y).toBeCloseTo(expectedResult.y, 10);
    });
    
    it('should calculate source position correctly', () => {
      const baseStrategy = new TransformationStrategy();
      const cachedStrategy = new CachedTransformationStrategy(baseStrategy);
      
      // Get expected result from base strategy
      const expectedResult = baseStrategy.calculateSourcePosition(
        targetPoint,
        sourceConfig,
        targetConfig
      );
      
      // Get result from cached strategy
      const result = cachedStrategy.calculateSourcePosition(
        targetPoint,
        sourceConfig,
        targetConfig
      );
      
      // Should produce identical results
      expect(result.x).toBeCloseTo(expectedResult.x, 10);
      expect(result.y).toBeCloseTo(expectedResult.y, 10);
    });
    
    it('should produce same results for same inputs', () => {
      const cachedStrategy = new CachedTransformationStrategy();
      
      // First calculation
      const result1 = cachedStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Second calculation with same inputs
      const result2 = cachedStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Should produce identical results
      expect(result2.x).toBeCloseTo(result1.x, 10);
      expect(result2.y).toBeCloseTo(result1.y, 10);
    });
  });
  
  describe('caching behavior', () => {
    it('should cache calculation results', () => {
      const spyStrategy = new SpyStrategy();
      const cachedStrategy = new CachedTransformationStrategy(spyStrategy);
      
      // First calculation should use the underlying strategy
      cachedStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      expect(spyStrategy.targetPositionCalls).toBe(1);
      
      // Second calculation with same inputs should use cache
      cachedStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Underlying strategy should not be called again
      expect(spyStrategy.targetPositionCalls).toBe(1);
      
      // Different point should call underlying strategy
      cachedStrategy.calculateTargetPosition(
        { x: 1000, y: 500 },
        sourceConfig,
        targetConfig
      );
      
      expect(spyStrategy.targetPositionCalls).toBe(2);
    });
    
    it('should cache source position calculations separately', () => {
      const spyStrategy = new SpyStrategy();
      const cachedStrategy = new CachedTransformationStrategy(spyStrategy);
      
      // Target position calculation
      cachedStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      expect(spyStrategy.targetPositionCalls).toBe(1);
      expect(spyStrategy.sourcePositionCalls).toBe(0);
      
      // Source position calculation
      cachedStrategy.calculateSourcePosition(
        targetPoint,
        sourceConfig,
        targetConfig
      );
      
      expect(spyStrategy.targetPositionCalls).toBe(1);
      expect(spyStrategy.sourcePositionCalls).toBe(1);
      
      // Repeat both calculations
      cachedStrategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      cachedStrategy.calculateSourcePosition(
        targetPoint,
        sourceConfig,
        targetConfig
      );
      
      // Counts should remain the same
      expect(spyStrategy.targetPositionCalls).toBe(1);
      expect(spyStrategy.sourcePositionCalls).toBe(1);
    });
    
    it('should respect maxSize option', async () => {
      const spyStrategy = new SpyStrategy();
      const cachedStrategy = new CachedTransformationStrategy(spyStrategy, { maxSize: 2 });
      
      // Fill cache with different points
      cachedStrategy.calculateTargetPosition({ x: 1, y: 1 }, sourceConfig, targetConfig);
      cachedStrategy.calculateTargetPosition({ x: 2, y: 2 }, sourceConfig, targetConfig);
      
      expect(spyStrategy.targetPositionCalls).toBe(2);
      
      // This should be cached
      cachedStrategy.calculateTargetPosition({ x: 2, y: 2 }, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(2);
      
      // Add a third point, which should evict the least recently used one (x:1, y:1)
      cachedStrategy.calculateTargetPosition({ x: 3, y: 3 }, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(3);
      
      // First point should be evicted and recalculated
      cachedStrategy.calculateTargetPosition({ x: 1, y: 1 }, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(4);
      
      // But recently used points should still be cached
      cachedStrategy.calculateTargetPosition({ x: 3, y: 3 }, sourceConfig, targetConfig);
      cachedStrategy.calculateTargetPosition({ x: 1, y: 1 }, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(4);
    });
    
    it('should respect TTL option', async () => {
      jest.useFakeTimers();
      
      const spyStrategy = new SpyStrategy();
      const cachedStrategy = new CachedTransformationStrategy(spyStrategy, { ttl: 100 });
      
      // Initial calculation
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(1);
      
      // Should still be cached
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(1);
      
      // Advance time beyond TTL
      jest.advanceTimersByTime(110);
      
      // Should be recalculated
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(2);
      
      jest.useRealTimers();
    });
    
    it('should track cache statistics', () => {
      const spyStrategy = new SpyStrategy();
      const cachedStrategy = new CachedTransformationStrategy(spyStrategy);
      
      // Initial state
      expect(cachedStrategy.getCacheStatistics().hits).toBe(0);
      expect(cachedStrategy.getCacheStatistics().misses).toBe(0);
      
      // First call - miss
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(cachedStrategy.getCacheStatistics().hits).toBe(0);
      expect(cachedStrategy.getCacheStatistics().misses).toBe(1);
      
      // Second call - hit
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(cachedStrategy.getCacheStatistics().hits).toBe(1);
      expect(cachedStrategy.getCacheStatistics().misses).toBe(1);
      
      // Different point - miss
      cachedStrategy.calculateTargetPosition({ x: 1000, y: 500 }, sourceConfig, targetConfig);
      expect(cachedStrategy.getCacheStatistics().hits).toBe(1);
      expect(cachedStrategy.getCacheStatistics().misses).toBe(2);
      
      // Hit rate should be calculated correctly
      expect(cachedStrategy.getCacheStatistics().hitRate).toBeCloseTo(1/3, 10);
      
      // Check cache sizes
      expect(cachedStrategy.getCacheStatistics().targetCacheSize).toBe(2);
      expect(cachedStrategy.getCacheStatistics().sourceCacheSize).toBe(0);
      
      // Clear cache
      cachedStrategy.clearCache();
      
      // Statistics should be reset
      expect(cachedStrategy.getCacheStatistics().hits).toBe(0);
      expect(cachedStrategy.getCacheStatistics().misses).toBe(0);
      expect(cachedStrategy.getCacheStatistics().targetCacheSize).toBe(0);
      expect(cachedStrategy.getCacheStatistics().sourceCacheSize).toBe(0);
    });
  });
  
  describe('configuration changes', () => {
    it('should detect changes in source configuration', () => {
      const spyStrategy = new SpyStrategy();
      const cachedStrategy = new CachedTransformationStrategy(spyStrategy);
      
      // Initial calculation
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(1);
      
      // Modified source config
      const modifiedSourceConfig = {
        ...sourceConfig,
        dpiScaling: 1.5
      };
      
      // Should recalculate with modified config
      cachedStrategy.calculateTargetPosition(sourcePoint, modifiedSourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(2);
    });
    
    it('should detect changes in target configuration', () => {
      const spyStrategy = new SpyStrategy();
      const cachedStrategy = new CachedTransformationStrategy(spyStrategy);
      
      // Initial calculation
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, targetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(1);
      
      // Modified target config
      const modifiedTargetConfig = {
        ...targetConfig,
        browserPosition: { x: 80, y: 40 }
      };
      
      // Should recalculate with modified config
      cachedStrategy.calculateTargetPosition(sourcePoint, sourceConfig, modifiedTargetConfig);
      expect(spyStrategy.targetPositionCalls).toBe(2);
    });
  });
  
  describe('mathematical properties', () => {
    it('should preserve round-trip precision', () => {
      const cachedStrategy = new CachedTransformationStrategy();
      
      // Points to test
      const testPoints = [
        { x: 100, y: 200 },
        { x: 1500, y: 800 },
        { x: 2500, y: 1400 },
        { x: 0, y: 0 }
      ];
      
      for (const point of testPoints) {
        // Forward transformation
        const targetPoint = cachedStrategy.calculateTargetPosition(
          point,
          sourceConfig,
          targetConfig
        );
        
        // Inverse transformation
        const roundTrip = cachedStrategy.calculateSourcePosition(
          targetPoint,
          sourceConfig,
          targetConfig
        );
        
        // Should get back the original point
        expect(roundTrip.x).toBeCloseTo(point.x, 10);
        expect(roundTrip.y).toBeCloseTo(point.y, 10);
      }
    });
    
    it('should produce results identical to the underlying strategy', () => {
      const baseStrategy = new TransformationStrategy();
      const cachedStrategy = new CachedTransformationStrategy(baseStrategy);
      
      // Points to test
      const testPoints = [
        { x: 100, y: 200 },
        { x: 1500, y: 800 },
        { x: 2500, y: 1400 },
        { x: 0, y: 0 }
      ];
      
      for (const point of testPoints) {
        // Base strategy calculation
        const baseResult = baseStrategy.calculateTargetPosition(
          point,
          sourceConfig,
          targetConfig
        );
        
        // Cached strategy calculation
        const cachedResult = cachedStrategy.calculateTargetPosition(
          point,
          sourceConfig,
          targetConfig
        );
        
        // Results should be identical
        expect(cachedResult.x).toBeCloseTo(baseResult.x, 10);
        expect(cachedResult.y).toBeCloseTo(baseResult.y, 10);
      }
    });
  });
});