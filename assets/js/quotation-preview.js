(()=>{
/* ── Constants ── */
const BIZ_TYPES=[
  {key:'trunk',label:'干线'},
  {key:'fba',label:'FBA'},
  {key:'lastMileBulk',label:'尾程大货'},
  {key:'lastMileSmall',label:'尾程小货'},
  {key:'warehouseDirect',label:'海外仓代发'}
];
const FEE_CATEGORIES=[
  {key:'logistics',label:'物流费'},
  {key:'storage',label:'仓储费'},
  {key:'operation',label:'操作费',children:[
    {key:'op-inbound',label:'入库'},{key:'op-outbound',label:'出库'},
    {key:'op-valueAdded',label:'增值服务'},{key:'op-afterSales',label:'售后'}
  ]}
];
const SUB_CATEGORY_MAP={'op-inbound':'入库','op-outbound':'出库','op-valueAdded':'增值','op-afterSales':'售后'};

const escapeHtml=(v)=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* ── Seed data (copied from quotation-scheme-create.js) ── */
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

const allFeeItems=buildSeedFeeData();

/* ── State ── */
const state={
  schemeName:'ABC贸易-波兰仓标准报价',
  selectedCustomers:['深圳ABC贸易有限公司','杭州XYZ物流'],
  warehouse:'波兰海外仓',
  startDate:'2025-01-01',
  endDate:'2025-12-31',
  selections:{},
  priceOverrides:{}
};
BIZ_TYPES.forEach(bt=>{state.selections[bt.key]=new Set();});

// 编辑模式seed
state.selections.trunk=new Set([1,2,7,10]);
state.selections.fba=new Set([1,7,10]);
state.selections.lastMileBulk=new Set([1,5,7]);
state.priceOverrides={
  'trunk_1':{'配送费_0_0':'7.50','配送费_0_2':'16.00'},
  'trunk_7':{'tier_1':'0.45'},
  'trunk_10':{'0_0':'280'}
};

/* ── Price override helpers ── */
function getOverrides(bizType,feeId){
  return state.priceOverrides[bizType+'_'+feeId]||{};
}
function hasOverrides(bizType,feeId){
  const o=state.priceOverrides[bizType+'_'+feeId];
  return o&&Object.keys(o).length>0;
}
function getPrice(overrides,key,original){
  return overrides[key]||original;
}

/* ── Tab list generation ── */
function buildTabList(){
  const tabs=[];
  BIZ_TYPES.forEach(bt=>{
    const sel=state.selections[bt.key];
    if(!sel||sel.size===0)return;
    const hasStorageOrOp=[...sel].some(id=>{
      const item=allFeeItems.find(f=>f.id===id);
      return item&&(item.category==='storage'||item.category==='operation');
    });
    if(hasStorageOrOp){
      tabs.push({type:'bizType',bizType:bt.key,label:bt.label});
    }
    [...sel].forEach(id=>{
      const item=allFeeItems.find(f=>f.id===id);
      if(item&&item.category==='logistics'){
        tabs.push({type:'logistics',bizType:bt.key,feeId:id,label:bt.label+item.name});
      }
    });
  });
  return tabs;
}

/* ── Rendering ── */
let currentTabIndex=0;
const tabList=buildTabList();

function renderHeader(){
  document.getElementById('previewSchemeName').textContent=state.schemeName;
  const metaParts=[];
  metaParts.push('有效期：'+state.startDate+' ~ '+state.endDate);
  metaParts.push('客户：'+state.selectedCustomers.join(' / '));
  metaParts.push('仓库：'+state.warehouse);
  document.getElementById('previewMeta').textContent=metaParts.join(' | ');
}

function renderTabs(){
  const container=document.getElementById('previewTabs');
  container.innerHTML=tabList.map((tab,i)=>
    `<div class="preview-tab${i===currentTabIndex?' active':''}" data-tab-idx="${i}">${escapeHtml(tab.label)}</div>`
  ).join('');
  container.querySelectorAll('.preview-tab').forEach(el=>{
    el.addEventListener('click',()=>{
      currentTabIndex=parseInt(el.dataset.tabIdx);
      renderTabs();
      renderContent();
    });
  });
}

function renderContent(){
  const container=document.getElementById('previewContent');
  const tab=tabList[currentTabIndex];
  if(!tab){container.innerHTML='<div style="text-align:center;color:#999;padding:40px">暂无报价数据</div>';return;}
  if(tab.type==='logistics'){
    container.innerHTML=renderLogisticsTab(tab);
  }else{
    container.innerHTML=renderBizTypeTab(tab);
  }
  bindFoldable(container);
}

function buildBillingInfo(feeItem,d){
  const parts=[];
  if(d.volWeightCoeff) parts.push('计重：实重与体积重取大（体积系数 '+d.volWeightCoeff+'）');
  if(d.fuelRule) parts.push(d.fuelRule.name+'（费率 '+d.fuelRule.rate+'%）');
  if(d.renewal&&d.renewal.enabled) parts.push('续重按每'+d.renewal.data[0].unit+'加收');
  if(!parts.length) return '';
  return '<div class="billing-info">'+parts.join(' | ')+'</div>';
}

function buildPriceMatrix(d,feeType,overrides){
  const matrix=d.pricing[feeType];
  if(!matrix) return '';
  const isSimple=d.weightSteps.length===0;
  let html='<table class="price-matrix"><thead><tr>';
  html+='<th>'+(isSimple?'项目':'重量段')+'</th>';
  d.zones.forEach(z=>html+='<th>'+escapeHtml(z)+'</th>');
  html+='</tr></thead><tbody>';
  if(isSimple){
    html+='<tr><td class="row-label">'+escapeHtml(feeType)+'</td>';
    matrix[0].forEach((price,colIdx)=>{
      const key=feeType+'_0_'+colIdx;
      const val=getPrice(overrides,key,price);
      html+='<td>€'+escapeHtml(val)+'</td>';
    });
    html+='</tr>';
  }else{
    d.weightSteps.forEach((ws,rowIdx)=>{
      html+='<tr><td class="row-label">'+escapeHtml(ws)+'</td>';
      d.zones.forEach((_,colIdx)=>{
        const key=feeType+'_'+rowIdx+'_'+colIdx;
        const val=getPrice(overrides,key,matrix[rowIdx][colIdx]);
        html+='<td>€'+escapeHtml(val)+'</td>';
      });
      html+='</tr>';
    });
    if(d.renewal&&d.renewal.enabled&&d.renewal.data&&d.renewal.data.length&&feeType!=='COD服务费'){
      html+='<tr class="renewal-row"><td class="row-label">续重 +'+d.renewal.data[0].unit+'</td>';
      d.renewal.data.forEach(rd=>html+='<td>€'+escapeHtml(rd.price)+'</td>');
      html+='</tr>';
    }
  }
  html+='</tbody></table>';
  return html;
}

function buildSurchargeDesc(rules){
  let html='<div class="surcharge-section"><h4>附加费说明</h4><div class="surcharge-grid">';
  rules.forEach(rule=>{
    html+='<div class="surcharge-row"><div class="label">'+escapeHtml(rule.name)+'</div><div class="value">';
    html+=escapeHtml(rule.hitRule);
    if(rule.type==='size'&&rule.fees){
      html+='，按分区加收：';
      html+=rule.zones.map((z,i)=>escapeHtml(z)+' €'+escapeHtml(rule.fees[i])).join(' / ');
      if(rule.fuelEnabled) html+='（含燃油）';
    }else if(rule.type==='remote'){
      html+='，按分区×重量段计价';
      if(rule.renewalEnabled) html+='（含续重）';
      html+='，详见 <a>《偏远地区表》</a>';
    }
    html+='</div></div>';
  });
  html+='</div></div>';
  const hasRemote=rules.some(r=>r.type==='remote');
  if(hasRemote){
    html+='<div class="foldable"><div class="foldable-header"><span>偏远地区表</span><span class="arrow">▶</span></div>';
    html+='<div class="foldable-body"><div style="text-align:center;color:#999;padding:12px;font-size:11px">偏远地区数据待对接</div></div></div>';
    html+='<div class="foldable"><div class="foldable-header"><span>超偏远地区表</span><span class="arrow">▶</span></div>';
    html+='<div class="foldable-body"><div style="text-align:center;color:#999;padding:12px;font-size:11px">超偏远地区数据待对接</div></div></div>';
  }
  return html;
}

function renderLogisticsTab(tab){
  const feeItem=allFeeItems.find(f=>f.id===tab.feeId);
  if(!feeItem) return '<div style="text-align:center;color:#999;padding:40px">费用项不存在</div>';
  const d=feeItem.detail;
  const overrides=getOverrides(tab.bizType,tab.feeId);
  let html='';
  html+='<div class="logistics-header"><h3>'+escapeHtml(feeItem.name)+'</h3>';
  html+='<div class="sub">'+escapeHtml(feeItem.channel)+' · '+escapeHtml(d.method)+' · EUR</div></div>';
  html+=buildBillingInfo(feeItem,d);
  d.feeTypes.forEach(ft=>{
    html+='<div style="font-weight:500;margin-bottom:6px;font-size:12px">'+escapeHtml(ft)+'</div>';
    html+=buildPriceMatrix(d,ft,overrides);
  });
  if(d.surchargeRules&&d.surchargeRules.length>0){
    html+=buildSurchargeDesc(d.surchargeRules);
  }
  return html;
}

function renderBizTypeTab(tab){
  const sel=state.selections[tab.bizType];
  if(!sel||sel.size===0) return '<div style="text-align:center;color:#999;padding:40px">无费用数据</div>';
  const selectedItems=[...sel].map(id=>allFeeItems.find(f=>f.id===id)).filter(Boolean);
  const storageItems=selectedItems.filter(f=>f.category==='storage');
  const operationItems=selectedItems.filter(f=>f.category==='operation');
  let html='<div class="logistics-header"><h3>'+escapeHtml(tab.label)+' — 仓储费 & 操作费</h3></div>';
  html+='<table class="fee-table"><thead><tr>';
  html+='<th style="width:36px;text-align:center">序号</th>';
  html+='<th style="width:60px">费用类型</th>';
  html+='<th style="width:90px">计费项</th>';
  html+='<th style="width:40px">币种</th>';
  html+='<th>收费条件</th>';
  html+='<th style="width:70px">单价</th>';
  html+='<th style="width:50px">减免量</th>';
  html+='<th style="width:55px">基础收费</th>';
  html+='<th style="width:55px">最低收费</th>';
  html+='<th style="width:55px">最高收费</th>';
  html+='<th style="width:100px">备注</th>';
  html+='</tr></thead><tbody>';
  let seq=1;
  if(storageItems.length){
    html+='<tr class="section-row storage-section"><td colspan="11">仓储费</td></tr>';
    storageItems.forEach(item=>{
      html+=renderStorageRows(item,tab.bizType,seq);
      seq+=item.detail.tiers.length;
    });
  }
  if(operationItems.length){
    html+='<tr class="section-row op-section"><td colspan="11">操作费</td></tr>';
    // Group items by subCategory for cross-item rowspan merging
    const opGroups=[];
    operationItems.forEach(item=>{
      const cat=item.subCategory;
      if(!opGroups.length||opGroups[opGroups.length-1].cat!==cat){
        opGroups.push({cat,items:[item]});
      }else{
        opGroups[opGroups.length-1].items.push(item);
      }
    });
    opGroups.forEach(group=>{
      const catLabel='操作费-'+(SUB_CATEGORY_MAP[group.cat]||'操作费');
      const totalGroupLines=group.items.reduce((s,it)=>s+countOpLines(it),0);
      let isFirstInGroup=true;
      group.items.forEach(item=>{
        const itemLines=countOpLines(item);
        let isFirstInItem=true;
        const overrides=getOverrides(tab.bizType,item.id);
        item.detail.ruleGroups.forEach((rg,gi)=>{
          rg.lines.forEach((line,li)=>{
            const key=gi+'_'+li;
            const price=getPrice(overrides,key,line.unitPrice);
            const altClass=seq%2===0?' alt-row':'';
            html+='<tr class="'+altClass+'">';
            html+='<td class="center">'+seq+'</td>';
            if(isFirstInGroup){
              html+='<td rowspan="'+totalGroupLines+'">'+escapeHtml(catLabel)+'</td>';
              isFirstInGroup=false;
            }
            if(isFirstInItem){
              html+='<td rowspan="'+itemLines+'">'+escapeHtml(item.name)+'</td>';
              html+='<td rowspan="'+itemLines+'">EUR</td>';
              isFirstInItem=false;
            }
            html+='<td>'+escapeHtml(line.condition)+'</td>';
            html+='<td>€'+escapeHtml(price)+'/'+escapeHtml(line.unit)+'</td>';
            html+='<td>'+(line.waiveAmount&&line.waiveAmount!=='0'?escapeHtml(line.waiveAmount):'-')+'</td>';
            html+='<td>'+(line.baseFee&&line.baseFee!=='0'?'€'+escapeHtml(line.baseFee):'-')+'</td>';
            html+='<td>'+(line.minFee?'€'+escapeHtml(line.minFee):'-')+'</td>';
            html+='<td>'+(line.maxFee?'€'+escapeHtml(line.maxFee):'-')+'</td>';
            html+='<td></td>';
            html+='</tr>';
            seq++;
          });
        });
      });
    });
  }
  html+='</tbody></table>';
  return html;
}

function renderStorageRows(item,bizType,startSeq){
  const d=item.detail;
  const overrides=getOverrides(bizType,item.id);
  let html='';
  d.tiers.forEach((tier,i)=>{
    const price=getPrice(overrides,'tier_'+i,tier.price);
    const altClass=i%2===1?' alt-row':'';
    html+='<tr class="'+altClass+'">';
    html+='<td class="center">'+(startSeq+i)+'</td>';
    if(i===0){
      html+='<td rowspan="'+d.tiers.length+'">仓储费</td>';
      html+='<td rowspan="'+d.tiers.length+'">'+escapeHtml(item.name)+'</td>';
      html+='<td rowspan="'+d.tiers.length+'">EUR</td>';
    }
    html+='<td>'+escapeHtml(tier.label)+'</td>';
    html+='<td>€'+escapeHtml(price)+'/'+escapeHtml(d.method)+'</td>';
    html+='<td>-</td><td>-</td><td>-</td><td>-</td>';
    const remark=(i===d.tiers.length-1&&d.surcharge&&d.surcharge!=='无')?escapeHtml(d.surcharge):'';
    html+='<td>'+remark+'</td>';
    html+='</tr>';
  });
  return html;
}

function countOpLines(item){
  let count=0;
  item.detail.ruleGroups.forEach(rg=>count+=rg.lines.length);
  return count;
}


function bindFoldable(root){
  root.querySelectorAll('.foldable-header').forEach(header=>{
    header.addEventListener('click',()=>header.classList.toggle('open'));
  });
}

/* ── Init ── */
renderHeader();
renderTabs();
renderContent();

/* ── Button actions ── */
document.getElementById('backBtn').addEventListener('click',()=>{if(window.history.length>1)window.history.back();else window.close();});
document.getElementById('editBtn').addEventListener('click',()=>window.open('quotation-scheme-create.html?mode=edit','_blank'));
})();
