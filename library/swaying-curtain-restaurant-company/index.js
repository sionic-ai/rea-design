// First page: curtain WebGL, big copy entrance, shop card slider, recruiting background fixed.
(() => {
  const still = document.documentElement.classList.contains("cc-still");

  // ---------- Fabric curtain — like the original, a curtains.js 8.1.6 plane (60×60, follows scroll) with the cloth image applied and swayed by a vertex formula.
  // Fixed full-screen canvas with one plane per .cc-curtain slot. Shake strength follows a random target per frame with decay by screen width (original values) ----------
  const hero = document.querySelector(".cc-hero");
  const stage = document.querySelector(".cc-hero__canvas");
  const curtains = [...document.querySelectorAll(".cc-curtain")];

  const VS = `
    precision mediump float;
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform float uMouseTime;
    uniform vec2 uMousePosition;
    uniform float uMouseMoveStrength;
    varying vec3 vPos;
    varying vec3 vOrig;
    varying vec2 vUv;
    void main() {
      vec3 p = aVertexPosition;
      // Top edge (y = Takes 1) as the hanging point — the lower it goes, the more it swings
      float hang = p.y - 1.0;
      float dist = distance(vec2(uMousePosition.x, 0.0), vec2(p.x, 0.0));
      float wave = cos(35.0 * ((1.0 / (cos(dist) - 2.0)) - uMouseTime * 0.0015));
      float xAtt = (2.0 - abs(uMousePosition.x - p.x)) / 2.0;
      float yAtt = clamp(((-1.0 * uMousePosition.y) + 1.0) / 2.0, 0.0, 1.0);
      float effect = hang * wave * uMouseMoveStrength * xAtt * yAtt;
      p.z += effect / 30.0;
      p.x += effect * 1.5 * (abs(hang) * sign(p.x)) / 240.0;
      gl_Position = uPMatrix * uMVMatrix * vec4(p, 1.0);
      vUv = aTextureCoord;
      vPos = p;
      vOrig = aVertexPosition;
    }`;
  const FS = `
    precision mediump float;
    varying vec3 vPos;
    varying vec3 vOrig;
    varying vec2 vUv;
    uniform sampler2D curtainSampler;
    vec3 normalAt(vec3 pos, vec3 orig) {
      vec3 n1 = vec3(orig.x + 0.25, orig.y, orig.z);
      vec3 n2 = vec3(orig.x, pos.y + 0.25, orig.z);
      return normalize(cross(n1 - pos, n2 - pos));
    }
    void main() {
      vec4 c = texture2D(curtainSampler, vUv);
      float light = smoothstep(0.45, 1.0, dot(normalAt(vPos, vOrig), normalize(vec3(0.3, 0.3, 1.0))));
      c.rgb = c.rgb * light * 0.35 + c.rgb * 0.65;
      gl_FragColor = vec4(c.rgb * c.a, c.a);
    }`;

  // A single piece of cloth — instead of the original image: cloth ground · fine weave pattern · uneven hem, a round logo spot at the center, a small stamp at the left. Color and font are read from the skin.
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  // A color made from another variable (oklch(from …)) must be read as the value painted on the element for the canvas to know it
  const paintOf = (name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    hero.appendChild(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  const paintCloth = (kind) => {
    const W = 960, H = 510;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    const ink = paintOf("--kf-ink"), accent = paintOf("--kf-accent");
    x.beginPath();
    x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, H - 10);
    for (let i = W; i >= 0; i -= 40) x.lineTo(i, H - 6 - Math.sin(i * 0.013 + kind.length) * 4);
    x.closePath();
    x.fillStyle = paintOf("--site-cloth");
    x.fill();
    x.save();
    x.clip();
    x.fillStyle = ink;
    for (let i = 0; i < W; i += 3) {
      x.globalAlpha = 0.012 + (i % 9 === 0 ? 0.01 : 0);
      x.fillRect(i, 0, 1, H);
    }
    x.globalAlpha = 1;
    const g = x.createLinearGradient(0, H - 60, 0, H);
    g.addColorStop(0, "transparent");
    g.addColorStop(1, ink);
    x.globalAlpha = 0.05;
    x.fillStyle = g;
    x.fillRect(0, H - 60, W, 60);
    x.globalAlpha = 1;
    x.restore();
    if (kind === "logo") {
      x.lineWidth = 7;
      x.strokeStyle = ink;
      x.beginPath();
      x.arc(W / 2, 250, 170, 0, Math.PI * 2);
      x.stroke();
      x.fillStyle = ink;
      x.textAlign = "center";
      x.font = `700 34px ${v("--kf-font-en") || v("--kf-font-display")}`;
      ["COMPANY", "NAME", "INC."].forEach((t, i) => x.fillText(t, W / 2, 210 + i * 46));
    }
    if (kind === "stamp") {
      // On phone only the right end of the left width lands on screen (the original phone image does the same), so move the stamp to the right
      const sx = innerWidth <= 767 ? W - 150 : 96;
      x.strokeStyle = accent;
      x.lineWidth = 4;
      x.strokeRect(sx, 322, 44, 84);
      x.fillStyle = accent;
      x.font = `700 22px ${v("--kf-font-sans")}`;
      x.textAlign = "center";
      ["Also", "Section"].forEach((t, i) => x.fillText(t, sx + 22, 356 + i * 34));
    }
    return c;
  };

  const tune = () => (innerWidth <= 575 ? [0.08, 4e-4] : innerWidth <= 767 ? [0.1, 6e-4] : innerWidth <= 1023 ? [0.2, 8e-4] : innerWidth <= 1299 ? [0.3, 0.001] : [0.5, 0.004]);
  // The curtains.js build attaches Curtains·Plane·Vec2 directly to window
  const probe = document.createElement("canvas");
  if (!window.Curtains || !(probe.getContext("webgl") || probe.getContext("experimental-webgl"))) hero.classList.add("no-gl");
  else {
    const curt = new Curtains({ container: stage, premultipliedAlpha: true, pixelRatio: Math.min(1.5, devicePixelRatio), production: true });
    curt.onError(() => hero.classList.add("no-gl"));
    const planes = curtains.map((el) => {
      const st = { max: 0, applied: 0 };
      const plane = new Plane(curt, el, {
        vertexShader: VS,
        fragmentShader: FS,
        widthSegments: 60,
        heightSegments: 60,
        watchScroll: true,
        drawCheckMargins: { top: 0, right: 0, bottom: 0, left: 0 },
        uniforms: {
          mouseTime: { name: "uMouseTime", type: "1f", value: 0 },
          mousePosition: { name: "uMousePosition", type: "2f", value: new Vec2(0, 0) },
          mouseMoveStrength: { name: "uMouseMoveStrength", type: "1f", value: 0 },
        },
      });
      const cloth = paintCloth(el.dataset.curtain);
      cloth.setAttribute("data-sampler", "curtainSampler");
      plane.loadCanvas(cloth);
      plane.onRender(() => {
        if (still) return;
        const [maxT, damp] = tune();
        plane.uniforms.mouseTime.value += devicePixelRatio > 1.5 ? 0.5 : 1;
        st.max = Math.random() + Math.random();
        st.applied += (st.max - st.applied) * damp;
        if (st.applied > maxT) st.applied -= (st.max - st.applied) * damp;
        else st.applied += (st.max - st.applied) * damp;
        plane.uniforms.mouseMoveStrength.value = st.applied;
      });
      return { plane, cloth };
    });
    // When the font arrives late, the logo text of the cloth picture is redrawn — the canvas picture is re-uploaded every time curtains draws
    document.fonts?.ready.then(() =>
      planes.forEach(({ cloth }, i) => {
        const x = cloth.getContext("2d");
        x.clearRect(0, 0, cloth.width, cloth.height);
        x.drawImage(paintCloth(curtains[i].dataset.curtain), 0, 0);
      })
    );
  }

  // ---------- Large phrase — from 20px blur and transparent to sharp over 2.5s (1.5s late) ----------
  const catchEl = document.querySelector(".cc-hero__catch");
  if (!still) gsap.fromTo(catchEl, { filter: "blur(20px)", opacity: 0 }, { filter: "blur(0px)", opacity: 1, duration: 2.5, ease: "power3.out", delay: 1.5 });

  // ---------- Shop card slider: same Splide as the original (free drag · gap 40 · width per card · arrows), on phones (767 and below) it is released and stacked vertically ----------
  const slider = document.querySelector("[data-shop-slider]");
  if (window.Splide && slider) {
    new Splide(slider, { arrows: true, pagination: false, drag: "free", gap: 40, autoWidth: true, destroy: false, speed: still ? 0 : 400, breakpoints: { 767: { destroy: true } } }).mount();
  }

  // ---------- Careers — background photo pinned to the section end (taking no space) ----------
  if (!still) {
    ScrollTrigger.create({ trigger: ".cc-recruit", start: "top top", end: "bottom bottom", pin: ".cc-recruit__bg", pinSpacing: false });
  }
})();
