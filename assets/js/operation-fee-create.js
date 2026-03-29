    const state = {
      inboundType: '尾程大货入库',
      saving: false,
      simulating: false,
      grouping: false,
      ruleConflicts: {},
      rules: [
        {
          id: 1,
          condition: '当到货形式 = 整柜 且 货物类型包含箱货时',
          items: [
            { id: 101, text: '若柜型 = 20GP，按 €300/柜计费' },
            { id: 102, text: '若柜型 = 40GP，按 €350/柜计费' },
            { id: 103, text: '若柜型 = 40HQ，按 €450/柜计费' },
            { id: 104, text: '若箱数 > 700，按 €0.3/箱计费，减免前 700 箱' }
          ]
        },
        {
          id: 2,
          condition: '当到货形式 = 整柜 且 货物类型 = 托盘货时',
          items: [
            { id: 201, text: '若柜型 = 20GP，按 €220/柜计费' },
            { id: 202, text: '若柜型 = 40GP，按 €330/柜计费' },
            { id: 203, text: '若柜型 = 40HQ，按 €350/柜计费' }
          ]
        },
        {
          id: 3,
          condition: '当到货形式 = 散货时',
          items: [
            { id: 301, text: '若货物类型包含箱货，按 €1/箱计费' },
            { id: 302, text: '若货物类型包含托盘货，按 €15/托计费' },
            { id: 303, text: '若单箱重量 > 23kg，超出部分按 €0.1/kg 计费' }
          ]
        },
        {
          id: 4,
          condition: '当 SKU 数量 > 20 时',
          items: [
            { id: 401, text: '按 €10/SKU 计费，减免前 20 个，最高收费 €100' }
          ]
        }
      ],
      ruleTabs: null
    };

    const requiredFieldMap = {
      chargeName: '请输入计费项名称',
      feeItem: '请选择费用项',
      warehouse: '请选择所属仓库',
      inboundType: '请选择入库类型',
      currency: '请选择币种',
      measureUnit: '请选择计量单位',
      chargeUnit: '请选择默认计费单位',
      chargeNode: '请选择计费节点'
    };

    const saveBtn = document.getElementById('saveBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const groupBtn = document.getElementById('groupBtn');
    const ruleList = document.getElementById('ruleList');
    const inboundTypeSelect = document.getElementById('inboundTypeSelect');
    const inboundTypeTrigger = document.getElementById('inboundTypeTrigger');
    const inboundTypeMenu = document.getElementById('inboundTypeMenu');
    const inboundTypeLabel = document.getElementById('inboundTypeLabel');
    const toastStack = document.getElementById('toastStack');
    const trialFeeModal = document.getElementById('trialFeeModal');
    const trialModalTitle = document.getElementById('trialModalTitle');
    const trialModalClose = document.getElementById('trialModalClose');
    const trialOrderNo = document.getElementById('trialOrderNo');
    const trialRunBtn = document.getElementById('trialRunBtn');
    const trialSummary = document.getElementById('trialSummary');
    const trialBoardHead = document.getElementById('trialBoardHead');
    const trialBoardScroll = document.getElementById('trialBoardScroll');
    const trialTotalValue = document.getElementById('trialTotalValue');
    const trialInlineStatus = document.getElementById('trialInlineStatus');

    function renderRules() {
      if (!state.rules.length) {
        ruleList.innerHTML = '<div class="empty-box">暂无计费规则，点击“编组”添加规则组</div>';
        return;
      }

      ruleList.innerHTML = state.rules.map((group, groupIndex) => {
        const head = `
          <div class="rule-group-head" data-group-id="${group.id}">
            <div class="rule-index"></div>
            <div class="rule-desc">
              <span class="rule-badge">规则${groupIndex + 1}</span>
              <span>${group.condition}</span>
            </div>
            <div class="rule-action-cell">
              <button class="rule-link" type="button" data-action="delete-group" data-group-id="${group.id}">删除</button>
            </div>
          </div>
        `;

        const items = group.items.map((item, itemIndex) => `
          <div class="rule-item" data-group-id="${group.id}" data-item-id="${item.id}">
            <div class="rule-index">${itemIndex + 1}</div>
            <div class="rule-desc">${item.text}</div>
            <div class="rule-action-cell">
              <button class="rule-link" type="button" data-action="delete-item" data-group-id="${group.id}" data-item-id="${item.id}">删除</button>
            </div>
          </div>
        `).join('');

        return head + items;
      }).join('');
    }

    function setButtonLoading(button, loading, text) {
      const baseText = button.dataset.text || button.textContent.trim();
      if (!button.dataset.text) {
        button.dataset.text = baseText;
      }

      if (loading) {
        button.disabled = true;
        button.innerHTML = `<span class="btn-spinner"></span><span>${text}</span>`;
      } else {
        button.disabled = false;
        button.textContent = button.dataset.text;
      }
    }

    function escapeHtmlText(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function getCurrencySymbol(currency) {
      const symbolMap = {
        EUR: '€',
        USD: '$',
        CNY: '¥',
        RMB: '¥'
      };
      return symbolMap[currency] || currency || '€';
    }

    function toNumber(value) {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : 0;
    }

    function isRangeOperator(operator) {
      return operator === '区间';
    }

    function formatConditionText(condition, compact = false) {
      if (isRangeOperator(condition.operator)) {
        return `${condition.field}在区间（${condition.startValue},${condition.endValue}】内`;
      }
      return compact
        ? `${condition.field}${condition.operator}${condition.value}`
        : `${condition.field} ${condition.operator} ${condition.value}`;
    }

    function hasTrialConditionValue(rule) {
      if (!rule) return false;
      return ['value', 'startValue', 'endValue'].some((field) => String(rule[field] ?? '').trim() !== '');
    }

    function isTrialConditionBlank(rule) {
      return !String(rule?.operator ?? '').trim() && !hasTrialConditionValue(rule);
    }

    function isTrialConditionComplete(rule) {
      if (!rule || isTrialConditionBlank(rule)) return false;
      if (!String(rule.field ?? '').trim() || !String(rule.operator ?? '').trim()) {
        return false;
      }

      if (isRangeOperator(rule.operator)) {
        return String(rule.startValue ?? '').trim() !== '' && String(rule.endValue ?? '').trim() !== '';
      }

      return String(rule.value ?? '').trim() !== '';
    }

    function formatAmount(value, symbol) {
      return `${symbol}${toNumber(value).toFixed(2)}`;
    }

    function formatPreviewValues(values, limit = 4) {
      const safeValues = Array.isArray(values) ? values.filter((item) => item !== null && item !== undefined && item !== '') : [];
      if (!safeValues.length) return '--';
      const head = safeValues.slice(0, limit).join('、');
      return safeValues.length > limit ? `${head}...` : head;
    }

    function getTrialScenario(formData, orderNo) {
      return {
        title: `费用试算-${formData.chargeName || '卸货费'}`,
        orderNo,
        currency: formData.currency || 'EUR',
        arrivalMode: '整柜',
        containerType: '20GP',
        cargoDisplay: '托盘、箱',
        cargoTypes: ['托盘货', '箱货'],
        cargoProperty: '普货',
        palletCount: 8,
        boxCount: 850,
        palletWeights: [80, 60, 100, 120, 95, 104, 88, 92],
        cartonWeights: [10, 15, 18, 35, 12, 14, 16, 20],
        skuCount: 26
      };
    }

    function getScenarioValue(field, scenario) {
      if (field === '到货形式') return scenario.arrivalMode;
      if (field === '货物类型') return scenario.cargoTypes;
      if (field === '货物属性') return scenario.cargoProperty;
      if (field === 'SKU数量') return scenario.skuCount;
      if (field === '柜型') return scenario.containerType;
      if (field === '箱数') return scenario.boxCount;
      if (field === '单箱重量') return scenario.cartonWeights.length ? Math.max(...scenario.cartonWeights) : 0;
      return '';
    }

    function isConditionMatched(rule, scenario) {
      if (!rule || !String(rule.field ?? '').trim() || !String(rule.operator ?? '').trim()) {
        return true;
      }

      const actualValue = getScenarioValue(rule.field, scenario);
      const expectValue = rule.value;

      if (Array.isArray(actualValue)) {
        if (rule.operator === '包含') {
          return actualValue.includes(expectValue);
        }
        if (rule.operator === '=') {
          return actualValue.length === 1 && actualValue[0] === expectValue;
        }
        return false;
      }

      if (isRangeOperator(rule.operator)) {
        const startValue = Number(rule.startValue);
        const endValue = Number(rule.endValue);
        const actualNumber = Number(actualValue);
        if (!Number.isFinite(startValue) || !Number.isFinite(endValue) || !Number.isFinite(actualNumber)) {
          return false;
        }
        if (startValue > endValue) {
          return false;
        }
        return actualNumber > startValue && actualNumber <= endValue;
      }

      if (rule.operator === '包含') {
        return String(actualValue).includes(String(expectValue));
      }

      if (rule.operator === '>') {
        return toNumber(actualValue) > toNumber(expectValue);
      }

      if (rule.operator === '>=') {
        return toNumber(actualValue) >= toNumber(expectValue);
      }

      if (rule.operator === '<') {
        return toNumber(actualValue) < toNumber(expectValue);
      }

      if (rule.operator === '<=') {
        return toNumber(actualValue) <= toNumber(expectValue);
      }

      return String(actualValue) === String(expectValue);
    }

    function getChargeBaseQty(rule, scenario) {
      const conditions = Array.isArray(rule.conditions) && rule.conditions.length ? rule.conditions : [rule];
      const baseCondition = conditions.find((item) => ['单箱重量', '货物类型', '柜型', '箱数', 'SKU数量'].includes(item.field));

      if (baseCondition?.field === '柜型') return 1;
      if (baseCondition?.field === '箱数') return scenario.boxCount;
      if (baseCondition?.field === 'SKU数量') return scenario.skuCount;

      if (baseCondition?.field === '货物类型') {
        if (rule.chargeUnit === '箱') return scenario.boxCount;
        if (rule.chargeUnit === '托') return scenario.palletCount;
      }

      if (baseCondition?.field === '单箱重量') {
        if (isRangeOperator(baseCondition.operator)) {
          const minValue = Math.min(toNumber(baseCondition.startValue), toNumber(baseCondition.endValue));
          const maxValue = Math.max(toNumber(baseCondition.startValue), toNumber(baseCondition.endValue));
          return scenario.cartonWeights.reduce((sum, weight) => {
            const currentWeight = toNumber(weight);
            return currentWeight >= minValue && currentWeight <= maxValue ? sum + currentWeight : sum;
          }, 0);
        }

        const threshold = toNumber(baseCondition.value);
        return scenario.cartonWeights.reduce((sum, weight) => sum + Math.max(0, toNumber(weight) - threshold), 0);
      }

      if (rule.chargeUnit === '柜') return 1;
      if (rule.chargeUnit === '箱') return scenario.boxCount;
      if (rule.chargeUnit === '托') return scenario.palletCount;
      if (rule.chargeUnit === 'SKU') return scenario.skuCount;
      return 0;
    }

    function calculateTrialAmount(rule, scenario) {
      const conditions = Array.isArray(rule.conditions) && rule.conditions.length ? rule.conditions : [rule];
      if (!conditions.every((item) => isConditionMatched(item, scenario))) return null;

      let baseQty = getChargeBaseQty(rule, scenario);
      if (rule.waiveAmount) {
        baseQty = Math.max(0, baseQty - toNumber(rule.waiveAmount));
      }

      const unitQty = Math.max(toNumber(rule.unitQty) || 1, 1);
      let chargeUnits = baseQty / unitQty;
      if (rule.roundUp) {
        chargeUnits = Math.ceil(chargeUnits);
      }

      let amount = chargeUnits * toNumber(rule.unitPrice);

      if (rule.baseFee) {
        amount += toNumber(rule.baseFee);
      }

      if (rule.minFee) {
        amount = Math.max(amount, toNumber(rule.minFee));
      }

      if (rule.maxFee) {
        amount = Math.min(amount, toNumber(rule.maxFee));
      }

      return Number(amount.toFixed(2));
    }

    function formatTrialPrimaryCondition(rule) {
      if (!isTrialConditionComplete(rule)) return '任何场景';
      return formatConditionText(rule, true);
    }

    function formatTrialRuleText(rule, currencySymbol) {
      const conditions = (Array.isArray(rule.conditions) && rule.conditions.length ? rule.conditions : [rule]).filter(isTrialConditionComplete);
      const conditionText = conditions.length ? conditions.map((item) => formatConditionText(item)).join(' 且 ') : '任何场景';
      const chunks = [`若${conditionText}`];
      if (rule.unitPrice) chunks.push(`按 ${currencySymbol}${rule.unitPrice}/${rule.chargeUnit || '单位'}计费`);
      if (rule.waiveAmount) chunks.push(`减免前 ${rule.waiveAmount}${rule.chargeUnit || ''}`);
      if (rule.baseFee) chunks.push(`基础收费 ${currencySymbol}${rule.baseFee}`);
      if (rule.minFee) chunks.push(`最低收费 ${currencySymbol}${rule.minFee}`);
      if (rule.maxFee) chunks.push(`最高收费 ${currencySymbol}${rule.maxFee}`);
      return chunks.join('，');
    }

    function buildTrialResult(formData, orderNo) {
      const trialRules = Array.isArray(state.ruleTabs) ? state.ruleTabs : [];
      if (!trialRules.length) {
        return {
          status: 'error',
          message: '暂无可试算的计费规则，请先点击“编组”补充规则。'
        };
      }

      const scenario = getTrialScenario(formData, orderNo);
      const currencySymbol = getCurrencySymbol(scenario.currency);
      const groups = trialRules.map((tab, groupIndex) => {
        const groupMatched = tab.primaryConditions.every((rule) => isConditionMatched(rule, scenario));
        const rows = tab.secondaryRules.map((rule, rowIndex) => {
          const amount = groupMatched ? calculateTrialAmount(rule, scenario) : null;
          return {
            index: rowIndex + 1,
            text: formatTrialRuleText(rule, currencySymbol),
            amount
          };
        });

        return {
          label: tab.name || `规则${groupIndex + 1}`,
          condition: `当${tab.primaryConditions.filter(isTrialConditionComplete).length ? tab.primaryConditions.filter(isTrialConditionComplete).map(formatTrialPrimaryCondition).join(' 且 ') : '任何场景'}时`,
          rows
        };
      });

      const total = groups.reduce((sum, group) => sum + group.rows.reduce((rowSum, row) => rowSum + (row.amount || 0), 0), 0);

      return {
        status: 'success',
        currencySymbol,
        scenario,
        groups,
        total: Number(total.toFixed(2))
      };
    }

    function renderTrialSummary(result) {
      const scenario = result.scenario;
      const summaryItems = [
        { label: '到货形式', value: scenario.arrivalMode, className: 'compact' },
        { label: '货物形态', value: scenario.cargoDisplay, className: 'compact' },
        { label: '托盘数', value: String(scenario.palletCount), className: 'compact' },
        { label: '箱数', value: String(scenario.boxCount), className: 'compact' },
        { label: '托盘重量', value: formatPreviewValues(scenario.palletWeights), className: 'wide', strong: true },
        { label: '单箱重量', value: formatPreviewValues(scenario.cartonWeights), className: 'wide', strong: true },
        { label: 'SKU数量', value: String(scenario.skuCount), className: 'break', strong: true }
      ];

      trialSummary.innerHTML = summaryItems.map((item) => `
        <div class="trial-summary-item ${item.className || ''}">
          <span class="trial-summary-label ${item.strong ? 'strong' : ''}">${escapeHtmlText(item.label)}：</span>
          <span class="trial-summary-value">${escapeHtmlText(item.value)}</span>
        </div>
      `).join('');
    }

    function renderTrialBoard(result) {
      trialBoardHead.lastElementChild.textContent = `试算费用（${result.currencySymbol}）`;
      trialBoardScroll.innerHTML = result.groups.map((group) => `
        <section class="trial-group">
          <div class="trial-group-head">
            <div class="trial-group-label">
              <span class="trial-badge">${escapeHtmlText(group.label)}</span>
              <span class="trial-group-condition">${escapeHtmlText(group.condition)}</span>
            </div>
            <div class="trial-group-placeholder"></div>
          </div>
          ${group.rows.map((row) => `
            <div class="trial-row ${row.amount === null ? 'miss' : 'hit'}">
              <div class="trial-row-index">${row.index}</div>
              <div class="trial-row-text">${escapeHtmlText(row.text)}</div>
              <div class="trial-row-amount">${row.amount === null ? '-' : toNumber(row.amount).toFixed(2)}</div>
            </div>
          `).join('')}
        </section>
      `).join('');
      trialTotalValue.textContent = formatAmount(result.total, result.currencySymbol);
    }

    function renderTrialStatus(status, message) {
      if (status === 'loading') {
        trialBoardHead.lastElementChild.textContent = '试算费用（€）';
        trialBoardScroll.innerHTML = `
          <div class="trial-board-status">
            <div class="trial-board-spinner"></div>
            <div>正在根据当前规则试算费用...</div>
          </div>
        `;
        trialTotalValue.textContent = '€0.00';
        trialInlineStatus.textContent = '试算中，请稍候...';
        trialInlineStatus.className = 'trial-inline-status loading';
        return;
      }

      if (status === 'error') {
        trialBoardHead.lastElementChild.textContent = '试算费用（€）';
        trialBoardScroll.innerHTML = `
          <div class="trial-board-status error">
            <div>${escapeHtmlText(message || '试算失败，请检查试算条件。')}</div>
          </div>
        `;
        trialTotalValue.textContent = '€0.00';
        trialInlineStatus.textContent = message || '试算失败，请检查试算条件。';
        trialInlineStatus.className = 'trial-inline-status error';
        return;
      }

      trialInlineStatus.textContent = '';
      trialInlineStatus.className = 'trial-inline-status';
    }

    function openTrialModal(title) {
      if (title) {
        trialModalTitle.textContent = title;
      }
      trialFeeModal.classList.add('open');
      trialFeeModal.setAttribute('aria-hidden', 'false');
      state.trialOpen = true;
    }

    function closeTrialModal() {
      trialFeeModal.classList.remove('open');
      trialFeeModal.setAttribute('aria-hidden', 'true');
      state.trialOpen = false;
    }

    function runTrialCalculation() {
      if (state.simulating) return;

      const { valid, data } = validateForm();
      if (!valid) {
        showToast('error', '费用试算失败', '请先完善必填项后再进行试算。');
        return;
      }

      const orderNo = trialOrderNo.value.trim();
      if (!orderNo) {
        trialOrderNo.classList.add('error');
        openTrialModal(`费用试算-${data.chargeName || '卸货费'}`);
        renderTrialStatus('error', '请输入试算单号。');
        showToast('error', '费用试算失败', '请输入试算单号后再重试。');
        return;
      }

      trialOrderNo.classList.remove('error');
      state.simulating = true;
      state.trialOrderNo = orderNo;
      const trialTitle = `费用试算-${data.chargeName || '卸货费'}`;

      openTrialModal(trialTitle);
      renderTrialStatus('loading');
      setButtonLoading(simulateBtn, true, '试算中');
      setButtonLoading(trialRunBtn, true, '试算中');

      window.setTimeout(() => {
        const result = buildTrialResult(data, orderNo);
        state.simulating = false;
        setButtonLoading(simulateBtn, false);
        setButtonLoading(trialRunBtn, false);

        if (result.status === 'error') {
          renderTrialStatus('error', result.message);
          showToast('error', '费用试算失败', result.message);
          return;
        }

        renderTrialStatus('success');
        renderTrialSummary(result);
        renderTrialBoard(result);
      }, 720);
    }

    function getFormValue(id) {
      return document.getElementById(id).value.trim();
    }

    function getFormData() {
      return {
        chargeName: getFormValue('chargeName'),
        feeItem: getFormValue('feeItem'),
        warehouse: getFormValue('warehouse'),
        inboundType: state.inboundType,
        currency: getFormValue('currency'),
        measureUnit: getFormValue('measureUnit'),
        chargeUnit: getFormValue('chargeUnit'),
        chargeNode: getFormValue('chargeNode'),
        remark: getFormValue('remark')
      };
    }

    function clearErrors() {
      document.querySelectorAll('.field-group').forEach((group) => {
        const control = group.querySelector('.field-control, .field-select, .tag-select-trigger');
        const tip = group.querySelector('.field-tip');
        if (control) control.classList.remove('field-error');
        if (tip) tip.textContent = '';
      });
    }

    function setFieldError(fieldName, text) {
      const group = document.querySelector(`.field-group[data-field="${fieldName}"]`);
      if (!group) return;
      const control = group.querySelector('.field-control, .field-select, .tag-select-trigger');
      const tip = group.querySelector('.field-tip');
      if (control) control.classList.add('field-error');
      if (tip) tip.textContent = text;
    }

    function validateForm() {
      clearErrors();
      const data = getFormData();
      const errors = [];

      Object.entries(requiredFieldMap).forEach(([field, message]) => {
        if (!data[field]) {
          setFieldError(field, message);
          errors.push(message);
        }
      });

      if (data.chargeName && data.chargeName.length > 50) {
        setFieldError('chargeName', '计费项名称最多 50 个字符');
        errors.push('计费项名称最多 50 个字符');
      }

      if (data.remark && data.remark.length > 255) {
        setFieldError('remark', '备注最多 255 个字符');
        errors.push('备注最多 255 个字符');
      }

      return {
        valid: errors.length === 0,
        data
      };
    }

    function makeToastIcon(type) {
      if (type === 'success') {
        return '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm4.6 7.2-5 6.3a1 1 0 0 1-1.5.1l-2.8-2.7 1.4-1.4 2 1.9 4.2-5.2 1.7 1Z"></path></svg>';
      }
      if (type === 'error') {
        return '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm1 13.8h-2v-2h2v2Zm0-4h-2V7.8h2v4.5Z"></path></svg>';
      }
      return '<svg class="toast-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm1 14h-2v-6h2v6Zm0-8h-2V6.8h2v1.7Z"></path></svg>';
    }

    function showToast(type, title, text) {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `
        ${makeToastIcon(type)}
        <div>
          <div class="toast-title">${title}</div>
          <div class="toast-text">${text}</div>
        </div>
      `;
      toastStack.appendChild(toast);
      window.setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-6px)';
      }, 2600);
      window.setTimeout(() => {
        toast.remove();
      }, 3000);
    }

    function simulateFee() {
      runTrialCalculation();
    }

    function saveForm() {
      if (state.saving) return;
      const { valid, data } = validateForm();
      if (!valid) {
        showToast('error', '保存失败', '页面中仍有未完成的必填信息，请检查后重试。');
        return;
      }

      state.saving = true;
      setButtonLoading(saveBtn, true, '保存中');

      window.setTimeout(() => {
        state.saving = false;
        setButtonLoading(saveBtn, false);
        showToast('success', '保存成功', `操作费“${data.chargeName}”已保存，计费节点为 ${data.chargeNode}。`);
      }, 1000);
    }

    function addGroup() {
      if (state.grouping) return;
      state.grouping = true;
      groupBtn.disabled = true;
      groupBtn.textContent = '编组中';

      window.setTimeout(() => {
        const newGroupId = Date.now();
        state.rules.push({
          id: newGroupId,
          condition: '当到货形式 = 整柜 且 需人工复核时',
          items: [
            { id: newGroupId + 1, text: '按 €25/票计费，最低收费 €50' }
          ]
        });
        renderRules();
        state.grouping = false;
        groupBtn.disabled = false;
        groupBtn.textContent = '编组';
        showToast('info', '规则编组完成', '已新增 1 个规则分组，可继续编辑规则内容。');
      }, 900);
    }

    function deleteRuleGroup(groupId) {
      const target = state.rules.find((group) => group.id === groupId);
      if (!target) return;
      const confirmed = window.confirm(`删除后数据不可恢复,是否确认删除？\n\n将删除规则组：${target.condition}`);
      if (!confirmed) return;
      state.rules = state.rules.filter((group) => group.id !== groupId);
      renderRules();
      showToast('success', '删除成功', '规则组已删除。');
    }

    function deleteRuleItem(groupId, itemId) {
      const group = state.rules.find((item) => item.id === groupId);
      if (!group) return;
      const ruleItem = group.items.find((item) => item.id === itemId);
      if (!ruleItem) return;
      const confirmed = window.confirm(`删除后数据不可恢复,是否确认删除？\n\n将删除规则：${ruleItem.text}`);
      if (!confirmed) return;

      group.items = group.items.filter((item) => item.id !== itemId);
      if (!group.items.length) {
        state.rules = state.rules.filter((item) => item.id !== groupId);
      }
      renderRules();
      showToast('success', '删除成功', '规则明细已删除。');
    }

    function openInboundTypeMenu() {
      inboundTypeSelect.classList.add('open');
      inboundTypeTrigger.classList.add('focused');
      inboundTypeTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeInboundTypeMenu() {
      inboundTypeSelect.classList.remove('open');
      inboundTypeTrigger.classList.remove('focused');
      inboundTypeTrigger.setAttribute('aria-expanded', 'false');
    }

    function setInboundType(value) {
      state.inboundType = value;
      inboundTypeLabel.textContent = value;
      const group = document.querySelector('.field-group[data-field="inboundType"]');
      const tip = group.querySelector('.field-tip');
      inboundTypeTrigger.classList.remove('field-error');
      tip.textContent = '';
      closeInboundTypeMenu();
    }

    function handleFieldInput(event) {
      const group = event.target.closest('.field-group');
      if (!group) return;
      const control = group.querySelector('.field-control, .field-select');
      const tip = group.querySelector('.field-tip');
      if (control) control.classList.remove('field-error');
      if (tip) tip.textContent = '';
    }

    saveBtn.addEventListener('click', saveForm);
    simulateBtn.addEventListener('click', simulateFee);
    groupBtn.addEventListener('click', addGroup);

    inboundTypeTrigger.addEventListener('click', () => {
      if (inboundTypeSelect.classList.contains('open')) {
        closeInboundTypeMenu();
      } else {
        openInboundTypeMenu();
      }
    });

    inboundTypeMenu.addEventListener('click', (event) => {
      const option = event.target.closest('.tag-option');
      if (!option) return;
      setInboundType(option.dataset.value);
    });

    document.getElementById('operationFeeForm').addEventListener('input', handleFieldInput);
    document.getElementById('operationFeeForm').addEventListener('change', handleFieldInput);

    trialOrderNo.addEventListener('input', () => {
      trialOrderNo.classList.remove('error');
      if (trialInlineStatus.classList.contains('error')) {
        trialInlineStatus.textContent = '';
        trialInlineStatus.className = 'trial-inline-status';
      }
    });

    trialRunBtn.addEventListener('click', runTrialCalculation);
    trialModalClose.addEventListener('click', closeTrialModal);
    trialFeeModal.addEventListener('click', (event) => {
      if (event.target === trialFeeModal) {
        closeTrialModal();
      }
    });

    trialOrderNo.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runTrialCalculation();
      }
    });

    ruleList.addEventListener('click', (event) => {
      const button = event.target.closest('[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      const groupId = Number(button.dataset.groupId);
      const itemId = Number(button.dataset.itemId);

      if (action === 'delete-group') {
        deleteRuleGroup(groupId);
      }

      if (action === 'delete-item') {
        deleteRuleItem(groupId, itemId);
      }
    });

    document.addEventListener('click', (event) => {
      if (!inboundTypeSelect.contains(event.target)) {
        closeInboundTypeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeInboundTypeMenu();
        if (state.trialOpen) {
          closeTrialModal();
        }
      }
      if (event.key === 'Enter' && event.target.closest('#operationFeeForm')) {
        const targetTag = event.target.tagName.toLowerCase();
        if (targetTag !== 'textarea' && targetTag !== 'button') {
          event.preventDefault();
        }
      }
    });

    (() => {
      let editorUid = 8000;

      const PRIMARY_FIELD_OPTIONS = ['到货形式', '货物类型', '货物属性', 'SKU数量'];
      const SECONDARY_FIELD_OPTIONS = ['柜型', '货物类型', '箱数', '单箱重量', 'SKU数量'];
      const PRIMARY_OPERATOR_OPTIONS = ['=', '包含', '>'];
      const SECONDARY_OPERATOR_OPTIONS = ['=', '包含', '>', '>='];
      const CHARGE_UNIT_OPTIONS = ['柜', '箱', '托', 'kg', 'CBM', 'SKU'];
      const FIELD_VALUE_OPTIONS = {
        '到货形式': ['整柜', '散货'],
        '货物类型': ['箱货', '托盘货', '普货'],
        '货物属性': ['普货', '敏感货', '易碎'],
        'SKU数量': ['20', '50', '100'],
        '柜型': ['20GP', '40GP', '40HQ'],
        '箱数': ['100', '300', '700'],
        '单箱重量': ['23', '30', '50']
      };
      const NUMERIC_VALUE_FIELDS = new Set(['箱数', '单箱重量', 'SKU数量']);
      const RECOMMENDED_CHARGE_UNIT = {
        '柜型': '柜',
        '货物类型': '箱',
        '箱数': '箱',
        '单箱重量': 'kg',
        'SKU数量': 'SKU'
      };

      const oldGroupBtn = document.getElementById('groupBtn');
      const groupBtn = oldGroupBtn.cloneNode(true);
      oldGroupBtn.replaceWith(groupBtn);

      const oldRuleList = document.getElementById('ruleList');
      const ruleList = oldRuleList.cloneNode(false);
      oldRuleList.replaceWith(ruleList);

      const ruleEditorModal = document.getElementById('ruleEditorModal');
      const editorTabBar = document.getElementById('editorTabBar');
      const editorPrimaryRows = document.getElementById('editorPrimaryRows');
      const editorSecondaryRows = document.getElementById('editorSecondaryRows');
      const addPrimaryConditionBtn = document.getElementById('addPrimaryConditionBtn');
      const addSecondaryRuleBtn = document.getElementById('addSecondaryRuleBtn');
      const ruleEditorClose = document.getElementById('ruleEditorClose');
      const editorCancelBtn = document.getElementById('editorCancelBtn');
      const editorConfirmBtn = document.getElementById('editorConfirmBtn');

      const modalState = {
        open: false,
        activeTabId: null,
        draftTabs: [],
        errors: [],
        saving: false,
        draggingCondition: null
      };

      function nextId() {
        editorUid += 1;
        return editorUid;
      }

      function deepClone(data) {
        return JSON.parse(JSON.stringify(data));
      }

      function escapeHtml(value) {
        return String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function usesInputValue(field) {
        return NUMERIC_VALUE_FIELDS.has(field);
      }

      function isRangeOperator(operator) {
        return operator === '区间';
      }

      function getFieldValueOptions(field) {
        return FIELD_VALUE_OPTIONS[field] || [];
      }

      function getConditionOperatorOptions(field) {
        if (!field) return [];
        if (NUMERIC_VALUE_FIELDS.has(field)) return ['>', '<', '=', '>=', '<=', '区间'];
        return ['=', '包含'];
      }

      function getDefaultOperator(field) {
        if (!field) return '';
        if (field === '货物类型') return '包含';
        if (NUMERIC_VALUE_FIELDS.has(field)) return '>';
        return '=';
      }

      function getDefaultValue(field) {
        const options = getFieldValueOptions(field);
        return options.length ? options[0] : '';
      }

      function getDefaultRangeValue(field, position) {
        const options = getFieldValueOptions(field);
        if (!options.length) return '';
        if (position === 'end') return options[1] || options[0];
        return options[0];
      }

      function pickConditionValue(...values) {
        const matched = values.find((item) => item !== undefined && item !== null && String(item).trim() !== '');
        return matched ?? '';
      }

      function syncConditionValueModel(condition) {
        if (!String(condition.field ?? '').trim()) {
          condition.operator = '';
          condition.value = '';
          condition.startValue = '';
          condition.endValue = '';
          return condition;
        }

        if (!String(condition.operator ?? '').trim()) {
          condition.value = '';
          condition.startValue = '';
          condition.endValue = '';
          return condition;
        }

        const operatorOptions = getConditionOperatorOptions(condition.field);
        if (!operatorOptions.includes(condition.operator)) {
          condition.operator = getDefaultOperator(condition.field);
        }

        if (isRangeOperator(condition.operator)) {
          condition.startValue = pickConditionValue(condition.startValue, condition.value, getDefaultRangeValue(condition.field, 'start'));
          condition.endValue = pickConditionValue(condition.endValue, condition.value, getDefaultRangeValue(condition.field, 'end'));
          condition.value = '';
          return condition;
        }

        condition.value = pickConditionValue(condition.value, condition.startValue, getDefaultValue(condition.field));
        condition.startValue = '';
        condition.endValue = '';
        return condition;
      }

      function getConditionRequiredFields(condition) {
        return isRangeOperator(condition.operator) ? ['startValue', 'endValue'] : ['value'];
      }

      function hasConditionInput(condition) {
        if (!condition) return false;
        return ['field', 'operator', 'value', 'startValue', 'endValue'].some((field) => String(condition[field] ?? '').trim() !== '');
      }

      function hasConditionValueInput(condition) {
        if (!condition) return false;
        return ['value', 'startValue', 'endValue'].some((field) => String(condition[field] ?? '').trim() !== '');
      }

      function isConditionBlank(condition) {
        return !String(condition?.operator ?? '').trim() && !hasConditionValueInput(condition);
      }

      function isConditionComplete(condition) {
        if (!condition || isConditionBlank(condition)) return false;
        if (!String(condition.field ?? '').trim() || !String(condition.operator ?? '').trim()) {
          return false;
        }
        return getConditionRequiredFields(condition).every((field) => String(condition[field] ?? '').trim() !== '');
      }

      function isConditionPartial(condition) {
        return hasConditionInput(condition) && !isConditionBlank(condition) && !isConditionComplete(condition);
      }

      function getFieldConstraintType(field) {
        if (NUMERIC_VALUE_FIELDS.has(field)) return 'numeric';
        if (field === '货物类型') return 'multi-enum';
        return 'single-enum';
      }

      function uniqueValues(values) {
        return [...new Set(values.map((item) => String(item)))];
      }

      function formatConflictExpression(conditions) {
        return conditions.map((item) => formatConditionText(item, true)).join(' 且 ');
      }

      function buildConflictMessage(context, field, conditions, reason) {
        return `${context}中"${field}"条件组合后无可匹配值：${formatConflictExpression(conditions)}。${reason}`;
      }

      function parseConditionNumber(value) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
      }

      function createNumericConstraint() {
        return {
          lowerValue: -Infinity,
          lowerInclusive: false,
          upperValue: Infinity,
          upperInclusive: false
        };
      }

      function getNumericConditionConstraint(condition) {
        if (!NUMERIC_VALUE_FIELDS.has(condition.field)) return null;

        if (isRangeOperator(condition.operator)) {
          const startValue = parseConditionNumber(condition.startValue);
          const endValue = parseConditionNumber(condition.endValue);
          if (startValue === null || endValue === null) return null;
          return {
            lowerValue: startValue,
            lowerInclusive: false,
            upperValue: endValue,
            upperInclusive: true
          };
        }

        const value = parseConditionNumber(condition.value);
        if (value === null) return null;

        if (condition.operator === '=') {
          return {
            lowerValue: value,
            lowerInclusive: true,
            upperValue: value,
            upperInclusive: true
          };
        }

        if (condition.operator === '>') {
          return {
            lowerValue: value,
            lowerInclusive: false,
            upperValue: Infinity,
            upperInclusive: false
          };
        }

        if (condition.operator === '>=') {
          return {
            lowerValue: value,
            lowerInclusive: true,
            upperValue: Infinity,
            upperInclusive: false
          };
        }

        if (condition.operator === '<') {
          return {
            lowerValue: -Infinity,
            lowerInclusive: false,
            upperValue: value,
            upperInclusive: false
          };
        }

        if (condition.operator === '<=') {
          return {
            lowerValue: -Infinity,
            lowerInclusive: false,
            upperValue: value,
            upperInclusive: true
          };
        }

        return null;
      }

      function mergeLowerBound(current, incoming) {
        if (incoming.lowerValue > current.lowerValue) {
          return {
            value: incoming.lowerValue,
            inclusive: incoming.lowerInclusive
          };
        }
        if (incoming.lowerValue < current.lowerValue) {
          return {
            value: current.lowerValue,
            inclusive: current.lowerInclusive
          };
        }
        return {
          value: current.lowerValue,
          inclusive: current.lowerInclusive && incoming.lowerInclusive
        };
      }

      function mergeUpperBound(current, incoming) {
        if (incoming.upperValue < current.upperValue) {
          return {
            value: incoming.upperValue,
            inclusive: incoming.upperInclusive
          };
        }
        if (incoming.upperValue > current.upperValue) {
          return {
            value: current.upperValue,
            inclusive: current.upperInclusive
          };
        }
        return {
          value: current.upperValue,
          inclusive: current.upperInclusive && incoming.upperInclusive
        };
      }

      function intersectNumericConstraints(current, incoming) {
        const lower = mergeLowerBound(current, incoming);
        const upper = mergeUpperBound(current, incoming);
        return {
          lowerValue: lower.value,
          lowerInclusive: lower.inclusive,
          upperValue: upper.value,
          upperInclusive: upper.inclusive
        };
      }

      function isNumericConstraintEmpty(constraint) {
        if (constraint.lowerValue > constraint.upperValue) {
          return true;
        }
        if (constraint.lowerValue === constraint.upperValue) {
          return !(constraint.lowerInclusive && constraint.upperInclusive);
        }
        return false;
      }

      function detectSingleEnumConflicts(fieldConditions, context, field) {
        const equalsValues = uniqueValues(fieldConditions
          .filter((item) => item.operator === '=' || item.operator === '包含')
          .map((item) => item.value));

        if (equalsValues.length > 1) {
          return [{
            field,
            conditions: fieldConditions,
            reason: '同一字段不能同时等于多个不同值。'
          }];
        }

        return [];
      }

      function detectMultiEnumConflicts(fieldConditions, context, field) {
        const equalsValues = uniqueValues(fieldConditions
          .filter((item) => item.operator === '=')
          .map((item) => item.value));

        if (equalsValues.length > 1) {
          return [{
            field,
            conditions: fieldConditions,
            reason: '同一字段不能同时精确等于多个不同值。'
          }];
        }

        if (!equalsValues.length) return [];

        const exactValue = equalsValues[0];
        const includeValues = uniqueValues(fieldConditions
          .filter((item) => item.operator === '包含')
          .map((item) => item.value));

        if (includeValues.some((item) => item !== exactValue)) {
          return [{
            field,
            conditions: fieldConditions,
            reason: '字段已被限定为单一值，不能再同时要求包含其他值。'
          }];
        }

        return [];
      }

      function detectNumericConflicts(fieldConditions, context, field) {
        let mergedConstraint = createNumericConstraint();

        for (const condition of fieldConditions) {
          const nextConstraint = getNumericConditionConstraint(condition);
          if (!nextConstraint) continue;
          mergedConstraint = intersectNumericConstraints(mergedConstraint, nextConstraint);
          if (isNumericConstraintEmpty(mergedConstraint)) {
            return [{
              field,
              conditions: fieldConditions,
              reason: '数值约束求交后区间为空。'
            }];
          }
        }

        return [];
      }

      function formatConditionText(condition, compact = false) {
        if (isRangeOperator(condition.operator)) {
          return `${condition.field}在区间（${condition.startValue},${condition.endValue}】内`;
        }
        return compact
          ? `${condition.field}${condition.operator}${condition.value}`
          : `${condition.field} ${condition.operator} ${condition.value}`;
      }

      function getRecommendedChargeUnit(field) {
        return RECOMMENDED_CHARGE_UNIT[field] || '柜';
      }

      function createPrimaryCondition(preset = {}) {
        const field = preset.field ?? '';
        return syncConditionValueModel({
          id: preset.id || nextId(),
          field,
          operator: preset.operator ?? getDefaultOperator(field),
          value: preset.value ?? '',
          startValue: preset.startValue ?? '',
          endValue: preset.endValue ?? ''
        });
      }

      function createSecondaryCondition(preset = {}) {
        const field = preset.field ?? '';
        return syncConditionValueModel({
          id: preset.id || nextId(),
          field,
          operator: preset.operator ?? getDefaultOperator(field),
          value: preset.value ?? '',
          startValue: preset.startValue ?? '',
          endValue: preset.endValue ?? ''
        });
      }

      function createSecondaryRule(preset = {}) {
        const hasInlineCondition = ['field', 'operator', 'value', 'startValue', 'endValue'].some((key) => preset[key] !== undefined);
        const rawConditions = Array.isArray(preset.conditions) && preset.conditions.length
          ? preset.conditions
          : hasInlineCondition
            ? [preset]
            : [createSecondaryCondition()];
        const firstCondition = rawConditions[0] || {};
        const field = firstCondition.field || '柜型';
        const hasPresetValues = Object.keys(preset).length > 0;
        return {
          id: preset.id || nextId(),
          conditions: rawConditions.map((item) => createSecondaryCondition(item)),
          chargeUnit: preset.chargeUnit ?? (hasPresetValues ? getRecommendedChargeUnit(field) : ''),
          waiveAmount: preset.waiveAmount ?? '',
          unitQty: preset.unitQty ?? (hasPresetValues ? '1' : ''),
          roundUp: Boolean(preset.roundUp),
          unitPrice: preset.unitPrice ?? '',
          baseFee: preset.baseFee ?? '',
          minFee: preset.minFee ?? '',
          maxFee: preset.maxFee ?? ''
        };
      }

      function cloneSecondaryRule(rule) {
        const clone = createSecondaryRule(deepClone(rule));
        clone.id = nextId();
        clone.conditions = clone.conditions.map((item) => ({
          ...item,
          id: nextId()
        }));
        return clone;
      }

      function createRuleTab(index, preset = {}) {
        return {
          id: preset.id || nextId(),
          name: preset.name || `规则${index}`,
          primaryConditions: (preset.primaryConditions || [createPrimaryCondition()]).map((item) => createPrimaryCondition(item)),
          secondaryRules: (preset.secondaryRules || [createSecondaryRule()]).map((item) => createSecondaryRule(item))
        };
      }

      function createInitialRuleTabs() {
        return [
          createRuleTab(1, {
            id: 1,
            name: '规则1',
            primaryConditions: [
              { id: 101, field: '到货形式', operator: '=', value: '整柜' },
              { id: 102, field: '货物类型', operator: '包含', value: '箱货' }
            ],
            secondaryRules: [
              { id: 201, field: '柜型', operator: '=', value: '20GP', chargeUnit: '柜', unitQty: '1', unitPrice: '300' },
              { id: 202, field: '柜型', operator: '=', value: '40GP', chargeUnit: '柜', unitQty: '1', unitPrice: '350' },
              { id: 203, field: '柜型', operator: '=', value: '40HQ', chargeUnit: '柜', unitQty: '1', unitPrice: '450' },
              { id: 204, field: '箱数', operator: '>', value: '700', chargeUnit: '箱', waiveAmount: '700', unitQty: '1', unitPrice: '0.3' }
            ]
          }),
          createRuleTab(2, {
            id: 2,
            name: '规则2',
            primaryConditions: [
              { id: 111, field: '到货形式', operator: '=', value: '整柜' },
              { id: 112, field: '货物类型', operator: '=', value: '托盘货' }
            ],
            secondaryRules: [
              { id: 211, field: '柜型', operator: '=', value: '20GP', chargeUnit: '柜', unitQty: '1', unitPrice: '220' },
              { id: 212, field: '柜型', operator: '=', value: '40GP', chargeUnit: '柜', unitQty: '1', unitPrice: '330' },
              { id: 213, field: '柜型', operator: '=', value: '40HQ', chargeUnit: '柜', unitQty: '1', unitPrice: '350' }
            ]
          }),
          createRuleTab(3, {
            id: 3,
            name: '规则3',
            primaryConditions: [
              { id: 121, field: '到货形式', operator: '=', value: '散货' }
            ],
            secondaryRules: [
              { id: 221, field: '货物类型', operator: '包含', value: '箱货', chargeUnit: '箱', unitQty: '1', unitPrice: '1' },
              { id: 222, field: '货物类型', operator: '包含', value: '托盘货', chargeUnit: '托', unitQty: '1', unitPrice: '15' },
              { id: 223, field: '单箱重量', operator: '>', value: '23', chargeUnit: 'kg', unitQty: '1', unitPrice: '0.1' }
            ]
          }),
          createRuleTab(4, {
            id: 4,
            name: '规则4',
            primaryConditions: [
              { id: 131, field: 'SKU数量', operator: '>', value: '20' }
            ],
            secondaryRules: [
              { id: 231, field: 'SKU数量', operator: '>', value: '20', chargeUnit: 'SKU', waiveAmount: '20', unitQty: '1', unitPrice: '10', maxFee: '100' }
            ]
          })
        ];
      }

      function formatPrimaryCondition(row) {
        if (!isConditionComplete(row)) return '任何场景';
        return formatConditionText(row);
      }

      function formatSecondaryCondition(row) {
        if (!isConditionComplete(row)) return '任何场景';
        return formatConditionText(row);
      }

      function formatSecondaryRule(row) {
        const conditions = (Array.isArray(row.conditions) && row.conditions.length ? row.conditions : [row]).filter(isConditionComplete);
        const parts = [`若${conditions.length ? conditions.map(formatSecondaryCondition).join(' 且 ') : '任何场景'}`];
        if (row.unitPrice) parts.push(`按 €${row.unitPrice}/${row.chargeUnit || '单位'}计费`);
        if (row.waiveAmount) parts.push(`减免前 ${row.waiveAmount}${row.chargeUnit || ''}`);
        if (row.baseFee) parts.push(`基础收费 €${row.baseFee}`);
        if (row.minFee) parts.push(`最低收费 €${row.minFee}`);
        if (row.maxFee) parts.push(`最高收费 €${row.maxFee}`);
        return parts.join('，');
      }

      function buildRuleSummary(tabs) {
        return tabs.map((tab, index) => ({
          id: tab.id,
          name: tab.name || `规则${index + 1}`,
          condition: tab.primaryConditions.filter(isConditionComplete).length
            ? tab.primaryConditions.filter(isConditionComplete).map(formatPrimaryCondition).join(' 且 ')
            : '任何场景',
          items: tab.secondaryRules.map((rule) => ({
            id: rule.id,
            text: formatSecondaryRule(rule)
          }))
        }));
      }

      function syncRuleSummary() {
        state.rules = buildRuleSummary(state.ruleTabs);

        state.ruleConflicts = collectTabConflictMap(state.ruleTabs);

        renderRuleSummary();
      }

      function renderRuleSummary() {
        if (!state.rules.length) {
          ruleList.innerHTML = '<div class="empty-box">暂无计费规则，点击"编组"打开规则编辑弹窗</div>';
          return;
        }

        ruleList.innerHTML = state.rules.map((group, groupIndex) => {
          const hasConflict = state.ruleConflicts && state.ruleConflicts[group.id] && state.ruleConflicts[group.id].length > 0;
          const conflictTooltip = hasConflict ? state.ruleConflicts[group.id].join('\n') : '';

          const conflictBadge = hasConflict ? `
            <span class="rule-conflict-badge" title="${escapeHtml(conflictTooltip)}">
              !
            </span>
          ` : '';

          const head = `
            <div class="rule-group-head" data-group-id="${group.id}">
              <div class="rule-index"></div>
              <div class="rule-desc">
                <span class="rule-badge">${escapeHtml(group.name || `规则${groupIndex + 1}`)}</span>
                <span>${escapeHtml(group.condition)}</span>
                ${conflictBadge}
              </div>
              <div class="rule-action-cell">
                <button class="rule-link edit" type="button" data-action="edit-group" data-group-id="${group.id}">编辑</button>
                <button class="rule-link" type="button" data-action="delete-group" data-group-id="${group.id}">删除</button>
              </div>
            </div>
          `;

          const items = group.items.map((item, itemIndex) => `
            <div class="rule-item" data-group-id="${group.id}" data-item-id="${item.id}">
              <div class="rule-index">${itemIndex + 1}</div>
              <div class="rule-desc">${escapeHtml(item.text)}</div>
              <div class="rule-action-cell">
                <button class="rule-link" type="button" data-action="delete-item" data-group-id="${group.id}" data-item-id="${item.id}">删除</button>
              </div>
            </div>
          `).join('');

          return head + items;
        }).join('');
      }

      function getActiveTab() {
        return modalState.draftTabs.find((tab) => tab.id === modalState.activeTabId) || modalState.draftTabs[0];
      }

      function getErrorKey(...parts) {
        return parts.join('-');
      }

      function hasError(...parts) {
        return modalState.errors.includes(getErrorKey(...parts)) ? 'editor-error' : '';
      }

      function renderSelectOptions(options, currentValue) {
        return options.map((item) => `
          <option value="${escapeHtml(item)}" ${String(item) === String(currentValue) ? 'selected' : ''}>${escapeHtml(item)}</option>
        `).join('');
      }

      function renderValueControl(type, tabId, rowId, field, operator, valueOptions = {}) {
        const conditionAttr = valueOptions.conditionId ? ` data-condition-id="${valueOptions.conditionId}"` : '';

        if (!field || !operator) {
          return `<input class="editor-input ${valueOptions.valueErrorClass || ''}" type="text" value="" placeholder="任意场景" disabled>`;
        }

        if (isRangeOperator(operator)) {
          return `
            <input class="editor-input ${valueOptions.startErrorClass || ''}" type="text" value="${escapeHtml(valueOptions.startValue)}" data-editor-type="${type}" data-tab-id="${tabId}" data-row-id="${rowId}"${conditionAttr} data-field-key="startValue" placeholder="起始值">
            <span class="editor-range-separator" aria-hidden="true">-</span>
            <input class="editor-input ${valueOptions.endErrorClass || ''}" type="text" value="${escapeHtml(valueOptions.endValue)}" data-editor-type="${type}" data-tab-id="${tabId}" data-row-id="${rowId}"${conditionAttr} data-field-key="endValue" placeholder="结束值">
          `;
        }

        if (usesInputValue(field)) {
          return `<input class="editor-input ${valueOptions.valueErrorClass || ''}" type="text" value="${escapeHtml(valueOptions.value)}" data-editor-type="${type}" data-tab-id="${tabId}" data-row-id="${rowId}"${conditionAttr} data-field-key="value" placeholder="请输入">`;
        }

        return `
          <select class="editor-select ${valueOptions.valueErrorClass || ''}" data-editor-type="${type}" data-tab-id="${tabId}" data-row-id="${rowId}"${conditionAttr} data-field-key="value">
            <option value="">请选择</option>
            ${renderSelectOptions(getFieldValueOptions(field), valueOptions.value)}
          </select>
        `;
      }

      function renderPrimaryRow(tab, row) {
        return `
          <div class="editor-primary-row">
            <select class="editor-select ${hasError('primary', tab.id, row.id, 'field')}" data-editor-type="primary" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="field">
              <option value="">不限</option>
              ${renderSelectOptions(PRIMARY_FIELD_OPTIONS, row.field)}
            </select>
            <div class="editor-trigger-group ${isRangeOperator(row.operator) ? 'is-range' : ''}">
              <select class="editor-select ${hasError('primary', tab.id, row.id, 'operator')}" data-editor-type="primary" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="operator">
                <option value="">不限</option>
                ${renderSelectOptions(getConditionOperatorOptions(row.field), row.operator)}
              </select>
              ${renderValueControl('primary', tab.id, row.id, row.field, row.operator, {
                value: row.value,
                startValue: row.startValue,
                endValue: row.endValue,
                valueErrorClass: hasError('primary', tab.id, row.id, 'value'),
                startErrorClass: hasError('primary', tab.id, row.id, 'startValue'),
                endErrorClass: hasError('primary', tab.id, row.id, 'endValue')
              })}
            </div>
            <div class="editor-action-links">
              <button class="editor-action-link danger" type="button" data-modal-action="delete-primary" data-tab-id="${tab.id}" data-row-id="${row.id}">删除</button>
            </div>
          </div>
        `;
      }

      function renderSecondarySharedCells(tab, row, rowSpan) {
        return `
          <div class="editor-secondary-cell editor-secondary-cell--shared" style="grid-column: 4; grid-row: 1 / span ${rowSpan};">
            <select class="editor-select ${hasError('secondary-shared', tab.id, row.id, 'chargeUnit')}" data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="chargeUnit">
              <option value="">请选择</option>
              ${renderSelectOptions(CHARGE_UNIT_OPTIONS, row.chargeUnit)}
            </select>
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--shared" style="grid-column: 5; grid-row: 1 / span ${rowSpan};">
            <input class="editor-input" type="text" value="${escapeHtml(row.waiveAmount)}" data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="waiveAmount" placeholder="请输入">
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--shared" style="grid-column: 6; grid-row: 1 / span ${rowSpan};">
            <input class="editor-input ${hasError('secondary-shared', tab.id, row.id, 'unitQty')}" type="text" value="${escapeHtml(row.unitQty)}" data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="unitQty" placeholder="1">
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--shared editor-secondary-cell--round" style="grid-column: 7; grid-row: 1 / span ${rowSpan};">
            <div class="editor-checkbox-wrap">
              <input class="editor-checkbox" type="checkbox" ${row.roundUp ? 'checked' : ''} data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="roundUp">
            </div>
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--shared" style="grid-column: 8; grid-row: 1 / span ${rowSpan};">
            <input class="editor-input ${hasError('secondary-shared', tab.id, row.id, 'unitPrice')}" type="text" value="${escapeHtml(row.unitPrice)}" data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="unitPrice" placeholder="请输入">
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--shared" style="grid-column: 9; grid-row: 1 / span ${rowSpan};">
            <input class="editor-input" type="text" value="${escapeHtml(row.baseFee)}" data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="baseFee" placeholder="请输入">
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--shared" style="grid-column: 10; grid-row: 1 / span ${rowSpan};">
            <input class="editor-input" type="text" value="${escapeHtml(row.minFee)}" data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="minFee" placeholder="请输入">
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--shared" style="grid-column: 11; grid-row: 1 / span ${rowSpan};">
            <input class="editor-input" type="text" value="${escapeHtml(row.maxFee)}" data-editor-type="secondary-shared" data-tab-id="${tab.id}" data-row-id="${row.id}" data-field-key="maxFee" placeholder="请输入">
          </div>
        `;
      }

      function renderSecondaryConditionCells(tab, rule, condition, conditionIndex) {
        const rowNo = conditionIndex + 1;
        const splitClass = rowNo > 1 ? 'is-split' : '';
        const dragMeta = ` draggable="true" data-drag-type="secondary-condition" data-tab-id="${tab.id}" data-row-id="${rule.id}" data-condition-id="${condition.id}"`;
        return `
          <div class="editor-secondary-cell editor-secondary-cell--handle ${splitClass}" style="grid-column: 1; grid-row: ${rowNo};" data-drop-scope="secondary-condition" data-tab-id="${tab.id}" data-row-id="${rule.id}" data-condition-id="${condition.id}">
            <div class="editor-handle" aria-hidden="true"${dragMeta}></div>
          </div>
          <div class="editor-secondary-cell ${splitClass}" style="grid-column: 2; grid-row: ${rowNo};">
            <select class="editor-select ${hasError('secondary-condition', tab.id, rule.id, condition.id, 'field')}" data-editor-type="secondary-condition" data-tab-id="${tab.id}" data-row-id="${rule.id}" data-condition-id="${condition.id}" data-field-key="field">
              <option value="">不限</option>
              ${renderSelectOptions(SECONDARY_FIELD_OPTIONS, condition.field)}
            </select>
          </div>
          <div class="editor-secondary-cell ${splitClass}" style="grid-column: 3; grid-row: ${rowNo};">
            <div class="editor-trigger-group ${isRangeOperator(condition.operator) ? 'is-range' : ''}">
              <select class="editor-select ${hasError('secondary-condition', tab.id, rule.id, condition.id, 'operator')}" data-editor-type="secondary-condition" data-tab-id="${tab.id}" data-row-id="${rule.id}" data-condition-id="${condition.id}" data-field-key="operator">
                <option value="">不限</option>
                ${renderSelectOptions(getConditionOperatorOptions(condition.field), condition.operator)}
              </select>
              ${renderValueControl('secondary-condition', tab.id, rule.id, condition.field, condition.operator, {
                conditionId: condition.id,
                value: condition.value,
                startValue: condition.startValue,
                endValue: condition.endValue,
                valueErrorClass: hasError('secondary-condition', tab.id, rule.id, condition.id, 'value'),
                startErrorClass: hasError('secondary-condition', tab.id, rule.id, condition.id, 'startValue'),
                endErrorClass: hasError('secondary-condition', tab.id, rule.id, condition.id, 'endValue')
              })}
            </div>
          </div>
          <div class="editor-secondary-cell editor-secondary-cell--operation ${splitClass}" style="grid-column: 12; grid-row: ${rowNo};">
            <div class="editor-action-links">
              <button class="editor-action-link" type="button" data-modal-action="insert-secondary-condition" data-tab-id="${tab.id}" data-row-id="${rule.id}">新增条件</button>
              <button class="editor-action-link" type="button" data-modal-action="duplicate-secondary" data-tab-id="${tab.id}" data-row-id="${rule.id}">复制</button>
              <button class="editor-action-link danger" type="button" data-modal-action="delete-secondary" data-tab-id="${tab.id}" data-row-id="${rule.id}" data-condition-id="${condition.id}">删除</button>
            </div>
          </div>
        `;
      }

      function renderSecondaryRow(tab, row) {
        const rowSpan = row.conditions.length || 1;
        return `
          <div class="editor-secondary-rule">
            ${renderSecondarySharedCells(tab, row, rowSpan)}
            ${row.conditions.map((condition, conditionIndex) => renderSecondaryConditionCells(tab, row, condition, conditionIndex)).join('')}
          </div>
        `;
      }

      function renderModal() {
        if (!modalState.draftTabs.length) {
          modalState.draftTabs = [createRuleTab(1, { name: '规则1' })];
        }

        const activeTab = getActiveTab();
        modalState.activeTabId = activeTab.id;

        editorTabBar.innerHTML = modalState.draftTabs.map((tab) => `
          <button class="editor-tab ${tab.id === activeTab.id ? 'active' : ''}" type="button" data-modal-action="switch-tab" data-tab-id="${tab.id}">
            ${escapeHtml(tab.name)}
          </button>
        `).join('') + `
          <button class="editor-tab-add" type="button" data-modal-action="add-tab" aria-label="新增规则">+</button>
        `;

        editorPrimaryRows.innerHTML = activeTab.primaryConditions.map((row) => renderPrimaryRow(activeTab, row)).join('');
        editorSecondaryRows.innerHTML = activeTab.secondaryRules.map((row) => renderSecondaryRow(activeTab, row)).join('');
      }

      function ensureRuleTabs() {
        if (!Array.isArray(state.ruleTabs) || !state.ruleTabs.length) {
          state.ruleTabs = [createRuleTab(1, { name: '规则1' })];
          syncRuleSummary();
        }
      }

      function openModal(groupId) {
        ensureRuleTabs();
        modalState.open = true;
        modalState.errors = [];
        modalState.draftTabs = deepClone(state.ruleTabs);
        modalState.activeTabId = groupId && modalState.draftTabs.some((tab) => tab.id === groupId)
          ? groupId
          : modalState.draftTabs[0].id;
        renderModal();
        ruleEditorModal.classList.add('open');
        ruleEditorModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      function closeModal() {
        modalState.open = false;
        modalState.errors = [];
        modalState.draftTabs = [];
        modalState.saving = false;
        modalState.draggingCondition = null;
        ruleEditorModal.classList.remove('open');
        ruleEditorModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (typeof setButtonLoading === 'function') {
          setButtonLoading(editorConfirmBtn, false);
        } else {
          editorConfirmBtn.disabled = false;
          editorConfirmBtn.textContent = '确定';
        }
      }

      function addPrimaryCondition() {
        getActiveTab().primaryConditions.push(createPrimaryCondition());
        modalState.errors = [];
        renderModal();
      }

      function addSecondaryRule() {
        getActiveTab().secondaryRules.push(createSecondaryRule());
        modalState.errors = [];
        renderModal();
      }

      function addSecondaryCondition(tabId, rowId) {
        const tab = modalState.draftTabs.find((item) => item.id === tabId);
        if (!tab) return;
        const row = tab.secondaryRules.find((item) => item.id === rowId);
        if (!row) return;
        row.conditions.push(createSecondaryCondition());
        modalState.errors = [];
        renderModal();
      }

      function deletePrimaryCondition(tabId, rowId) {
        const tab = modalState.draftTabs.find((item) => item.id === tabId);
        if (!tab) return;
        tab.primaryConditions = tab.primaryConditions.filter((item) => item.id !== rowId);
        modalState.errors = [];
        renderModal();
      }

      function insertSecondaryRule(tabId, rowId, duplicate) {
        const tab = modalState.draftTabs.find((item) => item.id === tabId);
        if (!tab) return;
        const index = tab.secondaryRules.findIndex((item) => item.id === rowId);
        if (index === -1) return;
        const template = duplicate ? cloneSecondaryRule(tab.secondaryRules[index]) : createSecondaryRule();
        tab.secondaryRules.splice(index + 1, 0, template);
        modalState.errors = [];
        renderModal();
      }

      function deleteSecondaryCondition(tabId, rowId, conditionId) {
        const tab = modalState.draftTabs.find((item) => item.id === tabId);
        if (!tab) return;
        const row = tab.secondaryRules.find((item) => item.id === rowId);
        if (!row) return;

        if (row.conditions.length <= 1) {
          tab.secondaryRules = tab.secondaryRules.filter((item) => item.id !== rowId);
        } else {
          row.conditions = row.conditions.filter((item) => item.id !== conditionId);
        }

        modalState.errors = [];
        renderModal();
      }

      function deleteSecondaryRule(tabId, rowId) {
        const tab = modalState.draftTabs.find((item) => item.id === tabId);
        if (!tab) return;
        tab.secondaryRules = tab.secondaryRules.filter((item) => item.id !== rowId);
        modalState.errors = [];
        renderModal();
      }

      function moveSecondaryCondition(tabId, rowId, fromConditionId, toConditionId) {
        const tab = modalState.draftTabs.find((item) => item.id === tabId);
        if (!tab) return;
        const row = tab.secondaryRules.find((item) => item.id === rowId);
        if (!row) return;

        const fromIndex = row.conditions.findIndex((item) => item.id === fromConditionId);
        const toIndex = row.conditions.findIndex((item) => item.id === toConditionId);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

        const [moved] = row.conditions.splice(fromIndex, 1);
        row.conditions.splice(toIndex, 0, moved);
        modalState.errors = [];
        renderModal();
      }

      function clearDragIndicators() {
        ruleEditorModal.querySelectorAll('.is-drop-target').forEach((node) => node.classList.remove('is-drop-target'));
      }

      function resetDraggingCondition() {
        modalState.draggingCondition = null;
        clearDragIndicators();
      }

      function updateModalRow(control) {
        const type = control.dataset.editorType;
        const tabId = Number(control.dataset.tabId);
        const rowId = Number(control.dataset.rowId);
        const conditionId = Number(control.dataset.conditionId);
        const fieldKey = control.dataset.fieldKey;
        const tab = modalState.draftTabs.find((item) => item.id === tabId);
        if (!tab) return;

        if (type === 'primary') {
          const row = tab.primaryConditions.find((item) => item.id === rowId);
          if (!row) return;
          row[fieldKey] = control.type === 'checkbox' ? control.checked : control.value;

          if (fieldKey === 'field' || fieldKey === 'operator') {
            if (fieldKey === 'field') {
              row.operator = getDefaultOperator(row[fieldKey]);
            }
            syncConditionValueModel(row);
            modalState.errors = [];
            renderModal();
            return;
          }
        }

        if (type === 'secondary-condition') {
          const row = tab.secondaryRules.find((item) => item.id === rowId);
          if (!row) return;
          const condition = row.conditions.find((item) => item.id === conditionId);
          if (!condition) return;
          condition[fieldKey] = control.type === 'checkbox' ? control.checked : control.value;

          if (fieldKey === 'field' || fieldKey === 'operator') {
            if (fieldKey === 'field') {
              condition.operator = getDefaultOperator(condition[fieldKey]);
            }
            syncConditionValueModel(condition);
            modalState.errors = [];
            renderModal();
            return;
          }
        }

        if (type === 'secondary-shared') {
          const row = tab.secondaryRules.find((item) => item.id === rowId);
          if (!row) return;
          row[fieldKey] = control.type === 'checkbox' ? control.checked : control.value;
        }

        if (fieldKey === 'field') {
          modalState.errors = [];
        }

        if (modalState.errors.length) {
          modalState.errors = [];
          control.classList.remove('editor-error');
        }
      }

      function getCompleteConditions(conditions) {
        return Array.isArray(conditions) ? conditions.filter(isConditionComplete) : [];
      }

      function collectConditionConflictDetails(conditions) {
        const conflicts = [];
        const groupedConditions = {};

        getCompleteConditions(conditions)
          .forEach((condition) => {
            const field = condition.field;
            if (!groupedConditions[field]) {
              groupedConditions[field] = [];
            }
            groupedConditions[field].push(condition);
          });

        Object.entries(groupedConditions).forEach(([field, fieldConditions]) => {
          const constraintType = getFieldConstraintType(field);

          if (constraintType === 'numeric') {
            conflicts.push(...detectNumericConflicts(fieldConditions, '', field));
            return;
          }

          if (fieldConditions.length < 2) return;

          if (constraintType === 'multi-enum') {
            conflicts.push(...detectMultiEnumConflicts(fieldConditions, '', field));
            return;
          }

          conflicts.push(...detectSingleEnumConflicts(fieldConditions, '', field));
        });

        return conflicts;
      }

      function isConditionSetSatisfiable(conditions) {
        return collectConditionConflictDetails(conditions).length === 0;
      }

      function detectConditionConflicts(conditions, context = '主规则') {
        return uniqueValues(collectConditionConflictDetails(conditions).map((item) => buildConflictMessage(context, item.field, item.conditions, item.reason)));
      }

      function detectCrossConditionConflicts(leftConditions, rightConditions, context) {
        const left = getCompleteConditions(leftConditions);
        const right = getCompleteConditions(rightConditions);

        if (!left.length || !right.length) return [];
        if (!isConditionSetSatisfiable(left) || !isConditionSetSatisfiable(right)) return [];

        return detectConditionConflicts([...left, ...right], context);
      }

      function pushTabWarnings(target, tabId, messages) {
        if (!Array.isArray(messages) || !messages.length) return;
        if (!target[tabId]) {
          target[tabId] = [];
        }

        messages.forEach((message) => {
          if (!target[tabId].includes(message)) {
            target[tabId].push(message);
          }
        });
      }

      function collectTabConflictMap(tabs) {
        const warningMap = {};

        (Array.isArray(tabs) ? tabs : []).forEach((tab, tabIndex) => {
          const tabLabel = tab.name || `规则${tabIndex + 1}`;
          pushTabWarnings(warningMap, tab.id, detectConditionConflicts(tab.primaryConditions, `${tabLabel}的主规则`));

          tab.secondaryRules.forEach((rule, ruleIndex) => {
            const ruleLabel = `${tabLabel}的副规则${ruleIndex + 1}`;
            pushTabWarnings(warningMap, tab.id, detectConditionConflicts(rule.conditions, ruleLabel));
            pushTabWarnings(warningMap, tab.id, detectCrossConditionConflicts(tab.primaryConditions, rule.conditions, `${tabLabel}的主规则与副规则${ruleIndex + 1}组合`));
          });
        });

        return warningMap;
      }

      function validateModal() {
        const errors = [];
        let firstTabId = null;
        let hasRangeOrderError = false;

        modalState.draftTabs.forEach((tab, tabIndex) => {
          tab.primaryConditions.forEach((row) => {
            if (isConditionBlank(row)) {
              return;
            }

            ['field', 'operator', ...getConditionRequiredFields(row)].forEach((field) => {
              if (!String(row[field] ?? '').trim()) {
                errors.push(getErrorKey('primary', tab.id, row.id, field));
                if (!firstTabId) firstTabId = tab.id;
              }
            });

            if (isRangeOperator(row.operator)) {
              const startText = String(row.startValue ?? '').trim();
              const endText = String(row.endValue ?? '').trim();
                if (startText && endText && Number(startText) >= Number(endText)) {
                  errors.push(getErrorKey('primary', tab.id, row.id, 'startValue'));
                  errors.push(getErrorKey('primary', tab.id, row.id, 'endValue'));
                  if (!firstTabId) firstTabId = tab.id;
                  hasRangeOrderError = true;
                }
            }
          });

          tab.secondaryRules.forEach((row, ruleIndex) => {
            row.conditions.forEach((condition) => {
              if (isConditionBlank(condition)) {
                return;
              }

              ['field', 'operator', ...getConditionRequiredFields(condition)].forEach((field) => {
                if (!String(condition[field] ?? '').trim()) {
                  errors.push(getErrorKey('secondary-condition', tab.id, row.id, condition.id, field));
                  if (!firstTabId) firstTabId = tab.id;
                }
              });

              if (isRangeOperator(condition.operator)) {
                const startText = String(condition.startValue ?? '').trim();
                const endText = String(condition.endValue ?? '').trim();
                if (startText && endText && Number(startText) >= Number(endText)) {
                  errors.push(getErrorKey('secondary-condition', tab.id, row.id, condition.id, 'startValue'));
                  errors.push(getErrorKey('secondary-condition', tab.id, row.id, condition.id, 'endValue'));
                  if (!firstTabId) firstTabId = tab.id;
                  hasRangeOrderError = true;
                }
              }
            });

            ['chargeUnit', 'unitQty', 'unitPrice'].forEach((field) => {
              if (!String(row[field] ?? '').trim()) {
                errors.push(getErrorKey('secondary-shared', tab.id, row.id, field));
                if (!firstTabId) firstTabId = tab.id;
              }
            });
          });
        });

        modalState.errors = errors;
        if (errors.length) {
          modalState.activeTabId = firstTabId || modalState.activeTabId;
          renderModal();
          if (typeof showToast === 'function') {
              showToast('error', '规则保存失败', hasRangeOrderError ? '区间起始值必须小于结束值。' : '请完善弹窗中带 * 的必填信息后再提交。');
            }
          return false;
        }

        const conflictMap = collectTabConflictMap(modalState.draftTabs);
        const warnings = uniqueValues(Object.values(conflictMap).flat());

        // 检测到矛盾条件时显示警告（但不阻止保存）
        if (warnings.length > 0) {
          const warningMessage = warnings.slice(0, 3).join('\n');
          const fullMessage = warnings.length > 3
            ? `${warningMessage}\n...等${warnings.length}个矛盾`
            : warningMessage;

          if (!window.confirm(`检测到规则条件存在矛盾：\n\n${fullMessage}\n\n矛盾规则可能导致费用无法计算或计费异常。是否仍要保存？`)) {
            return false;
          }
        }

        return true;
      }

      function saveModal() {
        if (modalState.saving) return;
        if (!validateModal()) return;

        modalState.saving = true;
        if (typeof setButtonLoading === 'function') {
          setButtonLoading(editorConfirmBtn, true, '保存中');
        } else {
          editorConfirmBtn.disabled = true;
          editorConfirmBtn.textContent = '保存中';
        }

        window.setTimeout(() => {
          state.ruleTabs = deepClone(modalState.draftTabs);
          syncRuleSummary();
          modalState.saving = false;
          closeModal();
          if (typeof showToast === 'function') {
            showToast('success', '规则已更新', '编辑规则已保存，并同步到计费规则列表。');
          }
        }, 700);
      }

      function deleteRuleGroup(groupId) {
        const current = state.rules.find((item) => item.id === groupId);
        if (!current) return;
        if (!window.confirm(`删除后数据不可恢复,是否确认删除？\n\n将删除规则组：${current.condition}`)) return;
        state.ruleTabs = state.ruleTabs.filter((tab) => tab.id !== groupId);
        syncRuleSummary();
        if (typeof showToast === 'function') {
          showToast('success', '删除成功', '规则组已删除。');
        }
      }

      function deleteRuleItem(groupId, itemId) {
        const tab = state.ruleTabs.find((item) => item.id === groupId);
        if (!tab) return;
        const current = tab.secondaryRules.find((item) => item.id === itemId);
        if (!current) return;
        if (!window.confirm(`删除后数据不可恢复,是否确认删除？\n\n将删除规则：${formatSecondaryRule(current)}`)) return;
        tab.secondaryRules = tab.secondaryRules.filter((item) => item.id !== itemId);
        if (!tab.secondaryRules.length) {
          state.ruleTabs = state.ruleTabs.filter((item) => item.id !== groupId);
        }
        syncRuleSummary();
        if (typeof showToast === 'function') {
          showToast('success', '删除成功', '规则明细已删除。');
        }
      }

      state.ruleTabs = createInitialRuleTabs();
      syncRuleSummary();

      groupBtn.addEventListener('click', () => openModal());
      ruleList.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const groupId = Number(button.dataset.groupId);
        const itemId = Number(button.dataset.itemId);

        if (action === 'edit-group') {
          openModal(groupId);
        }

        if (action === 'delete-group') {
          deleteRuleGroup(groupId);
        }

        if (action === 'delete-item') {
          deleteRuleItem(groupId, itemId);
        }
      });

      addPrimaryConditionBtn.addEventListener('click', addPrimaryCondition);
      addSecondaryRuleBtn.addEventListener('click', addSecondaryRule);
      ruleEditorClose.addEventListener('click', closeModal);
      editorCancelBtn.addEventListener('click', closeModal);
      editorConfirmBtn.addEventListener('click', saveModal);

      ruleEditorModal.addEventListener('click', (event) => {
        if (event.target === ruleEditorModal) {
          closeModal();
          return;
        }

        const button = event.target.closest('[data-modal-action]');
        if (!button) return;
        const action = button.dataset.modalAction;
        const tabId = Number(button.dataset.tabId);
        const rowId = Number(button.dataset.rowId);
        const conditionId = Number(button.dataset.conditionId);

        if (action === 'switch-tab') {
          modalState.activeTabId = tabId;
          modalState.errors = [];
          renderModal();
        }

        if (action === 'add-tab') {
          const nextIndex = modalState.draftTabs.length + 1;
          const tab = createRuleTab(nextIndex, { name: `规则${nextIndex}` });
          modalState.draftTabs.push(tab);
          modalState.activeTabId = tab.id;
          modalState.errors = [];
          renderModal();
          if (typeof showToast === 'function') {
            showToast('info', '已新增规则页签', `已创建 ${tab.name}，可继续补充主规则和副规则。`);
          }
        }

        if (action === 'delete-primary') {
          deletePrimaryCondition(tabId, rowId);
        }

        if (action === 'insert-secondary-condition') {
          addSecondaryCondition(tabId, rowId);
        }

        if (action === 'duplicate-secondary') {
          insertSecondaryRule(tabId, rowId, true);
        }

        if (action === 'delete-secondary') {
          deleteSecondaryCondition(tabId, rowId, conditionId);
        }
      });

      ruleEditorModal.addEventListener('input', (event) => {
        const control = event.target.closest('[data-editor-type]');
        if (!control) return;
        updateModalRow(control);
      });

      ruleEditorModal.addEventListener('change', (event) => {
        const control = event.target.closest('[data-editor-type]');
        if (!control) return;
        updateModalRow(control);
      });

      ruleEditorModal.addEventListener('dragstart', (event) => {
        const handle = event.target.closest('[data-drag-type="secondary-condition"]');
        if (!handle) return;

        modalState.draggingCondition = {
          tabId: Number(handle.dataset.tabId),
          rowId: Number(handle.dataset.rowId),
          conditionId: Number(handle.dataset.conditionId)
        };

        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', String(handle.dataset.conditionId));
        }
      });

      ruleEditorModal.addEventListener('dragover', (event) => {
        const target = event.target.closest('[data-drop-scope="secondary-condition"]');
        if (!target || !modalState.draggingCondition) return;

        const targetTabId = Number(target.dataset.tabId);
        const targetRowId = Number(target.dataset.rowId);
        const targetConditionId = Number(target.dataset.conditionId);
        const { tabId, rowId, conditionId } = modalState.draggingCondition;

        if (tabId !== targetTabId || rowId !== targetRowId || conditionId === targetConditionId) return;

        event.preventDefault();
        clearDragIndicators();
        target.classList.add('is-drop-target');
      });

      ruleEditorModal.addEventListener('dragleave', (event) => {
        const target = event.target.closest('[data-drop-scope="secondary-condition"]');
        if (!target) return;
        target.classList.remove('is-drop-target');
      });

      ruleEditorModal.addEventListener('drop', (event) => {
        const target = event.target.closest('[data-drop-scope="secondary-condition"]');
        if (!target || !modalState.draggingCondition) return;

        const targetTabId = Number(target.dataset.tabId);
        const targetRowId = Number(target.dataset.rowId);
        const targetConditionId = Number(target.dataset.conditionId);
        const { tabId, rowId, conditionId } = modalState.draggingCondition;

        resetDraggingCondition();
        if (tabId !== targetTabId || rowId !== targetRowId || conditionId === targetConditionId) return;

        event.preventDefault();
        moveSecondaryCondition(tabId, rowId, conditionId, targetConditionId);
      });

      ruleEditorModal.addEventListener('dragend', () => {
        resetDraggingCondition();
      });

      const pageParams = new URLSearchParams(window.location.search);
      const pageMode = pageParams.get('mode');
      const pageTitleLabel = document.getElementById('pageTitleLabel');
      const pageBreadcrumbLabel = document.getElementById('pageBreadcrumbLabel');
      const pageTabLabel = document.getElementById('pageTabLabel');

      if (pageMode === 'edit') {
        document.title = '编辑操作费';
        if (pageTitleLabel) pageTitleLabel.textContent = '编辑操作费';
        if (pageBreadcrumbLabel) pageBreadcrumbLabel.textContent = '编辑操作费';
        if (pageTabLabel) pageTabLabel.textContent = '编辑操作费';
      }

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalState.open) {
          closeModal();
        }
      });
    })();
