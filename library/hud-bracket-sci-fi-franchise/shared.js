// Site-wide shared motion — Lenis · transition curtain (.5s fade) · header logo red overlap · phone menu · lifting footer · line growth (.75s steps(12)) ·
// Blinking appear when visible (.12s step-end) · progress-cell slider (small panel group).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;

  // Text fitting — like the original text-fit, sets the font size of [data-fit] text to fill the parent’s inner width (re-runs if the font loads late)
  const fit = () => document.querySelectorAll("[data-fit]").forEach((el) => {
    const box = el.parentElement, cs = getComputedStyle(box);
    const room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(getComputedStyle(el).marginLeft) - parseFloat(getComputedStyle(el).marginRight);
    el.style.fontSize = "100px";
    const w = el.scrollWidth || 1;
    el.style.fontSize = `${(100 * room) / w}px`;
  });
  fit();
  document.fonts?.ready.then(() => { fit(); ScrollTrigger.refresh(); });
  addEventListener("resize", fit);

  // Smooth scroll — original Lenis 1.3.21 · lerp .1
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.kfLenis = lenis;

  // Fixed scroll bar — as in the original, visible while scrolling and while a hand is on the track, and hides 1s after both end. Bar length is screen/document (5–80%)
  const bar = document.createElement("div"), thumb = document.createElement("div");
  bar.className = "a-scrollbar"; thumb.className = "a-scrollbar__track"; bar.setAttribute("aria-hidden", "true");
  bar.appendChild(thumb); document.body.appendChild(bar);
  let hideT = null, over = false, dragging = false, thumbH = 0;
  const docH = () => document.documentElement.scrollHeight;
  const hideLater = () => { clearTimeout(hideT); hideT = null; if (!over && !dragging) hideT = setTimeout(() => bar.classList.remove("is-visible"), 1000); };
  const showBar = () => { bar.classList.add("is-visible"); hideLater(); };
  const placeBar = () => { if (!dragging) gsap.set(thumb, { y: (bar.clientHeight - thumbH) * Math.min(1, Math.max(0, scrollY / Math.max(1, docH() - innerHeight))) }); };
  const sizeBar = () => { gsap.set(thumb, { height: `${Math.min(80, Math.max(5, (innerHeight / docH()) * 100))}%` }); thumbH = thumb.clientHeight; placeBar(); };
  new ResizeObserver(sizeBar).observe(document.body);
  if (lenis) lenis.on("scroll", () => { placeBar(); showBar(); }); else addEventListener("scroll", () => { placeBar(); showBar(); }, { passive: true });
  bar.addEventListener("mouseenter", () => { over = true; clearTimeout(hideT); bar.classList.add("is-visible"); });
  bar.addEventListener("mouseleave", () => { over = false; hideLater(); });
  thumb.addEventListener("pointerdown", (e) => { dragging = true; clearTimeout(hideT); bar.classList.add("is-visible"); thumb.setPointerCapture(e.pointerId); });
  addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const room = bar.clientHeight - thumbH, y = Math.min(room, Math.max(0, e.clientY - thumbH / 2));
    gsap.set(thumb, { y });
    const to = (room > 0 ? y / room : 0) * (docH() - innerHeight);
    lenis ? lenis.scrollTo(to, { immediate: true }) : scrollTo(0, to);
  });
  addEventListener("pointerup", (e) => { if (!dragging) return; dragging = false; thumb.releasePointerCapture?.(e.pointerId); hideLater(); });

  // Transition curtain — the original PageTransition: a black curtain lifts in .5s power3.inOut, and clicking a same-site link covers the screen in the same .5s before navigating
  const veil = document.getElementById("page-transition");
  const EASE = "power3.inOut";
  if (veil) {
    // The original holds the curtain until the first photo panel (WebGL) is downloaded and ready — each page sets that time as data-hold (ms), and after it lifts the first photo opens in 12 steps.
    // A page arriving from within the site (the original does no navigation inside one document) stays dark while covered, until the next page’s photo sheet is fetched again and settles — that wait is held by data-return-hold (default 1.6s)
    const back = root.classList.contains("is-return");
    try { sessionStorage.setItem("kf-hux-seen", "1"); } catch {}
    const hold = back ? Number(document.body.dataset.returnHold) || 1600 : Number(document.body.dataset.hold) || 100;
    const intro = document.querySelector("[data-intro]"), first = intro?.querySelector('[data-fx~="hud-photo-gl"]');
    // As in the original, the first photo appears briefly (.12s) when the WebGL panel is ready (data-photo-at seconds per page)
    const photoAt = Number(document.body.dataset.photoAt ?? 0), photoDur = Number(document.body.dataset.photoDur ?? 0.75);
    // Header title flickers on while the photo comes into focus
    intro?.style.setProperty("--intro-at", `${photoAt + photoDur / 2}s`);
    if (reduce) { veil.style.opacity = "0"; intro?.classList.add("is-in", "is-done"); }
    else gsap.to(veil, { opacity: 0, duration: 0.5, ease: EASE, delay: hold / 1000, onStart: () => { first?.dispatchEvent(new CustomEvent("fx:reveal", { detail: { delay: photoAt, dur: photoDur } })); intro?.classList.add("is-in"); }, onComplete: () => ScrollTrigger.refresh() });
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || a.target || a.getAttribute("href").startsWith("#")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      lenis?.stop();
      gsap.to(veil, { opacity: 1, duration: reduce ? 0 : 0.5, ease: EASE, onComplete: () => location.assign(url.href) });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(veil, { opacity: 0 }); });
  }

  // Header logo — the red letters turn on in three .08s steps, each letter with a different delay (20 to 138ms)
  document.querySelectorAll(".logo-red").forEach((red) => {
    const delays = [138, 107, 53, 95, 41, 102, 20, 103, 81];
    [...red.children].forEach((s, i) => { s.style.transitionDelay = `${delays[i % delays.length]}ms`; });
  });

  // Blink-on text (original text-glyph·blink) — label as word cells > Split anew into letter cells and hide them all, then reveal random letters at intervals of (length / letter count) / 2
  // Turns on with .2s char-only-blink. Rebuilt into new cells on every hover (the original remounts the label). Desktop only — touch devices just show plain text
  const desk = matchMedia("(min-width: 950px) and (hover: hover) and (pointer: fine)");
  const glyph = (el, dur = 0.2) => {
    if (reduce || !desk.matches) return;
    const text = (el.dataset.glyphText ??= el.textContent);
    clearInterval(el._glyphT);
    el.style.setProperty("--duration", `${dur}s`);
    el.style.setProperty("--current-color", getComputedStyle(el).color);
    el.textContent = "";
    const chars = [];
    text.split(" ").forEach((word, i, all) => {
      const w = document.createElement("span");
      w.style.display = "inline-block"; w.style.whiteSpace = "nowrap";
      for (const ch of word) { const g = document.createElement("span"); g.className = "glyph only-blink"; g.textContent = ch; w.appendChild(g); chars.push(g); }
      el.appendChild(w);
      if (i < all.length - 1) { const sp = document.createElement("span"); sp.textContent = " "; el.appendChild(sp); }
    });
    el._glyphT = setInterval(() => {
      if (!chars.length) return clearInterval(el._glyphT);
      chars.splice(Math.floor(Math.random() * chars.length), 1)[0].classList.add("animate");
    }, (dur / Math.max(1, text.length)) * 500);
  };
  window.kfGlyph = glyph;
  // Only once while the pointer is inside — rebuilding the letter cells removes the element under the cursor, so the browser fires pointerenter again (the original remounts only when the hover value changes)
  document.querySelectorAll(".nav__link .cta, .sbtn > .cta, .xbtn .cta").forEach((label) => {
    const host = label.closest("a, button");
    let on = false;
    host?.addEventListener("pointerenter", () => { if (on) return; on = true; glyph(label); });
    host?.addEventListener("pointerleave", () => { on = false; });
  });

  // Small and large buttons blink for .12s not only on hover (CSS :hover) but also on release (the original blinks whenever the hover value changes)
  document.querySelectorAll(".sbtn, .xbtn").forEach((b) => {
    b.addEventListener("pointerenter", () => b.classList.remove("is-left"));
    b.addEventListener("pointerleave", () => { if (desk.matches && !reduce) b.classList.add("is-left"); });
  });

  // Scroll hint — while on screen, every 4.5s the two arrow layers drop again and the text blinks back on (original MScroll)
  document.querySelectorAll("[data-scroll-hint]").forEach((hint) => {
    const label = hint.querySelector("[data-scroll-label]");
    let timer = null;
    const run = () => {
      const chev = hint.querySelector(".hero__chev");
      if (chev) chev.replaceWith(chev.cloneNode(true));
      if (label) glyph(label);
    };
    new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e.isIntersecting) { run(); timer = setInterval(run, 4500); }
    }).observe(hint);
  });

  // Phone menu
  const menuBtn = document.querySelector(".nav__menu"), mnav = document.querySelector(".mnav");
  if (menuBtn && mnav) {
    menuBtn.addEventListener("click", () => {
      const open = !mnav.classList.contains("is-open");
      mnav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.querySelector(".cta").textContent = open ? "Close" : "Menu";
      if (open) lenis?.stop(); else lenis?.start();
    });
  }

  // Retracting footer — set the height of the blank space at the end of the document (footer-mask) to the footer height, and release the footer top clip (--perc) by how much that space has entered the screen
  const footer = document.querySelector(".footer"), mask = document.querySelector(".footer-mask");
  if (footer && mask) {
    const size = () => root.style.setProperty("--footer-h", `${footer.offsetHeight}px`);
    new ResizeObserver(size).observe(footer);
    size();
    const update = () => {
      const r = mask.getBoundingClientRect(), h = footer.offsetHeight || 1;
      const shown = Math.min(h, Math.max(0, innerHeight - r.top));
      footer.style.setProperty("--perc", `${(1 - shown / h) * 100}%`);
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  // Line grow: when visible, 0 → 100% with .75s steps(12)
  const grow = gsap.utils.toArray("[data-grow]");
  if (reduce) gsap.set(grow, { height: "100%" });
  else grow.forEach((g) => {
    const vertical = g.dataset.grow !== "x";
    gsap.set(g, vertical ? { height: 0 } : { width: 0 });
    ScrollTrigger.create({ trigger: g.parentElement, start: "top 90%", once: true, onEnter: () => gsap.to(g, { [vertical ? "height" : "width"]: "100%", duration: 0.75, ease: "steps(12)" }) });
  });

  // Appearance — when visible, it switches on with a .12s stepped blink (original blink step-end)
  gsap.utils.toArray("[data-blink]").forEach((el) => {
    if (reduce) return;
    el.style.opacity = "0";
    ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => {
      gsap.delayedCall(Number(el.dataset.blink) || 0, () => { el.style.opacity = ""; el.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "steps(1, end)" }); });
    } });
  });

  // Progress cell slider — steps through the panels ([data-slide]) inside [data-slides] using cells and arrows. The changed panel enters with a blink
  document.querySelectorAll("[data-slides]").forEach((box) => {
    const slides = [...box.querySelectorAll("[data-slide]")], dots = [...box.querySelectorAll("[data-dots] i")];
    let at = 0;
    const show = (n) => {
      at = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.hidden = i !== at; if (i === at && !reduce) s.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "steps(1, end)" }); });
      dots.forEach((d, i) => d.classList.toggle("is-on", i === at));
      box.dispatchEvent(new CustomEvent("slide", { detail: at }));
    };
    box.querySelector("[data-prev]")?.addEventListener("click", () => show(at - 1));
    box.querySelector("[data-next]")?.addEventListener("click", () => show(at + 1));
    dots.forEach((d, i) => d.addEventListener("click", () => show(i)));
    show(0);
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
