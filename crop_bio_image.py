from PIL import Image
import os

def crop_image(input_path, output_path, crop_percentage=0.10):
    print(f"Opening {input_path}...")
    try:
        img = Image.open(input_path)
        width, height = img.size
        print(f"Original size: {width}x{height}")
        
        # Calculate crop dimensions
        top_crop = int(height * crop_percentage)
        bottom_crop = int(height * crop_percentage)
        
        # Define the cropping box
        left = 0
        top = top_crop
        right = width
        bottom = height - bottom_crop
        
        cropped_img = img.crop((left, top, right, bottom))
        print(f"Cropped size: {cropped_img.size}")
        
        cropped_img.save(output_path)
        print(f"Saved cropped image to {output_path}")
            
    except Exception as e:
        print(f"Error cropping image: {e}")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_img = os.path.join(base_dir, "assets", "img", "cristiane_blue.jpg")
    output_img = os.path.join(base_dir, "assets", "img", "cristiane_blue_v3.jpg")
    
    # Try cropping 20% from top and bottom (cumulative)
    crop_image(input_img, output_img, crop_percentage=0.20)
