/* ============================================================
   unified-report-center.js
   统一报表中心 - 完整交互逻辑
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     0. 配置常量
     ---------------------------------------------------------- */
  var NAV_ITEMS = [
    { id: 'overview', icon: 'ri-dashboard-3-line', label: '概览' },
    { id: 'inbound', icon: 'ri-archive-line', label: '入库分析' },
    { id: 'outbound', icon: 'ri-truck-line', label: '出库分析' },
    { id: 'inventory', icon: 'ri-stack-line', label: '库存分析' },
    { id: 'order', icon: 'ri-file-list-3-line', label: '订单分析' },
    { id: 'custom', icon: 'ri-magic-line', label: '自定义报表' },
    { id: 'subscription', icon: 'ri-rss-line', label: '订阅与推送' }
  ];

  var SUB_TABS = {
    inbound: ['入库汇总', '上架时效', '入库异常'],
    outbound: ['出库汇总', '拣货时效', '出库异常'],
    inventory: ['库存概览', '库龄分析', '库存周转'],
    order: ['订单概览', '订单时效', '异常订单']
  };

  var BREADCRUMB_MAP = {
    overview: '概览',
    inbound: '入库分析',
    outbound: '出库分析',
    inventory: '库存分析',
    order: '订单分析',
    custom: '自定义报表',
    subscription: '订阅与推送'
  };

  var COLORS = {
    blue: '#4d77ea',
    green: '#2eb67d',
    orange: '#f59e0b',
    red: '#ff5a5f',
    violet: '#7d67ff',
    teal: '#36b3a0',
    amber: '#e87b35'
  };

  var COLOR_ARR = [COLORS.blue, COLORS.green, COLORS.orange, COLORS.red, COLORS.violet, COLORS.teal, COLORS.amber];

  /* ----------------------------------------------------------
     0-1. Mock数据
     ---------------------------------------------------------- */
  var MOCK = {
    dates: ['04-14', '04-15', '04-16', '04-17', '04-18', '04-19', '04-20'],
    inbound: [320, 280, 350, 410, 380, 290, 360],
    outbound: [290, 310, 330, 370, 350, 300, 340],
    kpi: { inbound: 2390, outbound: 2290, inventory: 12450, inTransit: 87 },
    top5: [
      { name: '运连网科技', value: 1280, pct: 28 },
      { name: '飞猫跨境', value: 960, pct: 21 },
      { name: '鼎盛物流', value: 720, pct: 16 },
      { name: '优品供应链', value: 580, pct: 13 },
      { name: '中联国际', value: 420, pct: 9 }
    ],
    alerts: [
      { type: '库存不足', detail: 'SKU#A10023 低于安全线(50\u219212)', time: '10:30', status: '未处理' },
      { type: '超期未出库', detail: '订单#CAMS-0418-003 超48h', time: '09:15', status: '未处理' },
      { type: '超量入库', detail: '订单#CAMS-0416-007 超120%', time: '08:45', status: '已处理' }
    ],
    inboundSummary: [
      { date: '2026-04-14', total: 320, normal: 310, abnormal: 10, rate: '96.9%' },
      { date: '2026-04-15', total: 280, normal: 272, abnormal: 8, rate: '97.1%' },
      { date: '2026-04-16', total: 350, normal: 338, abnormal: 12, rate: '96.6%' },
      { date: '2026-04-17', total: 410, normal: 398, abnormal: 12, rate: '97.1%' },
      { date: '2026-04-18', total: 380, normal: 369, abnormal: 11, rate: '97.1%' },
      { date: '2026-04-19', total: 290, normal: 283, abnormal: 7, rate: '97.6%' },
      { date: '2026-04-20', total: 360, normal: 350, abnormal: 10, rate: '97.2%' }
    ],
    shelvingTimeliness: [
      { range: '0~2h', count: 180, pct: '36%' },
      { range: '2~4h', count: 150, pct: '30%' },
      { range: '4~8h', count: 98, pct: '19.6%' },
      { range: '8~12h', count: 45, pct: '9%' },
      { range: '>12h', count: 27, pct: '5.4%' }
    ],
    inboundException: [
      { type: '破损', count: 42, pct: '35.3%' },
      { type: '少件', count: 30, pct: '25.2%' },
      { type: '标签错误', count: 22, pct: '18.5%' },
      { type: '超量入库', count: 15, pct: '12.6%' },
      { type: '其他', count: 10, pct: '8.4%' }
    ],
    outboundSummary: [
      { date: '2026-04-14', total: 290, normal: 282, abnormal: 8, rate: '97.2%' },
      { date: '2026-04-15', total: 310, normal: 301, abnormal: 9, rate: '97.1%' },
      { date: '2026-04-16', total: 330, normal: 322, abnormal: 8, rate: '97.6%' },
      { date: '2026-04-17', total: 370, normal: 358, abnormal: 12, rate: '96.8%' },
      { date: '2026-04-18', total: 350, normal: 340, abnormal: 10, rate: '97.1%' },
      { date: '2026-04-19', total: 300, normal: 293, abnormal: 7, rate: '97.7%' },
      { date: '2026-04-20', total: 340, normal: 330, abnormal: 10, rate: '97.1%' }
    ],
    pickingTimeliness: [
      { range: '0~1h', count: 220, pct: '39.3%' },
      { range: '1~2h', count: 170, pct: '30.4%' },
      { range: '2~4h', count: 110, pct: '19.6%' },
      { range: '4~8h', count: 42, pct: '7.5%' },
      { range: '>8h', count: 18, pct: '3.2%' }
    ],
    outboundException: [
      { type: '拣货差错', count: 28, pct: '33.3%' },
      { type: '漏发', count: 20, pct: '23.8%' },
      { type: '标签错误', count: 16, pct: '19.0%' },
      { type: '包装破损', count: 12, pct: '14.3%' },
      { type: '其他', count: 8, pct: '9.5%' }
    ],
    inventoryOverview: [
      { warehouse: '深圳兴围仓', totalSku: 3820, totalQty: 58400, usedLocation: 1260, totalLocation: 1500, usageRate: '84.0%' },
      { warehouse: '广州白云仓', totalSku: 2150, totalQty: 36200, usedLocation: 820, totalLocation: 1000, usageRate: '82.0%' },
      { warehouse: '香港葵涌仓', totalSku: 1680, totalQty: 29850, usedLocation: 640, totalLocation: 800, usageRate: '80.0%' },
      { warehouse: '上海浦东仓', totalSku: 980, totalQty: 15200, usedLocation: 380, totalLocation: 500, usageRate: '76.0%' },
      { warehouse: '杭州萧山仓', totalSku: 520, totalQty: 8900, usedLocation: 210, totalLocation: 300, usageRate: '70.0%' }
    ],
    inventoryAge: [
      { range: '0~7天', count: 4800, pct: '38.6%' },
      { range: '7~30天', count: 3200, pct: '25.7%' },
      { range: '30~60天', count: 2100, pct: '16.9%' },
      { range: '60~90天', count: 1300, pct: '10.4%' },
      { range: '>90天', count: 1050, pct: '8.4%' }
    ],
    inventoryTurnover: [
      { month: '2026-01', turnoverRate: '4.2', daysOnHand: 7.1 },
      { month: '2026-02', turnoverRate: '4.5', daysOnHand: 6.7 },
      { month: '2026-03', turnoverRate: '4.8', daysOnHand: 6.3 },
      { month: '2026-04', turnoverRate: '5.1', daysOnHand: 5.9 }
    ],
    orderSummary: [
      { date: '2026-04-14', total: 520, completed: 490, cancelled: 12, pending: 18 },
      { date: '2026-04-15', total: 560, completed: 530, cancelled: 10, pending: 20 },
      { date: '2026-04-16', total: 610, completed: 575, cancelled: 15, pending: 20 },
      { date: '2026-04-17', total: 580, completed: 548, cancelled: 14, pending: 18 },
      { date: '2026-04-18', total: 550, completed: 520, cancelled: 11, pending: 19 },
      { date: '2026-04-19', total: 490, completed: 465, cancelled: 8, pending: 17 },
      { date: '2026-04-20', total: 530, completed: 502, cancelled: 10, pending: 18 }
    ],
    orderTimeliness: [
      { stage: '接单', avgHours: 0.5, targetHours: 1, rate: '99.2%' },
      { stage: '分配', avgHours: 1.2, targetHours: 2, rate: '96.8%' },
      { stage: '拣货', avgHours: 3.5, targetHours: 4, rate: '92.1%' },
      { stage: '复核', avgHours: 1.0, targetHours: 2, rate: '97.5%' },
      { stage: '出库', avgHours: 2.0, targetHours: 3, rate: '94.6%' }
    ],
    orderException: [
      { type: '超时未出库', count: 35, pct: '33.0%' },
      { type: '信息不完整', count: 25, pct: '23.6%' },
      { type: '客户取消', count: 20, pct: '18.9%' },
      { type: '库存不足', count: 15, pct: '14.2%' },
      { type: '其他', count: 11, pct: '10.4%' }
    ],
    customReports: [
      { name: '每周入库趋势分析', desc: '入库汇总 + 上架时效 + 异常统计', domain: '入库', updateTime: '2026-04-18 14:30', creator: '张三' },
      { name: 'Top10客户出库报表', desc: '按客户维度统计出库量与出库时效', domain: '出库', updateTime: '2026-04-17 10:15', creator: '李四' },
      { name: '库龄超60天预警报表', desc: '筛选库龄超过60天的SKU明细', domain: '库存', updateTime: '2026-04-16 09:00', creator: '王五' }
    ],
    subscriptions: [
      { id: 1, name: '每日入库汇总推送', report: '入库汇总分析', freq: '每日', time: '09:00', method: '邮件', status: '启用' },
      { id: 2, name: '每周库存盘点报告', report: '库存概览', freq: '每周', time: '周一 10:00', method: '企业微信', status: '启用' },
      { id: 3, name: '每月订单分析汇总', report: '订单分析', freq: '每月', time: '1日 08:00', method: '邮件', status: '停用' }
    ]
  };

  /* ----------------------------------------------------------
     0-2. 状态
     ---------------------------------------------------------- */
  var currentView = 'overview';
  var currentSubTab = {};
  var chartInstances = {};
  var wizardStep = 1;
  var selectedDomain = '';

  /* ----------------------------------------------------------
     1. 导航和视图切换
     ---------------------------------------------------------- */

  function renderNav() {
    var nav = document.getElementById('reportNav');
    if (!nav) return;
    nav.innerHTML = NAV_ITEMS.map(function (item) {
      var cls = item.id === currentView ? 'report-nav-item active' : 'report-nav-item';
      return '<div class="' + cls + '" data-view="' + item.id + '" onclick="window._switchView(\'' + item.id + '\')">' +
        '<i class="' + item.icon + '"></i>' +
        '<span>' + item.label + '</span>' +
        '</div>';
    }).join('');
  }

  function switchView(viewId) {
    currentView = viewId;

    // 更新导航高亮
    renderNav();

    // 更新面包屑
    var bc = document.getElementById('breadcrumbCurrent');
    if (bc) bc.textContent = BREADCRUMB_MAP[viewId] || viewId;

    // 更新Tab栏
    renderHeaderTabs();

    // 隐藏所有视图
    document.querySelectorAll('.report-view').forEach(function (el) {
      el.classList.remove('active');
    });

    // 显示目标视图
    var viewEl = document.getElementById('view' + viewId.charAt(0).toUpperCase() + viewId.slice(1));
    if (viewEl) viewEl.classList.add('active');

    // 渲染视图内容
    renderView(viewId);
  }

  // 暴露到全局
  window._switchView = switchView;

  function renderHeaderTabs() {
    var main = document.getElementById('headerTabsMain');
    if (!main) return;
    main.innerHTML = NAV_ITEMS.map(function (item) {
      if (item.id === currentView) {
        return '<div class="tab-chip primary"><i class="' + item.icon + '"></i><span>' + item.label + '</span><span class="close-mark">\u00d7</span></div>';
      }
      return '<div class="tab-chip" style="cursor:pointer;" onclick="window._switchView(\'' + item.id + '\')"><i class="' + item.icon + '"></i><span>' + item.label + '</span></div>';
    }).join('');
  }

  function renderView(viewId) {
    switch (viewId) {
      case 'overview': renderOverview(); break;
      case 'inbound': renderInbound(currentSubTab[viewId] || 0); break;
      case 'outbound': renderOutbound(currentSubTab[viewId] || 0); break;
      case 'inventory': renderInventory(currentSubTab[viewId] || 0); break;
      case 'order': renderOrder(currentSubTab[viewId] || 0); break;
      case 'custom': renderCustomList(); break;
      case 'subscription': renderSubscriptionTable(); break;
    }
  }

  /* ----------------------------------------------------------
     1-1. 子Tab渲染
     ---------------------------------------------------------- */

  function renderSubTabs(viewId) {
    var tabs = SUB_TABS[viewId];
    if (!tabs) return '';
    var activeIdx = currentSubTab[viewId] || 0;
    return '<div class="report-sub-tabs">' +
      tabs.map(function (label, i) {
        var cls = i === activeIdx ? 'report-sub-tab active' : 'report-sub-tab';
        return '<div class="' + cls + '" onclick="window._switchSubTab(\'' + viewId + '\',' + i + ')">' + label + '</div>';
      }).join('') +
      '</div>';
  }

  function switchSubTab(viewId, index) {
    currentSubTab[viewId] = index;
    renderView(viewId);
  }

  window._switchSubTab = switchSubTab;

  /* ----------------------------------------------------------
     2. Chart.js 图表渲染
     ---------------------------------------------------------- */

  function destroyChart(key) {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      delete chartInstances[key];
    }
  }

  function destroyAllCharts() {
    Object.keys(chartInstances).forEach(function (k) {
      chartInstances[k].destroy();
    });
    chartInstances = {};
  }

  var defaultChartFont = { family: '"PingFang SC","Microsoft YaHei",sans-serif', size: 11 };

  /* ----------------------------------------------------------
     2-1. 概览视图
     ---------------------------------------------------------- */

  function renderOverview() {
    var el = document.getElementById('viewOverview');
    if (!el) return;

    el.innerHTML =
      buildFilterBar() +
      buildKpiCards() +
      '<div class="report-chart-section">' +
        '<div class="report-chart-box"><div class="report-chart-title"><i class="ri-line-chart-line"></i>出入库趋势（近7天）</div><div class="report-chart-wrap"><canvas id="chartTrend"></canvas></div></div>' +
        '<div class="report-chart-box"><div class="report-chart-title"><i class="ri-bar-chart-grouped-line"></i>订单状态分布</div><div class="report-chart-wrap"><canvas id="chartOrderDist"></canvas></div></div>' +
        '<div class="report-chart-box"><div class="report-chart-title"><i class="ri-bar-chart-horizontal-line"></i>Top5客户入库量</div><div class="report-chart-wrap"><canvas id="chartTop5"></canvas></div></div>' +
        '<div class="report-chart-box"><div class="report-chart-title"><i class="ri-alarm-warning-line"></i>异常预警</div><div id="alertList" style="flex:1;overflow:auto;"></div></div>' +
      '</div>';

    renderChartTrend();
    renderChartOrderDist();
    renderChartTop5();
    renderAlertList();
  }

  function buildFilterBar() {
    return '<div class="report-filter">' +
      '<div class="filter-group"><label>时间范围</label><input type="date" value="2026-04-14"></div>' +
      '<div class="filter-group"><label style="visibility:hidden;">至</label><input type="date" value="2026-04-20"></div>' +
      '<div class="filter-group"><label>仓库</label><select><option>全部仓库</option><option>深圳兴围仓</option><option>广州白云仓</option><option>香港葵涌仓</option></select></div>' +
      '<div class="filter-group"><label>业务线</label><select><option>全部业务线</option><option>干线</option><option>小包</option><option>FBA</option></select></div>' +
      '<div class="filter-actions">' +
        '<button type="button" class="btn btn-secondary" onclick="this.closest(\'.report-filter\').querySelectorAll(\'input,select\').forEach(function(el){el.selectedIndex=0;})"><i class="ri-refresh-line"></i> 重置</button>' +
        '<button type="button" class="btn btn-primary"><i class="ri-search-line"></i> 查询</button>' +
      '</div>' +
    '</div>';
  }

  function buildKpiCards() {
    var cards = [
      { label: '今日入库', value: MOCK.kpi.inbound.toLocaleString(), delta: '5.2%', dir: 'up', icon: 'ri-archive-line', tone: 'blue' },
      { label: '今日出库', value: MOCK.kpi.outbound.toLocaleString(), delta: '3.8%', dir: 'up', icon: 'ri-truck-line', tone: 'green' },
      { label: '当前库存', value: MOCK.kpi.inventory.toLocaleString(), delta: '0.3%', dir: 'down', icon: 'ri-stack-line', tone: 'orange' },
      { label: '在途订单', value: MOCK.kpi.inTransit.toLocaleString(), delta: '2.1%', dir: 'up', icon: 'ri-flight-takeoff-line', tone: 'violet' }
    ];
    return '<div class="kpi-row">' +
      cards.map(function (c) {
        return '<div class="kpi-card">' +
          '<div class="kpi-card-label"><i class="' + c.icon + '"></i> ' + c.label + '</div>' +
          '<div class="kpi-card-value">' + c.value + '</div>' +
          '<div class="kpi-card-change ' + c.dir + '">' +
            '<i class="ri-arrow-' + (c.dir === 'up' ? 'up' : 'down') + '-s-fill"></i> ' + c.delta +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  function renderChartTrend() {
    destroyChart('trend');
    var ctx = document.getElementById('chartTrend');
    if (!ctx) return;
    chartInstances['trend'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MOCK.dates,
        datasets: [
          {
            label: '入库',
            data: MOCK.inbound,
            borderColor: COLORS.blue,
            backgroundColor: 'rgba(77,119,234,0.08)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: COLORS.blue,
            pointBorderWidth: 2,
            borderWidth: 2
          },
          {
            label: '出库',
            data: MOCK.outbound,
            borderColor: COLORS.green,
            backgroundColor: 'rgba(46,182,125,0.08)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: COLORS.green,
            pointBorderWidth: 2,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 12, boxHeight: 8, padding: 16 } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont }, beginAtZero: true }
        }
      }
    });
  }

  function renderChartOrderDist() {
    destroyChart('orderDist');
    var ctx = document.getElementById('chartOrderDist');
    if (!ctx) return;
    var businessLines = ['干线', '小包', 'FBA', '尾程', '卡航', '铁路'];
    var statuses = ['已接单', '处理中', '已拣货', '已出库', '已签收', '已取消'];
    var datasets = statuses.map(function (status, i) {
      return {
        label: status,
        data: businessLines.map(function () { return Math.floor(Math.random() * 80) + 20; }),
        backgroundColor: COLOR_ARR[i],
        borderRadius: 2,
        barPercentage: 0.7
      };
    });
    chartInstances['orderDist'] = new Chart(ctx, {
      type: 'bar',
      data: { labels: businessLines, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 10, boxHeight: 8, padding: 12 } },
          tooltip: { mode: 'index' }
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { stacked: true, grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont } }
        }
      }
    });
  }

  function renderChartTop5() {
    destroyChart('top5');
    var ctx = document.getElementById('chartTop5');
    if (!ctx) return;
    chartInstances['top5'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.top5.map(function (d) { return d.name; }),
        datasets: [{
          label: '入库量',
          data: MOCK.top5.map(function (d) { return d.value; }),
          backgroundColor: [COLORS.blue, COLORS.green, COLORS.orange, COLORS.violet, COLORS.teal],
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                var item = MOCK.top5[ctx.dataIndex];
                return item.name + ': ' + item.value + ' (' + item.pct + '%)';
              }
            }
          }
        },
        scales: {
          x: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont } },
          y: { grid: { display: false }, ticks: { font: defaultChartFont } }
        }
      }
    });
  }

  function renderAlertList() {
    var el = document.getElementById('alertList');
    if (!el) return;
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">' +
      MOCK.alerts.map(function (a) {
        var dotCls = a.status === '已处理' ? 'ok' : (a.type === '库存不足' ? 'error' : 'warn');
        var statusCls = a.status === '已处理' ? 'tag-success' : 'tag-warning';
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);background:#fff;border-radius:4px;">' +
          '<span style="width:8px;height:8px;border-radius:50%;flex:none;background:' + (dotCls === 'ok' ? COLORS.green : (dotCls === 'error' ? COLORS.red : COLORS.orange)) + ';"></span>' +
          '<span style="font-size:12px;font-weight:600;color:var(--text-main);min-width:72px;">' + a.type + '</span>' +
          '<span style="flex:1;font-size:12px;color:var(--text-sub);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + a.detail + '</span>' +
          '<span style="font-size:11px;color:#8fa0b3;flex:none;">' + a.time + '</span>' +
          '<span class="tag ' + statusCls + '">' + a.status + '</span>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  /* ----------------------------------------------------------
     2-2. 入库分析
     ---------------------------------------------------------- */

  function renderInbound(tabIndex) {
    tabIndex = tabIndex || 0;
    var el = document.getElementById('viewInbound');
    if (!el) return;
    currentSubTab['inbound'] = tabIndex;

    el.innerHTML = renderSubTabs('inbound') + '<div class="report-view-content"></div>';
    var content = el.querySelector('.report-view-content');

    if (tabIndex === 0) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-line-chart-line"></i>入库汇总趋势</div><div class="report-chart-wrap"><canvas id="chartInboundSummary"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>日期</th><th>入库总量</th><th>正常量</th><th>异常量</th><th>合格率</th></tr></thead><tbody>' +
        MOCK.inboundSummary.map(function (r) {
          return '<tr><td>' + r.date + '</td><td>' + r.total + '</td><td>' + r.normal + '</td><td>' + r.abnormal + '</td><td>' + r.rate + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderInboundSummaryChart();
    } else if (tabIndex === 1) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-timer-line"></i>上架时效分布</div><div class="report-chart-wrap"><canvas id="chartShelvingTime"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>时效区间</th><th>数量</th><th>占比</th></tr></thead><tbody>' +
        MOCK.shelvingTimeliness.map(function (r) {
          return '<tr><td>' + r.range + '</td><td>' + r.count + '</td><td>' + r.pct + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderShelvingTimeChart();
    } else {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-error-warning-line"></i>入库异常类型分布</div><div class="report-chart-wrap"><canvas id="chartInboundException"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>异常类型</th><th>数量</th><th>占比</th></tr></thead><tbody>' +
        MOCK.inboundException.map(function (r) {
          return '<tr><td>' + r.type + '</td><td>' + r.count + '</td><td>' + r.pct + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderInboundExceptionChart();
    }
  }

  function renderInboundSummaryChart() {
    destroyChart('inboundSummary');
    var ctx = document.getElementById('chartInboundSummary');
    if (!ctx) return;
    chartInstances['inboundSummary'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MOCK.inboundSummary.map(function (r) { return r.date.slice(5); }),
        datasets: [
          {
            label: '入库总量',
            data: MOCK.inboundSummary.map(function (r) { return r.total; }),
            borderColor: COLORS.blue,
            backgroundColor: 'rgba(77,119,234,0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: COLORS.blue,
            borderWidth: 2
          },
          {
            label: '正常量',
            data: MOCK.inboundSummary.map(function (r) { return r.normal; }),
            borderColor: COLORS.green,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 3,
            borderWidth: 2,
            borderDash: [5, 3]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 12, padding: 16 } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont }, beginAtZero: true }
        }
      }
    });
  }

  function renderShelvingTimeChart() {
    destroyChart('shelvingTime');
    var ctx = document.getElementById('chartShelvingTime');
    if (!ctx) return;
    chartInstances['shelvingTime'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.shelvingTimeliness.map(function (r) { return r.range; }),
        datasets: [{
          label: '数量',
          data: MOCK.shelvingTimeliness.map(function (r) { return r.count; }),
          backgroundColor: [COLORS.blue, COLORS.green, COLORS.orange, COLORS.amber, COLORS.red],
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont } }
        }
      }
    });
  }

  function renderInboundExceptionChart() {
    destroyChart('inboundException');
    var ctx = document.getElementById('chartInboundException');
    if (!ctx) return;
    chartInstances['inboundException'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: MOCK.inboundException.map(function (r) { return r.type; }),
        datasets: [{
          data: MOCK.inboundException.map(function (r) { return r.count; }),
          backgroundColor: COLOR_ARR.slice(0, 5),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: defaultChartFont, boxWidth: 12, padding: 14 } }
        },
        cutout: '55%'
      }
    });
  }

  /* ----------------------------------------------------------
     2-3. 出库分析
     ---------------------------------------------------------- */

  function renderOutbound(tabIndex) {
    tabIndex = tabIndex || 0;
    var el = document.getElementById('viewOutbound');
    if (!el) return;
    currentSubTab['outbound'] = tabIndex;

    el.innerHTML = renderSubTabs('outbound') + '<div class="report-view-content"></div>';
    var content = el.querySelector('.report-view-content');

    if (tabIndex === 0) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-line-chart-line"></i>出库汇总趋势</div><div class="report-chart-wrap"><canvas id="chartOutboundSummary"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>日期</th><th>出库总量</th><th>正常量</th><th>异常量</th><th>合格率</th></tr></thead><tbody>' +
        MOCK.outboundSummary.map(function (r) {
          return '<tr><td>' + r.date + '</td><td>' + r.total + '</td><td>' + r.normal + '</td><td>' + r.abnormal + '</td><td>' + r.rate + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderOutboundSummaryChart();
    } else if (tabIndex === 1) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-timer-line"></i>拣货时效分布</div><div class="report-chart-wrap"><canvas id="chartPickingTime"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>时效区间</th><th>数量</th><th>占比</th></tr></thead><tbody>' +
        MOCK.pickingTimeliness.map(function (r) {
          return '<tr><td>' + r.range + '</td><td>' + r.count + '</td><td>' + r.pct + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderPickingTimeChart();
    } else {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-error-warning-line"></i>出库异常类型分布</div><div class="report-chart-wrap"><canvas id="chartOutboundException"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>异常类型</th><th>数量</th><th>占比</th></tr></thead><tbody>' +
        MOCK.outboundException.map(function (r) {
          return '<tr><td>' + r.type + '</td><td>' + r.count + '</td><td>' + r.pct + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderOutboundExceptionChart();
    }
  }

  function renderOutboundSummaryChart() {
    destroyChart('outboundSummary');
    var ctx = document.getElementById('chartOutboundSummary');
    if (!ctx) return;
    chartInstances['outboundSummary'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MOCK.outboundSummary.map(function (r) { return r.date.slice(5); }),
        datasets: [
          {
            label: '出库总量',
            data: MOCK.outboundSummary.map(function (r) { return r.total; }),
            borderColor: COLORS.green,
            backgroundColor: 'rgba(46,182,125,0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: COLORS.green,
            borderWidth: 2
          },
          {
            label: '正常量',
            data: MOCK.outboundSummary.map(function (r) { return r.normal; }),
            borderColor: COLORS.blue,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 3,
            borderWidth: 2,
            borderDash: [5, 3]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 12, padding: 16 } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont }, beginAtZero: true }
        }
      }
    });
  }

  function renderPickingTimeChart() {
    destroyChart('pickingTime');
    var ctx = document.getElementById('chartPickingTime');
    if (!ctx) return;
    chartInstances['pickingTime'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.pickingTimeliness.map(function (r) { return r.range; }),
        datasets: [{
          label: '数量',
          data: MOCK.pickingTimeliness.map(function (r) { return r.count; }),
          backgroundColor: [COLORS.green, COLORS.blue, COLORS.orange, COLORS.amber, COLORS.red],
          borderRadius: 4,
          barPercentage: 0.6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont } }
        }
      }
    });
  }

  function renderOutboundExceptionChart() {
    destroyChart('outboundException');
    var ctx = document.getElementById('chartOutboundException');
    if (!ctx) return;
    chartInstances['outboundException'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: MOCK.outboundException.map(function (r) { return r.type; }),
        datasets: [{
          data: MOCK.outboundException.map(function (r) { return r.count; }),
          backgroundColor: COLOR_ARR.slice(0, 5),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: defaultChartFont, boxWidth: 12, padding: 14 } }
        },
        cutout: '55%'
      }
    });
  }

  /* ----------------------------------------------------------
     2-4. 库存分析
     ---------------------------------------------------------- */

  function renderInventory(tabIndex) {
    tabIndex = tabIndex || 0;
    var el = document.getElementById('viewInventory');
    if (!el) return;
    currentSubTab['inventory'] = tabIndex;

    el.innerHTML = renderSubTabs('inventory') + '<div class="report-view-content"></div>';
    var content = el.querySelector('.report-view-content');

    if (tabIndex === 0) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="kpi-row">' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-stack-line"></i> 总SKU数</div><div class="kpi-card-value">9,150</div><div class="kpi-card-change up"><i class="ri-arrow-up-s-fill"></i> 3.2%</div></div>' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-archive-line"></i> 总库存量</div><div class="kpi-card-value">148,550</div><div class="kpi-card-change down"><i class="ri-arrow-down-s-fill"></i> 1.5%</div></div>' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-map-pin-line"></i> 库位利用率</div><div class="kpi-card-value">80.6%</div><div class="kpi-card-change up"><i class="ri-arrow-up-s-fill"></i> 2.1%</div></div>' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-refresh-line"></i> 周转率</div><div class="kpi-card-value">5.1</div><div class="kpi-card-change up"><i class="ri-arrow-up-s-fill"></i> 6.3%</div></div>' +
        '</div>' +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-bar-chart-grouped-line"></i>各仓库库存概览</div><div class="report-chart-wrap"><canvas id="chartInventoryOverview"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>仓库</th><th>SKU数</th><th>总库存量</th><th>已用库位</th><th>总库位</th><th>利用率</th></tr></thead><tbody>' +
        MOCK.inventoryOverview.map(function (r) {
          return '<tr><td>' + r.warehouse + '</td><td>' + r.totalSku.toLocaleString() + '</td><td>' + r.totalQty.toLocaleString() + '</td><td>' + r.usedLocation + '</td><td>' + r.totalLocation + '</td><td>' + r.usageRate + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderInventoryOverviewChart();
    } else if (tabIndex === 1) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-time-line"></i>库龄分布</div><div class="report-chart-wrap"><canvas id="chartInventoryAge"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>库龄区间</th><th>数量</th><th>占比</th></tr></thead><tbody>' +
        MOCK.inventoryAge.map(function (r) {
          return '<tr><td>' + r.range + '</td><td>' + r.count.toLocaleString() + '</td><td>' + r.pct + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderInventoryAgeChart();
    } else {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-line-chart-line"></i>库存周转率趋势</div><div class="report-chart-wrap"><canvas id="chartInventoryTurnover"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>月份</th><th>周转率</th><th>库存天数</th></tr></thead><tbody>' +
        MOCK.inventoryTurnover.map(function (r) {
          return '<tr><td>' + r.month + '</td><td>' + r.turnoverRate + '</td><td>' + r.daysOnHand + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderInventoryTurnoverChart();
    }
  }

  function renderInventoryOverviewChart() {
    destroyChart('inventoryOverview');
    var ctx = document.getElementById('chartInventoryOverview');
    if (!ctx) return;
    chartInstances['inventoryOverview'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.inventoryOverview.map(function (r) { return r.warehouse; }),
        datasets: [
          {
            label: 'SKU数',
            data: MOCK.inventoryOverview.map(function (r) { return r.totalSku; }),
            backgroundColor: COLORS.blue,
            borderRadius: 4,
            barPercentage: 0.4,
            categoryPercentage: 0.6
          },
          {
            label: '总库存量',
            data: MOCK.inventoryOverview.map(function (r) { return r.totalQty; }),
            backgroundColor: COLORS.green,
            borderRadius: 4,
            barPercentage: 0.4,
            categoryPercentage: 0.6,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 12, padding: 16 } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont }, position: 'left', title: { display: true, text: 'SKU数', font: defaultChartFont } },
          y1: { grid: { display: false }, ticks: { font: defaultChartFont }, position: 'right', title: { display: true, text: '总库存量', font: defaultChartFont } }
        }
      }
    });
  }

  function renderInventoryAgeChart() {
    destroyChart('inventoryAge');
    var ctx = document.getElementById('chartInventoryAge');
    if (!ctx) return;
    chartInstances['inventoryAge'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: MOCK.inventoryAge.map(function (r) { return r.range; }),
        datasets: [{
          data: MOCK.inventoryAge.map(function (r) { return r.count; }),
          backgroundColor: [COLORS.blue, COLORS.green, COLORS.orange, COLORS.amber, COLORS.red],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: defaultChartFont, boxWidth: 12, padding: 14 } }
        },
        cutout: '55%'
      }
    });
  }

  function renderInventoryTurnoverChart() {
    destroyChart('inventoryTurnover');
    var ctx = document.getElementById('chartInventoryTurnover');
    if (!ctx) return;
    chartInstances['inventoryTurnover'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MOCK.inventoryTurnover.map(function (r) { return r.month; }),
        datasets: [
          {
            label: '周转率',
            data: MOCK.inventoryTurnover.map(function (r) { return parseFloat(r.turnoverRate); }),
            borderColor: COLORS.blue,
            backgroundColor: 'rgba(77,119,234,0.1)',
            fill: true,
            tension: 0.35,
            pointRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: COLORS.blue,
            borderWidth: 2,
            yAxisID: 'y'
          },
          {
            label: '库存天数',
            data: MOCK.inventoryTurnover.map(function (r) { return r.daysOnHand; }),
            borderColor: COLORS.orange,
            backgroundColor: 'transparent',
            tension: 0.35,
            pointRadius: 4,
            borderWidth: 2,
            borderDash: [5, 3],
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 12, padding: 16 } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont }, position: 'left', title: { display: true, text: '周转率', font: defaultChartFont } },
          y1: { grid: { display: false }, ticks: { font: defaultChartFont }, position: 'right', title: { display: true, text: '库存天数', font: defaultChartFont } }
        }
      }
    });
  }

  /* ----------------------------------------------------------
     2-5. 订单分析
     ---------------------------------------------------------- */

  function renderOrder(tabIndex) {
    tabIndex = tabIndex || 0;
    var el = document.getElementById('viewOrder');
    if (!el) return;
    currentSubTab['order'] = tabIndex;

    el.innerHTML = renderSubTabs('order') + '<div class="report-view-content"></div>';
    var content = el.querySelector('.report-view-content');

    if (tabIndex === 0) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="kpi-row">' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-file-list-3-line"></i> 订单总量</div><div class="kpi-card-value">3,840</div><div class="kpi-card-change up"><i class="ri-arrow-up-s-fill"></i> 4.5%</div></div>' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-checkbox-circle-line"></i> 完成量</div><div class="kpi-card-value">3,630</div><div class="kpi-card-change up"><i class="ri-arrow-up-s-fill"></i> 5.1%</div></div>' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-close-circle-line"></i> 取消量</div><div class="kpi-card-value">80</div><div class="kpi-card-change down"><i class="ri-arrow-down-s-fill"></i> 2.3%</div></div>' +
          '<div class="kpi-card"><div class="kpi-card-label"><i class="ri-time-line"></i> 待处理</div><div class="kpi-card-value">130</div><div class="kpi-card-change up"><i class="ri-arrow-up-s-fill"></i> 1.8%</div></div>' +
        '</div>' +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-bar-chart-grouped-line"></i>订单趋势（近7天）</div><div class="report-chart-wrap"><canvas id="chartOrderSummary"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>日期</th><th>订单总量</th><th>已完成</th><th>已取消</th><th>待处理</th></tr></thead><tbody>' +
        MOCK.orderSummary.map(function (r) {
          return '<tr><td>' + r.date + '</td><td>' + r.total + '</td><td>' + r.completed + '</td><td>' + r.cancelled + '</td><td>' + r.pending + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderOrderSummaryChart();
    } else if (tabIndex === 1) {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-timer-line"></i>各节点平均时效</div><div class="report-chart-wrap"><canvas id="chartOrderTimeliness"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>节点</th><th>平均耗时(h)</th><th>目标耗时(h)</th><th>达标率</th></tr></thead><tbody>' +
        MOCK.orderTimeliness.map(function (r) {
          return '<tr><td>' + r.stage + '</td><td>' + r.avgHours + '</td><td>' + r.targetHours + '</td><td>' + r.rate + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderOrderTimelinessChart();
    } else {
      content.innerHTML =
        buildFilterBar() +
        '<div class="report-chart-section"><div class="report-chart-box full"><div class="report-chart-title"><i class="ri-error-warning-line"></i>异常订单类型分布</div><div class="report-chart-wrap"><canvas id="chartOrderException"></canvas></div></div></div>' +
        '<div class="report-table-section"><table class="report-table"><thead><tr><th>异常类型</th><th>数量</th><th>占比</th></tr></thead><tbody>' +
        MOCK.orderException.map(function (r) {
          return '<tr><td>' + r.type + '</td><td>' + r.count + '</td><td>' + r.pct + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';
      renderOrderExceptionChart();
    }
  }

  function renderOrderSummaryChart() {
    destroyChart('orderSummary');
    var ctx = document.getElementById('chartOrderSummary');
    if (!ctx) return;
    chartInstances['orderSummary'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.orderSummary.map(function (r) { return r.date.slice(5); }),
        datasets: [
          {
            label: '已完成',
            data: MOCK.orderSummary.map(function (r) { return r.completed; }),
            backgroundColor: COLORS.green,
            borderRadius: 2,
            barPercentage: 0.6
          },
          {
            label: '待处理',
            data: MOCK.orderSummary.map(function (r) { return r.pending; }),
            backgroundColor: COLORS.orange,
            borderRadius: 2,
            barPercentage: 0.6
          },
          {
            label: '已取消',
            data: MOCK.orderSummary.map(function (r) { return r.cancelled; }),
            backgroundColor: COLORS.red,
            borderRadius: 2,
            barPercentage: 0.6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 10, padding: 14 } },
          tooltip: { mode: 'index' }
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { stacked: true, grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont } }
        }
      }
    });
  }

  function renderOrderTimelinessChart() {
    destroyChart('orderTimeliness');
    var ctx = document.getElementById('chartOrderTimeliness');
    if (!ctx) return;
    chartInstances['orderTimeliness'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.orderTimeliness.map(function (r) { return r.stage; }),
        datasets: [
          {
            label: '平均耗时(h)',
            data: MOCK.orderTimeliness.map(function (r) { return r.avgHours; }),
            backgroundColor: COLORS.blue,
            borderRadius: 4,
            barPercentage: 0.5
          },
          {
            label: '目标耗时(h)',
            data: MOCK.orderTimeliness.map(function (r) { return r.targetHours; }),
            backgroundColor: COLORS.orange,
            borderRadius: 4,
            barPercentage: 0.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { font: defaultChartFont, boxWidth: 12, padding: 16 } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: defaultChartFont } },
          y: { grid: { color: '#f0f3f7' }, ticks: { font: defaultChartFont }, beginAtZero: true }
        }
      }
    });
  }

  function renderOrderExceptionChart() {
    destroyChart('orderException');
    var ctx = document.getElementById('chartOrderException');
    if (!ctx) return;
    chartInstances['orderException'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: MOCK.orderException.map(function (r) { return r.type; }),
        datasets: [{
          data: MOCK.orderException.map(function (r) { return r.count; }),
          backgroundColor: COLOR_ARR.slice(0, 5),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: defaultChartFont, boxWidth: 12, padding: 14 } }
        },
        cutout: '55%'
      }
    });
  }

  /* ----------------------------------------------------------
     2-6. 自定义报表列表
     ---------------------------------------------------------- */

  function renderCustomList() {
    var el = document.getElementById('customList');
    if (!el) return;
    el.innerHTML = MOCK.customReports.map(function (r) {
      return '<div class="custom-list-item">' +
        '<div class="custom-item-info">' +
          '<div class="custom-item-name">' + r.name + '</div>' +
          '<div class="custom-item-desc">' + r.desc + ' | ' + r.domain + ' | ' + r.creator + ' | ' + r.updateTime + '</div>' +
        '</div>' +
        '<div class="custom-item-actions">' +
          '<button class="act-btn" title="编辑"><i class="ri-edit-line"></i></button>' +
          '<button class="act-btn" title="运行"><i class="ri-play-line"></i></button>' +
          '<button class="act-btn danger" title="删除"><i class="ri-delete-bin-line"></i></button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ----------------------------------------------------------
     2-7. 订阅与推送表格
     ---------------------------------------------------------- */

  function renderSubscriptionTable() {
    var tbody = document.getElementById('subTableBody');
    if (!tbody) return;
    tbody.innerHTML = MOCK.subscriptions.map(function (r, i) {
      var statusTag = r.status === '启用' ? 'tag-success' : 'tag-gray';
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td>' + r.name + '</td>' +
        '<td>' + r.report + '</td>' +
        '<td>' + r.freq + '</td>' +
        '<td>' + r.time + '</td>' +
        '<td>' + r.method + '</td>' +
        '<td><span class="tag ' + statusTag + '">' + r.status + '</span></td>' +
        '<td>' +
          '<button class="btn btn-secondary" style="height:26px;padding:0 8px;font-size:12px;"><i class="ri-edit-line"></i> 编辑</button> ' +
          '<button class="btn btn-secondary" style="height:26px;padding:0 8px;font-size:12px;"><i class="' + (r.status === '启用' ? 'ri-pause-line' : 'ri-play-line') + '"></i> ' + (r.status === '启用' ? '停用' : '启用') + '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  /* ----------------------------------------------------------
     3. 弹窗管理
     ---------------------------------------------------------- */

  function openCreateModal() {
    wizardStep = 1;
    selectedDomain = '';
    var modal = document.getElementById('createModal');
    if (modal) modal.classList.add('visible');
    renderWizardStep();
  }

  function closeCreateModal() {
    var modal = document.getElementById('createModal');
    if (modal) modal.classList.remove('visible');
  }

  function openSubscribeModal() {
    var modal = document.getElementById('subscribeModal');
    if (modal) modal.classList.add('visible');
  }

  function closeSubscribeModal() {
    var modal = document.getElementById('subscribeModal');
    if (modal) modal.classList.remove('visible');
  }

  window.openCreateModal = openCreateModal;
  window.closeCreateModal = closeCreateModal;
  window.openSubscribeModal = openSubscribeModal;
  window.closeSubscribeModal = closeSubscribeModal;

  /* ----------------------------------------------------------
     3-1. 向导步骤
     ---------------------------------------------------------- */

  function renderWizardStep() {
    // 步骤指示器
    var stepsEl = document.getElementById('wizardSteps');
    var stepLabels = ['选择数据域', '配置维度指标', '预览保存'];
    if (stepsEl) {
      stepsEl.innerHTML = stepLabels.map(function (label, i) {
        var num = i + 1;
        var stepCls = 'wizard-step';
        if (num < wizardStep) stepCls += ' done';
        else if (num === wizardStep) stepCls += ' active';
        var html = '<div class="' + stepCls + '">' +
          '<span class="wizard-step-number">' + (num < wizardStep ? '\u2713' : num) + '</span>' +
          '<span class="wizard-step-label">' + label + '</span>' +
        '</div>';
        if (num < 3) {
          var connCls = 'wizard-step-connector';
          if (num < wizardStep) connCls += ' done';
          html += '<div class="' + connCls + '"></div>';
        }
        return html;
      }).join('');
    }

    // 按钮显隐
    var prevBtn = document.getElementById('wizardPrevBtn');
    var nextBtn = document.getElementById('wizardNextBtn');
    var saveBtn = document.getElementById('wizardSaveBtn');
    if (prevBtn) prevBtn.style.display = wizardStep > 1 ? '' : 'none';
    if (nextBtn) nextBtn.style.display = wizardStep < 3 ? '' : 'none';
    if (saveBtn) saveBtn.style.display = wizardStep === 3 ? '' : 'none';

    // 步骤内容
    var s1 = document.getElementById('wizardStep1');
    var s2 = document.getElementById('wizardStep2');
    var s3 = document.getElementById('wizardStep3');
    if (s1) s1.style.display = wizardStep === 1 ? '' : 'none';
    if (s2) s2.style.display = wizardStep === 2 ? '' : 'none';
    if (s3) s3.style.display = wizardStep === 3 ? '' : 'none';

    // 渲染各步骤内容
    if (wizardStep === 1) renderWizardStep1();
    if (wizardStep === 2) renderWizardStep2();
    if (wizardStep === 3) renderWizardStep3();
  }

  function renderWizardStep1() {
    var el = document.getElementById('wizardStep1');
    if (!el) return;
    var domains = [
      { id: 'inbound', icon: 'ri-archive-line', name: '入库', desc: '入库量、上架时效、入库异常' },
      { id: 'outbound', icon: 'ri-truck-line', name: '出库', desc: '出库量、拣货时效、出库异常' },
      { id: 'inventory', icon: 'ri-stack-line', name: '库存', desc: '库存量、库龄、周转率' },
      { id: 'order', icon: 'ri-file-list-3-line', name: '订单', desc: '订单量、订单时效、异常订单' },
      { id: 'finance', icon: 'ri-money-cny-box-line', name: '财务', desc: '费用、结算、对账' },
      { id: 'custom', icon: 'ri-apps-line', name: '综合', desc: '跨域自定义分析' }
    ];
    el.innerHTML = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">' +
      domains.map(function (d) {
        var sel = d.id === selectedDomain ? ' selected' : '';
        return '<div class="domain-card' + sel + '" onclick="window._selectDomain(\'' + d.id + '\')">' +
          '<i class="domain-card-icon ' + d.icon + '"></i>' +
          '<div class="domain-card-name">' + d.name + '</div>' +
          '<div class="domain-card-desc">' + d.desc + '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  function selectDomain(domain) {
    selectedDomain = domain;
    renderWizardStep1();
  }

  window._selectDomain = selectDomain;

  function renderWizardStep2() {
    var el = document.getElementById('wizardStep2');
    if (!el) return;
    el.innerHTML =
      '<div class="form-group">' +
        '<label class="form-label required">报表名称</label>' +
        '<input type="text" class="form-input" placeholder="请输入报表名称" maxlength="50" style="width:100%;">' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">' +
        '<div>' +
          '<div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:12px;">维度配置</div>' +
          '<div class="form-group"><label class="form-label">时间维度</label><select class="form-select" style="width:100%;"><option>按日</option><option>按周</option><option>按月</option></select></div>' +
          '<div class="form-group"><label class="form-label">仓库维度</label><select class="form-select" style="width:100%;"><option>全部仓库</option><option>深圳兴围仓</option><option>广州白云仓</option></select></div>' +
          '<div class="form-group"><label class="form-label">客户维度</label><select class="form-select" style="width:100%;"><option>全部客户</option><option>Top10客户</option></select></div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:12px;">指标配置</div>' +
          '<div class="form-group"><label class="form-label">主指标</label><select class="form-select" style="width:100%;"><option>入库量</option><option>出库量</option><option>库存量</option></select></div>' +
          '<div class="form-group"><label class="form-label">副指标</label><select class="form-select" style="width:100%;"><option>合格率</option><option>时效</option><option>异常量</option></select></div>' +
          '<div class="form-group"><label class="form-label">图表类型</label><select class="form-select" style="width:100%;"><option>折线图</option><option>柱状图</option><option>饼图</option></select></div>' +
        '</div>' +
      '</div>';
  }

  function renderWizardStep3() {
    var el = document.getElementById('wizardStep3');
    if (!el) return;
    el.innerHTML =
      '<div style="border:1px solid var(--line);background:#fff;border-radius:6px;padding:20px;">' +
        '<div style="font-size:16px;font-weight:700;color:var(--text-main);margin-bottom:12px;">报表预览</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:16px;font-size:12px;color:var(--text-sub);margin-bottom:14px;">' +
          '<span><strong>数据域:</strong> ' + (selectedDomain || '入库') + '</span>' +
          '<span><strong>时间维度:</strong> 按日</span>' +
          '<span><strong>仓库:</strong> 全部仓库</span>' +
          '<span><strong>主指标:</strong> 入库量</span>' +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse;">' +
          '<thead><tr>' +
            '<th style="padding:8px 12px;background:var(--panel-soft);border:1px solid var(--line);font-size:12px;color:var(--text-sub);text-align:left;">日期</th>' +
            '<th style="padding:8px 12px;background:var(--panel-soft);border:1px solid var(--line);font-size:12px;color:var(--text-sub);text-align:left;">入库量</th>' +
            '<th style="padding:8px 12px;background:var(--panel-soft);border:1px solid var(--line);font-size:12px;color:var(--text-sub);text-align:left;">合格率</th>' +
          '</tr></thead>' +
          '<tbody>' +
            '<tr><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">2026-04-14</td><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">320</td><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">96.9%</td></tr>' +
            '<tr><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">2026-04-15</td><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">280</td><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">97.1%</td></tr>' +
            '<tr><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">2026-04-16</td><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">350</td><td style="padding:8px 12px;border:1px solid var(--line);font-size:12px;color:var(--text-sub);">96.6%</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>';
  }

  function nextWizardStep() {
    if (wizardStep < 3) {
      wizardStep++;
      renderWizardStep();
    }
  }

  function prevWizardStep() {
    if (wizardStep > 1) {
      wizardStep--;
      renderWizardStep();
    }
  }

  window.nextWizardStep = nextWizardStep;
  window.prevWizardStep = prevWizardStep;

  /* ----------------------------------------------------------
     4. 辅助函数
     ---------------------------------------------------------- */

  function handleExport() {
    var viewName = BREADCRUMB_MAP[currentView] || '报表';
    alert('正在导出「' + viewName + '」数据，请稍候...');
  }

  window.handleExport = handleExport;

  /* ----------------------------------------------------------
     5. 初始化
     ---------------------------------------------------------- */

  function init() {
    renderNav();
    renderHeaderTabs();
    renderOverview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

})();
