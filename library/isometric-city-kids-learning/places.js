// Vehicle town — rises when the map image arrives, and pressing a button scales those vehicles 1.15~1.6x (.3s)
(() => {
  window.tkPages = window.tkPages || {};
  let offs = [];
  window.tkPages.places = {
    init(container) {
      const town = container.querySelector(".tk-town");
      if (!town) return;
      const img = town.querySelector(".tk-town__mapimg");
      const buttons = [...town.querySelectorAll("[data-town-button]")];
      const objects = [...town.querySelectorAll("[data-town-object]")];
      const keysOf = (el) => {
        const raw = el.getAttribute("data-town-object");
        try { const v = JSON.parse(raw); return Array.isArray(v) ? v : [v]; } catch { return [raw]; }
      };
      const pick = (e) => {
        const b = e.currentTarget, key = b.dataset.townButton;
        town.classList.toggle("is-focus", key !== "all");
        town.querySelectorAll(".is-active").forEach((n) => n.classList.remove("is-active"));
        b.classList.toggle("is-active");
        objects.forEach((o) => { if (keysOf(o).includes(key)) o.classList.add("is-active"); });
      };
      const ready = () => {
        town.classList.add("is-loaded");
        buttons.forEach((b) => b.addEventListener("click", pick));
      };
      if (img.complete && img.naturalWidth) ready();
      else img.addEventListener("load", ready, { once: true });
      offs.push(() => buttons.forEach((b) => b.removeEventListener("click", pick)));
    },
    off() { offs.forEach((f) => f()); offs = []; },
  };
})();
