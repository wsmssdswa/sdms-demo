/* ============================================================
   PRD Annotation System — prd-annotation.js
   页面区域PRD标注核心引擎
   读取 window.__PRD_ANNOTATIONS__ 配置，渲染标注点和弹窗
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 常量 ---------- */
  var ZINDEX_BASE = 99999;
  var zCounter = ZINDEX_BASE;

  /* ---------- Markdown 轻量渲染器 ---------- */
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderMarkdown(md) {
    if (!md) return '';
    var lines = md.split('\n');
    var html = '';
    var inTable = false;
    var inCode = false;
    var inList = false;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // 围栏代码块
      if (line.trim().match(/^```/)) {
        if (inCode) {
          html += '</code></pre>';
          inCode = false;
        } else {
          inCode = true;
          html += '<pre><code>';
        }
        continue;
      }
      if (inCode) {
        html += escapeHtml(line) + '\n';
        continue;
      }

      // 空行 → 关闭列表
      if (line.trim() === '') {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }

      // 表格行
      if (line.trim().indexOf('|') === 0) {
        if (!inTable) { html += '<table>'; inTable = true; }
        // 分隔行跳过
        if (line.replace(/[\|\s\-:]/g, '') === '') continue;
        var cells = line.split('|').filter(function (c, idx, arr) {
          return idx > 0 && idx < arr.length - 1;
        });
        var isHeader = (i + 1 < lines.length &&
          lines[i + 1].replace(/[\|\s\-:]/g, '') === '');
        var tag = isHeader ? 'th' : 'td';
        html += '<tr>';
        for (var c = 0; c < cells.length; c++) {
          html += '<' + tag + '>' + inlineFormat(cells[c].trim()) + '</' + tag + '>';
        }
        html += '</tr>';
        continue;
      } else if (inTable) {
        html += '</table>';
        inTable = false;
      }

      // h4
      var h4Match = line.match(/^#### (.+)/);
      if (h4Match) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<h4>' + inlineFormat(h4Match[1]) + '</h4>';
        continue;
      }
      // h3
      var h3Match = line.match(/^### (.+)/);
      if (h3Match) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<h3>' + inlineFormat(h3Match[1]) + '</h3>';
        continue;
      }
      // h2
      var h2Match = line.match(/^## (.+)/);
      if (h2Match) {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<h2>' + inlineFormat(h2Match[1]) + '</h2>';
        continue;
      }

      // 列表项
      var liMatch = line.match(/^- (.+)/);
      if (liMatch) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + inlineFormat(liMatch[1]) + '</li>';
        continue;
      }

      // 段落文本
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p>' + inlineFormat(line) + '</p>';
    }

    if (inList) html += '</ul>';
    if (inTable) html += '</table>';
    if (inCode) html += '</code></pre>';
    return html;
  }

  function inlineFormat(text) {
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return text;
  }

  /* ---------- 弹窗管理 ---------- */
  var activePopups = {};

  function createPopup(annotation, markerRect) {
    var popup = document.createElement('div');
    popup.className = 'prd-ann-popup';
    popup.dataset.annId = annotation.id;

    var header = document.createElement('div');
    header.className = 'prd-ann-popup-header';
    header.innerHTML =
      '<span class="prd-ann-popup-title">' + escapeHtml(annotation.title) + '</span>' +
      '<span class="prd-ann-popup-badge">PRD</span>' +
      '<button class="prd-ann-popup-btn prd-ann-popup-maximize" title="最大化">□</button>' +
      '<button class="prd-ann-popup-btn prd-ann-popup-close" title="关闭">✕</button>';

    var body = document.createElement('div');
    body.className = 'prd-ann-popup-body';
    body.innerHTML = renderMarkdown(annotation.content);

    var resize = document.createElement('div');
    resize.className = 'prd-ann-popup-resize';

    popup.appendChild(header);
    popup.appendChild(body);
    popup.appendChild(resize);
    document.body.appendChild(popup);

    // 定位：标注点右侧偏下
    var top = markerRect.bottom + 6;
    var left = markerRect.left;
    if (left + popup.offsetWidth > window.innerWidth - 12) {
      left = window.innerWidth - popup.offsetWidth - 12;
    }
    if (left < 12) left = 12;
    if (top + popup.offsetHeight > window.innerHeight - 12) {
      top = markerRect.top - popup.offsetHeight - 6;
    }
    if (top < 12) top = 12;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';

    bringToFront(popup);

    header.querySelector('.prd-ann-popup-close').addEventListener('click', function () {
      closePopup(annotation.id);
    });

    header.querySelector('.prd-ann-popup-maximize').addEventListener('click', function () {
      toggleMaximize(popup);
    });

    popup.addEventListener('mousedown', function () {
      bringToFront(popup);
    });

    enableDrag(popup, header);
    enableResize(popup, resize);

    activePopups[annotation.id] = popup;
    return popup;
  }

  function closePopup(id) {
    var popup = activePopups[id];
    if (popup) {
      popup.remove();
      delete activePopups[id];
    }
  }

  function bringToFront(popup) {
    zCounter++;
    popup.style.zIndex = zCounter;
  }

  function toggleMaximize(popup) {
    if (popup.dataset.maximized === 'true') {
      popup.style.width = popup.dataset.prevW || '520px';
      popup.style.height = popup.dataset.prevH || '440px';
      popup.style.top = popup.dataset.prevTop;
      popup.style.left = popup.dataset.prevLeft;
      popup.dataset.maximized = 'false';
    } else {
      popup.dataset.prevW = popup.style.width || '520px';
      popup.dataset.prevH = popup.style.height || '440px';
      popup.dataset.prevTop = popup.style.top;
      popup.dataset.prevLeft = popup.style.left;
      popup.style.width = Math.min(800, window.innerWidth * 0.8) + 'px';
      popup.style.height = Math.min(600, window.innerHeight * 0.8) + 'px';
      popup.style.top = ((window.innerHeight - parseInt(popup.style.height)) / 2) + 'px';
      popup.style.left = ((window.innerWidth - parseInt(popup.style.width)) / 2) + 'px';
      popup.dataset.maximized = 'true';
    }
  }

  /* ---------- 拖拽 ---------- */
  function enableDrag(popup, handle) {
    var startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', function (e) {
      if (e.target.closest('.prd-ann-popup-btn')) return;
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = popup.offsetLeft;
      startTop = popup.offsetTop;

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    function onMove(e) {
      var newLeft = startLeft + (e.clientX - startX);
      var newTop = startTop + (e.clientY - startY);
      newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - popup.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, window.innerHeight - popup.offsetHeight));
      popup.style.left = newLeft + 'px';
      popup.style.top = newTop + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
  }

  /* ---------- 缩放 ---------- */
  function enableResize(popup, handle) {
    handle.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var startX = e.clientX;
      var startY = e.clientY;
      var startW = popup.offsetWidth;
      var startH = popup.offsetHeight;

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);

      function onMove(e) {
        popup.style.width = Math.max(320, Math.min(800, startW + (e.clientX - startX))) + 'px';
        popup.style.height = Math.max(240, Math.min(600, startH + (e.clientY - startY))) + 'px';
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
    });
  }

  /* ---------- 标注点渲染 ---------- */
  var targetElements = [];

  function createMarker(annotation, index) {
    var target = document.querySelector(annotation.selector);
    if (!target) {
      console.warn('[PRD Annotation] 选择器未匹配到元素: ' + annotation.selector);
      return null;
    }

    // 确保目标元素可作为定位参考
    var pos = getComputedStyle(target).position;
    if (pos === 'static') {
      target.style.position = 'relative';
    }

    // 添加区域高亮类
    target.classList.add('prd-ann-target');
    targetElements.push(target);

    var marker = document.createElement('button');
    marker.className = 'prd-ann-marker';
    marker.textContent = index + 1;
    marker.title = annotation.title;
    marker.dataset.annId = annotation.id;

    // 悬停高亮
    marker.addEventListener('mouseenter', function () {
      target.classList.add('prd-ann-highlight');
    });
    marker.addEventListener('mouseleave', function () {
      target.classList.remove('prd-ann-highlight');
    });

    marker.addEventListener('click', function () {
      var id = annotation.id;
      if (activePopups[id]) {
        closePopup(id);
      } else {
        var rect = marker.getBoundingClientRect();
        createPopup(annotation, rect);
      }
    });

    target.appendChild(marker);
    return marker;
  }

  /* ---------- 全局开关 ---------- */
  function createToggle(markers) {
    var toggle = document.createElement('button');
    toggle.className = 'prd-ann-toggle active';
    toggle.textContent = 'P';
    toggle.title = '显示/隐藏PRD标注';

    toggle.addEventListener('click', function () {
      var isActive = toggle.classList.toggle('active');
      for (var i = 0; i < markers.length; i++) {
        if (isActive) {
          markers[i].classList.remove('hidden');
        } else {
          markers[i].classList.add('hidden');
          closePopup(markers[i].dataset.annId);
        }
      }
      // 同步切换区域高亮
      for (var j = 0; j < targetElements.length; j++) {
        if (isActive) {
          targetElements[j].classList.add('prd-ann-target');
        } else {
          targetElements[j].classList.remove('prd-ann-target');
        }
      }
    });

    document.body.appendChild(toggle);
    return toggle;
  }

  /* ---------- 初始化 ---------- */
  function init() {
    var config = window.__PRD_ANNOTATIONS__;
    if (!config || !config.annotations || !config.annotations.length) return;

    var markers = [];
    for (var i = 0; i < config.annotations.length; i++) {
      var marker = createMarker(config.annotations[i], i);
      if (marker) markers.push(marker);
    }

    if (markers.length > 0) {
      createToggle(markers);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
