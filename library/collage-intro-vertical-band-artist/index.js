/* Home — fit to the intro plate, after the collage ends (fx:reveal) wordmark·shuffle typing·parallax, two slick rows, video popup */
(() => {
  const { parts, randomShow } = window.SK;
  const intro = document.querySelector(".sk-intro");
  const INTRO = "on: manual; delay: .15";

  // Intro front panel — wordmark letters, members, list, fan club, SNS
  const word = intro.querySelector(".sk-intro__word");
  const WORDS = ["THE", "BAND", "NAME"];
  word.setAttribute("aria-label", WORDS.join(" "));
  word.innerHTML = WORDS.map((w, wi) => [...w].map((c, i) => `<i${i === w.length - 1 && wi < WORDS.length - 1 ? ' class="is-gap"' : ""}>${c}</i>`).join("") + (wi < WORDS.length - 1 ? '<span class="is-br sk-sp-only"></span>' : "")).join("");
  intro.querySelector("[data-intro-members]").innerHTML = parts.members(INTRO);
  intro.querySelector("[data-intro-rb]").innerHTML = `<div class="sk-pc-only">${parts.contents(INTRO)}</div>${parts.fanclub("sk-intro-fade")}${parts.sns("sk-intro-fade sk-pc-only")}`;
  intro.querySelectorAll(".sk-members").forEach(window.SK.memberInit);

  // The original scales a 1366×780 (phone 375×683) board to fit the screen
  const fit = () => {
    const pc = innerWidth > 999, bw = pc ? 1366 : 375, bh = pc ? 780 : 683;
    const h = window.visualViewport ? visualViewport.height : innerHeight;
    const s = Math.min(innerWidth / bw, h / bh);
    intro.querySelectorAll(".sk-intro__step").forEach((st) => { st.style.transform = `translate(-50%, -50%) scale(${s})`; });
  };
  fit();
  addEventListener("resize", fit);

  // When the collage ends: wordmark letters random 80ms, shuffle typing, 1s fade, stagger
  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    randomShow(word.querySelectorAll("i"));
    intro.querySelectorAll('[data-fx~="text-scramble"]').forEach((el) => el.dispatchEvent(new Event("fx:play")));
    intro.classList.add("is-reveal");
    document.body.classList.add("is-reveal");
    if (window.Rellax && !matchMedia("(prefers-reduced-motion: reduce)").matches) new Rellax(".rellax", { breakpoints: [768, 1000, 1367] });
  };
  intro.addEventListener("fx:reveal", reveal);

  // slick — exactly the original settings (variableWidth · one fewer slide visible · arrows). The video row starts autoplay when it reaches the band
  const $ = window.jQuery;
  const slick = (list, prev, next) => {
    const n = list.children().length;
    list.slick({ slidesToShow: n - 1, arrows: true, pauseOnHover: false, pauseOnFocus: false, autoplay: false, variableWidth: true, centerPadding: "0", prevArrow: prev, nextArrow: next })
      .on("touchend touchcancel touchmove", function () { $(this).slick("slickPlay"); });
  };
  slick($(".sk-video__list"), ".sk-video__arrows .is-prev", ".sk-video__arrows .is-next");
  slick($(".sk-disco__list"), ".sk-disco__arrows .is-prev", ".sk-disco__arrows .is-next");
  let ytPlay = false;
  const box = document.querySelector(".sk-band__box");
  addEventListener("scroll", () => {
    if (!ytPlay && scrollY > box.getBoundingClientRect().top + scrollY) { $(".sk-video__list").slick("slickPlay"); ytPlay = true; }
  }, { passive: true });

  // Video popup — the original opens a video player (placeholder)
  const pop = document.querySelector(".sk-pop");
  document.querySelectorAll(".sk-pop-open").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    document.documentElement.classList.add("is-locked");
    pop.classList.add("is-show");
    pop.setAttribute("aria-hidden", "false");
  }));
  pop.querySelector(".sk-pop__close a").addEventListener("click", (e) => {
    e.preventDefault();
    document.documentElement.classList.remove("is-locked");
    pop.classList.remove("is-show");
    pop.setAttribute("aria-hidden", "true");
  });
})();
