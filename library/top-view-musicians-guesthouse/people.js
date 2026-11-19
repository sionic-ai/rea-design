// Performer · passerby figures seen from above — redraw the original watercolor-grain GIF illustration slot as our own SVG.
// <svg data-person="trumpet" data-tone="2" data-pose="walk"> Finds it and fills in the body (legs, shoes, torso, arms, head) and the instrument.
// Colors use --site-paint-* made from the skin (--kf-*), and two frames (a·b) are stacked so frame-step-loop swaps them in steps like a GIF
(() => {
  const NS = "http://www.w3.org/2000/svg";
  // Outfit color combos — shirt·pants·hair·hat/prop
  const TONES = [
    ["blue", "sand", "navy", "yellow"],
    ["coral", "navy", "navy", "green"],
    ["yellow", "blue", "navy", "coral"],
    ["green", "sand", "brown", "yellow"],
    ["sky", "navy", "navy", "coral"],
    ["orange", "sky", "navy", "yellow"],
    ["pink", "green", "brown", "sky"],
    ["sand", "blue", "navy", "orange"],
  ];
  const c = (k) => `var(--site-paint-${k})`;
  const limb = (x1, y1, x2, y2, w, fill) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  const dot = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;

  // Instrument — placed in front of the body (up, −y). Also returns the hand position
  const INST = {
    none: () => ({ back: "", front: "", hands: null }),
    trumpet: () => ({ back: "", front: `<path d="M-2 -14L-1 -34" stroke="${c("brass")}" stroke-width="4" stroke-linecap="round"/><ellipse cx="-1" cy="-37" rx="7" ry="4" fill="${c("brass")}"/>${dot(-4, -22, 1.6, c("brassdeep"))}${dot(1, -24, 1.6, c("brassdeep"))}`, hands: [[-5, -18], [3, -20]] }),
    guitar: () => ({ back: "", mid: `<g transform="rotate(-35)"><ellipse cx="2" cy="4" rx="13" ry="10" fill="${c("wood")}"/><circle cx="0" cy="3" r="3.2" fill="${c("brassdeep")}"/><rect x="-28" y="1" width="24" height="4.5" rx="2" fill="${c("brassdeep")}"/></g>`, front: "", hands: [[-20, -10], [8, 2]] }),
    ukulele: () => ({ back: "", mid: `<g transform="rotate(25)"><ellipse cx="-2" cy="2" rx="8" ry="6.5" fill="${c("orange")}"/><rect x="4" y="0" width="16" height="3.5" rx="1.5" fill="${c("brassdeep")}"/></g>`, front: "", hands: [[-6, 0], [14, 8]] }),
    keys: () => ({ back: "", front: "", mid: `<rect x="-26" y="-36" width="52" height="15" rx="2" fill="${c("paper")}" stroke="${c("navy")}" stroke-width="1.6"/><path d="M-20 -36v8M-14 -36v8M-6 -36v8M0 -36v8M8 -36v8M14 -36v8M20 -36v8" stroke="${c("navy")}" stroke-width="2.4"/>`, hands: [[-12, -24], [12, -24]] }),
    drum: () => ({ back: "", front: "", mid: `<circle cx="-20" cy="-14" r="9" fill="${c("paper")}" stroke="${c("coral")}" stroke-width="2.5"/>${dot(-20, -23, 1.4, c("brass"))}${dot(-11, -14, 1.4, c("brass"))}${dot(-29, -14, 1.4, c("brass"))}`, hands: [[-17, -10], [12, -14]] }),
    mic: () => ({ back: "", front: `${limb(4, -16, 6, -30, 2.4, c("navy"))}${dot(6, -32, 3.4, c("navy"))}`, hands: [[4, -18], [-14, -8]] }),
    flute: () => ({ back: "", front: `${limb(-22, -20, 18, -24, 3, c("brass"))}`, hands: [[-8, -21], [6, -23]] }),
    cup: () => ({ back: "", front: `${dot(-21, -6, 4, c("paper"))}${dot(-21, -6, 2.6, c("brown"))}`, hands: [[-21, -6], [14, 6]] }),
  };

  // One frame — when step is 0/1, legs and arms swing opposite each other
  const body = (o, step) => {
    const [shirt, pants, hair, extra] = TONES[o.tone % TONES.length].map(c);
    const skin = c("skin"), shoe = c("shoe");
    const walk = o.pose === "walk";
    const s = step ? 1 : -1;
    const inst = INST[o.inst] ? INST[o.inst]() : INST.none();
    const legL = walk ? 7 * s : 0, legR = walk ? -7 * s : 0;
    let g = "";
    // Legs and shoes (behind the body)
    g += limb(-6, 6, -8, 26 + legL, 9, pants) + dot(-8, 30 + legL, 4.2, shoe);
    g += limb(6, 6, 8, 26 + legR, 9, pants) + dot(8, 30 + legR, 4.2, shoe);
    g += inst.back;
    // Torso
    g += `<ellipse cx="0" cy="2" rx="17" ry="11" fill="${shirt}"/>`;
    g += inst.mid || "";
    // Arms — with an instrument, to the hand position, when walking, swing front and back, when standing, to the sides
    const hands = inst.hands || (walk ? [[-20, -4 - 8 * s], [20, -4 + 8 * s]] : [[-22, 8 + 3 * s], [22, 8 - 3 * s]]);
    const jig = !walk && inst.hands ? 2 * s : 0;
    const [[hx1, hy1], [hx2, hy2]] = hands;
    g += limb(-14, 0, (hx1 - 14) / 2, (hy1 + jig) / 2, 6.5, shirt) + limb((hx1 - 14) / 2, (hy1 + jig) / 2, hx1, hy1 + jig, 5, skin) + dot(hx1, hy1 + jig, 3, skin);
    g += limb(14, 0, (hx2 + 14) / 2, (hy2 - jig) / 2, 6.5, shirt) + limb((hx2 + 14) / 2, (hy2 - jig) / 2, hx2, hy2 - jig, 5, skin) + dot(hx2, hy2 - jig, 3, skin);
    g += inst.front;
    // Head (hair seen from above) · bun · hat
    if (o.hat) g += `<circle cx="0" cy="-2" r="13" fill="${extra}"/><circle cx="0" cy="-2" r="8" fill="none" stroke="${c("brassdeep")}" stroke-width="1.2" opacity=".5"/>`;
    else {
      g += dot(0, -2, 9.5, hair);
      if (o.bun) g += dot(0, 9, 4.5, hair);
      if (o.tie) g += `<path d="M-3 -12l3 -6 3 6z" fill="${extra}"/>`;
    }
    return `<g class="tp-frame" data-fx-part="frame">${g}</g>`;
  };

  const draw = (svg) => {
    if (svg.dataset.drawn) return;
    const o = {
      inst: svg.dataset.person || "none",
      tone: +(svg.dataset.tone || 0),
      pose: svg.dataset.pose || (svg.dataset.person && svg.dataset.person !== "none" ? "play" : "walk"),
      hat: svg.hasAttribute("data-hat"),
      bun: svg.hasAttribute("data-bun"),
      tie: svg.hasAttribute("data-tie"),
    };
    svg.setAttribute("viewBox", "-34 -44 68 80");
    svg.innerHTML = body(o, 0) + body(o, 1);
    svg.dataset.drawn = "1";
  };
  // Hand-drawn music note — like the original GIF, two frames: upright and tilted (frame-step-loop swaps from a 2s pause to a .5s nod)
  const NOTES = {
    eighth: '<path d="M14 6v26"/><ellipse cx="9" cy="33" rx="5.5" ry="4" transform="rotate(-20 9 33)" class="tp-fill"/><path d="M14 6c4 4 9 6 8 13"/>',
    beam: '<path d="M8 10v22M24 6v22"/><path d="M8 10 24 6M8 15l16-4" stroke-width="3"/><ellipse cx="4" cy="33" rx="5" ry="3.6" transform="rotate(-20 4 33)" class="tp-fill"/><ellipse cx="20" cy="29" rx="5" ry="3.6" transform="rotate(-20 20 29)" class="tp-fill"/>',
    quarter: '<path d="M16 4v28"/><ellipse cx="11" cy="33" rx="5.5" ry="4" transform="rotate(-20 11 33)" class="tp-fill"/>',
    clef: '<path d="M16 38c-6 1-8-6-3-8s8 4 3 7M14 40c3-12 2-24 3-34 1-6 7-3 5 4-2 8-14 12-14 20 0 8 12 9 14 2 2-7-8-9-10-3"/>',
    flat: '<path d="M10 4v30c6-2 12-6 10-12-2-5-8-3-10 1"/>',
  };
  const drawNote = (svg) => {
    if (svg.dataset.drawn) return;
    const shape = NOTES[svg.dataset.note] || NOTES.eighth;
    svg.setAttribute("viewBox", "0 0 30 42");
    // Music notes without sheet swapping (decoration above the menu button) get just one upright sheet
    svg.innerHTML = /frame-step-loop/.test(svg.dataset.fx || "") ? `<g data-fx-part="frame">${shape}</g><g data-fx-part="frame" transform="rotate(-16 15 36)">${shape}</g>` : shape;
    svg.dataset.drawn = "1";
  };
  document.querySelectorAll("svg[data-person]").forEach(draw);
  document.querySelectorAll("svg[data-note]").forEach(drawNote);
  window.tpDrawPerson = draw;
})();
