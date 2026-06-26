/* ============================================================
 * 开放平台共用脚本 — open-platform.js
 * 侧边栏渲染、弹窗、状态标签、Tab切换、Toast、Mock工具
 * ============================================================ */

;(function (root) {
  'use strict';

  /* ---- 常量 ---- */
  var SIDEBAR_ID = 'opSidebar';
  var TOAST_STACK_ID = 'opToastStack';

  /* ---- 菜单数据 ---- */
  var DEV_MENUS = [
    { key: 'dashboard', label: '概览仪表盘', icon: 'ri-dashboard-3-line', href: 'open-platform-developer-dashboard.html' },
    { key: 'apps',      label: '应用管理',   icon: 'ri-apps-2-line',      href: 'open-platform-applications.html' },
    { key: 'apply',     label: '申请入口',   icon: 'ri-user-add-line',    href: 'open-platform-developer-apply.html' },
    { key: 'docs',      label: '接口文档',   icon: 'ri-book-2-line',      href: 'open-platform-api-docs.html' },
    { key: 'webhook',   label: 'Webhook管理', icon: 'ri-link',            href: 'open-platform-webhook.html' },
    { key: 'log',       label: '调用日志',   icon: 'ri-file-list-3-line', href: 'open-platform-call-logs.html' },
    { key: 'stats',     label: '统计报表',   icon: 'ri-bar-chart-2-line', href: 'open-platform-stats.html' }
  ];

  var ADMIN_MENUS = [
    { key: 'dev-manage', label: '开发者管理', icon: 'ri-team-line',             href: 'open-platform-admin-developers.html' },
    { key: 'monitor',    label: '全局监控看板', icon: 'ri-pulse-line',          href: 'open-platform-admin-monitor.html' },
    { key: 'alert',      label: '告警配置',   icon: 'ri-alarm-warning-line',   href: '#' }
  ];

  /* ---- 公开页面菜单（未登录可见） ---- */
  var PUBLIC_MENUS = [
    { key: 'home', label: '首页',     icon: 'ri-home-line',   href: 'open-platform-home.html' },
    { key: 'docs', label: '接口文档', icon: 'ri-book-2-line', href: 'open-platform-api-docs.html' }
  ];

  /* ---- 状态配置 ---- */
  var STATUS_MAP = {
    pending:  { cls: 'op-status-pending',  label: '待审批', icon: 'ri-time-line' },
    active:   { cls: 'op-status-active',   label: '已激活', icon: 'ri-check-line' },
    rejected: { cls: 'op-status-rejected', label: '已驳回', icon: 'ri-close-line' },
    disabled: { cls: 'op-status-disabled', label: '已禁用', icon: 'ri-forbid-line' }
  };

  /* ---- Mock用户 & 认证 ---- */
  var MOCK_USERS = [
    { username: 'zhangsan', password: '123456', name: '张三', company: '运连网科技有限公司', isDeveloper: true },
    { username: 'lisi',     password: '123456', name: '李四', company: '智联物流有限公司',   isDeveloper: false }
  ];
  var AUTH_STORAGE_KEY = 'op_dev_user';

  /* ---- Mock应用数据 ---- */
  var APPS_STORAGE_KEY = 'op_dev_apps';
  var MAX_APPS_PER_COMPANY = 5;

  var DEFAULT_MOCK_APPS = [
    {
      id: 'app_001',
      name: 'ERP同步系统',
      description: 'ERP系统实时同步SDMS库存和订单数据',
      status: 'active',
      permissions: ['干线业务', '备货中转'],
      createdAt: '2026-05-20 10:30',
      prodKey: { value: 'ak_x7k9m2p4n8q1r5t3', status: 'active', quota: 10000, used: 3247 },
      testKey: { value: 'ak_t3s1d7f9g2h4j6k8', status: 'active', quota: 10000, used: 156 }
    },
    {
      id: 'app_002',
      name: '财务对账系统',
      description: '财务系统查询SDMS费用明细和账单数据',
      status: 'active',
      permissions: ['干线业务', '一件代发'],
      createdAt: '2026-06-01 14:15',
      prodKey: { value: 'ak_b5n7q9r1t3w5y7a9', status: 'active', quota: 5000, used: 892 },
      testKey: { value: 'ak_c4m6o8p0q2r4s6t8', status: 'active', quota: 5000, used: 34 }
    }
  ];

  function getApps() {
    try {
      var data = localStorage.getItem(APPS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    // 首次访问，初始化默认数据
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(DEFAULT_MOCK_APPS));
    return DEFAULT_MOCK_APPS;
  }

  function saveApps(apps) {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
  }

  function generateAppId() {
    return 'app_' + Date.now().toString(36);
  }

  function generateKeyValue() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var result = 'ak_';
    for (var i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function login(username, password) {
    for (var i = 0; i < MOCK_USERS.length; i++) {
      var u = MOCK_USERS[i];
      if (u.username === username && u.password === password) {
        return { success: true, user: u, isDeveloper: u.isDeveloper };
      }
    }
    return { success: false };
  }

  function getCurrentUser() {
    try {
      var data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  function saveUser(user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = 'open-platform-login.html';
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'open-platform-login.html';
      return false;
    }
    return true;
  }

  /* ============================================================
   * renderSidebar — 渲染左侧导航
   * @param {Array} menuItems  菜单数组 [{ key, label, icon, href }]
   * @param {string} activeKey 当前高亮菜单key
   * ============================================================ */
  function renderSidebar(menuItems, activeKey) {
    var el = document.getElementById(SIDEBAR_ID);
    if (!el) return;

    var isAdmin = menuItems === ADMIN_MENUS ||
      (menuItems.length && menuItems[0].key === 'dev-manage');

    var groupTitle = isAdmin ? '管理后台' : '开发者门户';
    var logoIcon   = isAdmin ? 'ri-settings-3-line' : 'ri-code-s-slash-line';
    var logoText   = '开放平台';

    var html = '';
    html += '<div class="op-sidebar-logo">';
    html += '  <i class="' + logoIcon + '"></i>';
    html += '  <span>' + logoText + '</span>';
    html += '</div>';
    html += '<nav class="op-sidebar-nav">';
    html += '  <div class="op-nav-group">';
    html += '    <div class="op-nav-group-title">' + groupTitle + '</div>';

    for (var i = 0; i < menuItems.length; i++) {
      var item = menuItems[i];
      var cls  = item.key === activeKey ? 'op-nav-item active' : 'op-nav-item';
      html += '<a class="' + cls + '" href="' + (item.href || '#') + '" data-key="' + item.key + '">';
      html += '  <i class="' + item.icon + '"></i>';
      html += '  <span>' + item.label + '</span>';
      html += '</a>';
    }

    html += '  </div>';
    html += '</nav>';
    html += '<div class="op-sidebar-footer">';
    html += '  <div class="op-sidebar-user">';
    html += '    <div class="op-sidebar-user-avatar">张</div>';
    html += '    <span class="op-sidebar-user-name">张三 | 运连网科技有限公司</span>';
    html += '  </div>';
    html += '</div>';

    el.innerHTML = html;
  }

  /* ============================================================
   * renderTopNav — 渲染顶部导航
   * @param {Array}  menuItems 菜单数组 [{ key, label, icon, href }]
   * @param {string} activeKey 当前高亮菜单key
   * @param {Object} [opts]    可选配置 { public: true/false }
   * ============================================================ */
  function renderTopNav(menuItems, activeKey, opts) {
    opts = opts || {};
    var isPublic = !!opts.public;
    var el = document.getElementById('opTopNav');
    if (!el) return;

    // 公开页面（首页/接口文档）：已登录则升级为完整菜单 + 用户视图，
    // 未登录才显示精简菜单 + 登录按钮
    if (isPublic && isLoggedIn()) {
      isPublic = false;
      menuItems = DEV_MENUS;
    }

    var isAdmin = menuItems && menuItems.length && menuItems[0].key === 'dev-manage';

    var html = '';
    html += '<header class="op-topnav">';
    html += '  <div class="op-topnav-inner">';
    html += '    <a class="op-topnav-logo" href="open-platform-home.html">';
    html += '      <i class="ri-code-s-slash-line"></i>';
    html += '      <span>开放平台</span>';
    html += '    </a>';
    html += '    <nav class="op-topnav-menu">';

    for (var i = 0; i < menuItems.length; i++) {
      var item = menuItems[i];
      var cls = item.key === activeKey ? 'op-topnav-item active' : 'op-topnav-item';
      html += '<a class="' + cls + '" href="' + (item.href || '#') + '" data-key="' + item.key + '">';
      html += '  <i class="' + item.icon + '"></i><span>' + item.label + '</span>';
      html += '</a>';
    }

    html += '    </nav>';

    if (isPublic) {
      html += '    <div class="op-topnav-user">';
      html += '      <a href="open-platform-login.html" class="op-topnav-login-link">登录</a>';
      html += '    </div>';
    } else {
      var user = getCurrentUser();
      var displayName = '张三 | 运连网科技有限公司';
      if (user) {
        displayName = user.name + ' | ' + user.company;
      }
      html += '    <div class="op-topnav-user">';
      html += '      <span class="op-topnav-user-name">' + displayName + '</span>';
      html += '      <button class="op-topnav-logout" onclick="OP.logout()">';
      html += '        <i class="ri-logout-box-r-line"></i>退出';
      html += '      </button>';
      html += '    </div>';
    }

    html += '  </div>';
    html += '</header>';

    el.innerHTML = html;
  }

  /* ============================================================
   * showConfirm — 确认弹窗
   * @param {string}   message   提示文本
   * @param {Function} onConfirm 确认回调
   * @param {Object}   [opts]    可选配置 { title, confirmText, cancelText, type }
   * ============================================================ */
  function showConfirm(message, onConfirm, opts) {
    opts = opts || {};
    var title       = opts.title || '确认操作';
    var confirmText = opts.confirmText || '确认';
    var cancelText  = opts.cancelText || '取消';
    var type        = opts.type || ''; // 'danger'

    var mask = document.createElement('div');
    mask.className = 'op-modal-mask';

    var btnCls = type === 'danger'
      ? 'op-btn op-btn-primary" style="background:var(--color-error,#ed0404);border-color:var(--color-error,#ed0404)'
      : 'op-btn op-btn-primary';

    mask.innerHTML =
      '<div class="op-modal">' +
      '  <div class="op-modal-head">' +
      '    <span class="op-modal-title">' + title + '</span>' +
      '    <button class="op-modal-close" data-action="close"><i class="ri-close-line"></i></button>' +
      '  </div>' +
      '  <div class="op-modal-body">' + message + '</div>' +
      '  <div class="op-modal-footer">' +
      '    <button class="op-btn op-btn-default" data-action="cancel">' + cancelText + '</button>' +
      '    <button class="' + btnCls + '" data-action="confirm">' + confirmText + '</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(mask);

    // 触发动画
    requestAnimationFrame(function () {
      mask.classList.add('visible');
    });

    function close() {
      mask.classList.remove('visible');
      setTimeout(function () {
        if (mask.parentNode) mask.parentNode.removeChild(mask);
      }, 200);
    }

    mask.addEventListener('click', function (e) {
      var action = e.target.closest('[data-action]');
      if (!action && e.target === mask) {
        close();
        return;
      }
      if (!action) return;
      var act = action.getAttribute('data-action');
      if (act === 'close' || act === 'cancel') {
        close();
      } else if (act === 'confirm') {
        close();
        if (typeof onConfirm === 'function') onConfirm();
      }
    });
  }

  /* ============================================================
   * renderStatusTag — 渲染状态标签
   * @param {string} status 状态: pending | active | rejected | disabled
   * @returns {string} HTML字符串
   * ============================================================ */
  function renderStatusTag(status) {
    var cfg = STATUS_MAP[status];
    if (!cfg) cfg = STATUS_MAP.disabled;
    return '<span class="op-status ' + cfg.cls + '">' +
           '<i class="' + cfg.icon + '"></i>' + cfg.label +
           '</span>';
  }

  /* ============================================================
   * initTabs — Tab切换
   * @param {string|Element} container 容器选择器或元素
   * @param {Function}       [onSwitch] 切换回调(index, tabEl)
   * ============================================================ */
  function initTabs(container, onSwitch) {
    var el = typeof container === 'string'
      ? document.querySelector(container) : container;
    if (!el) return;

    var tabs = el.querySelectorAll('.op-tab');
    for (var i = 0; i < tabs.length; i++) {
      (function (idx, tab) {
        tab.addEventListener('click', function () {
          for (var j = 0; j < tabs.length; j++) {
            tabs[j].classList.remove('active');
          }
          tab.classList.add('active');
          if (typeof onSwitch === 'function') {
            onSwitch(idx, tab);
          }
        });
      })(i, tabs[i]);
    }
  }

  /* ============================================================
   * showToast — Toast提示
   * @param {string} message  文本
   * @param {string} [type]   类型: success | error | info (默认)
   * @param {number} [duration] 显示时长ms (默认2500)
   * ============================================================ */
  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 2500;

    var stack = document.getElementById(TOAST_STACK_ID);
    if (!stack) {
      stack = document.createElement('div');
      stack.id = TOAST_STACK_ID;
      stack.className = 'op-toast-stack';
      document.body.appendChild(stack);
    }

    var icons = {
      success: 'ri-check-line',
      error:   'ri-error-warning-line',
      info:    'ri-information-line'
    };

    var toast = document.createElement('div');
    toast.className = 'op-toast op-toast-' + type;
    toast.innerHTML = '<i class="' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
    stack.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  /* ============================================================
   * Mock数据工具
   * ============================================================ */
  var Mock = {
    /** 生成唯一ID */
    uid: function () {
      return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    },

    /** 生成API Key (mock) */
    apiKey: function () {
      var chars = 'abcdef0123456789';
      var parts = [];
      for (var i = 0; i < 4; i++) {
        var seg = '';
        for (var j = 0; j < 8; j++) {
          seg += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(seg);
      }
      return 'sdms_' + parts.join('');
    },

    /** 生成当前时间字符串 */
    now: function () {
      var d = new Date();
      var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
             ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    },

    /** 模拟延迟 */
    delay: function (ms) {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }
  };

  /* ============================================================
   * 导出
   * ============================================================ */
  var OP = {
    renderSidebar:  renderSidebar,
    renderTopNav:   renderTopNav,
    showConfirm:    showConfirm,
    renderStatusTag: renderStatusTag,
    initTabs:       initTabs,
    showToast:      showToast,
    Mock:           Mock,
    // 菜单常量
    DEV_MENUS:      DEV_MENUS,
    ADMIN_MENUS:    ADMIN_MENUS,
    PUBLIC_MENUS:   PUBLIC_MENUS,
    STATUS_MAP:     STATUS_MAP,
    // 认证
    login:          login,
    getCurrentUser: getCurrentUser,
    isLoggedIn:     isLoggedIn,
    saveUser:       saveUser,
    logout:         logout,
    requireAuth:    requireAuth,
    MOCK_USERS:     MOCK_USERS,
    // 应用管理
    getApps:        getApps,
    saveApps:       saveApps,
    generateAppId:  generateAppId,
    generateKeyValue: generateKeyValue,
    MAX_APPS:       MAX_APPS_PER_COMPANY
  };

  // 全局挂载
  root.OP = OP;

})(window);
