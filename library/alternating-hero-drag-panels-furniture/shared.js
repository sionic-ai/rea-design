// Motion shared across the site — first loader (bar, wordmark reveal), header bar hide/return, ABOUT dropdown, search field, phone drawer,
// Anchor 600ms scroll, turn on when visible (.obs), horizontal panel drag (inertia .9), DRAG cursor
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPC = () => innerWidth > 780;
  const header = document.querySelector(".sg-header");

  // First loader — the bar fills 1% every 30ms up to 70%, then once 80% of the images are loaded, 1% every 20ms up to 100%. When full, the wordmark is revealed over .6s and after 1.1s clears away over .8s
  const loading = document.querySelector(".sg-loading");
  if (loading) {
    const bar = loading.querySelector(".sg-loading__bar"), mark = loading.querySelector(".sg-loading__mark");
    const imgs = [...document.images];
    let a = 0, done = 0, r = imgs.length ? 0 : 100, second = false, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const spin = loading.querySelector(".sg-loading__spin");
      if (spin) spin.style.display = "none";
      mark.style.transition = "clip-path 0.6s ease";
      mark.style.clipPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
      document.dispatchEvent(new CustomEvent("loading:finished"));
      window.sgLoaded = true;
      setTimeout(() => {
        loading.style.transition = "opacity 0.8s ease";
        loading.style.opacity = "0";
        setTimeout(() => { loading.style.display = "none"; }, 800);
      }, 1100);
    };
    const paint = () => {
      bar.style.transform = `scaleX(${(a < 70 ? a : Math.max(a, r)) / 100})`;
      if (a >= 100 && r >= 100) finish();
      if (a === 70 && r >= 80 && !second) {
        second = true;
        const t2 = setInterval(() => { a += 1; if (a >= 100) { a = 100; clearInterval(t2); } paint(); }, 20);
      }
    };
    if (reduce) { a = 100; r = 100; bar.style.transform = "scaleX(1)"; loading.style.display = "none"; window.sgLoaded = true; document.dispatchEvent(new CustomEvent("loading:finished")); }
    else {
      const t1 = setInterval(() => { a += 1; if (a >= 70) { a = 70; clearInterval(t1); } paint(); }, 30);
      imgs.forEach((im) => {
        const one = () => { done++; r = (done / imgs.length) * 100; paint(); };
        if (im.complete) one(); else { im.addEventListener("load", one); im.addEventListener("error", one); }
      });
    }
  } else window.sgLoaded = true;

  // Header line — within 10px it stays in place with a transparent background, scrolling down hides it upward, scrolling up brings it back with a white background
  let lastY = scrollY, menuOpen = false;
  addEventListener("scroll", () => {
    if (!header || menuOpen) return;
    const y = scrollY;
    if (y <= 10) { header.style.transform = "translateY(0)"; header.classList.remove("is-show"); }
    else if (y > lastY) header.style.transform = "translateY(-100%)";
    else { header.style.transform = "translateY(0)"; header.classList.add("is-show"); }
    lastY = y;
  }, { passive: true });

  if (header) {
    const sub = header.querySelector(".sg-nav__sub"), panel = document.querySelector(header.querySelector(".sg-nav__sub")?.dataset.target || "#none");
    const close = () => { header.classList.remove("is-open"); panel?.classList.remove("is-open"); };
    if (sub && panel) {
      // Original opens on hover and leaves press as is — so it also opens by keyboard (focus·Enter), press only handles Open
      const open = () => { if (!isPC()) return; header.classList.add("is-open"); panel.classList.add("is-open"); };
      sub.addEventListener("mouseenter", open);
      sub.addEventListener("click", open);
      sub.addEventListener("focus", open);
      header.addEventListener("mouseleave", () => { if (isPC()) close(); });
      header.querySelectorAll("a").forEach((a) => a.addEventListener("mouseenter", () => { if (isPC() && !panel.contains(a)) close(); }));
    }
    const btn = header.querySelector(".sg-menu-btn");
    btn?.addEventListener("click", () => {
      header.classList.toggle("is-open");
      btn.classList.toggle("is-active");
      menuOpen = header.classList.contains("is-open");
      btn.setAttribute("aria-expanded", String(menuOpen));
      document.body.style.overflow = menuOpen ? "hidden" : "auto";
      if (menuOpen) header.style.transform = "translateY(0)";
    });
    addEventListener("resize", () => {
      if (isPC() && menuOpen) { menuOpen = false; header.classList.remove("is-open"); btn?.classList.remove("is-active"); document.body.style.overflow = "auto"; }
    });
    const form = header.querySelector(".sg-search");
    header.querySelector(".sg-search__icon")?.addEventListener("click", () => {
      form.classList.toggle("is-active");
      if (form.classList.contains("is-active")) form.querySelector("input")?.focus();
    });
    header.querySelector(".sg-search__close")?.addEventListener("click", () => form.classList.remove("is-active"));
  }

  // Anchor — 600ms easeOutCubic
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const from = scrollY, dist = t.getBoundingClientRect().top + scrollY - from, t0 = performance.now();
    const step = (now) => { const p = Math.min((now - t0) / 600, 1); scrollTo(0, from + dist * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    if (reduce) scrollTo(0, from + dist); else requestAnimationFrame(step);
  });

  // Show on view — is-show when half (data-threshold) is visible
  const watch = () => document.querySelectorAll(".obs").forEach((el) => {
    if (reduce) { el.classList.add("is-show"); return; }
    new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) en.target.classList.add("is-show"); }), { threshold: parseFloat(el.dataset.threshold) || 0.5 }).observe(el);
  });

  // Horizontal panel drag — on release the last velocity (-0.2 × dragged distance) slides, shrinking by 0.9× each frame. Dragging over 3px ignores the link press
  const drags = () => document.querySelectorAll(".sg-drag").forEach((el) => {
    let down = false, sx = 0, sl = 0, v = 0, raf = 0, moved = false;
    const glide = () => { el.scrollLeft += v; v *= 0.9; raf = Math.abs(v) > 0.5 ? requestAnimationFrame(glide) : 0; };
    el.addEventListener("mousedown", (e) => { down = true; moved = false; sx = e.pageX; sl = el.scrollLeft; el.classList.add("is-dragging"); cancelAnimationFrame(raf); });
    el.addEventListener("mousemove", (e) => { if (!down) return; e.preventDefault(); const dx = e.pageX - sx; if (Math.abs(dx) > 3) moved = true; el.scrollLeft = sl - dx; v = -0.2 * dx; });
    const up = () => { if (!down) return; down = false; el.classList.remove("is-dragging"); if (!reduce) raf = requestAnimationFrame(glide); };
    el.addEventListener("mouseup", up);
    el.addEventListener("mouseleave", up);
    el.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }));
  });

  // DRAG cursor — on only when inside a panel and overflowing horizontally (off over links·buttons, .force-cursor turns it on)
  const cursors = () => document.querySelectorAll("[data-drag-cursor]").forEach((el) => {
    const c = document.createElement("div");
    c.className = "sg-cursor";
    c.textContent = "DRAG";
    c.setAttribute("aria-hidden", "true");
    document.body.appendChild(c);
    let mx = -200, my = -200;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    const over = () => el.scrollWidth > el.clientWidth;
    const tick = () => {
      c.style.left = `${mx}px`;
      c.style.top = `${my}px`;
      const r = el.getBoundingClientRect();
      const inside = mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
      const hit = document.elementFromPoint(mx, my);
      const onLink = hit && hit.closest("button, a, .no-cursor") && !hit.closest(".force-cursor");
      const on = inside && over() && !onLink && isPC();
      c.classList.toggle("active", on);
      el.style.cursor = on ? "none" : "auto";
      requestAnimationFrame(tick);
    };
    tick();
    el.addEventListener("mousedown", () => { if (over()) c.classList.add("is-dragging"); });
    document.addEventListener("mouseup", () => c.classList.remove("is-dragging"));
  });

  const boot = () => { watch(); drags(); cursors(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
