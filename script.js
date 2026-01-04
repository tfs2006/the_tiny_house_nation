// --- State Management ---
const buildPhases = [
    {
        title: "Phase 1: Planning & Prep",
        tasks: [
            { id: "p1-1", text: "Determine budget and financing" },
            { id: "p1-2", text: "Select trailer size and type" },
            { id: "p1-3", text: "Create or buy floor plans" },
            { id: "p1-4", text: "Find a build site" },
            { id: "p1-5", text: "Obtain necessary permits/insurance" }
        ]
    },
    {
        title: "Phase 2: Trailer & Subfloor",
        tasks: [
            { id: "p2-1", text: "Level the trailer" },
            { id: "p2-2", text: "Install flashing and moisture barrier" },
            { id: "p2-3", text: "Frame subfloor" },
            { id: "p2-4", text: "Install subfloor insulation" },
            { id: "p2-5", text: "Install subfloor sheathing" }
        ]
    },
    {
        title: "Phase 3: Framing & Sheathing",
        tasks: [
            { id: "p3-1", text: "Frame walls" },
            { id: "p3-2", text: "Frame roof" },
            { id: "p3-3", text: "Install wall sheathing" },
            { id: "p3-4", text: "Install roof sheathing" },
            { id: "p3-5", text: "Wrap house (Tyvek/Housewrap)" }
        ]
    },
    {
        title: "Phase 4: Dry-In (Roof & Windows)",
        tasks: [
            { id: "p4-1", text: "Install roofing material" },
            { id: "p4-2", text: "Install windows and doors" },
            { id: "p4-3", text: "Flash windows and doors" }
        ]
    },
    {
        title: "Phase 5: Rough-Ins",
        tasks: [
            { id: "p5-1", text: "Rough-in electrical wiring" },
            { id: "p5-2", text: "Rough-in plumbing supply/drain" },
            { id: "p5-3", text: "Rough-in gas lines (if applicable)" },
            { id: "p5-4", text: "Install ventilation fans" }
        ]
    },
    {
        title: "Phase 6: Insulation & Interior",
        tasks: [
            { id: "p6-1", text: "Install wall/ceiling insulation" },
            { id: "p6-2", text: "Install vapor barrier (if needed)" },
            { id: "p6-3", text: "Install interior wall cladding" },
            { id: "p6-4", text: "Install flooring" }
        ]
    },
    {
        title: "Phase 7: Finish Work",
        tasks: [
            { id: "p7-1", text: "Install cabinets and fixtures" },
            { id: "p7-2", text: "Finish plumbing (sinks, toilet)" },
            { id: "p7-3", text: "Finish electrical (outlets, lights)" },
            { id: "p7-4", text: "Trim and paint" }
        ]
    }
];

const defaultState = {
    budget: [],
    weight: {
        trailerGvwr: 10000,
        trailerWeight: 1500,
        items: []
    },
    solar: [],
    insulation: [],
    water: [],
    checklist: [],
    floorplan: {
        length: 24,
        items: []
    }
};

// --- Profile Management ---
let profiles = JSON.parse(localStorage.getItem('thn_profiles')) || null;
let activeProfileId = null;
let state = null;

// Migration Logic: If old data exists but no profiles, migrate it
if (!profiles) {
    const oldData = JSON.parse(localStorage.getItem('thn_companion_data'));
    const initialData = oldData || JSON.parse(JSON.stringify(defaultState));
    
    profiles = {
        activeId: 'default',
        data: {
            'default': { name: 'My Tiny House', data: initialData }
        }
    };
    localStorage.setItem('thn_profiles', JSON.stringify(profiles));
}

// Load Active Profile
activeProfileId = profiles.activeId;
state = profiles.data[activeProfileId].data;

// --- DOM Elements ---
const els = {
    // Profile Controls
    profileSelect: document.getElementById('profileSelect'),
    newProfileBtn: document.getElementById('newProfileBtn'),
    deleteProfileBtn: document.getElementById('deleteProfileBtn'),

    navBtns: document.querySelectorAll('.nav-btn'),
    views: document.querySelectorAll('.view'),
    
    // Dashboard
    dashCost: document.getElementById('dash-total-cost'),
    dashWeight: document.getElementById('dash-total-weight'),
    dashEnergy: document.getElementById('dash-total-energy'),
    chartCanvas: document.getElementById('dashboardChart'),
    exportPdfBtn: document.getElementById('exportPdfBtn'),
    progressBar: document.getElementById('main-progress-bar'),
    progressText: document.getElementById('progress-text'),
    progressTip: document.getElementById('progress-tip'),
    toastContainer: document.getElementById('toast-container'),
    
    // Checklist
    checklistContainer: document.getElementById('checklist-container'),
    checklistPercent: document.getElementById('checklist-percent'),

    // Floor Plan
    floorplanCanvas: document.getElementById('floorplan-canvas'),
    planLength: document.getElementById('planLength'),
    resetPlanBtn: document.getElementById('resetPlanBtn'),
    canvasDims: document.getElementById('canvas-dims'),
    paletteItems: document.querySelectorAll('.palette-item'),

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
document.addEventListener('DOMContentLoaded', init);

function init() {
    try {
        // Re-query elements to ensure they exist
        refreshElements();

        setupProfiles(); // Initialize Profile Manager
        setupNavigation();
        setupChecklist();
        setupFloorPlan();
        setupBudget();
        setupWeight();
        setupSolar();
        setupInsulation();
        setupWater();
        
        loadStateToUI(); // Helper to populate UI from state

        // Setup Export
        if (els.exportPdfBtn) els.exportPdfBtn.onclick = generatePDF;

        updateDashboard();
    } catch (e) {
        console.error("Initialization error:", e);
    }
}

function loadStateToUI() {
    // Load saved inputs
    if (els.trailerGvwr) els.trailerGvwr.value = state.weight.trailerGvwr;
    if (els.trailerWeight) els.trailerWeight.value = state.weight.trailerWeight;
    
    // Re-render all lists
    renderBudgetTable();
    renderWeightList();
    renderSolarList();
    renderLayerList();
    renderWaterList();
    renderChecklist();
    renderFloorPlan();
    updateDashboard();
}

function refreshElements() {
    // Refresh critical collections
    els.navBtns = document.querySelectorAll('.nav-btn');
    els.views = document.querySelectorAll('.view');
    
    // Profile Elements
    els.profileSelect = document.getElementById('profileSelect');
    els.newProfileBtn = document.getElementById('newProfileBtn');
    els.deleteProfileBtn = document.getElementById('deleteProfileBtn');

    // Floor Plan Elements
    els.floorplanCanvas = document.getElementById('floorplan-canvas');
    els.planLength = document.getElementById('planLength');
    els.resetPlanBtn = document.getElementById('resetPlanBtn');
    els.canvasDims = document.getElementById('canvas-dims');
    els.paletteItems = document.querySelectorAll('.palette-item');

    // Floor Plan Properties
    els.propPanel = document.getElementById('item-properties');
    els.propWidth = document.getElementById('prop-width');
    els.propHeight = document.getElementById('prop-height');
    els.propRotate = document.getElementById('prop-rotate');
    els.propDelete = document.getElementById('prop-delete');
}

let selectedItemId = null;

function saveData() {
    // Update current profile data
    profiles.data[activeProfileId].data = state;
    localStorage.setItem('thn_profiles', JSON.stringify(profiles));
    
    updateDashboard();
    
    // Flash save status
    const status = document.getElementById('saveStatus');
    if (status) {
        status.style.opacity = '1';
        setTimeout(() => status.style.opacity = '0.7', 500);
    }
}

// --- Profile Logic ---
function setupProfiles() {
    renderProfileSelect();

    els.profileSelect.onchange = (e) => {
        switchProfile(e.target.value);
    };

    els.newProfileBtn.onclick = () => {
        const name = prompt("Enter a name for your new build profile:");
        if (name) {
            const newId = 'profile_' + Date.now();
            profiles.data[newId] = {
                name: name,
                data: JSON.parse(JSON.stringify(defaultState))
            };
            switchProfile(newId);
        }
    };

    els.deleteProfileBtn.onclick = () => {
        if (Object.keys(profiles.data).length <= 1) {
            alert("You must have at least one profile.");
            return;
        }
        
        if (confirm(`Are you sure you want to delete "${profiles.data[activeProfileId].name}"? This cannot be undone.`)) {
            delete profiles.data[activeProfileId];
            // Switch to first available
            const nextId = Object.keys(profiles.data)[0];
            switchProfile(nextId);
        }
    };
}

function renderProfileSelect() {
    if (!els.profileSelect) return;
    els.profileSelect.innerHTML = '';
    Object.keys(profiles.data).forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = profiles.data[id].name;
        if (id === activeProfileId) option.selected = true;
        els.profileSelect.appendChild(option);
    });
}

function switchProfile(id) {
    activeProfileId = id;
    profiles.activeId = id;
    state = profiles.data[id].data;
    
    // Ensure state structure is up to date (migrations)
    if (!state.checklist) state.checklist = [];
    
    localStorage.setItem('thn_profiles', JSON.stringify(profiles));
    
    renderProfileSelect();
    loadStateToUI();
    showToast(`Switched to ${profiles.data[id].name}`);
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

// --- Checklist Logic ---
function setupChecklist() {
    renderChecklist();
}

function renderChecklist() {
    if (!els.checklistContainer) return;
    
    els.checklistContainer.innerHTML = '';
    let totalTasks = 0;
    let completedTasks = 0;

    // Ensure state.checklist exists (migration for old saves)
    if (!state.checklist) state.checklist = [];

    buildPhases.forEach((phase, index) => {
        const phaseDiv = document.createElement('div');
        phaseDiv.className = 'checklist-phase';
        
        // Calculate phase progress
        const phaseTotal = phase.tasks.length;
        const phaseCompleted = phase.tasks.filter(t => state.checklist.includes(t.id)).length;
        totalTasks += phaseTotal;
        completedTasks += phaseCompleted;

        const isExpanded = index === 0 || phaseCompleted > 0; // Auto-expand first or active phases

        phaseDiv.innerHTML = `
            <div class="checklist-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                <h3>${phase.title}</h3>
                <span class="phase-progress">${phaseCompleted}/${phaseTotal}</span>
            </div>
            <ul class="checklist-tasks" style="display: ${isExpanded ? 'block' : 'none'}">
                ${phase.tasks.map(task => {
                    const isDone = state.checklist.includes(task.id);
                    return `
                        <li class="checklist-item ${isDone ? 'completed' : ''}" onclick="toggleTask('${task.id}')">
                            <div class="custom-checkbox">
                                <i class="fas fa-check"></i>
                            </div>
                            <span>${task.text}</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        els.checklistContainer.appendChild(phaseDiv);
    });

    // Update Header Stats
    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    if (els.checklistPercent) {
        els.checklistPercent.textContent = `${percent}% Complete`;
    }
}

window.toggleTask = (id) => {
    if (!state.checklist) state.checklist = [];
    
    if (state.checklist.includes(id)) {
        state.checklist = state.checklist.filter(t => t !== id);
    } else {
        state.checklist.push(id);
        // Random confetti for fun
        if (typeof confetti !== 'undefined' && Math.random() > 0.7) {
             confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#5c946e', '#fdcb6e']
            });
        }
    }
    saveData();
    renderChecklist();
};

// --- Floor Plan Logic ---
function setupFloorPlan() {
    if (!els.floorplanCanvas) return;

    // Initialize State if missing
    if (!state.floorplan) {
        state.floorplan = { length: 24, items: [] };
    }

    // Setup Canvas Dimensions
    const updateCanvasSize = () => {
        const length = parseInt(els.planLength.value) || 24;
        state.floorplan.length = length;
        saveData();
        renderFloorPlan();
    };

    els.planLength.onchange = updateCanvasSize;
    els.resetPlanBtn.onclick = () => {
        if (confirm("Clear all furniture from the plan?")) {
            state.floorplan.items = [];
            saveData();
            renderFloorPlan();
        }
    };

    // Drag & Drop - Palette to Canvas
    els.paletteItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', item.dataset.type);
            e.dataTransfer.setData('text', item.innerText);
        });
    });

    els.floorplanCanvas.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
    });

    els.floorplanCanvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const text = e.dataTransfer.getData('text');
        
        // Calculate drop position relative to canvas
        const rect = els.floorplanCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (type) {
            addFurnitureItem(type, text, x, y);
        }
    });

    // Property Panel Listeners
    if (els.propWidth) {
        els.propWidth.onchange = () => {
            if (!selectedItemId) return;
            const item = state.floorplan.items.find(i => i.id === selectedItemId);
            if (item) {
                item.width = parseFloat(els.propWidth.value) * 20; // ft to px
                saveData();
                renderFloorPlan();
            }
        };
    }
    if (els.propHeight) {
        els.propHeight.onchange = () => {
            if (!selectedItemId) return;
            const item = state.floorplan.items.find(i => i.id === selectedItemId);
            if (item) {
                item.height = parseFloat(els.propHeight.value) * 20; // ft to px
                saveData();
                renderFloorPlan();
            }
        };
    }
    if (els.propRotate) {
        els.propRotate.onclick = () => {
            if (!selectedItemId) return;
            const item = state.floorplan.items.find(i => i.id === selectedItemId);
            if (item) {
                item.rotation = (item.rotation + 90) % 360;
                saveData();
                renderFloorPlan();
            }
        };
    }
    if (els.propDelete) {
        els.propDelete.onclick = () => {
            if (!selectedItemId) return;
            if (confirm("Delete selected item?")) {
                state.floorplan.items = state.floorplan.items.filter(i => i.id !== selectedItemId);
                selectItem(null);
                saveData();
                renderFloorPlan();
            }
        };
    }
}

function addFurnitureItem(type, text, x, y) {
    const id = Date.now();
    // Default sizes (approx pixels based on 20px/ft)
    let width = 60; 
    let height = 60;

    switch(type) {
        case 'bed-queen': width = 100; height = 133; break; // 5x6.6 ft
        case 'bed-twin': width = 76; height = 133; break; // 3.8x6.6 ft
        case 'sofa': width = 120; height = 60; break; // 6x3 ft
        case 'kitchen': width = 120; height = 40; break; // 6x2 ft
        case 'shower': width = 60; height = 60; break; // 3x3 ft
        case 'toilet': width = 40; height = 40; break; // 2x2 ft
        case 'table': width = 80; height = 60; break; // 4x3 ft
        case 'stairs': width = 60; height = 100; break; // 3x5 ft
        case 'window': width = 60; height = 10; break; // 3ft wide, thin
        case 'door': width = 60; height = 60; break; // 3x3 swing
    }

    state.floorplan.items.push({ id, type, text, x, y, width, height, rotation: 0 });
    saveData();
    renderFloorPlan();
}

function renderFloorPlan() {
    if (!els.floorplanCanvas) return;

    // 1. Set Canvas Size (20px per ft)
    const pxPerFt = 20;
    const widthPx = 8.5 * pxPerFt; // Fixed width 8.5ft
    const lengthPx = state.floorplan.length * pxPerFt;

    els.floorplanCanvas.style.width = `${lengthPx}px`;
    els.floorplanCanvas.style.height = `${widthPx}px`;
    els.canvasDims.textContent = `8.5' x ${state.floorplan.length}'`;
    els.planLength.value = state.floorplan.length;

    // 2. Render Wheel Wells (Standard dual axle placement approx 60% back)
    els.floorplanCanvas.innerHTML = ''; // Clear current
    
    const wheelWellX = lengthPx * 0.6;
    const wheelWellWidth = 5 * pxPerFt;
    const wheelWellHeight = 1 * pxPerFt;

    // Top Wheel Well
    const ww1 = document.createElement('div');
    ww1.className = 'wheel-well';
    ww1.style.width = `${wheelWellWidth}px`;
    ww1.style.height = `${wheelWellHeight}px`;
    ww1.style.left = `${wheelWellX}px`;
    ww1.style.top = '0px';
    ww1.textContent = "Wheel Well";
    els.floorplanCanvas.appendChild(ww1);

    // Bottom Wheel Well
    const ww2 = document.createElement('div');
    ww2.className = 'wheel-well';
    ww2.style.width = `${wheelWellWidth}px`;
    ww2.style.height = `${wheelWellHeight}px`;
    ww2.style.left = `${wheelWellX}px`;
    ww2.style.bottom = '0px';
    ww2.textContent = "Wheel Well";
    els.floorplanCanvas.appendChild(ww2);
    
    state.floorplan.items.forEach(item => {
        const el = document.createElement('div');
        el.className = `furniture-item ${item.type}`;
        if (item.id === selectedItemId) el.classList.add('selected');

        el.textContent = item.text;
        el.style.width = `${item.width}px`;
        el.style.height = `${item.height}px`;
        el.style.left = `${item.x}px`;
        el.style.top = `${item.y}px`;
        el.style.transform = `rotate(${item.rotation}deg)`;
        
        // Interaction Logic
        el.onmousedown = (e) => {
            e.stopPropagation();
            selectItem(item.id);
            dragElement(e, item.id, el);
        };
        el.ontouchstart = (e) => {
            e.stopPropagation();
            selectItem(item.id);
            dragElement(e, item.id, el);
        };

        el.ondblclick = (e) => {
            e.stopPropagation();
            item.rotation = (item.rotation + 90) % 360;
            saveData();
            renderFloorPlan();
            updatePropertiesPanel();
        };

        els.floorplanCanvas.appendChild(el);
    });

    // Click on canvas to deselect
    els.floorplanCanvas.onclick = (e) => {
        if (e.target === els.floorplanCanvas) {
            selectItem(null);
        }
    };
}

function selectItem(id) {
    selectedItemId = id;
    renderFloorPlan();
    updatePropertiesPanel();
}

function updatePropertiesPanel() {
    if (!selectedItemId || !els.propPanel) {
        if (els.propPanel) els.propPanel.style.display = 'none';
        return;
    }

    const item = state.floorplan.items.find(i => i.id === selectedItemId);
    if (!item) {
        selectItem(null);
        return;
    }

    els.propPanel.style.display = 'block';
    // Convert px to ft for display (20px = 1ft)
    els.propWidth.value = (item.width / 20).toFixed(1);
    els.propHeight.value = (item.height / 20).toFixed(1);
}

function dragElement(e, id, el) {
    if (e.type === 'mousedown') e.preventDefault(); // Prevent text selection
    
    const item = state.floorplan.items.find(i => i.id === id);
    if (!item) return;

    // Handle both mouse and touch coordinates
    const getClientX = (evt) => evt.touches ? evt.touches[0].clientX : evt.clientX;
    const getClientY = (evt) => evt.touches ? evt.touches[0].clientY : evt.clientY;

    let startX = getClientX(e);
    let startY = getClientY(e);

    const onMove = (evt) => {
        if (evt.type === 'mousemove') evt.preventDefault();
        
        const currentX = getClientX(evt);
        const currentY = getClientY(evt);

        const dx = currentX - startX;
        const dy = currentY - startY;

        startX = currentX;
        startY = currentY;

        item.x += dx;
        item.y += dy;
        
        // Snap to Grid (10px = 6 inches)
        const snap = 10;
        item.x = Math.round(item.x / snap) * snap;
        item.y = Math.round(item.y / snap) * snap;

        // Update DOM directly for performance
        if (el) {
             el.style.left = `${item.x}px`;
             el.style.top = `${item.y}px`;
        }
    };

    const onEnd = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        saveData();
        renderFloorPlan(); // Snap to final state
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
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
    updateProgress();
}

function updateProgress() {
    let score = 0;
    const tips = [];

    // 1. Budget Started
    if (state.budget.length > 0) { score += 20; } 
    else { tips.push("Start by adding items to your budget!"); }

    // 2. Weight Tracked
    if (state.weight.items.length > 0) { score += 20; }
    else { tips.push("Don't forget to track material weights."); }

    // 3. Solar Planned
    if (state.solar.length > 0) { score += 20; }
    else { tips.push("Planning off-grid? Size your solar system."); }

    // 4. Insulation
    if (state.insulation.length > 0) { score += 20; }
    else { tips.push("Check your R-Values in the Insulation tab."); }

    // 5. Water
    if (state.water.length > 0) { score += 20; }
    else { tips.push("Estimate your water usage for tank sizing."); }

    // Update UI
    if (els.progressBar) {
        els.progressBar.style.width = `${score}%`;
        els.progressText.textContent = `${score}% Ready`;
        
        if (score === 100) {
            els.progressTip.textContent = "You're all set! Ready to build.";
            els.exportPdfBtn.classList.add('btn-pulse');
        } else {
            els.progressTip.textContent = tips[0] || "Keep going!";
            els.exportPdfBtn.classList.remove('btn-pulse');
        }
    }
}

function showToast(message, type = 'success') {
    if (!els.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="toast-content">
            <strong>${type === 'success' ? 'Awesome!' : 'Note'}</strong>
            <p>${message}</p>
        </div>
    `;
showToast(`Added ${name} to budget!`);
        
    els.toastContainer.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOutRight 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
    
    if (state.budget.length === 0) {
        els.budgetTable.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-light); padding: 20px;">No budget items added yet. Start by adding your expenses above.</td></tr>';
    } else {
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
    }
    
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
            showToast(`Tracked weight for ${name}`);
            els.weightItemName.value = '';
            els.weightItemLbs.value = '';
        }
    };
}

function renderWeightList() {
    els.weightList.innerHTML = '';
    let itemsWeight = 0;
    
    if (state.weight.items.length === 0) {
        els.weightList.innerHTML = '<li style="justify-content:center; color:var(--text-light);">No items added. Add materials to track weight.</li>';
    } else {
        state.weight.items.forEach(item => {
            itemsWeight += item.weight;
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.name}</span>
                <span>${item.weight} lbs <button class="btn-delete" onclick="deleteWeight(${item.id})"><i class="fas fa-times"></i></button></span>
            `;
            els.weightList.appendChild(li);
        });
    }
    
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
            showToast(`Added ${name} to solar plan`);
            els.solarAppliance.value = '';
            els.solarWatts.value = '';
            els.solarHours.value = '';
        }
    };
}

function renderSolarList() {
    els.solarList.innerHTML = '';
    let totalWh = 0;
    
    if (state.solar.length === 0) {
        els.solarList.innerHTML = '<li style="justify-content:center; color:var(--text-light);">No appliances added. Add items to calculate solar needs.</li>';
    } else {
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
    }
    
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
            showToast(`Added ${materialName} layer`);
            els.insulThickness.value = '';
        }
    };
}

function renderLayerList() {
    els.layerList.innerHTML = '';
    let totalR = 0;
    let totalThick = 0;

    if (state.insulation.length === 0) {
        els.layerList.innerHTML = '<li style="justify-content:center; color:var(--text-light);">No insulation layers added. Build your wall assembly above.</li>';
    } else {
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
    }

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
            showToast(`Added ${activityName}`);
            els.waterQuantity.value = '';
        }
    };
}

function renderWaterList() {
    els.waterList.innerHTML = '';
    let totalGal = 0;

    if (state.water.length === 0) {
        els.waterList.innerHTML = '<li style="justify-content:center; color:var(--text-light);">No water activities added. Estimate your daily usage above.</li>';
    } else {
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
    }

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
    // Celebration!
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#5c946e', '#fdcb6e', '#74b9ff']
        });
    }
    showToast("Generating your report...", "info");

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
    
    // Checklist Stats
    let totalTasks = 0;
    let completedTasks = 0;
    if (state.checklist) {
        buildPhases.forEach(phase => {
            totalTasks += phase.tasks.length;
            completedTasks += phase.tasks.filter(t => state.checklist.includes(t.id)).length;
        });
    }
    const buildProgress = totalTasks === 0 ? "0%" : `${Math.round((completedTasks / totalTasks) * 100)}%`;

    const summaryData = [
        ['Total Estimated Cost', formatMoney(totalCost)],
        ['Total Estimated Weight', `${totalWeight.toLocaleString()} lbs`],
        ['Daily Energy Needs', `${totalEnergy.toLocaleString()} Wh`],
        ['Build Progress', buildProgress]
    ];

    doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80] }
    });
    
    yPos = doc.lastAutoTable.finalY + 15;

    // 2. Build Checklist
    doc.text("2. Build Checklist Status", 14, yPos);
    yPos += 5;

    const checklistRows = [];
    buildPhases.forEach(phase => {
        const phaseTotal = phase.tasks.length;
        const phaseDone = phase.tasks.filter(t => state.checklist.includes(t.id)).length;
        checklistRows.push([phase.title, `${phaseDone}/${phaseTotal} Tasks Completed`]);
    });

    doc.autoTable({
        startY: yPos,
        head: [['Phase', 'Status']],
        body: checklistRows,
        theme: 'grid',
        headStyles: { fillColor: [92, 148, 110] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // 3. Budget Breakdown
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.text("3. Budget Breakdown", 14, yPos);
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

    // 4. Weight Breakdown
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    
    doc.text("4. Weight Breakdown", 14, yPos);
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

    // 5. Floor Plan Inventory
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.text("5. Floor Plan Inventory", 14, yPos);
    yPos += 5;

    const furnitureCounts = {};
    if (state.floorplan && state.floorplan.items) {
        state.floorplan.items.forEach(item => {
            furnitureCounts[item.text] = (furnitureCounts[item.text] || 0) + 1;
        });
    }
    
    const floorplanRows = Object.keys(furnitureCounts).map(key => [key, furnitureCounts[key]]);
    floorplanRows.unshift(['Trailer Length', `${state.floorplan ? state.floorplan.length : 24} ft`]);

    doc.autoTable({
        startY: yPos,
        head: [['Item', 'Count/Size']],
        body: floorplanRows,
        theme: 'grid',
        headStyles: { fillColor: [108, 92, 231] }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // 6. Solar System
    if (yPos > 250) { doc.addPage(); yPos = 20; }

    doc.text("6. Solar System Sizing", 14, yPos);
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

    // 7. Insulation
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14);
    doc.text("7. Insulation Strategy", 14, yPos);
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

    // 8. Water Usage
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    doc.text("8. Water Usage Estimation", 14, yPos);
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

// Run - Event listener added at top
// init();