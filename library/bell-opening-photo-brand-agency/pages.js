// Per-page motion — Barba swaps only the body, so every page loads this file and shared.js picks by name (namespace) to attach and release it
(() => {
  const RE = window.RE;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ───── First Page
  RE.pages.home = (c) => {
    const hero = c.querySelector(".rh-hero"), film = c.querySelector(".rh-film"), credits = c.querySelector(".rh-credits");
    const logo = c.querySelector(".rh-logo"), burger = c.querySelector(".rh-burger"), list = c.querySelector(".rh-nav .re-nav__list"), bars = c.querySelector(".rh-bars");
    const root = document.documentElement;
    const onFilm = RE.color("--kf-bg"), ink = RE.color("--kf-ink");

    // While the hero is between 20% above and 120% below the screen, film · white text, and when it leaves, the film turns off in .25s, the text goes dark, and the header line is unhidden.
    const show = (on) => {
      gsap.to(credits, { color: on ? onFilm : ink, duration: 0.25, ease: "none", overwrite: "auto" });
      gsap.to(film, { opacity: on ? 1 : 0, duration: 0.25, ease: "none", overwrite: "auto" });
      if (RE.cookie && !RE.cookie.hasAttribute("data-closed")) gsap.to(RE.cookie, { opacity: on ? 0 : 1, y: on ? "100%" : 0, duration: 0.3, ease: "none", overwrite: "auto" });
      RE.notAtTop = !on;
      RE.headState();
    };
    const io = new IntersectionObserver(([e]) => show(e.isIntersecting), { rootMargin: "-20% 0% 20% 0%", threshold: 0 });
    io.observe(hero);

    // Wide screen: holds the wordmark line at screen center, and when the menu below rises and touches beneath it (end position − half the wordmark height − menu height), they rise together
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const locked = c.querySelector(".rh-locked"), start = c.querySelector(".rh-hero__start"), end = c.querySelector(".rh-hero__end"), collector = c.querySelector(".rh-collector");
      ScrollTrigger.create({ trigger: start, start: "top top", end: () => "+=" + Math.max(0, end.offsetTop - locked.offsetHeight / 2 - collector.offsetHeight), pin: locked, anticipatePin: 1 });
    });

    // First open — the original is once per 7 days (cookie). After 1s two ink bands pull back ±10px · 2× width in .2s power4.in and the film shows through the center gap,
    // Over 2.5s the inner edge rounds and drops out in .5s power4.in (curtain-split). The film also returns from 1.5x to 1x in .5s,
    // At 2.7s the wordmark unfolds together with its white panel from 1.15 wide and 0 tall in 1s power4.out, and .04s later the panel turns transparent over .1s leaving the letters. At 3.25s the menu rises from below in .5s, then the + button
    let tl = null;
    const intro = root.classList.contains("re-intro") && !RE.introPlayed && !reduce && bars;
    if (intro) {
      RE.introPlayed = true;
      RE.lenis.scrollTo(0, { immediate: true, force: true });
      RE.lenis.stop();
      setTimeout(() => {
        bars.setAttribute("data-fx", "curtain-split");
        const canvas = film.querySelector('[data-fx-part="film-canvas"]');
        const bg = RE.color("--kf-bg"), clear = bg.replace("rgb(", "rgba(").replace(")", ", 0)");
        tl = gsap.timeline({
          onComplete: () => {
            RE.lenis.start();
            try { localStorage.setItem("re-intro", String(Date.now() + 7 * 864e5)); } catch {}
            root.classList.remove("re-intro");
            gsap.set([logo, list, burger], { clearProps: "all" });
            if (canvas) gsap.set(canvas, { clearProps: "transform" });
          },
        });
        if (canvas) tl.fromTo(canvas, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: "power4.in" }, 2.5);
        tl.fromTo(logo, { scaleX: 1.15, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 1, ease: "power4.out" }, 2.7)
          .fromTo(logo, { backgroundColor: bg }, { backgroundColor: clear, duration: 0.1, ease: "power4.out" }, 2.74)
          .fromTo(list, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: "power4.out" }, 3.25)
          .fromTo(burger, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      }, 0);
    } else {
      bars?.remove();
      root.classList.remove("re-intro");
    }

    return () => { io.disconnect(); mm.revert(); tl?.kill(); };
  };
})();

// ───── Subpage
(() => {
  const RE = window.RE;

  // Work detail: ‹Section list› — raised only within the body (from when the first section head touches the bottom of the screen until the footer head touches the bottom of the screen),
  // On press, list buttons turn on from the bottom one at .03s intervals with .2s power4.out. Pressing a section scrolls to 100px above it and closes after .1s
  RE.pages.detail = (c) => {
    const box = c.querySelector(".rd-chapters"), list = c.querySelector(".rd-chapters__list"), toggle = c.querySelector(".rd-chapters__toggle");
    if (!box) return;
    const items = [...list.querySelectorAll(".re-btn")];
    const tw = gsap.to(items, { paused: true, opacity: 1, visibility: "visible", duration: 0.2, ease: "power4.out", stagger: -0.03 });
    const open = () => { list.setAttribute("aria-hidden", "false"); toggle.setAttribute("aria-expanded", "true"); tw.play(); };
    const close = () => { tw.reverse(); toggle.setAttribute("aria-expanded", "false"); list.setAttribute("aria-hidden", "true"); };
    const onToggle = () => (toggle.getAttribute("aria-expanded") === "true" ? close() : open());
    const onPick = (e) => {
      const a = e.target.closest("[data-chapter]");
      if (!a) return;
      e.preventDefault();
      const to = c.querySelector("#" + a.dataset.chapter);
      if (to) RE.lenis.scrollTo(to.getBoundingClientRect().top + RE.lenis.scroll - 100);
      setTimeout(close, 100);
    };
    toggle.addEventListener("click", onToggle);
    list.addEventListener("click", onPick);
    const st = ScrollTrigger.create({
      trigger: c.querySelector(".rd-chapters-mark") || c.querySelector(".rd-hero"), start: "top bottom", endTrigger: document.querySelector(".re-footer"), end: "top bottom",
      onEnter: () => box.classList.add("is-active"), onEnterBack: () => box.classList.add("is-active"),
      onLeave: () => { box.classList.remove("is-active"); close(); }, onLeaveBack: () => { box.classList.remove("is-active"); close(); },
    });
    return () => { st.kill(); tw.kill(); toggle.removeEventListener("click", onToggle); list.removeEventListener("click", onPick); };
  };

  // Careers: photo slider — original SwiperCarousel (loop · slidesPerView auto · centered · default speed 300ms), prev·next buttons
  RE.pages.recruit = (c) => {
    const el = c.querySelector(".rr-swiper");
    if (!el || !window.Swiper) return;
    const sw = new Swiper(el, { direction: "horizontal", loop: true, slidesPerView: "auto", spaceBetween: 0, centeredSlides: true });
    const prev = c.querySelector(".rr-carousel__prev"), next = c.querySelector(".rr-carousel__next");
    const p = () => sw.slidePrev(), n = () => sw.slideNext();
    prev?.addEventListener("click", p);
    next?.addEventListener("click", n);
    return () => { prev?.removeEventListener("click", p); next?.removeEventListener("click", n); sw.destroy(); };
  };

  // Job detail: hiring process collapse — original Bootstrap collapse (height .35s ease)
  RE.pages.job = (c) => {
    const btn = c.querySelector(".rj-acc__btn"), body = c.querySelector(".rj-acc__body");
    if (!btn || !body) return;
    let tw;
    const onClick = () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      tw?.kill();
      if (open) { body.hidden = false; tw = gsap.fromTo(body, { height: 0 }, { height: body.scrollHeight, duration: 0.35, ease: "power1.inOut", onComplete: () => { gsap.set(body, { height: "auto" }); ScrollTrigger.refresh(); } }); }
      else tw = gsap.to(body, { height: 0, duration: 0.35, ease: "power1.inOut", onComplete: () => { body.hidden = true; ScrollTrigger.refresh(); } });
    };
    btn.addEventListener("click", onClick);
    return () => { tw?.kill(); btn.removeEventListener("click", onClick); };
  };
})();
