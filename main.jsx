import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './styles.css';

const money = n => new Intl.NumberFormat('vi-VN', {style:'currency', currency:'VND', maximumFractionDigits:0}).format(n || 0);

function WalletMark(){return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 8V6.8A2.8 2.8 0 0 0 17.2 4H5.8A2.8 2.8 0 0 0 3 6.8v10.4A2.8 2.8 0 0 0 5.8 20h11.4a2.8 2.8 0 0 0 2.8-2.8V16"/><path d="M3.3 7.5H19a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-4.2a3 3 0 0 1 0-6H21"/><path d="M15.5 13.5h.01" strokeWidth="2.8"/></svg>}
const today = () => new Date().toISOString().slice(0,10);
const monthKey = d => (d || today()).slice(0,7);
const seed = {
  balance: 3250000,
  transactions: [
    {id:1,type:'income',name:'Tiền sinh hoạt từ gia đình',category:'Trợ cấp',amount:4500000,date:today(),note:'Khoản đầu tháng'},
    {id:2,type:'expense',name:'Tiền thuê trọ',category:'Nhà ở',amount:1500000,date:today(),note:''},
    {id:3,type:'expense',name:'Đi chợ và ăn uống',category:'Ăn uống',amount:280000,date:today(),note:''},
    {id:4,type:'expense',name:'Vở và bút',category:'Học tập',amount:75000,date:today(),note:''},
    {id:5,type:'expense',name:'Cà phê cùng bạn',category:'Giải trí',amount:65000,date:today(),note:''},
    {id:6,type:'income',name:'Làm thêm',category:'Lương',amount:670000,date:today(),note:'Ca cuối tuần'}
  ],
  bills: [
    {id:1,name:'Tiền thuê trọ',amount:1500000,due:5,category:'Nhà ở',paid:false},
    {id:2,name:'Tiền điện, nước',amount:250000,due:10,category:'Hóa đơn',paid:false},
    {id:3,name:'Gói Internet',amount:100000,due:12,category:'Hóa đơn',paid:true},
    {id:4,name:'Học phí / khoản học tập',amount:500000,due:20,category:'Học tập',paid:false}
  ]
};
function App(){
  const [data,setData] = useState(()=>{try{return JSON.parse(localStorage.getItem('ngan-kho-data')) || seed}catch{return seed}});
  const [user,setUser] = useState(()=>localStorage.getItem('ngan-kho-user')||'');
  const [tab,setTab] = useState('overview');
  const [showTx,setShowTx] = useState(false);
  const [editingTx,setEditingTx] = useState(null);
  const [showBill,setShowBill] = useState(false);
  const [showProfile,setShowProfile] = useState(false);
  const [accountProfile,setAccountProfile] = useState(()=>{try{return JSON.parse(localStorage.getItem('ngan-kho-account')||'null')}catch{return null}});
  const [filter,setFilter] = useState('all');
  const [month,setMonth] = useState(monthKey(today()));
  const [txForm,setTxForm] = useState({type:'expense',name:'',category:'Ăn uống',amount:'',date:today(),note:''});
  const [billForm,setBillForm] = useState({name:'',amount:'',due:'5',category:'Nhà ở'});
  const [toast,setToast] = useState('');
  useEffect(()=>{localStorage.setItem('ngan-kho-data',JSON.stringify(data))},[data]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)},[toast]);
  const txs = useMemo(()=>data.transactions.filter(t=>monthKey(t.date)===month).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id),[data.transactions,month]);
  const expenses = txs.filter(t=>t.type==='expense'), incomes=txs.filter(t=>t.type==='income');
  const totalOut=expenses.reduce((s,t)=>s+t.amount,0), totalIn=incomes.reduce((s,t)=>s+t.amount,0);
  const categoryData = Object.entries(expenses.reduce((o,t)=>(o[t.category]=(o[t.category]||0)+t.amount,o),{})).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  const priceBuckets = [{name:'Dưới 50k',min:0,max:50000},{name:'50k–100k',min:50000,max:100000},{name:'100k–300k',min:100000,max:300000},{name:'300k–1tr',min:300000,max:1000000},{name:'Trên 1tr',min:1000000,max:Infinity}].map(b=>({...b,count:expenses.filter(t=>t.amount>=b.min&&t.amount<b.max).length}));
  const largest = expenses.length ? expenses.reduce((a,b)=>a.amount>b.amount?a:b) : null;
  const smallest = expenses.length ? expenses.reduce((a,b)=>a.amount<b.amount?a:b) : null;
  const unpaid = data.bills.filter(b=>!b.paid).sort((a,b)=>Number(a.due)-Number(b.due));
  const paid = data.bills.filter(b=>b.paid);
  const updateData = patch => setData(d=>({...d,...patch}));
  function openProfile(){try{setAccountProfile(JSON.parse(localStorage.getItem('ngan-kho-account')||'null'))}catch{setAccountProfile(null)}setShowProfile(true)}
  function saveAvatar(file){
    if(!file)return;
    if(!file.type.startsWith('image/')){setToast('Vui lòng chọn một tệp hình ảnh.');return}
    if(file.size>2*1024*1024){setToast('Ảnh đại diện cần nhỏ hơn 2 MB.');return}
    const reader=new FileReader();
    reader.onload=()=>{try{const account=JSON.parse(localStorage.getItem('ngan-kho-account')||'{}');const next={...account,avatar:reader.result};localStorage.setItem('ngan-kho-account',JSON.stringify(next));setAccountProfile(next);setToast('Đã cập nhật ảnh đại diện.')}catch{setToast('Không thể lưu ảnh. Hãy thử ảnh nhỏ hơn.')}};
    reader.onerror=()=>setToast('Không thể đọc ảnh này.');reader.readAsDataURL(file);
  }
  function removeAvatar(){try{const account=JSON.parse(localStorage.getItem('ngan-kho-account')||'{}');delete account.avatar;localStorage.setItem('ngan-kho-account',JSON.stringify(account));setAccountProfile(account);setToast('Đã xóa ảnh đại diện.')}catch{setToast('Không thể cập nhật ảnh đại diện.')}}
  function deleteAccount(){
    const confirmed=confirm('Bạn có chắc muốn xóa tài khoản Ngân Khố? Tên tài khoản, avatar và toàn bộ dữ liệu thu chi/khoản cố định trên trình duyệt này sẽ bị xóa. Thao tác này không thể hoàn tác.');
    if(!confirmed)return;
    const emptyData={balance:0,transactions:[],bills:[]};
    localStorage.removeItem('ngan-kho-account');
    localStorage.removeItem('ngan-kho-user');
    localStorage.setItem('ngan-kho-data',JSON.stringify(emptyData));
    setData(emptyData);setAccountProfile(null);setShowProfile(false);setUser('');setToast('Tài khoản đã được xóa.');
  }
  function saveTx(e){
    e.preventDefault(); const amount=Number(txForm.amount);
    if(!txForm.name.trim()||!Number.isFinite(amount)||amount<=0){setToast('Nhập tên giao dịch và số tiền hợp lệ nhé.');return}
    const tx={...txForm,id:editingTx?editingTx.id:Date.now(),amount,name:txForm.name.trim()};
    if(editingTx){
      const oldSigned=editingTx.type==='income'?editingTx.amount:-editingTx.amount;
      const newSigned=tx.type==='income'?tx.amount:-tx.amount;
      setData(d=>({...d,balance:d.balance-oldSigned+newSigned,transactions:d.transactions.map(item=>item.id===editingTx.id?tx:item)}));
      setToast('Đã cập nhật giao dịch và số dư.');
    }else{
      setData(d=>({...d,balance:d.balance+(tx.type==='income'?amount:-amount),transactions:[tx,...d.transactions]}));
      setToast('Đã lưu giao dịch vào Ngân Khố.');
    }
    setTxForm({type:'expense',name:'',category:'Ăn uống',amount:'',date:today(),note:''});setEditingTx(null);setShowTx(false);
  }
  function openEditTx(tx){setEditingTx(tx);setTxForm({type:tx.type,name:tx.name,category:tx.category,amount:String(tx.amount),date:tx.date||today(),note:tx.note||''});setShowTx(true)}
  function deleteTx(tx){
    if(!confirm('Xóa giao dịch này? Số dư sẽ được cập nhật lại.'))return;
    setData(d=>({...d,balance:d.balance-(tx.type==='income'?tx.amount:-tx.amount),transactions:d.transactions.filter(t=>t.id!==tx.id)}));setToast('Đã xóa giao dịch.');
  }
  function addBill(e){e.preventDefault();if(!billForm.name.trim()||Number(billForm.amount)<=0)return;updateData({bills:[...data.bills,{...billForm,id:Date.now(),amount:Number(billForm.amount),due:Number(billForm.due),paid:false}]});setBillForm({name:'',amount:'',due:'5',category:'Nhà ở'});setShowBill(false);setToast('Đã thêm khoản chi cố định.')}
  function toggleBill(id){updateData({bills:data.bills.map(b=>b.id===id?{...b,paid:!b.paid}:b)});setToast('Đã cập nhật trạng thái thanh toán.')}
  const nav=[['overview','▦','Tổng quan'],['history','↕','Lịch sử dòng tiền'],['analytics','▥','Phân tích'],['bills','◷','Khoản cố định']];
  if(!user) return <Login onLogin={name=>{localStorage.setItem('ngan-kho-user',name);setUser(name)}}/>;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><WalletMark /></div><div><b>Ngân Khố</b><small>STUDENT FINANCE</small></div></div>
      <div className="side-label">MENU CHÍNH</div>
      <nav>{nav.map(([id,icon,label])=><button key={id} className={'nav-item '+(tab===id?'active':'')} onClick={()=>setTab(id)}><span className="nav-icon">{icon}</span>{label}{id==='bills'&&unpaid.length>0&&<span className="nav-count">{unpaid.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="tip-icon">✦</div><b>Mẹo nhỏ mỗi ngày</b><p>Đừng để ví tiền trở thành một bí ẩn vào cuối tháng.</p><span className="tip-tag">CHI TIÊU CÓ KẾ HOẠCH</span></div>
      <div className="profile"><button className="avatar avatar-trigger" title="Xem thông tin người dùng" onClick={openProfile}><UserAvatar user={user} avatar={accountProfile?.avatar}/></button><button className="profile-name-button" onClick={openProfile}><b>{user}</b><small>Tài khoản cá nhân</small></button><button className="dots profile-menu-button" title="Thông tin tài khoản" onClick={openProfile}>•••</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><WalletMark /></span><b>Ngân Khố</b></div><div className="crumb">Không gian của bạn <span>/</span> <b>{nav.find(n=>n[0]===tab)?.[2]}</b></div><div className="top-actions"><span className="today-label">✦ &nbsp;Tài chính cá nhân</span><button className="avatar small-avatar avatar-trigger" title="Thông tin người dùng" onClick={openProfile}><UserAvatar user={user} avatar={accountProfile?.avatar}/></button></div></header>
      <div className="page">
        <div className="welcome-row"><div><div className="eyebrow">THỨC TỈNH DÒNG TIỀN ✨</div><h1>{tab==='overview'?'Chào bạn, hôm nay thế nào?':nav.find(n=>n[0]===tab)?.[2]}</h1><p className="subheading">{tab==='overview'?'Một chút theo dõi hôm nay, một tháng nhẹ đầu hơn.':'Mọi khoản thu chi, rõ ràng trong tầm mắt.'}</p></div><button className="primary-btn" onClick={()=>setShowTx(true)}><span>＋</span> Thêm giao dịch</button></div>
        {tab==='overview'&&<>
          <section className="hero-balance">
            <div className="balance-content"><div className="balance-label"><span className="wallet-icon">▣</span> SỐ DƯ NGÂN KHỐ HIỆN TẠI <span className="live-dot"></span></div><div className="balance-number">{money(data.balance)}</div><div className="balance-foot"><span className="balance-pill">● Đang theo dõi</span><span>Tiền của bạn, kế hoạch của bạn.</span></div></div>
            <div className="hero-art" aria-hidden="true"><div className="orb orb1"></div><div className="orb orb2"></div><div className="coin coin1">₫</div><div className="coin coin2">✦</div><div className="wallet-art"><div className="wallet-flap"></div><div className="wallet-card">₫</div></div><div className="spark s1">✦</div><div className="spark s2">✧</div></div>
            <div className="hero-bottom"><span>✧ &nbsp;Quản lý tốt hôm nay, tự do hơn ngày mai.</span><span className="hero-month">{month}</span></div>
          </section>
          <section className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span className="stat-icon green">↙</span><span className="stat-caption">TỔNG THU TRONG THÁNG</span><span className="stat-more">•••</span></div><div className="stat-value">{money(totalIn)}</div><div className="stat-foot"><span className="positive">↗ Tiền vào</span><span>· {incomes.length} giao dịch</span></div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-icon coral">↗</span><span className="stat-caption">TỔNG CHI TRONG THÁNG</span><span className="stat-more">•••</span></div><div className="stat-value">{money(totalOut)}</div><div className="stat-foot"><span className="negative">↗ Tiền ra</span><span>· {expenses.length} giao dịch</span></div></div>
            <div className="stat-card"><div className="stat-top"><span className="stat-icon violet">◷</span><span className="stat-caption">KHOẢN CẦN THANH TOÁN</span><span className="stat-more">•••</span></div><div className="stat-value">{unpaid.length}<small> khoản</small></div><div className="stat-foot"><span className="due-text">● Đừng quên nhé</span><span>· {money(unpaid.reduce((s,b)=>s+b.amount,0))}</span></div></div>
          </section>
          <section className="content-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h2>Dòng tiền tháng này</h2><p>Nhìn lại tiền vào và tiền ra của bạn</p></div><input className="month-input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></div><div className="chart-legend"><span><i className="legend-dot income-dot"></i>Tiền vào</span><span><i className="legend-dot expense-dot"></i>Tiền ra</span></div><div className="flow-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{name:'Thu nhập',thu:totalIn,chi:0},{name:'Chi tiêu',thu:0,chi:totalOut}]} barGap={12}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf0f5"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8790a4',fontSize:12}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#8790a4',fontSize:11}} tickFormatter={v=>v>=1000000?(v/1000000)+'tr':v>=1000?(v/1000)+'k':v}/><Tooltip formatter={v=>money(v)}/><Bar dataKey="thu" name="Tiền vào" fill="#24b887" radius={[7,7,0,0]} maxBarSize={55}/><Bar dataKey="chi" name="Tiền ra" fill="#ff8d79" radius={[7,7,0,0]} maxBarSize={55}/></BarChart></ResponsiveContainer></div><div className="chart-summary"><span><i className="legend-dot income-dot"></i> Thu ròng</span><b className={totalIn-totalOut>=0?'positive':'negative'}>{money(totalIn-totalOut)}</b></div></div>
          <div className="panel bills-panel"><div className="panel-heading"><div><h2>Việc cần nhớ <span className="tiny-star">✦</span></h2><p>Các khoản cố định hàng tháng</p></div><button className="text-btn" onClick={()=>setTab('bills')}>Xem tất cả ↗</button></div><div className="bill-preview">{[...unpaid.slice(0,3),...paid.slice(0,Math.max(0,3-unpaid.slice(0,3).length))].map(b=><div className={'bill-row '+(b.paid?'is-paid':'')} key={b.id}><button className={'check-circle '+(b.paid?'checked':'')} onClick={()=>toggleBill(b.id)}>{b.paid?'✓':''}</button><div className="bill-info"><b>{b.name}</b><small>Hạn ngày {b.due} hàng tháng</small></div><div className="bill-amount">{money(b.amount)}<small>{b.paid?'Đã thanh toán':'Chưa thanh toán'}</small></div></div>)}</div><button className="add-bill-link" onClick={()=>setShowBill(true)}>＋ Thêm khoản cố định</button></div></section>
          <section className="panel transactions-panel"><div className="panel-heading"><div><h2>Giao dịch gần đây</h2><p>Những chuyển động mới nhất của Ngân Khố</p></div><button className="text-btn" onClick={()=>setTab('history')}>Xem lịch sử ↗</button></div><Transactions txs={txs.slice(0,5)} onDelete={deleteTx} onEdit={openEditTx}/></section>
        </>}
        {tab==='history'&&<><section className="stats-grid compact-stats"><div className="stat-card"><div className="stat-caption">TỔNG THU · {month}</div><div className="stat-value">{money(totalIn)}</div></div><div className="stat-card"><div className="stat-caption">TỔNG CHI · {month}</div><div className="stat-value">{money(totalOut)}</div></div><div className="stat-card"><div className="stat-caption">CHÊNH LỆCH</div><div className={'stat-value '+(totalIn-totalOut>=0?'positive':'negative')}>{money(totalIn-totalOut)}</div></div></section><section className="panel transactions-panel"><div className="panel-heading"><div><h2>Lịch sử dòng tiền</h2><p>Chỉ hiển thị giao dịch của tháng đã chọn</p></div><div className="filter-row"><input className="month-input" type="month" value={month} onChange={e=>setMonth(e.target.value)}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tất cả giao dịch</option><option value="income">Tiền vào</option><option value="expense">Tiền ra</option></select></div></div><Transactions txs={txs.filter(t=>filter==='all'||t.type===filter)} onDelete={deleteTx} onEdit={openEditTx} empty="Chưa có giao dịch nào trong tháng này."/></section></>}
        {tab==='analytics'&&<><section className="stats-grid"><div className="stat-card"><div className="stat-caption">SỐ GIAO DỊCH CHI</div><div className="stat-value">{expenses.length}</div><div className="stat-foot">Trong tháng đã chọn</div></div><div className="stat-card"><div className="stat-caption">MÓN CHI CAO NHẤT</div><div className="stat-value">{largest?money(largest.amount):'Chưa có'}</div><div className="stat-foot">{largest?.name||'Thêm giao dịch để xem'}</div></div><div className="stat-card"><div className="stat-caption">MÓN CHI THẤP NHẤT</div><div className="stat-value">{smallest?money(smallest.amount):'Chưa có'}</div><div className="stat-foot">{smallest?.name||'Thêm giao dịch để xem'}</div></div></section><section className="content-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h2>Chi tiêu theo danh mục</h2><p>Danh mục nào đang lấy nhiều tiền nhất?</p></div></div>{categoryData.length?<div className="donut-layout"><div className="donut-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>{categoryData.map((d,i)=><Cell key={d.name} fill={['#23b887','#ff927f','#8d83ef','#f3bd59','#62a7ef','#d78acb'][i%6]}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer></div><div className="category-legend">{categoryData.map((c,i)=><div key={c.name}><span><i style={{background:['#23b887','#ff927f','#8d83ef','#f3bd59','#62a7ef','#d78acb'][i%6]}}></i>{c.name}</span><b>{money(c.value)}</b></div>)}</div></div>:<Empty text="Chưa có khoản chi để phân tích."/>}</div><div className="panel chart-panel"><div className="panel-heading"><div><h2>Khoảng giá thường mua</h2><p>Số giao dịch chi theo từng tầm giá</p></div></div><div className="price-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={priceBuckets} margin={{top:10,right:0,left:-20,bottom:4}}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf0f5"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8790a4',fontSize:10}}/><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill:'#8790a4',fontSize:11}}/><Tooltip formatter={v=>[v+' giao dịch','Số món']}/><Bar dataKey="count" name="Số món" fill="#8178ed" radius={[6,6,0,0]} maxBarSize={35}/></BarChart></ResponsiveContainer></div><div className="most-bought">✦ Khoảng giá phổ biến nhất: <b>{priceBuckets.reduce((a,b)=>a.count>b.count?a:b).count?priceBuckets.reduce((a,b)=>a.count>b.count?a:b).name:'Chưa đủ dữ liệu'}</b></div></div></section><section className="panel transactions-panel"><div className="panel-heading"><div><h2>Chi tiêu đáng chú ý</h2><p>Các khoản chi trong tháng {month}</p></div></div><Transactions txs={[...expenses].sort((a,b)=>b.amount-a.amount).slice(0,5)} onDelete={deleteTx} onEdit={openEditTx} empty="Chưa có dữ liệu."/></section></>}
        {tab==='bills'&&<section className="panel bills-full"><div className="panel-heading"><div><h2>Lịch thanh toán định kỳ</h2><p>Đánh dấu khoản đã trả, khoản đó sẽ tự chuyển xuống cuối danh sách.</p></div><button className="primary-btn" onClick={()=>setShowBill(true)}>＋ Thêm khoản</button></div><div className="bill-progress"><div><span>Đã thanh toán tháng này</span><b>{paid.length}/{data.bills.length} khoản</b></div><div className="progress-track"><div style={{width:(data.bills.length?paid.length/data.bills.length*100:0)+'%'}}/></div></div><div className="bill-section-label">CẦN THANH TOÁN <span>{unpaid.length}</span></div>{unpaid.length?unpaid.map(b=><BillRow key={b.id} bill={b} toggle={toggleBill}/>):<div className="all-done">✦ Tuyệt vời! Bạn đã thanh toán hết các khoản cố định.</div>}<div className="bill-section-label paid-label">ĐÃ THANH TOÁN <span>{paid.length}</span></div>{paid.length?paid.map(b=><BillRow key={b.id} bill={b} toggle={toggleBill}/>):<div className="empty-inline">Chưa có khoản nào được đánh dấu đã thanh toán.</div>}</section>}
        <footer className="footer"><span>© 2026 Ngân Khố</span><span>Được tạo cho những chiếc ví sinh viên 🪴</span><button onClick={()=>{if(confirm('Khôi phục dữ liệu mẫu? Dữ liệu hiện tại sẽ bị thay thế.')){setData(seed);setToast('Đã khôi phục dữ liệu mẫu.')}}}>Khôi phục dữ liệu mẫu</button><button onClick={()=>{localStorage.removeItem('ngan-kho-user');setUser('')}}>Đăng xuất</button></footer>
      </div>
    </main>
    {showTx&&<Modal title={editingTx?'Chỉnh sửa giao dịch':'Thêm giao dịch mới'} subtitle={editingTx?'Sửa thông tin khoản thu/chi đã nhập. Số dư sẽ tự động được tính lại.':'Mỗi khoản thu chi đều đáng được ghi lại.'} close={()=>{setShowTx(false);setEditingTx(null)}}><form onSubmit={saveTx} className="form-stack"><div className="type-switch"><button type="button" className={txForm.type==='expense'?'selected expense-selected':''} onClick={()=>setTxForm({...txForm,type:'expense'})}>↗ Khoản chi</button><button type="button" className={txForm.type==='income'?'selected income-selected':''} onClick={()=>setTxForm({...txForm,type:'income'})}>↙ Khoản thu</button></div><label>Tên giao dịch<input required placeholder="VD: Ăn trưa, nhận lương..." value={txForm.name} onChange={e=>setTxForm({...txForm,name:e.target.value})}/></label><div className="form-two"><label>Số tiền (VNĐ)<input required type="number" min="1" placeholder="100000" value={txForm.amount} onChange={e=>setTxForm({...txForm,amount:e.target.value})}/></label><label>Ngày giao dịch<input required type="date" value={txForm.date} onChange={e=>setTxForm({...txForm,date:e.target.value})}/></label></div><label>Danh mục<select value={txForm.category} onChange={e=>setTxForm({...txForm,category:e.target.value})}>{(txForm.type==='expense'?['Ăn uống','Nhà ở','Di chuyển','Học tập','Hóa đơn','Sức khỏe','Giải trí','Mua sắm','Khác']:['Trợ cấp','Lương','Học bổng','Thưởng','Bán đồ','Khác']).map(c=><option key={c}>{c}</option>)}</select></label><label>Ghi chú (không bắt buộc)<textarea rows="2" placeholder="Thêm vài dòng nếu cần..." value={txForm.note} onChange={e=>setTxForm({...txForm,note:e.target.value})}/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>{setShowTx(false);setEditingTx(null)}}>Hủy</button><button className="primary-btn" type="submit">{editingTx?'Lưu thay đổi':'Lưu giao dịch'}</button></div></form></Modal>}
    {showProfile&&<Modal title="Thông tin người dùng" subtitle="Quản lý hồ sơ cá nhân của bạn trên Ngân Khố." close={()=>setShowProfile(false)}>
      <div className="profile-modal-content"><div className="profile-avatar-large"><UserAvatar user={user} avatar={accountProfile?.avatar}/></div><div className="profile-avatar-actions"><label className="primary-btn avatar-upload-label">Đổi avatar<input type="file" accept="image/*" onChange={e=>{saveAvatar(e.target.files?.[0]);e.target.value=''}}/></label>{accountProfile?.avatar&&<button type="button" className="secondary-btn" onClick={removeAvatar}>Xóa ảnh</button>}<small>PNG, JPG hoặc ảnh khác · tối đa 2 MB</small></div></div>
      <div className="profile-details"><div><span>Tên người dùng</span><b>{accountProfile?.name||user}</b></div><div><span>Email đăng ký</span><b>{accountProfile?.email||'Chưa thêm email'}</b></div><div><span>Trạng thái tài khoản</span><b className="profile-status"><i/> Đang hoạt động trên trình duyệt này</b></div></div><div className="profile-danger-zone"><b>Xóa tài khoản</b><p>Xóa tài khoản và dữ liệu thu chi đã lưu trên trình duyệt này. Thao tác không thể hoàn tác.</p><button type="button" className="danger-btn" onClick={deleteAccount}>Xóa tài khoản</button></div><div className="modal-actions"><button type="button" className="primary-btn" onClick={()=>setShowProfile(false)}>Xong</button></div>
    </Modal>}
    {showBill&&<Modal title="Thêm khoản cố định" subtitle="Đặt lịch cho khoản chi cần nhớ mỗi tháng." close={()=>setShowBill(false)}><form onSubmit={addBill} className="form-stack"><label>Tên khoản chi<input required placeholder="VD: Tiền thuê trọ" value={billForm.name} onChange={e=>setBillForm({...billForm,name:e.target.value})}/></label><div className="form-two"><label>Số tiền (VNĐ)<input required type="number" min="1" placeholder="1500000" value={billForm.amount} onChange={e=>setBillForm({...billForm,amount:e.target.value})}/></label><label>Hạn thanh toán (ngày)<select value={billForm.due} onChange={e=>setBillForm({...billForm,due:e.target.value})}>{Array.from({length:28},(_,i)=><option key={i+1} value={i+1}>Ngày {i+1}</option>)}</select></label></div><label>Danh mục<select value={billForm.category} onChange={e=>setBillForm({...billForm,category:e.target.value})}>{['Nhà ở','Hóa đơn','Học tập','Di chuyển','Sức khỏe','Khác'].map(c=><option key={c}>{c}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setShowBill(false)}>Hủy</button><button className="primary-btn" type="submit">Thêm khoản chi</button></div></form></Modal>}
    {toast&&<div className="toast">✓ &nbsp;{toast}</div>}
  </div>
}
function Login({onLogin}){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [mode,setMode]=useState('register');
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const hashPassword=async value=>{
    const bytes=new TextEncoder().encode(value);
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
  };
  const changeMode=next=>{setMode(next);setError('');setSuccess('');setPassword('');setConfirmPassword('')};
  const submit=async e=>{
    e.preventDefault();setError('');setSuccess('');
    const account=JSON.parse(localStorage.getItem('ngan-kho-account')||'null');
    if(mode==='register'){
      if(!name.trim()){setError('Vui lòng nhập tên hiển thị.');return}
      if(password.length<6){setError('Mật khẩu cần có ít nhất 6 ký tự.');return}
      if(password!==confirmPassword){setError('Mật khẩu xác nhận chưa khớp.');return}
      if(account){setError('Trình duyệt này đã có tài khoản. Hãy chuyển sang Đăng nhập.');return}
      localStorage.setItem('ngan-kho-account',JSON.stringify({name:name.trim(),email:email.trim().toLowerCase(),passwordHash:await hashPassword(password)}));
      onLogin(name.trim());
    }else if(mode==='login'){
      if(!account){setError('Chưa có tài khoản trên trình duyệt này. Hãy chọn Tạo tài khoản.');return}
      if(name.trim()!==account.name || await hashPassword(password)!==account.passwordHash){setError('Tên tài khoản hoặc mật khẩu không đúng.');return}
      onLogin(account.name);
    }else{
      if(!account){setError('Không tìm thấy tài khoản trên trình duyệt này.');return}
      if(!account.email){setError('Tài khoản chưa có email khôi phục. Bạn cần tạo lại tài khoản có email hoặc dùng thiết bị/trình duyệt đã lưu tài khoản.');return}
      if(name.trim()!==account.name || email.trim().toLowerCase()!==account.email){setError('Tên tài khoản hoặc email không khớp.');return}
      if(password.length<6){setError('Mật khẩu mới cần có ít nhất 6 ký tự.');return}
      if(password!==confirmPassword){setError('Mật khẩu xác nhận chưa khớp.');return}
      localStorage.setItem('ngan-kho-account',JSON.stringify({...account,passwordHash:await hashPassword(password)}));
      setMode('login');setPassword('');setConfirmPassword('');setSuccess('Đã đổi mật khẩu trên trình duyệt này. Hãy đăng nhập bằng mật khẩu mới.');
    }
  };
  const isRegister=mode==='register', isForgot=mode==='forgot';
  return <div className="login-screen"><div className="login-decoration decor-a"></div><div className="login-decoration decor-b"></div><div className={`login-card auth-panel-transition auth-mode-${mode}`} key={mode}><div className="login-logo"><WalletMark /></div><div className="eyebrow">TÀI CHÍNH CÁ NHÂN, DỄ THỞ HƠN</div><h1>{isRegister?<>Tạo góc nhỏ<br/>cho ví tiền.</>:isForgot?<>Lấy lại quyền<br/>truy cập.</>:<>Mừng bạn<br/>trở lại.</>}</h1><p className="login-copy">{isForgot?'Nhập tên tài khoản, email đã đăng ký và đặt mật khẩu mới.': 'Theo dõi tiền của mình đang đi đâu, và giữ lại nhiều hơn cho những điều quan trọng.'}</p>{!isForgot&&<div className="auth-switch"><button type="button" className={isRegister?'selected':''} onClick={()=>changeMode('register')}>Tạo tài khoản</button><button type="button" className={mode==='login'?'selected':''} onClick={()=>changeMode('login')}>Đăng nhập</button></div>}<form className="form-stack" onSubmit={submit}><label>Tên tài khoản<input required placeholder="Tên của bạn" value={name} onChange={e=>setName(e.target.value)}/></label>{(isRegister||isForgot)&&<label>{isForgot?'Email đã đăng ký':'Email'} {!isForgot&&<span className="optional-label">(không bắt buộc)</span>}<input type="email" required={isForgot} placeholder="ban@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>}{!isRegister&&!isForgot||isRegister||isForgot?<label>{isForgot?'Mật khẩu mới':'Mật khẩu'}<input required type="password" minLength={6} placeholder="Ít nhất 6 ký tự" value={password} onChange={e=>setPassword(e.target.value)}/></label>:null}{(isRegister||isForgot)&&<label>{isForgot?'Nhập lại mật khẩu mới':'Nhập lại mật khẩu'}<input required type="password" minLength={6} placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>}{error&&<div className="auth-error">{error}</div>}{success&&<div className="auth-success">{success}</div>}<button className="primary-btn login-submit" type="submit">{isRegister?'Tạo tài khoản':isForgot?'Đặt lại mật khẩu':'Đăng nhập'} <span>↗</span></button></form>{mode==='login'&&<button type="button" className="forgot-link" onClick={()=>changeMode('forgot')}>Quên mật khẩu?</button>}{isForgot&&<button type="button" className="forgot-link" onClick={()=>changeMode('login')}>← Quay lại đăng nhập</button>}<div className="login-note">✦ &nbsp;Bản demo lưu tài khoản trên trình duyệt này, chưa có máy chủ xác thực. Khôi phục bằng email chỉ đối chiếu thông tin đã lưu, không gửi email xác minh.</div></div><div className="login-art"><div className="login-ring ring-one"></div><div className="login-ring ring-two"></div><div className="login-coin">₫</div><div className="login-card-art"><div className="card-line"></div><div className="card-chip"></div><div className="card-circles">● ●</div></div><div className="login-floating float-one">+ 500.000đ</div><div className="login-floating float-two">− 75.000đ</div><div className="login-caption">THE LITTLE THINGS ADD UP.</div></div></div>
}
function UserAvatar({user,avatar}){return avatar?<img className="avatar-image" src={avatar} alt="Ảnh đại diện"/>:<span>{(user||'SV').trim().slice(0,2).toUpperCase()}</span>}
function Transactions({txs,onDelete,onEdit,empty='Chưa có giao dịch nào.'}){if(!txs.length)return <Empty text={empty}/>;return <div className="table-wrap"><table className="transactions-table"><thead><tr><th>GIAO DỊCH</th><th>NGÀY</th><th>DANH MỤC</th><th className="align-right">SỐ TIỀN</th><th>THAO TÁC</th></tr></thead><tbody>{txs.map(t=><tr key={t.id}><td><div className="tx-name"><span className={'tx-symbol '+(t.type==='income'?'tx-income':'tx-expense')}>{t.type==='income'?'↙':'↗'}</span><div><b>{t.name}</b>{t.note&&<small>{t.note}</small>}</div></div></td><td className="muted-cell">{new Date(t.date+'T12:00:00').toLocaleDateString('vi-VN')}</td><td><span className="category-pill">{t.category}</span></td><td className={'amount-cell '+(t.type==='income'?'positive':'negative')}>{t.type==='income'?'+':'−'}{money(t.amount)}</td><td><div className="tx-actions"><button className="edit-btn" title="Chỉnh sửa giao dịch" aria-label={'Chỉnh sửa '+t.name} onClick={()=>onEdit(t)}>Sửa</button><button className="delete-btn" title="Xóa giao dịch" onClick={()=>onDelete(t)}>×</button></div></td></tr>)}</tbody></table></div>}
function BillRow({bill,toggle}){return <div className={'bill-row bill-row-large '+(bill.paid?'is-paid':'')}><button className={'check-circle '+(bill.paid?'checked':'')} onClick={()=>toggle(bill.id)}>{bill.paid?'✓':''}</button><div className="bill-info"><b>{bill.name}</b><small>{bill.category} · Hạn ngày {bill.due} hàng tháng</small></div><div className="bill-amount">{money(bill.amount)}<small>{bill.paid?'Đã thanh toán':'Chưa thanh toán'}</small></div><span className={'status-pill '+(bill.paid?'status-paid':'status-pending')}>{bill.paid?'Hoàn tất':'Đang chờ'}</span></div>}
function Modal({title,subtitle,close,children}){useEffect(()=>{const f=e=>{if(e.key==='Escape')close()};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[close]);return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="modal-close" onClick={close}>×</button></div>{children}</div></div>}
function Empty({text}){return <div className="empty-state"><span>◌</span><b>Chưa có dữ liệu</b><p>{text}</p></div>}
createRoot(document.getElementById('root')).render(<App/>);
