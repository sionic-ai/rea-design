// First page: loading paper → collage assembly (original sequence table) → on scroll the collage scatters, and five works stick to the screen and stand one after another.
(() => {
  const root = document.documentElement;
  const stage = document.querySelector(".h-stage");
  const opening = document.querySelector(".i-opening");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => matchMedia("(min-width: 1024px)").matches;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (v, a, b) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- Loading paper and assembly ----------
  // Original LOADER: check 120ms + 250ms spacing, ready 1080ms, at 1300ms the paper lifts out over .42s and assembly starts 80ms later
  const LOADER = { exitAt: 1300, exit: 420, tail: 80 };
  const LAST_SEQ = 11452;
  const PEEK = [9142, 10542];
  let rate = 1;
  let assembleAt = 0;

  const typer = (() => {
    const p = document.querySelector(".h-intro__copy");
    const ghost = p.querySelector(".h-intro__ghost");
    const live = p.querySelector(".h-intro__live");
    const code = ghost.querySelector(".h-code").textContent;
    const text = ghost.textContent;
    const codeAt = text.indexOf(code);
    // Per-letter weight: space .7, +10 after a period, +4.5 after a comma — a typewriter that catches its breath at sentence ends
    const weights = Array.from(text, (ch, i) => (ch === " " ? 0.7 : 1) + (text[i - 1] === "." ? 10 : text[i - 1] === "," ? 4.5 : 0));
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    const marks = weights.map((w) => (acc += w) / total);
    const start = Number(p.dataset.typeSeq);
    const dur = Number(p.dataset.typeDur);
    const render = (n) => {
      const before = text.slice(0, Math.min(n, codeAt));
      const inCode = text.slice(codeAt, Math.min(n, codeAt + code.length));
      const after = n > codeAt + code.length ? text.slice(codeAt + code.length, n) : "";
      live.innerHTML = "";
      live.append(before);
      if (n > codeAt) { const s = document.createElement("span"); s.className = "h-code"; s.textContent = inCode; live.append(s); }
      live.append(after);
      if (n > 0 && n < text.length) { const c = document.createElement("span"); c.className = "h-caret"; live.append(c); }
    };
    return {
      run() {
        const t0 = performance.now();
        let virt = 0, last = t0;
        const step = (now) => {
          virt += (now - last) * rate;
          last = now;
          const t = virt - start;
          let n = 0;
          if (t > 0) while (n < marks.length && marks[n] * dur <= t) n++;
          render(n);
          if (n < text.length && stage.dataset.phase === "assemble") requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
    };
  })();

  const finish = () => {
    stage.dataset.phase = "ready";
    root.classList.remove("is-held");
    opening.dataset.phase = "gone";
    removeEventListener("wheel", hurry);
    removeEventListener("keydown", hurry);
    ScrollTrigger.refresh();
  };
  // Scrolling the wheel during assembly speeds up the rest of the assembly 6x, like the original
  const hurry = () => {
    if (stage.dataset.phase !== "assemble" || rate !== 1) return;
    rate = 6;
    stage.getAnimations({ subtree: true }).forEach((a) => a.updatePlaybackRate(6));
    const done = performance.now() - assembleAt;
    clearTimeout(readyTimer);
    readyTimer = setTimeout(finish, Math.max(0, (LAST_SEQ + 400 - done) / 6));
  };
  let readyTimer = 0;

  const skip = reduce || sessionStorage.getItem("i-skip-intro") === "1";
  sessionStorage.removeItem("i-skip-intro");
  if (skip) {
    opening.dataset.phase = "gone";
    stage.dataset.phase = "ready";
  } else {
    root.classList.add("is-held");
    scrollTo(0, 0);
    stage.dataset.phase = "load";
    setTimeout(() => (opening.dataset.phase = "lift"), LOADER.exitAt);
    setTimeout(() => {
      opening.dataset.phase = "gone";
      stage.dataset.phase = "assemble";
      assembleAt = performance.now();
      typer.run();
      const pasta = document.querySelector(".h-pasta__obj");
      setTimeout(() => pasta.setAttribute("data-peek", ""), PEEK[0]);
      setTimeout(() => pasta.removeAttribute("data-peek"), PEEK[1]);
      readyTimer = setTimeout(finish, LAST_SEQ + 400);
      addEventListener("wheel", hurry, { passive: true });
      addEventListener("keydown", hurry);
    }, LOADER.exitAt + LOADER.exit + LOADER.tail);
  }

  // ---------- Values for the hero scattering: original formula as-is (smoothstep per interval) ----------
  const set = (k, v) => stage.style.setProperty(k, v);
  const unfold = () => {
    if (reduce || !wide()) { stage.removeAttribute("style"); return; }
    const vh = innerHeight;
    const o = Math.max(0, Math.min(1.18, (scrollY - stage.offsetTop) / Math.max(1, stage.offsetHeight - vh)));
    const c = smooth(o, 0.15, 0.35), u = smooth(o, 0.35, 0.55), p = smooth(o, 0.55, 0.82);
    const h = smooth(o, 0.45, 0.9), m = smooth(o, 0.58, 0.88);
    set("--hero-progress", o.toFixed(4));
    set("--duke-x", `${lerp(0, 40, c) + lerp(0, 70, u) + lerp(0, 60, p)}px`);
    set("--duke-y", `${lerp(0, -20, c) + lerp(0, -50, u) + lerp(0, -40, p)}px`);
    set("--duke-scale", (1 + 0.025 * c + 0.015 * u).toFixed(4));
    set("--duke-opacity", (1 - smooth(o, 0.42, 0.86)).toFixed(4));
    set("--pasta-x", `${lerp(0, -40, u) + lerp(0, -50, p)}px`);
    set("--pasta-y", `${lerp(0, 50, u) + lerp(0, 80, p)}px`);
    set("--pasta-rotate", `${(-2 * p).toFixed(3)}deg`);
    set("--pasta-opacity", (1 - smooth(o, 0.58, 0.86)).toFixed(4));
    set("--yoga-x", `${lerp(0, 30, u) + lerp(0, 50, p)}px`);
    set("--yoga-y", `${lerp(0, 40, u) + lerp(0, 60, p)}px`);
    set("--yoga-rotate", `${(0.6 * p).toFixed(3)}deg`);
    set("--yoga-opacity", (1 - smooth(o, 0.42, 0.82)).toFixed(4));
    set("--everest-y", `${lerp(0, 20, u) + lerp(0, 40, p)}px`);
    set("--everest-scale", (1 + 0.02 * u).toFixed(4));
    set("--everest-opacity", (1 - smooth(o, 0.55, 0.82)).toFixed(4));
    set("--name-y", `${lerp(0, -40, h) + lerp(0, -120, m)}px`);
    set("--name-opacity", (1 - m).toFixed(4));
    set("--note-y", `${-20 * smooth(o, 0.4, 0.7)}px`);
    set("--note-opacity", (1 - smooth(o, 0.4, 0.7)).toFixed(4));
    set("--current-opacity", (1 - smooth(o, 0.2, 0.45)).toFixed(4));
    set("--intro-opacity", (1 - smooth(o, 0.25, 0.5)).toFixed(4));
    set("--copy-x", `${-20 * smooth(o, 0.25, 0.5)}px`);
    set("--header-opacity", (1 - smooth(o, 0.35, 0.72)).toFixed(4));
    set("--footer-opacity", (1 - smooth(o, 0.18, 0.45)).toFixed(4));
    set("--edge-x", `${-36 * smooth(o, 0.98, 1.12)}px`);
    set("--edge-y", `${12 * smooth(o, 0.76, 1)}px`);
    set("--edge-opacity", (1 - smooth(o, 1, 1.12)).toFixed(4));
    set("--cursor-x", `${28 * c}px`);
    set("--cursor-y", `${28 * c}px`);
    set("--cursor-rotate", `${(5 * c).toFixed(3)}deg`);
    set("--cursor-opacity", (1 - smooth(o, 0.2, 0.48)).toFixed(4));
  };

  // Scroll hint: recedes while the first work section passes from 80% to 45% of the screen
  const cue = document.querySelector(".h-cue");
  const work = document.getElementById("work");
  const cueUpdate = () => {
    const vh = innerHeight;
    const top = work.getBoundingClientRect().top;
    const [from, to] = wide() ? [0.8, 0.45] : [0.97, 0.66];
    const end = top + scrollY - vh * to;
    const fill = root.classList.contains("is-held") ? 0 : clamp01(scrollY / Math.max(1, end));
    const f = clamp01((from - top / vh) / (from - to));
    const recede = f * f * (3 - 2 * f);
    cue.style.setProperty("--cue-fill", fill.toFixed(4));
    cue.style.setProperty("--cue-recede", recede.toFixed(4));
    cue.dataset.gone = recede > 0.995 ? "true" : "false";
  };
  cue.querySelector("button").addEventListener("click", () => scrollTo({ top: work.getBoundingClientRect().top + scrollY, behavior: reduce ? "auto" : "smooth" }));

  let raf = 0;
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; unfold(); cueUpdate(); }); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  unfold();
  cueUpdate();

  // ---------- 01 Map illustration: draws a water park seen from an oblique top-down view using a seeded random ----------
  (() => {
    const svg = document.querySelector(".w-gino__plate");
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const ns = "http://www.w3.org/2000/svg";
    // Fill uses a skin variable (var()), so it is set via style, not an svg attribute
    const add = (tag, attrs, parent = svg) => { const el = document.createElementNS(ns, tag); for (const k in attrs) if (k === "fill" || k === "stroke") el.style[k] = attrs[k]; else el.setAttribute(k, attrs[k]); parent.append(el); return el; };
    const g = add("g", { transform: "translate(500 350) skewX(-18) scale(1 .78) translate(-500 -350)" });
    add("path", { d: "M120 360 C120 200 260 90 470 80 C700 70 900 170 905 330 C910 500 760 620 520 625 C280 630 120 530 120 360Z", fill: "var(--site-paper-90-v2)", stroke: "var(--site-yellow-80)", "stroke-width": 4 }, g);
    add("path", { d: "M300 300 C360 230 470 250 480 320 C490 390 400 430 340 400 C290 376 270 336 300 300Z", fill: "var(--site-sky-77)", stroke: "var(--site-paper-100)", "stroke-width": 6 }, g);
    add("path", { d: "M600 300 C680 250 800 290 790 370 C780 450 660 470 610 420 C570 380 560 330 600 300Z", fill: "var(--site-sky-71)", stroke: "var(--site-paper-100)", "stroke-width": 6 }, g);
    add("path", { d: "M260 470 C330 520 420 440 500 470 C580 500 640 560 720 520", fill: "none", stroke: "var(--site-sky-82)", "stroke-width": 26, "stroke-linecap": "round" }, g);
    add("path", { d: "M260 470 C330 520 420 440 500 470 C580 500 640 560 720 520", fill: "none", stroke: "var(--site-paper-100)", "stroke-width": 3, "stroke-dasharray": "10 14" }, g);
    [[200, 210, 90, 46], [520, 140, 120, 50], [760, 200, 80, 60], [180, 420, 70, 50], [660, 560, 110, 40]].forEach(([x, y, w, h]) => {
      add("rect", { x, y, width: w, height: h, fill: "var(--site-gray-71)", stroke: "var(--site-gray-58)", "stroke-width": 3 }, g);
      add("rect", { x: x + 6, y: y + 6, width: w - 12, height: h - 12, fill: "var(--site-gray-81)" }, g);
    });
    for (let i = 0; i < 150; i++) {
      const a = rnd() * Math.PI * 2, r = 0.82 + rnd() * 0.2;
      const x = 512 + Math.cos(a) * 385 * r, y = 352 + Math.sin(a) * 268 * r;
      add("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: (9 + rnd() * 9).toFixed(1), fill: rnd() > 0.5 ? "var(--site-lime-60)" : "var(--site-lime-68)", stroke: "var(--site-lime-51)", "stroke-width": 2 }, g);
    }
    for (let i = 0; i < 40; i++) add("circle", { cx: (240 + rnd() * 560).toFixed(1), cy: (150 + rnd() * 420).toFixed(1), r: (6 + rnd() * 5).toFixed(1), fill: "var(--site-lime-64)" }, g);
  })();

  // Heart dots: small hearts scattered over the letter section background
  (() => {
    const box = document.querySelector(".w-rv__hearts");
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 16; i++) {
      const h = document.createElement("i");
      h.style.cssText = `left:${(40 + rnd() * 56).toFixed(1)}%;top:${(4 + rnd() * 86).toFixed(1)}%;--s:${Math.round(12 + rnd() * 12)}px;--c:${rnd() > 0.45 ? "var(--site-blue-82-v2)" : "var(--site-red-68)"};rotate:${Math.round(rnd() * 40 - 20)}deg`;
      box.append(h);
    }
  })();

  // ---------- Pinned scene ----------
  const tab = document.querySelector(".i-tab");
  const index = document.querySelector(".i-index");
  const TABS = {
    1: { accent: "var(--site-sky)", label: "View case", href: "works.html", warp: true, mark: "transparent", color: "var(--site-magenta)" },
    2: { accent: "var(--site-blue-64-v2)", label: "View case", href: "works.html", warp: true, mark: "transparent", color: "var(--site-blue-64-v2)" },
    3: { accent: "var(--site-lime)", label: "View case", href: "works.html", warp: true, mark: "var(--site-lime)", color: "var(--kf-ink)" },
    4: { accent: "var(--site-red)", label: "Open site ↗", href: "#work-letters", warp: false, mark: "transparent", color: "var(--site-red)" },
    5: { accent: "var(--site-red)", label: "", href: "#journal", warp: false, mark: "transparent", color: "var(--site-red)" },
  };
  const ready = {};
  let active = 0;
  const paint = () => {
    index.dataset.visible = active ? "true" : "false";
    index.querySelectorAll(".i-index__num").forEach((n) => n.toggleAttribute("data-on", Number(n.dataset.i) === active));
    const t = TABS[active];
    if (t) { index.style.setProperty("--index-accent", t.color); index.style.setProperty("--index-mark", t.mark); }
    const shown = !!(t && t.label && ready[active]);
    tab.dataset.shown = shown ? "true" : "false";
    if (t && t.label) {
      tab.style.setProperty("--tab-accent", t.accent);
      tab.querySelector(".i-tab__label").textContent = t.label;
      tab.setAttribute("href", t.href);
      tab.toggleAttribute("data-warp", t.warp);
    }
  };
  // Current section: the last section past the 55% screen line that continues below the 45% line is the one. Pinned scenes measure the extended space (pin-spacer) as a box —
  // If a pinned element is used as the trigger, the pin length is not included and the current section releases mid-scene
  const sections = [...document.querySelectorAll("[data-index]")];
  let spyRaf = 0;
  const spy = () => {
    spyRaf = 0;
    const box = (sec) => (sec.parentElement.classList.contains("pin-spacer") ? sec.parentElement : sec).getBoundingClientRect();
    const hit = sections.filter((sec) => { const r = box(sec); return r.top <= innerHeight * 0.55 && r.bottom >= innerHeight * 0.45; }).pop();
    const next = hit ? Number(hit.dataset.index) : 0;
    if (next !== active) { active = next; paint(); }
  };
  addEventListener("scroll", () => { spyRaf ||= requestAnimationFrame(spy); }, { passive: true });
  ScrollTrigger.addEventListener("refresh", spy);
  // Section navigation (original restorer): work section links briefly cover the screen (html[data-restore]) and jump straight to the end position of that section’s pinned scene — landing on a fully assembled scene.
  // The notebook jumps, unmasked, to its closed resting spot (180 of 5428). Once the spot holds for two frames and the fonts have all loaded (up to 1.2s), the cover lifts
  const PIN = { "#work": "gino-assembly", "#work-supta": "supta-flow", "#work-nabiji": "nabiji-flow" };
  const spot = (hash) => {
    const st = ScrollTrigger.getById(hash === "#journal" ? "notebook-epilogue" : PIN[hash]);
    if (st) return hash === "#journal" ? st.start + ((st.end - st.start) * 180) / 5428 : st.end - 1;
    const el = document.querySelector(hash);
    return el ? el.getBoundingClientRect().top + scrollY : null;
  };
  // Original loop kept: every frame, check whether the spot jumped to in the previous frame is unchanged (document height too), re-measure ScrollTrigger, then jump again.
  // Lift the cover when two consecutive frames are unchanged and fonts have all arrived, or when the time between frames (max 100ms per step) adds up to more than 1200ms
  const jump = (hash) => {
    const html = document.documentElement, cover = hash !== "#journal";
    let fonts = false, still = 0, lastH = 0, spent = 0, prev = 0, landed = false, target = null;
    // The cover is set right where it’s called — the cover (shared.js) of the returned page sees this on its first frame and waits
    if (cover && !html.hasAttribute("data-restore")) { html.setAttribute("data-restore", ""); setTimeout(() => html.removeAttribute("data-restore"), 1500); }
    document.fonts.ready.then(() => (fonts = true));
    const step = (now) => {
      if (prev) spent += Math.min(now - prev, 100);
      prev = now;
      const h = html.scrollHeight;
      still = target != null && Math.abs(scrollY - target) <= 1 && h === lastH ? still + 1 : 0;
      lastH = h;
      if (landed && ((fonts && still >= 2) || spent > 1200)) { html.removeAttribute("data-restore"); return; }
      ScrollTrigger.refresh();
      target = spot(hash);
      if (target != null) { scrollTo({ top: target, behavior: "instant" }); landed = true; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]'), hash = a?.getAttribute("href");
    if (!a || !(hash in PIN || hash === "#journal") || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (location.hash !== hash) history.pushState(null, "", hash);
    jump(hash);
  });
  // Returning to #work from a case study skips the assembly and jumps to the same spot
  // This loop re-measures while waiting for fonts too, so the automatic re-measure on load is removed — it grabs the main thread in the middle of the clearing cover and the transition stutters
  if (skip && (location.hash in PIN || location.hash === "#journal")) {
    ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,resize" });
    jump(location.hash);
  }
  const readyAt = (n, cut) => (st) => { const r = st.progress >= cut; if (ready[n] !== r) { ready[n] = r; paint(); } };

  // Number counting runs only in the desktop pinned scene — on phones · reduced motion, write the final value from the start
  const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n < 10000 ? 1 : n % 1000 === 0 ? 0 : 1)}K` : String(Math.round(n)));
  document.querySelectorAll("[data-count]").forEach((c) => (c.textContent = compact(Number(c.dataset.count))));

  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    // 01 — pinned for 2.68 screens: cover → map unfold → road → phone → tech note → two problem lines (original timing as is)
    const gino = document.getElementById("work");
    const q = gsap.utils.selector(gino);
    gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: { id: "gino-assembly", trigger: gino, start: "top top", end: () => `+=${iPin(2.68 * 900)}`, pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: readyAt(1, 0.8424) },
    })
      .fromTo(q('[data-g="index"]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.08)
      .fromTo(q('[data-g="line"]'), { yPercent: 112 }, { yPercent: 0, duration: 0.11, stagger: 0.02 }, 0.1)
      .fromTo(q('[data-g="tagline"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.2)
      .fromTo(q(".w-gino__tagline path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.05, ease: "none" }, 0.22)
      .fromTo(q('[data-g="description"]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.25)
      .fromTo(q('[data-g="meta"]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.28)
      .fromTo(q('[data-g="map"]'), { autoAlpha: 0, scale: 0.93, y: 36, rotation: -1, clipPath: "polygon(34% 32%, 63% 28%, 68% 64%, 31% 69%)" }, { autoAlpha: 1, scale: 1, y: 0, rotation: 0, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 0.18, ease: "power2.inOut" }, 0.3)
      .fromTo(q('.w-gino__start, [data-g="here"]'), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.05 }, 0.43)
      .fromTo(gino, { "--gino-route": 0 }, { "--gino-route": 1, duration: 0.22, ease: "none" }, 0.46)
      .fromTo(q('[data-g="phone"]'), { autoAlpha: 0, x: 12, y: 72, rotation: 2, scale: 0.96 }, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.15 }, 0.55)
      .fromTo(q('[data-g="tech"], [data-g="coords"]'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.66)
      .fromTo(q('.w-gino__end, [data-g="wave"]'), { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.06 }, 0.67)
      .fromTo(q('[data-g="l1"]'), { autoAlpha: 0, y: 14, clipPath: "inset(0 0 100% 0)" }, { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.09 }, 0.75)
      .fromTo(q('[data-g="l2"]'), { autoAlpha: 0, y: 14, clipPath: "inset(0 0 100% 0)" }, { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.09 }, 0.77)
      .to({}, { duration: 0.225 }, 0.86);

    // 02 — rises first by 30% of the screen, then sticks for 3.19 screens. Stage name, viewpoint and distance as in the original table
    const supta = document.getElementById("work-supta");
    const sq = gsap.utils.selector(supta);
    const sTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: { id: "supta-flow", trigger: supta, start: () => `top -${0.3 * innerHeight}px`, end: () => `+=${iPin(3.19 * 900)}`, pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: readyAt(2, 0.8677) },
    });
    [
      ["title", 0, 0.115, 110], ["tagline", 0.089, 0.096, 10], ["support", 0.154, 0.112, 9], ["receipt", 0.231, 0.116, 16, -2],
      ["browse-phone", 0.316, 0.146, 24, -2, 0.96], ["browse-annotation", 0.4, 0.089, 5], ["supplies", 0.45, 0.081, 9, 2],
      ["cart-phone", 0.497, 0.139, 17, 2, 0.98], ["cart-annotation", 0.589, 0.077, 5], ["track-phone", 0.635, 0.119, 19, -1, 0.98],
      ["track-annotation", 0.72, 0.073, 5], ["delivery", 0.759, 0.054, 8], ["payoff", 0.797, 0.083, 14],
    ].forEach(([name, at, duration, y, rot = 0, scale = 1]) => {
      const els = sq(`[data-s="${name}"]`);
      if (name === "title") sTl.fromTo(els, { yPercent: y }, { yPercent: 0, duration }, at);
      else sTl.fromTo(els, { autoAlpha: 0, y, rotation: rot, scale, ...(name === "payoff" ? { clipPath: "inset(0 0 100% 0)" } : {}) }, { autoAlpha: 1, y: 0, rotation: 0, scale: 1, ...(name === "payoff" ? { clipPath: "inset(0 0 0% 0)" } : {}), duration }, at);
    });
    [["browse", 0.46, 0.06], ["cart", 0.62, 0.05], ["track", 0.75, 0.05], ["payoff", 0.86, 0.06]].forEach(([k, at, d]) =>
      sTl.fromTo(sq(`[data-s-ink="${k}"]`), { strokeDashoffset: 1, autoAlpha: 0 }, { strokeDashoffset: 0, autoAlpha: 1, duration: d, ease: "none" }, at));
    sTl.to({}, { duration: 0.1855 }, 0.88);

    // 03 — 3.3 screens. The path is drawn only up to the spot where each step dot lights up
    const nab = document.getElementById("work-nabiji");
    const nq = gsap.utils.selector(nab);
    const nTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: { id: "nabiji-flow", trigger: nab, start: "top top", end: () => `+=${iPin(3.3 * 900)}`, pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: readyAt(3, 0.94) },
    });
    [
      ["index", 0, 0.022, 0, 8], ["title", 0.014, 0.076, 0, 16, 0, 1, true], ["description", 0.07, 0.04, 0, 10], ["metadata", 0.09, 0.038, 0, 8],
      ["wash", 0.115, 0.08, 0, 0], ["student", 0.119, 0.115, 18, 38, 1.2, 0.972], ["student-label", 0.196, 0.045, 0, 10],
      ["lesson-watch", 0.238, 0.02, 0, 6], ["lesson-read", 0.258, 0.02, 0, 6], ["lesson-quiz", 0.272, 0.024, 0, 6],
      ["step-1", 0.292, 0.03, 0, 8], ["step-2", 0.41, 0.03, 0, 8], ["step-3", 0.531, 0.032, 0, 8],
      ["business", 0.565, 0.075, -26, 16, -1.4, 0.972], ["business-label", 0.612, 0.042, 0, 10],
      ["step-4", 0.739, 0.034, 0, 8], ["step-5", 0.858, 0.034, 0, 8],
      ["payoff-line1", 0.896, 0.032, 0, 14, 0, 1, true], ["payoff-line2", 0.918, 0.032, 0, 14, 0, 1, true],
    ].forEach(([name, at, duration, x, y, rot = 0, scale = 1, masked = false]) => {
      const from = { autoAlpha: 0, x, y };
      const to = { autoAlpha: 1, x: 0, y: 0, duration, ease: name === "student" || name === "business" ? "power2.inOut" : "power2.out" };
      if (rot) { from.rotation = rot; to.rotation = 0; }
      if (scale !== 1) { from.scale = scale; to.scale = 1; }
      if (masked) { from.clipPath = "inset(0 0 100% 0)"; to.clipPath = "inset(0 0 0% 0)"; }
      nTl.fromTo(nq(`[data-n="${name}"]`), from, to, at);
    });
    const mask = nq(".w-nabiji__mask")[0];
    const len = mask.getTotalLength();
    const lead = nq(".w-nabiji__lead")[0];
    const leadLen = lead.getTotalLength();
    nTl.fromTo(lead, { strokeDasharray: leadLen, strokeDashoffset: leadLen }, { strokeDashoffset: 0, duration: 0.03, ease: "none" }, 0.27);
    [[0, 0, 0.292], [0, 0.22, 0.41], [0.22, 0.48, 0.531], [0.48, 0.74, 0.739], [0.74, 1, 0.858]].forEach(([from, to, at], i) =>
      nTl.fromTo(mask, { strokeDasharray: len, strokeDashoffset: len * (1 - from) }, { strokeDashoffset: len * (1 - to), duration: 0.04, ease: "none", immediateRender: i === 0 }, at));
    nTl.fromTo(nq('[data-n-ink="payoff"]'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.04, ease: "none" }, 0.94).to({}, { duration: 0.198 }, 0.978);

    // 04 — 6220px. One-line typing → send → send fails → the chat window recedes, the world opens and the number counts up
    const rv = document.getElementById("work-letters");
    const rq = gsap.utils.selector(rv);
    const typed = rq('[data-r="typed"]')[0];
    const line = rq(".w-chat__out .w-chat__bubble")[0].textContent;
    const counters = rq("[data-count]");
    counters.forEach((c) => (c.textContent = "0"));
    const typing = { n: 0 };
    // Original table (6220px): chat window (0, 300) → typing (300, 1100) → sent (1400·1500) → not delivered (1900) → chat window fades and recedes (2450, 450)
    // → label (2700~2850) → description (3000) → large speech bubble (3300) → number 41K (3500, counts for 700) → pieces·image → 34K (4500) → pause (5350, 650) → world lifts away (6000, 220)
    const rvTl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: rv, start: "top top", end: () => `+=${iPin(6220)}`, pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: readyAt(4, 5250 / 6220) },
      onUpdate: () => {
        const t = rvTl.time();
        counters[0] && (counters[0].textContent = compact(Number(counters[0].dataset.count) * gsap.utils.clamp(0, 1, (t - 3500) / 700)));
        counters[1] && (counters[1].textContent = compact(Number(counters[1].dataset.count) * gsap.utils.clamp(0, 1, (t - 4500) / 700)));
        typed.textContent = t >= 1550 ? "" : line.slice(0, Math.floor(typing.n));
      },
    });
    const rise = (els, at, dur, y) => els.forEach((el) => rvTl.fromTo(el, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: dur, immediateRender: false }, at));
    rvTl.fromTo(rq('[data-r="conversation"]'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 300 }, 0)
      .fromTo(typing, { n: 0 }, { n: line.length, duration: 1100, immediateRender: false }, 300)
      .fromTo(rq('[data-r="send"]'), { opacity: 0.55 }, { opacity: 1, duration: 100 }, 1400)
      .fromTo(rq('[data-r="caret"]'), { visibility: "visible" }, { visibility: "hidden", duration: 0.01, immediateRender: false }, 1550)
      .fromTo(rq('[data-r="outgoing"]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 2, duration: 250 }, 1500)
      .to(rq('[data-r="outgoing"]'), { y: 0, duration: 150 }, 1750)
      .fromTo(rq('[data-r="fail"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 250 }, 1900)
      .to(rq('[data-r="intro"]'), { autoAlpha: 0, scale: 0.96, filter: "blur(2px)", duration: 450 }, 2450);
    const [frag1, frag2] = rq('[data-r="frag"]');
    const [note, kind, stack] = rq('[data-r="own"]');
    rise(rq('[data-r="logo"]'), 2700, 300, 8);
    rise(rq('[data-r="index"]'), 2775, 200, 4);
    rise(rq('[data-r="link"]'), 2850, 200, 4);
    rise(rq('[data-r="desc"]'), 3000, 400, 6);
    rise(rq('[data-r="lead"]'), 3300, 450, 22);
    rise(rq('[data-r="metric"]'), 3500, 180, 8);
    rise([note], 3750, 250, 7);
    rise([kind], 3925, 175, 7);
    rise([stack], 4000, 200, 7);
    rise([frag1, rq(".w-rv__hearts")[0]], 3950, 275, 16);
    rise(rq(".w-rv__girl"), 4150, 250, 10);
    rise([frag2], 4300, 200, 16);
    rise(rq('[data-r="usage"]'), 4500, 160, 6);
    rise(rq(".w-rv__envelope"), 4900, 300, 17);
    rise(rq(".w-rv__bandage"), 5000, 250, 10);
    rise(rq(".w-rv__eye"), 5150, 200, 10);
    rvTl.to({}, { duration: 650 }, 5350)
      .fromTo(rq('[data-r="world"]'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 220, immediateRender: false }, 6000);

    // 05 — 5428px (original table). A quietly placed notebook (0~180) → the cover turns and opens (180, 820, smoothstep) → notes are written at 196 intervals (952~3696)
    // → reading pause (3892, 380) → covered (4272, 600) → rest (4872, 72) → set aside (4944, 96 power1.in) → descend (5040, 220)
    // → Meanwhile the footer inside the stage is revealed from the top: 14px (5080, 88) → up to the band (5260, 72) → all of it (5332, 96 power1.out)
    const nb = document.getElementById("journal");
    const book = nb.querySelector(".nb__book");
    const leaf = nb.querySelector(".nb__leaf");
    const writing = [...nb.querySelectorAll(".nb__left [data-w]"), ...nb.querySelectorAll(".nb__right [data-w]")];
    const foot = document.getElementById("contact");
    const strip = foot.querySelector(".i-closing__strip");
    const footHome = foot.nextSibling;
    nb.append(foot);
    foot.classList.add("is-staged");
    const page = { p: 0 };
    const clamp = gsap.utils.clamp(0, 1);
    const smooth = (e) => e * e * (3 - 2 * e);
    gsap.set(book, { autoAlpha: 0, xPercent: -21, y: 50, scale: 0.94, rotation: -2, transformOrigin: "51% 50%" });
    gsap.set(writing, { "--p": 0 });
    gsap.set(foot, { clipPath: `inset(0 0 ${foot.offsetHeight}px 0)` });
    const nbTl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { id: "notebook-epilogue", trigger: nb, start: "top top", end: () => `+=${iPin(5428)}`, pin: true, scrub: true, invalidateOnRefresh: true } });
    // One open amount sets cover angle, book shift, tilt and spring together — the book only comes to center once the cover passes halfway
    nbTl.eventCallback("onUpdate", () => {
      const e = clamp(page.p), r = Math.PI * (1 - e), n = Math.max(0, Math.cos(r)), t = nbTl.time();
      gsap.set(leaf, { rotationY: -180 * e, z: 6 + 16 * Math.sin(r) });
      gsap.set(book, { xPercent: -21 * (1 - n), rotation: -2 * (1 - e) });
      if (t >= 180 && t <= 4944) gsap.set(book, { y: 6 * (1 - e) });
      nb.style.setProperty("--spiral", smooth(clamp((e - 0.2) / 0.42)));
    });
    nbTl.to(book, { autoAlpha: 1, y: 6, scale: 1, duration: 180 }, 0)
      .fromTo(page, { p: 0 }, { p: 1, duration: 820, ease: smooth, immediateRender: false }, 180);
    writing.forEach((el, i) => nbTl.fromTo(el, { "--p": 0 }, { "--p": 1, duration: 96, immediateRender: false }, 952 + i * 196));
    nbTl.to({}, { duration: 380 }, 3892)
      .fromTo(page, { p: 1 }, { p: 0, duration: 600, ease: (e) => 0.22 * e * e + smooth(e) * 0.78, immediateRender: false }, 4272)
      .to(leaf.querySelector(".nb__cover"), { "--cover-gray": 0, duration: 400 }, 4472)
      .to({}, { duration: 72 }, 4872)
      .to(book, { x: 48, y: 130, scale: 0.94, duration: 96, ease: "power1.in" }, 4944)
      .to(book, { y: () => nb.clientHeight / 2 + 0.94 * book.offsetHeight * 0.412 + 18, duration: 220 }, 5040)
      .fromTo(foot, { clipPath: () => `inset(0 0 ${foot.offsetHeight}px 0)` }, { clipPath: () => `inset(0 0 ${Math.max(0, foot.offsetHeight - 14)}px 0)`, duration: 88, immediateRender: false }, 5080)
      .to(foot, { clipPath: () => `inset(0 0 ${Math.max(0, foot.offsetHeight - strip.offsetHeight - 24)}px 0)`, duration: 72 }, 5260)
      .to(foot, { clipPath: "inset(0 0 0px 0)", duration: 96, ease: "power1.out" }, 5332);

    return () => {
      foot.classList.remove("is-staged");
      gsap.set(foot, { clearProps: "clipPath" });
      nb.parentNode.insertBefore(foot, footHome);
      nb.style.removeProperty("--spiral");
      gsap.set(".nb [data-w]", { clearProps: "all" });
      counters.forEach((c) => (c.textContent = compact(Number(c.dataset.count))));
    };
  });
})();
