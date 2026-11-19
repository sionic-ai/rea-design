// Clicking a same-site link makes an ink veil and an accent-color panel cover the screen from below (panel .08s later), then the destination page name rises letter by letter at 22ms, tilted 9°, before navigating.
// The arriving page starts covered, the name stands briefly then exits upward (−110%·−4°), and the curtain and panel lift (ink color .1s late). No curtain on first visit
(() => {
  const KEY = "fx-lift-label";
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  kfFx.register("lift-label-page", (root, { options, reduce }) => {
    const dur = +(options.dur ?? 0.72), hold = +(options.hold ?? 0.45) * 1000, each = +(options.each ?? 0.022);
    const ac = new AbortController(), on = { signal: ac.signal };
    const veil = document.createElement("div");
    veil.className = "fx-llp";
    veil.setAttribute("aria-hidden", "true");
    veil.style.setProperty("--fx-dur", `${dur}s`);
    veil.style.setProperty("--fx-each", `${each}s`);
    veil.innerHTML = '<i class="fx-llp__shade"></i><div class="fx-llp__panel"><span class="fx-llp__top"></span><span class="fx-llp__label"></span></div>';
    const label = veil.querySelector(".fx-llp__label"), top = veil.querySelector(".fx-llp__top");
    top.textContent = root.querySelector('[data-fx-part="brand"]')?.textContent.trim() || location.hostname || "";
    root.append(veil);
    const write = (text) => {
      label.textContent = "";
      let em = 0;
      [...text].forEach((ch, i) => { const o = document.createElement("span"), n = document.createElement("span"); n.textContent = ch === " " ? " " : ch; n.style.setProperty("--i", i); o.append(n); label.append(o); em += /[가-힣ぁ-ヿ一-鿿]/.test(ch) ? 0.95 : ch === " " ? 0.28 : 0.6; });
      label.style.setProperty("--em", Math.max(1, em).toFixed(2));
    };
    const nameOf = (doc) => doc.querySelector?.('[data-fx-part="name"]')?.textContent.trim() || (doc.title || "").split(/[·|—-]/)[0].trim();
    let going = false;
    if (!reduce && sessionStorage.getItem(KEY)) {
      write(sessionStorage.getItem(KEY));
      sessionStorage.removeItem(KEY);
      veil.className = "fx-llp is-on is-cover is-label";
      (async () => { await wait(hold); veil.classList.add("is-label-out"); await wait(150); veil.classList.add("is-anim", "is-lift"); veil.classList.remove("is-cover"); await wait(dur * 1000 + 250); veil.className = "fx-llp"; })();
    } else sessionStorage.removeItem(KEY);
    root.addEventListener("click", async (e) => {
      const a = e.target.closest("a[href]");
      if (reduce || going || !a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || a.getAttribute("href").startsWith("#") || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault();
      going = true;
      const name = a.dataset.name || a.textContent.replace(/\s+/g, " ").trim().slice(0, 24) || nameOf(document);
      write(name);
      sessionStorage.setItem(KEY, name);
      veil.className = "fx-llp is-on";
      await frames();
      veil.classList.add("is-anim", "is-cover");
      setTimeout(() => veil.classList.add("is-label"), 240);
      await wait(dur * 1000 - 20);
      location.href = u.href;
    }, on);
    addEventListener("pageshow", (e) => { if (e.persisted) { going = false; veil.className = "fx-llp"; } }, on);
    return () => { ac.abort(); veil.remove(); };
  });
})();
