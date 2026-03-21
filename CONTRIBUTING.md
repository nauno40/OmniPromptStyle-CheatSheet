# Contributing Guide - OmniPromptStyle

First of all, thank you for taking the time to contribute! 🚀

This document provides guidelines and instructions for contributing to the **OmniPromptStyle - Cheat Sheets** project. Whether you want to add new styles, fix a bug, or improve the interface, your help is welcome.

## Table of Contents

- [How to Contribute](#how-to-contribute)
  - [Reporting a Bug](#reporting-a-bug)
  - [Suggesting an Enhancement](#suggesting-an-enhancement)
  - [Adding New Styles / Artists](#adding-new-styles--artists)
- [Installation and Local Development](#installation-and-local-development)
- [Project Architecture](#project-architecture)
- [Coding Guidelines](#coding-guidelines)
- [Useful Scripts](#useful-scripts)
- [Pull Request (PR) Process](#pull-request-pr-process)

---

## How to Contribute

### Reporting a Bug

If you find a bug, please check if it hasn't already been reported in the *Issues*. If not, open a new *Issue* including:
- A clear description of the problem.
- Steps to reproduce the bug.
- Expected behavior vs actual behavior.
- Screenshots if possible.
- Your environment (Browser, OS).

### Suggesting an Enhancement

Enhancement ideas are always appreciated! Open an *Issue* with the `enhancement` tag and describe in detail the feature you would like to see, as well as the use cases it could solve.

### Adding New Styles / Artists

Adding new styles or artist references is the core of this project. Here is the exact procedure:

1. **Update the database (`src/data/artists.json`):**
   Add a new entry to the JSON array. Each entry must follow this structure:
   ```json
   {
       "Name": "Name of the artist or Style",
       "Born": "Birth year (or empty string)",
       "Death": "Death year (or empty string)",
       "Category": "Categories and mediums separated by commas",
       "Image": "Base-Filename.webp",
       "Creation": "Date in YYYYMMDDHHMM format"
   }
   ```
   *Note: The `"Image"` value (e.g., `Base-Filename.webp`) serves as the base identifier to link the data to the generated images.*

2. **Add the generated images:**
   Place the generated images (in `.webp` format) in the directories corresponding to the architecture and checkpoint used.
   
   The folder hierarchy follows this format: `public/img/style/[Model]/[Checkpoint]/`
   
   Examples:
   - `public/img/style/SDXL/JuggernautXL_Lighting/Base-Filename.webp`
   - `public/img/style/Flux/dev/Base-Filename.webp`
   
   **Important:** The image filename must **exactly** match the value provided in `"Image"` in `artists.json`, with no extra spaces before the extension.

3. **Check for orphan images:**
   Once the addition is complete, run the dedicated script to check that no image is misnamed or missing from your JSON file:
   ```bash
   node scripts/check_orphan_images.js
   ```

## Image Generation for Styles

While this project covers multiple architectures via an automated ComfyUI workflow (including SDXL and FLUX), many of our standard SD 1.5 baseline images were generated with specific conditions that you should follow if contributing to that tier:

- **Checkpoints (SD 1.5):** Deliberate v2 or DreamShaper 3.2.
- **Sampler:** DPM++ 2M Karras or DPM++ SDE Karras (depending on which yields a better result).
- **Resolution:** Final resolution is never smaller than 768px × 768px (higher for SDXL and FLUX models).

### The Prompts

To systematically test the aesthetic of each artist, our text inputs use a specific set of prompts:

1. `--prompt style of [ArtistName]`
2. `--prompt style of [ArtistName], woman`
3. `--prompt style of [ArtistName], Henry C_____` *(with `--negative_prompt superman`)*
4. `--prompt style of [ArtistName], city or village or landscape`

**Why these prompts?**
- **The first line** produces a broad, uninfluenced impression of what is most common for that artist (landscape, person, abstract, etc.).
- **With 'woman'**, you get a wider range of portraits that are more in line with the artist's personal aesthetic.
- **For the third line:** The actor Henry C. is well-known and strongly trained into SD. You can evaluate the dominance of the artist's style depending on whether he is rendered normally (weak artist style) or if his superhero costume elements appear.
- **The last line ('city' or 'village' or 'landscape')** gives a good idea of how houses, people, and technical items (cars, bikes, etc.) appear.

### Negative Prompts

These are the negative prompts used to generate the images. They are intentionally kept short (mostly focusing on human anatomy) to avoid influencing the distinct styles. *Note: Deliberate contains some NSFW mixes and requires 'nsfw' in the negative prompt, whereas DreamShaper heavily leans towards manga and frequently requires 'manga, anime'.*

These are included for documentation purposes only; please make sure to do your own research.

**1. Basic Negative Prompt:**
> mutation, deformed, deformed iris, duplicate, morbid, mutilated, disfigured, poorly drawn hand, poorly drawn face, bad proportions, gross proportions, extra limbs, cloned face, long neck, malformed limbs, missing arm, missing leg, extra arm, extra leg, fused fingers, too many fingers, extra fingers, mutated hands, blurry, bad anatomy, out of frame, contortionist, contorted limbs, exaggerated features, disproportionate, twisted posture, unnatural pose, disconnected, disproportionate, warped, misshapen, out of scale

**2. Standard Filtering:**
These blocks ('NSFW', 'Border' and 'Signature') are always selected regardless of the style:
- **NSFW:** nude, naked, nsfw, nipple, genitals, penis, vagina
- **Border:** border, frame, picture frame
- **Signature:** logo, text, signature, watermark, copyright

**3. No Anime / Manga:**
In order to limit the influence of manga/anime from checkpoint merges, it is occasionally necessary to include specific terms in the negative prompt. *(Note: This is strictly omitted for actual Asian artists or explicit manga/anime styles).*
> anime, manga, asian [OPTIONAL IF NEEDED: chinese, japanese, korean]

### Example Workflow (ComfyUI)

If you are using ComfyUI, we have included an example automated workflow that you can load directly:
[Batch JuggernautXL Lightning.json](src/assets/ComfyUI/Batch%20JuggernautXL%20Lightning.json)

This workflow is pre-configured for generating image batches using the **JuggernautXL Lightning** checkpoint. It automates the generation process using the exact prompt structure and testing conditions described above. 

You can use it as a reference to understand our generation process or as a ready-to-use template if you plan to generate new styles for the database.

---

## Installation and Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm (or pnpm/yarn)

### Installation

1. **Fork** the repository and clone it locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/StableDiffusion-CheatSheet.git
   cd StableDiffusion-CheatSheet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## Project Architecture

The project is built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

- `public/`: Contains static assets, mainly all the images generated by ComfyUI in `public/img/`.
- `src/`: React source code.
  - `components/`: Reusable UI components.
  - `hooks/`: Custom React hooks.
  - `services/`: Data fetching and comparison logic.
  - `data/`: Data files (like the list of models, artists, etc.).
  - `types/`: TypeScript interfaces and types.
  - `utils/`: Various utility functions.
- `scripts/`: Node.js utility scripts (e.g., image checking).

---

## Coding Guidelines

In order to maintain a clean and consistent codebase:

- **TypeScript:** The project uses TypeScript strictly. Make sure to properly type your variables, props, and function returns (use the `src/types` folder for global interfaces).
- **ESLint & Formatting:** The linter is configured to maintain code quality. Before submitting code, check that there are no errors:
  ```bash
  npm run lint
  ```
- **React Components:** Prefer functional components (`React.FC`) with the use of Hooks.
- **Tailwind CSS:** Use Tailwind utility classes for styling. Only modify `index.css` if necessary for global variables or styles unavailable via Tailwind.
- **Naming Conventions:** 
  - React files and components in *PascalCase* (e.g., `StyleCard.tsx`).
  - Functions and variables in *camelCase*.

### Commit Messages

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) conventions. Examples:
- `feat: add support for a new SDXL checkpoint`
- `fix: resolve mobile display issue`
- `docs: update README`
- `style: remove spaces before .webp`

---

## Useful Scripts

- `npm run dev`: Starts the Vite server in development mode with Hot Reloading.
- `npm run build`: Compiles the project for production into the `dist` folder.
- `npm run preview`: Allows previewing the production build locally.
- `npm run lint`: Analyzes the code to detect errors.
- `node scripts/check_orphan_images.js`: Checks for discrepancies between images in folders and the JSON data.

---

## Pull Request (PR) Process

1. Create a branch from `main` for your feature or fix:
   ```bash
   git checkout -b feature/my-new-feature
   ```
   or
   ```bash
   git checkout -b fix/display-bug-fix
   ```
2. Make your changes and test them locally (ensure there are no Lint errors or unnecessary Vite warnings).
3. Commit your changes following conventions.
4. Push your branch to your fork (`git push origin feature/my-new-feature`).
5. Open a Pull Request on the original repository.
   - Provide a detailed description of the change.
   - Mention related *Issues* (e.g., `Fixes #12`).
   - Add screenshots if visual changes were made.

---

Thanks again for contributing to the improvement of **OmniPromptStyle**! ❤️
