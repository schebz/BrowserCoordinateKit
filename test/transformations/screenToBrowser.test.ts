/**
 * Tests for ScreenToBrowserTransformation
 * 
 * These tests validate that the transformation correctly converts screen coordinates
 * to browser coordinates, following the mathematical formula:
 * T_{S→B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)
 * 
 * This is an affine transformation characterized by a translation of -b
 */

import { ScreenToBrowserTransformation } from '../../src/transformations/screenToBrowser';
import { BrowserToScreenTransformation } from '../../src/transformations/browserToScreen';

describe('ScreenToBrowserTransformation', () => {
  const browserPosition = { x: 100, y: 50 };
  
  it('should transform screen coordinates to browser coordinates', () => {
    const transformation = new ScreenToBrowserTransformation(browserPosition);
    
    // Test cases
    const testCases = [
      { input: { x: 100, y: 50 }, expected: { x: 0, y: 0 } },           // Browser origin
      { input: { x: 200, y: 150 }, expected: { x: 100, y: 100 } },      // 100px from origin
      { input: { x: 150, y: 75 }, expected: { x: 50, y: 25 } },         // Middle point
      { input: { x: 0, y: 0 }, expected: { x: -100, y: -50 } },         // Screen origin (negative browser coords)
      { input: { x: 2100, y: 1050 }, expected: { x: 2000, y: 1000 } },  // Far point
    ];
    
    testCases.forEach(testCase => {
      const result = transformation.transform(testCase.input);
      expect(result.x).toBeCloseTo(testCase.expected.x, 6);
      expect(result.y).toBeCloseTo(testCase.expected.y, 6);
    });
  });
  
  it('should have an inverse transformation that is a BrowserToScreenTransformation', () => {
    const transformation = new ScreenToBrowserTransformation(browserPosition);
    const inverse = transformation.getInverse();
    
    expect(inverse).toBeInstanceOf(BrowserToScreenTransformation);
  });
  
  it('should be reversible with its inverse transformation', () => {
    const transformation = new ScreenToBrowserTransformation(browserPosition);
    const inverse = transformation.getInverse();
    
    // Test points
    const testPoints = [
      { x: 100, y: 50 },     // Browser origin
      { x: 200, y: 150 },    // 100px from origin
      { x: 0, y: 0 },        // Screen origin
      { x: 2100, y: 1050 },  // Far point
      { x: -50, y: -25 },    // Negative coordinates
    ];
    
    testPoints.forEach(point => {
      const browser = transformation.transform(point);
      const roundTrip = inverse.transform(browser);
      
      expect(roundTrip.x).toBeCloseTo(point.x, 6);
      expect(roundTrip.y).toBeCloseTo(point.y, 6);
    });
  });
  
  it('should satisfy the mathematical properties of an affine transformation', () => {
    const transformation = new ScreenToBrowserTransformation(browserPosition);
    
    // Test points
    const point1 = { x: 200, y: 150 };
    const point2 = { x: 300, y: 250 };
    
    // Property 1: T(x + y) - T(0) = T(x) - T(0) + T(y) - T(0)
    // For affine transformations with translation component
    const sumPoint = { x: point1.x + point2.x, y: point1.y + point2.y };
    const origin = { x: 0, y: 0 };
    
    const transformedSum = transformation.transform(sumPoint);
    const transformedOrigin = transformation.transform(origin);
    const transformedPoint1 = transformation.transform(point1);
    const transformedPoint2 = transformation.transform(point2);
    
    // T(x + y) - T(0)
    const leftSide = {
      x: transformedSum.x - transformedOrigin.x,
      y: transformedSum.y - transformedOrigin.y
    };
    
    // T(x) - T(0) + T(y) - T(0)
    const rightSide = {
      x: (transformedPoint1.x - transformedOrigin.x) + (transformedPoint2.x - transformedOrigin.x),
      y: (transformedPoint1.y - transformedOrigin.y) + (transformedPoint2.y - transformedOrigin.y)
    };
    
    expect(leftSide.x).toBeCloseTo(rightSide.x, 6);
    expect(leftSide.y).toBeCloseTo(rightSide.y, 6);
    
    // Property 2: For an affine transformation with only translation component,
    // the transformations of scaled vectors follow: T(αx) - T(0) = α(T(x) - T(0))
    const alpha = 2.5;
    const scaledPoint = { x: alpha * point1.x, y: alpha * point1.y };
    
    const transformedScaled = transformation.transform(scaledPoint);
    
    // T(αx) - T(0)
    const leftSideScaled = {
      x: transformedScaled.x - transformedOrigin.x,
      y: transformedScaled.y - transformedOrigin.y
    };
    
    // α(T(x) - T(0))
    const rightSideScaled = {
      x: alpha * (transformedPoint1.x - transformedOrigin.x),
      y: alpha * (transformedPoint1.y - transformedOrigin.y)
    };
    
    expect(leftSideScaled.x).toBeCloseTo(rightSideScaled.x, 6);
    expect(leftSideScaled.y).toBeCloseTo(rightSideScaled.y, 6);
  });
  
  // Edge cases
  it('should handle transformation with zero browser position', () => {
    const zeroBrowserPosition = { x: 0, y: 0 };
    const transformation = new ScreenToBrowserTransformation(zeroBrowserPosition);
    
    // When browser position is (0,0), screen and browser coordinates should be identical
    const point = { x: 500, y: 300 };
    const result = transformation.transform(point);
    expect(result.x).toBe(point.x);
    expect(result.y).toBe(point.y);
  });
  
  it('should handle extreme coordinates correctly', () => {
    const transformation = new ScreenToBrowserTransformation(browserPosition);
    
    // Very large coordinates
    const largePoint = { x: 1e10, y: 1e10 };
    const transformedLarge = transformation.transform(largePoint);
    expect(transformedLarge.x).toBeCloseTo(1e10 - browserPosition.x, -5);
    expect(transformedLarge.y).toBeCloseTo(1e10 - browserPosition.y, -5);
    
    // Very small coordinates
    const smallPoint = { x: 1e-10, y: 1e-10 };
    const transformedSmall = transformation.transform(smallPoint);
    expect(transformedSmall.x).toBeCloseTo(1e-10 - browserPosition.x, 10);
    expect(transformedSmall.y).toBeCloseTo(1e-10 - browserPosition.y, 10);
  });
  
  it('should demonstrate that the transformation is not strictly linear', () => {
    // A linear transformation T should satisfy: T(αx) = αT(x)
    // This will not hold for affine transformations with translation component
    
    const transformation = new ScreenToBrowserTransformation(browserPosition);
    
    const point = { x: 200, y: 150 };
    const alpha = 2;
    
    // Calculate T(αx)
    const scaledPoint = { x: alpha * point.x, y: alpha * point.y };
    const transformedScaled = transformation.transform(scaledPoint);
    
    // Calculate αT(x)
    const transformedPoint = transformation.transform(point);
    const scaledTransformed = {
      x: alpha * transformedPoint.x,
      y: alpha * transformedPoint.y
    };
    
    // They should NOT be equal for an affine transformation with translation
    expect(transformedScaled.x).not.toBeCloseTo(scaledTransformed.x, 6);
    expect(transformedScaled.y).not.toBeCloseTo(scaledTransformed.y, 6);
  });
});