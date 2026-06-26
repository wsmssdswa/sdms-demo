(function () {
  "use strict";

  /* ═══════════════════════════════════════════════
     预定义维度注册表
     ═══════════════════════════════════════════════ */
  var DIM_REGISTRY = {
    arrivalMode:    { name: "到货形式", type: "enum",   values: ["整柜", "散货"] },
    cargoType:      { name: "货物类型", type: "enum",   values: ["箱货", "托盘货"] },
    containerType:  { name: "柜型",     type: "enum",   values: ["20GP", "40GP", "40HQ"] },
    cargoProperty:  { name: "货物属性", type: "enum",   values: ["普货", "敏感货", "易碎"] },
    boxCount:       { name: "箱数",     type: "numeric", operators: [">", ">=", "<", "<=", "=", "介于"] },
    cartonWeight:   { name: "单箱重量", type: "numeric", operators: [">", ">=", "<", "<=", "=", "介于"] },
    skuCount:       { name: "SKU数量",  type: "numeric", operators: [">", ">=", "<", "<=", "=", "介于"] }
  };

  /* 附加费可选条件字段 */
  var SURCH_FIELDS = [
    { key: "boxCount",     name: "箱数" },
    { key: "cartonWeight", name: "单箱重量" },
    { key: "skuCount",     name: "SKU数量" }
  ];

  var SURCH_OPERATORS = [">", ">=", "<", "<=", "=", "介于"];

  var CHARGE_UNITS = ["柜", "箱", "托", "kg", "SKU", "CBM"];

  /* ═══════════════════════════════════════════════
     全局状态
     ═══════════════════════════════════════════════ */
  var state = {
    inboundType: "尾程大货入库",
    saving: false,
    simulating: false,
    dimensions: ["arrivalMode", "cargoType", "containerType"],
    priceRows: [],
    surchargeRows: [],
    nextId: 1,
    trialOpen: false
  };

  function nextId() { return ++state.nextId; }

  /* ═══════════════════════════════════════════════
     DOM 引用
     ═══════════════════════════════════════════════ */
  var $dimTags     = document.getElementById("dimTags");
  var $dimAddBtn   = document.getElementById("dimAddBtn");
  var $dimDropdown = document.getElementById("dimDropdown");
  var $ptable      = document.getElementById("ptable");
  var $toastStack  = document.getElementById("toastStack");
  var $saveBtn     = document.getElementById("saveBtn");
  var $simBtn      = document.getElementById("simBtn");

  /* trial */
  var $trialMask   = document.getElementById("trialMask");
  var $trialTitle  = document.getElementById("trialTitle");
  var $trialClose  = document.getElementById("trialClose");
  var $trialInput  = document.getElementById("trialInput");
  var $trialRun    = document.getElementById("trialRun");
  var $trialStatus = document.getElementById("trialStatus");
  var $trialSumm   = document.getElementById("trialSumm");
  var $trialScroll = document.getElementById("trialScroll");
  var $trialTotal  = document.getElementById("trialTotal");
  var $trialBoardH = document.getElementById("trialBoardHead");

  /* ═══════════════════════════════════════════════
     工具函数
     ═══════════════════════════════════════════════ */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function sel(selected, value) { return String(value) === String(selected) ? " selected" : ""; }

  function curSym(c) { return ({ EUR: "€", USD: "$", CNY: "¥" })[c] || c || "€"; }

  function getCurrency() { return document.getElementById("currency") ? document.getElementById("currency").value : "EUR"; }

  /* 笛卡尔积 */
  function cartesian(arrays) {
    return arrays.reduce(function (acc, arr) {
      var r = [];
      acc.forEach(function (c) { arr.forEach(function (v) { r.push(c.concat([v])); }); });
      return r;
    }, [[]]);
  }

  /* 默认定价（mock） */
  function defaultPricing(vals) {
    var a = vals.arrivalMode, c = vals.cargoType, t = vals.containerType;
    if (a === "整柜" && c === "箱货") {
      if (t === "20GP") return { chargeUnit: "柜", unitPrice: "300", unitQty: "1" };
      if (t === "40GP") return { chargeUnit: "柜", unitPrice: "350", unitQty: "1" };
      if (t === "40HQ") return { chargeUnit: "柜", unitPrice: "450", unitQty: "1" };
    }
    if (a === "整柜" && c === "托盘货") {
      if (t === "20GP") return { chargeUnit: "柜", unitPrice: "220", unitQty: "1" };
      if (t === "40GP") return { chargeUnit: "柜", unitPrice: "330", unitQty: "1" };
      if (t === "40HQ") return { chargeUnit: "柜", unitPrice: "350", unitQty: "1" };
    }
    if (a === "散货" && c === "箱货")   return { chargeUnit: "箱", unitPrice: "1", unitQty: "1" };
    if (a === "散货" && c === "托盘货") return { chargeUnit: "托", unitPrice: "15", unitQty: "1" };
    return emptyPricing();
  }

  function emptyPricing() {
    return { chargeUnit: "", unitPrice: "", waiveAmount: "", baseFee: "", minFee: "", maxFee: "", unitQty: "1", roundUp: false, remark: "" };
  }

  /* ═══════════════════════════════════════════════
     行生成
     ═══════════════════════════════════════════════ */
  function generatePriceRows() {
    var dims = state.dimensions;
    if (!dims.length) { state.priceRows = []; return; }

    /* 只用enum维度做笛卡尔积，numeric维度作为可编辑列但值为空 */
    var enumDims = dims.filter(function (k) { return DIM_REGISTRY[k].type === "enum"; });
    var valueArrays = enumDims.map(function (k) { return DIM_REGISTRY[k].values; });

    if (!valueArrays.length) {
      /* 全是numeric维度，无法自动生成行，给一个空行让用户手动填写 */
      var emptyVals = {};
      dims.forEach(function (k) { emptyVals[k] = { operator: ">", value: "", startValue: "", endValue: "" }; });
      state.priceRows = [{
        id: nextId(),
        _order: 0,
        dimensionValues: emptyVals,
        pricing: emptyPricing()
      }];
      return;
    }

    var combos = cartesian(valueArrays);

    state.priceRows = combos.map(function (combo, idx) {
      var vals = {};
      var eidx = 0;
      dims.forEach(function (k) {
        var def = DIM_REGISTRY[k];
        if (def.type === "enum") {
          vals[k] = combo[eidx++];
        } else {
          vals[k] = { operator: ">", value: "", startValue: "", endValue: "" };
        }
      });
      return {
        id: nextId(),
        _order: idx,
        dimensionValues: vals,
        pricing: defaultPricing(vals)
      };
    });
  }

  function initSurchargeRows() {
    state.surchargeRows = [
      {
        id: nextId(),
        condition: { field: "boxCount", operator: ">", value: "700", startValue: "", endValue: "" },
        pricing: { chargeUnit: "箱", unitPrice: "0.30", waiveAmount: "700", baseFee: "", minFee: "", maxFee: "", unitQty: "1", roundUp: false, remark: "" }
      },
      {
        id: nextId(),
        condition: { field: "skuCount", operator: ">", value: "20", startValue: "", endValue: "" },
        pricing: { chargeUnit: "SKU", unitPrice: "10", waiveAmount: "20", baseFee: "", minFee: "", maxFee: "100", unitQty: "1", roundUp: false, remark: "" }
      }
    ];
  }

  /* ═══════════════════════════════════════════════
     行合并计算 (rowspan)
     ═══════════════════════════════════════════════ */
  /* 将维度值序列化为字符串用于比较（兼容enum字符串和numeric对象） */
  function dimValStr(row, key) {
    var v = row.dimensionValues[key];
    return typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
  }

  /* 基于实际行数据动态计算rowspan，兼容增删行后的非完整笛卡尔积 */
  /* 数值维度不合并——每行都是独立的阶梯条件 */
  function calcSpans(rows, dims) {
    if (!dims.length || !rows.length) return [];
    var result = rows.map(function () { return {}; });
    dims.forEach(function (dimKey) {
      /* 数值维度：每行独立，span恒为1 */
      if (DIM_REGISTRY[dimKey].type === "numeric") {
        rows.forEach(function (_, i) { result[i][dimKey] = 1; });
        return;
      }
      /* 枚举维度：相同值合并 */
      var i = 0;
      while (i < rows.length) {
        var startVal = dimValStr(rows[i], dimKey);
        var span = 1;
        while (i + span < rows.length && dimValStr(rows[i + span], dimKey) === startVal) {
          var higherMatch = true;
          var dimIdx = dims.indexOf(dimKey);
          for (var d = 0; d < dimIdx; d++) {
            if (dimValStr(rows[i], dims[d]) !== dimValStr(rows[i + span], dims[d])) {
              higherMatch = false;
              break;
            }
          }
          if (higherMatch) { span++; } else { break; }
        }
        result[i][dimKey] = span;
        for (var j = 1; j < span; j++) { result[i + j][dimKey] = 0; }
        i += span;
      }
    });
    return result;
  }

  /* ═══════════════════════════════════════════════
     渲染：维度标签
     ═══════════════════════════════════════════════ */
  function renderDimTags() {
    $dimTags.innerHTML = state.dimensions.map(function (k) {
      var d = DIM_REGISTRY[k];
      return '<div class="v3-dim-tag" draggable="true" data-dim-key="' + k + '">' +
        '<span>' + esc(d.name) + '</span>' +
        '<button class="v3-dim-tag-close" type="button" data-dim-remove="' + k + '">×</button>' +
        '</div>';
    }).join("");
  }

  function renderDimDropdown() {
    var available = Object.keys(DIM_REGISTRY).filter(function (k) {
      return state.dimensions.indexOf(k) === -1;
    });
    if (!available.length) {
      $dimDropdown.innerHTML = '<div class="v3-dim-dd-empty">所有维度已添加</div>';
      return;
    }
    $dimDropdown.innerHTML = available.map(function (k) {
      return '<div class="v3-dim-dd-item" data-dim-add="' + k + '">' + esc(DIM_REGISTRY[k].name) + '</div>';
    }).join("");
  }

  /* ═══════════════════════════════════════════════
     渲染：价目表
     ═══════════════════════════════════════════════ */
  function renderTable() {
    var dims = state.dimensions;
    var sym = curSym(getCurrency());
    var totalCols = dims.length + 10; /* 维度列 + 计费单位+单价+减免量+基础收费+最低+最高+单位数量+进位+备注+操作 = 10列 */

    /* 按维度值排序以支持rowspan合并，_order作为主排序键保证插入位置稳定 */
    state.priceRows.sort(function (a, b) {
      var oa = a._order || 0, ob = b._order || 0;
      if (oa !== ob) return oa < ob ? -1 : 1;
      for (var i = 0; i < dims.length; i++) {
        var va = dimValStr(a, dims[i]);
        var vb = dimValStr(b, dims[i]);
        if (va < vb) return -1;
        if (va > vb) return 1;
      }
      return 0;
    });

    /* ── 表头 ── */
    var th = '<tr>';
    dims.forEach(function (k) {
      th += '<th>' + esc(DIM_REGISTRY[k].name) + '</th>';
    });
    th += '<th class="v3-th-req">计费单位</th>';
    th += '<th class="v3-th-req">单价(' + esc(sym) + ')</th>';
    th += '<th>减免量</th>';
    th += '<th>基础收费</th>';
    th += '<th>最低收费</th>';
    th += '<th>最高收费</th>';
    th += '<th class="v3-th-req">单位数量</th>';
    th += '<th>进位</th>';
    th += '<th>备注</th>';
    th += '<th>操作</th>';
    th += '</tr>';

    /* ── 价目表主体 ── */
    var tb = "";
    var rows = state.priceRows;
    if (!dims.length) {
      tb = '<tr><td colspan="' + totalCols + '" class="v3-ptable-empty">请先添加维度并生成价目表</td></tr>';
    } else if (!rows.length) {
      tb = '<tr><td colspan="' + totalCols + '" class="v3-ptable-empty">暂无数据</td></tr>';
    } else {
      var spanMap = calcSpans(rows, dims);
      rows.forEach(function (row, ri) {
        var spans = spanMap[ri];
        tb += '<tr data-row-id="' + row.id + '">';
        /* 维度列 */
        dims.forEach(function (k) {
          var sp = spans[k];
          if (sp === 0) return; /* 隐藏 */
          var def = DIM_REGISTRY[k];
          if (def.type === "enum") {
            tb += '<td class="v3-td-dim" rowspan="' + sp + '">' + renderEnumCell(row.id, k, row.dimensionValues[k], def) + '</td>';
          } else {
            tb += '<td class="v3-td-dim" rowspan="' + sp + '">' + renderNumericCell(row.id, k, row.dimensionValues[k], def) + '</td>';
          }
        });
        /* 价格列 */
        tb += renderPriceCells(row.pricing, row.id, "price");
        /* 操作列 */
        tb += '<td class="v3-td-action"><div class="v3-row-actions"><button class="v3-row-insert" type="button" data-insert-after="' + row.id + '" title="在下方插入行">+</button><button class="v3-row-del" type="button" data-del-row="' + row.id + '" title="删除此行">−</button></div></td>';
        tb += '</tr>';
      });
    }

    /* ── 附加费分割线 ── */
    var surchHeader = '<tr><td colspan="' + totalCols + '">' +
      '<div class="v3-surch-divider">' +
      '<span class="v3-surch-label">附加费</span>' +
      '<span class="v3-surch-line"></span>' +
      '<button class="v3-surch-add" type="button" id="addSurchBtn">+ 新增附加费</button>' +
      '</div></td></tr>';

    /* ── 附加费数据行 ── */
    var surchBody = "";
    state.surchargeRows.forEach(function (row) {
      surchBody += '<tr class="v3-surch-row" data-surch-id="' + row.id + '">';
      /* 维度列区域：展示条件，占满维度列 */
      if (dims.length > 0) {
        surchBody += '<td colspan="' + dims.length + '" class="v3-td-surch-cond">' + renderCondCell(row) + '</td>';
      }
      /* 价格列 */
      surchBody += renderPriceCells(row.pricing, row.id, "surch");
      /* 操作 */
      surchBody += '<td class="v3-td-action"><button class="v3-row-del" type="button" data-del-surch="' + row.id + '" title="删除此附加费">−</button></td>';
      surchBody += '</tr>';
    });

    $ptable.innerHTML = '<thead>' + th + '</thead>' +
      '<tbody>' + tb + surchHeader + surchBody + '</tbody>' +
      '<tfoot><tr><td colspan="' + totalCols + '">' +
        '<div class="v3-ptable-foot">' +
          '<span class="v3-row-count">价目表 ' + state.priceRows.length + ' 行 · 附加费 ' + state.surchargeRows.length + ' 行</span>' +
        '</div>' +
      '</td></tr></tfoot>';
  }

  /* 渲染枚举型维度单元格（下拉选择） */
  function renderEnumCell(rowId, dimKey, currentVal, def) {
    return '<select class="v3-pselect v3-dim-select" data-dim-select="' + rowId + '-' + dimKey + '" style="font-weight:600;font-size:13px;color:#1c2d3f">' +
      def.values.map(function (v) { return '<option' + sel(currentVal, v) + '>' + esc(v) + '</option>'; }).join("") +
      '</select>';
  }

  /* 渲染数值型维度单元格 */
  function renderNumericCell(rowId, dimKey, dimVal, def) {
    var obj = (typeof dimVal === "object" && dimVal !== null) ? dimVal : { operator: ">", value: String(dimVal || ""), startValue: "", endValue: "" };
    var op = obj.operator || ">";
    var isRange = op === "介于";
    var valHtml;
    if (isRange) {
      valHtml = '<input class="v3-num-val" type="text" value="' + esc(obj.startValue || "") + '" placeholder="起始值" data-num-start="' + rowId + '-' + dimKey + '">' +
        '<span class="v3-num-sep">~</span>' +
        '<input class="v3-num-val" type="text" value="' + esc(obj.endValue || "") + '" placeholder="结束值" data-num-end="' + rowId + '-' + dimKey + '">';
    } else {
      valHtml = '<input class="v3-num-val" type="text" value="' + esc(obj.value || "") + '" placeholder="值" data-num-val="' + rowId + '-' + dimKey + '">';
    }
    return '<div class="v3-num-cell' + (isRange ? " v3-num-cell-range" : "") + '">' +
      '<select class="v3-num-op" data-num-op="' + rowId + '-' + dimKey + '">' +
      def.operators.map(function (o) { return '<option' + sel(op, o) + '>' + o + '</option>'; }).join("") +
      '</select>' + valHtml +
      '</div>';
  }

  /* 渲染附加费条件单元格 */
  function renderCondCell(row) {
    var c = row.condition || {};
    var isRange = c.operator === "介于";
    var valHtml;
    if (isRange) {
      valHtml = '<input class="v3-cond-val" type="text" value="' + esc(c.startValue || "") + '" placeholder="起始值" data-cond-start="' + row.id + '">' +
        '<span class="v3-num-sep" style="color:#c2410c">~</span>' +
        '<input class="v3-cond-val" type="text" value="' + esc(c.endValue || "") + '" placeholder="结束值" data-cond-end="' + row.id + '">';
    } else {
      valHtml = '<input class="v3-cond-val" type="text" value="' + esc(c.value) + '" placeholder="值" data-cond-val="' + row.id + '">';
    }
    return '<div class="v3-cond-cell' + (isRange ? " v3-cond-cell-range" : "") + '">' +
      '<select class="v3-cond-field" data-cond-field="' + row.id + '">' +
      '<option value="">不限</option>' +
      SURCH_FIELDS.map(function (f) { return '<option value="' + f.key + '"' + sel(c.field, f.key) + '>' + f.name + '</option>'; }).join("") +
      '</select>' +
      '<select class="v3-cond-op" data-cond-op="' + row.id + '">' +
      SURCH_OPERATORS.map(function (o) { return '<option' + sel(c.operator, o) + '>' + o + '</option>'; }).join("") +
      '</select>' + valHtml +
      '</div>';
  }

  /* 渲染价格列（共用） */
  function renderPriceCells(p, id, prefix) {
    var bgCls = prefix === "price" && p.unitPrice ? " v3-td-highlight" : "";
    return '<td class="v3-td-price' + bgCls + '">' +
        '<select class="v3-pselect" data-price="chargeUnit-' + prefix + '-' + id + '">' +
        '<option value="">请选择</option>' +
        CHARGE_UNITS.map(function (u) { return '<option' + sel(p.chargeUnit, u) + '>' + u + '</option>'; }).join("") +
        '</select></td>' +
      '<td class="v3-td-price' + bgCls + '">' +
        '<input class="v3-pinput" type="text" value="' + esc(p.unitPrice) + '" placeholder="单价" data-price="unitPrice-' + prefix + '-' + id + '"></td>' +
      '<td><input class="v3-pinput" type="text" value="' + esc(p.waiveAmount) + '" placeholder="-" data-price="waiveAmount-' + prefix + '-' + id + '"></td>' +
      '<td><input class="v3-pinput" type="text" value="' + esc(p.baseFee) + '" placeholder="-" data-price="baseFee-' + prefix + '-' + id + '"></td>' +
      '<td><input class="v3-pinput" type="text" value="' + esc(p.minFee) + '" placeholder="-" data-price="minFee-' + prefix + '-' + id + '"></td>' +
      '<td><input class="v3-pinput" type="text" value="' + esc(p.maxFee) + '" placeholder="-" data-price="maxFee-' + prefix + '-' + id + '"></td>' +
      '<td><input class="v3-pinput" type="text" value="' + esc(p.unitQty) + '" placeholder="1" data-price="unitQty-' + prefix + '-' + id + '"></td>' +
      '<td><div style="display:flex;align-items:center;justify-content:center;height:100%"><input class="v3-pcheck" type="checkbox"' + (p.roundUp ? " checked" : "") + ' data-price="roundUp-' + prefix + '-' + id + '"></div></td>' +
      '<td><input class="v3-pinput" type="text" value="' + esc(p.remark) + '" placeholder="-" data-price="remark-' + prefix + '-' + id + '"></td>';
  }

  /* ═══════════════════════════════════════════════
     维度操作
     ═══════════════════════════════════════════════ */
  function addDimension(key) {
    if (state.dimensions.indexOf(key) !== -1) return;
    if (!window.confirm("添加维度「" + DIM_REGISTRY[key].name + "」将清空已有价格数据并重新生成表格。\n\n确定继续吗？")) return;
    state.dimensions.push(key);
    closeDimDropdown();
    generatePriceRows();
    renderDimTags();
    renderDimDropdown();
    renderTable();
    toast("info", "维度已添加", "已添加「" + DIM_REGISTRY[key].name + "」并重新生成价目表。");
  }

  function removeDimension(key) {
    var name = DIM_REGISTRY[key].name;
    if (!window.confirm("移除维度「" + name + "」将清空已有价格数据并重新生成表格。\n\n确定继续吗？")) return;
    state.dimensions = state.dimensions.filter(function (k) { return k !== key; });
    generatePriceRows();
    renderDimTags();
    renderDimDropdown();
    renderTable();
    toast("info", "维度已移除", "已移除「" + name + "」并重新生成价目表。");
  }

  function closeDimDropdown() {
    $dimDropdown.classList.remove("open");
  }

  /* ═══════════════════════════════════════════════
     行操作
     ═══════════════════════════════════════════════ */
  function createEmptyRow() {
    var row = {
      id: nextId(),
      _order: Date.now(),
      dimensionValues: {},
      pricing: emptyPricing()
    };
    state.dimensions.forEach(function (k) {
      var def = DIM_REGISTRY[k];
      row.dimensionValues[k] = def.type === "enum" ? def.values[0] : { operator: ">", value: "", startValue: "", endValue: "" };
    });
    return row;
  }

  function addPriceRow() {
    state.priceRows.push(createEmptyRow());
    renderTable();
  }

  function insertPriceRow(afterId) {
    var idx = state.priceRows.findIndex(function (r) { return r.id === afterId; });
    if (idx === -1) return;
    var newRow = createEmptyRow();
    /* 继承目标行的_order并加微小偏移，确保排序后紧跟其后 */
    newRow._order = (state.priceRows[idx]._order || 0) + 0.5;
    state.priceRows.splice(idx + 1, 0, newRow);
    renderTable();
  }

  function deletePriceRow(id) {
    state.priceRows = state.priceRows.filter(function (r) { return r.id !== id; });
    renderTable();
  }

  function addSurchargeRow() {
    state.surchargeRows.push({
      id: nextId(),
      condition: { field: "", operator: ">", value: "", startValue: "", endValue: "" },
      pricing: emptyPricing()
    });
    renderTable();
  }

  function deleteSurchargeRow(id) {
    state.surchargeRows = state.surchargeRows.filter(function (r) { return r.id !== id; });
    renderTable();
  }

  /* ═══════════════════════════════════════════════
     表格数据读写
     ═══════════════════════════════════════════════ */
  function findPriceRow(id) {
    return state.priceRows.find(function (r) { return r.id === id; }) ||
           state.surchargeRows.find(function (r) { return r.id === id; });
  }

  function handlePriceChange(el) {
    var attr = el.getAttribute("data-price");
    if (!attr) return;
    var parts = attr.split("-");
    var field = parts[0];
    var prefix = parts[1];
    var id = Number(parts[2]);
    var row = prefix === "price"
      ? state.priceRows.find(function (r) { return r.id === id; })
      : state.surchargeRows.find(function (r) { return r.id === id; });
    if (!row) return;
    row.pricing[field] = el.type === "checkbox" ? el.checked : el.value;
  }

  function handleCondChange(el) {
    var attr, id, row;
    if (el.getAttribute("data-cond-field")) {
      id = Number(el.getAttribute("data-cond-field"));
      row = state.surchargeRows.find(function (r) { return r.id === id; });
      if (row) row.condition.field = el.value;
    } else if (el.getAttribute("data-cond-op")) {
      id = Number(el.getAttribute("data-cond-op"));
      row = state.surchargeRows.find(function (r) { return r.id === id; });
      if (row) {
        row.condition.operator = el.value;
        renderTable(); /* 运算符切换需要重新渲染 */
      }
    } else if (el.getAttribute("data-cond-val")) {
      id = Number(el.getAttribute("data-cond-val"));
      row = state.surchargeRows.find(function (r) { return r.id === id; });
      if (row) row.condition.value = el.value;
    } else if (el.getAttribute("data-cond-start")) {
      id = Number(el.getAttribute("data-cond-start"));
      row = state.surchargeRows.find(function (r) { return r.id === id; });
      if (row) row.condition.startValue = el.value;
    } else if (el.getAttribute("data-cond-end")) {
      id = Number(el.getAttribute("data-cond-end"));
      row = state.surchargeRows.find(function (r) { return r.id === id; });
      if (row) row.condition.endValue = el.value;
    }
  }

  /* 回写enum维度下拉选择到state */
  function handleDimSelect(el) {
    var attr = el.getAttribute("data-dim-select");
    if (!attr) return;
    var parts = attr.split("-");
    var rowId = Number(parts[0]);
    var dimKey = parts.slice(1).join("-");
    var row = state.priceRows.find(function (r) { return r.id === rowId; });
    if (!row) return;
    row.dimensionValues[dimKey] = el.value;
  }

  /* 回写numeric维度的operator/value到state */
  function handleNumericChange(el) {
    var opAttr = el.getAttribute("data-num-op");
    var valAttr = el.getAttribute("data-num-val");
    var startAttr = el.getAttribute("data-num-start");
    var endAttr = el.getAttribute("data-num-end");
    var attr = opAttr || valAttr || startAttr || endAttr;
    if (!attr) return;
    var parts = attr.split("-");
    var rowId = Number(parts[0]);
    var dimKey = parts.slice(1).join("-");
    var row = state.priceRows.find(function (r) { return r.id === rowId; });
    if (!row) return;
    var dv = row.dimensionValues[dimKey];
    if (typeof dv !== "object" || dv === null) {
      dv = { operator: ">", value: String(dv || ""), startValue: "", endValue: "" };
      row.dimensionValues[dimKey] = dv;
    }
    if (opAttr) {
      dv.operator = el.value;
      renderTable(); /* 运算符切换需要重新渲染（单值↔双值） */
    }
    if (valAttr) dv.value = el.value;
    if (startAttr) dv.startValue = el.value;
    if (endAttr) dv.endValue = el.value;
  }

  /* ═══════════════════════════════════════════════
     表单校验
     ═══════════════════════════════════════════════ */
  var REQUIRED_FIELDS = {
    chargeName: "请输入计费项名称",
    feeItem:    "请选择费用项",
    warehouse:  "请选择所属仓库",
    currency:   "请选择币种",
    measureUnit:"请选择计量单位",
    chargeUnit: "请选择默认计费单位",
    chargeNode: "请选择计费节点"
  };

  function clearFieldErrors() {
    document.querySelectorAll(".v3-field").forEach(function (g) {
      g.classList.remove("v3-field-error");
      var tip = g.querySelector(".v3-field-tip");
      if (tip) tip.textContent = "";
    });
  }

  function setFieldError(name, msg) {
    var g = document.querySelector('.v3-field[data-field="' + name + '"]');
    if (!g) return;
    g.classList.add("v3-field-error");
    var tip = g.querySelector(".v3-field-tip");
    if (tip) tip.textContent = msg;
  }

  function getVal(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }

  function validateForm() {
    clearFieldErrors();
    var errors = [];
    var data = {
      chargeName: getVal("chargeName"),
      feeItem:    getVal("feeItem"),
      warehouse:  getVal("warehouse"),
      inboundType: state.inboundType,
      currency:   getVal("currency"),
      measureUnit:getVal("measureUnit"),
      chargeUnit: getVal("chargeUnit"),
      chargeNode: getVal("chargeNode"),
      remark:     getVal("remark")
    };
    Object.keys(REQUIRED_FIELDS).forEach(function (f) {
      if (!data[f]) { setFieldError(f, REQUIRED_FIELDS[f]); errors.push(REQUIRED_FIELDS[f]); }
    });
    return { valid: errors.length === 0, data: data };
  }

  /* ═══════════════════════════════════════════════
     保存
     ═══════════════════════════════════════════════ */
  function save() {
    if (state.saving) return;
    var v = validateForm();
    if (!v.valid) { toast("error", "保存失败", "请检查必填项后重试。"); return; }
    state.saving = true;
    setBtnLoading($saveBtn, true, "保存中");
    setTimeout(function () {
      state.saving = false;
      setBtnLoading($saveBtn, false);
      toast("success", "保存成功", "操作费「" + v.data.chargeName + "」已保存。");
    }, 800);
  }

  function setBtnLoading(btn, loading, text) {
    var base = btn.dataset.text || btn.textContent.trim();
    if (!btn.dataset.text) btn.dataset.text = base;
    if (loading) {
      btn.disabled = true;
      btn.innerHTML = '<span class="v3-btn-spinner"></span><span>' + text + '</span>';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.text;
    }
  }

  /* ═══════════════════════════════════════════════
     费用试算
     ═══════════════════════════════════════════════ */
  function openTrial() {
    var v = validateForm();
    if (!v.valid) { toast("error", "试算失败", "请先完善基本信息。"); return; }
    $trialTitle.textContent = "费用试算-" + (v.data.chargeName || "操作费");
    $trialInput.value = "SNBWAW250625A63149";
    $trialInput.classList.remove("error");
    $trialStatus.textContent = "";
    $trialStatus.className = "v3-trial-status";
    $trialSumm.innerHTML = "";
    $trialScroll.innerHTML = '<div class="v3-trial-empty"><div class="v3-spinner"></div><div>请输入试算单号后点击试算</div></div>';
    $trialTotal.textContent = curSym(getCurrency()) + "0.00";
    $trialMask.classList.add("open");
    state.trialOpen = true;
  }

  function closeTrial() {
    $trialMask.classList.remove("open");
    state.trialOpen = false;
  }

  function runTrial() {
    if (state.simulating) return;
    var orderNo = $trialInput.value.trim();
    if (!orderNo) {
      $trialInput.classList.add("error");
      $trialStatus.textContent = "请输入试算单号。";
      $trialStatus.className = "v3-trial-status error";
      return;
    }
    $trialInput.classList.remove("error");
    state.simulating = true;
    setBtnLoading($trialRun, true, "试算中");
    $trialStatus.textContent = "试算中...";
    $trialStatus.className = "v3-trial-status loading";
    $trialScroll.innerHTML = '<div class="v3-trial-empty"><div class="v3-spinner"></div><div>正在计算...</div></div>';

    setTimeout(function () {
      state.simulating = false;
      setBtnLoading($trialRun, false);
      buildTrialResult();
    }, 700);
  }

  function buildTrialResult() {
    var sym = curSym(getCurrency());
    /* mock 场景数据 */
    var scenario = { arrivalMode: "整柜", cargoType: "箱货", containerType: "20GP", boxCount: 850, skuCount: 26 };

    var allRows = [];
    var total = 0;

    /* 价目表匹配 */
    state.priceRows.forEach(function (row) {
      var match = state.dimensions.every(function (k) {
        var def = DIM_REGISTRY[k];
        var actual = scenario[k];
        return !actual || row.dimensionValues[k] === actual || row.dimensionValues[k] === "";
      });
      if (match && row.pricing.unitPrice) {
        var amt = Number(row.pricing.unitPrice) * (Number(row.pricing.unitQty) || 1);
        total += amt;
        var cond = state.dimensions.map(function (k) { return DIM_REGISTRY[k].name + "=" + row.dimensionValues[k]; }).join("，");
        allRows.push({ cond: cond || "任何场景", amt: amt });
      }
    });

    /* 附加费匹配 */
    state.surchargeRows.forEach(function (row) {
      if (!row.pricing.unitPrice) return;
      var condText = "附加费";
      if (row.condition.field) {
        var fieldName = SURCH_FIELDS.find(function (f) { return f.key === row.condition.field; });
        condText = (fieldName ? fieldName.name : row.condition.field) + row.condition.operator + row.condition.value;
      }
      var amt = Number(row.pricing.unitPrice) * (Number(row.pricing.unitQty) || 1);
      total += amt;
      allRows.push({ cond: condText, amt: amt });
    });

    $trialStatus.textContent = "";
    $trialStatus.className = "v3-trial-status";
    $trialBoardH.textContent = "试算费用（" + sym + "）";

    /* 汇总信息 */
    $trialSumm.innerHTML =
      '<div class="v3-ts-item"><span class="v3-ts-label strong">到货形式：</span><span class="v3-ts-val">' + esc(scenario.arrivalMode) + '</span></div>' +
      '<div class="v3-ts-item"><span class="v3-ts-label strong">货物类型：</span><span class="v3-ts-val">' + esc(scenario.cargoType) + '</span></div>' +
      '<div class="v3-ts-item"><span class="v3-ts-label strong">柜型：</span><span class="v3-ts-val">' + esc(scenario.containerType) + '</span></div>' +
      '<div class="v3-ts-item"><span class="v3-ts-label strong">箱数：</span><span class="v3-ts-val">' + scenario.boxCount + '</span></div>' +
      '<div class="v3-ts-item"><span class="v3-ts-label strong">SKU数量：</span><span class="v3-ts-val">' + scenario.skuCount + '</span></div>';

    /* 结果列表 */
    if (!allRows.length) {
      $trialScroll.innerHTML = '<div class="v3-trial-empty">未匹配到任何规则</div>';
      $trialTotal.textContent = sym + "0.00";
      return;
    }

    $trialScroll.innerHTML = allRows.map(function (r) {
      return '<div class="v3-trial-row"><span class="v3-trial-text">' + esc(r.cond) + '</span><span class="v3-trial-amt">' + r.amt.toFixed(2) + '</span></div>';
    }).join("");

    $trialTotal.textContent = sym + total.toFixed(2);
  }

  /* ═══════════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════════ */
  var TOAST_ICONS = {
    success: '<svg class="v3-toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm4.6 7.2-5 6.3a1 1 0 0 1-1.5.1l-2.8-2.7 1.4-1.4 2 1.9 4.2-5.2 1.7 1Z"/></svg>',
    error:   '<svg class="v3-toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm1 13.8h-2v-2h2v2Zm0-4h-2V7.8h2v4.5Z"/></svg>',
    info:    '<svg class="v3-toast-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm1 14h-2v-6h2v6Zm0-8h-2V6.8h2v1.7Z"/></svg>'
  };

  function toast(type, title, text) {
    var el = document.createElement("div");
    el.className = "v3-toast " + type;
    el.innerHTML = TOAST_ICONS[type] + '<div><div class="v3-toast-title">' + esc(title) + '</div><div class="v3-toast-text">' + esc(text) + '</div></div>';
    $toastStack.appendChild(el);
    setTimeout(function () { el.style.opacity = "0"; el.style.transform = "translateY(-6px)"; el.style.transition = "all 0.25s"; }, 2600);
    setTimeout(function () { el.remove(); }, 3000);
  }

  /* ═══════════════════════════════════════════════
     入库类型选择器
     ═══════════════════════════════════════════════ */
  var $inbSelect  = document.getElementById("inboundTypeSelect");
  var $inbTrigger = document.getElementById("inboundTypeTrigger");
  var $inbMenu    = document.getElementById("inboundTypeMenu");
  var $inbLabel   = document.getElementById("inboundTypeLabel");

  function openInbMenu() { $inbSelect.classList.add("open"); $inbTrigger.classList.add("focused"); }
  function closeInbMenu() { $inbSelect.classList.remove("open"); $inbTrigger.classList.remove("focused"); }
  function setInbType(v) {
    state.inboundType = v;
    $inbLabel.textContent = v;
    var g = document.querySelector('.v3-field[data-field="inboundType"]');
    if (g) { g.classList.remove("v3-field-error"); var t = g.querySelector(".v3-field-tip"); if (t) t.textContent = ""; }
    closeInbMenu();
  }

  $inbTrigger.addEventListener("click", function () { $inbSelect.classList.contains("open") ? closeInbMenu() : openInbMenu(); });
  $inbMenu.addEventListener("click", function (e) { var opt = e.target.closest(".v3-tag-opt"); if (opt) setInbType(opt.dataset.value); });

  /* ═══════════════════════════════════════════════
     事件绑定
     ═══════════════════════════════════════════════ */

  /* 维度标签操作 */
  $dimTags.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-dim-remove]");
    if (btn) removeDimension(btn.dataset.dimRemove);
  });

  /* 维度拖拽排序 */
  var dragDim = null;
  $dimTags.addEventListener("dragstart", function (e) {
    var tag = e.target.closest("[data-dim-key]");
    if (!tag) return;
    dragDim = tag.dataset.dimKey;
    tag.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dragDim);
  });
  $dimTags.addEventListener("dragend", function () {
    document.querySelectorAll(".v3-dim-tag.dragging").forEach(function (t) { t.classList.remove("dragging"); });
    dragDim = null;
  });
  $dimTags.addEventListener("dragover", function (e) {
    var target = e.target.closest("[data-dim-key]");
    if (!target || target.dataset.dimKey === dragDim) return;
    e.preventDefault();
    var tags = Array.from($dimTags.querySelectorAll("[data-dim-key]"));
    var fromIdx = state.dimensions.indexOf(dragDim);
    var toIdx = tags.indexOf(target);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
    state.dimensions.splice(fromIdx, 1);
    state.dimensions.splice(toIdx, 0, dragDim);
    renderDimTags();
    renderTable();
  });

  /* 维度下拉 */
  $dimAddBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    renderDimDropdown();
    $dimDropdown.classList.toggle("open");
  });
  $dimDropdown.addEventListener("click", function (e) {
    var item = e.target.closest("[data-dim-add]");
    if (item) addDimension(item.dataset.dimAdd);
  });

  /* 表格事件代理 */
  document.getElementById("priceListPanel").addEventListener("click", function (e) {
    var btn;
    btn = e.target.closest("[data-insert-after]");
    if (btn) { insertPriceRow(Number(btn.dataset.insertAfter)); return; }
    btn = e.target.closest("[data-del-row]");
    if (btn) { deletePriceRow(Number(btn.dataset.delRow)); return; }
    btn = e.target.closest("[data-del-surch]");
    if (btn) { deleteSurchargeRow(Number(btn.dataset.delSurch)); return; }
    btn = e.target.closest("#addSurchBtn");
    if (btn) { addSurchargeRow(); return; }
  });

  document.getElementById("priceListPanel").addEventListener("input", function (e) {
    if (e.target.getAttribute("data-price")) handlePriceChange(e.target);
    if (e.target.getAttribute("data-cond-val") || e.target.getAttribute("data-cond-start") || e.target.getAttribute("data-cond-end")) handleCondChange(e.target);
    if (e.target.getAttribute("data-num-val") || e.target.getAttribute("data-num-start") || e.target.getAttribute("data-num-end")) handleNumericChange(e.target);
  });

  document.getElementById("priceListPanel").addEventListener("change", function (e) {
    if (e.target.getAttribute("data-price")) handlePriceChange(e.target);
    if (e.target.getAttribute("data-cond-field") || e.target.getAttribute("data-cond-op") || e.target.getAttribute("data-cond-start") || e.target.getAttribute("data-cond-end")) handleCondChange(e.target);
    if (e.target.getAttribute("data-num-op") || e.target.getAttribute("data-num-start") || e.target.getAttribute("data-num-end")) handleNumericChange(e.target);
    if (e.target.getAttribute("data-dim-select")) handleDimSelect(e.target);
  });

  /* 基本信息表单清错 */
  document.getElementById("feeForm").addEventListener("input", function (e) {
    var g = e.target.closest(".v3-field");
    if (g) { g.classList.remove("v3-field-error"); var t = g.querySelector(".v3-field-tip"); if (t) t.textContent = ""; }
  });

  /* 保存、试算 */
  $saveBtn.addEventListener("click", save);
  $simBtn.addEventListener("click", openTrial);

  /* 试算弹窗 */
  $trialClose.addEventListener("click", closeTrial);
  $trialMask.addEventListener("click", function (e) { if (e.target === $trialMask) closeTrial(); });
  $trialRun.addEventListener("click", runTrial);
  $trialInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); runTrial(); } });
  $trialInput.addEventListener("input", function () {
    $trialInput.classList.remove("error");
    if ($trialStatus.classList.contains("error")) { $trialStatus.textContent = ""; $trialStatus.className = "v3-trial-status"; }
  });

  /* 全局点击关闭下拉 */
  document.addEventListener("click", function (e) {
    if (!$dimAddBtn.contains(e.target) && !$dimDropdown.contains(e.target)) closeDimDropdown();
    if ($inbSelect && !$inbSelect.contains(e.target)) closeInbMenu();
  });

  /* ESC 关闭 */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeDimDropdown();
      closeInbMenu();
      if (state.trialOpen) closeTrial();
    }
  });

  /* 编辑模式 */
  var params = new URLSearchParams(window.location.search);
  if (params.get("mode") === "edit") {
    document.title = "编辑操作费";
    var ptl = document.getElementById("pageTitleLabel");
    if (ptl) ptl.textContent = "编辑操作费";
  }

  /* ═══════════════════════════════════════════════
     初始化
     ═══════════════════════════════════════════════ */
  generatePriceRows();
  initSurchargeRows();
  renderDimTags();
  renderDimDropdown();
  renderTable();

})();
