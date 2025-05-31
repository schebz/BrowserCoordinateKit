# Core Classes API Reference

## BrowserPositionCalculator

The primary class for performing coordinate transformations between different display configurations.

### Constructor

```typescript
new BrowserPositionCalculator(strategy?: CalculationStrategy)
```

**Parameters:**
- `strategy` (optional): Calculation strategy to use (defaults to `TransformationStrategy`)

### Methods

#### calculateTargetPosition

Calculates the target position in target logical coordinates from a source point.

```typescript
calculateTargetPosition(
  sourcePoint: Point, 
  sourceConfig: DisplayConfiguration, 
  targetConfig: DisplayConfiguration
): Point
```

**Parameters:**
- `sourcePoint`: Point in source screen coordinates
- `sourceConfig`: Source display configuration
- `targetConfig`: Target display configuration

**Returns:** Point in target logical coordinates

**Example:**
```typescript
const calculator = new BrowserPositionCalculator();
const sourcePoint = { x: 1500, y: 800 };
const targetPoint = calculator.calculateTargetPosition(
  sourcePoint, sourceConfig, targetConfig
);
```

#### calculateSourcePosition

Calculates the source position in source screen coordinates from a target point.

```typescript
calculateSourcePosition(
  targetPoint: Point, 
  sourceConfig: DisplayConfiguration, 
  targetConfig: DisplayConfiguration
): Point
```

**Parameters:**
- `targetPoint`: Point in target logical coordinates
- `sourceConfig`: Source display configuration  
- `targetConfig`: Target display configuration

**Returns:** Point in source screen coordinates

#### isPointVisible

Checks if a point is visible within the browser viewport.

```typescript
isPointVisible(point: Point, config: DisplayConfiguration): boolean
```

**Parameters:**
- `point`: Point in screen coordinates
- `config`: Display configuration

**Returns:** `true` if point is visible in browser viewport

**Example:**
```typescript
const isVisible = calculator.isPointVisible({ x: 500, y: 300 }, config);
if (!isVisible) {
  console.log('Point is outside browser window');
}
```

#### calculateBrowserEdges

Calculates browser window edges in target screen coordinates.

```typescript
calculateBrowserEdges(
  sourceConfig: DisplayConfiguration, 
  targetConfig: DisplayConfiguration
): BrowserEdges
```

**Returns:** Object with `left`, `top`, `right`, `bottom` properties

#### setStrategy

Changes the calculation strategy.

```typescript
setStrategy(strategy: CalculationStrategy): void
```

**Parameters:**
- `strategy`: New calculation strategy (`TransformationStrategy`, `DirectFormulaStrategy`, etc.)

## CoordinateUtils

Static utility class for coordinate operations and configuration creation.

### Methods

#### createDisplayConfig

Creates a display configuration object.

```typescript
static createDisplayConfig(
  screenWidth: number,
  screenHeight: number,
  browserX: number,
  browserY: number,
  viewportWidth: number,
  viewportHeight: number,
  dpiScaling: number
): DisplayConfiguration
```

**Parameters:**
- `screenWidth`: Screen width in physical pixels
- `screenHeight`: Screen height in physical pixels
- `browserX`: Browser window X position on screen
- `browserY`: Browser window Y position on screen
- `viewportWidth`: Browser viewport width
- `viewportHeight`: Browser viewport height
- `dpiScaling`: DPI scaling factor (e.g., 1.0, 1.25, 2.0)

**Returns:** Complete display configuration object

**Example:**
```typescript
const config = CoordinateUtils.createDisplayConfig(
  1920, 1080,    // Full HD screen
  100, 50,       // Browser at (100, 50)
  1600, 900,     // Viewport size
  1.25           // 125% DPI scaling
);
```

#### calculateBrowserPosition

Calculates browser window position from mouse positions.

```typescript
static calculateBrowserPosition(
  mouseScreenPos: Point,
  mouseLogicalPos: Point,
  dpiScaling: number
): Point
```

**Parameters:**
- `mouseScreenPos`: Mouse position in screen coordinates
- `mouseLogicalPos`: Mouse position in logical coordinates
- `dpiScaling`: DPI scaling factor

**Returns:** Browser window position

#### calculateDpiScaling

Calculates DPI scaling factor from known positions.

```typescript
static calculateDpiScaling(
  browserPos: Point,
  logicalPos: Point
): number
```

**Parameters:**
- `browserPos`: Position in browser coordinates
- `logicalPos`: Same position in logical coordinates

**Returns:** DPI scaling factor

#### calculateScalingFactors

Calculates scaling factors between two screen sizes.

```typescript
static calculateScalingFactors(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): { x: number; y: number }
```

**Returns:** Scaling factors for X and Y dimensions

## CalibrationUtility

Utility class for coordinate calibration and error correction.

### Constructor

```typescript
new CalibrationUtility()
```

### Methods

#### calibratePoints

Performs calibration using reference points.

```typescript
calibratePoints(
  actualPoints: Point[],
  expectedPoints: Point[],
  type: CalibrationType
): CalibrationResult
```

**Parameters:**
- `actualPoints`: Array of actual measured points
- `expectedPoints`: Array of expected target points
- `type`: Calibration type (`OFFSET`, `SCALE`, `AFFINE`, `PERSPECTIVE`)

**Returns:** Calibration result with transformation matrix and `transform()` method

**Example:**
```typescript
const calibration = new CalibrationUtility();
const result = calibration.calibratePoints(
  actualPoints,
  expectedPoints,
  CalibrationType.AFFINE
);

// Apply calibration
const correctedPoint = result.transform({ x: 300, y: 200 });
```

#### generateCalibrationPoints

Generates a grid of calibration points.

```typescript
generateCalibrationPoints(
  bounds: Rectangle,
  gridSize: number
): Point[]
```

**Parameters:**
- `bounds`: Rectangular area for calibration
- `gridSize`: Grid dimension (e.g., 4 creates 4×4 = 16 points)

**Returns:** Array of calibration points

#### saveCalibration

Saves calibration data to local storage.

```typescript
saveCalibration(
  calibration: CalibrationResult,
  key: string
): void
```

#### loadCalibration

Loads calibration data from local storage.

```typescript
loadCalibration(key: string): CalibrationResult | null
```

#### getCalibrationMatrix

Calculates calibration matrix directly.

```typescript
getCalibrationMatrix(
  sourcePoints: Point[],
  targetPoints: Point[]
): number[][]
```

**Returns:** 2D transformation matrix

#### solveLinearSystem

Solves linear system of equations for calibration.

```typescript
solveLinearSystem(A: number[][], b: number[]): number[]
```

**Parameters:**
- `A`: Coefficient matrix
- `b`: Constants vector

**Returns:** Solution vector

## Types and Interfaces

### Point

```typescript
interface Point {
  x: number;
  y: number;
}
```

### Dimensions

```typescript
interface Dimensions {
  width: number;
  height: number;
}
```

### DisplayConfiguration

```typescript
interface DisplayConfiguration {
  screenDimensions: Dimensions;
  browserPosition: Point;
  viewportDimensions: Dimensions;
  dpiScaling: number;
}
```

### BrowserEdges

```typescript
interface BrowserEdges {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
```

### Rectangle

```typescript
interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### CalibrationResult

```typescript
interface CalibrationResult {
  matrix: number[][];
  transform(point: Point): Point;
  getInverse(): CalibrationResult;
  type: CalibrationType;
  quality: number;
}
```

### CalibrationType

```typescript
enum CalibrationType {
  OFFSET = 'offset',
  SCALE = 'scale', 
  AFFINE = 'affine',
  PERSPECTIVE = 'perspective'
}
```

## Usage Examples

### Basic Coordinate Transformation

```typescript
import { BrowserPositionCalculator, CoordinateUtils } from 'browser-coordinate-kit';

const calculator = new BrowserPositionCalculator();
const config = CoordinateUtils.createDisplayConfig(1920, 1080, 0, 0, 1920, 1080, 1.0);

const screenPoint = { x: 960, y: 540 };
const logicalPoint = calculator.calculateTargetPosition(screenPoint, config, config);
```

### Multi-Screen Transformation

```typescript
const laptop = CoordinateUtils.createDisplayConfig(1366, 768, 50, 25, 1200, 650, 1.0);
const monitor = CoordinateUtils.createDisplayConfig(2560, 1440, 100, 50, 2200, 1200, 1.5);

const laptopPoint = { x: 683, y: 384 };  // Centre of laptop
const monitorPoint = calculator.calculateTargetPosition(laptopPoint, laptop, monitor);
```

### Calibration Workflow

```typescript
const calibration = new CalibrationUtility();

// Generate test points
const bounds = { x: 0, y: 0, width: 1600, height: 900 };
const testPoints = calibration.generateCalibrationPoints(bounds, 3);

// Perform calibration (actualPoints would come from user input)
const result = calibration.calibratePoints(actualPoints, testPoints, CalibrationType.AFFINE);

// Apply calibration
const correctedPoint = result.transform({ x: 400, y: 300 });

// Save for future use
calibration.saveCalibration(result, 'primary_display');
```

---

*All core classes maintain mathematical precision and follow Malloy's proven mathematical framework for reliable coordinate transformations.*