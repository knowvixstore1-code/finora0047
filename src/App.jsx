import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, ChartNoAxesCombined,
  ChevronDown, CircleHelp, CreditCard, Download, Home, LogOut, Menu, Plus,
  Search, Settings, ShieldCheck, Target, Trash2, TrendingDown, TrendingUp,
  Wallet, X
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from 'recharts'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const categories = ['Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities', 'Health', 'Entertainment', 'Education', 'Salary', 'Freelance', 'Other']
const categoryColors = ['#56d6b0', '#8b9cf6', '#f7b267', '#e879a9', '#6bc5f8', '#b6a0f7', '#f2d36b', '#56d6b0', '#73d1d6', '#98a6b8']
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0))
const dateLabel = d => new Date(`${d}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const today = () => new Date().toISOString().slice(0, 10)
const demoTransactions = [
  { id: 'demo1', title: 'Monthly salary', category: 'Salary', type: 'income', amount: 65000, transaction_date: today(), payment_method: 'Bank transfer', notes: 'Sample data' },
  { id: 'demo2', title: 'Grocery shopping', category: 'Food & Dining', type: 'expense', amount: 1850, transaction_date: today(), payment_method: 'UPI', notes: 'Sample data' },
  { id: 'demo3', title: 'Metro & auto', category: 'Transport', type: 'expense', amount: 420, transaction_date: today(), payment_method: 'UPI', notes: 'Sample data' },
  { id: 'demo4', title: 'Internet bill', category: 'Bills & Utilities', type: 'expense', amount: 999, transaction_date: today(), payment_method: 'UPI', notes: 'Sample data' },
  { id: 'demo5', title: 'Freelance project', category: 'Freelance', type: 'income', amount: 8500, transaction_date: today(), payment_method: 'Bank transfer', notes: 'Sample data' },
  { id: 'demo6', title: 'Coffee with friends', category: 'Food & Dining', type: 'expense', amount: 360, transaction_date: today(), payment_method: 'Card', notes: 'Sample data' }
]
const navItems = [
  { label: 'Overview', icon: Home },
  { label: 'Transactions', icon: Activity },
  { label: 'Budgets', icon: Target },
  { label: 'Reports', icon: ChartNoAxesCombined },
  { label: 'Settings', icon: Settings }
]

function AuthPanel() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMessage('')
    try {
      const result = mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
      if (result.error) throw result.error
      setMessage(mode === 'signup' ? 'Check your email to confirm your account, then sign in.' : 'Signed in.')
    } catch (err) { setMessage(err.message || 'Could not authenticate.') }
    finally { setBusy(false) }
  }
  return <div className="auth-wrap"><div className="auth-card">
    <Brand />
    <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
    <p className="muted">Your money, in control.</p>
    <form onSubmit={submit} className="auth-form">
      <label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
      <label>Password<input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
      <button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
    </form>
    {message && <p className="notice">{message}</p>}
    <button className="link-btn" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>
      {mode === 'signin' ? 'New to Finora? Create an account' : 'Already registered? Sign in'}
    </button>
  </div></div>
}
function Brand() {
  return <div className="brand"><span className="brand-mark"><Wallet size={21} /></span><span>finora</span></div>
}
function StatCard({ label, value, hint, icon: Icon, tone = 'mint' }) {
  return <div className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
    <p className="stat-label">{label}</p><h2>{value}</h2><p className="stat-hint">{hint}</p>
  </div>
}
function TransactionModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'Food & Dining', transaction_date: today(), payment_method: 'UPI', notes: '' })
  const [busy, setBusy] = useState(false)
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }))
  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || Number(form.amount) <= 0) return
    setBusy(true)
    try { await onSave({ ...form, title: form.title.trim(), amount: Number(form.amount) }); onClose() }
    catch (err) { alert(err.message || 'Could not save transaction.') }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="modal"><div className="modal-head"><div><h2>Add transaction</h2><p className="muted">Record money in or money out.</p></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div>
      <form className="transaction-form" onSubmit={submit}>
        <div className="type-toggle"><button type="button" className={form.type === 'expense' ? 'selected expense' : ''} onClick={() => update('type','expense')}><TrendingDown size={16}/> Expense</button><button type="button" className={form.type === 'income' ? 'selected income' : ''} onClick={() => update('type','income')}><TrendingUp size={16}/> Income</button></div>
        <label>Description<input autoFocus required maxLength={100} value={form.title} onChange={e => update('title',e.target.value)} placeholder="e.g. Groceries" /></label>
        <label>Amount (₹)<input required type="number" min="0.01" step="0.01" value={form.amount} onChange={e => update('amount',e.target.value)} placeholder="0.00" /></label>
        <div className="form-grid">
          <label>Category<select value={form.category} onChange={e => update('category',e.target.value)}>{categories.filter(c => form.type === 'income' ? ['Salary','Freelance','Other'].includes(c) : !['Salary','Freelance'].includes(c)).map(c => <option key={c}>{c}</option>)}</select></label>
          <label>Date<input type="date" required value={form.transaction_date} onChange={e => update('transaction_date',e.target.value)} /></label>
        </div>
        <label>Payment method<select value={form.payment_method} onChange={e => update('payment_method',e.target.value)}>{['UPI','Cash','Debit card','Credit card','Bank transfer','Other'].map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Notes <span className="muted">(optional)</span><textarea rows="2" maxLength="500" value={form.notes} onChange={e => update('notes',e.target.value)} placeholder="Add a note…" /></label>
        <button className="btn primary full" disabled={busy}>{busy ? 'Saving…' : 'Save transaction'}</button>
      </form>
    </div>
  </div>
}
function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [transactions, setTransactions] = useState(demoTransactions)
  const [budgets, setBudgets] = useState([])
  const [goals, setGoals] = useState([])
  const [activeNav, setActiveNav] = useState('Overview')
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [month, setMonth] = useState(today().slice(0,7))
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')
  const [budgetDraft, setBudgetDraft] = useState({ category: 'Food & Dining', amount: '' })
  const [goalDraft, setGoalDraft] = useState({ name: '', target_amount: '', saved_amount: '0', target_date: '' })
  const [showGoalForm, setShowGoalForm] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthReady(true); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => subscription.unsubscribe()
  }, [])

  const loadData = useCallback(async () => {
    if (!session?.user?.id) return
    const [tx, bu, go] = await Promise.all([
      supabase.from('transactions').select('*').order('transaction_date', { ascending: false }).limit(500),
      supabase.from('budgets').select('*').order('created_at', { ascending: false }),
      supabase.from('savings_goals').select('*').order('created_at', { ascending: false })
    ])
    const error = tx.error || bu.error || go.error
    if (error) { setToast(error.message); return }
    setTransactions(tx.data || []); setBudgets(bu.data || []); setGoals(go.data || [])
  }, [session])
  useEffect(() => { loadData() }, [loadData])

  const monthTransactions = useMemo(() => transactions.filter(t => (t.transaction_date || '').slice(0,7) === month), [transactions, month])
  const income = monthTransactions.filter(t => t.type === 'income').reduce((s,t) => s + Number(t.amount), 0)
  const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((s,t) => s + Number(t.amount), 0)
  const balance = transactions.reduce((s,t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
  const filtered = useMemo(() => transactions.filter(t => {
    const matchesSearch = `${t.title} ${t.category} ${t.payment_method || ''}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (filterType === 'all' || t.type === filterType) && (activeNav !== 'Transactions' || true)
  }), [transactions, search, filterType, activeNav])
  const categoryData = useMemo(() => categories.map(c => ({ name: c, value: monthTransactions.filter(t => t.type === 'expense' && t.category === c).reduce((s,t) => s + Number(t.amount), 0) })).filter(x => x.value > 0), [monthTransactions])
  const trendData = useMemo(() => Array.from({length:6}, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5-i))
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    const list = transactions.filter(t => (t.transaction_date || '').slice(0,7) === key)
    return { month: d.toLocaleDateString('en-IN',{month:'short'}), income: list.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0), expenses: list.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0) }
  }), [transactions])
  const notify = msg => { setToast(msg); window.setTimeout(() => setToast(''), 3500) }

  async function saveTransaction(payload) {
    if (!session) {
      const row = { ...payload, id: crypto.randomUUID(), notes: payload.notes || '' }
      setTransactions(old => [row, ...old]); notify('Saved in this demo session only. Connect Supabase to save permanently.'); return
    }
    const { data, error } = await supabase.from('transactions').insert({ ...payload, user_id: session.user.id }).select().single()
    if (error) throw error
    setTransactions(old => [data, ...old]); notify('Transaction saved.')
  }
  async function deleteTransaction(id) {
    if (String(id).startsWith('demo')) { setTransactions(old => old.filter(t => t.id !== id)); return }
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) { notify(error.message); return }
    setTransactions(old => old.filter(t => t.id !== id)); notify('Transaction deleted.')
  }
  async function addBudget(e) {
    e.preventDefault()
    const amount = Number(budgetDraft.amount)
    if (amount <= 0) return
    if (!session) { setBudgets(old => [...old, { ...budgetDraft, id: crypto.randomUUID(), amount }]); setBudgetDraft({category:'Food & Dining',amount:''}); notify('Demo budget added.'); return }
    const { data, error } = await supabase.from('budgets').upsert({ user_id: session.user.id, category: budgetDraft.category, amount, month }, { onConflict: 'user_id,category,month' }).select().single()
    if (error) { notify(error.message); return }
    setBudgets(old => [...old.filter(b => !(b.category === data.category && b.month === data.month)), data]); setBudgetDraft({category:'Food & Dining',amount:''}); notify('Budget saved.')
  }
  async function addGoal(e) {
    e.preventDefault()
    const payload = { name: goalDraft.name, target_amount: Number(goalDraft.target_amount), saved_amount: Number(goalDraft.saved_amount || 0), target_date: goalDraft.target_date || null }
    if (!payload.name || payload.target_amount <= 0) return
    if (!session) { setGoals(old => [...old, {...payload,id:crypto.randomUUID()}]); setShowGoalForm(false); setGoalDraft({name:'',target_amount:'',saved_amount:'0',target_date:''}); notify('Demo goal added.'); return }
    const { data, error } = await supabase.from('savings_goals').insert({ ...payload, user_id: session.user.id }).select().single()
    if (error) { notify(error.message); return }
    setGoals(old => [data,...old]); setShowGoalForm(false); setGoalDraft({name:'',target_amount:'',saved_amount:'0',target_date:''}); notify('Savings goal saved.')
  }
  async function signOut() { await supabase.auth.signOut(); setSession(null) }
  function exportCsv() {
    const rows = [['Date','Description','Type','Category','Amount (INR)','Payment method','Notes'], ...filtered.map(t => [t.transaction_date,t.title,t.type,t.category,t.amount,t.payment_method || '',t.notes || ''])]
    const csv = rows.map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}))
    const a = document.createElement('a'); a.href = url; a.download = `finora-transactions-${today()}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  if (!authReady) return <div className="loading-screen">Opening Finora…</div>
  if (isSupabaseConfigured && !session) return <AuthPanel />

  const contentTitle = activeNav === 'Overview' ? 'Good evening' : activeNav
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="side-top"><Brand /><button className="icon-btn mobile-close" onClick={() => setMobileMenu(false)}><X size={20}/></button></div>
      <div className="workspace"><div className="avatar">F</div><div><strong>Personal space</strong><small>{session ? 'Synced account' : 'Demo workspace'}</small></div><ChevronDown size={15}/></div>
      <p className="nav-caption">WORKSPACE</p>
      <nav>{navItems.map(item => <button key={item.label} onClick={() => { setActiveNav(item.label); setMobileMenu(false) }} className={`nav-item ${activeNav === item.label ? 'active' : ''}`}><item.icon size={18}/><span>{item.label}</span>{item.label === 'Transactions' && <span className="nav-count">{transactions.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><ShieldCheck size={18}/></div><strong>Your money, your privacy</strong><p>Your data is private to your account when connected to Supabase.</p></div><button className="nav-item" onClick={() => notify('Help: add transactions, set budgets, and review reports here.')}><CircleHelp size={18}/>Help & support</button>{session && <button className="nav-item" onClick={signOut}><LogOut size={18}/>Sign out</button>}</div>
    </aside>
    {mobileMenu && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}
    <main className="main-content">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn menu-toggle" onClick={() => setMobileMenu(true)}><Menu size={20}/></button><div><p className="eyebrow">PERSONAL FINANCE</p><h1>{contentTitle}{activeNav === 'Overview' ? ', welcome back 👋' : ''}</h1></div></div><div className="top-actions"><label className="month-picker"><CalendarDays size={16}/><input aria-label="Selected month" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><button className="icon-btn notification" onClick={()=>notify('You’re all caught up.')} aria-label="Notifications"><Bell size={18}/></button><div className="profile-pill"><div className="avatar">{session?.user?.email?.[0]?.toUpperCase() || 'F'}</div><div><strong>{session?.user?.email?.split('@')[0] || 'Finora user'}</strong><small>{session ? 'Personal account' : 'Preview mode'}</small></div></div></div></header>
      {!isSupabaseConfigured && <div className="demo-banner"><span className="demo-dot"></span><div><strong>Preview mode</strong><span> Sample transactions are shown. Add your Supabase keys to save your own data permanently.</span></div></div>}
      <div className="page-body">
        {activeNav === 'Overview' && <>
          <div className="section-heading"><div><h2>Your financial snapshot</h2><p>Here’s what’s happening with your money.</p></div><button className="btn primary" onClick={()=>setShowModal(true)}><Plus size={17}/> Add transaction</button></div>
          <div className="stats-grid">
            <StatCard label="Total balance" value={money(balance)} hint="Across all loaded transactions" icon={Wallet}/>
            <StatCard label="Monthly income" value={money(income)} hint="Income this month" icon={ArrowDownLeft} tone="blue"/>
            <StatCard label="Monthly expenses" value={money(expenses)} hint="Spending this month" icon={ArrowUpRight} tone="orange"/>
            <StatCard label="Net savings" value={money(income-expenses)} hint={income ? `${Math.round((income-expenses)/income*100)}% of income retained` : 'Add income to calculate'} icon={Activity} tone="purple"/>
          </div>
          <div className="charts-grid">
            <section className="panel trend-panel"><div className="panel-head"><div><h3>Cash flow</h3><p>Income vs expenses · last 6 months</p></div><span className="mini-chip"><span className="legend-dot mint-dot"></span>Income <span className="legend-dot orange-dot"></span>Expenses</span></div>
              <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{top:10,right:6,left:-16,bottom:0}}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#56d6b0" stopOpacity={0.22}/><stop offset="95%" stopColor="#56d6b0" stopOpacity={0}/></linearGradient><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f7b267" stopOpacity={0.2}/><stop offset="95%" stopColor="#f7b267" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#263448" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="month" tick={{fill:'#8290a6',fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#8290a6',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${Math.round(v/1000)}k`:`₹${v}`}/><Tooltip contentStyle={{background:'#151f30',border:'1px solid #29374b',borderRadius:12,color:'#f4f7fb'}} formatter={v=>money(v)}/><Area type="monotone" dataKey="income" name="Income" stroke="#56d6b0" strokeWidth={2.5} fill="url(#incomeFill)"/><Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f7b267" strokeWidth={2.5} fill="url(#expenseFill)"/></AreaChart></ResponsiveContainer></div>
            </section>
            <section className="panel category-panel"><div className="panel-head"><div><h3>Spending breakdown</h3><p>Where your money goes</p></div><button className="subtle-btn" onClick={()=>setActiveNav('Reports')}>Details <ChevronDown size={14}/></button></div>
              {categoryData.length ? <><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="86%" paddingAngle={3} stroke="none">{categoryData.map((entry,i)=><Cell key={entry.name} fill={categoryColors[categories.indexOf(entry.name)%categoryColors.length]}/>)}</Pie><Tooltip contentStyle={{background:'#151f30',border:'1px solid #29374b',borderRadius:12,color:'#f4f7fb'}} formatter={v=>money(v)}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{money(expenses)}</strong><span>Total spent</span></div></div><div className="category-legend">{categoryData.slice(0,4).map(c=><div className="legend-row" key={c.name}><span className="legend-dot" style={{background:categoryColors[categories.indexOf(c.name)%categoryColors.length]}}></span><span>{c.name}</span><strong>{money(c.value)}</strong></div>)}</div></> : <EmptyState icon={ChartNoAxesCombined} title="No spending yet" text="Add an expense to see your category breakdown."/>}
            </section>
          </div>
          <div className="bottom-grid">
            <section className="panel transactions-panel"><div className="panel-head"><div><h3>Recent transactions</h3><p>Your latest money moves</p></div><button className="subtle-btn" onClick={()=>setActiveNav('Transactions')}>View all <ChevronDown size={14}/></button></div><TransactionList items={transactions.slice(0,5)} onDelete={deleteTransaction}/></section>
            <section className="panel budget-panel"><div className="panel-head"><div><h3>Budget overview</h3><p>Stay on top of spending</p></div><button className="icon-btn small" onClick={()=>setActiveNav('Budgets')}><Plus size={17}/></button></div>
              {budgets.length ? budgets.filter(b=>!b.month || b.month===month).slice(0,4).map(b=>{const spent=monthTransactions.filter(t=>t.type==='expense'&&t.category===b.category).reduce((s,t)=>s+Number(t.amount),0);const pct=Math.min(100,spent/Number(b.amount)*100);return <div className="budget-line" key={b.id}><div className="budget-line-top"><span>{b.category}</span><strong>{money(spent)} <small>/ {money(b.amount)}</small></strong></div><div className="progress-track"><div className={`progress-fill ${pct>=100?'over':pct>=80?'warning':''}`} style={{width:`${pct}%`}}/></div></div>}) : <EmptyState icon={Target} title="No budgets yet" text="Create a category budget to track your limits."/>}
              <button className="btn secondary full" onClick={()=>setActiveNav('Budgets')}>Manage budgets</button>
            </section>
          </div>
        </>}
        {activeNav === 'Transactions' && <section className="panel page-panel"><div className="section-heading"><div><h2>All transactions</h2><p>Search, filter and export your records.</p></div><button className="btn primary" onClick={()=>setShowModal(true)}><Plus size={17}/> Add transaction</button></div><div className="table-tools"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions…"/></div><select value={filterType} onChange={e=>setFilterType(e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expenses</option></select><button className="btn secondary" onClick={exportCsv}><Download size={16}/> Export CSV</button></div><TransactionList items={filtered} onDelete={deleteTransaction} showAll/></section>}
        {activeNav === 'Budgets' && <div className="single-column"><section className="panel page-panel"><div className="section-heading"><div><h2>Monthly budgets</h2><p>Set category limits for {new Date(`${month}-01T12:00:00`).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}.</p></div></div><form className="inline-form" onSubmit={addBudget}><label>Category<select value={budgetDraft.category} onChange={e=>setBudgetDraft({...budgetDraft,category:e.target.value})}>{categories.filter(c=>!['Salary','Freelance'].includes(c)).map(c=><option key={c}>{c}</option>)}</select></label><label>Monthly limit (₹)<input type="number" min="1" required value={budgetDraft.amount} onChange={e=>setBudgetDraft({...budgetDraft,amount:e.target.value})} placeholder="e.g. 5000"/></label><button className="btn primary"><Plus size={16}/> Save budget</button></form>{budgets.filter(b=>!b.month||b.month===month).length ? <div className="budget-cards">{budgets.filter(b=>!b.month||b.month===month).map(b=>{const spent=monthTransactions.filter(t=>t.type==='expense'&&t.category===b.category).reduce((s,t)=>s+Number(t.amount),0);const pct=Math.min(100,spent/Number(b.amount)*100);return <div className="budget-card" key={b.id}><div className="budget-card-head"><span className="category-square">{b.category.slice(0,1)}</span><button className="icon-btn small danger" onClick={async()=>{if(session){const {error}=await supabase.from('budgets').delete().eq('id',b.id);if(error){notify(error.message);return}}setBudgets(old=>old.filter(x=>x.id!==b.id))}}><Trash2 size={15}/></button></div><p>{b.category}</p><h3>{money(spent)} <small>of {money(b.amount)}</small></h3><div className="progress-track"><div className={`progress-fill ${pct>=100?'over':pct>=80?'warning':''}`} style={{width:`${pct}%`}}/></div><small className="muted">{money(Math.max(0,Number(b.amount)-spent))} remaining</small></div>})}</div> : <EmptyState icon={Target} title="No budgets for this month" text="Use the form above to set your first spending limit."/>}</section></div>}
        {activeNav === 'Reports' && <div className="reports-grid"><section className="panel page-panel"><div className="panel-head"><div><h3>Monthly cash flow</h3><p>Six-month income and expenses</p></div><button className="btn secondary" onClick={exportCsv}><Download size={15}/> Export CSV</button></div><div className="chart-area tall"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{top:10,right:12,left:-8,bottom:0}}><CartesianGrid stroke="#263448" strokeDasharray="3 4" vertical={false}/><XAxis dataKey="month" tick={{fill:'#8290a6',fontSize:12}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#8290a6',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip formatter={v=>money(v)}/><Area type="monotone" dataKey="income" name="Income" stroke="#56d6b0" fill="#56d6b0" fillOpacity={0.12}/><Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f7b267" fill="#f7b267" fillOpacity={0.1}/></AreaChart></ResponsiveContainer></div></section><section className="panel page-panel"><h3>Category spending</h3><p className="muted">For selected month</p>{categoryData.length?categoryData.map(c=><div className="budget-line" key={c.name}><div className="budget-line-top"><span>{c.name}</span><strong>{money(c.value)}</strong></div><div className="progress-track"><div className="progress-fill" style={{width:`${expenses?c.value/expenses*100:0}%`,background:categoryColors[categories.indexOf(c.name)%categoryColors.length]}}/></div></div>):<EmptyState icon={ChartNoAxesCombined} title="Nothing to report" text="Transactions will appear here."/>}</section></div>}
        {activeNav === 'Settings' && <section className="panel page-panel settings-panel"><h2>Settings</h2><p className="muted">Manage your Finora workspace.</p><div className="settings-row"><div className="setting-icon"><CreditCard size={18}/></div><div><strong>Default currency</strong><p>Indian Rupee (INR · ₹)</p></div><span className="mini-chip">INR</span></div><div className="settings-row"><div className="setting-icon"><ShieldCheck size={18}/></div><div><strong>Data and privacy</strong><p>{session ? 'Your records are protected by Supabase Row Level Security.' : 'Preview mode data is stored only in current browser memory.'}</p></div></div><div className="settings-row"><div className="setting-icon"><Download size={18}/></div><div><strong>Export your data</strong><p>Download transaction history as a CSV file.</p></div><button className="btn secondary" onClick={exportCsv}>Export</button></div>{session && <button className="btn secondary" onClick={signOut}><LogOut size={16}/> Sign out</button>}</section>}
        <footer className="footer"><span>© {new Date().getFullYear()} Finora</span><span><ShieldCheck size={13}/> Built for better money habits</span></footer>
      </div>
    </main>
    {showModal && <TransactionModal onClose={()=>setShowModal(false)} onSave={saveTransaction}/>}
    {toast && <div className="toast"><span className="toast-check">✓</span>{toast}<button onClick={()=>setToast('')}><X size={15}/></button></div>}
  </div>
}

function EmptyState({ icon: Icon, title, text }) {
  return <div className="empty-state"><span><Icon size={21}/></span><strong>{title}</strong><p>{text}</p></div>
}
function TransactionList({ items, onDelete, showAll = false }) {
  if (!items.length) return <EmptyState icon={Activity} title="No transactions found" text="Add your first transaction to get started."/>
  return <div className={`transaction-list ${showAll ? 'all-transactions' : ''}`}>{items.map(t=><div className="transaction-row" key={t.id}><div className={`transaction-icon ${t.type}`}><span>{t.type==='income'?<ArrowDownLeft size={18}/>:<ArrowUpRight size={18}/>}</span></div><div className="transaction-info"><strong>{t.title}</strong><small>{t.category} <span>·</span> {dateLabel(t.transaction_date)}</small></div><div className="transaction-meta"><strong className={t.type==='income'?'positive':'negative'}>{t.type==='income'?'+':'−'}{money(t.amount)}</strong><small>{t.payment_method || '—'}</small></div>{showAll && <button className="icon-btn small danger delete-btn" aria-label={`Delete ${t.title}`} onClick={()=>onDelete(t.id)}><Trash2 size={15}/></button>}</div>)}</div>
}
export default App
