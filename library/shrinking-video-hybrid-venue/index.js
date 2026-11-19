/* First page scene — values exactly from the original (desktop only, below 1024px it is stacked panels):
   The hero shrinks by the margin over the first 100px (--p1) and the header rises from below the screen (--p2), and the photo stage keeps the back photo attached while swapping at each card in .2s,
   Around the news strip the body background turns charcoal, and each photo in the photo strip follows late from 600px to the right (a 4s sine.out timeline, scrub 1). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const margin = () => parseFloat(getComputedStyle(html).getPropertyValue("--ad-margin")) || 20;

  const front = (root, push) => {
    const t = $(".p-front", root), header = $(".l-header", root);
    if (!t) return;
    gsap.set(header, { visibility: "hidden", display: "none", y: 0 });
    html.classList.add("is-force-blk");
    push(ScrollTrigger.create({
      trigger: t, start: "top top", end: "+=100px",
      onUpdate: (s) => gsap.set(t, { "--p1": s.progress, scale: 1 - ((2 * margin()) / innerWidth) * s.progress }),
    }));
    push(ScrollTrigger.create({
      trigger: t, start: "top -100px", end: "bottom top",
      onLeave: () => { t.classList.remove("is-anm"); html.classList.remove("is-force-blk"); },
      onEnterBack: () => { t.classList.add("is-anm"); html.classList.add("is-force-blk"); },
      onEnter: () => gsap.set(header, { visibility: "visible", opacity: 1 }),
      onLeaveBack: () => gsap.set(header, { visibility: "hidden", opacity: 0 }),
      onUpdate: (s) => {
        gsap.set(t, { "--p2": s.progress });
        gsap.set(header, { display: "grid", y: (1.1 * innerHeight - 100) * (1 - s.progress) });
      },
    }));
  };

  const service = (root, push) => {
    const t = $(".p-service", root);
    if (!t) return;
    const bgs = $$(".p-service__bg", t), items = $$(".p-service__bg-item", t), cards = $$(".p-service__item", t), news = $(".p-latest-news", root), container = root;
    const fade = 0.2;
    push(ScrollTrigger.create({ trigger: t, start: "top bottom", end: "top center", onUpdate: (s) => gsap.set(t, { "--p1": 1 - s.progress, scale: 1 - ((2 * margin()) / innerWidth) * (1 - s.progress) }) }));
    push(ScrollTrigger.create({ trigger: t, start: "top bottom", end: "top top", onLeaveBack: () => t.classList.remove("is-anm"), onEnter: () => t.classList.add("is-anm"), onUpdate: (s) => gsap.set(t, { "--p2": s.progress }) }));
    push(ScrollTrigger.create({
      trigger: t, start: "top top", end: "bottom top",
      onLeave: () => t.classList.remove("is-anm"), onEnterBack: () => t.classList.add("is-anm"),
      onUpdate: (s) => { gsap.set(t, { "--p3": s.progress }); gsap.set(bgs, { y: s.progress * (s.end - s.start) }); },
    }));
    push(ScrollTrigger.create({ trigger: t, start: "bottom bottom", end: "bottom center", onUpdate: (s) => gsap.set(t, { "--p4": s.progress, scale: 1 - ((2 * margin()) / innerWidth) * s.progress }) }));
    items.forEach((it, i) => i > 0 && gsap.set(it, { opacity: 0 }));
    cards.forEach((c, i) => {
      if (i === 0) {
        push(ScrollTrigger.create({
          trigger: c, start: "top bottom", end: "bottom center",
          onEnter: () => gsap.to(items[i], { duration: fade, opacity: 1 }),
          onUpdate: (s) => { gsap.set(t, { "--i1": s.progress }); gsap.set(items[i], { y: s.progress * innerHeight * -0.1 }); },
        }));
      } else {
        push(ScrollTrigger.create({
          trigger: c, start: "top center", end: i === 1 ? "bottom center" : "bottom top",
          onEnter: () => gsap.to(items[i], { duration: fade, opacity: 1 }),
          onLeaveBack: () => gsap.to(items[i], { duration: fade, opacity: 0 }),
          onUpdate: (s) => gsap.set(t, { [i === 1 ? "--i2" : "--i3"]: s.progress }),
        }));
      }
    });
    if (!news) return;
    push(ScrollTrigger.create({
      trigger: news, start: "top bottom+=200", end: "bottom bottom",
      onEnter: () => container.classList.add("t-dark"), onLeave: () => container.classList.remove("t-dark"),
      onLeaveBack: () => container.classList.remove("t-dark"), onEnterBack: () => container.classList.add("t-dark"),
    }));
    push(ScrollTrigger.create({ trigger: news, start: "top bottom", end: "bottom top", onUpdate: (s) => gsap.set(news, { "--p": s.progress }) }));
  };

  const gallery = (root, push) => {
    const t = $(".p-gallery", root);
    if (!t) return;
    const box = $(".p-gallery__container", t), list = $(".p-gallery__list", t);
    gsap.set(t, { height: list.getBoundingClientRect().width + 2.8 * innerHeight, paddingTop: (innerHeight - list.getBoundingClientRect().height) / 2 });
    const tl = gsap.timeline({ paused: true, defaults: { duration: 4, ease: "sine.out" } });
    const links = $$(".p-gallery__link", t);
    gsap.set(links, { y: 0, x: 600, opacity: 1 });
    const steps = [[-180], [-140, "-=90%"], [-100, "-=90%"], [-120, "-=85%"], [-130, "-=90%"], [-140, "-=85%"], [-120, "-=95%"], [-120, "-=90%"], [-150, "-=85%"]];
    links.forEach((l, i) => { const [x, at] = steps[i] || [-120, "-=90%"]; tl.to(l, { y: 0, x, opacity: 1 }, at); });
    const w = list.getBoundingClientRect().width;
    push(ScrollTrigger.create({ trigger: t, start: "top top", end: "+=" + (w + 2 * innerHeight), onUpdate: (s) => { gsap.set(t, { "--p1": s.progress }); gsap.set(box, { y: s.progress * (s.end - s.start) }); } }));
    push(ScrollTrigger.create({ trigger: t, start: "top " + 1.5 * innerHeight, end: "+=" + (w + 6 * innerHeight), scrub: 1, animation: tl, onEnter: () => t.classList.add("is-anm"), onLeaveBack: () => t.classList.remove("is-anm") }));
  };

  const undo = (root) => {
    const header = $(".l-header", root);
    gsap.set([header, $(".p-front", root), $(".p-service", root), $(".p-gallery", root), $(".p-gallery__container", root), ...$$(".p-service__bg, .p-service__bg-item, .p-gallery__link", root)].filter(Boolean), { clearProps: "all" });
    html.classList.remove("is-force-blk");
    root.classList.remove("t-dark");
  };

  AD.view("home", {
    triggers(root) {
      const push = (t) => AD.triggers.push(t);
      undo(root);
      if (!AD.isPc()) return;
      front(root, push);
      service(root, push);
      gallery(root, push);
    },
    destroy: undo,
  });
})();
