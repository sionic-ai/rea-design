(() => {
  // The original floats letters one by one over the curtain, and once all are up, returns to the attached text to match tracking with the nav logo, then flies them to that spot
  const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;
  const E = "cubic-bezier(0.22, 1, 0.36, 1)", IO = "cubic-bezier(0.65, 0, 0.35, 1)";

  kfFx.register("circle-split-intro", (el, { options, reduce }) => {
    const root = document.documentElement;
    const gate = options.gate || "";
    const onceKey = options.once === "session" ? "fx-circle-split-intro" : "";
    const release = () => { if (gate) root.classList.remove(gate, gate + "-built"); };
    if (gate && !root.classList.contains(gate)) return;
    let seen = false;
    try { seen = !!onceKey && sessionStorage.getItem(onceKey) === "1"; } catch (e) {}
    const bot = options.bots === "skip" && (navigator.webdriver || document.prerendering || BOT.test(navigator.userAgent));
    const markBox = el.querySelector('[data-fx-part="mark"]');
    const wordEl = el.querySelector('[data-fx-part="word"]');
    const svg = markBox && (markBox.matches("svg") ? markBox : markBox.querySelector("svg"));
    const circles = svg ? [...svg.querySelectorAll("circle")] : [];
    if (reduce || seen || bot || circles.length < 2 || !wordEl) { release(); return; }

    const sp = Math.max(0.05, +(options.speed ?? 1));
    const hold = +(options.hold ?? 1) * 1000 * sp;
    let overlay = null, done = false, safety = 0, flyTimer = 0;

    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(safety); clearTimeout(flyTimer);
      try { if (onceKey) sessionStorage.setItem(onceKey, "1"); } catch (e) {}
      el.style.opacity = "";
      overlay?.remove();
      ["click", "keydown", "wheel", "touchstart"].forEach((t) => removeEventListener(t, skip, true));
      release();
      el.dispatchEvent(new CustomEvent("fx:intro-end", { bubbles: true }));
    };
    function skip() {
      if (!overlay) return finish();
      overlay.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      overlay.querySelectorAll("[data-veil]").forEach((v) => (v.style.opacity = "1"));
      overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" }).onfinish = finish;
    }

    const build = () => {
      if (done) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return finish();
      const ws = getComputedStyle(wordEl);
      const fs = parseFloat(ws.fontSize), mh = svg.getBoundingClientRect().height, gap = parseFloat(getComputedStyle(el).columnGap) || 12;
      // Largest size that fits within 70% of the screen width and 1/3 of the height
      const k = Math.min((innerWidth * 0.7) / r.width, (innerHeight * 0.34) / Math.max(mh, fs * 1.2));

      overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;z-index:9999;display:grid;place-items:center;overflow:hidden;cursor:pointer";
      overlay.setAttribute("aria-hidden", "true");
      const veil = document.createElement("div");
      veil.setAttribute("data-veil", "");
      veil.style.cssText = "position:absolute;inset:0;background:var(--kf-contrast-bg)";
      const logo = document.createElement("div");
      logo.style.cssText = "position:relative;display:inline-flex;align-items:center;transform-origin:0 0;gap:" + gap * k + "px";
      const mark = svg.cloneNode(true);
      mark.style.cssText = "display:block;height:" + mh * k + "px;width:auto;overflow:visible;isolation:isolate;transform-origin:50% 50%";
      const word = document.createElement("span");
      word.style.cssText = "display:inline-block;white-space:nowrap;color:var(--kf-contrast-ink);font-family:" + ws.fontFamily + ";font-weight:" + ws.fontWeight + ";font-size:" + fs * k + "px;line-height:" + parseFloat(ws.lineHeight) / fs + ";letter-spacing:" + (ws.letterSpacing === "normal" ? "normal" : parseFloat(ws.letterSpacing) * k + "px") + ";text-transform:" + ws.textTransform;
      const text = wordEl.textContent.trim();
      [...text].forEach((c) => {
        const s = document.createElement("span");
        s.textContent = c;
        s.style.cssText = "display:inline-block;white-space:pre;opacity:0";
        word.append(s);
      });
      logo.append(mark, word);
      overlay.append(veil, logo);
      document.body.append(overlay);
      if (gate) root.classList.add(gate + "-built");
      el.style.opacity = "0";
      ["click", "keydown", "wheel", "touchstart"].forEach((t) => addEventListener(t, skip, true));
      el.dispatchEvent(new CustomEvent("fx:intro-start", { bubbles: true }));

      // Top (first color) and bottom (second color) circles — the top circle is laid over the bottom one with multiply so the overlap darkens, before overlapping, a normal-fill copy covers it so it looks like one circle
      const cs = [...mark.querySelectorAll("circle")].sort((a, b) => a.getAttribute("cy") - b.getAttribute("cy"));
      const top = cs[0], bottom = cs[cs.length - 1];
      mark.querySelectorAll("path").forEach((p) => (p.style.opacity = 0));
      top.style.mixBlendMode = "multiply";
      top.parentNode.appendChild(top);
      const cover = top.cloneNode();
      cover.style.mixBlendMode = "normal";
      top.parentNode.appendChild(cover);
      const vb = (mark.getAttribute("viewBox") || "0 0 100 166").split(/[\s,]+/).map(Number);
      const unit = mark.getBoundingClientRect().height / vb[3];
      const radius = +top.getAttribute("r") * unit;
      const shift = (logo.getBoundingClientRect().width - mark.getBoundingClientRect().width) / 2;
      const big = (Math.hypot(innerWidth, innerHeight) / 2 / radius) * 1.05;
      const gapY = (bottom.getAttribute("cy") - top.getAttribute("cy")) / 2;

      const T = (ms) => ms * sp;
      const t0 = T(250), dShrink = T(1100), tSplit = t0 + dShrink - T(100), dSplit = T(1300), tSlide = tSplit + T(1050), tWord = tSlide + T(550);
      const flyAt = tWord + text.length * T(60) + T(600) + hold;

      mark.animate([{ transform: "scale(" + big + ")" }, { transform: "scale(1)" }], { duration: dShrink, delay: t0, easing: "cubic-bezier(0.7, 0, 0.2, 1)", fill: "both" });
      mark.animate([{ rotate: "-360deg" }, { rotate: "0deg" }], { duration: dSplit + T(300), delay: tSplit, easing: E, fill: "both" });
      bottom.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T(200), delay: tSplit, fill: "both" });
      [top, cover].forEach((c) => c.animate([{ transform: "translateY(" + gapY + "px)" }, { transform: "none" }], { duration: dSplit, delay: tSplit, easing: IO, fill: "both" }));
      bottom.animate([{ transform: "translateY(" + -gapY + "px)" }, { transform: "none" }], { duration: dSplit, delay: tSplit, easing: IO, fill: "both" });
      cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: T(180), delay: tSplit + dSplit * 0.22, easing: "linear", fill: "both" });
      mark.animate([{ translate: shift + "px 0" }, { translate: "0 0" }], { duration: T(900), delay: tSlide, easing: IO, fill: "both" });
      [...word.children].forEach((s, i) => s.animate([{ opacity: 0, transform: "translateY(0.35em)" }, { opacity: 1, transform: "none" }], { duration: T(600), delay: tWord + i * T(60), easing: E, fill: "both" }));

      flyTimer = setTimeout(() => {
        if (done) return;
        word.textContent = text;
        const from = logo.getBoundingClientRect(), to = el.getBoundingClientRect();
        const dur = T(1000);
        const ink = getComputedStyle(wordEl).color;
        const go = logo.animate([{ transform: "none" }, { transform: "translate(" + (to.left - from.left) + "px," + (to.top - from.top) + "px) scale(" + 1 / k + ")" }], { duration: dur, easing: IO, fill: "forwards" });
        word.animate([{ color: getComputedStyle(word).color }, { color: ink }], { duration: dur * 0.6, delay: dur * 0.3, easing: "ease", fill: "forwards" });
        veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur * 0.7, delay: dur * 0.25, easing: "ease", fill: "forwards" });
        go.onfinish = finish;
      }, flyAt);
    };

    const ready = document.fonts?.load ? document.fonts.load(getComputedStyle(wordEl).fontWeight + " 40px " + getComputedStyle(wordEl).fontFamily.split(",")[0]) : Promise.resolve();
    Promise.race([ready, new Promise((r) => setTimeout(r, 1200))]).then(build, build);
    // Make sure no curtain is ever left behind
    safety = setTimeout(() => { if (!done) skip(); }, 10000 * Math.max(1, sp));
    return () => { if (overlay) overlay.getAnimations({ subtree: true }).forEach((a) => a.cancel()); finish(); };
  });
})();
