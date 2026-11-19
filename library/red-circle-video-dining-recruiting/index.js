// First page. Loading number and hero stages, News carousel (Swiper), hero mouse parallax, circular mask scrub, two vertical marquees, figure transition, number counting, interview Swiper
(() => {
  const site = window.unSite;
  const body = document.body;
  const hero = document.querySelector(".ix-hero");
  const item = hero.querySelector(".ix-hero__item");
  const video = item.querySelector("video");
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const ring = (cls) => `<span class="${cls}"><svg class="ix-ring" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"></circle><circle class="bar" cx="10" cy="10" r="10"></circle></svg></span>`;

  // News pager — .4s crossfade every 4 seconds, next rises from below and previous drops from above. The ring fills once every 4 seconds
  const initNews = () => {
    const el = hero.querySelector(".ix-news");
    if (!el || !window.Swiper) return;
    let prev = 0;
    const clear = (sw) => sw.slides.forEach((s) => s.classList.remove("is-up-in", "is-up-out", "is-down-in", "is-down-out"));
    new Swiper(el, {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 400,
      autoplay: site.reduce ? false : { delay: 4000, disableOnInteraction: false },
      slidesPerView: 1,
      allowTouchMove: false,
      pagination: { el: hero.querySelector(".ix-news__pagination"), clickable: true, renderBullet: (i, cls) => ring(cls) },
      on: {
        init: (sw) => {
          prev = sw.realIndex;
          sw.el.classList.add("is-first");
          sw.slides[sw.activeIndex]?.classList.add("is-up-in");
          setTimeout(() => sw.el.classList.remove("is-first"), 1200);
        },
        slideChange: (sw) => {
          const cur = sw.realIndex;
          const total = sw.el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length;
          clear(sw);
          const next = (cur > prev && !(cur === total - 1 && prev === 0)) || (cur === 0 && prev === total - 1);
          setTimeout(() => {
            sw.slides[sw.previousIndex]?.classList.add(next ? "is-up-out" : "is-down-out");
            sw.slides[sw.activeIndex]?.classList.add(next ? "is-up-in" : "is-down-in");
          }, 0);
          prev = cur;
        },
      },
    });
  };

  // Hero mouse parallax — distance from the 70% point of the panel × .01, photo panels at .7× · ornaments at .4× following in .15s and returning in .25s on leave
  const initParallax = () => {
    if (site.isSp() || !site.canHover || site.reduce) return;
    const area = hero.querySelector(".ix-hero__image");
    const objs = [...hero.querySelectorAll(".ix-hero__object")];
    area.addEventListener("mousemove", (e) => {
      const r = area.getBoundingClientRect();
      const mx = (e.clientX - (r.left + r.width * 0.7)) * 0.01, my = (e.clientY - (r.top + r.height * 0.7)) * 0.01;
      item.style.transition = "transform 0.15s ease-out, clip-path 1.2s ease, border-radius 0.3s ease";
      item.style.transform = `translate(${mx * 0.7}px, ${my * 0.7}px)`;
      objs.forEach((o) => { o.style.transition = "transform 0.15s ease-out, opacity 1.2s ease"; o.style.translate = `${mx * 0.4}px ${my * 0.4}px`; });
    });
    area.addEventListener("mouseleave", () => {
      item.style.transition = "transform 0.25s ease-out, clip-path 1.2s ease, border-radius 0.3s ease";
      item.style.transform = "translate(0, 0)";
      objs.forEach((o) => { o.style.transition = "translate 0.25s ease-out, opacity 1.2s ease"; o.style.translate = "0 0"; });
    });
  };

  const complete = () => {
    hero.classList.add("is-step3");
    body.classList.remove("is-header-hide");
    body.classList.remove("is-scroll-stop");
    hero.querySelector(".ix-hero__opening")?.remove();
    initNews();
    initParallax();
    try { sessionStorage.setItem("un-opening", "1"); } catch (_) {}
  };
  const expand = async () => {
    await wait(1000);
    item.classList.add("is-step2");
    setTimeout(() => item.classList.add("is-radius"), 1200);
    await wait(800);
    complete();
  };

  // Loading — every 30ms by 3.5 up to 79, then 1~2.5 each step if everything has loaded · only a tiny bit if not yet. At 100 it rests .6s and clears in .5s
  const opening = async () => {
    let first = true;
    try { first = !sessionStorage.getItem("un-opening"); } catch (_) {}
    if (site.reduce) { item.classList.add("is-step2", "is-radius"); video.play().catch(() => {}); complete(); return; }
    if (!first) {
      hero.querySelector(".ix-hero__opening")?.remove();
      video.play().catch(() => {});
      item.classList.add("is-revisit");
      await wait(600);
      item.classList.add("is-step2");
      setTimeout(() => item.classList.add("is-radius"), 1200);
      await wait(800);
      complete();
      return;
    }
    const loading = document.querySelector(".ix-loading");
    const valueEl = loading.querySelector(".ix-loading__value");
    body.classList.add("is-loading", "is-scroll-stop");
    if (!document.documentElement.classList.contains("is-first-visit")) gsap.fromTo(loading, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "sine.inOut" });
    let count = 0;
    const t0 = Date.now();
    await new Promise((done) => {
      const timer = setInterval(() => {
        const elapsed = Date.now() - t0;
        const loaded = document.readyState === "complete";
        if (count < 79) count += 3.5;
        else if (count < 100) count += loaded ? Math.random() * 1.5 + 1 : count < 90 ? Math.random() * 0.4 + 0.05 : Math.random() * 0.1 + 0.01;
        let shown = Math.floor(count);
        shown = !loaded && elapsed < 10000 ? Math.min(shown, 99) : Math.min(shown, 100);
        valueEl.textContent = shown;
        if (shown >= 100 || elapsed >= 10000) { clearInterval(timer); valueEl.textContent = 100; done(); }
      }, 30);
    });
    await wait(600);
    await new Promise((r) => gsap.to(loading, { opacity: 0, duration: 0.5, ease: "none", onComplete: r }));
    body.classList.remove("is-loading");
    document.documentElement.classList.remove("is-first-visit");
    hero.classList.add("is-loaded");
    await wait(2600);
    video.play().catch(() => {});
    item.classList.add("is-step1");
    await expand();
  };

  // About circular mask (PC) — for 1.5 screens from when the section touches the screen bottom: the circle fully opens at .8, the text moves down 10vh and disappears at .4, the hero panel is pushed 30vh and switches off, the circle panel clears away to −150vw from .3, and the side photo columns rise into place at .5.
  const aboutScrub = () => {
    if (site.reduce) return;
    const about = document.getElementById("about");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: about, start: "top bottom", end: () => "+=" + innerHeight * 1.5, scrub: true, invalidateOnRefresh: true } });
      tl.to(".ix-about__circle", { duration: 0.8, clipPath: "circle(100% at 50% 50%)", ease: "none" })
        .to(".ix-about__textwrap", { duration: 0.66667, y: "10vh", ease: "none" }, "<")
        .to(".ix-hero__image", { duration: 0.4, y: "30vh", ease: "none" }, "<")
        .to(".ix-hero__image", { duration: 0.1, opacity: 0, ease: "none" }, 0.4)
        .to(".ix-about__ctext", { duration: 0.2, opacity: 0, ease: "none" }, 0.4)
        .to(".ix-about__bg", { duration: 0.65, y: "-150vw", ease: "none" }, 0.3)
        .to(".ix-about__slider--left", { duration: 0.2, y: 0 }, 0.5)
        .to(".ix-about__slider--right", { duration: 0.2, y: 0 }, 0.5)
        .set({}, {}, 1);
    });
    mm.add("(max-width: 768px)", () => {
      const obj = document.querySelector(".ix-about__object");
      const tl = gsap.timeline({ scrollTrigger: { trigger: obj, start: () => "top " + hero.offsetHeight + "px", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      tl.to(".ix-about__bg", { duration: 0.25, opacity: 1, ease: "none" })
        .to(".ix-about__bg", { duration: 0.5, clipPath: "ellipse(50% 50% at 50% 50%)", ease: "none" }, "<")
        .to(".ix-about__textwrap", { duration: 1, y: "40vh", ease: "none" }, "<")
        .to(".ix-about__bg", { duration: 0.5, clipPath: "ellipse(40% 40% at 50% 50%)", ease: "none" }, 0.5)
        .to(".ix-about__ctext", { duration: 0.25, opacity: 0, ease: "none" }, 0.75)
        .set({}, {}, 1);
    });
  };

  // Photo column marquee — flows .8px per frame (60fps), and scrolling down speeds it up by distance × .05 (capped per step), then it settles back at .94x per frame
  const marquee = ({ cols, axis, base, maxBoost, dirs, getLoop }) => {
    let boost = 0, lastY = scrollY;
    addEventListener("scroll", () => {
      const d = scrollY - lastY;
      lastY = scrollY;
      if (d > 0) boost += Math.min(maxBoost, Math.abs(d) * 0.05);
      else if (d < 0) { boost -= Math.abs(d) * 0.05; if (boost < 0) boost = 0; }
    }, { passive: true });
    const state = cols.map((c, i) => ({ el: c, pos: dirs[i] === "down" ? -getLoop(c) : 0, loop: getLoop(c), dir: dirs[i] }));
    const re = () => state.forEach((s) => { s.loop = getLoop(s.el); s.pos = s.dir === "down" ? -s.loop : 0; });
    addEventListener("resize", re);
    addEventListener("load", re);
    gsap.ticker.add(() => {
      const v = (base + boost) * gsap.ticker.deltaRatio(60);
      state.forEach((s) => {
        if (s.loop <= 0) return;
        if (s.dir === "down") { s.pos += v; if (s.pos >= 0) s.pos -= s.loop; }
        else { s.pos -= v; if (s.pos <= -s.loop) s.pos += s.loop; }
        s.el.style.transform = axis === "y" ? `translate3d(0, ${s.pos}px, 0)` : `translate3d(${s.pos}px, 0, 0)`;
      });
      boost *= 0.94;
      if (boost < 0.01) boost = 0;
    });
  };
  const gapOf = (el) => parseFloat(getComputedStyle(el).gap) || 0;
  const aboutMarquee = () => {
    if (site.reduce) return;
    const wraps = [...document.querySelectorAll(".ix-about__wrap")];
    if (site.isSp()) {
      marquee({ cols: wraps, axis: "x", base: 0.8, maxBoost: 0, dirs: ["up", "down"], getLoop: (w) => w.firstElementChild.offsetWidth + gapOf(w) });
    } else {
      marquee({ cols: wraps, axis: "y", base: 0.8, maxBoost: 2, dirs: ["up", "up"], getLoop: (w) => w.firstElementChild.offsetHeight + gapOf(w) });
    }
  };
  const benefitsMarquee = () => {
    if (site.reduce) return;
    const cols = [...document.querySelectorAll(".ix-benefits__col")];
    cols.forEach((c) => { const l = c.querySelector(".ix-benefits__list"); const cl = l.cloneNode(true); cl.setAttribute("aria-hidden", "true"); c.append(cl); });
    if (site.isSp()) {
      marquee({ cols: [cols[0]], axis: "x", base: 0.8, maxBoost: 0, dirs: ["up"], getLoop: (c) => c.firstElementChild.offsetWidth + gapOf(c) });
    } else {
      marquee({ cols, axis: "y", base: 0.8, maxBoost: 1, dirs: ["down", "up"], getLoop: (c) => c.firstElementChild.offsetHeight + gapOf(c) });
    }
  };

  // Number count — .8s after the card becomes visible, counts up from 0 with 1.2s power2.out (decimals kept)
  const countUp = () => {
    const list = document.querySelector("[data-countup]");
    if (!list) return;
    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      list.querySelectorAll("[data-count]").forEach((el) => {
        const raw = el.dataset.count;
        const target = parseFloat(raw.replace(/,/g, "")) || 0;
        const dec = (raw.split(".")[1] || "").length;
        if (site.reduce || !target) return;
        const c = { v: 0 };
        gsap.to(c, { v: target, duration: 1.2, delay: 0.8, ease: "power2.out", onUpdate: () => (el.textContent = dec ? c.v.toFixed(dec) : Math.floor(c.v)) });
      });
    };
    new MutationObserver(() => list.classList.contains("is-inview") && go()).observe(list, { attributes: true, attributeFilter: ["class"] });
  };

  // Interview — on PC, three cards at a time, flips one card in .8s and attaches a direction type to outgoing and incoming cards. On phone, one card centered
  const interview = () => {
    const el = document.querySelector(".ix-iv");
    if (!el || !window.Swiper) return;
    const pag = { el: document.querySelector(".ix-iv__pagination"), clickable: true, renderBullet: (i, cls) => ring(cls) };
    const nav = { nextEl: ".ix-iv__next", prevEl: ".ix-iv__prev" };
    if (site.isSp()) {
      new Swiper(el, { speed: 800, slidesPerView: 1, centeredSlides: true, watchSlidesProgress: true, navigation: nav, pagination: pag });
      return;
    }
    let prev = 0;
    const reset = (s) => s && s.classList.remove(...[...s.classList].filter((c) => c.startsWith("is-left") || c.startsWith("is-right")));
    const mark = (pairs) => pairs.forEach(([s, c]) => { if (!s) return; reset(s); s.classList.add(c); });
    new Swiper(el, {
      speed: 800,
      slidesPerView: 3,
      slidesPerGroup: 1,
      watchSlidesProgress: true,
      allowTouchMove: false,
      navigation: nav,
      pagination: pag,
      on: {
        init: (sw) => { prev = sw.activeIndex; mark([[sw.slides[prev + 2], "is-right-in"], [sw.slides[prev + 3], "is-right-in-prev"]]); },
        slideChange: (sw) => {
          const cur = sw.activeIndex, s = sw.slides;
          if (cur > prev) mark([[s[prev], "is-left-out"], [s[prev - 1], "is-left-out-next"], [s[cur + 2], "is-right-in"], [s[cur + 3], "is-right-in-prev"]]);
          else if (cur < prev) mark([[s[prev + 2], "is-right-out"], [s[prev + 3], "is-right-out-next"], [s[cur], "is-left-in"], [s[cur - 1], "is-left-in-prev"]]);
          prev = cur;
        },
      },
    });
  };

  // Figure (phone) — two cards swapped via button
  const joinSwitch = () => {
    const track = document.querySelector(".ix-join__track");
    document.querySelectorAll("[data-join]").forEach((b, i, all) => b.addEventListener("click", () => {
      track.classList.toggle("is-second", b.dataset.join === "1");
      all.forEach((x) => x.classList.toggle("is-active", x === b));
    }));
  };

  joinSwitch();
  countUp();
  interview();
  // As in the original, loading is counted as soon as the document is ready (whether everything has loaded only affects counting speed)
  opening();
  site.onReady(() => {
    aboutScrub();
    aboutMarquee();
    benefitsMarquee();
  });
})();
