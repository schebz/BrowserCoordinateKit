/**
 * Tests for BrowserPositionCalculator
 * @version 1.0.3
 * @lastModified 2025-05-18
 * @changelog Updated tests for adaptive strategy selection
 */

import { BrowserPositionCalculator, BrowserPositionCalculatorOptions } from '../../src/core/browserPositionCalculator';
import { DirectFormulaStrategy } from '../../src/strategies/directFormulaStrategy';
import { TransformationStrategy } from '../../src/strategies/transformationStrategy';
import { CachedTransformationStrategy } from '../../src/strategies/cachedTransformationStrategy';
import { AdaptiveStrategySelector } from '../../src/strategies/adaptiveStrategySelector';
import { DisplayConfiguration, Point, PositionCalculationStrategy } from '../../src/core/types';
import { PerformanceBenchmark } from '../../src/utils/performanceBenchmark';

describe('BrowserPositionCalculator', () => {
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
  
  it('should calculate target position correctly with default strategy', () => {
    const calculator = new BrowserPositionCalculator();
    
    const targetPosition = calculator.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    // Expected result based on the formula: ((x_{s1}·α_x - b_{x2})/σ₂, (y_{s1}·α_y - b_{y2})/σ₂)
    // where α_x = 1920/2560 = 0.75, α_y = 1080/1440 = 0.75
    const expected = {
      x: (2065 * 0.75 - 75) / 1.5,
      y: (539 * 0.75 - 37.5) / 1.5
    };
    
    expect(targetPosition.x).toBeCloseTo(expected.x, 6);
    expect(targetPosition.y).toBeCloseTo(expected.y, 6);
  });
  
  it('should calculate source position correctly with default strategy', () => {
    const calculator = new BrowserPositionCalculator();
    
    // First, calculate target position
    const targetPosition = calculator.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    // Then, calculate source position from target position
    const calculatedSourcePoint = calculator.calculateSourcePosition(
      targetPosition,
      sourceConfig,
      targetConfig
    );
    
    // It should be the same as the original source point
    expect(calculatedSourcePoint.x).toBeCloseTo(sourcePoint.x, 6);
    expect(calculatedSourcePoint.y).toBeCloseTo(sourcePoint.y, 6);
  });
  
  it('should switch strategies correctly', () => {
    const calculator = new BrowserPositionCalculator();
    
    // Calculate with default strategy (TransformationStrategy)
    const result1 = calculator.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    // Switch to DirectFormulaStrategy
    calculator.setStrategy(new DirectFormulaStrategy());
    
    // Calculate again
    const result2 = calculator.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    // The results should be the same
    expect(result2.x).toBeCloseTo(result1.x, 6);
    expect(result2.y).toBeCloseTo(result1.y, 6);
    
    // Explicitly create a TransformationStrategy
    calculator.setStrategy(new TransformationStrategy());
    
    // Calculate again
    const result3 = calculator.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    // The results should still be the same
    expect(result3.x).toBeCloseTo(result1.x, 6);
    expect(result3.y).toBeCloseTo(result1.y, 6);
  });
  
  it('should calculate browser edges correctly', () => {
    const calculator = new BrowserPositionCalculator();
    
    const edges = calculator.calculateBrowserEdges(sourceConfig, targetConfig);
    
    // Expected values based on the formula:
    // Top edge: y = b_{y1}·α_y
    // Left edge: x = b_{x1}·α_x
    // Right edge: x = (b_{x1} + σ₁·v_{w1})·α_x
    // Bottom edge: y = (b_{y1} + σ₁·v_{h1})·α_y
    const expected = {
      top: 50 * 0.75,
      left: 100 * 0.75,
      right: (100 + 2 * 2000) * 0.75,
      bottom: (50 + 2 * 1000) * 0.75
    };
    
    expect(edges.top).toBeCloseTo(expected.top, 6);
    expect(edges.left).toBeCloseTo(expected.left, 6);
    expect(edges.right).toBeCloseTo(expected.right, 6);
    expect(edges.bottom).toBeCloseTo(expected.bottom, 6);
  });
  
  it('should check if a point is visible correctly', () => {
    const calculator = new BrowserPositionCalculator();
    
    // Point inside the browser window
    const insidePoint: Point = { x: 500, y: 300 };
    expect(calculator.isPointVisible(insidePoint, sourceConfig)).toBe(true);
    
    // Point outside the browser window (left)
    const outsideLeftPoint: Point = { x: 50, y: 300 };
    expect(calculator.isPointVisible(outsideLeftPoint, sourceConfig)).toBe(false);
    
    // Point outside the browser window (right)
    const outsideRightPoint: Point = { x: 4200, y: 300 };
    expect(calculator.isPointVisible(outsideRightPoint, sourceConfig)).toBe(false);
    
    // Point outside the browser window (top)
    const outsideTopPoint: Point = { x: 500, y: 30 };
    expect(calculator.isPointVisible(outsideTopPoint, sourceConfig)).toBe(false);
    
    // Point outside the browser window (bottom)
    const outsideBottomPoint: Point = { x: 500, y: 2100 };
    expect(calculator.isPointVisible(outsideBottomPoint, sourceConfig)).toBe(false);
    
    // Point at the edge (should be visible)
    const edgePoint: Point = { x: 100, y: 50 };
    expect(calculator.isPointVisible(edgePoint, sourceConfig)).toBe(true);
    
    // Point just outside the right edge (should not be visible)
    const justOutsidePoint: Point = { x: 100 + 2 * 2000, y: 300 };
    expect(calculator.isPointVisible(justOutsidePoint, sourceConfig)).toBe(false);
  });
  
  describe('Adaptive Strategy Selection', () => {
    it('should create calculator with adaptive strategy enabled', () => {
      const options: BrowserPositionCalculatorOptions = {
        useAdaptiveStrategy: true,
        adaptiveOptions: {
          enableAutoBenchmarking: true,
          benchmarkInterval: 5000,
          enableCaching: true
        }
      };
      
      const calculator = new BrowserPositionCalculator(options);
      
      // The strategy should be an AdaptiveStrategySelector
      const strategy = calculator.getStrategy();
      expect(strategy).toBeInstanceOf(AdaptiveStrategySelector);
    });
    
    it('should benchmark and select the most efficient strategy', () => {
      const options: BrowserPositionCalculatorOptions = {
        useAdaptiveStrategy: true
      };
      
      const calculator = new BrowserPositionCalculator(options);
      
      // Force benchmarking
      const efficientStrategy = calculator.getMostEfficientStrategy(
        sourceConfig,
        targetConfig
      );
      
      // The returned strategy should be the AdaptiveStrategySelector
      expect(efficientStrategy).toBeInstanceOf(AdaptiveStrategySelector);
      
      // The adaptive selector should have selected a strategy internally
      const adaptiveSelector = efficientStrategy as AdaptiveStrategySelector;
      const selectedStrategy = adaptiveSelector.getCurrentStrategyName(
        sourceConfig,
        targetConfig
      );
      
      // Should have selected one of the available strategies
      expect(selectedStrategy).toBeTruthy();
    });
    
    it('should produce mathematically correct results with adaptive strategy', () => {
      // Create a calculator with default strategy for comparison
      const defaultCalculator = new BrowserPositionCalculator();
      
      // Create a calculator with adaptive strategy
      const adaptiveCalculator = new BrowserPositionCalculator({
        useAdaptiveStrategy: true
      });
      
      // Calculate position with default strategy
      const defaultResult = defaultCalculator.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Calculate position with adaptive strategy
      const adaptiveResult = adaptiveCalculator.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Results should be the same (mathematically correct)
      expect(adaptiveResult.x).toBeCloseTo(defaultResult.x, 6);
      expect(adaptiveResult.y).toBeCloseTo(defaultResult.y, 6);
    });
    
    it('should handle custom strategies in adaptive selector', () => {
      // Create a mock strategy for testing
      const mockStrategy: PositionCalculationStrategy = {
        calculateTargetPosition: jest.fn().mockImplementation(
          (sourcePoint, sourceConfig, targetConfig) => {
            const defaultStrategy = new TransformationStrategy();
            return defaultStrategy.calculateTargetPosition(
              sourcePoint,
              sourceConfig,
              targetConfig
            );
          }
        ),
        calculateSourcePosition: jest.fn().mockImplementation(
          (targetPoint, sourceConfig, targetConfig) => {
            const defaultStrategy = new TransformationStrategy();
            return defaultStrategy.calculateSourcePosition(
              targetPoint,
              sourceConfig,
              targetConfig
            );
          }
        )
      };
      
      // Create a strategy map with the mock strategy
      const strategies = new Map<string, PositionCalculationStrategy>([
        ['mock', mockStrategy]
      ]);
      
      // Create an adaptive selector with the custom strategy
      const adaptiveSelector = new AdaptiveStrategySelector({
        availableStrategies: strategies
      });
      
      // Create a calculator with the adaptive selector
      const calculator = new BrowserPositionCalculator(adaptiveSelector);
      
      // Calculate a position
      const result = calculator.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // The result should be correct
      const expected = new TransformationStrategy().calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      expect(result.x).toBeCloseTo(expected.x, 6);
      expect(result.y).toBeCloseTo(expected.y, 6);
      
      // The mock strategy should have been called
      expect(mockStrategy.calculateTargetPosition).toHaveBeenCalled();
    });
  });
});