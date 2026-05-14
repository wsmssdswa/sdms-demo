(()=>{
  const keywordInput=document.getElementById('keywordInput');
  const categorySelect=document.getElementById('categorySelect');
  const settlementSelect=document.getElementById('settlementSelect');
  const queryBtn=document.getElementById('queryBtn');
  const resetBtn=document.getElementById('resetBtn');
  const statusTabs=document.getElementById('statusTabs');
  const sheetBody=document.getElementById('sheetBody');
  const sheetCount=document.getElementById('sheetCount');
  const detailModal=document.getElementById('detailModal');
  const detailTitle=document.getElementById('detailTitle');
  const detailInfo=document.getElementById('detailInfo');
  const receivableItemsBody=document.getElementById('receivableItemsBody');
  const payableItemsBody=document.getElementById('payableItemsBody');
  const receivableSum=document.getElementById('receivableSum');
  const payableSum=document.getElementById('payableSum');
  const detailSummary=document.getElementById('detailSummary');
  const detailRemarkSection=document.getElementById('detailRemarkSection');
  const detailRemarkInput=document.getElementById('detailRemarkInput');
  const detailFooter=document.getElementById('detailFooter');
  const detailCloseBtn=document.getElementById('detailCloseBtn');

  const BILLING_NODE_MAP={inbound_complete:'入库完成',outbound_complete:'出库完成',ship_confirm:'发货确认',vas_complete:'增值服务完成',storage_cycle:'仓储结算'};
  const CATEGORY_MAP={logistics:'物流费',storage:'仓储费',operation:'操作费'};
  const STATUS_MAP={in_progress:{label:'进行中',cls:'in_progress'},pending_review:{label:'待复核',cls:'pending'},confirmed:{label:'已确认',cls:'active'},cancelled:{label:'已取消',cls:'inactive'}};
  const SETTLEMENT_MAP={realtime:'余额扣款',bill:'账期结算'};
  const STATUS_TABS=[{key:'',label:'全部'},{key:'in_progress',label:'进行中'},{key:'pending_review',label:'待复核'},{key:'confirmed',label:'已确认'},{key:'cancelled',label:'已取消'}];

  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  function buildSeedData(){
    return [
      {id:1,feeNo:'FS-20260510-001',sheetType:'order',orderNo:'TRK-2026-001',customerName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',status:'confirmed',remark:'',createdAt:'2025-05-10 14:30',items:[
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'卸货费',unitPrice:50,quantity:1,unit:'柜',amount:50},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'清点费',unitPrice:30,quantity:1,unit:'箱',amount:30},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'上架费',unitPrice:150,quantity:2,unit:'SKU',amount:300}
      ]},
      {id:2,feeNo:'FS-20260511-001',sheetType:'order',orderNo:'TRK-2026-001',customerName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',status:'pending_review',remark:'',createdAt:'2025-05-11 09:00',items:[
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'拣货费',unitPrice:100,quantity:2,unit:'SKU',amount:200},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'打包费',unitPrice:75,quantity:2,unit:'箱',amount:150},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'vas_complete',feeCategory:'operation',feeItemName:'贴标费',unitPrice:50,quantity:2,unit:'SKU',amount:100},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线物流费',unitPrice:400,quantity:2,unit:'柜',amount:800},
        {direction:'payable',subjectName:'DHL物流',billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线运输费',unitPrice:250,quantity:2,unit:'柜',amount:500}
      ]},
      {id:3,feeNo:'FS-20260512-001',sheetType:'order',orderNo:'TRK-2026-002',customerName:'杭州XYZ物流',warehouseName:'德国海外仓',settlementMode:'bill',status:'confirmed',remark:'',createdAt:'2025-05-12 10:15',items:[
        {direction:'receivable',subjectName:'杭州XYZ物流',billingNode:'outbound_complete',feeCategory:'operation',feeItemName:'出库操作费',unitPrice:180,quantity:1,unit:'次',amount:180},
        {direction:'receivable',subjectName:'杭州XYZ物流',billingNode:'ship_confirm',feeCategory:'logistics',feeItemName:'干线物流费',unitPrice:800,quantity:1,unit:'柜',amount:800},
        {direction:'payable',subjectName:'DHL物流',billingNode:'inbound_complete',feeCategory:'operation',feeItemName:'入库操作费',unitPrice:110,quantity:2,unit:'次',amount:220}
      ]},
      {id:4,feeNo:'FS-20260513-001',sheetType:'storage_cycle',orderNo:'',customerName:'深圳ABC贸易',warehouseName:'波兰海外仓',settlementMode:'realtime',status:'pending_review',remark:'',createdAt:'2025-05-13 16:45',items:[
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'storage_cycle',feeCategory:'storage',feeItemName:'基础仓储费',unitPrice:20,quantity:20,unit:'SKU·天',amount:400},
        {direction:'receivable',subjectName:'深圳ABC贸易',billingNode:'storage_cycle',feeCategory:'storage',feeItemName:'旺季附加费',unitPrice:8,quantity:20,unit:'SKU·天',amount:160}
      ]},
      {id:5,feeNo:'FS-20260513-002',sheetType:'order',orderNo:'TRK-2026-003',customerName:'上海DEF电商',warehouseName:'波兰海外仓',settlementMode:'bill',status:'pending_review',remark:'',createdAt:'2025-05-13 11:30',items:[
        {direction:'receivable',subjectName:'上海DEF电商',billingNode:'vas_complete',feeCategory:'operation',feeItemName:'质检服务费',unitPrice:80,quantity:3,unit:'次',amount:240},
        {direction:'payable',subjectName:'欧洲操作中心',billingNode:'vas_complete',feeCategory:'operation',feeItemName:'质检服务费',unitPrice:50,quantity:3,unit:'次',amount:150}
      ]}
    ];
  }

  let rows=buildSeedData();
  let nextId=6;
  let detailTargetId=null;
  const state={keyword:'',category:'',settlement:'',statusTab:''};

  function calcReceivable(item){return item.items.filter(i=>i.direction==='receivable').reduce((s,i)=>s+i.amount,0);}
  function calcPayable(item){return item.items.filter(i=>i.direction==='payable').reduce((s,i)=>s+i.amount,0);}

  function getFilteredRows(){
    return rows.filter(item=>{
      if(state.keyword){
        const kw=state.keyword.toLowerCase();
        if(!item.feeNo.toLowerCase().includes(kw)&&!item.orderNo.toLowerCase().includes(kw)&&!item.customerName.toLowerCase().includes(kw))return false;
      }
      if(state.category&&item.items.every(i=>i.feeCategory!==state.category))return false;
      if(state.settlement&&item.settlementMode!==state.settlement)return false;
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

  function getActions(item){
    const links=[];
    if(item.status==='pending_review')links.push('<a href="javascript:void(0)" class="action-link" data-action="review" data-id="'+item.id+'">复核</a>');
    if(item.status==='in_progress'||item.status==='pending_review')links.push('<a href="javascript:void(0)" class="action-link" data-action="cancel" data-id="'+item.id+'" style="color:var(--danger)">取消</a>');
    if(item.status==='confirmed')links.push('<a href="javascript:void(0)" class="action-link" data-action="view" data-id="'+item.id+'">查看</a>');
    return links.join('');
  }

  function render(){
    const filtered=getFilteredRows();
    if(!filtered.length){
      sheetBody.innerHTML='<tr class="empty-row"><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">暂无费用单</td></tr>';
      sheetCount.textContent='';
    }else{
      sheetBody.innerHTML=filtered.map(item=>{
        const st=STATUS_MAP[item.status]||{label:item.status,cls:'draft'};
        const recvAmt=calcReceivable(item);
        const payAmt=calcPayable(item);
        const net=recvAmt-payAmt;
        const netCls=net>=0?'net-positive':'net-negative';
        const orderDisplay=item.sheetType==='storage_cycle'?'<span style="color:var(--text-muted)">仓储周期</span>':('<a class="name-link" href="./trunk-order-list.html">'+escapeHtml(item.orderNo)+'</a>');
        return '<tr><td><a class="name-link" href="javascript:void(0)" data-action="view" data-id="'+item.id+'">'+escapeHtml(item.feeNo)+'</a></td><td>'+orderDisplay+'</td><td>'+escapeHtml(item.customerName)+'</td><td>'+escapeHtml(item.warehouseName)+'</td><td class="net-positive">¥'+recvAmt.toLocaleString()+'</td><td class="net-negative">¥'+payAmt.toLocaleString()+'</td><td class="'+netCls+'">¥'+net.toLocaleString()+'</td><td><span class="status-tag '+st.cls+'">'+st.label+'</span></td><td><div class="action-group">'+getActions(item)+'</div></td></tr>';
      }).join('');
      sheetCount.textContent='共 '+filtered.length+' 条';
    }
    renderStatusTabs();
  }

  function openDetail(id,editable){
    const item=rows.find(r=>r.id===id);
    if(!item)return;
    detailTargetId=id;
    const st=STATUS_MAP[item.status]||{label:item.status,cls:'draft'};
    detailTitle.textContent=escapeHtml(item.feeNo)+' 详情';

    const recvItems=item.items.filter(i=>i.direction==='receivable');
    const payItems=item.items.filter(i=>i.direction==='payable');
    const recvTotal=recvItems.reduce((s,i)=>s+i.amount,0);
    const payTotal=payItems.reduce((s,i)=>s+i.amount,0);

    detailInfo.innerHTML=[
      '<div><span class="info-label">费用单号：</span><span class="info-value">'+escapeHtml(item.feeNo)+'</span></div>',
      '<div><span class="info-label">订单号：</span><span class="info-value">'+(item.orderNo?escapeHtml(item.orderNo):'仓储周期')+'</span></div>',
      '<div><span class="info-label">客户：</span><span class="info-value">'+escapeHtml(item.customerName)+'</span></div>',
      '<div><span class="info-label">仓库：</span><span class="info-value">'+escapeHtml(item.warehouseName)+'</span></div>',
      '<div><span class="info-label">结算模式：</span><span class="info-value">'+SETTLEMENT_MAP[item.settlementMode]+'</span></div>',
      '<div><span class="info-label">状态：</span><span class="info-value"><span class="status-tag '+st.cls+'">'+st.label+'</span></span></div>',
      '<div><span class="info-label">创建时间：</span><span class="info-value">'+escapeHtml(item.createdAt||'—')+'</span></div>',
      '<div><span class="info-label">费用项总数：</span><span class="info-value">'+item.items.length+'项（应收'+recvItems.length+'项，应付'+payItems.length+'项）</span></div>'
    ].join('');

    receivableSum.textContent='小计：¥'+recvTotal.toLocaleString();
    receivableItemsBody.innerHTML=recvItems.length?recvItems.map((it,idx)=>{
      const amtCell=editable?'<td><input type="number" class="detail-edit-input" data-direction="receivable" data-item-idx="'+idx+'" value="'+it.amount+'" min="0" style="width:80px;padding:4px 6px;border:1px solid var(--line);border-radius:3px;font-size:12px">':'<td>¥'+it.amount.toLocaleString();
      return '<tr><td>'+escapeHtml(BILLING_NODE_MAP[it.billingNode]||it.billingNode)+'</td><td>'+escapeHtml(CATEGORY_MAP[it.feeCategory]||it.feeCategory)+'</td><td>'+escapeHtml(it.feeItemName)+'</td><td>¥'+it.unitPrice+'</td><td>'+it.quantity+'</td><td>'+escapeHtml(it.unit)+'</td><td>'+escapeHtml(it.subjectName)+'</td>'+amtCell+'</td></tr>';
    }).join(''):'<tr><td colspan="8" style="text-align:center;padding:16px;color:var(--text-muted)">无应收费用项</td></tr>';

    payableSum.textContent='小计：¥'+payTotal.toLocaleString();
    payableItemsBody.innerHTML=payItems.length?payItems.map((it,idx)=>{
      const amtCell=editable?'<td><input type="number" class="detail-edit-input" data-direction="payable" data-item-idx="'+idx+'" value="'+it.amount+'" min="0" style="width:80px;padding:4px 6px;border:1px solid var(--line);border-radius:3px;font-size:12px">':'<td>¥'+it.amount.toLocaleString();
      return '<tr><td>'+escapeHtml(BILLING_NODE_MAP[it.billingNode]||it.billingNode)+'</td><td>'+escapeHtml(CATEGORY_MAP[it.feeCategory]||it.feeCategory)+'</td><td>'+escapeHtml(it.feeItemName)+'</td><td>¥'+it.unitPrice+'</td><td>'+it.quantity+'</td><td>'+escapeHtml(it.unit)+'</td><td>'+escapeHtml(it.subjectName)+'</td>'+amtCell+'</td></tr>';
    }).join(''):'<tr><td colspan="8" style="text-align:center;padding:16px;color:var(--text-muted)">无应付费用项</td></tr>';

    const net=recvTotal-payTotal;
    detailSummary.innerHTML='<div class="summary-item"><span class="summary-label">应收总额：</span><span class="summary-value net-positive">¥'+recvTotal.toLocaleString()+'</span></div><div class="summary-item"><span class="summary-label">应付总额：</span><span class="summary-value net-negative">¥'+payTotal.toLocaleString()+'</span></div><div class="summary-item"><span class="summary-label">净额：</span><span class="summary-value '+(net>=0?'net-positive':'net-negative')+'">¥'+net.toLocaleString()+'</span></div>';

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
  sheetBody.addEventListener('click',e=>{
    const link=e.target.closest('[data-action]');
    if(link)handleAction(link.dataset.action,link.dataset.id);
  });
  detailCloseBtn.addEventListener('click',closeDetail);
  detailModal.addEventListener('click',e=>{if(e.target===detailModal)closeDetail();});
  detailFooter.addEventListener('click',e=>{
    const id=detailTargetId;
    if(!id)return;
    const item=rows.find(r=>r.id===id);
    if(!item)return;
    if(e.target.id==='confirmBtn'){
      detailModal.querySelectorAll('.detail-edit-input').forEach(input=>{
        const dir=input.dataset.direction;
        const idx=parseInt(input.dataset.itemIdx);
        const pool=dir==='receivable'?item.items.filter(i=>i.direction==='receivable'):item.items.filter(i=>i.direction==='payable');
        if(pool[idx]){
          const newAmt=parseFloat(input.value);
          if(!isNaN(newAmt)&&newAmt>=0)pool[idx].amount=newAmt;
        }
      });
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
