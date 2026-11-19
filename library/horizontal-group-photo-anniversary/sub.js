// Subpages — Sounds of the Temple (four topics, cards appear in order, door modal, new phrase when the bamboo fountain tips), History (modal for the year the slot stops on).
(() => {
  const POOL = [
    ["Your first phrase here", "Central district here", "End phrase five"], ["First five phrases", "Center orb seven", "End phrase five"], ["Your first phrase here", "Center Block", "Your closing phrase here"],
    ["First phrase", "Central district here", "End Phrase"], ["Your first phrase here", "Center orb seven", "End Phrase"], ["First five phrases", "Central district here", "End phrase five"],
  ];
  const card = ([a, b, c], i) => `<div class="senryu"><div class="senryu__in"><p class="senryu__lines"><span>${a}</span><span>${b}</span><span>${c}</span></p><p class="senryu__name"><span>Department name ${i + 1}</span><span>Pen name</span></p></div></div>`;
  const TOPICS = ["The future’s ‹Style›", "The work and spirit we want to carry into the future", "My workplace · work", "What feels like ”an occupational hazard”"];

  const host = document.querySelector("[data-topics]");
  if (host) {
    host.outerHTML = TOPICS.map((t, k) => `${k ? '<hr class="am-hr">' : ""}<section class="am-sec" data-slot="topic-${k + 1}"><div class="am-topic">
      <div class="am-topic__head"><h2 class="am-topic__title"><span class="sm">Topic</span><span class="lg">${t}</span></h2><a class="am-btn glightbox" href="#modal_voice_${k + 1}" data-modal="voice" data-type="inline" data-arrow><span>VIEW ALL</span></a></div>
      <div class="am-topic__list js-cards">${POOL.slice(0, 3).map(card).join("")}</div></div></section>`).join("");
    const modals = document.createElement("div");
    modals.className = "am-modals";
    modals.hidden = true;
    modals.innerHTML = TOPICS.map((t, k) => `<div class="am-voicemodal" id="modal_voice_${k + 1}"><h2 class="am-topic__title"><span class="sm">Topic</span><span class="lg">${t}</span></h2><div class="am-voicemodal__list">${POOL.concat(POOL.slice(0, 4)).map(card).join("")}</div></div>`).join("");
    document.querySelector("main").after(modals);
    // When the card group reaches screen center, they appear one by one at .3s intervals
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".senryu").forEach((c, i) => setTimeout(() => c.classList.add("show"), i * 300));
      io.unobserve(e.target);
    }), { rootMargin: "-50% 0%" });
    document.querySelectorAll(".js-cards").forEach((l) => io.observe(l));
  }

  // Door modal — four doors scale up (.4s), the middle two leaves open in .6s, then after .4s it grows 2.25× and clears away. Cards inside at .15s intervals
  document.addEventListener("click", (e) => {
    const a = e.target.closest('[data-modal="voice"]');
    if (!a) return;
    setTimeout(() => {
      const door = document.createElement("div");
      door.className = "am-door";
      door.innerHTML = "<i></i><i></i><i></i><i></i>";
      document.body.append(door);
      const box = document.querySelector(".glightbox-container .gcontainer");
      if (box) gsap.set(box, { opacity: 0 });
      void door.offsetWidth;
      requestAnimationFrame(() => door.classList.add("zoom"));
      gsap.delayedCall(0.7, () => {
        if (box) gsap.set(box, { opacity: 1 });
        document.querySelectorAll(".glightbox-container .am-voicemodal .senryu").forEach((c, i) => setTimeout(() => c.classList.add("show"), i * 150 + 400));
        door.classList.add("open");
        gsap.to(door, { scale: 2.25, duration: 0.4, delay: 0.4, ease: "sine.inOut", onComplete: () => door.remove() });
      });
    }, 0);
  });

  // One orb here — when the bamboo water spout enters the view it tilts, after 2s a new orb lights up and the mask lifts line by line. Press to replay
  const shishi = document.querySelector(".am-shishi");
  const rand = document.querySelector(".js-senryu");
  if (shishi && rand) {
    const pick = () => {
      const v = POOL[Math.floor(Math.random() * POOL.length)];
      rand.querySelector(".senryu__in").innerHTML = `<p class="senryu__lines"><span>${v[0]}</span><span>${v[1]}</span><span>${v[2]}</span></p><p class="senryu__name"><span>Department name</span><span>Pen name</span></p>`;
    };
    let busy = false;
    const swing = () => {
      shishi.classList.remove("on");
      rand.classList.remove("on", "line-show");
      void shishi.offsetWidth;
      requestAnimationFrame(() => shishi.classList.add("on"));
      setTimeout(() => rand.classList.add("on", "line-show"), 2000);
    };
    pick();
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { swing(); io.disconnect(); } }).observe(shishi);
    shishi.addEventListener("click", () => {
      if (busy) return;
      busy = true;
      rand.classList.remove("on", "line-show");
      pick();
      swing();
      setTimeout(() => (busy = false), 2000);
    });
  }

  // Timeline slot — opens the selected year’s story in a modal
  const slot = document.querySelector('[data-fx~="slot-reel-year"]');
  if (slot) slot.addEventListener("fx:result", (e) => {
    const y = e.detail.value;
    const lb = GLightbox({ elements: [{ content: `<div class="am-yearmodal"><p class="year">${y}</p><div class="wf-img" data-label="Photo from that year · former workplace · 16:9"></div><p>$ here{y}Introduce what happened this year in two or three lines. Write which business started and what changed.</p></div>`, type: "inline" }], closeButton: true });
    lb.open();
  });
})();
