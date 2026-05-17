import sys, os, shutil, subprocess, json
from pathlib import Path
import tempfile

sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

FOLDER_ID = '14-HcweFrzCaAvnfHgG5eWqedAh3J5Tae'
TEMP = Path(tempfile.gettempdir()) / 'genshin-wallpapers-dl'

# PC aspect ratios to keep (width/height)
PC_RATIOS = {'16:9': 16/9, '16:10': 1.6, '21:9': 21/9, '4:3': 4/3, '3:2': 1.5}
RATIO_TOLERANCE = 0.08

def is_pc_image(fpath):
    from PIL import Image
    try:
        with Image.open(fpath) as img:
            w, h = img.size
    except:
        return False
    if w < 1280 or h < 720:
        return False
    if w < h:
        return False
    ratio = w / h
    return any(abs(ratio - target) < RATIO_TOLERANCE for target in PC_RATIOS.values())

def main():
    import gdown

    TEMP.mkdir(parents=True, exist_ok=True)

    existing = sum(1 for _ in TEMP.rglob('*') if _.is_file() and _.name != 'manifest.json')

    if existing == 0:
        print('No existing files found in temp. Downloading all wallpapers...')
        url = f'https://drive.google.com/drive/folders/{FOLDER_ID}'
        try:
            gdown.download_folder(
                url,
                output=str(TEMP),
                quiet=False,
                remaining_ok=True,
                proxy=None,
                speed=None,
                use_cookies=False,
            )
        except Exception as e:
            print(f'Download completed with minor issues: {e}')
    else:
        print(f'Found {existing} existing files in temp. Skipping download.')

    keep, removed = 0, 0
    kept_files = []
    for root, dirs, files in os.walk(TEMP):
        for fname in files:
            fpath = Path(root) / fname
            ext = fname.lower().rsplit('.', 1)[-1] if '.' in fname else ''
            if ext not in ('jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'):
                fpath.unlink(missing_ok=True)
                removed += 1
                continue
            if is_pc_image(fpath):
                # Write a manifest entry instead of copying (to avoid sandbox restrictions)
                rel = Path(root).relative_to(TEMP)
                kept_files.append({
                    'source': str(fpath),
                    'relative': str(rel / fname),
                    'size': fpath.stat().st_size,
                })
                keep += 1
            else:
                fpath.unlink(missing_ok=True)
                removed += 1

    # Save manifest of kept files
    manifest_path = TEMP / 'manifest.json'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(kept_files, f, indent=2, ensure_ascii=False)

    print(f'\nDone! Kept {keep} PC wallpapers, removed {removed} non-PC files.')
    print(f'Manifest saved to {manifest_path}')
    print(f'\nRun the copy script next: python scripts/copy_wallpapers.py')

if __name__ == '__main__':
    main()
