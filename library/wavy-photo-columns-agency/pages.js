// Subpages — news · work lists use a brick grid, about is picking a lone photo spot, detail is a photo wall (4 columns) · photo zoom. Photo slot reveal is applied to every page by shared.js.
(() => {
  const VV = (window.VV = window.VV || {});
  VV.pages = VV.pages || {};
  const list = (main) => VV.pack(main.querySelector(".vv-list .vv-pack"));
  VV.pages.news = { mount: list };
  VV.pages.works = { mount: list };
  VV.pages.about = { mount: (main) => { VV.solo(main); return () => {}; } };
  VV.pages.detail = {
    mount(main) {
      VV.solo(main);
      const off = [VV.wall(main), VV.zoom(main)];
      return () => off.forEach((f) => f());
    },
  };
})();
