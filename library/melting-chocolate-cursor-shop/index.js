// First page only — feature words (picked by hover·press + bounce), photos floating after the mouse, a frame that grows on scroll
(() => {
  const TB = window.TB;
  if (!TB) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // Features: the chosen word turns lime green and its photo and card light up. Photo and card bounce with a 1s squash in sequence (0·10·20ms) on each hover
  TB.use((root) => {
    const rows = [...root.querySelectorAll("[data-char]")];
    if (!rows.length) return;
    const timers = new Set();
    const pick = (row) => rows.forEach((r) => r.classList.toggle("is-current", r === row));
    const bounce = (row) => {
      if (reduce.matches) return;
      [...row.querySelectorAll("[data-bounce]")].forEach((el, i) => {
        const go = () => { el.classList.remove("tb-pop"); void el.offsetWidth; el.classList.add("tb-pop"); };
        const d = (i % 3) * 10;
        if (d) { const t = setTimeout(go, d); timers.add(t); } else go();
        const t2 = setTimeout(() => el.classList.remove("tb-pop"), 1000 + d);
        timers.add(t2);
      });
    };
    const offs = rows.map((row) => {
      const h = row.querySelector(".tb-h1");
      const on = () => { pick(row); bounce(row); };
      h.addEventListener("mouseover", on);
      h.addEventListener("click", on);
      return () => { h.removeEventListener("mouseover", on); h.removeEventListener("click", on); };
    });
    return () => { offs.forEach((f) => f()); timers.forEach(clearTimeout); };
  });

  // Floating photos: the distance from photo center to mouse is converted to a % of screen size (max ±50px) and chased at .02 per frame (original floating · factor .8)
  TB.use((root) => {
    if (!matchMedia("(hover: hover)").matches || reduce.matches) return;
    const els = [...root.querySelectorAll("[data-tb-float]")];
    if (!els.length) return;
    const m = { x: innerWidth / 2, y: innerHeight / 2 };
    const st = els.map((el) => ({ el, x: 0, y: 0 }));
    const move = (e) => { m.x = e.clientX; m.y = e.clientY; };
    const tick = () => {
      const k = 1 - (1 - 0.02) ** gsap.ticker.deltaRatio();
      st.forEach((s) => {
        if (!s.el.offsetParent) return;
        const r = s.el.getBoundingClientRect();
        const tx = ((m.x - (r.left + r.width / 2)) / innerWidth) * 100, ty = ((m.y - (r.top + r.height / 2)) / innerHeight) * 100;
        s.x = Math.round((s.x + (tx - s.x) * k) * 100) / 100;
        s.y = Math.round((s.y + (ty - s.y) * k) * 100) / 100;
        s.el.style.transform = `translate(${s.x}px, ${s.y}px)`;
      });
    };
    addEventListener("mousemove", move);
    gsap.ticker.add(tick);
    return () => { removeEventListener("mousemove", move); gsap.ticker.remove(tick); st.forEach((s) => (s.el.style.transform = "")); };
  });

  // Scroll frame: while pinned to the screen for 1600px, the back photo blurs (--progress power1.inOut), and the frame turns on from 12px blur and transparent, filling the screen,
  // The inner photo is screen-sized, and from the 84% point the frame’s --progress fills up so the title, text and button turn on in turn (phone 1000px)
  TB.use((root) => {
    const sec = root.querySelector("[data-tb-si]");
    if (!sec || reduce.matches) return;
    const frame = sec.querySelector("[data-si-frame]"), img = sec.querySelector("[data-si-img]"), bg = sec.querySelector(".tb-si__bg");
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 900px)", narrow: "(max-width: 899px)" }, (c) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: c.conditions.narrow ? "+=1000" : "+=1600", scrub: true, pin: true, anticipatePin: 1 } });
      tl.to(bg, { "--progress": 1, ease: "power1.inOut" }, 0)
        .from(frame, { opacity: 0, filter: "blur(12px)", ease: "power1.inOut" }, 0)
        .to(frame, { width: "100%", height: "100%", ease: "power1.inOut" }, 0)
        .to(img, { width: "100vw", height: c.conditions.narrow ? "100lvh" : "100svh", ease: "power1.inOut" }, 0)
        .to(frame, { "--progress": 1, ease: "power1.out" }, 0.84);
    });
    return () => mm.revert();
  });
})();
