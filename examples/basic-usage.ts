/**
 * Basic Usage Example
 * 
 * This example demonstrates the core functionality of BrowserCoordinateKit,
 * showing how to transform coordinates between different display configurations.
 */

import {
  BrowserPositionCalculator,
  CoordinateUtils,
  DirectFormulaStrategy
} from '../src';

// Example function demonstrating the core functionality
function basicExample() {
  console.log('BrowserCoordinateKit - Basic Usage Example');
  console.log('-------------------------------------------');

  // Create source and target configurations
  const sourceConfig = CoordinateUtils.createDisplayConfig(
    2560, 1440,   // Original screen dimensions
    100, 50,      // Original browser position
    2000, 1000,   // Original viewport dimensions
    2             // Original DPI scaling
  );
  
  const targetConfig = CoordinateUtils.createDisplayConfig(
    1920, 1080,   // Target screen dimensions
    75, 37.5,     // Target browser position
    1800, 900,    // Target viewport dimensions
    1.5           // Target DPI scaling
  );
  
  // Create calculator with default strategy (transformation-based)
  const calculator = new BrowserPositionCalculator();
  
  // Calculate the target position for a point
  const sourcePoint = { x: 2065, y: 539 };
  const targetPosition = calculator.calculateTargetPosition(
    sourcePoint,
    sourceConfig,
    targetConfig
  );
  
  console.log('Source point (screen coordinates):', sourcePoint);
  console.log('Target position (logical coordinates):', targetPosition);
  
  // Calculate browser edges in the target configuration
  const edges = calculator.calculateBrowserEdges(sourceConfig, targetConfig);
  console.log('Browser edges in target screen:', edges);
  
  // Check if the point is visible
  const isVisible = calculator.isPointVisible(sourcePoint, sourceConfig);
  console.log('Is source point visible in source browser:', isVisible);
  
  // Switch to a direct formula strategy for potentially better performance
  calculator.setStrategy(new DirectFormulaStrategy());
  
  // Recalculate using the new strategy
  const targetPosition2 = calculator.calculateTargetPosition(
    sourcePoint,
    sourceConfig,
    targetConfig
  );
  console.log('Target position (direct formula):', targetPosition2);
  
  // Calculate source position from the target position
  const calculatedSourcePoint = calculator.calculateSourcePosition(
    targetPosition2,
    sourceConfig,
    targetConfig
  );
  console.log('Calculated source point (round-trip):', calculatedSourcePoint);
  console.log('Original source point:', sourcePoint);
  
  // Verify the round-trip accuracy
  const roundTripError = {
    x: Math.abs(sourcePoint.x - calculatedSourcePoint.x),
    y: Math.abs(sourcePoint.y - calculatedSourcePoint.y)
  };
  console.log('Round-trip error:', roundTripError);
}

// Run the example
basicExample();