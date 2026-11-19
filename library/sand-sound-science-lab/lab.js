/* Lab — the control panel moves the plate directly: shape · rain · frequency (250~2600Hz log) · attach resonance · mode (m,n,sign) · strength γ · noise · sprinkle · strike */
(() => {
  const { plate, sound } = window.clShared;
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const logLerp = (t) => Math.exp(Math.log(250) + (Math.log(2600) - Math.log(250)) * t);
  const invLog = (hz) => (Math.log(hz) - Math.log(250)) / (Math.log(2600) - Math.log(250));
  const fill = (el) => el.style.setProperty("--fill", `${((el.value - el.min) / (el.max - el.min)) * 100}%`);
  const place = () => plate && (innerWidth >= 1024 ? plate.setRegion((innerWidth - 24 * 16 - 64) / 2 / innerWidth, 0.5, 1.05) : plate.setRegion(0.5, 0.42, 0.95));
  let drive = "freq", hz = 1117;
  const readout = () => {
    const nearest = [...document.querySelectorAll("[data-hz]")].length && [...document.querySelectorAll(".cl-chip")].map((c) => +c.dataset.hz).reduce((a, b) => (Math.abs(b - hz) < Math.abs(a - hz) ? b : a), 250);
    const near = Math.abs(nearest - hz) / hz < 0.02;
    const t = drive === "freq" ? `${fmt(hz)} Hz` : `m ${$("[data-m]").value} · n ${$("[data-n]").value}`;
    $("[data-readout-hz]").textContent = t;
    $("[data-panel-now]").textContent = t;
    $("[data-readout-detail]").textContent = drive === "freq" ? `Pull to center (0.00, 0.00) · ${near ? "Close to resonance" : "Between Resonances"}` : `${$("[data-sign] .is-active").textContent} · Unique mode`;
  };
  const setHz = (v, fromChip) => {
    hz = v;
    $("[data-hz-out]").textContent = `${fmt(v)} Hz`;
    const s = $("[data-hz]"); if (!fromChip) {} else s.value = invLog(v).toFixed(3); fill(s);
    document.querySelectorAll(".cl-chip").forEach((c) => c.classList.toggle("is-active", Math.abs(+c.dataset.hz - v) < 1));
    if (plate && drive === "freq") plate.setFrequency(v);
    sound && sound.tune(v);
    readout();
  };
  const setMode = () => {
    const m = +$("[data-m]").value, n = +$("[data-n]").value, sign = +$("[data-sign] .is-active").dataset.v;
    $("[data-mn-out]").textContent = `${m} · ${n}`;
    if (plate && drive === "mode") plate.setMode({ kind: "rect", m, n, sign }, 0.9);
    readout();
  };
  const seg = (sel, fn) => document.querySelectorAll(`${sel} .cl-seg-opt`).forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(`${sel} .cl-seg-opt`).forEach((o) => o.classList.toggle("is-active", o === b));
    fn(b.dataset.v);
  }));
  seg("[data-shape]", (v) => { plate && plate.setShape(v); if (v === "disc" && plate) plate.setMode({ kind: "disc", n: 2, s: 1 }); else if (drive === "freq") setHz(hz); else setMode(); });
  seg("[data-drive]", (v) => {
    drive = v;
    document.querySelectorAll("[data-freq-box]").forEach((b) => (b.hidden = v !== "freq"));
    document.querySelectorAll("[data-mode-box]").forEach((b) => (b.hidden = v !== "mode"));
    v === "freq" ? setHz(hz) : setMode();
  });
  seg("[data-sign]", setMode);
  $("[data-hz]").addEventListener("input", (e) => { fill(e.target); setHz(logLerp(+e.target.value)); });
  document.querySelectorAll(".cl-chip").forEach((c) => c.addEventListener("click", () => setHz(+c.dataset.hz, true)));
  ["[data-m]", "[data-n]"].forEach((s) => $(s).addEventListener("input", (e) => { fill(e.target); setMode(); }));
  $("[data-aspect]").addEventListener("input", (e) => { fill(e.target); $("[data-aspect-out]").textContent = (+e.target.value).toFixed(2); if (plate) plate.aspect = +e.target.value; });
  $("[data-gamma]").addEventListener("input", (e) => { fill(e.target); $("[data-gamma-out]").textContent = (+e.target.value).toFixed(1); if (plate) plate.gammaScale = +e.target.value / 4.5; });
  $("[data-noise]").addEventListener("input", (e) => { fill(e.target); $("[data-noise-out]").textContent = (+e.target.value).toFixed(2); if (plate) plate.noise = +e.target.value; });
  $("[data-sprinkle]").addEventListener("click", () => plate && plate.sprinkle());
  $("[data-strike]").addEventListener("click", () => plate && plate.strike());
  $("[data-reset]").addEventListener("click", () => location.reload());
  const tog = $(".cl-panel-toggle");
  tog.addEventListener("click", () => { const p = $(".cl-panel"), o = !p.classList.contains("is-open"); p.classList.toggle("is-open", o); tog.setAttribute("aria-expanded", String(o)); });
  document.querySelectorAll(".cl-slider").forEach(fill);
  const start = () => { if (plate) { plate.setCamera("lab"); place(); plate.setFrequency(hz); } setHz(hz, true); };
  addEventListener("resize", place);
  if (window.clEntered) start(); else document.addEventListener("cl:entered", start, { once: true });
})();
