// Shared: Lenis · music button · phone menu · in-page navigation · wave ribbon.
// Ribbons are two-branched like the original — the text ribbon (data-ribbon) leaves the line as is and only the text flows along the line (--speed, default 30s · pauses when off screen),
// The three ribbons of the second section (data-ribbon-draw) keep the letters standing while the line is drawn on scroll (dash: by line length · clip: polygon opening top to bottom, both scrub 3).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  if (history.scrollRestoration) history.scrollRestoration = "manual";

  // Same as the original Lenis 1.3.23 · same options (1.2 seconds · a curve decaying as a power of 2)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({
      duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2, infinite: false,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.dpLenis = lenis;

  // Like the original, turns the page on .5s after everything including images has loaded
  const show = () => setTimeout(() => { document.body.classList.add("loaded"); lenis?.resize(); }, 500);
  document.readyState === "complete" ? show() : addEventListener("load", show, { once: true });

  // Music buttons (headband · record disc) turn on and off together — while on, the disc spins once every 10s (CSS)
  const plays = document.querySelectorAll("[data-play]");
  plays.forEach((b) => b.addEventListener("click", () => {
    const on = plays[0].getAttribute("aria-pressed") !== "true";
    plays.forEach((x) => x.setAttribute("aria-pressed", String(on)));
  }));

  // Phone menu: the hamburger only opens, while the close button and menu links close. The panel opens top to bottom with a .7s clip-path (CSS)
  const burger = document.querySelector("[data-burger]");
  const drawer = document.querySelector("[data-drawer]");
  const setMenu = (open) => {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("has-menu", open);
    burger?.setAttribute("aria-expanded", String(open));
    open ? lenis?.stop() : lenis?.start();
  };
  burger?.addEventListener("click", () => setMenu(true));
  drawer?.querySelector("[data-burger-close]")?.addEventListener("click", () => setMenu(false));

  // In-page moves scroll down less by the header height, over 1.2s
  const headerH = () => document.querySelector(".dp-header")?.offsetHeight || 0;
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    setMenu(false);
    lenis ? lenis.scrollTo(t, { offset: -headerH(), duration: 1.2, immediate: false }) : scrollTo({ top: t.getBoundingClientRect().top + scrollY - headerH() });
  }));

  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;
  const ribbon = (el, draw) => {
    const d = el.dataset, i = uid++;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", d.vb || "0 0 1440 400");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = `<g class="dp-ribbon__g"><path id="dp-p-${i}" d="${d.d}" fill="none" style="stroke:${d.color}" stroke-width="${d.sw || 56}" stroke-miterlimit="10"/>
      <text dominant-baseline="middle" letter-spacing="2" font-size="${d.font || 26}"><textPath href="#dp-p-${i}" startOffset="0%" text-anchor="${draw ? "middle" : "start"}"></textPath></text></g>`;
    el.append(svg);
    const tp = svg.querySelector("textPath");
    const path = svg.querySelector("path");
    const len = path.getTotalLength();
    // The text strip must exceed twice the line length so the line doesn’t empty when pushed to -100% (the original repeats 50 times)
    const unit = (d.text || "Tagline") + "　";
    let s = unit;
    tp.textContent = s;
    while (tp.getComputedTextLength() < len * 2.2 && s.length < 4000) { s += unit; tp.textContent = s; }
    return { svg, tp, path, len };
  };

  // Text ribbon: the line stays still and the letters flow — it stops once it goes beyond 20% above or below the screen
  document.querySelectorAll("[data-ribbon]").forEach((el) => {
    const { svg, tp } = ribbon(el, false);
    if (reduce) return;
    const speed = parseFloat(getComputedStyle(svg).getPropertyValue("--speed")) || 30;
    const flow = gsap.fromTo(tp, { attr: { startOffset: "0%" } }, { attr: { startOffset: "-100%" }, duration: speed, ease: "none", repeat: -1, paused: true });
    ScrollTrigger.create({ trigger: el, start: "top 120%", end: "bottom -20%", onEnter: () => flow.play(), onEnterBack: () => flow.play(), onLeave: () => flow.pause(), onLeaveBack: () => flow.pause() });
  });

  // Drawn wave: reveals the line and the text on it together (in the original, white text blends into the white background so it shows only where the line is drawn — to look the same on dark skins, the text is masked too)
  document.querySelectorAll("[data-ribbon-draw]").forEach((el) => {
    const { svg, path, len } = ribbon(el, true);
    const g = svg.querySelector(".dp-ribbon__g");
    if (reduce) return;
    const st = { trigger: el, start: el.dataset.start || "top 80%", end: el.dataset.end || "bottom bottom", scrub: 3 };
    if (el.dataset.ribbonDraw === "clip") {
      gsap.set(g, { clipPath: "polygon(-50% 0%, 150% 0%, 150% 0%, -50% 0%)" });
      gsap.to(g, { clipPath: "polygon(-50% 0%, 150% 0%, 150% 200%, -50% 200%)", ease: "none", immediateRender: false, scrollTrigger: st });
      return;
    }
    // dash — lines are drawn by pushing the dashed gap along their length, and text is revealed under a thick mask stroke drawn at the same length
    const mask = document.createElementNS(NS, "mask");
    mask.id = `dp-m-${uid++}`;
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.innerHTML = `<path d="${el.dataset.d}" fill="none" stroke="white" stroke-width="${(+el.dataset.sw || 56) + 24}"/>`; // Not skin: mask brightness (white=shown)
    svg.prepend(mask);
    svg.querySelector("text").setAttribute("mask", `url(#${mask.id})`);
    const mp = mask.querySelector("path");
    gsap.set([path, mp], { strokeDasharray: len, strokeDashoffset: len });
    gsap.to([path, mp], { strokeDashoffset: 0, ease: "none", immediateRender: false, scrollTrigger: st });
  });
})();
