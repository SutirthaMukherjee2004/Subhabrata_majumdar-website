(function () {
  var data = window.SubhaResearchData || {};

  function text(node, value) {
    node.textContent = value == null ? "" : String(value);
    return node;
  }

  function el(tag, className, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) text(node, value);
    return node;
  }

  function renderProfile() {
    var target = document.getElementById("publicationProfile");
    if (!target || !data.profile) return;

    var papers = data.papers || [];
    var inspireCitations = papers.reduce(function (total, paper) {
      return total + (paper.citations || 0);
    }, 0);
    var stats = [
      ["INSPIRE papers", papers.length],
      ["INSPIRE citations", inspireCitations],
      ["OpenAlex works", data.profile.worksCount],
      ["OpenAlex citations", data.profile.citedByCount],
      ["OpenAlex h-index", data.profile.hIndex],
      ["OpenAlex i10-index", data.profile.i10Index]
    ];

    target.innerHTML = "";
    var heading = el("h3", null, data.profile.name);
    var meta = el("p", "profile-meta", data.profile.lastKnownInstitution + " · " + data.profile.source + " profile");
    var grid = el("div", "metric-grid");

    stats.forEach(function (item) {
      var box = el("div", "metric-box");
      box.appendChild(el("span", "metric-value", item[1]));
      box.appendChild(el("span", "metric-label", item[0]));
      grid.appendChild(box);
    });

    var links = el("p", "source-links");
    [
      ["OpenAlex", data.links && data.links.openalex],
      ["INSPIRE", data.links && data.links.inspire],
      ["Google Scholar search", data.links && data.links.googleScholarSearch]
    ].forEach(function (item, index) {
      if (!item[1]) return;
      if (index) links.appendChild(document.createTextNode(" · "));
      var a = el("a", null, item[0]);
      a.href = item[1];
      a.target = "_blank";
      a.rel = "noopener";
      links.appendChild(a);
    });

    target.appendChild(heading);
    target.appendChild(meta);
    target.appendChild(grid);
    target.appendChild(links);
  }

  function renderChart() {
    var target = document.getElementById("citationChart");
    var rows = data.citationYears || [];
    if (!target || !rows.length) return;

    var max = rows.reduce(function (acc, row) {
      return Math.max(acc, row.cited_by_count || 0);
    }, 1);

    target.innerHTML = "";
    rows.forEach(function (row) {
      var column = el("div", "citation-column");
      var value = row.cited_by_count || 0;
      var bar = el("span", "citation-bar");
      bar.style.height = Math.max(4, Math.round((value / max) * 160)) + "px";
      bar.title = row.year + ": " + value + " citations";
      column.appendChild(el("span", "citation-value", value));
      column.appendChild(bar);
      column.appendChild(el("span", "citation-year", row.year));
      target.appendChild(column);
    });
  }

  function renderPublications() {
    var target = document.getElementById("publicationList");
    var papers = data.papers || [];
    if (!target || !papers.length) return;

    target.innerHTML = "";
    papers.forEach(function (paper) {
      var item = el("li", "publication-item");
      var head = el("div", "publication-head");
      var title = el("a", "publication-title", paper.title);
      title.href = paper.url;
      title.target = "_blank";
      title.rel = "noopener";

      head.appendChild(title);
      head.appendChild(el("span", "publication-year", paper.year || "n.d."));

      var meta = el("p", "publication-meta", paper.authorText || "");
      var details = el("p", "publication-links");
      details.appendChild(el("span", null, (paper.citations || 0) + " INSPIRE citations"));
      if (paper.arxiv) {
        details.appendChild(document.createTextNode(" · "));
        var arxiv = el("a", null, "arXiv:" + paper.arxiv);
        arxiv.href = "https://arxiv.org/abs/" + paper.arxiv;
        arxiv.target = "_blank";
        arxiv.rel = "noopener";
        details.appendChild(arxiv);
      }
      if (paper.doi) {
        details.appendChild(document.createTextNode(" · "));
        var doi = el("a", null, "DOI");
        doi.href = "https://doi.org/" + paper.doi;
        doi.target = "_blank";
        doi.rel = "noopener";
        details.appendChild(doi);
      }
      if (paper.inspire) {
        details.appendChild(document.createTextNode(" · "));
        var inspire = el("a", null, "INSPIRE");
        inspire.href = paper.inspire;
        inspire.target = "_blank";
        inspire.rel = "noopener";
        details.appendChild(inspire);
      }

      item.appendChild(head);
      item.appendChild(meta);
      item.appendChild(details);
      target.appendChild(item);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderProfile();
    renderChart();
    renderPublications();
  });
})();
