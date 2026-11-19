(() => {
  // Used-by grid of 24 cells — original is logo photos, here nine icon types rotated from the accent color
  const logos = document.querySelector(".rk-logos");
  if (logos) {
    for (let i = 1; i <= 24; i++) {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#hero"><span class="rk-ico" data-i="${((i * 5) % 9) + 1}"></span><b>Partner ${String(i).padStart(2, "0")}</b></a>`;
      logos.append(li);
    }
  }

  // Copy install command — pressing turns it into a green check for 3s
  const copy = document.querySelector(".rk-copy");
  copy?.addEventListener("click", () => {
    navigator.clipboard?.writeText(copy.parentElement.querySelector("code").textContent).catch(() => {});
    // The original swaps the icon for a new drawing (no value in between while changing)
    const icon = (id) => (copy.querySelector(".rk-copy__icon use").setAttribute("href", `#${id}`));
    copy.classList.add("is-done");
    icon("rk-copy-b");
    clearTimeout(copy._t);
    copy._t = setTimeout(() => { copy.classList.remove("is-done"); icon("rk-copy-a"); }, 3000);
  });

  // Trial version — picking a sample changes the preview window’s shape, mode, accent and corners, and the accent flows into the three background shader colors as one set
  const modal = document.getElementById("rk-play-modal");
  const bg = document.querySelector(".rk-play__bg");
  if (!modal) return;
  const state = { size: "wide", mode: "light", accent: "blue", radius: "large" };
  const phone = matchMedia("(max-width: 767px)");
  const apply = () => {
    const size = phone.matches ? "compact" : state.size;
    if (modal.dataset.built !== size) { modal.dataset.size = size; window.rkModal.build(modal); }
    modal.dataset.mode = state.mode;
    modal.dataset.radius = state.radius;
    modal.style.setProperty("--m-accent", `var(--site-acc-${state.accent})`);
    modal.style.setProperty("--m-on-accent", ["green", "orange", "pink"].includes(state.accent) ? "var(--kf-bg)" : "var(--kf-ink)");
    const a = state.accent;
    bg?.setAttribute("data-fx-noise-gradient-plane", `c1: var(--site-g-${a}-1); c2: var(--site-g-${a}-2); c3: var(--site-g-${a}-3); speed: .025; fade: 5`);
  };
  document.addEventListener("fx:pick", (e) => {
    const key = e.target.closest("[data-rk-set]")?.dataset.rkSet;
    if (!key) return;
    state[key] = e.detail.value;
    apply();
  });
  phone.addEventListener("change", apply);
  apply();
})();
