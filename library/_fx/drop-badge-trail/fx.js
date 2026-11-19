// Falling badge trail: each time the cursor moves panel width ÷ 8 over the panel, one badge pops out at the cursor position at 1.3x (elastic.out(2, .6) .4s)
// Pushed toward the direction moved, it falls to the bottom edge of the screen (back.in(1.1) .4s), then tilts again and drops out below (.3s) — Brand footer wordmark
(() => {
  kfFx.register("drop-badge-trail", (el, { options, reduce, hover }) => {
    const pool = [...el.querySelectorAll('[data-fx-part="badge"]')];
    if (reduce || !pool.length) return;
    const per = +(options.per ?? (hover ? 8 : 6)) || 8, most = +(options.max ?? 8) || 8;
    const live = new Set();
    let box = el.getBoundingClientRect(), step = box.width / per, run = 0, lx = 0, ly = 0, fresh = true, idx = 0;
    const fit = () => { box = el.getBoundingClientRect(); step = box.width / per; };
    const spawn = (cx, cy, dx) => {
      if (live.size >= most) return;
      const src = pool[idx]; idx = (idx + 1) % pool.length;
      const o = src.cloneNode(true);
      o.removeAttribute("data-fx-part");
      o.setAttribute("aria-hidden", "true");
      o.classList.add("fx-dbt-spawn");
      el.appendChild(o);
      const lx0 = cx - box.left, ly0 = cy - box.top, fall = innerHeight - cy, bend = 1.5 + (1 - cy / innerHeight);
      const tl = gsap.timeline({ onComplete: () => { live.delete(tl); o.remove(); } });
      live.add(tl);
      tl.fromTo(o, { xPercent: -50 + (Math.random() - 0.5) * 80, yPercent: -50 + (Math.random() - 0.5) * 10, scaleX: 1.3, scaleY: 1.3, rotation: (Math.random() - 0.5) * 20 }, { scaleX: 1, scaleY: 1, ease: "elastic.out(2, 0.6)", duration: 0.4 })
        .fromTo(o, { x: lx0 }, { x: `+=${2 * dx}`, rotation: 0, ease: "power1.in", duration: 0.4 }, "<")
        .fromTo(o, { y: ly0 }, { y: `+=${fall}`, scale: 0.9, yPercent: -95, ease: "back.in(1.1)", duration: 0.4 }, "<")
        .to(o, { x: `+=${1.6 * dx}`, rotation: (Math.random() - 0.5) * 40, ease: "power1.in", duration: 0.3 })
        .to(o, { yPercent: 150, ease: `back.in(${bend})`, duration: 0.3 }, "<");
    };
    const track = (cx, cy) => {
      if (document.hidden) return;
      if (cx < box.left || cx > box.right || cy < box.top || cy > box.bottom) { fresh = true; run = 0; return; }
      const x = cx - box.left, y = cy - box.top;
      if (fresh) { fresh = false; lx = x; ly = y; return; }
      run += Math.abs(x - lx) + Math.abs(y - ly);
      const dx = x - lx;
      lx = x; ly = y;
      if (run > step) { run = 0; spawn(cx, cy, dx); }
    };
    const move = (e) => track(e.clientX, e.clientY);
    const touch = (e) => e.touches?.[0] && track(e.touches[0].clientX, e.touches[0].clientY);
    const re = () => fit();
    const ro = new ResizeObserver(re);
    ro.observe(el);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("touchmove", touch, { passive: true });
    addEventListener("scroll", re, { passive: true });
    addEventListener("resize", re, { passive: true });
    return () => {
      ro.disconnect();
      removeEventListener("pointermove", move);
      removeEventListener("touchmove", touch);
      removeEventListener("scroll", re);
      removeEventListener("resize", re);
      live.forEach((t) => t.kill());
      el.querySelectorAll(".fx-dbt-spawn").forEach((n) => n.remove());
    };
  });
})();
