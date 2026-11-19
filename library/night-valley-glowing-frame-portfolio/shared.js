// Shared — loader, smooth scroll (lenis 1.3.19 · lerp .12 · wheel .9), header change, cursor dot, sound pill, band panel, mail copy
(() => {
  const OR = (window.OR = window.OR || {});
  gsap.registerPlugin(ScrollTrigger, ...(window.CustomEase ? [CustomEase] : []));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  // Two original CustomEase curves — if CustomEase is missing, the nearest GSAP curve
  OR.out = window.CustomEase ? CustomEase.create("or-out", "M0,0 C0.1,0.495 0.105,0.715 0.25,0.845 0.405,0.978 0.505,1 1,1") : "expo.out";
  OR.inOut = window.CustomEase ? CustomEase.create("or-inout", "M0,0 C0.3,0 0.25,1 1,1") : "power3.inOut";
  const F = (n) => n / 30;

  /* ── Smooth scroll ── */
  if (!reduce && window.Lenis) {
    OR.lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.9 });
    OR.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => OR.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    OR.lenis.stop();
  }

  /* Loader — the number counts up, and when full the line goes out in .4s, then the logo wobbles (.4s), pops (.12s) and hands off to the scene logo */
  OR.preload = () => new Promise((done) => {
    const pre = document.querySelector('[data-slot="loader"]');
    if (!pre || reduce) { pre?.remove(); document.documentElement.classList.add("is-ready"); done(); return; }
    const num = pre.querySelector("[data-pre-num]"), bar = pre.querySelector("progress");
    const logo = pre.querySelector("[data-pre-logo] svg");
    gsap.set(logo, { yPercent: 40, scale: 0.55, transformOrigin: "50% 50%" });
    gsap.from(pre.querySelector("[data-pre-sound]"), { autoAlpha: 0, duration: F(12), delay: 0.3 });
    const p = { v: 0 };
    const fonts = document.fonts?.ready || Promise.resolve();
    const minWait = new Promise((r) => setTimeout(r, 1400));
    gsap.to(p, { v: 80, duration: 1.2, ease: "power1.out", onUpdate: () => { num.textContent = Math.floor(p.v); bar.value = p.v; } });
    Promise.all([fonts, minWait]).then(() => {
      gsap.to(p, { v: 100, duration: 0.35, ease: "power1.out", overwrite: true, onUpdate: () => { num.textContent = Math.floor(p.v); bar.value = p.v; }, onComplete: out });
    });
    function out() {
      gsap.to([pre.querySelector("[data-pre-row]"), pre.querySelector("[data-pre-sound]")], { autoAlpha: 0, duration: F(12), ease: OR.out, overwrite: "auto" });
      // Shake — over .4s it speeds up from 2Hz → 15Hz with ±5% scale and ±2° tilt, swelling .06 at the end
      const sh = { t: 0 };
      gsap.to(sh, {
        t: 1, duration: 0.4, ease: "none",
        onUpdate: () => {
          const t = sh.t, ramp = Math.min(1, t * 5), f = 2 + (15 - 2) * t, ph = Math.sin(2 * Math.PI * f * t * 0.4);
          gsap.set(logo, { scale: 0.55 * (1 + 0.05 * ph * ramp + 0.06 * t), rotate: 2 * ph * ramp });
        },
        onComplete: () => {
          gsap.to(logo, { scale: 0.55 * 1.18, rotate: 0, duration: 0.12, ease: "power2.in", onComplete: () => {
            gsap.to(pre, { autoAlpha: 0, duration: F(6), ease: OR.out, onComplete: () => pre.remove() });
            document.documentElement.classList.add("is-ready");
            OR.lenis?.start();
            done();
          } });
        },
      });
    }
  });

  /* ── Header — once past the hero, the logo and ‹Join the Crew› clear away and an ‹Available for freelance› pill floats up from 30px below ── */
  OR.bootHead = () => {
    const bar = document.querySelector("[data-head-bar]");
    const pill = document.querySelector('.or-free [data-fx="glass-magnet-pill"]');
    let shown = null;
    const set = (down) => {
      if (shown === down) return;
      shown = down;
      gsap.to(bar, { autoAlpha: down ? 0 : 1, y: down ? -20 : 0, duration: 0.35, ease: "power2.out", overwrite: true });
      gsap.to(pill, { autoAlpha: down ? 1 : 0, y: down ? 0 : 30, duration: down ? 0.5 : 0.3, ease: down ? "power3.out" : "power2.in", overwrite: true });
    };
    // While re-measuring (after adding more cells, refresh), scroll reads as top — like the original, ignore it meanwhile and split again once everything is measured
    let measuring = false;
    ScrollTrigger.addEventListener("refreshInit", () => (measuring = true));
    ScrollTrigger.addEventListener("refresh", () => { measuring = false; set(scrollY > innerHeight * 0.15); });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => !measuring && set(scrollY > innerHeight * 0.15) });
    set(scrollY > innerHeight * 0.15);
  };

  /* ── Cursor: 14px dot follows at .12 per frame, turns into a glass ring over clickable things ── */
  OR.bootCursor = () => {
    const box = document.querySelector(".or-cursor"), dot = box?.querySelector("[data-cursor-dot]");
    if (!dot || !fine) return;
    const m = { x: innerWidth / 2, y: innerHeight / 2 }, p = { ...m };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      document.documentElement.classList.add("has-pointer");
      m.x = e.clientX; m.y = e.clientY;
      box.classList.toggle("is-link", !!e.target.closest?.("a, button"));
    }, { passive: true });
    gsap.ticker.add(() => {
      p.x += (m.x - p.x) * 0.12; p.y += (m.y - p.y) * 0.12;
      dot.style.transform = `translate(-50%, -50%) translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`;
    });
  };

  /* ── Sound pill — the line is straight while off and becomes a wavy line when pressed (no sound plays) ── */
  OR.bootSound = () => {
    const btn = document.querySelector("[data-sound]"); if (!btn) return;
    const cv = btn.querySelector("canvas"), ctx = cv.getContext("2d"), label = btn.querySelector("[data-sound-label]");
    const ink = getComputedStyle(btn).color;
    const amp = { v: 0 };
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      label.textContent = on ? "Sound Off" : "Sound On";
      gsap.to(amp, { v: on ? 1 : 0, duration: 0.6, ease: on ? "elastic.out(1, 0.45)" : "power2.out" });
    });
    const draw = (t) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath();
      for (let x = 0; x <= cv.width; x += 2) {
        const y = cv.height / 2 + Math.sin(x * 0.35 + t * 0.008) * amp.v * cv.height * 0.32 * Math.sin((x / cv.width) * Math.PI);
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };

  /* ── Band panel — over data-panel links · buttons a glass panel floats above the cursor (.35s) and follows it ── */
  OR.bootPanels = () => {
    if (!fine) return;
    document.querySelectorAll("[data-panel]").forEach((a) => {
      const box = document.querySelector(`[data-panel-box="${a.dataset.panel}"]`);
      if (!box) return;
      const at = { x: 0, y: 0 };
      const move = (e) => { at.x = e.clientX + 18; at.y = e.clientY - box.offsetHeight - 18; gsap.to(box, { x: at.x, y: at.y, duration: 0.35, ease: "power3.out", overwrite: "auto" }); };
      a.addEventListener("pointerenter", (e) => { gsap.set(box, { x: e.clientX + 18, y: e.clientY - box.offsetHeight - 18 }); gsap.to(box, { autoAlpha: 1, duration: 0.35, ease: "power2.out", overwrite: "auto" }); });
      a.addEventListener("pointermove", move);
      a.addEventListener("pointerleave", () => gsap.to(box, { autoAlpha: 0, duration: 0.25, ease: "power2.out", overwrite: "auto" }));
      a.addEventListener("click", (e) => { if (a.getAttribute("href")?.startsWith("#")) e.preventDefault(); });
    });
  };

  /* ── Copy mail — click copies it and the panel text switches to ‹Copied› for 1.2s ── */
  OR.bootCopy = () => {
    const label = document.querySelector("[data-copy-label]");
    document.querySelectorAll("[data-copy], .or-free button").forEach((b) => b.addEventListener("click", async () => {
      try { await navigator.clipboard?.writeText("hello@example.com"); } catch (e) { /* In a blocked window, only the text changes */ }
      if (label) { label.textContent = "Copied"; setTimeout(() => (label.textContent = "Press to copy"), 1200); }
    }));
  };

  /* ── Scroll guide wave: a thin line that sways vertically as it descends ── */
  OR.bootWave = () => {
    const cv = document.querySelector("[data-wave]"); if (!cv) return;
    const ctx = cv.getContext("2d"), ink = getComputedStyle(cv.parentElement).color;
    const draw = (t) => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = ink; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.beginPath();
      for (let y = 0; y <= cv.height; y += 2) {
        const x = cv.width / 2 + Math.sin(y * 0.12 - t * 0.004) * 5 * (y / cv.height);
        y ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
})();
