/**
 * Script to validate the symbolic mathematics against the actual implementation
 * by performing symbolic computation and comparing with runtime results.
 */

import * as fs from 'fs';
import * as path from 'path';
import { SymbolicExtractor, SymbolicExpression, TransformationType } from '../src/utils/symbolic/SymbolicExtractor';
import { Point, Dimensions } from '../src/core/types';
import { ScreenToNormalizedTransformation } from '../src/transformations/screenToNormalized';
import { NormalizedToScreenTransformation } from '../src/transformations/normalizedToScreen';
import { ScreenToBrowserTransformation } from '../src/transformations/screenToBrowser';
import { BrowserToScreenTransformation } from '../src/transformations/browserToScreen';
import { BrowserToLogicalTransformation } from '../src/transformations/browserToLogical';
import { LogicalToBrowserTransformation } from '../src/transformations/logicalToBrowser';

// Import MathJS for symbolic computation
// Note: In an actual implementation, you would need to install mathjs: npm install mathjs
import * as math from 'mathjs';

// Directory to save output
const OUTPUT_DIR = path.join(__dirname, '..', 'outputs', 'mathematics', 'validation');

// Create outputs directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Test case for validating a transformation
 */
interface TestCase {
  name: string;
  input: Point;
  parameters: any;
  transformationClass: any;
  symbolicFormula: string;
  latexFormula: string;
}

/**
 * Test result comparing symbolic and actual computations
 */
interface TestResult {
  name: string;
  input: Point;
  symbolicOutput: Point;
  actualOutput: Point;
  difference: Point;
  isValid: boolean;
  tolerance: number;
  parameters: any;
  symbolicFormula: string;
  latexFormula: string;
}

/**
 * Get test cases for different transformations
 */
function getTestCases(): TestCase[] {
  const testCases: TestCase[] = [];
  
  // Screen to Normalized test case
  const screenDimensions: Dimensions = { width: 1920, height: 1080 };
  testCases.push({
    name: 'Screen to Normalized',
    input: { x: 960, y: 540 },
    parameters: { screenDimensions },
    transformationClass: ScreenToNormalizedTransformation,
    symbolicFormula: 'x/width, y/height',
    latexFormula: '\\frac{x_{s_i}}{s_{wi}}, \\frac{y_{s_i}}{s_{hi}}'
  });
  
  // Normalized to Screen test case
  testCases.push({
    name: 'Normalized to Screen',
    input: { x: 0.5, y: 0.5 },
    parameters: { screenDimensions },
    transformationClass: NormalizedToScreenTransformation,
    symbolicFormula: 'x*width, y*height',
    latexFormula: 'x_n \\cdot s_{wi}, y_n \\cdot s_{hi}'
  });
  
  // Screen to Browser test case
  const browserPosition: Point = { x: 100, y: 50 };
  testCases.push({
    name: 'Screen to Browser',
    input: { x: 960, y: 540 },
    parameters: { browserPosition },
    transformationClass: ScreenToBrowserTransformation,
    symbolicFormula: 'x - browserX, y - browserY',
    latexFormula: 'x_{s_i} - b_{xi}, y_{s_i} - b_{yi}'
  });
  
  // Browser to Screen test case
  testCases.push({
    name: 'Browser to Screen',
    input: { x: 860, y: 490 },
    parameters: { browserPosition },
    transformationClass: BrowserToScreenTransformation,
    symbolicFormula: 'x + browserX, y + browserY',
    latexFormula: 'x_{b_i} + b_{xi}, y_{b_i} + b_{yi}'
  });
  
  // Browser to Logical test case
  const dpiScaling = 1.5;
  testCases.push({
    name: 'Browser to Logical',
    input: { x: 860, y: 490 },
    parameters: { dpiScaling },
    transformationClass: BrowserToLogicalTransformation,
    symbolicFormula: 'x/dpiScaling, y/dpiScaling',
    latexFormula: '\\frac{x_{b_i}}{\\sigma_i}, \\frac{y_{b_i}}{\\sigma_i}'
  });
  
  // Logical to Browser test case
  testCases.push({
    name: 'Logical to Browser',
    input: { x: 573.33, y: 326.67 },
    parameters: { dpiScaling },
    transformationClass: LogicalToBrowserTransformation,
    symbolicFormula: 'x*dpiScaling, y*dpiScaling',
    latexFormula: 'x_{l_i} \\cdot \\sigma_i, y_{l_i} \\cdot \\sigma_i'
  });
  
  return testCases;
}

/**
 * Compute the symbolic output for a transformation
 */
function computeSymbolicOutput(testCase: TestCase): Point {
  const { input, parameters, symbolicFormula } = testCase;
  
  // Create a context with the input variables and parameters
  const context: any = {
    x: input.x,
    y: input.y,
  };
  
  // Add parameters to context
  if (parameters.screenDimensions) {
    context.width = parameters.screenDimensions.width;
    context.height = parameters.screenDimensions.height;
  }
  if (parameters.browserPosition) {
    context.browserX = parameters.browserPosition.x;
    context.browserY = parameters.browserPosition.y;
  }
  if (parameters.dpiScaling) {
    context.dpiScaling = parameters.dpiScaling;
  }
  
  // Parse and evaluate the symbolic formula
  try {
    // Split formula for x and y components
    const [xFormula, yFormula] = symbolicFormula.split(', ');
    
    // Evaluate each component
    const xResult = math.evaluate(xFormula, context);
    const yResult = math.evaluate(yFormula, context);
    
    return { x: xResult, y: yResult };
  } catch (error) {
    console.error(`Error evaluating symbolic formula for ${testCase.name}:`, error);
    return { x: NaN, y: NaN };
  }
}

/**
 * Compute the actual output using the implementation
 */
function computeActualOutput(testCase: TestCase): Point {
  const { input, parameters, transformationClass } = testCase;
  
  // Create an instance of the transformation class
  let transformation;
  if (parameters.screenDimensions) {
    transformation = new transformationClass(parameters.screenDimensions);
  } else if (parameters.browserPosition) {
    transformation = new transformationClass(parameters.browserPosition);
  } else if (parameters.dpiScaling) {
    transformation = new transformationClass(parameters.dpiScaling);
  } else {
    transformation = new transformationClass();
  }
  
  // Apply the transformation
  return transformation.transform(input);
}

/**
 * Validate a test case and return the result
 */
function validateTestCase(testCase: TestCase): TestResult {
  const symbolicOutput = computeSymbolicOutput(testCase);
  const actualOutput = computeActualOutput(testCase);
  
  // Calculate the difference
  const difference = {
    x: Math.abs(symbolicOutput.x - actualOutput.x),
    y: Math.abs(symbolicOutput.y - actualOutput.y)
  };
  
  // Check if the outputs match within tolerance
  const tolerance = 0.00001;
  const isValid = difference.x <= tolerance && difference.y <= tolerance;
  
  return {
    name: testCase.name,
    input: testCase.input,
    symbolicOutput,
    actualOutput,
    difference,
    isValid,
    tolerance,
    parameters: testCase.parameters,
    symbolicFormula: testCase.symbolicFormula,
    latexFormula: testCase.latexFormula
  };
}

/**
 * Generate HTML report for the validation results
 */
function generateHtmlReport(results: TestResult[]): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <title>Symbolic Mathematics Validation</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.5; }
    h1, h2, h3 { color: #333; }
    .result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .valid { background-color: #dff0d8; }
    .invalid { background-color: #f2dede; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .formula { font-family: 'Times New Roman', serif; margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 4px; }
    .parameter { font-family: monospace; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; color: #777; }
  </style>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  <h1>Symbolic Mathematics Validation</h1>
  <p>This report compares symbolic mathematical calculations with actual implementation results.</p>
  
  <h2>Summary</h2>
  <p>${results.filter(r => r.isValid).length} of ${results.length} transformations validated successfully.</p>
  
`;

  // Add each test result
  for (const result of results) {
    html += `
  <div class="result ${result.isValid ? 'valid' : 'invalid'}">
    <h3>${result.name} Transformation</h3>
    
    <h4>Mathematical Formula</h4>
    <div class="formula">
      <p>Symbolic: ${result.symbolicFormula}</p>
      <p>LaTeX: \\(${result.latexFormula}\\)</p>
    </div>
    
    <h4>Parameters</h4>
    <ul>
`;

    // Add parameters
    if (result.parameters.screenDimensions) {
      html += `      <li><span class="parameter">screenDimensions</span>: width=${result.parameters.screenDimensions.width}, height=${result.parameters.screenDimensions.height}</li>\n`;
    }
    if (result.parameters.browserPosition) {
      html += `      <li><span class="parameter">browserPosition</span>: x=${result.parameters.browserPosition.x}, y=${result.parameters.browserPosition.y}</li>\n`;
    }
    if (result.parameters.dpiScaling) {
      html += `      <li><span class="parameter">dpiScaling</span>: ${result.parameters.dpiScaling}</li>\n`;
    }

    html += `    </ul>
    
    <h4>Calculation Results</h4>
    <table>
      <tr>
        <th>Calculation</th>
        <th>x</th>
        <th>y</th>
      </tr>
      <tr>
        <td>Input</td>
        <td>${result.input.x}</td>
        <td>${result.input.y}</td>
      </tr>
      <tr>
        <td>Symbolic Output</td>
        <td>${result.symbolicOutput.x}</td>
        <td>${result.symbolicOutput.y}</td>
      </tr>
      <tr>
        <td>Actual Output</td>
        <td>${result.actualOutput.x}</td>
        <td>${result.actualOutput.y}</td>
      </tr>
      <tr>
        <td>Difference</td>
        <td>${result.difference.x}</td>
        <td>${result.difference.y}</td>
      </tr>
    </table>
    
    <p><strong>Validation:</strong> ${result.isValid ? 'Passed' : 'Failed'} (tolerance: ${result.tolerance})</p>
  </div>
`;
  }

  // Close the HTML
  html += `
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString()} by BrowserCoordinateKit</p>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Generate JSON report for validation results
 */
function generateJsonReport(results: TestResult[]): string {
  return JSON.stringify({
    validationResults: results,
    summary: {
      total: results.length,
      valid: results.filter(r => r.isValid).length,
      invalid: results.filter(r => !r.isValid).length,
      timestamp: new Date().toISOString()
    }
  }, null, 2);
}

/**
 * Main function to run the validation
 */
function main() {
  console.log('Validating symbolic mathematics...');
  
  // Get test cases
  const testCases = getTestCases();
  
  // Validate each test case
  const results = testCases.map(validateTestCase);
  
  // Generate reports
  const htmlReport = generateHtmlReport(results);
  const jsonReport = generateJsonReport(results);
  
  // Write reports to files
  fs.writeFileSync(path.join(OUTPUT_DIR, 'validation.html'), htmlReport);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'validation.json'), jsonReport);
  
  // Print summary
  console.log(`Validation complete: ${results.filter(r => r.isValid).length} of ${results.length} transformations validated successfully.`);
  console.log(`Reports saved to ${OUTPUT_DIR}`);
  
  // Log any failures
  const failures = results.filter(r => !r.isValid);
  if (failures.length > 0) {
    console.log('\nFailures:');
    for (const failure of failures) {
      console.log(`- ${failure.name}: symbolic=${JSON.stringify(failure.symbolicOutput)}, actual=${JSON.stringify(failure.actualOutput)}`);
    }
  }
}

// Run the validation
main();