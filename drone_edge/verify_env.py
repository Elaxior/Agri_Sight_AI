
"""Environment Verification Script"""
import sys

def check_imports():
    packages = {
        'ultralytics': 'YOLOv8',
        'cv2': 'OpenCV',
        'torch': 'PyTorch',
        'numpy': 'NumPy',
        'yaml': 'PyYAML',
        'PIL': 'Pillow'
    }
    
    print("🔍 Checking Python Environment\n")
    print(f"Python: {sys.version.split()[0]}")
    print(f"Location: {sys.executable}\n")
    
    all_good = True
    for package, name in packages.items():
        try:
            mod = __import__(package)
            version = getattr(mod, '__version__', 'unknown')
            print(f"✅ {name:15} {version}")
        except ImportError:
            print(f"❌ {name:15} NOT INSTALLED")
            all_good = False
    
    # Check CUDA availability
    import torch
    print(f"\n{'GPU (CUDA):':15} {'✅ Available' if torch.cuda.is_available() else '⚠️ Not available (CPU only)'}")
    
    if all_good:
        print("\n🎉 Environment ready for Part 3!")
    else:
        print("\n❌ Missing packages - run: pip install -r requirements.txt")

if __name__ == "__main__":
    check_imports()

