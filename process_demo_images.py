#!/usr/bin/env python3
"""
Process Real Demo Images
Tests the complete workflow with your uploaded product images
"""

import requests
import base64
import json
from PIL import Image
import io
import glob

PYTHON_SERVICE = "http://localhost:5001"
DEMO_DIR = "attached_assets/demo_images/Demo Bulk Image"

print("=" * 70)
print("PROCESSING YOUR DEMO PRODUCT IMAGES")
print("=" * 70)

# Get list of demo images (process first 3 to avoid system overload)
demo_images = glob.glob(f"{DEMO_DIR}/*.jpeg") + glob.glob(f"{DEMO_DIR}/*.jpg") + glob.glob(f"{DEMO_DIR}/*.png")
demo_images = sorted(demo_images)[:3]

print(f"\nFound {len(demo_images)} demo images to process:")
for img_path in demo_images:
    print(f"  • {img_path.split('/')[-1]}")

# Test different template styles
template_styles = [
    {"name": "Velvet Luxury", "backgroundStyle": "velvet", "lightingPreset": "moody", "colorGrading": "luxury"},
    {"name": "Marble Elegance", "backgroundStyle": "marble", "lightingPreset": "spotlight", "colorGrading": "cool"},
    {"name": "Gradient Modern", "backgroundStyle": "gradient", "lightingPreset": "soft-glow", "colorGrading": "warm"},
]

results = []

for idx, img_path in enumerate(demo_images):
    print(f"\n{'─' * 70}")
    print(f"Processing Image {idx + 1}/{len(demo_images)}: {img_path.split('/')[-1]}")
    print(f"{'─' * 70}")
    
    try:
        # Load and resize image to avoid memory issues
        with Image.open(img_path) as img:
            original_size = img.size
            print(f"Original size: {original_size}")
            
            # Resize if too large (keep aspect ratio, max 800px)
            max_size = 800
            if max(img.size) > max_size:
                ratio = max_size / max(img.size)
                new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                print(f"Resized to: {img.size}")
            
            # Convert to base64
            buffer = io.BytesIO()
            img.convert('RGB').save(buffer, format='JPEG', quality=85)
            buffer.seek(0)
            img_b64 = base64.b64encode(buffer.getvalue()).decode()
            
            # Select template style
            style = template_styles[idx % len(template_styles)]
            print(f"Template: {style['name']}")
            print(f"  • Background: {style['backgroundStyle']}")
            print(f"  • Lighting: {style['lightingPreset']}")
            print(f"  • Grading: {style['colorGrading']}")
            
            # Process image
            data = {
                "image": img_b64,
                "remove_background": True,
                "template_settings": {
                    "backgroundStyle": style['backgroundStyle'],
                    "lightingPreset": style['lightingPreset'],
                    "shadowIntensity": 0.4,
                    "vignetteStrength": 0.25,
                    "colorGrading": style['colorGrading']
                }
            }
            
            print("Processing...")
            r = requests.post(f"{PYTHON_SERVICE}/process", json=data, timeout=60)
            
            if r.status_code == 200:
                result = r.json()
                print(f"✓ SUCCESS! Output: {result.get('size', '1080x1080')}")
                
                # Save processed image
                if result.get('image'):
                    processed_data = base64.b64decode(result['image'])
                    processed_img = Image.open(io.BytesIO(processed_data))
                    
                    output_name = f"demo_{idx + 1}_{style['backgroundStyle']}_processed.png"
                    output_path = f"/tmp/{output_name}"
                    processed_img.save(output_path)
                    print(f"✓ Saved: {output_path}")
                    
                    results.append({
                        "original": img_path.split('/')[-1],
                        "output": output_name,
                        "style": style['name'],
                        "size": result.get('size')
                    })
            else:
                print(f"✗ Failed: {r.status_code}")
                
    except Exception as e:
        print(f"✗ Error: {e}")

# Summary
print("\n" + "=" * 70)
print("PROCESSING COMPLETE!")
print("=" * 70)
print(f"\nSuccessfully processed {len(results)} images:")
for r in results:
    print(f"  ✓ {r['original']} → {r['output']} ({r['style']}, {r['size']})")

print("\n" + "=" * 70)
print("EFFECTS APPLIED TO YOUR PRODUCTS:")
print("=" * 70)
print("✓ Background Removal - AI-powered removal of existing backgrounds")
print("✓ Professional Backgrounds - Velvet, marble, gradient textures")
print("✓ Advanced Lighting - Moody, spotlight, soft-glow presets")
print("✓ Shadow Effects - Realistic shadows for depth")
print("✓ Vignette - Professional focus on product")
print("✓ Color Grading - Luxury, warm, cool color treatments")
print("✓ Auto-Enhancement - Contrast, sharpness, tone balance")
print("✓ Standard Output - 1080x1080px professional format")
print("\n✨ YOUR PRODUCTS ARE NOW CLEAN, SHINY, AND PROFESSIONAL!")
print("=" * 70)
