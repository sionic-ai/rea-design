// Shared across the whole site — Lenis smooth scroll (original settings), header hide, dropdown, dot bounce, phone menu and sliding panel, magnetic button, floating images.
// Values are exactly as in the original bundle.js
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 1024px)").matches || !matchMedia("(hover: hover)").matches;
  const U = (window.U = { reduce, mobile });

  // Lenis — duration .5s, curve min(1, 1.01 − 100^−t), smooth even for finger scrolling (passes the old name as is)
  if (!reduce && window.Lenis) {
    const lenis = (U.lenis = new Lenis({ duration: 0.5, direction: "vertical", gestureDirection: "vertical", smooth: true, mouseMultiplier: 1, smoothTouch: true, touchMultiplier: 0, infinite: false, easing: (t) => Math.min(1, 1.01 - Math.pow(100, -t)) }));
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Header: hides after scrolling down past 100px (data-scroll=0), appears as soon as it is raised even slightly
  body.dataset.scroll = "1";
  let last = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (y >= last) { if (body.dataset.scroll === "1" && y > 100) body.dataset.scroll = "0"; }
    else if (body.dataset.scroll === "0") body.dataset.scroll = "1";
    last = y;
  }, { passive: true });

  // Menu dot — on hover it drops 20px and grows with .6s bounce.out, and shrinks when leaving
  const dot = (item, on) => { const i = $("i", item); if (!i) return; on ? gsap.fromTo(i, { scale: 0, y: 0 }, { scale: 1, y: 20, duration: reduce ? 0 : 0.6, ease: "bounce.out" }) : gsap.to(i, { scale: 0, ease: "power3.out", overwrite: true }); };
  let shown = null;
  const closeChild = () => { if (body.dataset.show !== "child") return; body.dataset.show = ""; shown?.classList.remove("is-show"); $$(".u-menu__item.is-show").forEach((m) => m.classList.remove("is-show")); shown = null; };
  $$(".u-menu__item").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      dot(item, true);
      const id = item.dataset.childTrigger;
      if (!id) { closeChild(); return; }
      const child = $(`[data-child-id="${id}"]`);
      if (shown && shown !== child) closeChild();
      body.dataset.show = "child";
      item.classList.add("is-show");
      child.classList.add("is-show");
      shown = child;
    });
    item.addEventListener("mouseleave", () => dot(item, false));
  });
  $(".u-header__wrap")?.addEventListener("mouseleave", closeChild);

  // Phone menu — opening it stops Lenis
  $(".u-trigger")?.addEventListener("click", (e) => {
    e.preventDefault();
    const open = body.dataset.show !== "global";
    body.dataset.show = open ? "global" : "";
    e.currentTarget.setAttribute("aria-expanded", open);
    if (U.lenis) open ? U.lenis.stop() : U.lenis.start();
  });

  // Hinged door — open 1s, close .5s expo.out
  const accordion = (head, panel) => head.addEventListener("click", (e) => {
    const sec = head.closest("[data-accordion-state]"), open = sec.dataset.accordionState === "open";
    if (head.tagName === "A") return;
    e.preventDefault();
    gsap.to(panel, open ? { height: 0, duration: reduce ? 0 : 0.5, overwrite: "auto", ease: "expo.out" } : { height: "auto", duration: reduce ? 0 : 1, overwrite: "auto", ease: "expo.out" });
    sec.dataset.accordionState = open ? "close" : "open";
  });
  $$(".u-global__section[data-accordion-state]").forEach((s) => accordion($(".u-global__head", s), $(".u-global__list", s)));
  if (mobile) $$(".u-fmenu").forEach((s) => accordion($(".u-fmenu__title", s), $(".u-fmenu__child", s)));
  $$("[data-js='accordion-trigger']").forEach((h) => accordion(h, h.nextElementSibling));

  // Magnetic button — lays a sticky filter once, and each frame follows the cursor by .1
  if (!document.getElementById("u-goo")) document.body.insertAdjacentHTML("beforeend", '<svg class="u-goo-defs" aria-hidden="true"><filter id="u-goo"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b"/><feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" result="g"/><feComposite in="SourceGraphic" in2="g" operator="atop"/></filter></svg>');
  const magnets = $$(".u-magnet a");
  if (magnets.length && !mobile && !reduce) {
    const st = magnets.map(() => ({ move: false, once: false, x: 0, y: 0 }));
    magnets.forEach((a, n) => {
      a.addEventListener("mouseenter", () => (st[n].once = true));
      a.addEventListener("mousemove", (e) => { st[n].move = true; st[n].x = e.clientX; st[n].y = e.clientY; });
      a.addEventListener("mouseleave", () => (st[n].move = false));
    });
    const tick = () => {
      magnets.forEach((a, n) => {
        const r = a.getBoundingClientRect();
        if (r.top > innerHeight || r.bottom < 0) return;
        const title = a.children[0], plate = a.children[1].children[0], blob = a.children[1].children[1];
        if (st[n].move) {
          const dx = st[n].x - r.left - r.width / 2, dy = st[n].y - r.top - r.height / 2;
          gsap.to(blob, { duration: 0.3, x: 0.7 * dx, y: 0.4 * dy, ease: "power3.out", overwrite: true });
          gsap.to(title, { duration: 0.5, x: 0.1 * dx, y: 0.1 * dy, ease: "power3.out", overwrite: true });
          gsap.to(plate, { duration: 0.5, x: 0.07 * dx, y: 0.07 * dy, ease: "power3.out", overwrite: true });
        } else if (st[n].once) {
          st[n].once = false;
          gsap.to(blob, { duration: 1, x: 0, y: 0, ease: "elastic.out(1,0.2)", overwrite: true });
          gsap.to(title, { duration: 1.2, x: 0, y: 0, ease: "elastic.out(1,0.2)", overwrite: true });
          gsap.to(plate, { duration: 1, x: 0, y: 0, ease: "elastic.out(1,0.2)" });
        }
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Floating image — up and down 4.5s (·4s), the inside tilts 7° for 3s
  $$(".is-float").forEach((el, i) => {
    if (reduce) return;
    gsap.fromTo(el, { y: i % 2 ? -5 : -3 }, { y: i % 2 ? 5 : 6, repeat: -1, duration: i % 2 ? 4 : 4.5, yoyo: true, ease: "power1.inOut" });
    const inner = el.firstElementChild;
    if (inner) gsap.fromTo(inner, { rotation: 0 }, { rotation: 7, repeat: -1, duration: 3, yoyo: true, ease: "power1.inOut" });
  });

  // Sub-page hero English title — letter by letter <em> split into pieces (original _split), after .6s they pop from 0 → 1 growing (.6s, random order within .1s, original custom curve)
  const chars = [];
  $(".u-hero__title [data-split]").forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => (c === " " ? '<em class="empty"> </em>' : `<em>${c}</em>`)).join("");
    chars.push(...$("em", el));
  });
  if (chars.length && !reduce) {
    const pop = window.CustomEase ? (gsap.registerPlugin(CustomEase), CustomEase.create("u-pop", "M0,0 C0.205,0 0.188,1.077 0.573,1.078 0.746,1.078 0.825,1 1,1")) : "back.out(1.4)";
    gsap.set(chars, { scale: 0 });
    gsap.to(chars, { scale: 1, duration: 0.6, delay: 0.6, ease: pop, stagger: { amount: 0.1, from: "random" } });
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
