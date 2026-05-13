(()=>{
/* ── DOM refs ── */
const backBtn=document.getElementById('backBtn');
const saveDraftBtn=document.getElementById('saveDraftBtn');
const submitBtn=document.getElementById('submitBtn');
const previewBtn=document.getElementById('previewBtn');
const pageTitleLabel=document.getElementById('pageTitleLabel');
const schemeName=document.getElementById('schemeName');
const customerMultiSelect=document.getElementById('customerMultiSelect');
const customerTrigger=document.getElementById('customerTrigger');
const customerTags=document.getElementById('customerTags');
const customerDropdown=document.getElementById('customerDropdown');
const warehouse=document.getElementById('warehouse');
const startDate=document.getElementById('startDate');
const endDate=document.getElementById('endDate');
const dateRangeTrigger=document.getElementById('dateRangeTrigger');
const dateRangeText=document.getElementById('dateRangeText');
const dateRangePopover=document.getElementById('dateRangePopover');
const dateRangeClose=document.getElementById('dateRangeClose');
const dateRangeInfo=document.getElementById('dateRangeInfo');
const dateRangeMonthA=document.getElementById('dateRangeMonthA');
const dateRangeMonthB=document.getElementById('dateRangeMonthB');
const dateRangeGridA=document.getElementById('dateRangeGridA');
const dateRangeGridB=document.getElementById('dateRangeGridB');
const dateRangePrev=document.getElementById('dateRangePrev');
const dateRangeNext=document.getElementById('dateRangeNext');
const dateRangeClearBtn=document.getElementById('dateRangeClearBtn');
const dateRangeCancelBtn=document.getElementById('dateRangeCancelBtn');
const dateRangeConfirmBtn=document.getElementById('dateRangeConfirmBtn');
const remark=document.getElementById('remark');
const feeConfigSection=document.getElementById('feeConfigSection');
const bizTypeTabs=document.getElementById('bizTypeTabs');
const feeCategoryTree=document.getElementById('feeCategoryTree');
const feeItemToolbar=document.getElementById('feeItemToolbar');
const feeItemList=document.getElementById('feeItemList');
const feeItemFooter=document.getElementById('feeItemFooter');
const schemeSummary=document.getElementById('schemeSummary');
const toastStack=document.getElementById('toastStack');
const feeSelectModal=document.getElementById('feeSelectModal');
const feeSelectModalTitle=document.getElementById('feeSelectModalTitle');
const feeSelectModalCount=document.getElementById('feeSelectModalCount');
const feeSelectSearch=document.getElementById('feeSelectSearch');
const feeSelectBody=document.getElementById('feeSelectBody');
const feeSelectInfo=document.getElementById('feeSelectInfo');
const feeSelectCancelBtn=document.getElementById('feeSelectCancelBtn');
const feeSelectConfirmBtn=document.getElementById('feeSelectConfirmBtn');

const escapeHtml=(v)=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const FEE_PAGE_MAP={logistics:'logistics-fee-create.html',storage:'storage-fee-create.html',operation:'operation-fee-create.html'};
const getFeeItemUrl=(item)=>FEE_PAGE_MAP[item.category]+'?mode=edit&id='+item.id;

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
    {id:1,name:'干线空运费',category:'logistics',subCategory:'',desc:'首重/续重 · 分区计价 · EUR',enabled:true,channel:'西欧专线',detail:{
      method:'分区×重量段',weightUnit:'KG',volWeightMethod:'体积/体积系数',volWeightCoeff:6000,fuelRule:{name:'标准燃油附加',rate:15},
      feeTypes:['配送费','中转费','COD服务费'],
      zones:['一区','二区','三区','四区'],
      weightSteps:['0~0.5kg','0.5~1kg','1~1.5kg','1.5~2kg','2~3kg'],
      pricing:{
        '配送费':[['8.42','12.30','18.56','22.10'],['10.15','14.80','20.22','24.30'],['12.00','16.50','22.80','26.70'],['14.30','18.90','25.00','29.40'],['16.50','21.00','27.30','32.10']],
        '中转费':[['3.20','4.80','6.50','8.10'],['4.00','5.60','7.20','9.00'],['4.80','6.40','8.00','10.00'],['5.60','7.20','9.00','11.20'],['6.40','8.00','10.00','12.50']],
        'COD服务费':[['1.50','2.00','2.50','3.00'],['1.80','2.30','2.80','3.30'],['2.00','2.50','3.00','3.50'],['2.30','2.80','3.30','3.80'],['2.50','3.00','3.50','4.00']]
      },
      renewal:{enabled:true,data:[{zone:'一区',unit:'0.5kg',price:'3.42'},{zone:'二区',unit:'0.5kg',price:'4.10'},{zone:'三区',unit:'0.5kg',price:'5.20'},{zone:'四区',unit:'0.5kg',price:'6.00'}]},
      surchargeRules:[
        {type:'size',name:'超长附加费',hitRule:'规则A-单边超长',fuelEnabled:true,zones:['一区','二区','三区','四区'],fees:['15.00','18.00','20.00','22.00']},
        {type:'size',name:'超重附加费',hitRule:'规则B-超重',fuelEnabled:false,zones:['一区','二区','三区','四区'],fees:['8.00','10.00','12.00','14.00']},
        {type:'remote',name:'偏远附加费',hitRule:'按邮编匹配',fuelEnabled:false,renewalEnabled:true,zones:['一区','二区','三区','四区'],weightSteps:['0~0.5kg','0.5~1kg','1~2kg'],fees:[['8.00','10.00','12.00','14.00'],['10.00','12.00','14.00','16.00'],['12.00','14.00','16.00','18.00']],renewal:{unit:'0.5kg',prices:['3.00','4.00','5.00','6.00']}}
      ],
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:2,name:'干线海运费',category:'logistics',subCategory:'',desc:'整柜/拼箱 · 按柜型 · EUR',enabled:true,channel:'西欧专线',detail:{
      method:'按柜型',weightUnit:'KG',volWeightMethod:'体积/体积系数',volWeightCoeff:6000,fuelRule:{name:'欧线燃油附加',rate:12},
      feeTypes:['海运费'],
      zones:['20GP','40GP','40HQ'],
      weightSteps:[],
      pricing:{'海运费':[['1800','2800','3200']]},
      renewal:{enabled:false},
      surchargeRules:[
        {type:'size',name:'BAF(燃油调整系数)',hitRule:'按费率加收',fuelEnabled:false,zones:['20GP','40GP','40HQ'],fees:['150','200','250']},
        {type:'size',name:'CAF(货币调整系数)',hitRule:'按费率加收',fuelEnabled:false,zones:['20GP','40GP','40HQ'],fees:['100','130','160']}
      ],
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:3,name:'干线铁路费',category:'logistics',subCategory:'',desc:'按柜型 · CNY',enabled:true,channel:'全渠道',detail:{
      method:'按柜型',weightUnit:'KG',volWeightMethod:'CBM*体积系数',volWeightCoeff:6000,fuelRule:null,
      feeTypes:['铁路费'],
      zones:['40HQ'],
      weightSteps:[],
      pricing:{'铁路费':[['12000']]},
      renewal:{enabled:false},
      surchargeRules:[],
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:4,name:'加急空运费',category:'logistics',subCategory:'',desc:'首重/续重 · 分区计价 · EUR',enabled:false,channel:'北美专线',detail:{
      method:'分区×重量段',weightUnit:'KG',volWeightMethod:'体积/体积系数',volWeightCoeff:6000,fuelRule:{name:'标准燃油附加',rate:15},
      feeTypes:['配送费'],
      zones:['一区','二区','三区'],
      weightSteps:['0~0.5kg','0.5~1kg','1~2kg'],
      pricing:{'配送费':[['65','72','80'],['70','78','85'],['80','88','95']]},
      renewal:{enabled:false},
      surchargeRules:[
        {type:'size',name:'燃油附加费',hitRule:'按燃油指数浮动',fuelEnabled:false,zones:['一区','二区','三区'],fees:['12%','15%','18%']}
      ],
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:5,name:'敏感货物流费',category:'logistics',subCategory:'',desc:'首重/续重 · EUR',enabled:true,channel:'东南亚专线',detail:{
      method:'分区×重量段',weightUnit:'KG',volWeightMethod:'体积/体积系数',volWeightCoeff:6000,fuelRule:null,
      feeTypes:['配送费'],
      zones:['一区','二区','三区'],
      weightSteps:['0~0.5kg','0.5~1kg','1~2kg','2~5kg'],
      pricing:{'配送费':[['55','62','70'],['60','68','76'],['68','75','82'],['78','85','92']]},
      renewal:{enabled:false},
      surchargeRules:[
        {type:'size',name:'敏感货处理费',hitRule:'含电池/液体/粉末类货物',fuelEnabled:false,zones:['一区','二区','三区'],fees:['10.00','12.00','15.00']}
      ],
      period:'2025-01-01 ~ 2025-12-31'
    }},
    {id:6,name:'超大件物流费',category:'logistics',subCategory:'',desc:'按体积重 · EUR',enabled:true,channel:'北美专线',detail:{
      method:'按体积重',weightUnit:'LB',volWeightMethod:'CBM*体积系数',volWeightCoeff:5000,fuelRule:{name:'北美燃油附加',rate:20},
      feeTypes:['配送费'],
      zones:['一区','二区'],
      weightSteps:[],
      pricing:{'配送费':[['12','15']]},
      renewal:{enabled:false},
      surchargeRules:[
        {type:'size',name:'超尺寸附加费',hitRule:'规则C-超尺寸',fuelEnabled:false,zones:['一区','二区'],fees:['20.00','25.00']}
      ],
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
  selectedCustomers:new Set(),
  selections:{},
  expandedDetails:new Set(),
  priceOverrides:{},
  currentFeeTab:{},
  modalSearch:'',
  modalChecks:new Set(),
  activeEditCell:null,
  dateDraftStart:null,
  dateDraftEnd:null,
  dateViewBase:null
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
  dateRangeText.textContent='2025-01-01 ~ 2025-12-31';
  dateRangeTrigger.classList.remove('is-empty');
  state.selections.trunk=new Set([1,2,7,10]);
  state.selections.fba=new Set([1,7,10]);
  state.selections.lastMileBulk=new Set([1,5,7]);
  state.priceOverrides={
    'trunk_1':{ '配送费_0_0':'7.50', '配送费_0_2':'16.00' },
    'trunk_7':{ 'tier_1':'0.45' },
    'trunk_10':{ '0_0':'280' }
  };
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

function getCategoryOverrideCount(categoryKey){
  const sel=state.selections[state.currentBizType]||new Set();
  return allFeeItems.filter(item=>{
    if(categoryKey.startsWith('op-')){
      return item.category==='operation'&&item.subCategory===categoryKey;
    }
    return item.category===categoryKey;
  }).filter(item=>sel.has(item.id)&&hasOverrides(state.currentBizType,item.id)).length;
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
        const ovCnt=getCategoryOverrideCount(sub.key);
        const ovBadge=ovCnt>0?' <span class="fee-override-badge-tree">改'+ovCnt+'</span>':'';
        html+=`<div class="tree-sub-item ${active}" data-category="${sub.key}">${sub.label}${badge}${ovBadge}</div>`;
      });
    }else{
      const active=cat.key===state.currentCategory?'active':'';
      const cnt=getCategorySelectedCount(cat.key);
      const badge=cnt>0?' <span style="font-size:11px;color:var(--brand)">('+cnt+')</span>':'';
      const ovCnt=getCategoryOverrideCount(cat.key);
      const ovBadge=ovCnt>0?' <span class="fee-override-badge-tree">改'+ovCnt+'</span>':'';
      html+=`<div class="tree-item ${active}" data-category="${cat.key}">${cat.label}${badge}${ovBadge}</div>`;
    }
  });
  feeCategoryTree.innerHTML=html;
}

/* ── Render: price cell helper ── */
function renderPriceCell(feeId,key,price,ov){
  const hasOv=!!ov[key];
  const isActive=state.activeEditCell&&state.activeEditCell.feeId===feeId&&state.activeEditCell.key===key;
  if(isActive){
    const editVal=hasOv?ov[key]:price;
    return `<td class="cell-editing"><span class="price-original">${escapeHtml(price)}</span><input class="price-input" data-override="${escapeHtml(key)}" data-orig-price="${escapeHtml(price)}" value="${escapeHtml(editVal)}"></td>`;
  }
  if(hasOv){
    return `<td class="cell-modified" data-orig="原价: ${escapeHtml(price)}"><span class="price-value" data-override="${escapeHtml(key)}">${escapeHtml(ov[key])}</span></td>`;
  }
  return `<td><span class="price-readonly" data-override="${escapeHtml(key)}">${escapeHtml(price)}</span></td>`;
}

function renderPriceInline(feeId,key,price,ov,unitHtml){
  const hasOv=!!ov[key];
  const isActive=state.activeEditCell&&state.activeEditCell.feeId===feeId&&state.activeEditCell.key===key;
  if(isActive){
    const editVal=hasOv?ov[key]:price;
    return `<span class="price-original">${escapeHtml(price)}</span><input class="price-input" data-override="${escapeHtml(key)}" data-orig-price="${escapeHtml(price)}" value="${escapeHtml(editVal)}">${unitHtml}`;
  }
  if(hasOv){
    return `<span class="price-value" data-override="${escapeHtml(key)}" data-orig="原价: ${escapeHtml(price)}">${escapeHtml(ov[key])}</span>${unitHtml}`;
  }
  return `<span class="price-readonly" data-override="${escapeHtml(key)}">${escapeHtml(price)}</span>${unitHtml}`;
}

/* ── Render: Logistics Detail (zone x weight matrix) ── */
function renderLogisticsDetail(item,bizType){
  const d=item.detail;
  if(!d)return '';
  const feeTypes=d.feeTypes||[];
  const zones=d.zones||[];
  const weightSteps=d.weightSteps||[];
  const pricing=d.pricing||{};
  const renewal=d.renewal||{};
  const surchargeRules=d.surchargeRules||[];
  const ov=getOverrides(bizType,item.id);
  const isSimple=weightSteps.length===0;
  const hasSurcharge=surchargeRules.length>0;
  const currentTabIdx=state.currentFeeTab[item.id]||0;
  const isSurchargeTab=hasSurcharge&&currentTabIdx===feeTypes.length;
  const activeFeeType=feeTypes[currentTabIdx]||feeTypes[0]||'';

  let html='';

  // feeType tabs (show when multiple feeTypes or has surcharge)
  if(feeTypes.length>1||hasSurcharge){
    html+='<div class="fee-type-tabs">';
    feeTypes.forEach((ft,idx)=>{
      const cls=idx===currentTabIdx?'fee-type-tab active':'fee-type-tab';
      html+=`<span class="${cls}" data-fee-tab="${item.id}" data-tab-idx="${idx}">${escapeHtml(ft)}</span>`;
    });
    // add surcharge tab
    const surCls=isSurchargeTab?'fee-type-tab active':'fee-type-tab';
    html+=`<span class="${surCls}" data-fee-tab="${item.id}" data-tab-idx="${feeTypes.length}">附加费</span>`;
    html+='</div>';
  }

  if(isSurchargeTab){
    html+='<div class="fee-detail-section">';
    surchargeRules.forEach(rule=>{
      html+=`<div class="surcharge-rule-block">`;
      // header: name + hitRule + tags
      const tags=[];
      if(rule.fuelEnabled)tags.push('<span class="surcharge-tag">含燃油</span>');
      if(rule.type==='remote'&&rule.renewalEnabled)tags.push('<span class="surcharge-tag">含续重</span>');
      html+=`<div class="surcharge-rule-head"><span class="surcharge-rule-name">${escapeHtml(rule.name)}</span><span class="surcharge-rule-hit">${escapeHtml(rule.hitRule)}</span>${tags.join('')}</div>`;
      // pricing table
      if(rule.type==='size'){
        html+=`<table class="fee-price-matrix surcharge-table"><thead><tr>${rule.zones.map(z=>`<th>${escapeHtml(z)}</th>`).join('')}</tr></thead><tbody><tr>${rule.fees.map(f=>`<td>${escapeHtml(f)}</td>`).join('')}</tr>`;
        html+='</tbody></table>';
      }else if(rule.type==='remote'){
        html+=`<table class="fee-price-matrix surcharge-table"><thead><tr><th></th>${rule.zones.map(z=>`<th>${escapeHtml(z)}</th>`).join('')}</tr></thead><tbody>`;
        rule.fees.forEach((row,idx)=>{
          html+=`<tr><td>${escapeHtml(rule.weightSteps[idx]||'')}</td>${row.map(f=>`<td>${escapeHtml(f)}</td>`).join('')}</tr>`;
        });
        if(rule.renewalEnabled&&rule.renewal){
          html+=`<tr class="renewal-row"><td>续重(+${escapeHtml(rule.renewal.unit)})</td>${rule.renewal.prices.map(f=>`<td>${escapeHtml(f)}</td>`).join('')}</tr>`;
        }
        html+='</tbody></table>';
      }else if(rule.type==='cod'){
        (rule.currencies||[]).forEach(cur=>{
          html+=`<div class="surcharge-cod-group"><span class="surcharge-cod-cur">${escapeHtml(cur.currency)}</span><table class="fee-price-matrix surcharge-table"><thead><tr><th>金额区间</th><th>附加费</th></tr></thead><tbody>`;
          cur.ranges.forEach(r=>{
            const rangeText=r.max?`${r.min}~${r.max}`:`${r.min}+`;
            html+=`<tr><td>${escapeHtml(rangeText)}</td><td>${escapeHtml(r.fee)} ${escapeHtml(cur.currency)}</td></tr>`;
          });
          html+='</tbody></table></div>';
        });
      }
      html+='</div>';
    });
    html+='</div>';
  }else{
    // pricing matrix
    const matrix=pricing[activeFeeType]||[];

    if(isSimple){
      const row=matrix[0]||[];
      html+='<div class="fee-detail-section">';
      html+='<table class="fee-price-matrix"><thead><tr><th></th>';
      zones.forEach(z=>{html+=`<th>${escapeHtml(z)}</th>`;});
      html+='</tr></thead><tbody>';
      html+=`<tr><td>${escapeHtml(activeFeeType)}</td>`;
      row.forEach((price,colIdx)=>{
        const key=activeFeeType+'_0_'+colIdx;
        html+=renderPriceCell(item.id,key,price,ov);
      });
      html+='</tr></tbody></table></div>';
    }else{
      html+='<div class="fee-detail-section">';
      html+='<table class="fee-price-matrix"><thead><tr><th></th>';
      zones.forEach(z=>{html+=`<th>${escapeHtml(z)}</th>`;});
      html+='</tr></thead><tbody>';
      matrix.forEach((row,rowIdx)=>{
        html+=`<tr><td>${escapeHtml(weightSteps[rowIdx]||'')}</td>`;
        row.forEach((price,colIdx)=>{
          const key=activeFeeType+'_'+rowIdx+'_'+colIdx;
          html+=renderPriceCell(item.id,key,price,ov);
        });
        html+='</tr>';
      });
      // renewal row inside matrix
      if(renewal.enabled&&renewal.data&&renewal.data.length&&!isSimple&&activeFeeType!=='COD服务费'){
        const rUnit=renewal.data[0]?renewal.data[0].unit:'';
        html+=`<tr class="renewal-row"><td>续重(+${escapeHtml(rUnit)})</td>`;
        zones.forEach(z=>{
          const match=renewal.data.find(r=>r.zone===z);
          html+=`<td>${match?escapeHtml(match.price):'-'}</td>`;
        });
        html+='</tr>';
      }
      html+='</tbody></table></div>';
    }
  }

  return html;
}

/* ── Render: Storage Detail (tier price list) ── */
function renderStorageDetail(item,bizType){
  const d=item.detail;
  if(!d)return '';
  const tiers=d.tiers||[];
  const method=d.method||'';
  const peakSurcharge=d.peakSurcharge||'';
  const surcharge=d.surcharge||'';
  const ov=getOverrides(bizType,item.id);

  let html='';

  // tiers
  html+='<div class="fee-detail-section">';
  tiers.forEach((tier,idx)=>{
    const key='tier_'+idx;
    const hasOv=!!ov[key];
    const cls=hasOv?'tier-price-row has-modified':'tier-price-row';
    html+=`<div class="${cls}">`;
    html+=`<span class="tier-label">${escapeHtml(tier.label)}</span>`;
    html+=renderPriceInline(item.id,key,tier.price,ov,`<span class="tier-unit">${escapeHtml(method)}</span>`);
    html+='</div>';
  });
  html+='</div>';

  // peak surcharge (readonly)
  if(peakSurcharge){
    html+=`<div class="fee-detail-section readonly"><div class="fee-detail-label">旺季附加费</div><div class="fee-detail-value">${escapeHtml(peakSurcharge)}</div></div>`;
  }

  return html;
}

/* ── Render: Operation Detail (rule groups) ── */
function renderOperationDetail(item,bizType){
  const d=item.detail;
  if(!d)return '';
  const ruleGroups=d.ruleGroups||[];
  const ov=getOverrides(bizType,item.id);

  let html='';

  // rule groups
  html+='<div class="fee-detail-section">';
  ruleGroups.forEach((group,gIdx)=>{
    // check if any line in this group has override
    let groupHasOverride=false;
    group.lines.forEach((line,lIdx)=>{
      const key=gIdx+'_'+lIdx;
      if(ov[key])groupHasOverride=true;
    });

    html+=`<div class="rule-group-block">`;
    const badge=groupHasOverride?'<span class="fee-override-badge">改</span>':'';
    html+=`<div class="rule-group-title">${escapeHtml(group.label)}${badge}</div>`;
    html+='<div class="rule-group-lines">';
    group.lines.forEach((line,lIdx)=>{
      const key=gIdx+'_'+lIdx;
      const hasOv=!!ov[key];
      const lineCls=hasOv?'rule-line has-modified':'rule-line';
      html+=`<div class="${lineCls}">`;
      html+=`<span class="rule-line-condition">${escapeHtml(line.condition)}</span>`;
      html+=renderPriceInline(item.id,key,line.unitPrice,ov,`<span class="rule-line-unit">EUR/${escapeHtml(line.unit)}</span>`);
      html+='</div>';
    });
    html+='</div></div>';
  });
  html+='</div>';

  return html;
}

/* ── Render: Fee detail router ── */
function renderFeeDetail(item,bizType){
  if(item.category==='logistics')return renderLogisticsDetail(item,bizType);
  if(item.category==='storage')return renderStorageDetail(item,bizType);
  if(item.category==='operation')return renderOperationDetail(item,bizType);
  return '';
}

/* ── Render: Fee Item List ── */
function renderFeeItemList(){
  const items=getFilteredFeeItems();
  const sel=state.selections[state.currentBizType]||new Set();
  const catLabel=FEE_CATEGORIES.find(c=>c.key===state.currentCategory||c.children?.some(sc=>sc.key===state.currentCategory));
  const catName=catLabel?catLabel.label:'';
  const subItem=catLabel?.children?.find(c=>c.key===state.currentCategory);
  const currentLabel=subItem?subItem.label:catName;

  feeItemToolbar.innerHTML=`
    <button class="btn btn-primary" id="addFeeBtn" type="button" style="padding:4px 14px;font-size:12px">选择费用项</button>
  `;

  const selectedItems=items.filter(i=>sel.has(i.id));
  let listHtml='';

  if(!selectedItems.length){
    listHtml=`<div class="fee-empty-state">
      <div style="color:var(--text-sub);font-size:13px;margin-bottom:12px">当前分类暂无已选费用项</div>
      <button class="btn btn-primary" id="addFeeBtnEmpty" type="button" style="font-size:12px">选择费用项</button>
    </div>`;
  }else{
    selectedItems.forEach(item=>{
      const isExpanded=state.expandedDetails.has(item.id);
      const ovBadge=hasOverrides(state.currentBizType,item.id)?'<span class="fee-override-badge">已调价</span>':'';
      const detailCls=isExpanded?'expanded':'';
      const toggleText=isExpanded?'▼ 收起':'▶ 展开';
      const restoreBtn=hasOverrides(state.currentBizType,item.id)&&isExpanded?`<button class="fee-restore-btn" data-restore-overrides="${item.id}">恢复原价</button>`:'';

      let descText=item.desc||'';
      if(item.category==='logistics'&&item.detail){
        const d=item.detail;
        const parts=[item.channel||'',d.weightUnit||'',d.volWeightMethod||'','系数'+(d.volWeightCoeff||'-')];
        if(d.fuelRule)parts.push(d.fuelRule.name+'('+d.fuelRule.rate+'%)');
        descText=parts.filter(Boolean).join(' · ');
      }

      listHtml+=`<div class="fee-item selected" data-fee-id="${item.id}">
        <div class="fee-item-header" data-fee-id="${item.id}">
          <div class="fee-item-info">
            <div class="fee-item-name"><a class="fee-item-link" href="${getFeeItemUrl(item)}" target="_blank">${escapeHtml(item.name)}</a>${ovBadge}</div>
            <div class="fee-item-desc">${escapeHtml(descText)}</div>
          </div>
          ${restoreBtn}
          <span class="fee-detail-toggle" data-detail-toggle="${item.id}">${toggleText}</span>
          <span class="fee-item-remove" data-remove-fee="${item.id}">×</span>
        </div>
        <div class="fee-item-detail ${detailCls}">${renderFeeDetail(item,state.currentBizType)}</div>
      </div>`;
    });
  }
  feeItemList.innerHTML=listHtml;

  const selNames=items.filter(i=>sel.has(i.id)).map(i=>i.name);
  feeItemFooter.innerHTML=`
    <span class="fee-footer-count">已选 ${selectedItems.length} 项</span>
    <span class="fee-footer-items">${escapeHtml(selNames.join('、'))||'暂未选择'}</span>
  `;
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

/* ── Date Range Picker ── */
const pad=v=>String(v).padStart(2,'0');
const fmtDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fmtMonth=d=>`${d.getFullYear()}年${d.getMonth()+1}月`;
const parseDate=s=>s?new Date(s+'T00:00:00'):null;
const addDays=(d,n)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r;};
const addMonths=(d,n)=>{const r=new Date(d);r.setMonth(r.getMonth()+n,1);return r;};
const monthStart=d=>new Date(d.getFullYear(),d.getMonth(),1);

function buildCalendarCells(monthText,startText,endText){
  const md=parseDate(monthText)||monthStart(new Date());
  const ms=monthStart(md);
  const offset=(ms.getDay()+6)%7;
  const gs=addDays(ms,-offset);
  const today=fmtDate(new Date());
  return Array.from({length:42},(_,i)=>{
    const cur=addDays(gs,i);
    const text=fmtDate(cur);
    const hasRange=Boolean(startText&&endText);
    return{text,day:cur.getDate(),inMonth:cur.getMonth()===ms.getMonth(),isToday:text===today,isStart:Boolean(startText)&&text===startText,isEnd:Boolean(endText)&&text===endText,inRange:hasRange&&text>=startText&&text<=endText};
  });
}

function renderDateCalendar(){
  const base=state.dateViewBase||monthStart(new Date());
  const next=addMonths(base,1);
  dateRangeMonthA.textContent=fmtMonth(base);
  dateRangeMonthB.textContent=fmtMonth(next);
  [dateRangeGridA,dateRangeGridB].forEach((grid,idx)=>{
    const monthText=fmtDate(idx===0?base:next);
    const cells=buildCalendarCells(monthText,state.dateDraftStart,state.dateDraftEnd);
    grid.innerHTML=cells.map(c=>{
      const cls=['date-range-cell',c.inRange?'is-in-range':'',c.isStart?'is-range-start':'',c.isEnd?'is-range-end':''].filter(Boolean).join(' ');
      const dcls=['date-range-day',!c.inMonth?'is-muted':'',c.isToday?'is-today':'',c.isStart||c.isEnd?'is-selected':''].filter(Boolean).join(' ');
      return `<div class="${cls}"><button type="button" class="${dcls}" data-dr-day="${c.text}">${c.day}</button></div>`;
    }).join('');
  });
  dateRangeInfo.textContent=state.dateDraftStart&&state.dateDraftEnd
    ?`${state.dateDraftStart} ~ ${state.dateDraftEnd}`
    :state.dateDraftStart?`已选起始: ${state.dateDraftStart}，请选择结束日期`:'请选择开始日期和结束日期';
}

function openDateRangePicker(){
  state.dateDraftStart=startDate.value||null;
  state.dateDraftEnd=endDate.value||null;
  const base=parseDate(state.dateDraftStart||state.dateDraftEnd)||new Date();
  state.dateViewBase=monthStart(base);
  renderDateCalendar();
  dateRangePopover.setAttribute('aria-hidden','false');
}

function closeDateRangePicker(){
  dateRangePopover.setAttribute('aria-hidden','true');
  state.dateDraftStart=null;
  state.dateDraftEnd=null;
}

function updateDateRangeTrigger(){
  const s=startDate.value,e=endDate.value;
  if(s&&e){
    dateRangeText.textContent=`${s} ~ ${e}`;
    dateRangeTrigger.classList.remove('is-empty');
  }else{
    dateRangeText.textContent='请选择日期范围';
    dateRangeTrigger.classList.add('is-empty');
  }
}

/* ── Event: Biz Type Tab click ── */
bizTypeTabs.addEventListener('click',e=>{
  const tab=e.target.closest('.biz-type-tab');if(!tab)return;
  state.currentBizType=tab.dataset.bizType;
  render();
});

/* ── Event: Category Tree click ── */
feeCategoryTree.addEventListener('click',e=>{
  const item=e.target.closest('[data-category]');if(!item)return;
  state.currentCategory=item.dataset.category;
  renderCategoryTree();
  renderFeeItemList();
});

/* ── Event: Fee Item List click ── */
feeItemList.addEventListener('click',e=>{
  const removeBtn=e.target.closest('[data-remove-fee]');
  if(removeBtn){
    const feeId=Number(removeBtn.dataset.removeFee);
    if(hasOverrides(state.currentBizType,feeId)){
      if(!window.confirm('该费用项已调整价格，删除后调价数据将丢失，是否确认删除？'))return;
    }
    const sel=state.selections[state.currentBizType];
    sel.delete(feeId);
    clearOverrides(state.currentBizType,feeId);
    state.expandedDetails.delete(feeId);
    render();
    return;
  }
  const restoreBtn=e.target.closest('[data-restore-overrides]');
  if(restoreBtn){
    const feeId=Number(restoreBtn.dataset.restoreOverrides);
    clearOverrides(state.currentBizType,feeId);
    renderFeeItemList();
    return;
  }
  const header=e.target.closest('.fee-item-header');
  if(header&&!e.target.closest('.fee-item-link')){
    const feeId=Number(header.dataset.feeId);
    if(state.expandedDetails.has(feeId))state.expandedDetails.delete(feeId);
    else state.expandedDetails.add(feeId);
    renderFeeItemList();
    return;
  }
});

/* ── Event: FeeType Tab click ── */
feeItemList.addEventListener('click',e=>{
  const tab=e.target.closest('[data-fee-tab]');if(!tab)return;
  const feeId=Number(tab.dataset.feeTab);
  const idx=Number(tab.dataset.tabIdx);
  state.currentFeeTab[feeId]=idx;
  renderFeeItemList();
});

/* ── Event: Price click-to-edit (readonly or modified value) ── */
feeItemList.addEventListener('click',e=>{
  const priceEl=e.target.closest('.price-readonly')||e.target.closest('.price-value');if(!priceEl)return;
  const oKey=priceEl.dataset.override;
  const feeId=Number(e.target.closest('.fee-item').dataset.feeId);
  const feeItem=allFeeItems.find(f=>f.id===feeId);
  if(!feeItem||!feeItem.enabled)return;
  state.activeEditCell={feeId,key:oKey};
  renderFeeItemList();
  const input=feeItemList.querySelector('.cell-editing .price-input')||feeItemList.querySelector('.price-input');
  if(input)input.focus();
});

/* ── Event: Price input keydown (Enter → blur) ── */
feeItemList.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;
  const input=e.target.closest('.price-input');if(!input)return;
  input.blur();
});

/* ── Event: Price input focusout (save or clear) ── */
feeItemList.addEventListener('focusout',e=>{
  const input=e.target.closest('.price-input');if(!input)return;
  const oKey=input.dataset.override;
  const feeId=Number(e.target.closest('.fee-item').dataset.feeId);
  const origPrice=input.dataset.origPrice||'';
  const newVal=input.value.trim();
  if(!newVal||isNaN(Number(newVal))){
    clearOverride(state.currentBizType,feeId,oKey);
  }else if(newVal===origPrice){
    clearOverride(state.currentBizType,feeId,oKey);
  }else{
    setOverride(state.currentBizType,feeId,oKey,newVal);
  }
  state.activeEditCell=null;
  renderFeeItemList();
});

/* ── Form validation ── */
const requiredFields={
  schemeName:{el:schemeName,label:'方案名称',check:()=>!schemeName.value.trim()},
  customer:{el:null,label:'客户名称',check:()=>state.selectedCustomers.size===0},
  warehouse:{el:warehouse,label:'所属仓库',check:()=>!warehouse.value.trim()},
  dateRange:{el:dateRangeTrigger,label:'适用时间',check:()=>!startDate.value.trim()||!endDate.value.trim()}
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
  const ovCount=Object.keys(state.priceOverrides).length;
  const ovMsg=ovCount>0?`，其中${ovCount}项费用有价格调整`:'';
  showToast('success','保存成功','报价方案已保存为草稿'+ovMsg+'。');
});

/* ── Submit ── */
submitBtn.addEventListener('click',()=>{
  if(!validateForm())return;
  const ovCount=Object.keys(state.priceOverrides).length;
  const ovMsg=ovCount>0?`，其中${ovCount}项费用有价格调整`:'';
  showToast('success','提交成功','报价方案已提交审核'+ovMsg+'。');
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

/* ── Fee Select Modal ── */
function openFeeSelectModal(){
  const catLabel=FEE_CATEGORIES.find(c=>c.key===state.currentCategory||c.children?.some(sc=>sc.key===state.currentCategory));
  const catName=catLabel?catLabel.label:'';
  const subItem=catLabel?.children?.find(c=>c.key===state.currentCategory);
  const currentLabel=subItem?subItem.label:catName;
  feeSelectModalTitle.textContent='选择费用项 — '+currentLabel;
  state.modalSearch='';
  state.modalChecks=new Set();
  feeSelectSearch.value='';
  renderFeeSelectTable();
  feeSelectModal.style.display='flex';
}

function closeFeeSelectModal(){
  feeSelectModal.style.display='none';
  state.modalChecks=new Set();
  state.modalSearch='';
}

function getModalItems(){
  const cat=state.currentCategory;
  return allFeeItems.filter(item=>{
    if(cat.startsWith('op-')){
      if(item.category!=='operation'||item.subCategory!==cat)return false;
    }else{
      if(item.category!==cat)return false;
    }
    if(state.modalSearch&&!item.name.includes(state.modalSearch))return false;
    return true;
  });
}

function renderFeeSelectTable(){
  const items=getModalItems();
  const sel=state.selections[state.currentBizType]||new Set();
  feeSelectModalCount.textContent='共'+items.length+'项可选';
  if(!items.length){
    feeSelectBody.innerHTML='<tr><td colspan="6" style="padding:30px;text-align:center;color:var(--text-sub)">暂无匹配的费用项</td></tr>';
  }else{
    feeSelectBody.innerHTML=items.map(item=>{
      const isAlreadyAdded=sel.has(item.id);
      const isDisabled=!item.enabled;
      const rowCls=isAlreadyAdded?'modal-row-added':isDisabled?'modal-row-disabled':'';
      const cbDisabled=isAlreadyAdded||isDisabled;
      const cbChecked=isAlreadyAdded||state.modalChecks.has(item.id);
      let statusHtml='';
      if(isAlreadyAdded)statusHtml='<span class="modal-status-tag added">已添加</span>';
      else if(isDisabled)statusHtml='<span class="modal-status-tag disabled">已停用</span>';
      else statusHtml='<span class="modal-status-tag enabled">启用</span>';
      const ch=item.channel||'-';
      const wu=item.detail&&item.detail.weightUnit?item.detail.weightUnit:'-';
      let fr='-';
      if(item.detail&&item.detail.fuelRule)fr=item.detail.fuelRule.name+'('+item.detail.fuelRule.rate+'%)';
      return `<tr class="${rowCls}">
        <td><input type="checkbox" data-modal-fee-id="${item.id}" ${cbChecked?'checked':''} ${cbDisabled?'disabled':''}></td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(ch)}</td>
        <td>${escapeHtml(wu)}</td>
        <td>${escapeHtml(fr)}</td>
        <td>${statusHtml}</td>
      </tr>`;
    }).join('');
  }
  const newCount=state.modalChecks.size;
  feeSelectInfo.innerHTML='已选 <b>'+newCount+'</b> 项（本次新增）';
}

/* ── Event: Add Fee button (toolbar) ── */
feeItemToolbar.addEventListener('click',e=>{
  if(e.target.closest('#addFeeBtn')){openFeeSelectModal();return;}
});
feeItemList.addEventListener('click',e=>{
  if(e.target.closest('#addFeeBtnEmpty')){openFeeSelectModal();return;}
});

/* ── Event: Modal search ── */
feeSelectSearch.addEventListener('input',e=>{
  state.modalSearch=e.target.value.trim();
  renderFeeSelectTable();
});

/* ── Event: Modal checkbox ── */
feeSelectBody.addEventListener('change',e=>{
  const cb=e.target.closest('[data-modal-fee-id]');if(!cb)return;
  const feeId=Number(cb.dataset.modalFeeId);
  if(cb.checked)state.modalChecks.add(feeId);
  else state.modalChecks.delete(feeId);
  renderFeeSelectTable();
});

/* ── Event: Modal cancel ── */
feeSelectCancelBtn.addEventListener('click',closeFeeSelectModal);

/* ── Event: Modal confirm ── */
feeSelectConfirmBtn.addEventListener('click',()=>{
  const sel=state.selections[state.currentBizType];
  state.modalChecks.forEach(feeId=>{sel.add(feeId);});
  closeFeeSelectModal();
  render();
});

/* ── Event: Modal mask click to close ── */
feeSelectModal.addEventListener('click',e=>{
  if(e.target===feeSelectModal)closeFeeSelectModal();
});

/* ── Event: Date Range Picker ── */
dateRangeTrigger.addEventListener('click',openDateRangePicker);
dateRangeClose.addEventListener('click',closeDateRangePicker);
dateRangeCancelBtn.addEventListener('click',closeDateRangePicker);
dateRangeClearBtn.addEventListener('click',()=>{
  state.dateDraftStart=null;state.dateDraftEnd=null;renderDateCalendar();
});
dateRangeConfirmBtn.addEventListener('click',()=>{
  let s=state.dateDraftStart,e=state.dateDraftEnd;
  if(s&&!e)e=s;if(!s&&e)s=e;
  if(s&&e&&s>e)[s,e]=[e,s];
  startDate.value=s||'';endDate.value=e||'';
  updateDateRangeTrigger();
  closeDateRangePicker();
});
dateRangePopover.addEventListener('click',e=>{if(e.target===dateRangePopover)closeDateRangePicker();});
dateRangePrev.addEventListener('click',()=>{state.dateViewBase=addMonths(state.dateViewBase,-1);renderDateCalendar();});
dateRangeNext.addEventListener('click',()=>{state.dateViewBase=addMonths(state.dateViewBase,1);renderDateCalendar();});
[dateRangeGridA,dateRangeGridB].forEach(grid=>{
  grid.addEventListener('click',e=>{
    const btn=e.target.closest('[data-dr-day]');if(!btn)return;
    const day=btn.dataset.drDay;
    if(!state.dateDraftStart||(state.dateDraftStart&&state.dateDraftEnd)){
      state.dateDraftStart=day;state.dateDraftEnd=null;
    }else if(day<state.dateDraftStart){
      state.dateDraftEnd=state.dateDraftStart;state.dateDraftStart=day;
    }else{
      state.dateDraftEnd=day;
    }
    renderDateCalendar();
  });
});

if(previewBtn)previewBtn.addEventListener('click',()=>{QuotationPreview.open({schemeName:schemeName.value||'未命名方案',selectedCustomers:[...state.selectedCustomers],warehouse:warehouse.value,startDate:startDate.value,endDate:endDate.value,selections:state.selections,priceOverrides:state.priceOverrides},allFeeItems);});

/* ── Init ── */
renderCustomerTags();
updateDateRangeTrigger();
render();
})();
