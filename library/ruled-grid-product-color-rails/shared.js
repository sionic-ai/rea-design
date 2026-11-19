/* Spanning several pages — baking photo placeholder images (so the mosaic shows), first-open logo curtain (once per session), floating text sticking up on scroll down,
   Magnifier, hero photo swap (4s · .8s overlap · left and right 1/6 are arrow zones), sound button, policy expand, phone menu */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 749px)");
  const v = (n) => getComputedStyle(html).getPropertyValue(n).trim();

  /* Placeholder image — paints surfaces, blotches and diagonals in the Skin colors and bakes them into an image. The mosaic part develops this image sharply at coarse cells */
  const bake = (img, seed) => {
    const [w, h] = (img.dataset.ph || "3x2").split("x").map(Number);
    const W = 480, H = Math.round((W * h) / w);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, v("--kf-raised"));
    grad.addColorStop(1, v("--kf-bg"));
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    g.globalAlpha = 0.28;
    for (let i = 0; i < 3; i++) {
      g.fillStyle = v("--kf-dim");
      g.beginPath();
      g.ellipse(W * (0.2 + rnd() * 0.6), H * (0.3 + rnd() * 0.5), W * (0.08 + rnd() * 0.12), H * (0.1 + rnd() * 0.15), 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 0.25;
    g.strokeStyle = v("--kf-line");
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke();
    img.src = c.toDataURL("image/png");
  };
  $$("img[data-ph]").forEach(bake);

  /* First-open curtain — the curtain flag (is-boot) is attached from the start by a short script in head, only on the first visit of a session */
  const intro = $(".k-intro");
  if (intro && html.classList.contains("is-boot")) {
    try { sessionStorage.setItem("k-intro", "1"); } catch (e) {}
    const done = () => { if (!intro.isConnected) return; intro.remove(); html.classList.remove("is-boot"); };
    setTimeout(() => {
      const a = $("svg", intro).getBoundingClientRect(), b = $(".k-logo svg")?.getBoundingClientRect();
      let moved = false;
      if (b && a.width && b.width) {
        $("svg", intro).style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(${b.width / a.width})`;
        moved = true;
      }
      intro.classList.add("go");
      setTimeout(done, moved ? 1050 : 400);
    }, 700);
    setTimeout(done, 3200);
  } else { intro?.remove(); html.classList.remove("is-boot"); }

  /* When scrolling down, the floating header and menu stick to the top (.45s) */
  const scr = () => html.classList.toggle("is-scrolled", scrollY > 60);
  addEventListener("scroll", scr, { passive: true });
  scr();

  /* Magnifier — a 150px window over the photo shows the area around the cursor, widened by .7x */
  if (matchMedia("(hover: hover)").matches && !reduce) {
    $$(".k-im").forEach((w) => {
      if (w.closest(".k-pimg, .k-pcell") || w.querySelector("video")) return;
      let lens = null, li = null;
      const R = 75;
      w.addEventListener("mouseenter", () => {
        const track = $(".k-track", w);
        const base = track ? track.children[+(track.dataset.i || 0)] : $("img", w);
        if (!base?.src) return;
        if (!lens) {
          lens = document.createElement("div");
          lens.className = "k-lens";
          li = document.createElement("img");
          li.alt = "";
          lens.append(li);
          w.append(lens);
        }
        li.src = base.currentSrc || base.src;
        li.style.width = `${w.clientWidth}px`;
        li.style.height = `${w.clientHeight}px`;
        li.style.transform = "scale(.7)";
      });
      w.addEventListener("mousemove", (e) => {
        if (!lens) return;
        const r = w.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        lens.style.display = "block";
        lens.style.left = `${x - R}px`;
        lens.style.top = `${y - R}px`;
        li.style.left = `${R - x}px`;
        li.style.top = `${R - y}px`;
        li.style.transformOrigin = `${x}px ${y}px`;
      });
      w.addEventListener("mouseleave", () => lens && (lens.style.display = "none"));
    });
  }

  /* Hero photo slider */
  const track = $(".k-track");
  if (track) {
    const imgs = [...track.children], dots = $$(".k-dots button"), n = imgs.length;
    let idx = 0, busy = false, timer = 0;
    imgs[0].classList.add("cur");
    const upd = () => { track.dataset.i = idx; dots.forEach((d, j) => d.classList.toggle("act", j === idx)); };
    const go = (i) => {
      if (busy || i === idx) return;
      busy = true;
      imgs[i].classList.add("cur");
      imgs[idx].classList.remove("cur");
      idx = i;
      upd();
      setTimeout(() => (busy = false), 840);
    };
    const next = () => go((idx + 1) % n), prev = () => go((idx - 1 + n) % n);
    const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => !document.hidden && next(), 4000); };
    $(".k-hprev")?.addEventListener("click", () => { prev(); restart(); });
    $(".k-hnext")?.addEventListener("click", () => { next(); restart(); });
    dots.forEach((d, j) => d.addEventListener("click", () => { go(j); restart(); }));
    const hero = track.closest(".k-im"), pb = $(".k-hprev"), nb = $(".k-hnext");
    hero.addEventListener("mousemove", (e) => {
      if (sp.matches) return;
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      pb?.classList.toggle("hv", x < 1 / 6);
      nb?.classList.toggle("hv", x > 5 / 6);
    });
    hero.addEventListener("mouseleave", () => { pb?.classList.remove("hv"); nb?.classList.remove("hv"); });
    hero.addEventListener("click", (e) => {
      const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (sp.matches) { x > 0.5 ? next() : prev(); restart(); return; }
      if (x < 1 / 6) { prev(); restart(); } else if (x > 5 / 6) { next(); restart(); }
    });
    let tx = 0, ty = 0;
    track.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    track.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? next() : prev(); restart(); }
    }, { passive: true });
    upd();
    restart();
  }

  $$(".k-vmute").forEach((b) => b.addEventListener("click", () => b.classList.toggle("on")));
  $$(".k-policy button").forEach((b) => b.addEventListener("click", () => {
    const p = b.closest(".k-policy");
    b.setAttribute("aria-expanded", String(p.classList.toggle("is-open")));
  }));
  const mb = $(".k-mb");
  mb?.addEventListener("click", () => mb.setAttribute("aria-expanded", String(html.classList.toggle("is-menu-open"))));
  $$(".k-mn a").forEach((a) => a.addEventListener("click", () => html.classList.remove("is-menu-open")));
})();
