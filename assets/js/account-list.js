(()=>{
  /* DOM */
  const transactionBody=document.getElementById('transactionBody');
  const txTypeSelect=document.getElementById('txTypeSelect');
  const queryBtn=document.getElementById('queryBtn');
  const resetBtn=document.getElementById('resetBtn');
  const totalCountText=document.getElementById('totalCountText');
  const pageBtnGroup=document.getElementById('pageBtnGroup');
  const pageSizeSelect=document.getElementById('pageSizeSelect');
  const jumpInput=document.getElementById('jumpInput');
  const jumpBtn=document.getElementById('jumpBtn');
  const toastStack=document.getElementById('toastStack');
  const customerInput=document.getElementById('customerInput');

  /* 工具 */
  const TX_TYPE_MAP={recharge:'充值',deduct:'扣款',withdraw:'提现',adjust:'调整'};
  function escapeHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  /* 客户数据 */
  const accounts=[
    {id:1,subjectName:'深圳ABC贸易有限公司'},
    {id:2,subjectName:'杭州XYZ物流'},
    {id:3,subjectName:'上海DEF电商'},
    {id:4,subjectName:'广州GHI供应链'},
    {id:5,subjectName:'北京JKL科技'}
  ];

  /* 流水数据（每行对应一个费用项） */
  const transactions=[
    {id:1,txNo:'TX-20260501-001',accountId:1,txType:'recharge',amount:50000,balanceAfter:50000,relatedFeeNo:'',feeItem:'初始充值',createdAt:'2026-05-01 10:00'},
    {id:2,txNo:'TX-20260502-003',accountId:2,txType:'recharge',amount:30000,balanceAfter:30000,relatedFeeNo:'',feeItem:'初始充值',createdAt:'2026-05-02 09:00'},
    {id:3,txNo:'TX-20260503-006',accountId:3,txType:'recharge',amount:20000,balanceAfter:20000,relatedFeeNo:'',feeItem:'初始充值',createdAt:'2026-05-03 08:30'},
    {id:4,txNo:'TX-20260505-004',accountId:1,txType:'recharge',amount:20000,balanceAfter:70000,relatedFeeNo:'',feeItem:'追加充值',createdAt:'2026-05-05 11:00'},
    {id:5,txNo:'TX-20260506-007',accountId:3,txType:'deduct',amount:9500,relatedFeeNo:'FS-20260506-003',feeItem:'干线海运费',createdAt:'2026-05-06 14:00'},
    {id:6,txNo:'TX-20260506-007',accountId:3,txType:'deduct',amount:4500,relatedFeeNo:'FS-20260506-003',feeItem:'标准仓储费',createdAt:'2026-05-06 14:00'},
    {id:7,txNo:'TX-20260506-007',accountId:3,txType:'deduct',amount:2800,balanceAfter:3200,relatedFeeNo:'FS-20260506-003',feeItem:'入库操作费',createdAt:'2026-05-06 14:00'},
    {id:8,txNo:'TX-20260508-005',accountId:1,txType:'adjust',amount:27810,balanceAfter:42190,relatedFeeNo:'',feeItem:'系统调整',createdAt:'2026-05-08 16:00'},
    {id:9,txNo:'TX-20260509-008',accountId:1,txType:'adjust',amount:33000,balanceAfter:9190,relatedFeeNo:'',feeItem:'系统调整',createdAt:'2026-05-09 10:00'},
    {id:10,txNo:'TX-20260510-002',accountId:1,txType:'deduct',amount:150,relatedFeeNo:'FS-20260510-001',feeItem:'卸货费',createdAt:'2026-05-10 14:30'},
    {id:11,txNo:'TX-20260510-002',accountId:1,txType:'deduct',amount:120,relatedFeeNo:'FS-20260510-001',feeItem:'清点费',createdAt:'2026-05-10 14:30'},
    {id:12,txNo:'TX-20260510-002',accountId:1,txType:'deduct',amount:110,balanceAfter:8930,relatedFeeNo:'FS-20260510-001',feeItem:'上架费',createdAt:'2026-05-10 14:30'},
    {id:13,txNo:'TX-20260511-009',accountId:4,txType:'recharge',amount:10000,balanceAfter:10000,relatedFeeNo:'',feeItem:'初始充值',createdAt:'2026-05-11 09:00'},
    {id:14,txNo:'TX-20260512-010',accountId:2,txType:'deduct',amount:8500,relatedFeeNo:'FS-20260512-002',feeItem:'空运费',createdAt:'2026-05-12 11:30'},
    {id:15,txNo:'TX-20260512-010',accountId:2,txType:'deduct',amount:4200,relatedFeeNo:'FS-20260512-002',feeItem:'仓储费',createdAt:'2026-05-12 11:30'},
    {id:16,txNo:'TX-20260512-010',accountId:2,txType:'deduct',amount:2300,balanceAfter:15000,relatedFeeNo:'FS-20260512-002',feeItem:'出库操作费',createdAt:'2026-05-12 11:30'},
    {id:17,txNo:'TX-20260513-011',accountId:5,txType:'recharge',amount:5000,balanceAfter:5000,relatedFeeNo:'',feeItem:'初始充值',createdAt:'2026-05-13 10:00'},
    {id:18,txNo:'TX-20260514-012',accountId:1,txType:'deduct',amount:280,relatedFeeNo:'FS-20260514-004',feeItem:'贴标服务费',createdAt:'2026-05-14 15:00'},
    {id:19,txNo:'TX-20260514-012',accountId:1,txType:'deduct',amount:240,balanceAfter:8410,relatedFeeNo:'FS-20260514-004',feeItem:'打包服务费',createdAt:'2026-05-14 15:00'},
    {id:20,txNo:'TX-20260515-013',accountId:4,txType:'deduct',amount:2100,relatedFeeNo:'FS-20260515-005',feeItem:'铁路运输费',createdAt:'2026-05-15 09:30'},
    {id:21,txNo:'TX-20260515-013',accountId:4,txType:'deduct',amount:1100,balanceAfter:6800,relatedFeeNo:'FS-20260515-005',feeItem:'仓储费',createdAt:'2026-05-15 09:30'},
    {id:22,txNo:'TX-20260516-014',accountId:3,txType:'recharge',amount:15000,balanceAfter:18200,relatedFeeNo:'',feeItem:'追加充值',createdAt:'2026-05-16 10:00'}
  ];

  /* 状态 */
  const state={currentPage:1,pageSize:10};

  /* Toast */
  function showToast(type,title,desc){
    const el=document.createElement('div');
    el.className='toast '+type;
    el.innerHTML='<div class="toast-title">'+escapeHtml(title)+'</div>'+(desc?'<div class="toast-desc">'+escapeHtml(desc)+'</div>':'');
    toastStack.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),240);},2200);
  }

  /* ── 筛选与分页 ── */
  function getFilteredRows(){
    const txType=txTypeSelect.value;
    const kw=(customerInput.value||'').trim().toLowerCase();
    return transactions.filter(t=>{
      if(kw){
        const acc=accounts.find(a=>a.id===t.accountId);
        if(!acc||!acc.subjectName.toLowerCase().includes(kw))return false;
      }
      if(txType&&t.txType!==txType)return false;
      return true;
    });
  }

  function buildPageList(totalPages,currentPage){
    if(totalPages<=7)return Array.from({length:totalPages},(_,i)=>i+1);
    if(currentPage<=4)return[1,2,3,4,5,'...',totalPages];
    if(currentPage>=totalPages-3)return[1,'...',totalPages-4,totalPages-3,totalPages-2,totalPages-1,totalPages];
    return[1,'...',currentPage-1,currentPage,currentPage+1,'...',totalPages];
  }

  function renderTable(){
    const filtered=getFilteredRows();
    const total=filtered.length;
    const totalPages=Math.max(1,Math.ceil(total/state.pageSize));
    if(state.currentPage>totalPages)state.currentPage=totalPages;
    const start=(state.currentPage-1)*state.pageSize;
    const current=filtered.slice(start,start+state.pageSize);

    if(!current.length){
      transactionBody.innerHTML='<tr class="empty-row"><td colspan="8">暂无资金流水</td></tr>';
    }else{
      transactionBody.innerHTML=current.map(t=>{
        const acc=accounts.find(a=>a.id===t.accountId);
        const name=acc?acc.subjectName:'—';
        const typeCls='type-'+t.txType;
        const isAdd=t.txType==='recharge';
        const amtCls=isAdd?'amount-positive':'amount-negative';
        const sign=isAdd?'+':'-';
        const feeLink=t.relatedFeeNo?('<a class="name-link" href="./fee-sheet-list.html">'+escapeHtml(t.relatedFeeNo)+'</a>'):'—';
        const bal=t.balanceAfter!=null?'¥'+t.balanceAfter.toLocaleString():'—';
        return '<tr><td>'+escapeHtml(t.txNo)+'</td><td><span class="type-tag '+typeCls+'">'+TX_TYPE_MAP[t.txType]+'</span></td><td>'+escapeHtml(name)+'</td><td>'+feeLink+'</td><td>'+escapeHtml(t.feeItem)+'</td><td class="'+amtCls+'">'+sign+'¥'+t.amount.toLocaleString()+'</td><td>'+bal+'</td><td>'+escapeHtml(t.createdAt)+'</td></tr>';
      }).join('');
    }

    totalCountText.textContent='共'+total+'条记录';
    jumpInput.value=String(state.currentPage);
    renderPagination(totalPages);
  }

  function renderPagination(totalPages){
    const prevDisabled=state.currentPage===1;
    const nextDisabled=state.currentPage===totalPages;
    const pages=buildPageList(totalPages,state.currentPage);
    const btns=[];
    btns.push('<button class="page-btn '+(prevDisabled?'disabled':'')+'" type="button" data-page="prev">&lt;</button>');
    pages.forEach(p=>{
      if(p==='...'){btns.push('<span class="page-ellipsis">...</span>');return;}
      btns.push('<button class="page-btn '+(p===state.currentPage?'active':'')+'" type="button" data-page="'+p+'">'+p+'</button>');
    });
    btns.push('<button class="page-btn '+(nextDisabled?'disabled':'')+'" type="button" data-page="next">&gt;</button>');
    pageBtnGroup.innerHTML=btns.join('');
  }

  /* ── 事件 ── */
  queryBtn.addEventListener('click',()=>{state.currentPage=1;renderTable();});
  resetBtn.addEventListener('click',()=>{
    customerInput.value='';
    txTypeSelect.value='';
    state.currentPage=1;
    state.pageSize=10;
    pageSizeSelect.value='10';
    renderTable();
    showToast('success','已重置','查询条件已恢复默认值。');
  });

  pageBtnGroup.addEventListener('click',e=>{
    const btn=e.target.closest('.page-btn');
    if(!btn||btn.classList.contains('disabled'))return;
    const filtered=getFilteredRows();
    const totalPages=Math.max(1,Math.ceil(filtered.length/state.pageSize));
    const p=btn.dataset.page;
    if(p==='prev')state.currentPage=Math.max(1,state.currentPage-1);
    else if(p==='next')state.currentPage=Math.min(totalPages,state.currentPage+1);
    else state.currentPage=Number(p);
    renderTable();
  });

  pageSizeSelect.addEventListener('change',()=>{state.pageSize=Number(pageSizeSelect.value);state.currentPage=1;renderTable();});

  jumpBtn.addEventListener('click',()=>{
    const filtered=getFilteredRows();
    const totalPages=Math.max(1,Math.ceil(filtered.length/state.pageSize));
    const t=Number(jumpInput.value.trim());
    if(!t||t<1||t>totalPages){showToast('error','页码无效','请输入1-'+totalPages+'之间的页码。');jumpInput.value=String(state.currentPage);return;}
    state.currentPage=t;renderTable();
  });

  jumpInput.addEventListener('input',()=>{jumpInput.value=jumpInput.value.replace(/\D/g,'');});

  /* 初始化 */
  renderTable();
})();
