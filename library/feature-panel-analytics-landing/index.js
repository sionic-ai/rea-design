// Home — hero bars filling up, product screen tabs, logo flow, scroll transitions of the pinned feature panel, quote tabs, 3D report book
(() => {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = window.mpEase || "power2.out";
  const mm = gsap.matchMedia();

  // Product screen tabs — on press (Enter and Space too) the plate changes at once. The first tab’s gradient name sweeps past once when the hand leaves
  document.querySelectorAll("[data-tabs]").forEach((box) => {
    const tabs = [...box.querySelectorAll(".mp-dash__tab")];
    const panes = [...box.querySelectorAll(".mp-dash__pane")];
    const pick = (i) => {
      tabs.forEach((o, k) => { o.classList.toggle("is-on", k === i); o.setAttribute("aria-selected", String(k === i)); });
      panes.forEach((p, k) => p.classList.toggle("is-on", k === i));
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => pick(i));
      t.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick(i)));
      if (!t.querySelector(".mp-grad-text") || reduce) return;
      t.addEventListener("pointerleave", () => {
        const g = t.querySelector(".mp-grad-text");
        g.classList.add("is-hold", "is-sweep");
        // After sweeping all the way, the black name cell is hidden and a new gradient name stands in its place (the original also swaps the cell). The hidden cell is cleared next time
        t.querySelectorAll(".mp-grad-text.is-gone").forEach((o) => o.remove());
        const done = (e) => {
          if (e.animationName !== "mp-sweep") return;
          g.removeEventListener("animationend", done);
          const fresh = g.cloneNode(true);
          fresh.classList.remove("is-hold", "is-sweep");
          g.classList.add("is-gone");
          g.after(fresh);
        };
        g.addEventListener("animationend", done);
      });
    });
  });

  // Hero auto demo — the original product screen runs by itself for a few seconds after opening: the Thinking bar grows from 26px (about 100px/s),
  // When fully grown, the step dot lights up purple and the board image floats up in .68s
  const think = document.querySelector(".mp-think__bar");
  if (think && !reduce) {
    const dot = document.querySelector(".mp-think__dot"), board = document.querySelector("[data-demo-board]");
    // The large graph line is drawn from the left with clip over .82s, like the original
    const line = document.querySelector(".mp-card--wide .mp-chart svg");
    gsap.set(board, { opacity: 0 });
    if (line) gsap.set(line, { clipPath: "inset(0 100% 0 0)" });
    gsap.timeline({ delay: 0.45 })
      .to(think, { width: 255, duration: 2, ease: "none" })
      .to(line, { clipPath: "inset(0 0% 0 0)", duration: 0.817, ease: "power2.out" }, 2.23)
      .add(() => dot.classList.add("is-on"), 2)
      .to(board, { opacity: 0.94, duration: 0.68, ease: "power2.out" }, 1.55)
      .set(board, { opacity: 1 });
  }

  // Logo flow — append one more set of rows for a seamless leftward loop
  document.querySelectorAll("[data-marquee]").forEach((track) => {
    const row = track.querySelector(".mp-logos__row");
    row.append(...[...row.children].map((n) => n.cloneNode(true)));
    if (reduce) return;
    const tween = gsap.to(row, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    return tween;
  });

  // Pinned feature panel — while the column sticks to the screen it is split into five steps, and each step crossed changes the text, gradient and screen card
  const feat = document.querySelector(".mp-feat");
  if (feat) {
    const items = [...feat.querySelectorAll(".mp-feat__item")];
    const grads = [...feat.querySelectorAll(".mp-grad")];
    const uis = [...feat.querySelectorAll(".mp-ui")];
    const links = [...feat.querySelectorAll(".mp-feat__rail a")];
    let cur = 0;
    const show = (n, instant) => {
      if (n === cur) return;
      const d = instant || reduce ? 0 : 0.4;
      const out = [items[cur], grads[cur], uis[cur]], inn = [items[n], grads[n], uis[n]];
      gsap.to(out, { autoAlpha: 0, duration: d, ease, overwrite: true });
      gsap.fromTo(items[n], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: d, ease, overwrite: true });
      gsap.to([grads[n], uis[n]], { autoAlpha: 1, duration: d, ease, overwrite: true });
      out.forEach((e) => e.classList.remove("is-on"));
      inn.forEach((e) => e.classList.add("is-on"));
      links.forEach((l, k) => l.classList.toggle("is-on", k === n));
      cur = n;
    };
    // The stage sticks only on wide screens — text column center alignment (transform) and hiding also apply only then. On phones the columns stack vertically
    mm.add("(min-width: 810px)", () => {
      cur = 0;
      gsap.set(items, { yPercent: -50, y: 0 });
      gsap.set(items.slice(1), { autoAlpha: 0 });
      gsap.set([...grads.slice(1), ...uis.slice(1)], { autoAlpha: 0 });
      const st = ScrollTrigger.create({
        trigger: feat, start: "top top", end: "bottom bottom",
        onUpdate: (self) => show(Math.min(items.length - 1, Math.floor(self.progress * items.length))),
      });
      return () => { st.kill(); gsap.set([...items, ...grads, ...uis], { clearProps: "all" }); };
    });
    links.forEach((l, k) => l.addEventListener("click", (e) => {
      e.preventDefault();
      const top = feat.getBoundingClientRect().top + scrollY;
      const span = (feat.offsetHeight - innerHeight) / items.length;
      scrollTo({ top: top + span * k + 2, behavior: reduce ? "auto" : "smooth" });
    }));
  }

  // Quote — pressing a company logo tab changes the quote
  document.querySelectorAll("[data-quotes]").forEach((box) => {
    const slides = [...box.querySelectorAll(".mp-quote__slide")];
    const tabs = [...box.querySelectorAll(".mp-quote__tabs button")];
    tabs.forEach((t, i) => t.addEventListener("click", () => {
      tabs.forEach((o, k) => o.classList.toggle("is-on", k === i));
      slides.forEach((s, k) => s.classList.toggle("is-on", k === i));
      if (!reduce) gsap.fromTo(slides[i], { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, ease });
    }));
  });

  // Video window — opens with the play button, closes via outside click, close button or Esc
  const vid = document.querySelector("[data-video]");
  if (vid) {
    const shut = () => { vid.hidden = true; document.body.style.overflow = ""; };
    document.querySelectorAll("[data-video-open]").forEach((b) => b.addEventListener("click", () => { vid.hidden = false; document.body.style.overflow = "hidden"; }));
    vid.addEventListener("click", (e) => (e.target === vid || e.target.closest(".mp-video__x")) && shut());
    addEventListener("keydown", (e) => e.key === "Escape" && !vid.hidden && shut());
  }

  // 3D report book — stands in for the original Spline scene. A deep green book, slightly tilted, sways as if breathing and turns its head toward the mouse
  const cv = document.querySelector("[data-book]");
  if (cv && window.THREE) {
        // Skin variable (oklch, color-mix) to an rgb that three reads — paint it on a one-dot canvas and read it
    const probe = document.createElement("i"), px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const resolve = (v) => {
      probe.style.color = `var(${v})`; document.body.append(probe);
      px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1); probe.remove();
      const [r, g, b] = px.getImageData(0, 0, 1, 1).data;
      return new THREE.Color(r / 255, g / 255, b / 255).convertSRGBToLinear();
    };
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio));
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, 0, 9);
    const cover = resolve("--site-forest");
    const ink = resolve("--site-forest-ink");
    const page = resolve("--kf-surface");
    const mats = [
      new THREE.MeshStandardMaterial({ color: page, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: cover, roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: page, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: page, roughness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: cover.clone().lerp(ink, 0.08), roughness: 0.45, metalness: 0.1 }),
      new THREE.MeshStandardMaterial({ color: cover, roughness: 0.6 }),
    ];
    const book = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.9, 0.22), mats);
    // Cover title strip — light bars instead of text
    const bars = new THREE.Group();
    [[0.9, 0.42], [1.2, 0.18], [1.4, 0.06], [1.1, -0.06], [0.7, -0.4]].forEach(([w, y]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.07), new THREE.MeshBasicMaterial({ color: ink }));
      m.position.set(-1.05 + 0.2 + w / 2, y - 0.3, 0.111);
      bars.add(m);
    });
    book.add(bars);
    scene.add(book);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(ink, 1.4);
    rim.position.set(-4, -2, 2);
    scene.add(rim);
    const size = () => { const r = cv.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); };
    new ResizeObserver(size).observe(cv);
    size();
    let mx = 0, my = 0, tx = 0, ty = 0, vis = false;
    addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(cv);
    const base = { x: 0.05, y: -0.35 };
    const tick = (t) => {
      if (!vis) return;
      const s = reduce ? 0 : t;
      tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
      book.rotation.y = base.y + Math.sin(s * 0.6) * 0.08 + tx * 0.5;
      book.rotation.x = base.x + Math.cos(s * 0.5) * 0.04 + ty * 0.3;
      book.position.y = Math.sin(s * 0.8) * 0.06;
      renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    renderer.render(scene, cam);
  }
})();
