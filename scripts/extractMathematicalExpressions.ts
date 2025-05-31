/**
 * Script to extract all mathematical expressions from the codebase
 * and generate reports showing the relationship between implementation
 * and mathematical foundations.
 */

import * as path from 'path';
import * as fs from 'fs';
import { SymbolicExtractor } from '../src/utils/symbolic/SymbolicExtractor';

// Directory to save output
const OUTPUT_DIR = path.join(__dirname, '..', 'outputs', 'mathematics');

// Create outputs directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create the symbolic extractor
const extractor = new SymbolicExtractor(
  path.join(__dirname, '..', 'Extended_Mathematical_Framework_for_Browser_Position_Calculation.tex')
);

// Process the source code
const processSrc = () => {
  console.log('Processing source code...');
  extractor.processDirectory(path.join(__dirname, '..', 'src'));
  console.log('Done processing source code.');
};

// Generate reports
const generateReports = () => {
  console.log('Generating reports...');
  
  // Generate LaTeX document
  const latex = extractor.exportToLatex();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'mathematical_expressions.tex'), latex);
  console.log('LaTeX report generated.');
  
  // Generate HTML report
  extractor.generateHtmlReport(path.join(OUTPUT_DIR, 'index.html'));
  console.log('HTML report generated.');
  
  // Generate visualizations
  extractor.generateVisualizations(path.join(OUTPUT_DIR, 'visualizations'));
  console.log('Visualizations generated.');
  
  // Generate summary JSON
  const summary = extractor.exportSummaryJson();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), summary);
  console.log('Summary JSON generated.');
  
  // Log coverage statistics
  const coverage = extractor.calculateCoverage();
  console.log('Mathematical foundation coverage:');
  console.log(`- ${coverage.implementedTheorems} of ${coverage.totalTheorems} theorems implemented (${(coverage.theoremCoverage * 100).toFixed(1)}%)`);
  console.log(`- ${coverage.verifiedImplementations} implementations verified`);
};

// Run validation
const runValidation = () => {
  console.log('Validating implementations...');
  const validations = extractor.validateImplementations();
  console.log('Validation results:');
  console.log(`- Total: ${validations.summary.total}`);
  console.log(`- Valid: ${validations.summary.valid}`);
  console.log(`- Invalid: ${validations.summary.invalid}`);
  
  if (validations.summary.invalid > 0) {
    console.log('\nInvalid implementations:');
    validations.validations
      .filter(v => !v.valid)
      .forEach(v => {
        console.log(`- ${v.expression.source.file}:${v.expression.source.line}: ${v.error}`);
      });
  }
};

// Main function
const main = () => {
  processSrc();
  runValidation();
  generateReports();
  
  console.log(`\nAll reports have been generated in ${OUTPUT_DIR}`);
  console.log('You can view the HTML report by opening outputs/mathematics/index.html in a web browser');
};

// Run the script
main();