(() => {
  const $ = (id) => document.getElementById(id);
  const refs = {
    statusTabs: $('statusTabs'),
    keywordInput: $('keywordInput'),
    queryBtn: $('queryBtn'),
    resetBtn: $('resetBtn'),
    primaryActionBtn: $('primaryActionBtn'),
    selectionTip: $('selectionTip'),
    panelExtra: $('panelExtra'),
    tableColGroup: $('tableColGroup'),
    tableHead: $('tableHead'),
    tableBody: $('tableBody'),
    totalCountText: $('totalCountText'),
    pageBtnGroup: $('pageBtnGroup'),
    pageSizeSelect: $('pageSizeSelect'),
    jumpInput: $('jumpInput'),
    toastStack: $('toastStack')
  };

  const STATUS_OPTIONS = [
    { key: 'pendingDispatch', label: '待配车', count: 27 },
    { key: 'assigned', label: '已配车', count: 12 },
    { key: 'pendingBooking', label: '待约车', count: 27 },
    { key: 'readyToDepart', label: '可发车', count: 18 },
    { key: 'departed', label: '已发车', count: 14289 }
  ];

  const state = {
    activeStatus: 'pendingDispatch',
    keyword: '',
    currentPage: 1,
    pageSize: 20,
    totalPages: 1,
    selectedIds: new Set()
  };

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatNumber = (value) => new Intl.NumberFormat('zh-CN').format(value);
  const formatVolume = (value) => String(value.toFixed(4)).replace(/0+$/, '').replace(/\.$/, '');
  const formatCargo = (row) => `${formatNumber(row.pieces)} / ${formatNumber(row.weight)} / ${formatVolume(row.volume)} / ${row.palletCount}`;

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

  function createRow(partial = {}) {
    return {
      id: '',
      workNo: '--',
      masterNo: '--',
      cutoffTime: '--',
      warehouse: '--',
      deliveryPoint: '--',
      receiver: '--',
      pieces: 0,
      weight: 0,
      volume: 0,
      palletCount: 0,
      remark: '--',
      createdTime: '--',
      mergeGroupNo: '',
      mergeGroupSize: 0,
      canAgv: true,
      ...partial
    };
  }

  function buildMergeRows(groupNo, masterNo, warehouse, deliveryPoint, receiver, items) {
    return items.map((item) => createRow({
      ...item,
      masterNo,
      warehouse,
      deliveryPoint,
      receiver,
      mergeGroupNo: groupNo,
      mergeGroupSize: items.length
    }));
  }

  function buildStandardRows(count, statusKey, seed) {
    return Array.from({ length: count }, (_, index) => {
      const serial = seed * 100 + index + 1;
      return createRow({
        id: `${statusKey}-${serial}`,
        workNo: `${index % 2 === 0 ? 'BSISZ' : 'YLWJT'}${26000000 + serial}`,
        masterNo: `${String(300 + (serial % 600)).padStart(3, '0')}-${String(620000000 + serial * 37).padStart(9, '0')}`,
        cutoffTime: statusKey === 'departed' ? '--' : `2026-04-0${(index % 3) + 1} ${String(18 + (index % 4)).padStart(2, '0')}:30:00`,
        warehouse: index % 3 === 0 ? '深圳兴围仓' : index % 3 === 1 ? '广州鸿祥仓' : '深圳九通仓',
        deliveryPoint: index % 2 === 0 ? 'T1-直飞报关' : 'CANXH-BC报关',
        receiver: index % 2 === 0 ? '[练丙煌] 深圳市柏威国际科技物流有限公司' : '[杨文锋] 深圳市柏威国际科技物流有限公司',
        pieces: 5 + index * 2,
        weight: 180 + index * 31,
        volume: 0.92 + index * 0.22,
        palletCount: (index % 4) + 1,
        remark: index % 4 === 0 ? '--' : '按标准流程处理',
        createdTime: `2026-04-0${(index % 3) + 1} ${String(9 + (index % 7)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}:00`,
        canAgv: index % 5 !== 0
      });
    });
  }

  const store = {
    pendingDispatch: [],
    pendingBooking: buildStandardRows(27, 'pendingBooking', 81),
    readyToDepart: buildStandardRows(18, 'readyToDepart', 91),
    departed: buildStandardRows(24, 'departed', 111),
    assignedGroups: []
  };

  store.pendingDispatch = [
    ...buildMergeRows('PH20260403001', '936-02098040', '深圳兴围仓', 'T1-直飞报关', '[练丙煌] 深圳市柏威国际科技物流有限公司', [
      { id: 'pd-001', workNo: 'BSISZ26040151', cutoffTime: '2026-04-03 18:30:00', pieces: 8, weight: 4081, volume: 9.984, palletCount: 8, remark: '所有货物外箱都需要贴航空标签', createdTime: '2026-04-03 15:47:07' },
      { id: 'pd-002', workNo: 'BSISZ26040037', cutoffTime: '2026-04-03 18:30:00', pieces: 98, weight: 1351, volume: 6.0852, palletCount: 4, remark: '需要回传PID标签普货照片', createdTime: '2026-04-03 15:43:53' },
      { id: 'pd-003', workNo: 'BSISZ26039996', cutoffTime: '2026-04-03 18:30:00', pieces: 12, weight: 825, volume: 2.146, palletCount: 2, remark: '优先安排同车发运', createdTime: '2026-04-03 15:39:12', canAgv: false }
    ]),
    ...buildMergeRows('PH20260403002', '784-83265022', '深圳兴围仓', 'T1-直飞报关', '[练丙煌] 深圳市柏威国际科技物流有限公司', [
      { id: 'pd-004', workNo: 'YGRTSZX26040039', cutoffTime: '2026-04-03 19:00:00', pieces: 24, weight: 187, volume: 2.632, palletCount: 2, remark: '需和同组订单统一打印航空标签', createdTime: '2026-04-03 15:52:26' },
      { id: 'pd-005', workNo: 'YGRTSZX26040012', cutoffTime: '2026-04-03 19:00:00', pieces: 18, weight: 162, volume: 1.842, palletCount: 1, remark: '货站要求主单下统一拼货交接', createdTime: '2026-04-03 15:48:10' }
    ]),
    ...buildMergeRows('PH20260403003', '695-61095602', '深圳兴围仓', 'T1-直飞报关', '[练丙煌] 深圳市柏威国际科技物流有限公司', [
      { id: 'pd-006', workNo: 'BSISZ26032742', cutoffTime: '2026-04-03 19:15:00', pieces: 22, weight: 612, volume: 14.4296, palletCount: 10, remark: '--', createdTime: '2026-04-03 15:48:05' },
      { id: 'pd-007', workNo: 'BSISZ26032751', cutoffTime: '2026-04-03 19:15:00', pieces: 11, weight: 280, volume: 6.1584, palletCount: 5, remark: '标签需显示拼货后总件数', createdTime: '2026-04-03 15:41:28' }
    ]),
    ...buildMergeRows('PH20260403004', '978-23592041', '广州鸿祥仓', 'CANXH-BC报关', '[杨文锋] 深圳市柏威国际科技物流有限公司', [
      { id: 'pd-008', workNo: 'YLWJT26030157', cutoffTime: '2026-04-03 20:00:00', pieces: 82, weight: 1199.5, volume: 9.0992, palletCount: 6, remark: '--', createdTime: '2026-03-13 11:09:03', canAgv: false },
      { id: 'pd-009', workNo: 'YLWJT26030158', cutoffTime: '2026-04-03 20:00:00', pieces: 16, weight: 288.4, volume: 1.6238, palletCount: 2, remark: '同组货物需一起放行', createdTime: '2026-03-13 10:58:11', canAgv: false },
      { id: 'pd-010', workNo: 'YLWJT26030159', cutoffTime: '2026-04-03 20:00:00', pieces: 9, weight: 124.8, volume: 0.925, palletCount: 1, remark: '--', createdTime: '2026-03-13 10:41:45' }
    ]),
    ...buildMergeRows('PH20260403005', '550-50071416', '深圳九通仓', '--', '--', [
      { id: 'pd-011', workNo: 'YLWJT26012746', cutoffTime: '--', pieces: 50, weight: 5637, volume: 62.4, palletCount: 47, remark: '同组需共用一套主标签', createdTime: '2026-01-28 09:48:08' },
      { id: 'pd-012', workNo: 'YLWJT26014671', cutoffTime: '--', pieces: 18, weight: 1313, volume: 14.251, palletCount: 11, remark: '--', createdTime: '2026-01-28 09:37:14' }
    ]),
    ...buildStandardRows(15, 'pendingDispatch', 71)
  ].slice(0, 27);

  store.assignedGroups = [
    {
      id: 'car-ahe855', carNo: '粤AHE855', driverName: '王师傅', loadBoardCount: 0, loader: '--', supervisor: 'Wen.QH王静雯', sealNo: '--', statusDot: 'warning', actions: ['print'],
      rows: [
        createRow({ id: 'as-001', workNo: 'BSICSX25120539', masterNo: '784-82209190', warehouse: '广州企航仓', deliveryPoint: 'CANCZ-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 51, weight: 479, volume: 3.42489, palletCount: 2 }),
        createRow({ id: 'as-002', workNo: 'BSISZ25122557', masterNo: '784-82497472', warehouse: '广州企航仓', deliveryPoint: 'CANCZ-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 11, weight: 142, volume: 0.56621, palletCount: 1 }),
        createRow({ id: 'as-003', workNo: 'BSISZ25122701', masterNo: '784-68570036', warehouse: '广州企航仓', deliveryPoint: 'CANCZ-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 1, weight: 426, volume: 0.6448, palletCount: 1 }),
        createRow({ id: 'as-004', workNo: 'BSIDG25120842', masterNo: '784-82209525', warehouse: '广州企航仓', deliveryPoint: 'CANCZ-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 11, weight: 107, volume: 0.51744, palletCount: 1 })
      ]
    },
    {
      id: 'car-aht563', carNo: '粤AHT563', driverName: '陈师傅', loadBoardCount: 0, loader: '--', supervisor: 'Wen.QH王静雯', sealNo: '--', statusDot: 'warning', actions: ['print'],
      rows: [
        createRow({ id: 'as-005', workNo: 'BSISZ25122714', masterNo: '994-32418842', warehouse: '广州企航仓', deliveryPoint: 'CANXH-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 2, weight: 750, volume: 1.815, palletCount: 2 }),
        createRow({ id: 'as-006', workNo: 'BSICAN25120624', masterNo: '994-32422585', warehouse: '广州企航仓', deliveryPoint: 'CANXH-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 12, weight: 1364, volume: 19.584, palletCount: 8 })
      ]
    },
    {
      id: 'car-bb8888', carNo: '粤BB8888', driverName: '徐师傅', loadBoardCount: 3, loader: 'Xu.涂', supervisor: 'Xu.涂', sealNo: 'SZ889177', statusDot: 'ready', actions: ['print', 'sendBooking', 'cancel'],
      rows: buildMergeRows('PH20260403001', '936-02098040', '深圳兴围仓', 'T1-直飞报关', '[练丙煌] 深圳市柏威国际科技物流有限公司', [
        { id: 'as-007', workNo: 'BSISZ26040151', cutoffTime: '2026-04-03 18:30:00', pieces: 8, weight: 4081, volume: 9.984, palletCount: 8, remark: '拼货后按整组装车' },
        { id: 'as-008', workNo: 'BSISZ26040037', cutoffTime: '2026-04-03 18:30:00', pieces: 98, weight: 1351, volume: 6.0852, palletCount: 4, remark: '与同组订单统一打印标签' },
        { id: 'as-009', workNo: 'BSISZ26039996', cutoffTime: '2026-04-03 18:30:00', pieces: 12, weight: 825, volume: 2.146, palletCount: 2, remark: '已并入同车同批次发运' }
      ])
    },
    {
      id: 'car-a9fu89', carNo: '粤A9FU89', driverName: '李师傅', loadBoardCount: 0, loader: '--', supervisor: 'Wen.QH王静雯', sealNo: '--', statusDot: 'warning', actions: ['print'],
      rows: [createRow({ id: 'as-010', workNo: 'BSISZ25100844', masterNo: '994-32404514', warehouse: '广州企航仓', deliveryPoint: 'CANXH-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 3, weight: 30, volume: 0.21546, palletCount: 2 })]
    },
    {
      id: 'car-aga967', carNo: '粤AGA967', driverName: '刘师傅', loadBoardCount: 0, loader: '--', supervisor: 'Li.QH钟燕丽', sealNo: '--', statusDot: 'warning', actions: ['print'],
      rows: [
        createRow({ id: 'as-011', workNo: 'BSISZ25081827', masterNo: '994-32385743', warehouse: '广州企航仓', deliveryPoint: 'CANXH-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 44, weight: 833, volume: 3.99168, palletCount: 2 }),
        createRow({ id: 'as-012', workNo: 'BSISZ25081842', masterNo: '071-57869372', warehouse: '广州企航仓', deliveryPoint: 'CANXH-直飞报关', receiver: '[杨文辉] 深圳市柏威国际科技物流有限公司', pieces: 4, weight: 187, volume: 1.488325, palletCount: 1 })
      ]
    }
  ];

  function getPages(items, size, getLen) {
    const pages = [];
    let current = [];
    let count = 0;
    items.forEach((item) => {
      const len = getLen(item);
      if (count > 0 && count + len > size) {
        pages.push(current);
        current = [];
        count = 0;
      }
      current.push(item);
      count += len;
    });
    if (current.length) pages.push(current);
    return pages.length ? pages : [[]];
  }

  function buildPageList(totalPages, currentPage) {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }

  function getGenericRows() {
    const keyword = state.keyword.trim();
    const rows = store[state.activeStatus].filter((row) => !keyword || [row.workNo, row.masterNo, row.mergeGroupNo].some((value) => String(value || '').includes(keyword)));
    const mergeMap = new Map();
    const normalRows = [];
    rows.forEach((row) => {
      if (row.mergeGroupNo) {
        if (!mergeMap.has(row.mergeGroupNo)) mergeMap.set(row.mergeGroupNo, []);
        mergeMap.get(row.mergeGroupNo).push(row);
      } else {
        normalRows.push(row);
      }
    });
    const merged = Array.from(mergeMap.values())
      .sort((a, b) => b[0].createdTime.localeCompare(a[0].createdTime))
      .flatMap((group) => group.sort((a, b) => a.createdTime.localeCompare(b.createdTime)));
    return [...merged, ...normalRows.sort((a, b) => b.createdTime.localeCompare(a.createdTime))];
  }

  function getAssignedGroups() {
    const keyword = state.keyword.trim();
    return store.assignedGroups.map((group) => {
      const groupHit = [group.carNo, group.driverName, group.loader, group.supervisor, group.sealNo].some((value) => String(value || '').includes(keyword));
      const visibleRows = !keyword || groupHit
        ? group.rows
        : group.rows.filter((row) => [row.workNo, row.masterNo, row.mergeGroupNo].some((value) => String(value || '').includes(keyword)));
      return visibleRows.length ? { ...group, visibleRows } : null;
    }).filter(Boolean);
  }

  function findRow(rowId) {
    for (const key of ['pendingDispatch', 'pendingBooking', 'readyToDepart', 'departed']) {
      const row = store[key].find((item) => item.id === rowId);
      if (row) return row;
    }
    for (const group of store.assignedGroups) {
      const row = group.rows.find((item) => item.id === rowId);
      if (row) return row;
    }
    return null;
  }

  function findAssignedGroup(groupId) {
    return store.assignedGroups.find((group) => group.id === groupId) || null;
  }

  function renderStatusTabs() {
    refs.statusTabs.innerHTML = STATUS_OPTIONS.map((status) => {
      const activeClass = status.key === state.activeStatus ? 'status-tab active' : 'status-tab';
      return `<button class="${activeClass}" type="button" data-status="${status.key}">${status.label}<span class="count">(${status.count})</span></button>`;
    }).join('');
  }

  function renderToolbar() {
    if (state.activeStatus === 'assigned') {
      refs.primaryActionBtn.textContent = '组托列表(1414)';
      refs.primaryActionBtn.classList.remove('btn-primary', 'is-disabled');
      refs.primaryActionBtn.classList.add('btn-default');
      refs.selectionTip.textContent = '按车牌聚合展示，含配车后的拼货订单示例';
      refs.panelExtra.innerHTML = '<div class="panel-tools"><button class="icon-btn" type="button" title="刷新"><i class="ri-refresh-line"></i></button><button class="icon-btn" type="button" title="导出"><i class="ri-download-2-line"></i></button><button class="icon-btn" type="button" title="查看列设置"><i class="ri-settings-4-line"></i></button></div>';
      return;
    }
    refs.primaryActionBtn.textContent = '配车';
    refs.primaryActionBtn.classList.remove('btn-default');
    refs.primaryActionBtn.classList.add('btn-primary');
    refs.panelExtra.innerHTML = '<div class="legend-group"><span class="legend-item"><span class="legend-line"></span>同组订单用连线串联</span></div>';
  }

  function renderGenericHead() {
    refs.tableColGroup.innerHTML = '<col style="width: 3%"><col style="width: 10%"><col style="width: 12%"><col style="width: 10%"><col style="width: 9%"><col style="width: 10%"><col style="width: 16%"><col style="width: 10%"><col style="width: 11%"><col style="width: 10%"><col style="width: 9%">';
    refs.tableHead.innerHTML = '<tr><th class="cell-center check-cell-head"><input id="selectAllCheckbox" class="checkbox-input" type="checkbox" aria-label="全选当前页"></th><th>工作单号</th><th>主单号</th><th>截单时间</th><th>所属仓库</th><th>送货点</th><th>接货人</th><th>件/重/体/板数</th><th>备注</th><th>创建时间</th><th>操作</th></tr>';
  }

  function renderAssignedHead() {
    refs.tableColGroup.innerHTML = '<col style="width: 8%"><col style="width: 10%"><col style="width: 8%"><col style="width: 8%"><col style="width: 7%"><col style="width: 10%"><col style="width: 16%"><col style="width: 10%"><col style="width: 6%"><col style="width: 7%"><col style="width: 8%"><col style="width: 8%"><col style="width: 4%"><col style="width: 10%">';
    refs.tableHead.innerHTML = '<tr><th>车牌号码</th><th>工作单号</th><th>主单号</th><th>截单时间</th><th>所属仓库</th><th>送货点</th><th>接货人</th><th>件/重/体/板数</th><th>装车板数</th><th>装车人</th><th>监装人</th><th>封条号</th><th>状态</th><th>操作</th></tr>';
  }

  function getMergeMeta(rows, index, row) {
    if (!row.mergeGroupNo) return { position: '', anchor: false, shift: '0px' };
    let start = index;
    let end = index;
    while (start > 0 && rows[start - 1]?.mergeGroupNo === row.mergeGroupNo) start -= 1;
    while (end < rows.length - 1 && rows[end + 1]?.mergeGroupNo === row.mergeGroupNo) end += 1;
    const anchorIndex = Math.floor((start + end) / 2);
    return {
      position: start === end ? 'is-solo' : index === start ? 'is-start' : index === end ? 'is-end' : 'is-middle',
      anchor: index === anchorIndex,
      shift: rows.length % 2 === 0 && index === anchorIndex ? '50%' : '0px'
    };
  }

  function updateSelectionSummary(rows, currentRows) {
    const selectedRows = rows.filter((row) => state.selectedIds.has(row.id));
    if (!selectedRows.length) {
      refs.selectionTip.textContent = '未选择订单';
      refs.primaryActionBtn.classList.add('is-disabled');
    } else {
      const groupCount = new Set(selectedRows.filter((row) => row.mergeGroupNo).map((row) => row.mergeGroupNo)).size;
      const pieceTotal = selectedRows.reduce((sum, row) => sum + row.pieces, 0);
      refs.selectionTip.innerHTML = `已选择<strong>${selectedRows.length}</strong>票订单，含<strong>${groupCount}</strong>个拼货组，合计<strong>${formatNumber(pieceTotal)}</strong>件`;
      refs.primaryActionBtn.classList.remove('is-disabled');
    }
    const checkbox = document.getElementById('selectAllCheckbox');
    if (!checkbox) return;
    const selectedCount = currentRows.filter((row) => state.selectedIds.has(row.id)).length;
    checkbox.checked = currentRows.length > 0 && selectedCount === currentRows.length;
    checkbox.indeterminate = selectedCount > 0 && selectedCount < currentRows.length;
  }

  function renderPagination(totalPages) {
    state.totalPages = totalPages;
    const pages = buildPageList(totalPages, state.currentPage);
    refs.pageBtnGroup.innerHTML = [`<button class="page-btn ${state.currentPage === 1 ? 'disabled' : ''}" type="button" data-page="prev">&lt;</button>`, ...pages.map((page) => page === '...' ? '<span class="page-ellipsis">...</span>' : `<button class="page-btn ${page === state.currentPage ? 'active' : ''}" type="button" data-page="${page}">${page}</button>`), `<button class="page-btn ${state.currentPage === totalPages ? 'disabled' : ''}" type="button" data-page="next">&gt;</button>`].join('');
  }

  function renderGenericTable() {
    const rows = getGenericRows();
    const buckets = rows.reduce((list, row) => {
      if (row.mergeGroupNo && list.length && list[list.length - 1][0].mergeGroupNo === row.mergeGroupNo) list[list.length - 1].push(row);
      else list.push([row]);
      return list;
    }, []);
    const pages = getPages(buckets, state.pageSize, (bucket) => bucket.length);
    const totalPages = Math.max(pages.length, 1);
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    const currentRows = (pages[state.currentPage - 1] || []).flat();

    renderGenericHead();
    updateSelectionSummary(rows, currentRows);
    refs.tableBody.innerHTML = currentRows.length ? currentRows.map((row, index) => {
      const meta = getMergeMeta(currentRows, index, row);
      const marker = row.mergeGroupNo ? `<span class="group-marker ${meta.position}" aria-hidden="true"></span>${meta.anchor ? `<span class="group-anchor" style="--anchor-shift:${meta.shift}"><span class="group-anchor-icon" aria-hidden="true"><i class="ri-links-line"></i></span><span class="group-tooltip" role="tooltip">组号:${escapeHtml(row.mergeGroupNo)}</span></span>` : ''}` : '';
      const tag = row.mergeGroupNo ? '<span class="merge-order-tag">拼货</span>' : '';
      return `<tr class="${state.selectedIds.has(row.id) ? 'selected-row' : ''}" ${row.mergeGroupNo ? `data-group="${escapeHtml(row.mergeGroupNo)}"` : ''}><td class="check-cell">${marker}<input class="checkbox-input row-checkbox" type="checkbox" data-row-id="${escapeHtml(row.id)}" ${state.selectedIds.has(row.id) ? 'checked' : ''} aria-label="选择${escapeHtml(row.workNo)}"></td><td><span class="work-order-cell"><a class="work-order-link" href="javascript:void(0)" data-row-action="detail" data-row-id="${escapeHtml(row.id)}">${escapeHtml(row.workNo)}</a>${tag}</span></td><td><div class="master-code">${escapeHtml(row.masterNo)}</div></td><td>${escapeHtml(row.cutoffTime || '--')}</td><td>${escapeHtml(row.warehouse || '--')}</td><td>${escapeHtml(row.deliveryPoint || '--')}</td><td class="truncate-cell" title="${escapeHtml(row.receiver || '--')}">${escapeHtml(row.receiver || '--')}</td><td class="cargo-value">${escapeHtml(formatCargo(row))}</td><td class="truncate-cell remark-text" title="${escapeHtml(row.remark || '--')}">${escapeHtml(row.remark || '--')}</td><td>${escapeHtml(row.createdTime || '--')}</td><td><a class="action-link" href="javascript:void(0)" data-row-action="print" data-row-id="${escapeHtml(row.id)}">打印</a>${row.canAgv ? `<a class="action-link" href="javascript:void(0)" data-row-action="agv" data-row-id="${escapeHtml(row.id)}">呼叫AGV</a>` : ''}<a class="action-link" href="javascript:void(0)" data-row-action="dispatch" data-row-id="${escapeHtml(row.id)}">配车</a></td></tr>`;
    }).join('') : '<tr class="empty-row"><td colspan="11">--</td></tr>';

    refs.totalCountText.textContent = `共${rows.length}条记录`;
    refs.jumpInput.value = String(state.currentPage);
    renderPagination(totalPages);
  }

  function renderPerson(value) {
    if (!value || value === '--') return '--';
    return `<span class="assigned-person"><span class="assigned-avatar">${escapeHtml(String(value).charAt(0).toUpperCase())}</span><span>${escapeHtml(value)}</span></span>`;
  }

  function renderAssignedTable() {
    const groups = getAssignedGroups();
    const pages = getPages(groups, state.pageSize, (group) => group.visibleRows.length);
    const totalPages = Math.max(pages.length, 1);
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    const currentGroups = pages[state.currentPage - 1] || [];
    const totalCount = groups.reduce((sum, group) => sum + group.visibleRows.length, 0);

    renderAssignedHead();
    refs.selectionTip.textContent = '按车牌聚合展示，含配车后的拼货订单示例';
    refs.tableBody.innerHTML = totalCount ? currentGroups.map((group) => {
      const rowCount = group.visibleRows.length;
      const actions = group.actions.map((action) => {
        const label = { print: '打印', sendBooking: '发送约车', cancel: '撤销' }[action];
        return `<a class="action-link${action === 'cancel' ? ' danger' : ''}" href="javascript:void(0)" data-group-action="${action}" data-group-id="${escapeHtml(group.id)}">${label}</a>`;
      }).join('');
      return group.visibleRows.map((row, index) => {
        const meta = getMergeMeta(group.visibleRows, index, row);
        const marker = row.mergeGroupNo ? `<span class="group-marker ${meta.position}" aria-hidden="true"></span>${meta.anchor ? `<span class="group-anchor" style="--anchor-shift:${meta.shift}"><span class="group-anchor-icon" aria-hidden="true"><i class="ri-links-line"></i></span><span class="group-tooltip group-tooltip-inline">组号:${escapeHtml(row.mergeGroupNo)}</span></span>` : ''}` : '';
        const tag = row.mergeGroupNo ? '<span class="merge-order-tag">拼货</span>' : '';
        return `<tr class="${row.mergeGroupNo ? 'assigned-merge-row' : ''}">${index === 0 ? `<td class="rowspan-cell plate-cell" rowspan="${rowCount}"><div class="plate-code">${escapeHtml(group.carNo)}</div><div class="plate-sub"><i class="ri-user-3-line"></i>${escapeHtml(group.driverName)}</div></td>` : ''}<td><span class="work-order-cell">${row.mergeGroupNo ? `<span class="assigned-merge-wrap">${marker}<a class="work-order-link" href="javascript:void(0)" data-row-action="detail" data-row-id="${escapeHtml(row.id)}">${escapeHtml(row.workNo)}</a>${tag}</span>` : `<a class="work-order-link" href="javascript:void(0)" data-row-action="detail" data-row-id="${escapeHtml(row.id)}">${escapeHtml(row.workNo)}</a>`}</span></td><td><div class="master-code">${escapeHtml(row.masterNo)}</div></td><td>${escapeHtml(row.cutoffTime || '--')}</td><td>${escapeHtml(row.warehouse || '--')}</td><td>${escapeHtml(row.deliveryPoint || '--')}</td><td class="truncate-cell" title="${escapeHtml(row.receiver || '--')}">${escapeHtml(row.receiver || '--')}</td><td class="cargo-value">${escapeHtml(formatCargo(row))}</td>${index === 0 ? `<td class="rowspan-cell load-count-cell" rowspan="${rowCount}"><span class="load-count-link">${group.loadBoardCount}</span></td>` : ''}${index === 0 ? `<td class="rowspan-cell" rowspan="${rowCount}">${renderPerson(group.loader)}</td>` : ''}${index === 0 ? `<td class="rowspan-cell" rowspan="${rowCount}">${renderPerson(group.supervisor)}</td>` : ''}${index === 0 ? `<td class="rowspan-cell" rowspan="${rowCount}">${escapeHtml(group.sealNo)}</td>` : ''}${index === 0 ? `<td class="rowspan-cell status-cell" rowspan="${rowCount}"><span class="status-dot ${group.statusDot}"></span></td>` : ''}${index === 0 ? `<td class="rowspan-cell action-cell" rowspan="${rowCount}">${actions}</td>` : ''}</tr>`;
      }).join('');
    }).join('') : '<tr class="empty-row"><td colspan="14">--</td></tr>';

    refs.totalCountText.textContent = `共${totalCount}条记录`;
    refs.jumpInput.value = String(state.currentPage);
    renderPagination(totalPages);
  }

  function renderTable() {
    renderToolbar();
    if (state.activeStatus === 'assigned') renderAssignedTable();
    else renderGenericTable();
  }

  function handleRowAction(rowId, action) {
    const row = findRow(rowId);
    if (!row) return;
    if (action === 'print' && row.mergeGroupNo) {
      showToast('success', '已打开拼货标签预览', `当前订单属于拼货组${row.mergeGroupNo}，页面已按拼货口径带出标签数据。`);
      return;
    }
    const title = { detail: '已打开详情', print: '已打开打印任务', agv: '已发送AGV任务', dispatch: '已进入配车' }[action];
    showToast('success', title, `${row.workNo}相关操作已触发。`);
  }

  function handleGroupAction(groupId, action) {
    const group = findAssignedGroup(groupId);
    if (!group) return;
    if (action === 'sendBooking') showToast('success', '已发送约车', `${group.carNo}的已配车信息已发送给司机${group.driverName}。`);
    else if (action === 'cancel') showToast('warning', '已发起撤销', `${group.carNo}的配车撤销流程已发起。`);
    else showToast('success', '已打开打印任务', `${group.carNo}下${group.rows.length}票订单的打印入口已打开。`);
  }

  function handlePrimaryAction() {
    if (state.activeStatus === 'assigned') {
      showToast('success', '已打开组托列表', '组托列表(1414)入口原型暂以Toast模拟。');
      return;
    }
    if (refs.primaryActionBtn.classList.contains('is-disabled')) {
      showToast('warning', '请先选择订单', '当前未选择待配车订单。');
      return;
    }
    const rows = getGenericRows().filter((row) => state.selectedIds.has(row.id));
    const groupCount = new Set(rows.filter((row) => row.mergeGroupNo).map((row) => row.mergeGroupNo)).size;
    showToast('success', '已发起批量配车', `本次共选择${rows.length}票订单，包含${groupCount}个拼货组。`);
  }

  function toggleRowSelection(rowId, checked) {
    const rows = getGenericRows();
    const row = rows.find((item) => item.id === rowId);
    if (!row) return;
    if (row.mergeGroupNo) {
      rows.filter((item) => item.mergeGroupNo === row.mergeGroupNo).forEach((item) => checked ? state.selectedIds.add(item.id) : state.selectedIds.delete(item.id));
      showToast('success', checked ? '已联动选择拼货组' : '已取消拼货组选择', `拼货组${row.mergeGroupNo}已同步${checked ? '勾选' : '取消勾选'}。`);
    } else if (checked) {
      state.selectedIds.add(row.id);
    } else {
      state.selectedIds.delete(row.id);
    }
    renderTable();
  }

  refs.statusTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-status]');
    if (!button) return;
    state.activeStatus = button.dataset.status;
    state.currentPage = 1;
    state.selectedIds = new Set();
    renderStatusTabs();
    renderTable();
  });

  refs.queryBtn.addEventListener('click', () => {
    state.keyword = refs.keywordInput.value.trim();
    state.currentPage = 1;
    renderTable();
  });

  refs.resetBtn.addEventListener('click', () => {
    state.activeStatus = 'pendingDispatch';
    state.keyword = '';
    state.currentPage = 1;
    state.pageSize = 20;
    state.selectedIds = new Set();
    refs.keywordInput.value = '';
    refs.pageSizeSelect.value = '20';
    renderStatusTabs();
    renderTable();
    showToast('success', '已重置', '查询条件已恢复默认值，列表重新加载完成。');
  });

  refs.primaryActionBtn.addEventListener('click', handlePrimaryAction);

  refs.keywordInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      state.keyword = refs.keywordInput.value.trim();
      state.currentPage = 1;
      renderTable();
    }
  });

  refs.tableHead.addEventListener('change', (event) => {
    const checkbox = event.target.closest('#selectAllCheckbox');
    if (!checkbox) return;
    const rows = getGenericRows();
    const buckets = rows.reduce((list, row) => {
      if (row.mergeGroupNo && list.length && list[list.length - 1][0].mergeGroupNo === row.mergeGroupNo) list[list.length - 1].push(row);
      else list.push([row]);
      return list;
    }, []);
    const pages = getPages(buckets, state.pageSize, (bucket) => bucket.length);
    const currentRows = (pages[state.currentPage - 1] || []).flat();
    currentRows.forEach((row) => checkbox.checked ? state.selectedIds.add(row.id) : state.selectedIds.delete(row.id));
    renderTable();
  });

  refs.tableBody.addEventListener('change', (event) => {
    const checkbox = event.target.closest('.row-checkbox');
    if (!checkbox) return;
    toggleRowSelection(checkbox.dataset.rowId, checkbox.checked);
  });

  refs.tableBody.addEventListener('click', (event) => {
    const rowAction = event.target.closest('[data-row-action]');
    if (rowAction) {
      handleRowAction(rowAction.dataset.rowId, rowAction.dataset.rowAction);
      return;
    }
    const groupAction = event.target.closest('[data-group-action]');
    if (groupAction) handleGroupAction(groupAction.dataset.groupId, groupAction.dataset.groupAction);
  });

  refs.tableBody.addEventListener('mouseover', (event) => {
    if (state.activeStatus === 'assigned') return;
    const row = event.target.closest('tr[data-group]');
    if (!row || !row.dataset.group) return;
    refs.tableBody.querySelectorAll(`tr[data-group="${CSS.escape(row.dataset.group || '')}"]`).forEach((item) => item.classList.add('group-hovered'));
  });

  refs.tableBody.addEventListener('mouseout', (event) => {
    if (state.activeStatus === 'assigned') return;
    const row = event.target.closest('tr[data-group]');
    const related = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget.closest('tr[data-group]') : null;
    if (!row || !row.dataset.group) return;
    if (related && related.dataset.group === row.dataset.group) return;
    refs.tableBody.querySelectorAll('.group-hovered').forEach((item) => item.classList.remove('group-hovered'));
  });

  refs.pageBtnGroup.addEventListener('click', (event) => {
    const button = event.target.closest('.page-btn');
    if (!button || button.classList.contains('disabled')) return;
    const pageValue = button.dataset.page;
    if (pageValue === 'prev') state.currentPage = Math.max(1, state.currentPage - 1);
    else if (pageValue === 'next') state.currentPage = Math.min(state.totalPages, state.currentPage + 1);
    else state.currentPage = Number(pageValue);
    renderTable();
  });

  refs.pageSizeSelect.addEventListener('change', () => {
    state.pageSize = Number(refs.pageSizeSelect.value);
    state.currentPage = 1;
    renderTable();
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
    renderTable();
  });

  renderStatusTabs();
  renderTable();
})();
