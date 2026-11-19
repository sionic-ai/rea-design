(() => {
  // Original Brand hero: while passing the pinned stage (section height minus 70% of screen height), the central vertical window grows to fill the screen — progress is cubic in-out.
  // Progress is a single --progress, size, position, inner zoom and text blur are computed by css from that value. Clicking the window changes the channel with a static flicker.
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  // Static noise texture — if the consumer did not provide --fx-grain, makes a 128px gray noise once and attaches it to html
  const grainOnce = () => {
    const root = document.documentElement;
    if (getComputedStyle(root).getPropertyValue("--fx-grain").trim()) return;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    if (!g) return;
    const img = g.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 40 + Math.random() * 50;
    }
    g.putImageData(img, 0, 0);
    root.style.setProperty("--fx-grain", `url(${c.toDataURL("image/png")})`);
  };

  kfFx.register("portrait-window-grow", (el, { options, reduce }) => {
    const win = el.querySelector('[data-fx-part="window"]');
    if (!win) return;
    grainOnce();
    const meta = el.querySelector('[data-fx-part="meta"]');
    const num = el.querySelector('[data-fx-part="channel-num"]');
    const badge = el.querySelector('[data-fx-part="channel"]');
    const video = win.querySelector("video");
    const span = +(options.span || 0.7);
    const low = +(options.low || 620);
    const count = Math.max(1, +(options.channels || 4));
    const sources = (video?.dataset.channels || "").split(",").map((s) => s.trim()).filter(Boolean);
    const ac = new AbortController();
    const on = { signal: ac.signal, passive: true };

    const measure = () => {
      if (reduce || innerHeight < low) {
        el.style.setProperty("--progress", "0");
        meta?.classList.remove("is-over");
        return;
      }
      const r = el.getBoundingClientRect();
      const travel = el.offsetHeight - innerHeight;
      const t = clamp((travel > 0 ? clamp(-r.top / travel, 0, 1) : 0) / span, 0, 1);
      const p = inOut(t);
      el.style.setProperty("--progress", p.toFixed(4));
      meta?.classList.toggle("is-over", p > 0.5);
    };
    let queued = false;
    addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        measure();
        queued = false;
      });
    }, on);
    addEventListener("resize", measure, on);
    measure();

    let n = 1, tuneAt = 0, badgeTimer = 0, switchTimer = 0;
    const flick = (node) => {
      node.classList.remove("is-on");
      void node.getBoundingClientRect();
      node.classList.add("is-on");
    };
    const settle = () => {
      if (!win.classList.contains("is-tuning")) return;
      clearTimeout(switchTimer);
      switchTimer = setTimeout(() => {
        win.classList.remove("is-tuning");
        win.classList.add("is-switching");
      }, Math.max(0, 300 - (performance.now() - tuneAt)));
    };
    const change = () => {
      n = (n % count) + 1;
      win.classList.remove("is-switching");
      win.classList.add("is-tuning");
      tuneAt = performance.now();
      const ch = String(n).padStart(2, "0");
      if (num) num.textContent = ch;
      if (badge) {
        flick(badge);
        clearTimeout(badgeTimer);
        badgeTimer = setTimeout(() => badge.classList.remove("is-on"), 1600);
      }
      el.dispatchEvent(new CustomEvent("fx:channel", { bubbles: true, detail: { channel: n } }));
      if (video && sources.length) {
        video.src = sources[(n - 1) % sources.length];
        video.play?.().catch(() => {});
      } else settle();
    };
    video?.addEventListener("canplay", settle, { signal: ac.signal });
    // When a video ends it moves to the next channel without static (original: ended → next video, only the number changes)
    video?.addEventListener("ended", () => {
      if (!sources.length) return;
      n = (n % count) + 1;
      if (num) num.textContent = String(n).padStart(2, "0");
      video.src = sources[(n - 1) % sources.length];
      video.play?.().catch(() => {});
    }, { signal: ac.signal });
    win.addEventListener("click", change, { signal: ac.signal });
    win.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        change();
      }
    }, { signal: ac.signal });

    if (video) {
      if (reduce) {
        video.removeAttribute("autoplay");
        video.pause();
      } else {
        const io = new IntersectionObserver(([e]) => (e?.isIntersecting ? video.play().catch(() => {}) : video.pause()));
        io.observe(el);
        ac.signal.addEventListener("abort", () => io.disconnect());
      }
    }

    return () => {
      ac.abort();
      clearTimeout(badgeTimer);
      clearTimeout(switchTimer);
      el.style.removeProperty("--progress");
      meta?.classList.remove("is-over");
      win.classList.remove("is-tuning", "is-switching");
      badge?.classList.remove("is-on");
    };
  });
})();
