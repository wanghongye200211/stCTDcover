# SpaPOT Cover

This repository contains a standalone static English-only results summary page for the SpaPOT / stVCR project.

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

## Interactive Motion Panels

The page does not rely on browser-native GIF playback for interaction. Each motion panel uses pre-extracted PNG frames under `assets/frames/`, which lets the frontend player provide play, pause, speed, and seek controls.

If a GIF is replaced later, replace the matching frame sequence under `assets/frames/` and update the matching `frames.count` and `frames.delayMs` values in `figure-config.js`.

## Language Rule

All visible frontend text should remain in English. Before sharing the page, run:

```bash
rg -n "[\p{Han}]" . -g '!*.pdf'
```

No output means there is no Chinese text in the source files, excluding binary PDF files.
