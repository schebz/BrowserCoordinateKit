/**
 * IFrame Example
 * 
 * This example demonstrates how to use BrowserCoordinateKit with iframes,
 * showing how to transform coordinates in nested iframe structures.
 */

import {
  BrowserPositionCalculator,
  CoordinateUtils,
  createNestedIFrameTransformation
} from '../src';

// Example function demonstrating iframe coordinate transformation
function iframeExample() {
  console.log('BrowserCoordinateKit - IFrame Example');
  console.log('--------------------------------------');

  // Create display configuration
  const config = CoordinateUtils.createDisplayConfig(
    1920, 1080,   // Screen dimensions
    100, 50,      // Browser position
    1600, 900,    // Viewport dimensions
    1.5           // DPI scaling
  );
  
  // Define iframe offsets (relative to their parent)
  const iframeOffsets = [
    { x: 50, y: 100 },    // Offset of the first iframe relative to the main document
    { x: 20, y: 30 }      // Offset of the second iframe relative to the first iframe
  ];
  
  // Create the transformation for nested iframes
  const iframeTransform = createNestedIFrameTransformation(iframeOffsets);
  
  // Define a point in the innermost iframe coordinates
  const pointInInnerIframe = { x: 150, y: 200 };
  console.log('Point in innermost iframe:', pointInInnerIframe);
  
  // Transform iframe point to logical coordinates
  const pointInLogicalCoords = iframeTransform.getInverse().transform(pointInInnerIframe);
  console.log('Point in logical coordinates:', pointInLogicalCoords);
  
  // Create calculator
  const calculator = new BrowserPositionCalculator();
  
  // Transform logical point-to-screen coordinates
  const pointInScreenCoords = calculator.calculateSourcePosition(
    pointInLogicalCoords,
    config,
    config
  );
  console.log('Point in screen coordinates:', pointInScreenCoords);
  
  // Verify that the point is within the browser window
  const isVisible = calculator.isPointVisible(pointInScreenCoords, config);
  console.log('Is point visible in browser window:', isVisible);
  
  // Demonstrate the round-trip transformation
  // Screen -> Logical -> IFrame -> Logical -> Screen
  
  // Start with screen coordinates
  const startPoint = { x: 500, y: 300 };
  console.log('\nStarting point (screen):', startPoint);
  
  // Convert to logical coordinates
  const logicalPoint = calculator.calculateTargetPosition(
    startPoint,
    config,
    config
  );
  console.log('Logical coordinates:', logicalPoint);
  
  // Convert to iframe coordinates
  const iframePoint = iframeTransform.transform(logicalPoint);
  console.log('Iframe coordinates:', iframePoint);
  
  // Convert back to logical coordinates
  const backToLogical = iframeTransform.getInverse().transform(iframePoint);
  console.log('Back to logical coordinates:', backToLogical);
  
  // Convert back to screen coordinates
  const backToScreen = calculator.calculateSourcePosition(
    backToLogical,
    config,
    config
  );
  console.log('Back to screen coordinates:', backToScreen);
  
  // Calculate the round-trip error
  const roundTripError = {
    x: Math.abs(startPoint.x - backToScreen.x),
    y: Math.abs(startPoint.y - backToScreen.y)
  };
  console.log('Round-trip error:', roundTripError);
}

// Run the example
iframeExample();