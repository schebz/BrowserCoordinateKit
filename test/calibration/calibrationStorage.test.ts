/**
 * Tests for CalibrationStorage implementations
 * 
 * These tests cover all aspects of calibration storage including:
 * - Saving calibration data
 * - Loading calibration data
 * - Clearing calibration data
 * - Handling edge cases and errors
 * 
 * @version 1.1.0
 * @lastModified 2025-05-20
 */

import { 
  CalibrationStorageProvider, 
  LocalStorageCalibrationStorage,
  CalibrationUtility,
  CalibrationOptions
} from '../../src/calibration/calibrationUtility';

import {
  CalibrationStorage,
  CalibrationResult,
  CalibrationFactors,
  CalibrationType,
  CalibrationPointPair
} from '../../src/calibration/calibrationTypes';

import { BrowserDetector } from '../../src/detection/browserDetector';
import { BrowserInfo, DeviceInfo, BrowserType, DeviceType, OperatingSystem } from '../../src/detection/browserTypes';
import { DisplayConfiguration, Point } from '../../src/core/types';

// Mock browser detector
class MockBrowserDetector implements BrowserDetector {
  detectBrowser(): BrowserInfo {
    return {
      type: BrowserType.Chrome,
      version: { major: 100, minor: 0, patch: 0, full: '100.0.0.0' },
      userAgent: 'Mozilla/5.0 Chrome/100.0.0.0',
      engine: 'Blink',
      isHeadless: false
    };
  }
  
  detectDevice(): DeviceInfo {
    return {
      type: DeviceType.Desktop,
      os: {
        type: OperatingSystem.Windows,
        version: '10',
        isMobile: false,
        isTouchEnabled: false
      },
      hasTouch: false,
      hasPointer: true,
      pixelRatio: 1.0,
      orientation: 'landscape'
    };
  }
  
  detectDisplayConfiguration(): DisplayConfiguration {
    return {
      screenDimensions: { width: 1920, height: 1080 },
      viewportDimensions: { width: 1600, height: 900 },
      dpiScaling: 1.0,
      browserPosition: { x: 0, y: 0 }
    };
  }
  
  detectBrowserQuirks() {
    return {
      hasDpiScalingIssues: false,
      hasScrollRoundingIssues: false,
      hasIframeCoordinateIssues: false,
      hasWindowSizeIssues: false,
      hasBoundingRectIssues: false,
      hasTouchCoordinateIssues: false,
      hasTransformOriginIssues: false,
      supportsFractionalCoordinates: true
    };
  }
  
  detectFeatures() {
    return {
      supportsPassiveEvents: true,
      supportsPointerEvents: true,
      supportsTouchEvents: false,
      supportsIntersectionObserver: true,
      supportsResizeObserver: true,
      supportsModernDOM: true,
      supportsHighResTimestamps: true
    };
  }
  
  adjustPointForBrowser(point: Point) {
    return { ...point };
  }
  
  getDpiScalingCorrectionFactor() {
    return 1.0;
  }
  
  hasQuirk() {
    return false;
  }
  
  createAdjustedDisplayConfiguration(baseConfig: DisplayConfiguration) {
    return { ...baseConfig };
  }
  
  clearCache() {
    // Do nothing
  }
}

// Custom storage provider for testing
class InMemoryStorageProvider implements CalibrationStorageProvider {
  private storage: Record<string, any> = {};
  
  save(key: string, data: any): void {
    this.storage[key] = JSON.parse(JSON.stringify(data)); // Deep clone
  }
  
  load(key: string): any {
    return this.storage[key] || null;
  }
  
  clear(key: string): void {
    delete this.storage[key];
  }
  
  // Helper method for tests
  getAllKeys(): string[] {
    return Object.keys(this.storage);
  }
}

describe('CalibrationStorage', () => {
  // Test data
  const testPointPairs: CalibrationPointPair[] = [
    { expected: { x: 100, y: 100 }, actual: { x: 105, y: 95 } },
    { expected: { x: 500, y: 100 }, actual: { x: 510, y: 95 } },
    { expected: { x: 100, y: 500 }, actual: { x: 105, y: 510 } }
  ];
  
  describe('LocalStorageCalibrationStorage', () => {
    // Mock localStorage before tests
    const mockLocalStorage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        })
      };
    })();

    // Replace global localStorage with mock
    global.localStorage = mockLocalStorage as any;

    let storage: CalibrationStorageProvider;
    const storageKey = 'BrowserCoordinateKit_Calibration';

    beforeEach(() => {
      mockLocalStorage.clear();
      jest.clearAllMocks();
      storage = new LocalStorageCalibrationStorage();
    });

    it('should save calibration data to localStorage', () => {
      const data: CalibrationStorage = {
        calibrations: [
          {
            success: true,
            factors: {
              type: CalibrationType.Offset,
              offsetX: 10,
              offsetY: -5
            },
            timestamp: 1621234567890,
            pointCount: 3
          }
        ],
        lastCalibrationTime: 1621234567890,
        version: '1.0'
      };
      
      storage.save(storageKey, data);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(storageKey, expect.any(String));
      
      // Verify the data is correctly serialized
      const savedData = JSON.parse(mockLocalStorage.getItem(storageKey) as string);
      expect(savedData).toEqual(data);
    });
    
    it('should load calibration data from localStorage', () => {
      const data: CalibrationStorage = {
        calibrations: [
          {
            success: true,
            factors: {
              type: CalibrationType.Scale,
              scaleX: 1.1,
              scaleY: 0.9,
              offsetX: 5,
              offsetY: -5
            },
            averageError: 1.5,
            maxError: 2.0,
            timestamp: 1621234567890,
            pointCount: 3
          }
        ],
        lastCalibrationTime: 1621234567890,
        version: '1.0'
      };
      
      // Save data manually first
      mockLocalStorage.setItem(storageKey, JSON.stringify(data));
      
      // Now load it
      const loadedData = storage.load(storageKey) as CalibrationStorage;
      
      // Verify loaded data
      expect(loadedData).toBeDefined();
      expect(loadedData.calibrations.length).toBe(1);
      expect(loadedData.calibrations[0].factors?.type).toBe(CalibrationType.Scale);
      expect(loadedData.calibrations[0].factors?.scaleX).toBe(1.1);
      expect(loadedData.version).toBe('1.0');
    });
    
    it('should handle undefined localStorage gracefully', () => {
      // Save reference to original localStorage
      const originalLocalStorage = global.localStorage;
      
      // Delete localStorage to simulate environments without it
      delete (global as any).localStorage;
      
      // Create new storage provider instance
      const safeStorage = new LocalStorageCalibrationStorage();
      
      // All operations should not throw
      expect(() => {
        safeStorage.save(storageKey, { calibrations: [], lastCalibrationTime: 0, version: '1.0' });
        safeStorage.load(storageKey);
        safeStorage.clear(storageKey);
      }).not.toThrow();
      
      // Restore original localStorage
      global.localStorage = originalLocalStorage;
    });
    
    it('should clear calibration data from localStorage', () => {
      // Save data first
      const data: CalibrationStorage = {
        calibrations: [
          {
            success: true,
            factors: {
              type: CalibrationType.Offset,
              offsetX: 10,
              offsetY: -5
            },
            timestamp: 1621234567890,
            pointCount: 1
          }
        ],
        lastCalibrationTime: 1621234567890,
        version: '1.0'
      };
      
      storage.save(storageKey, data);
      
      // Clear the data
      storage.clear(storageKey);
      
      // Verify it's cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(storageKey);
      expect(storage.load(storageKey)).toBeNull();
    });
    
    it('should handle JSON parse errors during load', () => {
      // Save invalid JSON
      mockLocalStorage.setItem(storageKey, '{invalid-json}');
      
      // Load should not throw and return null
      expect(() => storage.load(storageKey)).not.toThrow();
      expect(storage.load(storageKey)).toBeNull();
    });
    
    it('should handle empty storage during load', () => {
      // Don't save anything
      
      // Load should return null
      expect(storage.load(storageKey)).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(storageKey);
    });
  });
  
  describe('CalibrationUtility with Storage', () => {
    let storage: InMemoryStorageProvider;
    let calibrationUtility: CalibrationUtility;
    const customStorageKey = 'custom_calibration_key';
    
    beforeEach(() => {
      storage = new InMemoryStorageProvider();
      
      // Create utility with our storage provider
      calibrationUtility = new CalibrationUtility({
        browserDetector: new MockBrowserDetector(),
        storageKey: customStorageKey,
        autoLoad: false,
        autoSave: false
      });
      
      // Replace the storage provider
      (calibrationUtility as any).storageProvider = storage;
    });
    
    it('should save calibration data after calibration with autoSave', () => {
      // Create utility with autoSave enabled
      const autoSaveUtility = new CalibrationUtility({
        browserDetector: new MockBrowserDetector(),
        storageKey: customStorageKey,
        autoLoad: false,
        autoSave: true
      });
      
      // Replace the storage provider
      (autoSaveUtility as any).storageProvider = storage;
      
      // Perform calibration
      const result = autoSaveUtility.calibrate(testPointPairs);
      
      // Check that data was saved
      const savedData = storage.load(customStorageKey);
      expect(savedData).toBeDefined();
      expect(savedData.calibrations).toContainEqual(expect.objectContaining({
        timestamp: result.timestamp
      }));
    });
    
    it('should load calibration data on initialization with autoLoad', () => {
      // Create initial calibration data
      const initialCalibration: CalibrationResult = {
        success: true,
        factors: {
          type: CalibrationType.Affine,
          affineMatrix: [
            [1.1, 0.1, 5],
            [0.1, 1.1, -5],
            [0, 0, 1]
          ]
        },
        averageError: 1.5,
        maxError: 2.0,
        timestamp: Date.now(),
        pointCount: 3
      };
      
      // Save it directly
      storage.save(customStorageKey, {
        calibrations: [initialCalibration],
        lastCalibrationTime: initialCalibration.timestamp,
        version: '1.0'
      });
      
      // Create new utility with custom storage provider set BEFORE initialization
      const storageForAutoLoad = new InMemoryStorageProvider();
      
      // Copy data to the new storage
      storageForAutoLoad.save(customStorageKey, storage.load(customStorageKey));
      
      // Create the utility with our pre-configured storage
      const autoLoadOptions: CalibrationOptions = {
        browserDetector: new MockBrowserDetector(),
        storageKey: customStorageKey,
        autoLoad: true,
        autoSave: false
      };
      
      // Create the utility and customize it before autoLoad happens
      const autoLoadUtility = new CalibrationUtility(autoLoadOptions);
      
      // Replace the storage provider and manually trigger load
      (autoLoadUtility as any).storageProvider = storageForAutoLoad;
      autoLoadUtility.loadCalibrationData();
      
      // Check that calibration was loaded
      expect(autoLoadUtility.isCalibrated()).toBe(true);
      expect(autoLoadUtility.getCurrentCalibration()).toEqual(expect.objectContaining({
        timestamp: initialCalibration.timestamp
      }));
    });
    
    it('should save multiple calibration results and load the latest', () => {
      // Perform first calibration
      const result1 = calibrationUtility.calibrate(testPointPairs);
      calibrationUtility.saveCalibrationData();
      
      // Create different points for second calibration
      const testPointPairs2 = testPointPairs.map(pair => ({
        expected: pair.expected,
        actual: { x: pair.actual.x + 5, y: pair.actual.y - 5 }
      }));
      
      // Perform second calibration with different results
      const result2 = calibrationUtility.calibrate(testPointPairs2);
      calibrationUtility.saveCalibrationData();
      
      // Check storage has both calibrations
      const savedData = storage.load(customStorageKey) as CalibrationStorage;
      expect(savedData.calibrations.length).toBe(2);
      
      // Create new utility to test loading
      const newUtility = new CalibrationUtility({
        browserDetector: new MockBrowserDetector(),
        storageKey: customStorageKey,
        autoLoad: false,
        autoSave: false
      });
      
      // Replace the storage provider
      (newUtility as any).storageProvider = storage;
      
      // Load data
      newUtility.loadCalibrationData();
      
      // Should have loaded both calibrations
      expect(newUtility.getCalibrationHistory().length).toBe(2);
      
      // Current calibration should be the most recent one
      const currentCalibration = newUtility.getCurrentCalibration();
      expect(currentCalibration?.timestamp).toBe(result2.timestamp);
    });
    
    it('should clear calibration data properly', () => {
      // Perform calibration and save
      calibrationUtility.calibrate(testPointPairs);
      calibrationUtility.saveCalibrationData();
      
      // Verify data exists
      expect(storage.load(customStorageKey)).not.toBeNull();
      
      // Clear data
      calibrationUtility.clearCalibrationData();
      
      // Verify it's cleared
      expect(storage.load(customStorageKey)).toBeNull();
      expect(calibrationUtility.isCalibrated()).toBe(false);
      expect(calibrationUtility.getCalibrationHistory()).toHaveLength(0);
    });
    
    it('should load the most recent successful calibration', () => {
      // Create three calibrations - first and third successful, second failed
      const successful1: CalibrationResult = {
        success: true,
        factors: { type: CalibrationType.Offset, offsetX: 5, offsetY: 5 },
        timestamp: Date.now() - 10000, // Oldest
        pointCount: 1
      };
      
      const failed: CalibrationResult = {
        success: false,
        errorMessage: 'Test failure',
        timestamp: Date.now() - 5000, // Middle
        pointCount: 1
      };
      
      const successful2: CalibrationResult = {
        success: true,
        factors: { type: CalibrationType.Scale, scaleX: 1.1, scaleY: 0.9 },
        timestamp: Date.now(), // Newest
        pointCount: 2
      };
      
      // Save directly
      storage.save(customStorageKey, {
        calibrations: [successful1, failed, successful2],
        lastCalibrationTime: successful2.timestamp,
        version: '1.0'
      });
      
      // Load data
      calibrationUtility.loadCalibrationData();
      
      // Should have loaded all calibrations
      expect(calibrationUtility.getCalibrationHistory().length).toBe(3);
      
      // Current calibration should be the most recent successful one
      const currentCalibration = calibrationUtility.getCurrentCalibration();
      expect(currentCalibration?.success).toBe(true);
      expect(currentCalibration?.factors?.type).toBe(CalibrationType.Scale);
      expect(currentCalibration?.timestamp).toBe(successful2.timestamp);
    });
    
    it('should provide identity calibration when no calibration exists', () => {
      // No calibration performed
      
      // Get current factors
      const factors = calibrationUtility.getCurrentCalibrationFactors();
      
      // Should provide identity matrix for affine transform
      expect(factors.type).toBe(CalibrationType.Affine);
      expect(factors.affineMatrix).toEqual([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]);
      
      // Apply to a point - should be unchanged
      const point = { x: 100, y: 200 };
      const calibrated = calibrationUtility.applyCalibration(point);
      expect(calibrated).toEqual(point);
    });
  });
});