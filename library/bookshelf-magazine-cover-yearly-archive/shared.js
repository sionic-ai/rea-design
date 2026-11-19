// Shared by all pages: header hide, menu drawer, page transition (cover-turn arrival curtain · new page rising from below), scroll reveal, cover art.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const isSp = () => matchMedia("(max-width: 600px)").matches;
  const cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  // Cover image — instead of the original cover illustration, a different pattern is newly drawn in SVG each year. The hero cover and the transition screen use the same image.
  const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const f = (v) => `style="fill:var(${v})"`;
  const s = (v, w) => `style="fill:none;stroke:var(${v});stroke-width:${w};stroke-linecap:round;stroke-linejoin:round"`;
  const motifs = [
    // 1 Bouquet: big leaves and blossoms on a yellow background
    (r) => {
      let g = "";
      for (let i = 0; i < 9; i++) g += `<ellipse cx="${20 + r() * 190}" cy="${150 + r() * 120}" rx="${18 + r() * 22}" ry="${40 + r() * 30}" transform="rotate(${-50 + r() * 100} ${20 + r() * 190} ${170 + r() * 100})" ${f(i % 3 ? "--site-green" : "--site-year-4")}/>`;
      for (let i = 0; i < 7; i++) {
        const x = 25 + r() * 180, y = 90 + r() * 130, rr = 12 + r() * 16, c = ["--site-red", "--site-year-5", "--site-cyan", "--site-red"][i % 4];
        for (let p = 0; p < 6; p++) g += `<ellipse cx="${x}" cy="${y - rr}" rx="${rr * .55}" ry="${rr}" transform="rotate(${p * 60} ${x} ${y})" ${f(c)}/>`;
        g += `<circle cx="${x}" cy="${y}" r="${rr * .45}" ${f("--kf-accent")}/>`;
      }
      return g;
    },
    // 2-color block: half-circle and square pieces on a sand-colored background
    (r) => {
      let g = "";
      const cs = ["--site-year-4", "--kf-accent", "--site-green", "--site-red", "--kf-ink", "--kf-surface"];
      for (let y = 70; y < 280; y += 42) for (let x = 0; x < 230; x += 46) {
        const c = cs[Math.floor(r() * cs.length)], k = r();
        if (k < .35) g += `<rect x="${x}" y="${y}" width="46" height="42" ${f(c)}/>`;
        else if (k < .7) g += `<path d="M${x} ${y + 42}a23 23 0 0 1 46 0z" ${f(c)}/>`;
        else if (k < .85) g += `<circle cx="${x + 23}" cy="${y + 21}" r="12" ${f(c)}/>`;
      }
      return g;
    },
    // 3 White line doodle: white loop, bird and red knot on a mint background
    (r) => {
      let g = "";
      for (let i = 0; i < 9; i++) {
        const x = r() * 230, y = 70 + r() * 200;
        g += `<path d="M${x} ${y}c${20 + r() * 30} ${-30 + r() * 20} ${40 + r() * 20} ${10 + r() * 30} ${10 + r() * 30} ${30 + r() * 20}s-30 -10 -10 -40" ${s(i % 3 ? "--kf-surface" : "--site-red", 2.4)}/>`;
      }
      for (let i = 0; i < 6; i++) { const x = 20 + r() * 190, y = 80 + r() * 180; g += `<path d="M${x} ${y}l8 6 8 -6" ${s("--kf-surface", 2)}/>`; }
      return g;
    },
    // 4 Plant and leaves: bright leaves on a deep blue background
    (r) => {
      let g = `<path d="M70 280v-40h90v40z" ${f("--site-cyan")}/>`;
      for (let i = 0; i < 14; i++) {
        const a = -80 + r() * 160, l = 50 + r() * 90;
        g += `<path d="M115 245q${a * .4} ${-l * .6} ${a * .9} ${-l}q${-a * .2} ${l * .3} ${-a * .9} ${l}z" ${f(i % 2 ? "--site-cyan" : "--site-year-3")}/>`;
      }
      return g;
    },
    // 5 Pink background with circle and arc
    (r) => {
      let g = "";
      for (let i = 0; i < 8; i++) g += `<circle cx="${r() * 230}" cy="${80 + r() * 200}" r="${14 + r() * 40}" ${f(["--site-red", "--kf-surface", "--site-year-2", "--site-year-6"][i % 4])}/>`;
      for (let i = 0; i < 4; i++) g += `<path d="M${r() * 100} ${130 + r() * 120}a60 60 0 0 1 ${80 + r() * 60} 0" ${s("--kf-ink", 2)}/>`;
      return g;
    },
    // 6 Building facade lines on a sepia background
    (r) => {
      let g = "";
      for (let x = 20; x < 220; x += 38) {
        const top = 90 + r() * 70;
        g += `<rect x="${x}" y="${top}" width="32" height="${280 - top}" ${s("--kf-ink", 1.4)}/>`;
        for (let y = top + 10; y < 270; y += 18) g += `<rect x="${x + 6}" y="${y}" width="8" height="10" ${f("--kf-surface")}/><rect x="${x + 18}" y="${y}" width="8" height="10" ${f("--kf-surface")}/>`;
      }
      return g;
    },
  ];
  const coverSvg = (n, { mast = true } = {}) => {
    const r = rand(n * 977 + 13);
    const ink = n === 4 ? "--kf-surface" : "--kf-ink";
    const head = mast
      ? `<text x="115" y="44" text-anchor="middle" style="font-family:var(--kf-font-display);font-size:22px;letter-spacing:1.5px;fill:var(${ink})">Your masthead here</text>
         <text x="115" y="58" text-anchor="middle" style="font-family:var(--kf-font-sans);font-size:5.5px;fill:var(${ink})">Your one-line magazine intro goes here</text>
         <text x="214" y="268" text-anchor="end" style="font-family:var(--kf-font-display);font-size:20px;fill:var(${ink})">0000</text>`
      : "";
    return `<svg viewBox="0 0 230 280" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="230" height="280" style="fill:var(--site-year-${n})"/>${motifs[n - 1](r)}${head}</svg>`;
  };
  window.ppCoverSvg = coverSvg;

  // Header: hides on scroll down and appears on scroll up (original globalNavigation)
  const header = document.querySelector(".pp-header");
  let pastTop = scrollY;
  addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("is-hidden", scrollY > pastTop && scrollY > 10);
    pastTop = scrollY;
  }, { passive: true });

  // Menu drawer
  const menu = document.querySelector(".pp-menu");
  const burger = document.querySelector(".pp-burger");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    header.classList.toggle("is-menu", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  };
  burger?.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu?.classList.contains("is-open")) setMenu(false); });

  // Links outside the cover go straight through with no effect — the original LoadPageInteractor has the animatePages call commented out and just swaps in the new document right away

  // If arrived by pressing the cover: starts with that year’s color panel covering the screen, shrinks into the masthead position and clears over 3 seconds
  const arrive = () => {
    const n = Number(sessionStorage.getItem("pp-cover"));
    sessionStorage.removeItem("pp-cover");
    if (!n || reduce.matches || !window.gsap) return;
    const frame = document.querySelector(".pp-header__frame");
    const sheet = document.createElement("div");
    sheet.className = "pp-arrive";
    sheet.style.setProperty("--pp-arrive", `var(--site-year-${n})`);
    sheet.innerHTML = coverSvg(n, { mast: false });
    document.body.append(sheet);
    const goal = frame.getBoundingClientRect();
    const tl = gsap.timeline({ onComplete: () => sheet.remove() });
    if (isSp()) {
      const barH = document.querySelector(".pp-header__controls-frame").getBoundingClientRect().height;
      tl.to(sheet, { duration: .5, top: barH, height: innerHeight - barH })
        .to(sheet, { duration: 1, height: 0 });
    } else {
      tl.set(frame, { width: "100vw" })
        .addLabel("l1")
        .to(frame, { duration: 1, width: goal.width, clearProps: "width" }, "l1")
        .to(sheet, { duration: 1, width: goal.width, height: goal.height }, "l1")
        .to(sheet, { duration: 3, opacity: 0 });
    }
  };

  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));

  // Scroll reveal — original values as-is
  const reveal = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    // The original hooks all of these effects after window load (EventController.waitLoad)
    mm.add("(prefers-reduced-motion: no-preference)", (ctx) => loaded.then(ctx.add(() => {
      // Rises 50px from below as it appears (scrollAnimation)
      gsap.utils.toArray("[data-pp-fade]").forEach((el) => {
        gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, scrollTrigger: { trigger: el, start: "top center+=10%" } });
      });
      // Unblurs from blur 10px·1.2x (simpleZoomAnimation)
      gsap.utils.toArray("[data-pp-simple-zoom]").forEach((el) => {
        gsap.timeline({ scrollTrigger: { trigger: el, start: "top center" } })
          .from(el, { filter: "blur(10px)", scale: 1.2, ease: "power1.in", duration: .8 });
      });
      // Photo: two gray curtains peel away to the right and a white diagonal gradient passes as the blur clears (zoomImageAnimation, 2.1x speed)
      gsap.utils.toArray("[data-pp-zoom-img]").forEach((el) => {
        const box = el.parentElement;
        box.style.position = getComputedStyle(box).position === "absolute" ? "absolute" : "relative";
        box.style.overflow = "hidden";
        const cover = (cls) => { const c = document.createElement("div"); c.className = `pp-zoom-cover ${cls}`; box.append(c); return c; };
        const c3 = cover("pp-zoom-cover--veil pp-zoom-cover--b"), c2 = cover("pp-zoom-cover--veil"), c1 = cover("pp-zoom-cover--sweep");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top center" } }).timeScale(2.1);
        tl.addLabel("start")
          .fromTo(el, { scale: 1.2, filter: "blur(10px)" }, { ease: "none", duration: 2, scale: 1, filter: "blur(0px)" }, "start")
          .fromTo(c1, { "--a": 0, "--b": 0 }, { "--b": 100, ease: "none", duration: 1.5 }, "start")
          .to(c1, { "--a": 100, ease: "none", duration: 1.5 })
          .fromTo(c2, { scaleX: 1 }, { scaleX: 0, duration: 1, ease: "power3.in" }, "start")
          .fromTo(c3, { scaleX: 1 }, { scaleX: 0, duration: 1, ease: "power3.in" }, "start+=1");
      });
      // Note bundle: over 2 seconds at 0.2 second intervals (talkItemAnimation)
      gsap.utils.toArray("[data-pp-talk]").forEach((group) => {
        const items = group.querySelectorAll("[data-pp-talk-item]");
        if (items.length) gsap.fromTo(items, { opacity: 0 }, { opacity: 1, duration: 2, stagger: .2, scrollTrigger: { trigger: group, start: "top center" } });
      });
      // Original jsAct: when the element top +200px touches the bottom of the screen, is-act — the rest is handled by CSS transition
      gsap.utils.toArray("[data-pp-act], .pp-mask").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top+=200 bottom", once: true, onEnter: () => el.classList.add("is-act") });
      });
    })));
    mm.add("(prefers-reduced-motion: reduce)", () => {
      document.querySelectorAll("[data-pp-act], .pp-mask").forEach((el) => el.classList.add("is-act"));
    });
  };

  // 「Learn more」 pinned button: appears after the hero and hides when the yellow band shows
  const jump = document.querySelector(".pp-jump");
  const more = document.querySelector(".pp-more");
  if (jump && more) {
    const update = () => {
      const moreTop = more.getBoundingClientRect().top;
      jump.classList.toggle("is-show", scrollY > innerHeight * .5 && moreTop > innerHeight);
    };
    addEventListener("scroll", update, { passive: true });
    update();
    jump.addEventListener("click", (e) => {
      e.preventDefault();
      more.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
    });
  }

  window.ppShared = { arrive, reveal, isSp, cssVar, loaded };
  addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains("pp-home")) { arrive(); reveal(); }
  });
})();
