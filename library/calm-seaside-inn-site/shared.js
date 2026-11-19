// Motion shared by all pages — the original used jQuery·jquery.inview·CSS transitions, so to keep timing on the same values it leaves CSS transitions as they are and only adds classes.
// jQuery’s animate(…, 'easeInOutQuad') is the same curve as GSAP power1.inOut.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  // Add is-show once as soon as any part enters the screen (same timing as jquery.inview)
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-show");
    io.unobserve(e.target);
  }));
  const watch = () => $$(".t-inview:not(.is-show)").forEach((el) => io.observe(el));

  // Title one character at a time — the i-th character is delayed by i×0.1s (the original counts spaces in the order too)
  $$(".t-chars").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    el.setAttribute("aria-label", text);
    // The original title (Japanese) has no spaces, so only the characters are laid out with flex — Korean must group words into chunks to keep the spaces and avoid breaking mid-word
    let word = null;
    [...text].forEach((ch, i) => {
      if (ch === " ") { word = null; return; }
      if (!word) { word = document.createElement("span"); word.className = "t-word"; word.setAttribute("aria-hidden", "true"); el.append(word); }
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.animationDelay = `${i / 10}s`;
      word.append(s);
    });
  });
  const chars = () => {
    const y = scrollY, h = innerHeight;
    $$(".t-chars:not(.appeartext)").forEach((el) => {
      if (y >= el.getBoundingClientRect().top + y - 50 - h) el.classList.add("appeartext");
    });
  };

  // Dot on the right vertical line — scrolled ratio × 93%
  const dot = $(".t-progress span");
  const progress = () => {
    if (!dot) return;
    const max = document.body.clientHeight - innerHeight;
    dot.style.top = `${max > 0 ? (scrollY / max) * 93 : 0}%`;
  };

  // Scrolling down more than one screen hides the note beside the header line (original .credit.hide)
  const credit = $$("[data-hide-after-fv]");
  const onScroll = () => {
    chars();
    progress();
    credit.forEach((c) => c.classList.toggle("hide", scrollY > innerHeight));
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", progress);

  // Hero cover — once loaded, the cover and logo get is-show (logo 1s late for 1s, cover 5s late for 1s), and scroll is locked for 5 seconds
  const intro = $(".t-intro");
  const start = () => {
    watch();
    onScroll();
    if (intro) {
      intro.classList.add("is-show");
      $(".t-intro__logo", intro)?.classList.add("is-show");
      if (!reduce) {
        document.body.classList.add("hidden");
        setTimeout(() => document.body.classList.remove("hidden"), 5000);
      }
    }
  };
  if (document.readyState === "complete") start();
  else addEventListener("load", start);

  // Menu drawer
  const btn = $(".t-menu-btn");
  const nav = $(".t-nav");
  btn?.addEventListener("click", () => {
    const open = !btn.classList.contains("active");
    btn.classList.toggle("active", open);
    nav?.classList.toggle("active", open);
    btn.setAttribute("aria-expanded", String(open));
    nav?.setAttribute("aria-hidden", String(!open));
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && btn?.classList.contains("active")) btn.click();
  });
  // As a div button like the original, Enter and Space also count as a press
  $$('[role="button"]').forEach((b) => b.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    b.click();
  }));

  // In-page navigation — 0.8s, stops 30px above
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const t = id.length > 1 ? $(id) : null;
      e.preventDefault();
      const y = t ? t.getBoundingClientRect().top + scrollY - 30 : 0;
      gsap.to(window, { scrollTo: y, duration: reduce ? 0 : 0.8, ease: "power1.inOut", overwrite: true });
    })
  );
  $(".t-go-up")?.addEventListener("click", () => gsap.to(window, { scrollTo: 0, duration: reduce ? 0 : 0.8, ease: "power1.inOut", overwrite: true }));

  // Q&A — click to open the answer
  $$(".t-qa dl").forEach((dl) => dl.addEventListener("click", () => dl.classList.toggle("active")));

  // Light laid behind — 150 big circles drift in noise colors, appearing and vanishing. The original applies opacity .1 · blur 25px to the whole canvas to tint the background slightly.
  // Colors are read from the skin — the background is --kf-contrast-bg, and the circles deviate from the hue of --kf-accent by noise (±60°)
  const host = $(".t-canvas");
  if (host && !reduce) {
    const cv = document.createElement("canvas");
    const ctx = cv.getContext("2d");
    host.append(cv);
    const css = getComputedStyle(document.documentElement);
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgbOf = (v) => { probe.fillStyle = "#000"; probe.fillStyle = v; probe.fillRect(0, 0, 1, 1); return [...probe.getImageData(0, 0, 1, 1).data.slice(0, 3)]; }; // Not skin: value cleared before reading
    const hueOf = ([r, g, b]) => {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      if (!d) return 0;
      const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return (h * 60 + 360) % 360;
    };
    const back = rgbOf(css.getPropertyValue("--kf-contrast-bg").trim());
    const base = hueOf(rgbOf(css.getPropertyValue("--kf-accent").trim()));
    // Simple value noise (grid random + smooth interpolation) — only the original simplex’s ”nearby circles get similar colors” needs to hold
    const grid = new Map();
    const at = (x, y, z) => { const k = `${x},${y},${z}`; if (!grid.has(k)) grid.set(k, Math.random() * 2 - 1); return grid.get(k); };
    const sm = (t) => t * t * (3 - 2 * t);
    const noise = (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), u = sm(x - xi), v = sm(y - yi), w = sm(z - zi);
      const l = (a, b, t) => a + (b - a) * t;
      const c = (dz) => l(l(at(xi, yi, zi + dz), at(xi + 1, yi, zi + dz), u), l(at(xi, yi + 1, zi + dz), at(xi + 1, yi + 1, zi + dz), u), v);
      return l(c(0), c(1), w);
    };
    const N = 150, OFF = 0.0015;
    let drift = 0;
    const circles = [];
    const born = (c) => {
      c.x = Math.random() * cv.width; c.y = Math.random() * cv.height;
      const t = Math.random() * Math.PI * 2, sp = 0.1 + Math.random();
      c.vx = sp * Math.cos(t); c.vy = sp * Math.sin(t);
      c.life = 0; c.ttl = 150 + Math.random() * 200; c.r = 100 + Math.random() * 200;
      c.h = base + drift + noise(c.x * OFF, c.y * OFF, (220 + drift) * OFF) * 60;
      return c;
    };
    const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
    size();
    addEventListener("resize", size);
    for (let i = 0; i < N; i++) circles.push(born({}));
    const fadeInOut = (t, m) => { const hm = 0.5 * m; return Math.abs(((t + hm) % m) - hm) / hm; };
    const draw = () => {
      ctx.fillStyle = `rgb(${back.join(",")})`;
      ctx.fillRect(0, 0, cv.width, cv.height);
      drift++;
      for (const c of circles) {
        ctx.fillStyle = `hsla(${c.h % 360},60%,30%,${fadeInOut(c.life, c.ttl)})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
        c.x += c.vx; c.y += c.vy; c.life++;
        if (c.x < -c.r || c.x > cv.width + c.r || c.y < -c.r || c.y > cv.height + c.r || c.life > c.ttl) born(c);
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  if (!window.Swiper) return;
  // Photo crossfade — Hero every 5s taking 2s, map via data-delay · data-speed (original first page 8s · 1.5s, sub pages 3s · 2s)
  $$(".t-fade-slider").forEach((box) => {
    const delay = +(box.dataset.delay || 5000), speed = +(box.dataset.speed || 2000);
    const dots = $(".swiper-pagination", box.parentElement);
    new Swiper($(".swiper-container", box) || box, {
      loop: true,
      speed,
      effect: "fade",
      fadeEffect: { crossFade: true },
      autoplay: reduce ? false : { delay, disableOnInteraction: false, stopOnLastSlide: false },
      ...(dots && { pagination: { el: dots, clickable: true } }),
    });
  });
})();
