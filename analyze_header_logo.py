import os
import sys

def install_pillow():
    print("Biblioteca Pillow não encontrada. Tentando instalar...")
    try:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        print("Pillow instalado com sucesso!")
    except Exception as e:
        print(f"Falha ao instalar Pillow: {e}")
        sys.exit(1)

try:
    from PIL import Image
except ImportError:
    install_pillow()
    from PIL import Image

def analyze_logo(image_path):
    if not os.path.exists(image_path):
        print(f"Erro: Arquivo não encontrado em {image_path}")
        return

    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        print(f"Dimensões: {width}x{height}")
        
        # Analisa a transparência
        bbox = img.getbbox()
        if not bbox:
            print("A imagem é totalmente transparente.")
            return

        left, top, right, bottom = bbox
        print(f"Caixa Delimitadora (Conteúdo): {left}, {top}, {right}, {bottom}")
        # Margem superior transparente
        print(f"Margem superior transparente: {top} pixels")
        # Margem inferior transparente
        print(f"Margem inferior transparente: {height - bottom} pixels")
        
        # Calcula a porcentagem da margem superior em relação à altura total
        if height > 0:
            top_percentage = (top / height) * 100
            print(f"A margem superior representa {top_percentage:.2f}% da altura total.")
        
    except Exception as e:
        print(f"Erro ao analisar a imagem: {e}")

if __name__ == "__main__":
    # Obtém o diretório onde o script está localizado
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Constrói o caminho absoluto para o logo
    logo_path = os.path.join(script_dir, "assets", "img", "logo.png")
    
    print(f"Analisando: {logo_path}")
    analyze_logo(logo_path)
