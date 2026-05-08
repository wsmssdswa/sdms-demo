(function () {
  const MENU_ITEMS = [
    { key: 'workbench', label: '工作台', icon: 'ri-dashboard-3-line', href: './wms-workbench-v2.html' },
    { key: 'business', label: '业务', icon: 'ri-layout-grid-fill', href: '', submenuKey: 'business' },
    { key: 'finance', label: '财务', icon: 'ri-money-cny-box-fill', href: './operation-fee-config.html' },
    { key: 'user', label: '用户', icon: 'ri-user-3-fill', href: '' },
    { key: 'report', label: '报表', icon: 'ri-bar-chart-grouped-fill', href: './bi-consolidated-report-v2.html' },
    { key: 'system', label: '系统', icon: 'ri-settings-5-fill', href: '' }
  ];

  const SUBMENU_DATA = {
    business: [
      { title: '订单管理', icon: 'ri-file-list-3-line', items: [
        { label: '干线订单列表', href: './trunk-order-list.html' },
        { label: '小包订单', href: '' },
        { label: 'FBA订单', href: '' },
        { label: '尾程大货订单', href: '' }
      ]},
      { title: '入仓单列表', icon: 'ri-archive-line', items: [
        { label: '入仓单列表', href: '' }
      ]},
      { title: '无对应单列表', icon: 'ri-questionnaire-line', items: [
        { label: '无对应单列表', href: '' }
      ]},
      { title: '出库单', icon: 'ri-truck-line', items: [
        { label: '干线出仓单', href: './trunk-outbound-pending-list.html' },
        { label: 'FBA出库单', href: '' },
        { label: '尾程出库单', href: '' }
      ]},
      { title: '配载单', icon: 'ri-stack-line', items: [
        { label: 'FBA配载单', href: '' },
        { label: '尾程配载单', href: '' }
      ]},
      { title: '增值服务任务', icon: 'ri-vip-diamond-line', items: [
        { label: '增值服务任务', href: '' }
      ]},
      { title: '提货管理', icon: 'ri-shopping-bag-3-line', items: [
        { label: '提货服务单', href: '' },
        { label: '提货单', href: '' },
        { label: '提货任务', href: '' }
      ]},
      { title: '收货卡板', icon: 'ri-archive-drawer-line', items: [
        { label: '收货卡板', href: '' }
      ]}
    ]
  };

  function buildSubmenuFlyout(key) {
    const groups = SUBMENU_DATA[key];
    if (!groups || !groups.length) return '';
    const mid = Math.ceil(groups.length / 2);
    const leftGroups = groups.slice(0, mid);
    const rightGroups = groups.slice(mid);

    function buildCol(groups) {
      return groups.map(function (g) {
        const itemsHtml = g.items.map(function (it) {
          return it.href
            ? '<a class="submenu-link" href="' + it.href + '">' + it.label + '</a>'
            : '<span class="submenu-link disabled">' + it.label + '</span>';
        }).join('');
        return [
          '<div class="submenu-group">',
          '<div class="submenu-title"><i class="' + g.icon + '"></i><span>' + g.title + '</span></div>',
          '<div class="submenu-list">' + itemsHtml + '</div>',
          '</div>'
        ].join('');
      }).join('');
    }

    return [
      '<div class="submenu-flyout">',
      '<div class="submenu-content">',
      '<div class="submenu-col">' + buildCol(leftGroups) + '</div>',
      '<div class="submenu-col">' + buildCol(rightGroups) + '</div>',
      '</div>',
      '</div>'
    ].join('');
  }

  function buildMenuItem(item, activeKey) {
    const className = item.key === activeKey ? 'nav-item active' : 'nav-item';
    const submenuHtml = item.submenuKey ? buildSubmenuFlyout(item.submenuKey) : '';
    const inner = '<i class="' + item.icon + '"></i><span>' + item.label + '</span>' + submenuHtml;
    return item.href
      ? '<a href="' + item.href + '" class="' + className + '">' + inner + '</a>'
      : '<div class="' + className + '">' + inner + '</div>';
  }

  function renderSidebar(sidebar) {
    const activeKey = sidebar.dataset.sidebarKey || '';
    sidebar.innerHTML = [
      '<a href="./index.html" class="logo-box">SDMS</a>',
      MENU_ITEMS.map((item) => buildMenuItem(item, activeKey)).join(''),
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
