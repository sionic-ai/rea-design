// Case detail — customer quote card stack: center card 0, neighbors ±1 at ±25% · 1% · ±10° · .9 scale, ±2 at ±45% · 5% · ±15° · .8 scale, others hidden.
// Dragging more than 10% of the board width moves one sheet over, and all of them bounce into their new places with .6s elastic.out(1.2, 1), while during the drag they blend between two positions by the dragged amount
(() => {
  document.querySelectorAll("[data-flick]").forEach((deck) => {
    const cards = Array.from(deck.querySelectorAll("[data-flick-item]"));
    const n = cards.length;
    if (!n) return;
    let active = 0;
    const cfg = (i, cur) => {
      let d = i - cur;
      if (d > n / 2) d -= n; else if (d < -n / 2) d += n;
      if (d === 0) return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 5 };
      if (d === 1) return { x: 25, y: 1, rot: 10, s: 0.9, o: 1, z: 4 };
      if (d === -1) return { x: -25, y: 1, rot: -10, s: 0.9, o: 1, z: 4 };
      if (d === 2) return { x: 45, y: 5, rot: 15, s: 0.8, o: 1, z: 3 };
      if (d === -2) return { x: -45, y: 5, rot: -15, s: 0.8, o: 1, z: 3 };
      return { x: 0, y: 0, rot: 0, s: 0.8, o: 0, z: 2 };
    };
    const render = (cur) => cards.forEach((c, i) => {
      const k = cfg(i, cur);
      c.style.zIndex = k.z;
      gsap.to(c, { duration: 0.6, ease: "elastic.out(1.2, 1)", xPercent: k.x, yPercent: k.y, rotation: k.rot, scale: k.s, opacity: k.o });
    });
    render(active);
    if (n < 2 || !window.Draggable) return;
    gsap.registerPlugin(Draggable);
    const drag = document.createElement("div");
    drag.className = "bp-deck__drag";
    deck.appendChild(drag);
    const w = () => deck.offsetWidth;
    Draggable.create(drag, {
      type: "x", edgeResistance: 0.8, bounds: { minX: -w() / 2, maxX: w() / 2 }, inertia: false,
      onPress() { deck.setAttribute("data-drag", "grabbing"); },
      onDrag() {
        const raw = this.x / w(), p = Math.min(1, Math.abs(raw)), next = (active + (raw > 0 ? -1 : 1) + n) % n;
        cards.forEach((c, i) => {
          const a = cfg(i, active), b = cfg(i, next), mix = (k) => a[k] + (b[k] - a[k]) * p;
          gsap.set(c, { xPercent: mix("x"), yPercent: mix("y"), rotation: mix("rot"), scale: mix("s"), opacity: mix("o") });
        });
      },
      onRelease() {
        deck.setAttribute("data-drag", "grab");
        const raw = this.x / w();
        const shift = raw > 0.1 ? -1 : raw < -0.1 ? 1 : 0;
        active = (active + shift + n) % n;
        render(active);
        gsap.to(this.target, { x: 0, duration: 0.3, ease: "power1.out" });
      },
    });
  });
})();
