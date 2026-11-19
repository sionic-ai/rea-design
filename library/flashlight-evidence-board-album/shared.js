// Lets the panel (index.js) and the veils on it talk only through event names, like the original — the veil doesn’t know the panel’s insides, and the panel doesn’t know the veil’s look.
(() => {
  const handlers = {};
  const bus = (window.mBus = {
    on(name, fn) { (handlers[name] ||= []).push(fn); return () => bus.off(name, fn); },
    off(name, fn) { handlers[name] = (handlers[name] || []).filter((f) => f !== fn); },
    emit(name, data = {}) { [...(handlers[name] || [])].forEach((f) => f({ event: name, ...data })); },
  });

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => matchMedia("(min-width: 64em) and (hover: hover)").matches;
  gsap.registerPlugin(SplitText, CustomEase, CustomWiggle);
  // Original blink curve: rough({ template: none.in, strength: 2, points: 10, taper: none, randomize: true, clamp: true })
  const rough = (points) => `rough({ template: none.in, strength: 2, points: ${points}, taper: none, randomize: true, clamp: true })`;
  window.mRough = rough;

  // Hand-drawn line — the original uses one long line wobbling about 1px for underlines, horizontal rules and dividers alike. Redrawn in the same style
  const shakyPath = (() => {
    let d = "M0 1", seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let x = 4; x <= 400; x += 4) d += ` L${x} ${(1 + (rnd() - 0.5) * 0.9).toFixed(2)}`;
    return d;
  })();
  // Like the original, swap the line span for a drawn svg, so the line receives clip-path on the svg itself.
  const SVG = "http://www.w3.org/2000/svg";
  const shaky = (root = document) => $$("[data-shaky]", root).forEach((el) => {
    const svg = document.createElementNS(SVG, "svg");
    [...el.attributes].forEach((a) => a.name !== "data-shaky" && svg.setAttribute(a.name, a.value));
    svg.setAttribute("class", `m-shaky ${el.getAttribute("class") || ""}`.trim());
    svg.setAttribute("viewBox", "0 0 400 2");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG, "path");
    path.setAttribute("d", shakyPath);
    svg.append(path);
    el.replaceWith(svg);
  });
  shaky();

  // Underline button: on hover the underline slides out to the right and the horizontal line draws from the left .4s power2.out, reversed on release
  const L = "inset(0% 100% 0% 0%)", FULL = "inset(0% 0% 0% 0%)", R = "inset(0% 0% 0% 100%)";
  const clip = (el, from, to, delay = 0) => el && gsap.fromTo(el, { clipPath: from }, { clipPath: to, duration: 0.4, delay, ease: "power2.out", overwrite: true });
  const onUline = (e) => {
    if (e.pointerType !== "mouse") return;
    const inner = e.target.closest?.(".m-uline__inner");
    if (!inner || inner.contains(e.relatedTarget)) return;
    const mask = $(".m-uline__mask", inner), cross = $(".m-uline__cross", inner);
    // Measuring the original, on raise the underline cover moves two frames (33ms) later than the horizontal line
    if (e.type === "pointerover") { clip(mask, FULL, R, 0.033); clip(cross, L, FULL); }
    else { clip(mask, L, FULL); clip(cross, FULL, R); }
  };
  document.addEventListener("pointerover", onUline);
  document.addEventListener("pointerout", onUline);

  // Horizontal-row buttons (sound · social · watch video)
  $$(".m-cross").forEach((btn) => {
    const line = $(".m-cross__line", btn);
    btn.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && clip(line, L, FULL));
    btn.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && clip(line, FULL, R));
  });
  // View video fades from .25 to 1 on hover, flickering on like a bulb (.35s)
  $$(".m-flicker").forEach((btn) => {
    let tw;
    btn.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      tw?.kill();
      tw = gsap.fromTo(btn, { opacity: 0.25 }, { opacity: 1, duration: 0.35, ease: rough(10), clearProps: "opacity" });
    });
    btn.addEventListener("pointerleave", () => { tw?.kill(); gsap.set(btn, { clearProps: "opacity" }); });
  });

  // Sound: there is no sound file. Only the on/off state and the text switch back and forth as in the original
  let soundOn = false;
  const setSound = (on) => {
    soundOn = on;
    $$("[data-sound-label]").forEach((el) => (el.textContent = on ? "On" : "Blink"));
    bus.emit("audio:status", { isMuted: !on });
  };
  $$("[data-sound-toggle]").forEach((b) => b.addEventListener("click", () => setSound(!soundOn)));

  // Text entrance — title letter by letter with .025s stagger over 1.25s, body word by word .03s later from .25 to 1 over .5s
  const splits = [];
  const revertSplits = () => { splits.splice(0).forEach((s) => s.revert()); };
  const titleIn = (tl, el, at) => {
    if (!el) return;
    const s = new SplitText(el, { type: "chars", smartWrap: true, tag: "span" });
    splits.push(s);
    gsap.set(s.chars, { opacity: 0 });
    tl.to(s.chars, { opacity: 1, stagger: { each: 0.025 }, duration: 1.25, ease: "power2.out", immediateRender: false }, at);
  };
  const wordsIn = (tl, el, at) => {
    if (!el) return;
    const s = new SplitText(el, { type: "words, chars" });
    splits.push(s);
    gsap.set(s.chars, { opacity: 0 });
    s.words.forEach((w, i) => {
      const chars = [...w.children];
      tl.set(chars, { opacity: 0.25, stagger: { each: 0.025 } }, at - 0.1 + i * 0.03);
      tl.fromTo(chars, { opacity: 0.25 }, { opacity: 1, stagger: { each: 0.025 }, duration: 0.5, ease: "power2.out", immediateRender: false }, at + i * 0.03);
    });
  };

  // Loader — as progress rises the number follows with 1s power2.out, and when full the warning layer shows .5s later
  const loader = $(".m-loader");
  const percent = $("[data-part=percent]", loader);
  const icon = $("[data-part=evidence-icon]", loader);
  const layers = { loading: $(".m-layer--loading", loader), disclaimer: $("[data-part=layer-disclaimer]"), audio: $("[data-part=layer-audio]") };
  let shown = 0, layerTl;
  const showLayer = (name) => {
    Object.entries(layers).forEach(([k, el]) => k !== name && el.classList.contains("is-visible") && hideLayer(el));
    const el = layers[name];
    if (name === "loading") { el.classList.add("is-visible"); return; }
    revertSplits();
    layerTl?.kill();
    el.classList.add("is-visible");
    gsap.set(el, { opacity: 1 });
    const row = $("[data-part=cta-row]", el);
    gsap.set(row, { opacity: 0 });
    layerTl = gsap.timeline({ delay: 0.5, onComplete: revertSplits });
    titleIn(layerTl, $("[data-split=chars]", el), 0);
    wordsIn(layerTl, $("[data-split=words]", el), 0.3);
    layerTl.to(row, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.8);
    $$(".m-uline", el).forEach((b, i) => layerTl.call(() => b.classList.add("is-line-visible"), null, 0.9 + i * 0.2));
    if (reduce) layerTl.progress(1);
  };
  const hideLayer = (el) => {
    if (el === layers.loading) { el.classList.remove("is-visible"); return; }
    gsap.to(el, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => el.classList.remove("is-visible") });
  };
  // Start — the loader curtain turns on with .3s power3.out (original LOADER_SHOW)
  if (!reduce) gsap.fromTo($(".m-loader__inner", loader), { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power3.out" });
  let progressDone = false;
  bus.on("loader:progress", ({ progress }) => {
    gsap.to({ v: shown }, {
      v: Math.round(progress * 100), duration: 1, ease: "power2.out",
      onUpdate() { shown = Math.round(this.targets()[0].v); percent.textContent = `${shown}%`; },
      onComplete() {
        if (progress >= 1 && !progressDone) {
          progressDone = true;
          gsap.delayedCall(0.5, () => { icon.classList.add("is-visible"); showLayer("disclaimer"); bus.emit("loader:disclaimer"); });
        }
      },
    });
  });
  $("[data-part=agree]").addEventListener("click", () => { showLayer("audio"); bus.emit("loader:audio"); });
  $$("[data-sound]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.sound === "on") setSound(true);
    hideLayer(layers.audio);
    loader.classList.remove("is-visible");
    bus.emit("loader:hide");
    gsap.timeline({ onComplete: () => icon.classList.remove("is-visible") })
      .to($(".m-loader__inner", loader), { opacity: 0, duration: 0.75, ease: "power3.out" }, 0)
      .to($(".m-loader__bg", loader), { opacity: 0, duration: 0.75, ease: "power3.out" }, 0)
      .call(() => bus.emit("loader:hide-complete"), null, 0.5);
  }));

  // Bottom strip: turns on once the panel is fully in, and the warning line drops out during the evidence window and the game
  const hudBits = $$("[data-hud], .m-audio--mobile");
  const disclaimer = $(".m-hud__disclaimer");
  bus.on("intro:complete", () => hudBits.forEach((el) => el.classList.add("is-visible")));
  const hideDisc = () => disclaimer.classList.remove("is-visible");
  const showDisc = () => disclaimer.classList.add("is-visible");
  bus.on("poi:in", hideDisc); bus.on("poi:out", showDisc); bus.on("game:open", hideDisc); bus.on("game:close", showDisc);

  // Guides — when the board enters, a drag guide shows (it disappears on press or after 10s), on first entering the game, a game guide shows (from .1s later, on press, or after 15s)
  const tips = $(".m-tips"), tipNav = $("[data-tip=controls]"), tipGame = $("[data-tip=game]");
  const syncTips = () => tips.classList.toggle("has-tips-visible", tipNav.classList.contains("is-visible") || tipGame.classList.contains("is-visible"));
  const tip = (el, wait, life) => {
    el.classList.add("is-visible"); syncTips();
    const off = () => { el.classList.remove("is-visible"); syncTips(); removeEventListener("mousedown", off); removeEventListener("touchstart", off); };
    gsap.delayedCall(wait, () => { addEventListener("mousedown", off, { once: true }); addEventListener("touchstart", off, { once: true }); });
    gsap.delayedCall(life, off);
  };
  bus.on("intro:complete", () => tip(tipNav, 0, 10));
  let gameTipShown = false;
  bus.on("game:open", () => { if (!gameTipShown) { gameTipShown = true; tip(tipGame, 0.1, 15); } });

  // Evidence window
  const poi = $(".m-poi");
  const P = (n) => $(`[data-part=${n}]`, poi);
  const items = Object.fromEntries($$("[data-poi]").map((li) => [li.dataset.poi, li]));
  let poiTl, poiId = null, arrowST;
  const fillPoi = (id, censored) => {
    const li = items[id];
    const n = Object.keys(items).indexOf(id) + 1;
    P("poi-eyebrow").textContent = `Evidence ${String(n).padStart(2, "0")}`;
    P("poi-title").textContent = censored ? "Censored Title Here" : $("h2", li).textContent;
    P("poi-desc").innerHTML = `<p class="m-text-content">${$("p", li).textContent} Your two-line second paragraph here.</p><p class="m-text-content">Don’t approach. If it recognizes you <a class="m-uline" href="#"><span class="m-uline__inner"><span>Here</span><span class="m-uline__mask"><span class="m-uline__under" data-shaky></span></span><span class="m-uline__cross" data-shaky></span></span></a> Please let us know by</p>`;
    shaky(P("poi-desc"));
    const rows = censored ? [] : [["Record", "0000.00.00"], ["Place", "Your place here"], ["In charge", "Your name here"]];
    P("poi-info").innerHTML = rows.map(([k, v]) => `<li class="m-info__item"><span class="m-info__label m-label-small">${k}</span><span class="m-info__value m-label-small">${v}</span></li>`).join("");
    P("poi-sep").style.display = rows.length ? "" : "none";
    P("poi-cta").hidden = !("video" in li.dataset);
    const img = P("poi-image");
    img.dataset.label = li.dataset.label || "Front-on photo of pressed paper";
    poi.style.setProperty("--image-ratio", li.dataset.kind === "photo" ? 0.66 : 0.76);
  };
  const openPoi = ({ id, isCensored }) => {
    poiId = id;
    fillPoi(id, isCensored);
    poi.classList.add("is-visible");
    poi.setAttribute("aria-hidden", "false");
    revertSplits();
    poiTl?.kill();
    const eyebrow = P("poi-eyebrow"), title = P("poi-title");
    const descs = $$(".m-text-content", poi), labels = $$(".m-info__label", poi), values = $$(".m-info__value", poi);
    poiTl = gsap.timeline({ delay: 0.15, onComplete: () => { revertSplits(); gsap.delayedCall(0.01, () => P("poi-col").classList.add("has-visible-links")); } });
    if (!isDesktop()) {
      poiTl.fromTo(P("poi-image"), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 0);
      poiTl.fromTo(P("poi-arrow"), { opacity: 0 }, { opacity: 1, duration: 1, ease: "power3.out" }, 0.3);
    }
    const sEye = new SplitText(eyebrow, { type: "chars", smartWrap: true, tag: "span" }); splits.push(sEye);
    gsap.set(sEye.chars, { opacity: 0 });
    poiTl.set(sEye.chars, { opacity: 0.25, stagger: { each: 0.025 } }, 0);
    poiTl.to(sEye.chars, { opacity: 1, stagger: { each: 0.025 }, duration: 0.5, ease: "power2.out", immediateRender: false }, 0.1);
    titleIn(poiTl, title, 0);
    descs.forEach((d, i) => wordsIn(poiTl, d, 0.3 + i * 0.15));
    if (P("poi-sep").style.display !== "none") poiTl.fromTo(P("poi-sep"), { clipPath: L }, { clipPath: FULL, duration: 0.5, ease: "power2.out" }, 0.5);
    [...labels, ...values].forEach((el, i) => {
      const s = new SplitText(el, { type: "chars", smartWrap: true, tag: "span" }); splits.push(s);
      gsap.set(s.chars, { opacity: 0 });
      const k = i % Math.max(1, labels.length);
      poiTl.set(s.chars, { opacity: 0.25, stagger: { each: 0.025 } }, 0.4 + k * 0.03);
      poiTl.fromTo(s.chars, { opacity: 0.25 }, { opacity: 1, stagger: { each: 0.025 }, duration: 0.5, ease: "power2.out", immediateRender: false }, 0.5 + k * 0.03);
    });
    if (!P("poi-cta").hidden) poiTl.fromTo(P("poi-cta"), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.6);
    if (reduce) poiTl.progress(1);
    if (!isDesktop()) {
      poi.scrollTo(0, 0);
      const fade = $(".m-poi__image-fade", poi);
      const tl = gsap.timeline({ paused: true })
        .fromTo(P("poi-image"), { yPercent: 0, scale: 1, opacity: 1 }, { yPercent: -10, scale: 1.5, opacity: 0.65, duration: 1, ease: "power1.inOut" }, 0)
        .fromTo(fade, { scaleY: 0.75, opacity: 0 }, { scaleY: 1.35, opacity: 1, duration: 0.5, ease: "power1.inOut" }, 0);
      let target = 0, cur = 0;
      const onScroll = () => {
        const max = poi.scrollHeight - poi.clientHeight;
        target = Math.min(1, poi.scrollTop / (poi.clientHeight * 0.25 || 1));
        P("poi-arrow").classList.toggle("is-end", max > 0 && poi.scrollTop >= max - 1);
      };
      const tick = () => { cur += (target - cur) * 0.25; tl.progress(cur); };
      poi.addEventListener("scroll", onScroll, { passive: true });
      gsap.ticker.add(tick);
      arrowST = () => { poi.removeEventListener("scroll", onScroll); gsap.ticker.remove(tick); tl.kill(); gsap.set([P("poi-image"), fade], { clearProps: "all" }); };
    }
  };
  const closePoi = () => {
    if (!poi.classList.contains("is-visible")) return;
    poi.classList.remove("is-visible");
    poi.setAttribute("aria-hidden", "true");
    P("poi-col").classList.remove("has-visible-links");
    arrowST?.(); arrowST = null;
    bus.emit("poi:out", { id: poiId });
  };
  bus.on("poi:in", openPoi);
  $("[data-poi-close]").addEventListener("click", closePoi);
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (video.classList.contains("is-visible")) closeVideo();
    else if (poi.classList.contains("is-visible")) closePoi();
    else if (game.classList.contains("is-visible")) bus.emit("game:close");
  });

  // Game act
  const game = $(".m-game"), success = $("[data-part=success]", game), complete = $("[data-part=complete]", game);
  bus.on("game:open", () => { game.classList.add("is-visible"); game.setAttribute("aria-hidden", "false"); });
  bus.on("game:close", () => { game.classList.remove("is-visible"); game.setAttribute("aria-hidden", "true"); success.classList.remove("is-visible"); complete.classList.remove("is-visible"); });
  $("[data-game-close]").addEventListener("click", () => bus.emit("game:close"));
  bus.on("game:success-content", ({ name }) => {
    $("[data-part=success-title]", success).textContent = name;
    success.classList.add("is-visible");
    revertSplits();
    const tl = gsap.timeline({ delay: 0.25, onComplete: revertSplits });
    titleIn(tl, $("[data-part=success-title]", success), 0);
    wordsIn(tl, $(".m-text-game", success), 0.2);
    tl.fromTo($(".m-border-btn", success), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.4);
  });
  $("[data-game-continue]").addEventListener("click", () => { success.classList.remove("is-visible"); bus.emit("game:success-continue"); });
  bus.on("game:completed", () => complete.classList.add("is-visible"));
  complete.addEventListener("click", () => bus.emit("game:close"));

  // Video curtain — it is a placeholder screen, so playback only runs the time bar (3 min 30 s)
  const video = $(".m-video"), prog = $("[data-part=video-progress]", video), time = $("[data-part=video-time]", video);
  const LEN = 210;
  let playing = false, pos = 0, idleCall;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const draw = () => { prog.style.setProperty("--progress", `${(pos / LEN) * 100}%`); $("input", prog).value = pos / LEN; time.textContent = fmt(pos); };
  const step = (_, dt) => { if (!playing) return; pos = Math.min(LEN, pos + dt / 1000); draw(); if (pos >= LEN) setPlay(false); };
  const setPlay = (on) => { playing = on; $("[data-play-label]", video).textContent = on ? "Pause" : "Play"; };
  const wake = () => { video.classList.remove("is-idle"); idleCall?.kill(); idleCall = gsap.delayedCall(2.5, () => playing && video.classList.add("is-idle")); };
  const openVideo = () => {
    $("[data-part=video-title]", video).textContent = P("poi-title").textContent;
    video.classList.add("is-visible"); video.setAttribute("aria-hidden", "false");
    pos = 0; draw(); setPlay(true); wake();
    gsap.ticker.add(step);
    bus.emit("video:open");
  };
  const closeVideo = () => {
    video.classList.remove("is-visible", "is-idle"); video.setAttribute("aria-hidden", "true");
    setPlay(false); gsap.ticker.remove(step); idleCall?.kill();
    bus.emit("video:close");
  };
  $("[data-video-open]").addEventListener("click", openVideo);
  $("[data-video-close]").addEventListener("click", closeVideo);
  $("[data-video-play]").addEventListener("click", () => { setPlay(!playing); wake(); });
  $("[data-part=video-screen]").addEventListener("click", () => { setPlay(!playing); wake(); });
  $("input", prog).addEventListener("input", (e) => { pos = +e.target.value * LEN; draw(); });
  video.addEventListener("pointermove", wake);
  $$(".m-video__volume input").forEach((inp) => inp.addEventListener("input", () => inp.parentElement.style.setProperty("--progress", `${inp.value * 100}%`)));
})();
