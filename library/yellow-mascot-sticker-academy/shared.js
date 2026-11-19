/* Shared by all pages — hand drawing, Lenis, header line, dropdown · search · phone menu, number chip strip, review row, FAQ, footer hill, stack cards, hero entrance, barba transition */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.documentElement.classList.add("js");
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  gsap.registerPlugin(ScrollTrigger);
  if (window.CustomEase) CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  gsap.defaults({ ease: window.CustomEase ? "osmo" : "power3.inOut", duration: 0.6 });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ───────── Hand drawings — redrawn at the position, size and feel of the original line art ───────── */
  const ART = {
    snail: `<svg viewBox="0 0 200 150"><path class="s" d="M8 140 C60 136 150 137 194 140"/><path class="s" d="M128 72 a7 7 0 1 1 7 7 a14 14 0 1 1 -15 -15 a23 23 0 1 1 24 24 a33 33 0 1 1 -34 -34 a40 40 0 0 1 40 40 c0 16 -8 30 -22 38"/><path class="s" d="M44 138 C64 140 150 142 172 132 C168 124 156 126 150 128"/><path class="s" d="M58 138 C50 118 56 98 70 94 C84 92 92 106 88 124"/><circle class="s" cx="72" cy="104" r="5"/><circle class="s" cx="84" cy="106" r="5"/><path class="s" d="M50 88 L100 82 M58 87 C58 70 90 66 92 83"/><path class="s" d="M30 128 c-4 -8 2 -16 10 -12 M22 136 c-6 -4 -4 -12 4 -12"/></svg>`,
    duo: `<svg viewBox="0 0 200 170"><circle class="s" cx="86" cy="62" r="17"/><circle class="s" cx="116" cy="60" r="17"/><path class="s" d="M70 54 c4 -18 22 -24 34 -10 c8 -16 30 -10 30 8 M80 60 h6 M110 58 h6 M84 72 q4 3 8 0 M112 70 q4 3 8 0"/><path class="s" d="M80 80 C70 106 72 132 82 160 M122 78 C132 104 130 130 120 160 M82 160 h38"/><path class="s" d="M78 96 L52 72 M124 94 L150 70"/><ellipse class="s" cx="52" cy="40" rx="8" ry="6" transform="rotate(-30 52 40)"/><ellipse class="s" cx="102" cy="18" rx="9" ry="6"/><ellipse class="s" cx="152" cy="40" rx="8" ry="6" transform="rotate(30 152 40)"/><path class="s" d="M60 26 l6 -6 M142 24 l-6 -6 M100 6 v-4"/><path class="s" d="M140 130 h40 l-6 34 h-28 z M146 130 c2 -10 26 -10 28 0"/></svg>`,
    globe: `<svg viewBox="0 0 200 170"><circle class="s" cx="86" cy="108" r="54"/><path class="f" d="M48 78 c14 -14 34 -10 30 6 c-4 14 -26 22 -34 10 z M96 132 c10 -8 28 -2 24 12 c-4 10 -22 12 -26 2 z M118 70 c8 -2 14 6 8 12 c-6 4 -12 -2 -8 -12 z"/><circle class="s" cx="74" cy="108" r="7"/><circle class="s" cx="96" cy="108" r="7"/><path class="s" d="M78 128 q8 6 16 0"/><path class="s" d="M132 92 C140 64 152 46 168 34 L164 50 L184 46 L170 60 C176 74 172 92 160 100 M152 58 a4 4 0 1 0 0.1 0"/><path class="s" d="M160 100 C150 118 120 124 100 116 M162 100 C170 128 168 150 160 164 M20 164 h170"/></svg>`,
    wolf: `<svg viewBox="0 0 200 200"><path class="s" d="M92 40 L120 22 L116 36 L140 30 L128 44 L150 50 L126 58 C122 72 112 80 100 82 C88 82 80 70 82 56 C84 48 88 44 92 40 Z"/><circle class="s" cx="104" cy="50" r="5"/><circle class="s" cx="118" cy="50" r="5"/><path class="s" d="M140 54 l12 4 M90 40 l-8 -12 l12 6"/><path class="s" d="M94 82 C84 112 86 150 94 188 M112 80 C122 112 120 150 114 188 M86 188 h40"/><path class="s" d="M98 108 C112 120 128 116 136 106"/><path class="s" d="M134 92 h22 v24 h-22 z M156 98 c10 0 10 12 0 12"/><path class="s" d="M142 84 c-4 -6 4 -10 0 -16 M150 84 c-4 -6 4 -10 0 -16"/></svg>`,
    cup: `<svg viewBox="0 0 260 150"><ellipse class="s" cx="120" cy="134" rx="74" ry="11"/><path class="s" d="M70 88 C72 122 94 130 120 130 C146 130 168 122 170 88 Z"/><path class="s" d="M170 96 C192 92 194 122 166 120"/><path class="s" d="M104 78 C96 64 112 58 104 42 M126 78 C118 64 134 58 126 42 M148 74 C142 64 154 58 148 48"/><path class="s" d="M44 40 l0 14 M37 47 l14 0 M210 30 l0 12 M204 36 l12 0 M196 80 l0 10 M191 85 l10 0"/><path class="s" d="M10 140 C30 128 50 140 40 120 M222 138 c10 -14 26 -10 30 0"/><path class="s" d="M216 110 q10 -16 22 -4 q-4 14 -22 4 z M226 104 l2 8"/></svg>`,
    tree: `<svg viewBox="0 0 200 160"><path class="s" d="M10 150 C70 146 140 147 190 150"/><path class="s" d="M100 150 C98 126 104 104 96 82 M98 112 C80 100 70 84 72 62 M100 100 C116 90 126 74 122 56 M96 84 C90 70 92 54 100 44"/><ellipse class="s" cx="72" cy="56" rx="7" ry="9"/><ellipse class="s" cx="122" cy="50" rx="7" ry="9"/><ellipse class="s" cx="100" cy="38" rx="7" ry="9"/><path class="s" d="M128 150 a12 12 0 1 1 12 -12 a7 7 0 1 1 -7 -7"/><path class="s" d="M150 150 C146 140 136 140 134 150"/></svg>`,
    reading: `<svg viewBox="0 0 220 200"><path class="s" d="M40 70 C60 22 150 18 180 62 Z M110 40 L110 190"/><path class="s" d="M60 64 C70 50 90 46 100 60 M120 58 C130 46 150 46 160 60"/><path class="s" d="M60 190 L80 130 L150 140 L166 190 M80 130 L70 190"/><circle class="s" cx="104" cy="104" r="14"/><path class="s" d="M96 102 h6 M108 102 h6 M98 112 q6 4 12 0"/><path class="s" d="M100 118 C96 132 104 140 120 140 M88 132 l-16 -8 l6 -14 M124 120 l18 -10 l4 12"/><path class="s" d="M138 106 h24 v18 h-24 z"/><path class="s" d="M30 190 h170"/></svg>`,
    badge: `<svg viewBox="0 0 140 150"><path class="f" d="M70 6 L134 126 Q138 136 128 136 H12 Q2 136 6 126 Z"/><circle class="bg" cx="70" cy="86" r="30"/><path class="s" style="stroke:var(--kf-ink)" d="M58 74 C70 60 86 70 76 82 C66 94 82 104 92 92"/><text x="70" y="128" text-anchor="middle" class="bg" font-size="11" font-weight="700" letter-spacing="1">LOGO MARK</text></svg>`,
    flag: `<svg viewBox="0 0 16 16"><path class="s" style="stroke-width:1.6" d="M3 15 V2 M3 3 h9 l-2 3 l2 3 h-9"/></svg>`,
    arrow: `<svg viewBox="0 0 16 16"><path class="s" style="stroke-width:1.8" d="M3 13 L13 3 M5 3 h8 v8"/></svg>`,
  };
  const STAR = '<svg viewBox="0 0 20 20"><path fill="currentColor" d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 15l-5.4 3 1.2-6L1.3 7.8l6.1-.7z"/></svg>';
  function paintArt(root) {
    root.querySelectorAll("[data-art]").forEach((el) => {
      if (el.firstElementChild) return;
      el.innerHTML = ART[el.dataset.art] || "";
      el.classList.add("b-art");
    });
    root.querySelectorAll("[data-stars]").forEach((el) => { if (!el.firstChild) el.innerHTML = STAR.repeat(5); });
  }

  /* ───────── Lenis — original lerp .1 · wheel .7 ───────── */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = window.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.7, gestureOrientation: "vertical" });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollY = () => (lenis ? lenis.scroll : window.scrollY);

  /* ───────── Header bar — hides on scroll down and shows on scroll up, past 10px a brown panel drops from the top ───────── */
  const nav = document.querySelector(".b-nav");
  const navBg = nav?.querySelector(".b-nav__bg");
  let last = 0, wasScrolled = false;
  function updateNav() {
    if (!nav) return;
    const y = scrollY();
    const open = document.documentElement.classList.contains("is-menu-open");
    if (!open) nav.style.transform = y > last && y > 120 ? "translateY(-102%)" : "translateY(0)";
    // Pages with no dark hero (original navbar variant light) always lay down the brown plate
    const solid = document.querySelector('[data-barba="container"]')?.dataset.nav === "solid";
    const scrolled = y > 10 || open || solid;
    if (scrolled !== wasScrolled && navBg) navBg.style.transform = scrolled ? "translateY(0)" : "translateY(-102%)";
    wasScrolled = scrolled;
    last = y;
  }
  if (lenis) lenis.on("scroll", updateNav); else addEventListener("scroll", updateNav, { passive: true });

  function bindNav() {
    document.querySelectorAll(".b-drop").forEach((d) => {
      const t = d.querySelector(".b-drop__toggle");
      t.addEventListener("click", (e) => {
        e.stopPropagation();
        const on = !d.classList.contains("is-open");
        document.querySelectorAll(".b-drop.is-open").forEach((o) => o.classList.remove("is-open"));
        d.classList.toggle("is-open", on);
        t.setAttribute("aria-expanded", on);
      });
      d.addEventListener("mouseleave", () => { d.classList.remove("is-open"); t.setAttribute("aria-expanded", "false"); });
    });
    addEventListener("click", () => document.querySelectorAll(".b-drop.is-open").forEach((o) => o.classList.remove("is-open")));
    const sBtn = document.querySelector(".b-search"), sBar = document.querySelector(".b-searchbar");
    sBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = sBar.classList.toggle("is-open");
      sBtn.classList.toggle("is-open", on);
      sBtn.setAttribute("aria-expanded", on);
      if (on) sBar.querySelector("input").focus({ preventScroll: true });
    });
    sBar?.addEventListener("click", (e) => e.stopPropagation());
    sBar?.querySelector("button")?.addEventListener("click", () => { sBar.classList.remove("is-open"); sBtn.classList.remove("is-open"); });
    const burger = document.querySelector(".b-burger"), m = document.querySelector(".b-mnav");
    burger?.addEventListener("click", () => {
      const on = !m.classList.contains("is-open");
      m.classList.toggle("is-open", on);
      burger.setAttribute("aria-expanded", on);
      document.documentElement.classList.toggle("is-menu-open", on);
      on ? lenis?.stop() : lenis?.start();
      updateNav();
    });
  }

  /* ───────── Number chip strip — original marquee: speed = Screen width × .4 clamped to 20~40px/s, on hover .3x, follows 8% per frame ───────── */
  const loops = [];
  function initBands(root) {
    root.querySelectorAll("[data-band]").forEach((track) => {
      const items = [...track.children];
      if (!items.length || reduce) return;
      const setW = track.scrollWidth;
      const need = Math.ceil(innerWidth / Math.max(1, setW)) + 2;
      for (let c = 0; c < need; c++) items.forEach((it) => { const k = it.cloneNode(true); k.setAttribute("aria-hidden", "true"); track.append(k); });
      const speed = Math.min(Math.max(0.4 * innerWidth, 20), 40);
      const st = { pos: 0, cur: speed, target: speed, setW, track };
      const box = track.closest(".b-band") || track.parentElement;
      box.addEventListener("mouseenter", () => (st.target = speed * 0.3));
      box.addEventListener("mouseleave", () => (st.target = speed));
      st.step = (dt) => {
        st.cur += (st.target - st.cur) * 0.08;
        st.pos -= st.cur * dt;
        if (st.pos <= -st.setW) st.pos += st.setW;
        track.style.transform = `translate3d(${st.pos}px,0,0)`;
      };
      loops.push(st);
    });
  }

  /* ───────── Review row — swiper freeMode, each frame drifts 1px, and on hover it follows by 3% at .3 ───────── */
  function initReviews(root) {
    root.querySelectorAll(".b-reviews .swiper").forEach((el) => {
      if (!window.Swiper || el.swiper) return;
      const wrapper = el.querySelector(".swiper-wrapper");
      const originals = [...wrapper.children];
      const sw = new Swiper(el, { freeMode: { enabled: true, momentum: false }, grabCursor: true, slidesPerView: "auto", spaceBetween: 16, resistanceRatio: 0 });
      for (let c = 0; c < 3; c++) originals.forEach((s) => { const k = s.cloneNode(true); k.setAttribute("aria-hidden", "true"); wrapper.append(k); });
      sw.update();
      let setW = originals.reduce((a, s) => a + s.offsetWidth + 16, 0);
      let pos = -setW, vel = 1, base = 1, hovering = false, dragging = false, prevX = 0, prevT = 0, rel = 0;
      wrapper.style.transitionDuration = "0ms";
      sw.setTranslate(pos);
      el.addEventListener("mouseenter", () => (hovering = true));
      el.addEventListener("mouseleave", () => (hovering = false));
      sw.on("touchStart", () => { dragging = true; rel = 0; sw.setTranslate(pos); prevX = pos; prevT = performance.now(); });
      sw.on("sliderMove", () => { const n = performance.now(), dt = n - prevT; if (dt > 5) { const x = sw.getTranslate(); rel = (prevX - x) / dt; prevX = x; prevT = n; } });
      sw.on("touchEnd", () => { dragging = false; pos = sw.getTranslate(); vel = rel * 16; if (vel > 0.5) base = 1; else if (vel < -0.5) base = -1; if (Math.abs(vel) < 0.2) vel = base; });
      new ResizeObserver(() => { setW = originals.reduce((a, s) => a + s.offsetWidth + 16, 0) || setW; }).observe(el);
      if (reduce) return;
      loops.push({ step: (dt) => {
        if (dragging || !el.isConnected) return;
        const target = hovering ? 0.3 * Math.sign(base) : base;
        vel += (target - vel) * 0.03;
        pos -= vel * dt * 62.5;
        if (pos < -setW * 3) pos += setW;
        if (pos > 0) pos -= setW;
        wrapper.style.transitionDuration = "0ms";
        sw.setTranslate(pos);
      } });
    });
  }
  let lastT = 0;
  gsap.ticker.add((t) => {
    const dt = lastT ? Math.min(0.1, Math.max(0.001, t - lastT)) : 0.016;
    lastT = t;
    for (let i = loops.length - 1; i >= 0; i--) {
      if (loops[i].track && !loops[i].track.isConnected) { loops.splice(i, 1); continue; }
      loops[i].step(dt);
    }
  });

  /* ───────── FAQ ───────── */
  function initFaq(root) {
    root.querySelectorAll(".b-acc").forEach((a) => {
      const q = a.querySelector(".b-acc__q"), body = a.querySelector(".b-acc__a");
      q.addEventListener("click", () => {
        const on = !a.classList.contains("is-open");
        a.classList.toggle("is-open", on);
        q.setAttribute("aria-expanded", on);
        gsap.to(body, { height: on ? "auto" : 0, duration: reduce ? 0 : 0.4, onComplete: () => ScrollTrigger.refresh() });
      });
    });
  }

  /* ───────── Footer hill — original: moves instantly opposite to the mouse, up to (picture width × scale − cell width)/2 ───────── */
  function initScene(root) {
    const wrap = root.querySelector(".b-scene-wrap"), scene = wrap?.querySelector(".b-scene");
    if (!wrap || !scene) return;
    drawHills(scene.querySelector(".b-scene__land"));
    const sc = () => new DOMMatrix(getComputedStyle(scene).transform).a || 1;
    // The original applies it to the whole footer, but the measured value only moved over the hill cell — so apply it to the hill cell
    const foot = wrap;
    if (fine && !reduce) {
      // On scroll the browser UI fires a fake mousemove at the pointer’s same spot — if it matches the previous spot seen across the document, the hand hasn’t moved
      let panned = false, px = null, py = null;
      const seen = (e) => { const same = e.clientX === px && e.clientY === py; px = e.clientX; py = e.clientY; return same; };
      document.addEventListener("mousemove", (e) => { if (!foot.contains(e.target)) seen(e); }, { passive: true });
      foot.addEventListener("mousemove", (e) => {
        if (seen(e)) return;
        panned = true;
        const s = sc(), r = foot.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
        const mx = Math.max(0, (scene.offsetWidth * s - r.width) / 2), my = Math.max(0, (scene.offsetHeight * s - wrap.offsetHeight) / 2);
        scene.style.transform = `translate(${-nx * mx}px, ${-ny * my}px) scale(${s})`;
      });
      foot.addEventListener("mouseleave", () => { if (panned) scene.style.transform = ""; panned = false; });
    }
    scene.querySelectorAll(".b-scene__who").forEach((w) => {
      w.addEventListener("touchstart", () => { w.classList.add("is-press"); setTimeout(() => w.classList.remove("is-press"), 450); }, { passive: true });
    });
  }
  function drawHills(svg) {
    if (!svg || svg.childElementCount) return;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const W = 2326, H = 665;
    const p = [];
    p.push(`M-20 210 C180 120 360 140 520 230 S860 330 1020 250 S1340 120 1520 200 S1880 300 2040 220 S2260 150 2350 190`);
    p.push(`M-20 420 C200 330 420 360 640 450 S1020 520 1240 430 S1600 330 1820 410 S2200 480 2350 420`);
    p.push(`M300 665 C420 560 520 520 700 540 S960 640 1080 665 M1400 665 C1500 600 1640 560 1800 590 S2100 640 2200 665`);
    p.push(`M760 260 C820 330 900 360 880 430 S760 520 820 600 S940 650 960 665`);
    for (let i = 0; i < 22; i++) {
      const x = 40 + rnd() * (W - 80), y = 180 + rnd() * (H - 220), h = 30 + rnd() * 50;
      if (i % 3 === 0) p.push(`M${x} ${y} C${x - 2} ${y - h * 0.5} ${x + 3} ${y - h * 0.8} ${x} ${y - h} M${x} ${y - h * 0.55} C${x - 14} ${y - h * 0.7} ${x - 18} ${y - h} ${x - 16} ${y - h * 1.15} M${x} ${y - h * 0.7} C${x + 12} ${y - h * 0.85} ${x + 16} ${y - h * 1.1} ${x + 14} ${y - h * 1.25}`);
      else p.push(`M${x} ${y} l5 -12 l5 12 l5 -9 l5 9 l4 -7 l4 7`);
    }
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML = p.map((d) => `<path class="s" d="${d}"/>`).join("");
    for (let i = 0; i < 9; i++) {
      const x = 80 + rnd() * (W - 160), y = 240 + rnd() * 360;
      svg.insertAdjacentHTML("beforeend", `<ellipse class="s" cx="${x}" cy="${y - 54}" rx="6" ry="9"/><ellipse class="s" cx="${x + 18}" cy="${y - 62}" rx="6" ry="9"/>`);
    }
  }

  /* ───────── Sticky card stack — original stacking cards: from the 75% line until it sticks, 0·4·-4° power1.in scrub, at the moment it sticks it widens 1.5em horizontally, then elastic.out(1,.3) 1s ───────── */
  function initStacks(root) {
    root.querySelectorAll("[data-stacking-cards-init]").forEach((section) => {
      const cards = [...section.querySelectorAll("[data-stacking-card]")];
      const rot = (section.dataset.rotate || "0,4,-4").split(",").map(Number);
      cards.forEach((card, i) => {
        const t = card.querySelector("[data-stacking-card-target]");
        if (!t) return;
        gsap.set(t, { zIndex: cards.length - i });
        if (reduce) return;
        const top = parseFloat(getComputedStyle(card).top) || 0;
        gsap.fromTo(t, { rotate: 0 }, { rotate: rot[i % rot.length], ease: "power1.in", scrollTrigger: { trigger: card, start: "top 75%", end: `top-=${top} top`, scrub: true } });
        ScrollTrigger.create({ trigger: card, start: `top-=${top} top`, onEnter: () => {
          const fs = parseFloat(getComputedStyle(t).fontSize) * 1.5;
          gsap.timeline().to(t, { scaleX: (t.offsetWidth + fs) / t.offsetWidth, scaleY: (t.offsetHeight - fs * 0.33) / t.offsetHeight, duration: 0.1, ease: "power1.out" })
            .to(t, { scaleX: 1, scaleY: 1, duration: 1, ease: "elastic.out(1, 0.3)" });
        } });
      });
    });
  }

  /* ───────── Photo parallax — values measured from the original IX3 at each scroll position and carried over:
     The photo in the Hero goes 0→20vh · 1→1.05x from when the section’s top edge touches the top until its bottom edge passes,
     The section background photo moves from -40vh to 40vh and scales 1 to 1.1x from when the section enters at the bottom until it leaves at the top (half for short sections) ───────── */
  function initParallax(root) {
    if (reduce) return;
    root.querySelectorAll('[data-parallax="image"]').forEach((img) => {
      const sec = img.closest("[data-parallax=header],[data-parallax=section],[data-parallax=short-section]");
      if (!sec) return;
      const kind = sec.dataset.parallax;
      if (kind === "header") {
        gsap.fromTo(img, { y: 0, scale: 1 }, { y: () => innerHeight * 0.2, scale: 1.05, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      } else {
        const k = kind === "short-section" ? 0.2 : 0.4;
        gsap.fromTo(img, { y: () => -innerHeight * k, scale: 1 }, { y: () => innerHeight * k, scale: 1 + k / 4, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
      }
    });
  }

  /* ───────── Fit the big title to the cell width like the journey card (original fitTextToWidth) ───────── */
  function fitText(root) {
    root.querySelectorAll("[data-fit]").forEach((el) => {
      const c = el.parentElement;
      el.style.fontSize = "500px";
      el.style.fontSize = (500 * c.clientWidth) / el.scrollWidth + "px";
    });
  }

  /* ───────── Hero entrance — wait 1s, letters 110%→0 (.03 interval .75s expo.out), header words 120%→0 ───────── */
  function homeEntrance(container) {
    if ((container.dataset.pageName || "") !== "home" || reduce || !window.SplitText) return;
    const heading = container.querySelector('[data-page-load="heading"]');
    const sub = container.querySelector('[data-page-load="subheading"]');
    // Original HOME_ENTRANCE.startDelay — 1.0s after barba once (when the cover has lifted) (checked by frame-capturing the original opening: cover 33ms, text 1.05s)
    const tl = gsap.timeline({ delay: 1.0, defaults: { ease: "expo.out" } });
    if (heading) {
      const split = new SplitText(heading, { type: "chars", mask: "chars" });
      gsap.set(split.chars, { yPercent: 110 });
      // Splitting loosens the kerning between letters and widens them — like the original, refit to the cell width after splitting
      if (heading.hasAttribute("data-fit")) fitText(heading.parentElement);
      tl.to(split.chars, { yPercent: 0, stagger: 0.03, duration: 0.75 });
    }
    if (sub) {
      const s2 = new SplitText(sub, { type: "words", mask: "words" });
      gsap.set(s2.words, { yPercent: 120 });
      tl.to(s2.words, { yPercent: 0, stagger: 0.08, duration: 0.8 }, "-=1");
    }
  }

  /* Subpages — instructor and space sliders (swiper default .3s), filter chip selection and calculator button selection */
  function initSubpage(root) {
    root.querySelectorAll("[data-slider]").forEach((el) => {
      const box = el.classList.contains("swiper") ? el : el.querySelector(".swiper");
      if (!window.Swiper || !box || box.swiper) return;
      const team = el.dataset.slider === "team";
      const dots = el.querySelector(".b-bullets");
      // Original data-responsive "1/16, 478:1.5/16, 768:2/16, 992:2.5/16, 1440:3.5/16, 1920:4/16"
      const per = team ? { 0: 1, 478: 1.5, 768: 2, 992: 2.5, 1440: 3.5, 1920: 4 } : { 0: 1 };
      new Swiper(box, {
        slidesPerView: 1,
        breakpoints: Object.fromEntries(Object.entries(per).map(([w, n]) => [w, { slidesPerView: n }])),
        spaceBetween: team ? 16 : 0,
        speed: reduce ? 0 : 300,
        loop: !team,
        navigation: { prevEl: el.querySelector(".is-prev"), nextEl: el.querySelector(".is-next"), disabledClass: "is-disabled" },
        ...(dots && { pagination: { el: dots, clickable: true, bulletElement: "button", bulletClass: "b-bullet", bulletActiveClass: "is-active" } }),
      });
    });
    // Original IX3 profile-card hover: photo panel background transparent · arrow cell 0 · description cell 0→auto · name cell latte→yellow, power4.inOut .5s, rewinds at 1.2x on exit
    if (fine && !reduce) root.querySelectorAll(".b-person").forEach((card) => {
      const box = card.querySelector(".b-person__box");
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim();
      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.5, ease: "power4.inOut" }, onReverseComplete: () => tl.invalidate() })
        .to(card.querySelector(".b-person__bg"), { backgroundColor: "transparent" }, 0)
        .to(card.querySelector(".b-person__icon"), { opacity: 0 }, 0)
        .fromTo(card.querySelector(".b-person__more"), { height: 0 }, { height: "auto" }, 0)
        .to(box, { backgroundColor: accent }, 0);
      card.addEventListener("mouseenter", () => tl.timeScale(1).play());
      card.addEventListener("mouseleave", () => tl.timeScale(1.2).reverse());
    });
    // Original site-builder-side inner ring: if the section pointed to is on screen, w--current
    root.querySelectorAll("[data-spy]").forEach((list) => {
      const links = [...list.querySelectorAll('a[href^="#"]')];
      const targets = links.map((a) => root.querySelector(a.getAttribute("href")));
      links.forEach((a, i) => {
        const t = targets[i], next = targets[i + 1];
        if (!t) return;
        ScrollTrigger.create({ trigger: t, start: "top bottom", endTrigger: next || t.parentElement, end: next ? "top top" : "bottom top", toggleClass: { targets: a, className: "is-current" } });
      });
    });
    root.querySelectorAll(".b-chips, .b-seg").forEach((g) => {
      g.addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        g.querySelectorAll("button").forEach((x) => x.classList.toggle("is-on", x === b));
      });
    });
  }

  function setupPage(container) {
    if (reduce) container.querySelectorAll("video[autoplay]").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
    initSubpage(container);
    paintArt(container);
    paintArt(document.querySelector(".b-trans") || document.body);
    fitText(container);
    initBands(container);
    initReviews(container);
    initFaq(container);
    initScene(document);
    initStacks(container);
    initParallax(container);
    document.dispatchEvent(new CustomEvent("b:page", { detail: container }));
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  /* ───────── Page transition — barba 2.10.3: cover slides up .45s expo.out, current section -15vh; Stickers (first .35s back.out(1.7), the rest .3s at .1 intervals, ±8° · .85–1.15x) or page name; Cover -200% .6/.7s power2.out, new section at 15vh ───────── */
  const T = { slide: 0.45, buffer: 0.15, minStart: 1.2, maxStart: 4, first: 0.35, rest: 0.3, stagger: 0.1, gap: 0.15, wipeHold: 0.15, nameFade: 0.25, nameHold: 0.45, wipeOut: 0.6, pageIn: 0.7 };
  const wrap = document.querySelector(".b-trans");
  const panel = wrap?.querySelector(".b-trans__panel");
  const stack = wrap?.querySelector(".b-trans__stack");
  const nameEl = wrap?.querySelector(".b-trans__name");
  const stickers = stack ? [...stack.children] : [];

  function resetTrans() {
    if (!wrap) return;
    gsap.set([wrap, panel, stack, nameEl, ...stickers], { clearProps: "all" });
  }
  function buildStack(tl, at) {
    tl.set(stack, { display: "flex", autoAlpha: 1 }, at);
    tl.set(stickers, { opacity: 0, scale: 0, rotate: () => gsap.utils.random(-8, 8) }, at);
    tl.to(stickers[0], { opacity: 1, scale: 1, duration: T.first, ease: "back.out(1.7)" }, at + 0.05);
    tl.to(stickers.slice(1), { opacity: 1, scale: () => gsap.utils.random(0.85, 1.15), duration: T.rest, ease: "back.out(1.7)", stagger: T.stagger }, at + 0.05 + T.first + T.gap);
  }
  // The original wraps barba.go and raises the cover immediately on press (startCover), fitting leave and enter to the remaining slide time
  const dots = wrap?.querySelector(".b-trans__dots");
  let cover = null, dotsTimer = null;
  const coverElapsed = () => (cover ? (performance.now() - cover.at) / 1000 : 0);
  const slideRemaining = () => (cover ? Math.max(0, T.slide - coverElapsed()) : T.slide);
  function startCover() {
    gsap.set(wrap, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set([stack, nameEl], { display: "none", autoAlpha: 0 });
    gsap.set(panel, { top: 0 });
    gsap.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: T.slide, ease: "expo.out", overwrite: "auto" });
    const current = document.querySelector('[data-barba="container"]');
    if (current) gsap.fromTo(current, { y: "0vh" }, { y: "-15vh", duration: Math.max(0.5, T.slide + 0.2), overwrite: "auto" });
    return { at: performance.now() };
  }
  function hideDots() { clearTimeout(dotsTimer); dots?.classList.remove("is-visible"); }
  const wipeStart = (rem) => Math.max(rem + T.wipeHold, 0.1, cover ? T.nameFade + T.nameHold : 0);
  function stackStart(rem, elapsed) {
    const n = stickers.length, effMin = Math.max(0.35, T.minStart - elapsed);
    if (!n) return effMin;
    const finish = rem + 0.05 + 0.05 + T.first + (n > 1 ? T.gap + (n - 2) * T.stagger + T.rest : 0);
    return Math.min(T.maxStart, Math.max(effMin, finish + T.buffer));
  }

  function startBarba() {
    const first = document.querySelector('[data-barba="container"]');
    const html = document.documentElement;
    // Original opening order: yellow cover on the first image (is-home-loading) → barba once lifts it on the next frame → the site builder’s IX3 starts (measured 617~1150ms, varies with download) and parallax photos·video come in.
    const once = () => {
      html.classList.remove("is-home-loading");
      resetTrans();
      homeEntrance(first);
      setTimeout(() => html.classList.remove("is-ix-wait"), reduce ? 0 : 700);
    };
    setupPage(first);
    if (reduce) once(); else requestAnimationFrame(() => requestAnimationFrame(once));
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    const go = barba.go.bind(barba);
    barba.go = function (href, ...rest) {
      if (!reduce && !cover && !barba.transitions?.isRunning && wrap) {
        let p = null;
        try { p = new URL(href, location.href).pathname; } catch (e) {}
        if (p && p !== location.pathname) {
          cover = startCover();
          // Original LOADER: three dots if it takes over 0.9s (big branches like the first page excluded)
          if (!/(^|\/)(index\.html)?$/.test(p)) dotsTimer = setTimeout(() => cover && dots?.classList.add("is-visible"), 900);
        }
      }
      return go(href, ...rest);
    };
    barba.init({
      timeout: 9000,
      preventRunning: true,
      prevent: ({ el, href }) => {
        if (!el || el.target === "_blank" || el.hasAttribute("data-barba-prevent")) return true;
        try { const u = new URL(href, location.href); return !!u.hash && u.pathname === location.pathname; } catch (e) { return false; }
      },
      transitions: [{
        name: "default",
        sync: true,
        leave(data) {
          const next = data.next.container, current = data.current.container;
          const type = (next.dataset.transition || "stickers");
          return new Promise((resolve) => {
            if (reduce) { gsap.set(current, { autoAlpha: 0 }); current.remove(); resolve(); return; }
            gsap.set(next, { autoAlpha: 0, position: "fixed", top: 0, left: 0, right: 0 });
            lenis?.stop();
            const rem = slideRemaining();
            const tl = gsap.timeline({ onComplete: () => { current.remove(); resolve(); } });
            tl.set(wrap, { autoAlpha: 1, pointerEvents: "auto" }, 0);
            if (!cover) {
              tl.set(panel, { top: 0 }, 0);
              tl.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: T.slide, ease: "expo.out" }, 0);
              tl.fromTo(current, { y: "0vh" }, { y: "-15vh", duration: Math.max(0.5, T.slide + 0.2) }, 0);
            }
            if (type === "wipe") {
              tl.set(stack, { display: "none" }, 0);
              nameEl.textContent = next.dataset.pageLabel || "";
              if (cover) tl.fromTo(nameEl, { display: "grid", autoAlpha: 0 }, { autoAlpha: 1, duration: T.nameFade }, 0);
              else tl.set(nameEl, { display: "grid", autoAlpha: 1 }, 0);
              tl.add("end", wipeStart(rem));
            } else {
              tl.set(nameEl, { display: "none" }, 0);
              buildStack(tl, rem + 0.05);
              tl.add("end", "+=0.25");
            }
          });
        },
        enter(data) {
          const next = data.next.container;
          const type = next.dataset.transition || "stickers";
          return new Promise((resolve) => {
            const done = () => { cover = null; hideDots(); resetTrans(); gsap.set(next, { clearProps: "position,top,left,right,transform,opacity,visibility" }); lenis?.start(); setupPage(next); resolve(); };
            if (reduce) { window.scrollTo(0, 0); gsap.set(next, { autoAlpha: 1, clearProps: "position,top,left,right" }); done(); return; }
            // A sync slide starts together with the exit — as in the original, the new section opens after the cover has fully closed and the sticker and name are in place
            const start = type === "wipe" ? wipeStart(slideRemaining()) : stackStart(slideRemaining(), coverElapsed());
            const tl = gsap.timeline({ onComplete: done });
            tl.call(() => { gsap.set(next, { clearProps: "position,top,left,right" }); window.scrollTo(0, 0); lenis?.scrollTo(0, { immediate: true, force: true }); }, null, start);
            tl.set(next, { autoAlpha: 1 }, start);
            tl.fromTo(panel, { yPercent: 0 }, { yPercent: -100, duration: type === "wipe" ? T.wipeOut : 0.7, ease: "power2.out", immediateRender: false }, start);
            tl.from(next, { y: "15vh", duration: T.pageIn, ease: "power2.out", immediateRender: false }, start);
          });
        },
      }],
    });
    // Original loadNextPageStyles — attaches the next page-specific css before the transition (waits up to 1.5 seconds only)
    barba.hooks.beforeEnter((data) => {
      hideDots();
      const doc = new DOMParser().parseFromString(data.next.html || "", "text/html");
      const have = new Set([...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href));
      const add = [...doc.querySelectorAll('link[rel="stylesheet"]')].filter((l) => !have.has(new URL(l.getAttribute("href"), location.href).href));
      if (!add.length) return;
      return Promise.race([Promise.all(add.map((l) => new Promise((res) => { const k = document.createElement("link"); k.rel = "stylesheet"; k.href = l.getAttribute("href"); k.onload = k.onerror = res; document.head.append(k); }))), new Promise((r) => setTimeout(r, 1500))]);
    });
    barba.hooks.beforeLeave(() => { document.querySelectorAll(".b-drop.is-open,.b-searchbar.is-open,.b-mnav.is-open").forEach((o) => o.classList.remove("is-open")); document.documentElement.classList.remove("is-menu-open"); });
    barba.hooks.after(() => {
      ScrollTrigger.getAll().forEach((t) => { if (!document.contains(t.trigger)) t.kill(); });
      updateNavLinks();
      updateNav();
    });
  }
  function updateNavLinks() {
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".b-nav a[href], .b-mnav a[href]").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === here));
  }

  bindNav();
  updateNav();
  updateNavLinks();
  // The original lifts the hero cover as soon as the script is up (barba once) — if the font arrives late, only the cell fitting is redone
  startBarba();
  document.fonts?.ready.then(() => fitText(document));
  addEventListener("resize", () => fitText(document));
})();
