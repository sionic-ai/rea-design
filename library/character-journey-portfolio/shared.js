// Site-wide shell — smooth scroll (lenis 1.1.20, lerp .085 · wheel .9), floating dust, phone notice window, email copy.
// Section navigation and the ruler need to know the first page’s master timeline, so they live in index.js.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const site = (window.nnSite = { reduce, lenis: null });

  if (!reduce && window.Lenis && window.gsap) {
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    site.lenis = window.__lenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Dust: up to 90 particles by screen width, floating up and flickering, pushed toward the scroll direction by scroll speed (×.08, ±6px)
  const dust = document.getElementById("dust");
  if (dust && !reduce && window.gsap) {
    const stage = dust.parentElement, ctx = dust.getContext("2d");
    const rgb = (name) => {
      const probe = document.createElement("i");
      probe.style.color = `var(${name})`;
      document.body.appendChild(probe);
      const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0];
      probe.remove();
      return m.slice(0, 3).join(",");
    };
    const tones = [rgb("--kf-ink"), rgb("--kf-ink-soft")];
    let W = 0, H = 0, specks = [];
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = stage.clientWidth; H = stage.clientHeight;
      dust.width = W * dpr; dust.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (W * H) / 16000));
      specks = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: 0.5 + Math.random() * 1.5, vy: 0.08 + Math.random() * 0.25,
        sway: Math.random() * Math.PI * 2, tw: Math.random() * Math.PI * 2, c: Math.random() < 0.7 ? tones[0] : tones[1],
      }));
    };
    size();
    addEventListener("resize", size);
    gsap.ticker.add(() => {
      const push = gsap.utils.clamp(-6, 6, (site.lenis ? site.lenis.velocity : 0) * 0.08);
      ctx.clearRect(0, 0, W, H);
      for (const p of specks) {
        p.sway += 0.012; p.tw += 0.03;
        p.y -= p.vy + push; p.x += Math.sin(p.sway) * 0.18;
        if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
        if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; }
        const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(p.tw));
        ctx.fillStyle = `rgba(${p.c},${a.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    });
  }

  // Phone notice window: once after 1.2 seconds on a narrow window (or a touch screen whose short side is phone size)
  const notice = document.getElementById("notice");
  if (notice) {
    const seen = () => { try { return sessionStorage.getItem("nn-notice") === "1"; } catch (_) { return false; } };
    const hide = () => { notice.classList.remove("is-show"); setTimeout(() => { notice.hidden = true; }, 600); try { sessionStorage.setItem("nn-notice", "1"); } catch (_) {} };
    const phone = matchMedia("(max-width: 720px)").matches || (matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 600);
    if (phone && !seen()) setTimeout(() => { notice.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => notice.classList.add("is-show"))); }, 1200);
    document.getElementById("noticeOk")?.addEventListener("click", hide);
    document.getElementById("noticeCopy")?.addEventListener("click", async (e) => {
      const b = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href.split("#")[0]); b.textContent = "Copied"; setTimeout(hide, 1100); } catch (_) {}
    });
  }

  // Mail copy: the icon turns into a check and a Copied tag shows for 1.8 seconds
  const copy = document.getElementById("copyMail");
  let timer = 0;
  copy?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(copy.dataset.copy); } catch (_) { return; }
    copy.classList.add("is-done");
    clearTimeout(timer);
    timer = setTimeout(() => copy.classList.remove("is-done"), 1800);
  });
})();
