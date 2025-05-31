/**
 * Tests for TransformationStrategy
 * 
 * These tests validate that the transformation strategy correctly calculates positions
 * using the transformation framework.
 */

import { TransformationStrategy } from '../../src/strategies/transformationStrategy';
import { DisplayConfiguration } from '../../src/core/types';
import { createCompleteTransformation } from '../../src/transformations/factory';

describe('TransformationStrategy', () => {
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
    const strategy = new TransformationStrategy();
    
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
    const strategy = new TransformationStrategy();
    
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
    const strategy = new TransformationStrategy();
    
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
  
  it('should use transformation objects from the factory', () => {
    const strategy = new TransformationStrategy();
    
    // Create a spy on createCompleteTransformation
    const createSpy = jest.spyOn(require('../../src/transformations/factory'), 'createCompleteTransformation');
    
    // Call the strategy method
    strategy.calculateTargetPosition(
      { x: 100, y: 100 },
      sourceConfig,
      targetConfig
    );
    
    // Verify the factory method was called with the correct arguments
    expect(createSpy).toHaveBeenCalledWith(sourceConfig, targetConfig);
    
    // Clean up
    createSpy.mockRestore();
  });
  
  it('should get inverse transformation from transformation object', () => {
    const strategy = new TransformationStrategy();
    
    // Mock the createCompleteTransformation function
    const mockTransformation = {
      transform: jest.fn(),
      getInverse: jest.fn().mockReturnValue({
        transform: jest.fn()
      })
    };
    
    const createSpy = jest.spyOn(require('../../src/transformations/factory'), 'createCompleteTransformation')
      .mockReturnValue(mockTransformation);
    
    // Call the strategy method
    strategy.calculateSourcePosition(
      { x: 100, y: 100 },
      sourceConfig,
      targetConfig
    );
    
    // Verify getInverse was called
    expect(mockTransformation.getInverse).toHaveBeenCalled();
    
    // Clean up
    createSpy.mockRestore();
  });
  
  it('should produce the same results as using transformations directly', () => {
    const strategy = new TransformationStrategy();
    
    // Test point
    const sourcePoint = { x: 2065, y: 539 };
    
    // Calculate using strategy
    const strategyResult = strategy.calculateTargetPosition(
      sourcePoint,
      sourceConfig,
      targetConfig
    );
    
    // Calculate using transformation directly
    const transformation = createCompleteTransformation(sourceConfig, targetConfig);
    const directResult = transformation.transform(sourcePoint);
    
    // Results should be identical
    expect(strategyResult.x).toBeCloseTo(directResult.x, 6);
    expect(strategyResult.y).toBeCloseTo(directResult.y, 6);
  });
});