(()=>{
  const settlementDetailPage=document.getElementById('settlementDetailPage');
  const breadcrumbNo=document.getElementById('breadcrumbNo');
  const statusBanner=document.getElementById('statusBanner');
  const settlementInfo=document.getElementById('settlementInfo');
  const attachmentContent=document.getElementById('attachmentContent');
  const writeoffBody=document.getElementById('writeoffBody');
  const writeoffSummary=document.getElementById('writeoffSummary');
  const writeoffBtn=document.getElementById('writeoffBtn');
  const confirmBtn=document.getElementById('confirmBtn');
  const cancelBtn=document.getElementById('cancelBtn');
  const reverseBtn=document.getElementById('reverseBtn');
  const addWriteoffBtn=document.getElementById('addWriteoffBtn');
  const cancelModal=document.getElementById('cancelModal');
  const cancelInfo=document.getElementById('cancelInfo');
  const cancelReason=document.getElementById('cancelReason');
  const cancelModalCancelBtn=document.getElementById('cancelModalCancelBtn');
  const cancelModalConfirmBtn=document.getElementById('cancelModalConfirmBtn');
  const confirmModal=document.getElementById('confirmModal');
  const confirmInfo=document.getElementById('confirmInfo');
  const confirmModalCancelBtn=document.getElementById('confirmModalCancelBtn');
  const confirmModalConfirmBtn=document.getElementById('confirmModalConfirmBtn');
  const writeoffModal=document.getElementById('writeoffModal');
  const writeoffModalBody=document.getElementById('writeoffModalBody');
  const writeoffModalClose=document.getElementById('writeoffModalClose');
  const writeoffModalCancel=document.getElementById('writeoffModalCancel');
  const writeoffModalSave=document.getElementById('writeoffModalSave');
  const autoAllocateBtn=document.getElementById('autoAllocateBtn');

  const STATUS_MAP={
    pending:{label:'待核销',cls:'pending'},
    confirmed:{label:'已核销',cls:'confirmed'},
    cancelled:{label:'已取消',cls:'cancelled'},
    reversed:{label:'已冲销',cls:'inactive'}
  };
  const PAYMENT_METHOD_MAP={tt:'TT电汇',transfer:'银行转账',cheque:'支票',cash:'现金',lc:'信用证',online:'在线支付'};
  const CURRENCY_MAP={CNY:{symbol:'¥',label:'人民币'},EUR:{symbol:'€',label:'欧元'},USD:{symbol:'$',label:'美元'},GBP:{symbol:'£',label:'英镑'}};

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

  function buildSettlementData(){
    return [
      {id:1,settlementNo:'STL-20260520-001',customerName:'深圳ABC贸易',customerId:1,
        amount:14571.56,originalCurrency:'EUR',originalAmount:1856.25,
        receiptDate:'2026-05-20',paymentMethod:'tt',
        receivingAccount:'中行深圳 EUR 6225****8801',
        operator:'Kevin.王磊',createdAt:'2026-05-20 10:30',confirmedAt:'2026-05-20 14:00',
        remark:'',status:'confirmed',
        items:[{billNo:'BL-20260514-001',billId:1,amount:14571.56,draft:false}]},
      {id:2,settlementNo:'STL-20260522-001',customerName:'杭州XYZ物流',customerId:2,
        amount:8010.93,originalCurrency:'EUR',originalAmount:1020.50,
        receiptDate:'2026-05-22',paymentMethod:'transfer',
        receivingAccount:'工行深圳 CNY 4000****3302',
        operator:'Amy.李婷',createdAt:'2026-05-22 09:15',confirmedAt:'2026-05-22 16:30',
        remark:'',status:'confirmed',
        items:[{billNo:'BL-20260515-001',billId:2,amount:8010.93,draft:false}]},
      {id:3,settlementNo:'STL-20260525-001',customerName:'深圳ABC贸易',customerId:1,
        amount:10000,originalCurrency:'EUR',originalAmount:1273.89,
        receiptDate:'2026-05-25',paymentMethod:'transfer',
        receivingAccount:'工行深圳 CNY 4000****3302',
        operator:'Kevin.王磊',createdAt:'2026-05-25 14:00',confirmedAt:'',
        remark:'先核销仓储费账单',status:'pending',
        items:[{billNo:'BL-20260517-001',billId:4,amount:4313.58,draft:true}]},
      {id:4,settlementNo:'STL-20260526-001',customerName:'上海DEF电商',customerId:3,
        amount:1848.68,originalCurrency:'EUR',originalAmount:235.50,
        receiptDate:'2026-05-26',paymentMethod:'tt',
        receivingAccount:'中行深圳 EUR 6225****8801',
        operator:'Jack.陈明',createdAt:'2026-05-26 08:45',confirmedAt:'',
        remark:'',status:'pending',items:[]}
    ];
  }

  function buildBillData(){
    return [
      {id:1,billNo:'BL-20260514-001',customerName:'深圳ABC贸易',customerId:1,receivableTotal:14571.56,receivedAmount:14571.56,status:'settled'},
      {id:2,billNo:'BL-20260515-001',customerName:'杭州XYZ物流',customerId:2,receivableTotal:8010.93,receivedAmount:8010.93,status:'settled'},
      {id:3,billNo:'BL-20260516-001',customerName:'上海DEF电商',customerId:3,receivableTotal:1848.68,receivedAmount:0,status:'confirmed'},
      {id:4,billNo:'BL-20260517-001',customerName:'深圳ABC贸易',customerId:1,receivableTotal:4313.58,receivedAmount:4313.58,status:'settled'},
      {id:5,billNo:'BL-20260518-001',customerName:'杭州XYZ物流',customerId:2,receivableTotal:2156.79,receivedAmount:0,status:'confirmed'},
      {id:6,billNo:'BL-20260601-001',customerName:'深圳ABC贸易',customerId:1,receivableTotal:8920.00,receivedAmount:0,status:'confirmed'},
      {id:7,billNo:'BL-20260602-001',customerName:'杭州XYZ物流',customerId:2,receivableTotal:12650.00,receivedAmount:5000,status:'partially_received'},
      {id:8,billNo:'BL-20260603-001',customerName:'上海DEF电商',customerId:3,receivableTotal:5320.50,receivedAmount:0,status:'confirmed'},
      {id:9,billNo:'BL-20260604-001',customerName:'深圳ABC贸易',customerId:1,receivableTotal:3200.00,receivedAmount:0,status:'confirmed'}
    ];
  }

  const settlements=buildSettlementData();
  const allBills=buildBillData();
  let currentSettlement=null;

  function calcAllocated(){
    if(!currentSettlement)return 0;
    return currentSettlement.items.reduce((s,it)=>s+it.amount,0);
  }

  function calcUnallocated(){
    if(!currentSettlement)return 0;
    return currentSettlement.amount-calcAllocated();
  }

  function getSettlementFromUrl(){
    const params=new URLSearchParams(window.location.search);
    const id=Number(params.get('id'));
    return settlements.find(s=>s.id===id)||settlements[0];
  }

  function renderTopBar(){
    if(!currentSettlement)return;
    breadcrumbNo.textContent=currentSettlement.settlementNo;
    const st=currentSettlement.status;
    writeoffBtn.style.display=st==='pending'?'':'none';
    confirmBtn.style.display=st==='pending'?'':'none';
    cancelBtn.style.display=st==='pending'?'':'none';
    reverseBtn.style.display=st==='confirmed'?'':'none';
    addWriteoffBtn.style.display=st==='pending'?'':'none';
  }

  function renderStatusBanner(){
    if(!currentSettlement)return;
    const st=STATUS_MAP[currentSettlement.status];
    let meta='创建于 '+currentSettlement.createdAt+' · 操作人：'+currentSettlement.operator;
    if(currentSettlement.confirmedAt) meta+=' · 核销于 '+currentSettlement.confirmedAt;
    statusBanner.className='status-banner '+st.cls;
    statusBanner.innerHTML='<strong>'+st.label+'</strong><span class="banner-meta">'+meta+'</span>';
  }

  function renderSettlementInfo(){
    if(!currentSettlement)return;
    const cur=CURRENCY_MAP[currentSettlement.originalCurrency]||{symbol:'',label:currentSettlement.originalCurrency};
    const payMethod=PAYMENT_METHOD_MAP[currentSettlement.paymentMethod]||currentSettlement.paymentMethod;
    settlementInfo.innerHTML=[
      '<div><div class="info-label">结算单号</div><div class="info-value">'+escapeHtml(currentSettlement.settlementNo)+'</div></div>',
      '<div><div class="info-label">客户</div><div class="info-value">'+escapeHtml(currentSettlement.customerName)+'</div></div>',
      '<div><div class="info-label">收款金额(CNY)</div><div class="info-value">¥'+fmtAmt(currentSettlement.amount)+'</div></div>',
      '<div><div class="info-label">原始币种/金额</div><div class="info-value">'+cur.symbol+fmtAmt(currentSettlement.originalAmount)+' '+currentSettlement.originalCurrency+'</div></div>',
      '<div><div class="info-label">收款方式</div><div class="info-value">'+escapeHtml(payMethod)+'</div></div>',
      '<div><div class="info-label">收款日期</div><div class="info-value">'+escapeHtml(currentSettlement.receiptDate)+'</div></div>',
      '<div><div class="info-label">我方收款账户</div><div class="info-value">'+escapeHtml(currentSettlement.receivingAccount)+'</div></div>',
      '<div><div class="info-label">操作人</div><div class="info-value">'+escapeHtml(currentSettlement.operator)+'</div></div>',
      '<div><div class="info-label">创建时间</div><div class="info-value">'+escapeHtml(currentSettlement.createdAt)+'</div></div>',
      '<div><div class="info-label">确认时间</div><div class="info-value">'+(currentSettlement.confirmedAt?escapeHtml(currentSettlement.confirmedAt):'—')+'</div></div>',
      '<div><div class="info-label">备注</div><div class="info-value">'+(currentSettlement.remark?escapeHtml(currentSettlement.remark):'—')+'</div></div>'
    ].join('');
  }

  function renderAttachment(){
    if(!currentSettlement)return;
    if(currentSettlement.status==='cancelled'||currentSettlement.status==='reversed'){
      attachmentContent.innerHTML='<div class="attachment-placeholder"><i class="ri-attachment-line"></i>暂无附件</div>';
      return;
    }
    attachmentContent.innerHTML='<div class="attachment-placeholder"><i class="ri-upload-cloud-line"></i>点击上传付款凭证（支持图片、PDF）</div>';
  }

  function renderWriteoffDetail(){
    if(!currentSettlement)return;
    const items=currentSettlement.items;
    const isPending=currentSettlement.status==='pending';
    if(!items.length){
      writeoffBody.innerHTML='<tr class="empty-row"><td colspan="5">暂无核销明细，点击"添加核销"选择账单</td></tr>';
    }else{
      let html='';
      items.forEach((it,idx)=>{
        const bill=allBills.find(b=>b.id===it.billId);
        const receivableTotal=bill?bill.receivableTotal:0;
        const receivedAmount=bill?bill.receivedAmount:0;
        html+='<tr>';
        html+='<td><a class="name-link" href="./bill-detail.html?id='+it.billId+'">'+escapeHtml(it.billNo)+'</a>';
        if(it.draft) html+=' <span class="draft-tag">待确认</span>';
        html+='</td>';
        html+='<td class="amount-right">¥'+fmtAmt(receivableTotal)+'</td>';
        html+='<td class="amount-right">¥'+fmtAmt(receivedAmount)+'</td>';
        html+='<td class="amount-right">¥'+fmtAmt(it.amount)+'</td>';
        html+='<td><div class="writeoff-action">';
        if(isPending&&it.draft){
          html+='<span class="action-link danger" data-remove-idx="'+idx+'">移除</span>';
        }else{
          html+='<span style="color:#999;font-size:12px">—</span>';
        }
        html+='</div></td>';
        html+='</tr>';
      });
      writeoffBody.innerHTML=html;
    }

    const allocated=calcAllocated();
    const unallocated=calcUnallocated();
    writeoffSummary.innerHTML=
      '<div><span class="summary-label">收款金额：</span><span class="summary-value">¥'+fmtAmt(currentSettlement.amount)+'</span></div>'+
      '<div><span class="summary-label">已分配金额：</span><span class="summary-value positive">¥'+fmtAmt(allocated)+'</span></div>'+
      '<div><span class="summary-label">未分配金额：</span><span class="summary-value '+(unallocated>0?'negative':'positive')+'">¥'+fmtAmt(unallocated)+'</span></div>';
  }

  function renderAll(){
    currentSettlement=getSettlementFromUrl();
    renderTopBar();
    renderStatusBanner();
    renderSettlementInfo();
    renderAttachment();
    renderWriteoffDetail();
  }

  /* Remove writeoff item */
  writeoffBody.addEventListener('click',e=>{
    const link=e.target.closest('[data-remove-idx]');
    if(!link)return;
    if(!currentSettlement||currentSettlement.status!=='pending')return;
    const idx=Number(link.dataset.removeIdx);
    currentSettlement.items.splice(idx,1);
    renderWriteoffDetail();
    renderTopBar();
    showToast('success','已移除','核销明细已移除');
  });

  /* Writeoff modal: add bills */
  let modalSelectedBills=[];

  function openWriteoffModal(){
    if(!currentSettlement)return;
    const existingBillIds=currentSettlement.items.map(it=>it.billId);
    const availableBills=allBills.filter(b=>
      b.customerId===currentSettlement.customerId
      &&(b.status==='confirmed'||b.status==='partially_received')
      &&!existingBillIds.includes(b.id)
    );
    modalSelectedBills=[];
    const unallocated=calcUnallocated();
    let html='<div class="modal-balance-bar" id="modalBalanceBar">可用余额：<strong>¥'+fmtAmt(unallocated)+'</strong></div>';
    if(!availableBills.length){
      html+='<div style="text-align:center;padding:32px 0;color:#999;font-size:13px">没有可核销的账单</div>';
    }else{
      availableBills.forEach(b=>{
        const unreceived=Math.max(0,b.receivableTotal-b.receivedAmount);
        html+='<div class="bill-select-row" data-bill-id="'+b.id+'">';
        html+='<input type="checkbox" data-bill-check="'+b.id+'">';
        html+='<div class="bill-info">';
        html+='<div class="bill-no">'+escapeHtml(b.billNo)+'</div>';
        html+='<div class="bill-amounts">应收 ¥'+fmtAmt(b.receivableTotal)+' · 已收 ¥'+fmtAmt(b.receivedAmount)+' · 未收 ¥'+fmtAmt(unreceived)+'</div>';
        html+='</div>';
        html+='<input type="number" data-bill-amount="'+b.id+'" min="0" max="'+unreceived.toFixed(2)+'" step="0.01" placeholder="分配金额" disabled>';
        html+='<span class="remaining-tag" data-bill-remaining="'+b.id+'" data-unreceived="'+unreceived.toFixed(2)+'"></span>';
        html+='</div>';
      });
    }
    writeoffModalBody.innerHTML=html;
    writeoffModal.classList.add('open');
    writeoffModal.setAttribute('aria-hidden','false');
    updateModalBalance();
  }

  function updateModalBalance(){
    if(!currentSettlement)return;
    const allocated=calcAllocated();
    let modalAllocated=0;
    writeoffModalBody.querySelectorAll('[data-bill-amount]').forEach(inp=>{
      modalAllocated+=parseFloat(inp.value)||0;
    });
    const balance=currentSettlement.amount-allocated-modalAllocated;
    const bar=document.getElementById('modalBalanceBar');
    const saveBtn=writeoffModalSave;
    if(bar){
      bar.className='modal-balance-bar'+(balance<0?' over':balance===0?' done':'');
      bar.innerHTML='可用余额：<strong>¥'+fmtAmt(balance)+'</strong>';
    }
    // 更新每行核销后剩余
    writeoffModalBody.querySelectorAll('[data-bill-remaining]').forEach(tag=>{
      const unreceived=parseFloat(tag.dataset.unreceived)||0;
      const billId=tag.dataset.billRemaining;
      const inp=writeoffModalBody.querySelector('[data-bill-amount="'+billId+'"]');
      const val=inp?parseFloat(inp.value)||0:0;
      const remaining=unreceived-val;
      tag.className='remaining-tag'+(remaining<=0?' settled':' unsettled');
      tag.textContent='剩余 ¥'+fmtAmt(Math.max(0,remaining));
    });
    // 超额时禁用保存
    saveBtn.disabled=balance<0;
  }

  function closeWriteoffModal(){
    writeoffModal.classList.remove('open');
    writeoffModal.setAttribute('aria-hidden','true');
    modalSelectedBills=[];
  }

  addWriteoffBtn.addEventListener('click',openWriteoffModal);
  writeoffBtn.addEventListener('click',openWriteoffModal);

  writeoffModalClose.addEventListener('click',closeWriteoffModal);
  writeoffModalCancel.addEventListener('click',closeWriteoffModal);
  writeoffModal.addEventListener('click',e=>{
    if(e.target===writeoffModal) closeWriteoffModal();
  });

  writeoffModalBody.addEventListener('change',e=>{
    const chk=e.target.closest('[data-bill-check]');
    if(chk){
      const billId=Number(chk.dataset.billCheck);
      const amountInput=writeoffModalBody.querySelector('[data-bill-amount="'+billId+'"]');
      if(chk.checked){
        if(!modalSelectedBills.includes(billId)) modalSelectedBills.push(billId);
        amountInput.disabled=false;
        amountInput.focus();
      }else{
        modalSelectedBills=modalSelectedBills.filter(id=>id!==billId);
        amountInput.disabled=true;
        amountInput.value='';
      }
      updateModalBalance();
    }
  });

  writeoffModalBody.addEventListener('input',e=>{
    if(e.target.matches('[data-bill-amount]')) updateModalBalance();
  });

  autoAllocateBtn.addEventListener('click',()=>{
    if(!currentSettlement)return;
    if(!modalSelectedBills.length){
      writeoffModalBody.querySelectorAll('[data-bill-check]').forEach(chk=>{
        if(!chk.checked){
          chk.checked=true;
          const bid=Number(chk.dataset.billCheck);
          if(!modalSelectedBills.includes(bid)) modalSelectedBills.push(bid);
          const inp=writeoffModalBody.querySelector('[data-bill-amount="'+bid+'"]');
          if(inp) inp.disabled=false;
        }
      });
    }
    let remaining=calcUnallocated();
    modalSelectedBills.forEach(billId=>{
      const bill=allBills.find(b=>b.id===billId);
      if(!bill)return;
      const unreceived=Math.max(0,bill.receivableTotal-bill.receivedAmount);
      const allocate=Math.min(remaining,unreceived);
      const amountInput=writeoffModalBody.querySelector('[data-bill-amount="'+billId+'"]');
      if(amountInput) amountInput.value=allocate>0?allocate.toFixed(2):'';
      remaining=Math.max(0,remaining-allocate);
    });
    showToast('success','已分配','已自动填充核销金额');
    updateModalBalance();
  });

  writeoffModalSave.addEventListener('click',()=>{
    if(!currentSettlement)return;
    let added=0;
    modalSelectedBills.forEach(billId=>{
      const bill=allBills.find(b=>b.id===billId);
      if(!bill)return;
      const amountInput=writeoffModalBody.querySelector('[data-bill-amount="'+billId+'"]');
      const val=parseFloat(amountInput.value)||0;
      if(val<=0)return;
      currentSettlement.items.push({
        billNo:bill.billNo,
        billId:bill.id,
        amount:val,
        draft:true
      });
      added++;
    });
    closeWriteoffModal();
    renderWriteoffDetail();
    renderTopBar();
    if(added>0){
      showToast('success','已添加','已添加'+added+'条核销明细');
    }else{
      showToast('warning','未添加','请选择账单并填写分配金额');
    }
  });

  /* Confirm writeoff */
  confirmBtn.addEventListener('click',()=>{
    if(!currentSettlement)return;
    const allocated=calcAllocated();
    const unallocated=calcUnallocated();
    let msg='共'+currentSettlement.items.length+'张账单，核销金额 ¥'+fmtAmt(allocated);
    if(unallocated>0){
      msg+='，未分配金额 ¥'+fmtAmt(unallocated)+' 将转入客户余额';
    }
    confirmInfo.textContent=msg;
    confirmModal.style.display='flex';
  });

  confirmModalCancelBtn.addEventListener('click',()=>{
    confirmModal.style.display='none';
  });

  confirmModalConfirmBtn.addEventListener('click',()=>{
    if(!currentSettlement)return;
    currentSettlement.items.forEach(it=>{it.draft=false;});
    currentSettlement.status='confirmed';
    currentSettlement.confirmedAt=new Date().toISOString().replace('T',' ').substring(0,16);
    confirmModal.style.display='none';
    renderAll();
    showToast('success','核销成功','结算单已确认核销');
  });

  confirmModal.addEventListener('click',e=>{
    if(e.target===confirmModal) confirmModal.style.display='none';
  });

  /* Cancel settlement */
  cancelBtn.addEventListener('click',()=>{
    if(!currentSettlement)return;
    cancelInfo.textContent='结算单号：'+currentSettlement.settlementNo;
    cancelReason.value='';
    cancelModal.style.display='flex';
  });

  cancelModalCancelBtn.addEventListener('click',()=>{
    cancelModal.style.display='none';
  });

  cancelModalConfirmBtn.addEventListener('click',()=>{
    if(!cancelReason.value.trim()){
      showToast('warning','请填写原因','取消原因为必填项');
      return;
    }
    if(currentSettlement){
      currentSettlement.status='cancelled';
    }
    cancelModal.style.display='none';
    renderAll();
    showToast('success','已取消','结算单已取消');
  });

  cancelModal.addEventListener('click',e=>{
    if(e.target===cancelModal) cancelModal.style.display='none';
  });

  /* Reverse settlement */
  reverseBtn.addEventListener('click',()=>{
    if(!currentSettlement)return;
    currentSettlement.status='reversed';
    currentSettlement.items.forEach(it=>{it.draft=false;});
    renderAll();
    showToast('success','已冲销','结算单已冲销，关联账单收款状态已还原');
  });

  renderAll();
})();
