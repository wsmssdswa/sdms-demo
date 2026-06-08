(()=>{
  const keywordInput=document.getElementById('keywordInput');
  const statusSelect=document.getElementById('statusSelect');
  const customerSelect=document.getElementById('customerSelect');
  const periodSelect=document.getElementById('periodSelect');
  const queryBtn=document.getElementById('queryBtn');
  const resetBtn=document.getElementById('resetBtn');
  const statusTabs=document.getElementById('statusTabs');
  const billBody=document.getElementById('billBody');
  const billCount=document.getElementById('billCount');
  const checkAll=document.getElementById('checkAll');
  const batchSendBtn=document.getElementById('batchSendBtn');
  const exportBtn=document.getElementById('exportBtn');
  const selectedHint=document.getElementById('selectedHint');
  const withdrawModal=document.getElementById('withdrawModal');
  const withdrawBillInfo=document.getElementById('withdrawBillInfo');
  const withdrawReason=document.getElementById('withdrawReason');
  const withdrawCancelBtn=document.getElementById('withdrawCancelBtn');
  const withdrawConfirmBtn=document.getElementById('withdrawConfirmBtn');
  let pendingWithdrawId=null;

  const STATUS_MAP={
    draft:{label:'草稿',cls:'pending'},
    sent:{label:'已发送',cls:'active'},
    confirmed:{label:'已确认',cls:'success'},
    partially_received:{label:'部分收款',cls:'pending'},
    settled:{label:'已结清',cls:'success'},
    cancelled:{label:'已作废',cls:'inactive'}
  };
  const STATUS_TABS=[{key:'',label:'全部'},{key:'draft',label:'草稿'},{key:'sent',label:'已发送'},{key:'confirmed',label:'已确认'},{key:'partially_received',label:'部分收款'},{key:'settled',label:'已结清'},{key:'cancelled',label:'已作废'}];

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

  /* ---- Mock数据 ---- */
  function buildBillData(){
    return [
      {id:1,billNo:'BL-20260514-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:1856.25,receivableTotal:14571.56,receivedAmount:0,cancelReason:'',feeSheetCount:2,
        status:'confirmed',remark:'',createdBy:'Kevin.王磊',
        createdAt:'2026-05-14 10:00',sentAt:'2026-05-14 14:00',confirmedAt:'2026-05-15 09:00',
        categorySummary:[
          {key:'inbound',amount:5850.21,count:2},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:8721.35,count:2},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260510-001',sheetType:'order',sourceNo:'TRK-2026-001',warehouseName:'波兰海外仓',receivableAmount:1057.25,
            items:[
              {feeItemName:'卸货费',currency:'EUR',amount:314,billingTime:'05-10 14:35'},
              {feeItemName:'清点费',currency:'EUR',amount:39.25,billingTime:'05-10 14:36'},
              {feeItemName:'上架费',currency:'EUR',amount:392.5,billingTime:'05-10 14:38'},
              {feeItemName:'干线物流费',currency:'EUR',amount:785,billingTime:'05-11 09:30'}
            ]},
          {feeNo:'FS-20260514-002',sheetType:'stock_inbound',sourceNo:'STK-IN-20260514-001',warehouseName:'波兰海外仓',receivableAmount:510.25,
            items:[
              {feeItemName:'卸货费',currency:'EUR',amount:235.5,billingTime:'05-14 10:20'},
              {feeItemName:'清点费',currency:'EUR',amount:117.75,billingTime:'05-14 10:22'},
              {feeItemName:'上架费',currency:'EUR',amount:157,billingTime:'05-14 10:35'}
            ]}
        ]},
      {id:2,billNo:'BL-20260515-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:1020.5,receivableTotal:8010.93,receivedAmount:8010.93,cancelReason:'',feeSheetCount:2,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-15 11:00',sentAt:'2026-05-16 09:00',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:8010.93,count:2},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260512-001',category:'operation',operationType:'outbound',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:196.25,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',amount:196.25,billingTime:'05-12 10:20'}
            ]},
          {feeNo:'FS-20260512-001b',category:'logistics',operationType:'',sheetType:'order',sourceNo:'TRK-2026-002',warehouseName:'德国海外仓',receivableAmount:824.25,
            items:[
              {feeItemName:'干线物流费',currency:'EUR',amount:824.25,billingTime:'05-12 10:25'}
            ]}
        ]},
      {id:3,billNo:'BL-20260516-001',customerName:'上海DEF电商',customerId:3,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:235.5,receivableTotal:1848.68,receivedAmount:0,cancelReason:'',feeSheetCount:1,
        status:'draft',remark:'',createdBy:'Jack.陈明',
        createdAt:'2026-05-16 14:00',sentAt:'',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:0,count:0},
          {key:'other',amount:1848.68,count:1}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-002',sheetType:'order',sourceNo:'TRK-2026-003',warehouseName:'波兰海外仓',receivableAmount:235.5,
            items:[
              {feeItemName:'质检服务费',currency:'EUR',amount:235.5,billingTime:'05-13 11:35'}
            ]}
        ]},
      {id:4,billNo:'BL-20260517-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:549.5,receivableTotal:4313.58,receivedAmount:0,cancelReason:'',feeSheetCount:1,
        status:'draft',remark:'含仓储费',createdBy:'Kevin.王磊',
        createdAt:'2026-05-17 08:30',sentAt:'',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:4313.58,count:1},
          {key:'order',amount:0,count:0},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260513-001',sheetType:'storage_cycle',sourceNo:'',warehouseName:'波兰海外仓',receivableAmount:549.5,
            items:[
              {feeItemName:'基础仓储费',currency:'EUR',amount:392.5,billingTime:'05-13 16:50'},
              {feeItemName:'旺季附加费',currency:'EUR',amount:157,billingTime:'05-13 16:52'}
            ]}
        ]},
      {id:5,billNo:'BL-20260518-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-05-01',periodEnd:'2026-05-31',periodLabel:'2026年5月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:274.75,receivableTotal:2156.79,receivedAmount:0,cancelReason:'',feeSheetCount:1,
        status:'sent',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-18 09:30',sentAt:'2026-05-18 15:00',confirmedAt:'',
        categorySummary:[
          {key:'inbound',amount:2156.79,count:1},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:0,count:0},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260515-001',sheetType:'return_inbound',sourceNo:'Y202605150001E',warehouseName:'波兰海外仓',receivableAmount:274.75,
            items:[
              {feeItemName:'入库操作费',currency:'EUR',amount:196.25,billingTime:'05-15 09:35'},
              {feeItemName:'检验费',currency:'EUR',amount:78.5,billingTime:'05-15 09:40'}
            ]}
        ]},
      {id:6,billNo:'BL-20260519-001',customerName:'深圳ABC贸易',customerId:1,
        periodStart:'2026-04-01',periodEnd:'2026-04-30',periodLabel:'2026年4月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:628,receivableTotal:4931.80,receivedAmount:3000,cancelReason:'',feeSheetCount:2,
        status:'partially_received',remark:'',createdBy:'Kevin.王磊',
        createdAt:'2026-05-19 10:00',sentAt:'2026-05-19 14:00',confirmedAt:'2026-05-20 09:00',
        categorySummary:[
          {key:'inbound',amount:2465.90,count:1},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:2465.90,count:1},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260516-001',sheetType:'stock_inbound',sourceNo:'STK-IN-20260516-001',warehouseName:'波兰海外仓',receivableAmount:314,
            items:[
              {feeItemName:'卸货费',currency:'EUR',amount:196.25,billingTime:'05-16 10:20'},
              {feeItemName:'清点费',currency:'EUR',amount:117.75,billingTime:'05-16 10:22'}
            ]},
          {feeNo:'FS-20260517-001',sheetType:'order',sourceNo:'TRK-2026-004',warehouseName:'波兰海外仓',receivableAmount:314,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',amount:196.25,billingTime:'05-17 09:30'},
              {feeItemName:'打包费',currency:'EUR',amount:117.75,billingTime:'05-17 09:35'}
            ]}
        ]},
      {id:7,billNo:'BL-20260520-001',customerName:'杭州XYZ物流',customerId:2,
        periodStart:'2026-03-01',periodEnd:'2026-03-31',periodLabel:'2026年3月',
        currency:'CNY',settlementCurrency:'CNY',exchangeRate:7.85,originalTotal:392.5,receivableTotal:3081.13,receivedAmount:3081.13,cancelReason:'',feeSheetCount:1,
        status:'settled',remark:'',createdBy:'Amy.李婷',
        createdAt:'2026-05-20 08:00',sentAt:'2026-05-20 11:00',confirmedAt:'2026-05-21 09:00',
        categorySummary:[
          {key:'inbound',amount:0,count:0},
          {key:'storage',amount:0,count:0},
          {key:'order',amount:3081.13,count:1},
          {key:'other',amount:0,count:0}
        ],
        feeSheets:[
          {feeNo:'FS-20260518-001',sheetType:'order',sourceNo:'TRK-2026-005',warehouseName:'德国海外仓',receivableAmount:392.5,
            items:[
              {feeItemName:'出库操作费',currency:'EUR',amount:196.25,billingTime:'05-18 10:20'},
              {feeItemName:'干线物流费',currency:'EUR',amount:196.25,billingTime:'05-18 10:25'}
            ]}
        ]}
    ];
  }

  let bills=buildBillData();
  const state={keyword:'',status:'',customer:'',period:'',statusTab:'',selectedIds:new Set()};

  /* ---- 筛选 ---- */
  function getFilteredBills(){
    return bills.filter(bill=>{
      if(state.keyword){
        const kw=state.keyword.toLowerCase();
        if(!bill.billNo.toLowerCase().includes(kw)&&!bill.customerName.toLowerCase().includes(kw))return false;
      }
      if(state.status&&bill.status!==state.status)return false;
      if(state.customer&&bill.customerName!==state.customer)return false;
      if(state.period&&bill.periodStart.substring(0,7)!==state.period)return false;
      if(state.statusTab&&bill.status!==state.statusTab)return false;
      return true;
    });
  }

  /* ---- 渲染 ---- */
  function renderStatusTabs(){
    statusTabs.innerHTML=STATUS_TABS.map(tab=>{
      const count=tab.key===''?bills.length:bills.filter(b=>b.status===tab.key).length;
      return '<button type="button" class="scene-tab'+(state.statusTab===tab.key?' active':'')+'" data-tab="'+tab.key+'">'+tab.label+'('+count+')</button>';
    }).join('');
  }

  function updateSelectedHint(){
    selectedHint.textContent=state.selectedIds.size?'已选 '+state.selectedIds.size+' 条':'';
    const checkable=getFilteredBills().filter(b=>b.status==='draft'||b.status==='sent');
    checkAll.checked=checkable.length>0&&checkable.every(b=>state.selectedIds.has(b.id));
  }

  function render(){
    const filtered=getFilteredBills();
    if(!filtered.length){
      billBody.innerHTML='<tr class="empty-row"><td colspan="13" style="text-align:center;padding:40px;color:var(--text-muted)">暂无账单</td></tr>';
      billCount.textContent='';
    }else{
      billBody.innerHTML=filtered.map((bill)=>{
        const st=STATUS_MAP[bill.status]||{label:bill.status,cls:'pending'};
        const canCheck=bill.status==='draft'||bill.status==='sent';
        const checked=state.selectedIds.has(bill.id)?'checked':'';
        const disabled=canCheck?'':'disabled';
        let actions='<a href="javascript:void(0)" class="action-link" data-action="view" data-id="'+bill.id+'">查看</a>';
        if(bill.status==='draft') actions+=' <a href="javascript:void(0)" class="action-link" data-action="send" data-id="'+bill.id+'">发送</a>';
        if(bill.status==='sent') actions+=' <a href="javascript:void(0)" class="action-link" data-action="confirm" data-id="'+bill.id+'">确认</a>';
        if(bill.status==='draft'||bill.status==='sent') actions+=' <a href="javascript:void(0)" class="action-link danger" data-action="withdraw" data-id="'+bill.id+'">撒回</a>';
        const unpaid=bill.receivableTotal-bill.receivedAmount;
        return '<tr>'
          +'<td class="check-cell"><input type="checkbox" data-check-id="'+bill.id+'" '+checked+' '+disabled+'></td>'
          +'<td><a class="name-link" href="./bill-detail.html?id='+bill.id+'">'+escapeHtml(bill.billNo)+'</a></td>'
          +'<td>'+escapeHtml(bill.customerName)+'</td>'
          +'<td>'+escapeHtml(bill.periodLabel)+'</td>'
          +'<td class="amount-cell">¥'+fmtAmt(bill.receivableTotal)+'</td>'
          +'<td style="text-align:center">'+escapeHtml(bill.settlementCurrency)+'</td>'
          +'<td class="amount-cell">'+bill.exchangeRate.toFixed(2)+'</td>'
          +'<td class="amount-unpaid'+(unpaid<=0?' settled':'')+'">¥'+fmtAmt(unpaid)+'</td>'
          +'<td style="text-align:center">'+bill.feeSheetCount+'</td>'
          +'<td>'+escapeHtml(bill.createdBy)+'</td>'
          +'<td>'+escapeHtml(bill.createdAt)+'</td>'
          +'<td><span class="status-tag '+st.cls+'">'+st.label+'</span></td>'
          +'<td><div class="action-group">'+actions+'</div></td>'
        +'</tr>';
      }).join('');
      billCount.textContent='共 '+filtered.length+' 条';
    }
    renderStatusTabs();
    updateSelectedHint();
  }

  /* ---- 事件 ---- */
  queryBtn.addEventListener('click',()=>{
    state.keyword=keywordInput.value.trim();
    state.status=statusSelect.value;
    state.customer=customerSelect.value;
    state.period=periodSelect.value;
    render();
  });

  resetBtn.addEventListener('click',()=>{
    state.keyword='';state.status='';state.customer='';state.period='';state.statusTab='';state.selectedIds.clear();
    keywordInput.value='';statusSelect.value='';customerSelect.value='';periodSelect.value='';
    render();
  });

  keywordInput.addEventListener('keydown',e=>{if(e.key==='Enter')queryBtn.click();});

  statusTabs.addEventListener('click',e=>{
    const btn=e.target.closest('[data-tab]');
    if(!btn)return;
    state.statusTab=btn.dataset.tab;
    render();
  });

  checkAll.addEventListener('change',()=>{
    const checkable=getFilteredBills().filter(b=>b.status==='draft'||b.status==='sent');
    if(checkAll.checked) checkable.forEach(b=>state.selectedIds.add(b.id));
    else checkable.forEach(b=>state.selectedIds.delete(b.id));
    render();
  });

  billBody.addEventListener('change',e=>{
    const cb=e.target.closest('[data-check-id]');
    if(!cb)return;
    const id=Number(cb.dataset.checkId);
    if(cb.checked) state.selectedIds.add(id); else state.selectedIds.delete(id);
    updateSelectedHint();
    const checkable=getFilteredBills().filter(b=>b.status==='draft'||b.status==='sent');
    checkAll.checked=checkable.length>0&&checkable.every(b=>state.selectedIds.has(b.id));
  });

  /* 行操作 */
  billBody.addEventListener('click',e=>{
    const link=e.target.closest('[data-action]');
    if(!link)return;
    const action=link.dataset.action;
    const id=Number(link.dataset.id);
    if(action==='view'){
      window.location.href='./bill-detail.html?id='+id;
    }else if(action==='send'){
      const bill=bills.find(b=>b.id===id);
      if(bill){bill.status='sent';bill.sentAt=new Date().toISOString().replace('T',' ').substring(0,16);state.selectedIds.delete(id);render();showToast('success','已发送','账单'+bill.billNo+'已发送给客户');}
    }else if(action==='confirm'){
      const bill=bills.find(b=>b.id===id);
      if(bill){bill.status='confirmed';bill.confirmedAt=new Date().toISOString().replace('T',' ').substring(0,16);state.selectedIds.delete(id);render();showToast('success','已确认','账单'+bill.billNo+'客户已确认');}
    }else if(action==='withdraw'){
      pendingWithdrawId=id;
      const bill=bills.find(b=>b.id===id);
      if(!bill)return;
      withdrawBillInfo.textContent='账单号：'+bill.billNo;
      withdrawReason.value='';
      withdrawModal.style.display='flex';
    }
  });

  /* 批量发送 */
  batchSendBtn.addEventListener('click',()=>{
    if(!state.selectedIds.size){showToast('warning','请选择','请勾选需要发送的账单');return;}
    const targets=bills.filter(b=>state.selectedIds.has(b.id)&&b.status==='draft');
    if(!targets.length){showToast('warning','无法发送','选中的账单中没有草稿状态');return;}
    const now=new Date().toISOString().replace('T',' ').substring(0,16);
    targets.forEach(b=>{b.status='sent';b.sentAt=now;});
    state.selectedIds.clear();
    render();
    showToast('success','批量发送成功','已发送'+targets.length+'条账单');
  });

  /* 导出（模拟） */
  exportBtn.addEventListener('click',()=>{
    showToast('info','导出','导出功能开发中');
  });

  /* 撒回弹窗 */
  withdrawCancelBtn.addEventListener('click',()=>{
    withdrawModal.style.display='none';
    pendingWithdrawId=null;
  });
  withdrawConfirmBtn.addEventListener('click',()=>{
    if(!withdrawReason.value.trim()){showToast('warning','请填写原因','撒回原因为必填项');return;}
    const bill=bills.find(b=>b.id===pendingWithdrawId);
    if(bill){
      bill.status='cancelled';
      bill.cancelReason=withdrawReason.value.trim();
      state.selectedIds.delete(bill.id);
      render();
      showToast('success','已作废','账单'+bill.billNo+'已作废');
    }
    withdrawModal.style.display='none';
    pendingWithdrawId=null;
  });

  render();
})();
