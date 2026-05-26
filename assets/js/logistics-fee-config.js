(()=>{
const keywordInput=document.getElementById('keywordInput');
const channelSelect=document.getElementById('channelSelect');
const statusSelect=document.getElementById('statusSelect');
const queryBtn=document.getElementById('queryBtn');
const resetBtn=document.getElementById('resetBtn');
const createBtn=document.getElementById('createBtn');
const exportBtn=document.getElementById('exportBtn');
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

function buildSeedData(){
  const base=[
    {name:'波兰仓-西欧专线-快递服务',channel:'西欧专线',weightUnit:'KG',currency:'EUR',fuelRule:'标准燃油附加 (15%)',enabled:true,updater:'张三'},
    {name:'德国仓-全渠道-标准服务',channel:'全渠道',weightUnit:'KG',currency:'EUR',fuelRule:'欧线燃油附加 (12%)',enabled:true,updater:'张三'},
    {name:'深圳仓-东南亚小包专线',channel:'东南亚专线',weightUnit:'KG',currency:'CNY',fuelRule:'亚线燃油附加 (18%)',enabled:false,updater:'李四'},
    {name:'波兰仓-北美专线-经济服务',channel:'北美专线',weightUnit:'LB',currency:'USD',fuelRule:'北美燃油附加 (20%)',enabled:true,updater:'李四'},
    {name:'德国仓-西欧专线-快递服务',channel:'西欧专线',weightUnit:'KG',currency:'EUR',fuelRule:'标准燃油附加 (15%)',enabled:true,updater:'王五'},
    {name:'波兰仓-全渠道-标准服务',channel:'全渠道',weightUnit:'KG',currency:'EUR',fuelRule:'',enabled:true,updater:'张三'},
    {name:'深圳仓-西欧专线-经济服务',channel:'西欧专线',weightUnit:'KG',currency:'CNY',fuelRule:'欧线燃油附加 (12%)',enabled:false,updater:'王五'},
    {name:'德国仓-东南亚专线-小包服务',channel:'东南亚专线',weightUnit:'KG',currency:'EUR',fuelRule:'亚线燃油附加 (18%)',enabled:true,updater:'李四'},
    {name:'波兰仓-北美专线-标准服务',channel:'北美专线',weightUnit:'LB',currency:'USD',fuelRule:'北美燃油附加 (20%)',enabled:true,updater:'张三'},
    {name:'德国仓-全渠道-快递服务',channel:'全渠道',weightUnit:'KG',currency:'EUR',fuelRule:'标准燃油附加 (15%)',enabled:true,updater:'王五'},
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
const state={keyword:'',channel:'',status:'',currentPage:1,pageSize:10};

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
    if(state.channel&&item.channel!==state.channel)return false;
    if(state.status==='enabled'&&!item.enabled)return false;
    if(state.status==='disabled'&&item.enabled)return false;
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

function renderTable(){
  const filtered=getFilteredRows();
  const total=filtered.length;
  const totalPages=Math.max(1,Math.ceil(total/state.pageSize));
  if(state.currentPage>totalPages)state.currentPage=totalPages;
  const current=getPageRows(filtered);
  if(!current.length){
    tableBody.innerHTML='<tr class="empty-row"><td colspan="9">暂无数据</td></tr>';
  }else{
    tableBody.innerHTML=current.map((item,index)=>`<tr>
      <td class="cell-center">${(state.currentPage-1)*state.pageSize+index+1}</td>
      <td><a class="name-link" href="logistics-fee-create.html?mode=edit&id=${item.id}">${escapeHtml(item.name)}</a></td>
      <td>${escapeHtml(item.channel)}</td>
      <td class="cell-center">${escapeHtml(item.weightUnit)}</td>
      <td class="cell-center">${escapeHtml(item.currency)}</td>
      <td>${escapeHtml(item.fuelRule||'-')}</td>
      <td class="cell-center"><label class="switch"><input type="checkbox" data-action="toggle" data-id="${item.id}" ${item.enabled?'checked':''}><span class="slider"></span></label></td>
      <td>${escapeHtml(item.updateTime)}</td>
      <td>
        <a class="action-link" href="logistics-fee-create.html?mode=edit&id=${item.id}">编辑</a>
        <a class="action-link" href="javascript:void(0)" data-action="detail" data-id="${item.id}">详情</a>
        <a class="action-link delete" href="javascript:void(0)" data-action="delete" data-id="${item.id}">删除</a>
      </td>
    </tr>`).join('');
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
  state.channel=channelSelect.value;
  state.status=statusSelect.value;
  state.currentPage=1;
  renderTable();
}

function resetList(){
  state.keyword='';state.channel='';state.status='';
  state.currentPage=1;state.pageSize=10;
  keywordInput.value='';channelSelect.value='';
  statusSelect.value='';pageSizeSelect.value='10';
  renderTable();
  showToast('success','已重置','查询条件已恢复默认值。');
}

function toggleStatus(id){
  const item=rows.find(r=>r.id===id);if(!item)return;
  const next=!item.enabled;
  if(!window.confirm(next?'是否确认启用该物流费？':'是否确认停用该物流费？')){renderTable();return;}
  item.enabled=next;
  renderTable();
  showToast('success','状态已更新',`${item.name}已${next?'启用':'停用'}。`);
}

function deleteRow(id){
  const item=rows.find(r=>r.id===id);if(!item)return;
  if(!window.confirm('删除后数据不可恢复，是否确认删除？'))return;
  rows=rows.filter(r=>r.id!==id);
  renderTable();
  showToast('warning','已删除',`${item.name}已从列表移除。`);
}

queryBtn.addEventListener('click',queryList);
resetBtn.addEventListener('click',resetList);
keywordInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();queryList();}});
createBtn.addEventListener('click',()=>{window.location.href='logistics-fee-create.html';});
exportBtn.addEventListener('click',()=>{showToast('success','导出成功','物流费数据已导出。');});

tableBody.addEventListener('click',e=>{
  const t=e.target.closest('[data-action]');if(!t)return;
  const id=Number(t.dataset.id);
  if(t.dataset.action==='delete'){e.preventDefault();deleteRow(id);}
  if(t.dataset.action==='detail'){showToast('success','查看详情','正在打开物流费详情...');}
});
tableBody.addEventListener('change',e=>{
  const cb=e.target.closest('input[data-action="toggle"]');if(!cb)return;
  toggleStatus(Number(cb.dataset.id));
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
