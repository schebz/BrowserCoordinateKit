/**
 * @file mousePlayWrong.test.ts
 * @version 1.0.2
 * @lastModified 2025-05-18
 * @changelog Tests for MousePlayWrong integration
 *
 * Unit tests for MousePlayWrong integration using actual library
 */

import { MouseWontIntegration } from '../../src/integration/mouseWontIntegration';
import { BrowserPositionCalculator } from '../../src/core/browserPositionCalculator';
import { DisplayConfiguration, Point } from '../../src/core/types';

// Import from mouseWont library (local path)
import { MousePlayWrong } from '/home/tokamak/dev/projects/github/mouseWont/src/core/MousePlayWrong';

// Mocks for Playwright types that MousePlayWrong expects
class MockPlaywrightMouse {
  _x = 0;
  _y = 0;
  
  async move(x: number, y: number) {
    this._x = x;
    this._y = y;
    return Promise.resolve();
  }
  
  async down(options?: { button?: 'left' | 'right' | 'middle' }) {
    return Promise.resolve();
  }
  
  async up(options?: { button?: 'left' | 'right' | 'middle' }) {
    return Promise.resolve();
  }
}

class MockPlaywrightPage {
  mouse = new MockPlaywrightMouse();
  
  async $(selector: string) {
    return {
      async boundingBox() {
        return { x: 200, y: 150, width: 100, height: 50 };
      }
    };
  }
  
  async evaluate(fn: Function) {
    return { x: this.mouse._x, y: this.mouse._y };
  }
}

// Create adapter to make MousePlayWrong compatible with our mocked interfaces
class MouseWontAdapter {
  private mousePlayWrong: MousePlayWrong;
  
  constructor(page = new MockPlaywrightPage()) {
    this.mousePlayWrong = new MousePlayWrong(page as any);
  }
  
  async move(from: Point, to: Point, options?: any): Promise<void> {
    // Force the initial position since we can't directly set it
    (this.mousePlayWrong as any).page.mouse._x = from.x;
    (this.mousePlayWrong as any).page.mouse._y = from.y;
    
    // Use moveTo to reach target position
    await this.mousePlayWrong.moveTo(to, options);
    return Promise.resolve();
  }
  
  async click(position: Point, options?: any): Promise<void> {
    // Ensure we're at the position first
    (this.mousePlayWrong as any).page.mouse._x = position.x;
    (this.mousePlayWrong as any).page.mouse._y = position.y;
    
    // Click at current position
    await this.mousePlayWrong.click(options);
    return Promise.resolve();
  }
}

// Using partial integration test - we're using the real library structure but mocked interfaces
describe('MousePlayWrong Integration (with real library)', () => {
  // Test setup
  let adapter: MouseWontAdapter;
  let calculator: BrowserPositionCalculator;
  let integration: MouseWontIntegration;
  
  // Test configurations
  const config: DisplayConfiguration = {
    screenDimensions: { width: 2560, height: 1440 },
    browserPosition: { x: 100, y: 50 },
    viewportDimensions: { width: 2000, height: 1000 },
    dpiScaling: 2
  };
  
  // Test points
  const currentPosition: Point = { x: 500, y: 300 };
  const targetPosition: Point = { x: 800, y: 400 };
  
  beforeEach(() => {
    // Create fresh instances for each test
    adapter = new MouseWontAdapter();
    calculator = new BrowserPositionCalculator();
    integration = new MouseWontIntegration(adapter as any, calculator);
  });
  
  describe('with actual MousePlayWrong adapter', () => {
    it('should handle coordinate transformations through the adapter', async () => {
      // Spy on calculator methods
      const transformSpy = jest.spyOn(calculator, 'calculateTargetPosition');
      const visibilitySpy = jest.spyOn(calculator, 'isPointVisible').mockReturnValue(true);
      
      // Mock the adapter's move method to verify it gets called with correct coordinates
      const moveSpy = jest.spyOn(adapter, 'move');
      
      // Execute the method under test
      await integration.moveToPosition(currentPosition, targetPosition, config);
      
      // Verify calculator methods were called
      expect(visibilitySpy).toHaveBeenCalledWith(targetPosition, config);
      expect(transformSpy).toHaveBeenCalledWith(currentPosition, config, config);
      expect(transformSpy).toHaveBeenCalledWith(targetPosition, config, config);
      
      // The adapter's move should be called with the logical versions of the coordinates
      expect(moveSpy).toHaveBeenCalled();
      
      // Verify the coordinates were properly transformed
      const logicalCurrent = calculator.calculateTargetPosition(currentPosition, config, config);
      const logicalTarget = calculator.calculateTargetPosition(targetPosition, config, config);
      
      // The first two arguments to move should be the logical coordinates
      expect(moveSpy.mock.calls[0][0]).toEqual(logicalCurrent);
      expect(moveSpy.mock.calls[0][1]).toEqual(logicalTarget);
    });
    
    it('should handle moveAndClick operations with the adapter', async () => {
      // Mock visibility check
      jest.spyOn(calculator, 'isPointVisible').mockReturnValue(true);
      
      // Spy on adapter methods
      const moveSpy = jest.spyOn(adapter, 'move');
      const clickSpy = jest.spyOn(adapter, 'click');
      
      // Execute moveAndClick
      await integration.moveAndClick(currentPosition, targetPosition, config);
      
      // Verify both move and click were called
      expect(moveSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      
      // Click should be called with the logical target position
      const logicalTarget = calculator.calculateTargetPosition(targetPosition, config, config);
      expect(clickSpy.mock.calls[0][0]).toEqual(logicalTarget);
    });
  });
});