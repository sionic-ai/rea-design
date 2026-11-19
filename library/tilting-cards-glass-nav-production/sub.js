/* Subpage — work grid · news row fill */
(() => {
  const SD = window.SD;
  const WORKS = [["Group Name album No. 0 ”Album Title”", "Group of five · in front of a white door"], ["Artist Name’s 0th mini album ”Title”", "Jumping figure · bright outdoors"], ["Group name, album no. 0 ‹AMENITY›", "Red window artwork jacket"], ["Artist Name digital single ”SMILE GEMS”", "Pink jewel lettering jacket"], ["Artist Name digital single ”Trajectory to Tomorrow”", "Blue sky flower illustration"], ["Artist Name digital single ”Script”", "Yarn Doll Photo"], ["Artist Name mini album ‹HUMOR›", "Person holding a guitar · Worn-down room"], ["Artist Name digital single ”Live The Live”", "Hand and sheet music line art"], ["Artist Name digital single ”ICE”", "Ice cream illustration · Mint color"], ["Group Name digital single ”On My Road”", "Group photo on the field"], ["Artist Name, Single No. 0 ”Spring Sound”", "Person upper body · Blue shirt"], ["Artist Name digital single ”Eternal”", "Person’s face · Light background"]];
  const grid = document.querySelector(".sd-grid");
  if (grid) grid.innerHTML = WORKS.map(([t, l]) => `<a href="detail.html"><span class="sd-zoom"><span class="sd-ph" data-label="${l} · Square"></span></span><p>${t}</p><span>「Song Title」<br>Lyrics/Composition/Arrangement: Your name here</span><div class="sd-tags"><em class="sd-tag">Lyrics · Composition · Arrangement</em><em class="sd-tag">Music production</em></div></a>`).join("");
  const rows = document.querySelector(".sd-newslist .sd-rows");
  if (rows) {
    const cats = ["Work Info", "Work Info", "Work Info", "Work Info", "Work Info", "Work Info", "Work Info", "Work Info", "Media", "Work Info", "Work Info", "Work Info", "Media", "Work Info"];
    rows.innerHTML = cats.map((c, i) => `<li><p><time>0000.00.${String(28 - i).padStart(2, "0")}</time><span class="sd-tag">${c}</span></p><a href="#">0000.00.00 ${c === "Media" ? "Your one-line title for a broadcast or media appearance goes here" : "Release!! Artist name and work title ”Title”"}</a></li>`).join("");
  }
  SD.fill();
})();
