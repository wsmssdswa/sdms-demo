(function () {
  'use strict';

  /* ==================== 常量 ==================== */
  var FIELDS = ['到货形式', '货物类型', '货物属性', 'SKU数量', '柜型', '箱数', '单箱重量'];

  var FIELD_VALUES = {
    '到货形式': ['整柜', '散货'],
    '货物类型': ['箱货', '托盘货'],
    '货物属性': ['普货', '带电', '液体'],
    '柜型': ['20GP', '40GP', '40HQ']
  };

  var OPERATOR_OPTIONS = {
    '到货形式': ['='],
    '货物类型': ['=', '包含'],
    '货物属性': ['='],
    '柜型': ['='],
    'SKU数量': ['>', '>=', '<', '<=', '介于'],
    '箱数': ['>', '>=', '<', '<=', '介于'],
    '单箱重量': ['>', '>=', '<', '<=', '介于']
  };

  var NUMERIC_FIELDS = ['SKU数量', '箱数', '单箱重量'];
  var CHARGE_UNITS = ['柜', '箱', '托', 'kg', 'SKU'];
  var ROUND_OPTIONS = [{ value: 'up', label: '向上取整' }, { value: 'none', label: '不进位' }, { value: 'half', label: '四舍五入' }];

  /* ==================== 状态 ==================== */
  var nextId = 1000;
  function genId() { return ++nextId; }

  function createCondition(field, operator, value) {
    return { id: genId(), field: field || '', operator: operator || '=', value: value || '', startValue: '', endValue: '', leftOpen: true, rightOpen: false };
  }

  function createRule() {
    return {
      id: genId(),
      conditions: [],
      chargeUnit: '柜',
      unitPrice: '',
      waiveAmount: '',
      unitQty: '1',
      roundUp: 'none',
      baseFee: '',
      minFee: '',
      maxFee: '',
      advancedOpen: false
    };
  }

  function createScenario() {
    return {
      id: genId(),
      primaryConditions: [createCondition()],
      secondaryRules: [createRule()]
    };
  }

  var state = {
    scenarios: [
      {
        id: 1,
        primaryConditions: [
          { id: 11, field: '到货形式', operator: '=', value: '整柜', startValue: '', endValue: '' },
          { id: 12, field: '货物类型', operator: '包含', value: '箱货', startValue: '', endValue: '' }
        ],
        secondaryRules: [
          { id: 101, conditions: [{ id: 111, field: '柜型', operator: '=', value: '20GP', startValue: '', endValue: '' }], chargeUnit: '柜', unitPrice: 300, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false },
          { id: 102, conditions: [{ id: 112, field: '柜型', operator: '=', value: '40GP', startValue: '', endValue: '' }], chargeUnit: '柜', unitPrice: 350, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false },
          { id: 103, conditions: [{ id: 113, field: '柜型', operator: '=', value: '40HQ', startValue: '', endValue: '' }], chargeUnit: '柜', unitPrice: 450, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false },
          { id: 104, conditions: [{ id: 114, field: '箱数', operator: '>', value: '700', startValue: '', endValue: '' }], chargeUnit: '箱', unitPrice: 0.3, waiveAmount: '700', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false }
        ]
      },
      {
        id: 2,
        primaryConditions: [
          { id: 21, field: '到货形式', operator: '=', value: '整柜', startValue: '', endValue: '' },
          { id: 22, field: '货物类型', operator: '=', value: '托盘货', startValue: '', endValue: '' }
        ],
        secondaryRules: [
          { id: 201, conditions: [{ id: 211, field: '柜型', operator: '=', value: '20GP', startValue: '', endValue: '' }], chargeUnit: '柜', unitPrice: 220, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false },
          { id: 202, conditions: [{ id: 212, field: '柜型', operator: '=', value: '40GP', startValue: '', endValue: '' }], chargeUnit: '柜', unitPrice: 330, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false },
          { id: 203, conditions: [{ id: 213, field: '柜型', operator: '=', value: '40HQ', startValue: '', endValue: '' }], chargeUnit: '柜', unitPrice: 350, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false }
        ]
      },
      {
        id: 3,
        primaryConditions: [
          { id: 31, field: '到货形式', operator: '=', value: '散货', startValue: '', endValue: '' }
        ],
        secondaryRules: [
          { id: 301, conditions: [{ id: 311, field: '货物类型', operator: '包含', value: '箱货', startValue: '', endValue: '' }], chargeUnit: '箱', unitPrice: 1, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false },
          { id: 302, conditions: [{ id: 312, field: '货物类型', operator: '包含', value: '托盘货', startValue: '', endValue: '' }], chargeUnit: '托', unitPrice: 15, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false },
          { id: 303, conditions: [{ id: 313, field: '单箱重量', operator: '>', value: '23', startValue: '', endValue: '' }], chargeUnit: 'kg', unitPrice: 0.1, waiveAmount: '', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '', advancedOpen: false }
        ]
      },
      {
        id: 4,
        primaryConditions: [
          { id: 41, field: 'SKU数量', operator: '>', value: '20', startValue: '', endValue: '' }
        ],
        secondaryRules: [
          { id: 401, conditions: [], chargeUnit: 'SKU', unitPrice: 10, waiveAmount: '20', unitQty: '1', roundUp: 'none', baseFee: '', minFee: '', maxFee: '100', advancedOpen: false }
        ]
      }
    ],
    editingId: null,
    draft: null,
    isCreating: false
  };

  /* ==================== DOM ==================== */
  var ruleCardsEl = document.getElementById('ruleCards');
  var addScenarioBtn = document.getElementById('addScenarioBtn');
  var toastStack = document.getElementById('toastStack');
  var simulateBtn = document.getElementById('simulateBtn');
  var saveBtn = document.getElementById('saveBtn');
  var trialFeeModal = document.getElementById('trialFeeModal');
  var trialModalClose = document.getElementById('trialModalClose');
  var trialRunBtn = document.getElementById('trialRunBtn');
  var trialBoardScroll = document.getElementById('trialBoardScroll');
  var trialTotalValue = document.getElementById('trialTotalValue');
  var trialInlineStatus = document.getElementById('trialInlineStatus');
  var trialSummary = document.getElementById('trialSummary');
  var currencySelect = document.getElementById('currency');
  var chargeNameInput = document.getElementById('chargeName');

  /* ==================== 工具函数 ==================== */
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getCurrency() {
    return currencySelect ? currencySelect.value : 'EUR';
  }

  function getSymbol(c) {
    return { EUR: '€', USD: '$', CNY: '¥' }[c] || c || '€';
  }

  function isNumericField(field) {
    return NUMERIC_FIELDS.indexOf(field) !== -1;
  }

  function isRangeOp(op) {
    return op === '介于';
  }

  function showToast(msg, type) {
    var el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    el.textContent = msg;
    toastStack.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('toast-show'); });
    setTimeout(function () {
      el.classList.remove('toast-show');
      setTimeout(function () { el.remove(); }, 300);
    }, 2500);
  }

  /* ==================== 格式化 ==================== */
  function fmtCond(c) {
    if (!c || !c.field) return '';
    if (isRangeOp(c.operator)) {
      var lb = c.leftOpen ? '(' : '[';
      var rb = c.rightOpen ? ')' : ']';
      return c.field + '介于' + lb + c.startValue + ', ' + c.endValue + rb;
    }
    return c.field + ' ' + c.operator + ' ' + c.value;
  }

  function fmtScenarioCondition(scenario) {
    var conds = scenario.primaryConditions.filter(function (c) { return c.field; });
    if (!conds.length) return '任何情况';
    return '当 ' + conds.map(fmtCond).join(' 且 ') + ' 时';
  }

  function fmtRuleText(rule, sym) {
    var parts = [];
    var conds = rule.conditions.filter(function (c) { return c.field; });
    if (conds.length) {
      parts.push(conds.map(fmtCond).join(' 且 '));
    }
    var price = sym + rule.unitPrice + '/' + rule.chargeUnit;
    if (rule.waiveAmount) {
      price = '超出部分 ' + sym + rule.unitPrice + '/' + rule.chargeUnit;
    }
    parts.push(price);
    if (rule.baseFee) parts.push('基础费 ' + sym + rule.baseFee);
    if (rule.minFee) parts.push('最低 ' + sym + rule.minFee);
    if (rule.maxFee) parts.push('最高 ' + sym + rule.maxFee);
    return parts.join('，');
  }

  /* ==================== 渲染：读模式 ==================== */
  function renderReadCard(scenario, index) {
    var sym = getSymbol(getCurrency());
    var condText = fmtScenarioCondition(scenario);

    var rulesHtml = scenario.secondaryRules.map(function (rule) {
      var conds = rule.conditions.filter(function (c) { return c.field; });
      var condPart = conds.length ? conds.map(fmtCond).join(' 且 ') : '无附加条件';
      var priceStr = sym + rule.unitPrice + '/' + rule.chargeUnit;
      if (rule.waiveAmount) priceStr = '减免前' + rule.waiveAmount + rule.chargeUnit + '，超出部分 ' + sym + rule.unitPrice + '/' + rule.chargeUnit;
      var detailParts = [];
      if (rule.baseFee) detailParts.push('基础费' + sym + rule.baseFee);
      if (rule.minFee) detailParts.push('最低' + sym + rule.minFee);
      if (rule.maxFee) detailParts.push('最高' + sym + rule.maxFee);
      var detailHtml = detailParts.length ? '<span class="pl-detail">（' + detailParts.join('，') + '）</span>' : '';

      return '<div class="pricing-line">' +
        '<span class="pl-cond">' + esc(condPart) + '</span>' +
        '<span class="pl-arrow">→</span>' +
        '<span class="pl-value">' + esc(priceStr) + '</span>' +
        detailHtml +
        '</div>';
    }).join('');

    var isEditing = state.editingId !== null;

    return '<div class="scenario-card" data-sid="' + scenario.id + '">' +
      '<div class="scenario-header">' +
        '<span class="scenario-badge">场景 ' + (index + 1) + '</span>' +
        '<span class="scenario-condition">' + esc(condText) + '</span>' +
        '<div class="scenario-actions">' +
          '<button class="btn-link" data-action="edit" data-sid="' + scenario.id + '"' + (isEditing ? ' disabled' : '') + '>编辑</button>' +
          '<button class="btn-link danger" data-action="delete" data-sid="' + scenario.id + '"' + (isEditing ? ' disabled' : '') + '>删除</button>' +
        '</div>' +
      '</div>' +
      '<div class="scenario-body">' + rulesHtml + '</div>' +
    '</div>';
  }

  /* ==================== 渲染：编辑模式 ==================== */
  function renderFieldSelect(selected, extraAttrs) {
    return '<select class="inline-select" ' + (extraAttrs || '') + '>' +
      '<option value="">选择变量</option>' +
      FIELDS.map(function (f) { return '<option value="' + f + '"' + (f === selected ? ' selected' : '') + '>' + f + '</option>'; }).join('') +
    '</select>';
  }

  function renderOperatorSelect(field, selected, extraAttrs) {
    var ops = OPERATOR_OPTIONS[field] || ['='];
    return '<select class="inline-select" ' + (extraAttrs || '') + '>' +
      ops.map(function (o) { return '<option value="' + o + '"' + (o === selected ? ' selected' : '') + '>' + o + '</option>'; }).join('') +
    '</select>';
  }

  function renderValueControl(field, cond) {
    if (isRangeOp(cond.operator)) {
      var leftBracket = cond.leftOpen ? '(' : '[';
      var rightBracket = cond.rightOpen ? ')' : ']';
      return '<button class="bracket-toggle" data-action="toggle-left-bracket" data-cid="' + cond.id + '" title="点击切换开/闭区间">' + leftBracket + '</button>' +
        '<input class="inline-input narrow" type="number" value="' + esc(cond.startValue) + '" placeholder="起始" data-prop="startValue">' +
        '<span class="ple-sep">,</span>' +
        '<input class="inline-input narrow" type="number" value="' + esc(cond.endValue) + '" placeholder="结束" data-prop="endValue">' +
        '<button class="bracket-toggle" data-action="toggle-right-bracket" data-cid="' + cond.id + '" title="点击切换开/闭区间">' + rightBracket + '</button>';
    }
    if (isNumericField(field)) {
      return '<input class="inline-input" type="number" value="' + esc(cond.value) + '" placeholder="数值" data-prop="value">';
    }
    var vals = FIELD_VALUES[field] || [];
    return '<select class="inline-select" data-prop="value">' +
      '<option value="">选择值</option>' +
      vals.map(function (v) { return '<option value="' + v + '"' + (v === cond.value ? ' selected' : '') + '>' + v + '</option>'; }).join('') +
    '</select>';
  }

  function renderInlineCond(cond, removable) {
    return '<span data-role="cond-row" data-cid="' + cond.id + '">' +
      renderFieldSelect(cond.field, 'data-prop="field"') +
      (cond.field ? renderOperatorSelect(cond.field, cond.operator, 'data-prop="operator"') : '') +
      (cond.field ? renderValueControl(cond.field, cond) : '') +
      (removable ? '<button class="btn-cond-remove" data-action="remove-cond" data-cid="' + cond.id + '" title="删除条件">×</button>' : '') +
    '</span>';
  }

  function renderInlineCondGroup(conditions, removable, addBtnAction, addBtnRid) {
    var html = conditions.map(function (cond, i) {
      var sep = i > 0 ? '<span class="cond-text">且</span>' : '';
      return sep + renderInlineCond(cond, removable);
    }).join('');
    var ridAttr = addBtnRid ? ' data-rid="' + addBtnRid + '"' : '';
    html += '<button class="btn-cond-add" data-action="' + addBtnAction + '"' + ridAttr + '>+ 且</button>';
    return html;
  }

  function renderEditCard(scenario, index) {
    var draft = state.draft;
    var sym = getSymbol(getCurrency());

    // 主条件：inline排列，条件间用"且"连接
    var primaryCondHtml = renderInlineCondGroup(draft.primaryConditions, true, 'add-primary-cond', null);

    // 副规则
    var rulesHtml = draft.secondaryRules.map(function (rule) {
      // 条件 inline
      var condHtml = rule.conditions.length
        ? '<span class="cond-text">若</span>' + renderInlineCondGroup(rule.conditions, true, 'add-rule-cond', rule.id)
        : '<button class="btn-cond-add" data-action="add-rule-cond" data-rid="' + rule.id + '">+ 条件</button>';

      // 价格
      var arrow = '<span class="ple-sep" style="font-weight:600;margin-left:2px">→</span>';
      var priceInput = '<input class="inline-input" type="number" value="' + esc(rule.unitPrice) + '" data-role="rule-price" data-rid="' + rule.id + '" placeholder="单价">';
      var symSpan = '<span class="ple-sep">' + esc(sym) + '/</span>';
      var unitSelect = '<select class="inline-select" data-role="rule-unit" data-rid="' + rule.id + '">' +
        CHARGE_UNITS.map(function (u) { return '<option value="' + u + '"' + (u === rule.chargeUnit ? ' selected' : '') + '>' + u + '</option>'; }).join('') +
      '</select>';
      var advToggle = '<button class="btn-advanced-toggle' + (rule.advancedOpen ? ' open' : '') + '" data-action="toggle-advanced" data-rid="' + rule.id + '">高级</button>';
      var removeBtn = '<button class="btn-rule-remove" data-action="remove-rule" data-rid="' + rule.id + '" title="删除">×</button>';

      var row = '<div class="condition-builder" data-role="rule-row" data-rid="' + rule.id + '">' +
        condHtml + arrow + priceInput + symSpan + unitSelect + advToggle + removeBtn +
      '</div>';

      // 高级面板
      var advPanel = '<div class="advanced-panel' + (rule.advancedOpen ? ' open' : '') + '" data-role="advanced" data-rid="' + rule.id + '">' +
        '<div class="advanced-row">' +
          '<div class="advanced-field"><span class="advanced-label">减免量</span><input class="inline-input narrow" type="number" value="' + esc(rule.waiveAmount) + '" data-role="adv" data-rid="' + rule.id + '" data-prop="waiveAmount"></div>' +
          '<div class="advanced-field"><span class="advanced-label">单位数量</span><input class="inline-input narrow" type="number" value="' + esc(rule.unitQty) + '" data-role="adv" data-rid="' + rule.id + '" data-prop="unitQty"></div>' +
          '<div class="advanced-field"><span class="advanced-label">进位</span><select class="inline-select" data-role="adv" data-rid="' + rule.id + '" data-prop="roundUp">' +
            ROUND_OPTIONS.map(function (r) { return '<option value="' + r.value + '"' + (r.value === rule.roundUp ? ' selected' : '') + '>' + r.label + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="advanced-field"><span class="advanced-label">基础费</span><input class="inline-input narrow" type="number" value="' + esc(rule.baseFee) + '" data-role="adv" data-rid="' + rule.id + '" data-prop="baseFee"></div>' +
          '<div class="advanced-field"><span class="advanced-label">最低</span><input class="inline-input narrow" type="number" value="' + esc(rule.minFee) + '" data-role="adv" data-rid="' + rule.id + '" data-prop="minFee"></div>' +
          '<div class="advanced-field"><span class="advanced-label">最高</span><input class="inline-input narrow" type="number" value="' + esc(rule.maxFee) + '" data-role="adv" data-rid="' + rule.id + '" data-prop="maxFee"></div>' +
        '</div>' +
      '</div>';

      return row + advPanel;
    }).join('');

    return '<div class="scenario-card editing" data-sid="' + scenario.id + '">' +
      '<div class="scenario-header">' +
        '<span class="scenario-badge">场景 ' + (index + 1) + '</span>' +
        '<div class="condition-builder" style="flex:1">' + primaryCondHtml + '</div>' +
      '</div>' +
      '<div class="scenario-body">' + rulesHtml + '</div>' +
      '<div class="scenario-footer">' +
        '<div class="scenario-footer-left">' +
          '<button class="btn-add-pricing" data-action="add-rule">+ 添加条件</button>' +
        '</div>' +
        '<div class="scenario-footer-right">' +
          '<button class="btn btn-outline btn-sm" data-action="cancel-edit">取消</button>' +
          '<button class="btn btn-primary btn-sm" data-action="save-edit">确定</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ==================== 主渲染 ==================== */
  function render() {
    if (!state.scenarios.length) {
      ruleCardsEl.innerHTML = '<div class="rule-cards-empty">暂无收费规则，点击下方按钮添加</div>';
      addScenarioBtn.disabled = false;
      return;
    }

    ruleCardsEl.innerHTML = state.scenarios.map(function (scenario, i) {
      if (state.editingId === scenario.id) {
        return renderEditCard(scenario, i);
      }
      return renderReadCard(scenario, i);
    }).join('');

    addScenarioBtn.disabled = state.editingId !== null;
  }

  /* ==================== 查找辅助 ==================== */
  function findDraftRule(rid) {
    if (!state.draft) return null;
    for (var i = 0; i < state.draft.secondaryRules.length; i++) {
      if (state.draft.secondaryRules[i].id === rid) return state.draft.secondaryRules[i];
    }
    return null;
  }

  function findDraftRuleCond(rid, cid) {
    var rule = findDraftRule(rid);
    if (!rule) return null;
    for (var i = 0; i < rule.conditions.length; i++) {
      if (rule.conditions[i].id === cid) return rule.conditions[i];
    }
    return null;
  }

  /* ==================== 事件处理 ==================== */
  ruleCardsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.dataset.action;
    var sid = parseInt(btn.dataset.sid, 10);
    var rid = parseInt(btn.dataset.rid, 10);
    var cid = parseInt(btn.dataset.cid, 10);

    switch (action) {
      case 'edit':
        state.isCreating = false;
        state.editingId = sid;
        state.draft = deepClone(state.scenarios.find(function (s) { return s.id === sid; }));
        render();
        break;

      case 'delete':
        if (state.editingId) return;
        state.scenarios = state.scenarios.filter(function (s) { return s.id !== sid; });
        showToast('已删除收费场景', 'info');
        render();
        break;

      case 'save-edit':
        var idx = state.scenarios.findIndex(function (s) { return s.id === state.editingId; });
        state.scenarios[idx] = state.draft;
        state.editingId = null;
        state.draft = null;
        showToast('已保存', 'success');
        render();
        break;

      case 'cancel-edit':
        state.editingId = null;
        state.draft = null;
        render();
        break;

      case 'add-primary-cond':
        if (!state.draft) return;
        state.draft.primaryConditions.push(createCondition());
        render();
        break;

      case 'remove-cond':
        if (!state.draft) return;
        var removed = false;
        state.draft.primaryConditions = state.draft.primaryConditions.filter(function (c) {
          if (c.id === cid) { removed = true; return false; }
          return true;
        });
        if (!removed) {
          state.draft.secondaryRules.forEach(function (rule) {
            rule.conditions = rule.conditions.filter(function (c) { return c.id !== cid; });
          });
        }
        render();
        break;

      case 'add-rule':
        if (!state.draft) return;
        state.draft.secondaryRules.push(createRule());
        render();
        break;

      case 'add-rule-cond':
        if (!state.draft) return;
        var rule = findDraftRule(rid);
        if (rule) {
          rule.conditions.push(createCondition());
          render();
        }
        break;

      case 'remove-rule':
        if (!state.draft) return;
        state.draft.secondaryRules = state.draft.secondaryRules.filter(function (r) { return r.id !== rid; });
        render();
        break;

      case 'toggle-left-bracket':
      case 'toggle-right-bracket':
        if (!state.draft) return;
        // Find condition in draft
        var tCond = null;
        state.draft.primaryConditions.forEach(function (c) { if (c.id === cid) tCond = c; });
        if (!tCond) {
          state.draft.secondaryRules.forEach(function (r) {
            r.conditions.forEach(function (c) { if (c.id === cid) tCond = c; });
          });
        }
        if (tCond) {
          if (action === 'toggle-left-bracket') tCond.leftOpen = !tCond.leftOpen;
          else tCond.rightOpen = !tCond.rightOpen;
          render();
        }
        break;

      case 'toggle-advanced':
        if (!state.draft) return;
        var rule = findDraftRule(rid);
        if (rule) {
          rule.advancedOpen = !rule.advancedOpen;
          render();
        }
        break;
    }
  });

  // Handle select/input changes in edit mode
  ruleCardsEl.addEventListener('change', function (e) {
    if (!state.draft) return;
    var el = e.target;
    var prop = el.dataset.prop;

    // Primary condition change
    var condRow = el.closest('[data-role="cond-row"]');
    if (condRow) {
      var cid = parseInt(condRow.dataset.cid, 10);
      var cond = null;

      // Find in primary conditions
      state.draft.primaryConditions.forEach(function (c) {
        if (c.id === cid) cond = c;
      });

      // Find in rule conditions
      if (!cond) {
        state.draft.secondaryRules.forEach(function (rule) {
          rule.conditions.forEach(function (c) {
            if (c.id === cid) cond = c;
          });
        });
      }

      if (cond && prop) {
        cond[prop] = el.value;
        // When field changes, reset operator and value
        if (prop === 'field') {
          var ops = OPERATOR_OPTIONS[el.value] || ['='];
          cond.operator = ops[0];
          cond.value = '';
          cond.startValue = '';
          cond.endValue = '';
          render();
        } else if (prop === 'operator') {
          cond.value = '';
          cond.startValue = '';
          cond.endValue = '';
          render();
        }
      }
      return;
    }

    // Rule price/unit change
    var role = el.dataset.role;
    if (role === 'rule-price') {
      var rid = parseInt(el.dataset.rid, 10);
      var rule = findDraftRule(rid);
      if (rule) rule.unitPrice = el.value;
      return;
    }
    if (role === 'rule-unit') {
      var rid = parseInt(el.dataset.rid, 10);
      var rule = findDraftRule(rid);
      if (rule) rule.chargeUnit = el.value;
      return;
    }

    // Advanced field change
    if (role === 'adv') {
      var rid = parseInt(el.dataset.rid, 10);
      var rule = findDraftRule(rid);
      if (rule && prop) {
        rule[prop] = el.value;
      }
      return;
    }
  });

  ruleCardsEl.addEventListener('input', function (e) {
    if (!state.draft) return;
    var el = e.target;
    var role = el.dataset.role;

    if (role === 'rule-price') {
      var rid = parseInt(el.dataset.rid, 10);
      var rule = findDraftRule(rid);
      if (rule) rule.unitPrice = el.value;
      return;
    }
    if (role === 'adv') {
      var rid = parseInt(el.dataset.rid, 10);
      var rule = findDraftRule(rid);
      var prop = el.dataset.prop;
      if (rule && prop) rule[prop] = el.value;
      return;
    }
  });

  /* ==================== 添加场景 ==================== */
  addScenarioBtn.addEventListener('click', function () {
    if (state.editingId) return;
    state.isCreating = true;
    var s = createScenario();
    state.scenarios.push(s);
    state.editingId = s.id;
    state.draft = deepClone(s);
    render();
    ruleCardsEl.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });

  /* ==================== 保存 ==================== */
  saveBtn.addEventListener('click', function () {
    if (state.editingId) {
      showToast('请先完成当前编辑', 'error');
      return;
    }
    showToast('保存成功', 'success');
  });

  /* ==================== 费用试算 ==================== */
  function getTrialScenario() {
    return {
      arrivalMode: '整柜',
      containerType: '20GP',
      cargoTypes: ['托盘货', '箱货'],
      cargoProperty: '普货',
      palletCount: 8,
      boxCount: 850,
      cartonWeights: [10, 15, 18, 35, 12, 14, 16, 20],
      skuCount: 26
    };
  }

  function getScenarioValue(field, sc) {
    if (field === '到货形式') return sc.arrivalMode;
    if (field === '货物类型') return sc.cargoTypes;
    if (field === '货物属性') return sc.cargoProperty;
    if (field === 'SKU数量') return sc.skuCount;
    if (field === '柜型') return sc.containerType;
    if (field === '箱数') return sc.boxCount;
    if (field === '单箱重量') return sc.cartonWeights.length ? Math.max.apply(null, sc.cartonWeights) : 0;
    return '';
  }

  function isCondMatched(cond, sc) {
    if (!cond || !cond.field) return true;
    var actual = getScenarioValue(cond.field, sc);
    var expect = cond.value;

    if (Array.isArray(actual)) {
      if (cond.operator === '包含') return actual.indexOf(expect) !== -1;
      if (cond.operator === '=') return actual.length === 1 && actual[0] === expect;
      return false;
    }
    if (isRangeOp(cond.operator)) {
      var s = Number(cond.startValue), e = Number(cond.endValue), a = Number(actual);
      if (!Number.isFinite(s) || !Number.isFinite(e) || !Number.isFinite(a)) return false;
      var leftOk = cond.leftOpen ? a > s : a >= s;
      var rightOk = cond.rightOpen ? a < e : a <= e;
      return leftOk && rightOk;
    }
    if (cond.operator === '>') return Number(actual) > Number(expect);
    if (cond.operator === '>=') return Number(actual) >= Number(expect);
    if (cond.operator === '<') return Number(actual) < Number(expect);
    if (cond.operator === '<=') return Number(actual) <= Number(expect);
    return String(actual) === String(expect);
  }

  function calcAmount(rule, sc) {
    var baseQty = 0;
    var condField = rule.conditions.length ? rule.conditions[0].field : '';
    if (condField === '柜型') baseQty = 1;
    else if (condField === '箱数') baseQty = sc.boxCount;
    else if (condField === 'SKU数量') baseQty = sc.skuCount;
    else if (condField === '单箱重量') {
      var threshold = Number(rule.conditions[0].value) || 0;
      baseQty = sc.cartonWeights.reduce(function (s, w) { return s + Math.max(0, w - threshold); }, 0);
    } else {
      if (rule.chargeUnit === '柜') baseQty = 1;
      else if (rule.chargeUnit === '箱') baseQty = sc.boxCount;
      else if (rule.chargeUnit === '托') baseQty = sc.palletCount;
      else if (rule.chargeUnit === 'SKU') baseQty = sc.skuCount;
    }

    if (rule.waiveAmount) baseQty = Math.max(0, baseQty - Number(rule.waiveAmount));
    var unitQty = Math.max(Number(rule.unitQty) || 1, 1);
    var units = baseQty / unitQty;
    if (rule.roundUp === 'up') units = Math.ceil(units);
    else if (rule.roundUp === 'half') units = Math.round(units);

    var amount = units * Number(rule.unitPrice || 0);
    if (rule.baseFee) amount += Number(rule.baseFee);
    if (rule.minFee) amount = Math.max(amount, Number(rule.minFee));
    if (rule.maxFee) amount = Math.min(amount, Number(rule.maxFee));
    return Number(amount.toFixed(2));
  }

  simulateBtn.addEventListener('click', function () {
    if (state.editingId) {
      showToast('请先完成当前编辑', 'error');
      return;
    }
    var name = chargeNameInput ? chargeNameInput.value || '卸货费' : '卸货费';
    document.getElementById('trialModalTitle').textContent = '费用试算-' + name;
    trialFeeModal.setAttribute('aria-hidden', 'false');
    trialInlineStatus.innerHTML = '';
    trialBoardScroll.innerHTML = '';
    trialTotalValue.textContent = getSymbol(getCurrency()) + '0.00';
  });

  trialModalClose.addEventListener('click', function () {
    trialFeeModal.setAttribute('aria-hidden', 'true');
  });

  trialFeeModal.addEventListener('click', function (e) {
    if (e.target === trialFeeModal) trialFeeModal.setAttribute('aria-hidden', 'true');
  });

  trialRunBtn.addEventListener('click', function () {
    var sc = getTrialScenario();
    var sym = getSymbol(getCurrency());
    var total = 0;
    var html = '';

    state.scenarios.forEach(function (scenario, gi) {
      var groupMatch = scenario.primaryConditions.every(function (c) { return isCondMatched(c, sc); });
      var condText = fmtScenarioCondition(scenario);

      html += '<div style="padding:8px 12px;background:#f7f9fc;border-bottom:1px solid #eee;font-size:12px;font-weight:600;color:#666">' +
        '<span style="background:var(--brand);color:#fff;padding:1px 6px;border-radius:3px;font-size:11px;margin-right:6px">场景' + (gi + 1) + '</span>' +
        esc(condText) + '</div>';

      scenario.secondaryRules.forEach(function (rule) {
        var conds = rule.conditions.filter(function (c) { return c.field; });
        var condMatch = !conds.length || conds.every(function (c) { return isCondMatched(c, sc); });
        var amount = (groupMatch && condMatch) ? calcAmount(rule, sc) : null;
        if (amount) total += amount;

        var ruleText = conds.length ? conds.map(fmtCond).join(' 且 ') : '默认';
        html += '<div class="trial-row" style="' + (amount === null ? 'opacity:0.4' : '') + '">' +
          '<div><span class="trial-cond-text">' + esc(ruleText) + '</span>' +
          '<span class="trial-calc-text">' + esc(fmtRuleText(rule, sym)) + '</span></div>' +
          '<div class="trial-row-amount">' + (amount === null ? '-' : amount.toFixed(2)) + '</div>' +
        '</div>';
      });
    });

    trialBoardScroll.innerHTML = html || '<div class="trial-empty">暂无规则</div>';
    trialTotalValue.textContent = sym + total.toFixed(2);
    trialInlineStatus.innerHTML = '<span class="trial-status-ok">试算完成</span>';
  });

  /* ==================== 初始化 ==================== */
  render();
})();
