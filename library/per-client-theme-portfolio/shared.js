// Interaction shared by all pages: nav hides (when scrolling down over 20px) · theme-color follows the section color · video loads 400px before the screen and autoplays ·
// The video slot plays on press, the subscribe slot pretends to send. The original has no page-transition effect (usually a normal link navigation).
(() => {
  const page = document.body.dataset.page;

  // Nav — on home it hides after scrolling past 20px and returns near the end (within screen height + 20px), on posts it stays hidden past 20px, and the blog list is always visible
  const nav = document.querySelector(".dt-nav");
  if (nav && page !== "news") {
    let docH = document.documentElement.scrollHeight, wait;
    const remeasure = () => { wait ||= setTimeout(() => { docH = document.documentElement.scrollHeight; wait = undefined; }, 500); };
    const sync = () => {
      remeasure();
      const hide = scrollY > 20 && (page === "article" || scrollY < docH - (innerHeight + 20));
      nav.toggleAttribute("data-hidden", hide);
      nav.inert = hide;
    };
    addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    sync();
  }

  // Browser header color (theme-color) — while the section color variable changes, its value is copied over as is (same curve as the original 350ms sine)
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const root = document.documentElement;
    const read = () => getComputedStyle(root).getPropertyValue("--fx-theme-accent").trim() || getComputedStyle(root).getPropertyValue("--kf-accent").trim();
    meta.content = read();
    let raf, until = 0;
    const follow = () => { meta.content = read(); raf = performance.now() < until ? requestAnimationFrame(follow) : undefined; };
    document.addEventListener("fx:theme", () => { until = performance.now() + 450; if (!raf) raf = requestAnimationFrame(follow); });
  }

  // Video — loads the source 400px before the screen, if data-autoplay plays muted, pauses when off-screen
  const videos = [...document.querySelectorAll("video[data-lazy]")];
  if (videos.length) {
    const load = (v) => {
      if (v.dataset.requested !== undefined) return;
      v.dataset.requested = "";
      v.addEventListener("loadeddata", () => (v.dataset.loaded = ""), { once: true });
      if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; }
      v.querySelectorAll("source[data-src]").forEach((s) => { s.src = s.dataset.src; delete s.dataset.src; });
      v.load();
    };
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      const v = e.target;
      if (!e.isIntersecting) { if (!v.paused) v.pause(); return; }
      load(v);
      if (v.dataset.autoplay !== undefined) { v.muted = true; v.play().catch(() => {}); }
    }), { rootMargin: "400px 0px" });
    videos.forEach((v) => io.observe(v));
  }

  // YouTube embed slot — in the original you click to play. Clicking plays a placeholder video with sound in the same spot
  document.querySelectorAll(".dt-yt").forEach((box) => {
    const play = () => {
      if (box.querySelector("video")) return;
      const v = document.createElement("video");
      v.src = box.dataset.src;
      v.controls = true;
      v.playsInline = true;
      box.append(v);
      v.play().catch(() => {});
      box.querySelector(".dt-yt__play")?.remove();
    };
    box.addEventListener("click", play);
  });

  // Subscribe field — doesn’t actually send, and like the original, the ”Subscribing…” dots spin then turn into a thank-you message
  document.querySelectorAll(".dt-subscribe__form").forEach((form) => {
    const input = form.querySelector(".dt-subscribe__input"), btn = form.querySelector(".dt-subscribe__button");
    const label = form.querySelector(".dt-subscribe__label-text"), ok = form.querySelector(".dt-subscribe__msg--ok");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      input.disabled = btn.disabled = true;
      label.textContent = "Subscribing";
      setTimeout(() => { input.hidden = btn.hidden = true; ok.hidden = false; }, 900);
    });
  });
})();
