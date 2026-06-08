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

/* ── Price override helpers ── */
function getOverrides(bizType,feeId){
  return _state.priceOverrides[bizType+'_'+feeId]||{};
}
function hasOverrides(bizType,feeId){
  const o=_state.priceOverrides[bizType+'_'+feeId];
  return o&&Object.keys(o).length>0;
}
function getPrice(overrides,key,original){
  return overrides[key]||original;
}

/* ── Tab list generation ── */
function buildTabList(){
  const bizTabs=[];
  const logTabs=[];
  BIZ_TYPES.forEach(bt=>{
    const sel=_state.selections[bt.key];
    if(!sel||sel.size===0)return;
    const hasStorageOrOp=[...sel].some(id=>{
      const item=_allFeeItems.find(f=>f.id===id);
      return item&&(item.category==='storage'||item.category==='operation');
    });
    if(hasStorageOrOp){
      bizTabs.push({type:'bizType',bizType:bt.key,label:bt.label});
    }
    [...sel].forEach(id=>{
      const item=_allFeeItems.find(f=>f.id===id);
      if(item&&item.category==='logistics'){
        logTabs.push({type:'logistics',bizType:bt.key,feeId:id,label:bt.label+item.name});
      }
    });
  });
  return bizTabs.concat(logTabs);
}

/* ── Rendering ── */
let _state = null;
let _allFeeItems = [];
let currentTabIndex = 0;
let tabList = [];

function renderHeader(){
  const nameEl=document.getElementById('previewSchemeName');
  nameEl.innerHTML=escapeHtml(_state.schemeName)+(_state.isDefault?' <span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:600;background:#e8f4ff;color:#2b5aed;vertical-align:middle">默认</span>':'');
  const metaParts=[];
  if(_state.startDate&&_state.endDate){
    metaParts.push('有效期：'+_state.startDate+' ~ '+_state.endDate);
  }else if(_state.isDefault){
    metaParts.push('有效期：长期有效');
  }
  metaParts.push((_state.isDefault?'适用客户：':'客户：')+_state.selectedCustomers.join(' / '));
  metaParts.push('仓库：'+_state.warehouse);
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
  const feeItem=_allFeeItems.find(f=>f.id===tab.feeId);
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
  const sel=_state.selections[tab.bizType];
  if(!sel||sel.size===0) return '<div style="text-align:center;color:#999;padding:40px">无费用数据</div>';
  const selectedItems=[...sel].map(id=>_allFeeItems.find(f=>f.id===id)).filter(Boolean);
  const storageItems=selectedItems.filter(f=>f.category==='storage');
  const operationItems=selectedItems.filter(f=>f.category==='operation');
  const colgroup='<colgroup>'
    +'<col style="width:52px">'
    +'<col style="width:120px">'
    +'<col style="width:46px">'
    +'<col style="width:200px">'
    +'<col style="width:200px">'
    +'<col style="width:100px">'
    +'<col style="width:100px">'
    +'<col style="width:100px">'
    +'<col style="width:100px">'
    +'<col style="width:100px">'
    +'<col>'
    +'</colgroup>';
  const theadHtml='<thead><tr>'
    +'<th>序号</th>'
    +'<th>计费项</th>'
    +'<th>币种</th>'
    +'<th>主规则</th>'
    +'<th>收费条件</th>'
    +'<th>单价</th>'
    +'<th>减免量</th>'
    +'<th>基础收费</th>'
    +'<th>最低收费</th>'
    +'<th>最高收费</th>'
    +'<th>备注</th>'
    +'</tr></thead>';
  // 0. 表头（独立table，只有thead）
  let html='<table class="fee-table fee-table-header">'+colgroup+theadHtml+'</table>';
  let seq=1;
  // 1. 操作费 — 按 subCategory 分节
  if(operationItems.length){
    const opGroups=[];
    operationItems.forEach(item=>{
      const cat=item.subCategory;
      if(!opGroups.length||opGroups[opGroups.length-1].cat!==cat){
        opGroups.push({cat,items:[item]});
      }else{
        opGroups[opGroups.length-1].items.push(item);
      }
    });
    opGroups.forEach((group,idx)=>{
      const catLabel='操作费-'+(SUB_CATEGORY_MAP[group.cat]||group.cat);
      const isLast=(idx===opGroups.length-1)&&!storageItems.length;
      html+='<div class="section-banner op">'+escapeHtml(catLabel)+'</div>';
      html+='<table class="fee-table'+(isLast?' fee-table-last':'')+'">'+colgroup+'<tbody>';
      group.items.forEach(item=>{
        const itemLines=countOpLines(item);
        let isFirstItem=true;
        const overrides=getOverrides(tab.bizType,item.id);
        item.detail.ruleGroups.forEach((rg,gi)=>{
          const ruleLabel=rg.label.replace(/^规则\d+[：:]\s*/,'');
          let isFirstLine=true;
          rg.lines.forEach((line)=>{
            const key=gi+'_'+rg.lines.indexOf(line);
            const price=getPrice(overrides,key,line.unitPrice);
            html+='<tr>';
            html+='<td class="center">'+seq+'</td>';
            if(isFirstItem){
              html+='<td rowspan="'+itemLines+'">'+escapeHtml(item.name)+'</td>';
              html+='<td rowspan="'+itemLines+'">EUR</td>';
              isFirstItem=false;
            }
            if(isFirstLine){
              html+='<td class="main-rule" rowspan="'+rg.lines.length+'">'+escapeHtml(ruleLabel)+'</td>';
              isFirstLine=false;
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
      html+='</tbody></table>';
    });
  }
  // 2. 仓储费
  if(storageItems.length){
    html+='<div class="section-banner storage">仓储费</div>';
    html+='<table class="fee-table fee-table-last">'+colgroup+'<tbody>';
    storageItems.forEach(item=>{
      html+=renderStorageRows(item,tab.bizType,seq);
      seq+=item.detail.tiers.length;
    });
    html+='</tbody></table>';
  }
  return html;
}

function renderStorageRows(item,bizType,startSeq){
  const d=item.detail;
  const overrides=getOverrides(bizType,item.id);
  let html='';
  d.tiers.forEach((tier,i)=>{
    const price=getPrice(overrides,'tier_'+i,tier.price);
    html+='<tr>';
    html+='<td class="center">'+(startSeq+i)+'</td>';
    if(i===0){
      html+='<td rowspan="'+d.tiers.length+'">'+escapeHtml(item.name)+'</td>';
      html+='<td rowspan="'+d.tiers.length+'">EUR</td>';
      html+='<td rowspan="'+d.tiers.length+'">-</td>';
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

/* ── Global API ── */
window.QuotationPreview = {
  open(previewState, feeItems) {
    _state = previewState;
    _allFeeItems = feeItems;
    currentTabIndex = 0;
    tabList = buildTabList();
    const body = document.querySelector('.preview-modal-body');
    if (body) body.scrollTop = 0;
    renderHeader();
    renderTabs();
    renderContent();
    document.getElementById('previewModal').classList.add('open');
  },
  close() {
    document.getElementById('previewModal').classList.remove('open');
  }
};

/* ── Keyboard / button bindings (run once) ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('previewModal').classList.contains('open')) {
    QuotationPreview.close();
  }
});
document.addEventListener('click', e => {
  if (e.target.id === 'previewModal') QuotationPreview.close();
});
document.getElementById('previewCloseBtn').addEventListener('click', () => QuotationPreview.close());
document.getElementById('previewExportBtn').addEventListener('click', () => {
  // Placeholder - will be implemented later
  if (typeof showToast === 'function') showToast('info', '导出功能', 'Excel导出功能开发中');
  else alert('Excel导出功能开发中');
});
document.getElementById('previewCalcBtn').addEventListener('click', () => {
  if (typeof QuotationTrialCalc !== 'undefined') {
    QuotationTrialCalc.open(_state, _allFeeItems);
  }
});
