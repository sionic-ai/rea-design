/* Journal — an endless object board to explore by dragging. Values read from the original journal bundle */
(() => {
  const JJ = window.JJ, reduce = JJ.reduce;
  const $ = (s, r = document) => r.querySelector(s);
  const root = $(".jn"), field = $("[data-jn-field]");
  // Items of one panel (tile) — past the panel, the same panel repeats end to end
  const TILE = { w: 2200, h: 1500 };
  const ITEMS = [
    { art: "ball", x: 0, y: 0, w: 380, h: 300, r: 0, label: "Black leather ball · On a cord · Front view · Cutout", cap: "Item name · 0000" },
    { art: "jersey", x: -620, y: -40, w: 260, h: 300, r: -8, label: "Purple uniform top · laid flat · cutout", cap: "Uniform · 0000" },
    { art: "cleat", x: 640, y: 30, w: 300, h: 230, r: 6, label: "Single golden soccer boot · side view · cutout", cap: "Soccer cleats · 0000" },
    { art: "phones", x: -260, y: 470, w: 240, h: 220, r: 4, label: "White fur headphones · Front view · Cutout", cap: "Headphones · 0000" },
    { art: "boxes", x: 330, y: -470, w: 320, h: 260, r: -3, label: "Three cereal boxes · Cutout", cap: "Limited Edition · 0000" },
    { photo: true, x: -560, y: -520, w: 220, h: 270, r: -5, label: "Selfie at event venue · printed photo · portrait", cap: "Photo · 0000" },
    { photo: true, x: 720, y: 520, w: 240, h: 200, r: 5, label: "Stadium stands · printed photo · landscape", cap: "Photo · 0000" },
    { art: "shoe", x: -880, y: 420, w: 280, h: 210, r: -10, label: "Single white sneaker · side view · cutout", cap: "Sneakers · 0000" },
    { art: "profile", x: 960, y: -380, w: 220, h: 260, r: 3, label: "Sunglasses · top view · cutout", cap: "Glasses · 0000" },
    { photo: true, x: 80, y: 600, w: 200, h: 250, r: 7, label: "Magazine cover · Person · Portrait", cap: "Magazine · 0000" },
  ];
  const els = ITEMS.map((it, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "jn-item" + (it.photo ? " is-photo" : "");
    b.dataset.journalItem = i;
    b.setAttribute("aria-label", it.cap);
    b.style.width = `${it.w}px`; b.style.height = `${it.h}px`;
    const inner = it.photo ? `<div class="jj-ph is-light" data-label="${it.label}" style="width:100%;height:100%"></div>` : `<canvas width="${it.w * 2}" height="${it.h * 2}" data-art="${it.art}"></canvas>`;
    b.innerHTML = `<div class="jn-item__in">${inner}<span class="jn-item__sheen"></span></div>`;
    field.append(b);
    const c = b.querySelector("canvas");
    if (c) window.JJArt?.paint(c);
    const cap = document.createElement("span");
    cap.className = "jn-cap";
    cap.textContent = it.cap;
    field.append(cap);
    // Hovering tilts it toward the cursor and light streaks follow
    const inn = b.firstElementChild;
    b.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = b.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
      inn.style.setProperty("--jj-ry", `${(mx - 0.5) * 16}deg`); inn.style.setProperty("--jj-rx", `${-(my - 0.5) * 12}deg`); inn.style.setProperty("--jj-mxf", mx.toFixed(3));
    });
    b.addEventListener("pointerleave", () => { inn.style.setProperty("--jj-rx", "0deg"); inn.style.setProperty("--jj-ry", "0deg"); });
    return { b, cap, it };
  });

  // ── Moving panels: drag · wheel, inertia on release (friction .92/frame) ──
  const cam = { x: 0, y: 0, vx: 0, vy: 0 };
  let drag = null, moved = 0, raf = 0;
  const wrap = (v, s) => ((((v + s / 2) % s) + s) % s) - s / 2;
  const place = () => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    els.forEach(({ b, cap, it }) => {
      const x = wrap(it.x + cam.x, TILE.w), y = wrap(it.y + cam.y, TILE.h);
      b.style.transform = `translate(${cx + x - it.w / 2}px, ${cy + y - it.h / 2}px) rotate(${it.r}deg)`;
      cap.style.left = `${cx + x}px`; cap.style.top = `${cy + y + it.h / 2 + 16}px`;
    });
  };
  const tick = () => {
    raf = 0;
    if (!drag) {
      cam.x += cam.vx; cam.y += cam.vy;
      cam.vx *= 0.92; cam.vy *= 0.92;
      if (Math.abs(cam.vx) + Math.abs(cam.vy) > 0.05) raf = requestAnimationFrame(tick);
    }
    place();
  };
  const kick = () => !raf && (raf = requestAnimationFrame(tick));
  root.addEventListener("pointerdown", (e) => {
    if (root.classList.contains("is-open") || e.target.closest(".jn-detail, .jj-head, .jj-sound, .wf-ui")) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
    moved = 0; cam.vx = cam.vy = 0;
    root.classList.add("is-drag");
  });
  addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = Math.max(1, e.timeStamp - drag.t);
    cam.x += dx; cam.y += dy; moved += Math.abs(dx) + Math.abs(dy);
    cam.vx = (dx / dt) * 16; cam.vy = (dy / dt) * 16;
    drag.x = e.clientX; drag.y = e.clientY; drag.t = e.timeStamp;
    place();
  });
  addEventListener("pointerup", () => { if (!drag) return; drag = null; root.classList.remove("is-drag"); if (!reduce) kick(); });
  root.addEventListener("wheel", (e) => { if (root.classList.contains("is-open")) return; e.preventDefault(); cam.x -= e.deltaX * 0.8; cam.y -= e.deltaY * 0.8; place(); }, { passive: false });
  addEventListener("resize", place);
  place();

  // Intro: items appear from a 14px blur over 620ms with (.16,1,.3,1), delayed by 120 + 55×index ms
  if (!reduce) {
    els.forEach(({ b }) => (b.style.opacity = "0"));
    JJ.onReveal(() => els.forEach(({ b }, i) => {
      b.animate([{ opacity: 0, filter: "blur(14px)" }, { opacity: 1, filter: getComputedStyle(b).filter }], { duration: 620, delay: 120 + 55 * i, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" });
      b.style.opacity = "";
    }));
  }

  // ── Detail: card reveals from 56px left in .85s, close·arrow .4s (.45 delay). On close .12s·.3s editorial ──
  const det = $("[data-jn-detail]"), card = $("[data-jn-card]"), nav = $("[data-jn-nav]"), x = $("[data-jn-close]");
  let open = -1, tlOpen = null;
  const fill = (i) => {
    const it = ITEMS[i];
    $("[data-jn-h]").textContent = it.cap.split(" · ")[0];
    $("[data-jn-media]").dataset.label = it.label;
  };
  const show = (i) => {
    open = i;
    fill(i);
    det.hidden = false;
    root.classList.add("is-open");
    document.body.classList.add("jn-open");
    els.forEach(({ b }, k) => b.classList.toggle("is-active", k === i));
    // The picked item moves to the right center of the board (.9s reveal)
    const it = ITEMS[i], tx = innerWidth * 0.12 - wrap(it.x + cam.x, TILE.w), ty = -wrap(it.y + cam.y, TILE.h);
    gsap.to(cam, { x: cam.x + tx, y: cam.y + ty, duration: reduce ? 0 : 0.9, ease: JJ.ease("reveal"), onUpdate: place });
    tlOpen?.kill();
    if (reduce) { gsap.set(card, { autoAlpha: 1, x: 0 }); gsap.set([nav, x], { autoAlpha: 1 }); return; }
    tlOpen = gsap.timeline({ defaults: { ease: JJ.ease("reveal") } })
      .fromTo(card, { x: innerWidth < 768 ? 0 : -56, y: innerWidth < 768 ? 110 : 0, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.85 }, 0)
      .to([nav, x], { autoAlpha: 1, duration: 0.4 }, 0.45)
      .fromTo(card.querySelectorAll("[data-anim]"), { opacity: 0, y: 16, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.055, delay: 0.08, clearProps: "filter,transform" }, 0);
  };
  const close = () => {
    if (open < 0) return;
    open = -1;
    root.classList.remove("is-open");
    document.body.classList.remove("jn-open");
    els.forEach(({ b }) => b.classList.remove("is-active"));
    tlOpen?.kill();
    const done = () => (det.hidden = true);
    if (reduce) return done();
    tlOpen = gsap.timeline({ defaults: { ease: JJ.ease("editorial") }, onComplete: done })
      .to([nav, x], { autoAlpha: 0, duration: 0.12 }, 0)
      .to(card, { x: innerWidth < 768 ? 0 : -56, y: innerWidth < 768 ? 110 : 0, autoAlpha: 0, duration: 0.3 }, 0);
  };
  els.forEach(({ b }, i) => b.addEventListener("click", () => { if (moved > 6) return; show(i); }));
  x.addEventListener("click", close);
  det.addEventListener("click", (e) => e.target === det && close());
  $("[data-jn-prev]").addEventListener("click", () => show((open - 1 + ITEMS.length) % ITEMS.length));
  $("[data-jn-next]").addEventListener("click", () => show((open + 1) % ITEMS.length));
  addEventListener("keydown", (e) => {
    if (open < 0) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show((open + 1) % ITEMS.length);
    if (e.key === "ArrowLeft") show((open - 1 + ITEMS.length) % ITEMS.length);
  });
})();
