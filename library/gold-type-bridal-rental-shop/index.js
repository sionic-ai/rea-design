// Home — original values as is: hero fade slider (2s · 5s), gallery Swiper (2.2 → 5.7 slides, .5s, 5s autoplay), kimono section background scroll tinting (700/400px),
// Plan · flow tabs, FAQ collapse (Alpine collapse 250ms). PLAN pane opening uses border-melt-scrub, and DRESS · KIMONO letter-spacing closing uses the tracking-close-in motion part
(() => {
  if (window.Swiper) {
    new Swiper(".rd-mv__swiper", { loop: true, allowTouchMove: false, effect: "fade", speed: 2000, autoplay: { delay: 5000, disableOnInteraction: false, waitForTransition: false } });
    document.querySelectorAll("[data-js=gallery-swiper]").forEach((box) => {
      const key = box.dataset.swiper;
      new Swiper(box.querySelector(".swiper"), {
        loop: true, speed: 500, slidesPerView: 2.2, spaceBetween: 10, autoHeight: true,
        autoplay: { delay: 5000, disableOnInteraction: false, waitForTransition: false },
        breakpoints: { 768: { slidesPerView: 5.7, spaceBetween: 5 } },
        navigation: { nextEl: box.querySelector(`.${key}-next`), prevEl: box.querySelector(`.${key}-prev`) },
        pagination: { el: box.querySelector(`.${key}-progress`), type: "progressbar" },
      });
    });
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-contrast-bg").trim();
    mm.add("(max-width: 768px)", () => {
      gsap.to("#kimono-bg", { backgroundColor: ink, scrollTrigger: { trigger: "#kimono-bg", start: "top top", end: "top top-=400", scrub: true } });
    });
    mm.add("(min-width: 769px)", () => {
      gsap.to("#kimono-bg", { backgroundColor: ink, scrollTrigger: { trigger: "#kimono-bg", start: "top top", end: "top top-=700", scrub: true } });
    });
  }

  // Tabs — the pill background slides .3s toward the chosen side and the panel changes (original x-show + fade delayed .3s on entry)
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const bg = tabs.querySelector(".rd-tabs__bg");
    const btns = [...tabs.querySelectorAll("[data-tab]")];
    const scope = tabs.parentElement;
    const pick = (btn) => {
      btns.forEach((b) => { b.classList.toggle("is-on", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
      bg.style.width = `${btn.offsetWidth}px`;
      bg.style.transform = `translateX(${btn.offsetLeft}px)`;
      scope.querySelectorAll("[data-panel]").forEach((p) => {
        const on = p.dataset.panel === btn.dataset.tab;
        if (on && p.hidden) { p.hidden = false; if (window.gsap) gsap.fromTo(p, { opacity: 0 }, { opacity: 1, duration: 0.15, delay: 0.3 }); }
        if (!on) p.hidden = true;
      });
    };
    btns.forEach((b) => b.addEventListener("click", () => pick(b)));
    const first = btns.find((b) => b.classList.contains("is-on")) || btns[0];
    pick(first);
    addEventListener("resize", () => pick(btns.find((b) => b.classList.contains("is-on")) || first));
  });

  // FAQ — like Alpine collapse, height opens and closes over 250ms
  document.querySelectorAll(".rd-qa").forEach((qa) => {
    const btn = qa.querySelector("dt button");
    const dd = qa.querySelector("dd");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      if (!window.gsap) { dd.hidden = !open; return; }
      gsap.killTweensOf(dd);
      if (open) {
        dd.hidden = false;
        gsap.fromTo(dd, { height: 0 }, { height: "auto", duration: 0.25, ease: "power1.inOut" });
      } else {
        gsap.to(dd, { height: 0, duration: 0.25, ease: "power1.inOut", onComplete: () => { dd.hidden = true; gsap.set(dd, { clearProps: "height" }); } });
      }
    });
  });
})();
