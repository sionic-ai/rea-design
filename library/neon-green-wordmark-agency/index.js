// Hero motion — original Index class values as they are (firstDirection · introDirection · typeDirection · caseDirection · serviceDirection · activitiesDirection).
(() => {
  const { cssVar } = window.nvShared;
  const fx = window.nvFx;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ink = cssVar("--kf-ink"), green = cssVar("--kf-accent"), white = cssVar("--kf-surface");
  // Original getDeviceType: under 768 sp · 768~991 tb · above that pc
  const device = () => (innerWidth < 768 ? "sp" : innerWidth <= 991 ? "tb" : "pc");
  const chars = (sel) => new SplitText(sel, { type: "chars" }).chars;

  // Fit the wordmark fully into a 1400×520 (phone 374×150) cell — stretched very narrow and tall like the original lettering
  const wm = document.querySelector(".nv-wm");
  const wmIn = wm.querySelector(".nv-wm__in");
  const fit = () => {
    wmIn.style.fontSize = "100px";
    wmIn.style.transform = "none";
    const w = wmIn.scrollWidth, capH = 100 * 0.735;
    const box = wm.getBoundingClientRect();
    wmIn.style.transform = `translateY(${-(100 - capH) * (box.height / capH) * 0.62}px) scale(${box.width / w}, ${box.height / capH})`;
  };
  document.fonts.ready.then(fit);
  addEventListener("resize", fit);

  // Hero: marker is painted (0), letters mix on (0.2) and wordmark letters rise from below (0.15, 0.15 apart)
  const first = () => {
    if (reduce) return;
    const mk = document.querySelector("[data-nv-first]");
    const split = chars(mk);
    const wmChars = wm.querySelectorAll(".nv-wm__c");
    fx.setTitle(wmChars);
    fx.setMarker(mk);
    fx.setMarkerText(split, white);
    gsap.timeline()
      .addLabel("show")
      .add(fx.inMarker(mk), "show")
      .add(fx.inMarkerText(split, green, { stagger: 0.01 }), "show+=0.2")
      .add(fx.inTitle(wmChars), "show+=0.15");
  };

  // Manifesto: the left column flows 15% → -45% and the right -10%, giving parallax (scrub 0.5). Markers turn on line by line
  const intro = () => {
    if (reduce) return;
    gsap.set(".nv-intro__left", { yPercent: 15 });
    gsap.timeline({ scrollTrigger: { trigger: ".nv-intro", start: "top bottom", end: "bottom top", scrub: 0.5 } })
      .to(".nv-intro__left", { yPercent: -45, ease: "none" })
      .to(".nv-intro__right", { yPercent: -10, ease: "none" }, "<");
    document.querySelectorAll(".nv-intro__line").forEach((line, i) => {
      const marks = line.querySelectorAll("[data-nv-intro]");
      if (!marks.length) return;
      const split = chars(marks);
      fx.setMarker(marks);
      fx.setMarkerText(split, white);
      gsap.timeline({ scrollTrigger: { trigger: ".nv-intro", start: `top+=${i === 0 ? 22.5 : 25 * (i + 1)}% center+=25%` } })
        .add(fx.inMarker(marks, { stagger: 0.1 }))
        .add(fx.inMarkerText(split, ink), "<");
    });
  };

  // Circle stage: circle 2x → 1x (scrub 1.6) · +100% plans A·B · +250% (phone +200%) engine ring · phone only: the +250% ring group turns once more
  const type = () => {
    const dev = device(), sp = dev === "sp", rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const bgOdd = ".nv-engine__bg--03", bgEven = ".nv-engine__bg--02, .nv-engine__bg--04";
    if (reduce) {
      gsap.set(".nv-type__fill, .nv-type__logo, .nv-plan__c", { scale: 0 });
      gsap.set(".nv-engine__ring", { scale: 1 });
      gsap.set(".nv-type__labs--1, .nv-type__labs--2, .nv-plan__mid, .nv-type__half", { opacity: 0 });
      gsap.set(".nv-type__labs--3, .nv-engine__bg", { opacity: 1 });
      return;
    }
    const stage = document.querySelector(".nv-type__stage");
    gsap.set(".nv-type__circle", { scale: 2 });
    gsap.timeline({ scrollTrigger: { trigger: stage, start: "top top", end: "+=50%", scrub: 1.6 } }).to(".nv-type__circle", { scale: 1 });

    const plMid = chars(".nv-plan__mid .nv-plan__mk, .nv-plan__text .nv-plan__mk");
    const plTitleW = chars(".nv-plan__c--white .nv-plan__title"), plTitleB = chars(".nv-plan__c--black .nv-plan__title");
    const plMarks = document.querySelectorAll(".nv-plan__mk");
    gsap.set(".nv-type__half", { opacity: 0 });
    gsap.set(".nv-type__labs--2", { opacity: dev === "pc" ? 0 : 1 });
    fx.setMarker(plMarks);
    fx.setMarkerText(plMid, white);
    fx.setMarkerText(plTitleW, green);
    fx.setMarkerText(plTitleB, white);
    const shrink = CustomEase.create("nvShrink", "M0,0 C0.264,-0.083 0.323,-0.304 0.622,-0.176 0.971,-0.026 0.9,0.817 1,1");
    const second = gsap.timeline({ scrollTrigger: { trigger: stage, start: "+=100%", toggleActions: "play none none reverse" } })
      .to(".nv-type__fill, .nv-type__logo", { scale: 0, duration: 0.8, ease: shrink }, "in")
      .to(".nv-plan__c--white", { x: () => (dev !== "pc" ? 0 : -380 * rem), y: () => (sp ? -180 * rem : dev === "tb" ? -380 * rem : 0), duration: 1.2, ease: "elastic.out(1,0.9)" }, "in+=0.6")
      .to(".nv-plan__c--black", { x: () => (dev !== "pc" ? 0 : 380 * rem), y: () => (sp ? 180 * rem : dev === "tb" ? 380 * rem : 0), duration: 1.2, ease: "elastic.out(1,0.9)" }, "in+=0.6")
      .to(".nv-type__half", { opacity: 1, duration: 0.2, ease: "power3.out" }, "in+=0.6");
    if (dev === "pc") second.to(".nv-type__labs--1", { opacity: 0 }, "in+=0.6").to(".nv-type__labs--2", { opacity: 1 }, "in+=0.6");
    else second.to(".nv-type__labs--1 .nv-type__labrow:first-child", { color: ink }, "in+=0.6");
    second
      .add(fx.inMarkerText(plTitleW, ink, { delay: 0, stagger: 0.02 }), "in+=0.75")
      .add(fx.inMarkerText(plTitleB, green, { delay: 0, stagger: 0.02 }), "in+=0.75")
      .add(fx.inMarker(plMarks), "in+=0.75")
      .add(fx.inMarkerText(plMid, ink, { delay: 0, stagger: 0.005 }), "in+=0.75");

    const ringTitle = chars(".nv-engine__ring-title"), ringText = chars(".nv-engine__ring-text");
    const engJa = chars(".nv-engine__title-ja"), engEn = chars(".nv-engine__title-en");
    gsap.set(".nv-engine__list", { rotate: sp ? -90 : -180 });
    gsap.set(".nv-type__labs--3", { opacity: 0 });
    gsap.set(".nv-engine__ring", { scale: 0 });
    fx.setMarkerText(ringTitle, white);
    fx.setMarkerText(ringText, green);
    fx.setMarkerText(engJa, green);
    fx.setMarkerText(engEn, green);
    gsap.set(".nv-engine__powerd", { opacity: 0 });
    gsap.set(".nv-engine__mask", { drawSVG: "100% live" });
    if (dev === "pc") {
      gsap.set(bgOdd, { xPercent: 25, opacity: 0 });
      gsap.set(bgEven, { xPercent: -25, opacity: 0 });
    } else gsap.set(".nv-engine__bg", { opacity: 0 });
    // Big background text: each line flows the opposite way, moving its own width in 40s
    const bgLoop = gsap.timeline({ paused: true, repeat: -1 });
    gsap.utils.toArray(".nv-engine__bg").forEach((row, i) => bgLoop.to(row.children, { xPercent: (i + 1) % 2 === 0 ? -100 : 100, duration: 40, ease: "none" }, 0));
    const third = gsap.timeline({ scrollTrigger: { trigger: stage, start: sp ? "+=200%" : "+=250%", toggleActions: "play none none reverse", onEnter: () => bgLoop.play(0) } })
      .to(".nv-plan", { rotate: 180, duration: 1.2, ease: "power3.inOut" }, "in")
      .to(".nv-plan__c", { scale: 0, duration: 1.2, ease: "power3.inOut" }, "in")
      .to(".nv-plan__mid", { opacity: 0, duration: 0.4, ease: "power2.out" }, "in+=0.4")
      .to(".nv-engine__ring", { scale: 1, duration: 1.4, ease: "elastic.out(1,0.75)" }, "in+=0.75")
      .to(".nv-engine__list", { rotate: 0, duration: 1.4, ease: "elastic.out(1,1)" }, "in+=0.75");
    if (dev === "pc") third.to(bgOdd, { xPercent: -25, opacity: 1, duration: 1.5, ease: "power2.out" }, "in+=0.5").to(bgEven, { xPercent: 25, opacity: 1, duration: 1.5, ease: "power2.out" }, "in+=0.5");
    else third.to(".nv-engine__bg", { opacity: 1, duration: 1 }, "in+=0.5");
    third.to(".nv-type__half-in", { opacity: 0, duration: 0.5, ease: "power2.out" }, "in+=0.75");
    if (dev === "pc") third.to(".nv-type__labs--2", { opacity: 0 }, "in+=0.75").to(".nv-type__labs--3", { opacity: 1 }, "in+=0.75");
    else third.to(".nv-type__labs--1", { opacity: 0 }, "in+=0.6").to(".nv-type__labs--3", { opacity: 1 }, "in+=0.6");
    // Original ease step(60) is not a GSAP name, so it clears over 2.25s on the default curve (power1.out)
    third
      .to(".nv-engine__mask", { drawSVG: "0% live", duration: 2.25, ease: "power1.out" }, "in+=1")
      .add(fx.inMarkerText(ringTitle, green, { delay: 0, stagger: 0.02 }), "in+=1.25")
      .add(fx.inMarkerText(ringText, white, { delay: 0, stagger: 0.005 }), "in+=1.35");
    if (!sp) third
      .add(fx.inMarkerText(engJa, white, { delay: 0, stagger: 0.01 }), "in+=1")
      .add(fx.inMarkerText(engEn, white, { delay: 0, stagger: 0.01 }), "in+=1")
      .to(".nv-engine__powerd", { opacity: 1 }, "in+=1");
    if (sp) {
      gsap.timeline({ scrollTrigger: { trigger: stage, start: "+=250%", toggleActions: "play none none reverse" } })
        .to(".nv-engine__inner", { rotate: 90, duration: 1, overwrite: "auto", ease: CustomEase.create("nvTurn", "M0,0 C0.579,-0.224 0.547,0.512 0.622,0.831 0.661,1 0.752,1 1,1") }, "in")
        .to(".nv-engine__mask", { opacity: 0, duration: 0.4 }, "in+=0.5")
        .add(fx.inMarkerText(engJa, white, { delay: 0, stagger: 0.01 }), "in+=0.75")
        .add(fx.inMarkerText(engEn, white, { delay: 0, stagger: 0.01 }), "in+=0.75")
        .to(".nv-engine__powerd", { opacity: 1 }, "in+=0.75");
    }
    ScrollTrigger.create({ trigger: ".nv-type", start: "top top", end: () => `bottom ${innerHeight}`, pin: stage, pinSpacing: false, anticipatePin: 1 });
  };

  // Case: CASE letters rise in (in), and 0.5s later the circle icon stretches horizontally with elasticity (1s elastic.out(1,0.5)) and vertically (0.6s), turning the marker on.
  // Logo marquee: on wide screens only the first row moves left over 50s, on phones the three rows alternate over 100s
  const kase = () => {
    if (reduce) return;
    const sp = device() === "sp";
    gsap.utils.toArray(".nv-marquee__row").forEach((row, i) => {
      if (getComputedStyle(row).display === "none") return;
      const dir = sp ? (i % 2 === 0 ? -1 : 1) : i === 0 ? -1 : 0;
      if (!dir) return;
      row.innerHTML += row.innerHTML;
      gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: sp ? 100 : 50, ease: "none", repeat: -1 });
    });
    const title = chars(".nv-case__title"), mk = chars(".nv-kase__mk");
    fx.setTitle(title);
    fx.setMarker(".nv-kase__mk");
    fx.setMarkerText(mk, white);
    gsap.set(".nv-kase__icon", { scale: 0 });
    gsap.timeline({ scrollTrigger: { trigger: ".nv-case", start: "top center+=25%" } })
      .add(fx.inTitle(title), "in")
      .to(".nv-kase__icon", { scaleX: 1, ease: "elastic.out(1, 0.5)", duration: 1 }, "in+=0.5")
      .to(".nv-kase__icon", { scaleY: 1, ease: "power3.out", duration: 0.6 }, "in+=0.5")
      .add(fx.inMarker(".nv-kase__mk"), "in+=0.5")
      .add(fx.inMarkerText(mk, ink), "in+=0.5");
  };

  // Services: title letters rise, and 0.5s later the card marker turns on
  const service = () => {
    if (reduce) return;
    const title = chars(".nv-svcs__title"), mk = chars(".nv-svc .nv-mk");
    fx.setTitle(title);
    fx.setMarker(".nv-svc .nv-mk");
    fx.setMarkerText(mk, white);
    gsap.timeline({ scrollTrigger: { trigger: ".nv-svcs", start: "top center+=25%" } })
      .add(fx.inTitle(title), "in")
      .add(fx.inMarker(".nv-svc .nv-mk"), "in+=0.5")
      .add(fx.inMarkerText(mk, ink), "in+=0.5");
  };

  // Activity: the header turns white text, and the title letters come down from above (-100%) (0.05 stagger). The small card row is the same Splide 4.1.4 as the original (loop · 4 cards · one at a time · 0.4s ease)
  const activities = () => {
    const header = document.querySelector(".nv-header");
    ScrollTrigger.create({ trigger: ".nv-acts", start: "top top", onEnter: () => header.setAttribute("data-white", ""), onLeaveBack: () => header.removeAttribute("data-white") });
    if (!reduce) {
      const title = chars(".nv-acts__title");
      gsap.set(title, { yPercent: -100 });
      gsap.timeline({ scrollTrigger: { trigger: ".nv-acts", start: "top center+=25%" } }).add(fx.inTitle(title, { stagger: 0.05 }), "in");
    }
    const splide = new Splide(".nv-slider", {
      type: "loop", height: "172rem", speed: reduce ? 0 : 400, perPage: 4, perMove: 1, gap: "20rem", pagination: false, arrows: false, easing: "ease",
      breakpoints: { 767: { perPage: 3, height: "112rem", gap: "10rem" } },
    }).mount();
    document.querySelector(".nv-slider__prev").addEventListener("click", () => splide.go("<"));
    document.querySelector(".nv-slider__next").addEventListener("click", () => splide.go(">"));
  };

  first();
  intro();
  type();
  kase();
  service();
  activities();
})();
