/* Shared by the whole site — Lottie embedding (same as the original, lottie-web 5.13 · svg rendering), theme button, cursor pixel trail, phone menu, appear on entry.
   The first page’s curtain intro is handled by index.js and emits ”tb:intro-done” when it ends, other pages emit it right away. The pixel trail, bottom strip and theme button turn on after that. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const THEME_KEY = "tb-theme";

  try {
    const saved = localStorage.getItem(THEME_KEY);
    const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) root.dataset.theme = "dark";
  } catch (e) { /* If storage is unavailable, use the light panel */ }

  const players = [];
  function mountLottie(el, opts = {}) {
    const name = el.dataset.lottie;
    const data = window.tbLottie?.[name];
    if (!data || !window.lottie) return null;
    const loop = opts.loop ?? el.dataset.loop !== "0";
    const autoplay = opts.autoplay ?? el.dataset.autoplay !== "0";
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop, autoplay, animationData: JSON.parse(JSON.stringify(data)) });
    const hoverSpeed = el.dataset.hover === "speed";
    if (!autoplay) anim.goToAndStop(0, true);
    anim.setSpeed(hoverSpeed ? 0.5 : Number(el.dataset.speed || 1));
    if (hoverSpeed) {
      el.addEventListener("mouseenter", () => anim.setSpeed(2));
      el.addEventListener("mouseleave", () => anim.setSpeed(0.5));
    }
    players.push(anim);
    return anim;
  }
  window.tbSite = { mountLottie };

  function themeButton() {
    const btn = document.querySelector(".tb-theme button");
    btn?.addEventListener("click", () => {
      const dark = root.dataset.theme !== "dark";
      if (dark) root.dataset.theme = "dark"; else delete root.dataset.theme;
      try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch (e) { /* Even if saving fails, the current screen still changes */ }
    });
  }

  function pixelTrail(reduce) {
    const box = document.querySelector(".tb-pixels");
    const cv = box?.querySelector("canvas");
    if (!cv) return () => {};
    const ctx = cv.getContext("2d");
    const SIZE = 10, FADE = 500;
    const cells = new Map();
    let raf = 0, on = false, W = 0, H = 0;
    const fit = () => { W = box.offsetWidth; H = box.offsetHeight; cv.width = W; cv.height = H; cv.style.width = `${W}px`; cv.style.height = `${H}px`; };
    const colorOf = () => getComputedStyle(body).getPropertyValue(document.querySelector(".tb-menu.is-open") ? "--kf-bg" : "--kf-accent").trim();
    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = colorOf();
      cells.forEach((c, k) => {
        const age = now - c.t;
        if (age >= FADE) { cells.delete(k); return; }
        ctx.globalAlpha = 1 - age / FADE;
        ctx.fillRect(c.x * SIZE, c.y * SIZE, SIZE, SIZE);
      });
      ctx.globalAlpha = 1;
      raf = cells.size ? requestAnimationFrame(draw) : 0;
    };
    const move = (e) => {
      if (!on) return;
      const x = Math.floor(e.clientX / SIZE), y = Math.floor(e.clientY / SIZE);
      if (x < 0 || y < 0 || x >= Math.ceil(W / SIZE) || y >= Math.ceil(H / SIZE)) return;
      cells.set(`${x}-${y}`, { x, y, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(draw);
    };
    fit();
    new ResizeObserver(fit).observe(box);
    if (!reduce && matchMedia("(pointer: fine)").matches) addEventListener("mousemove", move);
    return () => { on = true; };
  }

  function mobileMenu() {
    const wrap = document.querySelector(".tb-menu-btn");
    const btn = wrap?.querySelector("button");
    const menu = document.querySelector(".tb-menu");
    if (!btn || !menu) return;
    const label = btn.querySelector("span");
    const set = (open) => {
      menu.classList.toggle("is-open", open);
      wrap.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      menu.inert = !open;
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      body.style.overflow = open ? "hidden" : "";
      if (label) {
        label.style.transition = "opacity .2s cubic-bezier(.87,0,.13,1)";
        label.style.opacity = "0";
        setTimeout(() => { label.textContent = open ? "Close" : "Menu"; label.style.opacity = "1"; }, 200);
      }
    };
    btn.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) { set(false); btn.focus(); } });
    addEventListener("resize", () => { if (innerWidth >= 800 && menu.classList.contains("is-open")) set(false); });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  // The panel’s inner cells appear .05s later each at .4s — once when entering the screen (original variants aJ·Rl)
  function enter(reduce) {
    const groups = [...document.querySelectorAll(".tb-enter")];
    // Delay counts only visible cells — so cells hidden at some widths (phone-only header, etc.) don’t shift the order
    groups.forEach((g) => [...g.children].filter((c) => c.offsetParent !== null).forEach((c, i) => { c.style.transitionDelay = `${i * 0.05}s`; }));
    if (reduce) { groups.forEach((g) => g.classList.add("is-in")); return; }
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { io.unobserve(x.target); x.target.classList.add("is-in"); } }));
    groups.forEach((g) => io.observe(g));
  }

  function start(reduce) {
    themeButton();
    mobileMenu();
    const arm = pixelTrail(reduce);
    document.querySelectorAll("[data-lottie]:not([data-lottie-manual])").forEach((el) => mountLottie(el));
    const reveal = () => {
      arm();
      document.querySelectorAll(".tb-after-intro").forEach((el) => {
        el.style.transition = reduce ? "none" : "opacity .3s cubic-bezier(.4,0,.2,1)";
        el.style.opacity = "1";
      });
      enter(reduce);
    };
    if (body.dataset.intro === "home") addEventListener("tb:intro-done", reveal, { once: true });
    else {
      // As in the original state (hasIntroFinishedAnimating), if another page was opened first, returning to the first page skips the intro
      try { sessionStorage.setItem("tb-intro-seen", "1"); } catch (e) { /* If it can’t be saved, the home page shows the intro every time */ }
      reveal();
    }
  }

  const mm = gsap.matchMedia();
  let begun = false;
  mm.add({ calm: "(prefers-reduced-motion: reduce)", move: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (begun) return;
    begun = true;
    start(!!ctx.conditions.calm);
  });
})();
