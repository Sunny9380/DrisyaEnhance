"""
Drisya Image Processing Service
Removes backgrounds and applies custom backgrounds to product images
"""

from flask import Flask, request, jsonify, send_file
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import io
import base64
import os
from typing import Tuple
import json

app = Flask(__name__)

def remove_background_simple(image: Image.Image) -> Image.Image:
    """
    Simple background removal using color-based segmentation
    For production: Replace with BiRefNet or U2-Net models
    """
    # Convert to RGBA
    image = image.convert("RGBA")
    
    # Get image data
    data = image.getdata()
    
    # Create new data with transparency
    new_data = []
    
    # Simple background detection (assumes light background)
    # This is a placeholder - in production use BiRefNet/U2-Net
    for item in data:
        # If pixel is mostly white/light (simple threshold)
        if item[0] > 200 and item[1] > 200 and item[2] > 200:
            # Make it transparent
            new_data.append((255, 255, 255, 0))
        else:
            # Keep the pixel
            new_data.append(item)
    
    image.putdata(new_data)
    return image


def create_gradient_background(width: int, height: int, color1: str, color2: str) -> Image.Image:
    """
    Create a gradient background
    """
    base = Image.new('RGB', (width, height), color1)
    draw = ImageDraw.Draw(base)
    
    # Parse colors
    c1 = tuple(int(color1[i:i+2], 16) for i in (1, 3, 5))
    c2 = tuple(int(color2[i:i+2], 16) for i in (1, 3, 5))
    
    # Create gradient
    for i in range(height):
        ratio = i / height
        r = int(c1[0] * (1 - ratio) + c2[0] * ratio)
        g = int(c1[1] * (1 - ratio) + c2[1] * ratio)
        b = int(c1[2] * (1 - ratio) + c2[2] * ratio)
        draw.line([(0, i), (width, i)], fill=(r, g, b))
    
    return base


def create_textured_background(width: int, height: int, description: str) -> Image.Image:
    """
    Create textured background based on description
    For production: Replace with Stable Diffusion/DALL-E
    """
    # Parse description for colors and style
    description_lower = description.lower()
    
    # Default colors
    color1 = "#1a1a2e"  # dark blue
    color2 = "#0f3460"  # darker blue
    
    # Color detection from description
    if "blue" in description_lower:
        color1, color2 = "#1e3a8a", "#3b82f6"
    elif "gold" in description_lower or "luxury" in description_lower:
        color1, color2 = "#92400e", "#d97706"
    elif "elegant" in description_lower or "dark" in description_lower:
        color1, color2 = "#1a1a2e", "#16213e"
    elif "white" in description_lower or "clean" in description_lower:
        color1, color2 = "#f8f9fa", "#ffffff"
    elif "pink" in description_lower or "rose" in description_lower:
        color1, color2 = "#ec4899", "#f472b6"
    
    # Create gradient background
    bg = create_gradient_background(width, height, color1, color2)
    
    # Add noise/texture for realism
    enhancer = ImageEnhance.Brightness(bg)
    bg = enhancer.enhance(0.9)
    
    return bg


def composite_image(product: Image.Image, background: Image.Image, size: Tuple[int, int] = (1080, 1080)) -> Image.Image:
    """
    Composite product image onto background
    """
    # Resize background to target size
    background = background.resize(size, Image.Resampling.LANCZOS)
    
    # Calculate product size (keep aspect ratio, max 70% of canvas)
    max_size = int(min(size) * 0.7)
    product.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    
    # Center the product
    paste_x = (size[0] - product.width) // 2
    paste_y = (size[1] - product.height) // 2
    
    # Paste product onto background
    if product.mode == 'RGBA':
        background.paste(product, (paste_x, paste_y), product)
    else:
        background.paste(product, (paste_x, paste_y))
    
    return background


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "Drisya Image Processor"})


@app.route('/process', methods=['POST'])
def process_image():
    """
    Process image: remove background and apply custom background
    
    Expected JSON:
    {
        "image": "base64_encoded_image",
        "background_prompt": "description of desired background",
        "remove_background": true/false
    }
    """
    try:
        data = request.json
        
        # Decode image
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        # Remove background if requested
        if data.get('remove_background', True):
            image = remove_background_simple(image)
        
        # Create background from prompt
        bg_prompt = data.get('background_prompt', 'elegant dark blue gradient')
        background = create_textured_background(1080, 1080, bg_prompt)
        
        # Composite images
        result = composite_image(image, background)
        
        # Convert to base64
        buffer = io.BytesIO()
        result.save(buffer, format='PNG')
        buffer.seek(0)
        result_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return jsonify({
            "success": True,
            "image": result_base64,
            "size": f"{result.width}x{result.height}"
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/batch-process', methods=['POST'])
def batch_process():
    """
    Process multiple images with the same background
    """
    try:
        data = request.json
        images_data = data['images']  # List of base64 images
        bg_prompt = data.get('background_prompt', 'elegant dark blue gradient')
        
        # Create background once
        background = create_textured_background(1080, 1080, bg_prompt)
        
        results = []
        
        for img_data in images_data:
            # Decode image
            image_bytes = base64.b64decode(img_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Remove background
            if data.get('remove_background', True):
                image = remove_background_simple(image)
            
            # Composite
            result = composite_image(image, background.copy())
            
            # Convert to base64
            buffer = io.BytesIO()
            result.save(buffer, format='PNG')
            buffer.seek(0)
            result_base64 = base64.b64encode(buffer.getvalue()).decode()
            
            results.append(result_base64)
        
        return jsonify({
            "success": True,
            "images": results,
            "count": len(results)
        })
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_SERVICE_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
