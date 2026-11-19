/* Home page motion — values are read straight from the original bundle (in parentheses in the comment). */
(() => {
  const { reduce, rem, cipherSplit, cipherTween, lock, mm } = window.CFS;
  const Crow = window.CFSCrow;
  const css = (name) => Crow.color(`var(${name})`);
  const phone = () => matchMedia("(max-width: 767px)").matches;

  /* ── Hero intro: title drops for 3s (power1.out) · text decodes symbols over 2.1s · header revealed · last letter falls (.7 power2.in) ── */
  const hero = document.querySelector(".hero");
  const h1 = hero.querySelector(".hero__h1");
  const hd = document.querySelector(".hd");
  const splitTitle = () => {
    const lines = h1.dataset.title.split("\n");
    h1.innerHTML = "";
    const live = [];
    let last = null;
    lines.forEach((line, li) => {
      if (li) h1.append(document.createElement("br"));
      const chars = [...line];
      // On wide screens the very last character drops, on phones the first character of the last word (original last / firstOfLastWord)
      const lastWordStart = line.trimEnd().lastIndexOf(" ") + 1;
      chars.forEach((ch, ci) => {
        const s = document.createElement("span");
        s.className = "hero__char";
        s.textContent = ch;
        h1.append(s);
        if (ch !== " ") live.push({ el: s, to: ch });
        const isLast = li === lines.length - 1 && (phone() ? ci === lastWordStart : ci === chars.length - 1);
        if (isLast) { s.classList.add("hero__char--last"); last = s; }
      });
    });
    return { live, last };
  };
  const { live: titleLive, last: lastChar } = splitTitle();

  const fallTo = () => {
    // The fallen letter lies tilted just above the line under the title — to the right on wide screens, far down from the line start on phones
    const r = lastChar.getBoundingClientRect();
    const floor = hero.querySelector(".hero__bottom-mask").getBoundingClientRect().top;
    return phone()
      ? { y: floor - r.bottom - 0.4 * rem() + (innerHeight * 0.36), x: -r.left + 0.9 * rem(), rotation: -6 }
      : { y: floor - r.bottom - 0.3 * rem(), x: 1.6 * rem(), rotation: 16 };
  };

  const finishIntro = () => {
    hd.classList.remove("hd--intro");
    hero.setAttribute("data-intro", "done");
    titleLive.forEach(({ el, to }) => { el.textContent = to; });
    if (lastChar) gsap.set(lastChar, fallTo());
  };

  if (reduce) {
    finishIntro();
  } else {
    lock(true);
    scrollTo(0, 0);
    const title = hero.querySelector(".hero__title");
    const bottom = hero.querySelector(".hero__bottom");
    const clouds = hero.querySelector(".hero__clouds svg");
    titleLive.forEach(({ el }) => { el.style.width = el.getBoundingClientRect().width + "px"; el.style.textAlign = "center"; });
    // Original: y = −(title box height + h1 height) to 0
    const from = -(title.offsetHeight + h1.offsetHeight);
    const hIn = hd.querySelector(".hd__in"), emblem = hd.querySelector(".hd__emblem"), letters = hd.querySelectorAll(".hd__logo .hd__letter");
    gsap.set(hIn, { autoAlpha: 0, y: -rem() });
    gsap.set(emblem, { autoAlpha: 0, scale: 0.8, transformOrigin: "center center" });
    gsap.set(letters, { autoAlpha: 0, x: -0.5 * rem() });
    hd.classList.remove("hd--intro");
    // The original starts the intro once the font arrives (1.5s max) or two frames later — until then the title stays hidden above
    gsap.set(h1, { y: from });
    gsap.set(bottom, { yPercent: 100 });
    gsap.set(clouds, { y: 27.375 * rem() });
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power1.out" } });
    Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1500))])
      .then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      .then(() => tl.play());
    tl.fromTo(h1, { y: from }, { y: 0, duration: 3 }, 0)
      .fromTo(bottom, { yPercent: 100 }, { yPercent: 0, duration: 3 }, 0)
      .fromTo(clouds, { y: 27.375 * rem() }, { y: 0, duration: 3, ease: "sine.inOut" }, 0);
    // Symbol scramble 2.1s (.7×3) — swaps every 0.04s and settles into place starting from the first letter at 0.45s
    tl.add(cipherTween(titleLive, { duration: 2.1, startResolveAt: 0.45, interval: 0.04 }), 0);
    const head = gsap.timeline();
    head.to(hIn, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0)
      .to(emblem, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.1)
      .to(letters, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }, 0.45)
      .add(() => window.CFSHeaderCipher?.(), 0.8);
    tl.add(head, 3);
    tl.add(() => {
      titleLive.forEach(({ el }) => { el.style.width = ""; });
      if (lastChar) gsap.to(lastChar, { ...fallTo(), duration: 0.7, ease: "power2.in" });
    }, 3);
    tl.add(() => {
      lock(false);
      hero.setAttribute("data-intro", "done");
      ScrollTrigger.refresh();
    }, 3.7);
  }

  /* ── Hero scroll: crow frames (original 124), airplane, collision (black screen · ±8px shake) ── */
  const stage = hero.querySelector(".hero__stage");
  const cv = hero.querySelector(".hero__crow");
  const ctx = cv.getContext("2d");
  const plane = hero.querySelector(".hero__plane");
  const burst = hero.querySelector(".hero__burst");
  const FRAMES = 124;
  let heroFrame = 0;
  const sizeCanvas = (c) => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = Math.round(c.clientWidth * dpr);
    c.height = Math.round(c.clientHeight * dpr);
    return dpr;
  };
  let heroDpr = sizeCanvas(cv);
  // Frame number → pose and position: standing → crouching to bite the phone → taking off → flapping toward the upper left
  const heroPose = (f) => {
    const W = cv.clientWidth, H = cv.clientHeight;
    const scale = phone() ? (H * 0.32) / 140 : (H * 0.43) / 140;
    const baseX = (phone() ? 0.63 : 0.85) * W - 50 * scale, baseY = (phone() ? 0.76 : 0.85) * H - 136 * scale;
    const p = f / (FRAMES - 1);
    let pose, dx = 0, dy = 0, carry = 0;
    if (p < 0.14) pose = Crow.poses.stand;
    else if (p < 0.3) pose = Crow.mix(Crow.poses.stand, Crow.poses.crouch, (p - 0.14) / 0.16);
    else if (p < 0.42) { pose = Crow.mix(Crow.poses.crouch, Crow.poses.up, (p - 0.3) / 0.12); carry = 1; }
    else {
      const q = (p - 0.42) / 0.58;
      pose = Crow.flap(q * 5);
      dx = -q * W * (phone() ? 0.35 : 0.42);
      dy = -q * H * 0.36 - Math.sin(q * Math.PI) * H * 0.05;
      carry = 1;
    }
    return { pose, x: baseX + dx, y: baseY + dy, scale, carry };
  };
  const drawPhone = (c, x, y, s, rot) => {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = css("--kf-accent");
    c.beginPath();
    c.roundRect(-13 * s, -6 * s, 26 * s, 12 * s, 3 * s);
    c.fill();
    c.fillStyle = css("--kf-accent-soft");
    c.fillRect(-10 * s, -4 * s, 8 * s, 8 * s);
    c.restore();
  };
  const drawHero = () => {
    const W = cv.width, H = cv.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.setTransform(heroDpr, 0, 0, heroDpr, 0, 0);
    const st = heroPose(heroFrame);
    const ink = css("--site-night");
    Crow.draw(ctx, st.pose, { x: st.x, y: st.y, scale: st.scale, fill: ink, detail: css("--kf-bg") });
    const s = st.scale * 1.1;
    if (st.carry) drawPhone(ctx, st.x + 46 * st.scale, st.y + 128 * st.scale, s, -0.3);
    else drawPhone(ctx, st.x + 102 * st.scale, st.y + 132 * st.scale, s, -0.32);
  };
  drawHero();

  if (!reduce) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(plane, { x: () => -plane.offsetWidth * 1.05 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
          onUpdate: (self) => {
            // The frames advance over the first 70% of the hero — after that comes the plane and the collision
            const f = Math.min(FRAMES - 1, Math.round((self.progress / 0.7) * (FRAMES - 1)));
            if (f !== heroFrame) { heroFrame = f; drawHero(); }
            hd.classList.toggle("hd--dark", self.progress > 0.86);
          },
        },
      });
      // The plane has transformOrigin right center and enters from off the left of the screen
      tl.to(plane, { x: () => innerWidth * 0.32, duration: 0.35 }, 0.5)
        .addLabel("explosion", 0.86)
        .set(burst, { autoAlpha: 1 }, "explosion")
        .fromTo(burst.querySelector("svg"), { scale: 0, rotation: -20 }, { scale: 2.4, rotation: 10, duration: 0.1, ease: "power2.out" }, "explosion")
        .to(burst.querySelector("svg"), { autoAlpha: 0, duration: 0.04 }, "explosion+=0.08")
        .to(stage, { x: 8, duration: 0.0495 }, "explosion")
        .to(stage, { x: -8, duration: 0.0495 }, "explosion+=0.0495")
        .to(stage, { x: 0, duration: 0.051 }, "explosion+=0.099")
        .to([cv, plane], { autoAlpha: 0, duration: 0.014 }, "explosion")
        .to({}, { duration: 0.01 }, 1);
      return () => gsap.set([stage, cv, plane, burst], { clearProps: "all" });
    });
  }

  /* ── Night sky story: pin 9.15 screens, four titles alternate every 0.35s (2e-.35), stacking (8·10·12, .45 power2.out), last title (12.45), crow Lottie ── */
  const story = document.querySelector(".story");
  const pin = story.querySelector(".story__pin");
  const titles = [...story.querySelectorAll(".story__title:not(.story__stack)")];
  const stack = story.querySelector(".story__stack");
  const items = [...stack.querySelectorAll(".story__stack-item")];
  const bg = story.querySelector(".story__bg");
  const vol = story.querySelector(".story__volume");
  const line = story.querySelector(".story__line");
  const tris = story.querySelectorAll(".tri");

  // Scattered letters after the impact — the debris spots of the original #crash
  const debris = story.querySelector(".story__debris");
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const s = document.createElement("span");
    s.textContent = window.CFS.glyph();
    s.style.left = (rnd() * 96).toFixed(1) + "%";
    s.style.top = (8 + rnd() * 70).toFixed(1) + "%";
    s.style.transform = `rotate(${Math.round(rnd() * 80 - 40)}deg)`;
    debris.append(s);
  }

  // Crow Lottie — same lottie-web 5.12.2 canvas renderer as the original, 337 frames · 30fps, scroll picks the frame
  const crowBox = story.querySelector(".story__crow");
  let anim = null;
  const storyTimeline = (aspect) => (t) => {
    const h = 1080, w = h * aspect;
    const scale = phone() ? 3.2 : 4.1;
    const fx = phone() ? 0.5 : 0.2;
    const base = { x: w * fx - 50 * scale, y: h - 20 - 136 * scale, scale };
    let pose, pale = 0;
    if (t < 120) { pose = Crow.poses.lie; pale = 1; }
    else if (t < 150) { const q = gsap.parseEase("power2.inOut")((t - 120) / 30); pose = Crow.mix(Crow.poses.lie, Crow.poses.stand, q); pale = 1 - q; }
    else if (t < 250) pose = Crow.poses.stand;
    else if (t < 270) pose = Crow.mix(Crow.poses.stand, Crow.poses.crouch, (t - 250) / 20);
    else if (t < 300) pose = Crow.poses.crouch;
    else if (t < 316) pose = Crow.mix(Crow.poses.crouch, Crow.poses.up, (t - 300) / 16);
    else {
      const q = (t - 316) / 20;
      pose = Crow.flap(q * 2);
      base.y -= q * h * 0.8;
      base.x += q * w * 0.1;
    }
    base.pale = pale;
    return { pose, ...base };
  };
  const buildLottie = () => {
    if (!window.lottie) return;
    anim?.destroy();
    const aspect = crowBox.clientWidth / Math.max(1, crowBox.clientHeight);
    const limeRgb = Crow.rgba("var(--site-lime)");
    const data = Crow.lottie(storyTimeline(aspect), {
      fill: limeRgb, pale: Crow.rgba("color-mix(in oklab, var(--kf-contrast-ink) 88%, var(--kf-accent))"), detail: Crow.rgba("var(--kf-contrast-bg)"), far: Crow.rgba("color-mix(in oklab, var(--site-lime) 70%, var(--kf-contrast-bg))"),
      w: Math.round(1080 * aspect), h: 1080,
    });
    anim = lottie.loadAnimation({
      container: crowBox, renderer: "canvas", loop: false, autoplay: false, animationData: data,
      rendererSettings: { clearCanvas: true, preserveAspectRatio: "xMidYMid slice", progressiveLoad: true },
    });
    anim.addEventListener("DOMLoaded", () => anim.goToAndStop(storyFrame, true));
  };
  let storyFrame = 0;
  crowBox.querySelector("canvas")?.remove();
  buildLottie();
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(buildLottie, 250); });

  if (reduce) {
    gsap.set(titles, { autoAlpha: 0 });
    gsap.set(titles[0], { autoAlpha: 1 });
    gsap.set(stack, { autoAlpha: 0 });
  } else {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(titles, { autoAlpha: 0 });
      gsap.set(titles[0], { autoAlpha: 1 });
      gsap.set(stack, { autoAlpha: 0 });
      gsap.set(items, { xPercent: 40, autoAlpha: 0 });
      gsap.set(items.slice(1), { height: 0 });
      gsap.set(tris, { autoAlpha: 0 });
      gsap.set(vol, { yPercent: 100 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: story, start: "top top", end: () => "+=" + innerHeight * 9.15, pin, scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => {
            const f = Math.round(self.progress * 336);
            if (f !== storyFrame) { storyFrame = f; anim?.isLoaded && anim.goToAndStop(f, true); }
          },
        },
      });
      tl.to(bg, { y: () => -(bg.offsetHeight - pin.offsetHeight), duration: 4 }, 0);
      for (let e = 1; e < 4; e++) {
        const t = 2 * e - 0.35;
        tl.to(titles[e - 1], { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" }, t)
          .to(titles[e], { autoAlpha: 1, duration: 0.35, ease: "power1.inOut" }, t);
      }
      tl.addLabel("stackStart", 8)
        .to(titles[3], { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" }, 8)
        .to(stack, { autoAlpha: 1, duration: 0.35, ease: "power1.inOut" }, 8)
        .to(items[0], { xPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 8);
      for (let e = 1; e < 3; e++) {
        const t = 8 + 2 * e;
        tl.to(items[e], { height: "auto", duration: 0.45, ease: "power2.out" }, t)
          .to(items[e], { xPercent: 0, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, t);
      }
      const L = 4.45;
      // Volume panel: rises from below while stacking (power1.inOut), and when done the ticks fade out over 1.5 seconds
      tl.to(vol, { yPercent: 0, duration: L, ease: "power1.inOut" }, "stackStart")
        .fromTo(tris, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power1.inOut", immediateRender: false }, "stackStart")
        .to(bg, { yPercent: -65, opacity: 0.4, duration: L - 3, ease: "power1.inOut" }, "stackStart+=3")
        .addLabel("stackEnd", 12.45)
        .to(vol, { "--rulers": 0, duration: 1.5, ease: "power1.inOut" }, "stackEnd")
        .to(line, { "--dash": 1, duration: 1.5, ease: "power1.inOut" }, "stackEnd")
        .to(tris, { autoAlpha: 0, duration: 1.5, ease: "power1.inOut" }, "stackEnd")
        .to(stack, { autoAlpha: 0, duration: 0.35, ease: "power1.inOut" }, 12.45)
        .to(titles[4], { autoAlpha: 1, duration: 0.35, ease: "power1.inOut" }, 12.45)
        .to({}, { duration: 2 }, 13.95)
        .addLabel("mascotDetach", 15.95);
      // The original leaves v/8 of the length empty at the front — the time the first title stays on screen
      tl.shiftChildren(tl.duration() * (1.15 / 8), true);
      return () => {};
    });
  }

  /* ── Card horizontal rail: pin, x = -(track end - screen width) ── */
  const cards = document.querySelector(".cards");
  const track = cards.querySelector(".cards__track");
  const dist = () => Math.max(0, track.scrollWidth - innerWidth + 3.36 * rem());
  // The original holds the cards still until the cloud sheet has fully passed (up to 733px), then pushes — that amount is added to the pin length and the curve clears the front
  const lead = () => Math.min(733, innerHeight * 0.8);
  if (!reduce) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let a = 0;
      gsap.to(track, {
        x: () => -dist(), ease: (e) => Math.max(0, Math.min(1, (e - a) / (1 - a))),
        scrollTrigger: {
          trigger: cards, start: "top top", pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1,
          end: () => { const d = dist(), l = lead(); a = l / (d + l); return "+=" + (d + l); },
        },
      });
    });
  }
  // A crow flying out past the last card — the original loops 26 frames. One wingbeat cycle is .87 seconds (26 frames, 30fps)
  const fly = cards.querySelector(".card__fly");
  if (fly) {
    const fctx = fly.getContext("2d");
    let fdpr = sizeCanvas(fly), visible = false, t0 = performance.now();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(fly);
    addEventListener("resize", () => { fdpr = sizeCanvas(fly); });
    const tick = () => {
      if (!visible) return;
      const W = fly.clientWidth, H = fly.clientHeight;
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.clearRect(0, 0, fly.width, fly.height);
      fctx.setTransform(fdpr, 0, 0, fdpr, 0, 0);
      const t = reduce ? 0.25 : ((performance.now() - t0) / 1000) / 0.867;
      const s = (H * 0.38) / 140;
      Crow.draw(fctx, Crow.flap(t), { x: W * 0.38, y: H * 0.42, scale: s, fill: css("--kf-contrast-bg"), detail: css("--site-lime") });
    };
    gsap.ticker.add(tick);
  }

  /* ── Info tabs: clicking opens the description (height auto, power2.inOut) and the video on the right changes ── */
  const tabItems = [...document.querySelectorAll(".tabs__item")];
  const vids = [...document.querySelectorAll(".tabs__video")];
  tabItems.forEach((item, i) => {
    item.querySelector(".tabs__btn").addEventListener("click", () => {
      const from = tabItems.map((it) => it.querySelector(".tabs__text-wrap").offsetHeight);
      tabItems.forEach((it, j) => {
        const on = i === j;
        it.classList.toggle("is-active", on);
        it.querySelector(".tabs__btn").setAttribute("aria-selected", on);
        const wrap = it.querySelector(".tabs__text-wrap");
        gsap.killTweensOf(wrap);
        if (reduce) gsap.set(wrap, { height: on ? "auto" : 0 });
        else gsap.fromTo(wrap, { height: from[j] }, { height: on ? "auto" : 0, duration: 0.5, ease: "power2.inOut" });
      });
      vids.forEach((v, j) => v.classList.toggle("is-on", i === j));
    });
  });

  /* ── Reviews: the second heading darkens from a blur and the arrow line is drawn from above (top 70% → bottom 35%) ── */
  if (!reduce) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const head = document.querySelector(".reviews__head");
      const u = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: head, start: "top 70%", end: "bottom 35%", scrub: true, invalidateOnRefresh: true } });
      u.to(head.querySelector(".reviews__first"), { color: css("--kf-ink"), duration: 0.35 }, 0)
        .to(head.querySelector(".reviews__arrow"), { clipPath: "inset(0 0 0% 0)", duration: 0.6 }, 0.15)
        .to(head.querySelector(".reviews__second"), { color: css("--kf-ink"), duration: 0.35 }, 0.65);
    });
  }
  const quotes = [...document.querySelectorAll(".rq")];
  const deck = [...document.querySelectorAll(".rv")];
  let rvAt = 0;
  const ROLES = ["rv--active", "rv--next", "rv--prev"];
  document.querySelectorAll("[data-rv]").forEach((b) => b.addEventListener("click", () => {
    const n = quotes.length;
    rvAt = (rvAt + Number(b.dataset.rv) + n) % n;
    quotes.forEach((q, i) => q.classList.toggle("is-on", i === rvAt));
    deck.forEach((card, i) => {
      card.classList.remove(...ROLES);
      card.classList.add(ROLES[(i - rvAt + n) % n]);
    });
  }));
  deck.forEach((card) => card.addEventListener("click", () => {
    if (card.classList.contains("rv--next")) document.querySelector('[data-rv="1"]').click();
    if (card.classList.contains("rv--prev")) document.querySelector('[data-rv="-1"]').click();
  }));

  /* ── Line under numbers: enters from the bottom of the screen and is drawn until it reaches the center 60% ── */
  if (!reduce) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".stat").forEach((row) => {
        gsap.fromTo(row.querySelector(".stat__line"), { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "center 60%", scrub: true } });
      });
    });
  }

  /* ── Logo strip: 80px per second, endless ── */
  const ctrack = document.querySelector(".clients__track");
  const group = ctrack.querySelector(".clients__group");
  ctrack.append(group.cloneNode(true));
  ctrack.lastElementChild.setAttribute("aria-hidden", "true");
  if (!reduce) {
    let marquee;
    const run = () => {
      marquee?.kill();
      gsap.set(ctrack, { x: 0 });
      const o = group.offsetWidth;
      marquee = gsap.to(ctrack, { x: -o, ease: "none", duration: o / 80, repeat: -1 });
    };
    run();
    addEventListener("resize", () => { clearTimeout(run.t); run.t = setTimeout(run, 200); });
  }

  /* ── Circle-cover finish: pins the FAQ, rests .36 then a circle grows over 3 (power1.in), once fully covered the second line ── */
  if (!reduce) {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const stackEl = document.querySelector(".reveal__stack");
      const f = document.querySelector(".fcta");
      const t1 = f.querySelector(".fcta__title > span:first-child"), t2 = f.querySelector(".fcta__title-2");
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: stackEl, start: "top top", end: () => "+=" + innerHeight * 3, pin: true, scrub: true, invalidateOnRefresh: true, anticipatePin: 1 } });
      tl.to({}, { duration: 0.36 })
        .fromTo(f, { clipPath: "circle(0% at 16% 100%)" }, { clipPath: "circle(150% at 16% 100%)", duration: 3, ease: "power1.in" })
        .to(t1, { color: css("--site-white-60"), duration: 0.6, ease: "power1.inOut" }, ">-0.2")
        .to(t2, { fontSize: () => getComputedStyle(t1).fontSize, opacity: 1, duration: 0.75 }, "<")
        .to({}, { duration: 0.5 });
    });
  }
})();
