import os
import sys
from pathlib import Path

django_project = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(django_project))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "karmastat.settings")

from karmastat.wsgi import application

app = application