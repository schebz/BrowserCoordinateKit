/**
 * Tests for NormalizedToScreenTransformation
 * 
 * These tests validate that the transformation correctly converts normalized coordinates [0,1]
 * to screen coordinates, following the mathematical formula:
 * T_{N→S}(p_n) = (x_n·s_w, y_n·s_h)
 */

import { NormalizedToScreenTransformation } from '../../src/transformations/normalizedToScreen';
import { ScreenToNormalizedTransformation } from '../../src/transformations/screenToNormalized';

describe('NormalizedToScreenTransformation', () => {
  const screenDimensions = { width: 1920, height: 1080 };
  
  it('should transform normalized coordinates to screen coordinates', () => {
    const transformation = new NormalizedToScreenTransformation(screenDimensions);
    
    // Test cases
    const testCases = [
      { input: { x: 0, y: 0 }, expected: { x: 0, y: 0 } },             // Origin
      { input: { x: 1, y: 1 }, expected: { x: 1920, y: 1080 } },       // Bottom-right corner
      { input: { x: 0.5, y: 0.5 }, expected: { x: 960, y: 540 } },     // Center
      { input: { x: 0.25, y: 0.75 }, expected: { x: 480, y: 810 } },   // 25%, 75%
      { input: { x: 0.2, y: 0.25 }, expected: { x: 384, y: 270 } },    // 20%, 25%
    ];
    
    testCases.forEach(testCase => {
      const result = transformation.transform(testCase.input);
      expect(result.x).toBeCloseTo(testCase.expected.x, 6);
      expect(result.y).toBeCloseTo(testCase.expected.y, 6);
    });
  });

  it('should handle normalized values outside the [0,1] range', () => {
    const transformation = new NormalizedToScreenTransformation(screenDimensions);
    
    // Test with values > 1 (outside the normalized range)
    const largeValue = transformation.transform({ x: 1.5, y: 2 });
    expect(largeValue.x).toBeCloseTo(1920 * 1.5, 6);
    expect(largeValue.y).toBeCloseTo(1080 * 2, 6);
    
    // Test with negative values
    const negativeValue = transformation.transform({ x: -0.5, y: -0.25 });
    expect(negativeValue.x).toBeCloseTo(1920 * -0.5, 6);
    expect(negativeValue.y).toBeCloseTo(1080 * -0.25, 6);
  });
  
  it('should have an inverse transformation that is a ScreenToNormalizedTransformation', () => {
    const transformation = new NormalizedToScreenTransformation(screenDimensions);
    const inverse = transformation.getInverse();
    
    expect(inverse).toBeInstanceOf(ScreenToNormalizedTransformation);
  });
  
  it('should be reversible with its inverse transformation', () => {
    const transformation = new NormalizedToScreenTransformation(screenDimensions);
    const inverse = transformation.getInverse();
    
    // Test points
    const testPoints = [
      { x: 0, y: 0 },         // Origin
      { x: 1, y: 1 },         // Full normalized coordinates
      { x: 0.5, y: 0.5 },     // Center
      { x: 0.25, y: 0.75 },   // 25%, 75%
      { x: 0.2, y: 0.25 },    // 20%, 25%
    ];
    
    testPoints.forEach(point => {
      const screen = transformation.transform(point);
      const roundTrip = inverse.transform(screen);
      
      expect(roundTrip.x).toBeCloseTo(point.x, 6);
      expect(roundTrip.y).toBeCloseTo(point.y, 6);
    });
  });
  
  it('should validate the mathematical linearity property', () => {
    // A linear transformation T should satisfy: T(ax + by) = aT(x) + bT(y)
    const transformation = new NormalizedToScreenTransformation(screenDimensions);
    
    const pointA = { x: 0.3, y: 0.4 };
    const pointB = { x: 0.1, y: 0.2 };
    const a = 2;
    const b = 3;
    
    // Calculate T(ax + by)
    const combinedPoint = {
      x: a * pointA.x + b * pointB.x,
      y: a * pointA.y + b * pointB.y
    };
    const transformedCombined = transformation.transform(combinedPoint);
    
    // Calculate aT(x) + bT(y)
    const transformedA = transformation.transform(pointA);
    const transformedB = transformation.transform(pointB);
    const linearCombination = {
      x: a * transformedA.x + b * transformedB.x,
      y: a * transformedA.y + b * transformedB.y
    };
    
    // They should be equal for a linear transformation
    expect(transformedCombined.x).toBeCloseTo(linearCombination.x, 6);
    expect(transformedCombined.y).toBeCloseTo(linearCombination.y, 6);
  });
  
  // Mathematical axiom tests
  it('should satisfy the mathematical axioms for a linear transformation', () => {
    const transformation = new NormalizedToScreenTransformation(screenDimensions);
    
    // Test points
    const point1 = { x: 0.3, y: 0.4 };
    const point2 = { x: 0.1, y: 0.2 };
    
    // 1. T(x + y) = T(x) + T(y)
    const sumPoint = { x: point1.x + point2.x, y: point1.y + point2.y };
    const transformedSum = transformation.transform(sumPoint);
    
    const transformedPoint1 = transformation.transform(point1);
    const transformedPoint2 = transformation.transform(point2);
    const sumTransformed = { 
      x: transformedPoint1.x + transformedPoint2.x, 
      y: transformedPoint1.y + transformedPoint2.y 
    };
    
    expect(transformedSum.x).toBeCloseTo(sumTransformed.x, 6);
    expect(transformedSum.y).toBeCloseTo(sumTransformed.y, 6);
    
    // 2. T(αx) = αT(x)
    const alpha = 2.5;
    const scaledPoint = { x: alpha * point1.x, y: alpha * point1.y };
    const transformedScaled = transformation.transform(scaledPoint);
    
    const scaledTransformed = {
      x: alpha * transformedPoint1.x,
      y: alpha * transformedPoint1.y
    };
    
    expect(transformedScaled.x).toBeCloseTo(scaledTransformed.x, 6);
    expect(transformedScaled.y).toBeCloseTo(scaledTransformed.y, 6);
  });
  
  // Edge cases
  it('should handle zero dimensions correctly', () => {
    const zeroDimensions = { width: 0, height: 0 };
    const transformation = new NormalizedToScreenTransformation(zeroDimensions);
    
    const result = transformation.transform({ x: 0.5, y: 0.5 });
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });
  
  it('should handle extreme normalized values correctly', () => {
    const transformation = new NormalizedToScreenTransformation(screenDimensions);
    
    // Very small values
    const tinyValue = transformation.transform({ x: 1e-10, y: 1e-10 });
    expect(tinyValue.x).toBeCloseTo(1920 * 1e-10, 10);
    expect(tinyValue.y).toBeCloseTo(1080 * 1e-10, 10);
    
    // Very large values
    const hugeValue = transformation.transform({ x: 1e10, y: 1e10 });
    expect(hugeValue.x).toBeCloseTo(1920 * 1e10, -5); // Lower precision for large numbers
    expect(hugeValue.y).toBeCloseTo(1080 * 1e10, -5);
  });
});