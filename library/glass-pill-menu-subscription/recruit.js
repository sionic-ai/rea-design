// Careers — text rising out of blur, first photo parallax, sticky inner menu, show more teams, flipping through office photos
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Rising from blur: first-screen text right away in .85s, per section the text block when 18% visible, each .08s later, .62s ----
  const rise = (nodes, ms, stagger) => nodes.forEach((n, i) => {
    const t = `${ms}ms cubic-bezier(.22,1,.36,1) ${i * stagger}ms`;
    n.style.transition = `opacity ${t}, transform ${t}, filter ${t}`;
    n.style.opacity = "1";
    n.style.transform = "none";
    n.style.filter = "blur(0)";
  });
  const hide = (nodes) => nodes.forEach((n) => {
    n.style.opacity = "0";
    n.style.transform = "translateY(24px)";
    n.style.filter = "blur(5px)";
  });
  if (!reduce) {
    const hero = [...document.querySelectorAll(".r-hero__text > *")];
    hide(hero);
    requestAnimationFrame(() => requestAnimationFrame(() => rise(hero, 850, 0)));
    document.querySelectorAll("[data-row]").forEach((row) => {
      const nodes = [...row.children];
      hide(nodes);
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        rise(nodes, 620, 80);
      }, { threshold: 0.18 });
      io.observe(row);
    });
  }

  // ---- First photo parallax: scaled to 1.08x for slack, and shifted within itself as the photo passes the screen (catch-up .1) ----
  const media = document.querySelector(".r-hero__media");
  if (media && !reduce && !matchMedia("(max-width: 767px)").matches) {
    const img = media.querySelector(".r-hero__img");
    const SCALE = 1.08;
    let current = 0;
    const room = () => (media.offsetHeight * (SCALE - 1)) / 2;
    gsap.ticker.add(() => {
      const r = media.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
      const target = (0.5 - p) * 2 * room();
      current += (target - current) * 0.1;
      img.style.transform = `translate3d(0, ${current.toFixed(2)}px, 0) scale(${SCALE})`;
    });
  }

  // ---- Inner menu: when stuck it covers up to the top band, and underlines the current section name ----
  const bar = document.getElementById("r-secnav");
  if (bar) {
    const links = [...bar.querySelectorAll(".r-secnav__link")];
    const line = bar.querySelector(".r-secnav__bar");
    const secs = links.map((a) => document.querySelector(a.getAttribute("href")));
    const LANDING_GAP = 24;
    const hero = document.querySelector(".r-hero");
    const place = (a) => {
      line.style.width = a.offsetWidth + "px";
      line.style.transform = `translateX(${a.offsetLeft}px)`;
    };
    let active = -1;
    const update = () => {
      bar.classList.toggle("is-stuck", bar.getBoundingClientRect().top <= 0.5 && scrollY > 10);
      const edge = bar.getBoundingClientRect().bottom + LANDING_GAP + 1;
      let idx = 0;
      secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= edge) idx = i; });
      if (idx === active) return;
      active = idx;
      links.forEach((a, i) => a.classList.toggle("is-active", i === idx));
      place(links[idx]);
    };
    links.forEach((a, i) => a.addEventListener("click", (e) => {
      e.preventDefault();
      // Since this panel is about to stick, on press it switches to the stuck height and measures the landing spot at that height — once rolling starts, it is released again until it reaches the top
      bar.classList.add("is-stuck");
      const pinAt = hero.getBoundingClientRect().bottom + scrollY + 1;
      const y = Math.max(pinAt, secs[i].getBoundingClientRect().top + scrollY - bar.offsetHeight - LANDING_GAP);
      // As in the original, roll on the very next frame, and fit the length so the moment the panel reaches the top is .07~.14s depending on the distance ratio (cubic ease-out)
      const barGap = Math.max(0, bar.getBoundingClientRect().top);
      requestAnimationFrame(() => {
        const from = scrollY, dist = y - from, t0 = performance.now();
        const f = dist > 0 ? Math.min(1, barGap / dist) : 1;
        const reach = 1 - Math.cbrt(1 - f);
        const T = Math.min(1200, (70 + 70 * f) / Math.max(reach, 0.01));
        const step = (now) => {
          const p = reduce ? 1 : Math.min(1, (now - t0) / T);
          scrollTo(0, from + dist * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        step(t0);
      });
    }));
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", () => { active = -1; update(); });
    update();
  }

  // ---- Show more team ----
  const team = document.getElementById("r-team");
  const more = document.querySelector(".r-more");
  if (team && more) more.addEventListener("click", () => team.classList.add("is-expanded"));

  // ---- Office photo: it flips the moment the drag passes 15% of the plate width, and if it falls short it follows halfway then returns. Horizontal wheel and arrow keys too ----
  const gal = document.getElementById("r-gallery");
  if (gal) {
    const vp = gal.querySelector(".r-gallery__viewport");
    const track = gal.querySelector(".r-gallery__track");
    const bars = [...gal.querySelectorAll(".r-gallery__bar")];
    const count = gal.querySelector(".r-gallery__count");
    const n = track.children.length;
    let i = 0;
    const go = (k) => {
      i = Math.max(0, Math.min(n - 1, k));
      track.classList.remove("is-dragging");
      track.style.transform = `translateX(${-i * 100}%)`;
      bars.forEach((b, j) => b.classList.toggle("is-active", j === i));
      count.textContent = `${i + 1} / ${n}`;
    };
    bars.forEach((b, j) => b.addEventListener("click", () => go(j)));
    vp.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    });
    let wheelLock = false;
    vp.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      go(i + (e.deltaX > 0 ? 1 : -1));
      setTimeout(() => (wheelLock = false), 220);
    }, { passive: false });
    let pid = null, sx = 0, dx = 0, done = false;
    vp.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      pid = e.pointerId; sx = e.clientX; dx = 0; done = false;
      vp.setPointerCapture(pid);
      vp.classList.add("is-dragging");
      track.classList.add("is-dragging");
    });
    vp.addEventListener("pointermove", (e) => {
      if (e.pointerId !== pid || done) return;
      dx = e.clientX - sx;
      const threshold = vp.clientWidth * 0.15;
      if (dx <= -threshold || dx >= threshold) {
        done = true;
        vp.classList.remove("is-dragging");
        go(i + (dx < 0 ? 1 : -1));
        return;
      }
      track.style.transform = `translateX(calc(${-i * 100}% + ${dx * 0.5}px))`;
    });
    const end = (e) => {
      if (e.pointerId !== pid) return;
      pid = null;
      vp.classList.remove("is-dragging");
      if (!done) go(i);
    };
    vp.addEventListener("pointerup", end);
    vp.addEventListener("pointercancel", end);
    let tx = 0;
    vp.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener("touchend", (e) => {
      const d = e.changedTouches[0].clientX - tx;
      if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1));
    });
    go(0);
  }
})();
