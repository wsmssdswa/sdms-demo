(() => {
  const $ = (id) => document.getElementById(id);
  const refs = {
    statusTabs: $('statusTabs'),
    keywordInput: $('keywordInput'),
    warehouseSelect: $('warehouseSelect'),
    mergeTypeSelect: $('mergeTypeSelect'),
    queryBtn: $('queryBtn'),
    resetBtn: $('resetBtn'),
    orderCardList: $('orderCardList'),
    totalCountText: $('totalCountText'),
    pageBtnGroup: $('pageBtnGroup'),
    pageSizeSelect: $('pageSizeSelect'),
    jumpInput: $('jumpInput'),
    toastStack: $('toastStack')
  };

  const STATUS_OPTIONS = [
    { key: 'all', label: '全部', count: 54161 },
    { key: 'pendingInbound', label: '待入库', count: 15181 },
    { key: 'inbound', label: '已入库', count: 16918 },
    { key: 'pendingDispatch', label: '待配车', count: 27 },
    { key: 'loading', label: '装车', count: 12 },
    { key: 'booking', label: '约车', count: 35 },
    { key: 'outbound', label: '已出库', count: 21987 },
    { key: 'completed', label: '完结', count: 3 },
    { key: 'closed', label: '关闭', count: 0 }
  ];

  const PROGRESS_STEPS = ['待入库', '部分入库', '待配车', '待装车', '待约车', '已出库'];

  const STATUS_MAP = {
    pendingInbound: { label: '待入库', class: 'pending' },
    inbound: { label: '已入库', class: 'done' },
    pendingDispatch: { label: '待配车', class: 'ready' },
    loading: { label: '装车', class: 'processing' },
    booking: { label: '约车', class: 'processing' },
    outbound: { label: '已出库', class: 'done' },
    completed: { label: '完结', class: 'done' },
    closed: { label: '关闭', class: 'closed' }
  };

  const state = {
    activeStatus: 'all',
    keyword: '',
    warehouse: '',
    mergeType: '',
    currentPage: 1,
    pageSize: 20,
    totalPages: 1
  };

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatNumber = (value) => new Intl.NumberFormat('zh-CN').format(value);

  function showToast(type, title, desc) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-title">${escapeHtml(title)}</div><div class="toast-desc">${escapeHtml(desc)}</div>`;
    refs.toastStack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 240);
    }, 2200);
  }

  const COMPANIES = [
    { type: '内部子公司', name: '深圳市柏威国际科技物流有限公司长沙分公司', tagClass: '' },
    { type: '同行', name: '日通国际物流（中国）有限公司深圳分公司', tagClass: 'partner' },
    { type: '同行', name: '北京泽坤国际货运代理有限公司广州分公司', tagClass: 'partner' },
    { type: '同行', name: '广州海豚国际货物运输代理有限公司', tagClass: 'partner' },
    { type: '内部子公司', name: '深圳市运连网科技有限公司', tagClass: '' },
    { type: '同行', name: '上海捷迅国际货运代理有限公司', tagClass: 'partner' }
  ];

  const PREFIXES = ['YLWJT', 'BSISZ', 'BSICAN', 'BSIDG', 'YGRTSZX'];
  const WAREHOUSES = ['深圳兴围仓', '广州鸿祥仓', '深圳九通仓', '广州企航仓'];

  function buildOneOrder(options = {}) {
    const index = options.index ?? 0;
    const statusKeys = Object.keys(STATUS_MAP).filter(k => k !== 'closed');
    const statusKey = options.status ?? statusKeys[index % statusKeys.length];
    const info = STATUS_MAP[statusKey];
    const prefix = options.prefix ?? PREFIXES[index % PREFIXES.length];
    const serial = options.serial ?? (26000000 + index + 1);
    const company = options.company ?? COMPANIES[index % COMPANIES.length];
    const warehouse = options.warehouse ?? WAREHOUSES[index % WAREHOUSES.length];
    const pieces = options.pieces ?? [2, 37, 49, 100, 18, 82, 16, 9, 50][index % 9];
    const weight = options.weight ?? [300, 4, 519, 3000, 1313, 1199, 288, 124, 5637][index % 9];
    const volume = options.volume ?? [1.32, 0.7, 3.66, 15, 14.251, 9.099, 1.623, 0.925, 62.4][index % 9];
    const salespersons = ['YLWJT-Sales.YLWJT-Sale', 'Kevin.张清源', 'Sindy.黄文凤', 'Jevon.蔡新亮', 'Mila.胡杨'];
    const routePersons = ['Cindy.李娜', 'Cindy.李娜', 'Margaret.何施蔚', 'Dennis.赵广余', 'Annie.叶小靖'];
    const operators = ['Annie.叶小靖', 'Mila.胡杨', '--', 'Constance.袁玉珠', 'Xu.涂'];

    return {
      id: options.id ?? `order-${index}`,
      orderNo: `${prefix}${serial}`,
      status: statusKey,
      statusLabel: info.label,
      statusBadgeClass: info.class,
      createTime: options.createTime ?? `2026-04-0${(index % 7) + 1} ${String(16 + (index % 5)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00`,
      orderCode: `SNCSZX260407A${String(99000 + (index % 1000) + 1)}`,
      warehouse,
      masterNo: options.masterNo ?? `${String(300 + (index % 600)).padStart(3, '0')}-`,
      cutoffTime: options.cutoffTime ?? (index % 3 === 0 ? '--' : `2026-04-0${(index % 5) + 1} ${String(18 + (index % 4)).padStart(2, '0')}:30:00`),
      splitCount: 0,
      companyType: company.type,
      companyName: company.name,
      companyTagClass: company.tagClass,
      pieces,
      weight,
      volume,
      extraCount: 0,
      volumeWeight: '0kg',
      chargeWeight: '0kg',
      salesperson: options.salesperson ?? salespersons[index % salespersons.length],
      routePerson: options.routePerson ?? routePersons[index % routePersons.length],
      operator: options.operator ?? operators[index % operators.length],
      assistant: '--',
      warehouseOperator: options.warehouseOperator ?? '',
      isMergeParent: !!options.isMergeParent,
      isMergeChild: !!options.isMergeChild,
      mergeGroupNo: options.mergeGroupNo || '',
      mergeParentNo: options.mergeParentNo || '',
      mergeChildren: options.mergeChildren || []
    };
  }

  function buildMergeGroup(groupIndex, childCount = 3, baseIndex = 500) {
    const groupNo = `PG20260407${String(groupIndex).padStart(3, '0')}`;
    const parent = buildOneOrder({
      index: baseIndex,
      id: `order-merge-parent-${groupIndex}`,
      isMergeParent: true,
      mergeGroupNo: groupNo,
      mergeChildren: Array.from({ length: childCount }, (_, ci) => ({
        orderNo: `child-${String(ci + 1).padStart(2, '0')}`,
        pieces: 5 + ci * 3,
        weight: 80 + ci * 40,
        volume: (0.8 + ci * 0.3).toFixed(2),
        statusLabel: '待入库'
      })),
      pieces: 50 + childCount * 5,
      weight: 500 + childCount * 50,
      volume: 5.5 + childCount * 0.8,
      salesperson: 'Sindy.黄文凤',
      routePerson: 'Cindy.李娜',
      operator: 'Annie.叶小靖'
    });

    const children = Array.from({ length: childCount }, (_, ci) => buildOneOrder({
      index: baseIndex + ci + 1,
      id: `order-merge-child-${groupIndex}-${ci}`,
      prefix: 'CHILD',
      serial: 26050000 + groupIndex * 100 + ci + 1,
      isMergeChild: true,
      mergeGroupNo: groupNo,
      mergeParentNo: parent.orderNo,
      masterNo: parent.masterNo,
      status: parent.status,
      warehouse: parent.warehouse,
      createTime: `2026-04-0${(ci % 7) + 1} ${String(10 + (ci % 5)).padStart(2, '0')}:${String((ci * 11) % 60).padStart(2, '0')}:00`,
      pieces: 5 + ci * 3,
      weight: 80 + ci * 40,
      volume: 0.8 + ci * 0.3,
      salesperson: ['Kevin.张清源', 'Mila.胡杨', 'Jevon.蔡新亮'][ci % 3],
      routePerson: ['Margaret.何施蔚', 'Dennis.赵广余', 'Annie.叶小靖'][ci % 3],
      operator: ['Constance.袁玉珠', 'Xu.涂', 'Annie.叶小靖'][ci % 3]
    }));

    return [parent, ...children];
  }

  const normalOrders = Array.from({ length: 80 }, (_, index) => buildOneOrder({ index }));
  const mergeGroup1 = buildMergeGroup(1, 3, 900);
  const mergeGroup2 = buildMergeGroup(2, 2, 910);
  const mergeGroup3 = buildMergeGroup(3, 4, 920);
  const mergeGroup4 = buildMergeGroup(4, 3, 930);
  const mergeGroup5 = buildMergeGroup(5, 2, 940);

  const allOrders = [
    ...mergeGroup1,
    ...normalOrders.slice(0, 15),
    ...mergeGroup2,
    ...normalOrders.slice(15, 35),
    ...mergeGroup3,
    ...normalOrders.slice(35, 55),
    ...mergeGroup4,
    ...normalOrders.slice(55, 70),
    ...mergeGroup5,
    ...normalOrders.slice(70)
  ];

  function getFilteredOrders() {
    const keyword = state.keyword.trim();
    return allOrders.filter((item) => {
      if (state.activeStatus !== 'all' && item.status !== state.activeStatus) return false;
      if (state.warehouse && item.warehouse !== state.warehouse) return false;
      if (state.mergeType) {
        if (state.mergeType === 'parent' && !item.isMergeParent) return false;
        if (state.mergeType === 'child' && !item.isMergeChild) return false;
        if (state.mergeType === 'normal' && (item.isMergeParent || item.isMergeChild)) return false;
      }
      if (!keyword) return true;
      const fields = [item.orderNo, item.orderCode, item.companyName, item.masterNo, item.mergeGroupNo];
      return fields.some((v) => String(v || '').toLowerCase().includes(keyword.toLowerCase()));
    });
  }

  function buildPageList(totalPages, currentPage) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }

  function renderProgress(statusLabel, warehouse, order) {
    const currentIndex = PROGRESS_STEPS.indexOf(statusLabel);
    const stepsHtml = PROGRESS_STEPS.map((step, idx) => {
      let cls = '';
      if (step === statusLabel) cls = 'active';
      else if (currentIndex !== -1 && idx < currentIndex) cls = 'completed';
      return `<span class="progress-step ${cls}">${escapeHtml(step)}</span>`;
    }).join('<span class="progress-arrow"><i class="ri-arrow-right-s-line"></i></span>');

    const extraBadge = order?.isMergeParent
      ? `<span class="merge-summary-badge">拼单主单·共${order.mergeChildren.length}票子单</span>`
      : order?.isMergeChild
        ? `<span class="merge-child-badge">子单·属 ${escapeHtml(order.mergeParentNo)}</span>`
        : '';

    return `<div class="progress-wrap"><div class="progress-warehouse">${escapeHtml(warehouse)} ${extraBadge}</div><div class="progress-track">${stepsHtml}</div></div>`;
  }

  function renderPerson(name) {
    if (!name || name === '--') return '--';
    return `<span class="person-value" title="${escapeHtml(name)}"><span class="person-avatar">${escapeHtml(String(name).charAt(0).toUpperCase())}</span>${escapeHtml(name)}</span>`;
  }

  function renderStatusTabs() {
    refs.statusTabs.innerHTML = STATUS_OPTIONS.map((status) => {
      const activeClass = status.key === state.activeStatus ? 'status-tab active' : 'status-tab';
      const countText = status.count > 0 ? `(${formatNumber(status.count)})` : '(0)';
      return `<button class="${activeClass}" type="button" data-status="${status.key}">${status.label}<span class="count">${countText}</span></button>`;
    }).join('');
  }

  function renderPagination(totalPages) {
    state.totalPages = totalPages;
    const pages = buildPageList(totalPages, state.currentPage);
    refs.pageBtnGroup.innerHTML = [
      `<button class="page-btn ${state.currentPage === 1 ? 'disabled' : ''}" type="button" data-page="prev">&lt;</button>`,
      ...pages.map((page) => page === '...' ? '<span class="page-ellipsis">...</span>' : `<button class="page-btn ${page === state.currentPage ? 'active' : ''}" type="button" data-page="${page}">${page}</button>`),
      `<button class="page-btn ${state.currentPage === totalPages ? 'disabled' : ''}" type="button" data-page="next">&gt;</button>`
    ].join('');
  }

  function renderCard(order) {
    const mergeTag = order.isMergeParent
      ? '<span class="merge-tag merge-parent-tag">拼单主单</span>'
      : order.isMergeChild
        ? '<span class="merge-tag merge-child-tag">子单</span>'
        : '';

    const progressHtml = renderProgress(order.statusLabel, order.warehouse, order);

    return `
      <div class="order-card" data-id="${escapeHtml(order.id)}">
        <div class="card-body">
          <div class="info-section">
            <div class="order-title-row">
              <span class="order-no">${escapeHtml(order.orderNo)}</span>
              <span class="status-badge ${order.statusBadgeClass}">${escapeHtml(order.statusLabel)}</span>
              ${mergeTag}
            </div>
            <div class="create-time">创建时间：${escapeHtml(order.createTime)}</div>
            <div class="info-row"><span class="info-label">订单号码：</span><span class="info-value">${escapeHtml(order.orderCode)}</span></div>
          </div>
          <div class="info-section">
            <div class="info-row"><span class="info-label">主单号：</span><span class="info-value primary">${escapeHtml(order.masterNo)}</span></div>
            <div class="info-row"><span class="info-label">截单时间：</span><span class="info-value">${escapeHtml(order.cutoffTime)}</span></div>
            <div class="info-row"><span class="info-label">分单数量：</span><span class="info-value">${escapeHtml(order.splitCount)}</span></div>
          </div>
          <div class="info-section">
            <div class="info-row">
              <span class="company-tag ${order.companyTagClass}">${escapeHtml(order.companyType)}</span>
              <span class="company-name" title="${escapeHtml(order.companyName)}">${escapeHtml(order.companyName)}</span>
            </div>
            <div class="cargo-stats">
              <span class="info-value brand">${formatNumber(order.pieces)}</span><span>件</span><span class="sep">|</span>
              <span class="info-value brand">${formatNumber(order.weight)}</span><span>kg</span><span class="sep">|</span>
              <span class="info-value brand">${order.volume}</span><span>m³</span><span class="sep">|</span>
              <span class="zero">${order.extraCount}</span>
            </div>
            <div class="info-row"><span class="info-label">体积重：</span><span class="info-value">${escapeHtml(order.volumeWeight)}</span><span class="info-label" style="margin-left:12px;">计费重：</span><span class="info-value">${escapeHtml(order.chargeWeight)}</span></div>
          </div>
          <div class="person-section">
            <div class="person-row"><span class="person-label">业务人员：</span>${renderPerson(order.salesperson)}</div>
            <div class="person-row"><span class="person-label">航线人员：</span>${renderPerson(order.routePerson)}</div>
            <div class="person-row"><span class="person-label">操作人员：</span>${renderPerson(order.operator)}</div>
            <div class="person-row"><span class="person-label">协助操作：</span>${renderPerson(order.assistant)}</div>
            <div class="person-row"><span class="person-label">库内操作：</span>${renderPerson(order.warehouseOperator || '--')}</div>
          </div>
        </div>
        <div class="card-footer">
          ${progressHtml}
          <div class="action-row">
            <a class="action-link" href="javascript:void(0)" data-action="detail" data-id="${escapeHtml(order.id)}">查看详情 <i class="ri-arrow-right-s-line"></i></a>
          </div>
        </div>
      </div>
    `;
  }

  function renderList() {
    const orders = getFilteredOrders();
    const total = orders.length;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    const start = (state.currentPage - 1) * state.pageSize;
    const pageOrders = orders.slice(start, start + state.pageSize);

    refs.orderCardList.innerHTML = total
      ? pageOrders.map((order, index) => renderCard(order, index, pageOrders)).join('')
      : '<div class="empty-state">--</div>';

    refs.totalCountText.textContent = `共${formatNumber(total)}条记录`;
    refs.jumpInput.value = String(state.currentPage);
    renderPagination(totalPages);
  }

  refs.statusTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status]');
    if (!button) return;
    state.activeStatus = button.dataset.status;
    state.currentPage = 1;
    renderStatusTabs();
    renderList();
  });

  refs.queryBtn.addEventListener('click', () => {
    state.keyword = refs.keywordInput.value.trim();
    state.warehouse = refs.warehouseSelect.value;
    state.mergeType = refs.mergeTypeSelect.value;
    state.currentPage = 1;
    renderList();
  });

  refs.resetBtn.addEventListener('click', () => {
    state.activeStatus = 'all';
    state.keyword = '';
    state.warehouse = '';
    state.mergeType = '';
    state.currentPage = 1;
    state.pageSize = 20;
    refs.keywordInput.value = '';
    refs.warehouseSelect.value = '';
    refs.mergeTypeSelect.value = '';
    refs.pageSizeSelect.value = '20';
    renderStatusTabs();
    renderList();
    showToast('success', '已重置', '查询条件已恢复默认值，列表重新加载完成。');
  });

  refs.keywordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      state.keyword = refs.keywordInput.value.trim();
      state.warehouse = refs.warehouseSelect.value;
      state.mergeType = refs.mergeTypeSelect.value;
      state.currentPage = 1;
      renderList();
    }
  });

  refs.orderCardList.addEventListener('click', (event) => {
    const link = event.target.closest('[data-action="detail"]');
    if (!link) return;
    const id = link.dataset.id;
    const order = allOrders.find((o) => o.id === id);
    showToast('success', '查看详情', `已打开订单 ${order ? order.orderNo : id} 的详情页面。`);
  });

  refs.pageBtnGroup.addEventListener('click', (event) => {
    const button = event.target.closest('.page-btn');
    if (!button || button.classList.contains('disabled')) return;
    const pageValue = button.dataset.page;
    if (pageValue === 'prev') state.currentPage = Math.max(1, state.currentPage - 1);
    else if (pageValue === 'next') state.currentPage = Math.min(state.totalPages, state.currentPage + 1);
    else state.currentPage = Number(pageValue);
    renderList();
  });

  refs.pageSizeSelect.addEventListener('change', () => {
    state.pageSize = Number(refs.pageSizeSelect.value);
    state.currentPage = 1;
    renderList();
  });

  refs.jumpInput.addEventListener('input', () => {
    refs.jumpInput.value = refs.jumpInput.value.replace(/\D/g, '');
  });

  refs.jumpInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const targetPage = Number(refs.jumpInput.value || '1');
    if (!targetPage || targetPage < 1 || targetPage > state.totalPages) {
      showToast('error', '页码无效', `请输入1-${state.totalPages}之间的页码。`);
      refs.jumpInput.value = String(state.currentPage);
      return;
    }
    state.currentPage = targetPage;
    renderList();
  });

  renderStatusTabs();
  renderList();
})();
