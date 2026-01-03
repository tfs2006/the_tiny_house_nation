// Game State
const state = {
    population: 0,
    money: 0,
    houseProgress: 0,
    clickPower: 1,
    autoClicker: 0,
    housesBuilt: 0,
    currentHouseType: 0,
    unlockedStates: [],
    multiplier: 1
};

// Configuration
const HOUSE_TYPES = [
    { name: "The Minimalist", color: "#3498db", clicksReq: 10, reward: 100 },
    { name: "The Rustic Cabin", color: "#8d6e63", clicksReq: 20, reward: 250 },
    { name: "The Modern Loft", color: "#2c3e50", clicksReq: 40, reward: 600 },
    { name: "The Eco Pod", color: "#2ecc71", clicksReq: 80, reward: 1500 },
    { name: "The Luxury Bus", color: "#f1c40f", clicksReq: 150, reward: 4000 }
];

const UPGRADES = [
    {
        id: 'hammer',
        name: 'Better Hammer',
        desc: 'Build faster! +1 Click Power',
        baseCost: 50,
        costMult: 1.5,
        count: 0,
        effect: () => { state.clickPower += 1; }
    },
    {
        id: 'volunteer',
        name: 'Volunteer Crew',
        desc: 'Friends helping out. +1 Auto Build/sec',
        baseCost: 150,
        costMult: 1.4,
        count: 0,
        effect: () => { state.autoClicker += 1; }
    },
    {
        id: 'powertools',
        name: 'Power Tools',
        desc: 'Zip zip! +5 Click Power',
        baseCost: 500,
        costMult: 1.6,
        count: 0,
        effect: () => { state.clickPower += 5; }
    },
    {
        id: 'prefab',
        name: 'Prefab Walls',
        desc: 'Factory made. +10 Auto Build/sec',
        baseCost: 2000,
        costMult: 1.5,
        count: 0,
        effect: () => { state.autoClicker += 10; }
    },
    {
        id: 'solar',
        name: 'Solar Sponsorship',
        desc: 'Get paid for energy. +20% Money per house',
        baseCost: 5000,
        costMult: 2.0,
        count: 0,
        effect: () => { state.multiplier += 0.2; }
    }
];

const STATES = [
    { name: "Oregon", cost: 1000, desc: "Tiny House Friendly! Unlocks 'Rustic Cabin'", unlockType: 1 },
    { name: "Texas", cost: 5000, desc: "Everything is bigger! Unlocks 'Modern Loft'", unlockType: 2 },
    { name: "California", cost: 15000, desc: "ADU Revolution! Unlocks 'Eco Pod'", unlockType: 3 },
    { name: "Colorado", cost: 50000, desc: "Mountain Living! Unlocks 'Luxury Bus'", unlockType: 4 },
    { name: "The Nation", cost: 1000000, desc: "You've started a movement!", unlockType: 4 }
];

// DOM Elements
const els = {
    pop: document.getElementById('population'),
    money: document.getElementById('money'),
    statesCount: document.getElementById('states-count'),
    canvas: document.getElementById('houseCanvas'),
    buildBtn: document.getElementById('buildBtn'),
    progressBar: document.getElementById('progress-bar'),
    msg: document.getElementById('message-log'),
    upgradeList: document.getElementById('upgrade-list'),
    stateList: document.getElementById('state-list'),
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
};

const ctx = els.canvas.getContext('2d');

// Canvas Setup
els.canvas.width = 500;
els.canvas.height = 300;

// Game Loop
let lastTime = 0;
function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // Auto Clicker
    if (state.autoClicker > 0) {
        addProgress((state.autoClicker * dt) / 1000);
    }

    drawHouse();
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Core Mechanics
function addProgress(amount) {
    const currentType = HOUSE_TYPES[state.currentHouseType];
    state.houseProgress += amount;
    
    // Visual feedback on button
    const percentage = Math.min(100, (state.houseProgress / currentType.clicksReq) * 100);
    els.progressBar.style.height = `${percentage}%`;

    if (state.houseProgress >= currentType.clicksReq) {
        completeHouse();
    }
}

function completeHouse() {
    const currentType = HOUSE_TYPES[state.currentHouseType];
    
    // Rewards
    state.population += 1;
    state.housesBuilt += 1;
    const moneyEarned = currentType.reward * state.multiplier;
    state.money += moneyEarned;
    
    // Reset
    state.houseProgress = 0;
    els.progressBar.style.height = '0%';
    
    // Feedback
    logMessage(`Built a ${currentType.name}! Earned $${Math.floor(moneyEarned)}`);
    animateHouseCompletion();
}

function animateHouseCompletion() {
    // Simple "drive away" animation logic could go here
    // For now, we just flash the canvas
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, 0, els.canvas.width, els.canvas.height);
    setTimeout(() => drawHouse(), 100);
}

// Drawing
function drawHouse() {
    ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
    
    const currentType = HOUSE_TYPES[state.currentHouseType];
    const progress = state.houseProgress / currentType.clicksReq;
    
    // Ground
    ctx.fillStyle = "#795548";
    ctx.fillRect(0, 250, 500, 50);
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, 250, 500, 10);

    // House Dimensions
    const houseW = 200;
    const houseH = 150;
    const houseX = (els.canvas.width - houseW) / 2;
    const houseY = 250 - houseH - 20; // 20 for wheels

    // Wheels (Always visible)
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.arc(houseX + 40, 250 - 20, 20, 0, Math.PI * 2);
    ctx.arc(houseX + houseW - 40, 250 - 20, 20, 0, Math.PI * 2);
    ctx.fill();

    // Stages of construction based on progress
    
    // 1. Framing (0-30%)
    if (progress > 0) {
        ctx.strokeStyle = "#d7ccc8";
        ctx.lineWidth = 5;
        ctx.strokeRect(houseX, houseY, houseW, houseH);
        // Studs
        for(let i=20; i<houseW; i+=20) {
            ctx.beginPath();
            ctx.moveTo(houseX + i, houseY);
            ctx.lineTo(houseX + i, houseY + houseH);
            ctx.stroke();
        }
    }

    // 2. Walls/Sheathing (30-60%)
    if (progress > 0.3) {
        ctx.fillStyle = "#efebe9";
        ctx.fillRect(houseX, houseY, houseW, houseH);
    }

    // 3. Siding/Color (60-90%)
    if (progress > 0.6) {
        ctx.fillStyle = currentType.color;
        ctx.fillRect(houseX, houseY, houseW, houseH);
        
        // Door
        ctx.fillStyle = "#5d4037";
        ctx.fillRect(houseX + 20, houseY + 60, 40, 90);
        
        // Window
        ctx.fillStyle = "#b3e5fc";
        ctx.fillRect(houseX + 80, houseY + 30, 60, 60);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(houseX + 80, houseY + 30, 60, 60);
    }

    // 4. Roof (90-100%)
    if (progress > 0.9) {
        ctx.fillStyle = "#3e2723";
        ctx.beginPath();
        ctx.moveTo(houseX - 20, houseY);
        ctx.lineTo(houseX + houseW/2, houseY - 60);
        ctx.lineTo(houseX + houseW + 20, houseY);
        ctx.fill();
    }
}

// UI Updates
function updateUI() {
    els.pop.textContent = state.population.toLocaleString();
    els.money.textContent = '$' + Math.floor(state.money).toLocaleString();
    els.statesCount.textContent = `${state.unlockedStates.length}/${STATES.length}`;
    
    updateUpgradesList();
    updateStatesList();
}

function initUpgrades() {
    els.upgradeList.innerHTML = '';
    UPGRADES.forEach((u, index) => {
        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.id = `upgrade-${index}`;
        div.innerHTML = `
            <div class="item-info">
                <h3>${u.name}</h3>
                <p>${u.desc}</p>
            </div>
            <div class="item-cost">$${Math.floor(u.baseCost)}</div>
        `;
        div.onclick = () => buyUpgrade(index);
        els.upgradeList.appendChild(div);
    });
}

function updateUpgradesList() {
    UPGRADES.forEach((u, index) => {
        const div = document.getElementById(`upgrade-${index}`);
        const cost = Math.floor(u.baseCost * Math.pow(u.costMult, u.count));
        div.querySelector('.item-cost').textContent = `$${cost.toLocaleString()}`;
        
        if (state.money >= cost) {
            div.classList.remove('disabled');
        } else {
            div.classList.add('disabled');
        }
    });
}

function buyUpgrade(index) {
    const u = UPGRADES[index];
    const cost = Math.floor(u.baseCost * Math.pow(u.costMult, u.count));
    
    if (state.money >= cost) {
        state.money -= cost;
        u.count++;
        u.effect();
        logMessage(`Purchased ${u.name}!`);
        
        // Visual pop
        const div = document.getElementById(`upgrade-${index}`);
        div.classList.add('pop-anim');
        setTimeout(() => div.classList.remove('pop-anim'), 200);
    }
}

function initStates() {
    els.stateList.innerHTML = '';
    STATES.forEach((s, index) => {
        const div = document.createElement('div');
        div.className = 'state-item';
        div.id = `state-${index}`;
        div.innerHTML = `
            <div class="item-info">
                <h3>${s.name}</h3>
                <p>${s.desc}</p>
            </div>
            <div class="item-cost">$${s.cost.toLocaleString()}</div>
        `;
        div.onclick = () => buyState(index);
        els.stateList.appendChild(div);
    });
}

function updateStatesList() {
    STATES.forEach((s, index) => {
        const div = document.getElementById(`state-${index}`);
        
        if (state.unlockedStates.includes(index)) {
            div.innerHTML = `<div class="item-info"><h3>${s.name}</h3><p>UNLOCKED</p></div>`;
            div.classList.add('disabled');
            div.style.backgroundColor = '#e8f5e9';
            return;
        }

        if (state.money >= s.cost) {
            div.classList.remove('disabled');
        } else {
            div.classList.add('disabled');
        }
    });
}

function buyState(index) {
    if (state.unlockedStates.includes(index)) return;
    
    const s = STATES[index];
    if (state.money >= s.cost) {
        state.money -= s.cost;
        state.unlockedStates.push(index);
        
        // Unlock new house type if applicable
        if (s.unlockType > state.currentHouseType) {
            state.currentHouseType = s.unlockType;
            logMessage(`Unlocked new house type: ${HOUSE_TYPES[state.currentHouseType].name}!`);
        }
        
        logMessage(`Expanded to ${s.name}!`);
    }
}

function logMessage(text) {
    els.msg.textContent = text;
    els.msg.classList.add('pop-anim');
    setTimeout(() => els.msg.classList.remove('pop-anim'), 200);
}

// Event Listeners
els.buildBtn.addEventListener('mousedown', () => {
    addProgress(state.clickPower);
    els.buildBtn.style.transform = 'scale(0.95)';
});

els.buildBtn.addEventListener('mouseup', () => {
    els.buildBtn.style.transform = 'scale(1)';
});

els.tabs.forEach(btn => {
    btn.addEventListener('click', () => {
        els.tabs.forEach(b => b.classList.remove('active'));
        els.tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// Init
initUpgrades();
initStates();
requestAnimationFrame(gameLoop);