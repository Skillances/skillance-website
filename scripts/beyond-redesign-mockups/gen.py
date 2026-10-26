"""Generate the mock-up photos with the Higgsfield CLI from PROMPTS.md.
Usage: python gen.py [example-1-hero ...]   (no args = every missing slot)
Needs `higgsfield` on PATH and a logged-in session (higgsfield auth login)."""
import json, re, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
OUT = ROOT / "assets" / "generated"
MODEL = "gpt_image_2"
text = (ROOT / "PROMPTS.md").read_text(encoding="utf-8")
suffix = re.search(r"## Add to the end of every prompt\s+((?:>.*\n)+)", text).group(1)
suffix = " ".join(l.lstrip("> ").strip() for l in suffix.splitlines())
slots = {
    m.group(1): (m.group(2), m.group(3).strip())
    for m in re.finditer(r"- \*\*`(example-\d-\w+)\.jpg` \((\d+:\d+)\)\*\*: (.+)", text)
}

def run(name):
    ratio, prompt = slots[name]
    cmd = ["higgsfield", "generate", "create", MODEL, "--prompt", f"{prompt} {suffix}",
           "--aspect_ratio", ratio, "--resolution", "2k", "--quality", "medium",
           "--wait", "--json"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    urls = re.findall(r"https://[^\s\"']+\.(?:png|jpg|jpeg|webp)", r.stdout)
    if not urls:
        return name, f"FAILED: {r.stdout[-300:]} {r.stderr[-300:]}"
    data = urllib.request.urlopen(urls[-1]).read()
    Image.open(BytesIO(data)).convert("RGB").save(OUT / f"{name}.jpg", quality=90)
    return name, "ok"

todo = sys.argv[1:] or [n for n in slots if not (OUT / f"{n}.jpg").exists()]
with ThreadPoolExecutor(4) as ex:
    for name, status in ex.map(run, todo):
        print(name, status, flush=True)
