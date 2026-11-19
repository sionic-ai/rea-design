// Home: loader → slick fade hero · lineup color change · feature list · gallery shuffle · 360° ladder (our box-shape glTF → model-viewer)
jQuery(($) => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LINEUP = [
    ["Standard", "Gray ladder cutout", ["s1", "s2", "s3"]],
    ["Limited", "Pink ladder cutout", ["l1", "l2", "l3", "l4"]],
    ["Premium", "Gold ladder cutout", ["p1", "p2", "p3"]],
  ];
  $("[data-lineup]").each(function () {
    $(this).html(`<div class="lineup">${LINEUP.map(([name, label, dots]) => `
      <div class="img evt" data-anim="fadeIn"><h5 class="lc-en">${name}</h5>
        <figure><div class="wf-img" data-label="${label} · Front · Portrait"></div></figure>
        <div class="dots">${dots.map((c, i) => `<a href="#" class="dot sw-${c}${i === 0 ? " active" : ""}" data-color="${c}" aria-label="Color ${i + 1}"></a>`).join("")}</div>
      </div>`).join("")}</div>
      <div class="buy-line"><a class="buy_btn" href="#"><div class="zoom_img"><i></i></div><span>Buy Now</span></a></div>`);
  });
  // Original top_buy: light the pressed dot, fade the photo to .25 over 300ms, swap it, then bring it back to 1 over 500ms (jQuery animate swing)
  $(document).on("click", ".top_buy .dot", function () {
    const box = $(this).closest(".img");
    box.find(".dot").removeClass("active");
    $(this).addClass("active");
    const img = box.find("figure .wf-img");
    const label = img.attr("data-label").replace(/ · color \S+$/, "");
    img.stop(true).animate({ opacity: 0.25 }, reduce ? 0 : 300, () => {
      img.attr("data-label", `${label} · Color ${$(this).index() + 1}`);
      img.animate({ opacity: 1 }, reduce ? 0 : 500);
    });
    return false;
  });

  const FEATURES = [
    ["Support", "Used as a Supplement<br>Top frame", "Add the first line of the handle description.<br>A note on what supports you while you work.<br>One line on the structure that supports the body.", "Hands holding the top frame · white ladder · side light"],
    ["One touch bar", "Ease of use<br>Pursued<br>Single-fold bar", "Explanation that folds away when the bar is lifted.<br>An explanation that there is no worry of pinched fingers.", "Hand pulling a bar · mint ladder · bright interior"],
    ["Step", "Non-slip<br>Wave Platform", "First line describing the simple structure.<br>Description of the step’s wave pattern.<br>Description saying it is spacious and stable.", "Bare feet on a footrest · wood floor · low angle"],
    ["Compact", "Works anywhere<br>Freestanding Storage", "An explainer that stands on its own when folded.<br>A description that fits anywhere.<br>A note that there is no cleanup hassle.", "Folded ladder by the kitchen island · wooden cabinet"],
  ];
  $(".feature-list").html(FEATURES.map(([en, ko, text, label], i) => `
    <li class="evt f${i + 1}" data-anim="fadeIn"><figure><div class="wf-img" data-label="${label} · Horizontal"></div></figure>
      <p class="en lc-en">${en}</p><dl><dt class="lc-serif">${ko}</dt><dd>${text}</dd></dl></li>`).join("") + `
    <li class="evt warranty" data-anim="fadeIn"><figure class="illust"><div class="wf-img" data-label="Line drawing of two people carrying a ladder · white background"></div></figure>
      <p class="en lc-en">Warranty</p><dl><dt class="lc-serif">2-Year Warranty for Peace of Mind</dt><dd>Warranty period: 2 years from purchase date<br>Warranty coverage: failures within normal use</dd><dd class="note">※ Not covered: misuse · exceeding the weight limit · modification<br>※ 2-year warranty covers the three base colors only</dd></dl></li>`);

  // Gallery: like the original, shuffle the photo order each time it opens and prepend it to the list
  const org = $(".top_gallery .default li").toArray();
  for (let i = org.length - 1; i > 0; i--) { const r = Math.floor(Math.random() * (i + 1)); [org[i], org[r]] = [org[r], org[i]]; }
  org.forEach((li) => $(".top_gallery .list").prepend($(li).clone()));

  // Loader → slick after 4s (fade 2s · every 5s), loader hidden 1s later
  $("body").addClass("load");
  setTimeout(() => {
    $(".top_main ul").slick({ infinite: true, fade: true, dots: false, arrows: false, autoplay: !reduce, pauseOnHover: false, speed: reduce ? 0 : 2000, autoplaySpeed: 5000 });
    setTimeout(() => $("#loading").hide(), 1000);
  }, reduce ? 0 : 4000);
  window.lcMotion?.();

  // 360°: instead of the original glb, a folding ladder built from box nodes is made as glTF and put into model-viewer (paint is the skin’s --kf-ink)
  const mv = document.getElementById("reveal");
  if (mv) {
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
    const probe = document.createElement("canvas").getContext("2d");
    probe.fillStyle = hex || "currentColor";
    const m = probe.fillStyle.match(/\w\w/g) || ["11", "11", "11"];
    const lin = (v) => { const c = parseInt(v, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const color = [...m.slice(0, 3).map(lin), 1];
    // One unit box (a normal per face) + position, tilt and size per node
    const P = [], N = [], I = [];
    [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach((n) => {
      const [a, b] = n[0] ? [[0, 1, 0], [0, 0, 1]] : n[1] ? [[0, 0, 1], [1, 0, 0]] : [[1, 0, 0], [0, 1, 0]];
      const base = P.length / 3;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([u, v]) => {
        for (let k = 0; k < 3; k++) P.push(0.5 * (n[k] + u * a[k] + v * b[k]));
        N.push(...n);
      });
      const flip = (n[0] + n[1] + n[2]) < 0;
      I.push(...(flip ? [base, base + 2, base + 1, base, base + 3, base + 2] : [base, base + 1, base + 2, base, base + 2, base + 3]));
    });
    const quatX = (deg) => { const r = (deg * Math.PI) / 360; return [Math.sin(r), 0, 0, Math.cos(r)]; };
    const parts = [
      { t: [-0.22, 0.42, 0.12], r: quatX(-12), s: [0.035, 0.86, 0.06] }, { t: [0.22, 0.42, 0.12], r: quatX(-12), s: [0.035, 0.86, 0.06] },
      { t: [-0.22, 0.42, -0.12], r: quatX(12), s: [0.035, 0.86, 0.06] }, { t: [0.22, 0.42, -0.12], r: quatX(12), s: [0.035, 0.86, 0.06] },
      { t: [0, 0.83, 0.02], s: [0.48, 0.03, 0.2] }, { t: [0, 0.55, 0.07], s: [0.44, 0.025, 0.16] }, { t: [0, 0.28, 0.13], s: [0.46, 0.025, 0.16] },
      { t: [0, 0.6, -0.06], s: [0.4, 0.018, 0.018] },
    ];
    const f32 = new Float32Array(P), n32 = new Float32Array(N), u16 = new Uint16Array(I);
    const bytes = new Uint8Array(f32.byteLength + n32.byteLength + u16.byteLength);
    bytes.set(new Uint8Array(f32.buffer), 0); bytes.set(new Uint8Array(n32.buffer), f32.byteLength); bytes.set(new Uint8Array(u16.buffer), f32.byteLength + n32.byteLength);
    let bin = ""; bytes.forEach((b) => { bin += String.fromCharCode(b); });
    const gltf = {
      asset: { version: "2.0" }, scene: 0, scenes: [{ nodes: parts.map((_, i) => i) }],
      nodes: parts.map((p) => ({ mesh: 0, translation: p.t, scale: p.s, ...(p.r ? { rotation: p.r } : {}) })),
      meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
      materials: [{ pbrMetallicRoughness: { baseColorFactor: color, metallicFactor: 0.6, roughnessFactor: 0.45 } }],
      buffers: [{ byteLength: bytes.length, uri: `data:application/octet-stream;base64,${btoa(bin)}` }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: f32.byteLength, target: 34962 }, { buffer: 0, byteOffset: f32.byteLength, byteLength: n32.byteLength, target: 34962 }, { buffer: 0, byteOffset: f32.byteLength + n32.byteLength, byteLength: u16.byteLength, target: 34963 }],
      accessors: [
        { bufferView: 0, componentType: 5126, count: P.length / 3, type: "VEC3", min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
        { bufferView: 1, componentType: 5126, count: N.length / 3, type: "VEC3" },
        { bufferView: 2, componentType: 5123, count: I.length, type: "SCALAR" },
      ],
    };
    mv.src = URL.createObjectURL(new Blob([JSON.stringify(gltf)], { type: "model/gltf+json" }));
    if (reduce) mv.removeAttribute("auto-rotate");
  }
});
