(function () {
  var pageKey = window.PRD_VIEWER_PAGE_KEY;
  var docRegistry = window.PRD_VIEWER_DOCS || {};
  var mapRegistry = window.PRD_VIEWER_MAPS || {};
  var docPayload = pageKey ? docRegistry[pageKey] : null;
  var mapPayload = pageKey ? mapRegistry[pageKey] : null;

  var markdownSource = docPayload && docPayload.markdown ? docPayload.markdown : '';
  var bindings = mapPayload && Array.isArray(mapPayload.bindings) ? mapPayload.bindings : [];

  var pagePrdBtn = document.getElementById('pagePrdBtn');
  var pagePrdViewer = document.getElementById('pagePrdViewer');
  var pagePrdClose = document.getElementById('pagePrdClose');
  var pagePrdSearch = document.getElementById('pagePrdSearch');
  var pagePrdLocateBtn = document.getElementById('pagePrdLocateBtn');
  var pagePrdCurrent = document.getElementById('pagePrdCurrent');
  var pagePrdToc = document.getElementById('pagePrdToc');
  var pagePrdContent = document.getElementById('pagePrdContent');
  var pagePrdTitle = document.getElementById('pagePrdTitle');

  if (!pageKey || !pagePrdBtn || !pagePrdViewer || !pagePrdClose || !pagePrdSearch || !pagePrdLocateBtn || !pagePrdCurrent || !pagePrdToc || !pagePrdContent) {
    return;
  }

  const headingIdMap = {};
  const usedHeadingIds = new Set();
  bindings.forEach((binding) => {
    if (binding.headingText && binding.targetId) {
      headingIdMap[binding.headingText] = binding.targetId;
    }
  });

  const state = {
    open: false,
    locateMode: false,
    activeRef: '',
    toc: [],
    maximized: false
  };

  if (pagePrdTitle && mapPayload && mapPayload.pageTitle) {
    pagePrdTitle.textContent = mapPayload.pageTitle;
  }

  /* ---------- 弹窗尺寸与位置管理 ---------- */
  const DIALOG_W = 820;
  const DIALOG_H = Math.round(window.innerHeight * 0.72);
  const MIN_W = 560;
  const MIN_H = 400;

  function centerDialog() {
    const w = Math.min(DIALOG_W, window.innerWidth - 40);
    const h = Math.min(DIALOG_H, window.innerHeight - 60);
    pagePrdViewer.style.width = w + 'px';
    pagePrdViewer.style.height = h + 'px';
    pagePrdViewer.style.left = Math.max(0, (window.innerWidth - w) / 2) + 'px';
    pagePrdViewer.style.top = Math.max(0, (window.innerHeight - h) / 2) + 'px';
  }

  /* ---------- 拖拽 ---------- */
  function enableDrag() {
    const header = pagePrdViewer.querySelector('.page-prd-head');
    if (!header) return;

    header.addEventListener('mousedown', function (e) {
      if (e.target.closest('.page-prd-close, .page-prd-maximize')) return;
      if (state.maximized) return;
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = pagePrdViewer.offsetLeft;
      const startTop = pagePrdViewer.offsetTop;

      function onMove(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const newLeft = Math.max(0, Math.min(startLeft + dx, window.innerWidth - pagePrdViewer.offsetWidth));
        const newTop = Math.max(0, Math.min(startTop + dy, window.innerHeight - pagePrdViewer.offsetHeight));
        pagePrdViewer.style.left = newLeft + 'px';
        pagePrdViewer.style.top = newTop + 'px';
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  /* ---------- 缩放 ---------- */
  function enableResize() {
    const handle = pagePrdViewer.querySelector('.page-prd-resize');
    if (!handle) return;

    handle.addEventListener('mousedown', function (e) {
      if (state.maximized) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = pagePrdViewer.offsetWidth;
      const startH = pagePrdViewer.offsetHeight;

      function onMove(ev) {
        const newW = Math.max(MIN_W, Math.min(window.innerWidth - pagePrdViewer.offsetLeft, startW + (ev.clientX - startX)));
        const newH = Math.max(MIN_H, Math.min(window.innerHeight - pagePrdViewer.offsetTop, startH + (ev.clientY - startY)));
        pagePrdViewer.style.width = newW + 'px';
        pagePrdViewer.style.height = newH + 'px';
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  /* ---------- 最大化/还原 ---------- */
  function toggleMaximize() {
    const maxBtn = pagePrdViewer.querySelector('.page-prd-maximize');
    if (!state.maximized) {
      // 保存当前位置和尺寸
      state.prevRect = {
        width: pagePrdViewer.style.width,
        height: pagePrdViewer.style.height,
        left: pagePrdViewer.style.left,
        top: pagePrdViewer.style.top
      };
      pagePrdViewer.classList.add('maximized');
      state.maximized = true;
      if (maxBtn) { maxBtn.title = '还原'; maxBtn.innerHTML = '<i class="ri-fullscreen-exit-line"></i>'; }
    } else {
      // 还原
      pagePrdViewer.classList.remove('maximized');
      if (state.prevRect) {
        pagePrdViewer.style.width = state.prevRect.width;
        pagePrdViewer.style.height = state.prevRect.height;
        pagePrdViewer.style.left = state.prevRect.left;
        pagePrdViewer.style.top = state.prevRect.top;
      }
      state.maximized = false;
      if (maxBtn) { maxBtn.title = '最大化'; maxBtn.innerHTML = '<i class="ri-fullscreen-line"></i>'; }
    }
  }

  /* ---------- Markdown渲染 ---------- */
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
      .replace(/[^a-z0-9一-龥]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let id = normalized || `prd-heading-${fallbackIndex}`;
    if (usedHeadingIds.has(id)) {
      let counter = 2;
      while (usedHeadingIds.has(`${id}-${counter}`)) counter++;
      id = `${id}-${counter}`;
    }
    usedHeadingIds.add(id);
    return id;
  }

  function parseMarkdown(markdown) {
    usedHeadingIds.clear();
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
    const headingCounters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    function hierarchicalNumber(level) {
      for (let i = level + 1; i <= 9; i++) headingCounters[i] = 0;
      headingCounters[level]++;
      let start = 1;
      while (start < level && headingCounters[start] === 0) start++;
      return headingCounters.slice(start, level + 1).join('.');
    }

    function stripLeadingNumber(text) {
      return text.replace(/^(\d+\.)*\d+\.\s*/, '');
    }

    function flushParagraph() {
      if (!paragraphLines.length) return;
      htmlParts.push(`<p class="page-prd-paragraph">${renderMultilineInline(paragraphLines)}</p>`);
      paragraphLines = [];
    }

    function flushList() {
      if (!listItems.length) return;
      const tag = listType === 'ordered' ? 'ol' : 'ul';
      function buildTree(items) {
        const root = { children: [] };
        const stack = [{ node: root, indent: -1 }];
        items.forEach(function (item) {
          const child = { text: item.text, indent: item.indent || 0, children: [] };
          while (stack.length > 1 && stack[stack.length - 1].indent >= child.indent) {
            stack.pop();
          }
          stack[stack.length - 1].node.children.push(child);
          stack.push({ node: child, indent: child.indent });
        });
        return root;
      }
      function renderTree(nodes) {
        if (!nodes.length) return '';
        return '<' + tag + ' class="page-prd-list">' + nodes.map(function (n) {
          return '<li>' + renderInline(n.text) + renderTree(n.children) + '</li>';
        }).join('') + '</' + tag + '>';
      }
      htmlParts.push(renderTree(buildTree(listItems).children));
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

    let sectionDepth = 0;

    function closeSection() {
      if (sectionDepth > 0) {
        htmlParts.push('</div>');
        sectionDepth = 0;
      }
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

      const headingMatch = compact.match(/^(#{1,9})\s+(.*)$/);
      if (headingMatch) {
        flushAll();
        headingIndex += 1;
        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();
        const headingId = buildHeadingId(title, headingIndex);
        const stripped = stripLeadingNumber(title);
        const hasNumber = stripped !== title;
        let displayTitle;
        if (hasNumber) {
          const hierNum = hierarchicalNumber(level);
          displayTitle = (level === 1 ? hierNum + '. ' : hierNum + ' ') + stripped;
        } else {
          for (let i = level + 1; i <= 9; i++) headingCounters[i] = 0;
          displayTitle = title;
        }
        closeSection();
        htmlParts.push(`<h${level} class="page-prd-heading level-${level}" id="${headingId}">${renderInline(displayTitle)}</h${level}>`);
        htmlParts.push(`<div class="prd-section prd-depth-${level}">`);
        sectionDepth = level;
        if (level >= 1 && level <= 9 && !(headingIndex === 1 && !hasNumber)) {
          toc.push({ id: headingId, title: displayTitle, level });
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
        listItems.push({ text: orderedMatch[1], indent: trimmed.length - trimmed.trimStart().length });
        return;
      }

      const bulletMatch = compact.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        flushParagraph();
        flushQuote();
        flushTable();
        if (listType && listType !== 'unordered') flushList();
        listType = 'unordered';
        listItems.push({ text: bulletMatch[1], indent: trimmed.length - trimmed.trimStart().length });
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
    closeSection();

    return {
      html: htmlParts.join(''),
      toc
    };
  }

  /* ---------- 控件绑定 ---------- */
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

  /* ---------- 开关弹窗 ---------- */
  function openViewer() {
    state.open = true;
    if (!state.maximized && !pagePrdViewer.style.width) {
      centerDialog();
    }
    pagePrdViewer.classList.add('open');
    pagePrdViewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('page-prd-viewer-open');
  }

  function closeViewer() {
    state.open = false;
    state.locateMode = false;
    pagePrdViewer.classList.remove('open', 'maximized');
    pagePrdViewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('page-prd-viewer-open', 'page-prd-locate-mode');
    pagePrdLocateBtn.classList.remove('active');
    pagePrdLocateBtn.textContent = '控件定位模式';
    state.maximized = false;
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

  function scrollControlNodeIntoView(node) {
    if (!node) return;
    node.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }

  function focusControlNode(node) {
    if (!node) return;
    if (!state.open) openViewer();
    window.requestAnimationFrame(() => {
      scrollControlNodeIntoView(node);
      highlightControlNode(node);
    });
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
      updateCurrentText(`未找到"${label || ref}"对应的文档位置`);
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    highlightDocNode(target);
    updateCurrentText(`当前定位：${label || target.textContent.trim()}`);
  }

  function jumpToBinding(binding, node) {
    if (!binding) return;
    focusControlNode(node);
    if (binding.targetId) {
      jumpToRef(binding.targetId, binding.label);
      return;
    }
    if (binding.headingText) {
      const tocMatch = state.toc.find((item) => item.title === binding.headingText);
      if (tocMatch) {
        jumpToRef(tocMatch.id, binding.label);
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

  /* ---------- Mermaid流程图渲染 ---------- */
  function renderMermaidDiagrams() {
    var blocks = pagePrdContent.querySelectorAll('code[data-lang="mermaid"]');
    if (!blocks.length) return;
    if (typeof mermaid === 'undefined') return;
    blocks.forEach(function (codeEl, i) {
      var pre = codeEl.parentElement;
      var source = codeEl.textContent;
      var id = 'mermaid-prd-' + i;
      try {
        mermaid.render(id, source).then(function (result) {
          var container = document.createElement('div');
          container.className = 'page-prd-mermaid';
          container.innerHTML = result.svg;
          pre.replaceWith(container);
        }).catch(function () {});
      } catch (e) {}
    });
  }

  /* ---------- 初始化 ---------- */
  function init(markdownSource) {
    const parsed = parseMarkdown(markdownSource);
    state.toc = parsed.toc;
    pagePrdContent.innerHTML = parsed.html;
    renderMermaidDiagrams();
    centerDialog();
    renderToc('');
    bindControls();

    enableDrag();
    enableResize();

    // 双击标题栏最大化/还原
    const header = pagePrdViewer.querySelector('.page-prd-head');
    if (header) {
      header.addEventListener('dblclick', function (e) {
        if (e.target.closest('.page-prd-close, .page-prd-maximize')) return;
        toggleMaximize();
      });
    }

    // 最大化按钮
    const maxBtn = pagePrdViewer.querySelector('.page-prd-maximize');
    if (maxBtn) {
      maxBtn.addEventListener('click', toggleMaximize);
    }

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

    // 内容区滚动 → 同步目录高亮
    let scrollSyncScheduled = false;
    pagePrdContent.addEventListener('scroll', () => {
      if (scrollSyncScheduled) return;
      scrollSyncScheduled = true;
      window.requestAnimationFrame(() => {
        scrollSyncScheduled = false;
        if (!state.toc.length) return;
        const contentRect = pagePrdContent.getBoundingClientRect();
        const headings = state.toc.map(item => {
          const el = pagePrdContent.querySelector(`#${escapeSelector(item.id)}`);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return { id: item.id, top: rect.top - contentRect.top + pagePrdContent.scrollTop };
        }).filter(Boolean);
        if (!headings.length) return;
        const scrollTop = pagePrdContent.scrollTop;
        const threshold = 60;
        let activeId = headings[0].id;
        for (let i = headings.length - 1; i >= 0; i--) {
          if (headings[i].top <= scrollTop + threshold) {
            activeId = headings[i].id;
            break;
          }
        }
        if (state.activeRef !== activeId) {
          state.activeRef = activeId;
          pagePrdToc.querySelectorAll('[data-prd-jump]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.prdJump === activeId);
          });
          const activeBtn = pagePrdToc.querySelector('[data-prd-jump].active');
          if (activeBtn) {
            const tocRect = pagePrdToc.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            if (btnRect.top < tocRect.top || btnRect.bottom > tocRect.bottom) {
              activeBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('#pagePrdViewer')) return;
      if (event.target.closest('#pagePrdBtn')) return;
      const shouldLocate = event.altKey || state.locateMode;
      if (state.open && !shouldLocate) {
        closeViewer();
        return;
      }
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
  } // end init()

  // 使用全局变量加载PRD正文
  init(markdownSource);
})();
