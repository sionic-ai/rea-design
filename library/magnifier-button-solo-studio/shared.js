/* Shared motion for the whole metic set — original values noted per line. Curve lens = (.23,1,.32,1), iris = (.77,0,.175,1) */
(() => {
  const root = document.documentElement;
  root.classList.add("js");
  const mm = gsap.matchMedia();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const IRIS = "cubic-bezier(0.77, 0, 0.175, 1)";
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  if (window.DrawSVGPlugin) gsap.registerPlugin(DrawSVGPlugin);
  CustomEase.create("lens", "0.23, 1, 0.32, 1");
  CustomEase.create("iris", "0.77, 0, 0.175, 1");
  gsap.defaults({ ease: "lens", duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* Smooth scroll — Lenis 1.3.26, duration 1.1 · expo type (1.001 − 2^(−10t)) */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.mtLenis = lenis;
  const lockScroll = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); document.body.style.overflow = on ? "hidden" : ""; };

  /* Loader — first page, once only. After 1.15s a circle shrinks into the dot position with a 760ms iris */
  const pre = document.querySelector(".mt-preloader");
  if (pre) {
    if (root.classList.contains("mt-intro")) {
      lockScroll(true);
      const dot = pre.querySelector(".mt-pre-dot");
      // Like the original, it closes 1.15s after the loader is first painted (the safe-off animation clock).
      const fail = pre.getAnimations().find((a) => a.animationName === "mt-failsafe");
      const l = Number((fail && fail.currentTime) || 0);
      if (fail) fail.cancel();
      const at = Math.max(1090, l + 60);
      setTimeout(() => {
        const b = dot.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
        pre.animate([{ clipPath: `circle(${r}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }], { duration: 760, easing: IRIS, fill: "forwards" })
          .finished.then(() => {
            lockScroll(false);
            pre.style.visibility = "hidden";
            window.dispatchEvent(new Event("mt:intro-done"));
            try { sessionStorage.setItem("mt-intro", "1"); } catch (e) {}
            setTimeout(() => root.classList.remove("mt-intro"), 2500);
          });
      }, at - l);
    } else pre.remove();
  }

  /* Header — scroll past 24px and the pill gets a translucent background (.4s), with a progress bar and current section name in the center */
  const nav = document.querySelector(".mt-nav");
  const bar = document.querySelector(".mt-progress > span");
  const chapterOut = document.querySelector(".mt-readout .mt-measure");
  const edge = document.querySelector(".mt-edge");
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const onScroll = () => {
    const y = window.scrollY, max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = clamp(y / max, 0, 1);
    nav && nav.classList.toggle("is-scrolled", y > 24);
    if (bar) bar.style.transform = `scaleX(${p})`;
    if (edge) edge.style.setProperty("--p", p.toFixed(4));
    if (chapterOut && chapters.length) {
      let cur = chapters[0];
      for (const c of chapters) if (c.getBoundingClientRect().top < innerHeight * 0.5) cur = c;
      const t = cur.dataset.chapter;
      if (chapterOut.textContent !== t) chapterOut.textContent = t;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Menu section names, large titles, section title letters: within a 160px radius, weight goes 500→690 by smoothstep strength k, and letters lean toward the cursor by font size × .16 */
  const kinetic = (el, radius = 160, pull = 0.16) => {
    if (!fine || reduce) return;
    const chars = [...el.querySelectorAll(".mt-kin-char")];
    let pts = [], px = -1e4, py = -1e4, raf = 0, f = 12, inside = false;
    const measure = () => {
      inside = true;
      f = parseFloat(getComputedStyle(el).fontSize) * pull;
      const b = el.getBoundingClientRect();
      pts = chars.map((c) => { const r = c.getBoundingClientRect(); return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 }; });
    };
    const frame = () => {
      raf = 0;
      const b = el.getBoundingClientRect();
      chars.forEach((c, i) => {
        const dx = px - (b.left + pts[i].x), dy = py - (b.top + pts[i].y), d = Math.hypot(dx, dy) || 1;
        const h = Math.max(0, 1 - d / radius), k = h * h * (3 - 2 * h);
        c.style.setProperty("--k", k.toFixed(3));
        if (k > 0.6) discover("kinetic");
        c.style.setProperty("--dx", ((dx / d) * k * f).toFixed(2));
        c.style.setProperty("--dy", ((dy / d) * k * f).toFixed(2));
      });
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(frame); };
    // Even when motion arrives without pointerenter (page opened under the cursor), glyph positions are measured first
    el.addEventListener("pointerenter", measure);
    el.addEventListener("pointermove", (e) => { if (!inside) measure(); px = e.clientX; py = e.clientY; ask(); });
    el.addEventListener("pointerleave", () => { inside = false; px = py = -1e4; ask(); });
    addEventListener("resize", () => inside && measure());
  };
  const charSpans = (word) => [...word].map((ch) => Object.assign(document.createElement("span"), { className: "mt-kin-char", textContent: ch }));
  const splitChars = (el) => {
    const text = el.textContent.trim().replace(/\s+/g, " ");
    el.setAttribute("aria-label", text);
    // Hero title words each carry an entrance delay (--d), so those spans are kept as word slots
    const held = [...el.children].filter((c) => c.classList.contains("mt-hero-word"));
    if (held.length) return held.forEach((w) => { w.classList.add("mt-kin-word"); w.setAttribute("aria-hidden", "true"); w.replaceChildren(...charSpans(w.textContent.trim())); });
    const words = text.split(" ").map((w) => { const s = document.createElement("span"); s.className = "mt-kin-word"; s.setAttribute("aria-hidden", "true"); s.append(...charSpans(w)); return s; });
    el.replaceChildren(...words.flatMap((w, i) => (i ? [" ", w] : [w])));
  };
  // As in the original, the inner span attached to the text line receives the cursor — it reacts only over the letters, not the block’s full width
  document.querySelectorAll("[data-kinetic]").forEach((el) => {
    splitChars(el);
    if (!/^H\d$/.test(el.tagName)) return kinetic(el);
    const line = document.createElement("span");
    line.className = "mt-kin";
    line.append(...el.childNodes);
    el.appendChild(line);
    kinetic(line);
  });

  /* Circular menu — opens from the button position with a 620ms iris circle and closes in 480ms. Section names come in one after another with a 700ms lens */
  const menu = document.querySelector(".mt-menu");
  const menuBtn = document.querySelector("[data-menu-toggle]");
  if (menu && menuBtn) {
    const links = [...menu.querySelectorAll(".mt-menu-list a")];
    const peeks = [...menu.querySelectorAll(".mt-menu-peek [data-ph]")];
    let open = false, origin = { x: innerWidth - 40, y: 36 };
    const radius = () => Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y)) + 8;
    const set = (on) => {
      if (on === open) return;
      open = on;
      const b = menuBtn.getBoundingClientRect();
      origin = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
      const from = `circle(0px at ${origin.x}px ${origin.y}px)`, to = `circle(${radius()}px at ${origin.x}px ${origin.y}px)`;
      nav.classList.toggle("is-open", on);
      menuBtn.setAttribute("aria-expanded", String(on));
      if (on) {
        links.forEach((a, i) => (a.style.transitionDelay = `${120 + i * 60}ms`));
        menu.classList.add("is-live", "is-open");
        discover("menu");
        root.classList.add("mt-menu-open");
        lockScroll(true);
        if (reduce) menu.style.clipPath = "none";
        else menu.animate([{ clipPath: from }, { clipPath: to }], { duration: 620, easing: IRIS, fill: "forwards" });
      } else {
        links.forEach((a) => (a.style.transitionDelay = "0ms"));
        menu.classList.remove("is-open");
        const done = () => { menu.classList.remove("is-live"); root.classList.remove("mt-menu-open"); lockScroll(false); };
        if (reduce) { menu.style.clipPath = from; done(); }
        else menu.animate([{ clipPath: to }, { clipPath: from }], { duration: 480, easing: IRIS, fill: "forwards" }).finished.then(done, done);
      }
    };
    menuBtn.addEventListener("click", () => set(!open));
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    links.forEach((a, i) => a.addEventListener("pointerenter", () => peeks.forEach((p, j) => p.classList.toggle("is-on", j === i))));
    window.mtCloseMenu = () => set(false);
    menu.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.themeSet;
      v === "dark" ? root.setAttribute("data-theme", "dark") : root.removeAttribute("data-theme");
      discover("theme");
      menu.querySelectorAll("[data-theme-set]").forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    }));
  }

  /* Circular transition — covers with a 560ms iris from the pressed spot and navigates, then on the new page lifts in 640ms after 60ms */
  const iris = document.querySelector(".mt-iris");
  if (iris) {
    const label = iris.querySelector(".mt-measure");
    const cover = (x, y) => Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
    let came = null;
    try { came = JSON.parse(sessionStorage.getItem("mt-iris") || "null"); sessionStorage.removeItem("mt-iris"); } catch (e) {}
    root.classList.remove("mt-iris-in");
    if (came && !reduce) {
      label.textContent = came.label || "";
      iris.style.visibility = "visible";
      const r = cover(came.x, came.y);
      iris.style.clipPath = `circle(${r}px at ${came.x}px ${came.y}px)`;
      const hold = came.t ? Math.max(60, came.t + 1330 - Date.now()) : 60;
      window.mtRevealAt = hold;
      setTimeout(() => {
        iris.animate([{ clipPath: `circle(${r}px at ${came.x}px ${came.y}px)` }, { clipPath: `circle(0px at ${came.x}px ${came.y}px)` }], { duration: 640, easing: IRIS, fill: "forwards" })
          .finished.then(() => (iris.style.visibility = "hidden"));
      }, hold);
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href) || a.target) return;
      e.preventDefault();
      const here = location.pathname.split("/").pop() || "index.html";
      if (href.split("#")[0] === here) {
        // Same section — if the menu is open, wait while it closes (.56s) and then go to that spot (top if none)
        const open = root.classList.contains("mt-menu-open"), id = href.split("#")[1], target = id && document.getElementById(id);
        window.mtCloseMenu && window.mtCloseMenu();
        setTimeout(() => (lenis ? lenis.scrollTo(target || 0, { offset: target ? -16 : 0 }) : (target ? target.scrollIntoView({ behavior: "smooth" }) : scrollTo({ top: 0, behavior: "smooth" }))), open ? 560 : 0);
        return;
      }
      const x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2, name = a.dataset.label || "";
      try { sessionStorage.setItem("mt-iris", JSON.stringify({ x, y, label: name, t: Date.now() })); } catch (err) {}
      if (reduce) { location.href = href; return; }
      label.textContent = name;
      iris.style.visibility = "visible";
      let gone = false;
      const go = () => { if (!gone) { gone = true; location.href = href; } };
      iris.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${cover(x, y)}px at ${x}px ${y}px)` }], { duration: 560, easing: IRIS, fill: "forwards" }).finished.then(go, go);
      setTimeout(go, 900);
    });
  }

  /* Button glow — cursor position */
  document.querySelectorAll(".mt-btn").forEach((b) => b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.setProperty("--mx", `${e.clientX - r.left}px`);
    b.style.setProperty("--my", `${e.clientY - r.top}px`);
  }));

  /* Fade-up — adds is-in once when it enters the screen */
  const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
  // Like the original (a single page app), the arrived page’s body attaches and floats up when the cover starts lifting
  const watchReveal = () => document.querySelectorAll("[data-reveal], [data-assemble]").forEach((el) => io.observe(el));
  if (window.mtRevealAt) setTimeout(() => { root.classList.remove("mt-arriving"); watchReveal(); }, window.mtRevealAt);
  else { root.classList.remove("mt-arriving"); watchReveal(); }

  /* Photo magnifier — 2.2x, radius 84px (list 64px). Sticks right to the cursor */
  document.querySelectorAll("[data-hlens]").forEach((box) => {
    const r = +(box.dataset.hlens || 84), zoom = 2.2;
    const src = box.firstElementChild;
    if (!src) return;
    box.classList.add("mt-hlens");
    const glass = document.createElement("div");
    glass.className = "mt-hlens-glass";
    glass.setAttribute("aria-hidden", "true");
    glass.style.width = glass.style.height = `${r * 2}px`;
    const inner = document.createElement("div");
    inner.className = "mt-hlens-inner";
    inner.appendChild(src.cloneNode(true));
    const dot = document.createElement("span");
    dot.className = "mt-hlens-dot";
    glass.append(inner, dot);
    box.appendChild(glass);
    box.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const b = box.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      glass.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
      inner.style.width = `${b.width}px`;
      inner.style.height = `${b.height}px`;
      inner.style.transform = `translate3d(${r - x * zoom}px, ${r - y * zoom}px, 0) scale(${zoom})`;
      box.classList.add("is-lensing");
    });
    box.addEventListener("pointerleave", () => box.classList.remove("is-lensing"));
  });

  /* Hidden-text hunt — pointing at the memo inside the magnifier circle at the circle center counts as found (original 15) */
  const inks = [...document.querySelectorAll(".mt-secret")];
  const found = new Set(JSON.parse((() => { try { return sessionStorage.getItem("mt-found") || "[]"; } catch (e) { return "[]"; } })()));
  const total = 15;
  // Original fifteen discoveries — lens · X-ray · memo · menu · text drag · magnifier · measuring cross · fan · color · end of build · section turn · getting lost · footer · contact · work magnifier
  const FINDS = [["lens", "Hold the mouse down"], ["xray", "Turn on X-ray"], ["note", "Find the Hidden Note"], ["menu", "Open Menu"], ["kinetic", "Menu text pull effect"], ["loupe", "Picking up the magnifier"],
    ["genau", "Measuring cross on card"], ["scale", "Unfold service fan"], ["theme", "Switch light·dark"], ["zoom", "See the build through to the end"], ["studio", "Open one service"], ["lost", "Read the full post"],
    ["footer", "Scroll to the very bottom"], ["brief", "Fill in the contact form"], ["reel", "Look closely at work photos"]];
  const hudPill = document.querySelector(".mt-hud-pill"), hudPanel = document.querySelector(".mt-hud-panel"), hudList = document.querySelector("[data-hud-list]"), hudCount = document.querySelector("[data-hud-count]");
  const toast = document.querySelector(".mt-hud-toast");
  const paintHud = () => {
    if (hudCount) hudCount.textContent = `${found.size}/${total}`;
    if (hudPill) hudPill.classList.toggle("is-all", found.size >= total);
    if (hudList) hudList.innerHTML = FINDS.map(([k, h]) => `<li class="${found.has(k) ? "is-found" : ""}"><span class="mt-hud-check"></span>${h}</li>`).join("");
  };
  paintHud();
  if (hudPill && hudPanel) hudPill.addEventListener("click", () => {
    const open = hudPanel.hidden;
    hudPanel.hidden = !open;
    hudPill.setAttribute("aria-expanded", String(open));
  });
  const discover = (key, note) => {
    if (found.has(key)) return;
    found.add(key);
    try { sessionStorage.setItem("mt-found", JSON.stringify([...found])); } catch (e) {}
    paintHud();
    // Things found automatically by scrolling or visiting are counted quietly, only discoveries made by hand raise a notice
    if (["footer", "studio", "lost", "zoom"].includes(key)) return;
    if (toast) { toast.textContent = `Found: ${note || (FINDS.find(([k]) => k === key) || [])[1] || ""}`; toast.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("is-on"), 2400); }
  };
  window.mtDiscover = (key) => discover(key);
  const lightInks = (cx, cy, rr, held) => {
    for (const el of inks) {
      const b = el.getBoundingClientRect();
      const hit = cx + rr > b.left && cx - rr < b.right && cy + rr > b.top && cy - rr < b.bottom;
      el.style.setProperty("--sx", `${(cx - b.left).toFixed(1)}px`);
      el.style.setProperty("--sy", `${(cy - b.top).toFixed(1)}px`);
      el.style.setProperty("--sr", hit ? `${rr.toFixed(1)}px` : "0px");
      el.classList.toggle("is-lit", hit);
      if (hit && held && el.dataset.find) {
        const n = el.querySelector(".mt-note");
        const nb = n ? n.getBoundingClientRect() : b;
        if (Math.hypot(nb.left + nb.width / 2 - cx, nb.top + nb.height / 2 - cy) < Math.max(40, 0.55 * rr)) discover("note", n ? n.textContent : "");
      }
    }
  };

  /* Notice pill — appears after 3.2s on the first page (1.4s if the loader was seen), 2.2s on other pages, and disappears after 8s or on wheel */
  const hint = document.querySelector(".mt-hint");
  if (hint) {
    hint.classList.add("is-gone");
    let shown = false;
    try { shown = sessionStorage.getItem("mt-hint") === "1"; } catch (e) {}
    if (!shown) {
      const home = !!document.querySelector("[data-loupe-home]");
      const hide = () => { hint.classList.add("is-gone"); };
      const show = () => { hint.classList.remove("is-gone"); setTimeout(hide, 8000); setTimeout(() => { addEventListener("wheel", hide, { passive: true, once: true }); addEventListener("keydown", hide, { once: true }); }, 600); };
      const intro = root.classList.contains("mt-intro");
      const arm = (fn, ms) => (document.readyState === "complete" ? setTimeout(fn, ms) : addEventListener("load", () => setTimeout(fn, ms), { once: true }));
      arm(() => {
        try { sessionStorage.setItem("mt-hint", "1"); } catch (e) {}
        // On the home page the lens is first seen passing over the heading (2.6s), and when it ends the guide appears
        if (home && window.mtLensDemo) { addEventListener("mt:demo-done", show, { once: true }); window.mtLensDemo(); } else show();
      }, home ? (intro ? 3200 : 1400) : 2200);
      // The original’s reference is when the app attaches (near the end of loading), so it counts from after the document load
    }
  }

  /* Sound button — four bars bounce at a 1.05s tempo and stop when pressed (there is no sound file) */
  document.querySelectorAll("[data-sound]").forEach((b) => b.addEventListener("click", () => {
    const s = b.querySelector(".mt-sound");
    s.classList.toggle("is-on");
    b.setAttribute("aria-pressed", String(!s.classList.contains("is-on")));
  }));

  /* ── X-ray annotation: for each data-x element, draw its box · name · size · color · note on the canvas ── */
  const xEls = () => [...document.querySelectorAll("main [data-x], footer [data-x], .mt-nav [data-x]")];
  const palette = () => ({ accent: css("--kf-accent"), paper: css("--kf-bg"), ink: css("--kf-ink"), on: css("--kf-on-accent"), mono: css("--kf-font-mono") || "monospace" });
  const hex = (c) => { const m = c.match(/\d+(\.\d+)?/g); return m ? "#" + m.slice(0, 3).map((v) => (+v | 0).toString(16).padStart(2, "0")).join("") : c; };
  const drawNotes = (ctx, list, ox, oy, pal, opt = {}) => {
    ctx.save();
    ctx.font = `10px ${pal.mono}`;
    ctx.textBaseline = "top";
    for (const { el, r } of list) {
      const x = r.left - ox, y = r.top - oy;
      ctx.strokeStyle = opt.line || pal.paper;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(x) + 0.5, Math.round(y) + 0.5, Math.round(r.width), Math.round(r.height));
      const cs = getComputedStyle(el);
      const tag = `${el.dataset.x} ${Math.round(r.width)}×${Math.round(r.height)}`;
      const tw = ctx.measureText(tag).width + 10;
      ctx.globalAlpha = 1;
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x, y - 16, tw, 15);
      ctx.fillStyle = pal.on;
      ctx.fillText(tag, x + 5, y - 13);
      if (el.dataset.xFont !== undefined || el.dataset.xColor !== undefined) {
        const spec = `${Math.round(parseFloat(cs.fontSize))}px   ${hex(cs.color)}`;
        const sw = ctx.measureText(spec).width + 10;
        ctx.fillStyle = opt.bg || pal.ink;
        ctx.fillRect(x, y + 2, sw, 15);
        ctx.strokeStyle = opt.line || pal.paper;
        ctx.strokeRect(x + 0.5, y + 2.5, sw, 14);
        ctx.fillStyle = opt.fg || pal.paper;
        ctx.fillText(spec, x + 5, y + 5);
      }
      if (opt.notes && el.dataset.note) {
        ctx.fillStyle = opt.fg || pal.paper;
        ctx.fillText(el.dataset.note, x + 2, y + 21);
      }
    }
    ctx.restore();
  };
  const inRect = (x, y, w, h) => xEls().map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 0 && r.right > x && r.left < x + w && r.bottom > y && r.top < y + h);
  const sizeCanvas = (cv, w, h) => { const dpr = Math.min(devicePixelRatio || 1, 2); cv.width = w * dpr; cv.height = h * dpr; cv.style.width = `${w}px`; cv.style.height = `${h}px`; const c = cv.getContext("2d"); c.setTransform(dpr, 0, 0, dpr, 0, 0); return c; };

  /* X-ray button — recolors the whole panel to blueprint colors and covers every data-x with annotations.
     Normally the same plate acts as an inspector — one hovered data-x element gets an accent box and name tag (plate appears in .2s) */
  const xrayCanvas = document.createElement("canvas");
  xrayCanvas.className = "mt-inspect";
  xrayCanvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(xrayCanvas);
  let xray = false, xrayCtx = sizeCanvas(xrayCanvas, innerWidth, innerHeight), hoverX = null, lastX = null, fade = 0, fadeRaf = 0;
  const paintXray = () => {
    xrayCtx.clearRect(0, 0, innerWidth, innerHeight);
    if (xray) { drawNotes(xrayCtx, inRect(0, 0, innerWidth, innerHeight), 0, 0, palette(), { notes: true, line: css("--kf-bg"), fg: css("--kf-bg"), bg: "transparent" }); return; }
    const el = hoverX || lastX;
    if (el && el.isConnected && fade > 0.01) { const pal = palette(); xrayCtx.save(); xrayCtx.globalAlpha = fade; drawNotes(xrayCtx, [{ el, r: el.getBoundingClientRect() }], 0, 0, pal, { line: pal.accent, fg: pal.ink, bg: pal.paper }); xrayCtx.restore(); }
  };
  // Check box — without changing the panel’s opacity, it follows the share to draw by .28 each frame (original D)
  const fadeStep = () => {
    fadeRaf = 0;
    const want = hoverX && !root.classList.contains("mt-lens-held") ? 1 : 0;
    fade += (want - fade) * 0.28;
    if (Math.abs(want - fade) < 0.01) fade = want;
    paintXray();
    // As in the original, turn the layer on (.2s) when there is something to draw and turn it off once everything has faded
    xrayCanvas.style.opacity = xray || fade > 0.005 ? "1" : "0";
    if (fade !== want) fadeRaf = requestAnimationFrame(fadeStep);
  };
  document.querySelectorAll("[data-xray]").forEach((b) => b.addEventListener("click", () => {
    xray = !xray;
    root.classList.toggle("mt-xray", xray);
    if (xray) discover("xray");
    b.setAttribute("aria-pressed", String(xray));
    paintXray();
    xrayCanvas.style.opacity = xray ? "1" : "0";
    if (toast) { toast.textContent = xray ? "X-ray — Your one-line guide here: every cell’s name and size are visible." : "X-ray turned off."; toast.classList.add("is-on"); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove("is-on"), 3200); }
  }));
  if (fine) window.addEventListener("pointermove", (e) => {
    if (xray) return;
    const t = e.target instanceof Element ? e.target.closest("main [data-x], footer [data-x], .mt-nav [data-x]") : null;
    if (t === hoverX) return;
    // As in the original, moving to another cell makes the box float up again from 0 (continues if it’s the same cell still fading)
    if (t && t !== lastX) { lastX = t; fade = 0; }
    hoverX = t;
    if (!fadeRaf) fadeRaf = requestAnimationFrame(fadeStep);
  }, { passive: true });
  addEventListener("resize", () => { xrayCtx = sizeCanvas(xrayCanvas, innerWidth, innerHeight); paintXray(); });
  window.addEventListener("scroll", () => (xray || hoverX) && requestAnimationFrame(paintXray), { passive: true });

  /* Press lens — holding for 170ms with a mouse (380ms with a finger) reveals the inverted blueprint inside a circle of 150px radius (110px on phone).
     The circle fills .16 per frame and its position follows at .6 (while held) · .3. When not held, it is an 11px red ring cursor */
  if (!reduce) {
    const R0 = innerWidth < 768 ? 110 : 150, L = 2 * R0 + 24;
    const disc = document.createElement("canvas"), ring = document.createElement("canvas");
    for (const c of [disc, ring]) {
      Object.assign(c.style, { position: "fixed", left: "0", top: "0", zIndex: "105", pointerEvents: "none", transform: "translate3d(-1000px,-1000px,0)", willChange: "transform" });
      c.setAttribute("aria-hidden", "true");
      document.body.appendChild(c);
    }
    disc.style.mixBlendMode = "difference";
    const dctx = sizeCanvas(disc, L, L), rctx = sizeCanvas(ring, L, L);
    let tx = -1e3, ty = -1e3, x = -1e3, y = -1e3, open = 0, cur = 0, held = false, press = false, overLink = false, timer = 0, raf = 0, sx = 0, sy = 0, demo = null, px0 = -1e3, py0 = -1e3;
    const frame = () => {
      raf = 0;
      if (demo) {
        // Demo — the lens passes from .12 left of the title to the right (up to 520px) over 2.6s, curving up 18px (easeInOutQuad)
        const t = Math.min(1, (performance.now() - demo.t0) / 2600), n = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        tx = demo.a.x + (demo.b.x - demo.a.x) * n; ty = demo.a.y + (demo.b.y - demo.a.y) * n - 18 * Math.sin(n * Math.PI);
        if (t >= 1) { demo = null; held = false; root.classList.remove("mt-lens-held"); tx = fine ? px0 : -1e3; ty = fine ? py0 : -1e3; window.dispatchEvent(new Event("mt:demo-done")); }
      }
      const want = held ? 1 : 0;
      open += (want - open) * 0.16;
      if (Math.abs(want - open) < 0.002) open = want;
      const k = held ? 0.6 : 0.3;
      x += (tx - x) * k; y += (ty - y) * k;
      const o = R0 * open, s = L / 2, pal = palette();
      const showNow = fine && !held && !xray && !overLink && tx > -500 && !root.classList.contains("mt-loupe-held") ? (press ? 1.7 : 1) : 0;
      disc.style.transform = ring.style.transform = `translate3d(${x - L / 2}px, ${y - L / 2}px, 0)`;
      dctx.clearRect(0, 0, L, L);
      rctx.clearRect(0, 0, L, L);
      if (o > 1) {
        dctx.fillStyle = pal.paper;
        dctx.beginPath(); dctx.arc(s, s, o, 0, Math.PI * 2); dctx.fill();
        rctx.save();
        rctx.beginPath(); rctx.arc(s, s, o, 0, Math.PI * 2); rctx.clip();
        const ox = x - s, oy = y - s;
        rctx.strokeStyle = pal.paper; rctx.globalAlpha = 0.22; rctx.lineWidth = 1; rctx.beginPath();
        for (let gx = -((ox % 16) + 16) % 16; gx < L; gx += 16) { rctx.moveTo(Math.round(gx) + 0.5, 0); rctx.lineTo(Math.round(gx) + 0.5, L); }
        for (let gy = -((oy % 16) + 16) % 16; gy < L; gy += 16) { rctx.moveTo(0, Math.round(gy) + 0.5); rctx.lineTo(L, Math.round(gy) + 0.5); }
        rctx.stroke(); rctx.globalAlpha = 1;
        drawNotes(rctx, inRect(x - o, y - o, 2 * o, 2 * o), ox, oy, pal, { notes: true });
        rctx.strokeStyle = pal.accent; rctx.globalAlpha = 0.55; rctx.beginPath();
        rctx.moveTo(s + 0.5, s - o); rctx.lineTo(s + 0.5, s + o); rctx.moveTo(s - o, s + 0.5); rctx.lineTo(s + o, s + 0.5); rctx.stroke();
        rctx.globalAlpha = 1; rctx.fillStyle = pal.accent; rctx.beginPath(); rctx.arc(s, s, 2.5, 0, Math.PI * 2); rctx.fill();
        rctx.font = `10px ${pal.mono}`; rctx.textAlign = "center"; rctx.textBaseline = "middle";
        const t = `x ${Math.round(x)}   y ${Math.round(y + scrollY)}`, tw = rctx.measureText(t).width + 12;
        rctx.fillStyle = pal.ink; rctx.fillRect(s - tw / 2, s + o - 30, tw, 16);
        rctx.fillStyle = pal.paper; rctx.fillText(t, s, s + o - 22);
        rctx.restore();
        rctx.strokeStyle = pal.accent; rctx.lineWidth = 1.5; rctx.beginPath(); rctx.arc(s, s, o, 0, Math.PI * 2); rctx.stroke();
        rctx.lineWidth = 1; rctx.beginPath();
        for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, n = i % 6 === 0 ? 8 : 4; rctx.moveTo(s + Math.cos(a) * (o + 3), s + Math.sin(a) * (o + 3)); rctx.lineTo(s + Math.cos(a) * (o + 3 + n), s + Math.sin(a) * (o + 3 + n)); }
        rctx.stroke();
      }
      const show = showNow;
      cur += (show - cur) * 0.2;
      if (cur > 0.01 && open < 0.2) {
        rctx.strokeStyle = pal.accent; rctx.lineWidth = 1.5; rctx.globalAlpha = Math.min(1, cur);
        rctx.beginPath(); rctx.arc(s, s, 11 * cur + o, 0, Math.PI * 2); rctx.stroke();
        rctx.fillStyle = pal.accent; rctx.beginPath(); rctx.arc(s, s, 2 * Math.min(1, cur), 0, Math.PI * 2); rctx.fill(); rctx.globalAlpha = 1;
      }
      if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3 || open !== want || Math.abs(show - cur) > 0.01 || held || demo) raf = requestAnimationFrame(frame);
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(frame); };
    const blocked = (t) => t instanceof Element && t.closest("a, button, input, textarea, select, label, [data-no-lens]");
    window.mtLensDemo = () => {
      const h = document.querySelector("h1"), r = h && h.getBoundingClientRect();
      const a = r && r.width > 40 && r.top > 0 && r.bottom < innerHeight ? { x: r.left + 0.12 * r.width, y: r.top + 0.62 * r.height } : { x: 0.3 * innerWidth, y: 0.55 * innerHeight };
      const b = r && r.width > 40 && r.top > 0 && r.bottom < innerHeight ? { x: r.left + Math.min(0.88 * r.width, 0.12 * r.width + 520), y: r.top + 0.55 * r.height } : { x: 0.7 * innerWidth, y: 0.5 * innerHeight };
      demo = { a, b, t0: performance.now() };
      tx = x = a.x; ty = y = a.y; held = true; root.classList.add("mt-lens-held");
      ask();
      return true;
    };
    window.addEventListener("pointermove", (e) => {
      px0 = e.clientX; py0 = e.clientY;
      if (demo) return;
      tx = e.clientX; ty = e.clientY; overLink = !!blocked(e.target);
      if (press && timer && Math.hypot(tx - sx, ty - sy) > 12) { clearTimeout(timer); timer = 0; press = false; }
      ask();
    }, { passive: true });
    window.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || xray || (e.target instanceof Element && e.target.closest("[data-no-lens], .mt-loupe-hit, input, textarea, select"))) return;
      press = true; sx = tx = e.clientX; sy = ty = e.clientY;
      if (e.pointerType !== "mouse") { x = tx; y = ty; }
      clearTimeout(timer);
      timer = setTimeout(() => { timer = 0; press = false; held = true; root.classList.add("mt-lens-held"); discover("lens"); ask(); }, e.pointerType === "mouse" ? 170 : 380);
      ask();
    });
    const up = () => { press = false; clearTimeout(timer); timer = 0; if (held) { held = false; root.classList.remove("mt-lens-held"); } ask(); };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    document.documentElement.addEventListener("mouseleave", () => { tx = ty = -1e3; ask(); });
    window.addEventListener("scroll", () => held && ask(), { passive: true });
  }

  /* ── 3D magnifier — newly built with three, ring · handle. In the hero position / off-screen in the build section / otherwise in the bottom right corner.
     Motion uses the original springs (stiffness k, damping ζ, split into 1/120 s steps): position 70·.92 (held 520·.72) · size 150·.9 · lift 150·.4 (held .8) · tilt 160·.8 (held .4) ── */
  const glHost = document.querySelector(".mt-loupe-gl");
  if (glHost && window.THREE && !reduce) {
    const T = THREE;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "default" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    glHost.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 7);

    // Ambient light — an environment map (ours) baked by floating three bright panels in a round room
    const pm = new T.PMREMGenerator(renderer);
    const room = new T.Scene();
    const wall = new T.Mesh(new T.BoxGeometry(12, 12, 12), new T.MeshBasicMaterial({ color: new T.Color(css("--kf-dim")), side: T.BackSide }));
    room.add(wall);
    const panel = (w, h, pos, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(css("--kf-bg")).multiplyScalar(k) })); m.position.set(...pos); m.lookAt(0, 0, 0); room.add(m); };
    panel(6, 3, [0, 5, 2], 3.2); panel(3, 5, [-5.5, 0, 1], 2); panel(3, 5, [5.5, 1, -1], 1.4);
    scene.environment = pm.fromScene(room, 0.04).texture;
    scene.add(new T.AmbientLight(new T.Color(css("--kf-bg")), 0.35));
    const key = new T.DirectionalLight(new T.Color(css("--kf-bg")), 1.4); key.position.set(-2, 4, 6); scene.add(key);
    const warm = new T.PointLight(new T.Color(css("--kf-accent-soft")), 0.8); warm.position.set(-2, -3, 4); scene.add(warm);

    const ink = new T.Color(css("--kf-ink")), paper = new T.Color(css("--kf-bg")), acc = new T.Color(css("--kf-accent"));
    const mix = (a, b, t) => a.clone().lerp(b, t);
    const M = {
      face: new T.MeshPhysicalMaterial({ color: mix(ink, paper, 0.1), metalness: 1, roughness: 0.36, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 1.5, side: T.DoubleSide }),
      polish: new T.MeshStandardMaterial({ color: mix(paper, ink, 0.12), metalness: 1, roughness: 0.1, envMapIntensity: 2.1, side: T.DoubleSide }),
      wall: new T.MeshStandardMaterial({ color: mix(ink, paper, 0.15), metalness: 1, roughness: 0.3, envMapIntensity: 1.6, side: T.DoubleSide }),
      inner: new T.MeshStandardMaterial({ color: ink.clone(), metalness: 0.7, roughness: 0.55, envMapIntensity: 0.8, side: T.DoubleSide }),
      tick: new T.MeshStandardMaterial({ color: mix(paper, ink, 0.14), metalness: 0.9, roughness: 0.25, envMapIntensity: 1.8 }),
      mark: new T.MeshBasicMaterial({ color: acc.clone(), toneMapped: false }),
      band: new T.MeshPhysicalMaterial({ color: mix(acc, ink, 0.08), metalness: 0.75, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.4 }),
      grip: new T.MeshPhysicalMaterial({ color: mix(ink, paper, 0.06), metalness: 0.35, roughness: 0.62, clearcoat: 0.2 }),
      dot: new T.MeshStandardMaterial({ color: acc.clone(), emissive: acc.clone(), emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.1, toneMapped: false }),
      glass: new T.MeshPhysicalMaterial({ color: paper.clone(), transparent: true, opacity: 0.1, roughness: 0.03, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 1, iridescenceIOR: 1.45, iridescenceThicknessRange: [160, 440], envMapIntensity: 2.4, depthWrite: false }),
    };
    // Rim cross-section — a polyline joining inner wall · front face · outer wall is lathed (radius .9 ~ 1.13, thickness .2)
    const prof = [[0.9, -0.07, 0.9, 0.055, "inner"], [0.9, 0.055, 0.93, 0.096, "polish"], [0.93, 0.096, 1.085, 0.096, "face"], [1.085, 0.096, 1.13, 0.05, "polish"],
      [1.13, 0.05, 1.13, -0.06, "wall"], [1.13, -0.06, 1.1, -0.1, "polish"], [1.1, -0.1, 0.93, -0.1, "wall"], [0.93, -0.1, 0.9, -0.07, "wall"]];
    const loupe = new T.Group(), body = new T.Group();
    const rim = new T.Group(); rim.rotation.x = Math.PI / 2;
    prof.forEach(([a, b, c, d, m]) => rim.add(new T.Mesh(new T.LatheGeometry([new T.Vector2(a, b), new T.Vector2(c, d)], 180), M[m])));
    body.add(rim);
    const ticks = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), M.tick, 72);
    const dummy = new T.Object3D();
    for (let n = 0; n < 72; n++) {
      const a = (n / 72) * Math.PI * 2, big = n % 6 === 0, len = big ? 0.062 : 0.032, rr = 1.078 - len / 2;
      dummy.position.set(Math.cos(a) * rr, Math.sin(a) * rr, 0.098); dummy.rotation.set(0, 0, a); dummy.scale.set(len, big ? 0.009 : 0.006, 0.004); dummy.updateMatrix();
      ticks.setMatrixAt(n, dummy.matrix);
    }
    const tickGroup = new T.Group(); tickGroup.add(ticks); body.add(tickGroup);
    const redRing = new T.Mesh(new T.RingGeometry(0.947, 0.956, 180), M.mark); redRing.position.z = 0.0975; body.add(redRing);
    const lensDisc = new T.Mesh(new T.CircleGeometry(0.895, 128), M.glass); lensDisc.position.z = 0.01; body.add(lensDisc);
    const dot = new T.Mesh(new T.SphereGeometry(0.092, 48, 48), M.dot); body.add(dot);
    const handle = new T.Group(); handle.rotation.z = Math.PI / 4;
    const part = (geo, mat, y, rx) => { const m = new T.Mesh(geo, mat); m.position.y = y; if (rx) m.rotation.x = rx; handle.add(m); };
    part(new T.CylinderGeometry(0.098, 0.128, 0.36, 48), M.wall, -1.24);
    part(new T.TorusGeometry(0.131, 0.012, 12, 64), M.polish, -1.425, Math.PI / 2);
    part(new T.CylinderGeometry(0.142, 0.142, 0.075, 48), M.band, -1.475);
    part(new T.CylinderGeometry(0.146, 0.156, 1.1, 48), M.grip, -2.06);
    for (let e = 0; e < 6; e++) part(new T.TorusGeometry(0.152 + 0.0012 * e, 0.0055, 8, 64), M.polish, -1.7 - 0.12 * e, Math.PI / 2);
    part(new T.CylinderGeometry(0.156, 0.118, 0.14, 48), M.polish, -2.69);
    body.add(handle);
    loupe.add(body);
    scene.add(loupe);

    // Shadow — a soft ellipse falling on the paper (the higher it lifts, the farther and fainter it gets)
    const shadowCv = document.createElement("canvas");
    Object.assign(shadowCv.style, { position: "fixed", inset: "0", zIndex: "68", pointerEvents: "none" });
    document.body.appendChild(shadowCv);
    let sctx = null;

    const hit = document.createElement("div");
    hit.className = "mt-loupe-hit";
    hit.setAttribute("aria-hidden", "true");
    hit.dataset.noLens = "";
    document.body.appendChild(hit);
    const view = document.querySelector(".mt-loupe-view");
    const vPage = view && view.querySelector(".mt-loupe-page"), vFixed = view && view.querySelector(".mt-loupe-fixed");

    const spring = (s, target, k, z, dt) => { const a = 2 * z * Math.sqrt(k); let left = dt; while (left > 0) { const h = Math.min(left, 1 / 120); s.v += (k * (target - s.x) - a * s.v) * h; s.x += s.v * h; left -= h; } };
    const S = (x = 0) => ({ x, v: 0 });
    const st = { mode: "home", px: -1e3, py: -1e3, grabU: 0, grabV: 0, lastX: 0, lastY: 0, tickA: 0, dotMix: 0 };
    const p = { x: S(-1e3), y: S(-1e3), R: S(40), lift: S(0), rx: S(), ry: S(), rz: S(-0.22), mix: 0, settled: false, last: null };
    const home = document.querySelector("[data-loupe-home]"), away = document.querySelector("[data-loupe-away]"), floor = document.querySelector("[data-loupe-floor]");

    // Clone to show inside the circle while held — copies body·footer as is and places it at 1.6× (pinned sections go to their current position)
    let built = false, rebuildT = 0;
    const strip = (n) => { n.removeAttribute("id"); n.querySelectorAll("[id]").forEach((e) => e.removeAttribute("id")); n.querySelectorAll("canvas, script, video").forEach((e) => e.remove()); n.querySelectorAll("a, button, input, textarea").forEach((e) => e.setAttribute("tabindex", "-1")); };
    const build = () => {
      if (!vPage) return;
      vPage.replaceChildren(); vFixed.replaceChildren();
      const main = document.querySelector("main"), foot = document.querySelector("footer"), head = document.querySelector(".mt-nav");
      if (main) {
        const c = main.cloneNode(true);
        const a = [...main.querySelectorAll("*")], b = [...c.querySelectorAll("*")];
        a.forEach((el, i) => {
          if (getComputedStyle(el).position !== "sticky") return;
          const now = el.getBoundingClientRect().top + scrollY;
          const prev = el.style.position; el.style.position = "static";
          const base = el.getBoundingClientRect().top + scrollY; el.style.position = prev;
          if (b[i]) { b[i].style.position = "relative"; b[i].style.top = "0px"; b[i].style.translate = `0 ${(now - base).toFixed(1)}px`; }
        });
        strip(c); vPage.append(c);
      }
      if (foot) { const c = foot.cloneNode(true); strip(c); vPage.append(c); }
      if (head) { const c = head.cloneNode(true); strip(c); vFixed.append(c); }
      vPage.style.width = `${document.documentElement.clientWidth}px`;
      built = true;
    };
    const onViewScroll = () => { clearTimeout(rebuildT); rebuildT = setTimeout(build, 140); };
    const startView = () => { build(); window.addEventListener("scroll", onViewScroll, { passive: true }); };
    const stopView = () => { clearTimeout(rebuildT); window.removeEventListener("scroll", onViewScroll); vPage && vPage.replaceChildren(); vFixed && vFixed.replaceChildren(); built = false; if (view) view.style.opacity = "0"; };
    const place = (cx, cy, rr, o) => {
      view.style.opacity = o.toFixed(3);
      view.style.clipPath = `circle(${rr.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      const ox = cx * (1 - 1.6), oy = cy * (1 - 1.6);
      vPage.style.transform = `translate3d(${ox.toFixed(1)}px, ${(oy - 1.6 * scrollY).toFixed(1)}px, 0) scale(1.6)`;
      vFixed.style.transform = `translate3d(${ox.toFixed(1)}px, ${oy.toFixed(1)}px, 0) scale(1.6)`;
    };

    const hold = (on) => {
      const m = on ? "held" : "home";
      if (st.mode === m) return;
      st.mode = m;
      root.classList.toggle("mt-loupe-held", on);
      hit.classList.toggle("is-held", on);
      if (on) { p.rx.v += 2.4 * clamp(st.grabV, -1.5, 1.5); p.ry.v += 2.4 * clamp(st.grabU, -1.5, 1.5); }
      else { p.rx.v -= 3 * p.rx.x; p.ry.v -= 3 * p.ry.x; }
    };
    hit.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      try { hit.setPointerCapture(e.pointerId); } catch (err) {}
      const b = hit.getBoundingClientRect(), u = b.width / 2 / 1.13;
      if (u < 1) return;
      st.grabU = (b.left + b.width / 2 - e.clientX) / u;
      st.grabV = (b.top + b.height / 2 - e.clientY) / u;
      st.px = e.clientX; st.py = e.clientY;
      hold(true);
      discover("loupe");
      e.preventDefault();
    });
    const release = (e) => { if (st.mode !== "held") return; hold(false); try { hit.releasePointerCapture(e.pointerId); } catch (err) {} };
    hit.addEventListener("pointerup", release);
    hit.addEventListener("pointercancel", release);
    window.addEventListener("pointermove", (e) => { st.px = e.clientX; st.py = e.clientY; }, { passive: true });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") hold(false); });
    window.addEventListener("blur", () => hold(false));

    let W = 0, H = 0;
    const resize = () => {
      W = innerWidth; H = innerHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      sctx = sizeCanvas(shadowCv, W, H);
    };
    resize();
    window.addEventListener("resize", resize);
    let last = performance.now(), t0 = last, prevPX = 0, prevPY = 0;
    const tick = (now) => {
      requestAnimationFrame(tick);
      const dt = Math.min(Math.max(0.001, (now - last) / 1000), 0.05); last = now;
      const t = (now - t0) / 1000, held = st.mode === "held";
      let m = { cx: W - (fine ? 40 : 4), cy: H - (fine ? 132 : 210), R: 24, lift: 0.1, kind: "dock" };
      if (away) { const b = away.getBoundingClientRect(); if (b.top < 0.5 * H && b.bottom > 0.5 * H) m = { ...m, cx: W + 3.4 * m.R, kind: "away" }; }
      if (home) {
        const b = home.getBoundingClientRect();
        let R = 0.26 * b.width, cy = b.top + 0.42 * b.height;
        const f = floor && floor.getBoundingClientRect();
        if (f && f.height > 0) { R = clamp((f.top - 28 - b.top) / 3.72, 44, R); cy = b.top + 1.16 * R; }
        const cx = b.left + 0.42 * b.width;
        if (b.width > 0 && cy > -0.3 * b.height && cy < H + 0.3 * b.height) m = { cx, cy, R, lift: 0.36 + 0.07 * Math.sin(1.05 * t), kind: "hero" };
      }
      if (!held && p.last && p.last.kind === m.kind) { p.x.x += m.cx - p.last.cx; p.y.x += m.cy - p.last.cy; }
      p.last = m;
      let R = m.R, lift = m.lift, X = m.cx, Y = m.cy;
      const scaleNow = p.R.x * (1 + 0.07 * p.lift.x);
      if (held) { R = fine ? 128 : 100; lift = 1; X = st.px + st.grabU * scaleNow; Y = st.py + st.grabV * scaleNow; }
      if (!p.settled) { p.settled = true; p.x = S(X); p.y = S(Y); p.R = S(R); p.lift = S(lift); }
      spring(p.x, X, held ? 520 : 70, held ? 0.72 : 0.92, dt);
      spring(p.y, Y, held ? 520 : 70, held ? 0.72 : 0.92, dt);
      spring(p.R, R, 150, 0.9, dt);
      spring(p.lift, lift, 150, held ? 0.8 : 0.4, dt);
      if (p.lift.x < -0.22) p.lift.x = -0.22;
      p.mix += ((held ? 1 : 0) - p.mix) * Math.min(1, 9 * dt);
      const E = Math.max(1, 3.2 * p.R.x), on = fine && st.px > -500;
      const A = on ? clamp((st.px - p.x.x) / E, -1.4, 1.4) : 0, C = on ? clamp((st.py - p.y.x) / E, -1.4, 1.4) : 0;
      spring(p.rx, held ? clamp(36e-5 * p.y.v, -0.42, 0.42) : 0.2 * C, 160, held ? 0.4 : 0.8, dt);
      spring(p.ry, held ? clamp(36e-5 * p.x.v, -0.42, 0.42) : 0.28 * A, 160, held ? 0.4 : 0.8, dt);
      spring(p.rz, -0.22 + (held ? clamp(11e-5 * p.x.v, -0.13, 0.13) : 0), 90, 0.55, dt);
      const N = H / (2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360));
      const D = p.R.x * (1 + 0.07 * p.lift.x);
      const bob = m.kind === "hero" && !held ? 0.012 * Math.sin(1.05 * t + 0.6) * D * (1 - p.mix) : 0;
      const cx = p.x.x, cy = p.y.x + bob;
      loupe.position.set((cx - W / 2) / N, (H / 2 - cy) / N, 0);
      loupe.rotation.set(p.rx.x, p.ry.x, p.rz.x);
      loupe.scale.setScalar(D / N);
      st.dotMix += ((held ? 1 : 0) - st.dotMix) * Math.min(1, 7 * dt);
      dot.position.set(0, 0.99 * st.dotMix, 0.06 + 0.05 * st.dotMix);
      dot.scale.setScalar(1 - 0.66 * st.dotMix);
      if (held) st.tickA += (st.px - prevPX - (st.py - prevPY)) * 0.0016;
      prevPX = st.px; prevPY = st.py;
      tickGroup.rotation.z = st.tickA;
      const glassR = 0.895 * D;
      hit.style.width = hit.style.height = `${2.26 * D}px`;
      hit.style.transform = `translate3d(${cx - 1.13 * D}px, ${cy - 1.13 * D}px, 0)`;
      sctx.clearRect(0, 0, W, H);
      const lifted = 0.5 + p.lift.x;
      sctx.save();
      sctx.globalAlpha = clamp(0.2 - 0.08 * p.lift.x, 0.06, 0.2);
      sctx.filter = `blur(${(8 + 20 * lifted).toFixed(0)}px)`;
      sctx.fillStyle = css("--kf-ink");
      const sx = cx + D * (0.28 + 0.22 * lifted), sy = cy + D * (0.34 + 0.3 * lifted);
      sctx.beginPath(); sctx.ellipse(sx, sy, D * 1.08, D * 1.0, 0, 0, Math.PI * 2);
      sctx.ellipse(sx, sy, D * 0.86, D * 0.8, 0, 0, Math.PI * 2, true); sctx.fill("evenodd");
      sctx.beginPath(); sctx.moveTo(sx + D * 0.6, sy + D * 0.6); sctx.lineTo(sx + D * 1.9, sy + D * 1.9); sctx.lineWidth = D * 0.3; sctx.strokeStyle = sctx.fillStyle; sctx.stroke();
      sctx.restore();
      lightInks(cx, cy, glassR, held);
      if (held && view && !built) startView();
      if (built) { place(cx, cy, glassR, p.mix); if (!held && p.mix < 0.02) stopView(); }
      renderer.render(scene, camera);
    };
    requestAnimationFrame(tick);
  } else if (inks.length && fine) {
    // When there is no 3D (reduced motion) — hidden text is lit only near the cursor
    window.addEventListener("pointermove", (e) => lightInks(e.clientX, e.clientY, 96, false), { passive: true });
  }

  const page = location.pathname.split("/").pop();
  if (page === "detail.html") discover("studio");
  const foot = document.querySelector("footer");
  if (foot) new IntersectionObserver((l, o) => l.forEach((en) => { if (en.isIntersecting) { discover("footer"); o.disconnect(); } }), { threshold: 0.6 }).observe(foot);
  document.querySelectorAll("[data-mf]").forEach((el) => el.addEventListener("pointerenter", () => discover("genau"), { once: true }));
  document.querySelectorAll("[data-hlens]").forEach((el) => el.addEventListener("pointerenter", () => discover("reel"), { once: true }));
  document.querySelectorAll("[data-fan] > li").forEach((el) => el.addEventListener("pointerenter", () => discover("scale"), { once: true }));
  document.querySelectorAll("form").forEach((f) => f.addEventListener("input", () => discover("brief"), { once: true }));
  const art = document.querySelector(".mt-art");
  if (art) new IntersectionObserver((l, o) => l.forEach((en) => { if (!en.isIntersecting && en.boundingClientRect.bottom < 0) { discover("lost"); o.disconnect(); } }), {}).observe(art);

  /* Magnet — buttons and header buttons are pulled toward the cursor by (cursor − center) × .32. Spring stiffness 366 (220/.6), damping 30, and they return to place when the cursor leaves */
  if (fine && !reduce) document.querySelectorAll(".mt-btn, .mt-nav-item").forEach((btn) => {
    if (btn.closest(".b-cta, .mt-loupe-view")) return;
    const wrap = document.createElement("div");
    wrap.className = "mt-magnet";
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    const K = 220 / 0.6, strength = 0.32;
    let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, raf = 0, last = 0;
    const step = (now) => {
      const dt = Math.min(0.032, (now - (last || now)) / 1000) || 1 / 60; last = now;
      let left = dt;
      while (left > 0) { const h = Math.min(left, 1 / 120); vx += (K * (tx - x) - 30 * vx) * h; vy += (K * (ty - y) - 30 * vy) * h; x += vx * h; y += vy * h; left -= h; }
      wrap.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      if (Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05 && Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) { x = tx; y = ty; wrap.style.transform = tx || ty ? `translate3d(${x}px, ${y}px, 0)` : ""; raf = 0; last = 0; return; }
      raf = requestAnimationFrame(step);
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(step); };
    wrap.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; const b = wrap.getBoundingClientRect(); tx = (e.clientX - (b.left - x + b.width / 2)) * strength; ty = (e.clientY - (b.top - y + b.height / 2)) * strength; go(); });
    wrap.addEventListener("pointerleave", () => { tx = ty = 0; go(); });
  });

  window.mtShared = { mm, reduce, fine, lenis, css, clamp, discover };
})();
