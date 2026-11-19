(() => {
  const vt = window.vt, S = vt.stage, root = document.documentElement;
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  if (!S) return;

  // Section: showcase → time → receive. Only elements belonging to that section get data-show, and the rest are inert.
  const setChapter = (name) => {
    root.dataset.chapter = name;
    $$("[data-chapters]").forEach((el) => { const on = el.dataset.chapters.split(" ").includes(name); el.toggleAttribute("data-show", on); el.inert = !on; });
  };
  setChapter("none");

  // Loader → entrance → opening scene
  const loader = $(".js-loader"), L = vt.loader();
  S.ready.then(() => L.markReady());
  L.finished.then(() => loader.toggleAttribute("data-loaded", true));
  vt.enter(loader, () => vt.toggleSound()).then(() => S.opening());

  const attention = $(".js-attention"), line = $(".js-attention-line"), dot = $(".js-attention-dot"), text = $(".js-attention-text");
  let attentionOn = false;
  const hideAttention = () => { attentionOn = false; attention.removeAttribute("data-show"); };
  S.onReveal = () => {
    S.canDrag = true;
    setChapter("case");
    $(".js-sound").toggleAttribute("data-show", true);
    attentionOn = true; attention.toggleAttribute("data-show", true);
    vt.typeLead();
  };
  $("#webgl").addEventListener("pointerdown", () => attentionOn && S.canDrag && setTimeout(hideAttention, 1200));

  // Every frame: guide line position, volume level, bar height, cursor ring
  const sound = $(".js-sound"), stalker = $(".js-stalker");
  const pointer = { x: innerWidth / 2, y: innerHeight / 2 }, follow = { ...pointer };
  addEventListener("pointermove", (e) => { pointer.x = e.clientX; pointer.y = e.clientY; });
  S.onFrame = () => {
    {
      // Like the original, the guide-line position always follows the box (even when hidden) — only data-show controls showing and hiding
      const a = S.anchor(), narrow = innerWidth < 768;
      const x2 = a.x + (narrow ? 40 : 60), y2 = a.y - (narrow ? 120 : 60), x3 = x2 + (narrow ? 24 : 40);
      line.setAttribute("points", `${a.x},${a.y} ${x2},${y2} ${x3},${y2}`);
      line.style.setProperty("--len", Math.hypot(x2 - a.x, y2 - a.y) + (x3 - x2));
      dot.style.transform = `translate(${a.x}px, ${a.y}px)`;
      text.style.transform = `translate(${x3 + 8}px, ${y2}px)`;
    }
    vt.sound.intensity(S.intensity);
    sound.style.setProperty("--level", String(0.6 + S.intensity * 0.4));
    const atEnd = S.isAtEnd && S.time.active;
    stalker.style.setProperty("--progress", String(S.absorbProgress));
    stalker.toggleAttribute("data-at-end", atEnd);
    const k = atEnd ? 0.18 : 1, tx = Math.min(pointer.x + 20, innerWidth - 44), ty = Math.min(pointer.y + 20, innerHeight - 44);
    follow.x += (tx - follow.x) * k; follow.y += (ty - follow.y) * k;
    stalker.style.transform = `translate(${follow.x}px, ${follow.y}px)`;
  };

  // Zoom in/out
  $$(".js-zoom").forEach((b) => b.addEventListener("click", () => {
    const r = S.zoom(+b.dataset.dir);
    $$(".js-zoom").forEach((z) => (z.disabled = +z.dataset.dir > 0 ? !r.canIn : !r.canOut));
  }));

  // Styling panel
  const panel = $(".js-panel"), toggle = $(".js-panel-toggle"), note = $(".js-seal-note");
  const NOTE = { first: note.textContent, edited: "Your second instruction here: finish decorating, then close." };
  const openPanel = (v) => { panel.toggleAttribute("data-open", v); toggle.setAttribute("aria-expanded", String(v)); };
  toggle.addEventListener("click", () => openPanel(!panel.hasAttribute("data-open")));
  $(".js-panel-close").addEventListener("click", () => openPanel(false));
  panel.addEventListener("input", () => (note.textContent = NOTE.edited));
  const imgName = $(".js-image-name"), imgReset = $(".js-image-reset");
  $(".js-image").addEventListener("change", async (e) => { const f = e.target.files?.[0]; if (!f) return; await S.setImage(f); imgName.textContent = f.name; imgReset.hidden = false; });
  imgReset.addEventListener("click", async () => { await S.setImage(null); imgName.textContent = "Logo"; imgReset.hidden = true; $(".js-image").value = ""; });
  $$(".js-display").forEach((r) => r.addEventListener("change", () => { S.setDisplay(r.value); $(".js-particle-options").hidden = r.value !== "particles"; }));
  const bindRange = (sel, fn, fmt) => { const i = $(sel), out = $(`${sel}-value`); const go = () => { fn(+i.value); out.textContent = fmt(+i.value); }; i.addEventListener("input", go); go(); };
  bindRange(".js-particle-size", S.setParticleSize, (v) => `${Math.round(v * 100)}%`);
  bindRange(".js-particle-motion", S.setParticleMotion, (v) => `${Math.round(v * 100)}%`);
  bindRange(".js-particle-speed", S.setParticleSpeed, (v) => `${v.toFixed(1)}×`);
  bindRange(".js-refraction", S.setRefraction, (v) => `${Math.round(v * 100)}%`);
  const labelIn = $(".js-label"), count = $(".js-label-count");
  labelIn.addEventListener("input", () => { const v = labelIn.value.slice(0, 12); count.textContent = `${v.length}/12`; S.setLabel(v); S.redrawDial(v); });
  // Background color: lays the chosen color on stage and page background, and darkens text if bright (skin’s data-bright mode)
  const bgIn = $(".js-bg"), bgOut = $(".js-bg-value");
  const toHex = (c) => "#" + c.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
  bgIn.value = toHex(vt.color("--kf-bg")); bgOut.textContent = bgIn.value;
  bgIn.addEventListener("input", () => {
    const c = vt.color(bgIn.value), lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    root.toggleAttribute("data-bright", lum > 0.5);
    root.style.setProperty("--kf-bg", bgIn.value);
    bgOut.textContent = bgIn.value;
    S.setBackground("--kf-bg"); S.refreshInk?.();
  });

  // Close showcase → time
  const cue = $(".js-time-cue"), hint = $(".js-time-hint"), year = $(".js-time-year"), goal = $(".js-time-goal"), day = $(".js-time-date");
  const pad = (n) => String(n).padStart(2, "0");
  const startText = () => `${vt.coarse ? "Push Up" : "Scroll down"} ${S.time.goalYear()} Until`;
  let sealedAt = null;
  $$(".js-seal").forEach((b) => b.addEventListener("click", () => {
    openPanel(false); hideAttention(); setChapter("none");
    sealedAt = new Date();
    S.seal(() => { setChapter("time"); hint.textContent = startText(); goal.textContent = `/ ${S.time.goalYear()}`; });
  }));
  S.onSecond = () => vt.sound.tick();
  S.onTick = (d) => {
    const y = String(d.getFullYear());
    if (year.textContent !== y) year.textContent = y;
    day.textContent = `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const end = S.isAtEnd;
    goal.toggleAttribute("data-hidden", end);
    const h = end ? `Continue ${vt.coarse ? "Push" : "Down"} Drawing in time` : startText();
    if (hint.textContent !== h) hint.textContent = h;
    cue.toggleAttribute("data-hidden", S.time.absorbing);
  };
  $(".js-time-exit").addEventListener("click", () => { setChapter("none"); S.exitTime(() => setChapter("case")); });

  // Receive: two lines, seal and opening date, typed at .055s per character, then a .5s pause before the button shows
  const lines = $$(".js-receive-line"), full = $(".js-receive-full"), actions = $(".js-receive-actions");
  const fmt = (d) => `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  S.onAbsorb = async () => {
    setChapter("receive"); S.receive();
    const msg = [`Sealed ${fmt(sealedAt || new Date())}.`, `Opening ${fmt(S.time.getDate())}.`];
    full.textContent = msg.join(" ");
    actions.inert = true;
    if (!vt.reduce) {
      lines.forEach((l) => (l.style.minWidth = ""));
      lines.forEach((l, i) => (l.textContent = msg[i]));
      const w = lines.map((l) => l.getBoundingClientRect().width);
      lines.forEach((l, i) => { l.style.minWidth = `${w[i]}px`; l.textContent = ""; });
      for (const [i, s] of msg.entries()) { for (let k = 1; k <= s.length; k++) { lines[i].textContent = s.slice(0, k); await vt.wait(0.055); } await vt.wait(0.5); }
    } else lines.forEach((l, i) => (l.textContent = msg[i]));
    actions.inert = false;
  };
  $(".js-save").addEventListener("click", () => S.saveImage());
  $(".js-make-another").addEventListener("click", () => { setChapter("none"); S.reset(); setTimeout(() => { setChapter("case"); note.textContent = NOTE.first; }, 1200); });
})();
