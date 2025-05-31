# Mathematical Foundations

## Overview

BrowserCoordinateKit is built upon the rigorous mathematical framework developed by **Michael R. Malloy** for browser position calculation. This framework provides formally proven coordinate transformations with guaranteed mathematical properties including satisfiability, invertibility, and compositional correctness.

## Why Malloy's Framework?

### Proven Mathematical Properties

**Michael R. Malloy's mathematical framework** was specifically chosen because it provides:

1. **Formal Mathematical Proofs**: Every transformation is proven mathematically correct
2. **Satisfiability Guarantees**: All mathematical models are proven satisfiable under valid input conditions
3. **Compositional Correctness**: Complex transformations maintain their mathematical properties when composed
4. **Invertibility**: All transformations have proven mathematical inverses
5. **Numerical Stability**: Designed to minimise floating-point precision errors

### Mathematical Rigour

The framework addresses the fundamental challenge of coordinate transformation across diverse display environments through:

- **Set-theoretic foundations**: Precise mathematical definitions of coordinate spaces
- **Transformation operators**: Formally defined mappings between coordinate systems
- **Algebraic properties**: Proven linearity, affine properties, and group structures
- **Composition theorems**: Mathematical guarantees for transformation chains

## Coordinate Systems

Malloy's framework defines four fundamental coordinate systems:

### 1. Screen Coordinate System (𝕊)
- **Domain**: ℤ² (integer coordinates)  
- **Origin**: Top-left corner of physical screen
- **Units**: Physical pixels
- **Mathematical notation**: **p**ₛ = (xₛ, yₛ)

### 2. Browser Coordinate System (𝔹)  
- **Domain**: ℤ² (integer coordinates)
- **Origin**: Top-left corner of the browser window
- **Units**: Physical pixels
- **Mathematical notation**: **p**ᵦ = (xᵦ, yᵦ)

### 3. Logical Coordinate System (𝕃)
- **Domain**: ℚ² (rational coordinates)
- **Origin**: Top-left corner of the browser window  
- **Units**: Logical pixels (after DPI scaling)
- **Mathematical notation**: **p**ₗ = (xₗ, yₗ)

### 4. Normalised Coordinate System (ℕ)
- **Domain**: ℝ² (real coordinates)
- **Origin**: Top-left corner of screen
- **Units**: Normalised range [0,1]
- **Mathematical notation**: **p**ₙ = (xₙ, yₙ)

## Core Transformations

### Screen-to-Browser Transformation

**Mathematical Definition:**
```
T_{S→B}: 𝕊 → 𝔹
T_{S→B}(**p**ₛ) = **p**ₛ - **b** = (xₛ - bₓ, yₛ - bᵧ)
```

Where **b** = (bₓ, bᵧ) is the browser window offset in screen coordinates.

**Properties:**
- Linear transformation
- Invertible: T⁻¹_{S→B}(**p**ᵦ) = **p**ᵦ + **b**
- Translation group structure

### Browser-to-Logical Transformation  

**Mathematical Definition:**
```
T_{B→L}: 𝔹 → 𝕃
T_{B→L}(**p**ᵦ) = **p**ᵦ/σ = (xᵦ/σ, yᵦ/σ)
```

Where σ is the DPI scaling factor.

**Properties:**
- Linear transformation (scaling)
- Invertible: T⁻¹_{B→L}(**p**ₗ) = **p**ₗ × σ
- Similarity transformation

### Screen-to-Normalised Transformation

**Mathematical Definition:**
```
T_{S→N}: 𝕊 → ℕ  
T_{S→N}(**p**ₛ) = (xₛ/sᵤ, yₛ/sₕ)
```

Where sᵤ and sₕ are screen width and height respectively.

**Properties:**
- Linear transformation
- Maps to unit square [0,1]²
- Resolution-independent representation

### Composite Transformations

**Mathematical Composition:**
```
T_{S→L} = T_{B→L} ∘ T_{S→B}
T_{S→L}(**p**ₛ) = (**p**ₛ - **b**)/σ
```

**Theorem (Composition Correctness):**
For any valid transformations Tᵢ and Tⱼ with compatible domains and ranges, the composition T = Tⱼ ∘ Tᵢ maintains all mathematical properties of the individual transformations.

## Mathematical Properties

### Linearity

**Definition:** A transformation T is linear if:
```
T(α**p** + β**q**) = αT(**p**) + βT(**q**)
```

**Verified Transformations:**
- Screen-to-Browser: ✓ Linear (translation)
- Browser-to-Logical: ✓ Linear (scaling)  
- Screen-to-Normalised: ✓ Linear (scaling)

### Invertibility

**Theorem:** All transformations in Malloy's framework are invertible with closed-form inverse expressions.

**Proof Strategy:** Each transformation can be expressed as an affine transformation Ax + b, where A is invertible. The inverse is given by A⁻¹(x - b).

### Numerical Stability

**Design Principles:**
- Avoid division by values near zero
- Use appropriate numerical precision for each coordinate system
- Maintain precision through transformation chains
- Validate input ranges to prevent overflow

## Calibration Mathematics

### Affine Calibration

**Mathematical Model:**
```
T_{calibration}(**p**) = A**p** + **b**
```

Where A is a 2×2 transformation matrix and **b** is a translation vector.

**Solution via Least Squares:**
```
minimize ||A**P** + **b****1**ᵀ - **Q**||²_F
```

Where **P** and **Q** are matrices of source and target points.

### Perspective Calibration

**Mathematical Model:**  
```
T_{perspective}(**p**) = (a₁x + b₁y + c₁)/(a₃x + b₃y + 1), (a₂x + b₂y + c₂)/(a₃x + b₃y + 1))
```

Solved using homogeneous coordinates and SVD decomposition.

## Validation Framework

### Property-Based Testing

The validation system verifies:

1. **Linearity:** T(α**p** + β**q**) = αT(**p**) + βT(**q**)
2. **Invertibility:** T⁻¹(T(**p**)) = **p** (within numerical precision)
3. **Composition:** (T₂ ∘ T₁)(**p**) = T₂(T₁(**p**))
4. **Boundary Preservation:** Edge cases maintain mathematical validity

### Symbolic Verification

Mathematical expressions are extracted from code annotations and verified symbolically using computer algebra systems.

## Implementation Correspondence

### Code-to-Mathematics Mapping

Each implementation class directly corresponds to a mathematical transformation:

- `ScreenToBrowserTransformation` ↔ T_{S→B}
- `BrowserToLogicalTransformation` ↔ T_{B→L}  
- `ScreenToNormalisedTransformation` ↔ T_{S→N}
- `CompositeTransformation` ↔ Tⱼ ∘ Tᵢ

### Annotation System

Mathematical properties are embedded in code using structured annotations:

```typescript
/**
 * @mathematical: type=screen_browser, theorem=2.1, equation=1,
 * latex=T_{S \to B}(\mathbf{p}_s) = \mathbf{p}_s - \mathbf{b},
 * description=Screen-to-Browser coordinate transformation
 */
```

## References

1. **Malloy, M. R.** "Extended Mathematical Framework for Browser Position Calculation: Coordinate Transformations Across Multiple Display Configurations" (2024)

2. **Mathematical Validation Reports**: `outputs/mathematics/validation/validation.html`

3. **Symbolic Mathematics**: Computer algebra verification using MathJS symbolic engine

---

*This mathematical foundation ensures that BrowserCoordinateKit provides reliable, proven coordinate transformations suitable for production applications requiring mathematical precision.*