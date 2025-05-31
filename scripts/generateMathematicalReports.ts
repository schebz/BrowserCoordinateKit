/**
 * Script to extract all mathematical expressions from the codebase,
 * validate them against the implementation, and generate comprehensive reports.
 */

import * as path from 'path';
import * as fs from 'fs';
import { SymbolicExtractor } from '../src/utils/symbolic/SymbolicExtractor';
import * as math from 'mathjs';
import { Point, Dimensions } from '../src/core/types';
import { ScreenToNormalizedTransformation } from '../src/transformations/screenToNormalized';
import { NormalizedToScreenTransformation } from '../src/transformations/normalizedToScreen';
import { ScreenToBrowserTransformation } from '../src/transformations/screenToBrowser';
import { BrowserToScreenTransformation } from '../src/transformations/browserToScreen';
import { BrowserToLogicalTransformation } from '../src/transformations/browserToLogical';
import { LogicalToBrowserTransformation } from '../src/transformations/logicalToBrowser';

// Output directories
const BASE_OUTPUT_DIR = path.join(__dirname, '..', 'outputs', 'mathematics');
const VALIDATION_DIR = path.join(BASE_OUTPUT_DIR, 'validation');
const VISUALIZATION_DIR = path.join(BASE_OUTPUT_DIR, 'visualizations');

// Create output directories if they don't exist
[BASE_OUTPUT_DIR, VALIDATION_DIR, VISUALIZATION_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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

// Create the symbolic extractor
console.log('Creating symbolic extractor...');
const extractor = new SymbolicExtractor(
  path.join(__dirname, '..', 'Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex')
);

// Step 1: Process all source files
function processSourceFiles() {
  console.log('Processing source files...');
  
  // Explicitly list directories to avoid regex issues
  const directories = [
    path.join(__dirname, '..', 'src', 'transformations'),
    path.join(__dirname, '..', 'src', 'utils'),
    path.join(__dirname, '..', 'src', 'core'),
    path.join(__dirname, '..', 'src', 'calibration'),
    path.join(__dirname, '..', 'src', 'detection'),
    path.join(__dirname, '..', 'src', 'strategies')
  ];
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.ts')) {
          const filePath = path.join(dir, file);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            extractor.extractFromSource(content, filePath);
          } catch (err) {
            console.error(`Error processing ${filePath}: ${err}`);
          }
        }
      });
    } else {
      console.log(`Directory not found: ${dir}`);
    }
  });
}

// Step 2: Generate test cases for each transformation type
function getTestCases(): TestCase[] {
  console.log('Generating test cases...');
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

// Step 3: Compute symbolic output using mathjs
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

// Step 4: Compute actual output using implementation
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

// Step 5: Validate test cases
function validateTestCases(testCases: TestCase[]): TestResult[] {
  console.log('Validating test cases...');
  return testCases.map(testCase => {
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
  });
}

// Step 6: Generate report
function generateHtmlReport(results: TestResult[]): string {
  console.log('Generating HTML report...');
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
    .nav { margin: 20px 0; }
    .nav a { margin-right: 15px; text-decoration: none; }
  </style>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  <h1>Symbolic Mathematics Validation</h1>
  <p>This report compares symbolic mathematical calculations with actual implementation results.</p>

  <div class="nav">
    <a href="../index.html">Mathematical Overview</a>
    <a href="../visualizations/index.html">Visualizations</a>
  </div>
  
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

// Step 7: Generate overall index page
function generateIndexHtml(validationResults: TestResult[]): string {
  console.log('Generating index HTML...');
  const validCount = validationResults.filter(r => r.isValid).length;
  const totalCount = validationResults.length;
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>BrowserCoordinateKit Mathematical Foundations</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.5; }
    h1, h2, h3 { color: #333; }
    .card { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .progress { width: 100%; background-color: #e0e0e0; border-radius: 4px; margin: 10px 0; }
    .progress-bar { height: 20px; background-color: #4CAF50; border-radius: 4px; color: white; text-align: center; }
    .nav { margin: 20px 0; }
    .nav a { margin-right: 15px; text-decoration: none; }
    .overview { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; color: #777; }
  </style>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  <h1>BrowserCoordinateKit Mathematical Foundations</h1>
  <p>This page provides an overview of the mathematical foundations of the BrowserCoordinateKit library.</p>

  <div class="nav">
    <a href="validation/validation.html">Symbolic Validations</a>
    <a href="visualizations/index.html">Visualizations</a>
  </div>
  
  <div class="card">
    <h2>Symbolic Validation Summary</h2>
    <p>${validCount} of ${totalCount} transformations validated successfully.</p>
    <div class="progress">
      <div class="progress-bar" style="width: ${(validCount / totalCount * 100).toFixed(1)}%">
        ${(validCount / totalCount * 100).toFixed(1)}%
      </div>
    </div>
  </div>
  
  <div class="overview">
    <h2>Mathematical Foundation Overview</h2>
    <p>The BrowserCoordinateKit library is based on a rigorous mathematical framework for calculating 
    positions in browser windows, taking into account display and browser properties:</p>
    
    <h3>Coordinate Systems</h3>
    <ol>
      <li><strong>Screen Coordinates (S)</strong>: Physical pixel positions on the screen, with origin at the top-left</li>
      <li><strong>Normalized Coordinates (N)</strong>: Screen-size independent positions in the range [0,1]</li>
      <li><strong>Browser Coordinates (B)</strong>: Physical pixel positions relative to the browser window top-left</li>
      <li><strong>Logical Coordinates (L)</strong>: Browser-internal coordinates after DPI scaling</li>
    </ol>
    
    <h3>Key Transformations</h3>
    <ul>
      <li><strong>Screen ↔ Normalized</strong>: \\(T_{S \\to N}(p_s) = (x_s/s_w, y_s/s_h)\\)</li>
      <li><strong>Screen ↔ Browser</strong>: \\(T_{S \\to B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)\\)</li>
      <li><strong>Browser ↔ Logical</strong>: \\(T_{B \\to L}(p_b) = p_b/\\sigma = (x_b/\\sigma, y_b/\\sigma)\\)</li>
    </ul>
  </div>
  
  <div class="footer">
    <p>Generated on ${new Date().toLocaleDateString()} by BrowserCoordinateKit</p>
  </div>
</body>
</html>`;
}

// Step 8: Generate visualizations (simplified version for now - we'll use GIFs instead of JS)
function generateVisualizationsHtml(): string {
  console.log('Generating visualizations HTML...');
  
  return `<!DOCTYPE html>
<html>
<head>
  <title>BrowserCoordinateKit Transformations Visualizations</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .card { border: 1px solid #ccc; margin: 10px; padding: 15px; border-radius: 5px; }
    .visualization { width: 100%; height: 300px; text-align: center; margin-top: 10px; }
    img { max-width: 100%; max-height: 100%; }
    .nav { margin: 20px 0; }
    .nav a { margin-right: 15px; text-decoration: none; }
  </style>
</head>
<body>
  <h1>BrowserCoordinateKit Transformations</h1>
  <p>This page contains visualizations of the coordinate transformations. In a production implementation, 
  these would be animated GIFs or interactive visualizations.</p>
  
  <div class="nav">
    <a href="../index.html">Mathematical Overview</a>
    <a href="../validation/validation.html">Symbolic Validations</a>
  </div>
  
  <div class="visualizations">
    <div class="card">
      <h2>Screen to Normalized Transformation</h2>
      <p>Converts absolute screen coordinates to normalized [0,1] range</p>
      <div class="visualization">
        <img src="placeholder-screen-to-normalized.png" alt="Screen to Normalized Transformation" />
        <p>T_{S→N}(p_s) = (x_s/s_w, y_s/s_h)</p>
      </div>
    </div>
    
    <div class="card">
      <h2>Screen to Browser Transformation</h2>
      <p>Converts screen coordinates to browser-relative coordinates</p>
      <div class="visualization">
        <img src="placeholder-screen-to-browser.png" alt="Screen to Browser Transformation" />
        <p>T_{S→B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)</p>
      </div>
    </div>
    
    <div class="card">
      <h2>Browser to Logical Transformation</h2>
      <p>Converts browser coordinates to logical coordinates (DPI scaling)</p>
      <div class="visualization">
        <img src="placeholder-browser-to-logical.png" alt="Browser to Logical Transformation" />
        <p>T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)</p>
      </div>
    </div>
  </div>
  
  <p>Note: In a full implementation, Python-based matplotlib visualizations would be used to generate 
  animated GIFs showing these transformations in action.</p>
</body>
</html>`;
}

// Step 9: Create placeholder images for visualizations
function createPlaceholderImages() {
  console.log('Creating placeholder images for visualizations...');
  
  // In a real implementation, these would be generated using matplotlib or another visualization library
  // For now, we'll just create text files as placeholders
  
  const placeholders = [
    'placeholder-screen-to-normalized.png',
    'placeholder-screen-to-browser.png',
    'placeholder-browser-to-logical.png'
  ];
  
  placeholders.forEach(placeholder => {
    fs.writeFileSync(
      path.join(VISUALIZATION_DIR, placeholder), 
      'Placeholder for visualization - would be a GIF in production'
    );
  });
}

// Main function
async function main() {
  console.log('Starting mathematical validation and report generation...');
  
  // Process source files
  processSourceFiles();
  
  // Run validation
  const testCases = getTestCases();
  const validationResults = validateTestCases(testCases);
  
  // Generate validation report
  const validationHtml = generateHtmlReport(validationResults);
  fs.writeFileSync(path.join(VALIDATION_DIR, 'validation.html'), validationHtml);
  
  // Generate JSON report
  const jsonReport = JSON.stringify({
    validationResults,
    summary: {
      total: validationResults.length,
      valid: validationResults.filter(r => r.isValid).length,
      invalid: validationResults.filter(r => !r.isValid).length,
      timestamp: new Date().toISOString()
    }
  }, null, 2);
  fs.writeFileSync(path.join(VALIDATION_DIR, 'validation.json'), jsonReport);
  
  // Generate index HTML
  const indexHtml = generateIndexHtml(validationResults);
  fs.writeFileSync(path.join(BASE_OUTPUT_DIR, 'index.html'), indexHtml);
  
  // Generate visualizations HTML
  const visualizationsHtml = generateVisualizationsHtml();
  fs.writeFileSync(path.join(VISUALIZATION_DIR, 'index.html'), visualizationsHtml);
  
  // Create placeholder images
  createPlaceholderImages();
  
  // Run extractor's validation
  console.log('Running extractor validation...');
  const extractorValidations = extractor.validateImplementations();
  console.log('Extractor validation summary:');
  console.log(`- Total: ${extractorValidations.summary.total}`);
  console.log(`- Valid: ${extractorValidations.summary.valid}`);
  console.log(`- Invalid: ${extractorValidations.summary.invalid}`);
  
  // Generate LaTeX document from extractor
  console.log('Generating LaTeX report...');
  const latex = extractor.exportToLatex();
  fs.writeFileSync(path.join(BASE_OUTPUT_DIR, 'mathematical_expressions.tex'), latex);
  
  // Print final summary
  console.log('\nAll reports generated successfully:');
  console.log(`- Main index: ${path.join(BASE_OUTPUT_DIR, 'index.html')}`);
  console.log(`- Validation report: ${path.join(VALIDATION_DIR, 'validation.html')}`);
  console.log(`- Visualizations: ${path.join(VISUALIZATION_DIR, 'index.html')}`);
  console.log(`- LaTeX document: ${path.join(BASE_OUTPUT_DIR, 'mathematical_expressions.tex')}`);
  
  console.log('\nValidation Results:');
  console.log(`- ${validationResults.filter(r => r.isValid).length} of ${validationResults.length} transformations validated successfully.`);
  
  if (validationResults.filter(r => !r.isValid).length > 0) {
    console.log('\nFailed validations:');
    validationResults.filter(r => !r.isValid).forEach(result => {
      console.log(`- ${result.name}: symbolic=${JSON.stringify(result.symbolicOutput)}, actual=${JSON.stringify(result.actualOutput)}`);
    });
  }
}

// Run the script
main().catch(error => {
  console.error('Error running the script:', error);
  process.exit(1);
});