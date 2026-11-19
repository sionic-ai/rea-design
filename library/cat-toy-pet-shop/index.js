// First page — Splide fade first screen · photo strip · four products (click a row to advance) · review slider · photo overlap pin · cat ball-play Lottie
// original values: hero fade speed 2000 · interval 5000 / product fade 300 · 5000, photo 1.4s cubic-bezier(0,.55,.45,1) / overlap fixed at 1000px, panel .4→1 (scrub 1, phone true) · photo 1.3→1 (scrub 2)
(() => {
  const { reduce, isMobile, btn, icons } = window.MR;
  const arrowBtns = (cls = "") => `<div class="splide__arrows mr-pager__arrows ${cls}"><div class="mr-pager__arrowsIn">
      <button class="splide__arrow splide__arrow--prev" type="button" aria-label="Previous"><svg class="mr-arr" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5"/></svg></button>
      <button class="splide__arrow splide__arrow--next" type="button" aria-label="Next"><svg class="mr-arr" viewBox="0 0 7 12"><path d="M1 1l5 5-5 5"/></svg></button></div></div>`;

  // ── Four Products ──
  const prods = [
    { name: "Your product name 1", sub: "Your one-line introduction here", lines: ["Your strength line here", "Place two lines on the benefits of checking records in the app", "Your safety benefit line here"], shots: ["Round automatic litter box and cat · living room · landscape 3:2", "Cat peeking into the bathroom · landscape 3:2", "Hand holding app screen and restroom · landscape 3:2"], btns: [["VIEW DETAIL", "ink"], ["BUY", "accent"]] },
    { name: "Your product name 2", sub: "Your one-line introduction here", lines: ["Log every day with the app<br>Strengths to explore", "Can be washed whole<br>Clean advantage", "One line on the shape that eases neck strain"], shots: ["Cat drinking from a water dispenser · side light · landscape 3:2", "Hand washing water dispenser parts · landscape 3:2", "Water dispenser front view · white background · landscape 3:2"], btns: [["VIEW DETAIL", "ink"], ["BUY", "accent"]] },
    { name: "Your product name 3", sub: "Your one-line introduction here", lines: ["Dining with automatic recording<br>Benefits of watching closely", "Large Tub, So<br>Peace of mind outdoors too", "Several times a day<br>Handing Out<br>Booking feature"], shots: ["Cat eating at an automatic feeder · landscape 3:2", "App recording screen · landscape 3:2", "Food dispenser front view · white background · landscape 3:2"], btns: [["VIEW DETAIL", "ink"], ["BUY", "accent"]] },
    { name: "Your product name 4", sub: "Your one-line introduction here", lines: ["Anytime with the app<br>Benefit of checking the condition", "Small and light<br>The advantage of low burden", "Hard to tell by eye<br>Benefits of measuring records"], shots: ["Cat upper body wearing a necklace · landscape 3:2", "Neck-worn device close-up · Landscape 3:2", "App log screen · landscape 3:2"], btns: [["BUY", "accent"]], pos4: true },
  ];
  const list = document.querySelector(".mr-prod__list");
  list.innerHTML = prods
    .map(
      (p, i) => `
    <li class="mr-pi">
      <div class="mr-pi__in">
        <div class="mr-pi__head" data-anim data-start="80%">
          <p class="mr-pi__num" data-fadein data-y="50">0${i + 1}</p>
          <h3 class="mr-pi__title" data-fadein data-y="50" data-delay="0.1"><span>${p.name}</span></h3>
          <p class="mr-pi__sub" data-fadein data-y="50" data-delay="0.2"><span>${p.sub}</span></p>
          <div class="mr-pi__cat${p.pos4 ? " mr-pi__cat--4" : ""}"><svg class="mr-art" style="--ar: 220 / 90"><use href="#mr-cat-lie"/></svg></div>
        </div>
        <div class="splide mr-pi__slide" aria-label="${p.name} Photo">
          <div class="splide__track mr-pi__imgs">
            <ul class="splide__list">${p.shots.map((s) => `<li class="splide__slide"><div class="mr-pi__pic"><span class="wf-img wf-r-3x2 mr-pi__img" data-label="${s}"></span></div></li>`).join("")}</ul>
          </div>
          <div class="mr-pi__text">
            <div class="mr-pi__listWrap">
              <ul class="mr-pi__lines">${p.lines.map((l) => `<li><button class="mr-pi__line" type="button">${l}</button></li>`).join("")}</ul>
              <div class="mr-pi__circle"></div>
            </div>
            <div class="mr-pager mr-pager--prod">
              <div class="mr-pager__track"><div class="mr-pager__bar"></div></div>
              ${arrowBtns()}
            </div>
          </div>
        </div>
      </div>
      <div class="mr-btnRow">${p.btns.map(([t, k]) => `<div>${btn(t, k, "product.html")}</div>`).join("")}</div>
    </li>`,
    )
    .join("");

  // ── Review Card ──
  const voices = [
    ["Put to use right as soon as it arrived. Watches closely every time cleaning starts.", "Cat sitting next to an automatic toilet · 10:9 landscape"],
    ["I was startled by the sound at first, but once used to it I like this much better. I got rid of the old toilet.", "Cat sitting on a toilet · landscape 10:9"],
    ["We got it in case the family is away from home for a long time, and after a month of use it’s so convenient.", "Device and cat in a corner of the living room · landscape 10:9"],
    ["I picked it because I could try it first among several products. It was already in use while it was still installing.", "Cat next to a device being installed · landscape 10:9"],
    ["Notifications come in, so I can tell they’re doing fine even while I work, and I worry less.", "Phone notification screen and a cat · landscape 10:9"],
    ["They often check in to see whether the movement suits you.", "Cat face peering at a device · landscape 10:9"],
  ];
  document.querySelector(".mr-voice__splide .splide__list").innerHTML = voices
    .map(
      ([t, l]) => `<li class="splide__slide"><a class="mr-vc" href="#">
        <div class="mr-vc__img"><div class="mr-vc__zoom" data-img-in data-delay="continue"><span class="wf-img" data-label="${l}"></span></div></div>
        <div class="mr-vc__text"><p>${t}</p><span class="mr-vc__sns"><svg class="mr-sns"><use href="#mr-sns-x"/></svg></span></div>
      </a></li>`,
    )
    .join("");

  if (!window.Splide) return;

  // Hero: when flipping, the new section goes 1.1→1 (1.4s), the rest wait at 1.1
  const kvEl = document.querySelector(".mr-kv__splide");
  const kv = new Splide(kvEl, { type: "fade", rewind: true, speed: 2000, autoplay: !reduce, interval: 5000, arrows: false, pagination: false, drag: false, pauseOnHover: false, pauseOnFocus: false });
  const kvImgs = () => kvEl.querySelectorAll(".mr-kv__img");
  kv.on("mounted", () => kvImgs().forEach((s, i) => (s.style.transform = i === 0 ? "scale(1)" : "scale(1.1)")));
  kv.on("move", (n, prev) => {
    kvImgs().forEach((s, i) => { if (i !== prev) s.style.transform = "scale(1.1)"; });
    const c = kvImgs()[n];
    if (c) c.style.transform = "scale(1)";
  });
  kv.mount();

  // Features — phone is a center-aligned slider, 1024 and above is three columns (destroy)
  const featEl = document.querySelector(".mr-feat__splide");
  const feat = new Splide(featEl, {
    type: "slide", speed: 300, arrows: true, pagination: false, focus: "center", trimSpace: false, flickMaxPages: 1, flickPower: 200,
    fixedWidth: "min(calc(263 / 375 * 600px), calc(263 / 375 * 100vw))", gap: "min(calc(32 / 375 * 600px), calc(32 / 375 * 100vw))",
    mediaQuery: "min", breakpoints: { 1024: { destroy: true, arrows: false, pagination: false, flickPower: 600 } },
  });
  const featBar = featEl.querySelector(".mr-pager__bar");
  feat.on("mounted", () => (featBar.style.width = `${100 / feat.length}%`));
  feat.on("move", () => (featBar.style.left = `${(100 / feat.length) * feat.index}%`));
  feat.mount();

  // Product — tapping a row goes to that section, and the circle moves to that row’s height in .2s
  document.querySelectorAll(".mr-pi__slide").forEach((el) => {
    const lines = [...el.querySelectorAll(".mr-pi__line")];
    const bar = el.querySelector(".mr-pager__bar");
    const circle = el.querySelector(".mr-pi__circle");
    const imgs = () => el.querySelectorAll(".mr-pi__img");
    let tops = [], timer = 0, waiting = false;
    const s = new Splide(el, { type: "fade", rewind: true, speed: 300, autoplay: !reduce, interval: 5000, arrows: true, pagination: false });
    const setLine = (n) => lines.forEach((b, i) => b.classList.toggle("is-current", i === n));
    const measure = () => (tops = lines.map((b) => b.parentElement.offsetTop));
    const setCircle = (n) => (circle.style.transform = `translateY(${tops[n] || 0}px)`);
    const setBar = (n) => (bar.style.left = `${(100 / s.length) * n}%`);
    s.on("mounted", () => {
      setLine(0);
      bar.style.width = `${100 / s.length}%`;
      setBar(0);
      measure();
      setCircle(0);
      imgs().forEach((im, i) => (im.style.transform = i === 0 ? "scale(1)" : "scale(1.1)"));
    });
    s.on("move", (n, prev) => {
      setLine(n);
      setBar(n);
      setCircle(n);
      const all = imgs();
      if (waiting) {
        clearTimeout(timer);
        waiting = false;
        all.forEach((im, i) => {
          if (i === n) {
            im.style.transition = "none";
            im.style.transform = "scale(1.1)";
            setTimeout(() => { im.style.transition = ""; im.style.transform = "scale(1)"; }, 20);
          } else im.style.transform = "scale(1.1)";
        });
      } else {
        all.forEach((im, i) => {
          if (i === prev) {
            waiting = true;
            timer = setTimeout(() => { im.style.transform = "scale(1.1)"; waiting = false; }, 1400);
          } else if (i === n) im.style.transform = "scale(1)";
          else im.style.transform = "scale(1.1)";
        });
      }
    });
    lines.forEach((b, i) => b.addEventListener("click", () => { setLine(i); s.go(i); setBar(i); setCircle(i); }));
    s.mount();
    new ResizeObserver(() => { measure(); setCircle(s.index); }).observe(el.querySelector(".mr-pi__lines"));
  });

  // Reviews — phone 240px·gap 16, 768 and up 400px·gap 24
  new Splide(".mr-voice__splide", {
    type: "slide", speed: 300, arrows: true, pagination: false, fixedWidth: "240px", gap: "16px",
    padding: { left: "calc(40 / 375 * 100vw)", right: "calc(40 / 375 * 100vw)" }, trimSpace: "move", mediaQuery: "min",
    breakpoints: { 768: { fixedWidth: "400px", gap: "24px", padding: { left: "clamp(2.5rem, 7.5117370892vw + 0.7394366197rem, 7.5rem)", right: "clamp(2.5rem, 7.5117370892vw + 0.7394366197rem, 7.5rem)" }, trimSpace: "move", focus: 0, omitEnd: true } },
  }).mount();

  // Cat ball-play Lottie (looping)
  if (window.lottie && window.MR_ART) lottie.loadAnimation({ container: document.getElementById("mr-cat-ball"), renderer: "svg", loop: true, autoplay: !reduce, animationData: MR_ART.catBall() });

  // Photo overlap — fixed 1000px, panel and photos scale up (or down) tied to scroll, and while the second photo rises the first photo moves down 50vh (PC devices only)
  const pin = document.querySelector(".mr-ex__pin");
  const pinItem = document.querySelector(".mr-ex__pinItem");
  const frame = pinItem.querySelector(".mr-ex__frame");
  const img = pinItem.querySelector(".mr-ex__img");
  const second = document.querySelector(".mr-ex__item--second");
  const mm = gsap.matchMedia();
  mm.add({ sm: "(max-width: 767px)", md: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { sm, reduce: r } = ctx.conditions;
    if (r) return;
    const scroll = 1000;
    ScrollTrigger.create({ trigger: pin, pin: pinItem, start: "top top", end: `+=${scroll}`, scrub: false });
    gsap.fromTo(frame, { scale: 0.4 }, { scale: 1, scrollTrigger: { trigger: pin, start: "top top", end: `+=${scroll}`, scrub: sm ? true : 1 } });
    gsap.fromTo(img, { scale: 1.3 }, { scale: 1, scrollTrigger: { trigger: pin, start: "top top", end: `+=${scroll}`, scrub: sm ? true : 2 } });
    if (!isMobile) gsap.fromTo(img, { y: 0 }, { y: "50vh", ease: "none", immediateRender: false, scrollTrigger: { trigger: second, start: "top bottom", end: "top top", scrub: true } });
  });
  // The shared intro (shared.js) was created before pinning, so re-line it up in position order so that positions are measured after the pin spacing is added
  ScrollTrigger.sort?.();
  addEventListener("load", () => { ScrollTrigger.sort?.(); ScrollTrigger.refresh(); });
})();
