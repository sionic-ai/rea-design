// The three place detail modals share one frame (#tpl-place) with only the color, name and photo label swapped in — it must run before illust.js fills the illustration slots
(() => {
  const tpl = document.getElementById("tpl-place").innerHTML;
  document.querySelectorAll("[data-place]").forEach((m) => {
    const d = JSON.parse(m.dataset.place);
    const one = Array.from({ length: 6 }, () => `<div class="wf-img" data-label="${d.loop}"></div>`).join("");
    d.loop = one + one;
    m.innerHTML = tpl.replace(/\{(\w+)\}/g, (_, k) => d[k] ?? "");
  });
})();
