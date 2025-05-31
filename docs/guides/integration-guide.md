# Integration Guide

## Overview

BrowserCoordinateKit integrates seamlessly with popular automation and testing libraries. This guide covers integration with **MouseWont** for human-like mouse movements and **Playwright** for browser automation, enabling precise coordinate handling across different environments.

## MouseWont Integration

### Introduction to MouseWont

[MouseWont](https://github.com/schebz/MouseWont) provides human-like mouse movement simulation. Combined with BrowserCoordinateKit's precise coordinate transformations, it enables realistic user interaction simulation across different display configurations.

### Basic MouseWont Integration

```typescript
import { BrowserPositionCalculator, MouseWontIntegration, CoordinateUtils } from 'browser-coordinate-kit';
import { MouseMovementSimulator } from 'mousewont';

// Create the integration components
const calculator = new BrowserPositionCalculator();
const simulator = new MouseMovementSimulator();
const integration = new MouseWontIntegration(simulator, calculator);

// Define display configuration
const config = CoordinateUtils.createDisplayConfig(
  1920, 1080,   // Screen dimensions
  100, 50,      // Browser position
  1600, 900,    // Viewport dimensions
  1.25          // DPI scaling
);

// Human-like movement between coordinates
const startPosition = { x: 500, y: 400 };
const targetPosition = { x: 1200, y: 700 };

await integration.moveToPosition(
  startPosition,
  targetPosition,
  config,
  {
    speed: 'normal',          // Movement speed: 'slow', 'normal', 'fast'
    windingFactor: 0.3,       // Path curvature (0 = straight, 1 = very curved)
    overshootChance: 0.2,     // Probability of slight overshoot
    jitterFactor: 0.1         // Small random movements
  }
);
```

### Advanced MouseWont Features

#### Cross-Screen Movement

```typescript
// Source environment (laptop screen)
const laptopConfig = CoordinateUtils.createDisplayConfig(
  1366, 768,    // Laptop screen
  50, 25,       // Browser position
  1200, 650,    // Viewport
  1.0           // Standard DPI
);

// Target environment (external monitor)
const monitorConfig = CoordinateUtils.createDisplayConfig(
  2560, 1440,   // External monitor
  200, 100,     // Browser position on monitor
  2200, 1200,   // Large viewport
  1.5           // High DPI
);

// Move from laptop coordinates to monitor coordinates
await integration.moveToPositionAcrossScreens(
  { x: 683, y: 384 },    // Centre of laptop screen
  { x: 1480, y: 820 },   // Centre of monitor screen
  laptopConfig,
  monitorConfig,
  {
    speed: 'normal',
    adaptToScreenSize: true,  // Adjust movement based on screen size difference
    crossScreenDelay: 100     // Pause when crossing screen boundaries
  }
);
```

#### Movement with Calibration

```typescript
import { CalibrationUtility, CalibrationType } from 'browser-coordinate-kit';

// Apply calibration to correct systematic errors
const calibration = new CalibrationUtility();

// Load or create calibration
const calibrationResult = calibration.loadCalibration('primary_display') || 
  calibration.calibratePoints(actualPoints, expectedPoints, CalibrationType.AFFINE);

// Move with calibration correction
await integration.moveToPositionWithCalibration(
  startPosition,
  targetPosition,
  config,
  calibrationResult,
  {
    speed: 'normal',
    windingFactor: 0.2
  }
);
```

#### Click Actions

```typescript
// Move and click with human-like behaviour
await integration.moveAndClick(
  startPosition,
  targetPosition,
  config,
  {
    speed: 'normal',
    windingFactor: 0.25
  },
  {
    clickType: 'single',      // 'single', 'double', 'right'
    holdDuration: 50,         // Click duration in milliseconds
    preClickPause: 100,       // Pause before clicking
    postClickPause: 150       // Pause after clicking
  }
);

// Drag operations
await integration.dragBetweenPositions(
  { x: 400, y: 300 },        // Drag start
  { x: 800, y: 500 },        // Drag end
  config,
  {
    speed: 'slow',            // Slower for precise dragging
    smoothness: 0.8,          // Higher smoothness for dragging
    dragSteps: 20             // Number of intermediate drag steps
  }
);
```

## Playwright Integration

### Basic Playwright Setup

```typescript
import { BrowserPositionCalculator, PlaywrightIntegration, CoordinateUtils } from 'browser-coordinate-kit';
import { chromium, Page } from 'playwright';

// Launch browser with Playwright
const browser = await chromium.launch();
const page = await browser.newPage();

// Create integration
const calculator = new BrowserPositionCalculator();
const playwrightIntegration = new PlaywrightIntegration(calculator);

// Get browser configuration from Playwright page
const config = await playwrightIntegration.getDisplayConfiguration(page);

console.log('Detected configuration:', config);
```

### Coordinate-Aware Page Interactions

```typescript
// Navigate and interact with precise coordinates
await page.goto('https://example.com');

// Click at specific logical coordinates
await playwrightIntegration.clickAtLogicalPosition(
  page,
  { x: 400, y: 300 },
  config
);

// Move mouse to specific position
await playwrightIntegration.moveMouseToPosition(
  page,
  { x: 600, y: 450 },
  config
);

// Hover with coordinate transformation
await playwrightIntegration.hoverAtPosition(
  page,
  { x: 300, y: 200 },
  config,
  { timeout: 5000 }
);
```

### Element-Relative Positioning

```typescript
// Get element position and interact relative to it
const element = await page.locator('#target-element');
const elementBounds = await element.boundingBox();

if (elementBounds) {
  // Click 10 pixels to the right of element centre
  const clickPosition = {
    x: elementBounds.x + elementBounds.width / 2 + 10,
    y: elementBounds.y + elementBounds.height / 2
  };
  
  await playwrightIntegration.clickAtLogicalPosition(
    page,
    clickPosition,
    config
  );
}
```

### Multi-Frame Handling

```typescript
// Handle iframe interactions with coordinate transformation
const iframe = await page.frameLocator('#embedded-frame');

// Calculate iframe offset
const iframeElement = await page.locator('#embedded-frame');
const iframeOffset = await iframeElement.boundingBox();

// Create iframe-aware configuration
const iframeConfig = await playwrightIntegration.createIFrameConfiguration(
  config,
  iframeOffset
);

// Interact within iframe using corrected coordinates
await playwrightIntegration.clickAtLogicalPosition(
  iframe,
  { x: 200, y: 150 },  // Coordinates within iframe
  iframeConfig
);
```

### Viewport and Screen Size Testing

```typescript
// Test across different viewport sizes
const viewportSizes = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 390, height: 844 },    // Mobile
  { width: 768, height: 1024 }    // Tablet
];

for (const viewport of viewportSizes) {
  await page.setViewportSize(viewport);
  
  // Update configuration for new viewport
  const newConfig = await playwrightIntegration.getDisplayConfiguration(page);
  
  // Test interactions with updated coordinates
  await playwrightIntegration.clickAtLogicalPosition(
    page,
    { x: 100, y: 100 },
    newConfig
  );
  
  // Verify element positions
  const elementPosition = await playwrightIntegration.getElementLogicalPosition(
    page.locator('#responsive-element'),
    newConfig
  );
  
  console.log(`Element position at ${viewport.width}x${viewport.height}:`, elementPosition);
}
```

## Advanced Integration Patterns

### Automated Testing with Coordinate Validation

```typescript
import { test, expect } from '@playwright/test';

test('coordinate accuracy across browsers', async ({ page, browserName }) => {
  const calculator = new BrowserPositionCalculator();
  const integration = new PlaywrightIntegration(calculator);
  
  await page.goto('/coordinate-test-page');
  
  // Get browser-specific configuration
  const config = await integration.getDisplayConfiguration(page);
  
  // Test coordinate transformation accuracy
  const testPoints = [
    { x: 100, y: 100 },
    { x: 500, y: 300 },
    { x: 800, y: 600 }
  ];
  
  for (const point of testPoints) {
    // Click at logical coordinate
    await integration.clickAtLogicalPosition(page, point, config);
    
    // Verify click was registered at correct position
    const registeredPosition = await page.evaluate(() => window.lastClickPosition);
    
    // Allow for small browser-specific variations
    const tolerance = browserName === 'webkit' ? 2 : 1;
    expect(Math.abs(registeredPosition.x - point.x)).toBeLessThan(tolerance);
    expect(Math.abs(registeredPosition.y - point.y)).toBeLessThan(tolerance);
  }
});
```

### Performance Monitoring

```typescript
import { PerformanceBenchmark } from 'browser-coordinate-kit';

class IntegrationPerformanceMonitor {
  private benchmark = new PerformanceBenchmark();
  private metrics: Array<{operation: string, duration: number}> = [];

  async measureMouseMovement(integration: MouseWontIntegration, from: Point, to: Point, config: DisplayConfiguration) {
    const startTime = Date.now();
    
    await integration.moveToPosition(from, to, config, { speed: 'normal' });
    
    const duration = Date.now() - startTime;
    this.metrics.push({ operation: 'mouse_movement', duration });
    
    return duration;
  }

  async measurePlaywrightClick(integration: PlaywrightIntegration, page: Page, position: Point, config: DisplayConfiguration) {
    const startTime = Date.now();
    
    await integration.clickAtLogicalPosition(page, position, config);
    
    const duration = Date.now() - startTime;
    this.metrics.push({ operation: 'playwright_click', duration });
    
    return duration;
  }

  getPerformanceReport() {
    const groupedMetrics = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) acc[metric.operation] = [];
      acc[metric.operation].push(metric.duration);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(groupedMetrics).map(([operation, durations]) => ({
      operation,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      sampleCount: durations.length
    }));
  }
}
```

### Error Recovery and Fallbacks

```typescript
class RobustIntegration {
  constructor(
    private mouseWontIntegration: MouseWontIntegration,
    private playwrightIntegration: PlaywrightIntegration
  ) {}

  async reliableClick(page: Page, position: Point, config: DisplayConfiguration, options: {
    maxRetries?: number;
    fallbackToPlaywright?: boolean;
    verifyClick?: boolean;
  } = {}) {
    const { maxRetries = 3, fallbackToPlaywright = true, verifyClick = true } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Try MouseWont first for human-like movement
        await this.mouseWontIntegration.moveAndClick(
          await this.getCurrentMousePosition(),
          position,
          config,
          { speed: 'normal' },
          { clickType: 'single' }
        );

        // Verify click was successful if requested
        if (verifyClick) {
          const clickRegistered = await this.verifyClickRegistered(page, position);
          if (clickRegistered) return true;
        } else {
          return true;
        }

      } catch (error) {
        console.warn(`MouseWont click attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries && fallbackToPlaywright) {
          console.log('Falling back to Playwright click');
          await this.playwrightIntegration.clickAtLogicalPosition(page, position, config);
          return true;
        }
      }
    }

    throw new Error(`Failed to click at position (${position.x}, ${position.y}) after ${maxRetries} attempts`);
  }

  private async getCurrentMousePosition(): Promise<Point> {
    // Implementation depends on your mouse tracking method
    return { x: 0, y: 0 }; // Placeholder
  }

  private async verifyClickRegistered(page: Page, expectedPosition: Point): Promise<boolean> {
    try {
      const actualPosition = await page.evaluate(() => window.lastClickPosition);
      const distance = Math.sqrt(
        Math.pow(actualPosition.x - expectedPosition.x, 2) + 
        Math.pow(actualPosition.y - expectedPosition.y, 2)
      );
      return distance < 5; // Allow 5px tolerance
    } catch {
      return false;
    }
  }
}
```

## Best Practices

### Configuration Management

```typescript
// Store and reuse configurations
class ConfigurationManager {
  private configs = new Map<string, DisplayConfiguration>();

  async getOrCreateConfig(identifier: string, page?: Page): Promise<DisplayConfiguration> {
    if (this.configs.has(identifier)) {
      return this.configs.get(identifier)!;
    }

    let config: DisplayConfiguration;
    
    if (page) {
      // Auto-detect from Playwright page
      const integration = new PlaywrightIntegration(new BrowserPositionCalculator());
      config = await integration.getDisplayConfiguration(page);
    } else {
      // Default configuration
      config = CoordinateUtils.createDisplayConfig(1920, 1080, 0, 0, 1920, 1080, 1.0);
    }

    this.configs.set(identifier, config);
    return config;
  }

  updateConfig(identifier: string, updates: Partial<DisplayConfiguration>) {
    const existing = this.configs.get(identifier);
    if (existing) {
      this.configs.set(identifier, { ...existing, ...updates });
    }
  }
}
```

### Error Handling and Logging

```typescript
// Comprehensive error handling for integrations
class IntegrationErrorHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Operation failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw new Error('Unexpected error in retry logic');
  }

  static logCoordinateTransformation(from: Point, to: Point, transform: string) {
    console.log(`${transform}: (${from.x}, ${from.y}) → (${to.x}, ${to.y})`);
  }
}
```

---

*Integration with MouseWont and Playwright enables precise, human-like interactions across different display environments, leveraging BrowserCoordinateKit's mathematical accuracy for reliable automation and testing.*