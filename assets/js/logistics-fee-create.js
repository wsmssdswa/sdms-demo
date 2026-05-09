(()=>{
const $=id=>document.getElementById(id);
const pageTitleLabel=$('pageTitleLabel');
const backBtn=$('backBtn');
const saveBtn=$('saveBtn');
const tabBar=$('tabBar');
const toastStack=$('toastStack');
const addZoneBtn=$('addZoneBtn');
const zoneTableBody=$('zoneTableBody');
const zoneModal=$('zoneModal');
const zoneModalClose=$('zoneModalClose');
const zoneModalCancelBtn=$('zoneModalCancelBtn');
const zoneModalConfirmBtn=$('zoneModalConfirmBtn');
const modalZoneName=$('modalZoneName');
const modalZoneCountry=$('modalZoneCountry');
const modalZoneCity=$('modalZoneCity');
const modalZoneStartZip=$('modalZoneStartZip');
const modalZoneEndZip=$('modalZoneEndZip');
const addDeliveryWeightBtn=$('addDeliveryWeightBtn');
const addTransferWeightBtn=$('addTransferWeightBtn');
const addCodWeightBtn=$('addCodWeightBtn');
const deliveryFeeHead=$('deliveryFeeHead');
const deliveryFeeBody=$('deliveryFeeBody');
const transferFeeHead=$('transferFeeHead');
const transferFeeBody=$('transferFeeBody');
const codFeeHead=$('codFeeHead');
const codFeeBody=$('codFeeBody');
const addOversizeBtn=$('addOversizeBtn');
const addRemoteBtn=$('addRemoteBtn');
const addCodSurchargeBtn=$('addCodSurchargeBtn');
const oversizeTableBody=$('oversizeTableBody');
const remoteTableBody=$('remoteTableBody');
const codSurchargeTableBody=$('codSurchargeTableBody');

const escapeHtml=(v)=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const state={
  activeTab:'zone',
  zones:[
    {id:1,name:'一区',country:'波兰',city:'华沙',startZip:'00-001',endZip:'99-999'},
    {id:2,name:'二区',country:'德国',city:'柏林',startZip:'10115',endZip:'14199'},
    {id:3,name:'三区',country:'法国',city:'巴黎',startZip:'75001',endZip:'75999'},
    {id:4,name:'四区',country:'西班牙',city:'马德里',startZip:'28001',endZip:'28999'},
    {id:5,name:'五区',country:'意大利',city:'罗马',startZip:'00100',endZip:'09999'},
  ],
  weightSteps:['0-0.5kg','0.5-1kg','1-1.5kg','1.5-2kg','2-3kg','3-5kg','5-10kg','10-20kg'],
  deliveryFees:{},transferFees:{},codFees:{},
  oversizeSurcharges:[],remoteSurcharges:[],codSurcharges:[],
  nextZoneId:6,nextSurchargeId:1,
};

state.zones.forEach(z=>{
  state.weightSteps.forEach(w=>{
    if(!state.deliveryFees[w])state.deliveryFees[w]={};
    state.deliveryFees[w][z.id]=(5+Math.random()*30).toFixed(2);
    if(!state.transferFees[w])state.transferFees[w]={};
    state.transferFees[w][z.id]=(2+Math.random()*16).toFixed(2);
    if(!state.codFees[w])state.codFees[w]={};
    state.codFees[w][z.id]=(1+Math.random()*7).toFixed(2);
  });
});
state.oversizeSurcharges=[
  {id:state.nextSurchargeId++,type:'重量',minVal:'30',maxVal:'50',chargeType:'固定金额',fee:'15.00'},
  {id:state.nextSurchargeId++,type:'长度',minVal:'120',maxVal:'200',chargeType:'每kg加收',fee:'0.50'},
];
state.remoteSurcharges=[
  {id:state.nextSurchargeId++,country:'西班牙',zipRange:'35000-35999',fee:'8.00'},
  {id:state.nextSurchargeId++,country:'意大利',zipRange:'89000-89999',fee:'6.50'},
];
state.codSurcharges=[
  {id:state.nextSurchargeId++,minAmount:'0',maxAmount:'500',feeType:'固定金额',fee:'2.00'},
  {id:state.nextSurchargeId++,minAmount:'500',maxAmount:'2000',feeType:'固定金额',fee:'5.00'},
];

function showToast(type,title,desc){
  const icons={success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',error:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'};
  const toast=document.createElement('div');
  toast.className=`toast ${type}`;
  toast.innerHTML=`<span class="toast-icon">${icons[type]||''}</span><div><div class="toast-title">${escapeHtml(title)}</div><div class="toast-text">${escapeHtml(desc)}</div></div>`;
  toastStack.appendChild(toast);
  setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateY(-8px)';toast.style.transition='all 0.25s ease';setTimeout(()=>toast.remove(),250);},2200);
}

function switchTab(tab){
  state.activeTab=tab;
  tabBar.querySelectorAll('.tab-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.tab-content').forEach(p=>p.style.display=p.dataset.tabPanel===tab?'':'none');
  if(tab==='freight')renderAllMatrix();
}
tabBar.addEventListener('click',e=>{const btn=e.target.closest('.tab-item');if(!btn)return;switchTab(btn.dataset.tab);});

function renderZoneTable(){
  if(!state.zones.length){
    zoneTableBody.innerHTML='<tr><td colspan="6" style="padding:40px;text-align:center;color:#9aa8b8;">暂无分区数据，请点击"新增分区"添加</td></tr>';
    return;
  }
  const countryOptions=['波兰','德国','法国','西班牙','意大利','英国','荷兰','比利时','美国','泰国','越南','马来西亚'].map(c=>`<option value="${c}">${c}</option>`).join('');
  zoneTableBody.innerHTML=state.zones.map(z=>`<tr data-zone-id="${z.id}">
    <td><input class="zone-input" data-field="name" value="${escapeHtml(z.name)}" placeholder="分区名称"></td>
    <td><div class="zone-select-wrap"><select class="zone-select" data-field="country">${countryOptions}</select><svg viewBox="0 0 24 24" fill="currentColor"><path d="m7 10 5 5 5-5z"/></svg></div></td>
    <td><input class="zone-input" data-field="city" value="${escapeHtml(z.city)}" placeholder="城市"></td>
    <td><input class="zone-input" data-field="startZip" value="${escapeHtml(z.startZip)}" placeholder="起始邮编"></td>
    <td><input class="zone-input" data-field="endZip" value="${escapeHtml(z.endZip)}" placeholder="结束邮编"></td>
    <td><button class="zone-action danger" data-action="delete-zone" data-id="${z.id}">删除</button></td>
  </tr>`).join('');
  zoneTableBody.querySelectorAll('tr').forEach(tr=>{
    const zid=Number(tr.dataset.zoneId);
    const z=state.zones.find(z=>z.id===zid);
    if(z){const sel=tr.querySelector('[data-field="country"]');if(sel)sel.value=z.country;}
  });
}

zoneTableBody.addEventListener('input',e=>{
  const input=e.target.closest('.zone-input');if(!input)return;
  const tr=input.closest('tr');if(!tr)return;
  const zid=Number(tr.dataset.zoneId);
  const z=state.zones.find(z=>z.id===zid);if(!z)return;
  const field=input.dataset.field;if(field)z[field]=input.value;
});
zoneTableBody.addEventListener('change',e=>{
  const sel=e.target.closest('.zone-select');if(!sel)return;
  const tr=sel.closest('tr');if(!tr)return;
  const zid=Number(tr.dataset.zoneId);
  const z=state.zones.find(z=>z.id===zid);if(!z)return;
  z.country=sel.value;
});
zoneTableBody.addEventListener('click',e=>{
  const btn=e.target.closest('[data-action="delete-zone"]');if(!btn)return;
  const id=Number(btn.dataset.id);
  if(!window.confirm('删除分区后，该分区的运费数据也将被清除。是否确认？'))return;
  state.zones=state.zones.filter(z=>z.id!==id);
  [state.deliveryFees,state.transferFees,state.codFees].forEach(fees=>{Object.values(fees).forEach(row=>{delete row[id];});});
  renderZoneTable();
  showToast('success','已删除','分区已移除。');
});

addZoneBtn.addEventListener('click',()=>{
  modalZoneName.value='';modalZoneCountry.value='';modalZoneCity.value='';modalZoneStartZip.value='';modalZoneEndZip.value='';
  zoneModal.classList.add('open');
});
function closeZoneModal(){zoneModal.classList.remove('open');}
zoneModalClose.addEventListener('click',closeZoneModal);
zoneModalCancelBtn.addEventListener('click',closeZoneModal);
zoneModal.addEventListener('click',e=>{if(e.target===zoneModal)closeZoneModal();});
zoneModalConfirmBtn.addEventListener('click',()=>{
  const name=modalZoneName.value.trim();const country=modalZoneCountry.value;
  if(!name){showToast('error','校验失败','请输入分区名称。');return;}
  if(!country){showToast('error','校验失败','请选择国家/地区。');return;}
  const newZone={id:state.nextZoneId++,name,country,city:modalZoneCity.value.trim(),startZip:modalZoneStartZip.value.trim(),endZip:modalZoneEndZip.value.trim()};
  state.zones.push(newZone);
  state.weightSteps.forEach(w=>{
    if(!state.deliveryFees[w])state.deliveryFees[w]={};state.deliveryFees[w][newZone.id]='0.00';
    if(!state.transferFees[w])state.transferFees[w]={};state.transferFees[w][newZone.id]='0.00';
    if(!state.codFees[w])state.codFees[w]={};state.codFees[w][newZone.id]='0.00';
  });
  renderZoneTable();closeZoneModal();
  showToast('success','新增成功',`分区"${name}"已添加。`);
});

function buildMatrixHead(){
  const zoneCols=state.zones.map(z=>`<th style="width:${Math.max(80,Math.floor(600/Math.max(1,state.zones.length)))}px">${escapeHtml(z.name)}</th>`).join('');
  return `<tr><th style="width:90px">重量段</th>${zoneCols}<th style="width:50px">操作</th></tr>`;
}
function buildMatrixRows(feeData,prefix){
  if(!state.zones.length){
    return `<tr><td colspan="${state.zones.length+2}" style="padding:40px;text-align:center;color:#9aa8b8;">请先在"分区"Tab中添加分区</td></tr>`;
  }
  return state.weightSteps.map((w,idx)=>{
    const cells=state.zones.map(z=>{
      const val=(feeData[w]&&feeData[w][z.id])||'0.00';
      return `<td><input class="matrix-input" data-weight="${w}" data-zone="${z.id}" data-prefix="${prefix}" value="${val}"></td>`;
    }).join('');
    return `<tr><td><span class="weight-label">${w}</span></td>${cells}<td><button class="matrix-delete" data-action="delete-weight" data-index="${idx}">×</button></td></tr>`;
  }).join('');
}
function renderMatrix(headEl,bodyEl,feeData,prefix){headEl.innerHTML=buildMatrixHead();bodyEl.innerHTML=buildMatrixRows(feeData,prefix);}
function renderAllMatrix(){
  renderMatrix(deliveryFeeHead,deliveryFeeBody,state.deliveryFees,'delivery');
  renderMatrix(transferFeeHead,transferFeeBody,state.transferFees,'transfer');
  renderMatrix(codFeeHead,codFeeBody,state.codFees,'cod');
}

function handleMatrixInput(e){
  const input=e.target.closest('.matrix-input');if(!input)return;
  const w=input.dataset.weight;const zid=Number(input.dataset.zone);const prefix=input.dataset.prefix;
  const feeMap=prefix==='delivery'?state.deliveryFees:prefix==='transfer'?state.transferFees:state.codFees;
  if(!feeMap[w])feeMap[w]={};feeMap[w][zid]=input.value;
}
[deliveryFeeBody,transferFeeBody,codFeeBody].forEach(el=>{el.addEventListener('input',handleMatrixInput);});

function addWeightStep(){
  const last=state.weightSteps[state.weightSteps.length-1];
  let maxKg=parseFloat(last.split('-')[1])||20;
  const newStep=`${maxKg}-${maxKg+5}kg`;
  state.weightSteps.push(newStep);
  state.zones.forEach(z=>{
    if(!state.deliveryFees[newStep])state.deliveryFees[newStep]={};state.deliveryFees[newStep][z.id]='0.00';
    if(!state.transferFees[newStep])state.transferFees[newStep]={};state.transferFees[newStep][z.id]='0.00';
    if(!state.codFees[newStep])state.codFees[newStep]={};state.codFees[newStep][z.id]='0.00';
  });
  renderAllMatrix();
}
addDeliveryWeightBtn.addEventListener('click',addWeightStep);
addTransferWeightBtn.addEventListener('click',addWeightStep);
addCodWeightBtn.addEventListener('click',addWeightStep);

function handleMatrixDelete(e){
  const btn=e.target.closest('[data-action="delete-weight"]');if(!btn)return;
  const idx=Number(btn.dataset.index);const w=state.weightSteps[idx];
  if(!window.confirm(`确认删除重量段"${w}"？`))return;
  delete state.deliveryFees[w];delete state.transferFees[w];delete state.codFees[w];
  state.weightSteps.splice(idx,1);renderAllMatrix();
}
[deliveryFeeBody,transferFeeBody,codFeeBody].forEach(el=>{el.addEventListener('click',handleMatrixDelete);});

function renderOversizeTable(){
  if(!state.oversizeSurcharges.length){
    oversizeTableBody.innerHTML='<tr><td colspan="6" style="padding:30px;text-align:center;color:#9aa8b8;">暂无数据</td></tr>';return;
  }
  oversizeTableBody.innerHTML=state.oversizeSurcharges.map(s=>`<tr data-id="${s.id}">
    <td><div class="surcharge-select-wrap"><select class="surcharge-select" data-field="type"><option value="重量" ${s.type==='重量'?'selected':''}>重量</option><option value="长度" ${s.type==='长度'?'selected':''}>长度</option><option value="体积" ${s.type==='体积'?'selected':''}>体积</option></select><svg viewBox="0 0 24 24" fill="currentColor"><path d="m7 10 5 5 5-5z"/></svg></div></td>
    <td><input class="surcharge-input" data-field="minVal" value="${escapeHtml(s.minVal)}"></td>
    <td><input class="surcharge-input" data-field="maxVal" value="${escapeHtml(s.maxVal)}"></td>
    <td><div class="surcharge-select-wrap"><select class="surcharge-select" data-field="chargeType"><option value="固定金额" ${s.chargeType==='固定金额'?'selected':''}>固定金额</option><option value="每kg加收" ${s.chargeType==='每kg加收'?'selected':''}>每kg加收</option></select><svg viewBox="0 0 24 24" fill="currentColor"><path d="m7 10 5 5 5-5z"/></svg></div></td>
    <td><input class="surcharge-input" data-field="fee" value="${escapeHtml(s.fee)}"></td>
    <td><button class="surcharge-action" data-action="delete-oversize" data-id="${s.id}">删除</button></td>
  </tr>`).join('');
}
function renderRemoteTable(){
  if(!state.remoteSurcharges.length){
    remoteTableBody.innerHTML='<tr><td colspan="4" style="padding:30px;text-align:center;color:#9aa8b8;">暂无数据</td></tr>';return;
  }
  const countries=['波兰','德国','法国','西班牙','意大利','英国','荷兰','比利时','美国','泰国','越南','马来西亚'];
  remoteTableBody.innerHTML=state.remoteSurcharges.map(s=>`<tr data-id="${s.id}">
    <td><div class="surcharge-select-wrap"><select class="surcharge-select" data-field="country">${countries.map(c=>`<option value="${c}" ${s.country===c?'selected':''}>${c}</option>`).join('')}</select><svg viewBox="0 0 24 24" fill="currentColor"><path d="m7 10 5 5 5-5z"/></svg></div></td>
    <td><input class="surcharge-input" data-field="zipRange" value="${escapeHtml(s.zipRange)}" placeholder="起始-结束"></td>
    <td><input class="surcharge-input" data-field="fee" value="${escapeHtml(s.fee)}"></td>
    <td><button class="surcharge-action" data-action="delete-remote" data-id="${s.id}">删除</button></td>
  </tr>`).join('');
}
function renderCodSurchargeTable(){
  if(!state.codSurcharges.length){
    codSurchargeTableBody.innerHTML='<tr><td colspan="5" style="padding:30px;text-align:center;color:#9aa8b8;">暂无数据</td></tr>';return;
  }
  codSurchargeTableBody.innerHTML=state.codSurcharges.map(s=>`<tr data-id="${s.id}">
    <td><input class="surcharge-input" data-field="minAmount" value="${escapeHtml(s.minAmount)}"></td>
    <td><input class="surcharge-input" data-field="maxAmount" value="${escapeHtml(s.maxAmount)}"></td>
    <td><div class="surcharge-select-wrap"><select class="surcharge-select" data-field="feeType"><option value="固定金额" ${s.feeType==='固定金额'?'selected':''}>固定金额</option><option value="百分比" ${s.feeType==='百分比'?'selected':''}>百分比</option></select><svg viewBox="0 0 24 24" fill="currentColor"><path d="m7 10 5 5 5-5z"/></svg></div></td>
    <td><input class="surcharge-input" data-field="fee" value="${escapeHtml(s.fee)}"></td>
    <td><button class="surcharge-action" data-action="delete-cod-surcharge" data-id="${s.id}">删除</button></td>
  </tr>`).join('');
}

function bindSurchargeInput(bodyEl,arr){
  bodyEl.addEventListener('input',e=>{
    const input=e.target.closest('.surcharge-input');if(!input)return;
    const tr=input.closest('tr');if(!tr)return;
    const id=Number(tr.dataset.id);const item=arr.find(s=>s.id===id);if(!item)return;
    item[input.dataset.field]=input.value;
  });
  bodyEl.addEventListener('change',e=>{
    const sel=e.target.closest('.surcharge-select');if(!sel)return;
    const tr=sel.closest('tr');if(!tr)return;
    const id=Number(tr.dataset.id);const item=arr.find(s=>s.id===id);if(!item)return;
    item[sel.dataset.field]=sel.value;
  });
}
bindSurchargeInput(oversizeTableBody,state.oversizeSurcharges);
bindSurchargeInput(remoteTableBody,state.remoteSurcharges);
bindSurchargeInput(codSurchargeTableBody,state.codSurcharges);

oversizeTableBody.addEventListener('click',e=>{const btn=e.target.closest('[data-action="delete-oversize"]');if(!btn)return;const id=Number(btn.dataset.id);state.oversizeSurcharges=state.oversizeSurcharges.filter(s=>s.id!==id);renderOversizeTable();});
remoteTableBody.addEventListener('click',e=>{const btn=e.target.closest('[data-action="delete-remote"]');if(!btn)return;const id=Number(btn.dataset.id);state.remoteSurcharges=state.remoteSurcharges.filter(s=>s.id!==id);renderRemoteTable();});
codSurchargeTableBody.addEventListener('click',e=>{const btn=e.target.closest('[data-action="delete-cod-surcharge"]');if(!btn)return;const id=Number(btn.dataset.id);state.codSurcharges=state.codSurcharges.filter(s=>s.id!==id);renderCodSurchargeTable();});

addOversizeBtn.addEventListener('click',()=>{state.oversizeSurcharges.push({id:state.nextSurchargeId++,type:'重量',minVal:'',maxVal:'',chargeType:'固定金额',fee:''});renderOversizeTable();});
addRemoteBtn.addEventListener('click',()=>{state.remoteSurcharges.push({id:state.nextSurchargeId++,country:'波兰',zipRange:'',fee:''});renderRemoteTable();});
addCodSurchargeBtn.addEventListener('click',()=>{state.codSurcharges.push({id:state.nextSurchargeId++,minAmount:'',maxAmount:'',feeType:'固定金额',fee:''});renderCodSurchargeTable();});

function validateForm(){
  let valid=true;
  const fields=[{id:'quoteName',label:'报价单名称'},{id:'customer',label:'客户'},{id:'channel',label:'渠道'},{id:'serviceType',label:'服务类型'},{id:'currency',label:'币种'}];
  fields.forEach(f=>{
    const el=$(f.id);const tip=el.closest('.field-group').querySelector('.field-tip');
    if(!el.value.trim()){tip.textContent=`请${el.tagName==='SELECT'?'选择':'输入'}${f.label}`;el.classList.add('field-error');if(valid)el.focus();valid=false;}
    else{tip.textContent='';el.classList.remove('field-error');}
  });
  const startDate=$('startDate');const endDate=$('endDate');const dateTip=startDate.closest('.field-group').querySelector('.field-tip');
  if(!startDate.value||!endDate.value){dateTip.textContent='请选择适用时间';if(valid)startDate.focus();valid=false;}
  else{dateTip.textContent='';}
  return valid;
}
saveBtn.addEventListener('click',()=>{if(!validateForm()){showToast('error','校验失败','请完善必填项。');return;}showToast('success','保存成功','报价单数据已保存。');});
backBtn.addEventListener('click',()=>{window.location.href='logistics-fee-config.html';});

const params=new URLSearchParams(window.location.search);
if(params.get('mode')==='edit'){
  pageTitleLabel.textContent='编辑物流费';
  $('quoteName').value='波兰仓-西欧专线-快递服务';
  $('customer').value='深圳市星辰电子商务有限公司';
  $('channel').value='西欧专线';
  $('serviceType').value='快递';
  $('currency').value='EUR';
  $('startDate').value='2025-01-01';
  $('endDate').value='2025-12-31';
  $('effectType').value='immediate';
  $('remark').value='西欧区域标准报价';
}

renderZoneTable();
renderAllMatrix();
renderOversizeTable();
renderRemoteTable();
renderCodSurchargeTable();
})();
