import os
from PIL import Image

def analyze_image(image_path):
    print(f"--- Analyzing {os.path.basename(image_path)} ---")
    if not os.path.exists(image_path):
        print(f"ERROR: File not found at {image_path}")
        return

    try:
        img = Image.open(image_path)
        print(f"Format: {img.format}")
        print(f"Size: {img.size}")
        print(f"Mode: {img.mode}")
    except Exception as e:
        print(f"ERROR processing image: {e}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, "assets", "img")
    
    analyze_image(os.path.join(assets_dir, "fachada_loja.png"))
    analyze_image(os.path.join(assets_dir, "logo.png"))
