#!/usr/bin/env python3
"""
Script to generate visualizations for the calibration system in BrowserCoordinateKit.

This script creates animated visualizations showing:
1. Different calibration types (offset, scale, affine, perspective)
2. The calibration process workflow
3. Matrix operations for coordinate transformations

Requirements:
    - matplotlib
    - numpy
    - pillow (for saving GIFs)
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Rectangle, FancyArrowPatch
from matplotlib.path import Path
import matplotlib.transforms as mtransforms
from PIL import Image

# Create output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                         'outputs', 'mathematics', 'calibration')

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def save_animation_as_gif(anim, filename, fps=15):
    """Save animation as GIF using pillow"""
    # Create a temporary directory for frames
    import tempfile
    import os
    
    temp_dir = tempfile.mkdtemp()
    
    # Set up to save individual frames
    frame_prefix = os.path.join(temp_dir, "frame")
    
    # Save frames as individual files
    for i in range(60):  # Limit to 60 frames for reasonable file size
        anim._draw_next_frame(i, None)
        plt.savefig(f"{frame_prefix}_{i:03d}.png")
    
    # Load all frames and create GIF
    frames = []
    for i in range(60):
        frames.append(Image.open(f"{frame_prefix}_{i:03d}.png"))
    
    # Save as GIF
    frames[0].save(
        filename, 
        format='GIF',
        append_images=frames[1:],
        save_all=True,
        duration=1000//fps,  # Duration in milliseconds
        loop=0  # Loop forever
    )
    
    # Clean up temporary files
    for i in range(60):
        os.remove(f"{frame_prefix}_{i:03d}.png")
    os.rmdir(temp_dir)
    
    print(f"Saved animation to {filename}")

def create_calibration_types_animation():
    """
    Create an animation showing different calibration types:
    - Offset calibration
    - Scale calibration
    - Affine calibration
    - Perspective calibration
    """
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
    scatter_original = [ax.scatter(points_original[:, 0], points_original[:, 1], c='black', s=50, alpha=0.5, label='Original') for ax in axes]
    
    # Create scatter plots for calibrated points (red)
    scatter_calibrated = [ax.scatter([], [], c='red', s=50, label='Calibrated') for ax in axes]
    
    # Create arrows to show the transformation
    arrows = []
    for ax in axes:
        for i in range(len(points_original)):
            arrow = FancyArrowPatch((0, 0), (0, 0), color='blue', alpha=0.5, arrowstyle='->', mutation_scale=10)
            ax.add_patch(arrow)
            arrows.append(arrow)
    
    # Add legends
    for ax in axes:
        ax.legend()
    
    # Define calibration transformations
    def apply_offset(points, t):
        # Oscillating offset that grows with time
        offset_x = 10 * np.sin(t * np.pi * 2)
        offset_y = 10 * np.cos(t * np.pi * 2)
        return points + np.array([offset_x, offset_y])
    
    def apply_scale(points, t):
        # Oscillating scale between 0.8 and 1.2
        scale_x = 1 + 0.2 * np.sin(t * np.pi * 2)
        scale_y = 1 + 0.2 * np.cos(t * np.pi * 2)
        
        # Apply scale from the center of the grid
        center = np.mean(points, axis=0)
        centered = points - center
        scaled = centered * np.array([scale_x, scale_y])
        return scaled + center
    
    def apply_affine(points, t):
        # Create an oscillating affine transformation
        angle = t * np.pi * 2
        shear_x = 0.2 * np.sin(angle)
        shear_y = 0.2 * np.cos(angle)
        
        # Affine matrix
        A = np.array([
            [1, shear_x],
            [shear_y, 1]
        ])
        
        # Apply from the center
        center = np.mean(points, axis=0)
        centered = points - center
        transformed = centered @ A.T
        return transformed + center
    
    def apply_perspective(points, t):
        # Create a simple perspective-like effect
        # This is a simplified approximation of perspective
        angle = t * np.pi * 2
        strength = 0.002 * (1 + np.sin(angle))
        
        # Apply from the center
        center = np.mean(points, axis=0)
        centered = points - center
        
        # Apply pseudo-perspective (points farther from center appear more compressed)
        distances = np.linalg.norm(centered, axis=1)
        factors = 1 / (1 + strength * distances)
        transformed = centered * factors[:, np.newaxis]
        
        # Add some rotation for visual interest
        rot_angle = np.pi/6 * np.sin(angle)
        rot_matrix = np.array([
            [np.cos(rot_angle), -np.sin(rot_angle)],
            [np.sin(rot_angle), np.cos(rot_angle)]
        ])
        transformed = transformed @ rot_matrix.T
        
        return transformed + center
    
    # Animation function
    def animate(i):
        t = i / 60  # Time parameter
        
        # Apply different calibrations
        calibrated_points = [
            apply_offset(points_original, t),    # Offset calibration
            apply_scale(points_original, t),     # Scale calibration
            apply_affine(points_original, t),    # Affine calibration
            apply_perspective(points_original, t)  # Perspective calibration
        ]
        
        # Update scatter plots
        for j, scatter in enumerate(scatter_calibrated):
            scatter.set_offsets(calibrated_points[j])
        
        # Update arrows
        arrow_index = 0
        for j, points in enumerate(calibrated_points):
            for k in range(len(points_original)):
                start = points_original[k]
                end = points[k]
                arrows[arrow_index].set_positions(start, end)
                arrow_index += 1
        
        return scatter_original + scatter_calibrated + arrows
    
    # Create the animation
    anim = animation.FuncAnimation(fig, animate, frames=120, interval=50, blit=True)
    
    # Save the animation
    output_file = os.path.join(OUTPUT_DIR, 'calibration_types.gif')
    save_animation_as_gif(anim, output_file)
    plt.close()

def create_calibration_workflow_animation():
    """
    Create an animation showing the calibration workflow:
    1. Generate calibration points
    2. User clicks on target points
    3. System measures actual vs. expected positions
    4. Calculate calibration matrix
    5. Apply calibration
    """
    fig, ax = plt.subplots(figsize=(10, 8))
    fig.suptitle('Calibration Workflow', fontsize=18)
    
    # Set up axis
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
    click_errors = np.random.uniform(-5, 5, size=(5, 2))
    
    # Actual click positions
    actual_points = calibration_points + click_errors
    
    # Create scatter plots
    target_scatter = ax.scatter([], [], c='blue', s=100, alpha=0.7, label='Target Points')
    click_scatter = ax.scatter([], [], c='red', s=80, alpha=0.7, label='Actual Clicks')
    
    # Create lines for errors
    error_lines = []
    for i in range(len(calibration_points)):
        line, = ax.plot([], [], 'g-', lw=1, alpha=0.7)
        error_lines.append(line)
    
    # Create canvas rectangle for the display area
    screen_rect = Rectangle((0, 0), 100, 100, facecolor='gray', alpha=0.1)
    ax.add_patch(screen_rect)
    
    # Text for current step and matrix
    step_text = ax.text(5, 95, '', fontsize=12, verticalalignment='top')
    matrix_text = ax.text(55, 95, '', fontsize=10, verticalalignment='top', family='monospace')
    
    # Add legend
    ax.legend(loc='lower right')
    
    # Animation function
    def animate(i):
        frame = i % 120  # Loop every 120 frames
        phase = frame // 20  # 6 phases of 20 frames each
        
        # Phase 0: Generate calibration points
        if phase == 0:
            step_text.set_text('Phase 1: Generate Calibration Points')
            matrix_text.set_text('')
            
            # Animate points appearing
            if frame % 20 < 5:
                target_scatter.set_offsets(calibration_points[:1])
            elif frame % 20 < 10:
                target_scatter.set_offsets(calibration_points[:2])
            elif frame % 20 < 15:
                target_scatter.set_offsets(calibration_points[:3])
            else:
                target_scatter.set_offsets(calibration_points)
                
            # No clicks yet
            click_scatter.set_offsets(np.empty((0, 2)))
            
            # No error lines
            for line in error_lines:
                line.set_data([], [])
        
        # Phase 1: User clicks (with error)
        elif phase == 1:
            step_text.set_text('Phase 2: User Clicks on Targets')
            matrix_text.set_text('')
            
            # Show all target points
            target_scatter.set_offsets(calibration_points)
            
            # Animate clicks
            if frame % 20 < 4:
                click_scatter.set_offsets(actual_points[:1])
            elif frame % 20 < 8:
                click_scatter.set_offsets(actual_points[:2])
            elif frame % 20 < 12:
                click_scatter.set_offsets(actual_points[:3])
            elif frame % 20 < 16:
                click_scatter.set_offsets(actual_points[:4])
            else:
                click_scatter.set_offsets(actual_points)
            
            # No error lines yet
            for line in error_lines:
                line.set_data([], [])
        
        # Phase 2: Measure errors
        elif phase == 2:
            step_text.set_text('Phase 3: Measure Click Errors')
            
            # Show all points
            target_scatter.set_offsets(calibration_points)
            click_scatter.set_offsets(actual_points)
            
            # Animate error lines appearing
            for i, line in enumerate(error_lines):
                if frame % 20 >= i * 4:
                    line.set_data(
                        [calibration_points[i, 0], actual_points[i, 0]],
                        [calibration_points[i, 1], actual_points[i, 1]]
                    )
            
            # Show error measurements
            if frame % 20 >= 15:
                errors = np.linalg.norm(calibration_points - actual_points, axis=1)
                error_text = "Error Measurements:\n"
                for i, err in enumerate(errors):
                    error_text += f"Point {i+1}: {err:.2f} px\n"
                matrix_text.set_text(error_text)
        
        # Phase 3: Calculate calibration matrix
        elif phase == 3:
            step_text.set_text('Phase 4: Calculate Calibration Matrix')
            
            # Show all points and errors
            target_scatter.set_offsets(calibration_points)
            click_scatter.set_offsets(actual_points)
            
            for i, line in enumerate(error_lines):
                line.set_data(
                    [calibration_points[i, 0], actual_points[i, 0]],
                    [calibration_points[i, 1], actual_points[i, 1]]
                )
            
            # Animate matrix calculation
            if frame % 20 < 10:
                matrix_text.set_text("Computing calibration matrix...")
            else:
                # Simplified affine matrix calculation
                X = np.column_stack([actual_points, np.ones(len(actual_points))])
                Y = calibration_points
                
                # Solve for affine parameters (simplified)
                solution_x, residuals_x, rank_x, s_x = np.linalg.lstsq(X, Y[:, 0], rcond=None)
                solution_y, residuals_y, rank_y, s_y = np.linalg.lstsq(X, Y[:, 1], rcond=None)
                
                affine_matrix = np.vstack([
                    [solution_x[0], solution_x[1], solution_x[2]],
                    [solution_y[0], solution_y[1], solution_y[2]],
                    [0, 0, 1]
                ])
                
                matrix_str = "Affine Calibration Matrix:\n"
                matrix_str += f"[{affine_matrix[0, 0]:.3f} {affine_matrix[0, 1]:.3f} {affine_matrix[0, 2]:.3f}]\n"
                matrix_str += f"[{affine_matrix[1, 0]:.3f} {affine_matrix[1, 1]:.3f} {affine_matrix[1, 2]:.3f}]\n"
                matrix_str += f"[{affine_matrix[2, 0]:.3f} {affine_matrix[2, 1]:.3f} {affine_matrix[2, 2]:.3f}]"
                
                matrix_text.set_text(matrix_str)
        
        # Phase 4: Apply calibration
        elif phase == 4:
            step_text.set_text('Phase 5: Apply Calibration')
            
            # Show all target points
            target_scatter.set_offsets(calibration_points)
            
            # Apply calibration to actual points (simple inverse mapping)
            X = np.column_stack([actual_points, np.ones(len(actual_points))])
            Y = calibration_points
            
            solution_x, residuals_x, rank_x, s_x = np.linalg.lstsq(X, Y[:, 0], rcond=None)
            solution_y, residuals_y, rank_y, s_y = np.linalg.lstsq(X, Y[:, 1], rcond=None)
            
            affine_matrix = np.vstack([
                [solution_x[0], solution_x[1], solution_x[2]],
                [solution_y[0], solution_y[1], solution_y[2]],
                [0, 0, 1]
            ])
            
            # Animate points moving closer to targets
            alpha = min(1.0, (frame % 20) / 10.0)
            corrected_points = alpha * calibration_points + (1 - alpha) * actual_points
            click_scatter.set_offsets(corrected_points)
            
            # Update error lines
            for i, line in enumerate(error_lines):
                line.set_data(
                    [calibration_points[i, 0], corrected_points[i, 0]],
                    [calibration_points[i, 1], corrected_points[i, 1]]
                )
            
            # Show matrix and error improvement
            matrix_str = "Affine Calibration Matrix:\n"
            matrix_str += f"[{affine_matrix[0, 0]:.3f} {affine_matrix[0, 1]:.3f} {affine_matrix[0, 2]:.3f}]\n"
            matrix_str += f"[{affine_matrix[1, 0]:.3f} {affine_matrix[1, 1]:.3f} {affine_matrix[1, 2]:.3f}]\n"
            matrix_str += f"[{affine_matrix[2, 0]:.3f} {affine_matrix[2, 1]:.3f} {affine_matrix[2, 2]:.3f}]"
            
            if frame % 20 >= 15:
                before_errors = np.linalg.norm(calibration_points - actual_points, axis=1)
                after_errors = np.linalg.norm(calibration_points - corrected_points, axis=1)
                
                avg_before = np.mean(before_errors)
                avg_after = np.mean(after_errors)
                
                matrix_str += f"\n\nAverage Error Before: {avg_before:.2f} px"
                matrix_str += f"\nAverage Error After: {avg_after:.2f} px"
                matrix_str += f"\nImprovement: {100 * (1 - avg_after/avg_before):.1f}%"
            
            matrix_text.set_text(matrix_str)
        
        # Phase 5: Verification
        else:
            step_text.set_text('Phase 6: Verification')
            
            # Generate random test points
            np.random.seed(123)
            test_points = np.random.uniform(10, 90, size=(10, 2))
            
            # Add noise (uncalibrated)
            test_noise = np.random.uniform(-5, 5, size=(10, 2))
            test_uncalibrated = test_points + test_noise
            
            # Apply calibration (simplified)
            X = np.column_stack([actual_points, np.ones(len(actual_points))])
            Y = calibration_points
            
            solution_x, residuals_x, rank_x, s_x = np.linalg.lstsq(X, Y[:, 0], rcond=None)
            solution_y, residuals_y, rank_y, s_y = np.linalg.lstsq(X, Y[:, 1], rcond=None)
            
            affine_matrix = np.vstack([
                [solution_x[0], solution_x[1], solution_x[2]],
                [solution_y[0], solution_y[1], solution_y[2]],
                [0, 0, 1]
            ])
            
            # Apply same calibration to test points
            X_test = np.column_stack([test_uncalibrated, np.ones(len(test_uncalibrated))])
            
            test_calibrated_x = X_test @ solution_x
            test_calibrated_y = X_test @ solution_y
            test_calibrated = np.column_stack([test_calibrated_x, test_calibrated_y])
            
            # Alternate display between uncalibrated and calibrated
            if (frame % 20) < 10:
                # Show uncalibrated
                target_scatter.set_offsets(test_points)
                click_scatter.set_offsets(test_uncalibrated)
                
                # Update error lines
                for i, line in enumerate(error_lines):
                    if i < len(test_points):
                        line.set_data(
                            [test_points[i, 0], test_uncalibrated[i, 0]],
                            [test_points[i, 1], test_uncalibrated[i, 1]]
                        )
                    else:
                        line.set_data([], [])
                
                before_errors = np.linalg.norm(test_points - test_uncalibrated, axis=1)
                avg_error = np.mean(before_errors)
                max_error = np.max(before_errors)
                
                matrix_text.set_text(f"Uncalibrated Test Points\nAverage Error: {avg_error:.2f} px\nMax Error: {max_error:.2f} px")
            else:
                # Show calibrated
                target_scatter.set_offsets(test_points)
                click_scatter.set_offsets(test_calibrated)
                
                # Update error lines
                for i, line in enumerate(error_lines):
                    if i < len(test_points):
                        line.set_data(
                            [test_points[i, 0], test_calibrated[i, 0]],
                            [test_points[i, 1], test_calibrated[i, 1]]
                        )
                    else:
                        line.set_data([], [])
                
                after_errors = np.linalg.norm(test_points - test_calibrated, axis=1)
                avg_error = np.mean(after_errors)
                max_error = np.max(after_errors)
                
                matrix_text.set_text(f"Calibrated Test Points\nAverage Error: {avg_error:.2f} px\nMax Error: {max_error:.2f} px")
        
        return [target_scatter, click_scatter, step_text, matrix_text, screen_rect] + error_lines
    
    # Create the animation
    anim = animation.FuncAnimation(fig, animate, frames=120, interval=50, blit=True)
    
    # Save the animation
    output_file = os.path.join(OUTPUT_DIR, 'calibration_workflow.gif')
    save_animation_as_gif(anim, output_file)
    plt.close()

def create_matrix_operations_animation():
    """
    Create an animation showing matrix operations for calibration:
    - Matrix multiplication
    - Matrix determinant
    - Matrix inverse
    - Solving linear systems
    """
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Matrix Operations for Calibration', fontsize=18)
    
    axes = axes.flatten()
    
    # Set titles for each subplot
    axes[0].set_title('Matrix Multiplication')
    axes[1].set_title('Matrix Determinant')
    axes[2].set_title('Matrix Inverse')
    axes[3].set_title('Linear System Solution')
    
    # Set up axes
    for ax in axes:
        ax.set_aspect('equal')
        ax.set_xlim(-3, 3)
        ax.set_ylim(-3, 3)
        ax.grid(True)
        ax.axhline(y=0, color='k', linestyle='-', alpha=0.3)
        ax.axvline(x=0, color='k', linestyle='-', alpha=0.3)
    
    # Create unit vectors
    unit_vectors = np.array([[1, 0], [0, 1]])
    
    # Create scatter plots for original unit vectors
    original_vectors = [ax.scatter(unit_vectors[:, 0], unit_vectors[:, 1], c='black', s=50, label='Original') for ax in axes]
    
    # Create scatter plots for transformed vectors
    transformed_vectors = [ax.scatter([], [], c='red', s=50, label='Transformed') for ax in axes]
    
    # Create lines for the unit square
    square_lines = []
    for ax in axes:
        # Create lines for the unit square
        for i in range(4):
            line, = ax.plot([], [], 'b-', lw=1, alpha=0.5)
            square_lines.append(line)
    
    # Text for matrix representation
    matrix_texts = [ax.text(-2.5, 2.5, '', fontsize=10, verticalalignment='top', family='monospace') for ax in axes]
    
    # Text for operation results
    result_texts = [ax.text(-2.5, -2.5, '', fontsize=10, verticalalignment='bottom', family='monospace') for ax in axes]
    
    # Add legends
    for ax in axes:
        ax.legend(loc='upper right')
    
    # Animation function
    def animate(i):
        t = i / 60  # Time parameter
        angle = t * np.pi * 2
        
        # Create rotating/shearing matrices
        matrices = []
        
        # 1. Rotation and scaling matrix for multiplication
        theta = angle
        scale = 1.5 + 0.5 * np.sin(angle)
        c, s = np.cos(theta), np.sin(theta)
        A1 = np.array([
            [scale * c, -scale * s],
            [scale * s, scale * c]
        ])
        matrices.append(A1)
        
        # 2. Shearing matrix for determinant
        shear_x = np.sin(angle)
        shear_y = np.cos(angle)
        A2 = np.array([
            [1, shear_x],
            [shear_y, 1]
        ])
        matrices.append(A2)
        
        # 3. Near-singular matrix for inverse
        epsilon = 0.5 * (1 + np.sin(angle))
        A3 = np.array([
            [1, 1],
            [1, 1 + epsilon]
        ])
        matrices.append(A3)
        
        # 4. System matrix for linear system solution
        # A * x = b
        A4 = np.array([
            [2, 1],
            [1, 3]
        ])
        b = np.array([3 + np.sin(angle), 2 + np.cos(angle)])
        matrices.append(A4)
        
        # Apply transformations to unit vectors
        transformed_unit_vectors = []
        for A in matrices:
            transformed_unit_vectors.append(unit_vectors @ A.T)
        
        # Update scatter plots
        for j, scatter in enumerate(transformed_vectors):
            scatter.set_offsets(transformed_unit_vectors[j])
        
        # Update square lines
        square_vertices = np.array([[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]])
        line_idx = 0
        for j, A in enumerate(matrices):
            # Transform square vertices
            transformed_square = square_vertices @ A.T
            
            # Update the lines for this subplot
            for k in range(len(square_vertices) - 1):
                x = [transformed_square[k, 0], transformed_square[k+1, 0]]
                y = [transformed_square[k, 1], transformed_square[k+1, 1]]
                square_lines[line_idx].set_data(x, y)
                line_idx += 1
        
        # Update matrix texts
        for j, (A, text) in enumerate(zip(matrices, matrix_texts)):
            matrix_str = f"Matrix A =\n[{A[0, 0]:.2f} {A[0, 1]:.2f}]\n[{A[1, 0]:.2f} {A[1, 1]:.2f}]"
            text.set_text(matrix_str)
        
        # Update result texts
        # 1. Multiplication result (vectors shown on plot)
        result_texts[0].set_text(f"A * e1 = [{matrices[0][0, 0]:.2f}, {matrices[0][1, 0]:.2f}]\nA * e2 = [{matrices[0][0, 1]:.2f}, {matrices[0][1, 1]:.2f}]")
        
        # 2. Determinant
        det_A2 = np.linalg.det(matrices[1])
        result_texts[1].set_text(f"det(A) = {det_A2:.2f}\nArea scale = {abs(det_A2):.2f}")
        
        # 3. Inverse
        try:
            A3_inv = np.linalg.inv(matrices[2])
            result_texts[2].set_text(f"A⁻¹ =\n[{A3_inv[0, 0]:.2f} {A3_inv[0, 1]:.2f}]\n[{A3_inv[1, 0]:.2f} {A3_inv[1, 1]:.2f}]")
        except np.linalg.LinAlgError:
            result_texts[2].set_text("Matrix is singular\n(not invertible)")
        
        # 4. Linear system solution
        try:
            # Solve Ax = b
            x = np.linalg.solve(matrices[3], b)
            result_texts[3].set_text(f"A * x = b\nx = [{x[0]:.2f}, {x[1]:.2f}]")
            
            # Show solution point
            transformed_vectors[3].set_offsets([x])
        except np.linalg.LinAlgError:
            result_texts[3].set_text("Cannot solve system\n(singular matrix)")
        
        return original_vectors + transformed_vectors + square_lines + matrix_texts + result_texts
    
    # Create the animation
    anim = animation.FuncAnimation(fig, animate, frames=120, interval=50, blit=True)
    
    # Save the animation
    output_file = os.path.join(OUTPUT_DIR, 'matrix_operations.gif')
    save_animation_as_gif(anim, output_file)
    plt.close()

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
      <img src="calibration_types.gif" alt="Calibration Types" />
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
      <img src="calibration_workflow.gif" alt="Calibration Workflow" />
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
      <img src="matrix_operations.gif" alt="Matrix Operations" />
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
    create_calibration_types_animation()
    create_calibration_workflow_animation()
    create_matrix_operations_animation()
    
    # Create HTML page
    create_calibration_html()
    
    print("Calibration visualizations complete. Output saved to:")
    print(OUTPUT_DIR)

if __name__ == "__main__":
    main()