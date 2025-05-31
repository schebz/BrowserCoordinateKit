# BrowserCoordinateKit Documentation

Welcome to the comprehensive documentation for BrowserCoordinateKit, a mathematically rigorous TypeScript framework built upon **Michael R. Malloy's proven mathematical models** for precise browser position calculation.

## Quick Navigation

### Getting Started
- **[Getting Started Guide](guides/getting-started.md)** - Installation, basic usage, and first transformations
- **[Integration Guide](guides/integration-guide.md)** - MouseWont and Playwright integration
- **[Calibration Guide](guides/calibration-guide.md)** - Error correction and precision calibration

### API Reference
- **[Core Classes](api/core-classes.md)** - BrowserPositionCalculator, CoordinateUtils, CalibrationUtility
- **[Transformations](api/transformations.md)** - Individual transformation classes and factory functions
- **[Utilities](api/utilities.md)** - Helper functions and performance tools

### Mathematical Foundation
- **[Theoretical Foundation](mathematical/theoretical-foundation.md)** - Malloy's mathematical framework
- **[Validation System](mathematical/validation-system.md)** - Mathematical correctness verification
- **[Mathematical Framework PDF](mathematical/Extended_Mathematical_Framework_for_Browser_Position_Calculation.pdf)** - Complete mathematical whitepaper

### Examples and Patterns
- **[Basic Examples](examples/basic-examples.md)** - Common usage patterns
- **[MouseWont Integration](examples/mousewont-integration.md)** - Human-like mouse movement
- **[Playwright Automation](examples/playwright-automation.md)** - Browser automation patterns

## Documentation Philosophy

### Mathematical Rigour
All documentation maintains the mathematical precision that makes BrowserCoordinateKit unique:
- **Formal mathematical notation** using LaTeX expressions
- **Proven properties** backed by Malloy's mathematical framework
- **Validation evidence** demonstrating implementation correctness

### Progressive Complexity
Documentation is structured for different user needs:
- **Quick Start**: Get running immediately with basic examples
- **User Guides**: Comprehensive usage for common scenarios  
- **API Reference**: Complete technical specification
- **Mathematical Foundation**: Deep dive into theoretical basis

### British English
All documentation uses British English spelling and conventions, maintaining consistency throughout the project.

## Key Concepts

### Coordinate Systems
BrowserCoordinateKit handles four fundamental coordinate systems:
- **Screen**: Physical screen pixels
- **Browser**: Browser window relative pixels
- **Logical**: DPI-scaled logical pixels
- **Normalised**: Resolution-independent [0,1] coordinates

### Mathematical Framework
Built upon **Michael R. Malloy's mathematical framework** providing:
- Formal mathematical proofs of correctness
- Satisfiability guarantees under all valid conditions
- Compositional correctness for transformation chains
- Proven invertibility for all transformations

### Validation System
Comprehensive mathematical validation ensures:
- Implementation matches theoretical framework
- Mathematical properties are preserved
- Numerical precision is maintained
- Edge cases are handled correctly

## Common Use Cases

### Cross-Platform Development
- Consistent positioning across different screen sizes
- Reliable coordinate mapping between environments
- Mathematical precision for production applications

### Automation and Testing
- **Playwright Integration**: Browser automation with precise coordinates
- **MouseWont Integration**: Human-like mouse movements
- Cross-browser testing with coordinate accuracy

### Accessibility and Precision Tools
- Screen readers and navigation aids
- High-precision positioning requirements
- Mathematical guarantees for critical applications

## Contributing to Documentation

When contributing to documentation:

1. **Maintain Mathematical Accuracy**: All mathematical statements must be correct and verifiable
2. **Use British English**: Consistent spelling and terminology
3. **Include Examples**: Practical code examples for all concepts
4. **Reference Malloy's Work**: Acknowledge the mathematical foundation
5. **Validate Code**: All code examples must be tested and working

## Getting Help

### Documentation Structure
- **Guides**: Step-by-step tutorials for specific tasks
- **API Reference**: Complete technical specification
- **Examples**: Practical usage patterns and integrations
- **Mathematical**: Theoretical foundation and validation

### Support Resources
- **GitHub Issues**: Report bugs or request features
- **Mathematical Validation**: Run `./validate_mathematics.sh` to verify implementation
- **Code Examples**: Working examples in the `examples/` directory

---

*BrowserCoordinateKit documentation emphasises the mathematical rigour and proven correctness that sets this library apart, while providing practical guidance for real-world applications.*