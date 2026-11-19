// Timeline objects — the original is 3D models (14 glb types) and videos baked by rotating each model once. Built from our basic shapes with the same silhouette proportions.
// Shared by the detail window’s three scene and the media/*.mp4 placeholder videos (the same model baked spinning one full turn in 5s). The caller reads the color from the skin and passes it in.
(() => {
  const UX = (window.UX ||= {});
  const KINDS = ["tower", "door", "stair", "plant", "books", "cup", "laptop", "flask"];

  function build(kind, { body, accent }) {
    const T = THREE, g = new T.Group();
    const mat = {
      body: new T.MeshStandardMaterial({ color: body, roughness: 0.62, metalness: 0 }),
      accent: new T.MeshStandardMaterial({ color: accent, roughness: 0.5, metalness: 0 }),
      // The original glass (transmission) material is pressed down to body color .3 roughness — semi-transparent so the water inside shows through
      glass: new T.MeshStandardMaterial({ color: body, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.5, depthWrite: false }),
    };
    const add = (geo, m, x, y, z) => { const me = new T.Mesh(geo, mat[m]); me.position.set(x, y, z); g.add(me); return me; };
    // Box · cylinder seated on the floor (y), ball placed at the center
    const box = (w, h, d, x, y, z, m = "body") => add(new T.BoxGeometry(w, h, d), m, x, y + h / 2, z);
    const cyl = (rt, rb, h, x, y, z, m = "body") => add(new T.CylinderGeometry(rt, rb, h, 48), m, x, y + h / 2, z);
    const ball = (r, x, y, z, m = "accent", sy = 1) => { const me = add(new T.SphereGeometry(r, 32, 20), m, x, y, z); me.scale.y = sy; return me; };
    const lathe = (pts, m) => add(new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), 56), m, 0, 0, 0);
    const tree = (x, z, h) => { cyl(0.03, 0.03, h * 0.4, x, 0.04, z); ball(h * 0.28, x, h * 0.62, z, "accent", 1.35); };

    const SHAPES = {
      tower() {
        box(1.5, 0.05, 1.3, 0, 0, 0);
        box(1, 1.9, 0.9, 0, 0.05, 0);
        box(0.8, 0.03, 0.7, 0, 1.95, 0, "accent");
        for (let k = 0; k < 5; k++) {
          box(0.62, 0.15, 0.02, 0, 0.3 + k * 0.32, 0.455, "accent");
          box(0.02, 0.17, 0.08, 0.505, 0.3 + k * 0.32, -0.22, "accent");
          box(0.02, 0.17, 0.08, 0.505, 0.3 + k * 0.32, 0.2, "accent");
        }
        tree(-0.68, 0.38, 0.9);
        tree(0.62, -0.42, 0.8);
      },
      door() {
        box(1.3, 1.8, 0.6, 0, 0, 0);
        box(0.6, 1.62, 0.03, -0.32, 0.09, 0.3, "accent");
        box(0.6, 1.62, 0.03, 0.32, 0.09, 0.3);
        ball(0.035, -0.07, 0.95, 0.34, "body");
        ball(0.035, 0.07, 0.95, 0.34, "accent");
        box(1.36, 0.05, 0.66, 0, 1.8, 0);
      },
      stair() {
        for (let k = 0; k < 5; k++) box(0.34, 0.26 * (k + 1), 0.9, -0.68 + k * 0.34, 0, 0, k === 4 ? "accent" : "body");
        const rail = add(new T.CylinderGeometry(0.025, 0.025, 2.05, 16), "accent", 0, 1.15, 0.47);
        rail.rotation.z = -Math.atan2(1.04, 1.36);
      },
      plant() {
        cyl(0.36, 0.27, 0.55, 0, 0, 0);
        cyl(0.33, 0.33, 0.02, 0, 0.555, 0, "accent");
        cyl(0.025, 0.025, 0.55, 0, 0.55, 0);
        ball(0.24, -0.2, 1.05, 0.05, "accent", 1.5);
        ball(0.2, 0.22, 1.2, -0.05, "accent", 1.6);
        ball(0.17, 0.02, 1.42, 0.1, "body", 1.5);
      },
      books() {
        [[0.2, 1.5, "body"], [0.16, 1.25, "accent"], [0.22, 1.62, "body"], [0.18, 1.35, "body"]].reduce((x, [w, h, m]) => (box(w, h, 0.95, x + w / 2, 0, 0, m), x + w + 0.02), -0.4);
        const lean = box(0.17, 1.2, 0.95, 0.52, 0, 0, "accent");
        lean.rotation.z = -0.32;
        lean.position.x += 0.18;
      },
      cup() {
        box(1.1, 0.06, 1.1, 0, 0, 0, "accent");
        lathe([[0, 0.06], [0.3, 0.06], [0.32, 0.1], [0.36, 0.42], [0.42, 0.95], [0.38, 0.95], [0.33, 0.45], [0.29, 0.14], [0, 0.14]], "body");
        cyl(0.37, 0.37, 0.01, 0, 0.82, 0, "accent");
        const handle = add(new T.TorusGeometry(0.2, 0.055, 16, 40, Math.PI * 1.1), "body", 0.44, 0.56, 0);
        handle.rotation.z = -Math.PI * 0.55;
        const steam = add(new T.TorusGeometry(0.16, 0.05, 12, 32, Math.PI), "body", 0.02, 1.2, 0);
        steam.rotation.z = Math.PI / 2;
        const steam2 = add(new T.TorusGeometry(0.14, 0.045, 12, 32, Math.PI), "body", 0.02, 1.48, 0);
        steam2.rotation.z = -Math.PI / 2;
      },
      laptop() {
        box(1.5, 0.06, 1, 0, 0, 0.1);
        box(1.25, 0.01, 0.45, 0, 0.06, 0.05, "accent");
        const lid = new T.Group();
        const shell = new T.Mesh(new T.BoxGeometry(1.5, 0.95, 0.05), mat.body);
        const screen = new T.Mesh(new T.BoxGeometry(1.36, 0.8, 0.01), mat.accent);
        shell.position.y = 0.475;
        screen.position.set(0, 0.48, 0.03);
        lid.add(shell, screen);
        lid.position.set(0, 0.06, -0.4);
        lid.rotation.x = -0.22;
        g.add(lid);
      },
      flask() {
        lathe([[0, 0], [0.55, 0], [0.58, 0.05], [0.2, 0.95], [0.16, 1.45], [0.2, 1.5], [0.12, 1.5], [0.12, 1.0], [0, 1.0]], "glass");
        lathe([[0, 0.03], [0.5, 0.03], [0.3, 0.5], [0, 0.5]], "accent");
        cyl(0.21, 0.21, 0.12, 0, 1.5, 0, "accent");
      },
    };
    (SHAPES[kind] || SHAPES.tower)();
    return g;
  }

  UX.objects = { KINDS, build };
})();
