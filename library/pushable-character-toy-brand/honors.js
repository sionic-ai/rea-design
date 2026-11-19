// Awards: when the list section is 20%·35%·48% in view, the title → list → flowing big text turn on in order, and each big-text line drifts sideways at its own speed (data-speed × 95px).
// Hovering a list row slides the right card to that row’s height (lerp .1), the new image pops out from .1x over .38s, and the card tilts ±8° following the cursor.
// The channel marquee drifts .22px per frame, plus scroll speed × .05 (decaying by .9 each frame), with the middle row reversed. The chronicle title bounces 55px·5° from the hovered side while its word·color change
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const vortex = document.getElementById("vortex");
  const steps = (sec, phone) => {
    const head = sec.querySelector(".mh-head"), list = sec.querySelector(".mh-list"), edit = sec.querySelector(".mh-edit");
    const lines = [...sec.querySelectorAll(".mh-edit__line")];
    return () => {
      const r = sec.getBoundingClientRect(), H = innerHeight, depth = (H - r.top) / H;
      const [a, b, c] = phone() ? [0.08, 0.16, 0.25] : [0.2, 0.35, 0.48];
      head?.classList.toggle("is-on", depth >= a);
      list?.classList.toggle("is-on", depth >= b);
      edit?.classList.toggle("is-on", depth >= c);
      if (depth >= c && !reduce) {
        const p = (H - r.top) / (H + r.height) - 0.5;
        lines.forEach((l) => { l.style.transform = `translate3d(${(p * (+l.dataset.speed || 1) * 95).toFixed(1)}px, 0, 0)`; });
      }
    };
  };
  const phone = () => innerWidth <= 768;
  const runs = [...document.querySelectorAll(".mh-archive")].map((s) => steps(s, phone));
  const onScroll = () => {
    runs.forEach((f) => f());
    if (vortex) document.body.classList.toggle("is-past-vortex", vortex.getBoundingClientRect().bottom < innerHeight * 0.6);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelectorAll(".mh-archive").forEach((sec) => {
    const right = sec.querySelector(".mh-archive__right"), card = sec.querySelector(".mh-float");
    if (!right || !card) return;
    let layers = [...card.querySelectorAll(".mh-float__layer")], ty = 0, y = 0, tx = 0, tz = 0, raf = 0, last = null;
    const tick = () => {
      y += (ty - y) * 0.1;
      card.style.top = `${y.toFixed(1)}px`;
      card.style.setProperty("--tx", `${tx.toFixed(2)}deg`);
      card.style.setProperty("--ty", `${tz.toFixed(2)}deg`);
      raf = Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    sec.querySelectorAll(".mh-row").forEach((row) => row.addEventListener("mouseenter", () => {
      const rr = row.getBoundingClientRect(), cr = right.getBoundingClientRect();
      ty = Math.max(0, Math.min(rr.top - cr.top + rr.height / 2 - card.offsetHeight / 2, right.offsetHeight - card.offsetHeight));
      if (!raf) raf = requestAnimationFrame(tick);
      card.classList.add("is-on");
      if (last === row) return;
      last = row;
      const [top, base] = layers;
      gsap.set(base, { zIndex: 1, opacity: 1, scale: 1 });
      top.style.setProperty("--mh-tone", `var(${row.dataset.tone})`);
      gsap.set(top, { zIndex: 2 });
      gsap.fromTo(top, { scale: 0.1, opacity: 0 }, { scale: 1, opacity: 1, duration: reduce ? 0 : 0.38, ease: "power2.out", overwrite: "auto" });
      layers = [base, top];
    }));
    sec.querySelector(".mh-list")?.addEventListener("mouseleave", () => { card.classList.remove("is-on"); last = null; });
    sec.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      tx = Math.max(-8, Math.min(8, -((e.clientY - (r.top + r.height / 2)) / 40)));
      tz = Math.max(-8, Math.min(8, (e.clientX - (r.left + r.width / 2)) / 40));
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });

  const rows = [...document.querySelectorAll(".mh-mq__row")].map((row) => {
    const track = row.querySelector(".mh-mq__track"), w = row.querySelector(".mh-mq__group")?.offsetWidth || 1000, dir = +row.dataset.dir || -1;
    return { track, w, dir, x: dir === 1 ? -w : 0 };
  });
  let vel = 0, lastY = scrollY;
  addEventListener("scroll", () => { vel += (scrollY - lastY) * 0.05; lastY = scrollY; }, { passive: true });
  const loop = () => {
    vel *= 0.9;
    rows.forEach((r) => {
      r.x += r.dir * (reduce ? 0 : 0.22) + r.dir * vel;
      if (r.x <= -r.w) r.x += r.w; else if (r.x > 0) r.x -= r.w;
      r.track.style.transform = `translate3d(${r.x.toFixed(2)}px, 0, 0)`;
    });
    requestAnimationFrame(loop);
  };
  if (rows.length) loop();

  const box = document.querySelector(".mh-bounce"), word = box?.querySelector(".mh-bounce__word");
  if (box && word) {
    const words = ["CHRONICLES", "GENESIS", "MILESTONES", "EVOLUTION", "EXPERIMENTS", "ARCHIVE", "BRANDVERSE"];
    const tones = ["var(--kf-accent)", "var(--site-glow)", "oklch(from var(--site-glow) 0.85 0.22 calc(h - 50))", "var(--site-yolk)", "oklch(from var(--kf-accent) 0.6 0.27 calc(h - 40))", "var(--kf-contrast-ink)"];
    let k = 0, c = 0, busy = false;
    const bounce = (dir) => {
      if (busy) return;
      busy = true;
      box.style.transform = `translateX(${dir * 55}px) rotate(${dir * 5}deg) scale(1.05)`;
      setTimeout(() => {
        box.classList.add("is-flip");
        setTimeout(() => {
          word.textContent = words[(k = (k + 1) % words.length)];
          word.style.color = tones[(c = (c + 1) % tones.length)];
          box.classList.remove("is-flip");
          box.style.transform = "";
        }, 150);
      }, 150);
      setTimeout(() => (busy = false), 600);
    };
    box.addEventListener("mouseenter", (e) => { const r = box.getBoundingClientRect(); bounce(e.clientX - r.left < r.width / 2 ? 1 : -1); });
    box.addEventListener("click", () => bounce(Math.random() > 0.5 ? 1 : -1));
  }
})();
