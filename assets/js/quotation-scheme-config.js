(()=>{
const keywordInput=document.getElementById('keywordInput');
const customerSelect=document.getElementById('customerSelect');
const warehouseSelect=document.getElementById('warehouseSelect');
const queryBtn=document.getElementById('queryBtn');
const resetBtn=document.getElementById('resetBtn');
const createBtn=document.getElementById('createBtn');
const statusTabs=document.getElementById('statusTabs');
const tableBody=document.getElementById('tableBody');
const totalCountText=document.getElementById('totalCountText');
const pageBtnGroup=document.getElementById('pageBtnGroup');
const pageSizeSelect=document.getElementById('pageSizeSelect');
const jumpInput=document.getElementById('jumpInput');
const jumpBtn=document.getElementById('jumpBtn');
const toastStack=document.getElementById('toastStack');
const reviewModal=document.getElementById('reviewModal');
const reviewModalClose=document.getElementById('reviewModalClose');
const reviewCancelBtn=document.getElementById('reviewCancelBtn');
const reviewConfirmBtn=document.getElementById('reviewConfirmBtn');
const reviewReasonWrap=document.getElementById('reviewReasonWrap');
const reviewReasonInput=document.getElementById('reviewReasonInput');

const pad=(n)=>String(n).padStart(2,'0');
const formatDateTime=(date)=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const escapeHtml=(v)=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const STATUS_MAP={draft:{label:'草稿',cls:'draft'},pending:{label:'待审核',cls:'pending'},active:{label:'生效',cls:'active'},inactive:{label:'已失效',cls:'inactive'},rejected:{label:'已驳回',cls:'rejected'}};

const STATUS_TABS=[
  {key:'',label:'全部'},
  {key:'draft',label:'草稿'},
  {key:'pending',label:'待审核'},
  {key:'active',label:'生效中'},
  {key:'inactive',label:'已失效'},
  {key:'rejected',label:'已驳回'}
];

function buildSeedData(){
  const base=[
    {name:'波兰海外仓默认报价',customer:'',warehouse:'波兰海外仓',startDate:'',endDate:'',status:'active',feeCount:12,updater:'张三',isDefault:true},
    {name:'德国海外仓默认报价',customer:'',warehouse:'德国海外仓',startDate:'',endDate:'',status:'draft',feeCount:0,updater:'张三',isDefault:true},
    {name:'深圳保税仓默认报价',customer:'',warehouse:'深圳保税仓',startDate:'',endDate:'',status:'pending',feeCount:8,updater:'李四',isDefault:true},
    {name:'ABC贸易-波兰仓标准报价',customer:'深圳ABC贸易有限公司',warehouse:'波兰海外仓',startDate:'2025-01-01',endDate:'2025-12-31',status:'active',feeCount:12,updater:'张三'},
    {name:'XYZ物流-德国仓FBA报价',customer:'杭州XYZ物流',warehouse:'德国海外仓',startDate:'2025-03-01',endDate:'2026-02-28',status:'active',feeCount:8,updater:'李四'},
    {name:'DEF电商-深圳仓综合报价',customer:'上海DEF电商',warehouse:'深圳保税仓',startDate:'2025-02-15',endDate:'2025-08-15',status:'draft',feeCount:5,updater:'张三'},
    {name:'GHI供应链-波兰仓尾程报价',customer:'广州GHI供应链',warehouse:'波兰海外仓',startDate:'2025-04-01',endDate:'2026-03-31',status:'pending',feeCount:6,updater:'王五'},
    {name:'ABC贸易-德国仓海运报价',customer:'深圳ABC贸易有限公司',warehouse:'德国海外仓',startDate:'2025-05-01',endDate:'2025-11-30',status:'active',feeCount:9,updater:'张三'},
    {name:'XYZ物流-波兰仓干线报价',customer:'杭州XYZ物流',warehouse:'波兰海外仓',startDate:'2025-06-01',endDate:'2025-12-31',status:'inactive',feeCount:7,updater:'李四'},
    {name:'DEF电商-德国仓增值服务报价',customer:'上海DEF电商',warehouse:'德国海外仓',startDate:'2025-01-15',endDate:'2025-07-15',status:'pending',feeCount:4,updater:'王五'},
    {name:'GHI供应链-深圳仓仓储报价',customer:'广州GHI供应链',warehouse:'深圳保税仓',startDate:'2025-07-01',endDate:'2026-06-30',status:'draft',feeCount:3,updater:'张三'},
    {name:'DEF电商-波兰仓操作费报价',customer:'上海DEF电商',warehouse:'波兰海外仓',startDate:'2025-03-01',endDate:'2025-09-30',status:'rejected',feeCount:6,updater:'王五',rejectReason:'费率设置不合理，请调整后重新提交'},
  ];
  const rows=[];
  const startTime=new Date('2025-06-10T10:00:00');
  base.forEach((item,index)=>{
    const date=new Date(startTime.getTime()-index*12*60*60*1000);
    rows.push({id:index+1,updateTime:formatDateTime(date),...item});
  });
  return rows;
}

let rows=buildSeedData();
let nextId=rows.length+1;
let reviewTargetId=null;
const state={keyword:'',customer:'',warehouse:'',currentTab:'',currentPage:1,pageSize:10};

function showToast(type,title,desc){
  const toast=document.createElement('div');
  toast.className=`toast ${type}`;
  toast.innerHTML=`<div class="toast-title">${escapeHtml(title)}</div><div class="toast-desc">${escapeHtml(desc)}</div>`;
  toastStack.appendChild(toast);
  requestAnimationFrame(()=>toast.classList.add('show'));
  setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),240);},2200);
}

function getFilteredRows(){
  const keyword=state.keyword.trim();
  return rows.filter(item=>{
    if(keyword&&!item.name.includes(keyword))return false;
    if(state.customer==='__default__'){
      if(item.customer!=='')return false;
    }else if(state.customer&&item.customer!==state.customer){
      return false;
    }
    if(state.warehouse&&item.warehouse!==state.warehouse)return false;
    if(state.currentTab==='default'){
      if(!item.isDefault)return false;
    }else if(state.currentTab&&item.status!==state.currentTab){
      return false;
    }
    return true;
  });
}

function getPageRows(list){
  const start=(state.currentPage-1)*state.pageSize;
  return list.slice(start,start+state.pageSize);
}

function buildPageList(totalPages,currentPage){
  if(totalPages<=7)return Array.from({length:totalPages},(_,i)=>i+1);
  if(currentPage<=4)return[1,2,3,4,5,'...',totalPages];
  if(currentPage>=totalPages-3)return[1,'...',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
  return[1,'...',currentPage-1,currentPage,currentPage+1,'...',totalPages];
}

function getActions(item){
  const s=item.status;
  const edit=`<a class="action-link" href="quotation-scheme-create.html?mode=edit&id=${item.id}${item.isDefault?'&isDefault=1':''}">编辑</a>`;
  const del=item.isDefault?'':`<a class="action-link delete" href="javascript:void(0)" data-action="delete" data-id="${item.id}">删除</a>`;
  const submit=`<a class="action-link" href="javascript:void(0)" data-action="submit" data-id="${item.id}">提交审核</a>`;
  const review=`<a class="action-link" href="javascript:void(0)" data-action="review" data-id="${item.id}">审核</a>`;
  if(s==='draft') return `<div class="action-group">${edit}${submit}${del}</div>`;
  if(s==='rejected') return `<div class="action-group">${edit}${submit}${del}</div>`;
  if(s==='pending') return `<div class="action-group">${review}${edit}${del}</div>`;
  if(s==='active') return `<div class="action-group">${edit}${del}</div>`;
  if(s==='inactive') return `<div class="action-group">${edit}${del}</div>`;
  return '';
}

function renderStatusTabs(){
  statusTabs.innerHTML=STATUS_TABS.map(tab=>{
    const count=tab.key===''?rows.length:tab.key==='default'?rows.filter(r=>r.isDefault).length:rows.filter(r=>r.status===tab.key).length;
    const active=tab.key===state.currentTab?'active':'';
    return `<button class="scene-tab ${active}" type="button" data-tab="${tab.key}">${tab.label}(${count})</button>`;
  }).join('');
}

function renderTable(){
  const filtered=getFilteredRows();
  const total=filtered.length;
  const totalPages=Math.max(1,Math.ceil(total/state.pageSize));
  if(state.currentPage>totalPages)state.currentPage=totalPages;
  const current=getPageRows(filtered);
  if(!current.length){
    tableBody.innerHTML='<tr class="empty-row"><td colspan="9">暂无数据</td></tr>';
  }else{
    tableBody.innerHTML=current.map((item,index)=>{
      const st=STATUS_MAP[item.status]||{label:item.status,cls:'draft'};
      const isDefault=!!item.isDefault;
      const defaultBadge=isDefault?'<span class="default-badge">默认</span>':'';
      const customerText=item.customer||(item.isDefault?'所有客户':'—');
      const dateText=item.startDate?`${escapeHtml(item.startDate)} ~ ${escapeHtml(item.endDate)}`:'<span class="date-longterm">长期有效</span>';
      const feeCountHtml=isDefault&&item.feeCount===0?`<span class="fee-count-warning">${item.feeCount}</span>`:`${item.feeCount}`;
      const rowCls=isDefault?'row-default':'';
      return `<tr class="${rowCls}">
        <td class="cell-center">${(state.currentPage-1)*state.pageSize+index+1}</td>
        <td><a class="name-link" href="quotation-scheme-create.html?mode=edit&id=${item.id}${isDefault?'&isDefault=1':''}">${escapeHtml(item.name)}</a>${defaultBadge}</td>
        <td${!item.customer?' class="cell-muted"':''}>${escapeHtml(customerText)}</td>
        <td class="cell-center">${escapeHtml(item.warehouse)}</td>
        <td class="cell-center">${dateText}</td>
        <td class="cell-center">${feeCountHtml}</td>
        <td class="cell-center"><span class="status-tag ${st.cls}">${st.label}</span>${item.status==='rejected'&&item.rejectReason?`<i class="ri-information-line reject-info-icon" title="${escapeHtml(item.rejectReason)}"></i>`:''}</td>
        <td>${escapeHtml(item.updateTime)}</td>
        <td>${getActions(item)}</td>
      </tr>`;
    }).join('');
  }
  totalCountText.textContent=`共${total}条记录`;
  jumpInput.value=String(state.currentPage);
  renderPagination(totalPages);
  renderStatusTabs();
}

function renderPagination(totalPages){
  const prevDisabled=state.currentPage===1;
  const nextDisabled=state.currentPage===totalPages;
  const pages=buildPageList(totalPages,state.currentPage);
  const btns=[];
  btns.push(`<button class="page-btn ${prevDisabled?'disabled':''}" type="button" data-page="prev">&lt;</button>`);
  pages.forEach(p=>{
    if(p==='...'){btns.push('<span class="page-ellipsis">...</span>');return;}
    btns.push(`<button class="page-btn ${p===state.currentPage?'active':''}" type="button" data-page="${p}">${p}</button>`);
  });
  btns.push(`<button class="page-btn ${nextDisabled?'disabled':''}" type="button" data-page="next">&gt;</button>`);
  pageBtnGroup.innerHTML=btns.join('');
}

function queryList(){
  state.keyword=keywordInput.value.trim();
  state.customer=customerSelect.value;
  state.warehouse=warehouseSelect.value;
  state.currentPage=1;
  renderTable();
}

function resetList(){
  state.keyword='';state.customer='';state.warehouse='';state.currentTab='';
  state.currentPage=1;state.pageSize=10;
  keywordInput.value='';customerSelect.value='';warehouseSelect.value='';pageSizeSelect.value='10';
  renderTable();
  showToast('success','已重置','查询条件已恢复默认值。');
}

function handleAction(action,id){
  const item=rows.find(r=>r.id===id);
  if(!item)return;

  if(action==='delete'){
    if(item.isDefault){showToast('error','无法删除','默认报价不可删除。');return;}
    if(!window.confirm('删除后数据不可恢复，是否确认删除？'))return;
    rows=rows.filter(r=>r.id!==id);
    renderTable();
    showToast('warning','已删除',`${item.name}已从列表移除。`);
    return;
  }

  if(action==='submit'){
    if(!window.confirm('是否确认提交审核？提交后将进入审核流程。'))return;
    item.status='pending';
    item.updateTime=formatDateTime(new Date());
    renderTable();
    showToast('success','已提交审核',`${item.name}已进入审核流程。`);
    return;
  }

  if(action==='review'){
    reviewTargetId=id;
    const radios=reviewModal.querySelectorAll('input[name="reviewResult"]');
    radios[0].checked=true;
    reviewReasonWrap.style.display='none';
    reviewReasonInput.value='';
    reviewReasonInput.style.borderColor='';
    reviewModal.classList.add('open');
    reviewModal.setAttribute('aria-hidden','false');
    return;
  }

}

queryBtn.addEventListener('click',queryList);
resetBtn.addEventListener('click',resetList);
keywordInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();queryList();}});
createBtn.addEventListener('click',()=>{window.location.href='quotation-scheme-create.html';});

statusTabs.addEventListener('click',e=>{
  const tab=e.target.closest('.scene-tab');if(!tab)return;
  state.currentTab=tab.dataset.tab;
  state.currentPage=1;
  renderTable();
});

tableBody.addEventListener('click',e=>{
  const t=e.target.closest('[data-action]');if(!t)return;
  e.preventDefault();
  const id=Number(t.dataset.id);
  handleAction(t.dataset.action,id);
});

pageBtnGroup.addEventListener('click',e=>{
  const btn=e.target.closest('.page-btn');if(!btn||btn.classList.contains('disabled'))return;
  const filtered=getFilteredRows();
  const totalPages=Math.max(1,Math.ceil(filtered.length/state.pageSize));
  const p=btn.dataset.page;
  if(p==='prev')state.currentPage=Math.max(1,state.currentPage-1);
  else if(p==='next')state.currentPage=Math.min(totalPages,state.currentPage+1);
  else state.currentPage=Number(p);
  renderTable();
});

pageSizeSelect.addEventListener('change',()=>{state.pageSize=Number(pageSizeSelect.value);state.currentPage=1;renderTable();});
jumpBtn.addEventListener('click',()=>{
  const filtered=getFilteredRows();
  const totalPages=Math.max(1,Math.ceil(filtered.length/state.pageSize));
  const t=Number(jumpInput.value.trim());
  if(!t||t<1||t>totalPages){showToast('error','页码无效',`请输入1-${totalPages}之间的页码。`);jumpInput.value=String(state.currentPage);return;}
  state.currentPage=t;renderTable();
});
jumpInput.addEventListener('input',()=>{jumpInput.value=jumpInput.value.replace(/\D/g,'');});

/* === 审核 Modal 事件 === */
function closeReviewModal(){
  reviewModal.classList.remove('open');
  reviewModal.setAttribute('aria-hidden','true');
  reviewTargetId=null;
}

reviewModal.addEventListener('change',e=>{
  if(e.target.name!=='reviewResult')return;
  reviewReasonWrap.style.display=e.target.value==='reject'?'block':'none';
});

reviewConfirmBtn.addEventListener('click',()=>{
  const selected=reviewModal.querySelector('input[name="reviewResult"]:checked').value;
  const item=rows.find(r=>r.id===reviewTargetId);
  if(!item)return;
  if(selected==='approve'){
    rows.forEach(r=>{
      if(r.id!==item.id&&r.status==='active'&&r.customer===item.customer&&r.warehouse===item.warehouse){
        r.status='inactive';
        r.updateTime=formatDateTime(new Date());
      }
    });
    item.status='active';
    delete item.rejectReason;
    item.updateTime=formatDateTime(new Date());
    closeReviewModal();
    renderTable();
    showToast('success','审核通过',`${item.name}已生效。`);
  }else{
    const reason=reviewReasonInput.value.trim();
    if(!reason){
      reviewReasonInput.focus();
      reviewReasonInput.style.borderColor='var(--danger)';
      setTimeout(()=>{reviewReasonInput.style.borderColor='';},2000);
      return;
    }
    item.status='rejected';
    item.rejectReason=reason;
    item.updateTime=formatDateTime(new Date());
    closeReviewModal();
    renderTable();
    showToast('warning','已驳回',`${item.name}已被驳回。`);
  }
});

reviewCancelBtn.addEventListener('click',closeReviewModal);
reviewModalClose.addEventListener('click',closeReviewModal);
reviewModal.addEventListener('click',e=>{if(e.target===reviewModal)closeReviewModal();});

renderTable();
})();