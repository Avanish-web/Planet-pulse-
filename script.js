/* ============================================================
   PlanetPulse — carbon footprint tracker
   All data is stored client-side in localStorage. No backend.
   Emission factors are documented in README.md / DECISIONS.md —
   they are reasonable public estimates, not a certified source,
   and that trade-off is called out on purpose.
   ============================================================ */

// ---- Emission factors (kg CO2e) ----
const FACTORS = {
  travel: { // per km
    car: 0.192,
    bus: 0.105,
    train: 0.041,
    flight: 0.255,
    bike: 0
  },
  food: { // per serving
    beef: 6.0,
    poultry: 1.8,
    vegetarian: 0.6,
    vegan: 0.4
  },
  electricity: 0.42 // per kWh, global grid average
};

const LABELS = {
  travel: { car: 'Car', bus: 'Bus', train: 'Train / metro', flight: 'Flight', bike: 'Bike / walk' },
  food: { beef: 'Beef / red meat', poultry: 'Chicken / fish / eggs', vegetarian: 'Vegetarian', vegan: 'Vegan' }
};

const STORAGE_KEY = 'planetpulse.entries';
const GOAL_KEY = 'planetpulse.goal';

// ---- State ----
let entries = loadEntries();
let activeTab = 'travel';

function loadEntries(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Could not read saved entries', e);
    return [];
  }
}
function saveEntries(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }catch(e){
    console.error('Could not save entries', e);
  }
}
function todayStr(){
  return new Date().toISOString().slice(0,10);
}

// ---- Tab switching ----
const tabs = document.querySelectorAll('.log-tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected','false'); });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected','true');
    activeTab = tab.dataset.type;
    document.querySelectorAll('.log-fields').forEach(panel => {
      panel.hidden = panel.dataset.panel !== activeTab;
    });
  });
});

// ---- Form submit ----
document.getElementById('logForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  let entry = null;

  if(activeTab === 'travel'){
    const mode = form.mode.value;
    const distance = parseFloat(form.distance.value);
    if(!distance || distance <= 0) return flashInvalid(form.distance);
    const co2 = +(distance * FACTORS.travel[mode]).toFixed(2);
    entry = { type: 'travel', label: `${LABELS.travel[mode]} · ${distance} km`, co2 };
    form.distance.value = '';
  }

  if(activeTab === 'food'){
    const foodType = form.foodType.value;
    const servings = parseFloat(form.servings.value) || 1;
    if(servings <= 0) return flashInvalid(form.servings);
    const co2 = +(servings * FACTORS.food[foodType]).toFixed(2);
    entry = { type: 'food', label: `${LABELS.food[foodType]} · ${servings} serving${servings>1?'s':''}`, co2 };
  }

  if(activeTab === 'electricity'){
    const kwh = parseFloat(form.kwh.value);
    if(!kwh || kwh <= 0) return flashInvalid(form.kwh);
    const co2 = +(kwh * FACTORS.electricity).toFixed(2);
    entry = { type: 'electricity', label: `${kwh} kWh used`, co2 };
    form.kwh.value = '';
  }

  entry.id = Date.now() + Math.random().toString(36).slice(2,7);
  entry.date = todayStr();
  entries.push(entry);
  saveEntries();
  renderAll();
});

function flashInvalid(field){
  field.style.outline = '2px solid var(--amber)';
  field.focus();
  setTimeout(() => field.style.outline = '', 800);
}

// ---- Remove entry ----
function removeEntry(id){
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  renderAll();
}

// ---- Reset ----
document.getElementById('resetBtn').addEventListener('click', () => {
  if(confirm('Clear all logged entries? This cannot be undone.')){
    entries = [];
    saveEntries();
    renderAll();
  }
});

// ---- Goal ----
const goalInput = document.getElementById('goalInput');
goalInput.value = localStorage.getItem(GOAL_KEY) || 10;
goalInput.addEventListener('input', () => {
  localStorage.setItem(GOAL_KEY, goalInput.value);
  renderDashboard();
});

// ---- Rendering ----
function todaysEntries(){
  const t = todayStr();
  return entries.filter(e => e.date === t);
}

function renderAll(){
  renderEntriesList();
  renderDashboard();
  renderHeroPulse();
  renderTrend();
  renderTips();
}

function renderEntriesList(){
  const list = document.getElementById('entriesList');
  const today = todaysEntries();
  if(today.length === 0){
    list.innerHTML = `<p class="empty-state">No entries yet today. Add your first one above — an empty log is just a day not yet lived.</p>`;
    return;
  }
  list.innerHTML = today.slice().reverse().map(e => `
    <div class="entry-row">
      <div class="entry-left">
        <span class="entry-tag">${e.type}</span>
        <span class="entry-desc">${e.label}</span>
      </div>
      <div class="entry-right">
        <span class="entry-co2">${e.co2.toFixed(2)} kg</span>
        <button class="entry-remove" aria-label="Remove entry" data-id="${e.id}">×</button>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.entry-remove').forEach(btn => {
    btn.addEventListener('click', () => removeEntry(btn.dataset.id));
  });
}

function categoryTotals(list){
  const totals = { travel: 0, food: 0, electricity: 0 };
  list.forEach(e => totals[e.type] += e.co2);
  return totals;
}

function renderDashboard(){
  const today = todaysEntries();
  const totals = categoryTotals(today);
  const grandTotal = totals.travel + totals.food + totals.electricity;
  const max = Math.max(totals.travel, totals.food, totals.electricity, 0.001);

  ['travel','food','electricity'].forEach(cat => {
    const pct = grandTotal > 0 ? (totals[cat] / max) * 100 : 0;
    document.querySelector(`[data-fill="${cat}"]`).style.width = `${Math.min(pct,100)}%`;
    document.querySelector(`[data-value="${cat}"]`).textContent = `${totals[cat].toFixed(1)} kg`;
  });

  document.getElementById('todayTotal').textContent = grandTotal.toFixed(1);

  // Goal
  const goal = parseFloat(goalInput.value) || 10;
  const fill = document.getElementById('goalFill');
  const status = document.getElementById('goalStatus');
  const pct = Math.min((grandTotal / goal) * 100, 100);
  fill.style.width = `${pct}%`;

  if(grandTotal === 0){
    fill.style.background = 'var(--line)';
    status.textContent = 'Log something to see how today compares.';
  } else if(grandTotal <= goal){
    fill.style.background = 'var(--forest)';
    status.textContent = `${(goal - grandTotal).toFixed(1)} kg under your ${goal} kg target. Good pace.`;
  } else {
    fill.style.background = 'var(--amber)';
    status.textContent = `${(grandTotal - goal).toFixed(1)} kg over your ${goal} kg target today.`;
  }
}

function renderHeroPulse(){
  const today = todaysEntries();
  const total = categoryTotals(today);
  const grand = total.travel + total.food + total.electricity;
  document.getElementById('todayTotal').textContent = grand.toFixed(1);

  // Draw a jagged pulse when footprint is high, calm line when low.
  const intensity = Math.min(grand / 15, 1); // 0 = calm, 1 = spiky
  const pts = [];
  const steps = 24;
  for(let i=0;i<=steps;i++){
    const x = (i/steps) * 400;
    const isSpike = i % 4 === 2;
    const amp = isSpike ? 35 * intensity : 4 * intensity + 2;
    const y = 45 + (isSpike ? -amp : (i % 2 === 0 ? amp*0.3 : -amp*0.3));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  document.getElementById('heroPulsePath').setAttribute('points', pts.join(' '));
}

function last7Days(){
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0,10));
  }
  return days;
}

function renderTrend(){
  const days = last7Days();
  const dailyTotals = days.map(d => {
    const dayEntries = entries.filter(e => e.date === d);
    return dayEntries.reduce((sum,e) => sum + e.co2, 0);
  });

  const maxVal = Math.max(...dailyTotals, 1);
  const w = 700, h = 220, padTop = 20, padBottom = 40;
  const usableH = h - padTop - padBottom;

  const points = dailyTotals.map((val, i) => {
    const x = (i / (dailyTotals.length - 1)) * w;
    const y = padTop + usableH - (val / maxVal) * usableH;
    return { x, y, val };
  });

  document.getElementById('trendPath').setAttribute('points', points.map(p => `${p.x},${p.y}`).join(' '));

  const dotsG = document.getElementById('trendDots');
  dotsG.innerHTML = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4"></circle>`).join('');

  const labels = document.getElementById('trendLabels');
  labels.innerHTML = days.map(d => {
    const dt = new Date(d + 'T00:00:00');
    return `<span>${dt.toLocaleDateString(undefined,{weekday:'short'})}</span>`;
  }).join('');
}

const TIPS = {
  travel: [
    'Swap one car trip this week for the bus or train — a single 10 km switch saves roughly 1.5 kg CO₂e.',
    'Chain errands into one trip instead of several short drives; cold-start emissions add up fast.',
    'For trips under 3 km, walking or biking cuts that leg to zero.'
  ],
  food: [
    'Swapping one beef meal for a vegetarian one saves about 5.4 kg CO₂e — more than most people\'s whole travel footprint that day.',
    'Try a plant-based option for lunch a couple of times a week rather than an all-or-nothing swap.',
    'Poultry and fish are a lighter middle ground if going fully vegetarian feels like too big a jump.'
  ],
  electricity: [
    'Unplug devices on standby — phantom load can be 5-10% of home electricity use.',
    'Shift heavy appliance use (laundry, dishwasher) to off-peak hours if your provider offers time-of-use rates.',
    'Switching a few bulbs to LED cuts lighting electricity by roughly 75%.'
  ]
};

function renderTips(){
  const today = todaysEntries();
  const totals = categoryTotals(today);
  const grand = totals.travel + totals.food + totals.electricity;
  const list = document.getElementById('tipsList');

  if(grand === 0){
    list.innerHTML = `<p class="empty-state">Tips appear once you've logged something today.</p>`;
    return;
  }

  const topCat = Object.entries(totals).sort((a,b) => b[1]-a[1])[0][0];
  const tips = TIPS[topCat];

  list.innerHTML = tips.map(t => `
    <div class="tip-row">
      <span class="tip-cat">${topCat}</span>
      <span class="tip-text">${t}</span>
    </div>
  `).join('');
}

// ---- init ----
renderAll();
