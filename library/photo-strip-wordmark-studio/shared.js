// Common to the whole site — logo, bottom row, menu button (opens from the right like scissors .5s / closes .35s expo.out), dot cursor, entrance after the first loader, text line rise, transition curtain.
// The original runs the loader (arc-mask-loader) on every fresh page open, and inner links navigate after a round curtain covers from below
(() => {
  const body = document.body;
  const here = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const LINKS = [["works", "Works", "works.html"], ["about", "About", "about.html"], ["contact", "Let’s talk", "contact.html"]];
  const LOGO = '<svg viewBox="0 0 26 22" aria-hidden="true"><path d="M10.4 0h5.2L26 22h-6.2l-2-4.5H8.2L6.2 22H0zm-.3 13.2h6.3L13 5.6z" fill="currentColor"/></svg>';

  const chrome = document.createElement("div");
  chrome.innerHTML = `
    <a class="ax-logo" href="index.html" aria-label="Back to start" data-slot="logo">${LOGO}</a>
    <div class="ax-foot" data-slot="footer-bar">
      <div class="ax-foot__l"><span>© 2026 - Business registration no. 000</span><i>|</i><a href="#" data-fx="text-scramble" data-fx-text-scramble="on: hover; hover: on; duration: .5; chars: ABCDEFGHIJKLMNOPQRSTUVWXYZ">Privacy</a><i>|</i><a href="#" data-fx="text-scramble" data-fx-text-scramble="on: hover; hover: on; duration: .5; chars: ABCDEFGHIJKLMNOPQRSTUVWXYZ">Cookies</a><i>|</i><button class="ax-sound" type="button" aria-label="Sound On"><span></span><span></span><span></span></button></div>
      <div class="ax-foot__r"><a href="#" data-fx="text-scramble" data-fx-text-scramble="on: hover; hover: on; duration: .5; chars: ABCDEFGHIJKLMNOPQRSTUVWXYZ">Brand</a><i>|</i><a href="#" data-fx="text-scramble" data-fx-text-scramble="on: hover; hover: on; duration: .5; chars: ABCDEFGHIJKLMNOPQRSTUVWXYZ">Instagram</a></div>
    </div>
    <div class="ax-menu" data-slot="menu">
      <button class="ax-menu__btn" type="button" aria-label="Open Menu" aria-expanded="false"><span></span><span></span></button>
      <nav class="ax-menu__panel" aria-label="Main menu"><button class="ax-menu__close" type="button" aria-label="Close Menu"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="M0 0l100 100M100 0 0 100"/></svg></button>${LINKS.map(([id, t, h]) => `<a href="${h}" class="${id === here ? "is-here" : ""}" data-label="Menu English">${t}</a>`).join("")}</nav>
    </div>
    <div class="ax-door" aria-hidden="true"></div>
    <div class="ax-cursor" aria-hidden="true"><div class="ax-cursor__tilt"><i class="ax-cursor__dia"></i></div></div><div class="ax-cursor ax-cursor--label" aria-hidden="true"><div class="ax-cursor__tilt"><span class="ax-cursor__dia"><b></b></span></div></div>`;
  body.append(...chrome.children);

  // ── Menu — 60×40 black box. On hover (or press) the two yellow lines slide out to the left (.75s expo.out, the second .08s later)
  //    After .15s the box expands to 168×162 over .8s expo.out (measured, the original motion spans .43s). On leaving it rewinds at 1.7x speed (original Menu ew·ek) ──
  const box = document.querySelector(".ax-menu"), btn = box.querySelector(".ax-menu__btn"), panel = box.querySelector(".ax-menu__panel");
  const bars = [...btn.querySelectorAll("span")];
  let open = false, wait = null;
  const grow = gsap.timeline({ paused: true })
    .to(box, { width: 168, height: 162, duration: 0.8, ease: "expo.out" })
    .fromTo(panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "none" }, 0.1);
  const setMenu = (want) => {
    if (want === open) return;
    open = want;
    btn.setAttribute("aria-expanded", String(open));
    box.classList.toggle("is-open", open);
    wait?.kill();
    if (open) {
      gsap.to(bars, { x: -60, duration: reduce ? 0 : 0.75, ease: "expo.out", stagger: 0.08 });
      wait = gsap.delayedCall(reduce ? 0 : 0.15, () => grow.invalidate().timeScale(1).play());
    } else {
      grow.timeScale(1.7).reverse();
      gsap.to(bars, { x: 0, duration: reduce ? 0 : 0.2, ease: "expo.out", stagger: 0.08, delay: reduce ? 0 : 0.25 });
    }
  };
  btn.addEventListener("click", () => setMenu(true));
  box.querySelector(".ax-menu__close").addEventListener("click", () => setMenu(false));
  if (hover) { box.addEventListener("mouseenter", () => setMenu(true)); box.addEventListener("mouseleave", () => setMenu(false)); }
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  const sound = document.querySelector(".ax-sound");
  sound.addEventListener("click", () => {
    const on = sound.classList.toggle("is-on");
    sound.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
  });

  // ── Cursor — a yellow 11px diamond (difference blend) follows with .35s expo.out, and when moving fast vertically it tilts ±6° and settles in .6s.
  //    Over [data-cursor-label] the diamond opens up (.43s) and the tag text scrambles then resolves (original CursorLabel) ──
  const cursor = { label: () => {} };
  if (hover && !reduce) {
    body.classList.add("has-cursor");
    const [main, lab] = document.querySelectorAll(".ax-cursor");
    const both = [main, lab], tilts = both.map((c) => c.firstElementChild);
    const ldia = lab.querySelector(".ax-cursor__dia"), text = ldia.querySelector("b");
    const qx = gsap.quickTo(both, "x", { duration: 0.35, ease: "expo.out" }), qy = gsap.quickTo(both, "y", { duration: 0.35, ease: "expo.out" });
    let lastY = null, lastT = 0, vel = 0, current = null;
    const tilt = { v: 0 };
    addEventListener("mousemove", (e) => {
      qx(e.clientX); qy(e.clientY);
      const t = performance.now();
      if (lastY != null && t > lastT) {
        vel = vel * 0.5 + ((e.clientY - lastY) / (t - lastT)) * 0.5;
        gsap.killTweensOf(tilt);
        tilt.v = gsap.utils.clamp(-6, 6, -10 * vel);
        gsap.set(tilts, { rotation: tilt.v });
        gsap.to(tilt, { v: 0, duration: 0.6, ease: "expo.out", onUpdate: () => gsap.set(tilts, { rotation: tilt.v }) });
      }
      lastY = e.clientY; lastT = t;
    });
    const UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    cursor.label = (txt) => {
      if (txt === current) return;
      current = txt;
      gsap.killTweensOf([ldia, text]);
      if (txt) {
        text.textContent = txt;
        const w = text.offsetWidth + 20, h = 22;
        gsap.set(lab, { opacity: 1 }); gsap.set(main, { opacity: 0 });
        gsap.to(ldia, { rotation: 0, duration: 0.22, ease: "expo.inOut" });
        gsap.to(ldia, { width: w, height: h, x: 20, y: 28, xPercent: 0, yPercent: 0, duration: 0.43, delay: 0.12, ease: "expo.out" });
        gsap.fromTo(text, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, delay: 0.3, ease: "expo.out" });
        const fin = txt, t0 = performance.now() + 300;
        const mix = (now) => {
          if (current !== fin) return;
          const p = Math.min(1, Math.max(0, (now - t0) / 600)), n = Math.floor(p * fin.length);
          text.textContent = fin.slice(0, n) + [...fin.slice(n)].map((ch) => (/\s/.test(ch) ? ch : UP[Math.floor(Math.random() * 26)])).join("");
          if (p < 1) requestAnimationFrame(mix);
        };
        requestAnimationFrame(mix);
      } else {
        gsap.to(text, { clipPath: "inset(0% 100% 0% 0%)", duration: 0.35, ease: "expo.out" });
        gsap.to(ldia, { width: 11, height: 11, x: 0, y: 0, xPercent: -50, yPercent: -50, duration: 0.3, delay: 0.1, ease: "expo.out" });
        gsap.to(ldia, { rotation: 45, duration: 0.22, delay: 0.1, ease: "expo.inOut", onComplete: () => { if (!current) { gsap.set(lab, { opacity: 0 }); gsap.set(main, { opacity: 1 }); } } });
      }
    };
    document.addEventListener("pointerover", (e) => { const el = e.target.closest?.("[data-cursor-label]"); cursor.label(el ? el.dataset.cursorLabel : null); });
  }

  // ── Line rise — [data-rise] when visible (.ax-rise lines staggered .08s each) ──
  const riseAll = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".ax-rise").forEach((r, i) => setTimeout(() => r.classList.add("is-in"), i * 80));
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("[data-rise]").forEach((el) => io.observe(el));
  };

  // ── Smooth scroll — like the original, moves content inside a fixed panel (#smooth-wrapper) with transform. Elements inside the panel are not pulled in by scrollIntoView ──
  const wrap = document.getElementById("smooth-wrapper");
  if (wrap && window.ScrollSmoother) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    ScrollSmoother.create({ wrapper: wrap, content: "#smooth-content", smooth: reduce ? 0 : 1, smoothTouch: 0 });
  }

  // ── Entrance — once the loader lifts, the page choreography starts ──
  const loader = document.querySelector('[data-fx~="arc-mask-loader"]');
  const enter = () => { body.classList.add("is-in"); riseAll(); document.dispatchEvent(new CustomEvent("ax:in")); };
  if (loader) loader.addEventListener("fx:done", () => { loader.remove(); enter(); }, { once: true });
  else requestAnimationFrame(enter);

  // ── Transition Curtain ──
  const door = document.querySelector(".ax-door");
  addEventListener("pageshow", () => door.classList.remove("is-on"));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    setMenu(false);
    if (reduce) { location.href = href; return; }
    door.classList.add("is-on");
    setTimeout(() => { location.href = href; }, 600);
  });

  window.ax = { enter, reduce, hover, cursor };
})();
