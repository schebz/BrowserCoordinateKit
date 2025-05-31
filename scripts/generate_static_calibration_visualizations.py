#!/usr/bin/env python3
"""
Generate static visualizations for the calibration system in BrowserCoordinateKit.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch
import matplotlib.transforms as mtransforms
from matplotlib import colors

# Create output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                          'outputs', 'mathematics', 'calibration')

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def create_calibration_types_visualization():
    """Create static visualization of different calibration types"""
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Calibration Types', fontsize=18)
    
    axes = axes.flatten()
    
    # Set titles for each subplot
    axes[0].set_title('Offset Calibration')
    axes[1].set_title('Scale Calibration')
    axes[2].set_title('Affine Calibration')
    axes[3].set_title('Perspective Calibration')
    
    # Set up axes limits
    for ax in axes:
        ax.set_xlim(0, 100)
        ax.set_ylim(0, 100)
        ax.set_aspect('equal')
        ax.grid(True)
    
    # Generate sample points (original grid)
    x, y = np.meshgrid(np.linspace(10, 90, 5), np.linspace(10, 90, 5))
    points_original = np.vstack([x.flatten(), y.flatten()]).T
    
    # Create scatter plots for original points (black)
    for ax in axes:
        ax.scatter(points_original[:, 0], points_original[:, 1], 
                   c='black', s=50, alpha=0.5, label='Original')
    
    # Define transformations
    # 1. Offset transformation
    offset_x, offset_y = 10, 15
    offset_points = points_original + np.array([offset_x, offset_y])
    
    # 2. Scale transformation
    scale_x, scale_y = 1.3, 0.7
    center = np.mean(points_original, axis=0)
    centered = points_original - center
    scale_points = centered * np.array([scale_x, scale_y]) + center
    
    # 3. Affine transformation (rotation + shear)
    angle = np.pi/6  # 30 degrees
    shear_x = 0.2
    
    # Affine matrix
    A = np.array([
        [np.cos(angle), np.sin(angle) + shear_x],
        [-np.sin(angle), np.cos(angle)]
    ])
    
    # Apply from the center
    centered = points_original - center
    transformed = centered @ A.T
    affine_points = transformed + center
    
    # 4. Perspective-like transformation
    # This is a simplified approximation of perspective
    strength = 0.002
    
    # Apply from the center
    centered = points_original - center
    
    # Apply pseudo-perspective (points farther from center appear more compressed)
    distances = np.linalg.norm(centered, axis=1)
    factors = 1 / (1 + strength * distances**2)
    transformed = centered * factors[:, np.newaxis]
    
    # Add some rotation for visual interest
    rot_angle = np.pi/6
    rot_matrix = np.array([
        [np.cos(rot_angle), -np.sin(rot_angle)],
        [np.sin(rot_angle), np.cos(rot_angle)]
    ])
    transformed = transformed @ rot_matrix.T
    
    perspective_points = transformed + center
    
    # Plot transformed points
    transformed_points = [offset_points, scale_points, affine_points, perspective_points]
    
    for i, (ax, points) in enumerate(zip(axes, transformed_points)):
        ax.scatter(points[:, 0], points[:, 1], c='red', s=50, label='Calibrated')
        
        # Draw arrows showing the transformation
        for j in range(len(points_original)):
            arrow = FancyArrowPatch(
                points_original[j], points[j],
                arrowstyle='->', 
                mutation_scale=10,
                color='blue',
                alpha=0.5
            )
            ax.add_patch(arrow)
        
        # Add legend
        ax.legend(loc='upper left')
    
    # Add equations
    fig.text(0.5, 0.01, 
             r'$T_{offset}(p) = p + (dx,dy) \quad T_{scale}(p) = S \cdot p \quad T_{affine}(p) = A \cdot p + b \quad T_{perspective}(p) = \frac{(ax+by+c, dx+ey+f)}{gx+hy+i}$', 
             ha='center', 
             fontsize=12)
    
    # Save figure
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'calibration_types.png'), dpi=150)
    plt.close()
    print(f"Saved calibration types visualization")

def create_calibration_workflow_visualization():
    """Create a static visualization of the calibration workflow"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Calibration Workflow', fontsize=18)
    
    # Set titles for each subplot
    ax1.set_title('Step 1: Generate Calibration Points')
    ax2.set_title('Step 2: Measure Click Errors')
    ax3.set_title('Step 3: Calculate Calibration Matrix')
    ax4.set_title('Step 4: Apply Calibration')
    
    # Set up all axes
    for ax in (ax1, ax2, ax3, ax4):
        ax.set_xlim(0, 100)
        ax.set_ylim(0, 100)
        ax.set_aspect('equal')
        ax.grid(True)
    
    # Define calibration points (target points)
    calibration_points = np.array([
        [20, 20],   # Top-left
        [80, 20],   # Top-right
        [20, 80],   # Bottom-left
        [80, 80],   # Bottom-right
        [50, 50]    # Center
    ])
    
    # Create a 'click error' for each point (where the user would actually click)
    np.random.seed(42)  # For reproducibility
    click_errors = np.random.uniform(-8, 8, size=(5, 2))
    
    # Actual click positions
    actual_points = calibration_points + click_errors
    
    # Step 1: Generate Calibration Points
    ax1.scatter(calibration_points[:, 0], calibration_points[:, 1], 
               c='blue', s=100, label='Target Points')
    
    # Add screen border
    rect = Rectangle((0, 0), 100, 100, linewidth=2, edgecolor='gray', 
                     facecolor='none', linestyle='--')
    ax1.add_patch(rect)
    
    for i, point in enumerate(calibration_points):
        ax1.annotate(f'P{i+1}', (point[0], point[1]), 
                    xytext=(5, 5), textcoords='offset points')
    
    ax1.legend()
    
    # Step 2: Measure Click Errors
    ax2.scatter(calibration_points[:, 0], calibration_points[:, 1], 
               c='blue', s=100, label='Target Points')
    ax2.scatter(actual_points[:, 0], actual_points[:, 1], 
               c='red', s=80, label='Actual Clicks')
    
    # Draw error lines
    for i in range(len(calibration_points)):
        ax2.plot([calibration_points[i, 0], actual_points[i, 0]],
                [calibration_points[i, 1], actual_points[i, 1]],
                'g-', lw=1.5, alpha=0.7)
        
        # Calculate error distance
        error = np.linalg.norm(calibration_points[i] - actual_points[i])
        midpoint = (calibration_points[i] + actual_points[i]) / 2
        ax2.annotate(f'{error:.1f}px', midpoint, 
                    xytext=(3, 3), textcoords='offset points',
                    bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.7))
    
    ax2.legend()
    
    # Step 3: Calculate Calibration Matrix
    ax3.scatter(calibration_points[:, 0], calibration_points[:, 1], 
               c='blue', s=100, label='Target Points')
    ax3.scatter(actual_points[:, 0], actual_points[:, 1], 
               c='red', s=80, label='Actual Clicks')
    
    # Draw error lines
    for i in range(len(calibration_points)):
        ax3.plot([calibration_points[i, 0], actual_points[i, 0]],
                [calibration_points[i, 1], actual_points[i, 1]],
                'g-', lw=1, alpha=0.5)
    
    # Draw a simple visual representation of a matrix
    matrix = np.array([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ])
    
    # Draw the matrix as a grid
    matrix_size = 40
    matrix_x, matrix_y = 50, 50
    cell_size = matrix_size / 3
    
    matrix_rect = Rectangle((matrix_x - matrix_size/2, matrix_y - matrix_size/2), 
                           matrix_size, matrix_size, 
                           facecolor='lightyellow', edgecolor='orange', alpha=0.8)
    ax3.add_patch(matrix_rect)
    
    # Draw grid lines
    for i in range(4):
        # Vertical lines
        ax3.plot([matrix_x - matrix_size/2 + i*cell_size, matrix_x - matrix_size/2 + i*cell_size],
                [matrix_y - matrix_size/2, matrix_y + matrix_size/2],
                'k-', lw=1, alpha=0.5)
        # Horizontal lines
        ax3.plot([matrix_x - matrix_size/2, matrix_x + matrix_size/2],
                [matrix_y - matrix_size/2 + i*cell_size, matrix_y - matrix_size/2 + i*cell_size],
                'k-', lw=1, alpha=0.5)
    
    # Add labels
    labels = [['a', 'c', 'e'], ['b', 'd', 'f'], ['0', '0', '1']]
    for i in range(3):
        for j in range(3):
            ax3.text(matrix_x - matrix_size/2 + (j+0.5)*cell_size, 
                    matrix_y - matrix_size/2 + (i+0.5)*cell_size,
                    labels[i][j], ha='center', va='center', fontsize=12)
    
    # Add formula text
    ax3.text(10, 10, "min Σ|T(p'ᵢ) - pᵢ|²", fontsize=12,
            bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.8))
    
    ax3.legend()
    
    # Step 4: Apply Calibration
    # Calculate simple calibration matrix (just for visualization)
    # For this example, we'll use simple least squares to find an affine transformation
    X = np.column_stack([actual_points, np.ones(len(actual_points))])
    Y = calibration_points
    
    solution_x, residuals_x, rank_x, s_x = np.linalg.lstsq(X, Y[:, 0], rcond=None)
    solution_y, residuals_y, rank_y, s_y = np.linalg.lstsq(X, Y[:, 1], rcond=None)
    
    # Apply calibration to the actual points
    calibrated_points = np.zeros_like(actual_points)
    for i, p in enumerate(actual_points):
        calibrated_points[i, 0] = solution_x[0] * p[0] + solution_x[1] * p[1] + solution_x[2]
        calibrated_points[i, 1] = solution_y[0] * p[0] + solution_y[1] * p[1] + solution_y[2]
    
    # Generate test points
    np.random.seed(123)
    test_points = np.random.uniform(10, 90, size=(8, 2))
    test_errors = np.random.uniform(-8, 8, size=(8, 2))
    test_actual = test_points + test_errors
    
    # Apply calibration to test points
    test_calibrated = np.zeros_like(test_actual)
    for i, p in enumerate(test_actual):
        test_calibrated[i, 0] = solution_x[0] * p[0] + solution_x[1] * p[1] + solution_x[2]
        test_calibrated[i, 1] = solution_y[0] * p[0] + solution_y[1] * p[1] + solution_y[2]
    
    # Plot test points
    ax4.scatter(test_points[:, 0], test_points[:, 1], 
               c='blue', s=100, label='Target Points')
    ax4.scatter(test_actual[:, 0], test_actual[:, 1], 
               c='red', s=80, alpha=0.4, label='Uncalibrated')
    ax4.scatter(test_calibrated[:, 0], test_calibrated[:, 1], 
               c='green', s=80, label='Calibrated')
    
    # Draw error lines
    for i in range(len(test_points)):
        # Before calibration (red)
        ax4.plot([test_points[i, 0], test_actual[i, 0]],
                [test_points[i, 1], test_actual[i, 1]],
                'r-', lw=0.5, alpha=0.3)
        
        # After calibration (green)
        ax4.plot([test_points[i, 0], test_calibrated[i, 0]],
                [test_points[i, 1], test_calibrated[i, 1]],
                'g-', lw=1, alpha=0.6)
    
    # Calculate average errors
    before_errors = np.linalg.norm(test_points - test_actual, axis=1)
    after_errors = np.linalg.norm(test_points - test_calibrated, axis=1)
    
    avg_before = np.mean(before_errors)
    avg_after = np.mean(after_errors)
    
    # Show error improvement
    ax4.text(10, 10, 
            f"Average Error Before: {avg_before:.2f}px\n" +
            f"Average Error After: {avg_after:.2f}px\n" +
            f"Improvement: {100 * (1 - avg_after/avg_before):.1f}%",
            fontsize=10,
            bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="gray", alpha=0.8))
    
    ax4.legend()
    
    # Save figure
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'calibration_workflow.png'), dpi=150)
    plt.close()
    print(f"Saved calibration workflow visualization")

def create_matrix_operations_visualization():
    """Create a static visualization of matrix operations for calibration"""
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Matrix Operations for Calibration', fontsize=18)
    
    # Set titles for each subplot
    ax1.set_title('Matrix Multiplication')
    ax2.set_title('Matrix Determinant')
    ax3.set_title('Matrix Inverse')
    ax4.set_title('Linear System Solution')
    
    # Set up all axes
    for ax in (ax1, ax2, ax3, ax4):
        ax.set_xlim(-3, 3)
        ax.set_ylim(-3, 3)
        ax.set_aspect('equal')
        ax.grid(True)
        ax.axhline(y=0, color='k', linestyle='-', alpha=0.3)
        ax.axvline(x=0, color='k', linestyle='-', alpha=0.3)
    
    # 1. Matrix Multiplication
    # Define a rotation matrix
    theta = np.pi/4  # 45 degrees
    scale = 1.5
    c, s = np.cos(theta), np.sin(theta)
    A1 = np.array([
        [scale * c, -scale * s],
        [scale * s, scale * c]
    ])
    
    # Create unit vectors
    unit_vectors = np.array([[1, 0], [0, 1]])
    
    # Transform unit vectors
    transformed_vectors = unit_vectors @ A1.T
    
    # Plot unit vectors
    ax1.quiver([0, 0], [0, 0], 
              unit_vectors[:, 0], unit_vectors[:, 1], 
              color=['red', 'green'], scale=1, scale_units='xy', 
              angles='xy', width=0.008)
    
    # Plot transformed vectors
    ax1.quiver([0, 0], [0, 0], 
              transformed_vectors[:, 0], transformed_vectors[:, 1], 
              color=['darkred', 'darkgreen'], scale=1, scale_units='xy', 
              angles='xy', width=0.012)
    
    # Label vectors
    ax1.text(1.1, 0, r'$\vec{e}_1$', color='red', fontsize=12)
    ax1.text(0, 1.1, r'$\vec{e}_2$', color='green', fontsize=12)
    ax1.text(transformed_vectors[0, 0] * 1.1, transformed_vectors[0, 1] * 1.1, 
             r'$A\vec{e}_1$', color='darkred', fontsize=12)
    ax1.text(transformed_vectors[1, 0] * 1.1, transformed_vectors[1, 1] * 1.1, 
             r'$A\vec{e}_2$', color='darkgreen', fontsize=12)
    
    # Draw the unit square and its transformation
    square = np.array([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])
    transformed_square = square @ A1.T
    
    ax1.plot(square[:, 0], square[:, 1], 'b--', alpha=0.5)
    ax1.plot(transformed_square[:, 0], transformed_square[:, 1], 'b-', alpha=0.8)
    
    # Show the matrix
    matrix_text = (
        f"A = \n"
        f"[{A1[0, 0]:.2f} {A1[0, 1]:.2f}]\n"
        f"[{A1[1, 0]:.2f} {A1[1, 1]:.2f}]"
    )
    ax1.text(-2.5, 2.5, matrix_text, fontsize=10, va='top', family='monospace')
    
    # 2. Matrix Determinant
    # Use a shearing matrix
    shear_x = 0.8
    shear_y = 0.3
    A2 = np.array([
        [1, shear_x],
        [shear_y, 1]
    ])
    
    # Calculate determinant
    det_A2 = np.linalg.det(A2)
    
    # Transform unit vectors
    transformed_vectors2 = unit_vectors @ A2.T
    
    # Plot unit vectors
    ax2.quiver([0, 0], [0, 0], 
              unit_vectors[:, 0], unit_vectors[:, 1], 
              color=['red', 'green'], scale=1, scale_units='xy', 
              angles='xy', width=0.008)
    
    # Plot transformed vectors
    ax2.quiver([0, 0], [0, 0], 
              transformed_vectors2[:, 0], transformed_vectors2[:, 1], 
              color=['darkred', 'darkgreen'], scale=1, scale_units='xy', 
              angles='xy', width=0.012)
    
    # Draw the unit square and its transformation
    transformed_square2 = square @ A2.T
    
    ax2.plot(square[:, 0], square[:, 1], 'b--', alpha=0.5)
    ax2.plot(transformed_square2[:, 0], transformed_square2[:, 1], 'b-', alpha=0.8)
    
    # Fill the areas to show scaling
    ax2.fill(square[:, 0], square[:, 1], 'b', alpha=0.1)
    ax2.fill(transformed_square2[:, 0], transformed_square2[:, 1], 'r', alpha=0.1)
    
    # Show the matrix and determinant
    matrix_text = (
        f"A = \n"
        f"[{A2[0, 0]:.2f} {A2[0, 1]:.2f}]\n"
        f"[{A2[1, 0]:.2f} {A2[1, 1]:.2f}]\n\n"
        f"det(A) = {det_A2:.2f}\n"
        f"Area scale = {abs(det_A2):.2f}"
    )
    ax2.text(-2.5, 2.5, matrix_text, fontsize=10, va='top', family='monospace')
    
    # 3. Matrix Inverse
    # Use a matrix that's well-conditioned
    A3 = np.array([
        [2, 1],
        [1, 3]
    ])
    
    # Calculate inverse
    A3_inv = np.linalg.inv(A3)
    
    # Identity check: A * A^-1 should be identity
    identity_check = A3 @ A3_inv
    
    # Transform unit vectors
    transformed_vectors3 = unit_vectors @ A3.T
    inverse_transformed = transformed_vectors3 @ A3_inv.T
    
    # Plot unit vectors
    ax3.quiver([0, 0], [0, 0], 
              unit_vectors[:, 0], unit_vectors[:, 1], 
              color=['red', 'green'], scale=1, scale_units='xy', 
              angles='xy', width=0.008)
    
    # Plot transformed vectors
    ax3.quiver([0, 0], [0, 0], 
              transformed_vectors3[:, 0], transformed_vectors3[:, 1], 
              color=['darkred', 'darkgreen'], scale=1, scale_units='xy', 
              angles='xy', width=0.012)
    
    # Draw the unit square and its transformation
    transformed_square3 = square @ A3.T
    
    ax3.plot(square[:, 0], square[:, 1], 'b--', alpha=0.5)
    ax3.plot(transformed_square3[:, 0], transformed_square3[:, 1], 'b-', alpha=0.8)
    
    # Show inverse applied to transformed square
    inverse_square = transformed_square3 @ A3_inv.T
    ax3.plot(inverse_square[:, 0], inverse_square[:, 1], 'g--', alpha=0.8)
    
    # Show the matrices
    matrix_text = (
        f"A = \n"
        f"[{A3[0, 0]:.2f} {A3[0, 1]:.2f}]\n"
        f"[{A3[1, 0]:.2f} {A3[1, 1]:.2f}]\n\n"
        f"A^(-1) = \n"
        f"[{A3_inv[0, 0]:.2f} {A3_inv[0, 1]:.2f}]\n"
        f"[{A3_inv[1, 0]:.2f} {A3_inv[1, 1]:.2f}]"
    )
    ax3.text(-2.5, 2.5, matrix_text, fontsize=10, va='top', family='monospace')
    
    # 4. Linear System Solution
    # Linear system: Ax = b
    A4 = np.array([
        [2, 1],
        [1, 3]
    ])
    b = np.array([4, 5])
    
    # Solve the system
    x = np.linalg.solve(A4, b)
    
    # Verify solution: Ax should equal b
    Ax = A4 @ x
    
    # Plot basis vectors and b
    ax4.quiver([0, 0], [0, 0], 
              A4[:, 0], A4[:, 1], 
              color=['red', 'green'], scale=1, scale_units='xy', 
              angles='xy', width=0.012, label='A columns')
    
    ax4.quiver(0, 0, b[0], b[1], 
              color='blue', scale=1, scale_units='xy', 
              angles='xy', width=0.012, label='b')
    
    # Plot the solution
    ax4.scatter(x[0], x[1], c='purple', s=100, label='x (solution)')
    
    # Show the constructed solution
    ax4.quiver(0, 0, x[0] * A4[0, 0], x[0] * A4[1, 0], 
              color='red', alpha=0.3, scale=1, scale_units='xy', angles='xy')
    ax4.quiver(x[0] * A4[0, 0], x[0] * A4[1, 0], 
              x[1] * A4[0, 1], x[1] * A4[1, 1], 
              color='green', alpha=0.3, scale=1, scale_units='xy', angles='xy')
    
    # Add grid lines from x to axes
    ax4.plot([x[0], x[0]], [0, x[1]], 'k--', alpha=0.2)
    ax4.plot([0, x[0]], [x[1], x[1]], 'k--', alpha=0.2)
    
    ax4.annotate('', xy=(x[0], 0), xytext=(0, 0), 
                arrowprops=dict(arrowstyle='->', lw=0.5, alpha=0.5))
    ax4.annotate('', xy=(0, x[1]), xytext=(0, 0), 
                arrowprops=dict(arrowstyle='->', lw=0.5, alpha=0.5))
    
    # Show the system and solution
    system_text = (
        f"Linear System: Ax = b\n\n"
        f"A = \n"
        f"[{A4[0, 0]:.0f} {A4[0, 1]:.0f}]\n"
        f"[{A4[1, 0]:.0f} {A4[1, 1]:.0f}]\n\n"
        f"b = [{b[0]:.0f}, {b[1]:.0f}]\n\n"
        f"Solution x = [{x[0]:.2f}, {x[1]:.2f}]\n"
        f"Verify: Ax = [{Ax[0]:.2f}, {Ax[1]:.2f}]"
    )
    ax4.text(-2.5, 2.5, system_text, fontsize=10, va='top', family='monospace')
    
    ax4.legend(loc='lower right')
    
    # Save figure
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'matrix_operations.png'), dpi=150)
    plt.close()
    print(f"Saved matrix operations visualization")

def create_matrix_forms_visualization():
    """Create a visualization showing different matrix forms used in calibration"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
    fig.suptitle('Matrix Forms for Calibration', fontsize=18)
    
    # Set titles for each subplot
    ax1.set_title('Affine Transformation Matrix')
    ax2.set_title('Least Squares Solution')
    
    # Remove axis ticks for cleaner look
    for ax in (ax1, ax2):
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_frame_on(False)
    
    # 1. Affine Transformation Matrix - Use non-LaTeX text to avoid parsing errors
    affine_text = (
        "T_affine(p) = Ap + b\n\n" +
        "Homogeneous form:\n" +
        "[x']   [a c e] [x]\n" +
        "[y'] = [b d f] [y]\n" +
        "[1 ]   [0 0 1] [1]\n\n" +
        "where:\n" +
        "- (x,y) is the input point\n" +
        "- (x',y') is the transformed point\n" +
        "- a,b,c,d represent rotation, scaling, and shear\n" +
        "- e,f represent translation\n\n" +
        "For calibration, we need to find the matrix:\n" +
        "[a c e]\n" +
        "[b d f]\n" +
        "[0 0 1]\n\n" +
        "that best maps actual click positions to expected positions"
    )
    
    # 2. Least Squares Solution - Use non-LaTeX text to avoid parsing errors
    least_squares_text = (
        "Given n point pairs (p'_i, p_i) where:\n" +
        "- p'_i = (x'_i, y'_i) is the actual click\n" +
        "- p_i = (x_i, y_i) is the expected position\n\n" +
        "We want to find matrix parameters by solving:\n\n" +
        "[x'_1 y'_1 1] [a]   [x_1]\n" +
        "[x'_2 y'_2 1] [c] = [x_2]\n" +
        "[  ...     ] [e]   [ .. ]\n" +
        "[x'_n y'_n 1]      [x_n]\n\n" +
        "[x'_1 y'_1 1] [b]   [y_1]\n" +
        "[x'_2 y'_2 1] [d] = [y_2]\n" +
        "[  ...     ] [f]   [ .. ]\n" +
        "[x'_n y'_n 1]      [y_n]\n\n" +
        "The least squares solution is:\n" +
        "x = (A^T A)^(-1) A^T b"
    )
    
    # Display the equations using monospace font for better matrix display
    ax1.text(0.5, 0.5, affine_text, ha='center', va='center', fontsize=14, family='monospace')
    ax2.text(0.5, 0.5, least_squares_text, ha='center', va='center', fontsize=14, family='monospace')
    
    # Save figure
    # Use pad to avoid tight_layout issues
    plt.savefig(os.path.join(OUTPUT_DIR, 'matrix_forms.png'), dpi=150, bbox_inches='tight', pad_inches=0.5)
    plt.close()
    print(f"Saved matrix forms visualization")

def create_calibration_html():
    """Create HTML page for the calibration visualizations"""
    html_content = """<!DOCTYPE html>
<html>
<head>
  <title>BrowserCoordinateKit Calibration Visualizations</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .card { border: 1px solid #ccc; margin: 20px 0; padding: 15px; border-radius: 5px; }
    .visualization { text-align: center; margin: 15px 0; }
    img { max-width: 100%; border: 1px solid #eee; }
    .nav { margin: 20px 0; }
    .nav a { margin-right: 15px; text-decoration: none; }
    .equation { margin: 10px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px; }
    pre { background-color: #f8f8f8; padding: 10px; border-radius: 5px; font-family: monospace; }
  </style>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  <h1>BrowserCoordinateKit Calibration System</h1>
  <p>This page contains visualizations of the calibration system in BrowserCoordinateKit.</p>
  
  <div class="nav">
    <a href="../index.html">Mathematical Overview</a>
    <a href="../validation/validation.html">Symbolic Validations</a>
    <a href="../visualizations/index.html">Coordinate Transformations</a>
  </div>
  
  <div class="card">
    <h2>Calibration Types</h2>
    <p>The BrowserCoordinateKit library supports different types of calibrations to correct positional errors:</p>
    <ul>
      <li><strong>Offset Calibration</strong>: Adds a constant offset to coordinates (translation)</li>
      <li><strong>Scale Calibration</strong>: Multiplies coordinates by scaling factors</li>
      <li><strong>Affine Calibration</strong>: Applies a linear transformation with translation</li>
      <li><strong>Perspective Calibration</strong>: Applies a projective transformation</li>
    </ul>
    
    <div class="equation">
      <p>Mathematical formulations:</p>
      <p><strong>Offset:</strong> \(T_{offset}(p) = p + (dx, dy)\)</p>
      <p><strong>Scale:</strong> \(T_{scale}(p) = (s_x \cdot x + dx, s_y \cdot y + dy)\)</p>
      <p><strong>Affine:</strong> \(T_{affine}(p) = A \cdot p + b\) where A is a 2×2 matrix and b is a translation vector</p>
      <p><strong>Perspective:</strong> \(T_{perspective}(p) = \frac{(ax + by + c, dx + ey + f)}{gx + hy + i}\)</p>
    </div>
    
    <div class="visualization">
      <img src="calibration_types.png" alt="Calibration Types" />
    </div>
  </div>
  
  <div class="card">
    <h2>Calibration Workflow</h2>
    <p>The calibration process involves several steps:</p>
    <ol>
      <li>Generate calibration points across the screen</li>
      <li>User clicks on each target point</li>
      <li>Measure the error between expected and actual positions</li>
      <li>Calculate calibration parameters using least squares method</li>
      <li>Apply calibration to correct subsequent interactions</li>
    </ol>
    
    <div class="equation">
      <p>For affine calibration, we solve the system:</p>
      <p>\(
      \begin{pmatrix}
      x_1' & y_1' & 1 \\
      x_2' & y_2' & 1 \\
      \vdots & \vdots & \vdots \\
      x_n' & y_n' & 1
      \end{pmatrix}
      \begin{pmatrix}
      a \\ c \\ e
      \end{pmatrix}
      =
      \begin{pmatrix}
      x_1 \\ x_2 \\ \vdots \\ x_n
      \end{pmatrix}
      \)</p>
      
      <p>\(
      \begin{pmatrix}
      x_1' & y_1' & 1 \\
      x_2' & y_2' & 1 \\
      \vdots & \vdots & \vdots \\
      x_n' & y_n' & 1
      \end{pmatrix}
      \begin{pmatrix}
      b \\ d \\ f
      \end{pmatrix}
      =
      \begin{pmatrix}
      y_1 \\ y_2 \\ \vdots \\ y_n
      \end{pmatrix}
      \)</p>
      
      <p>Where \((x_i', y_i')\) are the actual click positions and \((x_i, y_i)\) are the expected positions.</p>
    </div>
    
    <div class="visualization">
      <img src="calibration_workflow.png" alt="Calibration Workflow" />
    </div>
  </div>
  
  <div class="card">
    <h2>Matrix Operations</h2>
    <p>The calibration system relies on several matrix operations:</p>
    <ul>
      <li><strong>Matrix Multiplication</strong>: Used to apply transformations</li>
      <li><strong>Matrix Determinant</strong>: Used to check if a matrix is invertible</li>
      <li><strong>Matrix Inverse</strong>: Used to solve linear systems</li>
      <li><strong>Linear System Solution</strong>: Used to find calibration parameters</li>
    </ul>
    
    <div class="equation">
      <p>Implementation of these operations in TypeScript:</p>
      <pre>
/**
 * Matrix multiplication
 */
private multiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;
  
  if (colsA !== rowsB) {
    throw new Error('Invalid matrix dimensions for multiplication');
  }
  
  const result: number[][] = [];
  
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  
  return result;
}

/**
 * Determinant for 3x3 matrix
 */
private determinant(A: number[][]): number {
  return (
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
  );
}
      </pre>
    </div>
    
    <div class="visualization">
      <img src="matrix_operations.png" alt="Matrix Operations" />
    </div>
  </div>
  
  <div class="card">
    <h2>Matrix Forms for Calibration</h2>
    <p>The calibration system uses different matrix forms to represent transformations and solve for calibration parameters.</p>
    
    <div class="visualization">
      <img src="matrix_forms.png" alt="Matrix Forms for Calibration" />
    </div>
  </div>
  
  <div class="footer">
    <p>These visualizations were generated using Python's matplotlib library to demonstrate the calibration system implemented in BrowserCoordinateKit.</p>
  </div>
</body>
</html>
"""
    
    # Write the HTML file
    html_file = os.path.join(OUTPUT_DIR, 'index.html')
    with open(html_file, 'w') as f:
        f.write(html_content)
    print(f"Created HTML file: {html_file}")

def main():
    print("Generating calibration visualizations for BrowserCoordinateKit...")
    
    # Create visualizations
    create_calibration_types_visualization()
    create_calibration_workflow_visualization()
    create_matrix_operations_visualization()
    
    try:
        create_matrix_forms_visualization()
    except Exception as e:
        print(f"Warning: Could not create matrix forms visualization: {e}")
    
    # Create HTML page
    create_calibration_html()
    
    print("Calibration visualizations complete. Output saved to:")
    print(OUTPUT_DIR)

if __name__ == "__main__":
    main()