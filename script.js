// --- State Management ---
const defaultState = {
    budget: [],
    weight: {
        trailerGvwr: 10000,
        trailerWeight: 1500,
        items: []
    },
    solar: [],
    insulation: [],
    water: []
};

let state = JSON.parse(localStorage.getItem('thn_companion_data')) || defaultState;

// --- DOM Elements ---
const els = {
    navBtns: document.querySelectorAll('.nav-btn'),
    views: document.querySelectorAll('.view'),
    
    // Dashboard
    dashCost: document.getElementById('dash-total-cost'),
    dashWeight: document.getElementById('dash-total-weight'),
    dashEnergy: document.getElementById('dash-total-energy'),
    chartCanvas: document.getElementById('dashboardChart'),
    exportPdfBtn: document.getElementById('exportPdfBtn'),
    
    // Budget
    budgetTable: document.querySelector('#budgetTable tbody'),
    budgetTotal: document.getElementById('budgetTotalDisplay'),
    addBudgetBtn: document.getElementById('addBudgetBtn'),
    budgetModal: document.getElementById('budgetModal'),
    budgetForm: document.getElementById('budgetForm'),
    closeModal: document.querySelector('.close'),
    
    // Weight
    trailerGvwr: document.getElementById('trailerGvwr'),
    trailerWeight: document.getElementById('trailerWeight'),
    payloadDisplay: document.getElementById('payloadDisplay'),
    weightFill: document.getElementById('weightFill'),
    weightWarning: document.getElementById('weightWarning'),
    weightList: document.getElementById('weightList'),
    addWeightBtn: document.getElementById('addWeightBtn'),
    weightItemName: document.getElementById('weightItemName'),
    weightItemLbs: document.getElementById('weightItemLbs'),
    
    // Solar
    solarList: document.getElementById('solarList'),
    addSolarBtn: document.getElementById('addSolarBtn'),
    solarAppliance: document.getElementById('solarAppliance'),
    solarWatts: document.getElementById('solarWatts'),
    solarHours: document.getElementById('solarHours'),
    totalWh: document.getElementById('totalWh'),
    recPanels: document.getElementById('recPanels'),
    recBattery: document.getElementById('recBattery'),

    // Insulation
    layerList: document.getElementById('layerList'),
    addLayerBtn: document.getElementById('addLayerBtn'),
    insulMaterial: document.getElementById('insulMaterial'),
    insulThickness: document.getElementById('insulThickness'),
    totalRValue: document.getElementById('totalRValue'),
    totalThickness: document.getElementById('totalThickness'),

    // Water
    waterList: document.getElementById('waterList'),
    addWaterBtn: document.getElementById('addWaterBtn'),
    waterActivity: document.getElementById('waterActivity'),
    waterQuantity: document.getElementById('waterQuantity'),
    totalGallons: document.getElementById('totalGallons'),
    recGreyTank: document.getElementById('recGreyTank')
};

let chartInstance = null;

// --- Initialization ---
function init() {
    try {
        setupNavigation();
        setupBudget();
        setupWeight();
        setupSolar();
        setupInsulation();
        setupWater();
        
        // Load saved inputs
        if (els.trailerGvwr) els.trailerGvwr.value = state.weight.trailerGvwr;
        if (els.trailerWeight) els.trailerWeight.value = state.weight.trailerWeight;

        // Setup Export
        if (els.exportPdfBtn) els.exportPdfBtn.onclick = generatePDF;

        updateDashboard();
    } catch (e) {
        console.error("Initialization error:", e);
    }
}

function saveData() {
    localStorage.setItem('thn_companion_data', JSON.stringify(state));
    updateDashboard();
    
    // Flash save status
    const status = document.getElementById('saveStatus');
    status.style.opacity = '1';
    setTimeout(() => status.style.opacity = '0.7', 500);
}

// --- Navigation ---
function setupNavigation() {
    els.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Buttons
            els.navBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            // Update Views
            els.views.forEach(v => v.classList.remove('active'));
            document.getElementById(btn.dataset.tab).classList.add('active');
            
            if (btn.dataset.tab === 'dashboard') {
                updateDashboard();
            }
        });
    });
}

// --- Dashboard Logic ---
function updateDashboard() {
    // Calculate Totals
    const totalCost = state.budget.reduce((sum, item) => sum + item.cost, 0);
    const totalWeight = state.weight.items.reduce((sum, item) => sum + item.weight, 0) + state.weight.trailerWeight;
    const totalEnergy = state.solar.reduce((sum, item) => sum + (item.watts * item.hours), 0);
    
    // Update Text
    els.dashCost.textContent = formatMoney(totalCost);
    els.dashWeight.textContent = `${totalWeight.toLocaleString()} lbs`;
    els.dashEnergy.textContent = `${totalEnergy.toLocaleString()} Wh`;
    
    // Update Chart
    updateChart();
}

function updateChart() {
    if (typeof Chart === 'undefined') return; // Guard against Chart.js not loading

    const categories = {};
    state.budget.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + item.cost;
    });
    
    const data = {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: [
                '#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', 
                '#34495e', '#1abc9c', '#e67e22', '#95a5a6', '#d35400'
            ]
        }]
    };
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(els.chartCanvas, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

// --- Budget Logic ---
function setupBudget() {
    renderBudgetTable();
    
    els.addBudgetBtn.onclick = () => els.budgetModal.style.display = 'block';
    els.closeModal.onclick = () => els.budgetModal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target == els.budgetModal) els.budgetModal.style.display = 'none';
    };
    
    els.budgetForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('budgetName').value;
        const category = document.getElementById('budgetCategory').value;
        const cost = parseFloat(document.getElementById('budgetCost').value);
        
        state.budget.push({ id: Date.now(), name, category, cost });
        saveData();
        renderBudgetTable();
        
        els.budgetForm.reset();
        els.budgetModal.style.display = 'none';
    };
}

function renderBudgetTable() {
    els.budgetTable.innerHTML = '';
    let total = 0;
    
    state.budget.forEach(item => {
        total += item.cost;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td><span class="badge">${item.category}</span></td>
            <td>${formatMoney(item.cost)}</td>
            <td><button class="btn-delete" onclick="deleteBudget(${item.id})"><i class="fas fa-trash"></i></button></td>
        `;
        els.budgetTable.appendChild(tr);
    });
    
    els.budgetTotal.textContent = formatMoney(total);
}

window.deleteBudget = (id) => {
    state.budget = state.budget.filter(i => i.id !== id);
    saveData();
    renderBudgetTable();
};

// --- Weight Logic ---
function setupWeight() {
    renderWeightList();
    
    const updateTrailerStats = () => {
        state.weight.trailerGvwr = parseFloat(els.trailerGvwr.value) || 0;
        state.weight.trailerWeight = parseFloat(els.trailerWeight.value) || 0;
        saveData();
        renderWeightList(); // Re-render to update meter
    };
    
    els.trailerGvwr.onchange = updateTrailerStats;
    els.trailerWeight.onchange = updateTrailerStats;
    
    els.addWeightBtn.onclick = () => {
        const name = els.weightItemName.value;
        const weight = parseFloat(els.weightItemLbs.value);
        
        if (name && weight) {
            state.weight.items.push({ id: Date.now(), name, weight });
            saveData();
            renderWeightList();
            els.weightItemName.value = '';
            els.weightItemLbs.value = '';
        }
    };
}

function renderWeightList() {
    els.weightList.innerHTML = '';
    let itemsWeight = 0;
    
    state.weight.items.forEach(item => {
        itemsWeight += item.weight;
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name}</span>
            <span>${item.weight} lbs <button class="btn-delete" onclick="deleteWeight(${item.id})"><i class="fas fa-times"></i></button></span>
        `;
        els.weightList.appendChild(li);
    });
    
    // Update Meter
    const totalWeight = itemsWeight + state.weight.trailerWeight;
    const gvwr = state.weight.trailerGvwr;
    const percentage = Math.min(100, (totalWeight / gvwr) * 100);
    
    els.payloadDisplay.textContent = `${totalWeight.toLocaleString()} / ${gvwr.toLocaleString()} lbs`;
    els.weightFill.style.width = `${percentage}%`;
    
    els.weightFill.className = 'meter-fill';
    els.weightWarning.textContent = '';
    
    if (percentage > 100) {
        els.weightFill.classList.add('danger');
        els.weightWarning.textContent = 'OVERWEIGHT! Exceeds Trailer GVWR.';
    } else if (percentage > 85) {
        els.weightFill.classList.add('warning');
        els.weightWarning.textContent = 'Warning: Approaching weight limit.';
    }
}

window.deleteWeight = (id) => {
    state.weight.items = state.weight.items.filter(i => i.id !== id);
    saveData();
    renderWeightList();
};

// --- Solar Logic ---
function setupSolar() {
    renderSolarList();
    
    els.addSolarBtn.onclick = () => {
        const name = els.solarAppliance.value;
        const watts = parseFloat(els.solarWatts.value);
        const hours = parseFloat(els.solarHours.value);
        
        if (name && watts && hours) {
            state.solar.push({ id: Date.now(), name, watts, hours });
            saveData();
            renderSolarList();
            els.solarAppliance.value = '';
            els.solarWatts.value = '';
            els.solarHours.value = '';
        }
    };
}

function renderSolarList() {
    els.solarList.innerHTML = '';
    let totalWh = 0;
    
    state.solar.forEach(item => {
        const dailyWh = item.watts * item.hours;
        totalWh += dailyWh;
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (${item.watts}W x ${item.hours}h)</span>
            <span>${dailyWh} Wh <button class="btn-delete" onclick="deleteSolar(${item.id})"><i class="fas fa-times"></i></button></span>
        `;
        els.solarList.appendChild(li);
    });
    
    // Calculations
    // 1. Panels: Total Wh / 5 sun hours / 0.8 efficiency
    const reqSolar = Math.ceil(totalWh / 5 / 0.8);
    
    // 2. Battery: Total Wh / 12V / 0.5 DOD (Depth of Discharge)
    const reqBattery = Math.ceil(totalWh / 12 / 0.5);
    
    els.totalWh.textContent = `${totalWh.toLocaleString()} Wh`;
    els.recPanels.textContent = `${reqSolar} W`;
    els.recBattery.textContent = `${reqBattery} Ah`;
}

window.deleteSolar = (id) => {
    state.solar = state.solar.filter(i => i.id !== id);
    saveData();
    renderSolarList();
};

// --- Insulation Logic ---
function setupInsulation() {
    renderLayerList();

    els.addLayerBtn.onclick = () => {
        const rPerInch = parseFloat(els.insulMaterial.value);
        const thickness = parseFloat(els.insulThickness.value);
        const materialName = els.insulMaterial.options[els.insulMaterial.selectedIndex].text.split('(')[0].trim();

        if (thickness > 0) {
            state.insulation.push({ id: Date.now(), name: materialName, rPerInch, thickness });
            saveData();
            renderLayerList();
            els.insulThickness.value = '';
        }
    };
}

function renderLayerList() {
    els.layerList.innerHTML = '';
    let totalR = 0;
    let totalThick = 0;

    state.insulation.forEach(item => {
        const itemR = item.rPerInch * item.thickness;
        totalR += itemR;
        totalThick += item.thickness;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (${item.thickness}")</span>
            <span>R-${itemR.toFixed(1)} <button class="btn-delete" onclick="deleteLayer(${item.id})"><i class="fas fa-times"></i></button></span>
        `;
        els.layerList.appendChild(li);
    });

    els.totalRValue.textContent = `R-${totalR.toFixed(1)}`;
    els.totalThickness.textContent = `${totalThick.toFixed(1)}"`;
}

window.deleteLayer = (id) => {
    state.insulation = state.insulation.filter(i => i.id !== id);
    saveData();
    renderLayerList();
};

// --- Water Logic ---
function setupWater() {
    renderWaterList();

    els.addWaterBtn.onclick = () => {
        const factor = parseFloat(els.waterActivity.value);
        const quantity = parseFloat(els.waterQuantity.value);
        const activityName = els.waterActivity.options[els.waterActivity.selectedIndex].text.split('(')[0].trim();

        if (quantity > 0) {
            state.water.push({ id: Date.now(), name: activityName, factor, quantity });
            saveData();
            renderWaterList();
            els.waterQuantity.value = '';
        }
    };
}

function renderWaterList() {
    els.waterList.innerHTML = '';
    let totalGal = 0;

    state.water.forEach(item => {
        const itemGal = item.factor * item.quantity;
        totalGal += itemGal;

        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} (x${item.quantity})</span>
            <span>${itemGal.toFixed(1)} Gal <button class="btn-delete" onclick="deleteWater(${item.id})"><i class="fas fa-times"></i></button></span>
        `;
        els.waterList.appendChild(li);
    });

    els.totalGallons.textContent = `${totalGal.toFixed(1)} Gal`;
    // Recommend grey tank size: 3 days of storage (excluding toilet if compost, but here we assume simple grey water calc)
    // Note: Toilet water usually goes to black tank or compost. 
    // For simplicity, we'll just show 3x daily usage as a safe buffer for a combined or grey tank.
    els.recGreyTank.textContent = `${(totalGal * 3).toFixed(0)} Gal`;
}

window.deleteWater = (id) => {
    state.water = state.water.filter(i => i.id !== id);
    saveData();
    renderWaterList();
};

// Helper
function formatMoney(amount) {
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- PDF Generation ---
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text("Tiny House Build Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    let yPos = 40;

    // 1. Summary
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text("1. Project Summary", 14, yPos);
    yPos += 10;

    const totalCost = state.budget.reduce((sum, item) => sum + item.cost, 0);
    const totalWeight = state.weight.items.reduce((sum, item) => sum + item.weight, 0) + state.weight.trailerWeight;
    const totalEnergy = state.solar.reduce((sum, item) => sum + (item.watts * item.hours), 0);

    const summaryData = [
        ['Total Estimated Cost', formatMoney(totalCost)],
        ['Total Estimated Weight', `${totalWeight.toLocaleString()} lbs`],
        ['Daily Energy Needs', `${totalEnergy.toLocaleString()} Wh`]
    ];

    doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80] }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;

    // 2. Budget Breakdown
    doc.text("2. Budget Breakdown", 14, yPos);
    yPos += 5;
    
    const budgetRows = state.budget.map(item => [item.name, item.category, formatMoney(item.cost)]);
    
    doc.autoTable({
        startY: yPos,
        head: [['Item', 'Category', 'Cost']],
        body: budgetRows,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // 3. Weight Breakdown
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    
    doc.text("3. Weight Breakdown", 14, yPos);
    yPos += 5;

    const weightRows = state.weight.items.map(item => [item.name, `${item.weight} lbs`]);
    weightRows.unshift(['Trailer Base Weight', `${state.weight.trailerWeight} lbs`]);

    doc.autoTable({
        startY: yPos,
        head: [['Item', 'Weight']],
        body: weightRows,
        theme: 'grid',
        headStyles: { fillColor: [230, 126, 34] },
        foot: [['Total Weight', `${totalWeight.toLocaleString()} lbs`]]
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // 4. Solar System
    if (yPos > 250) { doc.addPage(); yPos = 20; }

    doc.text("4. Solar System Sizing", 14, yPos);
    yPos += 5;

    const solarRows = state.solar.map(item => [item.name, `${item.watts} W`, `${item.hours} h`, `${item.watts * item.hours} Wh`]);
    const reqSolar = Math.ceil(totalEnergy / 5 / 0.8);
    const reqBattery = Math.ceil(totalEnergy / 12 / 0.5);

    doc.autoTable({
        startY: yPos,
        head: [['Appliance', 'Watts', 'Hours', 'Daily Wh']],
        body: solarRows,
        theme: 'grid',
        headStyles: { fillColor: [241, 196, 15] },
        foot: [['Total Daily Energy', '', '', `${totalEnergy.toLocaleString()} Wh`]]
    });

    yPos = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Recommended Solar Array: ${reqSolar} Watts`, 14, yPos);
    doc.text(`Recommended Battery Bank: ${reqBattery} Ah (@ 12V)`, 14, yPos + 5);
    yPos += 15;

    // 5. Insulation
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.text("5. Insulation Strategy", 14, yPos);
    yPos += 5;

    let totalR = 0;
    const insulRows = state.insulation.map(item => {
        const rVal = item.rPerInch * item.thickness;
        totalR += rVal;
        return [item.name, `${item.thickness}"`, `R-${rVal.toFixed(1)}`];
    });

    doc.autoTable({
        startY: yPos,
        head: [['Layer', 'Thickness', 'R-Value']],
        body: insulRows,
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182] },
        foot: [['Total R-Value', '', `R-${totalR.toFixed(1)}`]]
    });
    
    yPos = doc.lastAutoTable.finalY + 15;

    // 6. Water Usage
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.text("6. Water Usage Estimation", 14, yPos);
    yPos += 5;

    let totalGal = 0;
    const waterRows = state.water.map(item => {
        const gal = item.factor * item.quantity;
        totalGal += gal;
        return [item.name, item.quantity, `${gal.toFixed(1)} Gal`];
    });

    doc.autoTable({
        startY: yPos,
        head: [['Activity', 'Qty/Mins', 'Daily Gallons']],
        body: waterRows,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        foot: [['Total Daily Water', '', `${totalGal.toFixed(1)} Gal`]]
    });

    // Save
    doc.save('tiny-house-plan.pdf');
}

// Run
init();