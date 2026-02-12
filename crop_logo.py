from PIL import Image
import os

def crop_transparent_borders(input_path, output_path):
    print(f"Opening {input_path}...")
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        
        bbox = img.getbbox()
        if bbox:
            print(f"Original size: {img.size}")
            print(f"Content bbox: {bbox}")
            cropped_img = img.crop(bbox)
            print(f"Cropped size: {cropped_img.size}")
            cropped_img.save(output_path)
            print(f"Saved cropped image to {output_path}")
        else:
            print("Image is completely transparent!")
            
    except Exception as e:
        print(f"Error cropping image: {e}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_logo = os.path.join(base_dir, "assets", "img", "logo.png")
    output_logo = os.path.join(base_dir, "assets", "img", "logo_cropped.png")
    
    crop_transparent_borders(input_logo, output_logo)
