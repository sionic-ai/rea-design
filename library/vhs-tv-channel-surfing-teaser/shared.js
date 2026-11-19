(() => {
  // TV screen engine — as in the original, the whole screen (channel image · head · number · footer · timecode) is drawn on a single 2D canvas, and the vhs-tape-gl part redraws that canvas with a shader.
  // DOM text ([data-ct]) only holds the place and is transparent — each frame it reads word positions and paints at the same spot (original canvas-text)
  const body = document.body;
  const tv = document.querySelector(".jy-tv");
  const cv = document.getElementById("jy-source");
  if (!tv || !cv) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rootCss = getComputedStyle(document.documentElement);
  const v = (n) => rootCss.getPropertyValue(n).trim();
  const ink = () => v("--kf-ink"), paper = () => v("--kf-bg"), mono = () => v("--kf-font-mono");
  const born = performance.now();
  let W = 0, H = 0, frame = 0, channel = 0, entered = false, loaded = false, audioOn = false;
  const mobile = () => innerWidth <= 750;

  const size = () => {
    W = cv.width = Math.round(innerWidth * dpr);
    H = cv.height = Math.round(innerHeight * dpr);
  };
  size();
  addEventListener("resize", size);

  // Turn text blocks into word spans — line breaks and marquee movement are decided by the DOM, and the canvas just follows the positions
  document.querySelectorAll("[data-ct]").forEach((el) => {
    const parts = el.textContent.split(/(\s+)/).filter(Boolean);
    el.textContent = "";
    for (const p of parts) {
      if (/^\s+$/.test(p)) el.append(p);
      else { const s = document.createElement("span"); s.textContent = p; el.append(s); }
    }
  });
  const hovered = new Set();
  document.querySelectorAll("[data-ct-hover]").forEach((el) => {
    el.addEventListener("pointerenter", () => hovered.add(el));
    el.addEventListener("pointerleave", () => hovered.delete(el));
    el.addEventListener("focus", () => hovered.add(el));
    el.addEventListener("blur", () => hovered.delete(el));
  });

  // The multiplier (--site-glyph) by which the skin font renders smaller than the original VCR — DOM text size is already multiplied by css, so this is used only for the timecode that exists only on the canvas.
  const glyph = () => parseFloat(getComputedStyle(body).getPropertyValue("--site-glyph")) || 1;
  const font = (cs) => `${cs.fontWeight} ${parseFloat(cs.fontSize) * dpr}px ${cs.fontFamily}`;
  const caps = (cs, s) => (cs.textTransform === "uppercase" ? s.toUpperCase() : s);
  const shown = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  const drawWords = (el, clip) => {
    if (!shown(el)) return;
    const cs = getComputedStyle(el);
    ctx.font = font(cs);
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = ink();
    const line = el.matches("[data-ct-link]") || hovered.has(el);
    for (const s of el.children) {
      const r = s.getBoundingClientRect();
      if (!r.width || (clip && (r.right < clip.left || r.left > clip.right))) continue;
      const text = caps(cs, s.textContent), m = ctx.measureText(text);
      // Align the text baseline to the bottom of the line box — so enlarged text grows upward
      const base = r.bottom * dpr - m.fontBoundingBoxDescent;
      ctx.fillText(text, r.left * dpr, base);
      // Link/hover underline — original lineWidth 3
      if (line) ctx.fillRect(r.left * dpr, base + m.fontBoundingBoxDescent * 0.45, m.width + (s.nextSibling ? ctx.measureText(" ").width : 0), 3 * dpr);
    }
  };

  // Horizontal logo slot (original header image): height max(35, 6% of screen), width the smaller of that height × 11.7 (original image ratio) and 60% of screen
  const drawLockup = () => {
    let h = Math.max(35, 0.06 * H), w = Math.min((mobile() ? 0.5 : 0.6) * W, h * 11.7);
    if (mobile()) { w = 0.5 * W; h = w / 11.7; }
    const x = 20 * dpr, y = (innerWidth > 840 ? 20 : 16) * dpr;
    ctx.save();
    ctx.fillStyle = ink();
    ctx.strokeStyle = ink();
    ctx.textBaseline = "middle";
    ctx.font = `${h * 0.62}px ${mono()}`;
    const name = "STUDIO NAME WORDMARK";
    ctx.fillText(name, x, y + h / 2);
    let cx = x + ctx.measureText(name).width + h * 0.25;
    // Color bar slot on the test screen — painted with a single skin, only the intensity varies
    [1, 0.55, 0.85, 0.4, 0.7, 0.5].forEach((a, i) => { ctx.globalAlpha = a; ctx.fillRect(cx + i * h * 0.26, y + h * 0.42, h * 0.24, h * 0.16); });
    ctx.globalAlpha = 1;
    ctx.fillRect(cx, y + h * 0.36, h * 1.54, 1 * dpr);
    cx += h * 1.8;
    ctx.font = `${h * 0.7}px ${mono()}`;
    ctx.fillText("ABCD", cx, y + h / 2);
    cx += ctx.measureText("ABCD").width + h * 0.35;
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.arc(cx, y + h / 2, h * 0.32, -Math.PI / 2.6, Math.PI / 2.6);
    ctx.moveTo(cx + h * 0.64, y + h * 0.18);
    ctx.arc(cx + h * 0.64, y + h / 2, h * 0.32, Math.PI - Math.PI / 2.6, Math.PI + Math.PI / 2.6, true);
    ctx.stroke();
    ctx.restore();
  };

  // Bottom-left logo band spot (original footer image): width min(40% of screen, 1080), ratio 14.4, 10px from the bottom
  const drawCredits = () => {
    const w = Math.min(0.4 * W, 1080 * dpr), h = w / 14.4, x = 20 * dpr, y = H - h - 10 * dpr;
    ctx.save();
    ctx.strokeStyle = ink();
    ctx.fillStyle = ink();
    ctx.lineWidth = 1.5 * dpr;
    for (let i = 0; i < 5; i++) {
      const bx = x + i * h * 1.25;
      if (i % 2) ctx.fillRect(bx + h * 0.15, y + h * 0.2, h * 0.7, h * 0.6);
      else { ctx.beginPath(); ctx.arc(bx + h * 0.5, y + h / 2, h * 0.34, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.textBaseline = "middle";
    ctx.font = `${h * 0.8}px ${mono()}`;
    let cx = x + 5 * h * 1.25 + h * 0.2;
    ctx.fillText("PARTNER", cx, y + h / 2);
    cx += ctx.measureText("PARTNER").width + h * 0.6;
    ctx.fillRect(cx, y + h * 0.2, 1 * dpr, h * 0.6);
    cx += h * 0.9;
    ctx.fillText("TITLE NAME", cx, y + h / 2);
    ctx.restore();
  };

  // Sound button: 30px, at the bottom right at 1.6x. Shows two waves when on
  const drawAudio = () => {
    const s = 30 * dpr, x = W - 1.6 * s, y = H - 1.6 * s;
    ctx.save();
    ctx.strokeStyle = ink();
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.62, y + s * 0.05);
    ctx.lineTo(x + s * 0.3, y + s * 0.32);
    ctx.lineTo(x + s * 0.1, y + s * 0.32);
    ctx.lineTo(x + s * 0.1, y + s * 0.68);
    ctx.lineTo(x + s * 0.3, y + s * 0.68);
    ctx.lineTo(x + s * 0.62, y + s * 0.95);
    ctx.closePath();
    ctx.stroke();
    if (audioOn) {
      ctx.beginPath(); ctx.arc(x + s * 0.62, y + s / 2, s * 0.2, -0.9, 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + s * 0.62, y + s / 2, s * 0.36, -0.9, 0.9); ctx.stroke();
    }
    ctx.restore();
  };

  // Timecode — hours:minutes:seconds from the time opened, text canvas width 2%, right edge W − 20 − 45, bottom 25px (not drawn on phone)
  const drawClock = () => {
    if (mobile()) return;
    const ms = performance.now() - born, p = (n) => String(Math.floor(n)).padStart(2, "0");
    ctx.save();
    ctx.fillStyle = ink();
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.font = `${0.02 * W * glyph()}px ${mono()}`;
    ctx.fillText(`${p((ms / 36e5) % 24)}:${p((ms / 6e4) % 60)}:${p((ms / 1e3) % 60)}`, W - 20 * dpr - 45 * dpr, H - 25 * dpr);
    ctx.restore();
  };

  // Email field — 3px border, divider before the send cell, text (placeholder if empty), and on focus a letter-wide block cursor blinks every 30 frames
  const form = document.querySelector(".jy-mail"), input = form?.querySelector("input"), mailText = form?.querySelector("[data-ct-mail]");
  let mailHint = "ENTER EMAIL";
  const drawMail = () => {
    if (!form || !shown(form)) return;
    const r = form.getBoundingClientRect(), t = mailText.getBoundingClientRect();
    ctx.save();
    ctx.strokeStyle = ink();
    ctx.fillStyle = ink();
    ctx.lineWidth = 3 * dpr;
    ctx.strokeRect(r.left * dpr + 1.5 * dpr, r.top * dpr + 1.5 * dpr, r.width * dpr - 3 * dpr, r.height * dpr - 3 * dpr);
    ctx.fillRect((r.right - 30) * dpr, r.top * dpr, 3 * dpr, r.height * dpr);
    const cs = getComputedStyle(mailText);
    ctx.font = font(cs);
    ctx.textBaseline = "alphabetic";
    const text = input.value || (document.activeElement === input ? "" : mailHint);
    const m = ctx.measureText("M");
    const x = (t.left + 9) * dpr, base = (t.top + 4) * dpr + m.fontBoundingBoxAscent;
    ctx.save();
    ctx.beginPath();
    ctx.rect(t.left * dpr, t.top * dpr, t.width * dpr, t.height * dpr);
    ctx.clip();
    ctx.fillText(text.toUpperCase(), x, base);
    if (document.activeElement === input && frame % 60 < 30) {
      const k = input.selectionStart ?? input.value.length;
      const cx = x + ctx.measureText(input.value.slice(0, k).toUpperCase()).width;
      ctx.fillRect(cx, base - m.fontBoundingBoxAscent * 0.85, m.width, m.fontBoundingBoxAscent * 0.95);
      if (k < input.value.length) { ctx.fillStyle = paper(); ctx.fillText(input.value[k].toUpperCase(), cx, base); }
    }
    ctx.restore();
    const b = form.querySelector("button [data-ct]");
    if (b) drawWords(b);
    ctx.restore();
  };

  // Channel drawing — index.js gives each channel how to draw (black if none)
  let painters = [];
  const api = (window.jyTV = { set channels(list) { painters = list; }, get size() { return { W, H, dpr }; }, ctx, ink, paper, mono });

  const ticker = document.querySelector(".jy-ticker");
  const draw = () => {
    frame++;
    ctx.fillStyle = paper();
    ctx.fillRect(0, 0, W, H);
    if (!entered) {
      // Entrance door — logo transformation video fitted to ¼ of the screen, centered
      const intro = document.querySelector(".jy-intro");
      const bw = W / 4, bh = H / 4, k = Math.min(bw / 700, bh / 500), w = 700 * k, h = 500 * k, x = W / 2 - w / 2, y = H / 2 - h / 2;
      // Opening via file:// taints the canvas with video so the shader can’t take it — only then draw the white-bar logo at the same tempo (.43s four)
      if (location.protocol === "file:") {
        const step = Math.floor((performance.now() - born) / 430) % 4;
        ctx.fillStyle = ink();
        const box = (a, b, c, d) => ctx.fillRect(x + a * w, y + b * h, c * w, d * h);
        if (step === 0) { box(0.28, 0.3, 0.44, 0.106); box(0.461, 0.406, 0.077, 0.188); box(0.28, 0.594, 0.44, 0.106); }
        else if (step === 1) { box(0.229, 0.324, 0.377, 0.096); box(0.406, 0.42, 0.081, 0.16); box(0.349, 0.58, 0.429, 0.096); box(0.329, 0.712, 0.343, 0.024); }
        else if (step === 2) { ctx.globalAlpha = 0.6; box(0.186, 0.3, 0.629, 0.4); ctx.globalAlpha = 1; box(0.343, 0.488, 0.329, 0.028); }
        else { box(0.49, 0.22, 0.02, 0.56); box(0.214, 0.488, 0.243, 0.016); box(0.543, 0.488, 0.243, 0.016); }
      } else if (intro && intro.readyState >= 2) ctx.drawImage(intro, x, y, w, h);
      document.querySelectorAll(".jy-gate [data-ct]").forEach((el) => drawWords(el));
    } else {
      painters[channel]?.(api, performance.now() - born);
      drawLockup();
      document.querySelectorAll(".jy-head > a[data-ct]").forEach((el) => drawWords(el));
      drawMail();
      document.querySelectorAll(".jy-num.is-on > [data-ct]").forEach((el) => drawWords(el));
      if (!mobile()) drawCredits();
      document.querySelectorAll(".jy-copy [data-ct]").forEach((el) => drawWords(el));
      if (ticker && shown(ticker)) {
        const r = ticker.getBoundingClientRect();
        ctx.save();
        ctx.beginPath();
        ctx.rect(r.left * dpr, (r.top - 10) * dpr, r.width * dpr, (r.height + 20) * dpr);
        ctx.clip();
        ticker.querySelectorAll("[data-ct]").forEach((el) => drawWords(el, r));
        ctx.restore();
      }
      drawAudio();
      drawClock();
    }
    requestAnimationFrame(draw);
  };

  // Channel — the cursor-channel part reports every time the cursor cell changes
  const nums = [...document.querySelectorAll(".jy-num")];
  const pick = (i) => { channel = i; nums.forEach((n, j) => n.classList.toggle("is-on", j === i)); };
  tv.addEventListener("fx:channel", (e) => pick(e.detail.index));
  pick(+(tv.dataset.channel || 0));

  // Loading — when the channel video can fully play and the typeface is ready, turn off the static noise and show ENTER SITE
  const vids = [...document.querySelectorAll(".jy-media video")];
  const loadingEl = document.querySelector(".jy-gate__loading"), enterBtn = document.querySelector(".jy-gate__enter");
  const progress = () => {
    const ready = vids.filter((x) => x.readyState >= 3).length;
    const span = loadingEl?.querySelector("span:last-child");
    if (span) span.textContent = `${String(Math.round((ready / vids.length) * 100)).padStart(2, "0")}%`;
    return ready === vids.length;
  };
  const finish = () => {
    if (loaded) return;
    loaded = true;
    tv.dispatchEvent(new CustomEvent("fx:static", { detail: 0 }));
    if (loadingEl) loadingEl.hidden = true;
    if (enterBtn) enterBtn.hidden = false;
  };
  const fonts = document.fonts.load(`20px ${mono()}`).catch(() => {});
  vids.forEach((x) => { x.addEventListener("canplaythrough", () => progress() && fonts.then(finish)); x.load(); });
  fonts.then(() => progress() && finish());

  const rotate = document.querySelector(".jy-rotate");
  const portrait = matchMedia("(orientation: portrait)");
  const checkRotate = () => { if (rotate) rotate.hidden = !(entered && mobile() && portrait.matches); };
  portrait.addEventListener?.("change", checkRotate);
  addEventListener("resize", checkRotate);

  enterBtn?.addEventListener("click", () => {
    entered = true;
    body.classList.add("is-in");
    // Like the original (Vue v-if), remove the entrance door from the document. If it were only hidden, a 0-size button would remain and still receive focus and presses.
    document.querySelector(".jy-gate")?.remove();
    vids.forEach((x) => x.play().catch(() => {}));
    tv.dispatchEvent(new CustomEvent("fx:channel-on"));
    checkRotate();
  });

  const audio = document.querySelector(".jy-audio");
  audio?.addEventListener("click", () => {
    audioOn = !audioOn;
    audio.setAttribute("aria-pressed", String(audioOn));
    audio.setAttribute("aria-label", audioOn ? "Sound Off" : "Sound On");
    vids.forEach((x) => { if (!x.classList.contains("jy-intro")) x.muted = !audioOn; });
  });
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!input.value) return;
    input.value = "";
    input.blur();
    mailHint = "THANK YOU";
    setTimeout(() => (mailHint = "ENTER EMAIL"), 2500);
  });

  if (reduce) vids.forEach((x) => x.removeAttribute("autoplay"));
  requestAnimationFrame(draw);
})();
