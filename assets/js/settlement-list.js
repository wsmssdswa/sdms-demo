(()=>{
  const keywordInput=document.getElementById('keywordInput');
  const customerSelect=document.getElementById('customerSelect');
  const dateFrom=document.getElementById('dateFrom');
  const dateTo=document.getElementById('dateTo');
  const queryBtn=document.getElementById('queryBtn');
  const resetBtn=document.getElementById('resetBtn');
  const statusTabs=document.getElementById('statusTabs');
  const settlementBody=document.getElementById('settlementBody');
  const settlementCount=document.getElementById('settlementCount');
  const checkAll=document.getElementById('checkAll');
  const batchCancelBtn=document.getElementById('batchCancelBtn');
  const newSettlementBtn=document.getElementById('newSettlementBtn');
  const selectedHint=document.getElementById('selectedHint');

  /* 取消弹窗 */
  const cancelModal=document.getElementById('cancelModal');
  const cancelInfo=document.getElementById('cancelInfo');
  const cancelReason=document.getElementById('cancelReason');
  const cancelCancelBtn=document.getElementById('cancelCancelBtn');
  const cancelConfirmBtn=document.getElementById('cancelConfirmBtn');
  let pendingCancelIds=[];

  /* 新建弹窗 */
  const newModal=document.getElementById('newModal');
  const newCancelBtn=document.getElementById('newCancelBtn');
  const newConfirmBtn=document.getElementById('newConfirmBtn');

  const STATUS_MAP={
    pending:{label:'待核销',cls:'pending'},
    confirmed:{label:'已核销',cls:'active'},
    cancelled:{label:'已取消',cls:'inactive'},
    reversed:{label:'已冲销',cls:'inactive'}
  };
  const STATUS_TABS=[
    {key:'',label:'全部'},
    {key:'pending',label:'待核销'},
    {key:'confirmed',label:'已核销'},
    {key:'cancelled',label:'已取消'},
    {key:'reversed',label:'已冲销'}
  ];
  const PAYMENT_METHOD_MAP={
    tt:'TT电汇',transfer:'银行转账',cheque:'支票',cash:'现金',lc:'信用证',online:'在线支付'
  };
  const CURRENCY_MAP={
    CNY:{symbol:'¥',label:'人民币'},
    EUR:{symbol:'€',label:'欧元'},
    USD:{symbol:'$',label:'美元'},
    GBP:{symbol:'£',label:'英镑'}
  };

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
  function buildSeedData(){
    return [
      {id:1,settlementNo:'STL-20260520-001',customerName:'深圳ABC贸易',customerId:1,
        amount:14571.56,originalCurrency:'EUR',originalAmount:1856.25,
        receiptDate:'2026-05-20',paymentMethod:'tt',
        receivingAccount:'中行深圳 EUR 6225****8801',
        operator:'Kevin.王磊',createdAt:'2026-05-20 10:30',confirmedAt:'2026-05-20 14:00',
        remark:'',status:'confirmed',
        items:[{billNo:'BL-20260514-001',billId:1,amount:14571.56}]},
      {id:2,settlementNo:'STL-20260522-001',customerName:'杭州XYZ物流',customerId:2,
        amount:8010.93,originalCurrency:'EUR',originalAmount:1020.50,
        receiptDate:'2026-05-22',paymentMethod:'tt',
        receivingAccount:'中行深圳 EUR 6225****8801',
        operator:'Amy.李婷',createdAt:'2026-05-22 09:15',confirmedAt:'2026-05-22 11:00',
        remark:'',status:'confirmed',
        items:[{billNo:'BL-20260515-001',billId:2,amount:8010.93}]},
      {id:3,settlementNo:'STL-20260525-001',customerName:'深圳ABC贸易',customerId:1,
        amount:10000,originalCurrency:'EUR',originalAmount:1273.89,
        receiptDate:'2026-05-25',paymentMethod:'transfer',
        receivingAccount:'工行深圳 CNY 4000****3302',
        operator:'Kevin.王磊',createdAt:'2026-05-25 14:00',confirmedAt:'',
        remark:'先核销仓储费账单',status:'pending',
        items:[{billNo:'BL-20260517-001',billId:4,amount:4313.58}]},
      {id:4,settlementNo:'STL-20260526-001',customerName:'上海DEF电商',customerId:3,
        amount:1848.68,originalCurrency:'EUR',originalAmount:235.50,
        receiptDate:'2026-05-26',paymentMethod:'tt',
        receivingAccount:'中行深圳 EUR 6225****8801',
        operator:'Jack.陈明',createdAt:'2026-05-26 08:45',confirmedAt:'',
        remark:'',status:'pending',items:[]},
      {id:5,settlementNo:'STL-20260523-001',customerName:'杭州XYZ物流',customerId:2,
        amount:5000,originalCurrency:'EUR',originalAmount:636.94,
        receiptDate:'2026-05-23',paymentMethod:'tt',
        receivingAccount:'中行深圳 EUR 6225****8801',
        operator:'Amy.李婷',createdAt:'2026-05-23 16:30',confirmedAt:'',
        remark:'登记错误，客户实际未付款',status:'cancelled',items:[]},
      {id:6,settlementNo:'STL-20260526-002',customerName:'杭州XYZ物流',customerId:2,
        amount:2156.79,originalCurrency:'EUR',originalAmount:274.75,
        receiptDate:'2026-05-26',paymentMethod:'tt',
        receivingAccount:'中行深圳 EUR 6225****8801',
        operator:'Amy.李婷',createdAt:'2026-05-26 10:00',confirmedAt:'',
        remark:'',status:'pending',items:[]}
    ];
  }

  let settlements=buildSeedData();
  let nextId=7;
  const state={keyword:'',customer:'',dateFrom:'',dateTo:'',statusTab:'',selectedIds:new Set()};

  /* ---- 筛选 ---- */
  function getFilteredRows(){
    return settlements.filter(s=>{
      if(state.keyword){
        const kw=state.keyword.toLowerCase();
        if(!s.settlementNo.toLowerCase().includes(kw)&&!s.customerName.toLowerCase().includes(kw))return false;
      }
      if(state.customer&&s.customerName!==state.customer)return false;
      if(state.dateFrom&&s.receiptDate<state.dateFrom)return false;
      if(state.dateTo&&s.receiptDate>state.dateTo)return false;
      if(state.statusTab&&s.status!==state.statusTab)return false;
      return true;
    });
  }

  /* ---- 计算 ---- */
  function calcUnallocated(item){
    const allocated=item.items.reduce((sum,it)=>sum+it.amount,0);
    return item.amount-allocated;
  }

  /* ---- 渲染 ---- */
  function renderStatusTabs(){
    statusTabs.innerHTML=STATUS_TABS.map(tab=>{
      const count=tab.key===''?settlements.length:settlements.filter(s=>s.status===tab.key).length;
      return '<button type="button" class="scene-tab'+(state.statusTab===tab.key?' active':'')+'" data-tab="'+tab.key+'">'+tab.label+'('+count+')</button>';
    }).join('');
  }

  function updateSelectedHint(){
    selectedHint.textContent=state.selectedIds.size?'已选 '+state.selectedIds.size+' 条':'';
    const checkable=getFilteredRows().filter(s=>s.status==='pending');
    checkAll.checked=checkable.length>0&&checkable.every(s=>state.selectedIds.has(s.id));
  }

  function render(){
    const filtered=getFilteredRows();
    if(!filtered.length){
      settlementBody.innerHTML='<tr class="empty-row"><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">暂无结算单</td></tr>';
      settlementCount.textContent='';
    }else{
      settlementBody.innerHTML=filtered.map(s=>{
        const st=STATUS_MAP[s.status]||{label:s.status,cls:'pending'};
        const canCheck=s.status==='pending';
        const checked=state.selectedIds.has(s.id)?'checked':'';
        const disabled=canCheck?'':'disabled';
        const unalloc=calcUnallocated(s);
        const cur=CURRENCY_MAP[s.originalCurrency]||{symbol:'',label:s.originalCurrency};
        let actions='<a href="javascript:void(0)" class="action-link" data-action="view" data-id="'+s.id+'">查看</a>';
        if(s.status==='pending') actions+=' <a href="javascript:void(0)" class="action-link" data-action="confirm" data-id="'+s.id+'">核销</a>';
        if(s.status==='pending') actions+=' <a href="javascript:void(0)" class="action-link danger" data-action="cancel" data-id="'+s.id+'">取消</a>';
        return '<tr>'
          +'<td class="check-cell"><input type="checkbox" data-check-id="'+s.id+'" '+checked+' '+disabled+'></td>'
          +'<td><a class="name-link" href="./settlement-detail.html?id='+s.id+'">'+escapeHtml(s.settlementNo)+'</a></td>'
          +'<td>'+escapeHtml(s.customerName)+'</td>'
          +'<td class="amount-cell">¥'+fmtAmt(s.amount)+'</td>'
          +'<td>'+cur.symbol+fmtAmt(s.originalAmount)+' '+s.originalCurrency+'</td>'
          +'<td>'+(PAYMENT_METHOD_MAP[s.paymentMethod]||s.paymentMethod)+'</td>'
          +'<td>'+escapeHtml(s.receiptDate)+'</td>'
          +'<td class="amount-unpaid'+(unalloc<=0?' settled':'')+'">¥'+fmtAmt(unalloc)+'</td>'
          +'<td><span class="status-tag '+st.cls+'">'+st.label+'</span></td>'
          +'<td><div class="action-group">'+actions+'</div></td>'
        +'</tr>';
      }).join('');
      settlementCount.textContent='共 '+filtered.length+' 条';
    }
    renderStatusTabs();
    updateSelectedHint();
  }

  /* ---- 事件 ---- */
  queryBtn.addEventListener('click',()=>{
    state.keyword=keywordInput.value.trim();
    state.customer=customerSelect.value;
    state.dateFrom=dateFrom.value;
    state.dateTo=dateTo.value;
    render();
  });

  resetBtn.addEventListener('click',()=>{
    state.keyword='';state.customer='';state.dateFrom='';state.dateTo='';state.statusTab='';state.selectedIds.clear();
    keywordInput.value='';customerSelect.value='';dateFrom.value='';dateTo.value='';
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
    const checkable=getFilteredRows().filter(s=>s.status==='pending');
    if(checkAll.checked) checkable.forEach(s=>state.selectedIds.add(s.id));
    else checkable.forEach(s=>state.selectedIds.delete(s.id));
    render();
  });

  settlementBody.addEventListener('change',e=>{
    const cb=e.target.closest('[data-check-id]');
    if(!cb)return;
    const id=Number(cb.dataset.checkId);
    if(cb.checked) state.selectedIds.add(id); else state.selectedIds.delete(id);
    updateSelectedHint();
    const checkable=getFilteredRows().filter(s=>s.status==='pending');
    checkAll.checked=checkable.length>0&&checkable.every(s=>state.selectedIds.has(s.id));
  });

  /* 行操作 */
  settlementBody.addEventListener('click',e=>{
    const link=e.target.closest('[data-action]');
    if(!link)return;
    const action=link.dataset.action;
    const id=Number(link.dataset.id);
    if(action==='view'){
      window.location.href='./settlement-detail.html?id='+id;
    }else if(action==='confirm'){
      window.location.href='./settlement-detail.html?id='+id;
    }else if(action==='cancel'){
      pendingCancelIds=[id];
      const s=settlements.find(x=>x.id===id);
      if(!s)return;
      cancelInfo.textContent='结算单号：'+s.settlementNo;
      cancelReason.value='';
      cancelModal.style.display='flex';
    }
  });

  /* 批量取消 */
  batchCancelBtn.addEventListener('click',()=>{
    if(!state.selectedIds.size){showToast('warning','请选择','请勾选需要取消的结算单');return;}
    const targets=settlements.filter(s=>state.selectedIds.has(s.id)&&s.status==='pending');
    if(!targets.length){showToast('warning','无法取消','选中的结算单中没有待核销状态');return;}
    pendingCancelIds=targets.map(s=>s.id);
    cancelInfo.textContent='已选择 '+targets.length+' 条待核销结算单';
    cancelReason.value='';
    cancelModal.style.display='flex';
  });

  /* 取消弹窗 */
  cancelCancelBtn.addEventListener('click',()=>{
    cancelModal.style.display='none';
    pendingCancelIds=[];
  });
  cancelConfirmBtn.addEventListener('click',()=>{
    if(!cancelReason.value.trim()){showToast('warning','请填写原因','取消原因为必填项');return;}
    pendingCancelIds.forEach(id=>{
      const s=settlements.find(x=>x.id===id);
      if(s){s.status='cancelled';s.remark=cancelReason.value.trim();}
      state.selectedIds.delete(id);
    });
    render();
    showToast('success','已取消','已取消'+pendingCancelIds.length+'条结算单');
    cancelModal.style.display='none';
    pendingCancelIds=[];
  });

  /* 新建结算单 */
  newSettlementBtn.addEventListener('click',()=>{
    document.getElementById('newCustomer').value='';
    document.getElementById('newAmount').value='';
    document.getElementById('newCurrency').value='EUR';
    document.getElementById('newOrigAmount').value='';
    document.getElementById('newDate').value='';
    document.getElementById('newPayMethod').value='tt';
    document.getElementById('newAccount').value='';
    document.getElementById('newRemark').value='';
    newModal.style.display='flex';
  });

  newCancelBtn.addEventListener('click',()=>{
    newModal.style.display='none';
  });

  newConfirmBtn.addEventListener('click',()=>{
    const customer=document.getElementById('newCustomer').value;
    const amount=parseFloat(document.getElementById('newAmount').value);
    const currency=document.getElementById('newCurrency').value;
    const origAmount=parseFloat(document.getElementById('newOrigAmount').value);
    const date=document.getElementById('newDate').value;
    const payMethod=document.getElementById('newPayMethod').value;
    const account=document.getElementById('newAccount').value.trim();
    const remark=document.getElementById('newRemark').value.trim();

    if(!customer){showToast('warning','请填写','请选择客户');return;}
    if(!amount||amount<=0){showToast('warning','请填写','请输入有效的收款金额');return;}
    if(!origAmount||origAmount<=0){showToast('warning','请填写','请输入有效的原始付款金额');return;}
    if(!date){showToast('warning','请填写','请选择收款日期');return;}

    const now=new Date();
    const dateStr=now.toISOString().substring(0,10).replace(/-/g,'');
    const seq=String(nextId).padStart(3,'0');
    const newSettlement={
      id:nextId,
      settlementNo:'STL-'+dateStr+'-'+seq,
      customerName:customer,
      customerId:customer==='深圳ABC贸易'?1:customer==='杭州XYZ物流'?2:3,
      amount:amount,
      originalCurrency:currency,
      originalAmount:origAmount,
      receiptDate:date,
      paymentMethod:payMethod,
      receivingAccount:account,
      operator:'张三',
      createdAt:now.toISOString().replace('T',' ').substring(0,16),
      confirmedAt:'',
      remark:remark,
      status:'pending',
      items:[]
    };
    settlements.unshift(newSettlement);
    nextId++;
    state.selectedIds.clear();
    render();
    showToast('success','新建成功','结算单'+newSettlement.settlementNo+'已创建');
    newModal.style.display='none';
  });

  render();
})();
