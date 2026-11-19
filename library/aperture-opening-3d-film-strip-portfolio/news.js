/* Journal: wheel and drag accumulate into a 0~1 unfold that rolls the cover open (rolling back closes it). While rolling, chromatic aberration spreads over the giant word and cover (original jrKromatik 5.9px · speed 12).
   Once fully unfolded, the contents appear and move on to the text */
(() => {
  const layer = document.querySelector(".hc-print-layer");
  if (!layer || !window.THREE) { hc.loader(); return; }
  const ink = hc.color("--kf-contrast-ink");
  function cover(el) {
    if (el.dataset.cover == null) return null;
    const c = hc.portrait(1, 900, 1200, "");
    const g = c.getContext("2d"), W = c.width, H = c.height, f = hc.css("--kf-font-display") || "sans-serif";
    g.fillStyle = ink;
    g.font = `600 22px ${f}`;
    g.fillText("STUDIO NAME", 48, 62);
    g.textAlign = "right"; g.fillText("ISSUE 00", W - 48, 62); g.textAlign = "left";
    g.font = `800 190px ${f}`;
    g.fillText("SECTION", 40, 230, W - 80);
    g.font = `600 18px ${f}`;
    g.fillText("Your cover line here · 0000", 48, 270);
    g.font = `600 64px ${f}`;
    g.fillText("A big title,", 48, H - 190);
    g.fillText("two lines", 48, H - 120);
    g.font = `600 22px ${f}`;
    ["Item title 01", "Item title 02", "Item title 03", "Item title 04", "Item title 05"].forEach((t, i) => { g.textAlign = "right"; g.fillText(t, W - 48, H - 330 + i * 40); });
    g.textAlign = "left";
    return c;
  }
  const pr = hcPrint.create(layer, { canvas: cover });
  const mag = pr.items[0];
  hc.loader();

  const word = document.querySelector(".jr-word"), toc = document.querySelector(".jr-toc"), hint = document.querySelector(".jr-hint");
  const st = { p: 0, target: 0, v: 0 };
  /* While rolling through the first 1.5 screens the cover turns away completely — plain document scroll (touch behaves the same) */
  const onScroll = () => { st.target = Math.min(1, Math.max(0, scrollY / (innerHeight * 1.5))); };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (hc.reduce) {
    gsap.ticker.add(() => { st.p = st.target; mag.u.uCurl.value = st.p * 1.08 > 1 ? 1 : st.p; toc.style.opacity = st.p > 0.5 ? 1 : 0; });
    return;
  }
  gsap.ticker.add((t, dt) => {
    const k = 1 - Math.exp(-(dt / 1000) / 0.28);
    const prev = st.p;
    st.p += (st.target - st.p) * k;
    const vel = (st.p - prev) / Math.max(dt / 1000, 0.001);
    st.v += (vel - st.v) * Math.min(1, (dt / 1000) * 12);
    mag.u.uCurl.value = Math.min(1, st.p * 1.08);
    const ch = Math.min(5.9, Math.abs(st.v) * 5.9);
    mag.u.uChroma.value = ch;
    word.style.textShadow = ch > 0.05 ? `${ch}px 0 0 rgb(255 40 40 / .7), ${-ch}px 0 0 rgb(40 160 255 / .7)` : "none"; /* Not skin: red and blue light fringes of the chromatic aberration effect */
    toc.style.opacity = String(gsap.utils.clamp(0, 1, (st.p - 0.45) / 0.4));
    toc.style.pointerEvents = st.p > 0.8 ? "auto" : "none";
    hint.style.opacity = String(1 - Math.min(1, st.p * 3));
  });
})();
