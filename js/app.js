// ============================================================
//  HOSTEL MESS MANAGER — Frontend (Google Sheets Edition)
// ============================================================

const SCRIPT_URL_KEY = 'mess_script_url';

// In-memory state (synced from Google Sheets)
let state = {
  members: [],
  meals: [],
  expenses: [],
  deposits: [],
  mealRate: 0,
  nextId: 1
};

// ── Script URL ───────────────────────────────────────────────
function getScriptUrl() {
  return localStorage.getItem(SCRIPT_URL_KEY) || '';
}

function saveScriptUrl() {
  const url = document.getElementById('script-url-input').value.trim();
  if (!url.startsWith('https://script.google.com')) {
    alert('Please paste a valid Apps Script Web App URL.');
    return;
  }
  localStorage.setItem(SCRIPT_URL_KEY, url);
  document.getElementById('config-banner').classList.add('hidden');
  setStatus('⏳ Connecting...', '');
  setupAndLoad();
}

function checkConfig() {
  const url = getScriptUrl();
  if (url) {
    document.getElementById('config-banner').classList.add('hidden');
    document.getElementById('script-url-input').value = url;
  }
}

// ── API call ─────────────────────────────────────────────────
async function api(params) {
  const url = getScriptUrl();
  if (!url) { alert('Please connect your Google Sheet first.'); return null; }

  const qs = new URLSearchParams(params).toString();
  const fullUrl = url + '?' + qs;

  try {
    const res = await fetch(fullUrl, { redirect: 'follow' });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    setStatus('❌ Error: ' + err.message, 'err');
    console.error(err);
    return null;
  }
}

// ── Setup & Load ─────────────────────────────────────────────
async function setupAndLoad() {
  setStatus('⏳ Setting up sheets...', '');
  const result = await api({ action: 'setup' });
  if (!result) return;
  await loadAll();
}

async function loadAll() {
  setStatus('⏳ Loading...', '');
  const data = await api({ action: 'getAll' });
  if (!data) return;

  state.members  = (data.members  || []).map(normaliseRow);
  state.meals    = (data.meals    || []).map(normaliseRow);
  state.expenses = (data.expenses || []).map(normaliseRow);
  state.deposits = (data.deposits || []).map(normaliseRow);
  state.mealRate = parseFloat(data.mealRate) || 0;
  state.nextId   = parseInt(data.nextId)     || 1;

  setStatus('✅ Synced with Google Sheets', 'ok');
  render();
}

// Google Sheets sometimes returns numbers as strings
function normaliseRow(row) {
  const out = {};
  for (const k in row) {
    const v = row[k];
    out[k] = (v !== '' && !isNaN(v) && typeof v !== 'boolean') ? Number(v) : v;
  }
  return out;
}

function setStatus(msg, cls) {
  const el = document.getElementById('sync-status');
  el.textContent = msg;
  el.className = 'sync-status ' + (cls || '');
}

// ── Helpers ──────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#e8d5f5', text: '#6a1b9a' },
  { bg: '#d5eaf5', text: '#1565c0' },
  { bg: '#d5f5e8', text: '#1b5e20' },
  { bg: '#f5e8d5', text: '#e65100' },
  { bg: '#f5d5d5', text: '#b71c1c' },
  { bg: '#d5f5f5', text: '#00695c' },
  { bg: '#f5f5d5', text: '#827717' },
];

function initials(name) {
  return String(name).trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function avatarHTML(member) {
  const idx = state.members.findIndex(m => m.id == member.id) % AVATAR_COLORS.length;
  const c = AVATAR_COLORS[Math.max(0, idx)];
  return `<div class="avatar" style="background:${c.bg};color:${c.text}">${initials(member.name)}</div>`;
}

function getMealCount(memberId) {
  return state.meals.filter(m => m.memberId == memberId).reduce((s, m) => s + (Number(m.total) || 0), 0);
}
function getMealCost(memberId) {
  return state.meals.filter(m => m.memberId == memberId).reduce((s, m) => s + (Number(m.cost) || 0), 0);
}
function getTotalDeposit(memberId) {
  return state.deposits.filter(d => d.memberId == memberId).reduce((s, d) => s + (Number(d.amount) || 0), 0);
}
function getTotalExpenses(memberId) {
  return state.expenses.filter(e => e.memberId == memberId).reduce((s, e) => s + (Number(e.amount) || 0), 0);
}
function getBalance(memberId) {
  return getTotalDeposit(memberId) + getTotalExpenses(memberId) - getMealCost(memberId);
}
function fmt(n) { return '৳' + Math.round(n).toLocaleString('en-BD'); }
function todayStr() { return new Date().toISOString().split('T')[0]; }

// ── Tab switching ─────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes("'" + name + "'")) {
      b.classList.add('active');
    }
  });
}

// ── Render ───────────────────────────────────────────────────
function render() {
  populateSelects();
  renderDashboard();
  renderMembers();
  renderMealLog();
  renderExpLog();
  renderDepLog();
  renderSummary();
  document.getElementById('current-rate-display').textContent = fmt(state.mealRate);
  document.getElementById('sidebar-rate').textContent = fmt(state.mealRate);
}

function populateSelects() {
  const opts = '<option value="">Select member</option>' +
    state.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  ['meal-person', 'exp-person', 'dep-person'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { const prev = el.value; el.innerHTML = opts; el.value = prev; }
  });
}

function renderDashboard() {
  const totalMeals = state.members.reduce((s, m) => s + getMealCount(m.id), 0);
  const totalExp   = state.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalDep   = state.deposits.reduce((s, d) => s + Number(d.amount), 0);

  document.getElementById('dash-metrics').innerHTML = `
    <div class="metric"><div class="lbl">Members</div><div class="val">${state.members.length}</div></div>
    <div class="metric"><div class="lbl">Total Meals</div><div class="val">${totalMeals}</div></div>
    <div class="metric"><div class="lbl">Total Expenses</div><div class="val">${fmt(totalExp)}</div></div>
    <div class="metric"><div class="lbl">Total Deposits</div><div class="val">${fmt(totalDep)}</div></div>
  `;

  document.getElementById('dash-members').innerHTML = state.members.length === 0
    ? '<p class="empty-msg">No members yet. Add members from the Members tab.</p>'
    : state.members.map(m => {
        const bal = getBalance(m.id);
        const cls = bal > 0 ? 'badge-green' : bal < 0 ? 'badge-red' : 'badge-gray';
        return `<div class="person-row">
          ${avatarHTML(m)}
          <div class="person-info">
            <div class="person-name">${m.name}</div>
            <div class="person-detail">Room ${m.room} &middot; ${getMealCount(m.id)} meals &middot; Cost: ${fmt(getMealCost(m.id))}</div>
          </div>
          <span class="badge ${cls}">${bal >= 0 ? '+' : ''}${fmt(bal)}</span>
        </div>`;
      }).join('');
}

function renderMembers() {
  const el = document.getElementById('members-list');
  if (!el) return;
  el.innerHTML = state.members.length === 0
    ? '<p class="empty-msg">No members yet.</p>'
    : state.members.map(m => `
        <div class="person-row">
          ${avatarHTML(m)}
          <div class="person-info">
            <div class="person-name">${m.name}</div>
            <div class="person-detail">Room ${m.room}</div>
          </div>
          <button class="btn btn-danger" onclick="removeMember(${m.id})">Remove</button>
        </div>`).join('');
}

function renderMealLog() {
  const el = document.getElementById('meal-log');
  if (!el) return;
  if (state.meals.length === 0) { el.innerHTML = '<p class="empty-msg">No meal entries yet.</p>'; return; }
  const sorted = [...state.meals].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  el.innerHTML = `<table>
    <thead><tr><th>Member</th><th>Date</th><th>B</th><th>L</th><th>D</th><th>Total</th><th>Cost</th></tr></thead>
    <tbody>${sorted.map(m => `<tr>
      <td>${m.memberName || '—'}</td><td>${m.date}</td>
      <td>${m.breakfast}</td><td>${m.lunch}</td><td>${m.dinner}</td>
      <td><strong>${m.total}</strong></td><td>${fmt(m.cost)}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderExpLog() {
  const el = document.getElementById('exp-log');
  if (!el) return;
  if (state.expenses.length === 0) { el.innerHTML = '<p class="empty-msg">No expenses yet.</p>'; return; }
  const sorted = [...state.expenses].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  el.innerHTML = `<table>
    <thead><tr><th>Paid By</th><th>Description</th><th>Date</th><th>Amount</th></tr></thead>
    <tbody>${sorted.map(e => `<tr>
      <td>${e.memberName || '—'}</td><td>${e.description}</td><td>${e.date}</td><td>${fmt(e.amount)}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderDepLog() {
  const el = document.getElementById('dep-log');
  if (!el) return;
  if (state.deposits.length === 0) { el.innerHTML = '<p class="empty-msg">No deposits yet.</p>'; return; }
  const sorted = [...state.deposits].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  el.innerHTML = `<table>
    <thead><tr><th>Member</th><th>Date</th><th>Amount</th></tr></thead>
    <tbody>${sorted.map(d => `<tr>
      <td>${d.memberName || '—'}</td><td>${d.date}</td><td>${fmt(d.amount)}</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderSummary() {
  const el = document.getElementById('summary-table');
  if (!el) return;
  if (state.members.length === 0) {
    el.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:2rem">No members yet.</td></tr>';
    return;
  }
  el.innerHTML = state.members.map(m => {
    const meals = getMealCount(m.id), cost = getMealCost(m.id);
    const dep = getTotalDeposit(m.id), exp = getTotalExpenses(m.id);
    const bal = getBalance(m.id);
    const cls = bal > 0 ? 'positive' : bal < 0 ? 'negative' : 'neutral';
    return `<tr>
      <td><strong>${m.name}</strong><br><small style="color:var(--text3)">Room ${m.room}</small></td>
      <td>${meals}</td><td>${fmt(cost)}</td><td>${fmt(dep)}</td><td>${fmt(exp)}</td>
      <td class="${cls}">${bal >= 0 ? '+' : ''}${fmt(bal)}</td>
    </tr>`;
  }).join('');
}

// ── Actions ──────────────────────────────────────────────────
async function addMember() {
  const name = document.getElementById('new-name').value.trim();
  const room = document.getElementById('new-room').value.trim();
  if (!name) { alert('Please enter a name.'); return; }
  setStatus('⏳ Saving...', '');
  const res = await api({ action: 'addMember', name, room: room || '—' });
  if (!res) return;
  document.getElementById('new-name').value = '';
  document.getElementById('new-room').value = '';
  await loadAll();
}

async function removeMember(id) {
  const member = state.members.find(m => m.id == id);
  if (!confirm(`Remove ${member ? member.name : 'this member'}?`)) return;
  setStatus('⏳ Removing...', '');
  const res = await api({ action: 'removeMember', id });
  if (!res) return;
  await loadAll();
}

async function setMealRate() {
  const rate = parseFloat(document.getElementById('meal-rate').value);
  if (isNaN(rate) || rate < 0) { alert('Please enter a valid rate.'); return; }
  setStatus('⏳ Saving...', '');
  const res = await api({ action: 'setMealRate', rate });
  if (!res) return;
  document.getElementById('meal-rate').value = '';
  await loadAll();
}

async function addMeal() {
  const memberId = document.getElementById('meal-person').value;
  const date     = document.getElementById('meal-date').value;
  const b = parseInt(document.getElementById('meal-b').value) || 0;
  const l = parseInt(document.getElementById('meal-l').value) || 0;
  const d = parseInt(document.getElementById('meal-d').value) || 0;
  if (!memberId) { alert('Please select a member.'); return; }
  if (!date)     { alert('Please select a date.'); return; }
  if (b + l + d === 0) { alert('Enter at least one meal.'); return; }
  const member = state.members.find(m => m.id == memberId);
  setStatus('⏳ Saving...', '');
  const res = await api({ action: 'addMeal', memberId, memberName: member ? member.name : '', date, breakfast: b, lunch: l, dinner: d });
  if (!res) return;
  document.getElementById('meal-b').value = '';
  document.getElementById('meal-l').value = '';
  document.getElementById('meal-d').value = '';
  await loadAll();
}

async function addExpense() {
  const memberId = document.getElementById('exp-person').value;
  const amount   = parseFloat(document.getElementById('exp-amount').value);
  const desc     = document.getElementById('exp-desc').value.trim() || 'Mess expense';
  const date     = document.getElementById('exp-date').value;
  if (!memberId)          { alert('Please select a member.'); return; }
  if (isNaN(amount) || amount <= 0) { alert('Enter a valid amount.'); return; }
  if (!date)              { alert('Please select a date.'); return; }
  const member = state.members.find(m => m.id == memberId);
  setStatus('⏳ Saving...', '');
  const res = await api({ action: 'addExpense', memberId, memberName: member ? member.name : '', amount, description: desc, date });
  if (!res) return;
  document.getElementById('exp-amount').value = '';
  document.getElementById('exp-desc').value = '';
  await loadAll();
}

async function addDeposit() {
  const memberId = document.getElementById('dep-person').value;
  const amount   = parseFloat(document.getElementById('dep-amount').value);
  const date     = document.getElementById('dep-date').value;
  if (!memberId)          { alert('Please select a member.'); return; }
  if (isNaN(amount) || amount <= 0) { alert('Enter a valid amount.'); return; }
  if (!date)              { alert('Please select a date.'); return; }
  const member = state.members.find(m => m.id == memberId);
  setStatus('⏳ Saving...', '');
  const res = await api({ action: 'addDeposit', memberId, memberName: member ? member.name : '', amount, date });
  if (!res) return;
  document.getElementById('dep-amount').value = '';
  await loadAll();
}

// ── Init ─────────────────────────────────────────────────────
function init() {
  const t = todayStr();
  ['meal-date', 'exp-date', 'dep-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = t;
  });
  checkConfig();
  const url = getScriptUrl();
  if (url) loadAll();
}

document.addEventListener('DOMContentLoaded', init);
