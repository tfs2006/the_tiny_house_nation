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
        setupTipOfDay();
        
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
            navigateToTab(btn.dataset.tab);
        });
    });

    // Clickable dashboard cards
    document.querySelectorAll('[data-goto]').forEach(el => {
        el.addEventListener('click', () => {
            navigateToTab(el.dataset.goto);
        });
    });
}

function navigateToTab(tabId) {
    // Update Buttons
    els.navBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        if (b.dataset.tab === tabId) {
            b.classList.add('active');
            b.setAttribute('aria-selected', 'true');
        }
    });
    
    // Update Views
    els.views.forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(tabId);
    if (targetView) targetView.classList.add('active');
    
    if (tabId === 'dashboard') {
        updateDashboard();
    }
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
    
    // Phase icons for visual appeal
    const phaseIcons = ['📋', '🏗️', '🔨', '🏠', '⚡', '🧱', '✨'];

    buildPhases.forEach((phase, index) => {
        const phaseDiv = document.createElement('div');
        phaseDiv.className = 'checklist-phase';
        
        // Calculate phase progress
        const phaseTotal = phase.tasks.length;
        const phaseCompleted = phase.tasks.filter(t => state.checklist.includes(t.id)).length;
        totalTasks += phaseTotal;
        completedTasks += phaseCompleted;
        
        const isPhaseComplete = phaseCompleted === phaseTotal;
        const isExpanded = index === 0 || (phaseCompleted > 0 && !isPhaseComplete);
        
        if (isPhaseComplete) {
            phaseDiv.classList.add('phase-complete');
        }
        if (isExpanded) {
            phaseDiv.classList.add('expanded');
        }

        phaseDiv.innerHTML = `
            <div class="checklist-header" data-phase="${index}">
                <h3>
                    <span class="phase-icon">${phaseIcons[index] || '📌'}</span>
                    ${phase.title}
                </h3>
                <div class="phase-meta">
                    <span class="phase-progress ${isPhaseComplete ? 'complete' : ''}">${phaseCompleted}/${phaseTotal}</span>
                    <i class="fas fa-chevron-down expand-icon"></i>
                </div>
            </div>
            <ul class="checklist-tasks" style="display: ${isExpanded ? 'block' : 'none'}">
                ${phase.tasks.map(task => {
                    const isDone = state.checklist.includes(task.id);
                    return `
                        <li class="checklist-item ${isDone ? 'completed' : ''}" data-task="${task.id}">
                            <div class="custom-checkbox">
                                <i class="fas fa-check"></i>
                            </div>
                            <span>${task.text}</span>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        
        // Add click handlers
        const header = phaseDiv.querySelector('.checklist-header');
        const taskList = phaseDiv.querySelector('.checklist-tasks');
        
        header.addEventListener('click', () => {
            const isHidden = taskList.style.display === 'none';
            taskList.style.display = isHidden ? 'block' : 'none';
            phaseDiv.classList.toggle('expanded', isHidden);
        });
        
        phaseDiv.querySelectorAll('.checklist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = item.getAttribute('data-task');
                if (taskId) {
                    toggleTask(taskId);
                }
            });
        });
        
        els.checklistContainer.appendChild(phaseDiv);
    });

    // Update Header Stats
    const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    if (els.checklistPercent) {
        els.checklistPercent.textContent = `${percent}%`;
    }
    
    // Update ring progress
    const ringFill = document.getElementById('checklist-ring-fill');
    if (ringFill) {
        ringFill.style.strokeDasharray = `${percent}, 100`;
    }
}

function toggleTask(id) {
    if (!id) return;
    if (!state.checklist) state.checklist = [];
    
    if (state.checklist.includes(id)) {
        state.checklist = state.checklist.filter(t => t !== id);
    } else {
        state.checklist.push(id);
        
        // Check if we just completed a phase
        const completedPhase = buildPhases.find(phase => {
            const phaseTasks = phase.tasks.map(t => t.id);
            return phaseTasks.includes(id) && phaseTasks.every(tid => state.checklist.includes(tid));
        });
        
        if (completedPhase) {
            // Big celebration for completing a phase!
            if (typeof confetti !== 'undefined') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#5c946e', '#74b9ff', '#fdcb6e', '#2ecc71']
                });
            }
            showToast(`🎉 ${completedPhase.title} Complete!`, 'success');
        } else if (typeof confetti !== 'undefined' && Math.random() > 0.7) {
            // Random small confetti for regular tasks
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
}

// --- Floor Plan Logic ---
let floorplanZoom = 1;

function setupFloorPlan() {
    if (!els.floorplanCanvas) return;

    // Initialize State if missing
    if (!state.floorplan) {
        state.floorplan = { length: 24, items: [] };
    }

    // Setup Canvas Dimensions
    const updateCanvasSize = () => {
        const length = Math.max(10, Math.min(40, parseInt(els.planLength.value) || 24));
        els.planLength.value = length;
        state.floorplan.length = length;
        saveData();
        renderFloorPlan();
    };

    els.planLength.onchange = updateCanvasSize;
    
    // Length +/- buttons
    const lengthMinus = document.getElementById('lengthMinus');
    const lengthPlus = document.getElementById('lengthPlus');
    if (lengthMinus) {
        lengthMinus.onclick = () => {
            els.planLength.value = Math.max(10, parseInt(els.planLength.value) - 2);
            updateCanvasSize();
        };
    }
    if (lengthPlus) {
        lengthPlus.onclick = () => {
            els.planLength.value = Math.min(40, parseInt(els.planLength.value) + 2);
            updateCanvasSize();
        };
    }

    // Zoom Controls
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const zoomFit = document.getElementById('zoomFit');
    const zoomLevel = document.getElementById('zoomLevel');
    const scaler = document.getElementById('canvas-scaler');

    const updateZoom = () => {
        if (scaler) scaler.style.transform = `scale(${floorplanZoom})`;
        if (zoomLevel) zoomLevel.textContent = `${Math.round(floorplanZoom * 100)}%`;
    };

    if (zoomIn) {
        zoomIn.onclick = () => {
            floorplanZoom = Math.min(2, floorplanZoom + 0.25);
            updateZoom();
        };
    }
    if (zoomOut) {
        zoomOut.onclick = () => {
            floorplanZoom = Math.max(0.5, floorplanZoom - 0.25);
            updateZoom();
        };
    }
    if (zoomFit) {
        zoomFit.onclick = () => {
            floorplanZoom = 1;
            updateZoom();
        };
    }

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
            // Get just the text without the icon
            const text = item.innerText.trim();
            e.dataTransfer.setData('text', text);
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
        case 'closet': width = 40; height = 80; break; // 2x4 ft
        case 'sofa': width = 120; height = 60; break; // 6x3 ft
        case 'table': width = 80; height = 60; break; // 4x3 ft
        case 'desk': width = 80; height = 40; break; // 4x2 ft
        case 'kitchen': width = 120; height = 48; break; // 6x2.4 ft
        case 'fridge': width = 40; height = 50; break; // 2x2.5 ft
        case 'stove': width = 50; height = 50; break; // 2.5x2.5 ft
        case 'shower': width = 60; height = 60; break; // 3x3 ft
        case 'toilet': width = 36; height = 50; break; // 1.8x2.5 ft
        case 'vanity': width = 60; height = 40; break; // 3x2 ft
        case 'stairs': width = 60; height = 100; break; // 3x5 ft
        case 'window': width = 60; height = 12; break; // 3ft wide, thin
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
    if (els.canvasDims) els.canvasDims.textContent = `8.5' × ${state.floorplan.length}'`;
    if (els.planLength) els.planLength.value = state.floorplan.length;

    // 2. Clear and render structural elements
    els.floorplanCanvas.innerHTML = '';
    
    // Wheel Wells (Standard dual axle placement approx 60-70% back)
    const wheelWellX = lengthPx * 0.65;
    const wheelWellWidth = 4 * pxPerFt;
    const wheelWellHeight = 1.5 * pxPerFt;

    // Top Wheel Well
    const ww1 = document.createElement('div');
    ww1.className = 'wheel-well';
    ww1.style.width = `${wheelWellWidth}px`;
    ww1.style.height = `${wheelWellHeight}px`;
    ww1.style.left = `${wheelWellX}px`;
    ww1.style.top = '0px';
    ww1.innerHTML = '<span>⚙</span>';
    els.floorplanCanvas.appendChild(ww1);

    // Bottom Wheel Well
    const ww2 = document.createElement('div');
    ww2.className = 'wheel-well';
    ww2.style.width = `${wheelWellWidth}px`;
    ww2.style.height = `${wheelWellHeight}px`;
    ww2.style.left = `${wheelWellX}px`;
    ww2.style.bottom = '0px';
    ww2.innerHTML = '<span>⚙</span>';
    els.floorplanCanvas.appendChild(ww2);
    
    // Render furniture items
    state.floorplan.items.forEach(item => {
        const el = document.createElement('div');
        el.className = `furniture-item ${item.type}`;
        if (item.id === selectedItemId) el.classList.add('selected');

        // Clean display text (remove icon prefixes if present)
        const displayText = item.text.replace(/^[^\w]+/, '').trim();
        el.textContent = displayText;
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
        
        // Update progress badge
        const progressBadge = document.querySelector('.progress-badge');
        if (progressBadge) {
            progressBadge.textContent = `${score}%`;
            progressBadge.className = 'progress-badge';
            if (score >= 100) progressBadge.classList.add('complete');
            else if (score >= 60) progressBadge.classList.add('good');
        }
        
        // Update milestones
        const milestones = document.querySelectorAll('.milestone');
        milestones.forEach(m => {
            const threshold = parseInt(m.dataset.percent || 0);
            m.classList.toggle('reached', score >= threshold);
        });
        
        if (score === 100) {
            if (els.progressTip) els.progressTip.textContent = "You're all set! Ready to build.";
            if (els.exportPdfBtn) els.exportPdfBtn.classList.add('btn-pulse');
        } else {
            if (els.progressTip) els.progressTip.textContent = tips[0] || "Keep going!";
            if (els.exportPdfBtn) els.exportPdfBtn.classList.remove('btn-pulse');
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
        showToast(`Added "${name}" to budget!`, 'success');
        
        els.budgetForm.reset();
        els.budgetModal.style.display = 'none';
    };
}

function renderBudgetTable() {
    els.budgetTable.innerHTML = '';
    let total = 0;
    
    if (state.budget.length === 0) {
        els.budgetTable.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="empty-state-content">
                        <i class="fas fa-receipt fa-3x"></i>
                        <h4>No budget items yet</h4>
                        <p>Click "Add Item" to start tracking your build costs</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        // Group by category for subtotals
        const categories = {};
        state.budget.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = { items: [], total: 0 };
            }
            categories[item.category].items.push(item);
            categories[item.category].total += item.cost;
            total += item.cost;
        });
        
        // Render grouped
        Object.keys(categories).sort().forEach(category => {
            const cat = categories[category];
            
            // Category header
            const headerTr = document.createElement('tr');
            headerTr.className = 'category-header';
            headerTr.innerHTML = `
                <td colspan="2"><strong>${category}</strong></td>
                <td colspan="2" class="category-subtotal">${formatMoney(cat.total)}</td>
            `;
            els.budgetTable.appendChild(headerTr);
            
            // Items in category
            cat.items.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding-left: 24px;">${item.name}</td>
                    <td><span class="badge">${item.category}</span></td>
                    <td>${formatMoney(item.cost)}</td>
                    <td><button class="btn-delete" onclick="deleteBudget(${item.id})"><i class="fas fa-trash"></i></button></td>
                `;
                els.budgetTable.appendChild(tr);
            });
        });
    }
    
    els.budgetTotal.textContent = formatMoney(total);
}

window.deleteBudget = (id) => {
    const item = state.budget.find(i => i.id === id);
    if (item) {
        state.budget = state.budget.filter(i => i.id !== id);
        saveData();
        renderBudgetTable();
        
        showUndoToast(`Removed "${item.name}"`, () => {
            state.budget.push(item);
            saveData();
            renderBudgetTable();
            showToast(`Restored "${item.name}"`, 'success');
        });
    }
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

    // Weight preset buttons
    document.querySelectorAll('.weight-preset').forEach(btn => {
        btn.onclick = () => {
            const name = btn.dataset.name;
            const weight = parseFloat(btn.dataset.weight);
            
            state.weight.items.push({ id: Date.now(), name, weight });
            saveData();
            renderWeightList();
            showToast(`Added ${name} (${weight} lbs)`);
        };
    });
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
    const payload = gvwr - state.weight.trailerWeight;
    const percentage = Math.min(100, (totalWeight / gvwr) * 100);
    
    els.payloadDisplay.textContent = `${totalWeight.toLocaleString()} / ${gvwr.toLocaleString()} lbs`;
    els.weightFill.style.width = `${percentage}%`;
    
    // Update percentage display
    const weightPercentEl = document.getElementById('weightPercent');
    if (weightPercentEl) {
        weightPercentEl.textContent = `${Math.round(percentage)}%`;
    }
    
    els.weightFill.className = 'meter-fill';
    els.weightWarning.textContent = '';
    
    if (percentage > 100) {
        els.weightFill.classList.add('danger');
        els.weightWarning.textContent = '⚠️ OVERWEIGHT! Exceeds Trailer GVWR.';
        els.weightWarning.style.color = 'var(--danger)';
    } else if (percentage > 85) {
        els.weightFill.classList.add('warning');
        els.weightWarning.textContent = '⚠️ Warning: Approaching weight limit.';
        els.weightWarning.style.color = 'var(--warning)';
    }
}

window.deleteWeight = (id) => {
    const item = state.weight.items.find(i => i.id === id);
    if (item) {
        state.weight.items = state.weight.items.filter(i => i.id !== id);
        saveData();
        renderWeightList();
        
        showUndoToast(`Removed "${item.name}"`, () => {
            state.weight.items.push(item);
            saveData();
            renderWeightList();
            showToast(`Restored "${item.name}"`, 'success');
        });
    }
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

    // Solar preset buttons
    document.querySelectorAll('.preset-btn[data-watts]').forEach(btn => {
        btn.onclick = () => {
            const name = btn.dataset.name;
            const watts = parseFloat(btn.dataset.watts);
            const hours = parseFloat(btn.dataset.hours);
            
            state.solar.push({ id: Date.now(), name, watts, hours });
            saveData();
            renderSolarList();
            showToast(`Added ${name}`);
        };
    });
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
    const item = state.solar.find(i => i.id === id);
    if (item) {
        state.solar = state.solar.filter(i => i.id !== id);
        saveData();
        renderSolarList();
        
        showUndoToast(`Removed "${item.name}"`, () => {
            state.solar.push(item);
            saveData();
            renderSolarList();
            showToast(`Restored "${item.name}"`, 'success');
        });
    }
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
    const item = state.insulation.find(i => i.id === id);
    if (item) {
        state.insulation = state.insulation.filter(i => i.id !== id);
        saveData();
        renderLayerList();
        
        showUndoToast(`Removed "${item.name}"`, () => {
            state.insulation.push(item);
            saveData();
            renderLayerList();
            showToast(`Restored "${item.name}"`, 'success');
        });
    }
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
    const item = state.water.find(i => i.id === id);
    if (item) {
        state.water = state.water.filter(i => i.id !== id);
        saveData();
        renderWaterList();
        
        showUndoToast(`Removed "${item.name}"`, () => {
            state.water.push(item);
            saveData();
            renderWaterList();
            showToast(`Restored "${item.name}"`, 'success');
        });
    }
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

// --- Tip of the Day ---
const buildTips = [
    "Consider using SIPs (Structural Insulated Panels) for faster assembly and better insulation.",
    "Always add 10-15% contingency to your budget for unexpected expenses.",
    "Position your heaviest items (water tank, appliances) over the axles for better towing balance.",
    "Use marine-grade plywood in wet areas for better moisture resistance.",
    "Install a whole-house water shut-off valve for easy winterization.",
    "Consider a split A/C system - they're more efficient than window units for tiny spaces.",
    "Plan for vertical storage - walls are valuable real estate in a tiny house!",
    "Use LED lighting throughout - they produce less heat and use 75% less energy.",
    "Install a composting toilet to eliminate the need for a black water tank.",
    "Consider propane for cooking and water heating - it's more efficient off-grid.",
    "Build your loft at least 3 feet tall to sit up comfortably in bed.",
    "Use pocket doors and barn doors to save floor space.",
    "Install a vent fan in the bathroom AND kitchen to control moisture.",
    "Consider a tankless water heater - they take up less space and never run out.",
    "Plan your electrical runs before insulating - it's much harder after!",
    "Use 2x4 walls for a road-legal width, but 2x6 allows more insulation.",
    "Weigh your trailer empty and full - knowing your weight is critical for safety.",
    "A 30-gallon fresh water tank is good for 3-5 days of conservative use.",
    "Consider a mini-split heat pump for both heating and cooling in one unit.",
    "Use reflective insulation (Reflectix) behind outlets on exterior walls.",
    "Build your subfloor with pressure-treated lumber for longevity.",
    "Plan for at least 4 cubic feet of closet space per person.",
    "Install USB outlets where you'll charge devices - saves using adapters.",
    "Consider a European-style washer/dryer combo to save space.",
    "Use 12V DC appliances where possible to reduce inverter load off-grid."
];

function setupTipOfDay() {
    const tipText = document.getElementById('tipText');
    const newTipBtn = document.getElementById('newTipBtn');
    
    const showRandomTip = () => {
        if (tipText) {
            const tip = buildTips[Math.floor(Math.random() * buildTips.length)];
            tipText.textContent = tip;
        }
    };
    
    showRandomTip();
    
    if (newTipBtn) {
        newTipBtn.onclick = () => {
            newTipBtn.querySelector('i').style.transform = 'rotate(360deg)';
            setTimeout(() => {
                newTipBtn.querySelector('i').style.transform = '';
            }, 300);
            showRandomTip();
        };
    }
}

// --- Dark Mode ---
function setupDarkMode() {
    const savedTheme = localStorage.getItem('thn_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('thn_theme', next);
            updateThemeIcon();
        };
        updateThemeIcon();
    }
}

function updateThemeIcon() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        toggleBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        toggleBtn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
}

// --- Keyboard Shortcuts ---
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }
        
        // Number keys 1-8 for tab navigation
        const tabs = ['dashboard', 'checklist', 'floorplan', 'budget', 'weight', 'solar', 'insulation', 'water'];
        if (e.key >= '1' && e.key <= '8') {
            e.preventDefault();
            navigateToTab(tabs[parseInt(e.key) - 1]);
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (els.budgetModal) els.budgetModal.style.display = 'none';
        }
        
        // Ctrl+E or Cmd+E to export PDF
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            generatePDF();
        }
        
        // ? to show help
        if (e.key === '?') {
            showKeyboardHelp();
        }
    });
}

function showKeyboardHelp() {
    const helpText = `
⌨️ Keyboard Shortcuts:

1-8: Navigate tabs
Esc: Close modal
Ctrl+E: Export PDF
?: Show this help
    `.trim();
    alert(helpText);
}

// --- Data Export/Import ---
function setupDataExportImport() {
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');
    const importInput = document.getElementById('importDataInput');
    
    if (exportBtn) {
        exportBtn.onclick = exportData;
    }
    
    if (importBtn && importInput) {
        importBtn.onclick = () => importInput.click();
        importInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                importData(file);
            }
        };
    }
}

function exportData() {
    const dataStr = JSON.stringify(profiles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tiny-house-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.data && imported.activeId) {
                if (confirm('This will replace all your current data. Continue?')) {
                    profiles = imported;
                    localStorage.setItem('thn_profiles', JSON.stringify(profiles));
                    activeProfileId = profiles.activeId;
                    state = profiles.data[activeProfileId].data;
                    loadStateToUI();
                    renderProfileSelect();
                    showToast('Data imported successfully!', 'success');
                }
            } else {
                alert('Invalid backup file format.');
            }
        } catch (err) {
            alert('Failed to parse backup file. Make sure it\'s a valid JSON file.');
        }
    };
    reader.readAsText(file);
}

// --- Undo System ---
let undoStack = [];
const MAX_UNDO = 10;

function pushUndo(action, data) {
    undoStack.push({ action, data, timestamp: Date.now() });
    if (undoStack.length > MAX_UNDO) {
        undoStack.shift();
    }
}

function showUndoToast(message, undoCallback) {
    if (!els.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-undo';
    toast.innerHTML = `
        <i class="fas fa-trash"></i>
        <div class="toast-content">
            <p>${message}</p>
        </div>
        <button class="undo-btn">Undo</button>
    `;
    
    const undoBtn = toast.querySelector('.undo-btn');
    undoBtn.onclick = () => {
        undoCallback();
        toast.remove();
    };
    
    els.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOutRight 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Initialize additional features after DOM is ready
const originalInit = init;
init = function() {
    originalInit();
    setupDarkMode();
    setupKeyboardShortcuts();
    setupDataExportImport();
};

// Run - Event listener added at top
// init();