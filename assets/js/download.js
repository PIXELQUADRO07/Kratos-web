/**
 * Kratos OS — dynamic ISO downloads
 * Reads assets/data/releases.json and renders one card per release.
 * To publish a new ISO: drop the file in downloads/iso/, set
 * "status": "available" and fill in "sha256" in assets/data/releases.json.
 */
(function () {
  "use strict";

  const DATA_URL = "assets/data/releases.json";
  const PACKAGES_URL = "assets/data/packages.json";
  const container = document.getElementById("iso-releases");
  const packageCountEl = document.getElementById("download-package-count");
  if (!container) return;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function releaseCard(rel) {
    const available = rel.status === "available";
    const hasHash = Boolean(rel.sha256);
    return `
      <article class="download-card featured">
        <div>
          <span class="label">${escapeHtml(rel.channel)} release</span>
          <h2>Kratos OS ${escapeHtml(rel.version)}</h2>
          <p>
            The installable image for ${escapeHtml(rel.arch)} systems. Boot it
            from a USB drive to begin.
          </p>
        </div>
        <div class="download-meta">
          <span>Architecture <b>${escapeHtml(rel.arch)}</b></span>
          <span>Channel <b>${escapeHtml(rel.channel)}</b></span>
          <span>Size <b>${escapeHtml(rel.size || "—")}</b></span>
          <span>Released <b>${escapeHtml(rel.date || "—")}</b></span>
        </div>
        ${
          available
            ? `<div class="iso-actions">
                <a class="button button-primary" href="${escapeHtml(rel.file)}" download
                  >Download ISO</a
                >
                <button
                  type="button"
                  class="checksum-copy"
                  data-hash="${escapeHtml(rel.sha256 || "")}"
                  ${hasHash ? "" : "disabled"}
                  title="${hasHash ? "Copy SHA-256 checksum" : "Checksum not published yet"}"
                >
                  <span class="checksum-label">sha256</span>
                  <code>${hasHash ? escapeHtml(rel.sha256.slice(0, 12) + "…") : "n/a"}</code>
                </button>
              </div>`
            : `<span class="button button-primary disabled" aria-disabled="true"
                >ISO coming soon</span
              >`
        }
      </article>`;
  }

  async function initPackageCount() {
    if (!packageCountEl) return;
    try {
      const res = await fetch(PACKAGES_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const count = Array.isArray(data.packages) ? data.packages.length : 0;
      packageCountEl.textContent = `${count} package${count === 1 ? "" : "s"} in the stable repository`;
    } catch {
      packageCountEl.textContent = "";
    }
  }

  async function init() {
    container.innerHTML = `<p class="package-status">Loading available images…</p>`;
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const releases = Array.isArray(data.releases) ? data.releases : [];

      if (releases.length === 0) {
        container.innerHTML = `
          <article class="download-card featured">
            <div>
              <span class="label">Latest image</span>
              <h2>Kratos OS x86_64</h2>
              <p>
                The installable image for modern 64-bit systems. Boot it from
                a USB drive to begin.
              </p>
            </div>
            <span class="button button-primary disabled" aria-disabled="true"
              >ISO coming soon</span
            >
          </article>`;
        return;
      }

      // Show available releases first, then upcoming ones.
      releases.sort((a, b) => (a.status === b.status ? 0 : a.status === "available" ? -1 : 1));
      container.innerHTML = releases.map(releaseCard).join("");
    } catch (err) {
      container.innerHTML = `<p class="package-empty">Couldn't load release information right now. Please try again later.</p>`;
      console.error("Kratos OS: failed to load releases.json", err);
    }
  }

  container.addEventListener("click", async (e) => {
    const btn = e.target.closest(".checksum-copy");
    if (!btn || btn.disabled) return;
    const hash = btn.getAttribute("data-hash");
    try {
      await navigator.clipboard.writeText(hash);
      const label = btn.querySelector(".checksum-label");
      const original = label.textContent;
      label.textContent = "copied!";
      setTimeout(() => (label.textContent = original), 1500);
    } catch {
      /* clipboard not available — silently ignore */
    }
  });

  init();
  initPackageCount();
})();
