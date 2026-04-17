(function () {
  const STORAGE_KEY = 'sdmsAggregateWorkbenchState';
  const PAGE_SIZE_OPTIONS = [20, 50, 100];
  const DEFAULT_PAGE_SIZE = 20;
  const COUNTRIES = [
    { code: 'US', name: '美国' },
    { code: 'GB', name: '英国' },
    { code: 'DE', name: '德国' },
    { code: 'FR', name: '法国' },
    { code: 'CA', name: '加拿大' },
    { code: 'JP', name: '日本' },
    { code: 'AE', name: '阿联酋' },
    { code: 'AU', name: '澳大利亚' },
    { code: 'SG', name: '新加坡' },
    { code: 'NL', name: '荷兰' }
  ];
  const CUSTOMERS = [
    { id: 'C001', name: 'Anker跨境' },
    { id: 'C002', name: 'SHEIN华南' },
    { id: 'C003', name: 'Temu直发' },
    { id: 'C004', name: 'Lazada华南' },
    { id: 'C005', name: '菜鸟云配' },
    { id: 'C006', name: '敏捷供应链' },
    { id: 'C007', name: 'JDSmart海外' },
    { id: 'C008', name: 'TikTok优选' }
  ];
  const WAREHOUSES = ['深圳兴围仓', '广州白云仓', '香港葵涌仓', '义乌保税仓'];
  const BUSINESS_TYPES = ['干线', '备货', '退件重派'];
  const ORDER_STAGES = ['待审核', '处理中', '已发货', '已签收', '异常'];
  const CARRIERS = ['DHL', 'UPS', 'FedEx', 'YunExpress', '4PX'];
  const ORDER_SOURCES = ['客户下单', '客服建单', 'API下单'];
  const PRODUCT_CATALOG = [
    { category: '3C配件', names: ['蓝牙耳机', '充电底座', '数据线套装', '移动电源', '车载支架'] },
    { category: '服饰鞋包', names: ['运动卫衣', '轻量羽绒服', '通勤双肩包', '休闲板鞋', '工装外套'] },
    { category: '家居日用', names: ['折叠收纳箱', '厨房置物架', '保温杯', '简易衣架', '拖地套装'] },
    { category: '美妆个护', names: ['电动牙刷', '修护面膜', '护发精油', '洁面套装', '防晒喷雾'] },
    { category: '母婴用品', names: ['婴儿湿巾', '恒温奶瓶', '宝宝餐具', '围兜礼盒', '学步杯'] }
  ];
  const UNITS = ['件', '箱', '托'];
  const DIMENSIONS = {
    customer: {
      code: 'customer',
      label: '客户/货主',
      icon: 'ri-user-star-line',
      note: '聚焦客户订单规模、国家覆盖与商品结构，适合做客户排名和重点客户复盘。',
      drilldown: ['客户/货主', '派送国家', '商品构成'],
      field: 'customerName',
      keyField: 'customerId',
      defaultMetric: 'orderCount',
      countLabel: '客户数',
      relatedLabel: '覆盖国家数',
      relatedValue: row => row.countryCount,
      drilldownDimension: 'deliveryCountry',
      drilldownColumnLabel: '派送国家',
      badge: '常用'
    },
    deliveryCountry: {
      code: 'deliveryCountry',
      label: '派送国家',
      icon: 'ri-earth-line',
      note: '适合做国家出货量分析、国家结构变化分析和国家下客户分布下钻。',
      drilldown: ['派送国家', '客户/货主', '商品构成'],
      field: 'deliveryCountryName',
      keyField: 'deliveryCountryCode',
      defaultMetric: 'orderCount',
      countLabel: '国家数',
      relatedLabel: '覆盖客户数',
      relatedValue: row => row.customerCount,
      drilldownDimension: 'customer',
      drilldownColumnLabel: '客户/货主',
      badge: '核心'
    },
    warehouse: {
      code: 'warehouse',
      label: '仓库',
      icon: 'ri-building-2-line',
      note: '适合看仓库承压、业务结构和不同仓库的出货承接情况。',
      drilldown: ['仓库', '派送国家', '商品构成'],
      field: 'warehouse',
      keyField: 'warehouse',
      defaultMetric: 'orderCount',
      countLabel: '仓库数',
      relatedLabel: '覆盖国家数',
      relatedValue: row => row.countryCount,
      drilldownDimension: 'deliveryCountry',
      drilldownColumnLabel: '派送国家',
      badge: '扩展'
    },
    carrier: {
      code: 'carrier',
      label: '承运商',
      icon: 'ri-truck-line',
      note: '适合做承运商出货承接结构分析，排查国家分布和履约风险。',
      drilldown: ['承运商', '派送国家', '商品构成'],
      field: 'carrier',
      keyField: 'carrier',
      defaultMetric: 'weight',
      countLabel: '承运商数',
      relatedLabel: '覆盖国家数',
      relatedValue: row => row.countryCount,
      drilldownDimension: 'deliveryCountry',
      drilldownColumnLabel: '派送国家',
      badge: '扩展'
    },
    orderSource: {
      code: 'orderSource',
      label: '订单来源',
      icon: 'ri-share-forward-line',
      note: '适合识别API下单、客服建单与客户下单的结构变化和异常来源。',
      drilldown: ['订单来源', '客户/货主', '商品构成'],
      field: 'orderSource',
      keyField: 'orderSource',
      defaultMetric: 'orderCount',
      countLabel: '来源数',
      relatedLabel: '覆盖客户数',
      relatedValue: row => row.customerCount,
      drilldownDimension: 'customer',
      drilldownColumnLabel: '客户/货主',
      badge: '扩展'
    },
    businessType: {
      code: 'businessType',
      label: '业务类型',
      icon: 'ri-apps-2-line',
      note: '适合看不同业务类型的规模、商品结构和派送国家分布差异。',
      drilldown: ['业务类型', '派送国家', '商品构成'],
      field: 'businessType',
      keyField: 'businessType',
      defaultMetric: 'orderCount',
      countLabel: '业务类型数',
      relatedLabel: '覆盖国家数',
      relatedValue: row => row.countryCount,
      drilldownDimension: 'deliveryCountry',
      drilldownColumnLabel: '派送国家',
      badge: '扩展'
    }
  };
  const METRICS = {
    orderCount: {
      code: 'orderCount',
      label: '订单量',
      icon: 'ri-file-list-3-line',
      value: row => row.orderCount,
      format: value => formatNumber(value),
      unitLabel: '单'
    },
    skuKindCount: {
      code: 'skuKindCount',
      label: '商品种类数',
      icon: 'ri-price-tag-3-line',
      value: row => row.skuKindCount,
      format: value => formatNumber(value),
      unitLabel: '种'
    },
    itemQty: {
      code: 'itemQty',
      label: '商品数量',
      icon: 'ri-stack-line',
      value: row => row.itemQty,
      format: value => formatNumber(value),
      unitLabel: '件'
    },
    weight: {
      code: 'weight',
      label: '重量',
      icon: 'ri-scales-3-line',
      value: row => row.weight,
      format: value => `${formatNumber(value, 1)}kg`,
      unitLabel: 'kg'
    },
    volume: {
      code: 'volume',
      label: '体积',
      icon: 'ri-box-3-line',
      value: row => row.volume,
      format: value => `${formatNumber(value, 2)}m³`,
      unitLabel: 'm³'
    }
  };
  const COMPARE_OPTIONS = {
    previous: {
      code: 'previous',
      label: '上一同周期',
      shortLabel: '环比',
      description: '当前周期与上一同长度周期对比'
    },
    off: {
      code: 'off',
      label: '仅看当前周期',
      shortLabel: '当前周期',
      description: '关闭环比，仅展示当前周期聚合结果'
    }
  };
  const state = {
    dimension: 'customer',
    metric: 'orderCount',
    compareMode: 'previous',
    filters: {
      dateType: 'shipDate',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      warehouse: '',
      businessType: '',
      orderStage: '',
      customer: '',
      country: '',
      keyword: ''
    },
    sort: {
      key: 'orderCount',
      direction: 'desc'
    },
    pagination: {
      currentPage: 1,
      pageSize: DEFAULT_PAGE_SIZE
    },
    drawer: {
      open: false,
      key: '',
      tab: 'overview'
    }
  };
  const charts = {
    top: null,
    compare: null,
    share: null,
    drawerTrend: null
  };

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatDateOnly(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

  function toDateTimeText(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  }

  function formatNumber(value, digits) {
    const safeDigits = typeof digits === 'number' ? digits : 0;
    return Number(value || 0).toLocaleString('zh-CN', {
      minimumFractionDigits: safeDigits,
      maximumFractionDigits: safeDigits
    });
  }

  function formatRate(rate) {
    if (rate === null || rate === undefined || Number.isNaN(rate)) return '--';
    return `${(Number(rate) * 100).toFixed(1)}%`;
  }

  function formatDelta(rate) {
    if (rate === null || rate === undefined || Number.isNaN(rate)) return '--';
    if (rate === Infinity) return '新增';
    const prefix = rate > 0 ? '+' : '';
    return `${prefix}${(rate * 100).toFixed(1)}%`;
  }

  function deltaClass(rate) {
    if (rate === null || rate === undefined || Number.isNaN(rate) || rate === 0) return 'delta-flat';
    return rate > 0 ? 'delta-up' : 'delta-down';
  }

  function quantitySummary(items) {
    if (!items.length) return '--';
    return items.map(item => `${item.unit}:${formatNumber(item.qty)}`).join('；');
  }

  function getTimeValue(text) {
    if (!text) return 0;
    return new Date(String(text).replace(' ', 'T')).getTime();
  }

  function getRangeLength(startDate, endDate) {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) return 0;
    return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
  }

  function getPreviousRange(startDate, endDate) {
    const start = parseDateOnly(startDate);
    const days = getRangeLength(startDate, endDate);
    if (!start || !days) return { startDate: '', endDate: '' };
    const previousEnd = addDays(start, -1);
    const previousStart = addDays(previousEnd, -(days - 1));
    return {
      startDate: formatDateOnly(previousStart),
      endDate: formatDateOnly(previousEnd)
    };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function hashText(text) {
    let hash = 0;
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function pickWeighted(list, seed, weights) {
    const total = weights.reduce((sum, value) => sum + value, 0);
    const target = seed % total;
    let cursor = 0;
    for (let index = 0; index < list.length; index += 1) {
      cursor += weights[index];
      if (target < cursor) return list[index];
    }
    return list[0];
  }

  function buildOrderProducts(orderNo, totalQty, seed) {
    const productCount = 2 + (seed % 3);
    const rows = [];
    let remaining = totalQty;
    for (let index = 0; index < productCount; index += 1) {
      const catalog = PRODUCT_CATALOG[(seed + index) % PRODUCT_CATALOG.length];
      const unit = UNITS[(seed + index * 2) % UNITS.length];
      const skuName = catalog.names[(seed + index * 3) % catalog.names.length];
      const slotsLeft = productCount - index;
      const qty = index === productCount - 1
        ? remaining
        : Math.max(1, Math.min(remaining - (slotsLeft - 1), Math.round(remaining / slotsLeft)));
      remaining -= qty;
      rows.push({
        skuCode: `${orderNo}-SKU${pad(index + 1)}`,
        skuName,
        category: catalog.category,
        qty,
        unit
      });
    }
    return rows;
  }

  function buildOrders() {
    const result = [];
    const startDate = parseDateOnly('2025-12-25');
    const endDate = parseDateOnly('2026-04-03');
    const customerWeights = [26, 22, 20, 18, 14, 12, 10, 8];
    const countryWeights = [28, 18, 16, 14, 12, 10, 8, 8, 6, 5];
    const warehouseWeights = [26, 20, 18, 12];
    const businessWeights = [26, 22, 10];
    const sourceWeights = [22, 14, 16];
    const carrierWeights = [24, 22, 18, 16, 12];
    let sequence = 1;
    for (let cursor = new Date(startDate); cursor <= endDate; cursor = addDays(cursor, 1)) {
      const offset = Math.floor((cursor.getTime() - startDate.getTime()) / 86400000);
      const baseCount = 14 + (offset % 5) + (offset % 7);
      const dailyCount = offset % 9 === 0 ? baseCount + 6 : baseCount;
      for (let index = 0; index < dailyCount; index += 1) {
        const seed = hashText(`${formatDateOnly(cursor)}-${index}`);
        const customer = pickWeighted(CUSTOMERS, seed, customerWeights);
        const country = pickWeighted(COUNTRIES, seed + 7, countryWeights);
        const warehouse = pickWeighted(WAREHOUSES, seed + 9, warehouseWeights);
        const businessType = pickWeighted(BUSINESS_TYPES, seed + 11, businessWeights);
        const orderSource = pickWeighted(ORDER_SOURCES, seed + 13, sourceWeights);
        const carrier = pickWeighted(CARRIERS, seed + 17, carrierWeights);
        const orderDate = new Date(cursor);
        orderDate.setHours(8 + (seed % 10), (seed * 7) % 60, 0, 0);
        const shipDate = addDays(orderDate, 1 + (seed % 4));
        shipDate.setHours(10 + (seed % 7), (seed * 13) % 60, 0, 0);
        const stageBucket = seed % 12;
        const orderStage = stageBucket <= 1
          ? '待审核'
          : stageBucket <= 4
            ? '处理中'
            : stageBucket <= 8
              ? '已发货'
              : stageBucket <= 10
                ? '已签收'
                : '异常';
        const weight = 68 + (seed % 12) * 8 + (businessType === '干线' ? 48 : businessType === '备货' ? 22 : 10);
        const volume = 0.42 + (seed % 9) * 0.18 + (businessType === '干线' ? 0.52 : businessType === '备货' ? 0.24 : 0.1);
        const totalQty = 10 + (seed % 18) + (businessType === '备货' ? 24 : businessType === '干线' ? 12 : 6);
        const orderNo = `OD${cursor.getFullYear()}${pad(cursor.getMonth() + 1)}${pad(cursor.getDate())}${pad(sequence)}`;
        result.push({
          orderId: `ORD-${sequence}`,
          orderNo,
          orderDate: toDateTimeText(orderDate),
          shipDate: orderStage === '待审核' ? '' : toDateTimeText(shipDate),
          customerId: customer.id,
          customerName: customer.name,
          deliveryCountryCode: country.code,
          deliveryCountryName: country.name,
          warehouse,
          businessType,
          orderSource,
          carrier,
          orderStage,
          weight,
          volume,
          products: buildOrderProducts(orderNo, totalQty, seed)
        });
        sequence += 1;
      }
    }
    return result.sort((left, right) => getTimeValue(right.orderDate) - getTimeValue(left.orderDate));
  }

  const orders = buildOrders();

  function createOptions(select, items, emptyLabel) {
    select.innerHTML = [`<option value="">${emptyLabel}</option>`, ...items.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`)].join('');
  }

  function createDatalist(list, items) {
    list.innerHTML = items.map(item => `<option value="${escapeHtml(item)}"></option>`).join('');
  }

  function getDimensionConfig() {
    return DIMENSIONS[state.dimension];
  }

  function getMetricConfig(metricCode) {
    return METRICS[metricCode || state.metric];
  }

  function loadSavedState() {
    try {
      const text = window.localStorage.getItem(STORAGE_KEY);
      if (!text) return;
      const saved = JSON.parse(text);
      if (saved.dimension && DIMENSIONS[saved.dimension]) state.dimension = saved.dimension;
      if (saved.metric && METRICS[saved.metric]) state.metric = saved.metric;
      if (saved.compareMode && COMPARE_OPTIONS[saved.compareMode]) state.compareMode = saved.compareMode;
      if (saved.filters) state.filters = { ...state.filters, ...saved.filters };
      if (saved.sort?.key) state.sort = { ...state.sort, ...saved.sort };
      if (PAGE_SIZE_OPTIONS.includes(saved.pagination?.pageSize)) {
        state.pagination.pageSize = saved.pagination.pageSize;
      }
    } catch (error) {
      console.warn('loadSavedState failed', error);
    }
  }

  function persistState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      dimension: state.dimension,
      metric: state.metric,
      compareMode: state.compareMode,
      filters: state.filters,
      sort: state.sort,
      pagination: { pageSize: state.pagination.pageSize }
    }));
  }

  function syncFilterValues() {
    document.getElementById('dateType').value = state.filters.dateType;
    document.getElementById('startDate').value = state.filters.startDate;
    document.getElementById('endDate').value = state.filters.endDate;
    document.getElementById('warehouse').value = state.filters.warehouse;
    document.getElementById('businessType').value = state.filters.businessType;
    document.getElementById('orderStage').value = state.filters.orderStage;
    document.getElementById('customerFilter').value = state.filters.customer;
    document.getElementById('countryFilter').value = state.filters.country;
    document.getElementById('keyword').value = state.filters.keyword;
    document.getElementById('pageSize').value = String(state.pagination.pageSize);
  }

  function populateFilters() {
    createOptions(document.getElementById('warehouse'), WAREHOUSES, '全部仓库');
    createOptions(document.getElementById('businessType'), BUSINESS_TYPES, '全部业务类型');
    createOptions(document.getElementById('orderStage'), ORDER_STAGES, '全部订单阶段');
    createDatalist(document.getElementById('customerOptions'), CUSTOMERS.map(item => item.name));
    createDatalist(document.getElementById('countryOptions'), COUNTRIES.map(item => item.name));
    syncFilterValues();
  }

  function collectFilters() {
    const next = {
      dateType: document.getElementById('dateType').value || 'shipDate',
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      warehouse: document.getElementById('warehouse').value,
      businessType: document.getElementById('businessType').value,
      orderStage: document.getElementById('orderStage').value,
      customer: document.getElementById('customerFilter').value.trim(),
      country: document.getElementById('countryFilter').value.trim(),
      keyword: document.getElementById('keyword').value.trim()
    };
    if (!next.startDate || !next.endDate) {
      showToast('请选择完整的统计周期', 'warning');
      return false;
    }
    if (next.startDate > next.endDate) {
      showToast('开始日期不能大于结束日期', 'warning');
      return false;
    }
    state.filters = next;
    return true;
  }

  function matchOrderFilters(order, filters, range) {
    const activeDate = filters.dateType === 'shipDate' ? order.shipDate : order.orderDate;
    const activeDay = activeDate ? activeDate.slice(0, 10) : '';
    const keyword = filters.keyword.toLowerCase();
    const matchDate = Boolean(activeDay) && (!range.start || activeDay >= range.start) && (!range.end || activeDay <= range.end);
    const matchWarehouse = !filters.warehouse || order.warehouse === filters.warehouse;
    const matchBusinessType = !filters.businessType || order.businessType === filters.businessType;
    const matchStage = !filters.orderStage || order.orderStage === filters.orderStage;
    const matchCustomer = !filters.customer || order.customerName === filters.customer;
    const matchCountry = !filters.country || order.deliveryCountryName === filters.country;
    const matchKeyword = !keyword || [
      order.orderNo,
      order.customerName,
      order.deliveryCountryName,
      order.carrier,
      order.orderSource,
      order.businessType
    ].some(value => String(value).toLowerCase().includes(keyword));
    return matchDate && matchWarehouse && matchBusinessType && matchStage && matchCustomer && matchCountry && matchKeyword;
  }

  function getFilteredOrdersForRange(range) {
    return orders.filter(order => matchOrderFilters(order, state.filters, range));
  }

  function ensureBucket(order, buckets) {
    const dimension = getDimensionConfig();
    const key = order[dimension.keyField] || order[dimension.field] || '--';
    if (buckets.has(key)) return buckets.get(key);
    const bucket = {
      key,
      label: order[dimension.field] || '--',
      orderCount: 0,
      itemQty: 0,
      weight: 0,
      volume: 0,
      customerSet: new Set(),
      countrySet: new Set(),
      warehouseSet: new Set(),
      skuSet: new Set(),
      quantityMap: new Map(),
      productMap: new Map(),
      timeline: new Map(),
      latestDate: '',
      orderNos: []
    };
    buckets.set(key, bucket);
    return bucket;
  }

  function pushTimeline(bucket, order) {
    const activeDate = (state.filters.dateType === 'shipDate' ? order.shipDate : order.orderDate).slice(0, 10);
    if (!bucket.timeline.has(activeDate)) {
      bucket.timeline.set(activeDate, {
        orderCount: 0,
        itemQty: 0,
        weight: 0,
        volume: 0,
        skuSet: new Set()
      });
    }
    const timeline = bucket.timeline.get(activeDate);
    timeline.orderCount += 1;
    timeline.weight += order.weight;
    timeline.volume += order.volume;
    order.products.forEach(item => {
      timeline.itemQty += item.qty;
      timeline.skuSet.add(item.skuCode);
    });
  }

  function pushProductStats(bucket, order) {
    order.products.forEach(item => {
      bucket.itemQty += item.qty;
      bucket.skuSet.add(item.skuCode);
      bucket.quantityMap.set(item.unit, (bucket.quantityMap.get(item.unit) || 0) + item.qty);
      if (!bucket.productMap.has(item.skuCode)) {
        bucket.productMap.set(item.skuCode, {
          skuCode: item.skuCode,
          skuName: item.skuName,
          category: item.category,
          orderCount: 0,
          quantityMap: new Map()
        });
      }
      const product = bucket.productMap.get(item.skuCode);
      product.orderCount += 1;
      product.quantityMap.set(item.unit, (product.quantityMap.get(item.unit) || 0) + item.qty);
    });
  }

  function aggregateOrders(sourceOrders) {
    const buckets = new Map();
    sourceOrders.forEach(order => {
      const bucket = ensureBucket(order, buckets);
      bucket.orderCount += 1;
      bucket.weight += order.weight;
      bucket.volume += order.volume;
      bucket.customerSet.add(order.customerId);
      bucket.countrySet.add(order.deliveryCountryCode);
      bucket.warehouseSet.add(order.warehouse);
      bucket.orderNos.push(order.orderNo);
      bucket.latestDate = bucket.latestDate && bucket.latestDate > order.orderDate ? bucket.latestDate : order.orderDate;
      pushProductStats(bucket, order);
      pushTimeline(bucket, order);
    });
    return Array.from(buckets.values()).map(bucket => ({
      key: bucket.key,
      label: bucket.label,
      orderCount: bucket.orderCount,
      skuKindCount: bucket.skuSet.size,
      itemQty: bucket.itemQty,
      weight: bucket.weight,
      volume: bucket.volume,
      customerCount: bucket.customerSet.size,
      countryCount: bucket.countrySet.size,
      warehouseCount: bucket.warehouseSet.size,
      quantityByUnit: Array.from(bucket.quantityMap.entries()).map(([unit, qty]) => ({ unit, qty })).sort((left, right) => right.qty - left.qty),
      products: Array.from(bucket.productMap.values()).map(product => ({
        skuCode: product.skuCode,
        skuName: product.skuName,
        category: product.category,
        orderCount: product.orderCount,
        quantityByUnit: Array.from(product.quantityMap.entries()).map(([unit, qty]) => ({ unit, qty })).sort((left, right) => right.qty - left.qty),
        itemQty: Array.from(product.quantityMap.values()).reduce((sum, qty) => sum + qty, 0)
      })).sort((left, right) => right.itemQty - left.itemQty),
      latestDate: bucket.latestDate,
      orderNos: bucket.orderNos,
      timeline: Array.from(bucket.timeline.entries()).map(([date, metrics]) => ({
        date,
        orderCount: metrics.orderCount,
        skuKindCount: metrics.skuSet.size,
        itemQty: metrics.itemQty,
        weight: metrics.weight,
        volume: metrics.volume
      })).sort((left, right) => left.date.localeCompare(right.date))
    }));
  }

  function enrichRows(currentRows, previousRows) {
    const metric = getMetricConfig();
    const totalMetric = currentRows.reduce((sum, row) => sum + metric.value(row), 0);
    const previousMap = new Map(previousRows.map(row => [row.key, row]));
    return currentRows.map(row => {
      const previous = previousMap.get(row.key);
      const currentValue = metric.value(row);
      const previousValue = previous ? metric.value(previous) : 0;
      let changeRate = null;
      if (state.compareMode !== 'off') {
        changeRate = previousValue === 0 ? (currentValue > 0 ? Infinity : 0) : (currentValue - previousValue) / previousValue;
      }
      return {
        ...row,
        currentMetricValue: currentValue,
        previousMetricValue: previousValue,
        changeRate,
        share: totalMetric ? currentValue / totalMetric : 0
      };
    });
  }

  function normalizeRate(rate) {
    if (rate === Infinity) return 999;
    if (rate === null || rate === undefined || Number.isNaN(rate)) return -999;
    return rate;
  }

  function compareRows(left, right, key, direction) {
    const factor = direction === 'asc' ? 1 : -1;
    let leftValue;
    let rightValue;
    if (key === 'changeRate') {
      leftValue = normalizeRate(left.changeRate);
      rightValue = normalizeRate(right.changeRate);
    } else if (key === 'label') {
      return left.label.localeCompare(right.label, 'zh-CN') * factor;
    } else {
      leftValue = typeof left[key] === 'number' ? left[key] : 0;
      rightValue = typeof right[key] === 'number' ? right[key] : 0;
    }
    if (leftValue === rightValue) return left.label.localeCompare(right.label, 'zh-CN');
    return leftValue > rightValue ? factor : -factor;
  }

  function getComputedData() {
    const currentRange = { start: state.filters.startDate, end: state.filters.endDate };
    const previousRange = getPreviousRange(state.filters.startDate, state.filters.endDate);
    const currentOrders = getFilteredOrdersForRange(currentRange);
    const previousOrders = state.compareMode === 'off' ? [] : getFilteredOrdersForRange({ start: previousRange.startDate, end: previousRange.endDate });
    const currentRows = aggregateOrders(currentOrders);
    const previousRows = aggregateOrders(previousOrders);
    const rows = enrichRows(currentRows, previousRows).sort((left, right) => compareRows(left, right, state.sort.key, state.sort.direction));
    return {
      currentOrders,
      previousOrders,
      previousRange,
      rows,
      totalMetricValue: rows.reduce((sum, row) => sum + row.currentMetricValue, 0)
    };
  }

  function renderDimensionCards() {
    const container = document.getElementById('dimensionGrid');
    container.innerHTML = Object.values(DIMENSIONS).map(item => `
      <button type="button" class="dimension-card ${item.code === state.dimension ? 'active' : ''}" data-dimension="${item.code}">
        <div class="dimension-card-head">
          <span class="dimension-icon"><i class="${item.icon}"></i></span>
          <span class="dimension-card-badge">${item.badge}</span>
        </div>
        <div class="dimension-name">${item.label}</div>
        <div class="dimension-note">${item.note}</div>
        <div class="dimension-path">${item.drilldown.map((step, index) => `${index ? '<i class="ri-arrow-right-s-line"></i>' : ''}<span>${step}</span>`).join('')}</div>
      </button>
    `).join('');
  }

  function renderMetricChips() {
    document.getElementById('metricChips').innerHTML = Object.values(METRICS).map(item => `
      <button type="button" class="metric-chip ${item.code === state.metric ? 'active' : ''}" data-metric="${item.code}">
        <i class="${item.icon}"></i><span>${item.label}</span>
      </button>
    `).join('');
  }

  function renderCompareChips() {
    document.getElementById('compareChips').innerHTML = Object.values(COMPARE_OPTIONS).map(item => `
      <button type="button" class="compare-chip ${item.code === state.compareMode ? 'active' : ''}" data-compare="${item.code}">
        <span>${item.label}</span>
      </button>
    `).join('');
  }

  function renderScopeMeta(data) {
    const metric = getMetricConfig();
    const compare = COMPARE_OPTIONS[state.compareMode];
    document.getElementById('scopeMeta').innerHTML = [
      `当前周期:${state.filters.startDate}至${state.filters.endDate}`,
      `比较方式:${compare.label}`,
      `样本订单:${formatNumber(data.currentOrders.length)}单`,
      `主指标:${metric.label}`
    ].map(item => `<span class="toolbar-tag">${escapeHtml(item)}</span>`).join('');
  }

  function renderFilterSummary() {
    const dimension = getDimensionConfig();
    const metric = getMetricConfig();
    const previousRange = getPreviousRange(state.filters.startDate, state.filters.endDate);
    const chips = [
      `聚合维度:${dimension.label}`,
      `主指标:${metric.label}`,
      `时间口径:${state.filters.dateType === 'shipDate' ? '发货时间' : '下单时间'}`,
      `统计周期:${state.filters.startDate}至${state.filters.endDate}`
    ];
    if (state.compareMode !== 'off') chips.push(`对比周期:${previousRange.startDate}至${previousRange.endDate}`);
    if (state.filters.warehouse) chips.push(`仓库:${state.filters.warehouse}`);
    if (state.filters.businessType) chips.push(`业务类型:${state.filters.businessType}`);
    if (state.filters.orderStage) chips.push(`订单阶段:${state.filters.orderStage}`);
    if (state.filters.customer) chips.push(`客户:${state.filters.customer}`);
    if (state.filters.country) chips.push(`国家:${state.filters.country}`);
    document.getElementById('filterSummaryChips').innerHTML = chips.map(item => `<span class="toolbar-tag">${escapeHtml(item)}</span>`).join('');
  }

  function buildSummaryCards(data) {
    const dimension = getDimensionConfig();
    const metric = getMetricConfig();
    const top = data.rows[0] || null;
    const currentTotal = data.totalMetricValue;
    const previousTotal = state.compareMode === 'off' ? null : data.rows.reduce((sum, row) => sum + row.previousMetricValue, 0);
    const totalChange = previousTotal === null ? null : previousTotal === 0 ? (currentTotal > 0 ? Infinity : 0) : (currentTotal - previousTotal) / previousTotal;
    const relatedCoverage = new Set(data.currentOrders.map(order => state.dimension === 'customer' ? order.deliveryCountryCode : order.customerId)).size;
    return [
      {
        label: dimension.countLabel,
        icon: 'ri-layout-grid-line',
        value: formatNumber(data.rows.length),
        delta: `${metric.label}排序`,
        tone: 'delta-flat',
        hint: `当前共命中${formatNumber(data.currentOrders.length)}条订单样本`
      },
      {
        label: 'TOP1主体',
        icon: 'ri-vip-crown-2-line',
        value: top ? top.label : '--',
        delta: top ? `${metric.format(top.currentMetricValue)} / 占比${formatRate(top.share)}` : '--',
        tone: top && top.share >= 0.2 ? 'delta-up' : 'delta-flat',
        hint: top ? `环比${formatDelta(top.changeRate)}` : '当前筛选无命中主体'
      },
      {
        label: `总${metric.label}`,
        icon: 'ri-bar-chart-box-line',
        value: metric.format(currentTotal),
        delta: state.compareMode === 'off' ? '未开启环比' : `较上周期${formatDelta(totalChange)}`,
        tone: state.compareMode === 'off' ? 'delta-flat' : deltaClass(totalChange),
        hint: `当前维度下按${metric.label}做TOP排序`
      },
      {
        label: dimension.relatedLabel,
        icon: 'ri-git-branch-line',
        value: formatNumber(relatedCoverage),
        delta: state.dimension === 'customer' ? '国家覆盖' : '客户覆盖',
        tone: 'delta-flat',
        hint: top ? `${top.label}关联${formatNumber(dimension.relatedValue(top))}` : '等待聚合结果'
      }
    ];
  }

  function renderSummaryCards(data) {
    document.getElementById('summaryCards').innerHTML = buildSummaryCards(data).map(card => `
      <article class="summary-card">
        <div class="summary-card-head">
          <div class="summary-label">${escapeHtml(card.label)}</div>
          <span class="summary-icon"><i class="${card.icon}"></i></span>
        </div>
        <div class="summary-value">${escapeHtml(card.value)}</div>
        <div class="summary-foot">
          <span class="delta-text ${card.tone}">${escapeHtml(card.delta)}</span>
          <span class="summary-hint">${escapeHtml(card.hint)}</span>
        </div>
      </article>
    `).join('');
  }

  function renderSpotlight(data) {
    const dimension = getDimensionConfig();
    const metric = getMetricConfig();
    const top = data.rows[0];
    const second = data.rows[1];
    const compare = COMPARE_OPTIONS[state.compareMode];
    document.getElementById('narrativeTitle').textContent = top
      ? `${dimension.label}维度下，${top.label}是当前${metric.label}最高的聚合主体`
      : `${dimension.label}维度下暂无可展示的聚合主体`;
    document.getElementById('narrativeBody').textContent = top
      ? `当前周期内共命中${formatNumber(data.currentOrders.length)}条订单样本，按${metric.label}统计时，${top.label}贡献${metric.format(top.currentMetricValue)}，占整体${formatRate(top.share)}。${second ? `${second.label}位列第二，贡献${metric.format(second.currentMetricValue)}。` : ''}${state.compareMode === 'off' ? '当前已关闭环比。' : `${compare.shortLabel}显示${formatDelta(top.changeRate)}。`}`
      : '当前筛选条件没有命中数据，请调整统计周期、仓库或业务类型后再查询。';
    document.getElementById('narrativeTags').innerHTML = [
      `下钻路径:${dimension.drilldown.join(' > ')}`,
      `排序规则:${metric.label}倒序`,
      `比较方式:${compare.label}`,
      `默认分页:${state.pagination.pageSize}条/页`
    ].map(item => `<span class="toolbar-tag">${escapeHtml(item)}</span>`).join('');
    document.getElementById('drilldownHint').textContent = `${dimension.label} -> ${DIMENSIONS[dimension.drilldownDimension].label}`;
    document.getElementById('pathFlow').innerHTML = dimension.drilldown.map((step, index) => `
      ${index ? '<span class="path-arrow"><i class="ri-arrow-right-line"></i></span>' : ''}
      <span class="path-node">${escapeHtml(step)}</span>
    `).join('');
    document.getElementById('pathList').innerHTML = [
      `当前维度字段:${dimension.field}`,
      `关联字段:${dimension.relatedLabel}`,
      '商品数量默认按单位分组展示',
      '新增常规维度时建议走配置扩展'
    ].map(item => `<span class="drawer-highlight-item">${escapeHtml(item)}</span>`).join('');
  }

  function buildTopChart(data) {
    const metric = getMetricConfig();
    const rows = data.rows.slice(0, 8);
    return {
      type: 'bar',
      data: {
        labels: rows.map(row => row.label),
        datasets: [{
          label: metric.label,
          data: rows.map(row => Number(metric.value(row).toFixed ? metric.value(row).toFixed(2) : metric.value(row))),
          backgroundColor: ['#4d77ea', '#2eb67d', '#7d67ff', '#f59e0b', '#0ea5e9', '#ff7b54', '#5fb878', '#7b8ca9'],
          borderRadius: 10,
          maxBarThickness: 18
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(219, 228, 239, 0.9)' },
            ticks: { color: '#627388' }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#627388' }
          }
        }
      }
    };
  }

  function buildCompareChart(data) {
    const metric = getMetricConfig();
    const rows = data.rows.slice(0, 6);
    const rightSeries = state.compareMode === 'off'
      ? rows.map(row => Number((row.share * 100).toFixed(1)))
      : rows.map(row => row.changeRate === Infinity ? 100 : Number((((row.changeRate || 0)) * 100).toFixed(1)));
    return {
      type: 'bar',
      data: {
        labels: rows.map(row => row.label),
        datasets: [
          {
            type: 'bar',
            label: metric.label,
            data: rows.map(row => Number(metric.value(row).toFixed ? metric.value(row).toFixed(2) : metric.value(row))),
            backgroundColor: 'rgba(77, 119, 234, 0.78)',
            borderRadius: 10
          },
          {
            type: 'line',
            label: state.compareMode === 'off' ? '占比%' : '环比%',
            data: rightSeries,
            borderColor: '#ff7b54',
            backgroundColor: 'rgba(255, 123, 84, 0.16)',
            yAxisID: 'y1',
            fill: false,
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, color: '#627388' }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(219, 228, 239, 0.9)' },
            ticks: { color: '#627388' }
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: {
              color: '#ff7b54',
              callback: value => `${value}%`
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#627388' }
          }
        }
      }
    };
  }

  function buildShareChart(data) {
    const rows = data.rows.slice(0, 5);
    const otherShare = Math.max(0, 1 - rows.reduce((sum, row) => sum + row.share, 0));
    return {
      type: 'doughnut',
      data: {
        labels: [...rows.map(row => row.label), ...(otherShare > 0 ? ['其他'] : [])],
        datasets: [{
          data: [...rows.map(row => Number((row.share * 100).toFixed(1))), ...(otherShare > 0 ? [Number((otherShare * 100).toFixed(1))] : [])],
          backgroundColor: ['#4d77ea', '#2eb67d', '#7d67ff', '#f59e0b', '#0ea5e9', '#c8d1dd'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              color: '#627388',
              padding: 14
            }
          }
        }
      }
    };
  }

  function renderCharts(data) {
    const dimension = getDimensionConfig();
    const metric = getMetricConfig();
    document.getElementById('topChartTitle').textContent = `${dimension.label}${metric.label}TOP8`;
    document.getElementById('topChartDesc').textContent = `用于识别当前周期内${metric.label}最集中的${dimension.label}主体。`;
    document.getElementById('topChartTags').innerHTML = [
      `当前维度:${dimension.label}`,
      `当前指标:${metric.label}`,
      `样本主体:${formatNumber(data.rows.length)}个`
    ].map(item => `<span class="toolbar-tag">${escapeHtml(item)}</span>`).join('');
    document.getElementById('compareChartTitle').textContent = `${dimension.label}${metric.label}与${state.compareMode === 'off' ? '占比' : '环比'}对照`;
    document.getElementById('compareChartDesc').textContent = state.compareMode === 'off'
      ? '当前未开启环比，右轴展示当前主体在整体中的占比。'
      : '左轴展示当前周期聚合值，右轴展示上一同周期环比。';
    document.getElementById('shareChartTitle').textContent = `${dimension.label}${metric.label}结构占比`;
    document.getElementById('shareChartDesc').textContent = '适合快速识别头部主体集中度与长尾分布情况。';
    if (charts.top) charts.top.destroy();
    if (charts.compare) charts.compare.destroy();
    if (charts.share) charts.share.destroy();
    charts.top = new Chart(document.getElementById('topChart').getContext('2d'), buildTopChart(data));
    charts.compare = new Chart(document.getElementById('compareChart').getContext('2d'), buildCompareChart(data));
    charts.share = new Chart(document.getElementById('shareChart').getContext('2d'), buildShareChart(data));
  }

  function renderSortableHead(key, label) {
    const active = state.sort.key === key;
    const icon = !active ? 'ri-expand-up-down-line' : state.sort.direction === 'desc' ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line';
    return `<th class="sortable-header cell-right" data-sort-key="${key}">${label}<i class="${icon}"></i></th>`;
  }

  function renderQuantityPills(items) {
    if (!items.length) return '--';
    return `<div class="quantity-stack">${items.map(item => `<span class="mini-pill">${escapeHtml(item.unit)}:${formatNumber(item.qty)}</span>`).join('')}</div>`;
  }

  function renderPagination(total) {
    const maxPage = Math.max(1, Math.ceil(total / state.pagination.pageSize));
    document.getElementById('prevBtn').disabled = state.pagination.currentPage === 1;
    document.getElementById('nextBtn').disabled = state.pagination.currentPage === maxPage;
    const pages = [];
    if (maxPage <= 7) {
      for (let page = 1; page <= maxPage; page += 1) pages.push(page);
    } else if (state.pagination.currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', maxPage);
    } else if (state.pagination.currentPage >= maxPage - 3) {
      pages.push(1, '...', maxPage - 4, maxPage - 3, maxPage - 2, maxPage - 1, maxPage);
    } else {
      pages.push(1, '...', state.pagination.currentPage - 1, state.pagination.currentPage, state.pagination.currentPage + 1, '...', maxPage);
    }
    document.getElementById('pageNumbers').innerHTML = pages.map(page => page === '...'
      ? '<span class="page-btn">...</span>'
      : `<button type="button" class="page-btn ${page === state.pagination.currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`).join('');
  }

  function renderTable(data) {
    const dimension = getDimensionConfig();
    const metric = getMetricConfig();
    const total = data.rows.length;
    const pageSize = state.pagination.pageSize;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (state.pagination.currentPage > maxPage) state.pagination.currentPage = maxPage;
    const start = (state.pagination.currentPage - 1) * pageSize;
    const pageRows = data.rows.slice(start, start + pageSize);
    document.getElementById('tableTitle').textContent = `${dimension.label}排行明细`;
    document.getElementById('tableDesc').textContent = `按${metric.label}默认倒序展示，支持继续下钻到${DIMENSIONS[dimension.drilldownDimension].label}与商品构成。`;
    document.getElementById('tableToolbar').innerHTML = [
      `排序:${state.sort.key === 'changeRate' ? '环比' : METRICS[state.sort.key].label}${state.sort.direction === 'desc' ? '降序' : '升序'}`,
      `分页:${pageSize}条/页`,
      `当前样本:${formatNumber(data.currentOrders.length)}单`
    ].map(item => `<span class="toolbar-tag">${escapeHtml(item)}</span>`).join('');
    document.getElementById('tableHead').innerHTML = `
      <tr>
        <th style="width:72px;">排名</th>
        <th style="width:250px;">${dimension.label}</th>
        ${renderSortableHead('orderCount', '订单量')}
        ${renderSortableHead('skuKindCount', '商品种类数')}
        ${renderSortableHead('itemQty', '商品数量')}
        ${renderSortableHead('weight', '重量')}
        ${renderSortableHead('volume', '体积')}
        <th style="width:124px;">${dimension.relatedLabel}</th>
        <th style="width:108px;">占比</th>
        <th style="width:118px;">环比</th>
        <th style="width:168px;">数量汇总/单位</th>
        <th style="width:108px;">操作</th>
      </tr>
    `;
    document.getElementById('tableBody').innerHTML = pageRows.length ? pageRows.map((row, index) => `
      <tr>
        <td><div class="rank-badge ${start + index < 3 ? 'top' : ''}">${start + index + 1}</div></td>
        <td>
          <div class="cell-entity">
            <div class="entity-main">
              <div class="entity-name">${escapeHtml(row.label)}</div>
              <div class="entity-sub">最近样本时间:${escapeHtml(row.latestDate ? row.latestDate.slice(0, 16) : '--')}</div>
            </div>
          </div>
        </td>
        <td class="cell-right">${formatNumber(row.orderCount)}</td>
        <td class="cell-right">${formatNumber(row.skuKindCount)}</td>
        <td class="cell-right">${formatNumber(row.itemQty)}</td>
        <td class="cell-right">${formatNumber(row.weight, 1)}kg</td>
        <td class="cell-right">${formatNumber(row.volume, 2)}m³</td>
        <td class="cell-right">${formatNumber(dimension.relatedValue(row))}</td>
        <td><span class="inline-badge blue">${formatRate(row.share)}</span></td>
        <td><span class="inline-badge ${state.compareMode === 'off' ? 'blue' : row.changeRate > 0 ? 'green' : row.changeRate < 0 ? 'orange' : 'blue'}">${state.compareMode === 'off' ? '--' : formatDelta(row.changeRate)}</span></td>
        <td>${renderQuantityPills(row.quantityByUnit)}</td>
        <td><button type="button" class="table-link-btn" data-drawer-key="${escapeHtml(row.key)}">查看详情</button></td>
      </tr>
    `).join('') : `<tr class="empty-row"><td colspan="12">暂无匹配数据，请调整查询条件后重试。</td></tr>`;
    renderPagination(total);
    document.getElementById('totalCount').textContent = formatNumber(total);
    document.getElementById('currentStart').textContent = total ? start + 1 : 0;
    document.getElementById('currentEnd').textContent = total ? Math.min(start + pageSize, total) : 0;
  }

  function getCurrentData() {
    return getComputedData();
  }

  function getRowByKey(key) {
    return getCurrentData().rows.find(row => String(row.key) === String(key)) || null;
  }

  function buildDrawerDrilldownRows(row, data) {
    const dimension = getDimensionConfig();
    const drilldownDimension = DIMENSIONS[dimension.drilldownDimension];
    const relevantOrders = data.currentOrders.filter(order => {
      const rowKey = order[dimension.keyField] || order[dimension.field] || '--';
      return String(rowKey) === String(row.key);
    });
    const buckets = new Map();
    relevantOrders.forEach(order => {
      const key = order[drilldownDimension.keyField] || order[drilldownDimension.field] || '--';
      if (!buckets.has(key)) {
        buckets.set(key, {
          label: order[drilldownDimension.field] || '--',
          orderCount: 0,
          itemQty: 0,
          weight: 0
        });
      }
      const bucket = buckets.get(key);
      bucket.orderCount += 1;
      bucket.weight += order.weight;
      order.products.forEach(item => {
        bucket.itemQty += item.qty;
      });
    });
    return Array.from(buckets.values()).sort((left, right) => right.orderCount - left.orderCount).slice(0, 10);
  }

  function alignTimeline(previousTimeline, labels, metricCode) {
    const previousValues = previousTimeline.map(item => item[metricCode]);
    if (previousValues.length >= labels.length) return previousValues.slice(previousValues.length - labels.length);
    return Array.from({ length: labels.length }, (_, index) => previousValues[index] || 0);
  }

  function buildDrawerTrend(row, data) {
    const metric = getMetricConfig();
    const previousRows = state.compareMode === 'off'
      ? []
      : enrichRows(aggregateOrders(data.previousOrders), []);
    const previousRow = previousRows.find(item => String(item.key) === String(row.key));
    const labels = row.timeline.map(item => item.date.slice(5));
    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `当前周期${metric.label}`,
            data: row.timeline.map(item => item[metric.code]),
            borderColor: '#4d77ea',
            backgroundColor: 'rgba(77, 119, 234, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2
          },
          ...(state.compareMode === 'off' ? [] : [{
            label: `上周期${metric.label}`,
            data: alignTimeline(previousRow ? previousRow.timeline : [], labels, metric.code),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            fill: false,
            tension: 0.35,
            borderWidth: 2,
            pointRadius: 2
          }])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { usePointStyle: true, color: '#627388' }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(219, 228, 239, 0.9)' },
            ticks: { color: '#627388' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#627388' }
          }
        }
      }
    };
  }

  function syncDrawerTab() {
    document.querySelectorAll('.drawer-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === state.drawer.tab);
    });
    document.getElementById('drawerOverviewSection').classList.toggle('hidden', state.drawer.tab !== 'overview');
    document.getElementById('drawerDrilldownSection').classList.toggle('hidden', state.drawer.tab !== 'drilldown');
    document.getElementById('drawerProductsSection').classList.toggle('hidden', state.drawer.tab !== 'products');
    document.getElementById('drawerTrendSection').classList.toggle('hidden', state.drawer.tab !== 'trend');
  }

  function closeDrawer() {
    state.drawer.open = false;
    state.drawer.key = '';
    state.drawer.tab = 'overview';
    renderDrawer();
  }

  function openDrawer(key) {
    state.drawer.open = true;
    state.drawer.key = key;
    state.drawer.tab = 'overview';
    renderDrawer();
  }

  function renderDrawer() {
    const drawer = document.getElementById('detailDrawer');
    if (!state.drawer.open) {
      drawer.classList.add('hidden');
      drawer.setAttribute('aria-hidden', 'true');
      return;
    }
    const data = getCurrentData();
    const row = getRowByKey(state.drawer.key);
    if (!row) {
      closeDrawer();
      return;
    }
    const dimension = getDimensionConfig();
    const metric = getMetricConfig();
    const drilldownDimension = DIMENSIONS[dimension.drilldownDimension];
    drawer.classList.remove('hidden');
    drawer.setAttribute('aria-hidden', 'false');
    document.getElementById('drawerTitle').textContent = row.label;
    document.getElementById('drawerScope').textContent = `当前按${dimension.label}聚合，支持继续下钻到${drilldownDimension.label}和商品构成明细。`;
    document.getElementById('drawerPeriodTag').textContent = `${state.filters.startDate}至${state.filters.endDate}`;
    document.getElementById('drawerStats').innerHTML = [
      { label: metric.label, value: metric.format(row.currentMetricValue) },
      { label: '订单量', value: formatNumber(row.orderCount) },
      { label: '商品种类数', value: formatNumber(row.skuKindCount) },
      { label: '数量汇总', value: quantitySummary(row.quantityByUnit) }
    ].map(item => `<div class="drawer-stat"><div class="drawer-stat-label">${escapeHtml(item.label)}</div><div class="drawer-stat-value">${escapeHtml(item.value)}</div></div>`).join('');
    document.getElementById('drawerNarrative').textContent = `${row.label}在当前周期内贡献${metric.format(row.currentMetricValue)}，占整体${formatRate(row.share)}，${state.compareMode === 'off' ? '当前未展示环比。' : `环比${formatDelta(row.changeRate)}。`}建议结合${drilldownDimension.label}排行和商品构成继续下钻。`;
    document.getElementById('drawerHighlights').innerHTML = [
      `覆盖订单:${formatNumber(row.orderCount)}单`,
      `${dimension.relatedLabel}:${formatNumber(dimension.relatedValue(row))}`,
      `重量:${formatNumber(row.weight, 1)}kg`,
      `体积:${formatNumber(row.volume, 2)}m³`
    ].map(item => `<span class="drawer-highlight-item">${escapeHtml(item)}</span>`).join('');
    document.getElementById('drawerDefinitions').innerHTML = [
      `聚合维度字段:${dimension.field}`,
      `主排序指标:${metric.label}`,
      '商品数量按单位分组展示',
      `下钻维度:${drilldownDimension.label}`
    ].map(item => `<span class="drawer-highlight-item">${escapeHtml(item)}</span>`).join('');
    const drilldownRows = buildDrawerDrilldownRows(row, data);
    document.getElementById('drawerDrilldownTitle').textContent = `${drilldownDimension.label}TOP10`;
    document.getElementById('drawerDrilldownHead').innerHTML = `
      <tr>
        <th>${drilldownDimension.label}</th>
        <th class="cell-right">订单量</th>
        <th class="cell-right">商品数量</th>
        <th class="cell-right">重量</th>
      </tr>
    `;
    document.getElementById('drawerDrilldownBody').innerHTML = drilldownRows.length ? drilldownRows.map(item => `
      <tr>
        <td>${escapeHtml(item.label)}</td>
        <td class="cell-right">${formatNumber(item.orderCount)}</td>
        <td class="cell-right">${formatNumber(item.itemQty)}</td>
        <td class="cell-right">${formatNumber(item.weight, 1)}kg</td>
      </tr>
    `).join('') : `<tr class="empty-row"><td colspan="4">暂无下钻结果</td></tr>`;
    document.getElementById('drawerProductBody').innerHTML = row.products.length ? row.products.slice(0, 10).map(item => `
      <tr>
        <td>${escapeHtml(item.skuCode)}</td>
        <td>${escapeHtml(item.skuName)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td class="cell-right">${formatNumber(item.orderCount)}</td>
        <td>${renderQuantityPills(item.quantityByUnit)}</td>
      </tr>
    `).join('') : `<tr class="empty-row"><td colspan="5">暂无商品构成数据</td></tr>`;
    document.getElementById('drawerTrendDesc').textContent = `按${state.filters.dateType === 'shipDate' ? '发货时间' : '下单时间'}展示${row.label}在当前统计周期内的${metric.label}变化。`;
    if (charts.drawerTrend) charts.drawerTrend.destroy();
    charts.drawerTrend = new Chart(document.getElementById('drawerTrendChart').getContext('2d'), buildDrawerTrend(row, data));
    syncDrawerTab();
  }

  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type || 'info'}`;
    toast.innerHTML = `<i class="${type === 'success' ? 'ri-checkbox-circle-line' : type === 'warning' ? 'ri-error-warning-line' : 'ri-information-line'}"></i><div>${escapeHtml(message)}</div>`;
    container.appendChild(toast);
    window.setTimeout(() => {
      toast.remove();
    }, 2600);
  }

  function saveView() {
    persistState();
    showToast('当前维度、指标和筛选条件已保存', 'success');
  }

  function buildExportRows() {
    const dimension = getDimensionConfig();
    return getCurrentData().rows.map((row, index) => ({
      排名: index + 1,
      维度: dimension.label,
      主体: row.label,
      订单量: row.orderCount,
      商品种类数: row.skuKindCount,
      商品数量: row.itemQty,
      重量kg: Number(row.weight.toFixed(1)),
      体积m3: Number(row.volume.toFixed(2)),
      关联覆盖: dimension.relatedValue(row),
      占比: formatRate(row.share),
      环比: state.compareMode === 'off' ? '--' : formatDelta(row.changeRate),
      数量汇总: quantitySummary(row.quantityByUnit)
    }));
  }

  function exportCurrentRows() {
    const rows = buildExportRows();
    if (rows.length > 100000) {
      showToast('数据量过大,请缩小查询范围', 'warning');
      return;
    }
    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(key => `"${String(row[key]).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `订单聚合分析_${state.dimension}_${state.filters.startDate}_${state.filters.endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('已导出当前聚合结果', 'success');
  }

  function renderAll() {
    persistState();
    const data = getComputedData();
    renderScopeMeta(data);
    renderDimensionCards();
    renderMetricChips();
    renderCompareChips();
    renderFilterSummary();
    renderSummaryCards(data);
    renderSpotlight(data);
    renderCharts(data);
    renderTable(data);
    renderDrawer();
  }

  function applyFiltersAndRender() {
    if (!collectFilters()) return;
    state.pagination.currentPage = 1;
    renderAll();
  }

  function resetFilters() {
    state.filters = {
      dateType: 'shipDate',
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      warehouse: '',
      businessType: '',
      orderStage: '',
      customer: '',
      country: '',
      keyword: ''
    };
    state.metric = getDimensionConfig().defaultMetric;
    state.compareMode = 'previous';
    state.sort = { key: state.metric, direction: 'desc' };
    state.pagination.currentPage = 1;
    syncFilterValues();
    renderAll();
    showToast('已恢复系统默认口径', 'info');
  }

  function changeSort(key) {
    if (state.sort.key === key) {
      state.sort.direction = state.sort.direction === 'desc' ? 'asc' : 'desc';
    } else {
      state.sort.key = key;
      state.sort.direction = 'desc';
    }
    renderAll();
  }

  function bindEvents() {
    document.getElementById('queryBtn').addEventListener('click', applyFiltersAndRender);
    document.getElementById('resetBtn').addEventListener('click', resetFilters);
    document.getElementById('saveViewBtn').addEventListener('click', saveView);
    document.getElementById('exportBtn').addEventListener('click', exportCurrentRows);
    document.getElementById('prevBtn').addEventListener('click', () => {
      if (state.pagination.currentPage <= 1) return;
      state.pagination.currentPage -= 1;
      renderAll();
    });
    document.getElementById('nextBtn').addEventListener('click', () => {
      const total = getComputedData().rows.length;
      const maxPage = Math.max(1, Math.ceil(total / state.pagination.pageSize));
      if (state.pagination.currentPage >= maxPage) return;
      state.pagination.currentPage += 1;
      renderAll();
    });
    document.getElementById('pageSize').addEventListener('change', event => {
      state.pagination.pageSize = Number(event.target.value) || DEFAULT_PAGE_SIZE;
      state.pagination.currentPage = 1;
      renderAll();
    });
    document.getElementById('filterPanel').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyFiltersAndRender();
      }
    });
    document.body.addEventListener('click', event => {
      const dimensionBtn = event.target.closest('[data-dimension]');
      if (dimensionBtn) {
        state.dimension = dimensionBtn.dataset.dimension;
        state.metric = getDimensionConfig().defaultMetric;
        state.sort = { key: state.metric, direction: 'desc' };
        state.pagination.currentPage = 1;
        renderAll();
        return;
      }
      const metricBtn = event.target.closest('[data-metric]');
      if (metricBtn) {
        state.metric = metricBtn.dataset.metric;
        state.sort = { key: state.metric, direction: 'desc' };
        state.pagination.currentPage = 1;
        renderAll();
        return;
      }
      const compareBtn = event.target.closest('[data-compare]');
      if (compareBtn) {
        state.compareMode = compareBtn.dataset.compare;
        renderAll();
        return;
      }
      const sortCell = event.target.closest('[data-sort-key]');
      if (sortCell) {
        changeSort(sortCell.dataset.sortKey);
        return;
      }
      const pageBtn = event.target.closest('[data-page]');
      if (pageBtn) {
        state.pagination.currentPage = Number(pageBtn.dataset.page);
        renderAll();
        return;
      }
      const drawerBtn = event.target.closest('[data-drawer-key]');
      if (drawerBtn) {
        openDrawer(drawerBtn.dataset.drawerKey);
        return;
      }
      const drawerTab = event.target.closest('.drawer-tab');
      if (drawerTab) {
        state.drawer.tab = drawerTab.dataset.tab;
        syncDrawerTab();
      }
    });
    document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
    document.getElementById('drawerBackdrop').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.drawer.open) closeDrawer();
    });
  }

  function init() {
    loadSavedState();
    populateFilters();
    bindEvents();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
