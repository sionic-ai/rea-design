(() => {
  const stage = document.querySelector(".ax-stage [data-fx]");
  const panel = document.querySelector(".ax-panel");
  const content = panel.querySelector(".ax-panel__content");
  const slot = panel.querySelector(".ax-panel__slot");
  const controls = document.querySelector(".ax-controls");
  const foot = document.querySelector(".ax-foot");
  const menu = document.querySelector(".ax-menu");
  const sfx = (n) => window.axSfx && window.axSfx(n);
  const mq = matchMedia("(max-width: 920px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swift = window.CustomEase ? CustomEase.create("ax-swift", "0.19,1,0.22,1") : "expo.out";
  const inout = window.CustomEase ? CustomEase.create("ax-inout", "0.42,0,0.58,1") : "power1.inOut";
  // A framer transition with only a duration — the curve fitted by measuring the original is easeOut(0,0,.58,1)
  const pop = window.CustomEase ? CustomEase.create("ax-pop", "0,0,0.58,1") : "power1.out";
  let open = false;

  // Panel interior — plug in the picked sticker’s template anew, and the previous content fades out over .2s (original popLayout).
  // Intro fades in .2s after .1s, items after .2s, the lower line comes down .5rem from above after .3s over .2s
  const fill = (index, item) => {
    const tpl = document.getElementById(`ax-brand-${index}`);
    if (!tpl) return;
    const old = slot.querySelector(".ax-panel__inner:not(.is-leaving)");
    const inner = document.createElement("div");
    inner.className = "ax-panel__inner";
    inner.append(tpl.content.cloneNode(true));
    // The plate accent color is taken straight from the sticker color name — reading computed style at press time recalculates the whole document’s styles and delays the first frame
    const hue = ["purple", "orange", "blue", "green"].find((c) => item.classList.contains(`is-${c}`)) || "purple";
    content.style.setProperty("--c", `var(--site-${hue})`);
    if (old) {
      old.classList.add("is-leaving");
      Object.assign(old.style, { position: "absolute", top: getComputedStyle(content).paddingTop, left: getComputedStyle(content).paddingLeft, right: getComputedStyle(content).paddingRight });
      gsap.to(old, { opacity: 0, duration: reduce ? 0 : 0.2, ease: pop, onComplete: () => old.remove() });
    }
    slot.append(inner);
    if (reduce) return;
    const bio = inner.querySelector(".ax-bio"), dl = inner.querySelector(".ax-details"), ft = inner.querySelector(".ax-panel__foot");
    gsap.fromTo(bio, { opacity: 0 }, { opacity: 1, duration: 0.2, delay: 0.1, ease: pop });
    if (dl) gsap.fromTo(dl, { opacity: 0 }, { opacity: 1, duration: 0.2, delay: 0.2, ease: pop });
    if (ft) gsap.fromTo(ft, { opacity: 0, y: "-0.5rem" }, { opacity: 1, y: 0, duration: 0.2, delay: 0.3, ease: pop });
  };

  // Wide screens fade in from .95x and transparent in .1s and out in .1s. Phones rise from below on a .6s curve (.19,1,.22,1) and drop with .4s easeInOut.
  // Change the board’s class first, then hook the motion on the same frame (original framer tempo)
  const show = () => {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    gsap.killTweensOf(panel);
    if (mq.matches) {
      gsap.set(panel, { yPercent: 100, opacity: 1, scale: 1 });
      gsap.to(panel, { yPercent: 0, duration: reduce ? 0 : 0.6, ease: swift });
    } else {
      gsap.set(panel, { opacity: 0, scale: 0.95, yPercent: 0 });
      gsap.to(panel, { opacity: 1, scale: 1, duration: reduce ? 0 : 0.1, ease: pop });
    }
  };
  const hide = () => {
    panel.setAttribute("aria-hidden", "true");
    gsap.killTweensOf(panel);
    // Scroll restore happens after closing — doing it on open forces layout of the just-changed DOM on the spot and holds the pressed frame for 30ms
    const done = () => { panel.classList.remove("is-open"); slot.textContent = ""; panel.scrollTop = 0; };
    if (reduce) return done();
    if (mq.matches) gsap.to(panel, { yPercent: 100, duration: 0.4, ease: inout, onComplete: done });
    else gsap.to(panel, { opacity: 0, scale: 0.95, duration: 0.1, ease: pop, onComplete: done });
  };
  // Left·right buttons are inserted when the plate opens and removed when it closes (original AnimatePresence) — they stand up in .2s from 1rem below and transparent
  const ctrlHome = controls.parentNode, ctrlNext = controls.nextSibling;
  controls.remove();
  const ctrl = (on) => {
    gsap.killTweensOf(controls);
    if (on) {
      gsap.set(controls, { opacity: 0, y: "1rem" });
      controls.classList.add("is-open");
      controls.setAttribute("aria-hidden", "false");
      ctrlHome.insertBefore(controls, ctrlNext);
      // On phone there are no left/right buttons (original display: none) — don’t move the hidden board
      if (!mq.matches) gsap.to(controls, { opacity: 1, y: 0, duration: reduce ? 0 : 0.2, ease: pop });
    } else {
      controls.setAttribute("aria-hidden", "true");
      if (mq.matches || reduce) { controls.remove(); return; }
      gsap.to(controls, { opacity: 0, y: "1rem", duration: 0.2, ease: pop, onComplete: () => controls.remove() });
    }
  };

  stage.addEventListener("fx:focus", (e) => {
    const { index, item, why } = e.detail;
    if (index < 0) {
      if (why !== "api") sfx("close");
      open = false; hide(); ctrl(false); foot.removeAttribute("data-hidden");
      return;
    }
    sfx(why === "forward" ? "forward" : why === "back" ? "back" : "open");
    fill(index, item);
    if (!open) { open = true; show(); ctrl(true); foot.setAttribute("data-hidden", ""); }
  });
  // Like the sound button, when screen state changes the original redraws the sticker and applies its own tilt at that moment
  document.addEventListener("ax:state", () => stage.dispatchEvent(new CustomEvent("fx:lean")));
  stage.addEventListener("fx:press", () => sfx("click"));
  stage.addEventListener("fx:grab", () => sfx("tap"));
  stage.addEventListener("fx:drop", () => sfx("release"));

  // Pressing outside the panel (blurred area) closes it. On phones, pressing inside the panel lifts it all the way up
  panel.addEventListener("click", (e) => {
    if (e.target.closest(".ax-panel__close")) { sfx("close"); stage.dispatchEvent(new CustomEvent("fx:pick", { detail: -1 })); return; }
    if (!content.contains(e.target)) { sfx("close"); stage.dispatchEvent(new CustomEvent("fx:pick", { detail: -1 })); return; }
    if (mq.matches && panel.scrollTop < 30) panel.scrollTo({ top: panel.clientHeight, behavior: "smooth" });
  });
  controls.querySelector(".ax-controls__prev").addEventListener("click", () => stage.dispatchEvent(new CustomEvent("fx:step", { detail: -1 })));
  controls.querySelector(".ax-controls__next").addEventListener("click", () => stage.dispatchEvent(new CustomEvent("fx:step", { detail: 1 })));

  // Pre-render the panel text (Korean placeholder) once offscreen to warm up the font. Previously the first press delayed the first frame by 50ms while the Korean font downloaded and drew.
  (window.requestIdleCallback || setTimeout)(() => {
    const warm = document.createElement("div");
    warm.className = "ax-panel__content";
    warm.setAttribute("aria-hidden", "true");
    Object.assign(warm.style, { position: "fixed", left: "-200vw", top: "0", visibility: "hidden", pointerEvents: "none" });
    document.querySelectorAll('template[id^="ax-brand-"]').forEach((t) => warm.append(t.content.cloneNode(true)));
    document.body.append(warm);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(() => warm.remove(), 500));
  });

  // Bottom wordmark — appears after 1s and draws the Lottie once (120 frames · 60fps). The link row appears at .8s
  const mark = foot.querySelector(".ax-foot__mark");
  setTimeout(() => {
    foot.classList.add("is-on");
    if (window.lottie && window.AX_WORDMARK) {
      const anim = lottie.loadAnimation({
        container: mark, renderer: "svg", loop: false, autoplay: !reduce,
        animationData: window.AX_WORDMARK, rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      });
      if (reduce) anim.addEventListener("DOMLoaded", () => anim.goToAndStop(anim.totalFrames - 1, true));
    }
  }, reduce ? 0 : 1000);

  // Wordmark right-click menu — copy logo (tapping changes it to Copied) · get assets
  const closeMenu = () => {
    if (!menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.classList.add("is-closing");
    setTimeout(() => menu.classList.remove("is-closing"), 100);
    menu.setAttribute("aria-hidden", "true");
  };
  mark.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    menu.style.left = `${Math.min(e.clientX, innerWidth - 200)}px`;
    menu.style.top = `${Math.min(e.clientY, innerHeight - 90)}px`;
    menu.classList.remove("is-closing");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
  });
  menu.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const label = b.querySelector(".ax-menu__label");
    if (b.dataset.act === "copy") {
      const svg = mark.querySelector("svg");
      if (svg && navigator.clipboard) navigator.clipboard.writeText(svg.outerHTML).catch(() => {});
      label.textContent = "Copied";
      setTimeout(() => { label.textContent = "Copy the logo as SVG"; closeMenu(); }, 1000);
    } else closeMenu();
  });
  menu.addEventListener("mouseleave", closeMenu);
  addEventListener("pointerdown", (e) => { if (!menu.contains(e.target)) closeMenu(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
})();
