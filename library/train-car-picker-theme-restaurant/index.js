// First page: hero circular mask transition · scroll blur, news slider, station map drag, course overlap stacking, room picker.
// Original values: paging at 1s intervals 5.4s · Hero reveal scale 1.2→1 2s power3.out · course photo -15svh scrub · rooms 1s expo.out.
(() => {
  const { reduced } = FT;
  const desk = matchMedia("(min-width: 768px)");

  /* Hero — original: a single three panel laid over Splide fade (interval 5.4s · transition 1s · rewind), transitioning with a mask shader.
     The mask is a radial gradient from black at the center to white at the edge — by that amount the front photo is pushed out and the next photo pushed in as they blend (strength .5 · direction (1,1) · quart.out).
     Photo slots draw the same placeholder on a canvas and attach it to the board */
  const hero = document.querySelector(".hx");
  const frame = hero.querySelector(".hx__frame");
  const inner = hero.querySelector(".hx__inner");
  const heroLogo = hero.querySelector(".hx__logo");
  const slider = hero.querySelector(".hx__slides");
  const glCanvas = hero.querySelector(".hx__gl");

  const placeholder = (el, w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    const cs = getComputedStyle(el);
    const after = getComputedStyle(el, "::after");
    x.fillStyle = cs.backgroundColor;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = cs.borderTopColor;
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h);
    x.stroke();
    const label = el.dataset.label || "";
    const fs = Math.round(h / 60);
    x.font = `500 ${fs}px ${after.fontFamily}`;
    const tw = x.measureText(label).width;
    x.fillStyle = after.backgroundColor;
    x.fillRect(w / 2 - tw / 2 - fs * 0.7, h / 2 - fs * 0.95, tw + fs * 1.4, fs * 1.9);
    x.fillStyle = after.color;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(label, w / 2, h / 2);
    return c;
  };
  // Does not use the original mask image — redraws the same shape (512 square, 0 at center → radius .5 to 1, corners 1)
  const radialMask = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, "rgb(0, 0, 0)"); /* Not skin: displacement strength map — 0 means no push */
    g.addColorStop(1, "rgb(255, 255, 255)"); /* Not skin: 1 means fully pushed out */
    x.fillStyle = "rgb(255, 255, 255)"; /* Not skin: all corners get pushed away */
    x.fillRect(0, 0, 512, 512);
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 512);
    return c;
  };

  const vert = "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const frag = `varying vec2 vUv;
    uniform sampler2D uFrom, uTo, uMask;
    uniform float uProgress, uIntensity;
    uniform vec2 uFromFit, uToFit, uDir;
    vec2 fold(vec2 p) { vec2 m = mod(p, 2.0); return mix(m, 2.0 - m, step(1.0, m)); }
    void main() {
      vec2 a = vUv * uFromFit + (1.0 - uFromFit) * 0.5;
      vec2 b = vUv * uToFit + (1.0 - uToFit) * 0.5;
      vec2 push = texture2D(uMask, vUv).rg * uIntensity * uDir;
      vec4 from = texture2D(uFrom, fold(a + push * uProgress));
      vec4 to = texture2D(uTo, fold(b - push * (1.0 - uProgress)));
      gl_FragColor = mix(from, to, uProgress);
    }`;

  const ShaderFade = (S, C) => {
    let gl = null;
    let run = null;
    let shown = 0;
    const T = window.THREE;
    const setup = () => {
      if (!T) return;
      const test = document.createElement("canvas");
      if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) return;
      const renderer = new T.WebGLRenderer({ canvas: glCanvas });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const camera = new T.PerspectiveCamera(45, 1, 1, 1e4);
      camera.position.z = 50;
      const scene = new T.Scene();
      const slides = C.Slides.get().filter((s) => !s.isClone);
      const SW = 2880, SH = 1800;
      const tex = slides.map((s) => {
        const t = new T.CanvasTexture(placeholder(s.slide.firstElementChild, SW / 2, SH / 2));
        t.minFilter = T.LinearFilter;
        return t;
      });
      const mask = new T.CanvasTexture(radialMask());
      const u = {
        uFrom: { value: tex[0] }, uTo: { value: tex[0] }, uMask: { value: mask },
        uProgress: { value: 0 }, uIntensity: { value: 0.5 }, uDir: { value: new T.Vector2(1, 1) },
        uFromFit: { value: new T.Vector2(1, 1) }, uToFit: { value: new T.Vector2(1, 1) },
      };
      const mesh = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: u }));
      scene.add(mesh);
      const fit = (v) => {
        const a = glCanvas.clientWidth / glCanvas.clientHeight || 1, ia = SW / SH;
        v.set(Math.min(a / ia, 1), Math.min(1 / a / (1 / ia), 1));
      };
      const size = () => {
        const w = glCanvas.clientWidth, h = glCanvas.clientHeight;
        if (!w || !h) return;
        const vh = Math.abs(camera.position.z * Math.tan((camera.fov * Math.PI) / 360) * 2);
        mesh.scale.set(vh * (w / h), vh, 1);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        fit(u.uFromFit.value);
        fit(u.uToFit.value);
        renderer.render(scene, camera);
      };
      new ResizeObserver(size).observe(glCanvas);
      gl = { renderer, scene, camera, u, tex, render: () => renderer.render(scene, camera), size };
      hero.classList.add("is-gl");
      size();
    };
    return {
      mount() {
        setup();
        // Applies a per-slide opacity transition like Splide’s native fade — without WebGL this is the visible transition, with it, as in the original, the slides with only the image hidden move together beneath the plane
        C.Slides.style("transition", `opacity ${S.options.speed}ms ${S.options.easing}`);
      },
      start(index, done) {
        if (!gl) {
          requestAnimationFrame(done);
          return;
        }
        // Splide changes index before start, so keep the currently visible cell separately
        const { u, tex } = gl;
        u.uFrom.value = tex[shown];
        u.uTo.value = tex[index];
        run?.kill();
        const p = { t: 0 };
        run = gsap.to(p, {
          t: 1,
          duration: S.options.speed / 1000,
          ease: "power3.out",
          onUpdate: () => {
            u.uProgress.value = p.t;
            gl.render();
          },
          onComplete: () => {
            shown = index;
            u.uFrom.value = tex[index];
            u.uProgress.value = 0;
            gl.render();
            done();
          },
        });
      },
      cancel() {
        run?.progress(1);
      },
    };
  };

  const splide = new Splide(slider, {
    type: "fade",
    height: "100%",
    rewind: true,
    autoplay: !reduced,
    interval: 5400,
    speed: 1000,
    arrows: false,
    pagination: false,
    pauseOnHover: false,
    pauseOnFocus: false,
    drag: false,
  });
  splide.mount({}, ShaderFade);
  if (!reduced) splide.Components.Autoplay.pause();
  FT.onReady(() => {
    if (reduced) return;
    gsap.from(frame, { scale: 1.2, duration: 2, ease: "power3.out" });
    gsap.from(heroLogo, { opacity: 0, y: "4rem", duration: 2, ease: "expo.inOut" });
    // The original re-sets the carousel (.1s) after the loader logo clears (.5s), and counts 5.4s from then
    gsap.delayedCall(0.6, () => splide.Components.Autoplay.play());
  });
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to(inner, {
      yPercent: 50,
      opacity: 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        scrub: true,
        onUpdate: (st) => document.body.classList.toggle("is-logo", st.progress > 0.5),
      },
    });
  });
  if (reduced) ScrollTrigger.create({ trigger: hero, start: "center top", onToggle: (st) => document.body.classList.toggle("is-logo", st.isActive || st.progress > 0) });

  /* News slider: arrows move two cards at a time, drag to advance */
  const news = [
    ["Category 03", "2026.00.00", "Your news title here, up to two lines. Ellipsis if long", "Event poster · pink and sky blue graphics · square", ""],
    ["Category 02", "2026.00.00", "Your collaboration news headline here, up to two lines.", "Vertical-text poster · purple background · square", ""],
    ["Category 02", "2026.00.00", "Your seasonal menu news title here", "Burger and pancake plates · Yellow star decoration · Square", ""],
    ["Category 02", "2026.00.00", "Your new dinner menu news here", "Layered dessert tower · neon lighting · square", ""],
    ["Category 03", "2026.00.00", "Your reservations opening news here", "Night event poster · black background with neon lettering · square", ""],
    ["Category 03", "2026.00.00", "Group rate news goes here", "Large plate of meat and waffle fries · from above · square", ""],
    ["Category 03", "2026.00.00", "Your limited-time menu news here.", "Petal-garnished burger · pink background · square", "sns"],
    ["Category 02", "2026.00.00", "Your limited-time event news here.", "Red stand and mascot · pink background · square", "sns"],
  ];
  const igIco = '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="22" height="22" rx="6"/><circle cx="13" cy="13" r="5"/><circle cx="19.4" cy="6.6" r="1" fill="currentColor"/></svg>';
  const track = document.querySelector(".nw__track");
  track.innerHTML = news
    .map(
      ([c, d, t, l, sns]) => {
        const body = `<div class="ft-card__img"><div class="wf-img" data-label="${l}"></div>${sns ? `<span class="ft-card__ico">${igIco}</span>` : ""}</div>
        <div class="ft-card__meta"><small class="ft-card__cat">${c}</small><time class="ft-card__date">${d}</time></div>
        <p class="ft-card__t">${t}</p>`;
        // SNS posts open a modal instead of going to a URL, like the original
        return `<div class="nw__slide">${sns ? `<div class="ft-card" data-ft-modal="instagram" role="button" tabindex="0">${body}</div>` : `<a class="ft-card" href="news.html" draggable="false">${body}</a>`}</div>`;
      }
    )
    .join("");
  // Same Embla as the original (loop off · horizontal · left-aligned · everything else default). Arrows move two slots at a time
  const embla = EmblaCarousel(document.querySelector(".nw__viewport"), { loop: false, axis: "x", align: "start", duration: reduced ? 0 : 25 });
  const prevBtns = document.querySelectorAll(".nw [data-prev]");
  const nextBtns = document.querySelectorAll(".nw [data-next]");
  const syncArrows = () => {
    prevBtns.forEach((b) => (b.disabled = !embla.canScrollPrev()));
    nextBtns.forEach((b) => (b.disabled = !embla.canScrollNext()));
  };
  embla.on("select", syncArrows).on("reInit", syncArrows);
  syncArrows();
  prevBtns.forEach((b) => b.addEventListener("click", () => embla.scrollTo(Math.max(0, embla.selectedScrollSnap() - 2))));
  nextBtns.forEach((b) => b.addEventListener("click", () => embla.scrollTo(Math.min(embla.scrollSnapList().length - 1, embla.selectedScrollSnap() + 2))));

  /* Station map: starts at the right end, drag to scroll and the bar below follows */
  const sc = document.querySelector(".sm__scroller");
  const thumb = document.querySelector(".sm__thumb");
  const trackBar = document.querySelector(".sm__track");
  const sync = () => {
    const max = sc.scrollWidth - sc.clientWidth;
    thumb.style.right = `${80 * (1 - (max ? sc.scrollLeft / max : 1))}%`;
  };
  sc.scrollLeft = sc.scrollWidth;
  sync();
  sc.addEventListener("scroll", sync);
  let pan = null;
  sc.addEventListener("mousedown", (e) => (pan = { x: e.pageX, l: sc.scrollLeft }));
  sc.addEventListener("mousemove", (e) => {
    if (!pan) return;
    e.preventDefault();
    sc.scrollLeft = pan.l - (e.pageX - pan.x);
  });
  ["mouseup", "mouseleave"].forEach((t) => sc.addEventListener(t, () => (pan = null)));
  let bar = false;
  thumb.addEventListener("mousedown", (e) => {
    bar = true;
    e.stopPropagation();
  });
  document.addEventListener("mousemove", (e) => {
    if (!bar) return;
    const r = trackBar.getBoundingClientRect();
    sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) * (Math.max(0, Math.min(e.clientX - r.left, r.width)) / r.width);
  });
  document.addEventListener("mouseup", () => (bar = false));

  /* Course: the first section stays pinned and is cut off from below as it rises, the photo has -15svh parallax, text rises from 4rem below */
  mm.add({ d: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", m: "(max-width: 767px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
    const arts = gsap.utils.toArray(".cs__item");
    if (ctx.conditions.d) gsap.to(arts[0], { clipPath: "inset(0% 0% 100% 0%)", ease: "none", scrollTrigger: { trigger: arts[0], start: "top top", scrub: true } });
    arts.forEach((a) => {
      const inner = a.querySelector(".cs__in");
      gsap.from(inner, { y: "4rem", opacity: 0, scrollTrigger: { trigger: ctx.conditions.d ? a : inner, start: ctx.conditions.d ? "top+=70% bottom" : "top bottom" } });
      if (ctx.conditions.d) gsap.to(a.querySelector(".cs__img .wf-img"), { y: "-15svh", ease: "none", scrollTrigger: { trigger: a, start: "top bottom", scrub: true } });
    });
  });

  /* Room picker */
  const cars = [
    ["Entrance", "Entrance", "Entrance past the ticket gate onto the platform · logo on the floor · daytime natural light · landscape 4:3", "Your entrance intro here. Describe in two or three lines what awaits once you buy a ticket and step in. Add a third line here.", -720],
    ["Car 1", "Car 1", "Car 1 cabin overview · round windows and pink seats · indoor light · landscape 4:3", "Your intro for car 1 here in two lines.\nYour second line here.", -620],
    ["Car 2 - Area Name", "Car 2", "Express seating row chairs · aisle perspective · neon lighting · landscape 4:3", "Your intro for car 2 here in two lines.\nYour second line here.", -480],
    ["Shop", "Shop", "Souvenir display · mascot dolls · bright lighting · landscape 4:3", "Your shop intro goes here in two lines. Your second line goes here.", -440],
    ["Car 3 - Seat Name", "Car 3", "Two rows of booth seating · facing chairs · warm lighting · landscape 4:3", "Two lines introducing the partitioned seats here. Put the second line here.", -340],
    ["Car 3 - Bar Name", "Car 3", "Bar counter and tall stools · pink neon · side view · landscape 4:3", "Your two-line bar intro goes here. Your second line goes here.", -240],
    ["Car 3 - Front Seats", "Car 3", "Window seat with the train’s front visible · daytime natural light · landscape 4:3", "Your front platform-seat intro goes here in two lines. Your second line goes here.", -180],
    ["Terrace", "Terrace", "Outdoor terrace overlooking railway tracks · sky · wide composition · landscape 4:3", "Add a two-line terrace intro here. Add the second line here.", -20],
  ];
  // Original desktop: eight tabs stand overlapping in a 4.875rem strip (higher numbers on the left), and the panels stack overlapping beside it.
  // Choosing forward pushes the passed tab 51rem to the right so it becomes a right-hand strip, and the passed panel is uncovered with --clip-right 0→100% (1.1s expo), and
  // The picked plate moves 4.875rem to the left. Picking backward reverses it (1s expo.out, only the last plate .1s later). Only two plates are drawn: the picked one and the current one.
  // The train picture above slides to each car’s set position in .6s ease-in-out and the name tags follow. rem is screen width/90 like the original.
  const TRAIN_X = [-1100, -990, -670, -650, -430, -380, -360, -10];
  const MARK_X = [205, 80, 120, 140, 90, 50, 40, 120];
  const rem = () => innerWidth / 90;
  const plusIco = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 1v14M1 8h14"/></svg>';
  // Phone: tapping each row’s color tab opens that row (.6s ease-in-out), and the train image strip moves to that row’s position and sticks
  const trainSvg = document.querySelector(".sp__train").innerHTML;
  const mRow = document.querySelector(".cr__row");
  mRow.innerHTML = cars
    .map(
      ([t, sub, l, d, tx], i) => `<div class="car" style="--c: var(--site-car-${i + 1}); --tx: ${tx}px; z-index: ${i + 1}">
        <button class="car__tab" type="button" aria-expanded="false"><b>${t}</b><small>${sub}</small></button>
        <div class="car__body">
          <div class="wf-img" data-label="${l}"></div>
          <div class="car__train" aria-hidden="true">${trainSvg}</div>
          <div class="car__cap"><b class="ft-d"><span>${t}</span></b><p>${d.replace(/\n/g, "<br>")}</p></div>
        </div></div>`
    )
    .join("");
  const mCars = [...mRow.children];
  mCars.forEach((c, i) => c.querySelector(".car__tab").addEventListener("click", () => pick(i)));
  const deskRow = document.querySelector(".crd");
  const N = cars.length;
  deskRow.innerHTML = cars
    .map(([t, sub, l, d], i) => {
      const idx = N - i - 1;
      return `<button class="crd__tab${i === N - 1 ? " is-last" : ""}" type="button" style="--i: ${idx}; --c: var(--site-car-${i + 1}); z-index: ${(N - i) * 2 - 1}" aria-label="${t}">
          <span class="crd__lab"><span class="crd__head"><span class="crd__plus">${plusIco}</span><b class="ft-d"><span>${t}</span></b></span><span class="crd__sub">${sub}</span></span>
        </button>
        <div class="crd__pan" style="--i: ${idx}; --o: ${i ? 1 : 0}; --clip-right: 0%; z-index: ${(N - i) * 2}">
          <div class="wf-img" data-label="${l}"></div>
          <div class="crd__cap"><h4><b class="ft-d"><span>${t}</span></b><small>${sub}</small></h4><p>${d.replace(/\n/g, "<br>")}</p></div>
        </div>`;
    })
    .join("");
  const dTabs = [...deskRow.querySelectorAll(".crd__tab")];
  const dPans = [...deskRow.querySelectorAll(".crd__pan")];
  const trainImg = document.querySelector(".sp__train");
  const spMark = document.querySelector(".sp__mark");
  const spTitle = document.querySelector("[data-sp-title]");
  const spSub = document.querySelector("[data-sp-sub]");
  const steps = document.querySelectorAll(".sp__steps button");
  let sel = 0;
  let placed = false;
  const place = (C, instant) => {
    const from = sel;
    const fwd = from - C <= 0;
    const u = rem();
    const s = { duration: instant ? 0 : 1, ease: "expo.out" };
    dPans.forEach((p, i) => gsap.set(p, { visibility: i === C || i === from ? "visible" : "hidden" }));
    dTabs.forEach((t, i) => gsap.to(t, { x: i < C ? 51 * u : 0, ...s }));
    dPans.forEach((p, i) => {
      const late = !fwd && i === N - 1 && C !== N - 1 && !instant ? 0.1 : 0;
      gsap.to(p, { x: i === C && C !== 0 ? -4.875 * u : 0, ...s, delay: late });
      gsap.to(p, i < C ? { "--clip-right": "100%", duration: instant ? 0 : 1.1, ease: "expo.out" } : { "--clip-right": "0%", ...s });
    });
    trainImg.style.translate = `${TRAIN_X[C] * 0.25 * u}px 0`;
    // In the original the label sits at 200 only at first, then moves to the cell position once chosen
    spMark.style.left = `${(placed ? MARK_X[C] : 200) * 0.25 * u}px`;
    placed = true;
  };
  const pick = (k, instant = reduced) => {
    const C = Math.max(0, Math.min(N - 1, k));
    if (desk.matches) place(C, instant);
    sel = C;
    mCars.forEach((c, i) => {
      c.classList.toggle("is-open", i === C);
      c.querySelector(".car__tab").setAttribute("aria-expanded", i === C);
    });
    spTitle.textContent = cars[C][0];
    spSub.textContent = cars[C][1];
    // Original buttons: Back locks to a white background on the last item, Forward on the first
    steps[0].classList.toggle("is-end", C === N - 1);
    steps[1].classList.toggle("is-end", C === 0);
  };
  dTabs.forEach((t, i) => t.addEventListener("click", () => pick(i)));
  steps[0].addEventListener("click", () => sel < N - 1 && pick(sel + 1));
  steps[1].addEventListener("click", () => sel > 0 && pick(sel - 1));
  pick(0, true);
  const replace = () => {
    if (!desk.matches) return;
    placed = sel !== 0;
    place(sel, true);
  };
  desk.addEventListener("change", replace);
  addEventListener("resize", replace);
})();
