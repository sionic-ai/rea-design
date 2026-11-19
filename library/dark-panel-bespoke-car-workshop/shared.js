// Shared by all pages: cookie gate (words float up from blur, the bar fills, then choosing lets you in), header bar appearance, logo letter hiding,
// Menu that squeezes the body, Lenis smooth scroll, scrollbar, button text splitting, page transition (black curtain 1.2s), footer section.
// Add a page scene with fg.onEnter(fn) and it runs when the gate starts to lift (where the original has setLoaderMounted(false)).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const KEY_CONSENT = "fg-consent";
  const KEY_IN = "fg-entered";
  const store = {
    get: (s, k) => { try { return s.getItem(k); } catch { return null; } },
    set: (s, k, v) => { try { s.setItem(k, v); } catch {} },
    del: (s, k) => { try { s.removeItem(k); } catch {} },
  };

  // ───────── Shared panel insertion: gate, header bar, menu, scroll bar ─────────
  const MARK = '<path d="M20 2 0 20h7.5L20 9l12.5 11H40Z"/><path d="M20 11.5 11 20h5l4-3.6 4 3.6h5Z" opacity=".55"/>';
  const LOGO = `<svg viewBox="0 0 72 32" aria-hidden="true"><g transform="translate(18 0) scale(.9)">${MARK}</g><g class="fg-logo__text"><text x="15" y="31">L</text><text x="29" y="31">O</text><text x="43" y="31">G</text><text x="57" y="31">O</text></g></svg>`;
  const ICONS = [
    '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="14" height="14" rx="2"/></svg>',
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" fill-rule="evenodd"/></svg>',
    '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7"/></svg>',
  ];
  const page = document.querySelector(".fg-page");
  const here = location.pathname.split("/").pop() || "index.html";
  const chrome = document.createElement("div");
  chrome.innerHTML = `
    <header class="fg-head" data-slot="header">
      <nav class="fg-social" aria-label="Social">${ICONS.map((s, i) => `<a href="#" aria-label="Social ${i + 1}">${s}</a>`).join("")}</nav>
      <a class="fg-tel" href="#" aria-label="Phone"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg></a>
      <a class="fg-logo" href="index.html" aria-label="Back to start">${LOGO}</a>
      <button class="fg-nav" type="button" aria-label="Menu" aria-controls="fg-menu" aria-expanded="false">
        <em class="fg-label"><span data-menu="closed">Open Menu</span><span data-menu="open">Close</span></em>
        <i class="fg-burger" aria-hidden="true"><span></span><span></span><span></span></i>
      </button>
    </header>
    <nav id="fg-menu" class="fg-menu" aria-label="Menu" data-slot="menu-stage" data-lenis-prevent>
      <figure class="fg-menu__mark" aria-hidden="true"><svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><path d="M80 8 10 70h26L80 31l44 39h26Z"/><path d="M80 45 44 77h18l18-16 18 16h18Z"/></svg></figure>
      <div class="fg-menu__inner">
        <ul class="fg-menu__big" data-label="Section name in English">
          <li><a href="works.html">Works</a></li>
          <li><a href="product.html">For Sale</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
        <ul class="fg-menu__small" data-label="Info page · cookie settings, English">
          <li><a href="#">Legal</a></li>
          <li><button type="button" data-consent-reset>Cookie Settings</button></li>
        </ul>
      </div>
      <small class="fg-menu__foot"><span>© 0000</span><span>Your partner here<b class="fg-wf-logo">LOGO</b></span><span>Your place of making here</span></small>
    </nav>
    <div class="fg-progress" aria-hidden="true"><i></i></div>
    <div class="fg-leave" aria-hidden="true"></div>`;
  document.body.prepend(...chrome.children);
  document.querySelectorAll(".fg-menu__big a").forEach((a) => a.getAttribute("href") === here && a.setAttribute("aria-current", "page"));

  const gate = document.querySelector(".fg-gate");
  root.classList.remove("fg-boot");
  const nav = document.querySelector(".fg-nav");
  const logoText = [...document.querySelectorAll(".fg-logo__text text")];
  const headBits = [...document.querySelectorAll(".fg-social, .fg-tel, .fg-nav")];

  // ───────── Text splitting ─────────
  // Button text is split into one span per character (--i rolls them down with a .02s delay each). Spaces are left as they are
  const letters = (host) => {
    const text = host.textContent;
    host.parentElement?.setAttribute("aria-label", host.parentElement.getAttribute("aria-label") || text.trim());
    host.setAttribute("aria-hidden", "true");
    host.replaceChildren(...[...text].map((c, i) => {
      const s = document.createElement("span");
      s.textContent = c;
      s.style.setProperty("--i", i);
      return s;
    }));
  };
  document.querySelectorAll(".fg-roll > span").forEach(letters);
  document.querySelectorAll(".fg-btn").forEach((b) => {
    const label = b.querySelector(":scope > span");
    if (label) { const t = label.textContent; label.replaceChildren(); [...t].forEach((c, i) => { const s = document.createElement("span"); s.textContent = c; s.style.setProperty("--i", i); label.append(s); }); b.setAttribute("aria-label", b.getAttribute("aria-label") || t); }
    if (!b.querySelector(":scope > i")) b.append(document.createElement("i"));
  });
  // Make title words inline-block chunks — so multi-line Korean titles don’t break mid-word, spaces left as they are
  const words = (el) => {
    if (el._words) return el._words;
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const w = document.createElement("span");
            w.className = "w";
            w.textContent = part;
            frag.append(w);
            out.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    el.classList.add("fg-words");
    el._words = out;
    return out;
  };
  // Original getIntroGrowInWordValues — word i/n goes 0 → 1 (size) in turn with gap .15 · length .8, blur 8 → 0
  const grow = (p, i, n) => {
    const total = (n - 1) * 0.15 + 0.8;
    const v = Math.min(1, Math.max(0, (p * total - i * 0.15) / 0.8));
    return { scale: v, opacity: v, blur: (1 - v) * 8 };
  };
  const setGrow = (ws, p) => ws.forEach((w, i) => { const g = grow(p, i, ws.length); gsap.set(w, { autoAlpha: g.opacity, scale: g.scale, filter: `blur(${g.blur}px)` }); });

  // ───────── Lenis ─────────
  const lenis = reduce ? null : new Lenis({ lerp: 0.1, wheelMultiplier: 1, infinite: document.body.hasAttribute("data-infinite") });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const bar = document.querySelector(".fg-progress > i");
  const paint = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const y = lenis ? lenis.animatedScroll : scrollY;
    const p = lenis?.options.infinite ? ((y % (max / 2)) + max / 2) % (max / 2) / (max / 2) : max > 0 ? y / max : 0;
    gsap.set(bar, { scaleX: Math.min(1, Math.max(0, p)) });
  };
  lenis ? lenis.on("scroll", paint) : addEventListener("scroll", paint, { passive: true });

  // ───────── Gate → entering ─────────
  const enterFns = [];
  let entered = false;
  const fireEnter = () => {
    if (entered) return;
    entered = true;
    store.set(sessionStorage, KEY_IN, "1");
    revealHead();
    enterFns.forEach((fn) => fn());
    // Release the window lock and re-measure only after the enter motion has all been hung — so that a long refresh doesn’t delay the motion start
    root.classList.remove("fg-gated");
    lenis?.start();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  const revealHead = () => {
    if (reduce) { gsap.set(headBits, { autoAlpha: 1 }); return; }
    gsap.to(headBits, { autoAlpha: 1, top: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
    showLogo();
  };
  let logoShown = false;
  const showLogo = () => {
    if (logoShown) return;
    logoShown = true;
    gsap.to(logoText, { yPercent: 0, y: 0, duration: 0.8, ease: "power3.out", stagger: { amount: 0.1, from: "center" }, overwrite: "auto" });
  };
  const hideLogo = () => {
    if (!logoShown) return;
    logoShown = false;
    gsap.to(logoText, { y: -10, duration: 0.35, ease: "power3.in", stagger: { amount: 0.04, from: "edges" }, overwrite: "auto" });
  };
  gsap.set(logoText, { y: -10 });
  // Header-row buttons start hidden above by their own height (original translate(0, -100%) · autoAlpha 0). In the original this rise is under motion-probe
  // Can’t be reproduced (cause unknown), and only the copy gets caught so the click row’s representative changes — moves the same distance with top instead of transform
  const bitsUp = () => headBits.forEach((b) => (b.style.top = `-${b.offsetHeight}px`));
  if (!reduce) { headBits.forEach((b) => (b.style.position = "relative")); gsap.set(headBits, { autoAlpha: 0 }); bitsUp(); }

  let gateNav = null;
  const runGate = () => {
    gate.hidden = false;
    root.classList.add("fg-gated");
    lenis?.stop();
    const consent = store.get(localStorage, KEY_CONSENT);
    const btns = gate.querySelector(".fg-gate__btns");
    const mk = (label, aria, value) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "fg-enter";
      b.setAttribute("aria-label", aria);
      b.innerHTML = `<span></span>`;
      [...label].forEach((c, i) => { const s = document.createElement("span"); s.textContent = c === " " ? " " : c; s.style.setProperty("--i", i); b.firstChild.append(s); });
      b.addEventListener("click", () => leaveGate(value));
      return b;
    };
    if (consent) btns.append(mk("Enter", "Enter site", consent));
    else btns.append(mk("Yes & Enter", "Accept analytics cookies and enter", "granted"), mk("No & Enter", "Decline analytics cookies and enter", "denied"));
    if (consent) gate.querySelector(".fg-gate__note").remove();
    gsap.set(gate.querySelector(".fg-gate__choice").children, { opacity: 0 });

    const text = gate.querySelector(".fg-gate__text");
    const ws = words(text);
    const pause = (w) => (/[.!?]$/.test(w) ? 0.42 : /[,;:]$/.test(w) ? 0.25 : 0);
    let at = 0;
    // The original constant is .4s later, but the screen takes a bit longer to attach after the first image, so measured, the loader runs longer than the copy (3233 vs 2900ms) — matched with .45s
    const tl = gsap.timeline({ delay: 0.45 });
    gsap.set(ws, { autoAlpha: 0, y: 12, filter: "blur(0.8rem)" });
    gsap.set(text, { autoAlpha: 1 });
    ws.forEach((w, i) => {
      tl.to(w, { autoAlpha: 1, y: 0, filter: "blur(0rem)", duration: 0.65, ease: "power3.out" }, at);
      at += 0.11;
      if (i < ws.length - 1) at += pause(w.textContent);
    });
    // Bar length = Time for the sentence to fully appear (.4 + sum of word gaps + .65). Fills linearly up to .92, then to the end once the page has fully loaded
    const span = 0.4 + at - 0.11 + 0.65;
    const fill = gate.querySelector(".fg-gate__bar > i");
    let filled = false, loaded = document.readyState === "complete";
    const finish = () => {
      if (!filled || !loaded || gate.classList.contains("is-ready")) return;
      gsap.set(fill, { scaleX: 1 });
      gate.classList.add("is-ready");
      const kids = [...gate.querySelector(".fg-gate__choice").children];
      gsap.fromTo(kids, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: "power2.out" });
      if (hoverable) btns.querySelector("button")?.focus({ preventScroll: true });
    };
    gsap.fromTo(fill, { scaleX: 0 }, { scaleX: 0.92, duration: span, ease: "none", onComplete: () => { filled = true; finish(); } });
    if (!loaded) addEventListener("load", () => { loaded = true; finish(); }, { once: true });

    // While the gate is up, going to another page via the header logo lifts the gate along with it — measured on the original, the screen starts changing .81s after the click and drains out over about .77s
    gateNav = (go) => {
      gsap.to(gate, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut", delay: 0.66, onComplete: () => setTimeout(go, 250) });
    };
    const leaveGate = (value) => {
      store.set(localStorage, KEY_CONSENT, value);
      // After choosing, the panel takes no input so the button text rolls back into place (around the original .6s)
      setTimeout(() => gate.classList.add("is-out"), 630);
      const out = gsap.timeline();
      out.set(ws, { filter: "blur(0rem)" }, 0)
        .to(ws, { autoAlpha: 0, y: -12, filter: "blur(0.8rem)", duration: 0.6, stagger: 0.03, ease: "power2.in" }, 0)
        .to(gate.querySelector(".fg-gate__bottom"), { autoAlpha: 0, y: 16, duration: 0.5, ease: "power2.in" }, 0);
      out.to(gate, { autoAlpha: 0, duration: 0.8, ease: "power2.inOut", onStart: fireEnter }, out.duration() + 0.15);
    };
  };

  if (reduce) {
    gate.hidden = true;
    root.classList.remove("fg-in");
    gsap.set(logoText, { y: 0 });
    requestAnimationFrame(fireEnter);
  } else if (store.get(sessionStorage, KEY_IN)) {
    gate.hidden = true;
    root.classList.add("fg-entering");
    setTimeout(() => root.classList.remove("fg-entering"), 1300);
    requestAnimationFrame(fireEnter);
  } else {
    runGate();
  }

  // The logo text shows only at the very top, at the very end, and when the menu is open
  const logoByScroll = () => {
    if (root.classList.contains("fg-menu-open") || !entered) return;
    const y = lenis ? lenis.animatedScroll : scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    (y < 40 || max - y < innerHeight * 0.5) ? showLogo() : hideLogo();
  };
  lenis ? lenis.on("scroll", logoByScroll) : addEventListener("scroll", logoByScroll, { passive: true });

  // ───────── Menu — the body panel shrinks to clip-path 50% · .8x (1s bezzy2) and large text on the red panel behind floats up from blur ─────────
  const menu = document.querySelector(".fg-menu");
  const items = [...menu.querySelectorAll(".fg-menu__big li, .fg-menu__small li, .fg-menu__foot")];
  // The big mark uses the original Background values — only while the menu is open it is pushed by (cursor − screen center)/screen × −120px with .85s power2.out, and returns to 0 when closed (wide screens)
  let markTo = null;
  if (!reduce) {
    const svg = menu.querySelector(".fg-menu__mark svg");
    const mx = gsap.quickTo(svg, "x", { duration: 0.85, ease: "power2.out" });
    const my = gsap.quickTo(svg, "y", { duration: 0.85, ease: "power2.out" });
    const wide = matchMedia("(min-width: 1024px)");
    markTo = (x, y) => { mx(x); my(y); };
    addEventListener("mousemove", (e) => {
      if (wide.matches && root.classList.contains("fg-menu-open")) markTo(-120 * (e.clientX / innerWidth - 0.5), -120 * (e.clientY / innerHeight - 0.5));
    }, { passive: true });
  }
  const setMenu = (open) => {
    if (open === root.classList.contains("fg-menu-open")) return;
    nav.setAttribute("aria-expanded", String(open));
    if (open) {
      root.classList.add("fg-menu-open");
      lenis?.stop();
      showLogo();
      if (!reduce) gsap.fromTo(items, { autoAlpha: 0, filter: "blur(1.2rem)" }, { autoAlpha: 1, filter: "blur(0rem)", duration: 0.8, stagger: 0.08, delay: 0.2, ease: "power2.out", overwrite: true });
    } else {
      root.classList.remove("fg-menu-open");
      root.classList.add("fg-menu-closing");
      markTo?.(0, 0);
      lenis?.start();
      gsap.to(items, { autoAlpha: 0, filter: "blur(1.2rem)", duration: 0.4, ease: "power2.in", overwrite: true });
      setTimeout(() => { root.classList.remove("fg-menu-closing"); logoByScroll(); }, 1000);
    }
  };
  gsap.set(items, { autoAlpha: 0 });
  nav.addEventListener("click", () => setMenu(!root.classList.contains("fg-menu-open")));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  menu.querySelector("[data-consent-reset]").addEventListener("click", () => {
    store.del(localStorage, KEY_CONSENT);
    store.del(sessionStorage, KEY_IN);
    location.reload();
  });

  // ───────── Page turn — a black curtain covers for 1.2s (bezzy2), then the page switches, and the arriving page rises in over 1.2s ─────────
  const leave = document.querySelector(".fg-leave");
  Object.assign(leave.style, { position: "fixed", inset: "0", zIndex: "999", pointerEvents: "none", opacity: "0", background: "var(--site-black)" });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (!entered && gateNav) { gateNav(() => { location.href = href; }); return; }
    root.setAttribute("data-page-leaving", "");
    const beat = parseFloat(getComputedStyle(root).getPropertyValue("--page-beat")) || 1.2;
    leave.style.transition = `opacity ${beat}s cubic-bezier(0.43, 0.195, 0.02, 1)`;
    leave.style.opacity = "1";
    setTimeout(() => { location.href = href; }, beat * 1000);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { root.removeAttribute("data-page-leaving"); leave.style.transition = "none"; leave.style.opacity = "0"; } });

  // Button border glow and logo strip run only while on screen
  const io = new IntersectionObserver((es) => es.forEach((en) => en.target.style.setProperty("--play-state", en.isIntersecting ? "running" : "paused")));
  document.querySelectorAll(".fg-btn, .fg-logos").forEach((el) => io.observe(el));

  // ───────── Closing section — the photo settles from 1.5× and brightens, big title words grow, and the button comes .72s late ─────────
  const outro = document.querySelector(".fg-outro");
  const scenes = [];
  const scene = (fn) => scenes.push(fn);
  scene(() => {
    if (!outro) return;
    const bg = outro.querySelector(".fg-outro__bg");
    const title = outro.querySelector("h2");
    const cta = outro.querySelector(".fg-outro__cta");
    const ws = words(title);
    if (reduce) { gsap.set([bg, cta], { autoAlpha: 1 }); return; }
    gsap.fromTo(bg, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: outro, start: "top bottom", end: "center bottom", scrub: true } });
    gsap.from(bg, { scale: 1.5, transformOrigin: "center bottom", ease: "none", scrollTrigger: { trigger: outro, start: "top bottom", end: "bottom bottom", scrub: true } });
    setGrow(ws, 0);
    const prog = { p: 0 };
    const tw = gsap.to(prog, { p: 1, duration: 0.9, ease: "power2.out", paused: true, onUpdate: () => setGrow(ws, prog.p) });
    const ct = gsap.fromTo(cta, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.72, paused: true });
    ScrollTrigger.create({ trigger: outro, start: "top 60%", once: true, onEnter: () => { tw.play(); ct.play(); } });
    outro.querySelector(".fg-top button")?.addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 2 }) : scrollTo(0, 0)));
  });
  // Cursor light over the closing section photo — values from the original DepthParallax(pointer). At rest the photo stays as is, and when the hand moves it eases .045 per frame
  // Switches to a point light, the screen dims to .16 and only around the cursor (radius 1.05 of screen height, squared falloff, intensity 1.9) is bright. The light follows by .065 each frame,
  // Once half a screen of scroll builds up, it returns .025 at a time to the photo as is. Near parts (depth) catch .55 more light and shift .016 in parallax toward the cursor.
  // The original also takes hand input only on wide screens (when narrow it is a scroll panel, unrelated to the cursor). In photo slots, a placeholder pattern is drawn on a canvas and fed into the same shader,
  // Without a depth map, use a vertical gradient with the bottom nearer — the real photo goes inside .fg-ph <img>, the depth map is taken from the data-depth address of .fg-ph
  scene(() => {
    const ph = outro?.querySelector(".fg-outro__bg .fg-ph");
    if (!ph || reduce || !matchMedia("(min-width: 1024px)").matches) return;
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    Object.assign(cv.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block", opacity: "0", transition: "opacity .3s ease-in-out" });
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false });
    if (!gl) return;
    const VS = "attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}";
    const FS = `precision highp float;
varying vec2 v;
uniform sampler2D photo, depth;
uniform vec2 size, light;
uniform float spot, photoAspect;
float near(vec2 q) { return texture2D(depth, q).r; }
void main() {
  float a = size.x / size.y;
  vec2 k = a > photoAspect ? vec2(1.0, photoAspect / a) : vec2(a / photoAspect, 1.0);
  vec2 q = (v - 0.5) * k + 0.5;
  q += (light - 0.5) * 0.016 * (near(q) - 0.45);
  float reach = pow(clamp(1.0 - length((v - light) * vec2(a, 1.0)) / 1.05, 0.0, 1.0), 2.0);
  float lit = 0.16 + 1.9 * reach * mix(1.0, smoothstep(0.0, 0.85, near(q)), 0.55);
  vec3 c = texture2D(photo, q).rgb * mix(1.0, lit, spot);
  gl_FragColor = vec4(c / (1.0 + 0.15 * spot * c), 1.0);
}`;
    const prog = gl.createProgram();
    [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]].forEach(([t, src]) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(prog, s); });
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = Object.fromEntries(["photo", "depth", "size", "light", "spot", "photoAspect"].map((n) => [n, gl.getUniformLocation(prog, n)]));
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const texs = [0, 1].map((unit) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]].forEach(([k, val]) => gl.texParameteri(gl.TEXTURE_2D, k, val));
      return t;
    });
    const upload = (unit, src) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texs[unit]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    };
    const img = ph.querySelector("img");
    const paper = () => {
      if (img?.complete && img.naturalWidth) return { src: img, aspect: img.naturalWidth / img.naturalHeight };
      const w = Math.min(1280, ph.clientWidth), h = Math.round(w * ph.clientHeight / ph.clientWidth);
      const c = Object.assign(document.createElement("canvas"), { width: w, height: h }), x = c.getContext("2d");
      const probe = document.createElement("i");
      probe.style.color = "var(--site-ph-line)";
      ph.append(probe);
      x.fillStyle = getComputedStyle(ph).backgroundColor;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = getComputedStyle(probe).color;
      probe.remove();
      x.lineWidth = w / ph.clientWidth;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke();
      return { src: c, aspect: w / h };
    };
    const ramp = () => {
      const c = Object.assign(document.createElement("canvas"), { width: 1, height: 128 }), x = c.getContext("2d"), im = x.createImageData(1, 128);
      for (let i = 0; i < 128; i++) im.data.set([i * 2, i * 2, i * 2, 255], i * 4);
      x.putImageData(im, 0, 0);
      return c;
    };
    const at = { x: 0.5, y: 0.5 }, aim = { x: 0.5, y: 0.5 };
    let spot = 0, want = 0, jump = false, hand = null, rolled = 0, lastY = null, dirty = true, live = false, raf = 0;
    // The placeholder pattern is drawn to the board size, so re-upload it when the size changes. If the real photo loads late, swap it in then
    const dress = () => { const p = paper(); upload(0, p.src); gl.uniform1f(u.photoAspect, p.aspect); dirty = true; };
    dress();
    upload(1, ramp());
    img?.addEventListener("load", dress);
    if (ph.dataset.depth) { const d = new Image(); d.crossOrigin = "anonymous"; d.onload = () => { upload(1, d); dirty = true; }; d.src = ph.dataset.depth; }
    gl.uniform1i(u.photo, 0);
    gl.uniform1i(u.depth, 1);
    ph.append(cv);

    const fit = () => {
      const r = Math.min(devicePixelRatio || 1, 2), w = Math.round(cv.clientWidth * r), h = Math.round(cv.clientHeight * r);
      if (!w || !h || (cv.width === w && cv.height === h)) return;
      cv.width = w; cv.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(u.size, w, h);
      if (!img?.naturalWidth) dress();
      dirty = true;
    };
    const frame = () => {
      if (hand) {
        const b = cv.getBoundingClientRect(), w = cv.clientWidth, h = cv.clientHeight;
        aim.x = (hand.x - (b.left + b.width / 2 - w / 2)) / w;
        aim.y = 1 - (hand.y - (b.top + b.height / 2 - h / 2)) / h;
      }
      if (jump) { jump = false; at.x = aim.x; at.y = aim.y; dirty = true; }
      const dx = aim.x - at.x, dy = aim.y - at.y, ds = want - spot;
      if (!dirty && Math.abs(dx) < 5e-4 && Math.abs(dy) < 5e-4 && Math.abs(ds) < 5e-4) return;
      at.x += dx * 0.065; at.y += dy * 0.065;
      spot += ds * (ds > 0 ? 0.045 : 0.025);
      gl.uniform2f(u.light, at.x, at.y);
      gl.uniform1f(u.spot, spot);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      dirty = false;
      cv.style.opacity = "1";
    };
    const loop = () => { raf = requestAnimationFrame(loop); frame(); };
    const point = (x, y) => { if (spot < 0.05) jump = true; hand = { x, y }; want = 1; rolled = 0; };
    addEventListener("pointermove", (e) => point(e.clientX, e.clientY), { passive: true });
    addEventListener("touchmove", (e) => e.touches[0] && point(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    addEventListener("scroll", () => {
      const y = scrollY;
      if (lastY !== null) rolled = Math.min(rolled + Math.abs(y - lastY), innerHeight * 0.5);
      lastY = y;
      if (rolled >= innerHeight * 0.5) want = 0;
    }, { passive: true });
    new ResizeObserver(() => { fit(); if (!raf) frame(); }).observe(cv);
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting === live) return;
      live = en.isIntersecting;
      if (live) { fit(); dirty = true; raf ||= requestAnimationFrame(loop); return; }
      cancelAnimationFrame(raf); raf = 0;
      spot = 0; want = 0; rolled = 0; lastY = null; dirty = true;
    }).observe(outro);
    fit();
    frame();
  });
  // Previous section (past work · stock) — photo plates drop in from above and settle, when the section leaves they are pushed down and fade away
  scene(() => {
    if (reduce) return;
    document.querySelectorAll(".fg-teaser").forEach((sec) => {
      const bg = sec.querySelector(".fg-teaser__bg");
      gsap.from(bg, { yPercent: -50, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true } });
      gsap.to(bg, { yPercent: 50, ease: "none", scrollTrigger: { trigger: sec, start: "bottom bottom", end: "bottom top", scrub: true } });
      gsap.to(bg, { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: sec, start: "bottom bottom", end: "bottom top", scrub: true } });
    });
  });

  // Big heading — while the letters rise from 120% below over .6s expo.out (letter stagger min(.025, .5/(n−1))), a faint 18%, once all are up
  // Undoes the text splitting and the edge fill (edge-fill-lines 1.5s, line gap .1s) sweeps through. The Hero one runs when the gate lifts, the others when they enter 80% of the screen
  const riseFill = (el) => {
    const text = el.textContent;
    if (!text.trim()) return;
    // Spaces are left as plain text — putting them in an inline-block cell makes the width 0, so the line width jumps when switching to fill
    const bits = [...text].map((c) => { if (c === " ") return document.createTextNode(" "); const s = document.createElement("span"); s.className = "fg-ch"; s.textContent = c; return s; });
    const chars = bits.filter((b) => b.nodeType === 1);
    // Put the letters in a single line (span) and, once all have risen, apply the fill to that same line — the original SplitText line becomes the fill line as is
    const line = document.createElement("span");
    line.className = "fg-rise-line";
    line.setAttribute("data-fx-part", "line");
    line.append(...bits);
    if (getComputedStyle(el).textAlign === "center") el.setAttribute("data-center", "");
    el.replaceChildren(line);
    gsap.set(el, { clipPath: "inset(-0.14em)", opacity: 0.18 });
    gsap.set(chars, { yPercent: 120 });
    const t = Math.min(0.025, 0.5 / Math.max(chars.length - 1, 1));
    return gsap.timeline({ paused: true })
      .set(line, { color: "inherit" })
      .to(chars, { yPercent: 0, duration: 0.6, ease: "expo.out", stagger: t })
      .call(() => {
        line.textContent = text;
        gsap.set(line, { clearProps: "color" });
        gsap.set(el, { clearProps: "clipPath,opacity" });
        const align = getComputedStyle(el).textAlign === "center" ? "; align: center" : "";
        el.setAttribute("data-fx-edge-fill-lines", `dur: 1.5; lag: .1; start: top bottom${align}`);
        el.setAttribute("data-fx", "edge-fill-lines");
      }, null, (chars.length - 1) * t + 0.39);
  };
  // Hero intro text — same type as the first-page intro lines (1s after entering, line by line at .14s intervals, .9s power3.out from below).
  // Big title and intro text are hidden under the gate, so split them the moment they enter — if split beforehand, the element is counted as changed while it rests
  const riseLines = (p) => {
    const parts = p.innerHTML.split(/<br\s*\/?>/i);
    p.innerHTML = parts.map((h) => `<span class="fg-line"><span>${h}</span></span>`).join("");
    const lines = [...p.querySelectorAll(".fg-line > span")];
    gsap.fromTo(lines, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 0.9, stagger: 0.14, ease: "power3.out", delay: 1 });
  };
  if (!reduce) {
    const hero = () => document.querySelectorAll('[data-rise-lines], [data-rise-fill="enter"]');
    enterFns.push(() => hero().forEach((el) => {
      if (el.closest('[aria-hidden="true"]')) return;
      el.hasAttribute("data-rise-lines") ? riseLines(el) : riseFill(el)?.play();
    }));
  }
  // Applied when the scene is built — Work and stock lists attach one more set of cells, so it also applies to titles of the attached cells
  scene(() => {
    if (reduce) return;
    document.querySelectorAll('[data-rise-fill="scroll"], [aria-hidden="true"] [data-rise-fill]').forEach((el) => {
      const tl = riseFill(el);
      if (tl) ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => tl.play() });
    });
  });

  // Build the scene after all fonts are downloaded, since word widths depend on the font
  const build = () => { scenes.forEach((fn) => fn()); ScrollTrigger.refresh(); paint(); };
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(build));

  window.fg = { lenis, words, grow, setGrow, reduce, hoverable, scene, onEnter: (fn) => (entered ? fn() : enterFns.push(fn)), letters };
})();
