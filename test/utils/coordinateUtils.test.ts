/**
 * Tests for CoordinateUtils
 * 
 * These tests validate the utility functions for working with coordinates.
 */

import { CoordinateUtils } from '../../src/utils/coordinateUtils';
import { DisplayConfiguration } from '../../src/core/types';

describe('CoordinateUtils', () => {
  // Test parameters
  const screenDimensions = { width: 1920, height: 1080 };
  const browserPosition = { x: 100, y: 50 };
  const viewportDimensions = { width: 1600, height: 900 };
  const dpiScaling = 2;
  
  describe('calculateBrowserPosition', () => {
    it('should correctly calculate browser position from mouse positions', () => {
      // Given mouse positions in screen and logical coordinates
      const mouseScreenPos = { x: 500, y: 300 };
      const mouseLogicalPos = { x: 200, y: 125 };
      
      // Expected browser position:
      // b = m_s - σ·m_l
      // x = 500 - 2 * 200 = 100
      // y = 300 - 2 * 125 = 50
      const expectedPosition = { x: 100, y: 50 };
      
      const result = CoordinateUtils.calculateBrowserPosition(
        mouseScreenPos,
        mouseLogicalPos,
        dpiScaling
      );
      
      expect(result.x).toBeCloseTo(expectedPosition.x, 6);
      expect(result.y).toBeCloseTo(expectedPosition.y, 6);
    });
    
    it('should handle zero DPI scaling correctly', () => {
      // Zero DPI scaling is an edge case, but should not throw
      const mouseScreenPos = { x: 500, y: 300 };
      const mouseLogicalPos = { x: 200, y: 125 };
      
      const result = CoordinateUtils.calculateBrowserPosition(
        mouseScreenPos,
        mouseLogicalPos,
        0
      );
      
      // With 0 DPI scaling, coordinates are just mouseScreenPos
      expect(result.x).toBeCloseTo(mouseScreenPos.x, 6);
      expect(result.y).toBeCloseTo(mouseScreenPos.y, 6);
    });
    
    it('should handle negative DPI scaling correctly', () => {
      // Negative DPI scaling is unlikely in practice but should work mathematically
      const mouseScreenPos = { x: 500, y: 300 };
      const mouseLogicalPos = { x: 200, y: 125 };
      const negativeDpiScaling = -2;
      
      // Expected:
      // x = 500 - (-2) * 200 = 500 + 400 = 900
      // y = 300 - (-2) * 125 = 300 + 250 = 550
      const expectedPosition = { x: 900, y: 550 };
      
      const result = CoordinateUtils.calculateBrowserPosition(
        mouseScreenPos,
        mouseLogicalPos,
        negativeDpiScaling
      );
      
      expect(result.x).toBeCloseTo(expectedPosition.x, 6);
      expect(result.y).toBeCloseTo(expectedPosition.y, 6);
    });
  });
  
  describe('calculateDpiScaling', () => {
    it('should correctly calculate DPI scaling from known positions', () => {
      // Browser and logical positions with known 2x scaling
      const browserPos = { x: 400, y: 200 };
      const logicalPos = { x: 200, y: 100 };
      
      // Expected: (400/200 + 200/100) / 2 = (2 + 2) / 2 = 2
      const expectedScaling = 2;
      
      const result = CoordinateUtils.calculateDpiScaling(browserPos, logicalPos);
      
      expect(result).toBeCloseTo(expectedScaling, 6);
    });
    
    it('should handle zero coordinates safely', () => {
      // Zero coordinates in logical position would cause division by zero
      const browserPos = { x: 400, y: 200 };
      const logicalPos = { x: 0, y: 0 };
      
      // This should throw or return Infinity/NaN
      expect(() => {
        CoordinateUtils.calculateDpiScaling(browserPos, logicalPos);
      }).toThrow();
    });
    
    it('should handle non-uniform scaling correctly', () => {
      // Different scaling in x and y directions
      const browserPos = { x: 400, y: 300 };
      const logicalPos = { x: 200, y: 100 };
      
      // Expected: (400/200 + 300/100) / 2 = (2 + 3) / 2 = 2.5
      const expectedScaling = 2.5;
      
      const result = CoordinateUtils.calculateDpiScaling(browserPos, logicalPos);
      
      expect(result).toBeCloseTo(expectedScaling, 6);
    });
  });
  
  describe('createDisplayConfig', () => {
    it('should create a valid display configuration', () => {
      const config = CoordinateUtils.createDisplayConfig(
        1920, 1080,
        100, 50,
        1600, 900,
        2
      );
      
      const expectedConfig: DisplayConfiguration = {
        screenDimensions: { width: 1920, height: 1080 },
        browserPosition: { x: 100, y: 50 },
        viewportDimensions: { width: 1600, height: 900 },
        dpiScaling: 2
      };
      
      expect(config).toEqual(expectedConfig);
    });
    
    it('should accept zero and negative values', () => {
      // Zero and negative values are allowed in the config creation
      // (validation happens elsewhere)
      const config = CoordinateUtils.createDisplayConfig(
        1920, 1080,
        0, 0,
        0, 0,
        0
      );
      
      const expectedConfig: DisplayConfiguration = {
        screenDimensions: { width: 1920, height: 1080 },
        browserPosition: { x: 0, y: 0 },
        viewportDimensions: { width: 0, height: 0 },
        dpiScaling: 0
      };
      
      expect(config).toEqual(expectedConfig);
    });
  });
  
  describe('calculateScalingFactors', () => {
    it('should calculate correct scaling factors between screen sizes', () => {
      const sourceWidth = 2560;
      const sourceHeight = 1440;
      const targetWidth = 1920;
      const targetHeight = 1080;
      
      // Expected:
      // x = 1920/2560 = 0.75
      // y = 1080/1440 = 0.75
      const expectedScaling = { x: 0.75, y: 0.75 };
      
      const result = CoordinateUtils.calculateScalingFactors(
        sourceWidth,
        sourceHeight,
        targetWidth,
        targetHeight
      );
      
      expect(result.x).toBeCloseTo(expectedScaling.x, 6);
      expect(result.y).toBeCloseTo(expectedScaling.y, 6);
    });
    
    it('should handle zero dimensions correctly', () => {
      const sourceWidth = 2560;
      const sourceHeight = 1440;
      const targetWidth = 0;
      const targetHeight = 0;
      
      const result = CoordinateUtils.calculateScalingFactors(
        sourceWidth,
        sourceHeight,
        targetWidth,
        targetHeight
      );
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
    
    it('should handle zero source dimensions safely', () => {
      const sourceWidth = 0;
      const sourceHeight = 0;
      const targetWidth = 1920;
      const targetHeight = 1080;
      
      // This should throw or return Infinity
      expect(() => {
        CoordinateUtils.calculateScalingFactors(
          sourceWidth,
          sourceHeight,
          targetWidth,
          targetHeight
        );
      }).toThrow();
    });
    
    it('should handle larger-to-smaller and smaller-to-larger scaling', () => {
      // Larger to smaller
      const largerToSmaller = CoordinateUtils.calculateScalingFactors(
        2560, 1440,
        1920, 1080
      );
      
      expect(largerToSmaller.x).toBeCloseTo(0.75, 6);
      expect(largerToSmaller.y).toBeCloseTo(0.75, 6);
      
      // Smaller to larger
      const smallerToLarger = CoordinateUtils.calculateScalingFactors(
        1920, 1080,
        2560, 1440
      );
      
      expect(smallerToLarger.x).toBeCloseTo(1.33333, 5);
      expect(smallerToLarger.y).toBeCloseTo(1.33333, 5);
    });
  });
});