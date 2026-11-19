(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── Character: instead of the original art, an ink-colored character is drawn as SVG in the same place and size, and the eyes follow the cursor via eye-follow ── */
  const fuzz = (cx, cy, r, n = 26, amp = 0.09) => {
    let d = "";
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2, rr = r * (i % 2 ? 1 + amp : 1 - amp * 0.4);
      d += (i ? "L" : "M") + (cx + Math.cos(a) * rr).toFixed(1) + "," + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return d + "Z";
  };
  const CHARAS = {
    soot: { body: () => fuzz(50, 24, 15) + fuzz(50, 52, 16) + fuzz(50, 80, 15), eyes: [[44, 22, 7], [56, 22, 7], [44, 50, 7], [56, 50, 7], [44, 78, 7], [56, 78, 7]] },
    bell: { body: () => "M50 12c-6 0-8 4-8 8h16c0-4-2-8-8-8ZM30 26c0-4 9-6 20-6s20 2 20 6l4 52c0 5-11 8-24 8s-24-3-24-8Z", lines: "M30 40h40M29 52h42M28 64h44M40 26v12M50 26v12M60 26v12M18 30l-4 52M12 34l12 2", eyes: [[42, 46, 8], [58, 46, 8]] },
    daruma: { body: () => "M50 18c16 0 28 14 28 32 0 10-4 18-8 22 6 4 10 8 10 12H20c0-4 4-8 10-12-4-4-8-12-8-22 0-18 12-32 28-32Z", lines: "M30 70c10 4 30 4 40 0M28 78c12 4 32 4 44 0M76 40l14-22M88 14l6 6", eyes: [[42, 40, 9], [58, 40, 9]] },
    jizo: { body: () => "M50 14c12 0 20 9 20 20 0 6-2 10-4 13 6 5 10 14 10 26 0 9-12 13-26 13S24 82 24 73c0-12 4-21 10-26-2-3-4-7-4-13 0-11 8-20 20-20Z", lines: "M40 66c4 6 16 6 20 0M44 58l6 8 6-8", eyes: [[43, 34, 8], [57, 34, 8]] },
    komainu: { body: () => "M18 40c0-10 8-16 16-16s14 6 14 14v8l2 30H16l2-24c-2-4 0-8 0-12ZM52 40c0-10 8-16 16-16s14 6 14 14c0 4 2 8 0 12l2 24H50l2-30Z", lines: "M22 30c-4-2-6 2-4 6M78 30c4-2 6 2 4 6M24 74v-10M44 74v-10M56 74v-10M76 74v-10", eyes: [[29, 38, 7], [39, 38, 7], [61, 38, 7], [71, 38, 7]] },
    lantern: { body: () => "M40 10h20l4 8H36ZM34 20h32l-2 12H36ZM38 34h24v18H38ZM32 54h36l-4 10H36ZM42 66h16v18H42ZM34 86h32v4H34Z", lines: "M44 38v10M56 38v10", eyes: [[45, 42, 6], [55, 42, 6]] },
  };
  const EYE = "margin: 1; reach: 180; dur: .12; back: .22";
  function face(kind, tilt, eyes = true) {
    const c = CHARAS[kind] || CHARAS.soot;
    const f = document.createElement("span");
    f.setAttribute("data-fx-part", "face");
    const g = `<g transform="rotate(${tilt} 50 50)"><path class="ms-chara-body" d="${c.body()}"/>${c.lines ? `<path class="ms-chara-line" d="${c.lines}"/>` : ""}</g>`;
    const still = eyes ? "" : c.eyes.map(([x, y, r]) => `<circle class="ms-chara-paper" cx="${x}" cy="${y}" r="${r / 2}"/><circle class="ms-chara-ink" cx="${x}" cy="${y}" r="${r / 3.4}"/>`).join("");
    f.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${g}${still}</svg>`;
    if (eyes) c.eyes.forEach(([x, y, s]) => {
      const rad = (tilt * Math.PI) / 180, dx = x - 50, dy = y - 50;
      const ex = 50 + dx * Math.cos(rad) - dy * Math.sin(rad), ey = 50 + dx * Math.sin(rad) + dy * Math.cos(rad);
      const e = document.createElement("span");
      e.className = "ms-eye";
      e.setAttribute("data-fx", "eye-follow");
      e.setAttribute("data-fx-eye-follow", EYE);
      e.style.cssText = `left:${ex - s / 2}%;top:${ey - s / 2}%;width:${s}%;height:${s}%`;
      e.innerHTML = '<span data-fx-part="pupil"></span>';
      f.append(e);
    });
    return f;
  }
  document.querySelectorAll("[data-chara]").forEach((el) => {
    const kind = el.dataset.chara;
    if (el.classList.contains("is-static")) el.append(face(kind, 0, false));
    else el.append(face(kind, 0), face(kind, -8));
  });

  /* ── Smooth scroll: original Lenis 1.3.26 · lerp .08 · run by the GSAP ticker ── */
  let lenis = null;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.08, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 });
    window.msLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ── Menu Drawer ── */
  const nav = document.querySelector(".ms-nav"), navIn = nav?.querySelector(".ms-nav__inner");
  const overlay = document.querySelector(".ms-nav-overlay"), sub = document.querySelector(".ms-header.is-sub");
  const btns = [...document.querySelectorAll(".js-nav-btn")];
  // Like jQuery, take the moment of the click as the start and set opacity per frame from elapsed time (300ms)
  let fadeRaf = 0;
  const fade = (el, show) => {
    if (!el) return;
    cancelAnimationFrame(fadeRaf);
    const t0 = performance.now(), from = show ? 0 : 1, to = show ? 1 : 0;
    el.style.display = "block";
    el.style.opacity = String(from);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 300), k = 0.5 - Math.cos(p * Math.PI) / 2;
      el.style.opacity = String(from + (to - from) * k);
      if (p < 1) fadeRaf = requestAnimationFrame(step);
      else if (!show) el.style.display = "none";
    };
    fadeRaf = requestAnimationFrame(step);
  };
  function closeNav() {
    if (!nav?.classList.contains("is-open")) return;
    sub?.classList.remove("is-open");
    fade(overlay, false);
    nav.classList.remove("is-open"); navIn?.classList.remove("is-open");
    btns.forEach((b) => b.classList.remove("is-open"));
    lenis?.start();
  }
  function openNav() {
    fade(overlay, true);
    sub?.classList.add("is-open");
    nav.classList.add("is-open"); navIn?.classList.add("is-open");
    btns.forEach((b) => b.classList.add("is-open"));
    lenis?.stop();
  }
  btns.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); nav?.classList.contains("is-open") ? closeNav() : openNav(); }));
  overlay?.addEventListener("click", closeNav);
  navIn?.addEventListener("click", (e) => e.stopPropagation());
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  /* ── Header floating up from below: it stands once past the Hero, shows only when scrolling up, and hides near the bottom of the footer ── */
  if (sub) {
    const mv = document.querySelector(".js-mv"), foot = document.querySelector(".js-footer-bottom");
    if (mv) new IntersectionObserver(([e]) => {
      if (e.isIntersecting) sub.classList.remove("is-active");
      else { sub.classList.add("is-no-transition", "is-active"); requestAnimationFrame(() => requestAnimationFrame(() => sub.classList.remove("is-no-transition"))); }
    }, { threshold: 0 }).observe(mv);
    let last = scrollY;
    addEventListener("scroll", () => { sub.classList.toggle("is-shown", scrollY < last && scrollY > 0); last = scrollY; }, { passive: true });
    if (foot) new IntersectionObserver(([e]) => sub.classList.toggle("is-hidden", e.isIntersecting), { threshold: 0 }).observe(foot);
  }

  /* ── When it enters the screen, is-animated is added (original js-c-anime-elem — bottom 25% band, removed on exit if data-repeat) ── */
  document.querySelectorAll("[data-anime-delay]").forEach((n) => n.style.setProperty("--d", n.dataset.animeDelay));
  const animate = () => document.querySelectorAll(".js-anime").forEach((el) => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (el.hasAttribute("data-repeat")) el.classList.toggle("is-animated", e.isIntersecting);
      else if (e.isIntersecting) { el.classList.add("is-animated"); io.disconnect(); }
    }), { rootMargin: el.dataset.inview || "0% 10% -25% 10%", threshold: 0 });
    io.observe(el);
  });
  if (document.readyState === "complete") animate(); else addEventListener("load", animate, { once: true });

  /* ── Frame outline: draws the line running along the carved-out corner at its own size ── */
  const frames = [...document.querySelectorAll(".ms-frame")];
  const drawFrame = (fr) => {
    const w = fr.clientWidth, h = fr.clientHeight;
    if (!w || !h) return;
    const r = parseFloat(getComputedStyle(fr).getPropertyValue("--notch")) || 17;
    let svg = fr.querySelector(".ms-frame__line");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "ms-frame__line"); svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = "<path/>";
      fr.append(svg);
    }
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.firstChild.setAttribute("d", `M${r},0.5H${w - r}A${r},${r} 0 0,0 ${w - 0.5},${r}V${h - r}A${r},${r} 0 0,0 ${w - r},${h - 0.5}H${r}A${r},${r} 0 0,0 0.5,${h - r}V${r}A${r},${r} 0 0,0 ${r},0.5Z`);
  };
  const ro = new ResizeObserver((list) => list.forEach((e) => drawFrame(e.target)));
  frames.forEach((fr) => { drawFrame(fr); ro.observe(fr); });

  /* ── FAQ open/close: height and opacity at 300ms linear, like the original ── */
  document.querySelectorAll(".ms-faq").forEach((d) => {
    const q = d.querySelector("summary"), a = d.querySelector(".ms-faq__a");
    if (!q || !a) return;
    let busy = false;
    q.addEventListener("click", (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      const done = () => { busy = false; window.ScrollTrigger?.refresh(); lenis?.resize(); };
      if (d.open) {
        d.classList.remove("is-open");
        const an = a.animate([{ height: a.offsetHeight + "px", opacity: 1 }, { height: 0, opacity: 0 }], { duration: 300, easing: "linear" });
        an.onfinish = () => { d.removeAttribute("open"); done(); };
      } else {
        d.setAttribute("open", ""); d.classList.add("is-open");
        const an = a.animate([{ height: 0, opacity: 0 }, { height: a.offsetHeight + "px", opacity: 1 }], { duration: 300, easing: "linear" });
        an.onfinish = done;
      }
    });
  });

  /* ── Hovering the contact button reveals a pattern band diagonally / hovering the footer frame plays a video ── */
  if (fine) {
    const bgs = document.querySelectorAll(".js-cv-bg");
    document.addEventListener("mouseover", (e) => { if (e.target.closest(".js-cv-btn")) bgs.forEach((b) => b.classList.add("is-active")); });
    document.addEventListener("mouseout", (e) => { if (e.target.closest(".js-cv-btn")) bgs.forEach((b) => b.classList.remove("is-active")); });
    document.querySelectorAll(".js-movie-hover").forEach((box) => {
      const mv = box.querySelector(".ms-footer__movie");
      box.addEventListener("mouseenter", () => mv?.classList.add("is-active"));
      box.addEventListener("mouseleave", () => mv?.classList.remove("is-active"));
    });
  }
})();
