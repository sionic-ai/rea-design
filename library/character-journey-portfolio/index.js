// First page — a master timeline bound to one 2850vh scroll alternates sections on a fixed stage.
// Values are the original timeline as is: build each section at its original place (base), insert the trust section (9.3) after 7.94, and add the lid-opening 1.0 at the very front.
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const stage = $("#stage"), heroIn = $("#heroInner"), tunnel = $("#tunnel");

  // Tree typography flavor: seeded random makes a few letters smaller (.74em) and slightly raised, avoiding consecutive small ones
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const amp = (el) => {
    const r = rng(+el.dataset.amp || 1);
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    let small = true;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 1 && n.tagName.toLowerCase() !== "svg") return walk(n);
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
        const w = document.createElement("span");
        w.style.cssText = "display:inline-block;white-space:nowrap";
        w.setAttribute("aria-hidden", "true");
        [...part].forEach((c) => {
          const x = document.createElement("span"), v = r(), letter = /[a-z]/i.test(c);
          x.textContent = c;
          if (letter && !small && v < 0.3) { x.className = "s"; small = true; }
          else { small = false; if (letter && v > 0.88) x.className = "u"; }
          w.appendChild(x);
        });
        frag.appendChild(w);
      });
      n.replaceWith(frag);
    });
    walk(el);
    el.classList.add("nn-amp");
  };
  $$("[data-amp]").forEach(amp);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.documentElement.classList.add("nn-rm");
    const go = (e) => document.getElementById(e.currentTarget.dataset.go)?.scrollIntoView();
    $$("[data-go]").forEach((b) => b.addEventListener("click", go));
    return () => { document.documentElement.classList.remove("nn-rm"); $$("[data-go]").forEach((b) => b.removeEventListener("click", go)); };
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.registerPlugin(ScrollTrigger);
    const W = () => innerWidth, H = () => innerHeight;
    // Section color is a value that shared.css makes by rotating from the skin in oklch — take rgb via canvas so GSAP can interpolate between them
    const paint = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const probe = document.createElement("i");
    stage.appendChild(probe);
    const color = (name) => {
      probe.style.color = `var(${name})`;
      paint.clearRect(0, 0, 1, 1);
      paint.fillStyle = getComputedStyle(probe).color;
      paint.fillRect(0, 0, 1, 1);
      const [r, g, b] = paint.getImageData(0, 0, 1, 1).data;
      return `rgb(${r}, ${g}, ${b})`;
    };
    const C = {};
    ["turmeric", "hibiscus", "monsoon", "deep", "backwater", "leaf", "kokum"].forEach((k) => { C[k] = color(`--site-${k}`); });
    probe.remove();
    gsap.set(stage, { "--bg": C.turmeric });

    // Ring tunnel: stage diagonal × 0.8^i, 11 layers of circles
    const buildTunnel = () => {
      tunnel.innerHTML = "";
      const w = stage.clientWidth, h = stage.clientHeight, d = Math.hypot(w, h);
      for (let i = 0; i < 11; i++) {
        const c = document.createElement("div"), s = d * Math.pow(0.8, i);
        c.style.cssText = `width:${s}px;height:${s}px;left:${(w - s) / 2}px;top:${(h - s) / 2}px`;
        tunnel.appendChild(c);
      }
    };
    buildTunnel();

    // Greeting line: words kept together, split by letter. Seed 21 picks the small letters
    const hi = $("#hiLine"), hr = rng(21);
    let hp = true;
    hi.setAttribute("aria-label", hi.textContent);
    hi.innerHTML = hi.textContent.split(" ").map((w) => `<span class="wd" aria-hidden="true">${[...w].map((c) => {
      const sm = /[a-z]/i.test(c) && !hp && hr() < 0.34;
      hp = sm;
      return `<span class="ch${sm ? " sm" : ""}">${c}</span>`;
    }).join("")}</span>`).join(" ");
    const chars = hi.querySelectorAll(".ch");

    // Trust headings by word — spaced with gaps between words (.27em) instead of spaces
    $$(".nn-bl--b h3").forEach((h) => {
      h.setAttribute("aria-label", h.textContent);
      h.innerHTML = h.textContent.split(" ").map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join("​");
    });

    // Phone: on a short screen, shrink the character so it doesn’t overlap the two words under the name, and move it above the leaking hand
    const dream = $("#dream"), phrase = $("#phrase"), heroTop = $(".nn-hero__top"), me = $("#me"), birds = $("#birds");
    let tightPhone = false;
    const fitPhone = () => {
      me.style.width = dream.style.top = dream.style.left = dream.style.fontSize = birds.style.left = birds.style.top = "";
      tightPhone = false;
      if (!matchMedia("(max-width: 720px)").matches) return;
      const SW = stage.clientWidth, SH = stage.clientHeight;
      const below = heroTop.offsetTop + phrase.offsetTop + phrase.offsetHeight;
      let w = me.offsetWidth;
      const room = (SH - below - 10) / (0.9375 * 570 / 600);
      if (w > room) {
        w = Math.max(room, SW * 0.72);
        me.style.width = `${w}px`;
        dream.style.fontSize = "13px";
        dream.style.left = `${SW * 0.03 - (SW - w) / 2}px`;
      }
      const meTop = SH - w * 0.9375, thoughtsTop = SH - w * 0.9375 * 570 / 600;
      if (dream.offsetTop < below + 18 - meTop) dream.style.top = `${below + 18 - meTop}px`;
      const hr2 = heroIn.getBoundingClientRect(), br = birds.getBoundingClientRect(), k = hr2.width / heroIn.offsetWidth || 1;
      const bTop = (br.top - hr2.top) / k - (gsap.getProperty(birds, "y") || 0), bH = br.height / k;
      if (bTop < below + 6 || bTop + bH > thoughtsTop - 6) {
        tightPhone = true;
        birds.style.left = "5%";
        birds.style.top = `${below + 14}px`;
      }
    };
    fitPhone();

    // Dive goes to the middle of the open head (228 of 600 graphic units)
    let origin = "50% 60%";
    const findOrigin = () => {
      if ((gsap.getProperty(heroIn, "scale") || 1) !== 1) return;
      const a = heroIn.getBoundingClientRect(), m = me.getBoundingClientRect();
      origin = `${m.left - a.left + m.width * 0.5}px ${m.top - a.top + m.height * (228 / 600)}px`;
    };
    findOrigin();

    // First entrance — the name letter-spacing tightens, the character rises, and the lid bumps up twice. Cursor and selection box are the cursor-select-intro part (delay 1.3)
    const life = () => {
      gsap.to("#birds .nn-bird", { scaleY: 0.45, transformOrigin: "50% 60%", duration: 0.32, ease: "sine.inOut", repeat: -1, yoyo: true, stagger: { each: 0.11, from: "random" } });
      gsap.to("#birds", { x: 18, y: -8, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to("#hand", { rotation: 14, svgOrigin: "110 338", duration: 0.45, ease: "sine.inOut", repeat: 5, yoyo: true, repeatDelay: 0.05,
        onComplete: () => gsap.to("#hand", { rotation: 10, svgOrigin: "110 338", duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true }) });
      $$("#thoughts .nn-th").forEach((t, i) => gsap.to(t, { y: gsap.utils.random(-12, -5), rotation: gsap.utils.random(-12, 12), duration: gsap.utils.random(1.6, 2.4), ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.12 }));
    };
    gsap.timeline({ delay: 0.25 })
      .fromTo("#name", { letterSpacing: "0.32em", opacity: 0 }, { letterSpacing: "-0.01em", opacity: 1, duration: 1.5, ease: "expo.out" })
      .from(".nn-kicker", { y: 14, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.5)
      .from("#phrase span", { y: 16, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 1.0)
      .from("#role", { y: 16, opacity: 0, duration: 0.7, ease: "power3.out" }, 2.4)
      .from(".nn-top, #hint > span, #hintM > span, #ruler", { opacity: 0, duration: 0.8 }, 2.6)
      .fromTo("#meSvg", { yPercent: 45 }, { yPercent: 0, duration: 1.2, ease: "power4.out" }, 0.35)
      .fromTo("#lid", { rotation: 0 }, { rotation: -7, svgOrigin: "206 232", duration: 0.5, ease: "back.out(3)" }, 1.3)
      .to("#lid", { rotation: 0, svgOrigin: "206 232", duration: 0.35, ease: "power2.in" }, 1.85)
      .fromTo("#lid", { rotation: 0 }, { rotation: -7, svgOrigin: "206 232", duration: 0.45, ease: "back.out(3)", immediateRender: false }, 2.25)
      .add(life, 2.2);

    // Of the thoughts that pop out one by one, only the first is pre-drawn and the rest stay visible until the first scroll — so the initial state is pinned separately
    gsap.set("#thoughts .nn-th", { scale: 0, opacity: 0, yPercent: 160, transformOrigin: "50% 50%" });

    // Master journey
    const OPEN = 1.0, M = 9.3;
    const at = (x) => x + OPEN + (x >= 7.94 ? M : 0);
    const S = 7.95 + OPEN;
    let handed = false;
    const ending = (p) => {
      if (p > 0.965 && !handed) {
        handed = true;
        heroIn.dispatchEvent(new CustomEvent("fx:point", { detail: { el: $("#mail"), label: "You" } }));
      } else if (p < 0.94 && handed) {
        handed = false;
        heroIn.dispatchEvent(new CustomEvent("fx:release"));
      }
    };
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "#space", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true,
        onUpdate: (self) => { gsap.set("#head", { left: `${self.progress * 100}%` }); ending(self.progress); },
      },
    });

    // 0~1: on the first scroll the lid opens and a thought pops out
    tl.to(["#hint", "#hintM"], { autoAlpha: 0, duration: 0.3 }, 0)
      .fromTo("#lid", { rotation: -7, svgOrigin: "206 232" }, { rotation: -78, svgOrigin: "206 232", duration: 0.8, ease: "power2.inOut", immediateRender: false }, 0.05)
      .fromTo("#cavity", { attr: { ry: 13 } }, { attr: { ry: 20 }, duration: 0.6, immediateRender: false }, 0.1)
      .fromTo("#rings", { opacity: 0, scale: 0.3, svgOrigin: "320 232" }, { opacity: 1, scale: 1.15, scaleY: 1.3, svgOrigin: "320 232", duration: 0.7, ease: "power2.out" }, 0.2)
      .fromTo("#thoughts .nn-th", { scale: 0, opacity: 0, yPercent: 160 }, { scale: 1, opacity: 1, yPercent: 0, transformOrigin: "50% 50%", duration: 0.55, stagger: 0.06, ease: "back.out(1.8)" }, 0.3)
      .to(".nn-hero__top", { y: -12, duration: OPEN }, 0);

    // Dive into the head
    tl.addLabel("hero", at(0))
      .to("#hint", { autoAlpha: 0, duration: 0.2 }, at(0))
      .to(".nn-hero__top", { autoAlpha: 0, y: -40, duration: 0.35 }, at(0))
      .to(heroIn, { scale: 22, transformOrigin: () => origin, duration: 1.1, ease: "power3.in" }, at(0))
      .to(heroIn, { autoAlpha: 0, duration: 0.25 }, at(0.85))
      .fromTo(tunnel, { scaleX: 0.3, scaleY: 0.08, autoAlpha: 0 }, { scaleX: 1.4, scaleY: 1.4, autoAlpha: 1, duration: 0.6, ease: "power1.in" }, at(0.6))
      .to(tunnel, { scale: 9, duration: 0.7, ease: "power2.in" }, at(1.1))
      .to(tunnel, { autoAlpha: 0, duration: 0.25 }, at(1.6))
      .to(stage, { "--bg": C.hibiscus, duration: 1.2 }, at(0.5))

    // Greeting
      .set("#hello", { autoAlpha: 1 }, at(1.75))
      .fromTo(chars, { yPercent: 150, rotate: () => gsap.utils.random(-45, 45), autoAlpha: 0 },
        { yPercent: 0, rotate: (i) => [-4, 3, -2, 5, -3, 2, -5, 3, 4, -2, 3, -4, 2, -3][i % 14], autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: "back.out(1.7)" }, at(1.8))
      .fromTo("#hello .nn-spark", { scale: 0, rotation: -120, transformOrigin: "50% 50%" }, { scale: 1, rotation: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2.4)" }, at(2.1))
      .fromTo("#squigPath", { strokeDasharray: 420, strokeDashoffset: 420 }, { strokeDashoffset: 0, duration: 0.6 }, at(2.5))
      .addLabel("hello", at(2.9))
      .to("#hello .nn-doodles", { scale: 1.6, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, at(3.6))
      .fromTo("#hiCap", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, at(2.6))
      .to("#hiCap", { autoAlpha: 0, duration: 0.3 }, at(3.6))
      .to("#hiLine", { scale: 8, autoAlpha: 0, transformOrigin: "46% 55%", duration: 1.0, ease: "power2.in" }, at(3.6))
      .to(stage, { "--bg": C.monsoon, duration: 1.0 }, at(3.9))
      .set("#hello", { autoAlpha: 0 }, at(4.65))

    // What we make — color chips fly in and gather into card parts
      .set("#systems", { autoAlpha: 1 }, at(4.55))
      .fromTo("#sysWord", { scale: 0.16, "--wg": 100, rotate: 0 }, { scale: 1, "--wg": 900, rotate: -5, duration: 1.3, ease: "power3.out" }, at(4.6))
      .fromTo("#sysSmall", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, at(5.0));
    const sws = $$("#kit .nn-sw");
    sws.forEach((s, i) => {
      const a = (i / sws.length) * Math.PI * 2 + 0.6;
      tl.fromTo(s, { x: () => Math.cos(a) * W() * 0.45, y: () => Math.sin(a) * H() * 0.45, scale: 0.4, autoAlpha: 0 },
        { x: () => -150 + i * 34, y: () => -4, scale: 0.62, autoAlpha: 1, duration: 0.9, ease: "power3.out" }, at(5.2 + i * 0.05));
    });
    tl.fromTo("#card", { scale: 0.6, autoAlpha: 0, rotate: 4 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.5, ease: "back.out(1.4)" }, at(6.0))
      .to("#sysWord", { autoAlpha: 0.22, duration: 0.5 }, at(6.0))
      .fromTo("#sysCap", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, at(6.3))
      .addLabel("systems", at(6.6))
      .to(["#kit", "#sysSmall", "#sysCap"], { yPercent: -30, autoAlpha: 0, duration: 0.6, ease: "power2.in" }, at(7.3))
      .to("#sysWord", { scale: 2.2, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, at(7.3))
      .to(stage, { "--bg": C.deep, duration: 0.9 }, at(7.4))
      .set("#systems", { autoAlpha: 0 }, at(7.92))

    // Where I live — an auto-rickshaw crosses the screen
      .set("#based", { autoAlpha: 1 }, at(7.95))
      .fromTo("#basedText > span", { xPercent: 70, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }, at(8.0))
      .fromTo("#auto", { x: () => -W() * 0.35 }, { x: () => W() * 1.1, duration: 2.0 }, at(8.3))
      .fromTo("#wf", { rotation: 0 }, { rotation: -1080, svgOrigin: "72 206", duration: 2.0 }, at(8.3))
      .fromTo("#wr", { rotation: 0 }, { rotation: -1080, svgOrigin: "272 206", duration: 2.0 }, at(8.3))
      .fromTo("#basedCap", { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, at(8.9))
      .fromTo("#based .nn-palm", { x: () => W() * 0.12 }, { x: () => -W() * 0.12, duration: 2.8 }, at(8.0))
      .fromTo("#based .nn-hills", { x: () => W() * 0.03, autoAlpha: 0 }, { x: () => -W() * 0.03, autoAlpha: 1, duration: 2.8 }, at(8.0))
      .fromTo("#based .nn-palm", { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.6)" }, at(8.1))
      .fromTo("#cup", { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.8)" }, at(8.6))
      .fromTo("#steam", { y: 8, opacity: 0.2 }, { y: -10, opacity: 1, duration: 1.4 }, at(8.8))
      .addLabel("based", at(9.3))
      .to("#based .nn-doodles", { yPercent: 30, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, at(10.3))
      .to("#basedText > span", { xPercent: -70, autoAlpha: 0, duration: 0.6, stagger: 0.1, ease: "power2.in" }, at(10.2))
      .to("#basedCap", { autoAlpha: 0, duration: 0.3 }, at(10.2))
      .to(stage, { "--bg": C.leaf, duration: 0.8 }, at(10.3))
      .set("#based", { autoAlpha: 0 }, at(10.95))

    // Work — a row of cards flows horizontally
      .set("#work", { autoAlpha: 1 }, at(10.85))
      .fromTo(".nn-work__head", { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, at(10.9))
      .fromTo(".nn-proj", { y: 80, rotate: 2, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }, at(11.0))
      .fromTo("#peek", { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" }, at(11.2))
      .fromTo(["#pl", "#pr"], { x: 0 }, { x: 4, duration: 0.3 }, at(11.6))
      .addLabel("work", at(11.5))
      .to("#track", { x: () => -($("#track").scrollWidth - stage.clientWidth), duration: 3.6, ease: "power1.inOut" }, at(11.7))
      .to("#work", { yPercent: -18, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, at(15.4))
      .to(stage, { "--bg": C.kokum, duration: 0.8 }, at(15.5))

    // About
      .set("#about", { autoAlpha: 1 }, at(15.85))
      .fromTo("#aboutSt i", { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.14, ease: "power3.out" }, at(15.9))
      .fromTo(["#aboutSub", "#facts", "#tools", "#more"], { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.1 }, at(16.4))
      .fromTo("#trail", { strokeDashoffset: 320, opacity: 0 }, { strokeDashoffset: 0, opacity: 1, duration: 0.8 }, at(16.2))
      .fromTo("#planeBody", { x: -190, y: 60, rotation: -20, svgOrigin: "226 36" }, { x: 0, y: 0, rotation: 0, svgOrigin: "226 36", duration: 0.8, ease: "power2.out" }, at(16.2))
      .addLabel("about", at(16.9))
      .to("#about", { scale: 0.92, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, at(17.4))

    // Slips out of the header in reverse and becomes the Contact section
      .set("#role", { autoAlpha: 0 }, at(17.9))
      .set("#contact", { autoAlpha: 1 }, at(17.9))
      .fromTo("#dream", { autoAlpha: 0, scale: 0.6, rotation: -20 }, { autoAlpha: 1, scale: 1, rotation: -7, duration: 0.45, ease: "back.out(2)", immediateRender: false }, at(19.45))
      .fromTo("#birds", { opacity: 1 }, { opacity: () => (tightPhone ? 0 : 1), duration: 0.3, immediateRender: false }, at(19.4))
      .to(stage, { "--bg": C.turmeric, duration: 0.9 }, at(17.9))
      .fromTo(tunnel, { scale: 9, autoAlpha: 0 }, { scale: 1.2, autoAlpha: 1, duration: 0.9, ease: "power2.out", immediateRender: false }, at(17.9))
      .to(tunnel, { scale: 0.42, autoAlpha: 0, duration: 0.5 }, at(18.8))
      // Size and opacity are separate: invisible while greatly enlarged, turned on only when nearly full size
      .fromTo(heroIn, { scale: 22 }, { scale: 1, transformOrigin: () => origin, duration: 1.0, ease: "power3.out", immediateRender: false }, at(18.4))
      .fromTo(heroIn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.32, ease: "power1.inOut", immediateRender: false }, at(18.9))
      .fromTo(".nn-hero__top", { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false }, at(19.1))
      .addLabel("contact", at(20))
      .to({}, { duration: 0.01 }, at(20));

    // Belief section (length 7.95 to 9.3): one thought per screen
    tl.set("#beliefs", { autoAlpha: 1 }, S)
      .set("#blA", { autoAlpha: 1 }, S)
      .fromTo(".nn-bl__years", { yPercent: 50, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, S)
      .fromTo("#blUnder", { strokeDasharray: 440, strokeDashoffset: 440 }, { strokeDashoffset: 0, duration: 0.45 }, S + 0.35)
      .fromTo(".nn-bl__hands", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 }, S + 0.3)
      .to("#blA", { y: -50, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, S + 1.0);
    ["#blB1", "#blB2", "#blB3", "#blB4"].forEach((id, k) => {
      const t = S + 1.3 + k;
      tl.set(id, { autoAlpha: 1 }, t)
        .fromTo(`${id} h3 .w`, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.018, ease: "power3.out" }, t)
        .fromTo(`${id} p:not(.nn-bl__kick)`, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, t + 0.2);
      if (id === "#blB4") tl.fromTo("#blB4 .nn-bl__kick", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, t + 0.4);
      tl.to(id, { y: -40, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, t + 0.78);
    });
    tl.addLabel("beliefs", S + 1.5);
    const c = S + 5.4, d = S + 7.6;
    tl.set("#blC", { autoAlpha: 1 }, c)
      .fromTo(".nn-c1", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, c)
      .fromTo(".nn-c2", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.6)" }, c + 0.35)
      .fromTo("#strikePath", { strokeDasharray: 340, strokeDashoffset: 340 }, { strokeDashoffset: 0, duration: 0.3 }, c + 0.8)
      .fromTo(".nn-c3", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, c + 1.0)
      .to("#blC", { y: -40, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, c + 1.85)
      .set("#blD", { autoAlpha: 1 }, d)
      .fromTo(".nn-bl--d h2", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, d)
      .fromTo(".nn-bl--d > p:not(.nn-bl__open)", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, d + 0.25)
      .fromTo(".nn-bl__open", { y: 20, opacity: 0 }, { y: 0, opacity: 0.85, duration: 0.35 }, d + 0.4)
      .fromTo("#blD .nn-ddp", { scale: 0, rotation: () => gsap.utils.random(-30, 30) }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2.2)", stagger: { each: 0.05, from: "random" } }, d + 0.1)
      .to("#blD", { y: -40, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, d + 1.3)
      .to(stage, { "--bg": C.backwater, duration: 0.6 }, S + M - 0.6)
      .set("#beliefs", { autoAlpha: 0 }, S + M - 0.05);

    // Farewell: the lid closes again
    const bye = tl.labels.contact - 0.7;
    tl.fromTo("#lid", { rotation: -78, svgOrigin: "206 232" }, { rotation: -10, svgOrigin: "206 232", duration: 0.6, ease: "back.out(2)", immediateRender: false }, bye)
      .to("#rings", { opacity: 0, duration: 0.3 }, bye)
      .to("#thoughts .nn-th", { scale: 0.85, duration: 0.4 }, bye);

    // Doodles in the closing section drift toward the mouse, each by its own depth
    const drift = $$("#blD .nn-dd").map((el) => {
      const t = el.querySelector(".nn-ddp"), dep = +el.dataset.depth || 10;
      return { dep, x: gsap.quickTo(t, "x", { duration: 0.9, ease: "power3.out" }), y: gsap.quickTo(t, "y", { duration: 0.9, ease: "power3.out" }) };
    });
    const onMove = (e) => {
      const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
      drift.forEach((m) => { m.x(dx * m.dep * 2); m.y(dy * m.dep * 2); });
    };
    addEventListener("pointermove", onMove, { passive: true });

    // Ruler labels and section jumps
    const ruler = $("#ruler"), total = tl.duration();
    const marks = [["hello", "Intro"], ["systems", "Craft"], ["beliefs", "Beliefs"], ["based", "City"], ["work", "Work"], ["about", "About"], ["contact", "Contact"]];
    marks.forEach(([k, t]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t;
      b.dataset.go = k;
      b.tabIndex = -1;
      b.style.left = `${Math.min(98, (tl.labels[k] / total) * 100)}%`;
      ruler.appendChild(b);
    });
    const go = (e) => {
      const st = tl.scrollTrigger, k = e.currentTarget.dataset.go;
      const y = st.start + (tl.labels[k] / total) * (st.end - st.start);
      if (window.nnSite?.lenis) window.nnSite.lenis.scrollTo(y, { duration: 1.6 });
      else scrollTo({ top: y, behavior: "smooth" });
    };
    $$("[data-go]").forEach((b) => b.addEventListener("click", go));

    const onResize = () => { fitPhone(); buildTunnel(); findOrigin(); };
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
      $$("[data-go]").forEach((b) => b.removeEventListener("click", go));
      ruler.querySelectorAll("button").forEach((b) => b.remove());
    };
  });
})();
