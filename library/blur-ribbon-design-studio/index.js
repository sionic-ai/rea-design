// Home page — hero entrance, drag band, statement fill and signature, pinned service section, team intro entrance, background bloom opacity per section
(() => {
  const { touch, split } = MD;
  const E = MD.ease();
  const blur = (px) => (touch ? {} : { filter: `blur(${px}px)` });
  const clear = touch ? {} : { filter: "blur(0px)" };
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero — section 40px below·blur 8px .9s (.1 late), big title characters .45s .02 apart (.25 late), strip 30px below·blur 6px .8s (.3 late)
    const hero = document.querySelector(".hm-hero"), reel = document.querySelector(".hm-reel");
    gsap.set(hero, { opacity: 0, y: 40, ...blur(8) });
    gsap.set(reel, { opacity: 0, y: 30, ...blur(6) });
    MD.onReveal(() => {
      gsap.to(hero, { opacity: 1, y: 0, ...clear, duration: 0.9, ease: E, delay: 0.1, overwrite: true });
      const chars = document.querySelectorAll(".hm-hero__h .fx-wp-char");
      if (chars.length) gsap.fromTo(chars, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: E, stagger: 0.02, delay: 0.25 });
      gsap.to(reel, { opacity: 1, y: 0, ...clear, duration: 0.8, ease: E, delay: 0.3, overwrite: true });
    });

    // Manifesto — while the section stays pinned for 1.5 screens, every character goes line by line from pale gray → deep navy (.02 per character, scrub .3)
    const track = document.querySelector(".hm-manifesto-track");
    const chars = [...document.querySelectorAll("[data-fill]")].flatMap((p) => split(p));
    const founders = document.querySelector(".hm-founders"), cards = [...founders.children];
    const sigs = [...document.querySelectorAll(".sig-path")];
    track.classList.add("is-held");
    gsap.set(founders, { opacity: 0 });
    gsap.set(cards, { opacity: 0, y: 16, ...blur(8) });
    sigs.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
    gsap.set(".sig-dot", { opacity: 0 });
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink-soft").trim();
    const tl = gsap.timeline({ scrollTrigger: { trigger: track, start: "top top", end: () => `+=${innerHeight * 1.5}`, scrub: touch ? 1 : 0.3, invalidateOnRefresh: true } });
    tl.to(chars, { color: ink, duration: 0.02, ease: "none", stagger: { each: 0.98 / Math.max(chars.length - 1, 1) } }, 0);
    tl.set(founders, { opacity: 1 }, 1);
    tl.to(cards, { opacity: 1, y: 0, ...clear, duration: 0.4, stagger: 0.15, ease: "power2.out" }, 1);
    // Signature — strokes are drawn split by length ratio with .7s power2.out · 1s power2.inOut (original at 4/3 speed)
    let drawn = false;
    tl.call(() => {
      if (drawn) return;
      drawn = true;
      // Like the original signature — each group has its own length (group tempo: data-timing per signature), strokes in a group split by length ratio and drawn in order, the group’s dot at the group end after .15s, and the remaining dot last
      const EASES = ["power2.out", "power2.inOut", "power2.inOut", "power1.inOut"];
      document.querySelectorAll(".hm-sig").forEach((svg) => {
        const durs = (svg.dataset.timing || "0.7,1,0.45,0.6").split(",").map(Number);
        const t = gsap.timeline().timeScale(1 / 0.75);
        [0, 1, 2, 3].forEach((g) => {
          const paths = [...svg.querySelectorAll(`.sig-path[data-g="${g}"]`)];
          if (!paths.length) return;
          const lens = paths.map((p) => p.getTotalLength()), sum = lens.reduce((x, y) => x + y, 0);
          const at = t.duration();
          let off = 0;
          paths.forEach((p, i) => { const d = Math.max(durs[g] * (lens[i] / sum), 0.05); t.to(p, { strokeDashoffset: 0, duration: d, ease: EASES[g] }, at + off); off += d; });
          svg.querySelectorAll(`.sig-dot[data-g="${g}"]`).forEach((dot) => t.to(dot, { opacity: 1, duration: 0.15, ease: "power1.out" }, at + off));
        });
        svg.querySelectorAll(".sig-dot:not([data-g])").forEach((dot) => t.to(dot, { opacity: 1, duration: 0.15, ease: "power1.out" }));
      });
    }, null, 1.2);

    // Services — 3 screens stuck together, one section = Pause .3 + transition .5 + pause .3. Text exits 30px upward and the next text enters from 30px below, video cross-fades, title letters unblur with .015 stagger
    const svcTrack = document.querySelector(".hm-svc-track"), svc = svcTrack.querySelector(".hm-svc");
    const slides = [...svc.querySelectorAll(".hm-slide")], vids = [...svc.querySelectorAll(".hm-svc__v")];
    const titles = slides.map((s) => split(s.querySelector(".hm-slide__t")));
    svcTrack.classList.add("is-held");
    slides.forEach((s, i) => i && gsap.set(s, { opacity: 0, y: 30 }));
    vids.forEach((v, i) => i && gsap.set(v, { opacity: 0 }));
    titles.forEach((t) => gsap.set(t, { opacity: 0, ...blur(4) }));
    const hold = 0.3, move = 0.5, phase = hold + move + hold;
    const stl = gsap.timeline({ scrollTrigger: { trigger: svcTrack, start: "top top", end: () => `+=${innerHeight * 3}`, scrub: touch ? 1.5 : 0.4, invalidateOnRefresh: true } });
    stl.to(titles[0], { opacity: 1, ...clear, duration: 0.2, stagger: 0.015, ease: "none" }, 0);
    for (let i = 0; i < slides.length - 1; i++) {
      const at = i * phase + hold + 0.2;
      stl.to(slides[i], { opacity: 0, y: -30, duration: move * 0.6, ease: "none" }, at);
      stl.to(vids[i], { opacity: 0, duration: move * 0.7, ease: "none" }, at);
      stl.fromTo(vids[i + 1], { opacity: 0 }, { opacity: 1, duration: move * 0.7, ease: "none" }, at + move * 0.15);
      stl.fromTo(slides[i + 1], { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: move * 0.6, ease: "none" }, at + move * 0.3);
      stl.to(titles[i + 1], { opacity: 1, ...clear, duration: 0.2, stagger: 0.015, ease: "none" }, at + move * 0.35);
    }
    stl.to({}, { duration: hold }, (slides.length - 1) * phase + hold);
    const badge = svc.querySelector(".md-badge"), head = split(svc.querySelector(".hm-svc__h"));
    gsap.set(head, { opacity: 0, y: 8, ...blur(6) });
    ScrollTrigger.create({
      trigger: svc, start: "top 80%", once: true,
      onEnter: () => {
        gsap.fromTo(badge, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
        gsap.to(head, { opacity: 1, y: 0, ...clear, duration: 0.45, ease: "power2.out", stagger: 0.02, delay: 0.15 });
      },
    });

    // Team intro — at 78% the side photos start from ±60px and blur 12px over 1.1s, and the text from 24px below and blur 8px, .2 later over .9s
    const about = document.querySelector(".hm-about");
    const left = about.querySelector(".is-left"), right = about.querySelector(".is-right"), text = about.querySelector(".hm-about__text");
    gsap.set(left, { opacity: 0, x: -60, ...blur(12) });
    gsap.set(right, { opacity: 0, x: 60, ...blur(12) });
    gsap.set(text, { opacity: 0, y: 24, ...blur(8) });
    ScrollTrigger.create({
      trigger: about, start: "top 78%", once: true,
      onEnter: () => {
        gsap.to([left, right], { opacity: 1, x: 0, ...clear, duration: 1.1, ease: E });
        gsap.to(text, { opacity: 1, y: 0, ...clear, duration: 0.9, ease: E, delay: 0.2 });
      },
    });

    // Background bleed — lifts when the work section enters (bottom→45%), returns in the lab section 30%→−25%, lifts again in the logo section then moves down at the footer and returns
    const bg = document.querySelector(".md-bg");
    const smooth = (p) => p * p * (3 - 2 * p);
    let zones = null;
    const apply = () => {
      if (!zones) return;
      const v = zones.reduce((a, z) => a + z.sign * smooth(z.st.progress), 1);
      gsap.set(bg, { opacity: Math.min(1, Math.max(0, v)) });
      bg.classList.toggle("md-bg--bottom", zones[2].st.progress > 0.99);
    };
    zones = [
      [".hm-work", "top bottom", "top 45%", -1], [".hm-dose", "top 30%", "top -25%", 1],
      [".hm-logos-sec", "top bottom", "top 50%", -1], [".md-foot", "top bottom", "top 55%", 1],
    ].map(([sel, start, end, sign]) => ({ sign, st: ScrollTrigger.create({ trigger: sel, start, end, invalidateOnRefresh: true, onUpdate: apply, onRefresh: apply }) }));
    apply();
  });

  // Service video board — on hover it tilts up to 3° at perspective 1000px following the spot inside the board (15% at the edges clamped to the end), following .08 per frame
  const wrap = document.querySelector(".hm-svc__video");
  if (wrap && matchMedia("(hover: hover)").matches && !MD.reduce) {
    const t = { rx: 0, ry: 0, cx: 0, cy: 0, on: false, raf: 0 };
    const loop = () => {
      t.cx += (t.rx - t.cx) * 0.08; t.cy += (t.ry - t.cy) * 0.08;
      wrap.style.transform = `perspective(1000px) rotateX(${t.cx.toFixed(3)}deg) rotateY(${t.cy.toFixed(3)}deg)`;
      if (t.on || Math.abs(t.cx - t.rx) > 0.01 || Math.abs(t.cy - t.ry) > 0.01) t.raf = requestAnimationFrame(loop);
      else { wrap.style.transform = ""; t.raf = 0; }
    };
    wrap.addEventListener("mouseenter", () => { t.on = true; if (!t.raf) t.raf = requestAnimationFrame(loop); });
    wrap.addEventListener("mousemove", (e) => {
      const r = wrap.getBoundingClientRect(), pad = 0.15;
      const x = Math.max(pad, Math.min(1 - pad, (e.clientX - r.left) / r.width)), y = Math.max(pad, Math.min(1 - pad, (e.clientY - r.top) / r.height));
      t.ry = (((x - pad) / (1 - 2 * pad)) * 2 - 1) * 3;
      t.rx = -(((y - pad) / (1 - 2 * pad)) * 2 - 1) * 3;
    });
    wrap.addEventListener("mouseleave", () => { t.on = false; t.rx = t.ry = 0; if (!t.raf) t.raf = requestAnimationFrame(loop); });
  }

  // Drag strip — cards duplicated once more for a seamless loop, flowing left one lap per 150s, dragging follows the pointer and on release the speed decays by .95^(dt/16) as it glides.
  const reel = document.querySelector(".hm-reel"), track = reel.querySelector(".hm-reel__track"), drag = document.getElementById("hmDrag");
  [...track.children].forEach((c) => track.append(c.cloneNode(true)));
  let total = 0, pos = 0, dragging = false, startX = 0, startPos = 0, vel = 0, lastX = 0, lastT = 0, mom = 0, coasting = false, prev = 0;
  let cx = 0, cy = 0, tx = 0, ty = 0, showDrag = false;
  const canHover = matchMedia("(hover: hover)").matches;
  const measure = () => { const n = track.children.length / 2; total = 0; for (let i = 0; i < n; i++) total += track.children[i].offsetWidth + 24; };
  measure();
  addEventListener("resize", measure);
  const step = (time) => {
    const now = time * 1000, dt = prev ? Math.min(now - prev, 50) : 16;
    prev = now;
    if (!dragging) {
      if (coasting) { mom *= Math.pow(0.95, dt / 16); pos += mom; if (Math.abs(mom) < 0.2) { coasting = false; mom = 0; } }
      else if (!MD.reduce) pos -= (total / 150000) * dt;
    }
    if (pos <= -total) pos += total; else if (pos > 0) pos -= total;
    track.style.transform = `translate3d(${pos}px,0,0)`;
    if (canHover && showDrag) { cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12; drag.style.left = `${cx | 0}px`; drag.style.top = `${cy | 0}px`; }
  };
  gsap.ticker.add(step);
  const down = (x) => { dragging = true; coasting = false; mom = 0; startX = lastX = x; startPos = pos; lastT = performance.now(); vel = 0; track.classList.add("is-dragging"); };
  const move = (x) => { if (!dragging) return; pos = startPos + (x - startX); const n = performance.now(), d = n - lastT; if (d > 0) vel = ((x - lastX) / d) * 16; lastX = x; lastT = n; };
  const up = () => { if (!dragging) return; dragging = false; track.classList.remove("is-dragging"); if (Math.abs(vel) > 0.5) { mom = vel; coasting = true; } };
  reel.addEventListener("mousedown", (e) => { e.preventDefault(); down(e.clientX); });
  addEventListener("mousemove", (e) => { move(e.clientX); tx = e.clientX; ty = e.clientY; }, { passive: true });
  addEventListener("mouseup", up);
  let tsx = 0, tsy = 0, axis = null;
  reel.addEventListener("touchstart", (e) => { tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; axis = null; }, { passive: true });
  reel.addEventListener("touchmove", (e) => {
    const x = e.touches[0].clientX;
    if (axis === null) { const dx = Math.abs(x - tsx), dy = Math.abs(e.touches[0].clientY - tsy); if (Math.max(dx, dy) < 10) return; axis = dx > dy ? "x" : "y"; if (axis === "x") down(x); }
    if (axis === "x") move(x);
  }, { passive: true });
  reel.addEventListener("touchend", () => { if (axis === "x") up(); axis = null; });
  if (canHover) {
    reel.addEventListener("mouseenter", (e) => { tx = cx = e.clientX; ty = cy = e.clientY; drag.style.left = `${cx}px`; drag.style.top = `${cy}px`; drag.classList.add("is-visible"); showDrag = true; });
    reel.addEventListener("mouseleave", () => { drag.classList.remove("is-visible"); showDrag = false; up(); });
  }
})();
