/**
 * Tests for BrowserToLogicalTransformation
 * 
 * These tests validate that the transformation correctly converts browser coordinates
 * (physical pixels) to logical coordinates, following the mathematical formula:
 * T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)
 * 
 * This is a linear transformation, specifically a uniform scaling by factor 1/σ
 */

import { BrowserToLogicalTransformation } from '../../src/transformations/browserToLogical';
import { LogicalToBrowserTransformation } from '../../src/transformations/logicalToBrowser';

describe('BrowserToLogicalTransformation', () => {
  const dpiScaling = 2; // Common DPI scaling factor
  
  it('should transform browser coordinates to logical coordinates', () => {
    const transformation = new BrowserToLogicalTransformation(dpiScaling);
    
    // Test cases
    const testCases = [
      { input: { x: 0, y: 0 }, expected: { x: 0, y: 0 } },             // Origin
      { input: { x: 200, y: 100 }, expected: { x: 100, y: 50 } },      // Simple division by 2
      { input: { x: 1000, y: 600 }, expected: { x: 500, y: 300 } },    // Larger numbers
      { input: { x: 25, y: 15 }, expected: { x: 12.5, y: 7.5 } },      // Fractional result
      { input: { x: -100, y: -200 }, expected: { x: -50, y: -100 } },  // Negative numbers
    ];
    
    testCases.forEach(testCase => {
      const result = transformation.transform(testCase.input);
      expect(result.x).toBeCloseTo(testCase.expected.x, 6);
      expect(result.y).toBeCloseTo(testCase.expected.y, 6);
    });
  });
  
  it('should have an inverse transformation that is a LogicalToBrowserTransformation', () => {
    const transformation = new BrowserToLogicalTransformation(dpiScaling);
    const inverse = transformation.getInverse();
    
    expect(inverse).toBeInstanceOf(LogicalToBrowserTransformation);
  });
  
  it('should be reversible with its inverse transformation', () => {
    const transformation = new BrowserToLogicalTransformation(dpiScaling);
    const inverse = transformation.getInverse();
    
    // Test points
    const testPoints = [
      { x: 0, y: 0 },            // Origin
      { x: 200, y: 100 },        // Simple case
      { x: 1000, y: 600 },       // Larger numbers
      { x: 25, y: 15 },          // Fractional result
      { x: -100, y: -200 },      // Negative numbers
      { x: 0.5, y: 0.5 },        // Small fractional numbers
    ];
    
    testPoints.forEach(point => {
      const logical = transformation.transform(point);
      const roundTrip = inverse.transform(logical);
      
      expect(roundTrip.x).toBeCloseTo(point.x, 6);
      expect(roundTrip.y).toBeCloseTo(point.y, 6);
    });
  });
  
  it('should validate the mathematical linearity property', () => {
    // A linear transformation T should satisfy: T(ax + by) = aT(x) + bT(y)
    const transformation = new BrowserToLogicalTransformation(dpiScaling);
    
    const pointA = { x: 300, y: 400 };
    const pointB = { x: 100, y: 200 };
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
    const transformation = new BrowserToLogicalTransformation(dpiScaling);
    
    // Test points
    const point1 = { x: 300, y: 400 };
    const point2 = { x: 100, y: 200 };
    
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
  it('should throw error for zero DPI scaling', () => {
    expect(() => {
      new BrowserToLogicalTransformation(0);
    }).toThrow();
  });
  
  it('should handle negative DPI scaling (though it should be rejected in practice)', () => {
    const negativeDpiScaling = -2;
    const transformation = new BrowserToLogicalTransformation(negativeDpiScaling);
    
    const point = { x: 200, y: 100 };
    const result = transformation.transform(point);
    
    // Should scale by 1/(-2) = -0.5
    expect(result.x).toBeCloseTo(-100, 6);
    expect(result.y).toBeCloseTo(-50, 6);
  });
  
  it('should handle very small DPI scaling without precision issues', () => {
    const smallDpiScaling = 0.01;
    const transformation = new BrowserToLogicalTransformation(smallDpiScaling);
    
    const point = { x: 2, y: 1 };
    const result = transformation.transform(point);
    
    expect(result.x).toBeCloseTo(200, 6);
    expect(result.y).toBeCloseTo(100, 6);
  });
  
  it('should handle very large coordinates correctly', () => {
    const transformation = new BrowserToLogicalTransformation(dpiScaling);
    
    // Very large coordinates
    const largePoint = { x: 1e10, y: 1e10 };
    const transformedLarge = transformation.transform(largePoint);
    expect(transformedLarge.x).toBeCloseTo(1e10 / dpiScaling, -5);
    expect(transformedLarge.y).toBeCloseTo(1e10 / dpiScaling, -5);
    
    // Very small coordinates
    const smallPoint = { x: 1e-10, y: 1e-10 };
    const transformedSmall = transformation.transform(smallPoint);
    expect(transformedSmall.x).toBeCloseTo(1e-10 / dpiScaling, 15);
    expect(transformedSmall.y).toBeCloseTo(1e-10 / dpiScaling, 15);
  });
});