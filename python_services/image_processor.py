"""
Drisya Image Processing Service
Removes backgrounds and applies custom backgrounds to product images
"""

from flask import Flask, request, jsonify, send_file
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
import io
import base64
import os
from typing import Tuple, Dict, Any
import json
import numpy as np
from PIL.ImageColor import getrgb
import random

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
    Creates professional dark blue fabric texture like luxury jewelry photography
    """
    # Parse description for colors and style
    description_lower = description.lower()
    
    # Default: Dark blue fabric texture (jewelry photography standard)
    base_color = "#0a1628"  # Very dark navy blue
    
    # Color detection from description
    if "white" in description_lower or "clean" in description_lower or "light" in description_lower:
        base_color = "#f8f9fa"
    elif "blue" in description_lower or "navy" in description_lower:
        base_color = "#0a1628"  # Dark navy blue
    elif "black" in description_lower or "dark" in description_lower:
        base_color = "#0d0d0d"  # Near black
    elif "gold" in description_lower or "luxury" in description_lower:
        base_color = "#1a0f0a"  # Dark brown
    elif "pink" in description_lower or "rose" in description_lower:
        base_color = "#2d1a24"  # Dark rose
    elif "green" in description_lower:
        base_color = "#0a1a0f"  # Dark green
    
    # Create fabric texture using noise patterns
    bg = create_fabric_texture(width, height, base_color)
    
    # Add subtle lighting effects for depth
    if "soft" in description_lower or "lighting" in description_lower:
        bg = add_soft_lighting(bg)
    
    return bg


def create_fabric_texture(width: int, height: int, base_color: str) -> Image.Image:
    """
    Create realistic fabric/velvet texture for luxury product photography
    Optimized with NumPy vectorization for 4K performance
    """
    # Parse base color
    r, g, b = getrgb(base_color)
    
    # Create coordinate grids using NumPy (vectorized)
    x = np.arange(width)
    y = np.arange(height)
    X, Y = np.meshgrid(x, y)
    
    # Create fabric weave pattern with wave effect (vectorized)
    wave_effect = (10 * np.sin(X / 30) * np.cos(Y / 30)).astype(np.int32)
    
    # Add random noise for fabric texture (vectorized)
    noise = np.random.randint(-25, 26, size=(height, width), dtype=np.int32)
    
    # Combine base color with noise and wave effect
    combined_effect = noise + wave_effect
    
    # Apply to each color channel
    r_channel = np.clip(r + combined_effect, 0, 255).astype(np.uint8)
    g_channel = np.clip(g + combined_effect, 0, 255).astype(np.uint8)
    b_channel = np.clip(b + combined_effect, 0, 255).astype(np.uint8)
    
    # Stack channels to create RGB image
    img_array = np.stack([r_channel, g_channel, b_channel], axis=-1)
    
    # Convert NumPy array to PIL Image
    img = Image.fromarray(img_array, mode='RGB')
    
    # Apply blur for fabric softness
    img = img.filter(ImageFilter.GaussianBlur(radius=4))
    
    # Add subtle texture overlay
    img = img.filter(ImageFilter.DETAIL)
    
    return img


def add_soft_lighting(image: Image.Image) -> Image.Image:
    """
    Add soft lighting effect for professional product photography
    Optimized with NumPy vectorization for 4K performance
    """
    width, height = image.size
    
    # Create coordinate grids (vectorized)
    x = np.arange(width)
    y = np.arange(height)
    X, Y = np.meshgrid(x, y)
    
    # Calculate center and max distance
    center_x, center_y = width // 2, height // 2
    max_distance = ((width ** 2 + height ** 2) ** 0.5) / 2
    
    # Calculate distance from center for all pixels (vectorized)
    distance = np.sqrt((X - center_x) ** 2 + (Y - center_y) ** 2)
    
    # Create vignette effect (lighter in center, darker at edges)
    brightness = (30 * (1 - distance / max_distance)).astype(np.uint8)
    
    # Stack to create RGB overlay
    overlay_array = np.stack([brightness, brightness, brightness], axis=-1)
    overlay = Image.fromarray(overlay_array, mode='RGB')
    
    # Blend with original image
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=100))
    result = Image.blend(image, overlay, alpha=0.3)
    
    return result


def create_velvet_texture(width: int, height: int, base_color: str) -> Image.Image:
    """Create velvet-like texture using noise and gradients"""
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    
    # Parse base color
    r, g, b = getrgb(base_color)
    
    # Add noise for velvet texture
    for i in range(width):
        for j in range(height):
            noise = random.randint(-15, 15)
            pixels[i, j] = (
                max(0, min(255, r + noise)),
                max(0, min(255, g + noise)),
                max(0, min(255, b + noise))
            )
    
    # Apply blur for softness
    img = img.filter(ImageFilter.GaussianBlur(radius=3))
    return img


def create_marble_texture(width: int, height: int, base_color: str, vein_color: str = "#ffffff") -> Image.Image:
    """Create marble-like texture with veins"""
    img = Image.new('RGB', (width, height), base_color)
    draw = ImageDraw.Draw(img)
    
    # Add marble veins
    for _ in range(8):
        x_start = random.randint(0, width)
        y_start = random.randint(0, height)
        
        points = [(x_start, y_start)]
        for step in range(30):
            x_delta = random.randint(-50, 50)
            y_delta = random.randint(-50, 50)
            x_new = points[-1][0] + x_delta
            y_new = points[-1][1] + y_delta
            points.append((x_new, y_new))
        
        draw.line(points, fill=vein_color, width=random.randint(2, 5))
    
    # Blur for natural look
    img = img.filter(ImageFilter.GaussianBlur(radius=8))
    return img


def apply_lighting(image: Image.Image, preset: str, intensity: float = 1.0) -> Image.Image:
    """Apply lighting effects based on preset"""
    if preset == "moody":
        # Darken overall, add directional light
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(0.7 * intensity)
        
        # Add vignette
        image = apply_vignette(image, strength=0.4)
        
    elif preset == "soft-glow":
        # Soft, even lighting
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.1 * intensity)
        
        # Slight blur for glow
        image = image.filter(ImageFilter.GaussianBlur(radius=1))
        
    elif preset == "spotlight":
        # Dramatic spotlight from top
        image = apply_vignette(image, strength=0.6, center_x=0.5, center_y=0.3)
        
    elif preset == "studio":
        # Even, professional lighting
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.05 * intensity)
        
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.1)
    
    return image


def apply_vignette(image: Image.Image, strength: float = 0.3, center_x: float = 0.5, center_y: float = 0.5) -> Image.Image:
    """Apply vignette effect"""
    width, height = image.size
    
    # Create radial gradient mask
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    center = (int(width * center_x), int(height * center_y))
    max_dist = ((width/2)**2 + (height/2)**2)**0.5
    
    for x in range(width):
        for y in range(height):
            dist = ((x - center[0])**2 + (y - center[1])**2)**0.5
            brightness = int(255 * (1 - (dist / max_dist) * strength))
            mask.putpixel((x, y), max(0, min(255, brightness)))
    
    # Apply mask
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    result = Image.composite(Image.new('RGB', image.size, 'black'), image, mask)
    return result


def apply_window_shadows(image: Image.Image, intensity: float = 0.5) -> Image.Image:
    """Apply window-pane shadow effect"""
    width, height = image.size
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Create vertical shadow bars (window panes)
    num_bars = 4
    bar_width = width // (num_bars * 3)
    
    for i in range(num_bars):
        x_pos = i * (width // num_bars) + width // (num_bars * 2)
        
        # Draw shadow bar
        shadow_alpha = int(intensity * 180)
        draw.rectangle(
            [(x_pos, 0), (x_pos + bar_width, height)],
            fill=(0, 0, 0, shadow_alpha)
        )
    
    # Blur shadows for softness
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=15))
    
    # Composite with original
    if image.mode != 'RGBA':
        image = image.convert('RGBA')
    
    result = Image.alpha_composite(image, overlay)
    return result


def apply_color_grading(image: Image.Image, style: str) -> Image.Image:
    """Apply color grading based on style"""
    if style == "warm":
        # Enhance reds and yellows
        r, g, b = image.split()
        r = ImageEnhance.Brightness(r).enhance(1.1)
        g = ImageEnhance.Brightness(g).enhance(1.05)
        image = Image.merge('RGB', (r, g, b))
        
    elif style == "cool":
        # Enhance blues
        r, g, b = image.split()
        b = ImageEnhance.Brightness(b).enhance(1.15)
        image = Image.merge('RGB', (r, g, b))
        
    elif style == "dramatic" or style == "luxury":
        # High contrast, rich colors
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)
        
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.1)
    
    return image


def generate_advanced_background(width: int, height: int, settings: Dict[str, Any]) -> Image.Image:
    """Generate advanced background based on template settings"""
    bg_style = settings.get('backgroundStyle', 'gradient')
    
    if bg_style == 'velvet':
        # Create velvet texture
        colors = settings.get('gradientColors', ['#1a1a2e', '#0f3460'])
        base_color = colors[0] if colors else '#1a1a2e'
        bg = create_velvet_texture(width, height, base_color)
        
    elif bg_style == 'marble':
        colors = settings.get('gradientColors', ['#f8f9fa', '#ffffff'])
        base_color = colors[0] if colors else '#f8f9fa'
        vein_color = '#d0d0d0' if 'white' in str(base_color).lower() else '#808080'
        bg = create_marble_texture(width, height, base_color, vein_color)
        
    elif bg_style == 'minimal':
        # Simple solid or subtle gradient
        color = settings.get('gradientColors', ['#ffffff'])[0]
        bg = Image.new('RGB', (width, height), color)
        
    elif bg_style == 'gradient':
        colors = settings.get('gradientColors', ['#0F2027', '#203A43', '#2C5364'])
        if len(colors) >= 2:
            bg = create_gradient_background(width, height, colors[0], colors[1])
        else:
            bg = Image.new('RGB', (width, height), colors[0])
            
    elif bg_style == 'festive':
        # Festive background with effects
        colors = settings.get('gradientColors', ['#d4af37', '#ffd700'])
        bg = create_gradient_background(width, height, colors[0], colors[1])
        
        # Add sparkle/bokeh effect (simplified)
        overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        for _ in range(50):
            x = random.randint(0, width)
            y = random.randint(0, height)
            size = random.randint(3, 8)
            alpha = random.randint(100, 200)
            draw.ellipse([(x, y), (x+size, y+size)], fill=(255, 255, 255, alpha))
        
        bg = bg.convert('RGBA')
        bg = Image.alpha_composite(bg, overlay.filter(ImageFilter.GaussianBlur(radius=2)))
        bg = bg.convert('RGB')
    else:
        # Default gradient
        bg = create_gradient_background(width, height, '#1a1a2e', '#0f3460')
    
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


def apply_post_processing(image: Image.Image, enhance_quality: bool = True) -> Image.Image:
    """
    Apply post-processing to enhance image quality for 4K clarity
    """
    # Auto-contrast for better clarity
    image = ImageOps.autocontrast(image, cutoff=1)
    
    if enhance_quality:
        # Enhance sharpness for 4K clarity
        sharpness_enhancer = ImageEnhance.Sharpness(image)
        image = sharpness_enhancer.enhance(1.3)
        
        # Enhance color saturation slightly
        color_enhancer = ImageEnhance.Color(image)
        image = color_enhancer.enhance(1.1)
        
        # Enhance brightness slightly
        brightness_enhancer = ImageEnhance.Brightness(image)
        image = brightness_enhancer.enhance(1.05)
    
    return image


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "Drisya Image Processor"})


@app.route('/process', methods=['POST'])
def process_image():
    """
    Process image with advanced template settings
    
    Expected JSON:
    {
        "image": "base64_encoded_image",
        "template_settings": {
            "backgroundStyle": "velvet/marble/minimal/gradient/festive",
            "lightingPreset": "moody/soft-glow/spotlight/studio",
            "shadowIntensity": 0.0-1.0,
            "vignetteStrength": 0.0-1.0,
            "colorGrading": "warm/cool/dramatic/luxury/neutral",
            "gradientColors": ["#color1", "#color2"],
            "diffusionPrompt": "text description"
        },
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
        
        # Get template settings
        settings = data.get('template_settings', {})
        
        # Generate advanced background
        background = generate_advanced_background(1080, 1080, settings)
        
        # Composite images
        result = composite_image(image, background)
        
        # Apply lighting preset
        lighting_preset = settings.get('lightingPreset', 'soft-glow')
        result = apply_lighting(result, lighting_preset)
        
        # Apply window shadows if specified
        shadow_intensity = settings.get('shadowIntensity', 0)
        if shadow_intensity > 0:
            result = result.convert('RGBA')
            result = apply_window_shadows(result, shadow_intensity)
            result = result.convert('RGB')
        
        # Apply vignette if specified
        vignette_strength = settings.get('vignetteStrength', 0)
        if vignette_strength > 0:
            result = apply_vignette(result, vignette_strength)
        
        # Apply color grading
        color_grading = settings.get('colorGrading', 'neutral')
        if color_grading != 'neutral':
            result = apply_color_grading(result, color_grading)
        
        # Ensure 1080x1080 output
        result = result.resize((1080, 1080), Image.Resampling.LANCZOS)
        
        # Convert to base64
        buffer = io.BytesIO()
        result.save(buffer, format='PNG', quality=95)
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


@app.route('/ai-edit', methods=['POST'])
def ai_edit():
    """
    AI-powered image editing with custom prompt
    Fallback endpoint when HuggingFace API is unavailable
    Supports 4K quality output (2160x2160) for crystal clear results
    """
    try:
        import requests
        from urllib.parse import urlparse
        
        data = request.json
        image_url = data.get('image_url')
        prompt = data.get('prompt', '')
        quality = data.get('quality', '4k')  # '4k', 'hd', or 'standard'
        
        if not image_url:
            return jsonify({"success": False, "error": "image_url is required"}), 400
        
        # Determine output size based on quality setting
        if quality == '4k':
            output_size = (2160, 2160)  # 4K quality
        elif quality == 'hd':
            output_size = (1920, 1920)  # Full HD
        else:
            output_size = (1080, 1080)  # Standard
        
        # Fetch image from URL
        if image_url.startswith('http'):
            response = requests.get(image_url)
            image = Image.open(io.BytesIO(response.content))
        else:
            # Local file path
            image = Image.open(image_url)
        
        # Convert to high quality RGB
        image = image.convert('RGB')
        
        # Resize to target quality maintaining aspect ratio
        image = ImageOps.fit(image, output_size, Image.Resampling.LANCZOS)
        
        # Parse prompt to create background based on description
        # Enhanced background creation for better quality
        background = create_textured_background(output_size[0], output_size[1], prompt)
        
        # Remove background from original image (simple method)
        image_rgba = image.convert('RGBA')
        image_no_bg = remove_background_simple(image_rgba)
        
        # Composite onto new background
        result = composite_image(image_no_bg, background, size=output_size)
        
        # Apply post-processing for 4K clarity
        result = apply_post_processing(result, enhance_quality=True)
        
        # Return as high-quality PNG
        buffer = io.BytesIO()
        result.save(buffer, format='PNG', quality=95, optimize=True)
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='image/png',
            as_attachment=False
        )
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"AI edit error: {str(e)}")
        print(f"Full traceback: {error_detail}")
        return jsonify({"success": False, "error": str(e), "details": error_detail}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_SERVICE_PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
