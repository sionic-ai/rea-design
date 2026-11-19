// First page scenes: hero entrance and ASCII lens, project pinned flip, photo pins between words, service list, number band.
(() => {
  const BOTH = {
    desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
  };

  // ── Hero: when the loader ends, the photo settles down from 1.15, two title chunks come in from the sides, and the header band from above ──
  RK.scene((rk) => {
    const hero = document.querySelector(".rk-hero");
    const media = hero.querySelector(".rk-hero__media");
    let played = false;
    gsap.matchMedia().add({ desktop: "(min-width: 1024px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions: c }) => {
      if (!c.motion) return;
      if (!played) {
        played = true;
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
          .fromTo(media, { scale: 1.15 }, { scale: 1, duration: 1.6 }, 0);
        if (c.desktop) {
          tl.fromTo(".rk-hero__half--left", { xPercent: -100 }, { xPercent: 0, duration: 1.1 }, 0.2)
            .fromTo(".rk-hero__half--right", { xPercent: 100 }, { xPercent: 0, duration: 1.1 }, 0.2);
        } else {
          tl.fromTo(".rk-hero__mob-text", { yPercent: 100 }, { yPercent: 0, duration: 1.1 }, 0.2);
        }
        // The header band is outside the container (so it stays after transition), so it is passed as an element rather than a letter selector — the scene runs inside a gsap.context scoped to the container.
        tl.fromTo(document.querySelector(".rk-header__inner"), { yPercent: -100 }, { yPercent: 0, duration: 0.8 }, 0.6)
          .fromTo(".rk-hero__scroll", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1);
        rk.intro.then(() => tl.play());
      }
      gsap.to(media, { yPercent: 20, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    });
    document.documentElement.classList.remove("is-loading");
    const offVideo = heroVideo(media.querySelector("video"));
    const offAscii = heroAscii(hero, media);
    return () => { offVideo(); offAscii(); };
  });

  // Only on wide screens (1200+): covers the video with a letter mosaic of 6px cells, and shows it clean inside a 400px lens around the mouse
  const ASCII = { cell: 6, glyphs: " ·LOGO", tile: 0.66, mix: 0.5, radius: 400, softness: 0.5, follow: 0.18, fade: 0.08 };
  function heroAscii(hero, media) {
    const wide = matchMedia("(min-width: 1200px)");
    let stop = null;
    const sync = () => {
      if (wide.matches && !stop && !RK.reduced) stop = startAscii(hero, media);
      else if (!wide.matches && stop) { stop(); stop = null; }
    };
    sync();
    wide.addEventListener("change", sync);
    return () => { wide.removeEventListener("change", sync); stop?.(); };
  }

  // Video plays only while visible, as in the original (looping), and fades in over .8s once it actually starts. With reduced motion or data saver, only the photo slot
  function heroVideo(v) {
    if (!v || RK.reduced || navigator.connection?.saveData) return () => {};
    v.muted = true;
    const on = () => v.classList.add("is-playing");
    v.addEventListener("playing", on);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => { io.disconnect(); v.removeEventListener("playing", on); v.pause(); };
  }

  function startAscii(hero, media) {
    const canvas = document.createElement("canvas");
    canvas.className = "rk-hero__ascii";
    canvas.setAttribute("aria-hidden", "true");
    media.append(canvas);
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) { canvas.remove(); return () => {}; }

    const vs = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }";
    const fs = `precision highp float;
      uniform sampler2D uSrc, uAtlas;
      uniform vec2 uRes, uScale, uOffset, uMouse, uGrid;
      uniform float uCell, uCount, uHover, uRadius, uSoft, uTile, uMix;
      vec3 pick(vec2 px) { return texture2D(uSrc, px / uRes * uScale + uOffset).rgb; }
      void main() {
        vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
        vec2 cell = floor(px / uCell);
        vec3 col = pick((cell + .5) * uCell);
        float lum = clamp(dot(col, vec3(.2126, .7152, .0722)), 0., 1.);
        float idx = floor(lum * (uCount - 1.) + .5);
        vec2 slot = vec2(mod(idx, uGrid.x), floor(idx / uGrid.x));
        float ink = texture2D(uAtlas, (slot + fract(px / uCell)) / uGrid).r;
        vec3 mosaic = mix(col * uTile, min(mix(col, vec3(1.), .15) * 1.25, 1.), ink);
        vec3 clean = pick(px);
        mosaic = mix(mosaic, clean, uMix);
        float lens = (1. - smoothstep(uRadius * (1. - uSoft), uRadius + .001, distance(px, uMouse))) * uHover;
        gl_FragColor = vec4(mix(mosaic, clean, lens), 1.);
      }`;
    const prog = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      gl.attachShader(prog, s);
    }
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return () => {}; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const texture = (unit) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return t;
    };
    const srcTex = texture(0);
    texture(1);
    gl.uniform1i(u("uSrc"), 0);
    gl.uniform1i(u("uAtlas"), 1);

    // Glyph board in order of brightness (16 columns × rows), white text on black
    const glyphs = [...ASCII.glyphs];
    const rows = Math.ceil(glyphs.length / 16);
    const atlas = document.createElement("canvas");
    atlas.width = 1024;
    atlas.height = rows * 64;
    const a = atlas.getContext("2d");
    a.fillStyle = "#000"; // Not skin: the text panel is a black-and-white mask where the shader reads the red channel only as text coverage
    a.fillRect(0, 0, atlas.width, atlas.height);
    a.fillStyle = "#fff"; // Not a skin: letter cells of the text-board mask
    a.font = `400 52px ${getComputedStyle(document.body).fontFamily}`;
    a.textAlign = "center";
    a.textBaseline = "middle";
    glyphs.forEach((ch, i) => a.fillText(ch, (i % 16) * 64 + 32, Math.floor(i / 16) * 64 + 34));
    gl.activeTexture(gl.TEXTURE1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
    gl.uniform2f(u("uGrid"), 16, rows);
    gl.uniform1f(u("uCount"), glyphs.length);

    const real = media.querySelector("video");
    const state = { dpr: 1, mouse: [0, 0], hover: 0 };
    const ptr = { x: 0, y: 0, inside: false };
    const move = (e) => {
      const r = canvas.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * canvas.width;
      const y = ((e.clientY - r.top) / r.height) * canvas.height;
      if (!ptr.inside) state.mouse = [x, y];
      Object.assign(ptr, { x, y, inside: true });
    };
    const out = () => (ptr.inside = false);
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerdown", move);
    hero.addEventListener("pointerleave", out);
    const size = () => {
      state.dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(media.clientWidth * state.dpr);
      canvas.height = Math.round(media.clientHeight * state.dpr);
    };
    const ro = new ResizeObserver(size);
    ro.observe(media);
    size();

    let raf = 0;
    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      state.mouse[0] += (ptr.x - state.mouse[0]) * ASCII.follow;
      state.mouse[1] += (ptr.y - state.mouse[1]) * ASCII.follow;
      state.hover += (+ptr.inside - state.hover) * ASCII.fade;
      const src = real;
      const sw = real.videoWidth, sh = real.videoHeight;
      if (!sw || !sh) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, srcTex);
      // On a page opened via file:// the video counts as another origin and WebGL cannot read it — then drop the shader and keep only the video
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); } catch (e) { off(); return; }
      // Fills the box keeping the original ratio, like object-fit: cover
      const { width: w, height: h } = canvas;
      const k = w / h / (sw / sh);
      const scale = k < 1 ? [k, 1] : [1, 1 / k];
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u("uRes"), w, h);
      gl.uniform2f(u("uScale"), scale[0], scale[1]);
      gl.uniform2f(u("uOffset"), (1 - scale[0]) / 2, (1 - scale[1]) / 2);
      gl.uniform1f(u("uCell"), ASCII.cell * state.dpr);
      gl.uniform2f(u("uMouse"), state.mouse[0], state.mouse[1]);
      gl.uniform1f(u("uHover"), state.hover);
      gl.uniform1f(u("uRadius"), ASCII.radius * state.dpr);
      gl.uniform1f(u("uSoft"), ASCII.softness);
      gl.uniform1f(u("uTile"), ASCII.tile);
      gl.uniform1f(u("uMix"), ASCII.mix);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.classList.add("is-ready");
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(media);
    function off() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerdown", move);
      hero.removeEventListener("pointerleave", out);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    }
    return off;
  }

  // Project: pinned to the screen, the next photo slides in from the right with clip and the caption follows from below. Stops at each label
  RK.scene(() => {
    const wrap = document.querySelector(".rk-projects");
    const items = [...wrap.querySelectorAll(".rk-project")];
    gsap.matchMedia().add(BOTH, ({ conditions: c }) => {
      wrap.classList.add("is-animated");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrap, start: "top top", end: () => `+=${(items.length - 1) * innerHeight}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true,
          snap: { snapTo: "labels", duration: { min: 0.2, max: 0.6 }, delay: 0.1, ease: "power1.inOut" },
        },
      });
      tl.addLabel("p1");
      items.slice(1).forEach((el, i) => {
        tl.fromTo(el, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" });
        if (c.desktop) tl.fromTo(el.querySelector(".wf-img"), { scale: 1.1 }, { scale: 1, duration: 1, ease: "power2.out" }, "<");
        tl.fromTo(el.querySelectorAll(".rk-project__eyebrow, .rk-project__copy, .rk-project__cta"), { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }, "<0.5")
          .addLabel(`p${i + 2}`);
      });
      return () => wrap.classList.remove("is-animated");
    });
  });

  // ── Photo between words: the word ”slot” steps aside to the far right next to ”insert”, a row of photos comes in from the right, and the center photo fills the screen ──
  RK.scene(() => {
    const sec = document.querySelector(".rk-clarity");
    const $ = (s) => sec.querySelector(s);
    const stage = $(".rk-clarity__stage");
    const track = $(".rk-clarity__track");
    const rowA = $(".rk-clarity__row--a");
    const rowB = $(".rk-clarity__row--b");
    const feature = $(".rk-clarity__item--feature");
    const first = $(".rk-clarity__item--1");
    const last = $(".rk-clarity__item--4");
    const panel = $(".rk-about-panel");
    const words = $(".rk-clarity__words");
    const into = $(".rk-clarity__word--into");
    const space = $(".rk-clarity__word--space");
    const vw = () => document.documentElement.clientWidth;
    const vh = () => stage.offsetHeight;

    const desktop = (tl) => {
      const cover = () => Math.max(vw() / feature.offsetWidth, vh() / feature.offsetHeight);
      const push = () => ((cover() - 1) * feature.offsetWidth) / 2;
      const gap = () => {
        const s = document.createElement("span");
        s.textContent = " ";
        s.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
        words.append(s);
        const w = s.getBoundingClientRect().width;
        s.remove();
        return space.offsetLeft - (into.offsetLeft + into.offsetWidth + w);
      };
      tl.fromTo(space, { x: () => -gap() }, { x: 0, duration: 0.6, ease: "power2.inOut" })
        .fromTo(track, { x: () => vw() }, { x: () => vw() / 2 - (rowB.offsetLeft + feature.offsetLeft + feature.offsetWidth / 2), duration: 1 })
        .to(feature, { scale: () => cover(), duration: 1, ease: "power1.inOut" })
        .to(rowA, { x: () => -push(), duration: 1, ease: "power1.inOut" }, "<")
        .to(last, { x: () => push(), duration: 1, ease: "power1.inOut" }, "<")
        .fromTo(panel, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power2.inOut" })
        .to({}, { duration: 0.4 });
    };
    // Phone: two rows, top and bottom, enter staggered and meet at the center, then the bottom row photo grows vertically and fills the screen
    const mobile = (tl) => {
      const center = () => (vw() - last.offsetWidth) / 2;
      const tall = () => (last.offsetHeight * 607) / 160;
      tl.fromTo(rowA, { x: () => vw() }, { x: () => center() - first.offsetLeft, duration: 1 }, 0)
        .fromTo(rowB, { x: () => -rowB.offsetWidth }, { x: () => center() - feature.offsetLeft, duration: 1 }, 0)
        .to(feature, { height: () => tall(), duration: 0.8, ease: "power1.inOut" })
        .to(rowB, { y: () => (vh() - tall()) / 2 - rowB.offsetTop, duration: 0.8, ease: "power1.inOut" }, "<")
        .to(feature, { width: () => vw(), height: () => vh(), duration: 0.8, ease: "power1.inOut" })
        .to(rowB, { x: () => -feature.offsetLeft, y: () => -rowB.offsetTop, duration: 0.8, ease: "power1.inOut" }, "<")
        .to({}, { duration: 0.4 });
    };

    gsap.matchMedia().add(BOTH, ({ conditions: c }) => {
      sec.classList.add("is-animated");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: c.desktop ? sec : stage, start: "top top", end: () => `+=${(c.desktop ? 3.5 : 3) * innerHeight}`,
          pin: true, scrub: 0.6, invalidateOnRefresh: true,
        },
      });
      c.desktop ? desktop(tl) : mobile(tl);
      return () => sec.classList.remove("is-animated");
    });
  });

  // ── Services: background photo parallax (1.2x, ±8%), capsule strip flows sideways on phones, list rises from below at .08s intervals ──
  RK.scene(() => {
    const sec = document.querySelector(".rk-services");
    const pills = sec.querySelector(".rk-services__pills");
    const svg = pills.querySelector("svg");
    const mm = gsap.matchMedia();
    mm.add(BOTH, ({ conditions: c }) => {
      if (c.desktop) {
        gsap.fromTo(sec.querySelector(".rk-services__media .wf-img"), { yPercent: -8, scale: 1.2 }, { yPercent: 8, scale: 1.2, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
      } else {
        gsap.fromTo(svg, { x: 0 }, {
          x: () => pills.clientWidth - svg.getBoundingClientRect().width - parseFloat(getComputedStyle(svg).marginLeft),
          ease: "none",
          scrollTrigger: { trigger: pills, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      }
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(sec.querySelectorAll(".rk-services__reveal"), { yPercent: 100 }, {
        yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: sec.querySelector(".rk-services__list"), start: "top 80%", once: true },
      });
    });
  });

  // ── Number strip: numbers and captions follow up from 30% below the screen, and the capsule pattern flows slowly on the diagonal ──
  RK.scene(() => {
    const sec = document.querySelector(".rk-stats");
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(sec.querySelectorAll(".rk-stats__value, .rk-stats__label"), { y: () => innerHeight * 0.3 }, {
        y: 0, ease: "power2.out", stagger: 0.15,
        scrollTrigger: { trigger: sec, start: "top bottom", end: "top 15%", scrub: true, invalidateOnRefresh: true },
      });
      gsap.fromTo(sec.querySelector(".rk-stats__pattern-img"), { xPercent: -4, yPercent: 5 }, { xPercent: 4, yPercent: -5, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
    });
  });
})();
