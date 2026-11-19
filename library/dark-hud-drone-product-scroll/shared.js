// Cross-page devices — smooth scroll · loader · header-line clock and progress bar · cursor and coordinates · text decoding · placeholder scene drawing
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = innerWidth > 767;
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // Original Lenis — lerp .05 · wheel multiplier .8, binds ScrollTrigger to Lenis scroll
  const lenis = reduce ? null : new Lenis({ lerp: 0.05, smoothWheel: true, wheelMultiplier: 0.8, gestureOrientation: "vertical", normalizeWheel: false, smoothTouch: false });
  window.zkLenis = lenis;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    addEventListener("load", () => { if (desktop) setTimeout(() => lenis.scrollTo(0, { immediate: true }), 0); });
  }
  history.scrollRestoration = "manual";

  // Text decoding — line by line at .06s intervals, one letter every 18ms finds its place while the rest spin as symbols
  const CHARS = "XO#*@!&?%ABR60$";
  const decrypt = (wrap, chars = CHARS) => {
    [...wrap.querySelectorAll(":scope > div")].forEach((div, i) => {
      const final = div.dataset.original ?? (div.dataset.original = div.textContent);
      if (reduce) { div.textContent = final; return; }
      gsap.delayedCall(i * 0.06, () => {
        let it = 0;
        clearInterval(div.zkTimer);
        div.zkTimer = setInterval(() => {
          div.textContent = [...final].map((c, k) => (c === " " ? " " : k < it ? final[k] : chars[Math.floor(Math.random() * chars.length)])).join("");
          if (++it >= final.length) { clearInterval(div.zkTimer); div.textContent = final; }
        }, 18);
      });
    });
  };
  window.zkDecrypt = decrypt;

  // Loader — original timeline as is: letters spread 21vw at 1s, reach the end at 2s, the orange dot grows into a panel from 2.35s, and the whole panel lifts away at 3.7s
  const pre = document.querySelector(".zk-preloader");
  if (pre) {
    const left = pre.querySelector(".zk-preloader__left"), right = pre.querySelector(".zk-preloader__right");
    const orange = pre.querySelector(".zk-preloader__orange"), num = pre.querySelector(".zk-preloader__num");
    const top = document.querySelector(".zk-step1__top .zk-decrypt"), sname = document.querySelector(".zk-step1 .zk-sname");
    lenis?.stop();
    if (sname) gsap.set(sname, { opacity: 0 });
    const k = reduce ? 0 : 1;
    const counter = { v: 0 };
    gsap.to(counter, { v: 100, duration: 3.2 * k, ease: "none", onUpdate: () => (num.textContent = `${Math.floor(counter.v)}%`) });
    const tl = gsap.timeline();
    tl.to(left, { x: "-21vw", duration: 0.7 * k, ease: "power3.inOut" }, 1 * k);
    tl.to(right, { x: "21vw", duration: 0.7 * k, ease: "power3.inOut" }, 1 * k);
    tl.to(left, { x: "-43.7vw", duration: 0.9 * k, ease: "power4.inOut" }, 2 * k);
    tl.to(right, { x: "42vw", duration: 0.9 * k, ease: "power4.inOut" }, 2 * k);
    tl.to(orange, { width: "28rem", height: "28rem", duration: 0.55 * k, ease: "power2.inOut" }, 2.35 * k);
    tl.to(orange, { width: "65rem", height: "50rem", duration: 0.6 * k, ease: "power2.out" }, 2.95 * k);
    tl.to(orange, { width: "100rem", height: "65rem", duration: 0.75 * k, ease: "power3.out" }, 3.6 * k);
    let played = false;
    tl.to(pre, {
      yPercent: -280,
      duration: 2.35 * k,
      ease: "power3.inOut",
      onStart: () => {
        gsap.delayedCall(1 * k, () => top && decrypt(top));
        gsap.delayedCall(1 * k, () => sname && gsap.to(sname, { opacity: 1, duration: 1 * k, ease: "power2.out" }));
        lenis?.start();
      },
      onUpdate() {
        if (desktop && !played && this.progress() >= 0.45) { played = true; window.zkPlayFirstHalf?.(); }
      },
      onComplete: () => { pre.style.display = "none"; document.documentElement.classList.add("zk-ready"); },
    }, 3.7 * k);
  }

  // Header clock (every second) · progress bar (document scroll ratio)
  const clock = document.querySelector(".zk-clock");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => (clock.textContent = fmt.format(new Date()));
    tick();
    setInterval(tick, 1000);
  }
  const fill = document.querySelector(".zk-progress__fill");
  if (fill) addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }, { passive: true });

  // Cursor and coordinates — listens on document like the original (doesn’t move for synthetic events fired only at the window)
  const cur = document.querySelector(".zk-cursor"), tx = document.querySelector(".zk-track__x"), ty = document.querySelector(".zk-track__y");
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  if (cur) {
    const img = cur.querySelector("svg");
    const loop = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("a, button, .link").forEach((el) => {
      el.addEventListener("mouseenter", () => (img.style.transform = "rotate(90deg) scale(1.2)"));
      el.addEventListener("mouseleave", () => (img.style.transform = "rotate(0deg) scale(1)"));
    });
    document.addEventListener("mousedown", () => (img.style.transform = "rotate(90deg) scale(1.35)"));
    document.addEventListener("mouseup", () => (img.style.transform = "rotate(0deg) scale(1)"));
  }
  if (tx && ty) {
    const render = () => { tx.textContent = mx | 0; ty.textContent = my | 0; requestAnimationFrame(render); };
    render();
  }

  // Placeholder scene — in place of the original’s image sequence and scroll video, draw our own scene with the same length (frame count).
  // t runs 0~1 (frame ÷ total), the same t gives the same picture, so rewinding the scroll brings back the same section
  const paint = (cv, t) => {
    const w = (cv.width = cv.clientWidth || 1), h = (cv.height = cv.clientHeight || 1);
    const g = cv.getContext("2d");
    const ink = css("--kf-ink"), bg = css("--kf-bg"), acc = css("--kf-accent");
    const kind = cv.dataset.scene;
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const cone = (x, y, ang, spread, len, a) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, len);
      gr.addColorStop(0, ink); gr.addColorStop(1, bg);
      g.save(); g.globalAlpha = a; g.fillStyle = gr; g.beginPath(); g.moveTo(x, y);
      g.arc(x, y, len, ang - spread, ang + spread); g.closePath(); g.fill(); g.restore();
    };
    const block = (x, y, bw, bh, a, rot = 0) => {
      g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.fillStyle = ink; g.fillRect(-bw / 2, -bh / 2, bw, bh); g.restore();
    };
    if (kind === "launcher" || kind === "launcher-2") {
      const s = kind === "launcher" ? 1 + t * 0.35 : 1.35 + t * 0.25;
      const ox = w * (0.55 + (kind === "launcher" ? t * 0.1 : 0.1 - t * 0.25));
      cone(w * 0.08, h * 0.25, 0.15 + t * 0.4, 0.22, w * 0.9, 0.5);
      cone(w * 0.08, h * 0.25, 0.15 + t * 0.4, 0.08, w * 0.7, 0.35);
      block(ox, h * 0.45, w * 0.06 * s, h * 1.1, 0.07);
      block(ox - w * 0.12 * s, h * 0.55, w * 0.012 * s, h * 0.42 * s, 0.24, -0.08);
      block(ox + w * 0.13 * s, h * 0.5, w * 0.012 * s, h * 0.46 * s, 0.16, 0.12);
      block(ox - w * 0.05 * s, h * (0.6 - t * 0.04), w * 0.16 * s, h * 0.5 * s, 0.1, 0.18 - t * 0.2);
      block(ox + w * 0.07 * s, h * 0.58, w * 0.14 * s, h * 0.44 * s, 0.06, -0.22 + t * 0.2);
    } else if (kind === "flyby") {
      const p = t, x = w * (0.2 + p * 0.55), y = h * (0.5 - p * 0.1), s = 0.25 + p * 2.2;
      g.save(); g.translate(x, y); g.rotate(-0.18 + p * 0.1);
      g.globalAlpha = 0.2; g.fillStyle = ink; g.beginPath(); g.ellipse(0, 0, w * 0.16 * s, h * 0.035 * s, 0, 0, 7); g.fill();
      g.globalAlpha = 0.12; g.fillRect(-w * 0.03 * s, -h * 0.16 * s, w * 0.02 * s, h * 0.32 * s);
      g.fillRect(w * 0.1 * s, -h * 0.07 * s, w * 0.012 * s, h * 0.14 * s);
      for (let i = 0; i < 4; i++) { g.globalAlpha = 0.08; g.fillRect(-w * (0.2 + i * 0.08) * s, -h * 0.01 * s + i * 3, w * 0.12 * s, 2); }
      g.restore();
    } else if (kind === "smoke") {
      for (let i = 0; i < 7; i++) {
        const x = w * ((i * 0.17 + t * 0.05 * (i % 3 + 1)) % 1.2 - 0.1), y = h * (0.3 + 0.12 * Math.sin(i * 2.1 + t * 6.28));
        const gr = g.createRadialGradient(x, y, 0, x, y, w * 0.3);
        gr.addColorStop(0, ink); gr.addColorStop(1, bg);
        g.globalAlpha = 0.07; g.fillStyle = gr; g.fillRect(0, 0, w, h);
      }
      g.globalAlpha = 1;
    } else if (kind === "scan") {
      const x = w * (0.6 + Math.sin(t * 3.14) * 0.05);
      const gr = g.createLinearGradient(x - w * 0.12, 0, x + w * 0.12, 0);
      gr.addColorStop(0, bg); gr.addColorStop(0.5 - t * 0.3 + 0.15, ink); gr.addColorStop(1, bg);
      g.globalAlpha = 0.22; g.fillStyle = gr; g.fillRect(x - w * 0.12, 0, w * 0.24, h);
      g.globalAlpha = 0.6; g.fillStyle = acc; g.fillRect(x + w * 0.05, h * (0.45 + t * 0.1), 6, 6);
    } else if (kind === "field") {
      cone(w * 0.45, -h * 0.1, 1.57, 0.12, h * 1.1, 0.22);
      block(w * 0.45, h * 0.7, w * 0.01, h * 0.12, 0.5);
      g.globalAlpha = 0.5; g.strokeStyle = acc; g.lineWidth = 1;
      const cxp = w * (0.3 + 0.4 * ((t * 3) % 1)), cyp = h * 0.45;
      g.strokeRect(cxp - 30, cyp - 30, 60, 60); g.beginPath(); g.moveTo(cxp - 50, cyp); g.lineTo(cxp + 50, cyp); g.moveTo(cxp, cyp - 50); g.lineTo(cxp, cyp + 50); g.stroke();
    }
    g.globalAlpha = 1;
  };
  window.zkPaint = paint;
  // Always-looping scenes (data-loop seconds) are drawn only while visible on screen
  document.querySelectorAll(".zk-scene[data-loop]").forEach((cv) => {
    let on = false;
    new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(cv);
    const per = +cv.dataset.loop * 1000;
    const loop = (now) => { if (on) paint(cv, reduce ? 0 : (now % per) / per); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
})();
