/**
 * Tests for LogicalToBrowserTransformation
 * 
 * These tests validate that the transformation correctly converts logical coordinates
 * to browser coordinates (physical pixels), following the mathematical formula:
 * T_{L→B}(p_l) = p_l·σ = (x_l·σ, y_l·σ)
 * 
 * This is a linear transformation, specifically a uniform scaling by factor σ
 */

import { LogicalToBrowserTransformation } from '../../src/transformations/logicalToBrowser';
import { BrowserToLogicalTransformation } from '../../src/transformations/browserToLogical';

describe('LogicalToBrowserTransformation', () => {
  const dpiScaling = 2; // Common DPI scaling factor
  
  it('should transform logical coordinates to browser coordinates', () => {
    const transformation = new LogicalToBrowserTransformation(dpiScaling);
    
    // Test cases
    const testCases = [
      { input: { x: 0, y: 0 }, expected: { x: 0, y: 0 } },             // Origin
      { input: { x: 100, y: 50 }, expected: { x: 200, y: 100 } },      // Simple multiplication by 2
      { input: { x: 500, y: 300 }, expected: { x: 1000, y: 600 } },    // Larger numbers
      { input: { x: 12.5, y: 7.5 }, expected: { x: 25, y: 15 } },      // Fractional input
      { input: { x: -50, y: -100 }, expected: { x: -100, y: -200 } },  // Negative numbers
    ];
    
    testCases.forEach(testCase => {
      const result = transformation.transform(testCase.input);
      expect(result.x).toBeCloseTo(testCase.expected.x, 6);
      expect(result.y).toBeCloseTo(testCase.expected.y, 6);
    });
  });
  
  it('should have an inverse transformation that is a BrowserToLogicalTransformation', () => {
    const transformation = new LogicalToBrowserTransformation(dpiScaling);
    const inverse = transformation.getInverse();
    
    expect(inverse).toBeInstanceOf(BrowserToLogicalTransformation);
  });
  
  it('should be reversible with its inverse transformation', () => {
    const transformation = new LogicalToBrowserTransformation(dpiScaling);
    const inverse = transformation.getInverse();
    
    // Test points
    const testPoints = [
      { x: 0, y: 0 },            // Origin
      { x: 100, y: 50 },         // Simple case
      { x: 500, y: 300 },        // Larger numbers
      { x: 12.5, y: 7.5 },       // Fractional values
      { x: -50, y: -100 },       // Negative numbers
      { x: 0.5, y: 0.25 },       // Small values
    ];
    
    testPoints.forEach(point => {
      const browser = transformation.transform(point);
      const roundTrip = inverse.transform(browser);
      
      expect(roundTrip.x).toBeCloseTo(point.x, 6);
      expect(roundTrip.y).toBeCloseTo(point.y, 6);
    });
  });
  
  it('should validate the mathematical linearity property', () => {
    // A linear transformation T should satisfy: T(ax + by) = aT(x) + bT(y)
    const transformation = new LogicalToBrowserTransformation(dpiScaling);
    
    const pointA = { x: 30, y: 40 };
    const pointB = { x: 10, y: 20 };
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
    const transformation = new LogicalToBrowserTransformation(dpiScaling);
    
    // Test points
    const point1 = { x: 30, y: 40 };
    const point2 = { x: 10, y: 20 };
    
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
  it('should handle zero DPI scaling (though it should be rejected in practice)', () => {
    const zeroDpiScaling = 0;
    expect(() => {
      new LogicalToBrowserTransformation(zeroDpiScaling);
    }).toThrow();
  });
  
  it('should handle negative DPI scaling (though it should be rejected in practice)', () => {
    const negativeDpiScaling = -2;
    const transformation = new LogicalToBrowserTransformation(negativeDpiScaling);
    
    const point = { x: 100, y: 50 };
    const result = transformation.transform(point);
    
    expect(result.x).toBeCloseTo(-200, 6);
    expect(result.y).toBeCloseTo(-100, 6);
  });
  
  it('should handle very small DPI scaling without precision issues', () => {
    const smallDpiScaling = 0.01;
    const transformation = new LogicalToBrowserTransformation(smallDpiScaling);
    
    const point = { x: 200, y: 100 };
    const result = transformation.transform(point);
    
    expect(result.x).toBeCloseTo(2, 6);
    expect(result.y).toBeCloseTo(1, 6);
  });
  
  it('should handle very large and very small coordinates correctly', () => {
    const transformation = new LogicalToBrowserTransformation(dpiScaling);
    
    // Very large coordinates
    const largePoint = { x: 1e10, y: 1e10 };
    const transformedLarge = transformation.transform(largePoint);
    expect(transformedLarge.x).toBeCloseTo(1e10 * dpiScaling, -5);
    expect(transformedLarge.y).toBeCloseTo(1e10 * dpiScaling, -5);
    
    // Very small coordinates
    const smallPoint = { x: 1e-10, y: 1e-10 };
    const transformedSmall = transformation.transform(smallPoint);
    expect(transformedSmall.x).toBeCloseTo(1e-10 * dpiScaling, 15);
    expect(transformedSmall.y).toBeCloseTo(1e-10 * dpiScaling, 15);
  });
});