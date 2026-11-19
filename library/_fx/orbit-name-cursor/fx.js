// The system cursor stays, a 120px ring trails it late with .5s power3. Over a ”View” target, an accent-colored circle inside the ring grows from 0 to 1x
// Shows a short word (Open·View), and if the target has a name, text repeating that name as NAME • runs around the circle once every 9 seconds
(() => {
  let uid = 0;
  kfFx.register("orbit-name-cursor", (root, { options, hover, reduce }) => {
    if (!hover || !window.gsap) return;
    const targets = options.targets || '[data-fx-part="view"]';
    const ring = document.createElement("div");
    const id = `fx-orbit-${++uid}`;
    ring.className = "fx-orbit-name-cursor";
    ring.setAttribute("aria-hidden", "true");
    ring.innerHTML = `<span class="fx-orbit-name-cursor__ring"><span class="fx-orbit-name-cursor__bubble"><span class="fx-orbit-name-cursor__label"></span></span><svg class="fx-orbit-name-cursor__orbit" viewBox="0 0 120 120"><defs><path id="${id}" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#${id}"></textPath></text></svg></span>`;
    document.body.append(ring);
    document.documentElement.classList.add("fx-orbit-cursor");
    const r = ring.firstElementChild, label = ring.querySelector(".fx-orbit-name-cursor__label"), path = ring.querySelector("textPath");
    const dur = +(options.dur ?? 0.5);
    const qx = gsap.quickTo(r, "x", { duration: dur, ease: "power3" }), qy = gsap.quickTo(r, "y", { duration: dur, ease: "power3" });
    const ac = new AbortController(), on = { signal: ac.signal, passive: true };
    const repeat = (name) => { const t = `${name.toUpperCase()} • `; return t.repeat(Math.max(1, Math.floor(+(options.fill || 34) / t.length))); };
    let lastName = "";
    addEventListener("pointermove", (e) => { qx(e.clientX); qy(e.clientY); }, on);
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest?.(targets);
      const inside = t && root.contains(t);
      ring.classList.toggle("is-view", !!inside);
      if (inside) label.textContent = t.dataset.cursorLabel ?? options.label ?? "View";
      const name = inside ? t.dataset.cursorName : "";
      ring.classList.toggle("has-name", !!name);
      if (name && name !== lastName) { path.textContent = repeat(name); lastName = name; }
    }, on);
    document.addEventListener("pointerleave", () => gsap.to(ring, { opacity: 0, duration: 0.3 }), on);
    document.addEventListener("pointerenter", () => gsap.to(ring, { opacity: 1, duration: 0.3 }), on);
    if (reduce) ring.classList.add("is-still");
    return () => { ac.abort(); gsap.killTweensOf([r, ring]); ring.remove(); document.documentElement.classList.remove("fx-orbit-cursor"); };
  });
})();
