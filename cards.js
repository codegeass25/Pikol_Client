/* ---------------------------------------------------------------------------
   cards.js — card-first presentation layer.

   Every list in the system is rendered by the existing page code as a normal
   <table class="data"> inside a .table-wrap. This layer turns those rows into
   responsive cards WITHOUT re-rendering them: it only adds attributes/classes,
   so every existing event handler, data-* hook and inline button keeps working.

   - each <td> receives data-label="<column header>"
   - the last column (actions) is flagged so it can render as a card footer
   - full-width rows (colspan, e.g. empty states) stay full width
   Layout itself lives in styles.css (.data.as-cards).
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  function headers(table) {
    var hr = table.tHead && table.tHead.rows[0];
    if (!hr) return null;
    return Array.prototype.map.call(hr.cells, function (th) {
      return (th.textContent || '').trim();
    });
  }

  function decorate(table) {
    var labels = headers(table);
    if (!labels) return; /* nested key/value tables stay as-is */
    table.classList.add('as-cards');
    var bodies = table.tBodies;
    for (var b = 0; b < bodies.length; b++) {
      var rows = bodies[b].rows;
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        if (row.cells.length === 1 && row.cells[0].colSpan > 1) {
          row.classList.add('is-fullwidth');
          continue;
        }
        row.classList.add('is-card');
        for (var c = 0; c < row.cells.length; c++) {
          var cell = row.cells[c];
          var label = labels[c] || '';
          if (label) cell.setAttribute('data-label', label);
          else cell.setAttribute('data-label', '');
          var isLast = c === row.cells.length - 1;
          var looksLikeActions = /action/i.test(label) || (!label && isLast);
          if (isLast && (looksLikeActions || cell.querySelector('button, a'))) {
            cell.classList.add('cell-actions');
          }
        }
      }
    }
  }

  function scan(root) {
    var tables = (root || document).querySelectorAll('.table-wrap > table.data');
    Array.prototype.forEach.call(tables, decorate);
  }

  function boot() {
    scan(document);
    /* Page code replaces tbody.innerHTML on every load / realtime update. */
    var pending = null;
    var mo = new MutationObserver(function () {
      if (pending) return;
      pending = window.requestAnimationFrame(function () {
        pending = null;
        scan(document);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
