/* quotation-trial-calc.js — 报价方案费用试算 */
(function(){

const escapeHtml=(v)=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

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
  {key:'operation',label:'操作费'}
];

/* ── 动态注入弹窗HTML ── */
function ensureModal(){
  if(document.getElementById('qtTrialMask'))return;
  const div=document.createElement('div');
  div.innerHTML=`
  <div class="trial-mask" id="qtTrialMask" aria-hidden="true">
    <div class="trial-dialog" role="dialog" aria-modal="true">
      <div class="trial-header">
        <div class="trial-title">费用试算</div>
        <button class="trial-close" id="qtTrialClose" type="button">×</button>
      </div>
      <div class="trial-body">
        <div class="trial-toolbar">
          <div class="trial-biz-tabs" id="qtTrialBizTabs">
            ${BIZ_TYPES.map(bt=>'<button type="button" class="trial-biz-tab'+(bt.key==='trunk'?' active':'')+'" data-biz="'+bt.key+'">'+bt.label+'</button>').join('')}
          </div>
          <div class="trial-form-row">
            <div class="trial-form-field">
              <div class="trial-form-label"><span class="required-star">*</span><span>试算单号</span></div>
              <div class="trial-form-inline">
                <input class="trial-input" id="qtTrialOrderNo" type="text" maxlength="50" placeholder="请输入试算单号">
                <button class="trial-run-btn" id="qtTrialRunBtn" type="button">试算</button>
              </div>
            </div>
          </div>
          <div class="trial-inline-status" id="qtTrialStatus"></div>
          <div class="trial-summary" id="qtTrialSummary"></div>
        </div>
        <div class="trial-board" id="qtTrialBoard" style="display:none">
          <div class="trial-board-head">
            <div>费用项</div>
            <div class="align-right">金额（€）</div>
          </div>
          <div class="trial-board-scroll" id="qtTrialScroll"></div>
          <div class="trial-total">
            <div class="trial-total-label">合计</div>
            <div class="trial-total-value" id="qtTrialTotal">€0.00</div>
          </div>
        </div>
        <div class="trial-board-status" id="qtTrialEmpty">
          <div>请输入试算单号后点击"试算"</div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.appendChild(div.firstElementChild);
  document.getElementById('qtTrialClose').addEventListener('click',close);
  document.getElementById('qtTrialMask').addEventListener('click',e=>{if(e.target.id==='qtTrialMask')close();});
  document.getElementById('qtTrialRunBtn').addEventListener('click',runTrial);
  document.getElementById('qtTrialOrderNo').addEventListener('keydown',e=>{if(e.key==='Enter')runTrial();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('qtTrialMask').classList.contains('open'))close();});
  document.getElementById('qtTrialBizTabs').addEventListener('click',e=>{
    const tab=e.target.closest('.trial-biz-tab');
    if(!tab)return;
    _currentBizType=tab.dataset.biz;
    document.querySelectorAll('#qtTrialBizTabs .trial-biz-tab').forEach(t=>t.classList.toggle('active',t.dataset.biz===_currentBizType));
  });
}

/* ── 状态 ── */
let _state=null;
let _allFeeItems=null;
let _currentBizType='trunk';

/* ── Mock场景数据 ── */
function getScenario(){
  return {
    arrivalMode:'整柜',containerType:'20GP',
    cargoDisplay:'托盘、箱',cargoTypes:['托盘货','箱货'],
    palletCount:8,boxCount:850,skuCount:26,
    palletWeights:[80,60,100,120,95,104,88,92],
    cartonWeights:[10,15,18,35,12,14,16,20],
    storageDays:45,cbm:12.5,
    targetZone:'一区',weight:1.2
  };
}

/* ── 操作费试算 ── */
function trialOperationItems(items,bizTypeKey,overrides){
  const scenario=getScenario();
  const results=[];
  items.forEach(item=>{
    const d=item.detail;
    if(!d||!d.ruleGroups)return;
    const groups=[];
    d.ruleGroups.forEach((group,gIdx)=>{
      const primaryCond=group.label||'任何场景';
      const rows=[];
      group.lines.forEach((line,lIdx)=>{
        const ovKey=bizTypeKey+'_'+item.id;
        const ov=overrides[ovKey]||{};
        const priceKey=gIdx+'_'+lIdx;
        const unitPrice=ov[priceKey]||line.unitPrice;
        let baseQty=1;
        const cond=line.condition||'';
        if(cond.includes('箱数'))baseQty=scenario.boxCount;
        else if(cond.includes('SKU'))baseQty=scenario.skuCount;
        else if(cond.includes('托')&&cond.includes('20GP'))baseQty=1;
        else if(cond.includes('托')&&cond.includes('40GP'))baseQty=1;
        else if(cond.includes('托')&&cond.includes('40HQ'))baseQty=1;
        else if(cond.includes('箱')&&!cond.includes('箱数'))baseQty=scenario.boxCount;
        else if(cond.includes('托')&&!cond.includes('柜型'))baseQty=scenario.palletCount;
        const waive=line.waiveAmount&&line.waiveAmount!=='0'?Number(line.waiveAmount):0;
        let qty=Math.max(0,baseQty-waive);
        const unitQty=Math.max(Number(line.unit)||1,1);
        let units=qty/unitQty;
        let amount=Number((units*Number(unitPrice)).toFixed(2));
        if(line.baseFee&&line.baseFee!=='0')amount+=Number(line.baseFee);
        if(line.minFee)amount=Math.max(amount,Number(line.minFee));
        if(line.maxFee)amount=Math.min(amount,Number(line.maxFee));
        amount=Number(amount.toFixed(2));
        const chunks=[cond?'若'+cond:''];
        if(unitPrice)chunks.push('按€'+unitPrice+'/'+escapeHtml(line.unit)+'计费');
        if(waive)chunks.push('减免前'+waive+escapeHtml(line.unit));
        if(line.baseFee&&line.baseFee!=='0')chunks.push('基础收费€'+line.baseFee);
        if(line.minFee)chunks.push('最低收费€'+line.minFee);
        if(line.maxFee)chunks.push('最高收费€'+line.maxFee);
        rows.push({text:chunks.filter(Boolean).join('，'),amount,match:true});
      });
      groups.push({primaryCond,rows});
    });
    const subtotal=groups.reduce((s,g)=>s+g.rows.reduce((ss,r)=>ss+(r.amount||0),0),0);
    results.push({label:item.name,groups,subtotal});
  });
  return results;
}

/* ── 仓储费试算 ── */
function trialStorageItems(items,bizTypeKey,overrides){
  const scenario=getScenario();
  const results=[];
  items.forEach(item=>{
    const d=item.detail;
    if(!d||!d.tiers)return;
    const tiers=d.tiers;
    let matchedTier=null;
    for(let i=tiers.length-1;i>=0;i--){
      const label=tiers[i].label||'';
      const upperMatch=label.match(/(\d+)天/);
      const lowerMatch=tiers[i-1]?tiers[i-1].label.match(/(\d+)天/):null;
      if(i===tiers.length-1){
        const lower=lowerMatch?Number(lowerMatch[1]):0;
        if(scenario.storageDays>lower){matchedTier=tiers[i];break;}
      }else{
        const upper=Number(upperMatch[1]);
        const lower=i>0&&tiers[i-1].label.match(/(\d+)天/)?Number(tiers[i-1].label.match(/(\d+)天/)[1]):0;
        if(scenario.storageDays>lower&&scenario.storageDays<=upper){matchedTier=tiers[i];break;}
      }
    }
    if(!matchedTier)matchedTier=tiers[tiers.length-1];
    const tierIdx=tiers.indexOf(matchedTier);
    const ovKey=bizTypeKey+'_'+item.id;
    const ov=overrides[ovKey]||{};
    const price=ov['tier_'+tierIdx]||matchedTier.price;
    const amount=Number((scenario.storageDays*scenario.cbm*Number(price)).toFixed(2));
    const method=d.method||'CBM/天';
    results.push({
      label:item.name,condition:matchedTier.label,
      rows:[{text:scenario.storageDays+'天 × '+scenario.cbm+'CBM × '+price+'€/'+method,amount,match:true}],
      subtotal:amount
    });
  });
  return results;
}

/* ── 物流费试算 ── */
function trialLogisticsItems(items,bizTypeKey,overrides){
  const scenario=getScenario();
  const results=[];
  items.forEach(item=>{
    const d=item.detail;
    if(!d)return;
    const zones=d.zones||[];
    const weightSteps=d.weightSteps||[];
    const pricing=d.pricing||{};
    const feeTypes=d.feeTypes||[];
    const renewal=d.renewal||{};
    const isSimple=weightSteps.length===0;
    const ovKey=bizTypeKey+'_'+item.id;
    const ov=overrides[ovKey]||{};
    const zoneIdx=zones.indexOf(scenario.targetZone);
    const rows=[];
    feeTypes.forEach(ft=>{
      const matrix=pricing[ft]||[];
      let price='-',amount=null,rowText='';
      if(isSimple){
        if(matrix[0]&&zoneIdx>=0){
          const rawPrice=matrix[0][zoneIdx]||'-';
          const priceKey=ft+'_0_'+zoneIdx;
          price=ov[priceKey]||rawPrice;
          amount=Number(price);
          rowText=ft+' → '+scenario.targetZone+' = '+price+'€';
        }
      }else{
        let matchedRow=-1;
        for(let r=0;r<weightSteps.length;r++){
          const step=weightSteps[r];
          const nums=step.match(/[\d.]+/g);
          if(nums&&nums.length>=2){
            const lo=Number(nums[0]),hi=Number(nums[1]);
            if(scenario.weight>=lo&&scenario.weight<hi){matchedRow=r;break;}
          }else if(nums&&nums.length===1&&step.includes('+')){
            if(scenario.weight>=Number(nums[0])){matchedRow=r;break;}
          }
        }
        if(matchedRow>=0&&zoneIdx>=0){
          const rawPrice=matrix[matchedRow][zoneIdx]||'-';
          const priceKey=ft+'_'+matchedRow+'_'+zoneIdx;
          price=ov[priceKey]||rawPrice;
          amount=Number(price);
          rowText=ft+' · '+weightSteps[matchedRow]+' · '+scenario.targetZone+' = '+price+'€';
          if(renewal.enabled&&renewal.data){
            const rMatch=renewal.data.find(r=>r.zone===scenario.targetZone);
            if(rMatch)rowText+=' (续重 +'+rMatch.unit+': '+rMatch.price+'€)';
          }
        }
      }
      rows.push({text:rowText||(ft+' · '+scenario.targetZone+' / '+scenario.weight+'kg 未匹配'),amount,match:amount!==null});
    });
    const subtotal=rows.reduce((s,r)=>s+(r.amount||0),0);
    results.push({
      label:item.name,
      condition:scenario.targetZone+' / '+scenario.weight+'kg',
      rows,subtotal
    });
  });
  return results;
}

/* ── 渲染结果（展开式列表） ── */
function renderResult(opResults,storageResults,logisticsResults){
  const board=document.getElementById('qtTrialBoard');
  const empty=document.getElementById('qtTrialEmpty');
  const scroll=document.getElementById('qtTrialScroll');
  const totalEl=document.getElementById('qtTrialTotal');

  const allItems=[...logisticsResults,...storageResults,...opResults];

  if(allItems.length===0){
    board.style.display='none';
    empty.style.display='flex';
    empty.innerHTML='<div>当前业务类型无已选费用项，无法试算</div>';
    return;
  }

  empty.style.display='none';
  board.style.display='flex';

  let html='';
  let allTotal=0;

  allItems.forEach((item,idx)=>{
    const itemTotal=item.subtotal||(item.rows?item.rows.reduce((s,r)=>s+(r.amount||0),0):0);
    allTotal+=itemTotal;
    const detailId='qtTrialDetail_'+(idx+1);
    html+='<div class="trial-item">';
    html+='<div class="trial-item-head" data-detail="'+detailId+'">';
    html+='<span class="trial-item-arrow">▶</span>';
    html+='<span class="trial-item-name">'+escapeHtml(item.label)+(item.condition?' · '+escapeHtml(item.condition):'')+'</span>';
    html+='<span class="trial-item-amount">'+(itemTotal?'€'+itemTotal.toFixed(2):'-')+'</span>';
    html+='</div>';
    html+='<div class="trial-item-detail" id="'+detailId+'">';
    if(item.groups){
      item.groups.forEach((group,gIdx)=>{
        html+='<div class="trial-detail-group-label">'+escapeHtml(group.primaryCond)+'</div>';
        group.rows.forEach((row,i)=>{
          const cls=row.match?'':' miss';
          html+='<div class="trial-row'+cls+'"><div class="trial-row-index">'+(i+1)+'</div><div class="trial-row-text">'+row.text+'</div><div class="trial-row-amount">'+(row.amount!==null?'€'+row.amount.toFixed(2):'-')+'</div></div>';
        });
      });
    }else{
      item.rows.forEach((row,i)=>{
        const cls=row.match?'':' miss';
        html+='<div class="trial-row'+cls+'"><div class="trial-row-index">'+(i+1)+'</div><div class="trial-row-text">'+row.text+'</div><div class="trial-row-amount">'+(row.amount!==null?'€'+row.amount.toFixed(2):'-')+'</div></div>';
      });
    }
    html+='</div></div>';
  });

  scroll.innerHTML=html;
  totalEl.textContent='€'+allTotal.toFixed(2);

  scroll.querySelectorAll('.trial-item-head').forEach(head=>{
    head.addEventListener('click',()=>{
      const detail=document.getElementById(head.dataset.detail);
      if(!detail)return;
      const arrow=head.querySelector('.trial-item-arrow');
      const expanded=detail.style.display==='block';
      detail.style.display=expanded?'none':'block';
      arrow.textContent=expanded?'▶':'▼';
      head.classList.toggle('expanded',!expanded);
    });
  });
}

/* ── 执行试算 ── */
function runTrial(){
  const orderNo=document.getElementById('qtTrialOrderNo').value.trim();
  if(!orderNo){
    document.getElementById('qtTrialOrderNo').classList.add('error');
    document.getElementById('qtTrialStatus').className='trial-inline-status error';
    document.getElementById('qtTrialStatus').textContent='请输入试算单号';
    return;
  }
  document.getElementById('qtTrialOrderNo').classList.remove('error');
  const statusEl=document.getElementById('qtTrialStatus');
  statusEl.className='trial-inline-status loading';
  statusEl.textContent='正在试算...';

  const bizLabel=(BIZ_TYPES.find(b=>b.key===_currentBizType)||{}).label||_currentBizType;

  const summaryEl=document.getElementById('qtTrialSummary');
  const s=getScenario();
  summaryEl.innerHTML=[
    summaryItem('业务类型',bizLabel,'compact'),
    summaryItem('到货形式',s.arrivalMode,'compact'),summaryItem('柜型',s.containerType,'compact'),
    summaryItem('货物形态',s.cargoDisplay,'compact'),summaryItem('托盘数',s.palletCount,'compact'),
    summaryItem('箱数',s.boxCount,'compact'),summaryItem('SKU数量',s.skuCount,'compact'),
    summaryItem('仓储天数',s.storageDays+'天','compact'),summaryItem('CBM',s.cbm,'compact'),
    summaryItem('目标分区',s.targetZone,'compact'),summaryItem('重量',s.weight+'kg','compact')
  ].join('');

  setTimeout(()=>{
    statusEl.className='trial-inline-status';
    statusEl.textContent='';

    const sel=_state.selections||{};
    const ov=_state.priceOverrides||{};
    const bizSel=sel[_currentBizType];

    let selectedOp=[],selectedSt=[],selectedLo=[];
    if(bizSel){
      bizSel.forEach(id=>{
        const item=_allFeeItems.find(f=>f.id===id);
        if(!item)return;
        if(item.category==='operation')selectedOp.push(item);
        if(item.category==='storage')selectedSt.push(item);
        if(item.category==='logistics')selectedLo.push(item);
      });
    }

    const opResults=trialOperationItems(selectedOp,_currentBizType,ov);
    const stResults=trialStorageItems(selectedSt,_currentBizType,ov);
    const loResults=trialLogisticsItems(selectedLo,_currentBizType,ov);

    renderResult(opResults,stResults,loResults);
  },600);
}

function summaryItem(label,value,cls){
  return '<div class="trial-summary-item '+(cls||'')+'"><span class="trial-summary-label strong">'+label+'</span><span class="trial-summary-value">'+value+'</span></div>';
}

/* ── 打开/关闭 ── */
function open(state,feeItems){
  ensureModal();
  _state=state;
  _allFeeItems=feeItems;
  _currentBizType='trunk';
  document.querySelectorAll('#qtTrialBizTabs .trial-biz-tab').forEach(t=>t.classList.toggle('active',t.dataset.biz==='trunk'));
  document.getElementById('qtTrialOrderNo').value='';
  document.getElementById('qtTrialStatus').textContent='';
  document.getElementById('qtTrialSummary').innerHTML='';
  document.getElementById('qtTrialBoard').style.display='none';
  document.getElementById('qtTrialEmpty').style.display='flex';
  document.getElementById('qtTrialEmpty').innerHTML='<div>请输入试算单号后点击"试算"</div>';
  document.getElementById('qtTrialMask').classList.add('open');
  document.getElementById('qtTrialMask').setAttribute('aria-hidden','false');
}
function close(){
  const m=document.getElementById('qtTrialMask');
  if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');}
}

/* ── 全局API ── */
window.QuotationTrialCalc={open,close};

})();
