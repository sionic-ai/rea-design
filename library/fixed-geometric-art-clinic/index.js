/* Home — on first visit, scroll is locked during the opening (image from 1.45x to 1.35x, five layers in sequence at .3s, large outlined English text and vertical copy), 
   One wheel or touch gesture moves 2 scenes (the image slides 18% left and the head and text column come in), then the lock releases. On a return visit, 2 scenes immediately.
   After scene 2, scrolling down 10px shrinks the picture to .75x in place, and at the very top it returns to 1.35x (1.2s). Values are taken as-is from the original index.js. */
(() => {
  const TN = window.TN;
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const wrap = $(".tn-wrap"), header = $(".tn-h"), menuBar = $(".tn-h__menu"), book = $(".tn-h__book");
  const mv = $(".tn-mv"), pics = $(".tn-mv__pics"), picture = $(".tn-pic"), layers = $$(".tn-pic__layer"), fix = $(".tn-fix");
  const opens = $$(".tn-mv__open"), copy = $(".tn-mv__copy"), scroll = $(".tn-mv__scroll"), contents = $(".tn-contents");
  const sp = () => TN.isSp();
  let first = false;
  try { first = !sessionStorage.getItem("tn-access"); if (first) sessionStorage.setItem("tn-access", "0"); } catch {}
  if (TN.reduce) first = false;

  let scene2 = false;
  const scrollScene = () => {
    TN.on("scroll", () => gsap.to(pics, { xPercent: sp() ? -22 : 0, scale: sp() ? 1.1 : 0.75, duration: 1.2 }));
    TN.on("zero", () => gsap.to(pics, { xPercent: sp() ? -24 : -18, scale: sp() ? 1.2 : 1.35, duration: 1.2 }));
  };
  const setScene2 = () => {
    if (scene2) return;
    scene2 = true;
    removeEventListener("wheel", setScene2);
    removeEventListener("touchmove", setScene2);
    const d = TN.reduce ? 0 : 1;
    gsap.timeline({ onComplete: () => { wrap.classList.add("is-ended"); TN.release(); TN.layerSwap(); scrollScene(); } })
      .to(pics, { xPercent: sp() ? -24 : -18, scale: sp() ? 1.2 : 1.35, duration: 1.2 * d, ease: "power1.inOut" })
      .to(mv, { height: sp() ? "80vh" : "100%", duration: 0.5 * d }, "<")
      .to(opens, { opacity: 0, duration: 0.5 * d, onComplete: () => opens.forEach((o) => (o.style.display = "none")) }, "<")
      .to(scroll, { opacity: 0, duration: 0.5 * d, onComplete: () => (scroll.style.display = "none") }, "<")
      .to(header, { delay: 0.2 * d, duration: 0.6 * d, opacity: 1 }, "<")
      .to(menuBar, { xPercent: 0, duration: 0.6 * d }, "<")
      .to(book, { xPercent: 0, duration: 0.6 * d }, "<")
      .to(contents, { duration: 0.2 * d, opacity: 1, onComplete: () => TN.reveal() }, "<+=0.5");
  };

  const playOpening = () => {
    gsap.set(menuBar, { xPercent: sp() ? 0 : -100 });
    gsap.set(book, { xPercent: sp() ? 0 : -100 });
    gsap.timeline({ onComplete: () => { addEventListener("wheel", setScene2, { passive: true }); addEventListener("touchmove", setScene2, { passive: true }); } })
      .to(wrap, { opacity: 1, duration: 0.1 })
      .fromTo(pics, { opacity: 0, scale: sp() ? 1.7 : 1.45, xPercent: sp() ? -40 : 20 }, { opacity: 1 })
      .to(pics, { duration: 1.5, scale: sp() ? 1.6 : 1.35 })
      .to(layers, { duration: 0.6, delay: 0.2, opacity: 1, ease: "power3.in", stagger: { each: 0.3, ease: "sine.out" } }, "<")
      .addLabel("showAllLayers")
      .to(opens, { opacity: 0.8, duration: 1.2, stagger: 0.1, x: 0, y: 0 }, ">-0.5")
      .to(copy, { opacity: 1, duration: 1 }, ">-0.6")
      .to(scroll, { opacity: 1, duration: 0.5 }, "<")
      .to(fix, { duration: 1.2, opacity: 1, ease: "power2.in" }, "showAllLayers-=0.2")
      .to(layers, { duration: 0, opacity: 0, onComplete: () => picture?.remove() }, ">");
  };

  if (first) {
    TN.lock();
    gsap.set([header, contents, layers, copy, scroll], { opacity: 0 });
    gsap.set(opens[0], { opacity: 0, x: -10 });
    gsap.set(opens[1], { opacity: 0, y: 10 });
    addEventListener("load", playOpening);
  } else {
    gsap.set(pics, { xPercent: sp() ? -24 : -18, scale: sp() ? 1.2 : 1.35 });
    gsap.set(picture, { opacity: 0 });
    gsap.set(fix, { opacity: 1 });
    gsap.set(opens, { opacity: 0 });
    gsap.set(scroll, { opacity: 0 });
    gsap.set(copy, { y: sp() ? 0 : 92 });
    gsap.set(wrap, { opacity: 1 });
    addEventListener("load", setScene2);
  }
})();
