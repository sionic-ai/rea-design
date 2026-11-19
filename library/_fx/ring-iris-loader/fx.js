// Progress ring loader — the ring fills and the number counts 0 to 100, then when full the ring·number shrink to .92x in .32s and only the status text pulses at center over 1.6s.
// When the consumer sends fx:finish (or after hold seconds) the blob switches off in .12s, and the center hole opens, edge and all, spreading from 84px to the screen diagonal in .85s power3.inOut.
// Progress is received via fx:progress (detail 0~1) — apps that bake shaders fill it by asset count, those with nothing to bake fill themselves over auto seconds
(() => {
  const SIZE = 168, R = 66, C = 2 * Math.PI * R;
  const NS = "http://www.w3.org/2000/svg";

  kfFx.register("ring-iris-loader", (el, { options, reduce }) => {
    const num = (k, d) => (options[k] == null || options[k] === "" ? d : +options[k]);
    const auto = num("auto", 0), dur = num("dur", 0.85), start = num("from", 84), fade = num("fade", 0.12);
    const hold = options.hold === "wait" ? -1 : num("hold", 0.8);
    const ease = kfFx.ease(options.ease || "0.645,0.045,0.355,1", "power3.inOut");
    const made = [];
    const emit = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));

    let stack = el.querySelector('[data-fx-part="stack"]');
    if (!stack) { stack = document.createElement("div"); stack.setAttribute("data-fx-part", "stack"); el.prepend(stack); made.push(stack); }
    let stage = el.querySelector('[data-fx-part="stage"]');
    if (!stage) { stage = document.createElement("div"); stage.setAttribute("data-fx-part", "stage"); stack.prepend(stage); made.push(stage); }
    let ring = stage.querySelector("svg");
    if (!ring) {
      ring = document.createElementNS(NS, "svg");
      ring.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
      ring.setAttribute("aria-hidden", "true");
      for (const cls of ["fx-ril-bg", "fx-ril-fill"]) {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("class", cls);
        c.setAttribute("cx", SIZE / 2); c.setAttribute("cy", SIZE / 2); c.setAttribute("r", R);
        ring.append(c);
      }
      ring.classList.add("fx-ril-ring");
      stage.prepend(ring);
      made.push(ring);
    }
    const fill = ring.querySelector(".fx-ril-fill");
    let count = el.querySelector('[data-fx-part="num"]');
    if (!count) { count = document.createElement("p"); count.setAttribute("data-fx-part", "num"); count.setAttribute("aria-hidden", "true"); count.textContent = "0"; stage.append(count); made.push(count); }
    let status = el.querySelector('[data-fx-part="status"]');
    if (!status) { status = document.createElement("p"); status.setAttribute("data-fx-part", "status"); status.setAttribute("aria-hidden", "true"); stack.append(status); made.push(status); }
    // The status text the caller placed right below the bar is moved inside the block — when full it must rise to the ring position (center)
    const home = status.parentElement !== stack && !made.includes(status) ? status.parentElement : null;
    if (home) stack.append(status);
    if (options.status) status.textContent = options.status;
    if (!el.hasAttribute("role")) el.setAttribute("role", "status");
    el.setAttribute("aria-busy", "true");

    let progress = 0, done = false, revealing = false, tl = null, autoTimer = 0, holdTimer = 0;
    const setStatus = () => el.classList.toggle("is-fx-status", !!status.textContent.trim());
    const setProgress = (p) => {
      if (revealing) return;
      progress = Math.max(progress, Math.min(1, Math.max(0, +p || 0)));
      if (fill) fill.style.strokeDashoffset = String(C * (1 - progress));
      count.textContent = String(Math.round(progress * 100));
      el.setAttribute("aria-label", `${Math.round(progress * 100)}%`);
      if (progress >= 1 && !done) {
        done = true;
        el.classList.add("is-fx-done");
        setStatus();
        if (hold >= 0) holdTimer = setTimeout(reveal, hold * 1000);
      }
    };
    const radius = () => Math.hypot(innerWidth, innerHeight) / 2 + 84;
    function reveal() {
      if (revealing) return;
      revealing = true;
      clearTimeout(holdTimer); clearInterval(autoTimer);
      el.setAttribute("aria-busy", "false");
      emit("fx:open");
      if (reduce || !window.gsap) { el.hidden = true; emit("fx:done"); return; }
      const r = { v: start };
      tl = gsap.timeline({ onComplete: () => { el.hidden = true; emit("fx:done"); } })
        .to(stack, { opacity: 0, duration: fade, ease: "power1.out" }, 0)
        .add(() => { el.classList.add("is-fx-revealing"); el.style.setProperty("--fx-reveal", `${start}px`); }, 0.04)
        .to(r, { v: radius(), duration: dur, ease, onUpdate: () => el.style.setProperty("--fx-reveal", `${r.v}px`) }, 0.05);
    }
    const onProgress = (e) => setProgress(e.detail);
    const onFinish = () => { if (!done) setProgress(1); if (holdTimer) clearTimeout(holdTimer); reveal(); };
    const onStatus = (e) => { status.textContent = String(e.detail ?? ""); setStatus(); };
    el.addEventListener("fx:progress", onProgress);
    el.addEventListener("fx:finish", onFinish);
    el.addEventListener("fx:status", onStatus);
    setStatus();
    setProgress(0);

    if (reduce) { setProgress(1); }
    else if (auto > 0) {
      // Fill unevenly like an app downloading assets — every 180ms fill a share of the remainder and reach 100 in auto seconds
      const t0 = performance.now();
      autoTimer = setInterval(() => {
        const t = (performance.now() - t0) / 1000 / auto;
        setProgress(t >= 1 ? 1 : Math.min(0.99, t * (0.85 + 0.3 * Math.random())));
        if (t >= 1) clearInterval(autoTimer);
      }, 180);
    }

    return () => {
      clearInterval(autoTimer); clearTimeout(holdTimer); tl?.kill();
      el.removeEventListener("fx:progress", onProgress);
      el.removeEventListener("fx:finish", onFinish);
      el.removeEventListener("fx:status", onStatus);
      el.classList.remove("is-fx-done", "is-fx-status", "is-fx-revealing");
      el.style.removeProperty("--fx-reveal");
      if (window.gsap) gsap.set(stack, { clearProps: "opacity" });
      if (home) home.append(status);
      made.forEach((n) => n.remove());
    };
  });
})();
