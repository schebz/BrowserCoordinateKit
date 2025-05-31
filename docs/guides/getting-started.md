# Getting Started with BrowserCoordinateKit

## Introduction

BrowserCoordinateKit provides mathematically rigorous coordinate transformations for web applications. Built upon **Michael R. Malloy's proven mathematical framework**, it ensures accurate position calculations across different display environments.

## Installation

### Basic Installation

```bash
npm install browser-coordinate-kit
```

### Development Dependencies

For mathematical validation and development:

```bash
# Additional dependencies for validation
npm install mathjs --save-dev

# Python dependencies for visualisations (optional)
pip install matplotlib numpy
```

## Core Concepts

### Understanding Coordinate Systems

BrowserCoordinateKit works with four fundamental coordinate systems:

1. **Screen Coordinates**: Physical pixels relative to the entire screen
2. **Browser Coordinates**: Physical pixels relative to the browser window  
3. **Logical Coordinates**: DPI-scaled pixels used by the browser internally
4. **Normalised Coordinates**: Resolution-independent coordinates in [0,1] range

### Display Configuration

Before performing transformations, you need to create a display configuration:

```typescript
import { CoordinateUtils } from 'browser-coordinate-kit';

const config = CoordinateUtils.createDisplayConfig(
  1920, 1080,   // Screen dimensions (width, height)
  100, 50,      // Browser position on screen (x, y)
  1600, 900,    // Browser viewport size (width, height)  
  1.25          // DPI scaling factor
);
```

## Your First Transformation

### Basic Coordinate Transformation

```typescript
import { BrowserPositionCalculator, CoordinateUtils } from 'browser-coordinate-kit';

// Create display configuration
const config = CoordinateUtils.createDisplayConfig(
  1920, 1080,   // Screen: 1920×1080
  100, 50,      // Browser at (100, 50)
  1600, 900,    // Viewport: 1600×900
  1.25          // DPI scaling: 1.25x
);

// Create calculator
const calculator = new BrowserPositionCalculator();

// Transform a screen coordinate to logical coordinate
const screenPoint = { x: 500, y: 300 };
const logicalPoint = calculator.calculateTargetPosition(
  screenPoint,
  config,
  config  // Same config for both source and target
);

console.log(`Screen (${screenPoint.x}, ${screenPoint.y}) → Logical (${logicalPoint.x}, ${logicalPoint.y})`);
// Output: Screen (500, 300) → Logical (320, 200)
```

### Understanding the Mathematics

The transformation follows Malloy's mathematical framework:

1. **Screen to Browser**: `(500, 300) - (100, 50) = (400, 250)`
2. **Browser to Logical**: `(400, 250) / 1.25 = (320, 200)`

## Common Use Cases

### Cross-Screen Mapping

Transform coordinates between different display setups:

```typescript
// Source environment (high-resolution display)
const sourceConfig = CoordinateUtils.createDisplayConfig(
  2560, 1440,   // 2K display
  200, 100,     // Browser position
  2200, 1200,   // Large viewport
  2.0           // High DPI
);

// Target environment (standard display)  
const targetConfig = CoordinateUtils.createDisplayConfig(
  1920, 1080,   // Full HD display
  50, 25,       // Different browser position
  1600, 900,    // Standard viewport
  1.0           // No DPI scaling
);

const calculator = new BrowserPositionCalculator();

// Transform point from source to target environment
const sourcePoint = { x: 1500, y: 800 };
const targetPoint = calculator.calculateTargetPosition(
  sourcePoint, 
  sourceConfig, 
  targetConfig
);

console.log('Transformed point:', targetPoint);
```

### Visibility Checking

Check if a point is visible within the browser viewport:

```typescript
const screenPoint = { x: 1500, y: 800 };
const isVisible = calculator.isPointVisible(screenPoint, config);

if (isVisible) {
  console.log('Point is visible in browser window');
} else {
  console.log('Point is outside browser viewport');
}
```

### Browser Edge Calculation

Calculate where browser edges appear in different coordinate systems:

```typescript
const edges = calculator.calculateBrowserEdges(sourceConfig, targetConfig);

console.log('Browser edges in target screen coordinates:');
console.log(`Top-left: (${edges.left}, ${edges.top})`);
console.log(`Bottom-right: (${edges.right}, ${edges.bottom})`);
```

## Working with Transformations Directly

### Individual Transformations

For more control, use individual transformation classes:

```typescript
import { 
  ScreenToBrowserTransformation,
  BrowserToLogicalTransformation 
} from 'browser-coordinate-kit';

// Create individual transformations
const screenToBrowser = new ScreenToBrowserTransformation({ x: 100, y: 50 });
const browserToLogical = new BrowserToLogicalTransformation(1.25);

// Apply transformations step by step
const screenPoint = { x: 500, y: 300 };
const browserPoint = screenToBrowser.transform(screenPoint);
const logicalPoint = browserToLogical.transform(browserPoint);

console.log('Step-by-step transformation:');
console.log(`Screen: (${screenPoint.x}, ${screenPoint.y})`);
console.log(`Browser: (${browserPoint.x}, ${browserPoint.y})`);  
console.log(`Logical: (${logicalPoint.x}, ${logicalPoint.y})`);
```

### Composite Transformations

Combine multiple transformations efficiently:

```typescript
import { CompositeTransformation } from 'browser-coordinate-kit';

// Create composite transformation
const composite = new CompositeTransformation([
  screenToBrowser,
  browserToLogical
]);

// Single transformation call
const result = composite.transform(screenPoint);
console.log('Composite result:', result);

// Inverse transformation
const inverse = composite.getInverse();
const originalPoint = inverse.transform(result);
console.log('Round-trip result:', originalPoint);
```

## Error Handling

### Input Validation

BrowserCoordinateKit validates inputs to prevent mathematical errors:

```typescript
try {
  // This will throw an error if DPI scaling is zero
  const invalidConfig = CoordinateUtils.createDisplayConfig(
    1920, 1080, 100, 50, 1600, 900, 0  // Invalid: zero DPI scaling
  );
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

### Precision Considerations

Be aware of floating-point precision limits:

```typescript
// For high-precision applications, check transformation accuracy
const transformed = calculator.calculateTargetPosition(point, source, target);
const roundTrip = calculator.calculateSourcePosition(transformed, source, target);

const precision = Math.max(
  Math.abs(point.x - roundTrip.x),
  Math.abs(point.y - roundTrip.y)
);

if (precision > 1e-10) {
  console.warn('Precision loss detected:', precision);
}
```

## Next Steps

### Advanced Features

1. **[Calibration System](calibration-guide.md)**: Correct systematic positioning errors
2. **[Integration Guide](integration-guide.md)**: Work with MouseWont and Playwright
3. **[Advanced Usage](advanced-usage.md)**: Performance optimisation and custom strategies

### API Reference

- **[Core Classes](../api/core-classes.md)**: Detailed API documentation
- **[Transformations](../api/transformations.md)**: Individual transformation classes
- **[Utilities](../api/utilities.md)**: Helper functions and utilities

### Mathematical Foundation

- **[Theoretical Foundation](../mathematical/theoretical-foundation.md)**: Deep dive into Malloy's mathematical framework
- **[Validation System](../mathematical/validation-system.md)**: How mathematical correctness is ensured

---

*BrowserCoordinateKit provides mathematically proven coordinate transformations. Start with basic transformations and gradually explore advanced features as your needs grow.*