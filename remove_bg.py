import sys
import os

# Check for Pillow installation
try:
    from PIL import Image
except ImportError:
    print("Error: Pillow library is not installed. Please run 'pip install Pillow'")
    sys.exit(1)

def remove_black_background(input_path, output_path, threshold=80):
    """
    Removes black background from an image.
    Uses getdata() which returns a sequence (standard, fast, not deprecated).
    Includes a safety crop to remove edge artifacts.
    """
    try:
        if not os.path.exists(input_path):
            print(f"Error: Input file not found at {input_path}")
            return

        print(f"Opening image: {input_path}")
        img = Image.open(input_path).convert("RGBA")
        
        # Safety Crop: Remove 2 pixels from each edge to eliminate border lines
        width, height = img.size
        # Ensure image is big enough to crop
        if width > 4 and height > 4:
            print("Applying safety crop to remove edge artifacts...")
            img = img.crop((2, 2, width-2, height-2))
        
        # Get data as a sequence of tuples (fast C implementation)
        datas = img.getdata()
        
        newData = []
        
        # Process pixels
        print(f"Processing pixels with threshold {threshold}...")
        for item in datas:
            # item is (R, G, B, A)
            if item[0] < threshold and item[1] < threshold and item[2] < threshold:
                # Transparent
                newData.append((0, 0, 0, 0))
            else:
                newData.append(item)

        # Update image data
        img.putdata(newData)
        
        # Save
        img.save(output_path, "PNG")
        print(f"Success! Saved transparent logo to: {output_path}")
        
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Paths (using raw strings for Windows compatibility)
    input_file = r"c:\Users\Usuario\Desktop\testes antigravity\landing page home decor\assets\img\logo_original.jpeg"
    output_file = r"c:\Users\Usuario\Desktop\testes antigravity\landing page home decor\assets\img\logo.png"

    remove_black_background(input_file, output_file)
