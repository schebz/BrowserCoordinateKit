/**
 * Tests for CompositeTransformation
 * 
 * These tests validate that the composite transformation correctly combines multiple
 * transformations into a single transformation, following the mathematical formula:
 * (T₂ ∘ T₁)(p) = T₂(T₁(p))
 * 
 * We test it with compositions of the basic transformations we've already validated.
 */

import { CompositeTransformation } from '../../src/transformations/composite';
import { ScreenToNormalizedTransformation } from '../../src/transformations/screenToNormalized';
import { NormalizedToScreenTransformation } from '../../src/transformations/normalizedToScreen';
import { ScreenToBrowserTransformation } from '../../src/transformations/screenToBrowser';
import { BrowserToScreenTransformation } from '../../src/transformations/browserToScreen';
import { BrowserToLogicalTransformation } from '../../src/transformations/browserToLogical';
import { LogicalToBrowserTransformation } from '../../src/transformations/logicalToBrowser';

describe('CompositeTransformation', () => {
  // Test configuration
  const screenDimensions = { width: 1920, height: 1080 };
  const browserPosition = { x: 100, y: 50 };
  const dpiScaling = 2;
  
  it('should correctly compose two transformations', () => {
    // Create two transformations to compose
    const first = new ScreenToBrowserTransformation(browserPosition);
    const second = new BrowserToLogicalTransformation(dpiScaling);
    
    // Create the composite transformation
    const composite = new CompositeTransformation(first, second);
    
    // Test point
    const sourcePoint = { x: 500, y: 300 };
    
    // Result from applying transformations sequentially
    const intermediate = first.transform(sourcePoint);
    const expectedResult = second.transform(intermediate);
    
    // Result from composite transformation
    const actualResult = composite.transform(sourcePoint);
    
    // They should be the same
    expect(actualResult.x).toBeCloseTo(expectedResult.x, 6);
    expect(actualResult.y).toBeCloseTo(expectedResult.y, 6);
  });
  
  it('should combine more complex transformation chains', () => {
    // Create a chain: Screen → Normalized → Screen → Browser → Logical
    const s1ToN = new ScreenToNormalizedTransformation(screenDimensions);
    const nToS2 = new NormalizedToScreenTransformation(screenDimensions);
    const s2ToB = new ScreenToBrowserTransformation(browserPosition);
    const bToL = new BrowserToLogicalTransformation(dpiScaling);
    
    // Create composite transformations
    const comp1 = new CompositeTransformation(s1ToN, nToS2);  // Screen → Screen (identity)
    const comp2 = new CompositeTransformation(s2ToB, bToL);   // Screen → Logical
    const finalComp = new CompositeTransformation(comp1, comp2); // Chain them
    
    // Test point
    const sourcePoint = { x: 500, y: 300 };
    
    // Result from applying transformations sequentially
    const step1 = s1ToN.transform(sourcePoint);
    const step2 = nToS2.transform(step1);
    const step3 = s2ToB.transform(step2);
    const expectedResult = bToL.transform(step3);
    
    // Result from composite transformation
    const actualResult = finalComp.transform(sourcePoint);
    
    // They should be the same
    expect(actualResult.x).toBeCloseTo(expectedResult.x, 6);
    expect(actualResult.y).toBeCloseTo(expectedResult.y, 6);
  });
  
  it('should correctly handle inverse transformations', () => {
    // Create a composite transformation
    const s2b = new ScreenToBrowserTransformation(browserPosition);
    const b2l = new BrowserToLogicalTransformation(dpiScaling);
    const composite = new CompositeTransformation(s2b, b2l);
    
    // Get the inverse
    const inverse = composite.getInverse();
    
    // Test point
    const sourcePoint = { x: 500, y: 300 };
    
    // Apply the forward transformation
    const transformed = composite.transform(sourcePoint);
    
    // Apply the inverse transformation
    const roundTrip = inverse.transform(transformed);
    
    // We should get back to the original point
    expect(roundTrip.x).toBeCloseTo(sourcePoint.x, 6);
    expect(roundTrip.y).toBeCloseTo(sourcePoint.y, 6);
  });
  
  it('should correctly compose the inverse transformations in reverse order', () => {
    // Create a composite transformation
    const s2b = new ScreenToBrowserTransformation(browserPosition);
    const b2l = new BrowserToLogicalTransformation(dpiScaling);
    const composite = new CompositeTransformation(s2b, b2l);
    
    // Get the inverse transformations
    const b2sInverse = s2b.getInverse();
    const l2bInverse = b2l.getInverse();
    
    // Create a manually composed inverse (should be l2b then b2s)
    const manualInverse = new CompositeTransformation(l2bInverse, b2sInverse);
    
    // Get the automatically generated inverse
    const autoInverse = composite.getInverse();
    
    // Test on a point - both should give the same result
    const testPoint = { x: 200, y: 150 };
    
    const manualResult = manualInverse.transform(testPoint);
    const autoResult = autoInverse.transform(testPoint);
    
    expect(autoResult.x).toBeCloseTo(manualResult.x, 6);
    expect(autoResult.y).toBeCloseTo(manualResult.y, 6);
  });
  
  it('should preserve linearity if both component transformations are linear', () => {
    // Create two linear transformations
    const n2s = new NormalizedToScreenTransformation(screenDimensions);
    const l2b = new LogicalToBrowserTransformation(dpiScaling);
    
    // Compose them
    const composite = new CompositeTransformation(n2s, l2b);
    
    // Test points for linearity
    const pointA = { x: 0.3, y: 0.4 };
    const pointB = { x: 0.1, y: 0.2 };
    const a = 2;
    const b = 3;
    
    // Calculate T(ax + by)
    const combinedPoint = {
      x: a * pointA.x + b * pointB.x,
      y: a * pointA.y + b * pointB.y
    };
    const transformedCombined = composite.transform(combinedPoint);
    
    // Calculate aT(x) + bT(y)
    const transformedA = composite.transform(pointA);
    const transformedB = composite.transform(pointB);
    const linearCombination = {
      x: a * transformedA.x + b * transformedB.x,
      y: a * transformedA.y + b * transformedB.y
    };
    
    // They should be equal for a linear transformation
    expect(transformedCombined.x).toBeCloseTo(linearCombination.x, 6);
    expect(transformedCombined.y).toBeCloseTo(linearCombination.y, 6);
  });
  
  it('should not preserve linearity if any component is not linear', () => {
    // Create a linear and an affine transformation
    const n2s = new NormalizedToScreenTransformation(screenDimensions);
    const s2b = new ScreenToBrowserTransformation(browserPosition); // Affine, not linear
    
    // Compose them
    const composite = new CompositeTransformation(n2s, s2b);
    
    // Test points
    const pointA = { x: 0.3, y: 0.4 };
    const a = 2;
    
    // Calculate T(ax)
    const scaledPoint = { x: a * pointA.x, y: a * pointA.y };
    const transformedScaled = composite.transform(scaledPoint);
    
    // Calculate aT(x)
    const transformedPoint = composite.transform(pointA);
    const scaledTransformed = {
      x: a * transformedPoint.x,
      y: a * transformedPoint.y
    };
    
    // They should NOT be equal for a non-linear transformation
    // The difference should be the translation component
    expect(transformedScaled.x).not.toBeCloseTo(scaledTransformed.x, 6);
    expect(transformedScaled.y).not.toBeCloseTo(scaledTransformed.y, 6);
    
    // The difference should be exactly the translation factor
    expect(transformedScaled.x).toBeCloseTo(scaledTransformed.x - browserPosition.x * (1 - a), 6);
    expect(transformedScaled.y).toBeCloseTo(scaledTransformed.y - browserPosition.y * (1 - a), 6);
  });
});