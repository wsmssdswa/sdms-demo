(()=>{
  const keywordInput=document.getElementById('keywordInput');
  const categorySelect=document.getElementById('categorySelect');
  const settlementSelect=document.getElementById('settlementSelect');
  const sheetTypeSelect=document.getElementById('sheetTypeSelect');
  const queryBtn=document.getElementById('queryBtn');
  const resetBtn=document.getElementById('resetBtn');
  const statusTabs=document.getElementById('statusTabs');
  const sheetBody=document.getElementById('sheetBody');
  const sheetCount=document.getElementById('sheetCount');
  const checkAll=document.getElementById('checkAll');
  const generateBillBtn=document.getElementById('generateBillBtn');
  const batchRebillBtn=document.getElementById('batchRebillBtn');
  const selectedHint=document.getElementById('selectedHint');
  const detailModal=document.getElementById('detailModal');
  const detailTitle=document.getElementById('detailTitle');
  const detailInfo=document.getElementById('detailInfo');
  const receivableItemsBody=document.getElementById('receivableItemsBody');
  const payableItemsBody=document.getElementById('payableItemsBody');
  let receivableSum=document.getElementById('receivableSum');
  let payableSum=document.getElementById('payableSum');
  const detailSummary=document.getElementById('detailSummary');
  const detailCloseBtn=document.getElementById('detailCloseBtn');
  const detailFooter=document.getElementById('detailFooter');

  const BILLING_NODE_MAP={inbound_complete:'入库完成',outbound_complete:'出库完成',ship_confirm:'发货确认',vas_complete:'增值服务完成',storage_cycle:'仓储结算'};
  const CATEGORY_MAP={logistics:'物流费',storage:'仓储费',operation:'操作费'};
  const SETTLEMENT_MAP={realtime:'余额扣款',bill:'账期结算'};
  const SHEET_TYPE_MAP={order:'订单费用',stock_inbound:'备货入库费用',return_inbound:'退货入库费用',storage_cycle:'仓储费用'};
  const STATUS_MAP={
    unbilled:{label:'未出账',cls:'pending'},
    billed:{label:'已出账',cls:'active'},
    cancelled:{label:'已取消',cls:'inactive'}
  };
  const STATUS_TABS=[{key:'',label:'全部'},{key:'unbilled',label:'未出账'},{key:'billed',label:'已出账'},{key:'cancelled',label:'已取消'}];
  const CURRENCY_MAP={CNY:{symbol:'¥',label:'人民币'},EUR:{symbol:'€',label:'欧元'},USD:{symbol:'$',label:'美元'},GBP:{symbol:'£',label:'英镑'}};
  function fmtAmt(n){return n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
  function fmtRate(n){return n.toFixed(4);}
  function currencySym(c){return CURRENCY_MAP[c]?CURRENCY_MAP[c].symbol:c;}

  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  function buildSeedData(){
    return [
      {id:1,feeNo:'FS-20260510-001',sheetType:'order',sourceNo:'TRK-2026-001',customerName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',status:'billed',billNo:'BL-20260514-001',createdAt:'2025-05-10 14:30',salesperson:'Kevin.王磊',quotationScheme:'QS-2026-ABC-001',quotationSchemeName:'ABC贸易波兰仓标准操作费方案',items:[
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'卸货费',currency:'EUR',originalAmount:40,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:40,cnyExchangeRate:7.85,amount:314,billingTime:'05-10 14:35',ruleDesc:['如果 到货形式 = 整柜、货物类型 包含 箱货，且 柜型 = 20GP，则按 <b>€10/柜</b> 计费','如果 到货形式 = 整柜、货物类型 包含 箱货，且 箱数 > 700，则按 <b>€0.3/箱</b> 计费，减免前700箱'],calcFormula:['€10 × 1柜 = €10','(800-700)箱 × €0.3 = €30']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'清点费',currency:'EUR',originalAmount:5,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:5,cnyExchangeRate:7.85,amount:39.25,billingTime:'05-10 14:36',ruleDesc:['如果 到货形式 = 散货，且 货物类型 包含 箱货，则按 <b>€5/箱</b> 计费'],calcFormula:['€5 × 1箱 = €5']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'上架费',currency:'EUR',originalAmount:50,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:50,cnyExchangeRate:7.85,amount:392.5,billingTime:'05-10 14:38',ruleDesc:['如果 到货形式 = 整柜、货物类型 包含 箱货，则按 <b>€1/箱</b> 计费','如果 SKU数量 > 20，超出部分按 <b>€2/SKU</b> 计费，减免前20个'],calcFormula:['€1 × 10箱 = €10','(40-20)SKU × €2 = €40']}
      ]},
      {id:2,feeNo:'FS-20260511-001',sheetType:'order',sourceNo:'TRK-2026-001',customerName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',status:'unbilled',billNo:'',createdAt:'2025-05-11 09:00',salesperson:'Kevin.王磊',quotationScheme:'QS-2026-ABC-001',quotationSchemeName:'ABC贸易波兰仓标准操作费方案',items:[
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'拣货费',currency:'EUR',originalAmount:25,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:25,cnyExchangeRate:7.85,amount:196.25,billingTime:'05-11 09:15',ruleDesc:['如果 出库类型 = 标准出库，且 SKU数量 ≤ 10，则按 <b>€12.5/SKU</b> 计费'],calcFormula:['€12.5 × 2SKU = €25']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'打包费',currency:'EUR',originalAmount:20,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:20,cnyExchangeRate:7.85,amount:157,billingTime:'05-11 09:18',ruleDesc:['如果 出库类型 = 标准出库，则基础费 <b>€5</b> + 按 <b>€7.5/箱</b> 计费'],calcFormula:['€5 + €7.5 × 2箱 = €20']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'vas_complete',feeCategory:'operation',feeItemName:'贴标费',currency:'EUR',originalAmount:15,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:15,cnyExchangeRate:7.85,amount:117.75,billingTime:'05-11 09:22',ruleDesc:['如果 增值服务 = 贴标，则按 <b>€7.5/SKU</b> 计费'],calcFormula:['€7.5 × 2SKU = €15']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线物流费',currency:'EUR',originalAmount:100,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:100,cnyExchangeRate:7.85,amount:785,billingTime:'05-11 09:30',ruleDesc:['按线路报价：华东仓 → 波兰海外仓，按 <b>€50/柜</b> 计费，共 <b>2柜</b>'],calcFormula:['€50 × 2柜 = €100']},
        {direction:'payable',subjectName:'DHL物流',billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线运输费',currency:'USD',originalAmount:70,baseCurrency:'EUR',baseExchangeRate:0.92,baseAmount:64.4,cnyExchangeRate:7.85,amount:505.54,billingTime:'05-11 09:35',ruleDesc:['供应商报价，按 <b>$35/柜</b> 计费，共 <b>2柜</b>'],calcFormula:['$35 × 2柜 = $70 → ¥505.54']}
      ]},
      {id:3,feeNo:'FS-20260512-001',sheetType:'order',sourceNo:'TRK-2026-002',customerName:'杭州XYZ物流',warehouseName:'德国海外仓',settlementMode:'bill',status:'billed',billNo:'BL-20260514-001',createdAt:'2025-05-12 10:15',salesperson:'Amy.李婷',quotationScheme:'QS-2026-XYZ-002',quotationSchemeName:'XYZ物流德国仓综合费方案',items:[
        {direction:'receivable',subjectName:'杭州XYZ物流',billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'出库操作费',currency:'EUR',originalAmount:25,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:25,cnyExchangeRate:7.85,amount:196.25,billingTime:'05-12 10:20',ruleDesc:['如果 出库类型 = 标准出库，则基础费 <b>€10</b> + 按 <b>€7.5/次</b> 计费'],calcFormula:['€10 + €7.5 × 2次 = €25']},
        {direction:'receivable',subjectName:'杭州XYZ物流',billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线物流费',currency:'EUR',originalAmount:105,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:105,cnyExchangeRate:7.85,amount:824.25,billingTime:'05-12 10:25',ruleDesc:['按线路报价：华东仓 → 德国海外仓，按 <b>€105/柜</b> 计费，共 <b>1柜</b>'],calcFormula:['€105 × 1柜 = €105']},
        {direction:'payable',subjectName:'DHL物流',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'入库操作费',currency:'EUR',originalAmount:28,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:28,cnyExchangeRate:7.85,amount:219.8,billingTime:'05-12 10:28',ruleDesc:['供应商报价，按 <b>€14/次</b> 计费，共 <b>2次</b>'],calcFormula:['€14 × 2次 = €28']}
      ]},
      {id:4,feeNo:'FS-20260513-001',sheetType:'storage_cycle',sourceNo:'',customerName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',status:'unbilled',billNo:'',createdAt:'2025-05-13 16:45',salesperson:'Kevin.王磊',quotationScheme:'QS-2026-ABC-STO',quotationSchemeName:'ABC贸易波兰仓仓储费方案',items:[
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'storage_cycle',feeCategory:'storage',feeItemName:'基础仓储费',currency:'EUR',originalAmount:50,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:50,cnyExchangeRate:7.85,amount:392.5,billingTime:'05-13 16:50',ruleDesc:['按SKU·天计费，费率 <b>€2.5/SKU·天</b>，计费 <b>20 SKU·天</b>（10SKU × 2天）'],calcFormula:['€2.5 × 20 SKU·天 = €50']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'storage_cycle',feeCategory:'storage',feeItemName:'旺季附加费',currency:'EUR',originalAmount:20,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:20,cnyExchangeRate:7.85,amount:157,billingTime:'05-13 16:52',ruleDesc:['按基础仓储费比例收取，附加系数 <b>40%</b>，基础仓储费€50'],calcFormula:['€50 × 40% = €20']}
      ]},
      {id:5,feeNo:'FS-20260513-002',sheetType:'order',sourceNo:'TRK-2026-003',customerName:'上海DEF电商',warehouseName:'波兰海外仓',settlementMode:'bill',status:'unbilled',billNo:'',createdAt:'2025-05-13 11:30',salesperson:'Jack.陈明',quotationScheme:'QS-2026-DEF-003',quotationSchemeName:'DEF电商波兰仓操作费方案',items:[
        {direction:'receivable',subjectName:'上海DEF电商',billingNode:'vas_complete',feeCategory:'operation',feeItemName:'质检服务费',currency:'EUR',originalAmount:30,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:30,cnyExchangeRate:7.85,amount:235.5,billingTime:'05-13 11:35',ruleDesc:['如果 增值服务 = 质检，则按 <b>€10/次</b> 计费'],calcFormula:['€10 × 3次 = €30']},
        {direction:'payable',subjectName:'欧洲操作中心',billingNode:'vas_complete',feeCategory:'operation',feeItemName:'质检服务费',currency:'USD',originalAmount:20,baseCurrency:'EUR',baseExchangeRate:0.92,baseAmount:18.4,cnyExchangeRate:7.85,amount:144.44,billingTime:'05-13 11:36',ruleDesc:['供应商报价，按 <b>$6.67/次</b> 计费，共 <b>3次</b>'],calcFormula:['$6.67 × 3次 = $20 → ¥144.44']}
      ]},
      {id:6,feeNo:'FS-20260514-001',sheetType:'storage_cycle',sourceNo:'',customerName:'杭州XYZ物流',warehouseName:'德国海外仓',settlementMode:'bill',status:'cancelled',billNo:'',createdAt:'2025-05-14 08:00',salesperson:'Amy.李婷',quotationScheme:'QS-2026-XYZ-STO',quotationSchemeName:'XYZ物流德国仓仓储费方案',items:[
        {direction:'receivable',subjectName:'杭州XYZ物流',billingNode:'storage_cycle',feeCategory:'storage',feeItemName:'基础仓储费',currency:'EUR',originalAmount:55,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:55,cnyExchangeRate:7.85,amount:431.75,billingTime:'05-14 08:10',ruleDesc:['按SKU·天计费，费率 <b>€1.83/SKU·天</b>，计费 <b>30 SKU·天</b>（15SKU × 2天）'],calcFormula:['€1.83 × 30 SKU·天 = €54.90']}
      ]},
      {id:7,feeNo:'FS-20260514-002',sheetType:'stock_inbound',sourceNo:'STK-IN-20260514-001',customerName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',status:'unbilled',billNo:'',createdAt:'2025-05-14 10:15',salesperson:'Kevin.王磊',quotationScheme:'QS-2026-ABC-001',quotationSchemeName:'ABC贸易波兰仓标准操作费方案',items:[
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'卸货费',currency:'EUR',originalAmount:30,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:30,cnyExchangeRate:7.85,amount:235.5,billingTime:'05-14 10:20',ruleDesc:['如果 到货形式 = 整柜、货物类型 包含 箱货，且 柜型 = 20GP，则按 <b>€30/柜</b> 计费'],calcFormula:['€30 × 1柜 = €30']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'清点费',currency:'EUR',originalAmount:15,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:15,cnyExchangeRate:7.85,amount:117.75,billingTime:'05-14 10:22',ruleDesc:['如果 到货形式 = 散货，且 货物类型 包含 箱货，则按 <b>€0.3/箱</b> 计费'],calcFormula:['€0.3 × 50箱 = €15']},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'上架费',currency:'EUR',originalAmount:20,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:20,cnyExchangeRate:7.85,amount:157,billingTime:'05-14 10:35',ruleDesc:['如果 到货形式 = 散货、货物类型 包含 箱货，则按 <b>€0.4/箱</b> 计费'],calcFormula:['€0.4 × 50箱 = €20']}
      ]},
      {id:8,feeNo:'FS-20260515-001',sheetType:'return_inbound',sourceNo:'Y202605150001E',customerName:'杭州XYZ物流',warehouseName:'波兰海外仓',settlementMode:'bill',status:'unbilled',billNo:'',createdAt:'2025-05-15 09:30',salesperson:'Amy.李婷',quotationScheme:'QS-2026-XYZ-002',quotationSchemeName:'XYZ物流波兰仓标准方案',items:[
        {direction:'receivable',subjectName:'杭州XYZ物流',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'入库操作费',currency:'EUR',originalAmount:25,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:25,cnyExchangeRate:7.85,amount:196.25,billingTime:'05-15 09:35',ruleDesc:['如果 退货入库，货物类型 包含 箱货，则按 <b>€25/批</b> 计费'],calcFormula:['€25 × 1批 = €25']},
        {direction:'receivable',subjectName:'杭州XYZ物流',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'检验费',currency:'EUR',originalAmount:10,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:10,cnyExchangeRate:7.85,amount:78.5,billingTime:'05-15 09:40',ruleDesc:['如果 退货入库且需要质检，则按 <b>€10/批</b> 计费'],calcFormula:['€10 × 1批 = €10']}
      ]}
    ];
  }

  let rows=buildSeedData();
  let nextBillNo=2;
  let detailTargetId=null;
  const state={keyword:'',category:'',settlement:'',sheetType:'',statusTab:'',selectedIds:new Set()};
  const editState={receivable:false,payable:false};

  function calcReceivable(item){return item.items.filter(i=>i.direction==='receivable').reduce((s,i)=>s+i.amount,0);}
  function calcPayable(item){return item.items.filter(i=>i.direction==='payable').reduce((s,i)=>s+i.amount,0);}

  function getFilteredRows(){
    return rows.filter(item=>{
      if(state.keyword){
        const kw=state.keyword.toLowerCase();
        if(!item.feeNo.toLowerCase().includes(kw)&&!item.sourceNo.toLowerCase().includes(kw)&&!item.customerName.toLowerCase().includes(kw))return false;
      }
      if(state.category&&item.items.every(i=>i.feeCategory!==state.category))return false;
      if(state.settlement&&item.settlementMode!==state.settlement)return false;
      if(state.sheetType&&item.sheetType!==state.sheetType)return false;
      if(state.statusTab&&item.status!==state.statusTab)return false;
      return true;
    });
  }

  function showToast(type,title,desc){
    const el=document.createElement('div');
    el.className='toast '+type;
    el.innerHTML='<div class="toast-title">'+escapeHtml(title)+'</div>'+(desc?'<div class="toast-desc">'+escapeHtml(desc)+'</div>':'');
    document.getElementById('toastStack').appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),240);},2200);
  }

  function renderStatusTabs(){
    statusTabs.innerHTML=STATUS_TABS.map(tab=>{
      const count=tab.key===''?rows.length:rows.filter(r=>r.status===tab.key).length;
      return '<button type="button" class="scene-tab'+(state.statusTab===tab.key?' active':'')+'" data-tab="'+tab.key+'">'+tab.label+'('+count+')</button>';
    }).join('');
  }

  function updateSelectedHint(){
    selectedHint.textContent=state.selectedIds.size?'已选 '+state.selectedIds.size+' 条':'';
    const unbilledInFilter=getFilteredRows().filter(r=>r.status==='unbilled'&&r.settlementMode==='bill');
    checkAll.checked=unbilledInFilter.length>0&&unbilledInFilter.every(r=>state.selectedIds.has(r.id));
  }

  function render(){
    const filtered=getFilteredRows();
    if(!filtered.length){
      sheetBody.innerHTML='<tr class="empty-row"><td colspan="16" style="text-align:center;padding:40px;color:var(--text-muted)">暂无费用单</td></tr>';
      sheetCount.textContent='';
    }else{
      sheetBody.innerHTML=filtered.map((item,idx)=>{
        const st=STATUS_MAP[item.status]||{label:item.status,cls:'draft'};
        const recvAmt=calcReceivable(item);
        const payAmt=calcPayable(item);
        const net=recvAmt-payAmt;
        const netCls=net>=0?'net-positive':'net-negative';
        const typeLabel=SHEET_TYPE_MAP[item.sheetType]||item.sheetType;
        const sourceDisplay=item.sourceNo?'<span class="name-link">'+escapeHtml(item.sourceNo)+'</span>':'—';
        const billDisplay=item.billNo?'<a class="name-link" href="javascript:void(0)" data-action="viewBill" data-bill-no="'+escapeHtml(item.billNo)+'">'+escapeHtml(item.billNo)+'</a>':'—';
        const canCheck=item.status==='unbilled'&&item.settlementMode==='bill';
        const checked=state.selectedIds.has(item.id)?'checked':'';
        const disabled=canCheck?'':'disabled';
        const cancelLink=canCheck?'<a href="javascript:void(0)" class="action-link" data-action="cancel" data-id="'+item.id+'" style="color:var(--danger)">取消</a>':'';
        return '<tr>'
          +'<td class="check-cell"><input type="checkbox" data-check-id="'+item.id+'" '+checked+' '+disabled+'></td>'
          +'<td class="check-cell">'+(idx+1)+'</td>'
          +'<td><a class="name-link" href="javascript:void(0)" data-action="view" data-id="'+item.id+'">'+escapeHtml(item.feeNo)+'</a>'+(item.manuallyAdjusted?' <span class="adj-tag">已调整</span>':'')+'</td>'
          +'<td>'+escapeHtml(typeLabel)+'</td>'
          +'<td>'+sourceDisplay+'</td>'
          +'<td>'+(SETTLEMENT_MAP[item.settlementMode]||'—')+'</td>'
          +'<td>'+escapeHtml(item.customerName)+'</td>'
          +'<td>'+escapeHtml(item.warehouseName)+'</td>'
          +'<td>'+escapeHtml(item.salesperson||'—')+'</td>'
          +'<td class="net-positive">¥'+fmtAmt(recvAmt)+'</td>'
          +'<td class="net-negative">¥'+fmtAmt(payAmt)+'</td>'
          +'<td class="'+netCls+'">¥'+fmtAmt(net)+'</td>'
          +'<td>'+billDisplay+'</td>'
          +'<td style="color:var(--text-muted);font-size:12px">'+escapeHtml(item.createdAt||'—')+'</td>'
          +'<td><span class="status-tag '+st.cls+'">'+st.label+'</span></td>'
          +'<td><div class="action-group"><a href="javascript:void(0)" class="action-link" data-action="view" data-id="'+item.id+'">查看</a>'+cancelLink+'</div></td>'
        +'</tr>';
      }).join('');
      sheetCount.textContent='共 '+filtered.length+' 条';
    }
    renderStatusTabs();
    updateSelectedHint();
  }

  const DETAIL_COLSPAN=11;

  function renderCalcDetailRow(it){
    const descs=Array.isArray(it.ruleDesc)?it.ruleDesc:(it.ruleDesc?[it.ruleDesc]:[]);
    const formulas=Array.isArray(it.calcFormula)?it.calcFormula:(it.calcFormula?[it.calcFormula]:[]);
    if(!descs.length)return '';
    const lines=descs.map((desc,i)=>'<div class="calc-detail-grid"><div class="calc-rule-col">'+desc+'</div><div class="calc-formula-col">'+escapeHtml(formulas[i]||'')+'</div></div>').join('');
    return '<tr class="calc-detail-row" style="display:none"><td colspan="'+DETAIL_COLSPAN+'"><div class="calc-detail-panel">'+lines+'</div></td></tr>';
  }

  function renderFeeItemRows(items,direction,editing){
    if(!items.length&&!editing) return '<tr><td colspan="'+DETAIL_COLSPAN+'" style="text-align:center;padding:24px;color:var(--text-muted)">暂无费用项</td></tr>';
    var canEditGlobal=rows.find(r=>r.id===detailTargetId);
    canEditGlobal=canEditGlobal&&canEditGlobal.status==='unbilled';
    var html='';
    items.forEach(function(it,idx){
      var sym=currencySym(it.currency||'CNY');
      var baseSym=currencySym(it.baseCurrency||'CNY');
      if(editing&&it.isDeleted){
        html+='<tr class="fee-item-row pending-delete" data-idx="'+idx+'" data-direction="'+direction+'">'
          +'<td class="cell-center">'+(idx+1)+'</td>'
          +'<td class="fee-name-cell">'+escapeHtml(it.feeItemName)+'</td>'
          +'<td class="cell-center"><span class="currency-tag">'+escapeHtml(it.currency||'CNY')+'</span></td>'
          +'<td class="amount-cell amount-orig">'+sym+fmtAmt(it.originalAmount)+'</td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.baseExchangeRate||1)+'</td>'
          +'<td class="amount-cell amount-base">'+baseSym+fmtAmt(it.baseAmount||it.originalAmount)+'</td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.cnyExchangeRate||1)+'</td>'
          +'<td class="amount-cell">¥'+fmtAmt(it.amount)+'</td>'
          +'<td class="time-cell">'+escapeHtml(it.billingTime||'—')+'</td>'
          +'<td class="remark-cell">'+escapeHtml(it.remark||'')+'</td>'
          +'<td class="edit-action-cell"><button type="button" class="edit-icon-btn delete-btn" data-action="toggleDelete" data-idx="'+idx+'" data-direction="'+direction+'" title="恢复"><i class="ri-delete-bin-line"></i></button></td>'
        +'</tr>';
        return;
      }
      if(editing&&it.isNew){
        html+='<tr class="fee-item-row new-row" data-idx="'+idx+'" data-direction="'+direction+'">'
          +'<td class="cell-center">'+(idx+1)+'</td>'
          +'<td class="fee-name-cell"><input class="new-row-input name-input" type="text" placeholder="费用项名称" data-field="feeItemName" data-idx="'+idx+'" data-direction="'+direction+'" value="'+escapeHtml(it.feeItemName||'')+'"></td>'
          +'<td class="cell-center"><select class="new-row-select" data-field="currency" data-idx="'+idx+'" data-direction="'+direction+'">'
            +'<option value="EUR"'+(it.currency==='EUR'?' selected':'')+'>EUR</option>'
            +'<option value="USD"'+(it.currency==='USD'?' selected':'')+'>USD</option>'
            +'<option value="CNY"'+(it.currency==='CNY'?' selected':'')+'>CNY</option>'
            +'<option value="GBP"'+(it.currency==='GBP'?' selected':'')+'>GBP</option>'
          +'</select></td>'
          +'<td class="amount-cell amount-orig"><input class="amount-input" type="number" step="0.01" data-field="originalAmount" data-idx="'+idx+'" data-direction="'+direction+'" value="'+(it.originalAmount||0)+'"></td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.baseExchangeRate||1)+'</td>'
          +'<td class="amount-cell amount-base">'+baseSym+fmtAmt(it.baseAmount||0)+'</td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.cnyExchangeRate||7.85)+'</td>'
          +'<td class="amount-cell">¥'+fmtAmt(it.amount||0)+'</td>'
          +'<td class="time-cell">'+escapeHtml(it.billingTime||'—')+'</td>'
          +'<td class="remark-cell"><input class="new-row-input remark-col-input" type="text" placeholder="备注" data-field="remark" data-idx="'+idx+'" data-direction="'+direction+'" value="'+escapeHtml(it.remark||'')+'"></td>'
          +'<td class="edit-action-cell"><button type="button" class="edit-icon-btn delete-btn" data-action="removeNew" data-idx="'+idx+'" data-direction="'+direction+'" title="删除"><i class="ri-delete-bin-line"></i></button></td>'
        +'</tr>';
        return;
      }
      if(editing){
        html+='<tr class="fee-item-row'+(it._modified?' cell-modified':'')+'" data-idx="'+idx+'" data-direction="'+direction+'">'
          +'<td class="cell-center">'+(idx+1)+'</td>'
          +'<td class="fee-name-cell">'+escapeHtml(it.feeItemName)+'</td>'
          +'<td class="cell-center"><span class="currency-tag">'+escapeHtml(it.currency||'CNY')+'</span></td>'
          +'<td class="amount-cell amount-orig"><input class="amount-input" type="number" step="0.01" data-field="originalAmount" data-idx="'+idx+'" data-direction="'+direction+'" value="'+(it.originalAmount||0)+'"></td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.baseExchangeRate||1)+'</td>'
          +'<td class="amount-cell amount-base">'+baseSym+fmtAmt(it.baseAmount||it.originalAmount)+'</td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.cnyExchangeRate||1)+'</td>'
          +'<td class="amount-cell">¥'+fmtAmt(it.amount)+'</td>'
          +'<td class="time-cell">'+escapeHtml(it.billingTime||'—')+'</td>'
          +'<td class="remark-cell"><input class="new-row-input remark-col-input" type="text" placeholder="备注" data-field="remark" data-idx="'+idx+'" data-direction="'+direction+'" value="'+escapeHtml(it.remark||'')+'"></td>'
          +'<td class="edit-action-cell"><button type="button" class="edit-icon-btn delete-btn" data-action="toggleDelete" data-idx="'+idx+'" data-direction="'+direction+'" title="删除"><i class="ri-delete-bin-line"></i></button></td>'
        +'</tr>';
      }else{
        var adjTag='';
        if(it.adjustedType==='modified') adjTag=' <span class="adj-tag-sm adj-modified">已调整</span>';
        else if(it.adjustedType==='added') adjTag=' <span class="adj-tag-sm adj-added">新增</span>';
        html+='<tr class="fee-item-row" data-idx="'+idx+'">'
          +'<td class="cell-center">'+(idx+1)+'</td>'
          +'<td class="fee-name-cell">'+escapeHtml(it.feeItemName)+adjTag+'</td>'
          +'<td class="cell-center"><span class="currency-tag">'+escapeHtml(it.currency||'CNY')+'</span></td>'
          +'<td class="amount-cell amount-orig'+(canEditGlobal?' clickable-amount':'')+'"'+(canEditGlobal?' data-click-edit="amount" data-idx="'+idx+'" data-direction="'+direction+'"':'')+'>'+sym+fmtAmt(it.originalAmount)+'</td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.baseExchangeRate||1)+'</td>'
          +'<td class="amount-cell amount-base">'+baseSym+fmtAmt(it.baseAmount||it.originalAmount)+'</td>'
          +'<td class="amount-cell rate-cell">'+fmtRate(it.cnyExchangeRate||1)+'</td>'
          +'<td class="amount-cell">¥'+fmtAmt(it.amount)+'</td>'
          +'<td class="time-cell">'+escapeHtml(it.billingTime||'—')+'</td>'
          +'<td class="remark-cell">'+(it.remark?'<span class="remark-text">'+escapeHtml(it.remark)+'</span>':'')+'</td>'
          +'<td class="edit-action-cell">'+(canEditGlobal?'<button type="button" class="edit-icon-btn delete-btn" data-action="toggleDelete" data-idx="'+idx+'" data-direction="'+direction+'" title="删除"><i class="ri-delete-bin-line"></i></button>':'')+'</td>'
        +'</tr>';
        html+=renderCalcDetailRow(it);
      }
    });
    if(editing){
      html+='<tr class="add-fee-row" data-action="addFeeItem" data-direction="'+direction+'"><td colspan="'+DETAIL_COLSPAN+'"><i class="ri-add-line"></i> 添加费用项</td></tr>';
    }
    return html;
  }

  function openDetail(id,autoEdit){
    const item=rows.find(r=>r.id===id);
    if(!item)return;
    detailTargetId=id;
    const st=STATUS_MAP[item.status]||{label:item.status,cls:'draft'};
    detailTitle.textContent=escapeHtml(item.feeNo)+' 详情';

    const recvItems=item.items.filter(i=>i.direction==='receivable');
    const payItems=item.items.filter(i=>i.direction==='payable');
    const recvTotal=recvItems.reduce((s,i)=>s+i.amount,0);
    const payTotal=payItems.reduce((s,i)=>s+i.amount,0);

    const currencies=[...new Set(item.items.map(i=>i.currency||'CNY'))].map(c=>CURRENCY_MAP[c]?CURRENCY_MAP[c].label:c).join('、');
    detailInfo.innerHTML=[
      '<div class="info-label">费用单号</div><div class="info-value">'+escapeHtml(item.feeNo)+' <span class="status-tag '+st.cls+'">'+st.label+'</span></div>',
      '<div class="info-label">单据类型</div><div class="info-value">'+(SHEET_TYPE_MAP[item.sheetType]||item.sheetType)+'</div>',
      '<div class="info-label">关联单号</div><div class="info-value">'+(item.sourceNo?escapeHtml(item.sourceNo):'—')+'</div>',
      '<div class="info-label">结算模式</div><div class="info-value">'+SETTLEMENT_MAP[item.settlementMode]+'</div>',
      '<div class="info-label">客户</div><div class="info-value">'+escapeHtml(item.customerName)+'</div>',
      '<div class="info-label">仓库</div><div class="info-value">'+escapeHtml(item.warehouseName)+'</div>',
      '<div class="info-label">业务员</div><div class="info-value">'+escapeHtml(item.salesperson||'—')+'</div>',
      '<div class="info-label">创建时间</div><div class="info-value">'+escapeHtml(item.createdAt||'—')+'</div>',
      '<div class="info-label">关联账单</div><div class="info-value">'+(item.billNo?'<a class="name-link" href="javascript:void(0)">'+escapeHtml(item.billNo)+'</a>':'—')+'</div>',
      '<div class="info-label">涉及币种</div><div class="info-value">'+escapeHtml(currencies)+'</div>',
      '<div class="info-label">报价方案</div><div class="info-value">'+(item.quotationScheme?'<a class="name-link" href="./quotation-scheme-config.html">《'+escapeHtml(item.quotationSchemeName)+'》</a>':'—')+'</div>'
    ].join('');

    const canEdit=item.status==='unbilled';
    editState.receivable=!!autoEdit&&canEdit;
    editState.payable=!!autoEdit&&canEdit;

    renderSectionTitle('receivable',canEdit);
    receivableSum.textContent='小计：¥'+fmtAmt(recvTotal);
    receivableItemsBody.innerHTML=renderFeeItemRows(recvItems,'receivable',editState.receivable);

    renderSectionTitle('payable',canEdit);
    payableSum.textContent='小计：¥'+fmtAmt(payTotal);
    payableItemsBody.innerHTML=renderFeeItemRows(payItems,'payable',editState.payable);

    const net=recvTotal-payTotal;
    detailSummary.innerHTML='<div class="summary-item"><span class="summary-label">应收总额：</span><span class="summary-value net-positive">¥'+fmtAmt(recvTotal)+'</span></div><div class="summary-item"><span class="summary-label">应付总额：</span><span class="summary-value net-negative">¥'+fmtAmt(payTotal)+'</span></div><div class="summary-item"><span class="summary-label">净额：</span><span class="summary-value '+(net>=0?'net-positive':'net-negative')+'">¥'+fmtAmt(net)+'</span></div>';

    renderDetailFooter(canEdit);
    detailModal.classList.add('open');
    detailModal.setAttribute('aria-hidden','false');
  }

  function renderSectionTitle(direction,canEdit){
    var tag=direction==='receivable'?'dir-receivable-tag':'dir-payable-tag';
    var label=direction==='receivable'?'应收费用项':'应付费用项';
    var sumId=direction==='receivable'?'receivableSum':'payableSum';
    var isEditing=editState[direction];
    var sectionEl=direction==='receivable'?receivableItemsBody.closest('.detail-section'):payableItemsBody.closest('.detail-section');
    var titleEl=sectionEl.querySelector('.detail-section-title');
    var actionsHtml='';
    if(canEdit&&!isEditing){
      actionsHtml='<button type="button" class="section-edit-btn" data-section-action="edit" data-direction="'+direction+'">编辑</button>';
    }
    titleEl.innerHTML='<span class="'+tag+'">'+label+'</span> '+actionsHtml+' <span class="detail-section-sum" id="'+sumId+'"></span>';
    var newSumEl=titleEl.querySelector('#'+sumId);
    var section=direction==='receivable'?receivableItemsBody.closest('.detail-section'):payableItemsBody.closest('.detail-section');
    if(direction==='receivable') receivableSum=newSumEl;
    else payableSum=newSumEl;
  }

  function renderDetailFooter(canEdit){
    var html='';
    if(canEdit) html='<button type="button" class="btn-rebill" id="rebillBtn">重新计费</button>';
    html+='<button type="button" class="btn btn-default" id="closeModalBtn">关闭</button>';
    detailFooter.innerHTML=html;
  }

  function closeDetail(){
    detailModal.classList.remove('open');
    detailModal.setAttribute('aria-hidden','true');
    detailTargetId=null;
    editState.receivable=false;
    editState.payable=false;
  }

  function handleAction(action,id){
    const numId=Number(id);
    if(action==='view'){
      openDetail(numId);
    }else if(action==='cancel'){
      if(!confirm('确定要取消此费用单吗？'))return;
      const item=rows.find(r=>r.id===numId);
      if(item){item.status='cancelled';state.selectedIds.delete(numId);render();showToast('success','已取消','费用单已取消');}
    }
  }

  /* 筛选 */
  queryBtn.addEventListener('click',()=>{
    state.keyword=keywordInput.value.trim();
    state.category=categorySelect.value;
    state.settlement=settlementSelect.value;
    state.sheetType=sheetTypeSelect?sheetTypeSelect.value:'';
    render();
  });
  resetBtn.addEventListener('click',()=>{
    state.keyword='';state.category='';state.settlement='';state.sheetType='';state.statusTab='';state.selectedIds.clear();
    keywordInput.value='';categorySelect.value='';settlementSelect.value='';if(sheetTypeSelect)sheetTypeSelect.value='';
    render();
  });
  keywordInput.addEventListener('keydown',e=>{if(e.key==='Enter')queryBtn.click();});

  /* 状态Tab */
  statusTabs.addEventListener('click',e=>{
    const btn=e.target.closest('[data-tab]');
    if(!btn)return;
    state.statusTab=btn.dataset.tab;
    render();
  });

  /* 多选 */
  checkAll.addEventListener('change',()=>{
    const unbilledInFilter=getFilteredRows().filter(r=>r.status==='unbilled'&&r.settlementMode==='bill');
    if(checkAll.checked){
      unbilledInFilter.forEach(r=>state.selectedIds.add(r.id));
    }else{
      unbilledInFilter.forEach(r=>state.selectedIds.delete(r.id));
    }
    render();
  });

  sheetBody.addEventListener('change',e=>{
    const cb=e.target.closest('[data-check-id]');
    if(!cb)return;
    const id=Number(cb.dataset.checkId);
    if(cb.checked){state.selectedIds.add(id);}else{state.selectedIds.delete(id);}
    updateSelectedHint();
    const unbilledInFilter=getFilteredRows().filter(r=>r.status==='unbilled'&&r.settlementMode==='bill');
    checkAll.checked=unbilledInFilter.length>0&&unbilledInFilter.every(r=>state.selectedIds.has(r.id));
  });

  /* 操作 */
  sheetBody.addEventListener('click',e=>{
    const link=e.target.closest('[data-action]');
    if(!link)return;
    const action=link.dataset.action;
    if(action==='viewBill'){
      const billNoToId={'BL-20260514-001':1};
      const billId=billNoToId[link.dataset.billNo]||1;
      window.location.href='./bill-detail.html?id='+billId;
      return;
    }
    handleAction(action,link.dataset.id);
  });

  /* 批量重新计费 */
  batchRebillBtn.addEventListener('click',()=>{
    if(!state.selectedIds.size){showToast('warning','请选择','请勾选需要重新计费的费用单');return;}
    const targets=rows.filter(r=>state.selectedIds.has(r.id)&&r.status==='unbilled');
    if(!targets.length){showToast('warning','无法重新计费','选中的费用单中没有未出账的单据');return;}
    targets.forEach(sheet=>{
      sheet.items.forEach(it=>{
        const factor=0.7+Math.random()*0.6;
        it.originalAmount=Math.round(it.originalAmount*factor*100)/100;
        it.baseAmount=it.originalAmount*(it.baseExchangeRate||1);
        it.amount=Math.round(it.baseAmount*(it.cnyExchangeRate||7.85)*100)/100;
      });
    });
    state.selectedIds.clear();
    render();
    showToast('success','已重新计费','已对'+targets.length+'条费用单重新计费');
  });

  /* 生成账单 */
  generateBillBtn.addEventListener('click',()=>{
    if(!state.selectedIds.size){showToast('warning','请选择','请勾选需要出账的费用单');return;}
    const billNo='BL-20260514-'+String(nextBillNo++).padStart(3,'0');
    const count=state.selectedIds.size;
    rows.filter(r=>state.selectedIds.has(r.id)).forEach(r=>{
      r.status='billed';
      r.billNo=billNo;
    });
    state.selectedIds.clear();
    render();
    showToast('success','生成账单成功','账单号：'+billNo+'，包含'+count+'条费用单');
  });

  /* 详情弹窗 */
  detailCloseBtn.addEventListener('click',closeDetail);
  detailModal.addEventListener('click',e=>{if(e.target===detailModal)closeDetail();});
  detailFooter.addEventListener('click',e=>{
    if(e.target.id==='closeModalBtn')closeDetail();
  });

  /* 编辑模式事件 */
  function refreshDetail(){
    const item=rows.find(r=>r.id===detailTargetId);
    if(!item)return;
    const recvItems=item.items.filter(i=>i.direction==='receivable');
    const payItems=item.items.filter(i=>i.direction==='payable');
    const recvTotal=recvItems.filter(i=>!i.isDeleted).reduce((s,i)=>s+(i.amount||0),0);
    const payTotal=payItems.filter(i=>!i.isDeleted).reduce((s,i)=>s+(i.amount||0),0);
    const canEdit=item.status==='unbilled';
    renderSectionTitle('receivable',canEdit);
    renderSectionTitle('payable',canEdit);
    receivableSum.textContent='小计：¥'+fmtAmt(recvTotal);
    payableSum.textContent='小计：¥'+fmtAmt(payTotal);
    receivableItemsBody.innerHTML=renderFeeItemRows(recvItems,'receivable',editState.receivable);
    payableItemsBody.innerHTML=renderFeeItemRows(payItems,'payable',editState.payable);
    const net=recvTotal-payTotal;
    detailSummary.innerHTML='<div class="summary-item"><span class="summary-label">应收总额：</span><span class="summary-value net-positive">¥'+fmtAmt(recvTotal)+'</span></div><div class="summary-item"><span class="summary-label">应付总额：</span><span class="summary-value net-negative">¥'+fmtAmt(payTotal)+'</span></div><div class="summary-item"><span class="summary-label">净额：</span><span class="summary-value '+(net>=0?'net-positive':'net-negative')+'">¥'+fmtAmt(net)+'</span></div>';
    renderDetailFooter(canEdit);
  }

  function finishEdit(direction){
    var item=rows.find(r=>r.id===detailTargetId);
    if(!item)return;
    item.items.forEach(function(i){
      if(i._modified) i.adjustedType='modified';
      if(i.isNew) i.adjustedType='added';
      delete i._modified; delete i.isNew; delete i.isDeleted;
    });
    item.items=item.items.filter(function(i){return !i.isDeleted;});
    if(item.items.some(function(i){return i.adjustedType;})){
      item.manuallyAdjusted=true;
    }
    editState[direction]=false;
    refreshDetail();
    render();
    showToast('success','修改成功');
  }

  function handleRebill(){
    const item=rows.find(r=>r.id===detailTargetId);
    if(!item)return;
    item.items.forEach(it=>{
      const factor=0.7+Math.random()*0.6;
      it.originalAmount=Math.round(it.originalAmount*factor*100)/100;
      it.baseAmount=it.originalAmount*(it.baseExchangeRate||1);
      it.amount=Math.round(it.baseAmount*(it.cnyExchangeRate||7.85)*100)/100;
      it._modified=true;
      it.adjustedType='modified';
      it.isDeleted=false;
      it.isNew=false;
    });
    item.manuallyAdjusted=true;
    editState.receivable=true;
    editState.payable=true;
    refreshDetail();
    showToast('success','已重新计费','费用项金额已更新');
  }

  function addFeeItem(direction){
    const item=rows.find(r=>r.id===detailTargetId);
    if(!item)return;
    const now=new Date();
    const pad=v=>String(v).padStart(2,'0');
    item.items.push({
      direction:direction,subjectName:item.customerName,
      billingNode:'manual',feeCategory:'operation',feeItemName:'',
      currency:'EUR',originalAmount:0,baseCurrency:'EUR',baseExchangeRate:1,baseAmount:0,
      cnyExchangeRate:7.85,amount:0,
      billingTime:pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+pad(now.getHours())+':'+pad(now.getMinutes()),
      ruleDesc:[],calcFormula:[],remark:'',isDeleted:false,isNew:true
    });
    refreshDetail();
  }

  detailModal.addEventListener('click',e=>{
    const sectionBtn=e.target.closest('[data-section-action]');
    if(sectionBtn){
      const action=sectionBtn.dataset.sectionAction;
      const direction=sectionBtn.dataset.direction;
      if(action==='edit'){ editState[direction]=true; refreshDetail(); }
      return;
    }
    // 点击金额直接进入编辑态
    const clickEdit=e.target.closest('[data-click-edit]');
    if(clickEdit&&clickEdit.dataset.clickEdit==='amount'){
      const direction=clickEdit.dataset.direction;
      editState[direction]=true;
      refreshDetail();
      var inputEl=detailModal.querySelector('.amount-input[data-idx="'+clickEdit.dataset.idx+'"][data-direction="'+direction+'"]');
      if(inputEl)inputEl.focus();
      return;
    }
    const editBtn=e.target.closest('[data-action]');
    if(editBtn&&!editBtn.closest('.add-fee-row')){
      const action=editBtn.dataset.action;
      const idx=Number(editBtn.dataset.idx);
      const direction=editBtn.dataset.direction;
      const item=rows.find(r=>r.id===detailTargetId);
      if(!item)return;
      const items=item.items.filter(i=>i.direction===direction);
      const it=items[idx];
      if(!it)return;
      if(action==='toggleDelete'){
        // 查看模式下点击删除，先进入编辑态
        if(!editState[direction]) editState[direction]=true;
        it.isDeleted=!it.isDeleted;
        refreshDetail();
      }
      else if(action==='removeNew'){ const gi=item.items.indexOf(it); if(gi>=0)item.items.splice(gi,1); refreshDetail(); }
      return;
    }
    const addRow=e.target.closest('.add-fee-row');
    if(addRow){ addFeeItem(addRow.dataset.direction); return; }
    if(e.target.id==='rebillBtn') handleRebill();
  });

  detailModal.addEventListener('input',e=>{
    const input=e.target;
    if(!input.classList.contains('amount-input')&&!input.classList.contains('new-row-input')&&!input.classList.contains('new-row-select')&&!input.classList.contains('remark-col-input'))return;
    const idx=Number(input.dataset.idx);
    const direction=input.dataset.direction;
    const field=input.dataset.field;
    const item=rows.find(r=>r.id===detailTargetId);
    if(!item)return;
    const items=item.items.filter(i=>i.direction===direction);
    const it=items[idx];
    if(!it)return;
    if(field==='remark'){ it.remark=input.value; return; }
    if(field==='originalAmount'){
      const newAmt=parseFloat(input.value)||0;
      it.originalAmount=newAmt;
      it.baseAmount=newAmt*(it.baseExchangeRate||1);
      it.amount=Math.round(it.baseAmount*(it.cnyExchangeRate||7.85)*100)/100;
      it._modified=true;
      it.adjustedType='modified';
      item.manuallyAdjusted=true;
      // 直接更新同行单元格，不触发整体重渲染
      var row=input.closest('tr');
      if(row){
        var tds=row.querySelectorAll('td');
        var baseSym=currencySym(it.baseCurrency||'CNY');
        tds[5].textContent=baseSym+fmtAmt(it.baseAmount);
        tds[7].textContent='¥'+fmtAmt(it.amount);
      }
      // 更新小计和汇总
      var rItems=item.items.filter(function(i){return i.direction==='receivable';});
      var pItems=item.items.filter(function(i){return i.direction==='payable';});
      var rTotal=rItems.filter(function(i){return !i.isDeleted;}).reduce(function(s,i){return s+(i.amount||0);},0);
      var pTotal=pItems.filter(function(i){return !i.isDeleted;}).reduce(function(s,i){return s+(i.amount||0);},0);
      if(direction==='receivable') receivableSum.textContent='小计：¥'+fmtAmt(rTotal);
      else payableSum.textContent='小计：¥'+fmtAmt(pTotal);
      var net=rTotal-pTotal;
      detailSummary.innerHTML='<div class="summary-item"><span class="summary-label">应收总额：</span><span class="summary-value net-positive">¥'+fmtAmt(rTotal)+'</span></div><div class="summary-item"><span class="summary-label">应付总额：</span><span class="summary-value net-negative">¥'+fmtAmt(pTotal)+'</span></div><div class="summary-item"><span class="summary-label">净额：</span><span class="summary-value '+(net>=0?'net-positive':'net-negative')+'">¥'+fmtAmt(net)+'</span></div>';
    }else if(field==='feeItemName') it.feeItemName=input.value;
    else if(field==='currency'){ it.currency=input.value; it.baseCurrency=input.value; }
  });

  /* 失焦自动保存并退出编辑态 */
  detailModal.addEventListener('focusout',function(e){
    var input=e.target;
    if(!input.classList.contains('amount-input')&&!input.classList.contains('remark-col-input')&&!input.classList.contains('new-row-input')&&!input.classList.contains('new-row-select'))return;
    var direction=input.dataset.direction;
    if(!direction||!editState[direction])return;
    setTimeout(function(){
      var active=document.activeElement;
      if(active&&active.dataset&&active.dataset.direction===direction)return;
      finishEdit(direction);
    },150);
  });

  /* 展开/收起计费明细 — 点击整行触发 */
  detailModal.addEventListener('click',e=>{
    const row=e.target.closest('tr.fee-item-row');
    if(!row)return;
    const detailRow=row.nextElementSibling;
    if(!detailRow||!detailRow.classList.contains('calc-detail-row'))return;
    const expanded=detailRow.style.display!=='none';
    detailRow.style.display=expanded?'none':'table-row';
    row.classList.toggle('expanded',!expanded);
  });

  render();
})();
