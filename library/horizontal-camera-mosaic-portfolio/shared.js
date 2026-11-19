// Shared by all pages — header line (difference blend) and phone menu, footer (parallax, signature drawing, current time), Lenis 1.3.17, cursor part slot
(() => {
  const page = document.body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ARROW = '<svg viewBox="0 0 12 12" fill="currentColor"><path d="M3 1.5h7.5V9H9V4.06l-6.47 6.47-1.06-1.06L7.94 3H3Z"/></svg>';
  // Handwritten signature — not the original signature, but our own line of the same length and slant
  const SIGN = "M8 118C30 70 52 24 70 30c16 6-6 70-18 92 18-30 40-74 58-70 16 4-4 54 8 52 14-2 30-40 46-38 12 2 2 30 14 28 16-4 30-26 48-24 14 2 10 20 26 16 40-10 120-34 180-30 30 2 22 26 4 34-18 8-30-12-10-30 30-26 120-58 200-62";
  // The header-bar logo is a filled band (the original signature logo is also a filled shape) — the same color change is caught by fill
  const SIGN_FILL = "M24.5 73.1 31.5 70.2 38.4 67.4 45.0 64.8 51.3 62.3 57.2 60.1 62.5 58.0 67.3 56.2 71.4 54.5 74.8 53.1 77.6 51.7 79.7 50.6 81.2 49.3 82.2 47.6 81.6 45.3 80.1 44.2 78.4 43.6 76.5 43.2 74.3 43.0 71.8 42.9 69.3 42.9 66.8 42.9 64.4 43.1 62.2 43.4 60.2 43.8 58.4 44.4 56.8 45.7 56.2 48.3 57.2 50.3 58.8 51.7 60.9 53.0 63.7 54.4 67.1 56.0 71.2 57.7 76.0 59.6 81.3 61.6 87.1 63.8 93.4 66.3 100.0 68.8 106.8 71.6 113.7 74.5 120.6 77.5 127.4 80.7 133.9 83.9 140.1 87.2 145.9 90.5 151.1 93.9 155.7 97.1 159.6 100.3 162.7 103.3 165.1 106.1 166.8 108.7 167.7 110.8 168.0 112.6 167.9 113.9 167.5 114.9 166.7 115.8 165.5 116.6 164.0 117.2 162.2 117.6 160.2 117.7 158.3 117.5 156.5 117.0 154.9 116.3 153.8 115.4 153.0 114.4 152.6 113.3 152.5 111.9 152.8 110.2 153.8 108.1 155.4 105.6 157.8 102.8 161.0 99.8 164.9 96.7 169.4 93.6 174.6 90.3 180.4 87.1 186.6 84.0 193.1 80.9 199.9 77.9 206.8 75.1 213.7 72.4 220.5 69.9 227.1 67.5 233.3 65.4 239.2 63.4 244.5 61.6 249.3 60.0 253.4 58.6 256.8 57.4 259.6 56.3 261.8 55.3 263.5 54.2 265.1 51.7 263.9 47.8 261.8 46.7 260.0 46.3 258.0 46.1 255.8 45.9 253.4 45.9 250.8 45.9 248.3 46.0 245.9 46.1 243.6 46.4 241.6 46.7 239.8 47.2 237.7 48.5 236.6 52.3 238.2 54.9 240.0 56.1 242.2 57.2 245.0 58.3 248.4 59.5 252.6 60.9 257.3 62.5 262.6 64.2 268.5 66.1 274.7 68.2 281.3 70.4 288.1 72.8 295.0 75.4 301.9 78.0 308.7 80.8 315.2 83.7 321.4 86.7 327.1 89.6 332.3 92.6 336.9 95.6 340.8 98.4 343.9 101.1 346.2 103.6 347.8 105.8 348.7 107.6 348.9 109.0 348.9 109.8 348.6 110.5 347.9 111.2 346.9 111.9 345.4 112.4 343.7 112.8 341.8 112.9 339.9 112.7 338.1 112.3 336.6 111.6 335.5 110.9 334.9 110.1 334.5 109.3 334.4 108.3 334.7 106.9 335.6 105.1 337.1 102.8 339.5 100.3 342.6 97.6 346.5 94.8 351.0 91.9 356.2 89.0 361.9 86.1 368.1 83.2 374.6 80.5 381.4 77.8 388.2 75.3 395.1 72.9 401.9 70.7 408.5 68.7 414.8 66.9 420.6 65.2 425.9 63.7 430.6 62.4 434.7 61.3 438.1 60.3 440.8 59.5 442.9 58.7 444.6 57.9 446.5 55.7 444.8 51.3 443.0 50.7 441.3 50.5 439.4 50.4 437.2 50.3 434.9 50.3 432.4 50.4 429.9 50.4 427.5 50.6 425.3 50.7 423.4 51.0 421.7 51.3 419.9 52.2 418.5 56.2 420.3 58.4 422.0 59.2 424.1 60.0 426.9 60.8 430.3 61.8 434.4 62.9 439.2 64.1 444.5 65.5 450.3 67.1 456.6 68.8 463.2 70.7 470.0 72.7 476.9 74.9 483.8 77.3 490.6 79.7 497.1 82.2 503.3 84.9 509.1 87.5 514.3 90.2 518.9 92.9 522.8 95.5 526.0 97.9 528.4 100.2 530.0 102.3 530.9 104.0 531.2 105.3 531.2 106.1 530.8 106.9 530.1 107.6 528.9 108.4 527.3 109.0 525.3 109.3 523.3 109.4 521.2 109.3 519.3 108.9 517.6 108.2 516.4 107.4 515.5 106.5 515.1 105.6 514.9 104.6 515.2 103.2 516.1 101.3 517.8 99.2 520.2 96.8 523.4 94.3 527.3 91.7 531.9 89.0 537.1 86.4 542.8 83.7 549.0 81.2 555.6 78.7 562.4 76.3 569.3 74.1 576.2 72.1 583.0 70.2 589.6 68.4 595.8 66.9 601.6 65.5 606.9 64.3 611.6 63.3 615.7 62.4 619.1 61.7 621.7 61.1 623.6 60.6 625.0 60.2 626.3 59.2 625.1 56.4 624.0 56.3 622.6 56.3 620.8 56.4 618.7 56.5 616.4 56.6 614.0 56.8 614.0 59.2 616.4 59.3 618.7 59.4 620.8 59.4 622.5 59.5 623.7 59.6 624.2 59.7 623.4 57.2 623.8 56.8 622.8 57.0 620.9 57.4 618.3 57.9 614.9 58.6 610.8 59.4 606.1 60.3 600.7 61.5 594.8 62.8 588.5 64.3 581.9 66.0 575.0 67.8 568.0 69.9 561.0 72.1 554.0 74.4 547.4 76.9 541.0 79.4 535.0 82.1 529.6 84.8 524.7 87.6 520.5 90.3 516.9 93.1 514.1 95.9 511.9 98.6 510.5 101.4 509.8 104.2 510.1 107.0 511.2 109.5 513.0 111.4 515.2 112.9 517.7 114.0 520.4 114.6 523.2 114.9 526.0 114.8 528.7 114.3 531.2 113.4 533.5 112.0 535.4 110.1 536.6 107.7 536.9 104.8 536.3 102.0 534.9 99.1 532.7 96.3 529.8 93.5 526.3 90.7 522.0 87.8 517.2 85.0 511.7 82.2 505.8 79.4 499.4 76.6 492.7 74.0 485.8 71.5 478.8 69.1 471.8 66.8 464.9 64.7 458.3 62.8 452.0 61.0 446.1 59.4 440.8 58.0 436.0 56.7 432.0 55.6 428.7 54.7 426.2 53.9 424.5 53.3 423.8 53.0 424.7 54.2 423.7 57.5 423.5 57.7 424.4 57.5 426.0 57.3 427.9 57.2 430.2 57.1 432.5 57.0 434.9 57.0 437.1 57.0 439.1 57.1 440.7 57.2 441.7 57.3 441.4 57.2 440.1 53.4 441.1 52.0 440.4 52.3 438.7 52.9 436.2 53.7 432.8 54.6 428.8 55.7 424.0 57.0 418.7 58.5 412.8 60.2 406.5 62.0 399.8 64.1 392.9 66.3 385.9 68.7 378.9 71.3 371.9 74.0 365.2 76.8 358.8 79.7 352.9 82.8 347.4 85.8 342.5 88.9 338.2 92.1 334.6 95.2 331.6 98.3 329.4 101.4 327.9 104.6 327.3 107.9 327.6 111.0 328.8 113.9 330.7 116.2 333.1 117.9 335.8 119.1 338.7 119.8 341.6 120.1 344.6 119.9 347.4 119.3 350.1 118.3 352.6 116.7 354.6 114.5 355.8 111.6 356.1 108.5 355.5 105.3 354.0 102.1 351.8 99.0 348.8 95.9 345.2 92.8 341.0 89.6 336.1 86.5 330.6 83.3 324.6 80.2 318.2 77.2 311.5 74.2 304.6 71.4 297.6 68.6 290.6 66.1 283.7 63.6 277.0 61.4 270.7 59.3 264.8 57.4 259.5 55.7 254.8 54.2 250.8 52.8 247.5 51.6 245.0 50.6 243.4 49.9 242.9 49.5 243.5 50.7 242.8 53.4 242.4 53.8 243.1 53.6 244.6 53.3 246.5 53.1 248.7 53.0 251.0 52.9 253.3 52.9 255.5 52.9 257.4 53.0 258.9 53.2 259.7 53.3 259.3 53.0 258.4 50.0 259.1 48.8 258.5 49.2 256.9 50.0 254.4 51.0 251.1 52.2 247.1 53.6 242.3 55.2 237.0 57.0 231.2 59.0 224.8 61.2 218.2 63.6 211.3 66.2 204.3 68.9 197.3 71.8 190.4 74.9 183.7 78.1 177.3 81.3 171.3 84.7 165.9 88.1 161.0 91.5 156.7 94.9 153.2 98.3 150.3 101.7 148.1 105.0 146.7 108.3 146.1 111.6 146.4 114.7 147.6 117.5 149.4 119.9 151.7 121.6 154.4 122.8 157.2 123.6 160.1 123.8 163.0 123.7 165.8 123.0 168.4 121.9 170.7 120.3 172.6 118.0 173.7 115.3 174.0 112.2 173.3 109.1 171.9 105.9 169.8 102.6 166.9 99.3 163.3 96.0 159.1 92.6 154.2 89.2 148.8 85.7 142.8 82.3 136.5 79.0 129.8 75.7 122.9 72.5 115.8 69.5 108.8 66.6 101.9 63.9 95.3 61.3 89.0 58.9 83.1 56.7 77.8 54.7 73.1 52.9 69.1 51.3 65.8 49.9 63.3 48.7 61.6 47.7 60.8 47.1 60.9 47.4 60.6 48.6 60.6 48.6 61.5 48.3 63.0 47.9 64.9 47.6 67.1 47.4 69.4 47.3 71.8 47.3 74.0 47.3 75.9 47.4 77.5 47.7 78.4 47.9 78.5 47.8 78.3 46.8 78.3 46.7 77.5 47.4 75.8 48.4 73.3 49.7 70.0 51.2 66.0 53.0 61.3 54.9 56.0 57.0 50.1 59.4 43.9 61.9 37.3 64.7 30.4 67.7 23.5 70.9Z";
  window.RC = { ARROW, SIGN, SIGN_FILL, reduce };
  const links = [["index.html", "Home", "home"], ["about.html", "About", "about"], ["works.html", "Works", "works"], ["page.html", "Giving Back", "page"], ["#", "Press"], ["#", "Contact"]];

  const head = document.querySelector('[data-slot="nav"]');
  if (head) {
    head.className = "rc-head";
    head.innerHTML = `<a class="rc-logo" href="index.html" aria-label="Home"><svg viewBox="0 0 640 140" fill="currentColor"><path d="${SIGN_FILL}"/></svg></a>
      <nav class="rc-menu t-20">${links.map(([h, t, p]) => `<a href="${h}"${p === page ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
      <button class="rc-burger" type="button" aria-label="Open Menu"><i></i><i></i></button>`;
    const mob = document.createElement("div");
    mob.className = "rc-mob";
    mob.innerHTML = `<button class="rc-mob__close" type="button">Close</button><nav class="rc-mob__links" data-label="Menu — one or two English words for the section name">${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav><div class="rc-mob__bot t-16"><span>@0000</span><span>Your Name</span></div>`;
    document.body.append(mob);
    head.querySelector(".rc-burger").addEventListener("click", () => mob.classList.add("is-open"));
    mob.querySelector(".rc-mob__close").addEventListener("click", () => mob.classList.remove("is-open"));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "rc-foot";
    foot.setAttribute("data-cursor-theme", "dark");
    foot.innerHTML = `<div class="rc-foot__dark"></div><div class="rc-foot__in">
      <div class="rc-foot__row">
        <div class="rc-foot__info"><h2 class="t-32" data-label="Your author English name here">Your Name</h2><p class="t-20">Your one service here<br>Your second task here<br>Your third task here</p></div>
        <div class="rc-foot__col"><p class="t-20">Browse</p><nav class="rc-foot__links">${links.map(([h, t, p]) => `<a href="${h}"${p === page ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav></div>
        <div class="rc-foot__col"><a class="rc-foot__ig" href="#" aria-label="Social Media"><svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 1.8A3.2 3.2 0 0 0 3.8 7v10A3.2 3.2 0 0 0 7 20.2h10a3.2 3.2 0 0 0 3.2-3.2V7A3.2 3.2 0 0 0 17 3.8Zm5 3.7a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4ZM17.5 5.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></svg></a></div>
      </div>
      <div class="rc-foot__row is-second"><div class="rc-foot__last"><div class="rc-foot__col"><p class="t-20">Press · Contact</p><a class="rc-btn is-white" href="#">Email ${ARROW}</a></div><a class="rc-foot__by" href="#">Your place of making here <svg class="rc-foot__mark" viewBox="0 0 64 12" fill="currentColor" aria-hidden="true"><rect x="0" y="2" width="6" height="8"/><rect x="8" y="2" width="6" height="8"/><rect x="16" y="2" width="6" height="8"/><rect x="24" y="2" width="6" height="8"/><rect x="32" y="2" width="6" height="8"/><rect x="40" y="2" width="6" height="8"/><rect x="48" y="2" width="6" height="8"/><rect x="56" y="2" width="6" height="8"/></svg></a></div></div>
      <div class="rc-sign" data-fx="draw-on-scroll"><svg viewBox="0 0 640 140"><path data-fx-part="path" d="${SIGN}"/></svg><p class="t-20" data-clock>0:00:00 KST</p></div>
    </div>`;
    const clock = foot.querySelector("[data-clock]");
    const tick = () => { const d = new Date(); clock.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")} KST`; };
    tick(); setInterval(tick, 1000);
  }

  if (!window.gsap) return;
  gsap.registerPlugin(...[window.ScrollTrigger, window.SplitText, window.CustomEase].filter(Boolean));

  // Lenis 1.3.17 — original defaults, only autoRaf turned on
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ autoRaf: true });
    RC.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Original initFooterParallax: while the footer head goes from below the screen to touching the top, its inside starts at −25% and the darkness lifts at .5
  // The Work page (original work) has no footer parallax script
  if (foot && !reduce && page !== "works") {
    gsap.timeline({ scrollTrigger: { trigger: foot, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true } })
      .from(foot.querySelector(".rc-foot__in"), { yPercent: -25, ease: "none" })
      .from(foot.querySelector(".rc-foot__dark"), { opacity: 0.5, ease: "none" }, "<");
  }
})();
