/* Home page — filling the card rows, work cards and creator list, appear animation, swapping service numbers */
(() => {
  const SD = window.SD;
  const JACKETS = [["Digital single 「Trajectory to Tomorrow」", "Artist name", "Jacket with blue sky flower art"], ["Digital single ”Script”", "Artist name", "Yarn doll photo jacket"], ["0th mini album ”HUMOR”", "Artist name", "Person holding a guitar · Worn-down room"], ["Digital single ‹Live The Live›", "Artist name", "Hands and sheet music line-art jacket"], ["Digital single ‹ICE›", "Artist name", "Ice cream illustration · Mint color"], ["Digital single 「On My Road」", "Group name", "Group photo on the field"], ["Album no. 0 ”Album Title”", "Group name", "Group of five · in front of a white door"], ["Album No. 0 「AMENITY」", "Group name", "Red window artwork jacket"]];
  document.querySelector(".sd-hero__row [data-fx-part=track]").innerHTML = JACKETS.map(([t, a, l]) => `<a class="sd-jacket" href="detail.html"><span class="sd-zoom"><span class="sd-ph" data-label="${l} · Square"></span></span><p>${t}</p><small>${a}</small><span class="sd-arrow"></span></a>`).join("");

  const WORKS = [["Group Name album No. 0 ”Album Title”", "Group photo · dark interior · square"], ["Artist Name’s 0th mini album ”Title”", "Jumping person · Bright outdoors · Square"], ["Group name, album no. 0 ‹AMENITY›", "Jacket with red window painting · square"], ["Artist Name digital single ”Trajectory to Tomorrow”", "Blue sky flower print jacket · square"]];
  const credit = "「Song Title」<br>Lyrics/Composition/Arrangement: Your name here";
  document.querySelector(".sd-work__track").innerHTML = WORKS.map(([t, l]) => `<a class="sd-wcard" href="detail.html"><span class="sd-zoom"><span class="sd-ph" data-label="${l}"></span></span><div><p>${t}</p><span>${credit}</span><em class="sd-tag">Lyrics · Composition · Arrangement</em></div></a>`).join("");
  document.querySelector(".sd-work__list").innerHTML = WORKS.map(([t, l]) => `<li><a href="detail.html"><span class="sd-zoom"><span class="sd-ph" data-label="${l}"></span></span><div><p>${t}</p><span>${credit}</span><em class="sd-tag">Lyrics · Composition · Arrangement</em></div></a></li>`).join("");

  const PEOPLE = [["Name Romaji", "Your name here", "Creator", "Person photo · Dark background"], ["Name Romaji", "Your name here", "Creator", "Logo slot · No photo"], ["Name Romaji", "Your name here", "Creator", "Logo slot · No photo"], ["Name Romaji", "NAME", "Creator", "Logo slot · No photo"], ["Name Romaji", "Your name here", "Creator", "Person playing guitar · stage lighting"], ["name romaji", "name here", "Artist", "Female portrait photo · light background"]];
  document.querySelector(".sd-creator__list").innerHTML = PEOPLE.map(([r, n, role, l]) => `<li><a href="#"><span class="sd-ph" data-label="${l}"></span><div><small>${r}</small><p>${n}</p><span>${role}</span></div><span class="sd-arrow"></span></a></li>`).join("");
  SD.fill();

  // Service illustration — composer at a keyboard (in place of the original art, redrawn in two colors, navy and sky blue)
  const ART = `<svg viewBox="0 0 360 360" aria-hidden="true">
    <g style="fill: var(--kf-accent)">
      <rect x="196" y="78" width="96" height="62" rx="6"/><rect x="238" y="140" width="12" height="20"/><rect x="214" y="158" width="58" height="6" rx="3"/>
      <rect x="300" y="96" width="34" height="58" rx="5"/>
      <rect x="40" y="168" width="300" height="10" rx="3"/><rect x="60" y="178" width="8" height="120"/><rect x="314" y="178" width="8" height="120"/>
      <path d="M128 150c-14 0-22 10-20 24l6 46h40l8-44c2-14-10-26-34-26Z"/>
      <path d="M118 220h44l26 58h-14l-24-44h-20Z"/><path d="M114 228l-4 70h14l6-62Z"/>
      <rect x="96" y="298" width="56" height="8" rx="4"/><rect x="120" y="262" width="8" height="36"/>
      <circle cx="134" cy="120" r="20"/><path d="M112 112c4-18 40-22 46 0l6 2-6 4c-12-4-30-4-46 0Z"/>
    </g>
    <g style="fill: var(--kf-accent-text)">
      <rect x="204" y="86" width="80" height="46" rx="3"/>
      <rect x="150" y="152" width="170" height="16" rx="3"/>
      <circle cx="317" cy="112" r="8"/><circle cx="317" cy="138" r="5"/>
      <path d="M150 168l22 30h16l-20-30Z"/>
      <circle cx="270" cy="52" r="4"/><rect x="273" y="34" width="2" height="18"/><circle cx="292" cy="44" r="3"/><rect x="294" y="30" width="2" height="14"/>
    </g>
    <g style="stroke: var(--kf-surface)" stroke-width="2" fill="none"><path d="M210 110h8l4-12 6 24 6-18 6 10 6-6 6 8h16"/></g>
    <g style="fill: var(--kf-surface)"><rect x="156" y="155" width="6" height="10"/><rect x="168" y="155" width="6" height="10"/><rect x="180" y="155" width="6" height="10"/><rect x="192" y="155" width="6" height="10"/><rect x="204" y="155" width="6" height="10"/><rect x="216" y="155" width="6" height="10"/><rect x="228" y="155" width="6" height="10"/><rect x="240" y="155" width="6" height="10"/><rect x="252" y="155" width="6" height="10"/><rect x="264" y="155" width="6" height="10"/><rect x="276" y="155" width="6" height="10"/><rect x="288" y="155" width="6" height="10"/><rect x="300" y="155" width="6" height="10"/></g>
  </svg>`;
  document.querySelectorAll(".sd-service__art").forEach((el) => { el.innerHTML = ART; });


  // Services — when the second block reaches 30% from the bottom of the screen, the left number and name fade over .5s to 02, and back to 01 when it leaves
  const second = document.querySelectorAll(".sd-service__item")[1];
  const pairs = [...document.querySelectorAll("#service_num, #service_title")].map((b) => [...b.children]);
  pairs.forEach(([a]) => a.classList.add("is-show"));
  let on2 = false;
  const swap = (to2) => pairs.forEach(([a, b]) => { (to2 ? a : b).classList.replace("is-show", "is-hidden") || (to2 ? a : b).classList.add("is-hidden"); (to2 ? b : a).classList.remove("is-hidden"); (to2 ? b : a).classList.add("is-show"); });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !on2) { on2 = true; swap(true); }
    else if (!e.isIntersecting && on2) { on2 = false; swap(false); }
  }, { rootMargin: "0px 0px -30% 0px" }).observe(second);
})();
