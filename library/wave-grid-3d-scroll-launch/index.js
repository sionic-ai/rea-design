// Scroll schedule — carries over the original ScrollTrigger ranges (start px · length px) as is and applies them to the scene every frame.
// Segments without a custom curve use GSAP default power1.out, and the text wipe is scrub 1 (trails by 1s)
(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const out1 = (t) => 1 - (1 - t) * (1 - t);
  const inOut1 = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
  const P = (s, start, len, ease = out1) => ease(clamp((s - start) / len));
  // A yoyo tween: goes with the GSAP default duration .5, rests for 1, returns in .5 — 25% · 50% · 25% of the scroll length
  const yoyo = (s, start, len) => { const t = clamp((s - start) / len) * 2; return t < .5 ? out1(t * 2) : t < 1.5 ? 1 : out1((2 - t) * 2); };
  const TOTAL = 11400;

  const hero = $(".hero"), dots = $(".dots"), enter = $(".bottom .enter"), track = $(".track"), foot = $(".foot"), thumb = $(".thumb");
  const canvas = $("#gl");
  let W = null, last = 0, lastS = 0, inertia = 0, cardOpened = false, yaw = 0, pitch = 0;
  const gathered = { k: 0 };
  const wipe = Array(10).fill(0);
  const tmp = new THREE.Vector3();

  function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
    const s = scrollY, v = s - lastS; lastS = s;
    inertia += (clamp(v / 30, -1, 1) - inertia) * .1;

    // Hero text moves up 3400px over 200~1600 (power1.inOut), the dot guide disappears over 200~600, and the bottom button rises from 200px below over 200~1400
    hero.style.transform = `translateY(${(-3400 * P(s, 200, 1400, inOut1)).toFixed(1)}px)`;
    dots.style.opacity = (1 - P(s, 200, 400, inOut1)).toFixed(3);
    enter.style.transform = `translateY(${(200 * (1 - P(s, 200, 1200))).toFixed(1)}px)`;
    track.style.setProperty("--p", Math.trunc(clamp(s / TOTAL) * 100));
    thumb.style.setProperty("--p", clamp(s / TOTAL).toFixed(4));
    track.setAttribute("aria-valuenow", Math.trunc(clamp(s / TOTAL) * 100));
    // On reaching the end (88% of the scrollable length), the contact card opens by itself
    if (!cardOpened && s >= (document.documentElement.scrollHeight - innerHeight) * .88) { cardOpened = true; window.sgCard?.(true); }
    if (!W) return;

    const t = reduce ? 0 : now / 1000;
    // Wave grid: z −10→7 over 500~5500, disappears over 500~5000. Tilts very slowly (.01) toward the cursor
    W.gridGroup.position.z = lerp(-10, 7, P(s, 500, 5000));
    W.gridMat.uniforms.uOpacity.value = 1 - P(s, 500, 4500);
    W.gridMat.uniforms.uTime.value = t;
    W.gridGroup.visible = W.gridMat.uniforms.uOpacity.value > .002;
    W.gridGroup.rotation.y = lerp(W.gridGroup.rotation.y, W.mouse.x * .06, .01);
    W.gridGroup.rotation.x = lerp(W.gridGroup.rotation.x, -W.mouse.y * .06, .01);

    // Point cloud head: floats toward the cursor spot (different speed per point) and turns its head toward the cursor (horizontal .8 · vertical .6, remaining share .1)
    yaw = lerp(yaw, W.mouse.x * .8 + t * .15, .1); pitch = lerp(pitch, -W.mouse.y * .6, .1);
    W.headStep(W.cursorAt(), yaw, pitch, gathered.k);

    // Text column: from 500~1000 it rises from below (−10) to 1.5, from 4000~6000 it rises to 10, and over 500~5500 it approaches by 6
    const ty = s < 4000 ? lerp(-10, 1.5, P(s, 500, 500)) : lerp(1.5, 10, P(s, 4000, 2000));
    W.textGroup.position.set(-1.5, ty, 6 * P(s, 500, 5000));
    W.wipeUni.forEach((u, i) => {
      const target = clamp((s - (500 + 250 * i)) / 1500);
      wipe[i] = reduce ? target : wipe[i] + (target - wipe[i]) * (1 - Math.exp(-dt * 3));
      u.uWipe.value = -10 + 40 * wipe[i];
    });

    // Wheel: the content group rises −10→0 over 3400~4600 and 0→2 over 6600~8800, and over 4000~10000 the wheel rolls 5 rad so the step words come to the front in turn.
    W.content.position.set(0, s < 6600 ? lerp(-10, 0, P(s, 3400, 1200)) : lerp(0, 2, P(s, 6600, 2200)), -5);
    W.wheel.rotation.x = -.93 - 5 * P(s, 4000, 6000);
    const starts = { 17: 4680, 15: 5020, 13: 5500, 11: 5880 };
    W.pops.forEach((p) => {
      p.holder.scale.setScalar(lerp(.3, 1, yoyo(s, starts[p.k], 1500)));
      p.holder.rotation.y = Math.PI * yoyo(s, starts[p.k], 2000);
      // Tilts toward the cursor (rotation .1 · position .025, remainder .05)
      p.model.rotation.y = lerp(p.model.rotation.y, W.mouse.x * .4, .05);
      p.model.rotation.x = lerp(p.model.rotation.x, -W.mouse.y * .4, .05);
      p.model.position.x = lerp(p.model.position.x, W.mouse.x * .1, .05);
      p.model.position.y = lerp(p.model.position.y, W.mouse.y * .1, .05);
    });

    // Card: passes from −10→20 over 7000~11000, and flips half a turn each over 420px starting at 7580, 7900 and 8100
    W.cards.position.y = lerp(-10, 20, P(s, 7000, 4000));
    [7580, 7900, 8100].forEach((st, i) => { W.cardData[i].pivot.rotation.y = W.cardData[i].dir * Math.PI * P(s, st, 420); });
    const over = W.hover();
    W.cardData.forEach((c) => {
      const on = c === over;
      if (on === !!c.over) return;
      c.over = on;
      gsap.to(c.g.scale, { x: on ? 1.12 : 1, y: on ? 1.12 : 1, z: on ? 1.12 : 1, duration: .5, ease: "power2.out" });
      const to = new THREE.Color(window.sgCss(on ? "--kf-ink" : "--kf-line"));
      c.edge.forEach((e) => gsap.to(e.material.color, { r: to.r, g: to.g, b: to.b, duration: 1 }));
    });
    canvas.style.cursor = over ? "pointer" : "";

    // Screen bend: strength 0→1 over 6800~7050, strength × scroll inertia
    W.post.uniforms.uAmt.value = P(s, 6800, 250);
    W.post.uniforms.uInertia.value = reduce ? 0 : inertia;

    // Particle field: rises by 16 over 9000~11000 and wave height (yOffset) 8→−8. Tilts toward the cursor (horizontal .8 · vertical .6, .1)
    W.field.position.y = 16 * P(s, 9000, 2000);
    W.fieldMat.uniforms.uOffset.value = lerp(8, -8, P(s, 9000, 2000));
    W.fieldMat.uniforms.uTime.value = t;
    W.fieldMat.uniforms.uAlpha.value = P(s, 8800, 700);
    W.field.visible = s > 8800;
    W.fieldPivot.rotation.y = lerp(W.fieldPivot.rotation.y, W.mouse.x * .8 * .25, .1);
    W.fieldPivot.rotation.x = lerp(W.fieldPivot.rotation.x, -W.mouse.y * .6 * .25, .1);

    // Footer wordmark: −20→0 over 10000~11000. Attach the line below it at its spot in the scene
    W.endGroup.position.y = lerp(-20, 0, P(s, 10000, 1000));
    const fp = W.project(W.giant, tmp);
    foot.style.transform = `translate(${fp.x.toFixed(1)}px,${(fp.y + innerHeight * .29).toFixed(1)}px)`;
    foot.style.opacity = P(s, 10500, 500).toFixed(3);

    W.render(W.post.uniforms.uAmt.value);
  }

  // Because letters are drawn on the canvas, the scene is built after all fonts have loaded. 2.2s after the loader lifts (around when the door’s dock appears) scattered dots gather to the head in 1.2s (power2.inOut)
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    try { W = window.sgScene(canvas); } catch (e) { W = null; return; }
    (window.sgReady || Promise.resolve()).then(() => gsap.to(gathered, { k: 1, duration: reduce ? 0 : 1.2, delay: reduce ? 0 : 2.2, ease: "power2.inOut" }));
  });
  requestAnimationFrame(tick);
})();
