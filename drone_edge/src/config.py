"""
config.py
=========
Configuration management
"""

import yaml
from pathlib import Path
from typing import Dict, Any


def load_config() -> Dict[str, Any]:
    """
    Load configuration from config.yaml located at project root (drone_edge/).
    """

    # 🔑 Resolve project root (drone_edge/)
    base_dir = Path(__file__).resolve().parent.parent

    # 🔑 Always load config.yaml from project root
    config_path = base_dir / "config.yaml"

    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path, "r") as f:
        config = yaml.safe_load(f)

    return config
