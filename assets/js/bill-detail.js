(()=>{
  const billDetailPage=document.getElementById('billDetailPage');
  const breadcrumbNo=document.getElementById('breadcrumbNo');
  const statusBanner=document.getElementById('statusBanner');
  const billInfo=document.getElementById('billInfo');
  const tabContent=document.getElementById('tabContent');
  const sendBtn=document.getElementById('sendBtn');
  const confirmBtn=document.getElementById('confirmBtn');
  const withdrawBtn=document.getElementById('withdrawBtn');
  const previewBtn=document.getElementById('previewBtn');
  const exitPreviewBtn=document.getElementById('exitPreviewBtn');
  const withdrawModal=document.getElementById('withdrawModal');
  const withdrawBillInfo=document.getElementById('withdrawBillInfo');
  const withdrawReason=document.getElementById('withdrawReason');
  const withdrawCancelBtn=document.getElementById('withdrawCancelBtn');
  const withdrawConfirmBtn=document.getElementById('withdrawConfirmBtn');
  let pendingWithdrawBill=null;

  const STATUS_MAP={
    draft:{label:'草稿',cls:'draft'},
    sent:{label:'已发送',cls:'sent'},
    confirmed:{label:'已确认',cls:'confirmed'},
    partially_received:{label:'部分收款',cls:'pending'},
    settled:{label:'已结清',cls:'confirmed'},
    cancelled:{label:'已作废',cls:'cancelled'}
  };
  const SHEET_TYPE_MAP={order:'订单费用',stock_inbound:'备货入库费用',return_inbound:'退货入库费用',storage_cycle:'仓储费用'};
  const SETTLEMENT_MAP={realtime:'余额扣款',bill:'账期结算'};
  const CURRENCY_MAP={CNY:{symbol:'¥',label:'人民币'},EUR:{symbol:'€',label:'欧元'},USD:{symbol:'$',label:'美元'},GBP:{symbol:'£',label:'英镑'}};
  function fmtRate(n){return n.toFixed(4);}
  function currencySym(c){return CURRENCY_MAP[c]?CURRENCY_MAP[c].symbol:c;}
  const CAT_CARDS=[
    {key:'all',label:'全部'},
    {key:'inbound',label:'入仓费'},
    {key:'storage',label:'仓储费'},
    {key:'order',label:'订单费'},
    {key:'other',label:'其他'}
  ];
  const CAT_LABELS={inbound:'入仓费',storage:'仓储费',order:'订单费',other:'其他'};

  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function fmtAmt(n){return n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}

  function showToast(type,title,desc){
    const el=document.createElement('div');
    el.className='toast '+type;
    el.innerHTML='<div class="toast-title">'+escapeHtml(title)+'</div>'+(desc?'<div class="toast-desc">'+escapeHtml(desc)+'</div>':'');
    document.getElementById('toastStack').appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),240);},2200);
  }

  function buildBillData(){
    return [
      {id:1,billNo:'BL-20260514-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:1856.25,receivableTotal:14571.56,receivedAmount:0,cancelReason:'',
        feeSheetCount:2,
        status:'confirmed',remark:'',createdBy:'Kevin.王磊',
        createdAt:'2026-05-14 10:00',sentAt:'2026-05-14 14:00',confirmedAt:'2026-05-15 09:00',
        settlementRecords:[],
        categorySummary:[
          {key:'inbound',amount:5850.06,count:2},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:8721.50,count:2},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260510-001',category:'operation',operationType:'inbound',sheetType:'order',sourceNo:'TRK-2026-001',warehouseName:'波兰海外仓',receivableAmount:8299.41,
            items:[
              {feeItemName:'卸货费',currency:'EUR',originalAmount:314,amount:2464.90,billingTime:'05-10 14:35',ruleDesc:['如果 到货形式 = 整柜、货物类型 包含 箱货，且 柜型 = 20GP，则按 <b>€10/柜</b> 计费','如果 到货形式 = 整柜、货物类型 包含 箱货，且 箱数 > 700，则按 <b>€0.3/箱</b> 计费，减免前700箱'],calcFormula:['€10 × 1柜 = €10','(800-700)箱 × €0.3 = €30']},
              {feeItemName:'清点费',currency:'EUR',originalAmount:39.25,amount:308.11,billingTime:'05-10 14:36',ruleDesc:['如果 到货形式 = 散货，且 货物类型 包含 箱货，则按 <b>€5/箱</b> 计费'],calcFormula:['€5 × 1箱 = €5']},
              {feeItemName:'上架费',currency:'EUR',originalAmount:392.5,amount:3081.13,billingTime:'05-10 14:38',ruleDesc:['如果 到货形式 = 整柜、货物类型 包含 箱货，则按 <b>€1/箱</b> 计费','如果 SKU数量 > 20，超出部分按 <b>€2/SKU</b> 计费，减免前20个'],calcFormula:['€1 × 10箱 = €10','(40-20)SKU × €2 = €40']},
              {feeItemName:'干线物流费',currency:'EUR',originalAmount:785,amount:6162.25,billingTime:'05-11 09:30',ruleDesc:['按线路报价：华东仓 → 波兰海外仓，按 <b>€50/柜</b> 计费，共 <b>2柜</b>'],calcFormula:['€50 × 2柜 = €100']}
            ]},
          {feeNo:'FS-20260514-002',category:'operation',operationType:'inbound',sheetType:'stock_inbound',sourceNo:'STK-IN-20260514-001',warehouseName:'波兰海外仓',receivableAmount:4005.46,
            items:[
              {feeItemName:'卸货费',currency:'EUR',originalAmount:235.5,amount:1848.68,billingTime:'05-14 10:20',ruleDesc:['如果 到货形式 = 整柜、货物类型 包含 箱货，且 柜型 = 20GP，则按 <b>€30/柜</b> 计费'],calcFormula:['€30 × 1柜 = €30']},
              {feeItemName:'清点费',currency:'EUR',originalAmount:117.75,amount:924.34,billingTime:'05-14 10:22',ruleDesc:['如果 到货形式 = 散货，且 货物类型 包含 箱货，则按 <b>€0.3/箱</b> 计费'],calcFormula:['€0.3 × 50箱 = €15']},
              {feeItemName:'上架费',currency:'EUR',originalAmount:157,amount:1232.45,billingTime:'05-14 10:35',ruleDesc:['如果 到货形式 = 散货、货物类型 包含 箱货，则按 <b>€0.4/箱</b> 计费'],calcFormula:['€0.4 × 50箱 = €20']}
            ]}
        ]},
      {id:2,billNo:'BL-20260515-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:1020.5,receivableTotal:8010.93,receivedAmount:8010.93,cancelReason:'',
        feeSheetCount:2,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-15 11:00',sentAt:'2026-05-16 09:00',confirmedAt:'',
        settlementRecords:[],
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:8010.93,count:2},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260512-001',category:'operation',operationType:'outbound',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:1540.56,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-12 10:20',ruleDesc:['如果 出库类型 = 标准出库，则基础费 <b>€10</b> + 按 <b>€7.5/次</b> 计费'],calcFormula:['€10 + €7.5 × 2次 = €25']}
            ]},
          {feeNo:'FS-20260512-001-L',category:'logistics',operationType:'',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:6470.36,
            items:[
              {feeItemName:'干线物流费',currency:'EUR',originalAmount:824.25,amount:6470.36,billingTime:'05-12 10:25',ruleDesc:['按线路报价：华东仓 → 德国海外仓，按 <b>€105/柜</b> 计费，共 <b>1柜</b>'],calcFormula:['€105 × 1柜 = €105']}
            ]}
        ]},
      {id:3,billNo:'BL-20260516-001',customerName:'上海DEF电商',customerId:3,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:235.5,receivableTotal:1848.68,receivedAmount:0,cancelReason:'',
        feeSheetCount:1,
        status:'draft',remark:'',createdBy:'Jack.陈明',
        createdAt:'2026-05-16 14:00',sentAt:'',confirmedAt:'',
        settlementRecords:[],
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:0,count:0},
          {key:'other',amount:1848.68,count:1}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-002',category:'operation',operationType:'vas',sheetType:'order',sourceNo:'TRK-2026-003',warehouseName:'波兰海外仓',receivableAmount:1848.68,
            items:[
              {feeItemName:'质检服务费',currency:'EUR',originalAmount:235.5,amount:1848.68,billingTime:'05-13 11:35',ruleDesc:['如果 增值服务 = 质检，则按 <b>€10/次</b> 计费'],calcFormula:['€10 × 3次 = €30']}
            ]}
        ]},
      {id:4,billNo:'BL-20260517-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:549.5,receivableTotal:4313.58,receivedAmount:0,cancelReason:'',
        feeSheetCount:1,
        status:'draft',remark:'含仓储费',createdBy:'Kevin.王磊',
        createdAt:'2026-05-17 08:30',sentAt:'',confirmedAt:'',
        settlementRecords:[],
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:4313.58,count:1},
          {key:'order',amount:0,count:0},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-001',category:'storage',operationType:'',sheetType:'storage_cycle',sourceNo:'',warehouseName:'波兰海外仓',receivableAmount:4313.58,
            items:[
              {feeItemName:'基础仓储费',currency:'EUR',originalAmount:392.5,amount:3081.13,billingTime:'05-13 16:50',ruleDesc:['按SKU·天计费，费率 <b>€2.5/SKU·天</b>，计费 <b>20 SKU·天</b>（10SKU × 2天）'],calcFormula:['€2.5 × 20 SKU·天 = €50']},
              {feeItemName:'旺季附加费',currency:'EUR',originalAmount:157,amount:1232.45,billingTime:'05-13 16:52',ruleDesc:['按基础仓储费比例收取，附加系数 <b>40%</b>，基础仓储费€50'],calcFormula:['€50 × 40% = €20']}
            ]}
        ]},
      {id:5,billNo:'BL-20260518-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:274.75,receivableTotal:2156.79,receivedAmount:0,cancelReason:'',
        feeSheetCount:1,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-18 09:30',sentAt:'2026-05-18 15:00',confirmedAt:'',
        settlementRecords:[],
        categorySummary:[
          {key:'inbound',amount:2156.79,count:1},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:0,count:0},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260515-001',category:'operation',operationType:'inbound',sheetType:'return_inbound',sourceNo:'Y202605150001E',warehouseName:'波兰海外仓',receivableAmount:2156.79,
            items:[
              {feeItemName:'入库操作费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-15 09:35',ruleDesc:['如果 退货入库，货物类型 包含 箱货，则按 <b>€25/批</b> 计费'],calcFormula:['€25 × 1批 = €25']},
              {feeItemName:'检验费',currency:'EUR',originalAmount:78.5,amount:616.23,billingTime:'05-15 09:40',ruleDesc:['如果 退货入库且需要质检，则按 <b>€10/批</b> 计费'],calcFormula:['€10 × 1批 = €10']}
            ]}
        ]},
      {id:6,billNo:'BL-20260519-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:628,receivableTotal:4931.80,receivedAmount:3000,cancelReason:'',
        feeSheetCount:2,
        status:'partially_received',remark:'',createdBy:'Kevin.王磊',
        createdAt:'2026-05-19 10:00',sentAt:'2026-05-19 14:00',confirmedAt:'2026-05-20 09:00',
        settlementRecords:[{settlementNo:'STL-20260522-001',amount:3000,date:'2026-05-22'}],
        categorySummary:[
          {key:'inbound',amount:2465.90,count:1},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:2465.90,count:1},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260516-001',category:'operation',operationType:'inbound',sheetType:'stock_inbound',sourceNo:'STK-IN-20260516-001',warehouseName:'波兰海外仓',receivableAmount:2465.90,
            items:[
              {feeItemName:'卸货费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-16 10:20',ruleDesc:['如果 到货形式 = 整柜、货物类型 包含 箱货，则按 <b>€30/柜</b> 计费'],calcFormula:['€30 × 1柜 = €30']},
              {feeItemName:'清点费',currency:'EUR',originalAmount:117.75,amount:924.34,billingTime:'05-16 10:22',ruleDesc:['如果 到货形式 = 散货，则按 <b>€0.3/箱</b> 计费'],calcFormula:['€0.3 × 50箱 = €15']}
            ]},
          {feeNo:'FS-20260517-001',category:'operation',operationType:'outbound',sheetType:'order',sourceNo:'TRK-2026-004',warehouseName:'波兰海外仓',receivableAmount:2465.90,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-17 09:30',ruleDesc:['如果 出库类型 = 标准出库，则按 <b>€25/次</b> 计费'],calcFormula:['€25 × 1次 = €25']},
              {feeItemName:'打包费',currency:'EUR',originalAmount:117.75,amount:924.34,billingTime:'05-17 09:35',ruleDesc:['如果 出库类型 = 标准出库，则按 <b>€0.4/箱</b> 计费'],calcFormula:['€0.4 × 50箱 = €20']}
            ]}
        ]},
      {id:7,billNo:'BL-20260520-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-03-01',periodEnd:'2026-03-31',periodLabel:'2026年3月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:392.5,receivableTotal:3081.13,receivedAmount:3081.13,cancelReason:'',
        feeSheetCount:1,
        status:'settled',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-20 08:00',sentAt:'2026-05-20 11:00',confirmedAt:'2026-05-21 09:00',
        settlementRecords:[{settlementNo:'STL-20260524-001',amount:3081.13,date:'2026-05-24'}],
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:3081.13,count:1},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260518-001',category:'logistics',operationType:'',sheetType:'order',sourceNo:'TRK-2026-005',warehouseName:'德国海外仓',receivableAmount:3081.13,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-18 10:20',ruleDesc:['如果 出库类型 = 标准出库，则按 <b>€25/次</b> 计费'],calcFormula:['€25 × 1次 = €25']},
              {feeItemName:'干线物流费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-18 10:25',ruleDesc:['按线路报价：华东仓 → 德国海外仓，按 <b>€105/柜</b> 计费'],calcFormula:['€105 × 1柜 = €105']}
            ]}
        ]}
    ];
  }

  const bills=buildBillData();
  bills.forEach(bill=>{
    bill.feeSheets.forEach(fs=>{
      if(!fs.settlementMode) fs.settlementMode='realtime';
      if(!fs.salesperson) fs.salesperson=bill.createdBy;
      if(!fs.createdAt) fs.createdAt=bill.createdAt;
      if(!fs.quotationScheme){
        const cat=fs.category||'';
        if(bill.customerName.includes('ABC')){
          fs.quotationScheme=cat==='storage'?'QS-2026-ABC-STO':'QS-2026-ABC-001';
          fs.quotationSchemeName=cat==='storage'?'ABC贸易波兰仓仓储费方案':'ABC贸易波兰仓标准操作费方案';
        }else if(bill.customerName.includes('XYZ')){
          fs.quotationScheme='QS-2026-XYZ-002';
          fs.quotationSchemeName='XYZ物流德国仓综合费方案';
        }else if(bill.customerName.includes('DEF')){
          fs.quotationScheme='QS-2026-DEF-003';
          fs.quotationSchemeName='DEF电商波兰仓操作费方案';
        }else{
          fs.quotationScheme='';fs.quotationSchemeName='';
        }
      }
      fs.items.forEach(it=>{
        if(!it.baseCurrency) it.baseCurrency=it.currency||'EUR';
        if(it.baseExchangeRate===undefined) it.baseExchangeRate=1;
        if(!it.baseAmount) it.baseAmount=it.originalAmount;
        if(it.cnyExchangeRate===undefined) it.cnyExchangeRate=7.85;
      });
    });
  });
  let currentBill=null;
  let activeTab='all';
  let isPreview=false;

  function getBillFromUrl(){
    const params=new URLSearchParams(window.location.search);
    const id=Number(params.get('id'));
    return bills.find(b=>b.id===id)||bills[0];
  }

  function getFeeSheetCategoryKey(fs){
    if(fs.category==='storage') return 'storage';
    if(fs.category==='operation'&&(fs.operationType||'other')==='inbound') return 'inbound';
    if(fs.category==='logistics'||(fs.category==='operation'&&(fs.operationType||'other')==='outbound')) return 'order';
    return 'other';
  }

  function getFeeSheetsByCategory(bill,categoryKey){
    return bill.feeSheets.filter(fs=>getFeeSheetCategoryKey(fs)===categoryKey);
  }

  function getCategoryTotal(bill,categoryKey){
    const cs=bill.categorySummary.find(c=>c.key===categoryKey);
    return cs?cs.amount:0;
  }

  function getCategoryCount(bill,categoryKey){
    const cs=bill.categorySummary.find(c=>c.key===categoryKey);
    return cs?cs.count:0;
  }

  function renderTopBar(){
    if(!currentBill)return;
    breadcrumbNo.textContent=currentBill.billNo;
    const isCancelled=currentBill.status==='cancelled';
    sendBtn.style.display=currentBill.status==='draft'?'':'none';
    confirmBtn.style.display=currentBill.status==='sent'?'':'none';
    withdrawBtn.style.display=(currentBill.status==='draft'||currentBill.status==='sent')?'':'none';
    previewBtn.style.display=(isPreview||isCancelled)?'none':'';
    exitPreviewBtn.style.display=isPreview?'':'none';
  }

  function renderStatusBanner(){
    if(!currentBill)return;
    const st=STATUS_MAP[currentBill.status];
    let meta='创建于 '+currentBill.createdAt+' · 创建人：'+currentBill.createdBy;
    if(currentBill.sentAt) meta+=' · 发送于 '+currentBill.sentAt;
    if(currentBill.confirmedAt) meta+=' · 确认于 '+currentBill.confirmedAt;
    statusBanner.className='status-banner '+st.cls;
    statusBanner.innerHTML='<strong>'+st.label+'</strong><span class="banner-meta">'+meta+'</span>';
  }

  function renderBillInfo(){
    if(!currentBill)return;
    billInfo.innerHTML=[
      '<div><div class="info-label">账单号</div><div class="info-value">'+escapeHtml(currentBill.billNo)+'</div></div>',
      '<div><div class="info-label">客户</div><div class="info-value">'+escapeHtml(currentBill.customerName)+'</div></div>',
      '<div><div class="info-label">账期</div><div class="info-value">'+escapeHtml(currentBill.periodLabel)+'</div></div>',
      '<div><div class="info-label">费用单数</div><div class="info-value">'+currentBill.feeSheetCount+'条</div></div>'
    ].join('');
  }

  function renderCurrencyCard(){
    if(!currentBill)return;
    const el=document.getElementById('currencyCard');
    if(!el)return;
    el.innerHTML='<div class="info-card-title">币种与汇率</div>'
      +'<div class="info-grid">'
      +'<div><div class="info-label">结算币种</div><div class="info-value">'+escapeHtml(currentBill.settlementCurrency)+'</div></div>'
      +'<div><div class="info-label">汇率</div><div class="info-value">'+currentBill.exchangeRate.toFixed(4)+'</div></div>'
      +'<div><div class="info-label">原币总额</div><div class="info-value">€'+fmtAmt(currentBill.originalTotal)+'</div></div>'
      +'<div><div class="info-label">折算金额</div><div class="info-value">¥'+fmtAmt(currentBill.receivableTotal)+'</div></div>'
      +'</div>';
  }

  function renderReceiptSection(){
    if(!currentBill)return;
    const el=document.getElementById('receiptSection');
    if(!el)return;
    const recv=currentBill.receivedAmount||0;
    const total=currentBill.receivableTotal||0;
    const unpaid=total-recv;
    const records=currentBill.settlementRecords||[];
    const hasReceipt=currentBill.status==='partially_received'||currentBill.status==='settled';
    if(!hasReceipt){el.style.display='none';return;}
    el.style.display='';
    el.className='info-card';
    const pct=total>0?Math.min(100,Math.round(recv/total*100)):0;
    let html='<div class="info-card-title">收款明细 <span class="type-subtotal" style="font-weight:400;font-size:12px;margin-left:12px">已收 <span style="color:var(--color-success)">¥'+fmtAmt(recv)+'</span> / 应收 ¥'+fmtAmt(total)+'</span></div>';
    html+='<div style="padding:0 0 12px;display:flex;align-items:center;gap:16px">';
    html+='<div style="flex:1;background:#f0f2f5;border-radius:4px;height:8px;overflow:hidden"><div style="height:100%;border-radius:4px;background:var(--color-success);width:'+pct+'%;transition:width 0.3s"></div></div>';
    html+='<span style="font-size:11px;color:var(--color-text-tertiary);white-space:nowrap">'+pct+'%</span>';
    html+='</div>';
    if(!records.length){
      html+='<div style="text-align:center;padding:20px 0;color:var(--color-text-tertiary);font-size:12px">暂无收款记录</div>';
    }else{
      html+='<div class="detail-table-wrap"><table class="list-table" style="min-width:600px">';
      html+='<colgroup><col style="width:30%"><col style="width:25%"><col style="width:25%"></colgroup>';
      html+='<thead><tr><th>结算单号</th><th class="amount-right">核销金额(CNY)</th><th>收款日期</th></tr></thead><tbody>';
      records.forEach(r=>{
        html+='<tr><td><a class="name-link" href="./settlement-detail.html?id='+r.settlementNo+'">'+escapeHtml(r.settlementNo)+'</a></td><td class="amount-right">¥'+fmtAmt(r.amount)+'</td><td>'+escapeHtml(r.date)+'</td></tr>';
      });
      html+='</tbody></table></div>';
    }
    el.innerHTML=html;
  }

  function renderCatTabs(){
    if(!currentBill)return '';
    let html='<div class="cat-tabs">';
    CAT_CARDS.forEach(card=>{
      let amt,cnt;
      if(card.key==='all'){
        amt=currentBill.receivableTotal;
        cnt=currentBill.feeSheetCount;
      }else{
        amt=getCategoryTotal(currentBill,card.key);
        cnt=getCategoryCount(currentBill,card.key);
      }
      html+='<div class="cat-tab'+(activeTab===card.key?' active':'')+'" data-cat="'+card.key+'">';
      html+='<div class="cat-name">'+card.label+'</div>';
      html+='<div class="cat-amount">¥'+fmtAmt(amt)+'</div>';
      html+='<div class="cat-count">'+cnt+'条</div>';
      html+='</div>';
    });
    html+='</div>';
    return html;
  }

  function renderContent(){
    if(!currentBill)return;
    let html='<div class="info-card">';
    html+=renderCatTabs();
    let sheets;
    let subtotal;
    let title;
    if(activeTab==='all'){
      sheets=currentBill.feeSheets;
      subtotal=currentBill.receivableTotal;
      title='全部费用明细';
    }else{
      sheets=getFeeSheetsByCategory(currentBill,activeTab);
      subtotal=getCategoryTotal(currentBill,activeTab);
      title=(CAT_LABELS[activeTab]||activeTab)+'明细';
    }
    html+='<div class="type-header"><span class="type-title">'+title+'</span><span class="type-subtotal">小计 ¥'+fmtAmt(subtotal)+'</span></div>';
    html+='<div class="detail-table-wrap"><div class="table-wrap"><table class="list-table" style="min-width:800px">';
    html+='<colgroup><col style="width:14%"><col style="width:10%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:12%"><col style="width:8%"></colgroup>';
    html+='<thead><tr><th>费用单号</th><th>单据类型</th><th>关联单号</th><th>仓库</th><th class="amount-right">原币金额</th><th class="amount-right">折算金额(CNY)</th><th>费用项数</th></tr></thead>';
    html+='<tbody>';
    if(!sheets.length){
      html+='<tr class="empty-row"><td colspan="7">暂无费用单</td></tr>';
    }else{
      sheets.forEach((fs,idx)=>{
        html+=buildFeeSheetRow(fs,idx);
      });
    }
    html+='</tbody></table></div></div>';
    html+='</div>';
    tabContent.innerHTML=html;
  }

  function buildFeeSheetRow(fs,idx){
    const origTotal=fs.items.reduce((s,it)=>s+(it.originalAmount||0),0);
    const currency=fs.items.length?fs.items[0].currency:'EUR';
    const typeLabel=SHEET_TYPE_MAP[fs.sheetType]||fs.sheetType;
    let html='<tr>';
    html+='<td><a class="name-link" href="javascript:void(0)" data-fee-no="'+escapeHtml(fs.feeNo)+'">'+escapeHtml(fs.feeNo)+'</a></td>';
    html+='<td>'+escapeHtml(typeLabel)+'</td>';
    html+='<td>'+(fs.sourceNo?escapeHtml(fs.sourceNo):'—')+'</td>';
    html+='<td>'+escapeHtml(fs.warehouseName)+'</td>';
    html+='<td class="amount-right">'+currency+fmtAmt(origTotal)+'</td>';
    html+='<td class="amount-right">¥'+fmtAmt(fs.receivableAmount)+'</td>';
    html+='<td>'+fs.items.length+'项</td>';
    html+='</tr>';
    return html;
  }

  function renderAll(){
    currentBill=getBillFromUrl();
    renderTopBar();
    renderStatusBanner();
    renderBillInfo();
    renderCurrencyCard();
    renderContent();
    renderReceiptSection();
    if(isPreview){
      billDetailPage.classList.add('preview-mode');
      document.body.classList.add('preview-active');
    }else{
      billDetailPage.classList.remove('preview-mode');
      document.body.classList.remove('preview-active');
    }
  }

  /* 费用单详情弹窗 */
  const feeDetailModal=document.getElementById('feeDetailModal');
  const feeDetailTitle=document.getElementById('feeDetailTitle');
  const feeDetailBody=document.getElementById('feeDetailBody');
  const feeDetailCloseBtn=document.getElementById('feeDetailCloseBtn');
  const feeDetailOkBtn=document.getElementById('feeDetailOkBtn');

  function openFeeDetail(feeNo){
    if(!currentBill)return;
    const fs=currentBill.feeSheets.find(f=>f.feeNo===feeNo);
    if(!fs)return;
    const typeLabel=SHEET_TYPE_MAP[fs.sheetType]||fs.sheetType;
    const recvTotal=fs.items.reduce((s,it)=>s+it.amount,0);
    const currencies=[...new Set(fs.items.map(i=>i.currency||'EUR'))].map(c=>CURRENCY_MAP[c]?CURRENCY_MAP[c].label:c).join('、');

    feeDetailTitle.textContent=fs.feeNo+' 详情';

    let html='<div class="detail-info-card"><div class="detail-info-grid">';
    html+='<div class="info-label">费用单号</div><div class="info-value">'+escapeHtml(fs.feeNo)+' <span class="status-tag active">已出账</span></div>';
    html+='<div class="info-label">单据类型</div><div class="info-value">'+escapeHtml(typeLabel)+'</div>';
    html+='<div class="info-label">关联单号</div><div class="info-value">'+(fs.sourceNo?escapeHtml(fs.sourceNo):'—')+'</div>';
    html+='<div class="info-label">客户</div><div class="info-value">'+escapeHtml(currentBill.customerName)+'</div>';
    html+='<div class="info-label">仓库</div><div class="info-value">'+escapeHtml(fs.warehouseName)+'</div>';
    html+='<div class="info-label">业务员</div><div class="info-value">'+escapeHtml(fs.salesperson||'—')+'</div>';
    html+='<div class="info-label">创建时间</div><div class="info-value">'+escapeHtml(fs.createdAt||'—')+'</div>';
    html+='<div class="info-label">涉及币种</div><div class="info-value">'+escapeHtml(currencies)+'</div>';
    html+='<div class="info-label">报价方案</div><div class="info-value">'+(fs.quotationScheme?'<a class="name-link" href="./quotation-scheme-config.html">《'+escapeHtml(fs.quotationSchemeName)+'》</a>':'—')+'</div>';
    html+='</div></div>';

    const DETAIL_COLSPAN=10;
    html+='<div class="detail-section"><div class="detail-section-title"><span class="dir-receivable-tag">应收费用项</span><span class="detail-section-sum">小计：<span class="net-positive">¥'+fmtAmt(recvTotal)+'</span></span></div>';
    html+='<table class="detail-items-table"><thead><tr><th style="width:40px;white-space:nowrap">序号</th><th style="white-space:nowrap">费用项</th><th style="width:64px;white-space:nowrap">原币币种</th><th class="amount-header" style="width:100px;white-space:nowrap">原币总价</th><th class="amount-header" style="width:80px;white-space:nowrap">本位币汇率</th><th class="amount-header" style="width:100px;white-space:nowrap">本位币总价</th><th class="amount-header" style="width:80px;white-space:nowrap">CNY汇率</th><th class="amount-header" style="width:100px;white-space:nowrap">CNY总价</th><th style="width:90px;white-space:nowrap">计费时间</th><th style="width:100px;white-space:nowrap">备注</th></tr></thead><tbody>';
    fs.items.forEach((it,idx)=>{
      const descs=Array.isArray(it.ruleDesc)?it.ruleDesc:(it.ruleDesc?[it.ruleDesc]:[]);
      const formulas=Array.isArray(it.calcFormula)?it.calcFormula:(it.calcFormula?[it.calcFormula]:[]);
      const sym=currencySym(it.currency||'EUR');
      const baseSym=currencySym(it.baseCurrency||it.currency||'EUR');
      html+='<tr class="fee-item-row" data-idx="'+idx+'"><td class="cell-center">'+(idx+1)+'</td><td class="fee-name-cell">'+escapeHtml(it.feeItemName)+'</td><td class="cell-center"><span class="currency-tag">'+escapeHtml(it.currency||'EUR')+'</span></td><td class="amount-cell amount-orig">'+sym+fmtAmt(it.originalAmount)+'</td><td class="amount-cell rate-cell">'+fmtRate(it.baseExchangeRate||1)+'</td><td class="amount-cell amount-base">'+baseSym+fmtAmt(it.baseAmount||it.originalAmount)+'</td><td class="amount-cell rate-cell">'+fmtRate(it.cnyExchangeRate||7.85)+'</td><td class="amount-cell">¥'+fmtAmt(it.amount)+'</td><td class="time-cell">'+escapeHtml(it.billingTime)+'</td><td class="remark-cell">'+(it.remark?'<span class="remark-text">'+escapeHtml(it.remark)+'</span>':'')+'</td></tr>';
      if(descs.length){
        const lines=descs.map((desc,i)=>'<div class="calc-detail-grid"><div class="calc-rule-col">'+desc+'</div><div class="calc-formula-col">'+escapeHtml(formulas[i]||'')+'</div></div>').join('');
        html+='<tr class="calc-detail-row" style="display:none"><td colspan="'+DETAIL_COLSPAN+'"><div class="calc-detail-panel">'+lines+'</div></td></tr>';
      }
    });
    html+='</tbody></table></div>';

    feeDetailBody.innerHTML=html;
    feeDetailModal.classList.add('open');
    feeDetailModal.setAttribute('aria-hidden','false');
  }

  function closeFeeDetail(){
    feeDetailModal.classList.remove('open');
    feeDetailModal.setAttribute('aria-hidden','true');
  }

  tabContent.addEventListener('click',e=>{
    const cat=e.target.closest('[data-cat]');
    if(cat){
      activeTab=cat.dataset.cat;
      renderContent();
      return;
    }
    const link=e.target.closest('[data-fee-no]');
    if(link){
      openFeeDetail(link.dataset.feeNo);
      return;
    }
  });

  feeDetailCloseBtn.addEventListener('click',closeFeeDetail);
  feeDetailOkBtn.addEventListener('click',closeFeeDetail);
  feeDetailModal.addEventListener('click',e=>{
    if(e.target===feeDetailModal){closeFeeDetail();return;}
    const row=e.target.closest('tr.fee-item-row');
    if(!row)return;
    const detailRow=row.nextElementSibling;
    if(!detailRow||!detailRow.classList.contains('calc-detail-row'))return;
    const expanded=detailRow.style.display!=='none';
    detailRow.style.display=expanded?'none':'table-row';
    row.classList.toggle('expanded',!expanded);
  });

  sendBtn.addEventListener('click',()=>{
    if(!currentBill)return;
    currentBill.status='sent';
    currentBill.sentAt=new Date().toISOString().replace('T',' ').substring(0,16);
    renderAll();
    showToast('success','已发送','账单已发送给客户');
  });

  confirmBtn.addEventListener('click',()=>{
    if(!currentBill)return;
    currentBill.status='confirmed';
    currentBill.confirmedAt=new Date().toISOString().replace('T',' ').substring(0,16);
    renderAll();
    showToast('success','已确认','客户已确认账单');
  });

  withdrawBtn.addEventListener('click',()=>{
    if(!currentBill)return;
    pendingWithdrawBill=currentBill;
    withdrawBillInfo.textContent='账单号：'+currentBill.billNo;
    withdrawReason.value='';
    withdrawModal.style.display='flex';
  });

  previewBtn.addEventListener('click',()=>{
    isPreview=true;
    renderAll();
  });

  exitPreviewBtn.addEventListener('click',()=>{
    isPreview=false;
    renderAll();
  });

  withdrawCancelBtn.addEventListener('click',()=>{
    withdrawModal.style.display='none';
    pendingWithdrawBill=null;
  });
  withdrawConfirmBtn.addEventListener('click',()=>{
    if(!withdrawReason.value.trim()){showToast('warning','请填写原因','撒回原因为必填项');return;}
    if(pendingWithdrawBill){
      pendingWithdrawBill.status='cancelled';
      pendingWithdrawBill.cancelReason=withdrawReason.value.trim();
      renderAll();
      showToast('success','已作废','账单已作废');
    }
    withdrawModal.style.display='none';
    pendingWithdrawBill=null;
  });

  renderAll();
})();
