#!/usr/bin/env python3
"""
Generate animated GIFs for the coordinate transformations in BrowserCoordinateKit.
This script creates simple animations that help visualize how the various coordinate
transformations work.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Rectangle, FancyArrowPatch
import matplotlib.transforms as mtransforms
from matplotlib import colors

# Create output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                          'outputs', 'mathematics', 'animations')

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def create_screen_to_normalized_animation():
    """Create an animation showing the screen-to-normalized transformation"""
    fig, ax = plt.subplots(figsize=(8, 6))
    fig.suptitle('Screen to Normalized Transformation', fontsize=16)
    
    # Set up axes
    ax.set_xlim(-0.2, 1.2)
    ax.set_ylim(-0.2, 1.2)
    ax.set_aspect('equal')
    ax.grid(True)
    
    # Add screen boundaries
    ax.axhline(y=0, color='k', linestyle='-', alpha=0.3)
    ax.axhline(y=1, color='k', linestyle='-', alpha=0.3)
    ax.axvline(x=0, color='k', linestyle='-', alpha=0.3)
    ax.axvline(x=1, color='k', linestyle='-', alpha=0.3)
    
    # Add coordinate labels
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    
    # Transformation parameters
    screen_width = 1000
    screen_height = 800
    
    # Generate a grid of points in screen coordinates
    x, y = np.meshgrid(np.linspace(100, 900, 5), np.linspace(100, 700, 5))
    screen_points = np.vstack([x.flatten(), y.flatten()]).T
    
    # Initialize scatter plots for points
    screen_scatter = ax.scatter([], [], c='blue', s=50, label='Screen Coords')
    norm_scatter = ax.scatter([], [], c='red', s=50, label='Normalized Coords')
    
    # Add legend
    ax.legend(loc='upper right')
    
    # Add explanation text
    text = ax.text(0.02, 0.98, "", 
                  transform=ax.transAxes, fontsize=10,
                  verticalalignment='top', bbox=dict(boxstyle='round', alpha=0.5))
    
    # Transformation formula
    formula = ax.text(0.5, 0.02, 
                     r"$T_{S→N}(p_s) = (\frac{x_s}{s_w}, \frac{y_s}{s_h})$", 
                     fontsize=12, ha='center', 
                     transform=ax.transAxes,
                     bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.7))
    
    # Animation function
    def update(frame):
        if frame < 30:
            # Display only screen coordinates
            alpha = min(1.0, frame / 15)
            # Normalize to [0, 1000] for x and [0, 800] for y
            normalized_x = screen_points[:, 0] / screen_width
            normalized_y = screen_points[:, 1] / screen_height
            
            screen_scatter.set_offsets(screen_points / np.array([screen_width, screen_height]))
            screen_scatter.set_alpha(alpha)
            norm_scatter.set_offsets(np.zeros_like(screen_points))
            norm_scatter.set_alpha(0)
            
            text.set_text(f"Step 1: Display screen coordinates\n"
                          f"Screen size: {screen_width}x{screen_height}px")
            
        elif frame < 60:
            # Animate the transition to normalized coordinates
            t = (frame - 30) / 30
            normalized_pts = screen_points / np.array([screen_width, screen_height])
            
            screen_scatter.set_offsets(normalized_pts)
            screen_scatter.set_alpha(1.0)
            norm_scatter.set_offsets(normalized_pts)
            norm_scatter.set_alpha(t)
            
            text.set_text(f"Step 2: Transform to normalized [0,1] range\n"
                          f"x_n = x_s / {screen_width}, y_n = y_s / {screen_height}")
            
        else:
            # Show the final normalized coordinates
            normalized_pts = screen_points / np.array([screen_width, screen_height])
            
            screen_scatter.set_offsets(normalized_pts)
            screen_scatter.set_alpha(0.3)
            norm_scatter.set_offsets(normalized_pts)
            norm_scatter.set_alpha(1.0)
            
            # Show example coordinates
            ex_screen = screen_points[12]  # Middle point
            ex_norm = normalized_pts[12]
            
            text.set_text(f"Final normalized coordinates\n"
                          f"Example: ({ex_screen[0]}, {ex_screen[1]}) → "
                          f"({ex_norm[0]:.3f}, {ex_norm[1]:.3f})")
        
        return screen_scatter, norm_scatter, text

    # Create animation
    ani = animation.FuncAnimation(fig, update, frames=90, interval=50, blit=True)
    
    # Save as GIF
    ani.save(os.path.join(OUTPUT_DIR, 'screen_to_normalized.gif'), 
             writer='pillow', fps=20, dpi=100)
    
    plt.close()
    print(f"Saved screen-to-normalized animation")

def create_screen_to_browser_animation():
    """Create an animation showing the screen-to-browser transformation"""
    fig, ax = plt.subplots(figsize=(8, 6))
    fig.suptitle('Screen to Browser Transformation', fontsize=16)
    
    # Set up axes
    ax.set_xlim(-100, 1100)
    ax.set_ylim(-100, 900)
    ax.set_aspect('equal')
    ax.grid(True)
    
    # Add coordinate labels
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    
    # Transformation parameters
    browser_x = 200
    browser_y = 150
    
    # Create screen and browser rectangles
    screen_rect = Rectangle((0, 0), 1000, 800, fill=False, edgecolor='blue', linestyle='-', linewidth=2, label='Screen')
    browser_rect = Rectangle((browser_x, browser_y), 600, 500, fill=False, edgecolor='red', linestyle='-', linewidth=2, label='Browser')
    
    ax.add_patch(screen_rect)
    ax.add_patch(browser_rect)
    
    # Generate points in screen coordinates
    np.random.seed(42)
    n_points = 8
    screen_points = np.random.uniform(0, 1000, (n_points, 2))
    screen_points[:, 1] = np.random.uniform(0, 800, n_points)
    
    # Points that fall within browser bounds
    mask = ((screen_points[:, 0] >= browser_x) & 
            (screen_points[:, 0] <= browser_x + 600) &
            (screen_points[:, 1] >= browser_y) & 
            (screen_points[:, 1] <= browser_y + 500))
    
    # Ensure at least 5 points are within browser
    while np.sum(mask) < 5:
        new_point = np.array([
            np.random.uniform(browser_x, browser_x + 600),
            np.random.uniform(browser_y, browser_y + 500)
        ])
        screen_points = np.vstack([screen_points, new_point])
        mask = np.append(mask, True)
    
    # Initialize scatter plots for points
    screen_scatter = ax.scatter([], [], c='blue', s=50, label='Screen Coords')
    browser_scatter = ax.scatter([], [], c='red', s=50, label='Browser Coords')
    
    # Add legend
    ax.legend(loc='upper right')
    
    # Add explanation text
    text = ax.text(0.02, 0.98, "", 
                  transform=ax.transAxes, fontsize=10,
                  verticalalignment='top', bbox=dict(boxstyle='round', alpha=0.5))
    
    # Transformation formula
    formula = ax.text(0.5, 0.02, 
                     r"$T_{S→B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)$", 
                     fontsize=12, ha='center', 
                     transform=ax.transAxes,
                     bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.7))
    
    # Animation function
    def update(frame):
        if frame < 30:
            # Display screen coordinates and browser window
            alpha = min(1.0, frame / 15)
            screen_scatter.set_offsets(screen_points)
            screen_scatter.set_alpha(alpha)
            browser_scatter.set_offsets(np.zeros_like(screen_points))
            browser_scatter.set_alpha(0)
            
            text.set_text(f"Step 1: Screen coordinates\n"
                         f"Browser position: ({browser_x}, {browser_y})")
            
        elif frame < 60:
            # Animate the transition to browser coordinates
            t = (frame - 30) / 30
            browser_pts = screen_points - np.array([browser_x, browser_y])
            
            screen_scatter.set_offsets(screen_points)
            screen_scatter.set_alpha(1.0 - 0.7*t)
            browser_scatter.set_offsets(screen_points - t * np.array([browser_x, browser_y]))
            browser_scatter.set_alpha(t)
            
            text.set_text(f"Step 2: Transform to browser coordinates\n"
                         f"x_b = x_s - {browser_x}, y_b = y_s - {browser_y}")
            
        else:
            # Show the final browser coordinates
            browser_pts = screen_points - np.array([browser_x, browser_y])
            
            screen_scatter.set_offsets(screen_points)
            screen_scatter.set_alpha(0.3)
            browser_scatter.set_offsets(browser_pts)
            browser_scatter.set_alpha(1.0)
            
            # Show example coordinates
            idx = np.where(mask)[0][0]  # Use a point within browser
            ex_screen = screen_points[idx]
            ex_browser = browser_pts[idx]
            
            text.set_text(f"Final browser coordinates\n"
                         f"Example: ({ex_screen[0]:.0f}, {ex_screen[1]:.0f}) → "
                         f"({ex_browser[0]:.0f}, {ex_browser[1]:.0f})")
        
        return screen_scatter, browser_scatter, text

    # Create animation
    ani = animation.FuncAnimation(fig, update, frames=90, interval=50, blit=True)
    
    # Save as GIF
    ani.save(os.path.join(OUTPUT_DIR, 'screen_to_browser.gif'), 
             writer='pillow', fps=20, dpi=100)
    
    plt.close()
    print(f"Saved screen-to-browser animation")

def create_browser_to_logical_animation():
    """Create an animation showing the browser-to-logical (DPI scaling) transformation"""
    fig, ax = plt.subplots(figsize=(8, 6))
    fig.suptitle('Browser to Logical Transformation (DPI Scaling)', fontsize=16)
    
    # Set up axes
    ax.set_xlim(-10, 110)
    ax.set_ylim(-10, 110)
    ax.set_aspect('equal')
    ax.grid(True)
    
    # Add coordinate labels
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    
    # Transformation parameters
    dpi_scale = 1.5  # e.g., 150% scaling
    
    # Create browser and logical rectangles
    browser_rect = Rectangle((0, 0), 100, 80, fill=False, edgecolor='red', linestyle='-', linewidth=2, label='Browser (physical)')
    logical_rect = Rectangle((0, 0), 100/dpi_scale, 80/dpi_scale, fill=False, edgecolor='green', linestyle='-', linewidth=2, label='Logical')
    
    ax.add_patch(browser_rect)
    ax.add_patch(logical_rect)
    
    # Generate a grid of points in browser coordinates
    x, y = np.meshgrid(np.linspace(10, 90, 5), np.linspace(10, 70, 4))
    browser_points = np.vstack([x.flatten(), y.flatten()]).T
    
    # Initialize scatter plots for points
    browser_scatter = ax.scatter([], [], c='red', s=50, label='Browser Coords')
    logical_scatter = ax.scatter([], [], c='green', s=50, label='Logical Coords')
    
    # Add legend
    ax.legend(loc='upper right')
    
    # Add explanation text
    text = ax.text(0.02, 0.98, "", 
                  transform=ax.transAxes, fontsize=10,
                  verticalalignment='top', bbox=dict(boxstyle='round', alpha=0.5))
    
    # Transformation formula
    formula = ax.text(0.5, 0.02, 
                     r"$T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)$", 
                     fontsize=12, ha='center', 
                     transform=ax.transAxes,
                     bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.7))
    
    # Animation function
    def update(frame):
        if frame < 30:
            # Display browser coordinates
            alpha = min(1.0, frame / 15)
            browser_scatter.set_offsets(browser_points)
            browser_scatter.set_alpha(alpha)
            logical_scatter.set_offsets(np.zeros_like(browser_points))
            logical_scatter.set_alpha(0)
            
            text.set_text(f"Step 1: Browser coordinates (physical pixels)\n"
                         f"DPI Scaling factor: {dpi_scale}")
            
        elif frame < 60:
            # Animate the transition to logical coordinates
            t = (frame - 30) / 30
            logical_pts = browser_points / dpi_scale
            
            # Interpolate between browser and logical coordinates
            current_pts = browser_points * (1-t) + logical_pts * t
            
            browser_scatter.set_offsets(browser_points)
            browser_scatter.set_alpha(1.0 - 0.7*t)
            logical_scatter.set_offsets(current_pts)
            logical_scatter.set_alpha(t)
            
            text.set_text(f"Step 2: Apply DPI scaling\n"
                         f"x_l = x_b / {dpi_scale}, y_l = y_b / {dpi_scale}")
            
        else:
            # Show the final logical coordinates
            logical_pts = browser_points / dpi_scale
            
            browser_scatter.set_offsets(browser_points)
            browser_scatter.set_alpha(0.3)
            logical_scatter.set_offsets(logical_pts)
            logical_scatter.set_alpha(1.0)
            
            # Show example coordinates
            ex_browser = browser_points[10]  # Pick a point
            ex_logical = logical_pts[10]
            
            text.set_text(f"Final logical coordinates\n"
                         f"Example: ({ex_browser[0]:.1f}, {ex_browser[1]:.1f}) → "
                         f"({ex_logical[0]:.1f}, {ex_logical[1]:.1f})")
        
        return browser_scatter, logical_scatter, text

    # Create animation
    ani = animation.FuncAnimation(fig, update, frames=90, interval=50, blit=True)
    
    # Save as GIF
    ani.save(os.path.join(OUTPUT_DIR, 'browser_to_logical.gif'), 
             writer='pillow', fps=20, dpi=100)
    
    plt.close()
    print(f"Saved browser-to-logical animation")

def create_calibration_animation():
    """Create an animation showing the calibration process"""
    fig, ax = plt.subplots(figsize=(8, 6))
    fig.suptitle('Calibration Process', fontsize=16)
    
    # Set up axes
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.set_aspect('equal')
    ax.grid(True)
    
    # Add coordinate labels
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    
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
    
    # Initialize scatter plots
    target_scatter = ax.scatter([], [], c='blue', s=80, label='Target Points')
    actual_scatter = ax.scatter([], [], c='red', s=80, label='Actual Clicks')
    calibrated_scatter = ax.scatter([], [], c='green', s=80, label='Calibrated')
    
    # Add legend
    ax.legend(loc='upper right')
    
    # Add explanation text
    text = ax.text(0.02, 0.98, "", 
                  transform=ax.transAxes, fontsize=10,
                  verticalalignment='top', bbox=dict(boxstyle='round', alpha=0.5))
    
    # Animation function
    def update(frame):
        if frame < 30:
            # Step 1: Show calibration target points
            alpha = min(1.0, frame / 15)
            target_scatter.set_offsets(calibration_points)
            target_scatter.set_alpha(alpha)
            actual_scatter.set_offsets(np.zeros_like(calibration_points))
            actual_scatter.set_alpha(0)
            calibrated_scatter.set_offsets(np.zeros_like(calibration_points))
            calibrated_scatter.set_alpha(0)
            
            text.set_text("Step 1: Generate calibration target points")
            
        elif frame < 60:
            # Step 2: Show actual clicks with errors
            t = (frame - 30) / 30
            target_scatter.set_offsets(calibration_points)
            target_scatter.set_alpha(1.0)
            actual_scatter.set_offsets(actual_points)
            actual_scatter.set_alpha(t)
            calibrated_scatter.set_offsets(np.zeros_like(calibration_points))
            calibrated_scatter.set_alpha(0)
            
            text.set_text("Step 2: Record actual click positions\n(with errors)")
            
        elif frame < 90:
            # Step 3: Calculate calibration and show calibrated points
            t = (frame - 60) / 30
            target_scatter.set_offsets(calibration_points)
            target_scatter.set_alpha(1.0)
            actual_scatter.set_offsets(actual_points)
            actual_scatter.set_alpha(1.0 - 0.7*t)
            
            # Interpolate between actual and calibrated points
            current = actual_points * (1-t) + calibrated_points * t
            calibrated_scatter.set_offsets(current)
            calibrated_scatter.set_alpha(t)
            
            text.set_text("Step 3: Calculate calibration parameters\nand apply correction")
            
        else:
            # Step 4: Test with new points
            target_scatter.set_offsets(test_points)
            target_scatter.set_alpha(1.0)
            actual_scatter.set_offsets(test_actual)
            actual_scatter.set_alpha(0.4)
            calibrated_scatter.set_offsets(test_calibrated)
            calibrated_scatter.set_alpha(1.0)
            
            # Calculate average errors
            before_errors = np.linalg.norm(test_points - test_actual, axis=1)
            after_errors = np.linalg.norm(test_points - test_calibrated, axis=1)
            
            avg_before = np.mean(before_errors)
            avg_after = np.mean(after_errors)
            
            text.set_text(f"Step 4: Test calibration with new points\n"
                         f"Average Error Before: {avg_before:.2f}px\n"
                         f"Average Error After: {avg_after:.2f}px\n"
                         f"Improvement: {100 * (1 - avg_after/avg_before):.1f}%")
        
        return target_scatter, actual_scatter, calibrated_scatter, text

    # Create animation
    ani = animation.FuncAnimation(fig, update, frames=120, interval=50, blit=True)
    
    # Save as GIF
    ani.save(os.path.join(OUTPUT_DIR, 'calibration_process.gif'), 
             writer='pillow', fps=20, dpi=100)
    
    plt.close()
    print(f"Saved calibration process animation")

def create_composite_transformation_animation():
    """Create an animation showing a composite transformation pipeline"""
    fig, ax = plt.subplots(figsize=(10, 6))
    fig.suptitle('Composite Coordinate Transformation Pipeline', fontsize=16)
    
    # Set up axes
    ax.set_xlim(-50, 1050)
    ax.set_ylim(-50, 850)
    ax.set_aspect('equal')
    ax.grid(True)
    
    # Add coordinate labels
    ax.set_xlabel('x')
    ax.set_ylabel('y')
    
    # Transformation parameters
    screen_width = 1000
    screen_height = 800
    browser_x = 200
    browser_y = 150
    browser_width = 600
    browser_height = 500
    dpi_scale = 1.5
    
    # Create screen and browser rectangles
    screen_rect = Rectangle((0, 0), screen_width, screen_height, 
                          fill=False, edgecolor='blue', linestyle='-', linewidth=2, label='Screen')
    browser_rect = Rectangle((browser_x, browser_y), browser_width, browser_height, 
                           fill=False, edgecolor='red', linestyle='-', linewidth=2, label='Browser')
    logical_rect = Rectangle((browser_x, browser_y), browser_width/dpi_scale, browser_height/dpi_scale, 
                           fill=False, edgecolor='green', linestyle='--', linewidth=2, label='Logical')
    
    # Generate a few points in screen coordinates that fall within browser
    points = np.array([
        [300, 250],
        [500, 300],
        [400, 400],
        [600, 500],
        [700, 350]
    ])
    
    # Create transformation steps for each point
    screen_pts = points.copy()
    browser_pts = points - np.array([browser_x, browser_y])
    logical_pts = browser_pts / dpi_scale
    
    # Initialize scatter plots for points
    screen_scatter = ax.scatter([], [], c='blue', s=80, label='Screen')
    browser_scatter = ax.scatter([], [], c='red', s=80, label='Browser')
    logical_scatter = ax.scatter([], [], c='green', s=80, label='Logical')
    
    # Add explanation text
    text = ax.text(0.02, 0.98, "", transform=ax.transAxes, fontsize=10,
                  verticalalignment='top', bbox=dict(boxstyle='round', alpha=0.5))
    
    # Transformation formula
    formula_text = ax.text(0.5, 0.02, "", fontsize=12, ha='center', transform=ax.transAxes,
                         bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.7))
    
    # Add rectangles at the beginning of the animation
    def init():
        ax.add_patch(screen_rect)
        ax.add_patch(browser_rect)
        ax.add_patch(logical_rect)
        
        # Make rectangles visible/invisible based on animation phase
        screen_rect.set_visible(True)
        browser_rect.set_visible(False)
        logical_rect.set_visible(False)
        
        # Legend will be added in the animation
        return screen_scatter, browser_scatter, logical_scatter, text, formula_text

    # Animation function
    def update(frame):
        if frame < 30:
            # Phase 1: Show screen coordinates
            alpha = min(1.0, frame / 15)
            
            screen_scatter.set_offsets(screen_pts)
            screen_scatter.set_alpha(alpha)
            browser_scatter.set_offsets(np.zeros_like(screen_pts))
            browser_scatter.set_alpha(0)
            logical_scatter.set_offsets(np.zeros_like(screen_pts))
            logical_scatter.set_alpha(0)
            
            screen_rect.set_visible(True)
            browser_rect.set_visible(False)
            logical_rect.set_visible(False)
            
            text.set_text("Step 1: Screen coordinates (physical pixels)\nOrigin at screen top-left")
            formula_text.set_text("")
            
        elif frame < 60:
            # Phase 2: Screen to browser transition
            t = (frame - 30) / 30
            
            # Interpolate between screen and browser coordinates
            current = screen_pts * (1-t) + (browser_pts + np.array([browser_x, browser_y])) * t
            
            screen_scatter.set_offsets(screen_pts)
            screen_scatter.set_alpha(1.0 - 0.7*t)
            browser_scatter.set_offsets(current)
            browser_scatter.set_alpha(t)
            logical_scatter.set_offsets(np.zeros_like(screen_pts))
            logical_scatter.set_alpha(0)
            
            screen_rect.set_visible(True)
            browser_rect.set_visible(True)
            logical_rect.set_visible(False)
            
            text.set_text(f"Step 2: Screen to Browser transformation\n"
                         f"Subtracting browser position ({browser_x}, {browser_y})")
            formula_text.set_text(r"$T_{S→B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)$")
            
        elif frame < 90:
            # Phase 3: Browser to logical transition
            t = (frame - 60) / 30
            
            # Start with browser coordinates
            browser_scatter.set_offsets(browser_pts + np.array([browser_x, browser_y]))
            browser_scatter.set_alpha(1.0 - 0.7*t)
            
            # Interpolate towards logical coordinates
            current_logical = browser_pts * (1-t) + logical_pts * t
            logical_scatter.set_offsets(current_logical + np.array([browser_x, browser_y]))
            logical_scatter.set_alpha(t)
            
            screen_scatter.set_offsets(screen_pts)
            screen_scatter.set_alpha(0.3)
            
            screen_rect.set_visible(True)
            browser_rect.set_visible(True)
            logical_rect.set_visible(True)
            
            text.set_text(f"Step 3: Browser to Logical transformation\n"
                         f"Dividing by DPI scale factor ({dpi_scale})")
            formula_text.set_text(r"$T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)$")
            
        else:
            # Final phase: Show all coordinate systems
            screen_scatter.set_offsets(screen_pts)
            screen_scatter.set_alpha(0.4)
            
            browser_scatter.set_offsets(browser_pts + np.array([browser_x, browser_y]))
            browser_scatter.set_alpha(0.6)
            
            logical_scatter.set_offsets(logical_pts + np.array([browser_x, browser_y]))
            logical_scatter.set_alpha(1.0)
            
            screen_rect.set_visible(True)
            browser_rect.set_visible(True)
            logical_rect.set_visible(True)
            
            # Example coordinate conversion
            ex_idx = 2  # Pick a point
            ex_screen = screen_pts[ex_idx]
            ex_browser = browser_pts[ex_idx]
            ex_logical = logical_pts[ex_idx]
            
            text.set_text(f"Complete transformation pipeline\n"
                         f"Example conversion:\n"
                         f"Screen: ({ex_screen[0]:.0f}, {ex_screen[1]:.0f}) → "
                         f"Browser: ({ex_browser[0]:.0f}, {ex_browser[1]:.0f}) → "
                         f"Logical: ({ex_logical[0]:.1f}, {ex_logical[1]:.1f})")
            formula_text.set_text(r"$T_{S→L}(p_s) = T_{B→L}(T_{S→B}(p_s)) = (p_s - b)/σ$")
        
        # Make sure rectangles are below points
        for rect in [screen_rect, browser_rect, logical_rect]:
            ax.figure.canvas.draw()
            rect.set_zorder(0)
        
        return screen_scatter, browser_scatter, logical_scatter, text, formula_text

    # Create animation
    ani = animation.FuncAnimation(fig, update, frames=120, interval=50, blit=True, init_func=init)
    
    # Save as GIF
    ani.save(os.path.join(OUTPUT_DIR, 'composite_transformation.gif'), 
             writer='pillow', fps=20, dpi=100)
    
    plt.close()
    print(f"Saved composite transformation animation")

def create_html_page():
    """Create an HTML page to view all the animations"""
    html_content = """<!DOCTYPE html>
<html>
<head>
  <title>BrowserCoordinateKit Animated Visualizations</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .card { border: 1px solid #ccc; margin: 20px 0; padding: 15px; border-radius: 5px; }
    .animation { text-align: center; margin: 15px 0; }
    img { max-width: 100%; border: 1px solid #eee; }
    .nav { margin: 20px 0; }
    .nav a { margin-right: 15px; text-decoration: none; }
  </style>
</head>
<body>
  <h1>BrowserCoordinateKit Animated Visualizations</h1>
  <p>This page contains animated GIFs that demonstrate the coordinate transformations in BrowserCoordinateKit.</p>
  
  <div class="nav">
    <a href="../index.html">Mathematical Overview</a>
    <a href="../validation/validation.html">Symbolic Validations</a>
    <a href="../calibration/index.html">Calibration System</a>
  </div>
  
  <div class="card">
    <h2>Screen to Normalized Transformation</h2>
    <p>The Screen-to-Normalized transformation converts physical screen coordinates to normalized [0,1] coordinates that are independent of screen size.</p>
    <p>Formula: <code>T_{S→N}(p_s) = (x_s/s_w, y_s/s_h)</code></p>
    <div class="animation">
      <img src="screen_to_normalized.gif" alt="Screen to Normalized Animation" />
    </div>
  </div>
  
  <div class="card">
    <h2>Screen to Browser Transformation</h2>
    <p>The Screen-to-Browser transformation converts screen coordinates to browser window coordinates by subtracting the browser position.</p>
    <p>Formula: <code>T_{S→B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)</code></p>
    <div class="animation">
      <img src="screen_to_browser.gif" alt="Screen to Browser Animation" />
    </div>
  </div>
  
  <div class="card">
    <h2>Browser to Logical Transformation (DPI Scaling)</h2>
    <p>The Browser-to-Logical transformation applies DPI scaling to convert physical browser coordinates to logical coordinates.</p>
    <p>Formula: <code>T_{B→L}(p_b) = p_b/σ = (x_b/σ, y_b/σ)</code></p>
    <div class="animation">
      <img src="browser_to_logical.gif" alt="Browser to Logical Animation" />
    </div>
  </div>
  
  <div class="card">
    <h2>Composite Transformation Pipeline</h2>
    <p>This animation shows how the different transformations can be composed to convert between various coordinate systems.</p>
    <p>Formula: <code>T_{S→L}(p_s) = T_{B→L}(T_{S→B}(p_s)) = (p_s - b)/σ</code></p>
    <div class="animation">
      <img src="composite_transformation.gif" alt="Composite Transformation Animation" />
    </div>
  </div>
  
  <div class="card">
    <h2>Calibration Process</h2>
    <p>This animation demonstrates the calibration process, from generating calibration points to applying the calibration to correct positional errors.</p>
    <div class="animation">
      <img src="calibration_process.gif" alt="Calibration Process Animation" />
    </div>
  </div>
  
  <div class="footer">
    <p>These animations were generated using Python's matplotlib library to demonstrate the coordinate transformations implemented in BrowserCoordinateKit.</p>
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
    print("Generating animated visualizations for BrowserCoordinateKit...")
    
    # Create animations
    create_screen_to_normalized_animation()
    create_screen_to_browser_animation()
    create_browser_to_logical_animation()
    create_composite_transformation_animation()
    create_calibration_animation()
    
    # Create HTML page
    create_html_page()
    
    print("Animation generation complete. Output saved to:")
    print(OUTPUT_DIR)

if __name__ == "__main__":
    main()