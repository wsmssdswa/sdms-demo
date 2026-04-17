const REPORT_ORDER = ['order', 'inbound', 'putaway', 'picking', 'outbound', 'timeliness', 'inventory', 'sign-rate', 'complaint', 'compensation'];
    const MAX_PINNED_COLUMNS = 7;
    const STARRED_REPORTS = new Set(['order', 'timeliness', 'inventory']);
    const COMMON_WAREHOUSES = ['深圳兴围仓', '广州白云仓', '香港葵涌仓'];
    const COMMON_CUSTOMERS = ['Anker跨境', 'SHEIN华南', 'Temu直发', 'Lazada华南', '菜鸟云配', '敏捷供应链'];
    const BUSINESS_TYPE_OPTIONS = ['干线', '备货', '退件重派'];
    const ORDER_TYPE_OPTIONS = ['备货', '重派', '换单'];
    const ORDER_STAGE_OPTIONS = ['待审核', '处理中', '已发货', '已签收', '异常'];
    const TRACK_STATUS_OPTIONS = ['未上线', '已上线', '已签收', '已拒收', '上线异常', '停更', '丢件'];
    const TIMELINESS_BUSINESS_TYPE_OPTIONS = ['备货', '干线'];
    const TIMELINESS_STATUS_OPTIONS = ['已完成', '处理中', '待审核'];
    const TIMELINESS_NODE_CONFIG = {
      备货: [
        { name: '入库', baseTime: 915, reason: '入库月台回传延迟' },
        { name: '上架', baseTime: 2118, reason: '上架员设备故障' },
        { name: '拣货', baseTime: 2723, reason: '拣货路径拥堵' },
        { name: '打包', baseTime: 1508, reason: '打包台空间不足' },
        { name: '出库', baseTime: 612, reason: '出库交接等待' }
      ],
      干线: [
        { name: '司机登记', baseTime: 485, reason: '司机登记资料补录' },
        { name: '入库', baseTime: 1215, reason: '收货波次积压' },
        { name: '上架', baseTime: 1822, reason: '货架空间紧张' },
        { name: '数据确认', baseTime: 918, reason: '数据复核等待' },
        { name: '通知出库', baseTime: 607, reason: '出库通知回传延迟' },
        { name: '配载出库', baseTime: 1533, reason: '配载波次冲突' },
        { name: '装车', baseTime: 5448, reason: '装卸人员不足' },
        { name: '机场预约', baseTime: 726, reason: '机场预约排队' },
        { name: '发车', baseTime: 312, reason: '发车确认等待' }
      ]
    };
    const TIMELINESS_COLOR_PALETTE = ['#4d77ea', '#2eb67d', '#f59e0b', '#7d67ff', '#ff7b54', '#14b8a6', '#ef4444', '#8b5cf6', '#0ea5e9'];
    const ORDER_SOURCE_OPTIONS = ['客户下单', '客服建单', 'API下单'];
    const ORDER_PO_TYPES = ['B2B', 'B2C'];
    const ORDER_PRODUCT_CATALOG = [
      { category: '3C配件', names: ['蓝牙耳机', '充电底座', '数据线套装', '移动电源'] },
      { category: '服饰鞋包', names: ['运动卫衣', '轻量羽绒服', '通勤双肩包', '休闲板鞋'] },
      { category: '家居日用', names: ['折叠收纳箱', '厨房置物架', '真空保温杯', '便携晾衣架'] },
      { category: '美妆个护', names: ['电动牙刷', '修护面膜', '护发精油', '洁面套装'] },
      { category: '母婴用品', names: ['婴儿湿巾', '恒温奶瓶', '宝宝餐具', '防走失背包'] }
    ];
    const DATE_PICKER_SHORTCUTS = [
      { key: 'today', label: '今天' },
      { key: 'yesterday', label: '昨天' },
      { key: 'last7', label: '近7天' },
      { key: 'last30', label: '近30天' },
      { key: 'thisMonth', label: '本月' },
      { key: 'lastMonth', label: '上月' },
      { key: 'last90', label: '近90天' }
    ];
    const ORDER_COUNTRY_CURRENCY = { 美国: '$', 加拿大: '$', 英国: '£', 德国: '€', 法国: '€', 西班牙: '€', 意大利: '€', 日本: '¥' };
    const ORDER_FIELD_DISPLAY_ORDER = ['orderNo', 'masterNo', 'splitCount', 'pieceCount', 'itemQty', 'weight', 'volume', 'palletCount', 'warehouse', 'originPort', 'destinationPort', 'poType', 'codAmount', 'carrier', 'originalCountry', 'currentCountry', 'ownerName', 'trackStatus', 'orderStatus', 'createdTime', 'shipTime', 'orderSource'];
    const ORDER_FIELD_SETS = {
      备货: ['orderNo', 'poType', 'codAmount', 'warehouse', 'itemQty', 'carrier', 'currentCountry', 'ownerName', 'trackStatus', 'orderStatus', 'createdTime', 'shipTime', 'orderSource'],
      重派: ['orderNo', 'codAmount', 'warehouse', 'itemQty', 'originalCountry', 'currentCountry', 'ownerName', 'trackStatus', 'orderStatus', 'createdTime', 'shipTime', 'orderSource'],
      换单: ['orderNo', 'masterNo', 'splitCount', 'pieceCount', 'itemQty', 'weight', 'volume', 'palletCount', 'warehouse', 'originPort', 'destinationPort', 'ownerName', 'trackStatus', 'orderStatus', 'createdTime', 'shipTime', 'orderSource']
    };
    const ORDER_ANALYSIS_CONFIG = {
      换单: [{ label: '起运港占比', field: 'originPort' }, { label: '目的港占比', field: 'destinationPort' }],
      备货: [{ label: 'PO Type占比', field: 'poType' }, { label: '现派国家占比', field: 'currentCountry' }],
      重派: [{ label: '原派国占比', field: 'originalCountry' }, { label: '现派国家占比', field: 'currentCountry' }]
    };
    const ORDER_FIELD_DEFINITIONS = {
      orderNo: { label: '订单号', getValue: row => row.orderNo, width: 156 },
      masterNo: { label: '主单号', getValue: row => row.masterNo || '--', width: 164 },
      splitCount: { label: '分单数量', getValue: row => row.splitCount ?? '--', align: 'right', width: 110 },
      pieceCount: { label: '件数', getValue: row => row.pieceCount ?? '--', align: 'right', width: 96 },
      weight: { label: '重量', getValue: row => row.weightDisplay || '--', align: 'right', width: 108 },
      volume: { label: '体积', getValue: row => row.volumeDisplay || '--', align: 'right', width: 108 },
      palletCount: { label: '板数', getValue: row => row.palletCount ?? '--', align: 'right', width: 96 },
      warehouse: { label: '仓库', getValue: row => row.warehouse, width: 140 },
      originPort: { label: '起运港', getValue: row => row.originPort || '--', width: 132 },
      destinationPort: { label: '目的港', getValue: row => row.destinationPort || '--', width: 132 },
      poType: { label: 'PO Type', getValue: row => row.poType || '--', width: 110 },
      codAmount: { label: 'COD金额', getValue: row => row.codAmountDisplay || '--', align: 'right', width: 124 },
      itemQty: { label: '商品数量', getValue: row => row.itemQty ?? '--', align: 'right', width: 118 },
      carrier: { label: '派送商', getValue: row => row.carrier || '--', width: 124 },
      originalCountry: { label: '原派国', getValue: row => row.originalCountry || '--', width: 110 },
      currentCountry: { label: '现派国', getValue: row => row.currentCountry || '--', width: 110 },
      ownerName: { label: '货主名称', getValue: row => row.ownerName, width: 152 },
      trackStatus: { label: '轨迹状态', getValue: row => getTrackStatusDisplay(row), html: true, width: 118 },
      orderStatus: { label: '订单阶段', getValue: row => `<span class="badge ${statusClass(row.orderStage)}">${row.orderStage || '--'}</span>`, html: true, width: 112 },
      createdTime: { label: '下单时间', getValue: row => row.orderTime || row.time, width: 168 },
      shipTime: { label: '发货时间', getValue: row => row.shipTime || '--', width: 168 },
      orderSource: { label: '订单来源', getValue: row => row.orderSource, width: 118 }
    };
    TRACK_STATUS_OPTIONS.length = 0;
    TRACK_STATUS_OPTIONS.push('\u672a\u4e0a\u7ebf', '\u5df2\u4e0a\u7ebf', '\u5df2\u7b7e\u6536', '\u5df2\u62d2\u6536', '\u4e0a\u7ebf\u5f02\u5e38', '\u505c\u66f4', '\u4e22\u4ef6');
    ORDER_FIELD_DISPLAY_ORDER.splice(0, ORDER_FIELD_DISPLAY_ORDER.length, 'orderNo', 'masterNo', 'splitCount', 'pieceCount', 'itemQty', 'weight', 'volume', 'palletCount', 'warehouse', 'originPort', 'destinationPort', 'poType', 'codAmount', 'carrier', 'originalCountry', 'currentCountry', 'ownerName', 'orderStatus', 'trackStatus', 'createdTime', 'shipTime', 'orderSource');
    ORDER_FIELD_SETS[ORDER_TYPE_OPTIONS[0]] = ['orderNo', 'poType', 'codAmount', 'warehouse', 'itemQty', 'carrier', 'currentCountry', 'ownerName', 'orderStatus', 'trackStatus', 'createdTime', 'shipTime', 'orderSource'];
    ORDER_FIELD_SETS[ORDER_TYPE_OPTIONS[1]] = ['orderNo', 'codAmount', 'warehouse', 'itemQty', 'originalCountry', 'currentCountry', 'ownerName', 'orderStatus', 'trackStatus', 'createdTime', 'shipTime', 'orderSource'];
    ORDER_FIELD_SETS[ORDER_TYPE_OPTIONS[2]] = ['orderNo', 'masterNo', 'splitCount', 'pieceCount', 'itemQty', 'weight', 'volume', 'palletCount', 'warehouse', 'originPort', 'destinationPort', 'ownerName', 'orderStatus', 'trackStatus', 'createdTime', 'shipTime', 'orderSource'];
    const CROSS_PAGE_REPORT_NAV_STORAGE_KEY = 'sdmsBiReportNavigation';
    const CROSS_PAGE_REPORT_NAV_MAX_AGE = 10 * 60 * 1000;
    const GENERIC_TABLE_FIELD_ORDER = ['code', 'customer', 'warehouse', 'tag', 'value', 'time', 'status'];
    const GENERIC_TABLE_FIELD_DEFINITIONS = {
      code: { label: '编号', getValue: row => row.code || '--', width: 132 },
      customer: { label: '客户/货主', getValue: row => row.customer || '--', width: 156 },
      warehouse: { label: '仓库', getValue: row => row.warehouse || '--', width: 140 },
      tag: { label: report => report.tagHeader || '主题标签', getValue: row => `<span class="badge ${tagClass(row.tag)}">${row.tag}</span>`, html: true, width: 126 },
      value: { label: report => report.valueHeader || '关键值', getValue: row => row.value || '--', align: 'right', width: 140 },
      time: { label: '更新时间', getValue: row => row.time || '--', width: 168 },
      status: { label: '状态', getValue: row => `<span class="badge ${statusClass(row.status)}">${row.status}</span>`, html: true, width: 112 }
    };
    const TIMELINESS_TABLE_BASE_FIELDS = [
      { key: 'date', label: '统计日期', width: 132 },
      { key: 'orderCount', label: '当日订单数', align: 'right', width: 116 },
      { key: 'avgTotalDuration', label: '平均全链路时效', align: 'right', width: 156 },
      { key: 'bottleneckNode', label: '当日主卡点', width: 140 }
    ];
    const ANCHOR_DATE = new Date('2026-03-18T00:00:00');

    const charts = { trend: null, structure: null, warehouseMix: null, statusSignal: null };

    const state = {
      currentReport: 'order',
      filters: {
        startDate: '2026-01-01',
        endDate: '2026-03-18',
        shipStartDate: '',
        shipEndDate: '',
        dateType: 'primary',
        customer: '',
        orderTypes: [...ORDER_TYPE_OPTIONS],
        orderStages: [...ORDER_STAGE_OPTIONS],
        trackStatuses: [...TRACK_STATUS_OPTIONS],
        businessTypes: [...BUSINESS_TYPE_OPTIONS],
        filterA: '',
        filterB: '',
        keyword: '',
        quickDays: 90,
        selectedWarehouses: [...COMMON_WAREHOUSES]
      },
      pagination: {
        currentPage: 1,
        pageSize: 20
      },
      ai: {
        status: 'idle',
        message: '点击生成AI分析，基于当前查询范围输出区间结论、优先关注事项和复盘建议。',
        generatedAt: '',
        result: null,
        requestId: 0,
        reportCollapsed: false,
        evidenceModalOpen: false
      },
      columnConfig: {
        modalOpen: false,
        draftFields: [],
        profileKey: '',
        savedProfiles: {},
        draggingKey: '',
        dragOverKey: ''
      },
      timeliness: {
        detailOpen: false,
        detailNode: '',
        detailRows: [],
        detailBusinessType: '',
        detailDate: ''
      },
      productDetail: {
        open: false,
        row: null
      },
      datePicker: {
        open: false,
        field: 'primary',
        draftStart: '',
        draftEnd: '',
        panelMonth: formatDateOnly(new Date(ANCHOR_DATE.getFullYear(), ANCHOR_DATE.getMonth(), 1)),
        anchorLeft: 0,
        anchorTop: 0
      }
    };

    function pad(value) { return String(value).padStart(2, '0'); }
    function pick(list, index) { return list[index % list.length]; }
    function hexToRgba(hex, alpha) {
      const normalized = hex.replace('#', '');
      const bigint = parseInt(normalized, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    function formatDateTime(date, index) {
      const draft = new Date(date);
      draft.setHours(8 + (index % 9), (index * 7) % 60, 0, 0);
      return `${draft.getFullYear()}-${pad(draft.getMonth() + 1)}-${pad(draft.getDate())} ${pad(draft.getHours())}:${pad(draft.getMinutes())}:00`;
    }
    function formatDateOnly(date) {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    function formatMonthLabel(date) {
      return `${date.getFullYear()}年${date.getMonth() + 1}月`;
    }
    function formatSystemTime(date = new Date()) {
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
    function formatNumber(value, digits = 0) {
      return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }
    function formatMoney(value) {
      return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    function formatWeight(value) { return `${formatNumber(value, 1)}kg`; }
    function formatVolume(value) { return `${formatNumber(value, 2)}m³`; }
    function formatCodAmount(country, value) {
      if (value === null || value === undefined || value === '') return '-';
      return `${ORDER_COUNTRY_CURRENCY[country] || '$'}${formatNumber(value, 2)}`;
    }
    function formatPercent(value, digits = 1) { return `${Number(value).toFixed(digits)}%`; }
    function formatRatio(value, digits = 1) { return `${(Number(value) * 100).toFixed(digits)}%`; }
    function formatDuration(seconds = 0) {
      const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
      const hours = Math.floor(safeSeconds / 3600);
      const minutes = Math.floor((safeSeconds % 3600) / 60);
      const secs = safeSeconds % 60;
      if (hours) return `${hours}小时${minutes}分${secs}秒`;
      if (minutes) return `${minutes}分${secs}秒`;
      return `${secs}秒`;
    }
    function formatDurationDelta(seconds = 0) {
      const sign = seconds >= 0 ? '+' : '-';
      return `${sign}${formatDuration(Math.abs(seconds))}`;
    }
    function parseDateTime(text) {
      return new Date(String(text).replace(' ', 'T'));
    }
    function parseDateOnly(text) {
      if (!text) return null;
      return new Date(`${text}T00:00:00`);
    }
    function addDays(date, days) {
      const next = new Date(date);
      next.setDate(next.getDate() + days);
      return next;
    }
    function addMonths(date, months) {
      const next = new Date(date);
      next.setMonth(next.getMonth() + months, 1);
      return next;
    }
    function getMonthStart(date) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    function getDateRangeText(start, end, emptyText = '请选择日期范围') {
      if (!start && !end) return emptyText;
      if (start && !end) return `${start} - ${start}`;
      if (!start && end) return `${end} - ${end}`;
      return `${start} - ${end}`;
    }
    function getCurrentDateField() {
      return state.currentReport === 'order' ? (state.filters.dateType || 'primary') : 'primary';
    }
    function getDateFieldLabel(field = state.datePicker.field) {
      if (field === 'ship') return '发货时间';
      return state.currentReport === 'order' ? '下单时间' : '时间范围';
    }
    function getDateFieldRange(field = state.datePicker.field) {
      if (field === 'ship') return { start: state.filters.shipStartDate, end: state.filters.shipEndDate };
      return { start: state.filters.startDate, end: state.filters.endDate };
    }
    function setDateFieldRange(field, start, end) {
      if (field === 'ship') {
        state.filters.shipStartDate = start;
        state.filters.shipEndDate = end;
        return;
      }
      state.filters.startDate = start;
      state.filters.endDate = end;
    }
    function normalizeExternalFilterList(list, options) {
      if (!Array.isArray(list) || !list.length) return [];
      return list.filter(item => options.includes(item));
    }
    function consumeCrossPageReportNavigation() {
      try {
        const rawValue = localStorage.getItem(CROSS_PAGE_REPORT_NAV_STORAGE_KEY);
        if (!rawValue) return null;
        localStorage.removeItem(CROSS_PAGE_REPORT_NAV_STORAGE_KEY);
        const payload = JSON.parse(rawValue);
        if (!payload || !payload.reportKey || !reportDefinitions[payload.reportKey]) return null;
        if (payload.createdAt && Date.now() - Number(payload.createdAt) > CROSS_PAGE_REPORT_NAV_MAX_AGE) return null;
        return payload;
      } catch (error) {
        localStorage.removeItem(CROSS_PAGE_REPORT_NAV_STORAGE_KEY);
        return null;
      }
    }
    function applyCrossPageReportNavigation(payload) {
      const reportKey = payload?.reportKey;
      if (!reportKey || !reportDefinitions[reportKey]) return false;
      state.currentReport = reportKey;
      state.filters = {
        startDate: '2026-01-01',
        endDate: '2026-03-18',
        shipStartDate: '',
        shipEndDate: '',
        dateType: 'primary',
        customer: '',
        orderTypes: [...ORDER_TYPE_OPTIONS],
        orderStages: [...ORDER_STAGE_OPTIONS],
        trackStatuses: [...TRACK_STATUS_OPTIONS],
        businessTypes: isSingleBusinessTypeReport(reportKey) ? [TIMELINESS_BUSINESS_TYPE_OPTIONS[0]] : [...getReportBusinessTypeOptions(reportKey)],
        filterA: '',
        filterB: '',
        keyword: '',
        quickDays: 90,
        selectedWarehouses: [...COMMON_WAREHOUSES]
      };
      const incomingFilters = payload.filters || {};
      if (incomingFilters.dateType === 'ship') state.filters.dateType = 'ship';
      if (incomingFilters.startDate) state.filters.startDate = incomingFilters.startDate;
      if (incomingFilters.endDate) state.filters.endDate = incomingFilters.endDate;
      if (incomingFilters.shipStartDate) state.filters.shipStartDate = incomingFilters.shipStartDate;
      if (incomingFilters.shipEndDate) state.filters.shipEndDate = incomingFilters.shipEndDate;
      if (state.filters.dateType === 'ship' && !state.filters.shipStartDate && incomingFilters.startDate) state.filters.shipStartDate = incomingFilters.startDate;
      if (state.filters.dateType === 'ship' && !state.filters.shipEndDate && incomingFilters.endDate) state.filters.shipEndDate = incomingFilters.endDate;
      if (isOrderReport(reportKey)) {
        const orderTypes = normalizeExternalFilterList(incomingFilters.orderTypes, ORDER_TYPE_OPTIONS);
        const orderStages = normalizeExternalFilterList(incomingFilters.orderStages, ORDER_STAGE_OPTIONS);
        const trackStatuses = normalizeExternalFilterList(incomingFilters.trackStatuses, TRACK_STATUS_OPTIONS);
        if (orderTypes.length) state.filters.orderTypes = orderTypes;
        if (orderStages.length) state.filters.orderStages = orderStages;
        if (trackStatuses.length) state.filters.trackStatuses = trackStatuses;
      }
      const warehouses = normalizeExternalFilterList(incomingFilters.selectedWarehouses, COMMON_WAREHOUSES);
      if (warehouses.length) state.filters.selectedWarehouses = warehouses;
      state.pagination.currentPage = 1;
      closeTimelinessDetailModal();
      closeProductDetailModal();
      closeDatePicker();
      resetAiAnalysis('idle', `已按工作台指标“${payload.sourceLabel || '订单统计'}”带入查询条件，请查看订单报表明细。`);
      renderAll();
      showToast(`已按${payload.sourceLabel || '工作台指标'}带入订单报表`, 'success');
      return true;
    }
    function buildDateShortcutRange(shortcutKey) {
      const anchor = new Date(ANCHOR_DATE);
      if (shortcutKey === 'today') {
        const day = formatDateOnly(anchor);
        return { start: day, end: day };
      }
      if (shortcutKey === 'yesterday') {
        const day = formatDateOnly(addDays(anchor, -1));
        return { start: day, end: day };
      }
      if (shortcutKey === 'last7') return { start: formatDateOnly(addDays(anchor, -6)), end: formatDateOnly(anchor) };
      if (shortcutKey === 'last30') return { start: formatDateOnly(addDays(anchor, -29)), end: formatDateOnly(anchor) };
      if (shortcutKey === 'last90') return { start: formatDateOnly(addDays(anchor, -89)), end: formatDateOnly(anchor) };
      if (shortcutKey === 'thisMonth') {
        const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
        return { start: formatDateOnly(start), end: formatDateOnly(anchor) };
      }
      if (shortcutKey === 'lastMonth') {
        const start = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
        const end = new Date(anchor.getFullYear(), anchor.getMonth(), 0);
        return { start: formatDateOnly(start), end: formatDateOnly(end) };
      }
      return { start: '', end: '' };
    }
    function getMatchedDateShortcut(start, end) {
      if (!start || !end) return '';
      const matched = DATE_PICKER_SHORTCUTS.find(item => {
        const range = buildDateShortcutRange(item.key);
        return range.start === start && range.end === end;
      });
      return matched?.key || '';
    }
    function getDatePickerBaseMonth(start, end) {
      const baseDate = parseDateOnly(start || end || formatDateOnly(ANCHOR_DATE)) || new Date(ANCHOR_DATE);
      return formatDateOnly(getMonthStart(baseDate));
    }
    function buildCalendarCells(monthText, startText, endText) {
      const monthDate = parseDateOnly(monthText) || getMonthStart(ANCHOR_DATE);
      const monthStart = getMonthStart(monthDate);
      const offset = (monthStart.getDay() + 6) % 7;
      const gridStart = addDays(monthStart, -offset);
      return Array.from({ length: 42 }, (_, index) => {
        const current = addDays(gridStart, index);
        const text = formatDateOnly(current);
        const inMonth = current.getMonth() === monthStart.getMonth();
        const isToday = text === formatDateOnly(ANCHOR_DATE);
        const hasRange = Boolean(startText && endText);
        const inRange = hasRange && text >= startText && text <= endText;
        return {
          text,
          day: current.getDate(),
          inMonth,
          isToday,
          isStart: Boolean(startText) && text === startText,
          isEnd: Boolean(endText) && text === endText,
          inRange
        };
      });
    }
    function hashText(text = '') {
      return Array.from(String(text)).reduce((sum, char, index) => (sum + char.charCodeAt(0) * (index + 1)) % 100000, 0);
    }
    function getReportBusinessTypeOptions(reportKey = state.currentReport) {
      if (reportKey === 'order') return ORDER_TYPE_OPTIONS;
      return reportKey === 'timeliness' ? TIMELINESS_BUSINESS_TYPE_OPTIONS : BUSINESS_TYPE_OPTIONS;
    }
    function isSingleBusinessTypeReport(reportKey = state.currentReport) {
      return reportKey === 'timeliness';
    }
    function isOrderReport(reportKey = state.currentReport) {
      return reportKey === 'order';
    }
    function parseMetricValue(value) {
      const normalized = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
      return normalized ? Number(normalized) : 0;
    }
    function orderStageToProcessStatus(stage) {
      if (stage === '已签收') return '已完成';
      if (stage === '待审核') return '待审核';
      return '处理中';
    }
    function normalizeOrderType(type) {
      if (type === '干线') return '换单';
      if (type === '退件重派') return '重派';
      return type;
    }
    function getCurrentTypeFilters(reportKey = state.currentReport) {
      return reportKey === 'order' ? state.filters.orderTypes : state.filters.businessTypes;
    }
    function getActiveBusinessTypes(list, reportKey = state.currentReport) {
      const options = getReportBusinessTypeOptions(reportKey);
      const sourceList = Array.isArray(list) ? list : getCurrentTypeFilters(reportKey);
      const selected = sourceList.length ? sourceList : options;
      return selected.filter(item => options.includes(item));
    }
    function isTrackedOrderStage(orderStage) {
      return ['\u5df2\u53d1\u8d27', '\u5df2\u7b7e\u6536'].includes(orderStage);
    }
    function getTrackStatusBadgeClass(trackStatus) {
      if (trackStatus === '\u5df2\u7b7e\u6536') return 'badge-green';
      if (trackStatus === '\u5df2\u4e0a\u7ebf') return 'badge-blue';
      if (trackStatus === '\u672a\u4e0a\u7ebf') return 'badge-orange';
      if (['\u4e0a\u7ebf\u5f02\u5e38', '\u505c\u66f4', '\u4e22\u4ef6', '\u5df2\u62d2\u6536'].includes(trackStatus)) return 'badge-orange';
      return 'badge-blue';
    }
    function getTrackStatusDisplay(row) {
      if (!row.trackStatus) return '--';
      return `<span class="badge ${getTrackStatusBadgeClass(row.trackStatus)}">${row.trackStatus}</span>`;
    }
    function getOrderVisibleFields(selectedTypes = getActiveBusinessTypes(state.filters.orderTypes, 'order')) {
      const sourceTypes = Array.isArray(selectedTypes) && selectedTypes.length
        ? selectedTypes
        : getActiveBusinessTypes(state.filters.orderTypes, 'order');
      const normalizedTypes = sourceTypes.map(normalizeOrderType).filter(type => ORDER_FIELD_SETS[type]);
      if (!normalizedTypes.length) return [...ORDER_FIELD_SETS[ORDER_TYPE_OPTIONS[0]]];
      if (normalizedTypes.length === 1) return [...ORDER_FIELD_SETS[normalizedTypes[0]]];
      const sharedFields = ORDER_FIELD_DISPLAY_ORDER.filter(fieldKey => normalizedTypes.every(type => ORDER_FIELD_SETS[type].includes(fieldKey)));
      return sharedFields.length ? sharedFields : [...ORDER_FIELD_SETS[normalizedTypes[0]]];
    }
    function formatMetricValue(value, report, options = {}) {
      const { digits } = options;
      if (report.rowsConfig.mode === 'currency') return formatMoney(value);
      if (report.rowsConfig.mode === 'percent') return formatPercent(value, digits ?? 1);
      const decimals = digits ?? (Number.isInteger(value) ? 0 : 1);
      return `${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${report.rowsConfig.unit || ''}`;
    }
    function average(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
    function getTimeValue(text) { return new Date(text.replace(' ', 'T')).getTime(); }
    function buildDistribution(rows, field) {
      const counter = new Map();
      rows.forEach(row => {
        const key = row[field];
        counter.set(key, (counter.get(key) || 0) + 1);
      });
      return Array.from(counter.entries()).map(([name, count]) => ({ name, count, share: count / rows.length })).sort((left, right) => right.count - left.count);
    }
    function getStatusBucket(status) {
      if (['已签收', '已完成', '已闭环', '健康', '优秀', '已复核', '已发运', '已审核'].includes(status)) return 'success';
      if (['异常', '已拒收', '上线异常', '停更', '丢件', '预警', '待确认'].includes(status)) return 'risk';
      return 'warning';
    }
    function getSelectedHeaderWarehouses() {
      return Array.from(document.querySelectorAll('.warehouse-checkbox:checked')).map(item => item.value);
    }
    function syncHeaderWarehouseSelection(selectedWarehouses = COMMON_WAREHOUSES) {
      const normalized = selectedWarehouses.length ? selectedWarehouses : COMMON_WAREHOUSES;
      const selectedSet = new Set(normalized);
      document.querySelectorAll('.warehouse-checkbox').forEach(checkbox => { checkbox.checked = selectedSet.has(checkbox.value); });
      const selectAll = document.getElementById('selectAllWarehouses');
      selectAll.checked = normalized.length === COMMON_WAREHOUSES.length;
      selectAll.indeterminate = normalized.length > 0 && normalized.length < COMMON_WAREHOUSES.length;
      document.getElementById('warehouseText').textContent = normalized.length === COMMON_WAREHOUSES.length ? '全部仓库' : normalized.length === 1 ? normalized[0] : `已选${normalized.length}个仓库`;
    }
    function getSelectedBusinessTypes() {
      return Array.from(document.querySelectorAll('.business-type-checkbox:checked')).map(item => item.value);
    }
    function getSelectedOrderStages() {
      return Array.from(document.querySelectorAll('.order-stage-checkbox:checked')).map(item => item.value);
    }
    function getSelectedTrackStatuses() {
      return Array.from(document.querySelectorAll('.track-status-checkbox:checked')).map(item => item.value);
    }
    function getTimelinessNodeOptions(businessType) {
      return (TIMELINESS_NODE_CONFIG[businessType] || []).map(item => item.name);
    }
    function syncBusinessTypeSelection(selectedTypes = getReportBusinessTypeOptions(state.currentReport)) {
      const options = getReportBusinessTypeOptions(state.currentReport);
      const singleSelect = isSingleBusinessTypeReport(state.currentReport);
      const labelBase = isOrderReport() ? '订单类型' : '业务类型';
      const selectedSet = new Set(selectedTypes);
      document.querySelectorAll('.business-type-checkbox').forEach(checkbox => { checkbox.checked = selectedSet.has(checkbox.value); });
      const selectAll = document.getElementById('selectAllBusinessTypes');
      const selectAllWrap = selectAll.closest('.multi-select-head');
      if (selectAllWrap) selectAllWrap.classList.toggle('hidden', singleSelect);
      selectAll.checked = selectedTypes.length === options.length && !singleSelect;
      selectAll.indeterminate = !singleSelect && selectedTypes.length > 0 && selectedTypes.length < options.length;
      document.getElementById('businessTypeLabel').textContent = singleSelect ? `${labelBase}(单选)` : labelBase;
      document.getElementById('businessTypeText').textContent = !selectedTypes.length
        ? `请选择${labelBase}`
        : singleSelect
          ? selectedTypes[0]
          : selectedTypes.length === options.length
            ? `全部${labelBase}`
            : selectedTypes.length === 1
              ? selectedTypes[0]
              : `已选${selectedTypes.length}个${labelBase}`;
    }
    function syncOrderStageSelection(selectedValues = ORDER_STAGE_OPTIONS) {
      const selectedSet = new Set(selectedValues);
      document.querySelectorAll('.order-stage-checkbox').forEach(checkbox => { checkbox.checked = selectedSet.has(checkbox.value); });
      const selectAll = document.getElementById('selectAllOrderStages');
      selectAll.checked = selectedValues.length === ORDER_STAGE_OPTIONS.length;
      selectAll.indeterminate = selectedValues.length > 0 && selectedValues.length < ORDER_STAGE_OPTIONS.length;
      document.getElementById('orderStageText').textContent = !selectedValues.length
        ? '请选择订单阶段'
        : selectedValues.length === ORDER_STAGE_OPTIONS.length
          ? '全部订单阶段'
          : selectedValues.length === 1
            ? selectedValues[0]
            : `已选${selectedValues.length}个订单阶段`;
    }
    function syncTrackStatusSelection(selectedValues = TRACK_STATUS_OPTIONS) {
      const selectedSet = new Set(selectedValues);
      document.querySelectorAll('.track-status-checkbox').forEach(checkbox => { checkbox.checked = selectedSet.has(checkbox.value); });
      const selectAll = document.getElementById('selectAllTrackStatuses');
      selectAll.checked = selectedValues.length === TRACK_STATUS_OPTIONS.length;
      selectAll.indeterminate = selectedValues.length > 0 && selectedValues.length < TRACK_STATUS_OPTIONS.length;
      document.getElementById('trackStatusText').textContent = !selectedValues.length
        ? '请选择轨迹状态'
        : selectedValues.length === TRACK_STATUS_OPTIONS.length
          ? '全部轨迹状态'
          : selectedValues.length === 1
            ? selectedValues[0]
            : `已选${selectedValues.length}个轨迹状态`;
    }
    function refreshTimelinessNodeFilterOptions(selectedTypes = state.filters.businessTypes) {
      if (state.currentReport !== 'timeliness') return;
      const activeBusinessType = getActiveBusinessTypes(selectedTypes, 'timeliness')[0] || TIMELINESS_BUSINESS_TYPE_OPTIONS[0];
      const nodeOptions = getTimelinessNodeOptions(activeBusinessType);
      const filterA = document.getElementById('filterA');
      if (!filterA) return;
      const currentValue = filterA.value || state.filters.filterA;
      filterA.innerHTML = `<option value="">全部关注节点</option>${nodeOptions.map(item => `<option value="${item}">${item}</option>`).join('')}`;
      const nextValue = nodeOptions.includes(currentValue) ? currentValue : '';
      filterA.value = nextValue;
      if (!nodeOptions.includes(state.filters.filterA)) state.filters.filterA = '';
    }
    function closeBusinessTypeDropdown() {
      document.getElementById('businessTypeDropdown').classList.add('hidden');
      document.getElementById('businessTypeBtn').setAttribute('aria-expanded', 'false');
    }
    function closeOrderStageDropdown() {
      document.getElementById('orderStageDropdown').classList.add('hidden');
      document.getElementById('orderStageBtn').setAttribute('aria-expanded', 'false');
    }
    function closeTrackStatusDropdown() {
      document.getElementById('trackStatusDropdown').classList.add('hidden');
      document.getElementById('trackStatusBtn').setAttribute('aria-expanded', 'false');
    }
    function buildRows(config) {
      return Array.from({ length: 26 }, (_, index) => {
        const rowDate = new Date(ANCHOR_DATE);
        rowDate.setDate(rowDate.getDate() - (index % 18));
        let value = '';
        if (config.mode === 'currency') value = formatMoney(config.base + index * config.step);
        else if (config.mode === 'percent') value = `${(config.base + (index % 5) * config.step).toFixed(1)}%`;
        else value = `${(config.base + index * config.step).toLocaleString('zh-CN')}${config.unit}`;
        return {
          code: `${config.prefix}-202603${pad((index % 28) + 1)}-${pad((index % 9) + 1)}`,
          customer: pick(COMMON_CUSTOMERS, index),
          warehouse: pick(COMMON_WAREHOUSES, index),
          businessType: pick(config.businessTypes || BUSINESS_TYPE_OPTIONS, index),
          tag: pick(config.tags, index),
          value,
          time: formatDateTime(rowDate, index),
          status: pick(config.statuses, index)
        };
      });
    }
    function buildOrderProducts(orderNo, itemQty, seed) {
      const totalQty = Math.max(1, Number(itemQty) || 1);
      const productCount = Math.min(4, Math.max(2, 2 + (seed % 3)));
      let remainingQty = totalQty;
      return Array.from({ length: productCount }, (_, index) => {
        const catalog = ORDER_PRODUCT_CATALOG[(seed + index) % ORDER_PRODUCT_CATALOG.length];
        const slotsLeft = productCount - index;
        const minReserved = slotsLeft - 1;
        const suggestedQty = Math.max(1, Math.round(remainingQty / slotsLeft) + (((seed + index) % 3) - 1));
        const qty = index === productCount - 1
          ? remainingQty
          : Math.max(1, Math.min(remainingQty - minReserved, suggestedQty));
        remainingQty -= qty;
        return {
          name: catalog.names[(seed + index * 2) % catalog.names.length],
          code: `${orderNo}-SKU${pad(index + 1)}`,
          qty,
          category: catalog.category
        };
      });
    }
    function resolveTrackStatus(orderStage, seed) {
      if (orderStage === '\u5df2\u7b7e\u6536') return '\u5df2\u7b7e\u6536';
      if (orderStage !== '\u5df2\u53d1\u8d27') return '';
      return pick(['\u672a\u4e0a\u7ebf', '\u5df2\u4e0a\u7ebf', '\u5df2\u4e0a\u7ebf', '\u5df2\u4e0a\u7ebf', '\u4e0a\u7ebf\u5f02\u5e38', '\u505c\u66f4', '\u4e22\u4ef6', '\u5df2\u62d2\u6536'], seed);
    }
    function resolveShipTime(orderTime, orderStage, trackStatus, seed) {
      const requireShipTime = isTrackedOrderStage(orderStage) || Boolean(trackStatus);
      if (!requireShipTime) return '';
      const shipDate = parseDateTime(orderTime);
      shipDate.setDate(shipDate.getDate() + 1 + (seed % 4));
      shipDate.setHours(9 + (seed % 7), ((seed + 5) * 11) % 60, 0, 0);
      return formatSystemTime(shipDate);
    }
    function buildOrderRows() {
      const rows = [];
      const startDate = new Date('2026-01-01T00:00:00');
      const endDate = new Date(ANCHOR_DATE);
      const replaceStages = ['已签收', '已发货', '处理中', '待审核', '异常'];
      const stockStages = ['已签收', '已发货', '处理中', '待审核', '异常'];
      const switchStages = ['处理中', '异常', '已发货', '待审核', '已签收'];
      const replaceDailyStages = ['已签收', '已发货', '处理中', '待审核'];
      const stockDailyStages = ['已签收', '已发货', '处理中'];
      const switchDailyStages = ['处理中', '异常'];
      const originPorts = ['深圳(SZX)', '广州(CAN)', '香港(HKG)'];
      const destinationPorts = ['洛杉矶(LAX)', '纽约(JFK)', '伦敦(LHR)', '法兰克福(FRA)', '东京(NRT)'];
      const stockCountries = ['美国', '英国', '德国', '加拿大', '日本'];
      const switchCountries = ['英国', '德国', '美国', '法国', '加拿大', '日本'];
      const carriers = ['DHL', 'UPS', 'FedEx', 'YunExpress'];
      const dayMs = 24 * 60 * 60 * 1000;
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / dayMs) + 1;
      let replaceCounter = 1;
      let stockCounter = 1;
      let switchCounter = 1;
      let globalIndex = 0;

      function buildDateCode(date) {
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
      }

      for (let dayOffset = 0; dayOffset < totalDays; dayOffset += 1) {
        const rowDate = new Date(startDate);
        rowDate.setDate(startDate.getDate() + dayOffset);
        const dateCode = buildDateCode(rowDate);
        const isAnchorDay = rowDate.getTime() === endDate.getTime();
        const replaceCount = isAnchorDay ? 8 : 4;
        const stockCount = isAnchorDay ? 6 : 3;
        const switchCount = isAnchorDay ? 4 : 2;

        Array.from({ length: replaceCount }, (_, innerIndex) => {
          const seed = dayOffset * 10 + innerIndex;
          const orderStage = replaceDailyStages[innerIndex] || pick(replaceStages, seed);
          const pieceCount = 42 + (dayOffset % 12) * 4 + innerIndex * 7;
          const itemQty = pieceCount + 18 + ((dayOffset + innerIndex) % 5) * 6;
          const weightValue = 520 + dayOffset * 5 + innerIndex * 38;
          const volumeValue = 3.2 + (dayOffset % 5) * 0.34 + innerIndex * 0.28;
          const palletCount = 2 + ((dayOffset + innerIndex) % 4);
          const ownerName = pick(COMMON_CUSTOMERS, seed);
          const orderNo = `GL${dateCode}${pad(replaceCounter)}`;
          const masterNo = `MAWB-${pad((dayOffset % 9) + 81)}-${pad((innerIndex % 7) + 11)}${pad((replaceCounter % 17) + 1)}`;
          const orderTime = formatDateTime(rowDate, globalIndex);
          const trackStatus = resolveTrackStatus(orderStage, seed);
          const shipTime = resolveShipTime(orderTime, orderStage, trackStatus, seed);
          rows.push({
            code: orderNo,
            orderNo,
            masterNo,
            splitCount: 1 + ((dayOffset + innerIndex) % 5),
            pieceCount,
            itemQty,
            weightValue,
            weightDisplay: formatWeight(weightValue),
            volumeValue,
            volumeDisplay: formatVolume(volumeValue),
            palletCount,
            warehouse: pick(COMMON_WAREHOUSES, seed),
            originPort: pick(originPorts, seed),
            destinationPort: pick(destinationPorts, seed + 1),
            ownerName,
            customer: ownerName,
            businessType: '干线',
            orderType: '换单',
            orderSource: pick(ORDER_SOURCE_OPTIONS, seed),
            orderStage,
            trackStatus,
            processStatus: orderStageToProcessStatus(orderStage),
            products: buildOrderProducts(orderNo, itemQty, seed),
            tag: orderStage,
            status: orderStage,
            orderTime,
            shipTime,
            time: orderTime,
            value: formatWeight(weightValue),
            evidenceTag: `主单:${masterNo}`,
            evidenceValue: `重量:${formatWeight(weightValue)}`,
            priorityValue: weightValue + pieceCount * 6 + palletCount * 35
          });
          replaceCounter += 1;
          globalIndex += 1;
        });

        Array.from({ length: stockCount }, (_, innerIndex) => {
          const seed = dayOffset * 10 + innerIndex + 3;
          const orderStage = stockDailyStages[innerIndex] || pick(stockStages, seed + 1);
          const currentCountry = pick(stockCountries, seed + 2);
          const codAmount = seed % 4 === 0 ? null : 68 + dayOffset * 2.4 + innerIndex * 18.6;
          const itemQty = 10 + (dayOffset % 6) * 4 + innerIndex * 7;
          const ownerName = pick(COMMON_CUSTOMERS, seed + 2);
          const poType = pick(ORDER_PO_TYPES, seed);
          const orderNo = `BH${dateCode}${pad(stockCounter)}`;
          const codAmountDisplay = formatCodAmount(currentCountry, codAmount);
          const orderTime = formatDateTime(rowDate, globalIndex);
          const trackStatus = resolveTrackStatus(orderStage, seed + 1);
          const shipTime = resolveShipTime(orderTime, orderStage, trackStatus, seed + 1);
          rows.push({
            code: orderNo,
            orderNo,
            poType,
            codAmount,
            codAmountDisplay,
            warehouse: pick(COMMON_WAREHOUSES, seed + 1),
            itemQty,
            carrier: pick(carriers, seed),
            currentCountry,
            ownerName,
            customer: ownerName,
            businessType: '备货',
            orderType: '备货',
            orderSource: pick(ORDER_SOURCE_OPTIONS, seed + 1),
            orderStage,
            trackStatus,
            processStatus: orderStageToProcessStatus(orderStage),
            products: buildOrderProducts(orderNo, itemQty, seed + 7),
            tag: orderStage,
            status: orderStage,
            orderTime,
            shipTime,
            time: orderTime,
            value: codAmountDisplay === '-' ? `${itemQty}` : codAmountDisplay,
            evidenceTag: `PO Type:${poType}`,
            evidenceValue: codAmountDisplay === '-' ? `商品数量:${itemQty}` : `COD:${codAmountDisplay}`,
            priorityValue: (codAmount || 0) * 2 + itemQty * 18 + (poType === 'B2C' ? 40 : 10)
          });
          stockCounter += 1;
          globalIndex += 1;
        });

        Array.from({ length: switchCount }, (_, innerIndex) => {
          const seed = dayOffset * 10 + innerIndex + 5;
          const orderStage = switchDailyStages[innerIndex] || pick(switchStages, seed + 2);
          const originalCountry = pick(switchCountries, seed);
          const currentCountry = pick(switchCountries, seed + 2);
          const codAmount = seed % 5 === 1 ? null : 42 + dayOffset * 1.8 + innerIndex * 22.4;
          const itemQty = 4 + (dayOffset % 4) * 3 + innerIndex * 5;
          const ownerName = pick(COMMON_CUSTOMERS, seed + 3);
          const orderNo = `CP${dateCode}${pad(switchCounter)}`;
          const codAmountDisplay = formatCodAmount(currentCountry, codAmount);
          const orderTime = formatDateTime(rowDate, globalIndex);
          const trackStatus = resolveTrackStatus(orderStage, seed + 2);
          const shipTime = resolveShipTime(orderTime, orderStage, trackStatus, seed + 2);
          rows.push({
            code: orderNo,
            orderNo,
            codAmount,
            codAmountDisplay,
            warehouse: pick(COMMON_WAREHOUSES, seed + 2),
            itemQty,
            originalCountry,
            currentCountry,
            ownerName,
            customer: ownerName,
            businessType: '退件重派',
            orderType: '重派',
            orderSource: pick(ORDER_SOURCE_OPTIONS, seed + 2),
            orderStage,
            trackStatus,
            processStatus: orderStageToProcessStatus(orderStage),
            products: buildOrderProducts(orderNo, itemQty, seed + 13),
            tag: orderStage,
            status: orderStage,
            orderTime,
            shipTime,
            time: orderTime,
            value: codAmountDisplay === '-' ? `${itemQty}` : codAmountDisplay,
            evidenceTag: `改派:${originalCountry}->${currentCountry}`,
            evidenceValue: codAmountDisplay === '-' ? `商品数量:${itemQty}` : `COD:${codAmountDisplay}`,
            priorityValue: (codAmount || 0) * 2.4 + itemQty * 22 + (originalCountry !== currentCountry ? 80 : 0)
          });
          switchCounter += 1;
          globalIndex += 1;
        });
      }

      return rows.sort((left, right) => getTimeValue(right.time) - getTimeValue(left.time));
    }
    function getTimelinessCompletedNodeCount(status, totalNodes, seed) {
      if (status === '已完成') return totalNodes;
      if (status === '处理中') return Math.max(2, Math.min(totalNodes - 1, 2 + (seed % Math.max(1, totalNodes - 2))));
      return Math.max(1, Math.min(2, totalNodes));
    }
    function buildTimelinessRows(orderRows) {
      return orderRows
        .filter(row => TIMELINESS_BUSINESS_TYPE_OPTIONS.includes(row.businessType))
        .map((row, index) => {
          const nodes = TIMELINESS_NODE_CONFIG[row.businessType] || [];
          const timelinessStatus = row.processStatus || row.status;
          const seed = hashText(`${row.orderNo}-${row.warehouse}-${timelinessStatus}`);
          const completedNodeCount = getTimelinessCompletedNodeCount(timelinessStatus, nodes.length, seed);
          const nodeTimeline = {};
          const nodeDurations = [];
          let totalDurationSeconds = 0;
          let abnormalNodeCount = 0;
          let cursor = parseDateTime(row.time);
          cursor.setMinutes(cursor.getMinutes() + (seed % 21));

          for (let nodeIndex = 0; nodeIndex < completedNodeCount; nodeIndex += 1) {
            const node = nodes[nodeIndex];
            const baseFactor = 0.84 + (((seed + nodeIndex * 17) % 31) / 100);
            const pressureFactor = row.warehouse === '香港葵涌仓' && nodeIndex >= Math.max(2, nodes.length - 3)
              ? 1.08
              : timelinessStatus === '处理中' && nodeIndex === completedNodeCount - 1
                ? 1.12
                : 1;
            let durationSeconds = Math.round(node.baseTime * baseFactor * pressureFactor);
            const overflow = (seed + nodeIndex * 11 + index) % 9 === 0;
            if (overflow) durationSeconds += Math.round(node.baseTime * 0.28);

            const startTime = new Date(cursor);
            const endTime = new Date(startTime.getTime() + durationSeconds * 1000);
            const abnormal = overflow || durationSeconds >= node.baseTime * 1.28;

            nodeTimeline[node.name] = {
              startTime: formatSystemTime(startTime),
              endTime: formatSystemTime(endTime),
              durationSeconds,
              abnormal,
              reason: abnormal ? node.reason : ''
            };

            nodeDurations.push({ name: node.name, durationSeconds, abnormal });
            totalDurationSeconds += durationSeconds;
            abnormalNodeCount += abnormal ? 1 : 0;
            cursor = new Date(endTime.getTime() + (120 + ((seed + nodeIndex * 19) % 360)) * 1000);
          }

          const bottleneck = [...nodeDurations].sort((left, right) => right.durationSeconds - left.durationSeconds)[0];
          return {
            ...row,
            status: timelinessStatus,
            tag: bottleneck?.name || '--',
            value: formatDuration(totalDurationSeconds),
            totalDurationSeconds,
            bottleneckNode: bottleneck?.name || '--',
            abnormalNodeCount,
            completedNodeCount,
            lastNodeEndTime: nodeDurations.length ? nodeTimeline[nodeDurations[nodeDurations.length - 1].name].endTime : row.time,
            nodeTimeline,
            evidenceTag: `卡点:${bottleneck?.name || '--'}`,
            evidenceValue: `全链路:${formatDuration(totalDurationSeconds)}`,
            priorityValue: (row.priorityValue || 0) + totalDurationSeconds + abnormalNodeCount * 900
          };
        })
        .sort((left, right) => getTimeValue(right.time) - getTimeValue(left.time));
    }
    const ORDER_SAMPLE_ROWS = buildOrderRows();
    const TIMELINESS_SAMPLE_ROWS = buildTimelinessRows(ORDER_SAMPLE_ROWS);
    function createReport(config) {
      return {
        ...config,
        hero: [
          { label: '关注重点', value: config.focus },
          { label: '统计口径', value: config.note },
          { label: '责任团队', value: config.owner },
          { label: '评审建议', value: config.review }
        ],
        rows: config.rows || buildRows(config.rowsConfig)
      };
    }

    const reportDefinitions = {
      order: createReport({
        tabLabel: '订单', title: '订单统计报表', summary: '用于查看各订单类型下的订单规模、发货进度与异常订单分布，适合经营复盘时先看订单入口与履约准备情况。', scope: '数据范围:深圳兴围仓/广州白云仓/香港葵涌仓', sync: '最近同步:2026-03-18 23:46:08', focus: '重点关注订单规模与签收闭环', note: '口径=下单记录+轨迹回传', owner: '订单运营组', review: '适合放在目录首位做总览入口',
        filterA: { label: '订单阶段', options: ORDER_STAGE_OPTIONS },
        filterB: { label: '轨迹状态', options: TRACK_STATUS_OPTIONS },
        tagHeader: '订单阶段', valueHeader: '订单量',
        stats: [
          { label: '订单总量', value: '18,426', delta: '较上期+7.9%', tone: 'tone-blue', hint: '备货业务增长最明显' },
          { label: '上线成功率', value: '96.1%', delta: '较上期+1.3%', tone: 'tone-green', hint: '换单类型最稳定' },
          { label: '平均发货时长', value: '18小时', delta: '较上期-4小时', tone: 'tone-orange', hint: '下单至发货链路更顺畅' },
          { label: '异常订单数', value: '57', delta: '较上期-6单', tone: 'tone-violet', hint: '重派类型仍需重点跟进' }
        ],
        trend: { title: '近18天订单量与发货完成趋势', type: 'line', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '订单量', data: [1320, 1386, 1402, 1468, 1496, 1542, 1588, 1634, 1602], color: '#4d77ea' }, { label: '已发货订单量', data: [1268, 1325, 1344, 1410, 1441, 1488, 1532, 1582, 1556], color: '#2eb67d' }] },
        structure: { title: '订单阶段占比', type: 'doughnut', labels: ['待审核', '处理中', '已发货', '已签收', '异常'], values: [12, 26, 24, 30, 8] },
        insights: ['备货类型订单量持续抬升，建议同步关注入仓和拣货资源准备。', '重派类型的异常订单占比更高，适合单独追踪异常轨迹原因。', '广州白云仓的签收闭环节奏更平稳，可作为流程对标样本。'],
        toolbar: ['默认按下单时间倒序', '商品数量支持点击查看商品详情', '当前口径:下单记录+轨迹回传'],
        rowsConfig: { prefix: 'OD', tags: ORDER_STAGE_OPTIONS, statuses: ORDER_STAGE_OPTIONS, unit: '单', base: 680, step: 22, businessTypes: ORDER_TYPE_OPTIONS },
        rows: ORDER_SAMPLE_ROWS
      }),
      inbound: createReport({
        tabLabel: '入仓', title: '入仓统计报表', summary: '聚焦送货登记、收货完成与异常入仓单，适合仓内晨会查看入仓波峰和收货稳定性。', scope: '数据范围:深圳兴围仓/广州白云仓/香港葵涌仓', sync: '最近同步:2026-03-18 23:38:12', focus: '重点关注收货及时率与异常入仓', note: '口径=已登记送货并进入收货链路', owner: '入仓运营组', review: '适合联动月台与收货班组复盘',
        filterA: { label: '入仓节点', options: ['送货登记', '卸货完成', '收货中', '收货完成'] },
        filterB: { label: '入仓状态', options: ['已完成', '处理中', '待收货'] },
        tagHeader: '入仓节点', valueHeader: '入仓单量',
        stats: [
          { label: '入仓单量', value: '9,842', delta: '较上期+6.8%', tone: 'tone-blue', hint: '峰值集中在03-16白班' },
          { label: '收货及时率', value: '96.4%', delta: '较上期+1.2%', tone: 'tone-green', hint: '干线业务恢复最明显' },
          { label: '平均收货时长', value: '3.2小时', delta: '较上期-0.5小时', tone: 'tone-orange', hint: '退件重派链路仍偏长' },
          { label: '异常入仓单', value: '28', delta: '较上期-4单', tone: 'tone-violet', hint: '集中在夜间波次' }
        ],
        trend: { title: '近18天入仓单量与完成收货趋势', type: 'line', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '入仓单量', data: [826, 854, 842, 879, 902, 936, 948, 996, 978], color: '#4d77ea' }, { label: '完成收货单量', data: [788, 814, 803, 838, 866, 901, 916, 958, 944], color: '#2eb67d' }] },
        structure: { title: '入仓节点占比', type: 'doughnut', labels: ['送货登记', '卸货完成', '收货中', '收货完成'], values: [22, 26, 18, 34] },
        insights: ['广州白云仓夜班收货节奏改善明显，适合作为轮班排班样本。', '退件重派业务的平均收货时长仍高于干线业务，建议增加专属月台。', '深圳兴围仓异常入仓单集中在卸货完成后等待收货阶段，适合继续下钻卡点。'],
        toolbar: ['默认按创建时间倒序', '异常入仓单需人工跟进', '当前口径:送货登记+收货链路'],
        rowsConfig: { prefix: 'IN', tags: ['送货登记', '卸货完成', '收货中', '收货完成'], statuses: ['已完成', '处理中', '待收货'], unit: '单', base: 420, step: 16, businessTypes: BUSINESS_TYPE_OPTIONS }
      }),
      putaway: createReport({
        tabLabel: '上架', title: '上架统计报表', summary: '用于查看入库后上架任务密度、库区负载与平均完成时长，辅助入仓波峰安排。', scope: '数据范围:入仓任务池', sync: '最近同步:2026-03-18 22:56:32', focus: '重点关注库区负载与上架时长', note: '口径=已完成收货并生成上架任务', owner: '上架作业组', review: '适合查看AGV协同效果',
        filterA: { label: '上架库区', options: ['A区', 'B区', 'C区', '暂存区'] }, filterB: { label: '上架状态', options: ['已完成', '处理中', '待上架'] }, tagHeader: '上架库区', valueHeader: '上架任务量',
        stats: [
          { label: '上架任务数', value: '1,236', delta: '较上期+6.5%', tone: 'tone-blue', hint: 'A区入仓波峰明显' },
          { label: '平均完成时长', value: '2.6小时', delta: '较上期-0.4小时', tone: 'tone-green', hint: 'AGV协同效果提升' },
          { label: '待上架件数', value: '318', delta: '较上期-9.1%', tone: 'tone-orange', hint: '暂存区库存回落' },
          { label: '异常库位占比', value: '1.8%', delta: '较上期持平', tone: 'tone-violet', hint: '主要为库位禁用占比' }
        ],
        trend: { title: '近18天上架任务趋势', type: 'bar', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '上架任务数', data: [122, 136, 128, 145, 142, 151, 158, 162, 156], color: '#4d77ea' }] },
        structure: { title: '库区任务占比', type: 'doughnut', labels: ['A区', 'B区', 'C区', '暂存区'], values: [39, 26, 22, 13] },
        insights: ['备货业务在A区的上架任务增长最快，建议关注卡板补位与路径拥堵。', '退件重派业务在暂存区停留时间更长，适合增加专项上架波次。', '暂存区待上架持续下降，说明收货到上架衔接改善。'],
        toolbar: ['默认按创建时间倒序', 'AGV任务与人工任务合并展示', '当前口径:收货完成后上架任务'],
        rowsConfig: { prefix: 'PA', tags: ['A区', 'B区', 'C区', '暂存区'], statuses: ['已完成', '处理中', '待上架'], unit: '单', base: 42, step: 5, businessTypes: BUSINESS_TYPE_OPTIONS }
      }),
      picking: createReport({
        tabLabel: '拣货', title: '拣货统计报表', summary: '聚焦波次拣货密度、拣货完成效率与异常拣货单，辅助安排人力和AGV协同。', scope: '数据范围:出库拣货任务池', sync: '最近同步:2026-03-18 23:09:44', focus: '重点关注波次波峰与超时拣货', note: '口径=已生成拣货任务单', owner: '出库拣货组', review: '适合联动波次和库区策略复盘',
        filterA: { label: '拣货分区', options: ['A区整托', 'B区散货', 'C区高位', '出库缓冲区'] },
        filterB: { label: '拣货状态', options: ['已完成', '拣货中', '待拣货'] },
        tagHeader: '拣货分区', valueHeader: '拣货量',
        stats: [
          { label: '拣货任务数', value: '3,486', delta: '较上期+5.4%', tone: 'tone-blue', hint: '下午波次增长最快' },
          { label: '准时拣货率', value: '95.7%', delta: '较上期+1.1%', tone: 'tone-green', hint: '干线任务完成更稳定' },
          { label: '平均拣货时长', value: '1.9小时', delta: '较上期-0.3小时', tone: 'tone-orange', hint: '散货拣选改善明显' },
          { label: '异常拣货单', value: '42', delta: '较上期-6单', tone: 'tone-violet', hint: '高位货架仍需关注' }
        ],
        trend: { title: '近18天拣货任务与完成数趋势', type: 'line', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '拣货任务数', data: [286, 298, 304, 318, 326, 344, 352, 368, 360], color: '#4d77ea' }, { label: '准时完成数', data: [268, 281, 288, 301, 309, 328, 336, 352, 344], color: '#2eb67d' }] },
        structure: { title: '拣货分区占比', type: 'doughnut', labels: ['A区整托', 'B区散货', 'C区高位', '出库缓冲区'], values: [34, 29, 21, 16] },
        insights: ['B区散货在备货业务下波动最大，适合增加波次切分规则。', '退件重派业务更集中在出库缓冲区，建议单独编排人力。', 'A区整托任务稳定增长，可联动AGV补充整托搬运能力。'],
        toolbar: ['默认按创建时间倒序', '超时拣货任务默认高亮', '当前口径:拣货任务单'],
        rowsConfig: { prefix: 'PK', tags: ['A区整托', 'B区散货', 'C区高位', '出库缓冲区'], statuses: ['已完成', '拣货中', '待拣货'], unit: '单', base: 76, step: 6, businessTypes: BUSINESS_TYPE_OPTIONS }
      }),
      outbound: createReport({
        tabLabel: '出库', title: '出库统计报表', summary: '聚焦装车完成、发运准点与异常拦截，适合查看出库执行效率和发车波峰。', scope: '数据范围:深圳兴围仓/广州白云仓/香港葵涌仓', sync: '最近同步:2026-03-18 23:40:18', focus: '重点关注装车波峰与准点发运', note: '口径=已创建出库单并进入装车发运链路', owner: '出库调度组', review: '适合联动监装与运输调度复盘',
        filterA: { label: '出库波次', options: ['上午波次', '下午波次', '夜间波次', '加急波次'] },
        filterB: { label: '出库状态', options: ['已发运', '装车中', '待出库'] },
        tagHeader: '出库波次', valueHeader: '出库单量',
        stats: [
          { label: '出库单量', value: '12,846', delta: '较上期+8.2%', tone: 'tone-blue', hint: '峰值出现在03-16' },
          { label: '准点发运率', value: '97.8%', delta: '较上期+1.4%', tone: 'tone-green', hint: '已接近目标值98%' },
          { label: '平均出库时长', value: '4.1小时', delta: '较上期-0.6小时', tone: 'tone-orange', hint: '夜班出库提速明显' },
          { label: '异常拦截单', value: '36', delta: '较上期-5单', tone: 'tone-violet', hint: '集中在香港葵涌仓' }
        ],
        trend: { title: '近18天出库单量与准点发运趋势', type: 'line', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '出库单量', data: [986, 1032, 1016, 1098, 1124, 1182, 1214, 1280, 1236], color: '#4d77ea' }, { label: '准点发运单量', data: [932, 988, 972, 1055, 1089, 1136, 1178, 1228, 1192], color: '#2eb67d' }] },
        structure: { title: '出库波次占比', type: 'doughnut', labels: ['上午波次', '下午波次', '夜间波次', '加急波次'], values: [31, 34, 23, 12] },
        insights: ['下午波次仍是主要出库压力点，建议继续复核月台排班与装车节奏。', '干线业务准点率最稳定，可作为发运基线口径。', '香港葵涌仓异常拦截偏高，适合继续下钻安检复核场景。'],
        toolbar: ['默认按创建时间倒序', '单次导出限制100000条', '当前口径:出库单+发运回传'],
        rowsConfig: { prefix: 'OUT', tags: ['上午波次', '下午波次', '夜间波次', '加急波次'], statuses: ['已发运', '装车中', '待出库'], unit: '单', base: 620, step: 24, businessTypes: BUSINESS_TYPE_OPTIONS }
      }),
      timeliness: createReport({
        tabLabel: '时效', title: '节点时效报表', summary: '聚焦工作台时效统计口径，按仓库、货主、业务类型和订单状态查看节点时效，适合在复盘中快速锁定卡点节点并查看订单明细。', scope: '数据范围:备货/干线订单节点时效样本', sync: '最近同步:2026-03-18 23:52:16', focus: '重点关注节点平均时效与卡点订单', note: '口径=工作台节点定义+订单样本时效重算', owner: '仓储运营分析组', review: '适合联动工作台时效看板做节点复盘',
        filterA: { label: '关注节点', options: [] },
        filterB: { label: '订单状态', options: TIMELINESS_STATUS_OPTIONS },
        tagHeader: '卡点节点', valueHeader: '全链路时效',
        stats: [],
        trend: { title: '节点时效分布', type: 'bar', labels: [], datasets: [{ label: '平均时效', data: [], color: '#4d77ea' }] },
        structure: { title: '节点结构占比', type: 'doughnut', labels: [], values: [] },
        insights: ['建议先按业务类型选定一个场景，再查看节点卡点。', '节点平均时效可直接点击，查看对应订单的开始时间、结束时间和节点时长。', '若需要定位问题原因，可联动仓库和订单状态进一步缩小范围。'],
        toolbar: ['业务类型单选', '节点平均时效支持点击下钻', '明细字段复用订单统计报表'],
        rowsConfig: { prefix: 'TL', tags: ['节点时效'], statuses: TIMELINESS_STATUS_OPTIONS, unit: '秒', businessTypes: TIMELINESS_BUSINESS_TYPE_OPTIONS },
        rows: TIMELINESS_SAMPLE_ROWS
      }),
      inventory: createReport({
        tabLabel: '库存', title: '库存报表', summary: '用于观察库存结构、库龄健康与高占用SKU，适合在周会中快速判断库容与呆滞风险。', scope: '数据范围:三仓即时库存', sync: '最近同步:2026-03-18 23:01:05', focus: '重点关注库龄健康与高占用SKU', note: '口径=可用库存+待复核库存', owner: '库存控制组', review: '适合查看库容与呆滞风险',
        filterA: { label: '商品分类', options: ['电子产品', '服饰鞋包', '家居用品', '美妆个护'] }, filterB: { label: '库存健康度', options: ['健康', '临期关注', '待复核'] }, tagHeader: '商品分类', valueHeader: '库存量',
        stats: [
          { label: '库存总量', value: '245,860', delta: '较上期+4.8%', tone: 'tone-blue', hint: '电子类增长最快' },
          { label: '库龄健康占比', value: '92.3%', delta: '较上期+1.1%', tone: 'tone-green', hint: '临期库存下降' },
          { label: '高占用SKU', value: '58', delta: '较上期+6个', tone: 'tone-orange', hint: '重点看A区与高位货架' },
          { label: '待复核库存', value: '1,236', delta: '较上期-13.5%', tone: 'tone-violet', hint: '差异盘点逐步清理' }
        ],
        trend: { title: '近18天库存量趋势', type: 'line', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '库存总量', data: [236800, 238420, 239580, 240260, 241900, 243120, 244580, 245100, 245860], color: '#4d77ea' }] },
        structure: { title: '分类库存占比', type: 'doughnut', labels: ['电子产品', '服饰鞋包', '家居用品', '美妆个护'], values: [43, 24, 19, 14] },
        insights: ['电子产品库存拉升明显，需要同步查看出货节奏。', '临期关注库存集中在广州白云仓，建议追加清理策略。', '待复核库存下降明显，差异闭环效率优于上月。'],
        toolbar: ['默认按创建时间倒序', '空数据统一展示--', '口径:可用+待复核库存'],
        rowsConfig: { prefix: 'SKU', tags: ['电子产品', '服饰鞋包', '家居用品', '美妆个护'], statuses: ['健康', '临期关注', '待复核'], unit: '件', base: 9860, step: 820 }
      }),
      'sign-rate': createReport({
        tabLabel: '签收率', title: '客户签收率报表', summary: '用于跟踪签收率波动、仓库对比和重点客户表现，是服务质量复盘的核心视图。', scope: '数据范围:跨境尾程签收链路', sync: '最近同步:2026-03-18 22:48:46', focus: '重点关注仓库签收率差异', note: '口径=已发货订单且存在签收回传', owner: '服务质量组', review: '适合联动末端履约和客诉复盘',
        filterA: { label: '服务线路', options: ['经济线', '标准线', '特快线'] }, filterB: { label: '表现分层', options: ['优秀', '关注', '预警'] }, tagHeader: '服务线路', valueHeader: '签收率',
        stats: [
          { label: '整体签收率', value: '96.8%', delta: '较上期+0.9%', tone: 'tone-blue', hint: '深圳兴围仓表现最佳' },
          { label: '48小时签收率', value: '82.4%', delta: '较上期+1.6%', tone: 'tone-green', hint: '特快线恢复明显' },
          { label: '低于95%客户数', value: '7', delta: '较上期-2家', tone: 'tone-orange', hint: '主要是代理转运客户' },
          { label: '签收异常单', value: '214', delta: '较上期-11单', tone: 'tone-violet', hint: '末端回传更完整' }
        ],
        trend: { title: '近18天签收率趋势', type: 'line', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '签收率', data: [95.6, 96.1, 95.8, 96.6, 96.5, 97.0, 96.7, 96.9, 96.8], color: '#2eb67d' }], yRange: { min: 92, max: 100 } },
        structure: { title: '仓库签收率对比', type: 'bar', labels: ['深圳兴围仓', '广州白云仓', '香港葵涌仓'], values: [97.4, 96.1, 96.8] },
        insights: ['深圳兴围仓签收率稳定在97%以上，可作为流程对标样本。', '经济线仍是波动最大的线路，建议补齐承运商回传颗粒度。', '低签收客户已缩减到7家，专项治理策略正在起效。'],
        toolbar: ['默认按创建时间倒序', '签收率低于95%默认高亮', '口径:发货订单签收回传'],
        rowsConfig: { prefix: 'SR', tags: ['经济线', '标准线', '特快线'], statuses: ['优秀', '关注', '预警'], mode: 'percent', base: 95.2, step: 0.4 }
      }),
      complaint: createReport({
        tabLabel: '客诉分析', title: '客诉分析报表', summary: '用于查看客诉量、问题类型与处理进度，帮助识别重复问题和高风险客户。', scope: '数据范围:客服工单系统', sync: '最近同步:2026-03-18 21:58:12', focus: '重点关注高风险客诉与响应时效', note: '口径=已登记且有效的客诉工单', owner: '客服质控组', review: '适合联动签收率与赔付视图查看',
        filterA: { label: '客诉类型', options: ['配送延迟', '货物损坏', '服务态度', '数量差异'] }, filterB: { label: '处理状态', options: ['处理中', '已闭环', '待确认'] }, tagHeader: '客诉类型', valueHeader: '客诉量',
        stats: [
          { label: '客诉工单数', value: '142', delta: '较上期+6.0%', tone: 'tone-blue', hint: '配送延迟上升明显' },
          { label: '24小时响应率', value: '94.6%', delta: '较上期+2.1%', tone: 'tone-green', hint: '客服响应提速' },
          { label: '高风险工单', value: '16', delta: '较上期+3单', tone: 'tone-orange', hint: '需专项跟进' },
          { label: '重复问题客户', value: '5', delta: '较上期持平', tone: 'tone-violet', hint: '集中在同一代理渠道' }
        ],
        trend: { title: '近18天客诉趋势', type: 'line', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '客诉量', data: [13, 12, 15, 14, 16, 15, 18, 20, 19], color: '#ff5a5f' }, { label: '已闭环工单', data: [9, 10, 12, 11, 13, 14, 15, 17, 16], color: '#4d77ea' }] },
        structure: { title: '客诉类型占比', type: 'doughnut', labels: ['配送延迟', '货物损坏', '服务态度', '数量差异'], values: [36, 28, 21, 15] },
        insights: ['配送延迟成为首位客诉类型，建议联动签收率报表一起查看。', '24小时响应率稳定提升，说明工单分派更合理。', '高风险工单多集中在同一代理渠道，可考虑加规则拦截。'],
        toolbar: ['默认按创建时间倒序', '高风险工单需二次确认', '口径:有效客诉工单'],
        rowsConfig: { prefix: 'CS', tags: ['配送延迟', '货物损坏', '服务态度', '数量差异'], statuses: ['处理中', '已闭环', '待确认'], unit: '单', base: 5, step: 2 }
      }),
      compensation: createReport({
        tabLabel: '赔付分析', title: '赔付分析报表', summary: '用于查看赔付金额、类型分布与审批流转情况，支持在评审中快速识别高成本异常场景。', scope: '数据范围:赔付审批链路', sync: '最近同步:2026-03-18 22:11:09', focus: '重点关注高金额赔付与审批滞留', note: '口径=已提交赔付申请单', owner: '财务结算组', review: '适合联动客诉与装车视频复盘',
        filterA: { label: '赔付类型', options: ['货物丢失', '货物损坏', '配送延迟', '服务补偿'] }, filterB: { label: '审批阶段', options: ['待审批', '审批中', '已完成'] }, tagHeader: '赔付类型', valueHeader: '赔付金额',
        stats: [
          { label: '赔付金额', value: '¥142,380.00', delta: '较上期+12.3%', tone: 'tone-blue', hint: '高金额单需专项复盘' },
          { label: '已完成审批率', value: '88.6%', delta: '较上期+4.5%', tone: 'tone-green', hint: '财务审核更稳定' },
          { label: '超3天未审批', value: '11', delta: '较上期-2单', tone: 'tone-orange', hint: '仍需压缩长尾审批' },
          { label: '高金额案件', value: '6', delta: '较上期+1件', tone: 'tone-violet', hint: '集中在货损场景' }
        ],
        trend: { title: '近18天赔付金额趋势', type: 'bar', labels: ['03-01', '03-03', '03-05', '03-07', '03-09', '03-11', '03-13', '03-15', '03-17'], datasets: [{ label: '赔付金额', data: [11200, 10860, 12940, 11820, 14600, 13240, 15180, 16420, 16120], color: '#ff5a5f' }] },
        structure: { title: '赔付类型占比', type: 'doughnut', labels: ['货物丢失', '货物损坏', '配送延迟', '服务补偿'], values: [32, 36, 18, 14] },
        insights: ['货物损坏仍是赔付金额最高类型，建议联动装车视频复盘。', '超3天未审批单持续下降，审批链路效率提升。', '高金额案件集中在同一仓库，建议补充视频留存要求。'],
        toolbar: ['默认按创建时间倒序', '金额保留2位小数', '口径:已提交赔付申请'],
        rowsConfig: { prefix: 'PF', tags: ['货物丢失', '货物损坏', '配送延迟', '服务补偿'], statuses: ['待审批', '审批中', '已完成'], mode: 'currency', base: 1680, step: 320 }
      })
    };

    function getCurrentTimelinessBusinessType(selectedTypes = state.filters.businessTypes) {
      return getActiveBusinessTypes(selectedTypes, 'timeliness')[0] || TIMELINESS_BUSINESS_TYPE_OPTIONS[0];
    }
    function getGenericTableFields(report = reportDefinitions[state.currentReport]) {
      return GENERIC_TABLE_FIELD_ORDER.map(key => {
        const field = GENERIC_TABLE_FIELD_DEFINITIONS[key];
        return {
          key,
          label: typeof field.label === 'function' ? field.label(report) : field.label,
          align: field.align || '',
          html: Boolean(field.html),
          width: field.width || 132
        };
      });
    }
    function getTimelinessTableFields(selectedBusinessTypes = getActiveBusinessTypes()) {
      const businessType = getCurrentTimelinessBusinessType(selectedBusinessTypes);
      const nodeFields = (TIMELINESS_NODE_CONFIG[businessType] || []).map(node => ({
        key: `node:${node.name}`,
        label: node.name,
        align: 'right',
        width: 170,
        benchmarkSeconds: node.baseTime
      }));
      return [...TIMELINESS_TABLE_BASE_FIELDS.map(field => ({ ...field })), ...nodeFields];
    }
    function getAvailableTableFields(reportKey = state.currentReport, selectedBusinessTypes = getActiveBusinessTypes()) {
      const report = reportDefinitions[reportKey];
      if (reportKey === 'order') {
        return getOrderVisibleFields(selectedBusinessTypes).map(key => ({
          key,
          label: ORDER_FIELD_DEFINITIONS[key].label,
          align: ORDER_FIELD_DEFINITIONS[key].align || '',
          width: ORDER_FIELD_DEFINITIONS[key].width || 132
        }));
      }
      if (reportKey === 'timeliness') {
        return getTimelinessTableFields(selectedBusinessTypes);
      }
      return getGenericTableFields(report);
    }
    function getTableProfileKey(reportKey = state.currentReport, selectedBusinessTypes = getActiveBusinessTypes()) {
      return reportKey === 'timeliness'
        ? `${reportKey}:${getCurrentTimelinessBusinessType(selectedBusinessTypes)}`
        : reportKey;
    }
    function normalizeConfiguredFields(availableFields, savedProfile = null) {
      const fieldMap = new Map(availableFields.map(field => [field.key, field]));
      const validKeys = availableFields.map(field => field.key);
      const order = Array.isArray(savedProfile?.order)
        ? savedProfile.order.filter(key => fieldMap.has(key))
        : [];
      validKeys.forEach(key => {
        if (!order.includes(key)) order.push(key);
      });
      const hiddenSet = new Set(Array.isArray(savedProfile?.hidden) ? savedProfile.hidden.filter(key => fieldMap.has(key)) : []);
      const pinnedKeys = Array.isArray(savedProfile?.pinned) ? savedProfile.pinned.filter(key => fieldMap.has(key)) : [];
      let pinnedCount = 0;
      return order.map(key => {
        const visible = !hiddenSet.has(key);
        const pinned = visible && pinnedKeys.includes(key) && pinnedCount < MAX_PINNED_COLUMNS;
        if (pinned) pinnedCount += 1;
        return { ...fieldMap.get(key), visible, pinned };
      });
    }
    function getConfiguredTableFields(reportKey = state.currentReport, selectedBusinessTypes = getActiveBusinessTypes()) {
      const availableFields = getAvailableTableFields(reportKey, selectedBusinessTypes);
      const profileKey = getTableProfileKey(reportKey, selectedBusinessTypes);
      return normalizeConfiguredFields(availableFields, state.columnConfig.savedProfiles[profileKey]);
    }
    function getVisibleConfiguredTableFields(reportKey = state.currentReport, selectedBusinessTypes = getActiveBusinessTypes()) {
      return getConfiguredTableFields(reportKey, selectedBusinessTypes).filter(field => field.visible);
    }
    function persistColumnConfig(profileKey, fields) {
      state.columnConfig.savedProfiles[profileKey] = {
        order: fields.map(field => field.key),
        hidden: fields.filter(field => !field.visible).map(field => field.key),
        pinned: fields.filter(field => field.visible && field.pinned).map(field => field.key)
      };
    }
    function openColumnConfigModal() {
      const selectedBusinessTypes = getActiveBusinessTypes();
      state.columnConfig.profileKey = getTableProfileKey(state.currentReport, selectedBusinessTypes);
      state.columnConfig.draftFields = getConfiguredTableFields(state.currentReport, selectedBusinessTypes).map(field => ({ ...field }));
      state.columnConfig.draggingKey = '';
      state.columnConfig.dragOverKey = '';
      state.columnConfig.modalOpen = true;
      renderColumnConfigModal();
    }
    function closeColumnConfigModal() {
      state.columnConfig.modalOpen = false;
      state.columnConfig.draftFields = [];
      state.columnConfig.profileKey = '';
      state.columnConfig.draggingKey = '';
      state.columnConfig.dragOverKey = '';
      renderColumnConfigModal();
    }
    function resetColumnConfigDraft() {
      const selectedBusinessTypes = getActiveBusinessTypes();
      state.columnConfig.draftFields = normalizeConfiguredFields(getAvailableTableFields(state.currentReport, selectedBusinessTypes)).map(field => ({ ...field }));
      state.columnConfig.draggingKey = '';
      state.columnConfig.dragOverKey = '';
      renderColumnConfigModal();
    }
    function setDraftFieldVisible(fieldKey, visible) {
      state.columnConfig.draftFields = state.columnConfig.draftFields.map(field => field.key === fieldKey ? { ...field, visible, pinned: visible ? field.pinned : false } : field);
      renderColumnConfigModal();
    }
    function removeDraftField(fieldKey) {
      setDraftFieldVisible(fieldKey, false);
    }
    function moveDraftFieldToTop(fieldKey) {
      const currentIndex = state.columnConfig.draftFields.findIndex(field => field.key === fieldKey);
      if (currentIndex <= 0) return;
      const nextFields = [...state.columnConfig.draftFields];
      const [movedField] = nextFields.splice(currentIndex, 1);
      nextFields.unshift(movedField);
      state.columnConfig.draftFields = nextFields;
      renderColumnConfigModal();
    }
    function toggleDraftFieldPinned(fieldKey) {
      const visiblePinnedCount = state.columnConfig.draftFields.filter(field => field.visible && field.pinned).length;
      state.columnConfig.draftFields = state.columnConfig.draftFields.map(field => {
        if (field.key !== fieldKey) return field;
        if (!field.visible) return field;
        if (field.pinned) {
          return { ...field, pinned: false };
        }
        if (visiblePinnedCount >= MAX_PINNED_COLUMNS) {
          showToast(`最多可固定${MAX_PINNED_COLUMNS}列`, 'warning');
          return field;
        }
        return { ...field, pinned: true };
      });
      renderColumnConfigModal();
    }
    function clearDraftPinnedFields() {
      state.columnConfig.draftFields = state.columnConfig.draftFields.map(field => ({ ...field, pinned: false }));
      renderColumnConfigModal();
    }
    function reorderDraftField(dragKey, targetKey) {
      if (!dragKey || !targetKey || dragKey === targetKey) return;
      const nextFields = [...state.columnConfig.draftFields];
      const dragIndex = nextFields.findIndex(field => field.key === dragKey);
      const targetIndex = nextFields.findIndex(field => field.key === targetKey);
      if (dragIndex < 0 || targetIndex < 0) return;
      const [dragField] = nextFields.splice(dragIndex, 1);
      const insertIndex = nextFields.findIndex(field => field.key === targetKey);
      nextFields.splice(insertIndex, 0, dragField);
      state.columnConfig.draftFields = nextFields;
      renderColumnConfigModal();
    }
    function getPinnedFieldLayout(fields) {
      const layout = {};
      const pinnedFields = fields.filter(field => field.visible !== false && field.pinned);
      const lastPinnedKey = pinnedFields[pinnedFields.length - 1]?.key || '';
      let leftOffset = 0;
      fields.forEach(field => {
        const width = field.width || 132;
        const pinned = Boolean(field.pinned);
        layout[field.key] = {
          width,
          pinned,
          left: pinned ? leftOffset : 0,
          lastPinned: pinned && field.key === lastPinnedKey
        };
        if (pinned) leftOffset += width;
      });
      return layout;
    }
    function buildTableCellAttrs(field, layout, cellType = 'td') {
      const meta = layout[field.key] || { width: field.width || 132, pinned: false, left: 0, lastPinned: false };
      const classNames = [];
      if (field.align === 'right') classNames.push('cell-right');
      if (meta.pinned) {
        classNames.push('table-pin-cell');
        classNames.push(cellType === 'th' ? 'table-pin-head' : 'table-pin-body');
        if (meta.lastPinned) classNames.push('table-pin-last');
      }
      const styles = [`min-width:${meta.width}px`, `width:${meta.width}px`];
      if (meta.pinned) styles.push(`left:${meta.left}px`);
      return {
        className: classNames.join(' '),
        styleText: styles.join(';')
      };
    }
    function moveDraftField(fieldKey, direction) {
      const visibleKeys = state.columnConfig.draftFields.filter(field => field.visible).map(field => field.key);
      const currentVisibleIndex = visibleKeys.indexOf(fieldKey);
      if (currentVisibleIndex < 0) return;
      const targetVisibleKey = direction === 'up'
        ? visibleKeys[currentVisibleIndex - 1]
        : visibleKeys[currentVisibleIndex + 1];
      if (!targetVisibleKey) return;
      const nextFields = [...state.columnConfig.draftFields];
      const currentIndex = nextFields.findIndex(field => field.key === fieldKey);
      const targetIndex = nextFields.findIndex(field => field.key === targetVisibleKey);
      const [movedField] = nextFields.splice(currentIndex, 1);
      const insertIndex = direction === 'up'
        ? nextFields.findIndex(field => field.key === targetVisibleKey)
        : nextFields.findIndex(field => field.key === targetVisibleKey) + 1;
      nextFields.splice(insertIndex, 0, movedField);
      state.columnConfig.draftFields = nextFields;
      renderColumnConfigModal();
    }
    function saveColumnConfigDraft() {
      const visibleCount = state.columnConfig.draftFields.filter(field => field.visible).length;
      if (!visibleCount) {
        showToast('请至少保留1个列表字段', 'warning');
        return;
      }
      persistColumnConfig(state.columnConfig.profileKey, state.columnConfig.draftFields);
      closeColumnConfigModal();
      renderTable();
      showToast('列表字段配置已保存');
    }
    function renderColumnConfigModal() {
      const modal = document.getElementById('columnConfigModal');
      if (!modal) return;
      if (!state.columnConfig.modalOpen) {
        modal.classList.add('hidden');
        return;
      }
      const draftFields = state.columnConfig.draftFields || [];
      const visibleFields = draftFields.filter(field => field.visible);
      const pinnedCount = visibleFields.filter(field => field.pinned).length;
      const report = reportDefinitions[state.currentReport];
      document.getElementById('columnConfigTitle').textContent = '列表设置';
      document.getElementById('columnConfigScope').textContent = `${report.title.replace('统计报表', '明细列表')}当前共${draftFields.length}个可配置字段，支持显隐、顺序与固定列设置。`;
      document.getElementById('columnConfigFieldCount').textContent = `系统字段(${visibleFields.length}/${draftFields.length})`;
      document.getElementById('columnConfigFieldList').innerHTML = draftFields.map(field => `<label class="column-field-option"><input type="checkbox" data-column-toggle="${field.key}" ${field.visible ? 'checked' : ''}><span>${field.label}</span></label>`).join('');
      document.getElementById('columnConfigPinCount').textContent = `最多可固定${MAX_PINNED_COLUMNS}列`;
      document.getElementById('columnConfigPinnedHint').textContent = `已固定${pinnedCount}列`;
      document.getElementById('columnConfigSelectedList').innerHTML = visibleFields.length
        ? visibleFields.map((field, index) => `<div class="column-order-item ${field.pinned ? 'is-pinned' : ''} ${state.columnConfig.draggingKey === field.key ? 'is-dragging' : ''} ${state.columnConfig.dragOverKey === field.key ? 'is-drag-over' : ''}" draggable="true" data-column-drag-key="${field.key}"><span class="column-order-handle" title="拖动调整顺序"><i class="ri-draggable"></i></span><span class="column-order-label">${field.label}</span><button type="button" class="column-order-btn" data-column-remove="${field.key}" aria-label="删除${field.label}"><i class="ri-close-line"></i></button><button type="button" class="column-order-btn" data-column-top="${field.key}" ${index === 0 ? 'disabled' : ''} aria-label="置顶${field.label}"><i class="ri-arrow-up-line"></i></button><button type="button" class="column-order-btn ${field.pinned ? 'is-active' : ''}" data-column-pin="${field.key}" aria-label="${field.pinned ? '取消固定' : '固定'}${field.label}"><i class="${field.pinned ? 'ri-pushpin-2-fill' : 'ri-pushpin-2-line'}"></i></button></div>`).join('')
        : '<div class="column-order-empty">暂无已选字段，请至少保留1个字段用于列表展示。</div>';
      modal.classList.remove('hidden');
    }
    function buildTimelinessNodeSummary(rows, businessType = getCurrentTimelinessBusinessType()) {
      const nodes = TIMELINESS_NODE_CONFIG[businessType] || [];
      return nodes.map((node, index) => {
        const samples = rows.map(row => row.nodeTimeline?.[node.name]).filter(Boolean);
        const durations = samples.map(item => item.durationSeconds);
        const avgDurationSeconds = durations.length ? Math.round(average(durations)) : 0;
        const latestEndTime = samples.length
          ? [...samples].sort((left, right) => getTimeValue(right.endTime) - getTimeValue(left.endTime))[0].endTime
          : '--';
        const abnormalCount = samples.filter(item => item.abnormal).length;
        return {
          order: index + 1,
          name: node.name,
          sampleCount: samples.length,
          avgDurationSeconds,
          minDurationSeconds: durations.length ? Math.min(...durations) : 0,
          maxDurationSeconds: durations.length ? Math.max(...durations) : 0,
          abnormalCount,
          abnormalRate: samples.length ? abnormalCount / samples.length : 0,
          completionRate: rows.length ? samples.length / rows.length : 0,
          benchmarkSeconds: node.baseTime,
          deltaSeconds: durations.length ? avgDurationSeconds - node.baseTime : 0,
          latestEndTime
        };
      });
    }
    function buildTimelinessDailyRows(rows, businessType = getCurrentTimelinessBusinessType()) {
      const nodes = TIMELINESS_NODE_CONFIG[businessType] || [];
      const grouped = new Map();

      rows.forEach(row => {
        const dateKey = row.time.slice(0, 10);
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, {
            date: dateKey,
            rows: [],
            nodeMetrics: {}
          });
        }
        const bucket = grouped.get(dateKey);
        bucket.rows.push(row);

        nodes.forEach(node => {
          const nodeRecord = row.nodeTimeline?.[node.name];
          if (!nodeRecord) return;
          if (!bucket.nodeMetrics[node.name]) {
            bucket.nodeMetrics[node.name] = {
              samples: [],
              abnormalCount: 0
            };
          }
          bucket.nodeMetrics[node.name].samples.push({
            orderNo: row.orderNo || row.code,
            durationSeconds: nodeRecord.durationSeconds
          });
          if (nodeRecord.abnormal) bucket.nodeMetrics[node.name].abnormalCount += 1;
        });
      });

      return Array.from(grouped.values()).map(bucket => {
        const nodeStats = {};
        nodes.forEach(node => {
          const metric = bucket.nodeMetrics[node.name];
          const samples = metric?.samples || [];
          const durations = samples.map(item => item.durationSeconds);
          const avgDurationSeconds = durations.length ? Math.round(average(durations)) : 0;
          nodeStats[node.name] = {
            name: node.name,
            sampleCount: samples.length,
            avgDurationSeconds,
            minDurationSeconds: durations.length ? Math.min(...durations) : 0,
            maxDurationSeconds: durations.length ? Math.max(...durations) : 0,
            abnormalCount: metric?.abnormalCount || 0,
            abnormalRate: durations.length ? (metric?.abnormalCount || 0) / durations.length : 0,
            benchmarkSeconds: node.baseTime,
            deltaSeconds: durations.length ? avgDurationSeconds - node.baseTime : 0
          };
        });
        const bottleneckNode = Object.values(nodeStats)
          .filter(item => item.sampleCount)
          .sort((left, right) => (right.avgDurationSeconds - left.avgDurationSeconds) || (right.sampleCount - left.sampleCount))[0] || null;
        return {
          date: bucket.date,
          orderCount: bucket.rows.length,
          avgTotalDurationSeconds: bucket.rows.length ? Math.round(average(bucket.rows.map(row => row.totalDurationSeconds))) : 0,
          bottleneckNode: bottleneckNode?.name || '--',
          nodeStats
        };
      }).sort((left, right) => right.date.localeCompare(left.date));
    }
    function buildTimelinessStats(rows) {
      const businessType = getCurrentTimelinessBusinessType();
      const summaryRows = buildTimelinessNodeSummary(rows, businessType);
      const validRows = summaryRows.filter(item => item.sampleCount);
      const totalAvgDuration = validRows.reduce((sum, item) => sum + item.avgDurationSeconds, 0);
      const totalBenchmark = validRows.reduce((sum, item) => sum + item.benchmarkSeconds, 0);
      const bottleneckNode = [...validRows].sort((left, right) => right.avgDurationSeconds - left.avgDurationSeconds)[0];
      const abnormalOrderCount = rows.filter(row => row.abnormalNodeCount > 0).length;
      const completeOrderCount = rows.filter(row => row.completedNodeCount === (TIMELINESS_NODE_CONFIG[businessType] || []).length).length;
      return [
        {
          label: '平均全链路时效',
          value: rows.length ? formatDuration(totalAvgDuration) : '--',
          delta: rows.length ? `较工作台基线${formatDurationDelta(totalAvgDuration - totalBenchmark)}` : '--',
          tone: 'tone-blue',
          hint: rows.length ? `${businessType}命中${rows.length}条订单样本` : '当前筛选暂无命中订单'
        },
        {
          label: '完整流转订单',
          value: formatNumber(completeOrderCount),
          delta: rows.length ? `占样本${formatRatio(completeOrderCount / rows.length)}` : '--',
          tone: 'tone-green',
          hint: rows.length ? `完整走完${(TIMELINESS_NODE_CONFIG[businessType] || []).length}个节点的订单数` : '请调整筛选条件后重试'
        },
        {
          label: '最大卡点节点',
          value: bottleneckNode?.name || '--',
          delta: bottleneckNode ? `平均${formatDuration(bottleneckNode.avgDurationSeconds)}` : '--',
          tone: 'tone-orange',
          hint: bottleneckNode ? `命中${bottleneckNode.sampleCount}单，异常占比${formatRatio(bottleneckNode.abnormalRate)}` : '当前暂无节点样本'
        },
        {
          label: '异常订单占比',
          value: rows.length ? formatRatio(abnormalOrderCount / rows.length) : '--',
          delta: rows.length ? `${abnormalOrderCount}单` : '--',
          tone: 'tone-violet',
          hint: rows.length ? '至少存在1个异常节点的订单占比' : '当前暂无异常样本'
        }
      ];
    }
    function buildTimelinessDetailRows(nodeName, rows, dateKey = '') {
      return rows
        .map(row => {
          if (dateKey && row.time.slice(0, 10) !== dateKey) return null;
          const nodeRecord = row.nodeTimeline?.[nodeName];
          if (!nodeRecord) return null;
          return {
            ...row,
            nodeStartTime: nodeRecord.startTime,
            nodeEndTime: nodeRecord.endTime,
            nodeDuration: formatDuration(nodeRecord.durationSeconds),
            nodeDurationSeconds: nodeRecord.durationSeconds,
            nodeReason: nodeRecord.reason || '--'
          };
        })
        .filter(Boolean)
        .sort((left, right) => (right.nodeDurationSeconds - left.nodeDurationSeconds) || (getTimeValue(right.nodeEndTime) - getTimeValue(left.nodeEndTime)));
    }
    function buildTimelinessDetailSummary(detailRows, businessType, nodeName) {
      const nodeConfig = (TIMELINESS_NODE_CONFIG[businessType] || []).find(item => item.name === nodeName);
      const durations = detailRows.map(row => row.nodeDurationSeconds);
      const abnormalCount = detailRows.filter(row => row.nodeReason && row.nodeReason !== '--').length;
      return {
        benchmarkSeconds: nodeConfig?.baseTime || 0,
        avgDurationSeconds: durations.length ? Math.round(average(durations)) : 0,
        minDurationSeconds: durations.length ? Math.min(...durations) : 0,
        maxDurationSeconds: durations.length ? Math.max(...durations) : 0,
        abnormalCount
      };
    }
    function buildTimelinessVisualItems(summaryRows) {
      const validRows = summaryRows.filter(item => item.sampleCount);
      const totalDuration = validRows.reduce((sum, item) => sum + item.avgDurationSeconds, 0);
      return validRows.map((item, index) => ({
        label: item.name,
        value: formatDuration(item.avgDurationSeconds),
        hint: `命中${item.sampleCount}单｜异常${item.abnormalCount}单`,
        share: totalDuration ? item.avgDurationSeconds / totalDuration : 0,
        color: TIMELINESS_COLOR_PALETTE[index % TIMELINESS_COLOR_PALETTE.length]
      }));
    }
    function buildTimelinessAbnormalItems(summaryRows) {
      const validRows = summaryRows.filter(item => item.sampleCount);
      const totalAbnormal = validRows.reduce((sum, item) => sum + item.abnormalCount, 0);
      if (!validRows.length) return [];
      if (!totalAbnormal) {
        return validRows.map((item, index) => ({
          label: item.name,
          value: '0单',
          hint: '当前无异常节点',
          share: 1 / validRows.length,
          color: TIMELINESS_COLOR_PALETTE[index % TIMELINESS_COLOR_PALETTE.length]
        }));
      }
      return validRows.map((item, index) => ({
        label: item.name,
        value: item.abnormalCount ? `${item.abnormalCount}单` : '0单',
        hint: `异常占比${formatRatio(item.abnormalRate)}`,
        share: totalAbnormal ? item.abnormalCount / totalAbnormal : 0,
        color: TIMELINESS_COLOR_PALETTE[index % TIMELINESS_COLOR_PALETTE.length]
      }));
    }

    function statusClass(value) {
      if (['已签收', '已完成', '已闭环', '健康', '优秀', '已复核', '已发运', '已审核'].includes(value)) return 'badge-green';
      if (['运输中', '处理中', '审批中', '拣货中', '已发货', '已上线'].includes(value)) return 'badge-blue';
      if (['待装车', '待上架', '待复核', '待审批', '关注', '待收货', '待拣货', '待出库', '待审核', '未上线'].includes(value)) return 'badge-orange';
      if (['预警', '待确认', '异常', '已拒收', '上线异常', '停更', '丢件'].includes(value)) return 'badge-red';
      return 'badge-blue';
    }
    function tagClass(value) {
      const styles = ['badge-blue', 'badge-green', 'badge-orange', 'badge-red'];
      const score = Array.from(String(value)).reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return styles[score % styles.length];
    }
    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 2400);
    }
    function syncDateTriggerText() {
      const activeField = getCurrentDateField();
      const activeRange = getDateFieldRange(activeField);
      const trigger = document.getElementById('dateRangeTrigger');
      const text = document.getElementById('dateRangeText');
      const typeSelect = document.getElementById('dateTypeSelect');
      const combo = document.getElementById('dateRangeCombo');/*
      const startText = activeRange.start || '开始时间';
      const endText = activeRange.end || '结束时间';
      const rangeText = getDateRangeText(activeRange.start, activeRange.end, '请选择日期范围');
      */
      const startText = activeRange.start || '\u5f00\u59cb\u65f6\u95f4';
      const endText = activeRange.end || '\u7ed3\u675f\u65f6\u95f4';
      const rangeText = getDateRangeText(activeRange.start, activeRange.end, '\u8bf7\u9009\u62e9\u65e5\u671f\u8303\u56f4');
      if (typeSelect) typeSelect.value = activeField;
      if (combo) combo.classList.toggle('is-single', state.currentReport !== 'order');/*
      text.textContent = getDateRangeText(activeRange.start, activeRange.end, '请选择日期范围');
      */
      text.innerHTML = `<span class="date-range-trigger-text">${startText}</span><span class="date-range-trigger-separator">-</span><span class="date-range-trigger-text">${endText}</span>`;
      trigger.classList.toggle('is-empty', !(activeRange.start || activeRange.end));
      trigger.setAttribute('title', rangeText);
      trigger.setAttribute('aria-label', `${getDateFieldLabel(activeField)} ${rangeText}`);
      trigger.setAttribute('aria-expanded', String(state.datePicker.open));
    }
    function positionDatePickerPopover() {
      const popover = document.getElementById('dateRangePickerPopover');
      const filterPanel = document.querySelector('.filter-panel');
      const combo = document.getElementById('dateRangeCombo');
      if (!(popover && filterPanel && combo)) return;
      const panelRect = filterPanel.getBoundingClientRect();
      const comboRect = combo.getBoundingClientRect();
      const panelWidth = Math.max(320, panelRect.width - 24);
      const popoverWidth = Math.min(720, panelWidth);
      const rawLeft = comboRect.left - panelRect.left;
      const left = Math.max(0, Math.min(rawLeft, panelWidth - popoverWidth));
      const top = comboRect.bottom - panelRect.top + 10;
      popover.style.setProperty('--picker-left', `${left}px`);
      popover.style.setProperty('--picker-top', `${top}px`);
    }
    function renderDatePickerGrid(elementId, monthText) {
      const monthDate = parseDateOnly(monthText) || getMonthStart(ANCHOR_DATE);
      const cells = buildCalendarCells(monthText, state.datePicker.draftStart, state.datePicker.draftEnd);
      document.getElementById(elementId).innerHTML = cells.map(cell => {
        const classes = [
          'date-picker-cell',
          cell.inRange ? 'is-in-range' : '',
          cell.isStart ? 'is-range-start' : '',
          cell.isEnd ? 'is-range-end' : ''
        ].filter(Boolean).join(' ');
        const dayClasses = [
          'date-picker-day',
          !cell.inMonth ? 'is-muted' : '',
          cell.isToday ? 'is-today' : '',
          cell.isStart || cell.isEnd ? 'is-selected' : ''
        ].filter(Boolean).join(' ');
        return `<div class="${classes}"><button type="button" class="${dayClasses}" data-date-cell="${cell.text}" data-date-month="${formatDateOnly(monthDate)}">${cell.day}</button></div>`;
      }).join('');
    }
    function renderDatePicker() {
      syncDateTriggerText();
      const popover = document.getElementById('dateRangePickerPopover');
      if (!state.datePicker.open) {
        popover.classList.add('hidden');
        popover.setAttribute('aria-hidden', 'true');
        return;
      }
      const title = document.getElementById('datePickerTitle');
      const rangeText = document.getElementById('datePickerRangeText');
      const shortcutList = document.getElementById('datePickerShortcutList');
      const baseMonth = parseDateOnly(state.datePicker.panelMonth) || getMonthStart(ANCHOR_DATE);
      const nextMonth = addMonths(baseMonth, 1);
      const activeShortcut = getMatchedDateShortcut(state.datePicker.draftStart, state.datePicker.draftEnd);
      title.textContent = `选择${getDateFieldLabel()}`;
      rangeText.textContent = getDateRangeText(state.datePicker.draftStart, state.datePicker.draftEnd, '请选择开始日期和结束日期');
      shortcutList.innerHTML = DATE_PICKER_SHORTCUTS.map(item => `<button type="button" class="date-picker-shortcut ${activeShortcut === item.key ? 'is-active' : ''}" data-date-shortcut="${item.key}">${item.label}</button>`).join('');
      document.getElementById('datePickerMonthLabelA').textContent = formatMonthLabel(baseMonth);
      document.getElementById('datePickerMonthLabelB').textContent = formatMonthLabel(nextMonth);
      renderDatePickerGrid('datePickerGridA', formatDateOnly(baseMonth));
      renderDatePickerGrid('datePickerGridB', formatDateOnly(nextMonth));
      popover.classList.remove('hidden');
      popover.setAttribute('aria-hidden', 'false');
      positionDatePickerPopover();
    }
    function openDatePicker(field = getCurrentDateField()) {
      const range = getDateFieldRange(field);
      state.datePicker.open = true;
      state.datePicker.field = field;
      state.datePicker.draftStart = range.start;
      state.datePicker.draftEnd = range.end;
      state.datePicker.panelMonth = getDatePickerBaseMonth(range.start, range.end);
      renderDatePicker();
    }
    function closeDatePicker() {
      state.datePicker.open = false;
      renderDatePicker();
    }
    function shiftDatePickerMonth(offset) {
      const monthDate = parseDateOnly(state.datePicker.panelMonth) || getMonthStart(ANCHOR_DATE);
      state.datePicker.panelMonth = formatDateOnly(addMonths(monthDate, offset));
      renderDatePicker();
    }
    function applyDateShortcut(shortcutKey) {
      const range = buildDateShortcutRange(shortcutKey);
      state.datePicker.draftStart = range.start;
      state.datePicker.draftEnd = range.end;
      state.datePicker.panelMonth = getDatePickerBaseMonth(range.start, range.end);
      renderDatePicker();
    }
    function pickDateRangeValue(dateText) {
      const { draftStart, draftEnd } = state.datePicker;
      if (!draftStart || (draftStart && draftEnd)) {
        state.datePicker.draftStart = dateText;
        state.datePicker.draftEnd = '';
      } else if (dateText < draftStart) {
        state.datePicker.draftStart = dateText;
        state.datePicker.draftEnd = draftStart;
      } else {
        state.datePicker.draftEnd = dateText;
      }
      renderDatePicker();
    }
    function clearDatePicker() {
      state.datePicker.draftStart = '';
      state.datePicker.draftEnd = '';
      renderDatePicker();
    }
    function confirmDatePicker() {
      let { draftStart, draftEnd, field } = state.datePicker;
      if (!draftStart && !draftEnd) {
        setDateFieldRange(field, '', '');
        closeDatePicker();
        return;
      }
      if (draftStart && !draftEnd) draftEnd = draftStart;
      if (!draftStart && draftEnd) draftStart = draftEnd;
      if (draftStart > draftEnd) [draftStart, draftEnd] = [draftEnd, draftStart];
      setDateFieldRange(field, draftStart, draftEnd);
      closeDatePicker();
      renderFilters();
    }
    function renderReportMenu() {
      document.getElementById('reportMenu').innerHTML = REPORT_ORDER.map((key, index) => {
        const report = reportDefinitions[key];
        const starred = STARRED_REPORTS.has(key);
        return `<button type="button" class="menu-item ${state.currentReport === key ? 'active' : ''}" data-report="${key}"><span class="menu-serial">${pad(index + 1)}</span><span class="menu-text"><span class="menu-label">${report.tabLabel}报表</span></span><span class="menu-star ${starred ? 'is-active' : ''}" aria-hidden="true"><i class="${starred ? 'ri-star-fill' : 'ri-star-line'}"></i></span></button>`;
      }).join('');
    }
    function renderFilters() {
      const report = reportDefinitions[state.currentReport];
      const availableBusinessTypes = getReportBusinessTypeOptions(state.currentReport);
      const isOrderScope = isOrderReport();
      const isTimelinessReport = state.currentReport === 'timeliness';
      const currentTimelinessBusinessType = getCurrentTimelinessBusinessType(state.filters.businessTypes);
      const filterAOptions = isTimelinessReport ? getTimelinessNodeOptions(currentTimelinessBusinessType) : report.filterA.options;
      document.getElementById('primaryDateLabel').innerHTML = isOrderScope ? '时间筛选<span class="required">*</span>' : '时间范围<span class="required">*</span>';
      document.getElementById('shipDateFilterItem').classList.add('hidden');
      document.getElementById('genericFilterAItem').classList.toggle('hidden', isOrderScope);
      document.getElementById('genericFilterBItem').classList.toggle('hidden', isOrderScope);
      document.getElementById('orderStageFilterItem').classList.toggle('hidden', !isOrderScope);
      document.getElementById('trackStatusFilterItem').classList.toggle('hidden', !isOrderScope);
      document.getElementById('filterALabel').textContent = report.filterA.label;
      document.getElementById('filterBLabel').textContent = report.filterB.label;
      document.getElementById('customer').innerHTML = `<option value="">全部客户/货主</option>${COMMON_CUSTOMERS.map(item => `<option value="${item}">${item}</option>`).join('')}`;
      document.getElementById('businessTypeList').innerHTML = availableBusinessTypes.map(item => `<label class="multi-select-option"><input class="business-type-checkbox" type="checkbox" value="${item}"><span>${item}</span></label>`).join('');
      if (isOrderScope) {
        document.getElementById('orderStageList').innerHTML = ORDER_STAGE_OPTIONS.map(item => `<label class="multi-select-option"><input class="order-stage-checkbox" type="checkbox" value="${item}"><span>${item}</span></label>`).join('');
        document.getElementById('trackStatusList').innerHTML = TRACK_STATUS_OPTIONS.map(item => `<label class="multi-select-option"><input class="track-status-checkbox" type="checkbox" value="${item}"><span>${item}</span></label>`).join('');
      } else {
        document.getElementById('filterA').innerHTML = `<option value="">全部${report.filterA.label}</option>${filterAOptions.map(item => `<option value="${item}">${item}</option>`).join('')}`;
        document.getElementById('filterB').innerHTML = `<option value="">全部${report.filterB.label}</option>${report.filterB.options.map(item => `<option value="${item}">${item}</option>`).join('')}`;
      }
      document.getElementById('customer').value = state.filters.customer;
      if (!isOrderScope) {
        document.getElementById('filterA').value = state.filters.filterA;
        document.getElementById('filterB').value = state.filters.filterB;
      }
      syncHeaderWarehouseSelection(state.filters.selectedWarehouses);
      syncBusinessTypeSelection(getCurrentTypeFilters(state.currentReport));
      document.getElementById('dateTypeSelect').parentElement.classList.toggle('is-single', !isOrderScope);
      document.getElementById('dateTypeSelect').disabled = !isOrderScope;
      if (isOrderScope) {
        syncOrderStageSelection(state.filters.orderStages);
        syncTrackStatusSelection(state.filters.trackStatuses);
      }
      if (isTimelinessReport) refreshTimelinessNodeFilterOptions(state.filters.businessTypes);
      closeBusinessTypeDropdown();
      closeOrderStageDropdown();
      closeTrackStatusDropdown();
      syncDateTriggerText();
    }
    function renderStats() {
      const report = reportDefinitions[state.currentReport];
      const items = state.currentReport === 'timeliness' ? buildTimelinessStats(getFilteredRows()) : report.stats;
      document.getElementById('statCards').innerHTML = items.map(item => `<div class="stat-card ${item.tone}"><div class="stat-card-head"><span class="stat-dot"></span><span class="stat-label">${item.label}</span></div><div class="stat-value">${item.value}</div><div class="stat-delta">${item.delta}</div><div class="stat-hint">${item.hint}</div></div>`).join('');
    }
    function renderTimelinessOverview() {
      const section = document.getElementById('timelinessOverviewSection');
      if (!section) return;
      const isVisible = state.currentReport === 'timeliness';
      section.classList.toggle('hidden', !isVisible);
      if (!isVisible) return;

      const filteredRows = getFilteredRows();
      const businessType = getCurrentTimelinessBusinessType(state.filters.businessTypes);
      const summaryRows = buildTimelinessNodeSummary(filteredRows, businessType);
      const validRows = summaryRows.filter(item => item.sampleCount);
      const completeOrderCount = filteredRows.filter(row => row.completedNodeCount === (TIMELINESS_NODE_CONFIG[businessType] || []).length).length;
      const totalAvgDuration = validRows.reduce((sum, item) => sum + item.avgDurationSeconds, 0);
      const bottleneckNode = [...validRows].sort((left, right) => right.avgDurationSeconds - left.avgDurationSeconds)[0];

      document.getElementById('timelinessOverviewDesc').textContent = filteredRows.length
        ? `当前按${businessType}业务展示${summaryRows.length}个节点的时效结果，点击节点平均时效可查看命中订单的开始时间、结束时间和节点时长。`
        : `当前筛选条件下没有命中${businessType}业务的时效订单，请调整仓库、时间或订单状态后重试。`;
      document.getElementById('timelinessSummaryChips').innerHTML = [
        `业务类型:${businessType}`,
        `样本订单:${formatNumber(filteredRows.length)}`,
        `完整流转:${filteredRows.length ? formatRatio(completeOrderCount / filteredRows.length) : '--'}`,
        bottleneckNode ? `主要卡点:${bottleneckNode.name}` : '主要卡点:--',
        validRows.length ? `平均全链路:${formatDuration(totalAvgDuration)}` : '平均全链路:--'
      ].map(text => `<span class="toolbar-tag">${text}</span>`).join('');

      const track = document.getElementById('timelinessStageTrack');
      if (!filteredRows.length || !summaryRows.length) {
        track.innerHTML = `<div class="timeliness-stage-empty">暂无可展示的节点时效，请调整查询条件后重新查询。</div>`;
        return;
      }

      track.innerHTML = summaryRows.map((item, index) => `
        <div class="timeliness-stage-item">
          <div class="timeliness-stage-card ${state.filters.filterA === item.name ? 'active' : ''} ${item.sampleCount ? '' : 'empty'}">
            <div class="timeliness-stage-head">
              <div>
                <div class="timeliness-stage-name">${item.name}</div>
                <div class="timeliness-stage-sub">工作台基线:${formatDuration(item.benchmarkSeconds)}</div>
              </div>
              <span class="timeliness-stage-index">${pad(index + 1)}</span>
            </div>
            <button type="button" class="timeliness-stage-value" data-timeliness-node-trigger="${item.name}" ${item.sampleCount ? '' : 'disabled'}>
              <div class="timeliness-stage-metric">${item.sampleCount ? formatDuration(item.avgDurationSeconds) : '--'}</div>
              <div class="timeliness-stage-hint">${item.sampleCount ? `较基线${formatDurationDelta(item.deltaSeconds)}` : '当前暂无完成该节点的样本'}</div>
            </button>
            <div class="timeliness-stage-meta">
              <div class="timeliness-stage-meta-item">
                <div class="timeliness-stage-meta-label">命中订单数</div>
                <div class="timeliness-stage-meta-value">${formatNumber(item.sampleCount)}</div>
              </div>
              <div class="timeliness-stage-meta-item">
                <div class="timeliness-stage-meta-label">节点完成率</div>
                <div class="timeliness-stage-meta-value">${item.sampleCount ? formatRatio(item.completionRate) : '--'}</div>
              </div>
              <div class="timeliness-stage-meta-item">
                <div class="timeliness-stage-meta-label">异常节点数</div>
                <div class="timeliness-stage-meta-value">${item.sampleCount ? `${item.abnormalCount}单` : '--'}</div>
              </div>
              <div class="timeliness-stage-meta-item">
                <div class="timeliness-stage-meta-label">最近节点结束</div>
                <div class="timeliness-stage-meta-value">${item.sampleCount ? item.latestEndTime.slice(5, 16) : '--'}</div>
              </div>
            </div>
          </div>
          ${index < summaryRows.length - 1 ? `<div class="timeliness-stage-arrow"><i class="ri-arrow-right-line"></i></div>` : ''}
        </div>
      `).join('');
    }
    function buildTrendChart(report) {
      const type = report.trend.type;
      return {
        type,
        data: {
          labels: report.trend.labels,
          datasets: report.trend.datasets.map(dataset => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.color,
            backgroundColor: type === 'line' ? hexToRgba(dataset.color, 0.12) : hexToRgba(dataset.color, 0.86),
            tension: 0.35,
            fill: type === 'line',
            borderWidth: 2,
            pointRadius: type === 'line' ? 3 : 0,
            pointHoverRadius: type === 'line' ? 4 : 0,
            borderRadius: type === 'bar' ? 10 : 0,
            maxBarThickness: type === 'bar' ? 24 : undefined
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { usePointStyle: true, color: '#627388' } } },
          scales: {
            y: { beginAtZero: !report.trend.yRange, min: report.trend.yRange ? report.trend.yRange.min : undefined, max: report.trend.yRange ? report.trend.yRange.max : undefined, grid: { color: 'rgba(219, 228, 239, 0.8)' }, ticks: { color: '#627388' } },
            x: { grid: { display: false }, ticks: { color: '#627388' } }
          }
        }
      };
    }
    function buildStructureChart(report) {
      const palette = ['#4d77ea', '#2eb67d', '#f59e0b', '#7d67ff'];
      if (report.structure.type === 'bar') {
        return {
          type: 'bar',
          data: { labels: report.structure.labels, datasets: [{ label: report.structure.title, data: report.structure.values, backgroundColor: report.structure.labels.map((_, index) => hexToRgba(palette[index % palette.length], 0.88)), borderRadius: 10, maxBarThickness: 34 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 90, max: 100, grid: { color: 'rgba(219, 228, 239, 0.8)' }, ticks: { color: '#627388' } }, x: { grid: { display: false }, ticks: { color: '#627388' } } } }
        };
      }
      return {
        type: 'doughnut',
        data: { labels: report.structure.labels, datasets: [{ data: report.structure.values, backgroundColor: report.structure.labels.map((_, index) => palette[index % palette.length]), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, color: '#627388', padding: 16 } } } }
      };
    }
    function buildTrendSpotlights(report, rows) {
      const primaryDataset = report.trend.datasets[0] || { data: [], label: report.valueHeader };
      const values = primaryDataset.data || [];
      const firstValue = values[0] ?? 0;
      const lastValue = values[values.length - 1] ?? 0;
      const peakValue = values.length ? Math.max(...values) : 0;
      const peakIndex = values.indexOf(peakValue);
      const peakLabel = peakIndex >= 0 ? report.trend.labels[peakIndex] : '--';
      const changeRatio = firstValue ? (lastValue - firstValue) / firstValue : 0;
      const directionText = changeRatio > 0.03 ? '持续上扬' : changeRatio < -0.03 ? '逐步回落' : '相对平稳';
      const sampleRows = rows.length ? rows : report.rows;
      const warehouseDistribution = buildDistribution(sampleRows, 'warehouse');
      const dominantWarehouse = warehouseDistribution[0];
      const followUpCount = sampleRows.filter(row => getStatusBucket(row.status) !== 'success').length;
      const followRate = sampleRows.length ? followUpCount / sampleRows.length : 0;
      return [
        { label: '趋势斜率', value: formatRatio(Math.abs(changeRatio)), hint: `${primaryDataset.label}${changeRatio >= 0 ? '较期初抬升' : '较期初回落'}，当前节奏${directionText}`, toneClass: changeRatio >= 0 ? 'text-brand' : 'text-warning' },
        { label: '峰值节点', value: peakLabel, hint: `${primaryDataset.label}峰值${formatMetricValue(peakValue, report, { digits: report.rowsConfig.mode === 'percent' ? 1 : 0 })}`, toneClass: 'text-success' },
        { label: '样本集中仓', value: dominantWarehouse?.name || '--', hint: dominantWarehouse ? `占比${formatRatio(dominantWarehouse.share)}，待跟进占比${formatRatio(followRate)}` : '当前暂无仓库分布样本', toneClass: 'text-violet' }
      ];
    }
    function buildWarehouseMixChart(rows) {
      const sampleRows = rows.length ? rows : reportDefinitions[state.currentReport].rows;
      const distribution = buildDistribution(sampleRows, 'warehouse').slice(0, 3);
      return { type: 'bar', data: { labels: distribution.map(item => item.name), datasets: [{ data: distribution.map(item => item.count), backgroundColor: ['#4d77ea', '#2eb67d', '#7d67ff'], borderRadius: 999, barThickness: 14 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.raw}条样本` } } }, scales: { x: { beginAtZero: true, grid: { color: 'rgba(219, 228, 239, 0.8)' }, ticks: { color: '#627388', precision: 0 } }, y: { grid: { display: false }, ticks: { color: '#627388' } } } } };
    }
    function buildStatusSignalChart(rows) {
      const sampleRows = rows.length ? rows : reportDefinitions[state.currentReport].rows;
      const distribution = buildDistribution(sampleRows, 'status').slice(0, 4);
      return { type: 'polarArea', data: { labels: distribution.map(item => item.name), datasets: [{ data: distribution.map(item => item.count), backgroundColor: ['rgba(77, 119, 234, 0.76)', 'rgba(46, 182, 125, 0.72)', 'rgba(245, 158, 11, 0.74)', 'rgba(255, 90, 95, 0.76)'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.label}:${context.raw}条` } } }, scales: { r: { grid: { color: 'rgba(219, 228, 239, 0.8)' }, angleLines: { color: 'rgba(219, 228, 239, 0.8)' }, ticks: { display: false }, pointLabels: { color: '#627388', font: { size: 11 } } } } } };
    }
    function renderCharts() {
      const report = reportDefinitions[state.currentReport];
      const filteredRows = getFilteredRows();
      const useFallbackRows = !filteredRows.length;
      document.getElementById('trendTitle').textContent = report.trend.title;
      document.getElementById('structureTitle').textContent = report.structure.title;
      document.getElementById('trendChartHint').textContent = useFallbackRows ? '当前筛选未命中样本，趋势区回退展示默认样本口径。' : `已读取${filteredRows.length}条样本，主图展示最近18天整体变化。`;
      document.getElementById('trendSpotlightCards').innerHTML = buildTrendSpotlights(report, filteredRows).map(item => `<div class="trend-spotlight-card"><div class="spotlight-label">${item.label}</div><div class="spotlight-value ${item.toneClass}">${item.value}</div><div class="spotlight-hint">${item.hint}</div></div>`).join('');
      if (charts.trend) charts.trend.destroy();
      if (charts.structure) charts.structure.destroy();
      if (charts.warehouseMix) charts.warehouseMix.destroy();
      if (charts.statusSignal) charts.statusSignal.destroy();
      charts.trend = new Chart(document.getElementById('trendChart').getContext('2d'), buildTrendChart(report));
      charts.structure = new Chart(document.getElementById('structureChart').getContext('2d'), buildStructureChart(report));
      charts.warehouseMix = new Chart(document.getElementById('warehouseMixChart').getContext('2d'), buildWarehouseMixChart(filteredRows));
      charts.statusSignal = new Chart(document.getElementById('statusSignalChart').getContext('2d'), buildStatusSignalChart(filteredRows));
    }
    function renderInsights() {
      const report = reportDefinitions[state.currentReport];
      document.getElementById('insightList').innerHTML = report.insights.map((text, index) => `<div class="insight-card"><div class="insight-index">关注点${index + 1}</div><div class="insight-text">${text}</div></div>`).join('');
    }
    function collectFilters() {
      const orderScope = isOrderReport();
      if (orderScope) {
        state.filters.dateType = document.getElementById('dateTypeSelect').value || 'primary';
      }
      if (!orderScope) {
        state.filters.shipStartDate = '';
        state.filters.shipEndDate = '';
      }
      const activeDateField = orderScope ? state.filters.dateType : 'primary';
      const activeDateRange = getDateFieldRange(activeDateField);
      if (!activeDateRange.start || !activeDateRange.end) {
        showToast(`请选择${getDateFieldLabel(activeDateField)}`, 'warning');
        return false;
      }
      state.filters.customer = document.getElementById('customer').value;
      state.filters.filterA = orderScope ? '' : document.getElementById('filterA').value;
      state.filters.filterB = orderScope ? '' : document.getElementById('filterB').value;
      state.filters.keyword = '';
      const selectedBusinessTypes = getSelectedBusinessTypes();
      if (!selectedBusinessTypes.length) {
        showToast(`请至少选择1个${orderScope ? '订单类型' : '业务类型'}`, 'warning');
        return false;
      }
      if (isSingleBusinessTypeReport(state.currentReport) && selectedBusinessTypes.length !== 1) {
        showToast('时效报表仅支持选择1个业务类型', 'warning');
        return false;
      }
      if (orderScope) {
        state.filters.orderTypes = [...selectedBusinessTypes];
        state.filters.orderStages = getSelectedOrderStages();
        state.filters.trackStatuses = getSelectedTrackStatuses();
        if (!state.filters.orderStages.length) {
          showToast('请至少选择1个订单阶段', 'warning');
          return false;
        }
        if (!state.filters.trackStatuses.length) {
          showToast('请至少选择1个轨迹状态', 'warning');
          return false;
        }
      } else {
        state.filters.businessTypes = [...selectedBusinessTypes];
      }
      const selectedWarehouses = getSelectedHeaderWarehouses();
      if (!selectedWarehouses.length) {
        showToast('请至少选择1个仓库', 'warning');
        return false;
      }
      state.filters.selectedWarehouses = [...selectedWarehouses];
      syncHeaderWarehouseSelection(state.filters.selectedWarehouses);
      syncBusinessTypeSelection(getCurrentTypeFilters(state.currentReport));
      if (orderScope) {
        syncOrderStageSelection(state.filters.orderStages);
        syncTrackStatusSelection(state.filters.trackStatuses);
      }
      return true;
    }
    function getFilteredRows() {
      const report = reportDefinitions[state.currentReport];
      const orderScope = isOrderReport();
      const selectedWarehouses = state.filters.selectedWarehouses.length ? state.filters.selectedWarehouses : COMMON_WAREHOUSES;
      const selectedBusinessTypes = getActiveBusinessTypes(getCurrentTypeFilters(state.currentReport), state.currentReport);
      const activeDateField = orderScope ? getCurrentDateField() : 'primary';
      return report.rows.filter(row => {
        const orderDate = (row.orderTime || row.time).slice(0, 10);
        const shipDate = row.shipTime ? row.shipTime.slice(0, 10) : '';
        const matchPrimaryDate = (!state.filters.startDate || orderDate >= state.filters.startDate) && (!state.filters.endDate || orderDate <= state.filters.endDate);
        const matchShipDate = (!state.filters.shipStartDate || shipDate >= state.filters.shipStartDate) && (!state.filters.shipEndDate || shipDate <= state.filters.shipEndDate);
        const matchDate = orderScope
          ? (activeDateField === 'ship' ? (Boolean(shipDate) && matchShipDate) : matchPrimaryDate)
          : matchPrimaryDate;
        const matchWarehouse = selectedWarehouses.includes(row.warehouse);
        const matchBusinessType = orderScope ? selectedBusinessTypes.includes(row.orderType) : selectedBusinessTypes.includes(row.businessType);
        const matchCustomer = !state.filters.customer || row.customer === state.filters.customer;
        if (orderScope) {
          const orderStages = state.filters.orderStages.length ? state.filters.orderStages : ORDER_STAGE_OPTIONS;
          const trackStatuses = state.filters.trackStatuses.length ? state.filters.trackStatuses : TRACK_STATUS_OPTIONS;
          const trackFilterUsesAll = trackStatuses.length === TRACK_STATUS_OPTIONS.length;
          const matchOrderStage = orderStages.includes(row.orderStage);
          const matchTrackStatus = row.trackStatus ? trackStatuses.includes(row.trackStatus) : trackFilterUsesAll;
          const keyword = state.filters.keyword.toLowerCase();
          const matchKeyword = !keyword || Object.values(row).some(value => String(value).toLowerCase().includes(keyword));
          return matchDate && matchWarehouse && matchBusinessType && matchCustomer && matchOrderStage && matchTrackStatus && matchKeyword;
        }
        const matchTag = !state.filters.filterA
          || (state.currentReport === 'timeliness'
            ? Boolean(row.nodeTimeline?.[state.filters.filterA])
            : row.tag === state.filters.filterA);
        const matchStatus = !state.filters.filterB || row.status === state.filters.filterB;
        const keyword = state.filters.keyword.toLowerCase();
        const matchKeyword = !keyword || Object.values(row).some(value => String(value).toLowerCase().includes(keyword));
        return matchDate && matchWarehouse && matchBusinessType && matchCustomer && matchTag && matchStatus && matchKeyword;
      });
    }
    function renderOrderTableHeader(fields) {
      const layout = getPinnedFieldLayout(fields);
      document.getElementById('tableHead').innerHTML = `<tr>${fields.map(field => {
        const attrs = buildTableCellAttrs(field, layout, 'th');
        return `<th class="${attrs.className}" style="${attrs.styleText}">${field.label}</th>`;
      }).join('')}</tr>`;
      document.getElementById('detailTable').style.minWidth = `${Math.max(980, fields.reduce((sum, field) => sum + (field.width || 132), 0))}px`;
    }
    function renderOrderTable(pageRows, fields) {
      const layout = getPinnedFieldLayout(fields);
      renderOrderTableHeader(fields);
      document.getElementById('tableBody').innerHTML = pageRows.length ? pageRows.map(row => `<tr>${fields.map(field => {
        const definition = ORDER_FIELD_DEFINITIONS[field.key];
        const attrs = buildTableCellAttrs(field, layout, 'td');
        if (field.key === 'itemQty') {
          return `<td class="${attrs.className} cell-right" style="${attrs.styleText}">${row.itemQty ? `<button type="button" class="table-link-btn" data-product-detail="${row.orderNo}">${formatNumber(row.itemQty)}</button>` : '--'}</td>`;
        }
        const content = definition.getValue(row);
        return `<td class="${attrs.className}" style="${attrs.styleText}">${definition.html ? content : content ?? '--'}</td>`;
      }).join('')}</tr>`).join('') : `<tr class="empty-row"><td colspan="${fields.length}">暂无匹配数据，请调整查询条件后重试</td></tr>`;
    }
    function renderGenericTable(pageRows, fields, report) {
      const layout = getPinnedFieldLayout(fields);
      document.getElementById('tableHead').innerHTML = `<tr>${fields.map(field => {
        const attrs = buildTableCellAttrs(field, layout, 'th');
        return `<th class="${attrs.className}" style="${attrs.styleText}">${field.label}</th>`;
      }).join('')}</tr>`;
      document.getElementById('detailTable').style.minWidth = `${Math.max(980, fields.reduce((sum, field) => sum + (field.width || 142), 0))}px`;
      document.getElementById('tableBody').innerHTML = pageRows.length ? pageRows.map(row => `<tr>${fields.map(field => {
        const definition = GENERIC_TABLE_FIELD_DEFINITIONS[field.key];
        const content = definition.getValue(row, report);
        const attrs = buildTableCellAttrs(field, layout, 'td');
        return `<td class="${attrs.className}" style="${attrs.styleText}">${definition.html ? content : content ?? '--'}</td>`;
      }).join('')}</tr>`).join('') : `<tr class="empty-row"><td colspan="${fields.length}">暂无匹配数据，请调整查询条件后重试</td></tr>`;
    }
    function renderTimelinessTable(filteredRows, selectedBusinessTypes, report) {
      const businessType = getCurrentTimelinessBusinessType(selectedBusinessTypes);
      const fields = getVisibleConfiguredTableFields('timeliness', selectedBusinessTypes);
      const dailyRows = buildTimelinessDailyRows(filteredRows, businessType);
      const maxPage = Math.max(1, Math.ceil(dailyRows.length / state.pagination.pageSize));
      if (state.pagination.currentPage > maxPage) state.pagination.currentPage = maxPage;
      const start = (state.pagination.currentPage - 1) * state.pagination.pageSize;
      const pageRows = dailyRows.slice(start, start + state.pagination.pageSize);

      document.getElementById('tableTitle').textContent = '每日节点时效明细';
      document.getElementById('tableToolbar').innerHTML = [
        ...report.toolbar,
        '按统计日期倒序',
        `当前仓库:${state.filters.selectedWarehouses.length === COMMON_WAREHOUSES.length ? '全部仓库' : state.filters.selectedWarehouses.join('、')}`,
        `业务类型:${businessType}`,
        `订单状态:${state.filters.filterB || '全部订单状态'}`,
        `关注节点:${state.filters.filterA || '全部关注节点'}`
      ].map(text => `<span class="toolbar-tag">${text}</span>`).join('');

      const layout = getPinnedFieldLayout(fields);
      document.getElementById('tableHead').innerHTML = `<tr>${fields.map(field => {
        const attrs = buildTableCellAttrs(field, layout, 'th');
        const content = field.key.startsWith('node:')
          ? `${field.label}<div class="timeliness-metric-sub" style="margin-top:4px;">基线${formatDuration(field.benchmarkSeconds)}</div>`
          : field.label;
        return `<th class="${attrs.className}" style="${attrs.styleText}">${content}</th>`;
      }).join('')}</tr>`;
      document.getElementById('detailTable').style.minWidth = `${Math.max(980, fields.reduce((sum, field) => sum + (field.width || 148), 0))}px`;
      document.getElementById('tableBody').innerHTML = pageRows.length ? pageRows.map(row => `<tr>${fields.map(field => {
        const attrs = buildTableCellAttrs(field, layout, 'td');
        if (field.key === 'date') return `<td class="${attrs.className}" style="${attrs.styleText}">${row.date}</td>`;
        if (field.key === 'orderCount') return `<td class="${attrs.className}" style="${attrs.styleText}">${formatNumber(row.orderCount)}</td>`;
        if (field.key === 'avgTotalDuration') return `<td class="${attrs.className}" style="${attrs.styleText}">${row.orderCount ? formatDuration(row.avgTotalDurationSeconds) : '--'}</td>`;
        if (field.key === 'bottleneckNode') return `<td class="${attrs.className}" style="${attrs.styleText}">${row.bottleneckNode}</td>`;
        const nodeName = field.key.replace('node:', '');
        const nodeStat = row.nodeStats[nodeName];
        const isFocused = state.filters.filterA === nodeName;
        return `<td class="${attrs.className} ${isFocused ? 'bg-[#f4f8ff]' : ''}" style="${attrs.styleText}">
          <button type="button" class="timeliness-metric-btn" data-timeliness-node-trigger="${nodeName}" data-timeliness-date-trigger="${row.date}" ${nodeStat?.sampleCount ? '' : 'disabled'}>
            <span class="timeliness-metric-main">${nodeStat?.sampleCount ? formatDuration(nodeStat.avgDurationSeconds) : '--'}</span>
            <span class="timeliness-metric-sub">${nodeStat?.sampleCount ? `样本${nodeStat.sampleCount}单` : '无样本'}</span>
          </button>
        </td>`;
      }).join('')}</tr>`).join('') : `<tr class="empty-row"><td colspan="${fields.length}">暂无匹配数据，请调整查询条件后重试</td></tr>`;
      renderPagination(dailyRows.length);
      return {
        total: dailyRows.length,
        start: dailyRows.length ? start + 1 : 0,
        end: dailyRows.length ? Math.min(start + state.pagination.pageSize, dailyRows.length) : 0
      };
    }
    function closeTimelinessDetailModal() {
      state.timeliness.detailOpen = false;
      state.timeliness.detailNode = '';
      state.timeliness.detailRows = [];
      state.timeliness.detailBusinessType = '';
      state.timeliness.detailDate = '';
      document.getElementById('timelinessDetailModal').classList.add('hidden');
    }
    function renderTimelinessDetailModal() {
      const modal = document.getElementById('timelinessDetailModal');
      if (!state.timeliness.detailOpen) {
        modal.classList.add('hidden');
        return;
      }

      const businessType = state.timeliness.detailBusinessType || getCurrentTimelinessBusinessType();
      const detailRows = state.timeliness.detailRows || [];
      const detailDate = state.timeliness.detailDate || '';
      const nodeSummary = buildTimelinessDetailSummary(detailRows, businessType, state.timeliness.detailNode);
      const baseFields = getOrderVisibleFields([businessType]);
      const extraFields = [
        { key: 'nodeStartTime', label: '节点开始时间' },
        { key: 'nodeEndTime', label: '节点结束时间' },
        { key: 'nodeDuration', label: '节点时长', align: 'right' },
        { key: 'nodeReason', label: '异常说明' }
      ];

      document.getElementById('timelinessDetailTitle').textContent = `${state.timeliness.detailNode}节点订单明细`;
      document.getElementById('timelinessDetailScope').textContent = detailDate
        ? `当前按${businessType}业务展示${detailDate}统计日内${state.timeliness.detailNode}节点平均时效的组成订单，字段口径复用订单统计报表，并补充节点开始时间、结束时间与节点时长。`
        : `当前按${businessType}业务展示命中订单明细，字段口径复用订单统计报表，并补充节点开始时间、结束时间与节点时长。`;
      document.getElementById('timelinessDetailBusinessTag').textContent = `业务类型:${businessType}`;
      document.getElementById('timelinessDetailStats').innerHTML = [
        { label: '统计日期', value: detailDate || '全部日期' },
        { label: '命中订单数', value: formatNumber(detailRows.length) },
        { label: '平均时效', value: detailRows.length ? formatDuration(nodeSummary.avgDurationSeconds) : '--' },
        { label: '工作台基线', value: nodeSummary.benchmarkSeconds ? formatDuration(nodeSummary.benchmarkSeconds) : '--' }
      ].map(item => `<div class="timeliness-detail-stat"><div class="timeliness-detail-stat-label">${item.label}</div><div class="timeliness-detail-stat-value">${item.value}</div></div>`).join('');
      document.getElementById('timelinessDetailHead').innerHTML = `<tr>${baseFields.map(fieldKey => {
        const field = ORDER_FIELD_DEFINITIONS[fieldKey];
        return `<th class="${field.align === 'right' ? 'cell-right' : ''}">${field.label}</th>`;
      }).join('')}${extraFields.map(field => `<th class="${field.align === 'right' ? 'cell-right' : ''}">${field.label}</th>`).join('')}</tr>`;
      document.getElementById('timelinessDetailBody').innerHTML = detailRows.length ? detailRows.map(row => `<tr>${baseFields.map(fieldKey => {
        const field = ORDER_FIELD_DEFINITIONS[fieldKey];
        const content = field.getValue(row);
        return `<td class="${field.align === 'right' ? 'cell-right' : ''}">${field.html ? content : content ?? '--'}</td>`;
      }).join('')}${extraFields.map(field => `<td class="${field.align === 'right' ? 'cell-right' : ''}">${row[field.key] ?? '--'}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${baseFields.length + extraFields.length}" class="timeliness-detail-empty">当前节点暂无命中订单。</td></tr>`;
      modal.classList.remove('hidden');
    }
    function openTimelinessDetailModal(nodeName, dateKey = '') {
      if (state.currentReport !== 'timeliness') return;
      const filteredRows = getFilteredRows();
      const detailRows = buildTimelinessDetailRows(nodeName, filteredRows, dateKey);
      if (!detailRows.length) {
        showToast(`${dateKey ? `${dateKey}的` : ''}${nodeName}当前暂无可查看的订单样本`, 'warning');
        return;
      }
      state.timeliness.detailOpen = true;
      state.timeliness.detailNode = nodeName;
      state.timeliness.detailRows = detailRows;
      state.timeliness.detailBusinessType = getCurrentTimelinessBusinessType(state.filters.businessTypes);
      state.timeliness.detailDate = dateKey;
      renderTimelinessDetailModal();
    }
    function closeProductDetailModal() {
      state.productDetail.open = false;
      state.productDetail.row = null;
      document.getElementById('productDetailModal').classList.add('hidden');
    }
    function renderProductDetailModal() {
      const modal = document.getElementById('productDetailModal');
      const row = state.productDetail.row;
      if (!(state.productDetail.open && row)) {
        modal.classList.add('hidden');
        return;
      }
      const productRows = row.products || [];
      const totalQty = productRows.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      document.getElementById('productDetailTitle').textContent = `${row.orderNo}商品详情`;
      document.getElementById('productDetailScope').textContent = `当前展示${row.ownerName}在${row.warehouse}下的商品明细，字段包含商品名称、商品编码、数量与商品分类。`;
      document.getElementById('productDetailOrderTag').textContent = `订单类型:${row.orderType || '--'}`;
      document.getElementById('productDetailStats').innerHTML = [
        { label: '商品明细行数', value: formatNumber(productRows.length) },
        { label: '商品总数量', value: formatNumber(totalQty) },
        { label: '当前订单阶段', value: row.orderStage || '--' }
      ].map(item => `<div class="product-detail-stat"><div class="product-detail-stat-label">${item.label}</div><div class="product-detail-stat-value">${item.value}</div></div>`).join('');
      document.getElementById('productDetailBody').innerHTML = productRows.length
        ? productRows.map(item => `<tr><td>${item.name || '--'}</td><td>${item.code || '--'}</td><td class="cell-right">${formatNumber(item.qty || 0)}</td><td>${item.category || '--'}</td></tr>`).join('')
        : '<tr><td colspan="4" class="timeliness-detail-empty">当前订单暂无商品明细。</td></tr>';
      modal.classList.remove('hidden');
    }
    function openProductDetailModal(orderNo) {
      if (state.currentReport !== 'order') return;
      const row = reportDefinitions.order.rows.find(item => item.orderNo === orderNo);
      if (!row) {
        showToast('未找到对应订单商品明细', 'warning');
        return;
      }
      state.productDetail.open = true;
      state.productDetail.row = row;
      renderProductDetailModal();
    }
    function renderPagination(total) {
      const maxPage = Math.max(1, Math.ceil(total / state.pagination.pageSize));
      if (state.pagination.currentPage > maxPage) state.pagination.currentPage = maxPage;
      document.getElementById('prevBtn').disabled = state.pagination.currentPage === 1;
      document.getElementById('nextBtn').disabled = state.pagination.currentPage === maxPage;
      const pages = [];
      if (maxPage <= 7) for (let page = 1; page <= maxPage; page += 1) pages.push(page);
      else if (state.pagination.currentPage <= 4) pages.push(1, 2, 3, 4, 5, '...', maxPage);
      else if (state.pagination.currentPage >= maxPage - 3) pages.push(1, '...', maxPage - 4, maxPage - 3, maxPage - 2, maxPage - 1, maxPage);
      else pages.push(1, '...', state.pagination.currentPage - 1, state.pagination.currentPage, state.pagination.currentPage + 1, '...', maxPage);
      document.getElementById('pageNumbers').innerHTML = pages.map(page => page === '...' ? `<span class="page-btn" style="cursor:default;">...</span>` : `<button type="button" class="page-btn ${page === state.pagination.currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`).join('');
    }
    function renderTable() {
      const report = reportDefinitions[state.currentReport];
      const filteredRows = getFilteredRows();
      const selectedWarehouses = state.filters.selectedWarehouses.length ? state.filters.selectedWarehouses : COMMON_WAREHOUSES;
      const selectedBusinessTypes = getActiveBusinessTypes(getCurrentTypeFilters(state.currentReport), state.currentReport);
      const availableBusinessTypes = getReportBusinessTypeOptions(state.currentReport);
      let total = filteredRows.length;
      let startIndex = 0;
      let endIndex = 0;

      if (state.currentReport === 'timeliness') {
        const tableMeta = renderTimelinessTable(filteredRows, selectedBusinessTypes, report);
        total = tableMeta.total;
        startIndex = tableMeta.start;
        endIndex = tableMeta.end;
      } else {
        const maxPage = Math.max(1, Math.ceil(filteredRows.length / state.pagination.pageSize));
        if (state.pagination.currentPage > maxPage) state.pagination.currentPage = maxPage;
        const start = (state.pagination.currentPage - 1) * state.pagination.pageSize;
        const pageRows = filteredRows.slice(start, start + state.pagination.pageSize);
        const visibleFields = getVisibleConfiguredTableFields(state.currentReport, selectedBusinessTypes);
        document.getElementById('tableTitle').textContent = report.title.replace('报表', '明细');
        const toolbarItems = [
          ...report.toolbar,
          `当前仓库:${selectedWarehouses.length === COMMON_WAREHOUSES.length ? '全部仓库' : selectedWarehouses.join('、')}`,
          `${isOrderReport() ? '订单类型' : '业务类型'}:${selectedBusinessTypes.length === availableBusinessTypes.length ? `全部${isOrderReport() ? '订单类型' : '业务类型'}` : selectedBusinessTypes.join('、')}`
        ];
        if (state.currentReport === 'order') {
          toolbarItems.push(
            `订单阶段:${state.filters.orderStages.length === ORDER_STAGE_OPTIONS.length ? '全部订单阶段' : state.filters.orderStages.join('、')}`,
            `轨迹状态:${state.filters.trackStatuses.length === TRACK_STATUS_OPTIONS.length ? '全部轨迹状态' : state.filters.trackStatuses.join('、')}`
          );
        }
        document.getElementById('tableToolbar').innerHTML = toolbarItems.map(text => `<span class="toolbar-tag">${text}</span>`).join('');
        if (state.currentReport === 'order') renderOrderTable(pageRows, visibleFields);
        else renderGenericTable(pageRows, visibleFields, report);
        renderPagination(filteredRows.length);
        startIndex = filteredRows.length ? start + 1 : 0;
        endIndex = filteredRows.length ? Math.min(start + state.pagination.pageSize, filteredRows.length) : 0;
      }

      document.getElementById('totalCount').textContent = total;
      document.getElementById('currentStart').textContent = startIndex;
      document.getElementById('currentEnd').textContent = endIndex;
    }
    function parseMetricValue(value) {
      const normalized = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
      return normalized ? Number(normalized) : 0;
    }
    function buildAiMetrics(report, rows) {
      const normalizedRows = rows.map(row => ({ ...row, numericValue: parseMetricValue(row.value), timeValue: getTimeValue(row.time) }));
      const sortedRows = [...normalizedRows].sort((left, right) => left.timeValue - right.timeValue);
      const warehouseDistribution = buildDistribution(normalizedRows, 'warehouse');
      const tagDistribution = buildDistribution(normalizedRows, 'tag');
      const statusDistribution = buildDistribution(normalizedRows, 'status');
      const followRows = normalizedRows.filter(row => getStatusBucket(row.status) !== 'success');
      const latestWindowSize = Math.max(2, Math.ceil(normalizedRows.length / 3));
      const earlyAvg = average(sortedRows.slice(0, latestWindowSize).map(row => row.numericValue));
      const recentAvg = average(sortedRows.slice(-latestWindowSize).map(row => row.numericValue));
      const trendDelta = earlyAvg ? (recentAvg - earlyAvg) / earlyAvg : 0;
      const peakRow = [...normalizedRows].sort((left, right) => right.numericValue - left.numericValue)[0] || null;
      const focusRows = [...normalizedRows].sort((left, right) => {
        const rightScore = getStatusBucket(right.status) === 'risk' ? 3 : getStatusBucket(right.status) === 'warning' ? 2 : 1;
        const leftScore = getStatusBucket(left.status) === 'risk' ? 3 : getStatusBucket(left.status) === 'warning' ? 2 : 1;
        return (rightScore - leftScore) || (right.numericValue - left.numericValue) || (left.timeValue - right.timeValue);
      }).slice(0, 3);
      return { totalRows: normalizedRows.length, totalValue: normalizedRows.reduce((sum, row) => sum + row.numericValue, 0), avgValue: average(normalizedRows.map(row => row.numericValue)), followUpRate: normalizedRows.length ? followRows.length / normalizedRows.length : 0, topWarehouse: warehouseDistribution[0] || null, topTag: tagDistribution[0] || null, topStatus: statusDistribution[0] || null, peakRow, focusRows, trendDelta, trendDirection: trendDelta > 0.03 ? 'up' : trendDelta < -0.03 ? 'down' : 'flat', latestTime: sortedRows[sortedRows.length - 1]?.time || '--', uniqueCustomers: new Set(normalizedRows.map(row => row.customer)).size, uniqueWarehouses: new Set(normalizedRows.map(row => row.warehouse)).size, warehouseDistribution, tagDistribution, statusDistribution };
    }
    function buildVisualItems(distribution, options = {}) {
      const { limit = 5, unit = '单', includeCount = true, aggregateOthers = false } = options;
      const baseItems = distribution.slice(0, limit).map((item, index) => ({
        label: item.name,
        value: formatRatio(item.share),
        hint: includeCount ? `${item.count}${unit}` : '',
        share: item.share,
        color: ['#4d77ea', '#2eb67d', '#f59e0b', '#7d67ff', '#ff7b54'][index % 5]
      }));
      if (!aggregateOthers || distribution.length <= limit) return baseItems;
      const others = distribution.slice(limit);
      const othersCount = others.reduce((sum, item) => sum + item.count, 0);
      const othersShare = others.reduce((sum, item) => sum + item.share, 0);
      return [...baseItems, { label: '其他', value: formatRatio(othersShare), hint: includeCount ? `${othersCount}${unit}` : '', share: othersShare, color: '#c2ccd8' }];
    }
    function buildDonutGradient(items = []) {
      if (!items.length) return '#edf2f8';
      let start = 0;
      return `conic-gradient(${items.map(item => {
        const end = start + (item.share || 0) * 100;
        const segment = `${item.color || '#4d77ea'} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
        start = end;
        return segment;
      }).join(', ')})`;
    }
    function renderAiDonutSection(section) {
      if (!section.items || !section.items.length) return `<div class="ai-visual-empty">当前分布暂无可视化样本。</div>`;
      const topItem = section.items[0];
      return `<div class="ai-donut-layout"><div class="ai-donut-shell"><div class="ai-donut-ring" style="background:${buildDonutGradient(section.items)};"><div class="ai-donut-hole"><div class="ai-donut-center-label">${section.centerLabel || 'TOP1'}</div><div class="ai-donut-center-value">${topItem.value}</div><div class="ai-donut-center-sub">${topItem.label}</div></div></div></div><div class="ai-donut-legend">${section.items.map(item => `<div class="ai-donut-legend-item"><span class="ai-donut-dot" style="background:${item.color || '#4d77ea'};"></span><span class="ai-donut-name">${item.label}</span><span class="ai-donut-value">${item.value}</span></div>`).join('')}</div></div>`;
    }
    function renderAiVisualSection(section) {
      return `<div class="ai-visual-section"><div class="ai-visual-section-title">${section.label}</div>${section.chartType === 'donut' ? renderAiDonutSection(section) : section.items && section.items.length ? `<div class="ai-visual-list">${section.items.map(item => `<div class="ai-visual-item"><div class="ai-visual-item-head"><span class="ai-visual-item-label">${item.label}</span><span class="ai-visual-item-value">${item.value}</span></div><div class="ai-visual-bar"><span class="ai-visual-fill" style="width:${Math.max(8, Math.min(100, (item.share || 0) * 100))}%;background:${item.color || '#4d77ea'};"></span></div>${item.hint ? `<div class="ai-visual-item-hint">${item.hint}</div>` : ''}</div>`).join('')}</div>` : `<div class="ai-visual-empty">当前分布暂无可视化样本。</div>`}</div>`;
    }
    function renderAiVisualBlocks(blocks = []) {
      if (!blocks.length) return '';
      return `<div class="ai-visual-grid">${blocks.map((block, index) => `<div class="ai-visual-card"><div class="ai-visual-head"><div><div class="ai-visual-title">${block.title}</div><div class="ai-visual-sub">${block.subtitle || ''}</div></div><span class="ai-visual-badge">图表${pad(index + 1)}</span></div><div class="ai-visual-sections">${(block.sections || []).map(section => renderAiVisualSection(section)).join('')}</div></div>`).join('')}</div>`;
    }
    function formatDistributionText(distribution, options = {}) {
      const { limit = 3, includeCount = false } = options;
      if (!distribution.length) return '暂无样本';
      return distribution.slice(0, limit).map(item => includeCount ? `${item.name}${item.count}单(${formatRatio(item.share)})` : `${item.name}${formatRatio(item.share)}`).join('，');
    }
    function formatOwnerRanking(distribution) {
      if (!distribution.length) return '暂无货主样本';
      return distribution.slice(0, 3).map((item, index) => `TOP${index + 1}${item.name}${item.count}单(${formatRatio(item.share)})`).join('；');
    }
    function getAnalysisRangeDays() {
      const start = state.filters.startDate ? new Date(`${state.filters.startDate}T00:00:00`) : null;
      const end = state.filters.endDate ? new Date(`${state.filters.endDate}T00:00:00`) : null;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
      return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
    }
    function getAnalysisMode(days = getAnalysisRangeDays()) {
      if (days <= 3) return { key: 'monitor', label: '运行监控', description: '聚焦短周期波动与异常处置建议。' };
      if (days <= 30) return { key: 'review', label: '阶段复盘', description: '聚焦阶段波动、责任归因和复盘动作。' };
      return { key: 'management', label: '管理分析', description: '聚焦结构变化、集中度和管理优化方向。' };
    }
    function resolvePriorityTone(value, high = 0.45, medium = 0.25) {
      if (value >= high) return 'danger';
      if (value >= medium) return 'warning';
      return 'safe';
    }
    function buildRiskLevel({ followUpRate = 0, concentrationShare = 0, trendDelta = 0, peakShare = 0 } = {}) {
      let score = 0;
      if (followUpRate >= 0.4) score += 2;
      else if (followUpRate >= 0.25) score += 1;
      if (concentrationShare >= 0.4) score += 1;
      if (Math.abs(trendDelta) >= 0.08) score += 1;
      if (peakShare >= 0.55) score += 1;
      if (score >= 4) return { label: '高风险', tone: 'danger', hint: '建议优先纳入专项跟进。' };
      if (score >= 2) return { label: '中风险', tone: 'warning', hint: '建议纳入本轮复盘重点。' };
      return { label: '低风险', tone: 'safe', hint: '建议持续观察即可。' };
    }
    function pickModeText(mode, mapping) {
      return mapping[mode.key] || mapping.review || '';
    }
    function getCurrentRangeText() {
      if (state.currentReport === 'order') {
        const activeField = getCurrentDateField();
        const activeRange = getDateFieldRange(activeField);
        return `${getDateFieldLabel(activeField)}${activeRange.start || '--'}至${activeRange.end || '--'}`;
      }
      return `${state.filters.startDate}至${state.filters.endDate}`;
    }
    function aiEmphasis(text, tone = 'neutral') {
      const normalizedTone = ['positive', 'negative', 'neutral'].includes(tone) ? tone : 'neutral';
      return `<span class="ai-emphasis ai-emphasis-${normalizedTone}">${text}</span>`;
    }
    function toneByFollowRate(rate) {
      if (rate >= 0.35) return 'negative';
      if (rate <= 0.12) return 'positive';
      return 'neutral';
    }
    function toneByStatus(status) {
      if (!status || status === '--') return 'neutral';
      const bucket = getStatusBucket(status);
      if (bucket === 'success') return 'positive';
      if (bucket === 'warning' || bucket === 'risk') return 'negative';
      return 'neutral';
    }
    function toneByTrend(reportKey, direction) {
      const positiveWhenUp = ['sign-rate'];
      const negativeWhenUp = ['complaint', 'compensation'];
      if (direction === 'flat') return 'neutral';
      if (positiveWhenUp.includes(reportKey)) return direction === 'up' ? 'positive' : 'negative';
      if (negativeWhenUp.includes(reportKey)) return direction === 'up' ? 'negative' : 'positive';
      return 'neutral';
    }
    function formatTrendText(reportKey, valueHeader, direction) {
      const phrase = direction === 'up' ? '持续抬升' : direction === 'down' ? '阶段回落' : '整体平稳';
      const tone = toneByTrend(reportKey, direction);
      if (direction === 'flat') return `${aiEmphasis(valueHeader)}${aiEmphasis(phrase)}`;
      return `${aiEmphasis(valueHeader)}呈${aiEmphasis(phrase, tone)}`;
    }
    function buildOrderBusinessHighlight(type, rows) {
      if (!rows.length) return `${type}暂无命中样本`;
      const summaries = (ORDER_ANALYSIS_CONFIG[type] || []).map(config => {
        const topItem = buildDistribution(rows, config.field)[0];
        return topItem ? `${config.label.replace('占比', '')}以${topItem.name}为主(${formatRatio(topItem.share)})` : `${config.label}暂无样本`;
      });
      return `${type}${summaries.join('，')}`;
    }
    function buildOrderBusinessSpecificSummary(type, rows) {
      if (!rows.length) return `${type}暂无命中样本`;
      const details = (ORDER_ANALYSIS_CONFIG[type] || []).map(config => `${config.label}:${formatDistributionText(buildDistribution(rows, config.field))}`);
      return `${type}样本${rows.length}单，${details.join('；')}`;
    }
    function buildOrderBusinessSuggestion(type, rows) {
      if (!rows.length) return `${type}当前没有命中样本，建议保持筛选范围后再复核专项结构。`;
      const dimensions = ORDER_ANALYSIS_CONFIG[type] || [];
      const topItems = dimensions.map(config => ({ ...config, top: buildDistribution(rows, config.field)[0] || null }));
      if (type === '换单') {
        const originTop = topItems[0]?.top;
        const destinationTop = topItems[1]?.top;
        if (destinationTop && destinationTop.share >= 0.4) return `换单订单目的港集中在${destinationTop.name}(${formatRatio(destinationTop.share)})，建议提前锁定对应航线舱位、清关和地面交接资源。`;
        if (originTop && originTop.share >= 0.4) return `换单订单起运港主要来自${originTop.name}(${formatRatio(originTop.share)})，建议重点校验该起运港对应仓的装板与配载能力。`;
        return '换单订单港口分布相对均衡，可按周复盘起运港和目的港组合变化，提前安排舱位与出库节奏。';
      }
      if (type === '备货') {
        const poTypeTop = topItems[0]?.top;
        const currentCountryTop = topItems[1]?.top;
        if (poTypeTop?.name === 'B2C' && poTypeTop.share >= 0.55) return `备货订单以B2C为主(${formatRatio(poTypeTop.share)})，建议预留拆零拣选、末端面单和小包波次资源；同时关注${currentCountryTop?.name || '主要现派国家'}的派送承运能力。`;
        if (poTypeTop?.name === 'B2B' && poTypeTop.share >= 0.55) return `备货订单以B2B为主(${formatRatio(poTypeTop.share)})，建议优先保障整批备货、卡板位和大货出库衔接；同步复核${currentCountryTop?.name || '主现派国家'}的线路配置。`;
        if (currentCountryTop && currentCountryTop.share >= 0.35) return `备货订单现派国家集中在${currentCountryTop.name}(${formatRatio(currentCountryTop.share)})，建议同步校验该国家的派送商容量与COD币种展示配置。`;
        return '备货订单结构较均衡，可继续按PO Type和现派国家拆分波次，避免末端派送资源短时拥堵。';
      }
      const originalCountryTop = topItems[0]?.top;
      const currentCountryTop = topItems[1]?.top;
      if (currentCountryTop && currentCountryTop.share >= 0.35) return `重派订单现派国家集中在${currentCountryTop.name}(${formatRatio(currentCountryTop.share)})，建议提前准备改派线路、异常件处理和客户通知模板。`;
      if (originalCountryTop && originalCountryTop.share >= 0.35) return `重派订单原派国主要来自${originalCountryTop.name}(${formatRatio(originalCountryTop.share)})，建议专项复盘该国家的首次派送失败原因和改派规则。`;
      return '重派订单国家分布较分散，可继续按原派国和现派国家建立失败原因看板，减少重复改派。';
    }
    function buildOrderEvidenceRows(rows) {
      return [...rows].map(row => {
        const stage = row.orderStage || row.status;
        const riskScore = stage === '异常' ? 4 : stage === '待审核' ? 3 : ['处理中', '已发货'].includes(stage) ? 2 : 1;
        const evidenceScore = Number(row.priorityValue || 0);
        return { ...row, riskScore, evidenceScore, timeValue: getTimeValue(row.time) };
      }).sort((left, right) => (right.riskScore - left.riskScore) || (right.evidenceScore - left.evidenceScore) || (right.timeValue - left.timeValue)).slice(0, 3);
    }
    function buildOrderAiAnalysis(rows) {
      const mode = getAnalysisMode();
      const rangeText = getCurrentRangeText();
      const availableTypes = ORDER_TYPE_OPTIONS.filter(type => rows.some(row => row.orderType === type));
      const businessDistribution = buildDistribution(rows, 'orderType');
      const warehouseDistribution = buildDistribution(rows, 'warehouse');
      const ownerDistribution = buildDistribution(rows, 'ownerName');
      const sourceDistribution = buildDistribution(rows, 'orderSource');
      const statusDistribution = buildDistribution(rows, 'orderStage');
      const latestTime = [...rows].sort((left, right) => getTimeValue(right.time) - getTimeValue(left.time))[0]?.time || '--';
      const topBusiness = businessDistribution[0] || null;
      const topWarehouse = warehouseDistribution[0] || null;
      const topSource = sourceDistribution[0] || null;
      const topStatus = statusDistribution[0] || null;
      const followUpRows = rows.filter(row => getStatusBucket(row.orderStage) !== 'success');
      const followUpRate = rows.length ? followUpRows.length / rows.length : 0;
      const topBusinessText = aiEmphasis(topBusiness?.name || '当前订单类型');
      const topWarehouseText = aiEmphasis(topWarehouse?.name || '当前仓库');
      const topSourceText = aiEmphasis(topSource?.name || '--');
      const topStatusText = aiEmphasis(topStatus?.name || '--', toneByStatus(topStatus?.name || '--'));
      const followUpText = aiEmphasis(formatRatio(followUpRate), toneByFollowRate(followUpRate));
      const focusType = ORDER_TYPE_OPTIONS.map(type => {
        const typeRows = rows.filter(row => row.orderType === type);
        if (!typeRows.length) return null;
        const pendingRows = typeRows.filter(row => getStatusBucket(row.orderStage) !== 'success');
        return {
          type,
          rows: typeRows,
          pendingCount: pendingRows.length,
          rate: typeRows.length ? pendingRows.length / typeRows.length : 0
        };
      }).filter(Boolean).sort((left, right) => (right.rate - left.rate) || (right.pendingCount - left.pendingCount) || (right.rows.length - left.rows.length))[0] || null;
      const concentrationShare = Math.max(topBusiness?.share || 0, topWarehouse?.share || 0, topSource?.share || 0);
      const risk = buildRiskLevel({ followUpRate, concentrationShare, peakShare: concentrationShare });
      const issueNature = `${concentrationShare >= 0.45 ? '结构集中' : '结构相对均衡'}${followUpRate >= 0.35 ? '并伴随闭环压力' : '，当前闭环压力可控'}`;
      return {
        mode,
        risk,
        headline: `在${aiEmphasis(rangeText)}的查询范围内，${topBusinessText}是主要订单类型，${topWarehouseText}承接了最多订单样本，优先关注该类型在该仓的发货与签收闭环。`,
        digest: `本次分析覆盖${aiEmphasis(formatNumber(rows.length))}条订单样本，主订单类型占比${aiEmphasis(topBusiness ? formatRatio(topBusiness.share) : '--')}，主仓占比${aiEmphasis(topWarehouse ? formatRatio(topWarehouse.share) : '--')}，待跟进订单占比${followUpText}。${pickModeText(mode, { monitor: '当前更适合从异常处置角度看待待审核、处理中和异常订单。', review: '当前更适合从阶段复盘角度看订单类型结构、仓库承压与来源质量。', management: '当前更适合从管理分析角度看订单类型集中度与履约优化方向。' })}`,
        overview: [
          { label: '分析模式', value: aiEmphasis(mode.label), hint: mode.description },
          { label: '风险等级', value: aiEmphasis(risk.label, risk.tone === 'danger' ? 'negative' : risk.tone === 'safe' ? 'positive' : 'neutral'), hint: risk.hint },
          { label: '主要波动仓', value: topWarehouseText, hint: topWarehouse ? `样本占比${aiEmphasis(formatRatio(topWarehouse.share))}` : '暂无仓库分布' },
          { label: '主订单类型', value: topBusinessText, hint: topBusiness ? `类型占比${aiEmphasis(formatRatio(topBusiness.share))}` : '暂无类型分布' }
        ],
        priorities: [
          {
            title: `${topBusinessText}是主要订单类型`,
            tone: resolvePriorityTone(topBusiness?.share || 0, 0.55, 0.35),
            badge: topBusiness ? `占比${aiEmphasis(formatRatio(topBusiness.share))}` : '结构待确认',
            impact: topBusiness ? `该订单类型在当前查询范围内占${aiEmphasis(formatRatio(topBusiness.share))}，共${aiEmphasis(topBusiness.count)}单，是订单规模的主要来源。` : '当前暂无订单类型结构样本。',
            reason: topBusiness ? `${topBusinessText}在订单类型结构中最集中，${buildOrderBusinessHighlight(topBusiness.name, rows.filter(row => row.orderType === topBusiness.name))}。` : '当前没有足够样本支持订单类型判断。',
            action: topBusiness ? (mode.key === 'monitor' ? `优先查看${topBusiness.name}相关明细，确认待审核、处理中和异常订单是否在持续堆积。` : buildOrderBusinessSuggestion(topBusiness.name, rows.filter(row => row.orderType === topBusiness.name))) : '建议扩大查询范围后再复核。'
          },
          {
            title: `${topWarehouseText}承接最多订单`,
            tone: resolvePriorityTone(topWarehouse?.share || 0, 0.48, 0.34),
            badge: topWarehouse ? `占比${aiEmphasis(formatRatio(topWarehouse.share))}` : '仓库待确认',
            impact: topWarehouse ? `该仓命中${aiEmphasis(topWarehouse.count)}单，订单样本占比${aiEmphasis(formatRatio(topWarehouse.share))}，是当前最主要的承压仓。` : '当前暂无仓库分布。',
            reason: topSource ? `订单来源以${topSourceText}为主，占比${aiEmphasis(formatRatio(topSource.share))}；主订单阶段为${topStatusText}。` : `主订单阶段为${topStatusText}。`,
            action: pickModeText(mode, {
              monitor: `优先检查${topWarehouse?.name || '当前仓库'}的上线、发货和签收衔接，避免单仓拥堵放大波动。`,
              review: `围绕${topWarehouse?.name || '当前仓库'}复盘下单到签收的闭环节奏，定位单仓承压原因。`,
              management: `将${topWarehouse?.name || '当前仓库'}纳入专项管理观察，评估分仓与资源配置策略是否需要调整。`
            })
          },
          {
            title: focusType ? `${aiEmphasis(focusType.type)}更需要优先复盘` : '待跟进订单需要持续观察',
            tone: resolvePriorityTone(focusType?.rate || followUpRate, 0.45, 0.25),
            badge: focusType ? `待跟进${aiEmphasis(formatRatio(focusType.rate), toneByFollowRate(focusType.rate))}` : `待跟进${followUpText}`,
            impact: focusType ? `该订单类型待跟进${aiEmphasis(focusType.pendingCount)}单，占该类型${aiEmphasis(formatRatio(focusType.rate), toneByFollowRate(focusType.rate))}，高于整体订单待跟进占比${followUpText}。` : `当前待跟进订单占比${followUpText}，主订单阶段为${topStatusText}。`,
            reason: focusType ? `${buildOrderBusinessSpecificSummary(focusType.type, focusType.rows)}。` : `订单来源分布:${formatDistributionText(sourceDistribution)}。`,
            action: focusType ? (mode.key === 'monitor' ? `先查看${focusType.type}待跟进明细，优先清理待审核、处理中和异常订单。` : buildOrderBusinessSuggestion(focusType.type, focusType.rows)) : '建议继续按订单类型观察异常是否向单一结构集中。'
          }
        ],
        driverSummary: [
          `${topBusinessText}是主订单类型，占比${aiEmphasis(topBusiness ? formatRatio(topBusiness.share) : '--')}。`,
          `${topWarehouseText}是主波动仓，订单来源以${topSourceText}为主。`,
          `待跟进订单占比${followUpText}，问题性质判断为“${aiEmphasis(issueNature, followUpRate >= 0.35 ? 'negative' : 'neutral')}”。`
        ],
        evidenceCharts: [
          {
            title: '订单结构佐证',
            subtitle: '用订单类型和仓库分布说明当前主问题为何成立',
            sections: [
              { label: '订单类型占比', chartType: 'donut', centerLabel: '主类型', items: buildVisualItems(businessDistribution, { limit: 3, aggregateOthers: true }) },
              { label: '仓库占比', chartType: 'donut', centerLabel: '主仓', items: buildVisualItems(warehouseDistribution, { limit: 3, aggregateOthers: true }) }
            ]
          },
          {
            title: '来源与状态佐证',
            subtitle: '辅助判断问题来源和当前闭环压力',
            sections: [
              { label: '订单来源占比', chartType: 'donut', centerLabel: '主来源', items: buildVisualItems(sourceDistribution, { limit: 3, aggregateOthers: true }) },
              { label: '状态分布', chartType: 'donut', centerLabel: '主状态', items: buildVisualItems(statusDistribution, { limit: 4, unit: '条', aggregateOthers: true }) }
            ]
          }
        ],
        evidenceSummary: [
          `订单类型占比:主类型${topBusinessText}，占${aiEmphasis(topBusiness ? formatRatio(topBusiness.share) : '--')}`,
          `仓库占比:主仓${topWarehouseText}，占${aiEmphasis(topWarehouse ? formatRatio(topWarehouse.share) : '--')}`,
          `订单来源:主来源${topSourceText}，占${aiEmphasis(topSource ? formatRatio(topSource.share) : '--')}`,
          `货主TOP3:${aiEmphasis(formatOwnerRanking(ownerDistribution))}`
        ],
        evidenceRows: buildOrderEvidenceRows(rows),
        basis: [
          `问题性质:${aiEmphasis(issueNature, followUpRate >= 0.35 ? 'negative' : 'neutral')}`,
          `最新样本更新时间:${aiEmphasis(latestTime)}`,
          `订单类型占比:${formatDistributionText(businessDistribution)}`,
          `仓库占比:${formatDistributionText(warehouseDistribution)}`,
          `订单来源统计:${formatDistributionText(sourceDistribution)}`,
          ...availableTypes.map(type => buildOrderBusinessSpecificSummary(type, rows.filter(row => row.orderType === type)))
        ]
      };
    }
    function buildTimelinessAiAnalysis(rows) {
      const mode = getAnalysisMode();
      const rangeText = getCurrentRangeText();
      const businessType = getCurrentTimelinessBusinessType(state.filters.businessTypes);
      const summaryRows = buildTimelinessNodeSummary(rows, businessType);
      const validRows = summaryRows.filter(item => item.sampleCount);
      const totalAvgDuration = validRows.reduce((sum, item) => sum + item.avgDurationSeconds, 0);
      const totalBenchmark = validRows.reduce((sum, item) => sum + item.benchmarkSeconds, 0);
      const bottleneckNode = [...validRows].sort((left, right) => right.avgDurationSeconds - left.avgDurationSeconds)[0] || null;
      const abnormalNode = [...validRows].sort((left, right) => (right.abnormalRate - left.abnormalRate) || (right.abnormalCount - left.abnormalCount))[0] || null;
      const warehouseDistribution = buildDistribution(rows, 'warehouse');
      const statusDistribution = buildDistribution(rows, 'status');
      const ownerDistribution = buildDistribution(rows, 'ownerName');
      const topWarehouse = warehouseDistribution[0] || null;
      const topStatus = statusDistribution[0] || null;
      const completeOrderCount = rows.filter(row => row.completedNodeCount === (TIMELINESS_NODE_CONFIG[businessType] || []).length).length;
      const completionRate = rows.length ? completeOrderCount / rows.length : 0;
      const abnormalOrderCount = rows.filter(row => row.abnormalNodeCount > 0).length;
      const abnormalOrderRate = rows.length ? abnormalOrderCount / rows.length : 0;
      const deviationRate = totalBenchmark ? (totalAvgDuration - totalBenchmark) / totalBenchmark : 0;
      const risk = buildRiskLevel({
        followUpRate: Math.max(abnormalOrderRate, 1 - completionRate),
        concentrationShare: topWarehouse?.share || 0,
        trendDelta: deviationRate,
        peakShare: totalAvgDuration ? (bottleneckNode?.avgDurationSeconds || 0) / totalAvgDuration : 0
      });
      const topWarehouseText = aiEmphasis(topWarehouse?.name || '当前仓库');
      const bottleneckText = aiEmphasis(bottleneckNode?.name || '--');
      const abnormalNodeText = aiEmphasis(abnormalNode?.name || '--');
      const topStatusText = aiEmphasis(topStatus?.name || '--', toneByStatus(topStatus?.name || '--'));
      const completionText = aiEmphasis(formatRatio(completionRate), completionRate >= 0.7 ? 'positive' : completionRate >= 0.45 ? 'neutral' : 'negative');
      const abnormalText = aiEmphasis(formatRatio(abnormalOrderRate), abnormalOrderRate >= 0.3 ? 'negative' : abnormalOrderRate <= 0.12 ? 'positive' : 'neutral');
      const detailRows = bottleneckNode ? buildTimelinessDetailRows(bottleneckNode.name, rows) : [];
      return {
        mode,
        risk,
        headline: `在${aiEmphasis(rangeText)}的查询范围内，${aiEmphasis(businessType)}业务的主要卡点为${bottleneckText}，当前建议优先核查${topWarehouseText}对应订单的节点交接效率。`,
        digest: `本次分析覆盖${aiEmphasis(formatNumber(rows.length))}条时效订单样本，平均全链路时效为${aiEmphasis(formatDuration(totalAvgDuration))}，较工作台基线${aiEmphasis(formatDurationDelta(totalAvgDuration - totalBenchmark), deviationRate > 0 ? 'negative' : deviationRate < 0 ? 'positive' : 'neutral')}；完整流转订单占比${completionText}，异常订单占比${abnormalText}。${pickModeText(mode, { monitor: '当前适合优先盯住异常节点和长尾订单。', review: '当前适合复盘节点交接、仓库承压和订单状态分布。', management: '当前适合从管理分析角度判断节点资源和流程优化方向。' })}`,
        overview: [
          { label: '分析模式', value: aiEmphasis(mode.label), hint: mode.description },
          { label: '风险等级', value: aiEmphasis(risk.label, risk.tone === 'danger' ? 'negative' : risk.tone === 'safe' ? 'positive' : 'neutral'), hint: risk.hint },
          { label: '主要卡点节点', value: bottleneckText, hint: bottleneckNode ? `平均时效${aiEmphasis(formatDuration(bottleneckNode.avgDurationSeconds))}` : '暂无节点样本' },
          { label: '主要波动仓', value: topWarehouseText, hint: topWarehouse ? `样本占比${aiEmphasis(formatRatio(topWarehouse.share))}` : '暂无仓库分布' }
        ],
        priorities: [
          {
            title: `${bottleneckText}是当前最长节点`,
            tone: resolvePriorityTone(totalAvgDuration ? (bottleneckNode?.avgDurationSeconds || 0) / totalAvgDuration : 0, 0.3, 0.2),
            badge: bottleneckNode ? `平均${aiEmphasis(formatDuration(bottleneckNode.avgDurationSeconds))}` : '节点待确认',
            impact: bottleneckNode ? `${bottleneckText}命中${aiEmphasis(bottleneckNode.sampleCount)}单，较工作台基线${aiEmphasis(formatDurationDelta(bottleneckNode.deltaSeconds), bottleneckNode.deltaSeconds > 0 ? 'negative' : 'positive')}。` : '当前暂无足够节点样本。',
            reason: bottleneckNode ? `该节点完成率${aiEmphasis(formatRatio(bottleneckNode.completionRate))}，异常占比${aiEmphasis(formatRatio(bottleneckNode.abnormalRate), bottleneckNode.abnormalRate >= 0.2 ? 'negative' : 'neutral')}。` : '当前暂无节点分布。',
            action: pickModeText(mode, {
              monitor: `优先查看${bottleneckNode?.name || '该节点'}订单明细，确认长尾订单是否集中在单仓或单一货主。`,
              review: `围绕${bottleneckNode?.name || '该节点'}复盘交接、资源和设备因素，必要时拆分波次或补人补位。`,
              management: `将${bottleneckNode?.name || '该节点'}纳入专项管理观察，评估节点SLA和资源配置是否需要调整。`
            })
          },
          {
            title: `${abnormalNodeText}异常占比更高`,
            tone: resolvePriorityTone(abnormalNode?.abnormalRate || 0, 0.25, 0.12),
            badge: abnormalNode ? `异常${aiEmphasis(formatRatio(abnormalNode.abnormalRate), abnormalNode.abnormalRate >= 0.25 ? 'negative' : 'neutral')}` : '异常待确认',
            impact: abnormalNode ? `${abnormalNodeText}当前异常节点数为${aiEmphasis(abnormalNode.abnormalCount)}单，是最值得优先下钻的异常节点。` : '当前暂无异常节点样本。',
            reason: abnormalNode ? `最近节点结束时间为${aiEmphasis(abnormalNode.latestEndTime)}，可优先联动该时间段的仓内作业安排复核。` : '当前暂无节点异常分布。',
            action: pickModeText(mode, {
              monitor: `优先筛看${abnormalNode?.name || '该节点'}异常订单，确认是否存在持续性的设备或交接阻塞。`,
              review: `围绕${abnormalNode?.name || '该节点'}整理异常原因和责任归属，形成专项复盘动作。`,
              management: `将${abnormalNode?.name || '该节点'}异常占比纳入例行管理看板，持续跟踪改进效果。`
            })
          },
          {
            title: `完整流转订单占比为${completionText}`,
            tone: resolvePriorityTone(1 - completionRate, 0.4, 0.2),
            badge: `异常订单${abnormalText}`,
            impact: rows.length ? `当前完整流转订单${aiEmphasis(formatNumber(completeOrderCount))}单，异常订单${aiEmphasis(formatNumber(abnormalOrderCount))}单，主状态为${topStatusText}。` : '当前暂无样本。',
            reason: topWarehouse ? `${topWarehouseText}样本占比${aiEmphasis(formatRatio(topWarehouse.share))}，货主TOP3为${aiEmphasis(formatOwnerRanking(ownerDistribution))}。` : '当前暂无仓库或货主结构。',
            action: pickModeText(mode, {
              monitor: `先确认未完成订单是否主要集中在${topWarehouse?.name || '当前仓库'}，避免节点等待继续累积。`,
              review: `按仓库、货主和订单状态拆分样本，定位完整流转率下降的主要结构来源。`,
              management: `将完整流转占比纳入管理指标，持续跟踪节点SLA对整体时效的影响。`
            })
          }
        ],
        driverSummary: [
          `${bottleneckText}是当前主要卡点节点，平均时效${aiEmphasis(bottleneckNode ? formatDuration(bottleneckNode.avgDurationSeconds) : '--')}。`,
          `${topWarehouseText}是主波动仓，当前主状态为${topStatusText}。`,
          `完整流转占比${completionText}，异常订单占比${abnormalText}，问题性质判断为“${aiEmphasis(risk.label, risk.tone === 'danger' ? 'negative' : risk.tone === 'safe' ? 'positive' : 'neutral')}”。`
        ],
        evidenceCharts: [
          {
            title: '节点时效结构佐证',
            subtitle: '用节点平均时效和异常节点分布说明当前卡点结论',
            sections: [
              { label: '节点平均时效占比', chartType: 'donut', centerLabel: '主卡点', items: buildTimelinessVisualItems(summaryRows) },
              { label: '异常节点分布', chartType: 'donut', centerLabel: '异常', items: buildTimelinessAbnormalItems(summaryRows) }
            ]
          },
          {
            title: '仓库与状态佐证',
            subtitle: '辅助判断当前节点波动主要落在什么仓和什么状态',
            sections: [
              { label: '仓库占比', chartType: 'donut', centerLabel: '主仓', items: buildVisualItems(warehouseDistribution, { limit: 3, aggregateOthers: true }) },
              { label: '订单状态', chartType: 'donut', centerLabel: '主状态', items: buildVisualItems(statusDistribution, { limit: 3, unit: '条', aggregateOthers: true }) }
            ]
          }
        ],
        evidenceSummary: [
          `主要卡点:${bottleneckText}，平均时效${aiEmphasis(bottleneckNode ? formatDuration(bottleneckNode.avgDurationSeconds) : '--')}`,
          `主要波动仓:${topWarehouseText}${topWarehouse ? `，占${aiEmphasis(formatRatio(topWarehouse.share))}` : ''}`,
          `完整流转订单占比:${completionText}`,
          `货主TOP3:${aiEmphasis(formatOwnerRanking(ownerDistribution))}`
        ],
        evidenceRows: detailRows.slice(0, 3).map(row => ({
          ...row,
          evidenceMeta: `${row.customer} / ${row.warehouse}`,
          evidenceTag: `节点:${bottleneckNode?.name || '--'}`,
          evidenceValue: `节点时长:${row.nodeDuration}`,
          time: row.nodeEndTime
        })),
        basis: [
          `工作台业务类型:${aiEmphasis(businessType)}`,
          `平均全链路时效:${aiEmphasis(formatDuration(totalAvgDuration))}`,
          `较工作台基线:${aiEmphasis(formatDurationDelta(totalAvgDuration - totalBenchmark), deviationRate > 0 ? 'negative' : deviationRate < 0 ? 'positive' : 'neutral')}`,
          `完整流转订单占比:${completionText}`,
          `异常订单占比:${abnormalText}`,
          validRows.length ? `节点平均时效分布:${validRows.map(item => `${item.name}${formatDuration(item.avgDurationSeconds)}`).join('，')}` : '当前暂无节点时效分布'
        ]
      };
    }
    function buildAiAnalysis(report, rows) {
      if (state.currentReport === 'order') return buildOrderAiAnalysis(rows);
      if (state.currentReport === 'timeliness') return buildTimelinessAiAnalysis(rows);
      const mode = getAnalysisMode();
      const rangeText = getCurrentRangeText();
      const metrics = buildAiMetrics(report, rows);
      const topWarehouse = metrics.topWarehouse?.name || '当前仓库';
      const topWarehouseShare = metrics.topWarehouse ? formatRatio(metrics.topWarehouse.share) : '--';
      const topTag = metrics.topTag?.name || `当前${report.tagHeader}`;
      const topTagShare = metrics.topTag ? formatRatio(metrics.topTag.share) : '--';
      const followRateText = formatRatio(metrics.followUpRate);
      const trendText = formatTrendText(state.currentReport, report.valueHeader, metrics.trendDirection);
      const concentrationShare = Math.max(metrics.topWarehouse?.share || 0, metrics.topTag?.share || 0);
      const risk = buildRiskLevel({ followUpRate: metrics.followUpRate, concentrationShare, trendDelta: metrics.trendDelta, peakShare: metrics.topTag?.share || 0 });
      let issueNature = concentrationShare >= 0.45 ? '结构集中' : metrics.trendDirection === 'up' ? '阶段性抬升' : metrics.trendDirection === 'down' ? '阶段性回落' : '相对平稳';
      if (metrics.followUpRate >= 0.35) issueNature = `${issueNature}并伴随闭环压力`;
      const topWarehouseText = aiEmphasis(topWarehouse);
      const topTagText = aiEmphasis(topTag);
      const topStatusText = aiEmphasis(metrics.topStatus?.name || '--', toneByStatus(metrics.topStatus?.name || '--'));
      const followRateHighlight = aiEmphasis(followRateText, toneByFollowRate(metrics.followUpRate));
      return {
        mode,
        risk,
        headline: `在${aiEmphasis(rangeText)}的查询范围内，${topWarehouseText}是主要波动仓，${topTagText}是最集中的${aiEmphasis(report.tagHeader)}，当前需要优先关注${aiEmphasis(report.valueHeader)}与${aiEmphasis(report.filterB.label)}的联动变化。`,
        digest: `本次分析覆盖${aiEmphasis(metrics.totalRows)}条样本，${topWarehouseText}样本占比${aiEmphasis(topWarehouseShare)}，${topTagText}占${aiEmphasis(report.tagHeader)}${aiEmphasis(topTagShare)}，待跟进样本占比${followRateHighlight}，${trendText}。${pickModeText(mode, { monitor: '当前更适合从异常监控和重点处置角度查看结果。', review: '当前更适合从阶段复盘角度查看波动来源和责任归因。', management: '当前更适合从管理分析角度查看结构变化和优化方向。' })}`,
        overview: [
          { label: '分析模式', value: aiEmphasis(mode.label), hint: mode.description },
          { label: '风险等级', value: aiEmphasis(risk.label, risk.tone === 'danger' ? 'negative' : risk.tone === 'safe' ? 'positive' : 'neutral'), hint: risk.hint },
          { label: '主要波动仓', value: topWarehouseText, hint: metrics.topWarehouse ? `样本占比${aiEmphasis(topWarehouseShare)}` : '暂无仓库分布' },
          { label: `核心${report.tagHeader}`, value: topTagText, hint: metrics.topTag ? `维度占比${aiEmphasis(topTagShare)}` : '暂无维度分布' }
        ],
        priorities: [
          {
            title: `${topWarehouseText}是主要波动仓`,
            tone: resolvePriorityTone(metrics.topWarehouse?.share || 0, 0.48, 0.34),
            badge: metrics.topWarehouse ? `占比${aiEmphasis(topWarehouseShare)}` : '仓库待确认',
            impact: metrics.topWarehouse ? `${topWarehouseText}命中${aiEmphasis(metrics.topWarehouse.count)}条样本，占当前查询范围${aiEmphasis(topWarehouseShare)}，是最主要的承压仓。` : '当前暂无仓库分布样本。',
            reason: `${aiEmphasis(report.valueHeader)}当前${trendText}；${metrics.topStatus ? `主状态为${topStatusText}` : '暂无主状态'}。`,
            action: pickModeText(mode, {
              monitor: `优先查看${topWarehouse}相关明细，确认${report.filterB.label}异常是否集中。`,
              review: `围绕${topWarehouse}复盘${report.valueHeader}与${report.filterB.label}变化，定位阶段波峰成因。`,
              management: `将${topWarehouse}纳入专项管理观察，评估资源配置与流程策略是否需要调整。`
            })
          },
          {
            title: `${topTagText}是主要${aiEmphasis(report.tagHeader)}`,
            tone: resolvePriorityTone(metrics.topTag?.share || 0, 0.5, 0.32),
            badge: metrics.topTag ? `占比${aiEmphasis(topTagShare)}` : '维度待确认',
            impact: metrics.topTag ? `${topTagText}占当前${aiEmphasis(report.tagHeader)}${aiEmphasis(topTagShare)}，是最集中的业务切面。` : '当前暂无维度分布样本。',
            reason: metrics.topTag ? `${report.tagHeader}分布以${formatDistributionText(metrics.tagDistribution)}为主，可作为继续下钻的第一维度。` : '当前暂无维度结构。',
            action: pickModeText(mode, {
              monitor: `优先检查${topTag}相关样本，确认是否存在连续积压或异常回退。`,
              review: `围绕${topTag}拆看责任归因和异常分层，形成本轮复盘重点。`,
              management: `将${topTag}纳入专项管理视角，补充更细粒度监控指标。`
            })
          },
          {
            title: metrics.followUpRate >= 0.35 ? '待跟进样本占比偏高' : trendText,
            tone: resolvePriorityTone(Math.max(metrics.followUpRate, Math.abs(metrics.trendDelta)), 0.35, 0.18),
            badge: metrics.followUpRate >= 0.35 ? `占比${followRateHighlight}` : metrics.trendDirection === 'flat' ? '趋势稳定' : `变化${aiEmphasis(formatRatio(Math.abs(metrics.trendDelta)), toneByTrend(state.currentReport, metrics.trendDirection))}`,
            impact: `${metrics.topStatus ? `主状态为${topStatusText}` : '当前暂无状态分布'}，待跟进样本占比${followRateHighlight}${metrics.peakRow ? `；峰值样本为${aiEmphasis(metrics.peakRow.code)} / ${aiEmphasis(metrics.peakRow.value)}` : ''}。`,
            reason: `问题性质判断为“${aiEmphasis(issueNature, metrics.followUpRate >= 0.35 ? 'negative' : 'neutral')}”，最新样本更新时间为${aiEmphasis(metrics.latestTime)}。`,
            action: pickModeText(mode, {
              monitor: metrics.peakRow ? `优先复核高值样本${metrics.peakRow.code}，确认是否会继续放大整体波动。` : '优先清理待跟进样本，避免异常继续累积。',
              review: metrics.peakRow ? `围绕峰值样本${metrics.peakRow.code}与待跟进样本复盘异常路径，补齐专项监控。` : '围绕待跟进样本与状态分布复盘闭环节奏。',
              management: '将待跟进样本占比纳入管理看板，持续跟踪结构性变化。'
            })
          }
        ],
        driverSummary: [
          `${topWarehouseText}是主波动仓，占比${aiEmphasis(topWarehouseShare)}。`,
          `${topTagText}是主维度，占${aiEmphasis(report.tagHeader)}${aiEmphasis(topTagShare)}。`,
          `待跟进样本占比${followRateHighlight}，问题性质判断为“${aiEmphasis(issueNature, metrics.followUpRate >= 0.35 ? 'negative' : 'neutral')}”。`
        ],
        evidenceCharts: [
          {
            title: `${report.tagHeader}结构佐证`,
            subtitle: '用分布图说明当前最集中的业务切面',
            sections: [
              { label: `${report.tagHeader}占比`, chartType: 'donut', centerLabel: 'TOP1', items: buildVisualItems(metrics.tagDistribution, { limit: 4, unit: report.rowsConfig.unit || '条', aggregateOthers: true }) }
            ]
          },
          {
            title: '仓库与状态佐证',
            subtitle: '用仓库分布和闭环状态说明波动来源',
            sections: [
              { label: '仓库占比', chartType: 'donut', centerLabel: '主仓', items: buildVisualItems(metrics.warehouseDistribution, { limit: 3, aggregateOthers: true }) },
              { label: '状态分布', chartType: 'donut', centerLabel: '主状态', items: buildVisualItems(metrics.statusDistribution, { limit: 4, unit: '条', aggregateOthers: true }) }
            ]
          }
        ],
        evidenceSummary: [
          `仓库占比:主仓${topWarehouseText}，占${aiEmphasis(topWarehouseShare)}`,
          `${report.tagHeader}占比:主维度${topTagText}，占${aiEmphasis(topTagShare)}`,
          `状态分布:主状态${topStatusText}${metrics.topStatus ? `，占${aiEmphasis(formatRatio(metrics.topStatus.share))}` : ''}`,
          metrics.peakRow ? `峰值样本:${aiEmphasis(metrics.peakRow.code)} / ${aiEmphasis(metrics.peakRow.value)}` : '当前未识别到峰值样本'
        ],
        evidenceRows: metrics.focusRows,
        basis: [
          `问题性质:${aiEmphasis(issueNature, metrics.followUpRate >= 0.35 ? 'negative' : 'neutral')}`,
          `最新样本更新时间:${aiEmphasis(metrics.latestTime)}`,
          `趋势判断:${trendText}`,
          metrics.peakRow ? `峰值样本:${aiEmphasis(metrics.peakRow.code)} / ${aiEmphasis(metrics.peakRow.value)}` : '当前未识别到峰值样本',
          '本次分析基于当前查询条件与表格样本生成，适合用于区间复盘和评审演示。'
        ]
      };
    }
    function resetAiAnalysis(status = 'idle', message = '点击生成AI分析，基于当前查询范围输出区间结论、优先关注事项和复盘建议。') {
      state.ai.requestId += 1;
      state.ai.status = status;
      state.ai.message = message;
      state.ai.generatedAt = '';
      state.ai.result = null;
      state.ai.reportCollapsed = false;
      state.ai.evidenceModalOpen = false;
    }
    function buildAiScopeText(total) {
      const report = reportDefinitions[state.currentReport];
      const mode = getAnalysisMode();
      const selectedWarehouses = state.filters.selectedWarehouses.length ? state.filters.selectedWarehouses : COMMON_WAREHOUSES;
      const availableBusinessTypes = getReportBusinessTypeOptions(state.currentReport);
      const selectedBusinessTypes = getActiveBusinessTypes(getCurrentTypeFilters(state.currentReport), state.currentReport);
      const warehouseText = selectedWarehouses.length === COMMON_WAREHOUSES.length ? '全部仓库' : selectedWarehouses.join('、');
      const customerText = state.filters.customer || '全部客户/货主';
      const typeLabel = state.currentReport === 'order' ? '订单类型' : '业务类型';
      const businessTypeText = selectedBusinessTypes.length === availableBusinessTypes.length && !isSingleBusinessTypeReport(state.currentReport) ? `全部${typeLabel}` : selectedBusinessTypes.join('、');
      if (state.currentReport === 'order') {
        const activeField = getCurrentDateField();
        const activeRange = getDateFieldRange(activeField);
        const orderStageText = state.filters.orderStages.length === ORDER_STAGE_OPTIONS.length ? '全部订单阶段' : state.filters.orderStages.join('、');
        const trackStatusText = state.filters.trackStatuses.length === TRACK_STATUS_OPTIONS.length ? '全部轨迹状态' : state.filters.trackStatuses.join('、');
        const rangeText = `${activeRange.start || '--'}至${activeRange.end || '--'}`;
        return `分析范围:${getDateFieldLabel(activeField)}${rangeText}｜分析模式:${mode.label}｜报表:${report.title}｜仓库:${warehouseText}｜客户/货主:${customerText}｜订单类型:${businessTypeText}｜订单阶段:${orderStageText}｜轨迹状态:${trackStatusText}｜样本:${total}条`;
      }
      const filterAText = state.filters.filterA || `全部${report.filterA.label}`;
      const filterBText = state.filters.filterB || `全部${report.filterB.label}`;
      const keywordText = state.filters.keyword ? `｜关键词:${state.filters.keyword}` : '';
      return `分析范围:${state.filters.startDate}至${state.filters.endDate}｜分析模式:${mode.label}｜报表:${report.title}｜仓库:${warehouseText}｜客户/货主:${customerText}｜${typeLabel}:${businessTypeText}｜${report.filterA.label}:${filterAText}｜${report.filterB.label}:${filterBText}${keywordText}｜样本:${total}条`;
    }
    function renderAiPriorityCards(items = []) {
      return items.map((item, index) => `<div class="ai-priority-card" data-tone="${item.tone || 'safe'}"><div class="ai-priority-top"><span class="ai-priority-index">关注${index + 1}</span><span class="ai-priority-badge">${item.badge || '--'}</span></div><div class="ai-priority-title">${item.title}</div><div class="ai-priority-block"><div class="ai-priority-label">影响表现</div><div class="ai-priority-text">${item.impact}</div></div><div class="ai-priority-block"><div class="ai-priority-label">判断依据</div><div class="ai-priority-text">${item.reason}</div></div><div class="ai-priority-block"><div class="ai-priority-label">建议动作</div><div class="ai-priority-text">${item.action}</div></div></div>`).join('');
    }
    function renderAiEvidenceSummary(items = []) {
      if (!items.length) return `<div class="ai-placeholder">当前没有可展示的结构摘要。</div>`;
      return `<div class="ai-compact-list">${items.map(item => `<div class="ai-compact-item">${item}</div>`).join('')}</div>`;
    }
    function renderAiEvidenceModal(scopeText) {
      const modal = document.getElementById('aiEvidenceModal');
      const modalBody = document.getElementById('aiEvidenceModalBody');
      const modalScope = document.getElementById('aiEvidenceModalScope');
      const modalTitle = document.getElementById('aiEvidenceModalTitle');
      const modalGeneratedAt = document.getElementById('aiEvidenceModalGeneratedAt');
      const hasResult = state.ai.status === 'ready' && state.ai.result;
      if (!hasResult || !state.ai.evidenceModalOpen) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        modalBody.innerHTML = '';
        return;
      }
      const result = state.ai.result;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      modalTitle.textContent = `${reportDefinitions[state.currentReport].title}依据详情`;
      modalScope.textContent = scopeText;
      modalGeneratedAt.textContent = state.ai.generatedAt ? `生成时间:${state.ai.generatedAt}` : '分析口径:当前查询结果';
      modalBody.innerHTML = `<div class="ai-evidence-shell"><div><div class="section-title">图表佐证</div><div class="section-sub" style="margin-top:6px;">用轻量图表直观看到当前结论背后的结构分布</div><div style="margin-top:14px;">${renderAiVisualBlocks(result.evidenceCharts || [])}</div></div><div class="ai-evidence-grid"><div class="ai-card"><div class="section-title">重点样本</div><div class="section-sub" style="margin-top:6px;">默认只保留最值得复核的3条样本</div><div class="ai-list" style="margin-top:14px;">${result.evidenceRows.length ? result.evidenceRows.map(row => `<div class="evidence-card"><div class="evidence-head"><div class="evidence-title">${row.code}</div><span class="badge ${statusClass(row.status)}">${row.status}</span></div><div class="evidence-meta">${row.evidenceMeta || `${row.customer} / ${row.warehouse}`}</div><div class="evidence-tags"><span class="toolbar-tag">${state.currentReport === 'order' ? '订单类型' : '业务'}:${row.orderType || row.businessType || '--'}</span><span class="toolbar-tag">${row.evidenceTag || row.tag}</span><span class="toolbar-tag">${row.evidenceValue || `关键值:${row.value}`}</span><span class="toolbar-tag">更新时间:${row.time}</span></div></div>`).join('') : `<div class="ai-placeholder">当前筛选结果没有可展示的重点样本。</div>`}</div></div><div class="ai-card"><div class="section-title">结构摘要</div><div class="section-sub" style="margin-top:6px;">用于说明本次结论所依托的主要分布</div>${renderAiEvidenceSummary(result.evidenceSummary)}</div></div><div class="ai-card"><div class="section-title">分析依据</div><div class="section-sub" style="margin-top:6px;">适合评审时说明口径和判断原因</div><div class="ai-list" style="margin-top:14px;">${result.basis.map(item => `<div class="ai-list-item">${item}</div>`).join('')}</div></div></div>`;
    }
    function renderAiAnalysis() {
      const section = document.getElementById('aiAnalysisSection');
      if (state.currentReport === 'order') {
        section.classList.add('hidden');
        return;
      }
      section.classList.remove('hidden');
      const rows = getFilteredRows();
      const button = document.getElementById('aiAnalyzeBtn');
      const buttonText = document.getElementById('aiAnalyzeBtnText');
      const scope = document.getElementById('aiScopeText');
      const badge = document.getElementById('aiStatusBadge');
      const generatedAt = document.getElementById('aiGeneratedAt');
      const content = document.getElementById('aiAnalysisContent');
      const body = document.getElementById('aiInlineBody');
      const collapseBtn = document.getElementById('toggleAiCollapseBtn');
      scope.textContent = buildAiScopeText(rows.length);
      button.disabled = state.ai.status === 'loading';
      buttonText.textContent = state.ai.status === 'loading' ? '分析中...' : state.ai.status === 'ready' ? '重新分析' : state.ai.status === 'stale' ? '更新分析' : state.ai.status === 'empty' ? '重新分析' : '生成AI分析';
      const statusConfig = { idle: { tone: 'idle', icon: 'ri-time-line', label: '待分析' }, loading: { tone: 'loading', icon: 'ri-loader-4-line', label: '分析中' }, ready: { tone: 'ready', icon: 'ri-checkbox-circle-line', label: '已生成' }, stale: { tone: 'warning', icon: 'ri-refresh-line', label: '待刷新' }, empty: { tone: 'empty', icon: 'ri-alert-line', label: '无数据' } }[state.ai.status];
      badge.dataset.tone = statusConfig.tone;
      badge.innerHTML = `<i class="${statusConfig.icon} ${state.ai.status === 'loading' ? 'rotate' : ''}"></i><span>${statusConfig.label}</span>`;
      generatedAt.textContent = state.ai.generatedAt ? `生成时间:${state.ai.generatedAt}` : '分析口径:当前查询结果';
      const hasReadyResult = state.ai.status === 'ready' && state.ai.result;
      collapseBtn.disabled = !hasReadyResult;
      collapseBtn.setAttribute('aria-expanded', hasReadyResult ? String(!state.ai.reportCollapsed) : 'true');
      collapseBtn.innerHTML = `<i class="${hasReadyResult && state.ai.reportCollapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}"></i><span>${hasReadyResult ? (state.ai.reportCollapsed ? '展开报告' : '收起报告') : '收起报告'}</span>`;
      body.classList.toggle('hidden', hasReadyResult && state.ai.reportCollapsed);
      renderAiEvidenceModal(scope.textContent);
      if (state.ai.status === 'loading') {
        content.innerHTML = `<div class="ai-brief-grid"><div class="skeleton-card"><div class="skeleton-block" style="width:120px;"></div><div class="skeleton-block" style="margin-top:16px;width:100%;"></div><div class="skeleton-block" style="margin-top:10px;width:92%;"></div><div class="ai-meta-grid" style="margin-top:16px;">${Array.from({ length: 4 }).map(() => `<div class="skeleton-card"><div class="skeleton-block" style="width:60px;"></div><div class="skeleton-block" style="margin-top:14px;width:90px;height:24px;"></div><div class="skeleton-block" style="margin-top:10px;width:100%;"></div></div>`).join('')}</div></div><div class="ai-priority-grid">${Array.from({ length: 3 }).map(() => `<div class="skeleton-card"><div class="skeleton-block" style="width:72px;"></div><div class="skeleton-block" style="margin-top:14px;width:86%;height:22px;"></div><div class="skeleton-block" style="margin-top:14px;width:100%;"></div><div class="skeleton-block" style="margin-top:10px;width:96%;"></div><div class="skeleton-block" style="margin-top:10px;width:90%;"></div></div>`).join('')}</div></div>`;
        return;
      }
      if (state.ai.status === 'ready' && state.ai.result) {
        const result = state.ai.result;
        content.innerHTML = `<div class="ai-brief-grid"><div class="ai-overview-card"><div class="ai-overview-top"><div><div class="ai-overview-tags"><span class="toolbar-tag">当前报表:${reportDefinitions[state.currentReport].title}</span><span class="toolbar-tag">分析模式:${result.mode.label}</span><span class="ai-risk-chip" data-tone="${result.risk.tone}">${result.risk.label}</span></div><div class="ai-headline">${result.headline}</div><div class="ai-overview-text">${result.digest}</div></div></div><div class="ai-meta-grid">${result.overview.map(item => `<div class="ai-meta-card"><div class="ai-meta-label">${item.label}</div><div class="ai-meta-value">${item.value}</div><div class="ai-meta-hint">${item.hint}</div></div>`).join('')}</div></div><div class="ai-priority-section"><div class="ai-priority-head"><div><div class="section-title">优先关注事项</div><div class="section-sub" style="margin-top:6px;">按当前查询范围自动排序，先看结论，再看动作</div></div><span class="toolbar-tag">默认展示Top3</span></div><div class="ai-priority-grid">${renderAiPriorityCards(result.priorities)}</div></div><div class="ai-driver-card"><div class="ai-driver-head"><div><div class="section-title">主判断依据</div><div class="section-sub" style="margin-top:6px;">先说明这次判断依托的主要信号</div></div><button id="moreAiEvidenceBtn" type="button" class="btn btn-secondary"><i class="ri-file-list-3-line"></i><span>更多依据</span></button></div><div class="ai-driver-list">${result.driverSummary.map(item => `<div class="ai-driver-item">${item}</div>`).join('')}</div></div>`;
        return;
      }
      content.innerHTML = `<div class="ai-placeholder">${state.ai.message}</div>`;
    }
    function renderAll() { renderReportMenu(); renderFilters(); renderDatePicker(); renderStats(); renderTimelinessOverview(); renderTable(); renderAiAnalysis(); renderTimelinessDetailModal(); renderProductDetailModal(); renderColumnConfigModal(); }
    function setQuickRange(days) {
      const endDate = new Date(ANCHOR_DATE);
      const startDate = new Date(ANCHOR_DATE);
      startDate.setDate(startDate.getDate() - days + 1);
      state.filters.startDate = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
      state.filters.endDate = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
      state.filters.quickDays = days;
      syncDateTriggerText();
    }
    function resetFilters() {
      state.filters = {
        startDate: '2026-01-01',
        endDate: '2026-03-18',
        shipStartDate: '',
        shipEndDate: '',
        dateType: 'primary',
        customer: '',
        orderTypes: [...ORDER_TYPE_OPTIONS],
        orderStages: [...ORDER_STAGE_OPTIONS],
        trackStatuses: [...TRACK_STATUS_OPTIONS],
        businessTypes: isSingleBusinessTypeReport(state.currentReport) ? [TIMELINESS_BUSINESS_TYPE_OPTIONS[0]] : [...getReportBusinessTypeOptions(state.currentReport)],
        filterA: '',
        filterB: '',
        keyword: '',
        quickDays: 90,
        selectedWarehouses: [...COMMON_WAREHOUSES]
      };
      state.pagination.currentPage = 1;
      if (state.columnConfig.modalOpen) closeColumnConfigModal();
      closeTimelinessDetailModal();
      closeProductDetailModal();
      closeDatePicker();
      resetAiAnalysis('idle', '已恢复默认查询条件，点击生成AI分析可输出新的区间结论和优先关注事项。');
      renderAll();
    }
    function switchReport(reportKey) {
      if (!reportDefinitions[reportKey]) return;
      state.currentReport = reportKey;
      state.filters.customer = '';
      state.filters.shipStartDate = '';
      state.filters.shipEndDate = '';
      state.filters.dateType = 'primary';
      state.filters.orderTypes = [...ORDER_TYPE_OPTIONS];
      state.filters.orderStages = [...ORDER_STAGE_OPTIONS];
      state.filters.trackStatuses = [...TRACK_STATUS_OPTIONS];
      state.filters.businessTypes = isSingleBusinessTypeReport(reportKey) ? [TIMELINESS_BUSINESS_TYPE_OPTIONS[0]] : [...getReportBusinessTypeOptions(reportKey)];
      state.filters.filterA = '';
      state.filters.filterB = '';
      state.filters.keyword = '';
      state.pagination.currentPage = 1;
      if (state.columnConfig.modalOpen) closeColumnConfigModal();
      closeTimelinessDetailModal();
      closeProductDetailModal();
      closeDatePicker();
      resetAiAnalysis('idle', `已切换到${reportDefinitions[reportKey].title}，请重新生成区间分析。`);
      renderAll();
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
        document.getElementById('sidebarOverlay').classList.add('hidden');
      }
      showToast(`已切换到${reportDefinitions[reportKey].title}`);
    }
    function applyFiltersAndRenderTable() {
      if (!collectFilters()) return false;
      const activeField = isOrderReport() ? getCurrentDateField() : 'primary';
      const activeRange = getDateFieldRange(activeField);
      if (activeRange.start && activeRange.end && activeRange.start > activeRange.end) {
        showToast(`${getDateFieldLabel(activeField)}开始日期不能晚于结束日期`, 'error');
        return false;
      }
      state.pagination.currentPage = 1;
      closeTimelinessDetailModal();
      closeProductDetailModal();
      closeDatePicker();
      renderStats();
      renderTimelinessOverview();
      renderTable();
      return true;
    }
    function triggerAiAnalysis() {
      if (state.currentReport === 'order') {
        showToast('订单报表暂不支持AI分析功能', 'warning');
        return;
      }
      if (!applyFiltersAndRenderTable()) return;
      const rows = getFilteredRows();
      if (!rows.length) {
        resetAiAnalysis('empty', '没有命中明细数据，AI无法输出有效结论。');
        state.ai.generatedAt = formatSystemTime();
        renderAiAnalysis();
        showToast('暂无可分析数据', 'warning');
        return;
      }
      state.ai.requestId += 1;
      const requestId = state.ai.requestId;
      state.ai.status = 'loading';
      state.ai.generatedAt = '';
      state.ai.result = null;
      state.ai.message = 'AI正在读取当前查询范围，请稍候。';
      state.ai.reportCollapsed = false;
      state.ai.evidenceModalOpen = false;
      renderAiAnalysis();
      window.setTimeout(() => {
        if (requestId !== state.ai.requestId) return;
        state.ai.result = buildAiAnalysis(reportDefinitions[state.currentReport], rows);
        state.ai.status = 'ready';
        state.ai.generatedAt = formatSystemTime();
        state.ai.reportCollapsed = false;
        state.ai.evidenceModalOpen = false;
        renderAiAnalysis();
        showToast('AI分析已生成');
      }, 800);
    }
    function initEvents() {
      document.addEventListener('click', event => {
        const dateTrigger = event.target.closest('[data-date-trigger]');
        if (dateTrigger) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const field = getCurrentDateField();
          if (state.datePicker.open && state.datePicker.field === field) closeDatePicker();
          else openDatePicker(field);
          return;
        }
        const dateCell = event.target.closest('[data-date-cell]');
        if (dateCell) {
          event.preventDefault();
          event.stopImmediatePropagation();
          pickDateRangeValue(dateCell.dataset.dateCell);
          return;
        }
        const dateShortcut = event.target.closest('[data-date-shortcut]');
        if (dateShortcut) {
          event.preventDefault();
          event.stopImmediatePropagation();
          applyDateShortcut(dateShortcut.dataset.dateShortcut);
          return;
        }
        const reportTrigger = event.target.closest('[data-report]');
        if (reportTrigger) { switchReport(reportTrigger.dataset.report); return; }
        const productTrigger = event.target.closest('[data-product-detail]');
        if (productTrigger) {
          openProductDetailModal(productTrigger.dataset.productDetail);
          return;
        }
        const timelinessTrigger = event.target.closest('[data-timeliness-node-trigger]');
        if (timelinessTrigger) {
          openTimelinessDetailModal(timelinessTrigger.dataset.timelinessNodeTrigger, timelinessTrigger.dataset.timelinessDateTrigger || '');
          return;
        }
        const pageTrigger = event.target.closest('[data-page]');
        if (pageTrigger) {
          const page = Number(pageTrigger.dataset.page);
          if (!Number.isNaN(page)) { state.pagination.currentPage = page; renderTable(); }
        }
      });
      document.getElementById('queryBtn').addEventListener('click', () => {
        if (!applyFiltersAndRenderTable()) return;
        resetAiAnalysis('stale', '查询结果已更新，请点击更新分析获取最新区间结论。');
        renderAiAnalysis();
        showToast('查询成功');
      });
      document.getElementById('resetBtn').addEventListener('click', () => { resetFilters(); showToast('已重置查询条件'); });
      document.getElementById('exportBtn').addEventListener('click', () => {
        const total = getFilteredRows().length;
        if (total > 100000) { showToast('数据量过大,请缩小查询范围', 'warning'); return; }
        showToast(`正在导出，共${total}条数据`, 'warning');
      });
      document.getElementById('subscribeBtn').addEventListener('click', () => { showToast('已订阅当前报表日报'); });
      document.getElementById('columnConfigBtn').addEventListener('click', openColumnConfigModal);
      document.getElementById('aiAnalyzeBtn').addEventListener('click', triggerAiAnalysis);
      document.getElementById('closeColumnConfigBtn').addEventListener('click', closeColumnConfigModal);
      document.getElementById('cancelColumnConfigBtn').addEventListener('click', closeColumnConfigModal);
      document.getElementById('saveColumnConfigBtn').addEventListener('click', saveColumnConfigDraft);
      document.getElementById('resetColumnConfigBtn').addEventListener('click', resetColumnConfigDraft);
      document.getElementById('columnConfigSelectAllBtn').addEventListener('click', () => {
        state.columnConfig.draftFields = state.columnConfig.draftFields.map(field => ({ ...field, visible: true }));
        renderColumnConfigModal();
      });
      document.getElementById('clearPinnedFieldsBtn').addEventListener('click', clearDraftPinnedFields);
      document.getElementById('columnConfigBackdrop').addEventListener('click', closeColumnConfigModal);
      document.getElementById('toggleAiCollapseBtn').addEventListener('click', () => {
        if (!(state.ai.status === 'ready' && state.ai.result)) return;
        state.ai.reportCollapsed = !state.ai.reportCollapsed;
        renderAiAnalysis();
      });
      document.getElementById('closeAiEvidenceModalBtn').addEventListener('click', () => {
        state.ai.evidenceModalOpen = false;
        renderAiAnalysis();
      });
      document.getElementById('aiEvidenceBackdrop').addEventListener('click', () => {
        state.ai.evidenceModalOpen = false;
        renderAiAnalysis();
      });
      document.getElementById('closeTimelinessDetailBtn').addEventListener('click', closeTimelinessDetailModal);
      document.getElementById('timelinessDetailBackdrop').addEventListener('click', closeTimelinessDetailModal);
      document.getElementById('closeProductDetailBtn').addEventListener('click', closeProductDetailModal);
      document.getElementById('productDetailBackdrop').addEventListener('click', closeProductDetailModal);
      document.getElementById('closeDatePickerBtn').addEventListener('click', closeDatePicker);
      document.getElementById('cancelDatePickerBtn').addEventListener('click', closeDatePicker);
      document.getElementById('clearDatePickerBtn').addEventListener('click', clearDatePicker);
      document.getElementById('confirmDatePickerBtn').addEventListener('click', confirmDatePicker);
      document.getElementById('datePickerPrevBtn').addEventListener('click', () => shiftDatePickerMonth(-1));
      document.getElementById('datePickerNextBtn').addEventListener('click', () => shiftDatePickerMonth(1));
      document.getElementById('prevBtn').addEventListener('click', () => { if (state.pagination.currentPage > 1) { state.pagination.currentPage -= 1; renderTable(); } });
      document.getElementById('nextBtn').addEventListener('click', () => {
        const totalRows = state.currentReport === 'timeliness'
          ? buildTimelinessDailyRows(getFilteredRows(), getCurrentTimelinessBusinessType(state.filters.businessTypes)).length
          : getFilteredRows().length;
        const totalPages = Math.max(1, Math.ceil(totalRows / state.pagination.pageSize));
        if (state.pagination.currentPage < totalPages) { state.pagination.currentPage += 1; renderTable(); }
      });
      document.getElementById('pageSize').addEventListener('change', event => { state.pagination.pageSize = Number(event.target.value); state.pagination.currentPage = 1; renderTable(); });
      document.getElementById('dateTypeSelect').addEventListener('change', event => {
        state.filters.dateType = event.target.value || 'primary';
        syncDateTriggerText();
        if (state.datePicker.open) openDatePicker(state.filters.dateType);
      });
      document.getElementById('businessTypeBtn').addEventListener('click', event => {
        event.stopPropagation();
        document.getElementById('businessTypeDropdown').classList.toggle('hidden');
        document.getElementById('businessTypeBtn').setAttribute('aria-expanded', String(!document.getElementById('businessTypeDropdown').classList.contains('hidden')));
      });
      document.getElementById('orderStageBtn').addEventListener('click', event => {
        event.stopPropagation();
        document.getElementById('orderStageDropdown').classList.toggle('hidden');
        document.getElementById('orderStageBtn').setAttribute('aria-expanded', String(!document.getElementById('orderStageDropdown').classList.contains('hidden')));
      });
      document.getElementById('trackStatusBtn').addEventListener('click', event => {
        event.stopPropagation();
        document.getElementById('trackStatusDropdown').classList.toggle('hidden');
        document.getElementById('trackStatusBtn').setAttribute('aria-expanded', String(!document.getElementById('trackStatusDropdown').classList.contains('hidden')));
      });
      document.getElementById('selectAllBusinessTypes').addEventListener('change', event => {
        if (isSingleBusinessTypeReport(state.currentReport)) {
          event.target.checked = false;
          return;
        }
        const checked = event.target.checked;
        document.querySelectorAll('.business-type-checkbox').forEach(checkbox => { checkbox.checked = checked; });
        syncBusinessTypeSelection(checked ? [...getReportBusinessTypeOptions(state.currentReport)] : []);
      });
      document.getElementById('selectAllOrderStages').addEventListener('change', event => {
        const checked = event.target.checked;
        document.querySelectorAll('.order-stage-checkbox').forEach(checkbox => { checkbox.checked = checked; });
        syncOrderStageSelection(checked ? [...ORDER_STAGE_OPTIONS] : []);
      });
      document.getElementById('selectAllTrackStatuses').addEventListener('change', event => {
        const checked = event.target.checked;
        document.querySelectorAll('.track-status-checkbox').forEach(checkbox => { checkbox.checked = checked; });
        syncTrackStatusSelection(checked ? [...TRACK_STATUS_OPTIONS] : []);
      });
      document.addEventListener('change', event => {
        const columnToggle = event.target.closest('[data-column-toggle]');
        if (columnToggle) {
          setDraftFieldVisible(columnToggle.dataset.columnToggle, columnToggle.checked);
          return;
        }
        if (event.target.classList.contains('business-type-checkbox')) {
          if (isSingleBusinessTypeReport(state.currentReport)) {
            document.querySelectorAll('.business-type-checkbox').forEach(checkbox => {
              if (checkbox !== event.target) checkbox.checked = false;
            });
            if (!event.target.checked && !getSelectedBusinessTypes().length) {
              event.target.checked = true;
              showToast('时效报表必须保留1个业务类型', 'warning');
            }
            refreshTimelinessNodeFilterOptions(getSelectedBusinessTypes());
          }
          syncBusinessTypeSelection(getSelectedBusinessTypes());
          return;
        }
        if (event.target.classList.contains('order-stage-checkbox')) {
          syncOrderStageSelection(getSelectedOrderStages());
          return;
        }
        if (event.target.classList.contains('track-status-checkbox')) {
          syncTrackStatusSelection(getSelectedTrackStatuses());
        }
      });
      document.getElementById('warehouseBtn').addEventListener('click', event => { event.stopPropagation(); document.getElementById('warehouseDropdown').classList.toggle('hidden'); });
      document.getElementById('selectAllWarehouses').addEventListener('change', event => { const checked = event.target.checked; document.querySelectorAll('.warehouse-checkbox').forEach(checkbox => { checkbox.checked = checked; }); });
      document.querySelectorAll('.warehouse-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          const selectedWarehouses = getSelectedHeaderWarehouses();
          const selectAll = document.getElementById('selectAllWarehouses');
          selectAll.checked = selectedWarehouses.length === COMMON_WAREHOUSES.length;
          selectAll.indeterminate = selectedWarehouses.length > 0 && selectedWarehouses.length < COMMON_WAREHOUSES.length;
        });
      });
      document.getElementById('applyWarehouseBtn').addEventListener('click', () => {
        const selectedWarehouses = getSelectedHeaderWarehouses();
        if (!selectedWarehouses.length) { showToast('请至少选择1个仓库', 'warning'); return; }
        state.filters.selectedWarehouses = [...selectedWarehouses];
        syncHeaderWarehouseSelection(selectedWarehouses);
        document.getElementById('warehouseDropdown').classList.add('hidden');
        state.pagination.currentPage = 1;
        closeTimelinessDetailModal();
        closeProductDetailModal();
        renderStats();
        renderTimelinessOverview();
        resetAiAnalysis('stale', '仓库范围已更新，请点击更新分析获取最新区间结论。');
        renderTable();
        renderAiAnalysis();
        showToast(selectedWarehouses.length === 1 ? `已切换到${selectedWarehouses[0]}` : `已切换${selectedWarehouses.length}个仓库范围`);
      });
      document.getElementById('menuToggle').addEventListener('click', () => { document.getElementById('sidebar').classList.remove('-translate-x-full'); document.getElementById('sidebarOverlay').classList.remove('hidden'); });
      document.getElementById('sidebarOverlay').addEventListener('click', () => { document.getElementById('sidebar').classList.add('-translate-x-full'); document.getElementById('sidebarOverlay').classList.add('hidden'); });
      document.addEventListener('click', event => {
        const columnRemoveTrigger = event.target.closest('[data-column-remove]');
        if (columnRemoveTrigger) {
          removeDraftField(columnRemoveTrigger.dataset.columnRemove);
          return;
        }
        const columnTopTrigger = event.target.closest('[data-column-top]');
        if (columnTopTrigger) {
          moveDraftFieldToTop(columnTopTrigger.dataset.columnTop);
          return;
        }
        const columnPinTrigger = event.target.closest('[data-column-pin]');
        if (columnPinTrigger) {
          toggleDraftFieldPinned(columnPinTrigger.dataset.columnPin);
          return;
        }
        const columnMoveTrigger = event.target.closest('[data-column-move]');
        if (columnMoveTrigger) {
          moveDraftField(columnMoveTrigger.dataset.columnKey, columnMoveTrigger.dataset.columnMove);
          return;
        }
        const moreEvidenceTrigger = event.target.closest('#moreAiEvidenceBtn');
        if (moreEvidenceTrigger) {
          if (!(state.ai.status === 'ready' && state.ai.result)) return;
          state.ai.evidenceModalOpen = true;
          renderAiAnalysis();
          return;
        }
        if (!document.getElementById('warehouseSelector').contains(event.target)) document.getElementById('warehouseDropdown').classList.add('hidden');
        if (!document.getElementById('businessTypeSelector').contains(event.target)) closeBusinessTypeDropdown();
        if (!document.getElementById('orderStageSelector').contains(event.target)) closeOrderStageDropdown();
        if (!document.getElementById('trackStatusSelector').contains(event.target)) closeTrackStatusDropdown();
        if (state.datePicker.open && !document.getElementById('dateRangePickerPopover').contains(event.target) && !event.target.closest('[data-date-trigger]')) closeDatePicker();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          if (state.columnConfig.modalOpen) {
            closeColumnConfigModal();
            return;
          }
          if (state.timeliness.detailOpen) {
            closeTimelinessDetailModal();
          }
          if (state.ai.evidenceModalOpen) {
            state.ai.evidenceModalOpen = false;
            renderAiAnalysis();
          }
          if (state.productDetail.open) {
            closeProductDetailModal();
          }
          if (state.datePicker.open) {
            closeDatePicker();
          }
          closeBusinessTypeDropdown();
          closeOrderStageDropdown();
          closeTrackStatusDropdown();
          if (window.innerWidth < 768) { document.getElementById('sidebar').classList.add('-translate-x-full'); document.getElementById('sidebarOverlay').classList.add('hidden'); }
        }
      });
      document.addEventListener('dragstart', event => {
        const row = event.target.closest('[data-column-drag-key]');
        if (!row) return;
        state.columnConfig.draggingKey = row.dataset.columnDragKey;
        state.columnConfig.dragOverKey = '';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', state.columnConfig.draggingKey);
      });
      document.addEventListener('dragover', event => {
        const row = event.target.closest('[data-column-drag-key]');
        if (!row || !state.columnConfig.draggingKey) return;
        event.preventDefault();
        state.columnConfig.dragOverKey = row.dataset.columnDragKey;
      });
      document.addEventListener('drop', event => {
        const row = event.target.closest('[data-column-drag-key]');
        if (!row || !state.columnConfig.draggingKey) return;
        event.preventDefault();
        reorderDraftField(state.columnConfig.draggingKey, row.dataset.columnDragKey);
        state.columnConfig.draggingKey = '';
        state.columnConfig.dragOverKey = '';
        renderColumnConfigModal();
      });
      document.addEventListener('dragend', () => {
        state.columnConfig.draggingKey = '';
        state.columnConfig.dragOverKey = '';
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
          document.getElementById('sidebar').classList.remove('-translate-x-full');
          document.getElementById('sidebarOverlay').classList.add('hidden');
        }
        if (state.datePicker.open) positionDatePickerPopover();
      });
    }
    document.addEventListener('DOMContentLoaded', () => {
      Chart.defaults.font.family = '"PingFang SC","Microsoft YaHei","Helvetica Neue",Arial,sans-serif';
      Chart.defaults.color = '#627388';
      if (window.innerWidth >= 768) document.getElementById('sidebar').classList.remove('-translate-x-full');
      initEvents();
      const pendingNavigation = consumeCrossPageReportNavigation();
      if (!applyCrossPageReportNavigation(pendingNavigation)) renderAll();
    });
