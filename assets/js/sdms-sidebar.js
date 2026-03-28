(function () {
  const MENU_ITEMS = [
    { key: 'workbench', label: '工作台', icon: 'ri-dashboard-3-line', href: './wms-workbench-v2.html' },
    { key: 'business', label: '业务', icon: 'ri-layout-grid-fill', href: '' },
    { key: 'finance', label: '财务', icon: 'ri-money-cny-box-fill', href: './operation-fee-config.html' },
    { key: 'user', label: '用户', icon: 'ri-user-3-fill', href: '' },
    { key: 'report', label: '报表', icon: 'ri-bar-chart-grouped-fill', href: './bi-consolidated-report-v2.html' },
    { key: 'system', label: '系统', icon: 'ri-settings-5-fill', href: '' }
  ];

  function buildMenuItem(item, activeKey) {
    const className = item.key === activeKey ? 'nav-item active' : 'nav-item';
    const inner = '<i class="' + item.icon + '"></i><span>' + item.label + '</span>';
    return item.href
      ? '<a href="' + item.href + '" class="' + className + '">' + inner + '</a>'
      : '<div class="' + className + '">' + inner + '</div>';
  }

  function renderSidebar(sidebar) {
    const activeKey = sidebar.dataset.sidebarKey || '';
    sidebar.innerHTML = [
      '<div class="logo-box">SDMS</div>',
      MENU_ITEMS.map(function (item) { return buildMenuItem(item, activeKey); }).join(''),
      '<div class="side-version">V2.0.0</div>'
    ].join('');
  }

  function init() {
    document.querySelectorAll('[data-sdms-sidebar]').forEach(renderSidebar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
