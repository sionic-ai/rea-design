/* First page — original home module values.
   Loader: after .5s the first word of the wordmark .6s power2 → after .75s the second word .6s → after 2.75s (immediately if clicked) veil .2s →
   About text band 17 lines at .05s intervals .3s (fade-band-lines) · grid lines settle in .4s · grid 200px → 0 1s power2 (phone: menu .075s intervals .3s, grid .6s) →
   Lift the curtain, release scroll, and start at the spot scrolled down by the wordmark height (window height − intro text height) where the intro text sticks to the top */
(() => {
  const { reduce, mobile } = window.uu;
  const body = document.body, menu = document.querySelector(".menu");
  const splash = document.querySelector(".home-splash"), intro = document.querySelector(".home-intro");
  const introInner = document.querySelector(".home-intro-inner"), lines = document.querySelector(".home-intro-lines");
  const hero = document.querySelector(".home-logo"), title = document.querySelector(".home-intro .uu");
  const ease = "power2.out";

  // Set the wordmark slot height to window height − intro text height and start scrolled down by that much — scrolling up puts the large wordmark above the intro text
  const fitHero = (first) => {
    if (mobile()) return;
    const r = innerHeight - introInner.offsetHeight;
    hero.style.height = `${r}px`;
    if (first) {
      hero.querySelectorAll("text").forEach((t) => t.classList.add("shown"));
      hero.classList.remove("hide");
      scrollTo(0, r);
    }
  };

  const start = () => {
    fitHero(true);
    addEventListener("resize", () => fitHero(false));
    // Change the name only while cells pass beneath the intro text (original no-title-change)
    title.classList.add("is-held");
    ScrollTrigger.create({
      trigger: ".home-layout-inner",
      start: () => `top top+=${introInner.offsetHeight}`,
      end: () => `bottom top+=${document.querySelector(".home-footer-top").offsetHeight}`,
      onEnter: () => title.classList.remove("is-held"),
      onEnterBack: () => title.classList.remove("is-held"),
      onLeave: () => title.classList.add("is-held"),
      onLeaveBack: () => title.classList.add("is-held"),
    });
    // The intro text turns transparent as you scroll, leaving only the name (over the text box height + 50px)
    ScrollTrigger.create({
      trigger: introInner, start: "top top", end: "bottom top+=50", scrub: true,
      onUpdate: (s) => introInner.style.setProperty("--opacity", (1 - s.progress).toFixed(3)),
    });
    setTimeout(() => ScrollTrigger.refresh());
  };

  let skip = false;
  try { skip = sessionStorage.getItem("uu-intro") === "off"; } catch {}
  if (reduce || !splash || skip) {
    splash?.remove();
    // If the loader is skipped, the intro text stands right away with no band motion, like the original
    if (skip && !reduce) lines?.remove();
    intro.classList.remove("out");
    lines?.dispatchEvent(new CustomEvent("fx:play"));
    gsap.set(".home-layout", { y: 0 });
    gsap.set(".home-layout .line", { opacity: 1 });
    menu.classList.remove("mobile-hidden");
    body.classList.remove("no-scroll");
    // Measure after fx-core attaches the band so the intro text height is right
    requestAnimationFrame(start);
    return;
  }

  let timer = 0, done = false;
  const words = splash.querySelectorAll("text");
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    intro.classList.remove("out");
    gsap.to(splash, {
      opacity: 0, duration: 0.2, ease,
      onComplete: () => {
        if (mobile()) {
          gsap.fromTo(".menu a", { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.075, duration: 0.3, ease, onComplete: () => menu.classList.remove("mobile-hidden") });
          gsap.to(".home-layout .line", { opacity: 1, duration: 0.2, ease });
        } else {
          lines.dispatchEvent(new CustomEvent("fx:play"));
          gsap.to(".home-layout .line", { opacity: 1, duration: 0.4, ease });
        }
        gsap.to(".home-layout", {
          y: 0, duration: mobile() ? 0.6 : 1, ease,
          onComplete: () => {
            splash.remove();
            body.classList.remove("no-scroll");
            scrollTo(0, 0);
            start();
          },
        });
      },
    });
  };
  setTimeout(() => {
    gsap.to(words[0], { opacity: 1, duration: 0.6, ease });
    setTimeout(() => {
      gsap.to(words[1], { opacity: 1, duration: 0.6, ease });
      splash.addEventListener("click", finish);
      timer = setTimeout(finish, +splash.dataset.delay);
    }, 750);
  }, 500);
})();
