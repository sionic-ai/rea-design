// Home page — Hero clock (to the millisecond every frame), mouse parallax and press bounce of the image, Contact form expanding, video that plays only when visible.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n, w) => String(n).padStart(w, "0");

  const zone = document.querySelector("[data-zone]");
  const clock = document.querySelector("[data-clock]");
  if (zone) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/City";
    const off = -new Date().getTimezoneOffset();
    const h = Math.floor(Math.abs(off) / 60), m = Math.abs(off) % 60;
    zone.textContent = `${tz.replace(/_/g, " ")}　GMT${off >= 0 ? "+" : "-"}${h}${m ? `:${pad(m, 2)}` : ""}`;
  }
  if (clock) {
    clock.innerHTML = "00:00:00.000".split("").map((c) => (c === ":" ? '<span class="s">:</span>' : c === "." ? '<span class="p">.</span>' : '<span class="d"></span>')).join("");
    const digits = [...clock.querySelectorAll(".d")];
    const tick = () => {
      const d = new Date();
      const s = pad(d.getHours(), 2) + pad(d.getMinutes(), 2) + pad(d.getSeconds(), 2) + pad(d.getMilliseconds(), 3);
      digits.forEach((el, i) => { if (el.textContent !== s[i]) el.textContent = s[i]; });
    };
    tick();
    if (reduce) setInterval(tick, 1000);
    else {
      let seen = true, raf = 0;
      const loop = () => {
        raf = 0;
        if (!seen || document.hidden) return;
        tick();
        raf = requestAnimationFrame(loop);
      };
      const wake = () => { if (!raf) raf = requestAnimationFrame(loop); };
      new IntersectionObserver(([e]) => { seen = e?.isIntersecting ?? false; wake(); }).observe(clock);
      document.addEventListener("visibilitychange", wake);
    }
  }

  // Picture: pass the mouse position over the line (−1 ~ 1) as --pointer-x·y and the shapes follow by depth (1~3rem) in .9s. Press for an .8s bounce (.9 → 1.06 → 1)
  if (!reduce) {
    const clamp = (v) => Math.min(1, Math.max(-1, v));
    document.querySelectorAll(".nw-ill[data-tilt]").forEach((ill) => {
      const host = ill.closest("li") || ill;
      host.addEventListener("pointermove", (e) => {
        const r = ill.getBoundingClientRect();
        ill.style.setProperty("--pointer-x", clamp(((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        ill.style.setProperty("--pointer-y", clamp(((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
      });
      host.addEventListener("pointerleave", () => {
        ill.style.setProperty("--pointer-x", "0");
        ill.style.setProperty("--pointer-y", "0");
      });
      ill.addEventListener("pointerdown", () => {
        ill.animate([
          { scale: "1", easing: "ease-out" },
          { scale: "0.9", offset: 0.18, easing: "ease-in-out" },
          { scale: "1.06", offset: 0.5, easing: "ease-in-out" },
          { scale: "1" },
        ], { duration: 800 });
      });
    });
  }

  // Contact form: on consent, the fields expand over .9s (css grid-template-rows)
  const agree = document.querySelector('.nw-form input[name="agree"]');
  const panel = document.getElementById("nw-panel");
  agree?.addEventListener("change", () => {
    panel?.classList.toggle("is-open", agree.checked);
    if (panel) panel.inert = !agree.checked;
  });

  // Self-produced video: plays only when visible
  if (!reduce) {
    document.querySelectorAll("[data-ambient] video").forEach((v) => {
      new IntersectionObserver(([e]) => {
        if (e?.isIntersecting) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      }).observe(v);
    });
  }
})();
