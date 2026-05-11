(function () {
  const TAB_ITEMS = {
    workbench: {
      label: '工作台V2',
      icon: 'ri-dashboard-3-line',
      href: './wms-workbench-v2.html'
    },
    report: {
      label: 'BI综合报表V2',
      icon: 'ri-line-chart-line',
      href: './bi-consolidated-report-v2.html'
    },
    'operation-fee': {
      label: '操作费管理',
      icon: 'ri-money-cny-box-line',
      href: './operation-fee-config.html'
    },
    'operation-fee-create': {
      label: '新增操作费',
      icon: 'ri-money-cny-box-line',
      href: './operation-fee-create.html',
      labelId: 'pageTabLabel'
    },
    'logistics-fee': {
      label: '物流费管理',
      icon: 'ri-truck-line',
      href: './logistics-fee-config.html'
    },
    'logistics-fee-create': {
      label: '新增物流费',
      icon: 'ri-truck-line',
      href: './logistics-fee-create.html',
      labelId: 'pageTabLabel'
    },
    'storage-fee': {
      label: '仓储费管理',
      icon: 'ri-store-2-line',
      href: './storage-fee-config.html'
    },
    'storage-fee-create': {
      label: '新增仓储费',
      icon: 'ri-store-2-line',
      href: './storage-fee-create.html',
      labelId: 'pageTabLabel'
    },
    'trunk-outbound-pending': {
      label: '干线待出库',
      icon: 'ri-truck-line',
      href: './trunk-outbound-pending-list.html'
    },
    'trunk-order-list': {
      label: '干线订单列表',
      icon: 'ri-file-list-3-line',
      href: './trunk-order-list.html'
    }
  };

  const TAB_SETS = {
    overview: ['workbench', 'report'],
    finance: ['workbench', 'report', 'operation-fee', 'logistics-fee', 'storage-fee'],
    business: ['workbench', 'trunk-order-list', 'trunk-outbound-pending', 'report'],
    'finance-editor': ['workbench', 'report', 'operation-fee', 'logistics-fee', 'storage-fee', 'operation-fee-create', 'logistics-fee-create', 'storage-fee-create']
  };

  function buildToolButton(icon, label, badge) {
    return [
      '<button type="button" class="sdms-tool-btn" aria-label="' + label + '" title="' + label + '">',
      '<i class="' + icon + '"></i>',
      badge ? '<span class="sdms-tool-badge">' + badge + '</span>' : '',
      '</button>'
    ].join('');
  }

  function buildPrdEntry(container) {
    const buttonText = container.dataset.prdEntryText || '查看PRD';
    return [
      '<button type="button" class="sdms-prd-entry" id="pagePrdBtn" aria-label="' + buttonText + '" title="' + buttonText + '">',
      '<i class="ri-file-text-line"></i>',
      '<span>' + buttonText + '</span>',
      '</button>'
    ].join('');
  }

  function getAvatarText(name) {
    const value = String(name || '').trim();
    return value ? value.charAt(0) : '张';
  }

  function buildTools(container, includePrdEntry) {
    const userName = container.dataset.userName || '张三';
    const toolItems = [];
    if (includePrdEntry) {
      toolItems.push(buildPrdEntry(container));
    }
    toolItems.push(buildToolButton('ri-refresh-line', '刷新'));
    toolItems.push(buildToolButton('ri-fullscreen-line', '全屏'));
    toolItems.push(buildToolButton('ri-notification-3-line', '消息通知', '99+'));
    toolItems.push(buildToolButton('ri-translate-2', '语言切换'));
    toolItems.push([
      '<button type="button" class="sdms-tool-user" aria-label="当前用户 ' + userName + '" title="' + userName + '">',
      '<span class="sdms-tool-avatar">' + getAvatarText(userName) + '</span>',
      '<span class="sdms-tool-user-name">' + userName + '</span>',
      '<i class="ri-arrow-down-s-line"></i>',
      '</button>'
    ].join(''));

    return [
      '<div class="header-tabs-actions">',
      '<div class="sdms-top-tools">',
      toolItems.join(''),
      '</div>',
      '</div>'
    ].join('');
  }

  function buildLabel(item) {
    if (item.labelId) {
      return '<span id="' + item.labelId + '">' + item.label + '</span>';
    }
    return '<span>' + item.label + '</span>';
  }

  function buildActiveTab(item) {
    return [
      '<div class="tab-chip primary">',
      '<i class="' + item.icon + '"></i>',
      buildLabel(item),
      '<span class="close-mark">×</span>',
      '</div>'
    ].join('');
  }

  function buildLinkTab(item) {
    return [
      '<a href="' + item.href + '" class="tab-chip">',
      '<i class="' + item.icon + '"></i>',
      '<span>' + item.label + '</span>',
      '</a>'
    ].join('');
  }

  function getTabKeys(container) {
    const setKey = container.dataset.tabSet || '';
    const keys = TAB_SETS[setKey];
    return Array.isArray(keys) && keys.length ? keys : Object.keys(TAB_ITEMS);
  }

  function renderTabs(container) {
    const activeKey = container.dataset.tabKey || '';
    const tabKeys = getTabKeys(container);
    const includeTools = container.dataset.includeTools === 'true';
    const includePrdEntry = container.dataset.includePrdEntry === 'true';
    const tabsHtml = tabKeys.map((key) => {
      const item = TAB_ITEMS[key];
      if (!item) return '';
      return key === activeKey ? buildActiveTab(item) : buildLinkTab(item);
    }).join('');

    container.classList.add('header-tabs-composed');
    container.innerHTML = [
      '<div class="header-tabs-main">',
      tabsHtml,
      '</div>',
      (includeTools || includePrdEntry) ? buildTools(container, includePrdEntry) : ''
    ].join('');
  }

  function init() {
    document.querySelectorAll('[data-sdms-header-tabs]').forEach(renderTabs);
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
