(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const paints = [1, 2, 3, 4, 5, 6, 7].map((n) => getComputedStyle(root).getPropertyValue(`--site-paint-${n}`).trim());
  const hero = document.querySelector(".ty-hero");
  const wwd = document.querySelector(".ty-wwd");

  document.querySelector("[data-iv] .swiper-wrapper").innerHTML = window.tySlides(window.TY_INTERVIEWS);
  window.tySwiper(document.querySelector("[data-iv]"));
  window.tySink(document.querySelector(".ty-mv"), document.querySelector(".ty-mv__content"), document.querySelector(".ty-ivwrap"));

  // Words stay as chunks, only letters are split — so Korean lines don’t break mid-word
  document.querySelectorAll(".ty-hop").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${[...w].map((c) => `<span class="c">${c}</span>`).join("")}</span>`).join(" ");
  });

  // Each letter randomly jumps 10~20% and tilts ±5° (.4s power1.out, .02s stagger), then settles with bounce.out .5s.
  // The English title flashes in one of seven colors then settles to orange, the Japanese line spot stays plain white text, and the ‹color› sentence keeps the flashed color
  const hop = (el, offset = 0) => {
    const chars = el.querySelectorAll(".c");
    const jp = el.classList.contains("ty-hero__ja");
    const keep = el.hasAttribute("data-keep");
    const final = jp ? getComputedStyle(chars[0] || el).color : getComputedStyle(root).getPropertyValue("--kf-accent").trim();
    chars.forEach((c, i) => {
      gsap.set(c, { x: 0, y: 0, xPercent: 0, yPercent: 100, rotation: 0 });
      if (!jp) c.style.color = paints[Math.floor(Math.random() * paints.length)];
      gsap.to(c, {
        xPercent: Math.random() * 10 - 5, yPercent: -(Math.random() * 10 + 10), rotation: Math.random() * 10 - 5,
        duration: 0.4, ease: "power1.out", delay: 0.02 * (i + offset),
        onComplete: () => gsap.to(c, { xPercent: 0, yPercent: 0, rotation: 0, duration: 0.5, ease: "bounce.out", ...(keep ? {} : { color: final }) }),
      });
    });
    return chars.length;
  };

  // Three scenes: play the transition video once, then switch to the loop video when it ends. .7s crossfade between scenes
  const scenes = [...hero.querySelectorAll("[data-scene]")].map((s) => ({ el: s, intro: s.querySelector("[data-intro]"), loop: s.querySelector("[data-loop]") }));
  scenes.forEach((s) => s.intro.addEventListener("ended", () => { s.intro.style.opacity = "0"; s.loop.style.opacity = "1"; s.loop.play().catch(() => {}); }));
  let state = 0;
  const go = (k) => {
    if (state === k) return;
    state = k;
    scenes.forEach((s, i) => {
      s.el.classList.toggle("-fade", i === k);
      s.el.style.zIndex = i === k ? "1" : "0";
      if (i === k) s.el.style.opacity = "1";
    });
    const s = scenes[k];
    if (k > 0) {
      s.loop.style.opacity = "0"; s.intro.style.opacity = "1";
      s.intro.currentTime = 0; s.intro.play().catch(() => {});
      scenes.slice(k + 1).forEach((o) => { o.intro.pause(); o.intro.currentTime = 0; o.loop.pause(); o.loop.currentTime = 0; });
    } else {
      scenes.slice(1).forEach((o) => { o.intro.pause(); o.intro.currentTime = 0; o.loop.pause(); o.loop.currentTime = 0; });
    }
    setTimeout(() => {
      if (state !== k) return;
      s.el.classList.remove("-fade");
      scenes.forEach((o, i) => { if (i !== k) o.el.style.opacity = "0"; });
    }, 700);
  };

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const band = (p, a, b) => clamp((p - a) / (b - a));
  const scroller = hero.querySelector("[data-sp-scroller]");
  const colorText = hero.querySelector(".ty-hero__color");
  let colorDone = false, top = 0, dist = 1;
  const measure = () => { top = hero.getBoundingClientRect().top + scrollY; dist = Math.max(1, hero.offsetHeight - innerHeight); };
  const visibleRatio = (el, clip) => {
    const r = el.getBoundingClientRect();
    let l = Math.max(r.left, 0), rt = Math.min(r.right, innerWidth), t = Math.max(r.top, 0), b = Math.min(r.bottom, innerHeight);
    if (clip) { const c = clip.getBoundingClientRect(); l = Math.max(l, c.left); rt = Math.min(rt, c.right); t = Math.max(t, c.top); b = Math.min(b, c.bottom); }
    const w = rt - l, h = b - t;
    return w <= 0 || h <= 0 ? 0 : (w * h) / Math.max(1, r.width * r.height);
  };
  const onScroll = () => {
    const p = clamp((scrollY - top) / dist), sp = innerWidth < 768;
    hero.style.setProperty("--progress", p);
    hero.style.setProperty("--side-progress", sp ? band(p, 0.5, 0.6) : Math.min(band(p, 0.3, 0.5), 1 - band(p, 0.75, 1)));
    const desc = Math.min(sp ? band(p, 0.2, 0.3) : band(p, 0.45, 0.55), sp ? 1 - band(p, 0.85, 0.9) : 1 - band(p, 0.7, 0.8));
    hero.style.setProperty("--desc-opacity", desc);
    wwd.style.setProperty("--whatwedo-opacity", band(p, 0.9, 1));
    if (sp) {
      const wrapH = scroller.parentElement.clientHeight;
      scroller.style.transform = `translate3d(0, ${-Math.max(0, scroller.scrollHeight - wrapH) * band(p, 0.1, 0.8)}px, 0)`;
    } else scroller.style.transform = "";
    if (!colorDone && desc > 0.2 && visibleRatio(colorText, sp ? colorText.closest(".ty-hero__content") : null) > 0.6) {
      colorDone = true;
      let n = 0;
      colorText.querySelectorAll(".ty-hop").forEach((el) => { n += hop(el, n); });
    }
    hero.querySelector(".ty-hero__stage").style.setProperty("--clip-progress", band(p, sp ? 0.9 : 0.75, 1));
    wwd.style.setProperty("--clip-progress", clamp((p - 0.9) / 0.1));
    if (p > (sp ? 0.9 : 0.7)) go(2); else if (p > 0.3) go(1); else if (p < 0.1) go(0);
  };
  const init = () => {
    measure();
    addEventListener("resize", () => { measure(); onScroll(); });
    new ResizeObserver(() => { measure(); onScroll(); }).observe(document.body);
    addEventListener("scroll", onScroll, { passive: true });
    hero.querySelectorAll(".-title .ty-hop").forEach((el) => hop(el));
    onScroll();
  };
  const movieStart = () => { const v = scenes[0].intro; v.play().catch(() => {}); v.addEventListener("canplay", () => { if (state === 0 && v.currentTime < v.duration) v.play().catch(() => {}); }, { once: true }); };

  // ── Loader: moves pace progress into the number, bar and character slots, and past 99 the bar goes .4s → top and bottom halves lift away over 1s ──
  const loader = document.querySelector(".ty-loader");
  const num = loader.querySelector(".ty-loader__num");
  let left = false;
  const leave = () => {
    if (left) return;
    left = true;
    const tl = gsap.timeline();
    tl.fromTo(".ty-loader__bar", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.4, ease: "power1.inOut" });
    tl.fromTo(".ty-loader__upper", { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "power2.inOut" });
    tl.fromTo(".ty-loader__lower", { clipPath: "inset(0% 0% 0% 0%)" }, {
      clipPath: "inset(100% 0% 0% 0%)", duration: 1, ease: "power2.inOut",
      onStart: movieStart,
      onComplete: () => { loader.style.display = "none"; init(); },
    }, "-=1.0");
  };
  if (reduce || !window.Pace) {
    loader.style.display = "none";
    document.querySelectorAll(".ty-hop .c").forEach((c) => { c.style.transform = "none"; });
    measure();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", () => { measure(); onScroll(); });
    scenes[0].intro.style.opacity = "0"; scenes[0].loop.style.opacity = "1";
    onScroll();
    return;
  }
  const tick = () => {
    const pr = window.Pace.bar.progress;
    loader.style.setProperty("--load-progress", pr);
    num.textContent = pr.toFixed(0);
    if (pr < 99) requestAnimationFrame(tick); else { num.textContent = "100"; leave(); }
  };
  window.Pace.on("done", leave);
  requestAnimationFrame(tick);
})();
