/**
 * Tests for BrowserDetector
 */

import { BrowserDetector } from '../../src/detection/browserDetector';
import { DefaultBrowserDetector } from '../../src/detection/defaultBrowserDetector';
import {
  BrowserType,
  DeviceType,
  OperatingSystem,
  DetectionContext
} from '../../src/detection/browserTypes';

describe('BrowserDetector', () => {
  // Mock detection contexts
  const chromeWindowsContext: DetectionContext = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    window: {
      innerWidth: 1920,
      innerHeight: 1080,
      devicePixelRatio: 1.5,
      navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        platform: 'Win32',
        maxTouchPoints: 0
      },
      screen: {
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040
      }
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 0
    },
    screen: {
      width: 1920,
      height: 1080,
      availWidth: 1920,
      availHeight: 1040
    },
    isBrowser: true,
    isNode: false,
    isPlaywright: false,
    isPuppeteer: false,
    isTestEnvironment: true
  };
  
  const safariiOSContext: DetectionContext = {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    window: {
      innerWidth: 390,
      innerHeight: 844,
      devicePixelRatio: 3,
      navigator: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        maxTouchPoints: 5
      },
      screen: {
        width: 390,
        height: 844,
        availWidth: 390,
        availHeight: 844
      }
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      platform: 'iPhone',
      maxTouchPoints: 5
    },
    screen: {
      width: 390,
      height: 844,
      availWidth: 390,
      availHeight: 844
    },
    isBrowser: true,
    isNode: false,
    isPlaywright: false,
    isPuppeteer: false,
    isTestEnvironment: true
  };
  
  const firefoxLinuxContext: DetectionContext = {
    userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
    window: {
      innerWidth: 1680,
      innerHeight: 950,
      devicePixelRatio: 1,
      navigator: {
        userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
        platform: 'Linux x86_64',
        maxTouchPoints: 0
      },
      screen: {
        width: 1680,
        height: 1050,
        availWidth: 1680,
        availHeight: 1020
      }
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0',
      platform: 'Linux x86_64',
      maxTouchPoints: 0
    },
    screen: {
      width: 1680,
      height: 1050,
      availWidth: 1680,
      availHeight: 1020
    },
    isBrowser: true,
    isNode: false,
    isPlaywright: false,
    isPuppeteer: false,
    isTestEnvironment: true
  };
  
  const playwrightChromiumContext: DetectionContext = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    window: {
      innerWidth: 1280,
      innerHeight: 720,
      devicePixelRatio: 1,
      navigator: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        platform: 'Win32',
        maxTouchPoints: 0
      },
      screen: {
        width: 1280,
        height: 720,
        availWidth: 1280,
        availHeight: 720
      }
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      platform: 'Win32',
      maxTouchPoints: 0
    },
    screen: {
      width: 1280,
      height: 720,
      availWidth: 1280,
      availHeight: 720
    },
    isBrowser: true,
    isNode: false,
    isPlaywright: true,
    isPuppeteer: false,
    isTestEnvironment: true
  };
  
  describe('Browser Detection', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      // Create a new detector for each test to avoid caching
      detector = new DefaultBrowserDetector();
    });
    
    it('should detect Chrome on Windows correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      expect(browserInfo.type).toBe(BrowserType.Chrome);
      expect(browserInfo.version.major).toBe(91);
      expect(browserInfo.version.minor).toBe(0);
      expect(browserInfo.version.patch).toBe(4472);
      expect(browserInfo.isHeadless).toBe(false);
    });
    
    it('should detect Safari on iOS correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: safariiOSContext
      });
      
      expect(browserInfo.type).toBe(BrowserType.Safari);
      expect(browserInfo.version.major).toBe(14);
      expect(browserInfo.version.minor).toBe(0);
      expect(browserInfo.isHeadless).toBe(false);
    });
    
    it('should detect Firefox on Linux correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: firefoxLinuxContext
      });
      
      expect(browserInfo.type).toBe(BrowserType.Firefox);
      expect(browserInfo.version.major).toBe(89);
      expect(browserInfo.version.minor).toBe(0);
      expect(browserInfo.isHeadless).toBe(false);
    });
    
    it('should detect Playwright Chromium correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: playwrightChromiumContext
      });
      
      expect(browserInfo.type).toBe(BrowserType.Chrome);
      expect(browserInfo.version.major).toBe(91);
      expect(browserInfo.version.minor).toBe(0);
      expect(browserInfo.isHeadless).toBe(true);
    });
    
    it('should handle forced browser type', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: chromeWindowsContext,
        forceBrowserType: BrowserType.Firefox
      });
      
      expect(browserInfo.type).toBe(BrowserType.Firefox);
    });
  });
  
  describe('Device Detection', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      detector = new DefaultBrowserDetector();
    });
    
    it('should detect desktop Windows device correctly', () => {
      const deviceInfo = detector.detectDevice({
        detectionContext: chromeWindowsContext
      });
      
      expect(deviceInfo.type).toBe(DeviceType.Desktop);
      expect(deviceInfo.os.type).toBe(OperatingSystem.Windows);
      expect(deviceInfo.os.isMobile).toBe(false);
      expect(deviceInfo.hasTouch).toBe(false);
      expect(deviceInfo.pixelRatio).toBe(1.5);
    });
    
    it('should detect mobile iOS device correctly', () => {
      const deviceInfo = detector.detectDevice({
        detectionContext: safariiOSContext
      });
      
      expect(deviceInfo.type).toBe(DeviceType.Mobile);
      expect(deviceInfo.os.type).toBe(OperatingSystem.iOS);
      expect(deviceInfo.os.isMobile).toBe(true);
      expect(deviceInfo.hasTouch).toBe(true);
      expect(deviceInfo.pixelRatio).toBe(3);
    });
    
    it('should detect desktop Linux device correctly', () => {
      const deviceInfo = detector.detectDevice({
        detectionContext: firefoxLinuxContext
      });
      
      expect(deviceInfo.type).toBe(DeviceType.Desktop);
      expect(deviceInfo.os.type).toBe(OperatingSystem.Linux);
      expect(deviceInfo.os.isMobile).toBe(false);
      expect(deviceInfo.hasTouch).toBe(false);
      expect(deviceInfo.pixelRatio).toBe(1);
    });
    
    it('should handle forced device type', () => {
      const deviceInfo = detector.detectDevice({
        detectionContext: chromeWindowsContext,
        forceDeviceType: DeviceType.Tablet
      });
      
      expect(deviceInfo.type).toBe(DeviceType.Tablet);
    });
  });
  
  describe('Browser Quirks Detection', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      detector = new DefaultBrowserDetector();
    });
    
    it('should detect Chrome quirks correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      const deviceInfo = detector.detectDevice({
        detectionContext: chromeWindowsContext
      });
      
      const quirks = detector.detectBrowserQuirks(browserInfo, deviceInfo);
      
      expect(quirks.hasDpiScalingIssues).toBe(false);
      expect(quirks.supportsFractionalCoordinates).toBe(true);
    });
    
    it('should detect Safari iOS quirks correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: safariiOSContext
      });
      
      const deviceInfo = detector.detectDevice({
        detectionContext: safariiOSContext
      });
      
      const quirks = detector.detectBrowserQuirks(browserInfo, deviceInfo);
      
      expect(quirks.hasTouchCoordinateIssues).toBe(true);
      expect(quirks.hasScrollRoundingIssues).toBe(true);
    });
    
    it('should check for specific quirks correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      const deviceInfo = detector.detectDevice({
        detectionContext: chromeWindowsContext
      });
      
      detector.detectBrowserQuirks(browserInfo, deviceInfo);
      
      expect(detector.hasQuirk('hasDpiScalingIssues')).toBe(false);
      expect(detector.hasQuirk('supportsFractionalCoordinates')).toBe(true);
    });
  });
  
  describe('Browser Position Detection', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      detector = new DefaultBrowserDetector();
    });
    
    it('should detect browser position using screen properties', async () => {
      // Mock detection context with screen.availLeft and screen.availTop
      const customContext: DetectionContext = {
        ...chromeWindowsContext,
        window: {
          ...chromeWindowsContext.window,
          screen: {
            ...chromeWindowsContext.window.screen,
            availLeft: 123,
            availTop: 456
          }
        },
        screen: {
          ...chromeWindowsContext.screen,
          availLeft: 123,
          availTop: 456
        }
      };
      
      // Create detector with custom context
      const detectorWithCustomContext = new DefaultBrowserDetector();
      
      // Detect browser position
      const position = await detectorWithCustomContext.detectBrowserPosition({
        detectionContext: customContext
      });
      
      // Check that the position was detected correctly
      expect(position.x).toBe(123);
      expect(position.y).toBe(456);
    });
    
    it('should detect browser position using screenX and screenY fallback', async () => {
      // Create a custom window object with screenX and screenY
      const customWindow = {
        ...chromeWindowsContext.window,
        screenX: 789,
        screenY: 101,
        screen: {
          width: 1920,
          height: 1080,
          availWidth: 1920,
          availHeight: 1040
          // Explicitly not including availLeft and availTop
        }
      };

      // Create a custom detection context
      const customContext: DetectionContext = {
        ...chromeWindowsContext,
        window: customWindow,
        screen: {
          width: 1920,
          height: 1080,
          availWidth: 1920,
          availHeight: 1040
          // Explicitly not including availLeft and availTop
        }
      };
      
      // Create detector with custom context
      const detectorWithCustomContext = new DefaultBrowserDetector();
      
      // Detect browser position
      const position = await detectorWithCustomContext.detectBrowserPosition({
        detectionContext: customContext
      });
      
      // Check that the position was detected correctly using fallback
      expect(position.x).toBe(789);
      expect(position.y).toBe(101);
    });
    
    it('should return default position if no detection methods are available', async () => {
      // Mock detection context with no position properties
      const customContext: DetectionContext = {
        ...chromeWindowsContext,
        window: undefined,
        screen: undefined
      };
      
      // Create detector with custom context
      const detectorWithCustomContext = new DefaultBrowserDetector();
      
      // Detect browser position
      const position = await detectorWithCustomContext.detectBrowserPosition({
        detectionContext: customContext
      });
      
      // Check that the default position is returned
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });
  });
  
  describe('Display Configuration Detection', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      detector = new DefaultBrowserDetector();
    });
    
    it('should detect Chrome Windows display configuration correctly', () => {
      const config = detector.detectDisplayConfiguration({
        detectionContext: chromeWindowsContext
      });
      
      expect(config.screenDimensions.width).toBe(1920);
      expect(config.screenDimensions.height).toBe(1080);
      expect(config.dpiScaling).toBe(1.5);
      expect(config.browserInfo?.type).toBe(BrowserType.Chrome);
      expect(config.deviceInfo?.type).toBe(DeviceType.Desktop);
    });
    
    it('should detect Safari iOS display configuration correctly', () => {
      const config = detector.detectDisplayConfiguration({
        detectionContext: safariiOSContext
      });
      
      expect(config.screenDimensions.width).toBe(390);
      expect(config.screenDimensions.height).toBe(844);
      expect(config.dpiScaling).toBe(3);
      expect(config.browserInfo?.type).toBe(BrowserType.Safari);
      expect(config.deviceInfo?.type).toBe(DeviceType.Mobile);
    });
    
    it('should create an adjusted display configuration', () => {
      const baseConfig = {
        screenDimensions: { width: 1920, height: 1080 },
        browserPosition: { x: 100, y: 50 },
        viewportDimensions: { width: 1800, height: 900 },
        dpiScaling: 1.5
      };
      
      const adjustedConfig = detector.createAdjustedDisplayConfiguration(
        baseConfig,
        { detectionContext: chromeWindowsContext }
      );
      
      expect(adjustedConfig.screenDimensions).toEqual(baseConfig.screenDimensions);
      expect(adjustedConfig.browserPosition).toEqual(baseConfig.browserPosition);
      expect(adjustedConfig.viewportDimensions).toEqual(baseConfig.viewportDimensions);
      expect(adjustedConfig.dpiScaling).toEqual(baseConfig.dpiScaling);
      expect(adjustedConfig.browserInfo?.type).toBe(BrowserType.Chrome);
      expect(adjustedConfig.deviceInfo?.type).toBe(DeviceType.Desktop);
    });
  });
  
  describe('Point Adjustment', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      detector = new DefaultBrowserDetector();
    });
    
    it('should correctly adjust points based on browser quirks', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      const deviceInfo = detector.detectDevice({
        detectionContext: chromeWindowsContext
      });
      
      const quirks = detector.detectBrowserQuirks(browserInfo, deviceInfo);
      
      // Chrome on desktop should not need adjustments
      const point = { x: 100, y: 200 };
      const adjustedPoint = detector.adjustPointForBrowser(point, quirks);
      
      expect(adjustedPoint.x).toBe(point.x);
      expect(adjustedPoint.y).toBe(point.y);
    });
    
    it('should apply DPI scaling corrections if needed', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: safariiOSContext
      });
      
      const deviceInfo = detector.detectDevice({
        detectionContext: safariiOSContext
      });
      
      const factor = detector.getDpiScalingCorrectionFactor(browserInfo, deviceInfo);
      
      // Mobile Safari might have a correction factor
      expect(factor).toBeGreaterThan(0);
    });
  });
  
  describe('Feature Detection', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      detector = new DefaultBrowserDetector();
    });
    
    it('should detect features for Chrome correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      const features = detector.detectFeatures(browserInfo);
      
      expect(features.supportsPointerEvents).toBe(true);
      expect(features.supportsPassiveEvents).toBe(true);
      expect(features.supportsIntersectionObserver).toBe(true);
      expect(features.supportsResizeObserver).toBe(true);
    });
    
    it('should detect features for Safari iOS correctly', () => {
      const browserInfo = detector.detectBrowser({
        detectionContext: safariiOSContext
      });
      
      const features = detector.detectFeatures(browserInfo);
      
      expect(features.supportsTouchEvents).toBe(true);
    });
  });
  
  describe('Cache Management', () => {
    let detector: BrowserDetector;
    
    beforeEach(() => {
      detector = new DefaultBrowserDetector();
    });
    
    it('should cache detection results by default', () => {
      // First detection
      detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      // Spy on the internal detection method
      const spy = jest.spyOn(DefaultBrowserDetector.prototype as any, '_detectBrowserFromUserAgent');
      
      // Second detection should use cache
      detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      expect(spy).not.toHaveBeenCalled();
      
      spy.mockRestore();
    });
    
    it('should bypass cache when requested', () => {
      // First detection
      detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      // Spy on the internal detection method
      const spy = jest.spyOn(DefaultBrowserDetector.prototype as any, '_detectBrowserFromUserAgent');
      
      // Second detection with cache disabled
      detector.detectBrowser({
        detectionContext: chromeWindowsContext,
        useCache: false
      });
      
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });
    
    it('should clear cache when requested', () => {
      // First detection
      detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      // Clear cache
      detector.clearCache();
      
      // Spy on the internal detection method
      const spy = jest.spyOn(DefaultBrowserDetector.prototype as any, '_detectBrowserFromUserAgent');
      
      // Second detection should not use cache
      detector.detectBrowser({
        detectionContext: chromeWindowsContext
      });
      
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });
});