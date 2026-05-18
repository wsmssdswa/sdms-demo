(()=>{
  const billDetailPage=document.getElementById('billDetailPage');
  const breadcrumbNo=document.getElementById('breadcrumbNo');
  const statusBanner=document.getElementById('statusBanner');
  const billInfo=document.getElementById('billInfo');
  const detailTabs=document.getElementById('detailTabs');
  const tabContent=document.getElementById('tabContent');
  const sendBtn=document.getElementById('sendBtn');
  const confirmBtn=document.getElementById('confirmBtn');
  const withdrawBtn=document.getElementById('withdrawBtn');
  const previewBtn=document.getElementById('previewBtn');
  const exitPreviewBtn=document.getElementById('exitPreviewBtn');

  const STATUS_MAP={
    draft:{label:'草稿',cls:'draft'},
    sent:{label:'已发送',cls:'sent'},
    confirmed:{label:'已确认',cls:'confirmed'}
  };
  const CATEGORY_TABS=[
    {key:'summary',label:'汇总'},
    {key:'logistics',label:'物流费'},
    {key:'storage',label:'仓储费'},
    {key:'operation_inbound',label:'入仓费'},
    {key:'operation_outbound',label:'出库费'},
    {key:'operation_vas',label:'增值服务费'},
    {key:'operation_other',label:'其他费'}
  ];
  const CAT_LABELS={logistics:'物流费',storage:'仓储费',operation_inbound:'入仓费',operation_outbound:'出库费',operation_vas:'增值服务费',operation_other:'其他费'};

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
        currency:'CNY',receivableTotal:1856.25,feeSheetCount:2,
        status:'confirmed',remark:'',createdBy:'Kevin.王磊',
        createdAt:'2026-05-14 10:00',sentAt:'2026-05-14 14:00',confirmedAt:'2026-05-15 09:00',
        categorySummary:[
          {key:'logistics',amount:785,count:1},
          {key:'storage',amount:0,count:0},
          {key:'operation_inbound',amount:745.25,count:2},
          {key:'operation_outbound',amount:326,count:1},
          {key:'operation_vas',amount:0,count:0},
          {key:'operation_other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260510-001',category:'operation',operationType:'inbound',sheetType:'order',sourceNo:'TRK-2026-001',warehouseName:'波兰海外仓',receivableAmount:1057.25,
            items:[
              {feeItemName:'卸货费',currency:'EUR',amount:314,billingTime:'05-10 14:35'},
              {feeItemName:'清点费',currency:'EUR',amount:39.25,billingTime:'05-10 14:36'},
              {feeItemName:'上架费',currency:'EUR',amount:392.5,billingTime:'05-10 14:38'},
              {feeItemName:'干线物流费',currency:'EUR',amount:785,billingTime:'05-11 09:30'}
            ]},
          {feeNo:'FS-20260514-002',category:'operation',operationType:'inbound',sheetType:'stock_inbound',sourceNo:'STK-IN-20260514-001',warehouseName:'波兰海外仓',receivableAmount:510.25,
            items:[
              {feeItemName:'卸货费',currency:'EUR',amount:235.5,billingTime:'05-14 10:20'},
              {feeItemName:'清点费',currency:'EUR',amount:117.75,billingTime:'05-14 10:22'},
              {feeItemName:'上架费',currency:'EUR',amount:157,billingTime:'05-14 10:35'}
            ]}
        ]},
      {id:2,billNo:'BL-20260515-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',receivableTotal:1020.5,feeSheetCount:2,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-15 11:00',sentAt:'2026-05-16 09:00',confirmedAt:'',
        categorySummary:[
          {key:'logistics',amount:824.25,count:1},
          {key:'storage',amount:0,count:0},
          {key:'operation_inbound',amount:0,count:0},
          {key:'operation_outbound',amount:196.25,count:1},
          {key:'operation_vas',amount:0,count:0},
          {key:'operation_other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260512-001',category:'operation',operationType:'outbound',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:196.25,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',amount:196.25,billingTime:'05-12 10:20'}
            ]},
          {feeNo:'FS-20260512-001-L',category:'logistics',operationType:'',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:824.25,
            items:[
              {feeItemName:'干线物流费',currency:'EUR',amount:824.25,billingTime:'05-12 10:25'}
            ]}
        ]},
      {id:3,billNo:'BL-20260516-001',customerName:'上海DEF电商',customerId:3,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',receivableTotal:235.5,feeSheetCount:1,
        status:'draft',remark:'',createdBy:'Jack.陈明',
        createdAt:'2026-05-16 14:00',sentAt:'',confirmedAt:'',
        categorySummary:[
          {key:'logistics',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'operation_inbound',amount:0,count:0},
          {key:'operation_outbound',amount:0,count:0},
          {key:'operation_vas',amount:235.5,count:1},
          {key:'operation_other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-002',category:'operation',operationType:'vas',sheetType:'order',sourceNo:'TRK-2026-003',warehouseName:'波兰海外仓',receivableAmount:235.5,
            items:[
              {feeItemName:'质检服务费',currency:'EUR',amount:235.5,billingTime:'05-13 11:35'}
            ]}
        ]},
      {id:4,billNo:'BL-20260517-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',receivableTotal:549.5,feeSheetCount:1,
        status:'draft',remark:'含仓储费',createdBy:'Kevin.王磊',
        createdAt:'2026-05-17 08:30',sentAt:'',confirmedAt:'',
        categorySummary:[
          {key:'logistics',amount:0,count:0},
          {key:'storage',amount:549.5,count:1},
          {key:'operation_inbound',amount:0,count:0},
          {key:'operation_outbound',amount:0,count:0},
          {key:'operation_vas',amount:0,count:0},
          {key:'operation_other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-001',category:'storage',operationType:'',sheetType:'storage_cycle',sourceNo:'',warehouseName:'波兰海外仓',receivableAmount:549.5,
            items:[
              {feeItemName:'基础仓储费',currency:'EUR',amount:392.5,billingTime:'05-13 16:50'},
              {feeItemName:'旺季附加费',currency:'EUR',amount:157,billingTime:'05-13 16:52'}
            ]}
        ]},
      {id:5,billNo:'BL-20260518-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',receivableTotal:274.75,feeSheetCount:1,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-18 09:30',sentAt:'2026-05-18 15:00',confirmedAt:'',
        categorySummary:[
          {key:'logistics',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'operation_inbound',amount:274.75,count:1},
          {key:'operation_outbound',amount:0,count:0},
          {key:'operation_vas',amount:0,count:0},
          {key:'operation_other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260515-001',category:'operation',operationType:'inbound',sheetType:'return_inbound',sourceNo:'Y202605150001E',warehouseName:'波兰海外仓',receivableAmount:274.75,
            items:[
              {feeItemName:'入库操作费',currency:'EUR',amount:196.25,billingTime:'05-15 09:35'},
              {feeItemName:'检验费',currency:'EUR',amount:78.5,billingTime:'05-15 09:40'}
            ]}
        ]}
    ];
  }

  const bills=buildBillData();
  let currentBill=null;
  let activeTab='summary';
  let isPreview=false;

  function getBillFromUrl(){
    const params=new URLSearchParams(window.location.search);
    const id=Number(params.get('id'));
    return bills.find(b=>b.id===id)||bills[0];
  }

  function getFeeSheetCategoryKey(fs){
    if(fs.category==='logistics') return 'logistics';
    if(fs.category==='storage') return 'storage';
    if(fs.category==='operation'){
      const ot=fs.operationType||'other';
      if(ot==='inbound') return 'operation_inbound';
      if(ot==='outbound') return 'operation_outbound';
      if(ot==='vas') return 'operation_vas';
      return 'operation_other';
    }
    return 'operation_other';
  }

  function getFeeSheetsByCategory(bill,categoryKey){
    if(categoryKey==='summary') return [];
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
    sendBtn.style.display=currentBill.status==='draft'?'':'none';
    confirmBtn.style.display=currentBill.status==='sent'?'':'none';
    withdrawBtn.style.display=currentBill.status!=='confirmed'?'':'none';
    previewBtn.style.display=isPreview?'none':'';
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

  function renderTabs(){
    if(!currentBill)return;
    detailTabs.innerHTML=CATEGORY_TABS.map(tab=>{
      let badge='';
      if(tab.key!=='summary'){
        const count=getCategoryCount(currentBill,tab.key);
        badge='<span class="tab-badge">'+count+'</span>';
      }
      return '<button type="button" class="detail-tab'+(activeTab===tab.key?' active':'')+'" data-tab="'+tab.key+'">'+tab.label+badge+'</button>';
    }).join('');
  }

  function renderSummaryTab(){
    if(!currentBill)return;
    let html='<div class="total-card"><div class="total-label">应收总额</div><div class="total-amount">¥'+fmtAmt(currentBill.receivableTotal)+'</div></div>';
    html+='<div class="category-grid">';
    ['logistics','storage','operation_inbound','operation_outbound','operation_vas','operation_other'].forEach(key=>{
      const amt=getCategoryTotal(currentBill,key);
      const cnt=getCategoryCount(currentBill,key);
      html+='<div class="category-card"><div class="cat-name">'+CAT_LABELS[key]+'</div><div class="cat-amount">¥'+fmtAmt(amt)+'</div><div class="cat-count">'+cnt+'条费用单</div></div>';
    });
    html+='</div>';
    tabContent.innerHTML=html;
  }

  function renderCategoryTab(categoryKey){
    if(!currentBill)return;
    const label=CAT_LABELS[categoryKey]||categoryKey;
    const sheets=getFeeSheetsByCategory(currentBill,categoryKey);
    const subtotal=sheets.reduce((s,fs)=>s+fs.receivableAmount,0);

    let html='<div class="type-header"><span class="type-title">'+label+'明细</span><span class="type-subtotal">小计 ¥'+fmtAmt(subtotal)+'</span></div>';

    if(!sheets.length){
      html+='<div style="text-align:center;padding:40px;color:var(--text-muted)">暂无该类型费用单</div>';
    }else{
      sheets.forEach((fs,idx)=>{
        html+='<div class="fee-sheet-card">';
        html+='<div class="fee-sheet-header" data-toggle-sheet="'+categoryKey+'-'+idx+'">';
        html+='<div class="fee-sheet-meta">';
        html+='<span class="expand-icon collapsed" id="expandIcon-'+categoryKey+'-'+idx+'">▶</span>';
        html+='<span class="sheet-no">'+escapeHtml(fs.feeNo)+'</span>';
        html+='<span class="sheet-desc">'+(fs.sourceNo?escapeHtml(fs.sourceNo)+' · ':'')+escapeHtml(fs.warehouseName)+'</span>';
        html+='</div>';
        html+='<span class="fee-sheet-amount">¥'+fmtAmt(fs.receivableAmount)+'</span>';
        html+='</div>';
        html+='<div class="fee-sheet-body" id="sheetBody-'+categoryKey+'-'+idx+'" style="display:none">';
        html+='<table class="fee-items-table"><thead><tr><th>费用项</th><th style="width:60px">币种</th><th style="width:90px" class="amount-right">金额</th><th style="width:80px">计费时间</th><th style="width:100px">备注</th></tr></thead><tbody>';
        fs.items.forEach(it=>{
          html+='<tr><td>'+escapeHtml(it.feeItemName)+'</td><td>'+escapeHtml(it.currency)+'</td><td class="amount-right">¥'+fmtAmt(it.amount)+'</td><td>'+escapeHtml(it.billingTime)+'</td><td style="color:#999">'+escapeHtml(it.remark||'—')+'</td></tr>';
        });
        html+='</tbody></table></div></div>';
      });
    }
    tabContent.innerHTML=html;
  }

  function renderContent(){
    if(activeTab==='summary') renderSummaryTab();
    else renderCategoryTab(activeTab);
  }

  function renderAll(){
    currentBill=getBillFromUrl();
    renderTopBar();
    renderStatusBanner();
    renderBillInfo();
    renderTabs();
    renderContent();
    if(isPreview){
      billDetailPage.classList.add('preview-mode');
      document.body.classList.add('preview-active');
    }else{
      billDetailPage.classList.remove('preview-mode');
      document.body.classList.remove('preview-active');
    }
  }

  detailTabs.addEventListener('click',e=>{
    const tab=e.target.closest('[data-tab]');
    if(!tab)return;
    activeTab=tab.dataset.tab;
    renderTabs();
    renderContent();
  });

  tabContent.addEventListener('click',e=>{
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
    if(!confirm('确定撒回账单'+currentBill.billNo+'吗？'))return;
    currentBill.status='draft';
    currentBill.sentAt='';
    currentBill.confirmedAt='';
    renderAll();
    showToast('success','已撒回','账单已撒回');
  });

  previewBtn.addEventListener('click',()=>{
    isPreview=true;
    renderAll();
  });

  exitPreviewBtn.addEventListener('click',()=>{
    isPreview=false;
    renderAll();
  });

  renderAll();
})();
