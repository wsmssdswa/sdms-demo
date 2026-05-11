(()=>{
/* ── DOM refs ── */
const backBtn=document.getElementById('backBtn');
const saveDraftBtn=document.getElementById('saveDraftBtn');
const submitBtn=document.getElementById('submitBtn');
const pageTitleLabel=document.getElementById('pageTitleLabel');
const schemeName=document.getElementById('schemeName');
const customerMultiSelect=document.getElementById('customerMultiSelect');
const customerTrigger=document.getElementById('customerTrigger');
const customerTags=document.getElementById('customerTags');
const customerDropdown=document.getElementById('customerDropdown');
const warehouse=document.getElementById('warehouse');
const startDate=document.getElementById('startDate');
const endDate=document.getElementById('endDate');
const remark=document.getElementById('remark');
const feeConfigSection=document.getElementById('feeConfigSection');
const bizTypeTabs=document.getElementById('bizTypeTabs');
const feeCategoryTree=document.getElementById('feeCategoryTree');
const feeItemToolbar=document.getElementById('feeItemToolbar');
const feeItemList=document.getElementById('feeItemList');
const feeItemFooter=document.getElementById('feeItemFooter');
const schemeSummary=document.getElementById('schemeSummary');
const toastStack=document.getElementById('toastStack');

const escapeHtml=(v)=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* ── Edit / View mode ── */
const params=new URLSearchParams(window.location.search);
const isEdit=params.get('mode')==='edit';
const isView=params.get('mode')==='view';
if(isView){document.body.classList.add('view-mode');}

/* ── Business type config ── */
const BIZ_TYPES=[
  {key:'trunk',label:'干线'},
  {key:'fba',label:'FBA'},
  {key:'lastMileBulk',label:'尾程大货'},
  {key:'lastMileSmall',label:'尾程小货'},
  {key:'warehouseDirect',label:'海外仓代发'}
];

/* ── Fee category tree config ── */
const FEE_CATEGORIES=[
  {key:'logistics',label:'物流费'},
  {key:'storage',label:'仓储费'},
  {key:'operation',label:'操作费',children:[
    {key:'op-inbound',label:'入库'},
    {key:'op-outbound',label:'出库'},
    {key:'op-valueAdded',label:'增值服务'},
    {key:'op-afterSales',label:'售后'}
  ]}
];

/* ── Seed fee data ── */
function buildSeedFeeData(){
  return [
    {id:1,name:'干线空运费',category:'logistics',subCategory:'',desc:'首重/续重 · 分区计价 · EUR',enabled:true,detail:{method:'首重/续重',zones:'3个分区',surcharge:'燃油附加费、偏远地区附加费、COD服务费',period:'2025-01-01 ~ 2025-12-31',preview:'一区：首重0.5kg €45，续重 €8/kg\n二区：首重0.5kg €52，续重 €9.5/kg\n三区：首重0.5kg €60，续重 €11/kg'}},
    {id:2,name:'干线海运费',category:'logistics',subCategory:'',desc:'整柜/拼箱 · 按柜型 · EUR',enabled:true,detail:{method:'整柜/拼箱',zones:'按柜型',surcharge:'BAF、CAF',period:'2025-01-01 ~ 2025-12-31',preview:'20GP: €1800/柜\n40GP: €2800/柜\n40HQ: €3200/柜\n拼箱: €85/CBM'}},
    {id:3,name:'干线铁路费',category:'logistics',subCategory:'',desc:'按柜型 · CNY',enabled:true,detail:{method:'按柜型',zones:'统一价',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'40HQ: ¥12,000/柜'}},
    {id:4,name:'加急空运费',category:'logistics',subCategory:'',desc:'首重/续重 · 分区计价 · EUR',enabled:false,detail:{method:'首重/续重',zones:'5个分区',surcharge:'燃油附加费',period:'2025-01-01 ~ 2025-12-31',preview:'一区：首重0.5kg €65，续重 €12/kg'}},
    {id:5,name:'敏感货物流费',category:'logistics',subCategory:'',desc:'首重/续重 · EUR',enabled:true,detail:{method:'首重/续重',zones:'3个分区',surcharge:'敏感货处理费',period:'2025-01-01 ~ 2025-12-31',preview:'一区：首重0.5kg €55，续重 €10/kg'}},
    {id:6,name:'超大件物流费',category:'logistics',subCategory:'',desc:'按体积重 · EUR',enabled:true,detail:{method:'按体积重',zones:'2个分区',surcharge:'超尺寸附加费',period:'2025-01-01 ~ 2025-12-31',preview:'一区：€12/kg\n二区：€15/kg'}},
    {id:7,name:'标准仓储费',category:'storage',subCategory:'',desc:'CBM/天 · 4个阶梯 · EUR',enabled:true,detail:{method:'CBM/天',zones:'4个天数阶梯',surcharge:'旺季附加费(11-12月+20%)',period:'2025-01-01 ~ 2025-12-31',preview:'0-7天: €0.00/CBM/天\n8-30天: €0.50/CBM/天\n31-60天: €0.80/CBM/天\n61天+: €1.20/CBM/天'}},
    {id:8,name:'长期仓储费',category:'storage',subCategory:'',desc:'CBM/天 · 3个阶梯 · EUR',enabled:true,detail:{method:'CBM/天',zones:'3个天数阶梯',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'0-30天: €0.30/CBM/天\n31-90天: €0.60/CBM/天\n91天+: €1.00/CBM/天'}},
    {id:9,name:'小件仓储费',category:'storage',subCategory:'',desc:'SKU/天 · EUR',enabled:false,detail:{method:'SKU/天',zones:'统一价',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'€0.02/SKU/天'}},
    {id:10,name:'入库操作费',category:'operation',subCategory:'op-inbound',desc:'卸货+清点+上架 · 按托 · EUR',enabled:true,detail:{method:'按托计费',zones:'统一价',surcharge:'超大件加收50%',period:'2025-01-01 ~ 2025-12-31',preview:'标准托: €15/托\n超大托: €22.5/托'}},
    {id:11,name:'入库质检费',category:'operation',subCategory:'op-inbound',desc:'抽检/全检 · 按件 · EUR',enabled:true,detail:{method:'按件计费',zones:'抽检/全检两档',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'抽检: €0.30/件\n全检: €0.80/件'}},
    {id:12,name:'出库操作费',category:'operation',subCategory:'op-outbound',desc:'拣货+打包+贴标 · 按件 · EUR',enabled:true,detail:{method:'按件计费',zones:'标准/大件两档',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'标准件: €1.20/件\n大件: €2.50/件'}},
    {id:13,name:'出库装箱费',category:'operation',subCategory:'op-outbound',desc:'按箱 · EUR',enabled:true,detail:{method:'按箱计费',zones:'统一价',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'€3.00/箱'}},
    {id:14,name:'贴标服务费',category:'operation',subCategory:'op-valueAdded',desc:'按件 · EUR',enabled:true,detail:{method:'按件计费',zones:'统一价',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'€0.15/件'}},
    {id:15,name:'打包服务费',category:'operation',subCategory:'op-valueAdded',desc:'按箱 · EUR',enabled:true,detail:{method:'按箱计费',zones:'标准/定制两档',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'标准箱: €2.00/箱\n定制箱: €4.00/箱'}},
    {id:16,name:'拍照服务费',category:'operation',subCategory:'op-valueAdded',desc:'按次 · EUR',enabled:false,detail:{method:'按次计费',zones:'统一价',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'€5.00/次'}},
    {id:17,name:'退货处理费',category:'operation',subCategory:'op-afterSales',desc:'按件 · EUR',enabled:true,detail:{method:'按件计费',zones:'统一价',surcharge:'无',period:'2025-01-01 ~ 2025-12-31',preview:'€2.00/件'}},
    {id:18,name:'销毁处理费',category:'operation',subCategory:'op-afterSales',desc:'按批 · EUR',enabled:true,detail:{method:'按批计费',zones:'统一价',surcharge:'危险品加收100%',period:'2025-01-01 ~ 2025-12-31',preview:'标准: €20.00/批\n危险品: €40.00/批'}},
  ];
}

let allFeeItems=buildSeedFeeData();

const CUSTOMER_OPTIONS=['深圳ABC贸易有限公司','杭州XYZ物流','上海DEF电商','广州GHI供应链'];

/* ── State ── */
const state={
  currentBizType:'trunk',
  currentCategory:'logistics',
  searchKeyword:'',
  filterType:'all',
  selectedCustomers:new Set(),
  selections:{},
  expandedDetails:new Set()
};

BIZ_TYPES.forEach(bt=>{state.selections[bt.key]=new Set();});

/* ── Edit mode seed ── */
if(isEdit||isView){
  pageTitleLabel.textContent='编辑报价方案';
  document.title='编辑报价方案';
  if(isView){pageTitleLabel.textContent='查看报价方案';document.title='查看报价方案';}
  schemeName.value='ABC贸易-波兰仓标准报价';
  state.selectedCustomers=new Set(['深圳ABC贸易有限公司','杭州XYZ物流']);
  warehouse.value='波兰海外仓';
  startDate.value='2025-01-01';
  endDate.value='2025-12-31';
  state.selections.trunk=new Set([1,2,7,10]);
  state.selections.fba=new Set([1,7,10]);
  state.selections.lastMileBulk=new Set([1,5,7]);
}

/* ── Helpers ── */
function showToast(type,title,desc){
  const toast=document.createElement('div');
  toast.className=`toast ${type}`;
  toast.innerHTML=`<div class="toast-title">${escapeHtml(title)}</div><div class="toast-desc">${escapeHtml(desc)}</div>`;
  toastStack.appendChild(toast);
  requestAnimationFrame(()=>toast.classList.add('show'));
  setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),240);},2200);
}

function getSelectedCount(bizType){
  return state.selections[bizType]?state.selections[bizType].size:0;
}

function getTotalSelectedCount(){
  let total=0;
  BIZ_TYPES.forEach(bt=>{total+=getSelectedCount(bt.key);});
  return total;
}

function getCategorySelectedCount(categoryKey){
  const sel=state.selections[state.currentBizType]||new Set();
  return allFeeItems.filter(item=>{
    if(categoryKey.startsWith('op-')){
      return item.category==='operation'&&item.subCategory===categoryKey;
    }
    return item.category===categoryKey;
  }).filter(item=>sel.has(item.id)).length;
}

function getFilteredFeeItems(){
  const cat=state.currentCategory;
  const items=allFeeItems.filter(item=>{
    if(cat.startsWith('op-')){
      if(item.category!=='operation'||item.subCategory!==cat)return false;
    }else{
      if(item.category!==cat)return false;
    }
    if(!item.enabled)return false;
    if(state.searchKeyword&&!item.name.includes(state.searchKeyword))return false;
    if(state.filterType==='selected'){
      const sel=state.selections[state.currentBizType];
      if(!sel||!sel.has(item.id))return false;
    }
    return true;
  });
  return items;
}

/* ── Render: Business Type Tabs ── */
function renderBizTypeTabs(){
  bizTypeTabs.innerHTML=BIZ_TYPES.map(bt=>{
    const count=getSelectedCount(bt.key);
    const active=bt.key===state.currentBizType?'active':'';
    const badge=count>0?`<span class="tab-badge">${count}</span>`:'';
    return `<div class="biz-type-tab ${active}" data-biz-type="${bt.key}">${bt.label}${badge}</div>`;
  }).join('');
}

/* ── Render: Category Tree ── */
function renderCategoryTree(){
  let html='';
  FEE_CATEGORIES.forEach(cat=>{
    if(cat.children){
      html+=`<div class="tree-group-title">${cat.label}</div>`;
      cat.children.forEach(sub=>{
        const active=sub.key===state.currentCategory?'active':'';
        const cnt=getCategorySelectedCount(sub.key);
        const badge=cnt>0?' <span style="font-size:11px;color:var(--brand)">('+cnt+')</span>':'';
        html+=`<div class="tree-sub-item ${active}" data-category="${sub.key}">${sub.label}${badge}</div>`;
      });
    }else{
      const active=cat.key===state.currentCategory?'active':'';
      const cnt=getCategorySelectedCount(cat.key);
      const badge=cnt>0?' <span style="font-size:11px;color:var(--brand)">('+cnt+')</span>':'';
      html+=`<div class="tree-item ${active}" data-category="${cat.key}">${cat.label}${badge}</div>`;
    }
  });
  feeCategoryTree.innerHTML=html;
}

/* ── Render: Fee Item List ── */
function renderFeeItemList(){
  const items=getFilteredFeeItems();
  const sel=state.selections[state.currentBizType]||new Set();
  const catLabel=FEE_CATEGORIES.find(c=>c.key===state.currentCategory||c.children?.some(sc=>sc.key===state.currentCategory));
  const catName=catLabel?catLabel.label:'';
  const subItem=catLabel?.children?.find(c=>c.key===state.currentCategory);
  const currentLabel=subItem?subItem.label:catName;

  const categorySelCount=items.filter(i=>sel.has(i.id)).length;
  feeItemToolbar.innerHTML=`
    <input class="fee-search" id="feeSearchInput" type="text" placeholder="搜索费用项名称..." value="${escapeHtml(state.searchKeyword)}">
    <span class="filter-chip ${state.filterType==='all'?'active':''}" data-filter="all">全部</span>
    <span class="filter-chip ${state.filterType==='selected'?'active':''}" data-filter="selected">已选 ${categorySelCount}</span>
  `;

  const headerText=`${currentLabel} 共${items.length}项`;
  const allSelected=items.length>0&&items.filter(i=>i.enabled).every(i=>sel.has(i.id));
  let listHtml=`<div class="fee-list-header"><span>${headerText}</span><span class="fee-select-all" id="selectAllBtn">${allSelected?'取消全选':'全选'}</span></div>`;

  if(!items.length){
    listHtml+='<div style="padding:40px;text-align:center;color:var(--text-sub);font-size:13px">暂无费用项</div>';
  }else{
    items.forEach(item=>{
      const isSelected=sel.has(item.id);
      const isExpanded=state.expandedDetails.has(item.id);
      const selCls=isSelected?'selected':'';
            const checkMark=isSelected?'✓':'';
      const detailCls=isExpanded?'expanded':'';
      const toggleText=isExpanded?'▼ 收起':'▶ 展开';

      listHtml+=`<div class="fee-item ${selCls}" data-fee-id="${item.id}">
        <div class="fee-item-header" data-fee-id="${item.id}">
          <div class="fee-checkbox">${checkMark}</div>
          <div class="fee-item-info">
            <div class="fee-item-name">${escapeHtml(item.name)}</div>
            <div class="fee-item-desc">${escapeHtml(item.desc)}${!item.enabled?' · 已停用':''}</div>
          </div>
          <span class="fee-detail-toggle" data-detail-toggle="${item.id}">${toggleText}</span>
        </div>
        <div class="fee-item-detail ${detailCls}">
          <div class="fee-detail-grid">
            <div><div class="fee-detail-label">计费方式</div><div class="fee-detail-value">${escapeHtml(item.detail.method)}</div></div>
            <div><div class="fee-detail-label">分区/规则</div><div class="fee-detail-value">${escapeHtml(item.detail.zones)}</div></div>
            <div><div class="fee-detail-label">附加费</div><div class="fee-detail-value">${escapeHtml(item.detail.surcharge)}</div></div>
            <div><div class="fee-detail-label">适用时间</div><div class="fee-detail-value">${escapeHtml(item.detail.period)}</div></div>
          </div>
          <div class="fee-detail-preview">${escapeHtml(item.detail.preview).replace(/\n/g,'<br>')}</div>
        </div>
      </div>`;
    });
  }
  feeItemList.innerHTML=listHtml;

  const selNames=items.filter(i=>sel.has(i.id)).map(i=>i.name);
  feeItemFooter.innerHTML=`
    <span class="fee-footer-count">已选 ${sel.size} 项</span>
    <span class="fee-footer-items">${escapeHtml(selNames.join('、'))||'暂未选择'}</span>
    ${sel.size>0?'<span class="fee-footer-clear" id="clearSelBtn">清空</span>':''}
  `;

  const searchInput=document.getElementById('feeSearchInput');
  if(searchInput){
    searchInput.addEventListener('input',e=>{
      state.searchKeyword=e.target.value.trim();
      renderFeeItemList();
      const newInput=document.getElementById('feeSearchInput');
      if(newInput){newInput.focus();newInput.selectionStart=newInput.selectionEnd=newInput.value.length;}
    });
  }
}

/* ── Render: Summary ── */
function renderSummary(){
  const items=BIZ_TYPES.map(bt=>{
    const count=getSelectedCount(bt.key);
    return count>0?`${bt.label}${count}项`:null;
  }).filter(Boolean);
  const total=getTotalSelectedCount();
  schemeSummary.innerHTML=`
    <div class="summary-items">
      ${items.length?items.map(s=>`<span>${s}</span>`).join('<span style="color:var(--line)">|</span>'):'<span>暂未选择费用项</span>'}
    </div>
    <div class="summary-total">合计 ${total} 项</div>
  `;
}

/* ── Full render ── */
function render(){
  renderBizTypeTabs();
  renderCategoryTree();
  renderFeeItemList();
  renderSummary();
}

/* ── Event: Biz Type Tab click ── */
bizTypeTabs.addEventListener('click',e=>{
  const tab=e.target.closest('.biz-type-tab');if(!tab)return;
  state.currentBizType=tab.dataset.bizType;
  state.searchKeyword='';
  state.filterType='all';
  render();
});

/* ── Event: Category Tree click ── */
feeCategoryTree.addEventListener('click',e=>{
  const item=e.target.closest('[data-category]');if(!item)return;
  state.currentCategory=item.dataset.category;
  state.searchKeyword='';
  state.filterType='all';
  renderCategoryTree();
  renderFeeItemList();
});

/* ── Event: Fee Item List click ── */
feeItemList.addEventListener('click',e=>{
  const toggle=e.target.closest('[data-detail-toggle]');
  if(toggle){
    const id=Number(toggle.dataset.detailToggle);
    if(state.expandedDetails.has(id))state.expandedDetails.delete(id);
    else state.expandedDetails.add(id);
    renderFeeItemList();
    return;
  }
  const header=e.target.closest('.fee-item-header');
  if(!header)return;
  const feeId=Number(header.dataset.feeId);
  const feeItem=allFeeItems.find(f=>f.id===feeId);
  if(!feeItem||!feeItem.enabled)return;
  const sel=state.selections[state.currentBizType];
  if(sel.has(feeId))sel.delete(feeId);else sel.add(feeId);
  render();
});

/* ── Event: Filter chips ── */
feeItemToolbar.addEventListener('click',e=>{
  const chip=e.target.closest('.filter-chip');if(!chip)return;
  state.filterType=chip.dataset.filter;
  renderFeeItemList();
});

/* ── Event: Select All ── */
feeItemList.addEventListener('click',e=>{
  const btn=e.target.closest('#selectAllBtn');if(!btn)return;
  const items=getFilteredFeeItems().filter(i=>i.enabled);
  const sel=state.selections[state.currentBizType];
  const allSelected=items.length>0&&items.every(i=>sel.has(i.id));
  if(allSelected){items.forEach(i=>sel.delete(i.id));}else{items.forEach(i=>sel.add(i.id));}
  render();
});

/* ── Event: Clear Selection ── */
feeItemFooter.addEventListener('click',e=>{
  const btn=e.target.closest('#clearSelBtn');if(!btn)return;
  state.selections[state.currentBizType]=new Set();
  render();
});

/* ── Form validation ── */
const requiredFields={
  schemeName:{el:schemeName,label:'方案名称',check:()=>!schemeName.value.trim()},
  customer:{el:null,label:'客户名称',check:()=>state.selectedCustomers.size===0},
  warehouse:{el:warehouse,label:'所属仓库',check:()=>!warehouse.value.trim()},
  startDate:{el:startDate,label:'适用时间',check:()=>!startDate.value.trim()},
  endDate:{el:endDate,label:'适用时间',check:()=>!endDate.value.trim()}
};

function validateForm(){
  document.querySelectorAll('.field-tip').forEach(t=>t.textContent='');
  document.querySelectorAll('.field-group').forEach(g=>g.classList.remove('has-error'));
  let hasError=false;
  for(const [key,cfg] of Object.entries(requiredFields)){
    if(cfg.check()){
      const el=cfg.el||customerMultiSelect;
      const group=el.closest('.field-group');
      const tip=group.querySelector('.field-tip');
      if(tip)tip.textContent=`请填写${cfg.label}`;
      group.classList.add('has-error');
      hasError=true;
    }
  }
  if(hasError){showToast('error','验证失败','请检查必填项。');return false;}
  if(getTotalSelectedCount()===0){showToast('error','验证失败','请至少选择一个费用项。');return false;}
  return true;
}

/* ── Save Draft ── */
saveDraftBtn.addEventListener('click',()=>{
  if(!validateForm())return;
  showToast('success','保存成功','报价方案已保存为草稿。');
});

/* ── Submit ── */
submitBtn.addEventListener('click',()=>{
  if(!validateForm())return;
  showToast('success','提交成功','报价方案已提交审核。');
});

/* ── Back ── */
backBtn.addEventListener('click',()=>{
  window.location.href='quotation-scheme-config.html';
});

/* ── Prevent form submit ── */
document.getElementById('schemeForm').addEventListener('submit',e=>e.preventDefault());

/* ── Customer multi-select ── */
function renderCustomerDropdown(){
  customerDropdown.innerHTML=CUSTOMER_OPTIONS.map(opt=>{
    const sel=state.selectedCustomers.has(opt);
    return '<div class="multi-select-option '+(sel?'selected':'')+'" data-customer="'+escapeHtml(opt)+'"><div class="ms-checkbox">'+(sel?'\u2713':'')+'</div><span>'+escapeHtml(opt)+'</span></div>';
  }).join('');
}

function renderCustomerTags(){
  if(state.selectedCustomers.size===0){
    customerTags.innerHTML='<span class="multi-select-placeholder">请选择客户</span>';
  }else{
    customerTags.innerHTML=[...state.selectedCustomers].map(c=>'<span class="multi-select-tag">'+escapeHtml(c)+'<span class="tag-remove" data-remove-customer="'+escapeHtml(c)+'">\u00d7</span></span>').join('');
  }
}

customerTrigger.addEventListener('click',()=>{
  customerDropdown.classList.toggle('open');
  if(customerDropdown.classList.contains('open'))renderCustomerDropdown();
});

customerDropdown.addEventListener('click',e=>{
  const opt=e.target.closest('.multi-select-option');if(!opt)return;
  const val=opt.dataset.customer;
  if(state.selectedCustomers.has(val))state.selectedCustomers.delete(val);
  else state.selectedCustomers.add(val);
  renderCustomerDropdown();
  renderCustomerTags();
  document.querySelectorAll('.field-group[data-field="customer"]').forEach(g=>{g.classList.remove('has-error');g.querySelector('.field-tip').textContent='';});
});

customerTags.addEventListener('click',e=>{
  const rm=e.target.closest('[data-remove-customer]');if(!rm)return;
  state.selectedCustomers.delete(rm.dataset.removeCustomer);
  renderCustomerTags();
});

document.addEventListener('click',e=>{
  if(!customerMultiSelect.contains(e.target))customerDropdown.classList.remove('open');
});

/* ── Init ── */
renderCustomerTags();
render();
})();
