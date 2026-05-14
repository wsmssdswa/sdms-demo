(()=>{
  /* DOM */
  const accountTabs=document.getElementById('accountTabs');
  const overviewPanel=document.getElementById('overviewPanel');
  const transactionPanel=document.getElementById('transactionPanel');
  const accountBody=document.getElementById('accountBody');
  const transactionBody=document.getElementById('transactionBody');
  const txSubjectSelect=document.getElementById('txSubjectSelect');
  const txTypeSelect=document.getElementById('txTypeSelect');
  const rechargeModal=document.getElementById('rechargeModal');
  const rechargeSubject=document.getElementById('rechargeSubject');
  const rechargeAmount=document.getElementById('rechargeAmount');
  const rechargeRemark=document.getElementById('rechargeRemark');
  const rechargeCloseBtn=document.getElementById('rechargeCloseBtn');
  const rechargeConfirmBtn=document.getElementById('rechargeConfirmBtn');
  const rechargeCancelBtn=document.getElementById('rechargeCancelBtn');

  /* 工具 */
  const TX_TYPE_MAP={recharge:'充值',deduct:'扣款',withdraw:'提现',adjust:'调整'};
  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* 账户数据 */
  const accounts=[
    {id:1,subjectType:'customer',subjectName:'深圳ABC贸易',balance:8810,frozenAmount:0,totalRecharged:50000,totalDeducted:41190},
    {id:2,subjectType:'customer',subjectName:'杭州XYZ物流',balance:15000,frozenAmount:0,totalRecharged:30000,totalDeducted:15000},
    {id:3,subjectType:'customer',subjectName:'上海DEF电商',balance:3200,frozenAmount:500,totalRecharged:20000,totalDeducted:16800},
    {id:4,subjectType:'supplier',subjectName:'DHL物流',balance:0,frozenAmount:0,totalRecharged:0,totalDeducted:0},
    {id:5,subjectType:'supplier',subjectName:'欧洲操作中心',balance:0,frozenAmount:0,totalRecharged:0,totalDeducted:0}
  ];

  /* 资金流水数据 */
  let transactions=[
    {id:1,txNo:'TX-001',accountId:1,txType:'recharge',amount:50000,balanceBefore:0,balanceAfter:50000,relatedFeeNo:'',feeItemSummary:'',remark:'初始充值',createdAt:'05-01 10:00'},
    {id:2,txNo:'TX-002',accountId:1,txType:'deduct',amount:380,balanceBefore:50000,balanceAfter:49620,relatedFeeNo:'FS-20260510-001',feeItemSummary:'卸货费、清点费、上架费',remark:'',createdAt:'05-10 14:30'},
    {id:3,txNo:'TX-003',accountId:2,txType:'recharge',amount:30000,balanceBefore:0,balanceAfter:30000,relatedFeeNo:'',feeItemSummary:'',remark:'初始充值',createdAt:'05-02 09:00'},
    {id:4,txNo:'TX-004',accountId:1,txType:'recharge',amount:20000,balanceBefore:49620,balanceAfter:69620,relatedFeeNo:'',feeItemSummary:'',remark:'追加充值',createdAt:'05-05 11:00'},
    {id:5,txNo:'TX-005',accountId:1,txType:'adjust',amount:27810,balanceBefore:69620,balanceAfter:41810,relatedFeeNo:'',feeItemSummary:'系统调整',remark:'历史费用补扣',createdAt:'05-08 16:00'},
    {id:6,txNo:'TX-006',accountId:3,txType:'recharge',amount:20000,balanceBefore:0,balanceAfter:20000,relatedFeeNo:'',feeItemSummary:'',remark:'初始充值',createdAt:'05-03 08:30'},
    {id:7,txNo:'TX-007',accountId:3,txType:'adjust',amount:2000,balanceBefore:20000,balanceAfter:18000,relatedFeeNo:'',feeItemSummary:'系统调整',remark:'历史费用补扣',createdAt:'05-06 14:00'},
    {id:8,txNo:'TX-008',accountId:1,txType:'adjust',amount:33000,balanceBefore:41810,balanceAfter:8810,relatedFeeNo:'',feeItemSummary:'系统调整',remark:'历史费用补扣',createdAt:'05-09 10:00'}
  ];
  let nextTxId=9;
  let rechargeTargetId=null;

  /* Toast */
  function showToast(type,title,desc){
    const el=document.createElement('div');
    el.className='toast '+type;
    el.innerHTML='<div class="toast-title">'+escapeHtml(title)+'</div>'+(desc?'<div class="toast-desc">'+escapeHtml(desc)+'</div>':'');
    const stack=document.getElementById('toastStack');
    stack.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),240);},2200);
  }

  /* 渲染账户列表 */
  function renderAccounts(){
    accountBody.innerHTML=accounts.map(a=>{
      const typeLabel=a.subjectType==='customer'?'客户':'供应商';
      const typeCls=a.subjectType==='customer'?'type-customer':'type-supplier';
      return '<tr><td>'+escapeHtml(a.subjectName)+'</td><td><span class="type-tag '+typeCls+'">'+typeLabel+'</span></td><td class="amount-positive">¥'+a.balance.toLocaleString()+'</td><td>'+(a.frozenAmount?'¥'+a.frozenAmount.toLocaleString():'<span style="color:var(--text-muted)">¥0</span>')+'</td><td>¥'+a.totalRecharged.toLocaleString()+'</td><td>¥'+a.totalDeducted.toLocaleString()+'</td><td><div class="action-group"><a href="javascript:void(0)" class="action-link" data-action="recharge" data-id="'+a.id+'">充值</a></div></td></tr>';
    }).join('');
  }

  /* 渲染资金流水 */
  function renderTransactions(){
    const subject=txSubjectSelect.value;
    const txType=txTypeSelect.value;
    let filtered=transactions;
    if(subject){
      filtered=filtered.filter(t=>{
        const acc=accounts.find(a=>a.id===t.accountId);
        return acc&&acc.subjectName===subject;
      });
    }
    if(txType)filtered=filtered.filter(t=>t.txType===txType);
    transactionBody.innerHTML=filtered.length?filtered.map(t=>{
      const acc=accounts.find(a=>a.id===t.accountId);
      const name=acc?acc.subjectName:'—';
      const typeCls='type-'+t.txType;
      const amtCls=t.txType==='recharge'?'amount-positive':'amount-negative';
      const sign=t.txType==='recharge'?'+':'-';
      const feeLink=t.relatedFeeNo?('<a class="name-link" href="./fee-sheet-list.html">'+escapeHtml(t.relatedFeeNo)+'</a>'):'—';
      const summary=t.feeItemSummary||'—';
      return '<tr><td>'+escapeHtml(t.txNo)+'</td><td><span class="type-tag '+typeCls+'">'+TX_TYPE_MAP[t.txType]+'</span></td><td>'+escapeHtml(name)+'</td><td>'+feeLink+'</td><td style="font-size:12px">'+escapeHtml(summary)+'</td><td class="'+amtCls+'">'+sign+'¥'+t.amount.toLocaleString()+'</td><td>¥'+t.balanceAfter.toLocaleString()+'</td><td>'+escapeHtml(t.createdAt)+'</td></tr>';
    }).join(''):'<tr class="empty-row"><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">暂无资金流水</td></tr>';
  }

  /* Tab切换 */
  accountTabs.addEventListener('click',e=>{
    const btn=e.target.closest('[data-account-tab]');
    if(!btn)return;
    accountTabs.querySelectorAll('.scene-tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab=btn.dataset.accountTab;
    overviewPanel.style.display=tab==='overview'?'':'none';
    transactionPanel.style.display=tab==='transactions'?'':'none';
  });

  /* 充值 */
  function openRecharge(id){
    const acc=accounts.find(a=>a.id===id);
    if(!acc)return;
    rechargeTargetId=id;
    rechargeSubject.textContent=acc.subjectName+'（当前余额：¥'+acc.balance.toLocaleString()+'）';
    rechargeAmount.value='';
    rechargeRemark.value='';
    rechargeModal.classList.add('open');
    rechargeModal.setAttribute('aria-hidden','false');
  }
  function closeRecharge(){
    rechargeModal.classList.remove('open');
    rechargeModal.setAttribute('aria-hidden','true');
    rechargeTargetId=null;
  }

  /* 事件 */
  accountBody.addEventListener('click',e=>{
    const link=e.target.closest('[data-action]');
    if(!link)return;
    if(link.dataset.action==='recharge')openRecharge(Number(link.dataset.id));
  });
  rechargeCloseBtn.addEventListener('click',closeRecharge);
  rechargeCancelBtn.addEventListener('click',closeRecharge);
  rechargeModal.addEventListener('click',e=>{if(e.target===rechargeModal)closeRecharge();});
  rechargeConfirmBtn.addEventListener('click',()=>{
    if(!rechargeTargetId)return;
    const amt=parseFloat(rechargeAmount.value);
    if(!amt||amt<=0){showToast('error','输入错误','请输入有效的充值金额');return;}
    const acc=accounts.find(a=>a.id===rechargeTargetId);
    if(!acc)return;
    const tx={id:nextTxId++,txNo:'TX-'+String(nextTxId-1).padStart(3,'0'),accountId:acc.id,txType:'recharge',amount:amt,balanceBefore:acc.balance,balanceAfter:acc.balance+amt,relatedFeeNo:'',feeItemSummary:'',remark:rechargeRemark.value.trim()||'手动充值',createdAt:new Date().toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'})+' '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})};
    transactions.unshift(tx);
    acc.balance+=amt;
    acc.totalRecharged+=amt;
    closeRecharge();renderAccounts();renderTransactions();showToast('success','充值成功','¥'+amt.toLocaleString()+' 已到账');
  });
  txSubjectSelect.addEventListener('change',renderTransactions);
  txTypeSelect.addEventListener('change',renderTransactions);

  /* 初始化 */
  txSubjectSelect.innerHTML='<option value="">全部</option>'+accounts.map(a=>'<option value="'+a.subjectName+'">'+a.subjectName+'</option>').join('');
  renderAccounts();
  renderTransactions();
})();
