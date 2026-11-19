// Home — draws the work screen placeholder images hung on the spiral in skin colors (real ones use website captures), and connects the collage side flow and the spiral-end ”View all”.
(() => {
  const css = getComputedStyle(document.documentElement), v = (n) => css.getPropertyValue(n).trim();
  const C = { bg: v("--kf-bg"), sf: v("--kf-surface"), rs: v("--kf-raised"), ink: v("--kf-ink"), dim: v("--kf-dim"), ac: v("--kf-accent"), soft: v("--kf-accent-soft") };
  const shot = (i) => {
    const c = document.createElement("canvas"); c.width = 800; c.height = 500;
    const g = c.getContext("2d"), pick = [C.ac, C.soft, C.dim, C.rs][i % 4];
    const bg = g.createLinearGradient(0, 0, 800, 500); bg.addColorStop(0, i % 2 ? C.sf : C.rs); bg.addColorStop(1, C.bg);
    g.fillStyle = bg; g.fillRect(0, 0, 800, 500);
    g.fillStyle = C.ink; g.globalAlpha = 0.85; g.fillRect(40, 30, 90, 14); g.globalAlpha = 0.4; for (let k = 0; k < 4; k++) g.fillRect(480 + k * 70, 32, 48, 10);
    g.globalAlpha = 1; g.fillStyle = pick; g.fillRect(i % 3 === 0 ? 420 : 40, 110, 340, 300);
    g.fillStyle = C.ink; g.fillRect(i % 3 === 0 ? 40 : 420, 150, 300, 40); g.fillRect(i % 3 === 0 ? 40 : 420, 200, 220, 40);
    g.globalAlpha = 0.5; g.fillRect(i % 3 === 0 ? 40 : 420, 270, 260, 10); g.fillRect(i % 3 === 0 ? 40 : 420, 290, 200, 10);
    return c.toDataURL();
  };
  document.querySelectorAll(".v-works img[data-cover]").forEach((img) => (img.src = shot(+img.dataset.cover)));

  const works = document.querySelector(".v-works");
  works?.addEventListener("fx:progress", (e) => works.classList.toggle("is-end", e.detail.value > 0.8421));
  works?.addEventListener("fx:pick", () => window.location.assign("detail.html"));

  // Hero entrance — original hero timeline (after .1s, power3.out): badge 16px .6s → .55s intro and buttons 20px .8s (.1 gap) → .75s laptop 72px at .985 scale over 1.4s expo.out (appears at .5s) → 1.95s light 1.6s
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ delay: 0.1, defaults: { ease: "power3.out" } })
      .from('[data-hero="badge"]', { opacity: 0, y: 16, duration: 0.6 })
      .from('[data-hero="sub"]', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1 }, 0.55)
      .fromTo('[data-hero="editor"]', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.75)
      .fromTo('[data-hero="editor"]', { y: 72, scale: 0.985, transformOrigin: "50% 100%" }, { y: 0, scale: 1, duration: 1.4, ease: "expo.out" }, 0.75)
      .from('[data-hero="glow"]', { opacity: 0, duration: 1.6, ease: "power2.out" }, 1.95);
  });

  // Head badge light — when the cursor comes within 260px of the badge, blue light spreads from the cursor side. Closeness is smoothstep, light radius 72+.9×distance (72~340px),
  // On, position and radius all follow 0.14 of the remaining distance each frame (original value — about 0.7s to turn off at 60fps)
  const badge = document.querySelector('[data-hero="badge"]');
  if (badge && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    badge.classList.add("v-glowbadge");
    badge.insertAdjacentHTML("afterbegin", '<span class="gb-halo" aria-hidden="true"><i></i></span><span class="gb-base" aria-hidden="true"></span><span class="gb-fill" aria-hidden="true"></span><span class="gb-ring" aria-hidden="true"></span>');
    let ptr = null, seen = true, raf = 0, g = 0, mx = badge.offsetWidth / 2, my = badge.offsetHeight / 2, r = 72;
    const set = (n, v) => badge.style.setProperty(n, v);
    const tick = () => {
      const b = badge.getBoundingClientRect();
      let want = 0, wx = mx, wy = my, wr = r;
      if (ptr && seen) {
        const d = Math.hypot(Math.max(b.left - ptr.x, 0, ptr.x - b.right), Math.max(b.top - ptr.y, 0, ptr.y - b.bottom)), k = Math.max(0, 1 - d / 260);
        want = k * k * (3 - 2 * k); wx = ptr.x - b.left; wy = ptr.y - b.top; wr = Math.min(Math.max(72 + 0.9 * d, 72), 340);
      }
      g += (want - g) * 0.14; mx += (wx - mx) * 0.14; my += (wy - my) * 0.14; r += (wr - r) * 0.14;
      set("--glow", g.toFixed(4)); set("--mx", `${mx.toFixed(1)}px`); set("--my", `${my.toFixed(1)}px`); set("--r", `${r.toFixed(1)}px`);
      if (want === 0 && g < 0.002) { set("--glow", "0"); raf = 0; return; }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener("pointermove", (e) => { ptr = { x: e.clientX, y: e.clientY }; kick(); }, { passive: true });
    document.addEventListener("pointerleave", () => { ptr = null; kick(); });
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (!seen) { ptr = null; kick(); } }).observe(badge);
  }

  // Fifth panel — the row of screen pieces follows the cursor’s horizontal position and one label follows its vertical position with .9s power3.out.
  // The original is 100px wide and 50px tall from screen edge to edge (at a 671px window width) — scaled by the copy’s window width ratio
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
    const scr = document.querySelector(".v-pixel__scr");
    if (!scr) return;
    const px = gsap.quickTo(".v-pixel__pan", "x", { duration: 0.9, ease: "power3.out" }), py = gsap.quickTo(".v-pixel [data-follow-y]", "y", { duration: 0.9, ease: "power3.out" });
    const move = (e) => { const s = scr.offsetWidth / 671; px((e.clientX / innerWidth - 0.5) * 100 * s); py((e.clientY / innerHeight - 0.5) * 50 * s); };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  });

  // Collage — moves left to right by half the overflow width, scrub .6
  const row = document.querySelector("[data-collage]");
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const a = () => row.scrollWidth - row.parentElement.clientWidth;
    gsap.fromTo(row, { x: () => -a() / 2 }, { x: () => a() / 2, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
  });
})();
