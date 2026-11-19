// Voxel illustration definitions used on the site — redrawn with similar masses at the same place and viewpoint as the original 3D render images
(() => {
  const V = window.LLVox;
  if (!V) return;
  const { box, ball, flat, kid, tree, pine, house, tent, blobPoly } = V;

  const grill = (x, y, z = 0) => [box(x, y, z, .1, .1, 1, "navy"), box(x + 1.5, y, z, .1, .1, 1, "navy"), box(x, y + .9, z, .1, .1, 1, "navy"), box(x + 1.5, y + .9, z, .1, .1, 1, "navy"), box(x - .1, y - .1, z + 1, 1.8, 1.2, .35, "wood"), box(x, y, z + 1.35, 1.6, 1, .05, "navy")];
  const skewer = (x, y, z) => [ball(x, y, z, .28, "white"), ball(x + .45, y, z, .26, "orange"), box(x + .8, y - .15, z - .2, .3, .3, .4, "yellow")];
  const dog = (x, y, z = 0, hop = 0) => [box(x, y, z + .3 + hop, 1.1, .5, .5, "white"), box(x + .9, y - .05, z + .7 + hop, .55, .6, .55, "white"), box(x + .1, y + .1, z + hop, .2, .2, .3, "white"), box(x + .8, y + .1, z + hop, .2, .2, .3, "white"), box(x + 1.1, y + .55, z + .95 + hop, .1, .04, .12, "navy"), box(x - .2, y + .2, z + .7 + hop, .25, .12, .12, "white")];
  const fire = (x, y, z, k) => [box(x - .5, y - .5, z, 1.4, 1.4, .4, "navy"), { t: "cone", x: x + .2, y: y + .2, z: z + .4, h: .9 + k * .25, r: .5, c: "orange" }, { t: "cone", x: x + .25, y: y + .35, z: z + .4, h: .5 + (1 - k) * .2, r: .3, c: "yellow" }];
  const hill = (cx, cy, rx, ry, z = 0) => flat(blobPoly(cx, cy, rx, ry), "white", z);
  const pond = (cx, cy, r, z = 0) => flat(blobPoly(cx, cy, r, r * .9, [1, .95, 1.05, .98, 1.02, .96, 1.04, .97]), "blue", z);
  const mat = (x, y, z = 0) => flat([[x, y], [x + 2.6, y], [x + 2.6, y + 2], [x, y + 2]], "blue", z);

  /* ── Park background (map base, mini illustration) ── */
  const parkBase = () => [
    box(0, 0, 0, 24, 16, 1.2, "teal"),
    box(-1.2, 9, 0, 1.2, 7, 1.2, "teal"),
    flat([[2, 7], [22, 7], [22, 8.6], [2, 8.6]], "path", 1.2),
    flat([[11, 1], [12.6, 1], [12.6, 15], [11, 15]], "path", 1.2),
    hill(7, 12.6, 3.2, 2.6, 1.21),
    pond(5, 6, 1.8, 1.21),
    mat(13.4, 3.6, 1.21),
    ...tree(1.2, 1.2, 1.2, .9), ...tree(2.6, .9, 1.2, .7), ...tree(22.6, 1.2, 1.2, .8), ...tree(17.5, 1.1, 1.2, 1),
    ...tree(1, 14.6, 1.2, .8), ...tree(9.8, 15, 1.2, .9), ...tree(14.6, 14.8, 1.2, .7), ...tree(22.8, 14.6, 1.2, .9),
    ...pine(16.4, 6.2, 1.2, 1.5), ...pine(9.6, 5.2, 1.2, 1.4), ...pine(20.4, 9.6, 1.2, 1.6),
    ...[0, 1, 2, 3, 4, 5].map((i) => box(16 + i * .9, 15.3, 1.2, .12, .12, .7, "deep")),
    box(16, 15.32, 1.6, 5.4, .06, .1, "deep"),
  ];
  // Whole diorama (base + facilities) — miniature for the About and Careers strip
  const parkFull = () => [
    ...parkBase(),
    ...house(1.5, 1.6, 1.2, 3, 4, 2, { sign: true }), ...tent(3, 3.6, 3.4, 1.2),
    ...house(19, 9.2, 1.2, 3, 4.6, 2.2, { sign: true }),
    box(15, 2, 1.2, 1.2, 1.2, 3, "wood"), box(14.8, 1.8, 4.2, 1.6, 1.6, .3, "wood"),
    box(15.6, 3.2, 1.2, .8, 6, .4, "orange"), box(15.6, 3.2, 1.6, .8, .8, 2.6, "orange"),
    ...grill(2.2, 13.6, 1.2), ...kid(1.4, 12.4, 1.2, { shirt: "yellow", cap: "navy" }), ...kid(4, 12, 1.2, { shirt: "orange", cap: "navy" }),
    ...fire(5, 6, 1.21, 1), ...kid(3.4, 6.6, 1.2, { shirt: "yellow" }), ...kid(6.2, 7.4, 1.2, { shirt: "orange", hair: "navy" }),
    ...kid(6.6, 12.4, 1.21, { shirt: "orange" }), ...kid(8.6, 13, 1.21, { shirt: "yellow", hair: "wood" }),
    ...kid(14, 4, 1.21, { shirt: "yellow" }), ...kid(15, 4.8, 1.21, { shirt: "white", hair: "navy" }),
    ...dog(17.4, 11.2, 1.2), ...kid(18.6, 12, 1.2, { shirt: "yellow", hair: "orange" }),
    ...kid(12.4, 11, 1.2, { shirt: "deep", cap: "deep" }),
  ];
  window.LLPark = (s = 1) => V.svgOf(parkFull(), { u: 22 * s, pad: 4 });

  /* ── Facility sprites on the map (original cell count · length as is) ── */
  const range = (n) => [...Array(n).keys()];
  const SPOTS = [
    { key: "bbq", name: "BBQ Yard", pos: "left:1%;bottom:17.4%;width:21.81%;height:27.17%", n: 3, dur: .6, badge: "--fx-badge-x:55%;--fx-badge-y:90%",
      frame: (i) => [...grill(1, 1), ...skewer(1.4, .6, 1.9 + (i === 1 ? .2 : 0)), ...kid(-.4, .4, 0, { shirt: "yellow", cap: "navy", arm: i / 2 }), ...kid(3, 0, 0, { shirt: "orange", cap: "navy", arm: (2 - i) / 2 })] },
    { key: "pluminn", name: "One Lodging", pos: "top:10.8%;left:12.1%;width:24.54%;height:32.22%", n: 1, dur: .6, badge: "--fx-badge-x:54%;--fx-badge-y:-9%",
      frame: () => [...house(0, 0, 0, 3.4, 4.4, 2.4, { sign: true }), ...tent(1.7, 2.2, 2.6, 1.4)] },
    { key: "dome", name: "Snow hill playground", pos: "bottom:9.4%;left:18.9%;width:31.31%;height:36.67%", n: 7, dur: 1.4, badge: "--fx-badge-x:99%;--fx-badge-y:58%",
      frame: (i) => [hill(2.6, 2.6, 3, 2.4, 0), ball(2.2, 2.2, .6, .8, "white"), ...kid(.4 + i * .3, 1 + i * .16, .2, { shirt: "orange", hair: "yellow", arm: i % 2 }), ...kid(3.6 - i * .1, 3.4, 0, { shirt: "yellow", hair: "wood", hop: i % 2 ? .25 : 0 })] },
    { key: "slide", name: "Long slide", pos: "top:12%;right:16%;width:27.23%;height:29.06%", n: 8, dur: 1.6, badge: "--fx-badge-x:68%;--fx-badge-y:56%",
      frame: (i) => [box(0, 0, 0, 1, 6, .4, "orange"), box(0, 0, 0, 1, 1, 2.4, "orange"), box(-.1, 6, 0, 1.2, .1, .1, "orange"), ...kid(.05, .3 + i * .7, 2.2 - i * .28, { shirt: "yellow", hair: "yellow", arm: 1 })] },
    { key: "athletic", name: "Wooden tower", pos: "top:.5%;left:31.6%;width:25.31%;height:34.89%", n: 6, dur: 1.2, badge: "--fx-badge-x:62%;--fx-badge-y:10%",
      frame: (i) => [box(0, 0, 0, 2.2, 2.2, .2, "wood"), box(0, 0, 0, .2, .2, 3, "wood"), box(2, 0, 0, .2, .2, 3, "wood"), box(0, 2, 0, .2, .2, 3, "wood"), box(2, 2, 0, .2, .2, 3, "wood"), box(-.1, -.1, 3, 2.4, 2.4, .2, "wood"), box(-.2, -.2, 3.8, 2.6, 2.6, .3, "wood"), box(.9, .9, 3.2, .2, .2, .6, "wood"), ...kid(2.4, 2.2, i * .5, { shirt: "navy", cap: "navy", arm: i % 2 })] },
    { key: "bonfire", name: "Campfire", pos: "top:37%;left:22.4%;width:16.23%;height:18.39%", n: 3, dur: .6, badge: "--fx-badge-x:91%;--fx-badge-y:-7%",
      frame: (i) => [pond(1, 1, 1.9, 0), ...fire(1, 1, .01, i / 2)] },
    { key: "picnic", name: "Picnic Mat", pos: "top:30.9%;left:41%;width:16.31%;height:21.17%", n: 7, dur: 1.4, badge: "--fx-badge-x:84%;--fx-badge-y:-8%",
      frame: (i) => [mat(0, 0, 0), box(.4, 1.2, 0, 1, .5, .3, "white"), ...kid(1.4, .2, 0, { shirt: "white", hair: "navy", arm: (i % 3) / 2 }), ...kid(-.6, -.2, 0, { shirt: "yellow", arm: i % 2, hop: i === 3 ? .2 : 0 })] },
    { key: "workshop", name: "Experience Workshop", pos: "bottom:21.3%;left:47.6%;width:20.31%;height:30.56%", n: 4, dur: .8, badge: "--fx-badge-x:52%;--fx-badge-y:-20%",
      frame: (i) => [box(0, 0, 0, 2.4, 1.4, .9, "wood"), box(.2, .2, .9, .6, .4, .1, "orange"), box(1.3, .3, .9, .5, .5, .1 + (i % 2) * .15, "yellow"), ...kid(.6, -1.3, 0, { shirt: "orange", hair: "wood", arm: i % 2 }), ...[0, 1, 2].map((k) => ball(-.6 + k * .5, 1.8, .2, .25, k === 1 ? "orange" : "white"))] },
    { key: "dogrun", name: "Dog yard", pos: "right:22.5%;bottom:35%;width:14.92%;height:16.11%", n: 4, dur: .8, badge: "--fx-badge-x:110%;--fx-badge-y:24%",
      frame: (i) => [...dog(0, .6, 0, i % 2 ? .3 : 0), ...kid(1.8, 0, 0, { shirt: "yellow", hair: "orange", arm: (i % 2) })] },
    { key: "irisinn", name: "Lodging two", pos: "right:3%;bottom:38.8%;width:19.62%;height:37.33%", n: 1, dur: .6, badge: "--fx-badge-x:96%;--fx-badge-y:-10%",
      frame: () => [...house(0, 0, 0, 3, 4.8, 2.6, { sign: true }), box(.6, .4, 2.8, .8, .8, 1, "white"), box(.5, .3, 3.8, 1, 1, .2, "navy"), { t: "cone", x: 2.2, y: 1.4, z: 2.8, h: 1.4, r: .45, c: "yellow" }, ball(2.2, 1.4, 4.3, .45, "white")] },
  ];
  const ASPECT = 1300 / 896;
  const spotAspect = (pos) => {
    const w = +/width:([\d.]+)%/.exec(pos)[1], h = +/height:([\d.]+)%/.exec(pos)[1];
    return (w * ASPECT) / h;
  };
  window.LLSpots = SPOTS.map((s) => ({ ...s, strip: () => V.stripOf(range(s.n).map((i) => s.frame(i)), spotAspect(s.pos), { u: 20 }) }));
  window.LLParkBase = () => V.svgOf(parkBase(), { u: 37, viewBox: [-560, -70, 1300 + 120, 896], par: "xMidYMax meet" });

  /* ── Four hero screens — zoomed scenes from the same viewpoint as the original 3D render scenes ── */
  const heroes = [
    () => [box(-6, -6, -1, 22, 22, 1, "teal"), hill(5, 5.6, 4.2, 3.3, 0), pond(-1, -1, 3, .01), ball(-2.6, 7.4, 1.2, 1.2, "teal"), ball(-1.6, 9, 1, 1, "teal"), box(-2.7, 7.3, 0, .3, .3, 1.2, "deep"), ...kid(4.4, 4.4, 0, { shirt: "orange", hair: "yellow", arm: .6 }), ...kid(8, 1.4, .6, { shirt: "yellow", cap: "orange", hop: .3, arm: 1 }), ...tree(10.4, 6.6, 0, 1.1), ...tree(-3, 2, 0, 1.3), box(-.3, -2.2, 0, 1.8, 1.8, 1.4, "navy"), ...pine(.6, 9.6, 0, 1.2), ...tree(0, 7.4, 0, 1.4), ...tree(7.8, 0, 0, 1.3), ...kid(1.2, 5.6, 0, { shirt: "yellow", cap: "navy", arm: .3 }), box(6.6, 7.6, 0, 1.4, 1.4, .8, "orange"), ...pine(8.6, 9, 0, 1.6), ball(2.4, -.6, .4, .9, "white")],
    () => [box(-6, -6, -1, 22, 22, 1, "teal"), ...grill(3.2, 3.6), ...skewer(3.6, 3.2, 2.2), ...kid(1.6, 2.4, 0, { shirt: "yellow", cap: "navy", arm: 1 }), ...kid(5.6, 3, 0, { shirt: "orange", cap: "navy", arm: .4 }), ...tree(-1.6, 6.4, 0, 1.3), ...tree(8.6, -1, 0, 1.2), ...tree(9.6, 6.6, 0, 1), hill(2, 9, 3, 2, .01), ...tree(0, 7.2, 0, 1.5), ...tree(7.4, 0, 0, 1.2), box(6, 6.8, 0, 2, 1.2, .9, "orange"), box(6, 6.8, .9, 2, 1.2, .08, "white"), ...kid(4.4, 7.6, 0, { shirt: "white", hair: "navy", arm: .6 }), ...pine(1, -1, 0, 1.6)],
    () => [box(-6, -6, -1, 22, 22, 1, "teal"), ...house(2, 0, 0, 4, 5, 2.6, { sign: true }), ...tent(4, 2.5, 2.8, 1.6), ...pine(7.6, 5.6, 0, 2), ...pine(8.6, 3.4, 0, 1.6), ...kid(5.4, 7, 0, { shirt: "white", hair: "navy", arm: .5 }), ...dog(3, 8, 0), ...tree(-1, 7.6, 0, 1.2), ...tree(0, 7.6, 0, 1.3), ...tree(8.6, 8.8, 0, 1.2), mat(6.6, 6.4, .01), ...kid(7, 6.6, 0, { shirt: "yellow", arm: 1 }), ...pine(-.6, 2, 0, 1.8)],
    () => [box(-6, -6, -1, 22, 22, 1, "teal"), mat(2, 2, .01), box(2.4, 3.3, 0, 1, .5, .3, "white"), ...kid(3.4, 2.2, 0, { shirt: "white", hair: "navy", arm: 1 }), ...kid(1.2, 1.6, 0, { shirt: "yellow", arm: .5 }), box(5.6, 1, 0, 1.6, .8, .9, "orange"), box(5.6, 1, .9, 1.6, .8, .1, "white"), ...tree(-1.6, 5.4, 0, 1.2), ...tree(8, 5.6, 0, 1.4), ...tree(7.4, -2, 0, 1.1), hill(4, 8.6, 3, 2, .01), ...tree(0, 7.6, 0, 1.4), ...grill(5.2, 7.4), ...kid(4.2, 6.8, 0, { shirt: "orange", cap: "navy", arm: .5 }), ...pine(8.6, 1, 0, 1.6), ...dog(1.6, 5.6, 0, .2)],
  ];
  const heroBox = [-300, -40, 600, 420];

  /* ── Card · section header art ── */
  const ART = {
    "park-mini": () => window.LLPark(.42),
    "card-eat": () => V.svgOf([...grill(1.4, 1.2), ...skewer(1.8, .8, 2.1), ...kid(-.4, .6, 0, { shirt: "yellow", cap: "navy" }), ...kid(3.4, .2, 0, { shirt: "orange", cap: "navy", arm: .8 })], { u: 30 }),
    "card-play": () => V.svgOf([hill(2.2, 2.2, 3, 2.2, 0), ...kid(.6, 1, .3, { shirt: "orange", hair: "yellow", arm: .6 }), ...kid(2, -1.2, 1.4, { shirt: "yellow", cap: "orange" }), ...tree(-.4, 4.4, 0, .7), ...tree(.8, 5, 0, .55)], { u: 30 }),
    "card-stay": () => V.svgOf([...house(0, 0, 0, 3.4, 4.6, 2.4, { sign: true }), ...tent(1.7, 2.3, 2.6, 1.4), ...pine(4.4, 5.6, 0, 1.4), ...tree(-.6, 5.4, 0, .6)], { u: 30 }),
    "card-rent": () => V.svgOf([mat(0, 0, 0), box(.2, .2, 0, 1.6, .7, .7, "white"), box(.2, .2, .7, 1.6, .7, .06, "orange"), ...kid(1.6, 1, 0, { shirt: "yellow", arm: .5 }), ...kid(-.4, 1.4, 0, { shirt: "white", hair: "navy" }), ...tree(-1.2, -.6, 0, .8), ...tree(-1.6, .8, 0, .6)], { u: 30 }),
    "mascot-news": () => V.svgOf([box(0, 0, 0, 1.2, 1.2, .3, "navy"), ...kid(.1, .1, .3, { shirt: "deep", cap: "deep", arm: 1 }), flat([[1.6, -.6], [2.6, -.2], [1.8, .2]], "white", 2.6)], { u: 26 }),
    "mascot-access": () => V.svgOf([...dog(-1.4, .6, 0), ...kid(.4, 0, 0, { shirt: "yellow", hair: "orange", arm: .5 })], { u: 26 }),
    "mascot-bbq": () => V.svgOf([...grill(1.2, 1), ...kid(-.4, .6, 0, { shirt: "yellow", cap: "navy" }), ...kid(3, .2, 0, { shirt: "orange", cap: "navy" })], { u: 16 }),
    "mascot-stay": () => V.svgOf([...tent(0, 0, 0, 1.4, "wood"), box(-.2, .9, 0, .5, .4, .5, "blue")], { u: 30 }),
    "mascot-about": () => V.svgOf([ball(0, 0, 1, 1, "teal"), ...kid(1.2, 1, 0, { shirt: "orange", hair: "yellow" })], { u: 24 }),
    "strip-about": () => V.svgOf([...kid(0, 0, 0, { shirt: "yellow", cap: "orange" }), ...kid(3, -2, 0, { shirt: "orange", hair: "wood", arm: 1 }), ...dog(5, -3, 0), mat(7, -6, 0), ...kid(7.4, -5.6, 0, { shirt: "white", hair: "navy" }), ...grill(10, -9), ...kid(12.4, -9.4, 0, { shirt: "orange", cap: "navy", arm: .6 }), ball(14, -12, 1, 1, "white")], { u: 20 }),
    "loader-0": () => V.svgOf(kid(0, 0, 0, { shirt: "orange", hair: "yellow", arm: 1 }), { u: 36 }),
    "loader-1": () => V.svgOf(kid(0, 0, 0, { shirt: "yellow", cap: "navy" }), { u: 36 }),
    "loader-2": () => V.svgOf(dog(0, 0, 0), { u: 40 }),
    "loader-3": () => V.svgOf(kid(0, 0, 0, { shirt: "white", hair: "navy", arm: .5 }), { u: 36 }),
    "loader-4": () => V.svgOf([...tent(0, 0, 0, 1.2, "wood")], { u: 40 }),
  };
  heroes.forEach((h, i) => { ART[`hero-${i}`] = () => V.svgOf(h(), { u: 40, viewBox: heroBox, par: "xMidYMid slice" }); });
  window.LLArt = ART;
  window.LLFill?.();
})();
