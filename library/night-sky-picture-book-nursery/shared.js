// Exact values from the original common.js: text splitting (.05s stagger, bouncy hop), .on at the 75% screen line, phone menu circle open, banner hidden while scrolling (back after .35s).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const splitLetters = (el, step) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const nodes = [...el.childNodes];
    el.textContent = "";
    let n = 0;
    nodes.forEach((node) => {
      if (node.nodeType === 3) {
        [...node.textContent].forEach((ch) => {
          // If blanks are wrapped in span, they collapse to width 0 when they become inline-block on hover and the text line wobbles — keep them as characters but still count their turn
          if (/\s/.test(ch)) { el.append(ch); n++; return; }
          const s = document.createElement("span");
          s.textContent = ch;
          s.style.animationDelay = `${n * step}s`;
          el.append(s);
          n++;
        });
      } else el.append(node);
    });
  };

  const scrollAnim = () => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".fade_y, .img_jump, .deco_star01, .anim, .txt_y, .under_mv_ttl, .img_ltor, .img_rtol").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top bottom-=25%", once: true, onEnter: () => el.classList.add("on") });
      });
      document.querySelectorAll(".anim01").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top bottom-=5%", once: true, onEnter: () => el.classList.add("on") });
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      document.querySelectorAll(".fade_y, .img_jump, .deco_star01, .anim, .txt_y, .anim01, .under_mv_ttl, .img_ltor, .img_rtol").forEach((el) => el.classList.add("on"));
    });
  };

  const navToggle = () => {
    const nav = document.querySelector(".nav");
    const trig = document.querySelector(".navTrigger");
    if (!nav || !trig) return;
    trig.addEventListener("click", () => {
      const open = trig.classList.toggle("open");
      trig.querySelector(".navTrigger_txt").textContent = open ? "Close" : "Menu";
      trig.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("open", open);
      document.body.classList.toggle("noscroll", open);
    });
  };

  const bannerHide = () => {
    const flx = document.querySelector(".fix_brn_flx");
    if (!flx || reduce) return;
    let t;
    addEventListener("scroll", () => {
      flx.style.opacity = 0;
      clearTimeout(t);
      t = setTimeout(() => { flx.style.opacity = 1; }, 350);
    }, { passive: true });
  };

  document.querySelectorAll(".basebtn .txt, .header_link, .bnr_link .txt").forEach((el) => splitLetters(el, 0.05));

  addEventListener("load", () => {
    gsap.registerPlugin(ScrollTrigger);
    document.body.classList.add("loaded");
    scrollAnim();
    navToggle();
    bannerHide();
  });
})();
