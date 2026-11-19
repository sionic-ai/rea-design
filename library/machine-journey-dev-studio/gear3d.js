// Three.js helpers shared by three pages: gear, inner-gear ring, three-pronged carrier shapes, and painting of the original line art (paper face + ink lines on edges bent over 20° + back outline).
(() => {
  // Gear outline as a three shape: tooth tip · root four points + two root arc points
  function gearPts(z, m) {
    const rp = m * z / 2, ro = rp + m, rr = rp - 1.25 * m, pitch = 2 * Math.PI / z, pts = [];
    const P = (r, a) => new THREE.Vector2(r * Math.cos(a), r * Math.sin(a));
    for (let i = 0; i < z; i++) {
      const a = i * pitch;
      pts.push(P(rr, a - 0.29 * pitch), P(ro, a - 0.17 * pitch), P(ro, a + 0.17 * pitch), P(rr, a + 0.29 * pitch), P(rr, a + 0.43 * pitch), P(rr, a + 0.57 * pitch));
    }
    return pts;
  }
  const circle = (r, n = 40) => Array.from({ length: n }, (_, i) => new THREE.Vector2(r * Math.cos(i / n * 2 * Math.PI), r * Math.sin(i / n * 2 * Math.PI)));
  const extrude = (s, depth, curveSegments = 12) => {
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments });
    g.translate(0, 0, -depth / 2);
    return g;
  };
  function gearGeo(z, m, depth, hole = 0) {
    const s = new THREE.Shape(gearPts(z, m));
    if (hole) s.holes.push(new THREE.Path(circle(hole, 24)));
    return extrude(s, depth, 4);
  }
  function ringGeo(rOut, z, m, depth) {
    const s = new THREE.Shape(circle(rOut, 64));
    s.holes.push(new THREE.Path(gearPts(z, m)));
    return extrude(s, depth);
  }
  function carrierGeo(r, lobe, depth, hole = 0.05) {
    const s = new THREE.Shape();
    for (let i = 0; i < 3; i++) { const a = i * 2 * Math.PI / 3; s.absarc(r * Math.cos(a), r * Math.sin(a), lobe, a - Math.PI / 2, a + Math.PI / 2, false); }
    s.closePath();
    if (hole) s.holes.push(new THREE.Path(circle(hole, 16)));
    return extrude(s, depth, 8);
  }
  // Original line art: faces in paper color (pushed slightly back so the lines win), edges in ink lines, round outlines as a back-face shell inflated along the normal (thickness fitted in screen px)
  function lineStyle(paper, ink) {
    const fill = new THREE.MeshBasicMaterial({ color: paper, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const line = new THREE.LineBasicMaterial({ color: ink });
    const width = { value: 0.002 };
    const outline = new THREE.MeshBasicMaterial({ color: ink, side: THREE.BackSide });
    outline.onBeforeCompile = (sh) => {
      sh.uniforms.outlineWidth = width;
      sh.vertexShader = 'uniform float outlineWidth;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normalize(normal) * outlineWidth;');
    };
    const dress = (mesh) => {
      mesh.material = fill;
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 20), line));
      mesh.add(new THREE.Mesh(mesh.geometry, outline));
      return mesh;
    };
    return { fill, line, outline, width, dress, mesh: (geo, parent) => { const m = dress(new THREE.Mesh(geo)); parent?.add(m); return m; } };
  }
  window.LG3D = { gearPts, circle, gearGeo, ringGeo, carrierGeo, lineStyle };
})();
