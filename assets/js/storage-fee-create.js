(()=>{
/* ── DOM refs ── */
const backBtn=document.getElementById('backBtn');
const saveBtn=document.getElementById('saveBtn');
const pageTitleLabel=document.getElementById('pageTitleLabel');
const feeName=document.getElementById('feeName');
const customer=document.getElementById('customer');
const warehouse=document.getElementById('warehouse');
const unitSelect=document.getElementById('unit');
const currency=document.getElementById('currency');
const startDate=document.getElementById('startDate');
const endDate=document.getElementById('endDate');
const effectType=document.getElementById('effectType');
const remark=document.getElementById('remark');
const addTierBtn=document.getElementById('addTierBtn');
const tierHead=document.getElementById('tierHead');
const tierBody=document.getElementById('tierBody');
const peakEnabledCheck=document.getElementById('peakEnabledCheck');
const addPeakBtn=document.getElementById('addPeakBtn');
const peakTableWrap=document.getElementById('peakTableWrap');
const peakHead=document.getElementById('peakHead');
const peakBody=document.getElementById('peakBody');
const tierSection=document.getElementById('tierSection');
const toastStack=document.getElementById('toastStack');

const escapeHtml=(v)=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* ── State ── */
const state={
  tiers:[
    {endDays:'7',unitPrice:'0.00'},
    {endDays:'30',unitPrice:'0.50'},
    {endDays:'60',unitPrice:'0.80'},
    {endDays:'',unitPrice:'1.20'}
  ],
  peakSeason:{
    enabled:false,
    rules:[]
  }
};

/* ── Edit mode ── */
const params=new URLSearchParams(window.location.search);
const isEdit=params.get('mode')==='edit';
if(isEdit){
  pageTitleLabel.textContent='编辑仓储费';
  document.title='编辑仓储费';
  feeName.value='标准仓储费';
  customer.value='深圳市星辰电子商务有限公司';
  warehouse.value='波兰海外仓';
  unitSelect.value='CBM';
  currency.value='EUR';
  startDate.value='2025-01-01';
  endDate.value='2025-12-31';
  state.peakSeason.enabled=true;
  state.peakSeason.rules=[
    {startMonth:11,endMonth:12,type:'percent',value:'20'},
    {startMonth:6,endMonth:8,type:'fixed',value:'0.10'}
  ];
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

function getStartDay(idx){
  if(idx===0)return 0;
  const prev=state.tiers[idx-1];
  const prevEnd=Number(prev.endDays);
  return prevEnd?prevEnd+1:0;
}

function getCurrency(){return currency.value||'EUR';}
function getUnit(){return unitSelect.value||'CBM';}

/* ── Tier Table ── */
function renderTierTable(){
  const cur=getCurrency();
  const u=getUnit();
  tierHead.innerHTML=`<tr>
    <th style="width:40px">#</th>
    <th>存储天数区间（天）</th>
    <th style="width:160px">单价（${escapeHtml(cur)}/${escapeHtml(u)}/天）</th>
    <th style="width:100px">操作</th>
  </tr>`;

  tierBody.innerHTML=state.tiers.map((tier,idx)=>{
    const startDay=getStartDay(idx);
    const isLast=idx===state.tiers.length-1;
    const isFirst=idx===0;
    const startInput=`<input class="surcharge-input tier-days-readonly" value="${startDay}" readonly>`;
    const endInput=isLast
      ?`<span class="tier-infinity">∞ 无上限</span>`
      :`<input class="surcharge-input" data-field="endDays" data-idx="${idx}" value="${escapeHtml(tier.endDays)}">`;
    const ops=isFirst
      ?'<span style="color:#cfd8e3">—</span>'
      :`<span class="action-link" data-action="insert-tier" data-idx="${idx}">插入</span>
        <span class="action-link delete" data-action="delete-tier" data-idx="${idx}">删除</span>`;
    return `<tr>
      <td class="cell-center">${idx+1}</td>
      <td><div class="tier-days-cell">${startInput}<span style="color:#94a3b8">~</span>${endInput}</div></td>
      <td><input class="surcharge-input" data-field="unitPrice" data-idx="${idx}" value="${escapeHtml(tier.unitPrice)}" style="width:100px"></td>
      <td class="cell-center" style="white-space:nowrap">${ops}</td>
    </tr>`;
  }).join('');
}

/* ── Peak Season Table ── */
function renderPeakTable(){
  const cur=getCurrency();
  const u=getUnit();
  peakHead.innerHTML=`<tr>
    <th style="width:36px">#</th>
    <th>适用月份</th>
    <th>加收</th>
    <th style="width:50px">操作</th>
  </tr>`;

  const rules=state.peakSeason.rules;
  if(!rules.length){
    peakBody.innerHTML='<tr class="empty-row"><td colspan="4">暂无规则，点击"新增区间"添加</td></tr>';
    return;
  }
  const monthOpts=Array.from({length:12},(_,i)=>`<option value="${i+1}">${i+1}月</option>`).join('');
  peakBody.innerHTML=rules.map((rule,idx)=>{
    const startOpts=monthOpts.replace(`<option value="${rule.startMonth}">`,`<option value="${rule.startMonth}" selected>`);
    const endOpts=monthOpts.replace(`<option value="${rule.endMonth}">`,`<option value="${rule.endMonth}" selected>`);
    const typePercentSel=rule.type==='percent'?' selected':'';
    const typeFixedSel=rule.type==='fixed'?' selected':'';
    const unitLabel=rule.type==='percent'?'%':`${escapeHtml(cur)}/${escapeHtml(u)}/天`;
    return `<tr>
      <td class="cell-center">${idx+1}</td>
      <td><div class="peak-month-cell">
        <select class="peak-month-select" data-field="startMonth" data-idx="${idx}">${startOpts}</select>
        <span style="color:#94a3b8">~</span>
        <select class="peak-month-select" data-field="endMonth" data-idx="${idx}">${endOpts}</select>
      </div></td>
      <td><div class="peak-charge-cell">
        <input class="surcharge-input" data-field="peakValue" data-idx="${idx}" value="${escapeHtml(rule.value)}">
        <select class="peak-type-select" data-field="peakType" data-idx="${idx}">
          <option value="percent"${typePercentSel}>%</option>
          <option value="fixed"${typeFixedSel}>${escapeHtml(cur)}/${escapeHtml(u)}/天</option>
        </select>
      </div></td>
      <td class="cell-center"><span class="action-link delete" data-action="delete-peak" data-idx="${idx}">删除</span></td>
    </tr>`;
  }).join('');
}

/* ── Peak toggle ── */
function updatePeakVisibility(){
  if(state.peakSeason.enabled){
    peakTableWrap.style.display='';
    tierSection.classList.remove('full-width');
  }else{
    peakTableWrap.style.display='none';
    tierSection.classList.add('full-width');
  }
}

peakEnabledCheck.addEventListener('change',()=>{
  state.peakSeason.enabled=peakEnabledCheck.checked;
  updatePeakVisibility();
});

/* ── Add tier ── */
addTierBtn.addEventListener('click',()=>{
  state.tiers.push({endDays:'',unitPrice:''});
  renderTierTable();
});

/* ── Add peak rule ── */
addPeakBtn.addEventListener('click',()=>{
  state.peakSeason.rules.push({startMonth:1,endMonth:1,type:'percent',value:''});
  renderPeakTable();
});

/* ── Event delegation: tier table ── */
const tierTable=document.getElementById('tierTable');
tierTable.addEventListener('input',e=>{
  const input=e.target.closest('.surcharge-input');
  if(!input||input.dataset.idx===undefined)return;
  const idx=Number(input.dataset.idx);
  const field=input.dataset.field;
  if(field==='endDays'){
    state.tiers[idx].endDays=input.value;
    renderTierTable();
  }else if(field==='unitPrice'){
    state.tiers[idx].unitPrice=input.value;
  }
});

tierTable.addEventListener('click',e=>{
  const t=e.target.closest('[data-action]');if(!t)return;
  const idx=Number(t.dataset.idx);
  if(t.dataset.action==='insert-tier'){
    state.tiers.splice(idx+1,0,{endDays:'',unitPrice:''});
    renderTierTable();
  }else if(t.dataset.action==='delete-tier'){
    state.tiers.splice(idx,1);
    renderTierTable();
  }
});

/* ── Event delegation: peak table ── */
const peakTable=document.getElementById('peakTable');
peakTable.addEventListener('input',e=>{
  const input=e.target.closest('.surcharge-input');
  if(!input||input.dataset.idx===undefined)return;
  const idx=Number(input.dataset.idx);
  if(input.dataset.field==='peakValue'){
    state.peakSeason.rules[idx].value=input.value;
  }
});

peakTable.addEventListener('change',e=>{
  const sel=e.target.closest('select');
  if(!sel||sel.dataset.idx===undefined)return;
  const idx=Number(sel.dataset.idx);
  if(sel.dataset.field==='startMonth'){
    state.peakSeason.rules[idx].startMonth=Number(sel.value);
  }else if(sel.dataset.field==='endMonth'){
    state.peakSeason.rules[idx].endMonth=Number(sel.value);
  }else if(sel.dataset.field==='peakType'){
    state.peakSeason.rules[idx].type=sel.value;
    renderPeakTable();
  }
});

peakTable.addEventListener('click',e=>{
  const t=e.target.closest('[data-action]');if(!t)return;
  const idx=Number(t.dataset.idx);
  if(t.dataset.action==='delete-peak'){
    state.peakSeason.rules.splice(idx,1);
    renderPeakTable();
  }
});

/* ── Currency/unit change → re-render table headers ── */
currency.addEventListener('change',()=>{renderTierTable();renderPeakTable();});
unitSelect.addEventListener('change',()=>{renderTierTable();renderPeakTable();});

/* ── Save ── */
const requiredFieldMap={
  feeName:{el:feeName,label:'计费项名称'},
  customer:{el:customer,label:'客户'},
  warehouse:{el:warehouse,label:'所属仓库'},
  unit:{el:unitSelect,label:'计费维度'},
  currency:{el:currency,label:'币种'},
  startDate:{el:startDate,label:'适用时间'},
  endDate:{el:endDate,label:'适用时间'}
};

saveBtn.addEventListener('click',()=>{
  document.querySelectorAll('.field-tip').forEach(t=>t.textContent='');
  document.querySelectorAll('.field-group').forEach(g=>g.classList.remove('has-error'));

  let hasError=false;
  for(const [key,cfg] of Object.entries(requiredFieldMap)){
    if(!cfg.el.value.trim()){
      const group=cfg.el.closest('.field-group');
      const tip=group.querySelector('.field-tip');
      if(tip)tip.textContent=`请填写${cfg.label}`;
      group.classList.add('has-error');
      hasError=true;
    }
  }

  const hasValidTier=state.tiers.some(t=>t.unitPrice!=='');
  if(!hasValidTier){
    showToast('error','验证失败','请至少填写一个费用阶梯的单价。');
    return;
  }

  if(hasError){
    showToast('error','验证失败','请检查必填项。');
    return;
  }

  showToast('success','保存成功',isEdit?'仓储费配置已更新。':'仓储费配置已创建。');
});

/* ── Back ── */
backBtn.addEventListener('click',()=>{
  window.location.href='storage-fee-config.html';
});

/* ── Init ── */
peakEnabledCheck.checked=state.peakSeason.enabled;
updatePeakVisibility();
renderTierTable();
renderPeakTable();
})();
