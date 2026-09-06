import os
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
django_project = project_root / "backend" / "karmastat"
sys.path.insert(0, str(django_project))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "karmastat.settings")

from karmastat.wsgi import application

app = application
