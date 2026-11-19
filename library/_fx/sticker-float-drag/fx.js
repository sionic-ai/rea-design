(() => {
  // Original (hero graphic-complex of a reference site): the sticker bundle moves with a framer-motion spring (mass 4 · stiffness 800 · damping 80)
  // Pops out from opacity 0 · 40px below · scale 0 (after .2s with .05s stagger, from the back), each with a random tempo (2~3s, 0~1s late)
  // Floats while swinging tilt ±2° and vertical −2~5px. When dragged it stretches only .1 of the pointer movement, and on release it springs back into place (stiffness 600 · damping 20).
  // Spring curve: solves the damped oscillation with the given mass, stiffness and damping, draws it from 0 → 1 and uses it as a GSAP curve function (length is until the amplitude falls below 1/1000)
  const springOf = (m, k, c) => {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m));
    let x, slow;
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
      slow = z * w0;
    } else if (z > 1) {
      // Overdamping (FAQ height .2·280·18 → damping ratio 1.2) — the slow pole sets the length
      const wd = w0 * Math.sqrt(z * z - 1);
      x = (t) => 1 - Math.exp(-z * w0 * t) * (Math.cosh(wd * t) + ((z * w0) / wd) * Math.sinh(wd * t));
      slow = w0 * (z - Math.sqrt(z * z - 1));
    } else {
      x = (t) => 1 - (1 + w0 * t) * Math.exp(-w0 * t);
      slow = w0;
    }
    const duration = Math.log(1000) / slow;
    return { duration, ease: (p) => (p >= 1 ? 1 : x(p * duration)) };
  };
  const nums = (s, d) => String(s ?? d).split(",").map(Number);

  kfFx.register("sticker-float-drag", (el, { options, reduce, hover }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="sticker"]')];
    if (!parts.length) return;
    const [m, k, c] = nums(options.spring, "4,800,80");
    const pop = springOf(m, k, c);
    const [bm, bk, bc] = nums(options.back, "1,600,20");
    const back = springOf(bm, bk, bc);
    const rot = +(options.rot ?? 2);
    const [bobUp, bobDown] = nums(options.bob, "2,5");
    const beat = +(options.beat ?? 2), jitter = +(options.jitter ?? 1);
    const lift = +(options.y ?? 40), each = +(options.each ?? 0.05), delay = +(options.delay ?? 0.2);
    const order = options.order === "forward" ? parts : [...parts].reverse();
    // per: parent — delays are applied separately for each group wrapping the stickers (parent element) (in the original graphic-complex, six g groups each have their own staggerChildren)
    const per = options.per === "parent";
    const rank = (p) => {
      if (!per) return order.indexOf(p);
      const sib = order.filter((q) => q.parentElement === p.parentElement);
      return sib.indexOf(p);
    };
    const elastic = +(options.elastic ?? 0.1);
    const drag = options.drag !== "false" && hover;
    const swing = kfFx.ease("0.42,0,0.58,1", "power1.inOut");

    // Three shells: outer (entrance spring) > Drag > Floating. SVG <g> Same for HTML elements — wrap the children to separate layers
    const svgNS = "http://www.w3.org/2000/svg";
    const wrapped = parts.map((p) => {
      const isSvg = p instanceof SVGElement;
      const mk = () => (isSvg ? document.createElementNS(svgNS, "g") : document.createElement("span"));
      const pull = mk(), bob = mk();
      if (!isSvg) { pull.style.display = bob.style.display = "block"; }
      while (p.firstChild) bob.appendChild(p.firstChild);
      pull.appendChild(bob); p.appendChild(pull);
      return { p, pull, bob, isSvg };
    });
    const origin = (w) => (w.isSvg ? { transformOrigin: "50% 50%" } : {});

    if (reduce) return () => wrapped.forEach(({ p, pull, bob }) => { while (bob.firstChild) p.appendChild(bob.firstChild); pull.remove(); });

    const tweens = [];
    wrapped.forEach((w) => {
      gsap.set(w.p, { opacity: 0, y: lift, scale: 0, ...origin(w) });
      gsap.set([w.pull, w.bob], origin(w));
    });
    order.forEach((p) => {
      tweens.push(gsap.to(p, { opacity: 1, y: 0, scale: 1, duration: pop.duration, ease: pop.ease, delay: delay + rank(p) * each }));
    });
    wrapped.forEach((w) => {
      const r = () => Math.random();
      const dur = beat + jitter * r(), wait = r();
      const r0 = -rot * r(), r1 = rot * r(), y0 = -bobUp * r(), y1 = bobDown * r();
      gsap.set(w.bob, { rotation: r0, y: y0 });
      tweens.push(gsap.to(w.bob, { rotation: r1, y: y1, duration: dur, delay: wait, ease: swing, repeat: -1, yoyo: true }));
    });

    const offs = [];
    if (drag) {
      wrapped.forEach((w) => {
        const target = w.p;
        target.style.cursor = "grab";
        target.style.touchAction = "none";
        let sx = 0, sy = 0, on = false, scale = 1;
        const down = (e) => {
          if (e.button !== 0) return;
          on = true; sx = e.clientX; sy = e.clientY;
          // For SVG, measure how many viewBox units 1px on screen equals so it follows the pointer exactly
          const svg = w.isSvg ? target.ownerSVGElement : null;
          scale = svg && svg.getScreenCTM() ? 1 / svg.getScreenCTM().a : 1;
          gsap.killTweensOf(w.pull);
          target.setPointerCapture?.(e.pointerId);
          target.style.cursor = "grabbing";
          e.preventDefault();
        };
        const move = (e) => {
          if (!on) return;
          gsap.set(w.pull, { x: (e.clientX - sx) * elastic * scale, y: (e.clientY - sy) * elastic * scale });
        };
        const up = () => {
          if (!on) return;
          on = false; target.style.cursor = "grab";
          gsap.to(w.pull, { x: 0, y: 0, duration: back.duration, ease: back.ease });
        };
        target.addEventListener("pointerdown", down);
        target.addEventListener("pointermove", move);
        target.addEventListener("pointerup", up);
        target.addEventListener("pointercancel", up);
        offs.push(() => {
          target.removeEventListener("pointerdown", down); target.removeEventListener("pointermove", move);
          target.removeEventListener("pointerup", up); target.removeEventListener("pointercancel", up);
          target.style.cursor = target.style.touchAction = "";
        });
      });
    }

    return () => {
      tweens.forEach((t) => t.kill());
      offs.forEach((f) => f());
      wrapped.forEach(({ p, pull, bob }) => {
        gsap.killTweensOf([p, pull, bob]);
        while (bob.firstChild) p.appendChild(bob.firstChild);
        pull.remove();
        gsap.set(p, { clearProps: "opacity,transform,transformOrigin" });
      });
    };
  });
})();
