import './style.css'

const PRICES_URL = 'https://interview.switcheo.com/prices.json'
const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/'

const state = {
  prices: new Map(), // symbol -> price (USD)
  tokens: [], // [{symbol, price}]
  from: 'USDC',
  to: 'SWTH',
  amountFrom: '',
  loading: false,
  error: '',
}

const app = document.querySelector('#app')
app.innerHTML = `
  <div class="min-h-screen w-full flex items-center justify-center p-6">
    <div class="w-full max-w-xl rounded-2xl shadow-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl ring-1 ring-slate-200/60 dark:ring-slate-800/60">
      <div class="p-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Swap</h1>
        </div>

        <div id="alert" class="hidden mt-4 rounded-lg border border-red-300/60 bg-red-50/80 px-4 py-3 text-sm text-red-700"></div>

        <div class="mt-6 space-y-4">
          <div class="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 ring-1 ring-slate-200 dark:ring-slate-800 p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-widest text-slate-500">From</span>
              <button id="maxBtn" class="text-xs font-medium text-blue-600 hover:text-blue-700">MAX</button>
            </div>
            <div class="mt-3 flex items-center gap-3">
              <button id="fromTokenBtn" class="flex items-center gap-2 rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <img id="fromTokenIcon" class="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700" alt="token" />
                <span id="fromTokenLabel" class="text-sm font-semibold text-slate-900 dark:text-white">USDC</span>
                <svg class="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
              </button>
              <input id="fromAmount" inputmode="decimal" placeholder="0.0" class="flex-1 bg-transparent text-right text-2xl font-medium outline-none text-slate-900 dark:text-white placeholder:text-slate-400" />
            </div>
            <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span id="fromBalance">Balance: 1,000.00</span>
              <span id="fromValueUSD">≈ $0.00</span>
            </div>
          </div>

          <div class="flex justify-center">
            <button id="swapBtn" class="group relative -mt-2 rounded-full p-2 ring-1 ring-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <svg class="h-5 w-5 text-slate-700 dark:text-slate-200 group-hover:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none"><path d="M7 10h8l-2 2m2-2-2-2M17 14H9l2-2m-2 2 2 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>

          <div class="rounded-xl bg-slate-50/80 dark:bg-slate-800/40 ring-1 ring-slate-200 dark:ring-slate-800 p-4">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-widest text-slate-500">To</span>
              <span id="rateLabel" class="text-xs text-slate-500"></span>
            </div>
            <div class="mt-3 flex items-center gap-3">
              <button id="toTokenBtn" class="flex items-center gap-2 rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <img id="toTokenIcon" class="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700" alt="token" />
                <span id="toTokenLabel" class="text-sm font-semibold text-slate-900 dark:text-white">SWTH</span>
                <svg class="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
              </button>
              <input id="toAmount" readonly class="flex-1 bg-transparent text-right text-2xl font-medium outline-none text-slate-900 dark:text-white" />
            </div>
            <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>&nbsp;</span>
              <span id="toValueUSD">≈ $0.00</span>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <button id="confirmBtn" class="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 transition flex items-center justify-center gap-2">
            <svg id="btnSpinner" class="hidden animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"></path></svg>
            <span id="confirmLabel">Confirm Swap</span>
          </button>
          <p id="feeNote" class="mt-3 text-center text-xs text-slate-500">Includes mock network fee. This is a simulated swap.</p>
        </div>
      </div>
    </div>

    <div id="tokenModal" class="hidden fixed inset-0 z-50 items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div class="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-2xl">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Select a token</h2>
            <button id="closeModal" class="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg class="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="mt-3">
            <input id="tokenSearch" placeholder="Search symbol…" class="w-full rounded-lg ring-1 ring-slate-300 dark:ring-slate-700 px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none" />
          </div>
        </div>
        <div id="tokenList" class="max-h-[50vh] overflow-auto p-2 grid grid-cols-1"></div>
      </div>
    </div>
  </div>
`

const els = {
  alert: document.getElementById('alert'),
  fromTokenBtn: document.getElementById('fromTokenBtn'),
  toTokenBtn: document.getElementById('toTokenBtn'),
  fromTokenLabel: document.getElementById('fromTokenLabel'),
  toTokenLabel: document.getElementById('toTokenLabel'),
  fromTokenIcon: document.getElementById('fromTokenIcon'),
  toTokenIcon: document.getElementById('toTokenIcon'),
  fromAmount: document.getElementById('fromAmount'),
  toAmount: document.getElementById('toAmount'),
  swapBtn: document.getElementById('swapBtn'),
  maxBtn: document.getElementById('maxBtn'),
  confirmBtn: document.getElementById('confirmBtn'),
  confirmLabel: document.getElementById('confirmLabel'),
  btnSpinner: document.getElementById('btnSpinner'),
  rateLabel: document.getElementById('rateLabel'),
  fromValueUSD: document.getElementById('fromValueUSD'),
  toValueUSD: document.getElementById('toValueUSD'),
  fromBalance: document.getElementById('fromBalance'),
  tokenModal: document.getElementById('tokenModal'),
  tokenSearch: document.getElementById('tokenSearch'),
  tokenList: document.getElementById('tokenList'),
  closeModal: document.getElementById('closeModal'),
}

let selecting = null // 'from' | 'to'

function showError(msg) {
  els.alert.textContent = msg
  els.alert.classList.remove('hidden')
}
function clearError() {
  els.alert.classList.add('hidden')
  els.alert.textContent = ''
}
function setIcon(el, symbol) {
  const url = `${ICON_BASE}${encodeURIComponent(symbol)}.svg`
  el.src = url
  el.onerror = () => {
    el.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#64748b">${symbol.slice(0,3)}</text></svg>`)
  }
}
function fmt(n, d=6) {
  if (!isFinite(n)) return '0'
  const str = Number(n).toFixed(d)
  return str.replace(/\.?0+$/,'')
}
function fmtUSD(n) {
  const f = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
  return f.format(Number(n) || 0)
}

async function fetchPrices() {
  const res = await fetch(PRICES_URL)
  const arr = await res.json()
  const latest = new Map()
  for (const item of arr) {
    latest.set(item.currency, { price: item.price, date: new Date(item.date).getTime() })
  }
  const tokens = []
  for (const [symbol, { price }] of latest.entries()) {
    if (typeof price === 'number' && isFinite(price)) {
      tokens.push({ symbol, price })
    }
  }
  tokens.sort((a,b)=>a.symbol.localeCompare(b.symbol))
  state.tokens = tokens
  state.prices = new Map(tokens.map(t=>[t.symbol, t.price]))
  if (!state.prices.has(state.from)) state.from = tokens[0]?.symbol || 'USD'
  if (!state.prices.has(state.to)) state.to = tokens[1]?.symbol || state.from
  refreshTokens()
  recompute()
}

function refreshTokens() {
  els.fromTokenLabel.textContent = state.from
  els.toTokenLabel.textContent = state.to
  setIcon(els.fromTokenIcon, state.from)
  setIcon(els.toTokenIcon, state.to)
}

function rate() {
  const pFrom = state.prices.get(state.from)
  const pTo = state.prices.get(state.to)
  if (!pFrom || !pTo) return 0
  return pFrom / pTo
}

function recompute() {
  clearError()
  const amt = parseFloat(state.amountFrom)
  const pFrom = state.prices.get(state.from)
  const pTo = state.prices.get(state.to)
  const invalid = !pFrom || !pTo || !isFinite(amt) || amt <= 0 || state.from === state.to
  els.confirmBtn.disabled = invalid || state.loading
  if (state.from === state.to) {
    showError('Please select two different tokens.')
  } else if (!isFinite(amt) || amt <= 0) {
    showError('Enter a valid amount greater than zero.')
  } else if (!pFrom || !pTo) {
    showError('Selected token price is unavailable.')
  }
  const r = rate()
  els.rateLabel.textContent = r ? `1 ${state.from} = ${fmt(r,6)} ${state.to}` : ''
  const out = isFinite(amt) ? amt * r : 0
  els.toAmount.value = fmt(out,6)
  const usdFrom = (pFrom || 0) * (isFinite(amt) ? amt : 0)
  const usdTo = (pTo || 0) * out
  els.fromValueUSD.textContent = `≈ ${fmtUSD(usdFrom)}`
  els.toValueUSD.textContent = `≈ ${fmtUSD(usdTo)}`
}

function openTokenModal(which) {
  selecting = which
  els.tokenModal.classList.remove('hidden')
  els.tokenModal.classList.add('flex')
  els.tokenSearch.value = ''
  renderTokenList('')
}
function closeTokenModal() {
  els.tokenModal.classList.add('hidden')
  els.tokenModal.classList.remove('flex')
}
function renderTokenList(q) {
  const query = (q || '').trim().toLowerCase()
  const items = state.tokens.filter(t => t.symbol.toLowerCase().includes(query))
  els.tokenList.innerHTML = items.map(t => `
    <button data-symbol="${t.symbol}" class="flex items-center gap-3 w-full rounded-lg p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
      <img src="${ICON_BASE}${encodeURIComponent(t.symbol)}.svg" class="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-700" onerror="this.style.display='none'"/>
      <div class="flex-1 text-left">
        <div class="text-sm font-semibold text-slate-900 dark:text-white">${t.symbol}</div>
        <div class="text-xs text-slate-500">Price: ${fmtUSD(t.price)}</div>
      </div>
    </button>
  `).join('')
}

els.tokenList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-symbol]')
  if (!btn) return
  const sym = btn.getAttribute('data-symbol')
  if (selecting === 'from') state.from = sym
  else if (selecting === 'to') state.to = sym
  refreshTokens()
  closeTokenModal()
  recompute()
})
els.tokenSearch.addEventListener('input', (e) => renderTokenList(e.target.value))
els.closeModal.addEventListener('click', closeTokenModal)

els.fromTokenBtn.addEventListener('click', () => openTokenModal('from'))
els.toTokenBtn.addEventListener('click', () => openTokenModal('to'))
els.swapBtn.addEventListener('click', () => {
  const tmp = state.from
  state.from = state.to
  state.to = tmp
  refreshTokens()
  recompute()
})
els.maxBtn.addEventListener('click', () => {
  state.amountFrom = '1000'
  els.fromAmount.value = state.amountFrom
  recompute()
})
els.fromAmount.addEventListener('input', (e) => {
  state.amountFrom = e.target.value.replace(/[^\d.]/g,'')
  e.target.value = state.amountFrom
  recompute()
})

els.confirmBtn.addEventListener('click', async () => {
  state.loading = true
  els.confirmBtn.disabled = true
  els.btnSpinner.classList.remove('hidden')
  els.confirmLabel.textContent = 'Swapping…'
  clearError()
  await new Promise(r => setTimeout(r, 1500))
  els.btnSpinner.classList.add('hidden')
  els.confirmLabel.textContent = 'Swap Complete ✓'
  await new Promise(r => setTimeout(r, 1200))
  state.loading = false
  els.confirmLabel.textContent = 'Confirm Swap'
  recompute()
})

fetchPrices().catch(() => showError('Failed to load prices. Please try again.'))
