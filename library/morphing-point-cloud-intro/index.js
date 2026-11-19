// Home page sections — text around the globe, turning section text on to match the dot cloud shape, work strip passing horizontally, and when the mail is dragged to screen center the dot cloud draws a box around it.
(() => {
  const root = document.documentElement;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (x) => x * x * (3 - 2 * x);
  const smoother = (x) => x * x * x * (x * (6 * x - 15) + 10);

  // Text around the globe — puts text on two semicircles (top goes left→right, bottom right→left). Radius is 46% of the board width
  const ring = document.querySelector(".id-world__ring");
  if (ring) {
    const top = ring.querySelector("#id-ring-top"), bottom = ring.querySelector("#id-ring-bottom");
    const fit = () => {
      const w = ring.clientWidth || ring.getBoundingClientRect().width;
      if (!w) return;
      const c = w / 2, r = 0.46 * w;
      ring.setAttribute("viewBox", `0 0 ${w} ${w}`);
      top.setAttribute("d", `M ${c - r},${c} A ${r},${r} 0 0 1 ${c + r},${c}`);
      bottom.setAttribute("d", `M ${c + r},${c} A ${r},${r} 0 0 1 ${c - r},${c}`);
    };
    new ResizeObserver(fit).observe(ring);
    fit();
  }

  // Work strip — the section height is set by the length the strip passes (landscape screens tile 50vw, portrait 85vw, 12vw between)
  const play = document.querySelector(".id-play");
  const track = document.querySelector(".id-play__track");
  const stage = document.querySelector(".id-play__stage");
  const kicker = document.querySelector(".id-play__kicker-label");
  const closing = document.querySelector(".id-play__closing");
  const tiles = track ? track.children.length : 0;
  const tallScreen = () => innerWidth < innerHeight;
  const spanOf = (tall) => (tall ? 0.6 : 1);
  const geometry = () => {
    const w = innerWidth, h = innerHeight, tall = w < h;
    const pad = 0.09 * w + (tall ? 0.9 * h : 0), reveal = 2 * h;
    const tileVw = tall ? 85 : 50;
    const startX = -((w * (tiles * tileVw + (tiles - 1) * 12)) / 100) - pad;
    const travel = w + pad - startX;
    return { reveal, startX, travel, height: Math.max(travel / spanOf(tall) - reveal + h, h) };
  };
  const sizePlay = () => {
    if (!play) return;
    play.style.height = `${geometry().height}px`;
    window.idLenis?.resize();
  };
  sizePlay();
  addEventListener("resize", sizePlay);
  // The band is brought in when the section approaches within two screens — before that a transparent tile spans the hero and the cursor turns into a link ring
  if (stage && play) {
    stage.hidden = true;
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { stage.hidden = false; near.disconnect(); updatePlay(); } }, { rootMargin: "200% 0px" });
    near.observe(play);
  }

  let wasActive = false;
  const updatePlay = () => {
    if (!play || !track) return;
    const { reveal, startX, travel } = geometry();
    const r = play.getBoundingClientRect();
    const active = r.top < reveal && r.bottom > 0;
    if (active !== wasActive) { wasActive = active; stage.dataset.active = String(active); }
    if (!active) {
      kicker.dataset.active = "false";
      closing.dataset.active = "false";
      window.idScene?.set({ tunnel: 0 });
      return;
    }
    const lowEnough = r.bottom > 0.6 * innerHeight;
    const moved = Math.min(Math.max(reveal - r.top, 0) * spanOf(tallScreen()), travel);
    track.style.transform = `translateX(${startX + smoother(moved / travel) * travel}px)`;
    const p = moved / travel, from = tallScreen() ? 0.4 : 0.6;
    const tunnel = smoother(clamp((p - from) / (1 - from)));
    window.idScene?.set({ tunnel });
    const closingOn = lowEnough && tunnel > 0.5;
    const workReady = parseFloat(getComputedStyle(root).getPropertyValue("--site-work-ready")) || 0;
    kicker.dataset.active = String(lowEnough && !closingOn && !(workReady > 0.15));
    closing.dataset.active = String(closingOn);
  };

  // Section text turn-on — same scroll math as the dot cloud (shape change at 1~2, 2~3, 3~4 screens, spiral slide at 4~6.5 screens)
  const ready = () => {
    const s = scrollY / innerHeight;
    const m1 = smooth(clamp(s - 1)), m2 = smooth(clamp(s - 2)), m3 = smooth(clamp(s - 3)), slide = clamp(Math.max(0, s - 4) / 2.5);
    root.style.setProperty("--site-globe-ready", (clamp((m1 - 0.85) / 0.15) * (1 - clamp(m2 / 0.15))).toFixed(4));
    root.style.setProperty("--site-place-ready", (clamp((m2 - 0.99) / 0.01) * (1 - clamp((m3 - 0.85) / 0.15))).toFixed(4));
    root.style.setProperty("--site-work-ready", (clamp((m3 - 0.85) / 0.15) * (1 - clamp((slide - 0.85) / 0.15))).toFixed(4));
  };

  // Mail — forms when it enters the 90% line of the screen, and the closer to the center (smootherstep) the more the dot cloud gathers into the surrounding box
  const email = document.querySelector(".id-contacts__email");
  if (email) {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { email.dataset.entered = "true"; io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(email);
  }
  const focus = () => {
    if (!email) return;
    const r = email.getBoundingClientRect(), h = innerHeight;
    const off = Math.abs(r.top + r.height / 2 - h / 2) / (h / 2);
    window.idScene?.set({ frame: smoother(clamp(1 - off)), rect: { left: r.left, top: r.top, width: r.width, height: r.height } });
  };

  const mm = gsap.matchMedia();
  mm.add("all", () => {
    let raf = 0, queued = false;
    const frame = () => { raf = requestAnimationFrame(frame); ready(); focus(); };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; updatePlay(); });
    };
    ready();
    updatePlay();
    raf = requestAnimationFrame(frame);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", updatePlay);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", updatePlay);
    };
  });
})();
