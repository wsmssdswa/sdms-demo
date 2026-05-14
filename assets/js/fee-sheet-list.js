(()=>{
  /* DOM */
  const keywordInput=document.getElementById('keywordInput');
  const categorySelect=document.getElementById('categorySelect');
  const settlementSelect=document.getElementById('settlementSelect');
  const queryBtn=document.getElementById('queryBtn');
  const resetBtn=document.getElementById('resetBtn');
  const statusTabs=document.getElementById('statusTabs');
  const receivableBody=document.getElementById('receivableBody');
  const payableBody=document.getElementById('payableBody');
  const receivableSummary=document.getElementById('receivableSummary');
  const payableSummary=document.getElementById('payableSummary');
  const receivableCount=document.getElementById('receivableCount');
  const payableCount=document.getElementById('payableCount');
  const detailModal=document.getElementById('detailModal');
  const detailTitle=document.getElementById('detailTitle');
  const detailInfo=document.getElementById('detailInfo');
  const detailItemsBody=document.getElementById('detailItemsBody');
  const detailTotal=document.getElementById('detailTotal');
  const detailRemarkSection=document.getElementById('detailRemarkSection');
  const detailRemarkInput=document.getElementById('detailRemarkInput');
  const detailFooter=document.getElementById('detailFooter');
  const detailCloseBtn=document.getElementById('detailCloseBtn');

  /* 工具 */
  const BILLING_NODE_MAP={inbound_complete:'入库完成',outbound_complete:'出库完成',ship_confirm:'发货确认',vas_complete:'增值服务完成',storage_cycle:'仓储结算'};
  const CATEGORY_MAP={logistics:'物流费',storage:'仓储费',operation:'操作费'};
  const STATUS_MAP={in_progress:{label:'进行中',cls:'in_progress'},pending_review:{label:'待复核',cls:'pending'},confirmed:{label:'已确认',cls:'active'},cancelled:{label:'已取消',cls:'inactive'}};
  const SETTLEMENT_MAP={realtime:'余额扣款',bill:'账期结算'};
  const STATUS_TABS=[{key:'',label:'全部'},{key:'in_progress',label:'进行中'},{key:'pending_review',label:'待复核'},{key:'confirmed',label:'已确认'},{key:'cancelled',label:'已取消'}];

  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* 种子数据 */
  function buildSeedData(){
    return [
      {id:1,feeNo:'FS-20260510-001',sheetType:'order',orderNo:'TRK-2026-001',direction:'receivable',subjectType:'customer',subjectName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',totalAmount:380,status:'confirmed',remark:'',items:[
        {billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'卸货费',unitPrice:50,quantity:1,unit:'柜',amount:50},
        {billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'清点费',unitPrice:30,quantity:1,unit:'箱',amount:30},
        {billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'上架费',unitPrice:150,quantity:2,unit:'SKU',amount:300}
      ]},
      {id:2,feeNo:'FS-20260511-001',sheetType:'order',orderNo:'TRK-2026-001',direction:'receivable',subjectType:'customer',subjectName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',totalAmount:1250,status:'pending_review',remark:'',items:[
        {billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'拣货费',unitPrice:100,quantity:2,unit:'SKU',amount:200},
        {billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'打包费',unitPrice:75,quantity:2,unit:'箱',amount:150},
        {billingNode:'vas_complete',feeCategory:'operation',feeItemName:'贴标费',unitPrice:50,quantity:2,unit:'SKU',amount:100},
        {billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线物流费',unitPrice:400,quantity:2,unit:'柜',amount:800}
      ]},
      {id:3,feeNo:'FS-20260511-002',sheetType:'order',orderNo:'TRK-2026-002',direction:'payable',subjectType:'supplier',subjectName:'DHL物流',warehouseName:'德国海外仓',settlementMode:'bill',totalAmount:220,status:'confirmed',remark:'',items:[
        {billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'入库操作费',unitPrice:110,quantity:2,unit:'次',amount:220}
      ]},
      {id:4,feeNo:'FS-20260512-001',sheetType:'order',orderNo:'TRK-2026-002',direction:'receivable',subjectType:'customer',subjectName:'杭州XYZ物流',warehouseName:'德国海外仓',settlementMode:'bill',totalAmount:980,status:'confirmed',remark:'',items:[
        {billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'出库操作费',unitPrice:180,quantity:1,unit:'次',amount:180},
        {billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线物流费',unitPrice:800,quantity:1,unit:'柜',amount:800}
      ]},
      {id:5,feeNo:'FS-20260513-001',sheetType:'storage_cycle',orderNo:'',direction:'receivable',subjectType:'customer',subjectName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',totalAmount:560,status:'pending_review',remark:'',items:[
        {billingNode:'storage_cycle',feeCategory:'storage',feeItemName:'基础仓储费',unitPrice:20,quantity:20,unit:'SKU·天',amount:400},
        {billingNode:'storage_cycle',feeCategory:'storage',feeItemName:'旺季附加费',unitPrice:8,quantity:20,unit:'SKU·天',amount:160}
      ]},
      {id:6,feeNo:'FS-20260513-002',sheetType:'order',orderNo:'TRK-2026-003',direction:'payable',subjectType:'supplier',subjectName:'欧洲操作中心',warehouseName:'波兰海外仓',settlementMode:'bill',totalAmount:150,status:'pending_review',remark:'',items:[
        {billingNode:'vas_complete',feeCategory:'operation',feeItemName:'质检服务费',unitPrice:50,quantity:3,unit:'次',amount:150}
      ]}
    ];
  }

  /* 状态 */
  let rows=buildSeedData();
  let nextId=7;
  let detailTargetId=null;
  const state={keyword:'',category:'',settlement:'',statusTab:'',expandedRows:new Set()};

  function getFilteredRows(direction){
    return rows.filter(item=>{
      if(item.direction!==direction)return false;
      if(state.keyword){
        const kw=state.keyword.toLowerCase();
        if(!item.feeNo.toLowerCase().includes(kw)&&!item.orderNo.toLowerCase().includes(kw)&&!item.subjectName.toLowerCase().includes(kw))return false;
      }
      if(state.category&&item.items.every(i=>i.feeCategory!==state.category))return false;
      if(state.settlement&&item.settlementMode!==state.settlement)return false;
      if(state.statusTab&&item.status!==state.statusTab)return false;
      return true;
    });
  }

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

  /* 状态Tab */
  function renderStatusTabs(){
    statusTabs.innerHTML=STATUS_TABS.map(tab=>{
      const count=tab.key===''?rows.length:rows.filter(r=>r.status===tab.key).length;
      return '<button type="button" class="scene-tab'+(state.statusTab===tab.key?' active':'')+'" data-tab="'+tab.key+'">'+tab.label+'('+count+')</button>';
    }).join('');
  }

  /* 操作列 */
  function getActions(item){
    const links=[];
    if(item.status==='pending_review')links.push('<a href="javascript:void(0)" class="action-link" data-action="review" data-id="'+item.id+'">复核</a>');
    if(item.status==='in_progress'||item.status==='pending_review')links.push('<a href="javascript:void(0)" class="action-link" data-action="cancel" data-id="'+item.id+'" style="color:var(--danger)">取消</a>');
    if(item.status==='confirmed')links.push('<a href="javascript:void(0)" class="action-link" data-action="view" data-id="'+item.id+'">查看</a>');
    return links.join('');
  }

  /* 展开行HTML */
  function buildExpandRow(item){
    const itemsHtml=item.items.map(it=>{
      return '<tr><td>'+escapeHtml(BILLING_NODE_MAP[it.billingNode]||it.billingNode)+'</td><td>'+escapeHtml(CATEGORY_MAP[it.feeCategory]||it.feeCategory)+'</td><td>'+escapeHtml(it.feeItemName)+'</td><td>¥'+it.unitPrice+'</td><td>'+it.quantity+'</td><td>'+escapeHtml(it.unit)+'</td><td>¥'+it.amount.toLocaleString()+'</td></tr>';
    }).join('');
    return '<tr class="expand-row"><td colspan="9"><div class="expand-content"><table class="expand-table"><thead><tr><th>计费节点</th><th>费用大类</th><th>费用项</th><th>单价</th><th>数量</th><th>单位</th><th>金额</th></tr></thead><tbody>'+itemsHtml+'</tbody></table></div></td></tr>';
  }

  /* 渲染表格 */
  function renderTable(bodyEl,data,direction){
    if(!data.length){
      bodyEl.innerHTML='<tr class="empty-row"><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">暂无'+(direction==='receivable'?'应收':'应付')+'费用单</td></tr>';
      return;
    }
    bodyEl.innerHTML=data.map(item=>{
      const st=STATUS_MAP[item.status]||{label:item.status,cls:'draft'};
      const expanded=state.expandedRows.has(item.id);
      const settleCls=item.settlementMode==='realtime'?'settle-realtime':'settle-bill';
      const orderDisplay=item.sheetType==='storage_cycle'?'<span style="color:var(--text-muted)">仓储周期</span>':('<a class="name-link" href="./trunk-order-list.html">'+escapeHtml(item.orderNo)+'</a>');
      return '<tr class="expand-trigger" data-expand-id="'+item.id+'"><td><span class="expand-icon'+(expanded?' open':'')+'">&#9654;</span> <a class="name-link" href="javascript:void(0)" data-action="view" data-id="'+item.id+'">'+escapeHtml(item.feeNo)+'</a></td><td>'+orderDisplay+'</td><td>'+escapeHtml(item.subjectName)+'</td><td>'+escapeHtml(item.warehouseName)+'</td><td>'+item.items.length+'项</td><td>¥'+item.totalAmount.toLocaleString()+'</td><td><span class="'+settleCls+'">'+SETTLEMENT_MAP[item.settlementMode]+'</span></td><td><span class="status-tag '+st.cls+'">'+st.label+'</span></td><td><div class="action-group">'+getActions(item)+'</div></td></tr>'+(expanded?buildExpandRow(item):'');
    }).join('');
  }

  function render(){
    const receivable=getFilteredRows('receivable');
    const payable=getFilteredRows('payable');
    renderTable(receivableBody,receivable,'receivable');
    renderTable(payableBody,payable,'payable');
    receivableSummary.textContent=' ¥'+receivable.reduce((s,r)=>s+r.totalAmount,0).toLocaleString();
    payableSummary.textContent=' ¥'+payable.reduce((s,r)=>s+r.totalAmount,0).toLocaleString();
    receivableCount.textContent='共 '+receivable.length+' 条';
    payableCount.textContent='共 '+payable.length+' 条';
    renderStatusTabs();
  }

  /* 详情弹窗 */
  function openDetail(id,editable){
    const item=rows.find(r=>r.id===id);
    if(!item)return;
    detailTargetId=id;
    const st=STATUS_MAP[item.status]||{label:item.status,cls:'draft'};
    const dirLabel=item.direction==='receivable'?'应收':'应付';
    detailTitle.textContent=escapeHtml(item.feeNo)+' 详情';
    detailInfo.innerHTML=[
      '<div><span class="info-label">方向：</span><span class="info-value"><span class="status-tag '+(item.direction==='receivable'?'dir-receivable':'dir-payable')+'">'+dirLabel+'</span></span></div>',
      '<div><span class="info-label">订单号：</span><span class="info-value">'+(item.orderNo?escapeHtml(item.orderNo):'仓储周期')+'</span></div>',
      '<div><span class="info-label">主体：</span><span class="info-value">'+escapeHtml(item.subjectName)+'</span></div>',
      '<div><span class="info-label">仓库：</span><span class="info-value">'+escapeHtml(item.warehouseName)+'</span></div>',
      '<div><span class="info-label">结算模式：</span><span class="info-value">'+SETTLEMENT_MAP[item.settlementMode]+'</span></div>',
      '<div><span class="info-label">状态：</span><span class="info-value"><span class="status-tag '+st.cls+'">'+st.label+'</span></span></div>'
    ].join('');
    detailItemsBody.innerHTML=item.items.map((it,idx)=>{
      const amtCell=editable?'<td><input type="number" class="detail-edit-input" data-item-idx="'+idx+'" value="'+it.amount+'" min="0" style="width:80px;padding:4px 6px;border:1px solid var(--line);border-radius:3px;font-size:12px">':'<td>¥'+it.amount.toLocaleString();
      return '<tr><td>'+escapeHtml(BILLING_NODE_MAP[it.billingNode]||it.billingNode)+'</td><td>'+escapeHtml(CATEGORY_MAP[it.feeCategory]||it.feeCategory)+'</td><td>'+escapeHtml(it.feeItemName)+'</td><td>¥'+it.unitPrice+'</td><td>'+it.quantity+'</td><td>'+escapeHtml(it.unit)+'</td>'+amtCell+'</td></tr>';
    }).join('');
    detailTotal.textContent='合计：¥'+item.totalAmount.toLocaleString();
    if(editable&&item.status==='pending_review'){
      detailRemarkSection.style.display='';
      detailRemarkInput.value='';
      detailFooter.innerHTML='<button type="button" class="btn btn-primary" id="confirmBtn">确认</button> <button type="button" class="btn btn-default" id="cancelFeeBtn">取消费用单</button> <button type="button" class="btn btn-default" id="closeModalBtn">关闭</button>';
    }else{
      detailRemarkSection.style.display='none';
      detailFooter.innerHTML='<button type="button" class="btn btn-default" id="closeModalBtn">关闭</button>';
    }
    detailModal.classList.add('open');
    detailModal.setAttribute('aria-hidden','false');
  }

  function closeDetail(){
    detailModal.classList.remove('open');
    detailModal.setAttribute('aria-hidden','true');
    detailTargetId=null;
  }

  function handleAction(action,id){
    const numId=Number(id);
    if(action==='view'||action==='review'){
      openDetail(numId,action==='review');
    }else if(action==='cancel'){
      if(!confirm('确定要取消此费用单吗？'))return;
      const item=rows.find(r=>r.id===numId);
      if(item){item.status='cancelled';render();showToast('success','已取消','费用单已取消');}
    }
  }

  /* 事件 */
  queryBtn.addEventListener('click',()=>{
    state.keyword=keywordInput.value.trim();
    state.category=categorySelect.value;
    state.settlement=settlementSelect.value;
    render();
  });
  resetBtn.addEventListener('click',()=>{
    state.keyword='';state.category='';state.settlement='';state.statusTab='';
    keywordInput.value='';categorySelect.value='';settlementSelect.value='';
    render();
  });
  keywordInput.addEventListener('keydown',e=>{if(e.key==='Enter')queryBtn.click();});
  statusTabs.addEventListener('click',e=>{
    const btn=e.target.closest('[data-tab]');
    if(!btn)return;
    state.statusTab=btn.dataset.tab;
    render();
  });
  [receivableBody,payableBody].forEach(body=>{
    body.addEventListener('click',e=>{
      const trigger=e.target.closest('[data-expand-id]');
      if(trigger&&!e.target.closest('[data-action]')){
        const id=Number(trigger.dataset.expandId);
        state.expandedRows.has(id)?state.expandedRows.delete(id):state.expandedRows.add(id);
        render();
        return;
      }
      const link=e.target.closest('[data-action]');
      if(link)handleAction(link.dataset.action,link.dataset.id);
    });
  });
  detailCloseBtn.addEventListener('click',closeDetail);
  detailModal.addEventListener('click',e=>{if(e.target===detailModal)closeDetail();});
  detailFooter.addEventListener('click',e=>{
    const id=detailTargetId;
    if(!id)return;
    const item=rows.find(r=>r.id===id);
    if(!item)return;
    if(e.target.id==='confirmBtn'){
      detailItemsBody.querySelectorAll('.detail-edit-input').forEach(input=>{
        const idx=parseInt(input.dataset.itemIdx);
        if(item.items[idx]){
          const newAmt=parseFloat(input.value);
          if(!isNaN(newAmt)&&newAmt>=0)item.items[idx].amount=newAmt;
        }
      });
      item.totalAmount=item.items.reduce((s,it)=>s+it.amount,0);
      item.status='confirmed';
      item.remark=detailRemarkInput.value.trim();
      const mode=item.settlementMode==='realtime'?'已从余额扣款':'已确认，等待出账';
      closeDetail();render();showToast('success','费用单已确认',item.feeNo+' '+mode);
    }else if(e.target.id==='cancelFeeBtn'){
      item.status='cancelled';closeDetail();render();showToast('success','已取消','费用单已取消');
    }else if(e.target.id==='closeModalBtn'){
      closeDetail();
    }
  });

  render();
})();
