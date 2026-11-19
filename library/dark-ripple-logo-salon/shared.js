// Motion shared by all pages: Lenis, loader (counter → two curved curtains), header entrance, title letter raise,
// Block entrance, text turning gray→white one character at a time, marquee, parallax, photo scroll distortion (three.js), anchor scrolling.
// The page side hooks into loader stages with SZ.onReveal · SZ.onMvShow · SZ.onTitleShow.
(() => {
  const SZ = (window.SZ = {});

  // Resolves skin variables into real colors — even variables made with color-mix or oklch(from …) come out as rgb that the canvas and GSAP can read
  const probe = document.createElement("i");
  probe.style.display = "none";
  SZ.color = (name, scope = document.body) => {
    scope.append(probe);
    probe.style.color = `var(${name})`;
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };

  // Logo mark (δ shape) — footer SVG and hero canvas use the same line. viewBox 0 0 100 134
  SZ.mark = {
    w: 100,
    h: 134,
    // Original mark’s silhouette proportions — the ring is the left 3/4, the top loop is upper left (.1~.55 of the width). So the cursor reaction lands in the same cell as the original
    ring: "M76 93a38 38 0 1 1-76 0a38 38 0 1 1 76 0Z M59 92a21 21 0 1 0-42 0a21 21 0 1 0 42 0Z",
    neck: "M46 58C30 48 12 36 10 21C8 8 20 0 32 0C43 0 51 6 55 14L52 16C47 9 40 5 32 5C25 5 21 11 24 19C28 30 60 44 74 80Z",
  };
  document.querySelectorAll(".sz-mark-ring").forEach((p) => p.setAttribute("d", SZ.mark.ring));
  document.querySelectorAll(".sz-mark-neck").forEach((p) => p.setAttribute("d", SZ.mark.neck));

  const stages = { complete: false, mvshow: false, titleshow: false, revealed: false };
  const waiters = { complete: [], mvshow: [], titleshow: [], revealed: [] };
  const fire = (k) => {
    stages[k] = true;
    waiters[k].splice(0).forEach((fn) => fn());
  };
  const when = (k) => (fn) => (stages[k] ? fn() : waiters[k].push(fn));
  SZ.onComplete = when("complete");
  SZ.onMvShow = when("mvshow");
  SZ.onTitleShow = when("titleshow");
  SZ.onReveal = when("revealed");

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const mm = gsap.matchMedia();

  // ---- Text splitting ----
  // Title: keep each word as one chunk (no line-break splits) and wrap so each letter can be lifted. <br>·Leave the inner span as is
  const splitChars = (root) => {
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(document.createTextNode(" "));
            const word = document.createElement("span");
            word.className = "wd";
            word.style.display = "inline-block";
            word.style.whiteSpace = "nowrap";
            [...part].forEach((c) => {
              const wrap = document.createElement("span");
              wrap.className = "ch-wrap";
              const ch = document.createElement("span");
              ch.className = "ch";
              ch.textContent = c;
              wrap.append(ch);
              word.append(wrap);
              chars.push(ch);
            });
            frag.append(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.nodeName !== "BR") walk(n);
      });
    };
    walk(root);
    return chars;
  };

  // Body text: keeps line breaks and wraps only the characters
  const splitReveal = (root) => {
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const c of n.textContent) {
            if (c === "\n" || c === "\t" || c === "\r") continue;
            if (c === " " || c === "　") {
              frag.append(document.createTextNode(c));
              continue;
            }
            const s = document.createElement("span");
            s.className = "sz-rc";
            s.textContent = c;
            frag.append(s);
            chars.push(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.nodeName !== "BR") walk(n);
      });
    };
    walk(root);
    return chars;
  };

  // ---- Lenis ---------------------------------------------------------------
  let lenis = null;
  const startLenis = () => {
    if (lenis || typeof Lenis === "undefined") return;
    lenis = new Lenis({ lerp: 0.1, duration: 1, easing: (t) => 1 - Math.pow(1 - t, 4), smoothTouch: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    SZ.lenis = lenis;
  };
  document.querySelectorAll("a[data-anchor]").forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1 });
      else target.scrollIntoView();
    })
  );

  // ---- Marquee: stretch the same line to three copies and push the first copy .1px left every setInterval(0) ----
  // As in the original — the browser clamps 0ms to 4ms for about 25px/s, slower when the tab goes to the background
  const marquees = [];
  const setupMarquee = (el) => {
    const first = el.children[0];
    if (!first) return;
    const html = el.innerHTML;
    el.insertAdjacentHTML("beforeend", html);
    el.insertAdjacentHTML("beforeend", html);
    marquees.push(first);
  };
  const runMarquees = () =>
    marquees.forEach((first) => {
      let x = 0;
      setInterval(() => {
        first.style.marginLeft = `-${x}px`;
        if (x > first.clientWidth) x = 0;
        x += 0.1;
      }, 0);
    });

  // ---- Photo scroll distortion: the plane’s center sags by scroll speed and RGB splits up and down ----
  // Info photo (data-gl="scroll") is drawn like the original on a single screen-fixed canvas with a perspective camera, so the curved edges extend outside the cell.
  // Hero and stylist photos (data-gl="local") is drawn on a canvas inside its own cell.
  const VERT = `
    varying vec2 vUv;
    uniform float uVel;
    const float PI = 3.14159265;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.x += sin(p.y * PI * (0.0001 * uVel)) * 0.3;
      p.y += cos(p.x * PI) * (-0.0003 * uVel);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  const FRAG = `
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform float uImgAspect;
    uniform float uPlaneAspect;
    uniform float uVel;
    uniform float uOpacity;
    void main() {
      vec2 fit = vec2(min(uPlaneAspect / uImgAspect, 1.0), min(uImgAspect / uPlaneAspect, 1.0));
      vec2 uv = (vUv - 0.5) * fit + 0.5;
      vec2 shift = vec2(0.0, uVel * 0.00005);
      gl_FragColor = vec4(
        texture2D(uTex, uv + shift).r,
        texture2D(uTex, uv + shift * 0.5).g,
        texture2D(uTex, uv).b,
        uOpacity);
    }`;
  const SEGMENTS = 300;

  // With no photo, draw a placeholder (diagonal X + label) in the same shape and distort that image
  const drawPlaceholder = (ph, w, h, dpr) => {
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(w * dpr));
    cv.height = Math.max(1, Math.round(h * dpr));
    const c = cv.getContext("2d");
    c.scale(dpr, dpr);
    c.fillStyle = SZ.color("--wf-fill", ph);
    c.fillRect(0, 0, w, h);
    c.strokeStyle = SZ.color("--wf-line", ph);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(w, h);
    c.moveTo(w, 0);
    c.lineTo(0, h);
    c.stroke();
    const label = ph.dataset.label || "";
    if (label) {
      c.font = `500 12px ${getComputedStyle(ph).getPropertyValue("--wf-mono").trim() || "monospace"}`;
      const bw = c.measureText(label).width + 16.8;
      const bh = 22;
      c.fillStyle = SZ.color("--wf-fill", ph);
      c.fillRect(w / 2 - bw / 2, h / 2 - bh / 2, bw, bh);
      c.fillStyle = SZ.color("--wf-fill-ink", ph);
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(label, w / 2, h / 2 + 0.5);
    }
    return cv;
  };

  const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
  const makeMesh = (T) => {
    const uniforms = {
      uTex: { value: null },
      uImgAspect: { value: 1 },
      uPlaneAspect: { value: 1 },
      uVel: { value: 0 },
      uOpacity: { value: 1 },
    };
    const mesh = new T.Mesh(
      new T.PlaneGeometry(1, 1, SEGMENTS, SEGMENTS),
      new T.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true })
    );
    return { mesh, uniforms };
  };
  // Re-bakes the image whenever the cell size changes: the photo if there is one, otherwise the placeholder
  const feedTexture = (T, fig, uniforms, w, h) => {
    const img = fig.querySelector("img");
    const ph = fig.querySelector(".sz-ph");
    uniforms.uPlaneAspect.value = w / h;
    if (img) {
      if (!uniforms.uTex.value) uniforms.uTex.value = new T.TextureLoader().load(img.currentSrc || img.src);
      uniforms.uImgAspect.value = (img.naturalWidth || w) / (img.naturalHeight || h);
    } else if (ph) {
      if (uniforms.uTex.value) uniforms.uTex.value.dispose();
      uniforms.uTex.value = new T.CanvasTexture(drawPlaceholder(ph, w, h, dpr()));
      uniforms.uImgAspect.value = w / h;
    }
  };

  const glDraws = [];
  const setupLocal = (T, fig) => {
    const canvas = document.createElement("canvas");
    canvas.className = "sz-fig__gl";
    canvas.setAttribute("aria-hidden", "true");
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      return;
    }
    fig.append(canvas);
    renderer.setPixelRatio(dpr());
    renderer.setClearColor(0x000000, 0);
    const camera = new T.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;
    const scene = new T.Scene();
    const { mesh, uniforms } = makeMesh(T);
    scene.add(mesh);
    // Like the original, measures the canvas by the cell’s on-screen size (including transforms) — the hero photo right after the loader ends is measured while scaled up 1.3 times
    // Until the cell size changes again, the photo appears at 1.3x stuck to the top left (as on the original screen)
    const size = () => {
      const r = fig.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      renderer.setSize(w, h, false);
      feedTexture(T, fig, uniforms, w, h);
    };
    size();
    new ResizeObserver(size).observe(fig);
    let visible = true;
    new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(fig);
    fig.classList.add("is-gl");
    glDraws.push((vel) => {
      if (!visible) return;
      uniforms.uVel.value = vel;
      renderer.render(scene, camera);
    });
  };

  const setupFixed = (T, figs) => {
    const wrap = document.createElement("div");
    wrap.className = "sz-gl-fixed";
    wrap.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    wrap.append(canvas);
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      return;
    }
    document.body.append(wrap);
    const view = { w: window.innerWidth, h: window.innerHeight };
    renderer.setPixelRatio(dpr());
    renderer.setSize(view.w, view.h);
    renderer.setClearColor(0x000000, 0);
    // Place a 60° field-of-view camera one screen height away as 1 unit = Screen 1px
    const FOV = 60;
    const distance = (h) => h / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
    const camera = new T.PerspectiveCamera(FOV, view.w / view.h, 0.1, 2000);
    camera.position.z = distance(view.h);
    const scene = new T.Scene();
    const items = figs.map((fig) => {
      const target = fig.querySelector("img, .sz-ph") || fig;
      const { mesh, uniforms } = makeMesh(T);
      scene.add(mesh);
      const size = () => feedTexture(T, fig, uniforms, Math.max(1, target.clientWidth), Math.max(1, target.clientHeight));
      size();
      new ResizeObserver(size).observe(target);
      fig.classList.add("is-gl");
      return { fig, target, mesh, uniforms };
    });
    let timer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        view.w = window.innerWidth;
        view.h = window.innerHeight;
        renderer.setPixelRatio(dpr());
        renderer.setSize(view.w, view.h);
        camera.aspect = view.w / view.h;
        camera.position.z = distance(view.h);
        camera.updateProjectionMatrix();
      }, 200);
    });
    glDraws.push((vel) => {
      for (const it of items) {
        const r = it.target.getBoundingClientRect();
        it.mesh.scale.set(r.width, r.height, 1);
        it.mesh.position.set(r.left - view.w / 2 + r.width / 2, -r.top + view.h / 2 - r.height / 2, 0);
        it.uniforms.uVel.value = vel;
        it.uniforms.uOpacity.value = parseFloat(getComputedStyle(it.fig).opacity) || 0;
      }
      renderer.render(scene, camera);
    });
  };

  const setupGL = () => {
    const T = window.THREE;
    if (!T) return;
    document.querySelectorAll('.sz-fig[data-gl="local"]').forEach((fig) => setupLocal(T, fig));
    const fixed = [...document.querySelectorAll('.sz-fig[data-gl="scroll"]')];
    if (fixed.length) setupFixed(T, fixed);
    if (!glDraws.length) return;
    let lerped = window.scrollY;
    const loop = () => {
      const y = window.scrollY;
      lerped += (y - lerped) * 0.1;
      const vel = y - lerped;
      for (const draw of glDraws) draw(vel);
      requestAnimationFrame(loop);
    };
    loop();
  };

  // ---- Page motion ----
  const titleSplits = [...document.querySelectorAll(".sz-split")].map((el) => ({ el, chars: splitChars(el) }));
  document.querySelectorAll("[data-marquee]").forEach(setupMarquee);

  const intro = () => {
    // Header: the logo clears its blur while the header row drops in from above
    gsap.fromTo(".sz-logo", { opacity: 0, filter: "blur(20px)" }, { duration: 1, ease: "power1.inOut", opacity: 1, filter: "blur(0px)" });
    gsap.fromTo(".sz-header", { yPercent: -100 }, { duration: 1, yPercent: 0 });

    titleSplits.forEach(({ el, chars }) => {
      gsap.set(chars, { yPercent: 305 });
      const rise = () => gsap.to(chars, { duration: 1, ease: "expo.out", yPercent: 0, stagger: 0.042 });
      if (el.dataset.split === "hero") return SZ.onTitleShow(rise);
      ScrollTrigger.create({ trigger: el, start: "top bottom-=25%", once: true, onEnter: rise });
    });

    document.querySelectorAll(".sz-tw").forEach((el) => {
      if (el.closest(".sz-hero")) return SZ.onMvShow(() => el.classList.add("is-show"));
      ScrollTrigger.create({ trigger: el, start: "top bottom-=20%", once: true, onEnter: () => el.classList.add("is-show") });
    });

    const firstInk = SZ.color("--kf-dim");
    const lastInk = SZ.color("--kf-ink");
    document
      .querySelectorAll(".sz-txt, .sz-mname, .sz-mprice, .sz-info__blocks .sz-stitle, .sz-infotext, .sz-attn, .sz-bullets li")
      .forEach((el) => {
        if (el.querySelector(".sz-rc")) return;
        const chars = splitReveal(el);
        if (!chars.length) return;
        gsap.set(chars, { opacity: 0, color: firstInk });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom-=15%", once: true } });
        tl.to(chars, { duration: 0.2, ease: "power2.out", opacity: 1, stagger: 0.025 });
        tl.to(chars, { duration: 0.1, ease: "power2.out", color: lastInk, stagger: 0.025 }, ">+0.05");
      });

    gsap.fromTo(".sz-copy", { opacity: 0, yPercent: 100 }, { duration: 1, ease: "expo.out", opacity: 1, yPercent: 0, scrollTrigger: { trigger: ".sz-footer", start: "top bottom", once: true } });

    document.querySelectorAll(".sz-para").forEach((el) => gsap.to(el, { yPercent: -20, ease: "none", scrollTrigger: { trigger: el, scrub: true } }));
    document.querySelectorAll(".sz-fig[data-plx]").forEach((fig) =>
      gsap.to(fig.querySelectorAll(".sz-ph, .sz-fig__gl"), { yPercent: -10, ease: "none", scrollTrigger: { trigger: fig, scrub: true } })
    );

    runMarquees();
    ScrollTrigger.refresh();
  };

  // Loader: the counter rises by 1~10 every 50~250ms, and when it reaches 100 the curtain lifts
  const loader = document.querySelector(".sz-loader");
  const buildLoaderText = () => {
    const src = document.querySelector(".sz-hero__mq p");
    const text = src ? src.textContent.trim().replace(/\s+/g, " ") : "";
    if (!text || !loader) return null;
    const box = document.createElement("div");
    box.className = "sz-loader__text";
    const track = document.createElement("div");
    track.className = "sz-loader__track";
    for (let i = 0; i < 2; i++) {
      const g = document.createElement("div");
      g.className = "sz-loader__group";
      text.split(" ").forEach((w) => {
        const word = document.createElement("span");
        word.className = "sz-loader__word";
        [...w].forEach((c) => {
          const s = document.createElement("span");
          s.className = "sz-loader__ch";
          s.textContent = c;
          word.append(s);
        });
        g.append(word);
      });
      track.append(g);
    }
    box.append(track);
    loader.append(box);
    return box;
  };

  // Curtain’s bottom edge: while lifting, the center bows down by up to 18
  const curtainPath = (p) => {
    const y = 100 * (1 - p);
    return `M0,0 H100 V${y} Q50,${y + 18 * Math.sin(Math.PI * p)} 0,${y} Z`;
  };
  const makeCurtain = (cls) => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", `sz-loader__curtain ${cls}`);
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", curtainPath(0));
    svg.append(path);
    loader.querySelector(".sz-loader__overlay").append(svg);
    return path;
  };

  const finish = () => {
    if (loader) loader.remove();
    document.body.classList.remove("sz-loading");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    fire("revealed");
  };

  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.body.classList.remove("sz-loading");
    if (loader) loader.remove();
    document.querySelectorAll(".sz-tw, .sz-ahead").forEach((el) => el.classList.add("is-show"));
    fire("mvshow");
    fire("titleshow");
    fire("revealed");
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.body.classList.remove("sz-loading");
    startLenis();
    if (lenis) lenis.stop();
    SZ.onComplete(watchGL);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const count = loader && loader.querySelector(".sz-loader__count");
    if (!loader || !count) {
      fire("complete");
      intro();
      fire("mvshow");
      fire("titleshow");
      finish();
      return;
    }
    const overlay = loader.querySelector(".sz-loader__overlay");
    const main = makeCurtain("sz-loader__curtain--main");
    const accent = makeCurtain("sz-loader__curtain--accent");
    overlay.style.background = "transparent";
    const text = buildLoaderText();
    if (text) {
      gsap.fromTo(text.querySelectorAll(".sz-loader__ch"), { yPercent: 0, y: 0 }, { yPercent: 0, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.05, delay: 0.3 });
      gsap.to(text.querySelector(".sz-loader__track"), { xPercent: -50, duration: 25, ease: "none", repeat: -1 });
    }
    const outro = () => {
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(count, { yPercent: -60, opacity: 0, duration: 0.8, delay: 0.3, ease: "power3.inOut" });
      if (text) tl.to(text, { yPercent: -60, opacity: 0, duration: 0.8, ease: "power3.inOut" }, "<");
      tl.addLabel("sweep", "-=0.25");
      const a = { p: 0 };
      const b = { p: 0 };
      tl.to(a, { p: 1, duration: 1, ease: "expo.inOut", onUpdate: () => main.setAttribute("d", curtainPath(a.p)) }, "sweep");
      tl.to(b, { p: 1, duration: 1, ease: "expo.inOut", onUpdate: () => accent.setAttribute("d", curtainPath(b.p)) }, "sweep+=0.12");
      tl.call(() => fire("mvshow"), null, "sweep+=0.35");
      tl.fromTo(".sz-hero__img", { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.25, ease: "expo.out", clearProps: "clipPath" }, "sweep+=0.6");
      tl.fromTo(".sz-hero__fig", { scale: 1.3, transformOrigin: "50% 50%" }, { scale: 1, duration: 1.6, ease: "expo.out", clearProps: "transform" }, "sweep+=0.6");
      tl.call(() => fire("titleshow"), null, "sweep+=1.6");
    };
    let n = 0;
    const tick = () => {
      if (n >= 100) {
        fire("complete");
        intro();
        outro();
        return;
      }
      n = Math.min(n + Math.floor(Math.random() * 10) + 1, 100);
      count.textContent = String(n);
      setTimeout(tick, Math.floor(Math.random() * 200) + 50);
    };
    tick();
  });

  // Show the photo distortion when the first photo gets close (within two screens up or down)
  function watchGL() {
    const first = document.querySelector(".sz-fig[data-gl]");
    if (!first) return;
    const io = new IntersectionObserver(
      (en) => {
        if (!en.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setupGL();
      },
      { rootMargin: "200% 0px 200% 0px" }
    );
    io.observe(first);
  }
})();
