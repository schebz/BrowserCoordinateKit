#!/usr/bin/env python3
"""
Generate simplified visualizations for BrowserCoordinateKit transformations.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

# Create output directory
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                         'outputs', 'mathematics', 'visualizations')

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def create_screen_to_normalized_visualization():
    """Create a static visualization for screen-to-normalized transformation"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
    fig.suptitle('Screen to Normalized Transformation', fontsize=16)
    
    # Screen dimensions
    screen_width, screen_height = 1920, 1080
    
    # Set up axes for screen coordinates
    ax1.set_xlim(0, screen_width)
    ax1.set_ylim(screen_height, 0)  # Reversed y-axis for screen coordinates
    ax1.set_title('Screen Coordinates')
    ax1.set_xlabel('X (pixels)')
    ax1.set_ylabel('Y (pixels)')
    ax1.grid(True)
    
    # Set up axes for normalized coordinates
    ax2.set_xlim(0, 1.1)
    ax2.set_ylim(1.1, 0)  # Reversed y-axis for normalized coordinates
    ax2.set_title('Normalized Coordinates')
    ax2.set_xlabel('X (normalized)')
    ax2.set_ylabel('Y (normalized)')
    ax2.grid(True)
    
    # Create example points
    screen_points = [
        (0, 0),                      # Top-left
        (screen_width, 0),           # Top-right
        (0, screen_height),          # Bottom-left
        (screen_width, screen_height), # Bottom-right
        (screen_width/2, screen_height/2), # Center
        (screen_width*0.25, screen_height*0.75) # Another point
    ]
    
    # Plot points in screen coordinates
    screen_x, screen_y = zip(*screen_points)
    ax1.scatter(screen_x, screen_y, c='red', s=100)
    
    # Convert to normalized coordinates and plot
    norm_points = [(x / screen_width, y / screen_height) for x, y in screen_points]
    norm_x, norm_y = zip(*norm_points)
    ax2.scatter(norm_x, norm_y, c='red', s=100)
    
    # Add labels
    for i, ((sx, sy), (nx, ny)) in enumerate(zip(screen_points, norm_points)):
        ax1.annotate(f'P{i+1}', (sx, sy), xytext=(10, 10), textcoords='offset points')
        ax2.annotate(f'P{i+1}', (nx, ny), xytext=(10, 10), textcoords='offset points')
    
    # Add formula
    fig.text(0.5, 0.01, r'$T_{S \to N}(p_s) = (\frac{x_s}{s_w}, \frac{y_s}{s_h})$', 
             ha='center', fontsize=14)
    
    # Save visualization
    output_file = os.path.join(OUTPUT_DIR, 'screen-to-normalized.png')
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved visualization to {output_file}")

def create_screen_to_browser_visualization():
    """Create a static visualization for screen-to-browser transformation"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
    fig.suptitle('Screen to Browser Transformation', fontsize=16)
    
    # Screen dimensions
    screen_width, screen_height = 1920, 1080
    
    # Browser position and dimensions
    browser_x, browser_y = 200, 100
    browser_width, browser_height = 1200, 800
    
    # Set up axes for screen coordinates
    ax1.set_xlim(0, screen_width)
    ax1.set_ylim(screen_height, 0)  # Reversed y-axis for screen coordinates
    ax1.set_title('Screen Coordinates')
    ax1.set_xlabel('X (pixels)')
    ax1.set_ylabel('Y (pixels)')
    ax1.grid(True)
    
    # Draw browser window on screen
    browser_rect = Rectangle((browser_x, browser_y), browser_width, browser_height, 
                            edgecolor='blue', facecolor='skyblue', alpha=0.3)
    ax1.add_patch(browser_rect)
    
    # Set up axes for browser coordinates
    ax2.set_xlim(0, browser_width)
    ax2.set_ylim(browser_height, 0)  # Reversed y-axis for browser coordinates
    ax2.set_title('Browser Coordinates')
    ax2.set_xlabel('X (pixels)')
    ax2.set_ylabel('Y (pixels)')
    ax2.grid(True)
    
    # Create example points inside the browser
    screen_points = [
        (browser_x, browser_y),  # Top-left of browser
        (browser_x + browser_width, browser_y),  # Top-right of browser
        (browser_x, browser_y + browser_height),  # Bottom-left of browser
        (browser_x + browser_width, browser_y + browser_height),  # Bottom-right of browser
        (browser_x + browser_width/2, browser_y + browser_height/2),  # Center of browser
        (browser_x + browser_width*0.25, browser_y + browser_height*0.75)  # Another point
    ]
    
    # Plot points in screen coordinates
    screen_x, screen_y = zip(*screen_points)
    ax1.scatter(screen_x, screen_y, c='red', s=100)
    
    # Convert to browser coordinates and plot
    browser_points = [(x - browser_x, y - browser_y) for x, y in screen_points]
    browser_x, browser_y = zip(*browser_points)
    ax2.scatter(browser_x, browser_y, c='red', s=100)
    
    # Add labels
    for i, ((sx, sy), (bx, by)) in enumerate(zip(screen_points, browser_points)):
        ax1.annotate(f'P{i+1}', (sx, sy), xytext=(10, 10), textcoords='offset points')
        ax2.annotate(f'P{i+1}', (bx, by), xytext=(10, 10), textcoords='offset points')
    
    # Add formula
    fig.text(0.5, 0.01, r'$T_{S \to B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)$', 
             ha='center', fontsize=14)
    
    # Save visualization
    output_file = os.path.join(OUTPUT_DIR, 'screen-to-browser.png')
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved visualization to {output_file}")

def create_browser_to_logical_visualization():
    """Create a static visualization for browser-to-logical transformation"""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
    fig.suptitle('Browser to Logical Transformation (DPI Scaling)', fontsize=16)
    
    # Browser dimensions in physical pixels
    browser_width, browser_height = 1200, 800
    
    # DPI scaling factor
    dpi_scaling = 2.0  # Common scaling factor (2x)
    
    # Logical dimensions
    logical_width = browser_width / dpi_scaling
    logical_height = browser_height / dpi_scaling
    
    # Set up axes for browser coordinates
    ax1.set_xlim(0, browser_width)
    ax1.set_ylim(browser_height, 0)  # Reversed y-axis for browser coordinates
    ax1.set_title('Browser Coordinates (Physical Pixels)')
    ax1.set_xlabel('X (physical pixels)')
    ax1.set_ylabel('Y (physical pixels)')
    ax1.grid(True)
    
    # Set up axes for logical coordinates
    ax2.set_xlim(0, logical_width)
    ax2.set_ylim(logical_height, 0)  # Reversed y-axis for logical coordinates
    ax2.set_title('Logical Coordinates (Logical Pixels)')
    ax2.set_xlabel('X (logical pixels)')
    ax2.set_ylabel('Y (logical pixels)')
    ax2.grid(True)
    
    # Create example points
    browser_points = [
        (0, 0),  # Top-left
        (browser_width, 0),  # Top-right
        (0, browser_height),  # Bottom-left
        (browser_width, browser_height),  # Bottom-right
        (browser_width/2, browser_height/2),  # Center
        (browser_width*0.25, browser_height*0.75)  # Another point
    ]
    
    # Plot points in browser coordinates
    b_x, b_y = zip(*browser_points)
    ax1.scatter(b_x, b_y, c='red', s=100)
    
    # Convert to logical coordinates and plot
    logical_points = [(x / dpi_scaling, y / dpi_scaling) for x, y in browser_points]
    l_x, l_y = zip(*logical_points)
    ax2.scatter(l_x, l_y, c='red', s=100)
    
    # Add labels
    for i, ((bx, by), (lx, ly)) in enumerate(zip(browser_points, logical_points)):
        ax1.annotate(f'P{i+1}', (bx, by), xytext=(10, 10), textcoords='offset points')
        ax2.annotate(f'P{i+1}', (lx, ly), xytext=(10, 10), textcoords='offset points')
    
    # Add formula
    fig.text(0.5, 0.01, r'$T_{B \to L}(p_b) = \frac{p_b}{\sigma} = (\frac{x_b}{\sigma}, \frac{y_b}{\sigma})$, $\sigma = 2.0$', 
             ha='center', fontsize=14)
    
    # Save visualization
    output_file = os.path.join(OUTPUT_DIR, 'browser-to-logical.png')
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved visualization to {output_file}")

def create_composite_transformation_visualization():
    """Create a static visualization for composite transformation"""
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle('Composite Screen-to-Logical Transformation', fontsize=16)
    
    # Screen dimensions
    screen_width, screen_height = 1920, 1080
    
    # Browser position and dimensions
    browser_x, browser_y = 200, 100
    browser_width, browser_height = 1200, 800
    
    # DPI scaling factor
    dpi_scaling = 2.0
    
    # Logical dimensions
    logical_width = browser_width / dpi_scaling
    logical_height = browser_height / dpi_scaling
    
    # Set up axes for screen coordinates
    ax1.set_xlim(0, screen_width)
    ax1.set_ylim(screen_height, 0)
    ax1.set_title('Screen Coordinates')
    ax1.set_xlabel('X (pixels)')
    ax1.set_ylabel('Y (pixels)')
    ax1.grid(True)
    
    # Draw browser window on screen
    browser_rect = Rectangle((browser_x, browser_y), browser_width, browser_height, 
                            edgecolor='blue', facecolor='skyblue', alpha=0.3)
    ax1.add_patch(browser_rect)
    
    # Set up axes for browser coordinates
    ax2.set_xlim(0, browser_width)
    ax2.set_ylim(browser_height, 0)
    ax2.set_title('Browser Coordinates')
    ax2.set_xlabel('X (physical pixels)')
    ax2.set_ylabel('Y (physical pixels)')
    ax2.grid(True)
    
    # Set up axes for logical coordinates
    ax3.set_xlim(0, logical_width)
    ax3.set_ylim(logical_height, 0)
    ax3.set_title('Logical Coordinates')
    ax3.set_xlabel('X (logical pixels)')
    ax3.set_ylabel('Y (logical pixels)')
    ax3.grid(True)
    
    # Create example points inside the browser
    screen_points = [
        (browser_x, browser_y),  # Top-left of browser
        (browser_x + browser_width, browser_y),  # Top-right of browser
        (browser_x, browser_y + browser_height),  # Bottom-left of browser
        (browser_x + browser_width, browser_y + browser_height),  # Bottom-right of browser
        (browser_x + browser_width/2, browser_y + browser_height/2),  # Center of browser
        (browser_x + browser_width*0.25, browser_y + browser_height*0.75)  # Another point
    ]
    
    # Step 1: Screen to Browser conversion
    browser_points = [(x - browser_x, y - browser_y) for x, y in screen_points]
    
    # Step 2: Browser to Logical conversion
    logical_points = [(x / dpi_scaling, y / dpi_scaling) for x, y in browser_points]
    
    # Plot all points
    s_x, s_y = zip(*screen_points)
    b_x, b_y = zip(*browser_points)
    l_x, l_y = zip(*logical_points)
    
    ax1.scatter(s_x, s_y, c='red', s=100)
    ax2.scatter(b_x, b_y, c='red', s=100)
    ax3.scatter(l_x, l_y, c='red', s=100)
    
    # Add labels
    for i, ((sx, sy), (bx, by), (lx, ly)) in enumerate(zip(screen_points, browser_points, logical_points)):
        ax1.annotate(f'P{i+1}', (sx, sy), xytext=(10, 10), textcoords='offset points')
        ax2.annotate(f'P{i+1}', (bx, by), xytext=(10, 10), textcoords='offset points')
        ax3.annotate(f'P{i+1}', (lx, ly), xytext=(10, 10), textcoords='offset points')
    
    # Add formula
    fig.text(0.5, 0.01, 
             r'$T_{S \to L} = T_{B \to L} \circ T_{S \to B} = \frac{p_s - b}{\sigma} = (\frac{x_s - b_x}{\sigma}, \frac{y_s - b_y}{\sigma})$', 
             ha='center', fontsize=14)
    
    # Save visualization
    output_file = os.path.join(OUTPUT_DIR, 'composite-transformation.png')
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved visualization to {output_file}")

def update_visualizations_html():
    """Update the visualizations HTML to use the generated static images"""
    html_content = """<!DOCTYPE html>
<html>
<head>
  <title>BrowserCoordinateKit Transformations Visualizations</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .card { border: 1px solid #ccc; margin: 20px 0; padding: 15px; border-radius: 5px; }
    .visualization { text-align: center; margin: 15px 0; }
    img { max-width: 100%; border: 1px solid #eee; }
    .nav { margin: 20px 0; }
    .nav a { margin-right: 15px; text-decoration: none; }
    .explanation { margin: 10px 0; background: #f8f8f8; padding: 10px; border-radius: 5px; }
  </style>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body>
  <h1>BrowserCoordinateKit Coordinate Transformations</h1>
  <p>This page contains visualizations of the mathematical coordinate transformations implemented in the BrowserCoordinateKit library.</p>
  
  <div class="nav">
    <a href="../index.html">Mathematical Overview</a>
    <a href="../validation/validation.html">Symbolic Validations</a>
  </div>
  
  <div class="card">
    <h2>Screen to Normalized Transformation</h2>
    <p>Converts absolute screen coordinates to normalized [0,1] range</p>
    <div class="explanation">
      <p>The screen-to-normalized transformation maps physical screen coordinates to a normalized [0,1] range, making them independent of screen resolution:</p>
      <p>\\(T_{S \\to N}(p_s) = \\left(\\frac{x_s}{s_w}, \\frac{y_s}{s_h}\\right)\\)</p>
      <p>Where \\(s_w\\) and \\(s_h\\) are the screen width and height respectively.</p>
    </div>
    <div class="visualization">
      <img src="screen-to-normalized.png" alt="Screen to Normalized Transformation" />
    </div>
  </div>
  
  <div class="card">
    <h2>Screen to Browser Transformation</h2>
    <p>Converts screen coordinates to browser-relative coordinates</p>
    <div class="explanation">
      <p>The screen-to-browser transformation translates points from absolute screen coordinates to coordinates relative to the browser window:</p>
      <p>\\(T_{S \\to B}(p_s) = p_s - b = (x_s - b_x, y_s - b_y)\\)</p>
      <p>Where \\(b = (b_x, b_y)\\) is the position of the browser window's top-left corner in screen coordinates.</p>
    </div>
    <div class="visualization">
      <img src="screen-to-browser.png" alt="Screen to Browser Transformation" />
    </div>
  </div>
  
  <div class="card">
    <h2>Browser to Logical Transformation</h2>
    <p>Converts browser coordinates to logical coordinates (DPI scaling)</p>
    <div class="explanation">
      <p>The browser-to-logical transformation converts physical pixels to logical pixels by applying the DPI scaling factor:</p>
      <p>\\(T_{B \\to L}(p_b) = \\frac{p_b}{\\sigma} = \\left(\\frac{x_b}{\\sigma}, \\frac{y_b}{\\sigma}\\right)\\)</p>
      <p>Where \\(\\sigma\\) is the DPI scaling factor (e.g., 2.0 for a high-DPI display).</p>
    </div>
    <div class="visualization">
      <img src="browser-to-logical.png" alt="Browser to Logical Transformation" />
    </div>
  </div>
  
  <div class="card">
    <h2>Composite Transformation</h2>
    <p>Complete screen-to-logical transformation pipeline</p>
    <div class="explanation">
      <p>The composite transformation combines screen-to-browser and browser-to-logical transformations:</p>
      <p>\\(T_{S \\to L} = T_{B \\to L} \\circ T_{S \\to B} = \\frac{p_s - b}{\\sigma} = \\left(\\frac{x_s - b_x}{\\sigma}, \\frac{y_s - b_y}{\\sigma}\\right)\\)</p>
      <p>This allows for direct conversion from screen coordinates to logical coordinates used by the browser.</p>
    </div>
    <div class="visualization">
      <img src="composite-transformation.png" alt="Composite Transformation" />
    </div>
  </div>
  
  <div class="footer">
    <p>These visualizations were generated using Python's matplotlib library to demonstrate the mathematical transformations implemented in BrowserCoordinateKit.</p>
  </div>
</body>
</html>
"""
    
    # Write the updated HTML
    html_file = os.path.join(OUTPUT_DIR, 'index.html')
    with open(html_file, 'w') as f:
        f.write(html_content)
    print(f"Updated HTML file: {html_file}")

def main():
    print("Generating static visualizations for BrowserCoordinateKit transformations...")
    
    # Create visualizations
    create_screen_to_normalized_visualization()
    create_screen_to_browser_visualization()
    create_browser_to_logical_visualization()
    create_composite_transformation_visualization()
    
    # Update HTML file
    update_visualizations_html()
    
    print("Visualizations complete. Output saved to:")
    print(OUTPUT_DIR)

if __name__ == "__main__":
    main()