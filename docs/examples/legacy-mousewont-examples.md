# Using BrowserCoordinateKit with MouseWont

Using MouseWont (https://github.com/schebz/MouseWont), a library for simulating human-like mouse movements. 
This pairs perfectly with our coordinate transformation framework.

## Integration Examples

### Example 1: Basic Position Transformation and Movement

```typescript
import { BrowserPositionCalculator, CoordinateUtils } from 'BrowserCoordinateKit';
import { createMouseMovementSimulator } from 'MouseWont';

// Setup configurations
const sourceConfig = CoordinateUtils.createDisplayConfig(
  2560, 1440,   // Original screen dimensions
  100, 50,      // Original browser position
  2000, 1000,   // Original viewport dimensions
  2             // Original DPI scaling
);

// Create calculator
const calculator = new BrowserPositionCalculator();

// Define target position in screen coordinates
const targetScreenPosition = { x: 2065, y: 539 };

// Check if position is visible in browser
if (calculator.isPointVisible(targetScreenPosition, sourceConfig)) {
  // Convert to logical coordinates for browser interaction
  const targetLogicalPosition = calculator.calculateTargetPosition(
    targetScreenPosition,
    sourceConfig,
    sourceConfig
  );
  
  // Get current mouse position
  const currentPosition = { x: 500, y: 300 }; // This would come from your actual mouse position
  
  // Create MouseWont simulator
  const simulator = createMouseMovementSimulator();
  
  // Move mouse from current position to target with human-like movement
  simulator.move(currentPosition, targetLogicalPosition, {
    gravityCurvature: 0.2,
    jitterFactor: 10,
    speedVariation: true,
    overshootChance: 0.3
  });
}
```

### Example 2: Cross-Screen Movement Simulation

```typescript
import { BrowserPositionCalculator, CoordinateUtils } from 'BrowserCoordinateKit';
import { createMouseMovementSimulator } from 'MouseWont';

// Set up the mouse simulator
const simulator = createMouseMovementSimulator();

// Function to handle cross-screen movements
async function navigateAcrossScreens(
  startPoint: Point,
  endPoint: Point,
  sourceConfig: DisplayConfiguration,
  targetConfig: DisplayConfiguration
) {
  const calculator = new BrowserPositionCalculator();
  
  // 1. First calculate the end point in the target coordinates
  const endPointInTargetCoords = calculator.calculateTargetPosition(
    endPoint,
    sourceConfig,
    targetConfig
  );
  
  // 2. Define step points between screens (e.g., moving to edge of first screen)
  const sourceEdges = calculator.calculateBrowserEdges(sourceConfig, sourceConfig);
  const edgePoint = {
    x: startPoint.x < endPoint.x ? sourceEdges.right - 5 : sourceEdges.left + 5,
    y: startPoint.y
  };
  
  // 3. Move to the edge of the first screen
  await simulator.move(startPoint, edgePoint, {
    gravityCurvature: 0.3,
    jitterFactor: 5
  });
  
  // 4. Now simulate moving to the second screen
  const entryPoint = {
    x: edgePoint.x < endPoint.x ? targetConfig.browserPosition.x + 5 : 
                                  targetConfig.browserPosition.x + targetConfig.viewportDimensions.width * targetConfig.dpiScaling - 5,
    y: edgePoint.y
  };
  
  // 5. We're now on the target screen, complete movement to final destination
  await simulator.move(entryPoint, endPointInTargetCoords, {
    gravityCurvature: 0.1,
    speedVariation: true,
    overshootChance: 0.2
  });
  
  return endPointInTargetCoords;
}
```

### Example 3: Working with iFrames

```typescript
import { BrowserPositionCalculator, CoordinateUtils, createNestedIFrameTransformation } from 'BrowserCoordinateKit';
import { createMouseMovementSimulator } from 'MouseWont';

// Function to click an element in a nested iframe
async function clickElementInNestedIframe(
  elementSelector: string,
  iframeOffsets: Point[],
  config: DisplayConfiguration
) {
  // 1. Set up the calculator and simulator
  const calculator = new BrowserPositionCalculator();
  const simulator = createMouseMovementSimulator();
  
  // 2. Get current mouse position (would come from actual tracking)
  const currentMousePosition = { x: 100, y: 100 };
  
  // 3. Get element position in iframe coordinates (this would come from the actual element)
  const elementPositionInIframe = { x: 250, y: 150 };
  
  // 4. Create iframe transformation
  const iframeTransform = createNestedIFrameTransformation(iframeOffsets);
  
  // 5. Convert iframe coordinates to logical coordinates
  const elementInLogicalCoords = iframeTransform.getInverse().transform(elementPositionInIframe);
  
  // 6. Convert logical to screen coordinates
  const screenToLogical = (point: Point) => calculator.calculateTargetPosition(point, config, config);
  const logicalToScreen = (point: Point) => calculator.calculateSourcePosition(point, config, config);
  
  const elementInScreenCoords = logicalToScreen(elementInLogicalCoords);
  
  // 7. Move mouse to element with human-like movement
  await simulator.move(currentMousePosition, elementInScreenCoords, {
    gravityCurvature: 0.2,
    jitterFactor: 15,
    speedVariation: true
  });
  
  // 8. Perform click after reaching position
  simulator.click(elementInScreenCoords);
}
```

### Example 4: Calibration Process

```typescript
import { CoordinateUtils, BrowserPositionCalculator } from 'BrowserCoordinateKit';
import { createMouseMovementSimulator } from 'MouseWont';

// Function to calibrate the system based on known reference points
async function calibrateSystem() {
  // 1. We need to gather reference points where we know both screen and logical coordinates
  // Let's assume we have a way to get these points (e.g., from browser API + OS API)
  const referencePoint1 = {
    screen: { x: 250, y: 150 },
    logical: { x: 75, y: 50 }
  };
  
  const referencePoint2 = {
    screen: { x: 750, y: 450 },
    logical: { x: 325, y: 200 }
  };
  
  // 2. Calculate browser position based on reference points
  const browserPosition = CoordinateUtils.calculateBrowserPosition(
    referencePoint1.screen,
    referencePoint1.logical,
    2 // Assumed DPI scaling
  );
  
  // 3. Verify DPI scaling factor
  const calculatedDpiScaling = CoordinateUtils.calculateDpiScaling(
    {
      x: referencePoint2.screen.x - browserPosition.x,
      y: referencePoint2.screen.y - browserPosition.y
    },
    referencePoint2.logical
  );
  
  console.log("Calculated browser position:", browserPosition);
  console.log("Calculated DPI scaling:", calculatedDpiScaling);
  
  // 4. Create configuration based on calculated values
  const screenDimensions = { width: 2560, height: 1440 }; // This would come from actual screen
  const viewportDimensions = { 
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight
  };
  
  const config = {
    screenDimensions,
    browserPosition,
    viewportDimensions,
    dpiScaling: calculatedDpiScaling
  };
  
  // 5. Test the calibration by moving the mouse to a specific logical position
  const targetLogicalPosition = { x: 200, y: 300 };
  const calculator = new BrowserPositionCalculator();
  const targetScreenPosition = calculator.calculateSourcePosition(
    targetLogicalPosition,
    config,
    config
  );
  
  const simulator = createMouseMovementSimulator();
  await simulator.move(referencePoint1.screen, targetScreenPosition, {
    gravityCurvature: 0.2,
    jitterFactor: 8
  });
  
  return config;
}
```

## Key Integration Points

1. **BrowserCoordinateKit calculates positions, MouseWont creates the path between them**
    - BrowserCoordinateKit handles the mathematical transformations
    - MouseWont provides the natural mouse movement simulation

2. **Workflow**:
    - Use BrowserCoordinateKit to convert between coordinate systems (screen/logical/browser)
    - Pass the transformed coordinates to MouseWont for movement simulation
    - Handle special cases like iframe navigation with dedicated transformations

3. **Calibration**:
    - BrowserCoordinateKit can help determine the browser position and DPI scaling
    - MouseWont parameters can be tuned based on the screen configuration

4. **Edge Cases**:
    - Use BrowserCoordinateKit's edge detection to handle screen boundaries
    - Combine with MouseWont's path generation for realistic cross-screen movements

5. **iFrame Handling**:
    - BrowserCoordinateKit provides transformations for nested iframes
    - MouseWont can simulate the precise movements needed for iframe interactions

By combining these two libraries, you create a powerful system that can both calculate the exact coordinates across different display configurations and simulate realistic human-like mouse movements between those coordinates.