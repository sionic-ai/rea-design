// Home page: as the dock loader drops, a glass grid comes in from the center and a guide pill floats up. The dock rotates the four faces like a box to switch.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lattice = document.querySelector("[data-fx~='crt-glass-lattice']");
  const hint = document.querySelector("[data-hint]");

  // ── Notice pill: after entering it floats up over .7s (18px·.84→1), the words arrive .05s apart starting at .5s, and a shine line sweeps for .85s. After 5s, or on the first scroll or drag, it disappears over .5s ──
  const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
  let hintState = "wait";
  function hintIn() {
    if (!hint || hintState !== "wait") return;
    hintState = "in";
    // Original: after surfacing it stays 5s then disappears on its own (1s when it comes back)
    setTimeout(hintOut, 5000);
    hint.classList.replace("is-wait", "is-in");
    const f = hint.querySelector(".al-hint__float");
    if (reduce) { f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: "both" }); hint.querySelectorAll(".al-hint__word").forEach((w) => (w.style.opacity = 1)); return; }
    f.animate([{ opacity: 0, transform: "translate3d(0, 18px, 0) scale(0.84)" }, { opacity: 1, offset: 0.45 }, { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }], { duration: 700, easing: EXPO, fill: "both" });
    hint.querySelectorAll(".al-hint__word").forEach((w, i) => w.animate([{ opacity: 0, transform: "translate3d(0, 0.6em, 0)" }, { opacity: 1, transform: "translate3d(0, 0, 0)" }], { duration: 500, delay: 150 + i * 50, easing: EXPO, fill: "both" }));
    hint.querySelector(".al-hint__sheen").animate([{ opacity: 0, transform: "translate3d(-75%, 0, 0)" }, { opacity: 1, offset: 0.25 }, { opacity: 0, transform: "translate3d(75%, 0, 0)" }], { duration: 850, delay: 150, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "both" });
  }
  function hintOut() {
    if (!hint || hintState === "out") return;
    const was = hintState;
    hintState = "out";
    if (was === "wait") { hint.remove(); return; }
    const f = hint.querySelector(".al-hint__float");
    const cs = getComputedStyle(f);
    f.getAnimations().forEach((a) => a.cancel());
    f.animate([{ opacity: cs.opacity, transform: cs.transform === "none" ? "translate3d(0, 0, 0)" : cs.transform }, { opacity: 0, transform: "translate3d(0, -10px, 0) scale(0.94)" }], { duration: 500, easing: "cubic-bezier(0.55, 0, 0.75, 0.2)", fill: "both" }).onfinish = () => hint.remove();
  }
  addEventListener("wheel", hintOut, { passive: true, once: true });
  lattice?.addEventListener("pointerdown", hintOut, { once: true });

  // ── The grid starts coming in as the dock loader drops ──
  // Original order: 1s after the dock drops, the guide pill, and 1.1s after the dock fully expands (timed from the original frames), grid cards enter from the center
  window.alBoot?.((phase) => {
    if (phase === "drop") setTimeout(hintIn, reduce ? 0 : 1000);
    if (phase === "live") setTimeout(() => lattice?.dispatchEvent(new CustomEvent("fx:start")), reduce ? 0 : 1100);
  });

  // ── Cinema: pressing a card keeps the URL as is while the grid flies that card into a large frame (1.15s). Once settled the film plays and close, title, control bar and three other cases attach ──
  const cine = document.querySelector("[data-cine]");
  // Original layout calculation: at width 1100 and height 620 or more, a big frame on the left + three cards on the right (three cards at 520×.63 plus gaps), otherwise only a big frame in the center
  function cineBox() {
    const vw = innerWidth, vh = innerHeight, narrow = vw < 720, low = vh < 500;
    const px = narrow ? 14 : Math.max(48, vw * 0.06), py = low ? 20 : narrow ? 96 : Math.max(118, vh * 0.135);
    const roomW = vw - px * 2, roomH = vh - py * 2;
    if (!(vw >= 1100 && vh >= 620)) {
      let w = Math.min(roomW, 1480), h = (w * 9) / 16;
      if (h > roomH) { h = roomH; w = (h * 16) / 9; }
      return { main: { x: (vw - w) / 2, y: (vh - h) / 2, w, h }, rail: null };
    }
    const RAIL = 3 * 520 * 0.63 + 52, GAP = 22;
    let w = Math.min((roomW - GAP) / (1 + ((9 / 16) * 520) / RAIL), (roomH * 16) / 9, 1480);
    const h = (w * 9) / 16;
    w = (h * 16) / 9;
    const k = h / RAIL, tileW = 520 * k, pad = 26 * k, x = (vw - (w + GAP + tileW)) / 2, y = (vh - h) / 2, rx = x + w + GAP;
    return { main: { x, y, w, h }, rail: { x: rx - pad / 2, y: y - pad / 2, w: tileW + pad, tileX: rx, tileY: y } };
  }
  if (cine && lattice) {
    const $ = (s) => cine.querySelector(s);
    const frame = $("[data-cine-frame]"), slot = $("[data-cine-slot]"), video = $("[data-cine-video]"), rail = $("[data-cine-rail]"), railTitle = $(".al-cine__rail-title");
    const scrub = $("[data-cine-scrub]"), timeEl = $("[data-cine-time]"), link = $("[data-cine-link]"), dock = document.querySelector("[data-dock]");
    let state = null, idleTimer = 0, awake = false, scrubbing = false;
    const fmt = (t) => (Number.isFinite(t) && t > 0 ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}` : "0:00");
    const place = () => {
      const b = cineBox();
      Object.assign(frame.style, { left: `${b.main.x}px`, top: `${b.main.y}px`, width: `${b.main.w}px`, height: `${b.main.h}px`, borderRadius: `${b.main.w * 0.035}px` });
      cine.classList.toggle("has-rail", !!b.rail);
      if (b.rail) {
        Object.assign(rail.style, { left: `${b.rail.x}px`, top: `${b.rail.y}px`, width: `${b.rail.w}px` });
        Object.assign(railTitle.style, { left: `${b.rail.tileX}px`, top: `${b.rail.tileY}px` });
      }
      return b;
    };
    const fill = (card) => {
      $("[data-cine-name]").textContent = card.dataset.title || card.textContent.trim();
      $("[data-cine-sub]").textContent = card.dataset.sub || "";
      $("[data-cine-initial]").textContent = (card.dataset.title || "·").trim()[0];
      link.setAttribute("href", card.getAttribute("href"));
    };
    // The control bar hides in .8s if there is no interaction for 2.6s while the film plays
    const sync = () => {
      const d = video.duration || 0, p = d ? (video.currentTime / d) * 100 : 0, buf = video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0;
      scrub.style.setProperty("--p", `${p}%`);
      scrub.style.setProperty("--b", `${d ? (buf / d) * 100 : 0}%`);
      scrub.setAttribute("aria-valuemax", Math.round(d));
      scrub.setAttribute("aria-valuenow", Math.round(video.currentTime));
      scrub.setAttribute("aria-valuetext", `${fmt(video.currentTime)} / ${fmt(d)}`);
      timeEl.innerHTML = `${fmt(video.currentTime)} <i>/</i> ${fmt(d)}`;
      const playing = !video.paused && !video.ended;
      cine.classList.toggle("is-paused", !playing);
      cine.classList.toggle("is-muted", video.muted);
      $("[data-cine-play]").setAttribute("aria-label", video.ended ? "View again" : playing ? "Pause" : "Play");
      $("[data-cine-mute]").setAttribute("aria-label", video.muted ? "Sound On" : "Sound Off");
      if (playing && video.readyState >= 3) slot.classList.add("is-rolling");
      frame.classList.toggle("is-idle", playing && awake && !scrubbing);
    };
    const wake = () => {
      awake = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { awake = true; sync(); }, 2600);
      sync();
    };
    ["play", "playing", "pause", "ended", "timeupdate", "durationchange", "loadedmetadata", "progress", "volumechange", "seeked", "canplay"].forEach((t) => video.addEventListener(t, sync));
    const toggle = () => { if (video.ended) video.currentTime = 0; video.paused ? video.play().catch(() => {}) : video.pause(); };
    const seekTo = (x) => { const r = scrub.getBoundingClientRect(); if (video.duration) video.currentTime = Math.min(1, Math.max(0, (x - r.left) / Math.max(r.width, 1))) * video.duration; };
    // Original: turn sound on and play, and if blocked, mute and play again
    const roll = () => { video.muted = false; video.volume = 1; video.play().catch(() => { video.muted = true; video.play().catch(() => {}); }); };

    lattice.addEventListener("fx:open", (e) => {
      if (state) return;
      const card = lattice.querySelectorAll('[data-fx-part="card"]')[e.detail.index];
      if (!card) return;
      e.detail.box = place().main;
      state = "in";
      fill(card);
      dock?.classList.add("is-cinema");
      // The window is transparent while flying in — expand and movie call are delayed two frames to keep the first pressed frame light (the dock starts vanishing right away)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (state !== "in") return;
        cine.classList.remove("is-closed", "is-out", "is-landed");
        cine.classList.add("is-in");
        cine.style.setProperty("--cine-amt", 1);
        slot.classList.remove("is-rolling");
        if (!video.getAttribute("src")) video.src = video.dataset.src;
        video.preload = "auto";
        video.currentTime = 0;
      }));
    });
    lattice.addEventListener("fx:opened", () => {
      if (state !== "in") return;
      state = "landed";
      cine.classList.replace("is-in", "is-landed");
      roll();
      wake();
      frame.focus({ preventScroll: true });
    });
    const close = () => {
      if (state !== "in" && state !== "landed") return;
      state = "out";
      clearTimeout(idleTimer);
      cine.classList.remove("is-in", "is-landed");
      cine.classList.add("is-out");
      cine.style.setProperty("--cine-amt", 0);
      dock?.classList.remove("is-cinema");
      gsap.to(video, { volume: 0, duration: 0.32, ease: "none", onComplete: () => video.pause() });
      lattice.dispatchEvent(new CustomEvent("fx:close"));
    };
    lattice.addEventListener("fx:closed", () => {
      if (state !== "out") return;
      state = null;
      cine.classList.replace("is-out", "is-closed");
      slot.classList.remove("is-rolling");
      frame.classList.remove("is-idle");
    });
    cine.addEventListener("click", (e) => { if (e.target === cine && state === "landed") close(); });
    $("[data-cine-close]").addEventListener("click", close);
    $("[data-cine-play]").addEventListener("click", toggle);
    slot.addEventListener("click", toggle);
    $("[data-cine-mute]").addEventListener("click", () => { video.muted = !video.muted; if (!video.muted) video.volume = 1; });
    $("[data-cine-full]").addEventListener("click", () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else frame.requestFullscreen?.().catch(() => {}); });
    frame.addEventListener("pointermove", wake);
    frame.addEventListener("pointerdown", wake);
    scrub.addEventListener("pointerdown", (e) => { scrub.setPointerCapture(e.pointerId); scrubbing = true; seekTo(e.clientX); });
    scrub.addEventListener("pointermove", (e) => scrubbing && seekTo(e.clientX));
    ["pointerup", "pointercancel"].forEach((t) => scrub.addEventListener(t, () => { scrubbing = false; sync(); }));
    link.addEventListener("click", (e) => { e.preventDefault(); window.alVeilTo?.(link.getAttribute("href")); });
    addEventListener("keydown", (e) => {
      if (!state || state === "out") return;
      if (e.key === "Escape") { if (!document.fullscreenElement) { e.preventDefault(); close(); } return; }
      if (state !== "landed" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === " " || e.key === "k") { if (e.target.tagName === "BUTTON" && e.key === " ") return; e.preventDefault(); toggle(); }
      else if (e.key === "ArrowRight") video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
      else if (e.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5);
      else if (e.key === "m") video.muted = !video.muted;
      else if (e.key === "f") $("[data-cine-full]").click();
      else return;
      wake();
    });
    place();
    addEventListener("resize", () => (!state || state === "landed") && place());
    // Picking another case changes the title and replays the film from the start
    rail.addEventListener("fx:open", (e) => {
      const card = rail.querySelectorAll('[data-fx-part="card"]')[e.detail.index];
      if (!card || state !== "landed") return;
      slot.classList.remove("is-rolling");
      fill(card);
      setTimeout(() => { video.currentTime = 0; roll(); }, reduce ? 0 : 300);
    });
  }

  // ── Career: in each digit place the year digit flips as a half panel (.52s, down if it increases, up if it decreases), and the right text rises at .5s. The ruler below has a tick per year, a bar per place ──
  const JOBS = [
    { from: 2026, to: 2027, org: "Role Title Here", co: "Company One", where: "Remote", now: true, hue: 160 },
    { from: 2024, to: 2026, org: "Role Title Here", co: "Company Two", where: "Remote", hue: 100 },
    { from: 2022, to: 2024, org: "Role Title Here", co: "Company Three", where: "City", hue: 40 },
    { from: 2019, to: 2022, org: "Role Title Here", co: "Company Four", where: "City", hue: 320 },
    { from: 2016, to: 2019, org: "Role Title Here", co: "Company Five", where: "City", hue: 260 },
    { from: 2013, to: 2016, org: "Role Title Here", co: "Company Six", where: "City", hue: 200 },
    { from: 2008, to: 2013, org: "Role Title Here", co: "Company Seven", where: "City", hue: 20 },
    { from: 2004, to: 2008, org: "Role Title Here", co: "Company Eight", where: "City", hue: 300 },
  ].map((j) => ({ ...j, role: j.co, text: "Your three lines here about the work done there. Briefly note what was made, who it was made with, and the criteria used to judge it." }));
  const xp = document.querySelector("[data-xp]");
  if (xp) {
    const yearEl = xp.querySelector("[data-xp-year]"), post = xp.querySelector("[data-xp-post]");
    const first = Math.min(...JOBS.map((j) => j.from)), last = Math.max(...JOBS.map((j) => j.to)), span = last - first;
    const ticks = xp.querySelector("[data-xp-ticks]"), posts = xp.querySelector("[data-xp-posts]");
    for (let y = first; y <= last; y++) { const t = document.createElement("span"); t.className = "al-xp__tick" + (y % 5 === 0 ? " is-major" : ""); t.style.left = ((last - y) / span) * 100 + "%"; if (y % 5 === 0) t.innerHTML = "<i>" + y + "</i>"; ticks.appendChild(t); }
    const btns = JOBS.map((j, i) => {
      const li = document.createElement("li");
      li.style.left = ((last - j.to) / span) * 100 + "%"; li.style.width = ((j.to - j.from) / span) * 100 + "%"; li.dataset.hue = ""; li.style.setProperty("--hue", j.hue);
      li.innerHTML = '<button type="button"><span class="al-xp__bar"></span><span class="al-xp__name" lang="en">' + j.co + "</span></button>";
      posts.appendChild(li);
      const b = li.firstElementChild; b.addEventListener("click", () => show(i)); return b;
    });
    // Flip plate: size holder + one current digit. When it changes, the top half folds and the bottom half unfolds
    const digits = [];
    const paint = (str, dir) => {
      [...str].forEach((ch, i) => {
        let d = digits[i];
        if (!d) { d = document.createElement("span"); d.className = "al-xp__digit"; d.innerHTML = '<span class="al-xp__digit-size">0</span><span class="al-xp__leaf">' + ch + "</span>"; yearEl.appendChild(d); digits[i] = d; d.dataset.v = ch; return; }
        if (d.dataset.v === ch) return;
        const old = d.dataset.v; d.dataset.v = ch;
        d.classList.toggle("is-up", dir < 0);
        d.querySelectorAll(".al-xp__leaf").forEach((l) => l.remove());
        if (reduce) { d.insertAdjacentHTML("beforeend", '<span class="al-xp__leaf">' + ch + "</span>"); return; }
        d.insertAdjacentHTML("beforeend", '<span class="al-xp__leaf">' + ch + '</span><span class="al-xp__leaf is-top is-fold">' + old + '</span><span class="al-xp__leaf is-bottom is-fold">' + old + '</span><span class="al-xp__leaf is-top is-unfold">' + ch + "</span>");
        setTimeout(() => { d.querySelectorAll(".is-fold, .is-unfold").forEach((l) => l.remove()); }, 560);
      });
    };
    let cur = -1;
    function show(i) {
      if (i === cur || i < 0 || i >= JOBS.length) return;
      const dir = cur < 0 ? 1 : i > cur ? 1 : -1; cur = i;
      const j = JOBS[i];
      paint(String(j.from), dir);
      post.querySelector("[data-xp-when]").textContent = j.from + "–" + (j.now ? "Present" : j.to) + " · " + j.where;
      post.querySelector("[data-xp-org]").textContent = j.org;
      post.querySelector("[data-xp-role]").textContent = j.role;
      post.querySelector("[data-xp-text]").textContent = j.text;
      post.classList.remove("is-swap"); void post.offsetWidth; post.classList.add("is-swap");
      btns.forEach((b, k) => b.classList.toggle("is-on", k === i));
      xp.querySelector('[data-xp-step="-1"]').setAttribute("aria-disabled", String(i === 0));
      xp.querySelector('[data-xp-step="1"]').setAttribute("aria-disabled", String(i === JOBS.length - 1));
    }
    yearEl.textContent = "";
    show(0);
    xp.querySelectorAll("[data-xp-step]").forEach((b) => b.addEventListener("click", () => show(cur + +b.dataset.xpStep)));
  }

  // Contact panel brightness switch: only the clicked side is on (the original swaps the skin to a light panel — the copy only shows the indicator)
  document.querySelectorAll(".al-cb__switch button").forEach((b, _, all) => b.addEventListener("click", () => all.forEach((x) => x.classList.toggle("is-on", x === b))));

  // ── Box flip: place the target face on the side and rotate it ∓90° over 1.05s (cubic in-out). While turning, pull the box back by 16vw · sin and cast shade (.6) on both faces ──
  const ORDER = ["work", "about", "archive", "contact"];
  const TURN = { duration: 1050, pull: 0.16, shade: 0.6 };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const shell = document.querySelector("[data-shell]");
  const cube = document.querySelector("[data-cube]");
  const faces = Object.fromEntries([...document.querySelectorAll("[data-face]")].map((f) => [f.dataset.face, f]));
  const items = [...document.querySelectorAll("[data-view-to]")];
  let view = "work", turning = false;
  function go(to) {
    if (turning || to === view || !faces[to]) return;
    const from = faces[view], next = faces[to], dir = ORDER.indexOf(to) > ORDER.indexOf(view) ? 1 : -1;
    items.forEach((b) => (b.dataset.viewTo === to ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current")));
    const done = () => {
      from.hidden = true; from.dataset.role = ""; next.dataset.role = "rest";
      ["--angle", "--pull", "--shade-from", "--shade-to", "--dir"].forEach((p) => cube.style.removeProperty(p));
      cube.classList.remove("is-turning"); shell.removeAttribute("data-turning");
      view = to; shell.dataset.view = to; turning = false;
      next.dispatchEvent(new CustomEvent("al:shown", { bubbles: true }));
    };
    next.hidden = false;
    if (reduce) { done(); return; }
    turning = true;
    from.dataset.role = "from"; next.dataset.role = "to";
    cube.style.setProperty("--dir", dir);
    cube.classList.add("is-turning"); shell.setAttribute("data-turning", "true");
    const t0 = performance.now();
    const step = (now) => {
      const c = Math.min(1, (now - t0) / TURN.duration), l = ease(c);
      cube.style.setProperty("--angle", `${(-dir * 90 * l).toFixed(3)}deg`);
      cube.style.setProperty("--pull", `${(TURN.pull * 100 * Math.sin(Math.PI * l)).toFixed(2)}vw`);
      cube.style.setProperty("--shade-from", (TURN.shade * l).toFixed(3));
      cube.style.setProperty("--shade-to", (TURN.shade * (1 - l)).toFixed(3));
      if (c < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  }
  items.forEach((b) => b.addEventListener("click", () => go(b.dataset.viewTo)));
  window.alGo = go;
})();
