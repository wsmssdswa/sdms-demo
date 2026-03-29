(function () {
  const pageKey = window.PRD_VIEWER_PAGE_KEY;
  const docRegistry = window.PRD_VIEWER_DOCS || {};
  const mapRegistry = window.PRD_VIEWER_MAPS || {};
  const docPayload = pageKey ? docRegistry[pageKey] : null;
  const mapPayload = pageKey ? mapRegistry[pageKey] : null;

  const markdownSource = docPayload && (docPayload.markdown || docPayload.value || docPayload);
  const bindings = mapPayload && Array.isArray(mapPayload.bindings) ? mapPayload.bindings : [];

  const pagePrdBtn = document.getElementById('pagePrdBtn');
  const pagePrdViewer = document.getElementById('pagePrdViewer');
  const pagePrdClose = document.getElementById('pagePrdClose');
  const pagePrdSearch = document.getElementById('pagePrdSearch');
  const pagePrdLocateBtn = document.getElementById('pagePrdLocateBtn');
  const pagePrdCurrent = document.getElementById('pagePrdCurrent');
  const pagePrdToc = document.getElementById('pagePrdToc');
  const pagePrdContent = document.getElementById('pagePrdContent');
  const pagePrdTitle = document.getElementById('pagePrdTitle');

  if (!pageKey || !markdownSource || !pagePrdBtn || !pagePrdViewer || !pagePrdClose || !pagePrdSearch || !pagePrdLocateBtn || !pagePrdCurrent || !pagePrdToc || !pagePrdContent) {
    return;
  }

  const headingIdMap = {};
  bindings.forEach((binding) => {
    if (binding.headingText && binding.targetId) {
      headingIdMap[binding.headingText] = binding.targetId;
    }
  });

  const state = {
    open: false,
    locateMode: false,
    activeRef: '',
    toc: []
  };

  if (pagePrdTitle && mapPayload && mapPayload.pageTitle) {
    pagePrdTitle.textContent = mapPayload.pageTitle;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderInline(text) {
    let html = escapeHtml(text);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="page-prd-link" href="$2" target="_blank" rel="noreferrer">$1</a>');
    html = html.replace(/`([^`]+)`/g, '<code class="page-prd-inline-code">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return html;
  }

  function renderMultilineInline(lines) {
    return lines.map((line) => renderInline(line)).join('<br>');
  }

  function splitTableRow(line) {
    return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((item) => item.trim());
  }

  function isTableSeparator(line) {
    return /^\|?[\s:-]+(\|[\s:-]+)+\|?$/.test(line.trim());
  }

  function buildHeadingId(text, fallbackIndex) {
    if (headingIdMap[text]) return headingIdMap[text];
    const normalized = text
      .toLowerCase()
      .replace(/[【】\[\]（）()]/g, '')
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return normalized || `prd-heading-${fallbackIndex}`;
  }

  function parseMarkdown(markdown) {
    const lines = String(markdown).replace(/\r/g, '').split('\n');
    const htmlParts = [];
    const toc = [];
    let paragraphLines = [];
    let listItems = [];
    let listType = '';
    let quoteLines = [];
    let tableLines = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines = [];
    let headingIndex = 0;

    function flushParagraph() {
      if (!paragraphLines.length) return;
      htmlParts.push(`<p class="page-prd-paragraph">${renderMultilineInline(paragraphLines)}</p>`);
      paragraphLines = [];
    }

    function flushList() {
      if (!listItems.length) return;
      const tag = listType === 'ordered' ? 'ol' : 'ul';
      htmlParts.push(`<${tag} class="page-prd-list">${listItems.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`);
      listItems = [];
      listType = '';
    }

    function flushQuote() {
      if (!quoteLines.length) return;
      htmlParts.push(`<blockquote class="page-prd-quote">${quoteLines.map((line) => `<p>${renderInline(line)}</p>`).join('')}</blockquote>`);
      quoteLines = [];
    }

    function flushTable() {
      if (!tableLines.length) return;
      const headerCells = splitTableRow(tableLines[0]);
      const bodyLines = tableLines.slice(isTableSeparator(tableLines[1] || '') ? 2 : 1);
      htmlParts.push(`
        <div class="page-prd-table-wrap">
          <table class="page-prd-table">
            <thead>
              <tr>${headerCells.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${bodyLines.map((line) => {
                const cells = splitTableRow(line);
                return `<tr>${cells.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      `);
      tableLines = [];
    }

    function flushCodeBlock() {
      if (!codeLines.length) return;
      const codeAttr = codeLanguage ? ` data-lang="${escapeHtml(codeLanguage)}"` : '';
      htmlParts.push(`<pre class="page-prd-code-block"><code${codeAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      codeLines = [];
      codeLanguage = '';
    }

    function flushAll() {
      flushParagraph();
      flushList();
      flushQuote();
      flushTable();
    }

    lines.forEach((line) => {
      const trimmed = line.trimEnd();
      const compact = trimmed.trim();

      if (inCodeBlock) {
        if (compact.startsWith('```')) {
          inCodeBlock = false;
          flushCodeBlock();
        } else {
          codeLines.push(trimmed);
        }
        return;
      }

      if (compact.startsWith('```')) {
        flushAll();
        inCodeBlock = true;
        codeLanguage = compact.replace(/^```/, '').trim();
        codeLines = [];
        return;
      }

      if (!compact) {
        flushAll();
        return;
      }

      if (/^---+$/.test(compact)) {
        flushAll();
        htmlParts.push('<hr class="page-prd-divider">');
        return;
      }

      const headingMatch = compact.match(/^(#{1,4})\s+(.*)$/);
      if (headingMatch) {
        flushAll();
        headingIndex += 1;
        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();
        const headingId = buildHeadingId(title, headingIndex);
        htmlParts.push(`<h${level} class="page-prd-heading level-${level}" id="${headingId}">${renderInline(title)}</h${level}>`);
        if (level >= 2 && level <= 4) {
          toc.push({ id: headingId, title, level });
        }
        return;
      }

      if (compact.startsWith('>')) {
        flushParagraph();
        flushList();
        flushTable();
        quoteLines.push(compact.replace(/^>\s?/, ''));
        return;
      }

      const orderedMatch = compact.match(/^\d+\.\s+(.*)$/);
      if (orderedMatch) {
        flushParagraph();
        flushQuote();
        flushTable();
        if (listType && listType !== 'ordered') flushList();
        listType = 'ordered';
        listItems.push(orderedMatch[1]);
        return;
      }

      const bulletMatch = compact.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        flushParagraph();
        flushQuote();
        flushTable();
        if (listType && listType !== 'unordered') flushList();
        listType = 'unordered';
        listItems.push(bulletMatch[1]);
        return;
      }

      if (/^\|.*\|$/.test(compact)) {
        flushParagraph();
        flushList();
        flushQuote();
        tableLines.push(compact);
        return;
      }

      paragraphLines.push(compact);
    });

    if (inCodeBlock) flushCodeBlock();
    flushAll();

    return {
      html: htmlParts.join(''),
      toc
    };
  }

  function bindControls() {
    bindings.forEach((binding) => {
      document.querySelectorAll(binding.selector).forEach((node) => {
        node.dataset.prdRef = binding.targetId || '';
        node.dataset.prdHeading = binding.headingText || '';
        node.dataset.prdLabel = binding.label || binding.selector;
        node.dataset.prdLevel = binding.level || 'control';
        node.classList.add('page-prd-target');
      });
    });
  }

  function renderToc(keyword) {
    const normalizedKeyword = String(keyword || '').trim().toLowerCase();
    const tocItems = state.toc.filter((item) => !normalizedKeyword || item.title.toLowerCase().includes(normalizedKeyword));
    pagePrdToc.innerHTML = tocItems.map((item) => `
      <button class="page-prd-toc-item level-${item.level} ${state.activeRef === item.id ? 'active' : ''}" type="button" data-prd-jump="${item.id}">
        ${escapeHtml(item.title)}
      </button>
    `).join('') || '<div class="page-prd-toc-empty">未找到匹配章节</div>';
  }

  function updateCurrentText(text) {
    pagePrdCurrent.textContent = text || '当前未定位到具体控件';
  }

  function openViewer() {
    state.open = true;
    pagePrdViewer.classList.add('open');
    pagePrdViewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('page-prd-viewer-open');
  }

  function closeViewer() {
    state.open = false;
    state.locateMode = false;
    pagePrdViewer.classList.remove('open');
    pagePrdViewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('page-prd-viewer-open', 'page-prd-locate-mode');
    pagePrdLocateBtn.classList.remove('active');
    pagePrdLocateBtn.textContent = '控件定位模式';
  }

  function clearCurrentControlHighlight() {
    document.querySelectorAll('.is-prd-current-target').forEach((item) => item.classList.remove('is-prd-current-target'));
  }

  function highlightControlNode(node) {
    clearCurrentControlHighlight();
    if (!node) return;
    node.classList.add('is-prd-current-target');
    window.setTimeout(() => {
      node.classList.remove('is-prd-current-target');
    }, 2200);
  }

  function highlightDocNode(node) {
    pagePrdContent.querySelectorAll('.is-doc-current').forEach((item) => item.classList.remove('is-doc-current'));
    if (!node) return;
    node.classList.add('is-doc-current');
    window.setTimeout(() => {
      node.classList.remove('is-doc-current');
    }, 2200);
  }

  function escapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    return String(value).replace(/[^a-zA-Z0-9\-_]/g, '\\$&');
  }

  function jumpToRef(ref, label) {
    if (!ref) return;
    openViewer();
    state.activeRef = ref;
    renderToc(pagePrdSearch.value);
    const target = pagePrdContent.querySelector(`#${escapeSelector(ref)}`);
    if (!target) {
      updateCurrentText(`未找到“${label || ref}”对应的文档位置`);
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    highlightDocNode(target);
    updateCurrentText(`当前定位：${label || target.textContent.trim()}`);
  }

  function jumpToBinding(binding, node) {
    if (!binding) return;
    if (binding.targetId) {
      jumpToRef(binding.targetId, binding.label);
      highlightControlNode(node);
      return;
    }
    if (binding.headingText) {
      const tocMatch = state.toc.find((item) => item.title === binding.headingText);
      if (tocMatch) {
        jumpToRef(tocMatch.id, binding.label);
        highlightControlNode(node);
      }
    }
  }

  function setLocateMode(active) {
    state.locateMode = active;
    document.body.classList.toggle('page-prd-locate-mode', active);
    pagePrdLocateBtn.classList.toggle('active', active);
    pagePrdLocateBtn.textContent = active ? '退出控件定位' : '控件定位模式';
    updateCurrentText(active ? '定位模式已开启：点击页面控件即可跳转到文档对应位置' : state.activeRef ? pagePrdCurrent.textContent : '当前未定位到具体控件');
  }

  function getDomDistance(fromNode, toNode) {
    let current = fromNode;
    let distance = 0;
    while (current && current !== toNode) {
      current = current.parentElement;
      distance += 1;
    }
    return current === toNode ? distance : Number.MAX_SAFE_INTEGER;
  }

  function resolveBindingFromTarget(eventTarget) {
    const controlCandidates = [];
    const sectionCandidates = [];

    bindings.forEach((binding, index) => {
      const matchedNode = eventTarget.closest(binding.selector);
      if (!matchedNode) return;
      const candidate = {
        binding,
        node: matchedNode,
        index,
        distance: getDomDistance(eventTarget, matchedNode)
      };
      if ((binding.level || 'control') === 'section') {
        sectionCandidates.push(candidate);
      } else {
        controlCandidates.push(candidate);
      }
    });

    const sortCandidates = function (items) {
      return items.sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return a.index - b.index;
      });
    };

    if (controlCandidates.length) return sortCandidates(controlCandidates)[0];
    if (sectionCandidates.length) return sortCandidates(sectionCandidates)[0];
    return null;
  }

  const parsed = parseMarkdown(markdownSource);
  state.toc = parsed.toc;
  pagePrdContent.innerHTML = parsed.html;
  renderToc('');
  bindControls();

  let rebindScheduled = false;
  const observer = new MutationObserver(() => {
    if (rebindScheduled) return;
    rebindScheduled = true;
    window.requestAnimationFrame(() => {
      bindControls();
      rebindScheduled = false;
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  pagePrdBtn.addEventListener('click', () => {
    if (state.open) {
      closeViewer();
      return;
    }
    openViewer();
  });

  pagePrdClose.addEventListener('click', closeViewer);

  pagePrdLocateBtn.addEventListener('click', () => {
    if (!state.open) openViewer();
    setLocateMode(!state.locateMode);
  });

  pagePrdSearch.addEventListener('input', (event) => {
    renderToc(event.target.value);
  });

  pagePrdSearch.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const firstMatch = pagePrdToc.querySelector('[data-prd-jump]');
    if (!firstMatch) return;
    jumpToRef(firstMatch.dataset.prdJump, firstMatch.textContent.trim());
  });

  pagePrdToc.addEventListener('click', (event) => {
    const button = event.target.closest('[data-prd-jump]');
    if (!button) return;
    jumpToRef(button.dataset.prdJump, button.textContent.trim());
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('#pagePrdViewer')) return;
    const shouldLocate = event.altKey || state.locateMode;
    if (!shouldLocate) return;
    const resolved = resolveBindingFromTarget(event.target);
    if (!resolved) return;
    event.preventDefault();
    event.stopPropagation();
    jumpToBinding(resolved.binding, resolved.node);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.open) {
      closeViewer();
    }
  });
})();
