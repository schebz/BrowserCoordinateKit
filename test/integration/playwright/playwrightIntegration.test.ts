/**
 * Tests for PlaywrightIntegration
 */

import { 
  PlaywrightIntegration,
  PlaywrightOptions,
  PlaywrightCoordinateOptions,
  PlaywrightElement
} from '../../../src/integration/playwright/playwrightIntegration';
import { BrowserPositionCalculator } from '../../../src/core/browserPositionCalculator';
import { BrowserDetector } from '../../../src/detection/browserDetector';
import { CalibrationUtility } from '../../../src/calibration/calibrationUtility';
import { Point, DisplayConfiguration } from '../../../src/core/types';
import { 
  BrowserType, 
  DeviceType, 
  OperatingSystem,
  BrowserInfo, 
  DeviceInfo 
} from '../../../src/detection/browserTypes';

// Mock for Playwright Page
class MockPage {
  private viewport: { width: number, height: number } = { width: 1280, height: 720 };
  private url: string = 'https://example.com';
  private mouse = {
    click: jest.fn(),
    move: jest.fn(),
    down: jest.fn(),
    up: jest.fn(),
    dblclick: jest.fn()
  };

  constructor() {}

  async goto(url: string) {
    this.url = url;
    return Promise.resolve();
  }

  async setViewportSize(size: { width: number, height: number }) {
    this.viewport = size;
    return Promise.resolve();
  }

  async evaluate(fn: Function, ...args: any[]) {
    // Simple mock that returns predefined values for different functions
    if (fn.toString().includes('getBoundingClientRect')) {
      return { 
        x: 100, y: 100, 
        top: 100, left: 100, 
        width: 200, height: 50,
        bottom: 150, right: 300 
      };
    }

    if (fn.toString().includes('navigator.userAgent')) {
      return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    }

    if (fn.toString().includes('window.devicePixelRatio')) {
      return 1.5;
    }

    if (fn.toString().includes('window.innerWidth') || fn.toString().includes('screen.width')) {
      return this.viewport.width;
    }

    if (fn.toString().includes('window.innerHeight') || fn.toString().includes('screen.height')) {
      return this.viewport.height;
    }

    if (fn.toString().includes('window.scrollX') || fn.toString().includes('window.pageXOffset')) {
      return
 0;
    }

    if (fn.toString().includes('window.scrollY') || fn.toString().includes('window.pageYOffset')) {
      return 0;
    }

    return null;
  }

  getMouse() {
    return this.mouse;
  }

  async waitForSelector(selector: string, options?: any) {
    return Promise.resolve({
      boundingBox: async () => ({ x: 100, y: 100, width: 200, height: 50 }),
    } as PlaywrightElement);
  }

  async waitForTimeout(ms: number) {
    return Promise.resolve();
  }
}

// Mock for Playwright ElementHandle
class MockElementHandle {
  constructor(private rect = { x: 100, y: 100, width: 200, height: 50 }) {}

  async boundingBox() {
    return this.rect;
  }

  async click(options?: any) {
    return Promise.resolve();
  }

  async hover(options?: any) {
    return Promise.resolve();
  }
}

// Mock browser detector
class MockBrowserDetector implements BrowserDetector {
  detectBrowser(): BrowserInfo {
    return {
      type: BrowserType.Chrome,
      version: { major: 91, minor: 0, patch: 4472, full: '91.0.4472.124' },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      engine: 'Blink',
      isHeadless: false
    };
  }
  
  detectDevice(): DeviceInfo {
    return {
      type: DeviceType.Desktop,
      os: {
        type: OperatingSystem.Windows,
        version: '10.0',
        isMobile: false,
        isTouchEnabled: false
      },
      hasTouch: false,
      hasPointer: true,
      pixelRatio: 1.5,
      orientation: 'landscape'
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
  
  detectDisplayConfiguration(): DisplayConfiguration {
    return {
      screenDimensions: { width: 1920, height: 1080 },
      browserPosition: { x: 0, y: 0 },
      viewportDimensions: { width: 1280, height: 720 },
      dpiScaling: 1.5
    };
  }
  
  adjustPointForBrowser(point: Point): Point {
    return point;
  }
  
  getDpiScalingCorrectionFactor(): number {
    return 1.0;
  }
  
  hasQuirk(quirk: string): boolean {
    return false;
  }
  
  createAdjustedDisplayConfiguration(baseConfig: DisplayConfiguration): any {
    return {
      ...baseConfig,
      browserInfo: this.detectBrowser(),
      deviceInfo: this.detectDevice(),
      quirks: this.detectBrowserQuirks()
    };
  }
  
  clearCache(): void {}
}

describe('PlaywrightIntegration', () => {
  let page: MockPage;
  let integration: PlaywrightIntegration;
  let calculator: BrowserPositionCalculator;
  let browserDetector: MockBrowserDetector;
  let calibrationUtility: CalibrationUtility;
  
  beforeEach(() => {
    page = new MockPage();
    browserDetector = new MockBrowserDetector();
    calibrationUtility = new CalibrationUtility({ browserDetector });
    calculator = new BrowserPositionCalculator();
    
    integration = new PlaywrightIntegration({
      page: page as any,
      calculator,
      browserDetector,
      calibrationUtility
    });
  });
  
  describe('initialization', () => {
    it('should create an instance with default options', () => {
      const defaultIntegration = new PlaywrightIntegration({
        page: page as any
      });
      
      expect(defaultIntegration).toBeDefined();
    });
    
    it('should create an instance with custom options', () => {
      const options: PlaywrightOptions = {
        page: page as any,
        calculator,
        browserDetector,
        calibrationUtility,
        autoCalibrate: true,
        defaultCalibrationPoints: 5,
        useAdaptiveStrategy: true
      };
      
      const customIntegration = new PlaywrightIntegration(options);
      expect(customIntegration).toBeDefined();
    });
  });
  
  describe('display configuration', () => {
    it('should detect display configuration from page', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
      
      const config = await integration.detectDisplayConfiguration();
      
      expect(config).toBeDefined();
      expect(config.viewportDimensions.width).toBe(1280);
      expect(config.viewportDimensions.height).toBe(720);
      expect(config.dpiScaling).toBe(1.5);
    });
  });
  
  describe('element interactions', () => {
    it('should click on an element', async () => {
      const element = new MockElementHandle();
      const mouse = page.getMouse();
      
      await integration.clickElement(element as any);
      
      expect(mouse.click).toHaveBeenCalled();
    });
    
    it('should hover over an element', async () => {
      const element = new MockElementHandle();
      const mouse = page.getMouse();
      
      await integration.hoverElement(element as any);
      
      expect(mouse.move).toHaveBeenCalled();
    });
    
    it('should click at specific coordinates', async () => {
      const mouse = page.getMouse();
      
      await integration.clickAt({ x: 200, y: 300 });
      
      expect(mouse.click).toHaveBeenCalled();
    });
    
    it('should click at relative coordinates within an element', async () => {
      const element = new MockElementHandle();
      const mouse = page.getMouse();
      
      await integration.clickElementAt(element as any, { relativeX: 0.5, relativeY: 0.5 });
      
      expect(mouse.click).toHaveBeenCalled();
    });
    
    it('should perform drag and drop', async () => {
      const mouse = page.getMouse();
      const from = { x: 100, y: 100 };
      const to = { x: 200, y: 200 };
      
      await integration.dragAndDrop(from, to);
      
      expect(mouse.move).toHaveBeenCalled();
      expect(mouse.down).toHaveBeenCalled();
      expect(mouse.up).toHaveBeenCalled();
    });
  });
  
  describe('calibration', () => {
    it('should run calibration process', async () => {
      const spy = jest.spyOn(calibrationUtility, 'calibrate');
      
      await integration.calibrate();
      
      expect(spy).toHaveBeenCalled();
    });
    
    it('should apply calibration to coordinates', async () => {
      // Mock isCalibrated to return true so applyCalibration gets called
      jest.spyOn(calibrationUtility, 'isCalibrated').mockReturnValue(true);
      const spy = jest.spyOn(calibrationUtility, 'applyCalibration');
      const point = { x: 100, y: 100 };
      
      await integration.clickAt(point, { applyCalibration: true });
      
      expect(spy).toHaveBeenCalled();
    });
  });
  
  describe('advanced interactions', () => {
    it('should perform a double-click', async () => {
      const mouse = page.getMouse();
      
      await integration.doubleClickAt({ x: 200, y: 300 });
      
      expect(mouse.dblclick).toHaveBeenCalled();
    });
    
    it('should extract element data', async () => {
      const element = new MockElementHandle();
      
      const data = await integration.getElementData(element as any);
      
      expect(data).toBeDefined();
      expect(data.boundingBox).toBeDefined();
      expect(data.center).toBeDefined();
    });
    
    it('should wait for element and interact', async () => {
      const selector = '.test-element';
      const mouse = page.getMouse();
      
      await integration.waitForSelectorAndClick(selector);
      
      expect(mouse.click).toHaveBeenCalled();
    });
  });
});