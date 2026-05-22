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
    cancelled:{label:'已作废',cls:'cancelled'}
  };
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
        categorySummary:[
          {key:'inbound',amount:5850.06,count:2},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:8721.50,count:2},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260510-001',category:'operation',operationType:'inbound',sheetType:'order',sourceNo:'TRK-2026-001',warehouseName:'波兰海外仓',receivableAmount:8299.41,
            items:[
              {feeItemName:'卸货费',currency:'EUR',originalAmount:314,amount:2464.90,billingTime:'05-10 14:35'},
              {feeItemName:'清点费',currency:'EUR',originalAmount:39.25,amount:308.11,billingTime:'05-10 14:36'},
              {feeItemName:'上架费',currency:'EUR',originalAmount:392.5,amount:3081.13,billingTime:'05-10 14:38'},
              {feeItemName:'干线物流费',currency:'EUR',originalAmount:785,amount:6162.25,billingTime:'05-11 09:30'}
            ]},
          {feeNo:'FS-20260514-002',category:'operation',operationType:'inbound',sheetType:'stock_inbound',sourceNo:'STK-IN-20260514-001',warehouseName:'波兰海外仓',receivableAmount:4005.46,
            items:[
              {feeItemName:'卸货费',currency:'EUR',originalAmount:235.5,amount:1848.68,billingTime:'05-14 10:20'},
              {feeItemName:'清点费',currency:'EUR',originalAmount:117.75,amount:924.34,billingTime:'05-14 10:22'},
              {feeItemName:'上架费',currency:'EUR',originalAmount:157,amount:1232.45,billingTime:'05-14 10:35'}
            ]}
        ]},
      {id:2,billNo:'BL-20260515-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:1020.5,receivableTotal:8010.93,receivedAmount:8010.93,cancelReason:'',
        feeSheetCount:2,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-15 11:00',sentAt:'2026-05-16 09:00',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:8010.93,count:2},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260512-001',category:'operation',operationType:'outbound',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:1540.56,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-12 10:20'}
            ]},
          {feeNo:'FS-20260512-001-L',category:'logistics',operationType:'',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:6470.36,
            items:[
              {feeItemName:'干线物流费',currency:'EUR',originalAmount:824.25,amount:6470.36,billingTime:'05-12 10:25'}
            ]}
        ]},
      {id:3,billNo:'BL-20260516-001',customerName:'上海DEF电商',customerId:3,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:235.5,receivableTotal:1848.68,receivedAmount:0,cancelReason:'',
        feeSheetCount:1,
        status:'draft',remark:'',createdBy:'Jack.陈明',
        createdAt:'2026-05-16 14:00',sentAt:'',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:0,count:0},
          {key:'other',amount:1848.68,count:1}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-002',category:'operation',operationType:'vas',sheetType:'order',sourceNo:'TRK-2026-003',warehouseName:'波兰海外仓',receivableAmount:1848.68,
            items:[
              {feeItemName:'质检服务费',currency:'EUR',originalAmount:235.5,amount:1848.68,billingTime:'05-13 11:35'}
            ]}
        ]},
      {id:4,billNo:'BL-20260517-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:549.5,receivableTotal:4313.58,receivedAmount:0,cancelReason:'',
        feeSheetCount:1,
        status:'draft',remark:'含仓储费',createdBy:'Kevin.王磊',
        createdAt:'2026-05-17 08:30',sentAt:'',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:4313.58,count:1},
          {key:'order',amount:0,count:0},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-001',category:'storage',operationType:'',sheetType:'storage_cycle',sourceNo:'',warehouseName:'波兰海外仓',receivableAmount:4313.58,
            items:[
              {feeItemName:'基础仓储费',currency:'EUR',originalAmount:392.5,amount:3081.13,billingTime:'05-13 16:50'},
              {feeItemName:'旺季附加费',currency:'EUR',originalAmount:157,amount:1232.45,billingTime:'05-13 16:52'}
            ]}
        ]},
      {id:5,billNo:'BL-20260518-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:274.75,receivableTotal:2156.79,receivedAmount:0,cancelReason:'',
        feeSheetCount:1,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-18 09:30',sentAt:'2026-05-18 15:00',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:2156.79,count:1},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:0,count:0},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260515-001',category:'operation',operationType:'inbound',sheetType:'return_inbound',sourceNo:'Y202605150001E',warehouseName:'波兰海外仓',receivableAmount:2156.79,
            items:[
              {feeItemName:'入库操作费',currency:'EUR',originalAmount:196.25,amount:1540.56,billingTime:'05-15 09:35'},
              {feeItemName:'检验费',currency:'EUR',originalAmount:78.5,amount:616.23,billingTime:'05-15 09:40'}
            ]}
        ]}
    ];
  }

  const bills=buildBillData();
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
    let html=renderCatTabs();
    if(activeTab==='all'){
      const sheets=currentBill.feeSheets;
      const subtotal=sheets.reduce((s,fs)=>s+fs.receivableAmount,0);
      html+='<div class="type-header"><span class="type-title">全部费用明细</span><span class="type-subtotal">小计 ¥'+fmtAmt(subtotal)+'</span></div>';
      if(!sheets.length){
        html+='<div style="text-align:center;padding:40px;color:var(--text-muted)">暂无费用单</div>';
      }else{
        sheets.forEach((fs,idx)=>{
          html+=buildFeeSheetCard(fs,'all',idx);
        });
      }
    }else{
      html+=buildCategoryContent(activeTab);
    }
    tabContent.innerHTML=html;
  }

  function buildFeeSheetCard(fs,prefix,idx){
    let html='<div class="fee-sheet-card">';
    html+='<div class="fee-sheet-header" data-toggle-sheet="'+prefix+'-'+idx+'">';
    html+='<div class="fee-sheet-meta">';
    html+='<span class="expand-icon collapsed" id="expandIcon-'+prefix+'-'+idx+'">▶</span>';
    html+='<span class="sheet-no">'+escapeHtml(fs.feeNo)+'</span>';
    html+='<span class="sheet-desc">'+(fs.sourceNo?escapeHtml(fs.sourceNo)+' · ':'')+escapeHtml(fs.warehouseName)+'</span>';
    html+='</div>';
    html+='<span class="fee-sheet-amount">€'+fmtAmt(fs.receivableAmount/currentBill.exchangeRate)+' / ¥'+fmtAmt(fs.receivableAmount)+'</span>';
    html+='</div>';
    html+='<div class="fee-sheet-body" id="sheetBody-'+prefix+'-'+idx+'" style="display:none">';
    html+='<table class="fee-items-table"><thead><tr><th>费用项</th><th style="width:60px">币种</th><th style="width:90px" class="amount-right">原币金额</th><th style="width:90px" class="amount-right">折算金额</th><th style="width:80px">计费时间</th><th style="width:100px">备注</th></tr></thead><tbody>';
    fs.items.forEach(it=>{
      html+='<tr><td>'+escapeHtml(it.feeItemName)+'</td><td>'+escapeHtml(it.currency)+'</td><td class="amount-right">'+(it.originalAmount!=null?fmtAmt(it.originalAmount):'—')+'</td><td class="amount-right">¥'+fmtAmt(it.amount)+'</td><td>'+escapeHtml(it.billingTime)+'</td><td style="color:var(--color-text-tertiary)">'+escapeHtml(it.remark||'—')+'</td></tr>';
    });
    html+='</tbody></table></div></div>';
    return html;
  }

  function buildCategoryContent(categoryKey){
    const label=CAT_LABELS[categoryKey]||categoryKey;
    const sheets=getFeeSheetsByCategory(currentBill,categoryKey);
    const subtotal=sheets.reduce((s,fs)=>s+fs.receivableAmount,0);
    let html='<div class="type-header"><span class="type-title">'+label+'明细</span><span class="type-subtotal">小计 ¥'+fmtAmt(subtotal)+'</span></div>';
    if(!sheets.length){
      html+='<div style="text-align:center;padding:40px;color:var(--text-muted)">暂无该类型费用单</div>';
    }else{
      sheets.forEach((fs,idx)=>{
        html+=buildFeeSheetCard(fs,categoryKey,idx);
      });
    }
    return html;
  }

  function renderAll(){
    currentBill=getBillFromUrl();
    renderTopBar();
    renderStatusBanner();
    renderBillInfo();
    renderCurrencyCard();
    renderContent();
    if(isPreview){
      billDetailPage.classList.add('preview-mode');
      document.body.classList.add('preview-active');
    }else{
      billDetailPage.classList.remove('preview-mode');
      document.body.classList.remove('preview-active');
    }
  }

  tabContent.addEventListener('click',e=>{
    const cat=e.target.closest('[data-cat]');
    if(cat){
      activeTab=cat.dataset.cat;
      renderContent();
      return;
    }
    const header=e.target.closest('[data-toggle-sheet]');
    if(!header)return;
    const key=header.dataset.toggleSheet;
    const body=document.getElementById('sheetBody-'+key);
    const icon=document.getElementById('expandIcon-'+key);
    if(!body)return;
    const expanded=body.style.display!=='none';
    body.style.display=expanded?'none':'block';
    icon.textContent=expanded?'▶':'▼';
    icon.className=expanded?'expand-icon collapsed':'expand-icon';
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
