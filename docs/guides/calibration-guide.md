# Calibration Guide

## Overview

The calibration system in BrowserCoordinateKit corrects systematic positioning errors using **mathematical transformation matrices**. Built upon Malloy's mathematical framework, it provides multiple calibration methods to achieve precise coordinate accuracy.

## Why Calibration?

Even with mathematically perfect transformations, real-world factors can introduce positioning errors:

- **Hardware variations**: Different mouse sensors and screen technologies
- **Browser differences**: Rendering variations between browsers
- **System configuration**: Operating system-specific coordinate handling
- **Hardware acceleration**: GPU-specific coordinate processing

The calibration system mathematically corrects these systematic errors.

## Calibration Types

### 1. Offset Calibration

**Use case**: Uniform coordinate offset across the entire display
**Mathematical model**: `T(p) = p + offset`

```typescript
import { CalibrationUtility, CalibrationType } from 'browser-coordinate-kit';

const calibration = new CalibrationUtility();

// Reference points (where clicks should go)
const expectedPoints = [
  { x: 100, y: 100 },
  { x: 500, y: 300 }
];

// Actual measured points (where clicks actually went)
const actualPoints = [
  { x: 105, y: 103 },  // 5px right, 3px down offset
  { x: 505, y: 303 }   // Consistent offset
];

// Perform offset calibration
const result = calibration.calibratePoints(
  actualPoints, 
  expectedPoints, 
  CalibrationType.OFFSET
);

console.log('Offset calibration matrix:', result.matrix);
// Apply to new coordinates
const correctedPoint = result.transform({ x: 300, y: 200 });
```

### 2. Scale Calibration

**Use case**: Uniform scaling differences (e.g., DPI miscalculation)
**Mathematical model**: `T(p) = scale * p + offset`

```typescript
// Different scaling in X and Y directions
const expectedPoints = [
  { x: 0, y: 0 },
  { x: 1000, y: 0 },
  { x: 0, y: 600 },
  { x: 1000, y: 600 }
];

const actualPoints = [
  { x: 2, y: 1 },      // Small offset
  { x: 1005, y: 2 },   // Slight X scaling error
  { x: 1, y: 598 },    // Slight Y scaling error  
  { x: 1006, y: 599 }
];

const scaleResult = calibration.calibratePoints(
  actualPoints,
  expectedPoints, 
  CalibrationType.SCALE
);

console.log('Scale factors:', {
  x: scaleResult.matrix[0][0],
  y: scaleResult.matrix[1][1],
  offsetX: scaleResult.matrix[0][2],
  offsetY: scaleResult.matrix[1][2]
});
```

### 3. Affine Calibration

**Use case**: Complex transformations including rotation and skew
**Mathematical model**: `T(p) = A * p + b` (full 2D affine transformation)

```typescript
// Points with rotation and skew errors
const expectedPoints = [
  { x: 100, y: 100 },
  { x: 400, y: 100 },
  { x: 100, y: 300 },
  { x: 400, y: 300 }
];

const actualPoints = [
  { x: 102, y: 98 },   // Slight rotation
  { x: 403, y: 105 },  // and skew
  { x: 98, y: 302 },
  { x: 401, y: 309 }
];

const affineResult = calibration.calibratePoints(
  actualPoints,
  expectedPoints,
  CalibrationType.AFFINE
);

// Full 2x3 affine transformation matrix
console.log('Affine transformation matrix:');
console.log(affineResult.matrix);
```

### 4. Perspective Calibration

**Use case**: Complex perspective distortions (advanced displays, projectors)
**Mathematical model**: Homographic transformation with perspective division

```typescript
// Eight corresponding points for perspective calibration
const expectedPoints = [
  { x: 0, y: 0 }, { x: 800, y: 0 }, { x: 1600, y: 0 },
  { x: 0, y: 400 }, { x: 800, y: 400 }, { x: 1600, y: 400 },
  { x: 0, y: 800 }, { x: 800, y: 800 }, { x: 1600, y: 800 }
];

// Perspective-distorted actual points
const actualPoints = [
  { x: 5, y: 2 }, { x: 798, y: 5 }, { x: 1595, y: 8 },
  { x: 3, y: 399 }, { x: 800, y: 401 }, { x: 1598, y: 403 },
  { x: 1, y: 797 }, { x: 802, y: 799 }, { x: 1601, y: 801 }
];

const perspectiveResult = calibration.calibratePoints(
  actualPoints,
  expectedPoints,
  CalibrationType.PERSPECTIVE
);
```

## Calibration Workflow

### 1. Generate Calibration Points

```typescript
import { CalibrationUtility } from 'browser-coordinate-kit';

const calibration = new CalibrationUtility();

// Generate grid of calibration points
const bounds = { x: 0, y: 0, width: 1600, height: 900 };
const gridSize = 4; // 4x4 grid = 16 points

const calibrationPoints = calibration.generateCalibrationPoints(bounds, gridSize);

console.log('Calibration points to test:');
calibrationPoints.forEach((point, index) => {
  console.log(`Point ${index + 1}: (${point.x}, ${point.y})`);
});
```

### 2. Collect Actual Points

In your application, present each calibration point to the user and record where they actually click:

```typescript
// Pseudo-code for calibration data collection
const collectCalibrationData = async (calibrationPoints) => {
  const actualPoints = [];
  
  for (const expectedPoint of calibrationPoints) {
    // Display target at expectedPoint
    showCalibrationTarget(expectedPoint);
    
    // Wait for user click and record actual position
    const actualPoint = await waitForUserClick();
    actualPoints.push(actualPoint);
    
    hideCalibrationTarget();
  }
  
  return actualPoints;
};
```

### 3. Perform Calibration

```typescript
// After collecting data
const actualPoints = await collectCalibrationData(calibrationPoints);

// Choose appropriate calibration type based on error analysis
const calibrationType = analyseErrorPattern(calibrationPoints, actualPoints);

const calibrationResult = calibration.calibratePoints(
  actualPoints,
  calibrationPoints,
  calibrationType
);

// Validate calibration quality
const quality = validateCalibrationQuality(calibrationResult);
console.log(`Calibration quality: ${quality.score}/100`);
```

### 4. Apply Calibration

```typescript
// Use calibration for coordinate correction
const correctCoordinates = (rawPoint) => {
  return calibrationResult.transform(rawPoint);
};

// Example usage
const rawMousePosition = { x: 750, y: 400 };
const correctedPosition = correctCoordinates(rawMousePosition);

console.log(`Raw: (${rawMousePosition.x}, ${rawMousePosition.y})`);
console.log(`Corrected: (${correctedPosition.x}, ${correctedPosition.y})`);
```

## Calibration Persistence

### Save and Load Calibration

```typescript
// Save calibration for later use
calibration.saveCalibration(calibrationResult, 'primary_display');

// Load calibration in future sessions
const savedCalibration = calibration.loadCalibration('primary_display');

if (savedCalibration) {
  console.log('Using saved calibration');
  // Apply saved calibration
} else {
  console.log('No calibration found, using default coordinates');
}
```

### Calibration Metadata

```typescript
// Store calibration with metadata
const calibrationMetadata = {
  timestamp: Date.now(),
  displayConfig: config,
  calibrationType: CalibrationType.AFFINE,
  quality: quality.score,
  pointCount: calibrationPoints.length
};

calibration.saveCalibrationWithMetadata(
  calibrationResult, 
  'primary_display',
  calibrationMetadata
);
```

## Advanced Calibration Features

### Multi-Region Calibration

For displays with non-uniform distortion:

```typescript
// Define multiple calibration regions
const regions = [
  { name: 'top_left', bounds: { x: 0, y: 0, width: 800, height: 450 } },
  { name: 'top_right', bounds: { x: 800, y: 0, width: 800, height: 450 } },
  { name: 'bottom_left', bounds: { x: 0, y: 450, width: 800, height: 450 } },
  { name: 'bottom_right', bounds: { x: 800, y: 450, width: 800, height: 450 } }
];

const regionCalibrations = {};

for (const region of regions) {
  const regionPoints = calibration.generateCalibrationPoints(region.bounds, 3);
  const regionActual = await collectCalibrationData(regionPoints);
  
  regionCalibrations[region.name] = calibration.calibratePoints(
    regionActual,
    regionPoints,
    CalibrationType.AFFINE
  );
}

// Apply region-specific calibration
const applyRegionCalibration = (point) => {
  const region = determineRegion(point, regions);
  return regionCalibrations[region.name].transform(point);
};
```

### Dynamic Calibration Updates

Continuously improve calibration based on user interactions:

```typescript
class AdaptiveCalibration {
  private baseCalibration: CalibrationResult;
  private errorHistory: Array<{expected: Point, actual: Point}> = [];

  addErrorSample(expected: Point, actual: Point) {
    this.errorHistory.push({expected, actual});
    
    // Update calibration when enough samples collected
    if (this.errorHistory.length >= 10) {
      this.updateCalibration();
    }
  }

  private updateCalibration() {
    const expectedPoints = this.errorHistory.map(e => e.expected);
    const actualPoints = this.errorHistory.map(e => e.actual);
    
    // Combine with base calibration
    const updatedCalibration = this.mergeCalibrations(
      this.baseCalibration,
      this.calibratePoints(actualPoints, expectedPoints, CalibrationType.AFFINE)
    );
    
    this.baseCalibration = updatedCalibration;
    this.errorHistory = []; // Reset for next batch
  }
}
```

## Calibration Quality Assessment

### Error Metrics

```typescript
const assessCalibrationQuality = (calibration: CalibrationResult, testPoints: Point[], expectedPoints: Point[]) => {
  const errors = testPoints.map((point, index) => {
    const transformed = calibration.transform(point);
    const expected = expectedPoints[index];
    
    return {
      distance: Math.sqrt(
        Math.pow(transformed.x - expected.x, 2) + 
        Math.pow(transformed.y - expected.y, 2)
      ),
      x: Math.abs(transformed.x - expected.x),
      y: Math.abs(transformed.y - expected.y)
    };
  });

  return {
    meanError: errors.reduce((sum, e) => sum + e.distance, 0) / errors.length,
    maxError: Math.max(...errors.map(e => e.distance)),
    rmsError: Math.sqrt(errors.reduce((sum, e) => sum + e.distance * e.distance, 0) / errors.length),
    score: Math.max(0, 100 - errors.reduce((sum, e) => sum + e.distance, 0) / errors.length)
  };
};
```

### Calibration Validation

```typescript
// Validate calibration using cross-validation
const validateCalibration = (points: Point[], expectedPoints: Point[], calibrationType: CalibrationType) => {
  const foldSize = Math.floor(points.length / 5); // 5-fold cross-validation
  const validationResults = [];

  for (let i = 0; i < 5; i++) {
    const testStart = i * foldSize;
    const testEnd = (i + 1) * foldSize;
    
    // Split into training and testing sets
    const trainingPoints = [...points.slice(0, testStart), ...points.slice(testEnd)];
    const trainingExpected = [...expectedPoints.slice(0, testStart), ...expectedPoints.slice(testEnd)];
    const testPoints = points.slice(testStart, testEnd);
    const testExpected = expectedPoints.slice(testStart, testEnd);
    
    // Train calibration on training set
    const foldCalibration = calibration.calibratePoints(
      trainingPoints,
      trainingExpected,
      calibrationType
    );
    
    // Test on validation set
    const quality = assessCalibrationQuality(foldCalibration, testPoints, testExpected);
    validationResults.push(quality);
  }
  
  return {
    meanAccuracy: validationResults.reduce((sum, r) => sum + r.score, 0) / validationResults.length,
    stability: Math.min(...validationResults.map(r => r.score)) // Worst case performance
  };
};
```

---

*The calibration system ensures that BrowserCoordinateKit maintains precise accuracy even in the presence of systematic hardware or software variations, using mathematically proven transformation methods.*