// First page: hero photo fade (Swiper 11 fade crossFade · speed 1500 · 3.5s), four-edge section names rotate (.55s keyframe when a section passes screen center), read-more accordion (height 250ms).
(() => {
  const RY = window.RY;
  const markSlot = document.querySelector(".ry-hero__mark");
  if (markSlot) markSlot.innerHTML = RY.mark;

  addEventListener("load", () => {
    const el = document.getElementById("main-swiper");
    if (el && window.Swiper) {
      const swiper = new Swiper(el, {
        spaceBetween: 30,
        effect: "fade",
        fadeEffect: { crossFade: true },
        loop: true,
        speed: RY.reduced ? 0 : 1500,
        autoplay: RY.reduced ? false : { delay: 3500, disableOnInteraction: false },
      });
      // Only on the first white section, the header and symbol turn ink-dark and the slogan below turns on
      const tone = () => document.body.classList.toggle("is-slide1", swiper.realIndex === 0);
      tone();
      swiper.on("slideChange", tone);
    }
    orbit();
  });

  // Section name bumps — when going down from section k to k+1, each name moves from its current position s along ry-orbit-f<s>, when it rises ry-orbit-b<s>.
  // Like the original, jumping straight to a non-adjacent section leaves no keyframes, so the names snap back to their first positions
  function orbit() {
    const labels = RY.labels;
    const sections = [...document.querySelectorAll("[data-orbit]")];
    if (!labels.length || !sections.length) return;
    gsap.registerPlugin(ScrollTrigger);
    let last = null;
    const play = (from, to) => {
      const step = to - from;
      labels.forEach((lab, k) => {
        const s = (k + from) % 5;
        if (RY.reduced) {
          lab.style.animation = "";
          lab.dataset.station = Math.abs(step) === 1 ? String((k + to) % 5) : String(k);
          return;
        }
        lab.style.animation = "none";
        void lab.offsetWidth;
        lab.style.animation = step === 1 ? `ry-orbit-f${s} 0.55s forwards` : step === -1 ? `ry-orbit-b${s} 0.55s forwards` : "";
      });
    };
    sections.forEach((sec, i) => {
      const enter = () => {
        if (last !== null && last !== i) play(last, i);
        last = i;
      };
      ScrollTrigger.create({ trigger: sec, start: "top center", end: "bottom center", onEnter: enter, onEnterBack: enter });
    });
  }

  // Read-more accordion — height 0 ↔ content height 250ms cubic-bezier(.4,0,.2,1), icon and text change immediately
  document.querySelectorAll("[data-acc]").forEach((acc) => {
    const btn = acc.querySelector(".ry-acc__btn");
    const panel = acc.querySelector(".ry-acc__panel");
    const dur = RY.reduced ? 0 : 250;
    panel.style.transition = `height ${dur}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    let timer;
    btn.addEventListener("click", () => {
      const opening = !acc.classList.contains("is-open");
      clearTimeout(timer);
      acc.classList.toggle("is-open", opening);
      btn.setAttribute("aria-expanded", String(opening));
      if (opening) {
        panel.hidden = false;
        panel.style.height = "0px";
        void panel.offsetHeight;
        panel.style.height = `${panel.scrollHeight}px`;
        timer = setTimeout(() => { panel.style.height = ""; ScrollTrigger.refresh(); }, dur);
      } else {
        panel.style.height = `${panel.scrollHeight}px`;
        void panel.offsetHeight;
        panel.style.height = "0px";
        timer = setTimeout(() => { panel.hidden = true; panel.style.height = ""; ScrollTrigger.refresh(); }, dur);
      }
    });
  });
})();
