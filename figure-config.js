/*
  Edit this file when the final figures or GIFs change.

  Fields that are designed for later updates:
  - preview: static figure preview shown in the figure browser
  - gif: animated GIF shown in the dynamic preview section; use "" to keep a placeholder
  - frames: extracted PNG frames for interactive playback; rerun tools/extract_gif_frames.py after replacing GIFs
  - pdf: final PDF path; use "" if the final PDF is not ready
  - evidence: short claim-oriented phrases shown in the evidence matrix
  - animation: GIF-specific metadata shown next to animated panels
  - timepoints/timeLabel: labels displayed next to the GIF, safe to edit without touching HTML
*/

window.stCTD_FIGURES = {
  figure1: {
    kicker: "Figure 1",
    shortLabel: "Model overview",
    title: "Graphical abstract and model overview",
    dataset: "Model and workflow",
    role: "Graphical abstract",
    body:
      "stCTD represents each cell or spot by tissue position and a graph-informed gene-latent state, then learns coupled spatial transport, potential-driven molecular motion and source-sink growth.",
    legend:
      "Fig. 1: stCTD model overview. a. Staged spatial transcriptomic sections are connected by generated snapshots and continuous model trajectories; the highlighted interval illustrates a candidate critical transition. b. Tissue coordinates, graph-informed gene-latent states and time labels define the joint input. stCTD learns spatial velocity, gene potential and source-sink growth under matching, spatial, physical and dynamic objectives. c. The fitted fields support intermediate-slice generation, model-inferred source allocation, critical-transition scoring and in silico perturbation analysis.",
    preview: "assets/figure1_model.png?v=20260710",
    gif: "",
    pdf: "assets/pdfs/figure1.pdf?v=20260710",
    alt: "Figure 1 stCTD graphical abstract and model overview",
    evidence: ["joint state x=(s,z)", "spatial-potential-growth fields", "shared downstream model"],
    animation: [],
    timeLabel: "Static overview",
    timepoints: ["Problem", "Model", "Output", "Biology"],
  },
  figure2: {
    kicker: "Figure 2",
    shortLabel: "Simulation",
    title: "Simulation benchmark",
    dataset: "Pitchfork and heart-to-duck systems",
    role: "Controlled benchmark",
    body:
      "Controlled systems test whether stCTD preserves known branch geometry and shape change while recovering source-sink abundance and the designed onset of a critical transition.",
    legend:
      "Fig. 2: Simulation validation of stCTD. a. Rigid alignment control for the pitchfork benchmark, comparing artificially perturbed and aligned slices. b. Observed anchors and generated intermediate frames preserve the expected pitchfork branch separation. c. The interval critical-transition score begins to rise from synthetic time t=1, before terminal branches become visually dominant. d. Fitted potential and local stepwise potential-change maps. e. Observed and generated progenitor and terminal-state counts, testing source-sink mass recovery. f. Spatial-speed maps and velocity arrows at representative intermediate times. g. Heart-to-duck observed anchors and generated shape transitions. h. Cell-type fractions across the heart-to-duck rollout. i. Stepwise potential-action and adjacent spatial-transport components used to interpret the synthetic transition.",
    preview: "assets/figure2_preview.png",
    gif: "assets/gifs/figure2_simulation.gif",
    frames: { base: "assets/frames/figure2/frame_", count: 41, delayMs: 220, start: 0, end: 4, step: 0.1 },
    pdf: "assets/pdfs/figure2.pdf",
    alt: "Figure 2 simulation benchmark preview",
    evidence: ["known branch geometry", "source-sink abundance", "critical onset at t=1"],
    animation: [
      { label: "Temporal scale", value: "synthetic t=0 to t=4" },
      { label: "Animated views", value: "pitchfork and heart-to-duck" },
      { label: "Frame step", value: "0.1 and 0.02 synthetic time" },
    ],
    timeLabel: "Simulation time",
    timepoints: ["t=0", "t=1", "t=2", "t=3", "t=4"],
  },
  figure3: {
    kicker: "Figure 3",
    shortLabel: "Mouse midbrain",
    title: "Mouse dorsal midbrain dynamics",
    dataset: "MOSTA dorsal midbrain",
    role: "Primary developmental case",
    body:
      "Across E12.5, E14.5 and E16.5, stCTD reconstructs a continuous dorsal-midbrain trajectory. A warning rise near E13.5 precedes stronger RGC-origin allocation toward NeuB- and GlioB-associated states.",
    legend:
      "Fig. 3: stCTD reconstruction of mouse dorsal midbrain development. a. E12.5, E14.5 and E16.5 slices before and after alignment, with RGC, NeuB and GlioB annotations. b. Three-dimensional space-time trajectory combining observed stages and generated intermediate sections. c. Gene-latent potential landscape and RGC/NeuB/GlioB state structure. d. The interval critical-transition score rises near E13.5, before the largest visible expansion of non-RGC states. e. RGC-origin alluvial summary of model-inferred allocation across generated and observed times; this is not clonal lineage tracing. f. Observed and predicted RGC, NeuB and GlioB counts at E14.5 and E16.5. g. State-associated expression programmes. h. Efna5 and Fzd3 in silico perturbation rollouts and dose-response summaries. i. Literature-supported pathway context for the two perturbation candidates.",
    preview: "assets/figure3_preview.png?v=20260710",
    gif: "assets/gifs/figure3_mouse_midbrain.gif",
    frames: { base: "assets/frames/figure3/frame_", count: 81, delayMs: 220, start: 12.5, end: 16.5, step: 0.05 },
    pdf: "assets/pdfs/figure3.pdf?v=20260710",
    alt: "Figure 3 mouse dorsal midbrain preview",
    evidence: ["E12.5-E16.5 reconstruction", "warning rise near E13.5", "Efna5/Fzd3 hypotheses"],
    animation: [
      { label: "Temporal scale", value: "E12.5 to E16.5" },
      { label: "Animated view", value: "continuous hybrid rollout from E12.5" },
      { label: "Frame step", value: "0.05 embryonic day" },
    ],
    timeLabel: "Embryonic time",
    timepoints: ["E12.5", "E13.5", "E14.5", "E15.5", "E16.5"],
  },
  figure4: {
    kicker: "Figure 4",
    shortLabel: "Zebrafish",
    title: "Zebrafish developmental dynamics",
    dataset: "ZESTA zebrafish embryo",
    role: "Developmental transfer",
    body:
      "The 10-18 hpf ZESTA series tests temporal transfer across whole-embryo domains. Branch-resolved rises near 14-14.5 hpf are paired with model-inferred neural and mesodermal allocation programmes.",
    legend:
      "Fig. 4: stCTD reconstruction of zebrafish embryogenesis. a. Observed and generated ZESTA embryo frames from 10 to 18 hpf; solid borders mark observed anchors and dashed borders mark model-generated intervals. b. Critical-transition score for the first source branch, with two nominated rises. c. Spatial descendant frames from a neural-keel-associated source. d. Model-inferred alluvial allocation toward neural rod and neural crest/otic-associated states. e. A second branch-specific score rises near 14.5 hpf. f. Spatial descendants from a somite-associated source. g. Model-inferred allocation toward notochord and erythroid-associated endpoints. h. Spatial-speed field and state-resolved speed distributions. i. Row-scaled developmental programme enrichment. j. Differential-expression and pathway summaries for erythroid- and notochord-associated endpoints. The alluvial flows summarize inferred allocation from staged samples, not clonal descent.",
    preview: "assets/figure4_preview.png?v=20260710",
    gif: "assets/gifs/figure4_zebrafish.gif",
    frames: { base: "assets/frames/figure4/frame_", count: 81, delayMs: 220, start: 10, end: 18, step: 0.1 },
    pdf: "assets/pdfs/figure4.pdf?v=20260710",
    alt: "Figure 4 zebrafish developmental dynamics preview",
    evidence: ["10-18 hpf reconstruction", "rises near 14-14.5 hpf", "programme-level annotation"],
    animation: [
      { label: "Temporal scale", value: "10 hpf to 18 hpf" },
      { label: "Animated view", value: "ZESTA annotations" },
      { label: "Frame step", value: "0.1 hpf model frames" },
    ],
    timeLabel: "Developmental time",
    timepoints: ["10 hpf", "12 hpf", "14 hpf", "15 hpf", "16 hpf", "18 hpf"],
  },
  figure5: {
    kicker: "Figure 5",
    shortLabel: "Axolotl brain",
    title: "Axolotl brain injury-response dynamics",
    dataset: "ARTISTA axolotl brain",
    role: "Regeneration transfer",
    body:
      "The 2-20 DPI injury series tests regeneration dynamics. A pre-15 DPI reaEGC warning rise is followed by model-inferred redistribution toward rIPC4, tlNBL and additional downstream states.",
    legend:
      "Fig. 5: stCTD reconstruction of axolotl brain injury-response dynamics. a. ARTISTA slices before and after alignment at 2, 5, 10, 15 and 20 DPI. b. Observed anchors and generated intermediate injury stages, separated by solid and dashed borders. c. reaEGC and VLMC/CMPN-associated warning-score curves; the second reaEGC rise occurs before 15 DPI. d. Spatial maps localizing reaEGC and VLMC score changes. e. Cell-count trajectories for reaEGC, wntEGC, tlNBL, rIPC4, VLMC and CMPN states. f. reaEGC-versus-wntEGC differential-expression and pathway summary. g. Cell-state marker dot plot. h. Potential-ordered NELL2 and DDIT4 expression trends across selected EGC-associated states. The warning and allocation readouts are model-derived hypotheses for regeneration biology.",
    preview: "assets/figure5_preview.png?v=20260710",
    gif: "assets/gifs/figure5_axolotl.gif",
    frames: { base: "assets/frames/figure5/frame_", count: 181, delayMs: 220, start: 2, end: 20, step: 0.1 },
    pdf: "assets/pdfs/figure5.pdf?v=20260710",
    alt: "Figure 5 axolotl brain injury-response dynamics preview",
    evidence: ["2-20 DPI reconstruction", "pre-15 DPI reaEGC rise", "post-15 state redistribution"],
    animation: [
      { label: "Temporal scale", value: "2 DPI to 20 DPI" },
      { label: "Animated view", value: "HJB-regularized hybrid rollout" },
      { label: "Frame step", value: "0.1 DPI" },
    ],
    timeLabel: "DPI timeline",
    timepoints: ["2 DPI", "5 DPI", "10 DPI", "15 DPI", "20 DPI"],
  },
  figure6: {
    kicker: "Figure 6",
    shortLabel: "Model comparison",
    title: "Model comparison across datasets",
    dataset: "Mouse and zebrafish benchmarks",
    role: "Cross-method comparison",
    body:
      "The comparison separates model scope from reconstruction behavior. It evaluates supported functions together with state L1 distance, spatial intersection-over-union and spatial Chamfer distance.",
    legend:
      "Fig. 6: stCTD comparison across datasets and methods. a. Capability matrix comparing stCTD with representative spatial alignment, spatial pseudotime, optimal-transport, reconstruction and perturbation-oriented methods across alignment, generative reconstruction, future-state inference, fate inference, mass dynamics, in silico perturbation and critical-window detection tasks. b. Qualitative reconstruction comparison on mouse dorsal midbrain and zebrafish stages, contrasting observed slices with outputs from baseline methods and stCTD. c. Quantitative comparison of state-level L1, spatial IoU and spatial Chamfer metrics, summarizing state composition, spatial overlap and geometry quality across benchmark settings.",
    preview: "assets/figure6_preview.png",
    gif: "",
    pdf: "assets/pdfs/figure6.pdf",
    alt: "Figure 6 model comparison placeholder",
    evidence: ["capability scope", "spatial and state metrics", "complementary baselines"],
    animation: [],
    timeLabel: "Benchmark axes",
    timepoints: ["Simulation", "Mouse", "Zebrafish", "Axolotl", "Ablation"],
  },
};

window.stCTD_MOTION_PANELS = {
  simPitchfork: {
    kicker: "Figure 2A",
    shortLabel: "pitchfork",
    title: "Pitchfork Fate Simulation",
    dataset: "Synthetic pitchfork fate system",
    role: "Simulation 1",
    preview: "assets/figure2_preview.png",
    gif: "assets/gifs/figure2_simulation.gif",
    frames: { base: "assets/frames/figure2/frame_", count: 41, delayMs: 220, start: 0, end: 4, step: 0.1 },
    alt: "Pitchfork simulation trajectory",
    animation: [
      { label: "Source model", value: "hybrid GeneW10 run" },
      { label: "Frame step", value: "0.1 synthetic time" },
      { label: "Label source", value: "spatiotemporal classifier" },
    ],
    timeLabel: "Simulation time",
    timepoints: ["t=0", "t=1", "t=2", "t=3", "t=4"],
  },
  simHeart2Duck: {
    kicker: "Figure 2B",
    shortLabel: "heart-to-duck",
    title: "Heart-To-Duck Simulation",
    dataset: "Synthetic heart-to-duck system",
    role: "Simulation 2",
    preview: "assets/figure2_preview.png",
    gif: "assets/gifs/figure2_heart2duck.gif",
    frames: { base: "assets/frames/figure2_heart2duck/frame_", count: 51, delayMs: 220, start: 0, end: 1, step: 0.02 },
    alt: "Heart-to-duck simulation trajectory",
    animation: [
      { label: "Source model", value: "gene-potential z-gradient run" },
      { label: "Frame step", value: "0.02 synthetic time" },
      { label: "Label source", value: "fixed heart2duck classifier" },
    ],
    timeLabel: "Simulation time",
    timepoints: ["t=0", "t=0.25", "t=0.5", "t=0.75", "t=1"],
  },
};
