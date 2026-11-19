// Site-wide pieces — smooth scroll, loader (dot ring + number), text entrances (word rise · letter settle), state handed to the dot cloud, footer monogram.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // Blend passed to the point cloud (point-cloud-scroll-morph) — several places fix the loader ring, tunnel and text outline separately, so they are gathered in one place and sent at once
  const sceneState = { ring: 0, tunnel: 0, frame: 0, rect: null };
  window.idScene = {
    set(part) {
      Object.assign(sceneState, part);
      document.querySelector(".id-scene")?.dispatchEvent(new CustomEvent("fx:state", { detail: { ...sceneState } }));
    },
  };

  const lenis = window.Lenis && !reduce ? new Lenis({ autoRaf: true }) : null;
  window.idLenis = lenis;

  // Word and letter splitting — words are wrapped as chunks and the spaces between are left as they are (so multi-line Korean text doesn’t break mid-word)
  function splitWords(el) {
    if (el.querySelector(".word")) return;
    for (const node of [...el.childNodes]) {
      if (node.nodeType === 3) {
        const parts = (node.nodeValue || "").split(/(\s+)/);
        if (!node.nodeValue.trim()) continue;
        const frag = document.createDocumentFragment();
        for (const p of parts) {
          if (!p) continue;
          if (/^\s+$/.test(p)) { frag.append(p); continue; }
          const wrap = document.createElement("span"), w = document.createElement("span");
          wrap.className = "word-wrap";
          w.className = "word";
          w.textContent = p;
          wrap.append(w);
          frag.append(wrap);
        }
        node.replaceWith(frag);
      } else if (node.nodeType === 1 && !node.classList.contains("no-anim")) splitWords(node);
    }
  }
  function splitChars(el) {
    if (el.querySelector(".char")) return;
    const txt = el.textContent || "";
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", txt);
    const frag = document.createDocumentFragment();
    for (const ch of Array.from(txt)) {
      const s = document.createElement("span");
      s.className = "char";
      s.textContent = ch;
      s.setAttribute("aria-hidden", "true");
      frag.append(s);
    }
    el.replaceChildren(frag);
  }
  const index = (el, sel) => {
    const items = el.querySelectorAll(sel);
    if (!items.length) return;
    el.style.setProperty("--anim-stagger", `${items.length > 15 ? 0.015 : 0.05}s`);
    items.forEach((it, i) => it.style.setProperty("--anim-index", String(i)));
  };
  const animEls = [...document.querySelectorAll(".id-split, .id-blur")];
  for (const el of animEls) {
    el.style.setProperty("--anim-delay", `${0.15 + parseFloat(el.dataset.delay || "0")}s`);
    if (el.classList.contains("id-split")) { splitWords(el); index(el, ".word"); } else { splitChars(el); index(el, ".char"); }
    el.classList.add("is-split");
  }
  // Fires once when it crosses the 90% line of the screen — the hero name and title are turned on separately when the loader ends
  const watch = () => {
    if (reduce) { animEls.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    animEls.filter((el) => !el.closest("[data-hero-copy]")).forEach((el) => io.observe(el));
  };
  const heroIn = (afterLoader) => {
    const items = document.querySelectorAll("[data-hero-copy] .id-blur");
    if (afterLoader) {
      items.forEach((el, i) => { el.style.setProperty("--anim-delay", `${0.8 * i - 0.8}s`); el.classList.add("is-visible"); });
    } else setTimeout(() => items.forEach((el) => el.classList.add("is-visible")), 1000);
  };

  // Loader — the number appears at 3s, counts 0→100 (cubic) over 2s starting at 3.5s, lifts away .5s later, and .4s after that the dot ring unfolds over 2s cubic in-out into an upper-body shape. Once per session
  const loader = document.querySelector(".id-preloader");
  let seen = false;
  try { seen = sessionStorage.getItem("id-preloader-shown") === "1"; } catch (e) {}
  if (!loader || seen || reduce) {
    loader?.remove();
    body.dataset.preloading = "false";
    watch();
    heroIn(false);
  } else {
    body.dataset.preloading = "true";
    scrollTo(0, 0);
    const keys = new Set([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);
    const block = (e) => { if (e.cancelable) e.preventDefault(); };
    const blockKey = (e) => { if (keys.has(e.key)) block(e); };
    const pin = () => { if (scrollY !== 0) scrollTo(0, 0); };
    addEventListener("wheel", block, { passive: false });
    addEventListener("touchmove", block, { passive: false });
    addEventListener("keydown", blockKey, { passive: false });
    addEventListener("scroll", pin);
    const unblock = () => {
      removeEventListener("wheel", block);
      removeEventListener("touchmove", block);
      removeEventListener("keydown", blockKey);
      removeEventListener("scroll", pin);
    };
    lenis?.stop();
    window.idScene.set({ ring: 1 });
    const count = loader.querySelector(".id-preloader__count");
    const t0 = performance.now();
    setTimeout(() => { count.dataset.entered = "true"; }, 3000);
    const inOut = (n) => (n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2);
    const tick = () => {
      const e = performance.now() - t0 - 3500;
      if (e < 0) { requestAnimationFrame(tick); return; }
      const a = Math.min(e / 2000, 1);
      count.textContent = `${Math.round(a * a * a * 100)}%`;
      if (a < 1) { requestAnimationFrame(tick); return; }
      setTimeout(() => {
        count.dataset.entered = "false";
        setTimeout(() => {
          const s0 = performance.now();
          let raf = 0;
          const unring = (now) => {
            const k = Math.min((now - s0) / 2000, 1);
            window.idScene.set({ ring: 1 - inOut(k) });
            if (k < 1) raf = requestAnimationFrame(unring); else window.idScene.set({ ring: 0 });
          };
          raf = requestAnimationFrame(unring);
          setTimeout(() => {
            cancelAnimationFrame(raf);
            window.idScene.set({ ring: 0 });
            body.dataset.preloading = "false";
            unblock();
            lenis?.resize();
            lenis?.start();
            try { sessionStorage.setItem("id-preloader-shown", "1"); } catch (e) {}
            loader.dataset.dismissing = "true";
            watch();
            heroIn(true);
            setTimeout(() => loader.remove(), 700);
          }, 2000);
        }, 400);
      }, 500);
    };
    requestAnimationFrame(tick);
  }

  // Monogram — fills in on hover and a bubble shows for just 3s
  document.querySelectorAll(".id-mono").forEach((mono) => {
    const tip = mono.querySelector(".id-mono__tip");
    let timer = 0;
    mono.addEventListener("mouseenter", () => {
      mono.dataset.hovered = "true";
      clearTimeout(timer);
      tip.dataset.visible = "true";
      timer = setTimeout(() => { tip.dataset.visible = "false"; }, 3000);
    });
    mono.addEventListener("mouseleave", () => {
      mono.dataset.hovered = "false";
      clearTimeout(timer);
      tip.dataset.visible = "false";
    });
    // In the original, pressing on the first page does nothing (only on other pages does it return to the first page)
    mono.addEventListener("click", (e) => e.preventDefault());
  });
})();
