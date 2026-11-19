// Used by every page — illustration sprite (our SVG), lenis 1.1.20, cursor ring and cursor parallax, menu drawer, sound bars, curved curtain transition, scene slider.
// Letter rise is handled by the _fx/line-rise part and the blob by the _fx/dot-blob-morph part.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover)").matches;
  const root = document.documentElement;

  // ───── Illustration sprites — the original hand drawings replaced by our own shapes of the same size and feel (coral note · conch · flower · starfish · grass · aloe · dandelion · stone · cable car)
  const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0" aria-hidden="true"><defs>
  <symbol id="ill-note" viewBox="0 0 100 100"><path class="i-c-coral" d="M30 20h48v8H38v52h-8zM70 20h8v56h-8z"/><path class="i-s-coral" d="M34 24l-6-8M74 24l8-10M78 22l10-4"/><ellipse class="i-c-orange" cx="26" cy="82" rx="12" ry="9"/><ellipse class="i-c-orange" cx="66" cy="78" rx="12" ry="9"/><path class="i-s-ink" d="M18 82c4-6 12-6 16 0M58 78c4-6 12-6 16 0M22 80c2 3 6 4 9 1M62 76c2 3 6 4 9 1"/></symbol>
  <symbol id="ill-snail" viewBox="0 0 100 100"><path class="i-c-rose" d="M50 14a36 36 0 1 1-36 36c0-14 10-24 24-24s20 10 20 20-6 14-14 14-10-6-10-10"/><path class="i-s-ink" d="M50 14a36 36 0 1 1-36 36c0-14 10-24 24-24s20 10 20 20-6 14-14 14-10-6-10-10"/><path class="i-c-orange" d="M60 30a22 22 0 0 1 10 24l-8-2a14 14 0 0 0-6-16z"/></symbol>
  <symbol id="ill-flower" viewBox="0 0 100 100"><path class="i-s-green" d="M50 98V50M50 76c-14-4-22-14-24-24M50 70c12-2 20-10 22-20"/><path class="i-c-green" d="M26 52c-8 2-14 10-12 18 8 0 14-8 12-18zM72 50c8 0 14 8 14 16-8 2-14-6-14-16z"/><circle class="i-c-coral" cx="50" cy="34" r="20"/><g class="i-c-rose"><circle cx="50" cy="8" r="4"/><circle cx="74" cy="20" r="4"/><circle cx="26" cy="20" r="4"/><circle cx="78" cy="42" r="4"/><circle cx="22" cy="42" r="4"/></g><path class="i-s-ink" d="M40 30c6-4 14-4 20 0M38 38c8-4 16-4 24 0"/></symbol>
  <symbol id="ill-star" viewBox="0 0 100 100"><path class="i-c-coral" d="M50 4l11 32 34 1-27 20 10 33-28-19-28 19 10-33L5 37l34-1z"/><g class="i-c-paper"><circle cx="50" cy="30" r="3"/><circle cx="50" cy="48" r="3"/><circle cx="66" cy="46" r="3"/><circle cx="34" cy="46" r="3"/><circle cx="58" cy="64" r="3"/><circle cx="42" cy="64" r="3"/></g></symbol>
  <symbol id="ill-sprig" viewBox="0 0 100 100"><path class="i-s-green" d="M20 96C40 70 50 40 82 6"/><g class="i-c-green"><path d="M34 74c-10-6-14-16-10-24 8 4 12 14 10 24z"/><path d="M46 56c-10-8-12-18-6-26 8 6 10 16 6 26z"/><path d="M58 38c-6-10-6-20 2-26 6 8 4 18-2 26z"/><path d="M40 70c10-2 20 2 24 10-10 2-18-2-24-10z"/><path d="M54 50c10-4 20-2 26 6-10 4-20 2-26-6z"/></g></symbol>
  <symbol id="ill-aloe" viewBox="0 0 100 100"><g class="i-c-green"><path d="M50 96L30 40l26 50z"/><path d="M50 96L70 36 56 92z"/><path d="M48 96L10 60l42 32z"/><path d="M52 96l40-30-36 30z"/></g><path class="i-s-green" d="M40 50V8M62 50V14"/><g class="i-c-orange"><ellipse cx="40" cy="16" rx="5" ry="12"/><ellipse cx="62" cy="22" rx="5" ry="12"/></g><g class="i-c-coral"><ellipse cx="40" cy="10" rx="3" ry="6"/><ellipse cx="62" cy="16" rx="3" ry="6"/></g></symbol>
  <symbol id="ill-dandelion" viewBox="0 0 100 100"><circle class="i-c-yellow" cx="50" cy="50" r="20"/><g class="i-c-yellow"><circle cx="50" cy="16" r="5"/><circle cx="74" cy="26" r="5"/><circle cx="84" cy="50" r="5"/><circle cx="74" cy="74" r="5"/><circle cx="50" cy="84" r="5"/><circle cx="26" cy="74" r="5"/><circle cx="16" cy="50" r="5"/><circle cx="26" cy="26" r="5"/></g><path class="i-s-ink" d="M50 22v56M22 50h56M30 30l40 40M70 30L30 70"/><circle class="i-c-orange" cx="50" cy="50" r="7"/></symbol>
  <symbol id="ill-shell" viewBox="0 0 100 100"><path class="i-c-rose" d="M8 70L86 30c8 6 10 18 2 26L20 86z"/><path class="i-s-ink" d="M24 64l8 14M36 58l9 15M48 52l10 14M60 46l10 13M72 40l9 12"/><path class="i-c-coral" d="M84 28l10-12-2 16 8 2-12 6z"/></symbol>
  <symbol id="ill-rock" viewBox="0 0 100 100"><path class="i-c-stone" d="M6 92L18 44 46 28l34 10 14 54z"/><path class="i-s-ink" d="M18 44l28 18 34-24M46 62v30"/></symbol>
  <symbol id="ill-car" viewBox="0 0 100 100"><path class="i-s-ink" d="M50 0v22M30 0l20 22 20-22"/><rect class="i-c-teal" x="14" y="24" width="72" height="56" rx="12"/><g class="i-c-paper"><rect x="22" y="34" width="16" height="22" rx="4"/><rect x="42" y="34" width="16" height="22" rx="4"/><rect x="62" y="34" width="16" height="22" rx="4"/></g><g class="i-c-orange"><circle cx="30" cy="42" r="4"/><circle cx="50" cy="42" r="4"/><circle cx="70" cy="42" r="4"/></g><rect class="i-c-ink" x="14" y="66" width="72" height="4"/></symbol>
  <symbol id="ill-mark" viewBox="0 0 100 100"><circle class="i-c-coral" cx="50" cy="50" r="30"/><circle class="i-c-yellow" cx="50" cy="50" r="18"/><path class="i-s-ink" d="M34 50c6-8 26-8 32 0M38 58c4 4 20 4 24 0"/></symbol>
  </defs></svg>`;
  document.body.insertAdjacentHTML("afterbegin", SPRITE);

  // ───── lenis — original 1.1.20: curve 1.001 − 2^(−10t), vertical, smoothWheel. Driven by the gsap ticker
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  // ───── Cursor ring + cursor parallax (--mx·--my, −.5~.5) — the ring follows .15 of the remaining distance per frame, the parallax .08 each.
  // Original CustomCursor: default 12px ring, over buttons and links it grows to 18px over .6s after .25s, and the icon inside floats up over .58s after .15s (values matched by measuring). Hidden while the loader is showing
  const ring = document.querySelector(".j-cursor");
  const icon = ring?.querySelector(".j-cursor__icon");
  const goal = { x: innerWidth / 2, y: innerHeight / 2 }, pos = { ...goal }, par = { x: 0, y: 0 };
  let shown = false, last = 0;
  const loading = () => !!document.querySelector(".j-loader");
  if (fine && !reduce) {
    addEventListener("pointermove", (e) => {
      goal.x = e.clientX; goal.y = e.clientY;
      if (ring && !shown && !loading()) { shown = true; pos.x = goal.x; pos.y = goal.y; gsap.to(ring, { opacity: 1, duration: 0.3, ease: "power2.out" }); }
    }, { passive: true });
    root.addEventListener("pointerleave", () => { if (ring) { shown = false; gsap.to(ring, { opacity: 0, duration: 0.3, ease: "power2.out" }); } });
    addEventListener("pointerdown", () => ring && gsap.to(ring, { "--mD": 0.2, duration: 0.4, overwrite: "auto" }));
    addEventListener("pointerup", () => ring && gsap.to(ring, { "--mD": 0, duration: 0.4, overwrite: "auto" }));
    // Wireframe tool buttons (.wf-ui) are not cursor targets
    const hit = "a[href], button:not(.j-eq), [data-cursor]";
    const target = (n) => { const el = n && n.closest ? n.closest(hit) : null; return el && !el.closest(".wf-ui") ? el : null; };
    document.addEventListener("pointerover", (e) => {
      if (!ring || !target(e.target)) return;
      gsap.to(ring, { "--s": 18, duration: 0.6, delay: 0.25, ease: "none", overwrite: "auto" });
      if (icon) gsap.to(icon, { opacity: 1, duration: 0.58, delay: 0.15, ease: "power2.inOut", overwrite: "auto" });
    });
    document.addEventListener("pointerout", (e) => {
      if (!ring || !target(e.target) || target(e.relatedTarget)) return;
      gsap.to(ring, { "--s": 12, duration: 0.6, delay: 0.25, ease: "none", overwrite: "auto" });
      if (icon) gsap.to(icon, { opacity: 0, duration: 0.58, delay: 0.15, ease: "power2.inOut", overwrite: "auto" });
    });
    let rx = NaN, ry = NaN;
    gsap.ticker.add((time) => {
      const dt = last ? Math.max(1, (time - last) * 1000) : 16; last = time;
      const k = 1 - Math.pow(1 - 0.15, dt / 16.67), kp = 1 - Math.pow(1 - 0.08, dt / 16.67);
      pos.x += (goal.x - pos.x) * k; pos.y += (goal.y - pos.y) * k;
      par.x += (goal.x / innerWidth - 0.5 - par.x) * kp; par.y += (goal.y / innerHeight - 0.5 - par.y) * kp;
      // As in the original, if almost no distance is left, it is not applied again
      const nx = Math.round(pos.x * 10) / 10, ny = Math.round(pos.y * 10) / 10;
      if (ring && (nx !== rx || ny !== ry)) { rx = nx; ry = ny; ring.style.setProperty("--x", `${nx}px`); ring.style.setProperty("--y", `${ny}px`); }
      root.style.setProperty("--mx", par.x.toFixed(3)); root.style.setProperty("--my", par.y.toFixed(3));
    });
  }

  // Loader — original order: while the % number rises (enter 1.1s · exit .8s), a sky-blue blob drifts carrying the image.
  // On the home page, after the blob splits into droplets the invitation card unfolds and ”Enter Site” rises 2s late over 2s, pressing it plays the intro video → scene slider.
  // Subpages: at 100% a blob grows to fill the screen in that page’s header section color (.7s power3.out) and stays as the background.
  // The original % is real download progress, so the copy counts from 0→100 over 4.5 seconds.
  const loader = document.querySelector(".j-loader");
  if (loader) {
    lenis?.stop();
    const num = loader.querySelector(".j-loader__num span"), text = loader.querySelector(".j-loader__text");
    const blob = loader.querySelector(".j-loader__blob"), drops = loader.querySelectorAll(".j-loader__drops i");
    const card = loader.querySelector(".j-loader__card"), enter = loader.querySelector(".j-loader__enter");
    const intro = loader.querySelector(".j-intro"), skip = loader.querySelector(".j-intro__skip");
    const d = (s) => (reduce ? 0 : s);
    const pct = { v: 0 };
    const finish = () => gsap.to(loader, { opacity: 0, duration: d(0.8), ease: "power2.inOut", onComplete: () => { loader.remove(); lenis?.start(); } });
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(pct, { v: 100, duration: d(4.5), ease: "power1.inOut", onUpdate: () => { num.textContent = String(Math.round(pct.v)).padStart(2, "0"); } }, 0);
    if (enter) {
      tl.fromTo(blob, { x: 0, y: 0, scale: 1 }, { x: "-34vw", y: "40vh", scale: 0.5, duration: d(3.6), ease: "none" }, 0)
        .to(blob, { scale: 0, opacity: 0, duration: d(0.8) }, d(3.6))
        .fromTo(drops, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: d(0.6), stagger: 0.12 }, d(2.6))
        .to(drops, { opacity: 0, scale: 0.4, duration: d(0.5), stagger: 0.08 }, d(3.6))
        .fromTo(card, { clipPath: "polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: d(1.1), ease: "power3.out" }, d(3.3))
        .to([num.parentElement, text], { yPercent: 110, opacity: 0, duration: d(0.8) }, d(4.6))
        .add(() => loader.classList.add("is-ready"))
        .to(enter, { opacity: 1, duration: d(2), delay: d(2), ease: "power2.inOut" });
      let timer = 0;
      enter.addEventListener("click", () => {
        intro.classList.add("is-on");
        gsap.fromTo(intro, { opacity: 0 }, { opacity: 1, duration: d(0.6) });
        timer = setTimeout(finish, 8000);
      });
      skip.addEventListener("click", () => { clearTimeout(timer); finish(); });
    } else {
      // The blob drifts a little toward the lower left, then at 100% fills the screen with the header section color
      const hero = document.querySelector(".j-hero");
      tl.fromTo(blob, { x: 0, y: 0 }, { x: "-30vw", y: "36vh", duration: d(4.5), ease: "none" }, 0)
        .to([num.parentElement, text], { yPercent: 110, opacity: 0, duration: d(0.8) }, d(4.5))
        .add(() => {
          if (hero) blob.style.setProperty("--fx-fill", getComputedStyle(hero).getPropertyValue("--hero-bg").trim() || "");
          blob.addEventListener("fx:done", () => gsap.to(loader, { opacity: 0, duration: d(0.4), onComplete: () => { loader.remove(); lenis?.start(); } }), { once: true });
          blob.dispatchEvent(new CustomEvent("fx:full"));
        }, d(4.6));
    }
  }

  // ───── Menu drawer — curtain .6s, panel from the right at 1s expo.out, items from below .08s later each
  const menu = document.querySelector(".j-menu");
  if (menu) {
    const panel = menu.querySelector(".j-menu__panel"), veil = menu.querySelector(".j-menu__veil"), items = menu.querySelectorAll(".j-nav a, .j-menu__foot");
    let tl = null;
    const open = () => {
      tl?.kill(); menu.classList.add("is-open"); lenis?.stop();
      tl = gsap.timeline()
        .to(veil, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out" }, 0)
        .to(panel, { xPercent: -100, duration: reduce ? 0 : 1, ease: "expo.out" }, 0)
        .fromTo(items, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.9, ease: "expo.out", stagger: 0.08 }, 0.15);
    };
    const close = () => {
      tl?.kill(); lenis?.start();
      tl = gsap.timeline({ onComplete: () => menu.classList.remove("is-open") })
        .to(panel, { xPercent: 0, duration: reduce ? 0 : 0.7, ease: "expo.inOut" }, 0)
        .to(veil, { opacity: 0, duration: reduce ? 0 : 0.5, ease: "power2.out" }, 0.1);
    };
    document.querySelectorAll(".j-burger").forEach((b) => b.addEventListener("click", open));
    menu.querySelector(".j-menu__close").addEventListener("click", close);
    veil.addEventListener("click", close);
    addEventListener("keydown", (e) => e.key === "Escape" && menu.classList.contains("is-open") && close());
  }

  // ───── Sound bars — press to turn on and off (original Equalizer). The sound file is a placeholder so only the bars bounce
  document.querySelectorAll(".j-eq").forEach((b) => b.addEventListener("click", () => { const on = b.classList.toggle("is-on"); b.setAttribute("aria-pressed", on); }));

  // ───── Curved curtain transition — original curation: push the curtain path’s center·edge·bend up with 1s power3.inOut to cover (the bend goes and returns over half the length), and the new page opens covered and clears the same way
  const curtain = document.querySelector(".j-curtain");
  const curvePath = (edge, center, bend) => {
    const w = innerWidth, h = innerHeight;
    const yE = h * (1 - edge), yC = h * (1 - center) - bend;
    return `path("M0 ${h} L${w} ${h} L${w} ${yE.toFixed(1)} Q${w / 2} ${yC.toFixed(1)} 0 ${yE.toFixed(1)} Z")`;
  };
  const curtainTo = (open, done) => {
    if (!curtain) return done?.();
    const st = { center: open ? 0 : 1, start: open ? 0 : 1, offset: 0 }, bend = innerHeight * 0.18, dur = reduce ? 0 : 1;
    curtain.classList.add("is-on");
    const draw = () => { curtain.style.clipPath = curvePath(st.start, st.center, st.offset * (open ? 1 : -1)); };
    draw();
    gsap.timeline({ onUpdate: draw, onComplete: () => { if (!open) curtain.classList.remove("is-on"); done?.(); } })
      .to(st, { center: open ? 1 : 0, duration: dur, ease: "power3.inOut" }, 0)
      .to(st, { start: open ? 1 : 0, duration: dur, ease: "power3.inOut" }, dur / 20)
      .to(st, { offset: bend, duration: dur / 2, yoyo: true, repeat: 1, ease: "power3.in" }, 0);
  };
  window.jGo = (href) => { lenis?.stop(); curtainTo(true, () => { location.href = href; }); };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|https?):/i.test(href)) return;
    e.preventDefault();
    window.jGo(href);
  });
  if (curtain && !document.querySelector(".j-loader")) {
    curtain.classList.add("is-on");
    curtain.style.clipPath = curvePath(1, 1, 0);
    addEventListener("load", () => setTimeout(() => {
      // On clearing, push the path upward so the curtain’s top edge exits above the screen
      const st = { y: 0 }, h = innerHeight, w = innerWidth;
      gsap.to(st, { y: 1, duration: reduce ? 0 : 1, ease: "power3.inOut", onUpdate: () => {
        const top = -h * 0.2 + st.y * (h * 1.2), bend = Math.sin(st.y * Math.PI) * h * 0.18;
        curtain.style.clipPath = `path("M0 ${h * 1.2} L${w} ${h * 1.2} L${w} ${top.toFixed(1)} Q${w / 2} ${(top + bend).toFixed(1)} 0 ${top.toFixed(1)} Z")`;
      }, onComplete: () => curtain.classList.remove("is-on") });
    }, 200));
  }

  // ───── Scene slider — original MainSlider: cell 33.3vw, side scenes shift p×11.52vw sideways · |p|×5.44vw down, shrink by 1−|p|×.31 and tilt.
  // Page by wheel·drag·arrows (1.1s expo.out), and pressing a scene blob grows the blob to fill the screen and then goes to that page
  window.jRail = (rail) => {
    const track = rail.querySelector(".j-rail__track"), scenes = [...rail.querySelectorAll(".j-scene")];
    const title = rail.querySelector(".j-rail__title"), tag = rail.querySelector(".j-rail__tag"), count = rail.querySelector(".j-rail__count");
    if (!track || !scenes.length) return;
    const n = scenes.length, st = { p: +(rail.dataset.start || 0) };
    let idx = st.p, tw = null, busy = false;
    const layout = () => {
      const w = scenes[0].offsetWidth;
      track.style.transform = `translateX(${(-st.p - 0.5) * w}px)`;
      scenes.forEach((s, i) => {
        let p = i - st.p;
        s.style.setProperty("--p", p.toFixed(4));
        s.style.setProperty("--abs-p", Math.min(2, Math.abs(p)).toFixed(4));
        s.style.visibility = Math.abs(p) > 2.2 ? "hidden" : "";
      });
    };
    const label = () => {
      const s = scenes[((idx % n) + n) % n];
      if (title) {
        const span = title.querySelector("span");
        gsap.fromTo(span, { yPercent: 0 }, { yPercent: -105, duration: reduce ? 0 : 0.35, ease: "power2.in", onComplete: () => {
          span.textContent = s.dataset.title; if (tag) tag.textContent = s.dataset.tag;
          gsap.fromTo(span, { yPercent: 105 }, { yPercent: 0, duration: reduce ? 0 : 0.8, ease: window.kfFx ? kfFx.ease("0.165,0.84,0.44,1", "power3.out") : "power3.out" });
        } });
      }
      if (count) count.textContent = `${String(idx + 1).padStart(2, "0")}/${String(n).padStart(2, "0")}`;
    };
    const go = (to) => {
      to = Math.max(0, Math.min(n - 1, to));
      if (to === idx && !tw) return;
      idx = to; tw?.kill();
      tw = gsap.to(st, { p: idx, duration: reduce ? 0 : 1.1, ease: "expo.out", onUpdate: layout, onComplete: () => (tw = null) });
      label();
    };
    rail.querySelector("[data-prev]")?.addEventListener("click", () => go(idx - 1));
    rail.querySelector("[data-next]")?.addEventListener("click", () => go(idx + 1));
    // Wheel — after one flip, don’t accept the next for .8s (home page only — the slider at the page end doesn’t block document scroll)
    if (rail.hasAttribute("data-wheel")) rail.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (busy || Math.abs(e.deltaY) + Math.abs(e.deltaX) < 8) return;
      busy = true; setTimeout(() => (busy = false), 800);
      go(idx + ((e.deltaY || e.deltaX) > 0 ? 1 : -1));
    }, { passive: false });
    // Drag — follows the hand, and on release snaps to the nearest scene
    let drag = null;
    rail.addEventListener("pointerdown", (e) => { if (e.button) return; drag = { x: e.clientX, p: st.p, moved: false }; tw?.kill(); });
    addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) drag.moved = true;
      st.p = drag.p - dx / scenes[0].offsetWidth; layout();
    });
    addEventListener("pointerup", () => {
      if (!drag) return;
      const moved = drag.moved, to = Math.round(st.p); drag = null;
      if (moved) { idx = -1; go(to); rail.dataset.dragged = "1"; setTimeout(() => delete rail.dataset.dragged, 50); }
    });
    // Scene click — on the center scene it grows the blob to fill the screen and then moves on, on a side scene it moves to that scene
    scenes.forEach((s, i) => s.querySelector(".j-scene__art")?.addEventListener("click", () => {
      if (rail.dataset.dragged) return;
      if (i !== idx) return go(i);
      const art = s.querySelector(".j-scene__art");
      lenis?.stop();
      art.addEventListener("fx:done", () => { location.href = s.dataset.href; }, { once: true });
      art.dispatchEvent(new CustomEvent("fx:full"));
    }));
    addEventListener("resize", layout);
    layout(); label();
  };
  document.querySelectorAll(".j-rail").forEach((r) => window.jRail(r));
})();
