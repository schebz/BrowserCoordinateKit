/**
 * Tests for ScreenToNormalizedTransformation
 */

import { ScreenToNormalizedTransformation } from '../../src/transformations/screenToNormalized';
import { NormalizedToScreenTransformation } from '../../src/transformations/normalizedToScreen';

describe('ScreenToNormalizedTransformation', () => {
  const screenDimensions = { width: 1920, height: 1080 };
  
  it('should transform screen coordinates to normalized coordinates', () => {
    const transformation = new ScreenToNormalizedTransformation(screenDimensions);
    
    // Test cases
    const testCases = [
      { input: { x: 0, y: 0 }, expected: { x: 0, y: 0 } },           // Origin
      { input: { x: 1920, y: 1080 }, expected: { x: 1, y: 1 } },     // Bottom-right corner
      { input: { x: 960, y: 540 }, expected: { x: 0.5, y: 0.5 } },   // Center
      { input: { x: 384, y: 270 }, expected: { x: 0.2, y: 0.25 } },  // 20%, 25%
    ];
    
    testCases.forEach(testCase => {
      const result = transformation.transform(testCase.input);
      expect(result.x).toBeCloseTo(testCase.expected.x, 6);
      expect(result.y).toBeCloseTo(testCase.expected.y, 6);
    });
  });
  
  it('should have an inverse transformation that is a NormalizedToScreenTransformation', () => {
    const transformation = new ScreenToNormalizedTransformation(screenDimensions);
    const inverse = transformation.getInverse();
    
    expect(inverse).toBeInstanceOf(NormalizedToScreenTransformation);
  });
  
  it('should be reversible with its inverse transformation', () => {
    const transformation = new ScreenToNormalizedTransformation(screenDimensions);
    const inverse = transformation.getInverse();
    
    // Test points
    const testPoints = [
      { x: 0, y: 0 },           // Origin
      { x: 1920, y: 1080 },     // Bottom-right corner
      { x: 960, y: 540 },       // Center
      { x: 384, y: 270 },       // 20%, 25%
      { x: 1536, y: 864 },      // 80%, 80%
    ];
    
    testPoints.forEach(point => {
      const normalized = transformation.transform(point);
      const roundTrip = inverse.transform(normalized);
      
      expect(roundTrip.x).toBeCloseTo(point.x, 6);
      expect(roundTrip.y).toBeCloseTo(point.y, 6);
    });
  });
  
  it('should handle zero dimensions gracefully', () => {
    const transformation = new ScreenToNormalizedTransformation({ width: 0, height: 0 });
    
    // Any division by zero should result in Infinity or NaN
    const result = transformation.transform({ x: 100, y: 100 });
    expect(result.x).toBe(Infinity);
    expect(result.y).toBe(Infinity);
  });
  
  it('should handle negative coordinates', () => {
    const transformation = new ScreenToNormalizedTransformation(screenDimensions);
    
    // Negative coordinates should result in negative normalized values
    const result = transformation.transform({ x: -192, y: -108 });
    expect(result.x).toBeCloseTo(-0.1, 6);
    expect(result.y).toBeCloseTo(-0.1, 6);
  });
});