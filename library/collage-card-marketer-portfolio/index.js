// Home: loading strip → hero words bounce up and byline types in → handwritten quote strokes → category list blur-pinned → card stack pinned → question card → lined repetition-sheet rows and a red word
(() => {
  const { reduced, fine } = WR;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const site = CustomEase.create("wrSite", "0.22, 1, 0.36, 1");
  const wide = matchMedia("(min-width: 810px)").matches;

  // ---------- Loading + Hero ----------
  const pre = $(".wr-pre"), hero = $(".hero");
  const byline = $(".hero__byline");
  byline.innerHTML = [...byline.dataset.type].map((c) => `<span>${c === " " ? "&nbsp;" : c}</span>`).join("");
  // Subtitle typing: after all three words have risen (3 × 60ms + .6s), follow the original typing schedule — first character 333/2.5ms, then 50·67·67·67·33·67·83·50·67ms cycled and divided by 2.5 for the interval, spaces 200/2.5ms
  const GAPS = [50, 67, 67, 67, 33, 67, 83, 50, 67];
  const schedule = (text) => { let t = 333 / 2.5, k = 0; return [...text].map((c, i) => (i > 0 && (t += (c === " " ? 200 : GAPS[k++ % GAPS.length]) / 2.5), Math.round(t))); };
  const typeByline = () => { const at = schedule(byline.dataset.type); $$("span", byline).forEach((s, i) => setTimeout(() => s.classList.add("on"), reduced ? 0 : at[i])); };
  const startHero = () => {
    hero.classList.add("is-live");
    setTimeout(typeByline, reduced ? 0 : 3 * 60 + 600);
  };
  // Original cut table — words and photos alternate, speeding up from 420ms to 60ms. full fills the screen width, accent uses an accent-color background, flip mirrors left-right, invert inverts the photo
  const W5 = pre.dataset.words.split(" ");
  const CUTS = [[420, 0], [360, "drive"], [310, 1], [270, "scarf"], [230, 2], [200, "paris"], [170, 3], [150, "porsche"], [190, 4, "full"], [110, "drive"], [90, 0], [80, "scarf", "flip"], [70, 1], [60, "paris"],
    [60, 2, "accent"], [60, "porsche"], [60, 3], [60, "drive", "flip"], [60, 4], [60, "scarf", "invert"], [60, 0, "accent"], [60, "paris"], [60, 1], [60, "porsche"], [60, 2], [60, "drive", "invert"], [60, 3, "accent"], [60, "scarf"], [60, 4], [60, "paris"], [60, 0, "accent"]];
  // Photo focus (fx·fy) and ratio — scaled to cover the screen, shifted so the focus is centered
  const PHOTO = { drive: [.7, .62, 1600 / 2082], porsche: [.6, .68, 1600 / 2304], scarf: [.55, .5, 1600 / 1928], paris: [.35, .45, 1600 / 1779] };
  const shouldPlay = () => {
    const nav = performance.getEntriesByType("navigation")[0];
    if (new URLSearchParams(location.search).has("preloader")) return true;
    if (nav?.type === "back_forward") return false;
    if (nav?.type === "reload") return true;
    try { return new URL(document.referrer).origin !== location.origin; } catch { return true; }
  };
  const finish = () => { pre.remove(); WR.smoother?.paused(false); document.documentElement.style.overflow = ""; WR.setReady(); startHero(); };
  if (!shouldPlay()) finish();
  else {
    WR.smoother?.paused(true);
    document.documentElement.style.overflow = "hidden";
    const probe = Object.assign(document.createElement("span"), { className: "wr-pre__word wr-pre__probe" });
    const frame = Object.assign(document.createElement("div"), { className: "wr-pre__frame" });
    const bars = ["is-top", "is-bot"].map((k) => Object.assign(document.createElement("span"), { className: `wr-pre__bar ${k}` }));
    pre.append(frame, probe, ...bars);
    const cap = () => { const c = document.createElement("canvas").getContext("2d"); c.font = `400 100px ${getComputedStyle(probe).fontFamily}`; return c.measureText("H").actualBoundingBoxAscent / 100 || .79; };
    const fitTo = (word, width) => { probe.style.fontSize = "100px"; probe.textContent = word; return 100 * width / (probe.getBoundingClientRect().width || 1); };
    const paint = ([, what, mod], W, H) => {
      frame.replaceChildren(); frame.className = "wr-pre__frame";
      if (typeof what === "number") {
        if (mod === "accent") frame.classList.add("is-accent");
        const w = W5[what] || "", el = Object.assign(document.createElement("span"), { className: "wr-pre__word", textContent: w });
        el.style.fontSize = `${mod === "full" ? Math.min(fitTo(w, W), H / cap()) : Math.min(fitTo(w, .9 * W), .76 * H / cap())}px`;
        frame.append(el);
        return;
      }
      const [fx, fy, ratio] = PHOTO[what], cut = Object.assign(document.createElement("div"), { className: "wr-pre__cut wf-img wr-shot is-bw" });
      cut.dataset.label = pre.dataset[`photo${what[0].toUpperCase()}${what.slice(1)}`];
      // The photo is sized to cover the screen and shifted so its focus sits at the screen center — the placeholder box also stands at that spot and size
      const k = Math.max(W / (1600), H / (1600 / ratio)), cw = 1600 * k, ch = 1600 / ratio * k;
      const left = Math.min(0, Math.max(W - cw, W / 2 - fx * cw)), topp = Math.min(0, Math.max(H - ch, H / 2 - fy * ch));
      Object.assign(cut.style, { inset: "auto", left: `${left}px`, top: `${topp}px`, width: `${cw}px`, height: `${ch}px` });
      cut.style.setProperty("--grain-x", `${Math.floor(256 * Math.random())}px`);
      cut.style.setProperty("--grain-y", `${Math.floor(256 * Math.random())}px`);
      if (mod === "flip") cut.style.transform = "scaleX(-1)";
      if (mod === "invert") cut.style.filter = "invert(1)";
      frame.append(cut);
    };
    // Sound: off at first, pressing it or hitting a key plays a shutter sound (four band noises) at each remaining photo cut
    let audio = null;
    const shutter = (start) => {
      try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
      audio.resume().then(() => {
        const ctx = audio, out = ctx.createGain(); out.gain.value = .8 * 1.9; out.connect(ctx.destination);
        const n = Math.round(ctx.sampleRate), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = 2 * Math.random() - 1;
        const tick = (t, f, q, g, dur) => {
          const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), env = ctx.createGain();
          src.buffer = buf; bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q;
          env.gain.setValueAtTime(1e-4, t); env.gain.exponentialRampToValueAtTime(g, t + 8e-4); env.gain.exponentialRampToValueAtTime(1e-4, t + dur);
          src.connect(bp).connect(env).connect(out); src.start(t, .8 * Math.random()); src.stop(t + dur + .02);
        };
        let t = ctx.currentTime + .03, at = 0;
        CUTS.forEach(([ms, what]) => {
          if (at >= start && typeof what === "string") { const a = Math.min(.045, .45 * ms / 1000); tick(t, 3800, 6, 1.4, .018); tick(t, 900, 3, .8, .012); tick(t + a, 2400, 5, 1, .025); tick(t + a, 600, 2, .6, .02); }
          if (at >= start) t += ms / 1000;
          at += ms;
        });
      }, () => {});
    };
    const run = () => {
      const W = innerWidth, H = innerHeight, t0 = performance.now(), starts = [];
      pre.classList.add("is-on");
      const hint = document.createElement("div");
      hint.className = "wr-pre__unmute";
      if (matchMedia("(hover: none)").matches) hint.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';
      else hint.textContent = "Press to turn sound on";
      pre.append(hint);
      const unmute = () => { removeEventListener("pointerdown", unmute, true); removeEventListener("keydown", unmute, true); hint.remove(); shutter(performance.now() - t0 + 40); };
      addEventListener("pointerdown", unmute, true); addEventListener("keydown", unmute, true);
      let at = 0;
      CUTS.forEach((c) => { starts.push(at); setTimeout(() => paint(c, W, H), at); at += c[0]; });
      const total = at, big = CUTS.findIndex((c) => c[2] === "full"), closeFrom = starts[big] + CUTS[big][0];
      // From after the last big word ends until the end, the band closes by (1 − cos πp)/2
      const close = () => {
        const p = Math.min(Math.max(0, performance.now() - t0 - closeFrom) / (total - closeFrom), 1);
        gsap.set(bars, { scaleY: (1 - Math.cos(p * Math.PI)) / 2 });
        if (p < 1) requestAnimationFrame(close);
      };
      requestAnimationFrame(close);
      setTimeout(() => hint.remove(), Math.max(0, total + 1020 - 2000));
      setTimeout(() => {
        removeEventListener("pointerdown", unmute, true); removeEventListener("keydown", unmute, true);
        gsap.set(bars, { scaleY: 1 }); frame.remove(); probe.remove();
        gsap.timeline({ onComplete: finish })
          .to(bars[0], { yPercent: -100, duration: .9, ease: "power4.out" }, .12)
          .to(bars[1], { yPercent: 100, duration: .9, ease: "power4.out" }, "<");
      }, total);
    };
    if (reduced) {
      paint(CUTS[CUTS.length - 1], innerWidth, innerHeight); pre.append(...bars); gsap.set(bars, { scaleY: .24 });
      setTimeout(() => gsap.to(pre, { opacity: 0, duration: .4, ease: "none", onComplete: finish }), 1400);
    } else Promise.race([document.fonts ? document.fonts.load(`400 100px ${getComputedStyle(probe).fontFamily}`) : Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(run);
  }

  // Name placeholder: pressing turns it into an input, on Enter or outside click the typed name merges into large type.
  // Font size is multiplied by --fit (1 → .3) so it doesn’t exceed the hero inner width (margins excluded) — original formula
  const slot = $(".hero__slot");
  const fit = () => {
    const cur = document.querySelector(".hero__slot");
    if (!cur) return;
    const w = cur.parentElement, h = cur.closest(".hero");
    w.style.setProperty("--fit", "1");
    const r = cur.getBoundingClientRect(), b = h.getBoundingClientRect(), cs = getComputedStyle(h);
    if (!r.width) return;
    const lo = b.left + parseFloat(cs.paddingLeft), hi = b.right - parseFloat(cs.paddingRight);
    w.style.setProperty("--fit", String(Math.max(.3, Math.min(1, (hi - r.left) / r.width, (r.right - lo) / r.width))));
  };
  addEventListener("resize", fit);
  document.fonts?.ready.then(fit);
  // Pressing turns the button ‹{{ Input field }}Swaps in an edit group in place of the button (the original also removes the button and inserts an edit group), and Enter or an outside click turns it back into the button — if a name exists it merges into large text. Input width is the character count (min 1)
  let name = "";
  const button = () => {
    const b = document.createElement("button");
    b.className = "hero__slot"; b.type = "button";
    b.innerHTML = name ? name : '{{ first name<i class="hero__caret"></i> }}';
    b.addEventListener("click", edit);
    return b;
  };
  function edit(e) {
    // The original name paragraph is a grid cell, so its size stays the same when it turns into an edit field. While editing, pin it to the current size.
    const para = e.currentTarget.parentElement, box = para.getBoundingClientRect();
    Object.assign(para.style, { width: `${box.width}px`, height: `${box.height}px` });
    const wrap = document.createElement("span");
    wrap.className = "hero__edit";
    wrap.innerHTML = '{{ <input aria-label="Name" maxlength="20"> }}';
    e.currentTarget.replaceWith(wrap);
    const input = wrap.querySelector("input");
    input.value = name; input.style.setProperty("--len", Math.max(1, name.length));
    input.focus();
    input.addEventListener("input", () => input.style.setProperty("--len", Math.max(1, input.value.length)));
    input.addEventListener("keydown", (k) => { if (k.key === "Enter") input.blur(); if (k.key === "Escape") { input.value = name; input.blur(); } });
    input.addEventListener("blur", () => {
      name = input.value.trim().slice(0, 20);
      const b = button();
      wrap.replaceWith(b);
      Object.assign(para.style, { width: "", height: "" });
      b.parentElement.classList.toggle("display", !!name);
      b.parentElement.classList.toggle("is-merged", !!name);
      fit();
    }, { once: true });
  }
  slot.addEventListener("click", edit);

  // ---------- Handwritten quote ----------
  // Red scratches around the edge: zigzag lines drawn in place beforehand, scratched on in .42s steps when the section is visible
  const scr = $(".bq__scribbles");
  const SPOTS = [[.08, .18, 90, 28], [.86, .14, 70, 40], [.14, .74, 80, 24], [.8, .7, 100, 30], [.5, .08, 60, 22], [.3, .88, 70, 26], [.92, .45, 50, 60], [.04, .46, 44, 70]];
  SPOTS.forEach(([x, y, w, h], i) => {
    const zig = Array.from({ length: 7 }, (_, k) => `${(k / 6) * w},${k % 2 ? h : 0}`).join(" L");
    scr.insertAdjacentHTML("beforeend", `<svg viewBox="-4 -4 ${w + 8} ${h + 8}" style="left:${x * 100}%;top:${y * 100}%;width:${w}px;height:${h}px;transform:rotate(${(i * 37) % 50 - 25}deg)"><path d="M${zig}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`);
  });
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: ".bq", start: "top 55%" } })
      .to(".bq__line", { clipPath: "inset(0 0% 0 0)", duration: .7, stagger: .22, ease: "power1.inOut" })
      .to(".bq__scribbles path", { strokeDashoffset: 0, duration: .42, stagger: .12, ease: "steps(7)" }, .4);

    // ---------- Field list ----------
    if (wide) {
      const fold = $(".sfold__fold"), list = $(".sfold__list");
      const start = () => fold.clientHeight * .8 - list.offsetTop;
      const end = () => list.offsetTop + list.offsetHeight;
      gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: fold, start: "top top", end: () => `+=${Math.round(start() + end())}`, pin: true, anticipatePin: 1, scrub: true, invalidateOnRefresh: true } })
        .fromTo(list, { y: () => start() }, { y: () => -end(), duration: 1 });
      // Per line: blurry·transparent at .8 screen height → sharp at .38 height (the 3px blur clears in the last 15%).
      const words = $$(".sfold__w");
      const blur = () => {
        const H = fold.clientHeight, top = fold.getBoundingClientRect().top;
        words.forEach((w) => {
          const y = w.parentElement.getBoundingClientRect().top - top;
          const p = Math.min(1, Math.max(0, (H * .8 - y) / (H * .42)));
          w.style.opacity = p;
          w.style.setProperty("--b", p > .85 ? 0 : 3);
        });
      };
      ScrollTrigger.create({ trigger: fold, start: "top bottom", end: () => `+=${Math.round(start() + end() + innerHeight)}`, onUpdate: blur, onRefresh: blur });
    } else {
      $$(".sfold__w").forEach((w) => (w.style.opacity = 1));
    }

    // ---------- Work pile ----------
    if (wide) {
      const fold = $(".wstrip__fold"), tiles = $$(".wtile");
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: fold, start: "top top", end: () => `+=${Math.round(.6 * tiles.length * fold.clientHeight)}`, pin: true, anticipatePin: 1, scrub: true, invalidateOnRefresh: true } });
      tiles.forEach((t) => tl.fromTo(t, { y: () => fold.clientHeight - t.offsetTop }, { y: 0, duration: 1 }));
      gsap.fromTo(".wstrip__head", { opacity: 0, yPercent: 24 }, { opacity: 1, yPercent: 0, duration: .55, ease: site, scrollTrigger: { trigger: fold, start: "top 60%" } });
    }

    // ---------- Question cards ----------
    $$(".faq__card").forEach((c, i) => gsap.from(c, { y: 40, autoAlpha: 0, duration: .9, ease: site, delay: (i % 3) * .08, scrollTrigger: { trigger: c, start: "top 88%" } }));
    gsap.from(".faq__title", { yPercent: 30, autoAlpha: 0, duration: 1, ease: site, scrollTrigger: { trigger: ".faq", start: "top 75%" } });

    // ---------- Scribble lines ----------
    gsap.to(".hli__red", { scale: 1, duration: .8, stagger: .14, ease: CustomEase.create("wrPop", "0.34, 1.56, 0.64, 1"), scrollTrigger: { trigger: ".hli", start: "top 45%" } });
  });

  // Scribble row: repeat one line of the same handwriting to screen height, with tilt and size jitter growing toward the bottom (seed random 5)
  const lines = $(".hli__lines");
  const drawLines = () => {
    lines.innerHTML = "";
    const W = lines.clientWidth, H = lines.clientHeight, landscape = W > H;
    let seed = 5;
    const rnd = () => { let e = (seed = (seed + 0x6d2b79f5) >>> 0); e = Math.imul(e ^ (e >>> 15), 1 | e); e ^= e + Math.imul(e ^ (e >>> 7), 61 | e); return ((e ^ (e >>> 14)) >>> 0) / 4294967296; };
    const pad = Math.max(16, .04 * W), u = W - 2 * pad, lh = 307 * u / 2152;
    // One line of handwriting: imitation cursive with connected loops (newly drawn path)
    let d = "M0 40";
    for (let x = 0; x < 2100; x += 46) d += ` c10 -38 26 -38 22 0 s-14 20 0 10 c8 -6 14 -14 24 -10`;
    for (let i = 0, y = pad; y + .6 * lh < H - pad; i++) {
      const r = Math.min(1, i / (landscape ? 14 : 24));
      lines.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 2152 120" style="top:${y}px;left:${pad + (rnd() - .5) * r * W * .05}px;width:${u}px;height:${lh}px;rotate:${(rnd() - .5) * (.6 + r * (landscape ? 6 : 2))}deg;scale:${1 + (rnd() - .3) * r * (landscape ? .18 : .06)}"><path d="${d}"/></svg>`);
      y += lh * (landscape ? .5 - r * .2 : .72 - r * .08);
    }
  };
  drawLines();
  addEventListener("resize", drawLines);
})();
