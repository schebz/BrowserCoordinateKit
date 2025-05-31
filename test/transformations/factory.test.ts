/**
 * Tests for transformation factory functions
 * 
 * These tests validate that the factory functions correctly create composite transformations
 * for common transformation scenarios.
 */

import {
  createScreenToScreenTransformation,
  createScreenToLogicalTransformation,
  createCompleteTransformation
} from '../../src/transformations/factory';
import { DisplayConfiguration } from '../../src/core/types';

describe('Transformation Factory Functions', () => {
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
  
  describe('createScreenToScreenTransformation', () => {
    it('should create a transformation that correctly converts between screen coordinates', () => {
      const transformation = createScreenToScreenTransformation(sourceConfig, targetConfig);
      
      // Test point
      const sourcePoint = { x: 1280, y: 720 }; // Middle of source screen
      
      // Expected result: Scaled proportionally to target screen
      // x = 1280 * (1920/2560) = 1280 * 0.75 = 960
      // y = 720 * (1080/1440) = 720 * 0.75 = 540
      const expectedResult = { x: 960, y: 540 };
      
      const result = transformation.transform(sourcePoint);
      
      expect(result.x).toBeCloseTo(expectedResult.x, 6);
      expect(result.y).toBeCloseTo(expectedResult.y, 6);
    });
    
    it('should create a reversible transformation', () => {
      const transformation = createScreenToScreenTransformation(sourceConfig, targetConfig);
      const inverse = transformation.getInverse();
      
      // Test point
      const sourcePoint = { x: 1280, y: 720 };
      
      // Transform and then inverse transform
      const transformed = transformation.transform(sourcePoint);
      const roundTrip = inverse.transform(transformed);
      
      expect(roundTrip.x).toBeCloseTo(sourcePoint.x, 6);
      expect(roundTrip.y).toBeCloseTo(sourcePoint.y, 6);
    });
    
    it('should handle identity transformation (same screen dimensions)', () => {
      const sameScreenConfig: DisplayConfiguration = {
        ...sourceConfig,
        screenDimensions: sourceConfig.screenDimensions
      };
      
      const transformation = createScreenToScreenTransformation(sourceConfig, sameScreenConfig);
      
      // Test point
      const sourcePoint = { x: 1280, y: 720 };
      
      // Expected result: Same coordinates (identity transformation)
      const result = transformation.transform(sourcePoint);
      
      expect(result.x).toBeCloseTo(sourcePoint.x, 6);
      expect(result.y).toBeCloseTo(sourcePoint.y, 6);
    });
  });
  
  describe('createScreenToLogicalTransformation', () => {
    it('should create a transformation that correctly converts screen to logical coordinates', () => {
      const transformation = createScreenToLogicalTransformation(sourceConfig);
      
      // Test point
      const screenPoint = { x: 500, y: 250 }; // In screen coordinates
      
      // Expected result:
      // x = (500 - 100) / 2 = 200
      // y = (250 - 50) / 2 = 100
      const expectedResult = { x: 200, y: 100 };
      
      const result = transformation.transform(screenPoint);
      
      expect(result.x).toBeCloseTo(expectedResult.x, 6);
      expect(result.y).toBeCloseTo(expectedResult.y, 6);
    });
    
    it('should create a reversible transformation', () => {
      const transformation = createScreenToLogicalTransformation(sourceConfig);
      const inverse = transformation.getInverse();
      
      // Test point
      const screenPoint = { x: 500, y: 250 };
      
      // Transform and then inverse transform
      const transformed = transformation.transform(screenPoint);
      const roundTrip = inverse.transform(transformed);
      
      expect(roundTrip.x).toBeCloseTo(screenPoint.x, 6);
      expect(roundTrip.y).toBeCloseTo(screenPoint.y, 6);
    });
  });
  
  describe('createCompleteTransformation', () => {
    it('should create a transformation that correctly converts between source screen and target logical', () => {
      const transformation = createCompleteTransformation(sourceConfig, targetConfig);
      
      // Test point
      const sourcePoint = { x: 2065, y: 539 }; // Example from documentation
      
      // Expected result based on the formula:
      // T_{S₁→L₂}(p_{s1}) = ((x_{s1}·α_x - b_{x2})/σ₂, (y_{s1}·α_y - b_{y2})/σ₂)
      
      // Calculate:
      // α_x = 1920/2560 = 0.75
      // α_y = 1080/1440 = 0.75
      // x = (2065 * 0.75 - 75) / 1.5 = (1548.75 - 75) / 1.5 = 982.5
      // y = (539 * 0.75 - 37.5) / 1.5 = (404.25 - 37.5) / 1.5 = 244.5
      const expectedResult = { x: 982.5, y: 244.5 };
      
      const result = transformation.transform(sourcePoint);
      
      expect(result.x).toBeCloseTo(expectedResult.x, 6);
      expect(result.y).toBeCloseTo(expectedResult.y, 6);
    });
    
    it('should create a reversible transformation', () => {
      const transformation = createCompleteTransformation(sourceConfig, targetConfig);
      const inverse = transformation.getInverse();
      
      // Test point
      const sourcePoint = { x: 2065, y: 539 };
      
      // Transform and then inverse transform
      const transformed = transformation.transform(sourcePoint);
      const roundTrip = inverse.transform(transformed);
      
      expect(roundTrip.x).toBeCloseTo(sourcePoint.x, 6);
      expect(roundTrip.y).toBeCloseTo(sourcePoint.y, 6);
    });
    
    it('should handle identity case (same configs)', () => {
      const transformation = createCompleteTransformation(sourceConfig, sourceConfig);
      
      // Test point - in screen coordinates
      const screenPoint = { x: 500, y: 250 };
      
      // Expected result - in logical coordinates
      // x = (500 - 100) / 2 = 200
      // y = (250 - 50) / 2 = 100
      const expectedResult = { x: 200, y: 100 };
      
      const result = transformation.transform(screenPoint);
      
      expect(result.x).toBeCloseTo(expectedResult.x, 6);
      expect(result.y).toBeCloseTo(expectedResult.y, 6);
    });
  });
});