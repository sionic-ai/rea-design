// Home — green curtain loader that runs once per session, then the hero sequence (house band .12s · badges .26s/.42s · curtain .18s), Splide sliders
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BP = 768;
  const isPC = () => innerWidth > BP;
  const hero = document.querySelector(".uh-hero");
  const loader = document.querySelector(".uh-loader");
  const KEY = "uh_top_intro_shown";
  const S = window.Splide;

  const mount = (el, opts) => (el && S ? new S(el, opts).mount() : null);
  const bindArrows = (splide, root) => {
    if (!splide || !root) return;
    const prev = root.querySelector(".prev"), next = root.querySelector(".next");
    const sync = () => {
      const end = splide.Components.Controller.getEnd();
      // Like the original, disabled is also applied — the disabled button’s text color fades to 30% and returns in .4s when enabled
      if (prev) { prev.classList.toggle("is-disabled", splide.index <= 0); prev.disabled = splide.index <= 0; }
      if (next) { next.classList.toggle("is-disabled", splide.index >= end); next.disabled = splide.index >= end; }
    };
    prev?.addEventListener("click", () => splide.go("<"));
    next?.addEventListener("click", () => splide.go(">"));
    splide.on("mounted move moved resized updated", sync);
    sync();
  };

  // Two round badges in the hero — still at first, then they spin in turn when the curtain lifts
  const fadeBadge = { type: "fade", rewind: true, perPage: 1, arrows: false, pagination: true, autoplay: false, interval: 3000, speed: 1400, rewindSpeed: 1400, drag: true };
  const badges = [...document.querySelectorAll(".uh-hero-badges .badge")].map((el) => mount(el, fadeBadge));
  const playBadge = (s) => { if (s && !reduce) s.Components.Autoplay.play(); };

  mount(document.querySelector(".uh-bah-c .splide"), { type: "fade", rewind: true, perPage: 1, arrows: false, pagination: true, autoplay: !reduce, interval: 3000, speed: 1400, rewindSpeed: 1400, drag: true });

  const evt = mount(document.querySelector(".uh-evt-c"), {
    type: "slide", rewind: false, perPage: 3, perMove: 1, gap: 12, drag: true, arrows: false, pagination: false, speed: 1100,
    breakpoints: { 1024: { perPage: 2 }, 768: { perPage: 1, gap: 8, padding: { right: "18%" } } },
  });
  bindArrows(evt, document.querySelector(".uh-evt-u"));

  // Lineup — on phones, drop the slider and use a vertical list (original is-lup-static)
  const lupEl = document.querySelector(".uh-lup-c");
  if (lupEl && isPC()) {
    const lup = mount(lupEl, { type: "slide", rewind: false, perPage: 3, perMove: 1, gap: 12, drag: true, arrows: false, pagination: true, padding: { left: "5%", right: "5%" }, speed: 1100 });
    bindArrows(lup, document.querySelector(".uh-lup-h .uh-arw"));
  }

  // Construction work — on PC, five single sheets each form one 4×2 grid (first cell 2×2), on phones, single sheets as they are
  const wksEl = document.querySelector(".uh-wks-c");
  if (wksEl) {
    if (isPC()) {
      const list = wksEl.querySelector(".splide__list");
      const cards = [...list.children].map((li) => li.firstElementChild);
      list.innerHTML = "";
      for (let i = 0; i < cards.length; i += 5) {
        const li = document.createElement("li");
        li.className = "splide__slide";
        const grid = document.createElement("div");
        grid.className = "uh-wks-grid";
        grid.append(...cards.slice(i, i + 5));
        li.append(grid);
        list.append(li);
      }
    }
    const wks = mount(wksEl, { type: "slide", rewind: false, perPage: 1, perMove: 1, drag: true, arrows: false, gap: 12, pagination: false, speed: 1100, breakpoints: { 768: { gap: 16, padding: { right: "12%" } } } });
    bindArrows(wks, document.querySelector(".uh-wks-u .uh-arw"));
  }

  // Studio — hovering the branch list switches to that branch’s photo and stops the auto-advance
  const std = mount(document.querySelector(".uh-std-s"), { type: "fade", rewind: true, perPage: 1, arrows: false, pagination: false, autoplay: !reduce, interval: 3000, speed: 1400, rewindSpeed: 1400, drag: true });
  const nav = document.querySelector(".uh-std-n");
  if (std && nav) {
    const pause = () => { if (isPC()) std.Components.Autoplay.pause(); };
    const resume = () => { if (isPC() && !reduce) std.Components.Autoplay.play(); };
    nav.querySelectorAll("li").forEach((li, i) => {
      const go = () => { if (!isPC()) return; pause(); std.go(i); };
      li.addEventListener("mouseenter", go);
      li.addEventListener("mouseleave", resume);
      li.querySelector("a")?.addEventListener("focus", go);
      li.querySelector("a")?.addEventListener("blur", resume);
    });
    nav.addEventListener("mouseleave", resume);
  }

  // Hero sequence — the house strip starts walking .12s after the curtain lifts
  const strips = () => document.querySelectorAll(".uh-hero [data-fx~='hold-step-strip']");
  const startIntro = () => {
    hero?.classList.add("play");
    setTimeout(() => strips().forEach((s) => s.dispatchEvent(new CustomEvent("fx:play"))), 120);
    setTimeout(() => playBadge(badges[0]), 260);
    setTimeout(() => playBadge(badges[1]), 420);
  };

  let shown = false;
  try { shown = sessionStorage.getItem(KEY) === "1"; } catch {}
  if (!loader || shown || reduce) {
    loader?.classList.add("is-hide", "is-skip");
    // fx:play must be sent after fx-core attaches the parts, so the strip receives it
    requestAnimationFrame(() => setTimeout(startIntro, 0));
    return;
  }

  loader.classList.add("is-show");
  const bar = loader.querySelector(".cur");
  let target = 0, shownValue = 0, raf = 0;
  const paint = () => bar?.style.setProperty("--loader-progress", String(Math.max(0, Math.min(1, shownValue))));
  const tick = () => {
    const d = target - shownValue;
    shownValue = Math.abs(d) < 0.002 ? target : shownValue + d * 0.08;
    paint();
    raf = shownValue < 0.999 || target < 0.999 ? requestAnimationFrame(tick) : 0;
  };
  const aim = (v) => { target = Math.max(0, Math.min(1, v)); if (!raf) raf = requestAnimationFrame(tick); };
  const t0 = performance.now();
  // The original fills the share loaded by images up to .92 — here there are no images, so it fills as fonts and the document load
  aim(0.46);
  const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
  Promise.all([loaded, document.fonts?.ready]).then(() => {
    aim(0.92);
    setTimeout(() => {
      aim(1);
      const done = () => {
        if (shownValue < 0.995) return requestAnimationFrame(done);
        startIntro();
        setTimeout(() => {
          loader.classList.add("is-hide");
          setTimeout(() => loader.classList.remove("is-show"), 700);
        }, 180);
        try { sessionStorage.setItem(KEY, "1"); } catch {}
      };
      done();
    }, Math.max(0, 1200 - (performance.now() - t0)));
  });
})();
