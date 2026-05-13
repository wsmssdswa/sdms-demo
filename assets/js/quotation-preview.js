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
  const tabs=[];
  BIZ_TYPES.forEach(bt=>{
    const sel=_state.selections[bt.key];
    if(!sel||sel.size===0)return;
    const hasStorageOrOp=[...sel].some(id=>{
      const item=_allFeeItems.find(f=>f.id===id);
      return item&&(item.category==='storage'||item.category==='operation');
    });
    if(hasStorageOrOp){
      tabs.push({type:'bizType',bizType:bt.key,label:bt.label});
    }
    [...sel].forEach(id=>{
      const item=_allFeeItems.find(f=>f.id===id);
      if(item&&item.category==='logistics'){
        tabs.push({type:'logistics',bizType:bt.key,feeId:id,label:bt.label+item.name});
      }
    });
  });
  return tabs;
}

/* ── Rendering ── */
let _state = null;
let _allFeeItems = [];
let currentTabIndex = 0;
let tabList = [];

function renderHeader(){
  document.getElementById('previewSchemeName').textContent=_state.schemeName;
  const metaParts=[];
  metaParts.push('有效期：'+_state.startDate+' ~ '+_state.endDate);
  metaParts.push('客户：'+_state.selectedCustomers.join(' / '));
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
  if (typeof showToast === 'function') showToast('info', '运费试算', '运费试算功能开发中');
  else alert('运费试算功能开发中');
});
