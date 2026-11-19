// Shared by the whole site — loader, first page header bar unfolding, menu drawer (micromodal), baking chalkboard and confetti patterns.
// Hand-drawn piece bounce, button text wave, hand-drawn arrow and rocket are handled by the motion part (_fx).
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Resolve skin variables to actual colors — canvas can’t read var(), so paint into a hidden cell and take the computed color
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.append(probe);
  const color = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };

  // Keep the grain fixed — a different pattern each time would jitter when shot side by side with the original
  const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  function chalk(size, dots, alpha) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d");
    const rnd = seeded(7);
    g.fillStyle = color("--kf-contrast-ink");
    for (let i = 0; i < dots; i++) {
      g.globalAlpha = rnd() * alpha;
      const r = rnd() * 1.6 + 0.3;
      g.beginPath();
      g.arc(rnd() * size, rnd() * size, r, 0, Math.PI * 2);
      g.fill();
    }
    // Chalkboard erase marks — large, faint smudges
    for (let i = 0; i < 26; i++) {
      g.globalAlpha = rnd() * alpha * 0.25;
      g.beginPath();
      g.ellipse(rnd() * size, rnd() * size, rnd() * 60 + 20, rnd() * 20 + 8, rnd() * Math.PI, 0, Math.PI * 2);
      g.fill();
    }
    return c.toDataURL();
  }

  // Confetti on the original hero background — a 1366px tile scattering squares, triangles, circles, hexagons and stars in four colours
  function confetti() {
    const W = 1366, H = 860;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const rnd = seeded(11);
    const tones = ["--kf-accent", "--site-orange", "--site-green", "--site-yellow", "--site-sky", "--kf-ink"].map(color);
    for (let i = 0; i < 150; i++) {
      g.save();
      g.translate(rnd() * W, rnd() * H);
      g.rotate(rnd() * Math.PI);
      g.fillStyle = tones[(rnd() * tones.length) | 0];
      g.globalAlpha = 0.55 + rnd() * 0.4;
      const s = 3 + rnd() * 6, k = (rnd() * 5) | 0;
      g.beginPath();
      if (k === 0) g.rect(-s, -s / 3, s * 2, s * 0.7);
      else if (k === 1) { g.moveTo(0, -s); g.lineTo(s, s); g.lineTo(-s, s); }
      else if (k === 2) g.arc(0, 0, s * 0.6, 0, Math.PI * 2);
      else if (k === 3) for (let j = 0; j < 6; j++) g.lineTo(Math.cos(j * Math.PI / 3) * s * .7, Math.sin(j * Math.PI / 3) * s * .7);
      else for (let j = 0; j < 10; j++) { const r = j % 2 ? s * .35 : s * .8; g.lineTo(Math.cos(j * Math.PI / 5) * r, Math.sin(j * Math.PI / 5) * r); }
      g.closePath();
      g.fill();
      g.restore();
    }
    return c.toDataURL();
  }

  root.style.setProperty("--sg-chalk", `url(${chalk(480, 2600, 0.16)})`);
  root.style.setProperty("--sg-grain", `url(${chalk(240, 900, 0.18)})`);
  if (document.querySelector(".sg-confetti, .sg-loader")) root.style.setProperty("--sg-confetti", `url(${confetti()})`);

  // ── Loader: after load the curtain lifts in .5s, and once lifted it triggers the Hero motion (sg:loaded)
  const loader = document.getElementById("sg-loader");
  const done = () => window.dispatchEvent(new CustomEvent("sg:loaded"));
  if (loader) {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const hide = () => {
      if (loader.dataset.phase === "exit") return;
      loader.dataset.phase = "exit";
      document.body.style.overflow = prev;
    };
    loader.addEventListener("transitionend", (e) => {
      if (e.target !== loader || e.propertyName !== "opacity") return;
      loader.remove();
      done();
    });
    if (document.readyState === "complete") setTimeout(hide, 0);
    else window.addEventListener("load", hide, { once: true });
  } else setTimeout(done, 0);

  // ── First page header: at the very top it is folded to menu width, and unfolds after scrolling a set distance (original 300·200·80px)
  const header = document.getElementById("sg-header");
  if (header?.classList.contains("is-collapsible")) {
    const bar = header.querySelector(".sg-header__bar");
    let timer = 0;
    const gap = () => (matchMedia("(max-width: 480px)").matches ? 80 : matchMedia("(max-width: 820px)").matches ? 200 : 300);
    const measure = () => {
      if (header.classList.contains("is-scrolled")) return;
      bar.style.width = "max-content";
      bar.style.maxWidth = "none";
      const w = Math.ceil(bar.getBoundingClientRect().width);
      bar.style.width = bar.style.maxWidth = "";
      header.style.setProperty("--sg-collapsed", `${Math.max(56, w)}px`);
    };
    const sync = () => {
      const on = scrollY > gap();
      if (on === header.classList.contains("is-scrolled")) return;
      clearTimeout(timer);
      header.classList.toggle("is-scrolled", on);
      header.classList.remove("is-titled");
      // Title turns on after the width has fully expanded (.4s)
      if (on) timer = setTimeout(() => header.classList.add("is-titled"), reduce ? 0 : 400);
    };
    measure();
    document.fonts?.ready.then(measure);
    addEventListener("resize", measure);
    addEventListener("scroll", sync, { passive: true });
    sync();
  }

  // ── Menu drawer
  const drawer = document.getElementById("sg-drawer");
  const burger = document.querySelector(".sg-burger");
  if (drawer && window.MicroModal) {
    const panel = drawer.querySelector(".sg-drawer__panel");
    // Link text one character at a time — each link is 30ms later, each character 24ms later, dropping and bouncing
    let item = 0;
    drawer.querySelectorAll("[data-drop]").forEach((a) => {
      const text = a.textContent.trim();
      a.setAttribute("aria-label", text);
      a.textContent = "";
      const words = text.split(/(\s+)/);
      let u = 0;
      for (const w of words) {
        if (/^\s+$/.test(w)) { a.append(" "); continue; }
        const word = document.createElement("span");
        word.style.cssText = "display:inline-block;white-space:nowrap";
        word.setAttribute("aria-hidden", "true");
        for (const ch of Array.from(w)) {
          const s = document.createElement("span");
          s.className = "sg-drop-char";
          s.textContent = ch;
          s.style.setProperty("--d", `${item * 30 + u * 24}ms`);
          word.append(s);
          u += 1;
        }
        a.append(word);
      }
      item += 1;
    });
    let tl = null;
    MicroModal.init({ openTrigger: "data-micromodal-trigger", closeTrigger: "data-micromodal-close", disableScroll: true, awaitCloseAnimation: false,
      onShow: () => {
        burger?.setAttribute("aria-expanded", "true");
        drawer.classList.remove("is-entered", "is-chars");
        const enter = () => {
          drawer.classList.add("is-entered");
          requestAnimationFrame(() => requestAnimationFrame(() => drawer.classList.add("is-chars")));
        };
        if (reduce) { enter(); return; }
        tl?.kill();
        // Original: plate .42s elastic.out(1,.78), text starts right as the plate begins to unfold (max(0, .42 − .5))
        tl = gsap.timeline()
          .fromTo(panel, { opacity: 0, scale: 0.82, transformOrigin: "100% 50%" }, { opacity: 1, scale: 1, duration: 0.42, ease: "elastic.out(1, 0.78)" }, 0)
          .call(enter, null, Math.max(0, 0.42 - 0.5));
      },
      onClose: () => {
        burger?.setAttribute("aria-expanded", "false");
        tl?.kill();
        gsap.set(panel, { clearProps: "transform,opacity" });
        drawer.classList.remove("is-entered", "is-chars");
      },
    });
    panel.addEventListener("click", (e) => { if (e.target.closest("a[href]")) MicroModal.close("sg-drawer"); });
    addEventListener("resize", () => { if (drawer.classList.contains("is-open") && innerWidth > 1024) MicroModal.close("sg-drawer"); });
  }
})();
