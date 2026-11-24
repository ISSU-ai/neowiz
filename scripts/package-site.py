"""Build a minimal static deployment bundle using only Python's standard library."""
from pathlib import Path
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
files = ['index.html', 'guide.html', 'assets/neowiz.png', 'assets/megazonecloud.svg']
out = root / 'dist'
out.mkdir(exist_ok=True)
for name in files:
    source = root / name
    destination = out / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)
archive = root / 'neowiz-ai-training.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for name in files:
        bundle.write(out / name, name)
print(f'Deployment files: {out}')
print(f'Archive: {archive}')
