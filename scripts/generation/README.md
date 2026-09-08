# Scripts de génération par batch

Scripts Python qui pilotent ComfyUI (via son API HTTP, sans passer par l'éditeur) pour générer les
grilles de comparaison 2×2 de ce projet, pour les 990 artistes de `target_artists.json` (un
sous-ensemble de `src/data/artists.json` correspondant au tier SDXL, utilisé comme référence
commune pour comparer les modèles entre eux).

## Fonctionnement commun

Tous les scripts suivent le même schéma :

1. Pour chaque artiste, génèrent 4 prompts à partir de son nom (`in the style of {Name}`) :
   - le prompt de base
   - `, woman`
   - `, Henry Cavill`
   - `, {ville/village/paysage tiré au hasard}`
2. Envoient chaque prompt à ComfyUI (`POST /prompt`) avec un graphe API brut (pas de fichier
   workflow), attendent le résultat (`GET /history/{id}`), récupèrent les 4 images.
3. Assemblent les 4 images en une grille 2×2 (`output.webp`, qualité 90).
4. Sautent automatiquement les artistes déjà présents dans le dossier de sortie — un script
   interrompu (crash ComfyUI, redémarrage PC...) se relance à l'identique et reprend où il en
   était, sans redemander confirmation.
5. Loggent chaque résultat (succès/erreur) dans un fichier `generation_log_*.jsonl` à côté du
   script.

Prérequis avant de lancer un script : ComfyUI doit tourner sur `http://127.0.0.1:8188` avec les
modèles correspondants déjà en place (voir tableau ci-dessous pour les chemins exacts), et les
dépendances Python (`requests`, `Pillow`) installées dans l'environnement utilisé.

## Scripts (4 tiers en ligne sur le site)

| Script | Modèle | Fichiers modèles | Steps / CFG / Sampler | Dossier de sortie (`public/img/style/...`) |
|---|---|---|---|---|
| `generate_krea2_batch.py` | Krea2 **Turbo** (distillé, INT8) | `krea2\krea2_turbo_int8_convrot.safetensors` + `qwen3-vl-4b-heretic_int8.safetensors` + `qwen_image_vae.safetensors` | 8 / cfg=1 / `er_sde`, `simple` + `ComfyUI-Krea2T-Enhancer` (strength=2.0) | `Krea2/Turbo_INT8` |
| `generate_flux2_batch.py` | Flux.2 **Klein 9B** (distillé, FP8) | `flux2\flux-2-klein-9b-fp8mixed.safetensors` + `qwen_3_8b_fp8mixed.safetensors` + `flux2-vae.safetensors` | 4 / cfg=1 / `euler`, `simple` | `Flux2/Klein9B_FP8` |
| `generate_krea2raw_batch.py` | Krea2 **RAW** (non-distillé, INT8) | `krea2\krea2_raw_int8_convrot.safetensors` + `qwen3-vl-4b-heretic_int8.safetensors` (même CLIP que Turbo) + `qwen_image_vae.safetensors` | 52 / cfg=3.5 / `euler`, `simple` | `Krea2/RAW_INT8` |
| `generate_sd35_batch.py` | Stable Diffusion 3.5 **Large** (non-distillé, fp8 scaled) | checkpoint unique `sd35\sd3.5_large_fp8_scaled.safetensors` (CLIP+VAE inclus) | 20 / cfg=4.0 / `euler`, `sgm_uniform` | `SD3.5/Large_FP8` |

Les tiers Turbo (Krea2, Flux2) utilisent `cfg=1` car ce sont des modèles distillés — le prompt
négatif n'a aucun effet et est neutralisé (`ConditioningZeroOut`). Les tiers RAW/SD3.5 utilisent un
vrai CFG, donc un vrai prompt négatif — voir point suivant.

### Négatif adapté par catégorie (Krea2 RAW et SD3.5 uniquement)

Avec un CFG réel, un négatif générique anti-photo/anti-texte corrige deux problèmes constatés en
test : le style qui retombe en photo dès qu'un sujet concret (`woman`, `Henry Cavill`) est ajouté au
prompt, et des hallucinations de texte illisible sur certains artistes. Mais ce négatif ne doit
**pas** s'appliquer aux artistes catégorisés `Photography` dans `target_artists.json` — pour eux,
un rendu photographique *est* le style recherché. `negative_prompt_for(category)` gère ce cas :
négatif complet par défaut, négatif allégé (juste anti-texte/watermark) si `Photography` est dans
les catégories de l'artiste.

## Usage

```bash
cd scripts/generation
python generate_sd35_batch.py              # lance/reprend le batch complet (990 artistes)
python generate_sd35_batch.py --limit 20   # limite aux 20 premiers artistes (pour tester)
```

(remplacer `generate_sd35_batch.py` par le script voulu — même interface pour les 4). Les images
sont écrites dans `scripts/generation/output/img/style/...` — à copier dans `public/img/style/...`
une fois le batch terminé.

## Pistes abandonnées

Deux pistes explorées mais jamais menées à un batch complet (donc jamais commitées) :

- **Qwen-Image** (quantification Nunchaku FP4) — les kernels CUDA custom de Nunchaku ne sont pas
  optimisés pour les GPU Blackwell (RTX 5070 Ti) : ~270s/panel en régime établi, confirmé par
  plusieurs tests + issues GitHub du projet.
- **Flux.2 Dev** (GGUF Q2_K) — techniquement fonctionnel, mais le CLIP (Mistral-3-Small, 11.7GB) et
  l'UNET (12.6GB) ne tiennent jamais ensemble dans les 16GB de VRAM : ComfyUI décharge l'un pour
  charger l'autre à chaque panel, ~10-17min/panel en régime établi (~1 mois pour les 990 artistes).

Si l'un de ces axes est repris un jour (nouveau GPU, nouvelle quantification...), il faudra
reconstruire le graphe ComfyUI depuis zéro en s'inspirant du schéma commun ci-dessus.
