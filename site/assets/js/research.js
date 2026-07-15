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

  function formatNumber(value) {
    var number = Number(value || 0);
    return number.toLocaleString("en-US");
  }

  function renderProfile() {
    var target = document.getElementById("publicationProfile");
    if (!target) return;

    var papers = data.papers || [];
    var scholar = data.googleScholar || {};
    var inspire = data.inspire || {};
    var stats = [
      ["Google Scholar articles", scholar.paperCount || papers.length],
      ["Google Scholar citations", scholar.citedBy],
      ["Scholar h-index", scholar.hIndex],
      ["Scholar i10-index", scholar.i10Index],
      ["Since 2021 citations", scholar.citedBySince2021],
      ["INSPIRE papers", inspire.paperCount],
      ["INSPIRE citations", inspire.citations],
      ["Scholar-INSPIRE matches", inspire.matchedGoogleScholarPapers]
    ];

    target.innerHTML = "";
    var heading = el("h3", null, scholar.name || (data.profile && data.profile.name) || "Subhabrata Majumdar");
    var metaParts = [];
    if (scholar.affiliation) metaParts.push(scholar.affiliation);
    if (scholar.verifiedEmailDomain) metaParts.push("Verified email at " + scholar.verifiedEmailDomain);
    if (scholar.fetched) metaParts.push("Fetched " + scholar.fetched);
    var meta = el("p", "profile-meta", metaParts.join(" · "));
    var interests = el("p", "profile-interests", (scholar.interests || []).join(" · "));
    var grid = el("div", "metric-grid");

    stats.forEach(function (item) {
      var box = el("div", "metric-box");
      box.appendChild(el("span", "metric-value", formatNumber(item[1])));
      box.appendChild(el("span", "metric-label", item[0]));
      grid.appendChild(box);
    });

    var links = el("p", "source-links");
    [
      ["Google Scholar", data.links && data.links.googleScholar],
      ["INSPIRE", data.links && data.links.inspire]
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
    if (interests.textContent) target.appendChild(interests);
    target.appendChild(grid);
    target.appendChild(links);
  }

  function renderChart() {
    var target = document.getElementById("citationChart");
    var rows = (data.googleScholar && data.googleScholar.citationYears) || data.citationYears || [];
    if (!target || !rows.length) return;

    var max = rows.reduce(function (acc, row) {
      return Math.max(acc, row.citations || row.cited_by_count || 0);
    }, 1);

    target.innerHTML = "";
    rows.forEach(function (row) {
      var column = el("div", "citation-column");
      var value = row.citations || row.cited_by_count || 0;
      var bar = el("span", "citation-bar");
      bar.style.height = Math.max(4, Math.round((value / max) * 160)) + "px";
      bar.title = row.year + ": " + value + " citations";
      column.appendChild(el("span", "citation-value", formatNumber(value)));
      column.appendChild(bar);
      column.appendChild(el("span", "citation-year", row.year));
      target.appendChild(column);
    });
  }

  function renderPaperYears() {
    var target = document.getElementById("paperYearChart");
    var rows = (data.googleScholar && data.googleScholar.papersByYear) || [];
    if (!target || !rows.length) return;

    var max = rows.reduce(function (acc, row) {
      return Math.max(acc, row.papers || 0);
    }, 1);

    target.innerHTML = "";
    rows.forEach(function (row) {
      var column = el("div", "paper-year-column");
      var value = row.papers || 0;
      var bar = el("span", "paper-year-bar");
      bar.style.height = Math.max(4, Math.round((value / max) * 78)) + "px";
      bar.title = row.year + ": " + value + " papers";
      column.appendChild(el("span", "paper-year-value", formatNumber(value)));
      column.appendChild(bar);
      column.appendChild(el("span", "paper-year-label", row.year));
      target.appendChild(column);
    });
  }

  function renderCollaborators() {
    var target = document.getElementById("collaboratorList");
    var collaborators = data.collaborators || [];
    if (!target || !collaborators.length) return;

    target.innerHTML = "";
    collaborators.forEach(function (collaborator) {
      var item = el("span", "collaborator-chip");
      item.appendChild(el("strong", null, collaborator.name));
      item.appendChild(document.createTextNode(" " + formatNumber(collaborator.paperCount) + " papers"));
      target.appendChild(item);
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
      title.href = paper.googleScholarUrl || paper.url;
      title.target = "_blank";
      title.rel = "noopener";

      head.appendChild(title);
      head.appendChild(el("span", "publication-year", paper.year || "n.d."));

      var authorLine = paper.fullAuthorText || paper.authorText || "";
      var meta = el("p", "publication-meta", authorLine ? "Authors / collaborators: " + authorLine : "");
      if (paper.authorSource) meta.title = paper.authorSource;
      var venue = el("p", "publication-venue", paper.venue || "");
      var details = el("p", "publication-links");
      var scholarCitations = el("span", "citation-pill", formatNumber(paper.googleScholarCitations) + " Google Scholar citations");
      details.appendChild(scholarCitations);
      if (paper.inspireCitations != null) {
        details.appendChild(document.createTextNode(" · "));
        details.appendChild(el("span", "citation-pill", formatNumber(paper.inspireCitations) + " INSPIRE citations"));
      }
      if (paper.googleScholarCitationsUrl) {
        details.appendChild(document.createTextNode(" · "));
        var citedBy = el("a", null, "Scholar cited-by");
        citedBy.href = paper.googleScholarCitationsUrl;
        citedBy.target = "_blank";
        citedBy.rel = "noopener";
        details.appendChild(citedBy);
      }
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
      details.appendChild(document.createTextNode(" · "));
      var scholarLink = el("a", null, "Google Scholar");
      scholarLink.href = paper.googleScholarUrl || (data.links && data.links.googleScholar);
      scholarLink.target = "_blank";
      scholarLink.rel = "noopener";
      details.appendChild(scholarLink);

      item.appendChild(head);
      if (meta.textContent) item.appendChild(meta);
      if (venue.textContent) item.appendChild(venue);
      item.appendChild(details);
      target.appendChild(item);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderProfile();
    renderChart();
    renderPaperYears();
    renderCollaborators();
    renderPublications();
  });
})();
