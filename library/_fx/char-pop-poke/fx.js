// Title letter pop + poke: on reaching 88% of the screen, letters pop up from 130% below · ±14° · .55 scale with back.out(2.4), and
// After settling, letters around the cursor (1.9x the font size) rise, tilt and enlarge, then return with elastic from the center when it leaves — reference site title
(() => {
  const splitText = (el) => {
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.append(document.createTextNode(p)); return; }
            const w = document.createElement("span");
            w.className = "fx-pp-w";
            [...p].forEach((c) => {
              const s = document.createElement("span");
              s.className = "fx-pp-c";
              s.textContent = c;
              w.append(s);
              chars.push(s);
            });
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches("svg, img, br, [data-fx-part='skip']")) walk(n);
      });
    };
    walk(el);
    return chars;
  };

  kfFx.register("char-pop-poke", (el, { options, reduce, hover }) => {
    const original = el.innerHTML;
    const label = el.textContent.trim();
    const custom = [...el.querySelectorAll('[data-fx-part="char"]')];
    const chars = custom.length ? custom : splitText(el);
    if (!chars.length) { el.innerHTML = original; return; }
    if (!custom.length && !el.hasAttribute("aria-label")) el.setAttribute("aria-label", label);
    const cleanup = [];
    const pop = options.pop !== "off";
    const rise = +(options.rise ?? 130), rot = +(options.rot ?? 14), from = +(options.scale ?? 0.55);
    const dur = +(options.dur ?? 0.72), each = +(options.each ?? 0.032);
    const ease = kfFx.ease(options.ease || "back.out(2.4)", "back.out(2.4)");
    let ready = !pop || reduce;
    let tween, st;

    const start = () => {
      if (ready) return;
      tween = gsap.from(chars, {
        yPercent: rise, rotate: (i) => (i % 2 ? -rot : rot), scale: from, opacity: 0, transformOrigin: "50% 100%",
        duration: dur, ease, stagger: { each, from: "start" },
        scrollTrigger: window.ScrollTrigger ? { trigger: el, start: options.start || "top 88%", once: true } : undefined,
        onComplete: () => { ready = true; measure(); },
      });
      st = tween.scrollTrigger;
    };
    // Popping while the loader covers the page can’t be seen, so attach it after html.is-loading is lifted
    const root = document.documentElement;
    let mo;
    if (!ready) {
      if (root.classList.contains("is-loading")) {
        mo = new MutationObserver(() => { if (!root.classList.contains("is-loading")) { mo.disconnect(); mo = null; start(); } });
        mo.observe(root, { attributes: true, attributeFilter: ["class"] });
      } else start();
    }

    // Poke nudge — only on devices with a pointer
    let centers = [], fs = 16, raf = 0, at = null;
    const measure = () => {
      const r = el.getBoundingClientRect();
      fs = parseFloat(getComputedStyle(el).fontSize) || 16;
      centers = chars.map((c) => { const b = c.getBoundingClientRect(); return { x: b.left - r.left + b.width / 2 - (gsap.getProperty(c, "x") || 0), y: b.top - r.top + b.height / 2 - (gsap.getProperty(c, "y") || 0) }; });
    };
    const near = (i, x, y, R) => { const k = Math.min(1, Math.max(0, 1 - Math.hypot(x - centers[i].x, y - centers[i].y) / R)); return k * k * (3 - 2 * k); };
    const frame = () => {
      raf = 0;
      if (!at || !ready) return;
      const r = el.getBoundingClientRect(), x = at.x - r.left, y = at.y - r.top, R = +(options.radius ?? 1.9) * fs;
      gsap.to(chars, {
        y: (i) => -0.28 * fs * near(i, x, y, R),
        rotate: (i) => -11 * near(i, x, y, R) * Math.min(1, Math.max(-1, (x - centers[i].x) / (0.5 * R))),
        scale: (i) => 1 + 0.14 * near(i, x, y, R),
        duration: 0.45, ease: "power3.out", overwrite: "auto",
      });
    };
    const move = (e) => { if (!ready) return; at = { x: e.clientX, y: e.clientY }; if (!raf) raf = requestAnimationFrame(frame); };
    const leave = () => { at = null; if (ready) gsap.to(chars, { y: 0, rotate: 0, scale: 1, duration: 0.9, ease: "elastic.out(1, 0.45)", stagger: { each: 0.014, from: "center" }, overwrite: "auto" }); };
    if (hover && !reduce && options.poke !== "off") {
      if (ready) measure();
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      const ro = new ResizeObserver(() => ready && measure());
      ro.observe(el);
      cleanup.push(() => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); ro.disconnect(); });
    }

    return () => {
      mo?.disconnect();
      cancelAnimationFrame(raf);
      cleanup.forEach((f) => f());
      st?.kill();
      tween?.kill();
      gsap.killTweensOf(chars);
      if (!custom.length) { el.innerHTML = original; if (el.getAttribute("aria-label") === label) el.removeAttribute("aria-label"); }
      else gsap.set(chars, { clearProps: "transform,opacity" });
    };
  });
})();
