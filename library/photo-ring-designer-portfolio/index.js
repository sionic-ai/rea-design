// Home page: opening curtain (name shuffle, pixel cell fill, flying to the wordmark, ring scatter), Hero text lifting away, list preview, logo strip pause, pinned About (label shuffle, words filling in, 3D figure)
(() => {
  const { reduced } = EE;
  const root = document.documentElement;
  const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const hero = document.querySelector(".ee-hero");

  // ───── Opening curtain — original timeline values (.2 delay · mix 1.4s · 0→92% 2s power1.in · →100% .3s · fly away 1.3s expo.inOut · card +.45 · scatter +1.15)
  const intro = () => {
    const front = document.querySelector(".ee-front"), veil = document.querySelector(".ee-veil");
    const svg = front.querySelector(".ee-front__name"), base = svg.querySelector(".ee-front__base"), fill = svg.querySelector(".ee-front__fill");
    const cellsG = svg.querySelector(".ee-front__cells"), count = front.querySelector(".ee-front__count");
    const name = base.textContent;
    EE.lenis?.stop();
    scrollTo(0, 0);
    const rand = (a, b) => { const r = 43758.5453 * Math.sin(12.9898 * a + 78.233 * b); return r - Math.floor(r); };
    let cells = [], made = 0;
    const prog = { v: 0 };
    const tl = gsap.timeline({ delay: 0.2, paused: true });
    // Name box · pixel cells — remeasure when the decorative font arrives late (cells are also relaid in the new box)
    const layout = () => {
      const keep = base.textContent;
      base.textContent = name;
      const b = base.getBBox(), pad = 0.08 * b.height;
      base.textContent = keep;
      svg.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + 2 * pad} ${b.height + 2 * pad}`);
      const c = b.height / 12, cols = Math.ceil(b.width / c);
      cells = [];
      for (let x = 0; x < cols; x++) for (let y = 0; y < 12; y++) cells.push({ x: b.x + x * c, y: b.y + y * c, s: c, o: x + 4 * rand(31 * x + y, 9) });
      cells.sort((a, b2) => a.o - b2.o);
      cellsG.replaceChildren();
      made = 0;
    };
    tl.call(layout, [], 0);
    tl.set([base, fill], { textContent: "" }, 0);
    tl.set(svg, { opacity: 1 }, 0);
    tl.to(base, { duration: 1.4, ease: "none", scrambleText: { text: name, chars: "abcdefghijklmnopqrstuvwxyz", speed: 0.6 }, onUpdate: () => { fill.textContent = base.textContent; } }, 0);
    const paint = () => {
      count.textContent = `${Math.round(prog.v)}%`;
      const want = Math.round((prog.v / 100) * cells.length);
      for (; made < want; made++) {
        const { x, y, s } = cells[made];
        const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("x", x); r.setAttribute("y", y); r.setAttribute("width", 1.02 * s); r.setAttribute("height", 1.02 * s);
        cellsG.appendChild(r);
      }
    };
    tl.to(prog, { v: 92, duration: 2, ease: "power1.in", onUpdate: paint }, 0);
    tl.to(prog, { v: 100, duration: 0.3, ease: "power1.out", onUpdate: paint });
    tl.addLabel("pile", "+=0.05");
    const to = { x: 0, y: 0, scale: 1, color: css("--kf-ink") };
    tl.call(() => {
      const mark = document.querySelector(".ee-head__mark .ee-chars-in"), ctm = fill.getScreenCTM();
      if (!mark || !ctm) return;
      const kids = mark.children, probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      mark.appendChild(probe);
      const baseline = probe.getBoundingClientRect().bottom;
      probe.remove();
      const left = kids[0].getBoundingClientRect().left, width = kids[kids.length - 1].getBoundingClientRect().right - left;
      const box = svg.getBoundingClientRect(), p = new DOMPoint(fill.getBBox().x, 0).matrixTransform(ctm);
      to.scale = width / (fill.getComputedTextLength() * ctm.a);
      to.x = left - box.left - (p.x - box.left) * to.scale;
      to.y = baseline - box.top - (p.y - box.top) * to.scale;
      to.color = getComputedStyle(mark).color;
      gsap.set(base, { opacity: 0 });
      gsap.set(svg, { transformOrigin: "0px 0px" });
    }, [], "pile");
    tl.to(svg, { x: () => to.x, y: () => to.y, scale: () => to.scale, duration: 1.3, ease: "expo.inOut" }, "pile");
    tl.addLabel("card", "pile+=0.45");
    tl.call(() => hero.dispatchEvent(new Event("fx:card")), [], "card");
    tl.addLabel("burst", "card+=1.15");
    tl.call(() => hero.dispatchEvent(new Event("fx:burst")), [], "burst");
    tl.to(front.querySelectorAll(".ee-front__text"), { autoAlpha: 0, duration: 0.5, ease: "power1.out" }, "burst");
    tl.to(fill, { fill: () => to.color, duration: 1, ease: "sine.inOut" }, "burst+=0.3");
    tl.to(veil, { backgroundColor: () => css("--kf-bg"), duration: 1.3, ease: "sine.inOut" }, "burst+=0.2");
    tl.to(veil, { autoAlpha: 0, duration: 0.5, ease: "sine.inOut" }, "burst+=1.4");
    tl.call(() => {
      veil.style.display = front.style.display = "none";
      root.classList.remove("is-intro", "scroll-locked");
      EE.lenis?.start();
      EE.open();
    });
    tl.play();
    document.fonts?.load(`100px ${css("--kf-font-wordmark").split(",")[0]}`).then(() => { if (tl.time() < tl.labels.pile) { layout(); paint(); } });
  };
  if (root.classList.contains("is-intro")) intro();
  else if (EE.arrived) {
    // If arrived by paging, no curtain — the rings scatter right from where they are stacked
    setTimeout(() => { hero.dispatchEvent(new Event("fx:card")); hero.dispatchEvent(new Event("fx:burst")); }, 80);
  } else {
    root.classList.remove("scroll-locked");
    setTimeout(() => { hero.dispatchEvent(new Event("fx:card")); hero.dispatchEvent(new Event("fx:burst")); }, 80);
    EE.open();
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero text is bound to scroll and lifts 60px as it clears (top top → center top)
    gsap.to(".ee-hero__copy", { opacity: 0, y: -60, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "center top", scrub: true } });

    // The About text words fill from .16 to 1 (top 82% to center 42%, scrub .4, .1 apart)
    document.querySelectorAll("[data-scrub-words]").forEach((el) => {
      SplitText.create(el, { type: "words", autoSplit: true, onSplit: (s) => gsap.fromTo(s.words, { opacity: 0.16 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 82%", end: "center 42%", scrub: 0.4 } }) });
    });
  });

  // ───── Pinned label — blends into the name of the section passing through the center (.9s, speed .5)
  const pinned = document.querySelector("[data-pinned-label]");
  if (pinned) {
    let now = 0;
    document.querySelectorAll("[data-post]").forEach((post, i) => {
      ScrollTrigger.create({ trigger: post, start: "top center", end: "bottom center", onToggle: (st) => {
        if (!st.isActive || i === now) return;
        now = i;
        const t = post.dataset.label;
        reduced ? (pinned.textContent = t) : gsap.to(pinned, { duration: 0.9, ease: "none", overwrite: true, scrambleText: { text: t, chars: EE.scrambleChars(t), speed: 0.5 } });
      } });
    });
  }

  // ───── More work — hovering a row dims the other rows, and a fixed panel opens that row’s photo
  const list = document.querySelector(".ee-project-list");
  if (list) {
    const preview = document.querySelector(".ee-preview"), frame = preview.querySelector(".ee-preview__frame");
    const layers = [...frame.children];
    list.querySelectorAll(".ee-project").forEach((li, i) => li.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      list.setAttribute("data-has-active", "");
      list.querySelectorAll("[data-active]").forEach((x) => x.removeAttribute("data-active"));
      li.setAttribute("data-active", "");
      layers.forEach((l, n) => l.toggleAttribute("data-active", n === i));
      frame.style.setProperty("--ratio", layers[i].dataset.ratio);
      preview.setAttribute("data-visible", "");
    }));
    list.addEventListener("pointerleave", () => {
      list.removeAttribute("data-has-active");
      list.querySelectorAll("[data-active]").forEach((x) => x.removeAttribute("data-active"));
      layers.forEach((l) => l.removeAttribute("data-active"));
      preview.removeAttribute("data-visible");
    });
  }

  // ───── Logo strip — on hover it stops in 1.1s power3.out and resumes on leave in .9s power2.in. A button can stop it entirely
  const logos = document.querySelector(".ee-logos");
  const anim = logos?.querySelector(".ee-logos__track").getAnimations()[0];
  if (anim) {
    const r = { rate: 1 };
    let held = false;
    const rateTo = (v) => gsap.to(r, { rate: v, duration: v ? 0.9 : 1.1, ease: v ? "power2.in" : "power3.out", overwrite: true, onUpdate: () => (anim.playbackRate = r.rate) });
    logos.addEventListener("pointerenter", () => rateTo(0));
    logos.addEventListener("pointerleave", () => !held && rateTo(1));
    const btn = logos.querySelector(".ee-logos__toggle");
    btn.addEventListener("click", () => {
      held = !held;
      btn.setAttribute("aria-pressed", String(held));
      btn.querySelector("span").textContent = held ? "Play" : "Pause";
      btn.querySelector("path").setAttribute("d", held ? "M2 1 9 5 2 9Z" : "M2 1h2v8H2zM6 1h2v8H6z");
      rateTo(held ? 0 : 1);
    });
  }

  // ───── 3D figure — our basic-shape figure with the same height (1.9) and the same silhouette proportions. It turns slowly (.32 rad/s), rotates when dragged (1px .01rad), and dances when pressed
  const host = document.querySelector(".ee-figure");
  if (host && window.THREE) {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      io.disconnect();
      buildFigure(host);
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && start(), { rootMargin: "1600px 0px" });
    io.observe(host);
    if (matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches) addEventListener("load", () => setTimeout(() => (window.requestIdleCallback || setTimeout)(start, { timeout: 4000 }), 1200), { once: true });
  }

  function buildFigure(host) {
    const T = THREE;
    const col = (n) => new T.Color(css(n) || "gray");
    const renderer = new T.WebGLRenderer({ antialias: devicePixelRatio < 2, alpha: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.NeutralToneMapping;
    host.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const cam = new T.PerspectiveCamera(28, 1, 0.1, 50);
    cam.position.set(0, 1.05, 6);
    cam.lookAt(0, 0.95, 0);
    scene.add(new T.HemisphereLight(col("--kf-bg"), col("--kf-dim"), 1.8));
    const key = new T.DirectionalLight(col("--kf-bg"), 1.3); key.position.set(1.5, 3, 4); scene.add(key);
    const fillL = new T.DirectionalLight(col("--kf-bg"), 0.5); fillL.position.set(-3, 1.5, 2); scene.add(fillL);
    const rim = new T.DirectionalLight(col("--kf-bg"), 0.5); rim.position.set(-2, 3, -3); scene.add(rim);

    // Foot shadow — circle fading outward from 28% ink color
    const sc = document.createElement("canvas");
    sc.width = sc.height = 128;
    const g = sc.getContext("2d"), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    const ink = col("--kf-ink");
    grad.addColorStop(0, `rgb(${ink.r * 255 | 0} ${ink.g * 255 | 0} ${ink.b * 255 | 0} / 0.28)`);
    grad.addColorStop(1, `rgb(${ink.r * 255 | 0} ${ink.g * 255 | 0} ${ink.b * 255 | 0} / 0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    const shadowTex = new T.CanvasTexture(sc);
    const shadow = new T.Mesh(new T.PlaneGeometry(1.4, 1.4), new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002;
    scene.add(shadow);

    // Figure — five fills (shirt, pants, skin, hair, shoes) come from skin variables
    const mat = (n, r = 0.75) => new T.MeshStandardMaterial({ color: col(n), roughness: r });
    const M = { shirt: mat("--kf-surface"), pants: mat("--kf-ink-soft", 0.9), skin: mat("--kf-raised", 0.6), hair: mat("--kf-ink", 0.95), shoe: mat("--kf-ink", 0.5) };
    const cap = (r, len, m) => { const me = new T.Mesh(new T.CapsuleGeometry(r, len, 6, 14), m); me.position.y = -(len / 2 + r * 0.6); return me; };
    const fig = new T.Group(), body = new T.Group();
    fig.add(body);
    const hips = new T.Group(); hips.position.y = 0.97; body.add(hips);
    const pelvis = new T.Mesh(new T.CapsuleGeometry(0.16, 0.06, 6, 14), M.pants); pelvis.scale.set(1.1, 1, 0.8); hips.add(pelvis);
    const chest = new T.Group(); chest.position.y = 0.06; hips.add(chest);
    const torso = new T.Mesh(new T.CapsuleGeometry(0.18, 0.36, 8, 16), M.shirt); torso.position.y = 0.26; torso.scale.set(1.18, 1, 0.72); chest.add(torso);
    const neck = new T.Mesh(new T.CylinderGeometry(0.05, 0.055, 0.1, 12), M.skin); neck.position.y = 0.6; chest.add(neck);
    const head = new T.Group(); head.position.y = 0.64; chest.add(head);
    const skull = new T.Mesh(new T.SphereGeometry(0.115, 24, 18), M.skin); skull.position.y = 0.12; skull.scale.set(0.92, 1.08, 1); head.add(skull);
    const hair = new T.Mesh(new T.SphereGeometry(0.122, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), M.hair); hair.position.set(0, 0.135, -0.008); hair.scale.set(0.95, 1.05, 1.05); head.add(hair);
    const limb = (side) => {
      const sh = new T.Group(); sh.position.set(side * 0.25, 0.5, 0); chest.add(sh);
      const sleeve = cap(0.065, 0.12, M.shirt); sh.add(sleeve);
      const upper = cap(0.05, 0.2, M.skin); upper.position.y = -0.17; sh.add(upper);
      const el = new T.Group(); el.position.y = -0.32; sh.add(el);
      el.add(cap(0.045, 0.22, M.skin));
      const hand = new T.Mesh(new T.SphereGeometry(0.05, 12, 10), M.skin); hand.position.y = -0.32; el.add(hand);
      const hp = new T.Group(); hp.position.set(side * 0.1, -0.02, 0); hips.add(hp);
      hp.add(cap(0.085, 0.3, M.pants));
      const kn = new T.Group(); kn.position.y = -0.46; hp.add(kn);
      kn.add(cap(0.072, 0.3, M.pants));
      const foot = new T.Mesh(new T.BoxGeometry(0.1, 0.07, 0.25), M.shoe); foot.position.set(0, -0.44, 0.05); kn.add(foot);
      return { sh, el, hp, kn };
    };
    const L = limb(1), R = limb(-1);
    scene.add(fig);
    fig.rotation.y = -0.5;

    // Motion — mixes standing (breathing, shifting weight) with dance (knee bounce, arm swing, hip twist). Switches to dance in .4s and returns in .5s
    const blend = { w: 0 };
    const pose = (t) => {
      const w = blend.w, idle = 1 - w;
      const br = Math.sin(t * 2.1), sw = Math.sin(t * 0.9), beat = t * Math.PI * 2 * 1.9;
      const b = Math.abs(Math.sin(beat / 2));
      hips.position.y = 0.97 - w * 0.06 * b;
      hips.position.x = idle * 0.02 * sw + w * 0.05 * Math.sin(beat / 2);
      hips.rotation.y = w * 0.35 * Math.sin(beat / 4);
      chest.rotation.z = idle * 0.02 * sw - w * 0.12 * Math.sin(beat / 2);
      chest.rotation.x = idle * 0.015 * br + w * 0.08 * b;
      head.rotation.x = -idle * 0.04 + w * 0.15 * b;
      head.rotation.y = idle * 0.12 * Math.sin(t * 0.37);
      L.sh.rotation.z = idle * (0.12 + 0.02 * br) + w * (1.9 + 0.5 * Math.sin(beat));
      R.sh.rotation.z = -idle * (0.12 + 0.02 * br) - w * (1.9 + 0.5 * Math.sin(beat + Math.PI));
      L.sh.rotation.x = idle * 0.05 * sw - w * 0.3; R.sh.rotation.x = -idle * 0.05 * sw - w * 0.3;
      L.el.rotation.x = -idle * 0.18 - w * (0.9 + 0.5 * b); R.el.rotation.x = -idle * 0.2 - w * (0.9 + 0.5 * (1 - b));
      L.hp.rotation.x = -w * 0.35 * b; R.hp.rotation.x = -w * 0.35 * b;
      L.kn.rotation.x = w * 0.7 * b; R.kn.rotation.x = w * 0.7 * b;
      L.hp.rotation.z = idle * 0.03 + w * 0.08; R.hp.rotation.z = -idle * 0.03 - w * 0.08;
    };

    let dist = 4.7, far = 4.7;
    const size = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      cam.aspect = w / h;
      dist = Math.max(4.7, 3.5 / cam.aspect);
      far = dist * 1.15;
      renderer.setSize(w, h, false);
      if (!dancing) cam.position.z = dist;
      cam.lookAt(0, 0.95, 0);
      cam.updateProjectionMatrix();
      renderer.render(scene, cam);
    };
    const ro = new ResizeObserver(size);
    ro.observe(host);

    const base = reduced ? 0 : 0.32;
    let spin = base, dancing = false, raf = 0, last = performance.now(), visible = false, t0 = performance.now();
    const drag = { on: false, id: -1, x: 0, t: 0, moved: 0, start: 0 };
    const frame = (now) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (dancing && !drag.on) {
        const front = Math.round(fig.rotation.y / (Math.PI * 2)) * Math.PI * 2;
        fig.rotation.y += (front - fig.rotation.y) * (1 - Math.exp(-3 * dt));
        spin = 0;
      } else if (!drag.on) {
        spin += (base - spin) * (1 - Math.exp(-1.6 * dt));
        fig.rotation.y += spin * dt;
      }
      const goal = dancing ? far : dist;
      if (Math.abs(cam.position.z - goal) > 0.001) { cam.position.z += (goal - cam.position.z) * (1 - Math.exp(-3 * dt)); cam.lookAt(0, 0.95, 0); }
      pose(reduced ? 0 : (now - t0) / 1000);
      renderer.render(scene, cam);
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const wake = () => { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } };

    const tap = host.parentElement.querySelector(".ee-figure-tap");
    const toggle = () => {
      dancing = !dancing;
      host.setAttribute("aria-pressed", String(dancing));
      host.setAttribute("data-cursor", dancing ? "Stopping" : "Dancing");
      if (tap) tap.querySelector(".ee-figure-tap__t").textContent = dancing ? "Stopping" : "Dancing";
      gsap.to(blend, { w: dancing ? 1 : 0, duration: dancing ? 0.4 : 0.5, ease: "none", overwrite: true });
      EE.refreshCursor?.();
      wake();
    };
    if (tap && !reduced) { tap.hidden = false; tap.addEventListener("click", toggle); }
    host.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
    host.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      Object.assign(drag, { on: true, id: e.pointerId, x: e.clientX, t: e.timeStamp, start: e.timeStamp, moved: 0 });
      spin = 0;
      host.setPointerCapture(e.pointerId);
      host.dataset.dragging = "";
      wake();
    });
    host.addEventListener("pointermove", (e) => {
      if (!drag.on || e.pointerId !== drag.id) return;
      const d = (e.clientX - drag.x) * 0.01, dt = (e.timeStamp - drag.t) / 1000;
      fig.rotation.y += d;
      drag.moved += Math.abs(e.clientX - drag.x);
      if (dt > 0) spin = Math.max(-9, Math.min(9, 0.4 * spin + (d / dt) * 0.6));
      drag.x = e.clientX; drag.t = e.timeStamp;
    });
    const end = (e) => {
      if (!drag.on || e.pointerId !== drag.id) return;
      drag.on = false;
      if (e.timeStamp - drag.t > 80) spin = 0;
      delete host.dataset.dragging;
      if (e.type === "pointerup" && drag.moved < 6 && e.timeStamp - drag.start < 500) toggle();
    };
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(host);
    size();
    pose(0);
    renderer.render(scene, cam);
    host.dataset.ready = "";
  }
})();
