// Home motion: lump-opening scene → repeating 3s hold·3s move (title 1→.25→1), phone-pinned scene (rise, 0→100% scan, step aside, intro text),
// Four overlapping color panels, plus a story card and speech-bubble strip flowing over 50s.
(() => {
  const V = window.V;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const commonOut = CustomEase.create("common-easeOut", "M0,0 C0.14,0.785 0.19,1 1,1");
  const commonInOut = CustomEase.create("common-easeInOut", "M0,0 C0.71,0.165 0.185,1 1,1");
  const commonIn = CustomEase.create("common-easeIn", "M0,0 C0.61,0.08 0.88,0.505 1,1");
  // Original topfocusSliderEase0to0 — a bell shape that rises from 0, hits 1 in the middle, and comes back down to 0
  const bell = CustomEase.create("topfocus0to0", "M0,0 C0.294,0 0.196,1 0.5,1 0.788,1 0.702,0 1,0");

  // Strip color cells — six test-pad rows × four
  const tones = ["teal", "yellow", "red", "purple"];
  document.querySelectorAll(".v-strip__cells").forEach((cells) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 4; c++) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      Object.entries({ x: 6 + c * 12.5, y: 10 + r * 25, width: 10, height: 18, rx: 1.5, class: `v-strip__cell is-${tones[(r * 3 + c) % 4]}` }).forEach(([k, v]) => rect.setAttribute(k, v));
      cells.append(rect);
    }
  });

  // Eight user story cards + speech bubble strip
  const track = document.getElementById("v-story-track");
  const people = ["teal", "yellow", "red", "purple", "teal", "red", "yellow", "purple"];
  track.innerHTML = people.map((t, i) => `
    <a class="v-card" data-tone="${t}" href="about.html">
      <span class="v-card__art"><svg class="v-person" data-top="${people[(i + 2) % 4]}"></svg></span>
      <p>Your user quote here<br>Fill in two or three lines${i % 2 ? "." : "!"}</p>
      <small>#00s · Name ${String(i + 1).padStart(2, "0")}</small>
    </a>`).join("");
  track.querySelectorAll("svg.v-person").forEach(V.person);
  const belt = document.getElementById("v-voice-belt");
  const speech = tones.concat(tones).map((t, i) => `<p class="v-speech" data-tone="${t}">Your three-line expert quote here. Continue it here${i % 3 ? "." : " Your one more line here."}</p>`).join("");
  belt.innerHTML = speech;

  const mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 821px)", phone: "(max-width: 820px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { desk, motion } = ctx.conditions;
    if (!motion) {
      gsap.set(".v-kv__intro", { position: "relative", left: "auto", top: "auto", margin: "40px var(--site-gutter)" });
      gsap.set(".v-kv__intro-in", { yPercent: 0, y: 0 });
      gsap.set(".v-kv__flow", { display: "none" });
      gsap.set(".v-kv__inner", { height: "auto" });
      gsap.set(".v-kv__sticky", { position: "relative" });
      return;
    }

    // Title (original TopKvTitle): per line, letters rise from 110% below · skewY 15° over 1.75s common-easeOut at .01s intervals,
    // .2s later the subtitle rises from 100px below in 1.75s, the dotted line above it draws in 1.5s
    const titleIn = () => {
      const chars = [];
      document.querySelectorAll(".v-kv__h1 > span").forEach((line) => {
        line.classList.add("v-kv__line");
        const text = line.textContent;
        line.textContent = "";
        text.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { line.append(w); return; }
          const word = document.createElement("span");
          word.className = "v-kv__word";
          [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "v-kv__char"; c.textContent = ch; word.append(c); chars.push(c); });
          line.append(word);
        });
      });
      return gsap.timeline()
        .fromTo(chars, { yPercent: 110, skewY: 15 }, { yPercent: 0, skewY: 0, duration: 1.75, ease: commonOut, stagger: { each: 0.01 } })
        .fromTo(".v-kv__sub-text", { y: 100 }, { y: 0, duration: 1.75, ease: commonOut }, "<+=0.2")
        .fromTo(".v-kv__sub", { "--scale-y": 0 }, { "--scale-y": 1, duration: 1.5, ease: commonOut }, "<");
    };
    // Opening scene (original MainGL.openingAnimation — once when the first page is opened in a session, scroll locked meanwhile). Shader values are kept in V.open and kv-gl.js reads them every frame:
    // Logo .7s back.out(.5) → center ball swallows the logo in .75s (white logo letters rotate 90° and vanish at .4s) → .42s later stage-1 ball .6s and world 2s (2.5x → 1x, 90° → 0°, pushed sideways)
    // → after .2s the remaining balls and triangle shape 1s → after .7s the figure .5s. .85s before the end the title and letter band come in, .2s later the header and scroll indicator, and when it ends focus shifting starts
    const blobs = gsap.utils.toArray(".v-kv__b .v-blob");
    const title = titleIn().pause();
    gsap.set(".v-kv__voice, .v-kv__vert", { "--progress": "0%" });
    const voice = gsap.to(".v-kv__voice, .v-kv__vert", { "--progress": "100%", duration: 1, ease: commonInOut, paused: true });
    const persons = gsap.utils.toArray(".v-kv__fade .v-person");
    const personIn = () => gsap.fromTo(persons, { opacity: 0.001 }, { opacity: 1, duration: 0.5, ease: commonIn });
    gsap.set(persons, { opacity: 0.001 });
    // Header and scroll indicators are hidden by CSS (until .is-in) and revealed here
    const head = document.querySelector(".v-head"), sign = document.querySelector(".v-kv__sign");
    const done = () => {
      title.play();
      voice.play();
      V.lenis?.start();
      gsap.delayedCall(0.2, () => {
        // Header appears in .7s only at this moment, then goes back to the shared header transition
        if (head) {
          head.style.transition = "opacity 0.7s var(--kf-ease-in-out)";
          head.classList.add("is-in");
          gsap.delayedCall(0.7, () => (head.style.transition = ""));
        }
        sign?.classList.add("is-in");
        gsap.fromTo(".v-kv__scroll", { "--mask-progress": "0%" }, { "--mask-progress": "100%", delay: 0.7, duration: 1.25, ease: commonInOut, onComplete: () => sign?.classList.add("is-run") });
      });
    };
    const open = (V.open = { logo: 0, logoRot: 0, center: 0, level1: 0.01, other: 0, tri: 0, shift: 0, zoom: 1, turn: 1, fade: 1 });
    const settled = { logo: 1, logoRot: 1, center: 1, level1: 1, other: 1, tri: 1, shift: 1, zoom: 0, turn: 0 };
    const start = () => {
      if (!document.querySelector(".v-kv__stage.is-gl")) {
        // Without a shader, the blob art swells with back.out(.5)
        Object.assign(open, settled);
        gsap.timeline()
          .from(blobs, { scale: 0, transformOrigin: "50% 50%", duration: 1, ease: "back.out(0.5)", stagger: 0.1 })
          .add(personIn(), 0.5)
          .call(done, null, 0.4)
          .add(() => focusLoop.play());
      } else if (sessionStorage.getItem("v-top-opening")) {
        // From the second time on, original setOpeningDone — the fully built world appears in .5s and starts right away
        Object.assign(open, settled, { fade: 0 });
        gsap.to(open, { fade: 1, duration: 0.5, ease: "power2.inOut" });
        gsap.delayedCall(0.05, personIn);
        done();
        gsap.delayedCall(0, () => focusLoop.play());
      } else {
        V.lenis?.scrollTo(0, { immediate: true });
        V.lenis?.stop();
        gsap.timeline()
          .add([
            gsap.fromTo(".v-kv__logo", { scale: 0 }, { scale: 1, duration: 0.7, ease: "back.out(0.5)" }),
            gsap.fromTo(open, { logo: 0 }, { logo: 1, duration: 0.7, ease: "back.out(0.5)" }),
          ])
          .add([
            gsap.fromTo(".v-kv__logo", { opacity: 1, rotation: 0 }, { opacity: 0, rotation: 90, duration: 0.4, ease: "power2.in" }),
            gsap.to(open, { center: 1, logoRot: 1, duration: 0.75, ease: "power2.inOut" }),
          ])
          .add(gsap.fromTo(open, { level1: 0.01 }, { level1: 1, duration: 0.6, ease: "power1.out" }), "<+=0.42")
          .add(gsap.to(open, { shift: 1, zoom: 0, turn: 0, duration: 2, ease: "power2.inOut" }), "<")
          // Original curve name "power4.Out" GSAP cannot read this, so it runs on the default curve power1.out — carried over exactly as it appears on screen
          .add(gsap.fromTo(open, { other: 0, tri: 0 }, { other: 1, tri: 1, duration: 1, ease: "power1.out" }), "<+=0.2")
          .add(personIn(), "<+=0.7")
          .call(done, null, "-=0.85")
          .call(() => {
            sessionStorage.setItem("v-top-opening", "1");
            focusLoop.play();
          });
      }
    };
    // Like the original, opens after the page is fully loaded (load) — before that the canvas is empty
    if (document.readyState === "complete") start();
    else addEventListener("load", () => ctx.add(start), { once: true });

    // Repeating focus shift — holds 3 seconds, then the blob moves into place for 3 seconds (power2.inOut), while the title blurs in a bell curve
    const poses = [
      [[4, 6, 1.06], [-3, 4, 0.96], [6, -4, 1.08], [-4, -6, 1.04], [3, 5, 0.94]],
      [[-2, -4, 0.96], [3, -2, 1.04], [-5, 5, 0.94], [5, 2, 0.96], [-4, 3, 1.06]],
      [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
    ];
    const focusLoop = gsap.timeline({ repeat: -1, paused: true });
    // In the original, the lead ball’s color changes with each scene (teal → yellow → reddish brown → purple). It scatters at the center and swells again in the new color
    const hero = document.querySelector('[data-b="teal"] .v-blob');
    const order = ["teal", "yellow", "red", "purple"];
    poses.concat([poses[0]]).forEach((pose, k) => {
      focusLoop.to({}, { duration: 3 });
      focusLoop.addLabel(`move${k}`);
      blobs.forEach((b, i) => focusLoop.to(b, { xPercent: pose[i][0] * 3, yPercent: pose[i][1] * 3, duration: 3, ease: bell }, `move${k}`));
      focusLoop.to(blobs, { scale: 0.45, duration: 3, ease: bell }, `move${k}`);
      focusLoop.call(() => hero.setAttribute("data-tone", order[(k + 1) % order.length]), null, `move${k}+=1.5`);
      focusLoop.fromTo(".v-kv__title", { opacity: 1 }, { opacity: 0.25, duration: 3, ease: bell }, `move${k}`);
    });

    // Phone scene (original TopKv.allAnimation): scroll 0.2H → 4H maps directly to progress 0 → 1 (no extra delay, since Lenis smooths it).
    // The strip rises (1s) → the phone covers it with a white sheet .75 (1s) → 0·50·100% scan (1s) → result screen (1s) → the phone exits sideways and the strip upward, the title shrinks to .6x and the intro text rises over 2 seconds
    const sp = !desk;
    const pct = document.getElementById("v-pct"), line = document.querySelector(".v-pframe__line");
    const scan = gsap.fromTo(".v-pframe", { "--progress": "0%" }, {
      "--progress": "100%", duration: 1, ease: "none", paused: true,
      onUpdate() {
        const p = this.progress();
        pct.textContent = p === 1 ? "100%" : p > 0.5 ? "50%" : "0%";
        line.classList.toggle("is-done", p === 1);
      },
    });
    // So that GSAP does not read the CSS starting position (translateY(±100%)) as px and stack it on top of yPercent, set the px position to 0 and move only with %
    gsap.set([".v-kv__tester-in", ".v-pframe", ".v-pframe__tester", ".v-pframe__result", ".v-kv__intro-in"], { x: 0, y: 0 });
    const tl = gsap.timeline({ paused: true })
      .fromTo(".v-kv__tester-in", { yPercent: sp ? 120 : 100 }, { yPercent: 0, duration: 1, ease: commonOut })
      .add([
        gsap.fromTo(".v-pframe", { yPercent: sp ? 120 : 100 }, { yPercent: 0, duration: 1, ease: commonOut }),
        gsap.fromTo(".v-pframe__tester", { yPercent: sp ? -120 : -100 }, { yPercent: 0, duration: 1, ease: commonOut }),
        gsap.fromTo(".v-kv__tester", { "--mask-progress": sp ? "120%" : "100%" }, { "--mask-progress": "0%", duration: 1, ease: commonOut }),
        gsap.fromTo(".v-kv__backdrop", { "--opacity-progress": 0 }, { "--opacity-progress": 0.75, duration: 1, ease: commonOut }),
      ])
      .add(scan.paused(false));
    const resultIn = () => gsap.fromTo(".v-pframe__result", { xPercent: -100 }, { xPercent: 0, duration: 1, ease: commonInOut });
    const testerOut = () => gsap.timeline().add([
      gsap.fromTo(".v-kv__tester-img.is-dummy", { "--mask-Img-progress": "38%" }, { "--mask-Img-progress": "100%", duration: 1, ease: commonIn }),
      gsap.fromTo(".v-kv__tester-img.is-dummy", { yPercent: 0 }, { yPercent: -100, duration: 1, ease: commonIn }),
    ]);
    const titleOut = () => gsap.timeline().add([
      gsap.fromTo(".v-kv__title", { scale: 1 }, { scale: 0.6, duration: sp ? 0.8 : 1, ease: commonInOut }),
      gsap.fromTo(".v-kv__title", { opacity: 1 }, { opacity: 0, delay: sp ? 0.4 : 0.5, duration: sp ? 0.4 : 0.5, ease: commonInOut }),
    ]);
    const kvdomOut = () => gsap.timeline().fromTo(".v-kv__fade", { opacity: 1 }, { opacity: 0, duration: 0.5, ease: commonOut });
    const backdropOut = () => gsap.to(".v-kv__backdrop", { "--opacity-progress": 0, duration: sp ? 0.5 : 1, ease: commonIn });
    const otherOut = () => gsap.fromTo(".v-kv__scroll", { opacity: 1 }, { opacity: 0, duration: 0.5, ease: commonIn });
    // Original moveForLead (the shader ball steps aside from the intro text) — ball position is a layout measured on screen
    const moveForLead = () => gsap.timeline().add(desk ? [
      gsap.to('[data-b="teal"]', { xPercent: -95, yPercent: 30, scale: 0.86, duration: 1, ease: commonInOut }),
      gsap.to('[data-b="purple"]', { x: () => innerWidth * 0.9, yPercent: -150, duration: 1, ease: commonInOut }),
      gsap.to('[data-b="yellow"]', { x: () => innerWidth * 0.78, yPercent: -120, scale: 0.7, duration: 1, ease: commonInOut }),
      gsap.to('[data-b="red"]', { yPercent: -60, duration: 1, ease: commonInOut }),
    ] : [gsap.to('[data-b="teal"]', { yPercent: 40, duration: 1, ease: commonInOut })]);
    if (sp) tl.add([resultIn(), testerOut(), titleOut(), kvdomOut(), moveForLead()]).add([backdropOut(), otherOut()], "<+=0.5");
    else tl.add(resultIn())
      .call(() => focusLoop.resume())
      .add([
        gsap.fromTo([".v-pframe", ".v-kv__tester-img.is-dummy"], { "--slideside-progress": 0 }, { "--slideside-progress": 1, duration: 1, ease: commonInOut }),
        testerOut(), backdropOut(), otherOut(), titleOut(),
        kvdomOut().call(() => focusLoop.pause()),
        gsap.fromTo(".v-kv__intro-in", { yPercent: 100 }, { yPercent: 0, duration: 2, ease: "power1.inOut" }),
        moveForLead(),
      ], "-=0.1");
    if (sp) tl.fromTo(".v-kv__intro-in", { yPercent: 100 }, { yPercent: 0, duration: 2, ease: "power1.inOut" }, "<");
    ScrollTrigger.create({ start: () => innerHeight * 0.2, end: () => innerHeight * 4, invalidateOnRefresh: true, onUpdate: (st) => tl.progress(st.progress), onRefresh: (st) => tl.progress(st.progress) });


    return () => focusLoop.kill();
  });

  // Flowing line (original loopflow {duration: 50, direction: left}) — both the user card and the expert bubble.
  // Duplicate one set until it fills the screen width, flow left by one set width over 50 seconds, then return to the start. Runs only while on screen
  const loopflow = (track, duration) => {
    const wrap = document.createElement("div");
    wrap.className = "v-flow__set";
    wrap.append(...track.childNodes);
    track.append(wrap);
    let tl, copies = [];
    const build = () => {
      copies.forEach((c) => c.remove());
      const w = wrap.getBoundingClientRect().width;
      if (!w) return;
      copies = Array.from({ length: Math.max(Math.ceil(innerWidth / w), 1) }, () => {
        const c = wrap.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
        track.append(c);
        return c;
      });
      tl?.kill();
      tl = gsap.timeline({ repeat: -1, paused: !visible }).fromTo(track, { x: 0 }, { x: -w, duration, ease: "none", autoRound: false, force3D: true });
    };
    let visible = false;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; tl && (visible ? tl.resume() : tl.pause()); }).observe(track);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) new ResizeObserver(() => build()).observe(wrap);
  };
  loopflow(track, 50);
  loopflow(belt, 50);
})();
