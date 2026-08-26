import os
import sys

# Add backend directory to sys.path
cur_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(cur_dir)
backend_dir = os.path.join(parent_dir, "backend")

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.main import app

# Export app for serverless ASGI runners
