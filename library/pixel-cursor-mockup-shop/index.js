// First page — product slider (keen-slider), widening the collection column, award cards, community fixed panel
(() => {
  const { reduce, fine, $$, ready } = window.VS;

  // Product slider — same keen-slider as the original: loop, one-card snap, 8px between cards. One extra set of cards is cloned so the loop never runs empty (aria-hidden).
  // As in the original, narrow screens use a card grid instead of a slider (first product row below 1023, free row below 767 — it is only built from the data-slider-from width)
  $$("[data-slider]").forEach((el) => {
    if (!window.KeenSlider) return;
    const mq = matchMedia(`(min-width: ${el.dataset.sliderFrom || 0}px)`);
    let ks = null;
    const sync = () => {
      if (mq.matches && !ks) {
        const kids = [...el.children];
        let w = kids.reduce((s, c) => s + c.offsetWidth, 0);
        while (w > 0 && w < el.offsetWidth * 2) kids.forEach((c) => { const d = c.cloneNode(true); d.setAttribute("aria-hidden", "true"); el.append(d); w += c.offsetWidth; });
        ks = new KeenSlider(el, { loop: true, slides: { perView: "auto", spacing: 8 }, selector: ".vs-card" });
      } else if (!mq.matches && ks) { ks.destroy(); ks = null; el.querySelectorAll('.vs-card[aria-hidden="true"]').forEach((d) => d.remove()); }
    };
    sync();
    mq.addEventListener("change", sync);
  });

  // Header (desktop) — while it scrolls past the top of the screen (scrub 1, top edge top → bottom edge top) 22px is trimmed from each side and the corners round to 48px
  const heroEl = document.querySelector(".vs-hero");
  if (heroEl && !reduce) gsap.matchMedia().add("(min-width: 1024px)", () => {
    // The product offer panel left inside the header shifts inward by the cropped amount (right inset) to keep its 12px margin (original)
    const syncPush = () => {
      const p = heroEl.querySelector("[data-push].is-out");
      if (!p) return;
      const m = /inset\(\s*[\d.]+px\s+([\d.]+)px/.exec(getComputedStyle(heroEl).clipPath);
      p.style.right = `${12 + (m ? parseFloat(m[1]) : 0)}px`;
    };
    gsap.fromTo(heroEl, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: "inset(0px 22px 0px 22px round 48px)", ease: "none", onUpdate: syncPush, scrollTrigger: { trigger: heroEl, start: "top top", end: "bottom top", scrub: 1 } });
  });

  // Family cloud — while on screen, two overlapping sines make it float (horizontal .45·.49 · amplitude .85·.7%, vertical .2·.68 · .4·.9%, tilt .29·.65 · .24·.43°),
  // Shifts 3% horizontally · 4% vertically by cursor position and tilts up to 8° by cursor speed. Following is a lerp(.05, tilt decay .056) corrected by the time between frames (max 50ms)
  const cloud = document.querySelector("[data-cloud] .wf-img");
  if (cloud && !reduce) {
    const ease = (a, b, k, dt) => a + (b - a) * (1 - Math.pow(Math.cos((Math.PI / 2) * k), dt));
    const ph = Array.from({ length: 6 }, () => Math.random() * Math.PI * 2);
    const m = { tx: 0, ty: 0, x: 0, y: 0, lastX: null, lastT: 0, rot: 0, rotTarget: 0 };
    let raf = null, t0 = 0, last = 0;
    if (fine) addEventListener("pointermove", (e) => {
      if (m.lastX != null) { const v = Math.max(-8, Math.min(8, ((e.clientX - m.lastX) / Math.max(e.timeStamp - m.lastT, 8)) * 0.5)); if (Math.abs(v) > Math.abs(m.rotTarget)) m.rotTarget = v; }
      m.lastX = e.clientX; m.lastT = e.timeStamp; m.tx = (e.clientX / innerWidth) * 2 - 1; m.ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
    const tick = (now) => {
      const s = (now - t0) / 1000, dt = Math.min(now - (last || now), 50);
      last = now;
      const x = Math.sin(s * 0.45 + ph[0]) * 0.85 + Math.sin(s * 0.49 + ph[1]) * 0.7, y = Math.sin(s * 0.2 + ph[2]) * 0.4 + Math.sin(s * 0.68 + ph[3]) * 0.9, r = Math.sin(s * 0.29 + ph[4]) * 0.24 + Math.sin(s * 0.65 + ph[5]) * 0.43;
      m.x = ease(m.x, m.tx, 0.05, dt); m.y = ease(m.y, m.ty, 0.05, dt); m.rotTarget = ease(m.rotTarget, 0, 0.056, dt); m.rot = ease(m.rot, m.rotTarget, 0.05, dt);
      cloud.style.transform = `translate(${(x + m.x * 3).toFixed(3)}%, ${(y + m.y * 4).toFixed(3)}%) rotate(${(r + m.rot).toFixed(3)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && raf == null) { t0 = performance.now(); last = 0; raf = requestAnimationFrame(tick); }
      else if (!e.isIntersecting && raf != null) { cancelAnimationFrame(raf); raf = null; }
    }).observe(cloud);
  }

  // Two collection cells — the hovered cell becomes three times wide in 1s (.5,0,0,1)
  const hls = $$("[data-hl]");
  if (fine) hls.forEach((h) => h.addEventListener("mouseenter", () => hls.forEach((o) => o.classList.toggle("is-active", o === h))));

  // Award cards sit in five spots with a tilt. When the top edge reaches 80% of the screen, they pop up from 180% below in random order (within .4s) over .9s with back.out(1.6).
  // The inner panel is pulled .25 toward the Interaction (.4s power2.out) and on release returns over .8s elastic.out(1, .4). Pressing makes it fall off screen, and once all have fallen they bounce back up after 1s
  const SLOTS = [{ left: "-4%", top: "19%", rotate: -10 }, { left: "22%", top: "34%", rotate: 5 }, { left: "40%", top: "20%", rotate: -10 }, { right: "10%", top: "35%", rotate: -6 }, { right: "-3%", top: "18%", rotate: 12 }];
  $$("[data-awards]").forEach((sec) => {
    const cards = $$("[data-award]", sec);
    cards.forEach((c, i) => { const s = SLOTS[i % SLOTS.length]; Object.assign(c.style, { left: s.left || "", right: s.right || "", top: s.top }); gsap.set(c, { rotation: s.rotate }); });
    if (reduce) return;
    const pop = () => gsap.to(cards, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "back.out(1.6)", stagger: { amount: 0.4, from: "random" } });
    gsap.set(cards, { yPercent: 180, autoAlpha: 0 });
    ScrollTrigger.create({ trigger: sec, start: "top 80%", once: true, onEnter: () => ready.then(pop) });
    let fallen = 0;
    cards.forEach((c, i) => {
      const inner = c.firstElementChild;
      if (fine) {
        c.addEventListener("mousemove", (e) => { const r = c.getBoundingClientRect(); gsap.to(inner, { x: (e.clientX - (r.left + r.width / 2)) * 0.25, y: (e.clientY - (r.top + r.height / 2)) * 0.25, duration: 0.4, ease: "power2.out" }); });
        c.addEventListener("mouseleave", () => gsap.to(inner, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" }));
      }
      c.addEventListener("click", () => {
        if (c.dataset.fallen) return;
        c.dataset.fallen = "1";
        const r = c.getBoundingClientRect();
        gsap.to(c, { y: `+=${innerHeight - r.top + r.height}`, rotation: `+=${(Math.random() - 0.5) * 90}`, duration: 0.8 + Math.random() * 0.3, ease: "power2.in", onComplete: () => {
          c.style.pointerEvents = "none";
          if (++fallen === cards.length) gsap.delayedCall(1, () => {
            fallen = 0;
            cards.forEach((o, k) => { delete o.dataset.fallen; o.style.pointerEvents = ""; gsap.set(o, { y: 0, rotation: SLOTS[k % SLOTS.length].rotate }); });
            gsap.set(cards, { yPercent: 180, autoAlpha: 0 });
            pop();
          });
        } });
      });
    });
  });

  // Story strip — once, when the top edge reaches 75% of the screen (after the ready door opens): after a .2s delay, lines rise from 100% below · transparent over .8s expo.out in .2 sequence, and
  // The badge goes from 1.2x and transparent to standing in .8s from .4s, .1s later the button fades in over 1.2s, and 1.5s later the badge starts trembling
  $$("[data-story-title]").forEach((title) => {
    const tag = title.querySelector("[data-story-tag]"), link = title.parentElement.querySelector("[data-story-link]");
    if (reduce) { if (tag) VS.vibrate(tag); return; }
    const lines = SplitText.create(title, { type: "lines" }).lines;
    const tl = gsap.timeline({ delay: 0.2, paused: true });
    tl.fromTo(lines, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.2 }, 0);
    if (tag) tl.fromTo(tag, { scale: 1.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: "expo.out" }, 0.4).addLabel("tag").call(() => VS.vibrate(tag), null, "tag+=1.5");
    if (link) tl.fromTo(link, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "expo.out" }, tag ? "tag+=0.1" : 0.5);
    gsap.set(lines, { opacity: 0 });
    if (link) gsap.set(link, { opacity: 0 });
    ScrollTrigger.create({ trigger: title.closest("section") || title, start: "top 75%", once: true, onEnter: () => ready.then(() => tl.play()) });
  });

  // Community — while the board stays pinned (scrub 1) the sentence groups switch one share at a time: as a group turns on, lines rise from 140% below with a .2 share power3.out, and the button fades in after a .1 share,
  // .2 before the share ends the row goes to −140% with power3.in, the button fades out (the last group stays)
  $$("[data-comm]").forEach((sec) => {
    const items = $$("[data-comm-item]", sec);
    if (reduce) gsap.set(items.slice(0, -1), { autoAlpha: 0 });
    // Lines are split after the typeface has fully loaded — splitting first would leave lines split at fallback typeface widths that later wrap into two
    else if (items.length) document.fonts.ready.then(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 1 } });
      items.forEach((it, i) => {
        const last = i === items.length - 1, text = it.querySelector("[data-comm-line]"), rest = [...it.children].filter((c) => c !== text);
        const lines = SplitText.create(text, { type: "lines", mask: "lines" }).lines;
        tl.fromTo(it, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.001 }, i);
        if (!last) tl.to(it, { autoAlpha: 0, duration: 0.001 }, i + 1);
        tl.fromTo(lines, { yPercent: 140 }, { yPercent: 0, duration: 0.2, ease: "power3.out" }, i);
        if (rest.length) tl.fromTo(rest, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "none" }, i + 0.1);
        if (!last) {
          tl.to(lines, { yPercent: -140, duration: 0.2, ease: "power3.in" }, i + 0.8);
          if (rest.length) tl.to(rest, { autoAlpha: 0, duration: 0.2, ease: "none" }, i + 0.8);
        }
      });
      tl.set({}, {}, items.length);
      ScrollTrigger.refresh();
    });
    const box = sec.querySelector(".vs-comm__sticky");
    if (!window.OGL || !box) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); requestAnimationFrame(() => commGL(sec, box)); } }, { rootMargin: "150% 0px" });
    io.observe(sec);
  });

  // Community background — WebGL photo-cell columns. The top half and bottom half are drawn separately and flow in opposite directions (top column speeds .7·1.4·1·1.6·.85·1.2x, bottom is the reverse).
  // Columns: 6 on desktop, 4 on tablet, 3 on phone, split across 1.24x the screen width (phone 2.4x) with .5% gaps. Cells are 4:5 · corner .03, and in each column 35% of 8 slots are left empty with .1~.5 spacing between cells.
  // Drifts .003 per frame, speeds up with scroll (.0002 per 1px) up to 20×, cools by .92 and follows by .06. Cells bend with sin by screen height (.25 + scroll speed × 2) and stop when the window cover overlaps
  function commGL(sec, box) {
    const { Renderer, Camera, Transform, Plane, Program, Mesh, Texture } = window.OGL;
    const css = getComputedStyle(document.documentElement);
    const hex = (v) => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = css.getPropertyValue(v).trim(); c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };
    const bg = hex("--kf-raised");
    const small = matchMedia("(max-width: 1023px)").matches;
    const renderer = new Renderer({ alpha: false, antialias: false, dpr: Math.min(devicePixelRatio, small ? 1.5 : 2) });
    const gl = renderer.gl;
    gl.clearColor(bg[0], bg[1], bg[2], 1);
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
    gl.canvas.setAttribute("aria-hidden", "true");
    box.prepend(gl.canvas);
    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;
    const scene = new Transform();
    let view = { width: 1, height: 1 };
    const size = () => {
      renderer.setSize(box.offsetWidth, box.offsetHeight);
      camera.perspective({ aspect: box.offsetWidth / box.offsetHeight });
      const h = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
      view = { width: h * (box.offsetWidth / box.offsetHeight), height: h };
    };
    size();
    const uStrength = { value: 0.25 }, uView = { value: [view.width, view.height] };
    // Placeholder cell — a plate slightly darker than the background with thin diagonal lines (photo slot)
    const tile = () => {
      const c = document.createElement("canvas"); c.width = 160; c.height = 200;
      const x = c.getContext("2d");
      x.fillStyle = css.getPropertyValue("--kf-surface").trim(); x.fillRect(0, 0, 160, 200);
      x.strokeStyle = css.getPropertyValue("--kf-line").trim(); x.lineWidth = 2;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(160, 200); x.moveTo(160, 0); x.lineTo(0, 200); x.stroke();
      return new Texture(gl, { image: c });
    };
    const tex = tile();
    const vertex = `precision highp float;
attribute vec3 position; attribute vec2 uv;
uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
uniform float uStrength; uniform vec2 uView;
varying vec2 vUv;
void main() {
  vec4 p = modelViewMatrix * vec4(position, 1.0);
  p.z -= sin(p.y / uView.y * 3.14159265 + 1.5707963) * uStrength;
  vUv = uv;
  gl_Position = projectionMatrix * p;
}`;
    const fragment = `precision highp float;
uniform sampler2D tMap; uniform float uClipMin; uniform float uClipMax; uniform vec3 uBg;
varying vec2 vUv;
float box(vec2 uv, float a, float r) { vec2 p = (uv - 0.5) * vec2(a, 1.0); vec2 q = abs(p) - vec2(a * 0.5 - r, 0.5 - r); return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main() {
  if (gl_FragCoord.y < uClipMin || gl_FragCoord.y > uClipMax) discard;
  vec4 c = texture2D(tMap, vUv);
  float a = 1.0 - smoothstep(-0.005, 0.005, box(vUv, 0.8, 0.03));
  gl_FragColor = vec4(mix(uBg, c.rgb, a), 1.0);
}`;
    const geometry = new Plane(gl, { heightSegments: 20 });
    const H = gl.canvas.height;
    const program = (min, max) => new Program(gl, { vertex, fragment, depthWrite: false, uniforms: { tMap: { value: tex }, uStrength, uView, uClipMin: { value: min }, uClipMax: { value: max }, uBg: { value: bg } } });
    const UP = [[0.7, -1], [1.4, -1], [1, -1], [1.6, -1], [0.85, -1], [1.2, -1]], DOWN = [[1.2, 1], [0.85, 1], [1.6, 1], [1, 1], [1.4, 1], [0.7, 1]];
    const build = (half) => {
      const phone = matchMedia("(max-width: 767px)").matches, tablet = !phone && small;
      const n = phone ? 3 : tablet ? 4 : 6, total = view.width * (1 + 2 * (phone ? 0.7 : 0.12)), gap = view.width * 0.005;
      const w = (total - (n - 1) * gap) / n, h = w / 0.8, x0 = -total / 2 + w / 2;
      const prog = half === "top" ? program(H * 0.5, H) : program(0, H * 0.5), speeds = half === "top" ? UP : DOWN;
      const cols = [];
      for (let c = 0; c < n; c++) {
        const meshes = [];
        let y = 0, len = 0;
        for (let k = 0; k < 8; k++) {
          const g = 0.1 + Math.random() * 0.4;
          if (Math.random() < 0.35 && meshes.length > 1) { y -= h + g; len += h + g; continue; }
          const m = new Mesh(gl, { geometry, program: prog });
          m.scale.set(w, h, 1); m.position.x = x0 + c * (w + gap); m.base = y; m.setParent(scene);
          meshes.push(m); y -= h + g; len += h + g;
        }
        cols.push({ meshes, len, off: 0, mult: speeds[c][0], dir: speeds[c][1] });
      }
      return cols;
    };
    const groups = [build("top"), build("bottom")];
    let vel = 0, speed = 0.003, raf = null, lastY = scrollY, seen = false, covered = false;
    const tick = () => {
      const d = Math.abs(scrollY - lastY); lastY = scrollY;
      vel = (vel + d * 2e-4) * 0.92;
      speed += (Math.min(0.003 + vel, 0.003 * 20) - speed) * 0.06;
      uStrength.value = 0.25 + vel * 2;
      for (const cols of groups) for (const c of cols) {
        c.off += speed * c.mult * c.dir;
        for (const m of c.meshes) m.position.y = (((m.base + c.off + c.len * 0.5) % c.len) + c.len) % c.len - c.len * 0.5;
      }
      renderer.render({ scene, camera });
      raf = requestAnimationFrame(tick);
    };
    const sync = () => { if (seen && !covered) { if (!raf) raf = requestAnimationFrame(tick); } else if (raf) { cancelAnimationFrame(raf); raf = null; } };
    new IntersectionObserver((es) => { seen = es.some((e) => e.isIntersecting); sync(); }, { rootMargin: "200px" }).observe(sec);
    new MutationObserver(() => { covered = !!document.querySelector("[data-backdrop].is-visible"); sync(); }).observe(document.querySelector("[data-backdrop]") || document.body, { attributes: true, attributeFilter: ["class"] });
    addEventListener("resize", () => { size(); uView.value = [view.width, view.height]; });
    renderer.render({ scene, camera });
  }
})();
