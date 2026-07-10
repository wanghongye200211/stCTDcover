# stCTD Interactive Explainer

This folder contains the static English-only results and methods explainer for stCTD, the Spatiotemporal Critical Transition Decipherer.

GitHub project: `wanghongye200211/stCTDcover`

Open `index.html` in a browser to view the page. The page is organized around the current six-figure manuscript structure:

- Figure 1: graphical abstract and model overview
- Figure 2: simulation benchmark
- Figure 3: mouse dorsal midbrain
- Figure 4: zebrafish developmental dynamics
- Figure 5: axolotl brain injury-response dynamics
- Figure 6: model comparison

## Update Figure Content

Most future edits should be made in `figure-config.js`.

Use these fields when replacing placeholders or updating figure metadata:

- `preview`: static preview image shown in the hero atlas and figure browser
- `gif`: animated GIF shown in the animated preview panels
- `frames`: PNG frame sequence used by the interactive player
- `pdf`: final PDF path for the figure
- `evidence`: short claim-oriented tags shown in the evidence matrix
- `animation`: GIF metadata, such as temporal scale, animated view, and purpose
- `timeLabel`: label for the time axis
- `timepoints`: visible time chips shown next to the figure and GIF

## Replace Assets

Place static previews in:

```text
assets/
```

Place GIFs in:

```text
assets/gifs/
```

Place figure PDFs in:

```text
assets/pdfs/
```

After replacing a file, update the matching path in `figure-config.js`. The HTML and JavaScript do not need to change unless the page structure itself changes.

## Regenerate Interactive GIF Frames

The page does not rely on browser-native GIF playback for interaction. Instead, each GIF is extracted into PNG frames and the frontend player controls those frames with play, pause, speed, and seek controls.

The current motion assets are standardized by:

```bash
/opt/anaconda3/envs/OT_physics/bin/python results_frontend/tools/build_standard_motion_assets.py
```

This script writes the frontend GIFs, frame folders, and `assets/motion_manifest.json`. The standardized layout intentionally omits figure and model titles inside the animation, removes source plot borders, enlarges the visible data region, places the time marker in the upper right, the label source in the lower left, and the frame step in the lower right. Figure 2 has two simulation panels: pitchfork and heart-to-duck.

After replacing any GIF, regenerate the frame folders:

```bash
/Users/wanghongye/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 results_frontend/tools/extract_gif_frames.py
```

Then update the matching `frames.count` and `frames.delayMs` values in `figure-config.js` if the script reports different values.

## Language Rule

All visible frontend text should remain in English. Before sharing the page, run:

```bash
rg -n "[\p{Han}]" results_frontend -g '!*.pdf'
```

No output means there is no Chinese text in the source files, excluding binary PDF files.
