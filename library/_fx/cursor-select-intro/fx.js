// Like a design tool screen — a cursor with a name tag enters, drags a selection box around the big title, attaches a ”width × height” size label, then lingers over the title.
// Moves in coordinates inside the panel (the attached element) so the cursor stays on the title even when the panel grows as a whole (dive) or moves.
(() => {
  kfFx.register("cursor-select-intro", (el, { options, reduce }) => {
    const target = el.querySelector('[data-fx-part="target"]');
    if (!target) return;
    const delay = +(options.delay ?? 1.3), label = options.label || "Name";
    const made = [];
    const node = (tag, cls, parent, html) => {
      const n = document.createElement(tag);
      n.className = cls;
      n.setAttribute("aria-hidden", "true");
      if (html) n.innerHTML = html;
      parent.appendChild(n);
      made.push(n);
      return n;
    };
    const kept = { el: el.style.position, target: target.style.position };
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    if (getComputedStyle(target).position === "static") target.style.position = "relative";
    const box = node("div", "fx-csi__box", target, "<span></span><span></span><span></span><span></span>");
    const dim = node("em", "fx-csi__dim", target);
    const cursor = node("div", "fx-csi__cursor", el, '<svg viewBox="0 0 22 24"><path d="M2 2 L2 20 L7 15.5 L10.5 22.5 L13.5 21 L10 14 L17 14 Z"/></svg><b></b>');
    const tag = cursor.querySelector("b");
    tag.textContent = label;
    const measure = () => { dim.textContent = `${Math.round(target.offsetWidth)} × ${Math.round(target.offsetHeight)}`; };
    measure();

    const off = () => {
      gsap.killTweensOf([cursor, box, dim]);
      made.forEach((n) => n.remove());
      el.style.position = kept.el;
      target.style.position = kept.target;
    };
    if (reduce) {
      box.classList.add("is-done");
      gsap.set(box, { opacity: 1 });
      cursor.style.display = "none";
      return off;
    }

    // Even when the plate is enlarged (mid-dive), uses in-plate coordinates: the screen size difference divided by the plate scale
    const scale = () => { const r = el.getBoundingClientRect(); return el.offsetWidth ? r.width / el.offsetWidth || 1 : 1; };
    const at = (n) => { const a = el.getBoundingClientRect(), b = n.getBoundingClientRect(), s = scale(); return { x: (b.left - a.left) / s, y: (b.top - a.top) / s, w: b.width / s, h: b.height / s }; };
    const B = () => at(target);
    let idle = null, held = false;
    const wander = () => {
      idle = gsap.to(cursor, {
        x: () => B().x + target.offsetWidth * gsap.utils.random(0.6, 0.97),
        y: () => B().y + target.offsetHeight * gsap.utils.random(0.2, 0.9),
        duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true,
      });
    };
    gsap.set(cursor, { x: () => B().x + target.offsetWidth + 120, y: () => B().y + target.offsetHeight + 160, opacity: 0 });
    const tl = gsap.timeline({ delay })
      .to(cursor, { opacity: 1, x: () => B().x - 18, y: () => B().y - 3, duration: 0.8, ease: "power3.inOut" }, 0)
      .add(measure, 0.75)
      .to(cursor, { x: () => B().x + target.offsetWidth + 18, y: () => B().y + target.offsetHeight + 14, duration: 0.9, ease: "power2.inOut" }, 0.8)
      .set(box, { opacity: 1 }, 0.8)
      .to(box, { width: () => target.offsetWidth + 36, height: () => target.offsetHeight + 17, duration: 0.9, ease: "power2.inOut", onComplete: () => { box.classList.add("is-done"); gsap.set(box, { clearProps: "width,height" }); } }, 0.8)
      .to(dim, { opacity: 1, duration: 0.3 }, 1.55)
      .add(() => { if (!held) wander(); }, 1.85);

    // The consumer hands the cursor over to another element — fx:point { el, label } points to the bottom right of that element, returns with fx:release and wanders around again
    const point = (e) => {
      const to = e.detail && e.detail.el;
      if (!to) return;
      held = true;
      idle && idle.pause();
      if (e.detail.label) tag.textContent = e.detail.label;
      const p = at(to);
      gsap.to(cursor, { x: p.x + p.w * 0.8, y: p.y + p.h * 0.55, duration: 0.8, ease: "power3.inOut", overwrite: "auto" });
    };
    const release = () => {
      if (!held) return;
      held = false;
      tag.textContent = label;
      if (idle) idle.restart(); else if (tl.progress() === 1) wander();
    };
    el.addEventListener("fx:point", point);
    el.addEventListener("fx:release", release);
    addEventListener("resize", measure);
    return () => {
      tl.kill();
      idle && idle.kill();
      el.removeEventListener("fx:point", point);
      el.removeEventListener("fx:release", release);
      removeEventListener("resize", measure);
      off();
    };
  });
})();
