// Shared by all pages: Lenis smooth scroll, header color change, menu, marker and title reveal effects, free-analysis pinned stage (3D laptop).
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, CustomEase);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cssVar = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const isSp = () => innerWidth < 768;

  // Original Common.scrollInit: duration 1.4 · lerp 0.15 · easeOutQuint, run on its own rAF, with ScrollTrigger following on window scroll events
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ duration: 1.4, lerp: 0.15, easing: (x) => 1 - Math.pow(1 - x, 5) });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    window.nvLenis = lenis;
  }
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Marker effect (original registerEffect): the box is painted from the left over 1.4s expo.out, and the letters light up in shuffled order, then change color a beat later
  // The original inMarkerText ease step(1) is a name GSAP doesn’t have, so it runs on the default curve (power1.out) — power1.out exactly as it appeared on screen
  const fx = {
    setTitle: (t) => gsap.set(t, { yPercent: 110 }),
    inTitle: (t, o = {}) => gsap.to(t, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.15, ...o }),
    setMarker: (t) => gsap.set(t, { maskImage: "linear-gradient(to right, black, black)", webkitMaskImage: "linear-gradient(to right, black, black)", maskRepeat: "no-repeat", webkitMaskRepeat: "no-repeat", maskPosition: "left 100%", webkitMaskPosition: "left 100%", maskSize: "0% 100%", webkitMaskSize: "0% 100%", transformOrigin: "left top" }),
    inMarker: (t, o = {}) => gsap.to(t, { maskSize: "100% 100%", webkitMaskSize: "100% 100%", duration: 1.4, ease: "expo.out", ...o }),
    setMarkerText: (chars, from) => gsap.set(chars, { visibility: "hidden", color: from }),
    inMarkerText: (chars, to, o = {}) => gsap.to(gsap.utils.shuffle([...chars]), {
      keyframes: [{ visibility: "visible", duration: 0.1 }, { color: to, ease: "power1.out", duration: 0.1, delay: o.delay ?? 0.15 }],
      stagger: o.stagger ?? 0.02,
    }),
    outMarkerText: (chars, to, o = {}) => gsap.to(gsap.utils.shuffle([...chars]), {
      keyframes: [{ color: to, ease: "power1.out", duration: 0.1 }, { visibility: "hidden", duration: 0.1, delay: o.delay ?? 0.15 }],
      stagger: o.stagger ?? 0.02,
    }),
  };
  window.nvFx = fx;

  // Prepares one marker and returns the timeline to play. Inside a black band the text goes from white to black, on a green background from white to green
  const marker = (el, { stagger = 0.02 } = {}) => {
    const dark = !!el.closest(".nv-dark");
    const to = dark ? cssVar("--kf-ink") : cssVar("--kf-accent");
    const split = new SplitText(el, { type: "chars" });
    fx.setMarker(el);
    fx.setMarkerText(split.chars, cssVar("--kf-surface"));
    const tl = gsap.timeline({ paused: true });
    tl.add(fx.inMarker(el), 0).add(fx.inMarkerText(split.chars, to, { stagger }), 0.2);
    return tl;
  };
  window.nvMarker = marker;

  const titles = (el) => {
    const split = new SplitText(el, { type: "chars", charsClass: "nv-char" });
    split.chars.forEach((c) => (c.style.display = "inline-block"));
    fx.setTitle(split.chars);
    return gsap.timeline({ paused: true }).add(fx.inTitle(split.chars, { stagger: 0.05 }));
  };
  window.nvTitles = titles;

  const reveal = () => {
    if (reduce) return;
    document.querySelectorAll("[data-nv-mk]").forEach((el) => {
      const tl = marker(el);
      ScrollTrigger.create({ trigger: el, start: "top center+=25%", onEnter: () => tl.play() });
    });
    document.querySelectorAll("[data-nv-title]").forEach((el) => {
      const tl = titles(el);
      ScrollTrigger.create({ trigger: el, start: "top center+=25%", onEnter: () => tl.play() });
    });
    document.querySelectorAll("[data-nv-fade]").forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top center+=30%" } });
    });
  };

  // Header: white text when over the black band ([data-header-white])
  const header = document.querySelector(".nv-header");
  document.querySelectorAll("[data-header-white]").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top top+=40",
      end: "bottom top+=40",
      onToggle: (st) => (st.isActive ? header.setAttribute("data-white", "") : header.removeAttribute("data-white")),
    });
  });

  // Menu: appears with 0.8s elastic.out(0.5,0.5) and disappears with 0.6s power3.out
  const menu = document.querySelector(".nv-menu");
  const openMenu = (open) => {
    gsap.killTweensOf(menu);
    if (open) {
      gsap.set(menu, { visibility: "visible" });
      gsap.fromTo(menu, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: reduce ? 0 : 0.8, ease: "elastic.out(0.5,0.5)" });
      window.nvLenis?.stop();
    } else {
      gsap.to(menu, { opacity: 0, scale: 0.9, duration: reduce ? 0 : 0.6, ease: "power3.out", onComplete: () => gsap.set(menu, { visibility: "hidden" }) });
      window.nvLenis?.start();
    }
    document.querySelector(".nv-burger").setAttribute("aria-expanded", open);
  };
  document.querySelector(".nv-burger")?.addEventListener("click", () => openMenu(true));
  document.querySelector(".nv-menu__close")?.addEventListener("click", () => openMenu(false));
  addEventListener("keydown", (e) => e.key === "Escape" && openMenu(false));

  // Free analysis stage (original freeAnalysisDirection): camera fov 45 · z 4.5, ambient light 1 · directional light .1. The laptop is our own shape with the same silhouette instead of the original OBJ model
  // (base 2.8×2.0 · cover 1.65, values fitted to the front edge 640px · top edge 400px measured on the original screen). When the step changes it spins once on y (1.6s power2.inOut) and swaps the screen at 0.8s
  const freeAnalysis = () => {
    const sec = document.querySelector(".nv-fa");
    if (!sec) return;
    const stage = sec.querySelector(".nv-fa__stage");
    const box = sec.querySelector(".nv-fa__laptop");
    const T = window.THREE;
    let swap = () => {}, step = 1;
    // Build the WebGL panel after the first paint — it is the bottom stage and not visible on the first screen, and building it first delays the first paint while the panel is made (headless Chrome ~0.7s)
    const initGL = () => {
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(45, box.clientWidth / box.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 4.5);
      const renderer = new T.WebGLRenderer({ antialias: false, alpha: true });
      renderer.setPixelRatio(devicePixelRatio);
      renderer.setSize(box.clientWidth, box.clientHeight);
      renderer.setClearColor(0x000000, 0);
      box.append(renderer.domElement);
      scene.add(new T.AmbientLight(0xffffff, 1));
      const light = new T.DirectionalLight(0xffffff, 0.1);
      light.position.set(3, 3, 3);
      scene.add(light);

      const screenTex = (step) => {
        const c = document.createElement("canvas");
        c.width = 1024; c.height = 600;
        const g = c.getContext("2d");
        g.fillStyle = cssVar("--kf-surface"); g.fillRect(0, 0, 1024, 600);
        g.fillStyle = cssVar("--kf-dim"); g.fillRect(470, 14, 84, 14);
        g.strokeStyle = cssVar("--kf-dim"); g.lineWidth = 2;
        if (step === 1) {
          g.strokeRect(30, 60, 964, 250);
          g.strokeStyle = cssVar("--kf-accent"); g.lineWidth = 6; g.beginPath();
          [[60, 270], [200, 250], [330, 240], [460, 200], [600, 190], [740, 150], [960, 110]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.stroke();
          g.strokeStyle = cssVar("--kf-ink"); g.lineWidth = 4; g.beginPath();
          [[60, 285], [200, 275], [330, 270], [460, 250], [600, 245], [740, 225], [960, 205]].forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.stroke();
          [[30, 340], [530, 340]].forEach(([x, y]) => {
            g.strokeStyle = cssVar("--kf-dim"); g.lineWidth = 2; g.strokeRect(x, y, 464, 230);
            for (let i = 0; i < 4; i++) {
              g.fillStyle = cssVar("--kf-dim"); g.fillRect(x + 20, y + 70 + i * 36, 90, 14);
              g.fillStyle = i % 2 ? cssVar("--kf-dim") : cssVar("--kf-accent"); g.fillRect(x + 130, y + 70 + i * 36, 120 + ((i * 70) % 160), 14);
            }
          });
        } else {
          g.strokeRect(30, 60, 964, 510);
          for (let i = 0; i < 9; i++) {
            const h = 90 + ((i * 67) % 300);
            g.fillStyle = i % 3 ? cssVar("--kf-accent") : cssVar("--kf-dim");
            g.fillRect(80 + i * 100, 520 - h, 60, h);
          }
        }
        const t = new T.CanvasTexture(c);
        t.encoding = T.sRGBEncoding;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        return t;
      };
      const tex = [screenTex(1), screenTex(2)];
      const body = new T.MeshStandardMaterial({ color: new T.Color(cssVar("--kf-dim")).lerp(new T.Color(cssVar("--kf-surface")), 0.6), roughness: 0.6 });
      const dark = new T.MeshStandardMaterial({ color: new T.Color(cssVar("--kf-ink")), roughness: 0.8 });
      const screenMat = new T.MeshStandardMaterial({ map: tex[0], roughness: 1 });
      const W = 2.8, D = 2.0, L = 1.65, lean = 0.15;
      const model = new T.Group();
      const base = new T.Mesh(new T.BoxGeometry(W, 0.07, D), body);
      const keys = new T.Mesh(new T.PlaneGeometry(W * 0.86, D * 0.42), dark);
      keys.rotation.x = -Math.PI / 2;
      keys.position.set(0, 0.036, -D * 0.16);
      const pad = new T.Mesh(new T.PlaneGeometry(W * 0.3, D * 0.22), new T.MeshStandardMaterial({ color: new T.Color(cssVar("--kf-dim")), roughness: 0.7 }));
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(0, 0.036, D * 0.27);
      const lid = new T.Group();
      lid.position.set(0, 0.035, -D / 2);
      lid.rotation.x = -lean;
      const back = new T.Mesh(new T.BoxGeometry(W, L, 0.05), dark);
      back.position.set(0, L / 2, 0);
      const screen = new T.Mesh(new T.PlaneGeometry(W * 0.92, L * 0.86), screenMat);
      screen.position.set(0, L / 2 + L * 0.02, 0.026);
      lid.add(back, screen);
      model.add(base, keys, pad, lid);
      const bb = new T.Box3().setFromObject(model), center = new T.Vector3();
      bb.getCenter(center);
      model.position.sub(center);
      const group = new T.Group();
      group.rotation.x = 0.05;
      group.add(model);
      scene.add(group);
      const spin = new T.Group();
      spin.add(group);
      scene.add(spin);
      // Draw only while the stage overlaps the screen — drawing all the time makes hover and scroll frames in other sections heavy too
      let seen = false;
      new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(sec);
      const render = () => seen && renderer.render(scene, camera);
      gsap.ticker.add(render);
      addEventListener("resize", () => {
        camera.aspect = box.clientWidth / box.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(box.clientWidth, box.clientHeight);
      });
      screenMat.map = tex[step - 1];
      swap = (to) => {
        if (reduce) { screenMat.map = tex[to - 1]; screenMat.needsUpdate = true; return; }
        gsap.fromTo(spin.rotation, { y: 0 }, { y: -Math.PI * 2, duration: 1.6, ease: "power2.inOut", overwrite: "auto" });
        gsap.delayedCall(0.8, () => { screenMat.map = tex[to - 1]; screenMat.needsUpdate = true; });
      };
    };
    if (T && box) requestAnimationFrame(() => requestAnimationFrame(initGL));
    const go = (to) => { step = to; sec.dataset.step = String(to); swap(to); };
    // Step characters (original step__number-text, step__text): 01 turns white character by character then goes out, and 0.225s later 02 lights up character by character and turns black.
    const split = (sel) => new SplitText(sec.querySelectorAll(sel), { type: "chars" }).chars;
    const one = split('.nv-fa__stack [data-step="1"]'), two = split('.nv-fa__stack [data-step="2"]');
    fx.setMarkerText(two, cssVar("--kf-surface"));
    sec.classList.add("is-ready");
    const title = sec.querySelector(".nv-fa__title");
    const titleChars = new SplitText(title, { type: "chars" }).chars;
    const marks = [...sec.querySelectorAll(".nv-fa__labels .nv-mk")];
    const markChars = marks.map((m) => new SplitText(m, { type: "chars" }).chars);
    if (reduce) return;
    fx.setTitle(titleChars);
    fx.setMarker(marks);
    markChars.forEach((c) => fx.setMarkerText(c, cssVar("--kf-surface")));
    const intro = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top center+=25%" } });
    marks.forEach((m, i) => intro.add(fx.inMarker(m), `in+=${i * 0.1}`).add(fx.inMarkerText(markChars[i], cssVar("--kf-accent")), `in+=${i * 0.1}`));
    intro.add(fx.inTitle(titleChars, { stagger: 0.1 }), "in+=0.15");
    ScrollTrigger.create({
      trigger: stage,
      start: "+=100%",
      onEnter: () => go(2),
      onLeaveBack: () => go(1),
    });
    const cta = document.querySelector(".nv-cta");
    if (cta) ScrollTrigger.create({ trigger: stage, start: "top top", onEnter: () => cta.classList.add("is-hide"), onLeaveBack: () => cta.classList.remove("is-hide") });
    gsap.timeline({ scrollTrigger: { trigger: stage, start: "+=100%", toggleActions: "play none none reverse" } })
      .add(fx.outMarkerText(one, cssVar("--kf-surface"), { delay: 0, stagger: 0.05 }), "in")
      .add(fx.inMarkerText(two, cssVar("--kf-ink"), { delay: 0, stagger: 0.05 }), "in+=0.225");
    ScrollTrigger.create({ trigger: sec, start: "top top", end: () => `bottom ${innerHeight}`, pin: stage, pinSpacing: false, anticipatePin: 1 });
  };

  // Contact band (original contactDirection): wide screens only. The panel spreads horizontally in 0.7s (.32,.48,0,1) and vertically in 0.7s power2.inOut, then 0.4s later cards rise from 60% below at 0.04s intervals
  const contact = () => {
    const link = document.querySelector(".nv-contact__link");
    if (!link || innerWidth < 992 || reduce) return;
    const contents = link.querySelector(".nv-contact__contents"), panel = link.querySelector(".nv-contact__panel"), items = link.querySelectorAll(".nv-contact__item");
    const ease = CustomEase.create("nvContact", "M0,0 C0.32,0.48 0,1 1,1");
    gsap.set(contents, { pointerEvents: "none" });
    gsap.set(panel, { scaleX: 0, scaleY: 0.25 });
    gsap.set(items, { opacity: 0, y: "60%" });
    const tl = gsap.timeline({ paused: true, onStart: () => (contents.style.pointerEvents = "auto"), onReverseComplete: () => (contents.style.pointerEvents = "none") })
      .to(panel, { scaleX: 1, duration: 0.7, ease }, "in")
      .to(panel, { scaleY: 1, duration: 0.7, ease: "power2.inOut" }, "in")
      .to(items, { y: "0%", opacity: 1, duration: 0.7, ease, stagger: 0.04 }, "in+=0.4");
    let over = false;
    const leave = () => setTimeout(() => { if (!over) tl.reverse(); }, 10);
    link.addEventListener("mouseenter", () => { over = true; tl.play(); });
    link.addEventListener("mouseleave", () => { over = false; leave(); });
  };

  // Footer (original footerDirection): on pages with a Contact band, it follows down into place from -25% above (scrub 0.8). Not on phone.
  const footer = () => {
    const el = document.querySelector(".nv-footer");
    if (!el || !document.querySelector(".nv-contact") || innerWidth < 768 || reduce) return;
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom+=15%", scrub: 0.8, invalidateOnRefresh: true } })
      .set(el, { y: "-25%" })
      .to(el, { y: 0, ease: "none" });
  };

  // Anchor row (original anchorTo): pressing [data-to] scrolls to that spot with 1 second power2.inOut
  const anchors = () => {
    document.querySelectorAll("[data-to]").forEach((el) => el.addEventListener("click", (e) => {
      e.preventDefault();
      gsap.to(window, { scrollTo: { y: el.dataset.to }, duration: reduce ? 0 : 1, ease: "power2.inOut" });
    }));
  };

  // Share button (original shareSns): a share link with the URL attached, and copy shows a notice that fades in over 0.6s and out over 0.4s after 2s
  const share = () => {
    const copy = document.querySelector("[data-sns-copy]");
    if (!copy) return;
    const url = encodeURIComponent(location.href), title = encodeURIComponent(document.title);
    const x = document.querySelector("[data-sns-x]"), fb = document.querySelector("[data-sns-facebook]");
    if (x) Object.assign(x, { href: `https://x.com/share?url=${url}&title=${title}`, target: "_blank" });
    if (fb) Object.assign(fb, { href: `https://www.facebook.com/sharer/sharer.php?u=${url}&title=${title}`, target: "_blank" });
    copy.addEventListener("click", () => navigator.clipboard?.writeText(location.href).then(() => {
      const note = document.createElement("div");
      note.className = "nv-notice";
      note.textContent = "Link copied";
      document.body.append(note);
      gsap.to(note, { opacity: 1, duration: reduce ? 0 : 0.6 });
      setTimeout(() => { gsap.to(note, { opacity: 0, duration: reduce ? 0 : 0.4 }); setTimeout(() => note.remove(), 500); }, 2000);
    }).catch(() => {}));
  };

  window.nvShared = { reveal, freeAnalysis, isSp, cssVar };
  addEventListener("DOMContentLoaded", () => {
    freeAnalysis();
    contact();
    footer();
    anchors();
    share();
    reveal();
  });
})();
