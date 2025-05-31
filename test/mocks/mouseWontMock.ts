/**
 * @file mouseWontMock.ts
 * @version 1.0.1
 * @lastModified 2025-05-18
 * @changelog Mock implementation of MouseWont interfaces for testing
 *
 * Mock implementations of MouseWont interfaces for testing purposes
 */

import { Point } from '../../src/core/types';

// Re-export the interface types from the actual implementation
export interface MouseMovementOptions {
  gravityCurvature?: number;
  jitterFactor?: number;
  speedVariation?: boolean;
  overshootChance?: number;
}

export interface MouseClickOptions {
  doubleClick?: boolean;
  rightClick?: boolean;
  delay?: number;
}

/**
 * Mock implementation of MouseMovementSimulator for testing
 * Records all method calls for verification in tests
 */
export class MockMouseMovementSimulator {
  // Record of all movements
  moveHistory: Array<{
    from: Point;
    to: Point;
    options?: MouseMovementOptions;
  }> = [];
  
  // Record of all clicks
  clickHistory: Array<{
    position: Point;
    options?: MouseClickOptions;
  }> = [];
  
  /**
   * Mock implementation of move method
   * Records the movement and returns a resolved promise
   * 
   * @param from Starting point
   * @param to Target point
   * @param options MouseWont movement options
   * @returns Promise that resolves immediately
   */
  async move(from: Point, to: Point, options?: MouseMovementOptions): Promise<void> {
    this.moveHistory.push({ from, to, options });
    return Promise.resolve();
  }
  
  /**
   * Mock implementation of click method
   * Records the click and returns a resolved promise
   * 
   * @param position Click position
   * @param options MouseWont click options
   * @returns Promise that resolves immediately
   */
  async click(position: Point, options?: MouseClickOptions): Promise<void> {
    this.clickHistory.push({ position, options });
    return Promise.resolve();
  }
  
  /**
   * Helper method to reset all history records
   * Useful between test cases
   */
  reset(): void {
    this.moveHistory = [];
    this.clickHistory = [];
  }
}

/**
 * Creates a mock mouse movement simulator for testing
 * Matches the signature of the actual MouseWont factory function
 * 
 * @returns A mock MouseMovementSimulator
 */
export function createMockMouseMovementSimulator(): MockMouseMovementSimulator {
  return new MockMouseMovementSimulator();
}