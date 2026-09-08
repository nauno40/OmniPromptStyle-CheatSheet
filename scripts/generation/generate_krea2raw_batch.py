"""
Batch-generate Krea 2 RAW (INT8, non-distilled, real CFG) images for
OmniPromptStyle-CheatSheet.

Same target list, same 4-panel-grid approach as generate_krea2_batch.py.
Krea 2 RAW is the un-distilled parent of Krea 2 Turbo -- the hypothesis
being tested is that Turbo's distillation lost some style/concept
knowledge (a documented "diversity collapse" effect), and RAW should
render niche/rare artist styles more faithfully at the cost of much
slower inference (52 steps + real CFG vs Turbo's 8 steps + cfg=1).

Reuses the exact same CLIP + VAE files already on disk for the Turbo
setup (same qwen3vl_4b architecture family) -- only the UNET differs.
Does NOT use the ComfyUI-Krea2T-Enhancer node (that exists specifically
to compensate for Turbo's distillation, not relevant for RAW) or the
krea2-turbo-sda LoRA (that restores *sampling diversity*, a different
axis from style/concept fidelity, and is a Turbo-only adapter).

Model setup:
  - krea2_raw_int8_convrot.safetensors (diffusion_models/krea2, ~13.5GB)
  - qwen3-vl-4b-heretic_int8.safetensors (text_encoders, shared w/ Turbo)
  - qwen_image_vae.safetensors (vae, shared w/ Turbo)

Output: ./output/img/style/Krea2/RAW_INT8/<Image>.webp

Usage:
    python generate_krea2raw_batch.py             # run the whole batch
    python generate_krea2raw_batch.py --limit 2    # test on the first N only
    python generate_krea2raw_batch.py              # re-run any time to resume /
                                                     # retry failures (anything
                                                     # already on disk is skipped)
"""
import argparse
import json
import random
import re
import sys
import time
from pathlib import Path

import requests
from PIL import Image

COMFY_URL = "http://127.0.0.1:8188"
SCRIPT_DIR = Path(__file__).resolve().parent
TARGET_LIST = SCRIPT_DIR / "target_artists.json"
OUTPUT_ROOT = SCRIPT_DIR / "output" / "img" / "style" / "Krea2" / "RAW_INT8_negprompt"
COMFY_OUTPUT_DIR = Path(r"G:\StabilityMatrix-win-x64\Data\Packages\ComfyUI\output")
LOG_FILE = SCRIPT_DIR / "generation_log_krea2raw_negprompt.jsonl"

PANEL_SIZE = 768
WEBP_QUALITY = 90
CELEBRITY_NAME = "Henry Cavill"
SCENE_CHOICES = ["city", "village", "landscape"]

UNET_NAME = "krea2\\krea2_raw_int8_convrot.safetensors"
CLIP_NAME = "qwen3-vl-4b-heretic_int8.safetensors"
VAE_NAME = "qwen_image_vae.safetensors"
STEPS = 52
CFG = 3.5
SAMPLER_NAME = "euler"
SCHEDULER = "simple"
NEGATIVE_PROMPT_BASE = "text, watermark, signature, caption, title, book cover, gibberish text, blurry, deformed, low quality"
NEGATIVE_PROMPT_ANTI_PHOTO = "photograph, photorealistic, realistic photo, " + NEGATIVE_PROMPT_BASE


def negative_prompt_for(category: str) -> str:
    """Photography-tagged artists should NOT be pushed away from a
    photographic look -- that IS their style. Everyone else gets the
    stronger negative that fixed the gibberish-text/photo-collapse
    failures seen in testing."""
    tags = [t.strip().lower() for t in (category or "").split(",")]
    if "photography" in tags:
        return NEGATIVE_PROMPT_BASE
    return NEGATIVE_PROMPT_ANTI_PHOTO


def generate_prompt_from_name(name: str) -> str:
    """Mirrors src/utils/stringUtils.ts::generatePromptFromName, phrased more
    explicitly ("in the style of X") -- same reasoning as the Krea2 script."""
    clean = re.sub(r" *\([^)]*\) *", "", name)
    parts = [p.strip() for p in clean.split(",")]
    part1 = parts[0]
    part2 = parts[1] if len(parts) > 1 else None
    formatted = f"{part2} {part1}" if part2 else part1
    return f"in the style of {formatted}"


def build_panel_prompts(artist_name: str) -> list[str]:
    base = generate_prompt_from_name(artist_name)
    scene = random.choice(SCENE_CHOICES)
    return [
        base,
        f"{base}, woman",
        f"{base}, {CELEBRITY_NAME}",
        f"{base}, {scene}",
    ]


def build_graph(prompt_text: str, seed: int, filename_prefix: str, negative_prompt: str) -> dict:
    return {
        "194": {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": UNET_NAME, "weight_dtype": "default"},
        },
        "195": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": CLIP_NAME, "type": "krea2", "device": "default"},
        },
        "196": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": VAE_NAME},
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["195", 0], "text": prompt_text},
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["195", 0], "text": negative_prompt},
        },
        "162": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": PANEL_SIZE, "height": PANEL_SIZE, "batch_size": 1},
        },
        "163": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["194", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["162", 0],
                "seed": seed,
                "steps": STEPS,
                "cfg": CFG,
                "sampler_name": SAMPLER_NAME,
                "scheduler": SCHEDULER,
                "denoise": 1,
            },
        },
        "164": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["163", 0], "vae": ["196", 0]},
        },
        "999": {
            "class_type": "SaveImage",
            "inputs": {"images": ["164", 0], "filename_prefix": filename_prefix},
        },
    }


def queue_prompt(graph: dict) -> str:
    resp = requests.post(f"{COMFY_URL}/prompt", json={"prompt": graph}, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    if "error" in data:
        raise RuntimeError(f"ComfyUI rejected the prompt: {data['error']}")
    return data["prompt_id"]


def wait_for_result(prompt_id: str, timeout: int = 1200) -> dict:
    start = time.time()
    while time.time() - start < timeout:
        resp = requests.get(f"{COMFY_URL}/history/{prompt_id}", timeout=30)
        resp.raise_for_status()
        data = resp.json()
        if prompt_id in data:
            entry = data[prompt_id]
            status = entry.get("status", {})
            if status.get("completed") is True or ("outputs" in entry and entry["outputs"]):
                return entry
            if status.get("status_str") == "error":
                raise RuntimeError(f"Generation failed: {status}")
        time.sleep(1)
    raise TimeoutError(f"Timed out waiting for prompt {prompt_id}")


def render_panel(prompt_text: str, seed: int, filename_prefix: str, negative_prompt: str) -> Path:
    graph = build_graph(prompt_text, seed, filename_prefix, negative_prompt)
    prompt_id = queue_prompt(graph)
    result = wait_for_result(prompt_id)
    outputs = result.get("outputs", {}).get("999", {}).get("images", [])
    if not outputs:
        raise RuntimeError("No image found in SaveImage output.")
    img_info = outputs[0]
    return COMFY_OUTPUT_DIR / img_info.get("subfolder", "") / img_info["filename"]


def make_grid(panel_paths: list[Path]) -> Image.Image:
    grid = Image.new("RGB", (PANEL_SIZE * 2, PANEL_SIZE * 2))
    positions = [(0, 0), (PANEL_SIZE, 0), (0, PANEL_SIZE), (PANEL_SIZE, PANEL_SIZE)]
    for path, pos in zip(panel_paths, positions):
        with Image.open(path) as im:
            grid.paste(im.convert("RGB"), pos)
    return grid


def log_event(event: dict):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="Only process the first N artists (for testing).")
    args = ap.parse_args()

    artists = json.loads(TARGET_LIST.read_text(encoding="utf-8"))
    if args.limit:
        artists = artists[: args.limit]

    total = len(artists)
    done = skipped = failed = 0

    for i, artist in enumerate(artists, 1):
        image_name = artist["Image"]
        dest_path = OUTPUT_ROOT / image_name

        if dest_path.exists():
            skipped += 1
            print(f"[{i}/{total}] SKIP (already exists): {image_name}")
            continue

        prompts = build_panel_prompts(artist["Name"])
        negative_prompt = negative_prompt_for(artist.get("Category", ""))
        base_seed = int(time.time() * 1000) % (2**32)
        safe_base = "krea2raw_" + re.sub(r"[^A-Za-z0-9_-]", "_", image_name.rsplit(".", 1)[0])

        print(f"[{i}/{total}] Generating 4 panels for: {artist['Name']!r}")
        for p in prompts:
            print(f"    - {p!r}")
        if negative_prompt == NEGATIVE_PROMPT_BASE:
            print(f"    (Photography category -> anti-photo terms dropped from negative prompt)")

        t0 = time.time()
        try:
            panel_paths = []
            for j, prompt_text in enumerate(prompts):
                png_path = render_panel(prompt_text, base_seed + j, f"{safe_base}_p{j}", negative_prompt)
                panel_paths.append(png_path)

            grid = make_grid(panel_paths)
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            grid.save(dest_path, "WEBP", quality=WEBP_QUALITY)

            done += 1
            elapsed = time.time() - t0
            log_event({"name": artist["Name"], "image": image_name, "prompts": prompts, "status": "ok", "elapsed_s": round(elapsed, 1)})
            print(f"    -> saved {dest_path.relative_to(SCRIPT_DIR)} ({elapsed:.1f}s)")

        except Exception as exc:  # noqa: BLE001 - keep the batch going on any single failure
            failed += 1
            log_event({"name": artist["Name"], "image": image_name, "status": "error", "error": str(exc)})
            print(f"    !! FAILED: {exc}", file=sys.stderr)

    print(f"\nDone. {done} generated, {skipped} skipped (already existed), {failed} failed.")
    print(f"Output folder: {OUTPUT_ROOT}")
    if failed:
        print(f"See {LOG_FILE} for details; just re-run the script to retry the failures "
              f"(anything already on disk is skipped automatically).")


if __name__ == "__main__":
    main()
