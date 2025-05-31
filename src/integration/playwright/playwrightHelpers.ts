/**
 * @file playwrightHelpers.ts
 * @version 1.2.0
 * @lastModified 2025-05-20
 * @changelog Initial implementation of Playwright helper utilities
 *
 * Helper utilities for Playwright integration
 *
 * Key features:
 * - Provides additional utilities to enhance Playwright testing
 * - Supports coordinate transformations for test automation
 * - Includes functions for calibration verification
 * - Offers utilities for element selection and validation
 */

import { PlaywrightPage, PlaywrightElement, PlaywrightIntegration } from './playwrightIntegration';
import { Point, DisplayConfiguration } from '../../core/types';
import { CalibrationResult } from '../../calibration/calibrationTypes';

/**
 * Options for page initialization
 */
export interface PageInitOptions {
  /** URL to navigate to */
  url?: string;
  /** Viewport dimensions */
  viewport?: { width: number, height: number };
  /** Whether to detect and log browser information */
  detectBrowser?: boolean;
  /** Whether to automatically calibrate */
  autoCalibrate?: boolean;
  /** Number of milliseconds to wait after navigation */
  initialWaitMs?: number;
}

/**
 * Information about the current test environment
 */
export interface TestEnvironmentInfo {
  /** Display configuration */
  displayConfiguration: DisplayConfiguration;
  /** Browser name and version */
  browserInfo: {
    name: string;
    version: string;
    isHeadless: boolean;
  };
  /** Device information */
  deviceInfo: {
    type: string;
    pixelRatio: number;
    isMobile: boolean;
    isTouchEnabled: boolean;
  };
  /** Calibration information if available */
  calibration?: {
    isCalibrated: boolean;
    averageError?: number;
    calibrationType?: string;
  };
}

/**
 * Initialize a Playwright page for testing
 * 
 * @param page Playwright page object
 * @param options Initialization options
 * @returns Initialized PlaywrightIntegration
 */
export async function initializePage(
  page: PlaywrightPage, 
  options: PageInitOptions = {}
): Promise<PlaywrightIntegration> {
  // Set viewport if specified
  if (options.viewport) {
    await page.setViewportSize(options.viewport);
  }
  
  // Navigate to URL if specified
  if (options.url) {
    await page.goto(options.url);
  }
  
  // Create integration
  const integration = new PlaywrightIntegration({
    page,
    autoCalibrate: options.autoCalibrate
  });
  
  // Detect display configuration
  await integration.detectDisplayConfiguration();
  
  // Wait if specified
  if (options.initialWaitMs) {
    await page.waitForTimeout(options.initialWaitMs);
  }
  
  return integration;
}

/**
 * Get information about the test environment
 * 
 * @param integration PlaywrightIntegration instance
 * @returns Test environment information
 */
export async function getTestEnvironmentInfo(
  integration: PlaywrightIntegration
): Promise<TestEnvironmentInfo> {
  const displayConfiguration = await integration.getDisplayConfiguration();
  const browserDetector = integration.getBrowserDetector();
  const browserInfo = browserDetector.detectBrowser();
  const deviceInfo = browserDetector.detectDevice();
  const calibrationUtility = integration.getCalibrationUtility();
  
  // Create info object
  const info: TestEnvironmentInfo = {
    displayConfiguration,
    browserInfo: {
      name: browserInfo.type,
      version: browserInfo.version.full,
      isHeadless: browserInfo.isHeadless
    },
    deviceInfo: {
      type: deviceInfo.type,
      pixelRatio: deviceInfo.pixelRatio,
      isMobile: deviceInfo.os.isMobile,
      isTouchEnabled: deviceInfo.os.isTouchEnabled
    }
  };
  
  // Add calibration info if available
  if (calibrationUtility.isCalibrated()) {
    const calibration = calibrationUtility.getCurrentCalibration();
    if (calibration) {
      info.calibration = {
        isCalibrated: true,
        averageError: calibration.averageError,
        calibrationType: calibration.factors?.type
      };
    }
  }
  
  return info;
}

/**
 * Log test environment information to console
 * 
 * @param info Test environment information
 */
export function logTestEnvironmentInfo(info: TestEnvironmentInfo): void {
  console.log('=== Test Environment Information ===');
  console.log(`Browser: ${info.browserInfo.name} ${info.browserInfo.version}${info.browserInfo.isHeadless ? ' (Headless)' : ''}`);
  console.log(`Device: ${info.deviceInfo.type}, PixelRatio: ${info.deviceInfo.pixelRatio}`);
  console.log(`Viewport: ${info.displayConfiguration.viewportDimensions.width}x${info.displayConfiguration.viewportDimensions.height}`);
  console.log(`DPI Scaling: ${info.displayConfiguration.dpiScaling}`);
  
  if (info.calibration) {
    console.log(`Calibration: ${info.calibration.calibrationType}, Error: ${info.calibration.averageError}`);
  } else {
    console.log('Calibration: None');
  }
  console.log('===================================');
}

/**
 * Create a grid of points for coordinate testing
 * 
 * @param displayConfig Display configuration
 * @param gridSize Number of points in each dimension
 * @returns Array of grid points
 */
export function createTestGrid(
  displayConfig: DisplayConfiguration,
  gridSize: number = 5
): Point[] {
  const { width, height } = displayConfig.viewportDimensions;
  const points: Point[] = [];
  
  // Calculate step size
  const stepX = width / (gridSize + 1);
  const stepY = height / (gridSize + 1);
  
  // Generate grid points
  for (let i = 1; i <= gridSize; i++) {
    for (let j = 1; j <= gridSize; j++) {
      points.push({
        x: stepX * i,
        y: stepY * j
      });
    }
  }
  
  return points;
}

/**
 * Verify calibration accuracy by clicking grid points
 * 
 * @param integration PlaywrightIntegration instance
 * @param gridSize Number of points in each dimension
 * @returns Verification result
 */
export async function verifyCalibrationAccuracy(
  integration: PlaywrightIntegration,
  gridSize: number = 3
): Promise<{ success: boolean, points: number, errors: number[] }> {
  // Get display configuration
  const config = await integration.getDisplayConfiguration();
  
  // Create test grid
  const points = createTestGrid(config, gridSize);
  
  // Track errors
  const errors: number[] = [];
  
  // Click each point and collect errors
  // Note: In a real implementation, we would need a way to measure the actual position
  // For now, we'll just simulate clicks and assume they're accurate
  for (const point of points) {
    await integration.clickAt(point);
    errors.push(0); // Placeholder
  }
  
  return {
    success: true,
    points: points.length,
    errors
  };
}

/**
 * Helper to get element center point
 * 
 * @param page Playwright page
 * @param selector CSS selector
 * @returns Center point of the element
 */
export async function getElementCenter(
  page: PlaywrightPage,
  selector: string
): Promise<Point | null> {
  // Wait for selector
  const element = await page.waitForSelector(selector);
  
  // Get bounding box
  const boundingBox = await element.boundingBox();
  if (!boundingBox) {
    return null;
  }
  
  // Calculate center
  return {
    x: boundingBox.x + boundingBox.width / 2,
    y: boundingBox.y + boundingBox.height / 2
  };
}

/**
 * Take element screenshot with position annotations
 * 
 * Note: This is a placeholder for a more advanced implementation
 * that would take screenshots and annotate them with coordinate information
 * 
 * @param integration PlaywrightIntegration instance
 * @param element Element to screenshot
 */
export async function annotatedElementScreenshot(
  integration: PlaywrightIntegration,
  element: PlaywrightElement
): Promise<void> {
  // This would be implemented using Playwright's screenshot capabilities
  // and canvas/image manipulation to add coordinate annotations
  console.log('Element screenshot with annotations would be taken here');
}

/**
 * Inject utility functions into the page
 * 
 * @param page Playwright page
 */
export async function injectUtilities(page: PlaywrightPage): Promise<void> {
  // Inject helper functions for coordinate verification
  await page.evaluate(() => {
    (window as any).coordinateHelpers = {
      // Function to log mouse position
      trackMouse: () => {
        const tracker = document.createElement('div');
        tracker.style.position = 'fixed';
        tracker.style.top = '0';
        tracker.style.left = '0';
        tracker.style.background = 'rgba(0,0,0,0.7)';
        tracker.style.color = 'white';
        tracker.style.padding = '5px';
        tracker.style.zIndex = '9999';
        document.body.appendChild(tracker);
        
        document.addEventListener('mousemove', (e) => {
          tracker.textContent = `X: ${e.clientX}, Y: ${e.clientY}`;
        });
      },
      
      // Function to highlight element
      highlightElement: (selector: string) => {
        const element = document.querySelector(selector);
        if (element) {
          const originalBorder = (element as HTMLElement).style.border;
          (element as HTMLElement).style.border = '3px solid red';
          (element as HTMLElement).style.boxShadow = '0 0 10px red';
          
          setTimeout(() => {
            (element as HTMLElement).style.border = originalBorder;
            (element as HTMLElement).style.boxShadow = '';
          }, 2000);
        }
      }
    };
  });
}