/**
 * @file mouseWontIntegration.ts
 * @version 1.0.0
 * @lastModified 2025-05-18
 * @changelog Initial implementation of MouseWont integration
 *
 * Integration utilities for the MouseWont library
 *
 * Key features:
 * - Helper functions to integrate with MouseWont
 * - Coordinate transformation for mouse movement simulation
 * - Support for iframe navigation
 */

import { Point, DisplayConfiguration } from '../core/types';
import { BrowserPositionCalculator } from '../core/browserPositionCalculator';
import { createNestedIFrameTransformation } from '../transformations/iframe';

// Define MouseWont simulator interface (for TypeScript type-checking)
interface MouseMovementSimulator {
  move(from: Point, to: Point, options?: MouseMovementOptions): Promise<void>;
  click(position: Point, options?: MouseClickOptions): Promise<void>;
}

interface MouseMovementOptions {
  gravityCurvature?: number;
  jitterFactor?: number;
  speedVariation?: boolean;
  overshootChance?: number;
}

interface MouseClickOptions {
  doubleClick?: boolean;
  rightClick?: boolean;
  delay?: number;
}

/**
 * Utility class for integrating BrowserCoordinateKit with MouseWont
 */
export class MouseWontIntegration {
  private calculator: BrowserPositionCalculator;
  
  /**
   * @param simulator The MouseWont simulator instance
   * @param calculator Optional BrowserPositionCalculator. If not provided, a new one will be created.
   */
  constructor(
    private simulator: MouseMovementSimulator,
    calculator?: BrowserPositionCalculator
  ) {
    this.calculator = calculator || new BrowserPositionCalculator();
  }
  
  /**
   * Move mouse to a target position with human-like movement
   * 
   * @param currentPosition Current mouse position in screen coordinates
   * @param targetPosition Target position in screen coordinates
   * @param config Display configuration
   * @param options MouseWont movement options
   * @returns Promise that resolves when movement is complete
   */
  async moveToPosition(
    currentPosition: Point,
    targetPosition: Point,
    config: DisplayConfiguration,
    options?: MouseMovementOptions
  ): Promise<void> {
    // Check if target is visible
    if (!this.calculator.isPointVisible(targetPosition, config)) {
      throw new Error('Target position is not visible in the browser window');
    }
    
    // Convert screen coordinates to logical coordinates for the browser
    const currentLogical = this.calculator.calculateTargetPosition(
      currentPosition,
      config,
      config
    );
    
    const targetLogical = this.calculator.calculateTargetPosition(
      targetPosition,
      config,
      config
    );
    
    // Use MouseWont to move with human-like behavior
    await this.simulator.move(currentLogical, targetLogical, options);
  }
  
  /**
   * Move mouse to and click on a position with human-like movement
   * 
   * @param currentPosition Current mouse position in screen coordinates
   * @param targetPosition Target position in screen coordinates
   * @param config Display configuration
   * @param moveOptions MouseWont movement options
   * @param clickOptions MouseWont click options
   * @returns Promise that resolves when movement and click are complete
   */
  async moveAndClick(
    currentPosition: Point,
    targetPosition: Point,
    config: DisplayConfiguration,
    moveOptions?: MouseMovementOptions,
    clickOptions?: MouseClickOptions
  ): Promise<void> {
    // First move to the position
    await this.moveToPosition(currentPosition, targetPosition, config, moveOptions);
    
    // Convert to logical coordinates for clicking
    const targetLogical = this.calculator.calculateTargetPosition(
      targetPosition,
      config,
      config
    );
    
    // Then click
    await this.simulator.click(targetLogical, clickOptions);
  }
  
  /**
   * Move mouse to a position in a nested iframe
   * 
   * @param currentPosition Current mouse position in screen coordinates
   * @param iframePosition Position within the iframe
   * @param iframeOffsets Array of iframe offsets, from outermost to innermost
   * @param config Display configuration
   * @param options MouseWont movement options
   * @returns Promise that resolves when movement is complete
   */
  async moveToIframePosition(
    currentPosition: Point,
    iframePosition: Point,
    iframeOffsets: Point[],
    config: DisplayConfiguration,
    options?: MouseMovementOptions
  ): Promise<void> {
    // Create iframe transformation
    const iframeTransform = createNestedIFrameTransformation(iframeOffsets);
    
    // Convert iframe coordinates to logical coordinates
    const positionInLogicalCoords = iframeTransform.getInverse().transform(iframePosition);
    
    // Convert logical to screen coordinates
    const positionInScreenCoords = this.calculator.calculateSourcePosition(
      positionInLogicalCoords,
      config,
      config
    );
    
    // Move to the position
    await this.moveToPosition(currentPosition, positionInScreenCoords, config, options);
  }
  
  /**
   * Navigate across multiple screens
   * 
   * @param startPoint Starting point in source screen coordinates
   * @param endPoint Target point in target screen coordinates
   * @param sourceConfig Source display configuration
   * @param targetConfig Target display configuration
   * @param options MouseWont movement options
   * @returns Promise that resolves when navigation is complete
   */
  async navigateAcrossScreens(
    startPoint: Point,
    endPoint: Point,
    sourceConfig: DisplayConfiguration,
    targetConfig: DisplayConfiguration,
    options?: MouseMovementOptions
  ): Promise<void> {
    // 1. Calculate the edge point of the first screen in the direction of movement
    const sourceEdges = this.calculator.calculateBrowserEdges(sourceConfig, sourceConfig);
    const horizontalDirection = startPoint.x < endPoint.x ? 'right' : 'left';
    
    const edgePoint = {
      x: horizontalDirection === 'right' ? sourceEdges.right - 5 : sourceEdges.left + 5,
      y: startPoint.y
    };
    
    // 2. Move to the edge of the first screen
    await this.moveToPosition(startPoint, edgePoint, sourceConfig, options);
    
    // 3. Calculate entry point on the second screen
    const entryPoint = {
      x: horizontalDirection === 'right' ? 
          targetConfig.browserPosition.x + 5 : 
          targetConfig.browserPosition.x + targetConfig.viewportDimensions.width * targetConfig.dpiScaling - 5,
      y: edgePoint.y
    };
    
    // 4. Convert both points to logical coordinates for smooth transition
    const edgePointLogical = this.calculator.calculateTargetPosition(
      edgePoint,
      sourceConfig,
      sourceConfig
    );
    
    const entryPointLogical = this.calculator.calculateTargetPosition(
      entryPoint,
      targetConfig,
      targetConfig
    );
    
    // 5. Move from edge to entry (cross-screen transition)
    await this.simulator.move(edgePointLogical, entryPointLogical, {
      ...options,
      gravityCurvature: 0.1, // Straighter path for crossing screens
      jitterFactor: (options?.jitterFactor || 10) / 2 // Less jitter for precise transition
    });
    
    // 6. Calculate target point in logical coordinates
    const endPointLogical = this.calculator.calculateTargetPosition(
      endPoint,
      targetConfig,
      targetConfig
    );
    
    // 7. Complete movement to final destination
    await this.simulator.move(entryPointLogical, endPointLogical, options);
  }
}