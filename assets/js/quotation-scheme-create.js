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
    // ── 物流费 (id 1-6) ──
    {id:1,name:'干线空运费',category:'logistics',subCategory:'',desc:'首重/续重 · 分区计价 · EUR',enabled:true,detail:{
      method:'分区×重量段',
      feeTypes:['配送费','中转费','COD服务费'],
      zones:['一区','二区','三区','四区'],
      weightSteps:['0~0.5kg','0.5~1kg','1~1.5kg','1.5~2kg','2~3kg'],
      pricing:{
        '配送费':[['8.42','12.30','18.56','22.10'],['10.15','14.80','20.22','24.30'],['12.00','16.50','22.80','26.70'],['14.30','18.90','25.00','29.40'],['16.50','21.00','27.30','32.10']],
        '中转费':[['3.20','4.80','6.50','8.10'],['4.00','5.60','7.20','9.00'],['4.80','6.40','8.00','10.00'],['5.60','7.20','9.00','11.20'],['6.40','8.00','10.00','12.50']],
        'COD服务费':[['1.50','2.00','2.50','3.00'],['1.80','2.30','2.80','3.30'],['2.00','2.50','3.00','3.50'],['2.30','2.80','3.30','3.80'],['2.50','3.00','3.50','4.00']]
      },
      renewal:{enabled:true,data:[{zone:'一区',unit:'0.5kg',price:'3.42'},{zone:'二区',unit:'0.5kg',price:'4.10'},{zone:'三区',unit:'0.5kg',price:'5.20'},{zone:'四区',unit:'0.5kg',price:'6.00'}]},
      surcharge:'超长附加费、超重附加费、偏远地区附加费',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:2,name:'干线海运费',category:'logistics',subCategory:'',desc:'整柜/拼箱 · 按柜型 · EUR',enabled:true,detail:{
      method:'按柜型',
      feeTypes:['海运费'],
      zones:['20GP','40GP','40HQ'],
      weightSteps:[],
      pricing:{'海运费':[['1800','2800','3200']]},
      renewal:{enabled:false},
      surcharge:'BAF、CAF',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:3,name:'干线铁路费',category:'logistics',subCategory:'',desc:'按柜型 · CNY',enabled:true,detail:{
      method:'按柜型',
      feeTypes:['铁路费'],
      zones:['40HQ'],
      weightSteps:[],
      pricing:{'铁路费':[['12000']]},
      renewal:{enabled:false},
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:4,name:'加急空运费',category:'logistics',subCategory:'',desc:'首重/续重 · 分区计价 · EUR',enabled:false,detail:{
      method:'分区×重量段',
      feeTypes:['配送费'],
      zones:['一区','二区','三区'],
      weightSteps:['0~0.5kg','0.5~1kg','1~2kg'],
      pricing:{'配送费':[['65','72','80'],['70','78','85'],['80','88','95']]},
      renewal:{enabled:false},
      surcharge:'燃油附加费',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:5,name:'敏感货物流费',category:'logistics',subCategory:'',desc:'首重/续重 · EUR',enabled:true,detail:{
      method:'分区×重量段',
      feeTypes:['配送费'],
      zones:['一区','二区','三区'],
      weightSteps:['0~0.5kg','0.5~1kg','1~2kg','2~5kg'],
      pricing:{'配送费':[['55','62','70'],['60','68','76'],['68','75','82'],['78','85','92']]},
      renewal:{enabled:false},
      surcharge:'敏感货处理费',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:6,name:'超大件物流费',category:'logistics',subCategory:'',desc:'按体积重 · EUR',enabled:true,detail:{
      method:'按体积重',
      feeTypes:['配送费'],
      zones:['一区','二区'],
      weightSteps:[],
      pricing:{'配送费':[['12','15']]},
      renewal:{enabled:false},
      surcharge:'超尺寸附加费',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    // ── 仓储费 (id 7-9) ──
    {id:7,name:'标准仓储费',category:'storage',subCategory:'',desc:'CBM/天 · 4个阶梯 · EUR',enabled:true,detail:{
      method:'CBM/天',
      tiers:[
        {label:'0~7天',price:'0.00'},
        {label:'8~30天',price:'0.50'},
        {label:'31~60天',price:'0.80'},
        {label:'61天+',price:'1.20'}
      ],
      peakSurcharge:'旺季附加费(11-12月+20%)',
      surcharge:'旺季附加费(11-12月+20%)',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:8,name:'长期仓储费',category:'storage',subCategory:'',desc:'CBM/天 · 3个阶梯 · EUR',enabled:true,detail:{
      method:'CBM/天',
      tiers:[
        {label:'0~30天',price:'0.30'},
        {label:'31~90天',price:'0.60'},
        {label:'91天+',price:'1.00'}
      ],
      peakSurcharge:'',
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:9,name:'小件仓储费',category:'storage',subCategory:'',desc:'SKU/天 · EUR',enabled:false,detail:{
      method:'SKU/天',
      tiers:[
        {label:'统一价',price:'0.02'}
      ],
      peakSurcharge:'',
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    // ── 操作费 (id 10-18) ──
    {id:10,name:'入库操作费',category:'operation',subCategory:'op-inbound',desc:'卸货+清点+上架 · 按托 · EUR',enabled:true,detail:{
      method:'按托计费',
      ruleGroups:[
        {label:'规则1：到货形式=整柜，货物类型=箱货',lines:[
          {condition:'柜型=20GP',unit:'柜',unitPrice:'300',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'柜型=40GP',unit:'柜',unitPrice:'350',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'柜型=40HQ',unit:'柜',unitPrice:'450',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'箱数>700',unit:'箱',unitPrice:'0.30',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]},
        {label:'规则2：到货形式=整柜，货物类型=托盘货',lines:[
          {condition:'柜型=20GP',unit:'柜',unitPrice:'220',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'柜型=40GP',unit:'柜',unitPrice:'330',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'柜型=40HQ',unit:'柜',unitPrice:'350',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]},
        {label:'规则3：到货形式=散货',lines:[
          {condition:'货物类型=箱货',unit:'箱',unitPrice:'1.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'货物类型=托盘货',unit:'托',unitPrice:'15.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'单箱重量>23kg',unit:'kg',unitPrice:'0.10',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]},
        {label:'规则4：SKU数量>20',lines:[
          {condition:'SKU数量>20',unit:'SKU',unitPrice:'10.00',waiveAmount:'20',baseFee:'0',minFee:'',maxFee:'100'}
        ]}
      ],
      surcharge:'超大件加收50%',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:11,name:'入库质检费',category:'operation',subCategory:'op-inbound',desc:'抽检/全检 · 按件 · EUR',enabled:true,detail:{
      method:'按件计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'抽检',unit:'件',unitPrice:'0.30',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'全检',unit:'件',unitPrice:'0.80',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:12,name:'出库操作费',category:'operation',subCategory:'op-outbound',desc:'拣货+打包+贴标 · 按件 · EUR',enabled:true,detail:{
      method:'按件计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'标准件',unit:'件',unitPrice:'1.20',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'大件',unit:'件',unitPrice:'2.50',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:13,name:'出库装箱费',category:'operation',subCategory:'op-outbound',desc:'按箱 · EUR',enabled:true,detail:{
      method:'按箱计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'标准箱',unit:'箱',unitPrice:'3.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:14,name:'贴标服务费',category:'operation',subCategory:'op-valueAdded',desc:'按件 · EUR',enabled:true,detail:{
      method:'按件计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'标准',unit:'件',unitPrice:'0.15',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:15,name:'打包服务费',category:'operation',subCategory:'op-valueAdded',desc:'按箱 · EUR',enabled:true,detail:{
      method:'按箱计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'标准箱',unit:'箱',unitPrice:'2.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'定制箱',unit:'箱',unitPrice:'4.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:16,name:'拍照服务费',category:'operation',subCategory:'op-valueAdded',desc:'按次 · EUR',enabled:false,detail:{
      method:'按次计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'标准',unit:'次',unitPrice:'5.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:17,name:'退货处理费',category:'operation',subCategory:'op-afterSales',desc:'按件 · EUR',enabled:true,detail:{
      method:'按件计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'标准',unit:'件',unitPrice:'2.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'无',
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:18,name:'销毁处理费',category:'operation',subCategory:'op-afterSales',desc:'按批 · EUR',enabled:true,detail:{
      method:'按批计费',
      ruleGroups:[
        {label:'规则1：任何场景',lines:[
          {condition:'标准',unit:'批',unitPrice:'20.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''},
          {condition:'危险品',unit:'批',unitPrice:'40.00',waiveAmount:'0',baseFee:'0',minFee:'',maxFee:''}
        ]}
      ],
      surcharge:'危险品加收100%',
      period:'2025-01-01 ~ 2025-12-31'
    }},
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
  expandedDetails:new Set(),
  priceOverrides:{},
  currentFeeTab:{}
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

function getOverrides(bizType,feeId){
  const key=bizType+'_'+feeId;
  return state.priceOverrides[key]||{};
}

function setOverride(bizType,feeId,priceKey,newValue){
  const key=bizType+'_'+feeId;
  if(!state.priceOverrides[key])state.priceOverrides[key]={};
  state.priceOverrides[key][priceKey]=newValue;
}

function clearOverrides(bizType,feeId){
  const key=bizType+'_'+feeId;
  delete state.priceOverrides[key];
}

function hasOverrides(bizType,feeId){
  const key=bizType+'_'+feeId;
  return state.priceOverrides[key]&&Object.keys(state.priceOverrides[key]).length>0;
}

function clearOverride(bizType,feeId,priceKey){
  const key=bizType+'_'+feeId;
  if(state.priceOverrides[key]){
    delete state.priceOverrides[key][priceKey];
    if(Object.keys(state.priceOverrides[key]).length===0)delete state.priceOverrides[key];
  }
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
            <div><div class="fee-detail-label">分区/规则</div><div class="fee-detail-value">${escapeHtml(Array.isArray(item.detail.zones)?item.detail.zones.join('、'):item.detail.tiers?item.detail.tiers.length+'个阶梯':item.detail.ruleGroups?item.detail.ruleGroups.length+'组规则':'')}</div></div>
            <div><div class="fee-detail-label">附加费</div><div class="fee-detail-value">${escapeHtml(item.detail.surcharge)}</div></div>
            <div><div class="fee-detail-label">适用时间</div><div class="fee-detail-value">${escapeHtml(item.detail.period)}</div></div>
          </div>
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
