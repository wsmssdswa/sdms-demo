    let selectedWarehouses = ['WH001', 'WH002', 'WH003', 'WH004', 'WH005', 'WH006'];
    const LAYOUT_STORAGE_VERSION = 4;
    const KPI_STORAGE_VERSION = 10;
    const DEFAULT_COMPONENT_ORDER = ['todo', 'alert', 'shortcut', 'inventory', 'timeliness', 'trend', 'efficiency', 'operatingReport', 'message'];
    const DEFAULT_HIDDEN_KPI_KEYS = ['outboundQty', 'outboundWeight', 'outboundPieces', 'inboundWeight', 'inboundPieces', 'inventory', 'orphanOrders'];
    
    const defaultLayout = {
      todo: { show: true, width: 1 },
      alert: { show: true, width: 1 },
      trend: { show: true, width: 1 },
      shortcut: { show: true, width: 1 },
      inventory: { show: true, width: 1 },
      operatingReport: { show: true, width: 2 },
      efficiency: { show: true, width: 2 },
      timeliness: { show: true, width: 2 },
      message: { show: true, width: 1 }
    };
    
    let currentLayout = JSON.parse(JSON.stringify(defaultLayout));
    let efficiencyData = [];
    let originalEfficiencyData = [];
    let efficiencySortState = null;
    let currentSortColumn = '总量';
    let currentTimelinessTab = 'beihuo';
    const defaultShortcutConfig = {
      createInbound: true,
      createOutbound: true,
      inventorySearch: true,
      scanTask: true,
      printLabel: true,
      exceptionHandle: true
    };
    let currentShortcutConfig = { ...defaultShortcutConfig };
    // KPI配置相关 - 最大可选10个指标
    const KPI_MAX_SELECTION = 10;
    const defaultKpiConfig = {
      items: [
        { key: 'inboundQty', show: true },
        { key: 'returnInventory', show: true },
        { key: 'orderQty', show: true },
        { key: 'exceptionOrder', show: false },
        { key: 'signoutQty', show: true },
        { key: 'outboundQty', show: false },
        { key: 'outboundWeight', show: false },
        { key: 'outboundPieces', show: false },
        { key: 'inboundWeight', show: false },
        { key: 'inboundPieces', show: false },
        { key: 'inventory', show: false },
        { key: 'complaintRate', show: true },
        { key: 'signRate', show: false },
        { key: 'redispatchRate', show: true },
        { key: 'orphanOrders', show: false },
        { key: 'storageUtilization', show: true },
        { key: 'inventoryAlert', show: true }
      ]
    };
    let currentKpiConfig = JSON.parse(JSON.stringify(defaultKpiConfig));
    const BI_REPORT_NAV_STORAGE_KEY = 'sdmsBiReportNavigation';
    const BI_REPORT_NAV_ANCHOR_DATE = new Date('2026-03-18T00:00:00');
    const WORKBENCH_TO_BI_WAREHOUSE_MAP = {
      WH003: '广州白云仓',
      WH004: '深圳兴围仓'
    };
    function moveComponentBefore(order, movingKey, beforeKey) {
      const nextOrder = [...order];
      const movingIndex = nextOrder.indexOf(movingKey);
      const beforeIndex = nextOrder.indexOf(beforeKey);
      if (movingIndex === -1 || beforeIndex === -1 || movingIndex < beforeIndex) return nextOrder;
      nextOrder.splice(movingIndex, 1);
      nextOrder.splice(nextOrder.indexOf(beforeKey), 0, movingKey);
      return nextOrder;
    }
    function normalizeComponentOrder(order = []) {
      const normalized = order.filter(component => DEFAULT_COMPONENT_ORDER.includes(component));
      DEFAULT_COMPONENT_ORDER.forEach(component => {
        if (!normalized.includes(component)) {
          normalized.push(component);
        }
      });
      return normalized;
    }
    function applyDashboardComponentOrder(order = DEFAULT_COMPONENT_ORDER) {
      const normalizedOrder = normalizeComponentOrder(order);
      const grid = document.getElementById('dashboardGrid');
      const layoutConfigList = document.getElementById('layoutConfigList');
      if (grid) {
        normalizedOrder.forEach(componentName => {
          const component = grid.querySelector(`[data-component="${componentName}"]`);
          if (component) grid.appendChild(component);
        });
      }
      if (layoutConfigList) {
        normalizedOrder.forEach(componentName => {
          const configItem = layoutConfigList.querySelector(`[data-config="${componentName}"]`);
          if (configItem) layoutConfigList.appendChild(configItem);
        });
      }
    }
    function normalizeKpiConfigItems(items = [], shouldUseLatestDefaultVisibility = false) {
      const savedMap = new Map(items.map(item => [item.key, item]));
      return defaultKpiConfig.items.map(defaultItem => {
        const savedItem = savedMap.get(defaultItem.key);
        if (!savedItem) return { ...defaultItem };
        return {
          key: defaultItem.key,
          show: shouldUseLatestDefaultVisibility && DEFAULT_HIDDEN_KPI_KEYS.includes(defaultItem.key)
            ? defaultItem.show
            : typeof savedItem.show === 'boolean'
              ? savedItem.show
              : defaultItem.show
        };
      });
    }
    function syncShortcutGridLayout() {
      const shortcutGrid = document.getElementById('shortcutGrid');
      if (!shortcutGrid) return;
      shortcutGrid.classList.remove('md:grid-cols-2', 'md:grid-cols-4');
      shortcutGrid.classList.add('md:grid-cols-4');
    }
    function applyShortcutConfig() {
      let visibleCount = 0;
      document.querySelectorAll('[data-shortcut-item]').forEach(item => {
        const shortcutKey = item.dataset.shortcutItem;
        const shouldShow = currentShortcutConfig[shortcutKey] !== false;
        item.classList.toggle('hidden', !shouldShow);
        if (shouldShow) visibleCount += 1;
      });
      const shortcutGrid = document.getElementById('shortcutGrid');
      const shortcutEmptyState = document.getElementById('shortcutEmptyState');
      if (shortcutGrid) shortcutGrid.classList.toggle('hidden', visibleCount === 0);
      if (shortcutEmptyState) shortcutEmptyState.classList.toggle('hidden', visibleCount !== 0);
      syncShortcutGridLayout();
    }
    function updateShortcutOptionStates() {
      document.querySelectorAll('[data-shortcut-option]').forEach(option => {
        const checkbox = option.querySelector('[data-shortcut-config]');
        option.classList.toggle('selected', !!checkbox?.checked);
      });
    }
    function syncShortcutConfigModal() {
      document.querySelectorAll('[data-shortcut-config]').forEach(checkbox => {
        const shortcutKey = checkbox.dataset.shortcutConfig;
        checkbox.checked = currentShortcutConfig[shortcutKey] !== false;
      });
      updateShortcutOptionStates();
    }
    function collectShortcutConfigFromModal() {
      const nextConfig = { ...defaultShortcutConfig };
      document.querySelectorAll('[data-shortcut-config]').forEach(checkbox => {
        nextConfig[checkbox.dataset.shortcutConfig] = checkbox.checked;
      });
      return nextConfig;
    }
    function saveShortcutConfigToStorage() {
      localStorage.setItem('wmsWorkbenchShortcutConfig', JSON.stringify(currentShortcutConfig));
    }
    function loadShortcutConfigFromStorage() {
      const savedShortcutConfig = localStorage.getItem('wmsWorkbenchShortcutConfig');
      if (!savedShortcutConfig) return;
      try {
        currentShortcutConfig = { ...defaultShortcutConfig, ...JSON.parse(savedShortcutConfig) };
      } catch (error) {
        console.error('加载快捷按钮配置失败:', error);
      }
    }
    function openShortcutConfigModal() {
      syncShortcutConfigModal();
      document.getElementById('shortcutConfigModal').classList.remove('hidden');
    }
    function closeShortcutConfigModal() {
      document.getElementById('shortcutConfigModal').classList.add('hidden');
    }
    function resetShortcutConfigModal() {
      document.querySelectorAll('[data-shortcut-config]').forEach(checkbox => {
        checkbox.checked = defaultShortcutConfig[checkbox.dataset.shortcutConfig] !== false;
      });
      updateShortcutOptionStates();
    }
    function formatMetricNumber(value) {
      return Number(value || 0).toLocaleString('zh-CN');
    }
    function syncShipmentOrderCard() {
      const card = document.querySelector('[data-shipment-order-card]');
      if (!card) return;
      let total = 0;
      let signedValue = 0;
      card.querySelectorAll('[data-shipment-metric]').forEach(metricNode => {
        const metricValue = Number(metricNode.dataset.value || 0);
        metricNode.textContent = formatMetricNumber(metricValue);
        total += metricValue;
        if (metricNode.dataset.shipmentMetric === 'signed') {
          signedValue = metricValue;
        }
      });
      const totalNode = card.querySelector('[data-shipment-total]');
      if (totalNode) totalNode.textContent = formatMetricNumber(total);
      const rateNode = card.querySelector('[data-shipment-rate]');
      if (rateNode) {
        const signedRate = total > 0 ? ((signedValue / total) * 100).toFixed(1) : '0.0';
        rateNode.textContent = `${signedRate}%`;
      }
    }
    function applyShortcutConfigSelection() {
      currentShortcutConfig = collectShortcutConfigFromModal();
      applyShortcutConfig();
      saveShortcutConfigToStorage();
      closeShortcutConfigModal();
      alert('快捷按钮配置已更新！');
    }
    function formatTime(seconds) {
      const totalMinutes = Math.max(0, Math.round((Number(seconds) || 0) / 60));
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      return `${days}天${hours}小时${minutes}分钟`;
    }
    function formatTimeCompact(seconds) {
      const totalMinutes = Math.max(0, Math.round((Number(seconds) || 0) / 60));
      const days = Math.floor(totalMinutes / 1440);
      const hours = Math.floor((totalMinutes % 1440) / 60);
      const minutes = totalMinutes % 60;
      if (days > 0) {
        return `${days}d${hours}h${minutes}m`;
      }
      return `${hours}h${minutes}m`;
    }
    const MODULE_TIME_FILTER_KEYS = ['trend', 'efficiency', 'timeliness'];
    const MODULE_RANGE_PRESET_MAP = {
      '7': 7,
      '30': 30,
      '180': 180,
      '365': 365
    };
    let workbenchTimeFilters = {
      trend: createPresetDateRange('7'),
      efficiency: createPresetDateRange('7'),
      timeliness: createPresetDateRange('7')
    };
    let trendChart = null;
    function padDateNumber(value) {
      return String(value).padStart(2, '0');
    }
    function parseDateValue(value) {
      if (!value) return null;
      const parts = value.split('-').map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    function formatDateValue(date) {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);
      return `${normalizedDate.getFullYear()}-${padDateNumber(normalizedDate.getMonth() + 1)}-${padDateNumber(normalizedDate.getDate())}`;
    }
    function getTodayDate() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    }
    function createPresetDateRange(preset) {
      const days = MODULE_RANGE_PRESET_MAP[preset] || 7;
      const endDate = getTodayDate();
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - days + 1);
      return {
        preset,
        startDate: formatDateValue(startDate),
        endDate: formatDateValue(endDate)
      };
    }
    function calculateDateRangeDays(startValue, endValue) {
      const startDate = parseDateValue(startValue);
      const endDate = parseDateValue(endValue);
      if (!startDate || !endDate || endDate < startDate) return 0;
      return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    function formatTrendAxisLabel(date, totalDays) {
      if (totalDays <= 31) {
        return `${padDateNumber(date.getMonth() + 1)}/${padDateNumber(date.getDate())}`;
      }
      if (totalDays <= 180) {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      }
      return `${String(date.getFullYear()).slice(-2)}/${padDateNumber(date.getMonth() + 1)}`;
    }
    function getModuleRangeDays(moduleKey) {
      const dateFilter = workbenchTimeFilters[moduleKey];
      return calculateDateRangeDays(dateFilter.startDate, dateFilter.endDate) || 7;
    }
    function syncModuleDateInputs(moduleKey) {
      const dateFilter = workbenchTimeFilters[moduleKey];
      const startInput = document.getElementById(`${moduleKey}StartDate`);
      const endInput = document.getElementById(`${moduleKey}EndDate`);
      if (startInput) startInput.value = dateFilter.startDate;
      if (endInput) endInput.value = dateFilter.endDate;
    }
    function renderModuleDateFilter(moduleKey) {
      const dateFilter = workbenchTimeFilters[moduleKey];
      const label = document.getElementById(`${moduleKey}DateLabel`);
      if (label) label.textContent = `${dateFilter.startDate}~${dateFilter.endDate}`;
      document.querySelectorAll(`[data-module-range-preset="${moduleKey}"]`).forEach(button => {
        button.classList.toggle('active', button.dataset.presetValue === dateFilter.preset);
      });
      syncModuleDateInputs(moduleKey);
    }
    function closeModuleDatePopover(moduleKey) {
      const popover = document.getElementById(`${moduleKey}DatePopover`);
      if (popover) popover.classList.add('hidden');
      renderModuleDateFilter(moduleKey);
    }
    function closeAllModuleDatePopovers(exceptModuleKey = null) {
      MODULE_TIME_FILTER_KEYS.forEach(moduleKey => {
        if (moduleKey !== exceptModuleKey) {
          closeModuleDatePopover(moduleKey);
        }
      });
    }
    function openModuleDatePopover(moduleKey) {
      closeAllModuleDatePopovers(moduleKey);
      syncModuleDateInputs(moduleKey);
      const popover = document.getElementById(`${moduleKey}DatePopover`);
      if (popover) popover.classList.remove('hidden');
    }
    function updateModuleDateFilterByPreset(moduleKey, presetValue) {
      if (presetValue === 'custom') {
        openModuleDatePopover(moduleKey);
        return;
      }
      workbenchTimeFilters[moduleKey] = createPresetDateRange(presetValue);
      renderModuleDateFilter(moduleKey);
      closeModuleDatePopover(moduleKey);
      applyWorkbenchTimeFilter(moduleKey);
    }
    function applyCustomModuleDateFilter(moduleKey) {
      const startInput = document.getElementById(`${moduleKey}StartDate`);
      const endInput = document.getElementById(`${moduleKey}EndDate`);
      const startValue = startInput?.value;
      const endValue = endInput?.value;
      const rangeDays = calculateDateRangeDays(startValue, endValue);
      if (!rangeDays || rangeDays > 365) {
        alert('请选择有效的日期范围（1-365天）');
        return;
      }
      workbenchTimeFilters[moduleKey] = {
        preset: 'custom',
        startDate: startValue,
        endDate: endValue
      };
      renderModuleDateFilter(moduleKey);
      closeModuleDatePopover(moduleKey);
      applyWorkbenchTimeFilter(moduleKey);
    }
    function bindWorkbenchTimeFilterEvents() {
      document.querySelectorAll('[data-module-date-trigger]').forEach(button => {
        button.addEventListener('click', function() {
          const moduleKey = this.dataset.moduleDateTrigger;
          const popover = document.getElementById(`${moduleKey}DatePopover`);
          const isHidden = popover?.classList.contains('hidden');
          if (isHidden) {
            openModuleDatePopover(moduleKey);
          } else {
            closeModuleDatePopover(moduleKey);
          }
        });
      });
      document.querySelectorAll('[data-module-range-preset]').forEach(button => {
        button.addEventListener('click', function() {
          updateModuleDateFilterByPreset(this.dataset.moduleRangePreset, this.dataset.presetValue);
        });
      });
      document.querySelectorAll('[data-module-date-apply]').forEach(button => {
        button.addEventListener('click', function() {
          applyCustomModuleDateFilter(this.dataset.moduleDateApply);
        });
      });
      document.querySelectorAll('[data-module-date-cancel]').forEach(button => {
        button.addEventListener('click', function() {
          const moduleKey = this.dataset.moduleDateCancel;
          syncModuleDateInputs(moduleKey);
          closeModuleDatePopover(moduleKey);
        });
      });
      document.addEventListener('click', function(event) {
        if (!event.target.closest('[data-module-filter]')) {
          closeAllModuleDatePopovers();
        }
      });
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          closeAllModuleDatePopovers();
        }
      });
    }
    function buildTrendSeries() {
      const dateFilter = workbenchTimeFilters.trend;
      const totalDays = calculateDateRangeDays(dateFilter.startDate, dateFilter.endDate) || 7;
      const startDate = parseDateValue(dateFilter.startDate) || getTodayDate();
      const endDate = parseDateValue(dateFilter.endDate) || getTodayDate();
      const pointCount = totalDays <= 7 ? totalDays : totalDays <= 30 ? 8 : totalDays <= 180 ? 6 : 12;
      const step = pointCount <= 1 ? 0 : Math.max(1, Math.floor((totalDays - 1) / (pointCount - 1)));
      const labels = [];
      const outboundData = [];
      const inboundData = [];
      for (let index = 0; index < pointCount; index += 1) {
        let currentDate = new Date(startDate);
        if (index === pointCount - 1) {
          currentDate = new Date(endDate);
        } else {
          currentDate.setDate(startDate.getDate() + step * index);
        }
        labels.push(formatTrendAxisLabel(currentDate, totalDays));
        const trendFactor = 1 + Math.sin((index + 1) * 0.9) * 0.09;
        const rangeFactor = totalDays <= 30 ? 1 : totalDays <= 180 ? 1.07 : 1.14;
        const outboundValue = Math.round((920 + totalDays * 2.2 + index * 24) * trendFactor * rangeFactor);
        const inboundValue = Math.round((680 + totalDays * 1.6 + index * 18) * (1 + Math.cos((index + 1) * 0.7) * 0.08) * (rangeFactor - 0.03));
        outboundData.push(outboundValue);
        inboundData.push(inboundValue);
      }
      return { labels, outboundData, inboundData };
    }
    function initTrendChart() {
      const trendCtx = document.getElementById('trendChart').getContext('2d');
      trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: '出库订单量',
              data: [],
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: '入库订单量',
              data: [],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top', labels: { color: '#64748b' } },
            datalabels: { display: false }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.3)' }, ticks: { color: '#64748b' } },
            x: { grid: { color: 'rgba(148, 163, 184, 0.3)' }, ticks: { color: '#64748b' } }
          }
        }
      });
    }
    function refreshTrendChart() {
      if (!trendChart) return;
      const { labels, outboundData, inboundData } = buildTrendSeries();
      trendChart.data.labels = labels;
      trendChart.data.datasets[0].data = outboundData;
      trendChart.data.datasets[1].data = inboundData;
      trendChart.update();
    }
    function refreshEfficiencyModule() {
      const days = getModuleRangeDays('efficiency');
      efficiencyData = generateEfficiencyData(days);
      originalEfficiencyData = JSON.parse(JSON.stringify(efficiencyData));
      efficiencyData.sort((leftItem, rightItem) => rightItem['总量'] - leftItem['总量']);
      efficiencySortState = null;
      resetSortIcons();
      renderEfficiencyTable();
    }
    function getTimelinessFlowData() {
      const baseData = currentTimelinessTab === 'beihuo' ? beihuoData : ganxianData;
      const days = getModuleRangeDays('timeliness');
      const rangeFactor = days <= 30 ? 1 : days <= 180 ? 1.08 : 1.15;
      return baseData.map((item, index) => {
        const waveFactor = 1 + ((((days + index * 7) % 11) - 5) * 0.018);
        return {
          ...item,
          time: Math.max(120, Math.round(item.time * rangeFactor * waveFactor))
        };
      });
    }
    function renderTimelinessSummary(timelinessData) {
      const totalTimeElement = document.getElementById('timelinessTotalTime');
      const summaryMetaElement = document.getElementById('timelinessSummaryMeta');
      if (!totalTimeElement || !summaryMetaElement) return;
      if (!timelinessData.length) {
        totalTimeElement.textContent = '--';
        summaryMetaElement.textContent = '暂无节点数据';
        return;
      }
      const totalTime = timelinessData.reduce((sum, item) => sum + item.time, 0);
      const abnormalCount = timelinessData.filter(item => item.abnormal).length;
      const flowLabel = currentTimelinessTab === 'beihuo' ? '备货流程' : '干线流程';
      totalTimeElement.textContent = formatTime(totalTime);
      summaryMetaElement.textContent = `${flowLabel}·${timelinessData.length}个节点·${abnormalCount}个异常节点`;
    }
    function applyWorkbenchTimeFilter(moduleKey) {
      if (moduleKey === 'trend') {
        refreshTrendChart();
        return;
      }
      if (moduleKey === 'efficiency') {
        refreshEfficiencyModule();
        return;
      }
      if (moduleKey === 'timeliness') {
        initTimelinessFlow();
      }
    }
    function initWorkbenchTimeFilters() {
      bindWorkbenchTimeFilterEvents();
      MODULE_TIME_FILTER_KEYS.forEach(moduleKey => {
        renderModuleDateFilter(moduleKey);
        applyWorkbenchTimeFilter(moduleKey);
      });
    }
    
    const beihuoData = [
      { name: '下单', time: 195120, abnormal: false, reason: '' },
      { name: '审核', time: 27300, abnormal: true, reason: '审核队列积压' },
      { name: '装载', time: 12000, abnormal: false, reason: '' },
      { name: '打包', time: 9900, abnormal: false, reason: '' },
      { name: '发货', time: 22200, abnormal: true, reason: '发货交接排队' },
      { name: '上线', time: 153000, abnormal: false, reason: '' },
      { name: '签收', time: 1800, abnormal: false, reason: '' }
    ];
    
    const ganxianData = [
      { name: '司机登记', time: 4800, abnormal: false, reason: '' },
      { name: '入库', time: 22500, abnormal: false, reason: '' },
      { name: '上架', time: 128400, abnormal: false, reason: '' },
      { name: '数据确认', time: 180600, abnormal: true, reason: '待报关资料回传' },
      { name: '通知出库', time: 20400, abnormal: true, reason: '等待航班放舱通知' },
      { name: '配载出库', time: 30600, abnormal: false, reason: '' },
      { name: '装车', time: 47700, abnormal: true, reason: '装卸人员不足' },
      { name: '机场预约', time: 24600, abnormal: false, reason: '' },
      { name: '发车', time: 8400, abnormal: false, reason: '' }
    ];
    
    function switchTimelinessTab(tab) {
      currentTimelinessTab = tab;
      const tabBeihuo = document.getElementById('tabBeihuo');
      const tabGanxian = document.getElementById('tabGanxian');
      
      if (tab === 'beihuo') {
        tabBeihuo.className = 'px-4 py-2 text-sm font-medium text-white btn-primary rounded-lg';
        tabGanxian.className = 'px-4 py-2 text-sm font-medium text-slate-600/70 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors';
      } else {
        tabBeihuo.className = 'px-4 py-2 text-sm font-medium text-slate-600/70 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors';
        tabGanxian.className = 'px-4 py-2 text-sm font-medium text-white btn-primary rounded-lg';
      }
      initTimelinessFlow();
    }
    
    function initTimelinessFlow() {
      const timelinessData = getTimelinessFlowData();
      const flowContainer = document.getElementById('timelinessFlow');
      if (!flowContainer) return;
      flowContainer.innerHTML = '';
      renderTimelinessSummary(timelinessData);
      
      const timelinessComponent = document.querySelector('[data-component="timeliness"]');
      const isWide = timelinessComponent && timelinessComponent.classList.contains('md:col-span-2');
      const nodesPerRow = isWide ? 6 : 4;
      const totalRows = Math.ceil(timelinessData.length / nodesPerRow);
      
      const nodes = timelinessData.map((item) => {
        const node = document.createElement('div');
        node.className = `flow-node bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 min-w-[70px] text-center`;
        node.innerHTML = `<div class="font-semibold text-slate-800 text-sm">${item.name}</div>`;
        return node;
      });
      
      for (let row = 0; row < totalRows; row++) {
        const startIndex = row * nodesPerRow;
        const endIndex = Math.min(startIndex + nodesPerRow, timelinessData.length);
        const isOddRow = row % 2 === 0;
        
        const rowElement = document.createElement('div');
        rowElement.className = 'flex items-center w-full' + (isOddRow ? ' justify-between gap-2' : ' justify-end gap-2');
        
        if (isOddRow) {
          for (let i = startIndex; i < endIndex; i++) {
            rowElement.appendChild(nodes[i]);
            if (i < endIndex - 1) {
              const nextIndex = i + 1;
              const arrow = createArrow(timelinessData[i].time, timelinessData[nextIndex].abnormal, timelinessData[nextIndex].reason, '→', timelinessData[nextIndex].name, nextIndex);
              rowElement.appendChild(arrow);
            }
          }
        } else {
          for (let i = endIndex - 1; i >= startIndex; i--) {
            if (i < endIndex - 1) {
              const nextIndex = i + 1;
              const arrow = createArrow(timelinessData[i].time, timelinessData[nextIndex].abnormal, timelinessData[nextIndex].reason, '←', timelinessData[nextIndex].name, nextIndex);
              rowElement.appendChild(arrow);
            }
            rowElement.appendChild(nodes[i]);
          }
        }
        
        flowContainer.appendChild(rowElement);
        
        if (row < totalRows - 1) {
          const lastIndexOfRow = endIndex - 1;
          const nextIndex = endIndex;
          const downArrow = createDownArrow(timelinessData[lastIndexOfRow].time, timelinessData[nextIndex].abnormal, timelinessData[nextIndex].reason, timelinessData[nextIndex].name, nextIndex, isOddRow);
          flowContainer.appendChild(downArrow);
        }
      }
    }
    
    function createArrow(time, isAbnormal, reason, direction, nextName, nextIndex) {
      const arrow = document.createElement('div');
      arrow.className = 'flex flex-col items-center justify-center px-1';
      const timeLabel = document.createElement('div');
      timeLabel.className = `flow-time ${isAbnormal ? 'bg-accent-rose/20 border-2 border-accent-rose text-accent-roseLight abnormal' : 'bg-slate-100 text-slate-600/70'} rounded-full px-2 py-0.5 text-xs font-mono font-medium cursor-pointer relative mb-1 hover:ring-2 hover:ring-accent-cyan/50 transition-all`;
      timeLabel.textContent = formatTimeCompact(time);
      timeLabel.onclick = () => openTimelinessDetail(nextName, time, isAbnormal, reason);
      arrow.appendChild(timeLabel);
      
      const arrowIcon = document.createElement('div');
      arrowIcon.className = 'text-slate-600/40 text-lg';
      arrowIcon.textContent = direction;
      arrow.appendChild(arrowIcon);
      
      return arrow;
    }
    
    function createDownArrow(time, isAbnormal, reason, nextName, nextIndex, alignRight) {
      const downArrowContainer = document.createElement('div');
      downArrowContainer.className = alignRight ? 'flex justify-end w-full' : 'flex justify-start w-full';
      const downArrow = document.createElement('div');
      downArrow.className = 'flex items-center';
      
      const arrowIcon = document.createElement('div');
      arrowIcon.className = 'text-slate-600/40 text-2xl mr-1';
      arrowIcon.textContent = '↓';
      downArrow.appendChild(arrowIcon);
      
      const timeLabel = document.createElement('div');
      timeLabel.className = `flow-time ${isAbnormal ? 'bg-accent-rose/20 border-2 border-accent-rose text-accent-roseLight abnormal' : 'bg-slate-100 text-slate-600/70'} rounded-full px-2 py-0.5 text-xs font-mono font-medium cursor-pointer relative hover:ring-2 hover:ring-accent-cyan/50 transition-all`;
      timeLabel.textContent = formatTimeCompact(time);
      timeLabel.onclick = () => openTimelinessDetail(nextName, time, isAbnormal, reason);
      downArrow.appendChild(timeLabel);
      
      downArrowContainer.appendChild(downArrow);
      return downArrowContainer;
    }
    
    let timelinessDetailChart = null;
    let currentTimelinessNode = null;
    let currentTimelinessRange = 7;
    let currentTimelinessData = null;
    let currentAbnormalRecords = null;
    let currentAvgTime = 0;
    let currentTimelinessBaseTime = 1200;
    let currentTimelinessAbnormalReason = '';
    
    function openTimelinessDetail(nodeName, currentTime, isAbnormal, reason) {
      currentTimelinessNode = nodeName;
      currentTimelinessBaseTime = Math.max(300, currentTime || 300);
      currentTimelinessAbnormalReason = reason || '';
      document.getElementById('timelinessDetailModal').classList.remove('hidden');
      document.getElementById('timelinessDetailTitle').textContent = `${nodeName} - 时效统计详情`;
      document.getElementById('timelinessDetailSubtitle').textContent = `当前时效: ${formatTime(currentTime)}${isAbnormal ? ' (异常)' : ''}`;
      
      generateAndRenderChart();
      bindTimelinessRangeButtons();
      bindAverageLineToggle();
    }
    
    function closeTimelinessDetail() {
      document.getElementById('timelinessDetailModal').classList.add('hidden');
      if (timelinessDetailChart) {
        timelinessDetailChart.destroy();
        timelinessDetailChart = null;
      }
      currentTimelinessData = null;
      currentAbnormalRecords = null;
      currentTimelinessBaseTime = 1200;
      currentTimelinessAbnormalReason = '';
    }
    
    function bindTimelinessRangeButtons() {
      document.querySelectorAll('.timeliness-range-btn').forEach(btn => {
        btn.onclick = function() {
          document.querySelectorAll('.timeliness-range-btn').forEach(b => {
            b.classList.remove('bg-accent-cyan', 'text-white');
            b.classList.add('text-slate-600/70');
          });
          this.classList.add('bg-accent-cyan', 'text-white');
          this.classList.remove('text-slate-600/70');
          currentTimelinessRange = parseInt(this.dataset.range);
          generateAndRenderChart();
        };
      });
    }
    
    function bindAverageLineToggle() {
      const checkbox = document.getElementById('showAverageLine');
      checkbox.onchange = function() {
        renderChart();
      };
    }
    
    function generateTimelinessData(days) {
      const data = [];
      const abnormalRecords = [];
      const baseTime = Math.max(300, currentTimelinessBaseTime || 1200);
      const volatility = baseTime >= 86400 ? 0.12 : baseTime >= 3600 ? 0.18 : 0.3;
      const abnormalThreshold = baseTime >= 86400 ? baseTime * 1.12 : baseTime >= 3600 ? baseTime * 1.2 : 2000;
      const today = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
        
        const varianceFactor = 1 + ((Math.random() * 2 - 1) * volatility);
        const time = Math.max(300, Math.round(baseTime * varianceFactor));
        const isAbnormal = time > abnormalThreshold || Math.random() < (currentTimelinessAbnormalReason ? 0.18 : 0.08);
        const abnormalReason = isAbnormal ? (currentTimelinessAbnormalReason || getRandomReason()) : '';
        
        data.push({
          date: dateStr,
          time: time,
          isAbnormal: isAbnormal,
          reason: abnormalReason
        });
        
        if (isAbnormal) {
          abnormalRecords.push({
            date: dateStr,
            time: time,
            reason: abnormalReason
          });
        }
      }
      
      return { data, abnormalRecords };
    }
    
    function getRandomReason() {
      const reasons = [
        '设备故障',
        '人员不足',
        '系统异常',
        '空间不足',
        '物料短缺',
        '订单激增',
        '网络延迟',
        '操作失误'
      ];
      return reasons[Math.floor(Math.random() * reasons.length)];
    }
    
    function generateAndRenderChart() {
      const { data, abnormalRecords } = generateTimelinessData(currentTimelinessRange);
      currentTimelinessData = data;
      currentAbnormalRecords = abnormalRecords;
      currentAvgTime = Math.round(data.reduce((sum, d) => sum + d.time, 0) / data.length);
      renderChart();
    }
    
    function renderChart() {
      const data = currentTimelinessData;
      const abnormalRecords = currentAbnormalRecords;
      const avgTime = currentAvgTime;
      const minTime = Math.min(...data.map(d => d.time));
      const maxTime = Math.max(...data.map(d => d.time));
      
      document.getElementById('avgTime').textContent = formatTime(avgTime);
      document.getElementById('minTime').textContent = formatTime(minTime);
      document.getElementById('maxTime').textContent = formatTime(maxTime);
      document.getElementById('abnormalCount').textContent = abnormalRecords.length;
      
      const tbody = document.getElementById('abnormalTableBody');
      if (abnormalRecords.length > 0) {
        tbody.innerHTML = abnormalRecords.map(r => `
          <tr class="table-row border-b border-slate-300/30">
            <td class="px-4 py-3 text-sm text-slate-800">${r.date}</td>
            <td class="px-4 py-3 text-sm text-accent-rose font-mono">${formatTime(r.time)}</td>
            <td class="px-4 py-3 text-sm text-slate-600">${r.reason}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="3" class="px-4 py-6 text-sm text-slate-600/50 text-center">暂无异常记录</td></tr>';
      }
      
      const ctx = document.getElementById('timelinessDetailChart').getContext('2d');
      if (timelinessDetailChart) {
        timelinessDetailChart.destroy();
      }
      const textColor = '#475569';
      const gridColor = 'rgba(148, 163, 184, 0.3)';
      const showAverage = document.getElementById('showAverageLine').checked;
      
      const avgLinePlugin = {
        id: 'avgLinePlugin',
        afterDraw: (chart) => {
          if (!showAverage) return;
          
          const yAxis = chart.scales.y;
          const xAxis = chart.scales.x;
          const ctx = chart.ctx;
          
          const yPixel = yAxis.getPixelForValue(avgTime);
          const xStart = xAxis.left;
          const xEnd = xAxis.right;
          
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([8, 4]);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.moveTo(xStart, yPixel);
          ctx.lineTo(xEnd, yPixel);
          ctx.stroke();

          ctx.setLineDash([]);
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 12px Plus Jakarta Sans';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(`平均: ${formatTime(avgTime)}`, xEnd - 5, yPixel - 5);

          ctx.restore();
        }
      };
      
      timelinessDetailChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => d.date),
          datasets: [
            {
              label: '每日时效',
              data: data.map(d => d.time),
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: data.map(d => d.isAbnormal ? 6 : 3),
              pointBackgroundColor: data.map(d => d.isAbnormal ? '#f43f5e' : '#06b6d4'),
              pointBorderColor: data.map(d => d.isAbnormal ? '#f43f5e' : '#06b6d4'),
              pointBorderWidth: 2
            }
          ]
        },
        plugins: [avgLinePlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: textColor,
                usePointStyle: true
              }
            },
            datalabels: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `时效: ${formatTime(context.raw)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                callback: function(value) {
                  return formatTime(value);
                }
              }
            },
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor }
            }
          }
        }
      });
    }
    
    function sortEfficiencyTable(column) {
      const columns = ['name', '入库', '上架', '拣货', '打包', '出库', '总量'];
      
      if (!efficiencySortState) {
        efficiencySortState = {};
        columns.forEach(col => efficiencySortState[col] = 'none');
      }
      
      const currentState = efficiencySortState[column];
      let newState;
      
      if (currentState === 'none') {
        newState = 'asc';
      } else if (currentState === 'asc') {
        newState = 'desc';
      } else {
        newState = 'none';
      }
      
      if (newState === 'none') {
        currentSortColumn = '总量';
      } else {
        currentSortColumn = column;
      }
      
      columns.forEach(col => {
        const icon = document.getElementById(`sort-icon-${col}`);
        const th = document.getElementById(`th-${col}`);
        
        if (icon) {
          if (col === currentSortColumn) {
            if (newState === 'asc' || (col !== column && efficiencySortState[col] !== 'none')) {
              icon.className = 'ri-arrow-up-line ml-1 text-accent-cyan';
            } else if (newState === 'desc' || (col !== column && efficiencySortState[col] !== 'none')) {
              icon.className = 'ri-arrow-down-line ml-1 text-accent-cyan';
            } else {
              icon.className = 'ri-arrow-up-down-line ml-1 text-accent-cyan/40';
            }
          } else {
            icon.className = 'ri-arrow-up-down-line ml-1 text-slate-600/40';
          }
        }
        
        if (th) {
          if (col === currentSortColumn) {
            th.classList.remove('text-slate-600/60');
            th.classList.add('text-accent-cyan');
          } else {
            th.classList.remove('text-accent-cyan');
            th.classList.add('text-slate-600/60');
          }
        }
        
        efficiencySortState[col] = col === column ? newState : 'none';
      });
      
      if (newState === 'none') {
        efficiencyData = JSON.parse(JSON.stringify(originalEfficiencyData));
        efficiencyData.sort((a, b) => b['总量'] - a['总量']);
      } else {
        efficiencyData.sort((a, b) => {
          if (column === 'name') {
            return newState === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
          }
          return newState === 'asc' ? a[column] - b[column] : b[column] - a[column];
        });
      }
      
      renderEfficiencyTable();
    }
    
    function renderEfficiencyTable() {
      const tbody = document.getElementById('efficiencyTableBody');
      const highlightCol = currentSortColumn;
      tbody.innerHTML = efficiencyData.map(item => `
        <tr class="table-row">
          <td class="px-4 py-3 text-sm ${highlightCol === 'name' ? 'text-accent-cyan font-bold' : 'text-slate-800 font-medium'}">${item.name}</td>
          <td class="px-4 py-3 text-sm ${highlightCol === '入库' ? 'text-accent-cyan font-mono font-bold' : 'text-slate-600 font-mono'}">${item.入库}</td>
          <td class="px-4 py-3 text-sm ${highlightCol === '上架' ? 'text-accent-cyan font-mono font-bold' : 'text-slate-600 font-mono'}">${item.上架}</td>
          <td class="px-4 py-3 text-sm ${highlightCol === '拣货' ? 'text-accent-cyan font-mono font-bold' : 'text-slate-600 font-mono'}">${item.拣货}</td>
          <td class="px-4 py-3 text-sm ${highlightCol === '打包' ? 'text-accent-cyan font-mono font-bold' : 'text-slate-600 font-mono'}">${item.打包}</td>
          <td class="px-4 py-3 text-sm ${highlightCol === '出库' ? 'text-accent-cyan font-mono font-bold' : 'text-slate-600 font-mono'}">${item.出库}</td>
          <td class="px-4 py-3 text-sm ${highlightCol === '总量' ? 'text-accent-cyan font-mono font-bold' : 'text-slate-600 font-mono'}">${item.总量}</td>
        </tr>
      `).join('');
    }
    
    function generateEfficiencyData(days) {
      const names = ['张三', '李四', '王五', '赵六', '钱七'];
      const multiplier = days / 7;
      return names.map(name => {
        const base = {
          name: name,
          入库: Math.floor((Math.random() * 10 + 8) * multiplier),
          上架: Math.floor((Math.random() * 8 + 6) * multiplier),
          拣货: Math.floor((Math.random() * 12 + 10) * multiplier),
          打包: Math.floor((Math.random() * 8 + 7) * multiplier),
          出库: Math.floor((Math.random() * 10 + 12) * multiplier)
        };
        base.总量 = base.入库 + base.上架 + base.拣货 + base.打包 + base.出库;
        return base;
      });
    }
    
    function resetSortIcons() {
      const columns = ['name', '入库', '上架', '拣货', '打包', '出库', '总量'];
      columns.forEach(col => {
        const icon = document.getElementById(`sort-icon-${col}`);
        const th = document.getElementById(`th-${col}`);
        if (icon) {
          icon.className = col === '总量' ? 'ri-arrow-up-down-line ml-1 text-accent-cyan/40' : 'ri-arrow-up-down-line ml-1 text-slate-600/40';
        }
        if (th) {
          if (col === '总量') {
            th.classList.remove('text-slate-600/60');
            th.classList.add('text-accent-cyan');
          } else {
            th.classList.remove('text-accent-cyan');
            th.classList.add('text-slate-600/60');
          }
        }
      });
      currentSortColumn = '总量';
    }
    // ==================== KPI配置功能 ====================
    function openKpiConfigModal() {
      syncKpiConfigModal();
      document.getElementById('kpiConfigModal').classList.remove('hidden');
      initKpiConfigSortable();
    }
    function closeKpiConfigModal() {
      document.getElementById('kpiConfigModal').classList.add('hidden');
    }
    function syncKpiConfigModal() {
      // 同步checkbox状态和排序
      const configList = document.getElementById('kpiConfigList');
      (currentKpiConfig.items || []).forEach((item, index) => {
        const configItem = configList.querySelector(`[data-kpi-config="${item.key}"]`);
        if (configItem) {
          const checkbox = configItem.querySelector('[data-kpi-checkbox]');
          if (checkbox) checkbox.checked = item.show;
          // 按顺序移动到正确位置
          configList.appendChild(configItem);
        }
      });
      updateKpiCheckboxStates();
    }
    function updateKpiCheckboxStates() {
      const checkedCount = (currentKpiConfig.items || []).filter(item => item.show).length;
      document.querySelectorAll('[data-kpi-checkbox]').forEach(checkbox => {
        const kpiKey = checkbox.dataset.kpiCheckbox;
        const config = (currentKpiConfig.items || []).find(c => c.key === kpiKey);
        if (config && !config.show && checkedCount >= KPI_MAX_SELECTION) {
          checkbox.disabled = true;
          checkbox.closest('.kpi-config-item').classList.add('opacity-50');
        } else {
          checkbox.disabled = false;
          checkbox.closest('.kpi-config-item').classList.remove('opacity-50');
        }
      });
    }
    function initKpiConfigSortable() {
      const configList = document.getElementById('kpiConfigList');
      if (window.kpiConfigSortable) {
        window.kpiConfigSortable.destroy();
      }
      window.kpiConfigSortable = new Sortable(configList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        handle: '.drag-handle-kpi',
        onEnd: syncKpiConfigOrder
      });
    }
    function syncKpiConfigOrder() {
      const configList = document.getElementById('kpiConfigList');
      const newOrder = [];
      configList.querySelectorAll('.kpi-config-item').forEach(item => {
        const kpiKey = item.dataset.kpiConfig;
        const existingConfig = (currentKpiConfig.items || []).find(c => c.key === kpiKey);
        if (existingConfig) {
          newOrder.push({ ...existingConfig });
        }
      });
      currentKpiConfig.items = newOrder;
    }
    function applyKpiConfig() {
      // 收集配置
      const configList = document.getElementById('kpiConfigList');
      const newConfig = [];
      configList.querySelectorAll('.kpi-config-item').forEach(item => {
        const kpiKey = item.dataset.kpiConfig;
        const checkbox = item.querySelector('[data-kpi-checkbox]');
        newConfig.push({
          key: kpiKey,
          show: checkbox ? checkbox.checked : true
        });
      });
      // 检查数量限制
      const showCount = newConfig.filter(c => c.show).length;
      if (showCount > KPI_MAX_SELECTION) {
        alert(`最多只能显示 ${KPI_MAX_SELECTION} 个指标，当前已选 ${showCount} 个`);
        return;
      }
      currentKpiConfig.items = newConfig;
      renderKpiGrid();
      saveKpiConfigToStorage();
      closeKpiConfigModal();
    }
    function renderKpiGrid() {
      const kpiGrid = document.getElementById('kpiGrid');
      if (!kpiGrid) return;
      const visibleItems = (currentKpiConfig.items || []).filter(c => c.show);
      const hasCompositeCards = visibleItems.some(item => ['inboundQty', 'returnInventory', 'orderQty', 'signoutQty'].includes(item.key));
      const orderedCards = [];
      // 隐藏所有卡片
      kpiGrid.querySelectorAll('[data-kpi]').forEach(card => {
        card.classList.add('hidden');
      });
      // 按配置顺序显示并重排卡片，确保工作台顺序和配置面板一致
      visibleItems.slice(0, KPI_MAX_SELECTION).forEach((config, index) => {
        const card = kpiGrid.querySelector(`[data-kpi="${config.key}"]`);
        if (card) {
          card.classList.remove('hidden');
          orderedCards.push(card);
          card.style.animationDelay = `${0.1 + index * 0.05}s`;
        }
      });
      orderedCards.forEach(card => {
        kpiGrid.appendChild(card);
      });
      // 动态调整grid列数
      updateKpiGridColumns(visibleItems.length, hasCompositeCards);
    }
    function updateKpiGridColumns(count, hasCompositeCards = false) {
      const kpiGrid = document.getElementById('kpiGrid');
      kpiGrid.classList.remove('xl:grid-cols-11', 'xl:grid-cols-10', 'xl:grid-cols-9', 'xl:grid-cols-8', 'xl:grid-cols-6', 'xl:grid-cols-5', 'xl:grid-cols-4', 'xl:grid-cols-3', 'xl:grid-cols-2', 'xl:grid-cols-1');
      if (count <= 2) {
        kpiGrid.classList.add('xl:grid-cols-2');
      } else if (count <= 3) {
        kpiGrid.classList.add('xl:grid-cols-3');
      } else if (count <= 4) {
        kpiGrid.classList.add('xl:grid-cols-4');
      } else if (hasCompositeCards) {
        kpiGrid.classList.add('xl:grid-cols-11');
      } else if (count <= 6) {
        kpiGrid.classList.add('xl:grid-cols-6');
      } else {
        kpiGrid.classList.add('xl:grid-cols-6');
      }
    }
    function saveKpiConfigToStorage() {
      localStorage.setItem('wmsKpiConfig', JSON.stringify({
        version: KPI_STORAGE_VERSION,
        config: currentKpiConfig.items
      }));
    }
    function loadKpiConfigFromStorage() {
      const savedConfig = localStorage.getItem('wmsKpiConfig');
      if (savedConfig) {
        try {
          const data = JSON.parse(savedConfig);
          let savedItems = null;
          let shouldMigrateDefaultVisibility = false;
          if (Array.isArray(data?.config)) {
            savedItems = data.config;
            shouldMigrateDefaultVisibility = !data.version || data.version < KPI_STORAGE_VERSION;
          } else if (Array.isArray(data?.items)) {
            savedItems = data.items;
            shouldMigrateDefaultVisibility = true;
          } else if (Array.isArray(data)) {
            savedItems = data;
            shouldMigrateDefaultVisibility = true;
          }
          if (savedItems) {
            currentKpiConfig.items = normalizeKpiConfigItems(savedItems, shouldMigrateDefaultVisibility);
            if (shouldMigrateDefaultVisibility) {
              saveKpiConfigToStorage();
            }
          }
        } catch (e) {
          console.error('加载KPI配置失败:', e);
        }
      }
    }
    function resetKpiConfig() {
      if (confirm('确定要恢复默认KPI配置吗？')) {
        currentKpiConfig = JSON.parse(JSON.stringify(defaultKpiConfig));
        syncKpiConfigModal();
        applyKpiConfig();
      }
    }
    function buildExceptionOrderListPageName(orderType) {
      return `${orderType}异常订单列表页`;
    }
    function buildTodoListPageName(businessType, taskType) {
      return `${businessType}${taskType}列表页`;
    }
    function getWorkbenchSelectedWarehouses() {
      const checkedValues = Array.from(document.querySelectorAll('.warehouse-checkbox:checked')).map(item => item.value);
      return checkedValues.length ? checkedValues : [...selectedWarehouses];
    }
    function mapWorkbenchWarehousesToBi() {
      return Array.from(new Set(getWorkbenchSelectedWarehouses().map(code => WORKBENCH_TO_BI_WAREHOUSE_MAP[code]).filter(Boolean)));
    }
    function formatBiNavigationDate(date) {
      const value = new Date(date);
      value.setHours(0, 0, 0, 0);
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    function buildBiNavigationRange(rangePreset = 'today') {
      const endDate = new Date(BI_REPORT_NAV_ANCHOR_DATE);
      endDate.setHours(0, 0, 0, 0);
      let startDate = new Date(endDate);
      if (rangePreset === 'last30') {
        startDate.setDate(endDate.getDate() - 29);
      } else if (rangePreset === 'thisWeek') {
        const offset = (endDate.getDay() + 6) % 7;
        startDate.setDate(endDate.getDate() - offset);
      } else if (rangePreset === 'thisMonth') {
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      }
      return {
        startDate: formatBiNavigationDate(startDate),
        endDate: formatBiNavigationDate(endDate)
      };
    }
    function parseBiNavigationList(value) {
      return String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);
    }
    function buildBiOrderNavigationPayload(trigger) {
      const range = buildBiNavigationRange(trigger.dataset.biRangePreset || 'today');
      const dateType = trigger.dataset.biDateType || 'primary';
      const mappedWarehouses = mapWorkbenchWarehousesToBi();
      const filters = {
        dateType,
        startDate: range.startDate,
        endDate: range.endDate,
        orderTypes: parseBiNavigationList(trigger.dataset.biOrderTypes),
        orderStages: parseBiNavigationList(trigger.dataset.biOrderStages),
        trackStatuses: parseBiNavigationList(trigger.dataset.biTrackStatuses)
      };
      if (dateType === 'ship') {
        filters.shipStartDate = range.startDate;
        filters.shipEndDate = range.endDate;
      }
      if (mappedWarehouses.length) filters.selectedWarehouses = mappedWarehouses;
      return {
        createdAt: Date.now(),
        source: 'wms-workbench-kpi',
        sourceLabel: trigger.dataset.biNavLabel || trigger.textContent.trim(),
        reportKey: 'order',
        filters
      };
    }
    function navigateToBiOrderReport(trigger) {
      localStorage.setItem(BI_REPORT_NAV_STORAGE_KEY, JSON.stringify(buildBiOrderNavigationPayload(trigger)));
      window.location.href = './bi-consolidated-report-v2.html';
    }
    function decorateBiOrderNavTargets() {
      document.querySelectorAll('[data-bi-order-nav]').forEach(target => {
        target.classList.add('kpi-report-link');
        target.setAttribute('role', 'link');
        target.setAttribute('tabindex', '0');
        target.setAttribute('title', `跳转到订单报表：${target.dataset.biNavLabel || '查看明细'}`);
        target.setAttribute('aria-label', `跳转到订单报表，查看${target.dataset.biNavLabel || '明细'}`);
      });
    }
    function bindKpiOrderReportNavigation() {
      decorateBiOrderNavTargets();
      document.addEventListener('click', function(event) {
        const trigger = event.target.closest('[data-bi-order-nav]');
        if (!trigger) return;
        event.preventDefault();
        navigateToBiOrderReport(trigger);
      });
      document.addEventListener('keydown', function(event) {
        const trigger = event.target.closest('[data-bi-order-nav]');
        if (!trigger || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        navigateToBiOrderReport(trigger);
      });
    }
    function bindExceptionOrderNavigation() {
      const alertModule = document.querySelector('[data-component="alert"]');
      if (!alertModule) return;
      alertModule.addEventListener('click', function(event) {
        const clickableTarget = event.target.closest('.order-code, .order-type');
        if (!clickableTarget) return;
        const row = clickableTarget.closest('.order-row');
        if (!row) return;
        const orderNo = row.querySelector('.order-code')?.textContent?.trim() || '--';
        const orderType = row.querySelector('.order-type')?.textContent?.trim() || '异常订单';
        const targetPage = buildExceptionOrderListPageName(orderType);
        const promptText = clickableTarget.classList.contains('order-code')
          ? `将跳转至【${targetPage}】\n并自动带入订单号：${orderNo}`
          : `将跳转至【${targetPage}】\n并自动筛选订单类型：${orderType}`;
        alert(promptText);
      });
    }
    function bindTodoMatrixNavigation() {
      const todoModule = document.querySelector('[data-component="todo"]');
      if (!todoModule) return;
      todoModule.addEventListener('click', function(event) {
        const cell = event.target.closest('.todo-matrix-cell.is-clickable');
        if (!cell) return;
        const businessType = cell.dataset.business || '业务';
        const taskType = cell.dataset.task || '待办任务';
        const targetPage = buildTodoListPageName(businessType, taskType);
        alert(`将跳转至【${targetPage}】\n并自动筛选业务类型：${businessType}\n任务类型：${taskType}`);
      });
    }
    // 已移除initKpiMaxControls函数，最大显示数量固定为10
    function initKpiCheckboxListeners() {
      document.querySelectorAll('[data-kpi-checkbox]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const kpiKey = this.dataset.kpiCheckbox;
          const config = currentKpiConfig.items.find(c => c.key === kpiKey);
          if (config) {
            config.show = this.checked;
          }
          updateKpiCheckboxStates();
        });
      });
    }
    // ==================== End KPI配置功能 ====================
    document.addEventListener('DOMContentLoaded', function() {
      Chart.register(ChartDataLabels);
      loadLayoutFromStorage();
      loadShortcutConfigFromStorage();
      applyShortcutConfig();
      // KPI配置初始化
      loadKpiConfigFromStorage();
      renderKpiGrid();
      // KPI配置按钮事件
      document.getElementById('kpiConfigBtn').addEventListener('click', openKpiConfigModal);
      document.getElementById('applyKpiConfigBtn').addEventListener('click', applyKpiConfig);
      document.getElementById('resetKpiConfigBtn').addEventListener('click', resetKpiConfig);
      initKpiCheckboxListeners();
      initTrendChart();
      
      const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
      new Chart(inventoryCtx, {
        type: 'doughnut',
        data: {
          labels: ['电子产品', '服装', '家居用品', '食品', '其他'],
          datasets: [{
            data: [35, 25, 20, 12, 8],
            backgroundColor: ['#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#64748b', padding: 15 } },
            datalabels: {
              display: true,
              color: '#FFFFFF',
              font: { size: 12, weight: 'bold' },
              formatter: (value, context) => {
                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                return Math.round((value / total) * 100) + '%';
              }
            }
          }
        }
      });
      
      initWorkbenchTimeFilters();
      
      const grid = document.getElementById('dashboardGrid');
      new Sortable(grid, { animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag', handle: '.drag-handle', filter: 'button, input, select, textarea', preventOnFilter: false });
      
      const layoutConfigList = document.getElementById('layoutConfigList');
      new Sortable(layoutConfigList, { animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag', handle: '.drag-handle-config', onEnd: syncConfigOrderToGrid });
      
      document.getElementById('layoutBtn').addEventListener('click', openLayoutModal);
      // KPI配置初始化
      loadKpiConfigFromStorage();
      renderKpiGrid();
      syncShipmentOrderCard();
      document.getElementById('kpiConfigBtn').addEventListener('click', openKpiConfigModal);
      document.getElementById('applyKpiConfigBtn').addEventListener('click', applyKpiConfig);
      document.getElementById('resetKpiConfigBtn').addEventListener('click', resetKpiConfig);
      initKpiCheckboxListeners();
      const shortcutConfigBtn = document.getElementById('shortcutConfigBtn');
      ['mousedown', 'touchstart'].forEach(eventName => {
        shortcutConfigBtn.addEventListener(eventName, event => {
          event.stopPropagation();
        });
      });
      shortcutConfigBtn.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        openShortcutConfigModal();
      });
      document.getElementById('applyShortcutConfigBtn').addEventListener('click', applyShortcutConfigSelection);
      document.getElementById('resetShortcutConfigBtn').addEventListener('click', resetShortcutConfigModal);
      document.querySelectorAll('[data-shortcut-config]').forEach(checkbox => {
        checkbox.addEventListener('change', updateShortcutOptionStates);
      });
      document.querySelectorAll('.width-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const componentItem = this.closest('.component-item');
          const componentName = componentItem.dataset.config;
          const width = parseInt(this.dataset.width);
          if (!currentLayout[componentName]) return;
          componentItem.querySelectorAll('.width-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentLayout[componentName].width = width;
          const component = grid.querySelector(`[data-component="${componentName}"]`);
          if (component) {
            component.classList.remove('col-span-1', 'col-span-2', 'md:col-span-1', 'md:col-span-2');
            component.classList.add('col-span-1', width === 2 ? 'md:col-span-2' : 'md:col-span-1');
            if (componentName === 'timeliness') initTimelinessFlow();
          }
          if (componentName === 'shortcut') syncShortcutGridLayout();
        });
      });
      
      document.querySelectorAll('.component-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          const componentItem = this.closest('.component-item');
          const componentName = componentItem.dataset.config;
          currentLayout[componentName].show = this.checked;
        });
      });
      
      document.getElementById('warehouseBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('warehouseDropdown').classList.toggle('hidden');
      });
      
      document.getElementById('selectAllWarehouses').addEventListener('change', function() {
        document.querySelectorAll('.warehouse-checkbox').forEach(cb => cb.checked = this.checked);
      });
      
      document.getElementById('applyWarehouseBtn').addEventListener('click', function() {
        const checked = document.querySelectorAll('.warehouse-checkbox:checked');
        selectedWarehouses = Array.from(checked).map(item => item.value);
        document.getElementById('warehouseText').textContent = checked.length === 6 ? '全部仓库' : `已选 ${checked.length} 个`;
        document.getElementById('warehouseDropdown').classList.add('hidden');
      });
      document.addEventListener('click', function(e) {
        if (!document.getElementById('warehouseSelector').contains(e.target)) {
          document.getElementById('warehouseDropdown').classList.add('hidden');
        }
      });
      bindExceptionOrderNavigation();
      bindTodoMatrixNavigation();
      bindKpiOrderReportNavigation();
    });
    function openLayoutModal() {
      document.getElementById('layoutModal').classList.remove('hidden');
      syncGridOrderToConfig();
      syncLayoutToModal();
    }
    
    function closeLayoutModal() {
      document.getElementById('layoutModal').classList.add('hidden');
    }
    
    function syncLayoutToModal() {
      document.querySelectorAll('.component-item').forEach(item => {
        const componentName = item.dataset.config;
        const config = currentLayout[componentName];
        if (!config) return;
        item.querySelector('input[type="checkbox"]').checked = config.show;
        item.querySelectorAll('.width-btn').forEach(btn => {
          btn.classList.remove('active');
          if (parseInt(btn.dataset.width) === config.width) btn.classList.add('active');
        });
      });
    }
    
    function applyLayout() {
      const grid = document.getElementById('dashboardGrid');
      Object.keys(currentLayout).forEach(componentName => {
        const component = grid.querySelector(`[data-component="${componentName}"]`);
        if (component) {
          const config = currentLayout[componentName];
          component.classList.toggle('hidden', !config.show);
          component.classList.remove('col-span-1', 'col-span-2', 'md:col-span-1', 'md:col-span-2');
          component.classList.add('col-span-1', config.width === 2 ? 'md:col-span-2' : 'md:col-span-1');
          if (componentName === 'timeliness') initTimelinessFlow();
        }
      });
      syncShortcutGridLayout();
      closeLayoutModal();
      saveLayoutToStorage();
      alert('布局已应用！');
    }
    
    function resetToDefault() {
      if (confirm('确定要恢复默认布局吗？')) {
        currentLayout = JSON.parse(JSON.stringify(defaultLayout));
        applyDashboardComponentOrder(DEFAULT_COMPONENT_ORDER);
        syncLayoutToModal();
        applyLayout();
        saveLayoutToStorage();
      }
    }
    
    function saveLayoutToStorage() {
      const grid = document.getElementById('dashboardGrid');
      const components = [];
      document.querySelectorAll('#dashboardGrid > div:not(.hidden)').forEach((item, index) => {
        const componentName = item.dataset.component;
        if (componentName && currentLayout[componentName]) {
          components.push({ component: componentName, position: index, width: currentLayout[componentName].width });
        }
      });
      localStorage.setItem('wmsWorkbenchLayout', JSON.stringify({
        version: LAYOUT_STORAGE_VERSION,
        components,
        config: currentLayout
      }));
    }
    
    function loadLayoutFromStorage() {
      const savedLayout = localStorage.getItem('wmsWorkbenchLayout');
      if (!savedLayout) {
        applyDashboardComponentOrder(DEFAULT_COMPONENT_ORDER);
        return;
      }
      if (savedLayout) {
        try {
          const layoutData = JSON.parse(savedLayout);
          const shouldMigrateLayout = !layoutData.version || layoutData.version < LAYOUT_STORAGE_VERSION;
          if (shouldMigrateLayout) {
            currentLayout = Object.keys(defaultLayout).reduce((result, componentName) => {
              const savedConfig = layoutData.config?.[componentName];
              result[componentName] = {
                show: typeof savedConfig?.show === 'boolean' ? savedConfig.show : defaultLayout[componentName].show,
                width: defaultLayout[componentName].width
              };
              return result;
            }, {});
          } else if (layoutData.config) {
            currentLayout = { ...defaultLayout, ...layoutData.config };
          }
          const grid = document.getElementById('dashboardGrid');
          Object.keys(currentLayout).forEach(componentName => {
            const component = grid.querySelector(`[data-component="${componentName}"]`);
            if (component) {
              const config = currentLayout[componentName];
              component.classList.toggle('hidden', !config.show);
              component.classList.remove('col-span-1', 'col-span-2', 'md:col-span-1', 'md:col-span-2');
              component.classList.add('col-span-1', config.width === 2 ? 'md:col-span-2' : 'md:col-span-1');
            }
          });
          const savedOrder = Array.isArray(layoutData.components) && !shouldMigrateLayout
            ? layoutData.components.map(item => item.component)
            : DEFAULT_COMPONENT_ORDER;
          const componentOrder = normalizeComponentOrder(savedOrder);
          applyDashboardComponentOrder(componentOrder);
          if (shouldMigrateLayout) {
            saveLayoutToStorage();
          }
          syncShortcutGridLayout();
          initTimelinessFlow();
        } catch (e) { console.error('加载布局失败:', e); }
      }
    }
    
    function syncConfigOrderToGrid() {
      const layoutConfigList = document.getElementById('layoutConfigList');
      const grid = document.getElementById('dashboardGrid');
      layoutConfigList.querySelectorAll('.component-item').forEach(item => {
        const component = grid.querySelector(`[data-component="${item.dataset.config}"]`);
        if (component) grid.appendChild(component);
      });
    }
    
    function syncGridOrderToConfig() {
      const layoutConfigList = document.getElementById('layoutConfigList');
      const grid = document.getElementById('dashboardGrid');
      grid.querySelectorAll('[data-component]').forEach(gridItem => {
        const configItem = layoutConfigList.querySelector(`[data-config="${gridItem.dataset.component}"]`);
        if (configItem) layoutConfigList.appendChild(configItem);
      });
    }
