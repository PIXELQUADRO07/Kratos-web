/**
 * Kratos OS — dynamic package browser
 * Reads assets/data/packages.json and renders the .kpkg package list.
 * To publish a new package: drop the .kpkg file in downloads/packages/
 * and add an entry to assets/data/packages.json — no HTML edits needed.
 */
(function () {
  "use strict";

  const DATA_URL = "assets/data/packages.json";

  const grid = document.getElementById("package-grid");
  const statusEl = document.getElementById("package-status");
  const searchInput = document.getElementById("package-search");
  const categorySelect = document.getElementById("package-category");
  const countEl = document.getElementById("package-count");

  if (!grid) return;

  let allPackages = [];

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function shortHash(hash) {
    if (!hash) return "not published yet";
    return hash.slice(0, 12) + "…";
  }

  function packageCard(pkg) {
    const hasHash = Boolean(pkg.sha256) && pkg.sha256 !== "REPLACE_WITH_REAL_SHA256";
    return `
      <article class="package-card" data-category="${escapeHtml(pkg.category || "other")}">
        <div class="package-card-head">
          <h3>${escapeHtml(pkg.name)}</h3>
          <span class="pill pill-category">${escapeHtml(pkg.category || "other")}</span>
        </div>
        <p class="package-desc">${escapeHtml(pkg.description || "")}</p>
        <dl class="package-meta">
          <div><dt>Version</dt><dd>${escapeHtml(pkg.version || "—")}</dd></div>
          <div><dt>Arch</dt><dd>${escapeHtml(pkg.arch || "—")}</dd></div>
          <div><dt>Size</dt><dd>${escapeHtml(pkg.size || "—")}</dd></div>
          <div><dt>Updated</dt><dd>${escapeHtml(pkg.updated || "—")}</dd></div>
        </dl>
        <div class="package-actions">
          <a class="button button-outline" href="${escapeHtml(pkg.file)}" download
            >Download .kpkg</a
          >
          <button
            type="button"
            class="checksum-copy"
            data-hash="${escapeHtml(pkg.sha256 || "")}"
            ${hasHash ? "" : "disabled"}
            title="${hasHash ? "Copy SHA-256 checksum" : "Checksum not published yet"}"
          >
            <span class="checksum-label">sha256</span>
            <code>${escapeHtml(shortHash(pkg.sha256))}</code>
          </button>
        </div>
      </article>`;
  }

  function render(packages) {
    if (packages.length === 0) {
      grid.innerHTML = `<p class="package-empty">No packages match your search.</p>`;
      return;
    }
    grid.innerHTML = packages.map(packageCard).join("");
  }

  function populateCategories(packages) {
    if (!categorySelect) return;
    const categories = Array.from(
      new Set(packages.map((p) => p.category || "other"))
    ).sort();
    categorySelect.innerHTML =
      `<option value="">All categories</option>` +
      categories
        .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
        .join("");
  }

  function applyFilters() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const category = categorySelect?.value || "";
    const filtered = allPackages.filter((pkg) => {
      const matchesQuery =
        !query ||
        pkg.name.toLowerCase().includes(query) ||
        (pkg.description || "").toLowerCase().includes(query);
      const matchesCategory = !category || pkg.category === category;
      return matchesQuery && matchesCategory;
    });
    render(filtered);
    if (countEl) {
      countEl.textContent =
        filtered.length === allPackages.length
          ? `${allPackages.length} package${allPackages.length === 1 ? "" : "s"} available`
          : `${filtered.length} of ${allPackages.length} packages`;
    }
  }

  async function init() {
    if (statusEl) statusEl.textContent = "Loading package index…";
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allPackages = Array.isArray(data.packages) ? data.packages : [];
      allPackages.sort((a, b) => a.name.localeCompare(b.name));

      populateCategories(allPackages);
      applyFilters();

      if (statusEl) {
        statusEl.textContent = data.updated
          ? `Index last updated ${data.updated}`
          : "";
      }
    } catch (err) {
      grid.innerHTML = `<p class="package-empty">Couldn't load the package index right now. Please try again later.</p>`;
      if (statusEl) statusEl.textContent = "";
      console.error("Kratos OS: failed to load packages.json", err);
    }
  }

  searchInput?.addEventListener("input", applyFilters);
  categorySelect?.addEventListener("change", applyFilters);

  grid.addEventListener("click", async (e) => {
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
})();
