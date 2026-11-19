// Home — first-visit loader → logo and copy entrance → stage layers enter, parallax-js stage, four Splides (Hero fade, photo strip, department cards, video), handwriting.
// Values from the original page-home.js: MIN_WAIT 4000 · logo 1.8s expo.inOut (phone 2.2) · color .06s · copy 1s power2.out .06 stagger · slogan 1.2s power2.out.
(() => {
  const body = document.body;
  const KEY = "ky-opening-viewed";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = matchMedia("(max-width: 800px)").matches;
  let first = true;
  try { first = !sessionStorage.getItem(KEY); } catch (e) { first = true; }
  if (reduce) first = false;
  if (first) body.classList.add("is-first");
  const markViewed = () => { try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* Even if saving fails, it just shows again next time */ } };

  // Stage art: fill in village roofs and a child on a bicycle (line art)
  const town = document.getElementById("ky-town");
  if (town) {
    let s = 7;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let html = "";
    [[300, 640, 700], [900, 1320, 690]].forEach(([a, b, base]) => {
      for (let x = a; x < b; x += 11 + rnd() * 6) {
        const w = 9 + rnd() * 8, h = 9 + rnd() * 16, y = base - Math.sin((x - a) / (b - a) * Math.PI) * 60 - h;
        html += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}"/><path d="M${x.toFixed(0)} ${y.toFixed(0)}l${(w / 2).toFixed(0)} -10l${(w / 2).toFixed(0)} 10"/>`;
      }
    });
    html += '<path d="M470 600v-70m-10 20h20M1180 590v-60"/>';
    town.innerHTML = html;
  }
  const rider = document.getElementById("ky-rider");
  if (rider && window.kyCyclist) {
    rider.innerHTML = window.kyCyclist();
    const svg = rider.firstElementChild;
    if (svg) { svg.setAttribute("width", "120"); svg.setAttribute("height", "150"); svg.style.color = "var(--site-pencil)"; }
  }
  const heroMark = document.querySelector(".ky-hero__logo .ky-mark");
  const markSrc = document.querySelector(".ky-header__logo .ky-mark svg");
  if (heroMark && markSrc) heroMark.innerHTML = markSrc.outerHTML;

  // Split the copy into letter cells (the original uses a path per letter)
  const copy = document.querySelector(".ky-hero__main");
  if (copy) copy.innerHTML = [...copy.textContent].map((c) => `<span class="ch" aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");

  // Splide
  const S = window.Splide, X = (window.splide && window.splide.Extensions) || {};
  let heroSplide = null;
  const heroSlide = () => {
    if (heroSplide || !S) return heroSplide;
    const el = document.querySelector(".ky-hero__slide");
    if (!el) return null;
    heroSplide = new S(el, { type: "fade", arrows: false, pagination: false, rewind: true, autoplay: false, interval: 5000, speed: 3000, pauseOnHover: false, pauseOnFocus: false, drag: false });
    heroSplide.mount();
    return heroSplide;
  };
  const playHero = () => { const h = heroSlide(); if (h && h.Components.Autoplay) h.Components.Autoplay.play(); };
  if (S) {
    document.querySelectorAll(".ky-about__slide").forEach((el) => {
      new S(el, { type: "loop", drag: false, autoWidth: true, arrows: false, pagination: false, gap: "1.3rem", pauseOnHover: false, pauseOnFocus: false,
        autoScroll: { speed: reduce ? 0 : 0.5, pauseOnHover: false, pauseOnFocus: false }, intersection: { inView: { autoScroll: !reduce }, outView: { autoScroll: false } } })
        .mount({ AutoScroll: X.AutoScroll, Intersection: X.Intersection });
    });
    const course = document.querySelector(".ky-course__list");
    if (course) new S(course, { drag: "free", snap: true, autoWidth: true, gap: "1.2rem", speed: 1000, arrows: false, pagination: false }).mount();
    const yt = document.querySelector(".ky-yt");
    if (yt) new S(yt, { type: "loop", autoplay: !reduce, interval: 5000, speed: 1000, pauseOnHover: true, pauseOnFocus: false, focus: "center", autoWidth: true, gap: "1.2rem", arrows: false, pagination: true,
      intersection: { inView: { autoplay: !reduce }, outView: { autoplay: false } } }).mount({ Intersection: X.Intersection });
  }

  // News tab — original duration is 0, so it switches immediately
  document.querySelectorAll(".ky-tabs__menu button").forEach((b, i, all) => b.addEventListener("click", () => {
    all.forEach((x) => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", String(x === b)); });
  }));

  // Stage parallax — original parallax-js defaults (scalar 10 · friction .1 · opposite direction), only at 800px and wider
  let parallax = null;
  const mqPc = matchMedia("(min-width: 800px)");
  const syncParallax = () => {
    const scene = document.getElementById("ky-scene");
    if (!scene || !window.Parallax || reduce) return;
    if (mqPc.matches && !parallax) parallax = new Parallax(scene);
    else if (!mqPc.matches && parallax) { parallax.destroy(); parallax = null; }
  };
  mqPc.addEventListener("change", syncParallax);
  // The original turns on parallax after the logo stands, but the layers are still transparent then so there is no visible difference — turned on earlier so it reacts to interaction before the curtain lifts
  syncParallax();

  // Handwriting — once it reaches 80% of the screen it writes over 6s
  if (window.ScrollTrigger) {
    document.querySelectorAll(".ky-handwrite").forEach((el) => {
      if (reduce) { el.classList.add("is-show"); return; }
      ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, toggleClass: { targets: el, className: "is-show" } });
    });
  }

  const logo = document.querySelector(".ky-hero__logo");
  const logoMark = document.querySelector(".ky-hero__logo .ky-mark");
  const slogan = document.querySelector(".ky-hero__slogan");
  const chars = document.querySelectorAll(".ky-hero__main .ch");
  const hato = document.querySelector(".ky-loading__hato");
  const loading = document.querySelector(".ky-loading");

  const showFinal = () => {
    gsap.set(logo, { x: 0, opacity: 1 });
    if (logoMark) logoMark.style.color = "var(--kf-on-accent)";
    gsap.set(chars, { x: 0, opacity: 1 });
    gsap.set(slogan, { opacity: 1, y: 0 });
    body.classList.add("is-mv-show");
    syncParallax();
  };
  if (!window.gsap) return;
  if (reduce) { showFinal(); heroSlide(); return; }

  const animateLogoAndCopy = (tl, pos) => {
    tl.to(logo, { x: 0, opacity: 1, duration: isSp ? 2.2 : 1.8, ease: "expo.inOut", onComplete: playHero }, pos);
    if (logoMark) { const cs = getComputedStyle(document.documentElement); tl.fromTo(logoMark, { color: cs.getPropertyValue("--kf-accent").trim() }, { color: cs.getPropertyValue("--kf-on-accent").trim(), delay: 0.1, duration: 0.06 }, "+=0"); }
    tl.add(() => gsap.to(chars, { x: 0, opacity: 1, duration: 1, stagger: 0.06, ease: "power2.out" }), "+=.6");
    tl.add(() => body.classList.add("is-mv-show"));
    tl.add(() => gsap.to(slogan, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }), "+=1");
    return tl;
  };
  const hideLoader = () => {
    if (!loading) return;
    loading.classList.add("is-hide");
    setTimeout(() => { loading.style.display = "none"; }, 1200);
  };
  const waitThen = (fn) => {
    let loaded = document.readyState === "complete", timeout = false;
    const go = () => { if (loaded && timeout) fn(); };
    setTimeout(() => { timeout = true; go(); }, 4000);
    if (!loaded) addEventListener("load", () => { loaded = true; go(); }, { once: true });
  };
  const spScroll = () => {
    heroSlide();
    let done = false;
    gsap.to(logo, { x: 0, opacity: 1, duration: 1, ease: "power4.inOut", scrollTrigger: { trigger: logo, start: "top 95%", onEnter: () => {
      if (done) return;
      done = true;
      playHero();
      animateLogoAndCopy(gsap.timeline());
    } } });
  };

  heroSlide();
  requestAnimationFrame(() => body.classList.add("is-ready"));
  if (isSp) {
    if (first) {
      waitThen(() => {
        const tl = gsap.timeline({ onComplete: markViewed });
        tl.to(hato, { onStart: () => hato && hato.classList.add("is-out") });
        tl.add(hideLoader);
        tl.add(() => body.classList.add("is-mv-show"), "+=.9");
        spScroll();
      });
    } else { body.classList.add("is-mv-show"); spScroll(); }
    return;
  }
  if (first) {
    waitThen(() => {
      const tl = gsap.timeline({ onComplete: markViewed });
      tl.to(hato, { onStart: () => hato && hato.classList.add("is-out") });
      tl.add(hideLoader);
      animateLogoAndCopy(tl, "+=.6");
    });
  } else {
    animateLogoAndCopy(gsap.timeline(), "+=0");
  }
})();
