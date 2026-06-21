const figureData = window.SpaPOT_FIGURES || {};
const motionPanelData = window.SpaPOT_MOTION_PANELS || {};
const motionStats = window.SpaPOT_MOTION_STATS || {};
const motionData = { ...figureData, ...motionPanelData };
const figureKeys = Object.keys(figureData);
const simulationMotionKeys = ["simPitchfork", "simHeart2Duck"].filter((key) => motionData[key]);
const realFigureKeys = ["figure3", "figure4", "figure5"].filter((key) => figureData[key]);
let activeVizMode = "simulation";
let activeSimulationKey = simulationMotionKeys[0] || "";
let activeRealFigureKey = realFigureKeys[0] || "";

const heroAtlas = document.querySelector("#hero-atlas");
const tabsContainer = document.querySelector("#result-tabs");
const evidenceTable = document.querySelector("#evidence-table");
const gifGrid = document.querySelector("#gif-grid");
const kicker = document.querySelector("#result-kicker");
const title = document.querySelector("#result-title");
const body = document.querySelector("#result-body");
const resultEvidence = document.querySelector("#result-evidence");
const resultAssets = document.querySelector("#result-assets");
const resultAnimation = document.querySelector("#result-animation");
const image = document.querySelector("#result-image");
const resultMotion = document.querySelector("#result-motion");
const link = document.querySelector("#result-link");
const gifLink = document.querySelector("#result-gif-link");
const timepoints = document.querySelector("#result-timepoints");
const motionPlayerInstances = new WeakMap();
const visibleCellTypeLabels = new Map();

function scrollToHashTarget() {
  if (!window.location.hash) return;
  const motionKey = window.location.hash.replace("#gif-", "");
  if (simulationMotionKeys.includes(motionKey)) {
    selectVizMode("simulation");
    selectSimulationFigure(motionKey);
  }
  if (realFigureKeys.includes(motionKey)) {
    selectVizMode("real");
    selectRealFigure(motionKey);
  }

  const target = document.querySelector(window.location.hash);
  if (target) target.scrollIntoView({ block: "start" });
}

function getFrameIndexForTimepoint(data, point, pointIndex) {
  const frames = data.frames || {};
  const totalFrames = Math.max(1, Number(frames.count) || 1);
  if (totalFrames <= 1) return 0;

  const numericValue = Number(String(point).match(/-?\d+(?:\.\d+)?/)?.[0]);
  if (Number.isFinite(numericValue) && Number.isFinite(frames.start) && Number.isFinite(frames.end)) {
    const progress = (numericValue - Number(frames.start)) / Math.max(Number(frames.end) - Number(frames.start), 1e-9);
    return Math.max(0, Math.min(totalFrames - 1, Math.round(progress * (totalFrames - 1))));
  }

  const labels = data.timepoints || [];
  if (labels.length <= 1) return 0;
  return Math.round((pointIndex / (labels.length - 1)) * (totalFrames - 1));
}

function buildTimeMeta(data, figureKey = "") {
  const points = data.timepoints || [];
  if (!points.length) return "";
  const interactive = Boolean(figureKey && hasInteractiveFrames(data));

  return `
    <p class="time-label">${data.timeLabel || "Time axis"}</p>
    <div class="time-chips">
      ${points
        .map((point, index) => {
          if (!interactive) return `<span>${point}</span>`;
          const frameIndex = getFrameIndexForTimepoint(data, point, index);
          return `
            <button
              class="time-chip-button"
              type="button"
              data-time-control-for="${figureKey}"
              data-frame-jump="${frameIndex}"
              aria-pressed="false"
            >
              ${point}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildEvidenceMeta(data) {
  const evidence = data.evidence || [];
  if (!evidence.length) return "";

  return `
    <p class="time-label">Evidence focus</p>
    <div class="panel-chips">
      ${evidence.map((item) => `<span>${item}</span>`).join("")}
    </div>
  `;
}

function buildAssetMeta(data) {
  const assets = [
    { label: "Preview", available: Boolean(data.preview) },
    { label: "PDF", available: Boolean(data.pdf) },
    { label: "GIF", available: Boolean(data.gif) },
    { label: "Frames", available: hasInteractiveFrames(data) },
  ];

  return `
    <p class="time-label">Asset status</p>
    <div class="asset-pills">
      ${assets
        .map(
          (asset) =>
            `<span class="${asset.available ? "is-ready" : "is-pending"}">${asset.label}</span>`,
        )
        .join("")}
    </div>
  `;
}

function buildAnimationMeta(data) {
  const animation = data.animation || [];
  if (!animation.length) return "";

  return `
    <p class="time-label">Animation metadata</p>
    <div class="animation-meta">
      ${animation
        .map(
          (item) => `
            <span>
              <strong>${item.label}</strong>
              <em>${item.value}</em>
            </span>
          `,
        )
        .join("")}
    </div>
  `;
}

function hasInteractiveFrames(data) {
  return Boolean(data.frames?.base && data.frames?.count > 1);
}

function getFrameSource(data, frameIndex) {
  const frames = data.frames;
  if (!frames) return data.gif || data.preview || "";
  const pad = frames.pad || 3;
  const extension = frames.extension || "png";
  return `${frames.base}${String(frameIndex).padStart(pad, "0")}.${extension}`;
}

function getFrameLabel(data, frameIndex) {
  const frames = data.frames || {};
  const totalFrames = Math.max(1, Number(frames.count) || 1);
  const labels = data.timepoints || [];
  if (!labels.length) return `Frame ${frameIndex + 1}`;

  if (Number.isFinite(frames.start) && Number.isFinite(frames.end)) {
    const progress = totalFrames === 1 ? 0 : frameIndex / (totalFrames - 1);
    const value = Number(frames.start) + progress * (Number(frames.end) - Number(frames.start));
    const nearest = labels.reduce(
      (best, label, index) => {
        const numericValue = Number(String(label).match(/-?\d+(?:\.\d+)?/)?.[0]);
        if (!Number.isFinite(numericValue)) return best;
        const distance = Math.abs(numericValue - value);
        return distance < best.distance ? { index, distance } : best;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    );
    if (Number.isFinite(nearest.distance)) return labels[nearest.index];
  }

  const labelIndex =
    totalFrames === 1 ? 0 : Math.round((frameIndex / (totalFrames - 1)) * (labels.length - 1));
  return labels[Math.max(0, Math.min(labels.length - 1, labelIndex))];
}

function getStatsFrame(figureKey, frameIndex) {
  const stats = motionStats[figureKey];
  if (!stats?.frames?.length) return null;
  const frames = stats.frames;
  const index = Math.max(0, Math.min(frames.length - 1, Math.round(frameIndex)));
  return frames[index];
}

function getCellTypeRows(figureKey, frameIndex) {
  const stats = motionStats[figureKey];
  if (!stats) return [];
  const frame = getStatsFrame(figureKey, frameIndex);
  const counts = frame?.counts || {};
  return getVisibleCellTypePalette(figureKey).map((item) => ({
    label: item.label,
    color: item.color || "#64748b",
    count: Number.isFinite(Number(counts[item.label])) ? Number(counts[item.label]) : null,
  }));
}

function getVisibleCellTypePalette(figureKey) {
  const stats = motionStats[figureKey];
  if (!stats) return [];
  if (!visibleCellTypeLabels.has(figureKey)) {
    const labels = new Set(
      (stats.palette || [])
        .filter((item) =>
          (stats.frames || []).some((frame) => Number(frame?.counts?.[item.label] || 0) > 0),
        )
        .map((item) => item.label),
    );
    visibleCellTypeLabels.set(figureKey, labels);
  }
  const labels = visibleCellTypeLabels.get(figureKey);
  return (stats.palette || []).filter((item) => labels.has(item.label));
}

function buildCellTypeRows(figureKey, frameIndex) {
  const rows = getCellTypeRows(figureKey, frameIndex);
  if (!rows.length) {
    return `<p class="celltype-empty">Cell-type statistics pending.</p>`;
  }
  const maxCount = Math.max(1, ...rows.map((row) => row.count || 0));
  return rows
    .map((row) => {
      const width = row.count === null || row.count <= 0 ? 0 : Math.max(5, Math.round((row.count / maxCount) * 100));
      return `
        <div class="celltype-row">
          <span class="celltype-swatch" style="--celltype-color: ${row.color}"></span>
          <span class="celltype-name">${row.label}</span>
          <strong class="celltype-count">${row.count === null ? "—" : row.count.toLocaleString()}</strong>
          <span class="celltype-bar" aria-hidden="true">
            <span style="width: ${width}%; background: ${row.color}"></span>
          </span>
        </div>
      `;
    })
    .join("");
}

function buildCellTypePanel(figureKey, frameIndex = 0) {
  const stats = motionStats[figureKey];
  if (!stats) return "";
  const frame = getStatsFrame(figureKey, frameIndex);
  const total = Number.isFinite(Number(frame?.total)) ? Number(frame.total).toLocaleString() : "—";
  return `
    <aside class="celltype-panel" data-celltype-panel aria-label="${stats.title || "Cell types"}">
      <div class="celltype-head">
        <span>${stats.title || "Cell types"}</span>
        <strong data-celltype-total>n = ${total}</strong>
      </div>
      <p data-celltype-caption>${stats.countLabel || "current frame"}</p>
      <div class="celltype-list" data-celltype-list>
        ${buildCellTypeRows(figureKey, frameIndex)}
      </div>
    </aside>
  `;
}

function updateCellTypePanel(root, figureKey, frameIndex) {
  const stats = motionStats[figureKey];
  const panel = root.querySelector("[data-celltype-panel]");
  if (!stats || !panel) return;
  const frame = getStatsFrame(figureKey, frameIndex);
  const total = Number.isFinite(Number(frame?.total)) ? Number(frame.total).toLocaleString() : "—";
  const totalNode = panel.querySelector("[data-celltype-total]");
  const listNode = panel.querySelector("[data-celltype-list]");
  if (totalNode) totalNode.textContent = `n = ${total}`;
  if (listNode) listNode.innerHTML = buildCellTypeRows(figureKey, frameIndex);
}

function buildMotionPreview(data, figureKey) {
  if (!data.gif && !hasInteractiveFrames(data)) return "";

  if (!hasInteractiveFrames(data)) {
    return `
      <div class="motion-header">
        <span>Motion preview</span>
        <strong>${data.timeLabel || "Animated trajectory"}</strong>
      </div>
      <div class="motion-content-grid">
        <div class="motion-main">
          <img src="${data.gif}" alt="${data.alt || `${data.kicker} animated trajectory`}" />
        </div>
        ${buildCellTypePanel(figureKey)}
      </div>
    `;
  }

  const frameCount = data.frames.count;
  const firstFrame = getFrameSource(data, 0);
  const firstLabel = getFrameLabel(data, 0);

  return `
    <div
      class="motion-player"
      data-motion-player
      data-figure="${figureKey}"
      data-frame-count="${frameCount}"
      data-delay-ms="${data.frames.delayMs || 120}"
    >
      <div class="motion-header">
        <span>Interactive motion</span>
        <strong>${data.timeLabel || "Animated trajectory"}</strong>
      </div>
      <div class="motion-content-grid">
        <div class="motion-main">
          <div class="motion-stage">
            <img data-frame-image src="${firstFrame}" alt="${data.alt || `${data.kicker} animated trajectory frame`}" />
          </div>
          <div class="motion-controls">
            <button class="motion-control motion-play" type="button" data-play aria-label="Play ${data.kicker} animation">Play</button>
            <input
              class="motion-range"
              type="range"
              min="0"
              max="${frameCount - 1}"
              step="1"
              value="0"
              data-range
              aria-label="${data.kicker} animation frame"
            />
            <button class="motion-control motion-speed" type="button" data-speed aria-label="Toggle ${data.kicker} animation speed">1x</button>
          </div>
          <div class="motion-status" aria-live="polite">
            <span data-frame-counter>Frame 1/${frameCount}</span>
            <strong data-frame-label>${firstLabel}</strong>
          </div>
          ${
            data.gif
              ? `<a class="motion-raw-link" href="${data.gif}" aria-label="Open original ${data.kicker} GIF">Open original GIF</a>`
              : ""
          }
        </div>
        ${buildCellTypePanel(figureKey)}
      </div>
    </div>
  `;
}

class MotionFramePlayer {
  constructor(root) {
    this.root = root;
    this.figureKey = root.dataset.figure;
    this.data = motionData[this.figureKey];
    this.frameCount = Number(root.dataset.frameCount) || this.data?.frames?.count || 1;
    this.delayMs = Number(root.dataset.delayMs) || this.data?.frames?.delayMs || 120;
    this.frameIndex = 0;
    this.speed = 1;
    this.playing = false;
    this.timer = null;
    this.preloadedFrames = new Map();
    this.image = root.querySelector("[data-frame-image]");
    this.range = root.querySelector("[data-range]");
    this.playButton = root.querySelector("[data-play]");
    this.speedButton = root.querySelector("[data-speed]");
    this.counter = root.querySelector("[data-frame-counter]");
    this.label = root.querySelector("[data-frame-label]");

    this.playButton?.addEventListener("click", () => this.togglePlay());
    this.speedButton?.addEventListener("click", () => this.toggleSpeed());
    this.range?.addEventListener("input", (event) => {
      this.setFrame(Number(event.target.value));
      if (this.playing) this.scheduleNextFrame();
    });

    this.setFrame(0);
  }

  setFrame(index) {
    if (!this.data) return;
    const nextIndex = Math.max(0, Math.min(this.frameCount - 1, Math.round(index)));
    this.frameIndex = nextIndex;

    if (this.image) this.image.src = getFrameSource(this.data, this.frameIndex);
    if (this.range) this.range.value = String(this.frameIndex);
    if (this.counter) this.counter.textContent = `Frame ${this.frameIndex + 1}/${this.frameCount}`;
    if (this.label) this.label.textContent = getFrameLabel(this.data, this.frameIndex);
    updateCellTypePanel(this.root, this.figureKey, this.frameIndex);
    this.updateLinkedTimeButtons();
    this.preloadAhead();
  }

  advanceFrame() {
    this.setFrame((this.frameIndex + 1) % this.frameCount);
  }

  preloadAhead(count = 8) {
    if (!this.data) return;
    for (let offset = 1; offset <= count; offset += 1) {
      const index = (this.frameIndex + offset) % this.frameCount;
      const source = getFrameSource(this.data, index);
      if (this.preloadedFrames.has(source)) continue;
      const image = new Image();
      image.src = source;
      this.preloadedFrames.set(source, image);
    }
  }

  updateLinkedTimeButtons() {
    document.querySelectorAll(`[data-time-control-for="${this.figureKey}"]`).forEach((button) => {
      const targetFrame = Number(button.dataset.frameJump);
      const isActive = Number.isFinite(targetFrame) && targetFrame === this.frameIndex;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  scheduleNextFrame() {
    window.clearTimeout(this.timer);
    if (!this.playing) return;

    this.timer = window.setTimeout(() => {
      this.advanceFrame();
      this.scheduleNextFrame();
    }, this.delayMs / this.speed);
  }

  togglePlay() {
    this.playing = !this.playing;
    this.root.classList.toggle("is-playing", this.playing);
    if (this.playButton) this.playButton.textContent = this.playing ? "Pause" : "Play";

    if (this.playing) {
      this.advanceFrame();
      this.scheduleNextFrame();
    } else {
      window.clearTimeout(this.timer);
    }
  }

  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : 1;
    if (this.speedButton) {
      this.speedButton.textContent = `${this.speed}x`;
      this.speedButton.classList.toggle("is-fast", this.speed !== 1);
    }
    if (this.playing) this.scheduleNextFrame();
  }

  destroy() {
    this.playing = false;
    window.clearTimeout(this.timer);
  }
}

function hydrateMotionPlayers(scope = document) {
  scope.querySelectorAll("[data-motion-player]").forEach((root) => {
    if (!motionPlayerInstances.has(root)) {
      motionPlayerInstances.set(root, new MotionFramePlayer(root));
    }
  });
}

function stopMotionPlayers(scope = document) {
  scope.querySelectorAll("[data-motion-player]").forEach((root) => {
    const instance = motionPlayerInstances.get(root);
    if (!instance) return;
    instance.destroy();
    motionPlayerInstances.delete(root);
  });
}

function jumpMotionPlayers(figureKey, frameIndex) {
  document.querySelectorAll(`[data-motion-player][data-figure="${figureKey}"]`).forEach((root) => {
    const instance = motionPlayerInstances.get(root);
    if (!instance) return;
    instance.setFrame(frameIndex);
    if (instance.playing) instance.scheduleNextFrame();
  });
}

function bindTimeJumpControls(scope = document) {
  scope.querySelectorAll("[data-frame-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      jumpMotionPlayers(button.dataset.timeControlFor, Number(button.dataset.frameJump));
    });
  });
}

function buildTabs() {
  if (!tabsContainer) return;

  tabsContainer.innerHTML = figureKeys
    .map((key, index) => {
      const data = figureData[key];
      return `
        <button class="tab-btn ${index === 0 ? "active" : ""}" type="button" role="tab" aria-selected="${index === 0}" data-figure="${key}">
          <span>${data.kicker}</span>
          <small>${data.shortLabel}</small>
        </button>
      `;
    })
    .join("");
}

function buildHeroAtlas() {
  if (!heroAtlas) return;

  heroAtlas.innerHTML = figureKeys
    .map((key, index) => {
      const data = figureData[key];
      return `
        <article
          class="atlas-card ${index === 0 ? "atlas-card-large" : ""}"
          data-figure="${key}"
          role="button"
          tabindex="0"
          aria-pressed="${index === 0}"
          aria-label="Open ${data.kicker}: ${data.shortLabel}"
        >
          <div class="atlas-media">
            <img src="${data.preview}" alt="${data.alt || data.title}" />
          </div>
          <div class="atlas-copy">
            <span>${data.kicker}</span>
            <strong>${data.shortLabel}</strong>
          </div>
        </article>
      `;
    })
    .join("");
}

function buildEvidenceTable() {
  if (!evidenceTable) return;

  evidenceTable.innerHTML = figureKeys
    .map((key) => {
      const data = figureData[key];
      const evidence = data.evidence || [];
      const assetLabels = [
        data.preview ? "Preview" : "",
        data.pdf ? "PDF" : "",
        data.gif ? "GIF" : "",
        hasInteractiveFrames(data) ? "Frames" : "",
      ].filter(Boolean);

      return `
        <article
          class="evidence-row"
          data-figure="${key}"
          role="button"
          tabindex="0"
          aria-pressed="false"
          aria-label="Open ${data.kicker}: ${data.title}"
        >
          <div class="evidence-id">
            <span>${data.kicker}</span>
            <strong>${data.shortLabel}</strong>
          </div>
          <div class="evidence-main">
            <h3>${data.title}</h3>
            <p>${data.dataset} · ${data.role}</p>
          </div>
          <div class="evidence-tags" aria-label="${data.kicker} evidence">
            ${evidence.map((item) => `<span>${item}</span>`).join("")}
          </div>
          <div class="asset-status" aria-label="${data.kicker} available assets">
            ${assetLabels.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function setFigure(figureKey) {
  const data = figureData[figureKey];
  if (!data) return;

  document.querySelectorAll(".tab-btn").forEach((tab) => {
    const isActive = tab.dataset.figure === figureKey;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".atlas-card, .evidence-row").forEach((item) => {
    const isActive = item.dataset.figure === figureKey;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  kicker.textContent = `${data.kicker} · ${data.role}`;
  title.textContent = data.title;
  body.textContent = data.body;
  resultEvidence.innerHTML = buildEvidenceMeta(data);
  resultAssets.innerHTML = buildAssetMeta(data);
  resultAnimation.innerHTML = buildAnimationMeta(data);
  image.src = data.preview;
  image.alt = data.alt || `${data.kicker} preview`;
  stopMotionPlayers(resultMotion);
  resultMotion.innerHTML = buildMotionPreview(data, figureKey);
  resultMotion.hidden = !data.gif && !hasInteractiveFrames(data);
  timepoints.innerHTML = buildTimeMeta(data, figureKey);
  hydrateMotionPlayers(resultMotion);
  bindTimeJumpControls(timepoints);

  if (data.pdf) {
    link.href = data.pdf;
    link.textContent = "Open PDF";
    link.removeAttribute("aria-disabled");
    link.classList.remove("is-disabled");
  } else {
    link.href = "#results";
    link.textContent = "PDF pending";
    link.setAttribute("aria-disabled", "true");
    link.classList.add("is-disabled");
  }

  if (data.gif) {
    const gifTarget = figureKey === "figure2" ? "simPitchfork" : figureKey;
    gifLink.href = `#gif-${gifTarget}`;
    gifLink.textContent = "View GIF";
    gifLink.removeAttribute("aria-disabled");
    gifLink.classList.remove("is-disabled");
  } else {
    gifLink.href = "#dynamic";
    gifLink.textContent = "GIF pending";
    gifLink.setAttribute("aria-disabled", "true");
    gifLink.classList.add("is-disabled");
  }
}

function chooseFigure(figureKey, options = {}) {
  setFigure(figureKey);

  if (options.scrollToResults) {
    const target = document.querySelector("#results");
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 82;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

function bindFigurePicker(container) {
  if (!container) return;

  container.addEventListener("click", (event) => {
    const item = event.target.closest("[data-figure]");
    if (item) chooseFigure(item.dataset.figure, { scrollToResults: true });
  });

  container.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const item = event.target.closest("[data-figure]");
    if (!item) return;
    event.preventDefault();
    chooseFigure(item.dataset.figure, { scrollToResults: true });
  });
}

function buildVizBody(data) {
  return `
    <div class="gif-body viz-body">
      <p class="route-index">${data.kicker}</p>
      <h3>${data.title}</h3>
      <p>${data.dataset} · ${data.role}</p>
      ${buildAnimationMeta(data)}
      <div class="time-meta">${buildTimeMeta(data, data.key || "")}</div>
    </div>
  `;
}

function buildVizModeToggle() {
  const modes = [
    { key: "simulation", label: "Simulation" },
    { key: "real", label: "Real datasets" },
  ];

  return `
    <div class="viz-mode-toggle" role="tablist" aria-label="Trajectory visualization mode">
      ${modes
        .map((mode) => {
          const isActive = activeVizMode === mode.key;
          return `
            <button
              class="viz-mode-button ${isActive ? "active" : ""}"
              type="button"
              role="tab"
              aria-selected="${isActive}"
              data-viz-mode="${mode.key}"
            >
              ${mode.label}
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function buildMotionOptions(keys, activeKey, dataAttr) {
  return keys
    .map((key) => {
      const data = motionData[key];
      const isActive = key === activeKey;
      return `
        <button
          class="real-viz-option ${isActive ? "active" : ""}"
          id="gif-${key}"
          type="button"
          role="tab"
          aria-selected="${isActive}"
          aria-controls="real-viz-detail"
          ${dataAttr}="${key}"
        >
          <span>${data.kicker}</span>
          <strong>${data.shortLabel}</strong>
        </button>
      `;
    })
    .join("");
}

function buildMotionDetailContent(figureKey) {
  const data = motionData[figureKey];
  if (!data) return "";

  return `
    <div class="gif-media real-viz-media">${buildMotionPreview(data, figureKey)}</div>
    ${buildVizBody({ ...data, key: figureKey })}
  `;
}

function selectSimulationFigure(figureKey) {
  if (!gifGrid || !simulationMotionKeys.includes(figureKey)) return;
  activeSimulationKey = figureKey;

  gifGrid.querySelectorAll("[data-simulation-figure]").forEach((button) => {
    const isActive = button.dataset.simulationFigure === figureKey;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const detail = gifGrid.querySelector("[data-simulation-detail]");
  const title = gifGrid.querySelector("[data-simulation-viz-title]");
  if (title) title.textContent = motionData[figureKey].title;

  if (!detail) return;
  stopMotionPlayers(detail);
  detail.innerHTML = buildMotionDetailContent(figureKey);
  hydrateMotionPlayers(detail);
  bindTimeJumpControls(detail);
}

function selectRealFigure(figureKey) {
  if (!gifGrid || !realFigureKeys.includes(figureKey)) return;
  activeRealFigureKey = figureKey;

  gifGrid.querySelectorAll("[data-real-figure]").forEach((button) => {
    const isActive = button.dataset.realFigure === figureKey;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  const detail = gifGrid.querySelector("[data-real-detail]");
  const realTitle = gifGrid.querySelector("[data-real-viz-title]");
  if (realTitle) realTitle.textContent = motionData[figureKey].title;

  if (!detail) return;
  stopMotionPlayers(detail);
  detail.innerHTML = buildMotionDetailContent(figureKey);
  hydrateMotionPlayers(detail);
  bindTimeJumpControls(detail);
}

function selectVizMode(mode) {
  if (!gifGrid || !["simulation", "real"].includes(mode)) return;
  activeVizMode = mode;
  buildGifGrid();
}

function buildSimulationViz() {
  const activeData = motionData[activeSimulationKey];
  return `
    <article class="viz-column simulation-viz">
      <div class="viz-section-header">
        <div class="viz-title-row">
          <div>
            <span>Simulation</span>
            <h3 data-simulation-viz-title>${activeData.title}</h3>
            <p>Select one synthetic trajectory for the interactive motion panel.</p>
          </div>
          ${buildVizModeToggle()}
        </div>
        <div class="real-viz-options" role="tablist" aria-label="Simulation trajectory selector">
          ${buildMotionOptions(simulationMotionKeys, activeSimulationKey, "data-simulation-figure")}
        </div>
      </div>
      <div class="real-viz-detail" id="simulation-viz-detail" data-simulation-detail aria-live="polite">
        ${buildMotionDetailContent(activeSimulationKey)}
      </div>
    </article>
  `;
}

function buildRealViz() {
  const activeRealData = motionData[activeRealFigureKey];
  return `
    <article class="viz-column real-viz">
      <div class="viz-section-header">
        <div class="viz-title-row">
          <div>
            <span>Real datasets</span>
            <h3 data-real-viz-title>${activeRealData.title}</h3>
            <p>Select one biological system for the same trajectory player.</p>
          </div>
          ${buildVizModeToggle()}
        </div>
        <div class="real-viz-options" role="tablist" aria-label="Real dataset trajectory selector">
          ${buildMotionOptions(realFigureKeys, activeRealFigureKey, "data-real-figure")}
        </div>
      </div>
      <div class="real-viz-detail" id="real-viz-detail" data-real-detail aria-live="polite">
        ${buildMotionDetailContent(activeRealFigureKey)}
      </div>
    </article>
  `;
}

function buildGifGrid() {
  if (!gifGrid) return;

  stopMotionPlayers(gifGrid);

  gifGrid.innerHTML = `
    ${activeVizMode === "simulation" ? buildSimulationViz() : buildRealViz()}
  `;

  gifGrid.querySelectorAll("[data-viz-mode]").forEach((button) => {
    button.addEventListener("click", () => selectVizMode(button.dataset.vizMode));
  });
  gifGrid.querySelectorAll("[data-simulation-figure]").forEach((button) => {
    button.addEventListener("click", () => selectSimulationFigure(button.dataset.simulationFigure));
  });
  gifGrid.querySelectorAll("[data-real-figure]").forEach((button) => {
    button.addEventListener("click", () => selectRealFigure(button.dataset.realFigure));
  });
  hydrateMotionPlayers(gifGrid);
  bindTimeJumpControls(gifGrid);
}

buildHeroAtlas();
buildTabs();
buildEvidenceTable();
buildGifGrid();
setFigure(figureKeys[0] || "figure1");

tabsContainer?.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab-btn");
  if (tab) setFigure(tab.dataset.figure);
});

bindFigurePicker(heroAtlas);
bindFigurePicker(evidenceTable);

window.addEventListener("load", () => {
  window.setTimeout(scrollToHashTarget, 80);
});

window.addEventListener("hashchange", () => {
  window.setTimeout(scrollToHashTarget, 0);
});

window.addEventListener("beforeunload", () => {
  stopMotionPlayers(document);
});
