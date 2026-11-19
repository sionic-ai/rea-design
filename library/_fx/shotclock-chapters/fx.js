// Section clock — two LED digits in basketball shot clock style (5×7 dots) count down 24 → 0 seconds over a set scroll range, while the current section name shuffles as it changes.
// Once past 5s going down, the one decimal digit · ticks turn accent colored, past the end of the segment it blinks three times like a buzzer and folds. Pressing unfolds the section list upward
(() => {
  const DIGITS = {
    0: "01110100011000110001100011000101110", 1: "00100011000010000100001000010001110", 2: "01110100010000100010001000100011111",
    3: "11110000010000101110000010000111110", 4: "00010001100101010010111110001000010", 5: "11111100001111000001000011000101110",
    6: "00110010001000011110100011000101110", 7: "11111000010001000100010000100001000", 8: "01110100011000101110100011000101110",
    9: "01110100011000101111000010001001100",
  };
  const NOISE = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]*+=-";
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const pad = (n) => String(n).padStart(2, "0");

  kfFx.register("shotclock-chapters", (el, { options, reduce, hover }) => {
    const links = [...el.querySelectorAll('[data-fx-part="chapter"]')];
    if (!links.length) return;
    const chapters = links.map((a) => ({ name: a.textContent.trim(), target: document.querySelector(a.getAttribute("href")) }));
    const original = el.innerHTML;
    const last = chapters.length - 1, SECS = Math.max(1, +(options.secs ?? 24));
    el.style.setProperty("--fx-sc-name", Math.max(...chapters.map((c) => c.name.length)));
    const dots = (n) => "<i></i>".repeat(n);
    el.innerHTML = `
      <ol class="fx-sc__log">${chapters.map((c, i) => `<li class="fx-sc__entry" style="--i:${last - i}"><a class="fx-sc__row" href="${links[i].getAttribute("href")}" data-go="${i}" tabindex="-1"><b>${pad(i + 1)}</b>${c.name}</a></li>`).join("")}</ol>
      <div class="fx-sc__face">
        <span class="fx-sc__led" aria-hidden="true"><span class="fx-sc__digit">${dots(35)}</span><span class="fx-sc__point">${dots(7)}</span><span class="fx-sc__digit">${dots(35)}</span></span>
        <span class="fx-sc__meta"><span class="fx-sc__name"></span><span class="fx-sc__count"></span></span>
        <button class="fx-sc__toggle" type="button" aria-expanded="false" aria-label="View all sections"><span class="fx-sc__arrow" aria-hidden="true"></span></button>
        <span class="fx-sc__ticks" aria-hidden="true">${Array.from({ length: 24 }, (_, k) => `<i style="--k:${k}"></i>`).join("")}</span>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const face = $(".fx-sc__face"), log = $(".fx-sc__log"), toggle = $(".fx-sc__toggle");
    const rows = [...el.querySelectorAll("[data-go]")], [dA, dB] = el.querySelectorAll(".fx-sc__digit");
    const point = $(".fx-sc__point"), ticks = [...el.querySelectorAll(".fx-sc__ticks i")], nameEl = $(".fx-sc__name"), countEl = $(".fx-sc__count");
    const g = { tops: [], start: 1, end: 2, max: 1 };
    let state = "init", cur = -1, shown = "", raf = 0, preview = -1, live = SECS, val = SECS, anim = 0, scr = 0;
    const fromEl = () => (options.from ? document.querySelector(options.from) : chapters[1]?.target) || chapters[0].target;
    const toEl = () => (options.to ? document.querySelector(options.to) : null);
    function measure() {
      const y = scrollY;
      g.tops = chapters.map((c) => (c.target ? c.target.getBoundingClientRect().top + y : 0));
      g.max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const f = fromEl();
      g.start = f ? f.getBoundingClientRect().top + y : 0;
      const t = toEl(), endAt = t ? t.getBoundingClientRect().top + y - innerHeight * 1.1 : g.max - 1;
      g.end = Math.max(g.start + innerHeight, Math.min(g.max - 1, endAt));
    }
    const topOf = (i) => (i === last ? g.max : clamp(g.tops[i], 0, g.max));
    const secAt = (y) => SECS * (1 - clamp((y - g.start) / (g.end - g.start)));
    const paint = (box, ch) => [...box.children].forEach((d, k) => d.classList.toggle("is-on", (DIGITS[ch] || DIGITS[0])[k] === "1"));
    function show(t) {
      val = t;
      const late = t < 5, s = late ? t.toFixed(1) : pad(Math.min(99, Math.ceil(t)));
      if (s !== shown) { shown = s; paint(dA, s[0]); paint(dB, late ? s[2] : s[1]); point.classList.toggle("is-on", late); }
      el.classList.toggle("is-late", late);
      const c = Math.ceil((t / SECS) * 24);
      ticks.forEach((tk, k) => tk.classList.toggle("is-on", k < c));
    }
    const stopAnim = () => { cancelAnimationFrame(anim); anim = 0; };
    function easeTo(to) {
      stopAnim();
      if (reduce) return show(to);
      const from = val, t0 = performance.now();
      const step = (now) => { const k = Math.min(1, (now - t0) / 380); show(from + (to - from) * (1 - Math.pow(1 - k, 3))); anim = k < 1 ? requestAnimationFrame(step) : 0; };
      anim = requestAnimationFrame(step);
    }
    function scramble(text) {
      cancelAnimationFrame(scr);
      if (reduce) { nameEl.textContent = text; return; }
      const t0 = performance.now();
      let lastF = -1, noise = [];
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 600), fixed = Math.floor((1 - (1 - k) ** 2) * text.length);
        if (now - lastF >= 33 || !noise.length) { lastF = now; noise = Array.from(text, (c) => (/\s/.test(c) ? c : NOISE[(Math.random() * NOISE.length) | 0])); }
        nameEl.textContent = [...text].map((c, i) => (i < fixed ? c : noise[i])).join("");
        scr = k < 1 ? requestAnimationFrame(step) : 0;
      };
      scr = requestAnimationFrame(step);
    }
    function label(i, mix) { countEl.textContent = `${pad(i + 1)} / ${pad(chapters.length)}`; if (mix) scramble(chapters[i].name); else { cancelAnimationFrame(scr); nameEl.textContent = chapters[i].name; } }
    function setChapter(i) {
      if (i === cur) return;
      const first = cur < 0;
      cur = i;
      if (preview < 0) label(i, !first && state === "live");
      rows.forEach((r) => (+r.dataset.go === i ? r.setAttribute("aria-current", "step") : r.removeAttribute("aria-current")));
    }
    const peek = (i) => { if (i === preview || state !== "live") return; preview = i; el.classList.add("is-preview"); label(i, true); easeTo(secAt(topOf(i))); };
    const unpeek = () => { if (preview < 0) return; preview = -1; el.classList.remove("is-preview"); if (state !== "live") return stopAnim(); label(cur, true); easeTo(live); };
    let buzzT = 0;
    function setState(s) {
      if (s === state) return;
      const prev = state;
      state = s;
      clearTimeout(buzzT);
      el.classList.remove("is-boot", "is-buzz");
      if (s === "live") { el.classList.add("is-on"); el.inert = false; if (!reduce) { void el.offsetWidth; el.classList.add("is-boot"); } return; }
      open(false);
      el.inert = true;
      if (s === "buzz" && prev === "live" && !reduce) { show(0); el.classList.add("is-buzz"); buzzT = setTimeout(() => el.classList.remove("is-on", "is-buzz"), 1150); }
      else el.classList.remove("is-on");
    }
    function update() {
      raf = 0;
      const y = window.lenis ? window.lenis.scroll : scrollY, probe = y + innerHeight * 0.4;
      let i = 0;
      g.tops.forEach((t, k) => { if (probe >= t) i = k; });
      if (y >= g.max - 2) i = last;
      if (y < g.start) return setState("off");
      if (y >= g.end) return setState(state === "live" || state === "buzz" ? "buzz" : "off");
      setState("live");
      setChapter(i);
      live = secAt(y);
      if (preview < 0) { stopAnim(); show(live); }
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    function open(on) {
      el.classList.toggle("is-open", on);
      toggle.setAttribute("aria-expanded", String(on));
      rows.forEach((r) => r.setAttribute("tabindex", on ? "0" : "-1"));
      if (!on) unpeek();
    }
    const ac = new AbortController(), sig = { signal: ac.signal };
    face.addEventListener("click", () => open(!el.classList.contains("is-open")), sig);
    const rowOf = (e) => e.target.closest("[data-go]");
    if (hover) log.addEventListener("pointerover", (e) => { if (rowOf(e)) peek(+rowOf(e).dataset.go); }, sig);
    log.addEventListener("pointerleave", unpeek, sig);
    log.addEventListener("focusin", (e) => { if (rowOf(e)) peek(+rowOf(e).dataset.go); }, sig);
    log.addEventListener("focusout", (e) => { if (!log.contains(e.relatedTarget)) unpeek(); }, sig);
    el.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); toggle.focus(); } }, sig);
    document.addEventListener("click", (e) => { if (!el.contains(e.target)) open(false); }, sig);
    el.addEventListener("click", (e) => {
      const r = rowOf(e);
      if (!r) return;
      e.preventDefault();
      open(false);
      const to = topOf(+r.dataset.go);
      if (window.lenis) window.lenis.scrollTo(to, reduce ? { immediate: true, force: true } : { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
      else scrollTo({ top: to, behavior: reduce ? "auto" : "smooth" });
    }, sig);
    addEventListener("scroll", queue, { passive: true, signal: ac.signal });
    const onLenis = () => queue();
    window.lenis?.on?.("scroll", onLenis);
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { measure(); update(); }, 150); };
    addEventListener("resize", onResize, sig);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    measure(); setState("off"); update();
    return () => {
      ac.abort(); ro.disconnect(); window.lenis?.off?.("scroll", onLenis);
      cancelAnimationFrame(raf); cancelAnimationFrame(anim); cancelAnimationFrame(scr); clearTimeout(buzzT); clearTimeout(rt);
      el.classList.remove("is-on", "is-open", "is-late", "is-boot", "is-buzz", "is-preview");
      el.inert = false;
      el.innerHTML = original;
    };
  });
})();
