"""
Edge Node Test Script
Precision Agriculture Drone Simulation - Part 1
"""

import sys
import platform
from datetime import datetime

def check_environment():
    """Verify Python environment and dependencies."""
    print("=" * 60)
    print("DRONE EDGE NODE - ENVIRONMENT CHECK")
    print("=" * 60)
    
    # System information
    print(f"\n✓ Python Version: {sys.version.split()[0]}")
    print(f"✓ Platform: {platform.system()} {platform.release()}")
    print(f"✓ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Dependency check
    try:
        import numpy as np
        print(f"✓ NumPy: {np.__version__}")
        
        import PIL
        print(f"✓ Pillow: {PIL.__version__}")
        
        import dotenv
        print(f"✓ python-dotenv: installed")
        
    except ImportError as e:
        print(f"\n✗ Missing dependency: {e}")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("🚁 DRONE EDGE NODE READY")
    print("=" * 60)
    print("\nStatus: All systems operational")
    print("Next: Proceed to Part 2 for AI model training\n")

if __name__ == "__main__":
    check_environment()
