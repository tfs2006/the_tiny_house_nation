// --- Game Configuration ---

const BLUEPRINTS = [
    {
        id: 'basic',
        name: 'The Starter Box',
        desc: 'Simple, affordable, gets the job done.',
        cost: { wood: 20, metal: 0 },
        reward: 100,
        reputation: 1,
        color: '#e67e22',
        roofColor: '#d35400',
        width: 120,
        height: 100,
        reqRep: 0
    },
    {
        id: 'cabin',
        name: 'Rustic Cabin',
        desc: 'Cozy wood finish. Tourists love it.',
        cost: { wood: 100, metal: 10 },
        reward: 350,
        reputation: 5,
        color: '#8d6e63',
        roofColor: '#5d4037',
        width: 160,
        height: 120,
        reqRep: 10
    },
    {
        id: 'container',
        name: 'Container Home',
        desc: 'Modern industrial chic. Durable.',
        cost: { wood: 20, metal: 150 },
        reward: 800,
        reputation: 12,
        color: '#3498db',
        roofColor: '#2980b9',
        width: 200,
        height: 100,
        reqRep: 50
    },
    {
        id: 'aframe',
        name: 'A-Frame Retreat',
        desc: 'Iconic design. High viral potential.',
        cost: { wood: 400, metal: 50 },
        reward: 1500,
        reputation: 25,
        color: '#795548',
        roofColor: '#3e2723',
        width: 180,
        height: 160,
        isAFrame: true,
        reqRep: 150
    },
    {
        id: 'luxury',
        name: 'Luxury Tiny Villa',
        desc: 'All the amenities in 400 sq ft.',
        cost: { wood: 1000, metal: 500 },
        reward: 5000,
        reputation: 60,
        color: '#ecf0f1',
        roofColor: '#2c3e50',
        width: 240,
        height: 140,
        reqRep: 500
    }
];

const UPGRADES = [
    {
        id: 'axe',
        name: 'Sharper Axe',
        desc: '+1 Wood per click',
        cost: { money: 50 },
        effect: (s) => s.woodRate++,
        trigger: (s) => true
    },
    {
        id: 'magnet',
        name: 'Scrap Magnet',
        desc: '+1 Metal per click',
        cost: { money: 100 },
        effect: (s) => s.metalRate++,
        trigger: (s) => s.totalMetalGathered > 10
    },
    {
        id: 'crew',
        name: 'Volunteer Crew',
        desc: 'Auto-gather 1 Wood/sec',
        cost: { money: 250 },
        effect: (s) => s.autoWood += 1,
        trigger: (s) => s.money > 100
    },
    {
        id: 'scavenger',
        name: 'Scrap Scavenger',
        desc: 'Auto-gather 1 Metal/sec',
        cost: { money: 500 },
        effect: (s) => s.autoMetal += 1,
        trigger: (s) => s.totalMetalGathered > 50
    },
    {
        id: 'nailgun',
        name: 'Nail Gun',
        desc: 'Build 2x faster',
        cost: { money: 1000 },
        effect: (s) => s.buildPower *= 2,
        trigger: (s) => s.housesBuilt > 5
    },
    {
        id: 'prefab',
        name: 'Prefab Factory',
        desc: 'Auto-build houses slowly',
        cost: { money: 5000 },
        effect: (s) => s.autoBuild += 1,
        trigger: (s) => s.housesBuilt > 10
    }
];

const STATES = [
    { name: "Oregon", cost: 0, desc: "The birthplace of the movement.", bg: "#81c784" },
    { name: "Texas", cost: 2000, desc: "Bigger land for tiny houses.", bg: "#e6ee9c" },
    { name: "California", cost: 10000, desc: "High demand, high prices.", bg: "#fff59d" },
    { name: "Colorado", cost: 50000, desc: "Mountain views increase value.", bg: "#a5d6a7" },
    { name: "New York", cost: 200000, desc: "Urban infill revolution.", bg: "#b0bec5" }
];

// --- Game State ---

const state = {
    wood: 0,
    metal: 0,
    money: 0,
    reputation: 0,
    population: 0,
    
    woodRate: 1,
    metalRate: 1,
    buildPower: 1,
    
    autoWood: 0,
    autoMetal: 0,
    autoBuild: 0,
    
    currentBlueprintId: 0,
    currentStateId: 0,
    
    isBuilding: false,
    buildProgress: 0,
    
    // Stats for unlocks
    totalMetalGathered: 0,
    housesBuilt: 0,
    
    upgradesBought: []
};

// --- Visual System (Canvas) ---

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 800;
        canvas.height = canvas.parentElement.clientHeight || 600;
    }
}
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor(x, y, color, type) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * -4 - 1;
        this.gravity = 0.2;
        this.life = 1.0;
        this.type = type; // 'wood', 'metal', 'confetti'
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.life -= 0.02;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        if (this.type === 'confetti') {
            ctx.fillRect(this.x, this.y, this.size, this.size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
}

function spawnParticles(x, y, color, count, type) {
    for(let i=0; i<count; i++) {
        particles.push(new Particle(x, y, color, type));
    }
}

function drawScenery() {
    const currentState = STATES[state.currentStateId];
    
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#4fc3f7");
    gradient.addColorStop(1, "#e1f5fe");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = currentState.bg;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Simple Mountains/Hills based on state
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.beginPath();
    if (state.currentStateId === 3) { // Colorado
        ctx.moveTo(0, canvas.height - 100);
        ctx.lineTo(100, canvas.height - 300);
        ctx.lineTo(300, canvas.height - 100);
        ctx.lineTo(500, canvas.height - 400);
        ctx.lineTo(800, canvas.height - 100);
    } else {
        ctx.moveTo(0, canvas.height - 100);
        ctx.quadraticCurveTo(canvas.width/2, canvas.height - 150, canvas.width, canvas.height - 100);
    }
    ctx.fill();
}

function drawHouse() {
    const bp = BLUEPRINTS[state.currentBlueprintId];
    const groundY = canvas.height - 100;
    const centerX = canvas.width / 2;
    
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(centerX, groundY, bp.width/1.8, 10, 0, 0, Math.PI*2);
    ctx.fill();
    
    if (!state.isBuilding && state.buildProgress === 0) {
        // Ghost/Blueprint mode
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - bp.width/2, groundY - bp.height, bp.width, bp.height);
        ctx.setLineDash([]);
        return;
    }
    
    const progress = state.buildProgress / 100;
    const currentHeight = bp.height * progress;
    
    // House Body
    ctx.fillStyle = bp.color;
    ctx.fillRect(centerX - bp.width/2, groundY - currentHeight, bp.width, currentHeight);
    
    // Framing details (visual polish)
    if (progress < 1.0) {
        ctx.strokeStyle = "#ecf0f1";
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - bp.width/2, groundY - currentHeight, bp.width, currentHeight);
    }
    
    // Roof (only appears near end)
    if (progress > 0.8) {
        ctx.fillStyle = bp.roofColor;
        ctx.beginPath();
        if (bp.isAFrame) {
            ctx.moveTo(centerX - bp.width/2 - 20, groundY);
            ctx.lineTo(centerX, groundY - bp.height - 40);
            ctx.lineTo(centerX + bp.width/2 + 20, groundY);
        } else {
            ctx.moveTo(centerX - bp.width/2 - 10, groundY - bp.height);
            ctx.lineTo(centerX + bp.width/2 + 10, groundY - bp.height);
            ctx.lineTo(centerX, groundY - bp.height - 40);
        }
        ctx.fill();
    }
    
    // Windows/Door (only at very end)
    if (progress >= 0.95) {
        // Door
        ctx.fillStyle = "#34495e";
        ctx.fillRect(centerX - 15, groundY - 50, 30, 50);
        // Window
        ctx.fillStyle = "#81d4fa";
        ctx.fillRect(centerX - bp.width/3, groundY - 60, 30, 30);
        ctx.fillRect(centerX + bp.width/3 - 30, groundY - 60, 30, 30);
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawScenery();
    drawHouse();
    
    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    
    requestAnimationFrame(render);
}

// --- Game Logic ---

function updateUI() {
    document.getElementById('wood').textContent = Math.floor(state.wood);
    document.getElementById('metal').textContent = Math.floor(state.metal);
    document.getElementById('money').textContent = Math.floor(state.money);
    document.getElementById('reputation').textContent = state.reputation;
    document.getElementById('population').textContent = state.population;
    
    document.getElementById('wood-rate').textContent = `+${state.woodRate}`;
    document.getElementById('metal-rate').textContent = `+${state.metalRate}`;
    
    // Build Button State
    const bp = BLUEPRINTS[state.currentBlueprintId];
    const btn = document.getElementById('buildBtn');
    const costLabel = document.getElementById('build-cost');
    const canAfford = state.wood >= bp.cost.wood && state.metal >= bp.cost.metal;
    
    let costText = `${bp.cost.wood} Wood`;
    if (bp.cost.metal > 0) costText += `, ${bp.cost.metal} Metal`;
    costLabel.textContent = costText;
    
    if (state.isBuilding) {
        btn.classList.remove('disabled');
        btn.querySelector('.label').textContent = "Building...";
        document.getElementById('build-progress').style.width = `${state.buildProgress}%`;
    } else {
        document.getElementById('build-progress').style.width = '0%';
        btn.querySelector('.label').textContent = "Build House";
        if (canAfford) {
            btn.classList.remove('disabled');
        } else {
            btn.classList.add('disabled');
        }
    }
    
    renderCards();
}

function renderCards() {
    // Blueprints
    const bpList = document.getElementById('blueprint-list');
    if (bpList.children.length === 0) {
        BLUEPRINTS.forEach((bp, idx) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.onclick = () => selectBlueprint(idx);
            div.innerHTML = `
                <div class="card-info">
                    <h3>${bp.name}</h3>
                    <p>${bp.desc}</p>
                    <div class="card-stats">Reward: $${bp.reward} | Rep: +${bp.reputation}</div>
                </div>
                <div class="card-cost">
                    <span class="cost-item">${bp.cost.wood} Wood</span>
                    ${bp.cost.metal > 0 ? `<span class="cost-item">${bp.cost.metal} Metal</span>` : ''}
                </div>
            `;
            bpList.appendChild(div);
        });
    }
    
    // Update Blueprint States
    Array.from(bpList.children).forEach((card, idx) => {
        const bp = BLUEPRINTS[idx];
        if (state.reputation < bp.reqRep) {
            card.classList.add('disabled');
            card.querySelector('.card-stats').textContent = `Requires ${bp.reqRep} Reputation`;
        } else {
            card.classList.remove('disabled');
        }
        
        if (state.currentBlueprintId === idx) {
            card.classList.add('active-blueprint');
        } else {
            card.classList.remove('active-blueprint');
        }
    });

    // Upgrades
    const upList = document.getElementById('upgrade-list');
    // Simple redraw for upgrades to handle state changes easily
    upList.innerHTML = '';
    UPGRADES.forEach((u, idx) => {
        if (!u.trigger(state) && !state.upgradesBought.includes(idx)) return;
        
        const div = document.createElement('div');
        div.className = 'card';
        if (state.upgradesBought.includes(idx)) {
            div.classList.add('disabled');
            div.innerHTML = `<div class="card-info"><h3>${u.name}</h3><p>PURCHASED</p></div>`;
        } else {
            div.onclick = () => buyUpgrade(idx);
            if (state.money < u.cost.money) div.classList.add('disabled');
            
            div.innerHTML = `
                <div class="card-info">
                    <h3>${u.name}</h3>
                    <p>${u.desc}</p>
                </div>
                <div class="card-cost">$${u.cost.money}</div>
            `;
        }
        upList.appendChild(div);
    });
    
    // States
    const stList = document.getElementById('state-list');
    stList.innerHTML = '';
    STATES.forEach((s, idx) => {
        const div = document.createElement('div');
        div.className = 'card';
        
        if (state.currentStateId === idx) {
            div.classList.add('active-blueprint'); // Reuse style
            div.innerHTML = `<div class="card-info"><h3>${s.name}</h3><p>Current Location</p></div>`;
        } else if (state.money < s.cost) {
            div.classList.add('disabled');
            div.innerHTML = `
                <div class="card-info"><h3>${s.name}</h3><p>${s.desc}</p></div>
                <div class="card-cost">$${s.cost.toLocaleString()}</div>
            `;
        } else {
            div.onclick = () => travelToState(idx);
            div.innerHTML = `
                <div class="card-info"><h3>${s.name}</h3><p>${s.desc}</p></div>
                <div class="card-cost">$${s.cost.toLocaleString()}</div>
            `;
        }
        stList.appendChild(div);
    });
}

// --- Actions ---

function showFloatText(text, x, y, color) {
    const container = document.getElementById('floating-text-container');
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function gatherWood(e) {
    state.wood += state.woodRate;
    spawnParticles(e.clientX, e.clientY, '#d35400', 5, 'wood');
    showFloatText(`+${state.woodRate}`, e.clientX, e.clientY - 50, '#d35400');
    updateUI();
}

function gatherMetal(e) {
    state.metal += state.metalRate;
    state.totalMetalGathered += state.metalRate;
    spawnParticles(e.clientX, e.clientY, '#7f8c8d', 5, 'metal');
    showFloatText(`+${state.metalRate}`, e.clientX, e.clientY - 50, '#7f8c8d');
    updateUI();
}

function startBuilding() {
    const bp = BLUEPRINTS[state.currentBlueprintId];
    if (state.isBuilding) {
        // Click to speed up
        state.buildProgress += state.buildPower;
        spawnParticles(canvas.width/2, canvas.height/2, '#f1c40f', 2, 'spark');
    } else {
        // Start construction
        if (state.wood >= bp.cost.wood && state.metal >= bp.cost.metal) {
            state.wood -= bp.cost.wood;
            state.metal -= bp.cost.metal;
            state.isBuilding = true;
            state.buildProgress = 0;
        }
    }
    
    if (state.buildProgress >= 100) {
        finishHouse();
    }
    updateUI();
}

function finishHouse() {
    const bp = BLUEPRINTS[state.currentBlueprintId];
    state.isBuilding = false;
    state.buildProgress = 0;
    state.housesBuilt++;
    state.population++;
    state.money += bp.reward;
    state.reputation += bp.reputation;
    
    spawnParticles(canvas.width/2, canvas.height/2, ['#e74c3c', '#3498db', '#f1c40f'][Math.floor(Math.random()*3)], 50, 'confetti');
    document.getElementById('message-log').textContent = `Built ${bp.name}! Earned $${bp.reward}`;
    
    updateUI();
}

function selectBlueprint(idx) {
    if (state.reputation >= BLUEPRINTS[idx].reqRep) {
        state.currentBlueprintId = idx;
        updateUI();
    }
}

function buyUpgrade(idx) {
    const u = UPGRADES[idx];
    if (state.money >= u.cost.money) {
        state.money -= u.cost.money;
        state.upgradesBought.push(idx);
        u.effect(state);
        updateUI();
    }
}

function travelToState(idx) {
    const s = STATES[idx];
    if (state.money >= s.cost) {
        state.money -= s.cost;
        state.currentStateId = idx;
        updateUI();
    }
}

// --- Event Listeners ---

document.getElementById('gatherWoodBtn').addEventListener('mousedown', gatherWood);
document.getElementById('gatherMetalBtn').addEventListener('mousedown', gatherMetal);
document.getElementById('buildBtn').addEventListener('mousedown', startBuilding);

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
    });
});

// --- Game Loop ---

setInterval(() => {
    // Auto gather logic
    if (state.autoWood > 0) {
        state.wood += state.autoWood;
        updateUI();
    }
    if (state.autoMetal > 0) {
        state.metal += state.autoMetal;
        updateUI();
    }
    if (state.autoBuild > 0 && state.isBuilding) {
        state.buildProgress += state.autoBuild;
        if (state.buildProgress >= 100) finishHouse();
        updateUI();
    }
}, 1000);

// Start
window.addEventListener('load', () => {
    console.log("Game Starting...");
    resizeCanvas();
    render();
    updateUI();
});