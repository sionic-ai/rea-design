// About — autoplay doesn’t kick in when entering via barba, so replay the video muted after .2s
(() => {
  FF.pages.bio = (root) => {
    const t = setTimeout(() => root.querySelectorAll("video").forEach((v) => { v.muted = true; v.play()?.catch(() => {}); }), 200);
    return { destroy() { clearTimeout(t); } };
  };
})();
