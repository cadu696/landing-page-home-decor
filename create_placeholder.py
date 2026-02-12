from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(text, output_path, size=(600, 400), color=(200, 200, 200)):
    try:
        img = Image.new('RGB', size, color)
        d = ImageDraw.Draw(img)
        
        # Load a font (or use default)
        try:
           font = ImageFont.truetype("arial.ttf", 40)
        except IOError:
            font = ImageFont.load_default()

        # Calculate text position
        text_bbox = d.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        x = (size[0] - text_width) / 2
        y = (size[1] - text_height) / 2
        
        # Draw text
        d.text((x, y), text, fill=(50, 50, 50), font=font)
        
        img.save(output_path)
        print(f"Placeholder created at {output_path}")
        
    except Exception as e:
        print(f"Error creating placeholder: {e}")

if __name__ == "__main__":
    if not os.path.exists("assets/img"):
        os.makedirs("assets/img")
    create_placeholder("Foto da Fachada", "assets/img/fachada_placeholder.png")
