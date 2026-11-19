// About page — original values: doctor photo sticky top = 10+header height (120, phone 85) − header hidden amount · staff drawer height .5s ·
// Gallery moves to the next page when each page’s 5s zoom ends, thumbnail overlap 1s · in-frame photo parallax u=(1.2−1)/1.2×100%.
(() => {
  const { rpx, isSP, reduced } = window.HD;

  const portraits = document.querySelectorAll(".doc__portrait");
  const stick = () => {
    const top = rpx(10 + (isSP() ? 85 : 120)) - (window.HD.hide || 0);
    portraits.forEach((p) => (p.style.top = top + "px"));
  };
  window.HD.lenis.on("scroll", stick);
  addEventListener("hd:ready", stick);
  stick();

  document.querySelectorAll(".staff__block").forEach((block) => {
    const label = block.querySelector(".staff__label");
    const body = block.querySelector(".staff__body");
    const inner = block.querySelector(".staff__in");
    body.addEventListener("transitionend", () => {
      body.style.height = "";
      body.classList.remove("is-anim");
      ScrollTrigger.refresh();
    });
    label.addEventListener("click", () => {
      const open = !block.classList.contains("is-open");
      block.classList.toggle("is-open", open);
      body.classList.remove("is-anim");
      body.style.height = open ? "0px" : inner.offsetHeight + "px";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        body.classList.add("is-anim");
        body.style.height = open ? inner.offsetHeight + "px" : "0px";
      }));
    });
  });

  const gal = document.querySelector(".gal");
  if (gal) {
    const imgs = [...gal.querySelectorAll(".gal__img")];
    const n = imgs.length;
    const thumbs = gal.querySelector(".gal__thumbs");
    const caps = imgs.map((img) => {
      const c = document.createElement("div");
      c.className = "gal__capage";
      c.textContent = img.dataset.cap;
      gal.querySelector(".gal__cap").appendChild(c);
      return c;
    });
    const tEls = imgs.map(() => {
      const t = document.createElement("span");
      t.className = "gal__thumb";
      t.innerHTML = "<i></i>";
      thumbs.appendChild(t);
      return t;
    });
    let pos = 0;
    const show = (p, dir = 1) => {
      pos = (p + n) % n;
      thumbs.classList.toggle("is-next", dir > 0);
      thumbs.classList.toggle("is-prev", dir < 0);
      gal.dataset.pos = pos;
      imgs.forEach((img, i) => {
        img.classList.remove("is-on");
        if (i === pos) { void img.offsetWidth; img.classList.add("is-on"); }
      });
      // Like the original, give room to one before, the current one, and three after (slots 0~4) — when the slot changes the keyframe name changes so it replays
      tEls.forEach((t, i) => {
        const k = (i - pos + 1 + n) % n;
        if (k <= 4) t.dataset.k = k; else delete t.dataset.k;
      });
      caps.forEach((c, i) => c.classList.toggle("is-on", i === pos));
    };
    imgs.forEach((img) => img.addEventListener("animationend", (e) => { if (e.animationName === "galZoom") show(pos + 1); }));
    gal.querySelector(".gal__prev").addEventListener("click", () => show(pos - 1, -1));
    gal.querySelector(".gal__next").addEventListener("click", () => show(pos + 1));
    [gal.querySelector(".gal__prev"), gal.querySelector(".gal__next")].forEach((b) => b.setAttribute("data-hover", ""));
    window.HD.bindHover(gal);
    show(0);

    const u = ((1.2 - 1) / 1.2) * 100;
    ScrollTrigger.create({
      trigger: gal, start: "top bottom",
      onEnter: () => gal.classList.add("is-active"),
      onUpdate: (self) => {
        if (reduced) return;
        const y = isSP() ? u * self.progress : u * self.progress - u / 2;
        imgs.forEach((img) => (img.style.transform = `translateY(${y}%)`));
      },
    });
  }
})();
