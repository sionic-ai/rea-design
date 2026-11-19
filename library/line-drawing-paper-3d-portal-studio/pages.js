// Per-page attach/detach motion — shared.js calls PX.pages[name](box, stage) when a box enters, and detaches with the returned function.
// barba takes the new container’s <script> Since this isn’t rotated, everything for the four pages sits here.
(() => {
  const PX = (window.PX = window.PX || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const html = document.documentElement;

  // Smooth scroll for About only — adds 0.9× the wheel delta to the target and closes 0.085 of the gap each frame (plain window scroll, no library)
  function smoothScroll() {
    if (coarse || reduce) return () => {};
    let cur = scrollY, target = cur, raf = 0, dead = false;
    const max = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const onWheel = (e) => {
      if (e.ctrlKey || e.defaultPrevented) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      target = clamp(target + d * 0.9, 0, max());
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      raf = 0;
      if (dead) return;
      cur += (target - cur) * 0.085;
      if (Math.abs(target - cur) < 0.5) cur = target;
      scrollTo(0, cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => { if (!raf) cur = target = scrollY; };
    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("scroll", onScroll, { passive: true });
    return () => { dead = true; cancelAnimationFrame(raf); removeEventListener("wheel", onWheel); removeEventListener("scroll", onScroll); };
  }

  PX.pages = {
    home() {
      scrollTo(0, 0);
      return null;
    },

    about(root, ctx) {
      const { S, setGravity, go, motionBlur } = ctx;
      const offs = [smoothScroll()];
      const method = root.querySelector(".px-about-method");
      const services = root.querySelector("[data-px-services]");
      const media = root.querySelector("[data-px-service-media]");
      const items = [...root.querySelectorAll("[data-px-service]")];
      const cursor = root.querySelector("[data-px-cursor-drag]");
      S.service.rect = () => media.getBoundingClientRect();
      let backTween = null, backOn = false;

      // When the second section crosses the 68% line of the screen, the object bounces up and drops, and when the service section crosses the 82% line, the camera pulls back by 50 over 1 second
      const onScroll = () => {
        const vh = innerHeight;
        setGravity(method.getBoundingClientRect().top < vh * 0.68);
        const on = services.getBoundingClientRect().top < vh * 0.82;
        if (on !== backOn) {
          backOn = on;
          backTween?.kill();
          backTween = gsap.to(S, { aboutBack: on ? 1 : 0, duration: reduce ? 0 : 1, ease: "power3.inOut" });
          motionBlur(1, 0, on ? 1 : -1, 0.82);
        }
        let best = -1, bd = Infinity;
        items.forEach((it, i) => {
          const r = it.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - vh / 2);
          if (d < bd) { bd = d; best = i; }
        });
        const show = S.aboutBack > 0.65 && services.getBoundingClientRect().bottom > vh * 0.3 ? best : -1;
        S.service.index = show;
        items.forEach((it, i) => it.classList.toggle("is-active", i === best));
      };
      addEventListener("scroll", onScroll, { passive: true });
      const poll = setInterval(onScroll, 120);
      onScroll();

      // Drag to rotate the model — 0.008rad/px horizontally, vertically up to ±0.42π, auto-rotation pauses while dragging
      const sv = S.service;
      const down = (e) => { sv.drag = { x: e.clientX, y: e.clientY, yaw: sv.yaw, pitch: sv.pitch }; media.classList.add("is-dragging"); cursor?.classList.add("is-dragging"); media.setPointerCapture?.(e.pointerId); };
      const move = (e) => {
        if (cursor) cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        if (!sv.drag) return;
        sv.yaw = sv.drag.yaw + (e.clientX - sv.drag.x) * 0.008;
        sv.pitch = clamp(sv.drag.pitch + (e.clientY - sv.drag.y) * 0.008, -Math.PI * 0.42, Math.PI * 0.42);
      };
      const up = () => { sv.drag = null; media.classList.remove("is-dragging"); cursor?.classList.remove("is-dragging"); };
      const enter = () => cursor?.classList.add("is-visible");
      const leave = () => cursor?.classList.remove("is-visible");
      media.addEventListener("pointerdown", down);
      addEventListener("pointermove", move, { passive: true });
      addEventListener("pointerup", up);
      media.addEventListener("pointerenter", enter);
      media.addEventListener("pointerleave", leave);

      // Horizontal photo story — the strip moves sideways by the vertical distance scrolled (0.82 ratio) and follows at 0.12. The center photo is large (0.82→1) and the sides curve away
      const hs = root.querySelector("[data-px-hstory]");
      const track = root.querySelector("[data-px-hstory-track]");
      const shots = [...track.querySelectorAll(".px-shot")];
      let travel = 0, curX = 0, raf = 0;
      const measure = () => {
        const right = Math.max(...shots.map((s) => s.offsetLeft + s.offsetWidth));
        travel = Math.max(0, right + innerWidth * 0.08 - innerWidth);
        hs.style.height = `${innerHeight + travel * 0.82}px`;
      };
      const ro = new ResizeObserver(measure);
      ro.observe(track);
      measure();
      const strength = innerWidth <= 820 ? 0.35 : 1.25;
      const loop = () => {
        raf = requestAnimationFrame(loop);
        const r = hs.getBoundingClientRect();
        const p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
        const tx = -p * travel;
        curX = reduce ? tx : curX + (tx - curX) * 0.12;
        track.style.transform = `translate3d(${curX}px, 0, 0)`;
        const vw = innerWidth;
        shots.forEach((s) => {
          const sx = curX * Number(s.dataset.pxParallax || 0) * strength;
          const n = clamp((s.offsetLeft + s.offsetWidth / 2 + curX + sx - vw / 2) / (vw / 2), -1.5, 1.5);
          const c = 1 - clamp(Math.abs(n), 0, 1);
          const sc = 0.82 + 0.18 * c * c * (3 - 2 * c);
          s.style.transform = `translate3d(${sx}px, 0, ${n * n * -180}px) rotateY(${n * -12}deg) scale(${sc})`;
        });
      };
      loop();

      // Scrolling further at the very bottom stacks up 680px and moves on to Work (max 110 per wheel tick, 0.24 seconds after it fills)
      const fill = root.querySelector("[data-px-next-fill]");
      let acc = 0, fired = false;
      const atBottom = () => scrollY >= document.documentElement.scrollHeight - innerHeight - 3;
      const setAcc = (v) => {
        acc = clamp(v, 0, 680);
        fill?.style.setProperty("--px-next", (acc / 680).toFixed(4));
        html.classList.toggle("is-next-armed", atBottom());
        if (acc >= 680 && !fired) { fired = true; setTimeout(() => go("works.html"), 240); }
      };
      const onNextWheel = (e) => {
        if (!atBottom()) { if (acc) setAcc(acc - Math.abs(e.deltaY)); return; }
        setAcc(acc + clamp(e.deltaY, -110, 110));
      };
      addEventListener("wheel", onNextWheel, { passive: true });

      return () => {
        offs.forEach((f) => f());
        removeEventListener("scroll", onScroll);
        clearInterval(poll);
        backTween?.kill();
        removeEventListener("pointermove", move);
        removeEventListener("pointerup", up);
        removeEventListener("wheel", onNextWheel);
        cancelAnimationFrame(raf);
        ro.disconnect();
        S.service.rect = null;
        S.service.index = -1;
        html.classList.remove("is-next-armed");
      };
    },

    works(root, ctx) {
      const { S, panels, centerPanel, W } = ctx;
      const name = root.querySelector("[data-px-works-name]");
      const sub = root.querySelector("[data-px-works-sub]");
      const desc = root.querySelector("[data-px-works-desc]");
      const ind = root.querySelector("[data-px-works-indicator]");
      ind.innerHTML = panels.map(() => "<span></span>").join("");
      const cells = [...ind.children];
      const PROJ = panels.map((m, i) => [`Project Name ${String(i + 1).padStart(2, "0")}`, "Your one-line work description here"]);

      // Drag — converts the screen distance the hand moved into world distance at the center plate depth (13). On release, 0.1 friction on the last velocity
      const perPx = () => (2 * 13 * Math.tan(THREE.MathUtils.degToRad(20)) * (innerWidth / innerHeight)) / innerWidth;
      let lastX = 0, lastV = 0;
      const down = (e) => {
        if (e.target.closest("a, button")) return;
        S.drag = { x: e.clientX, xt: S.worksXT };
        lastX = e.clientX; lastV = 0;
        html.classList.add("is-grid-dragging");
        root.setPointerCapture?.(e.pointerId);
      };
      const move = (e) => {
        S.parallax.tx = (e.clientX / innerWidth) * 2 - 1;
        S.parallax.ty = (e.clientY / innerHeight) * 2 - 1;
        if (!S.drag) return;
        S.worksXT = S.drag.xt + (e.clientX - S.drag.x) * perPx();
        lastV = (e.clientX - lastX) * perPx();
        lastX = e.clientX;
      };
      const up = () => { if (!S.drag) return; S.drag = null; S.worksV = lastV; html.classList.remove("is-grid-dragging"); };
      const wheel = (e) => { e.preventDefault(); S.worksXT -= (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * W.wheel; };
      root.addEventListener("pointerdown", down);
      addEventListener("pointermove", move, { passive: true });
      addEventListener("pointerup", up);
      addEventListener("wheel", wheel, { passive: false });

      // When the center board changes, the name briefly blurs then swaps. The ticks’ brightness flows continuously with board position (default 0.18, brightest 0.68)
      let cur = -1, swap = 0;
      const tick = setInterval(() => {
        const m = centerPanel();
        if (!m) return;
        const i = m.userData.index;
        if (i !== cur) {
          cur = i;
          desc.classList.add("is-changing");
          clearTimeout(swap);
          swap = setTimeout(() => { name.textContent = PROJ[i][0]; sub.textContent = PROJ[i][1]; desc.classList.remove("is-changing"); }, 180);
        }
        const step = W.w + W.gap;
        cells.forEach((c, k) => {
          const d = Math.abs(panels[k].position.x) / step;
          c.style.opacity = (0.18 + 0.5 * Math.exp(-(d * d) / (2 * 0.82 * 0.82))).toFixed(3);
        });
      }, 80);

      return () => {
        root.removeEventListener("pointerdown", down);
        removeEventListener("pointermove", move);
        removeEventListener("pointerup", up);
        removeEventListener("wheel", wheel);
        clearInterval(tick);
        clearTimeout(swap);
        S.drag = null;
        S.parallax.tx = S.parallax.ty = 0;
        html.classList.remove("is-grid-dragging");
      };
    },

    contact() { return null; },
  };
})();
