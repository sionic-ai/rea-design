// Only on the first page: color card list that folds on phones, window opening when a card·character·photo is pressed, re-picking scattered photos
(() => {
  const { openModal } = window.G;

  // ── Color card list: collapses only at 767 and below. On expand it grows to the real height in .35s, then releases to auto ──
  const more = document.querySelector(".g-more");
  const list = document.getElementById("contents-more");
  if (more && list) {
    const label = more.querySelector(".g-more__text");
    const isSp = () => innerWidth <= 767;
    const set = (open) => {
      more.setAttribute("aria-expanded", String(open));
      list.setAttribute("aria-hidden", String(!open));
      label.textContent = open && isSp() ? "Close" : "See more";
    };
    const setup = () => {
      const open = !isSp();
      list.style.height = open ? "auto" : "0px";
      list.style.opacity = open ? "1" : "0";
      set(open);
    };
    more.addEventListener("click", () => {
      if (!isSp()) return;
      if (more.getAttribute("aria-expanded") === "true") {
        list.style.height = `${list.scrollHeight}px`;
        requestAnimationFrame(() => { list.style.height = "0px"; list.style.opacity = "0"; });
        set(false);
      } else {
        list.style.height = `${list.scrollHeight}px`;
        list.style.opacity = "1";
        list.addEventListener("transitionend", function done(e) {
          if (e.propertyName !== "height") return;
          if (more.getAttribute("aria-expanded") === "true") list.style.height = "auto";
          list.removeEventListener("transitionend", done);
        });
        set(true);
      }
    });
    setup();
    let wasSp = isSp();
    addEventListener("resize", () => { if (isSp() !== wasSp) { wasSp = isSp(); setup(); } });
  }

  // ── Card → article window. The category color applies to the left band · close cell · category dot together ──
  const cats = [...document.querySelectorAll(".g-contents__head .g-cats li")].map((li) => li.textContent);
  const postTpl = document.getElementById("post-template");
  document.querySelectorAll(".g-card").forEach((card) => {
    card.addEventListener("click", () => {
      const node = postTpl.content.firstElementChild.cloneNode(true);
      const c = card.dataset.cat;
      node.style.setProperty("--c", `var(--site-era-${c})`);
      const cat = node.querySelector(".g-post__cats li");
      cat.textContent = cats[c - 1];
      cat.style.setProperty("--c", `var(--site-era-${c})`);
      node.querySelector(".g-post__title").textContent = card.textContent.trim();
      openModal(node, "post", card);
    });
  });

  // ── Character → About window ──
  const chara = document.querySelector(".g-chara__btn");
  chara?.addEventListener("click", () => openModal(document.getElementById("chara-modal").content.firstElementChild.cloneNode(true), "chara", chara));

  // ── Scattered photos: pick eight, and pressing See other photos picks again (the original fetches them randomly from the server) ──
  const POOL = [
    "Group photo of members · inside office · fluorescent light · landscape 4:3",
    "Hands and sketch on a work desk · Window light · Landscape 4:3",
    "Back view of a crew member holding a camera · afternoon backlight · landscape 4:3",
    "Office bookshelf close-up · warm bulb light · landscape 4:3",
    "Neighborhood alley stroll · clear day · landscape 4:3",
    "Sample printed matter on a meeting table · Top view · Landscape 4:3",
    "Mountain view outside the window · early morning · landscape 4:3",
    "Welcome party toast moment · Warm indoor light · Landscape 4:3",
    "Photo exhibition on a stairway wall · indoors · horizontal 4:3",
    "Coffee cup and laptop · natural light on a table · landscape 4:3",
    "Group photo on a walk · overcast day · landscape 4:3",
    "Office plant and window · Backlit · Landscape 4:3",
  ];
  const box = document.getElementById("gallery-imgs");
  const pick = () => {
    const bag = [...POOL].sort(() => Math.random() - 0.5).slice(0, 8);
    box.replaceChildren(...bag.map((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "g-gallery__img";
      b.innerHTML = `<span class="wf-img" data-label="${label}"></span>`;
      b.setAttribute("aria-label", label.split(" · ")[0]);
      return b;
    }));
  };
  if (box) {
    pick();
    box.addEventListener("click", (e) => {
      const b = e.target.closest(".g-gallery__img");
      if (!b) return;
      const z = document.createElement("div");
      z.className = "g-zoom";
      z.innerHTML = `<span class="wf-img" data-label="${b.querySelector(".wf-img").dataset.label}"></span>`;
      openModal(z, "gallery", b);
    });
    document.querySelector(".g-gallery__reload")?.addEventListener("click", () => {
      box.style.opacity = "0";
      setTimeout(() => { pick(); box.style.opacity = "1"; }, 250);
    });
  }
})();
