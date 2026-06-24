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

window.SpaPOT_FIGURES = {
  figure1: {
    kicker: "Figure 1",
    shortLabel: "abstract graphic",
    title: "Graphical abstract and model overview",
    dataset: "Summary",
    role: "Graphical abstract",
    body:
      "The graphical abstract introduces the core problem, model structure, major outputs, and biological interpretation in a single opening visual.",
    legend:
      "Fig. 1: SpaPOT graphical abstract and model overview. a. Discrete spatial transcriptomic snapshots are connected as a continuous tissue trajectory; observed slices and generated snapshots are separated in the schematic, and the dynamic paths highlight a candidate transition point. b. Training framework for SpaPOT: spatial coordinates, graph-prior gene embeddings and time labels feed the spatial-potential transport equation, which learns spatial velocity, gene-latent potential, growth or decay, and an optimization objective combining matching, spatial, physical and dynamic losses. c. Downstream analyses and applications, including generated spatial slices, lineage inference, critical-point warning, and perturbed gene-program interpretation.",
    preview: "assets/figure1_model.png",
    gif: "",
    pdf: "assets/pdfs/figure1.pdf",
    alt: "Figure 1 SpaPOT graphical abstract placeholder",
    evidence: ["model logic", "input-output structure", "criticality readout"],
    animation: [],
    timeLabel: "Static overview",
    timepoints: ["Problem", "Model", "Output", "Biology"],
  },
  figure2: {
    kicker: "Figure 2",
    shortLabel: "simulation",
    title: "Simulation benchmark",
    dataset: "Synthetic data",
    role: "Simulation",
    body:
      "The simulation benchmark demonstrates whether the model can recover continuous trajectories, cell-type proportions, potential fields, and critical scores in a controlled system.",
    legend:
      "Fig. 2: Simulation validation of SpaPOT. a. Alignment control for the pitchfork benchmark, showing unaligned and aligned synthetic slices. b. Real and generated pitchfork snapshots across synthetic time, with solid borders for observed anchors and dashed borders for generated intervals. c. Critical-score curve across the pitchfork simulation. d. Fitted potential curve and local change-of-potential maps at representative generated times. e. Observed and generated cell-count trajectories for progenitor and terminal fates. f. Spatial-speed maps and velocity arrows at representative intermediate times. g. Heart-to-duck generated trajectory snapshots. h. Heart-to-duck cell-type fractions across generated time. i. Stepwise potential action and spatial optimal-transport components used to interpret the synthetic transition.",
    preview: "assets/figure2_preview.png",
    gif: "assets/gifs/figure2_simulation.gif",
    frames: { base: "assets/frames/figure2/frame_", count: 41, delayMs: 220, start: 0, end: 4, step: 0.1 },
    pdf: "assets/pdfs/figure2.pdf",
    alt: "Figure 2 simulation benchmark preview",
    evidence: ["controlled trajectory recovery", "potential-field validation", "critical-score behavior"],
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
    shortLabel: "mouse midbrain",
    title: "Mouse dorsal midbrain dynamics",
    dataset: "Mouse dorsal midbrain",
    role: "Real dataset 1",
    body:
      "Mouse dorsal midbrain is the main real-data case, linking spatial alignment, generated trajectories, potential landscapes, critical metrics, lineage shifts, and gene perturbation.",
    legend:
      "Fig. 3: SpaPOT reconstructs mouse dorsal midbrain dynamics. a. Before- and after-alignment views of E12.5, E14.5 and E16.5 dorsal midbrain slices, with RGC, NeuB and GlioB annotations. b. Three-dimensional space-time trajectory combining observed slices and generated intermediate slices across embryonic time. c. Gene-latent potential landscape and state structure inferred from the fitted spatial-potential field. d. Critical-window metrics combining the SpaPOT score with the DNB score over embryonic time. e. Model-inferred RGC-origin fate allocation across staged time points, displayed as an alluvial flow summary. f. Observed and predicted cell-count summaries for RGC, NeuB and GlioB states. g. State-associated marker-gene heatmap supporting the RGC, NeuB and GlioB interpretation. h. Efna5 and Fzd3 in silico perturbation rollouts and dose-response summaries. i. Mechanistic pathway diagrams linking the selected perturbation genes with downstream GlioB and NeuB response routes.",
    preview: "assets/figure3_preview.png",
    gif: "assets/gifs/figure3_mouse_midbrain.gif",
    frames: { base: "assets/frames/figure3/frame_", count: 81, delayMs: 220, start: 12.5, end: 16.5, step: 0.05 },
    pdf: "assets/pdfs/figure3.pdf",
    alt: "Figure 3 mouse dorsal midbrain preview",
    evidence: ["main real-data reconstruction", "critical windows", "lineage and perturbation signals"],
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
    shortLabel: "zebrafish",
    title: "Zebrafish developmental dynamics",
    dataset: "Zebrafish / ZESTA",
    role: "Real dataset 2",
    body:
      "The zebrafish dataset is used to show time-point generation, branch criticality, lineage transition, and functional enrichment.",
    legend:
      "Fig. 4: SpaPOT reconstructs zebrafish developmental dynamics. a. Observed and generated ZESTA embryo frames from 10 to 18 hpf, with real anchors and generated intervals distinguished by border style. b. Critical-score and DNB-score curves for the fitted developmental trajectory. c. Spatial descendant frames for a selected 10 hpf source branch propagated through generated and observed stages. d. Branch-lineage alluvial summary linking the selected source branch to later neural and mesodermal annotations. e. Branch-specific criticality readout for a terminal-fate branch. f. Spatial frames for the terminal branch across generated and observed stages. g. Terminal-branch lineage alluvial summary connecting axial, notochord and blood or vascular outcomes. h. Spatial-speed vector field and state-specific speed distribution for major terminal groups. i. Row-scaled enrichment heatmap for branch-associated developmental programmes. j. GO-term summaries for candidate gene sets captured by the selected branch analyses.",
    preview: "assets/figure4_preview.png",
    gif: "assets/gifs/figure4_zebrafish.gif",
    frames: { base: "assets/frames/figure4/frame_", count: 81, delayMs: 220, start: 10, end: 18, step: 0.1 },
    pdf: "assets/pdfs/figure4.pdf",
    alt: "Figure 4 zebrafish developmental dynamics preview",
    evidence: ["cross-system generation", "branch criticality", "terminal fate interpretation"],
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
    shortLabel: "axolotl brain",
    title: "Axolotl brain injury-response dynamics",
    dataset: "Axolotl brain",
    role: "Real dataset 3",
    body:
      "The axolotl brain injury-response dataset is used to show spatial alignment, generated slices, critical scores, EGC-family gene programs, and potential-associated expression trends.",
    legend:
      "Fig. 5: SpaPOT reconstructs axolotl brain injury-response dynamics. a. ARTISTA slices before and after alignment for injured axolotl brain, preserving the 2, 5, 10, 15 and 20 DPI injury stages. b. Observed real slices and generated slices across the injury-response trajectory, with cell-type colors and border styles separating real and generated time points. c. Warning-score curves for reaEGC and VLMC/CMPN-associated responses over DPI. d. Spatial maps of reaEGC and VLMC score changes at selected DPI, localizing the periods highlighted by panel c. e. Cell-count trajectories for EGC, proliferative and vascular-associated states across injury time. f. Differential-expression volcano plot comparing reaEGC and wntEGC. g. Marker-gene dot plot summarizing cell-type identity and expression programs across the selected states. h. Potential-ordered gene-expression curves for selected EGC/EX-associated genes.",
    preview: "assets/figure5_preview.png",
    gif: "assets/gifs/figure5_axolotl.gif",
    frames: { base: "assets/frames/figure5/frame_", count: 181, delayMs: 220, start: 2, end: 20, step: 0.1 },
    pdf: "assets/pdfs/figure5.pdf",
    alt: "Figure 5 axolotl brain injury-response dynamics preview",
    evidence: ["injury-response trajectory", "EGC-family programs", "potential-linked expression"],
    animation: [
      { label: "Temporal scale", value: "2 DPI to 20 DPI" },
      { label: "Animated view", value: "paper-model original style" },
      { label: "Frame step", value: "0.1 DPI" },
    ],
    timeLabel: "DPI timeline",
    timepoints: ["2 DPI", "5 DPI", "10 DPI", "15 DPI", "20 DPI"],
  },
  figure6: {
    kicker: "Figure 6",
    shortLabel: "model comparison",
    title: "Model comparison across datasets",
    dataset: "Cross-dataset benchmark",
    role: "Model comparison",
    body:
      "The model comparison summarizes how SpaPOT differs from other methods in prediction, alignment, temporal interpolation, and biological interpretability across datasets.",
    legend:
      "Fig. 6: SpaPOT comparison across datasets and methods. a. Capability matrix comparing SpaPOT with representative spatial alignment, spatial pseudotime, optimal-transport, reconstruction and perturbation-oriented methods across alignment, generative reconstruction, future-state inference, fate inference, mass dynamics, in silico perturbation and critical-window detection tasks. b. Qualitative reconstruction comparison on mouse dorsal midbrain and zebrafish stages, contrasting observed slices with outputs from baseline methods and SpaPOT. c. Quantitative comparison of state-level L1, spatial IoU and spatial Chamfer metrics, summarizing state composition, spatial overlap and geometry quality across benchmark settings.",
    preview: "assets/figure6_preview.png",
    gif: "",
    pdf: "assets/pdfs/figure6.pdf",
    alt: "Figure 6 model comparison placeholder",
    evidence: ["cross-dataset benchmark", "method comparison", "interpretability endpoint"],
    animation: [],
    timeLabel: "Benchmark axes",
    timepoints: ["Simulation", "Mouse", "Zebrafish", "Axolotl", "Ablation"],
  },
};

window.SpaPOT_MOTION_PANELS = {
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
