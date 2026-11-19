// First page — paths of the flashlight circles (cursor circle · circle moving from About → track list → chronicle · circle lighting the chronicle · message · tour), chronicle · message horizontal pin,
// Line that turns on in .3s when visible, message card flip. Positions are measured once at load, like the original
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|iemobile/.test(navigator.userAgent.toLowerCase());
  const $ = (s) => document.querySelector(s);
  const pos = (k) => document.querySelector(`[data-pos="${k}"]`);
  const R = (el) => el.getBoundingClientRect();

  const init = () => {
    // Push the chronicle row 3600px and the message row 3000px horizontally while the section is pinned (phone 3300 · 2800)
    gsap.to(".sh-yoko", { x: touch ? "-3300px" : "-3600px", ease: "none", scrollTrigger: { trigger: ".sh-chron", pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true, scrub: true, start: "top top", end: "top+=2400 top" } });
    gsap.to(".sh-yoko2", { x: touch ? "-2800px" : "-3000px", ease: "none", scrollTrigger: { trigger: ".sh-msg", pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true, scrub: true, start: "top top", end: "top+=800 top" } });

    // Turns on in .3s after passing the screen center, turns off when going back
    document.querySelectorAll(".sh-show").forEach((el) => {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, scrollTrigger: { trigger: el, toggleActions: "play reverse play reverse", start: "top-=20 center", end: "top+=3000 center" } });
    });

    if (reduce) return;

    // Phone cover — between sections a black veil darkens to .9 and then lifts at the head of the next section (wide screens hide it via css)
    const cover = $(".sh-cover2");
    if (cover) {
      const fade = (trigger, start, end, to) => gsap.timeline({ scrollTrigger: { trigger, start, endTrigger: trigger, end, scrub: true } }).add(gsap.to(cover, { autoAlpha: to }));
      gsap.timeline({ scrollTrigger: { trigger: "#top", start: "top+=100 top", endTrigger: "#top", end: "top+=200 top", scrub: true } }).add(gsap.fromTo(cover, { autoAlpha: 0 }, { autoAlpha: 0.9 }));
      [["#about", 100, 100, 0], ["#track", 100, 100, 0], ["#chronicle", 100, 200, 100], ["#message", 70, 200, 100], ["#tour", 70, 100, 0], ["#cd", 70, 100, 0]].forEach(([sel, a, b, c]) => {
        fade(sel, `top-=${a} center`, "top center", 0);
        fade(sel, `bottom-=${b} center`, c ? `bottom-=${c} center` : "bottom center", 0.9);
      });
      fade("#band", "top-=70 center", "top center", 0);
    }

    const mouse = $("#sh-m-mouse"), move = $("#sh-m-move");
    // Shapes inside a mask aren’t rendered so their size reads as 0 — the original calculation uses that 0 as is
    const n = R(move);
    const fadeTop = { trigger: "#top", start: "top+=100 top", endTrigger: "#top", end: "top+=400 top", scrub: true };
    if (touch) {
      gsap.timeline({ scrollTrigger: fadeTop }).add(gsap.to(mouse, { autoAlpha: 0 }));
    } else {
      mouse.setAttribute("x", "4%");
      mouse.setAttribute("y", "12%");
      document.addEventListener("mousemove", (e) => { mouse.setAttribute("x", e.pageX - 275); mouse.setAttribute("y", e.pageY - 275); });
      gsap.timeline({ scrollTrigger: fadeTop }).add(gsap.to(mouse, { autoAlpha: 0 }));
      addEventListener("scroll", () => mouse.setAttribute("y", `${scrollY + 30}px`));
    }

    // Intro → intro text → track list (unfolds as a band) → last track → chronicle title (a circle again) → chronicle text → off
    const p1 = R(pos("01"));
    gsap.to(move, { x: p1.left - n.width / 2, y: p1.top + p1.height / 2 - n.height / 2 - 350 });
    const k = gsap.timeline({ scrollTrigger: { trigger: pos("01"), start: "top-=100 center", endTrigger: pos("17"), end: "top center+=50", scrub: true } });
    k.add(gsap.to(move, { autoAlpha: 1, duration: 10 }));
    const p2 = R(pos("02"));
    k.add(touch
      ? gsap.to(move, { x: p2.left + 30, y: p2.top + p2.height / 2 - n.height / 2 - 350, duration: 50, ease: "none" })
      : gsap.to(move, { x: p2.left + p2.width / 2 + n.width / 2, y: p2.top + p2.height / 2 - n.height / 2 - 350, duration: 50, ease: "none" }));
    const p3 = R(pos("03"));
    k.add(gsap.to(move, { x: 0, y: p3.top + p3.height / 2 - n.height / 4 - 350, rx: "0px", ry: "0px", width: "100%", height: "300px", duration: 30 }));
    const p15 = R(pos("15"));
    k.add(gsap.to(move, { x: 0, y: p15.top + p15.height / 2 - n.height / 2 - 150 + 50, duration: touch ? 300 : 230, ease: "none" }));
    const p16 = R(pos("16"));
    k.add(gsap.to(move, { x: p16.left - n.width / 2 + 150, y: p16.top + p16.height / 2 - n.height / 2 - 350 + 200, rx: "200px", ry: "200px", height: "300px", width: "300px", duration: 30 }));
    const p165 = R(pos("16_5"));
    k.add(gsap.to(move, { x: p165.left + p165.width / 2 - n.width / 2 + 350, y: p165.top + p165.height / 2 - n.height / 2 - 350 + 200, duration: 30, ease: "none" }));
    k.add(gsap.to(move, { autoAlpha: 0, duration: 2 }));

    // Circle moving down along the timeline’s horizontal line
    const c2 = $("#sh-m-c2"), p17 = R(pos("17"));
    gsap.to(c2, { autoAlpha: 0, x: p17.left - n.width / 8, y: p17.top + p17.height / 2 - n.height / 2 - 350 });
    const b = gsap.timeline({ scrollTrigger: { trigger: pos("17"), start: "top center", endTrigger: pos("17"), end: "top+=2400 center", scrub: true } });
    b.add(gsap.fromTo(c2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 15 }));
    b.add(gsap.to(c2, { y: p17.top + p17.height / 2 - n.height / 2 - 350 + 2200, ease: "none", duration: 200 }));
    b.add(gsap.fromTo(c2, { autoAlpha: 1 }, { autoAlpha: 0, duration: 15 }));

    // Circle lighting the message card row
    const c3 = $("#sh-m-c3"), p19 = R(pos("19"));
    gsap.to(c3, { autoAlpha: 0, x: p19.left - n.width / 8, y: p19.top + p19.height / 2 - n.height / 2 - 350 - 100 });
    const m = gsap.timeline({ scrollTrigger: { trigger: pos("19"), start: "top-=200 center", endTrigger: pos("19"), end: "top+=1000 center", scrub: true } });
    m.add(gsap.fromTo(c3, { autoAlpha: 0 }, { autoAlpha: 1, duration: 15 }));
    m.add(gsap.to(c3, { y: p19.top + p19.height / 2 - n.height / 2 - 350 + 720, ease: "none", duration: 200 }));
    m.add(gsap.fromTo(c3, { autoAlpha: 1 }, { autoAlpha: 0, duration: 15 }));

    // Wide ellipse covering the tour table
    const c4 = $("#sh-m-c4"), p20 = R(pos("20"));
    gsap.to(c4, { autoAlpha: 0, x: p20.left, y: p20.top - p20.height / 2 });
    const t = gsap.timeline({ scrollTrigger: { trigger: pos("20"), start: "top-=200 center", endTrigger: pos("20"), end: "bottom+=100 center", scrub: true } });
    t.add(gsap.fromTo(c4, { autoAlpha: 0 }, { autoAlpha: 1, duration: 15 }));
    t.add(gsap.to(c4, { y: "-=10", duration: 200 }));
    t.add(gsap.fromTo(c4, { autoAlpha: 1 }, { autoAlpha: 0, duration: 15 }));

    if (touch) {
      [["#sh-m-c5", "30"], ["#sh-m-c6", "31"]].forEach(([sel, key]) => {
        const c = $(sel), cr = R(c), pr = R(pos(key));
        gsap.to(c, { autoAlpha: 0, x: pr.left + pr.width / 2 - cr.width / 2, y: pr.top + pr.height / 2 - cr.height / 2 });
        const tl = gsap.timeline({ scrollTrigger: { trigger: pos(key), start: "top-=200 center", endTrigger: pos(key), end: "bottom+=100 center", scrub: true } });
        tl.add(gsap.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 15 }));
        tl.add(gsap.to(c, { y: "-=10", duration: 200 }));
        tl.add(gsap.fromTo(c, { autoAlpha: 1 }, { autoAlpha: 0, duration: 15 }));
      });
    } else {
      // From the panel intro on, the cursor circle turns back on
      gsap.timeline({ scrollTrigger: { trigger: pos("30"), start: "top center", endTrigger: pos("30"), end: "top+=200 center", scrub: true } }).add(gsap.to(mouse, { autoAlpha: 1 }));
    }
  };

  // Message card — pressing flips it in .2s and the back text appears .1s later
  document.querySelectorAll(".sh-mc:not(.sh-mc--soon)").forEach((card) => {
    const flip = () => {
      const on = card.classList.toggle("is-active");
      card.querySelector(".sh-mc__back")?.classList.toggle("is-active", on);
      card.setAttribute("aria-pressed", String(on));
    };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });

  if (document.readyState === "complete") init();
  else addEventListener("load", init, { once: true });
})();
