(() => {
  // One set of connection windows (wide, narrow, phone) <template> Stamped out from here — the hero device graphic, trial preview and connection dialog all share the same mold
  const TEXT = {
    en: {
      title: "Panel Title", q: "A short question?", i1: "A short line here", d1: "Your three lines of description here. A run of short sentences.",
      i2: "Another short line", d2: "Your three lines of description here. A run of short sentences.", get: "Button", more: "Link Text", new: "New here?",
      groups: [["Group A", ["Wallet One", "Wallet Two", "Wallet Three", "Wallet Four"]], ["Group B", ["Wallet Five", "Wallet Six", "Wallet Seven"]]],
    },
    ko: {
      title: "Panel title", q: "Your short query here?", i1: "Your line title here", d1: "Your three lines of description here. A run of short sentences.",
      i2: "Your two line titles here", d2: "Your three lines of description here. A run of short sentences.", get: "Button name", more: "Link name", new: "Your short question here?",
      dm: "Your explanation goes here in four lines. In short sentences, say in order what it does, where it is used, and why it is needed, ending with a short last line.",
      groups: [["Bundle 1", ["Wallet 01", "Wallet 02", "Wallet 03", "Wallet 04"]], ["Bundle 2", ["Wallet 05", "Wallet 06", "Wallet 07", "Wallet 08", "Wallet 09"]]],
    },
  };
  const SIZES = ["wide", "compact", "mobile"];
  const build = (host) => {
    const size = SIZES.includes(host.dataset.size) ? host.dataset.size : "wide";
    const t = TEXT[host.dataset.fill] || TEXT.ko;
    const node = document.getElementById(`rk-tpl-${size}`).content.firstElementChild.cloneNode(true);
    node.querySelectorAll("[data-t]").forEach((n) => (n.textContent = t[n.dataset.t] ?? ""));
    const names = t.groups.flatMap(([, list]) => list);
    // On phone, the wallet becomes a horizontal row of icons and the rest a vertical list under the group name
    const strip = node.querySelector(".rk-m__strip");
    if (strip) names.forEach((name, n) => {
      const cell = document.createElement("span");
      cell.className = "rk-m__cell";
      cell.innerHTML = `<i class="rk-ico" data-i="${(n % 9) + 1}"></i><small></small>`;
      cell.lastChild.textContent = name;
      strip.append(cell);
    });
    const groups = node.querySelector(".rk-m__groups");
    let n = 0;
    if (groups) for (const [label, list] of t.groups) {
      const g = document.createElement("div");
      g.innerHTML = `<span class="rk-m__label"></span>`;
      g.firstChild.textContent = label;
      for (const name of list) {
        const row = document.createElement("div");
        row.className = "rk-m__wallet";
        row.innerHTML = `<i class="rk-ico" data-i="${(n++ % 9) + 1}"></i><span></span>`;
        row.lastChild.textContent = name;
        g.append(row);
      }
      groups.append(g);
    }
    host.dataset.built = size;
    host.replaceChildren(node);
    return node;
  };
  document.querySelectorAll(".rk-modal").forEach(build);
  window.rkModal = { build };

  // Connect dialog — opened with the header-line button, closed with the panel’s close button · curtain · Esc. At phone width, a phone-shaped panel rising from the bottom like the original
  const dialog = document.querySelector(".rk-dialog");
  if (dialog) {
    const host = dialog.querySelector(".rk-modal");
    const phone = matchMedia("(max-width: 767px)");
    const dress = () => {
      host.dataset.size = phone.matches ? "mobile" : "wide";
      const node = build(host);
      // Panels inside device images and trial previews are just pictures, so they aren’t pressable — only the dialog panel becomes a button
      node.querySelectorAll(".rk-m__close").forEach((b) => { b.setAttribute("role", "button"); b.tabIndex = 0; b.classList.add("rk-press"); });
      node.querySelectorAll(".rk-m__get, .rk-m__more, .rk-m__pill, .rk-m__cell").forEach((b) => b.classList.add("rk-press"));
    };
    dress();
    phone.addEventListener("change", dress);
    const shut = () => dialog.dispatchEvent(new Event("fx:close"));
    document.querySelectorAll("[data-rk-open]").forEach((b) => b.addEventListener("click", () => dialog.dispatchEvent(new Event("fx:open"))));
    dialog.addEventListener("click", (e) => { if (e.target.closest(".rk-m__close")) shut(); });
    dialog.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".rk-m__close")) shut(); });
  }
})();
