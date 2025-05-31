#!/bin/bash
# Script to run the entire mathematical validation pipeline

set -e  # Exit on error

SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR"

echo "=== BrowserCoordinateKit Mathematical Validation ==="
echo

# 1. Run the symbolic extraction and validation
echo "Running symbolic extraction and validation..."
npx ts-node scripts/generateMathematicalReports.ts

# 2. Generate visualizations
echo "Generating visualizations..."
python scripts/generate_simple_visualizations.py

# 3. Summary
echo
echo "=== Validation Complete ==="
echo "All reports and visualizations have been generated in outputs/mathematics/"
echo "- Main index: outputs/mathematics/index.html"
echo "- Validation report: outputs/mathematics/validation/validation.html"
echo "- Visualizations: outputs/mathematics/visualizations/index.html"
echo "- LaTeX document: outputs/mathematics/mathematical_expressions.tex"
echo
echo "To view the reports, open the HTML files in a web browser."