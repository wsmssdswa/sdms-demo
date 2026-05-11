(()=>{
const keywordInput=document.getElementById('keywordInput');
const customerSelect=document.getElementById('customerSelect');
const warehouseSelect=document.getElementById('warehouseSelect');
const statusSelect=document.getElementById('statusSelect');
const queryBtn=document.getElementById('queryBtn');
const resetBtn=document.getElementById('resetBtn');
const createBtn=document.getElementById('createBtn');
const tableBody=document.getElementById('tableBody');
const totalCountText=document.getElementById('totalCountText');
const pageBtnGroup=document.getElementById('pageBtnGroup');
const pageSizeSelect=document.getElementById('pageSizeSelect');
const jumpInput=document.getElementById('jumpInput');
const jumpBtn=document.getElementById('jumpBtn');
const toastStack=document.getElementById('toastStack');

const pad=(n)=>String(n).padStart(2,'0');
const formatDateTime=(date)=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const escapeHtml=(v)=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const STATUS_MAP={draft:{label:'草稿',cls:'draft'},pending:{label:'待审核',cls:'pending'},active:{label:'生效',cls:'active'},inactive:{label:'停用',cls:'inactive'}};

function buildSeedData(){
  const base=[
    {name:'ABC贸易-波兰仓标准报价',customer:'深圳ABC贸易有限公司',warehouse:'波兰海外仓',startDate:'2025-01-01',endDate:'2025-12-31',status:'active',feeCount:12,updater:'张三'},
    {name:'XYZ物流-德国仓FBA报价',customer:'杭州XYZ物流',warehouse:'德国海外仓',startDate:'2025-03-01',endDate:'2026-02-28',status:'active',feeCount:8,updater:'李四'},
    {name:'DEF电商-深圳仓综合报价',customer:'上海DEF电商',warehouse:'深圳保税仓',startDate:'2025-02-15',endDate:'2025-08-15',status:'draft',feeCount:5,updater:'张三'},
    {name:'GHI供应链-波兰仓尾程报价',customer:'广州GHI供应链',warehouse:'波兰海外仓',startDate:'2025-04-01',endDate:'2026-03-31',status:'pending',feeCount:6,updater:'王五'},
    {name:'ABC贸易-德国仓海运报价',customer:'深圳ABC贸易有限公司',warehouse:'德国海外仓',startDate:'2025-05-01',endDate:'2025-11-30',status:'active',feeCount:9,updater:'张三'},
    {name:'XYZ物流-波兰仓干线报价',customer:'杭州XYZ物流',warehouse:'波兰海外仓',startDate:'2025-06-01',endDate:'2025-12-31',status:'inactive',feeCount:7,updater:'李四'},
    {name:'DEF电商-德国仓增值服务报价',customer:'上海DEF电商',warehouse:'德国海外仓',startDate:'2025-01-15',endDate:'2025-07-15',status:'pending',feeCount:4,updater:'王五'},
    {name:'GHI供应链-深圳仓仓储报价',customer:'广州GHI供应链',warehouse:'深圳保税仓',startDate:'2025-07-01',endDate:'2026-06-30',status:'draft',feeCount:3,updater:'张三'},
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
const state={keyword:'',customer:'',warehouse:'',status:'',currentPage:1,pageSize:10};

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
    if(state.customer&&item.customer!==state.customer)return false;
    if(state.warehouse&&item.warehouse!==state.warehouse)return false;
    if(state.status&&item.status!==state.status)return false;
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
  const edit=`<a class="action-link" href="quotation-scheme-create.html?mode=edit&id=${item.id}">编辑</a>`;
  const copy=`<a class="action-link" href="javascript:void(0)" data-action="copy" data-id="${item.id}">复制</a>`;
  const view=`<a class="action-link" href="quotation-scheme-create.html?mode=view&id=${item.id}">查看</a>`;
  const del=`<a class="action-link delete" href="javascript:void(0)" data-action="delete" data-id="${item.id}">删除</a>`;
  const submit=`<a class="action-link" href="javascript:void(0)" data-action="submit" data-id="${item.id}">提交审核</a>`;
  const approve=`<a class="action-link" href="javascript:void(0)" data-action="approve" data-id="${item.id}">审核通过</a>`;
  const reject=`<a class="action-link" href="javascript:void(0)" data-action="reject" data-id="${item.id}">审核驳回</a>`;
  const activate=`<a class="action-link" href="javascript:void(0)" data-action="activate" data-id="${item.id}">启用</a>`;
  const deactivate=`<a class="action-link" href="javascript:void(0)" data-action="deactivate" data-id="${item.id}">停用</a>`;
  if(s==='draft') return `<div class="action-group">${edit}${submit}${copy}${del}</div>`;
  if(s==='pending') return `<div class="action-group">${approve}${reject}${view}</div>`;
  if(s==='active') return `<div class="action-group">${deactivate}${copy}${view}</div>`;
  if(s==='inactive') return `<div class="action-group">${activate}${copy}${view}</div>`;
  return '';
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
      return `<tr>
        <td class="cell-center">${(state.currentPage-1)*state.pageSize+index+1}</td>
        <td><a class="name-link" href="quotation-scheme-create.html?mode=view&id=${item.id}">${escapeHtml(item.name)}</a></td>
        <td>${escapeHtml(item.customer)}</td>
        <td class="cell-center">${escapeHtml(item.warehouse)}</td>
        <td class="cell-center">${escapeHtml(item.startDate)} ~ ${escapeHtml(item.endDate)}</td>
        <td class="cell-center">${item.feeCount}</td>
        <td class="cell-center"><span class="status-tag ${st.cls}">${st.label}</span></td>
        <td>${escapeHtml(item.updateTime)}</td>
        <td>${getActions(item)}</td>
      </tr>`;
    }).join('');
  }
  totalCountText.textContent=`共${total}条记录`;
  jumpInput.value=String(state.currentPage);
  renderPagination(totalPages);
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
  state.status=statusSelect.value;
  state.currentPage=1;
  renderTable();
}

function resetList(){
  state.keyword='';state.customer='';state.warehouse='';state.status='';
  state.currentPage=1;state.pageSize=10;
  keywordInput.value='';customerSelect.value='';warehouseSelect.value='';statusSelect.value='';pageSizeSelect.value='10';
  renderTable();
  showToast('success','已重置','查询条件已恢复默认值。');
}

function handleAction(action,id){
  const item=rows.find(r=>r.id===id);
  if(!item)return;

  if(action==='delete'){
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

  if(action==='approve'){
    if(!window.confirm('是否确认审核通过？审核通过后将立即生效。'))return;
    // 自动停用同客户+同仓库的其他生效方案
    rows.forEach(r=>{
      if(r.id!==item.id&&r.status==='active'&&r.customer===item.customer&&r.warehouse===item.warehouse){
        r.status='inactive';
        r.updateTime=formatDateTime(new Date());
      }
    });
    item.status='active';
    item.updateTime=formatDateTime(new Date());
    renderTable();
    showToast('success','审核通过',`${item.name}已生效。`);
    return;
  }

  if(action==='reject'){
    const reason=window.prompt('请输入驳回原因：');
    if(reason===null)return;
    item.status='draft';
    item.updateTime=formatDateTime(new Date());
    renderTable();
    showToast('warning','已驳回',`${item.name}已退回草稿状态。`);
    return;
  }

  if(action==='activate'){
    // 检查唯一约束：同一客户+同一仓库只能有一个生效方案
    const conflict=rows.find(r=>r.id!==item.id&&r.status==='active'&&r.customer===item.customer&&r.warehouse===item.warehouse);
    if(conflict){
      showToast('error','启用失败',`该客户在${item.warehouse}下已有生效方案「${conflict.name}」，请先停用后再启用。`);
      return;
    }
    if(!window.confirm('是否确认启用该方案？启用后将立即生效。'))return;
    item.status='active';
    item.updateTime=formatDateTime(new Date());
    renderTable();
    showToast('success','已启用',`${item.name}已生效。`);
    return;
  }

  if(action==='deactivate'){
    if(!window.confirm('是否确认停用该方案？停用后将不再生效。'))return;
    item.status='inactive';
    item.updateTime=formatDateTime(new Date());
    renderTable();
    showToast('success','已停用',`${item.name}已停用。`);
    return;
  }

  if(action==='copy'){
    const copyItem={
      id:nextId++,
      name:item.name+'(副本)',
      customer:item.customer,
      warehouse:item.warehouse,
      startDate:item.startDate,
      endDate:item.endDate,
      status:'draft',
      feeCount:item.feeCount,
      updater:item.updater,
      updateTime:formatDateTime(new Date()),
    };
    rows.unshift(copyItem);
    state.currentPage=1;
    renderTable();
    showToast('success','已复制',`已创建「${copyItem.name}」草稿。`);
    return;
  }
}

queryBtn.addEventListener('click',queryList);
resetBtn.addEventListener('click',resetList);
keywordInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();queryList();}});
createBtn.addEventListener('click',()=>{window.location.href='quotation-scheme-create.html';});

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

renderTable();
})();