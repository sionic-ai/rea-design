// Work list: gallery view is a tunnel where photos fly in from perspective depth (z -7000 → 1000), list view has big title rows and a photo that follows the mouse.
// Original values: 200 per second + wheel speed (wheel deltaY×2, ×.95 each frame) × 2–10× per column · mouse parallax 150px (lerp .03) · on hover other columns .2 (lerp .08) · speed 0 (lerp .06)
// View switch: gallery .5s power3.in (vanishes at 1.05x) / list rows y70 .8s expo.out stagger .055 / on return y-50 .45s power3.in from the end at .04.
(() => {
  const SH = window.SH;
  const gallery = document.querySelector(".ex-gallery");
  const list = document.querySelector(".ex-list");
  const items = [...gallery.querySelectorAll(".ex-item")];
  const rows = [...list.querySelectorAll(".ex-row")];
  const float = list.querySelector(".ex-list__float");
  const btns = [...document.querySelectorAll(".ex-toggle__btn")];
  const KEY = "sh-explore-view";
  let view = sessionStorage.getItem(KEY) === "list" ? "list" : "gallery";
  let busy = false;

  /* ---------- Gallery tunnel ---------- */
  const z = [], gain = [];
  let raf = 0, last = 0, wheelV = 0, hovered = -1, lastMove = 0;
  const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
  let dim = 1, run = 1;
  const scatter = (el) => {
    el.style.left = `${-100 + Math.random() * 300}%`;
    el.style.top = `${-100 + Math.random() * 300}%`;
  };
  items.forEach((el, i) => {
    z[i] = -Math.random() * 7000;
    gain[i] = 2 + Math.random() * 8;
    scatter(el);
    // Original: only cells entered within .1s of the mouse moving count as hovered (cells that flew in and landed in place are ignored).
    el.addEventListener("mouseenter", () => { if (performance.now() - lastMove < 100) hovered = i; });
    el.addEventListener("mouseleave", () => { if (hovered === i) hovered = -1; });
  });
  const tick = (now) => {
    raf = requestAnimationFrame(tick);
    if (!last) { last = now; return; }
    const dt = (now - last) / 1000;
    last = now;
    wheelV *= 0.95;
    mouse.x += (mouse.tx - mouse.x) * 0.03;
    mouse.y += (mouse.ty - mouse.y) * 0.03;
    dim += ((hovered !== -1 ? 0.2 : 1) - dim) * 0.08;
    run += ((hovered !== -1 ? 0 : 1) - run) * 0.06;
    items.forEach((el, i) => {
      z[i] += (200 + wheelV * gain[i]) * run * dt;
      if (z[i] > 1000) { el.style.opacity = "0"; z[i] = -7000 - Math.random() * 1500; scatter(el); }
      if (z[i] < -8501) { el.style.opacity = "0"; z[i] = 995; scatter(el); }
      const w = z[i];
      let a = 1;
      if (w < -1000) a = (w + 7000) / 6000;
      else if (w > 500) a = 1 - (w - 500) / 500;
      a = Math.max(0, Math.min(1, a));
      if (hovered !== i) a *= dim;
      const k = (w + 7000) / 8000;
      el.style.opacity = a;
      el.style.transform = `translate3d(calc(-50% + ${mouse.x * 150 * k}px), calc(-50% + ${mouse.y * 150 * k}px), ${w}px)`;
      el.style.zIndex = Math.round(w + 7000);
    });
  };
  addEventListener("mousemove", (e) => {
    mouse.tx = (e.clientX - innerWidth / 2) / (innerWidth / 2);
    mouse.ty = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    lastMove = performance.now();
  }, { passive: true });
  addEventListener("wheel", (e) => { if (view === "gallery") wheelV += e.deltaY * 2; }, { passive: true });
  let touchY = 0;
  addEventListener("touchstart", (e) => (touchY = e.touches[0].clientY), { passive: true });
  addEventListener("touchmove", (e) => { const y = e.touches[0].clientY; if (view === "gallery") wheelV += (touchY - y) * 2; touchY = y; }, { passive: true });

  const startGallery = () => {
    gallery.hidden = false;
    list.hidden = true;
    gsap.to(gallery, { opacity: 1, duration: 0.55, ease: "power2.out" });
    if (SH.reduced) { items.forEach((el, i) => { z[i] = -400 * (i % 6); }); tick(performance.now()); cancelAnimationFrame(raf); return; }
    last = 0;
    raf = requestAnimationFrame(tick);
  };

  /* ---------- List View ---------- */
  const fl = { x: 0, y: 0, tx: 0, ty: 0 };
  let flRaf = 0;
  const follow = () => {
    fl.x += (fl.tx - fl.x) * 0.08;
    fl.y += (fl.ty - fl.y) * 0.08;
    float.style.transform = `translate(calc(${fl.x}px - 50%), calc(${fl.y}px - 50%))`;
    flRaf = requestAnimationFrame(follow);
  };
  addEventListener("mousemove", (e) => { fl.tx = e.clientX; fl.ty = e.clientY; }, { passive: true });
  // With reduced motion, do not show the photo that follows the cursor (the gallery parallax stops with the tunnel and turns off too)
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches && !SH.reduced;
  rows.forEach((r) => {
    r.addEventListener("mouseenter", () => {
      if (!fine) return;
      float.dataset.label = r.dataset.label;
      float.style.setProperty("--tint", r.dataset.tint);
      gsap.to(float, { opacity: 1, duration: 0.25, ease: "power2.out" });
    });
    r.addEventListener("mouseleave", () => gsap.to(float, { opacity: 0, duration: 0.2, ease: "power2.in" }));
  });
  const startList = () => {
    gallery.hidden = true;
    list.hidden = false;
    gsap.from(rows, { y: 70, opacity: 0, stagger: 0.055, duration: 0.8, ease: "expo.out", clearProps: "all" });
    cancelAnimationFrame(flRaf);
    follow();
    SH.lenis?.resize();
  };

  /* ---------- View Toggle ---------- */
  const paintBtns = () => btns.forEach((b) => {
    const on = b.dataset.view === view;
    b.classList.toggle("is-active", on);
    b.textContent = (on ? "[ " : "") + (b.dataset.view === "gallery" ? "View gallery" : "View list") + (on ? " ]" : "");
  });
  const setView = (next) => {
    if (next === view || busy) return;
    busy = true;
    if (next === "list") {
      cancelAnimationFrame(raf);
      gsap.to(gallery, { opacity: 0, scale: 1.05, duration: 0.5, ease: "power3.in", onComplete: () => {
        gsap.set(gallery, { scale: 1 });
        view = "list"; sessionStorage.setItem(KEY, view); paintBtns(); startList(); busy = false;
      } });
    } else {
      gsap.to(rows, { y: -50, opacity: 0, stagger: { each: 0.04, from: "end" }, duration: 0.45, ease: "power3.in", onComplete: () => {
        gsap.set(rows, { clearProps: "all" });
        cancelAnimationFrame(flRaf);
        scrollTo(0, 0);
        view = "gallery"; sessionStorage.setItem(KEY, view); paintBtns(); startGallery(); busy = false;
      } });
    }
  };
  btns.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  paintBtns();
  if (view === "list") startList();
  else startGallery();
})();
