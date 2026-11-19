// Post list — on entry the text, images and buttons rise in order (original blog-index.js)
(() => {
  const enter = () => requestAnimationFrame(() => requestAnimationFrame(() => { document.body.classList.add("nw-in"); abSite.watch(); }));
  abSite.revealed.then(enter);
})();
