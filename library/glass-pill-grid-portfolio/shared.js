// Spans several pages: dock pill loader (fill → empty → shape → drop → unfold → survive), loop curtain for moving to the case page
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Original phase lengths (ms): clear 720 · shape 860 · drop 940 · spread 640
  const BOOT = { clear: 720, shape: 860, drop: 940, expand: 640 };

  function boot(onDrop) {
    const dock = document.querySelector("[data-dock]");
    const shell = document.querySelector("[data-shell]");
    if (!dock) { onDrop?.("drop"); onDrop?.("live"); return; }
    const set = (phase) => {
      dock.className = dock.className.replace(/\bis-(wait|load|clear|shape|drop|expand|live)\b/g, "").trim() + ` is-${phase}`;
      shell?.setAttribute("data-boot", phase);
    };
    // The original skips the loader only within a page that was opened once (memory flag) — the loader runs on each fresh open
    if (reduce) { set("live"); onDrop?.("drop"); onDrop?.("live"); return; }
    // The original shows the pill · logo only after all scripts load (load) and the app attaches — black screen until then
    if (document.readyState !== "complete") { set("wait"); addEventListener("load", () => requestAnimationFrame(() => boot(onDrop)), { once: true }); return; }
    set("load");
    // Bar: rises each time it counts something to receive (fonts · load), and fills completely once everything is received
    const p = { v: 0 };
    const paint = () => dock.style.setProperty("--boot-p", p.v.toFixed(4));
    const jobs = [document.fonts.ready, new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true }))), new Promise((r) => setTimeout(r, 400))];
    let done = 0;
    // The original bar fills at about 1.4s while receiving the Hero videos after the pill appears — a placeholder has nothing to receive, so the final bar is stretched to that tempo
    const t0 = performance.now(), FILL = 1.4;
    const advance = (to, cb) => gsap.to(p, { v: to, duration: to < 1 ? 0.45 : Math.max(0.45, FILL - (performance.now() - t0) / 1000), ease: to < 1 ? "power1.out" : "power1.inOut", overwrite: true, onUpdate: paint, onComplete: cb });
    jobs.forEach((j) => j.then(() => {
      done++;
      if (done < jobs.length) return advance(done / jobs.length);
      advance(1, () => {
        set("clear");
        setTimeout(() => {
          set("shape");
          setTimeout(() => {
            set("drop");
            onDrop?.("drop");
            setTimeout(() => { set("expand"); setTimeout(() => { set("live"); onDrop?.("live"); }, BOOT.expand); }, BOOT.drop);
          }, BOOT.shape);
        }, BOOT.clear);
      });
    }));
  }

  // Transition into a work: a black curtain covers, a white arc spins, then it moves on (original pl-shell)
  function veilTo(href) {
    let v = document.querySelector(".al-veil");
    if (!v) {
      v = document.createElement("div");
      v.className = "al-veil";
      v.innerHTML = '<div class="al-ring"><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="al-ring__track" cx="20" cy="20" r="18"/><circle class="al-ring__arc" cx="20" cy="20" r="18" stroke-dasharray="113.1" stroke-dashoffset="80"/></svg><span class="al-ring__pct">0%</span></div>';
      document.body.appendChild(v);
    }
    v.classList.add("is-on");
    if (reduce) { location.href = href; return; }
    gsap.to(v, { opacity: 1, duration: 0.45, ease: "power2.inOut", onComplete: () => (location.href = href) });
  }

  window.alBoot = boot;
  window.alVeilTo = veilTo;
})();
