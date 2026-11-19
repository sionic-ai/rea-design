// Home page: first load where a small wordmark rising at screen center grows into place, customer card entrance·tablet drag, pinned project window (number·photo alternation·center alignment)
(() => {
  MV.page("home", {
    // Original introduction (.c-home-intro) — on first load the wordmark is shrunk to .25 (.5 on phones) and held at screen center, then moves into place over 1s power4.inOut
    intro(box, first) {
      const sec = box.querySelector(".mv-intro");
      if (!sec) return null;
      const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "ff_expo_out" } });
      const title = MV.split(sec.querySelector(".mv-intro__title"));
      const logo = sec.querySelector(".mv-intro__logo");
      const letters = logo.querySelectorAll(".letter, .point");
      const img = sec.querySelector(".mv-intro__image");
      const circles = sec.querySelectorAll(".mv-intro__circles circle");
      if (first) {
        gsap.set(logo, { scale: MV.isPhone() ? 0.5 : 0.25 });
        const top = logo.getBoundingClientRect().top + scrollY;
        gsap.set(logo, { y: innerHeight / 2 - logo.offsetHeight / 2 - top / 2 });
      }
      tl.fromTo(circles, { drawSVG: "0%" }, { duration: 1, drawSVG: "100%", stagger: 0.02, ease: "power2.out" });
      tl.fromTo(letters, { y: 200, opacity: 0 }, { duration: first ? 1 : 1.6, y: 0, opacity: 1, stagger: 0.01, ease: "power2.inOut" }, first ? "<-0.4" : "<-0.6");
      if (first) {
        tl.to(logo, { y: 0, scale: 1, duration: 1, ease: "power4.inOut" }, "<+1");
        tl.add(MV.headerIn(), "<");
      }
      tl.from(img, { clipPath: "inset(100% 0 0 0)", duration: 1, ease: "power4.inOut" }, first ? "<" : ">-0.9");
      tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 2, ease: "power2.out" }, "<+0.05");
      tl.from(title.words, { yPercent: 120, duration: 0.9, ease: "expo.out", opacity: 0, stagger: 0.01 }, "<+0.4");
      tl.add(MV.wysiwyg(sec.querySelector(".mv-intro__wysiwyg")), "<+0.1");
      tl.fromTo(sec.querySelectorAll(".mv-cta"), { y: "1rem", opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.02, ease: "expo.out" }, "<+0.2");
      tl.eventCallback("onComplete", () => title.revert());
      return tl;
    },

    ready(box) {
      const offs = [];
      const mm = gsap.matchMedia();

      mm.add({ motion: "(prefers-reduced-motion: no-preference)", hover: "(hover: hover)" }, (ctx) => {
        const { hover } = ctx.conditions;
        // Four circles move down 16% while passing the hero
        const intro = box.querySelector(".mv-intro");
        const svg = intro && intro.querySelector(".mv-intro__circles svg");
        if (svg && hover) gsap.timeline({ scrollTrigger: { trigger: intro, endTrigger: svg, start: "top top", end: "bottom top", scrub: true } }).to(svg, { yPercent: 16, ease: "none" });

        // Client card: thin line unfolds 2s, photo lifts away downward 1.2s (.15), title lines 1s (.05), + button 1s
        const slider = box.querySelector(".mv-target__slider");
        if (slider) {
          const cards = slider.querySelectorAll(".mv-tcard");
          const titles = MV.split(slider.querySelectorAll(".mv-tcard__title"), "lines");
          const tl = gsap.timeline({ defaults: { stagger: 0.15 }, scrollTrigger: { trigger: slider, start: "top 95%" }, onComplete: () => titles.revert() });
          tl.set(cards, { pointerEvents: "none" });
          tl.from(box.querySelector(".mv-target__sep"), { scaleX: 0, duration: 2, ease: "ff_expo_out" });
          tl.from(slider.querySelectorAll(".mv-tcard__image"), { clipPath: "inset(100% 0 0 0)", duration: 1.2, ease: "ff_expo_out", clearProps: "clipPath" }, "<");
          tl.from(titles.lines, { opacity: 0, yPercent: 100, duration: 1, ease: "ff_expo_out", stagger: 0.05 }, "<+0.2");
          tl.from(slider.querySelectorAll(".mv-tcard > .mv-icon"), { opacity: 0, duration: 1, ease: "ff_expo_out" }, "<+=0.4");
          tl.set(cards, { pointerEvents: "all" }, "<");
        }

        // Project window: when a card is between 75–25% of the screen its number and photo turn on, the photo shrinks 1.2→1 while passing the card slot, and when scrolling stops the card snaps to screen center
        const head = document.querySelector(".mv-header__bar");
        box.querySelectorAll(".mv-pcard").forEach((card) => {
          const n = card.dataset.index;
          const images = box.querySelectorAll(".mv-projects__image");
          const links = box.querySelectorAll(".mv-projects__nav-link");
          const img = box.querySelector(`.mv-projects__image[data-index="${n}"]`);
          const link = box.querySelector(`.mv-projects__nav-link[data-index="${n}"]`);
          const on = () => {
            images.forEach((x) => x.classList.toggle("is-active", x === img));
            links.forEach((x) => x.classList.toggle("is-active", x === link));
          };
          ScrollTrigger.create({ trigger: card, start: "top 75%", end: "bottom 25%", onEnter: on, onEnterBack: on });
          ScrollTrigger.create({
            trigger: card,
            start: () => "top bottom",
            end: () => (MV.isPhone() ? "bottom top" : `bottom top+=${head.offsetHeight + parseFloat(getComputedStyle(head).marginTop) * 2}px`),
            snap: { snapTo: (c) => (c > 0 && c < 1 ? 0.4999 : c), delay: 0.2, duration: { min: 0.2, max: 2 }, ease: "power3.inOut" },
          });
          gsap.timeline({ scrollTrigger: { trigger: card.closest(".mv-projects__ctn"), start: "top bottom", end: "bottom top", scrub: 0.5 } }).from(img.querySelector(".mv-img"), { scale: 1.2 }, "<");
        });
      });

      // On touch devices, tapping a card opens the info panel (original --is-open)
      box.querySelectorAll(".mv-tcard").forEach((card) => {
        const click = (e) => {
          if (e.target.closest("a")) return;
          box.querySelectorAll(".mv-tcard.is-open").forEach((c) => c !== card && c.classList.remove("is-open"));
          card.classList.toggle("is-open");
        };
        card.addEventListener("click", click);
        offs.push(() => card.removeEventListener("click", click));
      });

      // Drag-to-slide with Splide only at tablet widths (750–1199) (original data-splide-speed 900)
      const sliderEl = box.querySelector(".mv-target__slider");
      let splide = null;
      const tab = matchMedia("(min-width: 750px) and (max-width: 1199px)");
      const sync = () => {
        if (tab.matches && !splide && window.Splide) {
          splide = new Splide(sliderEl, { autoWidth: true, speed: 900, arrows: false, pagination: false, drag: true, gap: "1.7777rem", padding: { right: "1.7777rem" } }).mount();
        } else if (!tab.matches && splide) {
          splide.destroy(true);
          splide = null;
        }
      };
      if (sliderEl) {
        sync();
        tab.addEventListener("change", sync);
        offs.push(() => { tab.removeEventListener("change", sync); splide && splide.destroy(true); });
      }
      return () => { mm.revert(); offs.forEach((f) => f()); };
    },
  });
})();
