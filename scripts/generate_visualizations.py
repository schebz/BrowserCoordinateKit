#!/usr/bin/env python3
"""
Generate visualizations and animated GIFs for BrowserCoordinateKit transformations.

This script creates visual representations of the mathematical transformations
defined in the BrowserCoordinateKit library and saves them as animated GIFs.
"""

import os
import json
import math
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Rectangle, FancyArrowPatch
from matplotlib.path import Path
from matplotlib.transforms import Affine2D
import imageio
from PIL import Image, ImageDraw, ImageFont

# Output directory for visualizations
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                         'outputs', 'mathematics', 'visualizations')

# Create directories if they don't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Configuration
SCREEN_WIDTH = 1920
SCREEN_HEIGHT = 1080
BROWSER_POSITION = {'x': 200, 'y': 100}
BROWSER_WIDTH = 1600
BROWSER_HEIGHT = 900
DPI_SCALING = 1.5
ANIMATION_FRAMES = 60
FPS = 30
POINT_COLOR = '#cc3333'
TRANSFORM_COLOR = '#3333cc'
GRID_COLOR = '#cccccc'
BACKGROUND_COLOR = '#f8f8f8'
BROWSER_COLOR = '#dddddd'

def create_screen_to_normalized_animation():
    """
    Create an animation showing the screen-to-normalized transformation.
    """
    print("Generating Screen-to-Normalized animation...")
    
    # Create figure and axes
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_aspect('equal')
    ax.set_xlim(0, SCREEN_WIDTH)
    ax.set_ylim(0, SCREEN_HEIGHT)
    
    # Set background color
    fig.patch.set_facecolor(BACKGROUND_COLOR)
    ax.set_facecolor(BACKGROUND_COLOR)
    
    # Draw screen coordinate grid
    for x in range(0, SCREEN_WIDTH + 1, 200):
        ax.axvline(x, color=GRID_COLOR, linestyle='-', linewidth=0.5)
        if x > 0:
            ax.text(x, 20, f"{x}px", fontsize=8, color='black')
    
    for y in range(0, SCREEN_HEIGHT + 1, 200):
        ax.axhline(y, color=GRID_COLOR, linestyle='-', linewidth=0.5)
        if y > 0:
            ax.text(20, y, f"{y}px", fontsize=8, color='black')
    
    # Title and labels
    ax.set_title("Screen-to-Normalized Transformation")
    ax.text(50, 50, "T(p_s) = (x_s/width, y_s/height)", fontsize=12, 
            bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'))
    
    # Source point in screen coordinates
    source_point_x, source_point_y = 960, 540  # center of screen
    
    # Calculate normalized coordinates
    normalized_x = source_point_x / SCREEN_WIDTH
    normalized_y = source_point_y / SCREEN_HEIGHT
    
    # Add normalized coordinate info
    ax.text(50, SCREEN_HEIGHT - 50, 
            f"Normalized: ({normalized_x:.2f}, {normalized_y:.2f})", 
            fontsize=10, bbox=dict(facecolor='white', alpha=0.7))
    
    # Create animation elements
    point = plt.Circle((source_point_x, source_point_y), 10, color=POINT_COLOR)
    ax.add_patch(point)
    
    transformed_point = plt.Circle((source_point_x, source_point_y), 10, color=TRANSFORM_COLOR)
    ax.add_patch(transformed_point)
    
    # Create line connecting the points
    line, = ax.plot([source_point_x, source_point_x], 
                     [source_point_y, source_point_y], 
                     'k--', linewidth=1)
    
    # Animation function
    def animate(i):
        t = i / ANIMATION_FRAMES
        
        # Oscillate between screen and normalized coordinates
        progress = (math.sin(t * 2 * math.pi) + 1) / 2
        
        # Calculate transformed position
        curr_x = source_point_x * (1 - progress) + (normalized_x * SCREEN_WIDTH) * progress
        curr_y = source_point_y * (1 - progress) + (normalized_y * SCREEN_HEIGHT) * progress
        
        # Update transformed point
        transformed_point.center = (curr_x, curr_y)
        
        # Update connecting line
        line.set_data([source_point_x, curr_x], [source_point_y, curr_y])
        
        return point, transformed_point, line
    
    # Create animation
    anim = animation.FuncAnimation(fig, animate, frames=ANIMATION_FRAMES, 
                                  interval=1000//FPS, blit=True)
    
    # Save as GIF
    output_path = os.path.join(OUTPUT_DIR, 'screen_to_normalized.gif')
    anim.save(output_path, writer='pillow', fps=FPS)
    print(f"Saved to {output_path}")
    
    # Close the figure
    plt.close(fig)
    
    return output_path

def create_browser_position_animation():
    """
    Create an animation showing the screen-to-browser transformation.
    """
    print("Generating Screen-to-Browser animation...")
    
    # Create figure and axes
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_aspect('equal')
    ax.set_xlim(0, SCREEN_WIDTH)
    ax.set_ylim(0, SCREEN_HEIGHT)
    
    # Set background color
    fig.patch.set_facecolor(BACKGROUND_COLOR)
    ax.set_facecolor(BACKGROUND_COLOR)
    
    # Draw screen coordinate grid
    for x in range(0, SCREEN_WIDTH + 1, 200):
        ax.axvline(x, color=GRID_COLOR, linestyle='-', linewidth=0.5)
        if x > 0:
            ax.text(x, 20, f"{x}px", fontsize=8, color='black')
    
    for y in range(0, SCREEN_HEIGHT + 1, 200):
        ax.axhline(y, color=GRID_COLOR, linestyle='-', linewidth=0.5)
        if y > 0:
            ax.text(20, y, f"{y}px", fontsize=8, color='black')
    
    # Draw browser window
    browser_rect = Rectangle((BROWSER_POSITION['x'], BROWSER_POSITION['y']), 
                          BROWSER_WIDTH, BROWSER_HEIGHT, 
                          fill=True, alpha=0.2, color=BROWSER_COLOR, 
                          linewidth=2, edgecolor='black')
    ax.add_patch(browser_rect)
    
    # Label the browser
    ax.text(BROWSER_POSITION['x'] + 10, BROWSER_POSITION['y'] + 30, 
            f"Browser Window\n({BROWSER_POSITION['x']}, {BROWSER_POSITION['y']})", 
            fontsize=10, bbox=dict(facecolor='white', alpha=0.7))
    
    # Title and formula
    ax.set_title("Screen-to-Browser Transformation")
    ax.text(50, 50, "T(p_s) = (x_s - b_x, y_s - b_y)", fontsize=12, 
            bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'))
    
    # Source point in screen coordinates
    source_point_x, source_point_y = 960, 540  # center of screen
    
    # Calculate browser coordinates
    browser_x = source_point_x - BROWSER_POSITION['x']
    browser_y = source_point_y - BROWSER_POSITION['y']
    
    # Add browser coordinate info
    ax.text(50, SCREEN_HEIGHT - 50, 
            f"Browser: ({browser_x:.0f}, {browser_y:.0f})", 
            fontsize=10, bbox=dict(facecolor='white', alpha=0.7))
    
    # Create animation elements
    point = plt.Circle((source_point_x, source_point_y), 10, color=POINT_COLOR)
    ax.add_patch(point)
    
    transformed_point = plt.Circle((source_point_x, source_point_y), 10, color=TRANSFORM_COLOR)
    ax.add_patch(transformed_point)
    
    # Create line connecting the points
    line, = ax.plot([source_point_x, source_point_x], 
                   [source_point_y, source_point_y], 
                   'k--', linewidth=1)
    
    # Create coordinate axes at browser origin
    browser_axes_x = plt.Arrow(BROWSER_POSITION['x'], BROWSER_POSITION['y'], 100, 0, 
                            width=5, color='red')
    browser_axes_y = plt.Arrow(BROWSER_POSITION['x'], BROWSER_POSITION['y'], 0, 100, 
                            width=5, color='green')
    ax.add_patch(browser_axes_x)
    ax.add_patch(browser_axes_y)
    
    # Label axes
    ax.text(BROWSER_POSITION['x'] + 110, BROWSER_POSITION['y'], 'X', color='red')
    ax.text(BROWSER_POSITION['x'], BROWSER_POSITION['y'] + 110, 'Y', color='green')
    
    # Animation function
    def animate(i):
        t = i / ANIMATION_FRAMES
        
        # Oscillate between screen and browser coordinates
        progress = (math.sin(t * 2 * math.pi) + 1) / 2
        
        # Calculate transformed position
        curr_x = source_point_x * (1 - progress) + (browser_x + BROWSER_POSITION['x']) * progress
        curr_y = source_point_y * (1 - progress) + (browser_y + BROWSER_POSITION['y']) * progress
        
        # Update transformed point
        transformed_point.center = (curr_x, curr_y)
        
        # Update connecting line
        line.set_data([source_point_x, curr_x], [source_point_y, curr_y])
        
        return point, transformed_point, line
    
    # Create animation
    anim = animation.FuncAnimation(fig, animate, frames=ANIMATION_FRAMES, 
                                  interval=1000//FPS, blit=True)
    
    # Save as GIF
    output_path = os.path.join(OUTPUT_DIR, 'screen_to_browser.gif')
    anim.save(output_path, writer='pillow', fps=FPS)
    print(f"Saved to {output_path}")
    
    # Close the figure
    plt.close(fig)
    
    return output_path

def create_dpi_scaling_animation():
    """
    Create an animation showing the browser-to-logical transformation (DPI scaling).
    """
    print("Generating DPI-Scaling animation...")
    
    # Create figure and axes
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_aspect('equal')
    
    # Calculate logical dimensions
    logical_width = BROWSER_WIDTH / DPI_SCALING
    logical_height = BROWSER_HEIGHT / DPI_SCALING
    
    # Limit view to browser coordinates
    browser_margin = 100
    ax.set_xlim(0 - browser_margin, BROWSER_WIDTH + browser_margin)
    ax.set_ylim(0 - browser_margin, BROWSER_HEIGHT + browser_margin)
    
    # Set background color
    fig.patch.set_facecolor(BACKGROUND_COLOR)
    ax.set_facecolor(BACKGROUND_COLOR)
    
    # Draw browser coordinate grid
    for x in range(0, BROWSER_WIDTH + 1, 200):
        ax.axvline(x, color=GRID_COLOR, linestyle='-', linewidth=0.5)
        if x > 0:
            ax.text(x, 20, f"{x}px", fontsize=8, color='black')
    
    for y in range(0, BROWSER_HEIGHT + 1, 200):
        ax.axhline(y, color=GRID_COLOR, linestyle='-', linewidth=0.5)
        if y > 0:
            ax.text(20, y, f"{y}px", fontsize=8, color='black')
    
    # Draw logical coordinate boundary
    logical_rect = Rectangle((0, 0), logical_width, logical_height, 
                          fill=False, linestyle='dashed', 
                          linewidth=2, edgecolor='blue')
    ax.add_patch(logical_rect)
    
    # Label the coordinate systems
    ax.text(10, 50, "Browser Coordinates", color='black', fontsize=10, 
            bbox=dict(facecolor='white', alpha=0.7))
    ax.text(10, 80, "Logical Coordinates", color='blue', fontsize=10, 
            bbox=dict(facecolor='white', alpha=0.7))
    
    # Title and formula
    ax.set_title("Browser-to-Logical Transformation (DPI Scaling)")
    ax.text(50, BROWSER_HEIGHT - 50, f"T(p_b) = (x_b/σ, y_b/σ), σ = {DPI_SCALING}", fontsize=12, 
            bbox=dict(facecolor='white', alpha=0.7, boxstyle='round'))
    
    # Source point in browser coordinates
    source_point_x, source_point_y = BROWSER_WIDTH / 2, BROWSER_HEIGHT / 2
    
    # Calculate logical coordinates
    logical_x = source_point_x / DPI_SCALING
    logical_y = source_point_y / DPI_SCALING
    
    # Add logical coordinate info
    ax.text(BROWSER_WIDTH - 300, 50, 
            f"Browser: ({source_point_x:.0f}, {source_point_y:.0f})", 
            fontsize=10, bbox=dict(facecolor='white', alpha=0.7))
    ax.text(BROWSER_WIDTH - 300, 80, 
            f"Logical: ({logical_x:.2f}, {logical_y:.2f})", 
            fontsize=10, bbox=dict(facecolor='white', alpha=0.7))
    
    # Create animation elements
    point = plt.Circle((source_point_x, source_point_y), 10, color=POINT_COLOR)
    ax.add_patch(point)
    
    transformed_point = plt.Circle((source_point_x, source_point_y), 10 / DPI_SCALING, color=TRANSFORM_COLOR)
    ax.add_patch(transformed_point)
    
    # Create line connecting the points
    line, = ax.plot([source_point_x, source_point_x], 
                   [source_point_y, source_point_y], 
                   'k--', linewidth=1)
    
    # Show DPI scale factor
    scale_text = ax.text(BROWSER_WIDTH / 2, BROWSER_HEIGHT - 100, 
                        f"DPI Scaling: {DPI_SCALING}x", 
                        fontsize=14, ha='center', 
                        bbox=dict(facecolor='white', alpha=0.7))
    
    # Animation function
    def animate(i):
        t = i / ANIMATION_FRAMES
        
        # Oscillate between browser and logical coordinates
        progress = (math.sin(t * 2 * math.pi) + 1) / 2
        
        # Calculate transformed position
        curr_x = source_point_x * (1 - progress) + logical_x * progress
        curr_y = source_point_y * (1 - progress) + logical_y * progress
        
        # Calculate current scale factor (interpolating from 1 to DPI_SCALING)
        curr_scale = 1 + (DPI_SCALING - 1) * progress
        
        # Update transformed point (smaller in logical space)
        transformed_point.center = (curr_x, curr_y)
        transformed_point.radius = 10 / curr_scale
        
        # Update connecting line
        line.set_data([source_point_x, curr_x], [source_point_y, curr_y])
        
        # Update scale text
        scale_text.set_text(f"DPI Scaling: {curr_scale:.2f}x")
        
        return point, transformed_point, line, scale_text
    
    # Create animation
    anim = animation.FuncAnimation(fig, animate, frames=ANIMATION_FRAMES, 
                                  interval=1000//FPS, blit=True)
    
    # Save as GIF
    output_path = os.path.join(OUTPUT_DIR, 'dpi_scaling.gif')
    anim.save(output_path, writer='pillow', fps=FPS)
    print(f"Saved to {output_path}")
    
    # Close the figure
    plt.close(fig)
    
    return output_path

def create_composite_transformation_animation():
    """
    Create an animation showing composite transformations from screen to logical coordinates.
    """
    print("Generating Composite Transformation animation...")
    
    # Create figure and axes
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.set_aspect('equal')
    ax.set_xlim(0, SCREEN_WIDTH)
    ax.set_ylim(0, SCREEN_HEIGHT)
    
    # Set background color
    fig.patch.set_facecolor(BACKGROUND_COLOR)
    ax.set_facecolor(BACKGROUND_COLOR)
    
    # Draw screen coordinate grid
    for x in range(0, SCREEN_WIDTH + 1, 200):
        ax.axvline(x, color=GRID_COLOR, linestyle='-', linewidth=0.5)
    
    for y in range(0, SCREEN_HEIGHT + 1, 200):
        ax.axhline(y, color=GRID_COLOR, linestyle='-', linewidth=0.5)
    
    # Draw browser window
    browser_rect = Rectangle((BROWSER_POSITION['x'], BROWSER_POSITION['y']), 
                          BROWSER_WIDTH, BROWSER_HEIGHT, 
                          fill=True, alpha=0.2, color=BROWSER_COLOR, 
                          linewidth=2, edgecolor='black')
    ax.add_patch(browser_rect)
    
    # Label the browser
    ax.text(BROWSER_POSITION['x'] + 10, BROWSER_POSITION['y'] + 30, 
            f"Browser Window\n({BROWSER_POSITION['x']}, {BROWSER_POSITION['y']})", 
            fontsize=10, bbox=dict(facecolor='white', alpha=0.7))
    
    # Calculate logical dimensions
    logical_width = BROWSER_WIDTH / DPI_SCALING
    logical_height = BROWSER_HEIGHT / DPI_SCALING
    
    # Draw logical coordinate boundary
    logical_rect = Rectangle((BROWSER_POSITION['x'], BROWSER_POSITION['y']), 
                          logical_width, logical_height, 
                          fill=False, linestyle='dashed', 
                          linewidth=2, edgecolor='blue')
    ax.add_patch(logical_rect)
    
    # Title
    ax.set_title("Composite Transformation: Screen → Browser → Logical")
    
    # Formulas
    formulas = [
        "1. Screen → Browser: T₁(p) = (x - b_x, y - b_y)",
        "2. Browser → Logical: T₂(p) = (x/σ, y/σ)",
        "3. Composite: T(p) = T₂(T₁(p))"
    ]
    for i, formula in enumerate(formulas):
        ax.text(50, 50 + i*30, formula, fontsize=10, 
                bbox=dict(facecolor='white', alpha=0.7))
    
    # Source point in screen coordinates
    source_point_x, source_point_y = 960, 540  # center of screen
    
    # Step 1: Screen-to-Browser
    browser_x = source_point_x - BROWSER_POSITION['x']
    browser_y = source_point_y - BROWSER_POSITION['y']
    
    # Step 2: Browser-to-Logical
    logical_x = browser_x / DPI_SCALING
    logical_y = browser_y / DPI_SCALING
    
    # Create animation elements
    # Original point (screen coords)
    screen_point = plt.Circle((source_point_x, source_point_y), 10, color='red')
    ax.add_patch(screen_point)
    
    # Intermediate point (browser coords)
    browser_point = plt.Circle((BROWSER_POSITION['x'] + browser_x, BROWSER_POSITION['y'] + browser_y), 
                            8, color='orange')
    browser_point.set_alpha(0) # Start invisible
    ax.add_patch(browser_point)
    
    # Final point (logical coords)
    logical_point = plt.Circle((BROWSER_POSITION['x'] + logical_x, BROWSER_POSITION['y'] + logical_y), 
                            6, color='green')
    logical_point.set_alpha(0) # Start invisible
    ax.add_patch(logical_point)
    
    # Animation path
    animation_path = [
        (source_point_x, source_point_y),  # Start: screen coords
        (BROWSER_POSITION['x'] + browser_x, BROWSER_POSITION['y'] + browser_y),  # Middle: browser coords
        (BROWSER_POSITION['x'] + logical_x, BROWSER_POSITION['y'] + logical_y)   # End: logical coords
    ]
    
    # Create moving point that follows the entire path
    moving_point = plt.Circle(animation_path[0], 10, color=TRANSFORM_COLOR)
    ax.add_patch(moving_point)
    
    # Create connecting lines
    screen_to_browser_line, = ax.plot([source_point_x, BROWSER_POSITION['x'] + browser_x], 
                                    [source_point_y, BROWSER_POSITION['y'] + browser_y], 
                                    'k--', linewidth=1, alpha=0)
    
    browser_to_logical_line, = ax.plot([BROWSER_POSITION['x'] + browser_x, BROWSER_POSITION['x'] + logical_x], 
                                     [BROWSER_POSITION['y'] + browser_y, BROWSER_POSITION['y'] + logical_y], 
                                     'k--', linewidth=1, alpha=0)
    
    # Status text
    status_text = ax.text(SCREEN_WIDTH/2, SCREEN_HEIGHT - 50, "",
                        fontsize=12, ha='center',
                        bbox=dict(facecolor='white', alpha=0.7))
    
    # Coordinate texts
    screen_coord_text = ax.text(source_point_x + 15, source_point_y, 
                              f"Screen: ({source_point_x:.0f}, {source_point_y:.0f})", 
                              fontsize=9, color='red')
    
    browser_coord_text = ax.text(BROWSER_POSITION['x'] + browser_x + 15, 
                               BROWSER_POSITION['y'] + browser_y, 
                               f"Browser: ({browser_x:.0f}, {browser_y:.0f})", 
                               fontsize=9, color='orange')
    browser_coord_text.set_alpha(0)
    
    logical_coord_text = ax.text(BROWSER_POSITION['x'] + logical_x + 15, 
                               BROWSER_POSITION['y'] + logical_y, 
                               f"Logical: ({logical_x:.2f}, {logical_y:.2f})", 
                               fontsize=9, color='green')
    logical_coord_text.set_alpha(0)
    
    # Animation function
    def animate(i):
        t = i / ANIMATION_FRAMES
        
        # Animation phases:
        # 0.0-0.3: Screen to Browser transition
        # 0.3-0.5: Pause at Browser
        # 0.5-0.8: Browser to Logical transition
        # 0.8-1.0: Show final composite transformation
        
        if t < 0.3:
            # Phase 1: Screen to Browser
            phase_t = t / 0.3
            
            # Calculate position along the path
            pos_x = source_point_x * (1 - phase_t) + (BROWSER_POSITION['x'] + browser_x) * phase_t
            pos_y = source_point_y * (1 - phase_t) + (BROWSER_POSITION['y'] + browser_y) * phase_t
            
            moving_point.center = (pos_x, pos_y)
            
            # Fade in browser point and line
            browser_point.set_alpha(phase_t)
            screen_to_browser_line.set_alpha(phase_t)
            browser_coord_text.set_alpha(phase_t)
            
            status_text.set_text("Step 1: Screen → Browser Transformation")
            
        elif t < 0.5:
            # Phase 2: Pause at Browser
            moving_point.center = (BROWSER_POSITION['x'] + browser_x, BROWSER_POSITION['y'] + browser_y)
            
            browser_point.set_alpha(1)
            screen_to_browser_line.set_alpha(1)
            browser_coord_text.set_alpha(1)
            
            status_text.set_text("Browser Coordinates: T₁(p) = (x - b_x, y - b_y)")
            
        elif t < 0.8:
            # Phase 3: Browser to Logical
            phase_t = (t - 0.5) / 0.3
            
            # Calculate position along the path
            pos_x = (BROWSER_POSITION['x'] + browser_x) * (1 - phase_t) + (BROWSER_POSITION['x'] + logical_x) * phase_t
            pos_y = (BROWSER_POSITION['y'] + browser_y) * (1 - phase_t) + (BROWSER_POSITION['y'] + logical_y) * phase_t
            
            moving_point.center = (pos_x, pos_y)
            
            # Fade in logical point and line
            logical_point.set_alpha(phase_t)
            browser_to_logical_line.set_alpha(phase_t)
            logical_coord_text.set_alpha(phase_t)
            
            status_text.set_text("Step 2: Browser → Logical Transformation")
            
        else:
            # Phase 4: Final composite transformation
            moving_point.center = (BROWSER_POSITION['x'] + logical_x, BROWSER_POSITION['y'] + logical_y)
            
            logical_point.set_alpha(1)
            browser_to_logical_line.set_alpha(1)
            logical_coord_text.set_alpha(1)
            
            status_text.set_text("Complete Transformation: Screen → Browser → Logical")
        
        return (moving_point, screen_point, browser_point, logical_point, 
                screen_to_browser_line, browser_to_logical_line, 
                status_text, screen_coord_text, browser_coord_text, logical_coord_text)
    
    # Create animation
    anim = animation.FuncAnimation(fig, animate, frames=ANIMATION_FRAMES, 
                                  interval=1000//FPS, blit=True)
    
    # Save as GIF
    output_path = os.path.join(OUTPUT_DIR, 'composite_transformation.gif')
    anim.save(output_path, writer='pillow', fps=FPS)
    print(f"Saved to {output_path}")
    
    # Close the figure
    plt.close(fig)
    
    return output_path

def update_html_with_gifs():
    """
    Update the HTML visualization page to use the generated GIFs.
    """
    html_path = os.path.join(OUTPUT_DIR, 'index.html')
    
    html_content = """<!DOCTYPE html>
<html>
<head>
  <title>BrowserCoordinateKit Transformations</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
    h1, h2 { color: #333; }
    .card { 
      border: 1px solid #ccc; 
      margin: 10px 0 20px 0; 
      padding: 15px; 
      border-radius: 5px; 
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .visualization { 
      width: 100%; 
      text-align: center;
      margin-top: 10px; 
    }
    .description {
      color: #555;
      margin: 10px 0;
      line-height: 1.5;
    }
    .equation {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Times New Roman', serif;
      text-align: center;
      margin: 15px 0;
    }
    footer {
      margin-top: 40px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>BrowserCoordinateKit Transformations</h1>
  <p class="description">This page contains visualizations of the coordinate transformations defined in the mathematical foundations.</p>
  
  <div class="visualizations">
    <div class="card">
      <h2>Screen Normalizing Transformations</h2>
      <p class="description">
        This visualization demonstrates the Screen-to-Normalized and Normalized-to-Screen transformations.
        These transformations convert between absolute screen coordinates and normalized [0,1] coordinates.
      </p>
      
      <div class="equation">
        <p>Screen-to-Normalized: T<sub>S→N</sub>(p<sub>s</sub>) = (x<sub>s</sub>/s<sub>w</sub>, y<sub>s</sub>/s<sub>h</sub>)</p>
        <p>Normalized-to-Screen: T<sub>N→S</sub>(p<sub>n</sub>) = (x<sub>n</sub>·s<sub>w</sub>, y<sub>n</sub>·s<sub>h</sub>)</p>
      </div>
      
      <div class="visualization">
        <img src="screen_to_normalized.gif" alt="Screen to Normalized Transformation" />
      </div>
    </div>
    
    <div class="card">
      <h2>Browser Position Transformations</h2>
      <p class="description">
        This visualization demonstrates the Screen-to-Browser and Browser-to-Screen transformations.
        These transformations account for the browser window position on the screen.
      </p>
      
      <div class="equation">
        <p>Screen-to-Browser: T<sub>S→B</sub>(p<sub>s</sub>) = p<sub>s</sub> - b = (x<sub>s</sub> - b<sub>x</sub>, y<sub>s</sub> - b<sub>y</sub>)</p>
        <p>Browser-to-Screen: T<sub>B→S</sub>(p<sub>b</sub>) = p<sub>b</sub> + b = (x<sub>b</sub> + b<sub>x</sub>, y<sub>b</sub> + b<sub>y</sub>)</p>
      </div>
      
      <div class="visualization">
        <img src="screen_to_browser.gif" alt="Screen to Browser Transformation" />
      </div>
    </div>
    
    <div class="card">
      <h2>DPI Scaling Transformations</h2>
      <p class="description">
        This visualization demonstrates the Browser-to-Logical and Logical-to-Browser transformations.
        These transformations account for DPI scaling factors.
      </p>
      
      <div class="equation">
        <p>Browser-to-Logical: T<sub>B→L</sub>(p<sub>b</sub>) = p<sub>b</sub>/σ = (x<sub>b</sub>/σ, y<sub>b</sub>/σ)</p>
        <p>Logical-to-Browser: T<sub>L→B</sub>(p<sub>l</sub>) = p<sub>l</sub>·σ = (x<sub>l</sub>·σ, y<sub>l</sub>·σ)</p>
      </div>
      
      <div class="visualization">
        <img src="dpi_scaling.gif" alt="DPI Scaling Transformation" />
      </div>
    </div>
    
    <div class="card">
      <h2>Composite Transformations</h2>
      <p class="description">
        This visualization demonstrates how multiple transformations can be composed together to create a complete transformation pipeline.
        The example shows a full Screen → Browser → Logical transformation.
      </p>
      
      <div class="equation">
        <p>Screen → Browser: T₁(p) = (x - b_x, y - b_y)</p>
        <p>Browser → Logical: T₂(p) = (x/σ, y/σ)</p>
        <p>Composite: T(p) = T₂(T₁(p))</p>
      </div>
      
      <div class="visualization">
        <img src="composite_transformation.gif" alt="Composite Transformation" />
      </div>
    </div>
  </div>
  
  <footer>
    <p>BrowserCoordinateKit - Mathematical Visualizations</p>
    <p>These visualizations are generated from the formal mathematical framework defined in MathematicalFoundationsPhase2.tex</p>
  </footer>
</body>
</html>"""
    
    with open(html_path, 'w') as f:
        f.write(html_content)
    
    print(f"Updated HTML file at {html_path}")

def main():
    """Main function to generate all visualizations."""
    print("Generating visualizations for BrowserCoordinateKit...")
    
    # Create the output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Generate all visualizations
    create_screen_to_normalized_animation()
    create_browser_position_animation()
    create_dpi_scaling_animation()
    create_composite_transformation_animation()
    
    # Update the HTML file
    update_html_with_gifs()
    
    print("All visualizations have been generated!")
    print(f"View the visualizations at {os.path.join(OUTPUT_DIR, 'index.html')}")

if __name__ == "__main__":
    main()