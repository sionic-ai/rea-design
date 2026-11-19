// Feel of flat pages (.fx): magnetic pill buttons, doodle drawing, spinning badge, copy button, pencil cursor tail, Lenis.
// Values are the same as the original flat.js — button .32 · text .18 pull (quickTo .6 power3.out), on release elastic.out(1, .4) .9s,
// Badge: one turn per 16s, 5x speed on hover, tail lives 900ms with 11px spacing.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function magnet(btn) {
    const label = btn.querySelector(".fx-btn__label");
    const qx = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
    const qy = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
    const lx = label && gsap.quickTo(label, "x", { duration: 0.6, ease: "power3.out" });
    const ly = label && gsap.quickTo(label, "y", { duration: 0.6, ease: "power3.out" });
    const origin = (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty("--fx-x", `${((e.clientX - r.left) / r.width) * 100}%`);
      btn.style.setProperty("--fx-y", `${((e.clientY - r.top) / r.height) * 100}%`);
    };
    btn.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && origin(e));
    btn.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      qx(dx * 0.32); qy(dy * 0.32);
      lx && lx(dx * 0.18); ly && ly(dy * 0.18);
    });
    btn.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "mouse") return;
      origin(e);
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      label && gsap.to(label, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    });
  }

  function draw(root) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue;
        en.target.classList.add(en.target.classList.contains("fx-reveal") ? "is-in" : "is-drawn");
        en.target.querySelectorAll("mask path").forEach((p) => {
          gsap.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, delay: parseFloat(p.style.getPropertyValue("--d")) || 0, ease: "power2.inOut" });
        });
        io.unobserve(en.target);
      }
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
    root.querySelectorAll(".fx-doodle, .fx-reveal").forEach((el) => io.observe(el));
  }

  function badges(root) {
    root.querySelectorAll(".fx-badge svg").forEach((svg) => {
      const spin = gsap.to(svg, { rotation: 360, duration: 16, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      svg.style.animation = "none";
      const badge = svg.closest(".fx-badge");
      badge.addEventListener("pointerenter", () => gsap.to(spin, { timeScale: 5, duration: 0.6, ease: "power2.out" }));
      badge.addEventListener("pointerleave", () => gsap.to(spin, { timeScale: 1, duration: 1.2, ease: "power2.out" }));
    });
  }

  function copies(root) {
    root.querySelectorAll(".fx-copy[data-copy]").forEach((btn) => {
      let t;
      btn.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(btn.dataset.copy); } catch { return; }
        btn.classList.add("is-done");
        gsap.fromTo(btn, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" });
        clearTimeout(t);
        t = setTimeout(() => btn.classList.remove("is-done"), 1800);
      });
    });
  }

  function pencilTrail() {
    const cv = document.createElement("canvas");
    cv.className = "fx-trail";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    const LIFE = 900, GAP = 11, LEN = 4, OX = 6, OY = 14;
    const marks = [];
    let last = null, carry = 0, dpr = 1, running = false;
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    size();
    addEventListener("resize", size);
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const p = { x: e.clientX + OX, y: e.clientY + OY };
      if (!last) { last = p; return; }
      const dx = p.x - last.x, dy = p.y - last.y, d = Math.hypot(dx, dy);
      if (d > 200) { last = p; carry = 0; return; }
      const a = Math.atan2(dy, dx), now = performance.now();
      for (carry += d; carry >= GAP;) {
        carry -= GAP;
        const k = carry / (d || 1);
        marks.push({ x: p.x - dx * k, y: p.y - dy * k, a, t: now });
      }
      last = p;
      if (!running) { running = true; requestAnimationFrame(frame); }
    }, { passive: true });
    document.addEventListener("pointerleave", () => { last = null; });
    function frame(now) {
      while (marks.length && now - marks[0].t > LIFE) marks.shift();
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (!marks.length) { running = false; return; }
      ctx.lineCap = "round";
      ctx.lineWidth = 1.6 * dpr;
      for (const m of marks) {
        const v = 1 - (now - m.t) / LIFE;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.7 * v * v).toFixed(3)})`; /* Not skin: white of the difference blend = Flip underlay */
        const cx = Math.cos(m.a) * (LEN / 2) * dpr, cy = Math.sin(m.a) * (LEN / 2) * dpr;
        ctx.beginPath();
        ctx.moveTo(m.x * dpr - cx, m.y * dpr - cy);
        ctx.lineTo(m.x * dpr + cx, m.y * dpr + cy);
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
  }

  function smooth() {
    if (!window.Lenis) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Clicking something pressable with the mouse makes three short lines burst from that spot toward the upper left in a fan (−150° · −105° · −60°) — in the original it exists only on the 3D first page (main chunk), not on the flat /hire page.
  // A 9×2px line emerges from 4px at .2x, at the .45 point is 8px and full length, and vanishes at 15px at .3x (420ms cubic-bezier(.2, .8, .3, 1))
  function sparks() {
    const CLICKABLE = 'button, [role="button"], a[href], summary', SKIP = ".control-key, .joystick-touch-zone, .look-touch-zone";
    let layer = null;
    document.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button !== 0 || !fine || reduce) return;
      const t = e.target.closest?.(CLICKABLE);
      if (!t || t.disabled || t.getAttribute("aria-disabled") === "true" || t.closest(SKIP)) return;
      if (!layer) {
        layer = document.createElement("div");
        layer.className = "fx-sparks";
        layer.setAttribute("aria-hidden", "true");
        document.body.append(layer);
      }
      for (const a of [-150, -105, -60]) {
        const i = document.createElement("i");
        layer.append(i);
        const at = `translate(${e.clientX}px, ${e.clientY}px) rotate(${a}deg)`;
        i.animate([
          { transform: `${at} translateX(4px) scaleX(0.2)`, opacity: 0.9 },
          { transform: `${at} translateX(8px) scaleX(1)`, opacity: 0.8, offset: 0.45 },
          { transform: `${at} translateX(15px) scaleX(0.3)`, opacity: 0 },
        ], { duration: 420, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" }).onfinish = () => i.remove();
      }
    }, { capture: true, passive: true });
  }
  if (document.body.classList.contains("mw")) sparks();

  window.fxInit = (root = document) => {
    if (reduce) return;
    document.documentElement.classList.add("fx-js");
    smooth();
    draw(root);
    badges(root);
    copies(root);
    if (!fine) return;
    root.querySelectorAll(".fx-btn").forEach(magnet);
    pencilTrail();
  };
})();
