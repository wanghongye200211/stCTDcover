const figureData = window.stCTD_FIGURES || {};
const motionPanelData = window.stCTD_MOTION_PANELS || {};
const motionStats = window.stCTD_MOTION_STATS || window.SpaPOT_MOTION_STATS || {};
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
const resultLegend = document.querySelector("#result-legend");
const resultEvidence = document.querySelector("#result-evidence");
const resultAssets = document.querySelector("#result-assets");
const image = document.querySelector("#result-image");
const link = document.querySelector("#result-link");
const resultPanel = document.querySelector(".result-panel");
const resultFigureHashPrefix = "#result-";
const motionPlayerInstances = new WeakMap();
const visibleCellTypeLabels = new Map();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const uiIcons = {
  play: `
    <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.6v12.8L18.4 12 8 5.6Z" />
    </svg>
  `,
  pause: `
    <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5.5h3.8v13H7v-13Zm6.2 0H17v13h-3.8v-13Z" />
    </svg>
  `,
  reset: `
    <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.7 7.2A7 7 0 1 1 5 12h2.2a4.8 4.8 0 1 0 1.2-3.2L11 11.4H4.6V5l2.1 2.2Z" />
    </svg>
  `,
  simulation: `
    <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.2 15.8c2.8-6.8 6.8-6.8 9.6 0 1.1 2.7 2.2 3.6 3.8 3.6h.7v2h-.7c-2.7 0-4.4-1.6-5.8-4.8-2-4.9-3.6-4.9-5.6 0-1.4 3.2-3.1 4.8-5.8 4.8H.8v-2h.6c1.6 0 2.7-.9 3.8-3.6Z" />
      <path d="M4.8 3.6h3v3h-3v-3Zm5.6 4.6h3v3h-3v-3Zm5.8-4h3v3h-3v-3Z" />
    </svg>
  `,
  real: `
    <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.4c4.7 0 8.6 3.8 8.6 8.6s-3.9 8.6-8.6 8.6S3.4 16.7 3.4 12 7.3 3.4 12 3.4Zm0 2.1A6.5 6.5 0 1 0 18.5 12 6.5 6.5 0 0 0 12 5.5Z" />
      <path d="M10.2 8.2h3.6v2.6h2.6v3.6h-2.6V17h-3.6v-2.6H7.6v-3.6h2.6V8.2Z" />
    </svg>
  `,
};
const interactiveSurfaceSelector = [
  ".atlas-feature",
  ".atlas-card",
  ".intro-points div",
  ".model-figure",
  ".model-notes article",
  ".innovation-card",
  ".route-card",
  ".downstream-logic article",
  ".downstream-card",
  ".evidence-row",
  ".viz-column",
  ".real-viz-option",
  ".motion-player",
  ".tab-btn",
  ".result-panel",
  ".result-preview",
].join(",");

function renderIcon(name) {
  return uiIcons[name] || "";
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
const revealSelector = [
  ".hero-copy",
  ".hero-atlas",
  ".section-heading",
  ".intro-points div",
  ".model-figure",
  ".model-notes article",
  ".innovation-card",
  ".route-card",
  ".downstream-logic article",
  ".downstream-card",
  ".evidence-row",
  ".viz-column",
  ".result-browser",
  ".claim-grid",
].join(",");

function setupInteractiveSurfaces(scope = document) {
  scope.querySelectorAll(interactiveSurfaceSelector).forEach((surface) => {
    if (surface.dataset.interactionReady === "true") return;
    surface.dataset.interactionReady = "true";
    surface.classList.add("interactive-surface");

    surface.addEventListener("pointermove", (event) => {
      if (reduceMotion.matches) return;
      const rect = surface.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      surface.style.setProperty("--mx", `${x.toFixed(1)}%`);
      surface.style.setProperty("--my", `${y.toFixed(1)}%`);
    });

    surface.addEventListener("pointerleave", () => {
      surface.style.removeProperty("--mx");
      surface.style.removeProperty("--my");
    });
  });
}

function setupRevealEffects(scope = document) {
  const items = [...scope.querySelectorAll(revealSelector)].filter(
    (item) => item.dataset.revealReady !== "true",
  );
  if (!items.length) return;

  items.forEach((item) => {
    item.dataset.revealReady = "true";
    item.classList.add("will-reveal");
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );

  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94) {
      item.classList.add("is-visible");
      return;
    }
    observer.observe(item);
  });
}

function setupActiveNavigation() {
  const header = document.querySelector(".site-header");
  const links = [...document.querySelectorAll(".nav-links a")];
  const sections = links
    .map((link) => {
      const id = link.getAttribute("href")?.replace("#", "");
      return id ? { link, section: document.getElementById(id) } : null;
    })
    .filter((item) => item?.section);

  const updateHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  const setActiveLink = (activeSection) => {
    sections.forEach(({ link, section }) => {
      link.classList.toggle("is-active", section === activeSection);
    });
  };
  const updateActiveByScroll = () => {
    const offset = 130;
    const active =
      sections
        .map(({ section }) => section)
        .filter((section) => section.getBoundingClientRect().top <= offset)
        .pop() || sections[0]?.section;
    if (active) setActiveLink(active);
  };
  updateHeaderState();
  updateActiveByScroll();
  window.addEventListener(
    "scroll",
    () => {
      updateHeaderState();
      updateActiveByScroll();
    },
    { passive: true },
  );
  window.addEventListener("hashchange", () => window.setTimeout(updateActiveByScroll, 120));
  window.addEventListener("load", () => window.setTimeout(updateActiveByScroll, 120));

  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      setActiveLink(visible.target);
    },
    { rootMargin: "-24% 0px -58% 0px", threshold: [0.1, 0.35, 0.6] },
  );

  sections.forEach(({ section }) => observer.observe(section));
}

function scrollToHashTarget() {
  if (!window.location.hash) return;
  const resultFigureKey = getResultFigureFromHash();
  if (resultFigureKey) {
    setFigure(resultFigureKey, { updateUrl: false });
    document.querySelector("#results")?.scrollIntoView({ block: "start" });
    return;
  }

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

function getResultFigureFromHash() {
  const hash = window.location.hash || "";
  if (!hash.startsWith(resultFigureHashPrefix)) return "";
  const figureKey = decodeURIComponent(hash.slice(resultFigureHashPrefix.length));
  return figureData[figureKey] ? figureKey : "";
}

function updateResultFigureHash(figureKey) {
  if (!figureData[figureKey] || !window.history?.replaceState) return;
  const nextHash = `${resultFigureHashPrefix}${encodeURIComponent(figureKey)}`;
  if (window.location.hash === nextHash) return;
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}${nextHash}`);
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
          <div class="motion-stage" data-motion-stage aria-label="Drag to pan, scroll to zoom, double-click to reset">
            <div class="motion-viewport" data-motion-viewport>
              <img data-frame-image src="${firstFrame}" alt="${data.alt || `${data.kicker} animated trajectory frame`}" draggable="false" />
            </div>
            <span class="motion-view-hint">Scroll to zoom · drag to pan</span>
          </div>
          <div class="motion-controls">
            <button class="motion-control motion-play motion-icon-button" type="button" data-play aria-label="Play ${data.kicker} animation" title="Play">
              ${renderIcon("play")}
              <span class="visually-hidden">Play</span>
            </button>
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
            <button class="motion-control motion-reset motion-icon-button" type="button" data-reset-view aria-label="Reset ${data.kicker} view" title="Reset view">
              ${renderIcon("reset")}
              <span class="visually-hidden">Reset view</span>
            </button>
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
    this.viewScale = 1;
    this.viewX = 0;
    this.viewY = 0;
    this.dragState = null;
    this.stage = root.querySelector("[data-motion-stage]");
    this.viewport = root.querySelector("[data-motion-viewport]");
    this.image = root.querySelector("[data-frame-image]");
    this.range = root.querySelector("[data-range]");
    this.playButton = root.querySelector("[data-play]");
    this.speedButton = root.querySelector("[data-speed]");
    this.resetViewButton = root.querySelector("[data-reset-view]");
    this.counter = root.querySelector("[data-frame-counter]");
    this.label = root.querySelector("[data-frame-label]");

    this.playButton?.addEventListener("click", () => this.togglePlay());
    this.speedButton?.addEventListener("click", () => this.toggleSpeed());
    this.resetViewButton?.addEventListener("click", () => this.resetView());
    this.range?.addEventListener("input", (event) => {
      this.setFrame(Number(event.target.value));
      if (this.playing) this.scheduleNextFrame();
    });
    this.setupViewportInteractions();

    this.updatePlayButton();
    this.updateViewTransform();
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
    this.updatePlayButton();

    if (this.playing) {
      this.advanceFrame();
      this.scheduleNextFrame();
    } else {
      window.clearTimeout(this.timer);
    }
  }

  updatePlayButton() {
    if (!this.playButton) return;
    const action = this.playing ? "Pause" : "Play";
    this.playButton.innerHTML = `
      ${renderIcon(this.playing ? "pause" : "play")}
      <span class="visually-hidden">${action}</span>
    `;
    this.playButton.setAttribute("aria-label", `${action} ${this.data?.kicker || "trajectory"} animation`);
    this.playButton.title = action;
  }

  toggleSpeed() {
    this.speed = this.speed === 1 ? 2 : 1;
    if (this.speedButton) {
      this.speedButton.textContent = `${this.speed}x`;
      this.speedButton.classList.toggle("is-fast", this.speed !== 1);
    }
    if (this.playing) this.scheduleNextFrame();
  }

  setupViewportInteractions() {
    if (!this.stage || !this.viewport) return;

    this.stage.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const direction = event.deltaY > 0 ? -1 : 1;
        const nextScale = clampValue(this.viewScale * (direction > 0 ? 1.14 : 0.88), 1, 4);
        this.viewScale = Number(nextScale.toFixed(3));
        this.constrainPan();
        this.updateViewTransform();
      },
      { passive: false },
    );

    this.stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      this.dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        viewX: this.viewX,
        viewY: this.viewY,
      };
      this.stage.setPointerCapture?.(event.pointerId);
      this.stage.classList.add("is-dragging");
    });

    this.stage.addEventListener("pointermove", (event) => {
      if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;
      this.viewX = this.dragState.viewX + event.clientX - this.dragState.startX;
      this.viewY = this.dragState.viewY + event.clientY - this.dragState.startY;
      this.constrainPan();
      this.updateViewTransform();
    });

    const stopDragging = (event) => {
      if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;
      this.stage.releasePointerCapture?.(event.pointerId);
      this.stage.classList.remove("is-dragging");
      this.dragState = null;
    };

    this.stage.addEventListener("pointerup", stopDragging);
    this.stage.addEventListener("pointercancel", stopDragging);
    this.stage.addEventListener("dblclick", () => this.resetView());
  }

  constrainPan() {
    if (!this.stage || this.viewScale <= 1) {
      this.viewX = 0;
      this.viewY = 0;
      return;
    }

    const rect = this.stage.getBoundingClientRect();
    const maxX = (rect.width * (this.viewScale - 1)) / 2;
    const maxY = (rect.height * (this.viewScale - 1)) / 2;
    this.viewX = clampValue(this.viewX, -maxX, maxX);
    this.viewY = clampValue(this.viewY, -maxY, maxY);
  }

  updateViewTransform() {
    if (!this.viewport) return;
    this.viewport.style.setProperty("--motion-scale", String(this.viewScale));
    this.viewport.style.setProperty("--motion-pan-x", `${this.viewX.toFixed(1)}px`);
    this.viewport.style.setProperty("--motion-pan-y", `${this.viewY.toFixed(1)}px`);
    this.root.classList.toggle("is-zoomed", this.viewScale > 1.01);
  }

  resetView() {
    this.viewScale = 1;
    this.viewX = 0;
    this.viewY = 0;
    this.updateViewTransform();
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
          <span>${data.shortLabel}</span>
          <small>${data.title}</small>
        </button>
      `;
    })
    .join("");
}

function buildHeroAtlas() {
  if (!heroAtlas) return;
  const primaryKey = figureKeys.find((key) => key === "figure1") || figureKeys[0];
  const primary = figureData[primaryKey];
  const secondaryKeys = figureKeys.filter((key) => key !== primaryKey);
  if (!primary) return;

  heroAtlas.innerHTML = `
    <article
      class="atlas-feature active"
      data-figure="${primaryKey}"
      role="button"
      tabindex="0"
      aria-pressed="true"
      aria-label="Open ${primary.title}"
    >
      <div class="atlas-feature-media">
        <img src="${primary.preview}" alt="${primary.alt || primary.title}" />
      </div>
    </article>
    <div class="atlas-strip" aria-label="Other result previews">
      ${secondaryKeys
        .map((key) => {
          const data = figureData[key];
          return `
            <article
              class="atlas-card"
              data-figure="${key}"
              role="button"
              tabindex="0"
              aria-pressed="false"
              aria-label="Open ${data.title}"
            >
              <div class="atlas-media">
                <img src="${data.preview}" alt="${data.alt || data.title}" />
              </div>
              <div class="atlas-copy">
                <strong>${data.shortLabel}</strong>
                <small>${data.title}</small>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
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

function setFigure(figureKey, options = {}) {
  const { updateUrl = true } = options;
  const data = figureData[figureKey];
  if (!data) return;

  document.querySelectorAll(".tab-btn").forEach((tab) => {
    const isActive = tab.dataset.figure === figureKey;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".atlas-feature, .atlas-card, .evidence-row").forEach((item) => {
    const isActive = item.dataset.figure === figureKey;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  kicker.textContent = data.shortLabel;
  title.textContent = data.title;
  body.textContent = data.body;
  if (resultLegend) {
    resultLegend.innerHTML = data.legend
      ? `<p class="time-label">Figure legend</p><p>${data.legend}</p>`
      : "";
  }
  resultEvidence.innerHTML = buildEvidenceMeta(data);
  resultAssets.innerHTML = buildAssetMeta(data);
  if (resultPanel) resultPanel.dataset.activeFigure = figureKey;
  image.src = data.preview;
  image.alt = data.alt || `${data.kicker} preview`;

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

  if (updateUrl) updateResultFigureHash(figureKey);
}

function chooseFigure(figureKey, options = {}) {
  setFigure(figureKey, { updateUrl: options.updateUrl !== false });

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
    { key: "simulation", label: "Simulation", caption: "Synthetic", icon: "simulation" },
    { key: "real", label: "Real datasets", caption: "Biological", icon: "real" },
  ];

  return `
    <div class="viz-mode-shell">
      <span class="viz-mode-label">View mode</span>
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
                <span class="viz-mode-icon">${renderIcon(mode.icon)}</span>
                <span class="viz-mode-text">
                  <strong>${mode.label}</strong>
                  <small>${mode.caption}</small>
                </span>
              </button>
            `;
          })
          .join("")}
      </div>
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
        <div class="viz-control-panel">
          <div class="viz-heading-block">
            <span class="viz-section-label">Simulation</span>
            <div>
              <h3 data-simulation-viz-title>${activeData.title}</h3>
              <p>Switch between synthetic trajectories and inspect frame-by-frame spatial motion.</p>
            </div>
          </div>
          ${buildVizModeToggle()}
        </div>
        <div class="viz-option-bar">
          <span class="viz-option-label">Synthetic tracks</span>
          <div class="real-viz-options" role="tablist" aria-label="Simulation trajectory selector">
            ${buildMotionOptions(simulationMotionKeys, activeSimulationKey, "data-simulation-figure")}
          </div>
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
        <div class="viz-control-panel">
          <div class="viz-heading-block">
            <span class="viz-section-label">Real datasets</span>
            <div>
              <h3 data-real-viz-title>${activeRealData.title}</h3>
              <p>Switch between biological systems while keeping the same playback, zoom and timeline controls.</p>
            </div>
          </div>
          ${buildVizModeToggle()}
        </div>
        <div class="viz-option-bar">
          <span class="viz-option-label">Biological systems</span>
          <div class="real-viz-options" role="tablist" aria-label="Real dataset trajectory selector">
            ${buildMotionOptions(realFigureKeys, activeRealFigureKey, "data-real-figure")}
          </div>
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
  setupInteractiveSurfaces(gifGrid);
  setupRevealEffects(gifGrid);
}

buildHeroAtlas();
buildTabs();
buildEvidenceTable();
buildGifGrid();
setFigure(getResultFigureFromHash() || figureKeys[0] || "figure1", {
  updateUrl: Boolean(getResultFigureFromHash()),
});
setupInteractiveSurfaces(document);
setupRevealEffects(document);
setupActiveNavigation();

tabsContainer?.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab-btn");
  if (tab) setFigure(tab.dataset.figure);
});

link?.addEventListener("click", (event) => {
  if (link.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
    return;
  }
  const activeTab = document.querySelector(".tab-btn.active");
  const figureKey = activeTab?.dataset.figure;
  if (figureKey) updateResultFigureHash(figureKey);
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
