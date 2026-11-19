// First page: four-photo slider (Splide loop, 1.5s every 4 seconds), hero intro (once the window has fully loaded, photos appear in sequence at .12s intervals over .7s, and from .46s the text, nav and header),
// Staff photo fade (4s, 1.5s) and number swap (.3s out → .3s in).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const ease = "power2.out", imgDur = 0.7, imgEach = 0.12, ui = 0.46, ui2 = 0.45, each = 0.045;

  const sliders = [...document.querySelectorAll(".tp-slider")].map((el) => {
    const s = new Splide(el, { type: "loop", autoplay: !reduce, interval: 4000, speed: 1500, pauseOnHover: false, drag: false, arrows: false, pagination: false });
    s.mount();
    s.Components.Autoplay?.pause();
    return s;
  });
  const play = () => sliders.forEach((s) => s.Components.Autoplay?.play());

  const counter = document.querySelector(".tp-member__counter");
  const member = document.querySelector(".tp-member__splide");
  if (member) {
    const s = new Splide(member, { type: "fade", rewind: true, autoplay: !reduce, interval: 4000, speed: 1500, drag: false, pauseOnHover: false, arrows: false, pagination: false });
    s.on("moved", (i) => {
      if (!counter) return;
      const next = String(i + 1).padStart(2, "0");
      gsap.to(counter, { opacity: 0, y: -10, duration: 0.3, onComplete: () => { counter.textContent = next; gsap.to(counter, { opacity: 1, y: 0, duration: 0.3 }); } });
    });
    s.mount();
  }

  const ready = () => { root.classList.add("is-ready"); play(); requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh())); };

  const intro = () => {
    if (reduce) return ready();
    const imgs = [...document.querySelectorAll("[data-intro-img]")];
    const copy = document.querySelector(".tp-fv__copy"), lines = [...copy.querySelectorAll(".ck-wipe")];
    const nav = document.querySelector("[data-intro-nav]"), links = nav ? [...nav.querySelectorAll(".tp-fv__link")] : [];
    const band = document.querySelector("[data-intro-band]"), head = document.querySelector(".ck-header.is-top");
    gsap.set(imgs, { autoAlpha: 0, scale: 1.08, y: 24, filter: "blur(10px)" });
    gsap.set(copy, { autoAlpha: 1 });
    const inners = lines.map((l) => { const s = document.createElement("span"); s.className = "ck-wipe__in"; while (l.firstChild) s.appendChild(l.firstChild); l.appendChild(s); gsap.set(s, { opacity: 0, y: 10 }); return s; });
    if (nav) gsap.set(nav, { autoAlpha: 0, y: 12 });
    if (links.length) gsap.set(links, { autoAlpha: 0, y: 10 });
    if (band) gsap.set(band, { autoAlpha: 0, y: 8 });
    if (head) gsap.set(head, { autoAlpha: 0, y: -10 });
    const tl = gsap.timeline({ defaults: { ease }, onComplete: ready });
    imgs.forEach((el, i) => tl.to(el, { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)", duration: imgDur }, i * imgEach));
    tl.addLabel("ui", ui);
    inners.forEach((s, i) => tl.to(s, { opacity: 1, y: 0, duration: ui2 }, i === 0 ? "ui" : `ui+=${i * each}`));
    if (band) tl.to(band, { autoAlpha: 1, y: 0, duration: ui2 }, "ui");
    if (nav) tl.to(nav, { autoAlpha: 1, y: 0, duration: ui2 }, "ui+=0.06");
    if (links.length) tl.to(links, { autoAlpha: 1, y: 0, duration: ui2, stagger: each }, "ui+=0.08");
    if (head) tl.to(head, { autoAlpha: 1, y: 0, duration: ui2 }, "ui+=0.1");
  };
  if (document.readyState === "complete") intro(); else addEventListener("load", intro);
})();
