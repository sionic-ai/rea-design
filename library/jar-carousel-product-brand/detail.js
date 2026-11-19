// Product detail: stands the bottle picked from home or list in the hero, and over .4 screen of scroll applies --ph 0→1 for bottle lift, rotation and shrink, a full label turn and the title drop.
// The photo strip is an endless looping drag (inertia on release) with opposite parallax for the photos inside the cells.
(() => {
  const AG = window.AG;
  const k = +(sessionStorage.getItem("ag-jar") ?? 2) || 0;
  const stage = document.querySelector("[data-stage]");
  const jar = stage.querySelector("[data-jar]");
  const title = stage.querySelector(".ph__title");
  const meta = stage.querySelector(".ph__meta");
  jar.innerHTML = AG.jarLiveHTML(AG.PRODUCTS[k]);
  const label = AG.jarLabel(jar, AG.PRODUCTS[k]);

  // The title rests at the top and drops to the height where the bottle has fully risen (tablet·phone stay in place)
  // If the title doesn’t fit between the head and the bottle (top face enlarged 1.25x), reduce the font size (original --ph-title-fit)
  const fit = () => {
    stage.style.removeProperty("--ph-title-fit");
    const safe = innerWidth <= 480 ? 150 : 166;
    const jarTop = jar.offsetTop - (jar.offsetHeight * 0.25) / 2;
    if (title.offsetHeight > jarTop - safe) stage.style.setProperty("--ph-title-fit", `${((jarTop - safe) / title.offsetHeight).toFixed(3)}`);
    if (innerWidth <= 1024) {
      stage.style.setProperty("--ph-title-rest-y", `${Math.max(safe + title.offsetHeight / 2, Math.min(stage.clientHeight * 0.42, jarTop - title.offsetHeight / 2))}px`);
      stage.style.setProperty("--ph-title-fall", "0px"); stage.style.setProperty("--ph-meta-shift", "0px"); return;
    }
    const h = stage.clientHeight, s = title.offsetHeight;
    const riseRaw = getComputedStyle(stage.closest(".ph")).getPropertyValue("--ph-jar-rise").trim();
    const rise = riseRaw.endsWith("vh") ? (parseFloat(riseRaw) * innerHeight) / 100 : parseFloat(riseRaw) || 0;
    const H = jar.offsetTop + jar.offsetHeight / 2 + rise;
    const G = Math.max(safe + s / 2, Math.min(h * 0.45, jarTop - s / 2));
    stage.style.setProperty("--ph-title-rest-y", `${G}px`);
    stage.style.setProperty("--ph-title-fall", `${H - G}px`);
    stage.style.setProperty("--ph-meta-shift", `${H + s / 2 + 24 - meta.offsetTop}px`);
  };
  fit();
  document.fonts?.ready.then(() => { fit(); ScrollTrigger.refresh(); });
  addEventListener("resize", fit);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    ScrollTrigger.create({
      trigger: stage, start: "top top", end: () => `+=${innerHeight * 0.4}`, scrub: true, invalidateOnRefresh: true,
      onUpdate: (st) => { stage.style.setProperty("--ph", st.progress.toFixed(4)); label.render(AG.JAR_FRONT - st.progress); },
    });
  });

  // Photo strip
  const box = document.querySelector(".photos");
  const track = box.querySelector("[data-photos]");
  const LABELS = [
    "Hand holding a product bottle · white tile kitchen · natural window light · landscape",
    "Product bottle and ingredients (dried tomato, almonds) on a red background · studio lighting · landscape 980:702",
    "Bottle on a beige floor with leaf shadows · afternoon sun · landscape",
    "Hand and sleeve opening a bottle · bright kitchen · close-up landscape",
    "Bread and an open jar on a table · top-down composition · landscape",
  ];
  track.innerHTML = LABELS.map((l) => `<figure class="photo"><div class="wf-img" data-label="${l}"></div></figure>`).join("");
  const slides = [...track.children];
  const n = slides.length;
  let x = 0, target = 0, drag = false, lastX = 0, v = 0, lastT = 0;
  const step = () => slides[0].offsetWidth + parseFloat(getComputedStyle(box).getPropertyValue("--gap"));
  track.addEventListener("pointerdown", (e) => { drag = true; lastX = e.clientX; lastT = e.timeStamp; v = 0; box.classList.add("is-dragging"); track.setPointerCapture(e.pointerId); });
  track.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - lastX, dt = Math.max(1, e.timeStamp - lastT);
    v = v * 0.7 + (dx / dt) * 0.3; lastX = e.clientX; lastT = e.timeStamp;
    target += dx;
  });
  const end = () => {
    if (!drag) return;
    drag = false; box.classList.remove("is-dragging");
    const s = step();
    target = Math.round((target + v * 280) / s) * s;
  };
  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);
  gsap.ticker.add(() => {
    x += (target - x) * (drag ? 0.35 : 0.1);
    const s = step(), W = box.clientWidth, w = slides[0].offsetWidth, L = n * s;
    slides.forEach((el, i) => {
      let p = ((i * s + x) % L + L) % L;
      if (p > L - s * 1.5) p -= L;
      const left = (W - w) / 2 + p - s;
      el.style.transform = `translate3d(${left}px, 0, 0)`;
      const off = (left + w / 2 - W / 2) / W;
      el.firstElementChild.style.transform = `translate3d(calc(-50% + ${(-off * 16).toFixed(2)}%), 0, 0)`;
    });
  });

  ScrollTrigger.refresh();
})();
