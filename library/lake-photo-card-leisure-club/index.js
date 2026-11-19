// Home — load the text-ring Lottie, facility slider (original studio slider: slot 410 + gap 24, one slot at a time with cubic-bezier(.58,.21,.41,.96))
(() => {
  // Like the original, dotlottie-player fetches src — pass it as a data: URL so it isn’t blocked even when opened via file://
  const slot = document.querySelector("[data-rv-lottie]");
  if (slot && window.RV_RING) {
    const player = document.createElement("dotlottie-player");
    player.setAttribute("src", `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(window.RV_RING))}`);
    player.setAttribute("autoplay", "");
    player.setAttribute("loop", "");
    player.setAttribute("background", "transparent");
    slot.append(player);
  }

  document.querySelectorAll("[data-rv-slider]").forEach((view) => {
    const track = view.querySelector("ul");
    const wrap = view.closest(".rv-facility");
    const prev = wrap?.querySelector(".is-prev"), next = wrap?.querySelector(".is-next");
    if (!track) return;
    let i = 0;
    const step = () => { const li = track.children[0]; return li ? li.getBoundingClientRect().width + parseFloat(getComputedStyle(li).marginRight || 0) : 0; };
    const max = () => Math.max(0, track.children.length - Math.floor(view.clientWidth / Math.max(1, step())));
    const go = (d) => { i = Math.min(max(), Math.max(0, i + d)); track.style.transform = `translateX(${-i * step()}px)`; };
    prev?.addEventListener("click", () => go(-1));
    next?.addEventListener("click", () => go(1));
    addEventListener("resize", () => go(0));
  });
})();
