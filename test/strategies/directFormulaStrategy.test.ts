/**
 * Tests for DirectFormulaStrategy
 * 
 * These tests validate that the direct formula strategy correctly calculates positions
 * using mathematical formulas without creating transformation objects.
 */

import { DirectFormulaStrategy } from '../../src/strategies/directFormulaStrategy';
import { DisplayConfiguration } from '../../src/core/types';

describe('DirectFormulaStrategy', () => {
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
  
  it('should calculate target position correctly', () => {
    const strategy = new DirectFormulaStrategy();
    
    // Test point
    const sourcePoint = { x: 2065, y: 539 }; // Example from documentation
    
    // Expected result based on the formula:
    // p_{l2} = ((x_{s1}·α_x - b_{x2})/σ₂, (y_{s1}·α_y - b_{y2})/σ₂)
    
    // Calculate:
    // α_x = 1920/2560 = 0.75
    // α_y = 1080/1440 = 0.75
    // x = (2065 * 0.75 - 75) / 1.5 = (1548.75 - 75) / 1.5 = 982.5
    // y = (539 * 0.75 - 37.5) / 1.5 = (404.25 - 37.5) / 1.5 = 244.5
    const expectedResult = { x: 982.5, y: 244.5 };
    
    const result = strategy.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    expect(result.x).toBeCloseTo(expectedResult.x, 6);
    expect(result.y).toBeCloseTo(expectedResult.y, 6);
  });
  
  it('should calculate source position correctly', () => {
    const strategy = new DirectFormulaStrategy();
    
    // Test point in target logical coordinates
    const targetPoint = { x: 982.5, y: 244.5 };
    
    // Expected result based on the inverse formula:
    // p_{s1} = ((σ₂·x_{l2} + b_{x2})/α_x, (σ₂·y_{l2} + b_{y2})/α_y)
    
    // Calculate:
    // α_x = 1920/2560 = 0.75
    // α_y = 1080/1440 = 0.75
    // x = (1.5 * 982.5 + 75) / 0.75 = (1473.75 + 75) / 0.75 = 2065
    // y = (1.5 * 244.5 + 37.5) / 0.75 = (366.75 + 37.5) / 0.75 = 539
    const expectedResult = { x: 2065, y: 539 };
    
    const result = strategy.calculateSourcePosition(
      targetPoint,
      sourceConfig,
      targetConfig
    );
    
    expect(result.x).toBeCloseTo(expectedResult.x, 6);
    expect(result.y).toBeCloseTo(expectedResult.y, 6);
  });
  
  it('should handle round-trip conversions correctly', () => {
    const strategy = new DirectFormulaStrategy();
    
    // Test points
    const testPoints = [
      { x: 2065, y: 539 },     // Example from documentation
      { x: 0, y: 0 },          // Origin
      { x: 2560, y: 1440 },    // Screen edges
      { x: 100, y: 50 },       // Browser origin
      { x: 1280, y: 720 }      // Screen center
    ];
    
    testPoints.forEach(sourcePoint => {
      // Forward transformation
      const targetPoint = strategy.calculateTargetPosition(
        sourcePoint,
        sourceConfig,
        targetConfig
      );
      
      // Inverse transformation
      const roundTrip = strategy.calculateSourcePosition(
        targetPoint,
        sourceConfig,
        targetConfig
      );
      
      // Should get back the original point
      expect(roundTrip.x).toBeCloseTo(sourcePoint.x, 6);
      expect(roundTrip.y).toBeCloseTo(sourcePoint.y, 6);
    });
  });
  
  it('should handle same-configuration case as identity transformation', () => {
    const strategy = new DirectFormulaStrategy();
    
    // Using the same configuration for source and target
    // should give logical coordinates from screen coordinates
    const screenPoint = { x: 500, y: 250 };
    
    // Expected: (500 - 100) / 2 = 200, (250 - 50) / 2 = 100
    const expectedLogical = { x: 200, y: 100 };
    
    const result = strategy.calculateTargetPosition(
      screenPoint,
      sourceConfig,
      sourceConfig
    );
    
    expect(result.x).toBeCloseTo(expectedLogical.x, 6);
    expect(result.y).toBeCloseTo(expectedLogical.y, 6);
  });
  
  it('should handle unit scaling factors correctly', () => {
    const strategy = new DirectFormulaStrategy();
    
    // When creating a config where source and target have the same screen dimensions,
    // the scaling factors should be 1.0
    
    // First create a target config with the same screen dimensions as the source
    const sameScreenTargetConfig: DisplayConfiguration = {
      ...targetConfig,
      screenDimensions: { width: 2560, height: 1440 } // Same as sourceConfig
    };
    
    const sourcePoint = { x: 2065, y: 539 };
    
    // With the same screen dimensions, α_x and α_y = 1.0
    // So expected: (2065 * 1.0 - 75) / 1.5 = 1326.67, (539 * 1.0 - 37.5) / 1.5 = 334.33
    const expectedResult = { 
      x: (2065 * 1.0 - 75) / 1.5, 
      y: (539 * 1.0 - 37.5) / 1.5 
    };
    
    const result = strategy.calculateTargetPosition(
      sourcePoint,
      sourceConfig, // Using the original sourceConfig
      sameScreenTargetConfig // Using the target with same screen dimensions
    );
    
    expect(result.x).toBeCloseTo(expectedResult.x, 6);
    expect(result.y).toBeCloseTo(expectedResult.y, 6);
  });
  
  it('should handle negative coordinates correctly', () => {
    const strategy = new DirectFormulaStrategy();
    
    // Test with negative coordinates
    const negativePoint = { x: -200, y: -100 };
    
    // α_x = 1920/2560 = 0.75
    // α_y = 1080/1440 = 0.75
    // x = (-200 * 0.75 - 75) / 1.5 = (-150 - 75) / 1.5 = -150
    // y = (-100 * 0.75 - 37.5) / 1.5 = (-75 - 37.5) / 1.5 = -75
    const expectedResult = { x: -150, y: -75 };
    
    const result = strategy.calculateTargetPosition(
      negativePoint,
      sourceConfig,
      targetConfig
    );
    
    expect(result.x).toBeCloseTo(expectedResult.x, 6);
    expect(result.y).toBeCloseTo(expectedResult.y, 6);
  });
  
  it('should handle extreme coordinate values', () => {
    const strategy = new DirectFormulaStrategy();
    
    // Test with very large coordinates
    const largePoint = { x: 1e10, y: 1e10 };
    
    // α_x = 1920/2560 = 0.75
    // α_y = 1080/1440 = 0.75
    // x = (1e10 * 0.75 - 75) / 1.5 ≈ 5e9
    // y = (1e10 * 0.75 - 37.5) / 1.5 ≈ 5e9
    const expectedResult = { 
      x: (1e10 * 0.75 - 75) / 1.5, 
      y: (1e10 * 0.75 - 37.5) / 1.5 
    };
    
    const result = strategy.calculateTargetPosition(
      largePoint,
      sourceConfig,
      targetConfig
    );
    
    expect(result.x / 1e9).toBeCloseTo(expectedResult.x / 1e9, 6);
    expect(result.y / 1e9).toBeCloseTo(expectedResult.y / 1e9, 6);
  });
});