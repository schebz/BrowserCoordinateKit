/**
 * Tests for Playwright helper utilities
 */

import { 
  initializePage, 
  getTestEnvironmentInfo, 
  createTestGrid, 
  verifyCalibrationAccuracy,
  getElementCenter
} from '../../../src/integration/playwright/playwrightHelpers';
import { DisplayConfiguration } from '../../../src/core/types';

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

    return null;
  }

  getMouse() {
    return this.mouse;
  }

  async waitForSelector(selector: string, options?: any) {
    return Promise.resolve({
      boundingBox: async () => ({ x: 100, y: 100, width: 200, height: 50 }),
    });
  }

  async waitForTimeout(ms: number) {
    return Promise.resolve();
  }
}

describe('Playwright Helpers', () => {
  let page: MockPage;
  
  beforeEach(() => {
    page = new MockPage();
  });
  
  describe('initializePage', () => {
    it('should initialize page with default options', async () => {
      const integration = await initializePage(page as any);
      expect(integration).toBeDefined();
    });
    
    it('should initialize page with custom viewport', async () => {
      const viewport = { width: 800, height: 600 };
      const setViewportSpy = jest.spyOn(page, 'setViewportSize');
      
      await initializePage(page as any, { viewport });
      
      expect(setViewportSpy).toHaveBeenCalledWith(viewport);
    });
    
    it('should navigate to URL if provided', async () => {
      const url = 'https://example.com/test';
      const gotoSpy = jest.spyOn(page, 'goto');
      
      await initializePage(page as any, { url });
      
      expect(gotoSpy).toHaveBeenCalledWith(url);
    });
    
    it('should wait if initialWaitMs is provided', async () => {
      const waitSpy = jest.spyOn(page, 'waitForTimeout');
      const initialWaitMs = 1000;
      
      await initializePage(page as any, { initialWaitMs });
      
      expect(waitSpy).toHaveBeenCalledWith(initialWaitMs);
    });
  });
  
  describe('createTestGrid', () => {
    it('should create a grid of points', () => {
      const config: DisplayConfiguration = {
        screenDimensions: { width: 1920, height: 1080 },
        viewportDimensions: { width: 1280, height: 720 },
        browserPosition: { x: 0, y: 0 },
        dpiScaling: 1.5
      };
      
      const gridSize = 3;
      const points = createTestGrid(config, gridSize);
      
      // Should have gridSize * gridSize points
      expect(points.length).toBe(gridSize * gridSize);
      
      // Check first point
      expect(points[0].x).toBe(1280 / (gridSize + 1)); // x = width / (gridSize + 1)
      expect(points[0].y).toBe(720 / (gridSize + 1)); // y = height / (gridSize + 1)
    });
    
    it('should default to 5x5 grid', () => {
      const config: DisplayConfiguration = {
        screenDimensions: { width: 1920, height: 1080 },
        viewportDimensions: { width: 1280, height: 720 },
        browserPosition: { x: 0, y: 0 },
        dpiScaling: 1.5
      };
      
      const points = createTestGrid(config);
      
      // Should have 5 * 5 = 25 points
      expect(points.length).toBe(25);
    });
  });
  
  describe('getElementCenter', () => {
    it('should calculate element center correctly', async () => {
      const selector = '.test-element';
      
      const center = await getElementCenter(page as any, selector);
      
      expect(center).toEqual({ x: 200, y: 125 }); // center of { x: 100, y: 100, width: 200, height: 50 }
    });
  });
});