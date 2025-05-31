/**
 * Tests for IFrameTransformation and nested iframe helper
 * 
 * These tests validate that the transformation correctly handles coordinates
 * in iframe contexts, following the mathematical formula:
 * T_{L→F}(p_l) = p_l - o_i = (x_l - o_{ix}, y_l - o_{iy})
 */

import { 
  IFrameTransformation, 
  createNestedIFrameTransformation 
} from '../../src/transformations/iframe';

describe('IFrameTransformation', () => {
  const iframeOffset = { x: 50, y: 100 };
  
  it('should transform logical coordinates to iframe coordinates', () => {
    const transformation = new IFrameTransformation(iframeOffset);
    
    // Test cases
    const testCases = [
      { input: { x: 50, y: 100 }, expected: { x: 0, y: 0 } },           // Iframe origin
      { input: { x: 150, y: 200 }, expected: { x: 100, y: 100 } },      // 100px from origin
      { input: { x: 75, y: 125 }, expected: { x: 25, y: 25 } },         // 25px offset
      { input: { x: 0, y: 0 }, expected: { x: -50, y: -100 } },         // Logical origin (negative iframe coords)
      { input: { x: 250, y: 300 }, expected: { x: 200, y: 200 } },      // Far point
    ];
    
    testCases.forEach(testCase => {
      const result = transformation.transform(testCase.input);
      expect(result.x).toBeCloseTo(testCase.expected.x, 6);
      expect(result.y).toBeCloseTo(testCase.expected.y, 6);
    });
  });
  
  it('should have an inverse transformation', () => {
    const transformation = new IFrameTransformation(iframeOffset);
    const inverse = transformation.getInverse();
    
    // Test the inverse function
    const iframePoint = { x: 100, y: 100 };
    const logicalPoint = inverse.transform(iframePoint);
    
    expect(logicalPoint.x).toBeCloseTo(iframePoint.x + iframeOffset.x, 6);
    expect(logicalPoint.y).toBeCloseTo(iframePoint.y + iframeOffset.y, 6);
  });
  
  it('should be reversible with its inverse transformation', () => {
    const transformation = new IFrameTransformation(iframeOffset);
    const inverse = transformation.getInverse();
    
    // Test points
    const testPoints = [
      { x: 0, y: 0 },        // Iframe origin
      { x: 100, y: 100 },    // 100px from origin
      { x: -50, y: -100 },   // Negative coordinates
      { x: 200, y: 200 },    // Far point
    ];
    
    testPoints.forEach(point => {
      const logical = inverse.transform(point);
      const roundTrip = transformation.transform(logical);
      
      expect(roundTrip.x).toBeCloseTo(point.x, 6);
      expect(roundTrip.y).toBeCloseTo(point.y, 6);
    });
  });
  
  it('should satisfy the mathematical properties of an affine transformation', () => {
    const transformation = new IFrameTransformation(iframeOffset);
    
    // Test points
    const point1 = { x: 150, y: 200 };
    const point2 = { x: 250, y: 300 };
    
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
  });
});

describe('createNestedIFrameTransformation', () => {
  it('should create an identity transformation with empty offsets', () => {
    const nestedTransform = createNestedIFrameTransformation([]);
    
    const point = { x: 100, y: 200 };
    const result = nestedTransform.transform(point);
    
    // Should be unchanged
    expect(result.x).toBeCloseTo(point.x, 6);
    expect(result.y).toBeCloseTo(point.y, 6);
  });
  
  it('should correctly apply a single iframe offset', () => {
    const offset = { x: 50, y: 100 };
    const nestedTransform = createNestedIFrameTransformation([offset]);
    
    // This should behave the same as a regular IFrameTransformation
    const singleTransform = new IFrameTransformation(offset);
    
    const point = { x: 150, y: 250 };
    const nestedResult = nestedTransform.transform(point);
    const singleResult = singleTransform.transform(point);
    
    expect(nestedResult.x).toBeCloseTo(singleResult.x, 6);
    expect(nestedResult.y).toBeCloseTo(singleResult.y, 6);
  });
  
  it('should correctly apply multiple iframe offsets', () => {
    const offsets = [
      { x: 50, y: 100 },  // First iframe offset
      { x: 20, y: 30 },   // Second iframe (nested) offset
      { x: 10, y: 15 }    // Third iframe (doubly nested) offset
    ];
    
    const nestedTransform = createNestedIFrameTransformation(offsets);
    
    // Point in logical coordinates
    const logicalPoint = { x: 200, y: 300 };
    
    // Expected result after applying all offsets:
    // x = 200 - 50 - 20 - 10 = 120
    // y = 300 - 100 - 30 - 15 = 155
    const expectedResult = { x: 120, y: 155 };
    
    const result = nestedTransform.transform(logicalPoint);
    
    expect(result.x).toBeCloseTo(expectedResult.x, 6);
    expect(result.y).toBeCloseTo(expectedResult.y, 6);
  });
  
  it('should be reversible for nested iframes', () => {
    const offsets = [
      { x: 50, y: 100 },
      { x: 20, y: 30 },
      { x: 10, y: 15 }
    ];
    
    const nestedTransform = createNestedIFrameTransformation(offsets);
    const inverse = nestedTransform.getInverse();
    
    // Point in the innermost iframe
    const innerPoint = { x: 75, y: 125 };
    
    // Transform to logical coordinates and back
    const logicalPoint = inverse.transform(innerPoint);
    const roundTrip = nestedTransform.transform(logicalPoint);
    
    expect(roundTrip.x).toBeCloseTo(innerPoint.x, 6);
    expect(roundTrip.y).toBeCloseTo(innerPoint.y, 6);
  });
  
  it('should handle extreme coordinates correctly', () => {
    const offsets = [
      { x: 50, y: 100 },
      { x: 20, y: 30 }
    ];
    
    const nestedTransform = createNestedIFrameTransformation(offsets);
    
    // Very large coordinates
    const largePoint = { x: 1e10, y: 1e10 };
    const transformedLarge = nestedTransform.transform(largePoint);
    expect(transformedLarge.x).toBeCloseTo(1e10 - 50 - 20, -5);
    expect(transformedLarge.y).toBeCloseTo(1e10 - 100 - 30, -5);
    
    // Very small coordinates
    const smallPoint = { x: 1e-10, y: 1e-10 };
    const transformedSmall = nestedTransform.transform(smallPoint);
    expect(transformedSmall.x).toBeCloseTo(1e-10 - 50 - 20, 6);
    expect(transformedSmall.y).toBeCloseTo(1e-10 - 100 - 30, 6);
  });
});