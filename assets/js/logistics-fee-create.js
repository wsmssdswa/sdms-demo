(()=>{
const $=id=>document.getElementById(id);
const pageTitleLabel=$('pageTitleLabel');
const backBtn=$('backBtn');
const saveBtn=$('saveBtn');
const tabBar=$('tabBar');
const toastStack=$('toastStack');

/* 分区三级联动 */
const addZoneBtn=$('addZoneBtn');
const addCountryBtn=$('addCountryBtn');
const addCityBtn=$('addCityBtn');
const zoneList=$('zoneList');
const countryList=$('countryList');
const cityList=$('cityList');

/* 运费矩阵 */
const deliveryFeeHead=$('deliveryFeeHead');
const deliveryFeeBody=$('deliveryFeeBody');
const transferFeeHead=$('transferFeeHead');
const transferFeeBody=$('transferFeeBody');
const codFeeHead=$('codFeeHead');
const codFeeBody=$('codFeeBody');

/* 附加费 */

const escapeHtml=(v)=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* ===== 数据模型 ===== */
let nextId=100;
let nextSortNo=6;
const state={
  activeTab:'zone',
  activeZoneId:null,
  activeCountryId:null,
  zones:[
    {id:1,sortNo:1,name:'一区',countries:[
      {id:10,name:'波兰',cities:[{id:20,name:'华沙',startZip:'00-001',endZip:'99-999'},{id:21,name:'克拉科夫',startZip:'30-001',endZip:'31-999'}]},
      {id:11,name:'德国',cities:[{id:22,name:'柏林',startZip:'10115',endZip:'14199'},{id:23,name:'慕尼黑',startZip:'80331',endZip:'81999'}]},
    ]},
    {id:2,sortNo:2,name:'二区',countries:[
      {id:12,name:'法国',cities:[{id:24,name:'巴黎',startZip:'75001',endZip:'75999'}]},
      {id:13,name:'西班牙',cities:[{id:25,name:'马德里',startZip:'28001',endZip:'28999'}]},
    ]},
    {id:3,sortNo:3,name:'三区',countries:[
      {id:14,name:'意大利',cities:[{id:26,name:'罗马',startZip:'00100',endZip:'09999'}]},
    ]},
    {id:4,sortNo:4,name:'四区',countries:[
      {id:15,name:'英国',cities:[{id:27,name:'伦敦',startZip:'E1',endZip:'E99'}]},
      {id:16,name:'荷兰',cities:[{id:28,name:'阿姆斯特丹',startZip:'1000',endZip:'1099'}]},
    ]},
    {id:5,sortNo:5,name:'五区',countries:[
      {id:17,name:'美国',cities:[{id:29,name:'纽约',startZip:'10001',endZip:'10099'}]},
    ]},
  ],
  weightSteps:[
    {endWeight:0.5},{endWeight:1},{endWeight:1.5},{endWeight:2},
    {endWeight:3},{endWeight:5},{endWeight:10},{endWeight:20}
  ],
  deliveryFees:{},transferFees:{},codFees:{},
  deliveryRenewalEnabled:false,deliveryRenewal:{},
  transferRenewalEnabled:false,transferRenewal:{},
  surchargeLength:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeWeight:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeDimension:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeVolume:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeLimit:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeRemote:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeRemotePlus:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeRemoteUltra:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeCod:{enabled:false,currencies:[]},
};

/* 初始化运费Mock */
state.weightSteps.forEach((ws,i)=>{
  state.deliveryFees[i]={};state.transferFees[i]={};state.codFees[i]={};
  state.zones.forEach(z=>{
    state.deliveryFees[i][z.id]=(5+Math.random()*30).toFixed(2);
    state.transferFees[i][z.id]=(2+Math.random()*16).toFixed(2);
    state.codFees[i][z.id]=(1+Math.random()*7).toFixed(2);
  });
});
state.zones.forEach(z=>{
  state.deliveryRenewal[z.id]={unit:'0.5',price:(2+Math.random()*5).toFixed(2)};
  state.transferRenewal[z.id]={unit:'0.5',price:(1+Math.random()*3).toFixed(2)};
});


/* ===== Toast ===== */
function showToast(type,title,desc){
  const icons={success:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',error:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'};
  const toast=document.createElement('div');
  toast.className=`toast ${type}`;
  toast.innerHTML=`<span class="toast-icon">${icons[type]||''}</span><div><div class="toast-title">${escapeHtml(title)}</div><div class="toast-text">${escapeHtml(desc)}</div></div>`;
  toastStack.appendChild(toast);
  setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateY(-8px)';toast.style.transition='all 0.25s ease';setTimeout(()=>toast.remove(),250);},2200);
}

/* ===== Tab切换 ===== */
function switchTab(tab){
  state.activeTab=tab;
  tabBar.querySelectorAll('.tab-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelectorAll('.tab-content').forEach(p=>p.style.display=p.dataset.tabPanel===tab?'':'none');
  if(tab==='freight')renderAllMatrix();
  if(tab==='surcharge')renderAllSurchargeMatrix();
}
tabBar.addEventListener('click',e=>{const btn=e.target.closest('.tab-item');if(!btn)return;switchTab(btn.dataset.tab);});

/* ===== 分区三级联动 ===== */
function findZone(id){return state.zones.find(z=>z.id===id);}
function findCountry(zoneId,countryId){const z=findZone(zoneId);return z?z.countries.find(c=>c.id===countryId):null;}

function renderZoneList(){
  if(!state.zones.length){
    zoneList.innerHTML='<div class="zone-empty">暂无分区，点击"+ 新增"添加</div>';
    countryList.innerHTML='<div class="zone-empty">请先选择左侧分区</div>';
    cityList.innerHTML='<div class="zone-empty">请先选择国家/地区</div>';
    return;
  }
  zoneList.innerHTML=state.zones.map((z,idx)=>`<div class="zone-item${state.activeZoneId===z.id?' active':''}" data-zone-id="${z.id}" data-index="${idx}" draggable="true">
    <span class="zone-sort-no">${z.sortNo}</span>
    <input class="zone-name-input" data-action="edit-zone-name" data-id="${z.id}" value="${escapeHtml(z.name)}">
    <span class="zone-item-count">${z.countries.length}国</span>
    <button class="zone-item-del" data-action="delete-zone" data-id="${z.id}" title="删除">×</button>
  </div>`).join('');
  renderCountryList();
}

function renderCountryList(){
  const zone=findZone(state.activeZoneId);
  if(!zone){
    countryList.innerHTML='<div class="zone-empty">请先选择左侧分区</div>';
    cityList.innerHTML='<div class="zone-empty">请先选择国家/地区</div>';
    return;
  }
  if(!zone.countries.length){
    countryList.innerHTML='<div class="zone-empty">暂无国家，点击"+ 新增"添加</div>';
    cityList.innerHTML='<div class="zone-empty">请先选择国家/地区</div>';
    return;
  }
  countryList.innerHTML=zone.countries.map((c,idx)=>`<div class="zone-item${state.activeCountryId===c.id?' active':''}" data-country-id="${c.id}" data-index="${idx}" draggable="true">
    <input class="zone-name-input" data-action="edit-country-name" data-id="${c.id}" value="${escapeHtml(c.name)}">
    <span class="zone-item-count">${c.cities.length}城</span>
    <button class="zone-item-del" data-action="delete-country" data-id="${c.id}" title="删除">×</button>
  </div>`).join('');
  renderCityList();
}

function renderCityList(){
  const country=findCountry(state.activeZoneId,state.activeCountryId);
  if(!country){
    cityList.innerHTML='<div class="zone-empty">请先选择国家/地区</div>';
    return;
  }
  if(!country.cities.length){
    cityList.innerHTML='<div class="zone-empty">暂无城市，点击"+ 新增"添加</div>';
    return;
  }
  cityList.innerHTML=country.cities.map(c=>`<div class="city-row" data-city-id="${c.id}">
    <input placeholder="城市" value="${escapeHtml(c.name)}" data-field="city-name" data-id="${c.id}">
    <input placeholder="开始邮编" value="${escapeHtml(c.startZip)}" data-field="city-start" data-id="${c.id}">
    <input placeholder="结束邮编" value="${escapeHtml(c.endZip)}" data-field="city-end" data-id="${c.id}">
    <button class="zone-item-del" data-action="delete-city" data-id="${c.id}" title="删除">×</button>
  </div>`).join('');
}

/* ===== 拖拽排序 ===== */
let dragSrcIndex=null;
function bindDragSort(containerEl,getArray,renderFn){
  containerEl.addEventListener('dragstart',e=>{
    const item=e.target.closest('.zone-item[draggable]');if(!item)return;
    dragSrcIndex=Number(item.dataset.index);
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',dragSrcIndex);
  });
  containerEl.addEventListener('dragend',e=>{
    const item=e.target.closest('.zone-item');if(!item)return;
    item.classList.remove('dragging');
    containerEl.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
  });
  containerEl.addEventListener('dragover',e=>{
    e.preventDefault();e.dataTransfer.dropEffect='move';
    const item=e.target.closest('.zone-item');if(!item)return;
    containerEl.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
    item.classList.add('drag-over');
  });
  containerEl.addEventListener('dragleave',e=>{
    const item=e.target.closest('.zone-item');if(!item)return;
    item.classList.remove('drag-over');
  });
  containerEl.addEventListener('drop',e=>{
    e.preventDefault();
    const item=e.target.closest('.zone-item');if(!item)return;
    item.classList.remove('drag-over');
    const targetIdx=Number(item.dataset.index);
    if(dragSrcIndex===null||dragSrcIndex===targetIdx)return;
    const arr=getArray();
    const [moved]=arr.splice(dragSrcIndex,1);
    arr.splice(targetIdx,0,moved);
    dragSrcIndex=null;
    renderFn();
  });
}
bindDragSort(zoneList,()=>state.zones,renderZoneList);
bindDragSort(countryList,()=>{const z=findZone(state.activeZoneId);return z?z.countries:[];},renderCountryList);

/* ===== 分区列表交互 ===== */
zoneList.addEventListener('click',e=>{
  if(e.target.closest('.zone-name-input'))return;
  const delBtn=e.target.closest('[data-action="delete-zone"]');
  if(delBtn){
    e.stopPropagation();
    const id=Number(delBtn.dataset.id);
    const z=findZone(id);if(!z)return;
    if(!window.confirm(`确认删除分区"${z.name}"？该分区下的所有国家和城市数据将被清除。`))return;
    state.zones=state.zones.filter(z=>z.id!==id);
    [state.deliveryFees,state.transferFees,state.codFees].forEach(fees=>{Object.values(fees).forEach(row=>{delete row[id];});});
    delete state.deliveryRenewal[id];
    delete state.transferRenewal[id];
    if(state.activeZoneId===id){state.activeZoneId=null;state.activeCountryId=null;}
    renderZoneList();
    showToast('success','已删除',`分区"${z.name}"已移除。`);
    return;
  }
  const item=e.target.closest('.zone-item');
  if(item){state.activeZoneId=Number(item.dataset.zoneId);state.activeCountryId=null;renderZoneList();}
});
zoneList.addEventListener('input',e=>{
  const input=e.target.closest('[data-action="edit-zone-name"]');if(!input)return;
  const z=findZone(Number(input.dataset.id));if(z)z.name=input.value;
});

/* ===== 国家列表交互 ===== */
countryList.addEventListener('click',e=>{
  if(e.target.closest('.zone-name-input'))return;
  const delBtn=e.target.closest('[data-action="delete-country"]');
  if(delBtn){
    e.stopPropagation();
    const id=Number(delBtn.dataset.id);
    const zone=findZone(state.activeZoneId);if(!zone)return;
    const c=zone.countries.find(c=>c.id===id);if(!c)return;
    if(!window.confirm(`确认删除国家"${c.name}"？`))return;
    zone.countries=zone.countries.filter(c=>c.id!==id);
    if(state.activeCountryId===id)state.activeCountryId=null;
    renderCountryList();
    showToast('success','已删除',`国家"${c.name}"已移除。`);
    return;
  }
  const item=e.target.closest('.zone-item');
  if(item){state.activeCountryId=Number(item.dataset.countryId);renderCountryList();}
});
countryList.addEventListener('input',e=>{
  const input=e.target.closest('[data-action="edit-country-name"]');if(!input)return;
  const zone=findZone(state.activeZoneId);if(!zone)return;
  const c=zone.countries.find(c=>c.id===Number(input.dataset.id));if(c)c.name=input.value;
});

/* ===== 城市列表交互 ===== */
cityList.addEventListener('input',e=>{
  const input=e.target.closest('input[data-field]');if(!input)return;
  const country=findCountry(state.activeZoneId,state.activeCountryId);if(!country)return;
  const city=country.cities.find(c=>c.id===Number(input.dataset.id));if(!city)return;
  const field=input.dataset.field;
  if(field==='city-name')city.name=input.value;
  else if(field==='city-start')city.startZip=input.value;
  else if(field==='city-end')city.endZip=input.value;
});
cityList.addEventListener('click',e=>{
  const delBtn=e.target.closest('[data-action="delete-city"]');
  if(delBtn){
    const id=Number(delBtn.dataset.id);
    const country=findCountry(state.activeZoneId,state.activeCountryId);if(!country)return;
    country.cities=country.cities.filter(c=>c.id!==id);
    renderCityList();
  }
});

/* ===== 新增按钮 ===== */
addZoneBtn.addEventListener('click',()=>{
  const newZone={id:nextId++,sortNo:nextSortNo++,name:'新分区',countries:[]};
  state.zones.push(newZone);
  state.weightSteps.forEach((ws,i)=>{
    state.deliveryFees[i][newZone.id]='0.00';
    state.transferFees[i][newZone.id]='0.00';
    state.codFees[i][newZone.id]='0.00';
  });
  state.deliveryRenewal[newZone.id]={unit:'0.5',price:'0.00'};
  state.transferRenewal[newZone.id]={unit:'0.5',price:'0.00'};
  state.activeZoneId=newZone.id;
  state.activeCountryId=null;
  renderZoneList();
  showToast('success','新增成功',`分区已添加，请修改名称。`);
});

addCountryBtn.addEventListener('click',()=>{
  const zone=findZone(state.activeZoneId);
  if(!zone){showToast('error','请先选择分区','请先在左侧选择一个分区。');return;}
  const newCountry={id:nextId++,name:'新国家',cities:[]};
  zone.countries.push(newCountry);
  state.activeCountryId=newCountry.id;
  renderCountryList();
  showToast('success','新增成功','国家已添加，请修改名称。');
});

addCityBtn.addEventListener('click',()=>{
  const country=findCountry(state.activeZoneId,state.activeCountryId);
  if(!country){showToast('error','请先选择国家','请先在中间列选择一个国家/地区。');return;}
  country.cities.push({id:nextId++,name:'',startZip:'',endZip:''});
  renderCityList();
  showToast('success','新增成功','城市行已添加，请填写信息。');
});

/* ===== 运费矩阵 ===== */
const deliveryRenewalCheck=$('deliveryRenewalCheck');
const transferRenewalCheck=$('transferRenewalCheck');
const deliveryTableWrap=$('deliveryTableWrap');
const transferTableWrap=$('transferTableWrap');
const codTableWrap=$('codTableWrap');
const transferEnabledCheck=$('transferEnabledCheck');
const codEnabledCheck=$('codEnabledCheck');

/* 表格启用/停用开关 */
const deliverySection=$('deliverySection');
const transferSection=$('transferSection');
const codSection=$('codSection');
if(transferEnabledCheck&&transferSection){
  transferEnabledCheck.addEventListener('change',()=>{transferSection.style.display=transferEnabledCheck.checked?'':'none';});
}
if(codEnabledCheck&&codSection){
  codEnabledCheck.addEventListener('change',()=>{codSection.style.display=codEnabledCheck.checked?'':'none';});
}

function buildMatrixHead(){
  const zoneCols=state.zones.map(z=>`<th style="width:${Math.max(80,Math.floor(600/Math.max(1,state.zones.length)))}px">${escapeHtml(z.name)}</th>`).join('');
  return `<tr><th style="width:120px">重量段</th>${zoneCols}<th style="width:70px">操作</th></tr>`;
}
function buildMatrixRows(feeData,prefix,renewalEnabled,renewalData){
  if(!state.zones.length){
    return `<tr><td colspan="3" style="padding:40px;text-align:center;color:#9aa8b8;">请先在"分区"Tab中添加分区</td></tr>`;
  }
  let html='';
  state.weightSteps.forEach((ws,idx)=>{
    const startW=idx===0?0:state.weightSteps[idx-1].endWeight;
    const cells=state.zones.map(z=>{
      const val=(feeData[idx]&&feeData[idx][z.id])||'0.00';
      return `<td><input class="matrix-input" data-step-index="${idx}" data-zone="${z.id}" data-prefix="${prefix}" value="${val}"></td>`;
    }).join('');
    html+=`<tr><td><div class="weight-range"><span class="weight-start">${startW}</span><span class="weight-sep">~</span><input class="weight-end-input" data-action="edit-end-weight" data-index="${idx}" value="${ws.endWeight}"></div></td>${cells}<td class="matrix-ops"><button class="matrix-insert" data-action="insert-weight" data-index="${idx}" title="插入">+</button><button class="matrix-delete" data-action="delete-weight" data-index="${idx}" title="删除">×</button></td></tr>`;
  });
  if(renewalEnabled&&renewalData){
    const colCount=state.zones.length+2;
    html+=`<tr class="renewal-sep"><td colspan="${colCount}"></td></tr>`;
    html+=`<tr class="renewal-row"><td class="renewal-label">续重单位(kg)</td>`;
    state.zones.forEach(z=>{
      const val=(renewalData[z.id]&&renewalData[z.id].unit)||'0.5';
      html+=`<td><input class="renewal-input" data-action="renewal-unit" data-zone="${z.id}" data-prefix="${prefix}" value="${val}"></td>`;
    });
    html+=`<td></td></tr>`;
    html+=`<tr class="renewal-row"><td class="renewal-label">续重单价</td>`;
    state.zones.forEach(z=>{
      const val=(renewalData[z.id]&&renewalData[z.id].price)||'0.00';
      html+=`<td><input class="renewal-input" data-action="renewal-price" data-zone="${z.id}" data-prefix="${prefix}" value="${val}"></td>`;
    });
    html+=`<td></td></tr>`;
  }
  return html;
}
function renderMatrix(headEl,bodyEl,feeData,prefix,renewalEnabled,renewalData){headEl.innerHTML=buildMatrixHead();bodyEl.innerHTML=buildMatrixRows(feeData,prefix,renewalEnabled,renewalData);}
function renderAllMatrix(){
  renderMatrix(deliveryFeeHead,deliveryFeeBody,state.deliveryFees,'delivery',state.deliveryRenewalEnabled,state.deliveryRenewal);
  renderMatrix(transferFeeHead,transferFeeBody,state.transferFees,'transfer',state.transferRenewalEnabled,state.transferRenewal);
  renderMatrix(codFeeHead,codFeeBody,state.codFees,'cod',false,null);
}

/* 复选框开关 */
deliveryRenewalCheck.addEventListener('change',()=>{
  state.deliveryRenewalEnabled=deliveryRenewalCheck.checked;
  renderMatrix(deliveryFeeHead,deliveryFeeBody,state.deliveryFees,'delivery',state.deliveryRenewalEnabled,state.deliveryRenewal);
});
transferRenewalCheck.addEventListener('change',()=>{
  state.transferRenewalEnabled=transferRenewalCheck.checked;
  renderMatrix(transferFeeHead,transferFeeBody,state.transferFees,'transfer',state.transferRenewalEnabled,state.transferRenewal);
});

/* 统一输入事件（费用 + 结束重量 + 续重） */
function handleMatrixInput(e){
  const mInput=e.target.closest('.matrix-input');
  if(mInput){
    const idx=Number(mInput.dataset.stepIndex);const zid=Number(mInput.dataset.zone);const prefix=mInput.dataset.prefix;
    const feeMap=prefix==='delivery'?state.deliveryFees:prefix==='transfer'?state.transferFees:state.codFees;
    if(!feeMap[idx])feeMap[idx]={};feeMap[idx][zid]=mInput.value;
    return;
  }
  const endInput=e.target.closest('[data-action="edit-end-weight"]');
  if(endInput){
    const idx=Number(endInput.dataset.index);
    const val=parseFloat(endInput.value);
    if(!isNaN(val)&&val>0){state.weightSteps[idx].endWeight=val;renderAllMatrix();}
    return;
  }
  const rUnit=e.target.closest('[data-action="renewal-unit"]');
  if(rUnit){
    const zid=Number(rUnit.dataset.zone);const prefix=rUnit.dataset.prefix;
    const map=prefix==='delivery'?state.deliveryRenewal:state.transferRenewal;
    if(!map[zid])map[zid]={};map[zid].unit=rUnit.value;
    return;
  }
  const rPrice=e.target.closest('[data-action="renewal-price"]');
  if(rPrice){
    const zid=Number(rPrice.dataset.zone);const prefix=rPrice.dataset.prefix;
    const map=prefix==='delivery'?state.deliveryRenewal:state.transferRenewal;
    if(!map[zid])map[zid]={};map[zid].price=rPrice.value;
    return;
  }
}
[deliveryFeeBody,transferFeeBody,codFeeBody].forEach(el=>{el.addEventListener('input',handleMatrixInput);});

function insertWeightStep(idx){
  const insertIdx=idx+1;
  // 后移费用数据
  for(let i=state.weightSteps.length;i>insertIdx;i--){
    state.deliveryFees[i]=state.deliveryFees[i-1]||{};
    state.transferFees[i]=state.transferFees[i-1]||{};
    state.codFees[i]=state.codFees[i-1]||{};
  }
  state.weightSteps.splice(insertIdx,0,{endWeight:''});
  state.deliveryFees[insertIdx]={};state.transferFees[insertIdx]={};state.codFees[insertIdx]={};
  state.zones.forEach(z=>{
    state.deliveryFees[insertIdx][z.id]='0.00';
    state.transferFees[insertIdx][z.id]='0.00';
    state.codFees[insertIdx][z.id]='0.00';
  });
  renderAllMatrix();
}

function handleMatrixAction(e){
  const insertBtn=e.target.closest('[data-action="insert-weight"]');
  if(insertBtn){insertWeightStep(Number(insertBtn.dataset.index));return;}
  const delBtn=e.target.closest('[data-action="delete-weight"]');
  if(!delBtn)return;
  const idx=Number(delBtn.dataset.index);
  const startW=idx===0?0:state.weightSteps[idx-1].endWeight;
  const endW=state.weightSteps[idx].endWeight;
  if(!window.confirm(`确认删除重量段"${startW}~${endW}"？`))return;
  for(let i=idx+1;i<state.weightSteps.length;i++){
    state.deliveryFees[i-1]=state.deliveryFees[i]||{};
    state.transferFees[i-1]=state.transferFees[i]||{};
    state.codFees[i-1]=state.codFees[i]||{};
  }
  const lastIdx=state.weightSteps.length-1;
  delete state.deliveryFees[lastIdx];delete state.transferFees[lastIdx];delete state.codFees[lastIdx];
  state.weightSteps.splice(idx,1);
  renderAllMatrix();
}
[deliveryFeeBody,transferFeeBody,codFeeBody].forEach(el=>{el.addEventListener('click',handleMatrixAction);});

/* ===== 附加费 ===== */
const surchargeABKeys=['Length','Weight','Dimension','Volume','Limit','Remote','RemotePlus','RemoteUltra'];
const codSurchargeContainer=$('codSurchargeContainer');

/* 简化矩阵行(无续重) */
function buildSurchargeMatrixRows(feeData,key,fuelEnabled,fuelFees){
  if(!state.zones.length){
    return `<tr><td colspan="3" style="padding:40px;text-align:center;color:#9aa8b8;">请先在"分区"Tab中添加分区</td></tr>`;
  }
  let html='';
  state.weightSteps.forEach((ws,idx)=>{
    const startW=idx===0?0:state.weightSteps[idx-1].endWeight;
    const cells=state.zones.map(z=>{
      const val=(feeData[idx]&&feeData[idx][z.id])||'0.00';
      return `<td><input class="matrix-input" data-step-index="${idx}" data-zone="${z.id}" data-prefix="surcharge" data-key="${key}" value="${val}"></td>`;
    }).join('');
    html+=`<tr><td><div class="weight-range"><span class="weight-start">${startW}</span><span class="weight-sep">~</span><input class="weight-end-input" data-action="edit-end-weight" data-index="${idx}" value="${ws.endWeight}"></div></td>${cells}<td class="matrix-ops"><button class="matrix-insert" data-action="insert-weight" data-index="${idx}" title="插入">+</button><button class="matrix-delete" data-action="delete-weight" data-index="${idx}" title="删除">×</button></td></tr>`;
  });
  if(fuelEnabled){
    const colCount=state.zones.length+2;
    html+=`<tr class="renewal-sep"><td colspan="${colCount}"></td></tr>`;
    html+=`<tr class="fuel-row"><td class="renewal-label">燃油费率</td>`;
    state.zones.forEach(z=>{
      const val=(fuelFees&&fuelFees[z.id])||'0.00';
      html+=`<td><input class="renewal-input" data-action="surcharge-fuel" data-zone="${z.id}" data-key="${key}" value="${val}"></td>`;
    });
    html+=`<td></td></tr>`;
  }
  return html;
}

/* 渲染单个附加费矩阵 */
function renderSurcharge(key){
  const data=state['surcharge'+key];
  const headEl=$('surcharge'+key+'Head');
  const bodyEl=$('surcharge'+key+'Body');
  if(!headEl||!bodyEl)return;
  headEl.innerHTML=buildMatrixHead();
  bodyEl.innerHTML=buildSurchargeMatrixRows(data.fees,key,data.fuelEnabled,data.fuelFees);
  const ruleEl=$('surcharge'+key+'Rule');
  if(ruleEl)ruleEl.value=data.hitRule;
  const fuelEl=$('surcharge'+key+'Fuel');
  if(fuelEl)fuelEl.checked=data.fuelEnabled;
}

/* 渲染COD附加费 */
function renderCodSurcharge(){
  if(!codSurchargeContainer)return;
  if(!state.surchargeCod.currencies.length){
    codSurchargeContainer.innerHTML='<div style="padding:30px;text-align:center;color:#9aa8b8;">暂无币种，点击"新增币种"添加</div>';
    return;
  }
  codSurchargeContainer.innerHTML=state.surchargeCod.currencies.map((cur,cidx)=>`<div class="cod-currency-block">
    <div class="cod-currency-head"><span>${escapeHtml(cur.currency)}</span><button data-action="delete-cod-currency" data-cidx="${cidx}" style="margin-left:auto;color:#e74c3c;background:none;border:none;cursor:pointer;font-size:13px;">删除币种</button></div>
    <table class="surcharge-table"><thead><tr><th>最小金额</th><th>最大金额</th><th>固定附加费</th><th>操作</th></tr></thead><tbody>${cur.ranges.map((r,ridx)=>`<tr data-cidx="${cidx}" data-ridx="${ridx}">
      <td>${ridx===0?'0':'<input class="surcharge-input" data-field="min" data-cidx="'+cidx+'" data-ridx="'+ridx+'" value="'+escapeHtml(r.min)+'">'}</td>
      <td><input class="surcharge-input" data-field="max" data-cidx="${cidx}" data-ridx="${ridx}" value="${escapeHtml(r.max)}"></td>
      <td><input class="surcharge-input" data-field="fee" data-cidx="${cidx}" data-ridx="${ridx}" value="${escapeHtml(r.fee)}"></td>
      <td><button data-action="delete-cod-range" data-cidx="${cidx}" data-ridx="${ridx}" style="color:#e74c3c;background:none;border:none;cursor:pointer;">删除</button></td>
    </tr>`).join('')}</tbody></table>
    <button data-action="add-cod-range" data-cidx="${cidx}" style="margin:8px 0;color:#4a90d9;background:none;border:1px dashed #4a90d9;padding:4px 12px;cursor:pointer;border-radius:4px;font-size:12px;">新增区间</button>
  </div>`).join('');
}

/* 开关绑定 */
surchargeABKeys.forEach(key=>{
  const check=$('surcharge'+key+'Enabled');
  const section=$('surcharge'+key+'Section');
  if(check&&section){
    check.addEventListener('change',()=>{
      state['surcharge'+key].enabled=check.checked;
      section.style.display=check.checked?'':'none';
      if(check.checked)renderSurcharge(key);
    });
  }
  const fuelEl=$('surcharge'+key+'Fuel');
  if(fuelEl){
    fuelEl.addEventListener('change',()=>{
      state['surcharge'+key].fuelEnabled=fuelEl.checked;
      renderSurcharge(key);
    });
  }
  const ruleEl=$('surcharge'+key+'Rule');
  if(ruleEl){
    ruleEl.addEventListener('change',()=>{
      state['surcharge'+key].hitRule=ruleEl.value;
    });
  }
  const bodyEl=$('surcharge'+key+'Body');
  if(bodyEl){
    bodyEl.addEventListener('input',e=>{
      const mInput=e.target.closest('.matrix-input[data-prefix="surcharge"]');
      if(mInput){
        const idx=Number(mInput.dataset.stepIndex);const zid=Number(mInput.dataset.zone);const k=mInput.dataset.key;
        const fees=state['surcharge'+k].fees;
        if(!fees[idx])fees[idx]={};fees[idx][zid]=mInput.value;
        return;
      }
      const fInput=e.target.closest('[data-action="surcharge-fuel"]');
      if(fInput){
        const zid=Number(fInput.dataset.zone);const k=fInput.dataset.key;
        state['surcharge'+k].fuelFees[zid]=fInput.value;
        return;
      }
      const endInput=e.target.closest('[data-action="edit-end-weight"]');
      if(endInput){
        const idx=Number(endInput.dataset.index);
        const val=parseFloat(endInput.value);
        if(!isNaN(val)&&val>0){state.weightSteps[idx].endWeight=val;renderAllMatrix();renderAllSurchargeMatrix();}
        return;
      }
    });
    bodyEl.addEventListener('click',e=>{
      const insertBtn=e.target.closest('[data-action="insert-weight"]');
      if(insertBtn){insertWeightStep(Number(insertBtn.dataset.index));renderAllSurchargeMatrix();return;}
      const delBtn=e.target.closest('[data-action="delete-weight"]');
      if(delBtn){
        const idx=Number(delBtn.dataset.index);
        const startW=idx===0?0:state.weightSteps[idx-1].endWeight;
        const endW=state.weightSteps[idx].endWeight;
        if(!window.confirm(`确认删除重量段"${startW}~${endW}"？`))return;
        for(let i=idx+1;i<state.weightSteps.length;i++){
          state.deliveryFees[i-1]=state.deliveryFees[i]||{};
          state.transferFees[i-1]=state.transferFees[i-1]||{};
          state.codFees[i-1]=state.codFees[i-1]||{};
        }
        const lastIdx=state.weightSteps.length-1;
        delete state.deliveryFees[lastIdx];delete state.transferFees[lastIdx];delete state.codFees[lastIdx];
        state.weightSteps.splice(idx,1);
        renderAllMatrix();
        renderAllSurchargeMatrix();
      }
    });
  }
});

/* COD开关 */
const surchargeCodCheck=$('surchargeCodEnabled');
const surchargeCodSection=$('surchargeCodSection');
if(surchargeCodCheck&&surchargeCodSection){
  surchargeCodCheck.addEventListener('change',()=>{
    state.surchargeCod.enabled=surchargeCodCheck.checked;
    surchargeCodSection.style.display=surchargeCodCheck.checked?'':'none';
    if(surchargeCodCheck.checked)renderCodSurcharge();
  });
}

/* 新增币种 */
const addCodCurBtn=$('addCodSurchargeCurrencyBtn');
if(addCodCurBtn){
  addCodCurBtn.addEventListener('click',()=>{
    const cur=prompt('请输入币种代码（如EUR、USD）:');
    if(!cur||!cur.trim())return;
    state.surchargeCod.currencies.push({currency:cur.trim().toUpperCase(),ranges:[{min:'0',max:'',fee:''}]});
    renderCodSurcharge();
  });
}

/* COD容器事件代理 */
if(codSurchargeContainer){
  codSurchargeContainer.addEventListener('click',e=>{
    const delCur=e.target.closest('[data-action="delete-cod-currency"]');
    if(delCur){
      const cidx=Number(delCur.dataset.cidx);
      state.surchargeCod.currencies.splice(cidx,1);
      renderCodSurcharge();
      return;
    }
    const delRange=e.target.closest('[data-action="delete-cod-range"]');
    if(delRange){
      const cidx=Number(delRange.dataset.cidx);const ridx=Number(delRange.dataset.ridx);
      state.surchargeCod.currencies[cidx].ranges.splice(ridx,1);
      renderCodSurcharge();
      return;
    }
    const addRange=e.target.closest('[data-action="add-cod-range"]');
    if(addRange){
      const cidx=Number(addRange.dataset.cidx);
      const ranges=state.surchargeCod.currencies[cidx].ranges;
      const lastMax=ranges.length?ranges[ranges.length-1].max:'0';
      ranges.push({min:lastMax,max:'',fee:''});
      renderCodSurcharge();
      return;
    }
  });
  codSurchargeContainer.addEventListener('input',e=>{
    const input=e.target.closest('.surcharge-input[data-field]');
    if(!input)return;
    const cidx=Number(input.dataset.cidx);const ridx=Number(input.dataset.ridx);
    const range=state.surchargeCod.currencies[cidx]&&state.surchargeCod.currencies[cidx].ranges[ridx];
    if(range)range[input.dataset.field]=input.value;
  });
}

/* 附加费Tab切到时渲染已启用的矩阵 */
function renderAllSurchargeMatrix(){
  surchargeABKeys.forEach(key=>{
    const data=state['surcharge'+key];
    if(data.enabled)renderSurcharge(key);
  });
  if(state.surchargeCod.enabled)renderCodSurcharge();
}

/* ===== 表单验证 & 保存 ===== */
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

/* ===== 编辑模式 ===== */
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

/* ===== 初始化 ===== */
if(state.zones.length){state.activeZoneId=state.zones[0].id;}
const firstZone=findZone(state.activeZoneId);
if(firstZone&&firstZone.countries.length){state.activeCountryId=firstZone.countries[0].id;}
renderZoneList();
renderAllMatrix();
})();
