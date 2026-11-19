// Motion shared by all pages: Lenis (original build 1.0.19, rAF with no options), phone menu, anchor scroll, year-ruler loader, big title letter shuffle, rise on entering the screen, sticker tilt swap.
// The hero sequence after the loader ends (3D logo, stickers, header) differs per page, so it is chained onto the same timeline with tSite.afterLoader(fn).
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const hooks = [];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Canvas and WebGL can’t read var() — skin variables are painted on a hidden element to get the computed color, then resolved to rgb with a 1px canvas (oklch relative colors resolve too)
  const probe = document.createElement("i");
  probe.hidden = true;
  document.documentElement.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const color = (v) => {
    probe.style.color = `var(${v})`;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const font = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  window.tSite = { reduced, color, font, afterLoader: (fn) => hooks.push(fn) };

  const mm = gsap.matchMedia();
  // Run new Lenis() on our own rAF like the original (1.0.19 defaults to lerp 0.1 in scrollTo). The npm build exposes the global as lowercase lenis, so check both
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const LenisClass = window.Lenis || window.lenis;
    const lenis = (window.tLenis = new LenisClass());
    let id = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      window.tLenis = null;
    };
  });

  // Phone menu: three lines become an X, the Menu text becomes Back. Pressing a link in the menu closes it and navigates
  const burger = document.querySelector(".t-head__burger");
  const navi = document.querySelector(".t-head__navi");
  if (burger && navi) {
    const setOpen = (open) => {
      burger.classList.toggle("is-active", open);
      navi.classList.toggle("is-active", open);
      burger.setAttribute("aria-expanded", String(open));
    };
    burger.addEventListener("click", () => setOpen(!navi.classList.contains("is-active")));
    navi.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  // The original subtracts the header element height (0, since everything inside is absolute) so it lands exactly on the section top
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.tLenis) window.tLenis.scrollTo(target);
      else target.scrollIntoView();
    });
  });

  // Loader: the year counts up over 2 seconds with circ.inOut while moving from the left end to the right end of the ruler with power2.inOut, and the plate clears in 0.8 seconds.
  // The center logo loops a 3.05s Lottie from the start with lottie-web like the original (the artwork is ours — logo-anime.js)
  const fv = document.querySelector(".t-fv");
  const intro = gsap.timeline({ paused: true });
  if (fv && !reduced) {
    const time = fv.querySelector(".t-fv__time");
    const counter = { value: Number(time.dataset.from) };
    intro
      .to(counter, {
        value: Number(time.dataset.to),
        duration: 2,
        ease: "circ.inOut",
        roundProps: "value",
        onUpdate: () => { time.textContent = counter.value; },
      })
      .to(time, { left: "100%", xPercent: -100, duration: 2, ease: "power2.inOut" }, "<")
      .to(fv, { opacity: 0, duration: 0.8, ease: "power1.in", display: "none" });

    const logo = lottie.loadAnimation({ container: fv.querySelector(".t-fv__logo"), renderer: "svg", loop: true, autoplay: true, animationData: window.tLogoAnime });
    intro.eventCallback("onComplete", () => logo.destroy());
  } else if (fv) {
    fv.remove();
  }

  addEventListener("load", () => {
    hooks.forEach((fn) => fn(intro, reduced));
    if (reduced) { intro.progress(1); return; }
    intro.play();
    setTimeout(() => scrollTo({ top: 0, behavior: "smooth" }), 500);
  });

  // Big title: on entry the letters scramble through ABSDabsd0-9 for 0.5s, then settle into place from the front
  const POOL = "ABSDabsd0123456789";
  const shuffle = (el, duration = 500) => {
    const html = el.innerHTML;
    const text = el.textContent.trim();
    const t0 = performance.now();
    const step = (now) => {
      const p = (now - t0) / duration;
      if (p >= 1) { el.innerHTML = html; return; }
      el.textContent = [...text].map((c) => (c === " " || Math.random() <= p ? c : POOL[(Math.random() * POOL.length) | 0])).join("");
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const seen = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      if (en.target.matches(".t-ttl")) { if (!reduced) shuffle(en.target); }
      else en.target.classList.add("is-show");
      seen.unobserve(en.target);
    });
  }, { threshold: 0 });
  document.querySelectorAll(".t-ttl, .t-in, .t-in-kids").forEach((el) => seen.observe(el));

  // Sticker tilt flips to the opposite every 1.5 seconds — like the original, it starts already flipped once.
  const flips = document.querySelectorAll("[data-flip]");
  flips.forEach((el) => el.classList.add("is-flip"));
  if (!reduced) setInterval(() => flips.forEach((el) => el.classList.toggle("is-flip")), 1500);
})();
