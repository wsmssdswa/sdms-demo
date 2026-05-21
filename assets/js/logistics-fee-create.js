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
const codSurchargeContainer=$('codSurchargeContainer');

const escapeHtml=(v)=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* 燃油规则mock数据 */
const FUEL_RULES=[
  {id:'FR001',name:'标准燃油附加',rate:15},
  {id:'FR002',name:'欧线燃油附加',rate:12},
  {id:'FR003',name:'亚线燃油附加',rate:18},
  {id:'FR004',name:'北美燃油附加',rate:20}
];
function renderFuelRuleOptions(){
  const sel=$('fuelRule');if(!sel)return;
  sel.innerHTML='<option value="">请选择</option>'+FUEL_RULES.map(r=>`<option value="${r.id}">${r.name} (${r.rate}%)</option>`).join('');
}
renderFuelRuleOptions();

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
  /* A类：尺寸附加费（单行固定费用 fees={[zoneId]:'5.00'}） */
  surchargeLength:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeWeight:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeDimension:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeVolume:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  surchargeLimit:{enabled:false,hitRule:'',fuelEnabled:false,fees:{},fuelFees:{}},
  /* B类：偏远附加费（重量段×分区+续重+燃油 fees={[stepIdx]:{[zoneId]:'5.00'}}） */
  surchargeRemote:{enabled:false,hitRule:'',fuelEnabled:false,renewalEnabled:false,fees:{},fuelFees:{},renewal:{}},
  surchargeRemotePlus:{enabled:false,hitRule:'',fuelEnabled:false,renewalEnabled:false,fees:{},fuelFees:{},renewal:{}},
  surchargeRemoteUltra:{enabled:false,hitRule:'',fuelEnabled:false,renewalEnabled:false,fees:{},fuelFees:{},renewal:{}},
  /* C类：COD金额附加费 */
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

/* 初始化附加费Mock */
const sizeKeys=['Length','Weight','Dimension','Volume','Limit'];
const remoteKeys=['Remote','RemotePlus','RemoteUltra'];
sizeKeys.forEach(key=>{
  state.zones.forEach(z=>{
    state['surcharge'+key].fees[z.id]=(3+Math.random()*20).toFixed(2);
    state['surcharge'+key].fuelFees[z.id]=(0.05+Math.random()*0.15).toFixed(2);
  });
});
remoteKeys.forEach(key=>{
  state.weightSteps.forEach((ws,i)=>{
    state['surcharge'+key].fees[i]={};
    state.zones.forEach(z=>{
      state['surcharge'+key].fees[i][z.id]=(2+Math.random()*15).toFixed(2);
    });
  });
  state.zones.forEach(z=>{
    state['surcharge'+key].fuelFees[z.id]=(0.05+Math.random()*0.1).toFixed(2);
    state['surcharge'+key].renewal[z.id]={unit:'0.5',price:(1+Math.random()*4).toFixed(2)};
  });
});
state.surchargeCod.currencies=[
  {currency:'EUR',ranges:[{min:'0',max:'500',fee:'2.00'},{min:'500',max:'2000',fee:'5.00'},{min:'2000',max:'',fee:'12.00'}]},
  {currency:'USD',ranges:[{min:'0',max:'1000',fee:'3.00'},{min:'1000',max:'5000',fee:'8.00'}]},
];

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
    const map=prefix==='delivery'?state.deliveryRenewal:prefix==='transfer'?state.transferRenewal:null;
    if(map){if(!map[zid])map[zid]={};map[zid].unit=rUnit.value;}
    return;
  }
  const rPrice=e.target.closest('[data-action="renewal-price"]');
  if(rPrice){
    const zid=Number(rPrice.dataset.zone);const prefix=rPrice.dataset.prefix;
    const map=prefix==='delivery'?state.deliveryRenewal:prefix==='transfer'?state.transferRenewal:null;
    if(map){if(!map[zid])map[zid]={};map[zid].price=rPrice.value;}
    return;
  }
}
[deliveryFeeBody,transferFeeBody,codFeeBody].forEach(el=>{el.addEventListener('input',handleMatrixInput);});

function insertWeightStep(idx){
  const insertIdx=idx+1;
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
    state.transferFees[i-1]=state.transferFees[i-1]||{};
    state.codFees[i-1]=state.codFees[i-1]||{};
  }
  const lastIdx=state.weightSteps.length-1;
  delete state.deliveryFees[lastIdx];delete state.transferFees[lastIdx];delete state.codFees[lastIdx];
  state.weightSteps.splice(idx,1);
  renderAllMatrix();
}
[deliveryFeeBody,transferFeeBody,codFeeBody].forEach(el=>{el.addEventListener('click',handleMatrixAction);});

/* ===== 附加费 ===== */

/* A类：尺寸附加费 - 单行固定费用表 */
function buildSizeSurchargeHead(){
  if(!state.zones.length) return '';
  return '<tr>'+state.zones.map(z=>`<th>${escapeHtml(z.name)}</th>`).join('')+'</tr>';
}
function buildSizeSurchargeBody(data,key){
  if(!state.zones.length){
    return '<tr><td style="padding:40px;text-align:center;color:#9aa8b8;">请先在"分区"Tab中添加分区</td></tr>';
  }
  let html='<tr>';
  state.zones.forEach(z=>{
    const val=data.fees[z.id]||'0.00';
    html+=`<td><input class="matrix-input" data-prefix="surcharge-size" data-key="${key}" data-zone="${z.id}" value="${val}"></td>`;
  });
  html+='</tr>';
  return html;
}
function renderSizeSurcharge(key){
  const data=state['surcharge'+key];
  const headEl=$('surcharge'+key+'Head');
  const bodyEl=$('surcharge'+key+'Body');
  if(!headEl||!bodyEl)return;
  headEl.innerHTML=buildSizeSurchargeHead();
  bodyEl.innerHTML=buildSizeSurchargeBody(data,key);
  const ruleEl=$('surcharge'+key+'Rule');
  if(ruleEl)ruleEl.value=data.hitRule;
  const fuelEl=$('surcharge'+key+'Fuel');
  if(fuelEl)fuelEl.checked=data.fuelEnabled;
}

/* B类：偏远附加费 - 重量段×分区矩阵+续重+燃油 */
function buildRemoteSurchargeBody(data,key){
  if(!state.zones.length){
    return '<tr><td colspan="3" style="padding:40px;text-align:center;color:#9aa8b8;">请先在"分区"Tab中添加分区</td></tr>';
  }
  let html='';
  state.weightSteps.forEach((ws,idx)=>{
    const startW=idx===0?0:state.weightSteps[idx-1].endWeight;
    const cells=state.zones.map(z=>{
      const val=(data.fees[idx]&&data.fees[idx][z.id])||'0.00';
      return `<td><input class="matrix-input" data-step-index="${idx}" data-zone="${z.id}" data-prefix="surcharge-remote" data-key="${key}" value="${val}"></td>`;
    }).join('');
    html+=`<tr><td><div class="weight-range"><span class="weight-start">${startW}</span><span class="weight-sep">~</span><input class="weight-end-input" data-action="edit-end-weight" data-index="${idx}" value="${ws.endWeight}"></div></td>${cells}<td class="matrix-ops"><button class="matrix-insert" data-action="insert-weight" data-index="${idx}" title="插入">+</button><button class="matrix-delete" data-action="delete-weight" data-index="${idx}" title="删除">×</button></td></tr>`;
  });
  /* 续重行 */
  if(data.renewalEnabled){
    const colCount=state.zones.length+2;
    html+=`<tr class="renewal-sep"><td colspan="${colCount}"></td></tr>`;
    html+='<tr class="renewal-row"><td class="renewal-label">续重单位(kg)</td>';
    state.zones.forEach(z=>{
      const val=(data.renewal[z.id]&&data.renewal[z.id].unit)||'0.5';
      html+=`<td><input class="renewal-input" data-action="surcharge-renewal-unit" data-zone="${z.id}" data-key="${key}" value="${val}"></td>`;
    });
    html+='<td></td></tr>';
    html+='<tr class="renewal-row"><td class="renewal-label">续重单价</td>';
    state.zones.forEach(z=>{
      const val=(data.renewal[z.id]&&data.renewal[z.id].price)||'0.00';
      html+=`<td><input class="renewal-input" data-action="surcharge-renewal-price" data-zone="${z.id}" data-key="${key}" value="${val}"></td>`;
    });
    html+='<td></td></tr>';
  }
  return html;
}
function renderRemoteSurcharge(key){
  const data=state['surcharge'+key];
  const headEl=$('surcharge'+key+'Head');
  const bodyEl=$('surcharge'+key+'Body');
  if(!headEl||!bodyEl)return;
  headEl.innerHTML=buildMatrixHead();
  bodyEl.innerHTML=buildRemoteSurchargeBody(data,key);
  const ruleEl=$('surcharge'+key+'Rule');
  if(ruleEl)ruleEl.value=data.hitRule;
  const fuelEl=$('surcharge'+key+'Fuel');
  if(fuelEl)fuelEl.checked=data.fuelEnabled;
  const renewalEl=$('surcharge'+key+'RenewalCheck');
  if(renewalEl)renewalEl.checked=data.renewalEnabled;
}

/* C类：COD金额附加费 - 统一表格 */
const codCurrencyOptions=['EUR','USD','CNY','GBP'];
function renderCodSurcharge(){
  if(!codSurchargeContainer)return;
  if(!state.surchargeCod.currencies.length){
    codSurchargeContainer.innerHTML='<div style="padding:30px;text-align:center;color:#9aa8b8;">暂无币种，点击下方"新增币种"添加</div><button data-action="add-cod-currency" style="margin:12px 16px;color:#4a90d9;background:none;border:1px dashed #4a90d9;padding:6px 16px;cursor:pointer;border-radius:4px;font-size:12px;">新增币种</button>';
    return;
  }
  let rows='';
  state.surchargeCod.currencies.forEach((cur,cidx)=>{
    const opts=codCurrencyOptions.map(c=>`<option${c===cur.currency?' selected':''}>${c}</option>`).join('');
    const span=cur.ranges.length;
    cur.ranges.forEach((r,ridx)=>{
      const curCell=ridx===0?`<td class="cod-currency-cell" rowspan="${span}"><div class="surcharge-select-wrap"><select class="surcharge-input surcharge-select" data-action="cod-currency" data-cidx="${cidx}"><option value="">请选择</option>${opts}</select><svg viewBox="0 0 24 24" fill="currentColor"><path d="m7 10 5 5 5-5z"></path></svg></div></td>`:'';
      rows+=`<tr>
        ${curCell}
        <td class="cod-range-cell"><input class="surcharge-input" data-field="min" data-cidx="${cidx}" data-ridx="${ridx}" value="${escapeHtml(r.min)}"><span class="cod-range-sep">-</span><input class="surcharge-input" data-field="max" data-cidx="${cidx}" data-ridx="${ridx}" value="${escapeHtml(r.max)}"></td>
        <td><input class="surcharge-input" data-field="fee" data-cidx="${cidx}" data-ridx="${ridx}" value="${escapeHtml(r.fee)}"></td>
        <td class="surcharge-ops"><button class="matrix-insert" data-action="insert-cod-range" data-cidx="${cidx}" data-ridx="${ridx}" title="插入">+</button><button class="matrix-delete" data-action="delete-cod-range" data-cidx="${cidx}" data-ridx="${ridx}" title="删除">×</button></td>
      </tr>`;
    });
  });
  codSurchargeContainer.innerHTML=`<table class="surcharge-table"><thead><tr><th style="width:100px">币种</th><th style="width:220px">收费区间</th><th style="width:120px">固定附加费</th><th style="width:70px">操作</th></tr></thead><tbody>${rows}</tbody></table><button data-action="add-cod-currency" style="margin:12px 16px;color:#4a90d9;background:none;border:1px dashed #4a90d9;padding:6px 16px;cursor:pointer;border-radius:4px;font-size:12px;">新增币种</button>`;
}

/* ===== 附加费开关绑定 ===== */

/* A类开关 */
sizeKeys.forEach(key=>{
  const check=$('surcharge'+key+'Enabled');
  const section=$('surcharge'+key+'Section');
  if(check&&section){
    check.addEventListener('change',()=>{
      state['surcharge'+key].enabled=check.checked;
      section.style.display=check.checked?'':'none';
      if(check.checked)renderSizeSurcharge(key);
    });
  }
  const fuelEl=$('surcharge'+key+'Fuel');
  if(fuelEl){
    fuelEl.addEventListener('change',()=>{
      state['surcharge'+key].fuelEnabled=fuelEl.checked;
      renderSizeSurcharge(key);
    });
  }
  const ruleEl=$('surcharge'+key+'Rule');
  if(ruleEl){
    ruleEl.addEventListener('change',()=>{
      state['surcharge'+key].hitRule=ruleEl.value;
    });
  }
});

/* B类开关 */
remoteKeys.forEach(key=>{
  const check=$('surcharge'+key+'Enabled');
  const section=$('surcharge'+key+'Section');
  if(check&&section){
    check.addEventListener('change',()=>{
      state['surcharge'+key].enabled=check.checked;
      section.style.display=check.checked?'':'none';
      if(check.checked)renderRemoteSurcharge(key);
    });
  }
  const fuelEl=$('surcharge'+key+'Fuel');
  if(fuelEl){
    fuelEl.addEventListener('change',()=>{
      state['surcharge'+key].fuelEnabled=fuelEl.checked;
      renderRemoteSurcharge(key);
    });
  }
  const renewalEl=$('surcharge'+key+'RenewalCheck');
  if(renewalEl){
    renewalEl.addEventListener('change',()=>{
      state['surcharge'+key].renewalEnabled=renewalEl.checked;
      renderRemoteSurcharge(key);
    });
  }
  const ruleEl=$('surcharge'+key+'Rule');
  if(ruleEl){
    ruleEl.addEventListener('change',()=>{
      state['surcharge'+key].hitRule=ruleEl.value;
    });
  }
});

/* C类开关 */
const surchargeCodCheck=$('surchargeCodEnabled');
const surchargeCodSection=$('surchargeCodSection');
if(surchargeCodCheck&&surchargeCodSection){
  surchargeCodCheck.addEventListener('change',()=>{
    state.surchargeCod.enabled=surchargeCodCheck.checked;
    surchargeCodSection.style.display=surchargeCodCheck.checked?'':'none';
    if(surchargeCodCheck.checked)renderCodSurcharge();
  });
}

/* ===== 附加费事件处理 ===== */

/* A类事件（单行费用表 - 在section上委托） */
sizeKeys.forEach(key=>{
  const section=$('surcharge'+key+'Section');
  if(!section)return;
  section.addEventListener('input',e=>{
    const mInput=e.target.closest('[data-prefix="surcharge-size"]');
    if(mInput){
      const zid=Number(mInput.dataset.zone);const k=mInput.dataset.key;
      state['surcharge'+k].fees[zid]=mInput.value;
      return;
    }
    const fInput=e.target.closest('[data-action="surcharge-fuel"]');
    if(fInput){
      const zid=Number(fInput.dataset.zone);const k=fInput.dataset.key;
      state['surcharge'+k].fuelFees[zid]=fInput.value;
      return;
    }
  });
});

/* B类事件（矩阵+续重+燃油） */
remoteKeys.forEach(key=>{
  const section=$('surcharge'+key+'Section');
  if(!section)return;
  section.addEventListener('input',e=>{
    const mInput=e.target.closest('[data-prefix="surcharge-remote"]');
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
    const rUnit=e.target.closest('[data-action="surcharge-renewal-unit"]');
    if(rUnit){
      const zid=Number(rUnit.dataset.zone);const k=rUnit.dataset.key;
      const renewal=state['surcharge'+k].renewal;
      if(!renewal[zid])renewal[zid]={};renewal[zid].unit=rUnit.value;
      return;
    }
    const rPrice=e.target.closest('[data-action="surcharge-renewal-price"]');
    if(rPrice){
      const zid=Number(rPrice.dataset.zone);const k=rPrice.dataset.key;
      const renewal=state['surcharge'+k].renewal;
      if(!renewal[zid])renewal[zid]={};renewal[zid].price=rPrice.value;
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
  section.addEventListener('click',e=>{
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
});

/* C类事件（COD统一表格） */
if(codSurchargeContainer){
  codSurchargeContainer.addEventListener('click',e=>{
    const addCur=e.target.closest('[data-action="add-cod-currency"]');
    if(addCur){
      state.surchargeCod.currencies.push({currency:"",ranges:[{min:"",max:"",fee:""}]});
      renderCodSurcharge();
      return;
    }
    const insertRange=e.target.closest('[data-action="insert-cod-range"]');
    if(insertRange){
      const cidx=Number(insertRange.dataset.cidx);const ridx=Number(insertRange.dataset.ridx);
      const ranges=state.surchargeCod.currencies[cidx].ranges;
      const curMax=ridx<ranges.length?ranges[ridx].max:'0';
      ranges.splice(ridx+1,0,{min:curMax||'0',max:'',fee:''});
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
  });
  codSurchargeContainer.addEventListener('input',e=>{
    const input=e.target.closest('.surcharge-input[data-field]');
    if(input){
      const cidx=Number(input.dataset.cidx);const ridx=Number(input.dataset.ridx);
      const cur=state.surchargeCod.currencies[cidx];
      const range=cur&&cur.ranges[ridx];
      if(!range)return;
      range[input.dataset.field]=input.value;
      /* 校验：起始值不能大于结束值 */
      const minVal=parseFloat(range.min);
      const maxVal=parseFloat(range.max);
      if(range.min!==''&&range.max!==''&&!isNaN(minVal)&&!isNaN(maxVal)&&minVal>maxVal){
        if(input.dataset.field==='min'){range.min=range.max;input.value=range.max;}
        else{range.max=range.min;input.value=range.min;}
      }
      /* max变化时联动下一行min */
      if(input.dataset.field==='max'){
        const ranges=cur.ranges;
        if(ridx+1<ranges.length){
          ranges[ridx+1].min=range.max;
          const nextMin=codSurchargeContainer.querySelector(`.surcharge-input[data-field="min"][data-cidx="${cidx}"][data-ridx="${ridx+1}"]`);
          if(nextMin)nextMin.value=range.max;
        }
      }
      return;
    }
  });
  codSurchargeContainer.addEventListener('change',e=>{
    const sel=e.target.closest('[data-action="cod-currency"]');
    if(sel){
      const cidx=Number(sel.dataset.cidx);
      if(state.surchargeCod.currencies[cidx]){
        state.surchargeCod.currencies[cidx].currency=sel.value;
        renderCodSurcharge();
      }
    }
  });
}

/* 附加费Tab切到时渲染已启用的矩阵 */
function renderAllSurchargeMatrix(){
  sizeKeys.forEach(key=>{
    if(state['surcharge'+key].enabled)renderSizeSurcharge(key);
  });
  remoteKeys.forEach(key=>{
    if(state['surcharge'+key].enabled)renderRemoteSurcharge(key);
  });
  if(state.surchargeCod.enabled)renderCodSurcharge();
}

/* ===== 表单验证 & 保存 ===== */
function validateForm(){
  let valid=true;
  const fields=[{id:'quoteName',label:'物流费名称'},{id:'channel',label:'渠道'},{id:'currency',label:'币种'},{id:'weightUnit',label:'计重单位'},{id:'volWeightMethod',label:'体积重计算方式'},{id:'volWeightCoeff',label:'体积重系数'}];
  fields.forEach(f=>{
    const el=$(f.id);const tip=el.closest('.field-group').querySelector('.field-tip');
    if(!el.value.trim()){tip.textContent=`请${el.tagName==='SELECT'?'选择':'输入'}${f.label}`;el.classList.add('field-error');if(valid)el.focus();valid=false;}
    else{tip.textContent='';el.classList.remove('field-error');}
  });
  return valid;
}
saveBtn.addEventListener('click',()=>{if(!validateForm()){showToast('error','校验失败','请完善必填项。');return;}showToast('success','保存成功','物流费数据已保存。');});
backBtn.addEventListener('click',()=>{window.location.href='logistics-fee-config.html';});

/* ===== 编辑模式 ===== */
const params=new URLSearchParams(window.location.search);
if(params.get('mode')==='edit'){
  pageTitleLabel.textContent='编辑物流费';
  $('quoteName').value='波兰仓-西欧专线-快递服务';
  $('channel').value='西欧专线';
  $('currency').value='EUR';
  $('weightUnit').value='KG';
  $('volWeightMethod').value='divide';
  $('volWeightCoeff').value='6000';
  $('fuelRule').value='FR001';
  $('remark').value='西欧区域标准报价';
}

/* ===== 初始化 ===== */
if(state.zones.length){state.activeZoneId=state.zones[0].id;}
const firstZone=findZone(state.activeZoneId);
if(firstZone&&firstZone.countries.length){state.activeCountryId=firstZone.countries[0].id;}
renderZoneList();
renderAllMatrix();
})();
