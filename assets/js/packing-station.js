/* ============================================================
   packing-station.js — 打包台共用JS逻辑
   ============================================================ */
;(function (root) {
  'use strict';

  // ============ Mock 数据 ============

  /** 仓库列表 */
  var WAREHOUSES = [
    { code: 'WH-SZ-001', name: '深圳仓', type: 'warehouse' },
    { code: 'BSI-SZXW-1', name: '深圳兴围仓', type: 'warehouse' },
    { code: 'WH-GZ-002', name: '广州仓', type: 'warehouse' },
    { code: 'WH-SH-003', name: '上海仓', type: 'warehouse' },
    { code: 'WH-BJ-004', name: '北京仓', type: 'warehouse' }
  ];

  /** 租户列表（每个租户关联多个仓库） */
  var TENANTS = [
    { code: 'TN-YLW-001', name: '运连网', warehouseCodes: ['WH-SZ-001', 'WH-GZ-002', 'WH-SH-003', 'WH-BJ-004'] },
    { code: 'TN-JH-002',  name: '嘉泓物流', warehouseCodes: ['WH-SZ-001'] },
    { code: 'TN-HQ-003',  name: '环球速递', warehouseCodes: ['WH-GZ-002', 'WH-SH-003'] }
  ];

  /** Mock用户 */
  var MOCK_USERS = [
    { username: 'packer01', password: '123456', name: '张三' },
    { username: 'packer02', password: '123456', name: '李四' },
    { username: 'admin01',  password: 'admin',   name: '王管理员' },
    { username: 'admin',    password: 'admin',   name: '管理员' }
  ];

  /** 看板数据 */
  var DASHBOARD_DATA = {
    pending: 12,
    completed: 47,
    abnormal: 3,
    efficiency: 98
  };

  /** 功能卡片数据 */
  var FUNC_CARDS = [
    { key: 'packing',   name: '出库打包', desc: '扫码打包出库货物', icon: 'ri-package-line',        color: 'blue',   shortcut: 'F1' },
    { key: 'weighing',  name: '称重复核', desc: '货物称重与复核',   icon: 'ri-scales-3-line',       color: 'green',  shortcut: 'F2' },
    { key: 'label',     name: '贴标打印', desc: '打印面单和标签',   icon: 'ri-price-tag-3-line',    color: 'orange', shortcut: 'F3' },
    { key: 'todo',      name: '待办任务', desc: '查看待处理打包任务', icon: 'ri-file-list-3-line',    color: 'purple', shortcut: 'F4' },
    { key: 'query',     name: '任务查询', desc: '查询历史打包记录',   icon: 'ri-search-eye-line',     color: 'cyan',   shortcut: 'F5' },
    { key: 'exception', name: '异常处理', desc: '处理打包异常件',   icon: 'ri-alarm-warning-line',  color: 'red',    shortcut: 'F6' }
  ];

  /** 最近任务 */
  var RECENT_TASKS = [
    { id: 'PKG-20260609-0047', customer: '嘉泓物流', destination: '美国-洛杉矶',   qty: 3, time: '14:32' },
    { id: 'PKG-20260609-0046', customer: '环球速递', destination: '英国-伦敦',     qty: 1, time: '14:28' },
    { id: 'PKG-20260609-0045', customer: '领航国际', destination: '德国-法兰克福', qty: 5, time: '14:15' },
    { id: 'PKG-20260609-0044', customer: '迅达货运', destination: '澳洲-悉尼',     qty: 2, time: '14:02' },
    { id: 'PKG-20260609-0043', customer: '东方海运', destination: '加拿大-温哥华', qty: 4, time: '13:55' }
  ];

  // ============ localStorage 管理 ============

  var STORAGE_KEYS = {
    code:     'sdms_station_code',
    type:     'sdms_station_type',
    name:     'sdms_station_name',
    tenant:   'sdms_station_tenant',
    warehouse:'sdms_selected_warehouse',
    token:    'sdms_user_token',
    user:     'sdms_user_info'
  };

  function lsGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }
  function lsRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  // ============ 编码校验 ============

  /**
   * 校验编码，返回识别结果
   * @param {string} code - 用户输入的编码
   * @returns {{ valid: boolean, type: string, name: string, code: string, warehouseCodes?: string[] }}
   */
  function verifyCode(code) {
    code = (code || '').trim().toUpperCase();

    // 先匹配仓库编码
    for (var i = 0; i < WAREHOUSES.length; i++) {
      if (WAREHOUSES[i].code.toUpperCase() === code) {
        return { valid: true, type: 'warehouse', name: WAREHOUSES[i].name, code: WAREHOUSES[i].code };
      }
    }

    // 再匹配租户编码
    for (var j = 0; j < TENANTS.length; j++) {
      if (TENANTS[j].code.toUpperCase() === code) {
        return {
          valid: true,
          type: 'tenant',
          name: TENANTS[j].name,
          code: TENANTS[j].code,
          warehouseCodes: TENANTS[j].warehouseCodes
        };
      }
    }

    return { valid: false, type: '', name: '', code: '' };
  }

  /**
   * 根据仓库编码获取仓库对象
   */
  function getWarehouseByCode(code) {
    for (var i = 0; i < WAREHOUSES.length; i++) {
      if (WAREHOUSES[i].code === code) return WAREHOUSES[i];
    }
    return null;
  }

  /**
   * 根据租户编码获取仓库列表
   */
  function getWarehousesForTenant(tenantCode) {
    for (var i = 0; i < TENANTS.length; i++) {
      if (TENANTS[i].code === tenantCode) {
        return TENANTS[i].warehouseCodes.map(function (wc) {
          return getWarehouseByCode(wc);
        }).filter(Boolean);
      }
    }
    return [];
  }

  // ============ 登录验证 ============

  /**
   * Mock登录验证
   * @returns {{ success: boolean, user?: object, error?: string }}
   */
  function verifyLogin(username, password) {
    for (var i = 0; i < MOCK_USERS.length; i++) {
      if (MOCK_USERS[i].username === username && MOCK_USERS[i].password === password) {
        return {
          success: true,
          user: { username: MOCK_USERS[i].username, name: MOCK_USERS[i].name }
        };
      }
    }
    return { success: false, error: '用户名或密码错误' };
  }

  // ============ 弹窗工具 ============

  /**
   * 显示仓库选择弹窗
   * @param {Array} warehouses - 仓库列表 [{code, name}]
   * @param {Function} onSelect - 选择回调
   */
  function showWarehouseModal(warehouses, onSelect) {
    var mask = document.createElement('div');
    mask.className = 'ps-modal-mask';

    var itemsHtml = warehouses.map(function (w) {
      return '<div class="ps-warehouse-item" data-code="' + w.code + '">' +
        '<span class="ps-warehouse-item-name">' + w.name + '</span>' +
        '<span class="ps-warehouse-item-code">' + w.code + '</span>' +
      '</div>';
    }).join('');

    mask.innerHTML =
      '<div class="ps-modal">' +
        '<div class="ps-modal-head">' +
          '<span class="ps-modal-title">请选择仓库</span>' +
          '<button class="ps-modal-close" data-action="close"><i class="ri-close-line"></i></button>' +
        '</div>' +
        '<div class="ps-modal-body">' + itemsHtml + '</div>' +
      '</div>';

    document.body.appendChild(mask);

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
      if (action && action.getAttribute('data-action') === 'close') {
        close();
        return;
      }
      if (e.target === mask) {
        close();
        return;
      }
      var item = e.target.closest('.ps-warehouse-item');
      if (item) {
        var code = item.getAttribute('data-code');
        close();
        if (onSelect) onSelect(getWarehouseByCode(code));
      }
    });
  }

  /**
   * 显示确认弹窗
   * @param {string} message - 确认文本
   * @param {Function} onConfirm - 确认回调
   * @param {object} [opts] - { title, confirmText, cancelText, type }
   */
  function showConfirm(message, onConfirm, opts) {
    opts = opts || {};
    var title = opts.title || '确认';
    var confirmText = opts.confirmText || '确定';
    var cancelText = opts.cancelText || '取消';
    var btnClass = opts.type === 'danger' ? 'ps-modal-btn-danger' : 'ps-modal-btn-primary';

    var mask = document.createElement('div');
    mask.className = 'ps-modal-mask';
    mask.innerHTML =
      '<div class="ps-modal">' +
        '<div class="ps-modal-head">' +
          '<span class="ps-modal-title">' + title + '</span>' +
          '<button class="ps-modal-close" data-action="close"><i class="ri-close-line"></i></button>' +
        '</div>' +
        '<div class="ps-modal-body">' +
          '<div class="ps-confirm-text">' + message + '</div>' +
        '</div>' +
        '<div class="ps-modal-footer">' +
          '<button class="ps-modal-btn ps-modal-btn-default" data-action="cancel">' + cancelText + '</button>' +
          '<button class="ps-modal-btn ' + btnClass + '" data-action="confirm">' + confirmText + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(mask);
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
      if (!action) return;
      var act = action.getAttribute('data-action');
      if (act === 'close' || act === 'cancel') {
        close();
      } else if (act === 'confirm') {
        close();
        if (onConfirm) onConfirm();
      }
    });
  }

  // ============ Toast 工具 ============

  function ensureToastStack() {
    var stack = document.querySelector('.ps-toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'ps-toast-stack';
      document.body.appendChild(stack);
    }
    return stack;
  }

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 2500;
    var stack = ensureToastStack();

    var iconMap = { success: 'ri-check-line', error: 'ri-error-warning-line', info: 'ri-information-line' };
    var toast = document.createElement('div');
    toast.className = 'ps-toast ps-toast-' + type;
    toast.innerHTML = '<i class="' + (iconMap[type] || iconMap.info) + '"></i><span>' + message + '</span>';
    stack.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // ============ 导出 ============

  var PS = {
    // Mock数据
    WAREHOUSES: WAREHOUSES,
    TENANTS: TENANTS,
    MOCK_USERS: MOCK_USERS,
    DASHBOARD_DATA: DASHBOARD_DATA,
    FUNC_CARDS: FUNC_CARDS,
    RECENT_TASKS: RECENT_TASKS,
    // Storage
    STORAGE_KEYS: STORAGE_KEYS,
    lsGet: lsGet,
    lsSet: lsSet,
    lsRemove: lsRemove,
    // 业务逻辑
    verifyCode: verifyCode,
    getWarehouseByCode: getWarehouseByCode,
    getWarehousesForTenant: getWarehousesForTenant,
    verifyLogin: verifyLogin,
    // UI工具
    showWarehouseModal: showWarehouseModal,
    showConfirm: showConfirm,
    showToast: showToast
  };

  root.PS = PS;
})(window);
