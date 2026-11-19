// Lookbook section — big STYLE text flow, floats up when visible, other seniors slider (Swiper only on phones, original speed 600)
mj.page("lookbook", () => {
  const { reduce, mobile } = mj;
  const kill = [];
  document.querySelectorAll("[data-loop]").forEach((row) => {
    const t = row.firstElementChild;
    if (!t || reduce) return;
    row.appendChild(t.cloneNode(true));
    let x = 0, last = 0, on = false;
    const io = new IntersectionObserver(([e]) => { on = e.isIntersecting; });
    io.observe(row);
    const tick = () => { const now = performance.now(), dt = last ? Math.max(1, now - last) : 16.7; last = now; if (!on) return; x -= dt * 0.03; if (-x >= t.offsetWidth) x = 0; [...row.children].forEach((c) => { c.style.transform = `translate3d(${x}px,0,0)`; }); };
    gsap.ticker.add(tick);
    kill.push(() => { gsap.ticker.remove(tick); io.disconnect(); });
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll("[data-js-up]").forEach((el) => io.observe(el));
  kill.push(() => io.disconnect());
  let sw = null;
  if (mobile()) sw = new Swiper("[data-lookbook-other]", { slidesPerView: "auto", speed: 600, loop: false, centeredSlides: false, spaceBetween: 20 });
  kill.push(() => sw?.destroy());
  return () => kill.forEach((f) => f());
});
