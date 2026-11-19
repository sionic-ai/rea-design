// First page — hero text and flowers scattering, a 3D panel where dandelion seeds fly and gather into a flower, five flower cards (circle-spreading background, number window, flower that fills with color),
// What it wants (swap the text window → letters fly off and become WELLNESS → peony), accordion.
(() => {
  const EG = window.EG, F = window.EGFlowers, T = window.THREE;
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth <= 767;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const peony = { open: 0 };

  // Hero: on entry the letters of each word settle in at .016s intervals, .78s power2.out, and tied to scroll (1.4) the letters slide off to the right while the flower scatters into grains
  const hero = $(".eg-hero"), title = $(".eg-hero__title"), flower = $(".eg-hero__canvas");
  const heroChars = [];
  $$(".eg-hero__line", title).forEach((line) => heroChars.push(EG.splitChars(line)));
  const all = heroChars.flat();
  gsap.set(all, { autoAlpha: 0, xPercent: -110 });
  EG.onIntro(() => {
    document.documentElement.classList.add("eg-ready");
    if (reduce) return gsap.set(all, { autoAlpha: 1, xPercent: 0 });
    let at = 0;
    const tl = gsap.timeline({ delay: 0.08 });
    $$(".eg-word", title).forEach((w) => { const cs = $$(".eg-char", w); tl.fromTo(cs, { autoAlpha: 0, xPercent: -110 }, { autoAlpha: 1, xPercent: 0, duration: 0.78, ease: "power2.out", stagger: 0.016 }, at); at += 0.016 * Math.max(0, cs.length - 1) + 0.022; });
    tl.eventCallback("onComplete", () => { heroOut(); });
  });
  const dissolve = { v: 0 };
  const heroOut = () => {
    if (reduce || hero._out) return;
    hero._out = true;
    const each = all.length > 1 ? Math.min(0.085, 0.72 / (all.length - 1)) : 0;
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: 1.4, invalidateOnRefresh: true, onLeaveBack: () => gsap.set(all, { autoAlpha: 1, xPercent: 0 }) } });
    tl.fromTo(all, { autoAlpha: 1, xPercent: 0 }, { autoAlpha: 0, xPercent: 110, duration: 0.95, ease: "power2.in", immediateRender: false, stagger: each }, 0);
    tl.to(dissolve, { v: 1, duration: phone() ? 2.02 : 2.6, ease: "sine.inOut", onUpdate: () => flower.dispatchEvent(new CustomEvent("fx:dissolve", { detail: dissolve.v })) }, phone() ? 0.06 : 0.1);
    tl.to({}, { duration: 0.3 }, 2.7);
  };

  // ── One 3D board: six seeds drift, gather at the lower left on the first card to become a dandelion, and each card turns into the next flower
  const stageCv = $(".eg-story__canvas canvas");
  const story = $(".eg-story"), cards = $(".eg-cards"), intro = $(".eg-intro");
  let S = null;
  if (T && F && stageCv) {
    S = F.stage(stageCv, { fov: 30, z: 7 });
    const seeds = Array.from({ length: 6 }, () => F.seed());
    seeds.forEach((s) => S.scene.add(s.group));
    const flowers = [F.dandelion(), F.allium(), F.hydrangea(), F.echinacea(), F.artichoke()];
    const holder = new T.Group(); S.scene.add(holder);
    flowers.forEach((f, i) => { holder.add(f.group); f.group.visible = i === 0; f.tint(i === 0 ? 1 : 0); });
    // Where the seed floats (screen ratio) — arcing up over the title like the original’s first scroll scene
    const float = [[0.26, 0.34], [0.38, 0.22], [0.48, 0.16], [0.53, 0.37], [0.71, 0.33], [0.6, 0.5]];
    const st = { hero: 0, intro: 0, gather: 0, cards: 0 };
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => (st.hero = s.progress) });
    ScrollTrigger.create({ trigger: intro, start: "top bottom", end: "bottom top", scrub: true, onUpdate: (s) => (st.intro = s.progress) });
    ScrollTrigger.create({ trigger: cards, start: "top bottom", end: "top top", scrub: true, onUpdate: (s) => (st.gather = s.progress) });
    ScrollTrigger.create({ trigger: cards, start: "top top", end: "bottom bottom", scrub: true, onUpdate: (s) => (st.cards = s.progress * 8) });
    const ease = (k) => k * k * (3 - 2 * k);
    const clamp = (v) => Math.max(0, Math.min(1, v));
    // Cursor is received only while inside the panel (touch ignored as in the original), -1 to 1 relative to the panel
    const ptr = { in: false, x: 0, y: 0, last: null };
    if (!reduce) {
      addEventListener("pointermove", (e) => {
        if (e.pointerType === "touch") return;
        const r = stageCv.getBoundingClientRect();
        ptr.in = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (ptr.in && r.width && r.height) { ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.y = 1 - ((e.clientY - r.top) / r.height) * 2; }
      }, { passive: true });
      const off = () => { ptr.in = false; ptr.last = null; ptr.x = ptr.y = 0; };
      addEventListener("pointerout", (e) => { if (!e.relatedTarget) off(); });
      addEventListener("blur", off);
    }
    // Flowers: pushed toward the pointer by .005 of screen width and tilting 1.5° side to side and 1.8° front to back around the base — damp 2.5 while following, 4.5 when returning to place after the pointer leaves the plate.
    const sway = { x: 0, roll: 0, pitch: 0 }, DEG = Math.PI / 180;
    holder.rotation.order = "ZXY";
    // Seed: when the cursor touches a floating seed it bounces away from the cursor by .021 of screen height (.012 on narrow screens) and 3° (.28s power2.out), then returns in .72s sine.inOut
    const kicks = seeds.map(() => ({ x: 0, y: 0, r: 0, tl: null }));
    const seedBox = new T.Box3().setFromObject(seeds[0].group);
    const seedMid = seedBox.getCenter(new T.Vector3()), seedHalf = 0.5 * seedBox.getSize(new T.Vector3()).length();
    const ray = new T.Raycaster(), ndc = new T.Vector2(), at = new T.Vector3(), seedAt = seeds.map(() => new T.Vector3());
    // Compile the shaders for the five flowers all at once at setup — compiling when first shown freezes the screen
    flowers.forEach((f) => (f.group.visible = true));
    S.renderer.compile(S.scene, S.camera);
    flowers.forEach((f, i) => (f.group.visible = i === 0));
    // The flower sits at the left center of the screen (top center on phone), at 0.8 of the screen height
    const home = () => (phone() ? [0.5, 0.36] : [0.23, 0.58]);
    const sizeOf = () => (phone() ? 0.42 : 0.62);
    let t = 0, last = performance.now(), live = false;
    ScrollTrigger.create({ trigger: story, start: "top bottom", end: "bottom top", onToggle: (s) => (live = s.isActive) });
    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now; t += dt;
      if (!live) return;
      const [hx, hy] = home(), unit = S.unit();
      const head = S.toWorld(hx, hy - 0.18);
      // Seeds: in the lower half of the hero, they rise from the flower head → to a floating spot → gather back at the flower head when the card comes up
      const rise = clamp((st.hero - 0.25) / 0.6), gather = ease(clamp((st.gather - 0.35) / 0.65));
      const c = st.cards;
      const idx = c < 0.5 ? 0 : Math.min(4, 1 + Math.floor((c - 0.5) / 2));
      const compact = S.camera.aspect < 0.65;
      seeds.forEach((s, i) => {
        const [fx, fy] = float[i];
        const drift = st.intro * 0.18;
        const from = S.toWorld(0.5, 0.42), to = S.toWorld(fx + Math.sin(t * 0.4 + i) * 0.01, fy - drift + Math.cos(t * 0.5 + i * 2) * 0.01);
        const p = from.clone().lerp(to, ease(rise));
        const slot = head.clone().add(new T.Vector3(Math.cos(i * 1.05) * 0.4, Math.sin(i * 1.05) * 0.4, 0).multiplyScalar(unit * sizeOf() * 0.3));
        p.lerp(slot, gather);
        const k = kicks[i], sc = unit * 0.11 * (1 - gather * 0.5);
        if (gather >= 0.995 && k.tl) { k.tl.kill(); k.tl = null; k.x = k.y = k.r = 0; }
        seedAt[i].copy(seedMid).multiplyScalar(sc).add(p);
        s.group.position.set(p.x + k.x, p.y + k.y, p.z);
        s.group.scale.setScalar(sc);
        s.group.rotation.z = Math.sin(t * 0.7 + i) * 0.35 * (1 - gather) + (i - 2.5) * 0.12 + k.r;
        s.line.opacity = 0.55 * Math.min(1, rise * 3) * (1 - gather);
        s.group.visible = rise > 0.001 && gather < 0.999;
      });
      let hit = null;
      if (ptr.in && idx === 0) {
        ray.setFromCamera(ndc.set(ptr.x, ptr.y), S.camera);
        let best = Infinity;
        seeds.forEach((s, i) => {
          if (!s.group.visible || gather >= 0.995) return;
          const d = ray.ray.distanceToPoint(seedAt[i]) / Math.max(seedHalf * s.group.scale.x * 0.88, 0.016 * unit);
          if (d <= 1 && d < best) { best = d; hit = i; }
        });
      }
      if (hit !== null && hit !== ptr.last) {
        at.copy(seedAt[hit]).project(S.camera);
        const dx = (at.x - ptr.x) * S.camera.aspect, dy = at.y - ptr.y, len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len, push = unit * (compact ? 0.012 : 0.021), k = kicks[hit];
        k.tl?.kill();
        k.tl = gsap.timeline().to(k, { x: ux * push, y: uy * push, r: -0.052 * ux, duration: 0.28, ease: "power2.out" }).to(k, { x: 0, y: 0, r: 0, duration: 0.72, ease: "sine.inOut" });
      }
      ptr.last = hit;
      // Flower plate: the dandelion fluff fills in with the gathering, and at the turning points where card sections change (0.5·2.5·4.5·6.5) it moves to the next flower
      const swayOn = ptr.in && (idx > 0 || gather >= 0.995);
      const follow = 1 - Math.exp(-(swayOn ? 2.5 : 4.5) * dt), viewW = unit * S.camera.aspect * (compact ? 0.72 : 1);
      sway.x += ((swayOn ? ptr.x * viewW * 0.005 : 0) - sway.x) * follow;
      sway.roll += ((swayOn ? -ptr.x * 1.5 * DEG : 0) - sway.roll) * follow;
      sway.pitch += ((swayOn ? -ptr.y * 1.8 * DEG : 0) - sway.pitch) * follow;
      const hs = unit * sizeOf() * 0.62, base = S.toWorld(hx, hy);
      // Rotate around the base (stem end, 2.7 below the flower head)
      const up = 2.7 * hs, cr = Math.cos(sway.roll), sr = Math.sin(sway.roll), cp = Math.cos(sway.pitch), sp = Math.sin(sway.pitch);
      holder.position.set(base.x + sway.x - sr * up * cp, base.y - up + cr * up * cp, base.z + up * sp);
      holder.scale.setScalar(hs);
      holder.rotation.set(sway.pitch, t * 0.12, sway.roll);
      flowers.forEach((f, i) => {
        f.group.visible = i === idx && (i > 0 || gather > 0.02);
        if (i === 0) { f.tint(1); f.fluff.opacity = 0.32 * gather; f.group.scale.setScalar(0.4 + 0.6 * gather); }
        else if (i === idx) {
          const since = c - (0.5 + 2 * (i - 1));
          const grow = ease(clamp(since / 0.5));
          f.group.scale.setScalar(0.25 + 0.75 * grow);
          f.tint(ease(clamp((since - 0.5) / 1.4)));
        }
      });
      S.render();
    };
    gsap.ticker.add(() => tick(performance.now()));
  }

  // ── Flower card: on the pinned panel, the background circle spreads from a small circle at bottom right to cover (1, power1.inOut), the number window swaps, and the title letters stand up again
  const sticky = $(".eg-cards__sticky");
  const fills = $$(".eg-cards__fill"), dots = $$(".eg-progress__dot"), labels = dots.map((d) => d.querySelector("span"));
  const cardEls = $$(".eg-card"), digits = $$(".eg-counter__win > span"), zero = $(".eg-counter__zero"), heading = $(".eg-cards__heading");
  const circle = (dot, full) => {
    if (!dot) return "circle(0px at 0px 0px)";
    const r = sticky.getBoundingClientRect(), d = dot.getBoundingClientRect();
    const x = d.left - r.left + d.width / 2, y = d.top - r.top + d.height / 2;
    const rad = full ? Math.hypot(Math.max(x, sticky.clientWidth - x), Math.max(y, sticky.clientHeight - y)) + 2 : Math.min(d.width, d.height) / 2;
    return `circle(${rad}px at ${x}px ${y}px)`;
  };
  const titleTls = cardEls.map((c) => { const h = c.querySelector(".eg-card__title"); const chars = EG.splitChars(h); const each = chars.length > 1 ? Math.min(0.085, 1.05 / (chars.length - 1)) : 0; if (!reduce) gsap.set(chars, { autoAlpha: 0, xPercent: -110 }); return gsap.to(chars, { autoAlpha: 1, xPercent: 0, duration: 1.05, ease: "power2.out", paused: true, stagger: each }); });
  const quoteTls = cardEls.map((c) => EG.lineReveal(c.querySelector(".eg-card__quote")));
  const showCard = (i) => { titleTls[i]?.restart(); quoteTls[i]?.restart(); };
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const setFills = () => fills.forEach((f, i) => gsap.set(f, { clipPath: circle(dots[i]) }));
    setFills();
    gsap.set(cardEls, { opacity: (i) => (i === 0 ? 1 : 0) });
    gsap.set(digits, { clipPath: (i) => (i === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)"), opacity: (i) => (i === 0 || phone() ? 1 : 0.3), yPercent: (i) => (i === 0 ? 0 : -20) });
    const tl = gsap.timeline({ scrollTrigger: { trigger: cards, start: "top top", end: "bottom bottom", scrub: phone() ? 0.2 : 1.2, invalidateOnRefresh: true, onRefresh: (s) => { if (s.progress <= 0.001) setFills(); } } });
    ScrollTrigger.create({ trigger: cards, start: "top 88%", once: true, onEnter: () => showCard(0) });
    tl.to(heading, { autoAlpha: 0, duration: 0.15, ease: "none" }, 0);
    if (!phone()) tl.to(zero, { opacity: 0.3, duration: 0.2, ease: "none" }, 0.25);
    fills.forEach((f, n) => {
      const r = 2 * n;
      tl.call(() => { const dir = tl.scrollTrigger?.direction ?? 1; showCard(dir < 0 ? n : n + 1); }, null, r + 0.5);
      tl.to(f, { clipPath: () => circle(dots[n], true), duration: 1, ease: "power1.inOut" }, r);
      tl.to(labels[n], { autoAlpha: 0, duration: 0.06, ease: "none" }, r);
      tl.to(digits[n], { clipPath: "inset(0% 0% 100% 0%)", yPercent: 20, duration: 0.28, ease: "sine.inOut" }, r + 0.1);
      tl.to(digits[n + 1], { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 0.48, ease: "sine.inOut" }, r + 0.38);
      tl.to(cardEls[n], { opacity: 0, duration: 0.18, ease: "none" }, r + 0.22);
      tl.to(cardEls[n + 1], { opacity: 1, duration: 0.24, ease: "none" }, r + 0.5);
    });
    tl.to({}, { duration: 1 }, 7);
    addEventListener("resize", () => ScrollTrigger.refresh());
  });
  if (reduce) { gsap.set(cardEls, { opacity: 0 }); gsap.set(cardEls[0], { opacity: 1 }); titleTls.forEach((t) => t.progress(1)); quoteTls.forEach((t) => t.progress(1)); }

  // ── Wishes: pressing the wish below swaps the text window · description panel (original values)
  const want = $(".eg-want");
  const letters = $$(".eg-want__letter"), panels = $$(".eg-want__panel"), desires = $$(".eg-desire");
  let cur = 0, swapTl = null;
  const swap = (n) => {
    if (n === cur) return;
    const prev = cur; cur = n;
    desires.forEach((d) => d.classList.toggle("is-on", +d.dataset.i === n));
    if (want.classList.contains("is-flying")) return;
    swapTl?.kill();
    letters.forEach((l, i) => { if (i !== prev && i !== n) { gsap.set(l, { autoAlpha: 0, xPercent: 108 }); l.classList.remove("is-on"); } });
    panels.forEach((p, i) => { if (i !== prev && i !== n) { gsap.set(p, { autoAlpha: 0 }); p.classList.remove("is-on"); } });
    if (reduce) { letters.forEach((l, i) => l.classList.toggle("is-on", i === n)); panels.forEach((p, i) => p.classList.toggle("is-on", i === n)); return; }
    const inFades = $$(".eg-want__fade", panels[n]), outFades = $$(".eg-want__fade", panels[prev]);
    gsap.set(letters[n], { autoAlpha: 1, xPercent: 108 });
    gsap.set(panels[n], { autoAlpha: 1 });
    gsap.set(inFades, { autoAlpha: 0, filter: "blur(4px)", x: -24 });
    // Original bundle values — wide screens: exit 1.15s, enter 1.35s (.12s later), text exit .4s, text enter .9s (.42s later, .085s apart), phone .45·.55·.22·.45
    const sm = innerWidth <= 768, out = sm ? 0.45 : 1.15, inn = sm ? 0.55 : 1.35, fo = sm ? 0.22 : 0.4, fi = sm ? 0.45 : 0.9;
    gsap.set(panels[n], { pointerEvents: "auto" });
    swapTl = gsap.timeline({ onComplete: () => { letters.forEach((l, i) => l.classList.toggle("is-on", i === n)); panels.forEach((p, i) => p.classList.toggle("is-on", i === n)); gsap.set(outFades, { clearProps: "opacity,visibility,filter,transform" }); } })
      .to(letters[prev], { autoAlpha: 0, xPercent: 108, duration: out, ease: "power2.inOut" }, 0)
      .to(letters[n], { xPercent: 0, duration: inn, ease: "power2.inOut" }, sm ? 0.05 : 0.12)
      .to(outFades, { autoAlpha: 0, x: 20, filter: "blur(3px)", duration: fo, ease: "power2.in", stagger: sm ? 0.015 : 0.025 }, 0)
      .set(panels[prev], { autoAlpha: 0, pointerEvents: "none" }, fo + 0.04)
      .to(inFades, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: fi, ease: "power3.out", stagger: sm ? 0.04 : 0.085 }, sm ? 0.18 : 0.42);
  };
  // Like the original, hover, focus and press all use that wind, and leaving the list returns to the first wind
  desires.forEach((d) => ["pointerenter", "focus", "click"].forEach((ev) => d.addEventListener(ev, () => swap(+d.dataset.i))));
  const desireBox = $(".eg-want__desires");
  desireBox?.addEventListener("pointerleave", () => swap(0));
  desireBox?.addEventListener("focusout", (e) => { if (!desireBox.contains(e.relatedTarget)) swap(0); });

  // ── Flying letters: once pinning ends, over one screen (scrub .5) W·L·L·N·S·S fly to the WELLNESS spot above the peony below and the two E’s fill in
  const track = $(".eg-want__track"), targetChars = $$(".eg-want__target span"), wellness = $(".eg-want__wellness");
  const srcLetters = () => [letters[0].querySelector("b"), ...desires.map((d) => d.querySelector(".eg-desire__letter"))];
  const slots = targetChars.filter((s) => !s.classList.contains("is-fill")), fillers = targetChars.filter((s) => s.classList.contains("is-fill"));
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const clones = srcLetters().map((src) => { const c = document.createElement("span"); c.className = "eg-fly"; c.textContent = src.textContent; c.setAttribute("aria-hidden", "true"); c.style.visibility = "hidden"; document.body.append(c); return c; });
    gsap.set(targetChars, { autoAlpha: 0 });
    const fp = { v: 0 };
    const place = () => {
      const p = fp.v, srcs = srcLetters();
      want.classList.toggle("is-flying", p > 0.001);
      clones.forEach((c, i) => {
        const a = srcs[i].getBoundingClientRect(), b = slots[i].getBoundingClientRect();
        const k = gsap.parseEase("power2.inOut")(Math.max(0, Math.min(1, (p - i * 0.04) / 0.76)));
        const fsA = parseFloat(getComputedStyle(srcs[i]).fontSize), fsB = parseFloat(getComputedStyle(slots[i]).fontSize);
        const fs = fsA + (fsB - fsA) * k;
        c.style.fontSize = `${fs}px`;
        c.style.visibility = p > 0.001 && p < 0.999 ? "visible" : "hidden";
        gsap.set(c, { x: a.left + (b.left - a.left) * k, y: a.top + (b.top - a.top) * k, color: k > 0.5 ? getComputedStyle(slots[i]).color : getComputedStyle(srcs[i]).color });
        srcs[i].style.opacity = p > 0.001 ? "0" : "";
      });
      slots.forEach((s) => (s.style.opacity = p >= 0.999 ? "1" : "0"));
      slots.forEach((s) => (s.style.visibility = "visible"));
      fillers.forEach((f) => { f.style.visibility = "visible"; f.style.opacity = String(Math.max(0, Math.min(1, (p - 0.7) / 0.3))); });
    };
    const fade = gsap.timeline({ paused: true })
      .to($$(".eg-desire__body"), { autoAlpha: 0, filter: "blur(10px)", duration: 0.35, stagger: 0.02, ease: "power2.inOut" }, 0)
      .to($$(".eg-want__panel.is-on .eg-want__fade, .eg-want__panel .eg-want__fade"), { autoAlpha: 0, filter: "blur(8px)", duration: 0.35, stagger: 0.02, ease: "power2.inOut" }, 0.02)
      .to($(".eg-want__divider"), { autoAlpha: 0, duration: 0.28, ease: "power2.inOut" }, 0)
      .to($(".eg-want__heading"), { autoAlpha: 0, filter: "blur(6px)", duration: 0.32, ease: "power2.inOut" }, 0)
      .to({}, { duration: 0.65 }, 0.35);
    const st = ScrollTrigger.create({ trigger: track, start: "bottom bottom", end: () => `+=${innerHeight}`, scrub: 0.5, invalidateOnRefresh: true,
      onUpdate: (s) => { fp.v = s.progress; fade.progress(s.progress); place(); },
      onLeaveBack: () => { fp.v = 0; fade.progress(0); place(); } });
    // Peony section: text scatters with 14px blur (.28 to .28) and the flower opens
    const wellChars = gsap.timeline({ paused: true }).to(targetChars, { autoAlpha: 0, filter: "blur(14px)", scale: 1.04, duration: 0.28, ease: "power2.inOut", stagger: { amount: 0.05, from: "random" } }, 0.28).to({}, { duration: 0.44 }, 0.56);
    const wst = ScrollTrigger.create({ trigger: wellness, start: "top top", end: "bottom bottom", scrub: 0.5, onUpdate: (s) => { wellChars.progress(s.progress); peony.open = s.progress; } });
    return () => { st.kill(); wst.kill(); clones.forEach((c) => c.remove()); srcLetters().forEach((s) => (s.style.opacity = "")); };
  });
  mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.set(targetChars, { autoAlpha: 0, filter: "blur(8px)", scale: 0.9, y: 10 });
    const tw = gsap.to(targetChars, { autoAlpha: 1, filter: "blur(0px)", scale: 1, y: 0, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: wellness, start: "top 75%", end: "center center", scrub: 1.2 } });
    const st = ScrollTrigger.create({ trigger: wellness, start: "top 85%", end: "bottom bottom", scrub: true, onUpdate: (s) => (peony.open = s.progress) });
    return () => { tw.scrollTrigger?.kill(); tw.kill(); st.kill(); };
  });

  // ── Peony panel: spins slowly from the bottom center, a few petals fall, and white grains float. Blurred leaf art behind
  const glCv = $(".eg-want__gl"), leaves = $(".eg-want__leaves");
  if (leaves) {
    const paintLeaves = () => {
      const w = (leaves.width = leaves.clientWidth), h = (leaves.height = leaves.clientHeight), c = leaves.getContext("2d");
      const css = getComputedStyle(document.documentElement);
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, css.getPropertyValue("--kf-bg").trim()); sky.addColorStop(0.3, css.getPropertyValue("--kf-surface").trim()); sky.addColorStop(1, css.getPropertyValue("--kf-bg").trim());
      c.fillStyle = sky; c.fillRect(0, 0, w, h);
      c.filter = "blur(18px)";
      const leaf = (x, y, len, ang, col) => { c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.18, -len * 0.5, 0, -len); c.quadraticCurveTo(-len * 0.18, -len * 0.5, 0, 0); c.fill(); c.restore(); };
      const greens = ["rgba(120,150,90,.35)", "rgba(150,170,110,.3)", "rgba(100,130,80,.28)"]; /* Not skin: leaf drawing color */
      for (let i = 0; i < 9; i++) leaf(w * (0.02 + i * 0.012), h * 1.02, h * (0.3 + (i % 3) * 0.08), -0.5 + i * 0.12, greens[i % 3]);
      for (let i = 0; i < 9; i++) leaf(w * (0.8 + i * 0.01), h * (0.75 + (i % 2) * 0.1), h * (0.35 + (i % 3) * 0.06), -0.2 + i * 0.1, greens[(i + 1) % 3]);
      c.filter = "none";
    };
    paintLeaves();
    new ResizeObserver(paintLeaves).observe(leaves);
  }
  if (T && F && glCv) {
    const P = F.stage(glCv, { fov: 30, z: 7 });
    const fl = F.peony(); P.scene.add(fl.group); fl.tint(1);
    const petals = Array.from({ length: 6 }, (_, i) => { const m = F.petal(); m.userData = { x: [0.02, 0.2, 0.85, 0.7, 0.4, 0.95][i], y0: Math.random(), s: 0.5 + Math.random() * 0.6, r: Math.random() * 6 }; P.scene.add(m); return m; });
    const n = 220, pts = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pts[i * 3] = (Math.random() - 0.5) * 8; pts[i * 3 + 1] = (Math.random() - 0.5) * 5; pts[i * 3 + 2] = (Math.random() - 0.5) * 2; }
    const pg = new T.BufferGeometry(); pg.setAttribute("position", new T.BufferAttribute(pts, 3));
    const specks = new T.Points(pg, new T.PointsMaterial({ color: "#ffffff", size: 0.025, transparent: true, opacity: 0.8 })); /* Not skin: white grains */
    P.scene.add(specks);
    let live = false, t = 0, last = performance.now();
    ScrollTrigger.create({ trigger: wellness, start: "top bottom", end: "bottom top", onToggle: (s) => (live = s.isActive) });
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now; t += dt;
      if (!live) return;
      const u = P.unit(), o = peony.open;
      fl.group.position.copy(P.toWorld(0.5, 0.56 - o * 0.25));
      fl.group.scale.setScalar(u * (phone() ? 0.26 : 0.34) * (1 + o * 0.25));
      fl.group.rotation.set(0.55 - o * 0.2, t * 0.15, 0);
      petals.forEach((m, i) => { const d = m.userData; const y = ((d.y0 + t * 0.03 * d.s) % 1.2) - 0.1; m.position.copy(P.toWorld(d.x + Math.sin(t * 0.5 + i) * 0.02, y)); m.scale.setScalar(u * 0.06 * d.s); m.rotation.set(t * 0.6 + d.r, t * 0.4, d.r); });
      specks.rotation.y = t * 0.01;
      P.render();
    });
  }

  // ── Accordion: only one open
  const items = $$(".eg-acc__item");
  items.forEach((it) => it.querySelector(".eg-acc__btn").addEventListener("click", () => {
    items.forEach((o) => { const on = o === it; o.classList.toggle("is-open", on); o.querySelector(".eg-acc__btn").setAttribute("aria-expanded", String(on)); });
    setTimeout(() => ScrollTrigger.refresh(), 1050);
  }));
})();
