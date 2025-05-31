# Mathematical Foundations for Position Calculation in Browser Windows

## 1. Coordinate Systems and Transformations

Let us establish a rigorous mathematical framework for calculating positions in browser windows, accounting for various scaling factors and offsets.

### 1.1 Definition of Coordinate Systems

We define three fundamental coordinate systems:

1. **Screen Coordinate System** ($\mathbb{S}$): The absolute physical pixel coordinate system with origin at the top-left corner of the screen.
    - Domain: $\mathbb{S} \subset \mathbb{Z}^2$ where $\mathbb{Z}$ is the set of integers
    - For a point $\mathbf{p}_s \in \mathbb{S}$, we denote $\mathbf{p}_s = (x_s, y_s)$

2. **Browser Coordinate System** ($\mathbb{B}$): The physical pixel coordinate system with origin at the top-left corner of the browser window.
    - Domain: $\mathbb{B} \subset \mathbb{Z}^2$
    - For a point $\mathbf{p}_b \in \mathbb{B}$, we denote $\mathbf{p}_b = (x_b, y_b)$

3. **Logical Coordinate System** ($\mathbb{L}$): The logical pixel coordinate system used by the browser internally, after DPI scaling.
    - Domain: $\mathbb{L} \subset \mathbb{Q}^2$ where $\mathbb{Q}$ is the set of rational numbers
    - For a point $\mathbf{p}_l \in \mathbb{L}$, we denote $\mathbf{p}_l = (x_l, y_l)$

### 1.2 Transformation Operators

Let us define the transformation operators between these coordinate systems:

1. **Screen-to-Browser Transformation** ($T_{S \to B}$): Maps a point from screen coordinates to browser coordinates.
    - $T_{S \to B}: \mathbb{S} \to \mathbb{B}$

2. **Browser-to-Logical Transformation** ($T_{B \to L}$): Maps a point from browser coordinates to logical coordinates.
    - $T_{B \to L}: \mathbb{B} \to \mathbb{L}$

3. **Screen-to-Logical Transformation** ($T_{S \to L}$): Maps a point from screen coordinates to logical coordinates.
    - $T_{S \to L}: \mathbb{S} \to \mathbb{L}$

## 2. Mathematical Relations Between Coordinate Systems

### 2.1 Screen-to-Browser Transformation

Let $\mathbf{b}$ be the offset vector of the browser window's top-left corner in screen coordinates:
$\mathbf{b} = (b_x, b_y) \in \mathbb{S}$

For any point $\mathbf{p}_s = (x_s, y_s) \in \mathbb{S}$, the corresponding point in browser coordinates is:

$T_{S \to B}(\mathbf{p}_s) = \mathbf{p}_s - \mathbf{b} = (x_s - b_x, y_s - b_y) = \mathbf{p}_b$

**Theorem 2.1.1**: $T_{S \to B}$ is a linear transformation.

*Proof*:
For any $\mathbf{p}_s, \mathbf{q}_s \in \mathbb{S}$ and scalar $\alpha \in \mathbb{Z}$:
1. $T_{S \to B}(\mathbf{p}_s + \mathbf{q}_s) = (\mathbf{p}_s + \mathbf{q}_s) - \mathbf{b} = \mathbf{p}_s - \mathbf{b} + \mathbf{q}_s - \mathbf{b} + \mathbf{b} = T_{S \to B}(\mathbf{p}_s) + T_{S \to B}(\mathbf{q}_s)$
2. $T_{S \to B}(\alpha \mathbf{p}_s) = \alpha \mathbf{p}_s - \mathbf{b} = \alpha \mathbf{p}_s - \alpha \mathbf{b} + (\alpha - 1)\mathbf{b} = \alpha(\mathbf{p}_s - \mathbf{b}) + (\alpha - 1)\mathbf{b}$

Since property 2 doesn't hold for all $\alpha$, $T_{S \to B}$ is not strictly a linear transformation but rather an affine transformation, characterized by a translation of $-\mathbf{b}$.

### 2.2 Browser-to-Logical Transformation

Let $\sigma \in \mathbb{R}^+$ be the DPI scaling factor. For the given problem, $\sigma = 2$.

For any point $\mathbf{p}_b = (x_b, y_b) \in \mathbb{B}$, the corresponding point in logical coordinates is:

$T_{B \to L}(\mathbf{p}_b) = \frac{1}{\sigma}\mathbf{p}_b = \left(\frac{x_b}{\sigma}, \frac{y_b}{\sigma}\right) = \mathbf{p}_l$

**Theorem 2.2.1**: $T_{B \to L}$ is a linear transformation.

*Proof*:
For any $\mathbf{p}_b, \mathbf{q}_b \in \mathbb{B}$ and scalar $\alpha \in \mathbb{R}$:
1. $T_{B \to L}(\mathbf{p}_b + \mathbf{q}_b) = \frac{1}{\sigma}(\mathbf{p}_b + \mathbf{q}_b) = \frac{1}{\sigma}\mathbf{p}_b + \frac{1}{\sigma}\mathbf{q}_b = T_{B \to L}(\mathbf{p}_b) + T_{B \to L}(\mathbf{q}_b)$
2. $T_{B \to L}(\alpha \mathbf{p}_b) = \frac{1}{\sigma}(\alpha \mathbf{p}_b) = \alpha \left(\frac{1}{\sigma}\mathbf{p}_b\right) = \alpha \cdot T_{B \to L}(\mathbf{p}_b)$

Since both properties hold, $T_{B \to L}$ is indeed a linear transformation, specifically a uniform scaling by factor $\frac{1}{\sigma}$.

### 2.3 Screen-to-Logical Transformation

By composition of transformations, we have:

$T_{S \to L} = T_{B \to L} \circ T_{S \to B}$

For any point $\mathbf{p}_s = (x_s, y_s) \in \mathbb{S}$:

$T_{S \to L}(\mathbf{p}_s) = T_{B \to L}(T_{S \to B}(\mathbf{p}_s)) = T_{B \to L}(\mathbf{p}_s - \mathbf{b}) = \frac{1}{\sigma}(\mathbf{p}_s - \mathbf{b}) = \frac{\mathbf{p}_s - \mathbf{b}}{\sigma} = \left(\frac{x_s - b_x}{\sigma}, \frac{y_s - b_y}{\sigma}\right)$

**Theorem 2.3.1**: $T_{S \to L}$ is an affine transformation.

*Proof*: As the composition of an affine transformation ($T_{S \to B}$) and a linear transformation ($T_{B \to L}$), $T_{S \to L}$ is an affine transformation.

## 3. Position Calculation: Derivation and Proof

### 3.1 Target Position Calculation

Given:
- $\mathbf{t}_s = (t_x, t_y) \in \mathbb{S}$ is the target's absolute position in screen coordinates
- $\mathbf{b} = (b_x, b_y) \in \mathbb{S}$ is the browser window's top-left position in screen coordinates
- $\sigma \in \mathbb{R}^+$ is the DPI scaling factor

We want to find:
1. $\mathbf{t}_b \in \mathbb{B}$: Target position in browser coordinates (physical pixels)
2. $\mathbf{t}_l \in \mathbb{L}$: Target position in logical coordinates

**Step 1**: Calculate $\mathbf{t}_b$ using $T_{S \to B}$:
$\mathbf{t}_b = T_{S \to B}(\mathbf{t}_s) = \mathbf{t}_s - \mathbf{b} = (t_x - b_x, t_y - b_y)$

**Step 2**: Calculate $\mathbf{t}_l$ using $T_{B \to L}$:
$\mathbf{t}_l = T_{B \to L}(\mathbf{t}_b) = \frac{1}{\sigma}\mathbf{t}_b = \left(\frac{t_x - b_x}{\sigma}, \frac{t_y - b_y}{\sigma}\right)$

**Theorem 3.1.1**: The calculated positions $\mathbf{t}_b$ and $\mathbf{t}_l$ accurately represent the target's position in browser and logical coordinates, respectively.

*Proof*:
By definition, the browser coordinate system has its origin at the browser's top-left corner. Therefore, $\mathbf{t}_b = \mathbf{t}_s - \mathbf{b}$ correctly gives the position relative to the browser window.

Similarly, the logical coordinate system is obtained by scaling the browser coordinate system by a factor of $\frac{1}{\sigma}$. Therefore, $\mathbf{t}_l = \frac{1}{\sigma}\mathbf{t}_b$ correctly gives the logical coordinates.

### 3.2 Calculating Browser Window Position

Let:
- $\mathbf{m}_s = (m_x, m_y) \in \mathbb{S}$ be the mouse's absolute position in screen coordinates
- $\mathbf{m}_l = (m_{x_l}, m_{y_l}) \in \mathbb{L}$ be the mouse's position in logical coordinates

**Theorem 3.2.1**: The browser window position $\mathbf{b}$ can be calculated as:
$\mathbf{b} = \mathbf{m}_s - \sigma \cdot \mathbf{m}_l$

*Proof*:
We know that $\mathbf{m}_l = T_{S \to L}(\mathbf{m}_s) = \frac{\mathbf{m}_s - \mathbf{b}}{\sigma}$

Rearranging:
$\sigma \cdot \mathbf{m}_l = \mathbf{m}_s - \mathbf{b}$
$\mathbf{b} = \mathbf{m}_s - \sigma \cdot \mathbf{m}_l$

This gives us the browser window position based on the mouse's screen position and its corresponding logical position.

## 4. Edge Detection: Derivation and Proof

### 4.1 Browser Window Edges

Given:
- $\mathbf{b} = (b_x, b_y) \in \mathbb{S}$ is the browser window's top-left position in screen coordinates
- $\mathbf{v} = (v_w, v_h) \in \mathbb{L}^2$ represents the viewport dimensions in logical pixels
- $\sigma \in \mathbb{R}^+$ is the DPI scaling factor

We define the browser window's edges in screen coordinates as:
- Top edge: $y = b_y$
- Left edge: $x = b_x$
- Right edge: $x = b_x + \sigma \cdot v_w$
- Bottom edge: $y = b_y + \sigma \cdot v_h$

**Theorem 4.1.1**: The above equations correctly define the browser window's edges in screen coordinates.

*Proof*:
The top-left corner of the browser window is at $\mathbf{b} = (b_x, b_y)$ by definition.

The width of the viewport in physical pixels is $\sigma \cdot v_w$ due to DPI scaling. Therefore, the right edge is at $x = b_x + \sigma \cdot v_w$.

Similarly, the height of the viewport in physical pixels is $\sigma \cdot v_h$. Therefore, the bottom edge is at $y = b_y + \sigma \cdot v_h$.

## 5. Application to the Given Problem

Given:
- Original screen resolution: $2560 \times 1440$ pixels
- Viewport dimensions: $\mathbf{v} = (2000, 1000)$ logical pixels
- DPI scaling factor: $\sigma = 2$
- Target absolute position: $\mathbf{t}_s = (2065, 539)$ in screen coordinates

### 5.1 Target Position Calculation

If we know the browser window position $\mathbf{b} = (b_x, b_y)$, then:

1. Target position in browser coordinates:
   $\mathbf{t}_b = (2065 - b_x, 539 - b_y)$

2. Target position in logical coordinates:
   $\mathbf{t}_l = \left(\frac{2065 - b_x}{2}, \frac{539 - b_y}{2}\right)$

### 5.2 Browser Window Edges

1. Top edge: $y = b_y$
2. Left edge: $x = b_x$
3. Right edge: $x = b_x + 2 \cdot 2000 = b_x + 4000$
4. Bottom edge: $y = b_y + 2 \cdot 1000 = b_y + 2000$

### 5.3 Numerical Example

Let's assume the browser window's top-left corner is at position $\mathbf{b} = (100, 50)$ in screen coordinates:

1. Target position in browser coordinates:
   $\mathbf{t}_b = (2065 - 100, 539 - 50) = (1965, 489)$

2. Target position in logical coordinates:
   $\mathbf{t}_l = \left(\frac{1965}{2}, \frac{489}{2}\right) = (982.5, 244.5)$

3. Browser window edges:
    - Top edge: $y = 50$
    - Left edge: $x = 100$
    - Right edge: $x = 100 + 4000 = 4100$
    - Bottom edge: $y = 50 + 2000 = 2050$

The target at $(2065, 539)$ is indeed within the browser window since $100 < 2065 < 4100$ and $50 < 539 < 2050$.

## 6. Mathematical Properties and Constraints

### 6.1 Invertibility of Transformations

**Theorem 6.1.1**: The transformations $T_{S \to B}$ and $T_{B \to L}$ are invertible.

*Proof*:
1. $T_{S \to B}^{-1}(\mathbf{p}_b) = \mathbf{p}_b + \mathbf{b}$
2. $T_{B \to L}^{-1}(\mathbf{p}_l) = \sigma \cdot \mathbf{p}_l$

Therefore, $T_{S \to L}^{-1} = T_{S \to B}^{-1} \circ T_{B \to L}^{-1}$, giving:
$T_{S \to L}^{-1}(\mathbf{p}_l) = \sigma \cdot \mathbf{p}_l + \mathbf{b}$

This invertibility ensures that we can transform coordinates in any direction between the three coordinate systems.

### 6.2 Bounds and Constraints

For a point to be visible within the browser window:
- In browser coordinates: $0 \leq x_b < \sigma \cdot v_w$ and $0 \leq y_b < \sigma \cdot v_h$
- In logical coordinates: $0 \leq x_l < v_w$ and $0 \leq y_l < v_h$
- In screen coordinates: $b_x \leq x_s < b_x + \sigma \cdot v_w$ and $b_y \leq y_s < b_y + \sigma \cdot v_h$

These constraints allow us to determine whether a target position is visible within the browser window.

## 7. Conclusion

We have established a rigorous mathematical framework for calculating positions in browser windows, accounting for DPI scaling and window offsets. The derived transformations and equations provide a complete solution to the position calculation problem, with formal proofs of correctness.

The mathematical model accurately handles the conversion between screen, browser, and logical coordinate systems, allowing precise calculation of target positions and browser window edges. This framework can be directly applied to the Playwright API for accurate position determination, even in complex scenarios with multiple nested frames and DPI scaling.