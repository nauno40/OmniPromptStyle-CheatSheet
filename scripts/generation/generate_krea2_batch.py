"""
Batch-generate Krea2 images for OmniPromptStyle-CheatSheet.

Targets the same 990 artists that already have an SDXL/JuggernautXL_Lighting
image (see target_artists.json). For each artist, renders the 4 test prompts
documented in CONTRIBUTING.md and composites them into a single 2x2 grid,
matching the project's "one Image per artist" data model:

    1. style of [ArtistName]
    2. style of [ArtistName], woman
    3. style of [ArtistName], Henry Cavill        (panel: top-left, top-right,
    4. style of [ArtistName], <city|village|landscape, random per artist>
                                                     bottom-left, bottom-right)

Negative prompts: CONTRIBUTING.md's negative-prompt blocks (anatomy/NSFW/
border/signature, plus "superman" for prompt 3) are written for classic
CFG-guided SD1.5/SDXL sampling. Krea2 turbo runs at cfg=1 (no classifier-free
guidance), so a negative prompt has no effect on the output -- the reference
Krea2 workflow itself zeroes it out (ConditioningZeroOut). This script does
the same for all 4 panels; the negative-prompt spec is simply not applicable
to this model.

Output: ./output/img/style/Krea2/Turbo_INT8/<Image>.webp -- the exact subpath
used inside the repo's public/ folder, so you can copy the "img" directory
straight into public/ when you're happy with a batch.

Usage:
    python generate_krea2_batch.py             # run the whole batch
    python generate_krea2_batch.py --limit 20   # test on the first 20 only
    python generate_krea2_batch.py              # re-run any time to resume /
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
OUTPUT_ROOT = SCRIPT_DIR / "output" / "img" / "style" / "Krea2" / "Turbo_INT8"
COMFY_OUTPUT_DIR = Path(r"G:\StabilityMatrix-win-x64\Data\Packages\ComfyUI\output")
LOG_FILE = SCRIPT_DIR / "generation_log.jsonl"

PANEL_SIZE = 768        # each of the 4 renders, in pixels (square)
WEBP_QUALITY = 90
CELEBRITY_NAME = "Henry Cavill"
SCENE_CHOICES = ["city", "village", "landscape"]


def generate_prompt_from_name(name: str) -> str:
    """Based on src/utils/stringUtils.ts::generatePromptFromName, with the
    prompt phrase made more explicit ("in the style of X" instead of just
    "style of X") -- Krea2 needs the clearer instruction to actually apply
    the artist's style instead of defaulting to a generic photo portrait."""
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


def build_graph(prompt_text: str, seed: int, filename_prefix: str) -> dict:
    return {
        "194": {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": "krea2\\krea2_turbo_int8_convrot.safetensors", "weight_dtype": "default"},
        },
        "195": {
            "class_type": "CLIPLoader",
            "inputs": {"clip_name": "qwen3-vl-4b-heretic_int8.safetensors", "type": "krea2", "device": "default"},
        },
        "196": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": "qwen_image_vae.safetensors"},
        },
        "207": {
            "class_type": "ComfyUI-Krea2T-Enhancer",
            "inputs": {"model": ["194", 0], "enabled": True, "strength": 2.0, "debug": False},
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["195", 0], "text": prompt_text},
        },
        "190": {
            "class_type": "ConditioningZeroOut",
            "inputs": {"conditioning": ["6", 0]},
        },
        "162": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {"width": PANEL_SIZE, "height": PANEL_SIZE, "batch_size": 1},
        },
        "163": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["207", 0],
                "positive": ["6", 0],
                "negative": ["190", 0],
                "latent_image": ["162", 0],
                "seed": seed,
                "steps": 8,
                "cfg": 1,
                "sampler_name": "er_sde",
                "scheduler": "simple",
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


def wait_for_result(prompt_id: str, timeout: int = 300) -> dict:
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


def render_panel(prompt_text: str, seed: int, filename_prefix: str) -> Path:
    graph = build_graph(prompt_text, seed, filename_prefix)
    prompt_id = queue_prompt(graph)
    result = wait_for_result(prompt_id)
    outputs = result.get("outputs", {}).get("999", {}).get("images", [])
    if not outputs:
        raise RuntimeError("No image found in SaveImage output.")
    img_info = outputs[0]
    return COMFY_OUTPUT_DIR / img_info.get("subfolder", "") / img_info["filename"]


def make_grid(panel_paths: list[Path]) -> Image.Image:
    """2x2 grid, reading order: top-left, top-right, bottom-left, bottom-right."""
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

    # Resuming is simply: an artist whose output .webp already exists on disk
    # gets skipped. A failed generation never writes that file, so a plain
    # re-run of this script already retries every previous failure.
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
        base_seed = int(time.time() * 1000) % (2**32)
        safe_base = "omni_" + re.sub(r"[^A-Za-z0-9_-]", "_", image_name.rsplit(".", 1)[0])

        print(f"[{i}/{total}] Generating 4 panels for: {artist['Name']!r}")
        for p in prompts:
            print(f"    - {p!r}")

        try:
            panel_paths = []
            for j, prompt_text in enumerate(prompts):
                png_path = render_panel(prompt_text, base_seed + j, f"{safe_base}_p{j}")
                panel_paths.append(png_path)

            grid = make_grid(panel_paths)
            dest_path.parent.mkdir(parents=True, exist_ok=True)
            grid.save(dest_path, "WEBP", quality=WEBP_QUALITY)

            done += 1
            log_event({"name": artist["Name"], "image": image_name, "prompts": prompts, "status": "ok"})
            print(f"    -> saved {dest_path.relative_to(SCRIPT_DIR)}")

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
