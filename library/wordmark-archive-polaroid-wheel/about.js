// About: hero horizontal text strip and entrance, section title line rise, card row sideways flow (scroll + drag), resource list hover,
// Auto-advancing slides for Principles (7s) and Uses (7.5s).
CRL.page("about", (view, life) => {
  const { Strip, fontsReady, reduce, splitLines } = CRL;
  const mm = gsap.matchMedia();

  // ── 1. Hero band: gray, horizontal, flows on its own and the cells shift with the mouse. Stops when off screen
  const heroCanvas = view.querySelector(".ab-hero__strip");
  const strip = new Strip({ canvas: heroCanvas, text: "ABOUT", orientation: "horizontal", color: "--site-brand", hover: true, opacity: { value: 0 }, baseSpeed: reduce ? 0 : 0.02 });
  life.add(() => strip.dispose());
  // On leaving (original about transitionOut): if scrolled down more than half a screen, immediately, otherwise it erases the strip and text plane over .5s sine.inOut
  life.leave(() => {
    const fade = [strip.opacity, ...(textGL ? [textGL.opacity] : [])];
    if (scrollY > 0.5 * innerHeight || reduce) gsap.set(fade, { value: 0 });
    else gsap.to(fade, { value: 0, duration: 0.5, ease: "sine.inOut", overwrite: true });
  });
  let heroOn = true;
  let textGL = null;
  const heroIO = new IntersectionObserver(([e]) => (heroOn = e.isIntersecting));
  heroIO.observe(heroCanvas);
  life.add(() => heroIO.disconnect());
  let last = performance.now();
  life.tick(() => {
    const now = performance.now();
    const dt = Math.min(now - last, 50) / 1000;
    last = now;
    if (!heroOn) return;
    strip.update(dt);
    textGL?.update();
    strip.draw();
  });

  // ── Shared by principle and usage slides: when the progress bar fills, move to the next. Prev/next buttons restart the bar
  function autoSlide({ count, dur, bar, cur, prev, next, onChange }) {
    let i = 0;
    let tw;
    const go = (n) => {
      i = (n + count) % count;
      if (cur) cur.textContent = i + 1;
      onChange(i);
      run();
    };
    const run = () => {
      tw?.kill();
      if (reduce) return;
      gsap.to(bar, { scaleX: 0, duration: 0.3, ease: "power2.out", overwrite: true });
      tw = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: dur, ease: "none", delay: 0.3, onComplete: () => go(i + 1) });
    };
    prev?.addEventListener("click", () => go(i - 1));
    next?.addEventListener("click", () => go(i + 1));
    ScrollTrigger.create({ trigger: bar, start: "top bottom", once: true, onEnter: run });
    return { go };
  }

  // Shared action for swapping lines: the outgoing line goes -110% (.3s), new text goes in, the line is re-split and moves 110%→0 (.8s .035 stagger power3.out)
  function swapText(els, texts) {
    const outs = els.flatMap((el) => el._split?.lines ?? [el]);
    return gsap.timeline()
      .to(outs, { yPercent: -110, duration: 0.3, ease: "power2.in", stagger: 0.01 })
      .add(() => {
        els.forEach((el, k) => {
          el._split?.revert();
          el.innerHTML = texts[k];
          el._split = splitLines(el);
        });
        gsap.fromTo(els.flatMap((el) => el._split.lines), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.035, ease: "power3.out" });
      });
  }

  // ── 4. Principles slides (4 slides)
  const PRIN = [
    ["”Put about seven lines of a quotation here. There is no need to start from scratch — just nudge what already exists a little forward, and write down the idea that novelty arises in the gap where perspective, context and timing shift.”", "Your speaker here<br>”Your source title here”", "0000", "Speaker at a lectern · denim shirt · dark stage · portrait"],
    ["“Your second principle quote here, about six lines. Spending little and savoring it long takes your thinking further.”", "Your speaker 2 here<br>”Source Title 2 Here”", "0000", "Artist by the studio window · side profile · afternoon light · portrait"],
    ["“Your third principle quote here, about five lines long. Good ingredients change the question more than they give the answer.”", "Your speaker 3 here<br>”Source Title 3 Here”", "0000", "In front of a recording studio console · back view · red light · portrait"],
    ["“Your fourth principle quote goes here, about six lines long. It says that revisiting the same thing many times is what sets a standard.”", "Your speaker 4 here<br>”Source Title 4 Here”", "0000", "B&W portrait · notebook in hand · coarse grain · portrait"],
  ];
  const pQuote = view.querySelector("[data-p-quote]");
  const pBy = view.querySelector("[data-p-by]");
  const pImg = view.querySelector("[data-p-img]");
  const pNum = view.querySelector("[data-p-num]");
  const pYear = view.querySelector("[data-p-year]");

  // ── 6. Uses slides (3 slides)
  const UC = [
    ["“Your quote showing how it is used goes here. It says that what lasts is leaning on what you truly love rather than on what others might think, in about nine lines. Even if it looks strange, even if no one knows at first.”", "— Speaker named here<br>(Your source here)", "Person on stage · seated and gesturing · potted plant · portrait 3:4"],
    ["“Your second quote goes here. It’s a passage of about seven lines on not waiting for anyone’s permission and following your own instinct all the way through.”", "— Your speaker name 2 here<br>(Your source 2 here)", "Talk show screen · two people on black background · portrait 3:4"],
    ["”Your third quote here. It says that rather than building something entirely new, you evolve what already exists bit by bit, in about eight lines.”", "— Your speaker name 3 here<br>(Your source 3 here)", "Lecture hall podium · side lighting · portrait 3:4"],
  ];
  const uQuote = view.querySelector("[data-u-quote]");
  const uNum = view.querySelector("[data-u-num]");
  const uBy = view.querySelector("[data-u-by]");
  const uImg = view.querySelector("[data-u-img]");
  const uCols = [...view.querySelectorAll("[data-u-col]")];

  const clipIn = (el, ease) => gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease });

  // ── Creator card plane (original CreativeSlider): bake the whole card into a canvas and put it on a GL plane (32×32 cells), in a perspective camera (fov 45, z 1) space,
  //    x += sin(y/screen width·π+π/2)·−strength·.55, z −= It bends as −cos(x/screen height·π+π/2)·−strength·1.25 (strength = .15 × pull, pull is the following gap / card spacing ±1.2 in steps of .1).
  //    When strength exceeds .05 it blurs into 6 horizontal taps (smoothstep(.05,.5,|strength|)·|strength|·2·2). The DOM card only holds the spot and is hidden.
  const CREATIVE_VERT = `
    uniform float uStrength;
    uniform vec2 uView;
    varying vec2 vUv;
    void main() {
      vec4 p = modelViewMatrix * vec4(position, 1.0);
      float dx = sin(p.y / uView.x * 3.14159265 + 1.5707963) * -uStrength;
      float dz = -cos(p.x / uView.y * 3.14159265 + 1.5707963) * -uStrength;
      p.x += dx * 0.55;
      p.z -= dz * 1.25;
      vUv = uv;
      gl_Position = projectionMatrix * p;
    }`;
  const CREATIVE_FRAG = `
    uniform sampler2D uCard;
    uniform float uStrength;
    varying vec2 vUv;
    void main() {
      float s = abs(uStrength);
      float amt = smoothstep(0.05, 0.5, s) * s * 2.0 * 2.0;
      vec4 c = vec4(0.0);
      if (amt < 0.001) c = texture2D(uCard, vUv);
      else for (int i = 0; i < 6; i++) c += texture2D(uCard, vUv + vec2((float(i) / 5.0 - 0.5) * amt, 0.0)) / 6.0;
      gl_FragColor = c;
    }`;
  // Bakes one card onto a canvas just as it is in the DOM — painted background (including circles), photo placeholder, text
  function bakeCard(card) {
    const r = card.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const c = Object.assign(document.createElement("canvas"), { width: Math.ceil(r.width * dpr), height: Math.ceil(r.height * dpr) });
    const g = c.getContext("2d");
    g.scale(dpr, dpr);
    const colorIn = (el, expr) => { const p = document.createElement("i"); p.style.cssText = `display:none;color:${expr}`; el.append(p); const v = getComputedStyle(p).color; p.remove(); return v; };
    [card, ...card.querySelectorAll("*")].forEach((el) => {
      const cs = getComputedStyle(el), b = el.getBoundingClientRect(), x = b.left - r.left, y = b.top - r.top;
      if (el.classList.contains("wf-img")) {
        g.fillStyle = colorIn(el, "var(--wf-fill)"); g.fillRect(x, y, b.width, b.height);
        g.strokeStyle = colorIn(el, "var(--wf-line)"); g.lineWidth = 1;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + b.width, y + b.height); g.moveTo(x + b.width, y); g.lineTo(x, y + b.height); g.stroke();
        g.fillStyle = colorIn(el, "var(--wf-fill-ink)"); g.font = `500 12px ${cs.getPropertyValue("--kf-font-mono").trim() || "monospace"}`; g.textAlign = "center";
        g.fillText(el.dataset.label || "", x + b.width / 2, y + b.height / 2, b.width * 0.9);
        g.textAlign = "left";
        return;
      }
      if (cs.backgroundColor !== colorIn(el, "transparent")) {
        g.fillStyle = cs.backgroundColor;
        if (parseFloat(cs.borderTopLeftRadius) >= b.width / 2 - 0.5) { g.beginPath(); g.ellipse(x + b.width / 2, y + b.height / 2, b.width / 2, b.height / 2, 0, 0, Math.PI * 2); g.fill(); }
        else g.fillRect(x, y, b.width, b.height);
      }
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        const tb = range.getBoundingClientRect();
        // Canvas font shorthand accepts width only as a keyword — values like 125% are set separately with fontStretch
        g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        g.fontStretch = parseFloat(cs.fontStretch) > 112 ? "expanded" : parseFloat(cs.fontStretch) < 90 ? "condensed" : "normal";
        g.fillStyle = cs.color;
        g.textBaseline = "middle";
        g.fillText(n.textContent.trim(), tb.left - r.left, tb.top - r.top + tb.height / 2);
      }
    });
    return c;
  }
  function creativePlanes(host, cards) {
    if (!cards.length) return null;
    const canvas = document.createElement("canvas");
    canvas.className = "ab-creatives__gl";
    canvas.setAttribute("aria-hidden", "true");
    host.append(canvas);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setClearColor(0, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 1;
    const uView = { value: new THREE.Vector2(1, 1) }, uStrength = { value: 0 };
    const geo = new THREE.PlaneGeometry(1, 1, 32, 32);
    const planes = cards.map((card) => {
      const tex = new THREE.CanvasTexture(bakeCard(card));
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: CREATIVE_VERT, fragmentShader: CREATIVE_FRAG, uniforms: { uCard: { value: tex }, uStrength, uView }, transparent: true, depthWrite: false }));
      m.frustumCulled = false;
      scene.add(m);
      return { card, m, tex };
    });
    host.classList.add("is-gl");
    let W = 1, H = 1, vw = 1, vh = 1, pull = 0, on = true;
    const size = () => {
      const r = host.getBoundingClientRect();
      W = r.width; H = r.height;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      vh = 2 * Math.tan((45 * Math.PI) / 360);
      vw = vh * camera.aspect;
      uView.value.set(vw, vh);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(host);
    const io = new IntersectionObserver(([e]) => (on = e.isIntersecting));
    io.observe(host);
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth) || 1;
    return {
      update(lag) {
        pull += 0.1 * (Math.max(-1.2, Math.min(1.2, lag / step())) - pull);
        if (!on) return;
        uStrength.value = 0.15 * pull;
        const hr = host.getBoundingClientRect();
        for (const p of planes) {
          const b = p.card.getBoundingClientRect();
          p.m.position.set(((b.left + b.width / 2 - hr.left) / W) * vw - vw / 2, vh / 2 - ((b.top + b.height / 2 - hr.top) / H) * vh, 0);
          p.m.scale.set((b.width / W) * vw, (b.height / H) * vh, 1);
        }
        renderer.render(scene, camera);
      },
      dispose() {
        ro.disconnect(); io.disconnect();
        planes.forEach((p) => { p.m.material.dispose(); p.tex.dispose(); });
        geo.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      },
    };
  }

  // While waiting for the font, hide the header text so it doesn’t flash in the fallback font first (the original is also empty until the text plane is ready)
  const heroText = view.querySelector("[data-ab-lines]");
  if (!reduce) gsap.set([heroText, ...view.querySelectorAll("[data-ab-btm], .ab-index a")], { autoAlpha: 0 });

  fontsReady.then(life.wrap(() => {
    strip.resize();

    // Section title·paragraph: line by line from 115% below, 1.25s with .045 stagger
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      view.querySelectorAll("[data-reveal]").forEach((el) => {
        const s = splitLines(el);
        gsap.set(s.lines, { yPercent: 115 });
        ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(s.lines, { yPercent: 0, duration: 1.25, stagger: 0.045, ease: "power3.out" }) });
      });
    });

    // ── Hero entrance (original about:intro): large paragraph lines at .6 for 1.35s with .045 stagger · contents lines 1.6s .08 power3.inOut ·
    //    band +.3 2s sine.out · bottom-right text 1.4 1s at .1 intervals
    const titleSplit = splitLines(view.querySelector("[data-ab-lines]"));
    const rules = view.querySelectorAll(".ab-rule");
    const btm = view.querySelectorAll("[data-ab-btm], .ab-index a");
    if (reduce) {
      strip.opacity.value = 1;
    } else {
      gsap.set(titleSplit.lines, { yPercent: 115 });
      gsap.set(heroText, { autoAlpha: 1 });
      // With a mouse, like the original About scene, moves the big paragraph lines · right-hand text (per screen line) · contents numbers and titles · contents lines onto the GL plane of the band scene
      // Staggered on the same grid as the strip. The right text and contents use the DOM entrance below (autoAlpha·y), and the plane reads the line’s scaleX.
      if (!CRL.isMobile() && matchMedia("(hover: hover)").matches) {
        const lead = view.querySelector(".ab-hero__lead");
        textGL = new CRL.TextPlanes(strip, [
          ...titleSplit.lines.map((el) => ({ el, mode: "line" })),
          { el: lead, mode: "lines", follow: lead },
          ...[...view.querySelectorAll(".ab-index a")].flatMap((a) => [...a.children].map((el) => ({ el, mode: "line", follow: a }))),
          ...[...rules].map((el) => ({ el, mode: "rule" })),
        ], [heroText]);
      }
      gsap.set(rules, { scaleX: 0 });
      gsap.set(btm, { autoAlpha: 0, y: 40 });
      gsap.timeline({ delay: CRL.arrived && !CRL.taxi ? 0.2 : 0 })
        .to(titleSplit.lines, { yPercent: 0, duration: 1.35, stagger: 0.045, ease: "power3.out" }, 0.6)
        .to(rules, { scaleX: 1, duration: 1.6, stagger: 0.08, ease: "power3.inOut" }, "<")
        .fromTo(strip.opacity, { value: 0 }, { value: 1, duration: 2, ease: "sine.out" }, "<+.3")
        .to(btm, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out" }, 1.4);
    }

    // ── 2. Card row: while the section passes the screen it flows 28vw → -32vw (scrub), and dragging carries it that much further
    const track = view.querySelector("[data-track]");
    const vp = view.querySelector(".ab-creatives__viewport");
    const st = { scroll: 0, drag: 0, dragTo: 0 };
    if (!reduce) {
      ScrollTrigger.create({
        trigger: ".ab-creatives", start: "top bottom", end: "bottom top",
        onUpdate: (self) => (st.scroll = gsap.utils.interpolate(innerWidth * 0.28, -innerWidth * 0.32, self.progress)),
      });
    }
    let down = null;
    vp.addEventListener("pointerdown", (e) => { down = { x: e.clientX, d: st.dragTo }; vp.setPointerCapture(e.pointerId); });
    vp.addEventListener("pointermove", (e) => {
      if (!down) return;
      const max = track.scrollWidth - innerWidth * 0.5;
      st.dragTo = gsap.utils.clamp(-max, innerWidth * 0.2, down.d + (e.clientX - down.x));
    });
    vp.addEventListener("pointerup", () => (down = null));
    // The track follows the target position (scroll + drag) by .1 per frame. Like the original virtual scroll slider, the lag bends the cards
    let trackX = null;
    life.tick(() => {
      st.drag += (st.dragTo - st.drag) * 0.1;
      const goal = st.scroll + st.dragTo;
      trackX = trackX == null ? goal : trackX + (goal - trackX) * 0.1;
      track.style.transform = `translate3d(${reduce ? st.scroll + st.drag : trackX}px,0,0)`;
      creativesGL?.update(trackX - goal);
    });
    const creativesGL = !reduce && !CRL.isMobile() ? creativePlanes(vp, [...track.children]) : null;
    if (creativesGL) life.add(() => creativesGL.dispose());

    // ── 3. Resource list: the hovered row turns black (.4s), and the cover rises from below after .25
    const items = [...view.querySelectorAll(".ab-res__item")];
    const activate = (it) => {
      if (it.classList.contains("is-active")) return;
      items.forEach((o) => o.classList.toggle("is-active", o === it));
      if (!reduce) gsap.fromTo(it.querySelectorAll(".ab-res__cover"), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: "power3.out", delay: 0.25 });
    };
    items.forEach((it) => {
      it.addEventListener("mouseenter", () => matchMedia("(hover: hover)").matches && activate(it));
      it.addEventListener("click", () => activate(it));
    });

    // ── 4·6. Slides
    autoSlide({
      count: PRIN.length, dur: 7,
      bar: view.querySelector("[data-p-bar]"), cur: view.querySelector("[data-p-cur]"),
      prev: view.querySelector("[data-p-prev]"), next: view.querySelector("[data-p-next]"),
      onChange: (i) => {
        const [q, by, year, photo] = PRIN[i];
        swapText([pQuote, pBy], [q, by]);
        gsap.to([pNum, pYear], { yPercent: -110, autoAlpha: 0, duration: 0.3, ease: "power2.in", onComplete: () => {
          pNum.textContent = i + 1; pYear.textContent = year;
          gsap.fromTo([pNum, pYear], { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });
        } });
        pImg.querySelector(".wf-img").dataset.label = photo;
        clipIn(pImg, "power4.inOut");
      },
    });
    autoSlide({
      count: UC.length, dur: 7.5,
      bar: view.querySelector("[data-u-bar]"), cur: view.querySelector("[data-u-cur]"),
      prev: view.querySelector("[data-u-prev]"), next: view.querySelector("[data-u-next]"),
      onChange: (i) => {
        const [q, by, photo] = UC[i];
        uNum.textContent = `(${i + 1})`;
        swapText([uQuote, uBy], [q, by]);
        uImg.querySelector(".wf-img").dataset.label = photo;
        clipIn(uImg, "expo.inOut");
        uCols.forEach((c, k) => c.classList.toggle("is-active", k === i));
        gsap.to(view.querySelector("[data-u-bar]"), { x: uCols[i].offsetLeft - uCols[0].offsetLeft, duration: 0.8, ease: "expo.inOut" });
      },
    });

  }));
});
